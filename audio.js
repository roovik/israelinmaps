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
  /* one-line selection row, then player (2/3) and episode list (1/3) */
  (function(){var h1=document.querySelector('.newsmain h1');if(!h1)return;
    var f=document.createElement('form');f.className='ffilter';f.setAttribute('role','search');
    f.innerHTML='<select id="a-sel" aria-label="Podcast"><option value="">All podcasts ('+shows.length+')</option>'+shows.map(function(s){return'<option value="'+esc(s.id)+'">'+esc(s.querySelector('h2').textContent)+'</option>'}).join('')+'</select><select id="a-sort" aria-label="Sort"><option value="new">Newest</option><option value="old">Oldest</option><option value="az">A to Z</option><option value="rand">Random</option></select><input id="a-q" type="search" placeholder="Keyword" aria-label="Keyword"><button type="submit">Filter</button>';
    h1.insertAdjacentElement('afterend',f);
    var st=document.createElement('div');st.className='stage';st.innerHTML='<div class="stage-main"><div class="amain"><div class="aart"><span class="sph">&#9654;</span></div><div class="ameta"><b>Choose an episode</b><span></span></div><audio controls preload="none" id="a-p"></audio><p class="adesc"></p></div></div><ul class="stage-list" id="a-list"></ul>';
    f.insertAdjacentElement('afterend',st);
    var sel=f.querySelector('#a-sel'),so=f.querySelector('#a-sort'),qi=f.querySelector('#a-q'),list=st.querySelector('#a-list'),ap=st.querySelector('#a-p'),art=st.querySelector('.aart'),mt=st.querySelector('.ameta'),ds=st.querySelector('.adesc'),cur=null,L=[],first=true;
    function setEp(e,auto){cur=e;art.innerHTML=e.i?'<img src="'+esc(e.i)+'" alt="" referrerpolicy="no-referrer" onerror="this.remove()">':'<span class="sph">&#9654;</span>';
      mt.innerHTML='<b>'+esc(e.t)+'</b><span>'+esc(e.sn)+(e.d?' · '+when(e.d):'')+(e.du?' · '+dur(e.du):'')+'</span>';ds.textContent=e.x||'';
      ap.src=e.a;if(auto)ap.play().catch(function(){});[].forEach.call(list.querySelectorAll('.sitem'),function(b){b.classList.toggle('on',+b.getAttribute('data-i')===L.indexOf(e))})}
    function apply(){var q=qi.value.trim().toLowerCase(),s=so.value,out=[];
      shows.forEach(function(sec){if(!sec._all)return;if(sel.value&&sec.id!==sel.value)return;var sn=sec.querySelector('h2').textContent;sec._all.forEach(function(e){e.sn=sn;out.push(e)})});
      out=out.filter(function(e){return!q||(e.t+' '+e.sn).toLowerCase().indexOf(q)>-1});
      if(s==='az')out.sort(function(x,y){return String(x.t).localeCompare(String(y.t))});
      else if(s==='old')out.sort(function(x,y){return new Date(x.d||0)-new Date(y.d||0)});
      else if(s==='rand'){for(var i=out.length-1;i>0;i--){var k=Math.floor(Math.random()*(i+1)),t=out[i];out[i]=out[k];out[k]=t}}
      else out.sort(function(x,y){return new Date(y.d||0)-new Date(x.d||0)});
      L=out.slice(0,120);
      list.innerHTML=L.length?L.map(function(e,i){return'<li><button type="button" class="sitem'+(e===cur?' on':'')+'" data-i="'+i+'"><span class="sth">'+(e.i?'<img src="'+esc(e.i)+'" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">':'<span class="sph">&#9654;</span>')+'</span><span class="stx"><b>'+esc(e.t)+'</b><i>'+esc(e.sn)+(e.d?' · '+when(e.d):'')+(e.du?' · '+dur(e.du):'')+'</i></span></button></li>'}).join(''):'<li class="small">'+(shows.some(function(x){return!x._all})?'Loading episodes…':'No episodes match.')+'</li>';
      if(first&&L.length){first=false;setEp(L[0],false)}}
    list.addEventListener('click',function(e){var b=e.target.closest('.sitem');if(!b)return;setEp(L[+b.getAttribute('data-i')],true)});
    window._aApply=apply;[sel,so].forEach(function(x){x.addEventListener('change',apply)});qi.addEventListener('input',apply);f.addEventListener('submit',function(e){e.preventDefault();apply()});
    var h=location.hash.replace('#','');if(h&&shows.some(function(s){return s.id===h})){sel.value=h}
    apply()
  })();
  document.addEventListener('click',function(e){var b=e.target.closest('.aplay');if(!b)return;var sec=b.closest('.ashow'),ep=sec&&sec._ep&&sec._ep[+b.getAttribute('data-i')];if(!ep)return;
    au.src=ep.a;top.hidden=false;now.innerHTML='<b>'+esc(ep.t)+'</b><span>'+esc(sec.querySelector('h2').textContent)+'</span>';au.play().catch(function(){});top.scrollIntoView({behavior:'smooth',block:'nearest'})});
})();
