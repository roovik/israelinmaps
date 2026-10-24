"""Turn the decade pages' entries (1948 to today) into one dated list for regrouping into periods."""
import json, re, sys
sys.path.insert(0, '/home/claude/tlgen')
from data1980s import PAGE as P80, d as d80
raw = json.load(open('/home/claude/tlgen/modern/raw.json'))
M = dict(Jan=0, Feb=1, Mar=2, Apr=3, May=4, Jun=5, Jul=6, Aug=7, Sep=8, Oct=9, Nov=10, Dec=11)
def yd(lbl):
    p = lbl.replace('c. ', '').split()
    y = int(p[0][:4]); m = M.get(p[1], None) if len(p) > 1 else None
    if m is None: return y + .5
    day = int(p[2]) if len(p) > 2 and p[2].isdigit() and len(p[2]) <= 2 else 15
    return y + (m + (day - 1) / 31) / 12
MN = 'Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec'
LBL = re.compile(rf'^((?:c\. )?\d{{4}}s?(?: (?:{MN})(?: \d{{1,2}})?)?(?: to (?:\d{{4}}s? ?)?(?:(?:{MN}) ?)?(?:\d{{1,2}})?)?) (.*)$')
def cat(t):
    T = t.lower()
    if re.search(r'election|prime minister|president|territory:|knesset|annex|government|coalition|resigns|becomes', T): return 'r'
    if re.search(r'peace|treaty|agreement|accord|summit|resolution|\bun\b|united nations|ceasefire|relations|embassy|recogni|dialogue|arbitration|frees|exchange|deal', T): return 'd'
    if re.search(r'kill|attack|bomb|war\b|war |massacre|hijack|missile|rocket|raid|operation |shell|fighting|gunmen|terror|intifada|captured|assassin|riots|murder', T): return 'c'
    if re.search(r'aliyah|immigra|jews from|airlift|arrive|flown|settle|founded|city|town|kibbutz|reactor|water carrier|economy|inflation', T): return 's'
    if re.search(r'nobel|university|yad vashem|prize|scrolls|rabbi|talmud|museum|science|technion', T): return 'f'
    if re.search(r'publish|poem|song|eurovision|film|novel|art|music|fountain|singer|writer|opera|album|olympic|wins gold|medal', T): return 'l'
    return 'r'
FIX_SPLIT = [
    ('The reparations agreement.', '1952 Sep 10'),
    ('Three share the Nobel Peace Prize.', '1994 Dec 10'),
    ('Two Technion chemists win the Nobel Prize.', '2004 Oct 6'),
]
FIX_LABEL = {'Operation Magic Carpet.': '1949 to 1950', 'Operation Solomon.': '1991 May 24 to 25'}
items = []
for n, parts in raw.items():
    n = int(n)
    if n == 15: continue
    # book turning points: the first block, until dates go back
    prev, tpblock = -1, True
    for p in parts:
        for key, lbl in FIX_LABEL.items():
            if p.startswith(key): p = lbl + ' ' + p
        segs = [p]
        for key, lbl in FIX_SPLIT:
            if key in segs[-1] and not segs[-1].startswith(key):
                a, b = segs[-1].split(key, 1); segs[-1] = a.strip(); segs.append(lbl + ' ' + key + b)
        for k, sgt in enumerate(segs):
            m = LBL.match(sgt)
            if not m: print('SKIP', n, sgt[:80]); continue
            lbl, rest = m.group(1).strip(), m.group(2).strip()
            y = yd(lbl)
            if k == 0 and tpblock and prev > -1 and int(y) < prev: tpblock = False
            if k == 0: prev = max(prev, int(y))
            rest = re.sub(r'\s*MAPS? [\dA-Z ]+$', '', rest).strip()
            tp = tpblock and k == 0 and re.match(r'^[^.]{3,70}\.\s', rest + ' ') is not None and n != 11 or (n == 11 and y >= 1948 and re.match(r'^(Independence|The armistice)', rest))
            if tp:
                h, _, t = rest.partition('. '); items.append(dict(l=lbl, y=y, c=cat(rest), tp=1, h=h + '.', t=t))
            else:
                items.append(dict(l=lbl, y=y, c=cat(rest), tp=0, t=rest))
for l, c, h, t in P80['tp']:
    items.append(dict(l=l, y=d80(l), c=c, tp=1, h=h, t=re.sub(r'\s*<span.*', '', t)))
for l, c, t in P80['also']:
    items.append(dict(l=l, y=d80(l), c=c, tp=0, t=t))
items = [i for i in items if i['y'] >= 1948]
items.sort(key=lambda i: i['y'])
json.dump(items, open('/home/claude/tlgen/modern/items.json', 'w'), ensure_ascii=False, indent=1)
PER = [(1948, 1956), (1956, 1967), (1967, 1977), (1977, 1993), (1993, 2005), (2005, 2015), (2015, 2024), (2024, 2027)]
for a, b in PER:
    sel = [i for i in items if a <= i['y'] < b]
    print(a, b, 'tp', sum(i['tp'] for i in sel), 'also', sum(1 - i['tp'] for i in sel))
