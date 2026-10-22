(function(){
  var host=document.getElementById('iv');if(!host)return;
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  var q=new URLSearchParams(location.search),t=q.get('t')||'',th=q.get('th')||'',p=q.get('p')||'',a=q.get('a')||'',l=q.get('l')||'',d=q.get('d')||'',k=q.get('k')||'';
  if(!th||!/^https?:\/\//.test(th)){host.innerHTML='<h1>Image</h1><p>This image link is incomplete. <a href="/images/">Browse all images</a>.</p>';return}
  document.title='Image: '+t+' | Israel NOWlej';
  var big=th.replace(/\/(\d{2,4})px-/,'/1200px-');
  var ext=/^https?:\/\//.test(p),own=!ext&&p.charAt(0)==='/';
  var kindLbl=k==='News'?'News story':k==='Views'?'Opinion piece':k==='Video'?'Video':'Photograph';
  var when=d&&!isNaN(new Date(d))?new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}):'';
  var rows=[];
  if(a)rows.push(['Credit',esc(a)]);if(l)rows.push(['License',esc(l)]);if(when)rows.push(['Date',esc(when)]);rows.push(['Type',esc(kindLbl)]);
  if(!k&&ext){var host2=p.replace(/^https?:\/\//,'').split('/')[0];rows.push(['Source','Wikimedia Commons ('+esc(host2)+')'])}
  var links=[];
  if(own)links.push('<a href="'+esc(p)+'">'+(k==='Video'?'Watch the video on this site':'Read the story on this site')+'</a>');
  if(ext)links.push('<a href="'+esc(p)+'" target="_blank" rel="noopener">View the original file page and license details</a>');
  links.push('<a href="'+esc(big)+'" target="_blank" rel="noopener">Open the image file</a>');
  host.innerHTML='<h1>Image: '+esc(t)+'</h1>'+
   '<figure class="ivfig"><img src="'+esc(big)+'" alt="'+esc(t)+'" referrerpolicy="no-referrer" onerror="if(this.src!==\''+esc(th)+'\')this.src=\''+esc(th)+'\'"><figcaption><b>'+esc(t)+'</b>'+(a||l?'<br>'+esc(a)+(a&&l?' &middot; ':'')+esc(l):'')+'</figcaption></figure>'+
   '<h2>Provenance</h2><dl class="ivmeta">'+rows.map(function(r){return'<dt>'+r[0]+'</dt><dd>'+r[1]+'</dd>'}).join('')+'</dl>'+
   '<h2>Links and sourcing</h2><ul class="ivlinks">'+links.map(function(x){return'<li>'+x+'</li>'}).join('')+'</ul>'+
   '<p class="small">Check the license on the original page before reusing an image. Headlines, videos and news photos belong to their publishers.</p>'+
   '<h2>Related images</h2><div class="igrid mas" id="ivrel"><p class="small">Loading…</p></div>';
  function ivu(x){var u=new URLSearchParams();u.set('t',x.t||'');u.set('th',x.th);u.set('p',x.page||'');if(x.a)u.set('a',x.a);if(x.lic)u.set('l',x.lic);if(x.d)u.set('d',x.d);if(x.kind)u.set('k',x.kind);return'/images/view/?'+u.toString()}
  function draw(items){var rel=document.getElementById('ivrel');items=items.filter(function(x){return x.th&&x.th!==th}).slice(0,18);
    if(!items.length){rel.innerHTML='<p class="small">No related images found. <a href="/images/">Browse all images</a>.</p>';return}
    rel.innerHTML=items.map(function(x){var cp=x.t+'\n'+(x.a||'')+(x.lic?' · '+x.lic:'');return'<figure class="ifig"><a class="ith" title="'+esc(cp)+'" data-cap="'+esc(cp)+'" href="'+esc(ivu(x))+'"><img src="'+esc(x.th)+'" alt="'+esc(x.t)+'" loading="lazy" referrerpolicy="no-referrer" onerror="this.closest(\'figure\').remove()"></a></figure>'}).join('')}
  var words=t.replace(/[^\p{L}\p{N} ]/gu,' ').split(/\s+/).filter(function(w){return w.length>3&&!/^(israel|jpg|jpeg|file|photo|image|view|from|with)$/i.test(w)}).slice(0,2).join(' ');
  function j(u){return fetch(u).then(function(r){if(!r.ok)throw 0;return r.json()})}
  if(k){j('/api/news?v=2').then(function(d){draw((d.items||[]).filter(function(i){return i.i}).map(function(i){return{t:i.t,th:i.i,page:i.k?'/news/item/'+i.k+'/?s='+encodeURIComponent(i.s):i.u,a:i.src,d:i.d,kind:'News'}}))}).catch(function(){draw([])})}
  else j('/api/images?tag=&q='+encodeURIComponent(words)+'&o=0').then(function(d){var it=d.items||[];if(it.length<4)return j('/api/images?tag=&q=&o=0').then(function(e){return it.concat(e.items||[])});return it}).then(draw).catch(function(){draw([])});
})();
