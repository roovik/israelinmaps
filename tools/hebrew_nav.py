#!/usr/bin/env python3
"""On every Hebrew page the second level menu (the row under News, Views, Media, NOWlej, Sources) shows the Hebrew activities.
There is never a third menu row. Run last, after tools/hebrew.py and tools/wordplay.py: python3 -I tools/hebrew_nav.py. Idempotent."""
import os, json, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
slugs = [e['slug'] for e in json.load(open(os.path.join(ROOT, 'tools', 'wordplay.json'), encoding='utf-8'))['entries']]
LINKS = ('<a href="/hebrew/">Hebrew</a><a href="/hebrew/travel/" data-pre="/hebrew/travel/">Travel Hebrew</a>'
         '<a href="/hebrew/alphabet/">Alphabet</a><a href="/hebrew/numbers/">Numbers</a><a href="/wordplay/" data-pre="/g/">Wordplay</a><a href="/wordplay/cards/">Flash cards</a>')
OLDROW = ('<div class="wrap subnav sub2" id="subnav2" data-c=3><a href="/hebrew/travel/" data-pre="/hebrew/travel/">Travel Hebrew</a>'
          '<a href="/wordplay/" data-pre="/g/">Wordplay</a><a href="/wordplay/cards/">Flash cards</a></div>')
files = []
for base in ('hebrew', 'wordplay'):
    for dp, dn, fn in os.walk(os.path.join(ROOT, base)):
        files += [os.path.join(dp, f) for f in fn if f.endswith('.html')]
files += [os.path.join(ROOT, 'g', s, 'index.html') for s in slugs]
n = 0
for p in files:
    s = open(p, encoding='utf-8').read(); o = s
    s = s.replace(OLDROW, '').replace('<body class="newspg" data-subon="/hebrew/">', '<body class="newspg">')
    m = re.search(r'(id="subnav"[^>]*>)(.*?)(<span class="trend")', s, re.S)
    if m and m.group(2) != LINKS:
        s = s[:m.start(2)] + LINKS + s[m.end(2):]
    if s != o: open(p, 'w', encoding='utf-8').write(s); n += 1
print('hebrew menu on', n, 'pages')
