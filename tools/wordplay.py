#!/usr/bin/env python3
"""Builds the Hebrew Wordplay section from tools/wordplay.json.

Writes /g/<slug>/ pages and the /wordplay/ hub, adds the nav link to every page and
subnav.json, adds cards and a category button to /glossary/, and adds rows to
search.json and sitemap.xml. Safe to run again. Run from the repo root:
    python3 -I tools/wordplay.py
"""
import json, os, re, html, glob, unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
E = lambda s: html.escape(s, quote=True)
D = json.load(open(os.path.join(ROOT, 'tools', 'wordplay.json'), encoding='utf-8'))
SEC = D['section']
CAT = 'hebrew-wordplay'
ENT = D['entries']
glos = {g[1]: g[0] for g in json.load(open(os.path.join(ROOT, 'glossary.json'), encoding='utf-8'))}


PL = '<svg class="ic" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M7 4.5v15l12-7.5z"/></svg>'


def rd(p): return open(os.path.join(ROOT, p), encoding='utf-8').read()
def wr(p, s):
    full = os.path.join(ROOT, p)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    open(full, 'w', encoding='utf-8').write(s)


def plain(s): return re.sub(r'<[^>]+>', '', html.unescape(s))


# ---------- entry pages (template: an existing extra entry page)
T = rd('g/philistia/index.html')
art0, art1 = T.index('<article class="gl">'), T.index('</article>') + len('</article>')


def head(t, title, desc, url):
    t = re.sub(r'<title>.*?</title>', f'<title>{E(title)} | Israel NOWlej</title>', t, 1)
    t = re.sub(r'(<meta name="description" content=")[^"]*', r'\g<1>' + E(desc), t, 1)
    t = re.sub(r'(<link rel="canonical" href=")[^"]*', r'\g<1>' + url, t, 1)
    t = re.sub(r'(<meta property="og:title" content=")[^"]*', r'\g<1>' + E(title) + ' | Israel NOWlej', t, 1)
    t = re.sub(r'(<meta property="og:description" content=")[^"]*', r'\g<1>' + E(desc), t, 1)
    return t


def img(e):
    return f'/wordplay/img/{e["slug"]}.jpg' if os.path.exists(os.path.join(ROOT, 'wordplay', 'img', e['slug'] + '.jpg')) else ''


def entry_page(e):
    sl = e['slug']
    see = ' · '.join(f'<a href="/g/{s}/">{E(glos[s])}</a>' for s in e['see'] if s in glos)
    see = (see + ' · ' if see else '') + f'<a href="/wordplay/">More {SEC}</a>'
    art = f'''<article class="gl"><header class="ih"><h1>{E(e["title"])} <span class="he" lang="he" dir="rtl">{e["he"]}</span></h1><p class="meta">{SEC}</p><button class="wsay" data-say="{e["he"]}" aria-label="Hear {E(e["title"])} in Hebrew"><svg class="ic" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M7 4.5v15l12-7.5z"/></svg> Hear it</button><script src="/hebrew/say.js" defer></script></header>
<p class="lead edef" id="e-def">{e["def"]}<a class="econt" href="#e-summary" hidden>Continue &#9656;</a></p>
<nav class="esec" id="esec" aria-label="On this page"><a href="#e-images" data-s="e-images" hidden>Images</a><a href="#e-video" data-s="e-video" hidden>Video</a><a href="#e-summary" data-s="e-summary" hidden>More NOWlej</a><a href="#e-related">Related</a><a href="#e-sources">Sources</a></nav>
<section id="e-images" hidden data-name=""><div class="egal" id="e-gal"></div><p class="small">Photographs from Wikimedia Commons. Click an image to enlarge it. Author and license are shown with each.</p></section>
<section id="e-video" data-slug="{sl}" data-name="{E(e["title"])}" data-pins="[]" data-pls="[]" hidden><div class="vtop" id="e-player"></div><div class="vthumbs"></div><div class="vtop plp" id="e-plplayer" hidden></div><div class="tgrid"></div><div class="epl"></div></section>
<section id="e-summary" hidden><h2>MORE NOWLEJ</h2>
</section>
<section id="e-related"><h2>Related</h2>
<p><b>See also</b> {see}</p>
<div id="gl-news" data-slug="{sl}" hidden><h3>In the news</h3><div class="ngrid"></div><ul class="hlist"></ul><p class="small">Headlines and links from public news feeds. <a href="/news/">All news</a>.</p></div></section>
<section id="e-sources"><h2>Sources</h2><ul class="esrc" id="e-src"><li>Written for this site from standard reference works on Hebrew and the Bible.</li></ul></section></article>'''
    im = img(e)
    if im:
        fig = (f'<figure class="wcard"><img src="{im}" width="1200" height="927" alt="{E(e["title"])} {e["he"]}: Hebrew Wordplay card" loading="eager" '
               f'style="width:100%;height:auto;border-radius:10px;margin:14px 0"><figcaption style="text-align:center"><button class="wsay" data-say="{e["he"]}" aria-label="Hear {E(e["title"])} in Hebrew">'+PL+' Hear it</button></figcaption></figure>')
        art = re.sub(r'<button class="wsay"[^>]*>.*?</button>(?=<script)', '', art, 1, flags=re.S)
        art = art.replace('<nav class="esec"', fig + '<nav class="esec"', 1)
    pre_ = head(T[:art0], e['title'], e['card'], f'https://israelnowlej.com/g/{sl}/')
    if im:
        pre_ = re.sub(r'(<meta property="og:image" content=")[^"]*', r'\g<1>https://israelnowlej.com' + im, pre_, 1)
        pre_ = re.sub(r'(<meta property="og:image:width" content=")[^"]*', r'\g<1>1200', pre_, 1)
        pre_ = re.sub(r'(<meta property="og:image:height" content=")[^"]*', r'\g<1>927', pre_, 1)
        if 'twitter:image' not in pre_:
            pre_ = pre_.replace('<meta name="twitter:card"', f'<meta name="twitter:image" content="https://israelnowlej.com{im}"><meta name="twitter:card"', 1)
    page = pre_ + art + T[art1:]
    wr(f'g/{sl}/index.html', page)


for e in ENT:
    entry_page(e)

# ---------- hub page (template: the Charts hub, minus its second nav row)
H = rd('charts/index.html')
i0 = H.index('<div class="newsmain">') + len('<div class="newsmain">')
i1 = H.rindex('<div class="adslot" data-slot="lb-bottom"')
pre, post = H[:i0], H[i1:]
pre = re.sub(r'<div class="wrap subnav sub2".*?</div>', '', pre, 1, flags=re.S)
pre = head(pre, SEC, D['intro'], 'https://israelnowlej.com/wordplay/')
pre = re.sub(r'<meta property="og:image"[^>]*>', '', pre)


def thumb(e, L):
    im = img(e)
    if im: return f'<img src="{im}" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover">'
    return f'<span class="tile c-{CAT}"><b>{L}</b></span>'


def card(e, with_data=True):
    L = e['title'][0].upper()
    he = f'<span class="he" lang="he" dir="rtl">{e["he"]}</span>'
    n = f'{e["title"]} {e["he"]} {e["card"]}'.lower()
    return (f'<a class="gcard" href="/g/{e["slug"]}/" data-c="{CAT}" data-n="{E(n)}"><span class="gimg">{thumb(e, L)}</span>'
            f'<span class="gb"><span class="gcat c-{CAT}">{SEC}</span><b>{E(e["title"])}</b>{he}<span class="wsay mini" role="button" tabindex="0" data-say="{e["he"]}" aria-label="Hear {E(e["title"])}">'+PL+f'</span><span class="gd">{E(e["card"])}</span></span></a>')


hub = (f'<div class="hubslide"><h1>{SEC}</h1><p class="lead">{E(D["intro"])}</p><p><a class="subbtn" href="/wordplay/cards/" style="display:inline-block;padding:8px 16px;border-radius:8px;font-weight:700;text-decoration:none">Flash cards and quiz</a></p><div class="ggrid">'
       + ''.join(card(e) for e in ENT) + '</div></div><script src="/hebrew/say.js" defer></script>')
wr('wordplay/index.html', pre + hub + post)

# ---------- flash cards and quiz page
FLASH_CSS = """<style>
.fc h1{color:var(--fg)!important;opacity:1!important}.fc{--n:#0a2566;--g:#f8ba2f;max-width:760px;margin:0 auto}
.fc .bar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:12px 0}
.fc button{font:inherit;font-weight:700;border:2px solid var(--g);background:var(--n);color:#fff;border-radius:8px;padding:8px 14px;cursor:pointer}
.fc button[aria-pressed=true],.fc button.on{background:var(--g);color:#1a1400}
.fc .stage{perspective:1200px;margin:10px 0}
.fc .card{position:relative;width:100%;aspect-ratio:4/3;cursor:pointer;transform-style:preserve-3d;transition:transform .55s}
.fc .card.flip{transform:rotateY(180deg)}
.fc .face{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;border-radius:16px;border:3px solid var(--g);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:22px;color:#fff;
 background-color:var(--n);background-image:linear-gradient(rgba(255,255,255,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.07) 1px,transparent 1px);background-size:32px 32px}
.fc .back{transform:rotateY(180deg)}
.fc .he{font-size:clamp(72px,22vw,170px);font-weight:700;color:#ffc700;line-height:1.1}
.fc .hint{position:absolute;bottom:14px;font-size:14px;opacity:.75}
.fc .mean{font-size:clamp(28px,7vw,54px);font-weight:800;line-height:1.15}
.fc .tip{margin-top:14px;font-size:clamp(14px,2.6vw,18px);opacity:.9;max-width:34em}
.fc .tip a{color:var(--g)}
.fc .nav{display:flex;justify-content:space-between;align-items:center;gap:8px}
.fc .opts{display:grid;gap:10px;margin:12px 0}
.fc .opt{text-align:left;font-size:18px}
.fc .opt.ok{background:#2e8b57;border-color:#2e8b57}
.fc .opt.no{background:#a21c3c;border-color:#a21c3c}
.fc .qhe{font-size:clamp(64px,18vw,130px);color:#ffc700;font-weight:700;text-align:center;border:3px solid var(--g);border-radius:16px;padding:14px;background-color:var(--n);background-image:linear-gradient(rgba(255,255,255,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.07) 1px,transparent 1px);background-size:32px 32px}
.fc .score{font-weight:700}
@media (prefers-reduced-motion:reduce){.fc .card{transition:none}}
</style>"""
FLASH = """<div class="hubslide fc"><h1>Hebrew Wordplay: Flash Cards</h1>
<p class="lead">Look at the Hebrew. Guess the meanings. Flip the card to check.</p>
<div class="bar" role="group" aria-label="Mode"><button id="mf" aria-pressed="true">Flash cards</button><button id="mq" aria-pressed="false">Quiz</button><button id="sh">Shuffle</button></div>
<div id="fview"><div class="stage"><div class="card" id="card" tabindex="0" role="button" aria-label="Flip card"><div class="face front"><div class="he" id="fhe" lang="he" dir="rtl"></div><div class="hint">Tap to flip. Space also flips.</div></div><div class="face back"><div class="he" id="fhe2" lang="he" dir="rtl" style="font-size:clamp(44px,12vw,80px)"></div><div class="mean" id="fm"></div><div class="tip" id="ft"></div><button class="wsay" id="fsay" data-say=""><svg class="ic" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M7 4.5v15l12-7.5z"/></svg> Hear it</button></div></div></div><script src="/hebrew/say.js" defer></script>
<div class="nav"><button id="pv"><svg class="ic" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round" d="M15 5l-7 7 7 7"/></svg> Back</button><span id="pos" class="score"></span><button id="nx">Next <svg class="ic" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg></button></div></div>
<div id="qview" hidden><div class="qhe" id="qhe" lang="he" dir="rtl"></div><p class="score" id="qs"></p><div class="opts" id="opts"></div><div class="nav"><span id="fb"></span><button id="qn" hidden>Next <svg class="ic" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg></button></div></div>
<script>(function(){var W=__DATA__,i=0,q=[],qi=0,sc=0,$=function(x){return document.getElementById(x)};
function show(){var w=W[i];$('card').classList.remove('flip');$('fhe').textContent=w.h;$('fhe2').textContent=w.h;$('fsay').setAttribute('data-say',w.h);$('fm').textContent=w.m;$('ft').innerHTML=w.t+' <a href="/g/'+w.s+'/">Read the entry</a>';$('pos').textContent=(i+1)+' of '+W.length}
function flip(){$('card').classList.toggle('flip');if($('card').classList.contains('flip')&&window.heSay)heSay(W[i].h)}
function shuf(a){for(var k=a.length-1;k>0;k--){var j=Math.floor(Math.random()*(k+1)),t=a[k];a[k]=a[j];a[j]=t}return a}
$('card').onclick=flip;$('card').onkeydown=function(e){if(e.key==' '||e.key=='Enter'){e.preventDefault();flip()}};
$('nx').onclick=function(){i=(i+1)%W.length;show()};$('pv').onclick=function(){i=(i+W.length-1)%W.length;show()};
document.onkeydown=function(e){if($('fview').hidden)return;if(e.key=='ArrowRight')$('nx').onclick();if(e.key=='ArrowLeft')$('pv').onclick()};
$('sh').onclick=function(){shuf(W);i=0;show();if(!$('qview').hidden)start()};
function mode(m){$('fview').hidden=m!='f';$('qview').hidden=m!='q';$('mf').setAttribute('aria-pressed',m=='f');$('mq').setAttribute('aria-pressed',m=='q');if(m=='q')start()}
$('mf').onclick=function(){mode('f')};$('mq').onclick=function(){mode('q')};
function start(){q=shuf(W.slice()).slice(0,10);qi=0;sc=0;ask()}
function ask(){if(qi>=q.length){$('qhe').textContent='✓';$('qs').textContent='Final score: '+sc+' of '+q.length;$('opts').innerHTML='';$('fb').textContent='';$('qn').hidden=false;$('qn').textContent='Play again';$('qn').onclick=start;return}
var w=q[qi],o=shuf(W.filter(function(x){return x.s!=w.s}).slice()).slice(0,3);o.push(w);shuf(o);
$('qhe').textContent=w.h;$('qs').textContent='Question '+(qi+1)+' of '+q.length+'. Score '+sc+'.';$('fb').textContent='';$('qn').hidden=true;$('opts').innerHTML='';
o.forEach(function(x){var b=document.createElement('button');b.className='opt';b.textContent=x.m;b.onclick=function(){var all=$('opts').children;for(var k=0;k<all.length;k++){all[k].disabled=true;if(all[k].textContent==w.m)all[k].classList.add('ok')}
if(x.s==w.s){sc++;$('fb').textContent='Correct.'}else{b.classList.add('no');$('fb').textContent='Not quite.'}
$('qs').textContent='Question '+(qi+1)+' of '+q.length+'. Score '+sc+'.';$('qn').hidden=false;$('qn').textContent=qi+1<q.length?'Next ▶':'See score';$('qn').onclick=function(){qi++;ask()}};$('opts').appendChild(b)})}
show()})();</script>
<p class="small"><a href="/wordplay/">All Hebrew Wordplay entries</a></p></div>"""
data = [{'s': e['slug'], 'h': e['he'], 'm': e['mean'], 't': E(e['card'])} for e in ENT]
fp = head(pre, SEC + ': Flash Cards and Quiz', 'Guess the meanings of Hebrew words with several senses. Flip the card to check, or take the quiz.', 'https://israelnowlej.com/wordplay/cards/')
fp = fp.replace('</head>', FLASH_CSS + '</head>', 1)
wr('wordplay/cards/index.html', fp + FLASH.replace('__DATA__', json.dumps(data, ensure_ascii=False)) + post)

# ---------- nav link on every page, and subnav.json
OLD = '<a href="/about/">Book</a><a href="/glossary/">A-Z</a>'
NEW = f'<a href="/about/">Book</a><a href="/hebrew/">Hebrew</a><a href="/glossary/">A-Z</a>'
n = 0
for dp, dn, fn in os.walk(ROOT):
    if '.git' in dp.split(os.sep): continue
    for f in fn:
        if f.endswith('.html'):
            p = os.path.join(dp, f)
            s = open(p, encoding='utf-8').read()
            if OLD in s and NEW not in s:
                open(p, 'w', encoding='utf-8').write(s.replace(OLD, NEW)); n += 1
print('nav updated on', n, 'pages')
for p in ('subnav.json', 'tools/subnav.json'):
    s = rd(p)
    if '/hebrew/' not in s:
        s = s.replace('["Book", "/about/"], ["Books", "/books/"], ["A-Z", "/glossary/"]',
                      f'["Book", "/about/"], ["Books", "/books/"], ["Hebrew", "/hebrew/"], ["A-Z", "/glossary/"]')
        wr(p, s)

# ---------- glossary A-Z page: category button, count, cards
G = rd('glossary/index.html')
if f'data-c="{CAT}" aria-pressed' not in G:
    m = re.search(r'<button type="button" data-c="" aria-pressed="true">All <i>(\d+)</i></button>', G)
    G = G.replace(m.group(0), m.group(0).replace(m.group(1), str(int(m.group(1)) + len(ENT))))
    k = G.index('</div><p class="az" id="gaz">')
    G = G[:k] + f'<button type="button" data-c="{CAT}" aria-pressed="false">{SEC} <i>{len(ENT)}</i></button>' + G[k:]
for e in ENT:
    L = e['title'][0].upper()
    if f'href="/g/{e["slug"]}/"' in G:
        if img(e):
            G = re.sub(r'(<a class="gcard" href="/g/' + re.escape(e['slug']) + r'/"[^>]*><span class="gimg">).*?(</span><span class="gb">)',
                       lambda m: m.group(1) + thumb(e, L) + m.group(2), G, 1, flags=re.S)
        continue
    a = G.index(f'<section class="gsec" data-l="{L}">')
    b = G.index('</div></section>', a)
    grid = G[a:b]
    key = f'{e["title"]} {e["he"]}'.lower()
    pos = None
    for m in re.finditer(r'<a class="gcard" href="[^"]+" data-c="[^"]*" data-n="([^"]*)"', grid):
        if m.group(1) > key:
            pos = m.start(); break
    ins = card(e)
    grid = grid[:pos] + ins + grid[pos:] if pos is not None else grid + ins
    G = G[:a] + grid + G[b:]
bm = re.search(r'(data-c="' + CAT + r'" aria-pressed="false">' + re.escape(SEC) + r' <i>)(\d+)', G)
am = re.search(r'(data-c="" aria-pressed="true">All <i>)(\d+)', G)
if bm and am and int(bm.group(2)) != len(ENT):
    diff = len(ENT) - int(bm.group(2))
    G = G[:am.start(2)] + str(int(am.group(2)) + diff) + G[am.end(2):]
    bm = re.search(r'(data-c="' + CAT + r'" aria-pressed="false">' + re.escape(SEC) + r' <i>)(\d+)', G)
    G = G[:bm.start(2)] + str(len(ENT)) + G[bm.end(2):]
wr('glossary/index.html', G)

# ---------- search.json and sitemap.xml
S = json.load(open(os.path.join(ROOT, 'search.json'), encoding='utf-8'))
have = {r['u'] for r in S}
for e in ENT:
    u = f'/g/{e["slug"]}/'
    if u not in have:
        S.append({'t': f'{e["title"]} {e["he"]}', 'u': u, 'k': 'GLOSSARY', 's': SEC, 'x': plain(e['def'])[:300]})
if '/wordplay/cards/' not in have:
    S.append({'t': SEC + ': Flash Cards and Quiz', 'u': '/wordplay/cards/', 'k': 'GLOSSARY', 's': SEC, 'x': 'Flash cards and a quiz on Hebrew words with several meanings.'})
if '/wordplay/' not in have:
    S.append({'t': SEC, 'u': '/wordplay/', 'k': 'GLOSSARY', 's': SEC, 'x': D['intro']})
json.dump(S, open(os.path.join(ROOT, 'search.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
M = rd('sitemap.xml')
add = ''.join(f'<url><loc>https://israelnowlej.com{u}</loc></url>\n' for u in ['/wordplay/', '/wordplay/cards/'] + [f'/g/{e["slug"]}/' for e in ENT] if f'<loc>https://israelnowlej.com{u}</loc>' not in M)
if add: wr('sitemap.xml', M.replace('</urlset>', add + '</urlset>'))
print('done', len(ENT), 'entries')
