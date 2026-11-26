#!/usr/bin/env python3
"""Builds the Hebrew knowledge section: /hebrew/ hub, /hebrew/travel/ course page and lesson pages.
Data: tools/hebrew_course.json. Run from the repo root: python3 -I tools/hebrew.py"""
import json, os, re, html
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
E = lambda s: html.escape(s, quote=True)
C = json.load(open(os.path.join(ROOT, 'tools', 'hebrew_course.json'), encoding='utf-8'))
LIVE = set(range(1, 11))
def rd(p): return open(os.path.join(ROOT, p), encoding='utf-8').read()
def wr(p, s):
    f = os.path.join(ROOT, p); os.makedirs(os.path.dirname(f), exist_ok=True); open(f, 'w', encoding='utf-8').write(s)
def head(t, title, desc, url):
    t = re.sub(r'<title>.*?</title>', f'<title>{E(title)} | Israel NOWlej</title>', t, 1)
    t = re.sub(r'(<meta name="description" content=")[^"]*', r'\g<1>' + E(desc), t, 1)
    t = re.sub(r'(<link rel="canonical" href=")[^"]*', r'\g<1>' + url, t, 1)
    t = re.sub(r'(<meta property="og:title" content=")[^"]*', r'\g<1>' + E(title) + ' | Israel NOWlej', t, 1)
    t = re.sub(r'(<meta property="og:description" content=")[^"]*', r'\g<1>' + E(desc), t, 1)
    return re.sub(r'<meta property="og:image"[^>]*>', '', t)
H = rd('charts/index.html')
i0 = H.index('<div class="newsmain">') + len('<div class="newsmain">')
i1 = H.rindex('<div class="adslot" data-slot="lb-bottom"')
PRE = re.sub(r'<div class="wrap subnav sub2".*?</div>', '', H[:i0], 1, flags=re.S); POST = H[i1:]
def page(title, desc, url, body, extra=''):
    return head(PRE, title, desc, url).replace('</head>', extra + '</head>', 1) + body + POST

CSS = """<style>
.hx h1,.ls h1{color:var(--fg)!important;opacity:1!important}
.hx{max-width:560px;margin:0 auto;--n:#0a2566;--g:#f8ba2f}
.hx .tiles{display:grid;gap:12px;margin:14px 0}
.hx .tile2{display:block;padding:18px;border-radius:14px;border:3px solid var(--g);color:#fff!important;text-decoration:none;background-color:var(--n);background-image:linear-gradient(rgba(255,255,255,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.07) 1px,transparent 1px);background-size:28px 28px}
.hx .tile2 b{display:block;font-size:22px}.hx .tile2 span{opacity:.85}
.hx .tile2 .he{color:#ffc700;font-size:34px;float:right}
.hx ol.ll{list-style:none;padding:0;margin:12px 0;display:grid;gap:10px}
.hx ol.ll li a,.hx ol.ll li div{display:flex;gap:12px;align-items:center;padding:14px;border:2px solid var(--g);border-radius:12px;background:var(--n);color:#fff!important;text-decoration:none}
.hx ol.ll li div{opacity:.55}.hx ol.ll .no{font-weight:800;color:var(--g);font-size:22px;min-width:28px}
.hx ol.ll small{display:block;opacity:.8}
.ls{--n:#0a2566;--g:#f8ba2f;max-width:520px;margin:0 auto;padding-bottom:84px}
.ls .prog{height:6px;background:rgba(0,0,0,.15);border-radius:3px;margin:8px 0 12px;overflow:hidden}.ls .prog i{display:block;height:100%;background:var(--g);width:0;transition:width .3s}
.ls .panel{min-height:58vh;border-radius:16px;border:3px solid var(--g);color:#fff;padding:20px;text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;
 background-color:var(--n);background-image:linear-gradient(rgba(255,255,255,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.07) 1px,transparent 1px);background-size:30px 30px}
.ls .he{font-size:clamp(54px,17vw,92px);color:#ffc700;font-weight:700;line-height:1.1}
.ls .hs{font-size:clamp(36px,11vw,58px)}
.ls .rom{font-size:22px;font-weight:700}.ls .en{font-size:19px;opacity:.9}.ls .nt{font-size:15px;opacity:.8;max-width:30em}
.ls h2{margin:0;color:#fff;font-size:26px}.ls p{margin:0}
.ls .bar{position:fixed;left:0;right:0;bottom:0;display:flex;gap:10px;padding:10px 14px calc(10px + env(safe-area-inset-bottom));background:rgba(10,37,102,.97);border-top:3px solid var(--g);z-index:5;justify-content:center}
.ls .bar button,.ls .btn{font:inherit;font-weight:800;font-size:18px;min-height:48px;border-radius:12px;border:2px solid var(--g);background:var(--n);color:#fff;padding:8px 16px;cursor:pointer}
.ls .bar .go,.ls .btn.go{background:var(--g);color:#1a1400;flex:1;max-width:260px}
.ls .row{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}
.ls .btn[aria-pressed=true]{background:var(--g);color:#1a1400}
.ls .opt{display:block;width:100%;text-align:left}
.ls .opt.ok{background:#2e8b57;border-color:#2e8b57}.ls .opt.no{background:#a21c3c;border-color:#a21c3c}
.ls .line{width:100%;text-align:left;padding:10px 12px;border-radius:12px;background:rgba(255,255,255,.1)}
.ls .line.tr{background:rgba(248,186,47,.18)}.ls .line .hh{font-size:26px;color:#ffc700;direction:rtl;text-align:right;display:block}
.ls .flip{perspective:900px;width:100%}.ls .fl{min-height:34vh;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px}
.ls small.ph{opacity:.7;font-size:13px}
.ls .chips{display:flex;gap:6px;margin:4px 0}.ls .chip{font:inherit;font-weight:700;font-size:14px;border-radius:999px;border:2px solid var(--g);background:var(--n);color:#fff;padding:5px 12px;cursor:pointer}.ls .chip[aria-pressed=true]{background:var(--g);color:#1a1400}.ls .pick{display:grid;gap:6px;margin:6px 0 10px}.ls .pk{display:block;padding:10px 12px;border-radius:10px;background:var(--n);color:#fff!important;text-decoration:none;border:2px solid transparent}.ls .pk.on{border-color:var(--g)}.ls .pk b{color:var(--g);margin-right:6px}
.ls .brand{font-size:13px;letter-spacing:.18em;text-transform:uppercase;color:var(--g);font-weight:800}.ls .big{font-size:clamp(30px,9vw,44px);font-weight:800;line-height:1.1;color:#fff}.ls .em{font-size:60px;line-height:1}.ls .lnk{background:none;border:0;color:var(--g);text-decoration:underline;font:inherit;font-size:15px;cursor:pointer}.ls .line.on{outline:3px solid var(--g)}.ls{--sp:16px}.ls .panel{gap:var(--sp);padding:26px 20px}
</style>"""

def hub():
    body = f"""<div class="hubslide hx"><h1>Hebrew</h1><p class="lead">Learn the Hebrew behind the headlines, the Bible and the street. Start with play or start with travel.</p>
<div class="tiles">
<a class="tile2" href="/hebrew/travel/"><span class="he" lang="he" dir="rtl">שלום</span><b>Easy Hebrew for Travelers</b><span>Ten short lessons for the beach, the restaurant, the hotel and the night out. Built for your phone.</span></a>
<a class="tile2" href="/wordplay/"><span class="he" lang="he" dir="rtl">הודו</span><b>Hebrew Wordplay</b><span>One word, several meanings, and the stories behind them.</span></a>
<a class="tile2" href="/wordplay/cards/"><span class="he" lang="he" dir="rtl">חי</span><b>Flash cards and quiz</b><span>Guess the meanings, then flip the card.</span></a>
</div></div>"""
    wr('hebrew/index.html', page('Hebrew', 'Hebrew for travelers and the curious: a travel course, wordplay entries, flash cards and a quiz.', 'https://israelnowlej.com/hebrew/', body, CSS))

def travel():
    items = ''
    for l in C['lessons']:
        n = l['n']
        inner = f'<span class="no">{n}</span><span><b>{E(l["title"])}</b><small>{E(l["goal"])}</small></span>'
        items += f'<li><a href="/hebrew/travel/{n}/">{inner}</a></li>' if n in LIVE else f'<li><div>{inner}<small style="margin-left:auto">Soon</small></div></li>'
    body = f"""<div class="hubslide hx"><h1>Easy Hebrew for Travelers</h1><p class="lead">Ten short lessons to enjoy your trip. Each takes about six minutes on your phone. You learn what to say, hear it, practise it and take a quiz.</p><ol class="ll">{items}</ol><p class="small"><a href="/hebrew/">All Hebrew</a></p></div>"""
    wr('hebrew/travel/index.html', page('Easy Hebrew for Travelers', 'Ten short mobile lessons of conversational Hebrew for beaches, restaurants, hotels and nights out.', 'https://israelnowlej.com/hebrew/travel/', body, CSS))

JS = r"""<script>(function(){var ALL=__ALL__,L=__DATA__,NEXT=__NEXT__,$=function(x){return document.getElementById(x)},app=$('app');
var G=null;try{G=localStorage.getItem('hg')}catch(e){}var SHOWH=false,TO='m',S=[],i=0,score=0,answered=false;
function pk(o,k){return(G=='f'&&o['t_f'])?o[k=='t'?'t_f':'r_f']:o[k]}
function sh(a){a=a.slice();for(var k=a.length-1;k>0;k--){var j=Math.floor(Math.random()*(k+1)),t=a[k];a[k]=a[j];a[j]=t}return a}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;')}
function mk(t,r,p,v){var u=new SpeechSynthesisUtterance(t);u.lang='he-IL';u.rate=r;u.pitch=p;if(v)u.voice=v;return u}
function qparts(t){var m=t.replace(/\s*\?\s*$/,'');var k=m.lastIndexOf(' ');return null}
function sayq(t,r,p,v,onst){var q=qparts(t),out=[];if(q){var a=mk(q[0],r,p,v),b=mk(q[1],r*.9,p+.25,v);if(onst)a.onstart=onst;out=[a,b]}else{var c=mk(t,r,p,v);if(onst)c.onstart=onst;out=[c]}out.forEach(function(u){speechSynthesis.speak(u)})}
function say(t,slow){try{speechSynthesis.cancel();sayq(t,slow?.55:.85,1)}catch(e){}}
function ptext(p){var f=(p.gender=='listener')?(TO=='f'&&p.t_f):(p.gender=='speaker'&&G=='f'&&p.t_f);return f?[p.t_f,p.r_f]:[p.t,p.r]}
function build(){S=[{k:'title'},{k:'who'},{k:'intro'}];L.phrases.forEach(function(p,x){S.push({k:'ph',p:p})});S.push({k:'dlgi'});S.push({k:'dlg'});S.push({k:'fci'});sh(L.phrases).slice(0,6).forEach(function(p){S.push({k:'fc',p:p})});S.push({k:'qi'});L.quiz.forEach(function(q){S.push({k:'q',q:q})});S.push({k:'done'})}
function secOf(k){return k=='ph'?'Learn':(k=='dlgi'||k=='dlg')?'Listen':(k=='fci'||k=='fc')?'Cards':(k=='qi'||k=='q'||k=='done')?'Quiz':''}
function chips(){var cur=secOf(S[i].k),h='';['Learn','Listen','Cards','Quiz'].forEach(function(n){var idx=S.findIndex(function(x){return secOf(x.k)==n});h+='<button class="chip" data-i="'+idx+'" aria-pressed="'+(cur==n)+'">'+n+'</button>'});$('chips').innerHTML=h;$('chips').querySelectorAll('.chip').forEach(function(c){c.onclick=function(){if(S[i].k=='who'&&!G)return;i=+c.getAttribute('data-i');render()}})}
function bar(h){$('bar').innerHTML=h}
function render(){var s=S[i];$('pg').style.width=(i/(S.length-1)*100)+'%';var h='',b='';
var back=i>0?'<button id="bk" aria-label="Back">&#9664;</button>':'';var nx='<button class="go" id="nx">Next &#9654;</button>';
if(s.k=='title'){h='<div class="brand">Israel NOWlej</div><div class="big">Easy Hebrew<br>for Travelers</div><p class="en">Lesson '+L.n+': '+esc(L.title)+'</p><p class="nt">About six minutes. Listen, say it, check it.</p>';b='<button class="go" id="nx">Start &#9654;</button>'}
else if(s.k=='who'){h='<h2>Who is learning?</h2><p class="en">Hebrew changes for men and women. Pick yours.</p><div class="row"><button class="btn" id="gm" aria-pressed="'+(G=='m')+'">I am a man</button><button class="btn" id="gf" aria-pressed="'+(G=='f')+'">I am a woman</button></div>';b=G?nx:''}
else if(s.k=='intro'){h='<small class="ph">Lesson '+L.n+'</small><h2>'+esc(L.title)+'</h2><p class="en">'+esc(L.goal)+'</p><p class="nt">'+esc(L.intro)+'</p>';b=back+nx}
else if(s.k=='ph'){var p=s.p,t=ptext(p);h=(p.img?'<div class="em">'+p.img+'</div>':'')+'<div class="he" lang="he" dir="rtl">'+t[0]+'</div><div class="rom">'+esc(t[1])+'</div><div class="en">'+esc(p.en)+'</div>'+(p.gender=='listener'?'<div class="row"><button class="btn" id="tm" aria-pressed="'+(TO=='m')+'">To a man</button><button class="btn" id="tf" aria-pressed="'+(TO=='f')+'">To a woman</button></div>':'')+'<div class="row"><button class="btn" id="pl">&#9654; Play</button><button class="btn" id="ps">Slow</button></div>'+(p.note?'<button class="lnk" id="nb">Good to know</button><p class="nt" id="nn" hidden>'+esc(p.note)+'</p>':'');b=back+nx}
else if(s.k=='dlgi'){h='<div class="em">&#127911;</div><h2>Listen to a real conversation</h2><p class="en">Press play and listen first.</p>';b=back+nx}
else if(s.k=='dlg'){h='<button class="btn go" id="pa">&#9654; Play conversation</button><div style="width:100%" id="dl"></div><button class="lnk" id="tg">'+(SHOWH?'Hide Hebrew':'Show Hebrew')+'</button>';b=back+nx}
else if(s.k=='fci'){h='<h2>Flash cards</h2><p class="en">Read the Hebrew. Guess. Tap the card to check.</p>';b=back+nx}
else if(s.k=='fc'){var q=s.p,tt=ptext(q);h='<div class="fl" id="fl"><div class="he hs" lang="he" dir="rtl">'+tt[0]+'</div><small class="ph">Tap to flip</small></div>';s.f=0;b=back+nx}
else if(s.k=='qi'){h='<h2>Quiz time</h2><p class="en">Five questions. No pressure, just pride.</p>';score=0;b=back+nx}
else if(s.k=='q'){var q=s.q,o=sh([q.answer].concat(q.wrong));answered=false;h='<p class="en" style="font-size:22px;font-weight:800">'+esc(q.q)+'</p><div style="width:100%" id="op">'+o.map(function(x){return '<button class="btn opt" data-v="'+esc(x)+'">'+esc(x)+'</button>'}).join('<div style="height:8px"></div>')+'</div><p class="nt" id="wy"></p>';b=''}
else if(s.k=='done'){h='<h2>Lesson complete</h2><p class="en">Quiz score: '+score+' of '+L.quiz.length+'</p><p class="nt">'+esc(L.tip)+'</p><div class="row"><button class="btn go" id="pc">Save phone card</button></div><canvas id="cv" width="1080" height="1620" style="display:none"></canvas><div id="dlk"></div>'+(NEXT?'<a class="btn" href="'+NEXT+'">Next lesson</a>':'<a class="btn" href="/hebrew/travel/">All lessons</a>');b=back+'<button class="go" id="rs">Start again</button>'}
$('panel').innerHTML=h;bar(b);chips();wire(s)}
function wire(s){var g=function(x){return $(x)};
if(g('bk'))g('bk').onclick=function(){i--;render()};if(g('nx'))g('nx').onclick=function(){i++;render()};
if(s.k=='who'){g('gm').onclick=function(){G='m';try{localStorage.setItem('hg','m')}catch(e){}render()};g('gf').onclick=function(){G='f';try{localStorage.setItem('hg','f')}catch(e){}render()}}
if(s.k=='ph'){var t=ptext(s.p);if(g('nb'))g('nb').onclick=function(){g('nn').hidden=false;g('nb').hidden=true};g('pl').onclick=function(){say(t[0],0)};g('ps').onclick=function(){say(t[0],1)};if(g('tm')){g('tm').onclick=function(){TO='m';render()};g('tf').onclick=function(){TO='f';render()}}}
if(s.k=='dlg'){var d=g('dl');function draw(){d.innerHTML='';L.dialogue.forEach(function(x,k){var a=document.createElement('div');a.className='line'+(x.who=='traveler'?' tr':'');a.id='ln'+k;a.innerHTML='<div class="en">'+esc(x.en)+'</div>'+(SHOWH?'<span class="hh" lang="he">'+pk(x,'t')+'</span><b>'+esc(pk(x,'r'))+'</b>':'');a.onclick=function(){say(pk(x,'t'),0)};d.appendChild(a)})}
draw();g('tg').onclick=function(){SHOWH=!SHOWH;g('tg').textContent=SHOWH?'Hide Hebrew':'Show Hebrew';draw()};
g('pa').onclick=function(){try{speechSynthesis.cancel();var hv=speechSynthesis.getVoices().filter(function(v){return /^he/i.test(v.lang)});L.dialogue.forEach(function(x,k){sayq(pk(x,'t'),.8,x.who=='local'?1.3:.85,hv.length?hv[x.who=='local'?hv.length-1:0]:null,function(){document.querySelectorAll('.line.on').forEach(function(e){e.classList.remove('on')});var e=document.getElementById('ln'+k);if(e){e.classList.add('on');e.scrollIntoView({block:'center',behavior:'smooth'})}})})}catch(e){}}}
if(s.k=='fc'){var tt=ptext(s.p);g('fl').onclick=function(){s.f=!s.f;g('fl').innerHTML=s.f?'<div class="en" style="font-size:28px;font-weight:800">'+esc(s.p.en)+'</div><div class="rom">'+esc(tt[1])+'</div><button class="btn" id="fp">&#9654; Play</button>':'<div class="he hs" lang="he" dir="rtl">'+tt[0]+'</div><small class="ph">Tap to flip</small>';if(g('fp'))g('fp').onclick=function(e){e.stopPropagation();say(tt[0],0)}}}
if(s.k=='q'){var bs=document.querySelectorAll('#op .opt');bs.forEach(function(bt){bt.onclick=function(){if(answered)return;answered=true;var ok=bt.getAttribute('data-v')==s.q.answer;if(ok)score++;bs.forEach(function(x){if(x.getAttribute('data-v')==s.q.answer)x.classList.add('ok')});if(!ok)bt.classList.add('no');g('wy').textContent=(ok?'Correct. ':'Not quite. ')+s.q.why;bar('<button class="go" id="nx2">Next &#9654;</button>');g('nx2').onclick=function(){i++;render()}}})}
if(s.k=='done'){g('rs').onclick=function(){i=1;render()};g('pc').onclick=card}}
function card(){var c=$('cv'),x=c.getContext('2d');x.fillStyle='#0a2566';x.fillRect(0,0,1080,1620);x.strokeStyle='rgba(255,255,255,.08)';for(var k=0;k<1080;k+=36){x.beginPath();x.moveTo(k,0);x.lineTo(k,1620);x.stroke()}for(var k=0;k<1620;k+=36){x.beginPath();x.moveTo(0,k);x.lineTo(1080,k);x.stroke()}
x.strokeStyle='#f8ba2f';x.lineWidth=8;x.strokeRect(14,14,1052,1592);x.fillStyle='#fff';x.textAlign='center';x.font='bold 64px sans-serif';x.fillText(L.title,540,120);x.fillStyle='#f8ba2f';x.font='34px sans-serif';x.fillText('Easy Hebrew, lesson '+L.n,540,172);
var ps=L.phrases.slice(0,7),y=270;ps.forEach(function(p){var t=ptext(p);x.fillStyle='#ffc700';x.font='bold 72px sans-serif';x.direction='rtl';x.fillText(t[0],540,y);x.direction='ltr';x.fillStyle='#fff';x.font='bold 36px sans-serif';x.fillText(t[1],540,y+48);x.font='30px sans-serif';x.fillStyle='#cfd8f0';x.fillText(p.en,540,y+90);y+=190});
x.fillStyle='#f8ba2f';x.font='bold 44px sans-serif';x.fillText('Israel NOWlej',540,1560);x.fillStyle='#fff';x.font='30px sans-serif';x.fillText('israelnowlej.com/hebrew/travel/',540,1596);
var a=document.createElement('a');a.href=c.toDataURL('image/png');a.download='hebrew-lesson-'+L.n+'.png';a.className='btn go';a.textContent='Download the card';$('dlk').innerHTML='';$('dlk').appendChild(a)}
build();app.innerHTML='<div class="row" style="justify-content:space-between;margin-bottom:6px"><button class="chip" id="allb">All 10 lessons &#9662;</button><span class="small">Lesson '+L.n+' of '+ALL.length+'</span></div><div class="pick" id="pick" hidden>'+ALL.map(function(x){return '<a class="pk'+(x.n==L.n?' on':'')+'" href="/hebrew/travel/'+x.n+'/"><b>'+x.n+'</b> '+esc(x.t)+'</a>'}).join('')+'</div><div class="chips" id="chips"></div><div class="prog"><i id="pg"></i></div><div class="panel" id="panel"></div><div class="bar" id="bar"></div>';$('allb').onclick=function(){$('pick').hidden=!$('pick').hidden};render()})();</script>"""

def lesson(l):
    n = l['n']; nxt = f'/hebrew/travel/{n+1}/' if (n + 1) in LIVE else ''
    js = JS.replace('__ALL__', json.dumps([{'n': x['n'], 't': x['title']} for x in C['lessons']], ensure_ascii=False)).replace('__DATA__', json.dumps(l, ensure_ascii=False)).replace('__NEXT__', json.dumps(nxt))
    body = f'<div class="hubslide ls"><h1 style="font-size:20px;margin:6px 0">Easy Hebrew for Travelers. Lesson {n}: {E(l["title"])}</h1><div id="app" class="app"></div><noscript><p>This lesson needs JavaScript.</p></noscript>{js}<p class="small"><a href="/hebrew/travel/">All lessons</a> &middot; <a href="/g/{l["wordplay"]}/">Related word</a></p></div>'
    wr(f'hebrew/travel/{n}/index.html', page(f'Easy Hebrew for Travelers, Lesson {n}: {l["title"]}', l['goal'], f'https://israelnowlej.com/hebrew/travel/{n}/', body, CSS))

hub(); travel()
for l in C['lessons']:
    if l['n'] in LIVE: lesson(l)

# search.json and sitemap.xml
S = json.load(open(os.path.join(ROOT, 'search.json'), encoding='utf-8')); have = {r['u'] for r in S}
rows = [('Hebrew', '/hebrew/', 'Hebrew for travelers and the curious.'), ('Easy Hebrew for Travelers', '/hebrew/travel/', 'Ten short mobile lessons of conversational Hebrew.')] + [(f'Easy Hebrew for Travelers, Lesson {l["n"]}: {l["title"]}', f'/hebrew/travel/{l["n"]}/', l['goal']) for l in C['lessons'] if l['n'] in LIVE]
for t, u, x in rows:
    if u not in have: S.append({'t': t, 'u': u, 'k': 'GLOSSARY', 's': 'Hebrew', 'x': x})
json.dump(S, open(os.path.join(ROOT, 'search.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
M = rd('sitemap.xml'); add = ''.join(f'<url><loc>https://israelnowlej.com{u}</loc></url>\n' for _, u, _ in rows if f'<loc>https://israelnowlej.com{u}</loc>' not in M)
if add: wr('sitemap.xml', M.replace('</urlset>', add + '</urlset>'))
print('hebrew done')
