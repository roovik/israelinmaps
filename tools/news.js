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
      var WEEK=7*864e5;
      data.items=data.items.filter(function(i){return!i.d||Date.now()-new Date(i.d)<=WEEK});
      var TOPICS=[
        ['security','Security',/\b(idf|hamas|hezbollah|hizbullah|gaza|missiles?|rockets?|drones?|terror\w*|soldiers?|troops|airstrikes?|strikes?|war|military|army|defen[cs]e|houthis?|iran\w*|hostages?|shin bet|ceasefire|shooting|stabbing|police|attack\w*)\b/i],
        ['diplomacy','Diplomacy',/\b(diplomat\w*|ambassadors?|embass\w+|foreign minister|summit|normali[sz]\w*|abraham accords|united nations|un|security council|sanctions?|treaty|envoys?|talks|negotiat\w*|state department|saudi|egypt\w*|jordan\w*|turkey|turkish|qatar\w*|emirates|uae|european union|eu|icc|icj|recogni[sz]\w*)\b/i],
        ['politics','Politics',/\b(knesset|netanyahu|coalition|opposition|elections?|ministers?|likud|bennett|lapid|gantz|ben.gvir|smotrich|polls?|prime minister|president|supreme court|judicial|lawmakers?|trump|democrats?|republicans?)\b/i],
        ['technology','Technology',/\b(tech\w*|start-?ups?|cyber\w*|ai|artificial intelligence|software|chips?|semiconductors?|innovation|robot\w*|quantum|satellites?|space|nvidia|google|microsoft|apple|meta|openai)\b/i],
        ['business','Business',/\b(econom\w+|shekel|stocks?|tase|markets?|banks?|banking|inflation|interest rates?|bonds?|invest\w*|exports?|ipo|acquisitions?|acquir\w+|revenues?|billions?|tax\w*|budget|trade|real estate|housing|gdp|bank of israel|earnings)\b/i],
        ['culture','Culture',/\b(films?|movies?|festivals?|music\w*|concerts?|art|artists?|museums?|theat\w+|dance|books?|authors?|novels?|poet\w*|exhibit\w*|chefs?|restaurants?|food|cuisine|travel\w*|tourism|sports?|football|soccer|basketball|maccabi|hapoel|olympic\w*|eurovision|netflix|archaeolog\w+|history|heritage|holidays?|torah|synagogues?)\b/i]
      ];
      function topics(items){items.forEach(function(it){var t=it.t+' '+it.x;it.tp=TOPICS.filter(function(x){return x[2].test(t)}).map(function(x){return x[0]})})}
      topics(data.items);
      var fil=document.getElementById('news-filter'),chw=document.getElementById('news-channels'),tpn=document.getElementById('news-topics'),g2=document.getElementById('news-glonly'),
          more=document.getElementById('news-more'),mt=document.getElementById('news-more-title'),wid=document.getElementById('news-widget'),latest=document.getElementById('news-latest'),st=document.getElementById('news-status');
      var state={src:{},brk:false,tp:null,ch:null},cache={},alive=null;
      var good=data.sources.filter(function(s){return s.ok});
      fil.innerHTML='<button data-f="all" aria-pressed="true">All</button><button data-f="breaking" aria-pressed="false" class="brk">Breaking</button>'+good.map(function(s){return'<button data-f="'+s.id+'" aria-pressed="false">'+esc(s.name)+'</button>'}).join('');
      function chosen(){return Object.keys(state.src)}
      function isBrk(i){return i.d&&(Date.now()-new Date(i.d).getTime()<=3*3600*1000||/\b(breaking|live)\b/i.test(i.t))}

      // vertical ticker, one story at a time
      var dated=data.items.filter(function(i){return i.d}).slice(0,12);
      var tk=document.getElementById('news-ticker');
      if(tk&&dated.length){
        tk.innerHTML=dated.map(function(i,n){return'<a class="tki'+(n?'':' on')+'" href="'+esc(i.u)+'" rel="noopener"><span class="tkt">'+(isBrk(i)?'<b>Breaking</b> ':'')+esc(i.t)+'</span><span class="tkm">'+esc(i.src)+' · '+when(i.d)+'</span></a>'}).join('');
        tk.hidden=false;
        var cur=0,paused=false,els=tk.children;
        tk.addEventListener('mouseenter',function(){paused=true});tk.addEventListener('mouseleave',function(){paused=false});
        tk.addEventListener('focusin',function(){paused=true});tk.addEventListener('focusout',function(){paused=false});
        if(els.length>1)setInterval(function(){if(paused||document.hidden)return;var o=els[cur];cur=(cur+1)%els.length;var n=els[cur];o.className='tki out';n.className='tki on';setTimeout(function(){if(o!==els[cur])o.className='tki'},700)},5000);
      }
      latest.innerHTML='<section class="wsrc wlatest"><h3>Latest news</h3><ul>'+dated.map(function(i){return'<li><a href="'+esc(i.u)+'" rel="noopener">'+esc(i.t)+'</a><span class="wm"><a href="'+esc((byId[i.s]||{}).site||'#')+'" rel="noopener">'+esc(i.src)+'</a> · <time>'+when(i.d)+'</time></span></li>'}).join('')+'</ul></section>';
      wid.innerHTML=data.sources.map(function(s){
        var its=data.items.filter(function(i){return i.s===s.id}).slice(0,6);
        if(!s.ok||!its.length)return'';
        return'<section class="wsrc"><h3><a href="'+esc(s.site||'#')+'" rel="noopener">'+esc(s.name)+'</a></h3><ul>'+its.map(function(i){return'<li><a href="'+esc(i.u)+'" rel="noopener">'+esc(i.t)+'</a>'+(i.d?'<time>'+when(i.d)+'</time>':'')+'</li>'}).join('')+'</ul></section>'}).join('');
      var bad=data.sources.filter(function(s){return!s.ok});
      st.textContent='Updated '+new Date(data.updated).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})+'.'+(bad.length?' Unavailable now: '+bad.map(function(s){return s.name}).join(', ')+'.':'');

      // channel matrix: only when one source with channels is chosen, and only channels with stories this week
      function soloChannels(){var c=chosen();return c.length===1&&byId[c[0]]&&byId[c[0]].groups?byId[c[0]]:null}
      function probe(s){
        if(alive&&alive.id===s.id)return;
        var key='nlive-'+s.id,t=0;
        try{var c=JSON.parse(sessionStorage.getItem(key)||'null');if(c&&Date.now()-c.t<6*3600*1000){alive={id:s.id,ok:c.ok};return}}catch(e){}
        alive={id:s.id,ok:null,loading:true};
        Promise.all(s.groups.map(function(g){return fetch('/api/news?s='+encodeURIComponent(s.id)+'&probe='+encodeURIComponent(g.group)).then(function(r){return r.json()}).catch(function(){return{channels:[]}})})).then(function(a){
          var ok={};a.forEach(function(r){(r.channels||[]).forEach(function(c){if(c.ok&&c.count>0)ok[c.id]=c.count})});
          alive={id:s.id,ok:ok};try{sessionStorage.setItem(key,JSON.stringify({t:Date.now(),ok:ok}))}catch(e){}
          showChannels();
        });
      }
      function showChannels(){
        var s=soloChannels();
        if(!s){chw.hidden=true;chw.innerHTML='';return}
        probe(s);
        if(!alive||alive.id!==s.id||alive.loading){chw.hidden=false;chw.innerHTML='<p class="chl">Checking which '+esc(s.name)+' channels have stories this week.</p>';return}
        chw.hidden=false;
        var h=s.groups.map(function(g){var l=g.list.filter(function(c){return alive.ok[c.id]});return l.length?'<div class="chg"><span>'+esc(g.group)+'</span>'+l.map(function(c){return'<button data-c="'+c.id+'" aria-pressed="'+(state.ch===c.id)+'">'+esc(c.name)+'</button>'}).join('')+'</div>':''}).join('');
        chw.innerHTML='<p class="chl">Channels from '+esc(s.name)+' with stories in the last seven days</p>'+h;
      }
      function base(){
        var items=data.items,c=chosen();
        if(c.length)items=items.filter(function(i){return state.src[i.s]});
        if(state.brk)items=items.filter(isBrk);
        return items;
      }
      function drawTopics(items){
        tpn.innerHTML='<button data-t="" aria-pressed="'+(!state.tp)+'">All topics</button>'+TOPICS.map(function(x){var n=items.filter(function(i){return i.tp&&i.tp.indexOf(x[0])>-1}).length;return'<button data-t="'+x[0]+'" aria-pressed="'+(state.tp===x[0])+'"'+(n?'':' disabled')+'>'+x[1]+' <i>'+n+'</i></button>'}).join('');
      }
      function paint(items,note){
        drawTopics(items);
        var list=items.filter(function(i){return(!state.tp||(i.tp&&i.tp.indexOf(state.tp)>-1))&&(!g2.checked||i.g.length)});
        var cards=list.filter(full),rest=list.filter(function(i){return!full(i)});
        if(state.brk){cards=[];rest=list}
        grid.innerHTML=cards.length?cards.map(card).join(''):(rest.length?'':'<p>'+(note||'Nothing matches right now.')+'</p>');
        more.innerHTML=rest.map(row).join('');
        mt.hidden=!rest.length;mt.textContent=state.brk?'Breaking and latest, headlines only':'More headlines';
      }
      function render(){
        showChannels();
        var s=soloChannels();
        if(state.ch&&s){
          var key=s.id+'/'+state.ch;
          grid.innerHTML='<p>Loading.</p>';more.innerHTML='';mt.hidden=true;
          var show=function(d){if(!state.ch||s.id+'/'+state.ch!==key)return;
            if(!d.ok){grid.innerHTML='<p>'+esc(d.channel.name)+' has no recent stories right now.</p>';return}
            tag(d.items);topics(d.items);paint(state.brk?d.items.filter(isBrk):d.items)};
          if(cache[key])return show(cache[key]);
          fetch('/api/news?s='+encodeURIComponent(s.id)+'&c='+encodeURIComponent(state.ch)).then(function(r){return r.json()}).then(function(d){cache[key]=d;show(d)}).catch(function(){grid.innerHTML='<p>That channel could not be loaded right now.</p>'});
          return;
        }
        state.ch=null;
        paint(base(),state.brk?'No breaking stories in the last three hours.':null);
      }
      function sync(){[].forEach.call(fil.children,function(x){var f=x.getAttribute('data-f');x.setAttribute('aria-pressed',f==='all'?(!chosen().length&&!state.brk):f==='breaking'?state.brk:!!state.src[f])})}
      fil.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;var f=b.getAttribute('data-f');
        if(f==='all'){state.src={};state.brk=false}else if(f==='breaking')state.brk=!state.brk;else if(state.src[f])delete state.src[f];else state.src[f]=1;
        state.ch=null;sync();render()});
      tpn.addEventListener('click',function(e){var b=e.target.closest('button');if(!b||b.disabled)return;var t=b.getAttribute('data-t')||null;state.tp=state.tp===t?null:t;render()});
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
