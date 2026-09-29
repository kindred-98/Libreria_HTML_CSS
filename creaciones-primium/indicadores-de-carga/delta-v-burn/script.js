(function () {
  "use strict";

  var PERIOD = 4000;
  var PULSES = 8;
  var BUDGET = 480;
  var one = function (s) { return document.querySelector(s); };
  var all = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };

  var craft = one(".craft");
  var bell = one(".bell");
  var coneA = one(".cone--a");
  var coneB = one(".cone--b");
  var coneC = one(".cone--c");
  var core = one(".core");
  var mantle = one(".mantle");
  var vapour = one(".vapour");
  var bars = all(".meter b");
  var value = one("#dv");

  function curve(p, s) {
    for (var i = 1; i < s.length; i++) {
      if (p <= s[i][0]) {
        var k = (p - s[i - 1][0]) / (s[i][0] - s[i - 1][0]);
        return s[i - 1][1] + (s[i][1] - s[i - 1][1]) * k;
      }
    }
    return s[s.length - 1][1];
  }

  var burn = [[0, 0], [.05, 0], [.08, .55], [.13, .3], [.2, 1], [.78, 1], [.84, .5], [.89, 0], [1, 0]];
  var spend = [[0, 0], [.2, 0], [.78, 1], [.84, 1], [.95, 0], [1, 0]];

  function draw(p) {
    var b = curve(p, burn);
    var used = curve(p, spend);

    var slot = p * PULSES;
    var frac = slot - Math.floor(slot);
    var pulse = Math.pow(Math.sin(Math.min(1, frac * 1.35) * Math.PI * .5), 2) * (1 - Math.pow(1 - Math.min(1, frac * 1.6), 2) * .35);

    var drive = b * (.52 + .48 * pulse);
    var flick = .94 + .06 * Math.sin(p * Math.PI * 40);

    coneA.style.transform = "scale(" + (1.4 * flick).toFixed(3) + "," + (.42 + .5 * drive * pulse).toFixed(3) + ")";
    coneA.style.opacity = (.1 + .45 * drive).toFixed(3);
    coneB.style.transform = "scale(" + (1.06 + .1 * flick).toFixed(3) + "," + (.5 + .62 * drive).toFixed(3) + ")";
    coneB.style.opacity = (.08 + .86 * drive).toFixed(3);
    coneC.style.transform = "scale(" + (.78 + .06 * flick).toFixed(3) + "," + (.5 + .72 * drive).toFixed(3) + ")";
    coneC.style.opacity = (.06 + .94 * drive).toFixed(3);
    core.style.transform = "scale(" + (.85 + .2 * drive).toFixed(3) + "," + (.5 + .7 * drive).toFixed(3) + ")";
    core.style.opacity = (.05 + .95 * drive).toFixed(3);
    mantle.style.transform = "scale(" + (.8 + .5 * drive).toFixed(3) + "," + (.8 + .4 * drive).toFixed(3) + ")";
    mantle.style.opacity = (.1 + .8 * drive).toFixed(3);

    vapour.style.opacity = (.05 + .5 * b * Math.sin(frac * Math.PI)).toFixed(3);
    vapour.style.transform = "scale(" + (1.4 + .6 * b).toFixed(3) + "," + (.4 + .5 * b).toFixed(3) + ")";

    var kick = -drive * (1.1 + 1.5 * pulse);
    craft.style.transform = "translateY(" + kick.toFixed(3) + "%) rotate(" + (drive * pulse * .55).toFixed(3) + "deg)";
    bell.style.filter = "brightness(" + (1 + .2 * drive).toFixed(3) + ")";

    var left = BUDGET * (1 - used);
    value.textContent = Math.round(left) + " m/s";
    var lit = (left / BUDGET) * bars.length;
    for (var i = 0; i < bars.length; i++) {
      var t = Math.max(0, Math.min(1, lit - i));
      bars[i].style.background = "rgba(" + Math.round(224 - 24 * t) + "," + Math.round(138 + 40 * t) + "," + Math.round(60 + 40 * t) + "," + (.16 + .84 * t).toFixed(3) + ")";
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
