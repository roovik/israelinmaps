"""Build web pages for new timelines from an existing timeline page used as a template.
Usage (repo root): python3 tools/newtimelines/build_pages.py DATAMODULE TEMPLATE_DIR PREV_URL PREV_TITLE NEXT_URL NEXT_TITLE
Images must already be at img/tl-<id>.webp and img/t/tlf-tl-<id>.webp."""
import sys, re, html, os, importlib, json
sys.path.insert(0, os.path.dirname(__file__))
mod, tdir, pu, pt, nu, nt = sys.argv[1:7]
PAGES = importlib.import_module(mod).PAGES
T = open(f'timelines/{tdir}/index.html', encoding='utf-8').read()
tid0 = tdir.split('/')[0]
seq = [(pu, pt)] + [(f"/timelines/{P['id']}/{P['slug']}/", P['title']) for P in PAGES] + [(nu, nt)]
def sub1(pat, rep, s):
    s2, n = re.subn(pat, lambda m: rep, s, count=1, flags=re.S); assert n == 1, pat; return s2
for i, P in enumerate(PAGES):
    t, tid = P['title'], P['id']; url = f"/timelines/{tid}/{P['slug']}/"; rng = P.get('rng') or f"{P['y0']} to {P['y1']}"
    s = T
    s = sub1(r'<title>.*?</title>', f'<title>{t} | Israel NOWlej</title>', s)
    desc = f'{t} (TL-{tid}), timeline from Israel NOWlej, {rng}.'
    s = re.sub(r'(name="description" content=")[^"]*', lambda m: m.group(1) + desc, s, count=1)
    s = re.sub(r'(property="og:description" content=")[^"]*', lambda m: m.group(1) + desc, s, count=1)
    s = re.sub(r'(property="og:title" content=")[^"]*', lambda m: m.group(1) + f'{t} | Israel NOWlej', s, count=1)
    s = re.sub(r'(rel="canonical" href=")[^"]*', lambda m: m.group(1) + 'https://israelnowlej.com' + url, s, count=1)
    s = re.sub(r'/img/p\d+\.webp', f'/img/tl-{tid}.webp', s)
    s = sub1(r'<h1>.*?</h1>', f'<h1>{t}</h1>', s)
    s = re.sub(r'(<div class="pages single">.*?alt=")[^"]*', lambda m: m.group(1) + t, s, count=1, flags=re.S)
    s = re.sub(r'Israel NOWlej \(2027\), TL-' + tid0 + r', p\. \d+, israelnowlej\.com/tl-' + tid0, f'Israel NOWlej (2027), TL-{tid}, israelnowlej.com/tl-{tid}', s)
    s = s.replace(f'<a href="/tl-{tid0}">israelnowlej.com/tl-{tid0}</a>', f'<a href="/tl-{tid}">israelnowlej.com/tl-{tid}</a>')
    p, n = seq[i], seq[i + 2]
    s = sub1(r'<nav class="pn".*?</nav>', f'<nav class="pn" aria-label="Previous and next"><a class="prev" href="{p[0]}"><span>Previous</span>{html.escape(p[1])}</a><a class="next" href="{n[0]}"><span>Next</span>{html.escape(n[1])}</a></nav>', s)
    txt = [f'TIMELINE {tid.lstrip("0").upper()}', t, rng, P['intro'], 'TURNING POINTS'] + [f'{a} {h} {x}' for a, _, _, h, x in sorted(P['tp'], key=lambda z: z[1])] + ['ALSO IN THIS PERIOD'] + [f'{a} {x}' for a, _, _, x in sorted(P['also'], key=lambda z: z[1])]
    s = sub1(r'<details class="txt">.*?</details>', '<details class="txt"><summary>Text of this page</summary>' + ''.join(f'<p>{html.escape(x, quote=False)}</p>' for x in txt) + '</details>', s)
    s = sub1(r'<p class="small">Corrections:.*?</p>', '<p class="small">Corrections: none recorded. This is the current version.</p>', s)
    os.makedirs(f'timelines/{tid}/{P["slug"]}', exist_ok=True)
    open(f'timelines/{tid}/{P["slug"]}/index.html', 'w', encoding='utf-8').write(s)
# relink neighbours
def relink(path, cls, u, title):
    f = 'timelines' + path + 'index.html'; s = open(f, encoding='utf-8').read()
    s = sub1(rf'<a class="{cls}" href="[^"]*"><span>(Previous|Next)</span>[^<]*</a>', f'<a class="{cls}" href="{u}"><span>{"Previous" if cls=="prev" else "Next"}</span>{html.escape(title)}</a>', s)
    open(f, 'w', encoding='utf-8').write(s)
relink(pu[len('/timelines'):], 'next', seq[1][0], seq[1][1])
relink(nu[len('/timelines'):], 'prev', seq[-2][0], seq[-2][1])
# short addresses, sitemap, search, timelines grid
r = open('_redirects', encoding='utf-8').read()
for P in PAGES:
    line = f"/tl-{P['id']} /timelines/{P['id']}/{P['slug']}/ 301\n"
    if line not in r: r += line
open('_redirects', 'w', encoding='utf-8').write(r)
sm = open('sitemap.xml', encoding='utf-8').read()
for P in PAGES:
    u = f'<url><loc>https://israelnowlej.com/timelines/{P["id"]}/{P["slug"]}/</loc></url>'
    if u not in sm: sm = sm.replace('</urlset>', u + '</urlset>')
open('sitemap.xml', 'w', encoding='utf-8').write(sm)
L = json.load(open('search.json', encoding='utf-8'))
L = [e for e in L if not any(e.get('u') == f"/timelines/{P['id']}/{P['slug']}/" for P in PAGES)]
k = [j for j, e in enumerate(L) if e.get('u', '').startswith(f'/timelines/{tid0}/')][0]
L[k + 1:k + 1] = [{'t': P['title'], 'u': f"/timelines/{P['id']}/{P['slug']}/", 'k': 'TL-' + P['id'], 's': 'Timelines',
                   'x': ' '.join([P['title'], P.get('rng') or '', P['intro']] + [f'{a} {h} {x}' for a, _, _, h, x in P['tp']] + [f'{a} {x}' for a, _, _, x in P['also']]),
                   'i': f"/img/t/tlf-tl-{P['id']}.webp"} for P in PAGES]
json.dump(L, open('search.json', 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
g = open('timelines/index.html', encoding='utf-8').read()
mt = re.search(r'<a class="tltile" href="/timelines/' + tid0 + r'/[^"]*".*?</a>', g, re.S)
if mt and f'/timelines/{PAGES[0]["id"]}/' not in g:
    tile = mt.group(0)
    g = g.replace(tile, tile + ''.join(f'<a class="tltile" href="/timelines/{P["id"]}/{P["slug"]}/" title="{P["title"]}"><img src="/img/t/tlf-tl-{P["id"]}.webp" alt="{P["title"]}" width="420" height="525" loading="lazy"></a>' for P in PAGES))
    g = g.replace(tile, '', 1) if '--keep' not in sys.argv else g
open('timelines/index.html', 'w', encoding='utf-8').write(g)
print('built', [P['id'] for P in PAGES])
