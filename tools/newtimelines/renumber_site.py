"""Reissue the timelines as numbers 1 to 26: pages, images, menus, redirects, search, sitemap, widget and index."""
import json, re, html, os, shutil, glob, sys
from PIL import Image
SITE = '/home/claude/israelinmaps'; GEN = '/home/claude/tlgen'
os.chdir(SITE)
R = json.load(open(f'{GEN}/registry.json')); N = len(R)
new = {r['n']: f"/timelines/{r['id']}/{r['slug']}/" for r in R}
OLD = {'001/patriarchs-to-the-first-kings': 1, '002/kings-exile-and-return': 2, '002a/kings-and-prophets': 2, '002b/exile-and-return': 3,
       '003/greeks-hasmoneans-and-romans': 4, '004/centuries-of-foreign-rule': 5, '004a/rabbinic-judaism-and-roman-rule': 5,
       '004b/byzantine-decline-and-islamic-conquest': 6, '004c/abbasid-and-early-medieval-judaism': 7, '004d/crusaders-and-ayyubids': 8,
       '004e/mamluk-rule-and-the-spanish-expulsion': 9, '004f/ottoman-rule-and-jewish-resettlement': 10, '005/the-ottoman-land': 11,
       '006/zionism-takes-shape': 12, '007/the-1900s': 13, '008/the-1910s': 14, '009/the-1920s': 15, '010/the-1930s': 16, '011/the-1940s': 17,
       '012/the-1950s': 18, '012a/independence-and-ingathering': 18, '012b/sinai-and-the-years-between': 19, '013/the-1960s': 19,
       '013a/the-six-day-war-and-yom-kippur': 20, '014/the-1970s': 20, '014a/upheaval-peace-and-intifada': 21, '015/the-1980s': 21,
       '016/the-1990s': 23, '016a/oslo-and-the-second-intifada': 23, '017/the-2000s': 24, '017a/disengagement-and-the-gaza-wars': 24,
       '018/the-2010s': 25, '018a/abraham-accords-to-october-7': 25, '019/the-2020s': 25, '019a/the-seven-front-war': 26}
MAP = {f'/timelines/{k}/': new[v] for k, v in OLD.items()}
T = open('timelines/001/patriarchs-to-the-first-kings/index.html', encoding='utf-8').read()
# 1. images
for r in R:
    im = Image.open(f"{GEN}/out6/{r['id']}.png").convert('RGB')
    im.save(f"img/tl-{r['id']}.webp", quality=88, method=6); im.resize((420, 525), Image.LANCZOS).save(f"img/t/tlf-tl-{r['id']}.webp", quality=85, method=6)
Image.open(f'{GEN}/out6/title.png').convert('RGB').save('img/tl-title.webp', quality=88, method=6)
for f in glob.glob('img/tl-0??[a-z].webp') + glob.glob('img/t/tlf-tl-0??[a-z].webp'): os.remove(f)
# 2. pages
for d in glob.glob('timelines/0*'): shutil.rmtree(d)
row = '<div class="wrap subnav sub2" id="subnav2" data-c=3>' + ''.join(f'<a href="{new[r["n"]]}">{html.escape(r["menu"])}</a>' for r in R) + '</div>'
def sub1(p, rep, s):
    s2, k = re.subn(p, lambda m: rep, s, count=1, flags=re.S); assert k == 1, p; return s2
def text_of(r):
    t = [f"TIMELINE {r['n']}", f"Timeline {r['n']} of {N}", r['title'], r['rng'], r['intro']]
    if r['style'] == 'dual':
        t += ['JEWISH LIFE IN THE LAND'] + [' '.join(x for x in (e[0], e[3], e[4]) if x) for e in r['left']]
        t += ['RULERS OF THE LAND'] + [' '.join(x for x in (e[0], e[3], e[4]) if x) for e in r['right']]
    else:
        t += ['TURNING POINTS'] + [f'{e[0]} {e[3]} {e[4]}' for e in sorted(r['tp'], key=lambda e: e[1])]
        t += ['ALSO IN THIS PERIOD'] + [f'{e[0]} {e[3]}' for e in sorted(r['also'], key=lambda e: e[1])]
    return t
for i, r in enumerate(R):
    u = new[r['n']]; t = r['title']; tid = r['id']
    s = T
    s = sub1(r'<title>.*?</title>', f'<title>{t} | Israel NOWlej</title>', s)
    desc = f"{t} (TL-{tid}), timeline {r['n']} of {N} from Israel NOWlej, {r['rng']}."
    for prop in ('name="description"', 'property="og:description"'):
        s = re.sub(rf'({prop} content=")[^"]*', lambda m: m.group(1) + desc, s, count=1)
    s = re.sub(r'(property="og:title" content=")[^"]*', lambda m: m.group(1) + f'{t} | Israel NOWlej', s, count=1)
    s = re.sub(r'(rel="canonical" href=")[^"]*', lambda m: m.group(1) + 'https://israelnowlej.com' + u, s, count=1)
    s = re.sub(r'/img/(?:p\d+|tl-[0-9a-z]+)\.webp', f'/img/tl-{tid}.webp', s)
    s = sub1(r'<div class="wrap subnav sub2" id="subnav2"[^>]*>.*?</div>', row, s)
    s = sub1(r'<h1>.*?</h1>', f'<h1>{html.escape(t)}</h1>', s)
    s = re.sub(r'(<div class="pages single">.*?alt=")[^"]*', lambda m: m.group(1) + html.escape(t), s, count=1, flags=re.S)
    cite = f'Israel NOWlej (2027), TL-{tid}, israelnowlej.com/tl-{tid}'
    s = sub1(r'<div class="cite">.*?</div>', f'<div class="cite"><p><b>Cite this page</b></p><p class="citeline" id="cite">{cite}</p><button type="button" class="copy" data-copy="{cite}">Copy citation</button>\n<p class="small">Short address: <a href="/tl-{tid}">israelnowlej.com/tl-{tid}</a></p></div>', s)
    prev = (new[R[i - 1]['n']], R[i - 1]['title']) if i else ('/timelines/', 'Timelines')
    nxt = (new[R[i + 1]['n']], R[i + 1]['title']) if i + 1 < N else None
    nav = f'<nav class="pn" aria-label="Previous and next"><a class="prev" href="{prev[0]}"><span>Previous</span>{html.escape(prev[1])}</a>' + (f'<a class="next" href="{nxt[0]}"><span>Next</span>{html.escape(nxt[1])}</a>' if nxt else '') + '</nav>'
    s = sub1(r'<nav class="pn".*?</nav>', nav, s)
    s = sub1(r'<details class="txt">.*?</details>', '<details class="txt"><summary>Text of this page</summary>' + ''.join(f'<p>{html.escape(x, quote=False)}</p>' for x in text_of(r)) + '</details>', s)
    s = sub1(r'<p class="small">Corrections:.*?</p>', '<p class="small">Corrections: none recorded. This is the current version.</p>', s)
    os.makedirs(u.strip('/'), exist_ok=True); open(u.strip('/') + '/index.html', 'w', encoding='utf-8').write(s)
# 3. landing page
g = open('timelines/index.html', encoding='utf-8').read()
g = re.sub(r'<div class="wrap subnav sub2" id="subnav2"[^>]*>.*?</div>', lambda m: row, g, count=1, flags=re.S)
tiles = ''.join(f'<a class="tltile" href="{new[r["n"]]}" title="{html.escape(r["title"])}"><img src="/img/t/tlf-tl-{r["id"]}.webp" alt="{html.escape(r["title"])}" width="420" height="525" loading="lazy"></a>' for r in R)
g = re.sub(r'(<div class="tlmosaic">)(<a class="tltile" href="/img/p109.webp".*?</a>)?.*?(</div>)', lambda m: m.group(1) + tiles + m.group(3), g, count=1, flags=re.S)
g = re.sub(r'<a class="next" href="[^"]*"><span>Next</span>[^<]*</a>', f'<a class="next" href="{new[1]}"><span>Next</span>{R[0]["title"]}</a>', g, count=1)
open('timelines/index.html', 'w', encoding='utf-8').write(g)
# 4. redirects
lines = open('_redirects', encoding='utf-8').read().split('\n')
keep = [l for l in lines if l.strip() and not re.match(r'^(/tl-|/TL-|/2027/tl-|/2027/TL-|/timelines/)', l)]
old_tl = [l for l in lines if re.match(r'^/timelines/', l)]
add = []
for r in R:
    for pre in ('/tl-', '/TL-', '/2027/tl-', '/2027/TL-'): add.append(f"{pre}{r['id']} {new[r['n']]} 301")
for o, nu in MAP.items():
    if o != nu: add.append(f'{o} {nu} 301')
for l in old_tl:  # earlier redirects now aim at the final pages
    src, dst = l.split()[:2]
    dst = MAP.get(dst, dst)
    if src not in MAP and src != dst: add.append(f'{src} {dst} 301')
open('_redirects', 'w', encoding='utf-8').write('\n'.join(keep + sorted(set(add), key=add.index)) + '\n')
# 5. search
L = json.load(open('search.json', encoding='utf-8')); L = [e for e in L if not re.match(r'/timelines/0', e.get('u', ''))]
k = next((j for j, e in enumerate(L) if e.get('u', '').startswith('/tour/')), len(L))
L[k:k] = [{'t': r['title'], 'u': new[r['n']], 'k': 'TL-' + r['id'], 's': 'Timelines', 'x': ' '.join(text_of(r)), 'i': f"/img/t/tlf-tl-{r['id']}.webp"} for r in R]
json.dump(L, open('search.json', 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
# 6. sitemap
sm = open('sitemap.xml', encoding='utf-8').read()
sm = re.sub(r'<url><loc>https://israelnowlej.com/timelines/0[^<]*</loc></url>', '', sm)
sm = sm.replace('</urlset>', ''.join(f'<url><loc>https://israelnowlej.com{new[r["n"]]}</loc></url>' for r in R) + '</urlset>')
open('sitemap.xml', 'w', encoding='utf-8').write(sm)
# 7. widget
a = json.load(open('asides.json', encoding='utf-8'))
G = [('Patriarchs to Saul', [1]), ('David to Bar Kokhba', [2, 3, 4]), ('Survival without sovereignty', list(range(5, 15))), ('British Mandate', [15, 16, 17]),
     ('Independence and regional wars', list(range(18, 23))), ('Peace efforts, conflict and realignment', list(range(23, 27)))]
a['timelines']['g'] = [{'h': h, 'u': '/timelines/', 'i': [[f"{n}. {R[n - 1]['title']}", new[n]] for n in ns]} for h, ns in G]
json.dump(a, open('asides.json', 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
# 8. index and any other page that links to old timeline addresses
cnt = 0
for f in glob.glob('**/*.html', recursive=True):
    if f.startswith('timelines/0'): continue
    s = open(f, encoding='utf-8').read(); s2 = s
    for o, nu in MAP.items():
        if o != nu and o in s2: s2 = s2.replace(f'"{o}"', f'"{nu}"')
    if s2 != s: open(f, 'w', encoding='utf-8').write(s2); cnt += 1
print('pages', N, 'files relinked', cnt)
