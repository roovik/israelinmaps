(function(){
  var gs=document.getElementById('pgenre'),ps=document.getElementById('plist'),form=document.getElementById('pform'),qi=document.getElementById('pq'),grid=document.getElementById('pgrid'),pl=document.getElementById('pplayer'),nn=document.getElementById('pstatus');
  if(!gs)return;
  var sw=document.createElement('label');sw.className='srt';sw.innerHTML='Sort<select id="psort" aria-label="Sort">'+IMSort.opts([['new','Most recent'],['az','Playlist A-Z'],['src','Channel A-Z'],['rand','Random']])+'</select>';sw.className='';var mf0=document.querySelector('.mfilters');mf0.appendChild(sw);mf0.classList.add('m3');document.getElementById('psort').addEventListener('change',function(){run()});
  (function(){var mf=document.querySelector('.mfilters');if(!mf||!form)return;form.className='ffilter';[gs,ps,document.getElementById('psort')].forEach(function(x){if(x)form.insertBefore(x,qi)});mf.hidden=true;qi.placeholder='Keyword'})();
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  var GEN=[['news','News',/news|breaking|headline|briefing|update|live\b|in the news|rundown|global eye|middle east now/i],['opinion','Opinion',/opinion|op-ed|commentary|analysis|debate|interview|explained|narratives|here's the thing|opinionated|unmask|media/i],['documentary','Documentary',/documentar|docunation|history|inside|archaeolog|written in stone|story|stories|zionism|remembr|remembering|october 7|grief/i],['film','Films',/film|movie|trailer|cinema/i],['travel','Travel',/travel|tour|visit|trip|through the land|360|food|cuisine|hike|beach|isra?eats|culture|jerusalem|state of/i],['military','Military',/idf|military|soldier|army|war\b|operation|hamas|hezbollah|iran|missile|strike|hostage|combat|iron shield|roaring|rising lion|bringing them home|targeted/i],['humor','Humor',/humou?r|comed|funny|satire|parody|joke|laugh|in a minute/i],['music','Music',/music|song|concert|singer|band|eurovision/i],['culture','Culture and faith',/culture|jewish|holiday|torah|shabbat|passover|hanukkah|religion|synagogue|pride|peoples of israel/i]];
  gs.innerHTML='<option value="">All genres</option>'+GEN.map(function(g){return'<option value="'+g[0]+'">'+g[1]+'</option>'}).join('');
  var P=[],names={};
  fetch('/api/videos?lists=1&dates=1').then(function(r){if(!r.ok)throw 0;return r.json()}).catch(function(){return fetch('/api/videos?lists=1').then(function(r){if(!r.ok)throw 0;return r.json()})}).then(function(d){
    names=d.chnames||{};
    P=(d.playlists||[]).map(function(p){if(p.th&&!PTH[p.id])PTH[p.id]=p.th;return{id:p.id,name:p.name,ch:(p.channel||'').toLowerCase(),d:p.d||'',by:names[(p.channel||'').toLowerCase()]||p.by||''}});
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
  function hp(){var id=decodeURIComponent(location.hash.slice(1));if(id.indexOf('ch-')===0){var cc=id.slice(3).toLowerCase(),mine=P.filter(function(q){return q.ch===cc}).sort(function(a,b){return(b.d||'').localeCompare(a.d||'')});if(mine[0]){ps.value='';cdsync();run();play(mine[0].id,mine[0].name)}return}var x=P.filter(function(q){return q.id===id})[0];if(x){ps.value=id;cdsync();run();play(x.id,x.name)}}
  window.addEventListener('hashchange',hp);
  var PTH={};try{PTH=JSON.parse(sessionStorage.getItem('plthumbs')||'{}')}catch(e){}
  var curPl='';
  var stage=document.createElement('div');stage.className='stage';var sm=document.createElement('div');sm.className='stage-main';var sl=document.createElement('ul');sl.className='stage-list';sl.id='vlist';
  stage.hidden=true;pl.parentNode.insertBefore(stage,pl);stage.appendChild(sm);stage.appendChild(sl);sm.appendChild(pl);var more=document.createElement('div');more.className='pmore';var mh=document.createElement('h2');more.appendChild(mh);var pg=document.createElement('ul');pg.className='vgrid pgrid';pg.id='pgrid';grid.removeAttribute('id');grid.hidden=true;more.appendChild(pg);var mh2=document.createElement('h2');mh2.hidden=true;mh2.textContent='More Playlists';var pg2=document.createElement('ul');pg2.className='vgrid pgrid';pg2.hidden=true;more.appendChild(mh2);more.appendChild(pg2);stage.parentNode.insertBefore(more,stage.nextSibling);grid=pg;var VL={};
  var meta=document.createElement('div');meta.className='stage-meta';sm.appendChild(meta);
  function thumbs(){[].forEach.call(more.querySelectorAll('.sitem'),function(b){var id=b.getAttribute('data-id');if(PTH[id]||b._req)return;b._req=1;
    var go=function(){fetch('/api/videos?playlist='+encodeURIComponent(id)).then(function(r){return r.ok?r.json():null}).then(function(d){var c=d&&(d.channels||[])[0];if(c&&c.videos&&c.videos.length){PTH[id]=c.videos[0].v;try{sessionStorage.setItem('plthumbs',JSON.stringify(PTH))}catch(e){}var t=b.querySelector('.sth');if(t)t.innerHTML='<img src="https://i.ytimg.com/vi/'+PTH[id]+'/mqdefault.jpg" alt="" loading="lazy">'}}).catch(function(){})};
    if('IntersectionObserver' in window){var io=new IntersectionObserver(function(en){if(en[0].isIntersecting){io.disconnect();go()}},{root:null,rootMargin:'200px'});io.observe(b)}else go()})}
  function showPl(id,name,vid,auto){curPl=id;stage.hidden=false;
    pl.hidden=false;pl.innerHTML='<iframe src="https://www.youtube-nocookie.com/embed/'+(vid?encodeURIComponent(vid):'videoseries')+'?list='+encodeURIComponent(id)+'&rel=0'+(auto?'&autoplay=1&mute=1&playsinline=1&enablejsapi=1&origin='+encodeURIComponent(location.origin):'')+'" title="'+esc(name)+'" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
    if(auto){var f=pl.firstChild;function cmd(n){try{f.contentWindow.postMessage(JSON.stringify({event:'command',func:n,args:[]}),'*')}catch(x){}}function go(){cmd('playVideo');cmd('unMute')}f.addEventListener('load',function(){go();setTimeout(go,500);setTimeout(go,1500)})}
    window.IMNow&&IMNow('Playlist',name,(VL[id]&&(VL[id].filter(function(v){return v.v===vid})[0]||(!vid&&VL[id][0])||{}).t)||'');meta.innerHTML='';
    var draw=function(c){sl.innerHTML=c.map(function(v,i){return'<li><button type="button" class="sitem vit'+(v.v===vid?' on':'')+'" data-v="'+esc(v.v)+'"><span class="sth"><img src="https://i.ytimg.com/vi/'+esc(v.v)+'/mqdefault.jpg" alt="" loading="lazy"></span><span class="stx"><b>'+(i+1)+'. '+esc(v.t)+'</b></span></button></li>'}).join('');meta.innerHTML='';var cv=c.filter(function(v){return v.v===vid})[0]||(!vid&&c[0]);window.IMNow&&IMNow('Playlist',name,cv?cv.t:'')};
    if(VL[id]){draw(VL[id]);return}
    sl.innerHTML='<li class="small" style="padding:10px">Loading the videos in this playlist\u2026</li>';
    fetch('/api/videos?playlist='+encodeURIComponent(id)).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(d){var c=(d.channels||[])[0];if(!c||!c.videos.length)throw 0;VL[id]=c.videos;if(curPl===id)draw(c.videos)}).catch(function(){sl.innerHTML='<li class="small" style="padding:10px">The videos in this playlist are shown in the player.</li>'})}
  sl.addEventListener('click',function(e){var b=e.target.closest('.vit');if(!b)return;var x=P.filter(function(q){return q.id===curPl})[0];showPl(curPl,x?x.name:'',b.getAttribute('data-v'),true)});
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
    var sk=document.getElementById('psort').value;if(sk)list=IMSort.apply(list,sk,{date:function(x){return x.d||''},title:function(x){return x.name},src:function(x){return x.by}});if(sk==='new')list=list.slice().sort(function(a,b){return(b.d||'').localeCompare(a.d||'')});
    var cur=P.filter(function(p){return p.id===curPl})[0];
    if(cur&&!sel){list=list.filter(function(p){return p.id!==curPl});var cw=cur.name.toLowerCase().split(/\W+/).filter(function(w){return w.length>4});var sc=function(p){return(p.by&&p.by===cur.by?2:0)+(cw.some(function(w){return p.name.toLowerCase().indexOf(w)>=0})?1:0)};list=list.map(function(p,i){return[p,i]}).sort(function(a,b){return sc(b[0])-sc(a[0])||a[1]-b[1]}).map(function(x){return x[0]})}
    mh.textContent=!cur?'Latest playlists':(cur.by?'More playlists from '+cur.by+' and on similar topics':'More playlists');
    nn.textContent='';
    function cardOf(p){return'<li><button type="button" class="sitem pcard'+(p.id===curPl?' on':'')+'" data-id="'+esc(p.id)+'" data-n="'+esc(p.name)+'"><span class="sth">'+(PTH[p.id]?'<img src="https://i.ytimg.com/vi/'+esc(PTH[p.id])+'/mqdefault.jpg" alt="" loading="lazy">':'<span class="sph">&#9654;</span>')+'</span><span class="stx"><b>'+esc(p.name)+'</b><i>'+(p.by?esc(p.by):'Playlist')+(p.d?' \u00b7 '+new Date(p.d).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'')+'</i></span></button></li>'}
    var sameCh=cur&&!sel&&cur.by?list.filter(function(p){return p.by===cur.by}):null;
    if(sameCh){var oth=list.filter(function(p){return p.by!==cur.by});mh.textContent='More Playlists from '+cur.by;grid.innerHTML=sameCh.map(cardOf).join('');mh.hidden=grid.hidden=!sameCh.length;mh2.hidden=pg2.hidden=!oth.length;pg2.innerHTML=oth.map(cardOf).join('')}
    else{mh.hidden=grid.hidden=false;mh2.hidden=pg2.hidden=true;pg2.innerHTML='';grid.innerHTML=list.map(cardOf).join('')||'<li class="small">No playlists match. Try another genre or keyword.</li>'}
    thumbs();
    if(sel&&list.length===1&&document.activeElement===ps)play(list[0].id,list[0].name)}
  gs.addEventListener('change',run);ps.addEventListener('change',run);gs.addEventListener('change',cdsync);form.addEventListener('submit',function(e){e.preventDefault();run()});qi.addEventListener('input',run);
  [grid,pg2].forEach(function(g){g.addEventListener('click',function(e){var b=e.target.closest('.pcard');if(!b)return;play(b.getAttribute('data-id'),b.getAttribute('data-n'));run()})});
})();
