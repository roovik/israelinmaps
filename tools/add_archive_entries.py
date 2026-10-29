#!/usr/bin/env python3
"""Publish tools/archive_entries.json into the built site without a full book rebuild.
1. Merges the entries into tools/extra_glossary.json, so every later full build includes them.
2. Writes /g/<slug>/ pages from the template of an existing extra entry (Philistia).
3. Adds cards to /glossary/, terms to /glossary.json, rows to /search.json and URLs to /sitemap.xml.
Safe to run again: entries already present are replaced, not duplicated.
Usage: python3 tools/add_archive_entries.py   (from the repo root)"""
import json, os, re, html
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
J = lambda p: json.load(open(os.path.join(ROOT, p), encoding='utf-8'))
def save(p, s): open(os.path.join(ROOT, p), 'w', encoding='utf-8').write(s)
E = lambda s: html.escape(s, quote=True)
def slugify(s):
    s = s.replace('’', '').replace("'", '').replace('&', ' and ')
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')
catslug = lambda c: re.sub(r'[^a-z]+', '-', c.lower()).strip('-')
A = J('tools/archive_entries.json')['entries']
def invert(n):
    if ', ' in n:
        a, b = n.split(', ', 1); m = re.match(r'(.*?)( \(.*\))$', b)
        return f'{m.group(1)} {a}{m.group(2)}' if m else f'{b} {a}'
    return n
for a in A: a['title'] = invert(a['name']); a['slug'] = slugify(a['title'])
NEW = {a['slug'] for a in A}

# 1. extra_glossary.json
X = J('tools/extra_glossary.json')
X['entries'] = [x for x in X['entries'] if slugify(x['name']) not in NEW] + [{k: a[k] for k in ('name', 'he', 'cat', 'text')} for a in A]
save('tools/extra_glossary.json', json.dumps(X, ensure_ascii=False, indent=1))

# link targets: every glossary term plus the new entries
G = [g for g in J('glossary.json') if g[1] not in NEW]
TERM = {t: sl for n, sl, al in G for t in [n] + al}
TERM.update({a['name']: a['slug'] for a in A}); TERM.update({a['title']: a['slug'] for a in A})
def linked(t): return re.sub(r'\[\[(.*?)\]\]', lambda m: f'<a href="/g/{TERM[m.group(1)]}/">{m.group(1)}</a>', html.escape(t, quote=False))
def plain(t): return re.sub(r'\[\[(.*?)\]\]', r'\1', t)

# 2. pages from the Philistia template
T = open(os.path.join(ROOT, 'g/philistia/index.html'), encoding='utf-8').read()
P0 = 'The coastal plain of southern Canaan held by the Philistines from about 1175 BCE'
lead0 = re.search(r'<p class="lead edef" id="e-def">(.*?)<a class="econt"', T, re.S).group(1)
src0 = re.search(r'<ul class="esrc" id="e-src">(.*?)</ul>', T, re.S).group(1)
for a in A:
    pl = plain(a['text']); d155 = E(pl[:155])
    s = T.replace(lead0, linked(a['text']))
    s = re.sub(r'(<meta name="description" content=")[^"]*', lambda m: m.group(1) + d155, s)
    s = re.sub(r'(<meta property="og:description" content=")[^"]*', lambda m: m.group(1) + d155, s)
    s = s.replace('Philistia | Israel NOWlej', f'{E(a["title"])} | Israel NOWlej')
    s = s.replace('<h1>Philistia <span class="he" lang="he" dir="rtl">פלשת</span></h1><p class="meta">Places</p>', f'<h1>{E(a["title"])} <span class="he" lang="he" dir="rtl">{E(a["he"])}</span></h1><p class="meta">{E(a["cat"])}</p>')
    s = s.replace('/g/philistia/', f'/g/{a["slug"]}/').replace('data-slug="philistia"', f'data-slug="{a["slug"]}"').replace('data-name="Philistia"', f'data-name="{E(a["title"])}"').replace('data-wiki="Philistia"', f'data-wiki="{E(a["title"])}"')
    s = s.replace(src0, '<li>Written for this site, revised and checked from the topic pages of the earlier Israel NOWlej site (2025).</li>')
    assert 'Philistia' not in s.replace('philistines', ''), a['name']
    os.makedirs(os.path.join(ROOT, 'g', a['slug']), exist_ok=True)
    save(f'g/{a["slug"]}/index.html', s)

# 3a. glossary cards, in alphabetical order inside each letter
GI = open(os.path.join(ROOT, 'glossary/index.html'), encoding='utf-8').read()
GI = re.sub(r'<a class="gcard" href="/g/(' + '|'.join(map(re.escape, NEW)) + r')/".*?</span></span></a>', '', GI, flags=re.S)
def card(a):
    pl = plain(a['text']); cs = catslug(a['cat'])
    return (f'<a class="gcard" href="/g/{a["slug"]}/" data-c="{cs}" data-n="{E((a["name"] + " " + a["he"] + " " + pl).lower())}"><span class="gimg"><span class="tile c-{cs}"><b>{E(a["name"][0].upper())}</b></span></span>'
            f'<span class="gb"><span class="gcat c-{cs}">{E(a["cat"])}</span><b>{E(a["name"])}</b><span class="he" lang="he" dir="rtl">{E(a["he"])}</span><span class="gd">{E(pl)}</span></span></a>')
for a in sorted(A, key=lambda x: x['name'].lower()):
    L = a['name'][0].upper()
    m = re.search(rf'<section class="gsec" data-l="{L}">.*?</section>', GI, re.S); assert m, L
    sec = m.group(0)
    cards = list(re.finditer(r'<a class="gcard" href="/g/[^"]+/"[^>]*>.*?</span><b>(.*?)</b>.*?</span></span></a>', sec, re.S))
    pos = next((c.start() for c in cards if html.unescape(c.group(1)).lower() > a['name'].lower()), None)
    pos = pos if pos is not None else sec.rfind('</div></section>')
    sec2 = sec[:pos] + card(a) + sec[pos:]
    GI = GI[:m.start()] + sec2 + GI[m.end():]
save('glossary/index.html', GI)

# 3b. glossary.json, search.json, sitemap.xml
save('glossary.json', json.dumps(G + [[a['title'], a['slug'], sorted({a['title'], a['name']})] for a in A], ensure_ascii=False, separators=(',', ':')))
S = [x for x in J('search.json') if not any(x.get('u') == f'/g/{sl}/' for sl in NEW)]
S += [{'t': f'{a["title"]} {a["he"]}', 'u': f'/g/{a["slug"]}/', 'k': 'GLOSSARY', 's': a['cat'], 'x': E(plain(a['text']))[:300]} for a in A]
save('search.json', json.dumps(S, ensure_ascii=False, separators=(',', ':')))
SM = open(os.path.join(ROOT, 'sitemap.xml'), encoding='utf-8').read()
add = ''.join(f'<url><loc>https://israelnowlej.com/g/{a["slug"]}/</loc></url>' for a in A if f'/g/{a["slug"]}/<' not in SM)
save('sitemap.xml', SM.replace('</urlset>', add + '</urlset>'))
print(len(A), 'entries published')
