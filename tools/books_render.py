"""Renders the book cards from books.json into /about/ and /books/ (between the BOOKS markers) and keeps tools/ads.js in step.
Run from the repo root: python3 tools/books_render.py"""
import json, re, html
B = json.load(open('books.json', encoding='utf-8'))['books']
e = html.escape
import hashlib
PV = hashlib.md5(open('people.js','rb').read()).hexdigest()[:8]
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
.bkways{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:12px 0 22px}.bkways div{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px}.bkways b{display:block;margin-bottom:4px}.bkways span{font-size:.92rem}
#ask{scroll-margin-top:90px}#books-form{max-width:640px}
@media(max-width:700px){.bkf{grid-template-columns:1fr}.bkf img{max-width:230px}.bkrow{grid-template-columns:1fr}.bkways{grid-template-columns:1fr 1fr}}
</style>'''
def buttons(b):
    if b['status'] == 'available':
        o = ''
        if b['kindle']: o += '<a class="bkbtn" href="%s" target="_blank" rel="noopener sponsored">Kindle and ebook on Amazon</a>' % e(b['kindle'])
        if b['paperback']: o += '<a class="bkbtn alt" href="%s" target="_blank" rel="noopener sponsored">Paperback on Amazon</a>' % e(b['paperback'])
        return o
    return '<a class="bkbtn alt" href="/subscribe/">Get notified when it is out</a>'
def ask(b):
    return '<p class="small" style="margin:6px 0 0"><a href="/books/?t=%s#ask">For schools, groups and licensing</a></p>' % e(b['id'])
def desk():
    """The books desk: the formats on offer and one inquiry form. The form posts to /api/contact as topic books (see worker.js)."""
    boxes = ''.join('<label><input type="checkbox" name="title" value="%s"> %s</label>' % (e(b['id']), e(b['title'])) for b in B)
    return ('<section id="ask"><h2>For schools, congregations, tour groups and publishers</h2>'
        '<p>The collection comes in four forms. The first two are on Amazon. Write to us for the others, for copies in quantity, or to license maps, timelines, charts or text.</p>'
        '<div class="bkways"><div><b>Paperback</b><span>Full color, 8 x 10 inches. On Amazon. Ask us about ten copies or more.</span></div>'
        '<div><b>Kindle</b><span>Every title as an ebook. On Amazon.</span></div>'
        '<div><b>Interactive PDF</b><span>Each title as a PDF with live links, made for screens, classrooms and projection.</span></div>'
        '<div><b>Site license</b><span>This website for your school, congregation or organization: the maps, timelines, charts and tours, live and up to date.</span></div></div>'
        '<h3>Ask about copies, licenses or a talk</h3>'
        '<form class="subform" id="books-form">'
        '<div class="sf-row"><label>I am interested in<select name="want"><option value="copies">Copies for a group (ten or more)</option><option value="pdf">The interactive PDF edition</option><option value="site">A site license for a school or organization</option><option value="license">Licensing maps, timelines, charts or text</option><option value="review">A review or press copy</option><option value="speaking">A talk or event with the author</option><option value="other">Something else</option></select></label></div>'
        '<fieldset><legend>Which books?</legend>' + boxes + '<label><input type="checkbox" name="title" value="all"> All four</label></fieldset>'
        '<div class="sf-row"><label>First name<input name="first" type="text" autocomplete="given-name" maxlength="80"></label></div>'
        '<div class="sf-row"><label>Last name<input name="last" type="text" autocomplete="family-name" maxlength="80"></label></div>'
        '<div class="sf-row"><label>Email address<input name="email" type="email" required autocomplete="email" maxlength="160"></label></div>'
        '<div class="sf-row"><label>School, congregation or organization (optional)<input name="org" type="text" autocomplete="organization" maxlength="120"></label></div>'
        '<div class="sf-row"><label>Country<select name="country" autocomplete="country"><option value="">Country (optional)</option></select></label></div>'
        '<div class="sf-row"><label>How many copies or users? (optional)<input name="qty" type="text" inputmode="numeric" maxlength="6"></label></div>'
        '<div class="sf-row"><label>Tell us who it is for and how you would use it<textarea name="message" rows="5" maxlength="3000" required></textarea></label></div>'
        '<div class="sf-row" hidden aria-hidden="true"><label>Leave this empty<input name="website" type="text" tabindex="-1" autocomplete="off"></label></div>'
        '<div class="sf-row"><label><input type="checkbox" name="also"> Also send me the daily digest.</label></div>'
        '<div class="sf-row"><label><input type="checkbox" name="consent"> You may write back to me at this address.</label></div>'
        '<p><button type="submit">Send inquiry</button> <span class="pf-msg small" role="status"></span></p></form>'
        '<p class="small">Or write to <a href="mailto:editor@israelnowlej.com">editor@israelnowlej.com</a>. The author answers every inquiry himself.</p></section>'
        '<script src="/people.js?v=%s" defer></script>' % PV)
def feat(b, a=False):
    return '<section class="bkf" id="book"><img src="%s" alt="Cover of %s" width="600" height="750" loading="lazy"><div><h2>%s</h2><p class="bs">%s</p><p>%s</p><p>By %s</p>%s</div></section>' % (e(b['cover']), e(b['title']), e(b['title']), e(b['subtitle']), e(b['desc']), e(b['author']), buttons(b) + (ask(b) if a else ''))
def small(b, a=False):
    tag = '' if b['status'] == 'available' else '<span class="bksoon">Coming soon</span>'
    return '<article class="bk2"><img src="%s" alt="Cover of %s" width="800" height="1000" loading="lazy">%s<h3>%s</h3><p class="bs">%s</p><p>%s</p>%s</article>' % (e(b['cover']), e(b['title']), tag, e(b['title']), e(b['subtitle']), e(b['desc']), buttons(b) + (ask(b) if a else ''))
def block(kind):
    if kind == 'about':
        return CSS + feat(B[0]) + '<h2>The Israel Collection</h2><div class="bkrow">' + ''.join(small(b) for b in B[1:]) + '</div><p class="small"><a href="/books/">All the books</a></p>'
    return CSS + feat(B[0], True) + '<h2>More from NOWlej Press</h2><div class="bkrow">' + ''.join(small(b, True) for b in B[1:]) + '</div>' + desk()
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
