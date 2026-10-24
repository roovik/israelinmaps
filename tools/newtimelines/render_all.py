"""Render all 26 timelines with their new numbers. Usage: python3 render_all.py OUTDIR [png|pdf] [ids...]"""
import json, sys, os
sys.path.insert(0, os.path.dirname(__file__))
import gen, gen_dual, gen_period, shade
from playwright.sync_api import sync_playwright
R = json.load(open(os.path.join(os.path.dirname(__file__), 'registry.json')))
TOTAL = len(R)
def html_for(r):
    n = r['n']; qr = gen.qr(f"https://israelinmaps.com/tl-{r['id']}")
    if r['style'] == 'std':
        D = dict(y0=r['y0'], y1=r['y1'], step=r['step'], tp=r['tp'], also=r['also'])
        h = gen.TPL.replace('%NUMUP%', str(n)).replace('Timeline %NUM%', f'Timeline {n} of {TOTAL}')
    elif r['style'] == 'dual':
        D = dict(y0=r['y0'], y1=r['y1'], step=r['step'], left=r['left'], right=r['right'], tp=[], also=[])
        def w(lst): return sum(len(e[4]) + 1.4 * len(e[3]) + len(e[0]) + 40 for e in lst)
        L, Rw = w(r['left']), w(r['right']); lw = max(300, min(720, 876 * L / (L + Rw))); A = int(109 + lw + 23)
        h = gen_dual.T
        for x, y in [('.axis{position:absolute;left:575px;', f'.axis{{position:absolute;left:{A}px;'), ('.tick{position:absolute;left:575px;', f'.tick{{position:absolute;left:{A}px;'),
                     ('.tl{position:absolute;left:577px;', f'.tl{{position:absolute;left:{A+2}px;'), ('.tp{position:absolute;right:648px;width:443px;', f'.tp{{position:absolute;right:{1223-A}px;width:{A-132}px;'),
                     ('.al{position:absolute;left:676px;width:433px;', f'.al{{position:absolute;left:{A+101}px;width:{1008-A}px;'), ("h1.style.right='648px'", f"h1.style.right='{1223-A}px'"),
                     ("h2.style.left='676px'", f"h2.style.left='{A+101}px'"), ("'<path d=\"M556 '+y1+' H562 L575 '+y2+'\"", f"'<path d=\"M{A-19} '+y1+' H{A-13} L{A} '+y2+'\""),
                     ("'<circle cx=\"575\" cy=\"'", f"'<circle cx=\"{A}\" cy=\"'"), ("'<path d=\"M626 '+y2+' L640 '+y1+' H669\"", f"'<path d=\"M{A+51} '+y2+' L{A+65} '+y1+' H{A+94}\""),
                     ("'<circle cx=\"626\" cy=\"'", f"'<circle cx=\"{A+51}\" cy=\"'")]:
            assert x in h, x; h = h.replace(x, y)
        h = h.replace('%NUMUP%', str(n)).replace('Timeline %NUM%', f'Timeline {n} of {TOTAL}')
    else:
        span = r['y1'] - r['y0']; D = dict(y0=r['y0'], y1=r['y1'], step=1 if span <= 13 else 2 if span <= 26 else 5 if span <= 60 else 10, tp=r['tp'], also=r['also'])
        h = gen_period.T.replace('%RUNR%', f'TIMELINE {n}').replace('The State of Israel', f'Timeline {n} of {TOTAL}')
    return shade.inject(h.replace('%FONTS%', gen.FONTS).replace('%TITLE%', r['title']).replace('%RNG%', r['rng']).replace('%INTRO%', r['intro'])
             .replace('%ID%', r['id']).replace('%QR%', qr).replace('%CAT%', json.dumps(gen.CAT)).replace('%DATA%', json.dumps(D)), r['y0'], r['y1'])
if __name__ == '__main__':
    out = sys.argv[1]; fmt = sys.argv[2] if len(sys.argv) > 2 else 'png'; only = sys.argv[3:]
    os.makedirs(out, exist_ok=True)
    with sync_playwright() as p:
        b = p.chromium.launch()
        for r in R:
            if only and r['id'] not in only: continue
            pg = b.new_page(viewport={'width': 1200, 'height': 1500}); pg.on('pageerror', lambda e: print('ERR', e))
            pg.set_content(html_for(r)); pg.wait_for_function('window.OVER!==undefined && window.SHADE')
            print(r['id'], r['title'], 'over', pg.evaluate('window.OVER'))
            if fmt == 'pdf':
                pg.pdf(path=f"{out}/{r['id']}.pdf", width='1200px', height='1500px', print_background=True, page_ranges='1')
            else:
                pg.screenshot(path=f"{out}/{r['id']}.png")
            pg.close()
        b.close()
