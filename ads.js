(function(){
  // MASTER SWITCH. false = no ads anywhere (slots stay in the page markup, hidden). Set true and delete the .adslot{display:none} rule in style.css to bring them back. Slot map: claude/ad-slots-v1.txt in the project.
  var ADS_ON=false;
  if(!ADS_ON){
    // Own-book banners in the right column only (aside-top slot). All other slots stay off.
    var HB=[{href:"https://www.amazon.com/ISRAEL-NOWLEJ-Graphs-Timelines-Knowledge/dp/B0HPCTLJX7/",img:"/img/ad/israel-nowlej-320x100.webp?v=3",alt:"Israel NOWlej by Richard J. Koret. Get it on Amazon"},{href:"https://www.amazon.com/dp/B0HRJX879T/",img:"/img/ad/israel-maps-320x100.webp?v=3",alt:"Israel in Maps by Richard J. Koret. Get the paperback on Amazon"}];
    var LB=[{href:HB[0].href,d:"/img/ad/israel-nowlej-728x90.webp?v=3",m:"/img/ad/israel-nowlej-320x50.webp?v=3",alt:HB[0].alt},{href:HB[1].href,d:"/img/ad/israel-maps-728x90.webp?v=3",m:"/img/ad/israel-maps-320x50.webp?v=3",alt:HB[1].alt}];
    var fillTop=function(root){
      var r=root||document;
      [].forEach.call(r.querySelectorAll('.adslot[data-slot=aside-top]:not([data-hb])'),function(s){s.setAttribute('data-hb','1');var one=function(b){return '<a class="hbn" href="'+b.href+'" target="_blank" rel="noopener"><img src="'+b.img+'" width="320" height="100" alt="'+b.alt+'"></a>'};s.innerHTML=one(HB[0]);var nl=s.parentNode&&s.parentNode.querySelector('#news-latest'),s2=document.createElement('div');s2.className='adslot adsecond';s2.setAttribute('data-hb','1');s2.innerHTML=one(HB[1]);if(nl)nl.parentNode.insertBefore(s2,nl.nextSibling);else s.parentNode.insertBefore(s2,s.nextSibling)});
      var BK=[{href:HB[0].href,img:"/img/ad/israel-nowlej-320x250.webp?v=3",alt:HB[0].alt},{href:HB[1].href,img:"/img/ad/israel-maps-320x250.webp?v=3",alt:HB[1].alt}];
      [].forEach.call(r.querySelectorAll('.adslot.hole:not([data-hb])'),function(s,i){s.setAttribute('data-hb','1');var b=BK[(i+(window.__holeN=(window.__holeN||0)+1))%2];s.innerHTML='<a class="hbk" href="'+b.href+'" target="_blank" rel="noopener"><img src="'+b.img+'" width="320" height="250" alt="'+b.alt+'" loading="lazy"></a>'});
      [].forEach.call(r.querySelectorAll('.adslot[data-slot=lb-bottom]:not([data-hb])'),function(s){s.setAttribute('data-hb','1');var b=LB[Math.floor(Math.random()*LB.length)];s.innerHTML='<a class="hbl" href="'+b.href+'" target="_blank" rel="noopener"><picture><source media="(max-width:640px)" srcset="'+b.m+'"><img src="'+b.d+'" width="728" height="90" alt="'+b.alt+'"></picture></a>'});
    };
    window.IMAds={fill:fillTop};
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){fillTop()});else fillTop();
    return}
  // Test creatives only. type: house (own book), affiliate (commissionable), cpm (display ad reserved space)
  var LABEL='Sample ad';
  var C=[
    //BOOKS-ADS
    {type:"house",title:"Israel NOWlej",text:"33 maps, 19 timelines, 400+ glossary entries. The visual atlas of the Jewish land.",cta:"Get it on Amazon",href:"https://www.amazon.com/s?k=Israel+NOWlej+Richard+Koret+Kindle",img:"/img/ad/israel-nowlej-cover.webp"},
    {type:"house",title:"Israel in Maps",text:"Twenty-nine historical maps, each facing a page that explains it.",cta:"Coming soon",href:"/books/",img:"/img/books/israel-in-maps.webp"},
    {type:"house",title:"Israel in Time",text:"Nineteen timelines from the patriarchs to today.",cta:"Coming soon",href:"/books/",img:"/img/books/israel-in-time.webp"},
    {type:"house",title:"Welcome to Zion",text:"A tour of ten regions and eighty-one sites.",cta:"Coming soon",href:"/books/",img:"/img/books/welcome-to-zion.webp"},
    ///BOOKS-ADS
    {type:'affiliate',title:'Every Dog Has His Day',text:'By Richard J. Koret. Paperback and Kindle from Raining Cats & Dogs Press.',cta:'See the book',href:'https://rainingcad.com/',tile:'a'},
    {type:'cpm',title:'Your ad here',text:'Reserved for a display ad sold by thousand views.',cta:'',href:'',tile:'c'},
    {type:'affiliate',title:'The Cat’s Pajamas',text:'By Richard J. Koret. From Raining Cats & Dogs Press.',cta:'See the book',href:'https://rainingcad.com/',tile:'b'}
  ];
  var n=0,slots=[];
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function build(ci,size){
    var c=C[ci%C.length];
    var media=c.img?'<img class="adm" src="'+esc(c.img)+'" alt="" loading="lazy">':'<span class="adm adt adt-'+c.tile+'"><b>'+esc(c.title)+'</b></span>';
    var body='<span class="adx"><b>'+esc(c.title)+'</b><span>'+esc(c.text)+'</span>'+(c.cta?'<i class="adc">'+esc(c.cta)+'</i>':'')+'</span>';
    var rel=c.type==='affiliate'?'sponsored noopener':'noopener';
    var el=document.createElement('aside');
    el.className='ad ad-'+c.type+' s-'+size;el.setAttribute('aria-label','Advertisement');
    el.innerHTML='<span class="adl">'+LABEL+'</span>'+(c.href?'<a class="adin" href="'+esc(c.href)+'"'+(/^https?:/.test(c.href)?' target="_blank" rel="'+rel+'"':'')+'>'+media+body+'</a>':'<div class="adin">'+media+body+'</div>');
    return el;
  }
  function pick(s){
    var cs=getComputedStyle(s),list=(s.getAttribute('data-sizes')||'300x250').split('|'),w=s.clientWidth-(parseFloat(cs.paddingLeft)||0)-(parseFloat(cs.paddingRight)||0);
    if(list[0]==='tower'||list[0]==='cell')return list[0];
    if(!w)return null;
    for(var i=0;i<list.length;i++)if(parseInt(list[i],10)<=w)return list[i];
    return list[list.length-1];
  }
  function paint(s){
    var size=pick(s);if(!size||s.getAttribute('data-size')===size)return;
    s.setAttribute('data-size',size);s.innerHTML='';s.appendChild(build(+s.getAttribute('data-ci'),size));
  }
  function fill(root){
    [].forEach.call((root||document).querySelectorAll('.adslot:not([data-ci])'),function(s){s.setAttribute('data-ci',n++);slots.push(s);paint(s)});
  }
  var t;window.addEventListener('resize',function(){clearTimeout(t);t=setTimeout(function(){slots.forEach(function(s){if(document.body.contains(s))paint(s)})},200)});
  window.IMAds={fill:fill};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){fill()});else fill();
})();
