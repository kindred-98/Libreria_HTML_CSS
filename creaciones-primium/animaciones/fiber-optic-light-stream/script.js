(function () {
  var canvas = document.getElementById("stage");
  var ctx = canvas.getContext("2d", { alpha: true });
  var outStrands = document.getElementById("rStrands");
  var outJunc = document.getElementById("rJunc");
  var outLive = document.getElementById("rLive");
  var outBar = document.getElementById("rBar");
  var outState = document.getElementById("rState");
  var still = window.matchMedia("(prefers-reduced-motion: reduce)");

  var TAU = Math.PI * 2;
  var SAMPLES = 22;
  var FS = 0.32;
  var HS = 0.1;
  var POOL = 96;
  var FLOOR = 0.87;

  var NODE_DEF = [
    [-0.03, 0.5],
    [0.23, 0.5],
    [0.5, 0.27],
    [0.5, 0.49],
    [0.5, 0.69],
    [0.77, 0.17],
    [0.93, 0.29],
    [0.79, 0.44],
    [0.94, 0.55],
    [0.77, 0.66],
    [0.93, 0.78]
  ];
  var EDGE_DEF = [
    [0, 1, 1],
    [1, 2, 2], [1, 3, 2], [1, 4, 2],
    [2, 5, 3], [2, 6, 3],
    [3, 7, 3], [3, 8, 3],
    [4, 9, 3], [4, 10, 3]
  ];

  var W = 0, H = 0, DPR = 1;
  var nx = new Float32Array(NODE_DEF.length);
  var ny = new Float32Array(NODE_DEF.length);
  var egFrom = new Int32Array(EDGE_DEF.length);
  var egTo = new Int32Array(EDGE_DEF.length);
  var egDepth = new Int32Array(EDGE_DEF.length);
  var egPts = new Float32Array(EDGE_DEF.length * SAMPLES * 2);
  var egDur = new Float32Array(EDGE_DEF.length);
  var out = [];
  var isEnd = new Uint8Array(NODE_DEF.length);
  var nodeGlow = new Float32Array(NODE_DEF.length);

  var pulses = [];
  var emitAcc = 0, seed = 20240611;
  var rate = 1, rateNow = 1;
  var fx = null, fctx = null, fb = null, bctx = null;
  var spWhite = null, spCyan = null, spAmber = null;
  var tmp = new Float32Array(2);
  var simTime = 0, last = 0, live = false, tickCount = 0, activeCount = 0;
  var i;

  for (i = 0; i < POOL; i++) {
    pulses.push({ on: false, edge: 0, t: 0, dur: 1, depth: 1, size: 1 });
  }
  for (i = 5; i < NODE_DEF.length; i++) isEnd[i] = 1;

  function rnd() {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  }

  function makeSprite(stops) {
    var r = 64;
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

  function spriteFor(depth) {
    if (depth <= 1) return spWhite;
    if (depth === 2) return spCyan;
    return spAmber;
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
    ctx.lineJoin = "round";

    if (!spWhite) {
      spWhite = makeSprite([[0, "rgba(255,255,255,1)"], [0.16, "rgba(226,250,255,.85)"], [0.42, "rgba(120,220,255,.28)"], [1, "rgba(60,180,255,0)"]]);
      spCyan = makeSprite([[0, "rgba(240,255,255,.98)"], [0.18, "rgba(120,240,255,.8)"], [0.46, "rgba(40,190,220,.26)"], [1, "rgba(20,120,200,0)"]]);
      spAmber = makeSprite([[0, "rgba(255,246,232,.96)"], [0.18, "rgba(255,206,140,.78)"], [0.46, "rgba(230,140,60,.24)"], [1, "rgba(180,90,20,0)"]]);
      fx = document.createElement("canvas");
      fctx = fx.getContext("2d");
      fb = document.createElement("canvas");
      bctx = fb.getContext("2d");
    }
    fx.width = Math.max(2, Math.round(W * FS));
    fx.height = Math.max(2, Math.round(H * FS));
    fctx.setTransform(FS, 0, 0, FS, 0, 0);
    fctx.globalCompositeOperation = "lighter";
    fb.width = Math.max(2, Math.round(W * HS));
    fb.height = Math.max(2, Math.round(H * HS));
    bctx.setTransform(HS, 0, 0, HS, 0, 0);

    var k;
    for (k = 0; k < NODE_DEF.length; k++) {
      nx[k] = NODE_DEF[k][0] * W;
      ny[k] = NODE_DEF[k][1] * H;
    }

    out = [];
    for (k = 0; k < NODE_DEF.length; k++) out.push([]);

    var speed = W * 0.26;
    for (k = 0; k < EDGE_DEF.length; k++) {
      var a = EDGE_DEF[k][0], b = EDGE_DEF[k][1];
      egFrom[k] = a;
      egTo[k] = b;
      egDepth[k] = EDGE_DEF[k][2];
      out[a].push(k);
      var ax = nx[a], ay = ny[a], bx = nx[b], by = ny[b];
      var dx = bx - ax, dy = by - ay;
      var dist = Math.hypot(dx, dy) || 1;
      var px = -dy / dist, py = dx / dist;
      var bow = Math.min(dist * 0.16, W * 0.07) * (k % 2 === 0 ? 1 : -1);
      var c1x = ax + dx * 0.34 + px * bow, c1y = ay + dy * 0.34 + py * bow;
      var c2x = ax + dx * 0.68 + px * bow * 0.55, c2y = ay + dy * 0.68 + py * bow * 0.55;
      var base = k * SAMPLES * 2;
      var len = 0, lx = ax, ly = ay;      for (var s = 0; s < SAMPLES; s++) {
        var t = s / (SAMPLES - 1);
        var mt = 1 - t;
        var qx = mt * mt * mt * ax + 3 * mt * mt * t * c1x + 3 * mt * t * t * c2x + t * t * t * bx;
        var qy = mt * mt * mt * ay + 3 * mt * mt * t * c1y + 3 * mt * t * t * c2y + t * t * t * by;
        egPts[base + s * 2] = qx;
        egPts[base + s * 2 + 1] = qy;
        if (s > 0) len += Math.sqrt((qx - lx) * (qx - lx) + (qy - ly) * (qy - ly));
        lx = qx;
        ly = qy;
      }
      egDur[k] = len / speed;
    }

    if (outStrands) outStrands.textContent = EDGE_DEF.length.toString();
    if (outJunc) outJunc.textContent = "4";
  }

  function pointAt(e, t) {
    var base = e * SAMPLES * 2;
    var f = t * (SAMPLES - 1);
    var i0 = f | 0;
    if (i0 > SAMPLES - 2) i0 = SAMPLES - 2;
    if (i0 < 0) i0 = 0;
    var u = f - i0;
    var a = base + i0 * 2;
    tmp[0] = egPts[a] + (egPts[a + 2] - egPts[a]) * u;
    tmp[1] = egPts[a + 1] + (egPts[a + 3] - egPts[a + 1]) * u;
  }

  function spawn(edge, delay) {
    for (var k = 0; k < POOL; k++) {
      var p = pulses[k];
      if (p.on) continue;
      p.on = true;
      p.edge = edge;
      p.t = -delay;
      p.dur = egDur[edge] * (0.9 + rnd() * 0.2);
      p.depth = egDepth[edge];
      p.size = 0.8 + rnd() * 0.45;
      return;
    }
    return null;
  }

  function arrive(edge) {
    var node = egTo[edge];
    nodeGlow[node] = 1;
    var kids = out[node];
    if (!kids.length) return;
    for (var k = 0; k < kids.length; k++) spawn(kids[k], 0.05 * k);
  }

  function update(dt) {
    simTime += dt;
    rateNow += (rate - rateNow) * 0.08;
    emitAcc += dt * rateNow;
    var interval = 0.78;
    var guard = 0;
    while (emitAcc >= interval && guard < 4) {
      spawn(0, 0);
      emitAcc -= interval;
      guard++;
    }
    if (emitAcc > interval * 4) emitAcc = 0;

    activeCount = 0;
    for (var k = 0; k < POOL; k++) {
      var p = pulses[k];
      if (!p.on) continue;
      p.t += dt / p.dur;
      if (p.t >= 1) {
        p.on = false;
        arrive(p.edge);
      } else if (p.t > 0) {
        activeCount++;
      }
    }
    for (k = 0; k < NODE_DEF.length; k++) {
      nodeGlow[k] -= dt * 1.5;
      if (nodeGlow[k] < 0) nodeGlow[k] = 0;
    }
  }

  function strokeEdges(alpha, scale) {
    var lw = Math.max(1.4, Math.min(4.2, W * 0.0026)) * scale;
    ctx.strokeStyle = "rgba(16,26,40," + (0.9 * alpha).toFixed(3) + ")";
    ctx.lineWidth = lw * 1.9;
    var k, base;
    ctx.beginPath();
    for (k = 0; k < EDGE_DEF.length; k++) {
      base = k * SAMPLES * 2;
      ctx.moveTo(egPts[base], egPts[base + 1]);
      for (var s = 1; s < SAMPLES; s++) ctx.lineTo(egPts[base + s * 2], egPts[base + s * 2 + 1]);
    }
    ctx.stroke();
    ctx.strokeStyle = "rgba(150,205,240," + (0.2 * alpha).toFixed(3) + ")";
    ctx.lineWidth = lw * 0.7;
    ctx.stroke();
  }

  function drawNodes() {
    var k;
    for (k = 1; k < NODE_DEF.length; k++) {
      if (!isEnd[k]) continue;
      var er = Math.max(3, Math.min(8, W * 0.0045));
      ctx.beginPath();
      ctx.arc(nx[k], ny[k], er, 0, TAU);
      ctx.strokeStyle = "rgba(150,200,235,.34)";
      ctx.lineWidth = Math.max(1, er * 0.22);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(nx[k], ny[k], er * 0.44, 0, TAU);
      ctx.fillStyle = "rgba(10,16,26,.9)";
      ctx.fill();
    }
    for (k = 1; k < NODE_DEF.length; k++) {
      if (isEnd[k]) continue;
      var r = Math.max(2.2, Math.min(5.4, W * 0.0034));
      ctx.beginPath();
      ctx.moveTo(nx[k] - r, ny[k] - r);
      ctx.lineTo(nx[k] + r, ny[k] - r);
      ctx.lineTo(nx[k] + r, ny[k] + r);
      ctx.lineTo(nx[k] - r, ny[k] + r);
      ctx.closePath();
      ctx.fillStyle = "rgba(26,42,60,.95)";
      ctx.fill();
      ctx.strokeStyle = "rgba(140,200,235,.3)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  function drawMotes() {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    var k;
    for (k = 0; k < 22; k++) {
      var sp = 0.02 + ((k * 31) % 100) / 5200;
      var ph = simTime * sp + k * 1.7;
      var x = (0.05 + ((k * 43) % 100) / 108) * W + Math.sin(ph * 1.3) * W * 0.012;
      var y = (0.1 + ((k * 61) % 100) / 118) * H + Math.cos(ph) * H * 0.02;
      var sz = Math.max(1.2, W * 0.0022) * (1 + 0.6 * Math.sin(ph * 2.1));
      ctx.globalAlpha = 0.06 + 0.1 * (0.5 + 0.5 * Math.sin(ph * 3.1));
      ctx.drawImage(k % 4 === 0 ? spAmber : spCyan, x - sz, y - sz, sz * 2, sz * 2);
    }
    ctx.restore();
  }

  function render() {
    ctx.clearRect(0, 0, W, H);
    fctx.clearRect(0, 0, W, H);
    fctx.globalCompositeOperation = "lighter";

    strokeEdges(1, 1);
    drawNodes();

    var k;
    for (k = 1; k < NODE_DEF.length; k++) {
      var gl = nodeGlow[k];
      var sz = Math.max(6, W * 0.012) * (0.5 + gl * 1.4) * (isEnd[k] ? 1.5 : 1);
      var spr = isEnd[k] ? spAmber : spCyan;
      fctx.globalAlpha = 0.12 + gl * 0.7;
      fctx.drawImage(spr, nx[k] - sz, ny[k] - sz, sz * 2, sz * 2);
      if (isEnd[k] && gl > 0.02) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.fillStyle = "rgba(255,248,236," + (gl * 0.9).toFixed(3) + ")";
        ctx.beginPath();
        ctx.arc(nx[k], ny[k], 1.4 + gl * 2.6, 0, TAU);
        ctx.fill();
        ctx.restore();
      }
    }

    var srcX = W * 0.012, srcY = ny[1];
    var ssz = Math.max(10, W * 0.022);
    fctx.globalAlpha = 0.55 + 0.12 * Math.sin(simTime * 2.2);
    fctx.drawImage(spWhite, srcX - ssz, srcY - ssz, ssz * 2, ssz * 2);
    fctx.globalAlpha = 1;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = "rgba(240,252,255,.9)";
    ctx.beginPath();
    ctx.arc(srcX, srcY, 1.6, 0, TAU);
    ctx.fill();
    ctx.restore();

    var tail = 7;
    for (k = 0; k < POOL; k++) {
      var p = pulses[k];
      if (!p.on || p.t <= 0) continue;
      var spr2 = spriteFor(p.depth);
      var step = 0.016;
      var m;
      for (m = 0; m < tail; m++) {
        var tt = p.t - m * step;
        if (tt < 0) tt = 0;
        pointAt(p.edge, tt);
        var f = 1 - m / tail;
        var sz2 = Math.max(4, W * 0.011) * p.size * (0.25 + f * 0.95);
        fctx.globalAlpha = Math.pow(f, 1.7) * 0.85;
        fctx.drawImage(spr2, tmp[0] - sz2, tmp[1] - sz2, sz2 * 2, sz2 * 2);
      }
      pointAt(p.edge, p.t);
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = "rgba(255,255,255,.92)";
      ctx.beginPath();
      ctx.arc(tmp[0], tmp[1], Math.max(1.1, W * 0.0013) * p.size, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
    fctx.globalAlpha = 1;

    drawMotes();

    bctx.clearRect(0, 0, W, H);
    bctx.drawImage(fx, 0, 0, fx.width, fx.height, 0, 0, W, H);

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, H * FLOOR, W, H * (1 - FLOOR));
    ctx.clip();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.2;
    ctx.translate(0, H * FLOOR * 2);
    ctx.scale(1, -1);
    ctx.drawImage(fx, 0, 0, W, H);
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.55;
    ctx.drawImage(fx, 0, 0, W, H);
    ctx.globalAlpha = 0.5;
    ctx.drawImage(fb, 0, 0, W, H);
    ctx.restore();

    tickCount++;
    if (tickCount % 6 === 0) {
      if (outLive) outLive.textContent = activeCount.toString();
      if (outBar) outBar.style.transform = "scaleX(" + Math.min(1, activeCount / 34).toFixed(3) + ")";
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
    rateNow = rate;
    var k;
    for (k = 0; k < 260; k++) update(1 / 60);
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
      rate = Number.parseFloat(btn.dataset.rate) || 1;
    });
  });

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
