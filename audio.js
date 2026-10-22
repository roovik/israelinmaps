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
      sec._all=ep;sec._ep=ep.slice();var shown=10;
      function draw(){var L=sec._ep;ul.innerHTML=L.length?L.slice(0,shown).map(row).join('')+(L.length>shown?'<li class="amore"><button type="button" class="aall">Show all '+L.length+' episodes</button></li>':''):'<li>No episodes match.</li>'}
      sec._draw=function(){shown=10;draw()};draw();
      ul.addEventListener('click',function(e){if(e.target.closest('.aall')){shown=sec._ep.length;draw()}});
      if(window._aApply)window._aApply();
    }).catch(function(){sec.querySelector('ul').innerHTML='<li>This show could not load just now.</li>'})});
  /* one-line selection row: show, sort, keyword */
  (function(){var h1=document.querySelector('.newsmain h1');if(!h1)return;
    var f=document.createElement('form');f.className='ffilter';f.setAttribute('role','search');
    f.innerHTML='<select id="a-sel" aria-label="Podcast"><option value="">All podcasts ('+shows.length+')</option>'+shows.map(function(s){return'<option value="'+esc(s.id)+'">'+esc(s.querySelector('h2').textContent)+'</option>'}).join('')+'</select><select id="a-sort" aria-label="Sort"><option value="new">Newest</option><option value="old">Oldest</option><option value="az">A to Z</option><option value="rand">Random</option></select><input id="a-q" type="search" placeholder="Keyword" aria-label="Keyword"><button type="submit">Filter</button>';
    h1.insertAdjacentElement('afterend',f);
    var sel=f.querySelector('#a-sel'),so=f.querySelector('#a-sort'),qi=f.querySelector('#a-q');
    function apply(){var q=qi.value.trim().toLowerCase(),s=so.value;
      shows.forEach(function(sec){sec.hidden=!!sel.value&&sec.id!==sel.value;if(!sec._all)return;
        var L=sec._all.filter(function(e){return!q||(e.t+' '+(e.s||'')).toLowerCase().indexOf(q)>-1});
        if(s==='az')L=L.slice().sort(function(x,y){return String(x.t).localeCompare(String(y.t))});
        else if(s==='old')L=L.slice().sort(function(x,y){return new Date(x.d||0)-new Date(y.d||0)});
        else if(s==='rand'){L=L.slice();for(var i=L.length-1;i>0;i--){var k=Math.floor(Math.random()*(i+1)),t=L[i];L[i]=L[k];L[k]=t}}
        else L=L.slice().sort(function(x,y){return new Date(y.d||0)-new Date(x.d||0)});
        sec._ep=L;sec._draw()})}
    window._aApply=apply;[sel,so].forEach(function(x){x.addEventListener('change',apply)});qi.addEventListener('input',apply);f.addEventListener('submit',function(e){e.preventDefault();apply()});
    var h=location.hash.replace('#','');if(h&&shows.some(function(s){return s.id===h})){sel.value=h}
  })();
  document.addEventListener('click',function(e){var b=e.target.closest('.aplay');if(!b)return;var sec=b.closest('.ashow'),ep=sec&&sec._ep&&sec._ep[+b.getAttribute('data-i')];if(!ep)return;
    au.src=ep.a;top.hidden=false;now.innerHTML='<b>'+esc(ep.t)+'</b><span>'+esc(sec.querySelector('h2').textContent)+'</span>';au.play().catch(function(){});top.scrollIntoView({behavior:'smooth',block:'nearest'})});
})();
