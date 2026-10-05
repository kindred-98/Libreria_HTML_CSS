(function () {
  var canvas = document.getElementById("stage");
  var ctx = canvas.getContext("2d", { alpha: true });
  var outCols = document.getElementById("rCols");
  var outPeak = document.getElementById("rPeak");
  var outField = document.getElementById("rField");
  var outBar = document.getElementById("rBar");
  var outState = document.getElementById("rState");
  var still = window.matchMedia("(prefers-reduced-motion: reduce)");

  var TAU = Math.PI * 2;
  var FS = 0.34;
  var HS = 0.09;
  var PERIOD = 14;
  var W = 0, H = 0, DPR = 1;
  var waterY = 0, basinRX = 0, sigma = 0, maxH = 0, idleH = 0;
  var count = 0;
  var spX, spPhase, spW, spH, spLean, spCx, spCy, spHr, spBy, spGrad, edgeBuf, headBuf;
  var fx = null, fctx = null, fb = null, bctx = null;
  var sparkWhite = null, sparkViolet = null, sparkCyan = null;
  var liquidGrad = null, backGrad = null, frontGrad = null, sheenGrad = null, iridGrad = null, edgeGrad = null;
  var gain = 1, gainNow = 1;
  var magX = 0, magY = 0, magTilt = 0, magTargetX = 0, magTargetY = 0, grab = 0;
  var simTime = 0, last = 0, live = false, tickCount = 0, peak = 0;

  function makeSprite(r, stops) {
    var c = document.createElement("canvas");
    c.width = r * 2;
    c.height = r * 2;
    var g = c.getContext("2d");
    var rg = g.createRadialGradient(r, r, 0, r, r, r);
    for (var stop of stops) rg.addColorStop(stop[0], stop[1]);
    g.fillStyle = rg;
    g.fillRect(0, 0, r * 2, r * 2);
    return c;
  }

  function resize() {
    var rect = canvas.getBoundingClientRect();
    W = Math.max(300, Math.round(rect.width));
    H = Math.max(300, Math.round(rect.height));
    DPR = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.lineCap = "round";

    if (!sparkWhite) {
      sparkWhite = makeSprite(48, [[0, "rgba(255,255,255,1)"], [0.26, "rgba(226,240,255,.6)"], [1, "rgba(180,210,255,0)"]]);
      sparkViolet = makeSprite(64, [[0, "rgba(198,170,255,.9)"], [0.32, "rgba(139,107,255,.38)"], [1, "rgba(139,107,255,0)"]]);
      sparkCyan = makeSprite(64, [[0, "rgba(196,255,255,.85)"], [0.34, "rgba(60,224,232,.32)"], [1, "rgba(60,224,232,0)"]]);
      fx = document.createElement("canvas");
      fctx = fx.getContext("2d");
      fb = document.createElement("canvas");
      bctx = fb.getContext("2d");
    }
    fx.width = Math.max(2, Math.round(W * FS));
    fx.height = Math.max(2, Math.round(H * FS));
    fctx.setTransform(FS, 0, 0, FS, 0, 0);
    fb.width = Math.max(2, Math.round(W * HS));
    fb.height = Math.max(2, Math.round(H * HS));
    bctx.setTransform(HS, 0, 0, HS, 0, 0);

    waterY = H * 0.735;
    basinRX = W * 0.5;
    sigma = Math.max(48, W * 0.145);
    maxH = Math.min(H * 0.34, W * 0.3);
    idleH = Math.max(2.4, H * 0.009);
    count = Math.max(26, Math.min(64, Math.round(W / 26)));

    spX = new Float32Array(count);
    spPhase = new Float32Array(count);
    spW = new Float32Array(count);
    spH = new Float32Array(count);
    spLean = new Float32Array(count);
    spCx = new Float32Array(count);
    spCy = new Float32Array(count);
    spHr = new Float32Array(count);
    spBy = new Float32Array(count);
    edgeBuf = new Float32Array(count * 6);
    headBuf = new Float32Array(count * 3);
    spGrad = [];
    var i;
    for (i = 0; i < count; i++) {
      spX[i] = W * 0.055 + (i + 0.5) * ((W * 0.89) / count);
      spPhase[i] = (i * 2.399963) % TAU;
      spW[i] = Math.max(4, ((W * 0.89) / count) * 0.58);
      var g = ctx.createLinearGradient(spX[i] - spW[i], 0, spX[i] + spW[i], 0);
      g.addColorStop(0, "rgba(6,8,13,1)");
      g.addColorStop(0.16, "rgba(126,146,188,1)");
      g.addColorStop(0.33, "rgba(40,48,68,1)");
      g.addColorStop(0.6, "rgba(5,6,10,1)");
      g.addColorStop(0.86, "rgba(24,17,42,1)");
      g.addColorStop(1, "rgba(58,36,82,1)");
      spGrad.push(g);
    }

    liquidGrad = ctx.createLinearGradient(0, waterY, 0, H);
    liquidGrad.addColorStop(0, "rgba(21,24,34,1)");
    liquidGrad.addColorStop(0.14, "rgba(9,10,15,1)");
    liquidGrad.addColorStop(1, "rgba(2,2,4,1)");

    backGrad = ctx.createLinearGradient(0, waterY - H * 0.042, 0, waterY + H * 0.01);
    backGrad.addColorStop(0, "rgba(31,35,50,1)");
    backGrad.addColorStop(1, "rgba(8,9,14,1)");

    frontGrad = ctx.createLinearGradient(0, H * 0.9, 0, H);
    frontGrad.addColorStop(0, "rgba(12,13,20,1)");
    frontGrad.addColorStop(0.4, "rgba(25,27,38,1)");
    frontGrad.addColorStop(1, "rgba(4,4,7,1)");

    sheenGrad = ctx.createLinearGradient(0, waterY - 2, 0, waterY + 3);
    sheenGrad.addColorStop(0, "rgba(214,236,255,0)");
    sheenGrad.addColorStop(0.42, "rgba(214,236,255,.7)");
    sheenGrad.addColorStop(1, "rgba(139,107,255,0)");

    iridGrad = ctx.createLinearGradient(0, 0, W, 0);
    iridGrad.addColorStop(0, "rgba(255,93,148,0)");
    iridGrad.addColorStop(0.18, "rgba(255,93,148,.5)");
    iridGrad.addColorStop(0.46, "rgba(139,107,255,.55)");
    iridGrad.addColorStop(0.74, "rgba(60,224,232,.5)");
    iridGrad.addColorStop(1, "rgba(60,224,232,0)");

    edgeGrad = ctx.createLinearGradient(0, waterY - maxH, 0, waterY);
    edgeGrad.addColorStop(0, "rgba(226,244,255,.7)");
    edgeGrad.addColorStop(1, "rgba(120,150,200,.05)");

    if (outCols) outCols.textContent = count.toString();
    magX = magTargetX = W * 0.5;
    magY = magTargetY = waterY - H * 0.2;
  }

  function fieldAt(x) {
    var d = (x - magX) / sigma;
    var v = Math.exp(-d * d * 1.7) + Math.exp(-d * d * 0.2) * 0.36;
    return v > 1 ? 1 : v;
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }

  function drawPool() {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(basinRX, waterY + H * 0.004, W * 0.53, H * 0.032, 0, 0, TAU);
    ctx.fillStyle = backGrad;
    ctx.fill();
    ctx.strokeStyle = "rgba(150,180,235,.26)";
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = liquidGrad;
    ctx.fillRect(0, waterY - H * 0.002, W, H - waterY + 2);

    var i, t = simTime;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (i = 0; i < 5; i++) {
      var p = (t * 0.3 + i / 5) % 1;
      var rx = W * (0.04 + p * 0.3);
      ctx.strokeStyle = "rgba(120,190,255," + ((1 - p) * 0.15).toFixed(3) + ")";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.ellipse(magX, waterY + 1, rx, rx * 0.09, 0, Math.PI, TAU);
      ctx.stroke();
    }
    ctx.restore();

    ctx.save();
    ctx.fillStyle = sheenGrad;
    ctx.fillRect(0, waterY - 2, W, 5);
    ctx.restore();
  }

  function drawFrontRim() {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(basinRX, H * 1.05, W * 0.57, H * 0.095, 0, 0, TAU);
    ctx.fillStyle = frontGrad;
    ctx.fill();
    ctx.strokeStyle = "rgba(160,200,245,.2)";
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.restore();
  }

  function drawSpikes() {
    var i, x, bw, hr, cx, cy, baseY, q;
    fctx.clearRect(0, 0, W, H);
    fctx.globalCompositeOperation = "lighter";

    for (i = 0; i < count; i++) {
      x = spX[i];
      bw = spW[i];
      hr = spHr[i];
      cx = spCx[i];
      cy = spCy[i];
      baseY = spBy[i];

      ctx.beginPath();
      ctx.moveTo(x - bw, baseY);
      ctx.bezierCurveTo(x - bw * 0.85, baseY - spH[i] * 0.5, cx - hr * 0.35, cy + hr * 1.7, cx - hr, cy);
      ctx.arc(cx, cy, hr, Math.PI, TAU, false);
      ctx.bezierCurveTo(cx + hr * 0.35, cy + hr * 1.7, x + bw * 0.85, baseY - spH[i] * 0.5, x + bw, baseY);
      ctx.closePath();
      ctx.fillStyle = spGrad[i];
      ctx.fill();

      q = i * 6;
      edgeBuf[q] = x - bw * 0.5;
      edgeBuf[q + 1] = baseY - spH[i] * 0.04;
      edgeBuf[q + 2] = cx - hr * 0.9;
      edgeBuf[q + 3] = cy + hr * 0.5;
      edgeBuf[q + 4] = cx - hr * 0.82;
      edgeBuf[q + 5] = cy - hr * 0.45;

      q = i * 3;
      headBuf[q] = cx;
      headBuf[q + 1] = cy;
      headBuf[q + 2] = hr;
    }

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.beginPath();
    for (i = 0; i < count; i++) {
      q = i * 6;
      ctx.moveTo(edgeBuf[q], edgeBuf[q + 1]);
      ctx.bezierCurveTo(edgeBuf[q + 2], edgeBuf[q + 3], edgeBuf[q + 2], edgeBuf[q + 3] - 2, edgeBuf[q + 4], edgeBuf[q + 5]);
    }
    ctx.strokeStyle = edgeGrad;
    ctx.lineWidth = Math.max(1, Math.min(3, W * 0.0018));
    ctx.stroke();

    ctx.beginPath();
    for (i = 0; i < count; i++) {
      q = i * 3;
      var hx = headBuf[q], hy = headBuf[q + 1], hr2 = headBuf[q + 2];
      ctx.moveTo(hx + Math.cos(-2.95) * hr2, hy + Math.sin(-2.95) * hr2);
      ctx.arc(hx, hy, hr2 * 0.94, -2.95, -0.19, false);
    }
    ctx.strokeStyle = iridGrad;
    ctx.lineWidth = Math.max(1.2, Math.min(4, W * 0.0026));
    ctx.stroke();
    ctx.restore();

    for (i = 0; i < count; i++) {
      q = i * 3;
      var sx = headBuf[q], sy = headBuf[q + 1];
      var sz = headBuf[q + 2] * 3.4;
      fctx.globalAlpha = 0.5;
      fctx.drawImage(sparkWhite, sx - sz * 0.62, sy - sz * 0.62, sz, sz);
      fctx.globalAlpha = 0.26;
      fctx.drawImage(sparkViolet, sx - sz * 0.95, sy - sz * 0.95, sz * 1.6, sz * 1.6);
    }
    fctx.globalAlpha = 1;
  }

  function drawMotes() {
    var t = simTime;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    var i;
    for (i = 0; i < 18; i++) {
      var ang = (i * 12.9898) % TAU;
      var rad = (0.5 + ((i * 37) % 100) / 100) * maxH * 0.9;
      var sp = 0.12 + ((i * 53) % 100) / 260;
      var ph = t * sp + ang;
      var px = magX + Math.cos(ph) * rad * 0.72;
      var py = magY + Math.sin(ph * 1.31 + ang) * rad * 0.34 - ((t * 14 + i * 37) % 64) * 0.42;
      if (py > waterY - 4 || py < H * 0.06) continue;
      var sz = maxH * (0.05 + ((i * 29) % 100) / 1400);
      ctx.globalAlpha = 0.1 + 0.17 * (0.5 + 0.5 * Math.sin(t * 2.2 + i));
      ctx.drawImage(i % 3 === 0 ? sparkCyan : sparkViolet, px - sz, py - sz, sz * 2, sz * 2);
    }
    ctx.restore();
  }

  function drawMagnet() {
    var w = Math.max(22, Math.min(H * 0.075, W * 0.08));
    var h = w * 0.3;
    ctx.save();
    ctx.translate(magX, magY);
    ctx.rotate(magTilt);

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.46;
    var gs = w * 4.6;
    ctx.drawImage(sparkViolet, -gs * 0.5, -gs * 0.5, gs, gs);
    ctx.globalAlpha = 0.3;
    ctx.drawImage(sparkCyan, -gs * 0.34, -gs * 0.34, gs * 0.68, gs * 0.68);
    ctx.restore();

    var k;
    for (k = 0; k < 3; k++) {
      var p = (simTime * 0.36 + k / 3) % 1;
      var rr = w * 0.9 + p * w * 3.1;
      ctx.beginPath();
      ctx.ellipse(0, h * 0.5, rr, rr * 0.34, 0, Math.PI * 0.06, Math.PI * 0.94);
      ctx.strokeStyle = "rgba(150,200,255," + ((1 - p) * 0.3).toFixed(3) + ")";
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }

    var body = ctx.createLinearGradient(0, -h, 0, h);
    body.addColorStop(0, "#f2f5ff");
    body.addColorStop(0.22, "#b9c2d6");
    body.addColorStop(0.5, "#5d6579");
    body.addColorStop(0.78, "#242936");
    body.addColorStop(1, "#0d0f16");
    ctx.fillStyle = body;
    roundRect(-w, -h, w * 2, h * 2, h * 0.9);
    ctx.fill();

    var cap = ctx.createLinearGradient(0, -h, 0, h);
    cap.addColorStop(0, "rgba(255,255,255,.26)");
    cap.addColorStop(0.5, "rgba(255,255,255,0)");
    cap.addColorStop(1, "rgba(0,0,0,.42)");
    ctx.fillStyle = cap;
    roundRect(-w, -h, w * 2, h * 2, h * 0.9);
    ctx.fill();

    ctx.fillStyle = "#ff4f74";
    roundRect(-w, -h * 0.94, w * 0.34, h * 1.88, h * 0.6);
    ctx.fill();
    ctx.fillStyle = "#41d9f0";
    roundRect(w * 0.66, -h * 0.94, w * 0.34, h * 1.88, h * 0.6);
    ctx.fill();

    ctx.strokeStyle = "rgba(255,255,255,.45)";
    ctx.lineWidth = Math.max(1, h * 0.1);
    roundRect(-w * 0.86, -h * 0.42, w * 1.72, h * 0.3, h * 0.2);
    ctx.stroke();
    ctx.restore();
  }

  function composite() {
    bctx.clearRect(0, 0, W, H);
    bctx.drawImage(fx, 0, 0, fx.width, fx.height, 0, 0, W, H);

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, waterY, W, H - waterY);
    ctx.clip();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.2;
    ctx.translate(0, waterY * 2);
    ctx.scale(1, -1);
    ctx.drawImage(fx, 0, 0, W, H);
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.4;
    ctx.drawImage(fx, 0, 0, W, H);
    ctx.globalAlpha = 0.5;
    ctx.drawImage(fb, 0, 0, W, H);
    ctx.restore();
  }

  function integrate(dt) {
    var i, x, f, h, t = simTime;
    for (i = 0; i < count; i++) {
      x = spX[i];
      f = fieldAt(x) * gainNow;
      if (f > 1) f = 1;
      var wave = idleH * (0.55 + 0.45 * Math.sin(t * 1.7 + spPhase[i] + x * 0.008));
      var target = wave + f * maxH * (0.88 + 0.12 * Math.sin(t * 2.9 + spPhase[i] * 1.7));
      var k = 1 - Math.exp(-dt / 0.09);
      spH[i] += (target - spH[i]) * k;
      spLean[i] += ((magX - x) * 0.05 * f - spLean[i]) * (1 - Math.exp(-dt / 0.11));
      h = spH[i];
      var bw = spW[i];
      var sway = Math.sin(t * 2.35 + spPhase[i]) * h * 0.035 + Math.sin(t * 5.1 + spPhase[i] * 2.3) * h * 0.012;
      spCx[i] = x + spLean[i] + sway;
      spBy[i] = waterY + 2 + Math.sin(x * 0.011 + t * 1.15) * H * 0.004;
      spHr[i] = bw * 0.58 * (1 + f * 0.3);
      spCy[i] = spBy[i] - h + spHr[i];
    }
  }

  function update(dt) {
    simTime += dt;
    var ph = (simTime / PERIOD) * TAU;
    var autoX = W * 0.5 + Math.sin(ph) * W * 0.3;
    var autoY = waterY - H * (0.2 + 0.05 * Math.sin(ph * 2 + 0.8));
    var autoT = 0.3 * Math.sin(ph * 3);
    if (grab > 0) {
      autoX = magTargetX;
      autoY = magTargetY;
      autoT = 0.12 * Math.sin(ph * 3);
    }
    var k = grab > 0 ? 0.16 : 0.055;
    magX += (autoX - magX) * k;
    magY += (autoY - magY) * k;
    magTilt = autoT;
    gainNow += (gain - gainNow) * 0.08;
    integrate(dt);
  }

  function render() {
    ctx.clearRect(0, 0, W, H);
    drawPool();
    drawSpikes();
    drawMotes();
    drawMagnet();
    drawFrontRim();
    composite();

    tickCount++;
    if (tickCount % 6 === 0) {
      var i, mx = 0;
      for (i = 0; i < count; i++) if (spH[i] > mx) mx = spH[i];
      peak = peak * 0.8 + (mx / maxH) * 0.2;
      if (outPeak) outPeak.textContent = (peak * 100).toFixed(0) + "%";
      if (outBar) outBar.style.transform = "scaleX(" + Math.min(1, peak).toFixed(3) + ")";
    }
  }

  function loop(now) {
    if (!live) return;
    if (!last) last = now;
    var dt = (now - last) / 1000;
    last = now;
    if (dt > 0.06) dt = 0.06;
    if (dt <= 0) dt = 1 / 60;
    update(dt);
    render();
    requestAnimationFrame(loop);
  }

  function start() {
    if (live) return;
    live = true;
    last = 0;
    if (outState) outState.textContent = "Running";
    requestAnimationFrame(loop);
  }

  function freeze() {
    if (!live) return;
    live = false;
    gainNow = gain;
    var i;
    for (i = 0; i < 90; i++) update(1 / 60);
    if (outState) outState.textContent = "Held";
    render();
  }

  var resizeTimer = 0;
  window.addEventListener("resize", function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
      resize();
      if (live) render();
      else freeze();
    }, 140);
  });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) live = false;
    else if (!still.matches) start();
  });

  var buttons = document.querySelectorAll(".btn");
  Array.prototype.forEach.call(buttons, function (btn) {
    btn.addEventListener("click", function () {
      Array.prototype.forEach.call(buttons, function (other) { other.classList.remove("is-on"); });
      btn.classList.add("is-on");
      gain = Number.parseFloat(btn.dataset.gain) || 1;
      if (outField) outField.textContent = gain.toFixed(2) + " T";
    });
  });
  if (outField) outField.textContent = "1.00 T";

  canvas.addEventListener("pointerdown", function (ev) {
    grab = 1;
    magTargetX = magX = ev.clientX;
    magTargetY = magY = ev.clientY;
    if (canvas.setPointerCapture) canvas.setPointerCapture(ev.pointerId);
  });
  canvas.addEventListener("pointermove", function (ev) {
    if (!grab) return;
    magTargetX = Math.max(W * 0.08, Math.min(W * 0.92, ev.clientX));
    magTargetY = Math.max(H * 0.14, Math.min(waterY - H * 0.05, ev.clientY));
  });
  function release(ev) {
    grab = 0;
    if (canvas.hasPointerCapture && canvas.hasPointerCapture(ev.pointerId)) canvas.releasePointerCapture(ev.pointerId);
  }
  canvas.addEventListener("pointerup", release);
  canvas.addEventListener("pointercancel", function () { grab = 0; });

  if (still.addEventListener) {
    still.addEventListener("change", function (ev) {
      if (ev.matches) freeze();
      else start();
    });
  }

  resize();
  if (still.matches) freeze();
  else start();
})();
