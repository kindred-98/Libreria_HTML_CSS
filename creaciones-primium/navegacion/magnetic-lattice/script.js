(function () {
  var well = document.getElementById('well');
  var magnet = document.getElementById('magnet');
  var reticle = document.getElementById('reticle');
  var meter = document.getElementById('meter');
  var fluxVal = document.getElementById('fluxVal');
  var tally = document.getElementById('tally');
  var fieldBtn = document.getElementById('fieldBtn');
  var note = document.getElementById('fieldNote');

  var list = document.querySelectorAll('.lattice .node');
  var nodes = [].slice.call(list);
  var secs = nodes.map(function (n) {
    return document.getElementById(n.getAttribute('href').slice(1));
  });

  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var RANGE = 210;
  var PULL = 26;
  var box = { x: 0, y: 0, w: 0, h: 0 };
  var ptr = { x: 0, y: 0, on: false };
  var flux = 0;
  var cur = -1;
  var retFrom = null;
  var retTo = null;
  var retPos = null;

  nodes.forEach(function (n) {
    n._cx = 0; n._cy = 0;
    n._ix = 0; n._iy = 0; n._p = 0;
  });

  function measure() {
    var r = well.getBoundingClientRect();
    box.x = r.left; box.y = r.top; box.w = r.width; box.h = r.height;
    nodes.forEach(function (n) {
      var q = n.getBoundingClientRect();
      n._cx = q.left + q.width / 2 - r.left;
      n._cy = q.top + q.height / 2 - r.top;
    });
    if (cur >= 0) aim(nodes[cur], true);
  }

  function aim(n, snap) {
    var k = reticle.clientWidth / 2;
    var x = n._cx - k;
    var y = n._cy - k;
    if (snap || !retPos) {
      retPos = { x: x, y: y };
      retFrom = { x: x, y: y };
      retTo = { x: x, y: y };
      paintRet();
      return;
    }
    retFrom = { x: retPos.x, y: retPos.y };
    retTo = { x: x, y: y };
  }

  function paintRet() {
    reticle.style.transform = 'translate3d(' + retPos.x.toFixed(2) + 'px,' + retPos.y.toFixed(2) + 'px,0)';
  }

  function glide(now) {
    if (!retFrom || !retTo) return;
    var t0 = glide.t0;
    if (!t0) { glide.t0 = now; }
    var u = Math.min(1, (now - glide.t0) / 700);
    var e = 1 - Math.pow(1 - u, 3);
    retPos.x = retFrom.x + (retTo.x - retFrom.x) * e;
    retPos.y = retFrom.y + (retTo.y - retFrom.y) * e;
    paintRet();
    if (u < 1) requestAnimationFrame(glide);
    else { glide.t0 = 0; }
  }

  function paint(i) {
    if (i < 0 || i >= nodes.length) return;
    cur = i;
    nodes.forEach(function (n, k) {
      if (k === i) n.setAttribute('aria-current', 'true');
      else n.removeAttribute('aria-current');
      n.classList.toggle('is-now', k === i);
      n.classList.toggle('is-past', k < i);
    });
    tally.textContent = (i + 1 < 10 ? '0' : '') + (i + 1);
    if (still) { retPos = null; aim(nodes[i], true); }
    else { aim(nodes[i], false); glide.t0 = 0; requestAnimationFrame(glide); }
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

  function field() {
    var t = still ? 1 : 0.16;
    var strongest = 0;
    for (var k = 0; k < nodes.length; k++) {
      var n = nodes[k];
      var tx = 0, ty = 0, tp = 0;
      if (ptr.on) {
        var dx = ptr.x - n._cx, dy = ptr.y - n._cy;
        var d = Math.sqrt(dx * dx + dy * dy) || 1;
        if (d < RANGE) {
          var s = 1 - d / RANGE;
          s = s * s;
          tp = s;
          tx = (dx / d) * s * PULL;
          ty = (dy / d) * s * PULL;
          if (s > strongest) strongest = s;
        }
      }
      n._ix += (tx - n._ix) * t;
      n._iy += (ty - n._iy) * t;
      n._p += (tp - n._p) * t;
      if (Math.abs(n._ix) > 0.04 || Math.abs(n._iy) > 0.04 || Math.abs(n._p) > 0.004) {
        n.style.setProperty('--ix', n._ix.toFixed(2) + 'px');
        n.style.setProperty('--iy', n._iy.toFixed(2) + 'px');
        n.style.setProperty('--p', n._p.toFixed(3));
      }
    }
    flux += (strongest - flux) * t;
    if (Math.abs(strongest - flux) > 0.002 || flux > 0.002) {
      meter.style.setProperty('--f', flux.toFixed(3));
      fluxVal.textContent = (Math.round(flux * 100) < 10 ? '00' : '') + Math.round(flux * 100);
    }
    requestAnimationFrame(field);
  }

  function track(e) {
    var r = well.getBoundingClientRect();
    ptr.x = e.clientX - r.left;
    ptr.y = e.clientY - r.top;
    if (!ptr.on) {
      ptr.on = true;
      magnet.classList.add('is-on');
    }
    magnet.style.transform = 'translate3d(' + ptr.x.toFixed(1) + 'px,' + ptr.y.toFixed(1) + 'px,0) scale(1)';
  }

  well.addEventListener('pointermove', track, { passive: true });
  well.addEventListener('pointerenter', track, { passive: true });
  well.addEventListener('pointerleave', function () {
    ptr.on = false;
    magnet.classList.remove('is-on');
  });

  nodes.forEach(function (n, k) {
    n.addEventListener('click', function () { paint(k); });
    n.addEventListener('focus', function () { if (k !== cur) paint(k); });
  });

  function setNote(open) {
    note.classList.toggle('is-open', open);
    fieldBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    fieldBtn.querySelector('.key__text').textContent = open ? 'Hide note' : 'Field note';
  }

  fieldBtn.addEventListener('click', function () {
    setNote(fieldBtn.getAttribute('aria-expanded') !== 'true');
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && fieldBtn.getAttribute('aria-expanded') === 'true') {
      setNote(false);
      fieldBtn.focus();
      return;
    }
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' &&
        e.key !== 'ArrowDown' && e.key !== 'ArrowUp' &&
        e.key !== 'Home' && e.key !== 'End') return;
    var from = nodes.indexOf(document.activeElement);
    if (from < 0) return;
    var cols = window.innerWidth <= 560 ? 2 : (window.innerWidth <= 820 ? 3 : 6);
    var to = from;
    if (e.key === 'ArrowRight') to = from + 1;
    else if (e.key === 'ArrowLeft') to = from - 1;
    else if (e.key === 'ArrowDown') to = from + cols;
    else if (e.key === 'ArrowUp') to = from - cols;
    else if (e.key === 'Home') to = 0;
    else to = nodes.length - 1;
    if (to < 0) to = 0;
    if (to > nodes.length - 1) to = nodes.length - 1;
    if (to !== from) { e.preventDefault(); nodes[to].focus(); }
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { measure(); onScroll(); }, { passive: true });

  measure();
  var start = nodes.map(function (n) { return '#' + n.getAttribute('href').slice(1); })
    .indexOf(location.hash);
  if (start >= 0) paint(start); else paint(0);
  read();
  if (!still) requestAnimationFrame(field);
})();
