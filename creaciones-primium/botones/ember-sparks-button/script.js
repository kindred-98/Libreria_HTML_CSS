(function () {
  "use strict";
  var btn = document.getElementById("strike");
  if (!btn) return;

  var fx = document.getElementById("fx");
  var boss = document.getElementById("boss");
  var bossFill = document.getElementById("boss-fill");
  var bossState = document.getElementById("boss-state");
  var forgeFill = document.getElementById("forge-fill");
  var elScore = document.getElementById("hud-score");
  var elBest = document.getElementById("hud-best");
  var elStreak = document.getElementById("hud-streak");
  var elVent = document.getElementById("hud-vent");
  var elBreaks = document.getElementById("hud-breaks");
  var banner = document.getElementById("banner");
  var bannerTx = document.getElementById("banner-tx");
  var scrim = document.getElementById("scrim");
  var pips = document.querySelectorAll(".pips s");

  var REDUCE = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var MAXP = 150;
  var G = 300;
  var CHARGE = 2.4;

  var score = 0, best = 0, breaks = 0, lives = 3, streak = 1;
  var heat = 0.04, charge = 0;
  var lastStrike = -9e9;
  var pool = [], live = 0;

  function rnd(a, b) { return a + Math.random() * (b - a); }

  function pad(n, w) {
    var s = String(n);
    while (s.length < w) s = "0" + s;
    return s;
  }

  for (var i = 0; i < MAXP; i++) {
    var el = document.createElement("i");
    el.className = "sp";
    el.style.opacity = "0";
    fx.appendChild(el);
    pool.push({ el: el, x: 0, y: 0, vx: 0, vy: 0, age: 0, life: 1, st: -1, kind: 0, s0: 1 });
  }

  function shoot(x, y, vx, vy, life, kind) {
    if (live >= MAXP) return;
    var p = pool[live++];
    p.x = x; p.y = y; p.vx = vx; p.vy = vy;
    p.age = 0; p.life = life; p.st = -1; p.kind = kind;
    p.el.className = kind === 1 ? "sm" : "sp";
    p.s0 = rnd(0.5, 0.9);
  }

  function kill(i) {
    var p = pool[i];
    p.el.style.opacity = "0";
    var last = live - 1;
    pool[i] = pool[last];
    pool[last] = p;
    live--;
  }

  function vent(x, y, power) {
    var n = power ? 13 : 4 + ((Math.random() * 3 | 0));
    for (var i = 0; i < n; i++) {
      var a = -Math.PI / 2 + rnd(-0.85, 0.85) * (power ? 1.6 : 1);
      var sp = power ? rnd(210, 380) : rnd(130, 250);
      shoot(x + rnd(-16, 16), y - 9, Math.cos(a) * sp, Math.sin(a) * sp, power ? rnd(0.6, 1.1) : rnd(0.8, 1.5), 0);
    }
    if (power || Math.random() < 0.34) {
      shoot(x + rnd(-24, 24), y + rnd(0, 6), rnd(-9, 9), rnd(-26, -12), rnd(1.5, 2.6), 1);
    }
  }

  function flare(x, y) {
    var i, a, sp;
    for (i = 0; i < 26; i++) {
      a = rnd(-Math.PI, 0);
      sp = rnd(200, 460);
      shoot(x + rnd(-46, 46), y + rnd(4, 40), Math.cos(a) * sp, Math.sin(a) * sp, rnd(0.5, 1.05), 0);
    }
    for (i = 0; i < 9; i++) {
      a = rnd(-Math.PI * 0.92, -Math.PI * 0.08);
      sp = rnd(260, 620);
      shoot(x + rnd(-40, 40), y, Math.cos(a) * sp, Math.sin(a) * sp - rnd(40, 160), rnd(0.7, 1.4), 0);
    }
    for (i = 0; i < 4; i++) {
      shoot(x + rnd(-40, 40), y + rnd(10, 34), rnd(-16, 16), rnd(-40, -14), rnd(1.8, 3), 1);
    }
  }

  function stage(p) {
    var f = p.age / p.life;
    var s = p.st;
    if (f < 0.16) { if (s !== 0) { p.st = 0; p.el.style.background = "#fff8e6"; p.el.style.boxShadow = "0 0 7px rgba(255,214,150,1),0 0 18px rgba(255,150,60,.7)"; } }
    else if (f < 0.46) { if (s !== 1) { p.st = 1; p.el.style.background = "#ffc061"; p.el.style.boxShadow = "0 0 6px rgba(255,160,70,.9),0 0 14px rgba(255,110,30,.5)"; } }
    else if (f < 0.78) { if (s !== 2) { p.st = 2; p.el.style.background = "#f2621f"; p.el.style.boxShadow = "0 0 5px rgba(255,110,40,.7),0 0 12px rgba(210,60,10,.4)"; } }
    else if (s !== 3) { p.st = 3; p.el.style.background = "#8e2409"; p.el.style.boxShadow = "0 0 4px rgba(190,50,10,.4)"; }
  }

  function setPips() {
    for (var q = 0; q < pips.length; q++) {
      if (q < lives) pips[q].classList.add("on");
      else pips[q].classList.remove("on");
    }
  }

  function say(text) {
    bannerTx.textContent = text;
    banner.classList.remove("is-on");
    scrim.classList.remove("is-on");
    banner.getBoundingClientRect();
    banner.classList.add("is-on");
    scrim.classList.add("is-on");
  }

  function updateHud() {
    elScore.textContent = pad(score, 5);
    elBest.textContent = pad(best, 5);
    elStreak.textContent = "x" + streak;
    elBreaks.textContent = breaks < 10 ? "0" + breaks : String(breaks);
    elVent.textContent = Math.round(320 + charge * 1180) + " C";
    if (score > best) { best = score; }
  }

  function strike() {
    var now = performance.now();
    if (now - lastStrike < 1100) streak = streak < 9 ? streak + 1 : 9;
    else streak = 1;
    lastStrike = now;

    var r = btn.getBoundingClientRect();
    var cx = r.left + r.width / 2;
    var cy = r.top + r.height * 0.3;

    btn.classList.add("is-hit");
    clearTimeout(btn.tid);
    btn.tid = setTimeout(function () { btn.classList.remove("is-hit"); }, 240);

    var dump = 0.1 + charge * 0.16;
    var broke = false;
    heat -= dump;
    if (heat <= 0) { heat = 0.001; broke = true; }
    score += 25 * streak;

    vent(cx, cy, true);
    flare(cx, cy);

    if (broke) {
      breaks++;
      score += 500;
      heat = 0.28;
      say("Break");
      flare(cx, r.top + r.height * 0.2);
    } else if (heat > 0.78) {
      say("White hot");
    }

    charge = 0;
    updateHud();
  }

  function loseLife() {
    lives--;
    setPips();
    if (lives <= 0) {
      say("Game over");
      heat = 0.3;
      lives = 3;
      score = 0;
      streak = 1;
      setPips();
    } else {
      say("Life lost");
      heat = 0.34;
    }
    updateHud();
  }

  btn.addEventListener("pointerdown", function (e) {
    e.preventDefault();
    strike();
  });
  btn.addEventListener("click", strike);
  btn.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") strike();
  });

  setPips();
  updateHud();

  var ventClock = 0;
  var prev = 0;

  function frame(ts) {
    var dt = prev ? Math.min(0.05, (ts - prev) / 1000) : 0.016;
    prev = ts;

    if (!REDUCE) {
      charge = ((ts / 1000) % CHARGE) / CHARGE;
      var cyc = (ts / 1000) % CHARGE;
      if (cyc > CHARGE * 0.64) charge = 1 - (cyc - CHARGE * 0.64) / (CHARGE * 0.36);
      if (charge < 0) charge = 0;
      else if (charge > 1) charge = 1;

      ventClock -= dt;
      if (ventClock <= 0) {
        ventClock = 0.34 + charge * 0.5;
        var r = btn.getBoundingClientRect();
        vent(r.left + r.width / 2, r.top + r.height * 0.3, false);
      }
    }

    heat = Math.min(1.06, heat + dt * 0.052);
    if (heat >= 1) loseLife();

    if (bossFill) bossFill.style.transform = "scaleX(" + Math.min(1, heat).toFixed(3) + ")";
    if (forgeFill) forgeFill.style.transform = "scaleX(" + Math.max(0.02, charge).toFixed(3) + ")";
    if (bossState) {
      var st = "Tepid";
      if (heat > 0.86) st = "Critical";
      else if (heat > 0.66) st = "Roaring";
      else if (heat > 0.42) st = "Drawing";
      else if (heat > 0.2) st = "Warming";
      if (bossState.textContent !== st) bossState.textContent = st;
    }
    if (boss) {
      if (heat > 0.86) boss.classList.add("is-crit");
      else boss.classList.remove("is-crit");
    }
    if (elVent) elVent.textContent = Math.round(320 + charge * 1180) + " C";

    for (var j = 0; j < live; j++) {
      var p = pool[j];
      p.age += dt;
      if (p.age >= p.life) { kill(j); j--; continue; }
      if (p.kind === 0) {
        p.vy += G * dt;
        p.vx *= Math.exp(-2.2 * dt);
        p.vy *= Math.exp(-0.34 * dt);
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        var f = p.age / p.life;
        var sc = f < 0.5 ? 1 : 1 - (f - 0.5) * 1.5;
        p.el.style.transform = "translate(" + p.x.toFixed(1) + "px," + p.y.toFixed(1) + "px) rotate(" + (Math.atan2(p.vy, p.vx) - Math.PI / 2).toFixed(3) + "rad) scale(" + Math.max(0.05, sc).toFixed(2) + ")";
        p.el.style.opacity = (f < 0.15 ? f / 0.15 : 1 - (f - 0.15) / 0.85).toFixed(3);
        stage(p);
      } else {
        p.vy += 14 * dt;
        p.vx *= Math.exp(-0.9 * dt);
        p.vy *= Math.exp(-0.7 * dt);
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        var g = p.age / p.life;
        p.el.style.transform = "translate(" + p.x.toFixed(1) + "px," + p.y.toFixed(1) + "px) scale(" + (p.s0 + g * 1.15).toFixed(3) + ")";
        p.el.style.opacity = (Math.sin(Math.PI * Math.min(1, g * 1.05)) * 0.8).toFixed(3);
      }
    }

    window.requestAnimationFrame(frame);
  }

  window.requestAnimationFrame(frame);
})();
