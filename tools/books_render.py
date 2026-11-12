"""Renders the book cards from books.json into /about/ and /books/ (between the BOOKS markers) and keeps tools/ads.js in step.
Run from the repo root: python3 tools/books_render.py"""
import json, re, html
B = json.load(open('books.json', encoding='utf-8'))['books']
e = html.escape
CSS = '''<style>
.bkf{display:grid;grid-template-columns:minmax(0,230px) minmax(0,1fr);gap:22px;align-items:start;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:16px;margin:16px 0 22px}
.bkf img,.bk2 img{width:100%;height:auto;border-radius:4px;box-shadow:0 2px 10px rgba(0,0,0,.18);display:block}
.bkf h2{margin:0 0 2px;font-size:1.5rem}.bkf .bs,.bk2 .bs{color:var(--mut);font-style:italic;margin:0 0 10px}.bkf p{margin:0 0 10px}
.bkbtn{display:inline-block;margin:4px 8px 4px 0;padding:8px 14px;border-radius:5px;font-weight:700;text-decoration:none;background:var(--gold);color:#2a1d00!important}
.bkbtn.alt{background:transparent;border:1px solid var(--gold);color:inherit!important}
.bkrow{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin:10px 0 22px}
.bk2{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px;display:flex;flex-direction:column;gap:8px}
.bk2 h3{margin:4px 0 0;font-size:1.05rem}.bk2 p{margin:0}
.bksoon{display:inline-block;background:var(--gold);color:#1d2330;font-weight:700;font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;padding:3px 9px;border-radius:99px;align-self:flex-start}
@media(max-width:700px){.bkf{grid-template-columns:1fr}.bkf img{max-width:230px}.bkrow{grid-template-columns:1fr}}
</style>'''
def buttons(b):
    if b['status'] == 'available':
        o = ''
        if b['kindle']: o += '<a class="bkbtn" href="%s" target="_blank" rel="noopener sponsored">Kindle and ebook on Amazon</a>' % e(b['kindle'])
        if b['paperback']: o += '<a class="bkbtn alt" href="%s" target="_blank" rel="noopener sponsored">Paperback on Amazon</a>' % e(b['paperback'])
        return o
    return '<a class="bkbtn alt" href="/subscribe/">Get notified when it is out</a>'
def feat(b):
    return '<section class="bkf" id="book"><img src="%s" alt="Cover of %s" width="600" height="750" loading="lazy"><div><h2>%s</h2><p class="bs">%s</p><p>%s</p><p>By %s</p>%s</div></section>' % (e(b['cover']), e(b['title']), e(b['title']), e(b['subtitle']), e(b['desc']), e(b['author']), buttons(b))
def small(b):
    tag = '' if b['status'] == 'available' else '<span class="bksoon">Coming soon</span>'
    return '<article class="bk2"><img src="%s" alt="Cover of %s" width="800" height="1000" loading="lazy">%s<h3>%s</h3><p class="bs">%s</p><p>%s</p>%s</article>' % (e(b['cover']), e(b['title']), tag, e(b['title']), e(b['subtitle']), e(b['desc']), buttons(b))
def block(kind):
    if kind == 'about':
        return CSS + feat(B[0]) + '<h2>The Israel Collection</h2><div class="bkrow">' + ''.join(small(b) for b in B[1:]) + '</div><p class="small"><a href="/books/">All the books</a></p>'
    return CSS + feat(B[0]) + '<h2>More from NOWlej Press</h2><div class="bkrow">' + ''.join(small(b) for b in B[1:]) + '</div>'
M0, M1 = '<!--BOOKS-->', '<!--/BOOKS-->'
def inject(path, kind, anchor_re):
    s = open(path, encoding='utf-8').read()
    blk = M0 + block(kind) + M1
    if M0 in s: s = re.sub(re.escape(M0) + '.*?' + re.escape(M1), lambda m: blk, s, flags=re.S)
    else: s = re.sub(anchor_re, lambda m: m.group(0) + blk, s, count=1)
    open(path, 'w', encoding='utf-8').write(s)
inject('about/index.html', 'about', r'<p class="lead">Israel NOWlej is a growing.*?</p>')
inject('books/index.html', 'books', r'<p class="lead">Three new books.*?</p>')
print('ok')

# ads.js creatives
def js(x): return json.dumps(x, ensure_ascii=False)
rows = []
for b in B:
    if b['status'] == 'available':
        href = b['kindle'] or b['paperback'] or '/books/'; cta = 'Get it on Amazon'; typ = 'house'
    else:
        href = '/books/'; cta = 'Coming soon'; typ = 'house'
    rows.append("    {type:%s,title:%s,text:%s,cta:%s,href:%s,img:%s}," % (js(typ), js(b['title']), js(b['short']), js(cta), js(href), js(b['cover'])))
A0, A1 = '    //BOOKS-ADS', '    ///BOOKS-ADS'
for f in ('ads.js', 'tools/ads.js'):
    t = open(f, encoding='utf-8').read()
    blk = A0 + '\n' + '\n'.join(rows) + '\n' + A1
    if A0 in t: t = re.sub(re.escape(A0) + '.*?' + re.escape(A1), lambda m: blk, t, flags=re.S)
    else: t = re.sub(r"    \{type:'house'.*?\n", lambda m: blk + '\n', t, count=1)
    open(f, 'w', encoding='utf-8').write(t)
