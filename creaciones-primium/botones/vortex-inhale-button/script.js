(function () {
  var cv = document.getElementById("cv");
  var ctx = cv.getContext("2d");
  var valve = document.getElementById("valve");
  var well = document.getElementById("well");
  var st = document.getElementById("st");
  var thr = document.getElementById("thr");
  var npEl = document.getElementById("np");
  var nr = document.getElementById("nr");
  var bar = document.getElementById("bar");
  var k1 = document.getElementById("k1");
  var k2 = document.getElementById("k2");
  var f1 = document.getElementById("f1");
  var f1cap = document.getElementById("f1cap");
  var f1fill = document.getElementById("f1fill");
  var v1 = document.getElementById("v1");
  var v2 = document.getElementById("v2");
  var v3 = document.getElementById("v3");
  var sw1 = document.getElementById("sw1");
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var MAX = 460;
  var ang = new Float32Array(MAX);
  var rad = new Float32Array(MAX);
  var arm = new Float32Array(MAX);
  var jit = new Float32Array(MAX);
  var sz = new Float32Array(MAX);
  var live = 0;
  var want = 220;
  var W = 0;
  var H = 0;
  var dpr = 1;

  var spin = 0.62;
  var load = 0.48;
  var intake = 0.55;
  var auto = true;
  var phase = 0;
  var base = 0;
  var mode = "in";
  var mt = 0;
  var ramps = 0;
  var fl = 0;
  var throat = 2.4;
  var last = 0;
  var tA = 0;
  var tB = 0;
  var gGlow = null;
  var gCore = null;

  function size() {
    var r = cv.getBoundingClientRect();
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = Math.max(80, Math.round(r.width));
    H = Math.max(80, Math.round(r.height));
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var R = Math.min(W, H) * 0.5;
    gGlow = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, R);
    gGlow.addColorStop(0, "rgba(214,250,255,1)");
    gGlow.addColorStop(0.16, "rgba(96,214,255,0.7)");
    gGlow.addColorStop(0.44, "rgba(46,150,214,0.3)");
    gGlow.addColorStop(1, "rgba(20,80,140,0)");
    gCore = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, R * 0.16);
    gCore.addColorStop(0, "rgba(255,255,255,1)");
    gCore.addColorStop(0.4, "rgba(150,240,255,0.55)");
    gCore.addColorStop(1, "rgba(60,170,240,0)");
  }

  function seed(n) {
    var R = Math.min(W, H) * 0.5;
    var rInt = R * (0.52 + 0.44 * intake);
    live = n;
    want = n;
    for (var i = 0; i < MAX; i++) {
      var a = (i % 3) * (Math.PI * 2 / 3) + base;
      arm[i] = i % 3;
      jit[i] = Math.random();
      sz[i] = 0.7 + Math.random() * 1.5;
      if (i < n) {
        ang[i] = a + (Math.random() - 0.5) * 0.5;
        rad[i] = rInt * (0.06 + 0.94 * Math.random());
      }
    }
  }

  function setKnob(el, val) {
    var b = el.querySelector(".knob__body");
    b.style.transform = "rotate(" + (-135 + val * 270).toFixed(1) + "deg)";
  }

  function sync() {
    setKnob(k1, spin);
    setKnob(k2, load);
    v1.textContent = String(Math.round(spin * 100));
    v2.textContent = String(Math.round(load * 100));
    v3.textContent = String(Math.round(intake * 100));
    var pct = 6 + intake * 88;
    f1cap.style.bottom = pct.toFixed(1) + "%";
    f1fill.style.transform = "translateX(-50%) scaleY(" + (0.06 + intake * 0.88).toFixed(3) + ")";
    bar.style.transform = "scaleX(" + (0.1 + load * 0.9).toFixed(3) + ")";
    want = Math.round(70 + load * 380);
    if (mode === "in" && live < want) {
      var R = Math.min(W, H) * 0.5;
      var rInt = R * (0.52 + 0.44 * intake);
      for (var i = live; i < want; i++) {
        arm[i] = i % 3;
        jit[i] = Math.random();
        sz[i] = 0.7 + Math.random() * 1.5;
        ang[i] = (i % 3) * (Math.PI * 2 / 3) + base + (Math.random() - 0.5) * 0.5;
        rad[i] = rInt;
      }
      live = want;
    }
    npEl.textContent = String(live);
  }

  function press() {
    mode = "slam";
    mt = 0;
    fl = 1;
    ramps++;
    nr.textContent = String(ramps);
    st.textContent = "SLAM";
    st.className = "hot";
    valve.classList.add("is-hit");
    well.classList.remove("is-in", "is-ex", "is-slam");
    well.getBoundingClientRect();
    well.classList.add("is-slam");
    clearTimeout(tA);
    clearTimeout(tB);
    tA = setTimeout(function () {
      well.classList.remove("is-slam");
      well.classList.add("is-ex");
      st.textContent = "EXHALING";
      st.className = "warn";
    }, 520);
    tB = setTimeout(function () {
      well.classList.remove("is-ex");
      well.classList.add("is-in");
      st.textContent = "INHALING";
      st.className = "ok";
    }, 2960);
  }

  function drag(el, apply) {
    var start = null;
    el.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      el.setPointerCapture(e.pointerId);
      start = { y: e.clientY, v: apply.get() };
    });
    el.addEventListener("pointermove", function (e) {
      if (!start) return;
      var d = (start.y - e.clientY) / (el === f1 ? 150 : 130);
      apply.set(Math.max(0, Math.min(1, start.v + d)));
      sync();
    });
    var end = function () {
      start = null;
    };
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);
    el.addEventListener("keydown", function (e) {
      var d = 0;
      if (e.key === "ArrowUp" || e.key === "ArrowRight") d = 0.05;
      else if (e.key === "ArrowDown" || e.key === "ArrowLeft") d = -0.05;
      if (!d) return;
      e.preventDefault();
      apply.set(Math.max(0, Math.min(1, apply.get() + d)));
      sync();
    });
  }

  drag(k1, { get: function () { return spin; }, set: function (v) { spin = v; } });
  drag(k2, { get: function () { return load; }, set: function (v) { load = v; } });
  drag(f1, { get: function () { return intake; }, set: function (v) { intake = v; } });

  sw1.addEventListener("click", function () {
    auto = !auto;
    sw1.classList.toggle("is-on", auto);
  });
  sw1.classList.toggle("is-on", auto);
  sw1.tabIndex = 0;
  sw1.addEventListener("keydown", function (e) {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      sw1.click();
    }
  });

  valve.addEventListener("pointerdown", function (e) {
    e.preventDefault();
    valve.classList.add("is-hit");
  });
  var rel = function () {
    valve.classList.remove("is-hit");
  };
  valve.addEventListener("pointerup", rel);
  valve.addEventListener("pointerleave", rel);
  valve.addEventListener("pointercancel", rel);
  valve.addEventListener("click", press);
  window.addEventListener("keydown", function (e) {
    if (e.key === " " || e.key === "Enter") press();
  });

  function draw() {
    var R = Math.min(W, H) * 0.5;
    var cx = W / 2;
    var cy = H / 2;
    var comp = 0.4;
    var rInt = R * (0.52 + 0.44 * intake) * (0.4 + 0.6 * throat);
    var rOut = R * 1.02;
    var breath = 1 + 0.05 * Math.sin(phase * 2.2);
    // Ternario simplificado: tanto "slam" como el resto de modos dan 0.
    var exh = mode === "ex" ? Math.min(1, mt / 2.4) : 0;
    var dim = 1 - exh * 0.85;
    var i, a, rr, x, y;
    var arms = 3;
    var wind = (0.5 + 3.4 * spin) * (mode === "ex" ? 1 - exh * 0.85 : 1);

    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";

    ctx.globalAlpha = Math.max(0, Math.min(1, 0.5 * dim * breath));
    ctx.fillStyle = gGlow;
    ctx.beginPath();
    ctx.ellipse(cx, cy, R, R * comp, 0, 0, 6.2832);
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.lineWidth = 1;
    for (i = 7; i >= 1; i--) {
      var v = i / 7;
      ctx.strokeStyle = "rgba(120,170,210," + (0.03 + 0.05 * (1 - v)).toFixed(3) + ")";
      ctx.beginPath();
      ctx.ellipse(cx, cy, R * (0.52 + 0.46 * v), R * (0.52 + 0.46 * v), 0, 0, 6.2832);
      ctx.stroke();
    }
    for (i = 14; i >= 1; i--) {
      var q = i / 14;
      rr = (rInt * q + R * 0.04) * breath;
      ctx.strokeStyle = "rgba(96,206,255," + (0.05 + 0.16 * (1 - q) * (1 - q)).toFixed(3) + ")";
      ctx.beginPath();
      ctx.ellipse(cx, cy, rr, rr * comp, 0, 0, 6.2832);
      ctx.stroke();
    }

    // Ternario simplificado: las dos ramas devolvian 1.
    var dir = 1;
    for (var k = 0; k < arms; k++) {
      for (var pass = 0; pass < 2; pass++) {
        ctx.beginPath();
        for (i = 0; i <= 54; i++) {
          var t = i / 54;
          var rr2 = (rInt * Math.pow(1 - t, 0.78) + R * 0.045) * breath;
          var th = t * 8.4;
          a = (k / arms) * 6.2832 + base * (0.35 + 1.5 * t) + th * dir;
          x = cx + Math.cos(a) * rr2;
          y = cy + Math.sin(a) * rr2 * comp;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = pass === 0 ? "rgba(74,186,246," + (0.2 * dim).toFixed(3) + ")" : "rgba(214,250,255," + (0.5 * dim).toFixed(3) + ")";
        ctx.lineWidth = pass === 0 ? 5 : 1.4;
        ctx.stroke();
      }
    }

    ctx.lineCap = "round";
    for (i = 0; i < live; i++) {
      rr = rad[i];
      a = ang[i];
      var pa = a - (0.9 + 2.4 * (1 - Math.max(0, Math.min(1, rr / (rInt + 0.001))))) * wind * 0.028;
      x = cx + Math.cos(a) * rr;
      y = cy + Math.sin(a) * rr * comp;
      var fade = rr > rOut ? Math.max(0, 1 - (rr - rOut) / (R * 0.55)) : 1;
      var inner = 1 - Math.max(0, Math.min(1, rr / (rInt + 1)));
      var b = (0.34 + 0.66 * inner) * dim * fade;
      if (b <= 0.01) continue;
      ctx.strokeStyle = "rgba(" + (196 + 59 * inner | 0) + "," + (244 + 11 * inner | 0) + ",255," + Math.min(1, b).toFixed(3) + ")";
      ctx.lineWidth = (1 + 2.2 * inner) * sz[i];
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(pa) * rr, cy + Math.sin(pa) * rr * comp);
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    var coreR = R * (0.05 + 0.018 * breath) * (0.3 + 0.7 * throat);
    ctx.globalAlpha = Math.max(0, Math.min(1, 0.95 * dim));
    ctx.fillStyle = gCore;
    ctx.beginPath();
    ctx.ellipse(cx, cy, R * 0.17, R * 0.17 * comp * 1.4, 0, 0, 6.2832);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = "rgba(6,14,20,0.9)";
    ctx.beginPath();
    ctx.ellipse(cx, cy, coreR * 0.66, coreR * 0.44, 0, 0, 6.2832);
    ctx.fill();
    ctx.strokeStyle = "rgba(190,248,255," + (0.5 * dim).toFixed(3) + ")";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, coreR * 0.66, coreR * 0.44, 0, 0, 6.2832);
    ctx.stroke();

    if (fl > 0) {
      ctx.strokeStyle = "rgba(240,254,255," + (0.9 * fl).toFixed(3) + ")";
      ctx.lineWidth = 3 + 8 * (1 - fl);
      ctx.beginPath();
      ctx.ellipse(cx, cy, R * (0.1 + 0.9 * (1 - fl)), R * (0.1 + 0.9 * (1 - fl)) * comp, 0, 0, 6.2832);
      ctx.stroke();
    }
    ctx.globalCompositeOperation = "source-over";
  }

  function frame(now) {
    var dt = (now - last) / 1000;
    if (!(dt > 0)) dt = 0.016;
    if (dt > 0.05) dt = 0.05;
    last = now;
    mt += dt;
    phase += dt * (0.6 + 2.6 * spin);
    base += dt * (0.5 + 3.4 * spin) * (mode === "ex" ? 1 - Math.min(1, mt / 2.4) * 0.85 : 1);
    if (fl > 0) fl = Math.max(0, fl - dt * 4.4);

    if (mode === "slam" && mt > 0.19) {
      mode = "ex";
      mt = 0;
      st.textContent = "EXHALING";
      st.className = "warn";
    } else if (mode === "ex" && mt > 2.4) {
      mode = "in";
      mt = 0;
      st.textContent = "INHALING";
      st.className = "ok";
    }

    var targetThroat = 1;
    if (mode === "slam") targetThroat = Math.max(0, 1 - mt / 0.19);
    else if (mode === "ex") targetThroat = 0.22 + 0.78 * Math.min(1, mt / 2.2);
    throat += (targetThroat - throat) * Math.min(1, dt * (mode === "slam" ? 26 : 5));
    thr.textContent = (0.4 + throat * 3.6).toFixed(1);

    var R = Math.min(W, H) * 0.5;
    var rInt = R * (0.52 + 0.44 * intake) * (0.4 + 0.6 * throat);
    var rOut = R * 1.05;
    var spinRate = (0.5 + 3.4 * spin) * (mode === "ex" ? 1 - Math.min(1, mt / 2.4) * 0.85 : 1);
    var exh = mode === "ex" ? Math.min(1, mt / 2.4) : 0;
    for (var i = 0; i < live; i++) {
      var t = Math.max(0, Math.min(1, rad[i] / (rInt + 0.001)));
      if (mode === "ex" || mode === "slam") {
        rad[i] += (60 + 260 * exh) * dt;
        if (rad[i] > rOut * 1.5) {
          rad[i] = rInt;
          jit[i] = Math.random();
        }
      } else {
        rad[i] -= (26 + 150 * (1 - t)) * dt;
        if (rad[i] < R * 0.05) {
          rad[i] = rInt;
          jit[i] = Math.random();
        }
      }
      ang[i] += (0.9 + 2.4 * (1 - t)) * spinRate * dt;
    }
    if (auto && mode === "in" && live < want) {
      for (i = live; i < want; i++) {
        arm[i] = i % 3;
        jit[i] = Math.random();
        sz[i] = 0.7 + Math.random() * 1.5;
        rad[i] = rInt;
      }
      live = want;
      npEl.textContent = String(live);
    }
    draw();
    requestAnimationFrame(frame);
  }

  var rt = 0;
  window.addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      size();
      sync();
    }, 140);
  });

  size();
  seed(220);
  sync();
  if (calm) {
    throat = 1;
    draw();
    st.textContent = "INHALING";
  } else {
    requestAnimationFrame(function (t) {
      last = t;
      requestAnimationFrame(frame);
    });
    setTimeout(press, 2200);
  }
})();
