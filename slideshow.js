/* Automatic slide show for image galleries (.egal). Fades between photos every five seconds.
   Pauses on hover, focus, touch and when the tab is hidden. Arrows and dots for manual control.
   Does not autoplay for people who prefer reduced motion. Clicking a photo still opens the large view. */
(function(){
  var DELAY=5000,reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function build(g){
    if(g.getAttribute('data-ss'))return;var figs=[].slice.call(g.querySelectorAll(':scope > figure'));if(figs.length<2)return;
    g.setAttribute('data-ss','1');g.className+=' ss-on';
    var stage=document.createElement('div');stage.className='ss-stage';figs.forEach(function(f,i){f.className+=' ss-f'+(i?'':' on');stage.appendChild(f)});g.appendChild(stage);
    var prev=document.createElement('button'),next=document.createElement('button'),dots=document.createElement('div'),pp=document.createElement('button');
    prev.type=next.type=pp.type='button';prev.className='ss-b ss-prev';next.className='ss-b ss-next';prev.setAttribute('aria-label','Previous photo');next.setAttribute('aria-label','Next photo');prev.innerHTML='&#10094;';next.innerHTML='&#10095;';
    pp.className='ss-pp';dots.className='ss-dots';
    figs.forEach(function(f,i){var d=document.createElement('button');d.type='button';d.className='ss-d'+(i?'':' on');d.setAttribute('aria-label','Photo '+(i+1));d.addEventListener('click',function(){go(i,true)});dots.appendChild(d)});
    stage.appendChild(prev);stage.appendChild(next);var bar=document.createElement('div');bar.className='ss-bar';bar.appendChild(dots);bar.appendChild(pp);g.appendChild(bar);
    var cur=0,timer=null,playing=!reduce,hold=false;
    function show(i){figs[cur].classList.remove('on');dots.children[cur].classList.remove('on');cur=(i+figs.length)%figs.length;figs[cur].classList.add('on');dots.children[cur].classList.add('on');var im=figs[cur].querySelector('img');if(im)im.loading='eager'}
    function go(i,user){show(i);if(user)restart()}
    function tick(){if(playing&&!hold&&!document.hidden)show(cur+1)}
    function restart(){clearInterval(timer);if(playing)timer=setInterval(tick,DELAY)}
    function label(){pp.innerHTML=playing?'&#10074;&#10074; Pause':'&#9654; Play';pp.setAttribute('aria-pressed',playing?'false':'true')}
    prev.addEventListener('click',function(){go(cur-1,true)});next.addEventListener('click',function(){go(cur+1,true)});
    pp.addEventListener('click',function(){playing=!playing;label();restart()});
    ['mouseenter','focusin','touchstart'].forEach(function(e){g.addEventListener(e,function(){hold=true},{passive:true})});
    ['mouseleave','focusout'].forEach(function(e){g.addEventListener(e,function(){hold=false})});g.addEventListener('touchend',function(){setTimeout(function(){hold=false},4000)},{passive:true});
    var sx=0;stage.addEventListener('touchstart',function(e){sx=e.touches[0].clientX},{passive:true});stage.addEventListener('touchend',function(e){var dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>40)go(cur+(dx<0?1:-1),true)},{passive:true});
    label();restart();
  }
  function scan(){[].forEach.call(document.querySelectorAll('.egal'),build)}
  scan();new MutationObserver(scan).observe(document.body,{childList:true,subtree:true});
})();
