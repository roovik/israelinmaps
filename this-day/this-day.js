(function(){
  var MON=['January','February','March','April','May','June','July','August','September','October','November','December'];
  var box=document.getElementById('td-today');if(!box)return;
  var items=[].slice.call(document.querySelectorAll('.tdm li'));
  function heb(d){try{return new Intl.DateTimeFormat('en-u-ca-hebrew',{day:'numeric',month:'long',year:'numeric'}).format(d)}catch(e){return ''}}
  function show(d){
    var m=d.getMonth()+1,day=d.getDate(),hit=items.filter(function(li){return +li.dataset.m===m&&+li.dataset.d===day});
    document.getElementById('td-h').textContent=MON[m-1]+' '+day;
    var h=heb(d);document.getElementById('td-hd').textContent=h?'On the Hebrew calendar: '+h:'';
    var ul=document.getElementById('td-list');ul.innerHTML='';
    if(hit.length){hit.forEach(function(li){var c=li.cloneNode(true);c.className='';ul.appendChild(c)})}
    else{
      var next=items.map(function(li){var t=new Date(d.getFullYear(),+li.dataset.m-1,+li.dataset.d);if(t<d)t=new Date(d.getFullYear()+1,+li.dataset.m-1,+li.dataset.d);return[t,li]}).sort(function(a,b){return a[0]-b[0]})[0];
      var p=document.createElement('li');p.innerHTML='<span class="tdt">Nothing is listed for this day. The next entry is '+MON[next[0].getMonth()]+' '+next[0].getDate()+'.</span>';ul.appendChild(p)}
    items.forEach(function(li){li.classList.toggle('on',hit.indexOf(li)>-1)});
    box.hidden=false;
  }
  show(new Date());
  var inp=document.getElementById('td-date');
  document.getElementById('td-go').addEventListener('click',function(){if(!inp.value)return;var p=inp.value.split('-');show(new Date(+p[0],+p[1]-1,+p[2]))});
})();
