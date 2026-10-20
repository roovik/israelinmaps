// Israel Mosaic news worker. Serves /api/news from public RSS and Atom feeds.
// Static pages are served by the assets binding. Only /api/* runs this code first.
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
const FEEDS = SOURCES.map(s => ({ id: s.id, name: s.name, site: s.site, url: s.url }));
const PER_FEED = 12, TOTAL = 72, TIMEOUT = 8000, MAX_AGE_DAYS = 7;

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
function blurb(x, title) {
  x = x.replace(/The post .{0,200}? appeared first on .*$/i, '').replace(/\[(?:\u2026|&hellip;|\.\.\.)\]/g, '').replace(/\b(?:Continue reading|Read more|Click here)\b.*$/i, '').replace(/\s+/g, ' ').trim();
  if (x.length < 50 || x.split(' ').length < 8) return '';
  if (/[<>{}]|&#|&[a-z]+;|https?:\/\//i.test(x)) return '';
  const a = x.toLowerCase().slice(0, 40), b = title.toLowerCase().slice(0, 40);
  if (a === b || x.toLowerCase() === title.toLowerCase()) return '';
  if (!/[a-z]{3}/.test(x) || (x.match(/[A-Z]/g) || []).length > x.length * 0.4) return '';
  return snippet(x);
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
    items.push({ s: feed.id, src: feed.name, t: title, u: link, d: t && !isNaN(t) && t.getFullYear() >= 2005 ? t.toISOString() : null, x: blurb(text(desc), title), i: image(b) });
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
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
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
    if (sp && url.searchParams.get('probe')) {
      // which channels of a source have stories from the last 7 days. One group per call keeps subrequests low.
      const src = SOURCES.find(s => s.id === sp), g = src && src.groups && src.groups.find(x => x.group === url.searchParams.get('probe'));
      if (!g) return new Response('{"error":"unknown group"}', { status: 404, headers: { 'Content-Type': 'application/json' } });
      const rs = await Promise.all(g.list.map(c => load({ id: src.id, name: src.name, site: src.site, url: c.url }).then(r => ({ id: c.id, ok: r.ok, count: r.items.length, newest: r.items.reduce((m, i) => (i.d && i.d > m ? i.d : m), '') }))));
      return new Response(JSON.stringify({ group: g.group, channels: rs }), { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=3600', 'Access-Control-Allow-Origin': '*' } });
    }
    if (sp && cp) {
      const src = SOURCES.find(s => s.id === sp), ch = src && src.groups && src.groups.flatMap(g => g.list).find(c => c.id === cp);
      if (!ch) return new Response('{"error":"unknown channel"}', { status: 404, headers: { 'Content-Type': 'application/json' } });
      const r = await load({ id: src.id, name: src.name, site: src.site, url: ch.url });
      return new Response(JSON.stringify({ updated: new Date().toISOString(), source: src.id, channel: { id: ch.id, name: ch.name }, ok: r.ok, error: r.error, items: r.items }), { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=600', 'Access-Control-Allow-Origin': '*' } });
    }
    const results = await Promise.all(FEEDS.map(load));
    const items = results.flatMap(r => r.items).sort((a, b) => (b.d || '').localeCompare(a.d || '')).slice(0, TOTAL);
    const body = JSON.stringify({ updated: new Date().toISOString(), sources: results.map(r => ({ id: r.feed.id, name: r.feed.name, site: r.feed.site, groups: (SOURCES.find(s => s.id === r.feed.id) || {}).groups ? SOURCES.find(s => s.id === r.feed.id).groups.map(g => ({ group: g.group, list: g.list.map(c => ({ id: c.id, name: c.name })) })) : null, ok: r.ok, count: r.items.length, error: r.error, img: !!r.img })), items });
    return new Response(body, { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=600', 'Access-Control-Allow-Origin': '*' } });
  },
};
export { parse };
