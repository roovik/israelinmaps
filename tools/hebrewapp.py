# Executed by tools/hebrew.py after numbers.py. Builds /hebrew/app/ : one installable multi-tab app that hosts the modules.
TABS = [("travel", "Travel", "שלום", "/hebrew/travel/"), ("alphabet", "Alphabet", "א–ת", "/hebrew/alphabet/"),
        ("numbers", "Numbers", "123", "/hebrew/numbers/"), ("wordplay", "Wordplay", "הודו", "/wordplay/cards/"), ("site", "Site", "\u2630", "/")]
APPHTML = r"""<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Hebrew by Israel NOWlej</title>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<link rel="manifest" href="/hebrew/app/manifest.webmanifest"><meta name="theme-color" content="#0a2566">
<meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="Hebrew">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><link rel="apple-touch-icon" href="/hebrew/app/icons/apple-touch-icon.png">
<link rel="icon" href="/hebrew/app/icons/icon-192.png">
<style>
html,body{margin:0;height:100%;background:#0a2566;overscroll-behavior:none;-webkit-text-size-adjust:100%}
body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
#app{position:fixed;top:0;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:480px;background:#e8ecf5;display:flex;flex-direction:column;box-shadow:0 0 0 1px rgba(0,0,0,.2)}
#app{position:fixed}#mast{background:#fff;border-bottom:3px solid #f8ba2f;padding:calc(6px + env(safe-area-inset-top)) 10px 8px}#mast[hidden]{display:none}.mrow{display:flex;align-items:center;gap:8px}.mrow img{display:block;height:30px;width:auto}.msp{flex:1}.ms{color:#0a2566;font-weight:700;font-size:14px;text-decoration:none}.mnav{display:flex;gap:6px;margin-top:6px}.mnav a{flex:1;text-align:center;color:#fff;text-decoration:none;font-weight:700;font-size:13px;padding:7px 2px;border-radius:6px}#mtab[hidden]{display:none}#mtab{position:absolute;left:4px;top:env(safe-area-inset-top);z-index:5;width:40px;height:16px;border:0;border-radius:0 0 10px 10px;background:#0a2566;color:#ffc700;display:flex;align-items:center;justify-content:center;padding:0;cursor:pointer;opacity:.92}#stage{position:relative;flex:1;min-height:0;background:#e8ecf5}#app.mo iframe{top:0;height:100%}#mclose{border:0;background:#0a2566;color:#ffc700;width:34px;height:28px;border-radius:7px;display:flex;align-items:center;justify-content:center;padding:0;cursor:pointer}
iframe{position:absolute;left:0;right:0;top:env(safe-area-inset-top);bottom:0;width:100%;height:calc(100% - env(safe-area-inset-top));border:0;background:#e8ecf5;opacity:0;visibility:hidden}
iframe.on{opacity:1;visibility:visible}
#tabs{display:flex;background:#0a2566;border-top:3px solid #f8ba2f;padding-bottom:env(safe-area-inset-bottom)}
#tabs button{flex:1;border:0;background:transparent;color:#cfd8f3;padding:6px 2px 7px;font-family:inherit;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:1px}
#tabs .g{font-size:21px;font-weight:800;line-height:1.15;height:26px;display:flex;align-items:center}
#tabs .l{font-size:11px;font-weight:700;letter-spacing:.02em}
#tabs button.on{color:#ffc700}#tabs a{flex:1;color:#cfd8f3;text-decoration:none;padding:6px 2px 7px;display:flex;flex-direction:column;align-items:center;gap:1px}
</style></head><body>
<div id="app"><div id="mast"><div class="mrow"><a href="/" data-site="1" aria-label="Israel NOWlej"><img src="/logo.svg" alt="Israel NOWlej" height="30"></a><span class="msp"></span><a class="ms" href="/search/" data-site="1">Search</a><button id="mclose" aria-label="Hide the site header"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" d="M6 15l6-6 6 6"/></svg></button></div><div class="mnav"><a style="background:#2a6bd1" href="/" data-site="1">News</a><a style="background:#17808c" href="/views/" data-site="1">Views</a><a style="background:#c9561c" href="/media/" data-site="1">Media</a><a style="background:#6b3fa0" href="/glossary/" data-site="1">NOWlej</a><a style="background:#2e8b4a" href="/sources/" data-site="1">Sources</a></div></div><button id="mtab" aria-label="Show the site header" hidden><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6"/></svg></button><div id="stage">__FRAMES__</div><div id="tabs" role="tablist">__TABS__</div></div>
<script>
(function(){
var T=__DATA__,cur=null;
['gesturestart','gesturechange','gestureend'].forEach(function(t){document.addEventListener(t,function(e){e.preventDefault()})});
document.addEventListener('touchmove',function(e){if(e.touches.length>1)e.preventDefault()},{passive:false});
var mast=document.getElementById('mast'),mtab=document.getElementById('mtab');
var app=document.getElementById('app');
function setMast(on){mast.hidden=!on;mtab.hidden=on;app.classList.toggle('mo',on);try{localStorage.setItem('hmast',on?'1':'0')}catch(e){}}
mtab.onclick=function(){setMast(true)};document.getElementById('mclose').onclick=function(){setMast(false)};var mo=true;try{mo=localStorage.getItem('hmast')!='0'}catch(e){}setMast(mo);
var CSS='header.top,#subnav,nav[aria-label=Sections],footer,.adslot,aside.newsside,.ticker,.acct,.fcols{display:none!important}body{background:#e8ecf5!important}main#main{padding-top:6px!important}.wrap{max-width:none!important}a[href="/hebrew/"],#news-status,[class*=share],[id*=share],a[href="/wordplay/"]{display:none!important}.newspage{display:block!important}.newsmain{max-width:none!important;width:auto!important;float:none!important}';
function fr(id){return document.getElementById('f-'+id)}
var SCSS='header.top,#subnav,nav[aria-label=Sections]{display:none!important}';
function prep(f){try{var d=f.contentDocument;if(!d||d.getElementById('appcss'))return;var s=d.createElement('style');s.id='appcss';s.textContent=(f.id=='f-site')?SCSS:CSS;d.head.appendChild(s)}catch(e){}}
setInterval(function(){T.forEach(function(t){var f=fr(t[0]);if(!f.getAttribute('src'))return;var d;try{d=f.contentDocument}catch(e){return}
 if(!d||!d.head||d.location.href=='about:blank'){if(cur==t[0])f.classList.remove('on');return}
 if(!d.getElementById('appcss')){prep(f);}
 if(cur==t[0]&&d.getElementById('appcss'))f.classList.add('on')})},40);
function load(id){var f=fr(id);if(!f.getAttribute('src'))f.setAttribute('src',f.getAttribute('data-src'))}
function stop(){T.forEach(function(t){try{fr(t[0]).contentWindow.speechSynthesis.cancel()}catch(e){}});try{speechSynthesis.cancel()}catch(e){}}
function show(id,quiet){if(!quiet)stop();cur=id;T.forEach(function(t){var f=fr(t[0]);if(t[0]!=id)f.classList.remove('on');document.getElementById('t-'+t[0]).classList.toggle('on',t[0]==id)});load(id);
 try{localStorage.setItem('happ',id)}catch(e){}try{history.replaceState(null,'','#'+id)}catch(e){}
}
T.forEach(function(t){document.getElementById('t-'+t[0]).onclick=function(){if(cur==t[0]){try{fr(t[0]).contentWindow.location.href=t[3]}catch(e){}}show(t[0])}});
document.querySelectorAll('[data-site]').forEach(function(a){a.onclick=function(e){e.preventDefault();var f=fr('site');f.classList.remove('on');f.setAttribute('src',a.getAttribute('href'));show('site')}});
var h=(location.hash||'').slice(1),st='';try{st=localStorage.getItem('happ')||''}catch(e){}
var ok=function(x){return T.some(function(t){return t[0]==x})};
show(ok(h)?h:(ok(st)?st:'travel'),true);
setTimeout(function(){T.forEach(function(t){if(t[0]!='site')load(t[0])})},3000);
if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/hebrew/app/sw.js',{scope:'/hebrew/app/'}).catch(function(){})})}
})();
</script></body></html>"""
def hebrew_app():
    frames = ''.join('<iframe id="f-%s" data-src="%s" title="%s"></iframe>' % (k, u, n) for k, n, g, u in TABS)
    tabs = ''.join('<button id="t-%s" role="tab"><span class="g" lang="he">%s</span><span class="l">%s</span></button>' % (k, g, n) for k, n, g, u in TABS)
    html = APPHTML.replace('__FRAMES__', frames).replace('__TABS__', tabs).replace('__DATA__', json.dumps([[k, n, g, u] for k, n, g, u in TABS], ensure_ascii=False))
    wr('hebrew/app/index.html', html)
    man = {"name": "Hebrew by Israel NOWlej", "short_name": "Hebrew", "description": "Travel Hebrew, the alphabet, numbers and wordplay in one app.", "lang": "en", "dir": "ltr",
           "start_url": "/hebrew/app/?source=app", "scope": "/hebrew/app/", "display": "standalone", "orientation": "portrait", "background_color": "#0a2566", "theme_color": "#0a2566",
           "icons": [{"src": "/hebrew/app/icons/icon-192.png", "sizes": "192x192", "type": "image/png"}, {"src": "/hebrew/app/icons/icon-512.png", "sizes": "512x512", "type": "image/png"},
                     {"src": "/hebrew/app/icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"}]}
    wr('hebrew/app/manifest.webmanifest', json.dumps(man, indent=1))
    ver = hashlib.md5(html.encode('utf-8')).hexdigest()[:10]
    pre = ['/hebrew/app/', '/hebrew/app/manifest.webmanifest', '/hebrew/app/icons/icon-192.png', '/hebrew/app/icons/icon-512.png', '/hebrew/app/icons/apple-touch-icon.png']
    sw = rd('hebrew/alphabet/sw.js')
    sw = re.sub(r'const V="ea-[0-9a-f]+",PRE=\[.*?\];', 'const V="ha-' + ver + '",PRE=' + json.dumps(pre) + ';', sw, 1, flags=re.S)
    sw = sw.replace('startsWith("ea-")', 'startsWith("ha-")').replace('/hebrew/alphabet/', '/hebrew/app/')
    wr('hebrew/app/sw.js', sw)
hebrew_app()
