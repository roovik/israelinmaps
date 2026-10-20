(function(){
  var list=document.getElementById('adm-list');if(!list)return;
  var kind='channels',filt='',cands=[],KEY='admvid1';
  var dec={};try{dec=JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(dec))}catch(e){}}
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function num(n){return n==null?'hidden':n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e3?Math.round(n/1e3)+'K':String(n)}
  function yrs(iso){return iso?((Date.now()-new Date(iso))/(365.25*864e5)):0}
  function flags(ch){var f=[];if(!ch)return f;var y=yrs(ch.created);
    if(y&&y<2)f.push('Channel under 2 years old');if(ch.subs!=null&&ch.subs<5000)f.push('Under 5K subscribers');if(!ch.desc)f.push('No description');
    if(ch.videos&&ch.videos<20)f.push('Fewer than 20 videos');return f}
  function chBlock(ch,extra){if(!ch)return'';var f=flags(ch);
    return'<div class="prov"><b>'+esc(ch.name)+'</b>'+(ch.handle?' <span class="small">'+esc(ch.handle)+'</span>':'')+
    '<div class="small">'+num(ch.subs)+' subscribers · '+ch.videos+' videos · since '+(ch.created||'').slice(0,4)+(ch.country?' · '+esc(ch.country):'')+'</div>'+
    (ch.desc?'<p class="small adesc">'+esc(ch.desc)+'</p>':'')+(f.length?'<p class="aflag">'+f.map(esc).join(' · ')+'</p>':'')+
    '<a href="https://www.youtube.com/channel/'+esc(ch.id)+'" target="_blank" rel="noopener">Open channel on YouTube</a>'+(extra||'')+'</div>'}
  function render(){
    var h='';cands.forEach(function(c){var d=dec[c.id]||{},st=d.s||'';
      if(filt==='new'&&st)return;if(filt==='yes'&&st!=='yes')return;if(filt==='no'&&st!=='no')return;
      var nm=d.n!=null?d.n:(kind==='channels'?c.name:c.name);
      h+='<article class="acard" data-id="'+esc(c.id)+'" data-s="'+esc(st)+'"><div class="ahead"><input class="anm" value="'+esc(nm)+'" aria-label="Name as shown on the site">'+(c.known?'<span class="aknown">Already on the site</span>':'')+'</div>';
      if(kind==='channels'){
        h+=chBlock(c)+(c.samples&&c.samples.length?'<ul class="asmp">'+c.samples.map(function(x){return'<li><a href="https://www.youtube.com/watch?v='+esc(x.v)+'" target="_blank" rel="noopener">'+esc(x.t)+'</a></li>'}).join('')+'</ul>':'');
      }else if(kind==='videos'){
        var mm=(c.dur||'').match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/),len=mm?((+mm[1]||0)*60+(+mm[2]||0))+':'+('0'+(+mm[3]||0)).slice(-2):'';
        h+='<div class="avid"><a class="athumb" href="https://www.youtube.com/watch?v='+esc(c.id)+'" data-v="'+esc(c.id)+'"><img src="https://i.ytimg.com/vi/'+esc(c.id)+'/mqdefault.jpg" alt="" loading="lazy"><span class="vplay">\u25b6</span></a><div><p class="small">'+num(c.views)+' views · '+len+' · '+(c.published||'').slice(0,10)+(c.trusted?' · <b>Channel already approved</b>':'')+'</p>'+(c.desc?'<p class="small adesc">'+esc(c.desc)+'</p>':'')+'<a href="https://www.youtube.com/watch?v='+esc(c.id)+'" target="_blank" rel="noopener">Open video on YouTube</a></div></div><p class="small"><b>Published by</b></p>'+chBlock(c.channel);
      }else{
        h+='<p class="small">Playlist · '+c.items+' videos · created '+(c.created||'').slice(0,4)+' · <a href="https://www.youtube.com/playlist?list='+esc(c.id)+'" target="_blank" rel="noopener">Open playlist on YouTube</a></p>'+(c.desc?'<p class="small adesc">'+esc(c.desc)+'</p>':'')+'<p class="small"><b>Published by</b></p>'+chBlock(c.channel);
      }
      h+='<div class="abtn"><button type="button" data-a="yes" aria-pressed="'+(st==='yes')+'">Approve</button><button type="button" data-a="no" aria-pressed="'+(st==='no')+'">Reject</button><button type="button" data-a="" aria-pressed="false">Clear</button></div></article>'});
    list.innerHTML=h||'<p>Nothing to show. Search above.</p>'}
  list.addEventListener('click',function(e){var b=e.target.closest('button[data-a]');if(!b)return;var a=b.closest('.acard'),id=a.getAttribute('data-id');dec[id]=dec[id]||{};dec[id].s=b.getAttribute('data-a');dec[id].k=kind;if(kind==='videos'){dec[id].e=ent.value;dec[id].t=(cands.filter(function(c){return c.id===id})[0]||{}).name}save();render();prog()});
  list.addEventListener('click',function(e){var a=e.target.closest('a.athumb');if(!a||e.metaKey||e.ctrlKey)return;e.preventDefault();a.outerHTML='<iframe class="aplay" src="https://www.youtube-nocookie.com/embed/'+encodeURIComponent(a.getAttribute('data-v'))+'?rel=0&autoplay=1" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>'});
  list.addEventListener('input',function(e){if(!e.target.classList.contains('anm'))return;var id=e.target.closest('.acard').getAttribute('data-id');dec[id]=dec[id]||{};dec[id].n=e.target.value;save()});
  function tog(sel,fn){[].forEach.call(document.querySelectorAll(sel),function(b){b.addEventListener('click',function(){[].forEach.call(document.querySelectorAll(sel),function(x){x.setAttribute('aria-pressed',x===b?'true':'false')});fn(b)})})}
  tog('.vseg button[data-k]',function(b){kind=b.getAttribute('data-k')});
  tog('.vseg button[data-f]',function(b){filt=b.getAttribute('data-f');render()});
  var st=document.getElementById('adm-st');
  function go(){st.textContent='Searching.';fetch('/api/videos?review='+kind+'&q='+encodeURIComponent(document.getElementById('adm-q').value.trim())).then(function(r){return r.json()}).then(function(d){
      if(d.error){st.textContent=d.error;return}cands=d.candidates||[];st.textContent=cands.length+' candidates.';render()}).catch(function(){st.textContent='Could not search right now.'})}
  document.getElementById('adm-go').addEventListener('click',go);
  document.getElementById('adm-q').addEventListener('keydown',function(e){if(e.key==='Enter')go()});
  var ent=document.getElementById('adm-ent'),B=[];
  fetch('/admin/batches.json').then(function(r){return r.json()}).then(function(b){B=b;b.forEach(function(x){var g=document.createElement('optgroup');g.label=x.name;x.entries.forEach(function(en){var o=document.createElement('option');o.value=en.slug;o.textContent=en.title;g.appendChild(o)});ent.appendChild(g)});prog();if(qe){ent.value=qe;ent.dispatchEvent(new Event('change'))}}).catch(function(){});
  function prog(){var n=0,t=0;B.forEach(function(b){b.entries.forEach(function(en){t++;if(Object.keys(dec).some(function(k){return dec[k].e===en.slug&&dec[k].s==='yes'}))n++})});var p=document.getElementById('adm-prog');if(p&&t)p.textContent=n+' of '+t+' entries have an approved video.'}
  var qe=new URLSearchParams(location.search).get('e');
  ent.addEventListener('change',function(){var o=ent.options[ent.selectedIndex];if(!ent.value)return;document.getElementById('adm-q').value=o.textContent+(/^(Israel|Iran|Gaza)$/.test(o.textContent)?'':' Israel');go()});
  var seen={};
  document.getElementById('adm-exp').addEventListener('click',function(){
    var ch=[],pl=[];cands.forEach(function(c){if(kind!=='videos')seen[kind+c.id]=c});Object.keys(seen).forEach(function(k){var c=seen[k],d=dec[c.id];if(!d||d.s!=='yes')return;
      if(k.indexOf('channels')===0)ch.push({id:c.id,handle:(c.handle||'').replace(/^@/,''),name:d.n||c.name,check:'approved '+new Date().toISOString().slice(0,10)});
      else pl.push({id:c.id,name:d.n||c.name,channel:(c.channel&&c.channel.handle||'').replace(/^@/,'').toLowerCase()||(c.channel&&c.channel.name)||''})});
    var pins={};Object.keys(dec).forEach(function(id){var d=dec[id];if(d.k==='videos'&&d.s==='yes'&&d.e){(pins[d.e]=pins[d.e]||[]).push({v:id,t:d.n||d.t||''})}});
    document.getElementById('adm-ta').value=JSON.stringify({channels:ch,playlists:pl,pinned:pins},null,1);document.getElementById('adm-out').hidden=false});
  document.getElementById('adm-copy').addEventListener('click',function(){var t=document.getElementById('adm-ta');t.select();try{document.execCommand('copy')}catch(e){}});
})();
