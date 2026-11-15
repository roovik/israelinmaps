# Builds glossary-gist.json: for each NOWlej term, the first paragraph of its entry (the definition paragraph).
# Used for the rollover cards on links to glossary entries. Re-run after editing glossary entries.
import json, re, html, os, sys
root = sys.argv[1] if len(sys.argv) > 1 else '.'
g = json.load(open(os.path.join(root, 'glossary.json')))
out = {}
for name, slug, _ in g:
    p = os.path.join(root, 'g', slug, 'index.html')
    if not os.path.exists(p): continue
    s = open(p, encoding='utf-8').read()
    m = re.search(r'<p class="[^"]*\bedef\b[^"]*"[^>]*>(.*?)</p>', s, re.S)
    if m:
        t = re.sub(r'<a class="econt".*?</a>', '', m.group(1), flags=re.S)
        t = html.unescape(re.sub(r'<[^>]+>', '', t))
    else:
        m = re.search(r'<meta name="description" content="([^"]*)"', s)
        t = html.unescape(html.unescape(m.group(1))) if m else ''
    t = re.sub(r'\s+', ' ', t).strip()
    if t: out[slug] = t
json.dump(out, open(os.path.join(root, 'glossary-gist.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
print(len(out), 'of', len(g), 'entries;', os.path.getsize(os.path.join(root, 'glossary-gist.json')) // 1024, 'KB; longest', max(len(v) for v in out.values()))
