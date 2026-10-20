(function(){
  var m=location.pathname.match(/^\/g\/([^\/]+)\/$/);if(!m)return;var slug=m[1];
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  var OV={};
  function jparse(a,d){try{return JSON.parse(a)}catch(e){return d}}
  function apply(o){var im=document.getElementById('e-images'),ev=document.getElementById('e-video');
    if(o.images&&o.images.length&&im)im.setAttribute('data-files',JSON.stringify(o.images));
    if(ev){if(o.videos&&o.videos.length)ev.setAttribute('data-pins',JSON.stringify(o.videos));
      if(o.playlists&&o.playlists.length)ev.setAttribute('data-pls',JSON.stringify(o.playlists.map(function(x){return{id:x.id,name:x.name,by:x.by||'',slug:'pl-'+x.id.toLowerCase()}})));
      if((o.videos&&o.videos.length||o.playlists&&o.playlists.length)&&!document.getElementById('vid-list')){var as=document.querySelector('aside.newsside');if(as){as.innerHTML='<div class="adslot" data-slot="aside-top" data-sizes="320x100"></div><div id="vid-list" class="vlist"></div>'}}}}
  window.NOWOV=fetch('/api/entry?slug='+encodeURIComponent(slug),{cache:'no-store'}).then(function(r){return r.ok?r.json():{}}).then(function(o){OV=o||{};apply(OV)}).catch(function(){});
  var KEY='';try{KEY=localStorage.getItem('nowkey')||''}catch(e){}
  var editing=/[?&]edit=1/.test(location.search)||!!KEY;if(!editing)return;
  /* ---------- edit panel ---------- */
  var D={images:[],videos:[],playlists:[]};
  function init(){var im=document.getElementById('e-images'),ev=document.getElementById('e-video');
    D.images=jparse(im&&im.getAttribute('data-files'),[]);
    D.videos=jparse(ev&&ev.getAttribute('data-pins'),[]);
    D.playlists=jparse(ev&&ev.getAttribute('data-pls'),[]);
    /* if the page had no curated images, start from what is shown */
    if(!D.images.length){D.images=[].map.call(document.querySelectorAll('#e-gal a.lbx'),function(a){var p=a.getAttribute('data-page')||'';var mm=p.match(/\/wiki\/(File:.+)$/);return mm?decodeURIComponent(mm[1]).replace(/_/g,' '):''}).filter(Boolean)}}
  var box=document.createElement('div');box.className='edpanel';box.hidden=true;document.body.appendChild(box);
  var btn=document.createElement('button');btn.type='button';btn.className='edtoggle';btn.textContent='Edit this entry';document.body.appendChild(btn);
  btn.addEventListener('click',function(){box.hidden=!box.hidden;if(!box.hidden){init();draw()}});
  function cfile(s){s=String(s||'').trim();var mm=s.match(/\/wiki\/(File:[^?#]+)/);if(mm)s=decodeURIComponent(mm[1]);mm=s.match(/Special:FilePath\/([^?#]+)/);if(mm)s='File:'+decodeURIComponent(mm[1]);if(!/^File:/i.test(s)&&s)s='File:'+s;return s.replace(/^file:/i,'File:').replace(/_/g,' ')}
  function cyt(s){s=String(s||'').trim();var mm=s.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([A-Za-z0-9_-]{11})/);if(mm)return{v:mm[1]};if(/^[A-Za-z0-9_-]{11}$/.test(s))return{v:s};mm=s.match(/[?&]list=([A-Za-z0-9_-]+)/);if(mm)return{pl:mm[1]};if(/^PL[A-Za-z0-9_-]{8,}$/.test(s))return{pl:s};return null}
  function move(a,i,d){var j=i+d;if(j<0||j>=a.length)return;var t=a[i];a[i]=a[j];a[j]=t}
  function row(inner,k,i,n){return'<li>'+inner+'<span class="edb"><button type="button" data-k="'+k+'" data-i="'+i+'" data-a="up"'+(i===0?' disabled':'')+'>▲</button><button type="button" data-k="'+k+'" data-i="'+i+'" data-a="dn"'+(i===n-1?' disabled':'')+'>▼</button><button type="button" data-k="'+k+'" data-i="'+i+'" data-a="rm">✕</button></span></li>'}
  function draw(){var h='<div class="edhead"><b>Edit: '+esc(slug)+'</b><button type="button" id="ed-x">Close</button></div>';
    h+='<h4>Images (first is the main image)</h4><ol>'+D.images.map(function(f,i){return row('<img src="https://commons.wikimedia.org/wiki/Special:FilePath/'+encodeURIComponent(f.replace(/^File:/,''))+'?width=80" alt=""><span class="edt">'+esc(f.replace(/^File:/,''))+'</span>','images',i,D.images.length)}).join('')+'</ol><div class="edadd"><input id="ed-ai" placeholder="Commons file name or page URL"><button type="button" id="ed-aib">Add image</button></div>';
    h+='<h4>Videos (first is preloaded)</h4><ol>'+D.videos.map(function(v,i){return row('<img src="https://i.ytimg.com/vi/'+esc(v.v)+'/default.jpg" alt=""><input class="edt" data-k="videos" data-i="'+i+'" value="'+esc(v.t||'')+'" aria-label="Title">','videos',i,D.videos.length)}).join('')+'</ol><div class="edadd"><input id="ed-av" placeholder="YouTube video ID or link"><button type="button" id="ed-avb">Add video</button></div>';
    h+='<h4>Playlists</h4><ol>'+D.playlists.map(function(p,i){return row('<input class="edt" data-k="playlists" data-i="'+i+'" value="'+esc(p.name||'')+'" aria-label="Name"><small>'+esc(p.id)+'</small>','playlists',i,D.playlists.length)}).join('')+'</ol><div class="edadd"><input id="ed-ap" placeholder="Playlist ID or link"><input id="ed-apn" placeholder="Name"><button type="button" id="ed-apb">Add playlist</button></div>';
    h+='<div class="edsave"><label>Admin key <input id="ed-key" type="password" value="'+esc(KEY)+'" autocomplete="off"></label><button type="button" id="ed-save">Save and reload</button><button type="button" id="ed-copy">Copy for Claude</button><span id="ed-st" class="small"></span></div>';
    box.innerHTML=h}
  box.addEventListener('input',function(e){var t=e.target;if(t.classList.contains('edt')&&t.getAttribute('data-k')){var k=t.getAttribute('data-k'),i=+t.getAttribute('data-i');if(k==='videos')D.videos[i].t=t.value;else D.playlists[i].name=t.value}});
  box.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;var st=document.getElementById('ed-st');
    if(b.id==='ed-x'){box.hidden=true;return}
    if(b.hasAttribute('data-a')){var k=b.getAttribute('data-k'),i=+b.getAttribute('data-i'),a=b.getAttribute('data-a');if(a==='rm')D[k].splice(i,1);else move(D[k],i,a==='up'?-1:1);draw();return}
    if(b.id==='ed-aib'){var f=cfile(document.getElementById('ed-ai').value);if(f)D.images.push(f);draw();return}
    if(b.id==='ed-avb'){var y=cyt(document.getElementById('ed-av').value);if(!y||!y.v){st.textContent='That is not a YouTube video ID or link.';return}
      st.textContent='Looking up the title.';fetch('/api/yt-title?v='+y.v).then(function(r){return r.json()}).then(function(d){D.videos.push({v:y.v,t:d.t||''});draw()}).catch(function(){D.videos.push({v:y.v,t:''});draw()});return}
    if(b.id==='ed-apb'){var q=cyt(document.getElementById('ed-ap').value);if(!q||!q.pl){st.textContent='That is not a playlist ID or link.';return}D.playlists.push({id:q.pl,name:document.getElementById('ed-apn').value||'Playlist',by:''});draw();return}
    if(b.id==='ed-copy'){var tx=JSON.stringify({entry:slug,images:D.images,videos:D.videos,playlists:D.playlists},null,1);var ta=document.createElement('textarea');ta.value=tx;document.body.appendChild(ta);ta.select();var ok=false;try{ok=document.execCommand('copy')}catch(x){}ta.remove();st.textContent=ok?'Copied. Paste it into the chat.':'Could not copy.';return}
    if(b.id==='ed-save'){KEY=document.getElementById('ed-key').value;try{localStorage.setItem('nowkey',KEY)}catch(x){}
      st.textContent='Saving.';fetch('/api/entry?slug='+encodeURIComponent(slug),{method:'PUT',headers:{'Content-Type':'application/json','x-admin-key':KEY},body:JSON.stringify(D)}).then(function(r){return r.json()}).then(function(d){if(d.ok){st.textContent='Saved.';setTimeout(function(){location.reload()},400)}else st.textContent=d.error||'Could not save.'}).catch(function(){st.textContent='Could not save.'})}});
})();
