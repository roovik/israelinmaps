/* Share row: email and social links that share the NOWlej page itself. */
(function(){
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function pageUrl(){return location.origin+location.pathname+location.search+(/^#v=[\w-]{11}$/.test(location.hash)?location.hash:'')}
  function html(url,title,label,orig){
    var u=encodeURIComponent(url),t=encodeURIComponent(title),both=encodeURIComponent(title+' '+url);
    var L=[['Email','mailto:?subject='+t+'&body='+encodeURIComponent(title+'\n\n'+url)],
      ['WhatsApp','https://wa.me/?text='+both],
      ['Facebook','https://www.facebook.com/sharer/sharer.php?u='+u],
      ['X','https://twitter.com/intent/tweet?url='+u+'&text='+t],
      ['LinkedIn','https://www.linkedin.com/sharing/share-offsite/?url='+u],
      ['Telegram','https://t.me/share/url?url='+u+'&text='+t]];
    var IC={Email:['#5f6368','<svg viewBox="0 0 24 24"><path fill="none" stroke="#fff" stroke-width="1.8" d="M4 6h16v12H4zM4 7l8 6 8-6"/></svg>'],
      WhatsApp:['#25d366','<svg viewBox="0 0 24 24"><path fill="none" stroke="#fff" stroke-width="1.8" d="M12 4a8 8 0 0 0-6.9 12L4 20l4.1-1.1A8 8 0 1 0 12 4z"/><path fill="#fff" d="M9 8.5c-.3.6-.3 1.5.6 2.8 1 1.5 2.3 2.4 3.6 2.7.8.2 1.4-.4 1.6-1l-1.3-.8-.7.5c-.8-.3-1.6-1-2-1.8l.5-.7L10.5 8z"/></svg>'],
      Facebook:['#1877f2','<svg viewBox="0 0 24 24"><path fill="#fff" d="M13.5 20v-7h2.4l.4-2.8h-2.8V8.5c0-.8.3-1.3 1.4-1.3h1.5V4.7c-.3 0-1.1-.1-2.1-.1-2.1 0-3.5 1.3-3.5 3.6v2H8.4V13h2.4v7z"/></svg>'],
      X:['#000','<svg viewBox="0 0 24 24"><path fill="#fff" d="M17.5 4h2.7l-5.9 6.7L21 20h-5.4l-4.2-5.5L6.6 20H3.9l6.3-7.2L3.4 4H9l3.8 5.1zm-1 14.4h1.5L8 5.5H6.4z"/></svg>'],
      LinkedIn:['#0a66c2','<svg viewBox="0 0 24 24"><path fill="#fff" d="M5 9h3v10H5zM6.5 4.5a1.8 1.8 0 1 1 0 3.600 1.8 1.8 0 0 1 0-3.600zM10 9h2.900v1.400c.5-.9 1.600-1.600 3.100-1.600 3 0 3.600 2 3.600 4.500V19h-3v-5c0-1.200 0-2.600-1.600-2.600S13 12.700 13 14v5h-3z"/></svg>'],
      Telegram:['#229ed9','<svg viewBox="0 0 24 24"><path fill="#fff" d="M4 11.500l15-6c.7-.3 1.300.2 1.100 1.200l-2.500 12c-.2.800-.7 1-1.400.6l-3.800-2.800-1.800 1.800c-.2.200-.4.400-.8.400l.3-3.900 7-6.300c.3-.3-.1-.4-.5-.2L7.400 13.300 3.700 12.100c-.8-.3-.8-.8.300-1.100z"/></svg>']};
    var h='<span class="shl">SHARE:</span>'+L.map(function(x){return'<a href="'+x[1]+'" target="_blank" rel="noopener nofollow" data-sh="'+x[0]+'" class="ic" style="background:'+IC[x[0]][0]+'" aria-label="Share by '+x[0]+'" title="'+x[0]+'">'+IC[x[0]][1]+'</a>'}).join('')+'<button type="button" data-sh="copy" class="ic" style="background:#6b6b6b" aria-label="Copy link" title="Copy link" data-u="'+esc(url)+'"><svg viewBox="0 0 24 24"><path fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" d="M10 14a4 4 0 0 0 5.700 0l3-3a4 4 0 0 0-5.700-5.700l-1 1M14 10a4 4 0 0 0-5.700 0l-3 3a4 4 0 0 0 5.700 5.700l1-1"/></svg></button>';
    if(navigator.share)h+='<button type="button" data-sh="native" data-u="'+esc(url)+'" data-t="'+esc(title)+'" class="ic" style="background:#8a6d3b" aria-label="More share options" title="More"><svg viewBox="0 0 24 24"><path fill="#fff" d="M6 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/></svg></button>';
    if(orig)h+='<span class="sho"><a href="mailto:?subject='+t+'&body='+encodeURIComponent(title+'\n\n'+orig)+'" rel="noopener nofollow">Email the original article</a></span>';
    return h}
  function mk(url,title,label,orig){var d=document.createElement('div');d.className='share';d.setAttribute('role','group');d.setAttribute('aria-label',label||'Share');d.innerHTML=html(url,title,label,orig);return d}
  window.NOWSHARE={html:html,mk:mk,url:pageUrl};
  document.addEventListener('click',function(e){var b=e.target.closest('[data-sh]');if(!b)return;var k=b.getAttribute('data-sh');
    if(k==='copy'){e.preventDefault();var u=b.getAttribute('data-u'),done=function(){var o=b.getAttribute('title');b.setAttribute('title','Link copied');b.classList.add('ok');setTimeout(function(){b.setAttribute('title',o);b.classList.remove('ok')},1800)};
      if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(u).then(done,function(){prompt('Copy this link',u)});else{var ta=document.createElement('textarea');ta.value=u;document.body.appendChild(ta);ta.select();try{document.execCommand('copy');done()}catch(x){prompt('Copy this link',u)}ta.remove()}}
    else if(k==='native'){e.preventDefault();navigator.share({title:b.getAttribute('data-t'),url:b.getAttribute('data-u')}).catch(function(){})}});
  function init(){
    if(/^\/admin\//.test(location.pathname))return;
    var title=(document.querySelector('h1')||{}).textContent||document.title;title=document.title||title;
    var orig=(document.querySelector('article[data-orig]')||{getAttribute:function(){return''}}).getAttribute('data-orig');
    var wb=document.querySelector('.whobtn');if(wb&&wb.parentNode){var pr=mk(pageUrl(),title,'Share this profile');pr.classList.add('sharehero');wb.parentNode.appendChild(pr)}
    var f=document.querySelector('footer');
    if(f&&f.parentNode){var pg=mk(pageUrl(),title,'Share this page',orig);pg.classList.add('sharepg');f.parentNode.insertBefore(pg,f)}
    ['e-player','e-plplayer','vid-top','v-player'].forEach(function(id){var el=document.getElementById(id);if(!el||!el.parentNode)return;
      var r=mk(pageUrl(),title,id==='e-plplayer'?'Share this playlist page':'Share this video page');r.classList.add('sharev');el.parentNode.insertBefore(r,el.nextSibling);
      var sync=function(){r.hidden=el.hidden||!el.innerHTML.trim()};sync();new MutationObserver(sync).observe(el,{attributes:true,childList:true})})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
