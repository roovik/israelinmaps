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
HEAD={"/":"In focus: the issues behind the news","/views/":"In focus: the debates","/media/":"In focus: watch and listen","/glossary/":"In focus: background on today's issues","/sources/":"In focus: the issues the sources are covering","/politics/":"In focus"}
CSS='''.k26focus{margin:0 0 1.2rem}.k26focus h2{font-size:1.15rem;margin:.2rem 0 .6rem}
.kfg{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:.7rem}
.kfc{background:var(--card);border:1px solid var(--line);border-radius:10px;overflow:hidden;display:flex;flex-direction:column}
.kfc img{width:100%;aspect-ratio:4/3;object-fit:cover;object-position:top;background:var(--hl);display:block}
.kfc .kb{padding:.55rem .7rem .7rem;display:flex;flex-direction:column;gap:.3rem;flex:1}.kfc b{font-size:1rem}
.kfc p{margin:0;font-size:.84rem;color:var(--mut);line-height:1.35;flex:1}.kfc .kl{font-size:.82rem;display:flex;gap:.8rem;flex-wrap:wrap}'''
js=("(function(){try{var I="+json.dumps(ISSUES)+",H="+json.dumps(HEAD)+",c="+json.dumps(CSS)+";"
 "var m=document.querySelector('main h1');if(!m)return;var h=H[location.pathname];if(!h)return;"
 "function e(s){return String(s).replace(/[&<>\"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]})}"
 "var st=document.createElement('style');st.textContent=c;document.head.appendChild(st);"
 "var d=document.createElement('section');d.className='k26focus';d.setAttribute('aria-label','In focus');"
 "d.innerHTML='<h2>'+e(h)+'</h2><div class=\"kfg\">'+I.map(function(i){return'<div class=\"kfc\"><a href=\"'+e(i[3])+'\"><img src=\"'+e(i[2])+'\" alt=\"\" loading=\"lazy\"></a><div class=\"kb\"><b>'+e(i[0])+'</b><p>'+e(i[1])+'</p><span class=\"kl\"><a href=\"'+e(i[3])+'\">'+e(i[4])+' ▸</a><a href=\"/search/?q='+encodeURIComponent(i[5])+'\">Latest ▸</a></span></div></div>'}).join('')+'</div>';"
 "m.parentNode.insertBefore(d,m.nextSibling)}catch(x){}})();")
open(f'{R}/focus.js','w').write(js); print('focus.js',len(js))
