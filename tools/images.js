(function(){
  var TAGS=[['latest','Latest on the site'],['','All Israel photos'],['jerusalem','Jerusalem'],['tel-aviv','Tel Aviv'],['haifa','Haifa'],['galilee','Galilee'],['golan','Golan Heights'],['coast','Mediterranean coast'],['negev','Negev'],['dead-sea','Dead Sea'],['landscape','Landscapes'],['archaeology','Archaeology'],['holy','Holy sites'],['architecture','Architecture'],['food','Food and markets'],['people','People and culture'],['birds','Birds'],['flowers','Wildflowers'],['wildlife','Wildlife'],['military','Military'],['history','Historic']];
  var bar=document.getElementById('imgbar'),tags=document.getElementById('imgtags'),grid=document.getElementById('igrid'),more=document.getElementById('imore'),st=document.getElementById('imgstatus');
  if(!bar||!grid)return;
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function ago(d){if(!d)return'';var m=Math.round((Date.now()-new Date(d))/60000);if(isNaN(m))return'';if(m<60)return Math.max(m,1)+' min ago';if(m<1440)return Math.round(m/60)+' h ago';if(m<43200)return Math.round(m/1440)+' d ago';return new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}
  var sel=document.getElementById('isel'),inp=document.getElementById('iq'),fm=document.getElementById('iform');
  var so=document.createElement('select');so.id='isort';so.setAttribute('aria-label','Sort');so.innerHTML='<option value="new">Newest</option><option value="old">Oldest</option><option value="az">A-Z</option><option value="rand">Random</option>';
  (function(){var lb=sel.parentNode;fm.className='ffilter';fm.insertBefore(sel,inp);fm.insertBefore(so,inp);if(lb&&lb.tagName==='LABEL')lb.hidden=true;inp.placeholder='Keyword'})();
  sel.innerHTML=TAGS.map(function(t){return'<option value="'+t[0]+'">'+esc(t[1])+'</option>'}).join('');
  grid.classList.add('mas');tags.hidden=true;
  var S={tag:'latest',q:'',sort:'new',o:0,busy:false,items:[],shown:36,next:0},LATEST=null;
  function parse(){var p=new URLSearchParams(location.hash.replace(/^#/,''));S.tag=p.has('tag')?p.get('tag'):(p.get('q')?'':'latest');S.q=p.get('q')||'';S.sort=p.get('sort')||'new'}
  function hash(){var p=new URLSearchParams();if(S.tag!=='latest'||S.q){p.set('tag',S.tag)}if(S.q)p.set('q',S.q);if(S.sort!=='new')p.set('sort',S.sort);var h=p.toString();return h?'#'+h:'#'}
  function sync(){sel.value=S.tag;so.value=S.sort;inp.value=S.q}
  function jget(u){return fetch(u).then(function(r){if(!r.ok)throw 0;return r.json()})}
  function latest(){
    if(LATEST)return Promise.resolve(LATEST);
    var none=function(){return{items:[]}};
    return Promise.all([jget('/api/news?v=2').catch(none),jget('/api/news?views=1&v=2').catch(none),jget('/api/latest-videos?n=40').catch(none)]).then(function(r){
      var o=[],seen={};
      function add(x){if(!x.th||seen[x.th])return;seen[x.th]=1;o.push(x)}
      (r[0].items||[]).forEach(function(i){if(i.i)add({t:i.t,th:i.i,page:i.k?'/news/item/'+i.k+'/?s='+encodeURIComponent(i.s)+(i.ch?'&c='+encodeURIComponent(i.ch):''):i.u,a:i.src,d:i.d,kind:'News'})});
      (r[1].items||[]).forEach(function(i){if(i.i)add({t:i.t,th:i.i,page:i.k?'/news/item/'+i.k+'/?s='+encodeURIComponent(i.s)+(i.ch?'&c='+encodeURIComponent(i.ch):''):i.u,a:i.src,d:i.d,kind:'Views'})});
      (r[2].items||[]).forEach(function(v){add({t:v.t,th:'https://i.ytimg.com/vi/'+v.v+'/hqdefault.jpg',page:'/video/watch/?v='+v.v,a:v.n,d:v.d,kind:'Video'})});
      LATEST=o;return o})}
  function ivu(x){var u=new URLSearchParams();u.set('t',x.t||'');u.set('th',x.th);u.set('p',x.page||'');if(x.a)u.set('a',x.a);if(x.lic)u.set('l',x.lic);if(x.d)u.set('d',x.d);if(x.kind)u.set('k',x.kind);return'/images/view/?'+u.toString()}
  function view(){
    var q=S.q.toLowerCase(),a=S.items.filter(function(x){return!q||S.tag==='latest'&&((x.t||'')+' '+(x.a||'')+' '+(x.kind||'')).toLowerCase().indexOf(q)>-1||S.tag!=='latest'});
    if(S.sort==='az')a=a.slice().sort(function(x,y){return(x.t||'').localeCompare(y.t||'')});
    else if(S.sort==='old'){a=a.slice();a.sort(function(x,y){return S.tag==='latest'?new Date(x.d||0)-new Date(y.d||0):0});if(S.tag!=='latest')a.reverse()}
    else if(S.sort==='rand'){a=a.slice();for(var i=a.length-1;i>0;i--){var k=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[k];a[k]=t}}
    else if(S.tag==='latest')a=a.slice().sort(function(x,y){return new Date(y.d||0)-new Date(x.d||0)});
    return a}
  var fh=document.createElement('section');fh.hidden=true;grid.parentNode.insertBefore(fh,grid);var fsig='';
  function feat(a){
    var it=a.filter(function(x){return x.th}).slice(0,12);var sig=it.map(function(x){return x.th}).join('|');
    if(sig===fsig)return;fsig=sig;
    if(!window.IMFeat||it.length<3){fh.hidden=true;return}
    window.IMFeat.mount(fh,it.map(function(x){return{img:x.th,t:x.t,s:x.a||'',a:ivu(x)}}),{ms:2500,cls:'io'})}
  function draw(){
    var a=view(),lt=S.tag==='latest',n=lt?S.shown:a.length;
    grid.innerHTML=a.slice(0,n).map(function(x){var cp=x.t+'\n'+(lt?(x.a||'')+(x.kind?' \u00b7 '+x.kind:'')+(x.d?' \u00b7 '+ago(x.d):''):(x.a?x.a+' \u00b7 ':'')+(x.lic||''));return'<figure class="ifig"><a class="ith" title="'+esc(cp)+'" data-cap="'+esc(cp)+'" href="'+esc(ivu(x))+'"><img src="'+esc(x.th)+'" alt="'+esc(x.t)+'" loading="lazy" referrerpolicy="no-referrer" onerror="this.closest(\'figure\').remove()">'+(x.kind==='Video'?'<span class="iplay">▶</span>':'')+'</a><figcaption><b>'+esc(x.t)+'</b>'+(lt?esc(x.a||'')+(x.kind?' · '+esc(x.kind):'')+(x.d?' · '+ago(x.d):''):(x.a?esc(x.a)+' · ':'')+esc(x.lic)+' · <a href="'+esc(x.page)+'" target="_blank" rel="noopener">Source</a>')+'</figcaption></figure>'}).join('');
    feat(a);
    more.hidden=lt?a.length<=n:!S.next;
    st.textContent=a.length?'':(lt?'No recent images match. Try another word.':'No open-license images found for this search. Try another tag or word.')}
  function load(reset){
    if(S.busy)return;S.busy=true;
    if(S.tag==='latest'){st.textContent='Loading the latest images…';if(reset){S.shown=36;S.items=[]}
      latest().then(function(o){S.items=o;S.busy=false;draw()}).catch(function(){S.busy=false;st.textContent='Images could not load right now. Please try again shortly.'});return}
    if(reset){S.o=0;S.items=[];grid.innerHTML='';more.hidden=true}
    st.textContent='Loading images…';
    fetch('/api/images?tag='+encodeURIComponent(S.tag)+'&q='+encodeURIComponent(S.q)+'&o='+S.o).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(d){
      var it=d.items||[];S.items=S.items.concat(it);S.o=d.next||0;S.next=d.next||0;S.busy=false;
      if(!it.length&&d.next&&S.o<400){load(false);return}
      draw()}).catch(function(){S.busy=false;st.textContent='The image service is not reachable right now. Please try again shortly.'})}
  function route(){parse();sync();load(true)}
  function go(){var h=hash();if(location.hash===h||(h==='#'&&!location.hash)){route()}else location.hash=h}
  sel.addEventListener('change',function(){S.tag=sel.value;S.q=inp.value.trim()&&S.tag===''?inp.value.trim():'';go()});
  so.addEventListener('change',function(){S.sort=so.value;if(S.tag==='latest'||S.items.length){var h=hash();try{history.replaceState(null,'',h)}catch(e){}draw()}});
  fm.addEventListener('submit',function(e){e.preventDefault();S.q=inp.value.trim();if(S.q&&S.tag==='latest'){draw();try{history.replaceState(null,'',hash())}catch(x){}}else{go()}});
  inp.addEventListener('input',function(){if(S.tag==='latest'){S.q=inp.value.trim();draw()}});
  more.addEventListener('click',function(){if(S.tag==='latest'){S.shown+=36;draw()}else load(false)});
  window.addEventListener('hashchange',route);route();
})();
