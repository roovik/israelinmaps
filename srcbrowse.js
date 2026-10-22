/* Sources pages: choose a source by its icon, then see its Articles, Videos and Podcasts. */
(function(){
  var root=document.getElementById('sb');if(!root)return;
  var cfg=JSON.parse(document.getElementById('sb-data').textContent),items=cfg.items,by={};items.forEach(function(x){by[x.id]=x});
  var PATH=location.pathname,KIND=PATH.indexOf('/influencers')>-1?'influencers':PATH.indexOf('/organizations')>-1?'organizations':'publications';var ALL={id:'all',name:'All '+KIND,profile:'/sources/',bio:''};by.all=ALL;
  var pick=document.getElementById('sb-pick'),head=document.getElementById('sb-head'),tabs=document.getElementById('sb-tabs'),out=document.getElementById('sb-out');
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function when(d){if(!d)return'';var t=new Date(d);if(isNaN(t))return'';return t.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}
  function jget(u){return fetch(u).then(function(r){if(!r.ok)throw 0;return r.json()})}

  var ctl=document.createElement('form');ctl.className='ffilter sbfilter';ctl.setAttribute('role','search');
  ctl.innerHTML='<select id="sb-sel" aria-label="Source"><option value="all">All '+KIND+' ('+items.length+')</option>'+items.map(function(x){return'<option value="'+esc(x.id)+'">'+esc(x.name)+'</option>'}).join('')+'</select><select id="sb-sort" aria-label="Sort"><option value="new">Newest</option><option value="old">Oldest</option><option value="az">A-Z</option><option value="rand">Random</option></select><input id="sb-q" type="search" placeholder="Keyword" aria-label="Keyword"><button type="submit">Filter</button>';
  pick.parentNode.insertBefore(ctl,pick);
  var DOMS={toi:'timesofisrael.com',jpost:'jpost.com',ynet:'ynetnews.com',haaretz:'haaretz.com',jns:'jns.org',israelhayom:'israelhayom.com',jta:'jta.org',inn:'israelnationalnews.com',i24:'i24news.tv',kan:'kan.org.il',globes:'globes.co.il',calcalist:'calcalistech.com',tablet:'tabletmag.com',mef:'meforum.org',ji:'jewishinsider.com'};
  function lbl(x){return x.id==='inn'?'INN':x.name.replace(/^The /,'').replace('Jerusalem Post','JPost').replace(' Daily Briefing',' Briefing')}
  function ini(n){var w=n.replace(/^The /,'').split(/\s+/).filter(function(y){return/^[A-Za-z]/.test(y)&&['of','the','with'].indexOf(y.toLowerCase())<0});return((w[0]||'?')[0]+(w.length>1?w[1][0]:'')).toUpperCase()}
  items.forEach(function(x,i){if(pick.querySelector('[data-s="'+x.id+'"]'))return;var a=document.createElement('a');a.href='#s='+x.id;a.setAttribute('data-s',x.id);
    a.innerHTML='<span class="apic org c'+(i%6)+'"'+(x.kind==='pub'&&DOMS[x.id]?' data-d="'+DOMS[x.id]+'"':x.kind==='pub'?'':' data-who="'+esc(x.id)+'"')+'><span class="ini">'+esc(ini(x.name))+'</span></span><span class="apn">'+esc(lbl(x))+'</span>';pick.appendChild(a)});
  var selEl=document.getElementById('sb-sel'),sortEl=document.getElementById('sb-sort'),qEl=document.getElementById('sb-q'),last=null;
  function applyFS(arr,tf,df){var q=qEl.value.trim().toLowerCase(),s=sortEl.value;arr=arr.filter(function(x){return!q||(tf(x)+' '+(x.s||x.n||'')).toLowerCase().indexOf(q)>-1});
    if(s==='new')arr=arr.slice().sort(function(a,b){return new Date(df(b)||0)-new Date(df(a)||0)});else if(s==='old')arr=arr.slice().sort(function(a,b){return new Date(df(a)||0)-new Date(df(b)||0)});else if(s==='az')arr=arr.slice().sort(function(a,b){return String(tf(a)).localeCompare(String(tf(b)))});
    else if(s==='rand'){arr=arr.slice();for(var i=arr.length-1;i>0;i--){var k=Math.floor(Math.random()*(i+1)),t=arr[i];arr[i]=arr[k];arr[k]=t}}return arr}
  // website icons for publications
  [].forEach.call(pick.querySelectorAll('.apic[data-d]'),function(pic){var im=new Image();im.alt='';im.referrerPolicy='no-referrer';im.onload=function(){if(im.naturalWidth>16){pic.textContent='';pic.appendChild(im)}};im.src='https://www.google.com/s2/favicons?sz=128&domain='+pic.getAttribute('data-d')});
  var newsP=null,viewsP=null,vidP=null,cache={};
  function voiceData(it){return jget('/api/voice?id='+encodeURIComponent(it.id)).then(function(d){
    var a=(d.articles||[]).map(function(x){return{t:x.t,u:x.k?'/news/item/'+x.k+'/':x.u,ext:!x.k,d:x.d,s:d.name,i:x.i,o:x.u}});
    var n=(d.news||[]).map(function(x){return{t:x.t,u:x.u,ext:true,d:x.d,s:x.src||'News',o:x.u}});
    return{articles:a.concat(n),videos:d.videos||[],podcasts:d.podcasts||[]}})}
  function pubData(it){
    newsP=newsP||jget('/api/news?v=2');viewsP=viewsP||jget('/api/news?views=1&v=2');if(it.video)vidP=vidP||jget('/api/videos');
    var none=function(){return null};
    return Promise.all([newsP.catch(none),viewsP.catch(none),it.video?vidP.catch(none):Promise.resolve(null),it.show?jget('/api/voice?id='+encodeURIComponent(it.show)).catch(none):Promise.resolve(null)]).then(function(r){
      var cut=Date.now()-30*864e5;
      function sel(d,label){return((d&&d.items)||[]).filter(function(i){return i.s===it.id&&(!i.d||new Date(i.d)>cut)}).map(function(i){return{t:i.t,u:i.k?'/news/item/'+i.k+'/?s='+encodeURIComponent(i.s)+(i.ch?'&c='+encodeURIComponent(i.ch):''):i.u,ext:!i.k,d:i.d,s:label,i:i.i,o:i.u}})}
      var arts=sel(r[0],'News').concat(sel(r[1],'Views')).sort(function(a,b){return new Date(b.d||0)-new Date(a.d||0)});
      var vids=[];if(r[2]&&r[2].channels){var c=r[2].channels.filter(function(c){return String(c.key).toLowerCase()===it.video})[0];if(c)vids=c.videos||[]}
      return{articles:arts,videos:vids,podcasts:r[3]?(r[3].podcasts||[]):[]}})}
  function dataAll(upd){var res=[],q=items.slice(),active=0,total=items.length,done=0;
    function merge(){var A=[],V=[],P=[];res.forEach(function(r){r.d.articles.forEach(function(a){A.push(Object.assign({},a,{s:a.s&&a.s!==r.it.id?a.s:r.it.name}))});r.d.videos.forEach(function(v){V.push(Object.assign({},v,{n:v.n||r.it.name}))});r.d.podcasts.forEach(function(p){P.push(Object.assign({},p,{n:r.it.name}))})});return{articles:A,videos:V,podcasts:P,partial:done<total}}
    return new Promise(function(resolve){function next(){while(active<5&&q.length){(function(it){active++;data(it).then(function(d){res.push({it:it,d:d})}).catch(function(){}).then(function(){active--;done++;upd(merge());if(done>=total)resolve(merge());else next()})})(q.shift())}}next()})}
  function data(it){if(!cache[it.id])cache[it.id]=(it.kind==='pub'?pubData(it):voiceData(it)).catch(function(){return{articles:[],videos:[],podcasts:[],failed:true}});return cache[it.id]}
  function parse(){var h=location.hash,s=/[#&]s=([\w-]+)/.exec(h),t=/[&#]t=(articles|videos|podcasts)/.exec(h);return{s:s&&by[s[1]]?s[1]:'all',t:t?t[1]:''}}
  function player(){var p=document.getElementById('sb-player');return p}
  function render(it,d,t){
    var A=applyFS(d.articles||[],function(x){return x.t},function(x){return x.d}),V=applyFS(d.videos||[],function(x){return x.t},function(x){return x.d}),P=applyFS(d.podcasts||[],function(x){return x.t},function(x){return x.d}),html='';last=[it,d,t];
    head.innerHTML='<h2 class="sbname">'+esc(it.name)+'</h2>'+(it.id==='all'?'':'<a class="small" href="#s=all" data-back="1">All '+KIND+'</a> · <a class="small" href="'+esc(it.profile)+'">Full profile</a>')+(it.bio?'<p class="sbbio">'+esc(it.bio)+'</p>':'');
    var base='#s='+it.id,tl=[['','All']];if(A.length)tl.push(['articles','Articles']);if(V.length)tl.push(['videos','Videos']);if(P.length||it.pod)tl.push(['podcasts','Podcasts']);
    tabs.innerHTML=tl.map(function(x){return'<a href="'+base+(x[0]?'&t='+x[0]:'')+'"'+(x[0]===t?' aria-current="page"':'')+'>'+x[1]+'</a>'}).join('');tabs.hidden=tl.length<2;
    if(!t||t==='articles')if(A.length)html+='<section id="m-articles"><h2>Articles</h2><ul class="vlist2 sbarts">'+A.slice(0,t?40:12).map(function(a){var h;try{h=new URL(a.o||a.u,location.href).hostname}catch(e){h=''}var im=a.i||(h&&h!==location.hostname?'https://www.google.com/s2/favicons?sz=128&domain='+h:'');var th=im?'<a class="athl'+(a.i?'':' fav')+'" href="'+esc(a.u)+'"'+(a.ext?' rel="noopener" target="_blank"':'')+' tabindex="-1"><img class="athumb" src="'+esc(im)+'" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.parentNode.remove()"></a>':'';return'<li class="'+(th?'hasimg':'')+'">'+th+'<div><a href="'+esc(a.u)+'"'+(a.ext?' rel="noopener" target="_blank"':'')+'><b>'+esc(a.t)+'</b></a><span class="wm">'+esc(a.s||'')+(a.d?' · '+when(a.d):'')+'</span></div></li>'}).join('')+'</ul></section>';
    if(!t||t==='videos')if(V.length)html+='<section id="m-videos"><h2>Videos</h2><div class="vtop" id="sb-player" hidden></div><ul class="vclips">'+V.slice(0,t?30:8).map(function(x){return'<li><button type="button" class="vclip" data-v="'+esc(x.v)+'"><img src="https://i.ytimg.com/vi/'+esc(x.v)+'/mqdefault.jpg" alt="" width="320" height="180" loading="lazy"><span><b>'+esc(x.t)+'</b><i>'+esc(x.n||it.name)+(x.d?' · '+when(x.d):'')+'</i></span></button></li>'}).join('')+'</ul></section>';
    if(!t||t==='podcasts')if(P.length)html+='<section id="m-podcasts"><h2>Podcasts</h2><ul class="vlist2">'+P.slice(0,t?30:8).map(function(a){return'<li><div><a href="'+esc(a.u)+'" rel="noopener" target="_blank"><b>'+esc(a.t)+'</b></a><span class="wm">'+esc(a.n||it.name)+(a.d?' · '+when(a.d):'')+'</span>'+(a.a?'<audio controls preload="none" src="'+esc(a.a)+'"></audio>':'')+'</div></li>'}).join('')+'</ul></section>';
    if((!t||t==='podcasts')&&!P.length&&it.pod)html+='<section id="m-podcasts"><h2>Podcasts</h2><p>'+esc(it.name)+' has a podcast. Episodes could not be loaded just now. Please try again soon.</p></section>';
    if(!html)html='<p>'+(d.failed?'This source could not load just now. Please try again soon.':'No recent articles, videos or podcasts from this source were found. Check back soon.')+'</p>';
    out.innerHTML=html}
  var seq=0;
  function showAll(){last=null;pick.hidden=false;tabs.hidden=true;out.innerHTML='';var q=qEl.value.trim().toLowerCase(),n=0,s=sortEl.value,as=[].slice.call(pick.children);
    as.sort(function(a,b){var x=by[a.getAttribute('data-s')],y=by[b.getAttribute('data-s')];if(!x||!y)return 0;return s==='old'?0:lbl(x).toLowerCase().localeCompare(lbl(y).toLowerCase())}).forEach(function(a){pick.appendChild(a)});
    as.forEach(function(a){var it=by[a.getAttribute('data-s')];var ok=!q||(it&&(it.name+' '+(it.bio||'')).toLowerCase().indexOf(q)>-1);a.hidden=!ok;if(ok)n++});
    head.innerHTML='<h2 class="sbname">'+esc(ALL.name)+'</h2><p class="small">'+n+' shown. Choose one to see its articles, videos and podcasts.</p>'}
  function route(sc){var r=parse(),it=by[r.s],my=++seq;
    [].forEach.call(pick.children,function(a){var on=a.getAttribute('data-s')===r.s;if(on)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current')});
    selEl.value=r.s;if(r.s==='all'){showAll();return}
    out.innerHTML='<p>Loading.</p>';
    if(it.id==='all'){showAll();return}
    pick.hidden=true;
    data(it).then(function(d){if(my!==seq)return;render(it,d,r.t)})}
  selEl.addEventListener('change',function(){var s=selEl.value;try{history.replaceState(null,'','#s='+s)}catch(x){location.hash='s='+s}route(true)});
  sortEl.addEventListener('change',function(){if(last)render(last[0],last[1],last[2]);else if(selEl.value==='all')showAll()});
  ctl.addEventListener('submit',function(e){e.preventDefault();if(last)render(last[0],last[1],last[2]);else if(selEl.value==='all')showAll()});qEl.addEventListener('input',function(){if(last)render(last[0],last[1],last[2]);else if(selEl.value==='all')showAll()});
  head.addEventListener('click',function(e){var a=e.target.closest('[data-back]');if(!a)return;e.preventDefault();try{history.replaceState(null,'','#s=all')}catch(x){}route(true)});
  out.addEventListener('click',function(e){var b=e.target.closest('.vclip');if(!b)return;var p=player();p.innerHTML='<iframe src="https://www.youtube-nocookie.com/embed/'+encodeURIComponent(b.getAttribute('data-v'))+'?rel=0&autoplay=1&mute=1&playsinline=1" title="Video player" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen loading="lazy"></iframe>';p.hidden=false;p.scrollIntoView({behavior:'smooth',block:'center'})});
  pick.addEventListener('click',function(e){var a=e.target.closest('a');if(!a)return;e.preventDefault();var s=a.getAttribute('data-s');try{history.replaceState(null,'','#s='+s)}catch(x){location.hash='s='+s}route(true)});
  window.addEventListener('hashchange',function(){route(true)});route(/[#&]s=/.test(location.hash));
})();
