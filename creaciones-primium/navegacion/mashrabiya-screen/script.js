(function () {
  var bay = document.getElementById('bay');
  var shut = document.getElementById('shut');
  var mark = document.getElementById('mark');
  var rows = [].slice.call(document.querySelectorAll('.lattice__row'));
  var links = rows.map(function (r) { return r.querySelector('a'); });
  var roman = ['I', 'II', 'III', 'IV', 'V', 'VI'];
  var secs = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  var cur = -1;

  function open(i) {
    if (i < 0 || i >= rows.length) return;
    cur = i;
    links.forEach(function (a, k) {
      if (k === i) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
      rows[k].classList.toggle('is-open', k === i);
    });
    document.documentElement.style.setProperty('--cur', String(i));
    mark.textContent = roman[i];
  }

  function read() {
    var line = window.innerHeight * 0.45;
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
    open(best);
  }

  var pending = false;
  function onScroll() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(function () { pending = false; read(); });
  }

  links.forEach(function (a, k) {
    a.addEventListener('click', function () { open(k); });
  });

  function screen(openNow) {
    bay.setAttribute('data-shut', openNow ? 'open' : 'closed');
    shut.setAttribute('aria-expanded', openNow ? 'true' : 'false');
    shut.querySelector('.shut__text').textContent = openNow ? 'Close the screen' : 'Open the screen';
  }

  shut.addEventListener('click', function () {
    screen(shut.getAttribute('aria-expanded') !== 'true');
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (shut.getAttribute('aria-expanded') === 'true') {
      screen(false);
      shut.focus();
    }
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  var start = links.map(function (a) { return a.getAttribute('href'); }).indexOf('#' + (location.hash || '').slice(1));
  if (start >= 0) open(start); else { open(0); read(); }
})();
