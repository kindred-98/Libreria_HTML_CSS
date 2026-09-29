(function () {
  "use strict";

  var PERIOD = 4000;
  var one = function (s) { return document.querySelector(s); };
  var all = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };

  var stack = one(".stack");
  var rocket = one(".rocket");
  var holdL = one(".hold--l");
  var holdR = one(".hold--r");
  var plume = one(".plume");
  var sheath = one(".plume__sheath");
  var core = one(".plume__core");
  var neck = one(".plume__neck");
  var shock = one(".shock");
  var dia = all(".shock i");
  var steam = all(".steam i");
  var bloom = one(".bloom");
  var tagA = one(".tag--a");
  var tagV = one(".tag--v");
  var spark = all(".spark i");

  function curve(p, s) {
    for (var i = 1; i < s.length; i++) {
      if (p <= s[i][0]) {
        var k = (p - s[i - 1][0]) / (s[i][0] - s[i - 1][0]);
        return s[i - 1][1] + (s[i][1] - s[i - 1][1]) * k;
      }
    }
    return s[s.length - 1][1];
  }

  function smooth(p, a, b) {
    var t = (p - a) / (b - a);
    if (t < 0) t = 0;
    if (t > 1) t = 1;
    return t * t * (3 - 2 * t);
  }

  var clampRamp = [[0, 0], [.14, 0], [.27, 1], [.84, 1], [.95, 0], [1, 0]];
  var strain = [[0, 0], [.18, 0], [.3, .4], [.46, 1], [.64, .7], [.82, .12], [.9, 0], [1, 0]];
  var plumeY = [[0, 0], [.05, 0], [.08, .56], [.11, .28], [.17, .84], [.24, 1], [.44, 1], [.56, 1.2], [.66, 1.2], [.72, .68], [.8, .24], [.86, .04], [.9, 0], [1, 0]];
  var plumeX = [[0, 1], [.24, 1.14], [.44, 1.14], [.56, .54], [.66, .54], [.8, .7], [.9, 1], [1, 1]];
  var plumeO = [[0, 0], [.05, 0], [.08, .72], [.11, .5], [.17, 1], [.86, 1], [.9, 0], [1, 0]];
  var sheathX = [[0, 1.5], [.05, 1.5], [.08, 1.44], [.11, 1.52], [.17, 1.36], [.24, 1.28], [.44, 1.28], [.56, .4], [.66, .4], [.8, .66], [.86, 1], [.9, 1.5], [1, 1.5]];
  var sheathY = [[0, .2], [.05, .2], [.08, 1], [.11, .7], [.17, 1], [.24, 1], [.44, 1], [.56, 1.12], [.66, 1.12], [.8, .5], [.86, .2], [.9, .2], [1, .2]];
  var sheathO = [[0, 0], [.05, 0], [.08, .85], [.11, .6], [.17, 1], [.86, 1], [.9, 0], [1, 0]];
  var coreX = [[0, 1.1], [.24, 1], [.44, 1], [.56, .48], [.66, .48], [.8, .8], [.86, 1.1], [.9, 1.1], [1, 1.1]];
  var coreY = [[0, 0], [.05, 0], [.08, 1], [.11, .5], [.17, 1], [.24, 1], [.44, 1], [.56, 1.3], [.66, 1.3], [.8, .4], [.86, .1], [.9, 0], [1, 0]];
  var coreO = [[0, 0], [.05, 0], [.08, .8], [.11, .5], [.17, 1], [.8, 1], [.86, 0], [1, 0]];
  var neckY = [[0, .5], [.44, .5], [.5, .9], [.56, 1], [.84, 1], [.9, .5], [1, .5]];
  var neckO = [[0, .12], [.44, .12], [.5, .6], [.56, .95], [.84, .95], [.9, .12], [1, .12]];
  var shockO = [[0, 0], [.45, 0], [.53, .5], [.58, 1], [.66, 1], [.74, .4], [.8, 0], [1, 0]];
  var bloomO = [[0, 0], [.05, 0], [.1, .6], [.13, .42], [.2, 1], [.44, 1], [.64, .92], [.8, .4], [.88, .08], [1, 0]];
  var bloomX = [[0, .5], [.1, .86], [.13, .72], [.2, 1], [.44, 1.05], [.64, .98], [.8, .72], [.88, .52], [1, .5]];
  var bloomY = [[0, .35], [.1, .74], [.13, .62], [.2, 1], [.44, 1.08], [.64, .96], [.8, .6], [.88, .4], [1, .35]];

  function draw(p) {
    var r = curve(p, clampRamp);
    holdL.style.transform = "rotate(" + (44 * r).toFixed(2) + "deg)";
    holdR.style.transform = "rotate(" + (-44 * r).toFixed(2) + "deg)";

    stack.style.transform = "translateY(" + (-1.6 * curve(p, strain)).toFixed(3) + "%)";
    var wob = Math.sin(p * Math.PI * 6) * (0.22 + 0.5 * r);
    rocket.style.transform = "rotate(" + wob.toFixed(3) + "deg) translateX(" + (wob * 1.6).toFixed(2) + "px)";

    plume.style.transform = "scaleY(" + curve(p, plumeY).toFixed(3) + ") scaleX(" + curve(p, plumeX).toFixed(3) + ")";
    plume.style.opacity = curve(p, plumeO).toFixed(3);
    sheath.style.transform = "scaleX(" + curve(p, sheathX).toFixed(3) + ") scaleY(" + curve(p, sheathY).toFixed(3) + ")";
    sheath.style.opacity = curve(p, sheathO).toFixed(3);
    core.style.transform = "scaleX(" + curve(p, coreX).toFixed(3) + ") scaleY(" + curve(p, coreY).toFixed(3) + ")";
    core.style.opacity = curve(p, coreO).toFixed(3);
    neck.style.transform = "scaleY(" + curve(p, neckY).toFixed(3) + ")";
    neck.style.opacity = curve(p, neckO).toFixed(3);

    var so = curve(p, shockO);
    shock.style.opacity = so.toFixed(3);
    var f = (p * 5) % 1;
    var s = 0.55 + 0.45 * Math.sin(f * Math.PI);
    for (var i = 0; i < dia.length; i++) {
      var k = ((f + i * 0.12) % 1);
      var d = 0.45 + 0.55 * Math.sin(k * Math.PI);
      dia[i].style.transform = "rotate(45deg) scale(" + (d * s).toFixed(3) + ")";
      dia[i].style.opacity = (0.25 + 0.75 * d).toFixed(3) * so;
    }

    for (var j = 0; j < steam.length; j++) {
      var off = .07 + j * .045;
      var t = p - off;
      if (t < 0 || t > .44) {
        steam[j].style.opacity = "0";
        continue;
      }
      var u = t / .44;
      var ease = 1 - (1 - u) * (1 - u);
      steam[j].style.opacity = ((1 - u) * (1 - u) * .8).toFixed(3);
      steam[j].style.transform = "translate(" + (-72 * ease).toFixed(1) + "%," + (-96 * ease).toFixed(1) + "%) scale(" + (.2 + 1.5 * ease).toFixed(3) + ")";
    }

    bloom.style.opacity = curve(p, bloomO).toFixed(3);
    bloom.style.transform = "scaleX(" + curve(p, bloomX).toFixed(3) + ") scaleY(" + curve(p, bloomY).toFixed(3) + ")";

    tagA.style.opacity = (smooth(p, .19, .21) - smooth(p, .44, .46)).toFixed(3);
    tagV.style.opacity = (smooth(p, .51, .53) - smooth(p, .79, .81)).toFixed(3);

    for (var m = 0; m < spark.length; m++) {
      var ph = (p * 2 + m * .21) % 1;
      var tw = Math.sin(ph * Math.PI);
      spark[m].style.opacity = (.12 + .88 * tw).toFixed(3);
      spark[m].style.transform = "scale(" + (.65 + .6 * tw).toFixed(3) + ")";
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
