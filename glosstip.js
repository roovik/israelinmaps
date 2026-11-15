/* NOWlej glossary links in story text: hover (or first tap on a phone) shows the term's one-line definition. */
(function(){
  var tip=null,cur=null,hideT=null,touch=false;
  function esc(s){return String(s||'').replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function show(a){
    clearTimeout(hideT);if(cur===a&&tip)return;cur=a;
    if(!tip){tip=document.createElement('div');tip.className='gtip';tip.setAttribute('role','tooltip');document.body.appendChild(tip);
      tip.addEventListener('mouseenter',function(){clearTimeout(hideT)});tip.addEventListener('mouseleave',hide)}
    tip.innerHTML='<b>'+esc(a.getAttribute('data-gn'))+'</b>'+(a.getAttribute('data-gd')?'<span>'+esc(a.getAttribute('data-gd'))+'</span>':'')+'<a href="'+esc(a.getAttribute('href'))+'">Read more in NOWlej</a>';
    tip.style.display='block';
    var r=a.getBoundingClientRect(),w=Math.min(320,window.innerWidth-20),x=Math.max(10,Math.min(r.left+window.scrollX,window.scrollX+window.innerWidth-w-10));
    tip.style.width=w+'px';tip.style.left=x+'px';tip.style.top=(r.bottom+window.scrollY+6)+'px';
  }
  function hide(){hideT=setTimeout(function(){if(tip)tip.style.display='none';cur=null},180)}
  document.addEventListener('touchstart',function(){touch=true},{passive:true,once:true});
  document.addEventListener('mouseover',function(e){var a=e.target.closest&&e.target.closest('a.glink');if(a&&!touch)show(a)});
  document.addEventListener('mouseout',function(e){var a=e.target.closest&&e.target.closest('a.glink');if(a&&!touch)hide()});
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a.glink');
    if(a){if(touch&&cur!==a){e.preventDefault();show(a)}return}
    if(tip&&!(e.target.closest&&e.target.closest('.gtip'))){tip.style.display='none';cur=null}
  });
  window.addEventListener('scroll',function(){if(touch&&tip){tip.style.display='none';cur=null}},{passive:true});
})();
