(function(){
  document.addEventListener('click',function(e){
    var b=e.target.closest('.copy');if(!b)return;
    var t=b.getAttribute('data-copy');
    function ok(){var o=b.textContent;b.textContent='Copied';setTimeout(function(){b.textContent=o},1500)}
    if(navigator.clipboard){navigator.clipboard.writeText(t).then(ok,function(){fallback(t,ok)})}else fallback(t,ok);
  });
  function fallback(t,ok){var a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();try{document.execCommand('copy');ok()}catch(x){}document.body.removeChild(a)}
  var res=document.getElementById('results');if(!res)return;
  var q=document.getElementById('q');
  var params=new URLSearchParams(location.search);
  var start=params.get('q')||'';
  if(!start&&document.body.classList.contains('nf')){start=decodeURIComponent(location.pathname).replace(/[\/\-_]+/g,' ').trim()}
  if(q)q.value=start;
  function norm(s){return s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g,'').replace(/['’]/g,'')}
  var live={News:[],Views:[]};
  function getLive(name,url){fetch(url).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(d){
    live[name]=(d.items||[]).filter(function(i){return!i.d||Date.now()-new Date(i.d)<=7*864e5}).map(function(i){
      return{t:i.t,u:i.k?'/news/item/'+i.k+'/?s='+encodeURIComponent(i.s)+(i.ch?'&c='+encodeURIComponent(i.ch):''):i.u,i:i.i||'',k:i.src,s:i.d?new Date(i.d).toLocaleDateString('en-GB',{day:'numeric',month:'short'}):'',x:i.x||''}});
    if(window.__run)window.__run()}).catch(function(){})}
  getLive('News','/api/news?v=2');getLive('Views','/api/news?views=1&v=2');
  var SEC=[['News'],['Views'],['Maps'],['Timelines'],['Charts'],['Media'],['NOWlej'],['Other']];
  function secOf(u){var f=u.split('/')[1];
    if(f==='maps')return'Maps';if(f==='timelines')return'Timelines';
    if(['tables','demographics','rankings','top-ten','size','population'].indexOf(f)>-1)return'Charts';
    if(f==='tour'||f==='flora')return'Media';if(f==='g'||f==='glossary')return'NOWlej';return'Other'}
  fetch('/search.json').then(function(r){return r.json()}).then(function(data){
    function score(d,term,words,idq){
      var t=norm(d.t),x=norm(d.x||''),k=norm(d.k||''),sc=0;
      if(k===idq||k.replace('-','')===idq.replace('-',''))sc+=100;
      if(t===term)sc+=60;else if(t.indexOf(term)===0)sc+=40;else if(t.indexOf(term)>-1)sc+=30;
      var all=words.every(function(w){return t.indexOf(w)>-1||x.indexOf(w)>-1||norm(d.s||'').indexOf(w)>-1||k.indexOf(w)>-1});
      if(all)sc+=10+words.filter(function(w){return t.indexOf(w)>-1}).length*3;
      return sc}
    function run(){
      var raw=(q&&q.value||'').trim();var term=norm(raw).replace(/[^a-z0-9֐-׿ ]+/g,' ').trim();
      res.innerHTML='';if(!term)return;
      var idq=term.replace(/\s+/g,'-'),words=term.split(/\s+/),groups={};
      data.forEach(function(d){var sc=score(d,term,words,idq);if(sc>=10)(groups[secOf(d.u)]=groups[secOf(d.u)]||[]).push([sc,d])});
      ['News','Views'].forEach(function(n){live[n].forEach(function(d){var sc=score({t:d.t,x:d.x,k:'',s:d.k},term,words,idq);if(sc>=10)(groups[n]=groups[n]||[]).push([sc,d])})});
      var any=false,jump=[];
      SEC.forEach(function(S){var n=S[0],l=groups[n];if(!l)return;any=true;
        l.sort(function(a,b){return b[0]-a[0]});
        var h=document.createElement('li');h.className='rsec';h.id='r-'+n;h.innerHTML='<h2>'+n+' <small>'+l.length+'</small></h2>';res.appendChild(h);jump.push('<a href="#r-'+n+'">'+n+' ('+l.length+')</a>');
        l.slice(0,n==='News'||n==='Views'?12:30).forEach(function(p){var d=p[1];var li=document.createElement('li');var a=document.createElement('a');a.href=d.u;a.textContent=d.t;
          var sm=document.createElement('small');sm.textContent=d.k+(d.s?' · '+d.s:'');var tx=document.createElement('span');tx.className='rtx';tx.appendChild(a);tx.appendChild(sm);
          if(d.i){var im=document.createElement('img');im.src=d.i;im.alt='';im.loading='lazy';im.referrerPolicy='no-referrer';im.onerror=function(){im.remove()};var al=document.createElement('a');al.className='rth';al.href=d.u;al.tabIndex=-1;al.setAttribute('aria-hidden','true');al.appendChild(im);li.appendChild(al)}
          li.appendChild(tx);res.appendChild(li)})});
      if(any){var j=document.createElement('li');j.className='rjump';j.innerHTML=jump.join(' ');res.insertBefore(j,res.firstChild)}
      else res.innerHTML='<li>Nothing found. Try one word, or an ID such as MAP-002.</li>'
    }
    window.__run=run;
    if(q)q.addEventListener('input',run);run();
  });
})();
;(function(){try{if(!localStorage.getItem('nowkey'))return;var f=document.querySelector('footer');if(!f)return;var a=document.createElement('p');a.className='small';a.innerHTML='<a href="/admin/entry/">Entry workbench</a> · <a href="/admin/video/">Video curation</a>';f.appendChild(a)}catch(e){}})();
