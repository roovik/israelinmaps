(function(){
  var grid=document.getElementById('news-grid'),box=document.getElementById('gl-news');
  if(!grid&&!box)return;
  var STOP={'israel':1,'eli':1,'paul':1,'cana':1,'ariel':1,'zion':1,'saul':1,'jacob':1};
  function esc(s){return s.replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function ago(iso){if(!iso)return'';var s=(Date.now()-new Date(iso))/1000;if(s<3600)return Math.max(1,Math.round(s/60))+' min ago';if(s<86400)return Math.round(s/3600)+' h ago';if(s<604800)return Math.round(s/86400)+' days ago';return new Date(iso).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}
  Promise.all([fetch('/api/news').then(function(r){if(!r.ok)throw 0;return r.json()}),fetch('/glossary.json').then(function(r){return r.json()})]).then(function(a){
    var data=a[0],gl=a[1],terms=[];
    gl.forEach(function(g){g[2].forEach(function(t){if(t.length>3&&!STOP[t.toLowerCase()])terms.push([t,g[1],g[0]])})});
    terms.sort(function(x,y){return y[0].length-x[0].length});
    var res=terms.map(function(t){return new RegExp('(^|[^A-Za-z])'+t[0].replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?![A-Za-z])')});
    data.items.forEach(function(it){var txt=it.t+' '+it.x,seen={},m=[];
      terms.forEach(function(t,i){if(m.length<3&&!seen[t[1]]&&res[i].test(txt)){seen[t[1]]=1;m.push([t[1],t[2]])}});it.g=m});
    function card(it,showG){
      var img=it.i?'<img src="'+esc(it.i)+'" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.parentNode.classList.add(\'noimg\');this.remove()">':'';
      var chips=showG&&it.g.length?'<p class="chips">In the glossary: '+it.g.map(function(g){return'<a href="/g/'+g[0]+'/">'+esc(g[1])+'</a>'}).join(' ')+'</p>':'';
      return'<article class="ncard'+(it.i?'':' noimg')+'"><a class="nimg" href="'+esc(it.u)+'" rel="noopener" tabindex="-1" aria-hidden="true">'+img+'</a><div class="nb"><p class="nmeta"><b>'+esc(it.src)+'</b> · '+ago(it.d)+'</p><h3><a href="'+esc(it.u)+'" rel="noopener">'+esc(it.t)+'</a></h3><p>'+esc(it.x)+'</p>'+chips+'</div></article>'}
    if(grid){
      var f=document.getElementById('news-filter'),cur='all';
      f.innerHTML='<button data-s="all" aria-pressed="true">All</button>'+data.sources.filter(function(s){return s.ok}).map(function(s){return'<button data-s="'+s.id+'" aria-pressed="false">'+esc(s.name)+'</button>'}).join('');
      var g2=document.getElementById('news-glonly');
      function draw(){var list=data.items.filter(function(i){return(cur==='all'||i.s===cur)&&(!g2.checked||i.g.length)});
        grid.innerHTML=list.length?list.map(function(i){return card(i,true)}).join(''):'<p>Nothing matches that filter right now.</p>'}
      f.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;cur=b.getAttribute('data-s');[].forEach.call(f.children,function(x){x.setAttribute('aria-pressed',x===b)});draw()});
      g2.addEventListener('change',draw);draw();
      var st=document.getElementById('news-status');
      st.innerHTML='Updated '+new Date(data.updated).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})+'. Sources: '+data.sources.map(function(s){return esc(s.name)+(s.ok?' ('+s.count+')':' (unavailable: '+esc(s.error)+')')}).join(', ')+'.';
    }
    if(box){
      var slug=box.getAttribute('data-slug');
      var l=data.items.filter(function(i){return i.g.some(function(g){return g[0]===slug})}).slice(0,4);
      if(l.length){box.querySelector('.ngrid').innerHTML=l.map(function(i){return card(i,false)}).join('');box.hidden=false}
    }
  }).catch(function(){var st=document.getElementById('news-status');if(st)st.textContent='The news feed could not be loaded right now. Please try again later.';if(grid)grid.innerHTML=''});
})();
