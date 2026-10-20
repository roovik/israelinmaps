(function(){
  // Test creatives only. type: house (own book), affiliate (commissionable), cpm (display ad reserved space)
  var LABEL='Sample ad';
  var C=[
    {type:'house',title:'Israel Mosaic',text:'Maps, graphs, timelines, images, and knowledge of the Holy Land. By Richard J. Koret.',cta:'Explore the book',href:'/',img:'/img/ad/israel-mosaic-cover.webp'},
    {type:'affiliate',title:'Every Dog Has His Day',text:'By Richard J. Koret. Paperback and Kindle from Raining Cats & Dogs Press.',cta:'See the book',href:'https://rainingcad.com/',tile:'a'},
    {type:'cpm',title:'Your ad here',text:'Reserved for a display ad sold by thousand views.',cta:'',href:'',tile:'c'},
    {type:'affiliate',title:'The Cat’s Pajamas',text:'By Richard J. Koret. From Raining Cats & Dogs Press.',cta:'See the book',href:'https://rainingcad.com/',tile:'b'}
  ];
  var n=0;
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function build(kind){
    var c=C[n++%C.length];
    var media=c.img?'<img class="adm" src="'+esc(c.img)+'" alt="" loading="lazy">':'<span class="adm adt adt-'+c.tile+'"><b>'+esc(c.title)+'</b></span>';
    var body='<span class="adx"><b>'+esc(c.title)+'</b><span>'+esc(c.text)+'</span>'+(c.cta?'<i class="adc">'+esc(c.cta)+'</i>':'')+'</span>';
    var rel=c.type==='affiliate'?'sponsored noopener':'noopener';
    var inner=media+body;
    var el=document.createElement('aside');
    el.className='ad ad-'+kind+' ad-'+c.type;el.setAttribute('aria-label','Advertisement');
    el.innerHTML='<span class="adl">'+LABEL+'</span>'+(c.href?'<a class="adin" href="'+esc(c.href)+'"'+(/^https?:/.test(c.href)?' target="_blank" rel="'+rel+'"':'')+'>'+inner+'</a>':'<div class="adin">'+inner+'</div>');
    return el;
  }
  function fill(root){
    [].forEach.call((root||document).querySelectorAll('.adslot:not([data-done])'),function(s){
      var k=(s.getAttribute('data-slot')||'').indexOf('lb')===0?'lb':(s.getAttribute('data-slot')||'').indexOf('left')>-1?'tower':'rect';
      s.setAttribute('data-done','1');s.appendChild(build(k));
    });
  }
  window.IMAds={fill:fill};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){fill()});else fill();
})();
