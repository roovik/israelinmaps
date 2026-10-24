"""Era colours carried onto each timeline page: coloured mini ruler, shaded axis, title in the dark shade."""
import json, os
SEGS = [s for e in json.load(open(os.path.join(os.path.dirname(__file__), 'segs.json'))) for s in e['segs']]
def col(y):
    for s in SEGS:
        if s[0] <= y < s[1]: return s[2]
    return SEGS[-1][2] if y >= SEGS[-1][0] else SEGS[0][2]
def dark(c, k=.5):
    x = int(c[1:], 16); r, g, b = x >> 16, (x >> 8) & 255, x & 255
    return '#%02x%02x%02x' % (int(r * k), int(g * k), int(b * k))
def mid(y0, y1):
    # the colour that covers most of the span
    tot = {}
    for s in SEGS:
        a, b = max(s[0], y0), min(s[1], y1)
        if b > a: tot[s[2]] = tot.get(s[2], 0) + (b - a)
    return max(tot, key=tot.get) if tot else col(y0)
JS = r'''<script>
(function(){const SEGS=%SEGS%,Y0=%Y0%,Y1=%Y1%,DK=%DK%;
function go(){if(window.OVER===undefined){setTimeout(go,30);return}
 const h=document.querySelector('h1');if(h)h.style.color=DK;
 const mini=document.getElementById('mini');if(mini){const mx=y=>(y+2000)/4026*1000;let s='';
  SEGS.forEach(g=>{const a=Math.max(g[0],-2000),b=Math.min(g[1],2026);if(b>a)s+='<div style="position:absolute;top:1px;height:11px;left:'+mx(a)+'px;width:'+Math.max(.5,mx(b)-mx(a))+'px;background:'+g[2]+'"></div>'});
  s+='<div style="position:absolute;top:-2px;height:17px;left:'+(mx(Y0)-1)+'px;width:'+Math.max(4,mx(Y1)-mx(Y0)+2)+'px;border:2px solid '+DK+';box-sizing:border-box"></div>';
  s+=[...mini.querySelectorAll('.t')].map(t=>t.outerHTML).join('');mini.innerHTML=s}
 const ax=document.querySelector('.axis');if(ax){const st=[];SEGS.forEach(g=>{const a=Math.max(g[0],Y0),b=Math.min(g[1],Y1);if(b>a)st.push(g[2]+' '+((a-Y0)/(Y1-Y0)*100).toFixed(2)+'% '+((b-Y0)/(Y1-Y0)*100).toFixed(2)+'%')});
  if(st.length){ax.style.background='linear-gradient(180deg,'+st.join(',')+')';ax.style.borderLeftColor=DK;ax.style.borderRightColor=DK}
  document.querySelectorAll('.tick').forEach(t=>t.style.borderTopColor='rgba(0,0,0,.18)')}
 window.SHADE=1}
go()})();</script>'''
def inject(html, y0, y1):
    return html.replace('</body>', JS.replace('%SEGS%', json.dumps(SEGS)).replace('%Y0%', str(y0)).replace('%Y1%', str(y1)).replace('%DK%', json.dumps(dark(mid(y0, y1), .45))) + '</body>')
