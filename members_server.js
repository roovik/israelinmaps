// Israel NOWlej members: accounts, member profile pages and three access levels per section (public, members, paid).
// Everything is public until the owner closes a section at /admin/access/ (ADMIN_KEY, the same key as the other admin pages).
// Paid access comes from access codes made in admin (Paddle can add codes or paid days later).
// Pages here reuse the shell of /signin/ (built by tools/build_site.py) and fill <div id="mb-app">. Browser code: /members.js.
import { DurableObject } from 'cloudflare:workers';

const DAY = 86400000, NOW = () => Date.now();
export const SECTIONS = [
  ['news', 'News'], ['views', 'Views'], ['media', 'Media'], ['video', 'Video'], ['audio', 'Audio'], ['images', 'Images'], ['music', 'Music'], ['playlists', 'Playlists'],
  ['who', 'Voices'], ['hot', 'HOT topics'], ['sources', 'Sources'], ['glossary', 'NOWlej A to Z'], ['g', 'A to Z entries'], ['index', 'Book index'], ['search', 'Search'],
  ['maps', 'Maps'], ['timelines', 'Timelines'], ['charts', 'Charts'], ['tables', 'Tables'], ['population', 'Population and Territory'], ['demographics', 'Demographics'],
  ['rankings', 'Rankings'], ['top-ten', 'Top Ten Lists'], ['size', 'Size comparisons'], ['tour', 'A Tour of Israel'], ['flora', 'Flora and fauna'],
];
const SEC = new Set(SECTIONS.map(s => s[0]));
const LEVELS = ['public', 'members', 'paid'];
const json = (o, s = 200, h = {}) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...h } });
const clean = (s, n) => String(s == null ? '' : s).replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, n);
const E = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const hex = n => [...crypto.getRandomValues(new Uint8Array(n))].map(b => b.toString(16).padStart(2, '0')).join('');
const ALPH = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const code4 = () => [...crypto.getRandomValues(new Uint8Array(4))].map(b => ALPH[b % ALPH.length]).join('');
async function sha(s) { return [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))].map(b => b.toString(16).padStart(2, '0')).join(''); }
async function pbkdf2(pass, salt) {
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: new TextEncoder().encode(salt), iterations: 100000, hash: 'SHA-256' }, k, 256);
  return [...new Uint8Array(bits)].map(b => b.toString(16).padStart(2, '0')).join('');
}
const stub = env => env.MEMBERS.get(env.MEMBERS.idFromName('main'));
const cookieTok = req => ((req.headers.get('cookie') || '').match(/(?:^|;\s*)in_s=([a-f0-9]{64})/) || [])[1] || '';
function setCookies(tok, maxAge) {
  return [`in_s=${tok}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`, `in_m=${maxAge > 0 ? '1' : ''}; Path=/; Max-Age=${maxAge}; Secure; SameSite=Lax`];
}
function adminOk(request, env) {
  const a = env.ADMIN_KEY || '', b = request.headers.get('x-admin-key') || '';
  if (!a || a.length !== b.length) return false;
  const x = new TextEncoder().encode(a), y = new TextEncoder().encode(b); let d = 0; for (let i = 0; i < x.length; i++) d |= x[i] ^ y[i]; return d === 0;
}

let RULES = null, RULES_AT = 0;
async function rules(env) {
  if (!RULES || NOW() - RULES_AT > 30000) { try { RULES = await (await stub(env).fetch('https://internal/rules')).json(); RULES_AT = NOW(); } catch (e) { RULES = RULES || {}; } }
  return RULES;
}
async function who(request, env) {
  const t = cookieTok(request); if (!t) return null;
  const r = await (await stub(env).fetch('https://internal/session', { method: 'POST', body: JSON.stringify({ t }) })).json();
  return r.ok ? r.m : null;
}

// ---- pages: the /signin/ shell with our own content
const PAGES = {
  signin: ['Sign in', 'Sign in or create a free Israel NOWlej account.', true],
  account: ['Your account', 'Your Israel NOWlej account and profile.', true],
  join: ['Full access', 'Full access to Israel NOWlej.', true],
  members: ['Members', 'Members of Israel NOWlej who share a public profile.', false],
  access: ['Access levels', 'Owner settings.', true],
};
async function shell(env, url, title, desc, inner, noindex, og) {
  const r = await env.ASSETS.fetch(new Request(url.origin + '/signin/'));
  let h = await r.text();
  h = h.replace(/<title>[^<]*<\/title>/, `<title>${E(title)} | Israel NOWlej</title>`)
    .replace(/(<meta name="description" content=")[^"]*"/, `$1${E(desc)}"`)
    .replace(/(<link rel="canonical" href=")[^"]*"/, `$1${E(url.origin + url.pathname)}"`)
    .replace(/(<meta property="og:title" content=")[^"]*"/, `$1${E(title)} | Israel NOWlej"`)
    .replace(/(<meta property="og:description" content=")[^"]*"/, `$1${E(desc)}"`);
  if (og) h = h.replace(/(<meta property="og:image" content=")[^"]*"/, `$1${E(og)}"`);
  if (noindex) h = h.replace('<meta charset="utf-8">', '<meta charset="utf-8"><meta name="robots" content="noindex">');
  h = h.replace(/<div id="mb-app">[\s\S]*?<\/div>|<h1>Sign in<\/h1><p>Accounts are coming soon[^<]*<\/p>/, '<div id="mb-app">' + inner + '</div>')
    .replace('</body>', '<script src="/members.js?v=3" defer></script></body>');
  return new Response(h, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
}
async function profilePage(request, env, url, handle) {
  const r = await (await stub(env).fetch('https://internal/profile', { method: 'POST', body: JSON.stringify({ h: handle, t: cookieTok(request) }) })).json();
  if (!r.ok) return shell(env, url, 'Member not found', 'Member not found.', '<h1>Member not found</h1><p>There is no member at this address, or the profile is private.</p><p><a href="/members/">All members</a></p>', true);
  const m = r.m, since = new Date(m.created).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  const links = (m.links || []).filter(Boolean).map(l => `<li><a href="${E(l)}" rel="nofollow noopener ugc" target="_blank">${E(l.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''))}</a></li>`).join('');
  const av = m.avatar ? `<img class="mb-av" src="/member/${E(m.handle)}/photo?v=${m.avatar}" alt="" width="160" height="160">` : `<span class="mb-av mb-ini">${E((m.name || '?').split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase())}</span>`;
  const inner = `<div class="mb-prof">${av}<div><p class="mb-kick">Member${m.paid ? ' &middot; Supporter' : ''}</p><h1>${E(m.name)}</h1>`
    + `<p class="mb-meta">${m.country ? E(m.country) + ' &middot; ' : ''}Member since ${since}</p>${m.bio ? `<p class="mb-bio">${E(m.bio).replace(/\n/g, '<br>')}</p>` : ''}${links ? `<ul class="mb-links">${links}</ul>` : ''}`
    + (r.own ? `<p class="mb-own">${m.public ? 'Your profile is public.' : 'Your profile is private. Only you can see it.'} <a href="/account/">Edit your profile</a></p>` : '') + `</div></div><p class="mb-small"><a href="/members/">All members</a></p>`;
  return shell(env, url, m.name, (m.bio || `${m.name} on Israel NOWlej.`).slice(0, 160), inner, !m.public, m.avatar ? `${url.origin}/member/${m.handle}/photo` : null);
}

// returns a Response for member routes and closed sections, or null to let the site carry on
export async function membersRoute(request, env, url) {
  const p = url.pathname;
  if (!env.MEMBERS) return null;
  if (p.startsWith('/api/m/')) {
    if (request.method === 'POST') {
      const o = request.headers.get('origin'); if (o && new URL(o).host !== url.host) return json({ ok: false, error: 'origin' }, 403);
      if (!(request.headers.get('content-type') || '').includes('application/json')) return json({ ok: false, error: 'json-only' }, 415);
    }
    const isAdmin = p.startsWith('/api/m/admin/');
    if (isAdmin && !env.ADMIN_KEY) return json({ ok: false, error: 'Admin is not set up yet. It needs the ADMIN_KEY secret.' }, 501);
    if (isAdmin && !adminOk(request, env)) return json({ ok: false, error: 'Wrong admin key.' }, 401);
    const body = request.method === 'POST' ? await request.text() : '';
    let b = {}; try { b = body ? JSON.parse(body) : {}; } catch (e) {}
    b.t = cookieTok(request); b.ip = request.headers.get('cf-connecting-ip') || ''; b.cc = (request.cf && request.cf.country) || '';
    const r = await stub(env).fetch('https://internal' + p.replace('/api/m', ''), { method: 'POST', body: JSON.stringify(b) });
    const j = await r.json();
    if (isAdmin && p === '/api/m/admin/rule') RULES = null;
    const h = {};
    if (j.setTok !== undefined) { const c = setCookies(j.setTok, j.setTok ? 60 * 86400 : 0); delete j.setTok; const res = json(j, r.status); c.forEach(x => res.headers.append('set-cookie', x)); return res; }
    return json(j, r.status, h);
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') return null;
  const pm = p.match(/^\/member\/([a-z0-9-]{2,40})\/(photo)?$/);
  if (pm && pm[2]) return stub(env).fetch('https://internal/photo', { method: 'POST', body: JSON.stringify({ h: pm[1], t: cookieTok(request) }) });
  if (pm) return profilePage(request, env, url, pm[1]);
  const pg = p === '/signin/' ? 'signin' : p === '/account/' ? 'account' : p === '/join/' ? 'join' : p === '/members/' ? 'members' : p === '/admin/access/' ? 'access' : null;
  if (pg) { const [t, d, ni] = PAGES[pg]; return shell(env, url, t, d, `<div data-page="${pg}"><p>Loading…</p></div>`, ni); }
  for (const x of ['/signin', '/account', '/join', '/members']) if (p === x) return Response.redirect(url.origin + x + '/' + url.search, 301);
  // closed sections
  const seg = (p.split('/')[1] || '');
  if (!SEC.has(seg)) return null;
  const R = await rules(env), lv = R[seg] || 'public';
  if (lv === 'public') return null;
  const m = await who(request, env);
  if (m && (m.admin || lv === 'members' || (lv === 'paid' && m.paid))) return null;
  const next = encodeURIComponent(p + url.search);
  return Response.redirect(url.origin + (m ? '/join/?next=' + next : '/signin/?need=' + lv + '&next=' + next), 302);
}

export class MembersDB extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env); this.sql = ctx.storage.sql;
    this.sql.exec(`CREATE TABLE IF NOT EXISTS members (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE, name TEXT, handle TEXT UNIQUE, pass TEXT, salt TEXT, created INTEGER,
      bio TEXT DEFAULT '', country TEXT DEFAULT '', links TEXT DEFAULT '[]', public INTEGER DEFAULT 0, paid_until INTEGER DEFAULT 0, avatar INTEGER DEFAULT 0, photo TEXT, hidden INTEGER DEFAULT 0, seen INTEGER DEFAULT 0, cc TEXT DEFAULT '')`);
    this.sql.exec('CREATE TABLE IF NOT EXISTS sessions (h TEXT PRIMARY KEY, mid INTEGER, exp INTEGER)');
    this.sql.exec('CREATE TABLE IF NOT EXISTS rules (section TEXT PRIMARY KEY, level TEXT)');
    this.sql.exec('CREATE TABLE IF NOT EXISTS codes (code TEXT PRIMARY KEY, days INTEGER, uses_max INTEGER, uses INTEGER DEFAULT 0, expires INTEGER DEFAULT 0, note TEXT, created INTEGER)');
    this.sql.exec('CREATE TABLE IF NOT EXISTS redemptions (code TEXT, mid INTEGER, at INTEGER)');
    this.sql.exec('CREATE TABLE IF NOT EXISTS hits (k TEXT, at INTEGER)');
  }
  one(q, ...a) { return [...this.sql.exec(q, ...a)][0] || null; }
  all(q, ...a) { return [...this.sql.exec(q, ...a)]; }
  limited(k, max, mins) {
    this.sql.exec('DELETE FROM hits WHERE at < ?', NOW() - 3600000);
    if (this.one('SELECT COUNT(*) AS n FROM hits WHERE k = ? AND at > ?', k, NOW() - mins * 60000).n >= max) return true;
    this.sql.exec('INSERT INTO hits (k, at) VALUES (?, ?)', k, NOW()); return false;
  }
  async me(t) {
    if (!t) return null; const s = this.one('SELECT * FROM sessions WHERE h = ?', await sha(t));
    if (!s || s.exp < NOW()) return null;
    const m = this.one('SELECT * FROM members WHERE id = ?', s.mid); if (!m) return null;
    if (NOW() - (m.seen || 0) > 3600000) this.sql.exec('UPDATE members SET seen = ? WHERE id = ?', NOW(), m.id);
    return m;
  }
  pub(m) { return { name: m.name, email: m.email, handle: m.handle, bio: m.bio, country: m.country, links: JSON.parse(m.links || '[]'), public: !!m.public, paid_until: m.paid_until, avatar: m.avatar, created: m.created }; }
  async newSession(mid) { const t = hex(32); this.sql.exec('INSERT INTO sessions (h, mid, exp) VALUES (?, ?, ?)', await sha(t), mid, NOW() + 60 * DAY); this.sql.exec('DELETE FROM sessions WHERE exp < ?', NOW()); return t; }
  handleFor(name) {
    let base = clean(name, 40).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30) || 'member';
    if (base.length < 2) base = 'member-' + base; let h = base, i = 1;
    while (this.one('SELECT id FROM members WHERE handle = ?', h) || ['admin', 'new', 'edit'].includes(h)) h = base + '-' + (++i);
    return h;
  }
  async fetch(req) {
    const url = new URL(req.url), p = url.pathname; let b = {}; if (req.method === 'POST') { try { b = await req.json(); } catch (e) {} }
    const err = (e, s = 400) => json({ ok: false, error: e }, s);
    if (p === '/rules') { const R = {}; this.all('SELECT * FROM rules').forEach(r => { R[r.section] = r.level; }); return json(R); }
    if (p === '/session') { const m = await this.me(b.t); return json(m ? { ok: true, m: { id: m.id, paid: m.paid_until > NOW(), admin: false } } : { ok: false }); }
    if (p === '/photo') {
      const m = this.one('SELECT id, photo, public FROM members WHERE handle = ? AND hidden = 0', clean(b.h, 40)), me = await this.me(b.t);
      if (!m || !m.photo || !(m.public || (me && me.id === m.id))) return new Response('not found', { status: 404 });
      const [, mime, data] = m.photo.match(/^data:(image\/(?:jpeg|webp|png));base64,(.+)$/) || [];
      if (!data) return new Response('not found', { status: 404 });
      return new Response(Uint8Array.from(atob(data), c => c.charCodeAt(0)), { headers: { 'content-type': mime, 'cache-control': 'public, max-age=86400' } });
    }
    if (p === '/profile') {
      const m = this.one('SELECT * FROM members WHERE handle = ? AND hidden = 0', clean(b.h, 40)); if (!m) return err('not-found', 404);
      const me = await this.me(b.t), own = !!(me && me.id === m.id);
      if (!m.public && !own) return err('private', 404);
      return json({ ok: true, own, m: { name: m.name, handle: m.handle, bio: m.bio, country: m.country, links: JSON.parse(m.links || '[]'), public: !!m.public, paid: m.paid_until > NOW(), avatar: m.avatar, created: m.created } });
    }
    if (p === '/rules-public') return json({ ok: true, sections: SECTIONS, rules: Object.fromEntries(this.all('SELECT * FROM rules').map(r => [r.section, r.level])) });
    if (p === '/directory') return json({ ok: true, members: this.all('SELECT name, handle, country, avatar, bio, created FROM members WHERE public = 1 AND hidden = 0 ORDER BY created DESC LIMIT 500').map(m => ({ ...m, bio: (m.bio || '').slice(0, 140) })) });
    if (p === '/signup') {
      if (this.limited('su:' + b.ip, 8, 60)) return err('Too many tries. Wait a little and try again.', 429);
      const email = clean(b.email, 254).toLowerCase(), name = clean(b.name, 80), pass = String(b.password || '');
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return err('Enter a valid email.');
      if (name.length < 2) return err('Enter your name.');
      if (pass.length < 8) return err('Use a password of at least 8 characters.');
      if (this.one('SELECT id FROM members WHERE email = ?', email)) return err('There is already an account with this email. Sign in instead.', 409);
      const salt = hex(16), h = this.handleFor(name);
      this.sql.exec('INSERT INTO members (email, name, handle, pass, salt, created, cc) VALUES (?, ?, ?, ?, ?, ?, ?)', email, name, h, await pbkdf2(pass, salt), salt, NOW(), clean(b.cc, 4));
      const m = this.one('SELECT * FROM members WHERE email = ?', email);
      return json({ ok: true, member: this.pub(m), setTok: await this.newSession(m.id) });
    }
    if (p === '/login') {
      if (this.limited('li:' + b.ip, 12, 15)) return err('Too many tries. Wait a few minutes.', 429);
      const m = this.one('SELECT * FROM members WHERE email = ?', clean(b.email, 254).toLowerCase());
      if (!m || (await pbkdf2(String(b.password || ''), m.salt)) !== m.pass) return err('Email or password is not right.', 401);
      return json({ ok: true, member: this.pub(m), setTok: await this.newSession(m.id) });
    }
    if (p === '/logout') { if (b.t) this.sql.exec('DELETE FROM sessions WHERE h = ?', await sha(b.t)); return json({ ok: true, setTok: '' }); }
    if (p === '/me') {
      const m = await this.me(b.t);
      return json({ ok: true, member: m ? this.pub(m) : null, sections: SECTIONS, rules: Object.fromEntries(this.all('SELECT * FROM rules').map(r => [r.section, r.level])) });
    }
    // ---- signed in
    if (p.startsWith('/admin/')) return this.admin(p, b);
    const m = await this.me(b.t); if (!m) return err('Sign in first.', 401);
    if (p === '/profile-save') {
      const links = (Array.isArray(b.links) ? b.links : []).map(x => clean(x, 200)).filter(x => /^https?:\/\/[^\s]+\.[^\s]+/.test(x)).slice(0, 5);
      const name = clean(b.name, 80); if (name.length < 2) return err('Enter your name.');
      let h = clean(b.handle, 40).toLowerCase();
      if (h && h !== m.handle) {
        if (!/^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/.test(h)) return err('Profile address: 3 to 40 letters, numbers or hyphens.');
        if (this.one('SELECT id FROM members WHERE handle = ? AND id != ?', h, m.id) || ['admin', 'new', 'edit'].includes(h)) return err('That profile address is taken.', 409);
      } else h = m.handle;
      this.sql.exec('UPDATE members SET name = ?, handle = ?, bio = ?, country = ?, links = ?, public = ? WHERE id = ?', name, h, String(b.bio || '').replace(/\r/g, '').replace(/[\u0000-\u0009\u000b-\u001f<>]/g, '').trim().slice(0, 600).replace(/\n{3,}/g, '\n\n'), clean(b.country, 60), JSON.stringify(links), b.public ? 1 : 0, m.id);
      return json({ ok: true, member: this.pub(this.one('SELECT * FROM members WHERE id = ?', m.id)) });
    }
    if (p === '/photo-save') {
      const d = String(b.photo || '');
      if (d === '') { this.sql.exec('UPDATE members SET photo = NULL, avatar = 0 WHERE id = ?', m.id); return json({ ok: true }); }
      if (!/^data:image\/(jpeg|webp|png);base64,[A-Za-z0-9+/=]+$/.test(d) || d.length > 300000) return err('Use a smaller picture (the page shrinks it for you; try another file).');
      this.sql.exec('UPDATE members SET photo = ?, avatar = ? WHERE id = ?', d, NOW() % 1000000, m.id); return json({ ok: true });
    }
    if (p === '/password') {
      if ((await pbkdf2(String(b.old || ''), m.salt)) !== m.pass) return err('Your current password is not right.', 401);
      if (String(b.new || '').length < 8) return err('Use a password of at least 8 characters.');
      const salt = hex(16); this.sql.exec('UPDATE members SET pass = ?, salt = ? WHERE id = ?', await pbkdf2(String(b.new), salt), salt, m.id);
      this.sql.exec('DELETE FROM sessions WHERE mid = ?', m.id); return json({ ok: true, setTok: await this.newSession(m.id) });
    }
    if (p === '/redeem') {
      if (this.limited('rd:' + m.id, 10, 60)) return err('Too many tries. Wait a little.', 429);
      const c = this.one('SELECT * FROM codes WHERE code = ?', clean(b.code, 30).toUpperCase());
      if (!c) return err('That code is not right.', 404);
      if (c.expires && c.expires < NOW()) return err('That code has ended.', 410);
      if (c.uses >= c.uses_max) return err('That code has been used up.', 410);
      if (this.one('SELECT 1 AS x FROM redemptions WHERE code = ? AND mid = ?', c.code, m.id)) return err('You already used this code.', 409);
      const until = Math.max(NOW(), m.paid_until || 0) + c.days * DAY;
      this.sql.exec('UPDATE members SET paid_until = ? WHERE id = ?', until, m.id); this.sql.exec('UPDATE codes SET uses = uses + 1 WHERE code = ?', c.code);
      this.sql.exec('INSERT INTO redemptions (code, mid, at) VALUES (?, ?, ?)', c.code, m.id, NOW());
      return json({ ok: true, until });
    }
    if (p === '/delete-account') {
      if ((await pbkdf2(String(b.password || ''), m.salt)) !== m.pass) return err('Your password is not right.', 401);
      this.sql.exec('DELETE FROM sessions WHERE mid = ?', m.id); this.sql.exec('DELETE FROM members WHERE id = ?', m.id); return json({ ok: true, setTok: '' });
    }
    return err('not-found', 404);
  }
  admin(p, b) {
    if (p === '/admin/state') return json({ ok: true, sections: SECTIONS, rules: Object.fromEntries(this.all('SELECT * FROM rules').map(r => [r.section, r.level])),
      members: this.all('SELECT id, name, email, handle, created, public, paid_until, hidden, seen, cc FROM members ORDER BY created DESC LIMIT 1000'),
      counts: { members: this.one('SELECT COUNT(*) AS n FROM members').n, paid: this.one('SELECT COUNT(*) AS n FROM members WHERE paid_until > ?', NOW()).n, public: this.one('SELECT COUNT(*) AS n FROM members WHERE public = 1').n },
      codes: this.all('SELECT * FROM codes ORDER BY created DESC LIMIT 300') });
    if (p === '/admin/rule') {
      const s = clean(b.section, 30), l = clean(b.level, 10); if (!SEC.has(s) || !LEVELS.includes(l)) return json({ ok: false, error: 'bad' }, 400);
      if (l === 'public') this.sql.exec('DELETE FROM rules WHERE section = ?', s); else this.sql.exec('INSERT OR REPLACE INTO rules (section, level) VALUES (?, ?)', s, l);
      return json({ ok: true });
    }
    if (p === '/admin/code') {
      const days = Math.max(1, Math.min(3650, +b.days || 365)), uses = Math.max(1, Math.min(100000, +b.uses || 1)), n = Math.max(1, Math.min(100, +b.count || 1));
      const expires = b.expires ? Date.parse(b.expires) || 0 : 0, custom = clean(b.custom, 24).toUpperCase().replace(/[^A-Z0-9-]/g, ''), out = [];
      if (custom && this.one('SELECT code FROM codes WHERE code = ?', custom)) return json({ ok: false, error: 'That code already exists.' }, 409);
      for (let i = 0; i < (custom ? 1 : n); i++) {
        let c = custom; if (!c) do { c = 'INW-' + code4() + '-' + code4(); } while (this.one('SELECT code FROM codes WHERE code = ?', c));
        this.sql.exec('INSERT INTO codes (code, days, uses_max, uses, expires, note, created) VALUES (?, ?, ?, 0, ?, ?, ?)', c, days, uses, expires, clean(b.note, 200), NOW()); out.push(c);
      }
      return json({ ok: true, codes: out });
    }
    if (p === '/admin/paid') {
      const m = this.one('SELECT * FROM members WHERE email = ?', clean(b.email, 254).toLowerCase()); if (!m) return json({ ok: false, error: 'No member with that email.' }, 404);
      const days = Math.max(-3650, Math.min(3650, +b.days || 0));
      this.sql.exec('UPDATE members SET paid_until = ? WHERE id = ?', days > 0 ? Math.max(NOW(), m.paid_until || 0) + days * DAY : 0, m.id); return json({ ok: true });
    }
    if (p === '/admin/hide') { this.sql.exec('UPDATE members SET hidden = ? WHERE id = ?', b.hidden ? 1 : 0, +b.id); return json({ ok: true }); }
    return json({ ok: false, error: 'not-found' }, 404);
  }
}
