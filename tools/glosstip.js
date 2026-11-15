/* Rollover cards for NOWlej glossary links: hovering (or a first tap on a phone) over any link to a glossary entry
   shows the term and the first paragraph of its entry, with a link to the full entry.
   Story pages carry the text in data-gd; elsewhere it is read from /glossary-gist.json on first use. */
(function(){
  var tip=null,cur=null,hideT=null,touch=false,GIST=null,NAMES=null,loading=null;
  var SEL='a.glink, main a[href^="/g/"], .newspage a[href^="/g/"], article a[href^="/g/"]';
  var SKIP='nav, aside, header, footer, .gcard, .az, .glgrid, .gloss-index, .apick, .chips-off';
  function esc(s){return String(s||'').replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function slugOf(a){var m=/^\/g\/([^\/?#]+)\/?/.exec(a.getAttribute('href')||'');return m?decodeURIComponent(m[1]):''}
  function target(el){var a=el&&el.closest&&el.closest(SEL);if(!a)return null;if(!a.classList.contains('glink')&&a.closest(SKIP))return null;
    var s=slugOf(a);if(!s||location.pathname==='/g/'+s+'/')return null;if(!a.classList.contains('glink')&&!a.classList.contains('gtrig'))return null;return a}
  /* only plain text links become rollover triggers, and they get the dotted underline (class gtrig) */
  function mark(root){[].forEach.call((root||document).querySelectorAll(SEL),function(a){if(a.classList.contains('glink')||a.classList.contains('gtrig'))return;if(a.closest(SKIP))return;
    if(a.className&&!/\bgtrig\b/.test(a.className))return;if(a.querySelector('img,svg,div,p,h1,h2,h3,h4,figure,ul'))return;var s=slugOf(a);if(!s||location.pathname==='/g/'+s+'/')return;a.classList.add('gtrig')})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){mark()});else mark();
  if(window.MutationObserver){var mt=null;new MutationObserver(function(){clearTimeout(mt);mt=setTimeout(function(){mark()},150)}).observe(document.documentElement,{childList:true,subtree:true})}

  /* glossary entry pages: other glossary terms named in the entry's own text become dotted rollover links (first mention only) */
  (function(){
    var m=/^\/g\/([^\/]+)\/?$/.exec(location.pathname);if(!m)return;var self=decodeURIComponent(m[1]);
    var SKIPT=/^(israel|eli|paul|cana|ariel|zion|saul|jacob|census|david|sarah|joshua|amos|gideon|ezra|titus|romans|jordan)$/i,
        NAME=/^(abraham|isaac|moses|elijah|elisha|isaiah|hosea|haggai|josiah|jehu|ahab|omri|jesus|pompey|ramban)$/i,MAX=12;
    var terms=null,used={},count=0;
    function linked(){[].forEach.call(document.querySelectorAll('main a[href^="/g/"]'),function(a){var s=slugOf(a);if(s)used[s]=1})}
    function wrap(root){
      if(!terms||!root||count>=MAX)return;
      var tw=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:function(n){return n.parentNode.closest('a,script,style,.he,h1,h2,h3')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}}),nodes=[],n;
      while((n=tw.nextNode()))nodes.push(n);
      terms.forEach(function(t){
        if(count>=MAX||used[t[1]])return;
        var re=new RegExp('(^|[^A-Za-z\u00C0-\u024F])('+t[0].replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')(?![A-Za-z\u00C0-\u024F])');
        for(var i=0;i<nodes.length;i++){var tn=nodes[i],v=tn.nodeValue,mm=re.exec(v);if(!mm)continue;
          var a0=mm.index+mm[1].length,b0=a0+mm[2].length;
          if(NAME.test(t[0])&&(/^\s+[A-Z]/.test(v.slice(b0))||/[A-Z][\w'’-]*\s+$/.test(v.slice(0,a0))))continue;
          var mid=tn.splitText(a0),rest=mid.splitText(b0-a0),a=document.createElement('a');
          a.className='glink';a.href='/g/'+t[1]+'/';a.setAttribute('data-gn',t[2]);a.textContent=mid.nodeValue;mid.parentNode.replaceChild(a,mid);
          nodes.splice(i,1,tn,rest);used[t[1]]=1;count++;break}
      })
    }
    function run(){linked();used[self]=1;
      [].forEach.call(document.querySelectorAll('#e-def, .edef, #e-wiki p:not(.small), .tl-text, .entry-text'),wrap)}
    fetch('/glossary.json?v=3').then(function(r){return r.json()}).then(function(g){
      terms=[];g.forEach(function(e){e[2].forEach(function(t){if(t.length>3&&!SKIPT.test(t))terms.push([t,e[1],e[0]])})});
      terms.sort(function(x,y){return y[0].length-x[0].length});
      run();
      var wk=document.getElementById('e-wiki');
      if(wk&&window.MutationObserver){var ob=new MutationObserver(function(){if(!wk.hidden&&wk.querySelector('p')){ob.disconnect();[].forEach.call(wk.querySelectorAll('p:not(.small)'),wrap)}});ob.observe(wk,{childList:true,attributes:true})}
    }).catch(function(){});
  })();
  function load(){if(GIST)return Promise.resolve();if(!loading)loading=Promise.all([fetch('/glossary-gist.json?v=3').then(function(r){return r.json()}),fetch('/glossary.json?v=3').then(function(r){return r.json()})]).then(function(a){GIST=a[0];NAMES={};a[1].forEach(function(e){NAMES[e[1]]=e[0]})}).catch(function(){GIST={};NAMES={}});return loading}
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
