(function () {
  "use strict";

  var PERIOD = 4000;
  var one = function (s) { return document.querySelector(s); };
  var all = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };

  var field = one(".field");
  var capsule = one(".capsule");
  var sheath = one(".sheath");
  var sheath2 = one(".sheath2");
  var band = one(".band");
  var band2 = one(".band2");
  var halo = one(".halo");
  var streaks = all(".wake i");
  var heat = one(".cap__heat");
  var shield = one(".cap__shield");
  var flux = one("#hq");
  var stars = all(".entry__stars i");

  var TAU = Math.PI * 2;

  function draw(p) {
    var a = p * TAU;

    var ox = Math.sin(a) * 3.4 + Math.sin(a * 2 + .6) * .9;
    var oy = -Math.cos(a) * 2.6 + Math.cos(a * 2) * .7;
    var aoa = Math.sin(a * 2 + .5) * 9 + Math.sin(a * 3) * 1.4;

    field.style.transform = "rotate(32deg) scale(.94) translate(" + ox.toFixed(2) + "%," + oy.toFixed(2) + "%)";
    capsule.style.transform = "rotate(" + (Math.sin(a * 2 + .5) * 3.2).toFixed(3) + "deg)";

    var dens = .5 + .5 * Math.sin(a - 4.084);
    var puls = .5 + .5 * Math.sin(a * 2 + 1.2);
    var load = Math.min(1, .22 + .68 * dens + .14 * puls);

    sheath.style.transform = "scale(" + (.5 + .62 * load).toFixed(3) + "," + (.55 + .58 * load).toFixed(3) + ")";
    sheath.style.opacity = (.28 + .72 * load).toFixed(3);
    sheath2.style.transform = "scale(" + (.45 + .8 * load * puls).toFixed(3) + "," + (.5 + .75 * load * puls).toFixed(3) + ")";
    sheath2.style.opacity = (.1 + .9 * load).toFixed(3);

    var slide = -aoa * 1.15;
    band.style.transform = "translateX(" + slide.toFixed(2) + "%) scale(" + (.8 + .4 * load).toFixed(3) + ")";
    band.style.opacity = (.25 + .75 * load).toFixed(3);
    band2.style.transform = "translateX(" + (slide * 1.25).toFixed(2) + "%) scale(" + (.75 + .5 * load * puls).toFixed(3) + ")";
    band2.style.opacity = (.15 + .85 * load * puls).toFixed(3);

    halo.style.transform = "scale(" + (.7 + .5 * load).toFixed(3) + ")";
    halo.style.opacity = (.3 + .7 * load).toFixed(3);

    for (var i = 0; i < streaks.length; i++) {
      var k = (i + 1) / streaks.length;
      var s = (.55 + .75 * load) * (.5 + .8 * (Math.sin(a * 3 - i * .5) * .5 + .5));
      streaks[i].style.transform = "rotate(" + (i - 2.5) * 5.4 + "deg) scale(" + (.4 + .7 * s).toFixed(3) + "," + (.35 + .8 * s * k).toFixed(3) + ")";
      streaks[i].style.opacity = (.12 + .68 * s * k).toFixed(3);
    }

    heat.style.opacity = (.2 + .8 * load).toFixed(3);
    shield.style.filter = "brightness(" + (1 + .5 * load).toFixed(3) + ")";

    flux.textContent = Math.round(1180 * load) + " kW/m2";

    for (var m = 0; m < stars.length; m++) {
      var tw = Math.sin(((p * 2 + m * .27) % 1) * Math.PI);
      stars[m].style.opacity = (.08 + .48 * tw * (1 - load * .6)).toFixed(3);
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
