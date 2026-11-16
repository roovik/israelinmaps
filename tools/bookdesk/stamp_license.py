"""Stamp the Israel NOWlej Digital Editions with a buyer's license line.

Each page gets a small footer: "Licensed to <organization> for up to <N> users. License <id>. Not for redistribution."
The same details go into the PDF's properties. Links, rollovers and QR codes are left as they are.

  python3 -I stamp_license.py --org "Beth El Day School" --users 100 [--titles all|nowlej,maps,time,zion] [--license NW-2026-0001] [--out out]

Masters are read from ./masters. Stamped copies are written to ./out/<license>/.
"""
import argparse, datetime, hashlib, os, re, sys
import pymupdf

TITLES = {'nowlej': 'IsraelNOWlej_Digital_Edition.pdf', 'maps': 'IsraelInMaps_Digital_Edition.pdf',
          'time': 'IsraelInTime_Digital_Edition.pdf', 'zion': 'WelcomeToZion_Digital_Edition.pdf'}

def license_id(org, users, day):
    h = hashlib.sha256(('%s|%s|%s' % (org.lower().strip(), users, day)).encode()).hexdigest()[:6].upper()
    return 'NW-%s-%s' % (day.replace('-', '')[2:], h)

def stamp(src, dst, org, users, lic, day):
    d = pymupdf.open(src)
    who = 'Licensed to %s for up to %s user%s.' % (org, users, '' if str(users) == '1' else 's')
    line = '%s License %s, %s. Not for redistribution.' % (who, lic, day)
    for p in d:
        r = p.rect
        size = 6.2
        while pymupdf.get_text_length(line, 'helv', size) > r.width - 190 and size > 4.5: size -= 0.2
        # bottom-left, clear of the page number and the QR code in the bottom-right corner
        p.insert_text((52, r.height - 11), line, fontname='helv', fontsize=size, color=(0.5, 0.5, 0.5), overlay=True)
    m = d.metadata or {}
    m['subject'] = line
    m['keywords'] = ('; '.join(x for x in [m.get('keywords') or '', 'License ' + lic, 'Licensee: ' + org] if x))
    d.set_metadata(m)
    d.save(dst, deflate=True, garbage=0)
    d.close()

def stamp_general(src, dst, kind):
    """One-time editions that need no buyer name: kind 'licensed' or 'review'."""
    d = pymupdf.open(src)
    line = {'licensed': 'Licensed edition. Not for redistribution. israelnowlej.com/groups',
            'review': 'Review copy, for evaluation only. Not for classroom use, sale or redistribution. israelnowlej.com/groups'}[kind]
    for p in d:
        r = p.rect
        p.insert_text((52, r.height - 11), line, fontname='helv', fontsize=6.2, color=(0.5, 0.5, 0.5), overlay=True)
        if kind == 'review':
            t = 'REVIEW COPY'; w = pymupdf.get_text_length(t, 'hebo', 7.5)
            x = (r.width - w) / 2
            p.draw_rect(pymupdf.Rect(x - 7, 9, x + w + 7, 23), color=None, fill=(0.72, 0.12, 0.12), overlay=True)
            p.insert_text((x, 19), t, fontname='hebo', fontsize=7.5, color=(1, 1, 1), overlay=True)
    m = d.metadata or {}; m['subject'] = line; d.set_metadata(m)
    d.save(dst, deflate=True, garbage=0); d.close()

def check(src, dst):
    a, b = pymupdf.open(src), pymupdf.open(dst)
    cnt = lambda d: (len(d), sum(len(p.get_links()) for p in d), sum(1 for p in d for _ in (p.widgets() or [])))
    ca, cb = cnt(a), cnt(b)
    return ca == cb, ca, cb

if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--org', default=''); ap.add_argument('--users', default='')
    ap.add_argument('--general', default='', help="'licensed' or 'review': one-time editions with no buyer name")
    ap.add_argument('--titles', default='all'); ap.add_argument('--license', default=''); ap.add_argument('--out', default='out')
    ap.add_argument('--masters', default='masters')
    a = ap.parse_args()
    if a.general:
        outdir = os.path.join(a.out, a.general); os.makedirs(outdir, exist_ok=True)
        tag = {'licensed': 'Licensed_Edition', 'review': 'Review_Copy'}[a.general]
        for k, fn in TITLES.items():
            src = os.path.join(a.masters, fn); dst = os.path.join(outdir, fn.replace('Digital_Edition', tag))
            stamp_general(src, dst, a.general); ok, ca, cb = check(src, dst)
            print(('OK  ' if ok else 'CHECK ') + dst, cb, round(os.path.getsize(dst) / 1e6, 1), 'MB')
        sys.exit(0)
    if not a.org or not a.users: sys.exit('--org and --users are needed')
    org = re.sub(r'\s+', ' ', a.org).strip()[:90]
    day = datetime.date.today().isoformat()
    lic = a.license or license_id(org, a.users, day)
    keys = list(TITLES) if a.titles == 'all' else [k.strip() for k in a.titles.split(',')]
    outdir = os.path.join(a.out, lic); os.makedirs(outdir, exist_ok=True)
    for k in keys:
        src = os.path.join(a.masters, TITLES[k]); dst = os.path.join(outdir, TITLES[k].replace('_Digital_Edition', '_Digital_Edition_' + lic))
        stamp(src, dst, org, a.users, lic, day)
        ok, ca, cb = check(src, dst)
        print(('OK  ' if ok else 'CHECK ') + dst, 'pages/links/rollovers', cb, '' if ok else 'master had %s' % (ca,), round(os.path.getsize(dst) / 1e6, 1), 'MB')
    print('License', lic)
