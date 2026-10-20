/* Share row: email and social links that share the NOWlej page itself. */
(function(){
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function pageUrl(){return location.origin+location.pathname+location.search}
  function html(url,title,label,orig){
    var u=encodeURIComponent(url),t=encodeURIComponent(title),both=encodeURIComponent(title+' '+url);
    var L=[['Email','mailto:?subject='+t+'&body='+encodeURIComponent(title+'\n\n'+url)],
      ['WhatsApp','https://wa.me/?text='+both],
      ['Facebook','https://www.facebook.com/sharer/sharer.php?u='+u],
      ['X','https://twitter.com/intent/tweet?url='+u+'&text='+t],
      ['LinkedIn','https://www.linkedin.com/sharing/share-offsite/?url='+u],
      ['Telegram','https://t.me/share/url?url='+u+'&text='+t]];
    var h='<span class="shl">'+esc(label||'Share this page')+'</span>'+L.map(function(x){return'<a href="'+x[1]+'" target="_blank" rel="noopener nofollow" data-sh="'+x[0]+'">'+x[0]+'</a>'}).join('')+'<button type="button" data-sh="copy" data-u="'+esc(url)+'">Copy link</button>';
    if(navigator.share)h+='<button type="button" data-sh="native" data-u="'+esc(url)+'" data-t="'+esc(title)+'">More</button>';
    if(orig)h+='<span class="sho"><a href="mailto:?subject='+t+'&body='+encodeURIComponent(title+'\n\n'+orig)+'" rel="noopener nofollow">Email the original article</a></span>';
    return h}
  function mk(url,title,label,orig){var d=document.createElement('div');d.className='share';d.setAttribute('role','group');d.setAttribute('aria-label',label||'Share');d.innerHTML=html(url,title,label,orig);return d}
  window.NOWSHARE={html:html,mk:mk,url:pageUrl};
  document.addEventListener('click',function(e){var b=e.target.closest('[data-sh]');if(!b)return;var k=b.getAttribute('data-sh');
    if(k==='copy'){e.preventDefault();var u=b.getAttribute('data-u'),done=function(){var o=b.textContent;b.textContent='Link copied';setTimeout(function(){b.textContent=o},1800)};
      if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(u).then(done,function(){prompt('Copy this link',u)});else{var ta=document.createElement('textarea');ta.value=u;document.body.appendChild(ta);ta.select();try{document.execCommand('copy');done()}catch(x){prompt('Copy this link',u)}ta.remove()}}
    else if(k==='native'){e.preventDefault();navigator.share({title:b.getAttribute('data-t'),url:b.getAttribute('data-u')}).catch(function(){})}});
  function init(){
    if(/^\/admin\//.test(location.pathname))return;
    var title=(document.querySelector('h1')||{}).textContent||document.title;title=document.title||title;
    var orig=(document.querySelector('article[data-orig]')||{getAttribute:function(){return''}}).getAttribute('data-orig');
    var f=document.querySelector('footer');
    if(f&&f.parentNode){var pg=mk(pageUrl(),title,'Share this page',orig);pg.classList.add('sharepg');f.parentNode.insertBefore(pg,f)}
    ['e-player','e-plplayer','vid-top'].forEach(function(id){var el=document.getElementById(id);if(!el||!el.parentNode)return;
      var r=mk(pageUrl(),title,id==='e-plplayer'?'Share this playlist page':'Share this video page');r.classList.add('sharev');el.parentNode.insertBefore(r,el.nextSibling);
      var sync=function(){r.hidden=el.hidden||!el.innerHTML.trim()};sync();new MutationObserver(sync).observe(el,{attributes:true,childList:true})})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
