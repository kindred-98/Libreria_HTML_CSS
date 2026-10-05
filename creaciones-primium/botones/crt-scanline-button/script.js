(function () {
  var root = document.documentElement;
  var btn = document.getElementById('tubeBtn');
  var crt = document.getElementById('crt');
  var chip = document.getElementById('chip');
  var lock = document.getElementById('lock');
  var carrier = document.getElementById('carrier');
  var needle = document.getElementById('needle');
  var clock = document.getElementById('clock');
  var barVal = document.getElementById('barVal');
  var cells = Array.prototype.slice.call(document.querySelectorAll('#bar i'));
  var stage = document.querySelector('.stage');
  var slot = document.querySelector('.slot');
  var chars = Array.prototype.slice.call(btn.querySelectorAll('.tube-btn__word i'));
  var timers = [];
  var n = chars.length;

  function fit() {
    var w = slot.clientWidth;
    if (w > 0) slot.style.setProperty('--s', (w / 384).toFixed(4));
  }

  function clearTimers() {
    for (var t of timers) clearTimeout(t);
    timers.length = 0;
  }
  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }

  function bow() {
    var half = (n - 1) / 2;
    for (var i = 0; i < n; i++) {
      var t = half ? (i - half) / half : 0;
      var k = t * t;
      chars[i].style.setProperty('--bow', (k * 7).toFixed(2) + 'px');
      chars[i].style.setProperty('--bul', (1 + 0.075 * (1 - k)).toFixed(3));
    }
  }

  function fring(v) {
    root.style.setProperty('--fr', v.toFixed(2) + 'px');
  }

  function setLevel(pct) {
    var lit = Math.round(pct / 100 * cells.length);
    for (var i = 0; i < cells.length; i++) {
      cells[i].classList.toggle('is-on', i < lit);
      cells[i].classList.toggle('is-hot', i < lit && i >= cells.length - 3);
    }
    barVal.textContent = Math.round(pct) + '%';
  }

  function setLock(on) {
    crt.classList.toggle('is-locked', on);
    stage.classList.toggle('is-locked', on);
    chip.textContent = on ? 'Locked' : 'Seeking';
    lock.textContent = on ? 'Stable' : 'Seeking';
    needle.style.left = on ? '57.4%' : (38 + Math.random() * 8).toFixed(1) + '%';
    setLevel(on ? 92 : 24 + Math.random() * 16);
  }

  function fire() {
    clearTimers();
    fring(0);
    btn.classList.add('is-fire', 'is-down');
    crt.classList.add('is-fire');
    setLock(false);
    fring(1);
    later(function () { fring(1.5); }, 90);
    later(function () { fring(1); }, 190);
    later(function () { fring(.45); }, 300);
    later(function () { btn.classList.remove('is-fire'); }, 640);
    later(function () { crt.classList.remove('is-fire'); }, 640);
    later(function () { fring(0); btn.classList.remove('is-down'); }, 700);
    later(function () { setLock(true); }, 720);
    later(function () {
      carrier.textContent = (61.6 + Math.round(Math.random() * 30) / 100).toFixed(2) + ' MHz';
      setLevel(88 + Math.random() * 8);
    }, 740);
  }

  btn.addEventListener('click', fire);
  btn.addEventListener('pointerdown', function () {
    btn.classList.add('is-down');
    fring(.6);
  });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (e) {
    btn.addEventListener(e, function () { btn.classList.remove('is-down'); });
  });

  var ticks = 0;
  setInterval(function () {
    ticks++;
    var t = 21 * 60 + 47 + ticks * 3;
    var h = Math.floor(t / 60) % 24;
    var m = t % 60;
    clock.textContent = (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
  }, 3000);

  bow();
  fring(0);
  setLock(false);
  fit();
  window.addEventListener('resize', fit);

  var loop = 0;
  setInterval(function () {
    loop++;
    if (loop % 3 === 0) fire();
    else if (!crt.classList.contains('is-locked')) setLevel(20 + Math.random() * 18);
  }, 9200);
})();
