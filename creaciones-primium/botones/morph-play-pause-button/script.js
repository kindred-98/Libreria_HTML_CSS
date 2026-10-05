(function () {
  var root = document.documentElement;
  var btn = document.getElementById('pbtn');
  var stateEl = document.getElementById('state');
  var tcEl = document.getElementById('tc');
  var lblEl = document.getElementById('lbl');
  var frames = Array.prototype.slice.call(document.querySelectorAll('.fr'));
  var fills = Array.prototype.slice.call(document.querySelectorAll('.fr__fill'));
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var CYCLE = 6400;
  var t0 = performance.now();
  var idx = -1;
  var lastState = '';
  var lastTc = '';

  function pad(n, w) {
    var s = String(n);
    while (s.length < w) s = '0' + s;
    return s;
  }

  function ease(p) {
    return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
  }

  function curve(p) {
    if (p < 0.4) return ease(p / 0.4);
    if (p < 0.6) return 1;
    if (p < 0.9) return 1 - ease((p - 0.6) / 0.3);
    return 0;
  }

  function step() {
    var now = performance.now();
    var p = ((now - t0) % CYCLE) / CYCLE;
    var v = curve(p);
    root.style.setProperty('--t', v.toFixed(4));
    for (var i = 0; i < fills.length; i++) {
      fills[i].style.transform = 'scaleX(' + Math.max(0, Math.min(1, v * 1.06 - i * 0.02)).toFixed(3) + ')';
    }
    var pos = v * 5;
    var id = Math.round(pos);
    if (id !== idx) {
      idx = id;
      for (var j = 0; j < frames.length; j++) frames[j].classList.toggle('on', j === id);
    }
    var name = v > 0.5 ? 'pause' : 'play';
    if (name !== lastState) {
      lastState = name;
      stateEl.textContent = name;
      lblEl.textContent = v > 0.5 ? 'paused' : 'playing';
      btn.setAttribute('aria-pressed', v > 0.5 ? 'true' : 'false');
      btn.setAttribute('aria-label', v > 0.5 ? 'Pause' : 'Play');
    }
    var whole = Math.floor(pos + 0.0001);
    var frac = pos - whole;
    var tc = '00:00:' + pad(whole, 2) + ':' + pad(Math.round(frac * 24), 2);
    if (tc !== lastTc) {
      lastTc = tc;
      tcEl.textContent = tc;
    }
  }

  if (calm) {
    t0 = -CYCLE * 0.5;
    step();
  } else {
    step();
    (function loop() {
      setTimeout(function () {
        step();
        loop();
      }, 16);
    })();
  }
})();
