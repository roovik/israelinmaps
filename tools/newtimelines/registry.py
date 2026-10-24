"""All 26 timelines in their new order, with content from the book pages and the new data files."""
import json, re, html, glob, os, sys
sys.path.insert(0, os.path.dirname(__file__)); sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'modern'))
import data2, data4
from assemble import cat
SITE = '/home/claude/israelinmaps'
MN = 'Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec'
M = dict(Jan=0, Feb=1, Mar=2, Apr=3, May=4, Jun=5, Jul=6, Aug=7, Sep=8, Oct=9, Nov=10, Dec=11)
DATE = rf'(?:c\. )?\d{{2,4}}s?(?: BCE| CE)?(?: (?:{MN})(?: \d{{1,2}})?)?(?: to (?:c\. )?(?:\d{{2,4}}s?)?(?: BCE| CE)?(?: ?(?:{MN}))?(?: \d{{1,2}})?)?'
def yd(lbl):
    p = lbl.replace('c. ', '').split()
    y = int(re.match(r'\d+', p[0]).group(0))
    first = lbl.split(' to ')[0]
    if 'BCE' in first or ('BCE' in lbl and ' CE' not in first and 'CE' not in lbl.replace('BCE', '')): return -y
    m = M.get(p[1]) if len(p) > 1 else None
    if m is None: return y + .5
    day = int(p[2]) if len(p) > 2 and p[2].isdigit() and len(p[2]) <= 2 else 15
    return y + (m + (day - 1) / 31) / 12
def body(path):
    s = open(f'{SITE}/{path}', encoding='utf-8').read()
    ps = re.findall(r'<p>(.*?)</p>', re.search(r'<details class="txt">(.*?)</details>', s, re.S).group(1))
    ps = [html.unescape(p) for p in ps]
    i = [k for k, p in enumerate(ps) if p.startswith('TURNING POINTS')][0]
    b = ' '.join(p for p in ps[i + 1:] if not re.match(r'^(BCE|T\d+|TL\d+.*|\d{4}s)$', p.strip()))
    b = re.sub(r'TL\d{3} Open on your phone.*', '', b)
    b = re.sub(r'\s*MAPS? [\dA-Z, ]+?(?=\s(?:\d|c\. |[A-Z][a-z])|$)', '', b)
    return re.sub(r'\s+', ' ', b).strip(), ps
def split_dated(b):
    parts = re.split(rf'(?:(?<=[.”\d)] )|^)(?<!c\. )(?=(?:{DATE}) [A-Z“])', b)
    out = []
    for p in parts:
        p = p.strip()
        m = re.match(rf'^({DATE}) (.*)$', p)
        if m: out.append([m.group(1).strip(), m.group(2).strip()])
        elif p: out.append([None, p])
    return out
def book_std(path):
    """Pages whose turning points carry dates in the text (Timelines 1 and 3 of the book)."""
    b, ps = body(path)
    items = split_dated(b); tp, al, prev, block = [], [], None, True
    for lbl, t in items:
        y = yd(lbl)
        if block and prev is not None and y < prev: block = False
        prev = y if block else prev
        h, _, rest = t.partition('. ')
        if block: tp.append([lbl, y, cat(t), h + '.', rest])
        else: al.append([lbl, y, cat(t), t])
    return tp, al
def book_decade(path, tpdates, drop_from=None):
    """Decade pages: turning points listed first (dates from the page image), then dated entries."""
    b, ps = body(path)
    first = re.search(rf'(?:(?<=[.”\d)] )|^)(?:{DATE}) [A-Z“]', b)
    tpb, rest = b, ''
    # turning points are the leading block; find where the dated 'also' list starts (first date equal to the period start or earlier than the last turning point)
    heads = [h for h, _ in tpdates]
    pos = [tpb.find(h) for h in heads]
    assert all(p >= 0 for p in pos), (path, [h for h, p in zip(heads, pos) if p < 0])
    end_last = pos[-1] + len(heads[-1])
    m = re.search(rf'(?<=[.”)] )(?<!c\. )(?:{DATE}) [A-Z“]', tpb[end_last:])
    cut = end_last + m.start() if m else len(tpb)
    tps = []
    for k, (h, lbl) in enumerate(tpdates):
        s0 = pos[k] + len(h); s1 = pos[k + 1] if k + 1 < len(pos) else cut
        txt = tpb[s0:s1].strip()
        txt = re.sub(rf'^(?:{DATE}) ', '', txt) if False else txt
        txt = re.sub(rf'\s*(?:{DATE})$', '', txt).strip()
        tps.append([lbl, yd(lbl), cat(h + ' ' + txt), h, txt])
    al = [[l, yd(l), cat(t), t] for l, t in split_dated(tpb[cut:]) if l]
    if drop_from:
        tps = [t for t in tps if t[1] < drop_from]; al = [a for a in al if a[1] < drop_from]
    return tps, al
TL5 = [('Egyptian rule.', '1831'), ('The Galilee earthquake.', '1837'), ('Mishkenot Sha’ananim.', '1855'), ('Moses Hess, Rome and Jerusalem.', '1862'),
       ('Zvi Hirsch Kalischer, Seeking Zion.', '1862'), ('The Suez Canal opens.', '1869'), ('Mikveh Israel.', '1870'), ('Petah Tikva.', '1878')]
TL6 = [('The First Aliyah.', '1881'), ('Rishon LeZion.', '1882'), ('Leo Pinsker, Auto-Emancipation.', '1882'), ('Zikhron Yaakov.', '1882'), ('Rosh Pina.', '1882'),
       ('Ahad Ha’am.', '1889'), ('Eliezer Ben-Yehuda and the revival of Hebrew.', '1890'), ('Herzl publishes The Jewish State.', '1896'), ('The First Zionist Congress.', '1897')]
TL7 = [('The Uganda Plan.', '1903'), ('Rabbi Kook arrives in Jaffa.', '1904'), ('The Russian pogroms.', '1905'), ('Tel Aviv and Degania.', '1909')]
TL8 = [('Abel Pann arrives in Jerusalem.', '1913'), ('The First World War begins.', '1914'), ('The Sykes-Picot agreement.', '1916'), ('The Balfour Declaration.', '1917')]
TL9 = [('Tel Hai.', '1920 Mar 1'), ('The Mandate is confirmed.', '1922'), ('Reuven Rubin settles in Tel Aviv.', '1923'), ('The Fourth Aliyah.', '1924 to 1928'), ('Riots across the land.', '1929 Aug 23 to 29')]
TL10 = [('Mordecai Ardon reaches Jerusalem.', '1933'), ('The Fifth Aliyah.', '1933 to 1936'), ('The Arab Revolt.', '1936 Apr 19 to 1939'), ('The Tiberias massacre.', '1938 Oct 2'),
        ('The White Paper.', '1939 May 17'), ('The Holocaust.', '1939 to 1945')]
TL11 = [('The UN partition plan.', '1947 Nov 29'), ('Natan Alterman publishes The Silver Platter.', '1947 Dec 19')]
def dpath(n): return os.path.relpath(glob.glob(f'{SITE}/timelines/{n}/*/index.html')[0], SITE)
def intro(path):
    b, ps = body(path)
    for p in ps:
        if len(p) > 80 and not p.startswith(('TURNING', 'Canaan Kings', 'T1 ', 'Timeline')) and 'Conflict Rule' not in p: return p
MODERN = {p['id']: p for p in json.load(open(os.path.join(os.path.dirname(__file__), 'modern/pages.json')))}
D2 = {p['id']: p for p in data2.PAGES}; D4 = {p['id']: p for p in data4.PAGES}
def std(n, slug, title, menu, rng, intro_, y0, y1, step, tp, al):
    return dict(n=n, slug=slug, title=title, menu=menu, rng=rng, intro=intro_, style='std', y0=y0, y1=y1, step=step, tp=tp, also=al)
def per(n, slug, title, menu, rng, intro_, y0, y1, tp, al):
    return dict(n=n, slug=slug, title=title, menu=menu, rng=rng, intro=intro_, style='period', y0=y0, y1=y1, tp=tp, also=al)
def build():
    R = []
    p = dpath('001'); tp, al = book_std(p)
    R.append(std(1, 'patriarchs-to-the-first-kings', 'Patriarchs to the First Kings', 'Patriarchs & Judges', '2000 to 1000 BCE', intro(p), -2000, -1000, 100, tp, al))
    for n, k, menu in [(2, '002a', 'Kings & Prophets'), (3, '002b', 'Exile & Return')]:
        q = D2[k]; R.append(std(n, q['slug'], q['title'], menu, q['rng'], q['intro'], q['y0'], q['y1'], q['step'], [list(t) for t in q['tp']], [list(a) for a in q['also']]))
    p = dpath('003'); tp, al = book_std(p)
    R.append(std(4, 'greeks-hasmoneans-and-romans', 'Greeks, Hasmoneans and Romans', 'Greeks, Jews & Romans', '350 BCE to 100 CE', intro(p), -350, 100, 50, tp, al))
    for n, k, menu in zip(range(5, 11), ['004a', '004b', '004c', '004d', '004e', '004f'], ['Roman', 'Muslim', 'Abbasid', 'Crusader', 'Mamluk', 'Ottoman']):
        q = D4[k]; R.append(dict(n=n, slug=q['slug'], title=q['title'], menu=menu, rng=f"{q['y0']} to {q['y1']}", intro=q['intro'], style='dual', y0=q['y0'], y1=q['y1'], step=q['step'], left=q['left'], right=q['right']))
    for n, old, slug, title, menu, rng, y0, y1, tpd, drop in [
        (11, '005', 'the-ottoman-land', 'The Ottoman Land', '1800s', '1800 to 1880', 1800, 1881, TL5, None),
        (12, '006', 'zionism-takes-shape', 'Zionism Takes Shape', 'Early Zionism', '1881 to 1899', 1881, 1900, TL6, None),
        (13, '007', 'the-1900s', 'The 1900s', '1900s', '1900 to 1909', 1900, 1910, TL7, None),
        (14, '008', 'the-1910s', 'The 1910s', '1910s', '1910 to 1919', 1910, 1920, TL8, None),
        (15, '009', 'the-1920s', 'The 1920s', '1920s', '1920 to 1929', 1920, 1930, TL9, None),
        (16, '010', 'the-1930s', 'The 1930s', '1930s', '1930 to 1939', 1930, 1940, TL10, None),
        (17, '011', 'the-1940s', 'The 1940s', '1940s', '1940 to 1947', 1940, 1948, TL11, 1948)]:
        p = dpath(old); tp, al = book_decade(p, tpd, drop)
        if n == 17:
            def pro(start, h, t):
                x = [a for a in al if a[3].startswith(start)][0]; al.remove(x); tp.append([x[0], x[1], x[2], h, t])
            pro('The Biltmore Conference', 'The Biltmore Program.', 'Zionist leaders meeting in New York call for a Jewish commonwealth after the war.')
            pro('The Jewish Brigade', 'The Jewish Brigade.', 'Jews of the land fight Nazi Germany in their own unit of the British army.')
            pro('The Irgun bombs', 'The King David Hotel bombing.', 'The Irgun blows up the wing of the hotel that houses the British administration, and 91 people are killed.')
            tp.append(['1947 Jul 18', yd('1947 Jul 18'), 'c', 'The Exodus.', 'British forces seize the refugee ship off Haifa and send its 4,500 passengers back to Europe.'])
            tp.sort(key=lambda x: x[1])
        R.append(per(n, slug, title, menu, rng, intro(p) if n != 17 else 'The Second World War and the Holocaust darken the decade. The Yishuv fights the White Paper, smuggles in refugees and wins the United Nations vote for a Jewish state.', y0, y1, tp, al))
    labels = {'012a': '1948–55', '012b': '1956–66', '013a': '1967–76', '014a': '1977–84', '015a': '1985–92', '016a': '1993–04', '017a': '2005–14', '018a': '2015–23', '019a': 'Oct 2023–'}
    for n, k in zip(range(18, 27), ['012a', '012b', '013a', '014a', '015a', '016a', '017a', '018a', '019a']):
        q = MODERN[k]; R.append(per(n, q['slug'], q['title'], labels[k], q['rng'], q['intro'], q['y0'], q['y1'], q['tp'], q['also']))
    for r in R: r['id'] = f"{r['n']:03d}"
    return R
if __name__ == '__main__':
    R = build()
    for r in R:
        a = len(r.get('tp', r.get('left', []))); b = len(r.get('also', r.get('right', [])))
        print(r['id'], r['style'], r['title'], r['menu'], a, b)
    json.dump(R, open(os.path.join(os.path.dirname(__file__), 'registry.json'), 'w'), ensure_ascii=False, indent=1)
