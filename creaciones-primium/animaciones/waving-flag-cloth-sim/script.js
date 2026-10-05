(function () {
  var canvas = document.getElementById("stage");
  var ctx = canvas.getContext("2d", { alpha: true });
  var outGrid = document.getElementById("rGrid");
  var outLinks = document.getElementById("rLinks");
  var outWind = document.getElementById("rWind");
  var outBar = document.getElementById("rBar");
  var outState = document.getElementById("rState");
  var still = window.matchMedia("(prefers-reduced-motion: reduce)");

  var DAMP = 0.9955;
  var GRAV = 620;
  var ITER = 6;
  var STEP = 1 / 60;
  var TAU = Math.PI * 2;

  var W = 0, H = 0, DPR = 1, narrow = false;
  var COLS = 22, ROWS = 15;
  var flagX = 0, flagY = 0, flagW = 0, flagH = 0, pinX = 0;
  var poleTop = 0, poleBottom = 0, poleW = 0;
  var posX, posY, oldX, oldY, pinY;
  var linkA, linkB, linkR, linkK, linkCount = 0;
  var tex = null, texW = 0, texH = 0, cellW = 1, cellH = 1;
  var windLevel = 1, windNow = 1;
  var ptrX = -1, ptrY = 0, ptrOn = false, ptrStrength = 0.5;
  var simTime = 0, acc = 0, last = 0, live = false, frameTick = 0;

  function buildLinks() {
    var A = [], B = [], R = [], K = [];
    function idx(i, j) { return j * COLS + i; }
    function push(a, b, k) {
      var dx = posX[b] - posX[a], dy = posY[b] - posY[a];
      A.push(a); B.push(b); R.push(Math.hypot(dx, dy)); K.push(k);
    }
    var i, j;
    for (j = 0; j < ROWS; j++) for (i = 0; i < COLS - 1; i++) push(idx(i, j), idx(i + 1, j), 1);
    for (j = 0; j < ROWS - 1; j++) for (i = 0; i < COLS; i++) push(idx(i, j), idx(i, j + 1), 1);
    for (j = 0; j < ROWS - 1; j++) for (i = 0; i < COLS - 1; i++) {
      push(idx(i, j), idx(i + 1, j + 1), 0.9);
      push(idx(i + 1, j), idx(i, j + 1), 0.9);
    }
    for (j = 0; j < ROWS; j++) for (i = 0; i < COLS - 2; i++) push(idx(i, j), idx(i + 2, j), 0.05);
    for (j = 0; j < ROWS - 2; j++) for (i = 0; i < COLS; i++) push(idx(i, j), idx(i, j + 2), 0.05);
    linkA = Int32Array.from(A);
    linkB = Int32Array.from(B);
    linkR = Float32Array.from(R);
    linkK = Float32Array.from(K);
    linkCount = linkA.length;
    if (outLinks) outLinks.textContent = linkCount.toLocaleString("en-US");
  }

  function buildTexture() {
    var tw = Math.max(8, Math.round(flagW));
    var th = Math.max(8, Math.round(flagH));
    texW = tw; texH = th;
    if (!tex) tex = document.createElement("canvas");
    tex.width = tw;
    tex.height = th;
    var c = tex.getContext("2d");
    c.clearRect(0, 0, tw, th);

    var base = c.createLinearGradient(0, 0, tw * 0.9, th);
    base.addColorStop(0, "#d0334d");
    base.addColorStop(0.42, "#a81f3d");
    base.addColorStop(1, "#641026");
    c.globalAlpha = 1;
    c.fillStyle = "#6a1029";
    c.fillRect(0, 0, tw, th);
    c.fillStyle = base;
    c.fillRect(0, 0, tw, th);

    var sheen = c.createLinearGradient(0, 0, tw, th * 0.5);
    sheen.addColorStop(0, "rgba(255,214,190,.2)");
    sheen.addColorStop(0.5, "rgba(255,214,190,0)");
    c.fillStyle = sheen;
    c.fillRect(0, 0, tw, th);

    c.globalAlpha = 0.03;
    c.strokeStyle = "#2b0512";
    c.lineWidth = 1;
    c.beginPath();
    var x, y;
    for (x = 0; x < tw; x += 6) { c.moveTo(x + 0.5, 0); c.lineTo(x + 0.5, th); }
    for (y = 0; y < th; y += 6) { c.moveTo(0, y + 0.5); c.lineTo(tw, y + 0.5); }
    c.stroke();
    c.globalAlpha = 1;

    var bandW = Math.max(10, tw * 0.115);
    var hoist = c.createLinearGradient(0, 0, bandW, 0);
    hoist.addColorStop(0, "rgba(48,6,20,.9)");
    hoist.addColorStop(0.72, "rgba(120,20,48,.6)");
    hoist.addColorStop(1, "rgba(120,20,48,0)");
    c.fillStyle = hoist;
    c.fillRect(0, 0, bandW, th);

    var fly = c.createLinearGradient(tw, 0, tw - bandW * 0.7, 0);
    fly.addColorStop(0, "rgba(40,5,18,.55)");
    fly.addColorStop(1, "rgba(40,5,18,0)");
    c.fillStyle = fly;
    c.fillRect(tw - bandW * 0.7, 0, bandW * 0.7, th);

    c.strokeStyle = "rgba(240,205,150,.55)";
    c.lineWidth = Math.max(1, th * 0.006);
    c.beginPath();
    c.moveTo(bandW * 0.98, 0);
    c.lineTo(bandW * 0.98, th);
    c.moveTo(tw - bandW * 0.5, 0);
    c.lineTo(tw - bandW * 0.5, th);
    c.stroke();

    var cx = tw * 0.6, cy = th * 0.47;
    var r = Math.min(th * 0.3, tw * 0.17);
    var gold = c.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    gold.addColorStop(0, "#ffe3b4");
    gold.addColorStop(0.5, "#e8b062");
    gold.addColorStop(1, "#b57a33");

    c.strokeStyle = gold;
    c.lineWidth = r * 0.075;
    c.beginPath();
    c.arc(cx, cy, r, 0, TAU);
    c.stroke();

    c.strokeStyle = "rgba(240,205,150,.42)";
    c.lineWidth = Math.max(0.8, r * 0.018);
    c.beginPath();
    c.arc(cx, cy, r * 0.84, 0, TAU);
    c.stroke();
    c.beginPath();
    c.arc(cx, cy, r * 0.62, 0, TAU);
    c.stroke();

    c.strokeStyle = "rgba(240,205,150,.5)";
    c.lineWidth = Math.max(0.8, r * 0.02);
    c.beginPath();
    var k;
    for (k = 0; k < 24; k++) {
      var a = (k / 24) * TAU;
      var ca = Math.cos(a), sa = Math.sin(a);
      c.moveTo(cx + ca * r * 0.88, cy + sa * r * 0.88);
      c.lineTo(cx + ca * r * 0.97, cy + sa * r * 0.97);
    }
    c.stroke();

    c.fillStyle = gold;
    c.beginPath();
    for (k = 0; k < 16; k++) {
      var ang = (k / 16) * TAU - Math.PI / 2;
      var rad = k % 2 === 0 ? r * 0.58 : r * 0.25;
      var vx = cx + Math.cos(ang) * rad, vy = cy + Math.sin(ang) * rad;
      if (k === 0) c.moveTo(vx, vy); else c.lineTo(vx, vy);
    }
    c.closePath();
    c.fill();

    c.fillStyle = "rgba(106,16,41,.9)";
    c.beginPath();
    c.arc(cx, cy, r * 0.2, 0, TAU);
    c.fill();
    c.fillStyle = gold;
    c.beginPath();
    c.arc(cx, cy, r * 0.1, 0, TAU);
    c.fill();

    var gap = r * 0.62;
    var ox = cx - (gap * 4) / 2;
    for (var i2 = 0; i2 < 5; i2++) {
      var dxx = ox + i2 * gap;
      var dyy = cy + r * 1.16;
      var s = r * (i2 === 2 ? 0.15 : 0.1);
      c.beginPath();
      c.moveTo(dxx, dyy - s);
      c.lineTo(dxx + s * 0.72, dyy);
      c.lineTo(dxx, dyy + s);
      c.lineTo(dxx - s * 0.72, dyy);
      c.closePath();
      c.fillStyle = i2 === 2 ? gold : "rgba(245,215,170,.6)";
      c.fill();
    }

    c.strokeStyle = "rgba(240,205,150,.28)";
    c.lineWidth = Math.max(1, th * 0.008);
    c.beginPath();
    c.moveTo(0, c.lineWidth * 0.5);
    c.lineTo(tw, c.lineWidth * 0.5);
    c.moveTo(0, th - c.lineWidth * 0.5);
    c.lineTo(tw, th - c.lineWidth * 0.5);
    c.stroke();

    cellW = texW / (COLS - 1);
    cellH = texH / (ROWS - 1);
  }

  function resize() {
    var rect = canvas.getBoundingClientRect();
    W = Math.max(300, Math.round(rect.width));
    H = Math.max(300, Math.round(rect.height));
    DPR = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.lineJoin = "round";

    narrow = W < 760;
    COLS = narrow ? 16 : 22;
    ROWS = narrow ? 12 : 15;
    var aspect = narrow ? 1.95 : 2.6;
    var head = H * (narrow ? 0.27 : 0.36);
    flagW = Math.min(W * (narrow ? 0.7 : 0.64), (H * 0.86 - head) * aspect);
    flagH = flagW / aspect;
    pinX = Math.max(38, W * (narrow ? 0.12 : 0.095));
    flagX = pinX + Math.max(1, W * 0.0035);
    flagY = head;
    poleTop = flagY - H * 0.05;
    poleBottom = H * 0.905;
    poleW = Math.max(5, Math.min(11, W * 0.0075));

    var n = COLS * ROWS;
    posX = new Float32Array(n);
    posY = new Float32Array(n);
    oldX = new Float32Array(n);
    oldY = new Float32Array(n);
    pinY = new Float32Array(ROWS);
    var i, j;
    for (j = 0; j < ROWS; j++) {
      pinY[j] = flagY + (flagH * j) / (ROWS - 1);
      for (i = 0; i < COLS; i++) {
        var k = j * COLS + i;
        var t = i / (COLS - 1);
        posX[k] = flagX + flagW * t + Math.sin(t * 5.4) * flagW * 0.018;
        posY[k] = pinY[j] + Math.sin(t * 3.1 + j * 0.6) * flagH * 0.012;
        oldX[k] = posX[k] - 0.9 - t * 0.9;
        oldY[k] = posY[k];
      }
    }
    buildLinks();
    buildTexture();
    if (outGrid) outGrid.textContent = COLS + " \u00d7 " + ROWS;
  }

  function solve() {
    var a, b, dx, dy, dist, diff, rx, ry, k, s;
    for (k = 0; k < linkCount; k++) {
      a = linkA[k];
      b = linkB[k];
      dx = posX[b] - posX[a];
      dy = posY[b] - posY[a];
      dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 0.0001) continue;
      s = linkK[k];
      diff = ((dist - linkR[k]) / dist) * s;
      rx = dx * diff * 0.5;
      ry = dy * diff * 0.5;
      posX[a] += rx;
      posY[a] += ry;
      posX[b] -= rx;
      posY[b] -= ry;
    }
  }

  function simulate(dt) {
    var base = windNow * 1900;
    var j, i, k;
    for (j = 0; j < ROWS; j++) {
      for (i = 1; i < COLS; i++) {
        k = j * COLS + i;
        var x = posX[k], y = posY[k];
        var fall = 0.6 + 0.4 * (i / (COLS - 1));
        var g1 = Math.sin(simTime * 1.7 + y * 0.024) * 0.55;
        var g2 = Math.sin(simTime * 3.6 + x * 0.015 - y * 0.011) * 0.34;
        var g3 = Math.sin(simTime * 6.4 - x * 0.024 + y * 0.017) * 0.2;
        var ax = base * (fall * (1 + g1 + g2 + g3));
        var ay = GRAV + ax * (0.34 * Math.sin(x * 0.024 - simTime * 2.1) + 0.16 * Math.sin(simTime * 4.4 + y * 0.028));
        if (ptrOn) {
          var dxp = x - ptrX, dyp = y - ptrY;
          var dd = dxp * dxp + dyp * dyp;
          if (dd < 26000) {
            var f = ptrStrength * (1 - dd / 26000);
            ax += f * 1500;
            ay -= f * 420;
          }
        }
        var vx = (x - oldX[k]) * DAMP;
        var vy = (y - oldY[k]) * DAMP;
        oldX[k] = x;
        oldY[k] = y;
        posX[k] = x + vx + ax * dt * dt;
        posY[k] = y + vy + ay * dt * dt;
      }
    }
    for (j = 0; j < ROWS; j++) {
      k = j * COLS;
      posX[k] = pinX;
      posY[k] = pinY[j];
      oldX[k] = pinX;
      oldY[k] = pinY[j];
    }
    var it;
    for (it = 0; it < ITER; it++) solve();
  }

  function silhouette() {
    var j, i;
    ctx.beginPath();
    ctx.moveTo(posX[0], posY[0]);
    for (i = 1; i < COLS; i++) ctx.lineTo(posX[i], posY[i]);
    for (j = 1; j < ROWS; j++) {
      var tr = j * COLS + COLS - 1;
      ctx.lineTo(posX[tr], posY[tr]);
    }
    for (i = COLS - 2; i >= 0; i--) {
      var bo = (ROWS - 1) * COLS + i;
      ctx.lineTo(posX[bo], posY[bo]);
    }
    for (j = ROWS - 2; j >= 1; j--) {
      var le = j * COLS;
      ctx.lineTo(posX[le], posY[le]);
    }
    ctx.closePath();
  }

  function drawMast() {
    var x0 = pinX - poleW * 0.62;
    var w = poleW;

    var g = ctx.createLinearGradient(x0, 0, x0 + w, 0);
    g.addColorStop(0, "#1b1f2c");
    g.addColorStop(0.24, "#59617a");
    g.addColorStop(0.4, "#c9d1e4");
    g.addColorStop(0.58, "#6b748c");
    g.addColorStop(1, "#12151f");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x0 + w * 0.5, poleTop);
    ctx.lineTo(x0 + w, poleTop + w * 0.5);
    ctx.lineTo(x0 + w, poleBottom);
    ctx.lineTo(x0, poleBottom);
    ctx.lineTo(x0, poleTop + w * 0.5);
    ctx.closePath();
    ctx.fill();

    var fin = ctx.createRadialGradient(pinX - w * 0.3, poleTop - w * 0.6, w * 0.1, pinX, poleTop, w * 1.5);
    fin.addColorStop(0, "#eef2ff");
    fin.addColorStop(0.35, "#aab3c8");
    fin.addColorStop(0.75, "#4a5166");
    fin.addColorStop(1, "rgba(74,81,102,0)");
    ctx.fillStyle = fin;
    ctx.beginPath();
    ctx.arc(pinX, poleTop, w * 1.25, 0, TAU);
    ctx.fill();

    var j;
    for (j = 0; j < ROWS; j++) {
      var y = pinY[j];
      ctx.fillStyle = "rgba(14,16,24,.85)";
      ctx.beginPath();
      ctx.ellipse(pinX, y, w * 0.34, w * 0.22, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "rgba(226,234,250,.5)";
      ctx.beginPath();
      ctx.ellipse(pinX - w * 0.08, y - w * 0.05, w * 0.12, w * 0.08, 0, 0, TAU);
      ctx.fill();
    }

    var baseW = poleW * 4.4;
    var baseY = poleBottom;
    var sh = ctx.createRadialGradient(pinX, baseY + poleW * 0.5, poleW * 0.3, pinX, baseY + poleW * 0.5, baseW * 1.5);
    sh.addColorStop(0, "rgba(0,0,0,.6)");
    sh.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = sh;
    ctx.beginPath();
    ctx.ellipse(pinX, baseY + poleW * 0.7, baseW * 1.5, poleW * 1.3, 0, 0, TAU);
    ctx.fill();

    var bg = ctx.createLinearGradient(0, baseY - poleW * 0.4, 0, baseY + poleW * 1.1);
    bg.addColorStop(0, "#3a4256");
    bg.addColorStop(0.4, "#1a1e2a");
    bg.addColorStop(1, "#0a0c12");
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.moveTo(pinX - baseW * 0.5, baseY + poleW * 1.1);
    ctx.lineTo(pinX - baseW * 0.28, baseY - poleW * 0.4);
    ctx.lineTo(pinX + baseW * 0.28, baseY - poleW * 0.4);
    ctx.lineTo(pinX + baseW * 0.5, baseY + poleW * 1.1);
    ctx.closePath();
    ctx.fill();
  }

  function drawCloth() {
    var j, i;
    for (j = 0; j < ROWS - 1; j++) {
      for (i = 0; i < COLS - 1; i++) {
        var a = j * COLS + i;
        var b = a + 1;
        var d = a + COLS;
        var e = d + 1;
        var sx = i * cellW, sy = j * cellH;
        var sw = cellW, sh = cellH;
        var ax = (posX[b] - posX[a]) / sw;
        var ay = (posY[b] - posY[a]) / sw;
        var cx = (posX[d] - posX[a]) / sh;
        var cy = (posY[d] - posY[a]) / sh;
        var ex = posX[a] - ax * sx - cx * sy;
        var fy = posY[a] - ay * sx - cy * sy;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(posX[a], posY[a]);
        ctx.lineTo(posX[b], posY[b]);
        ctx.lineTo(posX[e], posY[e]);
        ctx.lineTo(posX[d], posY[d]);
        ctx.closePath();
        ctx.clip();
        ctx.transform(ax, ay, cx, cy, ex, fy);
        ctx.drawImage(tex, sx - 0.5, sy - 0.5, sw + 1, sh + 1, sx - 0.5, sy - 0.5, sw + 1, sh + 1);
        ctx.restore();
      }
    }
  }

  function shade() {
    var band = flagW * 0.42;
    var cx = flagX + flagW * (0.5 + 0.52 * Math.sin(simTime * 0.29));
    ctx.save();
    silhouette();
    ctx.clip();

    ctx.globalCompositeOperation = "overlay";
    var sheen = ctx.createLinearGradient(cx - band, 0, cx + band, 0);
    sheen.addColorStop(0, "rgba(255,238,214,0)");
    sheen.addColorStop(0.42, "rgba(255,238,214,.05)");
    sheen.addColorStop(0.5, "rgba(255,240,216,.3)");
    sheen.addColorStop(0.58, "rgba(255,238,214,.05)");
    sheen.addColorStop(1, "rgba(255,238,214,0)");
    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, W, H);

    ctx.globalCompositeOperation = "multiply";
    var depth = ctx.createLinearGradient(0, flagY - flagH * 0.35, flagW * 0.6 + flagX, flagY + flagH * 1.15);
    depth.addColorStop(0, "rgba(255,255,255,1)");
    depth.addColorStop(0.55, "rgba(198,180,180,1)");
    depth.addColorStop(1, "rgba(74,56,76,1)");
    ctx.fillStyle = depth;
    ctx.fillRect(0, 0, W, H);

    ctx.globalCompositeOperation = "source-over";
    ctx.restore();
  }

  function drawEdges() {
    var i, j;
    ctx.save();
    ctx.strokeStyle = "rgba(12,6,16,.55)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(posX[0], posY[0]);
    for (i = 1; i < COLS; i++) ctx.lineTo(posX[i], posY[i]);
    for (j = 1; j < ROWS; j++) {
      var tr = j * COLS + COLS - 1;
      ctx.lineTo(posX[tr], posY[tr]);
    }
    for (i = COLS - 2; i >= 0; i--) {
      var bo = (ROWS - 1) * COLS + i;
      ctx.lineTo(posX[bo], posY[bo]);
    }
    for (j = ROWS - 2; j >= 1; j--) {
      var le = j * COLS;
      ctx.lineTo(posX[le], posY[le]);
    }
    ctx.closePath();
    ctx.stroke();

    ctx.strokeStyle = "rgba(255,226,196,.34)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(posX[0], posY[0]);
    for (i = 1; i < COLS; i++) ctx.lineTo(posX[i], posY[i]);
    ctx.stroke();
    var baseRow = (ROWS - 1) * COLS;
    ctx.beginPath();
    ctx.moveTo(posX[baseRow], posY[baseRow]);
    for (i = 1; i < COLS; i++) {
      ctx.lineTo(posX[baseRow + i], posY[baseRow + i]);
    }
    ctx.stroke();
    ctx.restore();
  }

  function render() {
    ctx.clearRect(0, 0, W, H);
    drawMast();

    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,.55)";
    ctx.shadowBlur = Math.max(18, flagH * 0.16);
    ctx.shadowOffsetX = Math.max(10, flagW * 0.02);
    ctx.fillStyle = "#000";
    silhouette();
    ctx.fill();
    ctx.restore();

    drawCloth();
    shade();
    drawEdges();

    frameTick++;
    if (frameTick % 8 === 0) {
      windNow = windLevel * (0.86 + 0.16 * Math.sin(simTime * 0.23) + 0.09 * Math.sin(simTime * 0.61 + 1.2));
      if (outWind) outWind.textContent = (windNow * 4.6).toFixed(2) + " m/s";
      if (outBar) outBar.style.transform = "scaleX(" + Math.min(1, windNow / 2.2).toFixed(3) + ")";
    }
  }

  function tick(now) {
    if (!live) return;
    if (!last) last = now;
    var dt = (now - last) / 1000;
    last = now;
    if (dt > 0.06) dt = 0.06;
    acc += dt;
    var guard = 0;
    while (acc >= STEP && guard < 3) {
      simTime += STEP;
      simulate(STEP);
      acc -= STEP;
      guard++;
    }
    if (guard >= 3) acc = 0;
    render();
    requestAnimationFrame(tick);
  }

  function start() {
    if (live) return;
    live = true;
    last = 0;
    acc = 0;
    if (outState) outState.textContent = "Running";
    requestAnimationFrame(tick);
  }

  function freeze() {
    if (!live) return;
    live = false;
    var i;
    for (i = 0; i < 220; i++) {
      simTime += STEP;
      windNow = windLevel;
      simulate(STEP);
    }
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
    if (document.hidden) {
      live = false;
    } else if (!still.matches) {
      start();
    }
  });

  var buttons = document.querySelectorAll(".btn");
  Array.prototype.forEach.call(buttons, function (btn) {
    btn.addEventListener("click", function () {
      Array.prototype.forEach.call(buttons, function (other) { other.classList.remove("is-on"); });
      btn.classList.add("is-on");
      windLevel = parseFloat(btn.dataset.wind) || 1;
    });
  });

  window.addEventListener("pointermove", function (ev) {
    ptrX = ev.clientX;
    ptrY = ev.clientY;
    ptrOn = true;
  });
  window.addEventListener("pointerleave", function () { ptrOn = false; });
  window.addEventListener("pointerdown", function () { ptrStrength = 1.25; });
  window.addEventListener("pointerup", function () { ptrStrength = 0.55; });

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
