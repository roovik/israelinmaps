(function(){
  var as=document.querySelector('aside.newsside');if(!as)return;
  var p=location.pathname,k='';
  function has(x){return p.indexOf(x)===0}
  if(has('/maps/')||has('/size/'))k='maps';else if(has('/tour/'))k='tour';else if(has('/timelines/'))k='timelines';
  else if(has('/charts/')||has('/rankings/')||has('/demographics/')||has('/tables/')||has('/top-ten/')||has('/population/'))k='charts';
  else if(has('/hot/'))k='hot';else if(has('/glossary/')||has('/g/'))k='glossary';else if(has('/about/')||has('/cite/')||has('/contact/')||has('/subscribe/')||has('/submit/')||has('/legal/')||has('/signin/')||has('/feed/'))k='about';
  else if(has('/sources/'))k='sources';else if(has('/views/')||has('/who/'))k='views';
  else if(has('/media/'))k='media';else if(has('/video/'))k='video';else if(has('/playlists/'))k='playlists';else if(has('/audio/'))k='audio';else if(has('/music/'))k='music';else if(has('/images/'))k='images';
  if(!k)return;
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  var CH={
    media:{t:'Media',keys:['video','playlists','audio','music','images']},
    nowlej:{t:'NOWlej',keys:['maps','tour','timelines','charts','hot','book','glossary']},
    about:{t:'About Us',keys:['about']},
    sources:{t:'Sources',keys:['sources']},
    views:{t:'Views',keys:['views']}};
  var chan=null;Object.keys(CH).forEach(function(c){if(CH[c].keys.indexOf(k)>-1)chan=c});if(k==='media')chan='media';
  var keys=chan?CH[chan].keys:[k],title=chan?CH[chan].t:'';
  var NOMULTI={sources:1,views:1,about:1};
  fetch('/asides.json?v=92828631').then(function(r){return r.json()}).then(function(A){
    var cur=p+location.hash,groups=[];
    /* One collapsible section per main area (Maps, Tours, Timelines...). Sub-groups such as the timeline eras become headings inside their section.
       Only one section is open at a time: the one for the page you are on. Opening another closes the rest. Lists never scroll on their own. */
    var LAB={tour:'Tours',maps:'Maps',hot:'Topics',book:'Book',video:'Video channels'},HUB={maps:'/maps/',tour:'/tour/',timelines:'/timelines/',charts:'/charts/',hot:'/hot/',book:'/about/'};
    var single=keys.length===1;
    keys.forEach(function(key){var s=A[key];if(!s)return;
      if(key==='glossary'){return}
      if(single||NOMULTI[key]){s.g.forEach(function(g){groups.push({key:key,h:s.g.length>1?g.h:(LAB[key]||s.t),u:g.u,i:g.i})});return}
      var items=[];
      if(s.g.length>1)s.g.forEach(function(g){items.push(['##',g.h,g.u]);items=items.concat(g.i||[])});else items=(s.g[0]&&s.g[0].i)||[];
      groups.push({key:key,h:LAB[key]||s.t,u:HUB[key]||(s.g[0]&&s.g[0].u)||'#',i:items})});
    if(!title&&A[k])title=A[k].t;
    if(chan==='nowlej'||k==='glossary')groups.push({key:'glossary',h:'A-Z',u:'/glossary/',i:null,lazy:1});
    groups.forEach(function(g){if(!g.i)return;var h=null;g.i.forEach(function(x){if(x[0]==='##'){h=x;h.n=0}else if(h&&x[2]!=='soon')h.n++})});
    var hit=groups.filter(function(g){return g.i&&g.i.some(function(x){return x[0]!=='##'&&(x[1]===p||x[1]===cur)})})[0]||groups.filter(function(g){return g.key===k})[0];
    if(hit)hit.open=1;
    function li(x){if(x[2]==='soon')return'<li class="soon">'+esc(x[0])+' <em>soon</em></li>';if(x[0]==='##')return'<li class="asub">'+(x[2]?'<a href="'+esc(x[2])+'">'+esc(x[1])+'</a>':esc(x[1]))+(x.n!=null?' <span class="cn">'+x.n+'</span>':'')+'</li>';return'<li><a href="'+esc(x[1])+'"'+(x[1]===p||x[1]===cur?' aria-current="page"':'')+'>'+esc(x[0])+'</a></li>'}
    var h='<style>.newsside .agrp .alist,.agrp.long .alist,.alist.long{max-height:none!important;overflow:visible!important;padding-right:0}.newsside .alist li.asub{font-weight:700;padding-top:10px;color:var(--mut)}.newsside .alist li.asub a{color:inherit}</style>'+
      '<div class="asect"><h2>'+esc(title)+'</h2>'+groups.map(function(g){
      return'<details class="agrp'+(g.lazy?' long':'')+'"'+(g.open?' open':'')+(g.lazy?' data-lazy="1"':'')+'><summary><span class="pm" aria-hidden="true"></span><a href="'+esc(g.u)+'">'+esc(g.h)+'</a> <span class="cn">'+(g.i?g.i.filter(function(x){return x[0]!=='##'&&x[2]!=='soon'}).length:'')+'</span></summary><ul class="alist">'+(g.i?g.i.map(li).join(''):'')+'</ul></details>'}).join('')+'</div>';
    var d=document.createElement('div');d.innerHTML=h;as.classList.add('sect');
    if(/^(media|video|playlists|audio|music|images|maps|tour|timelines|charts|hot|glossary|book|about|sources|views)$/.test(k)){var np=as.closest('.newspage'),lc=np&&np.querySelector(':scope>.newsleftcol');if(np&&lc){np.classList.add('noleft');lc.hidden=true}if(k==='about')document.body.style.setProperty('--sec','#56627a')}
    var sec=d.querySelector('.asect');as.insertBefore(sec,as.firstChild);as.insertBefore(d.querySelector('style'),sec);
    var gd=as.querySelector('details[data-lazy]');
    if(gd){fetch('/glossary.json').then(function(r){return r.json()}).then(function(G){
      var L=G.slice().sort(function(a,b){return String(a[0]).localeCompare(String(b[0]))});
      gd.querySelector('.cn').textContent=L.length;
      gd.querySelector('ul').innerHTML=L.map(function(g){return'<li><a href="/g/'+esc(g[1])+'/"'+(p==='/g/'+g[1]+'/'?' aria-current="page"':'')+'>'+esc(g[0])+'</a></li>'}).join('');
      if(k==='glossary'&&/^\/g\//.test(p))gd.open=true}).catch(function(){})}
    /* accordion: opening one section closes the others */
    [].forEach.call(as.querySelectorAll('details.agrp'),function(dt){dt.addEventListener('toggle',function(){if(!dt.open)return;[].forEach.call(as.querySelectorAll('details.agrp'),function(o){if(o!==dt&&o.open)o.open=false})})});
    /* clicking the +/- toggles, the title link still navigates */
    [].forEach.call(as.querySelectorAll('details.agrp>summary'),function(sm){sm.addEventListener('click',function(e){if(e.target.closest('a'))return})});
  }).catch(function(){});
})();
