(function () {
  "use strict";

  var PERIOD = 4000;
  var one = function (s) { return document.querySelector(s); };
  var all = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };

  var rig = one(".rig");
  var dish = one(".dish");
  var lobe = one(".dish__lobe");
  var lock = one(".lock");
  var bars = all(".meter b");
  var gainValue = one("#gv");
  var stars = all(".night__stars i");

  var PEAK_DB = 12.6;

  function clamp(v, a, b) {
    if (v < a) return a;
    if (v > b) return b;
    return v;
  }

  function draw(p) {
    var az = -Math.cos(p * Math.PI * 2);
    var target = .1 * Math.sin(p * Math.PI * 4);
    var err = az - target;

    var focus = Math.pow(clamp(Math.cos(err * 1.35), 0, 1), 1.7);
    var el = -3 + Math.sin(p * Math.PI * 4 + .8) * 7 + err * 5;
    var jitter = Math.sin(p * Math.PI * 8) * 1.1 * (1 - focus);

    var face = Math.cos(Math.min(1, Math.abs(az)) * 1.32);
    var drift = Math.sin(p * Math.PI * 2 + 1.1) * .5;

    rig.style.transform = "translateX(" + (az * 24 + drift).toFixed(2) + "%) scale(" + (.34 + .66 * face).toFixed(4) + ") rotate(" + (el * .5).toFixed(2) + "deg)";
    dish.style.transform = "rotate(" + (el * .9 + jitter).toFixed(2) + "deg)";

    lobe.style.opacity = (focus * focus).toFixed(3);
    lock.style.transform = "scale(" + (1.9 - 1.05 * focus).toFixed(3) + ")";
    lock.style.opacity = (.24 + .76 * focus).toFixed(3);

    var lit = focus * bars.length;
    for (var i = 0; i < bars.length; i++) {
      var t = clamp(lit - i, 0, 1);
      var g = Math.round(120 + 135 * t);
      bars[i].style.background = "rgba(" + (26 + 27 * t) + "," + g + "," + (86 + 80 * t) + "," + (.2 + .8 * t).toFixed(3) + ")";
      bars[i].style.boxShadow = t > .05 ? "0 0 6px rgba(53,240,166,.45)" : "inset 0 0 0 1px rgba(255,255,255,.06)";
    }

    gainValue.textContent = (PEAK_DB * focus).toFixed(1) + " dB";

    for (var m = 0; m < stars.length; m++) {
      var tw = Math.sin(((p * 2 + m * .19) % 1) * Math.PI);
      stars[m].style.opacity = (.1 + .5 * tw).toFixed(3);
    }
  }

  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var origin = -1;
  var last = -999;

  function tick() {
    var now = performance.now();
    if (now - last < 13) return;
    last = now;
    if (origin < 0) origin = now;
    draw(((now - origin) % PERIOD) / PERIOD);
  }

  function loop() {
    tick();
    window.requestAnimationFrame(loop);
  }

  draw(0);
  window.requestAnimationFrame(loop);
  window.setInterval(tick, 16);
})();
