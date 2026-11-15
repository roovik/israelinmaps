#!/usr/bin/env python3
"""Builds /security/ and /diplomacy/ channel homes from the /charts/index.html shell. Re-run after edits."""
import os, re, html, json
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
E = html.escape
def card(href, img, title):
    return f'<a class="tcard" href="{href}"><span class="timg"><img src="{img}" alt="" width="480" height="360" loading="lazy"></span><span class="tb"><b>{E(title)}</b></span></a>'
CH = {
 'security': dict(
  title='Security', topic='security',
  lead="Israel fights on several fronts at once. Here are the latest security headlines, how its layered air defense works, and the maps, timelines and entries that explain how the country got here.",
  rx=r"idf|hamas|hezbollah|iran|houthis?|missiles?|rockets?|drones?|strikes?|gaza|lebanon|syria|hostages?|ceasefire|shin bet|terror\w*|soldiers?|military|defense|troops|attack\w*|bab el-mandeb|yemen",
  desc="Israeli security at a glance: the latest security headlines, how air defense works, and the maps, timelines and entries behind the fronts.",
  steps=[("Three layers","Iron Dome stops short-range rockets, David's Sling handles medium-range missiles, and Arrow intercepts long-range ballistic missiles."),
         ("Seven fronts","Since October 7, 2023, Israel has fought Hamas in Gaza and faced Hezbollah, Iran and its allies on other fronts. The timeline below walks through each one."),
         ("Narrow margins","Israel is about nine miles wide at its narrowest point, which is why warning time and depth have always shaped its defense.")],
  steps_h="How Israeli defense is built",
  bg=[("/maps/024/october-7-2023/","map-024","Map: October 7, 2023"),
      ("/timelines/026/the-seven-front-war/","tlf-tl-026","Timeline: The Seven-Front War"),
      ("/maps/025/gaza-peace-plan-and-control/","map-025","Map: Gaza, Peace Plan and Control"),
      ("/maps/028/northern-israel-and-southern/","map-028","Map: Northern Israel and Southern Lebanon"),
      ("/maps/029/israel-and-its-neighborhood/","map-029","Map: Israel and Its Neighborhood"),
      ("/maps/014/israels-narrow-waist/","map-014","Map: Israel's Narrow Waist"),
      ("/tables/004/wars-and-operations/","tbl-004","Wars and Operations"),
      ("/top-ten/002/ten-terror-attacks/","top-002","Ten Terror Attacks")],
  chips=[("IDF","idf"),("Hamas","hamas"),("Hezbollah","hezbollah"),("Iran","iran"),("Iron Dome","iron-dome"),("Gaza","gaza"),("Lebanon","lebanon"),("Syria","syria"),("October 7, 2023","october-7-2023-attack"),("Second Lebanon War","second-lebanon-war"),("Six-Day War","six-day-war"),("Yom Kippur War","yom-kippur-war"),("Osirak reactor","osirak-reactor"),("Entebbe raid","entebbe-raid")],
  chips_h="Forces, fronts and wars",
 ),
 'diplomacy': dict(
  title='Diplomacy', topic='diplomacy',
  lead="Israel's standing in the region and the world is changing. Here are the latest diplomatic headlines, the three waves of peace and normalization, and the maps, timelines and entries behind them.",
  rx=r"abraham accords|normaliz\w*|saudi|uae|emirates|dubai|abu dhabi|bahrain|morocco|egypt|jordan|turkey|erdogan|qatar|united nations|\bun\b|ambassador|diplomat\w*|envoy|summit|embassy|sanctions|\bicc\b|treaty|peace|rubio|witkoff|state department|foreign minister|talks",
  desc="Israeli diplomacy at a glance: the latest diplomatic headlines, how peace and normalization came in waves, and the maps, timelines and entries behind them.",
  steps=[("1979: Egypt","Egypt was the first Arab state to make peace, after the Camp David Accords. Israel left the Sinai in stages."),
         ("1994: Jordan","Jordan signed a treaty with Israel a year after the Oslo Accords, giving Israel a second peace across a long border."),
         ("2020: Abraham Accords","The United Arab Emirates and Bahrain normalized ties with Israel, followed by Morocco and Sudan. The United States brokered them.")],
  steps_h="How peace came in waves",
  bg=[("/timelines/025/abraham-accords-to-october-7/","tlf-tl-025","Timeline: Abraham Accords to October 7"),
      ("/maps/029/israel-and-its-neighborhood/","map-029","Map: Israel and Its Neighborhood"),
      ("/maps/021/peace-with-egypt-and-sinai/","map-021","Map: Peace with Egypt and Sinai"),
      ("/tables/005/summits-and-territorial-changes/","tbl-005","Summits and Territorial Changes"),
      ("/maps/011/un-partition-plan/","map-011","Map: UN Partition Plan"),
      ("/maps/009/setting-the-northern-border/","map-009","Map: Setting the Northern Border")],
  chips=[("Abraham Accords","abraham-accords"),("Camp David Accords","camp-david-accords"),("Israel-Egypt peace treaty","israel-egypt-peace-treaty"),("Oslo Accords","oslo-accords"),("Madrid Conference","madrid-peace-conference"),("Egypt","egypt"),("Jordan","jordan"),("UN Resolution 242","un-resolution-242"),("UN Partition Plan","un-partition-plan"),("Palestinian Authority","palestinian-authority"),("PLO","palestine-liberation-organization"),("Jared Kushner","jared-kushner")],
  chips_h="Agreements, partners and institutions",
 ),
}
CSS=open(f'{R}/politics_page_css.txt').read() if os.path.exists(f'{R}/politics_page_css.txt') else ''
src=open(f'{R}/tools/politics_page.py').read()
CSS=re.search(r"CSS='''(.*?)'''",src,re.S).group(1)
def chips(lst):
    return ''.join(f'<a class="pchip" href="/g/{s}/">{E(n)}</a>' for n,s in lst if os.path.isdir(os.path.join(R,'g',s)))
shell=open(f'{R}/charts/index.html').read()
for slug,c in CH.items():
    for h,img,_ in c['bg']:
        assert os.path.isdir(os.path.join(R,h.strip('/'))),h
        assert os.path.exists(f'{R}/img/t/{img}.webp'),img
    body=(CSS+f'<div class="hubslide pol"><h1>{c["title"]}</h1><p class="lead">{c["lead"]}</p>'
      f'<h2>Now in {c["title"].lower()}</h2><ul class="pnow" id="pol-now" data-topic="{c["topic"]}" data-rx="{E(c["rx"])}"><li><small>Loading headlines…</small></li></ul>'
      f'<p class="small"><a href="/news/#mode=topics&tp={c["topic"]}">All {c["title"].lower()} headlines</a></p>'
      f'<h2>{c["steps_h"]}</h2><div class="psteps">'+''.join(f'<div><b>{E(a)}</b>{E(b)}</div>' for a,b in c['steps'])+'</div>'
      '<h2>Background: maps, charts and timelines</h2><div class="tgrid">'+''.join(card(h,f'/img/t/{i}.webp',t) for h,i,t in c['bg'])+'</div>'
      f'<h2>{c["chips_h"]}</h2><div class="pchips">'+chips(c['chips'])+'</div>'
      '<p class="small"><a href="/politics/">Politics</a> · <a href="/security/">Security</a> · <a href="/diplomacy/">Diplomacy</a> · <a href="/glossary/">NOWlej A-Z</a></p></div>')
    i=shell.index('<div class="hubslide">'); j=shell.index('<div class="adslot" data-slot="lb-bottom"')
    page=shell[:i]+body+shell[j:]
    T=c['title']
    page=page.replace('<title>Charts | Israel NOWlej</title>',f'<title>{T} | Israel NOWlej</title>')
    page=re.sub(r'(<meta name="description" content=")[^"]*"',lambda m:m.group(1)+c['desc']+'"',page,count=1)
    page=page.replace('https://israelnowlej.com/charts/"',f'https://israelnowlej.com/{slug}/"')
    page=page.replace('property="og:title" content="Charts | Israel NOWlej"',f'property="og:title" content="{T} | Israel NOWlej"')
    page=re.sub(r'(property="og:description" content=")[^"]*"',lambda m:m.group(1)+c['desc']+'"',page,count=1)
    page=page.replace('</body>','<script src="/politics.js?v=3" defer></script></body>')
    os.makedirs(f'{R}/{slug}',exist_ok=True); open(f'{R}/{slug}/index.html','w').write(page)
    print(slug,len(chips(c['chips'])),'chips')
