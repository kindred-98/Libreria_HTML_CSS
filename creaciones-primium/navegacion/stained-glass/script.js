(function () {
  var lamp = document.getElementById('lamp');
  var mark = document.getElementById('mark');
  var bays = Array.prototype.slice.call(document.querySelectorAll('.lights__bay'));
  var panes = bays.map(function (b) { return b.querySelector('a'); });
  var roman = ['I', 'II', 'III', 'IV', 'V', 'VI'];
  var secs = panes.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  var lit = -1;

  function burn(i) {
    if (i < 0 || i >= bays.length) return;
    lit = i;
    panes.forEach(function (a, k) {
      if (k === i) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
      bays[k].classList.toggle('is-on', k === i);
    });
    document.documentElement.style.setProperty('--cur', String(i));
    mark.textContent = roman[i];
  }

  function read() {
    var line = window.innerHeight * 0.45;
    var best = Math.max(lit, 0);
    var bestD = Infinity;
    for (var k = 0; k < secs.length; k++) {
      var s = secs[k];
      if (!s) continue;
      var r = s.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) continue;
      var d = Math.abs(r.top - line);
      if (d < bestD) { bestD = d; best = k; }
    }
    burn(best);
  }

  var pending = false;
  function onScroll() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(function () { pending = false; read(); });
  }

  panes.forEach(function (a, k) {
    a.addEventListener('click', function () { burn(k); });
  });

  function light(on) {
    document.documentElement.dataset.lit = on ? 'on' : 'off';
    lamp.setAttribute('aria-expanded', on ? 'true' : 'false');
    lamp.querySelector('.lamp__text').textContent = on ? 'Put out the lamp' : 'Light the window';
  }

  lamp.addEventListener('click', function () {
    light(lamp.getAttribute('aria-expanded') !== 'true');
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (lamp.getAttribute('aria-expanded') === 'true') {
      light(false);
      lamp.focus();
    }
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  var start = panes.map(function (a) { return a.getAttribute('href'); }).indexOf('#' + (location.hash || '').slice(1));
  if (start >= 0) burn(start); else { burn(0); read(); }
})();
