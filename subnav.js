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
    var ERAS=[{r:'2000 to 1000 BCE',y0:-2000,y1:-1000,from:1,to:1,c:'#f4e4c1'},{r:'1000 BCE to 100 CE',y0:-1000,y1:100,from:2,to:3,c:'#f7d4d4'},{r:'100 to 1920',y0:100,y1:1920,from:4,to:8,c:'#d5ead2'},{r:'1920s to 1960s',y0:1920,y1:1970,from:9,to:13,c:'#d2e3f5',dec:1},{r:'1970s to today',y0:1970,y1:2030,from:14,to:99,c:'#e4d8f4',dec:1}];
    var SPLIT=66;  /* percent of the ruler for 2000 BCE to 1900; the rest is the zoom from 1900 to today */
    function X(y){return y<=1900?(y+2000)/3900*SPLIT:SPLIT+(y-1900)/130*(100-SPLIT)}
    function shade(e,k){return 'color-mix(in srgb,color-mix(in srgb,'+e.c+','+(k%2?'#fff 30%':'#000 0%')+'),#000 '+(k*1.6).toFixed(1)+'%)'}
    function num(h){var m=/^\/timelines\/(\d{3})\//.exec(h||'');return m?+m[1]:0}
    function eraOf(n){for(var i=0;i<ERAS.length;i++)if(n>=ERAS[i].from&&n<=ERAS[i].to)return i;return -1}
    if(!document.getElementById('tl-era-css')){var st=document.createElement('style');st.id='tl-era-css';st.textContent=
      '.subnav.sub2.tl2{display:block;padding:8px 16px 10px}'+
      '.tl-eras{position:relative;max-width:900px;margin:0 auto;height:52px;user-select:none}'+'.tl-eras .tb{position:absolute;top:0;height:26px;border:0;padding:0;margin:0;cursor:pointer;background:var(--c);transition:filter .15s}'+'.tl-eras .tb:hover{filter:saturate(1.4) brightness(.97)}'+'.tl-eras .tb[aria-selected=true]{filter:saturate(2.2) brightness(.9);box-shadow:inset 0 3px 0 var(--sc,#6a3d9a)}'+'.tl-eras .tb:focus-visible{outline:2px solid var(--sc,#6a3d9a);outline-offset:1px;z-index:2}'+'.tl-eras .base{position:absolute;left:0;right:0;top:26px;height:1.5px;background:var(--sc,#6a3d9a);pointer-events:none}'+'.tl-eras .tk{position:absolute;top:26px;width:1px;height:4px;background:color-mix(in srgb,var(--sc,#6a3d9a) 55%,#fff);pointer-events:none}'+'.tl-eras .tk.mj{height:9px;width:1.5px;background:var(--sc,#6a3d9a)}'+'.tl-eras .lb{position:absolute;top:37px;transform:translateX(-50%);font:600 .7rem/1 system-ui,-apple-system,sans-serif;color:var(--sc,#6a3d9a);white-space:nowrap;pointer-events:none}'+'.tl-eras .lb.st{transform:none}.tl-eras .lb.en{transform:translateX(-100%)}'+'.tl-eras .brk{position:absolute;top:0;width:3px;height:26px;margin-left:-1.5px;background:#fff;opacity:.9;transform:skewX(-12deg);pointer-events:none;z-index:1}'+'.tl-eras .lb i{display:none}.tl-eras .lb b{font-weight:inherit}'+'.tl-list{display:flex;flex-wrap:wrap;justify-content:center;gap:2px 4px;margin-top:8px}.tl-list[hidden]{display:none}'+
      '.subnav.sub2.tl2 .tl-list a{flex:none;border-radius:0!important;color:#3a2a4f!important;transition:filter .15s}'+'.subnav.sub2.tl2 .tl-list a:hover{filter:saturate(1.4) brightness(.97)!important}'+'.subnav.sub2.tl2 .tl-list a.on{filter:saturate(2.2) brightness(.9)!important;box-shadow:inset 0 3px 0 var(--sc,#6a3d9a)!important}'+
      '@media (max-width:700px){.tl-eras .lb{font-size:.64rem}.tl-eras .lb b{display:none}}'+
      '@media (max-width:380px){header.top .subnav.sub2.tl2 .tl-list a{padding:5px 2px!important;font-size:.74rem!important}.tl-eras .lb{font-size:.56rem}.tl-eras .lb.ce{display:none}}'+
      '@media (max-width:700px){.subnav.sub2.tl2{padding:8px 8px 8px}.tl-list{gap:0 2px}header.top .subnav.sub2.tl2 .tl-list a{padding:5px 4px!important;font-size:.8rem!important}.tl-list{justify-content:space-between!important}}';
      document.head.appendChild(st)}
    row.classList.add('tl2');row.innerHTML='';
    var bar=document.createElement('div');bar.className='tl-eras';bar.setAttribute('role','tablist');bar.setAttribute('aria-label','Timeline eras');
    var list=document.createElement('div');list.className='tl-list';list.hidden=true;list.setAttribute('role','tabpanel');
    row.appendChild(bar);row.appendChild(list);
    var btns=ERAS.map(function(e,i){var b=document.createElement('button');b.type='button';b.className='tb';b.setAttribute('role','tab');b.title=e.r;b.setAttribute('aria-label',e.r);b.setAttribute('aria-selected','false');
      b.style.left=X(e.y0)+'%';b.style.width=(X(e.y1)-X(e.y0))+'%';b.style.setProperty('--c',e.c);if(e.dec){var n=(e.y1-e.y0)/10,g=[];for(var k=0;k<n;k++)g.push(shade(e,k)+' '+(k*100/n)+'% '+((k+1)*100/n)+'%');b.style.background='linear-gradient(90deg,'+g.join(',')+')'}
      b.addEventListener('click',function(){show(i);var first=links.filter(function(a){return eraOf(num(a.getAttribute('href')))===i})[0];if(!first)return;var u=first.getAttribute('href');if(eraOf(num(location.pathname))===i)return;if(window.__tlLoad)window.__tlLoad(u);else location.href=u});bar.appendChild(b);return b});
    (function(){var h='<span class="base"></span>';
      for(var y=-1900;y<1900;y+=100)if(y%1000)h+='<span class="tk" style="left:'+X(y)+'%"></span>';
      for(var d=1910;d<2030;d+=10)if(d!==1920&&d!==1970&&d!==2000)h+='<span class="tk" style="left:'+X(d)+'%"></span>';
      [[-2000,'2000<b> BCE</b>','st'],[-1000,'1000<i> BCE</i>',''],[0,'0',''],[1000,'1000',''],[1900,'',''],[1920,'1920',''],[1970,'1970',''],[2000,'2000','ce']].forEach(function(m){h+='<span class="tk mj" style="left:'+X(m[0])+'%"></span><span class="lb '+m[2]+'" style="left:'+X(m[0])+'%">'+m[1]+'</span>'});
      h+='<span class="brk" style="left:'+SPLIT+'%"></span>';bar.insertAdjacentHTML('beforeend',h)})();
    links.forEach(function(a){if(a.textContent==='Zionism Takes Shape')a.textContent='Zionism'});
    links.forEach(function(a){a.setAttribute('data-tl','1')});
    var sel=-1;
    function show(i){sel=i;btns.forEach(function(b,j){b.setAttribute('aria-selected',j===i?'true':'false')});
      list.innerHTML='';var k=0;links.forEach(function(a){if(eraOf(num(a.getAttribute('href')))===i){a.style.setProperty('background',ERAS[i].dec?shade(ERAS[i],k):ERAS[i].c,'important');k++;list.appendChild(a)}});list.hidden=false;mark2()}
    function mark2(){var cur=location.pathname;links.forEach(function(a){a.className=a.getAttribute('href')===cur?'on':''})}
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
