(function(){
  var GENRES=[['','All genres'],['pop','Pop'],['rock','Rock'],['mizrahi','Mizrahi'],['folk','Folk songs'],['hiphop','Hip hop'],['electronic','Electronic'],['classical','Classical'],['jazz','Jazz'],['klezmer','Klezmer'],['hasidic','Hasidic'],['kids','Children'],['eurovision','Eurovision'],['oldies','Classic songs'],['patriotic','Patriotic'],['dance','Dance']];
  var ARTISTS=['Achinoam Nini','Arik Einstein','Berry Sakharof','Dana International','Daniel Barenboim','Eden Ben Zaken','Eyal Golan','Gali Atari','Hadag Nahash','Harel Skaat','Idan Raichel','Israel Philharmonic Orchestra','Itzhak Perlman','Ivri Lider','Izhar Cohen','Mashina','Matti Caspi','Naomi Shemer','Netta Barzilai','Noa Kirel','Ofra Haza','Omer Adam','Rita','Sarit Hadad','Shalom Hanoch','Shlomo Artzi','Static and Ben El','Subliminal','Tuna','Yaffa Yarkoni','Yehoram Gaon','Zubin Mehta'];
  var AG={"Achinoam Nini": "pop folk", "Arik Einstein": "rock oldies folk", "Berry Sakharof": "rock electronic", "Dana International": "pop eurovision dance electronic", "Daniel Barenboim": "classical", "Eden Ben Zaken": "mizrahi pop", "Eyal Golan": "mizrahi pop", "Gali Atari": "pop eurovision oldies", "Hadag Nahash": "hiphop rock", "Harel Skaat": "pop eurovision", "Idan Raichel": "pop folk", "Israel Philharmonic Orchestra": "classical patriotic", "Itzhak Perlman": "classical klezmer", "Ivri Lider": "pop rock", "Izhar Cohen": "pop eurovision oldies", "Mashina": "rock oldies", "Matti Caspi": "rock folk oldies jazz", "Naomi Shemer": "folk oldies patriotic kids", "Netta Barzilai": "pop eurovision electronic dance", "Noa Kirel": "pop dance eurovision", "Ofra Haza": "pop mizrahi eurovision oldies dance", "Omer Adam": "pop mizrahi", "Rita": "pop folk", "Sarit Hadad": "mizrahi pop", "Shalom Hanoch": "rock oldies", "Shlomo Artzi": "pop rock folk", "Static and Ben El": "mizrahi pop dance", "Subliminal": "hiphop patriotic", "Tuna": "electronic dance", "Yaffa Yarkoni": "oldies patriotic folk", "Yehoram Gaon": "folk oldies patriotic", "Zubin Mehta": "classical"};
  var gs=document.getElementById('mgenre'),as=document.getElementById('martist'),form=document.getElementById('mform'),inp=document.getElementById('mq'),grid=document.getElementById('mgrid'),st=document.getElementById('mstatus'),pl=document.getElementById('mplayer');
  if(!gs)return;
  var sw=document.createElement('label');sw.className='srt';sw.innerHTML='Sort<select id="msort" aria-label="Sort">'+IMSort.opts([['','Relevance'],['date','Newest first'],['viewCount','Most viewed'],['az','Title A to Z'],['src','Musician A to Z'],['rand','Random']])+'</select>';sw.className='';var mf0=document.querySelector('.mfilters');mf0.appendChild(sw);mf0.classList.add('m3');var so=document.getElementById('msort');so.addEventListener('change',function(){load()});
  (function(){var mf=document.querySelector('.mfilters');if(!mf||!form)return;form.className='ffilter';[gs,as,document.getElementById('msort')].forEach(function(x){if(x)form.insertBefore(x,inp)});mf.hidden=true;inp.placeholder='Keyword'})();
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  gs.innerHTML=GENRES.map(function(t){return'<option value="'+t[0]+'">'+esc(t[1])+'</option>'}).join('');
  function fillArtists(){var g=gs.value,cur=as.value,list=ARTISTS.filter(function(a){return!g||(AG[a]||'').split(' ').indexOf(g)>-1});
    as.innerHTML='<option value="">All musicians'+(g?' in this genre':'')+'</option>'+list.map(function(a){return'<option>'+esc(a)+'</option>'}).join('');as.value=list.indexOf(cur)>-1?cur:''}
  fillArtists();
  var seq=0;
  function load(){
    var my=++seq;grid.innerHTML='';st.textContent='Filtering…';
    fetch('/api/music?genre='+encodeURIComponent(gs.value)+'&artist='+encodeURIComponent(as.value)+'&q='+encodeURIComponent(inp.value.trim())+'&order='+(so.value==='date'||so.value==='viewCount'?so.value:'')).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(d){
      if(my!==seq)return;
      if(d.error==='nokey'){st.textContent='Music search needs the YouTube key to be switched on for this site.';return}
      if(d.error){st.textContent='The music search is not available right now. Please try again shortly.';return}
      var it=d.items||[];if(so.value==='az'||so.value==='src'||so.value==='rand')it=IMSort.apply(it,so.value,{date:function(){return 0},title:function(x){return x.t},src:function(x){return x.a}});grid.innerHTML=it.map(function(x){return'<figure class="ifig msong"><button type="button" class="mplay" data-y="'+esc(x.id)+'" aria-label="Play '+esc(x.t)+'">'+(x.img?'<img src="'+esc(x.img)+'" alt="" loading="lazy">':'')+'<span class="pbtn">&#9654;</span></button><figcaption><b>'+esc(x.t)+'</b>'+esc(x.a)+'</figcaption></figure>'}).join('');
      st.textContent=it.length?'':'Nothing found. Try another genre, musician or keyword.'
    }).catch(function(){if(my===seq)st.textContent='The music search is not reachable right now. Please try again shortly.'})}
  gs.addEventListener('change',function(){fillArtists();load()});as.addEventListener('change',load);
  form.addEventListener('submit',function(e){e.preventDefault();load()});
  grid.addEventListener('click',function(e){var b=e.target.closest('.mplay');if(!b)return;
    [].forEach.call(document.querySelectorAll('.mplay.on'),function(x){x.classList.remove('on')});b.classList.add('on');
    pl.hidden=false;pl.innerHTML='<iframe src="https://www.youtube-nocookie.com/embed/'+encodeURIComponent(b.getAttribute('data-y'))+'?rel=0&autoplay=1&mute=1&playsinline=1&enablejsapi=1&origin='+encodeURIComponent(location.origin)+'" title="Player" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
    var f=pl.firstChild;function cmd(n){try{f.contentWindow.postMessage(JSON.stringify({event:'command',func:n,args:[]}),'*')}catch(x){}}function go(){cmd('playVideo');cmd('unMute')}
    f.addEventListener('load',function(){go();setTimeout(go,500);setTimeout(go,1500)});pl.scrollIntoView({block:'nearest'})});
  function hm(){var q=new URLSearchParams(location.hash.slice(1));if(q.get('genre'))gs.value=q.get('genre');fillArtists();if(q.get('artist'))as.value=q.get('artist')}
  hm();window.addEventListener('hashchange',function(){hm();load()});
  load();
})();
