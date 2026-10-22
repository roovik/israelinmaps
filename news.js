(function(){
  var grid=document.getElementById('news-grid'),box=document.getElementById('gl-news');
  var item=document.getElementById('news-item')||document.getElementById('news-side');
  var VQ=((grid&&grid.getAttribute('data-api'))||'').indexOf('views=1')>-1?'&views=1':'';
  var W=VQ?'views':(item&&(item.getAttribute('data-word')==='views'||item.querySelector('[data-word=views]'))?'views':'news');
  if(item&&W==='views')VQ='&views=1';
  if(!grid&&!box&&!item)return;
  if(item&&!grid){grid=document.createElement('div');if(W==='views')grid.setAttribute('data-api','/api/news?views=1&v=2')}
  var STOP={'israel':1,'eli':1,'paul':1,'cana':1,'ariel':1,'zion':1,'saul':1,'jacob':1};
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function ago(iso){if(!iso)return'';var s=(Date.now()-new Date(iso))/1000;if(s<3600)return Math.max(1,Math.round(s/60))+' min ago';if(s<86400)return Math.round(s/3600)+' h ago';if(s<604800)return Math.round(s/86400)+' days ago';return new Date(iso).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}
  function when(iso){return iso?new Date(iso).toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}):''}
  function iu(it){if(!it.k)return it.u;return'/news/item/'+it.k+'/?s='+encodeURIComponent(it.s)+(it.ch?'&c='+encodeURIComponent(it.ch):'')}
  function full(it){return it.i&&it.x}
  var terms=[],res=[];
  function tag(items){items.forEach(function(it){var txt=it.t+' '+it.x,seen={},m=[];
    terms.forEach(function(t,i){if(m.length<3&&!seen[t[1]]&&res[i].test(txt)){seen[t[1]]=1;m.push([t[1],t[2]])}});it.g=m})}
  function chips(it,lab){return it.g.length?'<p class="chips">'+(lab?'In the glossary: ':'')+it.g.map(function(g){return'<a href="/g/'+g[0]+'/">'+esc(g[1])+'</a>'}).join(' ')+'</p>':''}
  function meta(it){return'<p class="nmeta"><b>'+esc(it.src)+(it.kind?' \u00b7 '+esc(it.kind):'')+'</b>'+(it.d?'<span>'+ago(it.d)+'</span>':'')+'</p>'}
  function card(it){
    var img='<img src="'+esc(it.i)+'" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.parentNode.classList.add(\'noimg\');this.remove()">';
    return'<article class="ncard"><a class="nimg" href="'+esc(iu(it))+'" rel="noopener" tabindex="-1" aria-hidden="true">'+img+'</a><div class="nb"><h3><a href="'+esc(iu(it))+'">'+esc(it.t)+'</a></h3>'+meta(it)+'</div></article>'}
  function hitem(it){return'<div class="hi"><h3><a href="'+esc(iu(it))+'">'+esc(it.t)+'</a></h3>'+meta(it)+'</div>'}
  function hcards(list){var o=[];for(var i=0;i<list.length;i+=3)o.push('<article class="ncard hcard"><div class="nb">'+list.slice(i,i+3).map(hitem).join('')+'</div></article>');return o.join('')}
  function holes(el){
    [].forEach.call(el.querySelectorAll('.hole'),function(h){h.remove()});
    var cells=el.children.length;if(!cells||el.firstElementChild.tagName==='P')return;
    var cols=getComputedStyle(el).gridTemplateColumns.split(' ').length,rem=cells%cols;
    if(cols<2||!rem)return;
    for(var k=0;k<cols-rem;k++){var d=document.createElement('div');d.className='adslot hole';d.setAttribute('data-slot','cell');d.setAttribute('data-sizes','cell');el.appendChild(d)}
    if(window.IMAds)IMAds.fill(el);
  }
  var holeEls=[];window.addEventListener('resize',function(){holeEls.forEach(function(e){if(document.body.contains(e))holes(e)})});
  function row(it){return'<li><span class="nmeta"><b>'+esc(it.src)+'</b>'+(it.d?' · '+ago(it.d):'')+'</span> <a href="'+esc(iu(it))+'">'+esc(it.t)+'</a>'+chips(it,false)+'</li>'}

  Promise.all([fetch((grid&&grid.getAttribute('data-api'))||'/api/news?v=2').then(function(r){if(!r.ok)throw 0;return r.json()}),fetch('/glossary.json').then(function(r){return r.json()})]).then(function(a){
    var data=a[0],gl=a[1];
    gl.forEach(function(g){g[2].forEach(function(t){if(t.length>3&&!STOP[t.toLowerCase()])terms.push([t,g[1],g[0]])})});
    terms.sort(function(x,y){return y[0].length-x[0].length});
    res=terms.map(function(t){return new RegExp('(^|[^A-Za-z])'+t[0].replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?![A-Za-z])')});
    tag(data.items);
    var byId={};data.sources.forEach(function(s){byId[s.id]=s});

    if(grid){
      var WEEK=30*864e5;
      data.items=data.items.filter(function(i){return!i.d||Date.now()-new Date(i.d)<=WEEK});
      var TOPICS=[
        ['security','Security',/\b(idf|hamas|hezbollah|hizbullah|gaza|missiles?|rockets?|drones?|terror\w*|soldiers?|troops|airstrikes?|strikes?|war|military|army|defen[cs]e|houthis?|iran\w*|hostages?|shin bet|ceasefire|shooting|stabbing|police|attack\w*)\b/i],
        ['diplomacy','Diplomacy',/\b(diplomat\w*|ambassadors?|embass\w+|foreign minister|summit|normali[sz]\w*|abraham accords|united nations|un|security council|sanctions?|treaty|envoys?|talks|negotiat\w*|state department|saudi|egypt\w*|jordan\w*|turkey|turkish|qatar\w*|emirates|uae|european union|eu|icc|icj|recogni[sz]\w*)\b/i],
        ['politics','Politics',/\b(knesset|netanyahu|coalition|opposition|elections?|ministers?|likud|bennett|lapid|gantz|ben.gvir|smotrich|polls?|prime minister|president|supreme court|judicial|lawmakers?|trump|democrats?|republicans?)\b/i],
        ['technology','Tech',/\b(tech\w*|start-?ups?|cyber\w*|ai|artificial intelligence|software|chips?|semiconductors?|innovation|robot\w*|quantum|satellites?|space|nvidia|google|microsoft|apple|meta|openai)\b/i],
        ['business','Business',/\b(econom\w+|shekel|stocks?|tase|markets?|banks?|banking|inflation|interest rates?|bonds?|invest\w*|exports?|ipo|acquisitions?|acquir\w+|revenues?|billions?|tax\w*|budget|trade|real estate|housing|gdp|bank of israel|earnings)\b/i],
        ['culture','Culture',/\b(films?|movies?|festivals?|music\w*|concerts?|art|artists?|museums?|theat\w+|dance|books?|authors?|novels?|poet\w*|exhibit\w*|chefs?|restaurants?|food|cuisine|travel\w*|tourism|sports?|football|soccer|basketball|maccabi|hapoel|olympic\w*|eurovision|netflix|archaeolog\w+|history|heritage|holidays?|torah|synagogues?)\b/i]
      ];
      function topics(items){items.forEach(function(it){var t=it.t+' '+it.x;it.tp=TOPICS.filter(function(x){return x[2].test(t)}).map(function(x){return x[0]})})}
      topics(data.items);
      var tpn=document.getElementById('news-topics')||document.createElement('div'),g2=document.getElementById('news-glonly')||document.createElement('input'),
          more=document.getElementById('news-more'),mt=document.getElementById('news-more-title'),wid=document.getElementById('news-widget'),latest=document.getElementById('news-latest'),st=document.getElementById('news-status');
      if(item){g2=document.createElement('input');more=document.createElement('ul');mt=document.createElement('h2')}
      var state={mode:'sources',src:null,sub:null,tp:null,ch:null,q:null,kind:null},cache={},alive={};
      var good=data.sources.filter(function(s){return s.ok});
      function isBrk(i){return i.d&&(Date.now()-new Date(i.d).getTime()<=3*3600*1000||/\b(breaking|live)\b/i.test(i.t))}
      var dated=data.items.filter(function(i){return i.d}).slice(0,12);
      latest.innerHTML='<section class="wsrc wlatest"><h3>Latest '+W+'</h3><ul>'+dated.slice(0,5).map(function(i){return'<li><a href="'+esc(iu(i))+'">'+esc(i.t)+'</a><span class="wm"><a href="/sources/'+esc(i.s)+'/?show='+W+'">'+esc(i.src)+'</a> · <time>'+when(i.d)+'</time></span></li>'}).join('')+'</ul></section>';
      wid.innerHTML=data.sources.map(function(s){
        var its=data.items.filter(function(i){return i.s===s.id}).slice(0,6);
        if(!s.ok||!its.length)return'';
        return'<section class="wsrc"><h3><a href="/sources/'+esc(s.id)+'/?show='+W+'">'+esc(s.name)+'</a></h3><ul>'+its.map(function(i){return'<li><a href="'+esc(iu(i))+'">'+esc(i.t)+'</a>'+(i.d?'<time>'+when(i.d)+'</time>':'')+'</li>'}).join('')+'</ul></section>'}).filter(Boolean).join('<div class="adslot" data-slot="right"></div>');if(window.IMAds)IMAds.fill(wid);
      var bad=data.sources.filter(function(s){return!s.ok});
      st.textContent='Updated '+new Date(data.updated).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})+'.'+(bad.length?' Unavailable now: '+bad.map(function(s){return s.name}).join(', ')+'.':'');

      // left navigation: Topics (keyword, all sources) then one open/close section per source
      function probe(s){
        if(alive[s.id])return;
        var key='nlive2-'+s.id+VQ;
        try{var c=JSON.parse(sessionStorage.getItem(key)||'null');if(c&&Date.now()-c.t<6*3600*1000){alive[s.id]={ok:c.ok};return}}catch(e){}
        alive[s.id]={loading:true};
        Promise.all(s.groups.map(function(g){return fetch('/api/news?s='+encodeURIComponent(s.id)+'&probe='+encodeURIComponent(g.group)+VQ).then(function(r){return r.json()}).catch(function(){return{channels:[]}})})).then(function(a){
          var ok={};a.forEach(function(r){(r.channels||[]).forEach(function(c){if(c.ok&&c.count>0)ok[c.id]=c.count})});
          alive[s.id]={ok:ok};try{sessionStorage.setItem(key,JSON.stringify({t:Date.now(),ok:ok}))}catch(e){}
          drawNav();
        });
      }
      function liveGroups(s){var a=alive[s.id];if(!s.groups||!a||a.loading)return null;
        return s.groups.map(function(g){return{group:g.group,list:g.list.filter(function(c){return a.ok[c.id]})}}).filter(function(g){return g.list.length})}
      function srcItems(id){return data.items.filter(function(i){return i.s===id})}
      function topicBtns(items,cur,attr){return TOPICS.map(function(x){var n=items.filter(function(i){return i.tp&&i.tp.indexOf(x[0])>-1}).length;return n?'<button '+attr+'="'+x[0]+'" aria-pressed="'+(cur===x[0])+'">'+x[1]+' <i>'+n+'</i></button>':''}).join('')}
      var AB={toi:'ToI',jpost:'JPost',ynet:'ynet',israelhayom:'Hayom',inn:'INN'};function ab(x){return AB[x.id]||x.name}
      var MQ={get matches(){return!item}};
      var DOM={toi:'timesofisrael.com',jpost:'jpost.com',ynet:'ynetnews.com',haaretz:'haaretz.com',jns:'jns.org',israelhayom:'israelhayom.com',jta:'jta.org',inn:'israelnationalnews.com'},FAV={};
      function ini(x){var w=x.name.replace(/^The /,'').split(/\s+/);return(w.length>1?w.map(function(y){return y[0]}).join(''):x.name.slice(0,2)).toUpperCase().slice(0,3)}
      function favs(){[].forEach.call(tpn.querySelectorAll('.apic[data-d]'),function(pic){var d=pic.getAttribute('data-d');if(FAV[d]===false)return;
        var put=function(src){var im=new Image();im.alt='';im.src=src;pic.textContent='';pic.appendChild(im)};
        if(FAV[d]){put(FAV[d]);return}
        var im=new Image();im.referrerPolicy='no-referrer';im.onload=function(){if(im.naturalWidth>16){FAV[d]=im.src;put(im.src)}else FAV[d]=false};im.onerror=function(){FAV[d]=false};im.src='https://www.google.com/s2/favicons?sz=128&domain='+d})}
      function drawNav(){
        var s0=state.src?byId[state.src]:null,h='';
        h+='<form class="ffilter" id="ff" role="search"><label for="ff-t">Filter:</label><select id="ff-t" aria-label="Topic"><option value="">All topics</option>'+TOPICS.map(function(x){return'<option value="'+x[0]+'"'+(state.tp===x[0]?' selected':'')+'>'+x[1]+'</option>'}).join('')+'</select><input id="ff-q" type="search" placeholder="Keyword" aria-label="Keyword" value="'+esc(state.q||'')+'"><button type="submit">Filter</button></form><label class="srt">Sort<select id="ff-s" aria-label="Sort">'+IMSort.opts([['','Default'],['new','Newest first'],['old','Oldest first'],['src','Source A to Z'],['az','Title A to Z'],['rand','Random']]).replace('value="'+(state.sort||'')+'"','value="'+(state.sort||'')+'" selected')+'</select></label>';
        h+='<div class="apick fsrc" role="group" aria-label="Sources"><a href="#" data-ms="" aria-current="'+(!state.src)+'"><span class="apic all"><span class="ini">All</span></span><span class="apn">All</span></a>'+good.map(function(x,i){return'<a href="#" data-ms="'+x.id+'" aria-current="'+(state.src===x.id)+'"><span class="apic org c'+(i%6)+'"'+(DOM[x.id]?' data-d="'+DOM[x.id]+'"':'')+'><span class="ini">'+esc(ini(x))+'</span></span><span class="apn">'+esc(x.name)+'</span></a>'}).join('')+'</div>';
        var lg=null;if(s0&&s0.groups){probe(s0);lg=liveGroups(s0)}
        var scope=s0?srcItems(s0.id):data.items;
        h+='<div class="ftop" role="group" aria-label="Topics"><button data-a="1" aria-pressed="'+(!state.tp&&!state.ch)+'">All topics</button>'+topicBtns(scope,state.tp,'data-k')+(lg&&lg.length?lg.map(function(g){return g.list.map(function(c){return'<button data-s="'+s0.id+'" data-c="'+c.id+'" aria-pressed="'+(state.ch===s0.id+'/'+c.id)+'">'+esc(c.name)+'</button>'}).join('')}).join(''):'')+'</div>';
        tpn.className=(tpn.className||'').replace(/\bmobnav\b/g,'').trim();tpn.classList.add('fnav');
        tpn.innerHTML=h;favs();
      }
      (function(){var np=document.querySelector('.newspage'),lc=tpn.closest&&tpn.closest('.newsleftcol');if(!np||!lc||!grid||!grid.parentNode||item)return;
        np.classList.add('noleft');lc.hidden=true;grid.parentNode.insertBefore(tpn,grid)})();
      var FOUR={haaretz:1,insider:1},g4el=null,g4h=null;
      function paint(items,note){
        var list=items.filter(function(i){return!g2.checked||i.g.length});
        var cards=list.filter(full).slice(0,60),rest=list.filter(function(i){return!full(i)}).slice(0,80);
        var c4=cards.filter(function(i){return FOUR[i.s]}),c3=cards.filter(function(i){return!FOUR[i.s]});
        if(!g4el){g4el=document.createElement('div');g4h=document.createElement('h2');g4h.className='nmt';grid.parentNode.insertBefore(g4h,grid.nextSibling);grid.parentNode.insertBefore(g4el,g4h.nextSibling)}
        if(!c3.length&&c4.length){c3=c4;c4=[];grid.className='ngrid4'}else grid.className='ngrid3';
        g4el.className='ngrid4';g4el.innerHTML=c4.map(card).join('');g4h.hidden=g4el.hidden=!c4.length;
        g4h.textContent=c4.length?c4.reduce(function(a,i){if(a.indexOf(i.src)<0)a.push(i.src);return a},[]).join(' and '):'';
        cards=c3;
        grid.innerHTML=cards.length?cards.map(card).join(''):((rest.length||c4.length)?'':'<p>'+(note||'Nothing matches right now.')+'</p>');
        more.innerHTML=hcards(rest);
        mt.hidden=!rest.length;mt.textContent='More headlines';
        if(holeEls.indexOf(g4el)<0)holeEls.push(g4el);holes(g4el);if(holeEls.indexOf(grid)<0)holeEls.push(grid);if(holeEls.indexOf(more)<0)holeEls.push(more);
        holes(grid);holes(more);
      }
      function go(){var q=new URLSearchParams();['mode','src','sub','tp','ch','q','kind','sort'].forEach(function(k){if(state[k])q.set(k,state[k])});location.href=(W==='views'?'/views/#':'/news/#')+q.toString()}
      function applyHash(){try{var q=new URLSearchParams(location.hash.slice(1));['mode','src','sub','tp','ch','q','kind','sort'].forEach(function(k){if(q.get(k))state[k]=q.get(k)});if(state.sub&&!state.tp)state.tp=state.sub;state.sub=null}catch(e){}}
      function flt(items){
        if(state.tp)items=items.filter(function(i){return i.tp&&i.tp.indexOf(state.tp)>-1});
        if(state.q){var qq=state.q.toLowerCase();items=items.filter(function(i){return((i.t||'')+' '+(i.x||'')).toLowerCase().indexOf(qq)>-1})}
        if(state.kind){var kk=state.kind.toLowerCase();items=items.filter(function(i){return(i.kind||'').toLowerCase()===kk})}
        if(state.sort&&window.IMSort)items=IMSort.apply(items,state.sort,{date:function(i){return i.d},title:function(i){return i.t},src:function(i){return i.src}});
        return items}
      var fnote=null;
      function render(){
        drawNav();
        if(!fnote){fnote=document.createElement('p');fnote.className='nfilt small';grid.parentNode.insertBefore(fnote,grid)}
        var lab=state.kind||'';
        fnote.hidden=!lab;fnote.innerHTML=lab?'Showing: <b>'+esc(lab)+'</b> <a href="'+(W==='views'?'/views/':'/news/')+'" data-clr="1">Clear</a>':'';
        if(!item){
          var parts=[],tl=function(k){var t=TOPICS.filter(function(x){return x[0]===k})[0];return t?t[1]:''};
          if(state.ch){var sid0=state.ch.split('/')[0],cid0=state.ch.split('/')[1],sc=byId[sid0];parts.push(sc?sc.name:'');
            if(sc&&sc.groups)sc.groups.forEach(function(g){g.list.forEach(function(c){if(c.id===cid0)parts.push(c.name)})})}
          else if(state.src)parts.push((byId[state.src]||{}).name||'');
          if(state.tp)parts.push(tl(state.tp));if(state.q)parts.push('"'+state.q+'"');if(state.kind)parts.push(state.kind);
          var hd=parts.filter(Boolean).join(' ')+(parts.filter(Boolean).length?' ':'')+(W==='views'?'Views':'News'),h1=document.querySelector('.newsleft h1');
          if(h1)h1.textContent=hd;document.title=hd+' | Israel NOWlej';
        }
        if(item){go();return}
        if(state.ch){
          var sid=state.ch.split('/')[0],cid=state.ch.split('/')[1],key=state.ch;
          grid.innerHTML='<p>Loading.</p>';more.innerHTML='';mt.hidden=true;
          var show=function(d){if(state.ch!==key)return;
            if(!d.ok){grid.innerHTML='<p>'+esc(d.channel.name)+' has no recent stories right now.</p>';return}
            d.items.forEach(function(i){i.ch=cid});tag(d.items);topics(d.items);paint(flt(d.items))};
          if(cache[key])return show(cache[key]);
          fetch('/api/news?s='+encodeURIComponent(sid)+'&c='+encodeURIComponent(cid)).then(function(r){return r.json()}).then(function(d){cache[key]=d;show(d)}).catch(function(){grid.innerHTML='<p>That channel could not be loaded right now.</p>'});
          return;
        }
        var items=data.items;if(state.src)items=items.filter(function(i){return i.s===state.src});items=flt(items);
        paint(items);
      }
      tpn.addEventListener('click',function(e){var b=e.target.closest('a,button');if(!b||!tpn.contains(b))return;
        if(b.tagName==='A')e.preventDefault();
        if(b.hasAttribute('data-ms')){var ms=b.getAttribute('data-ms')||null;state.src=ms;state.ch=null;render();return}
        if(b.hasAttribute('data-a')){state.tp=null;state.ch=null;render();return}
        if(b.hasAttribute('data-c')){var k=b.getAttribute('data-s')+'/'+b.getAttribute('data-c');state.ch=state.ch===k?null:k;render();return}
        if(b.hasAttribute('data-k')){var k2=b.getAttribute('data-k');state.tp=state.tp===k2?null:k2;state.ch=null;render()}
      });
      tpn.addEventListener('change',function(e){if(e.target.id==='ff-t'){state.tp=e.target.value||null;state.ch=null;render()}else if(e.target.id==='ff-s'){state.sort=e.target.value||null;render()}});
      tpn.addEventListener('submit',function(e){e.preventDefault();var v=(document.getElementById('ff-q').value||'').trim();state.q=v||null;render()});
      var qT=null;tpn.addEventListener('input',function(e){if(e.target.id!=='ff-q')return;clearTimeout(qT);var v=e.target.value;qT=setTimeout(function(){state.q=v.trim()||null;var ae=document.activeElement,pos=ae&&ae.selectionStart;render();var i=document.getElementById('ff-q');if(i){i.focus();try{i.setSelectionRange(pos,pos)}catch(x){}}},350)});
      g2.addEventListener('change',render);
      
      if(item)drawNav();else{applyHash();render();
        window.addEventListener('hashchange',function(){state={mode:'sources',src:null,sub:null,tp:null,ch:null,q:null,kind:null};applyHash();render()});
        document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[data-clr]');if(a){e.preventDefault();history.pushState(null,'',location.pathname);state={mode:'sources',src:null,sub:null,tp:null,ch:null,q:null,kind:null};render()}})}
    }
    if(box){
      var slug=box.getAttribute('data-slug');
      var l=data.items.filter(function(i){return i.g.some(function(g){return g[0]===slug})}).slice(0,6);
      if(l.length){box.querySelector('.ngrid').innerHTML=l.filter(full).slice(0,3).map(card).join('');var hh=l.filter(function(i){return!full(i)});if(hh.length)box.querySelector('.hlist').innerHTML=hh.map(row).join('');box.hidden=false}
    }
  }).catch(function(){var st=document.getElementById('news-status');if(st)st.textContent='The news feed could not be loaded right now. Please try again later.';if(grid)grid.innerHTML=''});
})();
