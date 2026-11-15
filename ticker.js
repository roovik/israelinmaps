(function(){
  var tk=document.getElementById('news-ticker');
  if(!tk)return;
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function when(iso){return iso?new Date(iso).toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}):''}
  function iu(it){return it.k?'/news/item/'+it.k+'/?s='+encodeURIComponent(it.s)+(it.ch?'&c='+encodeURIComponent(it.ch):''):it.u}
  function isBrk(i){return i.d&&(Date.now()-new Date(i.d).getTime()<=3*3600*1000||/\b(breaking|live)\b/i.test(i.t))}
  fetch('/api/news?v=2').then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(data){
    var week=30*864e5,dated=data.items.filter(function(i){return i.d&&Date.now()-new Date(i.d)<=week}).slice(0,12);
    if(!dated.length)return;
    tk.innerHTML=dated.map(function(i,n){return'<a class="tki'+(n?'':' on')+'" href="'+esc(iu(i))+'"><span class="tkt">'+esc(i.t)+'</span><span class="tkm">'+esc(i.src)+' · '+when(i.d)+'</span></a>'}).join('');
    tk.insertAdjacentHTML('beforeend','<span class="tknav"><button type="button" class="tkb" data-d="-1" aria-label="Previous headline">&#9650;</button><button type="button" class="tkb" data-d="1" aria-label="Next headline">&#9660;</button></span>');
    tk.hidden=false;
    function fit(){var m=0;[].forEach.call(tk.querySelectorAll('.tki'),function(e){var h=0;[].forEach.call(e.children,function(c){h+=c.offsetHeight});if(h>m)m=h});tk.style.height=(m+16)+'px'}
    fit();window.addEventListener('resize',fit);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fit);
    var cur=0,paused=false,els=tk.querySelectorAll('.tki');
    tk.addEventListener('mouseenter',function(){paused=true});tk.addEventListener('mouseleave',function(){paused=false});
    tk.addEventListener('focusin',function(){paused=true});tk.addEventListener('focusout',function(){paused=false});
    function step(d){var o=els[cur];cur=(cur+d+els.length)%els.length;var n=els[cur];[].forEach.call(els,function(e){if(e!==o&&e!==n)e.className='tki'});o.className='tki '+(d>0?'out':'in');n.className='tki on';setTimeout(function(){if(o!==els[cur])o.className='tki'},700)}
    tk.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('.tkb');if(!b)return;e.preventDefault();step(+b.getAttribute('data-d'))});
    if(els.length>1)setInterval(function(){if(paused||document.hidden)return;step(1)},5000);
  }).catch(function(){});
})();
