(function(){
  var gs=document.getElementById('pgenre'),ps=document.getElementById('plist'),form=document.getElementById('pform'),qi=document.getElementById('pq'),grid=document.getElementById('pgrid'),pl=document.getElementById('pplayer'),nn=document.getElementById('pstatus');
  if(!gs)return;
  var sw=document.createElement('label');sw.className='srt';sw.innerHTML='Sort<select id="psort" aria-label="Sort">'+IMSort.opts([['az','Playlist A to Z'],['src','Channel A to Z'],['rand','Random']])+'</select>';sw.className='';var mf0=document.querySelector('.mfilters');mf0.appendChild(sw);mf0.classList.add('m3');document.getElementById('psort').addEventListener('change',function(){run()});
  (function(){var mf=document.querySelector('.mfilters');if(!mf||!form)return;form.className='ffilter';[gs,ps,document.getElementById('psort')].forEach(function(x){if(x)form.insertBefore(x,qi)});mf.hidden=true;qi.placeholder='Keyword'})();
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  var GEN=[['news','News',/news|breaking|headline|briefing|update|live\b|in the news|rundown|global eye|middle east now/i],['opinion','Opinion',/opinion|op-ed|commentary|analysis|debate|interview|explained|narratives|here's the thing|opinionated|unmask|media/i],['documentary','Documentary',/documentar|docunation|history|inside|archaeolog|written in stone|story|stories|zionism|remembr|remembering|october 7|grief/i],['film','Films',/film|movie|trailer|cinema/i],['travel','Travel',/travel|tour|visit|trip|through the land|360|food|cuisine|hike|beach|isra?eats|culture|jerusalem|state of/i],['military','Military',/idf|military|soldier|army|war\b|operation|hamas|hezbollah|iran|missile|strike|hostage|combat|iron shield|roaring|rising lion|bringing them home|targeted/i],['humor','Humor',/humou?r|comed|funny|satire|parody|joke|laugh|in a minute/i],['music','Music',/music|song|concert|singer|band|eurovision/i],['culture','Culture and faith',/culture|jewish|holiday|torah|shabbat|passover|hanukkah|religion|synagogue|pride|peoples of israel/i]];
  gs.innerHTML='<option value="">All genres</option>'+GEN.map(function(g){return'<option value="'+g[0]+'">'+g[1]+'</option>'}).join('');
  var P=[],names={};
  fetch('/api/videos?lists=1').then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(d){
    names=d.chnames||{};
    P=(d.playlists||[]).map(function(p){return{id:p.id,name:p.name,by:names[(p.channel||'').toLowerCase()]||p.by||''}});
    ps.innerHTML='<option value="">All Israel playlists</option>'+P.map(function(p,i){return'<option value="'+esc(p.id)+'">'+esc(p.name)+'</option>'}).join('');
    cdd();run();hp()
  }).catch(function(){nn.textContent='The playlists could not be loaded right now. Please try again shortly.'});

  var cd,cb,cl;
  function cdd(){
    if(!cd){cd=document.createElement('div');cd.className='cdd';cb=document.createElement('button');cb.type='button';cb.className='cdd-b';cb.setAttribute('aria-haspopup','listbox');cl=document.createElement('ul');cl.className='cdd-l';cl.hidden=true;cl.setAttribute('role','listbox');cd.appendChild(cb);cd.appendChild(cl);ps.parentNode.insertBefore(cd,ps);ps.classList.add('cdd-native');ps.setAttribute('aria-hidden','true');ps.tabIndex=-1;
      cb.addEventListener('click',function(){cl.hidden=!cl.hidden});
      document.addEventListener('click',function(e){if(!cd.contains(e.target))cl.hidden=true});
      cl.addEventListener('click',function(e){var li=e.target.closest('li');if(!li)return;ps.value=li.getAttribute('data-v');cl.hidden=true;ps.focus();ps.dispatchEvent(new Event('change'));cdsync()})}
    cl.innerHTML=P.length?'<li data-v="" role="option"><b>All Israel playlists</b></li>'+P.map(function(p){return'<li role="option" data-v="'+esc(p.id)+'"><b>'+esc(p.name)+'</b>'+(p.by?' <span>'+esc(p.by)+'</span>':'')+'</li>'}).join(''):'';
    cdsync()}
  function cdsync(){var o=ps.options[ps.selectedIndex];cb.innerHTML='<b>'+esc(o?o.textContent:'All Israel playlists')+'</b>'}
  function hp(){var id=decodeURIComponent(location.hash.slice(1));var x=P.filter(function(q){return q.id===id})[0];if(x){ps.value=id;cdsync();run();play(x.id,x.name)}}
  window.addEventListener('hashchange',hp);
  var PTH={};try{PTH=JSON.parse(sessionStorage.getItem('plthumbs')||'{}')}catch(e){}
  var curPl='';
  var stage=document.createElement('div');stage.className='stage';var sm=document.createElement('div');sm.className='stage-main';var sl=document.createElement('ul');sl.className='stage-list';
  pl.parentNode.insertBefore(stage,pl);stage.appendChild(sm);stage.appendChild(sl);sm.appendChild(pl);sl.id='pgrid';grid.removeAttribute('id');grid.hidden=true;grid=sl;
  var meta=document.createElement('div');meta.className='stage-meta';sm.appendChild(meta);var vids=document.createElement('div');vids.className='stage-vids';sm.appendChild(vids);
  function thumbs(){[].forEach.call(grid.querySelectorAll('.sitem'),function(b){var id=b.getAttribute('data-id');if(PTH[id]||b._req)return;b._req=1;
    var go=function(){fetch('/api/videos?playlist='+encodeURIComponent(id)).then(function(r){return r.ok?r.json():null}).then(function(d){var c=d&&(d.channels||[])[0];if(c&&c.videos&&c.videos.length){PTH[id]=c.videos[0].v;try{sessionStorage.setItem('plthumbs',JSON.stringify(PTH))}catch(e){}var t=b.querySelector('.sth');if(t)t.innerHTML='<img src="https://i.ytimg.com/vi/'+PTH[id]+'/mqdefault.jpg" alt="" loading="lazy">'}}).catch(function(){})};
    if('IntersectionObserver' in window){var io=new IntersectionObserver(function(en){if(en[0].isIntersecting){io.disconnect();go()}},{root:grid,rootMargin:'200px'});io.observe(b)}else go()})}
  function showPl(id,name,vid,auto){curPl=id;
    pl.hidden=false;pl.innerHTML='<iframe src="https://www.youtube-nocookie.com/embed/'+(vid?encodeURIComponent(vid):'videoseries')+'?list='+encodeURIComponent(id)+'&rel=0'+(auto?'&autoplay=1&mute=1&playsinline=1&enablejsapi=1&origin='+encodeURIComponent(location.origin):'')+'" title="'+esc(name)+'" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
    if(auto){var f=pl.firstChild;function cmd(n){try{f.contentWindow.postMessage(JSON.stringify({event:'command',func:n,args:[]}),'*')}catch(x){}}function go(){cmd('playVideo');cmd('unMute')}f.addEventListener('load',function(){go();setTimeout(go,500);setTimeout(go,1500)})}
    meta.innerHTML='<p class="plbadge"><b>Playlist: '+esc(name)+'</b></p>';
    if(!vid){vids.innerHTML='<p class="small">Loading the videos in this playlist…</p>';
      fetch('/api/videos?playlist='+encodeURIComponent(id)).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(d){if(curPl!==id)return;var c=(d.channels||[])[0];if(!c||!c.videos.length)throw 0;
        meta.innerHTML='<p class="plbadge"><b>Playlist: '+esc(name)+'</b> \u00b7 '+c.videos.length+' videos</p>';
        vids.innerHTML='<h2>Videos in this playlist</h2><ul class="vgrid">'+c.videos.map(function(v,i){return'<li><button type="button" class="vcell" data-v="'+esc(v.v)+'"><img src="https://i.ytimg.com/vi/'+esc(v.v)+'/mqdefault.jpg" alt="" loading="lazy"><span>'+(i+1)+'. '+esc(v.t)+'</span></button></li>'}).join('')+'</ul>';
        vids.onclick=function(e){var b=e.target.closest('.vcell');if(!b)return;showPl(id,name,b.getAttribute('data-v'),true)}}).catch(function(){vids.innerHTML=''})}}
  function play(id,name){showPl(id,name,'',true);pl.scrollIntoView({block:'nearest'});return;
    pl.hidden=false;pl.innerHTML='<iframe src="https://www.youtube-nocookie.com/embed/videoseries?list='+encodeURIComponent(id)+'&rel=0&autoplay=1&mute=1&playsinline=1&enablejsapi=1&origin='+encodeURIComponent(location.origin)+'" title="'+esc(name)+'" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
    var f=pl.firstChild;function cmd(n){try{f.contentWindow.postMessage(JSON.stringify({event:'command',func:n,args:[]}),'*')}catch(x){}}function go(){cmd('playVideo');cmd('unMute')}
    f.addEventListener('load',function(){go();setTimeout(go,500);setTimeout(go,1500)});pl.scrollIntoView({block:'nearest'})}
  function run(){
    var g=gs.value,sel=ps.value,q=qi.value.trim().toLowerCase();
    var list=P.filter(function(p){
      if(sel&&p.id!==sel)return false;
      var t=p.name+' '+p.by;
      if(g){var re=GEN.filter(function(x){return x[0]===g})[0][2];if(!re.test(t))return false}
      if(q&&t.toLowerCase().indexOf(q)<0)return false;return true});
    var sk=document.getElementById('psort').value;if(sk)list=IMSort.apply(list,sk,{date:function(){return 0},title:function(x){return x.name},src:function(x){return x.by}});
    nn.textContent=list.length+(list.length===1?' playlist':' playlists');
    grid.innerHTML=list.map(function(p){return'<li><button type="button" class="sitem pcard'+(p.id===curPl?' on':'')+'" data-id="'+esc(p.id)+'" data-n="'+esc(p.name)+'"><span class="sth">'+(PTH[p.id]?'<img src="https://i.ytimg.com/vi/'+esc(PTH[p.id])+'/mqdefault.jpg" alt="" loading="lazy">':'<span class="sph">&#9654;</span>')+'</span><span class="stx"><b>'+esc(p.name)+'</b><i>Playlist'+(p.by?' \u00b7 '+esc(p.by):'')+'</i></span></button></li>'}).join('')||'<li class="small">No playlists match. Try another genre or keyword.</li>';
    thumbs();if(!curPl&&list.length&&!pl.querySelector('iframe')){curPl=list[0].id;var f0=grid.querySelector('.sitem');if(f0)f0.classList.add('on');showPl(list[0].id,list[0].name,'',false)}
    if(sel&&list.length===1&&document.activeElement===ps)play(list[0].id,list[0].name)}
  gs.addEventListener('change',run);ps.addEventListener('change',run);gs.addEventListener('change',cdsync);form.addEventListener('submit',function(e){e.preventDefault();run()});qi.addEventListener('input',run);
  grid.addEventListener('click',function(e){var b=e.target.closest('.pcard');if(!b)return;[].forEach.call(grid.querySelectorAll('.pcard.on'),function(x){x.classList.remove('on')});b.classList.add('on');play(b.getAttribute('data-id'),b.getAttribute('data-n'))});
})();
