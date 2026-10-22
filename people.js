/* Subscribe form, contact form and the private people manager (subscribers and contacts). */
(function(){
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  var CC='AF AX AL DZ AS AD AO AI AQ AG AR AM AW AU AT AZ BS BH BD BB BY BE BZ BJ BM BT BO BQ BA BW BV BR IO BN BG BF BI CV KH CM CA KY CF TD CL CN CX CC CO KM CG CD CK CR CI HR CU CW CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FK FO FJ FI FR GF PF TF GA GM GE DE GH GI GR GL GD GP GU GT GG GN GW GY HT HM VA HN HK HU IS IN ID IR IQ IE IM IL IT JM JP JE JO KZ KE KI KP KR KW KG LA LV LB LS LR LY LI LT LU MO MG MW MY MV ML MT MH MQ MR MU YT MX FM MD MC MN ME MS MA MZ MM NA NR NP NL NC NZ NI NE NG NU NF MK MP NO OM PK PW PS PA PG PY PE PH PN PL PT PR QA RE RO RU RW BL SH KN LC MF PM VC WS SM ST SA SN RS SC SL SG SX SK SI SB SO ZA GS SS ES LK SD SR SJ SE CH SY TW TJ TZ TH TL TG TK TO TT TN TR TM TC TV UG UA AE GB US UM UY UZ VU VE VN VG VI WF EH YE ZM ZW'.split(' ');
  var dn=null;try{dn=new Intl.DisplayNames(['en'],{type:'region'})}catch(e){}
  function cname(c){if(!c)return'';try{return dn?dn.of(c):c}catch(e){return c}}
  var NAMES=CC.map(function(c){return[c,cname(c)]}).sort(function(a,b){return a[1].localeCompare(b[1])});
  function countryOpts(first){return'<option value="">'+first+'</option>'+NAMES.map(function(n){return'<option value="'+n[0]+'">'+esc(n[1])+'</option>'}).join('')}
  function post(path,body){return fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}).then(function(r){return r.json().then(function(j){return[r.ok,j]})})}

  /* ---- public forms ---- */
  [['subscribe-form','/api/subscribe','Thank you. You are subscribed. A welcome note is on its way to your inbox.'],['contact-form','/api/contact','Thank you. Your message has been sent. A person will read it and reply if needed.']].forEach(function(cfg){
    var f=document.getElementById(cfg[0]);if(!f)return;
    var t0=Date.now(),msg=f.querySelector('.pf-msg'),cs=f.querySelector('[name=country]');
    if(cs)cs.innerHTML=countryOpts('Country (optional)');
    f.addEventListener('submit',function(e){e.preventDefault();msg.textContent='Sending.';
      var b={t:t0,first:f.first.value,last:f.last.value,email:f.email.value,country:cs?cs.value:'',consent:f.consent.checked,website:f.website.value};
      if(f.message){b.message=f.message.value;b.topic=f.topic.value;b.alsoSubscribe=!!(f.also&&f.also.checked)}
      post(cfg[1],b).then(function(x){if(x[0]&&x[1].ok){f.innerHTML='<p class="lead">'+cfg[2]+'</p>'}else{msg.textContent=x[1].error||'That did not go through. Please try again.'}}).catch(function(){msg.textContent='That did not go through. Please try again.'})});
  });

  /* ---- private manager ---- */
  var root=document.getElementById('pp-root');if(!root)return;
  var key=document.getElementById('pp-key'),msg=document.getElementById('pp-msg'),kind='subscribers',items=[],KEYS='subkey';
  try{key.value=localStorage.getItem(KEYS)||''}catch(e){}
  var q=document.getElementById('pp-q'),fc=document.getElementById('pp-c'),fs=document.getElementById('pp-s'),box=document.getElementById('pp-list'),sum=document.getElementById('pp-sum');
  function api(path,opt){opt=opt||{};opt.headers=Object.assign({'x-admin-key':key.value.trim()},opt.headers||{});return fetch(path,opt).then(function(r){return r.json().then(function(j){if(!r.ok)throw new Error(j.error||'Error '+r.status);return j})})}
  function load(){msg.textContent='Loading.';try{localStorage.setItem(KEYS,key.value.trim())}catch(e){}
    api('/api/people?kind='+kind).then(function(d){items=d.items||[];msg.textContent='';draw()}).catch(function(e){msg.textContent=e.message;items=[];draw()})}
  function fullName(i){return[i.first,i.last].filter(Boolean).join(' ')}
  function filt(){var s=q.value.trim().toLowerCase(),c=fc.value,st=fs.value;
    return items.filter(function(i){return(!c||(c==='?'?!i.cc:i.cc===c))&&(!st||i.status===st)&&(!s||(i.email+' '+fullName(i)+' '+cname(i.cc)+' '+(i.message||'')).toLowerCase().indexOf(s)>-1)})}
  function draw(){
    var cs={};items.forEach(function(i){var k=i.cc||'?';cs[k]=(cs[k]||0)+1});
    var cur=fc.value;fc.innerHTML='<option value="">All countries</option>'+Object.keys(cs).sort(function(a,b){return cs[b]-cs[a]}).map(function(k){return'<option value="'+k+'">'+(k==='?'?'Unknown':esc(cname(k)))+' ('+cs[k]+')</option>'}).join('');fc.value=cur;
    var sts=kind==='subscribers'?[['active','Active'],['unsubscribed','Unsubscribed']]:[['new','New'],['replied','Replied'],['done','Done'],['spam','Spam']];
    var sc=fs.value;fs.innerHTML='<option value="">All statuses</option>'+sts.map(function(s){return'<option value="'+s[0]+'">'+s[1]+'</option>'}).join('');fs.value=sc;
    var l=filt(),withC=items.filter(function(i){return i.cc}).length;
    sum.textContent=items.length+' '+kind+' · '+withC+' with a country ('+(items.length?Math.round(100*withC/items.length):0)+'%) · showing '+l.length;
    document.getElementById('pp-add').hidden=kind!=='subscribers';
    box.innerHTML=l.length?'<table class="pp"><thead><tr><th>Name</th><th>Email</th><th>Country</th><th>Date</th><th>Status</th>'+(kind==='contacts'?'<th>Topic and message</th>':'')+'<th></th></tr></thead><tbody>'+l.map(function(i){
      return'<tr data-id="'+esc(i.id)+'"><td><input class="pp-f" data-k="first" value="'+esc(i.first)+'" placeholder="First" aria-label="First name"> <input class="pp-f" data-k="last" value="'+esc(i.last)+'" placeholder="Last" aria-label="Last name"></td><td><a href="mailto:'+esc(i.email)+'">'+esc(i.email)+'</a></td><td><select class="pp-f pp-cc" data-k="cc" aria-label="Country">'+countryOpts('Unknown').replace('value="'+(i.cc||'#')+'"','value="'+i.cc+'" selected')+'</select>'+(i.ccSrc?'<span class="small"> '+esc(i.ccSrc)+'</span>':'')+'</td><td class="small">'+esc((i.at||'').slice(0,10))+'</td><td><select class="pp-f" data-k="status" aria-label="Status">'+sts.map(function(s){return'<option value="'+s[0]+'"'+(i.status===s[0]?' selected':'')+'>'+s[1]+'</option>'}).join('')+'</select></td>'+(kind==='contacts'?'<td class="pp-msg"><b>'+esc(i.topic||'')+'</b><br>'+esc(i.message||'')+'</td>':'')+'<td><button type="button" data-a="del">Delete</button></td></tr>'}).join('')+'</tbody></table>':'<p>Nothing to show.</p>'}
  box.addEventListener('change',function(e){var el=e.target.closest('.pp-f');if(!el)return;var tr=el.closest('tr'),f={};f[el.getAttribute('data-k')]=el.value;save(tr.getAttribute('data-id'),f)});
  box.addEventListener('click',function(e){var b=e.target.closest('[data-a=del]');if(!b)return;var tr=b.closest('tr');if(!confirm('Delete this record permanently?'))return;
    api('/api/people',{method:'POST',body:JSON.stringify({action:'delete',id:tr.getAttribute('data-id')})}).then(load).catch(function(er){msg.textContent=er.message})});
  function save(id,f){api('/api/people',{method:'POST',body:JSON.stringify({action:'update',id:id,fields:f})}).then(function(){msg.textContent='Saved.';var it=items.filter(function(x){return x.id===id})[0];if(it){Object.keys(f).forEach(function(k){it[k]=f[k]});if('cc'in f)it.ccSrc=f.cc?'stated':''}setTimeout(function(){msg.textContent=''},1200)}).catch(function(er){msg.textContent=er.message})}
  [q,fc,fs].forEach(function(x){x.addEventListener('input',draw);x.addEventListener('change',draw)});
  [].forEach.call(document.querySelectorAll('[data-kind]'),function(b){b.addEventListener('click',function(){kind=b.getAttribute('data-kind');[].forEach.call(document.querySelectorAll('[data-kind]'),function(x){x.setAttribute('aria-pressed',x===b?'true':'false')});fc.value='';fs.value='';load()})});
  document.getElementById('pp-go').addEventListener('click',load);
  var ac=document.getElementById('pp-ac');ac.innerHTML=countryOpts('Country');
  document.getElementById('pp-addf').addEventListener('submit',function(e){e.preventDefault();var f=e.target;
    api('/api/people',{method:'POST',body:JSON.stringify({action:'add',email:f.email.value,first:f.first.value,last:f.last.value,cc:f.cc.value})}).then(function(){f.reset();load()}).catch(function(er){msg.textContent=er.message})});
  document.getElementById('pp-csv').addEventListener('click',function(){
    var cols=kind==='subscribers'?['email','first','last','country','countrySource','status','date','source']:['email','first','last','country','countrySource','status','date','topic','message'];
    var rows=filt().map(function(i){var r={email:i.email,first:i.first,last:i.last,country:cname(i.cc),countrySource:i.ccSrc,status:i.status,date:(i.at||'').slice(0,10),source:i.src,topic:i.topic,message:i.message};return cols.map(function(c){return'"'+String(r[c]==null?'':r[c]).replace(/"/g,'""')+'"'}).join(',')});
    var blob=new Blob(['﻿'+cols.join(',')+'\n'+rows.join('\n')],{type:'text/csv'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=kind+'-'+new Date().toISOString().slice(0,10)+'.csv';document.body.appendChild(a);a.click();a.remove()});
  if(key.value)load();
})();
