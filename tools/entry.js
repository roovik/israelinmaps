(function(){
  var wk=document.getElementById('e-wiki');if(!wk)return;
  var title=wk.getAttribute('data-wiki');
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  var src=document.getElementById('e-src');
  function addSrc(h){var li=document.createElement('li');li.innerHTML=h;src.appendChild(li)}
  function jump(){[].forEach.call(document.querySelectorAll('#esec a[data-s]'),function(a){var t=document.getElementById(a.getAttribute('data-s'));a.hidden=!t||t.hidden})}
  var n=0,iv=setInterval(function(){jump();if(++n>20)clearInterval(iv)},400);
  var vch=document.querySelector('#e-video');if(vch)addSrc('Video: embedded from YouTube channels on the NOWlej approved list.');
  if(!title)return;
  var WK='https://en.wikipedia.org/api/rest_v1/page/';
  fetch(WK+'summary/'+encodeURIComponent(title.replace(/ /g,'_'))+'?redirect=true').then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(d){
    if(d.type==='disambiguation'||!d.extract||d.extract.length<60)throw 0;
    var u=(d.content_urls&&d.content_urls.desktop&&d.content_urls.desktop.page)||'https://en.wikipedia.org/wiki/'+encodeURIComponent(d.title);
    var img=d.thumbnail&&d.thumbnail.source?'<img class="wimg" src="'+esc(d.thumbnail.source)+'" alt="" loading="lazy">':'';
    wk.innerHTML='<h3>From Wikipedia</h3>'+img+'<p>'+esc(d.extract)+'</p><p class="small"><a href="'+esc(u)+'" rel="noopener">Read the full article on Wikipedia</a>. Text available under CC BY-SA 4.0.</p>';wk.hidden=false;
    addSrc('<a href="'+esc(u)+'" rel="noopener">Wikipedia: '+esc(d.title)+'</a> (CC BY-SA 4.0).');
    return fetch(WK+'media-list/'+encodeURIComponent(d.title.replace(/ /g,'_')))
  }).then(function(r){if(!r||!r.ok)throw 0;return r.json()}).then(function(m){
    var files=(m.items||[]).filter(function(i){return i.type==='image'&&i.showInGallery&&/\.(jpe?g|png)$/i.test(i.title||'')}).slice(0,8).map(function(i){return i.title});
    if(!files.length)throw 0;
    var q='https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=480&titles='+encodeURIComponent(files.join('|'));
    return fetch(q)
  }).then(function(r){if(!r||!r.ok)throw 0;return r.json()}).then(function(d){
    var pages=Object.keys((d.query||{}).pages||{}).map(function(k){return d.query.pages[k]}),out=[];
    pages.forEach(function(p){var ii=p.imageinfo&&p.imageinfo[0];if(!ii||!ii.thumburl)return;var md=ii.extmetadata||{},lic=(md.LicenseShortName||{}).value||'',ok=/^(cc|public domain|pd|no restrictions)/i.test(lic);if(!ok)return;
      var artist=((md.Artist||{}).value||'').replace(/<[^>]*>/g,'').trim().slice(0,60);
      out.push('<figure><a href="'+esc(ii.descriptionurl)+'" rel="noopener"><img src="'+esc(ii.thumburl)+'" alt="'+esc(p.title.replace(/^File:/,'').replace(/\.\w+$/,''))+'" loading="lazy"></a><figcaption>'+esc(artist||'Wikimedia Commons')+' · '+esc(lic)+'</figcaption></figure>')});
    if(!out.length)return;
    document.getElementById('e-gal').innerHTML=out.slice(0,6).join('');document.getElementById('e-images').hidden=false;jump();
    addSrc('Photographs: Wikimedia Commons, authors and licenses shown beside each image.')
  }).catch(function(){});
})();
