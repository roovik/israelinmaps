(function(){
  var pg=document.getElementById('src-page');if(!pg)return;
  var id=pg.getAttribute('data-src');
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function ago(iso){if(!iso)return'';var s=(Date.now()-new Date(iso))/1000;if(s<3600)return Math.max(1,Math.round(s/60))+' min ago';if(s<86400)return Math.round(s/3600)+' h ago';return Math.round(s/86400)+' days ago'}
  function iu(it){if(!it.k)return it.u;return'/news/item/'+it.k+'/?s='+encodeURIComponent(it.s)+(it.ch?'&c='+encodeURIComponent(it.ch):'')}
  function cards(list){return list.map(function(it){
    var img=it.i?'<img src="'+esc(it.i)+'" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">':'';
    return'<a class="tcard" href="'+esc(iu(it))+'"><span class="timg">'+img+'</span><span class="tb"><span class="tid">'+esc(it.kind||'')+(it.kind&&it.d?' · ':'')+ago(it.d)+'</span><b>'+esc(it.t)+'</b></span></a>'}).join('')}
  function load(url,boxId,label){
    var box=document.getElementById(boxId);
    if(id==='haaretz'||id==='insider')box.className+=' g4';
    return fetch(url).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(d){
      var l=(d.items||[]).filter(function(i){return i.s===id&&(!i.d||Date.now()-new Date(i.d)<=7*864e5)}).slice(0,12);
      box.innerHTML=l.length?cards(l):'<p>No '+label+' from this source in the last seven days.</p>';return l.length
    }).catch(function(){box.innerHTML='<p>The '+label+' could not be loaded right now.</p>';return 0})}
  var show=new URLSearchParams(location.search).get('show');if(show!=='news'&&show!=='views')show='';
  var nm=document.getElementById('src-h1').getAttribute('data-name');
  if(show){document.getElementById(show==='news'?'src-vsec':'src-nsec').hidden=true;document.getElementById('src-h1').textContent='Source: '+nm+(show==='news'?' \u00b7 News':' \u00b7 Blogs');document.title=nm+(show==='news'?' News':' Blogs')+' | Israel NOWlej'}
  [].forEach.call(document.querySelectorAll('#src-tabs a[data-show]'),function(a){if(a.getAttribute('data-show')===show)a.setAttribute('aria-current','page')});
  var jobs=[show==='views'?Promise.resolve(0):load('/api/news?v=2','src-news','news'),show==='news'?Promise.resolve(0):load('/api/news?views=1&v=2','src-views','views')];
  Promise.all(jobs).then(function(n){
    var c=document.getElementById('src-count');if(c)c.textContent=show==='news'?n[0]+' news stories from the last seven days are shown below.':show==='views'?n[1]+' views from the last seven days are shown below.':n[0]+' news stories and '+n[1]+' views from the last seven days are shown below.'});
})();
