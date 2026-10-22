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

GENERATED = ['maps', 'timelines', 'tables', 'population', 'demographics', 'rankings', 'top-ten', 'tour', 'flora', 'g', 'glossary', 'index', 'size', 'about', 'search', 'news', 'views', 'video', 'subscribe', 'signin', 'charts', 'media', 'audio', 'images', 'hot', 'sources', 'admin']
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

DROP = re.compile(r'^(Illustration, AI generated|ISRAEL IN MAPS|©.*Koret.*|.*israel(inmaps|nowlej)\.com.*|\d+)$')
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
            if not full or full.startswith('©') or full.startswith('Illustration') or 'israelnowlej.com' in full or 'israelinmaps.com' in full: continue
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
# site-only changes: "Canaanite flourishing" is folded into the Canaan entry, and extra entries are added
G = [g for g in G if g['name'] != 'Canaanite flourishing']
for _x in json.load(open(os.path.join(ROOT, 'tools', 'extra_glossary.json')))['entries']:
    _run = []
    for _i, _part in enumerate(re.split(r'\[\[(.*?)\]\]', _x['text'])):
        _run.append((_part, _i % 2 == 1))
    G.append({'name': _x['name'], 'he': _x['he'], 'cat': _x['cat'], 'segs': [_run], 'see': _x.get('see', ''), 'app': '', 'pg': None, '_m': 'body'})

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
         'herod': 'herod-the-great', "herod s": 'herod-the-great', 'maccabees': 'maccabees', 'philistine': 'philistines', 'canaanite flourishing': 'canaan-land', 'canaan': 'canaan-land', 'herod the great': 'herod-the-great',
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
NAV = [('/', 'News'), ('/views/', 'Views'), ('/media/', 'Media'), ('/glossary/', 'NOWlej'), ('/sources/', 'Sources')]
BASE = 'https://israelnowlej.com'

VCFG = json.load(open(os.path.join(ROOT, 'video.json')))
def vslug(c): return (c.get('handle') or c.get('id') or '').lower()
def plslug(c): return 'pl-' + c['id'].lower()
SUBNAV = {
 'news': [('Security', '/news/#mode=topics&tp=security'), ('Diplomacy', '/news/#mode=topics&tp=diplomacy'), ('Politics', '/news/#mode=topics&tp=politics'), ('Tech', '/news/#mode=topics&tp=technology'), ('Business', '/news/#mode=topics&tp=business')],
 'views': [('All Views', '/views/'), ('Op-Ed', '/views/#mode=topics&kind=Op-Ed'), ('Editorial', '/views/#mode=topics&kind=Editorial'), ('Blogs', '/views/#mode=topics&kind=Blog'), ('Voices', '/who/')],
 'nowlej': [('Maps', '/maps/'), ('Tours', '/tour/'), ('Times', '/timelines/'), ('Charts', '/charts/'), ('Topics', '/hot/'), ('Book', '/about/'), ('A-Z', '/glossary/')],
 'maps': [('Historical Maps', '/maps/'), ('Size Comparisons', '/size/'), ('Israel Tour', '/tour/')],
 'charts': [('Rankings', '/rankings/'), ('Demographics', '/demographics/'), ('Top Ten', '/top-ten/'), ('Size Comparisons', '/size/'), ('Tables', '/tables/')],
 'media': [('Video', '/video/'), ('Playlists', '/playlists/'), ('Podcasts', '/audio/'), ('Music', '/music/'), ('Images', '/images/')],
 'images': [('A Taste of Israel', '/tour/'), ('Flora and Fauna', '/flora/')],
 'video': [(c['name'], f'/video/{vslug(c)}/') for c in VCFG['channels']],
 'who': [('All', '/who/'), ('Groups', '/who/#g=org'), ('Influencers', '/who/#g=voice'), ('IDF voices', '/who/#g=idf')],
 'glossary': [('People and Groups', '/glossary/#c=people-and-groups'), ('Places', '/glossary/#c=places'), ('Events', '/glossary/#c=events'), ('Buildings and Sites', '/glossary/#c=buildings-and-sites'), ('Works', '/glossary/#c=works')],
}
SHORT = {'Patriarchs to the First Kings': 'Patriarchs and Kings', 'Kings, Exile and Return': 'Exile and Return', 'Greeks, Hasmoneans and Romans': 'Greeks and Romans', 'Centuries of Foreign Rule': 'Foreign Rule', 'The Ottoman Land': 'Ottomans', 'Zionism Takes Shape': 'Zionism Takes Shape'}
def tl_links():
    return [(SHORT.get(r['title'], r['title'].replace('The ', '')), r['url']) for r in rows if r['prefix'] == 'TL']
def sec_links(sec):
    if sec == 'timelines': return tl_links()
    if sec == 'sources': return [('Publications', '/sources/'), ('Influencers', '/sources/influencers/'), ('Organizations', '/sources/organizations/')] if True else [({'toi': 'Times of Israel', 'jpost': 'Jerusalem Post', 'ynet': 'Ynet', 'israelhayom': 'Israel Hayom', 'jns': 'JNS'}.get(i_, n_), f'/sources/{i_}/') for i_, n_, _, _ in SRC]
    return SUBNAV.get(sec, [])
def write_subnav_json():
    m = {}
    for u, t in NAV:
        k = u.strip('/').split('/')[0] or 'news'
        k = {'glossary': 'nowlej'}.get(k, k)
        m[u] = sec_links(k)
    write('/subnav.json', json.dumps(m))
TOPSEC = {'': 'news', 'news': 'news', 'views': 'views', 'voices': 'views', 'who': 'sources', 'hot': 'nowlej', 'sources': 'sources', 'video': 'media', 'audio': 'media', 'images': 'media', 'maps': 'nowlej', 'timelines': 'nowlej', 'charts': 'nowlej', 'media': 'media', 'glossary': 'nowlej', 'g': 'nowlej',
          'tables': 'nowlej', 'demographics': 'nowlej', 'rankings': 'nowlej', 'top-ten': 'nowlej', 'size': 'nowlej', 'tour': 'media', 'flora': 'media'}
TOPIDX = {'news': 0, 'views': 1, 'media': 2, 'nowlej': 3, 'sources': 4}
CTX2 = {'timelines': 'timelines', 'charts': 'charts', 'tables': 'charts', 'demographics': 'charts', 'rankings': 'charts', 'top-ten': 'charts', 'size': 'charts',
        }
def subnav_for(path):
    seg = path.strip('/').split('/')[0]
    top = TOPSEC.get(seg, '')
    links = sec_links(top) if top else []
    trend = 'views' if top == 'views' else ('news' if top == 'news' or seg == 'sources' else '')
    idx = TOPIDX.get(top, '')
    html_ = ''.join(f'<a href="{u}">{E(t)}</a>' for t, u in links)
    out = f'<div class="wrap subnav" id="subnav" data-trend="{trend}"{" data-c=%d" % idx if idx != "" else ""}{"" if links else " hidden"}>{html_}<span class="trend" id="trend" hidden></span></div>'
    c2 = CTX2.get(seg)
    if c2:
        l2 = sec_links(c2)
        out += f'<div class="wrap subnav sub2" id="subnav2"{" data-c=%d" % idx if idx != "" else ""}>' + ''.join(f'<a href="{u}">{E(t)}</a>' for t, u in l2) + '</div>'
    return out

def layout(title, body, desc='', path='/', og=None, cls='', nd=False):
    if 'class="newspage' in body and 'newspg' not in cls: cls = (cls + ' newspg').strip()
    news_js = 'class="newspage' in body or path in ('/news/', '/views/') or path.startswith('/g/') or path.startswith('/news/item/')
    _seg = path.strip('/').split('/')[0]
    _cur = TOPIDX.get(TOPSEC.get(_seg, ''), -1)
    nav = ''.join(f'<a href="{u}" data-n="{i}"{" class=\"cur\" aria-current=\"true\"" if i == _cur else ""}>{t}</a>' for i, (u, t) in enumerate(NAV))
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
<div class="rcol"><div class="acct"><a class="subbtn" href="/subscribe/">Subscribe</a><a class="signin" href="/signin/">Sign in</a><a class="signin sbtn" href="/search/">Search</a></div><form class="sf" action="/search/" role="search"><input name="q" type="search" placeholder="keyword(s)" aria-label="Search"><button>Search</button></form></div></div>
<nav class="wrap" aria-label="Sections">{nav}</nav>{subnav_for(path)}</header>
<main id="main" class="wrap">{body}</main>
<footer><div class="wrap"><div class="fcols">
<div class="fcol fbrand"><b>Israel NOWlej</b><p>News, views, maps, timelines, charts and media on the Holy Land. The companion to the book by Richard J. Koret.</p></div>
<nav class="fcol" aria-label="About"><b>About</b><a href="/about/">About us</a><a href="/about/">How to use this site</a><a href="/cite/">Use and citation</a><a href="/contact/">Contact</a></nav>
<nav class="fcol" aria-label="Explore"><b>Explore</b><a href="/news/">News</a><a href="/views/">Views</a><a href="/media/">Media</a><a href="/glossary/">NOWlej A-Z</a><a href="/hot/">HOT topics</a><a href="/sources/">Sources</a></nav>
<nav class="fcol" aria-label="Follow and contribute"><b>Follow</b><a href="/subscribe/">Subscribe</a><a href="/feed/">Feeds (RSS)</a><a href="/submit/">Send an article, video or nomination</a><a href="/sitemap.xml">Sitemap</a></nav>
<nav class="fcol" aria-label="Legal"><b>Legal</b><a href="/legal/">Legal notice</a><a href="/legal/#privacy">Privacy</a><a href="/legal/#terms">Terms of use</a><a href="/legal/#corrections">Corrections</a></nav></div>
<p class="fsmall">&copy; 2003 to 2026 Richard J. Koret. All rights reserved. Page images are shown for reference with the book <i>Israel NOWlej</i>. Headlines and videos belong to their publishers.</p></div></footer>
<script src="/site.js" defer></script><script src="/share.js" defer></script><script src="/ticker.js" defer></script><script src="/whoimg.js" defer></script>{'<script src="/ads.js" defer></script><script src="/news.js" defer></script>' if news_js else ''}{'<script src="/subnav.js" defer></script><script src="/aside.js" defer></script>' + ('<script src="/nowrow.js" defer></script>' if path in ('/glossary/', '/maps/', '/tour/', '/timelines/', '/charts/', '/hot/', '/about/', '/size/', '/rankings/', '/demographics/', '/tables/', '/top-ten/', '/population/', '/flora/') else '') + ('<script src="/featured.js" defer></script>' if path in ('/media/', '/video/', '/playlists/', '/audio/', '/music/', '/images/') else '')}{'<script src="/entryedit.js" defer></script>' if path.startswith('/g/') else ''}{'<script src="/video.js" defer></script>' if path.startswith('/video/') or path == '/media/' or path.startswith('/g/') else ''}{'<script src="/entry.js" defer></script><script src="/slideshow.js" defer></script>' if path.startswith('/g/') else ''}{'<script src="/glossary.js" defer></script>' if path == '/glossary/' else ''}{'<script src="/zoom.js" defer></script>' if path == '/maps/' else ''}{'<script src="/voices.js" defer></script>' if path.startswith('/who/') else ''}{'<script src="/audio.js" defer></script>' if path == '/audio/' else ''}{'<script src="/hot.js" defer></script>' if path.startswith('/hot/') else ''}{'<script src="/submit.js" defer></script>' if path in ('/submit/', '/admin/submissions/') else ''}{'<script src="/entry.js" defer></script><script src="/slideshow.js" defer></script>' if path.startswith('/who/') and path != '/who/' else ''}{'<script src="/source.js" defer></script>' if path.startswith('/sources/') and path != '/sources/' else ''}{'<script src="/admin.js" defer></script>' if path == '/admin/video/' else ''}{'<script src="/tlnav.js" defer></script>' if path.startswith('/timelines/') and path != '/timelines/' else ''}{'<script src="/admin_entry.js" defer></script>' if path == '/admin/entry/' else ''}</body></html>'''

def write(path, content):
    fp = os.path.join(OUT, path.lstrip('/'))
    if path.endswith('/'): fp = os.path.join(fp, 'index.html')
    os.makedirs(os.path.dirname(fp), exist_ok=True)
    open(fp, 'w', encoding='utf-8').write(content)

def citation(r):
    pg = r['pages']
    p = f'p. {pg[0]}' if len(pg) == 1 else f'pp. {pg[0]} to {pg[-1]}'
    return f'Israel NOWlej (2027), {r["id"]}, {p}, israelnowlej.com/{r["id"].lower()}'

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
       ('ynet', 'Ynet Global', 'https://www.ynetnews.com/', 'The English edition of Ynet, the news site of the Yedioth Ahronoth group.'),
       ('haaretz', 'Haaretz', 'https://www.haaretz.com/', 'The English edition of the Israeli daily Haaretz, with news, analysis and opinion.'),
       ('jns', 'JNS', 'https://www.jns.org/', 'Jewish News Syndicate, a news service on Israel, the Middle East and Jewish communities worldwide.'),
       ('israelhayom', 'Israel Hayom', 'https://www.israelhayom.com/', 'The English edition of the Israeli daily Israel Hayom.'),
       ('jta', 'JTA', 'https://www.jta.org/', 'The Jewish Telegraphic Agency, a global Jewish news service founded in 1917, covering Israel and Jewish communities worldwide.'),
       ('inn', 'Israel National News', 'https://www.israelnationalnews.com/', 'Arutz Sheva, a news outlet with English, Hebrew and other editions, reporting from a religious Zionist perspective.'),
       ('i24', 'i24NEWS', 'https://www.i24news.tv/', 'Israeli international news channel broadcasting from Jaffa in English, French and Arabic.'),
       ('globes', 'Globes', 'https://en.globes.co.il/', 'English edition of the Israeli business daily, covering the economy, markets and companies.'),
       ('calcalist', 'Calcalist', 'https://www.calcalistech.com/', 'Israeli business and technology news from the Calcalist group, with a focus on startups and the tech sector.'),
       ('tablet', 'Tablet', 'https://www.tabletmag.com/', 'Online magazine of Jewish news, ideas and culture, known for long essays.'),
       ('mef', 'Middle East Forum', 'https://www.meforum.org/', 'A Philadelphia think tank publishing analysis and commentary on the Middle East from a conservative perspective.'),
       ('ji', 'Jewish Insider', 'https://jewishinsider.com/', 'Washington-based outlet covering Israel, US politics and Jewish affairs, with a focus on policy and Congress.'),
       ('kan', 'Kan News English', 'https://www.kan.org.il/en/', 'English news from Kan, the Israeli public broadcaster.')]
SRCNAME = {a: b for a, b, _, _ in SRC}
SECKEY = {'/charts/': 'charts', '/images/': 'media', '/maps/': 'maps', '/timelines/': 'timelines', '/tables/': 'charts', '/demographics/': 'charts', '/rankings/': 'charts', '/top-ten/': 'charts', '/size/': 'charts', '/tour/': 'media', '/flora/': 'media'}
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
        return 'Images', '/images/', [('A Taste of Israel', '/tour/', [(byid[x + '-00']['url'], byid[x + '-00']['title']) for x in ['NEG', 'DSE', 'JUS', 'GAL', 'GOL', 'MED', 'TAJ', 'JHL', 'JRS', 'SHF']]),
                                    ('Flora and Fauna', '/flora/', [(byid[x + '-00']['url'], byid[x + '-00']['title']) for x in ['TRE', 'WFL', 'WLD', 'BRD', 'MIG']])]
    if sk == 'video':
        return 'Video', '/video/', [('Channels', None, [(f'/video/{vslug(c)}/', c['name']) for c in VCFG['channels']])] + ([('Playlists', None, [('/video/#playlists', 'All playlists')])] if VCFG.get('playlists') else [])
    if sk == 'glossary':
        ls = sorted({key(g['name'])[0].upper() for g in G})
        return 'NOWlej', '/glossary/', [('A-Z', None, [(f'/glossary/#l{L}', L) for L in ls])]
    return 'Sources', '/sources/', [('Sources and the book', None, [('/sources/', 'All sources')] + [(f'/sources/{i_}/', n_) for i_, n_, _, _ in SRC] + [('/index/', 'Index'), ('/about/', 'How to use this site')])]

def secnav(sk, active=''):
    title, hub_u, groups = sec_groups(sk)
    total = sum(len(g[2]) for g in groups)
    cur = ' aria-current="page"'
    o = f'<nav class="newstopics secnav{" az" if groups and groups[0][0] == "A-Z" else ""}" aria-label="In this section">' + ('' if sk == 'video' else f'<h2><a href="{hub_u}"{cur if active == hub_u else ""}>{E(title)}</a></h2>')
    for gt, gu, lst in groups:
        op = total <= 40 or any(u == active for u, _ in lst) or active == gu
        lk = f'<a href="{gu}">{E(gt)}</a>' if gu else E(gt)
        o += f'<details{" open" if op else ""}><summary>{lk}</summary><ul>' + ''.join(
            f'<li><a href="{u}"{cur if u == active else ""}>{E(t)}</a></li>' for u, t in lst) + '</ul></details>'
    return o + '</nav>'

def chan(sk, body, active='', views=False, vl=False, left=None, aside=None):
    wd = 'views' if views else 'news'
    vside = sk == 'video' or vl
    body = re.sub(r'<p class="crumb">.*?</p>', '', body, count=1)
    noleft = sk in ('maps', 'timelines', 'charts', 'voices')
    return (f'<div class="newspage{" noleft" if noleft else ""}"><div class="adslot" data-slot="page-top" data-sizes="728x90|320x50"></div>'
            + ('' if noleft else (f'<div class="newsleftcol secleft wholeft">{left}</div>' if left else f'<div class="newsleftcol">{secnav(sk, active)}<div class="adslot" data-slot="left" data-sizes="tower"></div></div>')) +
            f'<div class="newsleft"><div class="newsmain">{body}<div class="adslot" data-slot="lb-bottom" data-sizes="728x90|320x50"></div></div></div>'
            f'<aside class="newsside" aria-label="Latest {wd}"><div class="adslot" data-slot="aside-top" data-sizes="320x100"></div>{aside if aside else ('<div id="vid-list" class="vlist"></div>' if vside else f'<span id="news-side" data-word="{wd}" hidden></span><div id="news-latest"></div><h2>By source</h2><div id="news-widget"></div>')}</aside></div>'
            f'{"" if vside else "<p class=\"small\" id=\"news-status\"></p>"}')

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
    plain_ = SECKEY.get(hub) in ('maps', 'timelines', 'charts')
    body = f'''<p class="crumb"><a href="/">Home</a> / <a href="{hub}">{E(hubt)}</a></p>
<article><header class="ih">{"" if plain_ else f'<span class="id">{r["id"]}</span>'}<h1>{E(r["title"])}</h1>
<p class="meta">{E(kind)} · {E(r["section"])}{"" if plain_ else f" · {ptxt}"}</p>{region}</header>
{stn_html(r, st)}
<div class="cite"><p><b>Cite this page</b></p><p class="citeline" id="cite">{E(cit)}</p><button type="button" class="copy" data-copy="{E(cit)}">Copy citation</button>
<p class="small">Short address: <a href="{r["short"]}">israelnowlej.com{r["short"]}</a></p></div>
{sub}{rel}
<nav class="pn" aria-label="Previous and next">{pn}</nav>
<details class="txt"><summary>Text of this page</summary>{text}</details>
<p class="small">Corrections: none recorded. This is the current version. The 2027 print edition copy is at <a href="/2027{r["short"]}">israelnowlej.com/2027{r["short"]}</a>.</p></article>'''
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
    if pg is None: return ''
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
    srcs_ = f'<li>The book <i>Israel NOWlej</i> by Richard J. Koret, glossary, page {g["pg"]}.</li>' if g['pg'] else '<li>Written for this site from standard reference works on the ancient Near East.</li>'
    _c = CUR.get('wikipedia', {}).get(sl)
    if _c: srcs_ += f'<li>Text adapted in part from <a href="{E(_c["url"])}" rel="noopener">{E(_c["article"])}</a> (revision {_c["rev"]}), <a href="https://creativecommons.org/licenses/by-sa/4.0/" rel="noopener">CC BY-SA 4.0</a>.</li>'
    body = f"""<article class="gl"><header class="ih"><span class="id">NOWlej · {f'book page {g["pg"]}' if g['pg'] else 'site entry'}</span><h1>{E(g["title"])} {he}</h1><p class="meta">{cat}</p></header>
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
        tc_ = tcards(items_)
        if SECKEY[path] == 'charts': tc_ = re.sub(r'<span class="(?:tid|tp)">.*?</span>', '', tc_)
        b += tc_
    write(path, layout(title, chan(SECKEY[path], '<div class="hubslide">' + b + '</div>', path), intro, path, f'/img/p{groups[0][1][0]["pages"][0]:03d}.webp' if groups and groups[0][1] else None))

def items(prefix, pred=lambda r: True): return [r for r in rows if r['prefix'] == prefix and pred(r)]
def map_hub():
    os.makedirs(os.path.join(OUT, 'img', 't'), exist_ok=True); [shutil.copy(os.path.join(ROOT, 'tools', f_), os.path.join(OUT, 'img', 't', f_)) for f_ in ('maps-cover.webp', 'maps-cover-left.webp', 'maps-cover-right.webp')]
    split_ = open(os.path.join(ROOT, 'tools', 'maps-cover-split.txt')).read().strip()
    from PIL import Image as _I
    def th(r):
        nm = 'mapf-' + r['id'].lower(); fn = os.path.join(OUT, 'img', 't', nm + '.webp'); os.makedirs(os.path.dirname(fn), exist_ok=True)
        if not os.path.exists(fn):
            ims = [_I.open(os.path.join(OUT, 'img', f'p{pg:03d}.webp')).convert('RGB') for pg in r['pages'][:2]]
            comp = _I.new('RGB', (sum(i.width for i in ims), max(i.height for i in ims)), (255, 255, 255)); x = 0
            for i in ims: comp.paste(i, (x, 0)); x += i.width
            W_ = 640 if len(ims) == 2 else 420
            comp = comp.resize((W_, int(comp.height * W_ / comp.width)), _I.LANCZOS); comp.save(fn, quality=74)
            r['_tw'] = (comp.width, comp.height)
        return '/img/t/' + nm + '.webp'
    def tile(r, cls):
        src = th(r); w_, h_ = (640, 400) if len(r['pages']) >= 2 else (420, 525)
        return f'<a class="tltile" href="{r["url"]}" title="{E(r["title"])}"><img src="{src}" alt="{E(r["title"])}" width="{w_}" height="{h_}" loading="lazy"></a>'
    hist = [r for r in rows if r['prefix'] == 'MAP' and int(r['num']) < 30]
    size_ = [r for r in rows if r['prefix'] == 'MAP' and int(r['num']) >= 30]
    b = '<p class="crumb"><a href="/">Home</a> / Maps</p><h1>Maps</h1><p class="small">Thirty-three maps of the land from the patriarchs to today. Select a map to open it.</p>'
    b += '<h2>Historical Maps</h2><div class="tlmosaic wide"><div class="tltile cover"><img src="/img/t/maps-cover.webp" alt="Israel&#8217;s Story in Maps: thirty-three maps from the patriarchs to today" width="960" height="600"><button type="button" class="zh zl" style="width:' + split_ + '%" data-zoom="/img/t/maps-cover-left.webp" aria-label="Enlarge the map"></button><button type="button" class="zh zr" style="left:' + split_ + '%" data-zoom="/img/t/maps-cover-right.webp" aria-label="Enlarge the title page"></button></div>' + ''.join(tile(r, 'w') for r in hist) + '</div>'
    b += '<h2>Size Comparisons</h2><div class="tlmosaic">' + ''.join(tile(r, 'p') for r in size_) + '</div>'
    write('/maps/', layout('Maps', chan('maps', b, '/maps/'), 'Thirty-three maps of the land from the patriarchs to today. Every map has its own address, such as israelnowlej.com/map-002.', '/maps/', '/img/p004.webp'))
map_hub()
def tl_hub():
    from PIL import Image as _I
    def th(pg, nm):
        fn = os.path.join(OUT, 'img', 't', nm + '.webp'); os.makedirs(os.path.dirname(fn), exist_ok=True)
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
def catname(g): return g.get('catname') or (g['cat'].title().replace(' And ', ' and ') if g['cat'] else 'Other')
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
HOT_ = json.load(open(os.path.join(ROOT, 'tools', 'hot.json')))
_wh = [{'name': v_['name'], 'slug': v_['id'], 'he': '', 'cat': 'WHOS', 'catname': 'Voices', 'href': f'/who/{v_["id"]}/', 'intro': v_['intro']} for v_ in json.load(open(os.path.join(ROOT, 'voices.json')))['voices'] if not v_.get('hidden')]
glcards = glcards + _wh
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
        b_ = g['intro'] if g.get('href') else re.sub(r'<[^>]+>', '', body_html(g)).strip()
        d_ = b_
        cn = catname(g); cs = catslug(cn)
        tr = None if g.get('href') else gl_thumb(g); th = make_thumb(tr) if tr else None
        if th: nthumb += 1
        img = (f'<img src="{th}" alt="" width="{THUMB_W}" height="{THUMB_H}" loading="lazy">' if th else f'<span class="tile c-{cs}"{(" data-who=\"" + g["slug"] + "\"") if g.get("href") else ""}><b>{E(key(g["name"])[0].upper())}</b></span>')
        he_ = f'<span class="he" lang="he" dir="rtl">{E(g["he"])}</span>' if g['he'] else ''
        gh += (f'<a class="gcard" href="{g.get("href") or "/g/" + g["slug"] + "/"}" data-c="{cs}" data-n="{E((g["name"] + " " + g["he"] + " " + d_).lower())}"><span class="gimg">{img}</span>'
               f'<span class="gb"><span class="gcat c-{cs}">{E(cn)}</span><b>{E(g["name"])}</b>{he_}<span class="gd">{E(d_)}</span></span></a>')
    gh += '</div></section>'
print('glossary cards', len(glcards), 'with related thumbnail', nthumb)
write('/glossary/', layout('NOWlej', chan('glossary', gh, '/glossary/'), 'NOWlej: entries on people, places, events, works, buildings and Voices.', '/glossary/'))

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
<h2>Addresses</h2><p>Type <b>israelnowlej.com/map-002</b> in any browser. It redirects to the full page, <b>israelnowlej.com/maps/002/zion-terrain</b>. If a title is ever corrected the full address may change. The ID and the short address never change.</p>
<h2>Hubs</h2><p>A bare prefix opens the whole group: /map, /tl, /tbl, /dem, /rnk, /top, /size, /tour, /flora, /gl. The glossary is at /glossary and the book index at /index.</p>
<h2>Cite a page</h2><p>Each page shows a citation line and a Copy citation button, for example: Israel NOWlej (2027), MAP-002, p. 6, israelnowlej.com/map-002. The ID is enough for any later edition. The page number fits the 2027 print edition only.</p>
<h2>Editions</h2><p>The short address always shows the current version. Each edition also keeps a frozen copy, for example /2027/map-002, so a citation from the 2027 book can be checked against what the book showed. Corrections are listed on the page with a date.</p>
<h2>Scanning a code</h2><p>Each code in the book encodes the same short address. If a code is damaged, type the address printed beside it.</p>
<h2>About the book</h2><p>Israel NOWlej: Know the Story of the Jewish Land in Maps, Timelines, Charts, and Graphics, by Richard J. Koret. This site is the companion to the book. Some illustrations in the book are marked as AI generated.</p>'''
for pth_, ttl_, txt_ in [('/subscribe/', 'Subscribe', 'Subscriptions are coming soon. They will bring a daily digest of the news and views on this site.'),
                         ('/signin/', 'Sign in', 'Accounts are coming soon. For now the whole site is open to read without signing in.')]:
    write(pth_, layout(ttl_, chan('sources', f'<h1>{ttl_}</h1><p>{txt_}</p>'), ttl_ + ' to Israel NOWlej.', pth_, nd=True))


_legal='<h1>Legal notice</h1><p class="lead">The terms that apply to this site. It is a reading companion to a book, not a news agency or an advisory service.</p><h2 id="terms">Terms of use</h2><p>You may read the site, link to any page and quote short passages with credit. See <a href="/cite/">Use and citation</a> for how. Copying whole pages, maps, timelines, charts or images, or using them in another product, needs written permission from the author.</p><h2>Copyright</h2><p>&copy; 2003 to 2026 Richard J. Koret. All rights reserved. Text, maps, timelines, charts and the glossary are the author\'s work except where a page says otherwise. Some illustrations in the book are marked as AI generated.</p><h2>Third party material</h2><p>Headlines, summaries, videos, podcasts and images from other publishers are shown by link or embed and belong to their owners. Their views are theirs. A listing is not an endorsement. HOT topic pages state the strongest case on each side and point to sources, so they will include views the author does not share.</p><h2>No advice</h2><p>Nothing here is legal, medical, financial or travel advice. Facts are checked with care, but check the sources before relying on them, and tell us about errors.</p><h2 id="privacy">Privacy</h2><p>The site has no accounts yet and does not ask you to sign in. It does not sell data. Pages may load fonts, embedded video and, later, advertising from other companies, which can set their own cookies under their own policies. If you send us an item through the form, we keep what you send and the contact detail you give, only to review it and reply.</p><h2 id="corrections">Corrections</h2><p>If something is wrong, use the <a href="/submit/">form</a> and choose a correction. Each page lists dated corrections.</p>'
_cite='<h1>Use and citation</h1><p class="lead">How to quote, link to and cite Israel NOWlej.</p><h2>Cite a page</h2><p>Every map, timeline and chart has an ID. Cite it like this: Israel NOWlej (2027), MAP-002, p. 6, israelnowlej.com/map-002. The ID is enough for any later edition. The page number fits the 2027 print edition only.</p><h2>Cite a glossary entry</h2><p>Koret, Richard J. Israel NOWlej, NOWlej A-Z, entry name, israelnowlej.com/g/entry-name, accessed date.</p><h2>Cite news, views and media</h2><p>Cite the original publisher and link to it. This site only lists and links them.</p><h2>What you may do</h2><p>Link freely. Quote short passages with credit. Use a map or chart in a class by linking to it. For print, a website, a film or a product, ask first through the <a href="/contact/">contact page</a>.</p><h2>Frozen editions</h2><p>Each edition keeps a frozen copy, for example /2027/map-002, so a citation from the book can be checked against what the book showed.</p>'
_contact='<h1>Contact</h1><p class="lead">The form is the best way to reach us. It goes to the author and the site editor.</p><div class="cards"><a class="card" href="/submit/"><b>Send an article, video or nomination</b><span>Suggest something for News, Views, Media or Voices.</span></a><a class="card" href="/submit/"><b>Report an error</b><span>Facts, dates, names, links or maps that look wrong.</span></a><a class="card" href="/submit/"><b>Permissions and press</b><span>Using material in print, film or teaching.</span></a></div><p>Do not send passwords or payment details through any form.</p>'
_feed='<h1>Feeds</h1><p class="lead">Follow what is new without visiting.</p><h2>Site updates</h2><p><a href="/feed.xml">Israel NOWlej feed (RSS)</a>. It lists the HOT topics and main sections with the date of the latest build. Paste the address into any feed reader.</p><h2>Daily digest</h2><p>An email digest is coming. See <a href="/subscribe/">Subscribe</a>.</p><h2>Headlines</h2><p>News and Views are gathered live from the publishers\' own public feeds, listed under <a href="/sources/">Sources</a>.</p>'
for pth_, ttl_, txt_, d_ in [('/legal/','Legal notice',_legal,'Terms of use, copyright, privacy and corrections for Israel NOWlej.'),('/cite/','Use and citation',_cite,'How to quote, link to and cite Israel NOWlej.'),('/contact/','Contact',_contact,'How to contact Israel NOWlej.'),('/feed/','Feeds',_feed,'RSS feed and updates from Israel NOWlej.')]:
    write(pth_, layout(ttl_, chan('sources', txt_), d_, pth_, nd=True))
import datetime as _dt
_now=_dt.datetime.utcnow().strftime('%a, %d %b %Y %H:%M:%S GMT')
_items=[('/hot/','HOT topics','Contested issues: the strongest case against, the best answers, and sources.')]+[(f'/hot/{t_["slug"]}/',t_['title'],t_.get('short','')) for t_ in HOT_['topics']]+[('/news/','News','Headlines from public feeds.'),('/views/','Views','Op-eds and blogs.'),('/media/','Media','Video, audio and images.'),('/who/','Voices','People and groups worth following.')]
_x='<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Israel NOWlej</title><link>https://israelnowlej.com/</link><description>News, views, maps, timelines, charts and media on the Holy Land.</description><language>en</language><lastBuildDate>'+_now+'</lastBuildDate>'+''.join(f'<item><title>{E(t)}</title><link>https://israelnowlej.com{u}</link><guid>https://israelnowlej.com{u}</guid><description>{E(d)}</description></item>' for u,t,d in _items)+'</channel></rss>'
open(os.path.join(OUT,'feed.xml'),'w').write(_x)

sb = '''<h1>Search</h1><form class="sf big" action="/search/" role="search"><input id="q" name="q" type="search" placeholder="Try map-002, Masada, Rabin, olive" aria-label="Search" autofocus><button>Search</button></form>
<p class="small">Searches live news and views, maps, timelines, charts, media and the glossary.</p><ul class="results" id="results"></ul>'''
write('/search/', layout('Search', chan('sources', sb), 'Search news, views, maps, timelines, charts, media and the glossary.', '/search/', nd=True))
nf = '''<h1>That address is not here</h1><p class="lead">It may be a typing slip or an ID from a later edition. Search for it below, or browse from the home page.</p>
<form class="sf big" action="/search/" role="search"><input id="q" name="q" type="search" aria-label="Search" placeholder="keyword(s)"><button>Search</button></form>
<ul class="results" id="results"></ul><p><a href="/">Go to the home page</a></p>'''
write('/404.html', layout('Not found', nf, 'Not found', '/404.html', nd=True, cls='nf'))

home_cards = [('/maps/', 'Maps', '33 maps'), ('/timelines/', 'Timelines', '19 timelines'), ('/rankings/', 'Rankings', '17 rankings'),
              ('/demographics/', 'Demographics', '13 graphics'), ('/top-ten/', 'Top Ten Lists', '6 lists'), ('/size/', 'Size Comparisons', 'Israel beside other places'),
              ('/tables/', 'Tables', '5 reference tables'), ('/tour/', 'A Taste of Israel', '10 regions, 71 stops'), ('/flora/', 'Flora and Fauna', '5 sections, 60 entries'),
              ('/glossary/', 'Glossary', f'{len([g_ for g_ in G if not g_.get("cf")])} entries'), ('/index/', 'Index', 'Find any name or place')]
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
        f'</div></div><aside class="newsside" aria-label="Featured"><h2>Featured entries</h2><ul class="hlist">{_fl}</ul><p class="small"><a href="/glossary/">All {len([g_ for g_ in G if not g_.get("cf")])} NOWlej entries</a></p>'
        f'<span id="news-side" data-word="news" hidden></span><div id="news-latest"></div></aside></div><p class="small" id="news-status"></p>')

# ---- voices and Who's Who: organizations and individuals
VOICES_ = [v_ for v_ in json.load(open(os.path.join(ROOT, 'voices.json')))['voices'] if not v_.get('hidden')]
def who_sort(v): return re.sub(r'^(the|a)\s+', '', key(v['name'])).strip()
def voices_pages():
    def tile(v):
        return f'<a class="vtile {v["kind"]}" href="/who/{v["id"]}/"><b>{E(v["name"])}</b><span>{E(v["intro"].split(". ")[0])}.</span></a>'
    hubb = ('<h1>Voices</h1><p class="small">Organizations and individuals who make the case for Israel, with their latest articles, podcasts and video in one place. Each has a Voices entry. Everything links to the original and is credited to its source.</p>'
            + '<h2>Organizations</h2><div class="vtiles">' + ''.join(tile(v) for v in VOICES_ if v['kind'] == 'org') + '</div>'
            + '<h2>Individuals</h2><div class="vtiles">' + ''.join(tile(v) for v in VOICES_ if v['kind'] == 'voice' and v.get('group') != 'idf') + '</div>'
            + '<h2>IDF spokespeople</h2><div class="vtiles">' + ''.join(tile(v) for v in VOICES_ if v.get('group') == 'idf') + '</div>')
    write('/voices/', layout('Voices', chan('voices', hubb, '/voices/', views=True), 'Organizations and individuals who make the case for Israel, with their latest articles, podcasts and video.', '/voices/'))
    lst = sorted(VOICES_, key=who_sort)
    newp = ''.join(f'<li><a href="/who/{v["id"]}/">{E(v["name"])}</a></li>' for v in reversed(VOICES_[-6:]))
    wside = ('<div class="wlatest" id="wlatest"><h2>Latest across NOWlej</h2>'
             '<section data-k="news"><h3>News</h3><ul></ul></section><section data-k="views"><h3>Views</h3><ul></ul></section>'
             '<section data-k="video"><h3>Video</h3><div class="wlv"></div></section>'
             f'<section><h3>New in Voices</h3><ul>{newp}</ul></section>'
             '<p class="small"><a href="/news/">All news</a> · <a href="/views/">All views</a> · <a href="/video/">All video</a></p></div>')
    def wholeft(cur=''):
        def grp(t, f): return f'<h3>{t}</h3><ul>' + ''.join(f'<li><a href="/who/{v["id"]}/"{" aria-current=\"page\"" if v["id"] == cur else ""}>{E(v["name"])}</a></li>' for v in lst if f(v)) + '</ul>'
        return ('<nav class="newstopics secnav wholist" aria-label="Voices"><h2><a href="/who/">Voices</a></h2>'
                + grp('Individuals', lambda v: v['kind'] == 'voice' and v.get('group') != 'idf') + grp('IDF spokespeople', lambda v: v.get('group') == 'idf') + grp('Organizations', lambda v: v['kind'] == 'org') + '</nav>')
    def wcard(v):
        ini = ''.join(w_[0] for w_ in re.sub(r'^The ', '', v['name']).replace('-', ' ').split()[:2]).upper()
        col = 't%d' % (1 + sum(map(ord, v['id'])) % 5)
        grp = 'idf' if v.get('group') == 'idf' else v['kind']
        hay = key(v['name'] + ' ' + v['intro'] + ' ' + v.get('tags', '') + ' ' + grp)
        return (f'<a class="wcard" href="/who/{v["id"]}/" data-g="{grp}" data-h="{E(hay)}"><span class="wph {col}" data-who="{v["id"]}"><span>{E(ini)}</span></span>'
                f'<span class="wtx"><b>{E(v["name"])}</b><span class="wc">{E(v.get("tags", ""))}</span></span>'
                f'<span class="wd"><span class="wdt">{E(v["intro"])}</span> <span class="wmore" hidden>MORE</span></span></a>')
    wb = ('<h1>Voices</h1><p class="small">Entries on the organizations and people who shape the conversation about Israel. Each has an introduction, images, video and podcasts, more background, and the latest articles.</p>'
          '<div class="wfilter"><input id="wq" type="search" placeholder="Find a person, organization or topic" aria-label="Find in Voices">'
          '<div class="wchips" id="wchips"><button type="button" data-g="" aria-pressed="true">All</button><button type="button" data-g="voice" aria-pressed="false">Individuals</button><button type="button" data-g="org" aria-pressed="false">Organizations</button><button type="button" data-g="idf" aria-pressed="false">IDF spokespeople</button></div></div>'
          '<div class="wgrid" id="wgrid">' + ''.join(wcard(v) for v in lst) + '</div><p class="small" id="wnone" hidden>No match. Try a shorter word.</p>'
          '<p class="subcta"><b>Missing someone?</b> <a href="/submit/?type=nominee">Nominate a person or organization</a> or <a href="/submit/?type=apply">apply to be listed</a>.</p>')
    write('/who/', layout('Voices', chan('glossary', wb, '/who/', left=wholeft(), aside=wside), 'Voices: the organizations and people who shape the conversation about Israel.', '/who/'))
    for v in VOICES_:
        wk = v.get('wiki') or v['name']
        kind = 'Organization' if v['kind'] == 'org' else 'Individual'
        ini = ''.join(w_[0] for w_ in re.sub(r'^The ', '', v['name']).replace('-', ' ').split()[:2]).upper()
        col = 't%d' % (1 + sum(map(ord, v['id'])) % 5)
        site_ = f'<a class="vjump alt" href="{E(v["site"])}" rel="noopener" target="_blank">Official site</a>' if v.get('site') else ''
        body = (f'<article class="gl who"><div class="whohero"><div class="whoph {col}{" org" if v["kind"] == "org" else ""}" id="who-ph" data-who="{v["id"]}" data-wiki="{E(wk)}"><span class="ini">{E(ini)}</span></div>'
                f'<div class="whotx"><h1>{E(v["name"])}</h1><p class="wcred">{E(v.get("tags", ""))}</p></div>'
                f'<p class="lead edef" id="e-def"><span class="edt">{E(v["intro"])}</span> <a class="econt more" id="e-more" href="#e-summary" hidden>MORE</a></p>'
                f'<p class="whobtn"><a class="vjump vb" id="wb-pod" href="#v-pods" hidden>Podcasts</a><a class="vjump vb" id="wb-vid" href="#e-video" hidden>Videos</a><a class="vjump vb" id="wb-pl" href="#e-video" data-t="playlists" hidden>Playlists</a><a class="vjump" href="#v-articles">Blogs</a><a class="vjump vn" href="#v-news">News</a>{site_}</p>'
                f'<p class="claim"><a href="/submit/?type=claim&name={urllib.parse.quote(v["name"])}">Is this your profile? Send corrections, additions or removals</a></p></div>'
                '<nav class="esec" id="esec" aria-label="On this page"><a href="#e-images" data-s="e-images" hidden>Images</a><a href="#e-video" data-s="e-video" hidden>Video</a><a href="#e-summary" data-s="e-summary" hidden>More NOWlej</a><a href="#v-articles">Articles</a><a href="#v-news">News About</a><a href="#e-related">Related</a><a href="#e-sources">Sources</a></nav>'
                f'<section id="e-images" hidden data-name="{E(wk)}"><div class="egal" id="e-gal"></div><p class="small">Photographs from Wikimedia Commons. Click an image to enlarge it. Author and license are shown with each.</p></section>'
                f'<section id="e-video" hidden><div id="voice-page" data-id="{v["id"]}"></div><div class="vtop" id="v-player" hidden></div><div class="vtabs" id="v-tabs" role="group" aria-label="Choose from"><button type="button" data-t="videos" aria-pressed="true">Videos</button><button type="button" data-t="playlists" aria-pressed="false" hidden>Playlists</button></div><div id="v-clips" hidden><ul class="vclips"></ul></div><div id="v-playlists" hidden><ul class="vpls2"></ul></div><div id="v-pods" hidden><h2>Podcast episodes</h2><ul class="vlist2"></ul></div></section>'
                f'<section id="e-summary" hidden><h2>MORE NOWLEJ</h2><div id="e-wiki" data-wiki="{E(wk)}" hidden></div></section>'
                f'<section id="e-related"><h2>Related</h2><p><b>See also</b> <a href="/who/">Voices</a> · <a href="/glossary/">NOWlej A-Z</a></p></section>'
                f'<section id="v-articles"><h2>Articles</h2><ul class="vlist2"><li>Loading.</li></ul></section>'
                f'<section id="v-news"><h2>News About {E(v["name"])}</h2><ul class="vlist2"><li>Loading.</li></ul></section>'
                f'<p class="subcta">Know a good article or video about {E(v["name"])}? <a href="/submit/?type=article&about={urllib.parse.quote(v["name"])}">Send it to us</a> or <a href="/submit/?type=video&about={urllib.parse.quote(v["name"])}">suggest a video</a>.</p>'
                f'<section id="e-sources"><h2>Sources</h2><ul class="esrc" id="e-src"><li>Headlines, short excerpts and links come from the public feeds of {E(v["name"])} and from news search results, and are credited to and link to the original publisher.</li></ul></section></article>')
        write(f'/who/{v["id"]}/', layout(v['name'], chan('glossary', body, '/who/', left=wholeft(v['id']), aside=wside), v['intro'], f'/who/{v["id"]}/'))
        search.append({'t': v['name'], 'u': f'/who/{v["id"]}/', 'k': 'WHO’S WHO', 's': kind + (' · IDF spokesperson' if v.get('group') == 'idf' else ''), 'x': (v['intro'] + ' ' + v.get('tags', '') + (' influencer podcaster guest expert' if v['kind'] == 'voice' else ' organization media'))[:700]})
voices_pages()

# ---- HOT: contested issues
def hot_pages():
    H_ = HOT_; T_ = H_['topics']; vmap = {v_['id']: v_ for v_ in VOICES_}
    def left(cur=''):
        return ('<nav class="newstopics secnav wholist hotleft" aria-label="HOT topics"><h2><a href="/hot/">HOT</a></h2><h3>Contested issues</h3><ul>'
                + ''.join(f'<li><a href="/hot/{t["slug"]}/"{" aria-current=\"page\"" if t["slug"] == cur else ""}>{E(t["short"])}</a></li>' for t in T_) + '</ul></nav>')
    def aside(t=None):
        kw = E(json.dumps(t['kw'] if t else []))
        return (f'<div class="hotfeed" id="hot-feed" data-kw="{kw}"><h2>{"On this topic now" if t else "Latest on contested issues"}</h2>'
                '<section data-k="news"><h3>News</h3><ul></ul></section><section data-k="views"><h3>Views</h3><ul></ul></section>'
                '<p class="small">Matches come from headlines in the live news and views feeds. Coverage is credited to its publisher.</p></div>')
    note = ('<p class="hotmeta"><b>Contested issue</b> · Draft for editorial review · As of ' + E(H_['asof']) + '</p>')
    corr = '<p class="subcta"><a href="/submit/?type=claim&name=HOT">Send a correction or a source</a></p>'
    hubb = ('<h1>HOT: Contested Issues</h1>' + note + f'<p class="lead">{E(H_["intro"])}</p><div class="hotgrid">'
            + ''.join(f'<a class="hotcard" href="/hot/{t["slug"]}/"><span class="hotera">{E(t["era"])}</span><b>{E(t["title"])}</b><span>{E(t["brief"].split(". ")[0])}.</span></a>' for t in T_)
            + '</div><h2>How we handle contested issues</h2><ul class="hotrules"><li>Every topic is titled as the question people really ask.</li>'
              '<li>We state the best case of Israel&#8217;s adversaries in their own terms, as they would want it put, before we answer it.</li>'
              '<li>We then give the best answers, with evidence, and we say plainly where the evidence is thin.</li>'
              '<li>We separate what the record shows from what is argued. Every date and figure names its source.</li>'
              '<li>We link to sources that address the question directly and forthrightly, including the adversaries&#8217; own work, so readers can judge for themselves.</li>'
              '<li>Pages show when they were last reviewed and are corrected in public.</li></ul>'
              '<p class="subcta">Know a topic we should cover, or a source we missed? <a href="/submit/?type=nominee">Tell us</a>.</p>' + corr)
    write('/hot/', layout('HOT: Contested Issues', chan('glossary', hubb, '/hot/', left=left(), aside=aside()), 'Contested issues about Israel, set out with the claim, the record, both sides and sources.', '/hot/'))
    search.append({'t': 'HOT: Contested Issues', 'u': '/hot/', 'k': 'HOT', 's': 'Contested issues', 'x': 'contested controversial hot topics ' + ' '.join(t['short'] for t in T_)})
    for t in T_:
        li = lambda xs: '<ul>' + ''.join(f'<li>{E(x)}</li>' for x in xs) + '</ul>'
        vc = ''.join(f'<li><a href="/who/{i_}/"><b>{E(vmap[i_]["name"])}</b></a><span>{E(n_)}</span></li>' for i_, n_ in t['voices'] if i_ in vmap)
        srcs = ''.join('<li>' + (f'<a href="{E(u_)}" rel="noopener" target="_blank">{E(a_)}</a>' if u_ else f'<b>{E(a_)}</b>') + f'<span>{E(n_)}</span></li>' for a_, n_, u_ in t['sources'])
        rel = ''.join(f'<a href="/g/{sl_}/">{E(used[sl_]["title"])}</a> · ' for sl_ in t['related'] if sl_ in used).rstrip(' · ')
        body = (f'<article class="gl hot"><p class="hottag"><a href="/hot/">HOT</a> · {E(t["era"])}</p><h1>{E(t["title"])}</h1>{note}'
                f'<div class="hotbrief"><b>In brief</b><p>{E(t["brief"])}</p></div>'
                f'<h2>What is claimed</h2>{li(t["claim"])}<h2>What the record shows</h2>{li(t["record"])}'
                f'<h2>The case and the answers</h2><div class="hot2"><section><h3>The strongest case against</h3>{li(t["critics"])}</section><section><h3>The best answers</h3>{li(t["defenders"])}</section></div>'
                f'<h2>Key dates</h2><ul class="hotdates">' + ''.join(f'<li><b>{E(d_)}</b> {E(x_)}</li>' for d_, x_ in t['dates']) + '</ul>'
                f'<h2>Who addresses this</h2><p class="small">Profiles with articles, videos and podcasts. Open a profile for the full list.</p><ul class="hotlist">{vc}</ul>'
                f'<h2>Direct sources and further study</h2><ul class="hotlist">{srcs}</ul>'
                + (f'<h2>Related on NOWlej</h2><p>{rel}</p>' if rel else '')
                + f'<p class="subcta">Know a good article, video or podcast on this issue? <a href="/submit/?type=article&about={urllib.parse.quote(t["short"])}">Send it to us</a>.</p>'
                '<p class="small">Links to outside sources are provided for study and do not imply endorsement. Figures and rulings are described as of the date shown.</p>' + corr + '</article>')
        write(f'/hot/{t["slug"]}/', layout(t['short'] + ' (HOT)', chan('glossary', body, '/hot/', left=left(t['slug']), aside=aside(t)), t['brief'], f'/hot/{t["slug"]}/'))
        search.append({'t': t['title'], 'u': f'/hot/{t["slug"]}/', 'k': 'HOT', 's': 'Contested issue · ' + t['era'], 'x': t['brief'] + ' ' + ' '.join(t['kw'])})
hot_pages()

# ---- Media landing and Audio
SHOWS_ = json.load(open(os.path.join(ROOT, 'voices.json'))).get('shows', [])
AUD_ = [dict(v_, own=True) for v_ in SHOWS_] + [v_ for v_ in VOICES_ if v_.get('pods')]
_aleft = ('<nav class="newstopics secnav wholist" aria-label="Podcasts"><h2><a href="/audio/">Podcasts</a></h2><h3>Shows</h3><ul>'
          + ''.join(f'<li><a href="#s-{v_["id"]}">{E(v_["name"])}</a></li>' for v_ in AUD_) + '</ul></nav>')
def _ini(n):
    w_ = [x for x in re.sub(r'^The ', '', n.split(':')[0]).split() if x[:1].isalpha() and x.lower() not in ('of', 'the', 'with')]
    return (w_[0][0] + (w_[1][0] if len(w_) > 1 else '')).upper()
_apick = ('<nav class="apick" aria-label="Choose a show">' + ''.join(
    f'<a href="#s-{v_["id"]}"><span class="apic c{i_ % 6}"' + ('' if v_.get('own') else f' data-who="{v_["id"]}"') + f'><span class="ini">{E(_ini(v_["name"]))}</span></span><span class="apn">{E(re.sub(r"^The ", "", v_["name"].split(":")[0]).replace(" Daily Briefing", " Briefing").replace("Jerusalem Post", "JPost"))}</span></a>'
    for i_, v_ in enumerate(AUD_)) + '</nav>')
_ab = ('<h1>Podcasts</h1>' + _apick + '<p class="small">Podcasts and audio shows from the people and organizations in Voices. Choose an episode to play it here. Episodes are credited to and link to their original shows.</p>'
       '<div class="atop" id="a-top" hidden><div class="anow" id="a-now"></div><audio id="a-audio" controls preload="none"></audio></div>'
       '<div id="a-shows">' + ''.join(f'<section class="ashow" id="s-{v_["id"]}" data-id="{v_["id"]}"><h2>{E(v_["name"]) if v_.get("own") else f'<a href="/who/{v_["id"]}/">{E(v_["name"])}</a>'}</h2><ul class="alist"><li>Loading.</li></ul></section>' for v_ in AUD_) + '</div>'
       '<p class="subcta">Know a podcast we should include? <a href="/submit/?type=nominee">Send us a nomination</a>.</p>')
write('/audio/', layout('Podcasts', chan('audio', _ab, '/audio/', left=_aleft), 'Podcasts and audio shows on Israel from the people and organizations in Voices.', '/audio/'))

# ---- submissions form
def submit_page():
    b = ('<h1>Send us something</h1><p class="lead">Help build the best archive and living directory of pro-Israel media. Send an article or a video, nominate someone for Voices, or apply to be listed. Every submission is read by a person before anything is published.</p>'
         '<form id="subform" class="subform" novalidate><fieldset><legend>What are you sending?</legend>'
         '<label><input type="radio" name="type" value="article" checked> An article</label><label><input type="radio" name="type" value="video"> A video</label>'
         '<label><input type="radio" name="type" value="nominee"> A nomination for Voices</label><label><input type="radio" name="type" value="apply"> I want to be listed</label><label><input type="radio" name="type" value="claim"> This is my profile</label></fieldset>'
         '<div class="sf-row" data-for="claim" hidden><p class="small">Thank you for finding your profile. Tell us what to correct, add or remove. To protect you from impostors we will reply to the email below and may ask you to confirm from an official address before we change anything. Removal requests are handled promptly.</p><label>What would you like us to do? <select name="change"><option value="correct">Correct something</option><option value="add">Add something</option><option value="remove">Remove something or the whole profile</option></select></label></div>'
         '<div class="sf-row" data-for="article video"><label>Web address (full link) <input name="url" type="url" placeholder="https://"></label></div>'
         '<div class="sf-row" data-for="article video"><label>Title, if you know it <input name="title" maxlength="200"></label></div>'
         '<div class="sf-row" data-for="article video"><label>Who or what is it about? <input name="about" maxlength="120" placeholder="A person or organization in Voices, or a topic"></label></div>'
         '<div class="sf-row" data-for="nominee apply claim" hidden><label>Name of the person or organization <input name="name" maxlength="120"></label></div>'
         '<div class="sf-row" data-for="nominee apply claim" hidden><label>Links: website, YouTube, podcast, blog or feed addresses <textarea name="links" rows="3" maxlength="800"></textarea></label></div>'
         '<div class="sf-row"><label>Why it belongs, or a few words about it <textarea name="notes" rows="4" maxlength="2000"></textarea></label></div>'
         '<div class="sf-row"><label>Your name <input name="from" maxlength="120" autocomplete="name"></label></div>'
         '<fieldset class="sf-contact"><legend>How can we reach you? Give one or more.</legend><div class="sf-row"><label>Email <input name="email" type="email" autocomplete="email"></label></div>'
         '<div class="sf-row"><label>WhatsApp number, with country code <input name="whatsapp" type="tel" placeholder="+972..." autocomplete="tel"></label></div>'
         '<div class="sf-row"><label>Telegram username <input name="telegram" placeholder="@name"></label></div>'
         '<div class="sf-row"><label>Instagram username <input name="instagram" placeholder="@name"></label></div></fieldset>'
         '<div class="sf-hp" aria-hidden="true"><label>Leave this empty <input name="website" tabindex="-1" autocomplete="off"></label></div>'
         '<div class="sf-row"><label class="sf-ck"><input type="checkbox" name="consent"> You may review this and email me about it. My contact details stay private and are not published.</label></div>'
         '<p><button type="submit" class="vjump">Send</button> <span id="sub-msg" role="status"></span></p></form>'
         '<p class="small">We list only material that is public and credited to its source. Being listed is an editorial decision and is never guaranteed. Videos play embedded and articles link to the original publisher.</p>')
    write('/submit/', layout('Send us something', chan('voices', b, '/submit/', views=True), 'Submit an article or video, nominate someone for Voices, or apply to be listed.', '/submit/'))
    ad = ('<h1>Submissions</h1><p class="small">Private working page. Enter the admin key once. It stays in this browser only. <a href="/admin/entry/">Entry workbench</a></p>'
          '<p><input id="sa-key" type="password" placeholder="Admin key" autocomplete="off"> <button type="button" id="sa-go">Load</button> <select id="sa-f"><option value="new">New</option><option value="approved">Approved</option><option value="done">Done</option><option value="rejected">Rejected</option><option value="">All</option></select></p><p id="sa-msg" class="small"></p><div id="sa-list"></div>')
    write('/admin/submissions/', layout('Submissions', ad, 'Private working page.', '/admin/submissions/', cls='', nd=True))
submit_page()
write('/about/', layout('About Israel NOWlej', home, 'About Israel NOWlej, and how the addresses, IDs and citations from the book Israel NOWlej work.', '/about/', '/img/p006.webp', cls=''))

news = '''<div class="newspage"><div class="adslot" data-slot="page-top" data-sizes="728x90|320x50"></div><div class="newsleftcol"><nav class="newstopics" id="news-topics" aria-label="Topics and sources"></nav><div class="adslot" data-slot="left" data-sizes="tower"></div></div><div class="newsleft"><h1>News</h1>
<div class="newsmain">

<div class="ngrid3" id="news-grid"><p>Loading the latest headlines.</p></div>
<h2 id="news-more-title" class="nmt" hidden>More headlines</h2><div class="ngrid3 hgrid" id="news-more"></div>
<div class="adslot" data-slot="lb-bottom" data-sizes="728x90|320x50"></div></div></div>
<aside class="newsside" aria-label="Latest headlines"><div class="adslot" data-slot="aside-top" data-sizes="320x100"></div><div id="news-latest"></div><h2>By source</h2><div id="news-widget"></div></aside></div>
<p class="small" id="news-status"></p>
'''
write('/news/', layout('News', news, 'Headlines from public news feeds about Israel, linked to the glossary.', '/news/', cls='newspg'))
write('/', layout('Israel NOWlej', news, 'Headlines from public news feeds about Israel, with views, video, maps, timelines and a glossary.', '/', '/img/p006.webp', cls='newspg'))
write('/news/item-template/', layout('@@TITLE@@', '<div class="newspage"><div class="adslot" data-slot="page-top" data-sizes="728x90|320x50"></div><div class="newsleftcol"><nav class="newstopics" id="news-topics" aria-label="Topics and sources"></nav><div class="adslot" data-slot="left" data-sizes="tower"></div></div><div class="newsleft"><div class="newsmain"><div id="news-item">@@BODY@@</div><div class="adslot" data-slot="lb-bottom" data-sizes="728x90|320x50"></div></div></div><aside class="newsside" aria-label="Latest headlines"><div class="adslot" data-slot="aside-top" data-sizes="320x100"></div><div id="news-latest"></div><h2>By source</h2><div id="news-widget"></div></aside></div><p class="small" id="news-status"></p>', '@@DESC@@', '/news/item/@@K@@/', cls='newspg', nd=True))
views_html = news.replace('<h1>News</h1>', '<h1>Views</h1>').replace('id="news-grid"', 'id="news-grid" data-api="/api/news?views=1&v=2"')
write('/views/', layout('Views', views_html, 'Op-eds, editorials and blogs from Israeli news sources, linked to the glossary.', '/views/', cls='newspg'))

def card_hub(path, title, intro, cards_):
    b = f'<p class="crumb"><a href="/">Home</a> / {E(title)}</p><h1>{E(title)}</h1><p class="lead">{intro}</p><div class="cards">' + ''.join(f'<a class="card" href="{u}"><b>{E(t)}</b><span>{E(d)}</span></a>' for u, t, d in cards_) + '</div>'
    write(path, layout(title, b, intro, path))
hub('/charts/', 'Charts', 'Rankings, population graphics, top ten lists, size comparisons and reference tables.',
    [('Rankings', items('RNK')), ('Demographics', items('DEM')), ('Top Ten Lists', items('TOP')), ('Size Comparisons', [r for r in rows if hub_of(r)[0] == '/size/']), ('Tables', items('TBL'))])
hub('/images/', 'Images', 'A photographic tour of the land and the plants and animals of Israel.',
    [('A Taste of Israel', [byid[p + '-00'] for p in ['NEG', 'DSE', 'JUS', 'GAL', 'GOL', 'MED', 'TAJ', 'JHL', 'JRS', 'SHF']]), ('Flora and Fauna', [byid[p + '-00'] for p in ['TRE', 'WFL', 'WLD', 'BRD', 'MIG']])])
_ml = ('<nav class="newstopics secnav wholist" aria-label="Media"><h2><a href="/media/">Media</a></h2><h3><a href="/video/">Video</a></h3><ul>' + ''.join(f'<li><a href="/video/{vslug(c)}/">{E(c["name"])}</a></li>' for c in VCFG['channels']) + '</ul>'
       '<h3><a href="/audio/">Podcasts</a></h3><ul>' + ''.join(f'<li><a href="/audio/#s-{v_["id"]}">{E(v_["name"])}</a></li>' for v_ in AUD_) + '</ul>'
       '<h3><a href="/images/">Images</a></h3><ul><li><a href="/tour/">A Taste of Israel</a></li><li><a href="/flora/">Flora and Fauna</a></li></ul></nav>')
_mb = ('<h1>Media</h1><p class="lead">Video, playlists, podcasts, music and images from the land and the people who talk about it.</p><div class="cards">'
       '<a class="card" href="/video/"><b>Video</b><span>Curated channels, playlists and clips.</span></a>'
       '<a class="card" href="/audio/"><b>Podcasts</b><span>Podcasts and audio shows.</span></a>'
       '<a class="card" href="/images/"><b>Images</b><span>A photographic tour of the land, plants and animals.</span></a></div>'
       '<h2>Featured</h2><div class="cards"><a class="card" href="/who/"><b>Voices</b><span>Videos, podcasts and articles from the voices that shape the conversation.</span></a>'
       '<a class="card" href="/tour/"><b>A Taste of Israel</b><span>Ten regions in photographs.</span></a><a class="card" href="/flora/"><b>Flora and Fauna</b><span>Trees, flowers, wildlife and migrating birds.</span></a></div>')
write('/media/', layout('Media', chan('media', _mb, '/media/', left=_ml, aside='<div id="vid-list" class="vlist"></div>'), 'Video, playlists, podcasts, music and images from the land and the people who talk about it.', '/media/'))
sb2 = '<h1>Sources</h1><p class="small">Each source has its own page here with its latest news and views.</p><ul class="idlist">' + ''.join(f'<li><a href="/sources/{i_}/">{E(n_)}</a><span>{E(d_)}</span></li>' for i_, n_, u_, d_ in SRC) + '</ul><h2>The Book</h2><ul class="idlist"><li><a href="/index/">Index</a><span>Find any name or place in the book Israel NOWlej</span></li><li><a href="/about/">How to use this site and cite it</a><span>Addresses, IDs and hubs</span></li></ul>'
write('/sources/', layout('Sources', chan('sources', sb2, '/sources/'), 'The publishers whose public feeds supply the news and views on this site.', '/sources/'))
for i_, n_, u_, d_ in SRC:
    vc_ = {'jpost': 'thejerusalem_post', 'toi': 'timesofisrael', 'jns': 'jns'}.get(i_, '')
    tabs_ = (f'<nav class="srctabs" id="src-tabs" aria-label="{E(n_)}">' + ('' if i_ in ('ji',) else f'<a href="/sources/{i_}/?show=news" data-show="news">News</a>') + f'<a href="/sources/{i_}/?show=views" data-show="views">Views</a>'
             + (f'<a href="/video/{vc_}/">Videos</a>' if vc_ else '') + f'<a href="/sources/{i_}/" data-show="">All</a></nav>')
    b_ = (f'<h1 id="src-h1" data-name="{E(n_)}">{E(n_)}</h1>{tabs_}<p>{E(d_)}</p><p class="small"><a href="{u_}" rel="noopener">Visit {E(n_)}</a> (external site)</p><p class="small" id="src-count"></p>'
          f'<div id="src-page" data-src="{i_}"></div><section id="src-nsec"><h2>Latest news</h2><div class="tgrid" id="src-news"><p>Loading.</p></div></section><section id="src-vsec"><h2>Latest views</h2><div class="tgrid" id="src-views"><p>Loading.</p></div></section>')
    write(f'/sources/{i_}/', layout(n_, chan('sources', b_, f'/sources/{i_}/', left='<nav class="newstopics secnav" aria-label="Sources"><h2><a href="/sources/">Sources</a></h2><ul><li><a href="/sources/">All sources</a></li><li><a href="/index/">Index</a></li><li><a href="/about/">How to use this site</a></li></ul></nav>', aside='<span id="news-side" data-word="news" hidden></span><div id="news-latest"></div>'), f'Latest news and views from {n_}.', f'/sources/{i_}/'))
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
shutil.copy(os.path.join(ROOT, 'tools', 'voices.js'), os.path.join(OUT, 'voices.js'))
shutil.copy(os.path.join(ROOT, 'tools', 'audio.js'), os.path.join(OUT, 'audio.js'))
shutil.copy(os.path.join(ROOT, 'tools', 'hot.js'), os.path.join(OUT, 'hot.js'))
shutil.copy(os.path.join(ROOT, 'tools', 'slideshow.js'), os.path.join(OUT, 'slideshow.js'))
shutil.copy(os.path.join(ROOT, 'tools', 'whoimg.js'), os.path.join(OUT, 'whoimg.js'))
shutil.copy(os.path.join(ROOT, 'tools', 'submit.js'), os.path.join(OUT, 'submit.js'))
shutil.copy(os.path.join(ROOT, 'tools', 'ticker.js'), os.path.join(OUT, 'ticker.js'))
shutil.copy(os.path.join(ROOT, 'tools', 'ads.js'), os.path.join(OUT, 'ads.js'))
shutil.copy(os.path.join(ROOT, 'tools', 'source.js'), os.path.join(OUT, 'source.js'))
shutil.copy(os.path.join(ROOT, 'tools', 'subnav.js'), os.path.join(OUT, 'subnav.js'))
shutil.copy(os.path.join(ROOT, 'aside.js'), os.path.join(OUT, 'aside.js'))
shutil.copy(os.path.join(ROOT, 'featured.js'), os.path.join(OUT, 'featured.js'))
shutil.copy(os.path.join(ROOT, 'nowrow.js'), os.path.join(OUT, 'nowrow.js'))
shutil.copy(os.path.join(ROOT, 'tools', 'video.js'), os.path.join(OUT, 'video.js'))
shutil.copy(os.path.join(ROOT, 'tools', 'entry.js'), os.path.join(OUT, 'entry.js'))
shutil.copy(os.path.join(ROOT, 'tools', 'entryedit.js'), os.path.join(OUT, 'entryedit.js'))
shutil.copy(os.path.join(ROOT, 'tools', 'share.js'), os.path.join(OUT, 'share.js'))
shutil.copy(os.path.join(ROOT, 'tools', 'zoom.js'), os.path.join(OUT, 'zoom.js'))
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
allurls = ['/', '/voices/', '/who/', '/hot/', '/submit/'] + [f'/hot/{t_["slug"]}/' for t_ in HOT_['topics']] + [f'/who/{v_["id"]}/' for v_ in VOICES_] + [ '/about/', '/news/', '/views/', '/video/', '/media/', '/audio/', '/images/', '/charts/', '/sources/', '/subscribe/', '/signin/', '/glossary/', '/index/', '/maps/', '/timelines/', '/tables/', '/demographics/', '/rankings/', '/top-ten/', '/size/', '/tour/', '/flora/'] + [r['url'] for r in rows] + [f'/g/{g["slug"]}/' for g in G]
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
R('/g/canaanite-flourishing', '/g/canaan-land/')
R('/g/canaanite-flourishing/', '/g/canaan-land/')
for p in range(173, 210): R(f'/gl-{p}', f'/g/{[g for g in G if g["pg"] == p][0]["slug"]}/')
for v_ in VOICES_: red.append((f'/voices/{v_["id"]}/', f'/who/{v_["id"]}/', 301))
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
