(function(){(window.NOWOV||Promise.resolve()).then(function(){
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function ago(iso){if(!iso)return'';var s=(Date.now()-new Date(iso))/1000;if(s<86400)return'today';if(s<2*86400)return'yesterday';if(s<30*86400)return Math.round(s/86400)+' days ago';if(s<365*86400)return Math.round(s/(30*86400))+' months ago';return Math.round(s/(365*86400))+' years ago'}
  function embed(v,auto){return'<iframe src="https://www.youtube-nocookie.com/embed/'+encodeURIComponent(v)+'?rel=0'+(auto?'&autoplay=1&mute=1&playsinline=1&enablejsapi=1':'')+'" onload="var w=this.contentWindow;[0,500,1500].forEach(function(t){setTimeout(function(){try{w.postMessage(JSON.stringify({event:\'command\',func:\'playVideo\',args:[]}),\'*\');w.postMessage(JSON.stringify({event:\'command\',func:\'unMute\',args:[]}),\'*\')}catch(x){}},t)})" title="Video player" allow="accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>'}
  function wurl(v,c,t){return'/video/watch/?v='+encodeURIComponent(v.v)+(c?'&c='+encodeURIComponent(c):'')+(t?'&t='+encodeURIComponent(t):'')}
  function card(v){return'<a class="tcard vcard" data-v="'+esc(v.v)+'" href="'+esc(wurl(v,v.c,v.t))+'"><span class="timg"><img src="https://i.ytimg.com/vi/'+esc(v.v)+'/mqdefault.jpg" alt="" loading="lazy"><span class="vplay">▶</span></span><span class="tb"><span class="tid">'+esc(v.n||'')+(v.n&&v.d?' · ':'')+ago(v.d)+'</span><b>'+esc(v.t)+'</b></span></a>'}
  var host=document.getElementById('vid-top'),onWatch=!!document.getElementById('vid-watch'),onChan=!!document.getElementById('vid-chan'),CTX=null,EVP=null,SEL=null;
  document.addEventListener('click',function(e){var pp=e.target.closest&&e.target.closest('a.vpop');if(pp&&!e.metaKey&&!e.ctrlKey&&!e.shiftKey){e.preventDefault();var w=window.open(pp.getAttribute('href'),'nowlej_player','popup=yes,width=1000,height=720,resizable=yes,scrollbars=yes');if(!w)location.href=pp.getAttribute('href');return}
    var fc=e.target.closest&&e.target.closest('a.fcard[data-v]');if(fc&&SEL&&!e.metaKey&&!e.ctrlKey&&!e.shiftKey&&!e.button){e.preventDefault();SEL(fc.getAttribute('data-v'));return}
    var a=e.target.closest&&e.target.closest('a.vcard,a.vli');if(!a||e.metaKey||e.ctrlKey||e.shiftKey||e.button)return;
    var v=a.getAttribute('data-v');if(a.classList.contains('vli')&&!(onWatch||onChan)&&host){/* main page: let the link open the channel context */}
    if(SEL&&a.closest('#vid-list,#vid-root,#vid-rel')){e.preventDefault();SEL(v)}
    else if(EVP&&a.closest('#vid-list,#e-video')){e.preventDefault();EVP(v)}
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
    function thumbs(){var T=gl.querySelector('.vthumbs');if(T)T.innerHTML=pins.slice(0,6).map(function(v){return card({v:v.v,t:v.t||'Video'})}).join('');mark()}
    var PT={};try{PT=JSON.parse(sessionStorage.getItem('plthumbs')||'{}')}catch(e){}
    function plName(x){return x.name&&!/^PL[\w-]{12,}$/.test(x.name)?x.name:'Playlist'}
    function plCard(x){var v=PT[x.id];return'<a class="plcard'+(x.id===act?' vnowp':'')+'" data-pl="'+esc(x.id)+'" href="/video/'+esc(x.slug)+'/"><span class="timg">'+(v?'<img src="https://i.ytimg.com/vi/'+esc(v)+'/mqdefault.jpg" alt="" loading="lazy">':'<span class="plph"></span>')+'<span class="vplay">\u25B6</span></span><span class="tb"><b>'+esc(plName(x))+'</b>'+(x.by?'<span class="tid">'+esc(x.by)+'</span>':'')+'</span></a><a class="vpop" href="/video/'+esc(x.slug)+'/" title="Open this playlist in a new window" aria-label="Open this playlist in a new window">\u2197</a>'}
    function plThumbs(){var T=gl.querySelector('.plthumbs');if(!T&&pls.length){T=document.createElement('div');T.className='vthumbs plthumbs';var a=gl.querySelector('.vthumbs');a.parentNode.insertBefore(T,a.nextSibling)}if(T)T.innerHTML=pls.map(function(x){return'<div class="plwrap">'+plCard(x)+'</div>'}).join('')}
    function loadPT(){pls.filter(function(x){return!PT[x.id]}).forEach(function(x){fetch('/api/videos?playlist='+encodeURIComponent(x.id)).then(function(r){return r.ok?r.json():null}).then(function(d){var c=d&&(d.channels||[])[0];if(c&&c.videos&&c.videos.length){PT[x.id]=c.videos[0].v;try{sessionStorage.setItem('plthumbs',JSON.stringify(PT))}catch(e){}draw()}}).catch(function(){})})}
    function draw(){thumbs();plThumbs();if(!L)return;
      var h=pls.length?'<div class="vseg" role="group" aria-label="Go to"><button type="button" data-b="v" aria-pressed="'+(mode==='v')+'">Videos</button><button type="button" data-b="p" aria-pressed="'+(mode==='p')+'">Playlists</button></div>':'';
      h+='<h2 id="vl-videos">'+esc(ttl)+'</h2><ul>'+list.map(function(v){return'<li><a class="vli" data-v="'+esc(v.v)+'" href="/video/watch/?v='+encodeURIComponent(v.v)+'&t='+encodeURIComponent(v.t||'')+'">'+esc(v.t||'Video')+'</a></li>'}).join('')+'</ul>';
      if(pls.length)h+='<h2 id="vl-pls">Playlists</h2><ul class="vpls plc">'+pls.map(function(x){return'<li>'+plCard(x)+'</li>'}).join('')+'</ul>';
      L.innerHTML=h;mark()}
    var plp=document.getElementById('e-plplayer'),plname='';
    function plSrc(vid,auto){return'https://www.youtube-nocookie.com/embed/'+(vid?encodeURIComponent(vid):'videoseries')+'?list='+encodeURIComponent(act)+'&rel=0'+(auto?'&autoplay=1&mute=1&playsinline=1':'')}
    function showPl(vid,auto){if(!plp)return;plp.hidden=false;plp.innerHTML='<div class="plh"><b>Playlist: '+esc(plname)+'</b><button type="button" class="plx">Close playlist player</button></div><iframe src="'+plSrc(vid,auto)+'" title="Playlist player" allow="accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>'}
    function closePl(){act='';mode='v';list=pins;ttl='Videos on this topic';if(plp){plp.hidden=true;plp.innerHTML=''}draw()}
    if(plp)plp.addEventListener('click',function(e){if(e.target.closest('.plx'))closePl()});
    EVP=function(id){if(act){showPl(id,true);plp.scrollIntoView({behavior:'smooth',block:'nearest'})}else{play(id,true);pl.scrollIntoView({behavior:'smooth',block:'nearest'})}};
    [gl,L].forEach(function(H){if(H)H.addEventListener('click',function(e){var a=e.target.closest('a[data-pl]');if(a&&!e.metaKey&&!e.ctrlKey&&H.contains(a)){e.preventDefault();var x=a.getAttribute('data-pl');var m=pls.filter(function(q){return q.id===x})[0];openPl(x,m?plName(m):'Playlist')}})});
    function openPl(id,nm){act=id;plname=nm;mode='v';ttl='Playlist: '+nm;list=[];draw();showPl('',false);plp.scrollIntoView({behavior:'smooth',block:'nearest'});
      fetch('/api/videos?playlist='+encodeURIComponent(id)).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(d){var c=(d.channels||[])[0];if(!c||!c.videos.length)throw 0;if(act!==id)return;list=c.videos.map(function(v){return{v:v.v,t:v.t}});draw()}).catch(function(){})}
    if(L){L.addEventListener('click',function(e){
      var b=e.target.closest('button[data-b]');
      if(b){if(b.getAttribute('data-b')==='v'){closePl();L.scrollTop=0;window.scrollTo({top:L.getBoundingClientRect().top+window.pageYOffset-80,behavior:'smooth'})}else{mode='p';draw();var t=document.getElementById('vl-pls');if(t)t.scrollIntoView({behavior:'smooth',block:'start'})}return}
      })}
    draw();loadPT();if(pins.length)play(pins[0].v,false);else pl.hidden=true;
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
      host.hidden=true;listText('Videos',all.slice(0,20));
      var h='';
      chs.forEach(function(c){h+='<section class="vch"><h2><a href="/video/'+esc(sl(c))+'/">'+esc(lab(c))+'</a></h2><div class="tgrid">'+c.videos.slice(0,8).map(card).join('')+'</div><p class="small"><a href="/video/'+esc(sl(c))+'/">All videos from '+esc(c.name)+'</a></p></section>'});
      if((d.playlists||[]).length){h+='<h2 id="playlists">Playlists</h2>';chs.forEach(function(c){var pls=d.playlists.filter(function(x){return x.channel===String(c.key).toLowerCase()});if(pls.length)h+='<h3>'+esc(c.name)+'</h3><ul class="vpl">'+pls.map(function(x){return'<li><a href="/video/pl-'+esc(x.id.toLowerCase())+'/">'+esc(x.name)+'</a></li>'}).join('')+'</ul>'})}
      root.innerHTML=h;vfilter(all,chs,h);
    }

    function vfilter(all,chs,orig){
      var GEN=[['news','News',/news|breaking|headline|briefing|update|live\b/i],['opinion','Opinion',/opinion|op-ed|commentary|analysis|debate|interview|explained|why /i],['documentary','Documentary',/documentar|docunation|history|inside|archaeolog|written in stone|story of/i],['film','Films',/film|movie|trailer|cinema/i],['travel','Travel',/travel|tour|visit|trip|through the land|360|food|cuisine|hike|beach|isra?eats/i],['military','Military',/idf|military|soldier|army|war\b|operation|hamas|hezbollah|iran|missile|strike|hostage|combat|air force|navy/i],['humor','Humor',/humou?r|comed|funny|satire|parody|joke|laugh/i],['music','Music',/music|song|concert|singer|band|eurovision/i],['culture','Culture and faith',/culture|jewish|holiday|torah|shabbat|passover|hanukkah|religion|synagogue/i]];
      var YTC={'1':'Film & Animation','2':'Autos & Vehicles','10':'Music','15':'Pets & Animals','17':'Sports','19':'Travel & Events','20':'Gaming','22':'People & Blogs','23':'Comedy','24':'Entertainment','25':'News & Politics','26':'Howto & Style','27':'Education','28':'Science & Technology','29':'Nonprofits & Activism'};
      var present={};all.forEach(function(v){if(v.cat&&YTC[v.cat])present[v.cat]=1});
      var bar=document.createElement('div');bar.className='vfbar';
      bar.innerHTML='<div class="mfilters"><label>Genre<select id="vf-g"><option value="">All genres</option><optgroup label="Genre">'+GEN.map(function(g){return'<option value="g:'+g[0]+'">'+g[1]+'</option>'}).join('')+'</optgroup>'+(Object.keys(present).length?'<optgroup label="YouTube category">'+Object.keys(present).sort(function(a,b){return YTC[a]<YTC[b]?-1:1}).map(function(k){return'<option value="c:'+k+'">'+YTC[k]+'</option>'}).join('')+'</optgroup>':'')+'</select></label><label>Channel<select id="vf-c"><option value="">All channels</option>'+chs.map(function(c){return'<option value="'+esc(sl(c))+'">'+esc(c.name)+'</option>'}).join('')+'</select></label></div><form class="imgbar" id="vf-f" role="search"><input id="vf-q" type="search" placeholder="keyword(s)" aria-label="Keyword"><button>Filter</button></form><label>Sort<select id="vf-s" aria-label="Sort">'+IMSort.opts([['new','Newest first'],['old','Oldest first'],['src','Channel A to Z'],['az','Title A to Z'],['rand','Random']])+'</select></label><p class="small" id="vf-n" role="status"></p>';
      (function(){var sl=bar.querySelector('#vf-s').parentNode,mf=bar.querySelector('.mfilters');mf.appendChild(sl);mf.classList.add('m3')})();host.parentNode.insertBefore(bar,host);(function(){var f=bar.querySelector('#vf-f'),mf=bar.querySelector('.mfilters'),q0=f&&f.querySelector('#vf-q');if(!f||!mf||!q0)return;f.className='ffilter';[].slice.call(mf.querySelectorAll('select')).forEach(function(s){f.insertBefore(s,q0)});mf.hidden=true;q0.placeholder='Keyword'})();
      var gs=document.getElementById('vf-g'),cs=document.getElementById('vf-c'),qi=document.getElementById('vf-q'),nn=document.getElementById('vf-n');
      var cr=document.createElement('section');cr.hidden=true;host.parentNode.insertBefore(cr,root);
      var rel=document.createElement('div');rel.id='vid-rel';rel.hidden=true;host.parentNode.insertBefore(rel,cr);
      var byId={};all.forEach(function(x){byId[x.v]=x});var csig='';
      function car(list){var it=list.slice(0,12),sg=it.map(function(x){return x.v}).join('|');if(sg===csig)return;csig=sg;
        if(!window.IMFeat||it.length<3){cr.hidden=true;return}
        window.IMFeat.mount(cr,it.map(function(x){return{img:'https://i.ytimg.com/vi/'+x.v+'/mqdefault.jpg',t:x.t,s:x.n,a:wurl(x,x.c,x.t),v:x.v}}),{ms:2500,cls:'io'})}
      function back(){run()}
      SEL=function(id){var x=byId[id];if(!x)return;var c=chs.filter(function(k){return sl(k)===x.c})[0];
        host.innerHTML=embed(x.v,true);host.hidden=false;
        var more=c?c.videos.filter(function(k){return k.v!==x.v}):[];
        rel.hidden=false;rel.innerHTML='<h2 class="vnowt">'+esc(x.t)+'</h2><p class="small">'+esc(x.n||'')+(x.d?' \u00b7 '+ago(x.d):'')+' \u00b7 <button type="button" class="vback">Back to all videos</button></p>'+(x.x?'<p>'+esc(x.x)+'</p>':'')+
          '<h2>'+(c&&c.kind==='playlist'?'Playlist: '+esc(c.name)+' \u00b7 '+c.videos.length+' videos':'More from '+esc(x.n||'this channel')+' (channel videos, not a playlist)')+'</h2><div class="tgrid">'+more.slice(0,12).map(card).join('')+'</div>';
        root.hidden=true;cr.hidden=true;rel.querySelector('.vback').addEventListener('click',back);
        try{document.title=x.t+' | Israel NOWlej'}catch(e){}
        bar.scrollIntoView({behavior:'smooth',block:'start'})};
      function run(){
        if(!host.hidden){host.hidden=true;host.innerHTML='';rel.hidden=true;rel.innerHTML='';root.hidden=false;cr.hidden=false;csig=''}
        var g=gs.value,c=cs.value,q=qi.value.trim().toLowerCase();
        var sk=document.getElementById('vf-s').value;if(!g&&!c&&!q&&sk==='new'){root.innerHTML=orig;nn.textContent='';car(all.slice().sort(function(a,b){return(b.d||'').localeCompare(a.d||'')}));if(!host.hidden){}return}
        var list=all.filter(function(v){
          if(c&&v.c!==c)return false;
          if(g){var k=g.slice(2);if(g[0]==='c'){if(v.cat!==k)return false}else{var re=GEN.filter(function(x){return x[0]===k})[0][2];if(!re.test(v.t+' '+(v.x||'')+' '+(v.n||'')))return false}}
          if(q&&(v.t+' '+(v.x||'')+' '+(v.n||'')).toLowerCase().indexOf(q)<0)return false;
          return true});
        if(sk)list=IMSort.apply(list,sk,{date:function(x){return x.d},title:function(x){return x.t},src:function(x){return x.n}});
        nn.textContent=list.length+(list.length===1?' video':' videos');car(list);
        root.innerHTML=list.length?'<div class="tgrid">'+list.slice(0,60).map(card).join('')+'</div>':'<p>No videos match. Try another genre, channel or keyword.</p>'}
      run();gs.addEventListener('change',run);cs.addEventListener('change',run);document.getElementById('vf-s').addEventListener('change',run);document.getElementById('vf-f').addEventListener('submit',function(e){e.preventDefault();run()});qi.addEventListener('input',run)
    }
    function listText(title,vs,chkey,cur){var L=document.getElementById('vid-list');if(!L)return;
      var pls=chkey?(d.playlists||[]).filter(function(x){return x.channel===chkey}):[];
      var seg='';
      if(chkey&&pls.length){seg='<div class="vseg" role="group" aria-label="Go to"><a href="/video/'+esc(chkey)+'/#playlists">Playlists</a></div>'}
      var h=seg+
        '<h2 id="vl-videos">'+esc(title)+'</h2><ul>'+vs.map(function(v){return'<li><a class="vli" data-v="'+esc(v.v)+'" href="'+esc(wurl(v,v.c,v.t))+'">'+esc(v.t)+'</a><span class="wm">'+esc(v.n||'')+(v.d?' · '+ago(v.d):'')+'</span></li>'}).join('')+'</ul>';
      if(pls.length)h+='<h2 id="vl-pls">Channel playlists</h2><ul class="vpls">'+pls.map(function(x){var on=cur&&x.id===cur;return'<li><a'+(on?' class="vnowp" aria-current="page"':'')+' href="/video/pl-'+esc(x.id.toLowerCase())+'/">'+esc(x.name)+'</a> <a class="vpop" href="/video/pl-'+esc(x.id.toLowerCase())+'/" title="Open this playlist in a new window" aria-label="Open this playlist in a new window">\u2197</a></li>'}).join('')+'</ul>';
      L.innerHTML=h;
      [].forEach.call(L.querySelectorAll('.vseg a'),function(a){a.addEventListener('click',function(e){var u=a.getAttribute('href').split('#'),t=document.getElementById(u[1]);if(t&&location.pathname===u[0]){e.preventDefault();t.scrollIntoView({behavior:'smooth',block:'start'})}})})
    }
    function context(c,vid,titleEl,box){
      var byv={};c.videos.forEach(function(v){byv[v.v]=v});
      var now=document.createElement('div');now.className='vnow';host.parentNode.insertBefore(now,host.nextSibling);
      function setP(id,auto){var v=byv[id]||c.videos[0];
        host.innerHTML=embed(v.v,auto);host.hidden=false;
        if(titleEl)titleEl.textContent=v.t;document.title=v.t+' | Israel NOWlej';
        var ix=c.videos.indexOf(v);now.innerHTML=(c.kind==='playlist'?'<p class="plbadge"><b>Playlist: '+esc(c.name)+'</b> \u00b7 video '+(ix+1)+' of '+c.videos.length+'</p>':'')+'<p class="small">'+esc(v.n||c.name)+' \u00b7 '+ago(v.d)+'</p>'+(v.x?'<p>'+esc(v.x)+'</p>':'');
        [].forEach.call(document.querySelectorAll('.vcard,.vli'),function(a){var on=a.getAttribute('data-v')===v.v;a.classList.toggle('vnowp',on);(a.classList.contains('vli')?a.parentNode:a).hidden=on});
        try{history.replaceState(null,'','?v='+encodeURIComponent(v.v))}catch(x){}}
      var ck=c.kind==='playlist'?(c.channel||''):String(c.key).toLowerCase();
      var mpl=ck?(d.playlists||[]).filter(function(x){return x.channel===ck}):[];
      var cn=(d.chnames||{})[ck]||c.name;
      box.innerHTML=(c.kind==='playlist'?'<h2 id="ch-videos">Videos in this playlist</h2>':(titleEl?'<h2 id="ch-videos">More from '+esc(c.name)+'</h2>':''))+'<div class="tgrid">'+c.videos.map(card).join('')+'</div>'+(mpl.length?'<h2 id="playlists">Playlists from '+esc(cn)+'</h2><ul class="vpl">'+mpl.map(function(x){var on=c.kind==='playlist'&&x.id===c.key;return'<li><a'+(on?' class="vnowp"':'')+' href="/video/pl-'+esc(x.id.toLowerCase())+'/">'+esc(x.name)+'</a></li>'}).join('')+'</ul>':'');
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
