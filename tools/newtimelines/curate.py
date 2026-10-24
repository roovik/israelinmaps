"""Regroup 1948 to today into eight periods, each opening with its turning point."""
import json, re, sys
sys.path.insert(0, '/home/claude/tlgen/modern')
from assemble import yd
items = json.load(open('/home/claude/tlgen/modern/items.json'))
def find(lbl, start):
    r = [i for i in items if i['l'] == lbl and (i.get('h', '') + i['t']).startswith(start)]
    assert len(r) == 1, (lbl, start, len(r)); return r[0]
def promote(lbl, start, h, t, c=None, newlbl=None):
    i = find(lbl, start); i.update(tp=1, h=h, t=t)
    if c: i['c'] = c
    if newlbl: i['l'] = newlbl; i['y'] = yd(newlbl)
def demote(lbl, start):
    i = find(lbl, start); i['t'] = (i.pop('h', '') + ' ' + i['t']).strip(); i['tp'] = 0
def drop(lbl, start): items.remove(find(lbl, start))
def add(lbl, c, t, h=None):
    d = dict(l=lbl, y=yd(lbl), c=c, tp=1 if h else 0, t=t)
    if h: d['h'] = h
    items.append(d)
# 1948 to 1955
add('1948 May 15', 'c', 'Five Arab armies invade the day after independence. By the armistices of 1949 Israel holds more land than the partition plan gave it.', 'The War of Independence.')
promote('1952 Sep 10', 'The reparations', 'The reparations agreement.', 'Israel and West Germany sign in Luxembourg. Menachem Begin leads a violent protest outside the Knesset in January over the talks.', 'd')
# 1956 to 1966
promote('1963 Jun 26', 'Levi Eshkol', 'Eshkol succeeds Ben-Gurion.', 'Levi Eshkol becomes prime minister as the founding generation begins to hand over power.', 'r')
promote('1964', 'The National Water Carrier', 'The National Water Carrier.', 'It brings water from the Sea of Galilee to the farms and towns of the south.', 's')
promote('1965', 'Israel and West Germany', 'Relations with West Germany.', 'Twenty years after the Holocaust, the two countries exchange ambassadors.', 'd')
promote('1966', 'S. Y. Agnon', 'Agnon wins the Nobel Prize.', 'S. Y. Agnon is the first Hebrew writer to receive the prize for literature.', 'l')
# 1967 to 1976
promote('1972', 'Terrorists kill 11', 'The Munich massacre.', 'Palestinian terrorists kill 11 Israeli athletes and coaches at the Olympic Games.', 'c', '1972 Sep 5')
demote('1972 May 30', 'Massacre at Lod')
demote('1974 May', 'Massacre at')
promote('1976 Jul 4', 'Commandos rescue', 'Operation Entebbe.', 'Commandos fly to Uganda and rescue the hostages of a hijacked Air France plane. Yoni Netanyahu is killed leading the raid.', 'c')
# 1977 to 1992
drop('1977 May 17', 'Election: Likud')
promote('1977 Jun 20', 'Menachem Begin', 'The upheaval.', 'Likud wins the May 17 election and Menachem Begin becomes prime minister, ending three decades of Labor rule.', 'r', '1977 May 17')
promote('1977 Nov 19 to 21', 'Summit: Anwar Sadat', 'Sadat comes to Jerusalem.', 'The Egyptian president addresses the Knesset and opens the way to peace.', 'd')
demote('1978 Mar 11', 'The Coastal Road')
demote('1982 Apr 25', 'Israel leaves Sinai')
demote('1983 Feb 8', 'The Kahan')
demote('1985 Jul 1', 'The economic')
demote('1991 May 24 to 25', 'Operation Solomon')
# 1993 to 2004
promote('1995 Nov 4', 'Prime Minister Yitzhak Rabin', 'Rabin is assassinated.', 'A Jewish extremist shoots the prime minister after a peace rally in Tel Aviv. Shimon Peres takes over the same day.', 'c')
promote('2000 Sep 28 to 2005 Feb 8', 'The Second Intifada', 'The Second Intifada.', 'After the Camp David summit fails, a wave of suicide bombings and fighting lasts until 2005.', 'c', '2000 Sep 28')
items[:] = [i for i in items if not (i['l'] == '2000 May 24' and i['tp'])]
add('2000 May 24', 'r', 'Israel leaves the security zone in southern Lebanon after 18 years.', 'Withdrawal from Lebanon.')
demote('2001 Jun 1', 'The Dolphinarium')
demote('2001 Aug 9', 'The Sbarro')
# 2005 to 2014
promote('2008 Dec 27 to 2009 Jan 18', 'Operation Cast Lead', 'Operation Cast Lead.', 'A three-week war in Gaza follows years of rocket fire on southern Israel.', 'c')
drop('2011', 'Gilad Shalit')
add('2011 Oct 18', 'd', 'Hamas frees the soldier after five years in captivity in exchange for 1,027 prisoners.', 'Gilad Shalit comes home.')
add('2011 Apr 7', 's', 'Iron Dome intercepts its first rocket from Gaza.')
promote('2011 Jul 14', 'The social justice', 'The social justice protests.', 'Hundreds of thousands march over housing and the cost of living.', 'r')
# 2015 to 2023
promote('2015 Jul 14', 'Iran and the world powers', 'The Iran nuclear deal.', 'Iran and the world powers sign an agreement that Israel opposes. Netanyahu had argued against it before Congress in March.', 'd')
promote('2021 May 10 to 21', 'Operation Guardian', 'Operation Guardian of the Walls.', 'An 11-day war with Hamas sets off riots in mixed Arab and Jewish cities.', 'c')
promote('2021 Jun 13', 'Naftali Bennett', 'Bennett becomes prime minister.', 'A broad coalition ends Netanyahu’s 12 years in office.', 'r')
promote('2023', 'Protests over', 'The judicial overhaul protests.', 'Mass demonstrations over the government’s proposed judicial changes divide the country.', 'r', '2023 Jan')
# 2024 to today
promote('2025 Jun 13 to 24', 'The twelve-day war', 'The twelve-day war with Iran.', 'Israel strikes Iran’s nuclear and missile sites, and the United States joins in.', 'c')
add('2023 Oct 8', 'c', 'Hezbollah fires on the north the day after the massacre, and some 60,000 Israelis leave their homes.', 'Hezbollah opens a second front.')
add('2023 Oct 19', 'c', 'The Houthis in Yemen launch their first missiles toward Israel.')
add('2023 Oct 27', 'c', 'Ground forces enter Gaza.')
add('2023 Nov 24 to Dec 1', 'd', 'A truce frees 105 hostages in exchange for Palestinian prisoners.')
add('2024 Jul 27', 'c', 'A Hezbollah rocket kills 12 children on a football field in Majdal Shams.')
add('2024 Sep 17 to 18', 'c', 'Exploding pagers and radios wound thousands of Hezbollah members.')
add('2024 Sep 27', 'c', 'Israel kills Hezbollah leader Hassan Nasrallah in Beirut.')
add('2024 Oct 16', 'c', 'Israeli soldiers kill Hamas leader Yahya Sinwar in Rafah.')
for i in items:
    i['t'] = re.sub(r'\s*MAPS? \d[\d, ]*(?:TO \d+)?\.?', '', i['t'].replace('Sharm el- Sheikh', 'Sharm el-Sheikh')).strip()
items.sort(key=lambda i: i['y'])
PER = [
 ('012a', 'independence-and-ingathering', 'Independence and Ingathering', 1948, 1956, '1948 to 1955',
  'Israel declares independence, wins its first war and doubles its population in three years as Jews pour in from Europe and the Arab world.'),
 ('012b', 'sinai-and-the-years-between', 'Sinai and the Years Between', 1956, 1967, '1956 to 1966',
  'The Sinai Campaign opens a decade of quiet borders. Israel builds its water carrier and its institutions, tries Eichmann and makes peace with Germany.'),
 ('013a', 'the-six-day-war-and-yom-kippur', 'The Six-Day War and Yom Kippur', 1967, 1977, '1967 to 1976',
  'In six days Israel reunites Jerusalem and triples its territory. The War of Attrition, terror abroad and the shock of Yom Kippur follow.'),
 ('014a', 'upheaval-peace-and-intifada', 'Upheaval, Peace and Intifada', 1977, 1993, '1977 to 1992',
  'Begin’s victory ends Labor rule and leads to peace with Egypt. The Lebanon War, the First Intifada and the great Soviet aliyah follow.'),
 ('016a', 'oslo-and-the-second-intifada', 'Oslo and the Second Intifada', 1993, 2005, '1993 to 2004',
  'The Oslo Accords and peace with Jordan raise hopes. Rabin is murdered, the Camp David talks fail and the Second Intifada brings suicide bombings to Israel’s cities.'),
 ('017a', 'disengagement-and-the-gaza-wars', 'Disengagement and the Gaza Wars', 2005, 2015, '2005 to 2014',
  'Israel leaves Gaza, Hamas takes it over and three wars follow. Lebanon flares in 2006, and Gilad Shalit comes home after five years.'),
 ('018a', 'abraham-accords-to-october-7', 'Abraham Accords to October 7', 2015, yd('2023 Oct 8'), '2015 to October 7, 2023',
  'The embassy moves to Jerusalem and the Abraham Accords bring peace with Gulf states. Five elections and the judicial protests divide Israel, and Hamas attacks on October 7.'),
 ('019a', 'the-seven-front-war', 'The Seven-Front War', yd('2023 Oct 8'), 2027, 'October 8, 2023 to today',
  'The day after the massacre, Israel is at war on seven fronts: Gaza, Lebanon, Syria, Judea and Samaria, Yemen, Iraq and Iran. Hezbollah\u2019s leaders fall, Assad\u2019s regime collapses, and a ceasefire brings the living hostages home.'),
]
PAGES = []
for id_, slug, title, y0, y1, rng, intro in PER:
    sel = [i for i in items if y0 <= i['y'] < y1]
    PAGES.append(dict(id=id_, slug=slug, title=title, y0=y0, y1=min(y1, 2026.9), rng=rng, intro=intro,
                      tp=[[i['l'], i['y'], i['c'], i['h'], i['t']] for i in sel if i['tp']],
                      also=[[i['l'], i['y'], i['c'], i['t']] for i in sel if not i['tp']]))
if __name__ == '__main__':
    for P in PAGES:
        print(P['id'], P['title'], 'tp', len(P['tp']), 'also', len(P['also']))
        for t in P['tp']: print('   *', t[0], t[3])
    json.dump(PAGES, open('/home/claude/tlgen/modern/pages.json', 'w'), ensure_ascii=False, indent=1)
