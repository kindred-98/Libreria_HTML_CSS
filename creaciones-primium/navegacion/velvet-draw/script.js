(function () {
  var rail = document.getElementById('rail');
  var cord = document.getElementById('cord');
  var pos = document.getElementById('pos');
  var links = [].slice.call(document.querySelectorAll('.fold'));
  var roman = ['I', 'II', 'III', 'IV', 'V', 'VI'];
  var secs = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  var cur = -1;

  function mark(i) {
    if (i === cur || i < 0 || i >= links.length) return;
    cur = i;
    links.forEach(function (a, k) {
      if (k === i) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
    document.documentElement.style.setProperty('--cur', String(i));
    pos.textContent = roman[i];
  }

  function nearest() {
    var line = window.innerHeight * 0.42;
    var best = 0;
    var bestD = Infinity;
    secs.forEach(function (s, k) {
      if (!s) return;
      var r = s.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight * 2) return;
      var d = Math.abs(r.top - line);
      if (d < bestD) { bestD = d; best = k; }
    });
    return best;
  }

  var ticking = false;
  function spy() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      mark(nearest());
    });
  }

  function setState(open) {
    rail.setAttribute('data-state', open ? 'open' : 'closed');
    cord.setAttribute('aria-expanded', open ? 'true' : 'false');
    cord.querySelector('.cord__text').textContent = open ? 'Gather the curtain' : 'Draw the curtain';
  }

  links.forEach(function (a, k) {
    a.addEventListener('click', function () { mark(k); });
  });
  cord.addEventListener('click', function () {
    setState(cord.getAttribute('aria-expanded') !== 'true');
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (cord.getAttribute('aria-expanded') === 'true') {
      setState(false);
      cord.focus();
    }
  });
  window.addEventListener('scroll', spy, { passive: true });
  window.addEventListener('resize', spy, { passive: true });

  var start = links.map(function (a) { return a.getAttribute('href'); }).indexOf('#' + (location.hash || '').slice(1));
  if (start >= 0) mark(start);
  else { mark(0); mark(nearest()); }
})();
