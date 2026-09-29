(function () {
  "use strict";

  var PERIOD = 4000;
  var one = function (s) { return document.querySelector(s); };
  var all = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };

  var probe = one(".probe");
  var wingL = one(".wing--l");
  var wingR = one(".wing--r");
  var segsL = all(".wing--l .seg");
  var segsR = all(".wing--r .seg");
  var glazes = all(".glaze");
  
  var arrayValue = one("#arr");
  var stars = all(".deep__stars i");

  var STOW_WING = -84;
  var STOW_FOLD = 168;

  function curve(p, s) {
    for (var i = 1; i < s.length; i++) {
      if (p <= s[i][0]) {
        var k = (p - s[i - 1][0]) / (s[i][0] - s[i - 1][0]);
        return s[i - 1][1] + (s[i][1] - s[i - 1][1]) * k;
      }
    }
    return s[s.length - 1][1];
  }

  var wingF = [[0, 0], [.1, 0], [.4, 1.14], [.45, 1.02], [.5, 1.07], [.55, 1.01], [.6, 1], [.7, 1], [.77, .66], [.9, .04], [.96, 0], [1, 0]];
  var foldF = [[0, 0], [.17, 0], [.47, 1.1], [.52, 1.02], [.57, 1.05], [.62, 1.01], [.66, 1], [.71, 1], [.8, .6], [.92, .04], [.97, 0], [1, 0]];
  var foldF2 = [[0, 0], [.24, 0], [.54, 1.1], [.59, 1.02], [.64, 1.05], [.69, 1.01], [.72, 1], [.72, 1], [.82, .6], [.93, .04], [.98, 0], [1, 0]];

  function draw(p) {
    var wing = curve(p, wingF);
    var f1 = curve(p, foldF);
    var f2 = curve(p, foldF2);

    var rock = Math.sin(p * Math.PI * 2 + .3) * 1.9 + Math.sin(p * Math.PI * 4) * .35;
    probe.style.transform = "rotate(" + rock.toFixed(3) + "deg)";

    var angle = STOW_WING * (1 - wing);
    wingL.style.transform = "rotate(" + angle.toFixed(2) + "deg)";
    wingR.style.transform = "rotate(" + (-angle).toFixed(2) + "deg)";

    var f = [1, f1, f2];
    for (var i = 1; i < 3; i++) {
      segsL[i].style.transform = "rotate(" + (-STOW_FOLD * (1 - f[i])).toFixed(2) + "deg)";
      segsR[i].style.transform = "rotate(" + (STOW_FOLD * (1 - f[i])).toFixed(2) + "deg)";
    }
    for (var j = 0; j < 3; j++) {
      var lit = .4 + .6 * Math.min(f[j], wing);
      segsL[j].style.opacity = lit.toFixed(3);
      segsR[j].style.opacity = lit.toFixed(3);
    }

    var output = wing * (.42 + .58 * (f1 + f2) * .5);

    for (var g = 0; g < glazes.length; g++) {
      var u = (p * 2 + g * .13) % 1;
      glazes[g].style.transform = "translateX(" + (u * 400 - 130).toFixed(1) + "%)";
      glazes[g].style.opacity = (.08 + .5 * output).toFixed(3);
    }

    arrayValue.textContent = (4.2 * output).toFixed(1) + " kW";

    for (var m = 0; m < stars.length; m++) {
      var tw = Math.sin(((p * 2 + m * .23) % 1) * Math.PI);
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
