// Israel Mosaic news worker. Serves /api/news from public RSS and Atom feeds.
// Static pages are served by the assets binding. Only /api/* runs this code first.
const FEEDS = [
  { id: 'toi', name: 'The Times of Israel', url: 'https://www.timesofisrael.com/feed/' },
  { id: 'jpost', name: 'The Jerusalem Post', url: 'https://www.jpost.com/rss/rssfeedsheadlines.aspx' },
  { id: 'ynet', name: 'Ynetnews', url: 'https://www.ynetnews.com/Integration/StoryRss3082.xml' },
  { id: 'jns', name: 'JNS', url: 'https://www.jns.org/feed/' },
  { id: 'israelhayom', name: 'Israel Hayom', url: 'https://www.israelhayom.com/feed/' },
  { id: 'insider', name: 'Israel Insider', url: 'https://israelinsider.org/feed/' },
];
const PER_FEED = 12, TOTAL = 72, TIMEOUT = 8000;

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', hellip: '…', ndash: '–', mdash: '—' };
function decode(s) {
  return s.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') { const n = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10); try { return String.fromCodePoint(n); } catch { return ''; } }
    return ENT[e.toLowerCase()] ?? m;
  });
}
function unwrap(s) { return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1'); }
function text(s) { return decode(unwrap(s || '').replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim(); }
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
  const raw = unwrap(block);
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
    items.push({ s: feed.id, src: feed.name, t: title, u: link, d: t && !isNaN(t) ? t.toISOString() : null, x: blurb(text(desc), title), i: image(b) });
  }
  return items;
}
async function load(feed) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), TIMEOUT);
  try {
    const r = await fetch(feed.url, { signal: ctl.signal, headers: { 'User-Agent': 'IsraelMosaicNews/1.0 (+https://israelinmaps.com/news/)', Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*' }, cf: { cacheTtl: 1800, cacheEverything: true } });
    if (!r.ok) return { feed, ok: false, error: 'HTTP ' + r.status, items: [] };
    const items = parse(await r.text(), feed);
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
    const results = await Promise.all(FEEDS.map(load));
    const items = results.flatMap(r => r.items).sort((a, b) => (b.d || '').localeCompare(a.d || '')).slice(0, TOTAL);
    const body = JSON.stringify({ updated: new Date().toISOString(), sources: results.map(r => ({ id: r.feed.id, name: r.feed.name, ok: r.ok, count: r.items.length, error: r.error, img: !!r.img })), items });
    return new Response(body, { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=600', 'Access-Control-Allow-Origin': '*' } });
  },
};
export { parse };
