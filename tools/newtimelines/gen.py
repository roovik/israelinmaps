"""Render new timeline pages in the book's style: 1200x1500 webp per page."""
import json, sys, base64, io, os
import qrcode
from playwright.sync_api import sync_playwright
sys.path.insert(0, os.path.dirname(__file__))
import importlib
PAGES = importlib.import_module(os.environ.get('TLDATA','data')).PAGES

F = '/home/claude/tlgen/node_modules/@fontsource/'
def font(fam, path, w):
    b = base64.b64encode(open(F + path, 'rb').read()).decode()
    return f"@font-face{{font-family:'{fam}';font-weight:{w};src:url(data:font/woff2;base64,{b}) format('woff2')}}"
FONTS = ''.join([font('SSerif', f'source-serif-4/files/source-serif-4-latin-{w}-normal.woff2', w) for w in (400, 600, 700)] +
                [font('SSans', f'source-sans-3/files/source-sans-3-latin-{w}-normal.woff2', w) for w in (400, 600, 700)])
CAT = {'c': '#a8453b', 'r': '#798591', 'd': '#2f6da1', 's': '#4d8a58', 'f': '#bc8958', 'l': '#765da3'}

def qr(url):
    q = qrcode.QRCode(border=0, box_size=4); q.add_data(url); q.make(fit=True)
    im = q.make_image(fill_color='#111', back_color='white'); b = io.BytesIO(); im.save(b, 'PNG')
    return 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()

TPL = r'''<!doctype html><html><head><meta charset="utf-8"><style>
%FONTS%
*{box-sizing:border-box;margin:0;padding:0}
body{width:1200px;height:1500px;background:#fff;color:#222;font-family:SSans;position:relative;overflow:hidden}
.run{position:absolute;top:97px;left:109px;right:91px;display:flex;justify-content:space-between;font:600 13.5px SSans;letter-spacing:.2em;color:#666;border-bottom:1.5px solid #ccc;padding-bottom:14px}
.of{position:absolute;top:156px;left:109px;font:400 24px SSerif;color:#222}
h1{position:absolute;top:220px;left:107px;font:700 57px/1 SSerif;color:#1d1d1d;letter-spacing:-.005em}
.rng{position:absolute;top:292px;left:109px;font:400 22px SSans;color:#666}
.leg{position:absolute;top:300px;right:91px;display:flex;gap:16px;font:400 13.5px SSans;color:#444}
.leg span{display:flex;align-items:center;gap:6px}.leg i{width:12px;height:12px;border-radius:50%;display:inline-block}
.mini{position:absolute;top:336px;left:109px;width:1000px;height:16px}
.mini .bg{position:absolute;top:2px;left:0;right:0;height:9px;background:#e3e5e6}
.mini .hi{position:absolute;top:0;height:16px;background:#99a5b1}
.mini .t{position:absolute;top:10px;width:1px;height:6px;background:#aaa}
.ml{position:absolute;top:361px;font:400 10.5px SSerif;color:#666;transform:translateX(-50%)}
.intro{position:absolute;top:388px;left:109px;width:1000px;font:400 15.5px/1.38 SSans;color:#333}
.hd{position:absolute;font:600 12.5px SSans;letter-spacing:.2em;color:#777}
.axis{position:absolute;left:685px;width:51px;background:#dbdfe2;border-left:2px solid #96a0aa;border-right:2px solid #96a0aa}
.tick{position:absolute;left:685px;width:51px;border-top:1px solid #b5bdc4}
.tl{position:absolute;left:687px;width:47px;text-align:center;font:400 10.5px SSerif;color:#444;transform:translateY(2px)}
.tp{position:absolute;right:629px;width:470px;text-align:right;font:400 14.6px/1.36 SSans;color:#333}
.tp b.y{display:block;font:700 14.6px SSans;color:#222}.tp b.h{font-weight:700;color:#111}
.al{position:absolute;left:811px;width:298px;font:400 12.6px/1.33 SSans;color:#333}.al b{font-weight:700;font-size:13.6px;color:#111}
.dot{position:absolute;border-radius:50%;transform:translate(-50%,-50%)}
svg{position:absolute;left:0;top:0;z-index:2}
.foot{position:absolute;top:1373px;left:109px;right:91px;border-top:1.5px solid #ccc}
.copy{position:absolute;top:1386px;left:109px;font:400 14px SSans;color:#555}
.fr{position:absolute;top:1390px;right:180px;text-align:right;font:400 12.5px/1.6 SSans;color:#555}.fr b{font-weight:400;color:#333}
.qr{position:absolute;top:1385px;right:91px;width:70px;height:70px;image-rendering:pixelated}
</style></head><body>
<div class="run"><span>ISRAEL IN MAPS</span><span>TIMELINE %NUMUP%</span></div>
<div class="of">Timeline %NUM%</div><h1>%TITLE%</h1><div class="rng">%RNG%</div>
<div class="leg"><span><i style="background:#a8453b"></i>Conflict</span><span><i style="background:#798591"></i>Rule and borders</span><span><i style="background:#2f6da1"></i>Diplomacy and law</span><span><i style="background:#4d8a58"></i>Settlement</span><span><i style="background:#bc8958"></i>Faith and learning</span><span><i style="background:#765da3"></i>Literature and arts</span></div>
<div class="mini" id="mini"></div>
<div class="intro">%INTRO%</div>
<svg id="svg" width="1200" height="1500"></svg>
<div class="foot"></div><div class="copy">&copy; 2003-2026 Richard J. Koret. All rights reserved.</div>
<div class="fr"><b>TL-%ID%</b><br>Open on your phone<br>israelinmaps.com/tl-%ID%</div><img class="qr" src="%QR%">
<script>
Promise.all(['400 14px SSans','600 14px SSans','700 14px SSans','400 14px SSerif','700 14px SSerif'].map(f=>document.fonts.load(f))).then(()=>document.fonts.ready).then(()=>{
const D=%DATA%,C=%CAT%;
// mini ruler 2000 BCE to 2026
const mini=document.getElementById('mini'),mx=y=>(y+2000)/4026*1000;
mini.innerHTML='<div class="bg"></div><div class="hi" style="left:'+mx(D.y0)+'px;width:'+Math.max(3,mx(D.y1)-mx(D.y0))+'px"></div>'+[-2000,-1000,0,1000,2026].map(y=>'<div class="t" style="left:'+mx(y)+'px"></div>').join('');
[[-2000,'2000 BCE'],[-1000,'1000 BCE'],[0,'1 CE'],[1000,'1000'],[2026,'2026']].forEach(([y,t],i)=>{const e=document.createElement('div');e.className='ml';e.textContent=t;e.style.left=(109+mx(y)+(i==0?24:i==4?-14:0))+'px';document.body.appendChild(e)});
const intro=document.querySelector('.intro'),top0=intro.offsetTop+intro.offsetHeight+22;
const h1=document.createElement('div');h1.className='hd';h1.textContent='TURNING POINTS';h1.style.top=top0+'px';h1.style.right='629px';document.body.appendChild(h1);
const h2=document.createElement('div');h2.className='hd';h2.textContent='ALSO IN THIS PERIOD';h2.style.top=top0+'px';h2.style.left='811px';document.body.appendChild(h2);
const A0=top0+26,A1=1345,P0=A0+16,P1=A1-16,Y=y=>P0+(y-D.y0)/(D.y1-D.y0)*(P1-P0);
const ax=document.createElement('div');ax.className='axis';ax.style.top=A0+'px';ax.style.height=(A1-A0)+'px';document.body.appendChild(ax);
for(let t=Math.ceil(D.y0/D.step)*D.step;t<=D.y1;t+=D.step){if(Y(t)<A0+8||Y(t)>A1-4)continue;const k=document.createElement('div');k.className='tick';k.style.top=Y(t)+'px';document.body.appendChild(k);const l=document.createElement('div');l.className='tl';l.style.top=Y(t)+'px';l.textContent=t<0?(-t)+' BCE':t;document.body.appendChild(l)}
function stack(items,mk,gap,anchor){const els=items.map(mk);els.forEach(e=>{e.style.top='0px';document.body.appendChild(e)});
  let pos=items.map((it,i)=>Y(it[1])-anchor);
  for(let i=0;i<els.length;i++){if(i>0)pos[i]=Math.max(pos[i],pos[i-1]+els[i-1].offsetHeight+gap)}
  const lim=A1+6;for(let i=els.length-1;i>=0;i--){const mxp=(i==els.length-1?lim:pos[i+1]-gap)-els[i].offsetHeight;if(pos[i]>mxp)pos[i]=mxp}
  pos=pos.map(p=>Math.max(p,A0));els.forEach((e,i)=>e.style.top=pos[i]+'px');return pos}
const svg=document.getElementById('svg');let S='';
const ord=(a)=>a.slice().sort((x,y)=>x[1]-y[1]);
const tp=ord(D.tp),al=ord(D.also);
const tpp=stack(tp,it=>{const e=document.createElement('div');e.className='tp';e.innerHTML='<b class="y">'+it[0]+'</b><b class="h">'+it[3]+'</b> '+it[4];return e},16,9);
tp.forEach((it,i)=>{const y1=tpp[i]+10,y2=Y(it[1]);S+='<path d="M578 '+y1+' H593 L685 '+y2+'" stroke="'+C[it[2]]+'" stroke-width="1.2" fill="none"/>';S+='<circle cx="685" cy="'+y2+'" r="5.5" fill="'+C[it[2]]+'"/>'});
const alp=stack(al,it=>{const e=document.createElement('div');e.className='al';e.innerHTML='<b>'+it[0]+'</b> '+it[3];return e},6,9);
al.forEach((it,i)=>{const y1=alp[i]+9,y2=Y(it[1]);S+='<path d="M736 '+y2+' L790 '+y1+' H804" stroke="'+C[it[2]]+'" stroke-width="1" fill="none"/>';S+='<circle cx="736" cy="'+y2+'" r="3.6" fill="'+C[it[2]]+'"/>'});
svg.innerHTML=S;
window.OVER=Math.max(...[...document.querySelectorAll('.tp,.al')].map(e=>e.offsetTop+e.offsetHeight))-A1;
});
</script></body></html>'''

def build(out_dir):
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1200, 'height': 1500}); pg.on('pageerror', lambda e: print('ERR', e))
        for P in PAGES:
            n = P['id'].lstrip('0')
            h = (TPL.replace('%FONTS%', FONTS).replace('%NUMUP%', n.upper()).replace('%NUM%', n).replace('%TITLE%', P['title'])
                 .replace('%RNG%', P.get('rng') or f"{P['y0']} to {P['y1']}").replace('%INTRO%', P['intro']).replace('%ID%', P['id'])
                 .replace('%QR%', qr('https://israelinmaps.com/tl-' + P['id'])).replace('%CAT%', json.dumps(CAT))
                 .replace('%DATA%', json.dumps({k: P[k] for k in ('y0', 'y1', 'step', 'tp', 'also')})))
            pg = b.new_page(viewport={'width': 1200, 'height': 1500}); pg.on('pageerror', lambda e: print('ERR', e))
            pg.set_content(h); pg.wait_for_function('window.OVER!==undefined'); pg.wait_for_timeout(100)
            print(P['id'], 'overflow', pg.evaluate('window.OVER'))
            png = f'{out_dir}/{P["id"]}.png'; pg.screenshot(path=png); pg.close()
        b.close()

if __name__ == '__main__':
    build(sys.argv[1])
