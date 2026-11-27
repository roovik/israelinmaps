# Executed by tools/hebrew.py after alphabet.py (shares globals). Builds /hebrew/numbers/ as an installable web app.
NJS = r"""<script>
(function(){
var $=function(i){return document.getElementById(i)};function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;')}
var say=function(t){if(window.heSay)heSay(t)};
function ic(){return '<svg class="ic" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M7 4.5v15l12-7.5z"/></svg>'}
// feminine (counting) and masculine forms: [spoken with vowels, plain, transliteration]
var FEM=[['אֶפֶס','אפס','efes'],['אַחַת','אחת','achat'],['שְׁתַּיִם','שתיים','shtayim'],['שָׁלוֹשׁ','שלוש','shalosh'],['אַרְבַּע','ארבע','arba'],['חָמֵשׁ','חמש','chamesh'],['שֵׁשׁ','שש','shesh'],['שֶׁבַע','שבע','sheva'],['שְׁמוֹנֶה','שמונה','shmone'],['תֵּשַׁע','תשע','tesha'],['עֶשֶׂר','עשר','eser']];
var MAS=[null,['אֶחָד','אחד','echad'],['שְׁנַיִם','שניים','shnayim'],['שְׁלוֹשָׁה','שלושה','shlosha'],['אַרְבָּעָה','ארבעה','arba’a'],['חֲמִשָּׁה','חמישה','chamisha'],['שִׁשָּׁה','שישה','shisha'],['שִׁבְעָה','שבעה','shiv’a'],['שְׁמוֹנָה','שמונה','shmona'],['תִּשְׁעָה','תשעה','tish’a'],['עֲשָׂרָה','עשרה','asara']];
var TEEN=[null,['אַחַת עֶשְׂרֵה','achat esre'],['שְׁתֵּים עֶשְׂרֵה','shteim esre'],['שְׁלוֹשׁ עֶשְׂרֵה','shlosh esre'],['אַרְבַּע עֶשְׂרֵה','arba esre'],['חֲמֵשׁ עֶשְׂרֵה','chamesh esre'],['שֵׁשׁ עֶשְׂרֵה','shesh esre'],['שְׁבַע עֶשְׂרֵה','shva esre'],['שְׁמוֹנֶה עֶשְׂרֵה','shmone esre'],['תְּשַׁע עֶשְׂרֵה','tsha esre']];
var TENS={2:['עֶשְׂרִים','esrim'],3:['שְׁלוֹשִׁים','shloshim'],4:['אַרְבָּעִים','arbaim'],5:['חֲמִשִּׁים','chamishim'],6:['שִׁשִּׁים','shishim'],7:['שִׁבְעִים','shivim'],8:['שְׁמוֹנִים','shmonim'],9:['תִּשְׁעִים','tishim']};
var HUN={1:['מֵאָה','mea'],2:['מָאתַיִם','matayim']};
function f(n){return FEM[n]}
// number 0..999 -> [spoken, translit]
function nw(n){
 if(n<=10)return [FEM[n][0],FEM[n][2]];
 if(n<20)return [TEEN[n-10][0],TEEN[n-10][1]];
 if(n<100){var t=Math.floor(n/10),u=n%10;if(!u)return TENS[t].slice();return [TENS[t][0]+' וְ'+FEM[u][0],TENS[t][1]+' ve-'+FEM[u][2]]}
 if(n<1000){var h=Math.floor(n/100),r=n%100,hw=h<3?HUN[h]:[FEM[h][0]+' מֵאוֹת',FEM[h][2]+' meot'];if(!r)return hw.slice();var rw=nw(r);return [hw[0]+' וְ'+rw[0],hw[1]+' ve-'+rw[1]]}
 return ['אֶלֶף','elef']}
var tab='c';
function tabs(){var T=[['c','Count'],['t','Tens'],['m','Money'],['k','Clock'],['q','Quiz']];$('ntabs').innerHTML=T.map(function(x){return '<button class="ct'+(x[0]==tab?' on':'')+'" data-t="'+x[0]+'">'+x[1]+'</button>'}).join('');
 document.querySelectorAll('.ct').forEach(function(b){b.onclick=function(){tab=b.getAttribute('data-t');draw()}})}
function row(num,he,tr,sp){return '<button class="nr" data-s="'+esc(sp)+'"><span class="nn">'+num+'</span><span class="nh" lang="he" dir="rtl">'+he+'</span><span class="nt">'+esc(tr)+'</span><span class="np">'+ic()+'</span></button>'}
function bind(){document.querySelectorAll('.nr').forEach(function(b){b.onclick=function(){say(b.getAttribute('data-s'))}})}
function count(){var h='<h2>Counting 0 to 10</h2><div class="nhd"><span>Counting, phones, time</span><span>Counting things</span></div><div class="ncount">';
 for(var i=0;i<=10;i++){var m=MAS[i];h+='<div class="nc2"><span class="nn">'+i+'</span><button class="nr half" data-s="'+FEM[i][0]+'"><span class="nh" lang="he" dir="rtl">'+FEM[i][1]+'</span><span class="nt">'+FEM[i][2]+'</span></button>'+(m?'<button class="nr half" data-s="'+m[0]+'"><span class="nh" lang="he" dir="rtl">'+m[1]+'</span><span class="nt">'+m[2]+'</span></button>':'<span class="nr half off">.</span>')+'</div>'}
 h+='</div><p class="asm">Use the left column for phone numbers, the time and plain counting. Use the right column when the thing you count is masculine, like shekels: shlosha shekalim. When in doubt, the left column is the safe choice.</p>';
 $('nbody').innerHTML=h;bind()}
function tens(){var h='<h2>11 to 19</h2><div class="nlist">';for(var i=11;i<=19;i++){var w=nw(i);h+=row(i,w[0].replace(/[֑-ׇ]/g,''),w[1],w[0])}
 h+='</div><h2>Tens and hundreds</h2><div class="nlist">';[20,30,40,50,60,70,80,90,100,200,1000].forEach(function(i){var w=nw(i);h+=row(i,w[0].replace(/[֑-ׇ]/g,''),w[1],w[0])});
 h+='</div><h2>Put them together</h2><p class="asm" style="margin:0 0 6px">Tens first, then ve (and) and the units: 25 is esrim ve-chamesh.</p><div class="nlist">';[21,35,48,67,99,125].forEach(function(i){var w=nw(i);h+=row(i,w[0].replace(/[֑-ׇ]/g,''),w[1],w[0])});
 h+='</div><h2>Say any number</h2><div class="nany"><input id="ni" type="number" inputmode="numeric" min="0" max="999" placeholder="0 to 999"><button class="btn go" id="ng">'+ic()+' Say it</button></div><div id="nout"></div>';
 $('nbody').innerHTML=h;bind();
 $('ng').onclick=function(){var n=Math.max(0,Math.min(999,parseInt($('ni').value||'0',10)));var w=nw(n);$('nout').innerHTML='<div class="nlist">'+row(n,w[0].replace(/[֑-ׇ]/g,''),w[1],w[0])+'</div>';bind();say(w[0])}}
function money(){var P=[5,10,12,15,20,25,35,50,80,100,150];var h='<h2>How much?</h2><div class="nlist">'+row('','כמה זה עולה?','kama ze oleh?','כַּמָּה זֶה עוֹלֶה')+row('','כמה זה עולה לי?','kama ze oleh li?','כַּמָּה זֶה עוֹלֶה לִי')+'</div>';
 h+='<h2>Prices</h2><p class="asm" style="margin:0 0 6px">In a shop people usually skip the word shekel. Twenty-five is just esrim ve-chamesh.</p><div class="nlist">';
 P.forEach(function(p){var w=nw(p);h+=row('₪'+p,w[0].replace(/[֑-ׇ]/g,''),w[1],w[0])});
 h+='</div><h2>The words</h2><div class="nlist">'+row('','שקל','shekel (one)','שֶׁקֶל')+row('','שקלים','shekalim (shekels)','שְׁקָלִים')+row('','אגורות','agorot (cents)','אֲגוֹרוֹת')+row('','עודף','odef (change)','עוֹדֶף')+row('','קבלה','kabalah (receipt)','קַבָּלָה')+'</div>';
 $('nbody').innerHTML=h;bind()}
var HW=['','אַחַת','שְׁתַּיִם','שָׁלוֹשׁ','אַרְבַּע','חָמֵשׁ','שֵׁשׁ','שֶׁבַע','שְׁמוֹנֶה','תֵּשַׁע','עֶשֶׂר','אַחַת עֶשְׂרֵה','שְׁתֵּים עֶשְׂרֵה'];
var HT=['','achat','shtayim','shalosh','arba','chamesh','shesh','sheva','shmone','tesha','eser','achat esre','shteim esre'];
function tw(h,m){var nx=h%12+1;if(m==0)return ['הַשָּׁעָה '+HW[h],'ha-shaa '+HT[h]];if(m==15)return [HW[h]+' וָרֶבַע',HT[h]+' va-reva'];if(m==30)return [HW[h]+' וָחֵצִי',HT[h]+' va-chetsi'];return ['רֶבַע לְ'+HW[nx],'reva le-'+HT[nx]]}
function tm(h,m){return h+':'+(m==45?'45':(m<10?'0'+m:m))}
function phone(){var d='05'+Math.floor(Math.random()*6+0);for(var i=0;i<7;i++)d+=Math.floor(Math.random()*10);return d}
var ph=phone();
function clock(){var h='<h2>What time is it?</h2><div class="nlist">'+row('','מה השעה?','ma ha-shaa?','מָה הַשָּׁעָה')+row('','באיזו שעה?','be-eizo shaa? (at what time?)','בְּאֵיזוֹ שָׁעָה')+'</div><h2>Say the time</h2><div class="nlist">';
 [[3,0],[3,15],[3,30],[2,45],[8,0],[10,30],[12,15]].forEach(function(x){var w=tw(x[0],x[1]);h+=row(tm(x[0],x[1]),w[0].replace(/[֑-ׇ]/g,''),w[1],w[0])});
 h+='</div><p class="asm">The hour uses the counting form: shalosh, not shlosha. For 2:45 you say a quarter to three.</p><h2>Phone numbers</h2><p class="asm" style="margin:0 0 6px">Israelis read them one digit at a time. Tap to hear it, then try another.</p><div id="pn"></div>';
 $('nbody').innerHTML=h;bind();showph()}
function showph(){var ds=ph.split('').map(function(c){return +c});var he=ds.map(function(n){return FEM[n][1]}).join(' ');var tr=ds.map(function(n){return FEM[n][2]}).join(' ');var sp=ds.map(function(n){return FEM[n][0]}).join(', ');
 $('pn').innerHTML='<div class="nphone"><div class="nbig">'+ph.slice(0,3)+'-'+ph.slice(3,6)+'-'+ph.slice(6)+'</div><div class="nh" lang="he" dir="rtl" style="font-size:20px">'+he+'</div><div class="nt" style="white-space:normal">'+esc(tr)+'</div><div class="arow"><button class="btn go" id="pp">'+ic()+' Hear it</button><button class="btn" id="pq">New number</button></div></div>';
 $('pp').onclick=function(){say(sp)};$('pq').onclick=function(){ph=phone();showph();say(ph.split('').map(function(c){return FEM[+c][0]}).join(', '))}}
var Q=[],qi=0,sc=0,ans=false;function shuf(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t}return a}
function ri(a,b){return a+Math.floor(Math.random()*(b-a+1))}
function newQ(){Q=[];
 for(var i=0;i<4;i++){var n=ri(1,99),w=nw(n),o=[n];while(o.length<3){var x=n+ri(-12,12);if(x>0&&x<100&&o.indexOf(x)<0)o.push(x);if(Math.random()<.3){var sw=(n%10)*10+Math.floor(n/10);if(sw>0&&sw!=n&&o.indexOf(sw)<0&&o.length<3)o.push(sw)}}Q.push({s:w[0],a:String(n),o:shuf(o).map(String),p:'Which number is this?'})}
 for(var j=0;j<3;j++){var p=[5,10,15,20,25,30,35,40,45,50,60,75,80,90,100,120,150][ri(0,16)],w2=nw(p),o2=[p];while(o2.length<3){var y=p+[-10,-5,5,10,15,-15,20][ri(0,6)];if(y>0&&o2.indexOf(y)<0)o2.push(y)}Q.push({s:w2[0]+' שְׁקָלִים',a:'₪'+p,o:shuf(o2).map(function(v){return '₪'+v}),p:'How much is it?'})}
 for(var k=0;k<3;k++){var h=ri(1,12),m=[0,15,30,45][ri(0,3)],w3=tw(h,m),o3=[tm(h,m)];while(o3.length<3){var h2=ri(1,12),m2=[0,15,30,45][ri(0,3)],t2=tm(h2,m2);if(o3.indexOf(t2)<0)o3.push(t2)}Q.push({s:w3[0],a:tm(h,m),o:shuf(o3),p:'What time is it?'})}
 Q=shuf(Q);qi=0;sc=0}
function quiz(){if(!Q.length)newQ();if(qi>=Q.length){$('nbody').innerHTML='<div class="asgn"><h2>Done</h2><p class="asd">You scored '+sc+' of '+Q.length+'.</p><button class="btn go big" id="qr">Try again</button></div>';$('qr').onclick=function(){newQ();quiz()};return}
 var q=Q[qi];$('nbody').innerHTML='<p class="asm">Question '+(qi+1)+' of '+Q.length+'</p><div class="asgn"><p class="asd">'+q.p+'</p><button class="btn go big" id="qp">'+ic()+' Hear it</button></div><div class="aopts">'+q.o.map(function(o){return '<button class="ao" data-v="'+esc(o)+'">'+esc(o)+'</button>'}).join('')+'</div><div id="qf" class="asm"></div><div class="arow"><button class="btn go" id="qn" hidden>Next</button></div>';
 ans=false;$('qp').onclick=function(){say(q.s)};say(q.s);
 document.querySelectorAll('.ao').forEach(function(b){b.onclick=function(){if(ans)return;ans=true;var ok=b.getAttribute('data-v')==q.a;if(ok)sc++;document.querySelectorAll('.ao').forEach(function(x){if(x.getAttribute('data-v')==q.a)x.classList.add('ok')});if(!ok)b.classList.add('no');$('qf').textContent=ok?'Correct.':'Not quite.';$('qn').hidden=false;$('qn').onclick=function(){qi++;quiz()}}})}
function draw(){tabs();if(tab=='c')count();else if(tab=='t')tens();else if(tab=='m')money();else if(tab=='k')clock();else quiz()}
draw()})();
</script>"""
NCSS = """<style>
.ab .nhd{display:grid;grid-template-columns:34px 1fr 1fr;gap:6px;font-size:11px;opacity:.85;margin:0 0 4px}.ab .nhd span:first-child{grid-column:2}
.ab .nc2{display:grid;grid-template-columns:34px 1fr 1fr;gap:6px;align-items:center;margin-bottom:5px}
.ab .nn{color:#fff;font-weight:800;font-size:16px;min-width:34px;text-align:center}
.ab .nr{display:flex;align-items:center;gap:10px;width:100%;padding:7px 10px;border:2px solid transparent;border-radius:10px;background:rgba(255,255,255,.1);color:#fff;font-family:inherit;cursor:pointer;text-align:left}
.ab .nr.half{flex-direction:column;gap:0;padding:5px 4px;text-align:center}.ab .nr.off{visibility:hidden}.ab .nr:active{border-color:#ffc700}
.ab .nh{color:#ffc700;font-size:22px;font-weight:700;flex:1;text-align:right}.ab .nr.half .nh{text-align:center;flex:none}.ab .nt{font-size:13px;opacity:.9}.ab .nr:not(.half) .nt{flex:1.2}
.ab .np{display:inline-flex;color:#ffc700}.ab .nlist{display:grid;gap:5px;margin-bottom:6px}.ab .nlist .nn{min-width:44px}
.ab .nany{display:flex;gap:8px;align-items:center}.ab .nany input{flex:1;padding:9px 10px;border-radius:10px;border:2px solid #f8ba2f;background:#fff;color:#0a2566;font-size:16px;font-weight:700}
.ab .nphone{text-align:center;background:rgba(255,255,255,.08);border-radius:10px;padding:10px}.ab .nbig{color:#ffc700;font-size:30px;font-weight:800;letter-spacing:1px;direction:ltr}
.ab .btn:not(.go){background:#fff;box-shadow:0 3px 0 #9aa4bf}
</style>"""
def numbers_app():
    body = ('<div class="hubslide ab"><h1>Hebrew Numbers</h1><p class="lead">Count, pay and tell the time. Tap any number to hear it.</p>'
            '<div class="ctabs" id="ntabs"></div><div id="nbody"></div><noscript><p>The numbers module needs JavaScript.</p></noscript>'
            + NJS + '<script src="/hebrew/say.js" defer></script><p class="small"><a href="/hebrew/">All Hebrew</a></p></div>' + AB_REG.replace('/hebrew/alphabet/', '/hebrew/numbers/'))
    css = CSS + ABCSS + ABFULL + NCSS
    pwa = AB_PWA.replace('/hebrew/alphabet/', '/hebrew/numbers/').replace('Aleph-Taf', 'Hebrew Numbers')
    wr('hebrew/numbers/index.html', page('Hebrew Numbers: counting, prices, time and phone numbers', 'Learn Hebrew numbers for travelers: counting with gender, prices, telling the time and phone numbers. Installs as an app on your phone.', 'https://israelnowlej.com/hebrew/numbers/', body, css + pwa))
    man = {"name": "Hebrew Numbers", "short_name": "Numbers", "description": "Count, pay and tell the time in Hebrew.", "lang": "en", "dir": "ltr",
           "start_url": "/hebrew/numbers/?source=app", "scope": "/hebrew/numbers/", "display": "standalone", "orientation": "portrait", "background_color": "#0a2566", "theme_color": "#0a2566",
           "icons": [{"src": "/hebrew/numbers/icons/icon-192.png", "sizes": "192x192", "type": "image/png"}, {"src": "/hebrew/numbers/icons/icon-512.png", "sizes": "512x512", "type": "image/png"},
                     {"src": "/hebrew/numbers/icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"}]}
    wr('hebrew/numbers/manifest.webmanifest', json.dumps(man, indent=1))
    pg = rd('hebrew/numbers/index.html'); ver = hashlib.md5(pg.encode('utf-8')).hexdigest()[:10]
    assets = {'/hebrew/say.js', '/hebrew/numbers/manifest.webmanifest', '/hebrew/numbers/icons/icon-192.png', '/hebrew/numbers/icons/icon-512.png', '/hebrew/numbers/icons/apple-touch-icon.png'}
    for m in re.finditer(r'<link[^>]+href="(/[^"#]+)"[^>]*>|<script[^>]+src="(/[^"]+)"|<img[^>]+src="(/[^"]+)"', pg):
        a = next(g for g in m.groups() if g)
        if re.search(r'\.(css|js|png|jpg|jpeg|svg|webp|ico|json|woff2?)(\?|$)', a): assets.add(a)
    sw = rd('hebrew/alphabet/sw.js')
    sw = re.sub(r'const V="ea-[0-9a-f]+",PRE=\[.*?\];', 'const V="en-' + ver + '",PRE=' + json.dumps(sorted({'/hebrew/numbers/'} | assets)) + ';', sw, 1, flags=re.S)
    sw = sw.replace('startsWith("ea-")', 'startsWith("en-")').replace('/hebrew/alphabet/', '/hebrew/numbers/')
    wr('hebrew/numbers/sw.js', sw)
numbers_app()
