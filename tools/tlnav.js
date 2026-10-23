(function(){
  if(!document.body.classList.contains('tlfull'))return;
  var cache={};
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function art(){return document.querySelector('main article')}
  function nb(root){var pn=root.querySelector('nav.pn');if(!pn)return{};var p=pn.querySelector('a.prev'),n=pn.querySelector('a.next');
    function t(a){if(!a)return null;var c=a.cloneNode(true);var sp=c.querySelector('span');if(sp)sp.remove();return{u:a.getAttribute('href'),t:c.textContent.trim()}}return{p:t(p),n:t(n)}}
  function bar(){var a=art();if(!a)return;var old=a.querySelector('.tlbar');if(old)old.remove();var x=nb(a),id=(a.querySelector('.id')||{}).textContent||'',m=id.match(/(\d+)/),pos=m?(+m[1]):'';
    var d=document.createElement('div');d.className='tlbar';d.innerHTML=(x.p?'<a class="tlb" href="'+esc(x.p.u)+'" data-tl="1"><span>◀ Earlier</span><small>'+esc(x.p.t)+'</small></a>':'<span class="tlb off"></span>')+'<span class="tlpos">'+esc(id)+(pos?' · '+pos+' of 19':'')+'</span>'+(x.n?'<a class="tlb nx" href="'+esc(x.n.u)+'" data-tl="1"><span>Later ▶</span><small>'+esc(x.n.t)+'</small></a>':'<span class="tlb off"></span>');
    var h=a.querySelector('header');if(h)h.insertAdjacentElement('afterend',d);
    [x.p,x.n].forEach(function(q){if(q&&!cache[q.u])cache[q.u]=fetch(q.u).then(function(r){return r.text()}).catch(function(){return null})})}
  function load(u,push){(cache[u]||(cache[u]=fetch(u).then(function(r){return r.text()}))).then(function(html){if(!html){location.href=u;return}
      var d=new DOMParser().parseFromString(html,'text/html'),na=d.querySelector('main article');if(!na){location.href=u;return}
      art().innerHTML=na.innerHTML;document.title=d.title;if(push)history.pushState({tl:1},'',u);window.scrollTo({top:0,behavior:'instant'});bar();if(window.__tlArrows)window.__tlArrows();try{document.dispatchEvent(new Event('tl:nav'))}catch(e){}}).catch(function(){location.href=u})}
  document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a');if(!a||e.metaKey||e.ctrlKey||e.shiftKey||e.button)return;var h=a.getAttribute('href')||'';
    if((a.hasAttribute('data-tl')||a.closest('nav.pn'))&&/^\/timelines\/\d{3}\//.test(h)){e.preventDefault();load(h,true)}});
  window.addEventListener('popstate',function(){load(location.pathname,false)});
  document.addEventListener('keydown',function(e){if(/INPUT|TEXTAREA|SELECT/.test((e.target||{}).tagName||''))return;var x=nb(art()||document);
    if(e.key==='ArrowLeft'&&x.p){load(x.p.u,true)}else if(e.key==='ArrowRight'&&x.n){load(x.n.u,true)}});

  /* Phones: the timeline image straight under the menu, floating arrows (and swipes) for earlier and later */
  (function(){
    var st=document.createElement('style');st.textContent=
      '.tlarrow{display:none}'+
      '@media (max-width:700px){'+
        'body.tlfull main article>header.ih{position:absolute!important;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}'+
        'body.tlfull .tlbar{display:none!important}'+
        'body.tlfull main article .pages{margin-top:6px}'+
        '.tlarrow{display:flex;align-items:center;justify-content:center;position:fixed;top:55%;z-index:30;width:40px;height:64px;margin-top:-32px;background:rgba(43,47,56,.78);color:#fff;text-decoration:none;font:700 1.5rem/1 system-ui,sans-serif;box-shadow:0 4px 14px rgba(0,0,0,.25);-webkit-tap-highlight-color:transparent}'+
        '.tlarrow:active{background:rgba(106,61,154,.92)}'+
        '.tlarrow.prev{left:0}.tlarrow.next{right:0}.tlarrow[hidden]{display:none}'+
      '}';
    document.head.appendChild(st);
    var P=document.createElement('a'),N=document.createElement('a');
    P.className='tlarrow prev';N.className='tlarrow next';P.innerHTML='&#8249;';N.innerHTML='&#8250;';P.setAttribute('data-tl','1');N.setAttribute('data-tl','1');
    document.body.appendChild(P);document.body.appendChild(N);
    window.__tlArrows=function(){var x=nb(art()||document);
      [[P,x.p,'Earlier: '],[N,x.n,'Later: ']].forEach(function(z){var el=z[0],q=z[1];if(q){el.href=q.u;el.hidden=false;el.setAttribute('aria-label',z[2]+q.t);el.title=z[2]+q.t}else{el.hidden=true;el.removeAttribute('href')}})};
    window.__tlArrows();
    var sx=null,sy=null;
    document.addEventListener('touchstart',function(e){var a=e.target.closest&&e.target.closest('main article .pages');if(!a||e.touches.length!==1){sx=null;return}sx=e.touches[0].clientX;sy=e.touches[0].clientY},{passive:true});
    document.addEventListener('touchend',function(e){if(sx==null)return;var t=e.changedTouches[0],dx=t.clientX-sx,dy=t.clientY-sy;sx=null;
      if(Math.abs(dx)<60||Math.abs(dx)<Math.abs(dy)*1.5)return;var x=nb(art()||document);if(dx<0&&x.n)load(x.n.u,true);else if(dx>0&&x.p)load(x.p.u,true)},{passive:true});
  })();
  bar();
})();
