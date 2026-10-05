(function () {
  var panel = document.getElementById('panel');
  var scopes = Array.prototype.slice.call(document.querySelectorAll('.scope'));
  var arm = document.getElementById('arm');
  var armLbl = document.getElementById('armLbl');
  var armTicks = arm.querySelectorAll('.arm__ticks i');
  var grVal = document.getElementById('grVal');
  var outVal = document.getElementById('outVal');
  var clipLed = document.getElementById('clip');
  var recLed = document.getElementById('recLed');
  var recTc = document.getElementById('recTc');
  var recLbl = document.getElementById('recLbl');
  var faderDb = document.getElementById('faderDb');
  var glue = document.getElementById('glue');
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function seed(n) {
    var s = (n * 9301 + 49297) % 233280;
    return s / 233280;
  }

  function bars(scope) {
    var n = parseInt(scope.dataset.bar, 10);
    var sd = parseInt(scope.dataset.seed, 10) || 1;
    var frag = document.createDocumentFragment();
    for (var i = 0; i < n; i++) {
      var b = document.createElement('i');
      var r = seed(sd * 131 + i * 17);
      var env = 0.4 + 0.6 * Math.sin(Math.PI * (i + 0.6) / n);
      b.style.setProperty('--a', (0.24 + 0.76 * r * env).toFixed(3));
      b.style.setProperty('--f', (0.6 + r * 1.5).toFixed(2));
      b.style.setProperty('--p', (r * 6.283).toFixed(2));
      frag.appendChild(b);
    }
    scope.appendChild(frag);
  }

  function segs(box, n) {
    var frag = document.createDocumentFragment();
    for (var i = 0; i < n; i++) frag.appendChild(document.createElement('i'));
    box.appendChild(frag);
    return box.children;
  }

  scopes.forEach(bars);
  var ladder = segs(document.querySelector('.ladder'), 18);
  var meterBoxes = document.querySelectorAll('.meter');
  var meters = Array.prototype.map.call(meterBoxes, function (m) {
    return segs(m, parseInt(m.dataset.seg, 10));
  });
  var mainSegs = meters[meters.length - 1];

  var params = { drive: 0.55, thresh: 0.42, rate: 0.55, glue: true };
  var pressing = false;
  var amp = 1, gain = 0.3, gr = 0, level = 0;
  var recStart = 0, recTime = 0;
  var lastMeter = -1, lastLad = -1, lastDb = '', lastOut = '', lastGr = -1, lastTc = '';
  var nodes = Array.prototype.slice.call(document.querySelectorAll('.knob[data-mod]'));
  var sliders = Array.prototype.slice.call(document.querySelectorAll('.slide[data-mod]'));

  function fmt(el, spec) {
    var mn = Number.parseFloat(spec.dataset.min);
    var mx = Number.parseFloat(spec.dataset.max);
    var u = spec.dataset.unit || '';
    var v = mn + (mx - mn) * params[spec.dataset.mod];
    var s = v.toFixed(1) + u;
    if (el.textContent !== s) el.textContent = s;
  }

  function dragify(el, onVal) {
    var start = 0, base = 0, id = null;
    el.addEventListener('pointerdown', function (e) {
      if (id !== null) return;
      id = e.pointerId;
      try { el.setPointerCapture(id); } catch {}
      start = e.clientY;
      base = Number.parseFloat(el.dataset.val);
      e.preventDefault();
    });
    el.addEventListener('pointermove', function (e) {
      if (e.pointerId !== id) return;
      var v = base + (start - e.clientY) / 140;
      v = Math.max(0, Math.min(1, v));
      el.dataset.val = v.toFixed(3);
      onVal(v);
    });
    function up(e) {
      if (e.pointerId !== id) return;
      try { el.releasePointerCapture(id); } catch {}
      id = null;
    }
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
  }

  nodes.forEach(function (k) {
    var key = k.dataset.mod;
    k.dataset.val = params[key].toFixed(3);
    fmt(k.querySelector('.knob__val'), k);
    dragify(k, function (v) {
      params[key] = v;
      fmt(k.querySelector('.knob__val'), k);
    });
  });

  sliders.forEach(function (s) {
    var key = s.dataset.mod;
    s.dataset.val = params[key].toFixed(3);
    fmt(s.querySelector('.slide__val'), s);
    dragify(s, function (v) {
      params[key] = v;
      fmt(s.querySelector('.slide__val'), s);
    });
  });

  Array.prototype.slice.call(document.querySelectorAll('.knob--sm')).forEach(function (k) {
    k.dataset.val = Number.parseFloat(k.dataset.val).toFixed(3);
  });

  glue.addEventListener('click', function () {
    params.glue = !params.glue;
    glue.setAttribute('aria-checked', params.glue ? 'true' : 'false');
  });

  function down(on) {
    if (pressing === on) return;
    pressing = on;
    arm.classList.toggle('down', on);
    arm.setAttribute('aria-pressed', on ? 'true' : 'false');
    if (on) {
      recStart = performance.now();
      recLbl.classList.add('on');
      recLbl.textContent = 'rec';
      recLed.classList.add('on');
      armLbl.textContent = 'rec';
    } else {
      recLbl.classList.remove('on');
      recLbl.textContent = 'standby';
      recLed.classList.remove('on');
      armLbl.textContent = 'arm';
    }
  }

  arm.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    try { arm.setPointerCapture(e.pointerId); } catch {}
    down(true);
  });
  arm.addEventListener('pointerup', function () { down(false); });
  arm.addEventListener('pointercancel', function () { down(false); });
  arm.addEventListener('lostpointercapture', function () { down(false); });
  arm.addEventListener('keydown', function (e) {
    if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) down(true);
  });
  arm.addEventListener('keyup', function (e) {
    if (e.key === ' ' || e.key === 'Enter') down(false);
  });
  arm.addEventListener('blur', function () { down(false); });

  function pad(v, w) {
    var s = String(v);
    while (s.length < w) s = '0' + s;
    return s;
  }

  function light(list, n) {
    for (var i = 0; i < list.length; i++) {
      var on = i < n;
      var c = '';
      if (on) {
        if (i >= list.length - 1) c = 'on clip';
        else if (i >= list.length - 4) c = 'on hot';
        else c = 'on';
      }
      if (list[i].className !== c) list[i].className = c;
    }
  }

  function loop2() {
    if (calm) return;
    down(true);
    window.setTimeout(function () { down(false); }, 2300);
    window.setTimeout(function () { down(true); }, 6100);
    window.setTimeout(function () { down(false); }, 8400);
    window.setTimeout(loop2, 12100);
  }

  function step() {
    var now = performance.now();
    var wt = (now % 6400) / 6400;
    for (var i = 0; i < scopes.length; i++) {
      scopes[i].style.setProperty('--wt', (wt + i * 1.37).toFixed(4));
    }

    var ride = 0.12 + params.rate * 0.88;
    var aT = pressing ? 1 - 0.2 - params.drive * 0.34 : 1;
    // El pegamento se separa para que cada linea se quede con un solo ternario.
    var glueG = params.glue ? 0.08 : 0;
    var glueR = params.glue ? 0.18 : 0;
    var gT = pressing ? 0.3 + 0.34 + params.drive * 0.2 + glueG : 0.3;
    var rT = pressing ? params.drive * 0.72 + glueR : 0;
    var k = 0.05 * ride + 0.014;

    amp += (aT - amp) * k;
    gain += (gT - gain) * k;
    gr += (rT - gr) * k;

    panel.style.setProperty('--amp', amp.toFixed(3));
    panel.style.setProperty('--gain', gain.toFixed(3));
    panel.style.setProperty('--gr', gr.toFixed(3));

    var wob = 0.055 * Math.sin(now / 420) + 0.035 * Math.sin(now / 137);
    level = 0.34 + wob * 0.5 + (pressing ? 0.3 + params.drive * 0.16 : 0) + amp * 0.05;
    if (level < 0.06) level = 0.06;
    if (level > 1) level = 1;

    var m = Math.round(level * mainSegs.length);
    if (m !== lastMeter) {
      lastMeter = m;
      light(mainSegs, m);
      for (var t = 0; t < armTicks.length; t++) {
        armTicks[t].className = t < Math.round(gr * 7) ? 'on' : '';
      }
    }

    for (var a = 0; a < meters.length - 1; a++) {
      var lv = 0.26 + 0.16 * Math.sin(now / (520 + a * 190)) + 0.1 * Math.sin(now / (211 + a * 97));
      if (lv < 0.08) lv = 0.08;
      if (lv > 0.92) lv = 0.92;
      var n2 = Math.round(lv * meters[a].length);
      if (meters[a][0].dataset.v !== String(n2)) {
        meters[a][0].dataset.v = String(n2);
        light(meters[a], n2);
      }
    }

    var out = Math.min(1, level * 0.96);
    var l = Math.round(out * ladder.length);
    if (l !== lastLad) {
      lastLad = l;
      light(ladder, l);
      clipLed.classList.toggle('on', l >= ladder.length - 1);
    }

    var gv = (gr * 9.4).toFixed(1);
    if (gv !== lastGr) {
      lastGr = gv;
      grVal.textContent = gv;
    }
    var ov = (-60 + out * 64).toFixed(1);
    if (ov !== lastOut) {
      lastOut = ov;
      outVal.textContent = ov;
    }
    var db = ((gain - 1) * 60).toFixed(1);
    if (db !== lastDb) {
      lastDb = db;
      faderDb.textContent = db;
    }

    if (pressing) recTime = now - recStart;
    var f = Math.floor(recTime / 40) % 25;
    var s = Math.floor(recTime / 1000) % 60;
    var mm = Math.floor(recTime / 60000);
    var tc = '00:' + pad(mm, 2) + ':' + pad(s, 2) + ':' + pad(f, 2);
    if (tc !== lastTc) {
      lastTc = tc;
      recTc.textContent = tc;
    }
  }

  if (calm) {
    panel.style.setProperty('--amp', '0.62');
    panel.style.setProperty('--gain', '0.62');
    panel.style.setProperty('--gr', '0.4');
    light(mainSegs, 8);
    light(ladder, 11);
    for (var tick of armTicks) tick.className = 'on';
  } else {
    step();
    (function loop() {
      setTimeout(function () {
        step();
        loop();
      }, 16);
    })();
    window.setTimeout(loop2, 1500);
  }
})();
