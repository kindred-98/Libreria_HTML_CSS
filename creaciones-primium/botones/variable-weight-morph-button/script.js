(function () {
  var fit = document.getElementById("fit");
  var word = document.getElementById("word");
  var seam = document.getElementById("seam");
  var bold = document.querySelector(".press__bold");
  var ring = document.getElementById("ring");
  var sheen = document.querySelector(".press__sheen");
  var num = document.getElementById("num");
  var fill = document.getElementById("fill");
  var over = document.querySelector(".axis__over");
  var overTag = document.querySelector(".over");
  var mark = document.querySelector(".scale__mark");
  var specks = Array.prototype.slice.call(document.querySelectorAll(".speck"));
  var press = document.getElementById("press");
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var MIN = 0, MAX = 9.6, BREATH = 6400, STEP = 16;
  var w = MIN, v = 0, down = false, t0 = 0, last = 0;
  var boom = -9999, lastDown = false, lastR = -1;

  function fitIt() {
    var target = fit.clientWidth;
    if (!target) return;
    var probe = 240;
    var pf = word.style.fontSize;
    var ps = word.style.webkitTextStrokeWidth;
    word.style.fontSize = probe + "px";
    word.style.webkitTextStrokeWidth = MAX + "px";
    var wide = word.getBoundingClientRect().width;
    word.style.fontSize = pf;
    word.style.webkitTextStrokeWidth = ps;
    if (!wide) return;
    var fs = (probe * target * 0.995) / wide;
    fit.style.setProperty("--fs", Math.max(16, Math.min(fs, probe)).toFixed(2) + "px");
  }

  function step() {
    var now = (new Date()).getTime();
    if (!t0) { t0 = now; last = now; }
    var dt = Math.min(0.034, (now - last) / 1000);
    last = now;
    var ms = now - t0;

    var p = (ms % BREATH) / BREATH;
    var s = 0.5 - 0.5 * Math.cos(p * Math.PI * 2);
    var shape = 0.5 - 0.5 * Math.cos(p * Math.PI * 4);
    var base = MAX * Math.max(0, Math.min(1, s * 0.82 + shape * 0.18));
    base += Math.sin(ms / 317) * 0.16 + Math.sin(ms / 149) * 0.09;

    var target = down ? MAX * 1.5 : base;
    var a = (target - w) * 470 - v * 26.2;
    v += a * dt;
    w += v * dt;
    if (w > MAX * 1.7) w = MAX * 1.7;
    if (w < -0.3) w = -0.3;

    var r = Math.round(w * 20) / 20;
    if (r !== lastR) {
      lastR = r;
      word.style.webkitTextStrokeWidth = Math.max(0, r).toFixed(2) + "px";
      var k = Math.max(0, Math.min(1, r / MAX));
      num.textContent = pad(Math.round(100 + 800 * k));
      fill.style.transform = "scaleX(" + (0.06 + 0.94 * k).toFixed(4) + ")";
      seam.style.clipPath =
        "inset(" + (k * 100 - 1.4).toFixed(2) + "% 0px " + (100 - k * 100 - 1.4).toFixed(2) + "% 0px)";
      seam.style.opacity = k > 0.04 && k < 0.97 ? "0.9" : "0";
    }

    if (down !== lastDown) {
      lastDown = down;
      if (down) {
        boom = ms;
        press.classList.add("is-down");
      } else {
        press.classList.remove("is-down");
      }
    }

    var kk = Math.max(0, Math.min(1, w / MAX));
    fit.style.setProperty("--dx", (down ? 12 : 3 + (1 - kk) * 4.5).toFixed(2));
    fit.style.setProperty("--dy", (down ? 5 : 2.4).toFixed(2));

    var e = ms - boom;
    var slamA = e < 640 ? Math.pow(1 - e / 640, 2.1) : 0;
    bold.style.opacity = (slamA * 0.9).toFixed(3);
    bold.style.transform = "translate(-50%,-50%) scale(" + (1 + slamA * 0.014).toFixed(4) + ")";

    var ringA = e < 700 ? Math.pow(1 - e / 700, 2.4) : 0;
    ring.style.opacity = (ringA * 0.95).toFixed(3);
    ring.style.transform = "scale(" + (0.3 + (1 - ringA) * 0.78).toFixed(3) + ")";

    var sheenA = e > 40 && e < 620 ? Math.sin((e - 40) / 580 * Math.PI) : 0;
    sheen.style.opacity = (sheenA * 0.8).toFixed(3);
    sheen.style.transform =
      "translateY(" + (-40 + (e > 40 && e < 620 ? (e - 40) / 580 * 250 : 0)).toFixed(1) + "%) skewX(-9deg)";

    var ov = 0;
    if (e < 780) {
      if (e < 90) ov = e / 90;
      else if (e < 420) ov = 1;
      else ov = 1 - (e - 420) / 360;
    }
    ov = Math.max(0, Math.min(1, ov));
    over.style.opacity = (ov * 0.85).toFixed(3);
    over.style.transform = "scaleX(" + Math.min(1, ov * 1.3).toFixed(3) + ")";
    overTag.style.opacity = ov > 0.5 ? "1" : "0";

    mark.style.transform = "translateX(-.5px) scaleY(" + (1 + ov * 0.7).toFixed(3) + ")";
    mark.style.opacity = (0.5 + ov * 0.5).toFixed(3);

    for (var i = 0; i < specks.length; i++) {
      var t = (e - i * 46) / (700 + i * 70);
      if (t > 0 && t < 1) {
        var q = Math.sin(t * Math.PI);
        specks[i].style.opacity = (q * 0.85).toFixed(3);
        specks[i].style.transform =
          "translate(" + (t * (62 + i * 12)).toFixed(1) + "px," +
          (-t * (34 + i * 12)) + "px) scale(" + (0.4 + q * 0.6).toFixed(2) + ")";
      } else if (specks[i].style.opacity !== "0") {
        specks[i].style.opacity = "0";
      }
    }

    setTimeout(step, STEP);
  }

  function pad(v) {
    if (v < 10) return "00" + v;
    if (v < 100) return "0" + v;
    return String(v);
  }

  function hold(state) {
    if (down === state) return;
    down = state;
  }

  press.addEventListener("pointerdown", function () { hold(true); });
  press.addEventListener("pointerup", function () { hold(false); });
  press.addEventListener("pointercancel", function () { hold(false); });
  press.addEventListener("pointerleave", function () { hold(false); });
  press.addEventListener("keydown", function (e) {
    if (e.key === " " || e.key === "Enter") hold(true);
  });
  press.addEventListener("keyup", function () { hold(false); });
  press.addEventListener("blur", function () { hold(false); });

  MAX = 8.4;
  window.addEventListener("resize", fitIt);
  // "ready" es una promesa: como condicion siempre seria cierta, asi que solo
  // se comprueba que exista el FontFaceSet. El fallo se ignora porque el ajuste
  // ya se ha hecho con las fuentes que hay.
  if (document.fonts) document.fonts.ready.then(fitIt).catch(function () {});
  fitIt();
  if (calm) {
    word.style.webkitTextStrokeWidth = "6px";
    num.textContent = "600";
    fill.style.transform = "scaleX(.65)";
    seam.style.opacity = "0";
    fit.style.setProperty("--dx", "7");
    fit.style.setProperty("--dy", "3");
  } else {
    setTimeout(step, STEP);
  }
})();
