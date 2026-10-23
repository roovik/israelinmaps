# The six green-era timelines, following "Jewish History: Ten Eras, 150 to 2026".
# Entries come from data.py, redistributed by year, plus new ones below.
import data
TP, AL = [], []
for P in data.PAGES:
    TP += [t for t in P['tp']]; AL += [a for a in P['also']]
# a few entries change role or wording at the new boundaries
TP = [t for t in TP if not (t[1] == 1291 and t[2] == 'c')]           # Acre falls: keep the Mamluk version
TP = [t for t in TP if t[1] != 1428]                                 # moved to "also"
TP = [t for t in TP if t[1] not in (614, 629)]                       # rewritten below for the 500 to 750 page
TP += [
 ('c. 500', 499, 'f', 'The Babylonian Talmud is completed.', 'The sages of Babylonia finish the work that becomes the core of Jewish law.'),
 ('614', 614, 'c', 'The Persians take Jerusalem.', 'Jews fight beside the Persians and briefly govern the city.'),
 ('629', 629, 'c', 'The Byzantines return.', 'Emperor Heraclius retakes Jerusalem and expels the Jews.'),
 ('661', 661, 'r', 'The Umayyad Caliphate.', 'Muawiya founds the dynasty and rules the region from Damascus.'),
 ('c. 900', 900, 'l', 'The Masoretes of Tiberias.', 'They fix the vowel signs and the text of the Hebrew Bible.'),
 ('928', 928, 'f', 'Saadia Gaon heads the academy of Sura.', 'He translates the Bible into Arabic and writes the first great work of Jewish philosophy.'),
 ('c. 1190', 1190, 'f', 'Maimonides completes the Guide for the Perplexed.', 'In Egypt he joins Jewish law and Greek philosophy.'),
 ('1267', 1267, 's', 'Nachmanides arrives in Jerusalem.', 'The great scholar re-establishes the Jewish community and opens a synagogue.'),
]
AL = [a for a in AL if a[1] not in (500, 900, 1267)]
AL += [
 ('589', 589, 'f', 'The age of the Geonim begins at the academies of Babylonia.'),
 ('1428', 1428, 'f', 'Jews and Franciscans clash over David’s Tomb on Mount Zion.'),
]
def pick(lst, y0, y1, last):
    return [x for x in lst if y0 <= x[1] < y1 or (last and x[1] == y1)]
SPEC = [
 ('004a', 'rabbinic-judaism-and-roman-rule', 'Rabbinic Judaism and Roman Rule', 'Rabbinic', 135, 500, 50,
  'After Bar Kokhba, Jewish life gathers around the sages. The Mishnah and the Talmuds are written, and in the fourth century Roman rule becomes Byzantine Christian rule.'),
 ('004b', 'byzantine-decline-and-islamic-conquest', 'Byzantine Decline and Islamic Conquest', 'Islamic Conquest', 500, 750, 50,
  'Byzantine laws press on the Jews of the land while the academies of Babylonia lead. Persia invades, Arab armies take Jerusalem in 638, and the Umayyads rule from Damascus.'),
 ('004c', 'abbasid-and-early-medieval-judaism', 'Abbasid and Early Medieval Judaism', 'Abbasid', 750, 1099, 50,
  'The Abbasid caliphs rule from Baghdad, where the Geonim guide the Jews of the world. Tiberias fixes the text of the Bible, and Jerusalem passes to the Fatimids of Cairo.'),
 ('004d', 'crusaders-and-ayyubids', 'Crusaders and Ayyubids', 'Crusader', 1099, 1260, 25,
  'Crusaders take Jerusalem and found a Latin kingdom. Saladin retakes the city in 1187, and Jewish learning flowers around the Mediterranean, above all in Maimonides.'),
 ('004e', 'mamluk-rule-and-the-spanish-expulsion', 'Mamluk Rule and the Spanish Expulsion', 'Mamluk', 1260, 1517, 50,
  'The Mamluk sultans of Egypt drive out the last Crusaders and rule the land as a province. In Europe Jews face expulsions, and Spain expels its Jews in 1492.'),
 ('004f', 'ottoman-rule-and-jewish-resettlement', 'Ottoman Rule and Jewish Resettlement', 'Ottoman', 1517, 1799, 50,
  'The Ottomans take the land in 1516 and 1517. Safed becomes the center of Jewish mysticism and law, and Sephardi and later Hasidic Jews settle in the holy cities.'),
]
PAGES = []
for i, (id_, slug, title, menu, y0, y1, step, intro) in enumerate(SPEC):
    last = i == len(SPEC) - 1
    PAGES.append(dict(id=id_, slug=slug, title=title, menu=menu, y0=y0, y1=y1, step=step, intro=intro,
                      tp=pick(TP, y0, y1, last), also=pick(AL, y0, y1, last)))
if __name__ == '__main__':
    for P in PAGES: print(P['id'], P['title'], len(P['tp']), len(P['also']), [t[1] for t in P['tp']])
