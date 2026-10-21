(function(){
  var wg=document.getElementById('wgrid');if(wg){var wq=document.getElementById('wq'),ch=document.getElementById('wchips'),g0='';function nm(s){return s.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/['\u2019]/g,'')}function fl(){var t=nm(wq.value).trim(),n=0;[].forEach.call(wg.children,function(c){var ok=(!g0||c.getAttribute('data-g')===g0)&&(!t||t.split(/\s+/).every(function(w){return c.getAttribute('data-h').indexOf(w)>-1}));c.hidden=!ok;if(ok)n++});document.getElementById('wnone').hidden=n>0}function fh(){var m=/[#&]g=([a-z]+)/.exec(location.hash);g0=m?m[1]:'';[].forEach.call(ch.children,function(x){x.setAttribute('aria-pressed',x.getAttribute('data-g')===g0)});fl()}window.addEventListener('hashchange',fh);fh();wq.addEventListener('input',fl);ch.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;g0=b.getAttribute('data-g');[].forEach.call(ch.children,function(x){x.setAttribute('aria-pressed',x===b)});fl()});return}
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
    function list(items){return items.map(function(a){var im=a.i?'<img class="athumb" src="'+esc(a.i)+'" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">':'';var h=a.k?'/news/item/'+esc(a.k)+'/':esc(a.u),ext=a.k?'':' rel="noopener" target="_blank"';return'<li class="'+(a.i?'hasimg':'')+'">'+(a.i?'<a class="athl" href="'+h+'"'+ext+' tabindex="-1">'+im+'</a>':'')+'<div><a href="'+h+'"'+ext+'><b>'+esc(a.t)+'</b></a><span class="wm">'+esc(d.name)+(a.d?' · '+when(a.d):'')+(a.k?' · <a class="orig" href="'+esc(a.u)+'" rel="noopener" target="_blank">Original</a>':'')+'</span>'+(a.x?'<p>'+esc(a.x)+'</p>':'')+'</li>'}).join('')}
    if(pp.length){var pe=document.getElementById('v-pods');pe.hidden=false;pe.querySelector('ul').innerHTML=list(pp)}
    var a=d.articles||[],nw=d.news||[];
    function nlist(items){return items.map(function(a){return'<li><a href="'+esc(a.u)+'" rel="noopener" target="_blank"><b>'+esc(a.t)+'</b></a><span class="wm">'+esc(a.src||'News')+(a.d?' · '+when(a.d):'')+'</span></li>'}).join('')}
    var h=a.length?list(a):'';if(nw.length)h+=(a.length?'<li class="vsub"><h3>In the news</h3></li>':'')+nlist(nw);
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
  fetch('/api/videos').then(function(r){return r.json()}).then(function(d){var all=[];(d.channels||[]).forEach(function(c){c.videos.forEach(function(v){v.n=c.name;all.push(v)})});
    all.sort(function(a,b){return(b.d||'').localeCompare(a.d||'')});
    box.querySelector('.wlv').innerHTML=all.slice(0,3).map(function(v){return'<a class="wlvc" href="/video/"><img src="https://i.ytimg.com/vi/'+esc(v.v)+'/mqdefault.jpg" alt="" loading="lazy"><span>'+esc(v.t)+'</span></a>'}).join('')}).catch(function(){});
})();
