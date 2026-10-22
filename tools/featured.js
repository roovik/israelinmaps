/* Featured slideshows for the Media sections. Auto-rotating, diverse picks, pauses on hover, honors reduced motion. */
(function(){
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function shuf(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t}return a}
  function j(u){return fetch(u).then(function(r){if(!r.ok)throw 0;return r.json()})}
  var YT='https://i.ytimg.com/vi/';
  /* modal player */
  var modal=null;
  function play(o){
    if(!modal){modal=document.createElement('div');modal.className='fmodal';modal.hidden=true;modal.innerHTML='<div class="fbox"><button type="button" class="fx" aria-label="Close">&times;</button><div class="fpl"></div></div>';document.body.appendChild(modal);
      modal.addEventListener('click',function(e){if(e.target===modal||e.target.closest('.fx')){modal.hidden=true;modal.querySelector('.fpl').innerHTML=''}});
      document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!modal.hidden){modal.hidden=true;modal.querySelector('.fpl').innerHTML=''}})}
    var src=o.pl?'https://www.youtube-nocookie.com/embed/videoseries?list='+encodeURIComponent(o.pl):'https://www.youtube-nocookie.com/embed/'+encodeURIComponent(o.y);
    modal.querySelector('.fpl').innerHTML='<iframe src="'+src+(o.pl?'&':'?')+'rel=0&autoplay=1&mute=1&playsinline=1&enablejsapi=1&origin='+encodeURIComponent(location.origin)+'" title="Player" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
    modal.hidden=false;var f=modal.querySelector('iframe');function cmd(n){try{f.contentWindow.postMessage(JSON.stringify({event:'command',func:n,args:[]}),'*')}catch(x){}}
    f.addEventListener('load',function(){[0,500,1500].forEach(function(t){setTimeout(function(){cmd('playVideo');cmd('unMute')},t)})})}
  /* slideshow */
  function mount(host,items,opt){
    opt=opt||{};items=items.filter(function(x){return x&&x.img});if(!items.length){host.hidden=true;return}
    host.hidden=false;host.className='feat'+(opt.cls?' '+opt.cls:'');
    host.innerHTML=(opt.title?'<h2 class="feath">'+(opt.href?'<a href="'+esc(opt.href)+'">'+esc(opt.title)+'</a>':esc(opt.title))+'</h2>':'')+'<div class="ftrack" tabindex="0" aria-roledescription="carousel" aria-label="'+esc(opt.title||'Featured')+'">'+items.map(function(x,i){
      var inner='<img src="'+esc(x.img)+'" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.closest(\'.fcard\').classList.add(\'noimg\');this.remove()"><span class="fcap"><b>'+esc(x.t)+'</b>'+(x.s?'<i>'+esc(x.s)+'</i>':'')+'</span>'+(x.y||x.pl?'<span class="fplay">&#9654;</span>':'');
      return x.y||x.pl?'<button type="button" class="fcard" data-i="'+i+'">'+inner+'</button>':'<a class="fcard" href="'+esc(x.a)+'"'+(x.v?' data-v="'+esc(x.v)+'"':'')+(x.ext?' target="_blank" rel="noopener"':'')+'>'+inner+'</a>'}).join('')+'</div><button type="button" class="farr fprev" aria-label="Previous">&#10094;</button><button type="button" class="farr fnext" aria-label="Next">&#10095;</button><div class="fdots" aria-hidden="true">'+items.map(function(x,i){return'<span data-i="'+i+'"></span>'}).join('')+'</div>';
    var tr=host.querySelector('.ftrack'),dots=host.querySelectorAll('.fdots span'),idx=0,paused=false,t=null;
    function cw(){var c=tr.querySelector('.fcard');return c?c.getBoundingClientRect().width+12:300}
    function vis(){return Math.max(1,Math.round(tr.clientWidth/cw()))}
    function go(i){var n=items.length;idx=((i%n)+n)%n;tr.scrollTo({left:idx*cw(),behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});dots.forEach(function(d,k){d.className=k===idx?'on':''})}
    function step(){if(paused||document.hidden)return;var n=items.length,maxIdx=Math.max(0,n-vis());go(idx>=maxIdx?0:idx+1)}
    function start(){clearInterval(t);if(!matchMedia('(prefers-reduced-motion:reduce)').matches)t=setInterval(step,opt.ms||4500)}
    tr.addEventListener('scroll',function(){var k=Math.round(tr.scrollLeft/cw());if(k!==idx){idx=k;dots.forEach(function(d,q){d.className=q===idx?'on':''})}},{passive:true});
    ['mouseenter','focusin','touchstart'].forEach(function(e){host.addEventListener(e,function(){paused=true},{passive:true})});
    ['mouseleave','focusout'].forEach(function(e){host.addEventListener(e,function(){paused=false})});
    host.addEventListener('touchend',function(){setTimeout(function(){paused=false},6000)},{passive:true});
    tr.addEventListener('click',function(e){var b=e.target.closest('button.fcard');if(!b)return;var x=items[+b.getAttribute('data-i')];play(x)});
    host.querySelector('.fprev').addEventListener('click',function(){var n=items.length,mx=Math.max(0,n-vis());go(idx<=0?mx:idx-1);start()});
    host.querySelector('.fnext').addEventListener('click',function(){var n=items.length,mx=Math.max(0,n-vis());go(idx>=mx?0:idx+1);start()});
    dots.forEach(function(d,k){d.style.cursor='pointer';d.addEventListener('click',function(){go(k);start()})});
    go(0);start()}
  /* sources of items */
  var G=['pop','rock','mizrahi','folk','hiphop','electronic','jazz','klezmer','classical','kids'];
  var T=['jerusalem','tel-aviv','galilee','negev','dead-sea','landscape','archaeology','holy','haifa','golan'];
  function vids(){return j('/api/videos').then(function(d){var chs=(d.channels||[]).filter(function(c){return c.videos&&c.videos.length}),out=[],r=0;
    while(out.length<14&&r<4){chs.forEach(function(c){var v=c.videos[r];if(v)out.push({img:YT+v.v+'/mqdefault.jpg',t:v.t,s:c.name,a:'/video/watch/?v='+encodeURIComponent(v.v)+'&c='+encodeURIComponent(String(c.key).toLowerCase())+'&t='+encodeURIComponent(v.t)})});r++}
    return shuf(out).slice(0,12)})}
  function lists(){return j('/api/videos?lists=1').then(function(d){var names=d.chnames||{},ps=shuf(d.playlists||[]).slice(0,8);
    return Promise.all(ps.map(function(p){return j('/api/videos?playlist='+encodeURIComponent(p.id)).then(function(x){var c=(x.channels||[])[0],v=c&&c.videos&&c.videos[0];return v?{img:YT+v.v+'/mqdefault.jpg',t:p.name,s:names[(p.channel||'').toLowerCase()]||p.by||'Playlist',pl:p.id}:null}).catch(function(){return null})})).then(function(a){return a.filter(Boolean)})})}
  function pods(){return j('/voices.json').then(function(d){var sh=shuf(d.shows||[]).slice(0,6);
    return Promise.all(sh.map(function(s){return j('/api/voice?id='+encodeURIComponent(s.id)).then(function(v){var e=(v.podcasts||[]).filter(function(x){return x.i})[0]||null;return e?{img:e.i,t:s.name,s:e.t,a:'/audio/#s-'+s.id}:null}).catch(function(){return null})})).then(function(a){return a.filter(Boolean)})})}
  function music(){return Promise.all(shuf(G).slice(0,4).map(function(g){return j('/api/music?genre='+g+'&order=viewCount').then(function(d){return(d.items||[]).slice(0,3).map(function(x){return{img:x.img,t:x.t,s:x.a,y:x.id}})}).catch(function(){return[]})})).then(function(a){return shuf([].concat.apply([],a)).slice(0,12)})}
  function images(){return Promise.all(shuf(T).slice(0,4).map(function(g){return j('/api/images?tag='+g+'&q=&o=0').then(function(d){return(d.items||[]).slice(0,3).map(function(x){return{img:x.th,t:x.t,s:x.a||'',a:x.page,ext:true}})}).catch(function(){return[]})})).then(function(a){return shuf([].concat.apply([],a)).slice(0,12)})}
  var K={video:[vids,'Video','/video/'],playlists:[lists,'Playlists','/playlists/'],audio:[pods,'Podcasts','/audio/'],music:[music,'Music','/music/'],images:[images,'Images','/images/']};
  window.IMFeat={mount:mount,play:play};
  var p=location.pathname,page=p.indexOf('/video/')===0&&p!=='/video/'?'':p.replace(/\//g,'');
  var h1=document.querySelector('.newsmain h1');if(!h1)return;
  function mk(k,title,href){var d=document.createElement('section');d.hidden=true;K[k][0]().then(function(items){if(!d.parentNode)(document.querySelector('.newsmain .ffilter')||h1).insertAdjacentElement('afterend',d);mount(d,items,{title:title,href:href})}).catch(function(){});return d}
  if(page==='media'){var anchor=h1.nextElementSibling&&h1.nextElementSibling.classList.contains('lead')?h1.nextElementSibling:h1;
    var after=anchor;['video','playlists','audio','music','images'].forEach(function(k){var d=mk(k,K[k][1],K[k][2]);after.insertAdjacentElement('afterend',d);after=d})}
  else if(K[page]&&page!=='images'&&page!=='playlists'&&p!=='/video/'&&(page!=='video'||p==='/video/')){var d=mk(page,'Featured')}
})();
