(function () {
  var cv = document.getElementById("cv");
  var ctx = cv.getContext("2d");
  var coil = document.getElementById("coil");
  var gauge = document.getElementById("gaugeFill");
  var ambBar = document.getElementById("ambBar");
  var ambVal = document.getElementById("ambVal");
  var pin = document.getElementById("pin");
  var out = {
    x: document.getElementById("vX"), y: document.getElementById("vY"),
    z: document.getElementById("vZ"), b: document.getElementById("vB"),
    h: document.getElementById("vHdg")
  };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var W = 10, H = 10, DPR = 1, CX = 0, CY = 0, COILH = 60, MAXA = 60;
  var t = 0, last = 0, snap = 1, snapV = 0, fireT = 9, energy = 0;
  var base = [0.31, -0.19, 0.44];
  var target = [1.94, -1.16, 2.62];
  var val = [0.31, -0.19, 0.44];
  var bAmp = 0.42, bCur = 0.42, hdg = 14;
  var NL = 9;

  function size() {
    var r = cv.getBoundingClientRect();
    var c = coil.getBoundingClientRect();
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = Math.max(20, r.width);
    H = Math.max(20, r.height);
    cv.width = Math.round(W * DPR);
    cv.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    CX = W / 2;
    CY = H / 2;
    COILH = Math.max(30, c.height);
    MAXA = Math.max(30, (W / 2) * 0.84);
  }

  function lx(A, a) { return A * Math.sin(a) * Math.abs(Math.sin(a)); }
  function ly(B, a) { return B * Math.cos(a); }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    var B = COILH * 0.52;
    var i, k, a, A, y0, x0;

    ctx.strokeStyle = "rgba(62,240,208,.14)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(CX, CY, MAXA * 0.52, 0, 6.2832);
    ctx.stroke();
    ctx.setLineDash([2, 5]);
    ctx.beginPath();
    ctx.arc(CX, CY, MAXA * 0.24, 0, 6.2832);
    ctx.stroke();
    ctx.setLineDash([]);

    for (i = 0; i < NL; i++) {
      k = i;
      var appear = (0.3 + 0.7 * (1 - snap)) * (1 - k * 0.055);
      A = MAXA * (0.22 + k * 0.1) * (0.2 + 0.8 * snap);
      if (A < 2 || appear <= 0.02) continue;
      var al = (0.54 + 0.46 * (1 - snap)) * appear;
      ctx.beginPath();
      for (var p = 0; p <= 46; p++) {
        a = (p / 46) * 6.2832;
        x0 = CX + lx(A, a);
        y0 = CY + ly(B, a);
        if (p === 0) ctx.moveTo(x0, y0); else ctx.lineTo(x0, y0);
      }
      ctx.closePath();
      ctx.lineWidth = 5 + (1 - snap) * 1.6;
      ctx.strokeStyle = "rgba(62,240,208," + (al * 0.14).toFixed(3) + ")";
      ctx.stroke();
      ctx.lineWidth = 1 + (1 - snap) * 0.9;
      ctx.strokeStyle = "rgba(" + Math.round(120 + 135 * (1 - snap)) + ",255," +
        Math.round(220 + 35 * (1 - snap)) + "," + al.toFixed(3) + ")";
      ctx.stroke();

      for (var q = 0; q < 2; q++) {
        a = t * 0.55 + q * Math.PI + k * 0.62;
        var x = CX + lx(A, a), y = CY + ly(B, a);
        var x2 = CX + lx(A, a + 0.06), y2 = CY + ly(B, a + 0.06);
        var ang = Math.atan2(y2 - y, x2 - x);
        var s = 2.6 + (1 - snap) * 1.6;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(ang);
        ctx.beginPath();
        ctx.moveTo(s, 0);
        ctx.lineTo(-s * 0.8, s * 0.72);
        ctx.lineTo(-s * 0.8, -s * 0.72);
        ctx.closePath();
        ctx.fillStyle = "rgba(190,255,244," + (al * 1.1).toFixed(3) + ")";
        ctx.fill();
        ctx.restore();
      }
    }

    var cg = ctx.createRadialGradient(CX, CY, 0, CX, CY, COILH * 1.5);
    cg.addColorStop(0, "rgba(62,240,208," + (0.06 + energy * 0.3).toFixed(3) + ")");
    cg.addColorStop(1, "rgba(62,240,208,0)");
    ctx.fillStyle = cg;
    ctx.beginPath();
    ctx.arc(CX, CY, COILH * 1.5, 0, 6.2832);
    ctx.fill();

    ctx.fillStyle = "rgba(62,240,208," + (0.1 + energy * 0.55).toFixed(3) + ")";
    ctx.fillRect(CX - 2, CY - B, 4, B * 2);
  }

  function fire() {
    if (fireT < 0.9) return;
    fireT = 0;
    document.body.classList.remove("firing");
    document.body.getBoundingClientRect();
    document.body.classList.add("firing", "armed");
    window.setTimeout(function () { document.body.classList.remove("firing"); }, 760);
    window.setTimeout(function () { document.body.classList.remove("armed"); }, 2300);
  }

  coil.addEventListener("click", fire);
  window.addEventListener("resize", size);
  size();

  if (reduce) {
    snap = 0.5;
    energy = 0.6;
    draw();
    for (var z = 0; z < 3; z++) val[z] = base[z] + (target[z] - base[z]) * 0.5;
    bCur = 0.42 + 1.2;
  } else {
    function frame(now) {
      var dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
      last = now;
      t += dt;
      fireT += dt;

      var goal = fireT < 0.9 ? 0.2 : 1;
      var k = fireT < 0.9 ? 240 : 3.2;
      var d = k * 26;
      snapV += (-(snap - goal) * d - snapV * (fireT < 0.9 ? 22 : 5.4)) * dt;
      snap += snapV * dt;
      if (snap < 0.16) { snap = 0.16; snapV = 0; }
      energy = Math.max(0, 1 - Math.abs(snap - 0.42) * 1.4) * (fireT < 3 ? 1 : 0.3);

      for (var i = 0; i < 3; i++) {
        var tg = base[i] + (target[i] - base[i]) * (1 - snap) * 1.05;
        val[i] += (tg - val[i]) * Math.min(1, dt * (fireT < 0.9 ? 26 : 3.4));
        val[i] += (Math.random() - 0.5) * 0.006 * (1 + (1 - snap) * 6);
      }
      bAmp = 0.42 + (2.62 - 0.42) * (1 - snap);
      bCur += (bAmp - bCur) * Math.min(1, dt * 18);
      bCur += (Math.random() - 0.5) * 0.008 * (1 + (1 - snap) * 8);
      hdg += ((14 + (1 - snap) * 13.5) - hdg) * Math.min(1, dt * 9);
      hdg += (Math.random() - 0.5) * 0.25;

      out.x.textContent = (val[0] >= 0 ? "+" : "") + val[0].toFixed(2);
      out.y.textContent = (val[1] >= 0 ? "+" : "") + val[1].toFixed(2);
      out.z.textContent = (val[2] >= 0 ? "+" : "") + val[2].toFixed(2);
      out.b.textContent = bCur.toFixed(2);
      out.h.textContent = (Math.round(hdg) + 3600).toString().slice(-3);
      var f = Math.max(0.02, Math.min(1, (bCur - 0.3) / 2.7));
      gauge.style.transform = "scaleX(" + f.toFixed(3) + ")";
      ambBar.style.transform = "scaleX(" + (0.08 + f * 0.92).toFixed(3) + ")";
      ambVal.textContent = bCur.toFixed(2) + " mG";
      pin.style.transform = "rotate(" + (-hdg).toFixed(1) + "deg)";
      draw();
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
})();
