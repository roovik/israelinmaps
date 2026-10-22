(function(){
  var wg=document.getElementById('wgrid');if(wg){var wq=document.getElementById('wq'),ch=document.getElementById('wchips'),pg=document.getElementById('pubgrid'),g0='';function nm(s){return s.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/['\u2019]/g,'')}
    function fl(){var pub=g0==='pub',t=nm(wq.value).trim(),n=0;wg.hidden=pub;if(pg)pg.hidden=!pub;wq.hidden=pub;[].forEach.call(wg.children,function(c){var ok=(!g0||pub||c.getAttribute('data-g')===g0)&&(!t||t.split(/\s+/).every(function(w){return c.getAttribute('data-h').indexOf(w)>-1}));c.hidden=!ok;if(ok)n++});document.getElementById('wnone').hidden=pub||n>0;[].forEach.call(ch.children,function(x){x.setAttribute('aria-pressed',pub?x.getAttribute('data-g')==='pub':x.getAttribute('data-g')!=='pub')})}
    function fh(){var m=/[#&]g=([a-z]+)/.exec(location.hash);g0=m?m[1]:'';fl()}
    window.addEventListener('hashchange',fh);fh();wq.addEventListener('input',fl);
    ch.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;g0=b.getAttribute('data-g');try{history.replaceState(null,'',g0?'#g='+g0:location.pathname)}catch(x){}fl()});
    [].forEach.call(document.querySelectorAll('.pubgrid .apic[data-d]'),function(pic){var im=new Image();im.alt='';im.referrerPolicy='no-referrer';im.onload=function(){if(im.naturalWidth>16){pic.textContent='';pic.appendChild(im)}};im.src='https://www.google.com/s2/favicons?sz=128&domain='+pic.getAttribute('data-d')});
    return}
  var root=document.getElementById('voice-page');if(!root)return;
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function when(d){if(!d)return'';var t=new Date(d);if(isNaN(t))return'';return t.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}
  var player=document.getElementById('v-player');
  function embed(src){player.innerHTML='<iframe src="'+src+'" title="Video player" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen loading="lazy"></iframe>';player.hidden=false}
  function play(v){embed('https://www.youtube-nocookie.com/embed/'+encodeURIComponent(v)+'?rel=0');try{history.replaceState(null,'','#v='+encodeURIComponent(v))}catch(e){}}
  function playList(id){embed('https://www.youtube-nocookie.com/embed/videoseries?list='+encodeURIComponent(id)+'&rel=0')}
  var tabs=document.getElementById('v-tabs'),clipsBox=document.getElementById('v-clips'),plBox=document.getElementById('v-playlists');
  function showTab(t){[].forEach.call(tabs.children,function(b){b.setAttribute('aria-pressed',b.getAttribute('data-t')===t)});clipsBox.hidden=t!=='videos'||!clipsBox.querySelector('li');plBox.hidden=t!=='playlists'}
  tabs.addEventListener('click',function(e){var b=e.target.closest('button');if(b)showTab(b.getAttribute('data-t'))});
  document.addEventListener('click',function(e){var a=e.target.closest('#wb-pl');if(a){showTab('playlists')}});
  fetch('/api/voice?id='+encodeURIComponent(root.getAttribute('data-id'))).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(d){
    var vs=d.videos||[],pp=d.podcasts||[],pls=d.playlists||[];var ev=document.getElementById('e-video');
    if(ev&&(vs.length||pp.length||pls.length))ev.hidden=false;
    if(vs.length){
      var hv=/#v=([\w-]{11})/.exec(location.hash);play(hv?hv[1]:vs[0].v);document.getElementById('wb-vid').hidden=false;
      clipsBox.hidden=false;
      clipsBox.querySelector('ul').innerHTML=vs.map(function(x){return'<li><button type="button" class="vclip" data-v="'+esc(x.v)+'"><img src="https://i.ytimg.com/vi/'+esc(x.v)+'/mqdefault.jpg" alt="" width="320" height="180" loading="lazy"><span><b>'+esc(x.t)+'</b><i>'+esc(x.n||d.name)+(x.d?' · '+when(x.d):'')+'</i></span></button></li>'}).join('');
      clipsBox.addEventListener('click',function(e){var b=e.target.closest('.vclip');if(!b)return;play(b.getAttribute('data-v'));player.scrollIntoView({behavior:'smooth',block:'center'})});
    } else tabs.querySelector('[data-t=videos]').hidden=true;
    if(pls.length){
      tabs.querySelector('[data-t=playlists]').hidden=false;document.getElementById('wb-pl').hidden=false;
      plBox.querySelector('ul').innerHTML=pls.map(function(x){return'<li><button type="button" class="vclip vpl" data-l="'+esc(x.id)+'"><img src="'+esc(x.th)+'" alt="" width="320" height="180" loading="lazy"><span><b>'+esc(x.t)+'</b><i>Playlist · '+esc(x.n)+' videos</i></span></button></li>'}).join('');
      plBox.addEventListener('click',function(e){var b=e.target.closest('.vpl');if(!b)return;playList(b.getAttribute('data-l'));player.scrollIntoView({behavior:'smooth',block:'center'})});
    }
    if(!vs.length&&!pls.length)tabs.hidden=true;
    function list(items){return items.map(function(a){var im=a.i?'<img class="athumb" src="'+esc(a.i)+'" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">':'';var h=a.k?'/news/item/'+esc(a.k)+'/':esc(a.u),ext=a.k?'':' rel="noopener" target="_blank"';return'<li class="'+(a.i?'hasimg':'')+'">'+(a.i?'<a class="athl" href="'+h+'"'+ext+' tabindex="-1">'+im+'</a>':'')+'<div><a href="'+h+'"'+ext+'><b>'+esc(a.t)+'</b></a><span class="wm">'+esc(d.name)+(a.d?' · '+when(a.d):'')+(a.k?' · <a class="orig" href="'+esc(a.u)+'" rel="noopener" target="_blank">Original</a>':'')+'</span>'+(a.x?'<p>'+esc(a.x)+'</p>':'')+(a.a?'<audio controls preload="none" src="'+esc(a.a)+'"></audio>':'')+'</div></li>'}).join('')}
    if(pp.length){var pe=document.getElementById('v-pods');pe.hidden=false;var wbp=document.getElementById('wb-pod');if(wbp)wbp.hidden=false;var pu=pe.querySelector('ul');function pdraw(n){pu.innerHTML=list(pp.slice(0,n))+(pp.length>n?'<li class="amore"><button type="button" class="aall">Show all '+pp.length+' episodes</button></li>':'')}pdraw(8);pu.addEventListener('click',function(e){if(e.target.closest('.aall'))pdraw(pp.length)})}
    var a=d.articles||[],nw=d.news||[];
    function nlist(items){return items.map(function(a){return'<li><a href="'+esc(a.u)+'" rel="noopener" target="_blank"><b>'+esc(a.t)+'</b></a><span class="wm">'+esc(a.src||'News')+(a.d?' · '+when(a.d):'')+'</span></li>'}).join('')}
    var h=a.length?list(a):'';
    var ns=document.getElementById('v-news');if(ns){ns.querySelector('ul').innerHTML=nw.length?nlist(nw):'<li>No recent news coverage was found. Check back soon.</li>'}
    document.querySelector('#v-articles ul').innerHTML=h||'<li>No recent articles were found. Check back soon.</li>';
  }).catch(function(){tabs.hidden=true;document.querySelector('#v-articles ul').innerHTML='<li>This page could not load just now. Please try again soon.</li>'});
})();

(function(){
  var box=document.getElementById('wlatest');if(!box)return;
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function ago(d){if(!d)return'';var m=Math.round((Date.now()-new Date(d))/60000);if(isNaN(m))return'';if(m<60)return Math.max(m,1)+' min ago';if(m<1440)return Math.round(m/60)+' h ago';return Math.round(m/1440)+' d ago'}
  function fill(k,url,n){fetch(url).then(function(r){return r.json()}).then(function(d){
    var ul=box.querySelector('[data-k='+k+'] ul');if(!ul)return;
    ul.innerHTML=(d.items||[]).slice(0,n).map(function(i){var h=i.k?'/news/item/'+esc(i.k)+'/?s='+encodeURIComponent(i.s)+(i.ch?'&c='+encodeURIComponent(i.ch):''):esc(i.u);return'<li><a href="'+h+'">'+esc(i.t)+'</a><span class="wm">'+esc(i.src||'')+' · '+ago(i.d)+'</span></li>'}).join('')||'<li>Nothing new just now.</li>'}).catch(function(){})}
  fill('news','/api/news?v=2',4);fill('views','/api/news?views=1&v=2',4);
  function vc(v){return'<a class="wlvc" href="/video/"><img src="https://i.ytimg.com/vi/'+esc(v.v)+'/mqdefault.jpg" alt="" loading="lazy"><span>'+esc(v.t)+'</span><em>'+esc(v.n||'')+(v.d?' · '+ago(v.d):'')+'</em></a>'}
  fetch('/api/latest-videos?n=3').then(function(r){return r.json()}).then(function(d){if(d.items&&d.items.length){box.querySelector('.wlv').innerHTML=d.items.slice(0,3).map(vc).join('');return}throw 0}).catch(function(){
    fetch('/api/videos').then(function(r){return r.json()}).then(function(d){var all=[];(d.channels||[]).forEach(function(c){c.videos.forEach(function(v){v.n=c.name;all.push(v)})});all.sort(function(a,b){return(b.d||'').localeCompare(a.d||'')});box.querySelector('.wlv').innerHTML=all.slice(0,3).map(vc).join('')}).catch(function(){})});
})();
/* Description with MORE inline at the end of its last line (three lines at most) */
(function(){
  function lh(el){var c=getComputedStyle(el),l=parseFloat(c.lineHeight);return isNaN(l)?parseFloat(c.fontSize)*1.45:l}
  function fit(box,txt,more,lines,force){
    if(!box||!txt||!more)return false;
    var full=txt.getAttribute('data-full');if(full==null){full=txt.textContent;txt.setAttribute('data-full',full)}
    txt.textContent=full;more.hidden=false;
    var max=lh(box)*lines+3,cut=false;
    if(box.scrollHeight<=max){more.hidden=!force;return false}
    var w=full.split(/\s+/),lo=1,hi=w.length;
    while(lo<hi){var mid=(lo+hi+1)>>1;txt.textContent=w.slice(0,mid).join(' ').replace(/[,;:\s]+$/,'')+'\u2026';if(box.scrollHeight<=max)lo=mid;else hi=mid-1}
    txt.textContent=w.slice(0,lo).join(' ').replace(/[,;:\s]+$/,'')+'\u2026';return true}
  function hero(){var box=document.getElementById('e-def'),more=document.getElementById('e-more');if(!box||!more)return;
    var txt=box.querySelector('.edt'),sum=document.getElementById('e-summary'),cut;
    function run(){var more2=sum&&!sum.hidden;cut=fit(box,txt,more,3,more2);more.setAttribute('data-cut',cut?'1':'')}
    run();window.addEventListener('load',run);window.addEventListener('resize',run);
    if(sum)new MutationObserver(run).observe(sum,{attributes:true,attributeFilter:['hidden']});
    more.addEventListener('click',function(ev){if(sum&&!sum.hidden)return;ev.preventDefault();txt.textContent=txt.getAttribute('data-full');more.hidden=true})}
  function cards(){var g=document.getElementById('wgrid');if(!g)return;
    function run(){g.querySelectorAll('.wcard .wd').forEach(function(d){if(d.offsetParent===null)return;fit(d,d.querySelector('.wdt'),d.querySelector('.wmore'),3,false)})}
    run();window.addEventListener('load',run);window.addEventListener('resize',run);document.addEventListener('click',function(){setTimeout(run,60)});var q=document.getElementById('wq');if(q)q.addEventListener('input',function(){setTimeout(run,60)})}
  hero();cards();
})();

/* Selection row for each source page: Media, Sort and Filter */
(function(){
  var root=document.getElementById('voice-page');if(!root)return;
  var id=root.getAttribute('data-id');
  var tabs=document.getElementById('v-tabs'),clips=document.getElementById('v-clips'),pls=document.getElementById('v-playlists'),pods=document.getElementById('v-pods'),arts=document.getElementById('v-articles'),news=document.getElementById('v-news'),player=document.getElementById('v-player'),ev=document.getElementById('e-video');
  if(!ev||!arts||!news)return;
  var row=document.createElement('div');row.className='srow';row.id='w-row';row.hidden=true;
  row.innerHTML='<label>Media<select id="w-med" aria-label="Media"></select></label><label>Sort<select id="w-ord" aria-label="Sort"><option value="new">Newest first</option><option value="old">Oldest first</option><option value="az">A to Z</option></select></label><input id="w-q" type="search" placeholder="Filter" aria-label="Filter" autocomplete="off">';
  ev.parentNode.insertBefore(row,ev);
  var D=null,med=document.getElementById('w-med'),ord=document.getElementById('w-ord'),q=document.getElementById('w-q');
  var G={videos:{box:clips,key:'videos'},playlists:{box:pls,key:'playlists'},podcasts:{box:pods,key:'podcasts'},articles:{box:arts,key:'articles'},news:{box:news,key:'news'}};
  function ul(k){return G[k].box.querySelector('ul')}
  function tag(){Object.keys(G).forEach(function(k){var u=ul(k),a=D[G[k].key]||[],n=0;if(!u)return;[].forEach.call(u.children,function(li){if(li.classList.contains('amore')||!a[n]){return}li._d=a[n].d||a[n].published||'';li._t=li.textContent;n++})})}
  function apply(){
    var m=med.value,o=ord.value,t=q.value.trim().toLowerCase();
    if((o!=='new'||t)){var more=pods.querySelector('.aall');if(more)more.click()}
    Object.keys(G).forEach(function(k){
      var box=G[k].box,u=ul(k);if(!u)return;
      var show=(m==='all'||m===k);
      var any=(D[G[k].key]||[]).length>0;
      if(k==='videos'||k==='playlists'){box.hidden=!show||!any}else if(k==='podcasts'){box.hidden=!show||!any}else{box.hidden=!show}
      if(show&&k==='articles'||show&&k==='news'){box.hidden=false}
      var lis=[].slice.call(u.children).filter(function(li){return li._t!=null});
      lis.sort(function(a,b){if(o==='az')return a._t.localeCompare(b._t);var c=(b._d||'').localeCompare(a._d||'');return o==='old'?-c:c});
      var last=u.querySelector('.amore');
      lis.forEach(function(li){li.hidden=!!t&&li._t.toLowerCase().indexOf(t)<0;u.insertBefore(li,last)});
    });
    if(player&&m!=='all'&&m!=='videos'&&m!=='playlists')player.hidden=true;else if(player&&player.innerHTML)player.hidden=false;
    ev.hidden=!(D.videos.length||D.podcasts.length||D.playlists.length);
  }
  function build(){
    var opts=[['all','All media']];
    if(D.videos.length)opts.push(['videos','Videos ('+D.videos.length+')']);
    if(D.playlists.length)opts.push(['playlists','Playlists ('+D.playlists.length+')']);
    if(D.podcasts.length)opts.push(['podcasts','Podcasts ('+D.podcasts.length+')']);
    opts.push(['articles','Articles ('+D.articles.length+')']);
    opts.push(['news','News coverage ('+D.news.length+')']);
    med.innerHTML=opts.map(function(x){return'<option value="'+x[0]+'">'+x[1]+'</option>'}).join('');
    if(tabs)tabs.hidden=true;
    row.hidden=false;tag();apply();
    [med,ord].forEach(function(e){e.addEventListener('change',apply)});q.addEventListener('input',apply);
    var mo=new MutationObserver(function(){mo.disconnect();tag();apply();obs()});function obs(){mo.observe(pods.querySelector('ul'),{childList:true})}obs();
  }
  fetch('/api/voice?id='+encodeURIComponent(id)).then(function(r){return r.json()}).then(function(d){
    D={videos:d.videos||[],playlists:d.playlists||[],podcasts:d.podcasts||[],articles:d.articles||[],news:d.news||[]};
    var tries=0;(function wait(){if(document.querySelector('#v-news ul li')&&!/^Loading/.test(document.querySelector('#v-news ul').textContent)||tries++>40){build()}else setTimeout(wait,150)})();
  }).catch(function(){});
})();
