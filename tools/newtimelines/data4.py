# Green-era pages split into Jewish life (left) and the ruling powers (right), with supplementary entries.
import data3
LEFT = {135,200,351,363,400,425,499,220,359,438, 614,629,520,589, 900,928,880,920,921, 1190,1141,1165,1170,1211,
        1267,1474,1488,1492,1322,1400,1428,1481,1497, 1565,1570,1660,1665,1700,1740,1540,1561,1577,1621,1648,1742,1777}
# (side, label, year, cat, headline, text)
ADD = [
 # 135 to 500
 ('L', 'c. 140', 140, 'f', '', 'The surviving sages reconvene at Usha in the Galilee and rebuild the Sanhedrin.'),
 ('L', 'c. 250', 250, 'f', '', 'Rabbi Yohanan heads the academy of Tiberias, whose teachings fill the Jerusalem Talmud.'),
 ('L', 'c. 375', 375, 'l', '', 'The Hammat Tiberias synagogue is laid with its zodiac mosaic.'),
 ('R', '212', 212, 'd', '', 'Caracalla grants Roman citizenship to all free men of the empire, Jews among them.'),
 ('R', '270', 270, 'c', '', 'Queen Zenobia of Palmyra seizes the eastern provinces until Rome retakes them in 272.'),
 ('R', 'c. 326', 326, 'f', '', 'Empress Helena visits the Holy Land, and churches rise at Bethlehem and the Mount of Olives.'),
 ('R', '330', 330, 'r', '', 'Constantinople becomes the capital of the empire.'),
 ('R', '380', 380, 'f', '', 'Theodosius makes Christianity the religion of the empire.'),
 ('R', '395', 395, 'r', '', 'The empire splits in two, and the land is ruled from Constantinople.'),
 ('R', '438', 437.5, 'd', '', 'The Theodosian Code bars Jews from public office.'),
 ('R', '451', 451, 'f', '', 'The Council of Chalcedon makes Jerusalem a patriarchate of the Church.'),
 ('R', '476', 476, 'r', '', 'Rome falls in the West. Byzantium rules on in the East.'),
 # 500 to 750
 ('L', 'c. 550', 550, 'l', '', 'The poet Yannai writes piyyutim, Hebrew hymns for the synagogue.'),
 ('L', 'c. 641', 641, 's', '', 'Seventy Jewish families from Tiberias settle in Jerusalem, by tradition.'),
 ('L', 'c. 700', 700, 'f', '', 'The academy of the land of Israel meets in Tiberias.'),
 ('R', '527', 527, 'r', '', 'Justinian becomes emperor. His laws restrict Jews and Samaritans.'),
 ('R', '636', 636, 'c', '', 'The Arabs defeat the Byzantines at the Yarmuk River.'),
 ('R', 'c. 720', 720, 'd', '', 'The rules for non-Muslims later called the Pact of Umar take shape.'),
 # 750 to 1099
 ('L', 'c. 760', 760, 'f', '', 'Anan ben David founds the Karaite movement in Babylonia.'),
 ('L', 'c. 950', 950, 'f', '', 'The academy of the land of Israel moves from Tiberias to Jerusalem.'),
 ('L', 'c. 1050', 1050, 'l', '', 'Letters later found in the Cairo Geniza record Jewish life in the land.'),
 ('L', '1071', 1071.5, 'f', '', 'The academy leaves Jerusalem for Tyre after the Seljuk conquest.'),
 ('R', '878', 878, 'r', '', 'Ahmad ibn Tulun adds the land to his Egyptian dynasty.'),
 ('R', '935', 935, 'r', '', 'The Ikhshidids rule the land from Egypt.'),
 # 1099 to 1260
 ('L', '1100', 1100, 's', '', 'Jews of Egypt and Ashkelon ransom captives and Torah scrolls taken in Jerusalem.'),
 ('L', 'c. 1180', 1180, 'l', '', 'Petahiah of Regensburg travels through the land and visits the graves of the sages.'),
 ('L', 'c. 1218', 1218, 'l', '', 'The poet Judah al-Harizi visits Jerusalem and finds its Jews returned.'),
 # 1260 to 1517
 ('L', '1260', 1260.5, 's', '', 'Rabbi Yehiel of Paris settles in Acre with his students.'),
 ('R', '1265', 1265, 'c', '', 'Baybars takes Caesarea and Arsuf from the Crusaders.'),
 # 1517 to 1799
 ('R', '1536', 1536, 's', '', 'Suleiman builds public fountains in Jerusalem.'),
 ('R', '1624', 1624, 'r', '', 'The Druze emir Fakhr al-Din rules the Galilee for the Ottomans.'),
 ('R', '1703', 1703, 'c', '', 'The Naqib al-Ashraf revolt holds Jerusalem for two years.'),
 ('L', 'c. 520', 520.5, 'f', '', 'Mar Zutra III comes from Babylonia to head the Sanhedrin in Tiberias.'),
 ('R', '541', 541, 's', '', 'The Plague of Justinian strikes the land.'),
 ('R', '622', 622, 'f', '', 'Muhammad leaves Mecca for Medina, the start of Islam.'),
 ('L', 'c. 1000', 1000, 'f', '', 'Jews gather on the Mount of Olives each Hoshana Rabbah to pray and proclaim the calendar.'),
 ('L', '1051', 1051, 'f', '', 'Daniel ben Azariah, of the house of David, heads the academy in Jerusalem.'),
 ('R', '1048', 1048, 'f', '', 'The Church of the Holy Sepulchre is rebuilt with Byzantine help.'),
 ('R', '1095', 1095, 'c', '', 'Pope Urban II calls the First Crusade.'),
 ('L', '1191', 1191.5, 's', '', 'Saladin destroys Ashkelon, and its Jews move to Jerusalem.'),
 ('R', '1149', 1149, 'f', '', 'The rebuilt Church of the Holy Sepulchre is consecrated.'),
 ('R', '1219', 1219, 'c', '', 'The Ayyubid ruler tears down the walls of Jerusalem.'),
 ('L', '1286', 1286, 's', '', 'Rabbi Meir of Rothenburg is seized while setting out for the land of Israel.'),
 ('R', '1400', 1400.5, 'c', '', 'Timur sacks Damascus.'),
 ('R', '1482', 1482, 's', '', 'Sultan Qaitbay builds his fountain on the Temple Mount.'),
 ('L', '1586', 1586, 'f', '', 'The Ottoman governor closes the Ramban Synagogue.'),
 ('L', '1747', 1747, 's', '', 'Rabbi Gershon of Kuty, brother-in-law of the Baal Shem Tov, settles in the land.'),
 ('R', '1552', 1552, 's', '', 'The Haseki Sultan soup kitchen opens in Jerusalem.'),
]
PAGES = []
for P in data3.PAGES:
    L, R = [], []
    for t in P['tp']: (L if t[1] in LEFT else R).append([t[0], t[1], t[2], t[3], t[4]])
    for a in P['also']: (L if a[1] in LEFT else R).append([a[0], a[1], a[2], '', a[3]])
    for side, lbl, y, c, h, t in ADD:
        if P['y0'] <= y < P['y1'] or (P['id'] == '004f' and y == P['y1']):
            (L if side == 'L' else R).append([lbl, y, c, h, t])
    Q = dict(P); Q['left'] = sorted(L, key=lambda x: x[1]); Q['right'] = sorted(R, key=lambda x: x[1]); PAGES.append(Q)
if __name__ == '__main__':
    for P in PAGES: print(P['id'], len(P['left']), len(P['right']))
