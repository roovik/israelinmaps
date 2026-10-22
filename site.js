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
  var live={News:[],Views:[],Videos:[],Playlists:[],Audio:[]};
  function getLive(name,url){fetch(url).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(d){
    live[name]=(d.items||[]).filter(function(i){return!i.d||Date.now()-new Date(i.d)<=30*864e5}).map(function(i){
      return{t:i.t,u:i.k?'/news/item/'+i.k+'/?s='+encodeURIComponent(i.s)+(i.ch?'&c='+encodeURIComponent(i.ch):''):i.u,i:i.i||'',k:i.src,s:i.d?new Date(i.d).toLocaleDateString('en-GB',{day:'numeric',month:'short'}):'',x:i.x||''}});
    if(window.__run)window.__run()}).catch(function(){})}
  getLive('News','/api/news?v=2');getLive('Views','/api/news?views=1&v=2');
  fetch('/api/videos').then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(d){var o=[];(d.channels||[]).forEach(function(c){(c.videos||[]).forEach(function(v){o.push({t:v.t,u:'/video/watch/?v='+encodeURIComponent(v.v)+(c.key?'&c='+encodeURIComponent(String(c.key).toLowerCase()):''),k:c.name||'',s:v.d?new Date(v.d).toLocaleDateString('en-GB',{day:'numeric',month:'short'}):'',x:''})})});live.Videos=o;if(window.__run)window.__run()}).catch(function(){});
  fetch('/api/videos?lists=1').then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(d){live.Playlists=(d.playlists||[]).map(function(p){return{t:p.name,u:'/video/pl-'+String(p.id).toLowerCase()+'/',k:'Playlist',s:(d.chnames||{})[p.channel]||'',x:''}});if(window.__run)window.__run()}).catch(function(){});
  fetch('/voices.json').then(function(r){return r.json()}).then(function(d){live.Audio=(d.shows||[]).map(function(p){return{t:p.name,u:'/audio/#s-'+p.id,k:'Podcast',s:p.by||'',x:p.by||''}});if(window.__run)window.__run()}).catch(function(){});
  var PUBS=[['The Times of Israel','/sources/toi/','Publication'],['The Jerusalem Post','/sources/jpost/','Publication'],['Ynetnews','/sources/ynet/','Publication'],['Haaretz','/sources/haaretz/','Publication'],['JNS','/sources/jns/','Publication'],['Israel Hayom','/sources/israelhayom/','Publication'],['JTA','/sources/jta/','Publication'],['Israel National News','/sources/inn/','Publication']].map(function(p){return{t:p[0],u:p[1],k:p[2],s:'',x:''}});
  var SEC=[['News'],['Views'],['Videos'],['Playlists'],['Audio'],['NOWlej'],['Sources']];
  function secOf(u){var f=u.split('/')[1];if(f==='who'||f==='sources')return'Sources';return'NOWlej'}
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
      PUBS.forEach(function(d){var sc=score(d,term,words,idq);if(sc>=10)(groups.Sources=groups.Sources||[]).push([sc,d])});
      ['News','Views','Videos','Playlists','Audio'].forEach(function(n){live[n].forEach(function(d){var sc=score({t:d.t,x:d.x,k:'',s:d.k},term,words,idq);if(sc>=10)(groups[n]=groups[n]||[]).push([sc,d])})});
      var any=false,jump=[];
      SEC.forEach(function(S){var n=S[0],l=groups[n];if(!l){jump.push('<span class="rz">'+n+' (0)</span>');return}any=true;
        l.sort(function(a,b){return b[0]-a[0]});
        var h=document.createElement('li');h.className='rsec';h.id='r-'+n;h.innerHTML='<h2>'+n+' <small>'+l.length+'</small></h2>';res.appendChild(h);jump.push('<a href="#r-'+n+'">'+n+' ('+l.length+')</a>');
        l.slice(0,n==='NOWlej'||n==='Sources'?30:12).forEach(function(p){var d=p[1];var li=document.createElement('li');if(n==='Sources'&&d.u.indexOf('/who/')===0){li.className='rwho';var ini=d.t.replace(/^The /,'').split(/\s+/).slice(0,2).map(function(w){return w[0]}).join('').toUpperCase(),hu=0;for(var z=0;z<d.u.length;z++)hu+=d.u.charCodeAt(z);li.innerHTML='<a class="rwph t'+(1+hu%5)+'" href="'+d.u+'" tabindex="-1" aria-hidden="true"><span>'+ini+'</span></a><span class="rtx"><a href="'+d.u+'">'+d.t.replace(/&/g,'&amp;')+'</a><small>'+(d.s||'')+'</small><em></em></span>';li.querySelector('em').textContent=(d.x||'').split('. ')[0].replace(/\.$/,'')+'.';res.appendChild(li);return}var a=document.createElement('a');a.href=d.u;a.textContent=d.t;
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
(function(){function m(){var n=document.querySelectorAll('header.top nav.wrap a');if(n.length<2)return;var a=n[0].getBoundingClientRect(),z=n[n.length-1].getBoundingClientRect();if(z.right>a.left)document.documentElement.style.setProperty('--navw',Math.round(z.right-a.left)+'px')}
 m();window.addEventListener('load',m);window.addEventListener('resize',m)})();
;(function(){var q=document.querySelector('.bar .sf input');if(q&&window.matchMedia('(max-width:900px)').matches)q.placeholder='keyword(s)'})();

;(function(){if(!/^\/video\//.test(location.pathname))return;var ds=document.querySelectorAll('.secnav details summary'),s=null;[].forEach.call(ds,function(x){if(x.textContent.trim()==='Channels')s=x});if(!s)return;
var D={israeldefenseforces:'idf.il',israelmfa:'mfa.gov.il',standwithus:'standwithus.com',honestreportingvideo:'honestreporting.com',i24news_en:'i24news.tv',aipac:'aipac.org',thejerusalem_post:'jpost.com',timesofisrael:'timesofisrael.com',jns:'jns.org'};
var INI={israeldefenseforces:'IDF',israelmfa:'MFA',standwithus:'SWU',honestreportingvideo:'HR',i24news_en:'i24',aipac:'AI',thejerusalem_post:'JP',timesofisrael:'TOI',jns:'JNS'};
var ul=s.parentNode.querySelector('ul');if(!ul)return;var nav=document.createElement('nav');nav.className='apick chpick';nav.setAttribute('aria-label','Choose a channel');
[].forEach.call(ul.querySelectorAll('a'),function(a,n){var k=(a.getAttribute('href').split('/')[2]||''),l=document.createElement('a');l.href=a.getAttribute('href');if(a.getAttribute('aria-current'))l.setAttribute('aria-current','page');
var pic=document.createElement('span');pic.className='apic org c'+(n%6);var ini=document.createElement('span');ini.className='ini';ini.textContent=INI[k]||a.textContent.slice(0,2);pic.appendChild(ini);
if(D[k]){var im=new Image();im.alt='';im.loading='lazy';im.referrerPolicy='no-referrer';im.onload=function(){if(im.naturalWidth>16){pic.textContent='';pic.appendChild(im)}};im.src='https://www.google.com/s2/favicons?sz=128&domain='+D[k]}
var nm=document.createElement('span');nm.className='apn';nm.textContent=a.textContent;l.appendChild(pic);l.appendChild(nm);nav.appendChild(l)});
var box=s.closest('.newsleftcol')||s.parentNode;box.insertBefore(nav,box.firstChild);})();

;(function(){var h=document.querySelector('header.top'),s=document.getElementById('subnav');if(!h||!s)return;function pin(){var m=window.matchMedia('(max-width:640px)').matches;h.style.setProperty('--pin',m?'0px':'0px')}pin();window.addEventListener('resize',pin);window.addEventListener('load',pin);if(window.MutationObserver)new MutationObserver(pin).observe(s,{childList:true,subtree:true});setTimeout(pin,800)})();

;window.IMSort={opts:function(list){return list.map(function(o){return'<option value="'+o[0]+'">'+o[1]+'</option>'}).join('')},
 cmp:function(k,key){var A=function(f){return function(a,b){return String(f(a)||'').localeCompare(String(f(b)||''),undefined,{sensitivity:'base'})}};
  var D=function(v){var n=Number(v);return n>1e9&&n<1e13?n:(Date.parse(v)||0)};
  if(k==='new')return function(a,b){return D(key.date(b))-D(key.date(a))};
  if(k==='old')return function(a,b){return D(key.date(a))-D(key.date(b))};
  if(k==='az')return A(key.title);if(k==='src')return A(key.src);return null},
 apply:function(arr,k,key){arr=arr.slice();if(k==='rand'){for(var i=arr.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=arr[i];arr[i]=arr[j];arr[j]=t}return arr}var c=this.cmp(k,key);return c?arr.sort(c):arr}};
