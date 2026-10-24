"""Final registry: the frozen base content plus the diaspora split for Timelines 11 to 14."""
import json, re, os
D = os.path.dirname(os.path.abspath(__file__))
R = json.load(open(f'{D}/registry_base.json'))
JW = re.compile(r"Jew|Zion|aliyah|Hebrew|kibbutz|rabbi|synagogue|yeshiva|Montefiore|Rothschild|Herzl|Hasid|Perushim|Hurva|Pinsker|Ahad Ha|Ben-Yehuda|BILU|Lovers of Zion|Mishkenot|Mea Shearim|Nahalat Shiva|Petah Tikva|Mikveh|Rishon|Zikhron|Rosh Pina|Gedera|Rehovot|Hadera|Metula|Degania|Tel Aviv|Ahuzat|Hashomer|Bezalel|Technion|Nili|Aaronsohn|Feinberg|Trumpeldor|Gymnasium|Herzliya|Kalischer|Hess|Alkalai|Mapu|Imber|Hatikvah|Yellin|Ben-Avi|Raab|Kook|Szold|Hadassah|Weizmann|Dizengoff|Ticho|Pann|Nordau|Yesud|Ekron|Nes Ziona|Neve Tzedek|Mishmar|Sejera|Kfar Tavor|Yavne|Gei Oni|Uganda|Kishinev|pogrom|Dreyfus|Birnbaum|Ussishkin|Ruppin|Ben-Gurion|Ben-Zvi|Brenner|Gordon|Agnon|Bialik|Kinneret|Merhavia|Legion|Atlit|Second Aliyah|Balfour|Anglo-Palestine|Gutman|Hapoel|Bluwstein|Beilis", re.I)
EXTRA = {12: [['1882', 1882.5, 'r', '', 'Britain occupies Egypt.'], ['1898', 1898.6, 'r', '', 'Kaiser Wilhelm II enters Jerusalem through a breach made beside the Jaffa Gate.']],
         13: [['1905', 1905.5, 's', '', 'A branch of the Hejaz Railway links Haifa to Damascus.'], ['1906', 1906.8, 'd', '', 'The Ottomans and Britain fix the border of Sinai from Rafah to Taba.']]}
FORCE_R = ('Tsar Alexander II', 'Russia’s May Laws', 'Jews are expelled from Moscow', 'The Ottomans bar Russian Jews', 'The Dreyfus Affair', 'Mendel Beilis', 'The Ottoman Empire enters', 'The Ottomans expel', 'Pogroms in Ukraine')
def isj(t): return JW.search(t) and not t.startswith(FORCE_R)
for r in R:
    if 11 <= r['n'] <= 14:
        L, Rt = [], []
        for t in r['tp']: (L if isj(t[3] + ' ' + t[4]) else Rt).append(t)
        for x in r['also']: (L if isj(x[3]) else Rt).append([x[0], x[1], x[2], '', x[3]])
        Rt += EXTRA.get(r['n'], [])
        r['style'] = 'dual'; r['left'] = sorted(L, key=lambda e: e[1]); r['right'] = sorted(Rt, key=lambda e: e[1])
        span = r['y1'] - r['y0']; r['step'] = 10 if span > 30 else 2 if span > 12 else 1
json.dump(R, open(f'{D}/registry.json', 'w'), ensure_ascii=False, indent=1)
if __name__ == '__main__':
    for r in R:
        if 11 <= r['n'] <= 14:
            print('==', r['n'], len(r['left']), len(r['right']))
            for x in r['right']: print('  R', x[0], x[3] or x[4][:85])
