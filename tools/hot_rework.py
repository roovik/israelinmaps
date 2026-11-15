#!/usr/bin/env python3
"""Reworks the HOT contested-issue pages in NOWlej's voice. Edits tools/hot.json and patches the built hot/ pages in place."""
import json, os, re, html
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
E=html.escape
J=f'{R}/tools/hot.json'
H=json.load(open(J))
old={t['slug']:dict(t) for t in H['topics']}
T={t['slug']:t for t in H['topics']}
H['intro']=("Some of the questions people ask most about Israel are bitterly contested. NOWlej takes a position on each one and says so. "
 "We set out what critics claim in their own terms, what the record shows, and NOWlej's answer, so readers can check the facts and judge for themselves. Dates and sources are shown.")
# ---- 1 Nakba
t=T['nakba-1948']
t['brief']=("About 700,000 Arabs left their homes in the territory that became Israel during the war of 1947 to 1949, and Israel did not let them return. "
 "The war began when the Arab states and Palestinian Arab leaders rejected the UN partition plan and attacked. NOWlej's view: the great majority left because of a war the Arab side started, "
 "and in a few places Israeli forces ordered residents out, but there was no plan to expel a people. The refusal to readmit them is the heart of today's dispute.")
t['claim']=["Palestinians call 1948 the Nakba, the catastrophe. They say that most Palestinian Arabs were expelled or terrorized into leaving, that villages were destroyed to prevent return, and that the refugees and their descendants have a right to return under UN General Assembly Resolution 194.",
 "Some historians argue that Plan Dalet, a Haganah plan of March 1948, was meant to clear Arab areas. Others read it as a military plan to secure roads to besieged Jewish towns and Jerusalem."]
t['record']=["The UN General Assembly voted for partition on 29 November 1947. The Jewish leadership accepted it. The Arab Higher Committee and the Arab states rejected it.",
 "Fighting began at once. Five Arab armies entered on 15 May 1948, the day after Israel declared independence.",
 "Historians agree that about 700,000 Arabs left, in waves, and that many left before the Arab armies invaded.",
 "Historians, including Israelis such as Benny Morris, document that in some places, among them Lydda and Ramle in July 1948, Israeli forces ordered residents out. In many places residents fled the fighting itself. Historians dispute how much weight each cause deserves.",
 "Israel did not let the refugees return, and abandoned property was taken over. Resolution 194 of December 1948 said refugees wishing to live in peace with their neighbors should be permitted to return at the earliest practicable date. It is a General Assembly recommendation and is not binding.",
 "Roughly 800,000 Jews left or were forced out of Arab countries in the decades after 1948, and most settled in Israel."]
t['critics']=["Whatever caused the flight, Israel's policy afterward was to bar return and to settle new immigrants on Arab lands, which makes the outcome permanent by design.",
 "A people cannot lose its homes because of a war. The refugees' descendants now number in the millions and remain stateless in many places."]
t['defenders']=["The war began when the Arab side rejected partition and invaded. Refugees are the usual result of a war, as with millions of Germans after the Second World War and the millions moved in the partition of India. Only the Palestinian refugees were never resettled by the Arab states that took the lead in the war.",
 "No state is obliged to admit a large population from the side that fought against its creation. Resolution 194 is conditioned on living in peace and is not binding.",
 "Israel took in roughly 800,000 Jewish refugees from Arab lands. Most Arab states refused Palestinian refugees citizenship, and the UN agency for them, UNRWA, alone counts descendants as refugees.",
 "A return of millions of descendants would end the Jewish majority, which is why most Israelis hear the demand as a call to end the Jewish state."]
# ---- 2 Settler colonialism
t=T['settler-colonialism']
t['brief']=("Some scholars and activists call Israel a settler-colonial state. NOWlej rejects the label. The Jewish people is indigenous to the land of Israel: "
 "its language, scripture and calendar were formed here, and Jews have kept a presence here through three thousand years and every conquest. Zionism was the return of an indigenous people to its homeland, not the project of a European empire.")
t['claim']=["Critics argue that Zionism was a European movement that settled a land already inhabited by Arabs, with British backing, and displaced the native Palestinians. They cite scholars such as Patrick Wolfe, who called settler colonialism a structure and not a single event.",
 "They say the framework explains the 1948 outcome, land policy and the settlements, and that it casts Palestinians as the indigenous people."]
t['record']=["Modern Jewish immigration began in 1882. The League of Nations Mandate of 1922 recognized the historical connection of the Jewish people with the land and called for a Jewish national home.",
 "The Jewish tie to the land is documented in archaeology, in Hebrew inscriptions and coins, and in Jewish communities that never left, such as Jerusalem, Hebron, Safed and Tiberias.",
 "About half of Israeli Jews descend from Jews who lived in Arab and other Muslim-majority countries, and many others from Europe. Israel has no mother country that sent them.",
 "Zionist settlement was not directed by a European state. Britain restricted Jewish immigration at times, most sharply in the White Paper of 1939."]
t['critics']=["A settler group need not be sent by a mother country. The framework fits any group that comes to replace a native society.",
 "Whatever the ancient history, Arabs were the majority in 1948 and had lived in the land for centuries, which makes them native too."]
t['defenders']=["Indigeneity does not depend on who held the majority in a given year. Jews are the people whose national identity, language and scripture were formed in this land, and who prayed toward it for two thousand years in exile.",
 "Colonists serve a mother country. Jewish refugees from Europe and from Arab lands had no metropole to serve and nowhere else to go, and Britain often fought the movement.",
 "To call Jews colonizers in their own homeland denies Jewish history, and the label is mostly used to argue that Israel should not exist.",
 "Palestinian Arabs live in the land, and their political claims can be debated on their merits. They do not require denying the Jewish claim."]
# ---- 3 Settlements
t=T['settlements']
t['brief']=("Most governments and the International Court of Justice say the settlements violate international law, and Israel rejects that view. NOWlej's view: Jews have a historic and legal right to live in Judea and Samaria, "
 "the heartland of the biblical kingdoms, and the territory is disputed, not the sovereign land of another state. Readers should know that the main international authorities side with the critics.")
t['claim']=["Critics say the West Bank is occupied territory, that moving civilians into it violates Article 49(6) of the Fourth Geneva Convention, and that settlements take land and block a Palestinian state.",
 "They also point to settler violence and to outposts that are illegal even under Israeli law."]
t['record']=["In its 2004 advisory opinion on the separation barrier, the ICJ said the settlements were established in breach of international law. Israel rejects the opinion.",
 "UN Security Council Resolution 2334 of December 2016 said the settlements have no legal validity. The United States abstained.",
 "On 19 July 2024 the ICJ issued an advisory opinion saying Israel's continued presence in what it calls the occupied Palestinian territory is unlawful and that Israel should end it and evacuate settlers. Israel rejects the opinion.",
 "There are roughly half a million Israeli settlers in the West Bank and over 200,000 more in East Jerusalem. Figures vary by source."]
t['defenders']=["Article 49(6) was written to bar forced transfers such as those Nazi Germany carried out. Israelis moved voluntarily.",
 "Jordan held the West Bank from 1948 to 1967 after its own invasion and annexation, which almost no state recognized, so there was no prior legitimate sovereign. The territory is disputed, to be settled by negotiation.",
 "The Jewish connection to Judea and Samaria goes back thousands of years, and the Mandate for Palestine recognized Jewish rights to settle the land.",
 "Jews lived in Hebron, Gush Etzion and the Old City of Jerusalem before 1948. Arab riots in 1929 and the war of 1948 emptied those communities, and Jordan then barred Jews. Returning is not colonizing.",
 "Israel removed all settlements from Gaza in 2005 and from parts of the northern West Bank, which shows that they are negotiable."]
# ---- 4 Apartheid
t=T['apartheid']
t['brief']=("Several major human rights groups say yes. Israel and its defenders strongly deny it, and NOWlej agrees with the denial. Arab citizens of Israel vote, sit in the Knesset and in government, and have served on the Supreme Court. "
 "The charge depends on treating the West Bank, which is governed under a different legal regime, as part of Israel.")
t['defenders']=["Israeli Arabs are full citizens with the vote, and they serve in the Knesset, in hospitals and on the bench. Apartheid in South Africa denied Black citizens political rights altogether.",
 "The West Bank is disputed territory, and since the Oslo Accords the Palestinian Authority governs most Palestinians there. The conflict is over national claims, not race.",
 "Apartheid requires an intent to maintain racial domination. Security barriers followed terror attacks and negotiation offers, not a racial plan.",
 "Inequalities inside Israel are real, and they are argued in its courts and its politics, which is not what apartheid looks like.",
 "The word was chosen for its power. Applying it to the only Jewish state while ignoring far harsher regimes is a double standard."]
# ---- 5-10 briefs: add NOWlej's view
t=T['genocide-gaza']
t['brief']=("A UN commission, Amnesty International and a number of scholars say yes. Israel says no, and NOWlej agrees. Genocide requires intent to destroy a people as such, "
 "and Israel went to war after Hamas killed about 1,200 people on 7 October 2023 and took about 250 hostages. The International Court of Justice has not ruled. It has only found a plausible risk and ordered precautions, and its final judgment is years away.")
T['war-crimes']['brief']=("The International Criminal Court has issued arrest warrants for Prime Minister Netanyahu and former Defense Minister Gallant, and Israel rejects the court's jurisdiction. "
 "NOWlej's view: the court has no jurisdiction over a democracy with its own courts, and the warrants wrongly set its leaders beside the leaders of a terror group. The same court issued a warrant for a Hamas leader for the 7 October attack. Israel says its military investigates allegations.")
T['gaza-hunger-aid']['brief']=("The UN-backed food security monitor declared famine in part of Gaza in August 2025, and said in December 2025 that no area remained in famine after the October ceasefire. "
 "Israel disputes the finding and blames Hamas for stealing aid, and NOWlej finds that charge credible. The key facts are the dates of closure and reopening of crossings.")
T['gaza-blockade']['brief']=("Israel and Egypt have restricted goods and movement into Gaza since Hamas took power in 2007. NOWlej's view: Israel left Gaza in 2005, Gaza is not occupied, "
 "and a naval blockade that stops weapons is lawful. Critics say the closure is collective punishment and that Israel still controls the territory.")
T['jenin-2002']['brief']=("Early reports spoke of a massacre of hundreds. A later UN report and investigations by Human Rights Watch found no massacre, but did find serious abuses. "
 "NOWlej's view: the massacre claim was false, and it shows how fast claims spread and why dated, checked sources matter.")
T['antizionism-antisemitism']['brief']=("Almost everyone agrees that criticizing Israeli policy is not antisemitic and that hatred of Jews is. NOWlej's view: denying the Jewish people alone the right to a state is antisemitic. "
 "The dispute is over the middle ground, and over whether definitions such as the IHRA's protect Jews or chill legitimate speech.")
T['gaza-blockade']['defenders']=T['gaza-blockade']['defenders']+["Israel left Gaza completely in 2005 and has no troops or settlers there, so the claim that it still occupies Gaza rests on controlling the borders of a territory whose rulers attack it."]
json.dump(H,open(J,'w'),indent=1,ensure_ascii=False)

# ---- patch built pages
NOTE='<p class="hotmeta"><b>Contested issue</b> · NOWlej&#x27;s view · As of '+E(H['asof'])+'</p>'
li=lambda xs:'<ul>'+''.join(f'<li>{E(x)}</li>' for x in xs)+'</ul>'
def sub1(pat,rep,s,flags=re.S):
    n=re.subn(pat,lambda m:rep,s,count=1,flags=flags); return n[0],n[1]
miss=0
for slug,t in T.items():
    p=f'{R}/hot/{slug}/index.html'; s=open(p).read()
    s,a=sub1(r'<p class="hotmeta">.*?</p>',NOTE,s)
    s,b=sub1(r'<div class="hotbrief"><b>In brief</b><p>.*?</p></div>',f'<div class="hotbrief"><b>In brief</b><p>{E(t["brief"])}</p></div>',s)
    mid=(f'<h2>What critics claim</h2>{li(t["claim"])}<h2>What the record shows</h2>{li(t["record"])}'
         f'<h2>The case and the answers</h2><div class="hot2"><section><h3>The critics\' case</h3>{li(t["critics"])}</section><section><h3>NOWlej\'s answer</h3>{li(t["defenders"])}</section></div><h2>Key dates</h2>')
    s,c=sub1(r'<h2>What is claimed</h2>.*?<h2>Key dates</h2>',mid,s)
    ob=E(old[slug]['brief'])
    s=s.replace(ob,E(t['brief']))
    open(p,'w').write(s)
    if not(a and b and c): miss+=1; print('MISS',slug,a,b,c)
# hub
p=f'{R}/hot/index.html'; s=open(p).read()
s,_=sub1(r'<p class="hotmeta">.*?</p>',NOTE,s)
s,_=sub1(r'<p class="lead">.*?</p>',f'<p class="lead">{E(H["intro"])}</p>',s)
for slug,t in T.items():
    of=E(old[slug]['brief'].split('. ')[0])+'.'
    nf=E(t['brief'].split('. ')[0])+'.'
    s=s.replace(f'<span>{of}</span>',f'<span>{nf}</span>')
rules=('<ul class="hotrules"><li>Every topic is titled as the question people really ask.</li>'
 '<li>We state the critics&#8217; case in their own terms, as they would want it put, before we answer it.</li>'
 '<li>NOWlej gives its own answer, with evidence, and says plainly where the evidence is thin or the main authorities disagree.</li>'
 '<li>Our answers rest on the Jewish people&#8217;s roots in the land and its right to self-determination there, and we say so openly.</li>'
 '<li>We separate what the record shows from what is argued. Every date and figure names its source.</li>'
 '<li>We link to sources that address the question directly, including the critics&#8217; own work, so readers can judge for themselves.</li>'
 '<li>Pages show when they were last reviewed and are corrected in public.</li></ul>')
s,r=sub1(r'<ul class="hotrules">.*?</ul>',rules,s)
open(p,'w').write(s); print('hub rules',r,'miss',miss)
