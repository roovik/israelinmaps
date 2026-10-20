(function(){(window.NOWOV||Promise.resolve()).then(function(){
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function ago(iso){if(!iso)return'';var s=(Date.now()-new Date(iso))/1000;if(s<86400)return'today';if(s<2*86400)return'yesterday';if(s<30*86400)return Math.round(s/86400)+' days ago';if(s<365*86400)return Math.round(s/(30*86400))+' months ago';return Math.round(s/(365*86400))+' years ago'}
  function embed(v,auto){return'<iframe src="https://www.youtube-nocookie.com/embed/'+encodeURIComponent(v)+'?rel=0'+(auto?'&autoplay=1':'')+'" title="Video player" allow="accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>'}
  function wurl(v,c,t){return'/video/watch/?v='+encodeURIComponent(v.v)+(c?'&c='+encodeURIComponent(c):'')+(t?'&t='+encodeURIComponent(t):'')}
  function card(v){return'<a class="tcard vcard" data-v="'+esc(v.v)+'" href="'+esc(wurl(v,v.c,v.t))+'"><span class="timg"><img src="https://i.ytimg.com/vi/'+esc(v.v)+'/mqdefault.jpg" alt="" loading="lazy"><span class="vplay">▶</span></span><span class="tb"><span class="tid">'+esc(v.n||'')+(v.n&&v.d?' · ':'')+ago(v.d)+'</span><b>'+esc(v.t)+'</b></span></a>'}
  var host=document.getElementById('vid-top'),onWatch=!!document.getElementById('vid-watch'),onChan=!!document.getElementById('vid-chan'),CTX=null,EVP=null;
  document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a.vcard,a.vli');if(!a||e.metaKey||e.ctrlKey||e.shiftKey||e.button)return;
    var v=a.getAttribute('data-v');if(a.classList.contains('vli')&&!(onWatch||onChan)&&host){/* main page: let the link open the channel context */}
    if(EVP&&a.closest('#vid-list,#e-video')){e.preventDefault();EVP(v)}
    else if((onWatch||onChan)&&CTX){e.preventDefault();CTX(v)}
    else if(a.closest('#e-video')){e.preventDefault();var im=a.querySelector('.timg');im.innerHTML=embed(v,true);im.className='timg vlive'}});
  var root=document.getElementById('vid-root'),chp=document.getElementById('vid-chan'),wt=document.getElementById('vid-watch'),gl=document.getElementById('e-video');
  if(!root&&!chp&&!wt&&!gl)return;
  var P=new URLSearchParams(location.search);
  if(wt&&P.get('v')){host.innerHTML=embed(P.get('v'),true);host.hidden=false;if(P.get('t'))document.getElementById('vw-title').textContent=P.get('t')}
  if(gl&&(gl.getAttribute('data-pins')||'[]')!=='[]'||gl&&(gl.getAttribute('data-pls')||'[]')!=='[]'){
    var pins=JSON.parse(gl.getAttribute('data-pins')||'[]'),pls=JSON.parse(gl.getAttribute('data-pls')||'[]'),L=document.getElementById('vid-list'),pl=document.getElementById('e-player'),list=pins,ttl='Videos on this topic',act='',now='',mode='v';
    gl.hidden=false;var tg=gl.querySelector('.tgrid');if(tg)tg.hidden=true;
    function play(id,auto){if(!id)return;pl.innerHTML=embed(id,auto);pl.hidden=false;now=id;mark()}
    function mark(){[].forEach.call(document.querySelectorAll('#vid-list a.vli,#e-video a.vcard'),function(a){a.classList.toggle('vnowp',a.getAttribute('data-v')===now)})}
    function thumbs(){var T=gl.querySelector('.vthumbs');if(T)T.innerHTML=list.slice(0,6).map(function(v){return card({v:v.v,t:v.t||'Video'})}).join('');mark()}
    function draw(){thumbs();if(!L)return;
      var h='<div class="vseg" role="group" aria-label="Go to"><button type="button" data-b="v" aria-pressed="'+(mode==='v')+'">Videos</button>'+(pls.length?'<button type="button" data-b="p" aria-pressed="'+(mode==='p')+'">Playlists</button>':'')+'</div>';
      h+='<h2 id="vl-videos">'+esc(ttl)+'</h2><ul>'+list.map(function(v){return'<li><a class="vli" data-v="'+esc(v.v)+'" href="/video/watch/?v='+encodeURIComponent(v.v)+'&t='+encodeURIComponent(v.t||'')+'">'+esc(v.t||'Video')+'</a></li>'}).join('')+'</ul>';
      if(pls.length)h+='<h2 id="vl-pls">Playlists</h2><ul class="vpls">'+pls.map(function(x){return'<li><a'+(x.id===act?' class="vnowp" aria-current="true"':'')+' data-pl="'+esc(x.id)+'" href="/video/'+esc(x.slug)+'/">'+esc(x.name)+'</a>'+(x.by?' <small>'+esc(x.by)+'</small>':'')+'</li>'}).join('')+'</ul>';
      L.innerHTML=h;mark()}
    EVP=function(id){play(id,true);pl.scrollIntoView({behavior:'smooth',block:'nearest'})};
    if(L){L.addEventListener('click',function(e){
      var b=e.target.closest('button[data-b]');
      if(b){if(b.getAttribute('data-b')==='v'){mode='v';act='';list=pins;ttl='Videos on this topic';draw();L.scrollTop=0;window.scrollTo({top:L.getBoundingClientRect().top+window.pageYOffset-80,behavior:'smooth'})}else{mode='p';draw();var t=document.getElementById('vl-pls');if(t)t.scrollIntoView({behavior:'smooth',block:'start'})}return}
      var a=e.target.closest('a[data-pl]');if(!a||e.metaKey||e.ctrlKey)return;e.preventDefault();var id=a.getAttribute('data-pl'),nm=a.textContent;
      fetch('/api/videos?playlist='+encodeURIComponent(id)).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(d){var c=(d.channels||[])[0];if(!c||!c.videos.length)throw 0;
        list=c.videos.map(function(v){return{v:v.v,t:v.t}});act=id;mode='v';ttl='Playlist: '+nm;draw();play(list[0].v,false);L.scrollIntoView({behavior:'smooth',block:'start'})}).catch(function(){L.insertAdjacentHTML('afterbegin','<p class="small">That playlist could not be loaded right now.</p>')})})}
    draw();if(pins.length)play(pins[0].v,false);else pl.hidden=true;
    if(pins.length)return;
  }
  var plId=chp?chp.getAttribute('data-pl')||'':'';
  fetch(plId?'/api/videos?playlist='+encodeURIComponent(plId):'/api/videos').then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(d){
    var chs=d.channels||[];function sl(c){return(c.kind==='playlist'?'pl-':'')+String(c.key).toLowerCase()}function lab(c){return c.name+(c.kind==='playlist'?' Playlist':' Videos')}
    chs.forEach(function(c){c.videos.forEach(function(v){v.c=sl(c);v.n=c.name})});
    if(root){
      if(!chs.length){root.innerHTML='<p>No videos are available right now.</p>';return}
      var all=[];chs.forEach(function(c){all=all.concat(c.videos)});
      all.sort(function(a,b){return(b.d||'').localeCompare(a.d||'')});
      host.innerHTML=embed(all[0].v,false);host.hidden=false;listText('Latest videos',all.slice(0,20));
      var h='<h2 id="ch-latest">Latest</h2><div class="tgrid">'+all.slice(0,12).map(card).join('')+'</div>';
      chs.forEach(function(c){h+='<section class="vch"><h2><a href="/video/'+esc(sl(c))+'/">'+esc(lab(c))+'</a></h2><div class="tgrid">'+c.videos.slice(0,8).map(card).join('')+'</div><p class="small"><a href="/video/'+esc(sl(c))+'/">All videos from '+esc(c.name)+'</a></p></section>'});
      if((d.playlists||[]).length){h+='<h2 id="playlists">Playlists</h2>';chs.forEach(function(c){var pls=d.playlists.filter(function(x){return x.channel===String(c.key).toLowerCase()});if(pls.length)h+='<h3>'+esc(c.name)+'</h3><ul class="vpl">'+pls.map(function(x){return'<li><a href="/video/pl-'+esc(x.id.toLowerCase())+'/">'+esc(x.name)+'</a></li>'}).join('')+'</ul>'})}
      root.innerHTML=h;
    }
    function listText(title,vs,chkey,cur){var L=document.getElementById('vid-list');if(!L)return;
      var pls=chkey?(d.playlists||[]).filter(function(x){return x.channel===chkey}):[];
      var seg='';
      if(chkey&&(pls.length||cur)){seg='<div class="vseg" role="group" aria-label="Go to"><a href="/video/'+esc(chkey)+'/#ch-videos">Videos</a><a href="/video/'+esc(chkey)+'/#playlists">Playlists</a></div>'}
      var h=seg+
        '<h2 id="vl-videos">'+esc(title)+'</h2><ul>'+vs.map(function(v){return'<li><a class="vli" data-v="'+esc(v.v)+'" href="'+esc(wurl(v,v.c,v.t))+'">'+esc(v.t)+'</a><span class="wm">'+esc(v.n||'')+(v.d?' · '+ago(v.d):'')+'</span></li>'}).join('')+'</ul>';
      if(pls.length)h+='<h2 id="vl-pls">Channel playlists</h2><ul class="vpls">'+pls.map(function(x){var on=cur&&x.id===cur;return'<li><a'+(on?' class="vnowp" aria-current="page"':'')+' href="/video/pl-'+esc(x.id.toLowerCase())+'/">'+esc(x.name)+'</a></li>'}).join('')+'</ul>';
      L.innerHTML=h;
      [].forEach.call(L.querySelectorAll('.vseg a'),function(a){a.addEventListener('click',function(e){var u=a.getAttribute('href').split('#'),t=document.getElementById(u[1]);if(t&&location.pathname===u[0]){e.preventDefault();t.scrollIntoView({behavior:'smooth',block:'start'})}})})
    }
    function context(c,vid,titleEl,box){
      var byv={};c.videos.forEach(function(v){byv[v.v]=v});
      var now=document.createElement('div');now.className='vnow';host.parentNode.insertBefore(now,host.nextSibling);
      function setP(id,auto){var v=byv[id]||c.videos[0];
        host.innerHTML=embed(v.v,auto);host.hidden=false;
        if(titleEl)titleEl.textContent=v.t;document.title=v.t+' | Israel NOWlej';
        now.innerHTML='<p class="small">'+esc(c.name)+' \u00b7 '+ago(v.d)+'</p>'+(v.x?'<p>'+esc(v.x)+'</p>':'');
        [].forEach.call(document.querySelectorAll('.vcard,.vli'),function(a){a.classList.toggle('vnowp',a.getAttribute('data-v')===v.v)});
        try{history.replaceState(null,'','?v='+encodeURIComponent(v.v))}catch(x){}}
      var ck=c.kind==='playlist'?(c.channel||''):String(c.key).toLowerCase();
      var mpl=ck?(d.playlists||[]).filter(function(x){return x.channel===ck}):[];
      var cn=(d.chnames||{})[ck]||c.name;
      box.innerHTML='<h2 id="ch-videos">'+(c.kind==='playlist'?'Videos in this playlist':(titleEl?'More from ':'Recent from ')+esc(c.name))+'</h2><div class="tgrid">'+c.videos.map(card).join('')+'</div>'+(mpl.length?'<h2 id="playlists">Playlists from '+esc(cn)+'</h2><ul class="vpl">'+mpl.map(function(x){var on=c.kind==='playlist'&&x.id===c.key;return'<li><a'+(on?' class="vnowp"':'')+' href="/video/pl-'+esc(x.id.toLowerCase())+'/">'+esc(x.name)+'</a></li>'}).join('')+'</ul>':'');
      CTX=function(id){setP(id,true);host.scrollIntoView({behavior:'smooth',block:'nearest'})};
      listText(c.kind==='playlist'?'Playlist videos':'Recent channel videos',c.videos,c.kind==='playlist'?(c.channel||''):String(c.key).toLowerCase(),c.kind==='playlist'?c.key:'');
      var hh=location.hash;setP(vid&&byv[vid]?vid:c.videos[0].v,!!(vid&&byv[vid]));
      if(hh){var ht=document.getElementById(hh.slice(1));if(ht)setTimeout(function(){ht.scrollIntoView({block:'start'})},200)}
    }
    if(chp){
      var key=chp.getAttribute('data-key'),c=chs.filter(function(x){return sl(x)===key})[0];if(!c&&plId&&chs[0])c=chs[0];
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
      var mp=(d.playlists||[]).filter(function(x){return re.test(x.name)}),cn=d.chnames||{};
      if(mp.length){var eb=gl.querySelector('.epl');if(eb)eb.innerHTML='<h3>Playlists</h3><ul class="vpl">'+mp.slice(0,6).map(function(x){return'<li><a href="/video/pl-'+esc(x.id.toLowerCase())+'/">'+esc(x.name)+'</a> <small>'+esc(cn[x.channel]||'')+'</small></li>'}).join('')+'</ul>';gl.hidden=false}
    }
  }).catch(function(){});
});})();
