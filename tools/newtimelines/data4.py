# Green-era pages split into Jewish life (left) and the ruling powers (right).
import data3
LEFT = {135,200,351,363,400,425,499,220,359,438, 614,629,520,589, 900,928,880,920,921, 1190,1141,1165,1170,1211,
        1267,1474,1488,1492,1322,1400,1428,1481,1497, 1565,1570,1660,1665,1700,1740,1540,1561,1577,1621,1648,1742,1777}
PAGES = []
for P in data3.PAGES:
    L, R = [], []
    for t in P['tp']: (L if t[1] in LEFT else R).append([t[0], t[1], t[2], t[3], t[4]])
    for a in P['also']: (L if a[1] in LEFT else R).append([a[0], a[1], a[2], '', a[3]])
    Q = dict(P); Q['left'] = sorted(L, key=lambda x: x[1]); Q['right'] = sorted(R, key=lambda x: x[1]); PAGES.append(Q)
if __name__ == '__main__':
    for P in PAGES: print(P['id'], len(P['left']), len(P['right']))
