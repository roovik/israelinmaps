"""Timelines title page in the book style: the whole ruler, the colour key and every page by era."""
import json, sys, os
sys.path.insert(0, os.path.dirname(__file__))
import gen, shade
from playwright.sync_api import sync_playwright
RULER = open(os.path.join(os.path.dirname(__file__), 'ruler_defs.js')).read()
_R = json.load(open(os.path.join(os.path.dirname(__file__), 'registry.json')))
_G = [('Patriarchs to Saul', '2000 to 1000 BCE', [1]), ('David to Bar Kokhba', '1000 BCE to 135 CE', [2, 3, 4]),
      ('Survival without sovereignty', '135 to 1917', list(range(5, 15))), ('British Mandate, Holocaust and statehood', '1917 to 1948', [15, 16, 17]),
      ('Independence and regional wars', '1948 to 1993', list(range(18, 23))), ('Peace efforts, conflict and realignment', '1993 to today', list(range(23, 27)))]
ERAS = [(n, y, [(str(r['n']), r['title'], r['rng']) for r in _R if r['n'] in ids]) for n, y, ids in _G]
KEY = [('#8fadea', 'Jewish sovereignty'), ('#e6cfa6', 'Ancient empires'), ('#eeb5ae', 'Christian rule'), ('#b0d6a8', 'Muslim rule'), ('stripe:#a3cf9c:#8fadea', 'The return to Zion'), ('stripe:#d9d4cb:#7ea0e6', 'British Mandate')]
H = r'''<!doctype html><html><head><meta charset="utf-8"><style>%F%
*{box-sizing:border-box;margin:0;padding:0}body{width:1200px;height:1500px;background:#fff;color:#222;font-family:SSans;position:relative;overflow:hidden}
.run{position:absolute;top:97px;left:109px;right:91px;display:flex;justify-content:space-between;font:600 13.5px SSans;letter-spacing:.2em;color:#666;border-bottom:1.5px solid #ccc;padding-bottom:14px}
.of{position:absolute;top:156px;left:109px;font:400 24px SSerif}h1{position:absolute;top:204px;left:106px;font:700 76px/1 SSerif;color:#1d1d1d}
.rng{position:absolute;top:292px;left:109px;font:400 22px SSans;color:#666}
.intro{position:absolute;top:334px;left:109px;width:1000px;font:400 16px/1.42 SSans;color:#333}
#ru{position:absolute;top:418px;left:109px;width:1000px;height:96px}
#ru .b{position:absolute;top:0;height:44px}#ru .base{position:absolute;top:44px;left:0;right:0;height:2px;background:#111}
#ru .t{position:absolute;top:44px;width:1px;height:6px;background:#777}#ru .t.m{height:12px;width:2px;background:#111}
#ru .l{position:absolute;top:60px;transform:translateX(-50%);font:600 14px SSans;color:#111;white-space:nowrap}#ru .l.st{transform:none}
.key{position:absolute;top:530px;left:109px;width:1000px;display:flex;justify-content:space-between;font:400 14px SSans;color:#333}
.key span{display:flex;align-items:center;gap:8px}.key i{width:30px;height:16px;display:inline-block}
.grid{position:absolute;top:574px;left:109px;width:1000px;display:grid;grid-template-columns:1fr 1fr;grid-auto-flow:column;grid-template-rows:repeat(13,auto);column-gap:48px}.tli{display:flex;gap:14px;align-items:baseline;padding:5px 0 6px;border-top:1px solid #e3e3e3}.tli b{font:700 20px SSerif;min-width:30px;text-align:right}.tli span{font:600 17px/1.2 SSans}.tli small{display:block;font:400 13px SSans;color:#777;margin-top:2px}
.era h2{font:700 19px/1.2 SSerif;color:#111;padding-top:10px;border-top:6px solid var(--c)}.era .y{font:400 14px SSans;color:#666;margin:2px 0 8px}
.era li{list-style:none;font:400 14px/1.35 SSans;color:#222;margin-bottom:5px;display:flex;gap:8px}.era li b{min-width:26px;color:#888;font-weight:600}.era li small{color:#777;font-size:12.5px;display:block}
.foot{position:absolute;top:1373px;left:109px;right:91px;border-top:1.5px solid #ccc}.copy{position:absolute;top:1386px;left:109px;font:400 14px SSans;color:#555}
.fr{position:absolute;top:1390px;right:180px;text-align:right;font:400 12.5px/1.6 SSans;color:#555}.qr{position:absolute;top:1385px;right:91px;width:70px;height:70px;image-rendering:pixelated}
</style></head><body>
<div class="run"><span>ISRAEL IN MAPS</span><span>TIMELINES</span></div><div class="of">Four thousand years at a glance</div><h1>Timelines</h1><div class="rng">2000 BCE to today</div>
<div class="intro">Blue marks Jewish sovereignty, ancient and modern. It fades as empires conquer the land, returns with the Hasmoneans and comes back for good in 1948. Red marks Christian rule and green Muslim rule. Blue stripes show the return to Zion growing into a state.</div>
<div id="ru"></div><div class="key">%KEY%</div><div class="grid">%GRID%</div>
<div class="foot"></div><div class="copy">&copy; 2003-2026 Richard J. Koret. All rights reserved.</div><div class="fr">Timelines<br>Open on your phone<br>israelinmaps.com/timelines</div><img class="qr" src="%QR%">
<script>
%RULER%
const ru=document.getElementById('ru');let h='';
ERAS.forEach(e=>e.segs.forEach(g=>{h+='<div class="b" style="left:'+X(g[0])*10+'px;width:'+Math.max(.6,(X(g[1])-X(g[0]))*10)+'px;background:'+g[2]+'"></div>'}));
h+='<div class="base"></div>';
for(let y=-1900;y<1900;y+=100)if(y%1000)h+='<div class="t" style="left:'+X(y)*10+'px"></div>';
for(let d=1910;d<2030;d+=10)h+='<div class="t" style="left:'+X(d)*10+'px"></div>';
[[-2000,'2000 BCE','st'],[-1000,'1000 BCE',''],[0,'1 CE',''],[1000,'1000',''],[1917,'1917',''],[1948,'1948',''],[1993,'1993','']].forEach(m=>{h+='<div class="t m" style="left:'+X(m[0])*10+'px"></div><div class="l '+m[2]+'" style="left:'+X(m[0])*10+'px">'+m[1]+'</div>'});
ru.innerHTML=h;
[].forEach((el,k)=>{const e=ERAS[ORD[k]];el.style.setProperty('--c','#888');el.querySelector('h2').style.borderImage='linear-gradient(90deg,'+e.segs.map(g=>g[2]+' '+((X(g[0])-X(e.y0))/(X(e.y1)-X(e.y0))*100).toFixed(1)+'% '+((X(g[1])-X(e.y0))/(X(e.y1)-X(e.y0))*100).toFixed(1)+'%').join(',')+') 1'});
document.fonts.ready.then(()=>{window.DONE=1});
</script></body></html>'''
def sw(c):
    if c.startswith('stripe:'):
        _, a, b = c.split(':'); return f'background:repeating-linear-gradient(90deg,{a} 0 5px,{b} 5px 8px)'
    return 'background:' + c
key = ''.join(f'<span><i style="{sw(c)}"></i>{t}</span>' for c, t in KEY)
grid = ''.join(f'<div class="tli" style="color:{shade.dark(shade.mid(r["y0"], r["y1"]), .45)}"><b>{r["n"]}</b><span>{r["title"]}<small>{r["rng"]}</small></span></div>' for r in _R)
html = (H.replace('%F%', gen.FONTS).replace('%KEY%', key).replace('%GRID%', grid).replace('%RULER%', RULER).replace('%QR%', gen.qr('https://israelinmaps.com/timelines')))
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1200, 'height': 1500}); pg.on('pageerror', lambda e: print('ERR', e))
    pg.set_content(html); pg.wait_for_function('window.DONE'); pg.wait_for_timeout(300)
    print('bottom', pg.evaluate("Math.max(...[...document.querySelectorAll('.tli')].map(e=>e.getBoundingClientRect().bottom))"))
    pg.screenshot(path=sys.argv[1]); b.close()
