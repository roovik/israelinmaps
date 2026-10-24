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
        h = gen_dual.T.replace('%NUMUP%', str(n)).replace('Timeline %NUM%', f'Timeline {n} of {TOTAL}')
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
