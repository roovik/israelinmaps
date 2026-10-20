(function(){
  var sel=document.getElementById('ae-ent');if(!sel)return;
  var KEY='admentry1',S={};try{S=JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function plain(h){var d=document.createElement('div');d.innerHTML=h||'';return(d.textContent||'').trim()}
  var B=[],cur='',tab='text',lastImgs=[];
  function rec(){return S[cur]=S[cur]||{}}
  function mark(en){var r=S[en.slug]||{},n=0;Object.keys(r.imgs||{}).forEach(function(k){if(r.imgs[k].s==='yes')n++});return(r.text&&r.text.done?'T':'')+(n?' I'+n:'')+(r.vid?' V':'')}
  function fillSel(){var v=sel.value;sel.innerHTML='<option value="">Choose a term</option>';B.forEach(function(b){var g=document.createElement('optgroup');g.label=b.name;b.entries.forEach(function(en){var o=document.createElement('option'),m=mark(en);o.value=en.slug;o.textContent=en.title+(m?'  ['+m+']':'');g.appendChild(o)});sel.appendChild(g)});sel.value=v}
  fetch('/admin/batches.json').then(function(r){return r.json()}).then(function(b){B=b;fillSel();var q=new URLSearchParams(location.search).get('e');if(q){sel.value=q;pick()}});
  function title(){var o=sel.options[sel.selectedIndex];return o?o.textContent.replace(/\s+\[.*\]$/,''):''}
  var pane=document.getElementById('ae-pane'),tabs=document.getElementById('ae-tabs'),pv=document.getElementById('ae-prev');
  function pick(){cur=sel.value;document.getElementById('ae-open').href=cur?'/g/'+cur+'/':'#';document.getElementById('ae-open').hidden=!cur;go()}
  sel.addEventListener('change',pick);
  tabs.addEventListener('click',function(e){var b=e.target.closest('button[data-t]');if(!b)return;tab=b.getAttribute('data-t');[].forEach.call(tabs.querySelectorAll('button'),function(x){x.setAttribute('aria-pressed',x===b?'true':'false')});go()});
  function go(){if(!cur){pane.innerHTML='<p>Choose a term above.</p>';return}if(tab==='text')textTab();else if(tab==='images')imgTab();else vidTab()}
  /* ---------- text ---------- */
  function wikiTitle(){var r=rec();return(r.text&&r.text.title)||title()}
  function textTab(){var r=rec(),t=r.text||{};
    pane.innerHTML='<div class="admbar"><label>Wikipedia article <input id="ae-wt" value="'+esc(wikiTitle())+'" size="30"></label><button type="button" class="admgo" id="ae-load">Load from Wikipedia</button><span class="small" id="ae-ws"></span></div>'+
    '<div class="ae2"><div><h3>Your version</h3><textarea id="ae-tx" rows="16">'+esc(t.txt||'')+'</textarea><p class="small">Separate paragraphs with a blank line. Your edits stay in this browser until you export them.</p><p><label><input type="checkbox" id="ae-done"'+(t.done?' checked':'')+'> Text is finished</label> <button type="button" class="admgo" id="ae-rev">Revert to Wikipedia</button></p></div><div><h3>Preview</h3><div id="ae-pv" class="aepv"></div></div></div>';
    var tx=document.getElementById('ae-tx');function pvw(){var rr=rec().text||{},ps=tx.value.split(/\n{2,}/).filter(Boolean);document.getElementById('ae-pv').innerHTML=(ps.map(function(p){return'<p>'+esc(p)+'</p>'}).join('')||'<p class="small">Nothing yet.</p>')+(rr.rev?'<p class="small">Adapted from <a href="'+esc(rr.url||'https://en.wikipedia.org/wiki/'+encodeURIComponent(rr.title||''))+'" target="_blank" rel="noopener">Wikipedia</a> (revision '+esc(rr.rev)+'), licensed <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener">CC BY-SA 4.0</a>. Edited by Israel NOWlej.</p>':'')}
    tx.addEventListener('input',function(){var x=rec();x.text=x.text||{};x.text.txt=tx.value;save();pvw()});
    document.getElementById('ae-done').addEventListener('change',function(e){var x=rec();x.text=x.text||{};x.text.done=e.target.checked;save();fillSel()});
    function load(){var tt=document.getElementById('ae-wt').value.trim(),st=document.getElementById('ae-ws');st.textContent='Loading.';
      fetch('https://en.wikipedia.org/w/api.php?action=query&prop=extracts|revisions|info&exintro=1&explaintext=1&rvprop=ids|timestamp&inprop=url&redirects=1&format=json&origin=*&titles='+encodeURIComponent(tt)).then(function(r){return r.json()}).then(function(d){
        var p=d.query&&d.query.pages&&Object.keys(d.query.pages).map(function(k){return d.query.pages[k]})[0];if(!p||p.missing!==undefined){st.textContent='No article by that name.';return}
        var x=rec();x.text=x.text||{};x.text.title=p.title;x.text.rev=p.revisions&&p.revisions[0].revid;x.text.url=p.fullurl;x.text.orig=p.extract||'';x.text.txt=p.extract||'';save();st.textContent='Loaded "'+p.title+'".';tx.value=x.text.txt;pvw()}).catch(function(){st.textContent='Could not reach Wikipedia.'})}
    document.getElementById('ae-load').addEventListener('click',load);
    document.getElementById('ae-rev').addEventListener('click',function(){var x=rec();if(x.text&&x.text.orig!=null){x.text.txt=x.text.orig;save();tx.value=x.text.txt;pvw()}});
    pvw();if(!t.txt)load()}
  /* ---------- images ---------- */
  function lic(m){var l=(m.LicenseShortName&&m.LicenseShortName.value)||'',f=[];if(!l)f.push('License not stated');else if(/ND/i.test(l))f.push('No derivatives');else if(!/CC|public domain|PD|CC0/i.test(l))f.push('Check license');if(m.NonFree&&m.NonFree.value)f.push('Non-free');return{l:l||'unknown',f:f}}
  function imgTab(){var q=title()+(/^(Israel|Iran|Gaza)$/.test(title())?'':' ');
    pane.innerHTML='<div class="admbar"><label>Search Wikimedia Commons <input id="ae-iq" value="'+esc(title())+'" size="30"></label><button type="button" class="admgo" id="ae-ig">Search</button><span class="small" id="ae-is"></span></div><div id="ae-ig2" class="aeimgs"></div>';
    function run(){var st=document.getElementById('ae-is');st.textContent='Searching.';
      fetch('https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrlimit=30&gsrsearch='+encodeURIComponent(document.getElementById('ae-iq').value+' filetype:bitmap')+'&prop=imageinfo&iiprop=url|size|extmetadata|mime&iiurlwidth=320&format=json&origin=*').then(function(r){return r.json()}).then(function(d){
        var ps=d.query?Object.keys(d.query.pages).map(function(k){return d.query.pages[k]}):[];lastImgs=ps.filter(function(p){return p.imageinfo}).sort(function(a,b){return a.index-b.index});st.textContent=lastImgs.length+' images.';draw()}).catch(function(){st.textContent='Could not reach Commons.'})}
    function draw(){var r=rec().imgs||{},h='';lastImgs.forEach(function(p){var i=p.imageinfo[0],m=i.extmetadata||{},L=lic(m),k=p.title,s=(r[k]||{}).s||'',au=plain(m.Artist&&m.Artist.value)||'unknown';
      h+='<figure class="aeimg" data-k="'+esc(k)+'" data-s="'+esc(s)+'"><a href="#" class="aeo" data-u="'+esc(i.url)+'"><img src="'+esc(i.thumburl)+'" alt="" loading="lazy"></a><figcaption><b>'+esc(k.replace(/^File:/,'').slice(0,60))+'</b><span class="small">'+esc(au.slice(0,60))+' · '+esc(L.l)+' · '+i.width+'×'+i.height+'</span>'+(L.f.length?'<span class="aflag">'+esc(L.f.join(' · '))+'</span>':'')+'<span class="abtn"><button type="button" data-a="yes" aria-pressed="'+(s==='yes')+'">Approve</button><button type="button" data-a="no" aria-pressed="'+(s==='no')+'">Reject</button></span></figcaption></figure>'});
      document.getElementById('ae-ig2').innerHTML=h||'<p>No results.</p>'}
    document.getElementById('ae-ig').addEventListener('click',run);document.getElementById('ae-iq').addEventListener('keydown',function(e){if(e.key==='Enter')run()});
    document.getElementById('ae-ig2').addEventListener('click',function(e){var o=e.target.closest('a.aeo');if(o){e.preventDefault();var f=o.closest('.aeimg'),cap=f.querySelector('figcaption').innerText;var ov=document.getElementById('ae-lb');ov.innerHTML='<div class="aelb"><button type="button" id="ae-lbx">Close</button><img src="'+esc(o.getAttribute('data-u'))+'" alt=""><p>'+esc(cap)+'</p></div>';ov.hidden=false;return}
      var b=e.target.closest('button[data-a]');if(!b)return;var f2=b.closest('.aeimg'),k=f2.getAttribute('data-k'),p=lastImgs.filter(function(x){return x.title===k})[0],i=p.imageinfo[0],m=i.extmetadata||{},x=rec();x.imgs=x.imgs||{};x.imgs[k]={s:b.getAttribute('data-a'),url:i.url,thumb:i.thumburl,page:i.descriptionurl,author:plain(m.Artist&&m.Artist.value),license:(m.LicenseShortName||{}).value||'',licurl:(m.LicenseUrl||{}).value||''};save();draw();fillSel()});
    run()}
  document.addEventListener('click',function(e){if(e.target.id==='ae-lbx'||e.target.id==='ae-lb'){document.getElementById('ae-lb').hidden=true}});
  /* ---------- video ---------- */
  function vidTab(){var pins=[];try{var V=JSON.parse(localStorage.getItem('admvid1')||'{}');Object.keys(V).forEach(function(id){if(V[id].e===cur&&V[id].s==='yes')pins.push({id:id,t:V[id].n||V[id].t})})}catch(e){}
    var r=rec();r.vid=pins.length?1:0;
    pane.innerHTML='<p><a class="admgo adl" href="/admin/video/?e='+encodeURIComponent(cur)+'">Search and approve videos for this term</a></p>'+(pins.length?'<h3>Approved videos</h3><div class="aeimgs">'+pins.map(function(p){return'<figure class="aeimg"><iframe class="aplay" src="https://www.youtube-nocookie.com/embed/'+esc(p.id)+'?rel=0" allowfullscreen></iframe><figcaption><b>'+esc(p.t)+'</b></figcaption></figure>'}).join('')+'</div>':'<p>No approved videos yet.</p>')}
  /* ---------- export ---------- */
  document.getElementById('ae-exp').addEventListener('click',function(){var out={text:{},images:{}};
    Object.keys(S).forEach(function(sl){var r=S[sl];if(r.text&&r.text.done)out.text[sl]={wiki:r.text.title,rev:r.text.rev,url:r.text.url,text:r.text.txt,edited:r.text.txt!==r.text.orig};
      var im=Object.keys(r.imgs||{}).filter(function(k){return r.imgs[k].s==='yes'}).map(function(k){var v=r.imgs[k];return{file:k,url:v.url,page:v.page,author:v.author,license:v.license,licurl:v.licurl}});if(im.length)out.images[sl]=im});
    document.getElementById('ae-ta').value=JSON.stringify(out,null,1);document.getElementById('ae-out').hidden=false});
  document.getElementById('ae-copy').addEventListener('click',function(){var t=document.getElementById('ae-ta');t.select();try{document.execCommand('copy')}catch(e){}});
})();
