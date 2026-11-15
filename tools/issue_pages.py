#!/usr/bin/env python3
"""Builds /issues/ and /issues/<slug>/ for the five issues in focus. Re-run from the repo root after edits.
Timelines come from tools/newtimelines/registry.json (include/exclude regexes) plus hand-added EXTRA events."""
import os, re, html, json
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
E = html.escape
REG = json.load(open(f'{R}/tools/newtimelines/registry.json'))
def pool():
    out = []
    for r in REG:
        for kind in ('tp', 'also'):
            for it in r.get(kind, []):
                if kind == 'tp': head, text = it[3], it[4]
                else: head, text = '', it[3]
                out.append(dict(lab=it[0], y=it[1], kind=kind, head=head, text=text))
    seen = set(); u = []
    for p in out:
        k = (p['lab'], p['head'] or p['text'][:40])
        if k not in seen: seen.add(k); u.append(p)
    return u
POOL = pool()
def pick(inc, exc, y0, y1=3000, tp_only=False):
    r = []
    for p in POOL:
        t = p['head'] + ' ' + p['text']
        if p['y'] < y0 or p['y'] > y1: continue
        if tp_only and p['kind'] != 'tp': continue
        if re.search(inc, t, re.I) and not (exc and re.search(exc, t, re.I)): r.append(p)
    return r
def first(s):
    m = re.match(r'(.+?[.!?])(\s|$)', s); return m.group(1) if m else s
ISSUES = [
 dict(slug='coalition-talks', title='Coalition talks', short='Coalition talks', img='/img/t/tbl-002.webp',
  desc="Coalition talks after Israel's 26th Knesset election: the latest headlines, views, who holds the seats and how Israeli governments have been formed since 1949.",
  lead="Israel is governed by coalitions, because no party has ever won a majority of the Knesset's 120 seats on its own. After the 26th Knesset election, no bloc reached 61 seats, so the parties are bargaining over who forms the government and on what terms.",
  rx="coalition|knesset|eisenkot|netanyahu|haredi parties|yashar|likud|bennett|lapid|gantz|prime minister|herzog|elections?",
  vrx="coalition|knesset|netanyahu|election|likud|bennett|lapid|government",
  vid="knesset|election|netanyahu|coalition|bennett|israeli politics",
  q="coalition",
  stakes=[("The 61-seat rule","A government needs the support of 61 of 120 Knesset members. The president asks the candidate with the best chance to try to form one, and that candidate has weeks to succeed."),
          ("Small parties, big leverage","When the blocs are close, a party with only a handful of seats can decide who governs. Its demands usually cover ministries, budgets and laws it cares about."),
          ("The Haredi parties","Shas and United Torah Judaism have often been kingmakers, and the military draft for the ultra-Orthodox is among the hardest issues in any negotiation.")],
  inc=r"becomes prime minister|returns as prime minister|Election:|unity government|upheaval|Rabin returns|Rabin is assassinated|rotation", exc=r"narrowly beats|Barak beats|Special election|Beiteinu|Eurovision|Palestinian|Hamas wins|Sadat|Shimon Peres becomes|Shamir returns|Election: (Likud wins (48|40|38|32|30)|Labor|Kadima|Alignment wins)", y0=1977, tp_only=False, cap=22,
  extra=[(2026.82,'2026 Oct 27','Election for the 26th Knesset. No bloc reaches 61 seats, and coalition talks begin.')],
  bg=[("/charts/knesset-26/","tbl-002","Chart: The 26th Knesset"),("/tables/002/knesset-elections/","tbl-002","Table: Knesset elections"),("/tables/003/prime-ministers/","tbl-003","Table: Prime ministers"),("/demographics/006/haredi-share-of-jewish-israelis/","dem-006","Chart: Haredi share of Jewish Israelis")],
  chips=[("The Knesset","knesset"),("Shas","shas"),("United Torah Judaism","united-torah-judaism"),("The Haredim","haredim")]),
 dict(slug='iran', title='Iran', short='Iran', img='/img/t/map-029.webp',
  desc="Israel and Iran: the latest headlines and views, why Iran's nuclear and missile programs and its allies matter to Israel, and a timeline from 1979 to the twelve-day war.",
  lead="Iran's government calls for Israel's destruction and backs Hamas, Hezbollah and the Houthis. Israel treats Iran's nuclear and missile programs as a threat to its existence. After the twelve-day war of June 2025, the question is what Iran can rebuild and what Israel will do about it.",
  rx=r"iran\w*|tehran|ayatollah|khamenei|irgc|nuclear|houthis?|hezbollah|missiles?",
  vrx="iran|nuclear|tehran|houthi|hezbollah",
  vid="iran|nuclear|hezbollah|houthi|tehran",
  q="Iran",
  stakes=[("Nuclear program","Israel and its allies fear that Iran's enrichment of uranium could lead to a bomb. Iran says its program is peaceful."),
          ("Missiles","Iran fired hundreds of missiles and drones at Israel in April and October 2024 and again in June 2025. Most were intercepted, and a few caused deaths and damage."),
          ("The allies","Hezbollah in Lebanon, the Houthis in Yemen and militias elsewhere are armed and funded by Iran. They are why Israel's wars on several fronts are linked.")],
  inc=r"\bIran|Osirak|Hezbollah|Houthi|Nasrallah|Khomeini", exc=r"Iranian Jews|Jews arrive|Accountability|Grapes of Wrath", y0=1979, cap=16,
  extra=[(1979.1,'1979 Feb','The Islamic Revolution in Iran. The new government cuts ties with Israel and makes opposition to it a founding principle.')],
  bg=[("/maps/029/israel-and-its-neighborhood/","map-029","Map: Israel and Its Neighborhood"),("/maps/028/northern-israel-and-southern/","map-028","Map: Northern Israel and Southern Lebanon"),("/timelines/026/the-seven-front-war/","tlf-tl-026","Timeline: The Seven-Front War"),("/tables/004/wars-and-operations/","tbl-004","Wars and Operations")],
  chips=[("Iran","iran"),("Iranian Jews","iranian-jews"),("Hezbollah","hezbollah"),("Lebanon","lebanon"),("Syria","syria"),("Iron Dome","iron-dome")]),
 dict(slug='gaza', title='Gaza', short='Gaza', img='/img/t/map-025.webp',
  desc="Gaza and Israel: the latest headlines and views, the October 2025 ceasefire and peace plan, and a timeline from the Six-Day War to today.",
  lead="Israel left Gaza completely in 2005. Hamas took over in 2007 and Gaza has been the center of Israel's wars since then, including the war that followed October 7, 2023. A ceasefire under a United States plan took effect in October 2025, and who controls the Strip is still unresolved.",
  rx="gaza|hamas|hostages?|rafah|khan younis|sinwar|ceasefire|peace plan|board of peace",
  vrx="gaza|hamas|hostage|ceasefire",
  vid="gaza|hamas|hostage|october 7|ceasefire",
  q="Gaza",
  stakes=[("Who governs Gaza","Hamas says it will not disarm. Israel says it will not accept a Hamas-run Gaza. The peace plan assumes an outside administration and security force, and the details are the hard part."),
          ("The hostages","Hamas took about 250 hostages on October 7. Most were freed in truces and deals, and the plan's first phase covered the surviving hostages."),
          ("Rebuilding","Large areas of the Strip are in ruins. Any rebuilding depends on security, funding and who is in charge.")],
  inc=r"Gaza|Hamas|Sinwar|Shalit|Cast Lead|Pillar of Defense|Protective Edge|Guardian of the Walls", exc=r"Entebbe|Sharon becomes|Shamir|flotilla|Sinai and Gaza|Great March", y0=1987, cap=20,
  extra=[],
  bg=[("/maps/025/gaza-peace-plan-and-control/","map-025","Map: Gaza, Peace Plan and Control"),("/maps/023/gaza-before-the-disengagement/","map-023","Map: Gaza before the Disengagement"),("/maps/024/october-7-2023/","map-024","Map: October 7, 2023"),("/timelines/024/disengagement-and-the-gaza-wars/","tlf-tl-024","Timeline: Disengagement and the Gaza Wars")],
  chips=[("Gaza","gaza"),("Hamas","hamas"),("Disengagement from Gaza","disengagement-from-gaza"),("October 7, 2023","october-7-2023-attack"),("Operation Cast Lead","operation-cast-lead"),("Operation Protective Edge","operation-protective-edge"),("Gaza border kibbutzim","gaza-border-kibbutzim")]),
 dict(slug='haredi-draft', title='Haredi draft', short='Haredi draft', img='/img/t/dem-006.webp',
  desc="The Haredi draft in Israel: the latest headlines and views, why ultra-Orthodox men have been exempt, the court rulings, and a timeline from 1948.",
  lead="Most Jewish Israelis, men and women, serve in the army. Many ultra-Orthodox (Haredi) men have instead studied in yeshivas under a deferment that began in 1948. The Supreme Court has repeatedly ruled that the exemption needs a legal basis, and the war has made the question more urgent and more divisive.",
  rx="haredi|haredim|draft|ultra.orthodox|yeshiva|shas|torah judaism|conscription|exemption|gafni|goldknopf",
  vrx="haredi|draft|ultra-orthodox|yeshiva|conscription",
  vid="haredi|draft|ultra-orthodox|yeshiva|conscription",
  q="haredi",
  stakes=[("The argument for exemption","Haredi leaders say that full-time Torah study is a national and religious mission, that army life endangers their communities' way of life, and that their numbers should not be forced into uniform."),
          ("The argument for a draft","Critics, including many soldiers and reservists, say that service should be shared by everyone, especially during the war, and that a deferment for one large group is unfair."),
          ("The coalition link","The Haredi parties usually insist on protecting the exemption as a condition for joining a coalition, which ties the draft to every round of coalition talks.")],
  inc=r"zzzz", exc=None, y0=1948, cap=0,
  extra=[(1948.4,'1948','David Ben-Gurion exempts about 400 yeshiva students from service so that Torah study can continue after the Holocaust.'),
         (1977.4,'1977','Menachem Begin’s government, which includes Haredi parties, widens the deferment, and the number of exempt students grows.'),
         (1999.5,'1999','The Supreme Court rules that the defense minister has no authority to grant the exemption on his own, which pushes the Knesset to legislate.'),
         (2002.5,'2002','The Knesset passes the Tal Law, which allows yeshiva students to defer service and later be exempted.'),
         (2012.1,'2012','The Supreme Court strikes down the Tal Law as unequal. The law expires and the argument begins again.'),
         (2014.2,'2014','The Knesset passes a new law with draft targets and penalties for the Haredi community. The Supreme Court strikes down its main parts in 2017.'),
         (2023.8,'2023 Oct 7','The war creates a large need for troops. The question of the exemption becomes more urgent.'),
         (2024.5,'2024 Jun 25','The Supreme Court unanimously rules that the government must begin drafting yeshiva students.'),
         (2025.55,'2025 Jul','United Torah Judaism and Shas leave the government in a dispute over a draft bill. Shas stays in the coalition for a time as a supporter.'),
         (2026.82,'2026 Oct 27','The 26th Knesset election puts the Haredi parties at the center of the coalition talks.')],
  bg=[("/demographics/006/haredi-share-of-jewish-israelis/","dem-006","Chart: Haredi share of Jewish Israelis"),("/demographics/007/religious-identity-of-jewish-adults/","dem-007","Chart: Religious identity"),("/tables/002/knesset-elections/","tbl-002","Table: Knesset elections")],
  chips=[("The Haredim","haredim"),("Shas","shas"),("United Torah Judaism","united-torah-judaism"),("Torah","torah"),("Israel Defense Forces","israel-defense-forces")]),
 dict(slug='regional-diplomacy', title='Regional diplomacy', short='Regional diplomacy', img='/img/t/tlf-tl-025.webp',
  desc="Israel's regional diplomacy: the latest headlines and views on Turkey, Syria, Lebanon and the Gulf, and a timeline from the peace with Egypt to the Abraham Accords.",
  lead="Israel now has peace treaties with Egypt and Jordan, and normalized ties with the United Arab Emirates, Bahrain, Morocco and Sudan under the Abraham Accords. The region is still being reordered, with Turkey pushing into Syria and Lebanon, Gulf states weighing their next steps and Saudi Arabia still undecided.",
  rx=r"turkey|erdogan|syria|lebanon|saudi|dubai|emirates|uae|bahrain|egypt|jordan|qatar|morocco|abraham accords|normaliz\w*|ankara|damascus|beirut|cairo",
  vrx="turkey|syria|lebanon|saudi|abraham|normaliz|gulf|emirates|egypt|jordan",
  vid="abraham accords|saudi|turkey|syria|lebanon|normalization",
  q="Turkey",
  stakes=[("Treaties that held","The peace with Egypt (1979) and Jordan (1994) has lasted through wars and crises, though both are often called a cold peace."),
          ("The Abraham Accords","The UAE and Bahrain normalized ties in 2020, followed by Morocco and Sudan. Trade, flights and tourism grew quickly."),
          ("The next steps","Saudi Arabia has linked normalization to progress toward a Palestinian state. Turkey's role in Syria and Lebanon, and the new government in Damascus, change Israel's northern calculations.")],
  inc=r"Accords|peace treaty|Camp David|Oslo|Madrid|Sadat|embassy|Peace with Jordan|Peace with Egypt|Resolution 242|Resolution 2334", exc=r"Buenos Aires|Zionism is racism|Nobel|Territory|Oslo II|Arafat meet", y0=1967, cap=14,
  extra=[],
  bg=[("/timelines/025/abraham-accords-to-october-7/","tlf-tl-025","Timeline: Abraham Accords to October 7"),("/maps/029/israel-and-its-neighborhood/","map-029","Map: Israel and Its Neighborhood"),("/maps/021/peace-with-egypt-and-sinai/","map-021","Map: Peace with Egypt and Sinai"),("/tables/005/summits-and-territorial-changes/","tbl-005","Table: Summits and Territorial Changes")],
  chips=[("Abraham Accords","abraham-accords"),("Camp David Accords","camp-david-accords"),("Oslo Accords","oslo-accords"),("Egypt","egypt"),("Jordan","jordan"),("Lebanon","lebanon"),("Syria","syria")]),
]
def events(I):
    ev = [dict(y=p['y'], lab=p['lab'], head=p['head'], text=first(p['text']) if p['head'] else p['text']) for p in pick(I['inc'], I['exc'], I['y0'])] if I['cap'] else []
    if len(ev) > I['cap']:
        tp = [e for e in ev if e['head']]; al = [e for e in ev if not e['head']]
        keep = tp + al[:max(0, I['cap'] - len(tp))]; ev = keep
    for y, lab, t in I['extra']: ev.append(dict(y=y, lab=lab, head='', text=t))
    ev.sort(key=lambda e: e['y']); return ev
def timeline(ev):
    L = R_ = 0; out = []
    for e in ev:
        w = len(e['head']) * 1.4 + len(e['text'])
        side = 'l' if L <= R_ else 'r'
        if side == 'l': L += w
        else: R_ += w
        h = f"<b>{E(e['head'])}</b> " if e['head'] else ''
        out.append(f'<li class="{side}"><span class="d">{E(e["lab"])}</span><p>{h}{E(e["text"])}</p></li>')
    return '<ol class="itl">' + ''.join(out) + '</ol>'
CSS = re.search(r"CSS='''(.*?)'''", open(f'{R}/tools/politics_page.py').read(), re.S).group(1)
CSS += '''<style>.itl{list-style:none;margin:1rem 0 1.5rem;padding:0;position:relative}.itl:before{content:"";position:absolute;left:50%;top:0;bottom:0;width:3px;background:var(--line);transform:translateX(-50%)}
.itl li{position:relative;width:50%;box-sizing:border-box;padding:.1rem 1.6rem .9rem 0;text-align:right;clear:both}.itl li.r{margin-left:50%;padding:.1rem 0 .9rem 1.6rem;text-align:left}
.itl li:before{content:"";position:absolute;top:.45rem;right:-6px;width:11px;height:11px;border-radius:50%;background:var(--acc,#2f6db5)}.itl li.r:before{right:auto;left:-6px}
.itl .d{display:block;font-weight:700;font-size:.85rem;color:var(--mut)}.itl p{margin:.1rem 0 0;font-size:.92rem;line-height:1.4}
@media(max-width:640px){.itl:before{left:6px}.itl li,.itl li.r{width:auto;margin-left:0;padding:.1rem 0 .9rem 1.6rem;text-align:left}.itl li:before,.itl li.r:before{left:0;right:auto}}
.ihub{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:.9rem}.ihub a{display:block;text-decoration:none;color:inherit;background:var(--card);border:1px solid var(--line);border-radius:10px;overflow:hidden}.ihub img{width:100%;aspect-ratio:4/3;object-fit:cover;object-position:top;display:block}.ihub div{padding:.6rem .8rem .8rem}.ihub b{display:block;font-size:1.05rem}.ihub span{font-size:.85rem;color:var(--mut)}
.ivid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:.7rem}.ivid a{text-decoration:none;color:inherit;font-size:.85rem}.ivid img{width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:8px;display:block;margin-bottom:.25rem}.ivid small{display:block;color:var(--mut)}</style>'''
def card(h, img, t):
    return f'<a class="tcard" href="{h}"><span class="timg"><img src="/img/t/{img}.webp" alt="" width="480" height="360" loading="lazy"></span><span class="tb"><b>{E(t)}</b></span></a>'
def chips(l): return ''.join(f'<a class="pchip" href="/g/{s}/">{E(n)}</a>' for n, s in l if os.path.isdir(f'{R}/g/{s}'))
shell = open(f'{R}/charts/index.html').read()
def build(slug, title, desc, body):
    p = shell
    i = p.index('<div class="hubslide">'); j = p.index('<div class="adslot" data-slot="lb-bottom"')
    p = p[:i] + body + p[j:]
    p = p.replace('<title>Charts | Israel NOWlej</title>', f'<title>{E(title)} | Israel NOWlej</title>')
    p = re.sub(r'(<meta name="description" content=")[^"]*"', lambda m: m.group(1) + E(desc) + '"', p, count=1)
    p = p.replace('https://israelnowlej.com/charts/"', f'https://israelnowlej.com/{slug}/"')
    p = p.replace('property="og:title" content="Charts | Israel NOWlej"', f'property="og:title" content="{E(title)} | Israel NOWlej"')
    p = re.sub(r'(property="og:description" content=")[^"]*"', lambda m: m.group(1) + E(desc) + '"', p, count=1)
    p = p.replace('</body>', '<script src="/issues.js?v=1" defer></script></body>')
    os.makedirs(f'{R}/{slug}', exist_ok=True); open(f'{R}/{slug}/index.html', 'w').write(p)
NAV = '<p class="small"><a href="/issues/">All issues</a> · <a href="/politics/">Politics</a> · <a href="/security/">Security</a> · <a href="/diplomacy/">Diplomacy</a> · <a href="/glossary/">NOWlej A-Z</a></p>'
for I in ISSUES:
    for h, img, _ in I['bg']:
        assert os.path.isdir(R + h.rstrip('/')), h
        assert os.path.exists(f'{R}/img/t/{img}.webp'), img
    ev = events(I)
    body = (CSS + f'<div class="hubslide pol" id="iss" data-rx="{E(I["rx"])}" data-vrx="{E(I["vrx"])}" data-vid="{E(I["vid"])}"><h1>{E(I["title"])}</h1><p class="lead">{E(I["lead"])}</p>'
      '<h2>Now</h2><ul class="pnow" id="i-now"><li><small>Loading headlines…</small></li></ul>'
      f'<p class="small"><a href="/search/?q={E(I["q"])}">All stories on this issue</a></p>'
      '<h2>What is at stake</h2><div class="psteps">' + ''.join(f'<div><b>{E(a)}</b>{E(b)}</div>' for a, b in I['stakes']) + '</div>'
      '<h2>Views</h2><ul class="pnow" id="i-views"><li><small>Loading views…</small></li></ul><p class="small"><a href="/views/">All views</a></p>'
      '<h2>Watch</h2><div class="ivid" id="i-vid"><small>Loading videos…</small></div><p class="small"><a href="/media/">All media</a></p>'
      f'<h2>How we got here</h2>{timeline(ev)}'
      '<h2>Background: maps, charts and timelines</h2><div class="tgrid">' + ''.join(card(*b) for b in I['bg']) + '</div>'
      f'<h2>Entries</h2><div class="pchips">{chips(I["chips"])}</div>' + NAV + '</div>')
    build(f'issues/{I["slug"]}', I['title'], I['desc'], body)
    print(I['slug'], len(ev), 'events')
hub = (CSS + '<div class="hubslide pol"><h1>Issues in focus</h1><p class="lead">The stories behind the headlines. Each page gathers the latest news, views and videos on one issue, with a timeline and the background to understand it.</p><div class="ihub">' +
  ''.join(f'<a href="/issues/{I["slug"]}/"><img src="{I["img"]}" alt="" loading="lazy"><div><b>{E(I["title"])}</b><span>{E(I["lead"].split(". ")[0])}.</span></div></a>' for I in ISSUES) + '</div>' + NAV + '</div>')
build('issues', 'Issues in focus', 'The issues behind the news in Israel: coalition talks, Iran, Gaza, the Haredi draft and regional diplomacy, each with news, views, videos and a timeline.', hub)
json.dump([(I['slug'], I['title']) for I in ISSUES], open(f'{R}/tools/issues.json', 'w'))
