(function () {
  var field = document.getElementById('field');
  var well = document.getElementById('well');
  var crs = document.getElementById('crs');
  var num = document.getElementById('num');
  var tAlt = document.getElementById('tAlt');
  var tVel = document.getElementById('tVel');
  var tFld = document.getElementById('tFld');
  var tCap = document.getElementById('tCap');
  var phase = document.getElementById('phase');
  var core = document.getElementById('core');
  var sparks = field.querySelectorAll('.trail i');
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var DUR = 6400;
  var t0 = performance.now() - DUR * 0.62;
  var cx = 0, cy = 0, R = 0, Rmax = 0;
  var captures = 0;
  var lastPhase = '';
  var wasCaptured = false;
  var press = 0;
  var A0 = -2.42;

  function measure() {
    var r = well.getBoundingClientRect();
    var f = field.getBoundingClientRect();
    cx = r.left - f.left + r.width / 2;
    cy = r.top - f.top + r.height / 2;
    R = r.width * 0.62;
    Rmax = Math.max(30, Math.min(f.width, f.height) * 0.44);
  }

  function at(p) {
    var r, th, e, u;
    if (p < 0.2) {
      u = p / 0.2;
      e = 1 - Math.pow(1 - u, 3);
      r = Rmax + (R - Rmax) * e;
      th = A0 - 0.55 * (1 - e);
      return { r: r, th: th, st: 0, e: 0 };
    }
    if (p < 0.64) {
      u = (p - 0.2) / 0.44;
      r = R * (1 - 0.68 * Math.pow(u, 1.6));
      th = A0 + 2.5 * Math.PI * u;
      return { r: r, th: th, st: 0, e: 0 };
    }
    if (p < 0.72) {
      u = (p - 0.64) / 0.08;
      e = u * u;
      r = R * 0.32 * (1 - e * 0.86);
      th = A0 + 2.5 * Math.PI + 0.9 * u;
      return { r: r, th: th, st: 1, e: e };
    }
    u = (p - 0.72) / 0.28;
    e = Math.pow(u, 2.1);
    r = R * 0.0456 + (Rmax * 1.04 - R * 0.0456) * e;
    th = A0 + 2.5 * Math.PI + 0.9 + 1.05 * u;
    return { r: r, th: th, st: 2, e: e };
  }

  function px(p) {
    var s = at(p);
    return [cx + Math.cos(s.th) * s.r, cy + Math.sin(s.th) * s.r, s];
  }

  function strength() {
    return 0.4 + Math.min(captures, 5) * 0.05;
  }

  function ring() {
    captures++;
    var g = strength();
    num.textContent = g.toFixed(2);
    tCap.textContent = ('00' + captures).slice(-3);
    tFld.textContent = g.toFixed(2);
    var fl = well.querySelector('.well__flash');
    fl.classList.remove('go');
    well.getBoundingClientRect();
    fl.classList.add('go');
    measure();
  }

  function step() {
    var now = performance.now();
    var p = ((now - t0) % DUR) / DUR;
    var cur = px(p);
    var prev = px(p - 0.004 < 0 ? p - 0.004 + 1 : p - 0.004);
    var dx = cur[0] - prev[0];
    var dy = cur[1] - prev[1];
    var ang = Math.atan2(dy, dx) * 57.2958 + 90;
    var s = cur[2];
    var near = Math.max(0, 1 - s.r / (R * 1.15));
    near = near * near;
    var a = 1, sx = 1, sy = 1, sc = 1;

    if (s.st === 1) {
      sx = 1 + 2.1 * s.e;
      sy = 1 - 0.3 * s.e;
      press = s.e;
    } else if (s.st === 2) {
      press = Math.max(0, press * 0.9);
      sc = 1 + 0.5 * s.e;
      a = 1 - Math.max(0, (p - 0.87) / 0.13);
    } else {
      press = Math.max(0, press * 0.88);
    }

    crs.style.setProperty('--x', cur[0].toFixed(1));
    crs.style.setProperty('--y', cur[1].toFixed(1));
    crs.style.setProperty('--rot', ang.toFixed(1));
    crs.style.setProperty('--sx', sx.toFixed(3));
    crs.style.setProperty('--sy', sy.toFixed(3));
    crs.style.setProperty('--sc', sc.toFixed(3));
    crs.style.setProperty('--a', (Math.max(a, 0)).toFixed(3));
    crs.style.setProperty('--near', near.toFixed(3));
    field.style.setProperty('--near', near.toFixed(3));
    field.style.setProperty('--press', press.toFixed(3));
    field.style.setProperty('--depth', (1 - s.r / Rmax).toFixed(3));

    for (var i = 0; i < sparks.length; i++) {
      var q = p - (i + 1) * 0.013;
      if (q < 0) q += 1;
      var t = px(q);
      sparks[i].style.setProperty('--x', t[0].toFixed(1));
      sparks[i].style.setProperty('--y', t[1].toFixed(1));
    }

    tAlt.textContent = (s.r / Rmax).toFixed(3);
    tVel.textContent = (Math.hypot(dx, dy) * 2.2).toFixed(2);

    var ph;
    if (s.st === 0) ph = p < 0.2 ? 'ingress' : 'spiral';
    else if (s.st === 1) ph = 'capture';
    else ph = 'ejection';
    if (ph !== lastPhase) {
      lastPhase = ph;
      phase.textContent = ph;
    }

    var cap = p > 0.665 && p < 0.735;
    if (cap && !wasCaptured) ring();
    wasCaptured = cap;
  }

  core.addEventListener('click', function () {
    ring();
    press = 1;
  });

  window.addEventListener('resize', function () {
    measure();
    if (calm) step();
  });

  if (calm) {
    measure();
    var s = at(0.42);
    crs.style.setProperty('--x', (cx + Math.cos(s.th) * s.r).toFixed(1));
    crs.style.setProperty('--y', (cy + Math.sin(s.th) * s.r).toFixed(1));
    crs.style.setProperty('--rot', '-40');
    field.style.setProperty('--near', '0.55');
    for (var i = 0; i < sparks.length; i++) {
      var q = 0.42 - (i + 1) * 0.013;
      var t = at(q);
      sparks[i].style.setProperty('--x', (cx + Math.cos(t.th) * t.r).toFixed(1));
      sparks[i].style.setProperty('--y', (cy + Math.sin(t.th) * t.r).toFixed(1));
    }
    tAlt.textContent = (s.r / Rmax).toFixed(3);
    tVel.textContent = '0.00';
    phase.textContent = 'held';
  } else {
    measure();
    (function loop() {
      setTimeout(function () {
        step();
        loop();
      }, 16);
    })();
    step();
  }
})();
