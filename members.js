/* Israel NOWlej members (browser side): sign in and sign up, your account and profile, full access with a code,
   the members directory and the owner's access levels page. Server: members_server.js (/api/m/*). */
(function () {
  var box = document.querySelector('#mb-app [data-page]'); if (!box) return;
  var page = box.getAttribute('data-page'), Q = new URLSearchParams(location.search), root = box;
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function $(s, el) { return (el || document).querySelector(s); }
  function api(p, body, hdr) {
    var o = body ? { method: 'POST', headers: Object.assign({ 'content-type': 'application/json' }, hdr || {}), body: JSON.stringify(body), credentials: 'same-origin' } : { method: 'POST', headers: Object.assign({ 'content-type': 'application/json' }, hdr || {}), body: '{}', credentials: 'same-origin' };
    return fetch('/api/m/' + p, o).then(function (r) { return r.json().catch(function () { return { ok: false, error: 'Something went wrong.' }; }); }, function () { return { ok: false, error: 'No connection. Try again.' }; });
  }
  function day(t) { return new Date(t).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }); }
  function safeNext() { var n = Q.get('next') || ''; return /^\/[a-z0-9]/i.test(n) && n.indexOf('//') < 0 ? n : ''; }
  function form(html, go) {
    var f = document.createElement('form'); f.className = 'mb-form'; f.innerHTML = html + '<p class="mb-err" role="alert"></p>';
    f.addEventListener('submit', function (e) {
      e.preventDefault(); var d = {}; [].forEach.call(f.elements, function (i) { if (!i.name) return; d[i.name] = i.type === 'checkbox' ? i.checked : i.value; });
      var b = $('button[type=submit]', f); if (b) b.disabled = true; $('.mb-err', f).textContent = '';
      Promise.resolve(go(d, f)).then(function (e2) { if (b) b.disabled = false; if (e2) $('.mb-err', f).innerHTML = e2; });
    });
    return f;
  }
  var NEED = { members: 'This part of the site is for members. Membership is free: sign in or create an account to keep reading.', paid: 'This part of the site needs full access. Sign in first, then you can open it with an access code.' };

  // ------------------------------------------------------------ sign in / sign up
  function signin(me) {
    var next = safeNext();
    if (me) { location.replace(next || '/account/'); return; }
    root.innerHTML = '<h1>Sign in</h1>' + (Q.get('need') && NEED[Q.get('need')] ? '<p class="mb-note">' + NEED[Q.get('need')] + '</p>' : '<p class="lead">Members get their own profile page, and the parts of the site set aside for members.</p>');
    var g = document.createElement('div'); g.className = 'mb-two';
    g.appendChild(form('<h2>Sign in</h2><label>Email <input name="email" type="email" required autocomplete="email"></label><label>Password <input name="password" type="password" required autocomplete="current-password"></label><button type="submit" class="mb-btn">Sign in</button>',
      function (d) { return api('login', d).then(function (r) { if (!r.ok) return esc(r.error); location.replace(next || '/account/'); }); }));
    g.appendChild(form('<h2>Create a free account</h2><label>Your name <input name="name" required maxlength="80" autocomplete="name"></label><label>Email <input name="email" type="email" required autocomplete="email"></label><label>Password <input name="password" type="password" required minlength="8" autocomplete="new-password"><small>At least 8 characters.</small></label><button type="submit" class="mb-btn">Create account</button><p class="mb-small">By creating an account you agree to the <a href="/legal/">terms and privacy notice</a>. Your email is never shown on your profile.</p>',
      function (d) { return api('signup', d).then(function (r) { if (!r.ok) return esc(r.error); location.replace(next || '/account/?new=1'); }); }));
    root.appendChild(g);
  }

  // ------------------------------------------------------------ your account and profile
  function shrink(file, cb) {
    var fr = new FileReader(); fr.onload = function () { var im = new Image(); im.onload = function () {
      var s = 400, c = document.createElement('canvas'), w = im.width, h = im.height, k = Math.min(w, h); c.width = s; c.height = s;
      c.getContext('2d').drawImage(im, (w - k) / 2, (h - k) / 2, k, k, 0, 0, s, s); cb(c.toDataURL('image/jpeg', .85)); }; im.onerror = function () { cb(null); }; im.src = fr.result; }; fr.readAsDataURL(file);
  }
  function account(me) {
    if (!me) { location.replace('/signin/?next=' + encodeURIComponent('/account/')); return; }
    var paid = me.paid_until > Date.now();
    root.innerHTML = '<h1>Your account</h1>' + (Q.get('new') ? '<p class="mb-note">Welcome! Your account is ready. Fill in your profile below, and make it public if you would like other members to see it.</p>' : '')
      + '<p class="lead">Signed in as <b>' + esc(me.email) + '</b>. ' + (paid ? 'Full access until ' + day(me.paid_until) + '.' : 'Free membership. <a href="/join/">Full access</a>') + '</p>'
      + '<p class="mb-acts"><a class="mb-btn ghost" href="/member/' + esc(me.handle) + '/">See my profile page</a><button class="mb-btn ghost" type="button" id="so">Sign out</button></p>';
    var av = document.createElement('div'); av.className = 'mb-form mb-avbox';
    av.innerHTML = '<h2>Photo</h2><div class="mb-avrow">' + (me.avatar ? '<img class="mb-av" src="/member/' + esc(me.handle) + '/photo?v=' + me.avatar + '" alt="" width="96" height="96">' : '<span class="mb-av mb-ini">' + esc(me.name.split(/\s+/).map(function (w) { return w[0]; }).slice(0, 2).join('').toUpperCase()) + '</span>')
      + '<div><label class="mb-btn ghost mb-file">Choose a photo<input type="file" accept="image/*" id="pf" hidden></label>' + (me.avatar ? ' <button type="button" class="mb-btn ghost" id="pr">Remove</button>' : '') + '<p class="mb-small">Square works best. We shrink it to 400 pixels.</p><p class="mb-err" id="pe"></p></div></div>';
    root.appendChild(av);
    $('#pf', av).onchange = function () { var f = this.files[0]; if (!f) return; shrink(f, function (d) { if (!d) { $('#pe').textContent = 'That file is not a picture we can read.'; return; } api('photo-save', { photo: d }).then(function (r) { if (!r.ok) $('#pe').textContent = r.error; else location.reload(); }); }); };
    if ($('#pr', av)) $('#pr', av).onclick = function () { api('photo-save', { photo: '' }).then(function () { location.reload(); }); };
    var L = me.links || [];
    root.appendChild(form('<h2>Profile</h2><label>Name <input name="name" required maxlength="80" value="' + esc(me.name) + '"></label>'
      + '<label>Profile address <span class="mb-addr">israelnowlej.com/member/<input name="handle" maxlength="40" value="' + esc(me.handle) + '" pattern="[a-z0-9][a-z0-9-]{1,38}[a-z0-9]"></span><small>Lowercase letters, numbers and hyphens.</small></label>'
      + '<label>Where you live <input name="country" maxlength="60" value="' + esc(me.country) + '" placeholder="City, country"></label>'
      + '<label>About you <textarea name="bio" rows="5" maxlength="600" placeholder="A few lines about you and your interest in Israel">' + esc(me.bio) + '</textarea></label>'
      + [0, 1, 2].map(function (i) { return '<label>' + (i ? 'Another link' : 'Link (website or social profile)') + ' <input name="l' + i + '" type="url" maxlength="200" value="' + esc(L[i] || '') + '" placeholder="https://"></label>'; }).join('')
      + '<label class="mb-chk"><input type="checkbox" name="public"' + (me.public ? ' checked' : '') + '> Make my profile public (listed on the members page)</label><button type="submit" class="mb-btn">Save profile</button>',
      function (d) { d.links = [d.l0, d.l1, d.l2].filter(Boolean); return api('profile-save', d).then(function (r) { if (!r.ok) return esc(r.error); return '<span class="mb-ok">Saved. <a href="/member/' + esc(r.member.handle) + '/">See your profile</a></span>'; }); }));
    root.appendChild(form('<h2>Access code</h2><p class="mb-small">Have a code for full access? Enter it here.</p><label>Code <input name="code" required autocomplete="off" autocapitalize="characters" placeholder="INW-XXXX-XXXX"></label><button type="submit" class="mb-btn">Redeem</button>',
      function (d) { return api('redeem', d).then(function (r) { if (!r.ok) return esc(r.error); setTimeout(function () { location.reload(); }, 900); return '<span class="mb-ok">Done. Full access until ' + day(r.until) + '.</span>'; }); }));
    root.appendChild(form('<h2>Password</h2><label>Current password <input name="old" type="password" required autocomplete="current-password"></label><label>New password <input name="new" type="password" required minlength="8" autocomplete="new-password"></label><button type="submit" class="mb-btn">Change password</button>',
      function (d) { return api('password', d).then(function (r) { return r.ok ? '<span class="mb-ok">Password changed.</span>' : esc(r.error); }); }));
    var del = form('<h2>Delete account</h2><p class="mb-small">This removes your account and profile for good.</p><label>Password <input name="password" type="password" required autocomplete="current-password"></label><button type="submit" class="mb-btn ghost">Delete my account</button>',
      function (d) { if (!confirm('Delete your account for good?')) return ''; return api('delete-account', d).then(function (r) { if (!r.ok) return esc(r.error); location.replace('/'); }); });
    del.classList.add('mb-danger'); root.appendChild(del);
    $('#so').onclick = function () { api('logout').then(function () { location.replace('/'); }); };
  }

  // ------------------------------------------------------------ full access
  function join(me) {
    var next = safeNext();
    root.innerHTML = '<h1>Full access</h1><p class="lead">Some parts of Israel NOWlej need full access. ' + (me && me.paid_until > Date.now() ? 'You have it until ' + day(me.paid_until) + '.' : 'Open them with an access code.') + '</p>';
    if (!me) { root.insertAdjacentHTML('beforeend', '<p><a class="mb-btn" href="/signin/?next=' + encodeURIComponent(location.pathname + location.search) + '">Sign in or create a free account</a></p>'); return; }
    if (me.paid_until > Date.now()) { if (next) root.insertAdjacentHTML('beforeend', '<p><a class="mb-btn" href="' + esc(next) + '">Continue reading</a></p>'); return; }
    root.appendChild(form('<h2>Have an access code?</h2><label>Code <input name="code" required autocomplete="off" autocapitalize="characters" placeholder="INW-XXXX-XXXX"></label><button type="submit" class="mb-btn">Open full access</button>',
      function (d) { return api('redeem', d).then(function (r) { if (!r.ok) return esc(r.error); location.replace(next || '/account/'); }); }));
    root.insertAdjacentHTML('beforeend', '<p class="mb-small">Questions? <a href="/contact/">Contact us</a>.</p>');
  }

  // ------------------------------------------------------------ members directory
  function members() {
    api('directory').then(function (r) {
      var L = (r && r.members) || [];
      root.innerHTML = '<h1>Members</h1><p class="lead">Members of Israel NOWlej who share a public profile. <a href="/signin/">Join free</a> and add yours.</p>'
        + (L.length ? '<ul class="mb-dir">' + L.map(function (m) { return '<li><a href="/member/' + esc(m.handle) + '/">' + (m.avatar ? '<img class="mb-av" src="/member/' + esc(m.handle) + '/photo?v=' + m.avatar + '" alt="" width="64" height="64" loading="lazy">' : '<span class="mb-av mb-ini">' + esc((m.name || '?').split(/\s+/).map(function (w) { return w[0]; }).slice(0, 2).join('').toUpperCase()) + '</span>') + '<span><b>' + esc(m.name) + '</b>' + (m.country ? '<small>' + esc(m.country) + '</small>' : '') + (m.bio ? '<i>' + esc(m.bio) + '</i>' : '') + '</span></a></li>'; }).join('') + '</ul>' : '<p>No public profiles yet. Be the first.</p>');
    });
  }

  // ------------------------------------------------------------ owner: access levels, members, codes
  function access() {
    var K = ''; try { K = sessionStorage.getItem('inw-admin') || ''; } catch (e) {}
    function signinA(err) {
      root.innerHTML = '<h1>Access levels</h1><p class="lead">For the site owner. Use the same admin key as the other admin pages.</p>';
      root.appendChild(form('<label>Admin key <input name="k" type="password" required autocomplete="current-password"></label><button type="submit" class="mb-btn">Open</button>' + (err ? '<p class="mb-err">' + esc(err) + '</p>' : ''), function (d) { K = d.k; try { sessionStorage.setItem('inw-admin', K); } catch (e) {} load(); }));
    }
    function A(p, b) { return api('admin/' + p, b || {}, { 'x-admin-key': K }); }
    function load() {
      if (!K) return signinA();
      A('state').then(function (r) {
        if (!r.ok) { try { sessionStorage.removeItem('inw-admin'); } catch (e) {} K = ''; return signinA(r.error); }
        var lv = function (s) { return r.rules[s] || 'public'; };
        root.innerHTML = '<h1>Access levels</h1><p class="lead">Choose who can open each section. <b>Public</b>: everyone. <b>Members</b>: anyone signed in (free). <b>Paid</b>: members with full access. Changes apply within a minute.</p>'
          + '<p class="mb-stats"><b>' + r.counts.members + '</b> members &middot; <b>' + r.counts.paid + '</b> with full access &middot; <b>' + r.counts.public + '</b> public profiles</p>'
          + '<p class="mb-acts"><button class="mb-btn ghost" type="button" data-all="public">Open everything</button></p>'
          + '<div class="mb-tablewrap"><table class="mb-table"><thead><tr><th>Section</th><th>Public</th><th>Members</th><th>Paid</th></tr></thead><tbody>'
          + r.sections.map(function (s) { return '<tr><td><a href="/' + s[0] + '/" target="_blank">' + esc(s[1]) + '</a></td>' + ['public', 'members', 'paid'].map(function (l) { return '<td><input type="radio" name="r-' + s[0] + '" value="' + l + '" aria-label="' + esc(s[1]) + ' ' + l + '"' + (lv(s[0]) === l ? ' checked' : '') + '></td>'; }).join('') + '</tr>'; }).join('')
          + '</tbody></table></div><p class="mb-err" id="re"></p>';
        [].forEach.call(root.querySelectorAll('input[type=radio]'), function (i) { i.onchange = function () { A('rule', { section: i.name.slice(2), level: i.value }).then(function (x) { $('#re').innerHTML = x.ok ? '<span class="mb-ok">Saved.</span>' : esc(x.error); }); }; });
        $('[data-all]').onclick = function () { if (!confirm('Make every section public?')) return; Promise.all(r.sections.map(function (s) { return A('rule', { section: s[0], level: 'public' }); })).then(load); };
        var g = document.createElement('div'); g.className = 'mb-two';
        g.appendChild(form('<h2>Access codes</h2><p class="mb-small">A code gives a member full access (Paid) for a number of days.</p><label>Days <input name="days" type="number" min="1" max="3650" value="365"></label><label>Uses per code <input name="uses" type="number" min="1" max="100000" value="1"></label><label>Your own code (optional) <input name="custom" maxlength="24" placeholder="ZION26"></label><label>How many random codes <input name="count" type="number" min="1" max="100" value="1"></label><label>Ends on (optional) <input name="expires" type="date"></label><label>Note <input name="note" maxlength="200"></label><button class="mb-btn" type="submit">Make</button>',
          function (d) { return A('code', d).then(function (x) { if (!x.ok) return esc(x.error); setTimeout(load, 1500); return '<span class="mb-ok">New: ' + x.codes.map(esc).join(' ') + '</span>'; }); }));
        g.appendChild(form('<h2>Give full access</h2><label>Member email <input name="email" type="email" required></label><label>Days (0 removes it) <input name="days" type="number" min="0" max="3650" value="365"></label><button class="mb-btn" type="submit">Save</button>',
          function (d) { return A('paid', d).then(function (x) { if (!x.ok) return esc(x.error); setTimeout(load, 900); return '<span class="mb-ok">Done.</span>'; }); }));
        root.appendChild(g);
        root.insertAdjacentHTML('beforeend', '<h2>Codes</h2>' + (r.codes.length ? '<div class="mb-tablewrap"><table class="mb-table"><thead><tr><th>Code</th><th>Days</th><th>Used</th><th>Ends</th><th>Note</th></tr></thead><tbody>' + r.codes.map(function (c) { return '<tr><td><code>' + esc(c.code) + '</code></td><td>' + c.days + '</td><td>' + c.uses + ' of ' + c.uses_max + '</td><td>' + (c.expires ? day(c.expires) : '') + '</td><td>' + esc(c.note || '') + '</td></tr>'; }).join('') + '</tbody></table></div>' : '<p>None yet.</p>')
          + '<h2>Members</h2>' + (r.members.length ? '<div class="mb-tablewrap"><table class="mb-table"><thead><tr><th>Name</th><th>Email</th><th>Profile</th><th>Full access</th><th>Joined</th><th></th></tr></thead><tbody>' + r.members.map(function (m) { return '<tr' + (m.hidden ? ' class="mb-hid"' : '') + '><td>' + esc(m.name) + '</td><td>' + esc(m.email) + '</td><td>' + (m.public ? '<a href="/member/' + esc(m.handle) + '/" target="_blank">Public</a>' : 'Private') + '</td><td>' + (m.paid_until > Date.now() ? day(m.paid_until) : '') + '</td><td>' + day(m.created) + '</td><td><button class="mb-mini" type="button" data-hide="' + m.id + '" data-h="' + (m.hidden ? 0 : 1) + '">' + (m.hidden ? 'Show profile' : 'Hide profile') + '</button></td></tr>'; }).join('') + '</tbody></table></div>' : '<p>No members yet.</p>')
          + '<p><button class="mb-btn ghost" type="button" id="aso">Close admin</button></p>');
        [].forEach.call(root.querySelectorAll('[data-hide]'), function (b) { b.onclick = function () { A('hide', { id: +b.dataset.hide, hidden: b.dataset.h === '1' }).then(load); }; });
        $('#aso').onclick = function () { try { sessionStorage.removeItem('inw-admin'); } catch (e) {} K = ''; signinA(); };
      });
    }
    load();
  }

  if (page === 'members') return members();
  if (page === 'access') return access();
  api('me').then(function (r) {
    var me = r && r.member;
    if (page === 'signin') signin(me); else if (page === 'account') account(me); else if (page === 'join') join(me);
  });
})();
