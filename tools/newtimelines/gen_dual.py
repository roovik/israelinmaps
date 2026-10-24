"""Green-era pages: Jewish life in the left column, the ruling powers in the right, one shared axis."""
import json, sys, os
sys.path.insert(0, os.path.dirname(__file__))
import gen
from data4 import PAGES
from playwright.sync_api import sync_playwright
T = gen.TPL
R = [
 ('.axis{position:absolute;left:685px;', '.axis{position:absolute;left:575px;'),
 ('.tick{position:absolute;left:685px;', '.tick{position:absolute;left:575px;'),
 ('.tl{position:absolute;left:687px;', '.tl{position:absolute;left:577px;'),
 ('.tp{position:absolute;right:629px;width:470px;text-align:right;font:400 14.6px/1.36 SSans;', '.tp{position:absolute;right:648px;width:443px;text-align:right;font:400 var(--fs)/1.32 SSans;'),
 ('.tp b.y{display:block;font:700 14.6px SSans;color:#222}', '.tp b.y,.al b.y{display:block;font-weight:700;color:#111}'),
 ('.al{position:absolute;left:811px;width:298px;font:400 12.6px/1.33 SSans;color:#333}.al b{font-weight:700;font-size:13.6px;color:#111}',
  '.al{position:absolute;left:676px;width:433px;font:400 var(--fs)/1.32 SSans;color:#333}.al b.h{font-weight:700;color:#111}body{--fs:14px}'),
 ("h1.textContent='TURNING POINTS';h1.style.top=top0+'px';h1.style.right='629px'", "h1.textContent='JEWISH LIFE IN THE LAND';h1.style.top=top0+'px';h1.style.right='648px'"),
 ("h2.textContent='ALSO IN THIS PERIOD';h2.style.top=top0+'px';h2.style.left='811px'", "h2.textContent='RULERS OF THE LAND';h2.style.top=top0+'px';h2.style.left='676px'"),
 ("const tp=ord(D.tp),al=ord(D.also);", "const tp=ord(D.left),al=ord(D.right);"),
 ("const tpp=stack(tp,it=>{const e=document.createElement('div');e.className='tp';e.innerHTML='<b class=\"y\">'+it[0]+'</b><b class=\"h\">'+it[3]+'</b> '+it[4];return e},16,9);",
  "const mk=c=>it=>{const e=document.createElement('div');e.className=c;e.innerHTML='<b class=\"y\">'+it[0]+'</b>'+(it[3]?'<b class=\"h\">'+it[3]+'</b> ':'')+it[4];return e};let tpp,alp;"
  "for(const fs of [14,13.4,12.8,12.2,11.6]){document.querySelectorAll('.tp,.al').forEach(e=>e.remove());document.body.style.setProperty('--fs',fs+'px');tpp=stack(tp,mk('tp'),fs*.8,9);alp=stack(al,mk('al'),fs*.8,9);"
  "const bot=Math.max(...[...document.querySelectorAll('.tp,.al')].map(e=>e.offsetTop+e.offsetHeight));if(bot<=A1+6)break}"),
 ("'<path d=\"M578 '+y1+' H593 L685 '+y2+'\"", "'<path d=\"M556 '+y1+' H562 L575 '+y2+'\""),
 ("'<circle cx=\"685\" cy=\"'+y2+'\" r=\"5.5\"", "'<circle cx=\"575\" cy=\"'+y2+'\" r=\"4.6\""),
 ("const alp=stack(al,it=>{const e=document.createElement('div');e.className='al';e.innerHTML='<b>'+it[0]+'</b> '+it[3];return e},6,9);", ""),
 ("'<path d=\"M736 '+y2+' L790 '+y1+' H804\"", "'<path d=\"M626 '+y2+' L640 '+y1+' H669\""),
 ("'<circle cx=\"736\" cy=\"'+y2+'\" r=\"3.6\"", "'<circle cx=\"626\" cy=\"'+y2+'\" r=\"4.6\""),
 ("S+='<path d=\"M626 '+y2+' L640 '+y1+' H669\" stroke=\"'+C[it[2]]+'\" stroke-width=\"1\"", "S+='<path d=\"M626 '+y2+' L640 '+y1+' H669\" stroke=\"'+C[it[2]]+'\" stroke-width=\"1.2\""),
]
for a, b in R:
    assert a in T, a[:70]; T = T.replace(a, b)
T = T.replace("pos=pos.map(p=>Math.max(p,A0));els.forEach((e,i)=>e.style.top=pos[i]+'px');return pos}", "pos=pos.map(p=>Math.max(p,A0));for(let i=1;i<els.length;i++)pos[i]=Math.max(pos[i],pos[i-1]+els[i-1].offsetHeight+gap);els.forEach((e,i)=>e.style.top=pos[i]+'px');return pos}")
T = T.replace("const tf=", "const tf=")
def _main():
  with sync_playwright() as p:
    b = p.chromium.launch()
    for P in PAGES:
        n = P['id'].lstrip('0')
        D = dict(y0=P['y0'], y1=P['y1'], step=P['step'], left=P['left'], right=P['right'], tp=[], also=[])
        h = (T.replace('%FONTS%', gen.FONTS).replace('%NUMUP%', n.upper()).replace('%NUM%', n).replace('%TITLE%', P['title'])
             .replace('%RNG%', P.get('rng') or f"{P['y0']} to {P['y1']}").replace('%INTRO%', P['intro']).replace('%ID%', P['id'])
             .replace('%QR%', gen.qr('https://israelinmaps.com/tl-' + P['id'])).replace('%CAT%', json.dumps(gen.CAT)).replace('%DATA%', json.dumps(D)))
        pg = b.new_page(viewport={'width': 1200, 'height': 1500}); pg.on('pageerror', lambda e: print('ERR', e))
        pg.set_content(h); pg.wait_for_function('window.OVER!==undefined')
        print(P['id'], 'over', pg.evaluate('window.OVER'), pg.evaluate("getComputedStyle(document.body).getPropertyValue('--fs')"))
        pg.screenshot(path=f'{sys.argv[1]}/{P["id"]}.png'); pg.close()
    b.close()
if __name__ == '__main__': _main()
