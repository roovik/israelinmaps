(function(){
  var root=document.getElementById('voice-page');if(!root)return;
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function when(d){if(!d)return'';var t=new Date(d);if(isNaN(t))return'';return t.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}
  var player=document.getElementById('v-player');
  function play(v){player.innerHTML='<iframe src="https://www.youtube-nocookie.com/embed/'+encodeURIComponent(v)+'?rel=0" title="Video player" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen loading="lazy"></iframe>';player.hidden=false}
  fetch('/api/voice?id='+encodeURIComponent(root.getAttribute('data-id'))).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(d){
    var vs=d.videos||[];
    if(vs.length){
      play(vs[0].v);
      var c=document.getElementById('v-clips');c.hidden=false;
      c.querySelector('ul').innerHTML=vs.map(function(x,i){return'<li><button type="button" class="vclip" data-v="'+esc(x.v)+'"><img src="https://i.ytimg.com/vi/'+esc(x.v)+'/mqdefault.jpg" alt="" width="120" height="68" loading="lazy"><span><b>'+esc(x.t)+'</b><i>'+esc(x.n||d.name)+(x.d?' · '+when(x.d):'')+'</i></span></button></li>'}).join('');
      c.addEventListener('click',function(e){var b=e.target.closest('.vclip');if(!b)return;play(b.getAttribute('data-v'));player.scrollIntoView({behavior:'smooth',block:'center'})});
    }
    function list(items,box){return items.map(function(a){return'<li><a href="'+esc(a.u)+'" rel="noopener" target="_blank"><b>'+esc(a.t)+'</b></a><span class="wm">'+esc(d.name)+(a.d?' · '+when(a.d):'')+'</span>'+(a.x?'<p>'+esc(a.x)+'</p>':'')+'</li>'}).join('')}
    var p=d.podcasts||[];if(p.length){var pe=document.getElementById('v-pods');pe.hidden=false;pe.querySelector('ul').innerHTML=list(p)}
    var a=d.articles||[];document.querySelector('#v-articles ul').innerHTML=a.length?list(a):'<li>No articles are available from a public feed right now.</li>';
    if(!vs.length&&!a.length&&!p.length)document.querySelector('#v-articles ul').innerHTML='<li>The feeds for this page are being connected.</li>';
  }).catch(function(){document.querySelector('#v-articles ul').innerHTML='<li>This page could not load just now. Please try again soon.</li>'});
})();
