#!/usr/bin/env python3
"""Builds the Hebrew Wordplay section from tools/wordplay.json.

Writes /g/<slug>/ pages and the /wordplay/ hub, adds the nav link to every page and
subnav.json, adds cards and a category button to /glossary/, and adds rows to
search.json and sitemap.xml. Safe to run again. Run from the repo root:
    python3 -I tools/wordplay.py
"""
import json, os, re, html, glob, unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
E = lambda s: html.escape(s, quote=True)
D = json.load(open(os.path.join(ROOT, 'tools', 'wordplay.json'), encoding='utf-8'))
SEC = D['section']
CAT = 'hebrew-wordplay'
ENT = D['entries']
glos = {g[1]: g[0] for g in json.load(open(os.path.join(ROOT, 'glossary.json'), encoding='utf-8'))}


def rd(p): return open(os.path.join(ROOT, p), encoding='utf-8').read()
def wr(p, s):
    full = os.path.join(ROOT, p)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    open(full, 'w', encoding='utf-8').write(s)


def plain(s): return re.sub(r'<[^>]+>', '', html.unescape(s))


# ---------- entry pages (template: an existing extra entry page)
T = rd('g/philistia/index.html')
art0, art1 = T.index('<article class="gl">'), T.index('</article>') + len('</article>')


def head(t, title, desc, url):
    t = re.sub(r'<title>.*?</title>', f'<title>{E(title)} | Israel NOWlej</title>', t, 1)
    t = re.sub(r'(<meta name="description" content=")[^"]*', r'\g<1>' + E(desc), t, 1)
    t = re.sub(r'(<link rel="canonical" href=")[^"]*', r'\g<1>' + url, t, 1)
    t = re.sub(r'(<meta property="og:title" content=")[^"]*', r'\g<1>' + E(title) + ' | Israel NOWlej', t, 1)
    t = re.sub(r'(<meta property="og:description" content=")[^"]*', r'\g<1>' + E(desc), t, 1)
    return t


def entry_page(e):
    sl = e['slug']
    see = ' · '.join(f'<a href="/g/{s}/">{E(glos[s])}</a>' for s in e['see'] if s in glos)
    see = (see + ' · ' if see else '') + f'<a href="/wordplay/">More {SEC}</a>'
    art = f'''<article class="gl"><header class="ih"><h1>{E(e["title"])} <span class="he" lang="he" dir="rtl">{e["he"]}</span></h1><p class="meta">{SEC}</p></header>
<p class="lead edef" id="e-def">{e["def"]}<a class="econt" href="#e-summary" hidden>Continue &#9656;</a></p>
<nav class="esec" id="esec" aria-label="On this page"><a href="#e-images" data-s="e-images" hidden>Images</a><a href="#e-video" data-s="e-video" hidden>Video</a><a href="#e-summary" data-s="e-summary" hidden>More NOWlej</a><a href="#e-related">Related</a><a href="#e-sources">Sources</a></nav>
<section id="e-images" hidden data-name=""><div class="egal" id="e-gal"></div><p class="small">Photographs from Wikimedia Commons. Click an image to enlarge it. Author and license are shown with each.</p></section>
<section id="e-video" data-slug="{sl}" data-name="{E(e["title"])}" data-pins="[]" data-pls="[]" hidden><div class="vtop" id="e-player"></div><div class="vthumbs"></div><div class="vtop plp" id="e-plplayer" hidden></div><div class="tgrid"></div><div class="epl"></div></section>
<section id="e-summary" hidden><h2>MORE NOWLEJ</h2>
</section>
<section id="e-related"><h2>Related</h2>
<p><b>See also</b> {see}</p>
<div id="gl-news" data-slug="{sl}" hidden><h3>In the news</h3><div class="ngrid"></div><ul class="hlist"></ul><p class="small">Headlines and links from public news feeds. <a href="/news/">All news</a>.</p></div></section>
<section id="e-sources"><h2>Sources</h2><ul class="esrc" id="e-src"><li>Written for this site from standard reference works on Hebrew and the Bible.</li></ul></section></article>'''
    page = head(T[:art0], e['title'], e['card'], f'https://israelnowlej.com/g/{sl}/') + art + T[art1:]
    wr(f'g/{sl}/index.html', page)


for e in ENT:
    entry_page(e)

# ---------- hub page (template: the Charts hub, minus its second nav row)
H = rd('charts/index.html')
i0 = H.index('<div class="newsmain">') + len('<div class="newsmain">')
i1 = H.rindex('<div class="adslot" data-slot="lb-bottom"')
pre, post = H[:i0], H[i1:]
pre = re.sub(r'<div class="wrap subnav sub2".*?</div>', '', pre, 1, flags=re.S)
pre = head(pre, SEC, D['intro'], 'https://israelnowlej.com/wordplay/')
pre = re.sub(r'<meta property="og:image"[^>]*>', '', pre)


def card(e, with_data=True):
    L = e['title'][0].upper()
    he = f'<span class="he" lang="he" dir="rtl">{e["he"]}</span>'
    n = f'{e["title"]} {e["he"]} {e["card"]}'.lower()
    return (f'<a class="gcard" href="/g/{e["slug"]}/" data-c="{CAT}" data-n="{E(n)}"><span class="gimg"><span class="tile c-{CAT}"><b>{L}</b></span></span>'
            f'<span class="gb"><span class="gcat c-{CAT}">{SEC}</span><b>{E(e["title"])}</b>{he}<span class="gd">{E(e["card"])}</span></span></a>')


hub = (f'<div class="hubslide"><h1>{SEC}</h1><p class="lead">{E(D["intro"])}</p><div class="ggrid">'
       + ''.join(card(e) for e in ENT) + '</div></div>')
wr('wordplay/index.html', pre + hub + post)

# ---------- nav link on every page, and subnav.json
OLD = '<a href="/about/">Book</a><a href="/glossary/">A-Z</a>'
NEW = f'<a href="/about/">Book</a><a href="/wordplay/">{SEC}</a><a href="/glossary/">A-Z</a>'
n = 0
for dp, dn, fn in os.walk(ROOT):
    if '.git' in dp.split(os.sep): continue
    for f in fn:
        if f.endswith('.html'):
            p = os.path.join(dp, f)
            s = open(p, encoding='utf-8').read()
            if OLD in s and NEW not in s:
                open(p, 'w', encoding='utf-8').write(s.replace(OLD, NEW)); n += 1
print('nav updated on', n, 'pages')
for p in ('subnav.json', 'tools/subnav.json'):
    s = rd(p)
    if '/wordplay/' not in s:
        s = s.replace('["Book", "/about/"], ["Books", "/books/"], ["A-Z", "/glossary/"]',
                      f'["Book", "/about/"], ["Books", "/books/"], ["{SEC}", "/wordplay/"], ["A-Z", "/glossary/"]')
        wr(p, s)

# ---------- glossary A-Z page: category button, count, cards
G = rd('glossary/index.html')
if f'data-c="{CAT}" aria-pressed' not in G:
    m = re.search(r'<button type="button" data-c="" aria-pressed="true">All <i>(\d+)</i></button>', G)
    G = G.replace(m.group(0), m.group(0).replace(m.group(1), str(int(m.group(1)) + len(ENT))))
    k = G.index('</div><p class="az" id="gaz">')
    G = G[:k] + f'<button type="button" data-c="{CAT}" aria-pressed="false">{SEC} <i>{len(ENT)}</i></button>' + G[k:]
for e in ENT:
    if f'href="/g/{e["slug"]}/"' in G: continue
    L = e['title'][0].upper()
    a = G.index(f'<section class="gsec" data-l="{L}">')
    b = G.index('</div></section>', a)
    grid = G[a:b]
    key = f'{e["title"]} {e["he"]}'.lower()
    pos = None
    for m in re.finditer(r'<a class="gcard" href="[^"]+" data-c="[^"]*" data-n="([^"]*)"', grid):
        if m.group(1) > key:
            pos = m.start(); break
    ins = card(e)
    grid = grid[:pos] + ins + grid[pos:] if pos is not None else grid + ins
    G = G[:a] + grid + G[b:]
wr('glossary/index.html', G)

# ---------- search.json and sitemap.xml
S = json.load(open(os.path.join(ROOT, 'search.json'), encoding='utf-8'))
have = {r['u'] for r in S}
for e in ENT:
    u = f'/g/{e["slug"]}/'
    if u not in have:
        S.append({'t': f'{e["title"]} {e["he"]}', 'u': u, 'k': 'GLOSSARY', 's': SEC, 'x': plain(e['def'])[:300]})
if '/wordplay/' not in have:
    S.append({'t': SEC, 'u': '/wordplay/', 'k': 'GLOSSARY', 's': SEC, 'x': D['intro']})
json.dump(S, open(os.path.join(ROOT, 'search.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
M = rd('sitemap.xml')
add = ''.join(f'<url><loc>https://israelnowlej.com{u}</loc></url>\n' for u in ['/wordplay/'] + [f'/g/{e["slug"]}/' for e in ENT] if f'<loc>https://israelnowlej.com{u}</loc>' not in M)
if add: wr('sitemap.xml', M.replace('</urlset>', add + '</urlset>'))
print('done', len(ENT), 'entries')
