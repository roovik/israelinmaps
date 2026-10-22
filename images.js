(function(){
  var TAGS=[['','All Israel'],['jerusalem','Jerusalem'],['tel-aviv','Tel Aviv'],['haifa','Haifa'],['galilee','Galilee'],['golan','Golan Heights'],['coast','Mediterranean coast'],['negev','Negev'],['dead-sea','Dead Sea'],['landscape','Landscapes'],['archaeology','Archaeology'],['holy','Holy sites'],['architecture','Architecture'],['food','Food and markets'],['people','People and culture'],['birds','Birds'],['flowers','Wildflowers'],['wildlife','Wildlife'],['military','Military'],['history','Historic']];
  var bar=document.getElementById('imgbar'),tags=document.getElementById('imgtags'),grid=document.getElementById('igrid'),more=document.getElementById('imore'),st=document.getElementById('imgstatus');
  if(!bar||!grid)return;
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  var sel=document.getElementById('isel'),inp=document.getElementById('iq');
  (function(){var fm=document.getElementById('iform');if(!fm||!sel)return;var lb=sel.parentNode;fm.className='ffilter';fm.insertBefore(sel,inp);if(lb&&lb.tagName==='LABEL')lb.hidden=true;inp.placeholder='Keyword'})();
  sel.innerHTML=TAGS.map(function(t){return'<option value="'+t[0]+'">'+esc(t[1])+'</option>'}).join('');
  var S={tag:'',q:'',o:0,busy:false};
  function parse(){var h=location.hash.replace(/^#/,''),p=new URLSearchParams(h);S.tag=p.get('tag')||'';S.q=p.get('q')||''}
  function hash(){var p=new URLSearchParams();if(S.tag)p.set('tag',S.tag);if(S.q)p.set('q',S.q);var h=p.toString();return'#'+h}
  function drawTags(){tags.innerHTML=TAGS.map(function(t){var p=new URLSearchParams();if(t[0])p.set('tag',t[0]);return'<a href="#'+p.toString()+'"'+((!S.q&&t[0]===S.tag)?' aria-current="true"':'')+'>'+esc(t[1])+'</a>'}).join('');sel.value=S.tag;inp.value=S.q}
  function load(reset){
    if(S.busy)return;S.busy=true;if(reset){S.o=0;grid.innerHTML='';more.hidden=true}
    st.textContent='Loading images…';
    fetch('/api/images?tag='+encodeURIComponent(S.tag)+'&q='+encodeURIComponent(S.q)+'&o='+S.o).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(d){
      var it=d.items||[];
      grid.insertAdjacentHTML('beforeend',it.map(function(x){return'<figure class="ifig"><a class="ith" href="'+esc(x.page)+'" target="_blank" rel="noopener"><img src="'+esc(x.th)+'" alt="'+esc(x.t)+'" loading="lazy"></a><figcaption><b>'+esc(x.t)+'</b>'+(x.a?esc(x.a)+' · ':'')+esc(x.lic)+' · <a href="'+esc(x.page)+'" target="_blank" rel="noopener">Source</a></figcaption></figure>'}).join(''));
      S.o=d.next||0;more.hidden=!d.next;S.busy=false;if(!it.length&&d.next&&S.o<400){load(false);return}
      st.textContent=grid.children.length?'':'No open-license images found for this search. Try another tag or word.';
    }).catch(function(){S.busy=false;st.textContent='The image service is not reachable right now. Please try again shortly.'});
  }
  function route(){parse();drawTags();load(true)}
  sel.addEventListener('change',function(){location.hash=sel.value?'tag='+sel.value:''; if(!sel.value&&!location.hash)route()});
  document.getElementById('iform').addEventListener('submit',function(e){e.preventDefault();var q=inp.value.trim();S.tag='';S.q=q;location.hash=q?'q='+encodeURIComponent(q):'';if(!q)route()});
  more.addEventListener('click',function(){load(false)});
  window.addEventListener('hashchange',route);route();
})();
