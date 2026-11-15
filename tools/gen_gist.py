# Builds glossary-gist.json: one short definition per NOWlej term, taken from each entry page's description.
# Used for the hover cards on glossary links in story pages. Re-run after editing glossary entries.
import json, re, html, os, sys
root = sys.argv[1] if len(sys.argv) > 1 else '.'
g = json.load(open(os.path.join(root, 'glossary.json')))
out = {}
for name, slug, _ in g:
    p = os.path.join(root, 'g', slug, 'index.html')
    if not os.path.exists(p): continue
    m = re.search(r'<meta name="description" content="([^"]*)"', open(p, encoding='utf-8').read())
    if not m: continue
    d = html.unescape(html.unescape(m.group(1))).strip()
    s = re.match(r'(.+?[.!?])(\s|$)', d)
    gist = s.group(1) if s and len(s.group(1)) >= 30 else d
    if not re.search(r'[.!?]["”’)]?$', gist):  # page descriptions are cut mid-word; end on a clean break
        c = gist.rsplit(',', 1)[0] if ',' in gist[40:] else gist.rsplit(' ', 1)[0]
        gist = c.rstrip(' ,;:') + '…'
    if len(gist) > 220: gist = gist[:217].rsplit(' ', 1)[0] + '…'
    out[slug] = gist
json.dump(out, open(os.path.join(root, 'glossary-gist.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
print(len(out), 'gists of', len(g))
