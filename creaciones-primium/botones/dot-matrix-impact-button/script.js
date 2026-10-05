(function () {
  var keys = Array.prototype.slice.call(document.querySelectorAll('.dm'));
  var last = document.getElementById('last');
  var tick = document.getElementById('tick');
  var MSGS = [
    'bus idle \ awaiting strike',
    'ch 01 armed \ 24 v nominal',
    'ch 02 latched \ hold engaged',
    'ch 03 self test \ 6 hz sweep',
    'ch 04 open loop \ check wiring',
    'aux 05 offline \ no bus feed',
    'ch 06 armed \ ready to strike',
    'impact ripple \ 32 nodes per face'
  ];
  var mx = 0;

  keys.forEach(function (btn) {
    var well = btn.querySelector('.dm__well');
    var dots = Array.prototype.slice.call(btn.querySelectorAll('.dm__dots i'));
    var cols = 8;
    var rows = dots.length / cols;

    btn.__geom = function (ev) {
      var r = well.getBoundingClientRect();
      var x = 50;
      var y = 50;
      if (ev && r.width) {
        x = ((ev.clientX - r.left) / r.width) * 100;
        y = ((ev.clientY - r.top) / r.height) * 100;
      }
      return {
        x: Math.max(4, Math.min(96, x)),
        y: Math.max(6, Math.min(94, y))
      };
    };

    btn.__strike = function (ev) {
      if (btn.disabled) return;
      var p = btn.__geom(ev);
      well.style.setProperty('--ox', p.x.toFixed(1) + '%');
      well.style.setProperty('--oy', p.y.toFixed(1) + '%');
      for (var i = 0; i < dots.length; i++) {
        var cx = ((i % cols) + 0.5) / cols * 100;
        var cy = (Math.floor(i / cols) + 0.5) / rows * 100;
        var dx = cx - p.x;
        var dy = (cy - p.y) * 0.86;
        var d = Math.hypot(dx, dy);
        dots[i].style.setProperty('--d', Math.round(d * 3.1) + 'ms');
      }
      btn.classList.remove('is-hit');
      btn.getBoundingClientRect();
      btn.classList.add('is-hit');
      mx++;
      last.textContent = 'ch ' + btn.dataset.ch + ' \ ' + mx + ' strikes';
    };

    btn.addEventListener('click', function (e) { btn.__strike(e); });
    btn.addEventListener('pointerdown', function () {
      if (!btn.disabled) btn.classList.add('is-down');
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (e) {
      btn.addEventListener(e, function () { btn.classList.remove('is-down'); });
    });
  });

  var ix = 0;
  function ticker() {
    var m = MSGS[ix];
    tick.textContent = m + '  \\  ' + m;
  }
  ticker();
  setInterval(function () {
    ix = (ix + 1) % MSGS.length;
    ticker();
  }, 2600);

  var demo = 0;
  setInterval(function () {
    demo++;
    var target = keys[(demo * 2) % (keys.length - 1)];
    if (target && !target.disabled) target.__strike(null);
  }, 3400);
})();
