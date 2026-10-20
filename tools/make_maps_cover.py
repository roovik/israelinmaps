"""Render the cover tile for the Maps page: tools/make_maps_cover.py <site root>"""
import sys, base64, io, random, colorsys
from PIL import Image
from playwright.sync_api import sync_playwright
root = sys.argv[1]
im = Image.open(f'{root}/img/p004.webp').convert('RGB')
W, H = im.size
from PIL import ImageDraw
sea = im.getpixel((int(W * .085), int(H * .30)))
ImageDraw.Draw(im).rectangle((int(W * .093), int(H * .24), int(W * .327), int(H * .465)), fill=sea)  # hide the legend: the cover is illustrative
crop = im.crop((int(W * .075), int(H * .105), int(W * .915), int(H * .875)))
buf = io.BytesIO(); crop.save(buf, 'JPEG', quality=88); b64 = base64.b64encode(buf.getvalue()).decode()
def hexc(h, s, l):
    r, g, b = colorsys.hls_to_rgb((h % 360) / 360, l, s); return '#%02x%02x%02x' % (int(r*255), int(g*255), int(b*255))
random.seed(3)
def band(y, n=64, h=22, w=1280):
    t = w / n; o = ''
    for i in range(n):
        H_ = random.choice([208, 196, 44, 36, 14]); L = random.uniform(.38, .62)
        o += f'<rect x="{i*t+1:.1f}" y="{y+1}" width="{t-2:.1f}" height="{h-2}" fill="{hexc(H_, .7, L)}"/>'
    return o
ch = 800 - 2 * 40 - 40
cw = int(ch * crop.width / crop.height)
svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 1280 800">
<rect width="1280" height="800" fill="#f6efdd"/>
<rect x="0" y="0" width="1280" height="800" fill="#10294a"/>
<rect x="24" y="48" width="1232" height="704" rx="10" fill="#fbf6e9"/>
{band(14)}{band(764)}
<image href="data:image/jpeg;base64,{b64}" x="70" y="70" width="{cw}" height="{ch}" preserveAspectRatio="xMidYMid meet"/>
<rect x="70" y="70" width="{cw}" height="{ch}" fill="none" stroke="#10294a" stroke-width="3"/>
<g font-family="Georgia,'Times New Roman',serif" fill="#10294a">
<text x="{70+cw+60}" y="250" font-size="30" font-family="system-ui,sans-serif" letter-spacing="6" fill="#b36b00" font-weight="700">ISRAEL NOWLEJ</text>
<text x="{70+cw+60}" y="340" font-size="84" font-weight="700">Israel&#8217;s</text>
<text x="{70+cw+60}" y="430" font-size="84" font-weight="700">Story</text>
<text x="{70+cw+60}" y="520" font-size="84" font-weight="700">in Maps</text>
<rect x="{70+cw+60}" y="548" width="220" height="8" fill="#1f62c4"/><rect x="{70+cw+280}" y="548" width="110" height="8" fill="#1596ad"/><rect x="{70+cw+390}" y="548" width="110" height="8" fill="#e9a113"/>
<text x="{70+cw+60}" y="610" font-size="30" font-family="system-ui,sans-serif" fill="#3a4a63">Thirty-three maps</text><text x="{70+cw+60}" y="650" font-size="30" font-family="system-ui,sans-serif" fill="#3a4a63">from the patriarchs to today</text>
</g></svg>'''
with sync_playwright() as pw:
    b = pw.chromium.launch(); p = b.new_page(viewport={'width': 1280, 'height': 800}); p.set_content(f'<body style="margin:0">{svg}</body>')
    p.screenshot(path='/tmp/maps-cover.png'); b.close()
Image.open('/tmp/maps-cover.png').convert('RGB').resize((960, 600), Image.LANCZOS).save(f'{root}/tools/maps-cover.webp', quality=82)
