(function(){
var st=document.createElement('style');
st.textContent='.wsay{display:inline-flex;align-items:center;gap:6px;margin:6px 0 2px;padding:6px 16px;border:0;border-radius:999px;background:#ffc700;color:#0a2566;font:800 15px/1 inherit;cursor:pointer;box-shadow:0 2px 0 #b8900a}.wsay svg{flex:none}.wtoast{position:fixed;left:12px;right:12px;bottom:16px;z-index:99;padding:10px 12px;border-radius:10px;background:#fff3cd;color:#5a4300;border:1px solid #f8ba2f;font:14px/1.35 sans-serif}';
document.head.appendChild(st);
function hv(){try{return speechSynthesis.getVoices().filter(function(v){return /^(he|iw)/i.test(v.lang)})}catch(e){return[]}}
window.heSay=function(t){
 try{
  var all=speechSynthesis.getVoices().length,h=hv();
  if(all>0&&!h.length){var n=document.createElement('div');n.className='wtoast';n.textContent='No Hebrew voice found on this device. iPhone: Settings, Accessibility, Spoken Content, Voices, Hebrew, then download Carmit. Android: Settings, Text-to-speech, install Hebrew.';document.body.appendChild(n);setTimeout(function(){n.remove()},9000);return}
  var busy=speechSynthesis.speaking||speechSynthesis.pending;speechSynthesis.cancel();
  var go=function(){var u=new SpeechSynthesisUtterance(t);u.lang='he-IL';u.rate=.85;if(h.length)u.voice=h[0];speechSynthesis.speak(u)};
  if(busy)setTimeout(go,80);else go();
 }catch(e){}
};
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-say]');if(b){e.stopPropagation();e.preventDefault();heSay(b.getAttribute('data-say'))}},true);
try{speechSynthesis.getVoices()}catch(e){}
})();
