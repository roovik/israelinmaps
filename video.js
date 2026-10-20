(function(){
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function ago(iso){if(!iso)return'';var s=(Date.now()-new Date(iso))/1000;if(s<86400)return'today';if(s<2*86400)return'yesterday';if(s<30*86400)return Math.round(s/86400)+' days ago';if(s<365*86400)return Math.round(s/(30*86400))+' months ago';return Math.round(s/(365*86400))+' years ago'}
  function embed(v,auto){return'<iframe src="https://www.youtube-nocookie.com/embed/'+encodeURIComponent(v)+'?rel=0'+(auto?'&autoplay=1':'')+'" title="Video player" allow="accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>'}
  function wurl(v,c,t){return'/video/watch/?v='+encodeURIComponent(v.v)+(c?'&c='+encodeURIComponent(c):'')+(t?'&t='+encodeURIComponent(t):'')}
  function card(v){return'<a class="tcard vcard" data-v="'+esc(v.v)+'" href="'+esc(wurl(v,v.c,v.t))+'"><span class="timg"><img src="https://i.ytimg.com/vi/'+esc(v.v)+'/mqdefault.jpg" alt="" loading="lazy"><span class="vplay">▶</span></span><span class="tb"><span class="tid">'+esc(v.n||'')+(v.n&&v.d?' · ':'')+ago(v.d)+'</span><b>'+esc(v.t)+'</b></span></a>'}
  var host=document.getElementById('vid-top'),onWatch=!!document.getElementById('vid-watch'),onChan=!!document.getElementById('vid-chan'),CTX=null;
  document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a.vcard,a.vli');if(!a||e.metaKey||e.ctrlKey||e.shiftKey||e.button)return;
    var v=a.getAttribute('data-v');if(a.classList.contains('vli')&&!(onWatch||onChan)&&host){/* main page: let the link open the channel context */}
    if((onWatch||onChan)&&CTX){e.preventDefault();CTX(v)}
    else if(a.closest('#e-video')){e.preventDefault();var im=a.querySelector('.timg');im.innerHTML=embed(v,true);im.className='timg vlive'}});
  var root=document.getElementById('vid-root'),chp=document.getElementById('vid-chan'),wt=document.getElementById('vid-watch'),gl=document.getElementById('e-video');
  if(!root&&!chp&&!wt&&!gl)return;
  var P=new URLSearchParams(location.search);
  if(wt&&P.get('v')){host.innerHTML=embed(P.get('v'),true);host.hidden=false;if(P.get('t'))document.getElementById('vw-title').textContent=P.get('t')}
  fetch('/api/videos').then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(d){
    var chs=d.channels||[];function sl(c){return(c.kind==='playlist'?'pl-':'')+String(c.key).toLowerCase()}function lab(c){return c.name+(c.kind==='playlist'?' Playlist':' Videos')}
    chs.forEach(function(c){c.videos.forEach(function(v){v.c=sl(c);v.n=c.name})});
    if(root){
      if(!chs.length){root.innerHTML='<p>No videos are available right now.</p>';return}
      var all=[];chs.forEach(function(c){all=all.concat(c.videos)});
      all.sort(function(a,b){return(b.d||'').localeCompare(a.d||'')});
      host.innerHTML=embed(all[0].v,false);host.hidden=false;listText('Latest videos',all.slice(0,20));
      var h='<h2 id="ch-latest">Latest</h2><div class="tgrid">'+all.slice(0,12).map(card).join('')+'</div>';
      [false,true].forEach(function(pl){var any=chs.filter(function(c){return(c.kind==='playlist')===pl});if(pl&&any.length)h+='<h2 class="vsec">Playlists</h2>';
        any.forEach(function(c){h+='<section class="vch"><h2><a href="/video/'+esc(sl(c))+'/">'+esc(lab(c))+'</a></h2><div class="tgrid">'+c.videos.slice(0,8).map(card).join('')+'</div><p class="small"><a href="/video/'+esc(sl(c))+'/">See all</a></p></section>'})});
      root.innerHTML=h;
    }
    function listText(title,vs){var L=document.getElementById('vid-list');if(!L)return;
      L.innerHTML='<h2>'+esc(title)+'</h2><ul>'+vs.map(function(v){return'<li><a class="vli" data-v="'+esc(v.v)+'" href="'+esc(wurl(v,v.c,v.t))+'">'+esc(v.t)+'</a><span class="wm">'+esc(v.n||'')+(v.d?' \u00b7 '+ago(v.d):'')+'</span></li>'}).join('')+'</ul>'}
    function context(c,vid,titleEl,box){
      var byv={};c.videos.forEach(function(v){byv[v.v]=v});
      var now=document.createElement('div');now.className='vnow';host.parentNode.insertBefore(now,host.nextSibling);
      function setP(id,auto){var v=byv[id]||c.videos[0];
        host.innerHTML=embed(v.v,auto);host.hidden=false;
        if(titleEl)titleEl.textContent=v.t;document.title=v.t+' | Israel NOWlej';
        now.innerHTML='<p class="small">'+esc(c.name)+' \u00b7 '+ago(v.d)+'</p>'+(v.x?'<p>'+esc(v.x)+'</p>':'');
        [].forEach.call(document.querySelectorAll('.vcard,.vli'),function(a){a.classList.toggle('vnowp',a.getAttribute('data-v')===v.v)});
        try{history.replaceState(null,'','?v='+encodeURIComponent(v.v))}catch(x){}}
      var pls=chs.filter(function(x){return x.kind==='playlist'&&x.channel&&x.channel===String(c.key).toLowerCase()&&x!==c});
      box.innerHTML='<h2>'+(titleEl?'More from ':'Recent from ')+esc(c.name)+'</h2><div class="tgrid">'+c.videos.map(card).join('')+'</div>'+(pls.length?'<h2>Playlists from '+esc(c.name)+'</h2><ul class="vpl">'+pls.map(function(x){return'<li><a href="/video/'+esc(sl(x))+'/">'+esc(x.name)+' Playlist</a> <small>'+x.videos.length+' videos</small></li>'}).join('')+'</ul>':'');
      CTX=function(id){setP(id,true);host.scrollIntoView({behavior:'smooth',block:'nearest'})};
      listText('Videos in '+c.name,c.videos);
      setP(vid&&byv[vid]?vid:c.videos[0].v,!!(vid&&byv[vid]));
    }
    if(chp){
      var key=chp.getAttribute('data-key'),c=chs.filter(function(x){return sl(x)===key})[0];
      if(!c){chp.innerHTML='<p>No videos from this channel are available right now.</p>';return}
      context(c,P.get('v'),null,chp);
    }
    if(wt){
      var vid=P.get('v'),fc=null;chs.forEach(function(c){c.videos.forEach(function(v){if(v.v===vid)fc=c})});
      var cc=(P.get('c')&&chs.filter(function(x){return sl(x)===P.get('c')})[0])||fc;
      if(cc)context(cc,vid,document.getElementById('vw-title'),wt);
      else if(!P.get('t'))wt.innerHTML='<p><a href="/video/">Back to all videos</a></p>';
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
