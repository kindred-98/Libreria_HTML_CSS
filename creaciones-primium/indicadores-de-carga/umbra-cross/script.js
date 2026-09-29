(function () {
  "use strict";

  var PERIOD = 4000;
  var one = function (s) { return document.querySelector(s); };
  var all = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };

  var shadow = one(".shadow");
  var penumbra = one(".shadow__penumbra");
  var core = one(".shadow__core");
  var edge = one(".shadow__edge");
  var earthshine = one(".moon__earthshine");
  var value = one("#ec");
  var stars = all(".black__stars i");

  var TRAVEL = 118;

  function draw(p) {
    var x = Math.cos(p * Math.PI * 4) * TRAVEL;
    shadow.style.transform = "translateX(" + x.toFixed(2) + "%)";

    var breathe = .5 + .5 * Math.sin(p * Math.PI * 4);
    penumbra.style.opacity = (.9 + .1 * breathe).toFixed(3);
    core.style.transform = "scale(" + (.985 + .015 * breathe).toFixed(4) + ")";
    edge.style.opacity = (.55 + .45 * breathe).toFixed(3);

    var off = Math.min(1, Math.abs(x) / TRAVEL);
    var cover = Math.max(0, 1 - off);
    earthshine.style.opacity = (.3 + .7 * cover).toFixed(3);

    value.textContent = Math.round(cover * 100) + " pct";

    for (var m = 0; m < stars.length; m++) {
      var tw = Math.sin(((p * 2 + m * .23) % 1) * Math.PI);
      stars[m].style.opacity = (.08 + .48 * tw * (1 - cover * .7)).toFixed(3);
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
