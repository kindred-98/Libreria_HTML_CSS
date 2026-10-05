(function () {
  var tube = document.getElementById('tube');
  var bench = document.querySelector('.bench');
  var segs = Array.prototype.slice.call(tube.querySelectorAll('.seg'));
  var cath = document.getElementById('cathode');
  var fAnode = document.getElementById('anode');
  var fCath = document.getElementById('cathodeV');
  var fState = document.getElementById('state');
  var tAnode = document.getElementById('tAnode');
  var tCath = document.getElementById('tCath');
  var logRow = document.getElementById('logRow');
  var idx = 4;
  var strikes = 1;
  var t0 = 0;
  var timers = [];

  function clearTimers() {
    for (var t of timers) clearTimeout(t);
    timers.length = 0;
  }

  function push(fn, ms) { timers.push(setTimeout(fn, ms)); }

  function pad(n, w) {
    var s = String(n);
    while (s.length < w) s = '0' + s;
    return s;
  }

  function paint(i) {
    idx = ((i % 10) + 10) % 10;
    for (var k = 0; k < segs.length; k++) {
      var raw = Math.abs(k - idx);
      var d = Math.min(raw, 10 - raw);
      segs[k].classList.toggle('is-lit', d === 0);
      segs[k].classList.toggle('is-near', d === 1);
      segs[k].classList.toggle('is-far', d === 2);
    }
    cath.style.setProperty('--k', String(idx - 4.5));
  }

  function volts() {
    var an = 164 + Math.round(Math.random() * 10);
    var ca = -1 - Math.round(Math.random() * 4);
    fAnode.textContent = an + ' V';
    fCath.textContent = ca + ' V';
    tAnode.textContent = String(an);
    tCath.textContent = String(ca);
  }

  function strike() {
    clearTimers();
    if (!t0) t0 = Date.now();
    strikes++;
    tube.classList.add('is-strike', 'is-live');
    bench.classList.add('is-spike');
    fState.textContent = 'Struck';
    push(function () {
      tube.classList.remove('is-strike');
      bench.classList.remove('is-spike');
      fState.textContent = 'Cathode warm';
    }, 640);
    push(function () { paint(idx + 1); }, 110);
    push(function () { volts(); }, 150);
    var el = Math.round((Date.now() - t0) / 100) / 10;
    push(function () {
      logRow.textContent = pad(strikes, 4) + '  +' + (el < 10 ? '0' : '') + el.toFixed(1) + 's  ' + tAnode.textContent + ' V  ok';
    }, 200);
    push(function () {
      fState.textContent = 'Armed';
      tube.classList.remove('is-live');
    }, 940);
  }

  tube.addEventListener('click', strike);
  tube.addEventListener('pointerdown', function () { tube.classList.add('is-press'); });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (e) {
    tube.addEventListener(e, function () { tube.classList.remove('is-press'); });
  });

  paint(4);
  volts();
  setInterval(function () {
    if (tube.classList.contains('is-live')) return;
    tAnode.textContent = String(166 + Math.round(Math.random() * 6));
  }, 820);
})();
