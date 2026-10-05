(function () {
  var cells = Array.prototype.slice.call(document.querySelectorAll(".cell"));
  var logEl = document.getElementById("log");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var CONF = {
    idle: { n: 30, sp: 0.55, rad: 0.92, flat: 0.58, wob: 0.9, hue: [79, 216, 255], core: 0 },
    seek: { n: 34, sp: 1.00, rad: 0.98, flat: 0.44, wob: 0.5, hue: [124, 232, 192], core: 0 },
    lock: { n: 38, sp: 1.85, rad: 0.76, flat: 0.72, wob: 0.3, hue: [157, 255, 210], core: 1 },
    hold: { n: 26, sp: 0.30, rad: 1.00, flat: 0.80, wob: 0.2, hue: [176, 123, 255], core: 0 },
    charge: { n: 38, sp: 1.25, rad: 0.62, flat: 0.34, wob: 0.4, hue: [255, 209, 102], core: 2 },
    storm: { n: 44, sp: 2.60, rad: 1.04, flat: 0.66, wob: 1.5, hue: [255, 138, 92], core: 0 },
    wait: { n: 16, sp: 0.30, rad: 1.02, flat: 0.5, wob: 0.6, hue: [255, 181, 69], core: 0 },
    fault: { n: 24, sp: 1.15, rad: 0.90, flat: 0.6, wob: 2.6, hue: [255, 77, 94], core: 0 },
    dark: { n: 0, sp: 0, rad: 0.9, flat: 0.3, wob: 0, hue: [91, 107, 120], core: 0 }
  };

  function mk(n) { return new Float32Array(n * 8); }

  var nodes = cells.map(function (cell, idx) {
    var st = cell.dataset.st;
    var c = CONF[st];
    var cv = cell.querySelector(".cell__cv");
    var btn = cell.querySelector(".node");
    var meter = cell.querySelector(".cell__meter i");
    var ring = cell.querySelector(".node__ring");
    var ctx = cv.getContext("2d");
    var d = mk(Math.max(1, c.n));
    for (var i = 0; i < c.n; i++) {
      var j = i * 8;
      d[j] = Math.random() * 6.2832;
      d[j + 1] = 0.56 + Math.random() * 0.5;
      d[j + 2] = Math.random() * 6.2832;
      d[j + 3] = 0; d[j + 4] = 0; d[j + 5] = 0; d[j + 6] = 0;
      d[j + 7] = Math.random();
    }
    return {
      idx: idx, cell: cell, st: st, c: c, cv: cv, ctx: ctx, btn: btn, meter: meter, ring: ring,
      d: d, w: 10, h: 10, dpr: 1, cx: 0, cy: 0, size: 10,
      t: idx * 1.7, energy: 0, meterV: 0.3, ringR: 0,
      rhythm: 0.78 + idx * 0.061, phase: idx * 0.9
    };
  });

  function size() {
    for (var n of nodes) {
      var r = n.cv.getBoundingClientRect();
      n.dpr = Math.min(2, window.devicePixelRatio || 1);
      n.w = Math.max(10, r.width);
      n.h = Math.max(10, r.height);
      n.cv.width = Math.round(n.w * n.dpr);
      n.cv.height = Math.round(n.h * n.dpr);
      n.ctx.setTransform(n.dpr, 0, 0, n.dpr, 0, 0);
      n.cx = n.w / 2;
      n.cy = n.h / 2 - 3;
      n.size = Math.min(n.w, n.h) * 0.6;
    }
  }

  function log(line) {
    var d = document.createElement("div");
    d.innerHTML = line;
    logEl.insertBefore(d, logEl.firstChild);
    while (logEl.children.length > 3) logEl.lastChild.remove();
  }

  function scatter(n) {
    var d = n.d, c = n.c;
    for (var i = 0; i < c.n; i++) {
      var j = i * 8;
      var a = d[j];
      var dx = Math.cos(a), dy = Math.sin(a) * c.flat;
      var m = Math.hypot(dx, dy) || 1;
      var f = (0.55 + Math.random() * 0.9) * n.size * 5.2;
      d[j + 5] += (dx / m) * f;
      d[j + 6] += (dy / m) * f - n.size * 1.1;
      d[j + 3] += (dx / m) * n.size * 0.3;
      d[j + 4] += (dy / m) * n.size * 0.3;
    }
    n.energy = 1;
    n.cell.classList.remove("burst");
    n.cell.getBoundingClientRect();
    n.cell.classList.add("burst");
    window.setTimeout(function () { n.cell.classList.remove("burst"); }, 760);
  }

  for (var node of nodes) {
    (function (n) {
      if (n.st === "dark") {
        n.btn.addEventListener("click", function () { log("<i>NODE-09</i> offline · no response"); });
        return;
      }
      n.btn.addEventListener("click", function () {
        scatter(n);
        log("<b>NODE-" + (n.idx + 1 < 10 ? "0" : "") + (n.idx + 1) + "</b> scatter " + n.c.n + "p · " +
          n.st + " reform <i>holding</i>");
      });
      n.btn.addEventListener("pointerenter", function () {
        n.energy = Math.max(n.energy, 0.45);
        log("<b>NODE-" + (n.idx + 1 < 10 ? "0" : "") + (n.idx + 1) + "</b> probed · rhythm " +
          n.rhythm.toFixed(2) + "×");
      });
    })(node);
  }

  var AMB = [
    "bay 04 · drift correction nominal",
    "reform solver v2.8 · 9 nodes online",
    "harmonic base locked to 0.42 hz",
    "chamber pressure 1.01 atm · stable",
    "coil temp 18.4 c · within band"
  ];
  var ambI = 0, ambT = 0;

  function draw(n, dt) {
    var c = n.c, d = n.d, ctx = n.ctx, i, j;
    n.t += dt;
    n.energy *= Math.pow(0.06, dt);
    ctx.clearRect(0, 0, n.w, n.h);
    if (c.n === 0) return;

    var rgb = c.hue;
    var flick = 1;
    if (n.st === "fault") flick = Math.sin(n.t * 21) > -0.3 ? 1 : 0.25;
    var breathe = n.st === "charge" ? 0.32 + 0.68 * Math.pow(Math.abs(Math.sin(n.t * 0.8 + n.phase)), 0.7) : 1;
    var radBase = c.rad * n.size * (n.st === "charge" ? (0.34 + 0.66 * breathe) : 1);
    var speed = c.sp * n.rhythm * (1 + n.energy * 1.7);
    var K = 8.5, C = 2.4;
    var mrx = 0, mry = 0;

    ctx.globalCompositeOperation = "lighter";
    ctx.beginPath();
    ctx.ellipse(n.cx, n.cy, radBase * 0.82, radBase * 0.82 * c.flat, 0, 0, 6.2832);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + "," + (0.08 + 0.12 * Math.min(1, n.energy + 0.25)).toFixed(3) + ")";
    ctx.stroke();
    for (i = 0; i < c.n; i++) {
      j = i * 8;
      d[j] += dt * speed * (0.55 + d[j + 1] * 0.9) * (n.st === "charge" ? 1 + (1 - breathe) * 2.2 : 1);
      d[j + 2] += dt * 0.6;
      var rr = radBase * d[j + 1] * (0.9 + 0.12 * Math.sin(n.t * 1.7 + d[j + 7] * 6.28));
      var a = d[j] + n.phase;
      var x = Math.cos(a) * rr;
      var y = Math.sin(a) * rr * c.flat + Math.sin(a * 2 + n.t * 1.3 + d[j + 7] * 6.28) * c.wob * n.size * 0.075;
      var depth = 0.72 + 0.28 * Math.cos(a);
      if (n.st === "storm") {
        x += Math.sin(n.t * 3.1 + d[j + 7] * 12) * n.size * 0.2;
        y += Math.cos(n.t * 2.7 + d[j + 7] * 9) * n.size * 0.14;
      }
      if (n.st === "fault") {
        x += (Math.random() - 0.5) * n.size * 0.34;
        y += (Math.random() - 0.5) * n.size * 0.3;
      }
      d[j + 5] += (-K * d[j + 3] - C * d[j + 5]) * dt;
      d[j + 6] += (-K * d[j + 4] - C * d[j + 6]) * dt;
      d[j + 3] += d[j + 5] * dt;
      d[j + 4] += d[j + 6] * dt;
      x += d[j + 3];
      y += d[j + 4];
      if (Math.abs(x) > mrx) mrx = Math.abs(x);
      if (Math.abs(y) > mry) mry = Math.abs(y);

      var sx = n.cx + x, sy = n.cy + y;
      var al = (0.3 + 0.6 * depth) * flick * (0.55 + 0.45 * Math.min(1, n.energy * 1.6 + (n.st === "charge" ? breathe * 0.5 : 0)));
      var rad = (0.7 + depth * 1.5) * (1 + n.energy * 0.7);
      ctx.fillStyle = "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + "," + (al * 0.16).toFixed(3) + ")";
      ctx.beginPath();
      ctx.arc(sx, sy, rad * 3.4, 0, 6.2832);
      ctx.fill();
      ctx.fillStyle = "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + "," + al.toFixed(3) + ")";
      ctx.beginPath();
      ctx.arc(sx, sy, rad, 0, 6.2832);
      ctx.fill();
    }

    if (c.core > 0) {
      var cr = n.size * (c.core === 1 ? 0.2 : 0.26) * (0.7 + 0.5 * breathe) * (1 + n.energy * 0.8);
      var g = ctx.createRadialGradient(n.cx, n.cy, 0, n.cx, n.cy, cr * 2.6);
      g.addColorStop(0, "rgba(255,255,255," + (0.5 * flick).toFixed(3) + ")");
      g.addColorStop(0.4, "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + "," + (0.3 * flick).toFixed(3) + ")");
      g.addColorStop(1, "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ",0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(n.cx, n.cy, cr * 2.6, 0, 6.2832);
      ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";

    var base;
    if (n.st === "charge") base = breathe;
    else if (n.st === "fault") base = 0.3 + 0.5 * (Math.sin(n.t * 21) * 0.5 + 0.5);
    else base = 0.42 + 0.22 * Math.sin(n.t * 0.9 + n.phase);
    n.meterV += ((0.2 + base * 0.8) - n.meterV) * Math.min(1, dt * 6);
    n.meter.style.transform = "scaleX(" + n.meterV.toFixed(3) + ")";
    n.ring.style.opacity = (0.28 + 0.5 * Math.min(1, n.energy + 0.15)).toFixed(2);
    n.ring.style.transform = "scale(" + (1 + n.energy * 0.28).toFixed(3) + ")";
  }

  var last = 0;
  function frame(now) {
    var dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
    last = now;
    for (var node of nodes) draw(node, dt);
    ambT += dt;
    if (ambT > 3.1) {
      ambT = 0;
      ambI = (ambI + 1) % AMB.length;
      log(AMB[ambI]);
    }
    requestAnimationFrame(frame);
  }

  size();
  window.addEventListener("resize", size);
  log("bay 04 online · <b>9 nodes</b> armed · solver v2.8");
  if (reduce) {
    for (var node of nodes) {
      node.t = 3.4;
      draw(node, 0.016);
      draw(node, 0.016);
    }
  } else {
    requestAnimationFrame(frame);
  }
})();
