#!/usr/bin/env python3
"""Israel Mosaic website generator.
Usage: python3 -I tools/build_site.py <interior.pdf> <master.pdf> <identifiers.csv> <qr-table.csv> <entries_raw.json> <outdir>
Reads the book PDF text, the identifiers table and the glossary, and writes a static site."""
import urllib.parse, sys, os, re, csv, json, html, shutil, unicodedata
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

GENERATED = ['maps', 'timelines', 'tables', 'population', 'demographics', 'rankings', 'top-ten', 'tour', 'flora', 'g', 'glossary', 'index', 'size', 'about', 'search', 'news', 'views', 'video', 'subscribe', 'signin', 'charts', 'media', 'sources', 'admin']
for d_ in GENERATED:
    shutil.rmtree(os.path.join(OUT, d_), ignore_errors=True)
shutil.rmtree(os.path.join(OUT, 'img', 's'), ignore_errors=True)
shutil.rmtree(os.path.join(OUT, 'img', 't'), ignore_errors=True)
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
NAV = [('/', 'News'), ('/views/', 'Views'), ('/video/', 'Video'), ('/media/', 'Media'), ('/maps/', 'Maps'), ('/timelines/', 'Timelines'),
       ('/charts/', 'Charts'), ('/glossary/', 'NOWlej'), ('/sources/', 'Sources'), ('/about/', 'About')]
BASE = 'https://israelinmaps.com'

VCFG = json.load(open(os.path.join(ROOT, 'video.json')))
def vslug(c): return (c.get('handle') or c.get('id') or '').lower()
def plslug(c): return 'pl-' + c['id'].lower()
SUBNAV = {
 'news': [('Security', '/news/#mode=topics&tp=security'), ('Diplomacy', '/news/#mode=topics&tp=diplomacy'), ('Politics', '/news/#mode=topics&tp=politics'), ('Technology', '/news/#mode=topics&tp=technology'), ('Business', '/news/#mode=topics&tp=business'), ('Culture', '/news/#mode=topics&tp=culture')],
 'views': [('Op-Ed', '/views/#mode=topics&kind=Op-Ed'), ('Editorial', '/views/#mode=topics&kind=Editorial'), ('Blogs', '/views/#mode=topics&kind=Blog')],
 'maps': [('Historical Maps', '/maps/'), ('Size Comparisons', '/size/'), ('Israel Tour', '/tour/')],
 'charts': [('Rankings', '/rankings/'), ('Demographics', '/demographics/'), ('Top Ten', '/top-ten/'), ('Size Comparisons', '/size/'), ('Tables', '/tables/')],
 'media': [('A Taste of Israel', '/tour/'), ('Flora and Fauna', '/flora/')],
 'video': [('Latest', '/video/#ch-latest')] + [(c['name'], f'/video/{vslug(c)}/') for c in VCFG['channels'][:7]],
 'glossary': [('People and Groups', '/glossary/#c=people-and-groups'), ('Places', '/glossary/#c=places'), ('Events', '/glossary/#c=events'), ('Buildings and Sites', '/glossary/#c=buildings-and-sites'), ('Works', '/glossary/#c=works')],
}
SHORT = {'Patriarchs to the First Kings': 'Patriarchs and Kings', 'Kings, Exile and Return': 'Exile and Return', 'Greeks, Hasmoneans and Romans': 'Greeks and Romans', 'Centuries of Foreign Rule': 'Foreign Rule', 'The Ottoman Land': 'Ottomans', 'Zionism Takes Shape': 'Zionism Takes Shape'}
def tl_links():
    return [(SHORT.get(r['title'], r['title'].replace('The ', '')), r['url']) for r in rows if r['prefix'] == 'TL']
def sec_links(sec):
    if sec == 'timelines': return tl_links()
    if sec == 'sources': return [(n_, f'/sources/{i_}/') for i_, n_, _, _ in SRC]
    return SUBNAV.get(sec, [])
def write_subnav_json():
    m = {}
    for u, t in NAV:
        k = u.strip('/').split('/')[0] or 'news'
        k = {'glossary': 'glossary'}.get(k, k)
        m[u] = sec_links(k)
    write('/subnav.json', json.dumps(m))
def subnav_for(path):
    seg = path.strip('/').split('/')[0]
    sec = {'': 'news', 'news': 'news', 'views': 'views', 'maps': 'maps', 'timelines': 'timelines', 'charts': 'charts', 'media': 'media', 'video': 'video', 'glossary': 'glossary', 'g': 'glossary',
           'tables': 'charts', 'demographics': 'charts', 'rankings': 'charts', 'top-ten': 'charts', 'size': 'charts', 'tour': 'media', 'flora': 'media', 'sources': 'sources'}.get(seg, '')
    links = sec_links(sec) if sec else []
    trend = 'views' if sec == 'views' else ('news' if sec in ('news', 'sources', 'glossary') or seg == '' else '')
    html_ = ''.join(f'<a href="{u}">{E(t)}</a>' for t, u in links)
    return f'<div class="wrap subnav" id="subnav" data-trend="{trend}"{"" if links else " hidden"}>{html_}<span class="trend" id="trend" hidden></span></div>'

def layout(title, body, desc='', path='/', og=None, cls='', nd=False):
    if 'class="newspage"' in body and 'newspg' not in cls: cls = (cls + ' newspg').strip()
    news_js = 'class="newspage"' in body or path in ('/news/', '/views/') or path.startswith('/g/') or path.startswith('/news/item/')
    nav = ''.join(f'<a href="{u}" data-n="{i}">{t}</a>' for i, (u, t) in enumerate(NAV))
    full = f'{title} | Israel NOWlej' if title != 'Israel NOWlej' else 'Israel NOWlej'
    d = desc or 'Know the Story of the Jewish Land in Maps, Timelines, Charts, and Graphics. Living edition of the book Israel NOWlej.'
    img = f'<meta property="og:image" content="{BASE}{og}">' if og else ''
    robots = '<meta name="robots" content="noindex">' if nd else ''
    return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{E(full)}</title><meta name="description" content="{E(d)}">
<link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="canonical" href="{BASE}{path}"><meta property="og:title" content="{E(full)}"><meta property="og:description" content="{E(d)}">{img}{robots}
<link rel="stylesheet" href="/style.css"></head>
<body class="{cls}"><a class="skip" href="#main">Skip to content</a>
<header class="top"><div class="wrap bar"><a class="brand" href="/" aria-label="Israel NOWlej, home"><img src="/logo.svg" alt="Israel NOWlej" width="160" height="52"></a><div class="ticker" id="news-ticker" aria-label="Latest headlines" hidden></div>
<div class="rcol"><div class="acct"><a class="subbtn" href="/subscribe/">Subscribe</a><a class="signin" href="/signin/">Sign in</a></div><form class="sf" action="/search/" role="search"><input name="q" type="search" placeholder="Search maps, people, places, IDs" aria-label="Search"><button>Search</button></form></div></div>
<nav class="wrap" aria-label="Sections">{nav}</nav>{subnav_for(path)}</header>
<main id="main" class="wrap">{body}</main>
<footer><div class="wrap"><p>Israel NOWlej: news, views, maps, timelines, charts and media on the Holy Land.</p>
<p>&copy; 2003 to 2026 Richard J. Koret. All rights reserved. Page images are shown for reference with the book <i>Israel NOWlej</i> by Richard J. Koret. <a href="/about/">How to use this site and cite it</a></p></div></footer>
<script src="/site.js" defer></script><script src="/share.js" defer></script><script src="/ticker.js" defer></script>{'<script src="/ads.js" defer></script><script src="/news.js" defer></script>' if news_js else ''}{'<script src="/subnav.js" defer></script>'}{'<script src="/entryedit.js" defer></script>' if path.startswith('/g/') else ''}{'<script src="/video.js" defer></script>' if path.startswith('/video/') or path.startswith('/g/') else ''}{'<script src="/entry.js" defer></script>' if path.startswith('/g/') else ''}{'<script src="/glossary.js" defer></script>' if path == '/glossary/' else ''}{'<script src="/source.js" defer></script>' if path.startswith('/sources/') and path != '/sources/' else ''}{'<script src="/admin.js" defer></script>' if path == '/admin/video/' else ''}{'<script src="/tlnav.js" defer></script>' if path.startswith('/timelines/') and path != '/timelines/' else ''}{'<script src="/admin_entry.js" defer></script>' if path == '/admin/entry/' else ''}</body></html>'''

def write(path, content):
    fp = os.path.join(OUT, path.lstrip('/'))
    if path.endswith('/'): fp = os.path.join(fp, 'index.html')
    os.makedirs(os.path.dirname(fp), exist_ok=True)
    open(fp, 'w', encoding='utf-8').write(content)

def citation(r):
    pg = r['pages']
    p = f'p. {pg[0]}' if len(pg) == 1 else f'pp. {pg[0]} to {pg[-1]}'
    return f'Israel NOWlej (2027), {r["id"]}, {p}, israelinmaps.com/{r["id"].lower()}'

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

SRC = [('toi', 'The Times of Israel', 'https://www.timesofisrael.com/', 'An Israeli English-language news site covering Israel, the Middle East and the Jewish world, with a large opinion and blogs section.'),
       ('jpost', 'The Jerusalem Post', 'https://www.jpost.com/', 'An Israeli English-language daily with reporting on Israel, the region and Jewish communities, plus opinion and analysis.'),
       ('ynet', 'Ynetnews', 'https://www.ynetnews.com/', 'The English edition of Ynet, the news site of the Yedioth Ahronoth group.'),
       ('haaretz', 'Haaretz', 'https://www.haaretz.com/', 'The English edition of the Israeli daily Haaretz, with news, analysis and opinion.'),
       ('jns', 'JNS', 'https://www.jns.org/', 'Jewish News Syndicate, a news service on Israel, the Middle East and Jewish communities worldwide.'),
       ('insider', 'Israel Insider', 'https://israelinsider.org/', 'An Israeli news and commentary site, now published through NOWlej.'),
       ('israelhayom', 'Israel Hayom', 'https://www.israelhayom.com/', 'The English edition of the Israeli daily Israel Hayom.')]
SRCNAME = {a: b for a, b, _, _ in SRC}
SECKEY = {'/charts/': 'charts', '/media/': 'media', '/maps/': 'maps', '/timelines/': 'timelines', '/tables/': 'charts', '/demographics/': 'charts', '/rankings/': 'charts', '/top-ten/': 'charts', '/size/': 'charts', '/tour/': 'media', '/flora/': 'media'}
def sec_groups(sk):
    R_ = lambda pre: [r for r in rows if r['prefix'] == pre]
    if sk == 'maps':
        return 'Maps', '/maps/', [('Historical Maps', None, [(r['url'], r['title']) for r in rows if r['prefix'] == 'MAP' and int(r['num']) < 30]),
                                  ('Size Comparisons', '/size/', [(r['url'], r['title']) for r in rows if r['prefix'] == 'MAP' and int(r['num']) >= 30])]
    if sk == 'timelines':
        return 'Timelines', '/timelines/', [('All timelines', None, [(r['url'], r['title']) for r in R_('TL')])]
    if sk == 'charts':
        gs = []
        for t, u, lst in [('Rankings', '/rankings/', R_('RNK')), ('Demographics', '/demographics/', R_('DEM')), ('Top Ten Lists', '/top-ten/', R_('TOP')),
                          ('Size Comparisons', '/size/', [r for r in rows if hub_of(r)[0] == '/size/']), ('Tables', '/tables/', [r for r in R_('TBL') if hub_of(r)[0] != '/size/'])]:
            gs.append((t, u, [(r['url'], r['title']) for r in lst]))
        return 'Charts', '/charts/', gs
    if sk == 'media':
        return 'Media', '/media/', [('A Taste of Israel', '/tour/', [(byid[x + '-00']['url'], byid[x + '-00']['title']) for x in ['NEG', 'DSE', 'JUS', 'GAL', 'GOL', 'MED', 'TAJ', 'JHL', 'JRS', 'SHF']]),
                                    ('Flora and Fauna', '/flora/', [(byid[x + '-00']['url'], byid[x + '-00']['title']) for x in ['TRE', 'WFL', 'WLD', 'BRD', 'MIG']])]
    if sk == 'video':
        return 'Video', '/video/', [('Channels', None, [('/video/#ch-latest', 'Latest')] + [(f'/video/{vslug(c)}/', c['name']) for c in VCFG['channels']])] + ([('Playlists', None, [('/video/#playlists', 'All playlists')])] if VCFG.get('playlists') else [])
    if sk == 'glossary':
        ls = sorted({key(g['name'])[0].upper() for g in G})
        return 'NOWlej', '/glossary/', [('A to Z', None, [(f'/glossary/#l{L}', L) for L in ls])]
    return 'Sources', '/sources/', [('Sources and the book', None, [('/sources/', 'All sources')] + [(f'/sources/{i_}/', n_) for i_, n_, _, _ in SRC] + [('/index/', 'Index'), ('/about/', 'How to use this site')])]

def secnav(sk, active=''):
    title, hub_u, groups = sec_groups(sk)
    total = sum(len(g[2]) for g in groups)
    cur = ' aria-current="page"'
    o = f'<nav class="newstopics secnav" aria-label="In this section">' + ('' if sk == 'video' else f'<h2><a href="{hub_u}"{cur if active == hub_u else ""}>{E(title)}</a></h2>')
    for gt, gu, lst in groups:
        op = total <= 40 or any(u == active for u, _ in lst) or active == gu
        lk = f'<a href="{gu}">{E(gt)}</a>' if gu else E(gt)
        o += f'<details{" open" if op else ""}><summary>{lk}</summary><ul>' + ''.join(
            f'<li><a href="{u}"{cur if u == active else ""}>{E(t)}</a></li>' for u, t in lst) + '</ul></details>'
    return o + '</nav>'

def chan(sk, body, active='', views=False, vl=False):
    wd = 'views' if views else 'news'
    vside = sk == 'video' or vl
    body = re.sub(r'<p class="crumb">.*?</p>', '', body, count=1)
    return (f'<div class="newspage"><div class="adslot" data-slot="page-top" data-sizes="728x90|320x50"></div>'
            f'<div class="newsleftcol">{secnav(sk, active)}<div class="adslot" data-slot="left" data-sizes="tower"></div></div>'
            f'<div class="newsleft"><div class="newsmain">{body}<div class="adslot" data-slot="lb-bottom" data-sizes="728x90|320x50"></div></div></div>'
            f'<aside class="newsside" aria-label="Latest {wd}"><div class="adslot" data-slot="aside-top" data-sizes="320x100"></div>{'<div id="vid-list" class="vlist"></div>' if vside else f'<span id="news-side" data-word="{wd}" hidden></span><div id="news-latest"></div><h2>By source</h2><div id="news-widget"></div>'}</aside></div>'
            f'{"" if vside else "<p class=\"small\" id=\"news-status\"></p>"}<div class="adslot adwide" data-slot="page-bottom" data-sizes="970x250|728x90|320x100"></div>')

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
    desc = f'{r["title"]} ({r["id"]}), {kind.lower()} from the book Israel NOWlej, page {pg[0]}.'
    write(r['url'], layout(r['title'], chan(SECKEY[hub], body, r['url']), desc, r['url'], f'/img/p{pg[0]:03d}.webp', cls='tlfull' if r['prefix'] == 'TL' else ''))
    search.append({'t': r['title'], 'u': r['url'], 'k': r['id'], 's': r['section'], 'x': (' '.join(st[0]) if st else ' '.join(paras))[:600]})

for r in rows: item_page(r)

# ---------------------------------------------------------------- glossary pages
ENTRYCFG = json.load(open(os.path.join(ROOT, 'entries.json')))
def _nt(t): return re.sub(r'[^a-z0-9 ]+', ' ', unicodedata.normalize('NFKD', t).lower()).split()
def gl_related(g):
    nm = _nt(g['name'])
    if not nm or (len(nm) < 2 and len(nm[0]) < 5): return ''
    hits = []
    for r in rows:
        if r['prefix'] not in ('MAP', 'TL', 'TBL', 'RNK', 'DEM', 'TOP') and r['prefix'] not in TOUR and r['prefix'] not in FLORA: continue
        tw = _nt(r['title'])
        if any(tw[x:x + len(nm)] == nm for x in range(len(tw) - len(nm) + 1)): hits.append(r)
    if not hits: return ''
    return '<h3>In the book and on this site</h3>' + tcards(hits[:4])
def gl_pageimg(g):
    pg = g['pg']
    return (f'<div class="pages single wide"><a href="/img/p{pg:03d}.webp"><img src="/img/p{pg:03d}.webp" width="1200" height="1500" alt="Glossary page {pg} of the book Israel NOWlej, with the entry {E(g["title"])}" loading="lazy"></a></div>'
            f'<p class="small">From the book <i>Israel NOWlej</i>, page {pg}.</p>')
def gl_video(g, sl):
    pins = VCFG.get('pinned', {}).get(sl, [])
    eps = VCFG.get('entryPlaylists', {}).get(sl, [])
    pj = E(json.dumps([{'v': p['v'], 't': p.get('t', '')} for p in pins], ensure_ascii=False))
    ej = E(json.dumps([{'id': x['id'], 'name': x['name'], 'by': x.get('by', ''), 'slug': plslug(x)} for x in eps], ensure_ascii=False))
    cards_ = ''
    return (f'<section id="e-video" data-slug="{sl}" data-name="{E(g["title"] if g.get("title") else g["name"])}" data-pins="{pj}" data-pls="{ej}"{"" if (pins or eps) else " hidden"}>'
            f'<div class="vtop" id="e-player"></div><div class="vthumbs"></div><div class="vtop plp" id="e-plplayer" hidden></div><div class="tgrid"></div><div class="epl"></div></section>')
bycat = {}
CUR = json.load(open(os.path.join(ROOT, 'curated.json'))) if os.path.exists(os.path.join(ROOT, 'curated.json')) else {}
def curated_wiki(sl, wk):
    c = CUR.get('wikipedia', {}).get(sl)
    if not c: return f'<div id="e-wiki" data-wiki="{E(wk) if wk else ''}" hidden></div>'
    ps = ''.join(f'<p>{E(x.strip())}</p>' for x in c['text'].split('\n') if x.strip())
    return (f'<div id="e-wiki" data-wiki="{E(c["article"])}" data-fixed="1">{ps}<p class="small">This entry has been adapted from diverse sources, potentially including Wikipedia and other encyclopedias and information resources, and edited by Israel NOWlej. Source attributions appear under Sources below.</p></div>')
def gl_page(g):
    sl = g['slug']
    if g.get('cf'):
        tgt = resolve(g['cf'])
        link = f'<a href="/g/{tgt}/">{E(invert(g["cf"]))}</a>' if tgt else E(g['cf'])
        body = f'<article><h1>{E(g["title"])}</h1><p class="lead">See {link}.</p></article>'
        write(f'/g/{sl}/', layout(g['title'], chan('glossary', body, '/glossary/'), f'{g["title"]}: see {g["cf"]}.', f'/g/{sl}/'))
        search.append({'t': g['title'], 'u': f'/g/{sl}/', 'k': 'GLOSSARY', 's': 'see ' + g['cf'], 'x': ''})
        return
    b = body_html(g)
    if sl == 'judea-and-samaria':
        b += ' Also called the West Bank, a name from the Jordanian occupation of 1948 to 1967, which almost no country recognized. Israel has used the biblical names since 1967.'
    he = f'<span class="he" lang="he" dir="rtl">{E(g["he"])}</span>' if g['he'] else ''
    cat = E(g['cat'].title().replace(' And ', ' and ')) if g['cat'] else ''
    see = see_html(g); app = app_html(g)
    plain = re.sub(r'<[^>]+>', '', b)
    rel_ = gl_related(g)
    wk = ENTRYCFG.get('wiki', {}).get(sl, g['title'])
    srcs_ = f'<li>The book <i>Israel NOWlej</i> by Richard J. Koret, glossary, page {g["pg"]}.</li>'
    _c = CUR.get('wikipedia', {}).get(sl)
    if _c: srcs_ += f'<li>Text adapted in part from <a href="{E(_c["url"])}" rel="noopener">{E(_c["article"])}</a> (revision {_c["rev"]}), <a href="https://creativecommons.org/licenses/by-sa/4.0/" rel="noopener">CC BY-SA 4.0</a>.</li>'
    body = f"""<article class="gl"><header class="ih"><span class="id">NOWlej · book page {g["pg"]}</span><h1>{E(g["title"])} {he}</h1><p class="meta">{cat}</p></header>
<p class="lead edef" id="e-def">{b}<a class="econt" href="#e-summary"{'' if CUR.get('wikipedia', {}).get(sl) else ' hidden'}>Continue &#9656;</a></p>
<nav class="esec" id="esec" aria-label="On this page"><a href="#e-images" data-s="e-images" hidden>Images</a><a href="#e-video" data-s="e-video" hidden>Video</a><a href="#e-summary" data-s="e-summary"{'' if CUR.get('wikipedia', {}).get(sl) else ' hidden'}>More NOWlej</a><a href="#e-related">Related</a><a href="#e-sources">Sources</a></nav>
<section id="e-images" hidden data-name="{E(wk) if wk else ''}"{(" data-files='" + E(json.dumps(CUR.get('images', {}).get(sl, []))).replace("'", "&#39;") + "'") if CUR.get('images', {}).get(sl) else ''}><div class="egal" id="e-gal"></div><p class="small">Photographs from Wikimedia Commons. Click an image to enlarge it. Author and license are shown with each.</p></section>
{gl_video(g, sl)}
<section id="e-summary"{'' if CUR.get('wikipedia', {}).get(sl) else ' hidden'}><h2>MORE NOWLEJ</h2>
{curated_wiki(sl, wk)}</section>
<section id="e-related"><h2>Related</h2>
{f'<p><b>See also</b> {see}</p>' if see else ''}{f'<p><b>Appears in</b> {app}</p>' if app else ''}{rel_}
<div id="gl-news" data-slug="{sl}" hidden><h3>In the news</h3><div class="ngrid"></div><ul class="hlist"></ul><p class="small">Headlines and links from public news feeds. <a href="/news/">All news</a>.</p></div></section>
<section id="e-sources"><h2>Sources</h2><ul class="esrc" id="e-src">{srcs_}</ul></section></article>"""
    write(f'/g/{sl}/', layout(g['title'], chan('glossary', body, '/glossary/', vl=bool(VCFG.get('pinned', {}).get(sl) or VCFG.get('entryPlaylists', {}).get(sl))), plain[:155], f'/g/{sl}/'))
    search.append({'t': g['title'] + (f' {g["he"]}' if g['he'] else ''), 'u': f'/g/{sl}/', 'k': 'GLOSSARY', 's': cat, 'x': plain[:300]})
    bycat.setdefault(g['cat'] or 'OTHER', []).append(g)



# ---------------------------------------------------------------- hubs
THUMB_W, THUMB_H = 480, 360
def make_thumb(r):
    fn = os.path.join(OUT, 'img', 't', r['id'].lower() + '.webp')
    if os.path.exists(fn): return '/img/t/' + r['id'].lower() + '.webp'
    os.makedirs(os.path.dirname(fn), exist_ok=True)
    srcs = []
    sp_ = os.path.join(OUT, 'img', 's', r['id'].lower() + '.webp')
    if os.path.exists(sp_): srcs = [sp_]
    else: srcs = [os.path.join(OUT, 'img', f'p{p:03d}.webp') for p in r['pages'][:2]]
    ims = [Image.open(s_).convert('RGB') for s_ in srcs if os.path.exists(s_)]
    if not ims: return ''
    h = max(i.height for i in ims)
    comp = Image.new('RGB', (sum(i.width for i in ims), h), (255, 255, 255))
    x = 0
    for i in ims: comp.paste(i, (x, 0)); x += i.width
    sc = min((THUMB_W - 16) / comp.width, (THUMB_H - 16) / comp.height)
    comp = comp.resize((max(1, int(comp.width * sc)), max(1, int(comp.height * sc))), Image.LANCZOS)
    canvas = Image.new('RGB', (THUMB_W, THUMB_H), (238, 243, 250))
    canvas.paste(comp, ((THUMB_W - comp.width) // 2, (THUMB_H - comp.height) // 2))
    canvas.save(fn, quality=72)
    return '/img/t/' + r['id'].lower() + '.webp'

def tcards(items_):
    o = '<div class="tgrid">'
    for k in items_:
        th = make_thumb(k)
        pgs = k['pages']; pt = f'p. {pgs[0]}' if len(pgs) == 1 else f'pp. {pgs[0]} to {pgs[-1]}'
        o += (f'<a class="tcard" href="{k["url"]}"><span class="timg">' + (f'<img src="{th}" alt="" width="{THUMB_W}" height="{THUMB_H}" loading="lazy">' if th else '') +
              f'</span><span class="tb"><span class="tid">{k["id"]}</span><b>{E(k["title"])}</b><span class="tp">{pt}</span></span></a>')
    return o + '</div>'

def hub(path, title, intro, groups, crumb=None):
    b = f'<p class="crumb"><a href="/">Home</a> / {E(title)}</p><h1>{E(title)}</h1>'
    for gt, items_ in groups:
        if gt: b += f'<h2>{E(gt)}</h2>'
        b += tcards(items_)
    write(path, layout(title, chan(SECKEY[path], b, path), intro, path, f'/img/p{groups[0][1][0]["pages"][0]:03d}.webp' if groups and groups[0][1] else None))

def items(prefix, pred=lambda r: True): return [r for r in rows if r['prefix'] == prefix and pred(r)]
hub('/maps/', 'Maps', 'Thirty-three maps of the land from the patriarchs to today. Every map has its own address, such as israelinmaps.com/map-002.',
    [('Historical Maps', [r for r in rows if r['prefix'] == 'MAP' and int(r['num']) < 30]), ('Size Comparisons', [r for r in rows if r['prefix'] == 'MAP' and int(r['num']) >= 30])])
def tl_hub():
    from PIL import Image as _I
    def th(pg, nm):
        fn = os.path.join(OUT, 'img', 't', nm + '.webp')
        if not os.path.exists(fn):
            im = _I.open(os.path.join(OUT, 'img', f'p{pg:03d}.webp')).convert('RGB')
            im = im.resize((420, int(im.height * 420 / im.width)), _I.LANCZOS); im.save(fn, quality=74)
        return f'/img/t/{nm}.webp'
    def tile(href, img, title):
        return (f'<a class="tltile" href="{href}" title="{E(title)}"><img src="{img}" alt="{E(title)}" width="420" height="525" loading="lazy"></a>')
    o = tile('/img/p109.webp', th(109, 'tl-glance'), 'Four Thousand Years at a Glance')
    for k in items('TL'): o += tile(k['url'], th(k['pages'][0], 'tlf-' + k['id'].lower()), k['title'])
    b = '<p class="crumb"><a href="/">Home</a> / Timelines</p><h1>Timelines</h1><p class="small">Four thousand years at a glance, then one page for each period. Select a page to open it.</p><div class="tlmosaic">' + o + '</div>'
    write('/timelines/', layout('Timelines', chan('timelines', b, '/timelines/'), 'Nineteen timelines from the patriarchs to the present.', '/timelines/', '/img/p109.webp'))
tl_hub()
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

for g in G: gl_page(g)

# ---------------------------------------------------------------- video page
vb = '<h1>Video</h1><div class="vtop" id="vid-top" hidden></div><div id="vid-root"><p>Loading videos.</p></div>'
for c_ in VCFG['channels']:
    sl_ = vslug(c_)
    write(f'/video/{sl_}/', layout(c_['name'] + ' Videos', chan('video', f'<h1>{E(c_["name"])} Videos</h1><div class="vtop" id="vid-top" hidden></div><div id="vid-chan" data-key="{E(sl_)}"><p>Loading videos.</p></div>', f'/video/{sl_}/'), f'Videos from {c_["name"]}.', f'/video/{sl_}/'))
for c_ in VCFG.get('playlists', []):
    sl_ = plslug(c_)
    write(f'/video/{sl_}/', layout(c_['name'] + ' Playlist', chan('video', f'<h1>{E(c_["name"])} Playlist</h1><div class="vtop" id="vid-top" hidden></div><div id="vid-chan" data-key="{E(sl_)}" data-pl="{E(c_["id"])}"><p>Loading videos.</p></div>', f'/video/{sl_}/'), f'Playlist: {c_["name"]}.', f'/video/{sl_}/'))
write('/video/watch/', layout('Watch', chan('video', '<h1 id="vw-title">Video</h1><div class="vtop" id="vid-top" hidden></div><div id="vid-watch"></div>', '/video/'), 'Watch a video.', '/video/watch/', nd=True))
write('/video/', layout('Video', chan('video', vb, '/video/'), 'Curated video from whitelisted channels, with a player and a gallery for each.', '/video/'))

# ---------------------------------------------------------------- glossary hub (cards)
def catname(g): return (g['cat'].title().replace(' And ', ' and ') if g['cat'] else 'Other')
def catslug(c): return re.sub(r'[^a-z]+', '-', c.lower()).strip('-')
def norm_(t): return re.sub(r'[^a-z0-9 ]+', ' ', unicodedata.normalize('NFKD', t).lower()).split()
thumb_items = [r for r in rows if r['prefix'] in ('MAP', 'TL') or r['prefix'] in TOUR or r['prefix'] in FLORA]
def gl_thumb(g):
    nm = norm_(g['name'])
    if not nm: return None
    best = None
    for r in thumb_items:
        tw = norm_(r['title'])
        if tw == nm: return r
        if best is None and (len(nm) >= 2 or len(' '.join(nm)) >= 6) and any(tw[x:x + len(nm)] == nm for x in range(len(tw) - len(nm) + 1)): best = r
    return best
glcards = [g for g in G if not g.get('cf')]
cats = {}
for g in glcards: cats[catname(g)] = cats.get(catname(g), 0) + 1
gh = '<h1>NOWlej</h1>'
gh += '<div class="gfilter"><input id="gq" type="search" placeholder="Filter people, places, events" aria-label="Filter"><div class="gcats" id="gcats"><button type="button" data-c="" aria-pressed="true">All <i>' + str(len(glcards)) + '</i></button>' + ''.join(f'<button type="button" data-c="{catslug(c)}" aria-pressed="false">{E(c)} <i>{n}</i></button>' for c, n in sorted(cats.items(), key=lambda x: -x[1])) + '</div>'
letters = {}
for g in sorted(glcards, key=lambda g: key(g['name'])):
    letters.setdefault(key(g['name'])[0].upper(), []).append(g)
gh += '<p class="az" id="gaz">' + ' '.join(f'<a href="#l{L}">{L}</a>' for L in letters) + '</p></div><p class="small" id="gcount"></p>'
nthumb = 0
for L, lst in letters.items():
    gh += f'<section class="gsec" data-l="{L}"><h2 id="l{L}">{L}</h2><div class="ggrid">'
    for g in lst:
        b_ = re.sub(r'<[^>]+>', '', body_html(g)).strip()
        d_ = (b_[:120].rsplit(' ', 1)[0] + '...') if len(b_) > 120 else b_
        cn = catname(g); cs = catslug(cn)
        tr = gl_thumb(g); th = make_thumb(tr) if tr else None
        if th: nthumb += 1
        img = (f'<img src="{th}" alt="" width="{THUMB_W}" height="{THUMB_H}" loading="lazy">' if th else f'<span class="tile c-{cs}"><b>{E(key(g["name"])[0].upper())}</b><small>{E(cn)}</small></span>')
        he_ = f'<span class="he" lang="he" dir="rtl">{E(g["he"])}</span>' if g['he'] else ''
        gh += (f'<a class="gcard" href="/g/{g["slug"]}/" data-c="{cs}" data-n="{E((g["name"] + " " + g["he"] + " " + d_).lower())}"><span class="gimg">{img}</span>'
               f'<span class="gb"><span class="gcat c-{cs}">{E(cn)}</span><b>{E(g["name"])}</b>{he_}<span class="gd">{E(d_)}</span></span></a>')
    gh += '</div></section>'
print('glossary cards', len(glcards), 'with related thumbnail', nthumb)
write('/glossary/', layout('NOWlej', chan('glossary', gh, '/glossary/'), 'NOWlej: 407 entries on people, places, events, works and buildings.', '/glossary/'))

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
ib = '<p class="crumb"><a href="/">Home</a> / Index</p><h1>Index</h1><ul class="ix">'
for e in idx:
    pgs = ', '.join(plink(p) for p in e.get('pages', []))
    he = f' <span class="he" lang="he" dir="rtl">{E(e["he"])}</span>' if e.get('he') else ''
    ib += f'<li><b>{E(e["head"])}</b>{he} {pgs}</li>'
ib += '</ul>'
write('/index/', layout('Index', chan('sources', ib, '/index/'), 'Index of the book Israel NOWlej.', '/index/'))

# ---------------------------------------------------------------- about, search, 404, home
about = '''<p class="crumb"><a href="/">Home</a> / About</p><h1>How to Use This Site</h1>
<p class="lead">Every item in the book has one permanent ID, for example MAP-002 or TL-004. The ID is the address.</p>
<h2>Addresses</h2><p>Type <b>israelinmaps.com/map-002</b> in any browser. It redirects to the full page, <b>israelinmaps.com/maps/002/zion-terrain</b>. If a title is ever corrected the full address may change. The ID and the short address never change.</p>
<h2>Hubs</h2><p>A bare prefix opens the whole group: /map, /tl, /tbl, /dem, /rnk, /top, /size, /tour, /flora, /gl. The glossary is at /glossary and the book index at /index.</p>
<h2>Cite a page</h2><p>Each page shows a citation line and a Copy citation button, for example: Israel NOWlej (2027), MAP-002, p. 6, israelinmaps.com/map-002. The ID is enough for any later edition. The page number fits the 2027 print edition only.</p>
<h2>Editions</h2><p>The short address always shows the current version. Each edition also keeps a frozen copy, for example /2027/map-002, so a citation from the 2027 book can be checked against what the book showed. Corrections are listed on the page with a date.</p>
<h2>Scanning a code</h2><p>Each code in the book encodes the same short address. If a code is damaged, type the address printed beside it.</p>
<h2>About the book</h2><p>Israel NOWlej: Know the Story of the Jewish Land in Maps, Timelines, Charts, and Graphics, by Richard J. Koret. This site is the companion to the book. Some illustrations in the book are marked as AI generated.</p>'''
for pth_, ttl_, txt_ in [('/subscribe/', 'Subscribe', 'Subscriptions are coming soon. They will bring a daily digest of the news and views on this site.'),
                         ('/signin/', 'Sign in', 'Accounts are coming soon. For now the whole site is open to read without signing in.')]:
    write(pth_, layout(ttl_, chan('sources', f'<h1>{ttl_}</h1><p>{txt_}</p>'), ttl_ + ' to Israel NOWlej.', pth_, nd=True))

sb = '''<h1>Search</h1><form class="sf big" action="/search/" role="search"><input id="q" name="q" type="search" placeholder="Try map-002, Masada, Rabin, olive" aria-label="Search" autofocus><button>Search</button></form>
<p class="small">Searches live news and views, maps, timelines, charts, media and the glossary.</p><ul class="results" id="results"></ul>'''
write('/search/', layout('Search', chan('sources', sb), 'Search news, views, maps, timelines, charts, media and the glossary.', '/search/', nd=True))
nf = '''<h1>That address is not here</h1><p class="lead">It may be a typing slip or an ID from a later edition. Search for it below, or browse from the home page.</p>
<form class="sf big" action="/search/" role="search"><input id="q" name="q" type="search" aria-label="Search" placeholder="Search maps, people, places, IDs"><button>Search</button></form>
<ul class="results" id="results"></ul><p><a href="/">Go to the home page</a></p>'''
write('/404.html', layout('Not found', nf, 'Not found', '/404.html', nd=True, cls='nf'))

home_cards = [('/maps/', 'Maps', '33 maps'), ('/timelines/', 'Timelines', '19 timelines'), ('/rankings/', 'Rankings', '17 rankings'),
              ('/demographics/', 'Demographics', '13 graphics'), ('/top-ten/', 'Top Ten Lists', '6 lists'), ('/size/', 'Size Comparisons', 'Israel beside other places'),
              ('/tables/', 'Tables', '5 reference tables'), ('/tour/', 'A Taste of Israel', '10 regions, 71 stops'), ('/flora/', 'Flora and Fauna', '5 sections, 60 entries'),
              ('/glossary/', 'Glossary', '407 entries'), ('/index/', 'Index', 'Find any name or place')]
cards = ''.join(f'<a class="card" href="{u}"><b>{t}</b><span>{d}</span></a>' for u, t, d in home_cards)
_pick = lambda pre: [r for r in rows if r['prefix'] == pre][:1]
_rep = _pick('MAP') + _pick('TL') + _pick('RNK') + _pick('TOP')
_feat = [('masada', 'Masada'), ('iron-dome', 'Iron Dome'), ('abraham-accords', 'Abraham Accords'), ('dead-sea-scrolls', 'Dead Sea Scrolls'), ('theodor-herzl', 'Theodor Herzl'), ('jerusalem', 'Jerusalem')]
_gb2 = {g['slug']: g for g in G}
_fl = ''.join(f'<li><a href="/g/{x}/">{E(t)}</a></li>' for x, t in _feat if x in _gb2)
cards = ''.join(f'<a class="card" href="{u}"><b>{t}</b><span>{d}</span></a>' for u, t, d in home_cards)
about_text = ('<h1>About Israel <b>NOWlej</b></h1>'
  '<p class="lead">Israel NOWlej is a growing, curated guide to Israel: its land, its history, its people and its news. The site is the living edition of the book <i>Israel NOWlej: Know the Story of the Jewish Land in Maps, Timelines, Charts, and Graphics</i> by Richard J. Koret. Every map, timeline, chart and glossary entry in the book has a permanent page here with its own ID, so a reader can scan the code in the print edition or type the address and arrive at the same place.</p>'
  '<p>Around that foundation the site adds what a printed page cannot. A daily stream of news and views from Israeli and international publishers. Video chosen from credible channels. And for each topic a single NOWlej page that brings together a summary, images, video, related reading and the sources behind them.</p>'
  '<p>The aim is a guide that is trustworthy and unhurried. Sources are named, image and text licenses are shown, and an editor approves what is featured.</p>'
  '<form class="sf big" action="/search/" role="search"><input name="q" type="search" placeholder="Search, or type an ID such as MAP-002" aria-label="Search"><button>Search</button></form>')
home = (f'<div class="newspage aboutpg"><div class="newsleftcol"><h2>From the book</h2>{tcards(_rep)}<p class="small">Each page of the book has a web page like these.</p></div>'
        f'<div class="newsleft"><div class="newsmain">{about_text}<h2>Explore</h2><div class="cards">{cards}</div><hr>'
        + about.replace('<p class="crumb"><a href="/">Home</a> / About</p>', '').replace('<h1>How to Use This Site</h1>', '<h2>How to use this site</h2>') +
        f'</div></div><aside class="newsside" aria-label="Featured"><h2>Featured entries</h2><ul class="hlist">{_fl}</ul><p class="small"><a href="/glossary/">All 407 NOWlej entries</a></p>'
        f'<span id="news-side" data-word="news" hidden></span><div id="news-latest"></div></aside></div><p class="small" id="news-status"></p>')
write('/about/', layout('About Israel NOWlej', home, 'About Israel NOWlej, and how the addresses, IDs and citations from the book Israel NOWlej work.', '/about/', '/img/p006.webp', cls=''))

news = '''<div class="newspage"><div class="adslot" data-slot="page-top" data-sizes="728x90|320x50"></div><div class="newsleftcol"><nav class="newstopics" id="news-topics" aria-label="Topics and sources"></nav><div class="adslot" data-slot="left" data-sizes="tower"></div></div><div class="newsleft"><h1>News</h1>
<div class="newsmain">

<div class="ngrid3" id="news-grid"><p>Loading the latest headlines.</p></div>
<h2 id="news-more-title" class="nmt" hidden>More headlines</h2><div class="ngrid3 hgrid" id="news-more"></div>
<div class="adslot" data-slot="lb-bottom" data-sizes="728x90|320x50"></div></div></div>
<aside class="newsside" aria-label="Latest headlines"><div class="adslot" data-slot="aside-top" data-sizes="320x100"></div><div id="news-latest"></div><h2>By source</h2><div id="news-widget"></div></aside></div>
<p class="small" id="news-status"></p>
<div class="adslot adwide" data-slot="page-bottom" data-sizes="970x250|728x90|320x100"></div>'''
write('/news/', layout('News', news, 'Headlines from public news feeds about Israel, linked to the glossary.', '/news/', cls='newspg'))
write('/', layout('Israel NOWlej', news, 'Headlines from public news feeds about Israel, with views, video, maps, timelines and a glossary.', '/', '/img/p006.webp', cls='newspg'))
write('/news/item-template/', layout('@@TITLE@@', '<div class="newspage"><div class="adslot" data-slot="page-top" data-sizes="728x90|320x50"></div><div class="newsleftcol"><nav class="newstopics" id="news-topics" aria-label="Topics and sources"></nav><div class="adslot" data-slot="left" data-sizes="tower"></div></div><div class="newsleft"><div class="newsmain"><div id="news-item">@@BODY@@</div><div class="adslot" data-slot="lb-bottom" data-sizes="728x90|320x50"></div></div></div><aside class="newsside" aria-label="Latest headlines"><div class="adslot" data-slot="aside-top" data-sizes="320x100"></div><div id="news-latest"></div><h2>By source</h2><div id="news-widget"></div></aside></div><p class="small" id="news-status"></p><div class="adslot adwide" data-slot="page-bottom" data-sizes="970x250|728x90|320x100"></div>', '@@DESC@@', '/news/item/@@K@@/', cls='newspg', nd=True))
views_html = news.replace('<h1>News</h1>', '<h1>Views</h1>').replace('id="news-grid"', 'id="news-grid" data-api="/api/news?views=1&v=2"')
write('/views/', layout('Views', views_html, 'Op-eds, editorials and blogs from Israeli news sources, linked to the glossary.', '/views/', cls='newspg'))

def card_hub(path, title, intro, cards_):
    b = f'<p class="crumb"><a href="/">Home</a> / {E(title)}</p><h1>{E(title)}</h1><p class="lead">{intro}</p><div class="cards">' + ''.join(f'<a class="card" href="{u}"><b>{E(t)}</b><span>{E(d)}</span></a>' for u, t, d in cards_) + '</div>'
    write(path, layout(title, b, intro, path))
hub('/charts/', 'Charts', 'Rankings, population graphics, top ten lists, size comparisons and reference tables.',
    [('Rankings', items('RNK')), ('Demographics', items('DEM')), ('Top Ten Lists', items('TOP')), ('Size Comparisons', [r for r in rows if hub_of(r)[0] == '/size/']), ('Tables', items('TBL'))])
hub('/media/', 'Media', 'A photographic tour of the land and the plants and animals of Israel.',
    [('A Taste of Israel', [byid[p + '-00'] for p in ['NEG', 'DSE', 'JUS', 'GAL', 'GOL', 'MED', 'TAJ', 'JHL', 'JRS', 'SHF']]), ('Flora and Fauna', [byid[p + '-00'] for p in ['TRE', 'WFL', 'WLD', 'BRD', 'MIG']])])
sb2 = '<h1>Sources</h1><p class="small">Each source has its own page here with its latest news and views.</p><ul class="idlist">' + ''.join(f'<li><a href="/sources/{i_}/">{E(n_)}</a><span>{E(d_)}</span></li>' for i_, n_, u_, d_ in SRC) + '</ul><h2>The Book</h2><ul class="idlist"><li><a href="/index/">Index</a><span>Find any name or place in the book Israel NOWlej</span></li><li><a href="/about/">How to use this site and cite it</a><span>Addresses, IDs and hubs</span></li></ul>'
write('/sources/', layout('Sources', chan('sources', sb2, '/sources/'), 'The publishers whose public feeds supply the news and views on this site.', '/sources/'))
for i_, n_, u_, d_ in SRC:
    vc_ = {'jpost': 'thejerusalem_post', 'toi': 'timesofisrael'}.get(i_, '')
    tabs_ = (f'<nav class="srctabs" id="src-tabs" aria-label="{E(n_)}"><a href="/sources/{i_}/?show=news" data-show="news">News</a><a href="/sources/{i_}/?show=views" data-show="views">Views</a>'
             + (f'<a href="/video/{vc_}/">Videos</a>' if vc_ else '') + f'<a href="/sources/{i_}/" data-show="">All</a></nav>')
    b_ = (f'<h1 id="src-h1" data-name="{E(n_)}">{E(n_)}</h1>{tabs_}<p>{E(d_)}</p><p class="small"><a href="{u_}" rel="noopener">Visit {E(n_)}</a> (external site)</p><p class="small" id="src-count"></p>'
          f'<div id="src-page" data-src="{i_}"></div><section id="src-nsec"><h2>Latest news</h2><div class="tgrid" id="src-news"><p>Loading.</p></div></section><section id="src-vsec"><h2>Latest views</h2><div class="tgrid" id="src-views"><p>Loading.</p></div></section>')
    write(f'/sources/{i_}/', layout(n_, chan('sources', b_, f'/sources/{i_}/'), f'Latest news and views from {n_}.', f'/sources/{i_}/'))
ab_ = ('<h1>Video curation</h1><p class="small">Private working page. Candidates come from YouTube search and are shown only to help you decide. Nothing here changes the site until the exported list is added to <code>video.json</code>. <a href="/admin/entry/">Entry workbench</a></p>'
       '<div class="adm"><div class="admbar"><label>Entry <select id="adm-ent"><option value="">(free search)</option></select></label><span id="adm-prog" class="small"></span></div><div class="admbar"><label>Look for <input id="adm-q" type="search" placeholder="e.g. Abraham Accords" size="28"></label>'
       '<span class="vseg" role="group" aria-label="Type"><button type="button" data-k="channels" aria-pressed="true">Channels</button><button type="button" data-k="playlists" aria-pressed="false">Playlists</button><button type="button" data-k="videos" aria-pressed="false">Videos</button></span>'
       '<button type="button" id="adm-go" class="admgo">Search</button><span id="adm-st" class="small"></span></div>'
       '<div class="admbar"><span class="small">Show</span><span class="vseg" role="group" aria-label="Filter"><button type="button" data-f="" aria-pressed="true">All</button><button type="button" data-f="new" aria-pressed="false">Undecided</button><button type="button" data-f="yes" aria-pressed="false">Approved</button><button type="button" data-f="no" aria-pressed="false">Rejected</button></span>'
       '<button type="button" id="adm-exp" class="admgo">Export approved</button></div>'
       '<div id="adm-list"></div><div id="adm-out" hidden><h2>Approved list</h2><p class="small">Copy this and send it to Claude, or add it to <code>video.json</code>.</p><textarea id="adm-ta" rows="14" readonly></textarea><p><button type="button" id="adm-copy" class="admgo">Copy</button></p></div></div>')
_bt = json.load(open(os.path.join(ROOT, 'tools', 'batches.json')))
_gb = {g['slug']: g for g in G}
write('/admin/rules.json', json.dumps(VCFG.get('curation', {}), ensure_ascii=False))
write('/admin/batches.json', json.dumps([{'id': b['id'], 'name': b['name'], 'entries': [{'slug': x, 'title': (_gb[x].get('title') or _gb[x]['name']), 'text': re.sub(r'<[^>]+>', '', body_html(_gb[x])).strip()} for x in b['slugs'] if x in _gb]} for b in _bt['batches']], ensure_ascii=False))
ae_ = ('<h1>Entry workbench</h1><p class="small">Private working page. One place to edit the text, approve images and approve video for each NOWlej entry. <a href="/admin/video/">Video curation</a></p>'
       '<div class="adm"><div class="admbar"><label>Term <select id="ae-ent"><option value="">Choose a term</option></select></label><a id="ae-open" href="#" hidden target="_blank">Open the live page</a>'
       '<span class="vseg" role="group" aria-label="Part" id="ae-tabs"><button type="button" data-t="text" aria-pressed="true">Text</button><button type="button" data-t="images" aria-pressed="false">Images</button><button type="button" data-t="video" aria-pressed="false">Video</button></span>'
       '<button type="button" class="admgo" id="ae-exp">Export finished work</button></div>'
       '<div id="ae-pane"><p>Choose a term above.</p></div><div id="ae-lb" hidden class="aelbo"></div>'
       '<div id="ae-out" hidden><h2>Finished work</h2><p class="small">Copy this and send it to Claude.</p><textarea id="ae-ta" rows="14" readonly></textarea><p><button type="button" class="admgo" id="ae-copy">Copy</button></p></div></div>')
write('/admin/entry/', layout('Entry workbench', ae_, 'Private editing page.', '/admin/entry/', cls='', nd=True))
write('/admin/video/', layout('Video curation', ab_, 'Private curation page.', '/admin/video/', cls='', nd=True))
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
shutil.copy(os.path.join(ROOT, 'tools', 'ticker.js'), os.path.join(OUT, 'ticker.js'))
shutil.copy(os.path.join(ROOT, 'tools', 'ads.js'), os.path.join(OUT, 'ads.js'))
shutil.copy(os.path.join(ROOT, 'tools', 'source.js'), os.path.join(OUT, 'source.js'))
shutil.copy(os.path.join(ROOT, 'tools', 'subnav.js'), os.path.join(OUT, 'subnav.js'))
shutil.copy(os.path.join(ROOT, 'tools', 'video.js'), os.path.join(OUT, 'video.js'))
shutil.copy(os.path.join(ROOT, 'tools', 'entry.js'), os.path.join(OUT, 'entry.js'))
shutil.copy(os.path.join(ROOT, 'tools', 'entryedit.js'), os.path.join(OUT, 'entryedit.js'))
shutil.copy(os.path.join(ROOT, 'tools', 'share.js'), os.path.join(OUT, 'share.js'))
shutil.copy(os.path.join(ROOT, 'tools', 'admin.js'), os.path.join(OUT, 'admin.js'))
shutil.copy(os.path.join(ROOT, 'tools', 'tlnav.js'), os.path.join(OUT, 'tlnav.js'))
shutil.copy(os.path.join(ROOT, 'tools', 'admin_entry.js'), os.path.join(OUT, 'admin_entry.js'))
shutil.copy(os.path.join(ROOT, 'tools', 'glossary.js'), os.path.join(OUT, 'glossary.js'))
# ---------------------------------------------------------------- data, assets, redirects, sitemap
for e_ in search:
    if e_['k'] in byid:
        th_ = make_thumb(byid[e_['k']])
        if th_: e_['i'] = th_
write('/search.json', json.dumps(search, ensure_ascii=False, separators=(',', ':')))
shutil.copy(os.path.join(ROOT, 'tools', 'style.css'), os.path.join(OUT, 'style.css'))
shutil.copy(os.path.join(ROOT, 'tools', 'site.js'), os.path.join(OUT, 'site.js'))
open(os.path.join(OUT, 'robots.txt'), 'w').write(f'User-agent: *\nAllow: /\nSitemap: {BASE}/sitemap.xml\n')
allurls = ['/', '/about/', '/news/', '/views/', '/video/', '/media/', '/charts/', '/sources/', '/subscribe/', '/signin/', '/glossary/', '/index/', '/maps/', '/timelines/', '/tables/', '/demographics/', '/rankings/', '/top-ten/', '/size/', '/tour/', '/flora/'] + [r['url'] for r in rows] + [f'/g/{g["slug"]}/' for g in G]
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

# cache-bust assets: version every local script/stylesheet reference by content hash
import hashlib, re as _re
_v = hashlib.md5(b''.join(open(os.path.join(OUT, f), 'rb').read() for f in sorted(os.listdir(OUT)) if f.endswith(('.js', '.css')))).hexdigest()[:8]
for _d, _s, _fs in os.walk(OUT):
    if '.git' in _d or os.sep + 'tools' in _d: continue
    for _f in _fs:
        if _f.endswith('.html'):
            _p = os.path.join(_d, _f); _t = open(_p, encoding='utf-8').read()
            _n = _re.sub(r'((?:src|href)="/[A-Za-z_]+\.(?:js|css))"', r'\1?v=' + _v + '"', _t)
            if _n != _t: open(_p, 'w', encoding='utf-8').write(_n)

write_subnav_json()
