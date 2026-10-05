(function () {
  var bay = document.getElementById('bay');
  var lever = document.getElementById('lever');
  var mark = document.getElementById('mark');
  var blades = Array.prototype.slice.call(document.querySelectorAll('.blade'));
  var rows = blades.map(function (a) { return a.parentNode; });
  var roman = ['I', 'II', 'III', 'IV', 'V', 'VI'];
  var secs = blades.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  var cur = -1;

  function select(i, focus) {
    if (i < 0 || i >= blades.length) return;
    cur = i;
    blades.forEach(function (a, k) {
      if (k === i) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
      rows[k].classList.toggle('is-open', k === i);
    });
    document.documentElement.style.setProperty('--cur', String(i));
    mark.textContent = roman[i];
    if (focus) blades[i].focus();
  }

  function read() {
    var line = window.innerHeight * 0.44;
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
    select(best, false);
  }

  var pending = false;
  function onScroll() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(function () { pending = false; read(); });
  }

  blades.forEach(function (a, k) {
    a.addEventListener('click', function () { select(k, false); });
    a.addEventListener('focus', function () { select(k, false); });
  });

  function tilt(open) {
    bay.dataset.tilt = open ? 'open' : 'closed';
    lever.setAttribute('aria-expanded', open ? 'true' : 'false');
    lever.querySelector('.lever__text').textContent = open ? 'Close the blind' : 'Open the blind';
  }

  lever.addEventListener('click', function () {
    tilt(lever.getAttribute('aria-expanded') !== 'true');
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      if (document.activeElement && !blades.includes(document.activeElement)) return;
      e.preventDefault();
      select(Math.min(blades.length - 1, (Math.max(cur, 0)) + 1), true);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      if (document.activeElement && !blades.includes(document.activeElement)) return;
      e.preventDefault();
      select(Math.max(0, (Math.max(cur, 0)) - 1), true);
    } else if (e.key === 'Escape') {
      if (lever.getAttribute('aria-expanded') === 'true') {
        tilt(false);
        lever.focus();
      }
    }
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  var start = blades.map(function (a) { return a.getAttribute('href'); }).indexOf('#' + (location.hash || '').slice(1));
  if (start >= 0) select(start, false); else { select(0, false); read(); }
})();
