(function(){
  var seen=document.querySelectorAll('[data-who],.rwph');if(!seen.length&&!document.getElementById('results'))return;
  var K='whoimg3',map=null;
  try{var c=JSON.parse(sessionStorage.getItem(K)||'null');if(c&&Date.now()-c.t<864e5)map=c.m}catch(e){}
  function put(el,id,src){
    if(el.getAttribute('data-done'))return;el.setAttribute('data-done','1');
    var im=new Image();im.alt='';im.referrerPolicy='no-referrer';
    im.onload=function(){if(map._o&&map._o.indexOf(id)>-1)el.classList.add('org');el.classList.add('has');el.innerHTML='';el.appendChild(im);
      if(el.id==='who-ph'){var c=document.createElement('small');c.textContent='Image: Wikipedia';el.appendChild(c)}};
    im.src=src}
  function apply(){
    [].forEach.call(document.querySelectorAll('[data-who]'),function(el){var s=map[el.getAttribute('data-who')];if(s)put(el,el.getAttribute('data-who'),s)});
    [].forEach.call(document.querySelectorAll('.rwph'),function(el){var m=/\/who\/([^\/]+)\//.exec(el.getAttribute('href')||'');if(m&&map[m[1]])put(el,m[1],map[m[1]])})}
  function go(){if(map){apply();return}
    fetch('/api/whoimg').then(function(r){return r.json()}).then(function(m){map=m;if(Object.keys(m).length>1){try{sessionStorage.setItem(K,JSON.stringify({t:Date.now(),m:m}))}catch(e){}}apply();wikiFill()}).catch(function(){map={};wikiFill()})}
  // anything the Worker could not supply: ask Wikipedia directly, one name at a time
  var WN={};function wikiFill(){[].forEach.call(document.querySelectorAll('[data-who]:not([data-done])'),function(el){var id=el.getAttribute('data-who'),w=el.getAttribute('data-wiki')||((el.closest('.wcard')||el.closest('.gcard')||document.createElement('i')).querySelector('.wtx b,.gb b')||{}).textContent;if(!w||WN[id])return;WN[id]=1;fetch('https://en.wikipedia.org/api/rest_v1/page/summary/'+encodeURIComponent(w.replace(/ /g,'_'))+'?redirect=true').then(function(r){return r.ok?r.json():null}).then(function(d){var u=d&&d.thumbnail&&d.thumbnail.source;if(u&&d.type!=='disambiguation')put(el,id,u)}).catch(function(){})})}
  go();
  var res=document.getElementById('results');if(res&&window.MutationObserver){var t;new MutationObserver(function(){clearTimeout(t);t=setTimeout(function(){if(map)apply();else go()},80)}).observe(res,{childList:true})}
})();
