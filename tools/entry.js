(function(){(window.NOWOV||Promise.resolve()).then(function(){
  var wk=document.getElementById('e-wiki');if(!wk)return;
  var title=wk.getAttribute('data-wiki');
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  var src=document.getElementById('e-src');
  function addSrc(h){var li=document.createElement('li');li.innerHTML=h;src.appendChild(li)}
  function jump(){[].forEach.call(document.querySelectorAll('#esec a[data-s]'),function(a){var t=document.getElementById(a.getAttribute('data-s'));a.hidden=!t||t.hidden})}
  var n=0,iv=setInterval(function(){jump();if(++n>20)clearInterval(iv)},400);
  var vch=document.querySelector('#e-video');if(vch)addSrc('Video: embedded from YouTube channels on the NOWlej approved list.');
  var fxs=document.getElementById('e-images').getAttribute('data-files'),fxl=null;try{fxl=fxs?JSON.parse(fxs):null}catch(x){}
  if(fxl&&fxl.length)showFiles(fxl);
  if(!title)return;
  var WK='https://en.wikipedia.org/api/rest_v1/page/';
  var fixed=wk.getAttribute('data-fixed');

  (fixed?fetch(WK+'media-list/'+encodeURIComponent(title.replace(/ /g,'_'))):fetch(WK+'summary/'+encodeURIComponent(title.replace(/ /g,'_'))+'?redirect=true').then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(d){
    if(d.type==='disambiguation'||!d.extract||d.extract.length<60)throw 0;
    var u=(d.content_urls&&d.content_urls.desktop&&d.content_urls.desktop.page)||'https://en.wikipedia.org/wiki/'+encodeURIComponent(d.title);
    var img=d.thumbnail&&d.thumbnail.source?'<img class="wimg" src="'+esc(d.thumbnail.source)+'" alt="" loading="lazy">':'';
    wk.innerHTML='<h3>From Wikipedia</h3>'+img+d.extract.split(/\n+/).filter(Boolean).map(function(x){return'<p>'+esc(x)+'</p>'}).join('')+'<p class="small"><a href="'+esc(u)+'" rel="noopener">Read the full article on Wikipedia</a>. Text available under CC BY-SA 4.0.</p>';wk.hidden=false;
    addSrc('<a href="'+esc(u)+'" rel="noopener">Wikipedia: '+esc(d.title)+'</a> (CC BY-SA 4.0).');
    return fetch(WK+'media-list/'+encodeURIComponent(d.title.replace(/ /g,'_')))
  })).then(function(r){if(!r||!r.ok)throw 0;return r.json()}).then(function(m){
    if(fxl&&fxl.length)return;
    var files=(m.items||[]).filter(function(i){return i.type==='image'&&i.showInGallery&&/\.(jpe?g|png)$/i.test(i.title||'')}).slice(0,8).map(function(i){return i.title});
    showFiles(files)
  }).catch(function(){});
  function showFiles(files){if(!files.length)return;
    var q='https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=480&titles='+encodeURIComponent(files.join('|'));
    fetch(q).then(function(r){if(!r||!r.ok)throw 0;return r.json()}).then(function(d){
    var pages=Object.keys((d.query||{}).pages||{}).map(function(k){return d.query.pages[k]}),out=[];
    var fx2=document.getElementById('e-images').getAttribute('data-files');if(fx2){try{var ord=JSON.parse(fx2);pages.sort(function(a,b){return ord.indexOf(a.title)-ord.indexOf(b.title)})}catch(x){}}
    pages.forEach(function(p){var ii=p.imageinfo&&p.imageinfo[0];if(!ii||!ii.thumburl)return;var md=ii.extmetadata||{},lic=(md.LicenseShortName||{}).value||'',ok=/^(cc|public domain|pd|no restrictions)/i.test(lic);if(!ok)return;
      var artist=((md.Artist||{}).value||'').replace(/<[^>]*>/g,'').trim().slice(0,60);
      out.push('<figure><a class="lbx" href="'+esc(ii.thumburl.replace(/\/\d+px-/,'/1280px-'))+'" data-credit="'+esc((artist||'Wikimedia Commons')+' · '+lic)+'" data-page="'+esc(ii.descriptionurl)+'"><img src="'+esc(ii.thumburl)+'" alt="'+esc(p.title.replace(/^File:/,'').replace(/\.\w+$/,''))+'" loading="lazy"></a><figcaption>'+esc(artist||'Wikimedia Commons')+' · '+esc(lic)+'</figcaption></figure>')});
    if(!out.length)return;
    document.getElementById('e-gal').innerHTML=out.slice(0,6).join('');document.getElementById('e-gal').className+=' ranked';document.getElementById('e-images').hidden=false;jump();
    addSrc('Photographs: Wikimedia Commons, authors and licenses shown beside each image.')
    }).catch(function(){})}
  document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a.lbx');if(!a||e.metaKey||e.ctrlKey)return;e.preventDefault();
    var o=document.getElementById('lbx');if(!o){o=document.createElement('div');o.id='lbx';o.className='lbx-o';o.addEventListener('click',function(ev){if(ev.target===o||ev.target.className==='lbx-x')o.hidden=true});document.addEventListener('keydown',function(ev){if(ev.key==='Escape')o.hidden=true});document.body.appendChild(o)}
    o.innerHTML='<div class="lbx-b"><button type="button" class="lbx-x">Close</button><img src="'+esc(a.getAttribute('href'))+'" alt=""><p class="small">'+esc(a.getAttribute('data-credit'))+' · <a href="'+esc(a.getAttribute('data-page'))+'" rel="noopener">Source and license</a></p></div>';o.hidden=false});
});})();
