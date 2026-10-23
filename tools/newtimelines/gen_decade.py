"""Redraw a decade timeline body with more turning points, keeping the book page's header and footer."""
import json, sys, os
from PIL import Image
from playwright.sync_api import sync_playwright
sys.path.insert(0, os.path.dirname(__file__))
from gen import FONTS, CAT
from data1980s import PAGE, d
SRC, OUT = sys.argv[1], sys.argv[2]
tp = [[l, d(l), c, h, t] for l, c, h, t in PAGE['tp']]
al = [[l, d(l), c, t] for l, c, t in PAGE['also']]
H = r'''<!doctype html><html><head><meta charset="utf-8"><style>%F%
*{box-sizing:border-box;margin:0;padding:0}body{width:1200px;height:1500px;background:#fff;position:relative;overflow:hidden;font-family:SSans;color:#333}
.ax{position:absolute;left:367px;width:51px;top:392px;height:943px;background:#b7c7d6;border-left:3px solid #335a83;border-right:2px solid #778497}
.tk{position:absolute;left:367px;width:51px;border-top:1px solid #8ea3b8}.tl{position:absolute;left:370px;width:46px;text-align:center;font:400 10.5px SSerif;color:#333}
.tp{position:absolute;right:885px;width:214px;text-align:right;font:400 14.6px/1.34 SSans;color:#333}.tp b.y{display:block;font-weight:700;color:#111}.tp b.h{display:block;font-weight:700;color:#111}
.map{font:700 11.5px SSans;letter-spacing:.06em;color:#8a6d1f}
.al{position:absolute;left:492px;width:617px;font:400 12.6px/1.3 SSans;color:#333}.al b{font-weight:700;font-size:13.6px;color:#111}
svg{position:absolute;left:0;top:0;z-index:2}</style></head><body><div class="ax"></div><svg id="svg" width="1200" height="1500"></svg>
<script>
Promise.all(['400 14px SSans','700 14px SSans','400 10px SSerif'].map(f=>document.fonts.load(f))).then(()=>{
const TP=%TP%,AL=%AL%,C=%C%,A0=392,A1=1335,Y=t=>A0+(t-1980)/10*(A1-A0);
for(let y=1980;y<=1990;y++){const k=document.createElement('div');k.className='tk';k.style.top=Y(y)+'px';if(y>1980&&y<1990)document.body.appendChild(k);const l=document.createElement('div');l.className='tl';l.textContent=y;l.style.top=(y==1990?Y(y)-19:Y(y)+2)+'px';document.body.appendChild(l)}
function stack(items,mk,gap,anchor,lo){const els=items.map(mk);els.forEach(e=>{e.style.top='0px';document.body.appendChild(e)});let pos=items.map(it=>Y(it[1])-anchor);
 for(let i=1;i<els.length;i++)pos[i]=Math.max(pos[i],pos[i-1]+els[i-1].offsetHeight+gap);
 for(let i=els.length-1;i>=0;i--){const m=(i==els.length-1?A1:pos[i+1]-gap)-els[i].offsetHeight;if(pos[i]>m)pos[i]=m}
 pos=pos.map(p=>Math.max(p,lo));for(let i=1;i<els.length;i++)pos[i]=Math.max(pos[i],pos[i-1]+els[i-1].offsetHeight+gap);
 els.forEach((e,i)=>e.style.top=pos[i]+'px');return [pos,els]}
const s=a=>a.slice().sort((x,y)=>x[1]-y[1]);const tp=s(TP),al=s(AL);let S='';
const [tpp]=stack(tp,it=>{const e=document.createElement('div');e.className='tp';e.innerHTML='<b class="y">'+it[0]+'</b><b class="h">'+it[3]+'</b>'+it[4];return e},14,9,A0);
tp.forEach((it,i)=>{const y1=tpp[i]+10,y2=Y(it[1]);S+='<path d="M320 '+y1+' H328 L367 '+y2+'" stroke="'+C[it[2]]+'" stroke-width="1.2" fill="none"/><circle cx="367" cy="'+y2+'" r="5.5" fill="'+C[it[2]]+'"/>'});
const [alp,ale]=stack(al,it=>{const e=document.createElement('div');e.className='al';e.innerHTML='<b>'+it[0]+'</b> '+it[3];return e},4.5,8,A0+12);
al.forEach((it,i)=>{const y1=alp[i]+9,y2=Y(it[1]);S+='<path d="M418 '+y2+' L470 '+y1+' H486" stroke="'+C[it[2]]+'" stroke-width="1" fill="none"/><circle cx="418" cy="'+y2+'" r="3.6" fill="'+C[it[2]]+'"/>'});
document.getElementById('svg').innerHTML=S;
window.OVER=[Math.max(...[...document.querySelectorAll('.tp')].map(e=>e.offsetTop+e.offsetHeight))-A1,Math.max(...ale.map(e=>e.offsetTop+e.offsetHeight))-A1];});
</script></body></html>'''
h = H.replace('%F%', FONTS).replace('%TP%', json.dumps(tp)).replace('%AL%', json.dumps(al)).replace('%C%', json.dumps(CAT))
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1200, 'height': 1500}); pg.on('pageerror', lambda e: print('ERR', e))
    pg.set_content(h); pg.wait_for_function('window.OVER!==undefined'); print('overflow', pg.evaluate('window.OVER'))
    pg.screenshot(path='/tmp/claude-0/body.png'); b.close()
body = Image.open('/tmp/claude-0/body.png').convert('RGB'); src = Image.open(SRC).convert('RGB')
body.paste(src.crop((0, 0, 1200, 388)), (0, 0)); body.paste(src.crop((0, 1366, 1200, 1500)), (0, 1366))
body.save(OUT)
