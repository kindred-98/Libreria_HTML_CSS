(function () {
  var label = document.getElementById('label');
  var needle = document.getElementById('needle');
  var mark = document.getElementById('mark');
  var rows = Array.prototype.slice.call(document.querySelectorAll('.tape__row'));
  var links = rows.map(function (r) { return r.querySelector('a'); });
  var roman = ['I', 'II', 'III', 'IV', 'V', 'VI'];
  var secs = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  var cur = -1;

  function unpick(i) {
    if (i < 0 || i >= rows.length) return;
    cur = i;
    links.forEach(function (a, k) {
      if (k === i) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
      rows[k].classList.toggle('is-on', k === i);
    });
    document.documentElement.style.setProperty('--cur', String(i));
    mark.textContent = roman[i];
  }

  function read() {
    var line = window.innerHeight * 0.46;
    var best = Math.max(cur, 0);
    var bestD = Infinity;
    for (var k = 0; k < secs.length; k++) {
      var s = secs[k];
      if (!s) continue;
      var r = s.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) continue;
      var d = Math.abs(r.top - line);
      if (d < bestD) { bestD = d; best = k; }
    }
    unpick(best);
  }

  var pending = false;
  function onScroll() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(function () { pending = false; read(); });
  }

  links.forEach(function (a, k) {
    a.addEventListener('click', function () { unpick(k); });
  });

  function pull(tight) {
    label.dataset.seam = tight ? 'tight' : 'loose';
    needle.setAttribute('aria-expanded', tight ? 'false' : 'true');
    needle.querySelector('.needle__text').textContent = tight ? 'Loosen the seam' : 'Tighten the seam';
  }

  needle.addEventListener('click', function () {
    pull(needle.getAttribute('aria-expanded') !== 'true');
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (needle.getAttribute('aria-expanded') === 'true') {
      pull(true);
      needle.focus();
    }
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  var start = links.map(function (a) { return a.getAttribute('href'); }).indexOf('#' + (location.hash || '').slice(1));
  if (start >= 0) unpick(start); else { unpick(0); read(); }
})();
