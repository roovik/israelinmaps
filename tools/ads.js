(function(){
  // Test creatives only. type: house (own book), affiliate (commissionable), cpm (display ad reserved space)
  var LABEL='Sample ad';
  var C=[
    {type:'house',title:'Israel Mosaic',text:'Maps, graphs, timelines, images, and knowledge of the Holy Land. By Richard J. Koret.',cta:'Explore the book',href:'/',img:'/img/ad/israel-mosaic-cover.webp'},
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
    var list=(s.getAttribute('data-sizes')||'300x250').split('|'),w=s.clientWidth;
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
