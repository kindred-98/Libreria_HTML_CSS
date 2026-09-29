(function () {
  var console_ = document.querySelector('.console');
  var lock = document.getElementById('lock');
  var tally = document.getElementById('tally');
  var ringNo = document.getElementById('ringNo');

  var rings = [
    { el: document.getElementById('orbitA'), rot: null },
    { el: document.getElementById('orbitB'), rot: null }
  ];
  var list = document.querySelectorAll('.station');
  var stations = [].slice.call(list);
  var ringOf = stations.map(function (s) { return s.parentNode.id === 'orbitA' ? 0 : 1; });
  var base = stations.map(function (s) { return parseFloat(s.getAttribute('data-a')) || 0; });
  var secs = stations.map(function (s) {
    return document.getElementById(s.getAttribute('href').slice(1));
  });
  var cur = -1;
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function align(i) {
    var r = ringOf[i];
    var target = -base[i];
    if (still) {
      rings[r].el.style.setProperty('--rot', target + 'deg');
      rings[r].rot = target;
      return;
    }
    var from = rings[r].rot === null ? target : rings[r].rot;
    rings[r].el.style.setProperty('--rot', target + 'deg');
    rings[r].rot = target;
    glide(r, from, target);
  }

  function glide(r, from, to) {
    var t0 = 0;
    function step(now) {
      if (!t0) t0 = now;
      var u = Math.min(1, (now - t0) / 900);
      var e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
      var v = from + (to - from) * e;
      rings[r].el.style.setProperty('--rot', v + 'deg');
      if (u < 1) requestAnimationFrame(step);
      else { rings[r].rot = to; }
    }
    requestAnimationFrame(step);
  }

  function lockOn() {
    var s = stations[cur];
    var c = console_.getBoundingClientRect();
    var q = s.getBoundingClientRect();
    var x = q.left + q.width / 2 - (c.left + c.width / 2);
    var y = q.top + q.height / 2 - (c.top + c.height / 2);
    lock.style.setProperty('--lx', x.toFixed(1) + 'px');
    lock.style.setProperty('--ly', y.toFixed(1) + 'px');
    lock.classList.add('is-on');
  }

  function paint(i) {
    if (i < 0 || i >= stations.length) return;
    cur = i;
    stations.forEach(function (s, k) {
      if (k === i) s.setAttribute('aria-current', 'true');
      else s.removeAttribute('aria-current');
      s.classList.toggle('is-now', k === i);
      s.classList.toggle('is-past', k < i);
    });
    tally.textContent = (i + 1 < 10 ? '0' : '') + (i + 1);
    ringNo.textContent = ringOf[i] === 0 ? '1' : '2';
    console_.style.setProperty('--sw', (i / stations.length).toFixed(4) + 'turn');
    console_.style.setProperty('--swo', (-90 + i * (360 / stations.length)) + 'deg');
    align(i);
    setTimeout(lockOn, 60);
  }

  function read() {
    var line = window.innerHeight * 0.42;
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

  var queued = false;
  function onScroll() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () { queued = false; read(); });
  }

  stations.forEach(function (s, k) {
    s.addEventListener('click', function () { paint(k); });
    s.addEventListener('focus', function () { if (k !== cur) paint(k); });
  });

  document.addEventListener('keydown', function (e) {
    var key = e.key;
    if (key !== 'ArrowRight' && key !== 'ArrowLeft' && key !== 'ArrowDown' &&
        key !== 'ArrowUp' && key !== 'Home' && key !== 'End') return;
    var from = stations.indexOf(document.activeElement);
    if (from < 0) return;
    var to = from;
    if (key === 'ArrowRight' || key === 'ArrowDown') to = from + 1;
    else if (key === 'ArrowLeft' || key === 'ArrowUp') to = from - 1;
    else if (key === 'Home') to = 0;
    else to = stations.length - 1;
    if (to < 0) to = 0;
    if (to > stations.length - 1) to = stations.length - 1;
    if (to !== from) { e.preventDefault(); stations[to].focus(); }
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  var start = stations.map(function (s) { return '#' + s.getAttribute('href').slice(1); })
    .indexOf(location.hash);
  if (start >= 0) paint(start); else paint(0);
  read();
  window.addEventListener('load', lockOn);
})();
