/* Click-to-enlarge for elements marked data-zoom: opens the image in an overlay on this page. */
(function(){
  var ov=null,last=null;
  function close(){if(ov){ov.remove();ov=null;document.body.style.overflow='';if(last)last.focus()}}
  function open(src,from){last=from;ov=document.createElement('div');ov.className='zoomov';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');
    ov.innerHTML='<button type="button" class="zx" aria-label="Close">\u2715</button><img src="'+src+'" alt="">';document.body.appendChild(ov);document.body.style.overflow='hidden';ov.querySelector('.zx').focus();
    ov.addEventListener('click',function(e){if(e.target===ov||e.target.closest('.zx'))close()})}
  document.addEventListener('click',function(e){var z=e.target.closest('[data-zoom]');if(!z)return;e.preventDefault();open(z.getAttribute('data-zoom'),z)});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')close()});
})();
