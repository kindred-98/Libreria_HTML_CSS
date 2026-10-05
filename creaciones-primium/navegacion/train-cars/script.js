(function () {
  var yard = document.getElementById('yard');
  var track = document.getElementById('track');
  var consist = document.getElementById('consist');
  var coupler = document.getElementById('coupler');
  var lamp = document.getElementById('lamp');
  var tally = document.getElementById('tally');
  var dist = document.getElementById('dist');
  var consignBtn = document.getElementById('consignBtn');
  var note = document.getElementById('consignNote');

  var list = document.querySelectorAll('.consist .car');
  var cars = Array.prototype.slice.call(list);
  var secs = cars.map(function (c) {
    return document.getElementById(c.getAttribute('href').slice(1));
  });
  var last = cars.length - 1;
  var cur = 0;
  var jerkPx = 0;

  function metrics() {
    var cs = getComputedStyle(document.documentElement);
    return {
      cw: Number.parseFloat(cs.getPropertyValue('--cw')) || 132,
      van: Number.parseFloat(cs.getPropertyValue('--van')) || 58
    };
  }

  function centreOf(i) {
    var m = metrics();
    var gap = Math.round(m.cw * 0.22);
    return m.van + i * (m.cw + gap) + m.cw / 2;
  }

  function place() {
    var m = metrics();
    var gap = Math.round(m.cw * 0.22);
    var mid = track.clientWidth / 2;
    var x = Number.parseFloat(consist.style.getPropertyValue('--x'));
    if (isNaN(x)) x = mid - centreOf(cur);
    consist.style.setProperty('--x', x.toFixed(1) + 'px');
    coupler.style.setProperty('--cx',
      (centreOf(cur) + (m.cw + gap) / 2 + x - mid).toFixed(1) + 'px');
    cars[cur].style.setProperty('--j', jerkPx.toFixed(1) + 'px');
  }

  function haul() {
    var m = metrics();
    var gap = Math.round(m.cw * 0.22);
    var mid = track.clientWidth / 2;
    var from = Number.parseFloat(consist.style.getPropertyValue('--x'));
    if (isNaN(from)) from = 0;
    var to = mid - centreOf(cur);
    var t0 = 0;
    yard.classList.add('is-slack');
    function step(now) {
      if (!t0) t0 = now;
      var u = Math.min(1, (now - t0) / 940);
      var e = 1 - Math.pow(1 - u, 3.2);
      var x = from + (to - from) * e;
      consist.style.setProperty('--x', x.toFixed(1) + 'px');
      coupler.style.setProperty('--cx',
        (centreOf(cur) + (m.cw + gap) / 2 + x - mid).toFixed(1) + 'px');
      cars[cur].style.setProperty('--j', (Math.exp(-3.1 * u) * Math.sin(u * Math.PI * 3.4) * 30).toFixed(1) + 'px');
      coupler.style.setProperty('--cs',
        (1 + Math.abs(Math.sin(u * Math.PI * 3)) * 0.3).toFixed(3));
      lamp.style.setProperty('--lit', (0.92 + Math.sin(u * Math.PI) * 0.2).toFixed(3));
      if (u < 1) requestAnimationFrame(step);
      else {
        jerkPx = 0;
        yard.classList.remove('is-slack');
        coupler.style.setProperty('--cs', '1');
        lamp.style.setProperty('--lit', '1');
        place();
      }
    }
    requestAnimationFrame(step);
  }

  function paint(i) {
    if (i < 0 || i > last) return;
    cur = i;
    cars.forEach(function (c, k) {
      if (k === i) c.setAttribute('aria-current', 'true');
      else c.removeAttribute('aria-current');
      c.classList.toggle('is-now', k === i);
      c.classList.toggle('is-past', k < i);
    });
    tally.textContent = (i + 1 < 10 ? '0' : '') + (i + 1);
    dist.textContent = (i * 42) + ' m';
    haul();
  }

  function read() {
    var line = window.innerHeight * 0.42;
    var best = Math.max(cur, 0);
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

  cars.forEach(function (c, k) {
    c.addEventListener('click', function () { paint(k); });
    c.addEventListener('focus', function () { if (k !== cur) paint(k); });
  });

  function setNote(open) {
    note.classList.toggle('is-open', open);
    consignBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    consignBtn.querySelector('.key__text').textContent = open ? 'Hide note' : 'Consign note';
  }

  consignBtn.addEventListener('click', function () {
    setNote(consignBtn.getAttribute('aria-expanded') !== 'true');
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && consignBtn.getAttribute('aria-expanded') === 'true') {
      setNote(false);
      consignBtn.focus();
      return;
    }
    var key = e.key;
    if (key !== 'ArrowRight' && key !== 'ArrowLeft' && key !== 'Home' && key !== 'End') return;
    var from = cars.indexOf(document.activeElement);
    if (from < 0) return;
    var to;
    if (key === 'ArrowRight') to = from + 1;
    else if (key === 'ArrowLeft') to = from - 1;
    else if (key === 'Home') to = 0;
    else to = last;
    if (to < 0) to = 0;
    if (to > last) to = last;
    if (to !== from) { e.preventDefault(); cars[to].focus(); }
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { place(); onScroll(); }, { passive: true });

  var start = cars.map(function (c) { return '#' + c.getAttribute('href').slice(1); })
    .indexOf(location.hash);
  paint(start >= 0 ? start : 0);
  place();
  read();
  window.addEventListener('load', place);
})();
