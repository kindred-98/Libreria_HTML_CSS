(function () {
  "use strict";

  var PERIOD = 4000;
  var one = function (s) { return document.querySelector(s); };
  var all = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };

  var segsL = all(".strand--l i");
  var segsR = all(".strand--r i");
  var snaps = all(".snap");
  var carBox = one(".car__box");
  var weightBox = one(".weight__box");
  var value = one("#tn");
  var stars = all(".sky__stars i");

  var TAU = Math.PI * 2;
  var N = 20;

  function curve(p, s) {
    for (var i = 1; i < s.length; i++) {
      if (p <= s[i][0]) {
        var k = (p - s[i - 1][0]) / (s[i][0] - s[i - 1][0]);
        return s[i - 1][1] + (s[i][1] - s[i - 1][1]) * k;
      }
    }
    return s[s.length - 1][1];
  }

  var slack = [[0, 1], [.18, 1], [.26, .86], [.32, .12], [.36, 0], [.62, 0], [.7, .5], [.78, 1], [1, 1]];
  var travel = [[0, 0], [.2, .04], [.36, .12], [.52, .48], [.64, .78], [.7, .92], [.8, .92], [1, 0]];

  function draw(p) {
    var s = curve(p, slack);
    var climb = curve(p, travel);

    for (var i = 0; i < N; i++) {
      var u = i / (N - 1);
      var wave = Math.sin(u * TAU * 2 - p * TAU * 2) * s
        + Math.sin(u * TAU * 3 - p * TAU * 3 + 1.1) * s * .45
        + Math.sin(p * TAU * 8) * s * .12;
      var dx = wave * 26;

      var j = i;
      segsL[j].style.transform = "translateX(" + dx.toFixed(2) + "px)";
      segsR[j].style.transform = "translateX(" + (-dx * .92).toFixed(2) + "px)";
    }

    var taut = 1 - s;
    for (var k = 0; k < snaps.length; k++) {
      var q = (p - .3) / .34;
      var vis = q > 0 && q < 1 ? Math.sin(q * Math.PI) : 0;
      snaps[k].style.opacity = (vis * taut).toFixed(3);
      snaps[k].style.transform = "scaleY(" + (1 - Math.max(0, 1 - vis * 2) * .55).toFixed(3) + ")";
    }

    var shake = Math.sin(p * TAU * 16) * .35 * taut + Math.sin(p * TAU * 12 + .8) * .22 * taut;
    carBox.style.top = (76 - climb * 56 + shake).toFixed(2) + "%";
    weightBox.style.top = (18 + climb * 56 - shake).toFixed(2) + "%";

    value.textContent = Math.round(210 * taut) + " kN";

    for (var m = 0; m < stars.length; m++) {
      var tw = Math.sin(((p * 2 + m * .21) % 1) * Math.PI);
      stars[m].style.opacity = (.08 + .44 * tw).toFixed(3);
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
