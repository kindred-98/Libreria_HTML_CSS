(function () {
  var cv = document.getElementById("cracks");
  var ctx = cv.getContext("2d");
  var btn = document.getElementById("btn");
  var heat = document.getElementById("heat");
  var ghost = document.getElementById("ghost");
  var heatv = document.getElementById("heatv");
  var hot = document.querySelector(".core__hot");
  var flash = document.querySelector(".btn__flash");
  var glow = document.querySelector(".btn__glow");
  var floatEl = document.getElementById("float");
  var strikesEl = document.getElementById("strikes");
  var ncrEl = document.getElementById("ncr");
  var peakEl = document.getElementById("peak");
  var shell = document.getElementById("shell");
  var shellv = document.getElementById("shellv");
  var waveEl = document.getElementById("wave");
  var emberBox = document.getElementById("embers");
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var MAXN = 260;
  var EM = 26;
  var W = 0;
  var H = 0;
  var t0 = 0;
  var heatV = 0;
  var ghostV = 0;
  var strikes = 0;
  var wave = 1;
  var shellV = 1;
  var fl = 0;
  var flT = 0;
  var floatT = 0;
  var peak = 0;
  var seeds = [];
  var segs = [];
  var crackle = [];
  var embers = [];
  var hitAt = -99;

  for (var i = 0; i < MAXN; i++) {
    segs.push({ x1: 0, y1: 0, x2: 0, y2: 0, w: 1, t: 0, order: 0 });
  }
  for (i = 0; i < EM; i++) {
    var e = document.createElement("i");
    e.className = "emb";
    emberBox.appendChild(e);
    embers.push({ el: e, x: 0, y: 0, vx: 0, vy: 0, t: 0, life: 1, on: false });
  }

  function size() {
    var r = cv.getBoundingClientRect();
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    W = Math.max(80, Math.round(r.width));
    H = Math.max(80, Math.round(r.height));
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    layout();
  }

  function layout() {
    var s = seeds;
    var n = 0;
    for (var seed of s) {
      n += grow(seed, seed.x * W, seed.y * H, seed.a, seed.l, 0, n);
    }
    ncrEl.textContent = String(n);
    return n;
  }

  function grow(sd, x, y, a, len, d, order) {
    if (d > 5 || len < 6 || sd.n >= MAXN) return 0;
    var cnt = 0;
    var steps = 3;
    for (var i = 0; i < steps && sd.n < MAXN; i++) {
      var aa = a + (Math.random() - 0.5) * 0.8;
      var ll = len * (0.62 + Math.random() * 0.3);
      var x2 = x + Math.cos(aa) * ll;
      var y2 = y + Math.sin(aa) * ll;
      if (x2 < -10 || y2 < -10 || x2 > W + 10 || y2 > H + 10) break;
      var S = segs[sd.n];
      sd.pts[sd.n] = [x, y, x2, y2];
      S.x1 = x;
      S.y1 = y;
      S.x2 = x2;
      S.y2 = y2;
      S.w = Math.max(0.8, 4.2 - d * 0.66) * (0.75 + Math.random() * 0.55);
      S.t = 0;
      sd.n++;
      cnt++;
      if (Math.random() < 0.78) cnt += grow(sd, x2, y2, aa + (Math.random() - 0.5) * 0.55, ll, d + 1, 0);
      if (Math.random() < 0.5) cnt += grow(sd, x2, y2, aa + (Math.random() - 0.5) * 1.7, ll * 0.82, d + 1, 0);
      x = x2;
      y = y2;
      a = aa;
    }
    return cnt;
  }

  function newSeed(x, y, a) {
    return { x: x, y: y, a: a, l: 70 + Math.random() * 70, n: 0, pts: [] };
  }

  function initSeeds() {
    crackle.length = 0;
    for (var c = 0; c < 120; c++) {
      var x = Math.random() * W;
      var y = Math.random() * H;
      var a = Math.random() * 6.2832;
      var l = 8 + Math.random() * 30;
      crackle.push({ x1: x, y1: y, x2: x + Math.cos(a) * l, y2: y + Math.sin(a) * l, w: 0.5 + Math.random() * 0.7 });
    }
    seeds = [];
    var k = 6;
    for (var i = 0; i < k; i++) {
      var a2 = (i / k) * 6.2832 + Math.random() * 0.6;
      seeds.push(newSeed(0.5 + Math.cos(a2) * 0.34, 0.5 + Math.sin(a2) * 0.32, a2 + Math.PI));
    }
    layout();
  }

  function strike(px, py) {
    strikes++;
    strikesEl.textContent = String(strikes);
    var a = Math.atan2(py - 0.5, px - 0.5) + (Math.random() - 0.5) * 1.2;
    var sd = newSeed(px, py, a);
    seeds.push(sd);
    if (seeds.length > 10) seeds.shift();
    hitAt = (performance.now() - t0) / 1000;
    grow(sd, px * W, py * H, a, 64 + Math.random() * 60, 0, 0);
    ncrEl.textContent = String(segs.length && countLive());
    heatV = Math.min(1, heatV + 0.5);
    fl = 1;
    flT = 0;
    floatT = 1;
    floatEl.textContent = "+" + (12 + Math.floor(Math.random() * 26));
    shellV = Math.max(0.12, shellV - 0.07);
    shell.style.transform = "scaleX(" + shellV.toFixed(3) + ")";
    shellv.textContent = Math.round(shellV * 100) + "%";
    if (strikes % 4 === 0) {
      wave++;
      waveEl.textContent = "WAVE " + (wave < 10 ? "0" : "") + wave;
    }
    for (var i = 0; i < 8; i++) {
      var E = null;
      for (var em of embers) {
        if (!em.on) {
          E = em;
          break;
        }
      }
      if (!E) break;
      var ang = Math.random() * 6.2832;
      var sp = 40 + Math.random() * 190;
      E.x = px * W;
      E.y = py * H;
      E.vx = Math.cos(ang) * sp;
      E.vy = Math.sin(ang) * sp - 40;
      E.t = 0;
      E.life = 0.7 + Math.random() * 0.8;
      E.on = true;
      E.el.style.display = "block";
    }
  }

  function countLive() {
    var n = 0;
    for (var seed of seeds) n += seed.n;
    return n;
  }

  function draw(hv) {
    ctx.clearRect(0, 0, W, H);
    var base = 0.34 + hv * 0.66;
    ctx.lineCap = "round";
    for (var C of crackle) {
      ctx.strokeStyle = "rgba(196, 96, 40, " + (0.1 + 0.3 * hv).toFixed(3) + ")";
      ctx.lineWidth = C.w;
      ctx.beginPath();
      ctx.moveTo(C.x1, C.y1);
      ctx.lineTo(C.x2, C.y2);
      ctx.stroke();
    }
    for (var pass = 0; pass < 2; pass++) {
      for (var i = 0; i < MAXN; i++) {
        var S = segs[i];
        if (S.w <= 0) continue;
        var local = Math.max(0.62, Math.min(1, hv * 1.8 - (i / MAXN) * 0.45));
        ctx.strokeStyle = pass === 0
          ? "rgba(255, 84, 16, " + (0.3 * base * local).toFixed(3) + ")"
          : "rgba(255, " + (126 + 110 * hv | 0) + ", " + (56 + 130 * hv | 0) + ", " + (0.88 * local * (0.42 + 0.58 * hv)).toFixed(3) + ")";
        ctx.lineWidth = pass === 0 ? S.w * 4.6 : S.w * (0.9 + 0.5 * hv);
        ctx.beginPath();
        ctx.moveTo(S.x1, S.y1);
        ctx.lineTo(S.x2, S.y2);
        ctx.stroke();
      }
    }
  }

  function frame(now) {
    var t = (now - t0) / 1000;
    var dt = 0.016;
    var since = t - hitAt;
    var flare = since >= 0 && since < 0.55 ? 1 - since / 0.55 : 0;
    var cool = since >= 0 ? Math.max(0, 1 - since / 5.6) : 0;
    var want = Math.min(1, cool + flare * 0.55);
    heatV += (want - heatV) * (want > heatV ? 0.6 : 0.28);
    if (heatV < 0.2) heatV = 0.2;
    ghostV += (heatV - ghostV) * (ghostV > heatV ? 0.1 : 0.5);
    if (heatV > peak) {
      peak = heatV;
      peakEl.textContent = Math.round(peak * 100);
    }

    var hv = Math.max(0.26, heatV);
    heat.style.transform = "scaleX(" + hv.toFixed(3) + ")";
    ghost.style.transform = "scaleX(" + Math.max(hv, ghostV).toFixed(3) + ")";
    heatv.textContent = Math.round(hv * 100) + "%";
    hot.style.opacity = (0.1 + hv * 0.7).toFixed(3);
    glow.style.opacity = (0.12 + hv * 0.5).toFixed(3);
    draw(hv);

    if (fl > 0) {
      flT += dt;
      fl = Math.max(0, 1 - flT * 3.1);
      flash.style.opacity = (fl * 0.9).toFixed(3);
      flash.style.transform = "scale(" + (0.4 + (1 - fl) * 1.5).toFixed(2) + ")";
    }
    if (floatT > 0) {
      floatT = Math.max(0, floatT - dt * 1.5);
      floatEl.style.opacity = (floatT * 0.95).toFixed(3);
      floatEl.style.transform = "translateX(-50%) translateY(" + ((1 - floatT) * -34).toFixed(1) + "px) scale(" + (0.8 + floatT * 0.3).toFixed(2) + ")";
    }

    for (var E of embers) {
      if (!E.on) continue;
      E.t += dt;
      if (E.t > E.life) {
        E.on = false;
        E.el.style.opacity = "0";
        E.el.style.display = "none";
        continue;
      }
      E.vy -= 40 * dt;
      E.vx *= Math.pow(0.4, dt);
      E.vy *= Math.pow(0.7, dt);
      E.x += E.vx * dt;
      E.y += E.vy * dt;
      var a = Math.max(0, 1 - E.t / E.life);
      E.el.style.transform = "translate(" + E.x.toFixed(1) + "px," + E.y.toFixed(1) + "px) scale(" + (0.4 + a * 0.9).toFixed(2) + ")";
      E.el.style.opacity = (a * 0.9).toFixed(3);
    }
  }

  btn.addEventListener("click", function (e) {
    var r = cv.getBoundingClientRect();
    var x = (e.clientX - r.left) / r.width;
    var y = (e.clientY - r.top) / r.height;
    if (x < 0 || x > 1 || y < 0 || y > 1) {
      x = 0.5;
      y = 0.5;
    }
    strike(x, y);
  });
  btn.addEventListener("pointerdown", function (e) {
    e.preventDefault();
    btn.classList.add("is-hit");
  });
  btn.addEventListener("pointerup", function () {
    btn.classList.remove("is-hit");
  });
  btn.addEventListener("pointerleave", function () {
    btn.classList.remove("is-hit");
  });
  window.addEventListener("keydown", function (e) {
    if (e.key === " " || e.key === "Enter") strike(0.5 + (Math.random() - 0.5) * 0.5, 0.5 + (Math.random() - 0.5) * 0.5);
  });

  var rt = 0;
  window.addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      size();
    }, 150);
  });

  size();
  initSeeds();

  if (calm) {
    heatV = 0.72;
    ghostV = 0.72;
    heat.style.transform = "scaleX(0.72)";
    ghost.style.transform = "scaleX(0.72)";
    heatv.textContent = "72%";
    hot.style.opacity = "0.6";
    glow.style.opacity = "0.48";
    shell.style.transform = "scaleX(0.72)";
    shellv.textContent = "72%";
    peakEl.textContent = "72";
    ncrEl.textContent = String(countLive());
    draw(0.72);
    return;
  }

  t0 = performance.now();
  requestAnimationFrame(function loop(now) {
    frame(now);
    requestAnimationFrame(loop);
  });
  setInterval(function () {
    frame(performance.now());
  }, 150);
  var beat = 0;
  var autoId = setInterval(function () {
    beat++;
    var a = beat * 2.399;
    strike(0.5 + Math.cos(a) * 0.3, 0.5 + Math.sin(a) * 0.26);
  }, 1900);
  setTimeout(function () {
    clearInterval(autoId);
  }, 1e9);
  window.addEventListener("pointerdown", function () {
    clearInterval(autoId);
  });
})();
