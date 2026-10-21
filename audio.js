/* Audio page: episodes from the podcast feeds of Who's Who entries, played in one sticky player. */
(function(){
  var shows=[].slice.call(document.querySelectorAll('.ashow'));if(!shows.length)return;
  var top=document.getElementById('a-top'),now=document.getElementById('a-now'),au=document.getElementById('a-audio');
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function when(d){if(!d)return'';var t=new Date(d);return isNaN(t)?'':t.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}
  function dur(x){if(!x)return'';if(/^\d+$/.test(x)){var n=+x,h=Math.floor(n/3600),m=Math.floor(n%3600/60);return h?h+' h '+m+' min':m+' min'}return x.replace(/^00:/,'')}
  shows.forEach(function(sec){
    fetch('/api/voice?id='+encodeURIComponent(sec.getAttribute('data-id'))).then(function(r){return r.json()}).then(function(d){
      var ep=(d.podcasts||[]).filter(function(e){return e.a}),ul=sec.querySelector('ul');
      if(!ep.length){ul.innerHTML='<li>No playable episodes were found just now.</li>';return}
      function row(e,i){return'<li><button type="button" class="aplay" data-i="'+i+'" aria-label="Play '+esc(e.t)+'">&#9654;</button>'+(e.i?'<img class="athumb" src="'+esc(e.i)+'" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">':'')+'<div><b>'+esc(e.t)+'</b><span class="wm">'+esc(d.name)+(e.d?' · '+when(e.d):'')+(e.du?' · '+esc(dur(e.du)):'')+' · <a href="'+esc(e.u)+'" rel="noopener" target="_blank">Original</a></span></div></li>'}
      var shown=10;function draw(){ul.innerHTML=ep.slice(0,shown).map(row).join('')+(ep.length>shown?'<li class="amore"><button type="button" class="aall">Show all '+ep.length+' episodes</button></li>':'')}draw();
      ul.addEventListener('click',function(e){if(e.target.closest('.aall')){shown=ep.length;draw()}});
      sec._ep=ep;
    }).catch(function(){sec.querySelector('ul').innerHTML='<li>This show could not load just now.</li>'})});
  document.addEventListener('click',function(e){var b=e.target.closest('.aplay');if(!b)return;var sec=b.closest('.ashow'),ep=sec&&sec._ep&&sec._ep[+b.getAttribute('data-i')];if(!ep)return;
    au.src=ep.a;top.hidden=false;now.innerHTML='<b>'+esc(ep.t)+'</b><span>'+esc(sec.querySelector('h2').textContent)+'</span>';au.play().catch(function(){});top.scrollIntoView({behavior:'smooth',block:'nearest'})});
})();
