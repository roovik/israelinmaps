/* HOT pages: headlines from the live news and views feeds that match the topic's keywords. */
(function(){
  var box=document.getElementById('hot-feed');if(!box)return;
  var kw=[];try{kw=JSON.parse(box.getAttribute('data-kw')||'[]')}catch(e){}
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function ago(d){if(!d)return'';var m=Math.round((Date.now()-new Date(d))/60000);if(isNaN(m))return'';if(m<60)return Math.max(m,1)+' min ago';if(m<1440)return Math.round(m/60)+' h ago';return Math.round(m/1440)+' d ago'}
  function hit(i){if(!kw.length)return true;var t=((i.t||'')+' '+(i.x||'')).toLowerCase();return kw.some(function(k){return t.indexOf(k)>-1})}
  function fill(k,url){fetch(url).then(function(r){return r.json()}).then(function(d){
    var ul=box.querySelector('[data-k='+k+'] ul');if(!ul)return;var items=(d.items||[]).filter(hit).slice(0,6);
    ul.innerHTML=items.length?items.map(function(i){var h=i.k?'/news/item/'+esc(i.k)+'/?s='+encodeURIComponent(i.s)+(i.ch?'&c='+encodeURIComponent(i.ch):''):esc(i.u);return'<li><a href="'+h+'">'+esc(i.t)+'</a><span class="wm">'+esc(i.src||'')+' · '+ago(i.d)+'</span></li>'}).join(''):'<li class="wm">Nothing on this topic in the current feeds.</li>'}).catch(function(){})}
  fill('news','/api/news?v=2');fill('views','/api/news?views=1&v=2');
})();
