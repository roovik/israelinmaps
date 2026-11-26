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
    base = re.sub(r'<link rel="apple-touch-icon" href="/apple-touch-icon.png">', '', PRE) if 'apple-touch-icon' in extra else PRE
    h = head(base, title, desc, url)
    if 'apple-touch-icon' in extra:
        h = re.sub(r'<meta name="viewport"[^>]*>', '<meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">', h, 1)
    return h.replace('</head>', extra + '</head>', 1) + body + POST

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
.ls,.ls *{touch-action:manipulation;-webkit-text-size-adjust:100%}
.ls{--n:#0a2566;--g:#f8ba2f;max-width:520px;margin:0 auto;padding-bottom:84px}
.ls .prog{height:6px;background:rgba(0,0,0,.15);border-radius:3px;margin:8px 0 12px;overflow:hidden}.ls .prog i{display:block;height:100%;background:var(--g);width:0;transition:width .3s}
.ls .panel{min-height:58vh;border-radius:16px;border:3px solid var(--g);color:#fff;padding:20px;text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;
 background-color:var(--n);background-image:linear-gradient(rgba(255,255,255,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.07) 1px,transparent 1px);background-size:30px 30px}
.ls .he{font-size:clamp(54px,17vw,92px);color:#ffc700;font-weight:700;line-height:1.1}
.ls .hs{font-size:clamp(36px,11vw,58px)}
.ls .rom{font-size:22px;font-weight:700}.ls .en{font-size:19px;opacity:.9}.ls .nt{font-size:15px;opacity:.8;max-width:30em}
.ls h2{margin:0;color:#fff;font-size:26px}.ls p{margin:0}
.ls .bar{display:flex;gap:10px;margin:14px 0 18px;justify-content:center}
.ls .bar button,.ls .btn{font:inherit;font-weight:800;font-size:18px;min-height:48px;border-radius:12px;border:2px solid var(--g);background:var(--n);color:#fff;padding:8px 16px;cursor:pointer}
.ls .bar .go,.ls .btn.go{background:var(--g);color:#1a1400;flex:1;max-width:260px}
.ls .row{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}
.ls .btn[aria-pressed=true]{background:var(--g);color:#1a1400}
.ls .opt{display:block;width:100%;text-align:left}
.ls .opt.ok{background:#2e8b57;border-color:#2e8b57}.ls .opt.no{background:#a21c3c;border-color:#a21c3c}
.ls .line{width:100%;text-align:left;padding:10px 12px;border-radius:12px;background:rgba(255,255,255,.1)}
.ls .line.tr{background:rgba(248,186,47,.18)}.ls .line .tl{display:block;color:#fff;font-size:17px;margin:2px 0 4px}.ls .line .en{opacity:.8;font-size:15px}.ls .line .hh{font-size:26px;color:#ffc700;direction:rtl;text-align:right;display:block}
.ls .flip{perspective:900px;width:100%}.ls .fl{min-height:34vh;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px}
.ls small.ph{opacity:.7;font-size:13px}
@media (display-mode:standalone){header.top,footer,.adslot,aside,.sidebar,.newsaside{display:none!important}.hx,.ls{padding-top:env(safe-area-inset-top)}}
.ls .inst{font-size:14px;opacity:.9;max-width:26em}
@media(max-width:700px),(display-mode:standalone){.ls.full{position:fixed;top:0;left:0;right:0;bottom:0;z-index:50;background:#e8ecf5;overflow-y:auto;padding:calc(10px + env(safe-area-inset-top)) 12px calc(24px + env(safe-area-inset-bottom));max-width:none;margin:0}.ls.full{display:flex;flex-direction:column;height:100vh;height:100dvh;bottom:auto;box-sizing:border-box;overflow:hidden}.ls.full h1{display:none}.ls.full #app{flex:1 1 auto;min-height:0;display:flex;flex-direction:column}.ls.full #app>*{flex:none}.ls.full #app>.panel{flex:1 1 auto;min-height:0;overflow-y:auto;justify-content:safe center;padding:12px 14px}.ls.full #app>.bar{flex:none;margin:8px 0 0;padding-bottom:2px}.ls.full>p.small,.ls.full>noscript{display:none}.ls.full .em{font-size:clamp(30px,6vh,60px)}.ls.full .he{font-size:clamp(40px,9vh,92px)}.ls.full .scn{max-height:20vh;object-fit:cover}.ls.full h1{font-size:15px}.ls .chip{text-decoration:none}}
.ls .btn.big{min-height:58px;font-size:20px;min-width:150px;padding:10px 22px}.ls .bar button{min-height:56px}.ls .bar #bk{min-width:70px;font-size:22px}.ls .bar .go{font-size:20px;box-shadow:0 3px 0 #b8900a}.ls .ic{vertical-align:-4px;flex:none}.ls .bar button,.ls .btn{display:inline-flex;align-items:center;justify-content:center;gap:6px}.ls .bar #bk{background:#fff;color:#0a2566;border-color:#0a2566;min-width:64px;padding:8px 14px}
@media(min-width:701px) and (not (display-mode:standalone)){.ls{padding-bottom:0}.ls h1{display:none}.ls #app{display:flex;flex-wrap:wrap;align-items:center;gap:6px}.ls #app>.row:first-child{display:contents}.ls #app>.row:first-child>.small{display:none}.ls #allb{order:0}.ls #chips{order:1;margin:0}.ls #app>.row:first-child>a.chip{order:2;margin-left:auto}.ls #pick{order:3;width:100%}.ls .prog{order:4;width:100%}.ls .panel{order:5;width:100%;box-sizing:border-box}.ls .bar{order:6;width:100%}.ls .row{margin:0!important}.ls .chips{margin:2px 0}.ls .prog{margin:4px 0 6px}.ls .panel{height:calc(100vh - 330px);min-height:270px;max-height:640px;overflow-y:auto;justify-content:safe center;padding:6px 14px;gap:.8vh}.ls .scn{max-height:15vh;object-fit:cover}.ls .em{font-size:clamp(22px,4.2vh,40px)}.ls .he{font-size:clamp(30px,6.8vh,64px)}.ls .rom{font-size:clamp(17px,2.8vh,22px)}.ls .en{font-size:clamp(15px,2.5vh,19px)}.ls h2{font-size:clamp(20px,3.6vh,26px)}.ls .fl{min-height:0}.ls .bar{margin:6px 0 4px}.ls .bar button,.ls .btn.big{min-height:clamp(38px,6vh,50px)}.ls .btn{min-height:clamp(34px,5vh,44px);padding:2px 14px}.ls .nt{font-size:14px}}
.ls .wh{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%}.ls .wh h2{font-size:clamp(17px,3vh,24px);text-align:left}.ls .wh .btn{min-height:40px!important;padding:2px 12px!important;font-size:16px;min-width:0}#wd .wide{grid-column:1/-1;display:flex;flex-direction:row-reverse;justify-content:space-between;align-items:center;gap:8px;padding:2px 8px!important}#wd .wide .hh{font-size:clamp(14px,2.4vh,18px)!important;text-align:right!important}#wd .wide .tl{font-size:clamp(10px,1.6vh,12px)!important;text-align:left;flex:1}#wd{display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;width:100%}.ls .wrd{padding:2px 4px;cursor:pointer;text-align:center!important}.ls .wrd .hh{font-size:clamp(16px,2.9vh,22px);text-align:center;line-height:1.15}.ls .wrd .tl{display:block;font-size:clamp(11px,1.8vh,14px);margin:0;opacity:.9}
aside.newsside>:not(#vocab){display:none!important}aside.newsside #vocab h2{margin:8px 0 2px}aside.newsside .vs{margin:0 0 8px;font-size:.85rem;color:#fff;opacity:.8}aside.newsside{max-height:calc(100vh - 24px);overflow-y:auto}.vw{display:flex;width:100%;justify-content:space-between;align-items:center;gap:10px;margin:0 0 6px;padding:8px 10px;border:2px solid #f8ba2f;border-radius:10px;background:#0a2566;color:#fff;font:inherit;cursor:pointer;text-align:left}.vw .vh{font-size:22px;color:#ffc700;order:2;text-align:right}.vw .vt{font-size:13px;opacity:.9;order:1}.vw .vt b{font-size:14px;color:#fff}
.ls .vn{font-size:13px;line-height:1.35;padding:8px 10px;margin-top:8px;border-radius:10px;background:#fff3cd;color:#5a4300;border:1px solid #f8ba2f}.ls .scn{width:100%;border-radius:12px;border:2px solid var(--g);display:block}
.ls .chips{display:flex;gap:6px;margin:4px 0}.ls .chip{font:inherit;font-weight:700;font-size:14px;border-radius:999px;border:2px solid var(--g);background:var(--n);color:#fff;padding:5px 12px;cursor:pointer}.ls .chip[aria-pressed=true]{background:var(--g);color:#1a1400}.ls [hidden]{display:none!important}.ls .pick{display:grid;gap:6px;margin:6px 0 10px}.ls .pk{display:block;padding:10px 12px;border-radius:10px;background:var(--n);color:#fff!important;text-decoration:none;border:2px solid transparent}.ls .pk.on{border-color:var(--g)}.ls .pk b{color:var(--g);margin-right:6px}
.ls .brand{font-size:13px;letter-spacing:.18em;text-transform:uppercase;color:var(--g);font-weight:800}.ls .big{font-size:clamp(30px,9vw,44px);font-weight:800;line-height:1.1;color:#fff}.ls .em{font-size:60px;line-height:1}.ls .lnk{background:none;border:0;color:var(--g);text-decoration:underline;font:inherit;font-size:15px;cursor:pointer}.ls .line.on{outline:3px solid var(--g)}.ls{--sp:16px}.ls .panel{gap:var(--sp);padding:26px 20px}
</style>"""

PWA_HEAD = ('<link rel="manifest" href="/hebrew/travel/manifest.webmanifest"><meta name="theme-color" content="#0a2566">'
 '<meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="Easy Hebrew">'
 '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><link rel="apple-touch-icon" href="/hebrew/travel/icons/apple-touch-icon.png">')
SW_REG = "<script>['gesturestart','gesturechange','gestureend'].forEach(function(t){document.addEventListener(t,function(e){e.preventDefault()})});document.addEventListener('touchmove',function(e){if(e.touches.length>1)e.preventDefault()},{passive:false});if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/hebrew/travel/sw.js',{scope:'/hebrew/travel/'}).catch(function(){})})}</script>"
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
    wr('hebrew/travel/index.html', page('Easy Hebrew for Travelers', 'Ten short mobile lessons of conversational Hebrew for beaches, restaurants, hotels and nights out.', 'https://israelnowlej.com/hebrew/travel/', body + SW_REG, CSS + PWA_HEAD))

JS = r"""<script>(function(){var ALL=__ALL__,L=__DATA__,NEXT=__NEXT__,$=function(x){return document.getElementById(x)},app=$('app');
var G=null;try{G=localStorage.getItem('hg')}catch(e){}var SHOWH=true,TO='m',S=[],i=0,score=0,answered=false;
function pk(o,k){return(G=='f'&&o['t_f'])?o[k=='t'?'t_f':'r_f']:o[k]}
function sh(a){a=a.slice();for(var k=a.length-1;k>0;k--){var j=Math.floor(Math.random()*(k+1)),t=a[k];a[k]=a[j];a[j]=t}return a}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;')}
function hvs(){try{return speechSynthesis.getVoices().filter(function(v){return /^(he|iw)/i.test(v.lang)})}catch(e){return[]}}
function fx(t){t=t.replace(/\u05ea\u05e2\u05dc\u05d4/g,'\u05ea\u05bc\u05b7\u05e2\u05b2\u05dc\u05b6\u05d4');t=t.replace(/\u05d4\u05d5\u05d5\u05d9\u05d9 \u05e4\u05d9\u05d9/g,'\u05d4\u05d5\u05d5\u05d0\u05d9 \u05e4\u05d0\u05d9');return t.replace(/(^|\u05de\u05d4 |\u05de\u05d0\u05d9\u05e4\u05d4 )\u05d0\u05ea(?=[ ?.!,]|$)/g,'$1\u05d0\u05b7\u05ea\u05bc')}
function mk(t,r,p,v){var u=new SpeechSynthesisUtterance(fx(t));u.lang='he-IL';u.rate=r;u.pitch=p;if(!v){var h=hvs();if(h.length)v=h[0]}if(v)u.voice=v;return u}
function canSay(){try{var a=speechSynthesis.getVoices().length;if(a>0&&hvs().length==0){vnote();return false}return true}catch(e){return false}}
function go(f){var b=false;try{b=speechSynthesis.speaking||speechSynthesis.pending;speechSynthesis.cancel()}catch(e){}if(b)setTimeout(f,80);else f()}
function vnote(){var n=document.getElementById('vn');try{var all=speechSynthesis.getVoices().length,no=all>0&&hvs().length==0}catch(e){var no=true}if(!no){if(n)n.remove();return}if(!n){n=document.createElement('div');n.id='vn';n.className='vn';n.innerHTML='<b>No Hebrew voice found on this device.</b> iPhone: Settings, Accessibility, Spoken Content, Voices, Hebrew, then download Carmit. Android: Settings, Text-to-speech, install Hebrew. Then reload.';var b=document.getElementById('bar');if(b)b.parentNode.insertBefore(n,b)}}
try{speechSynthesis.onvoiceschanged=vnote}catch(e){}
function qparts(t){var m=t.replace(/\s*\?\s*$/,'');var k=m.lastIndexOf(' ');return null}
function sayq(t,r,p,v,onst){var q=qparts(t),out=[];if(q){var a=mk(q[0],r,p,v),b=mk(q[1],r*.9,p+.25,v);if(onst)a.onstart=onst;out=[a,b]}else{var c=mk(t,r,p,v);if(onst)c.onstart=onst;out=[c]}out.forEach(function(u){speechSynthesis.speak(u)})}
function say(t){try{if(!canSay())return;go(function(){sayq(t,.85,1)})}catch(e){}}
function ptext(p){var f=(p.gender=='listener')?(TO=='f'&&p.t_f):(p.gender=='speaker'&&G=='f'&&p.t_f);return f?[p.t_f,p.r_f]:[p.t,p.r]}
var PI='<svg class="ic" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M7 4.5v15l12-7.5z"/></svg>';
function vocab(){var as=document.querySelector('aside.newsside');if(!as)return;var v=document.getElementById('vocab');if(!v){Array.prototype.forEach.call(as.children,function(c){c.style.display='none'});v=document.createElement('div');v.id='vocab';as.appendChild(v)}var h='<h2>Vocabulary</h2><p class="vs">Lesson '+L.n+'. Tap a word to hear it.</p>';L.phrases.forEach(function(p,k){var tx=ptext(p);h+='<button class="vw" data-k="'+k+'"><span class="vh" lang="he" dir="rtl">'+tx[0]+'</span><span class="vt"><b>'+esc(tx[1])+'</b><br>'+esc(p.en)+'</span></button>'});v.innerHTML=h;v.querySelectorAll('.vw').forEach(function(b){b.onclick=function(){say(ptext(L.phrases[+b.getAttribute('data-k')])[0],0)}})}
function build(){S=[{k:'title'},{k:'who'},{k:'intro'}];L.phrases.forEach(function(p,x){S.push({k:'ph',p:p})});S.push({k:'wl'});S.push({k:'dlg'});S.push({k:'fci'});sh(L.phrases).slice(0,6).forEach(function(p){S.push({k:'fc',p:p})});S.push({k:'qi'});L.quiz.forEach(function(q){S.push({k:'q',q:q})});S.push({k:'done'})}
function secOf(k){return (k=='title'||k=='who'||k=='intro'||k=='ph')?'Learn':(k=='dlg'||k=='wl')?'Listen':(k=='fci'||k=='fc')?'Cards':(k=='qi'||k=='q'||k=='done')?'Quiz':''}
function chips(){var cur=secOf(S[i].k),h='';['Learn','Listen','Cards','Quiz'].forEach(function(n){var idx=S.findIndex(function(x){return secOf(x.k)==n});h+='<button class="chip" data-i="'+idx+'" aria-pressed="'+(cur==n)+'">'+n+'</button>'});$('chips').innerHTML=h;$('chips').querySelectorAll('.chip').forEach(function(c){c.onclick=function(){if(S[i].k=='who'&&!G)return;i=+c.getAttribute('data-i');render()}})}
function full(){var ls=document.querySelector('.ls'),f=i>0&&window.matchMedia('(max-width:700px),(display-mode:standalone)').matches;ls.classList.toggle('full',f);document.documentElement.style.overflow=f?'hidden':'';if(f){ls.scrollTop=0;return true}return false}
function ft(){if(full())return;var r=app.getBoundingClientRect();if(r.top<-2||r.top>40)window.scrollTo({top:r.top+(window.pageYOffset||0)-6,behavior:'auto'})}
var DP=null,SA=window.matchMedia('(display-mode:standalone)').matches||navigator.standalone;window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();DP=e;if(S[i]&&S[i].k=='title')render()});
function inst(){if(SA)return '';if(DP)return '<button class="btn" id="ib">Install the app</button>';if(/iphone|ipad/i.test(navigator.userAgent))return '<p class="inst">To install: tap Share, then Add to Home Screen. It then works offline.</p>';return ''}
function bar(h){$('bar').innerHTML=h}
function stopAudio(){try{speechSynthesis.cancel()}catch(e){}}
function render(){stopAudio();var s=S[i];$('pg').style.width=(i/(S.length-1)*100)+'%';var h='',b='';
var back=i>0?'<button id="bk" aria-label="Back"><svg class="ic" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round" d="M15 5l-7 7 7 7"/></svg></button>':'';var nx='<button class="go" id="nx">Next <svg class="ic" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg></button>';
if(s.k=='title'){h='<div class="brand">Israel NOWlej</div><div class="big">Easy Hebrew<br>for Travelers</div><p class="en">Lesson '+L.n+': '+esc(L.title)+'</p><p class="nt">About six minutes. Listen, say it, check it.</p>';b='<button class="go" id="nx">Start <svg class="ic" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg></button>'}
else if(s.k=='who'){h='<h2>Who is learning?</h2><p class="en">Hebrew changes for men and women. Pick yours.</p><div class="row"><button class="btn" id="gm" aria-pressed="'+(G=='m')+'">I am a man</button><button class="btn" id="gf" aria-pressed="'+(G=='f')+'">I am a woman</button></div>';b=G?nx:''}
else if(s.k=='intro'){h=(L.img?'<img class="scn" src="'+L.img+'" alt="">':'')+'<h2>Lesson '+L.n+': '+esc(L.title)+'</h2><p class="en">'+esc(L.goal)+'</p><p class="nt">'+esc(L.intro)+'</p>';b=back+nx}
else if(s.k=='ph'){var p=s.p,t=ptext(p);h=(p.img?'<div class="em">'+p.img+'</div>':'')+'<div class="he" lang="he" dir="rtl">'+t[0]+'</div><div class="rom">'+esc(t[1])+'</div><div class="en">'+esc(p.en)+'</div>'+(p.gender=='listener'?'<div class="row"><button class="btn" id="tm" aria-pressed="'+(TO=='m')+'">To a man</button><button class="btn" id="tf" aria-pressed="'+(TO=='f')+'">To a woman</button></div>':'')+'<div class="row"><button class="btn go big" id="pl"><svg class="ic" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M7 4.5v15l12-7.5z"/></svg> Play</button></div>'+(p.note?'<button class="lnk" id="nb">Good to know</button><p class="nt" id="nn" hidden>'+esc(p.note)+'</p>':'');b=back+nx}
else if(s.k=='dlgi'){h='<div class="em">&#127911;</div><h2>Listen to a real conversation</h2><p class="en">Press play and listen first.</p>';b=back+nx}
else if(s.k=='wl'){h='<div class="wh"><h2>Listen to the words</h2><button class="btn go" id="pw">'+PI+' Play all</button></div><div id="wd"></div>';b=back+nx}
else if(s.k=='dlg'){h='<button class="btn go big" id="pa"><svg class="ic" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M7 4.5v15l12-7.5z"/></svg> Play conversation</button><div style="width:100%" id="dl"></div><button class="lnk" id="tg">'+(SHOWH?'Hide Hebrew':'Show Hebrew')+'</button>';b=back+nx}
else if(s.k=='fci'){h='<h2>Flash cards</h2><p class="en">Read the Hebrew. Guess. Tap the card to check.</p>';b=back+nx}
else if(s.k=='fc'){var q=s.p,tt=ptext(q);h='<div class="fl" id="fl"><div class="he hs" lang="he" dir="rtl">'+tt[0]+'</div><small class="ph">Tap to flip</small></div>';s.f=0;b=back+nx}
else if(s.k=='qi'){h='<h2>Quiz time</h2><p class="en">Five questions. No pressure, just pride.</p>';score=0;b=back+nx}
else if(s.k=='q'){var q=s.q,o=sh([q.answer].concat(q.wrong));answered=false;h='<p class="en" style="font-size:22px;font-weight:800">'+esc(q.q)+'</p><div style="width:100%" id="op">'+o.map(function(x){return '<button class="btn opt" data-v="'+esc(x)+'">'+esc(x)+'</button>'}).join('<div style="height:8px"></div>')+'</div><p class="nt" id="wy"></p>';b=''}
else if(s.k=='done'){h='<h2>Lesson complete</h2><p class="en">Quiz score: '+score+' of '+L.quiz.length+'</p><p class="nt">'+esc(L.tip)+'</p><div class="row"><button class="btn go" id="pc">Save phrases to your photos</button></div><canvas id="cv" width="1080" height="1620" style="display:none"></canvas><div id="dlk"></div>'+(NEXT?'<a class="btn" href="'+NEXT+'">Next lesson</a>':'<a class="btn" href="/hebrew/travel/">All lessons</a>');b=back+'<button class="go" id="rs">Start again</button>'}
$('panel').innerHTML=h;bar(b);chips();wire(s);vocab();vnote();if(i>0)ft();else full()}
function wire(s){var g=function(x){return $(x)};
if(s.k=='wl'){var wd=g('wd');L.phrases.map(function(p,k){return {p:p,k:k,w:ptext(p)[1].length>11?1:0}}).sort(function(a,b){return a.w-b.w||a.k-b.k}).forEach(function(o){var p=o.p,k=o.k,tx=ptext(p),a=document.createElement('div');a.className='line wrd'+(tx[1].length>11?' wide':'');a.id='wl'+k;a.innerHTML='<span class="hh" lang="he">'+tx[0]+'</span><b class="tl">'+esc(tx[1])+'</b>';a.onclick=function(){document.querySelectorAll('.line.on').forEach(function(e){e.classList.remove('on')});a.classList.add('on');say(tx[0],0)};wd.appendChild(a)});function pw(){try{if(!canSay())return;go(function(){L.phrases.forEach(function(p,k){var tx=ptext(p);sayq(tx[0],.8,1,null,function(){document.querySelectorAll('.line.on').forEach(function(e){e.classList.remove('on')});var e=document.getElementById('wl'+k);if(e){e.classList.add('on');e.scrollIntoView({block:'nearest',behavior:'smooth'})}})})})}catch(e){}}g('pw').onclick=pw;pw()}
if(g('bk'))g('bk').onclick=function(){i--;render()};if(g('nx'))g('nx').onclick=function(){i++;render()};
if(s.k=='title'&&g('ib'))g('ib').onclick=function(){DP.prompt();DP=null;render()};
if(s.k=='who'){g('gm').onclick=function(){G='m';try{localStorage.setItem('hg','m')}catch(e){}render()};g('gf').onclick=function(){G='f';try{localStorage.setItem('hg','f')}catch(e){}render()}}
if(s.k=='ph'){var t=ptext(s.p);if(g('nb'))g('nb').onclick=function(){g('nn').hidden=false;g('nb').hidden=true};g('pl').onclick=function(){say(t[0],0)};say(t[0]);if(g('tm')){g('tm').onclick=function(){TO='m';render()};g('tf').onclick=function(){TO='f';render()}}}
if(s.k=='dlg'){var d=g('dl');function draw(){d.innerHTML='';L.dialogue.forEach(function(x,k){var a=document.createElement('div');a.className='line'+(x.who=='traveler'?' tr':'');a.id='ln'+k;a.innerHTML=(SHOWH?'<span class="hh" lang="he">'+pk(x,'t')+'</span><b class="tl">'+esc(pk(x,'r'))+'</b>':'')+'<div class="en">'+esc(x.en)+'</div>';a.onclick=function(){say(pk(x,'t'),0)};d.appendChild(a)})}
draw();g('tg').onclick=function(){SHOWH=!SHOWH;g('tg').textContent=SHOWH?'Hide Hebrew':'Show Hebrew';draw()};
function playConv(){try{if(!canSay())return;go(function(){var hv=speechSynthesis.getVoices().filter(function(v){return /^he/i.test(v.lang)});L.dialogue.forEach(function(x,k){sayq(pk(x,'t'),.8,x.who=='local'?1.3:.85,hv.length?hv[x.who=='local'?hv.length-1:0]:null,function(){document.querySelectorAll('.line.on').forEach(function(e){e.classList.remove('on')});var e=document.getElementById('ln'+k);if(e){e.classList.add('on');e.scrollIntoView({block:'center',behavior:'smooth'})}})})})}catch(e){}}g('pa').onclick=playConv;playConv()}
if(s.k=='fc'){var tt=ptext(s.p);g('fl').onclick=function(){s.f=!s.f;g('fl').innerHTML=s.f?'<div class="he hs" lang="he" dir="rtl">'+tt[0]+'</div><div class="en" style="font-size:28px;font-weight:800">'+esc(s.p.en)+'</div><div class="rom">'+esc(tt[1])+'</div><button class="btn go big" id="fp"><svg class="ic" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M7 4.5v15l12-7.5z"/></svg> Play</button>':'<div class="he hs" lang="he" dir="rtl">'+tt[0]+'</div><small class="ph">Tap to flip</small>';if(g('fp'))g('fp').onclick=function(e){e.stopPropagation();say(tt[0],0)}}}
if(s.k=='q'){var bs=document.querySelectorAll('#op .opt');bs.forEach(function(bt){bt.onclick=function(){if(answered)return;answered=true;var ok=bt.getAttribute('data-v')==s.q.answer;if(ok)score++;bs.forEach(function(x){if(x.getAttribute('data-v')==s.q.answer)x.classList.add('ok')});if(!ok)bt.classList.add('no');g('wy').textContent=(ok?'Correct. ':'Not quite. ')+s.q.why;bar('<button class="go" id="nx2">Next <svg class="ic" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg></button>');g('nx2').onclick=function(){i++;render()}}})}
if(s.k=='done'){g('rs').onclick=function(){i=1;render()};card();g('pc').onclick=saveCard}}
function card(){var c=$('cv'),x=c.getContext('2d');x.fillStyle='#0a2566';x.fillRect(0,0,1080,1620);x.strokeStyle='rgba(255,255,255,.08)';for(var k=0;k<1080;k+=36){x.beginPath();x.moveTo(k,0);x.lineTo(k,1620);x.stroke()}for(var k=0;k<1620;k+=36){x.beginPath();x.moveTo(0,k);x.lineTo(1080,k);x.stroke()}
x.strokeStyle='#f8ba2f';x.lineWidth=8;x.strokeRect(14,14,1052,1592);x.fillStyle='#fff';x.textAlign='center';x.font='bold 64px sans-serif';x.fillText(L.title,540,120);x.fillStyle='#f8ba2f';x.font='34px sans-serif';x.fillText('Easy Hebrew, lesson '+L.n,540,172);
var ps=L.phrases.slice(0,7),y=270;ps.forEach(function(p){var t=ptext(p);x.fillStyle='#ffc700';x.font='bold 72px sans-serif';x.direction='rtl';x.fillText(t[0],540,y);x.direction='ltr';x.fillStyle='#fff';x.font='bold 36px sans-serif';x.fillText(t[1],540,y+48);x.font='30px sans-serif';x.fillStyle='#cfd8f0';x.fillText(p.en,540,y+90);y+=190});
x.fillStyle='#f8ba2f';x.font='bold 44px sans-serif';x.fillText('Israel NOWlej',540,1560);x.fillStyle='#fff';x.font='30px sans-serif';x.fillText('israelnowlej.com/hebrew/travel/',540,1596);
CB=null;c.toBlob(function(b){CB=b},'image/png')}
var CB=null;function saveCard(){var nm='hebrew-lesson-'+L.n+'.png';function dl(){var a=document.createElement('a');a.href=$('cv').toDataURL('image/png');a.download=nm;document.body.appendChild(a);a.click();a.remove()}try{if(CB&&navigator.canShare){var f=new File([CB],nm,{type:'image/png'});if(navigator.canShare({files:[f]})){navigator.share({files:[f],title:'Easy Hebrew, lesson '+L.n}).catch(function(){});return}}}catch(e){}dl()}
build();app.innerHTML='<div class="row" style="justify-content:space-between;margin-bottom:6px"><button class="chip" id="allb">All 10 lessons <svg class="ic" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round" d="M5 9l7 7 7-7"/></svg></button><span class="small">Lesson '+L.n+' of '+ALL.length+'</span><a class="chip" href="/hebrew/travel/" aria-label="Exit lesson">&#10005;</a></div><div class="pick" id="pick" hidden>'+ALL.map(function(x){return '<a class="pk'+(x.n==L.n?' on':'')+'" href="/hebrew/travel/'+x.n+'/"><b>'+x.n+'</b> '+esc(x.t)+'</a>'}).join('')+'</div><div class="chips" id="chips"></div><div class="prog"><i id="pg"></i></div><div class="panel" id="panel"></div><div class="bar" id="bar"></div>';['pagehide','beforeunload'].forEach(function(t){window.addEventListener(t,stopAudio)});document.addEventListener('visibilitychange',function(){if(document.hidden)stopAudio()});window.addEventListener('blur',stopAudio);$('allb').onclick=function(){$('pick').hidden=!$('pick').hidden};render();ft();window.addEventListener('load',function(){setTimeout(ft,50)})})();</script>"""

def lesson(l):
    n = l['n']; nxt = f'/hebrew/travel/{n+1}/' if (n + 1) in LIVE else ''
    l = dict(l, img=(f'/hebrew/img/travel-{n}.jpg' if os.path.exists(os.path.join(ROOT, 'hebrew', 'img', f'travel-{n}.jpg')) else ''))
    js = JS.replace('__ALL__', json.dumps([{'n': x['n'], 't': x['title']} for x in C['lessons']], ensure_ascii=False)).replace('__DATA__', json.dumps(l, ensure_ascii=False)).replace('__NEXT__', json.dumps(nxt))
    body = f'<div class="hubslide ls"><h1 style="font-size:20px;margin:6px 0">Easy Hebrew for Travelers. Lesson {n}: {E(l["title"])}</h1><div id="app" class="app"></div><noscript><p>This lesson needs JavaScript.</p></noscript>{js}<p class="small"><a href="/hebrew/travel/">All lessons</a> &middot; <a href="/g/{l["wordplay"]}/">Related word</a></p></div>'
    wr(f'hebrew/travel/{n}/index.html', page(f'Easy Hebrew for Travelers, Lesson {n}: {l["title"]}', l['goal'], f'https://israelnowlej.com/hebrew/travel/{n}/', body + SW_REG, CSS + PWA_HEAD))

hub(); travel()
for l in C['lessons']:
    if l['n'] in LIVE: lesson(l)

# manifest and service worker
import hashlib
man = {"name": "Easy Hebrew for Travelers", "short_name": "Easy Hebrew", "description": "Ten short lessons of conversational Hebrew for your trip to Israel.",
       "start_url": "/hebrew/travel/?source=app", "scope": "/hebrew/travel/", "display": "standalone", "orientation": "portrait", "background_color": "#0a2566", "theme_color": "#0a2566",
       "icons": [{"src": "/hebrew/travel/icons/icon-192.png", "sizes": "192x192", "type": "image/png"}, {"src": "/hebrew/travel/icons/icon-512.png", "sizes": "512x512", "type": "image/png"},
                 {"src": "/hebrew/travel/icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"}]}
wr('hebrew/travel/manifest.webmanifest', json.dumps(man, indent=1))
pages = ['/hebrew/travel/'] + [f'/hebrew/travel/{x["n"]}/' for x in C['lessons'] if x['n'] in LIVE]
assets = set(['/hebrew/travel/manifest.webmanifest', '/hebrew/travel/icons/icon-192.png', '/hebrew/travel/icons/icon-512.png'])
h = hashlib.md5()
for u in pages:
    t = rd(u.strip('/') + '/index.html'); h.update(t.encode('utf-8'))
    for m in re.finditer(r'<link[^>]+href="(/[^"#]+)"[^>]*>|<script[^>]+src="(/[^"]+)"|<img[^>]+src="(/[^"]+)"', t):
        a = next(g for g in m.groups() if g)
        if re.search(r'\.(css|js|png|jpg|jpeg|svg|webp|ico|json|woff2?)(\?|$)', a): assets.add(a)
for x in C['lessons']:
    if os.path.exists(os.path.join(ROOT, 'hebrew', 'img', f'travel-{x["n"]}.jpg')): assets.add(f'/hebrew/img/travel-{x["n"]}.jpg')
ver = h.hexdigest()[:10]
SW = '''const V="eh-__V__",PRE=__PRE__;
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>Promise.all(PRE.map(u=>c.add(u).catch(()=>0)))).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith("eh-")&&x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{const r=e.request;if(r.method!=="GET")return;const u=new URL(r.url);if(u.origin!==location.origin)return;
if(r.mode==="navigate"){e.respondWith(fetch(r).then(x=>{const y=x.clone();caches.open(V).then(c=>c.put(r,y));return x}).catch(()=>caches.match(r,{ignoreSearch:true}).then(x=>x||caches.match("/hebrew/travel/"))));return}
e.respondWith(caches.match(r).then(x=>x||fetch(r).then(y=>{if(y.ok){const z=y.clone();caches.open(V).then(c=>c.put(r,z))}return y})))});
'''.replace('__V__', ver).replace('__PRE__', json.dumps(sorted(set(pages) | assets)))
wr('hebrew/travel/sw.js', SW)

# search.json and sitemap.xml
S = json.load(open(os.path.join(ROOT, 'search.json'), encoding='utf-8')); have = {r['u'] for r in S}
rows = [('Hebrew', '/hebrew/', 'Hebrew for travelers and the curious.'), ('Easy Hebrew for Travelers', '/hebrew/travel/', 'Ten short mobile lessons of conversational Hebrew.')] + [(f'Easy Hebrew for Travelers, Lesson {l["n"]}: {l["title"]}', f'/hebrew/travel/{l["n"]}/', l['goal']) for l in C['lessons'] if l['n'] in LIVE]
for t, u, x in rows:
    if u not in have: S.append({'t': t, 'u': u, 'k': 'GLOSSARY', 's': 'Hebrew', 'x': x})
json.dump(S, open(os.path.join(ROOT, 'search.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
M = rd('sitemap.xml'); add = ''.join(f'<url><loc>https://israelnowlej.com{u}</loc></url>\n' for _, u, _ in rows if f'<loc>https://israelnowlej.com{u}</loc>' not in M)
if add: wr('sitemap.xml', M.replace('</urlset>', add + '</urlset>'))
print('hebrew done')
