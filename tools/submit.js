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
    var key=document.getElementById('sa-key'),list=document.getElementById('sa-list'),m=document.getElementById('sa-msg'),fl=document.getElementById('sa-f'),all=[],mailOn=false,open={};
    try{key.value=localStorage.getItem('subkey')||''}catch(e){}
    var TPL={
      accepted:['Your submission to Israel NOWlej','Hello,\n\nThank you for your submission. We have reviewed it and we are glad to say yes. It will appear on Israel NOWlej soon, credited to its source.\n\nBest wishes'],
      listed:['You are listed on Israel NOWlej','Hello,\n\nThank you for your nomination or application. We have reviewed it and we will add the profile to Who’s Who. You can use the "Is this your profile?" link on the page at any time to send corrections or additions.\n\nBest wishes'],
      declined:['Your submission to Israel NOWlej','Hello,\n\nThank you for taking the time to send this. After review we are not able to use it at present. We keep every submission on file and may come back to it.\n\nBest wishes'],
      info:['A question about your submission to Israel NOWlej','Hello,\n\nThank you for your submission. Before we decide, could you tell us a little more? Please reply to this email with the details.\n\nBest wishes'],
      fixed:['Your Israel NOWlej profile has been updated','Hello,\n\nThank you for your note about your profile. We have made the change. Please look at the page and tell us if anything still needs attention.\n\nBest wishes'],
      removed:['Your Israel NOWlej profile has been removed','Hello,\n\nWe have removed the profile you asked about. Thank you for letting us know.\n\nBest wishes']};
    function draw(){var s=fl.value;var l=all.filter(function(i){return!s||i.status===s});
      var bar='<p class="subbar"><label><input type="checkbox" id="sa-all"> Select all shown</label> <button type="button" data-bulk="approved">Approve selected</button> <button type="button" data-bulk="rejected">Reject selected</button> <button type="button" data-bulk="done">Mark selected done</button> <button type="button" data-allnew="1">Approve all new</button></p>';
      list.innerHTML=bar+(l.length?l.map(function(i){return'<div class="subitem"><p><label><input type="checkbox" class="sa-ck" value="'+esc(i.id)+'"> <b>'+esc(i.type)+'</b></label> · '+esc(i.at.slice(0,16).replace('T',' '))+' · <i>'+esc(i.status)+(i.repliedAt?' · replied':'')+'</i></p>'
        +(i.url?'<p><a href="'+esc(i.url)+'" rel="noopener nofollow" target="_blank">'+esc(i.title||i.url)+'</a></p>':'')
        +(i.name?'<p><b>'+esc(i.name)+'</b>'+(i.change?' · wants to '+esc(i.change):'')+'</p>':'')+(i.about?'<p>About: '+esc(i.about)+'</p>':'')+(i.links?'<p>Links: '+esc(i.links)+'</p>':'')+(i.notes?'<p>'+esc(i.notes)+'</p>':'')
        +'<p class="small">From '+esc(i.from||'unknown')+' &lt;'+esc(i.email)+'&gt;</p><p><button type="button" data-open="'+esc(i.id)+'">Reply</button></p>'
        +(open[i.id]?'<div class="subreply"><select data-tpl="'+esc(i.id)+'"><option value="">Choose a reply</option>'+Object.keys(TPL).map(function(k){return'<option value="'+k+'">'+k+'</option>'}).join('')+'</select><input data-subj="'+esc(i.id)+'" placeholder="Subject"><textarea data-body="'+esc(i.id)+'" rows="7" placeholder="Your reply"></textarea><button type="button" data-send="'+esc(i.id)+'">Send reply to '+esc(i.email)+'</button></div>':'')+'</div>'}).join(''):'<p>Nothing here.</p>')}
    function post(b,done){fetch('/api/submissions',{method:'POST',headers:{'x-admin-key':key.value,'Content-Type':'application/json'},body:JSON.stringify(b)}).then(function(r){return r.json()}).then(done).catch(function(){m.textContent='That did not go through.'})}
    function load(){m.textContent='Loading.';fetch('/api/submissions',{headers:{'x-admin-key':key.value}}).then(function(r){return r.json().then(function(j){return[r.ok,j]})}).then(function(x){
      if(!x[0]){m.textContent=x[1].error||'Could not load.';return}try{localStorage.setItem('subkey',key.value)}catch(e){}all=x[1].items;mailOn=!!x[1].mail;m.textContent=all.length+' submissions. '+(mailOn?'Email is on.':'Email is not set up yet, so alerts and replies are not being sent.');draw()}).catch(function(){m.textContent='Could not load.'})}
    go.addEventListener('click',load);fl.addEventListener('change',draw);
    function picked(){return[].map.call(list.querySelectorAll('.sa-ck:checked'),function(c){return c.value})}
    list.addEventListener('click',function(e){
      var t=e.target;
      if(t.id==='sa-all'){[].forEach.call(list.querySelectorAll('.sa-ck'),function(c){c.checked=t.checked});return}
      var bk=t.closest('[data-bulk]');if(bk){var ids=picked();if(!ids.length){m.textContent='Tick at least one item.';return}post({ids:ids,status:bk.getAttribute('data-bulk')},function(){all.forEach(function(i){if(ids.indexOf(i.id)>-1)i.status=bk.getAttribute('data-bulk')});m.textContent='Done.';draw()});return}
      if(t.closest('[data-allnew]')){var ids2=all.filter(function(i){return i.status==='new'}).map(function(i){return i.id});if(!ids2.length)return;if(!confirm('Approve all '+ids2.length+' new items?'))return;post({ids:ids2,status:'approved'},function(){all.forEach(function(i){if(i.status==='new')i.status='approved'});m.textContent='Approved '+ids2.length+'.';draw()});return}
      var op=t.closest('[data-open]');if(op){var id=op.getAttribute('data-open');open[id]=!open[id];draw();return}
      var sd=t.closest('[data-send]');if(sd){var id2=sd.getAttribute('data-send'),subj=list.querySelector('[data-subj="'+id2+'"]').value,body=list.querySelector('[data-body="'+id2+'"]').value;if(!body.trim()){m.textContent='Write or choose a reply first.';return}
        post({id:id2,reply:{subject:subj,body:body}},function(r){if(r.ok){all.forEach(function(i){if(i.id===id2){i.status='done';i.repliedAt='now'}});open[id2]=false;m.textContent='Reply sent.'}else m.textContent=(r.mail&&r.mail.note)||r.error||'Reply was not sent.';draw()})}});
    list.addEventListener('change',function(e){var s=e.target.getAttribute('data-tpl');if(s===null)return;var t=TPL[e.target.value];if(!t)return;list.querySelector('[data-subj="'+s+'"]').value=t[0];list.querySelector('[data-body="'+s+'"]').value=t[1]});
    if(key.value)load();
  }
})();
