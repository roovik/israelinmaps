(function(){
  var sel=document.getElementById('ae-ent');if(!sel)return;
  var KEY='admentry2',S={};try{S=JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
  try{var O=JSON.parse(localStorage.getItem('admentry1')||'{}');Object.keys(O).forEach(function(sl){var o=O[sl],n=S[sl]=S[sl]||{};
    if(o.text&&!n.text){n.text=o.text}
    if(o.imgs&&!n.imgc){var ks=Object.keys(o.imgs).filter(function(k){return o.imgs[k].s==='yes'});if(ks.length){n.imgc=ks.map(function(k){var v=o.imgs[k];return{id:k,url:v.url,thumb:v.thumb,page:v.page,w:'',h:'',author:v.author||'unknown',license:v.license||'',licurl:v.licurl||'',flags:[]}});n.imgRej={};n.imgDone=true}}});save()}catch(e){}
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function plain(h){var d=document.createElement('div');d.innerHTML=h||'';return(d.textContent||'').trim()}
  function num(n){return n==null?'hidden':n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e3?Math.round(n/1e3)+'K':String(n)}
  function paras(t){return String(t||'').replace(/\r/g,'').split(/\n+/).map(function(x){return x.trim()}).filter(Boolean)}
  function dbl(t){return paras(t).join('\n\n')}
  var B=[],BY={},cur='',tab='text',RULES={blockWords:[],minSubs:5000,orgs:[]};
  var RK='admrules1',RS={};try{RS=JSON.parse(localStorage.getItem(RK)||'{}')}catch(e){}
  fetch('/admin/rules.json').then(function(r){return r.json()}).then(function(d){RULES=d;for(var k in RS)RULES[k]=RS[k]}).catch(function(){});
  function saveRules(){try{localStorage.setItem(RK,JSON.stringify(RS))}catch(e){}}
  function isOrg(ch){var n=((ch&&ch.name)||'').toLowerCase();return(RULES.orgs||[]).some(function(o){return o&&n.indexOf(o.toLowerCase())>-1})}
  function blocked(c){var t=(c.name+' '+(c.desc||'')+' '+((c.channel&&c.channel.name)||'')).toLowerCase();for(var i=0;i<(RULES.blockWords||[]).length;i++){var w=RULES.blockWords[i].toLowerCase().trim();if(w&&new RegExp('(^|[^a-z])'+w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'([^a-z]|$)').test(t))return'Contains "'+w+'"'}return''}
  function ruleHit(c,kind){var b=blocked(c);if(b)return b;var ch=c.channel||{};
    if(kind==='p'&&!isOrg(ch))return'Publisher is not a recognized organization';
    if(kind==='v'&&!isOrg(ch)&&ch.subs!=null&&ch.subs<(RULES.minSubs||0))return'Small channel (under '+(RULES.minSubs||0)+' subscribers)';return''}
  function mv(ord,id,d){var i=ord.indexOf(id);if(i<0)return;var j=i+d;if(j<0||j>=ord.length)return;var t=ord[i];ord[i]=ord[j];ord[j]=t}
  function sortBy(arr,ord){ord=ord||[];return arr.slice().sort(function(a,b){var x=ord.indexOf(a.id),y=ord.indexOf(b.id);x=x<0?9999:x;y=y<0?9999:y;return x-y})}
  function rec(){return S[cur]=S[cur]||{}}
  function nin(arr,rej){return(arr||[]).filter(function(x){return!(rej||{})[x.id]}).length}
  function mark(en){var r=S[en.slug]||{},m=[];if(r.gloss&&r.gloss.done)m.push('G');if(r.text&&r.text.done)m.push('W');if(r.imgDone)m.push('I');if(r.vidDone)m.push('V');return m.join('')}
  function fillSel(){var v=sel.value;sel.innerHTML='<option value="">Choose a term</option>';B.forEach(function(b){var g=document.createElement('optgroup');g.label=b.name;b.entries.forEach(function(en){var o=document.createElement('option'),m=mark(en);o.value=en.slug;o.textContent=en.title+(m?'  ['+m+']':'');g.appendChild(o)});sel.appendChild(g)});sel.value=v}
  fetch('/admin/batches.json').then(function(r){return r.json()}).then(function(b){B=b;b.forEach(function(x){x.entries.forEach(function(en){BY[en.slug]=en})});fillSel();var q=new URLSearchParams(location.search).get('e');if(q){sel.value=q;pick()}});
  function title(){return BY[cur]?BY[cur].title:''}
  var pane=document.getElementById('ae-pane'),tabs=document.getElementById('ae-tabs');
  function pick(){cur=sel.value;var o=document.getElementById('ae-open');o.href=cur?'/g/'+cur+'/':'#';o.hidden=!cur;go()}
  sel.addEventListener('change',pick);
  tabs.addEventListener('click',function(e){var b=e.target.closest('button[data-t]');if(!b)return;tab=b.getAttribute('data-t');[].forEach.call(tabs.querySelectorAll('button'),function(x){x.setAttribute('aria-pressed',x===b?'true':'false')});go()});
  function go(){if(!cur){pane.innerHTML='<p>Choose a term above.</p>';return}if(tab==='text')textTab();else if(tab==='images')imgTab();else vidTab()}
  function yt(kind,q){return fetch('/api/videos?review='+kind+'&q='+encodeURIComponent(q)).then(function(r){return r.json()})}
  /* ---------- text: two windows ---------- */
  function pvHtml(t){return paras(t).map(function(p){return'<p>'+esc(p)+'</p>'}).join('')||'<p class="small">Nothing yet.</p>'}
  function textTab(){var r=rec(),g=r.gloss=r.gloss||{txt:BY[cur].text,orig:BY[cur].text},t=r.text||{};if(g.txt==null)g.txt=BY[cur].text;
    pane.innerHTML='<div class="ae2"><section class="aewin"><h3>1. Book glossary text</h3><p class="small">The entry as it appears in the book. Edit it here.</p><textarea id="ae-gx" rows="12">'+esc(dbl(g.txt))+'</textarea><p><label><input type="checkbox" id="ae-gd"'+(g.done?' checked':'')+'> Finished</label> <button type="button" class="admgo" id="ae-gr">Revert</button></p></section>'+
    '<section class="aewin"><h3>2. Wikipedia text</h3><div class="admbar"><label>Article <input id="ae-wt" value="'+esc((t.title)||title())+'" size="22"></label><button type="button" class="admgo" id="ae-load">Load</button><span class="small" id="ae-ws"></span></div><textarea id="ae-tx" rows="12">'+esc(dbl(t.txt||''))+'</textarea><p><label><input type="checkbox" id="ae-done"'+(t.done?' checked':'')+'> Finished</label> <button type="button" class="admgo" id="ae-rev">Revert to Wikipedia</button></p></section></div>'+
    '<h3>Preview</h3><div class="ae2"><div class="aepv" id="ae-gp"></div><div class="aepv" id="ae-pv"></div></div>';
    var gx=document.getElementById('ae-gx'),tx=document.getElementById('ae-tx');
    function pvw(){document.getElementById('ae-gp').innerHTML=pvHtml(gx.value);var rr=rec().text||{};document.getElementById('ae-pv').innerHTML=pvHtml(tx.value)+(rr.rev?'<p class="small">Adapted from <a href="'+esc(rr.url||'#')+'" target="_blank" rel="noopener">Wikipedia</a> (revision '+esc(rr.rev)+'), licensed <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener">CC BY-SA 4.0</a>. Edited by Israel NOWlej.</p>':'')}
    gx.addEventListener('input',function(){rec().gloss.txt=gx.value;save();pvw()});
    document.getElementById('ae-gd').addEventListener('change',function(e){rec().gloss.done=e.target.checked;save();fillSel()});
    document.getElementById('ae-gr').addEventListener('click',function(){rec().gloss.txt=BY[cur].text;save();gx.value=dbl(BY[cur].text);pvw()});
    tx.addEventListener('input',function(){var x=rec();x.text=x.text||{};x.text.txt=tx.value;save();pvw()});
    document.getElementById('ae-done').addEventListener('change',function(e){var x=rec();x.text=x.text||{};x.text.done=e.target.checked;save();fillSel()});
    function load(){var tt=document.getElementById('ae-wt').value.trim(),st=document.getElementById('ae-ws');st.textContent='Loading.';
      fetch('https://en.wikipedia.org/w/api.php?action=query&prop=extracts|revisions|info&exintro=1&explaintext=1&rvprop=ids|timestamp&inprop=url&redirects=1&format=json&origin=*&titles='+encodeURIComponent(tt)).then(function(r){return r.json()}).then(function(d){
        var p=d.query&&d.query.pages&&Object.keys(d.query.pages).map(function(k){return d.query.pages[k]})[0];if(!p||p.missing!==undefined){st.textContent='No article by that name.';return}
        var x=rec();x.text=x.text||{};x.text.title=p.title;x.text.rev=p.revisions&&p.revisions[0].revid;x.text.url=p.fullurl;x.text.orig=dbl(p.extract||'');x.text.txt=x.text.orig;save();st.textContent='Loaded "'+p.title+'".';tx.value=x.text.txt;pvw()}).catch(function(){st.textContent='Could not reach Wikipedia.'})}
    document.getElementById('ae-load').addEventListener('click',load);
    document.getElementById('ae-rev').addEventListener('click',function(){var x=rec();if(x.text&&x.text.orig!=null){x.text.txt=x.text.orig;save();tx.value=x.text.txt;pvw()}});
    pvw();if(!t.txt)load()}
  /* ---------- images: all in, reject the bad ---------- */
  function lic(m){var l=(m.LicenseShortName&&m.LicenseShortName.value)||'',f=[];if(!l)f.push('License not stated');else if(/ND/i.test(l))f.push('No derivatives');else if(!/CC|public domain|PD|CC0/i.test(l))f.push('Check license');if(m.NonFree&&m.NonFree.value)f.push('Non-free');return{l:l||'unknown',f:f}}
  function imgTab(){var r=rec();
    pane.innerHTML='<div class="admbar"><label>Search Wikimedia Commons <input id="ae-iq" value="'+esc(r.imgQ||title())+'" size="28"></label><button type="button" class="admgo" id="ae-ig">Search</button><span class="small" id="ae-is"></span></div><p class="small">Every image is in unless you reject it. <label><input type="checkbox" id="ae-idn"'+(r.imgDone?' checked':'')+'> Images reviewed for this term</label></p><div id="ae-ig2" class="aeimgs"></div>';
    function run(){var st=document.getElementById('ae-is');st.textContent='Searching.';var q=document.getElementById('ae-iq').value;
      fetch('https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrlimit=30&gsrsearch='+encodeURIComponent(q+' filetype:bitmap')+'&prop=imageinfo&iiprop=url|size|extmetadata|mime&iiurlwidth=320&format=json&origin=*').then(function(r){return r.json()}).then(function(d){
        var ps=d.query?Object.keys(d.query.pages).map(function(k){return d.query.pages[k]}):[];ps=ps.filter(function(p){return p.imageinfo}).sort(function(a,b){return a.index-b.index});
        var x=rec();x.imgQ=q;x.imgc=ps.map(function(p){var i=p.imageinfo[0],m=i.extmetadata||{},L=lic(m);return{id:p.title,url:i.url,thumb:i.thumburl,page:i.descriptionurl,w:i.width,h:i.height,author:plain(m.Artist&&m.Artist.value)||'unknown',license:L.l,licurl:(m.LicenseUrl||{}).value||'',flags:L.f}});x.imgRej={};save();st.textContent=x.imgc.length+' images.';draw()}).catch(function(){st.textContent='Could not reach Commons.'})}
    function draw(){var x=rec(),rej=x.imgRej||{},h='';(x.imgc||[]).forEach(function(c){var no=rej[c.id];
      h+='<figure class="aeimg" data-k="'+esc(c.id)+'" data-s="'+(no?'no':'yes')+'"><a href="#" class="aeo" data-u="'+esc(c.url)+'"><img src="'+esc(c.thumb)+'" alt="" loading="lazy"></a><figcaption><b>'+esc(c.id.replace(/^File:/,'').slice(0,60))+'</b><span class="small">'+esc(c.author.slice(0,60))+' · '+esc(c.license)+' · '+c.w+'×'+c.h+'</span>'+(c.flags.length?'<span class="aflag">'+esc(c.flags.join(' · '))+'</span>':'')+'<span class="abtn"><button type="button" data-a="no" aria-pressed="'+(!!no)+'">'+(no?'Rejected (undo)':'Reject')+'</button>'+(no?'':[1,2,3].map(function(n){return'<button type="button" data-rk="'+n+'" aria-pressed="'+((x.imgRank||{})[c.id]===n)+'">'+['Main','2nd','3rd'][n-1]+'</button>'}).join(''))+'</span></figcaption></figure>'});
      document.getElementById('ae-ig2').innerHTML=h||'<p>No results yet. Press Search.</p>'}
    document.getElementById('ae-ig').addEventListener('click',run);document.getElementById('ae-iq').addEventListener('keydown',function(e){if(e.key==='Enter')run()});
    document.getElementById('ae-idn').addEventListener('change',function(e){rec().imgDone=e.target.checked;save();fillSel()});
    document.getElementById('ae-ig2').addEventListener('click',function(e){var o=e.target.closest('a.aeo');if(o){e.preventDefault();var cap=o.closest('.aeimg').querySelector('figcaption').innerText;var ov=document.getElementById('ae-lb');ov.innerHTML='<div class="aelb"><button type="button" id="ae-lbx">Close</button><img src="'+esc(o.getAttribute('data-u'))+'" alt=""><p>'+esc(cap)+'</p></div>';ov.hidden=false;return}
      var rb=e.target.closest('button[data-rk]');if(rb){var k2=rb.closest('.aeimg').getAttribute('data-k'),n=+rb.getAttribute('data-rk'),x2=rec();x2.imgRank=x2.imgRank||{};if(x2.imgRank[k2]===n)delete x2.imgRank[k2];else{Object.keys(x2.imgRank).forEach(function(q){if(x2.imgRank[q]===n)delete x2.imgRank[q]});x2.imgRank[k2]=n}save();draw();return}
      var b=e.target.closest('button[data-a]');if(!b)return;var k=b.closest('.aeimg').getAttribute('data-k'),x=rec();x.imgRej=x.imgRej||{};if(x.imgRej[k])delete x.imgRej[k];else x.imgRej[k]=1;save();draw()});
    if(r.imgc&&r.imgc.length)draw();else run()}
  document.addEventListener('click',function(e){if(e.target.id==='ae-lbx'||e.target.id==='ae-lb'){document.getElementById('ae-lb').hidden=true}});
  /* ---------- video: search results page ---------- */
  function chBlock(ch){if(!ch)return'';var f=[],y=ch.created?((Date.now()-new Date(ch.created))/(365.25*864e5)):0;
    if(y&&y<2)f.push('Channel under 2 years old');if(ch.subs!=null&&ch.subs<5000)f.push('Under 5K subscribers');if(!ch.desc)f.push('No description');
    return'<div class="prov"><b>'+esc(ch.name)+'</b> <span class="small">'+esc(ch.handle||'')+' · '+num(ch.subs)+' subscribers · '+(ch.videos||0)+' videos · since '+(ch.created||'').slice(0,4)+'</span>'+(ch.desc?'<p class="small adesc">'+esc(ch.desc.slice(0,160))+'</p>':'')+(f.length?'<p class="aflag">'+f.map(esc).join(' · ')+'</p>':'')+'</div>'}
  function vidTab(){var r=rec(),showH=false;
    pane.innerHTML='<div class="admbar"><label>YouTube search <input id="ae-vq" value="'+esc(r.vidQ||(title()+' Israel'))+'" size="30"></label><button type="button" class="admgo" id="ae-vg">Search</button><span class="small" id="ae-vs"></span></div>'+
    '<details class="aerules"><summary>Filter rules</summary><label>Blocked words, comma separated<textarea id="ru-w" rows="3">'+esc((RULES.blockWords||[]).join(', '))+'</textarea></label><label>Recognized organizations, one per line (playlists are accepted only from these)<textarea id="ru-o" rows="6">'+esc((RULES.orgs||[]).join('\n'))+'</textarea></label><label>Hide videos from channels under this many subscribers (unless a recognized organization) <input id="ru-m" type="number" value="'+(RULES.minSubs||0)+'" style="width:90px"></label><p class="small">Saved in this browser. Include the lists in your export so Claude can make them permanent.</p></details>'+
    '<p class="small">Every result that passes the rules is in unless you reject it. Aim for about 9 good videos. Use the arrows to put them in order. <label><input type="checkbox" id="ae-vdn"'+(r.vidDone?' checked':'')+'> Video reviewed for this term</label> <label><input type="checkbox" id="ae-sh"> Show hidden</label> <b id="ae-vc"></b></p><h3>Videos</h3><div id="ae-vl"></div><h3>Playlists</h3><div id="ae-pl"></div>';
    function readRules(){RULES.blockWords=document.getElementById('ru-w').value.split(',').map(function(x){return x.trim()}).filter(Boolean);RULES.orgs=document.getElementById('ru-o').value.split('\n').map(function(x){return x.trim()}).filter(Boolean);RULES.minSubs=+document.getElementById('ru-m').value||0;RS={blockWords:RULES.blockWords,orgs:RULES.orgs,minSubs:RULES.minSubs};saveRules();draw()}
    ['ru-w','ru-o','ru-m'].forEach(function(id){document.getElementById(id).addEventListener('change',readRules)});
    document.getElementById('ae-sh').addEventListener('change',function(e){showH=e.target.checked;draw()});
    function run(){var st=document.getElementById('ae-vs'),q=document.getElementById('ae-vq').value;st.textContent='Searching.';
      Promise.all([yt('videos',q),yt('playlists',q)]).then(function(a){if(a[0].error){st.textContent=a[0].error;return}var x=rec();x.vidQ=q;x.vidc=(a[0].candidates||[]).map(function(c){return{id:c.id,name:c.name,desc:c.desc,published:c.published,views:c.views,dur:c.dur,trusted:c.trusted,channel:c.channel}});
        x.plc=(a[1].candidates||[]).map(function(c){return{id:c.id,name:c.name,desc:c.desc,items:c.items,created:c.created,channel:c.channel}});x.vidRej={};x.vidOrd=[];x.plOrd=[];save();st.textContent='';draw()}).catch(function(){st.textContent='Could not search right now.'})}
    function btns(id,no,kind){return'<span class="abtn"><button type="button" data-a="no" data-k="'+kind+'" aria-pressed="'+(!!no)+'">'+(no?'Rejected (undo)':'Reject')+'</button>'+(no?'':'<button type="button" data-mv="-1" data-k="'+kind+'" aria-label="Move up">▲</button><button type="button" data-mv="1" data-k="'+kind+'" aria-label="Move down">▼</button>')+'</span>'}
    function draw(){var x=rec(),rej=x.vidRej||{},h='',hid=0,hp=0,nV=0,nP=0;
      var vs=sortBy(x.vidc||[],x.vidOrd);x.vidOrd=vs.map(function(c){return c.id});
      vs.forEach(function(c){var why=ruleHit(c,'v');if(why&&!showH){hid++;return}var no=rej[c.id]||!!why,mm=(c.dur||'').match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/),len=mm?((+mm[1]||0)*60+(+mm[2]||0))+':'+('0'+(+mm[3]||0)).slice(-2):'';if(!no)nV++;
        h+='<article class="acard" data-id="'+esc(c.id)+'" data-s="'+(no?'no':'yes')+'"><div class="avid"><a class="athumb" href="#" data-v="'+esc(c.id)+'"><img src="https://i.ytimg.com/vi/'+esc(c.id)+'/mqdefault.jpg" alt="" loading="lazy"><span class="vplay">▶</span></a><div><b>'+(no?'':'<span class="anum">'+nV+'</span> ')+esc(c.name)+'</b><p class="small">'+num(c.views)+' views · '+len+' · '+(c.published||'').slice(0,10)+(c.trusted||isOrg(c.channel)?' · <b>Recognized publisher</b>':'')+'</p>'+(why?'<p class="aflag">Hidden by rule: '+esc(why)+'</p>':'')+chBlock(c.channel)+(why?'':btns(c.id,no,'v'))+'</div></div></article>'});
      document.getElementById('ae-vl').innerHTML=h||'<p>No results to show. Press Search.</p>';
      var ps=sortBy(x.plc||[],x.plOrd),p='';x.plOrd=ps.map(function(c){return c.id});
      ps.forEach(function(c){var why=ruleHit(c,'p');if(why&&!showH){hp++;return}var no=rej[c.id]||!!why;if(!no)nP++;
        p+='<article class="acard" data-id="'+esc(c.id)+'" data-s="'+(no?'no':'yes')+'"><b>'+(no?'':'<span class="anum">'+nP+'</span> ')+esc(c.name)+'</b><p class="small">Playlist · '+c.items+' videos · '+(c.created||'').slice(0,4)+' · <a href="https://www.youtube.com/playlist?list='+esc(c.id)+'" target="_blank" rel="noopener">Open on YouTube</a></p>'+(why?'<p class="aflag">Hidden by rule: '+esc(why)+'</p>':'')+chBlock(c.channel)+(why?'':btns(c.id,no,'p'))+'</article>'});
      document.getElementById('ae-pl').innerHTML=p||'<p>No playlists from recognized organizations.</p>';save();
      document.getElementById('ae-vc').textContent=nV+' videos in, '+nP+' playlists in. Hidden by rules: '+hid+' videos, '+hp+' playlists.'}
    document.getElementById('ae-vg').addEventListener('click',run);document.getElementById('ae-vq').addEventListener('keydown',function(e){if(e.key==='Enter')run()});
    document.getElementById('ae-vdn').addEventListener('change',function(e){rec().vidDone=e.target.checked;save();fillSel()});
    pane.onclick=function(e){var a=e.target.closest('a.athumb');if(a){e.preventDefault();a.outerHTML='<iframe class="aplay" src="https://www.youtube-nocookie.com/embed/'+encodeURIComponent(a.getAttribute('data-v'))+'?rel=0&autoplay=1" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>';return}
      var m=e.target.closest('button[data-mv]');if(m){var x=rec(),id=m.closest('.acard').getAttribute('data-id'),k=m.getAttribute('data-k'),rej=x.vidRej||{},arr=k==='v'?x.vidc:x.plc,ord=k==='v'?x.vidOrd:x.plOrd;
        var vis=ord.filter(function(i){var c=arr.filter(function(z){return z.id===i})[0];return c&&!rej[i]&&!ruleHit(c,k)}),pos=vis.indexOf(id),d=+m.getAttribute('data-mv'),other=vis[pos+d];
        if(other){var i1=ord.indexOf(id),i2=ord.indexOf(other);ord[i1]=other;ord[i2]=id;save();draw()}return}
      var b=e.target.closest('button[data-a]');if(!b||tab!=='video')return;var id2=b.closest('.acard').getAttribute('data-id'),x2=rec();x2.vidRej=x2.vidRej||{};if(x2.vidRej[id2])delete x2.vidRej[id2];else x2.vidRej[id2]=1;save();draw()};
    if(r.vidc&&r.vidc.length)draw();else run()}
  /* ---------- export ---------- */
  document.getElementById('ae-exp').addEventListener('click',function(){var out={glossary:{},wikipedia:{},images:{},videos:{},playlists:{},rules:{blockWords:RULES.blockWords,orgs:RULES.orgs,minSubs:RULES.minSubs}};
    Object.keys(S).forEach(function(sl){var r=S[sl];
      if(r.gloss&&r.gloss.done&&BY[sl])out.glossary[sl]={text:dbl(r.gloss.txt),edited:dbl(r.gloss.txt)!==dbl(BY[sl].text)};
      if(r.text&&r.text.done)out.wikipedia[sl]={article:r.text.title,rev:r.text.rev,url:r.text.url,text:dbl(r.text.txt),edited:dbl(r.text.txt)!==dbl(r.text.orig)};
      if(r.imgDone){var rk=r.imgRank||{},im=(r.imgc||[]).filter(function(c){return!(r.imgRej||{})[c.id]}).sort(function(a,b){return(rk[a.id]||9)-(rk[b.id]||9)}).map(function(c){return{file:c.id,url:c.url,page:c.page,author:c.author,license:c.license,licurl:c.licurl}});if(im.length)out.images[sl]=im}
      if(r.vidDone){var v=sortBy(r.vidc||[],r.vidOrd).filter(function(c){return!(r.vidRej||{})[c.id]&&!ruleHit(c,'v')}).map(function(c){return{v:c.id,t:c.name,channel:c.channel&&c.channel.name}});if(v.length)out.videos[sl]=v;
        var pl=sortBy(r.plc||[],r.plOrd).filter(function(c){return!(r.vidRej||{})[c.id]&&!ruleHit(c,'p')}).map(function(c){return{id:c.id,name:c.name,channel:c.channel&&c.channel.name}});if(pl.length)out.playlists[sl]=pl}});
    document.getElementById('ae-ta').value=JSON.stringify(out,null,1);document.getElementById('ae-out').hidden=false});
  document.getElementById('ae-copy').addEventListener('click',function(){var t=document.getElementById('ae-ta');t.select();try{document.execCommand('copy')}catch(e){}});
})();
