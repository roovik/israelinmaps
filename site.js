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
  fetch('/search.json').then(function(r){return r.json()}).then(function(data){
    function run(){
      var raw=(q&&q.value||'').trim();var term=norm(raw).replace(/[^a-z0-9֐-׿ ]+/g,' ').trim();
      res.innerHTML='';if(!term)return;
      var idq=term.replace(/\s+/g,'-'),words=term.split(/\s+/);var out=[];
      data.forEach(function(d){
        var t=norm(d.t),x=norm(d.x||''),k=d.k.toLowerCase(),sc=0;
        if(k===idq||k.replace('-','')===idq.replace('-',''))sc+=100;
        if(t===term)sc+=60;else if(t.indexOf(term)===0)sc+=40;else if(t.indexOf(term)>-1)sc+=30;
        var all=words.every(function(w){return t.indexOf(w)>-1||x.indexOf(w)>-1||norm(d.s||'').indexOf(w)>-1});
        if(all)sc+=10+words.filter(function(w){return t.indexOf(w)>-1}).length*3;
        if(sc>=10)out.push([sc,d])});
      out.sort(function(a,b){return b[0]-a[0]});
      out.slice(0,60).forEach(function(p){var d=p[1];var li=document.createElement('li');var a=document.createElement('a');a.href=d.u;a.textContent=d.t;
        var s=document.createElement('small');s.textContent=d.k+(d.s?' · '+d.s:'');li.appendChild(a);li.appendChild(s);res.appendChild(li)});
      if(!out.length){res.innerHTML='<li>Nothing found. Try one word, or an ID such as MAP-002.</li>'}
    }
    if(q)q.addEventListener('input',run);run();
  });
})();
