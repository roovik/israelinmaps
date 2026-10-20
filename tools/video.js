(function(){
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function ago(iso){if(!iso)return'';var s=(Date.now()-new Date(iso))/1000;if(s<86400)return'today';if(s<2*86400)return'yesterday';if(s<30*86400)return Math.round(s/86400)+' days ago';if(s<365*86400)return Math.round(s/(30*86400))+' months ago';return Math.round(s/(365*86400))+' years ago'}
  function embed(v){return'<iframe src="https://www.youtube-nocookie.com/embed/'+encodeURIComponent(v)+'?autoplay=1&rel=0" title="Video player" allow="accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>'}
  function card(v){return'<a class="tcard vcard" data-v="'+esc(v.v)+'" href="https://www.youtube.com/watch?v='+esc(v.v)+'" rel="noopener"><span class="timg"><img src="https://i.ytimg.com/vi/'+esc(v.v)+'/mqdefault.jpg" alt="" loading="lazy"><span class="vplay">▶</span></span><span class="tb"><span class="tid">'+esc(v.n||'')+(v.n&&v.d?' · ':'')+ago(v.d)+'</span><b>'+esc(v.t)+'</b></span></a>'}
  var host=document.getElementById('vid-top');
  function play(a){var v=a.getAttribute('data-v');
    if(host){host.innerHTML=embed(v);host.hidden=false;host.scrollIntoView({behavior:'smooth',block:'nearest'})}
    else{var im=a.querySelector('.timg');im.innerHTML=embed(v);im.className='timg vlive'}}
  document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a.vcard');if(!a||e.metaKey||e.ctrlKey||e.shiftKey||e.button)return;e.preventDefault();play(a)});
  var root=document.getElementById('vid-root'),gl=document.getElementById('e-video');
  if(!root&&!gl)return;
  fetch('/api/videos').then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(d){
    var chs=d.channels||[];
    if(root){
      if(!chs.length){root.innerHTML='<p>No videos are available right now.</p>';return}
      var all=[];chs.forEach(function(c){c.videos.forEach(function(v){all.push({v:v.v,t:v.t,d:v.d,n:c.name})})});
      all.sort(function(a,b){return(b.d||'').localeCompare(a.d||'')});
      host.innerHTML=embed(all[0].v).replace('autoplay=1','autoplay=0');host.hidden=false;
      var h='<h2 id="ch-latest">Latest</h2><div class="tgrid">'+all.slice(0,12).map(card).join('')+'</div>';
      chs.forEach(function(c){h+='<section class="vch" id="ch-'+esc(c.key)+'"><h2><a href="'+esc(c.url)+'" rel="noopener">'+esc(c.name)+'</a></h2><div class="tgrid">'+c.videos.slice(0,8).map(function(v){return card({v:v.v,t:v.t,d:v.d})}).join('')+'</div></section>'});
      root.innerHTML=h;
      var m=/#ch-([\w-]+)/.exec(location.hash);if(m){var el=document.getElementById('ch-'+m[1]);if(el)el.scrollIntoView()}
    }
    if(gl){
      var name=(gl.getAttribute('data-name')||'').trim(),have={};[].forEach.call(gl.querySelectorAll('[data-v]'),function(a){have[a.getAttribute('data-v')]=1});
      if(name.length<5)return;
      var re=new RegExp('(^|[^A-Za-z])'+name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?![A-Za-z])','i'),found=[];
      chs.forEach(function(c){c.videos.forEach(function(v){if(!have[v.v]&&re.test(v.t))found.push({v:v.v,t:v.t,d:v.d,n:c.name})})});
      found.sort(function(a,b){return(b.d||'').localeCompare(a.d||'')});
      if(found.length){var box=gl.querySelector('.tgrid');box.insertAdjacentHTML('beforeend',found.slice(0,3).map(card).join(''));gl.hidden=false}
    }
  }).catch(function(){});
})();
