(function () {
  var field = document.getElementById('field');
  var trowel = document.getElementById('trowel');
  var mark = document.getElementById('mark');
  var cells = [].slice.call(document.querySelectorAll('.bed__cell'));
  var tiles = cells.map(function (c) { return c.querySelector('a'); });
  var roman = ['I', 'II', 'III', 'IV', 'V', 'VI'];
  var secs = tiles.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  var cur = -1;

  function raise(i) {
    if (i < 0 || i >= cells.length) return;
    cur = i;
    tiles.forEach(function (a, k) {
      if (k === i) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
      cells[k].classList.toggle('is-on', k === i);
    });
    document.documentElement.style.setProperty('--cur', String(i));
    mark.textContent = roman[i];
  }

  function read() {
    var line = window.innerHeight * 0.46;
    var best = cur < 0 ? 0 : cur;
    var bestD = Infinity;
    for (var k = 0; k < secs.length; k++) {
      var s = secs[k];
      if (!s) continue;
      var r = s.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) continue;
      var d = Math.abs(r.top - line);
      if (d < bestD) { bestD = d; best = k; }
    }
    raise(best);
  }

  var pending = false;
  function onScroll() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(function () { pending = false; read(); });
  }

  tiles.forEach(function (a, k) {
    a.addEventListener('click', function () { raise(k); });
  });

  function press(flat) {
    field.setAttribute('data-laid', flat ? 'flat' : 'lifted');
    trowel.setAttribute('aria-expanded', flat ? 'false' : 'true');
    trowel.querySelector('.trowel__text').textContent = flat ? 'Lift the tile' : 'Lay the field';
  }

  trowel.addEventListener('click', function () {
    press(trowel.getAttribute('aria-expanded') !== 'true');
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (trowel.getAttribute('aria-expanded') === 'true') {
      press(true);
      trowel.focus();
    }
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  var start = tiles.map(function (a) { return a.getAttribute('href'); }).indexOf('#' + (location.hash || '').slice(1));
  if (start >= 0) raise(start); else { raise(0); read(); }
})();
