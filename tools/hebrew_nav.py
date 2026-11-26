#!/usr/bin/env python3
"""Adds the Hebrew activities row (second level menu) to every Hebrew page: /hebrew/, /wordplay/ and the /g/ entries.
Run last, after tools/hebrew.py and tools/wordplay.py: python3 -I tools/hebrew_nav.py. Idempotent."""
import os, json, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
slugs = [e['slug'] for e in json.load(open(os.path.join(ROOT, 'tools', 'wordplay.json'), encoding='utf-8'))['entries']]
ROW = ('<div class="wrap subnav sub2" id="subnav2" data-c=3><a href="/hebrew/travel/" data-pre="/hebrew/travel/">Travel Hebrew</a>'
       '<a href="/wordplay/" data-pre="/g/">Wordplay</a><a href="/wordplay/cards/">Flash cards</a></div>')
files = []
for base in ('hebrew', 'wordplay'):
    for dp, dn, fn in os.walk(os.path.join(ROOT, base)):
        files += [os.path.join(dp, f) for f in fn if f.endswith('.html')]
files += [os.path.join(ROOT, 'g', s, 'index.html') for s in slugs]
n = 0
for p in files:
    s = open(p, encoding='utf-8').read(); o = s
    if 'id="subnav2"' not in s and 'id="subnav"' in s:
        i = s.index('id="subnav"'); j = s.index('</div>', i) + 6
        s = s[:j] + ROW + s[j:]
    if 'data-subon' not in s:
        s = s.replace('<body class="newspg">', '<body class="newspg" data-subon="/hebrew/">', 1)
    if s != o: open(p, 'w', encoding='utf-8').write(s); n += 1
print('hebrew nav row on', n, 'pages')
