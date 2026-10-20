(function(){
  if(!document.body.classList.contains('tlfull'))return;
  var cache={};
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function art(){return document.querySelector('main article')}
  function nb(root){var pn=root.querySelector('nav.pn');if(!pn)return{};var p=pn.querySelector('a.prev'),n=pn.querySelector('a.next');
    function t(a){if(!a)return null;var c=a.cloneNode(true);var sp=c.querySelector('span');if(sp)sp.remove();return{u:a.getAttribute('href'),t:c.textContent.trim()}}return{p:t(p),n:t(n)}}
  function bar(){var a=art();if(!a)return;var old=a.querySelector('.tlbar');if(old)old.remove();var x=nb(a),id=(a.querySelector('.id')||{}).textContent||'',m=id.match(/(\d+)/),pos=m?(+m[1]):'';
    var d=document.createElement('div');d.className='tlbar';d.innerHTML=(x.p?'<a class="tlb" href="'+esc(x.p.u)+'" data-tl="1">◀ <span>Earlier</span><small>'+esc(x.p.t)+'</small></a>':'<span class="tlb off"></span>')+'<span class="tlpos">'+esc(id)+(pos?' · '+pos+' of 19':'')+'</span>'+(x.n?'<a class="tlb nx" href="'+esc(x.n.u)+'" data-tl="1"><span>Later</span> ▶<small>'+esc(x.n.t)+'</small></a>':'<span class="tlb off"></span>');
    var h=a.querySelector('header');if(h)h.insertAdjacentElement('afterend',d);
    [x.p,x.n].forEach(function(q){if(q&&!cache[q.u])cache[q.u]=fetch(q.u).then(function(r){return r.text()}).catch(function(){return null})})}
  function load(u,push){(cache[u]||(cache[u]=fetch(u).then(function(r){return r.text()}))).then(function(html){if(!html){location.href=u;return}
      var d=new DOMParser().parseFromString(html,'text/html'),na=d.querySelector('main article');if(!na){location.href=u;return}
      art().innerHTML=na.innerHTML;document.title=d.title;if(push)history.pushState({tl:1},'',u);window.scrollTo({top:0,behavior:'instant'});bar()}).catch(function(){location.href=u})}
  document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a');if(!a||e.metaKey||e.ctrlKey||e.shiftKey||e.button)return;var h=a.getAttribute('href')||'';
    if((a.hasAttribute('data-tl')||a.closest('nav.pn'))&&/^\/timelines\/\d{3}\//.test(h)){e.preventDefault();load(h,true)}});
  window.addEventListener('popstate',function(){load(location.pathname,false)});
  document.addEventListener('keydown',function(e){if(/INPUT|TEXTAREA|SELECT/.test((e.target||{}).tagName||''))return;var x=nb(art()||document);
    if(e.key==='ArrowLeft'&&x.p){load(x.p.u,true)}else if(e.key==='ArrowRight'&&x.n){load(x.n.u,true)}});
  bar();
})();
