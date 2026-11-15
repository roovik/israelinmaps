(function(){var ul=document.getElementById('pol-now');if(!ul)return;
var RX=/\b(knesset|netanyahu|coalition|opposition|elections?|ministers?|likud|bennett|lapid|gantz|ben.gvir|smotrich|polls?|prime minister|supreme court|judicial|lawmakers?|eisenkot|yashar|haredi|draft|attorney.general|yair golan|joint list|ra.am|shas|otzma|herzog)\b/i;
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function iu(it){return it.k?'/news/item/'+it.k+'/?s='+encodeURIComponent(it.s)+(it.ch?'&c='+encodeURIComponent(it.ch):''):it.u}
function when(iso){return iso?new Date(iso).toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}):''}
fetch('/api/news?v=2').then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(d){
var a=d.items.filter(function(i){return i.d&&RX.test(i.t)}).sort(function(x,y){return new Date(y.d)-new Date(x.d)}).slice(0,8);
if(!a.length){ul.innerHTML='<li><small>No political headlines right now.</small></li>';return}
ul.innerHTML=a.map(function(i){return'<li><a href="'+esc(iu(i))+'">'+esc(i.t)+'</a><small>'+esc(i.src||'')+' · '+when(i.d)+'</small></li>'}).join('')}).catch(function(){ul.innerHTML='<li><small>Headlines are unavailable right now.</small></li>'})})();
