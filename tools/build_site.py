#!/usr/bin/env python3
"""Israel Mosaic website generator.
Usage: python3 -I tools/build_site.py <interior.pdf> <master.pdf> <identifiers.csv> <qr-table.csv> <entries_raw.json> <outdir>
Reads the book PDF text, the identifiers table and the glossary, and writes a static site."""
import sys, os, re, csv, json, html, shutil, unicodedata
import pymupdf

PDF, MASTER, IDS, QR, IDXJSON, OUT = sys.argv[1:7]
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
E = html.escape

def slugify(s):
    s = s.replace('’', '').replace("'", '').replace('&', ' and ')
    s = re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')
    return s

def nbsp(t): return t.replace('\xa0', ' ').replace('­', '')

GENERATED = ['maps', 'timelines', 'tables', 'population', 'demographics', 'rankings', 'top-ten', 'tour', 'flora', 'g', 'glossary', 'index', 'size', 'about', 'search', 'news']
for d_ in GENERATED:
    shutil.rmtree(os.path.join(OUT, d_), ignore_errors=True)
shutil.rmtree(os.path.join(OUT, 'img', 's'), ignore_errors=True)
# ---------------------------------------------------------------- identifiers
rows = list(csv.DictReader(open(IDS, encoding='utf-8')))
for r in rows:
    r['pages'] = [int(x) for x in re.split(r'-', r['page'])] if r['page'] else []
    if len(r['pages']) == 2: r['pages'] = list(range(r['pages'][0], r['pages'][1] + 1))
    r['pfirst'] = r['pages'][0]
    r['prefix'], r['num'] = r['id'].split('-')
byid = {r['id']: r for r in rows}

SECT = {  # prefix -> (folder, short hub, hub title)
    'MAP': ('maps', 'map', 'Maps'), 'TL': ('timelines', 'tl', 'Timelines'), 'TBL': ('tables', 'tbl', 'Tables'),
    'POP': ('population', 'pop', 'Population and Territory'), 'DEM': ('demographics', 'dem', 'Demographics'),
    'RNK': ('rankings', 'rnk', 'Israel Rankings'), 'TOP': ('top-ten', 'top', 'Top Ten Lists'),
}
TOUR = {'NEG', 'DSE', 'JUS', 'GAL', 'GOL', 'MED', 'TAJ', 'JHL', 'JRS', 'SHF'}
FLORA = {'TRE', 'WFL', 'WLD', 'BRD', 'MIG'}

def region_slug(title):
    t = re.sub(r'^The ', '', title)
    return slugify(t)

secslug = {}
for r in rows:
    if r['prefix'] in TOUR and r['num'] == '00': secslug[r['prefix']] = region_slug(r['title'])
    if r['prefix'] in FLORA and r['num'] == '00': secslug[r['prefix']] = slugify(r['title'])

for r in rows:
    p = r['prefix']; slug = slugify(r['title'])
    if p in SECT:
        f = SECT[p][0]
        r['url'] = f'/{f}/{r["num"]}/{slug}/' if p != 'POP' else f'/{f}/{r["num"]}/{slug}/'
    elif p in TOUR:
        r['url'] = f'/tour/{secslug[p]}/' if r['num'] == '00' else f'/tour/{secslug[p]}/{slug}/'
    elif p in FLORA:
        r['url'] = f'/flora/{secslug[p]}/' if r['num'] == '00' else f'/flora/{secslug[p]}/{slug}/'
    r['short'] = '/' + r['id'].lower()
    r['slug'] = slug
    r['is_section'] = r['num'] == '00'
urls = [r['url'] for r in rows]
assert len(set(urls)) == len(urls), 'duplicate urls'

# ---------------------------------------------------------------- PDF text
doc = pymupdf.open(PDF); mdoc = pymupdf.open(MASTER)

def fix_km(t):
    t = re.sub(r'(\d{1,3}(?:,\d{3})+) km\b(?!²)', r'\1 km²', t)
    t = re.sub(r'\bkm (for Israel|with Judea)', r'km² \1', t)
    t = t.replace('Square miles are km divided', 'Square miles are km² divided')
    t = t.replace('21.9 K km and 15.06 M km', '21.9 K km² and 15.06 M km²')
    return t

DROP = re.compile(r'^(Illustration, AI generated|ISRAEL IN MAPS|©.*Koret.*|.*israelinmaps\.com.*|\d+)$')
def page_text(p):
    pg = doc[p - 1]
    paras = []
    for b in pg.get_text('blocks'):
        if b[6] != 0: continue
        t = nbsp(b[4]).strip()
        lines = [l.strip() for l in t.split('\n') if l.strip()]
        lines = [l for l in lines if not DROP.match(l)]
        if not lines: continue
        paras.append(fix_km(' '.join(lines)))
    return paras

# ---------------------------------------------------------------- glossary
def parse_glossary():
    S = []
    cur = None
    def txt(l): return nbsp(''.join(s['text'] for s in l['spans']))
    for p in range(173, 210):
        src = mdoc if p == 192 else doc; sc = 0.97 if p == 192 else 1.0
        pg = src[p - 1]
        lines = [l for b in pg.get_text('dict')['blocks'] if b['type'] == 0 for l in b['lines']]
        for l in lines:
            sp = l['spans']; size = round(sp[0]['size'] * sc, 1); full = txt(l).strip()
            if not full or full.startswith('©') or full.startswith('Illustration') or 'israelinmaps.com' in full: continue
            if size == 10.2 and 'Bo' in sp[0]['font']:
                name = nbsp(sp[0]['text']).strip()
                hes = [s['text'] for s in sp if round(s['size'] * sc, 1) == 9.2]
                cat = ''.join(s['text'] for s in sp if round(s['size'] * sc, 1) == 6.3).strip()
                rest = nbsp(''.join(s['text'] for s in sp[1:] if round(s['size'] * sc, 1) not in (9.2, 6.3))).strip()
                if cur and not cur['segs'] and not cur['he'] and not cur['cat'] and not cur.get('cf'):
                    cur['name'] += ' ' + name; cur['he'] = ' '.join(hes).strip(); cur['cat'] = cat; continue
                cur = {'name': name, 'he': ' '.join(hes).strip(), 'cat': cat, 'segs': [], 'see': '', 'app': '', 'pg': p, '_m': 'body'}
                if rest.startswith('cf.'): cur['cf'] = rest[3:].strip()
                S.append(cur)
            elif cur is None: continue
            elif size == 6.3: cur['cat'] = (cur['cat'] + ' ' + full).strip()
            elif size == 8.7 and 'Bo' in sp[0]['font'] and ' cf.' in ' ' + full:
                cur = {'name': nbsp(sp[0]['text']).strip(), 'he': '', 'cat': '', 'segs': [], 'see': '', 'app': '', 'pg': p, '_m': 'body',
                       'cf': full.split('cf.', 1)[1].strip()}
                S.append(cur)
            elif size == 8.7:
                cur['_m'] = 'body'
                # build runs: link spans use the SemiBold font
                run = []
                for s in sp:
                    isl = 'Se' in s['font'].split('-')[-1][:3] or s['font'].endswith('-Se') or 'SemiB' in s['font'] or s['font'].endswith('Se')
                    run.append((nbsp(s['text']), isl))
                cur['segs'].append(run)
                cur['segs'][-1].append(('\n', False))
            elif size == 7.3:
                if full.startswith('See also'): cur['see'] = full[8:].strip(); cur['_m'] = 'see'
                elif full.startswith('Appears in'): cur['app'] = full[10:].strip(); cur['_m'] = 'app'
                elif cur['_m'] in ('see', 'app'): cur[cur['_m']] = (cur[cur['_m']] + ' ' + full).strip()
            elif size == 9.2 and not cur['he']: cur['he'] = full
    return S

G = parse_glossary()
assert sum(1 for g in G if not g.get('cf')) == 407, (len(G), sum(1 for g in G if g.get('cf')))

def invert(name):
    n = name
    if ', ' in n and ' cf.' not in n:
        a, b = n.split(', ', 1)
        n = f'{b} {a}'
    return n

def key(s):
    s = unicodedata.normalize('NFKD', s).lower()
    s = re.sub(r"[^a-z0-9 ]+", ' ', s.replace("'", '').replace('’', ''))
    return ' '.join(s.split())

SLUGFIX = {'first-66-73-ce-revolt': 'first-revolt', 'october-7-attack-2023': 'october-7-2023-attack', 'siege-of-701-bce-jerusalem': 'siege-of-jerusalem-701-bce', 'white-paper-1939': 'white-paper-of-1939', 'rabin-square': 'rabin-kings-of-israel-square'}
used = {}
for g in G:
    g['title'] = invert(g['name'])
    sl = SLUGFIX.get(slugify(g['title']), slugify(g['title']))
    if sl in used: sl += '-2'
    used[sl] = g
    g['slug'] = sl
names = {}
for g in G:
    names[key(g['title'])] = g['slug']; names[key(g['name'])] = g['slug']
    names[tuple(sorted(key(g['title']).split()))] = g['slug']
ALIAS = {'rome': 'romans', 'roman': 'romans', 'jews': None, 'zionist': 'zionism', 'crusader': 'crusaders', 'seljuk': 'seljuk-turks',
         'herod': 'herod-the-great', "herod s": 'herod-the-great', 'maccabees': 'maccabees', 'philistine': 'philistines',
         'sea of galilee': 'sea-of-galilee', 'british': 'british-mandate', 'merneptah': 'pharaoh-merneptah', 'suleiman': 'suleiman-the-magnificent', 'herods': 'herod-the-great',
         'scud missiles': 'scud-attacks', 'alliance israelite universelle': 'alliance-isra-lite-universelle',
         'rabin kings of israel square': 'rabin-kings-of-israel-square', 'white paper of 1939': 'white-paper-of-1939'}
def resolve(label):
    k = key(label)
    if not k: return None
    for cand in (k, k.rstrip('s'), k + 's'):
        if cand in names: return names[cand]
    t = tuple(sorted(k.split()))
    if t in names: return names[t]
    if k in ALIAS and ALIAS[k] in used: return ALIAS[k]
    return None

unresolved = {}
def body_html(g):
    # merge runs across lines
    parts = []
    for run in g['segs']:
        for t, isl in run:
            if t == '\n':
                parts.append((' ', None)); continue
            parts.append((t, isl))
    out = []; buf = ''; mode = False
    def flush():
        nonlocal buf
        if not buf: return
        if mode:
            lab = ' '.join(buf.split())
            sl = resolve(lab)
            if sl and sl != g['slug']: out.append(f'<a href="/g/{sl}/">{E(lab)}</a>')
            else:
                if not sl: unresolved[lab] = unresolved.get(lab, 0) + 1
                out.append(E(lab))
        else: out.append(E(buf))
        buf = ''
    for t, isl in parts:
        if isl is None:  # newline marker
            if mode and buf: buf += ' '
            else: buf += ' '
            continue
        if isl != mode and not (t.strip() == '' and mode):
            flush(); mode = isl
        buf += t
    flush()
    s = ''.join(out)
    return re.sub(r'\s+', ' ', s).strip()

def see_html(g):
    if not g['see']: return ''
    items = [x.strip() for x in g['see'].split('·') if x.strip()]
    o = []
    for it in items:
        sl = resolve(it)
        o.append(f'<a href="/g/{sl}/">{E(invert(it))}</a>' if sl else E(it))
    return ' · '.join(o)

def num_list(s):
    nums = []
    for part in re.split(r',\s*', s):
        m = re.match(r'(\d+)\s*to\s*(\d+)', part.strip())
        if m: nums += list(range(int(m.group(1)), int(m.group(2)) + 1))
        elif part.strip().isdigit(): nums.append(int(part.strip()))
    return nums

TOPMAP = {k: v for k, v in [(r['title'].replace('Ten ', '').lower(), r) for r in rows if r['prefix'] == 'TOP']}
DEMMAP = {}
appears = {}  # item id -> list of glossary slugs
def app_html(g):
    s = g['app']
    if not s: return ''
    out = []
    for seg in [x.strip() for x in s.split('·') if x.strip()]:
        seg = re.sub(r'\s+', ' ', seg)
        m = re.match(r'(Map|Maps|Timeline|Timelines|Table|Tables|Ranking|Rankings|Demographic|Demographics)\s+(.*)$', seg)
        if m:
            kind = m.group(1).rstrip('s'); pref = {'Map': 'MAP', 'Timeline': 'TL', 'Table': 'TBL', 'Ranking': 'RNK', 'Demographic': 'DEM'}[kind]
            links = []
            for n in num_list(m.group(2)):
                rid = f'{pref}-{n:03d}'
                if rid in byid:
                    links.append(f'<a href="{byid[rid]["url"]}">{n}</a>'); appears.setdefault(rid, []).append(g['slug'])
                else: links.append(str(n))
            lab = {'Map': 'Maps', 'Timeline': 'Timelines', 'Table': 'Tables', 'Ranking': 'Rankings', 'Demographic': 'Demographics'}[kind]
            out.append(f'{lab} ' + ', '.join(links))
            continue
        m = re.match(r'Top Ten:\s*(.*)$', seg)
        if m:
            r = TOPMAP.get(m.group(1).lower())
            if r:
                out.append(f'Top Ten: <a href="{r["url"]}">{E(m.group(1))}</a>'); appears.setdefault(r['id'], []).append(g['slug']); continue
        out.append(E(seg))
    return ' · '.join(out)

# ---------------------------------------------------------------- templates
CSS = open(os.path.join(ROOT, 'tools', 'style.css')).read()
NAV = [('/maps/', 'Maps'), ('/timelines/', 'Timelines'), ('/rankings/', 'Rankings'), ('/demographics/', 'Demographics'),
       ('/top-ten/', 'Top Ten'), ('/tour/', 'Tour'), ('/flora/', 'Flora and Fauna'), ('/news/', 'News'), ('/glossary/', 'Glossary'), ('/index/', 'Index')]
BASE = 'https://israelinmaps.com'

def layout(title, body, desc='', path='/', og=None, cls='', nd=False):
    news_js = path == '/news/' or path.startswith('/g/')
    nav = ''.join(f'<a href="{u}">{t}</a>' for u, t in NAV)
    full = f'{title} | Israel Mosaic' if title != 'Israel Mosaic' else 'Israel Mosaic'
    d = desc or 'Maps, graphs, timelines, images, and knowledge of the Holy Land. The companion site to the book Israel Mosaic.'
    img = f'<meta property="og:image" content="{BASE}{og}">' if og else ''
    robots = '<meta name="robots" content="noindex">' if nd else ''
    return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{E(full)}</title><meta name="description" content="{E(d)}">
<link rel="canonical" href="{BASE}{path}"><meta property="og:title" content="{E(full)}"><meta property="og:description" content="{E(d)}">{img}{robots}
<link rel="stylesheet" href="/style.css"></head>
<body class="{cls}"><a class="skip" href="#main">Skip to content</a>
<header class="top"><div class="wrap bar"><a class="brand" href="/">Israel <b>Mosaic</b></a>
<form class="sf" action="/search/" role="search"><input name="q" type="search" placeholder="Search maps, people, places, IDs" aria-label="Search"><button>Search</button></form></div>
<nav class="wrap" aria-label="Sections">{nav}</nav></header>
<main id="main" class="wrap">{body}</main>
<footer><div class="wrap"><p>Israel Mosaic: Maps, Graphs, Timelines, Images, and Knowledge of the Holy Land. By Richard J. Koret.</p>
<p>&copy; 2003 to 2026 Richard J. Koret. All rights reserved. Page images are shown for reference with the book. <a href="/about/">How to use this site and cite it</a></p></div></footer>
<script src="/site.js" defer></script>{'<script src="/news.js" defer></script>' if news_js else ''}</body></html>'''

def write(path, content):
    fp = os.path.join(OUT, path.lstrip('/'))
    if path.endswith('/'): fp = os.path.join(fp, 'index.html')
    os.makedirs(os.path.dirname(fp), exist_ok=True)
    open(fp, 'w', encoding='utf-8').write(content)

def citation(r):
    pg = r['pages']
    p = f'p. {pg[0]}' if len(pg) == 1 else f'pp. {pg[0]} to {pg[-1]}'
    return f'Israel Mosaic (2027), {r["id"]}, {p}, israelinmaps.com/{r["id"].lower()}'

TYPEWORD = {'MAP': 'Map', 'TL': 'Timeline', 'TBL': 'Table', 'POP': 'Infographic', 'DEM': 'Demographics', 'RNK': 'Ranking', 'TOP': 'Top Ten list'}
def ordered_group(r):
    p = r['prefix']
    return p
seq = {}  # prefix -> ordered ids (items only, incl section 00 first)
for r in rows: seq.setdefault(r['prefix'], []).append(r)

def hub_of(r):
    p = r['prefix']
    if p == 'MAP' and int(r['num']) >= 30: return ('/size/', 'Size Comparisons')
    if p == 'TBL' and r['num'] == '001': return ('/size/', 'Size Comparisons')
    if p in SECT: return (f'/{SECT[p][0]}/', SECT[p][2]) if p != 'POP' else ('/size/', 'Size Comparisons')
    if p in TOUR: return ('/tour/', 'A Taste of Israel')
    return ('/flora/', 'Flora and Fauna')

def neighbors(r):
    p = r['prefix']
    lst = seq[p]; i = lst.index(r)
    prev = lst[i - 1] if i > 0 else None
    nxt = lst[i + 1] if i + 1 < len(lst) else None
    return prev, nxt

def imgs_html(r):
    out = []
    for p in r['pages']:
        out.append(f'<a href="/img/p{p:03d}.webp"><img src="/img/p{p:03d}.webp" width="1200" height="1500" alt="Book page {p}: {E(r["title"])}" loading="{"eager" if p == r["pages"][0] else "lazy"}"></a>')
    cls = 'spread' if len(r['pages']) == 2 else ('multi' if len(r['pages']) > 2 else 'single')
    return f'<div class="pages {cls}">' + ''.join(out) + '</div>'


from PIL import Image
import io
def station(r):
    """Return (paras, crop_path) for a tour station or flora entry, else None."""
    if r['is_section'] or not (r['prefix'] in TOUR or r['prefix'] in FLORA): return None
    pgn = r['pfirst']; pg = doc[pgn - 1]
    blocks = [b for b in pg.get_text('blocks') if b[6] == 0]
    def lines(b): return [nbsp(l).strip() for l in b[4].split('\n') if l.strip()]
    title = r['title'].lower().strip()
    start = None
    for i, b in enumerate(blocks):
        L = lines(b)
        if L and L[0].isdigit() and len(L) > 1: L = L[1:]
        if L and not L[0].startswith('Glossary'):
            sth = lambda t: re.sub(r'^the ', '', t.lower().strip()).replace(' the ', ' ')
            if sth(L[0]) == sth(title) or sth(L[0]).startswith(sth(title)): start = i; break
    if start is None: return None
    end = None
    for j in range(start, len(blocks)):
        if lines(blocks[j]) and lines(blocks[j])[0].startswith('Glossary:'): end = j; break
    if end is None: return None
    paras = []
    for b in blocks[start:end + 1]:
        L = lines(b)
        if L and L[0].isdigit(): L = L[1:]
        if not L: continue
        paras.append(' '.join(L))
    x0 = 20; x1 = pg.rect.width - 20
    y0 = min(b[1] for b in blocks[start:end + 1]) - 6; y1 = max(b[3] for b in blocks[start:end + 1]) + 6
    # include neighbouring picture: widen vertically to cover the image beside the text when present
    for im in pg.get_image_info():
        bb = im['bbox']
        if bb[1] < y1 and bb[3] > y0 and bb[3] - bb[1] < 300 and bb[2] - bb[0] < 300:
            y0 = min(y0, bb[1] - 2); y1 = max(y1, bb[3] + 2)
    y0 = max(y0, 40); y1 = min(y1, pg.rect.height - 40)
    clip = pymupdf.Rect(x0, y0, x1, y1)
    os.makedirs(os.path.join(OUT, 'img', 's'), exist_ok=True)
    fn = f'/img/s/{r["id"].lower()}.webp'
    pix = pg.get_pixmap(dpi=190, clip=clip)
    Image.frombytes('RGB', (pix.width, pix.height), pix.samples).save(OUT + fn, quality=80, method=6)
    return paras, fn, pix.width, pix.height

search = []
def stn_html(r, st):
    if not st: return imgs_html(r)
    paras, fn, w, h = st
    pg = r['pfirst']
    return (f'<div class="pages single wide"><a href="{fn}"><img src="{fn}" width="{w}" height="{h}" alt="{E(r["title"])}, from book page {pg}"></a></div>'
            f'<details class="txt"><summary>See the whole book page ({pg})</summary><div class="pages single"><a href="/img/p{pg:03d}.webp"><img src="/img/p{pg:03d}.webp" width="1200" height="1500" alt="Book page {pg}" loading="lazy"></a></div></details>')

def item_page(r):
    hub, hubt = hub_of(r)
    prev, nxt = neighbors(r)
    pg = r['pages']
    ptxt = f'Book page {pg[0]}' if len(pg) == 1 else f'Book pages {pg[0]} to {pg[-1]}'
    paras = []
    for p in pg: paras += page_text(p)
    st = station(r)
    text = ''.join(f'<p>{E(t)}</p>' for t in (st[0] if st else paras))
    cit = citation(r)
    pn = ''
    if prev: pn += f'<a class="prev" href="{prev["url"]}"><span>Previous</span>{E(prev["title"])}</a>'
    if nxt: pn += f'<a class="next" href="{nxt["url"]}"><span>Next</span>{E(nxt["title"])}</a>'
    rel = ''
    if r['id'] in appears:
        sl = sorted(set(appears[r['id']]))
        rel = '<section class="rel"><h2>Glossary entries that mention this item</h2><p>' + ' · '.join(f'<a href="/g/{s}/">{E(used[s]["title"])}</a>' for s in sl) + '</p></section>'
    sub = ''
    if r['is_section']:
        kids = [x for x in rows if x['prefix'] == r['prefix'] and not x['is_section']]
        sub = '<section class="list"><h2>In this section</h2><ul class="idlist">' + ''.join(
            f'<li><a href="{k["url"]}"><b>{k["id"]}</b> {E(k["title"])}</a><span>p. {k["pfirst"]}</span></li>' for k in kids) + '</ul></section>'
    region = ''
    if not r['is_section'] and (r['prefix'] in TOUR or r['prefix'] in FLORA):
        sec = byid[f'{r["prefix"]}-00']
        region = f'<p class="crumb2">Part of <a href="{sec["url"]}">{E(sec["title"])}</a> ({sec["id"]})</p>'
    kind = r['type']
    body = f'''<p class="crumb"><a href="/">Home</a> / <a href="{hub}">{E(hubt)}</a></p>
<article><header class="ih"><span class="id">{r["id"]}</span><h1>{E(r["title"])}</h1>
<p class="meta">{E(kind)} · {E(r["section"])} · {ptxt}</p>{region}</header>
{stn_html(r, st)}
<div class="cite"><p><b>Cite this page</b></p><p class="citeline" id="cite">{E(cit)}</p><button type="button" class="copy" data-copy="{E(cit)}">Copy citation</button>
<p class="small">Short address: <a href="{r["short"]}">israelinmaps.com{r["short"]}</a></p></div>
{sub}{rel}
<nav class="pn" aria-label="Previous and next">{pn}</nav>
<details class="txt"><summary>Text of this page</summary>{text}</details>
<p class="small">Corrections: none recorded. This is the current version. The 2027 print edition copy is at <a href="/2027{r["short"]}">israelinmaps.com/2027{r["short"]}</a>.</p></article>'''
    desc = f'{r["title"]} ({r["id"]}), {kind.lower()} from Israel Mosaic, book page {pg[0]}.'
    write(r['url'], layout(r['title'], body, desc, r['url'], f'/img/p{pg[0]:03d}.webp'))
    search.append({'t': r['title'], 'u': r['url'], 'k': r['id'], 's': r['section'], 'x': (' '.join(st[0]) if st else ' '.join(paras))[:600]})

for r in rows: item_page(r)

# ---------------------------------------------------------------- glossary pages
bycat = {}
def gl_page(g):
    sl = g['slug']
    if g.get('cf'):
        tgt = resolve(g['cf'])
        link = f'<a href="/g/{tgt}/">{E(invert(g["cf"]))}</a>' if tgt else E(g['cf'])
        body = f'<p class="crumb"><a href="/">Home</a> / <a href="/glossary/">Glossary</a></p><article><h1>{E(g["title"])}</h1><p class="lead">See {link}.</p></article>'
        write(f'/g/{sl}/', layout(g['title'], body, f'{g["title"]}: see {g["cf"]}.', f'/g/{sl}/'))
        search.append({'t': g['title'], 'u': f'/g/{sl}/', 'k': 'GLOSSARY', 's': 'see ' + g['cf'], 'x': ''})
        return
    b = body_html(g)
    if sl == 'judea-and-samaria':
        b += ' Also called the West Bank, a name from the Jordanian occupation of 1948 to 1967, which almost no country recognized. Israel has used the biblical names since 1967.'
    he = f'<span class="he" lang="he" dir="rtl">{E(g["he"])}</span>' if g['he'] else ''
    cat = E(g['cat'].title().replace(' And ', ' and ')) if g['cat'] else ''
    see = see_html(g); app = app_html(g)
    plain = re.sub(r'<[^>]+>', '', b)
    body = f'''<p class="crumb"><a href="/">Home</a> / <a href="/glossary/">Glossary</a></p>
<article class="gl"><header class="ih"><span class="id">GLOSSARY · book page {g["pg"]}</span><h1>{E(g["title"])} {he}</h1><p class="meta">{cat}</p></header>
<p class="lead">{b}</p>
{f'<p><b>See also</b> {see}</p>' if see else ''}{f'<p><b>Appears in</b> {app}</p>' if app else ''}
<p class="small"><a href="/gl-{g["pg"]}">This entry is on book page {g["pg"]}</a> of the glossary.</p>
<section id="gl-news" data-slug="{sl}" hidden><h2>In the news</h2><div class="ngrid"></div><ul class="hlist"></ul><p class="small">Headlines and links from public news feeds. <a href="/news/">All news</a>.</p></section></article>'''
    write(f'/g/{sl}/', layout(g['title'], body, plain[:155], f'/g/{sl}/'))
    search.append({'t': g['title'] + (f' {g["he"]}' if g['he'] else ''), 'u': f'/g/{sl}/', 'k': 'GLOSSARY', 's': cat, 'x': plain[:300]})
    bycat.setdefault(g['cat'] or 'OTHER', []).append(g)

for g in G: gl_page(g)

# glossary hub
letters = {}
for g in sorted(G, key=lambda g: key(g['name'])):
    letters.setdefault(key(g['name'])[0].upper(), []).append(g)
gh = '<p class="crumb"><a href="/">Home</a> / Glossary</p><h1>Glossary</h1><p class="lead">People, places, events, works and buildings in the maps and timelines. Entries are on book pages 173 to 209.</p>'
gh += '<p class="az">' + ' '.join(f'<a href="#l{L}">{L}</a>' for L in letters) + '</p>'
for L, lst in letters.items():
    gh += f'<h2 id="l{L}">{L}</h2><ul class="glist">' + ''.join(
        f'<li><a href="/g/{g["slug"]}/">{E(g["name"])}</a>' + (f' <span class="he" lang="he" dir="rtl">{E(g["he"])}</span>' if g['he'] else '') + (f' <i>{E("cf. " + g["cf"])}</i>' if g.get('cf') else '') + '</li>' for g in lst) + '</ul>'
write('/glossary/', layout('Glossary', gh, 'The Israel Mosaic glossary: 407 entries on people, places, events, works and buildings.', '/glossary/'))

# ---------------------------------------------------------------- hubs
def hub(path, title, intro, groups):
    b = f'<p class="crumb"><a href="/">Home</a> / {E(title)}</p><h1>{E(title)}</h1><p class="lead">{intro}</p>'
    for gt, items in groups:
        if gt: b += f'<h2>{E(gt)}</h2>'
        b += '<ul class="idlist">' + ''.join(
            f'<li><a href="{k["url"]}"><b>{k["id"]}</b> {E(k["title"])}</a><span>p. {k["pfirst"]}</span></li>' for k in items) + '</ul>'
    write(path, layout(title, b, intro, path))

def items(prefix, pred=lambda r: True): return [r for r in rows if r['prefix'] == prefix and pred(r)]
hub('/maps/', 'Maps', 'Thirty-three maps of the land from the patriarchs to today. Every map has its own address, such as israelinmaps.com/map-002.',
    [('Historical Maps', [r for r in rows if r['prefix'] == 'MAP' and int(r['num']) < 30]), ('Size Comparisons', [r for r in rows if r['prefix'] == 'MAP' and int(r['num']) >= 30])])
hub('/timelines/', 'Timelines', 'Nineteen timelines from the patriarchs to the present.', [('', items('TL'))])
hub('/tables/', 'Tables', 'Reference tables: Israel compared in numbers, Knesset elections, prime ministers, wars and operations, and summits and territorial changes.', [('', items('TBL'))])
hub('/demographics/', 'Demographics', 'Population, religion, language, fertility and other graphics.', [('', items('DEM'))])
hub('/rankings/', 'Israel Rankings', 'How Israel compares with the Arab League, Iran and Europe, and with the world.', [('', items('RNK'))])
hub('/top-ten/', 'Top Ten Lists', 'Six lists: politicians, terror attacks, musicians, painters, Nobel Prize winners and authors.', [('', items('TOP'))])
hub('/size/', 'Size Comparisons', 'Israel set beside other places, with one table and one population graphic.',
    [('', [r for r in rows if hub_of(r)[0] == '/size/'])])
tour_groups = []
for p in ['NEG', 'DSE', 'JUS', 'GAL', 'GOL', 'MED', 'TAJ', 'JHL', 'JRS', 'SHF']:
    tour_groups.append((byid[p + '-00']['title'], [r for r in rows if r['prefix'] == p]))
hub('/tour/', 'A Taste of Israel', 'A tour of the sites of Israel in ten regions, from the Negev to the Golan. Each region and each stop has its own address.', tour_groups)
fl = [(byid[p + '-00']['title'], [r for r in rows if r['prefix'] == p]) for p in ['TRE', 'WFL', 'WLD', 'BRD', 'MIG']]
hub('/flora/', 'Flora and Fauna', 'Trees, wildflowers, wildlife and birds of Israel, including the migrating birds.', fl)

# ---------------------------------------------------------------- index page
idx = json.load(open(IDXJSON))
pageitem = {}
for r in rows:
    for p in r['pages']:
        pageitem.setdefault(p, r)
def plink(p):
    if p in pageitem and not (173 <= p <= 209):
        return f'<a href="{pageitem[p]["url"]}">{p}</a>'
    if 173 <= p <= 209: return f'<a href="/gl-{p}">{p}</a>'
    return str(p)
ib = '<p class="crumb"><a href="/">Home</a> / Index</p><h1>Index</h1><p class="lead">The book index. Page numbers link to the item on that page.</p><ul class="ix">'
for e in idx:
    pgs = ', '.join(plink(p) for p in e.get('pages', []))
    he = f' <span class="he" lang="he" dir="rtl">{E(e["he"])}</span>' if e.get('he') else ''
    ib += f'<li><b>{E(e["head"])}</b>{he} {pgs}</li>'
ib += '</ul>'
write('/index/', layout('Index', ib, 'Index of the book Israel Mosaic.', '/index/'))

# ---------------------------------------------------------------- about, search, 404, home
about = '''<p class="crumb"><a href="/">Home</a> / About</p><h1>How to Use This Site</h1>
<p class="lead">Every item in the book has one permanent ID, for example MAP-002 or TL-004. The ID is the address.</p>
<h2>Addresses</h2><p>Type <b>israelinmaps.com/map-002</b> in any browser. It redirects to the full page, <b>israelinmaps.com/maps/002/zion-terrain</b>. If a title is ever corrected the full address may change. The ID and the short address never change.</p>
<h2>Hubs</h2><p>A bare prefix opens the whole group: /map, /tl, /tbl, /dem, /rnk, /top, /size, /tour, /flora, /gl. The glossary is at /glossary and the book index at /index.</p>
<h2>Cite a page</h2><p>Each page shows a citation line and a Copy citation button, for example: Israel Mosaic (2027), MAP-002, p. 6, israelinmaps.com/map-002. The ID is enough for any later edition. The page number fits the 2027 print edition only.</p>
<h2>Editions</h2><p>The short address always shows the current version. Each edition also keeps a frozen copy, for example /2027/map-002, so a citation from the 2027 book can be checked against what the book showed. Corrections are listed on the page with a date.</p>
<h2>Scanning a code</h2><p>Each code in the book encodes the same short address. If a code is damaged, type the address printed beside it.</p>
<h2>About the book</h2><p>Israel Mosaic: Maps, Graphs, Timelines, Images, and Knowledge of the Holy Land, by Richard J. Koret. This site is the companion to the book. Some illustrations in the book are marked as AI generated.</p>'''
write('/about/', layout('How to Use This Site', about, 'Addresses, IDs, hubs and how to cite a page of Israel Mosaic.', '/about/'))

sb = '''<h1>Search</h1><form class="sf big" action="/search/" role="search"><input id="q" name="q" type="search" placeholder="Try map-002, Masada, Rabin, olive" aria-label="Search" autofocus><button>Search</button></form>
<p class="small">Searches titles, IDs, glossary entries and page text.</p><ul class="results" id="results"></ul>'''
write('/search/', layout('Search', sb, 'Search Israel Mosaic.', '/search/', nd=True))
nf = '''<h1>That address is not here</h1><p class="lead">It may be a typing slip or an ID from a later edition. Search for it below, or browse from the home page.</p>
<form class="sf big" action="/search/" role="search"><input id="q" name="q" type="search" aria-label="Search" placeholder="Search maps, people, places, IDs"><button>Search</button></form>
<ul class="results" id="results"></ul><p><a href="/">Go to the home page</a></p>'''
write('/404.html', layout('Not found', nf, 'Not found', '/404.html', nd=True, cls='nf'))

home_cards = [('/maps/', 'Maps', '33 maps'), ('/timelines/', 'Timelines', '19 timelines'), ('/rankings/', 'Rankings', '17 rankings'),
              ('/demographics/', 'Demographics', '13 graphics'), ('/top-ten/', 'Top Ten Lists', '6 lists'), ('/size/', 'Size Comparisons', 'Israel beside other places'),
              ('/tables/', 'Tables', '5 reference tables'), ('/tour/', 'A Taste of Israel', '10 regions, 71 stops'), ('/flora/', 'Flora and Fauna', '5 sections, 60 entries'),
              ('/glossary/', 'Glossary', '407 entries'), ('/index/', 'Index', 'Find any name or place')]
cards = ''.join(f'<a class="card" href="{u}"><b>{t}</b><span>{d}</span></a>' for u, t, d in home_cards)
home = f'''<section class="hero"><h1>Israel <b>Mosaic</b></h1><p class="sub">Maps, Graphs, Timelines, Images, and Knowledge of the Holy Land</p>
<p class="lead">The companion site to the book. Every map, chart, timeline and list in the book has its own page here, with a permanent ID you can type, cite or scan.</p>
<form class="sf big" action="/search/" role="search"><input name="q" type="search" placeholder="Search, or type an ID such as MAP-002" aria-label="Search"><button>Search</button></form></section>
<div class="cards">{cards}</div>
<p class="small">New here? <a href="/about/">How the addresses and citations work</a>.</p>'''
write('/', layout('Israel Mosaic', home, '', '/', '/img/p006.webp', cls='home'))

news = '''<div class="ticker" id="news-ticker" aria-label="Latest headlines ticker" hidden></div><p class="crumb"><a href="/">Home</a> / News</p><h1>In the News</h1>
<p class="lead">Headlines from public news feeds, matched to the glossary. Each item links to its publisher.</p>
<div class="newsgrid"><div class="newsmain">
<div class="nfilter" id="news-filter" aria-label="Filter by source"></div>
<div class="nchan" id="news-channels" hidden></div>
<p class="ngl"><label><input type="checkbox" id="news-glonly"> Only stories that mention a glossary entry</label></p>
<div class="ngrid3" id="news-grid"><p>Loading the latest headlines.</p></div>
<h2 id="news-more-title" class="nmt" hidden>More headlines</h2><ul class="hlist" id="news-more"></ul></div>
<aside class="newsside" aria-label="Latest headlines"><div id="news-latest"></div><h2>By source</h2><div id="news-widget"></div></aside></div>
<p class="small" id="news-status"></p>'''
write('/news/', layout('News', news, 'Headlines from public news feeds about Israel, linked to the Israel Mosaic glossary.', '/news/', cls='newspg'))
gjson = []
for g in G:
    if g.get('cf'):
        tg = resolve(g['cf'])
        if tg: gjson.append([g['title'], tg, [g['title'], g['name']]])
    else:
        gjson.append([g['title'], g['slug'], sorted({g['title'], g['name']} - {''})])
# regroup so each slug has all its terms
merged = {}
for t, sl, terms in gjson:
    e = merged.setdefault(sl, [used[sl]['title'], sl, []])
    for x in terms:
        if x not in e[2] and ', ' not in x: e[2].append(x)
write('/glossary.json', json.dumps(list(merged.values()), ensure_ascii=False, separators=(',', ':')))
shutil.copy(os.path.join(ROOT, 'tools', 'news.js'), os.path.join(OUT, 'news.js'))
# ---------------------------------------------------------------- data, assets, redirects, sitemap
write('/search.json', json.dumps(search, ensure_ascii=False, separators=(',', ':')))
shutil.copy(os.path.join(ROOT, 'tools', 'style.css'), os.path.join(OUT, 'style.css'))
shutil.copy(os.path.join(ROOT, 'tools', 'site.js'), os.path.join(OUT, 'site.js'))
open(os.path.join(OUT, 'robots.txt'), 'w').write(f'User-agent: *\nAllow: /\nSitemap: {BASE}/sitemap.xml\n')
allurls = ['/', '/about/', '/news/', '/glossary/', '/index/', '/maps/', '/timelines/', '/tables/', '/demographics/', '/rankings/', '/top-ten/', '/size/', '/tour/', '/flora/'] + [r['url'] for r in rows] + [f'/g/{g["slug"]}/' for g in G]
open(os.path.join(OUT, 'sitemap.xml'), 'w').write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join(f'<url><loc>{BASE}{u}</loc></url>\n' for u in allurls) + '</urlset>\n')

red = []
def R(src, dst, code=301):
    red.append((src, dst, code))
    if src != src.upper() and not src.startswith('/g/'):
        red.append((src.upper(), dst, code))
for r in rows:
    R(r['short'], r['url'])
    R('/2027' + r['short'], r['url'], 301)
    # no-hyphen and slash variants people type
    R('/' + r['id'].lower().replace('-', ''), r['url'])
HUBS = {'/map': '/maps/', '/tl': '/timelines/', '/tbl': '/tables/', '/dem': '/demographics/', '/rnk': '/rankings/', '/top': '/top-ten/',
        '/size': '/size/', '/tour': '/tour/', '/flora': '/flora/', '/gl': '/glossary/', '/pop': '/size/', '/timeline': '/timelines/',
        '/index': '/index/', '/glossary': '/glossary/', '/maps': '/maps/', '/timelines': '/timelines/', '/rankings': '/rankings/',
        '/demographics': '/demographics/', '/tables': '/tables/', '/news': '/news/', '/top-ten': '/top-ten/', '/about': '/about/', '/search': '/search/'}
for s, d in HUBS.items():
    if s == d.rstrip('/'):
        red.append((s.upper(), d, 301)); continue
    R(s, d)
for p in range(173, 210): R(f'/gl-{p}', f'/g/{[g for g in G if g["pg"] == p][0]["slug"]}/')
open(os.path.join(OUT, '_redirects'), 'w').write('\n'.join(f'{s} {d} {c}' for s, d, c in red) + '\n')
print('items', len(rows), 'glossary', len(G), 'redirect rules', len(red), 'search', len(search))
print('unresolved links', sum(unresolved.values()), sorted(unresolved.items(), key=lambda x: -x[1])[:40])
