(function () {
  "use strict";

  var PERIOD = 4000;
  var one = function (s) { return document.querySelector(s); };
  var all = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };

  var head = one(".head");
  var glow = one(".glow");
  var grid = one(".grid");
  var throat = one(".throat");
  var wide = one(".plume--wide");
  var mid = one(".plume--mid");
  var core = one(".plume--core");
  var rays = all(".ray");
  var value = one("#th");
  var stars = all(".night__stars i");

  function curve(p, s) {
    for (var i = 1; i < s.length; i++) {
      if (p <= s[i][0]) {
        var k = (p - s[i - 1][0]) / (s[i][0] - s[i - 1][0]);
        return s[i - 1][1] + (s[i][1] - s[i - 1][1]) * k;
      }
    }
    return s[s.length - 1][1];
  }

  var throttle = [[0, 0], [.06, 0], [.12, .34], [.2, .22], [.34, .72], [.46, 1], [.58, 1], [.7, .68], [.84, .2], [.92, 0], [1, 0]];

  function draw(p) {
    var t = curve(p, throttle);
    var ripple = .96 + .04 * Math.sin(p * Math.PI * 8);

    wide.style.transform = "scale(" + (1.7 - 1.42 * t).toFixed(3) + "," + (.4 + .72 * t) * ripple.toFixed(3) + ")";
    wide.style.opacity = (.08 + .5 * t).toFixed(3);

    mid.style.transform = "scale(" + (1.62 - 1.05 * t).toFixed(3) + "," + (.44 + .72 * t).toFixed(3) + ")";
    mid.style.opacity = (.08 + .92 * t).toFixed(3);

    core.style.transform = "scale(" + (1.1 - .2 * t) + "," + (.4 + .82 * t) * ripple.toFixed(3) + ")";
    core.style.opacity = (.05 + .95 * t).toFixed(3);

    var spread = 4.6 - 4.1 * t;
    for (var i = 0; i < rays.length; i++) {
      var off = (i - 1) * spread;
      rays[i].style.transform = "rotate(" + off.toFixed(2) + "deg) scaleY(" + (.4 + .75 * t).toFixed(3) + ")";
      rays[i].style.opacity = (.1 + .6 * t).toFixed(3);
    }

    grid.style.transform = "scaleX(" + (2.4 - 2.06 * t).toFixed(3) + ")";
    grid.style.opacity = (.1 + .5 * t).toFixed(3);
    glow.style.transform = "scale(" + (1.2 - .34 * t).toFixed(3) + "," + (.6 + .55 * t).toFixed(3) + ")";
    glow.style.opacity = (.1 + .9 * t).toFixed(3);
    throat.style.opacity = (.25 + .75 * t).toFixed(3);

    head.style.transform = "translateY(" + (t * 1.1).toFixed(2) + "%)";

    value.textContent = Math.round(t * 100) + " pct";

    for (var m = 0; m < stars.length; m++) {
      var tw = Math.sin(((p * 2 + m * .29) % 1) * Math.PI);
      stars[m].style.opacity = (.08 + .48 * tw).toFixed(3);
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
