(function(){
if(!document.getElementById('news-widget')||!/^\/(news|views)\/?(index.html)?$/.test(location.pathname))return;
var K='dens',on=true;try{on=localStorage.getItem(K)!=='comfortable'}catch(e){}
var b=document.createElement('button');b.id='densbtn';b.type='button';
function set(){document.body.classList.toggle('compact',on);b.textContent=on?'Comfortable view':'Compact view'}
b.onclick=function(){on=!on;try{localStorage.setItem(K,on?'compact':'comfortable')}catch(e){}set()};
var m=document.querySelector('.newsmain');if(m)m.insertBefore(b,m.firstChild);set();
})();
