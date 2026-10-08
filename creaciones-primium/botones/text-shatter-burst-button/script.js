(function () {
  var btnA = document.getElementById("btnA");
  var btnB = document.getElementById("btnB");
  var rectA = document.getElementById("rectA");
  var textA = document.getElementById("textA");
  var rectB = document.getElementById("rectB");
  var textB = document.getElementById("textB");
  var useB = document.getElementById("useB");
  var shards = document.getElementById("shards");
  var frac = document.getElementById("frac");
  var dTravel = document.getElementById("dTravel");
  var dState = document.getElementById("dState");
  var dBar = document.getElementById("dBar");
  var noteB = document.getElementById("noteB");
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var N = 12, CYCLE = 5200, STEP = 16;
  var CX = 180, CY = 60;
  var t0 = 0, trigger = 0, downA = 0, downB = 0;
  var lastState = "", lastTravel = -1, lastBar = -1;

  var CENT = [
    [45, 22], [135, 20], [225, 20], [315, 21],
    [45, 60], [135, 60], [225, 60], [315, 60],
    [45, 98], [135, 96], [225, 96], [315, 98]
  ];

  var FLY = [];
  for (var i = 0; i < N; i++) {
    var dx = CENT[i][0] - CX, dy = CENT[i][1] - CY;
    var len = Math.hypot(dx, dy) || 1;
    var reach = 40 + ((i * 29) % 44) + (i % 3) * 7;
    FLY.push({
      x: (dx / len) * reach,
      y: (dy / len) * reach * 0.74 - 10,
      rot: ((i % 2 ? 1 : -1) * (16 + ((i * 23) % 40))),
      delay: (i % 4) * 26 + (i > 7 ? 30 : 0),
      cx: CENT[i][0],
      cy: CENT[i][1]
    });
  }

  function outBack(k) {
    var c = 1.5;
    var t = k - 1;
    return 1 + (c + 1) * t * t * t + c * t * t;
  }

  function inOutBack(k) {
    var c = 1.2;
    if (k < 0.5) {
      var t = 2 * k;
      return 0.5 * (t * t * ((c + 1) * t - c));
    }
    var t2 = 2 * k - 2;
    return 0.5 * (t2 * t2 * ((c + 1) * t2 + c) + 2);
  }

  function phase(ms) {
    var p = ms % CYCLE;
    if (p < 400) return { k: 0, out: 0, st: "intact" };
    if (p < 1050) return { k: (p - 400) / 650, out: outBack((p - 400) / 650), st: "bursting" };
    if (p < 2100) return { k: 1, out: 1, st: "scattered" };
    if (p < 2900) return { k: 1 - (p - 2100) / 800, out: inOutBack((p - 2100) / 800), st: "gathering" };
    if (p < 3200) return { k: 0, out: 0, st: "reseated" };
    return { k: 0, out: 0, st: "intact" };
  }

  function setT(el, name, v) {
    var k = name + "|" + v;
    if (el._t !== k) {
      el.setAttribute("transform", v);
      el._t = k;
    }
  }

  function step() {
    var now = Date.now();
    if (!t0) t0 = now;
    var ms = now - t0;
    var t = ms - trigger;
    if (t < 0) t += CYCLE;
    var p = phase(t);

    var shown = p.st !== "intact" && p.st !== "reseated";
    // Ternario simplificado: las dos ramas comparaban contra "inline".
    if (useB.getAttribute("display") !== "inline") {
      useB.setAttribute("display", shown ? "none" : "inline");
    }
    shards.setAttribute("display", shown ? "inline" : "none");

    var maxT = 0;
    for (var i = 0; i < N; i++) {
      var f = FLY[i];
      var kk = p.k <= 0 ? 0 : Math.max(0, Math.min(1, (p.k * (1 + (1 - f.delay / 700))) - (f.delay / 700)));
      var e = p.out < 0 ? 0 : p.out;
      var gx = f.x * e * kk;
      var gy = f.y * e * kk;
      var gr = f.rot * e * kk;
      setT(shards.children[i], "t",
        "translate(" + f.cx + "," + f.cy + ") rotate(" + gr.toFixed(2) + ") translate(" +
        (-f.cx).toFixed(2) + "," + (-f.cy).toFixed(2) + ") translate(" +
        gx.toFixed(2) + "," + gy.toFixed(2) + ")");
      var d = Math.hypot(gx, gy);
      if (d > maxT) maxT = d;
    }

    var ancho = (1.15 * p.k * (1 - p.k * 0.3)).toFixed(3);
    if (p.k < 0.02) ancho = "0";
    else if (p.k > 0.99) ancho = "0.4";
    frac.setAttribute("stroke-width", ancho);

    var dyA = downA > 0 ? 4 : 0;
    rectA.setAttribute("y", (2 + dyA).toFixed(1));
    rectA.setAttribute("height", (116 - dyA).toFixed(1));
    textA.setAttribute("y", (76 + dyA * 0.8).toFixed(1));
    var dyB = downB > 0 ? 3 : 0;
    rectB.setAttribute("y", (2 + dyB).toFixed(1));
    rectB.setAttribute("height", (116 - dyB).toFixed(1));
    textB.setAttribute("y", (76 + dyB * 0.8).toFixed(1));

    var tr = Math.round(maxT);
    if (tr !== lastTravel) {
      lastTravel = tr;
      dTravel.textContent = tr + " px";
    }
    if (p.st !== lastState) {
      lastState = p.st;
      dState.textContent = p.st;
      var nota = "seams opening, shards leaving the outline";
      if (p.st === "intact" || p.st === "reseated") {
        nota = "twelve shards at rest, flush with the outline";
      } else if (p.st === "scattered") {
        nota = "twelve shards clear of the outline, 12 seams open";
      } else if (p.st === "gathering") {
        nota = "shards returning, seams closing";
      }
      noteB.textContent = nota;
    }
    var bar = p.k;
    if (Math.abs(bar - lastBar) > 0.004) {
      lastBar = bar;
      dBar.style.transform = "scaleX(" + bar.toFixed(3) + ")";
    }

    setTimeout(step, STEP);
  }

  function fire() {
    trigger = Date.now() - t0 - 400;
  }

  btnB.addEventListener("pointerdown", function () {
    downB = 1;
    fire();
  });
  btnB.addEventListener("pointerup", function () { downB = 0; });
  btnB.addEventListener("pointerleave", function () { downB = 0; });
  btnB.addEventListener("keydown", function (e) {
    if (e.key === " " || e.key === "Enter") {
      downB = 1;
      fire();
    }
  });
  btnB.addEventListener("keyup", function () { downB = 0; });
  btnB.addEventListener("blur", function () { downB = 0; });

  btnA.addEventListener("pointerdown", function () { downA = 1; });
  btnA.addEventListener("pointerup", function () { downA = 0; });
  btnA.addEventListener("pointerleave", function () { downA = 0; });
  btnA.addEventListener("keydown", function (e) {
    if (e.key === " " || e.key === "Enter") downA = 1;
  });
  btnA.addEventListener("keyup", function () { downA = 0; });
  btnA.addEventListener("blur", function () { downA = 0; });

  if (calm) {
    useB.setAttribute("display", "inline");
    shards.setAttribute("display", "none");
    frac.setAttribute("stroke-width", "0");
    dState.textContent = "intact";
    noteB.textContent = "twelve shards held in register, outline closed";
  } else {
    setTimeout(step, STEP);
  }
})();
