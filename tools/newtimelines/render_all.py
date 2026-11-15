"""Render all 26 timelines with their new numbers. Usage: python3 render_all.py OUTDIR [png|pdf] [ids...]"""
import json, sys, os
sys.path.insert(0, os.path.dirname(__file__))
import gen, gen_dual, gen_period, shade
from playwright.sync_api import sync_playwright
R = json.load(open(os.path.join(os.path.dirname(__file__), 'registry.json')))
TOTAL = len(R)

def _w(lst, nf, fs):
    return sum((len(e[3]) + (len(e[4]) if nf == 5 else 0) + 24) for e in lst) * fs * fs
def balance(h, style, r):
    """Move the central axis so neither side is too crowded: width of each column follows the amount of text it carries."""
    tp, al = r['tp'], r['also']
    if style == 'std':
        kL, kR = _w(tp, 5, 14.6), _w(al, 4, 12.6) + 0.0001
        wL = max(300, min(520, 768 * kL / (kL + kR))); A = int(round(wL + 215))
        reps = [('.axis{position:absolute;left:685px;', f'.axis{{position:absolute;left:{A}px;'), ('.tick{position:absolute;left:685px;', f'.tick{{position:absolute;left:{A}px;'),
                ('.tl{position:absolute;left:687px;', f'.tl{{position:absolute;left:{A+2}px;'), ('.tp{position:absolute;right:629px;width:470px;', f'.tp{{position:absolute;right:{1314-A}px;width:{A-215}px;'),
                ('.al{position:absolute;left:811px;width:298px;', f'.al{{position:absolute;left:{A+126}px;width:{983-A}px;'), ("h1.style.right='629px'", f"h1.style.right='{1314-A}px'"),
                ("h2.style.left='811px'", f"h2.style.left='{A+126}px'"), ("'<path d=\"M578 '+y1+' H593 L685 '+y2+'\"", f"'<path d=\"M{A-107} '+y1+' H{A-92} L{A} '+y2+'\""),
                ("'<circle cx=\"685\" cy=\"'", f"'<circle cx=\"{A}\" cy=\"'"), ("'<path d=\"M736 '+y2+' L790 '+y1+' H804\"", f"'<path d=\"M{A+51} '+y2+' L{A+105} '+y1+' H{A+119}\""),
                ("'<circle cx=\"736\" cy=\"'", f"'<circle cx=\"{A+51}\" cy=\"'")]
    else:  # period
        kL, kR = _w(tp, 5, 14.2), _w(al, 4, 12.6) + 0.0001
        wL = max(250, min(480, 831 * kL / (kL + kR))); A = int(round(wL + 153))
        reps = [('.axis{position:absolute;left:367px;', f'.axis{{position:absolute;left:{A}px;'), ('.tick{position:absolute;left:367px;', f'.tick{{position:absolute;left:{A}px;'),
                ('.tl{position:absolute;left:370px;', f'.tl{{position:absolute;left:{A+3}px;'), ('.tp{position:absolute;right:885px;width:214px;', f'.tp{{position:absolute;right:{1252-A}px;width:{A-153}px;'),
                ('.al{position:absolute;left:492px;width:617px;', f'.al{{position:absolute;left:{A+125}px;width:{984-A}px;'), ("h1.style.right='885px'", f"h1.style.right='{1252-A}px'"),
                ("h2.style.left='492px'", f"h2.style.left='{A+125}px'"), ("'<path d=\"M320 '+y1+' H328 L367 '+y2+'\"", f"'<path d=\"M{A-47} '+y1+' H{A-39} L{A} '+y2+'\""),
                ("'<circle cx=\"367\" cy=\"'", f"'<circle cx=\"{A}\" cy=\"'"), ("'<path d=\"M418 '+y2+' L470 '+y1+' H486\"", f"'<path d=\"M{A+51} '+y2+' L{A+103} '+y1+' H{A+119}\""),
                ("'<circle cx=\"418\" cy=\"'", f"'<circle cx=\"{A+51}\" cy=\"'")]
    for a, b in reps:
        assert a in h, (style, a); h = h.replace(a, b)
    r['_axis'] = A
    return h

def html_for(r):
    n = r['n']; qr = gen.qr(f"https://israelinmaps.com/tl-{r['id']}")
    if r['style'] == 'std':
        D = dict(y0=r['y0'], y1=r['y1'], step=r['step'], tp=r['tp'], also=r['also'])
        h = gen.TPL.replace('%NUMUP%', str(n)).replace('Timeline %NUM%', f'Timeline {n} of {TOTAL}')
        if not os.environ.get('NOBAL'): h = balance(h, 'std', r)
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
        if not os.environ.get('NOBAL'): h = balance(h, 'period', r)
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
            print(r['id'], r['title'], 'over', pg.evaluate('window.OVER'), 'axis', r.get('_axis'))
            if fmt == 'pdf':
                pg.pdf(path=f"{out}/{r['id']}.pdf", width='1200px', height='1500px', print_background=True, page_ranges='1')
            else:
                pg.screenshot(path=f"{out}/{r['id']}.png")
            pg.close()
        b.close()
