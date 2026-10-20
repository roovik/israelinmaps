(function(){
  var q=document.getElementById('gq'),cats=document.getElementById('gcats');if(!q||!cats)return;
  var cards=[].slice.call(document.querySelectorAll('.gcard')),secs=[].slice.call(document.querySelectorAll('.gsec')),cnt=document.getElementById('gcount'),az=document.getElementById('gaz'),cat='';
  function norm(s){return s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g,'').replace(/['’]/g,'')}
  function run(){
    var t=norm(q.value.trim()),shown=0;
    cards.forEach(function(c){var ok=(!cat||c.getAttribute('data-c')===cat)&&(!t||norm(c.getAttribute('data-n')).indexOf(t)>-1);c.hidden=!ok;if(ok)shown++});
    secs.forEach(function(s){var any=s.querySelector('.gcard:not([hidden])');s.hidden=!any;var a=az.querySelector('a[href="#l'+s.getAttribute('data-l')+'"]');if(a)a.style.opacity=any?'':'.3'});
    cnt.textContent=(t||cat)?shown+' of '+cards.length+' entries shown.':''}
  cats.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;cat=b.getAttribute('data-c');[].forEach.call(cats.children,function(x){x.setAttribute('aria-pressed',x===b?'true':'false')});run()});
  q.addEventListener('input',run);
})();
