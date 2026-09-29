(function () {
  var list = document.querySelectorAll('.rowset .row');
  var rows = [].slice.call(list);
  var links = rows.map(function (r) { return r.querySelector('a'); });
  var secs = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  var tally = document.getElementById('tally');
  var keyBtn = document.getElementById('keyBtn');
  var legend = document.getElementById('keyPanel');
  var cur = -1;

  function paint(i) {
    if (i < 0 || i >= rows.length) return;
    cur = i;
    rows.forEach(function (row, k) {
      if (k === i) links[k].setAttribute('aria-current', 'true');
      else links[k].removeAttribute('aria-current');
      row.classList.toggle('is-past', k < i);
      row.classList.toggle('is-now', k === i);
      row.classList.toggle('is-next', k > i);
    });
    document.documentElement.style.setProperty('--cur', String(i));
    tally.textContent = (i + 1 < 10 ? '0' : '') + (i + 1);
  }

  function read() {
    var line = window.innerHeight * 0.44;
    var best = cur < 0 ? 0 : cur;
    var gap = Infinity;
    for (var k = 0; k < secs.length; k++) {
      var s = secs[k];
      if (!s) continue;
      var r = s.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) continue;
      var d = Math.abs(r.top - line);
      if (d < gap) { gap = d; best = k; }
    }
    paint(best);
  }

  var waiting = false;
  function onScroll() {
    if (waiting) return;
    waiting = true;
    requestAnimationFrame(function () { waiting = false; read(); });
  }

  links.forEach(function (a, k) {
    a.addEventListener('click', function () { paint(k); });
    a.addEventListener('focus', function () { if (k !== cur) paint(k); });
  });

  function toggle(open) {
    legend.classList.toggle('is-open', open);
    keyBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    keyBtn.querySelector('.key__text').textContent = open ? 'Hide legend' : 'Press legend';
  }

  keyBtn.addEventListener('click', function () {
    toggle(keyBtn.getAttribute('aria-expanded') !== 'true');
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (keyBtn.getAttribute('aria-expanded') === 'true') {
      toggle(false);
      keyBtn.focus();
    }
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  var from = links.map(function (a) { return a.getAttribute('href'); }).indexOf('#' + (location.hash || '').slice(1));
  if (from >= 0) paint(from); else { paint(0); read(); }
})();
