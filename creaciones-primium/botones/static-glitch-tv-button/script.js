(function () {
  var pic = document.getElementById('pic');
  var tx = document.getElementById('tx');
  var lamp = document.getElementById('lamp');
  var st = document.getElementById('txState');
  var sig = document.getElementById('sig');
  var bars = Array.prototype.slice.call(sig.querySelectorAll('i'));
  var tc = document.getElementById('tc');
  var flakes = document.getElementById('flakes');
  var frames = 0;
  var tFrames = 0;
  var base = 14 * 60 + 23;
  var timers = [];

  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function clearTimers() {
    for (var t of timers) clearTimeout(t);
    timers.length = 0;
  }
  function pad(n, w) {
    var s = String(n);
    while (s.length < w) s = '0' + s;
    return s;
  }

  function buildFlakes() {
    var frag = document.createDocumentFragment();
    for (var i = 0; i < 34; i++) {
      var f = document.createElement('i');
      var size = 1.4 + Math.random() * 3.2;
      var dur = 7 + Math.random() * 12;
      f.className = 'flk';
      f.style.left = (Math.random() * 100).toFixed(2) + '%';
      f.style.width = size.toFixed(2) + 'px';
      f.style.height = size.toFixed(2) + 'px';
      f.style.opacity = (0.35 + Math.random() * 0.6).toFixed(2);
      f.style.animationDuration = dur.toFixed(2) + 's';
      f.style.animationDelay = (-Math.random() * dur).toFixed(2) + 's';
      frag.appendChild(f);
    }
    flakes.appendChild(frag);
  }

  function setSig(n) {
    var lit = Math.round((n / 100) * bars.length);
    for (var i = 0; i < bars.length; i++) {
      var h = 24 + (i / bars.length) * 76;
      bars[i].style.height = h.toFixed(0) + '%';
      bars[i].classList.toggle('is-on', i < lit && i < bars.length - 2);
      bars[i].classList.toggle('is-hot', i < lit && i >= bars.length - 2);
    }
  }

  function on() {
    tx.classList.remove('is-idle');
    tx.classList.add('is-fire');
    pic.classList.add('is-tx', 'is-jolt');
    lamp.classList.add('is-on');
    st.textContent = 'carrier up';
    clearTimers();
    tFrames = 0;
    setSig(96);
    later(function () { tx.classList.remove('is-fire'); }, 620);
    later(function () { pic.classList.remove('is-jolt'); }, 640);
    later(function () {
      pic.classList.remove('is-tx');
      lamp.classList.remove('is-on');
      st.textContent = 'standby';
      setSig(34 + Math.round(Math.random() * 10));
    }, 2600);
  }

  function off() {
    clearTimers();
    tx.classList.add('is-idle');
    pic.classList.remove('is-tx', 'is-jolt');
    lamp.classList.remove('is-on');
    st.textContent = 'carrier down';
    setSig(8);
    later(function () {
      st.textContent = 'standby';
      setSig(30 + Math.round(Math.random() * 12));
    }, 900);
  }

  tx.addEventListener('click', function () {
    if (tx.classList.contains('is-idle')) on(); else off();
  });
  tx.addEventListener('pointerdown', function () { tx.classList.add('is-down'); });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (e) {
    tx.addEventListener(e, function () { tx.classList.remove('is-down'); });
  });

  function tick() {
    frames++;
    var live = pic.classList.contains('is-tx');
    if (live) { tFrames++; frames += 2; }
    var total = base * 60 + frames * (live ? 4 : 1);
    var f = total % 60;
    var s = Math.floor(total / 60) % 60;
    var m = Math.floor(total / 3600) % 60;
    var h = Math.floor(total / 216000) % 24;
    tc.textContent = pad(h, 2) + ':' + pad(m, 2) + ':' + pad(s, 2) + ':' + pad(f, 2);
  }

  buildFlakes();
  setSig(36);
  tick();
  setInterval(tick, 40);
  setInterval(function () { if (!pic.classList.contains('is-tx')) setSig(30 + Math.round(Math.random() * 14)); }, 1700);
  setInterval(function () { if (!pic.classList.contains('is-tx')) on(); }, 11000);
})();
