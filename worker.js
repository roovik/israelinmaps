// Israel Mosaic news worker. Serves /api/news from public RSS and Atom feeds.
// Static pages are served by the assets binding. Only /api/* runs this code first.
import VCFG from './video.json';
import VOICES from './voices.json';
const JP = 'https://www.jpost.com/rss/';
const SOURCES = [
  { id: 'toi', name: 'The Times of Israel', site: 'https://www.timesofisrael.com/', url: 'https://www.timesofisrael.com/feed/' },
  { id: 'jpost', name: 'The Jerusalem Post', site: 'https://www.jpost.com/', url: JP + 'rssfeedsfrontpage.aspx', base: JP, channels: [
    ['News', [['Homepage', 'rssfeedsfrontpage.aspx'], ['Breaking News', 'rssfeedsheadlines.aspx'], ['All News', 'rssallnews'], ['Israel News', 'rssfeedsisraelnews.aspx'], ['Jerusalem', 'rssfeedsjerusalem.aspx'], ['Trending', 'rssfeedsnotjustnews.aspx']]],
    ['Security', [['Israel-Hamas War', 'israel-hamas-war'], ['Gaza', 'rssfeedsgaza.aspx'], ['Terrorism', 'rssfeedsislamicterrorism'], ['Defense and Tech', 'rssfeeddefense-and-tech'], ['Iran', 'rssfeedsiran'], ['Arab-Israeli Conflict', 'rssfeedsarabisraeliconflict.aspx']]],
    ['Politics and Diplomacy', [['Israel Politics', 'rssfeedspoliticsdiplomacy.aspx'], ['Israel Election 2026', 'rssfeedisraelelection2026'], ['Benjamin Netanyahu', 'rssfeedsbenjaminnetanyahu'], ['Middle East', 'rssfeedsmiddleeastnews.aspx'], ['World News', 'rssfeedsinternational'], ['US Politics', 'rssfeedsamerican-politics'], ['Ukraine-Russia War', 'rssukrainerussiawar']]],
    ['Business and Technology', [['Business and Innovation', 'rssbusinessandinnovation'], ['Tech and Start-Ups', 'rsstechandstartups'], ['Banking and Finance', 'rssbankingandfinance'], ['Energy and Infrastructure', 'rssenergyandinfrastructure'], ['Real Estate', 'rssrealestate'], ['Inside Israeli Innovation', 'rssinsideisraeliinnovation']]],
    ['Culture', [['Culture News', 'rssfeedsculture.aspx'], ['Music', 'rssmusic'], ['Visual Arts', 'rssvisualarts'], ['Literature and Poetry', 'rssliteratureandpoetry'], ['Theatre', 'rsstheatre'], ['Dance', 'rssdance'], ['Culinary', 'rssculinary'], ['Travel', 'rsstravel'], ['Sports', 'rssfeedssports.aspx']]],
    ['Society and Faith', [['Antisemitism', 'rssfeedsantisemitism'], ['Diaspora', 'rssfeedsdiaspora.aspx'], ['Aliyah', 'rssfeedsaliyah.aspx'], ['Judaism', 'rssfeedsjudaism'], ['Jewish Holidays', 'rssfeedsjewishholidays'], ['Torah Portion', 'rssfeedstorahportion'], ['Christian World', 'rssfeedchristianworld.aspx']]],
    ['Science and History', [['Science', 'rssscience'], ['Health and Wellness', 'rsshealth-and-wellness'], ['Environment and Climate', 'rssenvironment'], ['Archaeology', 'rssarchaeology'], ['History', 'rssfeedhistory']]],
    ['Opinion', [['Opinion', 'rssfeedsopinion.aspx'], ['Experts Opinion', 'rssfeedsexperts.aspx']]],
  ] },
  { id: 'ynet', name: 'Ynetnews', site: 'https://www.ynetnews.com/', url: 'https://www.ynetnews.com/Integration/StoryRss3082.xml', channels: [
    ['Ynetnews', [['Breaking News', 'https://www.ynetnews.com/Integration/StoryRss3254.xml'], ['Opinion', 'https://www.ynetnews.com/Integration/StoryRss3084.xml'], ['Culture', 'https://www.ynetnews.com/Integration/StoryRss3086.xml'], ['Jewish Scene', 'https://www.ynetnews.com/Integration/StoryRss3443.xml']]],
  ] },
  { id: 'haaretz', name: 'Haaretz', site: 'https://www.haaretz.com/', url: 'https://www.haaretz.com/srv/haaretz-latest-headlines', base: 'https://www.haaretz.com/srv/', channels: [
    ['News', [['Israel News', 'israel-news-rss'], ['Middle East', 'middle-east-news-rss'], ['World', 'world-news-rss'], ['U.S.', 'u.s.-news-rss'], ['Jewish World', 'jewish-world-rss']]],
    ['Security and Business', [['Security and Aviation', 'security-&-aviation-rss'], ['Business', 'business-rss'], ['Technology', 'technology-news-rss']]],
    ['Culture and Ideas', [['Opinion', 'opinion-rss'], ['Life and Culture', 'life-&-culture-rss'], ['Books', 'books-rss'], ['Food', 'food-rss'], ['Archaeology', 'archaeology-rss'], ['Science and Health', 'science-&-health-rss']]],
  ] },
  { id: 'jns', name: 'JNS', site: 'https://www.jns.org/', url: 'https://www.jns.org/feed/', base: 'https://www.jns.org/', channels: [
    ['JNS', [['Israeli Society', 'israeli-society.rss'], ['Middle East', 'middle-east.rss'], ['Antisemitism', 'antisemitism.rss'], ['Israel News', 'israel-news.rss'], ['U.S. News', 'us-news.rss'], ['World News', 'world-news.rss'], ['Opinion', 'opinion.rss'], ['Jewish World', 'jewish-world.rss']]],
  ] },
  { id: 'israelhayom', name: 'Israel Hayom', site: 'https://www.israelhayom.com/', url: 'https://www.israelhayom.com/feed/', base: 'https://www.israelhayom.com/category/', channels: [
    ['News', [['Israel', 'news/israel/feed/'], ['Israel at War', 'news/israel/israel-at-war/feed/'], ['Middle East', 'news/middle-east/feed/'], ['United States', 'news/world-news/united-states/feed/']]],
    ['Jewish World', [['Jewish World', 'jewish-world/feed/'], ['Antisemitism', 'jewish-world/antisemitism/feed/'], ['Archaeology', 'archaeology/feed/']]],
    ['Life and Ideas', [['Culture', 'culture/feed/'], ['Food', 'lifestyle/food/feed/'], ['Travel', 'lifestyle/travel/feed/'], ['Analysis', 'analysis/feed/'], ['Explainer', 'explainer/feed/']]],
  ] },
];
function chanId(g, n) { return (g + '-' + n).toLowerCase().replace(/[^a-z0-9]+/g, '-'); }
for (const s of SOURCES) if (s.channels) s.groups = s.channels.map(([g, list]) => ({ group: g, list: list.map(([n, p]) => ({ id: chanId(g, n), name: n, url: /^https?:/.test(p) ? p : (s.base || JP) + p })) }));
// Views: opinion feeds, each channel is one of Op-Ed, Editorial or Blog
const VDEF = {
  toi: [['Op-Ed', 'https://www.timesofisrael.com/opinion/feed/'], ['Blog', 'https://blogs.timesofisrael.com/feed/']],
  jpost: [['Op-Ed', JP + 'rssfeedsopinion.aspx'], ['Editorial', JP + 'rssfeedseditorial.aspx']],
  ynet: [['Op-Ed', 'https://www.ynetnews.com/Integration/StoryRss3084.xml']],
  haaretz: [['Op-Ed', 'https://www.haaretz.com/srv/opinion-rss'], ['Editorial', 'https://www.haaretz.com/srv/editorial-rss']],
  jns: [['Op-Ed', 'https://www.jns.org/opinion.rss']],
  israelhayom: [['Op-Ed', 'https://www.israelhayom.com/opinions/feed/'], ['Editorial', 'https://www.israelhayom.com/category/editorial/feed/']],
};
function vid(kind) { return 'v-' + kind.toLowerCase().replace(/[^a-z0-9]+/g, '-'); }
const VSRC = SOURCES.filter(s => VDEF[s.id]).map(s => ({ id: s.id, name: s.name, site: s.site, groups: [{ group: 'Views', list: VDEF[s.id].map(([k, u]) => ({ id: vid(k), name: k, url: u })) }] }));
function findChannel(src, cid) {
  if (!src || !cid) return null;
  if (cid.startsWith('v-')) { const v = VSRC.find(x => x.id === src.id); return v ? v.groups[0].list.find(c => c.id === cid) || null : null; }
  return src.groups ? src.groups.flatMap(g => g.list).find(c => c.id === cid) || null : null;
}
const FEEDS = SOURCES.map(s => ({ id: s.id, name: s.name, site: s.site, url: s.url }));
const PER_FEED = 40, TOTAL = 400, TIMEOUT = 8000, MAX_AGE_DAYS = 7;

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', hellip: '…', ndash: '–', mdash: '—' };
function decode(s) {
  return s.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') { const n = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10); try { return String.fromCodePoint(n); } catch { return ''; } }
    return ENT[e.toLowerCase()] ?? m;
  });
}
function unwrap(s) { return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1'); }
function text(s) {
  let t = decode(unwrap(s || ''));
  for (let i = 0; i < 2; i++) t = decode(t.replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]*>/g, ' '));
  return t.replace(/\s+/g, ' ').trim();
}
function tag(block, name) {
  const m = block.match(new RegExp('<' + name + '(?:\\s[^>]*)?>([\\s\\S]*?)</' + name + '>', 'i'));
  return m ? m[1] : '';
}
function attr(block, name, a) {
  const m = block.match(new RegExp('<' + name + '\\b[^>]*\\s' + a + '="([^"]+)"[^>]*>', 'i'));
  return m ? decode(m[1]) : '';
}
function snippet(s, max = 190) {
  if (s.length <= max) return s;
  const cut = s.slice(0, max).replace(/\s+\S*$/, '');
  return cut + '…';
}
function clean(x, title, minWords = 8) {
  x = x.replace(/The post .{0,200}? appeared first on .*$/i, '').replace(/\[(?:…|&hellip;|\.\.\.)\]/g, '').replace(/\b(?:Continue reading|Read more|Click here)\b.*$/i, '').replace(/\s+/g, ' ').trim();
  if (x.length < 50 || x.split(' ').length < minWords) return '';
  if (/[<>{}]|&#|&[a-z]+;|https?:\/\//i.test(x)) return '';
  const a = x.toLowerCase().slice(0, 40), b = title.toLowerCase().slice(0, 40);
  if (a === b || x.toLowerCase() === title.toLowerCase()) return '';
  if (!/[a-z]{3}/.test(x) || (x.match(/[A-Z]/g) || []).length > x.length * 0.4) return '';
  return x;
}
function blurb(x, title) { const c = clean(x, title); return c ? snippet(c) : ''; }
// up to 100 words, ending on a sentence when one falls in the last 40 words
function words100(x) {
  const w = x.split(' ');
  if (w.length <= 100) return x;
  let cut = w.slice(0, 100).join(' ');
  const m = cut.match(/^([\s\S]*[.!?]["”’)]?)\s+\S+(?:\s+\S+){0,39}$/);
  if (m && m[1].split(' ').length >= 55) return m[1];
  return cut.replace(/[,;:]$/, '') + '…';
}
function hashId(str) {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) { const c = str.charCodeAt(i); h1 = Math.imul(h1 ^ c, 2654435761); h2 = Math.imul(h2 ^ c, 1597334677); }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}
function image(block) {
  const raw = decode(unwrap(block)) + ' ' + unwrap(block);
  let u = attr(block, 'media:thumbnail', 'url') || attr(block, 'itunes:image', 'href') || attr(block, 'media:content', 'url');
  if (!u) { const m = block.match(/<enclosure\b[^>]*>/i); if (m && /image/i.test(m[0])) { const x = m[0].match(/url="([^"]+)"/i); if (x) u = decode(x[1]); } }
  if (!u) { const m = raw.match(/<img\b[^>]*\ssrc=["']([^"']+)["']/i); if (m) u = decode(m[1]); }
  return /^https?:\/\//i.test(u) ? u : '';
}
function parse(xml, feed) {
  const items = [];
  const re = /<(item|entry)\b[\s\S]*?<\/\1>/gi;
  let m;
  while ((m = re.exec(xml)) && items.length < (feed.max || PER_FEED)) {
    const b = m[0];
    const title = text(tag(b, 'title'));
    let link = text(tag(b, 'link'));
    if (!link) link = attr(b, 'link', 'href');
    if (!/^https?:\/\//i.test(link)) { const alt = b.match(/<link\b[^>]*rel="alternate"[^>]*href="([^"]+)"/i); link = alt ? decode(alt[1]) : link; }
    if (!title || !/^https?:\/\//i.test(link)) continue;
    const d = text(tag(b, 'pubDate') || tag(b, 'published') || tag(b, 'updated') || tag(b, 'dc:date'));
    let t = d ? new Date(d) : null;
    // Some feeds stamp Israel local time as UTC, so items appear to be in the future. Shift back by whole hours.
    if (t && !isNaN(t)) { const ahead = t.getTime() - Date.now(); if (ahead > 5 * 60000 && ahead < 6 * 3600000) t = new Date(t.getTime() - Math.ceil((ahead - 5 * 60000) / 3600000) * 3600000); }
    const desc = tag(b, 'description') || tag(b, 'summary') || tag(b, 'content:encoded') || tag(b, 'content');
    const full = text(tag(b, 'content:encoded')), short = text(desc);
    const best = clean(full.length > short.length ? full : short, title, 5) || clean(short, title, 5);
    const am = b.match(/<enclosure\b[^>]*>/i); let au = ''; if (am && (/type="audio/i.test(am[0]) || /\.(mp3|m4a|aac)(\?|")/i.test(am[0]))) { const x = am[0].match(/url="([^"]+)"/i); if (x) au = decode(x[1]); }
    const du = au ? text(tag(b, 'itunes:duration')) : '';
    items.push({ ...(au ? { a: au, du } : {}), s: feed.id, src: feed.name, t: title, u: link, k: hashId(link), d: t && !isNaN(t) && t.getFullYear() >= 2005 ? t.toISOString() : null, x: blurb(short, title), i: image(b), f: best ? words100(best) : '' });
  }
  return items;
}
async function load(feed) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), TIMEOUT);
  try {
    const r = await fetch(feed.url, { signal: ctl.signal, headers: { 'User-Agent': 'IsraelMosaicNews/1.0 (+https://israelnowlej.com/news/)', Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*' }, cf: { cacheTtl: 1800, cacheEverything: true } });
    if (!r.ok) return { feed, ok: false, error: 'HTTP ' + r.status, items: [] };
    const xml = await r.text();
    if (!/<(rss|feed|rdf:RDF)\b/i.test(xml.slice(0, 2000))) return { feed, ok: false, error: 'not an RSS or Atom feed', items: [] };
    let items = parse(xml, feed);
    const cutoff = Date.now() - (feed.maxAge || MAX_AGE_DAYS) * 864e5;
    const fresh = items.filter(i => !i.d || new Date(i.d).getTime() >= cutoff);
    if (items.length && !fresh.length) return { feed, ok: false, error: 'no recent items', items: [] };
    items = fresh;
    // an image repeated across most items is a generic placeholder, not a thumbnail
    const counts = {}; items.forEach(i => { if (i.i) counts[i.i] = (counts[i.i] || 0) + 1; });
    items.forEach(i => { if (i.i && counts[i.i] > 2 && counts[i.i] / items.length > 0.5) i.i = ''; });
    const withImg = items.filter(i => i.i).length;
    return { feed, ok: items.length > 0, error: items.length ? '' : 'no items found', items, img: items.length > 0 && withImg / items.length >= 0.5 };
  } catch (e) {
    return { feed, ok: false, error: String(e && e.name === 'AbortError' ? 'timeout' : e), items: [] };
  } finally { clearTimeout(timer); }
}

const H = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
async function itemPage(request, env, k, sp, cp) {
  const origin = new URL(request.url).origin;
  const tpl = await (await env.ASSETS.fetch(new Request(origin + '/news/item-template/'))).text();
  let src = SOURCES.find(x => x.id === sp);
  let item = null, status = 200, archived = null;
  if (env.ENTRIES && !src) {
    try { const raw = await env.ENTRIES.get('va:' + k); if (raw) { archived = JSON.parse(raw); item = archived; src = { id: archived.s, name: archived.src, site: archived.site || archived.u }; } } catch { }
  }
  if (src && !archived) {
    const ch = cp ? findChannel(src, cp) : null;
    if (!cp || ch) {
      const r = await load({ id: src.id, name: src.name, site: src.site, url: ch ? ch.url : src.url });
      item = r.items.find(i => i.k === k) || null;
      if (new URL(request.url).searchParams.get('debug')) return new Response(JSON.stringify({ asked: k, source: src.id, channel: cp || null, feedUrl: ch ? ch.url : src.url, ok: r.ok, error: r.error, count: r.items.length, keys: r.items.slice(0, 5).map(i => [i.k, i.t.slice(0, 50)]) }, null, 1), { headers: { 'Content-Type': 'application/json' } });
    }
  }
  let title, desc, body;
  if (!item) {
    status = 404; title = 'This story is no longer available'; desc = 'News items stay on Israel NOWlej for seven days.';
    body = '<p class="crumb"><a href="/">Home</a> / <a href="/news/">News</a></p><h1>This story is no longer available</h1><p>News items stay on this site for seven days. <a href="/news/">Back to the latest news</a>.</p>';
  } else {
    let gl = [];
    try {
      const g = await (await env.ASSETS.fetch(new Request(origin + '/glossary.json'))).json();
      const txt = item.t + ' ' + (item.f || item.x), seen = {}, terms = [];
      g.forEach(e => e[2].forEach(t => { if (t.length > 3 && !/^(israel|eli|paul|cana|ariel|zion|saul|jacob)$/i.test(t)) terms.push([t, e[1], e[0]]); }));
      terms.sort((a, b) => b[0].length - a[0].length);
      for (const t of terms) { if (gl.length >= 5) break; if (seen[t[2]]) continue; if (new RegExp('(^|[^A-Za-z])' + t[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![A-Za-z])').test(txt)) { seen[t[2]] = 1; gl.push([t[2], t[1]]); } }
    } catch { }
    const when = item.d ? new Date(item.d).toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jerusalem' }) : '';
    title = item.t; desc = (item.f || item.x || item.t).slice(0, 200);
    const vw = !!(cp && cp.startsWith('v-')) || !!archived;
    body = '<span data-word="' + (vw ? 'views' : 'news') + '" hidden></span><p class="crumb"><a href="/">Home</a> / ' + (archived ? '<a href="/who/">Voices</a> / <a href="/who/' + H(archived.vid) + '/">' + H(archived.src) + '</a>' : '<a href="' + (vw ? '/views/">Views' : '/news/">News') + '</a> / Feed item') + '</p>'
      + '<article class="fitem" data-orig="' + H(item.u) + '"><h1>' + H(item.t) + '</h1>'
      + '<p class="fmeta"><a href="' + H(src.site) + '" rel="noopener">' + H(src.name) + '</a>' + (when ? ' · ' + when : '') + '</p>'
      + (item.i ? '<img class="fimg" src="' + H(item.i) + '" alt="" referrerpolicy="no-referrer" onerror="this.remove()">' : '')
      + (item.f ? '<p class="fx">' + H(item.f) + '</p>' : '<p class="fx">' + H(src.name) + ' shares only the headline of this story.</p>')
      + (gl.length ? '<p class="chips">In the glossary: ' + gl.map(g => '<a href="/g/' + H(g[0]) + '/">' + H(g[1]) + '</a>').join(' ') + '</p>' : '')
      + '<p class="fgo"><a class="fbtn" href="' + H(item.u) + '" rel="noopener nofollow">Read the full story at ' + H(src.name) + '</a></p>'
      + (archived ? '<p class="small">Headline and a short excerpt, kept in the Israel NOWlej archive. Full text and copyright remain with the original publisher.</p></article>' : '<p class="small">This page will disappear after 7 days.</p></article>');
  }
  const html = tpl.split('@@TITLE@@').join(H(title)).split('@@DESC@@').join(H(desc)).split('@@K@@').join(H(k)).split('@@BODY@@').join(body);
  return new Response(html, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': status === 200 ? 'public, max-age=900' : 'no-store', 'X-Robots-Tag': 'noindex' } });
}
// ---------------------------------------------------------------- video: whitelisted channels and playlists
const YT_UA = { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36', 'Accept-Language': 'en-US,en;q=0.9', Cookie: 'CONSENT=YES+1; SOCS=CAI' };
// small last-good store in the edge cache, so one bad fetch does not blank a channel
async function memGet(k) { try { const r = await caches.default.match(new Request('https://cache.local/' + k)); return r ? await r.json() : null; } catch { return null; } }
async function memPut(k, v, ttl) { try { await caches.default.put(new Request('https://cache.local/' + k), new Response(JSON.stringify(v), { headers: { 'Cache-Control': 'max-age=' + ttl } })); } catch {} }
let YTK = '';
async function resolveChannel(c, diag) {
  if (c.id) return c.id;
  const known = await memGet('chid/' + c.handle);
  if (known && known.id) return known.id;
  if (YTK) {
    try {
      const r = await fetch('https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=' + encodeURIComponent('@' + c.handle) + '&key=' + YTK);
      const j = await r.json();
      if (diag) diag.push({ api: 'forHandle', status: r.status, found: !!(j.items && j.items[0]), error: j.error ? j.error.message : '' });
      if (j.items && j.items[0]) { await memPut('chid/' + c.handle, { id: j.items[0].id }, 30 * 86400); return j.items[0].id; }
    } catch (e) { if (diag) diag.push({ api: 'forHandle', error: String(e) }); }
  }
  for (const path of ['', '/about', '/videos']) {
    try {
      const r = await fetch('https://www.youtube.com/@' + encodeURIComponent(c.handle) + path, { headers: YT_UA, redirect: 'follow' });
      const t = r.ok ? await r.text() : '';
      if (diag) diag.push({ path, status: r.status, bytes: t.length, consent: /consent\.youtube\.com|Before you continue/i.test(t) });
      const m = t.match(/"(?:channelId|externalId|browseId)":"(UC[\w-]{22})"/) || t.match(/rel="canonical" href="https:\/\/www\.youtube\.com\/channel\/(UC[\w-]{22})"/) || t.match(/channel\/(UC[\w-]{22})/);
      if (m) { await memPut('chid/' + c.handle, { id: m[1] }, 30 * 86400); return m[1]; }
    } catch (e) { if (diag) diag.push({ path, error: String(e) }); }
  }
  return '';
}
function vparse(xml) {
  const out = [];
  for (const m of xml.matchAll(/<entry>[\s\S]*?<\/entry>/g)) {
    const b = m[0], v = text(tag(b, 'yt:videoId'));
    if (!v) continue;
    out.push({ v, t: text(tag(b, 'title')), d: text(tag(b, 'published')), x: text(tag(b, 'media:description')).slice(0, 220) });
  }
  return out;
}
function vblocked(x) {
  const bw = (VCFG.blockWords || []).map(w => w.toLowerCase());
  return (VCFG.blockVideos || []).includes(x.v) || bw.some(w => (x.t + ' ' + x.x).toLowerCase().includes(w));
}
async function loadVideoSource(c, kind, diag) {
  const key = kind === 'playlist' ? c.id : (c.handle || c.id);
  const d = diag ? [] : null;
  const id = kind === 'playlist' ? c.id : await resolveChannel(c, d);
  const mk = 'vsrc/' + kind + '/' + key;
  const stale = async why => { const o = await memGet(mk); return o ? { ...o, stale: true, error: why } : { key, name: c.name, ok: false, error: why, videos: [], diag: d }; };
  if (!id) return stale('could not resolve channel id');
  const fu = 'https://www.youtube.com/feeds/videos.xml?' + (kind === 'playlist' ? 'playlist_id=' : 'channel_id=') + id;
  try {
    const r = await fetch(fu, { headers: YT_UA });
    if (!r.ok) return stale('feed HTTP ' + r.status);
    const videos = vparse(await r.text()).filter(x => !vblocked(x)).slice(0, 15);
    if (!videos.length) return stale('feed had no videos');
    const out = { key, name: c.name, id, kind, channel: (c.channel || '').toLowerCase(), url: kind === 'playlist' ? 'https://www.youtube.com/playlist?list=' + id : 'https://www.youtube.com/channel/' + id, ok: true, error: '', videos };
    await memPut(mk, out, 7 * 86400);
    return out;
  } catch (e) { return stale(String(e)); }
}
async function entryApi(request, url, env) {
  const hdr = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' };
  const slug = (url.searchParams.get('slug') || '').toLowerCase();
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) return new Response('{"error":"bad slug"}', { status: 400, headers: hdr });
  if (request.method === 'GET') {
    if (!env.ENTRIES) return new Response('{}', { headers: hdr });
    const v = await env.ENTRIES.get('e:' + slug);
    return new Response(v || '{}', { headers: hdr });
  }
  if (request.method !== 'PUT' && request.method !== 'POST') return new Response('{"error":"method"}', { status: 405, headers: hdr });
  if (!env.ENTRIES || !env.ADMIN_KEY) return new Response('{"error":"Saving is not set up yet. It needs the ENTRIES storage and the ADMIN_KEY secret."}', { status: 501, headers: hdr });
  const key = request.headers.get('x-admin-key') || '';
  if (key.length !== env.ADMIN_KEY.length || key !== env.ADMIN_KEY) return new Response('{"error":"Wrong admin key."}', { status: 401, headers: hdr });
  let b; try { b = await request.json(); } catch { return new Response('{"error":"bad json"}', { status: 400, headers: hdr }); }
  const clean = {
    images: (Array.isArray(b.images) ? b.images : []).map(x => String(x).slice(0, 300)).filter(x => /^File:/.test(x)).slice(0, 24),
    videos: (Array.isArray(b.videos) ? b.videos : []).map(x => ({ v: String(x.v || '').slice(0, 20), t: String(x.t || '').slice(0, 200) })).filter(x => /^[A-Za-z0-9_-]{11}$/.test(x.v)).slice(0, 60),
    playlists: (Array.isArray(b.playlists) ? b.playlists : []).map(x => ({ id: String(x.id || '').slice(0, 60), name: String(x.name || '').slice(0, 200), by: String(x.by || '').slice(0, 100) })).filter(x => /^PL[A-Za-z0-9_-]{8,60}$/.test(x.id)).slice(0, 40),
    updated: new Date().toISOString()
  };
  await env.ENTRIES.put('e:' + slug, JSON.stringify(clean));
  return new Response(JSON.stringify({ ok: true, saved: clean }), { headers: hdr });
}
async function ytTitle(url) {
  const hdr = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=86400' };
  const v = url.searchParams.get('v') || '';
  if (!/^[A-Za-z0-9_-]{11}$/.test(v)) return new Response('{"error":"bad id"}', { status: 400, headers: hdr });
  try {
    const r = await fetch('https://www.youtube.com/oembed?format=json&url=' + encodeURIComponent('https://www.youtube.com/watch?v=' + v));
    if (!r.ok) throw 0;
    const d = await r.json();
    return new Response(JSON.stringify({ v, t: d.title || '', by: d.author_name || '' }), { headers: hdr });
  } catch { return new Response('{"error":"not found"}', { status: 404, headers: hdr }); }
}
async function videoApi(url, env) {
  const hdr = { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' };
  if (env.ENTRIES && ![...url.searchParams].length) { const s = await kvSnap(env, 'snap/videos', 75); if (s) return new Response(JSON.stringify(s.j), { headers: { ...hdr, 'Cache-Control': 'public, max-age=300' } }); }
  if (url.searchParams.get('review')) {
    // curation helper: enriched channel or playlist candidates with provenance. Needs YT_KEY.
    if (!env.YT_KEY) return new Response(JSON.stringify({ error: 'Set the YT_KEY secret first.' }), { status: 400, headers: hdr });
    const dec = t => String(t || '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    const yt = async (path) => { const r = await fetch('https://www.googleapis.com/youtube/v3/' + path + '&key=' + env.YT_KEY, { cf: { cacheTtl: 21600, cacheEverything: true } }); return r.json(); };
    const q = (url.searchParams.get('q') || '').slice(0, 120), mode = url.searchParams.get('review');
    const knownCh = new Set((VCFG.channels || []).map(c => c.id).filter(Boolean)), knownPl = new Set((VCFG.playlists || []).map(p => p.id));
    const chInfo = async ids => {
      const out = {}; ids = [...new Set(ids)].slice(0, 50); if (!ids.length) return out;
      const d = await yt('channels?part=snippet,statistics&maxResults=50&id=' + ids.join(','));
      (d.items || []).forEach(i => { out[i.id] = { id: i.id, name: dec(i.snippet.title), handle: i.snippet.customUrl || '', desc: dec(i.snippet.description).slice(0, 320), country: i.snippet.country || '', created: i.snippet.publishedAt, subs: i.statistics.hiddenSubscriberCount ? null : Number(i.statistics.subscriberCount || 0), videos: Number(i.statistics.videoCount || 0), views: Number(i.statistics.viewCount || 0) }; });
      return out;
    };
    try {
      if (mode === 'videos') {
        const d = await yt('search?part=snippet&type=video&maxResults=20&relevanceLanguage=en&safeSearch=moderate&q=' + encodeURIComponent(q));
        const ids = (d.items || []).map(i => i.id.videoId);
        const vd = ids.length ? await yt('videos?part=snippet,statistics,contentDetails&maxResults=50&id=' + ids.join(',')) : { items: [] };
        const chs = await chInfo((vd.items || []).map(i => i.snippet.channelId));
        const list = (vd.items || []).map(i => ({ id: i.id, name: dec(i.snippet.title), desc: dec(i.snippet.description).slice(0, 240), published: i.snippet.publishedAt, views: Number(i.statistics.viewCount || 0), dur: i.contentDetails.duration, channel: chs[i.snippet.channelId] || { id: i.snippet.channelId, name: dec(i.snippet.channelTitle) }, trusted: knownCh.has(i.snippet.channelId) })).sort((a, b) => (b.trusted - a.trusted));
        return new Response(JSON.stringify({ kind: 'videos', q, candidates: list }), { headers: hdr });
      }
      if (mode === 'playlists') {
        const d = await yt('search?part=snippet&type=playlist&maxResults=25&relevanceLanguage=en&q=' + encodeURIComponent(q));
        const ids = (d.items || []).map(i => i.id.playlistId);
        const pd = ids.length ? await yt('playlists?part=snippet,contentDetails&maxResults=50&id=' + ids.join(',')) : { items: [] };
        const chs = await chInfo((pd.items || []).map(i => i.snippet.channelId));
        const list = (pd.items || []).map(i => ({ id: i.id, name: dec(i.snippet.title), desc: dec(i.snippet.description).slice(0, 240), items: i.contentDetails.itemCount, created: i.snippet.publishedAt, channel: chs[i.snippet.channelId] || { id: i.snippet.channelId, name: dec(i.snippet.channelTitle) }, known: knownPl.has(i.id) }));
        return new Response(JSON.stringify({ kind: 'playlists', q, candidates: list }), { headers: hdr });
      }
      const tally = {}, qs = q ? [q] : (VCFG.discover || []).slice(0, 6);
      await Promise.all(qs.map(async qq => {
        const [v, c] = await Promise.all([yt('search?part=snippet&type=video&maxResults=25&relevanceLanguage=en&safeSearch=moderate&q=' + encodeURIComponent(qq)), yt('search?part=snippet&type=channel&maxResults=10&relevanceLanguage=en&q=' + encodeURIComponent(qq))]);
        (v.items || []).forEach(i => { const t = tally[i.snippet.channelId] || (tally[i.snippet.channelId] = { hits: 0, samples: [] }); t.hits++; if (t.samples.length < 3) t.samples.push({ v: i.id.videoId, t: dec(i.snippet.title) }); });
        (c.items || []).forEach(i => { tally[i.snippet.channelId] = tally[i.snippet.channelId] || { hits: 0, samples: [] }; tally[i.snippet.channelId].hits += 2; });
      }));
      const top = Object.entries(tally).sort((a, b) => b[1].hits - a[1].hits).slice(0, 30).map(e => e[0]);
      const chs = await chInfo(top);
      const list = top.filter(id => chs[id]).map(id => ({ ...chs[id], hits: tally[id].hits, samples: tally[id].samples, known: knownCh.has(id) }));
      return new Response(JSON.stringify({ kind: 'channels', q, candidates: list }), { headers: hdr });
    } catch (e) { return new Response(JSON.stringify({ error: String(e) }), { status: 502, headers: hdr }); }
  }
  if (url.searchParams.get('discover')) {
    // suggest new channels for the whitelist; needs an API key set as the YT_KEY secret
    if (!env.YT_KEY) return new Response(JSON.stringify({ error: 'Set the YT_KEY secret to use discovery.' }), { status: 400, headers: hdr });
    const have = new Set((VCFG.channels || []).map(c => (c.handle || '').toLowerCase()));
    const tally = {};
    await Promise.all((VCFG.discover || []).map(async q => {
      try {
        const r = await fetch('https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=15&relevanceLanguage=en&safeSearch=moderate&q=' + encodeURIComponent(q) + '&key=' + env.YT_KEY, { cf: { cacheTtl: 21600, cacheEverything: true } });
        const d = await r.json();
        (d.items || []).forEach(i => { const c = tally[i.snippet.channelId] || (tally[i.snippet.channelId] = { id: i.snippet.channelId, name: i.snippet.channelTitle, hits: 0, samples: [] }); c.hits++; if (c.samples.length < 3) c.samples.push(i.snippet.title); });
      } catch {}
    }));
    const known = new Set((VCFG.channels || []).map(c => c.id).filter(Boolean));
    const list = Object.values(tally).filter(c => !known.has(c.id)).sort((a, b) => b.hits - a.hits).slice(0, 30);
    return new Response(JSON.stringify({ note: 'Candidates only. Add the good ones to video.json; nothing here is shown on the site.', candidates: list }), { headers: { ...hdr, 'Cache-Control': 'public, max-age=3600' } });
  }
  if (url.searchParams.get('playlists') || url.searchParams.get('find')) {
    // suggest playlists: ?playlists=handle lists a channel's playlists, ?find=phrase searches playlists. Needs YT_KEY.
    if (!env.YT_KEY) return new Response(JSON.stringify({ error: 'Set the YT_KEY secret to use playlist discovery.' }), { status: 400, headers: hdr });
    const out = [];
    try {
      if (url.searchParams.get('find')) {
        const r = await fetch('https://www.googleapis.com/youtube/v3/search?part=snippet&type=playlist&maxResults=25&relevanceLanguage=en&q=' + encodeURIComponent(url.searchParams.get('find')) + '&key=' + env.YT_KEY, { cf: { cacheTtl: 21600, cacheEverything: true } });
        (await r.json()).items?.forEach(i => out.push({ id: i.id.playlistId, name: i.snippet.title, channel: i.snippet.channelTitle }));
      } else {
        const h = url.searchParams.get('playlists');
        const ch = (VCFG.channels || []).find(c => (c.handle || '').toLowerCase() === h.toLowerCase());
        const cid = ch ? await resolveChannel(ch) : '';
        if (!cid) return new Response(JSON.stringify({ error: 'channel not found in video.json or could not be resolved' }), { status: 404, headers: hdr });
        const r = await fetch('https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&maxResults=50&channelId=' + cid + '&key=' + env.YT_KEY, { cf: { cacheTtl: 21600, cacheEverything: true } });
        (await r.json()).items?.forEach(i => out.push({ id: i.id, name: i.snippet.title, channel: h, videos: i.contentDetails.itemCount }));
      }
    } catch (e) { return new Response(JSON.stringify({ error: String(e) }), { status: 502, headers: hdr }); }
    return new Response(JSON.stringify({ note: 'Candidates only. Copy the good ones into the playlists list in video.json.', candidates: out }, null, 1), { headers: hdr });
  }
  const pl = url.searchParams.get('playlist');
  if (pl) {
    const c = (VCFG.playlists || []).find(x => x.id === pl);
    if (!c) return new Response(JSON.stringify({ channels: [] }), { status: 404, headers: hdr });
    const r = await loadVideoSource(c, 'playlist');
    return new Response(JSON.stringify({ updated: new Date().toISOString(), channels: r.ok ? [r] : [], playlists: (VCFG.playlists || []).map(({ id, name, channel }) => ({ id, name, channel: (channel || '').toLowerCase() })), chnames: Object.fromEntries((VCFG.channels || []).map(c => [(c.handle || c.id || '').toLowerCase(), c.name])) }), { headers: { ...hdr, 'Cache-Control': 'public, max-age=900' } });
  }
  const dbg = !!url.searchParams.get('debug');
  const src = await Promise.all((VCFG.channels || []).map(c => loadVideoSource(c, 'channel', dbg)));
  if (dbg) return new Response(JSON.stringify(src.map(({ videos, ...r }) => ({ ...r, count: videos.length })), null, 1), { headers: hdr });
  return new Response(JSON.stringify({ updated: new Date().toISOString(), channels: src.filter(s => s.ok), playlists: (VCFG.playlists || []).map(({ id, name, channel }) => ({ id, name, channel: (channel || '').toLowerCase() })), chnames: Object.fromEntries((VCFG.channels || []).map(c => [(c.handle || c.id || '').toLowerCase(), c.name])) }), { headers: { ...hdr, 'Cache-Control': 'public, max-age=900' } });
}

// ---------------------------------------------------------------- voices: organizations and individuals (articles, podcasts, video)
async function probeFeed(u) {
  try {
    const r = await fetch(u, { headers: { 'User-Agent': 'IsraelNOWlej/1.0 (+https://israelnowlej.com/)', Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*' }, redirect: 'follow', cf: { cacheTtl: 3600, cacheEverything: true } });
    if (!r.ok) return false;
    const t = await r.text();
    return /<(rss|feed|rdf:RDF)\b/i.test(t.slice(0, 2000)) ? r.url || u : false;
  } catch { return false; }
}
async function discoverFeeds(site, diag) {
  const mk = 'vfeeds/' + site, known = await memGet(mk);
  if (known && known.list) return known.list;
  const found = [];
  try {
    const r = await fetch(site, { headers: YT_UA, redirect: 'follow' });
    const t = r.ok ? await r.text() : '';
    if (diag) diag.push({ homepage: site, status: r.status, bytes: t.length });
    for (const m of t.matchAll(/<link\b[^>]*>/gi)) {
      const b = m[0];
      if (!/type=["']application\/(rss|atom)\+xml["']/i.test(b)) continue;
      const h = b.match(/href=["']([^"']+)["']/i);
      if (!h) continue;
      try { const u = new URL(decode(h[1]), site).href; if (!found.includes(u) && !/comments/i.test(u)) found.push(u); } catch {}
    }
  } catch (e) { if (diag) diag.push({ homepage: site, error: String(e) }); }
  const good = [];
  for (const u of found.slice(0, 3)) { const ok = await probeFeed(u); if (ok) good.push(ok); }
  if (!good.length) for (const p of ['/feed/', '/feed', '/rss', '/rss.xml', '/feed.xml']) { const ok = await probeFeed(new URL(p, site).href); if (ok) { good.push(ok); break; } }
  if (good.length) await memPut(mk, { list: good }, 14 * 86400);
  return good;
}
async function whoImages(env, diagOn) {
  const hdr = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': diagOn ? 'no-store' : 'public, max-age=3600', 'Access-Control-Allow-Origin': '*' };
  const known = diagOn ? null : await memGet('whoimg2');
  if (known) return new Response(JSON.stringify(known), { headers: hdr });
  const vs = (VOICES.voices || []).filter(v => !v.hidden), out = {}, src = {};
  // 1. an image address written into the registry always wins
  vs.forEach(v => { if (v.img) { out[v.id] = v.img; src[v.id] = 'registry'; } });
  // 2. Wikipedia lead image
  const titles = vs.map(v => (v.wiki || v.name).replace(/ /g, '_'));
  try {
    const r = await fetch('https://en.wikipedia.org/w/api.php?action=query&format=json&redirects=1&prop=pageimages&piprop=thumbnail&pithumbsize=320&titles=' + encodeURIComponent(titles.join('|')), { headers: { 'User-Agent': 'IsraelNOWlej/1.0 (+https://israelnowlej.com/)' } });
    const j = await r.json(), q = j.query || {}, map = {};
    (q.normalized || []).forEach(x => map[x.from] = x.to); (q.redirects || []).forEach(x => map[x.from] = x.to);
    const byTitle = {}; Object.values(q.pages || {}).forEach(p => { if (p.thumbnail && p.thumbnail.source) byTitle[p.title] = p.thumbnail.source; });
    vs.forEach((v, i) => { if (out[v.id]) return; const t = titles[i].replace(/_/g, ' '); const a = map[titles[i]] || map[t] || t; const b = map[a] || a; const u = byTitle[b] || byTitle[a] || byTitle[t]; if (u) { out[v.id] = u; src[v.id] = 'wikipedia'; } });
  } catch {}
  // 3. the person's or organization's own YouTube channel picture
  if (env && env.YT_KEY) {
    const need = vs.filter(v => !out[v.id] && (v.yt || []).length);
    for (const v of need) {
      for (const h of v.yt) {
        try {
          const r = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet&forHandle=' + encodeURIComponent('@' + h) + '&key=' + env.YT_KEY);
          const j = await r.json(), t = j.items && j.items[0] && j.items[0].snippet && j.items[0].snippet.thumbnails;
          const u = t && (t.high || t.medium || t.default || {}).url;
          if (u) { out[v.id] = u; src[v.id] = 'youtube'; break; }
        } catch {}
      }
    }
  }
  // 4. organizations without a picture: the site's own icon
  const icons = [];
  vs.forEach(v => { if (!out[v.id] && v.site) { try { out[v.id] = 'https://www.google.com/s2/favicons?sz=128&domain=' + new URL(v.site).hostname; src[v.id] = 'site icon'; icons.push(v.id); } catch {} } });
  out._o = vs.filter(v => v.kind === 'org').map(v => v.id); out._i = icons; out._y = vs.filter(v => src[v.id] === 'youtube').map(v => v.id);
  if (diagOn) out._src = src;
  if (Object.keys(out).length > 1 && !diagOn) await memPut('whoimg2', out, 24 * 3600);
  return new Response(JSON.stringify(out), { headers: hdr });
}
async function podFeed(u, diag) {
  if (!/^itunes:/.test(u)) return u;
  const term = u.slice(7), mk = 'podfeed/' + term, known = await memGet(mk);
  if (known && known.feed) return known.feed;
  try {
    const r = await fetch('https://itunes.apple.com/search?media=podcast&limit=3&term=' + encodeURIComponent(term), { headers: { 'User-Agent': 'IsraelNOWlej/1.0' } });
    const j = await r.json(), hit = (j.results || []).find(x => x.feedUrl);
    if (diag) diag.push({ pod: term, title: hit && hit.collectionName, feed: hit && hit.feedUrl });
    if (hit) { await memPut(mk, { feed: hit.feedUrl, title: hit.collectionName }, 30 * 24 * 3600); return hit.feedUrl; }
  } catch (e) { if (diag) diag.push({ pod: term, error: String(e) }); }
  return '';
}
async function podsCheck() {
  const all = [...(VOICES.voices || []), ...(VOICES.shows || [])].filter(v => v.pods), rows = [];
  for (const v of all) for (const u of v.pods) { const d = []; const f = await podFeed(u, d); rows.push({ id: v.id, name: v.name, source: u, matched: (d[0] && d[0].title) || '', feed: f }); }
  return new Response(JSON.stringify(rows, null, 1), { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
}
async function voiceApi(url, env) {
  const hdr = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=900', 'Access-Control-Allow-Origin': '*' };
  const id = (url.searchParams.get('id') || '').toLowerCase(), diagOn = !!url.searchParams.get('diag');
  const v = (VOICES.voices || []).find(x => x.id === id) || (VOICES.shows || []).find(x => x.id === id && (x.show = true));
  if (!v) return new Response('{"error":"unknown voice"}', { status: 404, headers: hdr });
  const diag = diagOn ? [] : null;
  const refresh = !!url.searchParams.get('refresh'), searchMode = url.searchParams.get('search') || '';
  if (!diagOn && !refresh && env && env.ENTRIES) { const s = await kvSnap(env, 'snap/voice/' + id, 75); if (s) return new Response(JSON.stringify(s.j), { headers: hdr }); }
  const mk = 'voice/' + id, cached = (diagOn || refresh) ? null : await memGet(mk);
  if (cached) return new Response(JSON.stringify(cached), { headers: hdr });
  const feedUrls = (v.blog && v.blog.length) ? v.blog : (v.site ? await discoverFeeds(v.site, diag) : []);
  const arts = (await Promise.all(feedUrls.map(u => load({ id: v.id, name: v.name, site: v.site || u, url: u, maxAge: 3650 })))).flatMap(r => r.items);
  // coverage by and about the person: Google News search, credited to each publisher
  const gq = v.gq || v.name;
  const gnr = v.show ? { ok: true, items: [] } : await load({ id: v.id, name: 'News', site: 'https://news.google.com/', url: 'https://news.google.com/rss/search?q=' + encodeURIComponent('"' + gq + '"') + '&hl=en-US&gl=US&ceid=US:en', maxAge: 3650 });
  const news = gnr.items.map(({ f, ...rest }) => { const m = rest.t.match(/^(.*) - ([^-]{2,60})$/); return { ...rest, t: m ? m[1] : rest.t, src: m ? m[2] : 'News', x: '', i: '' }; }).filter(x => !arts.some(a => a.u === x.u)).slice(0, 25);
  if (diag) diag.push({ googleNews: gnr.ok, error: gnr.error, count: news.length });
  const podArts = (await Promise.all((v.pods || []).map(async u0 => { const u = await podFeed(u0, diag); return u ? load({ id: v.id, name: v.name, site: v.site || u, url: u, maxAge: 36500, max: 400 }) : { items: [] }; }))).flatMap(r => r.items).map(({ f, ...rest }) => rest);
  const vids = [], chanIds = [];
  for (const h of (v.yt || [])) { const r = await loadVideoSource({ handle: h, name: v.name }, 'channel', diag); if (r.ok && r.id) chanIds.push(r.id); (r.videos || []).forEach(x => vids.push({ ...x, n: v.name })); if (diag) diag.push({ yt: h, ok: r.ok, error: r.error, count: (r.videos || []).length }); }
  // playlists of the person's own channel (cached twelve hours)
  const pls = [];
  if (env && env.YT_KEY && chanIds.length) {
    const cid = chanIds[0], pk = 'vpl/' + cid; let pv = diagOn ? null : await memGet(pk);
    if (!pv) {
      pv = { list: [] };
      try {
        const r = await fetch('https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&maxResults=24&channelId=' + cid + '&key=' + env.YT_KEY);
        const j = await r.json();
        if (diag) diag.push({ playlists: cid, status: r.status, count: (j.items || []).length, error: j.error ? j.error.message : '' });
        pv.list = (j.items || []).filter(x => x.contentDetails && x.contentDetails.itemCount > 1).map(x => ({ id: x.id, t: decode(x.snippet.title), n: x.contentDetails.itemCount, th: (x.snippet.thumbnails && (x.snippet.thumbnails.medium || x.snippet.thumbnails.default) || {}).url || '' }));
        if (pv.list.length) await memPut(pk, pv, 12 * 3600);
      } catch (e) { if (diag) diag.push({ playlists: cid, error: String(e) }); }
    }
    pls.push(...pv.list);
  }
  // diagnostics only: suggest channels that match the name, never used automatically
  if (diagOn && env && env.YT_KEY && !vids.length) {
    try { const r = await fetch('https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&maxResults=3&q=' + encodeURIComponent(v.name) + '&key=' + env.YT_KEY); const j = await r.json(); diag.push({ suggestChannels: (j.items || []).map(x => ({ id: x.snippet.channelId, title: x.snippet.channelTitle })) }); } catch {}
  }
  // appearances on other people's shows: a cached YouTube search, kept for six hours to protect the quota
  if (v.q && env && env.YT_KEY && searchMode !== 'no') {
    const sk = 'vsearch/' + id; let sv = (diagOn || searchMode === '1') ? null : await memGet(sk);
    if (!sv) {
      sv = { list: [] };
      try {
        const r = await fetch('https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&order=date&maxResults=12&relevanceLanguage=en&q=' + encodeURIComponent('"' + v.q + '"' + (v.qs != null ? v.qs : ' Israel interview')) + '&key=' + env.YT_KEY);
        const j = await r.json();
        if (diag) diag.push({ search: v.q, status: r.status, error: j.error ? j.error.message : '' });
        sv.list = (j.items || []).filter(x => x.id && x.id.videoId && ((x.snippet.title + ' ' + x.snippet.description).toLowerCase().includes(v.q.split(' ').slice(-1)[0].toLowerCase()))).map(x => ({ v: x.id.videoId, t: decode(x.snippet.title), d: x.snippet.publishedAt, x: (x.snippet.description || '').slice(0, 200), n: decode(x.snippet.channelTitle || ''), guest: 1 }));
        if (sv.list.length) await memPut(sk, sv, 24 * 3600);
      } catch (e) { if (diag) diag.push({ search: v.q, error: String(e) }); }
    }
    sv.list.forEach(x => { if (!vids.some(y => y.v === x.v)) vids.push(x); });
  }
  arts.sort((a, b) => (b.d || '').localeCompare(a.d || '')); vids.sort((a, b) => (b.d || '').localeCompare(a.d || ''));
  if (env && env.ENTRIES) {
    for (const a of arts.slice(0, 30)) {
      try {
        const key = 'va:' + a.k;
        if (!(await env.ENTRIES.get(key))) await env.ENTRIES.put(key, JSON.stringify({ k: a.k, t: a.t, u: a.u, d: a.d, f: a.f || '', x: a.x || '', i: a.i || '', s: v.id, vid: v.id, src: v.name, site: v.site || a.u }));
      } catch { break; }
    }
  }
  const out = { id, name: v.name, kind: v.kind, updated: new Date().toISOString(), articles: arts.slice(0, 30).map(({ f, ...rest }) => rest), news, podcasts: podArts.slice(0, 400), videos: vids.slice(0, 30), playlists: pls.slice(0, 24), feeds: feedUrls };
  if (diag) out.diag = diag; else await memPut(mk, out, 900);
  return new Response(JSON.stringify(out), { headers: diagOn ? { ...hdr, 'Cache-Control': 'no-store' } : hdr });
}

// ---------------------------------------------------------------- mail: alerts to the owner, receipts and replies to senders
// Needs the secret RESEND_KEY and the variable MAIL_FROM (an address on a domain verified with Resend). Without them, nothing is sent.
async function sendMail(env, to, subject, text, replyTo) {
  if (!env.RESEND_KEY || !env.MAIL_FROM) return { ok: false, note: 'Mail is not set up yet.' };
  try {
    const r = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: 'Bearer ' + env.RESEND_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: env.MAIL_FROM, to: [to], subject, text, ...(replyTo ? { reply_to: replyTo } : {}) }) });
    return { ok: r.ok, note: r.ok ? '' : 'Mail service said ' + r.status };
  } catch (e) { return { ok: false, note: String(e) }; }
}
const RECEIPT = {
  article: 'Thank you for sending an article to Israel NOWlej. A person will read it. If we use it, it will appear credited to its original publisher.',
  video: 'Thank you for sending a video to Israel NOWlej. A person will watch it. If we use it, it will play in an embedded player and be credited to its channel.',
  nominee: 'Thank you for your nomination for Voices on Israel NOWlej. We will review it and write to you with our decision.',
  apply: 'Thank you for applying to be listed on Israel NOWlej. We will review your application and write to you with our decision.',
  claim: 'Thank you for contacting us about your profile on Israel NOWlej. To protect you from impostors we may ask you to confirm your request from an official address. We will write to you soon.'
};

// ---------------------------------------------------------------- submissions: articles, videos, nominees and applications
const SUBTYPES = ['article', 'video', 'nominee', 'apply', 'claim'];
async function submitApi(request, env, ctx) {
  const hdr = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' };
  if (request.method !== 'POST') return new Response('{"error":"method"}', { status: 405, headers: hdr });
  if (!env.ENTRIES) return new Response('{"error":"Submissions are not switched on yet."}', { status: 501, headers: hdr });
  const org = request.headers.get('Origin');
  if (org && new URL(org).host !== new URL(request.url).host) return new Response('{"error":"origin"}', { status: 403, headers: hdr });
  let b; try { b = await request.json(); } catch { return new Response('{"error":"Please try again."}', { status: 400, headers: hdr }); }
  if (b.website) return new Response('{"ok":true}', { headers: hdr });             // honeypot: quietly accept and drop
  if (typeof b.t === 'number' && Date.now() - b.t < 3000) return new Response('{"error":"Please take a moment to check the form, then send again."}', { status: 429, headers: hdr });
  const clip = (s, n) => String(s == null ? '' : s).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').trim().slice(0, n);
  const type = clip(b.type, 12);
  if (!SUBTYPES.includes(type)) return new Response('{"error":"Choose what you are sending."}', { status: 400, headers: hdr });
  const urlOk = u => { try { const x = new URL(u); return /^https?:$/.test(x.protocol); } catch { return false; } };
  const rec = { type, name: clip(b.name, 120), url: clip(b.url, 500), title: clip(b.title, 200), change: clip(b.change, 20), about: clip(b.about, 120), notes: clip(b.notes, 2000), links: clip(b.links, 800), email: clip(b.email, 160), whatsapp: clip(b.whatsapp, 25).replace(/[^\d+]/g, ''), telegram: clip(b.telegram, 40).replace(/^.*t\.me\//, '').replace(/^@/, ''), instagram: clip(b.instagram, 40).replace(/^.*instagram\.com\//, '').replace(/^@/, '').replace(/\/$/, ''), from: clip(b.from, 120), status: 'new', at: new Date().toISOString() };
  const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(rec.email), waOk = /^\+?\d{7,15}$/.test(rec.whatsapp), tgOk = /^[A-Za-z0-9_]{3,32}$/.test(rec.telegram), igOk = /^[A-Za-z0-9._]{1,30}$/.test(rec.instagram);
  if (!emailOk) rec.email = ''; if (!waOk) rec.whatsapp = ''; if (!tgOk) rec.telegram = ''; if (!igOk) rec.instagram = '';
  if (!rec.email && !rec.whatsapp && !rec.telegram && !rec.instagram) return new Response('{"error":"Please give at least one way to reach you: email, WhatsApp, Telegram or Instagram."}', { status: 400, headers: hdr });
  if ((type === 'article' || type === 'video') && !urlOk(rec.url)) return new Response('{"error":"Please paste the full web address of the article or video."}', { status: 400, headers: hdr });
  if ((type === 'nominee' || type === 'apply' || type === 'claim') && !rec.name) return new Response('{"error":"Please give a name."}', { status: 400, headers: hdr });
  if (!b.consent) return new Response('{"error":"Please tick the box so we may review and reply."}', { status: 400, headers: hdr });
  if (/(https?:\/\/[^\s]+[\s\S]*){6,}/.test(rec.notes)) return new Response('{"error":"Too many links in the notes. Please use the links box."}', { status: 400, headers: hdr });
  const ip = request.headers.get('CF-Connecting-IP') || 'x', rk = 'rl:' + ip + ':' + new Date().toISOString().slice(0, 13);
  const n = parseInt(await env.ENTRIES.get(rk) || '0', 10);
  if (n >= 5) return new Response('{"error":"That is enough for this hour. Please try again later."}', { status: 429, headers: hdr });
  await env.ENTRIES.put(rk, String(n + 1), { expirationTtl: 3700 });
  const id = 'sub:' + rec.at + '-' + Math.random().toString(36).slice(2, 7);
  await env.ENTRIES.put(id, JSON.stringify(rec));
  const notify = env.NOTIFY_TO || 'rkoret@gmail.com', host = new URL(request.url).origin;
  const job = (async () => {
    await sendMail(env, notify, 'New ' + rec.type + ' submission on Israel NOWlej', ['Type: ' + rec.type, rec.name && 'Name: ' + rec.name, rec.url && 'Link: ' + rec.url, rec.about && 'About: ' + rec.about, rec.change && 'Wants to: ' + rec.change, rec.notes && 'Notes: ' + rec.notes, rec.links && 'Links: ' + rec.links, 'From: ' + (rec.from || 'unknown') + (rec.email ? ' <' + rec.email + '>' : ''), rec.whatsapp && 'WhatsApp: ' + rec.whatsapp, rec.telegram && 'Telegram: @' + rec.telegram, rec.instagram && 'Instagram: @' + rec.instagram, '', 'Review it: ' + host + '/admin/submissions/'].filter(x => x !== '' && x !== false && x != null).join('\n'), rec.email);
    if (rec.email) await sendMail(env, rec.email, 'We received your submission to Israel NOWlej', (RECEIPT[type] || RECEIPT.article) + '\n\nThis is an automatic receipt. You can reply to this email if you want to add something.\n\nIsrael NOWlej');
  })();
  if (ctx && ctx.waitUntil) ctx.waitUntil(job); else await job;
  return new Response('{"ok":true}', { headers: hdr });
}
async function submissionsApi(request, env) {
  const hdr = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' };
  if (!env.ENTRIES || !env.ADMIN_KEY) return new Response('{"error":"Not set up yet. It needs the ENTRIES storage and the ADMIN_KEY secret."}', { status: 501, headers: hdr });
  const key = request.headers.get('x-admin-key') || '';
  if (key.length !== env.ADMIN_KEY.length || key !== env.ADMIN_KEY) return new Response('{"error":"Wrong admin key."}', { status: 401, headers: hdr });
  if (request.method === 'POST') {
    const b = await request.json().catch(() => ({}));
    const okId = x => /^sub:[0-9T:.\-Z]+-[a-z0-9]+$/.test(x || '');
    const ids = (Array.isArray(b.ids) ? b.ids : [b.id]).filter(okId).slice(0, 100);
    if (!ids.length) return new Response('{"error":"bad request"}', { status: 400, headers: hdr });
    let sent = null;
    for (const id of ids) {
      const raw = await env.ENTRIES.get(id); if (!raw) continue;
      const r = JSON.parse(raw);
      if (b.reply && b.reply.body && ids.length === 1) {
        const m = !r.email ? { ok: false, note: 'This sender gave no email. Use the WhatsApp, Telegram or Instagram link instead.' } : await sendMail(env, r.email, String(b.reply.subject || 'Your submission to Israel NOWlej').slice(0, 150), String(b.reply.body).slice(0, 4000) + '\n\nIsrael NOWlej');
        sent = m; if (m.ok) { r.repliedAt = new Date().toISOString(); r.status = 'done'; await env.ENTRIES.put(id, JSON.stringify(r)); }
        continue;
      }
      if (['new', 'approved', 'rejected', 'done'].includes(b.status)) { r.status = b.status; await env.ENTRIES.put(id, JSON.stringify(r)); }
    }
    return new Response(JSON.stringify({ ok: !sent || sent.ok, mail: sent }), { headers: hdr });
  }
  const l = await env.ENTRIES.list({ prefix: 'sub:', limit: 300 });
  const items = await Promise.all(l.keys.map(async k => { try { return { id: k.name, ...JSON.parse(await env.ENTRIES.get(k.name)) }; } catch { return null; } }));
  return new Response(JSON.stringify({ mail: !!(env.RESEND_KEY && env.MAIL_FROM), items: items.filter(Boolean).sort((a, b) => b.at.localeCompare(a.at)) }), { headers: hdr });
}


// ---------------------------------------------------------------- hourly scan: snapshots in KV
async function kvSnap(env, key, maxMin) {
  try { const raw = await env.ENTRIES.get(key); if (!raw) return null; const o = JSON.parse(raw); return (Date.now() - o.t) / 60000 <= maxMin ? o : null; } catch { return null; }
}
async function scan(env) {
  if (!env.ENTRIES) return;
  const started = Date.now();
  const log = { t: started, videos: false, voices: [], searched: [], error: '' };
  let fresh = [];
  try {
    const r = await videoApi(new URL('https://scan.local/api/videos?fresh=1'), env);
    const j = await r.json();
    if (j && j.channels && j.channels.length) { await env.ENTRIES.put('snap/videos', JSON.stringify({ t: Date.now(), j })); log.videos = true; }
    (j.channels || []).forEach(c => (c.videos || []).forEach(x => fresh.push({ v: x.v, t: x.t, d: x.d, n: c.name, w: '' })));
  } catch (e) { log.error += 'videos:' + String(e) + ' '; }
  const vs = (VOICES.voices || []).filter(v => !v.hidden);
  const per = Math.max(1, parseInt(env.SCAN_VOICES || '8', 10)), maxSearch = Math.max(0, parseInt(env.SCAN_SEARCHES || '3', 10));
  let cur = 0; try { cur = parseInt((await env.ENTRIES.get('snap/cursor')) || '0', 10) || 0; } catch {}
  let searches = 0;
  for (let i = 0; i < Math.min(per, vs.length); i++) {
    const v = vs[(cur + i) % vs.length];
    try {
      const doSearch = !!(v.q && env.YT_KEY && searches < maxSearch);
      if (doSearch) searches++;
      const r = await voiceApi(new URL('https://scan.local/api/voice?id=' + encodeURIComponent(v.id) + '&refresh=1&search=' + (doSearch ? '1' : 'no')), env);
      const j = await r.json();
      if (!j || j.error) continue;
      if (!doSearch) {
        try { const prev = JSON.parse((await env.ENTRIES.get('snap/voice/' + v.id)) || 'null'); if (prev && prev.j) { const have = new Set((j.videos || []).map(x => x.v)); (prev.j.videos || []).filter(x => x.guest && !have.has(x.v)).forEach(x => j.videos.push(x)); } } catch {}
      } else log.searched.push(v.id);
      await env.ENTRIES.put('snap/voice/' + v.id, JSON.stringify({ t: Date.now(), j }));
      log.voices.push(v.id);
      (j.videos || []).forEach(x => fresh.push({ v: x.v, t: x.t, d: x.d, n: x.n || v.name, w: v.id }));
    } catch (e) { log.error += v.id + ':' + String(e) + ' '; }
  }
  try { await env.ENTRIES.put('snap/cursor', String((cur + per) % Math.max(vs.length, 1))); } catch {}
  // newest uploads across every channel and person, with the hour each was first noticed
  try {
    let prev = []; try { prev = (JSON.parse((await env.ENTRIES.get('snap/new')) || 'null') || {}).items || []; } catch {}
    const seen = new Map(prev.map(x => [x.v, x]));
    fresh.forEach(x => { if (!x.v) return; const o = seen.get(x.v); if (!o) seen.set(x.v, { ...x, s: new Date().toISOString() }); else if (x.w && !o.w) o.w = x.w; });
    const items = [...seen.values()].filter(x => x.d).sort((a, b) => b.d.localeCompare(a.d)).slice(0, 120);
    await env.ENTRIES.put('snap/new', JSON.stringify({ t: Date.now(), items }));
  } catch (e) { log.error += 'new:' + String(e); }
  log.ms = Date.now() - started;
  try { await env.ENTRIES.put('snap/log', JSON.stringify(log)); } catch {}
}

const IMG_TAGS = { 'jerusalem': 'Jerusalem', 'tel-aviv': 'Tel Aviv', 'haifa': 'Haifa', 'galilee': 'Galilee', 'golan': 'Golan Heights', 'coast': 'Mediterranean coast beach', 'negev': 'Negev desert', 'dead-sea': 'Dead Sea', 'landscape': 'landscape', 'archaeology': 'archaeological site ruins', 'holy': 'synagogue church mosque holy site', 'architecture': 'architecture building', 'food': 'food market cuisine', 'people': 'people festival culture', 'birds': 'bird', 'flowers': 'wildflowers anemone', 'wildlife': 'wildlife animal', 'military': 'Israel Defense Forces', 'history': 'historic' };
async function imagesApi(url, ctx) {
  const hdr = { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=3600' };
  const q = (url.searchParams.get('q') || '').replace(/[^\p{L}\p{N} '\-]/gu, ' ').trim().slice(0, 80);
  const tag = url.searchParams.get('tag') || '';
  const off = Math.min(parseInt(url.searchParams.get('o') || '0', 10) || 0, 400);
  let terms = q || IMG_TAGS[tag] || '';
  if (!/israel/i.test(terms)) terms = 'Israel ' + terms;
  const api = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrnamespace=6&gsrlimit=40&gsroffset=' + off + '&gsrsearch=' + encodeURIComponent(terms.trim() + ' filetype:bitmap') + '&prop=imageinfo&iiprop=url|size|extmetadata&iiurlwidth=520&iiextmetadatafilter=LicenseShortName|Artist|NonFree|Restrictions';
  const ck = new Request('https://cache.local/img/' + encodeURIComponent(terms) + '/' + off);
  const hit = await caches.default.match(ck); if (hit) return new Response(hit.body, { headers: hdr });
  let j; try { const r = await fetch(api, { headers: { 'User-Agent': 'IsraelNOWlej/1.0 (https://israelnowlej.com)' } }); if (!r.ok) throw 0; j = await r.json(); } catch { return new Response(JSON.stringify({ items: [], error: 'upstream' }), { status: 502, headers: { ...hdr, 'Cache-Control': 'no-store' } }); }
  const pages = Object.values((j.query && j.query.pages) || {}).sort((a, b) => a.index - b.index);
  const items = [];
  for (const p of pages) {
    const ii = p.imageinfo && p.imageinfo[0]; if (!ii || !ii.thumburl) continue;
    const m = ii.extmetadata || {}, lic = ((m.LicenseShortName || {}).value || '').trim();
    if (!/^(CC0|CC BY(-SA)?\b|Public domain|PD)/i.test(lic) || /\b(NC|ND)\b/i.test(lic)) continue;
    if (((m.NonFree || {}).value || '').toLowerCase() === 'true' || (m.Restrictions || {}).value) continue;
    if (ii.width < 800) continue;
    const a = ((m.Artist || {}).value || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, 60);
    items.push({ t: p.title.replace(/^File:/, '').replace(/\.[A-Za-z]+$/, '').replace(/_/g, ' ').slice(0, 90), th: ii.thumburl, page: ii.descriptionurl, a, lic });
  }
  const out = JSON.stringify({ items, next: j.continue && j.continue.gsroffset ? j.continue.gsroffset : 0 });
  ctx.waitUntil(caches.default.put(ck, new Response(out, { headers: { 'Cache-Control': 'max-age=21600' } })));
  return new Response(out, { headers: hdr });
}
export default {
  async scheduled(event, env, ctx) { YTK = env.YT_KEY || ''; ctx.waitUntil(scan(env)); },
  async fetch(request, env, ctx) {
    YTK = env.YT_KEY || '';
    const url = new URL(request.url);
    const im = url.pathname.match(/^\/news\/item\/([a-z0-9]+)\/?$/);
    if (im) return itemPage(request, env, im[1], url.searchParams.get('s'), url.searchParams.get('c'));
    if (url.pathname === '/api/videos') return videoApi(url, env);
    if (url.pathname === '/api/submit') return submitApi(request, env, ctx);
    if (url.pathname === '/api/submissions') return submissionsApi(request, env);
    if (url.pathname === '/api/whoimg') return whoImages(env, !!url.searchParams.get('diag'));
    if (url.pathname === '/api/voice') return voiceApi(url, env);
    if (url.pathname === '/api/images') return imagesApi(url, ctx);
    if (url.pathname === '/api/pods-check') return podsCheck();
    if (url.pathname === '/api/latest-videos') {
      const o = env.ENTRIES ? await kvSnap(env, 'snap/new', 60 * 24 * 7) : null;
      const hrs = Math.min(parseInt(url.searchParams.get('hours') || '0', 10) || 0, 24 * 14), lim = Math.min(parseInt(url.searchParams.get('n') || '12', 10) || 12, 60);
      let items = o ? o.items : []; if (hrs) items = items.filter(x => Date.now() - new Date(x.s || x.d) <= hrs * 3600000);
      return new Response(JSON.stringify({ updated: o ? new Date(o.t).toISOString() : null, items: items.slice(0, lim) }), { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=300', 'Access-Control-Allow-Origin': '*' } });
    }
    if (url.pathname === '/api/scan-status') {
      if (request.headers.get('x-admin-key') !== env.ADMIN_KEY || !env.ADMIN_KEY) return new Response('{"error":"admin key required"}', { status: 401 });
      return new Response((await env.ENTRIES.get('snap/log')) || '{"note":"no scan has run yet"}', { headers: { 'Content-Type': 'application/json' } });
    }
    if (url.pathname === '/api/entry') return entryApi(request, url, env);
    if (url.pathname === '/api/yt-title') return ytTitle(url);
    if (url.pathname !== '/api/news') return env.ASSETS.fetch(request);
    if (url.searchParams.get('debug')) {
      const out = await Promise.all(FEEDS.map(async f => {
        try {
          const r = await fetch(f.url, { headers: { 'User-Agent': 'IsraelMosaicNews/1.0' } });
          const xml = await r.text();
          const m = xml.match(/<(item|entry)\b[\s\S]*?<\/\1>/i);
          return { id: f.id, status: r.status, type: r.headers.get('content-type'), firstItemRaw: m ? m[0].slice(0, 1800) : xml.slice(0, 600), parsed: parse(xml, f).slice(0, 2) };
        } catch (e) { return { id: f.id, error: String(e) }; }
      }));
      return new Response(JSON.stringify(out, null, 1), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
    }
    const sp = url.searchParams.get('s'), cp = url.searchParams.get('c');
    if (url.searchParams.get('views') && !sp) {
      const rs = await Promise.all(VSRC.flatMap(v => v.groups[0].list.map(async c => {
        const r = await load({ id: v.id, name: v.name, site: v.site, url: c.url });
        r.items.forEach(i => { i.ch = c.id; i.kind = c.name; });
        return { v, r };
      })));
      const items = rs.flatMap(x => x.r.items).map(({ f, ...rest }) => rest).sort((a, b) => (b.d || '').localeCompare(a.d || '')).slice(0, 300);
      const sources = VSRC.map(v => ({ id: v.id, name: v.name, site: v.site, groups: v.groups.map(g => ({ group: g.group, list: g.list.map(c => ({ id: c.id, name: c.name })) })), ok: rs.some(x => x.v.id === v.id && x.r.ok), count: rs.filter(x => x.v.id === v.id).reduce((n, x) => n + x.r.items.length, 0), error: '' }));
      return new Response(JSON.stringify({ updated: new Date().toISOString(), sources, items }), { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=600', 'Access-Control-Allow-Origin': '*' } });
    }
    if (sp && url.searchParams.get('probe')) {
      // which channels of a source have stories from the last 7 days. One group per call keeps subrequests low.
      const src = url.searchParams.get('views') ? VSRC.find(s => s.id === sp) : SOURCES.find(s => s.id === sp), g = src && src.groups && src.groups.find(x => x.group === url.searchParams.get('probe'));
      if (!g) return new Response('{"error":"unknown group"}', { status: 404, headers: { 'Content-Type': 'application/json' } });
      const rs = await Promise.all(g.list.map(c => load({ id: src.id, name: src.name, site: src.site, url: c.url }).then(r => ({ id: c.id, ok: r.ok, count: r.items.length, newest: r.items.reduce((m, i) => (i.d && i.d > m ? i.d : m), '') }))));
      return new Response(JSON.stringify({ group: g.group, channels: rs }), { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=3600', 'Access-Control-Allow-Origin': '*' } });
    }
    if (sp && cp) {
      const src = SOURCES.find(s => s.id === sp), ch = findChannel(src, cp);
      if (!ch) return new Response('{"error":"unknown channel"}', { status: 404, headers: { 'Content-Type': 'application/json' } });
      const r = await load({ id: src.id, name: src.name, site: src.site, url: ch.url });
      return new Response(JSON.stringify({ updated: new Date().toISOString(), source: src.id, channel: { id: ch.id, name: ch.name }, ok: r.ok, error: r.error, items: r.items.map(({ f, ...rest }) => ({ ...rest, ...(cp.startsWith('v-') ? { kind: ch.name } : {}) })) }), { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=600', 'Access-Control-Allow-Origin': '*' } });
    }
    const results = await Promise.all(FEEDS.map(load));
    const items = results.flatMap(r => r.items).map(({ f, ...rest }) => rest).sort((a, b) => (b.d || '').localeCompare(a.d || '')).slice(0, TOTAL);
    const body = JSON.stringify({ updated: new Date().toISOString(), sources: results.map(r => ({ id: r.feed.id, name: r.feed.name, site: r.feed.site, groups: (SOURCES.find(s => s.id === r.feed.id) || {}).groups ? SOURCES.find(s => s.id === r.feed.id).groups.map(g => ({ group: g.group, list: g.list.map(c => ({ id: c.id, name: c.name })) })) : null, ok: r.ok, count: r.items.length, error: r.error, img: !!r.img })), items });
    return new Response(body, { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=600', 'Access-Control-Allow-Origin': '*' } });
  },
};
export { parse };
