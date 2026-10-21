(function(){
  var TAGS=[['','All Israeli music'],['pop','Pop'],['rock','Rock'],['mizrahi','Mizrahi'],['folk','Folk songs'],['hiphop','Hip hop'],['electronic','Electronic'],['classical','Classical'],['jazz','Jazz'],['klezmer','Klezmer'],['hasidic','Hasidic'],['kids','Children'],['eurovision','Eurovision'],['oldies','Classic songs'],['patriotic','Patriotic'],['dance','Dance']];
  var TYPES=[['songs','Songs'],['videos','Videos'],['playlists','Playlists']];
  var form=document.getElementById('mform'),sel=document.getElementById('msel'),inp=document.getElementById('mq'),tabs=document.getElementById('mtabs'),grid=document.getElementById('mgrid'),st=document.getElementById('mstatus'),pl=document.getElementById('mplayer'),au=document.getElementById('maudio');
  if(!form)return;
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  sel.innerHTML=TAGS.map(function(t){return'<option value="'+t[0]+'">'+esc(t[1])+'</option>'}).join('');
  var S={type:'songs',tag:'',q:''},seq=0;
  function parse(){var p=new URLSearchParams(location.hash.slice(1));S.type=p.get('t')||'songs';S.tag=p.get('tag')||'';S.q=p.get('q')||''}
  function hash(o){var n={type:S.type,tag:S.tag,q:S.q};for(var k in o)n[k]=o[k];var p=new URLSearchParams();if(n.type!=='songs')p.set('t',n.type);if(n.tag)p.set('tag',n.tag);if(n.q)p.set('q',n.q);return'#'+p.toString()}
  function draw(){tabs.innerHTML=TYPES.map(function(t){return'<a href="'+hash({type:t[0]})+'"'+(S.type===t[0]?' aria-current="true"':'')+'>'+t[1]+'</a>'}).join('');sel.value=S.tag;inp.value=S.q}
  function card(x){
    if(S.type==='songs')return'<figure class="ifig msong"><button type="button" class="mplay" data-p="'+esc(x.p)+'" data-t="'+esc(x.t+' - '+x.a)+'" aria-label="Play preview of '+esc(x.t)+'">'+(x.img?'<img src="'+esc(x.img)+'" alt="" loading="lazy">':'')+'<span class="pbtn">&#9654;</span></button><figcaption><b>'+esc(x.t)+'</b>'+esc(x.a)+(x.al?' · '+esc(x.al):'')+(x.u?' · <a href="'+esc(x.u)+'" target="_blank" rel="noopener">Full track</a>':'')+'</figcaption></figure>';
    return'<figure class="ifig msong"><button type="button" class="mplay" data-y="'+esc(x.id)+'" data-k="'+S.type+'" data-t="'+esc(x.t)+'" aria-label="Play '+esc(x.t)+'">'+(x.img?'<img src="'+esc(x.img)+'" alt="" loading="lazy">':'')+'<span class="pbtn">&#9654;</span></button><figcaption><b>'+esc(x.t)+'</b>'+esc(x.a)+'</figcaption></figure>'}
  function load(){
    var my=++seq;grid.innerHTML='';st.textContent='Searching…';
    fetch('/api/music?type='+S.type+'&tag='+encodeURIComponent(S.tag)+'&q='+encodeURIComponent(S.q)).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(d){
      if(my!==seq)return;
      if(d.error==='nokey'){st.textContent='Video and playlist search needs the YouTube key to be switched on for this site. Songs work now.';return}
      if(d.error){st.textContent='The music search is not available right now. Please try again shortly.';return}
      grid.innerHTML=(d.items||[]).map(card).join('');st.textContent=(d.items||[]).length?'':'Nothing found. Try another tag or keyword.'
    }).catch(function(){if(my===seq)st.textContent='The music search is not reachable right now. Please try again shortly.'})}
  function route(){parse();draw();load()}
  sel.addEventListener('change',function(){location.hash=hash({tag:sel.value,q:''}).slice(1);if(location.hash==='')route()});
  form.addEventListener('submit',function(e){e.preventDefault();var h=hash({q:inp.value.trim(),tag:sel.value});if(h==='#'+location.hash.slice(1)||h===location.hash)route();else location.hash=h.slice(1)});
  grid.addEventListener('click',function(e){var b=e.target.closest('.mplay');if(!b)return;
    var now=document.querySelectorAll('.mplay.on');[].forEach.call(now,function(x){x.classList.remove('on')});b.classList.add('on');
    if(b.getAttribute('data-p')){pl.hidden=true;pl.innerHTML='';au.hidden=false;au.src=b.getAttribute('data-p');au.play();document.getElementById('mnow').textContent=b.getAttribute('data-t')}
    else{au.pause();au.hidden=true;var id=encodeURIComponent(b.getAttribute('data-y')),pls=b.getAttribute('data-k')==='playlists';pl.hidden=false;pl.innerHTML='<iframe src="https://www.youtube-nocookie.com/embed/'+(pls?'videoseries?list=':'')+id+(pls?'&':'?')+'rel=0&autoplay=1" title="Player" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';pl.scrollIntoView({block:'nearest'})}});
  window.addEventListener('hashchange',route);route();
})();
