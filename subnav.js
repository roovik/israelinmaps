(function(){
  var bar=document.getElementById('subnav');if(!bar)return;
  var sec=bar.getAttribute('data-trend');
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function mark(){var cur=location.pathname+location.hash;[].forEach.call(document.querySelectorAll('.subnav a'),function(a){var h=a.getAttribute('href');a.className=(h===cur||(!location.hash&&h===location.pathname)||h===document.body.getAttribute('data-subon'))?'on':''})}
  mark();window.addEventListener('hashchange',mark);



  /* Rolling over a top-level menu item previews its second-level menu */
  (function(){
    var nav=document.querySelector('header.top nav.wrap');if(!nav||!window.matchMedia||!matchMedia('(hover:hover)').matches)return;
    var head=document.querySelector('header.top'),orig=bar.innerHTML,origHidden=bar.hidden,origC=bar.getAttribute('data-c'),M=null,t=null,cur=null;
    function load(cb){if(M)return cb();fetch('/subnav.json').then(function(r){return r.json()}).then(function(j){M=j;cb()}).catch(function(){})}
    function show(a){var u=a.getAttribute('href');load(function(){var l=M[u];if(!l||!l.length)return;cur=u;
      bar.innerHTML=l.map(function(x){return'<a href="'+esc(x[1])+'">'+esc(x[0])+'</a>'}).join('');bar.hidden=false;bar.setAttribute('data-c',a.getAttribute('data-n'));bar.classList.add('prev');
      [].forEach.call(nav.querySelectorAll('a'),function(n){n.classList.toggle('hov',n===a)})})}
    function restore(){cur=null;bar.innerHTML=orig;bar.hidden=origHidden;bar.classList.remove('prev');if(origC==null)bar.removeAttribute('data-c');else bar.setAttribute('data-c',origC);
      [].forEach.call(nav.querySelectorAll('a'),function(n){n.classList.remove('hov')});mark()}
    [].forEach.call(nav.querySelectorAll('a'),function(a){a.addEventListener('mouseenter',function(){clearTimeout(t);show(a)});a.addEventListener('focus',function(){clearTimeout(t);show(a)})});
    head.addEventListener('mouseleave',function(){clearTimeout(t);t=setTimeout(restore,350)});
    head.addEventListener('mouseenter',function(){clearTimeout(t)});
    bar.addEventListener('mouseenter',function(){clearTimeout(t)});
  })();

  /* Timelines: two rows. Row one picks an era, row two lists that era's timelines. */
  (function(){
    var row=document.getElementById('subnav2');if(!row)return;
    var links=[].slice.call(row.querySelectorAll('a[href^="/timelines/"]'));if(links.length<10)return;
    function swap(re,qs){qs.forEach(function(q){var x=row.querySelector('a[href="'+q[0]+'"]');if(x)x.textContent=q[1]});var f=links.filter(function(x){return re.test(x.getAttribute('href'))})[0];if(!f)return;var i=links.indexOf(f),add=[];qs.forEach(function(q){var x=row.querySelector('a[href="'+q[0]+'"]');if(!x){x=document.createElement('a');x.href=q[0];x.textContent=q[1];f.parentNode.insertBefore(x,f)}x.textContent=q[1];add.push(x)});links.splice.apply(links,[i,1].concat(add));f.remove();links=links.filter(function(x,j){return links.indexOf(x)===j})}
    swap(/^\/timelines\/002\//,[['/timelines/002a/kings-and-prophets/','Kings & Prophets'],['/timelines/002b/exile-and-return/','Exile & Return']]);
    swap(/^\/timelines\/012\//,[['/timelines/012a/independence-and-ingathering/','1948–1955'],['/timelines/012b/sinai-and-the-years-between/','1956–1966']]);swap(/^\/timelines\/013\//,[['/timelines/013a/the-six-day-war-and-yom-kippur/','1967–1976']]);swap(/^\/timelines\/014\//,[['/timelines/014a/upheaval-peace-and-intifada/','1977–1992']]);swap(/^\/timelines\/016\//,[['/timelines/016a/oslo-and-the-second-intifada/','1993–2004']]);swap(/^\/timelines\/017\//,[['/timelines/017a/disengagement-and-the-gaza-wars/','2005–2014']]);swap(/^\/timelines\/018\//,[['/timelines/018a/abraham-accords-to-october-7/','2015–Oct 7']]);swap(/^\/timelines\/019\//,[['/timelines/019a/the-seven-front-war/','Oct 2023–']]);links=links.filter(function(x){if(/^\/timelines\/01[2-9]\//.test(x.getAttribute('href'))){x.remove();return false}return true});
    swap(/^\/timelines\/004\//,[['/timelines/004a/rabbinic-judaism-and-roman-rule/','Roman'],['/timelines/004b/byzantine-decline-and-islamic-conquest/','Muslim'],['/timelines/004c/abbasid-and-early-medieval-judaism/','Abbasid'],['/timelines/004d/crusaders-and-ayyubids/','Crusader'],['/timelines/004e/mamluk-rule-and-the-spanish-expulsion/','Mamluk'],['/timelines/004f/ottoman-rule-and-jewish-resettlement/','Ottoman']]);
    function stripes(y0,y1,n,a,b,f0,f1,nm){var r=[],w=(y1-y0)/n;for(var k=0;k<n;k++){var f=f0+(f1-f0)*k/(n-1),x=y0+k*w;r.push([x,x+w*(1-f),a,nm]);r.push([x+w*(1-f),x+w,b,nm])}return r}
    function mixc(a,b,t){var x=parseInt(a.slice(1),16),y=parseInt(b.slice(1),16),o='#';for(var s=16;s>=0;s-=8){var v=Math.round(((x>>s)&255)*(1-t)+((y>>s)&255)*t);o+=(v<16?'0':'')+v.toString(16)}return o}
    function ramp(ys,a,b){var r=[];for(var k=0;k<ys.length-1;k++)r.push([ys[k],ys[k+1],mixc(a,b,ys.length>2?k/(ys.length-2):0)]);return r}
    function steps(y0,y1,d){var r=[y0];for(var y=Math.floor(y0/d)*d+d;y<y1;y+=d)r.push(y);r.push(y1);return r}
    function alt(ys,a,b){return ys.slice(1).map(function(y,k){return [ys[k],y,k%2?b:a]})}
    var ERAS=[
      {r:'Patriarchs to Saul, 2000 to 1000 BCE',y0:-2000,y1:-1000,from:1,to:1,segs:[[-2000,-1700,'#d3e0f6','Patriarchal age'],[-1700,-1200,'#ecdcb4','Egypt and the Exodus'],[-1200,-1020,'#c5d5f3','Judges and tribal Israel'],[-1020,-1000,'#adc3ee','Saul']]},
      {r:'David to Bar Kokhba, 1000 BCE to 135 CE',y0:-1000,y1:135,from:2,to:3,segs:[[-1000,-970,'#8fadea','David'],[-970,-930,'#7ea0e6','Solomon'],[-930,-722,'#a3bcee','Divided kingdoms of Israel and Judah'],[-722,-586,'#bccef2','Judah survives'],
        [-586,-539,'#e4d2a6','Babylonian exile'],[-539,-332,'#eee1bd','Persian rule'],[-332,-301,'#e8d6ab','Alexander and successors'],[-301,-200,'#f0e4c4','Ptolemaic rule'],[-200,-167,'#e6d1a1','Seleucid rule'],
        [-167,-140,'#bccef2','Maccabean revolt'],[-140,-63,'#8fadea','Hasmonean independence'],[-63,-37,'#e3c99c','Roman supremacy'],[-37,-4,'#dbbd8c','Herod the Great'],[-4,66,'#e6cfa6','Herodian rulers and Roman governors'],[66,74,'#b4c8f1','Great Jewish Revolt'],[74,132,'#e3c99c','Post-Temple Roman Judea'],[132,135,'#a3bcee','Bar Kokhba revolt']]},
      {r:'Survival without sovereignty, 135 to 1917',y0:135,y1:1917,from:4,to:8,segs:[[135,313,'#e6cfa6','Rabbinic Judaism under pagan Rome'],[313,500,'#f3c6c0','Rabbinic Judaism under Christian Rome'],[500,638,'#eeb5ae','Byzantine decline'],[638,750,'#cbe5c4','Islamic conquest and the Umayyads'],[750,1099,'#bcdcb4','Abbasid and early medieval Judaism'],[1099,1187,'#e5a39b','Crusader kingdom'],[1187,1260,'#c9e3c0','Ayyubids'],[1260,1517,'#b0d6a8','Mamluk rule'],[1517,1840,'#a3cf9c','Ottoman rule']].concat(stripes(1840,1881,6,'#a3cf9c','#9fbbee',.12,.3,'Ottoman rule, the old Yishuv'),stripes(1881,1917,9,'#a3cf9c','#8fadea',.3,.6,'Zionism under Ottoman rule'))},
      {r:'British Mandate, Holocaust and statehood, 1917 to 1948',y0:1917,y1:1948,from:9,to:11,segs:stripes(1917,1948,10,'#d9d4cb','#7ea0e6',.4,.85,'British Mandate')},
      {r:'Independence and regional wars, 1948 to 1993',y0:1948,y1:1993,from:12,to:15.9,segs:[[1948,1956,'#7ea0e6','Independence and ingathering'],[1956,1967,'#9cb6eb','Sinai and the years between'],[1967,1977,'#86a7e8','The Six-Day War and Yom Kippur'],[1977,1993,'#a3bbee','Upheaval, peace and intifada']]},
      {r:'Peace efforts, conflict and realignment, 1993 to today',y0:1993,y1:2030,from:16,to:99,segs:[[1993,2005,'#8baae8','Oslo and the Second Intifada'],[2005,2015,'#a0b9ec','Disengagement and the Gaza wars'],[2015,2023.77,'#8fadea','Abraham Accords to October 7'],[2023.77,2030,'#7ea0e6','The Seven-Front War']]}];
    var MID={1:-1500,2:-900,2.1:-940,2.2:-450,3:-250,4:400,4.1:300,4.2:600,4.3:900,4.4:1180,4.5:1400,4.6:1650,5:1840,6:1890,7:1905,8:1915,16:1996};
    var SPLIT=66;  /* percent of the ruler for 2000 BCE to 1900; the rest is the zoom from 1900 to today */
    function X(y){return y<=1900?(y+2000)/3900*SPLIT:SPLIT+(y-1900)/130*(100-SPLIT)}
    var SPAN={1:[-2000,-1000],2.1:[-1000,-586],2.2:[-586,-332],3:[-332,135],4.1:[135,500],4.2:[500,750],4.3:[750,1099],4.4:[1099,1260],4.5:[1260,1517],4.6:[1517,1800],5:[1800,1881],6:[1881,1900],7:[1900,1910],8:[1910,1917],9:[1917,1930],10:[1930,1940],11:[1940,1948],12.1:[1948,1956],12.2:[1956,1967],13.1:[1967,1977],14.1:[1977,1993],16.1:[1993,2005],17.1:[2005,2015],18.1:[2015,2023.77],19.1:[2023.77,2030]};
    function grad(e,y0,y1){var g=e.segs.filter(function(q){return q[1]>y0&&q[0]<y1});return 'linear-gradient(90deg,'+g.map(function(q){var a=(Math.max(q[0],y0)-y0)/(y1-y0)*100,b=(Math.min(q[1],y1)-y0)/(y1-y0)*100;return q[2]+' '+a.toFixed(1)+'% '+b.toFixed(1)+'%'}).join(',')+')'}
    function colorAt(e,y){for(var k=0;k<e.segs.length;k++)if(y<e.segs[k][1])return e.segs[k][2];return e.segs[e.segs.length-1][2]}
    function num(h){var m=/^\/timelines\/(\d{3})([a-z]?)\//.exec(h||'');return m?+m[1]+(m[2]?(m[2].charCodeAt(0)-96)/10:0):0}
    function eraOf(n){for(var i=0;i<ERAS.length;i++)if(n>=ERAS[i].from&&n<=ERAS[i].to)return i;return -1}
    if(!document.getElementById('tl-era-css')){var st=document.createElement('style');st.id='tl-era-css';st.textContent=
      '.subnav.sub2.tl2{display:block;padding:8px 16px 10px}'+
      '.tl-eras{position:relative;max-width:900px;margin:0 auto;height:54px;background:linear-gradient(#0000 26px,#fff 26px);user-select:none}'+'.tl-eras .tb{position:absolute;top:0;height:26px;border:0;padding:0;margin:0;cursor:pointer;background:var(--c);transition:filter .15s}'+'.tl-eras .tb:hover{filter:brightness(.96)}'+'.tl-eras .tb[aria-selected=true]{box-shadow:inset 0 4px 0 #111}'+'.tl-eras .tb:focus-visible{outline:2px solid #111;outline-offset:1px;z-index:2}'+'.tl-eras .base{position:absolute;left:0;right:0;top:26px;height:1.5px;background:#111;pointer-events:none}'+'.tl-eras .tk{position:absolute;top:26px;width:1px;height:4px;background:#777;pointer-events:none}'+'.tl-eras .tk.mj{height:9px;width:1.5px;background:#111}'+'.tl-eras .lb{position:absolute;top:37px;transform:translateX(-50%);font:600 .7rem/1 system-ui,-apple-system,sans-serif;color:#111;white-space:nowrap;pointer-events:none}'+'.tl-eras .lb.st{transform:none}.tl-eras .lb.en{transform:translateX(-100%)}'+'.tl-eras .brk{position:absolute;top:0;width:3px;height:26px;margin-left:-1.5px;background:#fff;opacity:.9;transform:skewX(-12deg);pointer-events:none;z-index:1}'+'.tl-eras .lb i,.tl-eras .lb b{display:none}'+'.tl-list{display:flex;flex-wrap:wrap;justify-content:center;gap:2px 4px;margin-top:0}.tl-list.tl-sub{margin-top:2px}.tl-list[hidden]{display:none}'+
      '.subnav.sub2.tl2 .tl-list a{flex:none;border-radius:0!important;color:#222!important;transition:filter .15s}'+'.subnav.sub2.tl2 .tl-list a:hover{filter:brightness(.96)!important}'+'.subnav.sub2.tl2 .tl-list a.on{box-shadow:inset 0 4px 0 #111!important;color:#000!important}'+
      '@media (max-width:700px){header.top .subnav.sub2.tl2 .tl-list.six{flex-wrap:nowrap;gap:0 2px}header.top .subnav.sub2.tl2 .tl-list.six a{flex:1 1 0!important;min-width:0;padding:6px 0!important;font-size:.7rem!important;text-align:center;white-space:nowrap;letter-spacing:-.01em}.tl-eras .lb{font-size:.64rem}.tl-eras .lb b{display:none}}'+
      '@media (max-width:380px){header.top .subnav.sub2.tl2 .tl-list a{padding:5px 2px!important;font-size:.74rem!important}.tl-eras .lb{font-size:.56rem}.tl-eras .lb.ce{display:none}}'+
      '@media (max-width:700px){.subnav.sub2.tl2{padding:8px 8px 8px}.tl-list{gap:0 2px}header.top .subnav.sub2.tl2 .tl-list a{padding:5px 4px!important;font-size:.8rem!important}.tl-list{justify-content:space-between!important}}';
      document.head.appendChild(st)}
    row.classList.add('tl2');row.innerHTML='';
    var bar=document.createElement('div');bar.className='tl-eras';bar.setAttribute('role','tablist');bar.setAttribute('aria-label','Timeline eras');
    var list=document.createElement('div');list.className='tl-list';list.hidden=true;list.setAttribute('role','tabpanel');
    var list2=document.createElement('div');list2.className='tl-list tl-sub';list2.hidden=true;
    row.appendChild(bar);row.appendChild(list);row.appendChild(list2);
    var btns=ERAS.map(function(e,i){var b=document.createElement('button');b.type='button';b.className='tb';b.setAttribute('role','tab');b.title=e.r;b.setAttribute('aria-label',e.r);b.setAttribute('aria-selected','false');
      b.style.left=X(e.y0)+'%';b.style.width=(X(e.y1)-X(e.y0))+'%';var W=X(e.y1)-X(e.y0);b.style.background='linear-gradient(90deg,'+e.segs.map(function(g){return g[2]+' '+((X(g[0])-X(e.y0))/W*100).toFixed(2)+'% '+((X(g[1])-X(e.y0))/W*100).toFixed(2)+'%'}).join(',')+')';
      b.addEventListener('mousemove',function(ev){var r=b.getBoundingClientRect(),px=X(e.y0)+(ev.clientX-r.left)/r.width*W,g=e.segs.filter(function(g){return px>=X(g[0])&&px<X(g[1])})[0];b.title=g&&g[3]?g[3]:e.r});b.addEventListener('click',function(){show(i);var first=links.filter(function(a){return eraOf(num(a.getAttribute('href')))===i})[0];if(!first)return;var u=first.getAttribute('href');if(eraOf(num(location.pathname))===i)return;if(window.__tlLoad)window.__tlLoad(u);else location.href=u});bar.appendChild(b);return b});
    (function(){var h='<span class="base"></span>';
      for(var y=-1900;y<1900;y+=100)if(y%1000)h+='<span class="tk" style="left:'+X(y)+'%"></span>';
      for(var d=1910;d<2030;d+=10)h+='<span class="tk" style="left:'+X(d)+'%"></span>';
      [[-2000,'2000<b> BCE</b>','st'],[-1000,'1000<i> BCE</i>',''],[0,'0',''],[1000,'1000',''],[1900,'',''],[1917,'1917',''],[1948,'1948',''],[1993,'1993','']].forEach(function(m){h+='<span class="tk mj" style="left:'+X(m[0])+'%"></span><span class="lb '+m[2]+'" style="left:'+X(m[0])+'%">'+m[1]+'</span>'});
      bar.insertAdjacentHTML('beforeend',h)})();
    links.forEach(function(a){var h=a.getAttribute('href');if(/^\/timelines\/001\//.test(h))a.textContent='Patriarchs & Judges';if(/^\/timelines\/003\//.test(h))a.textContent='Greeks, Jews & Romans'});
    links.forEach(function(a){if(a.textContent==='Zionism Takes Shape')a.textContent='Early Zionism';if(/^\/timelines\/005\//.test(a.getAttribute('href')))a.textContent='1800s'});
    links.forEach(function(a){a.setAttribute('data-tl','1')});
    var sel=-1;
    var SUB={5:1,6:1,7:1,8:1},grp=document.createElement('a');grp.textContent='Zionism';grp.href='/timelines/005/the-ottoman-land/';grp.setAttribute('data-tl','1');
    function show(i){sel=i;btns.forEach(function(b,j){b.setAttribute('aria-selected',j===i?'true':'false')});
      list.innerHTML='';list2.innerHTML='';var k=0;links.forEach(function(a){var n=num(a.getAttribute('href'));if(eraOf(n)!==i)return;var c=colorAt(ERAS[i],MID[n]!=null?MID[n]:1925+10*(n-9));
        if(i===2&&SUB[n]){a.style.setProperty('background',grad(ERAS[i],SPAN[n][0],SPAN[n][1]),'important');k++;list2.appendChild(a)}else{a.style.setProperty('background',SPAN[n]?grad(ERAS[i],SPAN[n][0],SPAN[n][1]):c,'important');list.appendChild(a)}});
      list.classList.toggle('six',i===2);list.hidden=false;var cn=num(location.pathname);list2.hidden=!(i===2&&(SUB[cn]||cn===4.6));mark2()}
    function mark2(){var cur=location.pathname;links.forEach(function(a){a.className=a.getAttribute('href')===cur?'on':''});if(SUB[num(cur)])links.forEach(function(a){if(num(a.getAttribute('href'))===4.6)a.className='on'})}
    function sync(){var e=eraOf(num(location.pathname));if(e>-1)show(e);else mark2()}
    sync();window.addEventListener('popstate',sync);document.addEventListener('tl:nav',sync);
  })();
  if(!sec)return;
  var STOP={};'The A An And But For From With Without Over Under After Before Amid Into About This That These Those What When Where Which While Will Would Could Should Says Said Say New Old Not How Why Who Our His Her Their Its All One Two Three Four Five Six Seven Eight Nine Ten More Most Than Then They You Your Are Was Were Has Have Had Can May Might Must Now Here There Out Off Up Down Day Days Week Year Years Time First Last Next Top Big Over Just Also Still Just Only Even After Against Between During Since Until Within Israel Israeli Israelis Monday Tuesday Wednesday Thursday Friday Saturday Sunday January February March April May June July August September October November December Watch Live Opinion Editorial Analysis Report Reports Video Photos Photo Gallery Read Here Why How Who What Update Updates Breaking News Times Post Jerusalem Haaretz'.split(' ').forEach(function(w){STOP[w.toLowerCase()]=1});
  fetch(sec==='views'?'/api/news?views=1&v=2':'/api/news?v=2').then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(d){
    var items=d.items.filter(function(i){return i.d&&Date.now()-new Date(i.d)<=4*864e5}),cnt={},disp={};
    items.forEach(function(it){var seen={},w=it.t.replace(/[‘’]/g,"'").replace(/[^A-Za-z0-9'\- ]+/g,' ').split(/\s+/).filter(Boolean);
      for(var n=0;n<w.length;n++){
        var cap=/^[A-Z][A-Za-z'\-]{2,}$/.test(w[n])&&!STOP[w[n].toLowerCase()];
        if(!cap)continue;
        var terms=[w[n]];
        if(n+1<w.length&&/^[A-Z][A-Za-z'\-]{2,}$/.test(w[n+1])&&!STOP[w[n+1].toLowerCase()])terms.push(w[n]+' '+w[n+1]);
        terms.forEach(function(t){var k=t.toLowerCase();if(seen[k])return;seen[k]=1;cnt[k]=(cnt[k]||0)+1;disp[k]=t})}});
    var list=Object.keys(cnt).filter(function(k){return cnt[k]>=2}).sort(function(a,b){return cnt[b]-cnt[a]||b.length-a.length});
    var out=[];list.forEach(function(k){if(out.length>=8)return;
      for(var j=0;j<out.length;j++){if(out[j].indexOf(k)>-1&&cnt[out[j]]>=cnt[k])return;if(k.indexOf(out[j])>-1&&cnt[k]>=cnt[out[j]]){out.splice(j,1);j--}}
      out.push(k)});
    if(!out.length)return;
    var base=sec==='views'?'/views/':'/news/';
    var h='<span class="trl">Trending</span>'+out.map(function(k){return'<a class="tag" href="'+base+'#mode=topics&q='+encodeURIComponent(disp[k])+'">'+esc(disp[k])+'</a>'}).join('');
    var t=document.getElementById('trend');if(t){t.innerHTML=h;t.hidden=false}
    mark();bar.hidden=false;
  }).catch(function(){});
})();

/* Tours: region and stop selectors, and floating arrows through the whole tour */
(function(){
  if(!/^\/tour\//.test(location.pathname))return;
  var T=[["/tour/negev/","The Negev",[["/tour/negev/eilat/","Eilat"],["/tour/negev/timna-park/","Timna Park"],["/tour/negev/avdat/","Avdat"],["/tour/negev/sde-boker/","Sde Boker"],["/tour/negev/makhtesh-ramon/","Makhtesh Ramon"],["/tour/negev/beer-sheva/","Be'er Sheva"]]],["/tour/dead-sea/","The Dead Sea",[["/tour/dead-sea/masada/","Masada"],["/tour/dead-sea/ein-gedi/","Ein Gedi"],["/tour/dead-sea/qumran/","Qumran"],["/tour/dead-sea/jericho/","Jericho"],["/tour/dead-sea/wadi-qelt/","Wadi Qelt"],["/tour/dead-sea/sodom-and-gomorrah/","Sodom and Gomorrah"]]],["/tour/judea-and-samaria/","Judea and Samaria",[["/tour/judea-and-samaria/hebron/","Hebron"],["/tour/judea-and-samaria/bethlehem-and-herodium/","Bethlehem and Herodium"],["/tour/judea-and-samaria/beit-el/","Beit El"],["/tour/judea-and-samaria/shiloh/","Shiloh"],["/tour/judea-and-samaria/mounts-gerizim-and-ebal/","Mounts Gerizim and Ebal"],["/tour/judea-and-samaria/sebastia/","Sebastia"]]],["/tour/galilee/","The Galilee",[["/tour/galilee/beit-shean/","Beit She'an"],["/tour/galilee/nazareth/","Nazareth"],["/tour/galilee/cana/","Cana"],["/tour/galilee/kinneret/","Kinneret"],["/tour/galilee/magdala/","Magdala"],["/tour/galilee/capernaum/","Capernaum"],["/tour/galilee/mount-of-beatitudes/","Mount of Beatitudes"],["/tour/galilee/safed/","Safed"],["/tour/galilee/hula-valley/","Hula Valley"]]],["/tour/golan-heights/","The Golan Heights",[["/tour/golan-heights/gamla/","Gamla"],["/tour/golan-heights/katzrin/","Katzrin"],["/tour/golan-heights/valley-of-tears/","Valley of Tears"],["/tour/golan-heights/quneitra-viewpoint/","Quneitra Viewpoint"],["/tour/golan-heights/banias/","Banias"],["/tour/golan-heights/mount-hermon/","Mount Hermon"]]],["/tour/mediterranean-coast/","The Mediterranean Coast",[["/tour/mediterranean-coast/rosh-hanikra/","Rosh Hanikra"],["/tour/mediterranean-coast/akko/","Akko"],["/tour/mediterranean-coast/haifa/","Haifa"],["/tour/mediterranean-coast/mount-carmel/","Mount Carmel"],["/tour/mediterranean-coast/atlit/","Atlit"],["/tour/mediterranean-coast/caesarea/","Caesarea"],["/tour/mediterranean-coast/netanya/","Netanya"],["/tour/mediterranean-coast/apollonia/","Apollonia"],["/tour/mediterranean-coast/herzliya/","Herzliya"]]],["/tour/tel-aviv-and-jaffa/","Tel Aviv and Jaffa",[["/tour/tel-aviv-and-jaffa/jaffa/","Jaffa"],["/tour/tel-aviv-and-jaffa/neve-tzedek/","Neve Tzedek"],["/tour/tel-aviv-and-jaffa/rothschild-boulevard/","Rothschild Boulevard"],["/tour/tel-aviv-and-jaffa/carmel-market/","Carmel Market"],["/tour/tel-aviv-and-jaffa/rabin-square/","Rabin Square"],["/tour/tel-aviv-and-jaffa/sarona-market-and-hostage-square/","Sarona Market and Hostage Square"]]],["/tour/judean-hills/","The Judean Hills",[["/tour/judean-hills/latrun/","Latrun"],["/tour/judean-hills/burma-road/","Burma Road"],["/tour/judean-hills/abu-ghosh/","Abu Ghosh"],["/tour/judean-hills/castel-national-park/","Castel National Park"],["/tour/judean-hills/sataf/","Sataf"],["/tour/judean-hills/ein-kerem/","Ein Kerem"]]],["/tour/jerusalem/","Jerusalem",[["/tour/jerusalem/temple-mount/","Temple Mount"],["/tour/jerusalem/western-wall-and-tunnels/","Western Wall and Tunnels"],["/tour/jerusalem/city-of-david/","City of David"],["/tour/jerusalem/mount-zion/","Mount Zion"],["/tour/jerusalem/mount-of-olives-and-gethsemane/","Mount of Olives and Gethsemane"],["/tour/jerusalem/mea-shearim/","Mea She'arim"],["/tour/jerusalem/mahane-yehuda-market/","Mahane Yehuda Market"],["/tour/jerusalem/israel-museum-and-shrine-of-the-book/","Israel Museum and Shrine of the Book"],["/tour/jerusalem/yad-vashem/","Yad Vashem"]]],["/tour/southern-plain-shfela/","The Southern Plain (Shfela)",[["/tour/southern-plain-shfela/rishon-lezion/","Rishon LeZion"],["/tour/southern-plain-shfela/yavne/","Yavne"],["/tour/southern-plain-shfela/ashdod/","Ashdod"],["/tour/southern-plain-shfela/ashkelon/","Ashkelon"],["/tour/southern-plain-shfela/ofakim/","Ofakim"],["/tour/southern-plain-shfela/sderot/","Sderot"],["/tour/southern-plain-shfela/gaza-border-kibbutzim/","Gaza Border Kibbutzim"],["/tour/southern-plain-shfela/reim/","Re'im"],["/tour/southern-plain-shfela/gaza-gush-katif/","Gaza (Gush Katif)"]]]],seq=[['/tour/','Tours']];
  T.forEach(function(r){seq.push([r[0],r[1]]);r[2].forEach(function(s){seq.push([s[0],s[1]])})});
  var p=location.pathname,i=-1;for(var k=0;k<seq.length;k++)if(seq[k][0]===p)i=k;
  var reg=T.filter(function(r){return p.indexOf(r[0])===0})[0];
  var st=document.createElement('style');st.textContent=
    '.tournav{display:flex;gap:6px;padding:0 8px 10px;max-width:900px;margin:0 auto;width:100%;box-sizing:border-box}.tournav select{width:50%}main article nav.pn{display:none}'+
    '.tournav select{flex:1;min-width:0;font:600 .95rem system-ui,-apple-system,sans-serif;color:#111;background:#fff;border:1px solid #bbb;border-radius:0;padding:8px 28px 8px 10px;-webkit-appearance:none;appearance:none;background-image:linear-gradient(45deg,transparent 50%,#333 50%),linear-gradient(135deg,#333 50%,transparent 50%);background-position:calc(100% - 15px) 52%,calc(100% - 10px) 52%;background-size:5px 5px;background-repeat:no-repeat}'+
    '.tourarrow{display:flex;align-items:center;justify-content:center;position:fixed;top:55%;z-index:30;width:40px;height:64px;margin-top:-32px;background:rgba(43,47,56,.78);color:#fff;text-decoration:none;font:700 1.5rem/1 system-ui,sans-serif;box-shadow:0 4px 14px rgba(0,0,0,.25)}'+
    '.tourarrow:active{background:rgba(106,61,154,.92)}.tourarrow.prev{left:0}.tourarrow.next{right:0}'+
    '@media (max-width:700px){.tournav{padding:6px 0 8px}.tournav select{font-size:.85rem;padding:7px 24px 7px 8px}}';
  document.head.appendChild(st);
  var sub=document.getElementById('subnav');if(!sub)return;
  var bar=document.createElement('div');bar.className='wrap tournavrow';bar.style.background=getComputedStyle(sub).backgroundColor;
  var w=document.createElement('div');w.className='tournav';
  var s1=document.createElement('select');s1.setAttribute('aria-label','Region');
  s1.innerHTML='<option value="/tour/">All regions</option>'+T.map(function(r){return '<option value="'+r[0]+'"'+(reg&&reg[0]===r[0]?' selected':'')+'>'+r[1].replace(/&/g,'&amp;')+'</option>'}).join('');
  var s2=document.createElement('select');s2.setAttribute('aria-label','Stop');
  var h='<option value="">'+(reg?'Stops':'All stops')+'</option>';
  (reg?[reg]:T).forEach(function(r){h+='<optgroup label="'+r[1].replace(/"/g,'&quot;')+'">'+r[2].map(function(s){return '<option value="'+s[0]+'"'+(s[0]===p?' selected':'')+'>'+s[1].replace(/&/g,'&amp;')+'</option>'}).join('')+'</optgroup>'});
  s2.innerHTML=h;
  s1.addEventListener('change',function(){location.href=s1.value});
  s2.addEventListener('change',function(){if(s2.value)location.href=s2.value});
  w.appendChild(s1);w.appendChild(s2);bar.appendChild(w);sub.insertAdjacentElement('afterend',bar);
  function arrow(cls,q,sym){if(!q)return;var a=document.createElement('a');a.className='tourarrow '+cls;a.href=q[0];a.title=q[1];a.setAttribute('aria-label',(cls==='prev'?'Previous: ':'Next: ')+q[1]);a.innerHTML=sym;document.body.appendChild(a)}
  if(i>-1){arrow('prev',seq[i-1],'&#8249;');arrow('next',seq[i+1],'&#8250;')}
  var pg=document.querySelector('.pages');
  var sx=0,sy=0;if(pg){pg.addEventListener('touchstart',function(e){sx=e.touches[0].clientX;sy=e.touches[0].clientY},{passive:true});
    pg.addEventListener('touchend',function(e){var dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5&&i>-1){var q=seq[i+(dx<0?1:-1)];if(q)location.href=q[0]}},{passive:true})}
})();

/* Tours: each page reads as title, a large picture, then the description */
(function(){
  var p=location.pathname,m=p.match(/^\/tour\/([^\/]+)\/(?:([^\/]+)\/)?$/);if(!m)return;
  var COV={"/tour/negev/": "/img/c/neg.webp", "/tour/dead-sea/": "/img/c/dse.webp", "/tour/judea-and-samaria/": "/img/c/jus.webp", "/tour/galilee/": "/img/c/gal.webp", "/tour/golan-heights/": "/img/c/gol.webp", "/tour/mediterranean-coast/": "/img/c/med.webp", "/tour/tel-aviv-and-jaffa/": "/img/c/taj.webp", "/tour/judean-hills/": "/img/c/jhl.webp", "/tour/jerusalem/": "/img/c/jrs.webp", "/tour/southern-plain-shfela/": "/img/c/shf.webp"};
  var art=document.querySelector('main article');if(!art)return;
  var det=art.querySelector('details.txt'),ps=det?[].map.call(det.querySelectorAll('p'),function(x){return x.textContent.trim()}):[];
  var img,txt=[],sub='';
  if(m[2]){var s=art.querySelector('.pages img');if(!s)return;img=s.getAttribute('src').replace('/img/s/','/img/i/');
    sub=ps[1]||'';txt=ps.slice(2).filter(function(t){return !/^Glossary:/.test(t)})}
  else{img=COV[p];var h1=(art.querySelector('h1')||{}).textContent||'';var i=ps.indexOf(h1);var stops=[].map.call(art.querySelectorAll('.idlist a'),function(a){return a.textContent.trim()});
    for(var k=i+1;k<ps.length;k++){var t=ps[k];if(stops.indexOf(t)>-1||(t===t.toUpperCase()&&/[A-Z]/.test(t)))break;txt.push(t)}
    txt=[txt.join(' ').replace(/\s+/g,' ')]}
  if(!img)return;
  var st=document.createElement('style');st.textContent=
    'body .tourfig{margin:8px 0 14px;text-align:center}body .tourfig img{width:100%;max-width:900px;max-height:72vh;object-fit:cover;display:block;margin:0 auto;border-radius:0}'+
    'body .tourtxt{max-width:760px;margin:0 auto 18px;font:1.12rem/1.6 Georgia,serif;color:#222}body .tourtxt .sub{font-style:italic;color:#555;margin:0 0 .6em;font-size:1.15rem}'+
    'main article .pages,main article .crumb2,main article header .meta,main article details.txt{display:none!important}main article header.ih h1{margin-bottom:4px}';
  document.head.appendChild(st);
  var f=document.createElement('figure');f.className='tourfig';var im=document.createElement('img');im.src=img;im.alt=(art.querySelector('h1')||{}).textContent||'';f.appendChild(im);
  var d=document.createElement('div');d.className='tourtxt';d.innerHTML=(sub?'<p class="sub">'+sub.replace(/</g,'&lt;')+'</p>':'')+txt.map(function(t){return '<p>'+t.replace(/</g,'&lt;')+'</p>'}).join('');
  var hd=art.querySelector('header');(hd||art.firstChild).insertAdjacentElement(hd?'afterend':'beforebegin',f);f.insertAdjacentElement('afterend',d);
  var sx=0,sy=0;f.addEventListener('touchstart',function(e){sx=e.touches[0].clientX;sy=e.touches[0].clientY},{passive:true});
  f.addEventListener('touchend',function(e){var dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5){var a=document.querySelector('.tourarrow.'+(dx<0?'next':'prev'));if(a)location.href=a.href}},{passive:true});
})();

/* Second-level rows outside Timelines stay on one line on phones */
(function(){var st=document.createElement('style');st.textContent='header.top .subnav.sub2:not(.tl2):not(.tournavrow){background:#fff!important;border-bottom:1px solid #d6cbe4;padding-top:4px!important;padding-bottom:4px!important}header.top .subnav.sub2:not(.tl2) a{color:#4b2a7a!important;font-weight:600!important}header.top .subnav.sub2:not(.tl2) a.on,header.top .subnav.sub2:not(.tl2) a[aria-current]{color:#111!important;box-shadow:inset 0 -3px 0 #4b2a7a!important}'+'@media (max-width:700px){header.top .subnav.sub2:not(.tl2){flex-wrap:nowrap!important;justify-content:space-between!important;overflow:hidden;gap:0 4px!important}header.top .subnav.sub2:not(.tl2) a{padding:6px 2px!important;font-size:.84rem!important;white-space:nowrap;flex:none}}@media (max-width:360px){header.top .subnav.sub2:not(.tl2) a{font-size:.78rem!important}}';document.head.appendChild(st)})();
