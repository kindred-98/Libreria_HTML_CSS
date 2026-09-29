(function () {
  "use strict";

  var PERIOD = 4000;
  var one = function (s) { return document.querySelector(s); };
  var all = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };

  var craft = one(".craft");
  var glow = one(".port__glow");
  var arms = all(".arm i");
  var crosses = all(".cross");
  var lamps = all(".craft__lamp");
  var rangeValue = one("#rng");
  var stars = all(".void__stars i");

  var START_X = -300;
  var START_Y = 92;
  var RANGE_MAX = 184;

  function curve(p, s) {
    for (var i = 1; i < s.length; i++) {
      if (p <= s[i][0]) {
        var k = (p - s[i - 1][0]) / (s[i][0] - s[i - 1][0]);
        return s[i - 1][1] + (s[i][1] - s[i - 1][1]) * k;
      }
    }
    return s[s.length - 1][1];
  }

  var approach = [[0, 0], [.14, .06], [.3, .15], [.46, .25], [.6, .4], [.72, .72], [.78, 1.05], [.82, 1], [.88, 1], [.94, .42], [1, 0]];
  var axisA = [[0, 0], [.2, 0], [.24, .88], [.78, .96], [1, 1]];
  var axisB = [[0, 0], [.38, 0], [.42, .88], [.78, .95], [1, 1]];
  var axisC = [[0, 0], [.54, 0], [.58, .9], [.78, .96], [1, 1]];
  var litA = [[0, 1], [.2, 1], [.24, .1], [.9, .1], [.95, 1], [1, 1]];
  var litB = [[0, 1], [.38, 1], [.42, .1], [.9, .1], [.95, 1], [1, 1]];
  var litC = [[0, 1], [.54, 1], [.58, .1], [.9, .1], [.95, 1], [1, 1]];
  var litD = [[0, 1], [.66, 1], [.7, .1], [.9, .1], [.95, 1], [1, 1]];
  var swing = [[0, 40], [.76, 40], [.81, 0], [.87, 0], [.91, 40], [1, 40]];
  var glowC = [[0, .22], [.5, .3], [.68, .44], [.78, 1], [.86, .82], [.9, .34], [1, .22]];

  function draw(p) {
    var a = curve(p, approach);
    var ax = 1 - .88 * curve(p, axisA);
    var ay = 1 - .9 * curve(p, axisB);
    var ar = 1 - .92 * curve(p, axisC);

    var wobX = (Math.sin(p * Math.PI * 4) + .3 * Math.sin(p * Math.PI * 8 + .7)) * ax;
    var wobY = (Math.sin(p * Math.PI * 6 + 1.1) + .25 * Math.sin(p * Math.PI * 12)) * ay;
    var wobR = Math.sin(p * Math.PI * 6 + .4) * ar;

    var near = 1 - a;
    var x = START_X * near + wobX * (5.5 * near + 1.2);
    var y = START_Y * near + wobY * (4.2 * near + 1);
    var scale = .34 + .66 * a;
    var rot = wobR * (3.4 * near + .5);

    craft.style.transform = "translate(" + x.toFixed(2) + "%," + y.toFixed(2) + "%) scale(" + scale.toFixed(4) + ") rotate(" + rot.toFixed(3) + "deg)";

    var s = curve(p, swing);
    for (var i = 0; i < arms.length; i++) arms[i].style.transform = "rotate(" + s.toFixed(2) + "deg)";

    var lit = [curve(p, litA), curve(p, litB), curve(p, litC), curve(p, litD)];
    for (var j = 0; j < crosses.length; j++) {
      var o = lit[j];
      crosses[j].style.opacity = (.1 + .9 * o).toFixed(3);
      crosses[j].style.filter = "brightness(" + (.28 + .72 * o).toFixed(3) + ")";
      lamps[j].style.opacity = (.12 + .88 * o).toFixed(3);
    }

    glow.style.opacity = curve(p, glowC).toFixed(3);

    var dist = Math.max(1, Math.round(RANGE_MAX * (1 - Math.min(1, a * 1.02))));
    rangeValue.textContent = dist + " m";

    for (var m = 0; m < stars.length; m++) {
      var tw = Math.sin(((p * 2 + m * .17) % 1) * Math.PI);
      stars[m].style.opacity = (.1 + .55 * tw).toFixed(3);
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
