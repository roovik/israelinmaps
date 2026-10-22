(function(){
  document.addEventListener('click',function(e){
    var b=e.target.closest('.copy');if(!b)return;
    var t=b.getAttribute('data-copy');
    function ok(){var o=b.textContent;b.textContent='Copied';setTimeout(function(){b.textContent=o},1500)}
    if(navigator.clipboard){navigator.clipboard.writeText(t).then(ok,function(){fallback(t,ok)})}else fallback(t,ok);
  });
  function fallback(t,ok){var a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();try{document.execCommand('copy');ok()}catch(x){}document.body.removeChild(a)}
  var res=document.getElementById('results');if(!res)return;
  var q=document.getElementById('q'),rsel=null,rsrt=null;
  (function(){var f=q&&q.form;if(!f)return;f.className='ffilter rfilter';var lab=document.createElement('label');lab.textContent='';lab.hidden=true;lab.setAttribute('for','rs-s');rsel=document.createElement('select');rsel.id='rs-s';rsel.setAttribute('aria-label','Section');rsel.innerHTML='<option value="">All sections</option>';
   rsrt=document.createElement('select');rsrt.id='rs-o';rsrt.setAttribute('aria-label','Sort');rsrt.innerHTML='<option value="">Relevance</option><option value="new">Newest</option><option value="az">A-Z</option><option value="rand">Random</option>';
   f.insertBefore(lab,q);f.insertBefore(rsel,q);f.insertBefore(rsrt,q);var b=f.querySelector('button');if(b)b.textContent='Filter';q.placeholder='Keyword';
   rsel.addEventListener('change',function(){if(window.__run)window.__run()});rsrt.addEventListener('change',function(){if(window.__run)window.__run()});
   f.addEventListener('submit',function(e){e.preventDefault();if(window.__run)window.__run();try{history.replaceState(null,'','/search/?q='+encodeURIComponent(q.value))}catch(x){}})})();
  var params=new URLSearchParams(location.search);
  var start=params.get('q')||'';
  if(!start&&document.body.classList.contains('nf')){start=decodeURIComponent(location.pathname).replace(/[\/\-_]+/g,' ').trim()}
  if(q)q.value=start;
  function norm(s){return s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g,'').replace(/['’]/g,'')}
  var live={News:[],Views:[],Videos:[],Playlists:[],Podcasts:[]};
  function getLive(name,url){fetch(url).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(d){
    live[name]=(d.items||[]).filter(function(i){return!i.d||Date.now()-new Date(i.d)<=30*864e5}).map(function(i){
      return{t:i.t,u:i.k?'/news/item/'+i.k+'/?s='+encodeURIComponent(i.s)+(i.ch?'&c='+encodeURIComponent(i.ch):''):i.u,i:i.i||'',k:i.src,s:i.d?new Date(i.d).toLocaleDateString('en-GB',{day:'numeric',month:'short'}):'',ts:i.d?new Date(i.d).getTime():0,x:i.x||''}});
    if(window.__run)window.__run()}).catch(function(){})}
  getLive('News','/api/news?v=2');getLive('Views','/api/news?views=1&v=2');
  fetch('/api/videos').then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(d){var o=[];(d.channels||[]).forEach(function(c){(c.videos||[]).forEach(function(v){o.push({t:v.t,u:'/video/watch/?v='+encodeURIComponent(v.v)+(c.key?'&c='+encodeURIComponent(String(c.key).toLowerCase()):''),k:c.name||'',s:v.d?new Date(v.d).toLocaleDateString('en-GB',{day:'numeric',month:'short'}):'',ts:v.d?new Date(v.d).getTime():0,x:''})})});live.Videos=o;if(window.__run)window.__run()}).catch(function(){});
  fetch('/api/videos?lists=1').then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(d){live.Playlists=(d.playlists||[]).map(function(p){return{t:p.name,u:'/video/pl-'+String(p.id).toLowerCase()+'/',k:'Playlist',s:(d.chnames||{})[p.channel]||'',x:''}});if(window.__run)window.__run()}).catch(function(){});
  fetch('/voices.json').then(function(r){return r.json()}).then(function(d){live.Podcasts=(d.shows||[]).map(function(p){return{t:p.name,u:'/audio/#s-'+p.id,k:'Podcast',s:p.by||'',x:p.by||''}}).concat((d.voices||[]).filter(function(v){return v.pods&&v.pods.length}).map(function(v){return{t:v.name+' podcast',u:'/sources/influencers/#s='+v.id+'&t=podcasts',k:'Podcast',s:v.name,x:(v.tags||'')+' '+v.name}}));if(window.__run)window.__run()}).catch(function(){});
  var PUBS=[['The Times of Israel','/sources/toi/','Publication'],['The Jerusalem Post','/sources/jpost/','Publication'],['Ynet Global','/sources/ynet/','Publication'],['Haaretz','/sources/haaretz/','Publication'],['JNS','/sources/jns/','Publication'],['Israel Hayom','/sources/israelhayom/','Publication'],['JTA','/sources/jta/','Publication'],['Israel National News','/sources/inn/','Publication'],['i24NEWS','/sources/i24/','Publication'],['Globes','/sources/globes/','Publication'],['Calcalist','/sources/calcalist/','Publication'],['Tablet','/sources/tablet/','Publication'],['Middle East Forum','/sources/mef/','Publication'],['Jewish Insider','/sources/ji/','Publication'],['Kan News English','/sources/kan/','Publication']].map(function(p){return{t:p[0],u:p[1],k:p[2],s:'',x:''}});
  var SEC=[['News'],['Views'],['Videos'],['Playlists'],['Podcasts'],['NOWlej'],['Sources']];
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
      ['News','Views','Videos','Playlists','Podcasts'].forEach(function(n){live[n].forEach(function(d){var sc=score({t:d.t,x:d.x,k:'',s:d.k},term,words,idq);if(sc>=10)(groups[n]=groups[n]||[]).push([sc,d])})});
      var any=false,jump=[],cur=rsel?rsel.value:'',so=rsrt?rsrt.value:'',tot=0,opts='';SEC.forEach(function(S){var l=groups[S[0]];if(l){tot+=l.length;opts+='<option value="'+S[0]+'"'+(cur===S[0]?' selected':'')+'>'+S[0]+' ('+l.length+')</option>'}});if(rsel){rsel.innerHTML='<option value="">All sections ('+tot+')</option>'+opts}
      SEC.forEach(function(S){var n=S[0],l=groups[n];if(!l||(cur&&cur!==n))return;any=true;
        l.sort(function(a,b){return b[0]-a[0]});if(so==='new')l.sort(function(a,b){return(b[1].ts||0)-(a[1].ts||0)});else if(so==='az')l.sort(function(a,b){return a[1].t.localeCompare(b[1].t)});else if(so==='rand')for(var z0=l.length-1;z0>0;z0--){var j0=Math.floor(Math.random()*(z0+1)),t0=l[z0];l[z0]=l[j0];l[j0]=t0}
        var h=document.createElement('li');h.className='rsec';h.id='r-'+n;h.innerHTML='<h2>'+n+' <small>'+l.length+'</small></h2>';res.appendChild(h);
        l.slice(0,cur?100:(n==='NOWlej'||n==='Sources'?30:12)).forEach(function(p){var d=p[1];var li=document.createElement('li');if(n==='Sources'&&d.u.indexOf('/who/')===0){li.className='rwho';var ini=d.t.replace(/^The /,'').split(/\s+/).slice(0,2).map(function(w){return w[0]}).join('').toUpperCase(),hu=0;for(var z=0;z<d.u.length;z++)hu+=d.u.charCodeAt(z);li.innerHTML='<a class="rwph t'+(1+hu%5)+'" href="'+d.u+'" tabindex="-1" aria-hidden="true"><span>'+ini+'</span></a><span class="rtx"><a href="'+d.u+'">'+d.t.replace(/&/g,'&amp;')+'</a><small>'+(d.s||'')+'</small><em></em></span>';li.querySelector('em').textContent=(d.x||'').split('. ')[0].replace(/\.$/,'')+'.';res.appendChild(li);return}var a=document.createElement('a');a.href=d.u;a.textContent=d.t;
          var sm=document.createElement('small');sm.textContent=d.k+(d.s?' · '+d.s:'');var tx=document.createElement('span');tx.className='rtx';tx.appendChild(a);tx.appendChild(sm);
          if(d.i){var im=document.createElement('img');im.src=d.i;im.alt='';im.loading='lazy';im.referrerPolicy='no-referrer';im.onerror=function(){im.remove()};var al=document.createElement('a');al.className='rth';al.href=d.u;al.tabIndex=-1;al.setAttribute('aria-hidden','true');al.appendChild(im);li.appendChild(al)}
          li.appendChild(tx);res.appendChild(li)})});
      if(!any)res.innerHTML='<li>Nothing found. Try one word, or an ID such as MAP-002.</li>'
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
if(D[k]){var im=new Image();im.alt='';im.loading='lazy';im.referrerPolicy='no-referrer';im.onload=function(){if(im.naturalWidth>16){pic.textContent='';pic.appendChild(im)}};im.src=(D[k]==='ynetnews.com'?'/img/ynet-y.png':'https://www.google.com/s2/favicons?sz=128&domain='+D[k])}
var nm=document.createElement('span');nm.className='apn';nm.textContent=a.textContent.replace(/^The /,'').replace('Jerusalem Post','JPost').replace('Times of Israel','ToI');l.appendChild(pic);l.appendChild(nm);nav.appendChild(l)});
var box=s.closest('.newsleftcol')||s.parentNode;box.insertBefore(nav,box.firstChild);})();

;(function(){var h=document.querySelector('header.top'),s=document.getElementById('subnav');if(!h||!s)return;function pin(){var m=window.matchMedia('(max-width:640px)').matches;h.style.setProperty('--pin',m?'0px':'0px')}pin();window.addEventListener('resize',pin);window.addEventListener('load',pin);if(window.MutationObserver)new MutationObserver(pin).observe(s,{childList:true,subtree:true});setTimeout(pin,800)})();

;window.IMSort={opts:function(list){return list.map(function(o){return'<option value="'+o[0]+'">'+o[1]+'</option>'}).join('')},
 cmp:function(k,key){var A=function(f){return function(a,b){return String(f(a)||'').localeCompare(String(f(b)||''),undefined,{sensitivity:'base'})}};
  var D=function(v){var n=Number(v);return n>1e9&&n<1e13?n:(Date.parse(v)||0)};
  if(k==='new')return function(a,b){return D(key.date(b))-D(key.date(a))};
  if(k==='old')return function(a,b){return D(key.date(a))-D(key.date(b))};
  if(k==='az')return A(key.title);if(k==='src')return A(key.src);return null},
 apply:function(arr,k,key){arr=arr.slice();if(k==='rand'){for(var i=arr.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=arr[i];arr[i]=arr[j];arr[j]=t}return arr}var c=this.cmp(k,key);return c?arr.sort(c):arr}};

;(function(){var done=new WeakSet();
function fix(img){if(done.has(img))return;var pic=img.parentNode;if(!pic||!pic.classList||!pic.classList.contains('apic')||!pic.hasAttribute('data-d'))return;if(!/s2\/favicons|gstatic|favicon/.test(img.src))return;done.add(img);
 var c=new Image();c.crossOrigin='anonymous';c.onload=function(){try{var n=48,cv=document.createElement('canvas');cv.width=cv.height=n;var x=cv.getContext('2d');x.drawImage(c,0,0,n,n);var d=x.getImageData(0,0,n,n),p=d.data;
  var rr=p[3]>200?[p[0],p[1],p[2]]:null;function white(i){if(p[i+3]<40||(p[i]>232&&p[i+1]>232&&p[i+2]>232))return true;return !!rr&&Math.abs(p[i]-rr[0])+Math.abs(p[i+1]-rr[1])+Math.abs(p[i+2]-rr[2])<45}
  var seen=new Uint8Array(n*n),st=[];for(var k=0;k<n;k++){st.push(k,(n-1)*n+k,k*n,k*n+n-1)}
  while(st.length){var q=st.pop();if(seen[q])continue;seen[q]=1;if(!white(q*4))continue;p[q*4+3]=0;var r=Math.floor(q/n),cc=q%n;if(r>0)st.push(q-n);if(r<n-1)st.push(q+n);if(cc>0)st.push(q-1);if(cc<n-1)st.push(q+1)}
  var h={},best='',bc=0;for(var i=0;i<p.length;i+=4){if(p[i+3]<200||(p[i]>232&&p[i+1]>232&&p[i+2]>232))continue;var key=(p[i]>>4)+','+(p[i+1]>>4)+','+(p[i+2]>>4);h[key]=(h[key]||0)+1;if(h[key]>bc){bc=h[key];best=key}}
  x.putImageData(d,0,0);var rw=rr&&!(rr[0]>232&&rr[1]>232&&rr[2]>232);var col=rw?'rgb('+rr.join(',')+')':best?'rgb('+best.split(',').map(function(v){return v*16+8}).join(',')+')':'#2b2f38';
  img.src=cv.toDataURL('image/png');pic.style.background=col;pic.style.borderColor='transparent'}catch(e){img.style.transform='scale(1.3)'}};
 c.onerror=function(){img.style.transform='scale(1.3)'};c.src=img.src}
function scan(root){[].forEach.call((root.querySelectorAll?root:document).querySelectorAll('.apic[data-d] img'),fix)}
if(window.MutationObserver)new MutationObserver(function(ms){ms.forEach(function(m){[].forEach.call(m.addedNodes,function(n){if(n.nodeType!==1)return;if(n.tagName==='IMG')fix(n);else scan(n)})})}).observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('DOMContentLoaded',function(){scan(document)})})();


;(function(){var h=document.querySelector('header.top'),nv=h&&h.querySelector('nav.wrap'),s1=document.getElementById('subnav'),s2=document.getElementById('subnav2');if(!nv||(!s1&&!s2))return;
function center(sub,anchor){try{if(!sub||sub.hidden)return;sub.style.cssText='';if(!anchor)return;sub.style.width='max-content';sub.style.maxWidth='none';var w=sub.scrollWidth;sub.style.cssText='';
 var cw=sub.clientWidth;if(!w||w>cw-8)return;var cs=getComputedStyle(sub),pl=parseFloat(cs.paddingLeft)||0,pr=parseFloat(cs.paddingRight)||0;var sr=sub.getBoundingClientRect(),cr=anchor.getBoundingClientRect();var cx=cr.left+cr.width/2-sr.left;
 var inner=w-pl-pr;var left=cx-inner/2;left=Math.max(pl,Math.min(left,cw-pr-inner));sub.style.flexWrap='nowrap';sub.style.justifyContent='flex-start';sub.style.paddingLeft=left+'px'}catch(e){}}
function ctr(){var a=nv.querySelector('a.hov')||nv.querySelector('a.cur')||nv.querySelector('a[aria-current]');center(s1,a);if(s2){center(s2,(s1&&(s1.querySelector('a.on')||s1.querySelector('a[aria-current]')))||a)}}
ctr();window.addEventListener('resize',ctr);window.addEventListener('load',ctr);setTimeout(ctr,600);
if(window.MutationObserver){var mo=new MutationObserver(ctr);if(s1)mo.observe(s1,{childList:true});if(s2)mo.observe(s2,{childList:true});[].forEach.call(nv.querySelectorAll('a'),function(a){mo.observe(a,{attributes:true,attributeFilter:['class']})})}})();

;(function(){var nv=document.querySelector('header.top nav.wrap');if(!nv)return;function sec(){var a=nv.querySelector('a.cur')||nv.querySelector('a[aria-current]');if(!a)return;var c=getComputedStyle(a).backgroundColor;if(!c||c==='rgba(0, 0, 0, 0)')return;var r=document.documentElement.style;r.setProperty('--sec',c);r.setProperty('--secd','color-mix(in srgb,'+c+' 70%,#000)')}sec();window.addEventListener('load',sec);setTimeout(sec,500)})();
/* desktop: lift the right column to just under the Search box */
(function(){
  function pull(){var r=document.documentElement,mq=window.matchMedia('(min-width:1001px)');
    var np=document.querySelector('.newspage'),side=np&&np.querySelector(':scope>.newsside'),rc=document.querySelector('header.top .rcol');
    if(!mq.matches||!side||!rc){r.style.removeProperty('--pull');return}
    var p=Math.round(np.getBoundingClientRect().top-(rc.getBoundingClientRect().bottom+10));r.style.setProperty('--pull',Math.max(0,p)+'px')}
  window.addEventListener('load',function(){pull();setTimeout(pull,600);setTimeout(pull,2000)});window.addEventListener('resize',pull);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(pull);
  var tries=0,t=setInterval(function(){pull();if(++tries>10)clearInterval(t)},500);
})();

/* the page title becomes the centered now-playing band: Playlist/Podcast/Video: Source · Item */
window.IMNow=function(label,a,b){var h=document.querySelector('.newsmain h1');if(!h)return;
  if(h._orig==null)h._orig=h.innerHTML;
  if(!label){h.innerHTML=h._orig;h.classList.remove('nowbar');return}
  var e=function(x){return String(x==null?'':x).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
  h.innerHTML='<b>'+e(label)+':</b> '+e(a)+(b?' <span class="nsep">\u00b7</span> '+e(b):'');h.classList.add('nowbar')};

/* desktop: logo centred over the News tab, headline ticker starts at the Views tab's left edge */
(function(){function al(){var bar=document.querySelector('header.top .bar'),br=bar&&bar.querySelector('.brand'),tk=bar&&bar.querySelector('.ticker'),nv=document.querySelectorAll('header.top nav.wrap>a');if(!bar||!br||nv.length<2)return;
  if(innerWidth<901){br.style.marginLeft='';if(tk)tk.style.marginLeft='';return}
  br.style.marginLeft='0px';if(tk)tk.style.marginLeft='0px';
  var b=bar.getBoundingClientRect(),n=nv[0].getBoundingClientRect(),v=nv[1].getBoundingClientRect(),w=br.getBoundingClientRect().width;
  var ml=Math.max(0,n.left+n.width/2-w/2-b.left-parseFloat(getComputedStyle(bar).paddingLeft||0));br.style.marginLeft=ml+'px';
  if(tk){var r=br.getBoundingClientRect();tk.style.marginLeft=Math.max(0,v.left-r.right)+'px'}}
  addEventListener('resize',al);addEventListener('load',al);document.addEventListener('DOMContentLoaded',al);setTimeout(al,300);setTimeout(al,1200)})();
