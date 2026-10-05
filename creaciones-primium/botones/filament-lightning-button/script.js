(function () {
  "use strict";
  var btn = document.getElementById("arc");
  if (!btn) return;
  var whip = document.getElementById("whip");
  var ghost = document.getElementById("ghost");
  var head = document.getElementById("head");
  var halo = document.getElementById("halo");
  var fill = document.getElementById("fill");
  var fx = document.getElementById("fx");
  var SEGS = 11, GSEG = 8, SEGW = 20;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function rnd(a, b) { return a + Math.random() * (b - a); }
  function clamp(v, a, b) {
    if (v < a) return a;
    if (v > b) return b;
    return v;
  }

  var seg = [], gseg = [], i;
  for (i = 0; i < SEGS; i++) {
    var nd = document.createElement("i");
    nd.className = "w";
    nd.style.width = SEGW + "px";
    whip.appendChild(nd);
    seg.push(nd);
  }
  for (i = 0; i < GSEG; i++) {
    var gn = document.createElement("i");
    gn.className = "gw";
    gn.style.width = SEGW + "px";
    ghost.appendChild(gn);
    gseg.push(gn);
  }

  var SPK = 16;
  var sparks = [];
  for (i = 0; i < SPK; i++) {
    var sp = document.createElement("i");
    sp.className = "fl-s";
    fx.appendChild(sp);
    sparks.push({ n: sp, on: false, t: 0, life: 1, x: 0, y: 0, dx: 0, dy: 0, z: 1 });
  }
  var bolts = [];
  for (i = 0; i < 3; i++) {
    var bo = document.createElement("i");
    bo.className = "fl-b";
    fx.appendChild(bo);
    bolts.push({ n: bo, on: false, t: 0, a: 0 });
  }
  var ooze = [];
  for (i = 0; i < 2; i++) {
    var oz = document.createElement("i");
    oz.className = "fl-o";
    fx.appendChild(oz);
    ooze.push({ n: oz, on: false, t: 0 });
  }
  var stains = [];
  for (i = 0; i < 3; i++) {
    var st = document.createElement("i");
    st.className = "fl-t";
    fx.appendChild(st);
    stains.push({ n: st, on: false, t: 0, life: 1, x: 0, y: 0 });
  }

  var hw = 220, hh = 44, r = null, rt = -1e9;
  var ptr = { x: 0, y: 0, t: -1e9, on: false };
  var wave = 0.9, orbit = 1.24, charge = 0.3, bend = 0;
  var hx = 60, hy = 0, gx = 60, gy = 0, live = false;
  var MIN = 62, MAX = 200;

  function measure(now) {
    if (r && now - rt < 500) return r;
    r = btn.getBoundingClientRect();
    rt = now;
    if (r.width) {
      hw = r.width / 2;
      hh = r.height / 2;
      MIN = clamp(r.width * 0.13, 40, 104);
      MAX = clamp(r.width * 0.4, 96, 260);
    }
    return r;
  }

  function ripple(nodes, n, bx, by, ph, off, amp) {
    var i, s0, s1, x0, y0, x1, y1, ex, ey, a, len, w0, w1;
    var D = Math.hypot(bx, by) || 1;
    var nx = -by / D, ny = bx / D;
    var k = amp * D;
    for (i = 0; i < n; i++) {
      s0 = i / n;
      s1 = (i + 1) / n;
      w0 = Math.sin(Math.PI * s0) * Math.sin(ph - 5.4 * s0 + off);
      w1 = Math.sin(Math.PI * s1) * Math.sin(ph - 5.4 * s1 + off);
      x0 = bx * s0 + nx * k * w0;
      y0 = by * s0 + ny * k * w0;
      x1 = bx * s1 + nx * k * w1;
      y1 = by * s1 + ny * k * w1;
      ex = x1 - x0;
      ey = y1 - y0;
      a = Math.atan2(ey, ex);
      len = Math.hypot(ex, ey);
      nodes[i].style.transform = "translate3d(" + x0.toFixed(2) + "px," + y0.toFixed(2) + "px,0) rotate(" + a.toFixed(4) + "rad) scaleX(" + clamp(len / SEGW, 0.12, 1.7).toFixed(3) + ")";
      if (i === (n >> 1)) bend = a;
    }
  }

  function contact(e) {
    var rect = measure(performance.now());
    var lx = e.clientX - rect.left - hw;
    var ly = e.clientY - rect.top - hh;
    var m = Math.max(Math.abs(lx) / (hw - 8), Math.abs(ly) / (hh - 6));
    if (m > 1) { lx /= m; ly /= m; }
    return { x: lx, y: ly };
  }

  function strike(pt) {
    var k, s, bo, oz, st;
    for (k = 0; k < SPK; k++) {
      s = sparks[(gi + k) % SPK];
      var a = rnd(-Math.PI, Math.PI);
      var d = rnd(20, 66);
      s.on = true; s.t = 0; s.life = rnd(0.5, 0.95);
      s.x = pt.x; s.y = pt.y;
      s.dx = Math.cos(a) * d;
      s.dy = Math.sin(a) * d;
      s.z = rnd(1.1, 1.9);
      s.n.style.transform = "translate3d(" + pt.x.toFixed(1) + "px," + pt.y.toFixed(1) + "px,0)";
    }
    gi = (gi + SPK) % SPK;
    for (k = 0; k < 2; k++) {
      bo = bolts[k];
      bo.on = true; bo.t = 0;
      bo.a = rnd(-Math.PI, Math.PI);
      bo.n.style.transform = "translate3d(" + pt.x.toFixed(1) + "px," + pt.y.toFixed(1) + "px,0) rotate(" + bo.a.toFixed(3) + "rad) scaleY(.06)";
      bo.n.style.opacity = "0";
    }
    for (k = 0; k < 2; k++) {
      oz = ooze[k];
      oz.on = true; oz.t = -k * 0.07;
      oz.n.style.transform = "translate3d(" + pt.x.toFixed(1) + "px," + pt.y.toFixed(1) + "px,0) scale(.1)";
      oz.n.style.opacity = "0";
    }
    for (k = 0; k < 3; k++) {
      st = stains[k];
      st.on = true; st.t = -k * 0.16; st.life = rnd(1.5, 2.4);
      st.x = pt.x; st.y = pt.y;
      st.n.style.transform = "translate3d(" + pt.x.toFixed(1) + "px," + pt.y.toFixed(1) + "px,0) scale(.2)";
      st.n.style.opacity = "0";
    }
    charge = 1;
    btn.classList.add("is-hit");
    window.clearTimeout(strike.tid);
    strike.tid = window.setTimeout(function () { btn.classList.remove("is-hit"); }, 190);
  }

  var gi = 0;
  btn.addEventListener("pointerdown", function (e) {
    if (btn.disabled) return;
    strike(contact(e));
  });
  btn.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " ") return;
    strike({ x: rnd(-hw * 0.5, hw * 0.5), y: rnd(-hh * 0.3, hh * 0.3) });
  });
  window.addEventListener("pointermove", function (e) {
    ptr.x = e.clientX;
    ptr.y = e.clientY;
    ptr.t = performance.now();
    ptr.on = true;
  }, { passive: true });

  function draw(now, dt) {
    var rect = measure(now);
    if (!rect || !rect.width) return;
    var tx, ty, hot = ptr.on && now - ptr.t < 2600;
    if (hot) {
      var dx = ptr.x - (rect.left + hw);
      var dy = ptr.y - (rect.top + hh);
      var m = Math.max(Math.abs(dx) / (hw - 6), Math.abs(dy) / (hh - 4));
      if (m > 1) { dx /= m; dy /= m; }
      tx = dx; ty = dy;
      if (Math.abs(tx) < 1 && Math.abs(ty) < 1) { tx = 1; ty = 0; }
    } else {
      orbit += dt * 0.00092;
      var rx = Math.min(hw * 0.68, MAX * 0.78);
      var ry = Math.min(hh * 0.66, MAX * 0.3);
      tx = Math.sin(orbit) * rx;
      ty = -Math.cos(orbit) * ry;
    }
    var d = Math.hypot(tx, ty);
    if (d < 0.001) { tx = 1; ty = 0; d = 1; }
    var dd = clamp(d, MIN, MAX);
    var ux = tx / d, uy = ty / d;
    tx = ux * dd;
    ty = uy * dd;

    var k1 = 1 - Math.exp(-dt / 26);
    var k2 = 1 - Math.exp(-dt / 62);
    hx += (tx - hx) * k1;
    hy += (ty - hy) * k1;
    gx += (tx - gx) * k2;
    gy += (ty - gy) * k2;
    wave += dt * 0.0042;

    ripple(seg, SEGS, hx, hy, wave, 0, 0.19);
    ripple(gseg, GSEG, gx, gy, wave - 1.15, 0, 0.26);

    head.style.transform = "translate3d(" + hx.toFixed(2) + "px," + hy.toFixed(2) + "px,0)";
    halo.style.transform = "translate3d(" + hx.toFixed(2) + "px," + hy.toFixed(2) + "px,0) scale(" + (hot ? 1.05 : 0.84).toFixed(2) + ")";
    if (hot !== live) {
      live = hot;
      if (hot) btn.classList.add("is-live"); else btn.classList.remove("is-live");
    }

    charge *= Math.exp(-dt / 380);
    var want = clamp(0.3 + Math.abs(bend) * 0.5 + charge * 0.45 + (hot ? 0.22 : 0), 0.12, 1);
    fill.style.transform = "scaleX(" + want.toFixed(3) + ")";

    for (var p = 0; p < SPK; p++) {
      var s2 = sparks[p];
      if (!s2.on) continue;
      s2.t += dt;
      var u = s2.t / (s2.life * 1000);
      if (u >= 1) { s2.on = false; s2.n.style.opacity = "0"; continue; }
      var e2 = 1 - Math.pow(1 - u, 2.4);
      s2.n.style.opacity = (1 - u * u).toFixed(3);
      s2.n.style.transform = "translate3d(" + (s2.x + s2.dx * e2).toFixed(1) + "px," + (s2.y + s2.dy * e2 * 0.86 + 16 * u * u).toFixed(1) + "px,0) scale(" + (s2.z * (1 - u * 0.8)).toFixed(2) + ")";
    }
    for (var bo2 of bolts) {
      if (!bo2.on) continue;
      bo2.t += dt;
      var bu = bo2.t / 430;
      if (bu >= 1) { bo2.on = false; bo2.n.style.opacity = "0"; continue; }
      var sy2 = 0.92 + (bu - 0.42) * 0.3;
      if (bu < 0.16) sy2 = bu / 0.16 * 1.12;
      else if (bu < 0.42) sy2 = 1.12 - (bu - 0.16) / 0.26 * 0.2;
      bo2.n.style.opacity = (bu < 0.1 ? bu / 0.1 : 1 - Math.pow((bu - 0.1) / 0.9, 1.6)).toFixed(3);
      bo2.n.style.transform = "translate3d(0,0,0) rotate(" + bo2.a.toFixed(3) + "rad) scaleY(" + sy2.toFixed(3) + ")";
    }
    for (var oz2 of ooze) {
      if (!oz2.on) continue;
      oz2.t += dt;
      if (oz2.t < 0) continue;
      var ou = oz2.t / 640;
      if (ou >= 1) { oz2.on = false; oz2.n.style.opacity = "0"; continue; }
      var os = ou < 0.14 ? 0.1 + ou / 0.14 * 0.62 : 0.72 + (ou - 0.14) / 0.86 * 0.46;
      oz2.n.style.opacity = (ou < 0.12 ? ou / 0.12 : 1 - Math.pow((ou - 0.12) / 0.88, 1.7)).toFixed(3);
      oz2.n.style.transform = "translate3d(0,0,0) scale(" + os.toFixed(3) + ")";
    }
    for (var st2 of stains) {
      if (!st2.on) continue;
      st2.t += dt;
      if (st2.t < 0) continue;
      var tu = st2.t / (st2.life * 1000);
      if (tu >= 1) { st2.on = false; st2.n.style.opacity = "0"; continue; }
      var ts = tu < 0.12 ? 0.2 + tu / 0.12 * 0.8 : 1 + (tu - 0.12) * 0.3;
      st2.n.style.opacity = (tu < 0.1 ? tu / 0.1 * 0.9 : 0.9 * (1 - (tu - 0.1) / 0.9)).toFixed(3);
      st2.n.style.transform = "translate3d(" + st2.x.toFixed(1) + "px," + st2.y.toFixed(1) + "px,0) scale(" + ts.toFixed(3) + ")";
    }
  }

  function rest() {
    measure(performance.now());
    hx = MIN * 0.86;
    hy = -hh * 0.2;
    gx = hx; gy = hy;
    ripple(seg, SEGS, hx, hy, 1.1, 0, 0.14);
    ripple(gseg, GSEG, gx, gy, 1.1, 0, 0.2);
    head.style.transform = "translate3d(" + hx.toFixed(2) + "px," + hy.toFixed(2) + "px,0)";
    halo.style.transform = "translate3d(" + hx.toFixed(2) + "px," + hy.toFixed(2) + "px,0) scale(.88)";
    fill.style.transform = "scaleX(.7)";
  }

  if (reduce) {
    rest();
    return;
  }

  var prev = 0;
  function frame(ts) {
    var now = performance.now();
    var dt = prev ? Math.min(60, ts - prev) : 16;
    prev = ts;
    draw(now, dt);
    window.requestAnimationFrame(frame);
  }
  window.addEventListener("resize", function () { r = null; });
  draw(performance.now(), 4000);
  window.requestAnimationFrame(frame);
})();
