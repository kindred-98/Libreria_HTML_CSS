(function () {
  var hdr = document.getElementById('hdr');
  var acctBtn = document.getElementById('acctBtn');
  var panel = document.getElementById('acctPanel');
  var list = document.getElementById('acctList');
  var burger = document.getElementById('burger');
  var drawer = document.getElementById('drawer');
  var nav = document.querySelector('.nav');
  var navLinks = Array.prototype.slice.call(nav.querySelectorAll('.nav__a'));
  var drLinks = Array.prototype.slice.call(drawer.querySelectorAll('.dr__a'));
  var navInk = document.getElementById('navInk');
  var sheen = document.getElementById('sheen');
  var acctName = document.getElementById('acctName');
  var acctRole = document.getElementById('acctRole');
  var acctAv = document.getElementById('acctAv');
  var acctLamp = document.getElementById('acctLamp');
  var drNote = document.getElementById('drNote');
  var addBtn = document.getElementById('addBtn');
  var signBtn = document.getElementById('signBtn');
  var rows = Array.prototype.slice.call(list.querySelectorAll('.acc'));
  var drRows = Array.prototype.slice.call(drawer.querySelectorAll('.dr__row'));
  var sections = ['main', 'accounts', 'pipeline', 'billing', 'team']
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);
  var closeTimer = null;

  function setAccount(row, announce) {
    var name = row.dataset.name;
    var role = row.dataset.role;
    var key = row.dataset.key;
    var state = row.dataset.state;
    rows.forEach(function (r) { r.setAttribute('aria-checked', r === row ? 'true' : 'false'); });
    drRows.forEach(function (r) { r.setAttribute('aria-pressed', r.dataset.name === name ? 'true' : 'false'); });
    acctName.textContent = name;
    acctRole.textContent = role;
    acctAv.textContent = key;
    acctLamp.style.background = state === 'live'
      ? 'radial-gradient(circle at 36% 32%,#c9ffe9,#3ad6a4 55%,#0a3c2c)'
      : state === 'review'
        ? 'radial-gradient(circle at 36% 32%,#ffe6b8,#e6ad50 55%,#4a3208)'
        : state === 'draft'
          ? 'radial-gradient(circle at 36% 32%,#dde3ff,#8fa6ff 55%,#1b2456)'
          : 'radial-gradient(circle at 36% 32%,#cdd6ea,#66738f 55%,#252c3c)';
    if (announce && drNote) {
      drNote.textContent = 'Workspace: ' + name + '. ' + role + ' view, roster and deadlines updated.';
    }
    placeInk();
  }

  function openPanel() {
    if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
    panel.hidden = false;
    acctBtn.setAttribute('aria-expanded', 'true');
  }

  function closePanel(refocus) {
    acctBtn.setAttribute('aria-expanded', 'false');
    if (closeTimer) clearTimeout(closeTimer);
    closeTimer = setTimeout(function () {
      panel.hidden = true;
      closeTimer = null;
    }, 180);
    if (refocus) acctBtn.focus();
  }

  function openDrawer() {
    drawer.hidden = false;
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Close the menu');
  }

  function closeDrawer(refocus) {
    drawer.hidden = true;
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open the menu');
    if (refocus) burger.focus();
  }

  acctBtn.addEventListener('click', function () {
    if (acctBtn.getAttribute('aria-expanded') === 'true') closePanel(false);
    else openPanel();
  });

  list.addEventListener('keydown', function (e) {
    var i = rows.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      rows[(i + 1) % rows.length].focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      rows[(i - 1 + rows.length) % rows.length].focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      rows[0].focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      rows[rows.length - 1].focus();
    } else if (e.key === 'Tab') {
      closePanel(false);
    }
  });

  list.addEventListener('click', function (e) {
    var row = e.target.closest('.acc');
    if (!row) return;
    setAccount(row, true);
    closePanel(true);
    acctBtn.focus();
  });

  addBtn.addEventListener('click', function () {
    closePanel(true);
    var n = drNote ? drNote.textContent : '';
    if (drNote) drNote.textContent = 'Account request queued. A partner will invite the client owner before Friday.';
    window.setTimeout(function () { if (drNote) drNote.textContent = n; }, 4000);
  });

  signBtn.addEventListener('click', function () {
    closePanel(true);
    if (drNote) drNote.textContent = 'Signed out of the studio workspace. Nothing was lost.';
  });

  burger.addEventListener('click', function () {
    if (burger.getAttribute('aria-expanded') === 'true') closeDrawer(false);
    else openDrawer();
  });

  drawer.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { e.preventDefault(); closeDrawer(true); }
  });

  drawer.addEventListener('click', function (e) {
    var row = e.target.closest('.dr__row');
    if (row) {
      setAccount(row, true);
      closeDrawer(false);
      if (acctBtn.offsetParent !== null) acctBtn.focus();
      return;
    }
    var link = e.target.closest('.dr__a');
    if (link) closeDrawer(false);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (acctBtn.getAttribute('aria-expanded') === 'true') { e.preventDefault(); closePanel(true); }
      else if (burger.getAttribute('aria-expanded') === 'true') { e.preventDefault(); closeDrawer(true); }
    }
  });

  document.addEventListener('pointerdown', function (e) {
    if (acctBtn.getAttribute('aria-expanded') !== 'true') return;
    if (panel.contains(e.target) || acctBtn.contains(e.target)) return;
    closePanel(false);
  });

  function placeInk() {
    var active = navLinks.find(function (a) { return a.getAttribute('aria-current'); });
    if (!active) { navInk.style.opacity = '0'; return; }
    navInk.style.opacity = '1';
    navInk.style.width = active.offsetWidth + 'px';
    navInk.style.transform = 'translateX(' + (active.offsetLeft - 4) + 'px)';
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      var y = window.scrollY || window.pageYOffset;
      hdr.classList.toggle('tight', y > 42);
      var mid = window.innerHeight * 0.36;
      var current = sections[0];
      sections.forEach(function (s) {
        if (s.getBoundingClientRect().top <= mid) current = s;
      });
      navLinks.forEach(function (a) {
        if (a.getAttribute('href') === '#' + current.id) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
      drLinks.forEach(function (a) {
        if (a.getAttribute('href') === '#' + current.id) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
      placeInk();
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { placeInk(); onScroll(); });

  var lead = 0;
  window.setInterval(function () {
    lead = (lead + 1) % 8;
    var x = 24 + (window.innerWidth - 48) * (lead / 7);
    hdr.style.setProperty('--gx', x + 'px');
  }, 900);

  rows[0].setAttribute('aria-checked', 'true');
  drRows.forEach(function (r) { r.setAttribute('aria-pressed', 'false'); });
  setAccount(rows[0], false);
  window.setTimeout(placeInk, 60);
  onScroll();
  if (sheen) sheen.style.willChange = 'transform';
}());
