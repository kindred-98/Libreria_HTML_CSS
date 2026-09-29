(function () {
  var sash = document.getElementById('sashwin');
  var latch = document.getElementById('latch');
  var mark = document.getElementById('mark');
  var lights = [].slice.call(document.querySelectorAll('.lights__light'));
  var panes = lights.map(function (l) { return l.querySelector('a'); });
  var roman = ['I', 'II', 'III', 'IV', 'V', 'VI'];
  var secs = panes.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  var cur = -1;

  function slide(i) {
    if (i < 0 || i >= lights.length) return;
    cur = i;
    panes.forEach(function (a, k) {
      if (k === i) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
      lights[k].classList.toggle('is-on', k === i);
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
    slide(best);
  }

  var pending = false;
  function onScroll() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(function () { pending = false; read(); });
  }

  panes.forEach(function (a, k) {
    a.addEventListener('click', function () { slide(k); });
  });

  function shut(closed) {
    sash.setAttribute('data-state', closed ? 'shut' : 'open');
    latch.setAttribute('aria-expanded', closed ? 'false' : 'true');
    latch.querySelector('.latch__text').textContent = closed ? 'Open the sash' : 'Slide all shut';
  }

  latch.addEventListener('click', function () {
    shut(latch.getAttribute('aria-expanded') !== 'true');
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (latch.getAttribute('aria-expanded') === 'true') {
      shut(true);
      latch.focus();
    }
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  var start = panes.map(function (a) { return a.getAttribute('href'); }).indexOf('#' + (location.hash || '').slice(1));
  if (start >= 0) slide(start); else { slide(0); read(); }
})();
