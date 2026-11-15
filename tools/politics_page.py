#!/usr/bin/env python3
"""Builds /politics/ (channel home pilot) from the shell of /charts/index.html. Re-run after edits."""
import os, re, html
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
E = html.escape
def card(href, img, title):
    return f'<a class="tcard" href="{href}"><span class="timg"><img src="{img}" alt="" width="480" height="360" loading="lazy"></span><span class="tb"><b>{E(title)}</b></span></a>'
background = [
 ("/tables/002/knesset-elections/","/img/t/tbl-002.webp","Knesset Elections"),
 ("/tables/003/prime-ministers/","/img/t/tbl-003.webp","Prime Ministers"),
 ("/top-ten/001/ten-israeli-politicians/","/img/t/top-001.webp","Ten Israeli Politicians"),
 ("/demographics/006/haredi-share-of-jewish-israelis/","/img/t/dem-006.webp","Haredi Share of Jewish Israelis"),
 ("/demographics/007/religious-identity-of-jewish-adults/","/img/t/dem-007.webp","Religious Identity of Jewish Adults"),
 ("/maps/022/judea-and-samaria/","/img/t/map-022.webp","Map: Judea and Samaria"),
 ("/maps/012/war-of-independence-armistice/","/img/t/map-012.webp","Map: Armistice Lines of 1949"),
 ("/timelines/025/abraham-accords-to-october-7/","/img/t/tlf-tl-025.webp","Timeline: Abraham Accords to October 7"),
]
for h,_,_ in background:
    d=os.path.join(R,h.strip('/'))
    assert os.path.isdir(d), d
people=[("Benjamin Netanyahu","benjamin-netanyahu"),("Gadi Eisenkot","gadi-eisenkot"),("Naftali Bennett","naftali-bennett"),("Yair Golan","yair-golan"),("Avigdor Liberman","avigdor-liberman"),("Bezalel Smotrich","bezalel-smotrich"),("Itamar Ben-Gvir","itamar-ben-gvir"),("Aryeh Deri","aryeh-deri"),("Mansour Abbas","mansour-abbas"),("Yousef Jabareen","yousef-jabareen"),("Isaac Herzog","isaac-herzog")]
parties=[("Likud","likud"),("Yashar!","yashar"),("Together (B'Yachad)","together-byachad"),("Joint List","joint-list"),("The Democrats","democrats-israel"),("Ra'am","raam"),("Otzma Yehudit","otzma-yehudit"),("Yisrael Beytenu","yisrael-beiteinu"),("United Torah Judaism","united-torah-judaism"),("Shas","shas"),("Religious Zionism","religious-zionist-party"),("Knesset","knesset")]
def chips(lst):
    out=[]
    for n,s in lst:
        if os.path.isdir(os.path.join(R,'g',s)): out.append(f'<a class="pchip" href="/g/{s}/">{E(n)}</a>')
    return ''.join(out)
CSS='''<style>
.pol .lead{max-width:64ch}.pol h2{margin:1.6rem 0 .6rem}
.pol .tgrid{margin-top:.4rem}
.pnow{list-style:none;margin:0;padding:0}.pnow li{padding:.55rem 0;border-bottom:1px solid var(--line)}
.pnow a{font-weight:600;font-size:1.02rem}.pnow small{display:block;color:var(--mut);margin-top:.15rem}
.psteps{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:.8rem;margin:.6rem 0}
.psteps div{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:.7rem .9rem}.psteps b{display:block;margin-bottom:.25rem}
.pchips{display:flex;flex-wrap:wrap;gap:.45rem;margin:.3rem 0 1rem}
.pchip{padding:.28rem .7rem;border:1px solid var(--line);border-radius:999px;background:var(--card);font-size:.92rem}
</style>'''
BODY=(CSS+'<div class="hubslide pol"><h1>Politics</h1>'
 '<p class="lead">Israel\'s 26th Knesset is split three ways, so who governs depends on coalition talks. Here is the picture at a glance, the latest political headlines, and the maps, charts and entries that explain how Israeli politics works.</p>'
 '<div data-knesset></div>'
 '<h2>Now in politics</h2><ul class="pnow" id="pol-now" data-topic="politics"><li><small>Loading headlines…</small></li></ul>'
 '<p class="small"><a href="/news/#mode=topics&tp=politics">All political headlines</a></p>'
 '<h2>How a government is formed</h2><div class="psteps">'
 '<div><b>1. The President chooses</b>After consulting the parties, the President asks the member with the best chance of a majority to try. That is usually a party leader.</div>'
 '<div><b>2. 61 of 120</b>The candidate has 28 days to sign up 61 members, and the President can extend that by up to 14 days.</div>'
 '<div><b>3. If it fails</b>The President can turn to another member. If no one succeeds, the Knesset itself can choose a candidate, and if that fails too, the country votes again.</div></div>'
 '<h2>Background: maps, charts and timelines</h2><div class="tgrid">'+''.join(card(*b) for b in background)+'</div>'
 '<h2>The parties</h2><div class="pchips">'+chips(parties)+'</div>'
 '<h2>The leaders</h2><div class="pchips">'+chips(people)+'</div>'
 '<p class="small"><a href="/charts/knesset-26/">Full chart: the 26th Knesset by party and bloc</a> · <a href="/glossary/">NOWlej A-Z</a></p></div>')
shell=open(f'{R}/charts/index.html').read()
i=shell.index('<div class="hubslide">'); j=shell.index('<div class="adslot" data-slot="lb-bottom"')
page=shell[:i]+BODY+shell[j:]
T="Politics"; D="Israeli politics at a glance: the 26th Knesset by party and bloc, the latest political headlines, how a government is formed, and the maps, charts and entries behind them."
page=page.replace('<title>Charts | Israel NOWlej</title>',f'<title>{T} | Israel NOWlej</title>')
page=re.sub(r'(<meta name="description" content=")[^"]*"',lambda m:m.group(1)+D+'"',page,count=1)
page=page.replace('https://israelnowlej.com/charts/"','https://israelnowlej.com/politics/"')
page=page.replace('property="og:title" content="Charts | Israel NOWlej"',f'property="og:title" content="{T} | Israel NOWlej"')
page=re.sub(r'(property="og:description" content=")[^"]*"',lambda m:m.group(1)+D+'"',page,count=1)
page=page.replace('</body>','<script src="/politics.js?v=2" defer></script></body>')
os.makedirs(f'{R}/politics',exist_ok=True); open(f'{R}/politics/index.html','w').write(page)
print('ok',len(chips(parties)),len(chips(people)))
