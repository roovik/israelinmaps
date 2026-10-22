(function(){
  var q=document.getElementById('gq'),cats=document.getElementById('gcats');if(!q||!cats)return;
  var cards=[].slice.call(document.querySelectorAll('.gcard')),secs=[].slice.call(document.querySelectorAll('.gsec')),cnt=document.getElementById('gcount'),az=document.getElementById('gaz'),cat='';
  var gf=document.querySelector('.gfilter');if(gf&&az&&gf.contains(az))(document.querySelector('.nowfilter')||gf).insertAdjacentElement('afterend',az);
  function stick(){var h=document.querySelector('header.top'),m=window.matchMedia('(max-width:640px)').matches;document.documentElement.style.setProperty('--stick',m&&h?h.offsetHeight+'px':'0px')}stick();window.addEventListener('resize',stick);window.addEventListener('load',stick);
  function norm(s){return s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g,'').replace(/['’]/g,'')}
  function run(){
    var t=norm(q.value.trim()),shown=0;
    cards.forEach(function(c){var ok=(!cat||c.getAttribute('data-c')===cat)&&(!t||norm(c.getAttribute('data-n')).indexOf(t)>-1);c.hidden=!ok;if(ok)shown++});
    secs.forEach(function(s){var any=s.querySelector('.gcard:not([hidden])');s.hidden=!any;var a=az.querySelector('a[href="#l'+s.getAttribute('data-l')+'"]');if(a)a.style.opacity=any?'':'.3'});
    cnt.textContent=(t||cat)?shown+' of '+cards.length+' entries shown.':''}
  cats.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;cat=b.getAttribute('data-c');[].forEach.call(cats.children,function(x){x.setAttribute('aria-pressed',x===b?'true':'false')});run()});
  function fromHash(){var m=/[#&]c=([a-z-]+)/.exec(location.hash);cat=m?m[1]:'';[].forEach.call(cats.children,function(x){x.setAttribute('aria-pressed',x.getAttribute('data-c')===cat?'true':'false')});run()}
  window.addEventListener('hashchange',fromHash);if(location.hash)fromHash();
  q.addEventListener('input',run);
})();

/* Replace the coloured letter banners with a Wikipedia picture when one exists, otherwise drop the banner */
(function(){
  var K='glimg1',cache={};try{var c=JSON.parse(localStorage.getItem(K)||'null');if(c&&Date.now()-c.t<7*864e5)cache=c.m||{}}catch(e){}
  function save(){try{localStorage.setItem(K,JSON.stringify({t:Date.now(),m:cache}))}catch(e){}}
  function put(card,u){var g=card.querySelector('.gimg');if(!g)return;
    if(!u){card.classList.add('nobanner');return}
    var im=new Image();im.alt='';im.referrerPolicy='no-referrer';im.title='Image: Wikipedia';im.onload=function(){g.innerHTML='';g.appendChild(im)};im.onerror=function(){card.classList.add('nobanner')};im.src=u}
  function run(){
    var cards=[].filter.call(document.querySelectorAll('.gcard'),function(c){var t=c.querySelector('.gimg>.tile');return t&&!t.classList.contains('has')});
    var need=[];cards.forEach(function(c){var b=c.querySelector('.gb b'),n=b&&b.textContent.trim();if(!n)return;if(n in cache)put(c,cache[n]);else need.push([n,c])});
    for(var i=0;i<need.length;i+=40)(function(batch){
      var titles=batch.map(function(x){return x[0].replace(/\s*\(.*\)$/,'')});
      fetch('https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&redirects=1&prop=pageimages|pageprops&ppprop=disambiguation&piprop=thumbnail&pithumbsize=480&titles='+encodeURIComponent(titles.join('|'))).then(function(r){return r.json()}).then(function(d){
        var q=d.query||{},alias={};(q.normalized||[]).forEach(function(x){alias[x.from]=x.to});(q.redirects||[]).forEach(function(x){alias[x.from]=x.to});
        var by={};Object.keys(q.pages||{}).forEach(function(k){var p=q.pages[k];by[p.title]=p});
        batch.forEach(function(x,j){var t=titles[j],hop=0;while(alias[t]&&hop++<4)t=alias[t];var p=by[t],u=p&&p.thumbnail&&!(p.pageprops&&'disambiguation' in p.pageprops)?p.thumbnail.source:'';cache[x[0]]=u;put(x[1],u)});save()
      }).catch(function(){})})(need.slice(i,i+40))}
  setTimeout(run,2500);
})();
