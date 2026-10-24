"""Render the 1948-to-today period pages: book header style, decade-style body (narrow turning points, wide list)."""
import json, sys, os
sys.path.insert(0, os.path.dirname(__file__))
import gen
from playwright.sync_api import sync_playwright
PAGES = json.load(open(os.path.join(os.path.dirname(__file__), 'modern/pages.json')))
T = gen.TPL
R = [
 ('.axis{position:absolute;left:685px;width:51px;background:#dbdfe2;border-left:2px solid #96a0aa;border-right:2px solid #96a0aa}',
  '.axis{position:absolute;left:367px;width:51px;background:#b7c7d6;border-left:3px solid #335a83;border-right:2px solid #778497}'),
 ('.tick{position:absolute;left:685px;width:51px;border-top:1px solid #b5bdc4}', '.tick{position:absolute;left:367px;width:51px;border-top:1px solid #8ea3b8}'),
 ('.tl{position:absolute;left:687px;width:47px;', '.tl{position:absolute;left:370px;width:46px;'),
 ('.tp{position:absolute;right:629px;width:470px;text-align:right;font:400 14.6px/1.36 SSans;', '.tp{position:absolute;right:885px;width:214px;text-align:right;font:400 var(--tf)/1.3 SSans;'),
 ('.tp b.y{display:block;font:700 14.6px SSans;color:#222}.tp b.h{font-weight:700;color:#111}', '.tp b.y{display:block;font-weight:700;color:#111}.tp b.h{display:block;font-weight:700;color:#111}'),
 ('.al{position:absolute;left:811px;width:298px;font:400 12.6px/1.33 SSans;color:#333}.al b{font-weight:700;font-size:13.6px;color:#111}',
  '.al{position:absolute;left:492px;width:617px;font:400 var(--fs)/1.24 SSans;color:#333}.al b{font-weight:700;color:#111}body{--fs:12.6px;--tf:14.2px}'),
 ("h1.style.right='629px'", "h1.style.right='885px'"),
 ("h2.textContent='ALSO IN THIS PERIOD';h2.style.top=top0+'px';h2.style.left='811px'", "h2.textContent='ALSO IN THIS PERIOD';h2.style.top=top0+'px';h2.style.left='492px'"),
 ("'</b><b class=\"h\">'+it[3]+'</b> '+it[4]", "'</b><b class=\"h\">'+it[3]+'</b>'+it[4]"),
 ("'<path d=\"M578 '+y1+' H593 L685 '+y2+'\"", "'<path d=\"M320 '+y1+' H328 L367 '+y2+'\""),
 ("'<circle cx=\"685\" cy=\"'", "'<circle cx=\"367\" cy=\"'"),
 ("const alp=stack(al,it=>{const e=document.createElement('div');e.className='al';e.innerHTML='<b>'+it[0]+'</b> '+it[3];return e},6,9);",
  "let alp;for(const fs of [12.6,12.1,11.6,11.1,10.7,10.4,10.1]){document.querySelectorAll('.al').forEach(e=>e.remove());document.body.style.setProperty('--fs',fs+'px');alp=stack(al,it=>{const e=document.createElement('div');e.className='al';e.innerHTML='<b>'+it[0]+'</b> '+it[3];return e},fs<11?1.2:fs*.3,8);const els=[...document.querySelectorAll('.al')];if(els[els.length-1].offsetTop+els[els.length-1].offsetHeight<=A1+6&&els.every((e,i)=>!i||e.offsetTop>=els[i-1].offsetTop+els[i-1].offsetHeight))break}"),
 ("'<path d=\"M736 '+y2+' L790 '+y1+' H804\"", "'<path d=\"M418 '+y2+' L470 '+y1+' H486\""),
 ("'<circle cx=\"736\" cy=\"'", "'<circle cx=\"418\" cy=\"'"),
 ("pos=pos.map(p=>Math.max(p,A0));els.forEach((e,i)=>e.style.top=pos[i]+'px');return pos}", "pos=pos.map(p=>Math.max(p,A0));for(let i=1;i<els.length;i++)pos[i]=Math.max(pos[i],pos[i-1]+els[i-1].offsetHeight+gap);els.forEach((e,i)=>e.style.top=pos[i]+'px');return pos}"),
 ("const tpp=stack(tp,", "let tpp;for(const tf of [14.2,13.6,13,12.4,11.8]){document.querySelectorAll('.tp').forEach(e=>e.remove());document.body.style.setProperty('--tf',tf+'px');tpp=stack(tp,"),
 ("return e},16,9);", "return e},tf*.9,9);const te=[...document.querySelectorAll('.tp')];if(te[te.length-1].offsetTop+te[te.length-1].offsetHeight<=A1+6)break}"),
 ('<div class="run"><span>ISRAEL IN MAPS</span><span>TIMELINE %NUMUP%</span></div>', '<div class="run"><span>ISRAEL IN MAPS</span><span>%RUNR%</span></div>'),
 ('<div class="of">Timeline %NUM%</div>', '<div class="of">The State of Israel</div>'),
]
for a, b in R:
    assert a in T, a[:60]; T = T.replace(a, b)
def build(out):
    with sync_playwright() as p:
        b = p.chromium.launch()
        for P in PAGES:
            span = P['y1'] - P['y0']; step = 1 if span <= 13 else 2
            D = dict(y0=P['y0'], y1=P['y1'], step=step, tp=P['tp'], also=P['also'])
            h = (T.replace('%FONTS%', gen.FONTS).replace('%RUNR%', P['rng'].upper()).replace('%TITLE%', P['title'])
                 .replace('%RNG%', P['rng']).replace('%INTRO%', P['intro']).replace('%ID%', P['id'])
                 .replace('%QR%', gen.qr('https://israelinmaps.com/tl-' + P['id'])).replace('%CAT%', json.dumps(gen.CAT)).replace('%DATA%', json.dumps(D)))
            pg = b.new_page(viewport={'width': 1200, 'height': 1500}); pg.on('pageerror', lambda e: print('ERR', e))
            pg.set_content(h); pg.wait_for_function('window.OVER!==undefined')
            print(P['id'], 'over', pg.evaluate('window.OVER'), 'fs', pg.evaluate("getComputedStyle(document.body).getPropertyValue('--fs')"))
            pg.screenshot(path=f'{out}/{P["id"]}.png'); pg.close()
        b.close()
if __name__ == '__main__': build(sys.argv[1])
