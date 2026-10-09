(function () {
  var ground = document.getElementById("ground");
  var platesBox = document.getElementById("plates");
  var wv = document.getElementById("wv");
  var ringLayer = document.getElementById("rl");
  var puffBox = document.getElementById("puffs");
  var post = document.getElementById("post");
  var btn = document.getElementById("btn");
  var needle = document.getElementById("needle");
  var bearingEl = document.getElementById("bearing");
  var wavesEl = document.getElementById("waves");
  var platesEl = document.getElementById("platesn");
  var charge = document.getElementById("charge");
  var rd = document.getElementById("rd");
  var lamp = document.getElementById("lamp");
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var NS = "http://www.w3.org/2000/svg";
  var RINGS = 4;
  var PUFFS = 40;
  var ROWS = 26;
  var COLS = 22;
  var COMP = 0.5;
  var rings = [];
  var puffs = [];
  var plates = [];
  var gw = 0;
  var gh = 0;
  var cx = 0;
  var cy = 0;
  var rMax = 1;
  var pIdx = 0;
  var rIdx = 0;
  var waves = 0;
  var last = 0;
  var chargeV = 0;
  var rdTimer = 0;
  var bearings = [0, 90, 180, 270, 315, 225, 0, 180, 90, 270];

  function el(name, cls) {
    var e = document.createElementNS(NS, name);
    e.setAttribute("class", cls);
    return e;
  }

  function makeRing() {
    var g = el("g", "ring");
    var flat = el("g", "rflat");
    flat.appendChild(el("circle", "ring__halo")).setAttribute("r", "1");
    flat.appendChild(el("circle", "ring__dust")).setAttribute("r", "1");
    flat.appendChild(el("circle", "ring__body")).setAttribute("r", "1");
    flat.appendChild(el("circle", "ring__front")).setAttribute("r", "1");
    var head = el("circle", "ring__head");
    head.setAttribute("r", "1");
    flat.appendChild(head);
    var blob = el("g", "rblob");
    blob.appendChild(el("circle", "blob-a")).setAttribute("r", "1");
    blob.appendChild(el("circle", "blob-b")).setAttribute("r", "1");
    g.appendChild(flat);
    g.appendChild(blob);
    ringLayer.appendChild(g);
    return { g: g, flat: flat, head: head, blob: blob, r: 0, t: 0, dur: 2, amp: 0, vx: 1, vy: 0, bear: 0, on: false, band: 40 };
  }

  function makePuff() {
    var d = document.createElement("div");
    d.className = "pf";
    puffBox.appendChild(d);
    return { el: d, x: 0, y: 0, vx: 0, vy: 0, t: 0, dur: 1, s: 1, on: false };
  }

  function build() {
    gw = ground.offsetWidth;
    gh = ground.offsetHeight;
    wv.setAttribute("viewBox", "0 0 " + gw + " " + gh);
    var b = 3.1;
    var uMax = gh * 1.16;
    var r = Math.pow(b / uMax, 1 / (ROWS - 1));
    var u = [];
    var k;
    for (k = 0; k < ROWS; k++) {
      u.push(b * Math.pow(r, -k));
    }
    u.push(uMax);
    var base = Math.max(46, Math.min(94, gw / 15));
    var W0 = base / uMax;
    var half = COLS / 2;
    var frag = document.createDocumentFragment();
    plates = [];
    for (k = 0; k < ROWS; k++) {
      var y0 = u[k];
      var y1 = u[k + 1];
      var hh = y1 - y0;
      if (hh < 1.3) continue;
      var wTop = W0 * y0;
      if (wTop < 1.1) continue;
      var ox = (gw / 2 - half * wTop - wTop / 2) / y0;
      var fade = Math.min(1, Math.max(0, (y0 - 3) / 15));
      for (var j = 0; j < COLS; j++) {
        var X0 = (j - half) * W0;
        var tL = gw / 2 + X0 * y0;
        var tR = tL + wTop;
        var bL = gw / 2 + X0 * y1;
        var bR = bL + wTop * (y1 / y0);
        var minX = Math.min(tL, tR, bL, bR);
        var maxX = Math.max(tL, tR, bL, bR);
        if (maxX < -12 || minX > gw + 12) continue;
        var jx = Math.min(1.3, wTop * 0.16);
        var jy = Math.min(0.6, hh * 0.16);
        var d = document.createElement("div");
        d.className = "pl";
        d.style.width = (maxX - minX).toFixed(1) + "px";
        d.style.height = hh.toFixed(1) + "px";
        d.style.clipPath = "polygon(" + (tL - minX + jx).toFixed(2) + "px " + jy.toFixed(2) + "px," + (tR - minX - jx).toFixed(2) + "px " + jy.toFixed(2) + "px," + (bR - minX - jx).toFixed(2) + "px " + (hh - jy).toFixed(2) + "px," + (bL - minX + jx).toFixed(2) + "px " + (hh - jy).toFixed(2) + "px)";
        d.style.opacity = fade.toFixed(2);
        d.style.transform = "translate(" + minX.toFixed(1) + "px," + y0.toFixed(1) + "px)";
        d.style.setProperty("--ox", ox.toFixed(4));
        var scr = document.createElement("i");
        d.appendChild(scr);
        d.appendChild(document.createElement("u"));
        frag.appendChild(d);
        plates.push({ el: d, x: (tL + tR + bL + bR) / 4, y: y0 + hh / 2, dx: 0, dy: 0, rot: 0, ox: ox, crack: 0, flash: 0, base: minX, top: y0 });
      }
    }
    platesBox.textContent = "";
    platesBox.appendChild(frag);
    platesEl.textContent = String(plates.length);
    cx = gw / 2;
    cy = post.offsetTop;
    var far = Math.max(gw * 0.62, cy * 2.2, (gh - cy) * 2.1);
    rMax = far * 1.5;
  }

  function fire() {
    var R = rings[rIdx];
    rIdx = (rIdx + 1) % rings.length;
    var a = (bearings[waves % bearings.length] + (Math.random() * 18 - 9)) * Math.PI / 180;
    R.r = 4;
    R.t = 0;
    R.dur = 1.85 + Math.random() * 0.45;
    R.amp = 15;
    R.bear = a * 180 / Math.PI;
    R.vx = Math.cos(a);
    R.vy = Math.sin(a) / COMP;
    R.band = 46;
    R.on = true;
    R.g.style.display = "block";
    R.g.style.opacity = "1";
    waves++;
    wavesEl.textContent = String(waves);
    chargeV = 1;
    needle.style.transform = "rotate(" + (R.bear + 180).toFixed(0) + "deg)";
    bearingEl.textContent = String(Math.round((R.bear + 360) % 360)).slice(0, 3) + "\u00b0";
    rd.textContent = "FIRE";
    rd.style.color = "#ffb27a";
    lamp.style.background = "#ff5a4a";
    lamp.style.boxShadow = "0 0 8px 2px rgba(255,90,74,.9)";
    clearTimeout(rdTimer);
    rdTimer = setTimeout(function () {
      rd.textContent = "RDY";
      rd.style.color = "";
      lamp.style.background = "";
      lamp.style.boxShadow = "";
    }, 880);
  }

  function spawn(x, y, vx, vy, s) {
    var P = puffs[pIdx];
    pIdx = (pIdx + 1) % puffs.length;
    P.x = x;
    P.y = y;
    P.vx = vx;
    P.vy = vy;
    P.t = 0;
    P.dur = s;
    P.s = 0.5 + Math.random() * 1.1;
    P.on = true;
    P.el.style.display = "block";
    P.el.style.opacity = "0.5";
    P.el.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px) scale(0.2)";
  }

  function impact() {
    var budget = 5;
    for (var R of rings) {
      if (!R.on) continue;
      for (var p of plates) {
        var ux = p.x + p.dx - cx;
        var uy = (p.y + p.dy - cy) / COMP;
        var d = Math.hypot(ux, uy);
        var diff = Math.abs(d - R.r);
        if (diff >= R.band) continue;
        var f = 1 - diff / R.band;
        var nx = ux / (d || 1);
        var ny = uy / (d || 1);
        var dot = nx * R.vx + ny * R.vy;
        var lobe = 0.24 + 0.76 * (Math.max(dot, 0));
        lobe *= lobe;
        var imp = f * f * R.amp * lobe;
        p.dx += nx * imp;
        p.dy += ny * imp * COMP;
        p.rot += (Math.random() - 0.5) * imp * 1.1;
        if (f > 0.45) {
          p.flash = Math.min(1, p.flash + f * 0.8);
          if (!p.crack && imp > 1.5) {
            p.crack = 1;
            p.el.className = "pl ck";
          }
        }
        if (budget > 0 && imp > 2.2 && Math.random() < 0.3) {
          budget--;
          spawn(p.x, p.y, nx * (30 + Math.random() * 70), ny * (14 + Math.random() * 30) * COMP, 0.55 + Math.random() * 0.5);
        }
      }
    }
  }

  function settle(dt) {
    var k = Math.pow(0.0022, dt);
    var kr = Math.pow(0.0006, dt);
    for (var p of plates) {
      if (p.dx !== 0 || p.dy !== 0 || p.rot !== 0) {
        p.dx *= k;
        p.dy *= k;
        p.rot *= kr;
        var nx = p.base + p.dx * p.ox;
        var ny = p.top + p.dy + p.rot * 0.22;
        if (Math.abs(p.dx) < 0.07 && Math.abs(p.dy) < 0.07 && Math.abs(p.rot) < 0.06) {
          p.dx = 0;
          p.dy = 0;
          p.rot = 0;
          nx = p.base;
          ny = p.top;
        }
        p.el.style.transform = "translate(" + nx.toFixed(2) + "px," + ny.toFixed(2) + "px)";
      }
      if (p.flash > 0) {
        p.flash *= Math.pow(0.0004, dt);
        if (p.flash < 0.015) p.flash = 0;
        p.el.style.setProperty("--f", p.flash.toFixed(3));
      }
    }
  }

  function drift(dt) {
    for (var P of puffs) {
      if (!P.on) continue;
      P.t += dt;
      var q = P.t / P.dur;
      if (q >= 1) {
        P.on = false;
        P.el.style.display = "none";
        continue;
      }
      P.x += P.vx * dt;
      P.y += P.vy * dt;
      P.vx *= Math.pow(0.3, dt);
      P.vy *= Math.pow(0.3, dt);
      var e = 1 - Math.pow(1 - q, 2.4);
      var sc = (0.22 + 1.9 * e) * P.s;
      P.el.style.transform = "translate(" + P.x.toFixed(1) + "px," + P.y.toFixed(1) + "px) scale(" + sc.toFixed(3) + ")";
      P.el.style.opacity = (0.5 * Math.pow(1 - q, 1.7)).toFixed(3);
    }
  }

  function frame(now) {
    var dt = (now - last) / 1000;
    if (!(dt > 0)) dt = 0.016;
    if (dt > 0.06) dt = 0.06;
    last = now;
    var live = 0;
    for (var R of rings) {
      if (!R.on) continue;
      R.t += dt;
      var q = Math.min(1, R.t / R.dur);
      R.r = 5 + rMax * (1 - Math.pow(1 - q, 2.4));
      R.amp = 17 * Math.pow(1 - q, 1.5) + 2;
      var ry = R.r * (COMP + 0.15 * q);
      R.flat.setAttribute("transform", "translate(" + cx + " " + cy + ") scale(" + R.r.toFixed(1) + "," + ry.toFixed(1) + ")");
      var perim = Math.PI * (3 * (R.r + ry) - Math.sqrt((3 * R.r + ry) * (R.r + 3 * ry)));
      R.head.setAttribute("stroke-dashoffset", (-perim * R.bear * 0.0174533).toFixed(1));
      var th = R.bear * 0.0174533;
      R.blob.setAttribute("transform", "translate(" + (cx + R.r * Math.cos(th)).toFixed(1) + "," + (cy + ry * Math.sin(th)).toFixed(1) + ")");
      R.g.style.opacity = (1 - q * q).toFixed(3);
      if (q >= 1) {
        R.on = false;
        R.g.style.display = "none";
      } else {
        live++;
      }
    }
    if (live) impact();
    settle(dt);
    drift(dt);
    if (chargeV > 0) {
      chargeV = Math.max(0.3, chargeV - dt * 0.2);
      charge.style.transform = "scaleX(" + chargeV.toFixed(3) + ")";
    }
    requestAnimationFrame(frame);
  }

  for (var i = 0; i < RINGS; i++) rings.push(makeRing());
  for (var j = 0; j < PUFFS; j++) puffs.push(makePuff());

  btn.addEventListener("pointerdown", function (e) {
    e.preventDefault();
    btn.classList.add("is-hit");
  });
  var release = function () {
    btn.classList.remove("is-hit");
  };
  btn.addEventListener("pointerup", release);
  btn.addEventListener("pointerleave", release);
  btn.addEventListener("pointercancel", release);
  btn.addEventListener("click", fire);
  window.addEventListener("keydown", function (e) {
    if (e.key === " " || e.key === "Enter") fire();
  });

  var rt = 0;
  window.addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(build, 150);
  });

  build();
  if (calm) {
    charge.style.transform = "scaleX(0.62)";
    needle.style.transform = "rotate(38deg)";
  } else {
    requestAnimationFrame(function (t) {
      last = t;
      requestAnimationFrame(frame);
    });
    setTimeout(fire, 1100);
    setTimeout(fire, 3100);
  }
})();
