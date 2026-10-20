"""Generate the Israel NOWlej tile logo (header version, favicon)."""
import random, colorsys, sys
def hexc(h,s,l):
    r,g,b=colorsys.hls_to_rgb((h%360)/360,min(max(l,0),1),min(max(s,0),1));return '#%02x%02x%02x'%(int(r*255),int(g*255),int(b*255))
def tile(s,k,x0,y0,t,ch,lej,r,n=4,fs=None):
    random.seed(k*31+3);ts=t/n
    s.append(f'<g><clipPath id="c{k}"><rect x="{x0}" y="{y0}" width="{t}" height="{t}" rx="{t*.09:.1f}"/></clipPath><g clip-path="url(#c{k})">')
    for j in range(n):
        for i in range(n):
            cx=(i+.5)/n-.5;cy=(j+.5)/n-.5;ring=min(int(max(abs(cx),abs(cy))*2*2.4),3)
            ring=min(ring,4)
            if lej: pal=[(46,.85,.66),(40,.85,.54),(32,.85,.44),(24,.8,.36),(48,.8,.74)]
            else:
                base=(208+(k%6)*3) if r==0 else (196+(k%6)*4)
                pal=[(base,.75,.64),(base+6,.75,.5),(base-6,.8,.38),(base+22,.7,.28),(base+4,.65,.74)]
            H,S,L=pal[ring]
            s.append(f'<rect x="{x0+i*ts+.4:.1f}" y="{y0+j*ts+.4:.1f}" width="{ts-.8:.1f}" height="{ts-.8:.1f}" fill="{hexc(H+random.uniform(-5,5),S,L+random.uniform(-.06,.06))}"/>')
    s.append(f'<rect x="{x0}" y="{y0}" width="{t}" height="{t}" fill="#06101e" opacity=".3"/></g>')
    s.append(f'<rect x="{x0+.8}" y="{y0+.8}" width="{t-1.6}" height="{t-1.6}" rx="{t*.09:.1f}" fill="none" stroke="{"#f6d98a" if lej else "#d6eafc"}" stroke-width="1.6"/>')
    fs=fs or t*.86
    s.append(f'<text x="{x0+t/2}" y="{y0+t/2+fs*.34:.1f}" text-anchor="middle" font-family="Georgia,\'Times New Roman\',serif" font-weight="700" font-size="{fs:.0f}" fill="#fff" stroke="#0c1b30" stroke-width="{t*.05:.1f}" paint-order="stroke">{ch}</text></g>')
def logo():
    t=40;g=3;w=6*t+5*g;h=2*t+g
    s=[f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" role="img" aria-label="Israel NOWlej"><title>Israel NOWlej</title>']
    for r,row in enumerate(['ISRAEL','NOWLEJ']):
        for c,ch in enumerate(row): tile(s,r*6+c,c*(t+g),r*(t+g),t,ch,r==1 and c>=3,r)
    s.append('</svg>');return ''.join(s)
def fav():
    s=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><title>NOWlej</title>']
    tile(s,13,0,0,64,'N',False,1,n=8,fs=52);s.append('</svg>');return ''.join(s)
open(sys.argv[1]+'/logo.svg','w').write(logo());open(sys.argv[1]+'/favicon.svg','w').write(fav())
