(function(){
  var bar=document.getElementById('subnav');if(!bar)return;
  var sec=bar.getAttribute('data-trend');
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function mark(){var cur=location.pathname+location.hash;[].forEach.call(document.querySelectorAll('.subnav a'),function(a){var h=a.getAttribute('href');a.className=(h===cur||(!location.hash&&h===location.pathname)||(h==='/who/'&&/^\/who\//.test(location.pathname)))?'on':''})}
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
