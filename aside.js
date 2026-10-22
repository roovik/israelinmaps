(function(){
  var as=document.querySelector('aside.newsside');if(!as)return;
  var p=location.pathname,k='';
  function has(x){return p.indexOf(x)===0}
  if(has('/maps/')||has('/size/'))k='maps';else if(has('/tour/'))k='tour';else if(has('/timelines/'))k='timelines';
  else if(has('/charts/')||has('/rankings/')||has('/demographics/')||has('/tables/')||has('/top-ten/')||has('/population/'))k='charts';
  else if(has('/hot/'))k='hot';else if(has('/glossary/')||has('/g/'))k='glossary';else if(has('/about/')||has('/cite/'))k='book';
  else if(has('/sources/'))k='sources';else if(has('/views/')||has('/who/'))k='views';
  else if(has('/media/'))k='media';else if(has('/video/'))k='video';else if(has('/playlists/'))k='playlists';else if(has('/audio/'))k='audio';else if(has('/music/'))k='music';else if(has('/images/'))k='images';
  if(!k)return;
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  fetch('/asides.json').then(function(r){return r.json()}).then(function(A){
    var s=A[k];if(!s)return;var cur=p+location.hash;
    var h='<div class="asect"><h2>'+esc(s.t)+'</h2>'+s.g.map(function(g,i){
      var on=g.i.some(function(x){return x[1]===p||x[1]===cur});
      return'<details class="agrp" open><summary><a href="'+esc(g.u)+'">'+esc(g.h)+'</a> <span>'+g.i.length+'</span></summary><ul class="alist'+''+'">'+g.i.map(function(x){return'<li><a href="'+esc(x[1])+'"'+(x[1]===p||x[1]===cur?' aria-current="page"':'')+'>'+esc(x[0])+'</a></li>'}).join('')+'</ul></details>'}).join('')+'</div>';
    var d=document.createElement('div');d.innerHTML=h;as.classList.add('sect');if(/^(media|video|playlists|audio|music|images|maps|tour|timelines|charts|hot|glossary|book|sources|views)$/.test(k)){var np=as.closest('.newspage'),lc=np&&np.querySelector(':scope>.newsleftcol');if(np&&lc){np.classList.add('noleft');lc.hidden=true}}as.insertBefore(d.firstChild,as.firstChild);
  }).catch(function(){});
})();
