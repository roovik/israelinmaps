#!/usr/bin/env python3
"""Builds /focus.js: the 'In focus' strip (3-5 current issues, each with a NOWlej visual) shown at the top of each main channel.
Edit ISSUES to change what is in focus, re-run, and bump the ?v= in site.js loader."""
import os, json, html
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ISSUES = [  # title, blurb, image, background link, background label, search query
 ("Coalition talks","No bloc reached 61 seats. Likud and Yashar are negotiating, and both camps are courting the Haredi parties.","/img/t/tbl-002.webp","/charts/knesset-26/","The 26th Knesset","coalition"),
 ("Iran","US intelligence reportedly believes Iran may still hold up to 2,500 missiles, and Israel's defense establishment is weighing a possible strike.","/img/t/map-029.webp","/g/iran/","Iran","Iran"),
 ("Gaza","Israel keeps striking Hamas commanders while the peace plan and the question of who controls the Strip stay open.","/img/t/map-025.webp","/maps/025/gaza-peace-plan-and-control/","Map: peace plan and control","Gaza"),
 ("Haredi draft","Military service for the ultra-Orthodox, and the Haredi parties' role in any coalition, are a central fight.","/img/t/dem-006.webp","/demographics/006/haredi-share-of-jewish-israelis/","Chart: Haredi share","haredi"),
 ("Regional diplomacy","Turkey's push in Lebanon and Syria, Gulf ties and flights to Dubai show a region still being reordered.","/img/t/tlf-tl-025.webp","/g/abraham-accords/","Abraham Accords","Turkey"),
]
for _,_,img,link,_,_ in ISSUES:
    assert os.path.exists(R+img), img
    assert os.path.exists(R+link.rstrip('/')+'/index.html') or link=='/charts/knesset-26/' and os.path.exists(R+'/charts/knesset-26/index.html'), link
THEN = {  # per issue: (news regex, [(label, link)...]) for the NOWlej channel, where news meets historical context
 "Coalition talks": ("coalition|knesset|eisenkot|netanyahu|haredi parties|yashar", [("Knesset elections since 1949","/tables/002/knesset-elections/"),("Prime ministers","/tables/003/prime-ministers/"),("The Knesset","/g/knesset/")]),
 "Iran": ("iran|missiles?", [("Iran","/g/iran/"),("Timeline: Abraham Accords to October 7","/timelines/025/abraham-accords-to-october-7/"),("Map: Israel and its neighborhood","/maps/029/israel-and-its-neighborhood/")]),
 "Gaza": ("gaza|hamas", [("Timeline: disengagement and the Gaza wars","/timelines/024/disengagement-and-the-gaza-wars/"),("Disengagement from Gaza, 2005","/g/disengagement-from-gaza/"),("Map: Gaza before the disengagement","/maps/023/gaza-before-the-disengagement/")]),
 "Haredi draft": ("haredi|draft|ultra-orthodox", [("The Haredim","/g/haredim/"),("Chart: Haredi share of Jewish Israelis","/demographics/006/haredi-share-of-jewish-israelis/"),("Chart: religious identity","/demographics/007/religious-identity-of-jewish-adults/")]),
 "Regional diplomacy": ("turkey|lebanon|syria|saudi|dubai|bahrain|emirates|egypt|jordan", [("The Abraham Accords","/g/abraham-accords/"),("Timeline: Abraham Accords to October 7","/timelines/025/abraham-accords-to-october-7/"),("Map: Israel and its neighborhood","/maps/029/israel-and-its-neighborhood/")]),
}
for k,(_,L) in THEN.items():
    for _,l in L: assert os.path.exists(R+l.rstrip('/')+'/index.html'), l
HEAD={"/":"In focus: the issues behind the news","/views/":"In focus: the debates","/media/":"In focus: watch and listen","/glossary/":"Now meets then: today's issues and their history","/sources/":"In focus: the issues the sources are covering","/politics/":"In focus"}
CSS='''.k26focus{margin:0 0 1.2rem}.k26focus h2{font-size:1.15rem;margin:.2rem 0 .6rem}
.kfg{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:.7rem}
.kfc{background:var(--card);border:1px solid var(--line);border-radius:10px;overflow:hidden;display:flex;flex-direction:column}
.kfc img{width:100%;aspect-ratio:4/3;object-fit:cover;object-position:top;background:var(--hl);display:block}
.kfc .kb{padding:.55rem .7rem .7rem;display:flex;flex-direction:column;gap:.3rem;flex:1}.kfc b{font-size:1rem}
.kfc p{margin:0;font-size:.84rem;color:var(--mut);line-height:1.35;flex:1}.kfc .kn{font-size:.84rem;margin:0}.kfc .kn small{display:block;color:var(--mut)}.kfc ul{margin:0;padding-left:1.1rem;font-size:.82rem}.kfc .kt{font-size:.74rem;text-transform:uppercase;letter-spacing:.06em;color:var(--mut);margin:.2rem 0 0}.kfc .kl{font-size:.82rem;display:flex;gap:.8rem;flex-wrap:wrap}'''
JS = r"""(function(){try{
var I=__I__,H=__H__,T=__T__,c=__C__;
var m=document.querySelector('main h1');if(!m)return;var h=H[location.pathname];if(!h)return;
function e(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
var st=document.createElement('style');st.textContent=c;document.head.appendChild(st);
var NT=location.pathname==='/glossary/';
function img(i){return '<a href="'+e(i[3])+'"><img src="'+e(i[2])+'" alt="" loading="lazy"></a>'}
function card(i){var t=T[i[0]];
 if(!NT||!t)return '<div class="kfc">'+img(i)+'<div class="kb"><b>'+e(i[0])+'</b><p>'+e(i[1])+'</p><span class="kl"><a href="'+e(i[3])+'">'+e(i[4])+' &#9656;</a><a href="/search/?q='+encodeURIComponent(i[5])+'">Latest &#9656;</a></span></div></div>';
 return '<div class="kfc" data-rx="'+e(t[0])+'">'+img(i)+'<div class="kb"><b>'+e(i[0])+'</b><p class="kt">Now</p><p class="kn"><small>Loading&hellip;</small></p><p class="kt">Then</p><ul>'+t[1].map(function(l){return '<li><a href="'+e(l[1])+'">'+e(l[0])+'</a></li>'}).join('')+'</ul></div></div>'}
var d=document.createElement('section');d.className='k26focus';d.setAttribute('aria-label','In focus');
d.innerHTML='<h2>'+e(h)+'</h2><div class="kfg">'+I.map(card).join('')+'</div>';
m.parentNode.insertBefore(d,m.nextSibling);
if(NT){fetch('/api/news?v=2').then(function(r){return r.json()}).then(function(n){
 var items=n.items.filter(function(x){return x.d}).sort(function(a,b){return new Date(b.d)-new Date(a.d)});
 d.querySelectorAll('.kfc[data-rx]').forEach(function(el){var rx=new RegExp('\\b('+el.getAttribute('data-rx')+')\\b','i');
  var it=items.filter(function(x){return rx.test(x.t)})[0];var p=el.querySelector('.kn');
  if(!it){p.innerHTML='<small>No headline right now.</small>';return}
  var u=it.k?'/news/item/'+it.k+'/?s='+encodeURIComponent(it.s)+(it.ch?'&c='+encodeURIComponent(it.ch):''):it.u;
  p.innerHTML='<a href="'+e(u)+'">'+e(it.t)+'</a><small>'+e(it.src||'')+'</small>'})}).catch(function(){})}
}catch(x){}})();"""
js = JS.replace('__I__',json.dumps(ISSUES)).replace('__H__',json.dumps(HEAD)).replace('__T__',json.dumps(THEN)).replace('__C__',json.dumps(CSS))
open(f'{R}/focus.js','w').write(js); print('focus.js',len(js))
