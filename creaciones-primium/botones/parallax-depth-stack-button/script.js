(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var deck = document.getElementById("deck");
  var probe = document.getElementById("probe");
  var mode = document.getElementById("mode");
  var pv = document.getElementById("pv");
  var ampv = document.getElementById("ampv");
  var btns = document.querySelectorAll(".pb");
  var meters = document.querySelectorAll(".meter");
  var dreads = [document.getElementById("d0"), document.getElementById("d1"), document.getElementById("d2")];

  var FACT = [
    [0],
    [0.18, 0.42, 0.78, 1.15],
    [0.06, 0.18, 0.24, 0.3, 0.42, 0.5, 0.62, 0.78, 1, 1.15, 1.3]
  ];
  var AMPS = [0, 0.42, 1];
  var AMP = 14;
  var bars = [[], [], []];
  var i, j;

  for (i = 0; i < 3; i++) {
    var m = meters[i];
    var f = FACT[i];
    for (j = 0; j < f.length; j++) {
      var b = document.createElement("i");
      if (i === 0) b.className = "q0";
      if (i === 1) b.className = "q1";
      m.appendChild(b);
      bars[i].push(b);
    }
  }

  ampv.textContent = String(AMP);

  var tx = 0;
  var ty = 0;
  var px = 0;
  var py = 0;
  var lastMove = -9999;
  var t0 = performance.now();
  var live = false;
  var lastTxt = -999;

  function onMove(e) {
    var r = deck.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    if (tx > 1) tx = 1;
    if (tx < -1) tx = -1;
    if (ty > 1) ty = 1;
    if (ty < -1) ty = -1;
    lastMove = performance.now();
  }

  if (!reduce) {
    deck.addEventListener("pointermove", onMove);
    deck.addEventListener("pointerdown", onMove);
  }

  function tick() {
    var now = performance.now();
    var el = now - t0;
    var idle = (now - lastMove) / 1000;

    if (idle > 2.4) {
      var s = el / 1000;
      tx = Math.sin(s * 0.86) * 0.78 + Math.sin(s * 0.31) * 0.16;
      ty = Math.sin(s * 0.61 + 1.15) * 0.62 + Math.cos(s * 0.24) * 0.14;
      live = false;
    } else {
      live = true;
    }

    px += (tx - px) * 0.12;
    py += (ty - py) * 0.12;

    for (var c = 0; c < 3; c++) {
      var a = AMPS[c];
      var ox = px * AMP * a;
      var oy = py * AMP * a;
      btns[c].style.setProperty("--px", ox.toFixed(2) + "px");
      btns[c].style.setProperty("--py", oy.toFixed(2) + "px");
      var f = FACT[c];
      var mx = 0;
      for (var k = 0; k < f.length; k++) {
        var d = Math.abs(ox) * f[k];
        if (d > mx) mx = d;
        var h = 6 + (d / (AMP * 1.3)) * 94;
        if (h > 100) h = 100;
        bars[c][k].style.height = h.toFixed(1) + "%";
      }
      if (now - lastTxt > 70) {
        dreads[c].textContent = mx.toFixed(1);
      }
    }

    btns[2].style.setProperty("--sx", px.toFixed(3));
    btns[2].style.setProperty("--sy", py.toFixed(3));

    var r = deck.getBoundingClientRect();
    probe.style.transform =
      "translate3d(" + (r.width * 0.5 + px * r.width * 0.42).toFixed(1) + "px," +
      (r.height * 0.5 + py * r.height * 0.4).toFixed(1) + "px,0)";
    probe.style.opacity = "1";
    probe.style.setProperty("--ox", (-(r.width * 0.5 + px * r.width * 0.42)).toFixed(1) + "px");
    probe.style.setProperty("--oy", (-(r.height * 0.5 + py * r.height * 0.4)).toFixed(1) + "px");

    if (now - lastTxt > 70) {
      lastTxt = now;
      pv.textContent = px.toFixed(2) + " / " + py.toFixed(2);
      mode.textContent = live ? "Pointer drive" : "Auto sweep";
      mode.className = live ? "tag live" : "tag";
    }

    window.setTimeout(tick, 16);
  }

  if (reduce) {
    for (var c2 = 0; c2 < 3; c2++) {
      var mx2 = 0;
      for (var k2 = 0; k2 < FACT[c2].length; k2++) {
        var d2 = 9 * FACT[c2][k2];
        if (d2 > mx2) mx2 = d2;
        bars[c2][k2].style.height = (6 + (d2 / (AMP * 1.3)) * 94).toFixed(1) + "%";
      }
      dreads[c2].textContent = mx2.toFixed(1);
    }
    btns[2].style.setProperty("--sx", "0.4");
    btns[2].style.setProperty("--sy", "0.3");
    pv.textContent = "0.40 / 0.30";
    mode.textContent = "Static sample";
    probe.style.opacity = "0";
    return;
  }

  window.setTimeout(tick, 16);
})();
