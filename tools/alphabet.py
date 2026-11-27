# Executed by tools/hebrew.py (shares its globals: page, CSS, wr, E, json). Builds /hebrew/alphabet/.
LET = [
 ("א","alef","silent, or a light 'a' at the start of a word","אבא","aba","dad","אָ"),
 ("ב","bet","b as in boy","בית","bayit","house","בָּ",["vet","v as in van","בָ","שבת","Shabbat","Sabbath","ב"]),
 ("ג","gimel","g as in go","גמל","gamal","camel","גָּ"),
 ("ד","dalet","d as in dog","דג","dag","fish","דָּ"),
 ("ה","heh","h as in hat. Often silent at the end of a word","הר","har","mountain","הָ"),
 ("ו","vav","v as in van","ורד","vered","rose","וָ"),
 ("ז","zayin","z as in zoo","זית","zayit","olive","זָ"),
 ("ח","chet","a rough throat sound, like ch in Bach","חלב","chalav","milk","חָ"),
 ("ט","tet","t as in top","טוב","tov","good","טָ"),
 ("י","yod","y as in yes","יום","yom","day","יָ"),
 ("כ","kaf","k as in key","כסף","kesef","money","כָּ",["chaf","a rough throat sound, like ch in Bach","כָ","אוכל","ochel","food, eats","כ"]),
 ("ל","lamed","l as in love","לחם","lechem","bread","לָ"),
 ("מ","mem","m as in mom","מים","mayim","water","מָ"),
 ("נ","nun","n as in no","נעים","naim","nice","נָ"),
 ("ס","samech","s as in sun","סלט","salat","salad","סָ"),
 ("ע","ayin","a soft throat sound. Most Israelis say it like alef","עיר","ir","city","עָ"),
 ("פ","pe","p as in pen","פלפל","pilpel","pepper","פָּ",["fe","f as in fun","פָ","ספר","sefer","book","פ"]),
 ("צ","tsadi","ts as in cats","צהוב","tzahov","yellow","צָ"),
 ("ק","kuf","k as in key, the same sound as kaf","קפה","kafeh","coffee","קָ"),
 ("ר","resh","a gargled r, from the back of the throat","רחוב","rechov","street","רָ"),
 ("ש","shin","sh as in shop","שלום","shalom","hello, peace","שָׁ"),
 ("ת","tav","t as in top, the same sound as tet","תודה","todah","thank you","תָּ"),
]
FIN = [("כ","ך"),("מ","ם"),("נ","ן"),("פ","ף"),("צ","ץ")]
FEX = {"כ":("מלך","melech","king"),"מ":("שלום","shalom","hello, peace"),"נ":("גן","gan","garden"),"פ":("סוף","sof","end"),"צ":("ארץ","eretz","land")}
SIGNS = [("שירותים","sherutim","toilets"),("מלון","malon","hotel"),("יציאה","yetziah","exit"),("כניסה","knisah","entrance"),
         ("פתוח","patuach","open"),("סגור","sagur","closed"),("דחוף","dachuf","push"),("משוך","mashoch","pull"),
         ("תחנה","tachanah","station"),("חוף","chof","beach")]
PAIRS = [("ד","ר","dalet has a sharp corner, resh is round"),("ב","כ","bet has a flat base, kaf is curved"),
         ("ה","ח","heh has a gap on the left, chet is joined"),("ו","ז","vav is a plain stick, zayin has a hat"),
         ("נ","ג","nun has a flat foot, gimel is a runner"),("ם","ס","final mem has corners, samech is round")]
DOT = [("בּ","ב","בָּ","בָ","bet","vet","b","v"),("כּ","כ","כָּ","כָ","kaf","chaf","k","ch"),("פּ","פ","פָּ","פָ","pe","fe","p","f")]
SAME = [("כּ ק","Kaf with a dot and kuf both sound like k"),("כ ח","Chaf with no dot and chet both sound like ch in Bach"),("ט ת","Both sound like t"),("א ע","Both are nearly silent"),("ב ו","Vet with no dot and vav both sound like v")]
AB = {"X": FEX, "D": DOT, "L": LET, "F": FIN, "S": SIGNS, "P": PAIRS, "M": SAME}
ABJS = r"""<script>
(function(){var D=__DATA__;var $=function(i){return document.getElementById(i)};
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;')}
var tab='l',sel=0,vr=0,say=function(t){if(window.heSay)heSay(t)};
var names={};D.L.forEach(function(l){names[l[0]]=l[1]});D.F.forEach(function(f){names[f[1]]='final '+names[f[0]]});
function tabs(){var T=[['l','Letters'],['s','Similar'],['r','Signs'],['q','Quiz']];$('ctabs').innerHTML=T.map(function(t){return '<button class="ct'+(t[0]==tab?' on':'')+'" data-t="'+t[0]+'">'+t[1]+'</button>'}).join('');
 document.querySelectorAll('.ct').forEach(function(b){b.onclick=function(){tab=b.getAttribute('data-t');draw()}})}
function ic(){return '<svg class="ic" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M7 4.5v15l12-7.5z"/></svg>'}
function letters(){var l0=D.L[sel],l=l0,dot=l0[7];if(dot&&vr==1)l=[l0[0],dot[0],dot[1],dot[3],dot[4],dot[5],dot[2]];if(!dot)vr=0;var big=(dot&&vr==0)?l0[0]+'\u05bc':l0[0];var h='<div class="agrid" dir="rtl">'+D.L.map(function(x,i){return '<button class="al'+(i==sel?' on':'')+'" data-i="'+i+'" lang="he">'+x[0]+'</button>'}).join('')+'</div>';
 h+='<div class="adet">'+(dot?'<div class="vtog"><button class="vt'+(vr==0?' on':'')+'" data-v="0">With dot: '+esc(l0[1])+'</button><button class="vt'+(vr==1?' on':'')+'" data-v="1">No dot: '+esc(dot[0])+'</button></div>':'')+'<div class="abig" lang="he" dir="rtl">'+big+'</div><div class="aname">'+esc(l[1])+'</div><p class="asd">'+esc(l[2])+'</p><div class="arow"><button class="btn go" id="s1">'+ic()+' Hear the sound</button></div><div class="aex"><span lang="he" dir="rtl">'+l[3]+'</span><b>'+esc(l[4])+'</b><small>'+esc(l[5])+'</small><button class="mp" id="s2" aria-label="Hear the word">'+ic()+'</button></div></div>';
 var fn=D.F.filter(function(f){return f[0]==l0[0]})[0];if(fn){var fe=D.X[fn[0]];h+='<div class="afin"><span lang="he" dir="rtl">'+fn[1]+'</span><small>At the end of a word it is written '+fn[1]+', same sound: <b lang="he">'+fe[0]+'</b> '+esc(fe[1])+'</small><button class="mp" id="s3" aria-label="Hear the word">'+ic()+'</button></div>'}
 h+=(dot?'<p class="asm">Bet, kaf and pe have two sounds. A dot inside the letter makes it hard. No dot makes it soft. Most Hebrew text leaves the dot out, so you learn each word.</p>':'')+'';
 $('cbody').innerHTML=h;
 document.querySelectorAll('.al').forEach(function(b){b.onclick=function(){sel=+b.getAttribute('data-i');vr=0;letters();say(D.L[sel][6])}});
 if($('s3'))$('s3').onclick=function(){say(D.X[l0[0]][0])};$('s1').onclick=function(){say(l[6])};$('s2').onclick=function(){say(l[3])};document.querySelectorAll('.vt').forEach(function(b){b.onclick=function(){vr=+b.getAttribute('data-v');letters();say(vr==1?l0[7][2]:l0[6])}})}
function looks(){var h='<h2>One letter, two sounds</h2><p class="asm" style="margin:0 0 6px">A dot inside makes it hard. No dot makes it soft. Tap each one.</p><div class="apairs">'+D.D.map(function(d){return '<div class="apr"><div class="pb" lang="he" dir="rtl"><button class="dl1" data-s="'+d[2]+'">'+d[0]+'</button><button class="dl1" data-s="'+d[3]+'">'+d[1]+'</button></div><small>dot: '+d[4]+' ('+d[6]+')<br>no dot: '+d[5]+' ('+d[7]+')</small></div>'}).join('')+'</div><h2>At the end of a word</h2><p class="asm" style="margin:0 0 6px">Five letters change shape at the end of a word. The sound stays the same. Tap to hear a word.</p><div class="apairs">'+D.F.map(function(f){var e=D.X[f[0]];return '<div class="apr"><div class="pb" lang="he" dir="rtl"><button class="xl1" data-s="'+e[0]+'">'+f[0]+'</button><button class="xl1" data-s="'+e[0]+'">'+f[1]+'</button></div><small><b lang="he">'+e[0]+'</b> '+esc(e[1])+', '+esc(e[2])+'</small></div>'}).join('')+'</div><h2>Letters that look alike</h2><div class="apairs">'+D.P.map(function(p){return '<div class="apr"><div class="pb" lang="he" dir="rtl"><button data-say="'+'" class="pl1" data-h="'+p[0]+'">'+p[0]+'</button><button class="pl1" data-h="'+p[1]+'">'+p[1]+'</button></div><small>'+esc(p[2])+'</small></div>'}).join('')+'</div>';
 h+='<h2>Letters that sound alike</h2><ul class="asa">'+D.M.map(function(m){return '<li><span lang="he" dir="rtl">'+m[0]+'</span> '+esc(m[1])+'</li>'}).join('')+'</ul><p class="asm">Israelis mix these up when they spell, so you are in good company.</p>';
 $('cbody').innerHTML=h;
 document.querySelectorAll('.xl1').forEach(function(b){b.onclick=function(){say(b.getAttribute('data-s'))}});document.querySelectorAll('.dl1').forEach(function(b){b.onclick=function(){say(b.getAttribute('data-s'))}});document.querySelectorAll('.pl1').forEach(function(b){b.onclick=function(){var c=b.getAttribute('data-h'),i=D.L.findIndex(function(x){return x[0]==c});if(i<0)i=D.L.findIndex(function(x){return D.F.some(function(f){return f[1]==c&&f[0]==x[0]})});say(i>=0?D.L[i][6]:c)}})}
var sg=0;
function signs(){var s=D.S[sg],ls=s[0].split('');var h='<div class="asgn"><div class="sbig" lang="he" dir="rtl">'+s[0]+'</div><div class="aname">'+esc(s[1])+'</div><p class="asd">'+esc(s[2])+'</p><div class="sl" dir="rtl">'+ls.map(function(c){return '<span><b lang="he">'+c+'</b><small>'+esc(names[c]||'')+'</small></span>'}).join('')+'</div><div class="arow"><button class="btn go" id="sp">'+ic()+' Hear it</button></div></div>';
 h+='<div class="stabs">'+D.S.map(function(x,i){return '<button class="st'+(i==sg?' on':'')+'" data-i="'+i+'" lang="he">'+x[0]+'</button>'}).join('')+'</div><p class="asm">Tap a sign. The letters show how it is built, right to left.</p>';
 $('cbody').innerHTML=h;$('sp').onclick=function(){say(s[0])};
 document.querySelectorAll('.st').forEach(function(b){b.onclick=function(){sg=+b.getAttribute('data-i');signs();say(D.S[sg][0])}})}
var qi=0,sc=0,Q=[],ans=false;
function shuf(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t}return a}
function newQ(){Q=[];shuf(D.L).slice(0,6).forEach(function(l){var w=shuf(D.L.filter(function(x){return x[0]!=l[0]})).slice(0,2);Q.push({k:'snd',a:l[0],o:shuf([l[0],w[0][0],w[1][0]]),say:l[6]})});
 shuf(D.S).slice(0,4).forEach(function(s){var w=shuf(D.S.filter(function(x){return x[0]!=s[0]})).slice(0,2);Q.push({k:'sgn',a:s[2],h:s[0],o:shuf([s[2],w[0][2],w[1][2]]),say:s[0]})});Q=shuf(Q);qi=0;sc=0;ans=false}
function quiz(){if(!Q.length)newQ();if(qi>=Q.length){var h='<div class="asgn"><h2>Done</h2><p class="asd">You scored '+sc+' of '+Q.length+'.</p><button class="btn go big" id="qr">Try again</button></div>';$('cbody').innerHTML=h;$('qr').onclick=function(){newQ();quiz()};return}
 var q=Q[qi],h='<p class="asm">Question '+(qi+1)+' of '+Q.length+'</p>';
 if(q.k=='snd')h+='<div class="asgn"><p class="asd">Which letter says this?</p><button class="btn go big" id="qp">'+ic()+' Hear it</button></div><div class="aopts" dir="rtl">'+q.o.map(function(o){return '<button class="ao" data-v="'+o+'" lang="he">'+o+'</button>'}).join('')+'</div>';
 else h+='<div class="asgn"><p class="asd">What does this sign say?</p><div class="sbig" lang="he" dir="rtl">'+q.h+'</div><button class="btn go" id="qp">'+ic()+' Hear it</button></div><div class="aopts tx">'+q.o.map(function(o){return '<button class="ao" data-v="'+esc(o)+'">'+esc(o)+'</button>'}).join('')+'</div>';
 h+='<div id="qf" class="asm"></div><div class="arow"><button class="btn go" id="qn" hidden>Next</button></div>';
 $('cbody').innerHTML=h;ans=false;$('qp').onclick=function(){say(q.say)};if(q.k=='snd')say(q.say);
 document.querySelectorAll('.ao').forEach(function(b){b.onclick=function(){if(ans)return;ans=true;var ok=b.getAttribute('data-v')==q.a;if(ok)sc++;document.querySelectorAll('.ao').forEach(function(x){if(x.getAttribute('data-v')==q.a)x.classList.add('ok')});if(!ok)b.classList.add('no');$('qf').textContent=ok?'Correct.':'Not quite.';$('qn').hidden=false;$('qn').onclick=function(){qi++;quiz()}}})}
function draw(){tabs();if(tab=='l')letters();else if(tab=='s')looks();else if(tab=='r')signs();else quiz()}
draw()})();
</script>"""
ABCSS = """<style>
.ab{max-width:560px;margin:0 auto;--n:#0a2566;--g:#f8ba2f}.ab h1{color:var(--fg)!important;opacity:1!important}
.ab .ctabs{display:flex;gap:6px;margin:10px 0}.ab .ct{flex:1;padding:9px 4px;border:2px solid var(--g);border-radius:10px;background:#fff;color:var(--n);font-weight:700;font-size:15px;font-family:inherit;cursor:pointer}.ab .ct.on{background:var(--g)}
.ab #cbody{background:var(--n);border:3px solid var(--g);border-radius:14px;padding:12px;color:#fff;background-image:linear-gradient(rgba(255,255,255,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.07) 1px,transparent 1px);background-size:28px 28px}
.ab h2{color:#fff;font-size:18px;margin:6px 0}
.ab .agrid{display:grid;grid-template-columns:repeat(6,1fr);gap:6px}.ab .al{padding:8px 0;border:2px solid transparent;border-radius:10px;background:rgba(255,255,255,.1);color:#ffc700;font-weight:700;font-size:28px;line-height:1.1;font-family:inherit;cursor:pointer}.ab .al.on{border-color:#ffc700;background:rgba(255,199,0,.2)}
.ab .adet{text-align:center;margin-top:10px}.ab .abig,.ab .sbig{color:#ffc700;font-weight:800;line-height:1.05}.ab .abig{font-size:84px}.ab .sbig{font-size:56px}
.ab .aname{font-size:20px;font-weight:800}.ab .asd{margin:4px 0 8px;opacity:.9;font-size:15px}.ab .asm{font-size:13px;opacity:.85;margin:8px 0 0}.ab .asm span{color:#ffc700}
.ab .arow{margin:8px 0;display:flex;gap:8px;justify-content:center}.ab .btn{display:inline-flex;align-items:center;gap:6px;padding:9px 18px;border:0;border-radius:999px;background:#ffc700;color:var(--n);font-weight:800;font-size:16px;font-family:inherit;cursor:pointer;box-shadow:0 3px 0 #b8900a}.ab .btn.big{padding:12px 24px;font-size:18px}
.ab .vtog{display:flex;gap:6px;justify-content:center;margin-bottom:4px}.ab .vt{padding:6px 12px;border:2px solid #ffc700;border-radius:999px;background:transparent;color:#fff;font-weight:700;font-size:14px;font-family:inherit;cursor:pointer}.ab .vt.on{background:#ffc700;color:var(--n)}.ab .aex{display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;margin-top:4px}.ab .aex span{color:#ffc700;font-size:26px;font-weight:700}.ab .aex small{opacity:.85}
.ab .mp{width:36px;height:36px;border-radius:50%;border:0;background:#ffc700;color:var(--n);display:inline-flex;align-items:center;justify-content:center;cursor:pointer}
.ab .apairs{display:grid;grid-template-columns:1fr 1fr;gap:8px}.ab .apr{background:rgba(255,255,255,.08);border-radius:10px;padding:8px;text-align:center}.ab .pb{display:flex;justify-content:center;gap:10px}.ab .afin{display:flex;align-items:center;justify-content:center;gap:10px;margin-top:6px}.ab .afin>span{color:#ffc700;font-size:40px;font-weight:800;line-height:1}.ab .afin small{font-size:13px;text-align:left;max-width:210px}.ab .afin b{color:#ffc700}.ab .pl1,.ab .dl1,.ab .xl1{background:transparent;border:0;color:#ffc700;font-weight:800;font-size:44px;line-height:1;font-family:inherit;cursor:pointer}.ab .apr small{display:block;font-size:12px;opacity:.9}
.ab .asa{list-style:none;padding:0;margin:4px 0}.ab .asa li{padding:4px 0;font-size:15px}.ab .asa span{color:#ffc700;font-size:22px;font-weight:800;margin-right:8px}
.ab .asgn{text-align:center}.ab .sl{display:flex;gap:8px;justify-content:center;margin:6px 0;flex-wrap:wrap}.ab .sl span{background:rgba(255,255,255,.1);border-radius:8px;padding:4px 8px;min-width:44px}.ab .sl b{display:block;color:#ffc700;font-size:26px}.ab .sl small{font-size:11px;opacity:.85}
.ab .stabs{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-top:6px}.ab .st{padding:6px 10px;border:2px solid transparent;border-radius:10px;background:rgba(255,255,255,.1);color:#ffc700;font-weight:700;font-size:18px;font-family:inherit;cursor:pointer}.ab .st.on{border-color:#ffc700}
.ab .aopts{display:flex;gap:8px;justify-content:center;margin:8px 0}.ab .ao{flex:1;padding:12px 4px;border:2px solid #f8ba2f;border-radius:12px;background:rgba(255,255,255,.1);color:#ffc700;font-weight:800;font-size:30px;font-family:inherit;cursor:pointer}.ab .aopts.tx .ao{font-size:16px;color:#fff;font-weight:700}.ab .ao.ok{background:#1a8f4a;color:#fff;border-color:#1a8f4a}.ab .ao.no{background:#b3261e;color:#fff;border-color:#b3261e}
</style>"""
def alphabet():
    data = json.dumps({"X": FEX, "D": DOT, "L": LET, "F": FIN, "S": SIGNS, "P": PAIRS, "M": SAME}, ensure_ascii=False)
    body = ('<div class="hubslide ab"><h1>Hebrew Alphabet</h1><p class="lead">Twenty-two letters, read right to left. Tap a letter to hear its sound, then try the signs you will meet in Israel.</p>'
            '<div class="ctabs" id="ctabs"></div><div id="cbody"></div><noscript><p>The alphabet needs JavaScript.</p></noscript>'
            + ABJS.replace('__DATA__', data) + '<script src="/hebrew/say.js" defer></script><p class="small"><a href="/hebrew/">All Hebrew</a></p></div>')
    wr('hebrew/alphabet/index.html', page('Hebrew Alphabet: hear every letter and read the signs', 'Learn the 22 Hebrew letters with sounds, example words, look-alike pairs, real signs and a quiz. Built for your phone.', 'https://israelnowlej.com/hebrew/alphabet/', body, CSS + ABCSS))
alphabet()
