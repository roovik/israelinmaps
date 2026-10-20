// Israel Mosaic news worker. Serves /api/news from public RSS and Atom feeds.
// Static pages are served by the assets binding. Only /api/* runs this code first.
import VCFG from './video.json';
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
  { id: 'insider', name: 'Israel Insider', site: 'https://israelinsider.org/', url: 'https://israel.nowlej.com/feed/' },
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
  let u = attr(block, 'media:thumbnail', 'url') || attr(block, 'media:content', 'url');
  if (!u) { const m = block.match(/<enclosure\b[^>]*>/i); if (m && /image/i.test(m[0])) { const x = m[0].match(/url="([^"]+)"/i); if (x) u = decode(x[1]); } }
  if (!u) { const m = raw.match(/<img\b[^>]*\ssrc=["']([^"']+)["']/i); if (m) u = decode(m[1]); }
  return /^https?:\/\//i.test(u) ? u : '';
}
function parse(xml, feed) {
  const items = [];
  const re = /<(item|entry)\b[\s\S]*?<\/\1>/gi;
  let m;
  while ((m = re.exec(xml)) && items.length < PER_FEED) {
    const b = m[0];
    const title = text(tag(b, 'title'));
    let link = text(tag(b, 'link'));
    if (!link) link = attr(b, 'link', 'href');
    if (!/^https?:\/\//i.test(link)) { const alt = b.match(/<link\b[^>]*rel="alternate"[^>]*href="([^"]+)"/i); link = alt ? decode(alt[1]) : link; }
    if (!title || !/^https?:\/\//i.test(link)) continue;
    const d = text(tag(b, 'pubDate') || tag(b, 'published') || tag(b, 'updated') || tag(b, 'dc:date'));
    const t = d ? new Date(d) : null;
    const desc = tag(b, 'description') || tag(b, 'summary') || tag(b, 'content:encoded') || tag(b, 'content');
    const full = text(tag(b, 'content:encoded')), short = text(desc);
    const best = clean(full.length > short.length ? full : short, title, 5) || clean(short, title, 5);
    items.push({ s: feed.id, src: feed.name, t: title, u: link, k: hashId(link), d: t && !isNaN(t) && t.getFullYear() >= 2005 ? t.toISOString() : null, x: blurb(short, title), i: image(b), f: best ? words100(best) : '' });
  }
  return items;
}
async function load(feed) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), TIMEOUT);
  try {
    const r = await fetch(feed.url, { signal: ctl.signal, headers: { 'User-Agent': 'IsraelMosaicNews/1.0 (+https://israelinmaps.com/news/)', Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*' }, cf: { cacheTtl: 1800, cacheEverything: true } });
    if (!r.ok) return { feed, ok: false, error: 'HTTP ' + r.status, items: [] };
    const xml = await r.text();
    if (!/<(rss|feed|rdf:RDF)\b/i.test(xml.slice(0, 2000))) return { feed, ok: false, error: 'not an RSS or Atom feed', items: [] };
    let items = parse(xml, feed);
    const cutoff = Date.now() - MAX_AGE_DAYS * 864e5;
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
  const src = SOURCES.find(x => x.id === sp);
  let item = null, status = 200;
  if (src) {
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
    const vw = !!(cp && cp.startsWith('v-'));
    body = '<span data-word="' + (vw ? 'views' : 'news') + '" hidden></span><p class="crumb"><a href="/">Home</a> / <a href="' + (vw ? '/views/">Views' : '/news/">News') + '</a> / Feed item</p>'
      + '<article class="fitem"><h1>' + H(item.t) + '</h1>'
      + '<p class="fmeta"><a href="' + H(src.site) + '" rel="noopener">' + H(src.name) + '</a>' + (when ? ' · ' + when : '') + '</p>'
      + (item.i ? '<img class="fimg" src="' + H(item.i) + '" alt="" referrerpolicy="no-referrer" onerror="this.remove()">' : '')
      + (item.f ? '<p class="fx">' + H(item.f) + '</p>' : '<p class="fx">' + H(src.name) + ' shares only the headline of this story.</p>')
      + (gl.length ? '<p class="chips">In the glossary: ' + gl.map(g => '<a href="/g/' + H(g[0]) + '/">' + H(g[1]) + '</a>').join(' ') + '</p>' : '')
      + '<p class="fgo"><a class="fbtn" href="' + H(item.u) + '" rel="noopener nofollow">Read the full story at ' + H(src.name) + '</a></p>'
      + '<p class="small">This page will disappear after 7 days.</p></article>';
  }
  const html = tpl.split('@@TITLE@@').join(H(title)).split('@@DESC@@').join(H(desc)).split('@@K@@').join(H(k)).split('@@BODY@@').join(body);
  return new Response(html, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': status === 200 ? 'public, max-age=900' : 'no-store', 'X-Robots-Tag': 'noindex' } });
}
// ---------------------------------------------------------------- video: whitelisted channels and playlists
const YT_UA = { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36', 'Accept-Language': 'en-US,en;q=0.9', Cookie: 'CONSENT=YES+1; SOCS=CAI' };
// small last-good store in the edge cache, so one bad fetch does not blank a channel
async function memGet(k) { try { const r = await caches.default.match(new Request('https://cache.local/' + k)); return r ? await r.json() : null; } catch { return null; } }
async function memPut(k, v, ttl) { try { await caches.default.put(new Request('https://cache.local/' + k), new Response(JSON.stringify(v), { headers: { 'Cache-Control': 'max-age=' + ttl } })); } catch {} }
async function resolveChannel(c, diag) {
  if (c.id) return c.id;
  const known = await memGet('chid/' + c.handle);
  if (known && known.id) return known.id;
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
async function videoApi(url, env) {
  const hdr = { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' };
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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const im = url.pathname.match(/^\/news\/item\/([a-z0-9]+)\/?$/);
    if (im) return itemPage(request, env, im[1], url.searchParams.get('s'), url.searchParams.get('c'));
    if (url.pathname === '/api/videos') return videoApi(url, env);
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
