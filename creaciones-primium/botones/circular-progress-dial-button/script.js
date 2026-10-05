(function () {
  var keys = Array.prototype.slice.call(document.querySelectorAll('.key'));
  var bar = document.getElementById('bar');
  var rig = document.querySelector('.rig');
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var CYC = 1920;
  var OFF = 240;
  var t0 = performance.now();
  var lastBar = '';

  function step() {
    var now = performance.now();
    var p = ((now - t0) % CYC) / CYC;
    for (var i = 0; i < keys.length; i++) {
      var ph = (p - i * (OFF / CYC) + 1) % 1;
      keys[i].style.setProperty('--ph', ph.toFixed(4));
    }
    rig.style.setProperty('--rp', p.toFixed(4));
    rig.style.setProperty('--cp', p.toFixed(4));
    var b = '0' + (1 + Math.floor(p * 8) % 8);
    if (b !== lastBar) {
      lastBar = b;
      bar.textContent = b;
    }
  }

  keys.forEach(function (k) {
    k.addEventListener('click', function () {
      k.classList.remove('hit');
      k.getBoundingClientRect();
      k.classList.add('hit');
    });
  });

  if (calm) {
    t0 = -CYC * 0.5;
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
