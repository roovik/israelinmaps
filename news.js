(function(){
  var grid=document.getElementById('news-grid'),box=document.getElementById('gl-news');
  if(!grid&&!box)return;
  var STOP={'israel':1,'eli':1,'paul':1,'cana':1,'ariel':1,'zion':1,'saul':1,'jacob':1};
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function ago(iso){if(!iso)return'';var s=(Date.now()-new Date(iso))/1000;if(s<3600)return Math.max(1,Math.round(s/60))+' min ago';if(s<86400)return Math.round(s/3600)+' h ago';if(s<604800)return Math.round(s/86400)+' days ago';return new Date(iso).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}
  function when(iso){return iso?new Date(iso).toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}):''}
  function full(it){return it.i&&it.x}
  var terms=[],res=[];
  function tag(items){items.forEach(function(it){var txt=it.t+' '+it.x,seen={},m=[];
    terms.forEach(function(t,i){if(m.length<3&&!seen[t[1]]&&res[i].test(txt)){seen[t[1]]=1;m.push([t[1],t[2]])}});it.g=m})}
  function chips(it,lab){return it.g.length?'<p class="chips">'+(lab?'In the glossary: ':'')+it.g.map(function(g){return'<a href="/g/'+g[0]+'/">'+esc(g[1])+'</a>'}).join(' ')+'</p>':''}
  function card(it){
    var img='<img src="'+esc(it.i)+'" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.parentNode.classList.add(\'noimg\');this.remove()">';
    return'<article class="ncard"><a class="nimg" href="'+esc(it.u)+'" rel="noopener" tabindex="-1" aria-hidden="true">'+img+'</a><div class="nb"><p class="nmeta"><b>'+esc(it.src)+'</b>'+(it.d?' · '+ago(it.d):'')+'</p><h3><a href="'+esc(it.u)+'" rel="noopener">'+esc(it.t)+'</a></h3><p>'+esc(it.x)+'</p>'+chips(it,true)+'</div></article>'}
  function row(it){return'<li><span class="nmeta"><b>'+esc(it.src)+'</b>'+(it.d?' · '+ago(it.d):'')+'</span> <a href="'+esc(it.u)+'" rel="noopener">'+esc(it.t)+'</a>'+chips(it,false)+'</li>'}

  Promise.all([fetch('/api/news').then(function(r){if(!r.ok)throw 0;return r.json()}),fetch('/glossary.json').then(function(r){return r.json()})]).then(function(a){
    var data=a[0],gl=a[1];
    gl.forEach(function(g){g[2].forEach(function(t){if(t.length>3&&!STOP[t.toLowerCase()])terms.push([t,g[1],g[0]])})});
    terms.sort(function(x,y){return y[0].length-x[0].length});
    res=terms.map(function(t){return new RegExp('(^|[^A-Za-z])'+t[0].replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?![A-Za-z])')});
    tag(data.items);
    var byId={};data.sources.forEach(function(s){byId[s.id]=s});

    if(grid){
      var fil=document.getElementById('news-filter'),chw=document.getElementById('news-channels'),g2=document.getElementById('news-glonly'),
          more=document.getElementById('news-more'),mt=document.getElementById('news-more-title'),wid=document.getElementById('news-widget'),latest=document.getElementById('news-latest'),st=document.getElementById('news-status');
      var state={f:'all',ch:null},cache={};
      var good=data.sources.filter(function(s){return s.ok});
      fil.innerHTML='<button data-f="all" aria-pressed="true">All</button><button data-f="breaking" aria-pressed="false" class="brk">Breaking</button>'+good.map(function(s){return'<button data-f="'+s.id+'" aria-pressed="false">'+esc(s.name)+'</button>'}).join('');

      // widget: latest across sources, then per source
      var dated=data.items.filter(function(i){return i.d}).slice(0,12);
      var tk=document.getElementById('news-ticker');
      if(tk&&dated.length){var cut3=Date.now()-3*3600*1000;var tl=dated.slice(0,14).map(function(i){var b=new Date(i.d).getTime()>=cut3||/\b(breaking|live)\b/i.test(i.t);return'<a href="'+esc(i.u)+'" rel="noopener">'+(b?'<b>Breaking</b> ':'')+esc(i.t)+' <span>'+esc(i.src)+' · '+when(i.d)+'</span></a>'}).join('');tk.innerHTML='<div class="tkin"><div class="tktrack">'+tl+tl+'</div></div>';tk.hidden=false}
      latest.innerHTML='<section class="wsrc wlatest"><h3>Latest news</h3><ul>'+dated.map(function(i){return'<li><a href="'+esc(i.u)+'" rel="noopener">'+esc(i.t)+'</a><span class="wm"><a href="'+esc((byId[i.s]||{}).site||'#')+'" rel="noopener">'+esc(i.src)+'</a> · <time>'+when(i.d)+'</time></span></li>'}).join('')+'</ul></section>';
      wid.innerHTML=data.sources.map(function(s){
        var its=data.items.filter(function(i){return i.s===s.id}).slice(0,6);
        if(!s.ok||!its.length)return'';
        return'<section class="wsrc"><h3><a href="'+esc(s.site||'#')+'" rel="noopener">'+esc(s.name)+'</a></h3><ul>'+its.map(function(i){return'<li><a href="'+esc(i.u)+'" rel="noopener">'+esc(i.t)+'</a>'+(i.d?'<time>'+when(i.d)+'</time>':'')+'</li>'}).join('')+'</ul></section>'}).join('');
      var bad=data.sources.filter(function(s){return!s.ok});
      st.textContent='Updated '+new Date(data.updated).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})+'.'+(bad.length?' Unavailable now: '+bad.map(function(s){return s.name}).join(', ')+'.':'');

      function showChannels(){
        var s=byId[state.f];
        if(!s||!s.groups){chw.hidden=true;chw.innerHTML='';return}
        chw.hidden=false;
        chw.innerHTML='<p class="chl">Topics from '+esc(s.name)+'</p>'+s.groups.map(function(g){return'<div class="chg"><span>'+esc(g.group)+'</span>'+g.list.map(function(c){return'<button data-c="'+c.id+'" aria-pressed="'+(state.ch===c.id)+'">'+esc(c.name)+'</button>'}).join('')+'</div>'}).join('');
      }
      function paint(items,note){
        var list=items.filter(function(i){return!g2.checked||i.g.length});
        var cards=list.filter(full),rest=list.filter(function(i){return!full(i)});
        if(state.f==='breaking'){cards=[];rest=list}
        grid.innerHTML=cards.length?cards.map(card).join(''):(rest.length?'':'<p>'+(note||'Nothing matches right now.')+'</p>');
        more.innerHTML=rest.map(row).join('');
        mt.hidden=!rest.length;mt.textContent=state.f==='breaking'?'Breaking and latest, headlines only':'More headlines';
      }
      function render(){
        showChannels();
        if(state.ch){
          var key=state.f+'/'+state.ch;
          grid.innerHTML='<p>Loading '+esc(byId[state.f].name)+'.</p>';more.innerHTML='';mt.hidden=true;
          var show=function(d){if(state.f+'/'+state.ch!==key)return;
            if(!d.ok){grid.innerHTML='<p>'+esc(d.channel.name)+' has no recent stories right now ('+esc(d.error||'empty')+').</p>';return}
            tag(d.items);paint(d.items)};
          if(cache[key])return show(cache[key]);
          fetch('/api/news?s='+encodeURIComponent(state.f)+'&c='+encodeURIComponent(state.ch)).then(function(r){return r.json()}).then(function(d){cache[key]=d;show(d)}).catch(function(){grid.innerHTML='<p>That channel could not be loaded right now.</p>'});
          return;
        }
        var items=data.items;
        if(state.f==='breaking'){var cut=Date.now()-3*3600*1000;items=items.filter(function(i){return i.d&&(new Date(i.d).getTime()>=cut||/\b(breaking|live)\b/i.test(i.t))})}
        else if(state.f!=='all')items=items.filter(function(i){return i.s===state.f});
        paint(items,state.f==='breaking'?'No breaking stories in the last three hours.':null);
      }
      fil.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;state.f=b.getAttribute('data-f');state.ch=null;[].forEach.call(fil.children,function(x){x.setAttribute('aria-pressed',x===b)});render()});
      chw.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;var c=b.getAttribute('data-c');state.ch=state.ch===c?null:c;render()});
      g2.addEventListener('change',render);
      render();
    }
    if(box){
      var slug=box.getAttribute('data-slug');
      var l=data.items.filter(function(i){return i.g.some(function(g){return g[0]===slug})}).slice(0,6);
      if(l.length){box.querySelector('.ngrid').innerHTML=l.filter(full).slice(0,3).map(card).join('');var hh=l.filter(function(i){return!full(i)});if(hh.length)box.querySelector('.hlist').innerHTML=hh.map(row).join('');box.hidden=false}
    }
  }).catch(function(){var st=document.getElementById('news-status');if(st)st.textContent='The news feed could not be loaded right now. Please try again later.';if(grid)grid.innerHTML=''});
})();
