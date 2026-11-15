/* Rollover cards for NOWlej glossary links: hovering (or a first tap on a phone) over any link to a glossary entry
   shows the term and the first paragraph of its entry, with a link to the full entry.
   Story pages carry the text in data-gd; elsewhere it is read from /glossary-gist.json on first use. */
(function(){
  var tip=null,cur=null,hideT=null,touch=false,GIST=null,NAMES=null,loading=null;
  var SEL='a.glink, main a[href^="/g/"], .newspage a[href^="/g/"], article a[href^="/g/"]';
  var SKIP='nav, aside, header, footer, .az, .glgrid, .gloss-index, .apick, .chips-off';
  function esc(s){return String(s||'').replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function slugOf(a){var m=/^\/g\/([^\/?#]+)\/?/.exec(a.getAttribute('href')||'');return m?decodeURIComponent(m[1]):''}
  function target(el){var a=el&&el.closest&&el.closest(SEL);if(!a)return null;if(!a.classList.contains('glink')&&a.closest(SKIP))return null;
    var s=slugOf(a);if(!s||location.pathname==='/g/'+s+'/')return null;return a}
  function load(){if(GIST)return Promise.resolve();if(!loading)loading=Promise.all([fetch('/glossary-gist.json?v=2').then(function(r){return r.json()}),fetch('/glossary.json').then(function(r){return r.json()})]).then(function(a){GIST=a[0];NAMES={};a[1].forEach(function(e){NAMES[e[1]]=e[0]})}).catch(function(){GIST={};NAMES={}});return loading}
  function paint(a){
    var s=slugOf(a),name=a.getAttribute('data-gn')||(NAMES&&NAMES[s])||a.textContent.trim(),d=a.getAttribute('data-gd')||(GIST&&GIST[s])||'';
    if(!tip){tip=document.createElement('div');tip.className='gtip';tip.setAttribute('role','tooltip');document.body.appendChild(tip);
      tip.addEventListener('mouseenter',function(){clearTimeout(hideT)});tip.addEventListener('mouseleave',hide)}
    tip.innerHTML='<b>'+esc(name)+'</b>'+(d?'<span>'+esc(d)+'</span>':'')+'<a href="'+esc(a.getAttribute('href'))+'">Read the full NOWlej entry &rarr;</a>';
    tip.style.display='block';
    var r=a.getBoundingClientRect(),w=Math.min(340,window.innerWidth-20),x=Math.max(10,Math.min(r.left+window.scrollX,window.scrollX+window.innerWidth-w-10));
    tip.style.width=w+'px';tip.style.left=x+'px';
    var below=r.bottom+window.scrollY+6;tip.style.top=below+'px';
    var h=tip.offsetHeight;if(r.bottom+h+12>window.innerHeight&&r.top-h-12>0)tip.style.top=(r.top+window.scrollY-h-6)+'px';
  }
  function show(a){clearTimeout(hideT);if(cur===a&&tip&&tip.style.display==='block')return;cur=a;
    if(a.getAttribute('data-gd')||GIST){paint(a);return}
    load().then(function(){if(cur===a)paint(a)})}
  function hide(){hideT=setTimeout(function(){if(tip)tip.style.display='none';cur=null},200)}
  document.addEventListener('touchstart',function(){touch=true},{passive:true,once:true});
  document.addEventListener('mouseover',function(e){if(touch)return;var a=target(e.target);if(a)show(a)});
  document.addEventListener('mouseout',function(e){if(touch)return;var a=target(e.target);if(a)hide()});
  document.addEventListener('focusin',function(e){var a=target(e.target);if(a)show(a)});
  document.addEventListener('focusout',function(e){var a=target(e.target);if(a)hide()});
  document.addEventListener('click',function(e){
    var a=target(e.target);
    if(a){if(touch&&cur!==a){e.preventDefault();show(a)}return}
    if(tip&&!(e.target.closest&&e.target.closest('.gtip'))){tip.style.display='none';cur=null}
  });
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&tip){tip.style.display='none';cur=null}});
  window.addEventListener('scroll',function(){if(touch&&tip){tip.style.display='none';cur=null}},{passive:true});
})();
