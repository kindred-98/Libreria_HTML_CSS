(function () {
  "use strict";

  var PERIOD = 4000;
  var one = function (s) { return document.querySelector(s); };
  var all = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };

  var rig = one(".rig");
  var petals = all(".petal");
  var cloths = all(".cloth");
  var ripples = all(".ripple");
  var streaks = all(".wind i");
  var stars = all(".deep__stars i");
  var sailValue = one("#sf");

  var ORDER = [1, 2, 0, 3];
  var LAG = [.0, .06, .12, .18];

  function curve(p, s) {
    for (var i = 1; i < s.length; i++) {
      if (p <= s[i][0]) {
        var k = (p - s[i - 1][0]) / (s[i][0] - s[i - 1][0]);
        return s[i - 1][1] + (s[i][1] - s[i - 1][1]) * k;
      }
    }
    return s[s.length - 1][1];
  }

  function shifted(p, s, lag) {
    if (p < lag) return 0;
    if (p > 1 - .12 + lag) return 0;
    return curve((p - lag) / (1 - .12), s);
  }

  var openC = [[0, 0], [.05, 0], [.34, 1.06], [.4, .92], [.45, 1.02], [.5, .97], [.55, 1], [.66, 1], [.78, .6], [.92, .04], [1, 0]];

  function draw(p) {
    var spin = Math.sin(p * Math.PI * 2) * 2.2 + Math.sin(p * Math.PI * 4) * .4;
    rig.style.transform = "rotate(" + spin.toFixed(3) + "deg)";

    var total = 0;

    for (var i = 0; i < petals.length; i++) {
      var d = shifted(p, openC, LAG[ORDER[i]]);
      total += d;

      var sx = .24 + .76 * d;
      var sy = .06 + .94 * d;
      petals[i].style.transform = "scale(" + sx.toFixed(3) + "," + sy.toFixed(3) + ")";

      var sag = 44 * (1 - d) * (1 - d) - 6 * (d > .95 ? (d - .95) * 20 : 0);
      cloths[i].style.transform = "perspective(520px) rotateX(" + sag.toFixed(2) + "deg)";
      cloths[i].style.filter = "brightness(" + (.8 + .2 * d).toFixed(3) + ")";

      var rp = (p - .3 - LAG[ORDER[i]] * .5) / .22;
      if (rp > 0 && rp < 1) {
        var e = rp * rp * (3 - 2 * rp);
        ripples[i].style.opacity = (Math.sin(rp * Math.PI) * .85).toFixed(3);
        ripples[i].style.transform = "scaleY(" + e.toFixed(3) + ")";
      } else {
        ripples[i].style.opacity = "0";
      }
    }

    var open = total / 4;
    sailValue.textContent = Math.round(open * 100) + " percent";

    for (var s = 0; s < streaks.length; s++) {
      var ph = (p * 3 + s * .13) % 1;
      streaks[s].style.transform = "translateX(" + (ph * 190 - 30).toFixed(1) + "%)";
      streaks[s].style.opacity = (.12 + .5 * Math.sin(ph * Math.PI) * (.5 + .5 * open)).toFixed(3);
    }

    for (var m = 0; m < stars.length; m++) {
      var tw = Math.sin(((p * 2 + m * .17) % 1) * Math.PI);
      stars[m].style.opacity = (.12 + .5 * tw).toFixed(3);
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
