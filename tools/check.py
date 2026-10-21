#!/usr/bin/env python3
"""Live-address check: every ID address and every internal link must resolve. Exit 1 on any miss."""
import os, re, sys, csv, glob
ROOT = sys.argv[1]; IDS = sys.argv[2]; QR = sys.argv[3]
red = {}
for l in open(os.path.join(ROOT, '_redirects')):
    p = l.split()
    if len(p) == 3: red[p[0]] = (p[1], p[2])
def exists(path):
    path = path.split('#')[0].split('?')[0]
    fp = os.path.join(ROOT, path.lstrip('/'))
    return os.path.isfile(fp) or os.path.isfile(os.path.join(fp, 'index.html'))
def resolve(path, depth=0):
    path = path.split('#')[0].split('?')[0]
    if exists(path): return True
    if path in red and depth < 3: return resolve(red[path][0], depth + 1)
    return False
bad = []
ids = [r['id'] for r in csv.DictReader(open(IDS))]
n = 0
for i in ids:
    for form in (i.lower(), i.upper(), '2027/' + i.lower()):
        n += 1
        if not resolve('/' + form): bad.append('/' + form)
for r in csv.DictReader(open(QR)):
    path = '/' + r['short_url'].split('israelnowlej.com/')[1]
    for form in (path, path.upper()):
        n += 1
        if not resolve(form): bad.append(form)
for h in ['/glossary', '/index', '/size', '/gl', '/tour', '/flora', '/map', '/tl', '/rnk', '/dem', '/top', '/tbl']:
    n += 1
    if not resolve(h): bad.append(h)
links = 0
for f in glob.glob(ROOT + '/**/*.html', recursive=True):
    if '/node_modules/' in f: continue
    h = open(f, encoding='utf-8').read()
    for m in re.findall(r'(?:href|src)="(/[^"]*)"', h):
        links += 1
        if not resolve(m): bad.append(f'{os.path.relpath(f, ROOT)} -> {m}')
print(f'checked {n} addresses and {links} links, {len(bad)} missing')
for b in sorted(set(bad))[:60]: print(' MISSING', b)
sys.exit(1 if bad else 0)
