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
    swap(/^\/timelines\/002\//,[['/timelines/002a/kings-and-prophets/','Kings and Prophets'],['/timelines/002b/exile-and-return/','Exile and Return']]);
    swap(/^\/timelines\/004\//,[['/timelines/004a/early-christian-rule/','Christian'],['/timelines/004b/early-muslim-rule/','Muslim'],['/timelines/004c/the-crusader-kingdom/','Crusader'],['/timelines/004d/mamluk-rule/','Mamluk'],['/timelines/004e/ottoman-rule/','Ottoman']]);
    function mixc(a,b,t){var x=parseInt(a.slice(1),16),y=parseInt(b.slice(1),16),o='#';for(var s=16;s>=0;s-=8){var v=Math.round(((x>>s)&255)*(1-t)+((y>>s)&255)*t);o+=(v<16?'0':'')+v.toString(16)}return o}
    function ramp(ys,a,b){var r=[];for(var k=0;k<ys.length-1;k++)r.push([ys[k],ys[k+1],mixc(a,b,ys.length>2?k/(ys.length-2):0)]);return r}
    function steps(y0,y1,d){var r=[y0];for(var y=Math.floor(y0/d)*d+d;y<y1;y+=d)r.push(y);r.push(y1);return r}
    function alt(ys,a,b){return ys.slice(1).map(function(y,k){return [ys[k],y,k%2?b:a]})}
    var ERAS=[
      {r:'Patriarchs to Saul, 2000 to 1000 BCE',y0:-2000,y1:-1000,from:1,to:1,segs:[[-2000,-1700,'#d6ae86','Patriarchal age'],[-1700,-1200,'#ebc79c','Egypt and the Exodus'],[-1200,-1020,'#f3dd96','Judges and tribal Israel'],[-1020,-1000,'#f8efbe','Saul']]},
      {r:'David to Bar Kokhba, 1000 BCE to 135 CE',y0:-1000,y1:135,from:2,to:3,segs:[[-1000,-970,'#f4b4b4','David'],[-970,-930,'#f7c4c0','Solomon'],[-930,-722,'#f7d3bd','Divided kingdoms'],[-722,-586,'#f1c3db','Judah survives'],[-586,-539,'#c9cbe6','Babylonian exile'],[-539,-332,'#c4e5e0','Persian rule'],[-332,-301,'#d9e8f8','Alexander and successors'],[-301,-200,'#c6dcf4','Ptolemaic rule'],[-200,-167,'#b3cfee','Seleucid rule'],[-167,-140,'#f7e6a6','Maccabean revolt'],[-140,-63,'#f0d888','Hasmonean independence'],[-63,-37,'#ecc4c7','Roman supremacy'],[-37,-4,'#e5b2b8','Herod the Great'],[-4,66,'#ecc4c7','Herodian rulers and Roman governors'],[66,74,'#d9939c','Great Jewish Revolt'],[74,132,'#e8bcc1','Post-Temple Roman Judea'],[132,135,'#d9939c','Bar Kokhba revolt']]},
      {r:'135 to 1918',y0:135,y1:1918,from:4,to:8,segs:[[135,638,'#d8ecca','Early Christian'],[638,1099,'#c2e0bf','Early Muslim'],[1099,1291,'#e2efc2','Crusader'],[1291,1516,'#cbe6d4','Mamluk'],[1516,1918,'#b3d8b2','Ottoman']]},
      {r:'British Mandate, 1918 to 1948',y0:1918,y1:1948,from:9,to:11,segs:[[1918,1930,'#d6e6f6','1920s'],[1930,1940,'#bcd5ef','1930s'],[1940,1948,'#a3c4e8','1940s']]},
      {r:'1948 to 1990',y0:1948,y1:1990,from:12,to:15,segs:[[1948,1960,'#ece2f8','1950s'],[1960,1970,'#ddd0f3','1960s'],[1970,1980,'#cfbfee','1970s'],[1980,1990,'#c0aee8','1980s']]},
      {r:'1990 to today',y0:1990,y1:2030,from:16,to:99,segs:[[1990,2000,'#d5efec','1990s'],[2000,2010,'#c1e6e2','2000s'],[2010,2020,'#acdcd7','2010s'],[2020,2030,'#97d1cb','2020s']]}];
    var MID={1:-1500,2:-900,2.1:-940,2.2:-450,3:-250,4:400,4.1:400,4.2:900,4.3:1200,4.4:1400,4.5:1650,5:1840,6:1890,7:1905,8:1915};
    var SPLIT=66;  /* percent of the ruler for 2000 BCE to 1900; the rest is the zoom from 1900 to today */
    function X(y){return y<=1900?(y+2000)/3900*SPLIT:SPLIT+(y-1900)/130*(100-SPLIT)}
    function colorAt(e,y){for(var k=0;k<e.segs.length;k++)if(y<e.segs[k][1])return e.segs[k][2];return e.segs[e.segs.length-1][2]}
    function num(h){var m=/^\/timelines\/(\d{3})([a-e]?)\//.exec(h||'');return m?+m[1]+(m[2]?(m[2].charCodeAt(0)-96)/10:0):0}
    function eraOf(n){for(var i=0;i<ERAS.length;i++)if(n>=ERAS[i].from&&n<=ERAS[i].to)return i;return -1}
    if(!document.getElementById('tl-era-css')){var st=document.createElement('style');st.id='tl-era-css';st.textContent=
      '.subnav.sub2.tl2{display:block;padding:8px 16px 10px}'+
      '.tl-eras{position:relative;max-width:900px;margin:0 auto;height:52px;user-select:none}'+'.tl-eras .tb{position:absolute;top:0;height:26px;border:0;padding:0;margin:0;cursor:pointer;background:var(--c);transition:filter .15s}'+'.tl-eras .tb:hover{filter:saturate(1.4) brightness(.97)}'+'.tl-eras .tb[aria-selected=true]{filter:saturate(2.2) brightness(.9);box-shadow:inset 0 3px 0 var(--sc,#6a3d9a)}'+'.tl-eras .tb:focus-visible{outline:2px solid var(--sc,#6a3d9a);outline-offset:1px;z-index:2}'+'.tl-eras .base{position:absolute;left:0;right:0;top:26px;height:1.5px;background:var(--sc,#6a3d9a);pointer-events:none}'+'.tl-eras .tk{position:absolute;top:26px;width:1px;height:4px;background:color-mix(in srgb,var(--sc,#6a3d9a) 55%,#fff);pointer-events:none}'+'.tl-eras .tk.mj{height:9px;width:1.5px;background:var(--sc,#6a3d9a)}'+'.tl-eras .lb{position:absolute;top:37px;transform:translateX(-50%);font:600 .7rem/1 system-ui,-apple-system,sans-serif;color:var(--sc,#6a3d9a);white-space:nowrap;pointer-events:none}'+'.tl-eras .lb.st{transform:none}.tl-eras .lb.en{transform:translateX(-100%)}'+'.tl-eras .brk{position:absolute;top:0;width:3px;height:26px;margin-left:-1.5px;background:#fff;opacity:.9;transform:skewX(-12deg);pointer-events:none;z-index:1}'+'.tl-eras .lb i,.tl-eras .lb b{display:none}'+'.tl-list{display:flex;flex-wrap:wrap;justify-content:center;gap:2px 4px;margin-top:8px}.tl-list[hidden]{display:none}'+
      '.subnav.sub2.tl2 .tl-list a{flex:none;border-radius:0!important;color:#3a2a4f!important;transition:filter .15s}'+'.subnav.sub2.tl2 .tl-list a:hover{filter:saturate(1.4) brightness(.97)!important}'+'.subnav.sub2.tl2 .tl-list a.on{filter:saturate(2.2) brightness(.9)!important;box-shadow:inset 0 3px 0 var(--sc,#6a3d9a)!important}'+
      '@media (max-width:700px){.tl-eras .lb{font-size:.64rem}.tl-eras .lb b{display:none}}'+
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
      for(var d=1910;d<2030;d+=10)if(d!==1990)h+='<span class="tk" style="left:'+X(d)+'%"></span>';
      [[-2000,'2000<b> BCE</b>','st'],[-1000,'1000<i> BCE</i>',''],[0,'0',''],[1000,'1000',''],[1900,'',''],[1918,'1918',''],[1948,'1948',''],[1990,'1990','']].forEach(function(m){h+='<span class="tk mj" style="left:'+X(m[0])+'%"></span><span class="lb '+m[2]+'" style="left:'+X(m[0])+'%">'+m[1]+'</span>'});
      bar.insertAdjacentHTML('beforeend',h)})();
    links.forEach(function(a){var h=a.getAttribute('href');if(/^\/timelines\/001\//.test(h))a.textContent='Patriarchs and Judges';if(/^\/timelines\/003\//.test(h))a.textContent='Greeks, Hasmoneans, Romans'});
    links.forEach(function(a){if(a.textContent==='Zionism Takes Shape')a.textContent='Early Zionism'});
    links=links.filter(function(a){if(/^\/timelines\/005\//.test(a.getAttribute('href'))){a.remove();return false}return true});
    links.forEach(function(a){a.setAttribute('data-tl','1')});
    var sel=-1;
    var SUB={6:1,7:1,8:1},OTTO=[4.5,5,6,7,8];
    function show(i){sel=i;btns.forEach(function(b,j){b.setAttribute('aria-selected',j===i?'true':'false')});
      list.innerHTML='';list2.innerHTML='';var k=0;links.forEach(function(a){var n=num(a.getAttribute('href'));if(eraOf(n)!==i)return;var c=colorAt(ERAS[i],MID[n]!=null?MID[n]:1925+10*(n-9));
        if(i===2&&SUB[n]){a.style.setProperty('background',mixc(c,'#ffffff',.18+.14*k),'important');k++;list2.appendChild(a)}else{a.style.setProperty('background',c,'important');list.appendChild(a)}});
      list.hidden=false;list2.hidden=!(i===2&&OTTO.indexOf(num(location.pathname))>-1);mark2()}
    function mark2(){var cur=location.pathname;if(/^\/timelines\/005\//.test(cur))cur='/timelines/004e/ottoman-rule/';links.forEach(function(a){a.className=a.getAttribute('href')===cur?'on':''})}
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
