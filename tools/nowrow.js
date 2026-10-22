/* NOWlej sections: Section, Sort and Filter row over the whole NOWlej index (maps, tours, timelines, charts, topics, A to Z, flora). */
(function(){
  var P={'/glossary/':1,'/maps/':1,'/tour/':1,'/timelines/':1,'/charts/':1,'/hot/':1,'/size/':1,'/rankings/':1,'/demographics/':1,'/tables/':1,'/top-ten/':1,'/population/':1,'/flora/':1};
  if(!P[location.pathname])return;
  var h1=document.querySelector('.newspage h1');if(!h1)return;
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  var SEC={g:'A to Z',maps:'Maps',tour:'Tours',timelines:'Timelines',rankings:'Charts',demographics:'Charts',tables:'Charts','top-ten':'Charts',population:'Charts',hot:'Topics',flora:'Flora and Fauna'};
  var ORDER=['Maps','Tours','Timelines','Charts','Topics','A to Z','Flora and Fauna'];
  var form=document.createElement('form');form.className='ffilter nowfilter';form.setAttribute('role','search');
  form.innerHTML='<select id="nw-s" aria-label="Section"><option value="">All sections</option></select><select id="nw-o" aria-label="Sort"><option value="">Book order</option><option value="az">A-Z</option><option value="za">Z-A</option><option value="rand">Random</option></select><input id="nw-q" type="search" placeholder="Keyword" aria-label="Keyword"><button type="submit">Filter</button>';
  h1.insertAdjacentElement('afterend',form);
  /* A to Z page: the category chips become a Category dropdown in this one row */
  (function(){var cats=document.querySelectorAll('#gcats button');if(location.pathname!=='/glossary/'||!cats.length)return;
    var c=document.createElement('select');c.id='nw-c';c.setAttribute('aria-label','Category');
    c.innerHTML=[].map.call(cats,function(b){var i=b.querySelector('i'),t=b.textContent.replace(i?i.textContent:'','').trim();return'<option value="'+esc(b.getAttribute('data-c'))+'">'+(b.getAttribute('data-c')?esc(t):'All categories')+(i?' ('+esc(i.textContent)+')':'')+'</option>'}).join('');
    form.insertBefore(c,form.querySelector('#nw-o'));
    c.addEventListener('change',function(){var b=document.querySelector('#gcats button[data-c="'+c.value+'"]');if(b)b.click()})})();
  var gz=document.getElementById('gaz');if(gz&&location.pathname==='/glossary/')form.insertAdjacentElement('afterend',gz);
  var panel=document.createElement('div');panel.className='nwpanel';panel.hidden=true;form.insertAdjacentElement('afterend',panel);
  var sel=form.querySelector('#nw-s'),so=form.querySelector('#nw-o'),qi=form.querySelector('#nw-q'),idx=null,shown=60;
  function others(){var out=[],n=panel.nextElementSibling;while(n){out.push(n);n=n.nextElementSibling}return out}
  function load(){return idx?Promise.resolve(idx):fetch('/search.json').then(function(r){return r.json()}).then(function(d){idx=d.filter(function(x){var f=x.u.split('/')[1];return SEC[f]}).map(function(x){return{t:x.t,u:x.u,k:x.k||'',s:SEC[x.u.split('/')[1]],sub:x.s||'',x:(x.x||'').slice(0,400),i:x.i||''}});
    var c={};idx.forEach(function(x){c[x.s]=(c[x.s]||0)+1});sel.innerHTML='<option value="">All sections ('+idx.length+')</option>'+ORDER.filter(function(s){return c[s]}).map(function(s){return'<option value="'+s+'">'+s+' ('+c[s]+')</option>'}).join('');return idx})}
  function run(){var cur=sel.value,q=qi.value.trim().toLowerCase(),s=so.value,active=cur||q||s;
    others().forEach(function(n){n.hidden=!!active});if(gz)gz.hidden=!!active;panel.hidden=!active;if(!active){panel.innerHTML='';return}
    load().then(function(){var l=idx.filter(function(x){return(!cur||x.s===cur)&&(!q||(x.t+' '+x.k+' '+x.sub+' '+x.x).toLowerCase().indexOf(q)>-1)});
      if(s==='az')l=l.slice().sort(function(a,b){return a.t.localeCompare(b.t)});else if(s==='za')l=l.slice().sort(function(a,b){return b.t.localeCompare(a.t)});else if(s==='rand'){l=l.slice();for(var i=l.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=l[i];l[i]=l[j];l[j]=t}}
      panel.innerHTML='<p class="small" role="status">'+l.length+(l.length===1?' item':' items')+'</p><ul class="results">'+l.slice(0,shown).map(function(x){return'<li>'+(x.i?'<a class="rth" href="'+esc(x.u)+'" tabindex="-1" aria-hidden="true"><img src="'+esc(x.i)+'" alt="" loading="lazy" onerror="this.remove()"></a>':'')+'<span class="rtx"><a href="'+esc(x.u)+'">'+esc(x.t)+'</a><small>'+esc(x.s+(x.sub&&x.sub!==x.s?' · '+x.sub:''))+'</small></span></li>'}).join('')+'</ul>'+(l.length>shown?'<p><button type="button" class="aall" id="nw-more">Show more</button></p>':'')||'<p>Nothing matches.</p>';
      var m=document.getElementById('nw-more');if(m)m.onclick=function(){shown+=60;run()}})}
  sel.addEventListener('change',function(){shown=60;run()});so.addEventListener('change',run);qi.addEventListener('input',function(){shown=60;run()});form.addEventListener('submit',function(e){e.preventDefault();run()});
  load();
})();
