(function(){
  var GENRES=[['','All genres'],['pop','Pop'],['rock','Rock'],['mizrahi','Mizrahi'],['folk','Folk songs'],['hiphop','Hip hop'],['electronic','Electronic'],['classical','Classical'],['jazz','Jazz'],['klezmer','Klezmer'],['hasidic','Hasidic'],['kids','Children'],['eurovision','Eurovision'],['oldies','Classic songs'],['patriotic','Patriotic'],['dance','Dance']];
  var ARTISTS=['Achinoam Nini','Arik Einstein','Berry Sakharof','Dana International','Daniel Barenboim','Eden Ben Zaken','Eyal Golan','Gali Atari','Hadag Nahash','Harel Skaat','Idan Raichel','Israel Philharmonic Orchestra','Itzhak Perlman','Ivri Lider','Izhar Cohen','Mashina','Matti Caspi','Naomi Shemer','Netta Barzilai','Noa Kirel','Ofra Haza','Omer Adam','Rita','Sarit Hadad','Shalom Hanoch','Shlomo Artzi','Static and Ben El','Subliminal','Tuna','Yaffa Yarkoni','Yehoram Gaon','Zubin Mehta'];
  var gs=document.getElementById('mgenre'),as=document.getElementById('martist'),form=document.getElementById('mform'),inp=document.getElementById('mq'),grid=document.getElementById('mgrid'),st=document.getElementById('mstatus'),pl=document.getElementById('mplayer');
  if(!gs)return;
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  gs.innerHTML=GENRES.map(function(t){return'<option value="'+t[0]+'">'+esc(t[1])+'</option>'}).join('');
  as.innerHTML='<option value="">All musicians</option>'+ARTISTS.map(function(a){return'<option>'+esc(a)+'</option>'}).join('');
  var seq=0;
  function load(){
    var my=++seq;grid.innerHTML='';st.textContent='Searching…';
    fetch('/api/music?genre='+encodeURIComponent(gs.value)+'&artist='+encodeURIComponent(as.value)+'&q='+encodeURIComponent(inp.value.trim())).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(d){
      if(my!==seq)return;
      if(d.error==='nokey'){st.textContent='Music search needs the YouTube key to be switched on for this site.';return}
      if(d.error){st.textContent='The music search is not available right now. Please try again shortly.';return}
      var it=d.items||[];grid.innerHTML=it.map(function(x){return'<figure class="ifig msong"><button type="button" class="mplay" data-y="'+esc(x.id)+'" aria-label="Play '+esc(x.t)+'">'+(x.img?'<img src="'+esc(x.img)+'" alt="" loading="lazy">':'')+'<span class="pbtn">&#9654;</span></button><figcaption><b>'+esc(x.t)+'</b>'+esc(x.a)+'</figcaption></figure>'}).join('');
      st.textContent=it.length?'':'Nothing found. Try another genre, musician or keyword.'
    }).catch(function(){if(my===seq)st.textContent='The music search is not reachable right now. Please try again shortly.'})}
  gs.addEventListener('change',load);as.addEventListener('change',load);
  form.addEventListener('submit',function(e){e.preventDefault();load()});
  grid.addEventListener('click',function(e){var b=e.target.closest('.mplay');if(!b)return;
    [].forEach.call(document.querySelectorAll('.mplay.on'),function(x){x.classList.remove('on')});b.classList.add('on');
    pl.hidden=false;pl.innerHTML='<iframe src="https://www.youtube-nocookie.com/embed/'+encodeURIComponent(b.getAttribute('data-y'))+'?rel=0&autoplay=1&mute=1&playsinline=1&enablejsapi=1&origin='+encodeURIComponent(location.origin)+'" title="Player" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
    var f=pl.firstChild;function cmd(n){try{f.contentWindow.postMessage(JSON.stringify({event:'command',func:n,args:[]}),'*')}catch(x){}}function go(){cmd('playVideo');cmd('unMute')}
    f.addEventListener('load',function(){go();setTimeout(go,500);setTimeout(go,1500)});pl.scrollIntoView({block:'nearest'})});
  load();
})();
