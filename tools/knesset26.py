#!/usr/bin/env python3
"""Builds /charts/knesset-26/ (hemicycle + blocs) from the shell of /charts/index.html and links it from the Charts hub.
Source: Central Elections Committee final results, approved Nov 4, 2026 (via Times of Israel, Israel National News, Map the General)."""
import math, re, os, html
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# order = left to right in the chamber
P = [  # name, slug, seats, color, bloc, leader, note
 ("Joint List","joint-list",11,"#0e7a5f","arab","Yousef Jabareen","Arab-led alliance"),
 ("Ra'am","raam",8,"#47b58f","arab","Mansour Abbas","Islamist, Arab-led"),
 ("The Democrats","democrats-israel",8,"#1b4f9c","opp","Yair Golan","Left, successor to Labor and Meretz"),
 ("Yashar!","yashar",21,"#3f8cf0","opp","Gadi Eisenkot","Centrist, led the opposition camp"),
 ("Together (B'Yachad)","together-byachad",12,"#7db4f5","opp","Naftali Bennett","Center-right"),
 ("Yisrael Beytenu","yisrael-beiteinu",7,"#b5d3fa","opp","Avigdor Liberman","Secular right"),
 ("Likud","likud",27,"#d1481f","coal","Benjamin Netanyahu","Largest party"),
 ("Shas","shas",6,"#e8812e","coal","Aryeh Deri","Sephardi Haredi"),
 ("United Torah Judaism","united-torah-judaism",7,"#f0ad4e","coal","Haredi alliance","Ashkenazi Haredi"),
 ("Religious Zionism","religious-zionist-party",6,"#b8861b","coal","Bezalel Smotrich","Joint list with Zehut"),
 ("Otzma Yehudit","otzma-yehudit",7,"#8c2f1c","coal","Itamar Ben-Gvir","Far right"),
]
BL = {"arab":("Arab-led parties","#0e7a5f"),"opp":("Zionist opposition","#3f8cf0"),"coal":("Netanyahu bloc","#d1481f")}
tot = sum(p[2] for p in P); assert tot == 120
bs = {k: sum(p[2] for p in P if p[4]==k) for k in BL}
assert bs == {"arab":19,"opp":48,"coal":53}, bs
# hemicycle seats
rows=6; r0,r1=135,230; W,H=520,270; cx,cy=260,252
radii=[r0+(r1-r0)*i/(rows-1) for i in range(rows)]
tl=sum(radii); counts=[round(120*r/tl) for r in radii]
counts[-1]+=120-sum(counts)
seats=[]
for r,n in zip(radii,counts):
    for k in range(n):
        a=math.pi*(1-k/(n-1)); seats.append((a,r))
seats.sort(key=lambda t:(-t[0],t[1]))
owner=[p for p in P for _ in range(p[2])]
circles=[]
for (a,r),p in zip(seats,owner):
    x=cx+r*math.cos(a); y=cy-r*math.sin(a)
    circles.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="9" fill="{p[3]}"><title>{html.escape(p[0])}</title></circle>')
svg=(f'<svg class="k26hemi" viewBox="0 0 {W} {H}" role="img" aria-label="Hemicycle of the 120 seats in the 26th Knesset by party: Joint List 11, Ra\'am 8, Democrats 8, Yashar 21, Together 12, Yisrael Beytenu 7, Likud 27, Shas 6, United Torah Judaism 7, Religious Zionism 6, Otzma Yehudit 7.">'
     +''.join(circles)+f'<text x="{cx}" y="{cy-26}" text-anchor="middle" class="k26big">120</text><text x="{cx}" y="{cy-8}" text-anchor="middle" class="k26sm">seats · 61 for a majority</text></svg>')
# bloc bar
def seg(k):
    return f'<span style="width:{bs[k]/120*100:.2f}%;background:{BL[k][1]}" title="{BL[k][0]}: {bs[k]}"><b>{bs[k]}</b></span>'
bar=('<div class="k26bar" role="img" aria-label="Seats by bloc: Arab-led parties 19, Zionist opposition 48, Netanyahu bloc 53; 61 needed.">'
     +seg("arab")+seg("opp")+seg("coal")+'<i class="k26maj" style="left:50.83%"></i></div>'
     '<div class="k26barlab"><span style="color:'+BL["arab"][1]+'">Arab-led parties</span><span style="color:'+BL["opp"][1]+'">Zionist opposition</span><span style="color:'+BL["coal"][1]+'">Netanyahu bloc</span></div>')
# table
rows_html=''
for k in ("coal","opp","arab"):
    rows_html+=f'<tr class="k26grp"><th colspan="4"><i style="background:{BL[k][1]}"></i>{BL[k][0]} <b>{bs[k]}</b></th></tr>'
    for p in sorted([q for q in P if q[4]==k],key=lambda q:-q[2]):
        rows_html+=(f'<tr><td><i style="background:{p[3]}"></i><a href="/g/{p[1]}/">{html.escape(p[0])}</a></td>'
                    f'<td class="n">{p[2]}</td><td>{html.escape(p[5])}</td><td class="m">{html.escape(p[6])}</td></tr>')
CSS='''<style>
.k26 .lead{max-width:62ch}
.k26hemi{width:100%;max-width:640px;display:block;margin:.5rem auto}
.k26big{font:700 26px/1 system-ui,sans-serif;fill:var(--fg)}.k26sm{font:12px system-ui,sans-serif;fill:var(--mut)}
.k26bar{position:relative;display:flex;height:44px;border-radius:8px;overflow:visible;margin:1.6rem 0 .3rem}
.k26bar span{display:flex;align-items:center;justify-content:center;color:#fff;font-size:1.05rem}
.k26bar span:first-child{border-radius:8px 0 0 8px}.k26bar span:nth-child(3){border-radius:0 8px 8px 0}
.k26maj{position:absolute;top:-8px;bottom:-8px;width:0;border-left:2px dashed var(--fg)}
.k26maj:after{content:"61 needed";position:absolute;top:-18px;left:-30px;font:12px system-ui,sans-serif;font-style:normal;color:var(--fg);white-space:nowrap}
.k26barlab{display:flex;font-size:.9rem;font-weight:600;gap:1rem;justify-content:space-between}
.k26tbl{width:100%;border-collapse:collapse;margin:1.2rem 0;font-size:.95rem}
.k26tbl td,.k26tbl th{padding:.4rem .5rem;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}
.k26tbl .n{text-align:right;font-weight:700;width:3rem}.k26tbl .m{color:var(--mut)}
.k26tbl i,.k26grp i{display:inline-block;width:.8em;height:.8em;border-radius:50%;margin-right:.5em}
.k26grp th{background:var(--hl);font-size:1rem}.k26grp b{float:right}
@media(max-width:560px){.k26tbl .m{display:none}.k26big{font-size:22px}}
</style>'''
BODY=(CSS+'<div class="hubslide k26"><h1>The 26th Knesset: parties and blocs</h1>'
 '<p class="lead">The 120 seats chosen on October 27, 2026, from left to right in the chamber. The Netanyahu bloc won 53 seats, the Zionist opposition led by Gadi Eisenkot 48, and the two Arab-led parties 19. No bloc reached the 61 needed to govern alone, so coalition talks run through the Arab-led and ultra-Orthodox parties as well as the two main camps.</p>'
 +svg+bar+
 '<table class="k26tbl"><thead><tr><th>Party</th><th class="n">Seats</th><th>Leader</th><th class="m">Profile</th></tr></thead><tbody>'+rows_html+'</tbody></table>'
 '<p class="small">Final official results of the Central Elections Committee, approved November 4, 2026; the Knesset was sworn in on November 10. Blocs follow how the parties lined up before the vote and in the press: the Netanyahu bloc is the outgoing coalition, and the opposition is the Jewish-led camp that sought to replace it. Whether any party joins the other side is what the coalition talks will decide. Compared with 2022, the outgoing coalition parties lost 11 seats and Arab parties gained nine. Sources: Times of Israel, Israel National News, Map the General. Chart and layout by NOWlej.</p>'
 '<p class="small"><a href="/g/knesset/">Knesset</a> · <a href="/charts/">All charts</a></p></div>')
shell=open(f'{R}/charts/index.html').read()
i=shell.index('<div class="hubslide">'); j=shell.index('<div class="adslot" data-slot="lb-bottom"')
page=shell[:i]+BODY+'</div>'+shell[j:]
# fix: closing - hub had </div> closing hubslide before adslot; ensure balanced by reusing same tail
page=shell[:i]+BODY+shell[j:]
T="The 26th Knesset: parties and blocs"; D="Hemicycle and bloc chart of the 120 seats in the 26th Knesset, elected October 27, 2026: Netanyahu bloc 53, Zionist opposition 48, Arab-led parties 19."
page=page.replace('<title>Charts | Israel NOWlej</title>',f'<title>{T} | Israel NOWlej</title>')
page=re.sub(r'(<meta name="description" content=")[^"]*"',r'\1'+D+'"',page,count=1)
page=page.replace('href="https://israelnowlej.com/charts/"','href="https://israelnowlej.com/charts/knesset-26/"').replace('content="https://israelnowlej.com/charts/"','content="https://israelnowlej.com/charts/knesset-26/"')
page=page.replace('property="og:title" content="Charts | Israel NOWlej"',f'property="og:title" content="{T} | Israel NOWlej"')
page=re.sub(r'(property="og:description" content=")[^"]*"',r'\1'+D+'"',page,count=1)
os.makedirs(f'{R}/charts/knesset-26',exist_ok=True)
open(f'{R}/charts/knesset-26/index.html','w').write(page)
# hub link
hub=open(f'{R}/charts/index.html').read()
if 'knesset-26' not in hub:
    link='<h2>Politics</h2><p><a href="/charts/knesset-26/"><b>The 26th Knesset: parties and blocs</b></a>, the 120 seats and the Netanyahu, opposition and Arab-led blocs.</p>'
    hub=hub.replace('<h2>Calendars</h2>',link+'<h2>Calendars</h2>',1)
    open(f'{R}/charts/index.html','w').write(hub)
print('ok',counts,sum(counts))

# ---- compact widget for the home page / any slot: <div data-knesset></div> ----
svg_small=svg.replace('class="k26hemi"','class="k26hemi k26w"')
svg_small=re.sub(r'<text.*?</text><text.*?</text>','',svg_small)
legend=''.join(f'<span><i style="background:{p[3]}"></i>{html.escape(p[0])} {p[2]}</span>' for p in P)
card=('<div class="k26card"><div class="k26h"><b>The 26th Knesset</b><a href="/charts/knesset-26/">Parties and blocs ▸</a></div>'
      +svg_small+bar.replace('k26bar"','k26bar k26bars"')+'<div class="k26leg">'+legend+'</div></div>')
css=CSS.replace('<style>','').replace('</style>','')+'''
.k26card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:.8rem 1rem 1rem;margin:0 0 1.2rem}
.k26h{display:flex;justify-content:space-between;align-items:baseline;gap:1rem}.k26h b{font-size:1.15rem}.k26h a{font-size:.9rem}
.k26w{max-width:460px}.k26bars{height:34px;margin-top:1.8rem}.k26leg{display:flex;flex-wrap:wrap;gap:.3rem .9rem;font-size:.8rem;color:var(--mut);margin-top:.7rem}
.k26leg i{display:inline-block;width:.7em;height:.7em;border-radius:50%;margin-right:.35em}
'''
js=("(function(){try{var h="+__import__('json').dumps(card)+",c="+__import__('json').dumps(css)+";"
 "var st=document.createElement('style');st.textContent=c;document.head.appendChild(st);"
 "function mk(){var d=document.createElement('div');d.innerHTML=h;return d.firstChild}"
 "var s=document.querySelectorAll('[data-knesset]');s.forEach(function(e){e.appendChild(mk())});"
 "if(!s.length&&location.pathname==='/'){function put(n,o){var g=document.getElementById('news-grid');if(!g)return;n.classList.add('k26x');n.setAttribute('data-o',o);n.style.gridColumn='1/-1';function run(){if(n.parentNode===g)return;var a=g.querySelectorAll(':scope > article');if(a.length<9)return;var ref=a[8],nx=ref.nextSibling;while(nx&&nx.nodeType===1&&nx.classList.contains('k26x')&&+nx.getAttribute('data-o')<o){ref=nx;nx=nx.nextSibling}g.insertBefore(n,ref.nextSibling)}run();new MutationObserver(run).observe(g,{childList:true})}put(mk(),2)}"
 "}catch(e){}})();")
open(f'{R}/knesset26.js','w').write(js)
print('widget',len(js))
