(function(){
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  var f=document.getElementById('subform');
  if(f){
    var t0=Date.now(),q=new URLSearchParams(location.search),msg=document.getElementById('sub-msg');
    function show(){var t=f.querySelector('[name=type]:checked').value;[].forEach.call(f.querySelectorAll('[data-for]'),function(r){r.hidden=r.getAttribute('data-for').split(' ').indexOf(t)<0})}
    var pre=q.get('type');if(pre){var r=f.querySelector('[name=type][value="'+pre+'"]');if(r)r.checked=true}
    if(q.get('about'))f.about.value=q.get('about');if(q.get('name'))f.name.value=q.get('name');
    f.addEventListener('change',show);show();
    f.addEventListener('submit',function(e){e.preventDefault();msg.textContent='';
      var b={t:t0,type:f.querySelector('[name=type]:checked').value,consent:f.consent.checked};
      ['url','title','about','name','links','notes','from','email','website','change'].forEach(function(k){if(f[k])b[k]=f[k].value});
      msg.textContent='Sending.';
      fetch('/api/submit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)}).then(function(r){return r.json().then(function(j){return[r.ok,j]})}).then(function(x){
        if(x[0]&&x[1].ok){f.innerHTML='<p class="lead">Thank you. Your submission is in the queue and a person will read it. We reply by email when there is news.</p>'}
        else msg.textContent=x[1].error||'That did not go through. Please try again.'}).catch(function(){msg.textContent='That did not go through. Please try again.'})});
  }
  var go=document.getElementById('sa-go');
  if(go){
    var key=document.getElementById('sa-key'),list=document.getElementById('sa-list'),m=document.getElementById('sa-msg'),fl=document.getElementById('sa-f'),all=[];
    try{key.value=localStorage.getItem('subkey')||''}catch(e){}
    function draw(){var s=fl.value;var l=all.filter(function(i){return!s||i.status===s});
      list.innerHTML=l.length?l.map(function(i){return'<div class="subitem"><p><b>'+esc(i.type)+'</b> · '+esc(i.at.slice(0,16).replace('T',' '))+' · <i>'+esc(i.status)+'</i></p>'
        +(i.url?'<p><a href="'+esc(i.url)+'" rel="noopener nofollow" target="_blank">'+esc(i.title||i.url)+'</a></p>':'')
        +(i.name?'<p><b>'+esc(i.name)+'</b>'+(i.change?' · wants to '+esc(i.change):'')+'</p>':'')+(i.about?'<p>About: '+esc(i.about)+'</p>':'')+(i.links?'<p>Links: '+esc(i.links)+'</p>':'')+(i.notes?'<p>'+esc(i.notes)+'</p>':'')
        +'<p class="small">From '+esc(i.from||'unknown')+' &lt;'+esc(i.email)+'&gt;</p><p>'+['approved','done','rejected','new'].map(function(st){return'<button type="button" data-id="'+esc(i.id)+'" data-st="'+st+'">'+st+'</button>'}).join(' ')+'</p></div>'}).join(''):'<p>Nothing here.</p>'}
    function load(){m.textContent='Loading.';fetch('/api/submissions',{headers:{'x-admin-key':key.value}}).then(function(r){return r.json().then(function(j){return[r.ok,j]})}).then(function(x){
      if(!x[0]){m.textContent=x[1].error||'Could not load.';return}try{localStorage.setItem('subkey',key.value)}catch(e){}all=x[1].items;m.textContent=all.length+' submissions.';draw()}).catch(function(){m.textContent='Could not load.'})}
    go.addEventListener('click',load);fl.addEventListener('change',draw);
    list.addEventListener('click',function(e){var b=e.target.closest('button[data-id]');if(!b)return;
      fetch('/api/submissions',{method:'POST',headers:{'x-admin-key':key.value,'Content-Type':'application/json'},body:JSON.stringify({id:b.getAttribute('data-id'),status:b.getAttribute('data-st')})}).then(function(r){return r.json()}).then(function(){all.forEach(function(i){if(i.id===b.getAttribute('data-id'))i.status=b.getAttribute('data-st')});draw()})});
    if(key.value)load();
  }
})();
