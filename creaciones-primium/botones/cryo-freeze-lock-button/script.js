(function () {
  var log = document.getElementById("log");
  var cmd = document.getElementById("cmd");
  var lat = document.getElementById("lat");
  var latv = document.getElementById("latv");
  var cv = document.getElementById("frost");
  var ctx = cv.getContext("2d");
  var veil = document.getElementById("veil");
  var badge = document.getElementById("badge");
  var shardBox = document.getElementById("shards");
  var key = document.getElementById("key");
  var stat = document.getElementById("stat");
  var clock = document.getElementById("clock");
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var SHARDS = 20;
  var W = 0;
  var H = 0;
  var t0 = 0;
  var tPress = -99;
  var lines = 0;
  var shards = [];
  var seeds = [];
  var frostAmt = 0;
  var sx = 0.5;
  var sy = 0.5;
  var stage = -1;

  function size() {
    var r = cv.getBoundingClientRect();
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    W = Math.max(80, Math.round(r.width));
    H = Math.max(80, Math.round(r.height));
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  for (var i = 0; i < SHARDS; i++) {
    var d = document.createElement("i");
    d.className = "shard";
    shardBox.appendChild(d);
    shards.push({ el: d, x: 0, y: 0, vx: 0, vy: 0, r: 0, vr: 0, t: 0, on: false, s: 1 });
  }

  function say(text, cls) {
    var p = document.createElement("p");
    p.textContent = text;
    if (cls) p.className = cls;
    log.appendChild(p);
    lines++;
    while (log.children.length > 13) {
      log.firstChild.remove();
    }
  }

  function branch(x, y, a, len, d) {
    if (d > 7 || len < 2.2) return;
    var x2 = x + Math.cos(a) * len;
    var y2 = y + Math.sin(a) * len;
    ctx.strokeStyle = "rgba(214,246,255," + (0.42 - d * 0.05).toFixed(3) + ")";
    ctx.lineWidth = Math.max(0.45, 2.6 - d * 0.36);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    var n = d < 2 ? 3 : 2;
    for (var i = 0; i < n; i++) {
      var sp = 0.44 + Math.random() * 0.4;
      var dir = i - (n - 1) / 2;
      branch(x2, y2, a + dir * sp + (Math.random() - 0.5) * 0.24, len * (0.6 + Math.random() * 0.24), d + 1);
    }
  }

  function drawFrost() {
    ctx.clearRect(0, 0, W, H);
    var g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.7);
    g.addColorStop(0, "rgba(190, 236, 255, 0.02)");
    g.addColorStop(0.6, "rgba(214, 246, 255, 0.07)");
    g.addColorStop(1, "rgba(236, 252, 255, 0.2)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.lineCap = "round";
    for (var i = 0; i < seeds.length; i++) {
      var s = seeds[i];
      var arms = 5 + ((i * 3) % 4);
      for (var k = 0; k < arms; k++) {
        branch(s.x * W, s.y * H, s.a + (k / arms) * 6.2832 + Math.random() * 0.3, s.l, 0);
      }
    }
    for (i = 0; i < 26; i++) {
      var bx = Math.random() * W;
      var by = Math.random() * H;
      var br = 12 + Math.random() * 46;
      var rg = ctx.createRadialGradient(bx, by, 0, bx, by, br);
      rg.addColorStop(0, "rgba(226, 250, 255, 0.1)");
      rg.addColorStop(1, "rgba(226, 250, 255, 0)");
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, 6.2832);
      ctx.fill();
    }
  }

  function newSeeds() {
    seeds = [];
    var edge = [[0.04, 0.06], [0.96, 0.1], [0.5, 0.03], [0.08, 0.92], [0.94, 0.88], [0.5, 0.97], [0.3, 0.5], [0.72, 0.44]];
    for (var pt of edge) {
      seeds.push({ x: pt[0], y: pt[1], a: Math.atan2(0.5 - pt[1], 0.5 - pt[0]) + (Math.random() - 0.5) * 1.2, l: 16 + Math.random() * 16 });
    }
  }

  function burst(x, y) {
    for (var i = 0; i < SHARDS; i++) {
      var P = shards[i];
      var a = Math.random() * 6.2832;
      var sp = 90 + Math.random() * 340;
      P.x = x * W;
      P.y = y * H;
      P.vx = Math.cos(a) * sp;
      P.vy = Math.sin(a) * sp * 0.7 - 60;
      P.r = Math.random() * 360;
      P.vr = (Math.random() - 0.5) * 900;
      P.t = 0;
      P.s = 0.5 + Math.random() * 1.2;
      P.on = true;
      P.el.style.display = "block";
    }
  }

  function flyShards(dt) {
    for (var i = 0; i < SHARDS; i++) {
      var P = shards[i];
      if (!P.on) continue;
      P.t += dt;
      if (P.t > 0.95) {
        P.on = false;
        P.el.style.opacity = "0";
        P.el.style.display = "none";
        continue;
      }
      P.vy += 620 * dt;
      P.x += P.vx * dt;
      P.y += P.vy * dt;
      P.r += P.vr * dt;
      var a = Math.max(0, 1 - P.t / 0.95);
      P.el.style.transform = "translate(" + P.x.toFixed(1) + "px," + P.y.toFixed(1) + "px) rotate(" + P.r.toFixed(0) + "deg) scale(" + (P.s * (0.4 + a * 0.8)).toFixed(2) + ")";
      P.el.style.opacity = (a * 0.85).toFixed(3);
    }
  }

  function run(now) {
    var t = (now - t0) / 1000;
    var p = t - tPress;
    var st = 0;

    if (p >= 0 && p < 0.22) {
      st = 1;
    } else if (p >= 0.22 && p < 2.7) {
      st = 2;
    } else if (p >= 2.7) {
      st = 3;
    }

    if (st !== stage) {
      stage = st;
      if (st === 1) {
        stat.textContent = "SHATTER";
        key.classList.add("is-hot");
        badge.style.opacity = "0";
        badge.style.transform = "scale(0.8)";
        frostAmt = 0;
        burst(sx, sy);
        say("! lattice integrity lost, purging", "warn");
      }
      if (st === 2) {
        stat.textContent = "SEALING";
        say("cryo-lock --line 7 --seal", "cmd");
        setTimeout(function () {
          say("  pump down ......... 0.4 K", "cold");
        }, 240);
        setTimeout(function () {
          say("  nucleating frost .. 128 sites", "cold");
        }, 520);
        setTimeout(function () {
          say("  lattice growth .... 64 %", "cold");
        }, 900);
      }
      if (st === 3) {
        stat.textContent = "SEALED";
        key.classList.remove("is-hot");
        say("  line 7 sealed, integrity 100 %", "ok");
        badge.style.opacity = "1";
        badge.style.transform = "scale(1)";
      }
    }

    if (p >= 0.22) {
      var k = Math.max(0, Math.min(1, (p - 0.3) / 2.2));
      frostAmt = 1 - Math.pow(1 - k, 2.2);
    }

    if (p >= 0 && p < 0.22) {
      frostAmt = Math.max(0, 1 - p / 0.22);
    }

    var R = Math.max(W, H) * 0.78 * frostAmt;
    cv.style.opacity = (frostAmt * 0.82).toFixed(3);
    cv.style.clipPath = "circle(" + R.toFixed(1) + "px at " + (sx * 100).toFixed(1) + "% " + (sy * 100).toFixed(1) + "%)";
    veil.style.opacity = (frostAmt * 0.8).toFixed(3);
    lat.style.transform = "scaleX(" + frostAmt.toFixed(3) + ")";
    latv.textContent = Math.round(frostAmt * 100) + "%";
    cmd.style.opacity = p < 0.3 ? "0.35" : "1";
    // Ternario simplificado: las dos ramas mandaban la misma tanda de esquirlas.
    flyShards(Math.min(0.05, Math.max(0.001, 0.016)));
    var s = Math.floor(t);
    clock.textContent = "00:" + String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
    return t;
  }

  function press(x, y) {
    sx = x === undefined ? 0.5 : x;
    sy = y === undefined ? 0.42 : y;
    tPress = (performance.now() - t0) / 1000;
    stage = -1;
  }

  key.addEventListener("click", function () {
    press(0.5, 0.42);
  });
  key.addEventListener("pointerdown", function (e) {
    e.preventDefault();
    key.classList.add("is-hit");
  });
  key.addEventListener("pointerup", function () {
    key.classList.remove("is-hit");
  });
  key.addEventListener("pointerleave", function () {
    key.classList.remove("is-hit");
  });
  window.addEventListener("keydown", function (e) {
    if (e.key === " " || e.key === "Enter") press(0.5, 0.42);
  });

  var rt = 0;
  window.addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      size();
      newSeeds();
      drawFrost();
    }, 140);
  });

  size();
  newSeeds();
  drawFrost();

  if (calm) {
    frostAmt = 1;
    stat.textContent = "SEALED";
    badge.style.opacity = "1";
    badge.style.transform = "scale(1)";
    key.classList.add("is-hot");
    lat.style.transform = "scaleX(1)";
    latv.textContent = "100%";
    cv.style.opacity = "0.72";
    cv.style.clipPath = "none";
    say("cryoctl 2.4 ready", "ok");
    say("cryo-lock --line 7 --seal", "cmd");
    say("  line 7 sealed, integrity 100 %", "ok");
    return;
  }

  t0 = performance.now();
  say("cryoctl 2.4 (build 1187) ready", "ok");
  say("no active lock on line 7", "");
  setTimeout(function () {
    press(0.5, 0.42);
  }, 700);
  setInterval(function () {
    press(0.34 + Math.random() * 0.32, 0.3 + Math.random() * 0.3);
  }, 11000);

  requestAnimationFrame(function loop(now) {
    run(now);
    requestAnimationFrame(loop);
  });
  setInterval(function () {
    run(performance.now());
  }, 140);
})();
