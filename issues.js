(function(){var r=document.getElementById('iss');if(!r)return;
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function iu(it){return it.k?'/news/item/'+it.k+'/?s='+encodeURIComponent(it.s)+(it.ch?'&c='+encodeURIComponent(it.ch):''):it.u}
function when(iso){return iso?new Date(iso).toLocaleString('en-GB',{day:'numeric',month:'short'}):''}
function rx(a){try{return new RegExp('\\b('+a+')\\b','i')}catch(e){return /$^/}}
function list(id,url,re,n,empty){var ul=document.getElementById(id);if(!ul)return;
fetch(url).then(function(x){if(!x.ok)throw 0;return x.json()}).then(function(d){
var a=d.items.filter(function(i){return i.d&&re.test(i.t)}).sort(function(x,y){return new Date(y.d)-new Date(x.d)}).slice(0,n);
if(!a.length){ul.innerHTML='<li><small>'+empty+'</small></li>';return}
ul.innerHTML=a.map(function(i){return'<li><a href="'+esc(iu(i))+'">'+esc(i.t)+'</a><small>'+esc((i.by?i.by+' · ':'')+(i.src||'')+' · '+when(i.d))+'</small></li>'}).join('')}).catch(function(){ul.innerHTML='<li><small>Not available right now.</small></li>'})}
list('i-now','/api/news?v=2',rx(r.getAttribute('data-rx')),8,'No headlines on this issue right now.');
list('i-views','/api/news?views=1&v=2',rx(r.getAttribute('data-vrx')),6,'No views on this issue right now.');
var vb=document.getElementById('i-vid');if(vb){var vr=rx(r.getAttribute('data-vid'));
fetch('/api/videos').then(function(x){if(!x.ok)throw 0;return x.json()}).then(function(d){
var all=[];(d.channels||[]).forEach(function(c){(c.videos||[]).forEach(function(v){all.push({v:v.v,t:v.t,d:v.d,n:v.n||c.name||'',c:(c.channel||c.key||'')})})});
var a=all.filter(function(v){return v.v&&vr.test(v.t)}).sort(function(x,y){return new Date(y.d||0)-new Date(x.d||0)}).slice(0,6);
if(!a.length){vb.innerHTML='<small>No videos on this issue right now.</small>';return}
vb.innerHTML=a.map(function(v){return'<a href="/video/watch/?v='+encodeURIComponent(v.v)+(v.c?'&c='+encodeURIComponent(v.c):'')+'&t='+encodeURIComponent(v.t)+'"><img src="https://i.ytimg.com/vi/'+esc(v.v)+'/mqdefault.jpg" alt="" loading="lazy">'+esc(v.t)+'<small>'+esc(v.n)+'</small></a>'}).join('')}).catch(function(){vb.innerHTML='<small>Videos are unavailable right now.</small>'})}
})();
