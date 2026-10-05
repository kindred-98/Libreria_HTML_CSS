(function () {
  var scene = document.getElementById("scene");
  var cvs = document.getElementById("floor");
  var ctx = cvs.getContext("2d");
  var gate = document.getElementById("gate");
  var probe = document.querySelector(".probe");
  var W = 0, H = 0, DPR = 1, HZ = 0, RW = 0, K = 0, CX = 0, FG = 0;
  var scroll = 0, boost = 1, shake = 0, last = 0, clearT = 0;
  var pulses = [], shocks = [];
  var CY = "66,240,255", MG = "255,64,200", WH = "255,255,255";
  var SPOKES = [0.44, 1, 1.64, 2.34, 3.12, 3.98, 4.94, 6.05, 7.4, 9.05];
  var ND = 26, NDASH = 15;

  function measure() {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    var r = cvs.getBoundingClientRect();
    W = Math.max(20, r.width);
    H = Math.max(20, r.height);
    cvs.width = Math.round(W * DPR);
    cvs.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    var p = probe.getBoundingClientRect();
    RW = Math.max(40, p.width);
    K = H;
    CX = W / 2;
    var g = gate.getBoundingClientRect();
    var gy = g.top + g.height - r.top;
    FG = Math.pow(Math.min(0.985, Math.max(0.35, gy / H)), 1 / 2.55);
  }

  function yy(f) { return K * Math.pow(f, 2.55); }
  function hw(y) { return RW * (y / K); }

  function seg(x1, y1, x2, y2, w, a, col) {
    if (a <= 0.004) return;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = w;
    ctx.strokeStyle = "rgba(" + col + "," + a.toFixed(3) + ")";
    ctx.stroke();
  }

  function drawFloor() {
    var i, j, f, y, t, a, w, col, x, y0, y1, xa, xb;

    for (i = 0; i < ND; i++) {
      f = (i / ND + scroll) % 1;
      y = yy(f);
      if (y > H + 4) continue;
      t = (y - HZ) / K;
      a = 0.16 + 0.84 * Math.min(1, t * 4.2);
      w = 0.5 + t * 2.4;
      col = (i % 3 === 0) ? MG : CY;
      seg(0, y, W, y, w * 3.6, a * 0.13, col);
      seg(0, y, W, y, w, a * 0.8, col);
    }

    y0 = yy(0.008);
    for (i = 0; i < SPOKES.length; i++) {
      for (j = 0; j < 2; j++) {
        x = CX + (j ? 1 : -1) * SPOKES[i];
        xa = CX + (j ? 1 : -1) * SPOKES[i] * hw(y0);
        xb = CX + (j ? 1 : -1) * SPOKES[i] * hw(H);
        seg(xa, y0, xb, H, 5.4, 0.1, CY);
        seg(xa, y0, xb, H, 1.15, 0.42, CY);
      }
    }

    ctx.beginPath();
    ctx.moveTo(CX, HZ);
    ctx.lineTo(CX + hw(H), H + 2);
    ctx.lineTo(CX - hw(H), H + 2);
    ctx.closePath();
    ctx.fillStyle = "rgba(9,1,22,0.88)";
    ctx.fill();

    seg(CX - hw(y0), y0, CX - hw(H), H, 9, 0.16, MG);
    seg(CX - hw(y0), y0, CX - hw(H), H, 2, 0.95, MG);
    seg(CX + hw(y0), y0, CX + hw(H), H, 9, 0.16, CY);
    seg(CX + hw(y0), y0, CX + hw(H), H, 2, 0.95, CY);

    for (i = 0; i < NDASH; i++) {
      f = ((i / NDASH + scroll * 1.0) % 1);
      y1 = yy(f);
      y0 = yy(f + 0.42 / NDASH);
      if (y0 > H + 4) continue;
      t = (y1 - HZ) / K;
      a = 0.14 + 0.86 * Math.min(1, t * 4.2);
      var q0 = 0.05 * hw(y1), q1 = 0.05 * hw(y0);
      ctx.beginPath();
      ctx.moveTo(CX - q0, y1);
      ctx.lineTo(CX + q0, y1);
      ctx.lineTo(CX + q1, y0);
      ctx.lineTo(CX - q1, y0);
      ctx.closePath();
      ctx.fillStyle = "rgba(190,250,255," + (a * 0.28).toFixed(3) + ")";
      ctx.fill();
      ctx.fillStyle = "rgba(236,255,255," + (a * 0.92).toFixed(3) + ")";
      ctx.fill();
    }

    for (i = 0; i < ND; i += 2) {
      f = (i / ND + scroll) % 1;
      y = yy(f);
      if (y > H + 6) continue;
      t = (y - HZ) / K;
      a = 0.12 + 0.88 * Math.min(1, t * 4.2);
      for (j = 0; j < 2; j++) {
        x = CX + (j ? 1 : -1) * 1.16 * hw(y);
        var ph = 0.2 * hw(y);
        seg(x, y, x, y - ph, 3.4, a * 0.35, CY);
        seg(x, y, x, y - ph, 1.1, a * 0.9, WH);
        seg(x, y - ph, x, y - ph - 3.5, 2.4, a, CY);
      }
    }
  }

  function drawFx(dt) {
    var i, p, y, t, a, rx, ry, g, hwv;
    for (i = shocks.length - 1; i >= 0; i--) {
      p = shocks[i];
      p.t += dt / 1.15;
      if (p.t >= 1) { shocks.splice(i, 1); continue; }
      g = 1 - Math.pow(1 - p.t, 2.4);
      rx = 0.12 * RW + g * RW * 2.6;
      ry = rx * 0.15;
      ctx.beginPath();
      ctx.ellipse(CX, HZ + K * FG, rx, ry, 0, 0, 6.2832);
      ctx.lineWidth = 9 * (1 - p.t) + 1;
      ctx.strokeStyle = "rgba(" + WH + "," + (0.5 * (1 - p.t)).toFixed(3) + ")";
      ctx.stroke();
      ctx.lineWidth = 26 * (1 - p.t) + 2;
      ctx.strokeStyle = "rgba(" + MG + "," + (0.22 * (1 - p.t)).toFixed(3) + ")";
      ctx.stroke();
    }
    for (i = pulses.length - 1; i >= 0; i--) {
      p = pulses[i];
      p.t += dt / 0.78;
      if (p.t >= 1) { pulses.splice(i, 1); continue; }
      t = Math.pow(p.t, 1.45);
      y = yy(FG * (1 - t) + 0.004);
      a = Math.min(1, p.t * 7) * (1 - Math.pow(p.t, 3));
      hwv = hw(y);
      seg(CX - 2.6 * hwv, y, CX + 2.6 * hwv, y, 16, a * 0.2, WH);
      seg(CX - 2.4 * hwv, y, CX + 2.4 * hwv, y, 4, a * 0.7, MG);
      seg(CX - 2.4 * hwv, y - 1, CX + 2.4 * hwv, y - 1, 1.6, a, WH);
      for (var q = 1; q <= 3; q++) {
        seg(CX - 2.4 * hwv, y + q * 5, CX + 2.4 * hwv, y + q * 5, 1.2, a * (0.16 / q), CY);
      }
    }
  }

  function frame(now) {
    var dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
    last = now;
    scroll = (scroll + dt * 0.085 * boost) % 1;
    boost += (1 - boost) * Math.min(1, dt * 2.1);
    shake *= Math.pow(0.0016, dt);
    var sx = (Math.random() - 0.5) * shake;
    var sy = (Math.random() - 0.5) * shake;
    scene.style.setProperty("--kx", sx.toFixed(2) + "px");
    scene.style.setProperty("--ky", sy.toFixed(2) + "px");
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.save();
    ctx.translate(sx, sy);
    drawFloor();
    drawFx(dt);
    ctx.restore();
    requestAnimationFrame(frame);
  }

  function fire() {
    document.body.classList.remove("fire");
    document.body.getBoundingClientRect();
    document.body.classList.add("fire");
    window.clearTimeout(clearT);
    clearT = window.setTimeout(function () { document.body.classList.remove("fire"); }, 560);
    boost = 4.4;
    shake = 22;
    pulses.push({ t: 0 });
    pulses.push({ t: -0.16 });
    shocks.push({ t: 0 });
    shocks.push({ t: -0.1 });
  }

  gate.addEventListener("click", fire);
  window.addEventListener("resize", measure);
  measure();
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    scroll = 0.22;
    ctx.clearRect(0, 0, W, H);
    drawFloor();
    gate.addEventListener("click", function () {
      boost = 1;
      shake = 0;
      ctx.clearRect(0, 0, W, H);
      drawFloor();
      drawFx(0.78);
    });
  } else {
    requestAnimationFrame(frame);
  }
})();
