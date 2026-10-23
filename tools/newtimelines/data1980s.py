# Timeline 15, the 1980s, redrawn with more turning points. Dates: (label, decimal year, cat, ...)
M = dict(Jan=0, Feb=1, Mar=2, Apr=3, May=4, Jun=5, Jul=6, Aug=7, Sep=8, Oct=9, Nov=10, Dec=11)
def d(lbl):
    if lbl == '1984 to 1985': return 1984.9
    if lbl == '1989': return 1989.75
    p = lbl.split()
    y = int(p[0]); m = M.get(p[1], 0) if len(p) > 1 and p[1] in M else 0
    day = int(p[2]) if len(p) > 2 and p[2].isdigit() and len(p[2]) <= 2 else 15
    return y + (m + (day - 1) / 31) / 12
PAGE = dict(id='015', y0=1980, y1=1990,
 tp=[
  ('1981 Jun 7', 'c', 'Israel destroys the Osirak reactor.', 'Jets strike Iraq’s nuclear reactor near Baghdad before it can go into operation.'),
  ('1982 Apr 25', 'r', 'Israel leaves Sinai.', 'The last of the peninsula returns to Egypt under the peace treaty, and the town of Yamit is evacuated.'),
  ('1982 Jun 6', 'c', 'The Lebanon War.', 'Israel invades to drive out the PLO, which leaves Beirut in August. Israel stays in southern Lebanon until 2000. <span class="map">MAP 28</span>'),
  ('1983 Feb 8', 'd', 'The Kahan Commission.', 'It finds Ariel Sharon indirectly responsible for Sabra and Shatila, and he leaves the Defense Ministry.'),
  ('1984 to 1985', 's', 'Operation Moses.', 'Thousands of Ethiopian Jews are brought to Israel by way of Sudan.'),
  ('1985 Jul 1', 'r', 'The economic stabilization plan.', 'The unity government brings inflation of over 400 percent down within a year.'),
  ('1987 Dec 8', 'c', 'The First Intifada.', 'A Palestinian uprising begins in Gaza and spreads to Judea and Samaria. It lasts until 1993.'),
  ('1989', 's', 'The Soviet Union opens its gates.', 'A mass aliyah begins that brings about a million Jews to Israel within a decade.'),
 ],
 also=[
  ('1980 Apr 7', 'c', 'Terrorists seize the nursery at Kibbutz Misgav Am.'),
  ('1980 May 2', 'c', 'Gunmen kill six yeshiva students in Hebron.'),
  ('1980 Jul 30', 'r', 'Territory: The Knesset passes the Jerusalem Law, which declares the united city the capital of Israel.'),
  ('1981 Jun 30', 'r', 'Election: Likud wins 48 seats.'),
  ('1981 Oct 6', 'c', 'Anwar Sadat is assassinated in Cairo.'),
  ('1981 Dec 14', 'r', 'Territory: the Knesset applies Israeli law to the Golan Heights.'),
  ('1982 Jun 3', 'c', 'An attack on the Israeli ambassador in London sparks the Lebanon War.'),
  ('1982 Sep 16 to 18', 'c', 'Lebanese militias massacre Palestinians at Sabra and Shatila.'),
  ('1982 Nov 11', 'c', 'A car bomb destroys the Israeli headquarters in Tyre.'),
  ('1983 May', 'l', 'Ofra Haza places second at the Eurovision Song Contest.'),
  ('1983 May 17', 'd', 'Israel and Lebanon sign an agreement that is canceled in 1984.'),
  ('1983 Oct 10', 'r', 'Yitzhak Shamir becomes prime minister.'),
  ('1984 Apr', 'c', 'Security forces arrest the Jewish Underground.'),
  ('1984 Apr 12', 'c', 'In the Bus 300 affair, two hijackers die in custody.'),
  ('1984 Jul 23', 'r', 'Election: Alignment 44 seats, Likud 41.'),
  ('1984 Sep 13', 'r', 'Shimon Peres becomes prime minister in a rotation with Shamir.'),
  ('1985 May 20', 'd', 'Israel frees 1,150 prisoners for three captured soldiers.'),
  ('1985 Jun 10', 'r', 'Territory: Israel pulls back to a security zone in southern Lebanon.'),
  ('1985 Oct 1', 'c', 'Israeli jets bomb PLO headquarters in Tunis.'),
  ('1985 Oct 5', 'c', 'An Egyptian policeman kills seven Israeli tourists at Ras Burqa.'),
  ('1985 Oct 7', 'c', 'Hijackers seize the cruise ship Achille Lauro.'),
  ('1985 Dec 27', 'c', 'Gunmen attack El Al counters at Rome and Vienna airports.'),
  ('1986', 'l', 'Yaacov Agam’s Fire and Water Fountain is installed in Dizengoff Square.'),
  ('1986 Sep 6', 'c', 'Gunmen kill 22 worshippers at the Neve Shalom synagogue in Istanbul.'),
  ('1986 Oct 16', 'c', 'Navigator Ron Arad is captured in Lebanon.'),
  ('1986 Oct 20', 'r', 'Shamir returns as prime minister in the rotation.'),
  ('1987 Apr 11', 'd', 'Summit: Peres and King Hussein agree to the London Agreement.'),
  ('1987 Nov 25', 'c', 'A hang glider attack from Lebanon kills six soldiers.'),
  ('1988 Mar 7', 'c', 'Terrorists hijack a bus near Dimona and three civilians die.'),
  ('1988 Apr 16', 'c', 'Abu Jihad is killed in Tunis.'),
  ('1988 Jul 31', 'r', 'Territory: Jordan renounces its claim to Judea and Samaria.'),
  ('1988 Nov 1', 'r', 'Election: Likud wins 40 seats.'),
  ('1988 Nov 15', 'd', 'The PLO declares a state at its Algiers meeting.'),
  ('1988 Dec 14', 'd', 'The United States opens a dialogue with the PLO.'),
  ('1989 Mar 15', 'r', 'Territory: Israel returns Taba to Egypt after international arbitration.'),
  ('1989 May 14', 'd', 'Shamir proposes elections in Judea and Samaria and Gaza.'),
  ('1989 Jul 6', 'c', 'A terrorist drives Bus 405 into a ravine and 16 die.'),
 ])
