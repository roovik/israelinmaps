(function(){
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function ago(iso){if(!iso)return'';var s=(Date.now()-new Date(iso))/1000;if(s<86400)return'today';if(s<2*86400)return'yesterday';if(s<30*86400)return Math.round(s/86400)+' days ago';if(s<365*86400)return Math.round(s/(30*86400))+' months ago';return Math.round(s/(365*86400))+' years ago'}
  function embed(v,auto){return'<iframe src="https://www.youtube-nocookie.com/embed/'+encodeURIComponent(v)+'?rel=0'+(auto?'&autoplay=1':'')+'" title="Video player" allow="accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>'}
  function wurl(v,c,t){return'/video/watch/?v='+encodeURIComponent(v.v)+(c?'&c='+encodeURIComponent(c):'')+(t?'&t='+encodeURIComponent(t):'')}
  function card(v){return'<a class="tcard vcard" data-v="'+esc(v.v)+'" href="'+esc(wurl(v,v.c,v.t))+'"><span class="timg"><img src="https://i.ytimg.com/vi/'+esc(v.v)+'/mqdefault.jpg" alt="" loading="lazy"><span class="vplay">▶</span></span><span class="tb"><span class="tid">'+esc(v.n||'')+(v.n&&v.d?' · ':'')+ago(v.d)+'</span><b>'+esc(v.t)+'</b></span></a>'}
  var host=document.getElementById('vid-top'),onWatch=!!document.getElementById('vid-watch');
  document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a.vcard');if(!a||e.metaKey||e.ctrlKey||e.shiftKey||e.button||onWatch)return;
    var v=a.getAttribute('data-v');
    if(host){e.preventDefault();host.innerHTML=embed(v,true);host.hidden=false;host.scrollIntoView({behavior:'smooth',block:'nearest'})}
    else if(a.closest('#e-video')){e.preventDefault();var im=a.querySelector('.timg');im.innerHTML=embed(v,true);im.className='timg vlive'}});
  var root=document.getElementById('vid-root'),chp=document.getElementById('vid-chan'),wt=document.getElementById('vid-watch'),gl=document.getElementById('e-video');
  if(!root&&!chp&&!wt&&!gl)return;
  var P=new URLSearchParams(location.search);
  if(wt&&P.get('v')){host.innerHTML=embed(P.get('v'),true);host.hidden=false;if(P.get('t'))document.getElementById('vw-title').textContent=P.get('t')}
  fetch('/api/videos').then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(d){
    var chs=d.channels||[];function sl(c){return String(c.key).toLowerCase()}
    chs.forEach(function(c){c.videos.forEach(function(v){v.c=sl(c);v.n=c.name})});
    if(root){
      if(!chs.length){root.innerHTML='<p>No videos are available right now.</p>';return}
      var all=[];chs.forEach(function(c){all=all.concat(c.videos)});
      all.sort(function(a,b){return(b.d||'').localeCompare(a.d||'')});
      host.innerHTML=embed(all[0].v,false);host.hidden=false;
      var h='<h2 id="ch-latest">Latest</h2><div class="tgrid">'+all.slice(0,12).map(card).join('')+'</div>';
      chs.forEach(function(c){h+='<section class="vch"><h2><a href="/video/'+esc(sl(c))+'/">'+esc(c.name)+'</a></h2><div class="tgrid">'+c.videos.slice(0,8).map(card).join('')+'</div><p class="small"><a href="/video/'+esc(sl(c))+'/">All videos from '+esc(c.name)+'</a></p></section>'});
      root.innerHTML=h;
    }
    if(chp){
      var key=chp.getAttribute('data-key'),c=chs.filter(function(x){return sl(x)===key})[0];
      if(!c){chp.innerHTML='<p>No videos from this channel are available right now.</p>';return}
      host.innerHTML=embed(c.videos[0].v,false);host.hidden=false;
      chp.innerHTML='<div class="tgrid">'+c.videos.map(card).join('')+'</div>';
    }
    if(wt){
      var vid=P.get('v'),found=null,fc=null;chs.forEach(function(c){c.videos.forEach(function(v){if(v.v===vid){found=v;fc=c}})});
      var h2='';
      if(found){document.getElementById('vw-title').textContent=found.t;document.title=found.t+' | Israel NOWlej';
        h2='<p class="small">'+esc(found.n)+' · '+ago(found.d)+'</p>'+(found.x?'<p>'+esc(found.x)+'</p>':'')+'<p class="small"><a href="/video/'+esc(found.c)+'/">More from '+esc(found.n)+'</a></p><h2>More videos</h2><div class="tgrid">'+fc.videos.filter(function(v){return v.v!==vid}).slice(0,8).map(card).join('')+'</div>'}
      else if(!P.get('t'))h2='<p><a href="/video/">Back to all videos</a></p>';
      wt.innerHTML=h2;
    }
    if(gl){
      var name=(gl.getAttribute('data-name')||'').trim(),have={};[].forEach.call(gl.querySelectorAll('[data-v]'),function(a){have[a.getAttribute('data-v')]=1});
      if(name.length<5)return;
      var re=new RegExp('(^|[^A-Za-z])'+name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?![A-Za-z])','i'),found2=[];
      chs.forEach(function(c){c.videos.forEach(function(v){if(!have[v.v]&&re.test(v.t))found2.push(v)})});
      found2.sort(function(a,b){return(b.d||'').localeCompare(a.d||'')});
      if(found2.length){gl.querySelector('.tgrid').insertAdjacentHTML('beforeend',found2.slice(0,3).map(card).join(''));gl.hidden=false}
    }
  }).catch(function(){});
})();
