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
        if b['kindle']: o += '<a class="bkbtn" href="%s" target="_blank" rel="noopener sponsored">Amazon Kindle Ebook</a>' % e(b['kindle'])
        if b['paperback']: o += '<a class="bkbtn alt" href="%s" target="_blank" rel="noopener sponsored">Amazon Paperback</a>' % e(b['paperback'])
        return o
    return '<a class="bkbtn alt" href="/subscribe/">Get notified when it is out</a>'
def ask(b):
    return '<p class="small" style="margin:6px 0 0"><a href="/books/?t=%s#ask">For schools, groups and licensing</a></p>' % e(b['id'])
def desk(intro=True):
    """The books desk: the formats on offer and one inquiry form. The form posts to /api/contact as topic books (see worker.js)."""
    boxes = ''.join('<label><input type="checkbox" name="title" value="%s"> %s</label>' % (e(b['id']), e(b['title'])) for b in B)
    head = ('<section id="ask"><h2>For schools, congregations, tour groups and publishers</h2>'
        '<p>The collection comes in four forms. The first two are on Amazon. Write to us for the others, for copies in quantity, or to license maps, timelines, charts or text. <a href="/organizations/">See what we offer organizations</a>.</p>') if intro else '<section id="ask"><h2>Formats</h2>'
    return (head +
        '<div class="bkways"><div><b>Paperback</b><span>Full color, 8 x 10 inches. On Amazon. Ask us about ten copies or more.</span></div>'
        '<div><b>Kindle</b><span>Every title as an ebook. On Amazon.</span></div>'
        '<div><b>PDF Interactive Edition</b><span>Each title as a PDF: printable, with live links and QR codes that connect every page to the site. Made for screens, classrooms and projection.</span></div>'
        '<div><b>Site license</b><span>This website for your school, congregation or organization: the maps, timelines, charts and tours, live and up to date.</span></div></div>'
        '<h3>Ask about copies, licenses or a talk</h3>'
        '<form class="subform" id="books-form">'
        '<div class="sf-row"><label>I am interested in<select name="want"><option value="subscribe">A subscription for our school or organization</option><option value="copies">Copies for a group (ten or more)</option><option value="pdf">The PDF Interactive Edition</option><option value="site">A site license for a school or organization</option><option value="license">Licensing maps, timelines, charts or text</option><option value="review">A review or press copy</option><option value="speaking">A talk or event with the author</option><option value="other">Something else</option></select></label></div>'
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
# The offer page for schools, congregations and organizations (/organizations/). Built from the Books page shell so the two stay in step.
def org_small(b):
    """A book card for the offer page: equal-length blurb, buy buttons pinned to one line, then a Look inside strip of two live pages."""
    tag = '' if b['status'] == 'available' else '<span class="bksoon">Coming soon</span>'
    taste = ''.join('<a href="%s" title="%s"><img src="%s" alt="%s" width="300" height="375" loading="lazy"></a>' % (e(h), e(t), e(i), e(t)) for i, h, t in b.get('samples', []))
    return ('<article class="bk2"><img src="%s" alt="Cover of %s" width="800" height="1000" loading="lazy">%s<h3>%s</h3><p class="bs">%s</p><p class="bkd">%s</p><div class="bkbuy">%s</div>'
            '<div class="bktaste"><b>Look inside</b><div>%s</div><a class="bkmore" href="%s">See more pages online</a></div></article>'
            % (e(b['cover']), e(b['title']), tag, e(b['title']), e(b['subtitle']), e(b.get('blurb') or b['desc']), buttons(b) + '<a class="bkbtn pdf" href="/organizations/?t=%s&amp;w=pdf#ask">PDF Interactive Edition</a>' % e(b['id']), taste, e(b.get('inside', '/books/'))))
SITE = [
    ('/news/', 'News from more than twenty publications', 'Headlines from The Times of Israel, The Jerusalem Post, Haaretz, JNS, Israel Hayom and many more, gathered through the day and sorted by topic.'),
    ('/views/', 'Views, side by side', 'Op-eds, editorials and blogs from across the Jewish and pro-Israel range, so readers can compare arguments in one place.'),
    ('/media/', 'Video, podcasts and music', 'Video channels, playlists, podcasts, music and images on Israel, chosen from the same family of sources.'),
    ('/glossary/', 'Explained as you read', 'Point at a name, place or term in a story and a short explanation appears. More than 500 glossary entries stand behind the news.'),
    ('/maps/', 'Maps and timelines online', 'Thirty-three maps and twenty-six timelines, each on its own page, ready for a screen or a projector.'),
    ('/hot/', 'Topics and who\'s who', 'Topic pages gather the latest headlines on one issue. Profiles introduce the people and organizations in the news.'),
    ('/tour/', 'A tour of the land', 'Ten regions and eighty-one sites, each with its picture and story, for trip planning or an armchair visit.'),
    ('/this-day/', 'This Day in History', 'What happened on today\'s date, with a calendar of holidays and days of remembrance.'),
]
def org_block():
    cards = '<div class="bkrow bk4">' + ''.join(org_small(b) for b in B) + '</div>'
    tiles = ''.join('<a class="sitef" href="%s"><b>%s</b><span>%s</span></a>' % (h, e(t), e(x)) for h, t, x in SITE)
    return (CSS + '<style>.bk4{grid-template-columns:repeat(4,minmax(0,1fr))}@media(max-width:900px){.bk4{grid-template-columns:1fr 1fr}}@media(max-width:520px){.bk4{grid-template-columns:1fr}}'
        '.bk4 .bk2 .bkd{flex:1}.bk4 .bkbuy{min-height:132px}.bk4 .bkbtn{display:block;margin:6px 0;padding:8px 6px;text-align:center;white-space:nowrap;font-size:.9rem}.bkbtn.pdf{background:#1d2330;color:#fff!important}.bktaste{border-top:1px solid var(--line);padding-top:10px;margin-top:4px}.bktaste b{display:block;font:700 .78rem system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;margin-bottom:6px}'
        '.bktaste div{display:grid;grid-template-columns:1fr 1fr;gap:8px}.bktaste img{width:100%;aspect-ratio:4/5;object-fit:cover;object-position:top;border:1px solid var(--line);border-radius:4px;box-shadow:none;background:#fff}.bktaste a:hover img{border-color:var(--gold)}.bkmore{display:inline-block;margin-top:8px;font:.88rem system-ui,sans-serif}'
        '.orgnote{background:var(--card);border:1px solid var(--gold);border-radius:12px;padding:14px 16px;margin:16px 0 22px}.orgnote p{margin:0 0 8px}.orgnote p:last-child{margin:0}'
        '.sitegrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:14px 0 18px}.sitef{display:block;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px;text-decoration:none;color:inherit}.sitef:hover{border-color:var(--gold)}.sitef b{display:block;margin-bottom:4px;font:700 1rem system-ui,sans-serif}.sitef span{font-size:.92rem}'
        '.sitehero{background:#1d2330;color:#fff;border-radius:12px;padding:20px 22px;margin:8px 0 14px}.sitehero h2{color:#fff;margin:0 0 8px}.sitehero p{margin:0 0 8px;color:#e9e6dc}.sitehero a{color:var(--gold)}.sitehero .bkbtn{color:#2a1d00!important;margin-top:6px}'
        '@media(max-width:900px){.sitegrid{grid-template-columns:1fr 1fr}}@media(max-width:520px){.sitegrid{grid-template-columns:1fr}}</style>'
        '<h2>The four books</h2>'
        '<p><i>Israel NOWlej</i> holds the whole collection in one volume. The three companion books each take one part of it: the maps, the timelines and the tour. They are sold on Amazon in paperback and Kindle.</p>'
        + cards +
        '<div class="orgnote"><p><b>Special pricing for organizations.</b> Schools, congregations, youth groups, tour programs and other organizations can order ten copies or more at a group price, and can license the PDF Interactive Edition of any title for classes and members. <a href="#ask">Ask us below</a>.</p></div><div class="orgnote"><p><b>PDF Interactive Edition.</b> Every title also comes as a PDF you can print, project or read on any screen. Its links and QR codes connect each page to the matching page online, so the PDF stays tied to the live maps, timelines and news. It is offered on its own, apart from the paperback and Kindle. <a href="/organizations/?w=pdf#ask">Ask for the PDF edition</a>.</p></div>'
        '<section class="sitehero"><h2>The website: israelnowlej.com</h2>'
        '<p><b>The day\'s news on Israel, beside the knowledge to understand it.</b> Israel NOWlej is the only place we know that puts news, views and video from the Jewish and pro-Israel press next to the maps, timelines and glossary that explain them.</p>'
        '<p>A student who reads a headline about the Golan can open the map, the timeline and the glossary entry without leaving the page.</p>'
        '<a class="bkbtn" href="/">Open the site</a></section>'
        '<div class="sitegrid">' + tiles + '</div>'
        '<h3>A big tent, and a safe one</h3>'
        '<p>Every source on the site is Jewish or pro-Israel. Within that, the tent is wide: more than twenty publications and many independent voices, from <i>Haaretz</i> to <i>Israel National News</i>, across the religious and political range. Educators and organizations can share it with students and members with confidence. <a href="/sources/">See the sources</a>.</p>'
        '<p>Our sister site, <a href="https://israelinsider.org/">Israel Insider</a>, follows independent writers, podcasters and video creators on Israel.</p>'
        '<div class="orgnote"><p><b>Subscriptions begin January 1, 2027.</b> From the new year, some parts of the site will be open to subscribers only.</p><p><b>Write to us by December 15, 2026</b> for special subscription pricing for your school, congregation or organization.</p></div>'
        '<h2>Made to teach</h2>'
        '<p>The books and the site are educational media, built to be looked at first and read second. A map, timeline or chart leads every spread, and a short text explains it.</p>'
        '<ul><li><b>Visual.</b> Maps, timelines, charts, rankings and tours that show four thousand years of history and the modern state at a glance.</li>'
        '<li><b>Connected.</b> Every page of the books carries a QR code that opens the matching page on the site, so a class can go from the printed page to the screen.</li>'
        '<li><b>Ready for a room.</b> The interactive PDF editions and the site work on a projector, a smartboard or a phone.</li>'
        '<li><b>Easy to look things up.</b> A glossary and index of more than 500 entries, in print and online.</li></ul>'
        + desk(False))
def org_page():
    s = open('books/index.html', encoding='utf-8').read()
    T, D = 'For Schools, Congregations and Organizations', 'The Israel NOWlej books and website for schools, congregations and organizations: educational media on Israel, group pricing, and special subscription pricing before December 15, 2026.'
    s = re.sub(r'<title>.*?</title>', lambda m: '<title>%s | Israel NOWlej</title>' % T, s, count=1)
    s = re.sub(r'(<meta name="description" content=")[^"]*', lambda m: m.group(1) + e(D), s, count=1)
    s = re.sub(r'(<meta property="og:description" content=")[^"]*', lambda m: m.group(1) + e(D), s, count=1)
    s = re.sub(r'(<meta property="og:title" content=")[^"]*', lambda m: m.group(1) + T + ' | Israel NOWlej', s, count=1)
    s = re.sub(r'(<meta property="og:image" content=")[^"]*', lambda m: m.group(1) + 'https://israelnowlej.com/img/og-israel-nowlej.jpg', s, count=1)
    s = s.replace('https://israelnowlej.com/books/', 'https://israelnowlej.com/organizations/')
    a, b = s.index('<article>'), s.rindex('</article>')
    body = ('<article><header class="ih"><h1>%s</h1><p class="meta">Books · Website · Organization pricing</p></header>'
            '<p class="lead">Israel NOWlej teaches the story of the Jewish land through maps, timelines, charts and tours, in four books and on this website. Here is what we offer schools, congregations, youth groups and other organizations.</p>' % T) + M0 + org_block() + M1
    import os; os.makedirs('organizations', exist_ok=True)
    open('organizations/index.html', 'w', encoding='utf-8').write(s[:a] + body + s[b:])
inject('about/index.html', 'about', r'<p class="lead">Israel NOWlej is a growing.*?</p>')
inject('books/index.html', 'books', r'<p class="lead">Three new books.*?</p>')
org_page()
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
