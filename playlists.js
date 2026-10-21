(function(){
  var gs=document.getElementById('pgenre'),ps=document.getElementById('plist'),form=document.getElementById('pform'),qi=document.getElementById('pq'),grid=document.getElementById('pgrid'),pl=document.getElementById('pplayer'),nn=document.getElementById('pstatus');
  if(!gs)return;
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  var GEN=[['news','News',/news|breaking|headline|briefing|update|live\b|in the news|rundown|global eye|middle east now/i],['opinion','Opinion',/opinion|op-ed|commentary|analysis|debate|interview|explained|narratives|here's the thing|opinionated|unmask|media/i],['documentary','Documentary',/documentar|docunation|history|inside|archaeolog|written in stone|story|stories|zionism|remembr|remembering|october 7|grief/i],['film','Films',/film|movie|trailer|cinema/i],['travel','Travel',/travel|tour|visit|trip|through the land|360|food|cuisine|hike|beach|isra?eats|culture|jerusalem|state of/i],['military','Military',/idf|military|soldier|army|war\b|operation|hamas|hezbollah|iran|missile|strike|hostage|combat|iron shield|roaring|rising lion|bringing them home|targeted/i],['humor','Humor',/humou?r|comed|funny|satire|parody|joke|laugh|in a minute/i],['music','Music',/music|song|concert|singer|band|eurovision/i],['culture','Culture and faith',/culture|jewish|holiday|torah|shabbat|passover|hanukkah|religion|synagogue|pride|peoples of israel/i]];
  gs.innerHTML='<option value="">All genres</option>'+GEN.map(function(g){return'<option value="'+g[0]+'">'+g[1]+'</option>'}).join('');
  var P=[],names={};
  fetch('/api/videos?lists=1').then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(d){
    names=d.chnames||{};
    P=(d.playlists||[]).map(function(p){return{id:p.id,name:p.name,by:names[(p.channel||'').toLowerCase()]||p.by||''}});
    ps.innerHTML='<option value="">All Israel playlists</option>'+P.map(function(p,i){return'<option value="'+esc(p.id)+'">'+esc(p.name)+'</option>'}).join('');
    run()
  }).catch(function(){nn.textContent='The playlists could not be loaded right now. Please try again shortly.'});
  function play(id,name){
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
    nn.textContent=list.length+(list.length===1?' playlist':' playlists');
    grid.innerHTML=list.map(function(p){return'<button type="button" class="pcard" data-id="'+esc(p.id)+'" data-n="'+esc(p.name)+'"><b>'+esc(p.name)+'</b><span>'+esc(p.by||'Playlist')+'</span><i>&#9654; Play</i></button>'}).join('')||'<p>No playlists match. Try another genre or keyword.</p>';
    if(sel&&list.length===1&&document.activeElement===ps)play(list[0].id,list[0].name)}
  gs.addEventListener('change',run);ps.addEventListener('change',run);form.addEventListener('submit',function(e){e.preventDefault();run()});qi.addEventListener('input',run);
  grid.addEventListener('click',function(e){var b=e.target.closest('.pcard');if(!b)return;[].forEach.call(grid.querySelectorAll('.pcard.on'),function(x){x.classList.remove('on')});b.classList.add('on');play(b.getAttribute('data-id'),b.getAttribute('data-n'))});
})();
