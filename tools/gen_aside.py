#!/usr/bin/env python3
"""Builds asides.json: sectioned asset lists for the right column. Run from the repo root."""
import json,re,glob,os
def title(p):
    try:s=open(p,encoding='utf8').read()
    except Exception:return None
    m=re.search(r'<title>([^<]*)</title>',s)
    return re.sub(r'\s*\|\s*Israel NOWlej\s*$','',m.group(1)).replace('&amp;','&').strip() if m else None
def leaves(pat):
    out=[]
    for p in sorted(glob.glob(pat)):
        t=title(p)
        if t:out.append([t,'/'+os.path.dirname(p)+'/'])
    return out
def idx(path,name):
    return [name,'/'+path+'/'] if os.path.exists(path+'/index.html') else None
A={}
A['maps']={'t':'Maps','g':[{'h':'All maps','u':'/maps/','i':leaves('maps/[0-9]*/*/index.html')}]}
A['tour']={'t':'Tours','g':[{'h':'Regions','u':'/tour/','i':[x for x in leaves('tour/*/index.html')]}]}
A['timelines']={'t':'Timelines','g':[{'h':'Timelines','u':'/timelines/','i':leaves('timelines/[0-9]*/*/index.html')}]}
A['charts']={'t':'Charts','g':[{'h':'Rankings','u':'/rankings/','i':leaves('rankings/[0-9]*/*/index.html')},{'h':'Demographics','u':'/demographics/','i':leaves('demographics/[0-9]*/*/index.html')},{'h':'Tables','u':'/tables/','i':leaves('tables/[0-9]*/*/index.html')},{'h':'Top ten','u':'/top-ten/','i':leaves('top-ten/[0-9]*/*/index.html')}]}
A['hot']={'t':'Topics','g':[{'h':'Topics','u':'/hot/','i':leaves('hot/*/index.html')}]}
A['glossary']={'t':'NOWlej','g':[{'h':'In NOWlej','u':'/glossary/','i':[['Maps','/maps/'],['Tours','/tour/'],['Timelines','/timelines/'],['Charts','/charts/'],['Topics','/hot/'],['Book','/about/'],['A to Z','/glossary/']]}]}
A['book']={'t':'Book','g':[{'h':'About the book','u':'/about/','i':[['About us','/about/'],['Use and citation','/cite/'],['Contact','/contact/'],['Legal notice','/legal/']]}]}
def srcjson(p):
    s=open(p,encoding='utf8').read();out=[]
    for m in re.finditer(r'\{"id": "[^"]*", "name": "([^"]*)"[^{}]*?"profile": "([^"]*)"',s):out.append([m.group(1),m.group(2)])
    return out
A['sources']={'t':'Sources','g':[{'h':'Publications','u':'/sources/','i':srcjson('sources/index.html')},{'h':'Influencers','u':'/sources/influencers/','i':srcjson('sources/influencers/index.html')},{'h':'Organizations','u':'/sources/organizations/','i':srcjson('sources/organizations/index.html')}]}
VS=[('toi','The Times of Israel'),('jpost','The Jerusalem Post'),('ynet','Ynetnews'),('haaretz','Haaretz'),('jns','JNS'),('jta','JTA'),('israelhayom','Israel Hayom'),('tablet','Tablet'),('mef','Middle East Forum'),('ji','Jewish Insider')]
A['views']={'t':'Views','g':[{'h':'By kind','u':'/views/','i':[['All views','/views/'],['Op-Ed','/views/#mode=topics&kind=Op-Ed'],['Editorial','/views/#mode=topics&kind=Editorial'],['Blogs','/views/#mode=topics&kind=Blog'],['Voices','/who/']]},{'h':'By source','u':'/sources/','i':[[n,'/views/#mode=topics&src=%s'%i] for i,n in VS]}]}
v=json.load(open('video.json'))
chs=[[c['name'],'/video/%s/'%c['handle'].lower()] for c in v['channels']]
pls=[[p['name'],'/playlists/#'+p['id']] for p in v['playlists']]
shows=[]
s=open('audio/index.html',encoding='utf8').read()
for m in re.finditer(r'<a href="(#s-[^"]+)"><span class="apic[^"]*"><span class="ini">[^<]*</span></span><span class="apn">([^<]*)</span>',s):shows.append([m.group(2),'/audio/'+m.group(1)])
ms=open('music.js',encoding='utf8').read()
gen=[[g[1],'/music/#genre='+g[0]] for g in re.findall(r"\['([a-z]*)','([^']*)'\]",re.search(r'GENRES=\[(.*?)\];',ms,re.S).group(1)) if g[0]]
art=[[a,'/music/#artist='+a.replace(' ','+')] for a in re.findall(r"'([^']+)'",re.search(r'ARTISTS=\[(.*?)\];',ms,re.S).group(1))]
isrc=open('images.js',encoding='utf8').read()
tags=[[t[1],'/images/#tag='+t[0]] for t in re.findall(r"\['([a-z-]*)','([^']*)'\]",re.search(r'TAGS=\[(.*?)\];',isrc,re.S).group(1)) if t[0]]
A['video']={'t':'Video','g':[{'h':'Channels','u':'/video/','i':chs}]}
A['playlists']={'t':'Playlists','g':[{'h':'Playlists','u':'/playlists/','i':pls}]}
A['audio']={'t':'Podcasts','g':[{'h':'Podcasts','u':'/audio/','i':shows}]}
A['music']={'t':'Music','g':[{'h':'Genres','u':'/music/','i':gen},{'h':'Musicians','u':'/music/','i':art}]}
A['images']={'t':'Images','g':[{'h':'Tags','u':'/images/','i':tags}]}
A['media']={'t':'Media','g':[{'h':'Video channels','u':'/video/','i':chs},{'h':'Podcasts','u':'/audio/','i':shows},{'h':'Music genres','u':'/music/','i':gen},{'h':'Image tags','u':'/images/','i':tags}]}
for k in A:A[k]['g']=[g for g in A[k]['g'] if g['i']]
json.dump(A,open('asides.json','w'),ensure_ascii=False,separators=(',',':'))
print({k:[len(g['i']) for g in A[k]['g']] for k in A})
