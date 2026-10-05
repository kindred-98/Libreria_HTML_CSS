(function () {
  var hold = document.getElementById('hold');
  var btn = document.getElementById('purge');
  var pct = document.getElementById('hpct');
  var ticks = hold.querySelectorAll('.hold__ticks i');
  var rows = Array.prototype.slice.call(document.querySelectorAll('.row'));
  var meter = document.getElementById('track');
  var usedEl = document.getElementById('used');
  var pctEl = document.getElementById('pct');
  var warn = document.getElementById('warn');
  var ttl = document.getElementById('actTitle');
  var sub = document.getElementById('actSub');
  var toast = document.getElementById('toast');
  var tTitle = document.getElementById('toastTitle');
  var tSub = document.getElementById('toastSub');
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var DUR = 1900;
  var FULL = 148.6;
  var state = 'idle';
  var p = 0;
  var start = 0;
  var lastPct = -1;
  var autoTimer = 0;
  var endTimer = 0;

  function setCharge(v) {
    hold.style.setProperty('--charge', v.toFixed(4));
  }

  function setPct(v) {
    var n = Math.round(v * 100);
    if (n !== lastPct) {
      lastPct = n;
      pct.textContent = String(n);
      if (state === 'charging') sub.textContent = 'Keep holding · ' + n + '%';
    }
    for (var i = 0; i < ticks.length; i++) {
      var lit = v * 5 > i + 0.55;
      if (ticks[i].classList.contains('lit') !== lit) ticks[i].classList.toggle('lit', lit);
    }
  }

  function say(title, text, bad) {
    tTitle.textContent = title;
    tSub.textContent = text;
    toast.classList.toggle('bad', !!bad);
    toast.classList.remove('up');
    toast.getBoundingClientRect();
    toast.classList.add('up');
  }

  function wait(ms, fn) {
    return window.setTimeout(fn, ms);
  }

  function autoIn(ms) {
    window.clearTimeout(autoTimer);
    if (calm) return;
    autoTimer = wait(ms, function () {
      if (state === 'idle') begin();
    });
  }

  function begin() {
    if (state !== 'idle') return;
    state = 'charging';
    p = 0;
    start = performance.now();
    hold.classList.remove('abort', 'done', 'near');
    hold.classList.add('charge');
    setCharge(0);
    setPct(0);
    sub.textContent = 'Hold steady to confirm';
    window.clearTimeout(endTimer);
    endTimer = wait(DUR, function () {
      p = 1;
      setCharge(1);
      setPct(1);
      commit();
    });
    (function loop() {
      if (state !== 'charging') return;
      var q = Math.min(1, (performance.now() - start) / DUR);
      p = q;
      setCharge(q);
      setPct(q);
      if (q > 0.88) hold.classList.add('near');
      if (q < 1) setTimeout(loop, 16);
    })();
  }

  function cancel() {
    if (state !== 'charging') return;
    var at = Math.round(p * 100);
    state = 'abort';
    window.clearTimeout(endTimer);
    hold.classList.remove('charge', 'near');
    hold.classList.add('abort');
    setCharge(0);
    setPct(0);
    sub.textContent = 'Released early · nothing was purged';
    say('Purge cancelled', 'Released at ' + at + '% of the hold', true);
    wait(700, function () {
      hold.classList.remove('abort');
      state = 'idle';
      autoIn(4200);
    });
  }

  function commit() {
    if (state !== 'charging') return;
    state = 'done';
    hold.classList.remove('charge', 'near');
    hold.classList.add('done');
    setCharge(1);
    setPct(1);
    var count = rows.length;
    rows.forEach(function (r, i) {
      wait(110 + i * 95, function () { r.classList.add('wipe', 'done'); });
    });
    wait(180 + count * 95, function () {
      meter.style.setProperty('--fill', '0.21');
      pctEl.textContent = '21';
      usedEl.textContent = '0.0';
      warn.textContent = 'Nothing left to purge';
      warn.classList.add('calm');
      ttl.textContent = 'Archive is empty';
      sub.textContent = '148.6 GB reclaimed on this device';
      say('Purged ' + count + ' items', FULL.toFixed(1) + ' GB reclaimed', false);
      wait(2600, restore);
    });
  }

  function restore() {
    hold.classList.remove('charge', 'near', 'done', 'abort');
    setCharge(0);
    setPct(0);
    meter.style.setProperty('--fill', '0.71');
    pctEl.textContent = '71';
    usedEl.textContent = FULL.toFixed(1);
    warn.textContent = rows.length + ' items can be purged';
    warn.classList.remove('calm');
    ttl.textContent = 'Purge ' + rows.length + ' items permanently';
    sub.textContent = 'Hold the control until the ring closes';
    rows.forEach(function (r, i) {
      wait(i * 85, function () { r.classList.remove('wipe', 'done'); });
    });
    toast.classList.remove('up');
    wait(420, function () {
      state = 'idle';
      p = 0;
      autoIn(1700);
    });
  }

  function live() {
    autoIn(6500);
    begin();
  }

  btn.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    try { hold.setPointerCapture(e.pointerId); } catch {}
    live();
  });
  hold.addEventListener('pointerup', cancel);
  hold.addEventListener('pointercancel', cancel);
  hold.addEventListener('lostpointercapture', cancel);
  btn.addEventListener('keydown', function (e) {
    if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) live();
  });
  btn.addEventListener('keyup', function (e) {
    if (e.key === ' ' || e.key === 'Enter') cancel();
  });
  btn.addEventListener('blur', cancel);

  if (calm) {
    hold.classList.add('charge');
    setCharge(1);
    setPct(1);
  } else {
    setCharge(0);
    setPct(0);
    autoIn(1500);
  }
})();
