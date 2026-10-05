(function () {
  var sheet = document.getElementById("sheet");
  var cap = document.getElementById("cap");
  var leak = document.querySelector(".leak");
  var bar = document.querySelector(".cap__bar i");
  var dot = document.querySelector(".cap__dot");
  var frames = Array.prototype.slice.call(sheet.querySelectorAll(".fr"));
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var CYCLE = 1600, STEP = 16;
  var base = "8 frames \u00b7 24 fps \u00b7 cycle 1.60 s \u00b7 ";

  var STOPS = [
    [0, 0, 0, 0, 1],
    [0.05, 1, 1, 1, 1.09],
    [0.14, -0.38, 0.3, -0.44, 0.98],
    [0.24, 0.14, -0.12, 0.2, 1.02],
    [0.32, -0.05, 0, -0.08, 1],
    [0.4, 0.05, -0.4, 0.07, 1.01],
    [0.47, 0.014, 0, 0, 1],
    [0.58, -0.14, 0, -0.11, 1.02],
    [0.66, -0.01, 0, 0, 1],
    [1, 0.006, 0, 0, 1]
  ];

  var held = false;
  var holdU = 0;
  var t0 = 0;

  function nums(el, props) {
    var cs = getComputedStyle(el);
    var out = [];
    for (var prop of props) {
      var v = Number.parseFloat(cs.getPropertyValue(prop));
      out.push(isNaN(v) ? 0 : v);
    }
    return out;
  }

  function shape(u) {
    if (u <= STOPS[0][0]) return STOPS[0];
    for (var i = 1; i < STOPS.length; i++) {
      if (u <= STOPS[i][0]) {
        var a = STOPS[i - 1], b = STOPS[i];
        var k = (u - a[0]) / (b[0] - a[0]);
        k = k * k * (3 - 2 * k);
        return [
          u,
          a[1] + (b[1] - a[1]) * k,
          a[2] + (b[2] - a[2]) * k,
          a[3] + (b[3] - a[3]) * k,
          a[4] + (b[4] - a[4]) * k
        ];
      }
    }
    return STOPS[STOPS.length - 1];
  }

  var data = frames.map(function (fr) {
    var slices = Array.prototype.slice.call(fr.querySelectorAll(".sl"));
    return {
      el: fr,
      slices: slices.map(function (s) {
        var v = nums(s, ["--a", "--b", "--r"]);
        return { el: s, a: v[0], b: v[1], r: v[2], last: "" };
      })
    };
  });

  function step() {
    var now = (new Date()).getTime();
    if (!t0) t0 = now;
    var ms = now - t0;
    var cyc = held ? holdU : (ms % CYCLE) / CYCLE;

    for (var f = 0; f < data.length; f++) {
      var u = held ? holdU : (cyc + f / data.length) % 1;
      var sh = shape(u);
      var fr = data[f];
      for (var s of fr.slices) {
        var t = "translate3d(" + (s.a * sh[1]).toFixed(2) + "px," + (s.b * sh[2]).toFixed(2) +
          "px,0) rotate(" + (s.r * sh[3]).toFixed(3) + "deg) scaleY(" + sh[4].toFixed(3) + ")";
        if (t !== s.last) {
          s.el.style.transform = t;
          s.last = t;
        }
      }
    }

    var lk = ((ms % 9000) / 9000) * 2.8;
    leak.style.transform = "translateX(" + (lk * 100).toFixed(1) + "%) rotate(14deg)";

    var bk = held ? (holdU % 1) : (ms % CYCLE) / CYCLE;
    bar.style.transform = "translateX(" + ((bk * 2 - 1) * 100).toFixed(1) + "%)";

    dot.style.opacity = (ms % 1600 < 800) ? "1" : "0.12";

    setTimeout(step, STEP);
  }

  function choose(fr) {
    for (var f of frames) f.classList.remove("is-sel");
    fr.classList.add("is-sel");
  }

  function grab(fr) {
    if (held) return;
    held = true;
    holdU = ((new Date()).getTime() - t0) % CYCLE / CYCLE;
    document.documentElement.classList.add("is-held");
    choose(fr);
    cap.textContent = base + "frame " + fr.getAttribute("aria-label").slice(6) + " held";
  }

  function release() {
    if (!held) return;
    held = false;
    document.documentElement.classList.remove("is-held");
    cap.textContent = base + (calm ? "settled" : "running");
  }

  for (var fr of frames) {
    (function (fr) {
      fr.addEventListener("pointerdown", function () { grab(fr); });
      fr.addEventListener("pointerenter", function () { if (!held) choose(fr); });
      fr.addEventListener("keydown", function (e) {
        if (e.key === " " || e.key === "Enter") grab(fr);
      });
      fr.addEventListener("blur", release);
    })(fr);
  }

  window.addEventListener("pointerup", release);
  window.addEventListener("pointercancel", release);

  if (calm) {
    for (var fr2 of data) {
      // El indice j se compara con 2, 3 y 7, asi que el bucle interno se queda como indice.
      for (var j = 0; j < fr2.slices.length; j++) {
        var sl = fr2.slices[j];
        if (j === 2 || j === 3 || j === 7) {
          sl.el.style.transform = "translate3d(" + (sl.a * 0.5).toFixed(1) + "px,0,0) rotate(" +
            (sl.r * 0.5).toFixed(2) + "deg)";
        }
      }
    }
    dot.style.opacity = "1";
    cap.textContent = base + "settled";
  } else {
    setTimeout(step, STEP);
  }
})();
