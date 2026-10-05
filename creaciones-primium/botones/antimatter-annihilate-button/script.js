(function () {
  var btn = document.getElementById("strike");
  if (!btn) return;

  var REDUCE = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var label = btn.querySelector(".btn__label");
  var host = document.getElementById("burst");
  var motes = document.querySelector(".sg-motes");
  var rqFlux = document.getElementById("rq-flux");
  var rqCoil = document.getElementById("rq-coil");
  var rqSeal = document.getElementById("rq-seal");
  var rqHit = document.getElementById("rq-hit");
  var chamber = document.querySelector(".chamber");

  function rnd(a, b) { return a + Math.random() * (b - a); }

  var halves = null;
  if (label) {
    var txt = label.textContent.trim();
    var mid = Math.ceil(txt.length / 2);
    label.textContent = "";
    var a = document.createElement("span");
    a.className = "am-mat";
    a.textContent = txt.slice(0, mid);
    var g = document.createElement("span");
    g.className = "am-gap";
    g.setAttribute("aria-hidden", "true");
    var c = document.createElement("span");
    c.className = "am-anti";
    c.textContent = txt.slice(mid);
    label.appendChild(a);
    label.appendChild(g);
    label.appendChild(c);
    halves = { a: a, c: c, g: g };
  }

  function measure() {
    if (!halves) return;
    var w = label.offsetWidth + label.offsetHeight * 0.2;
    btn.style.setProperty("--shift", (w / 4).toFixed(1) + "px");
  }

  if (motes) {
    for (var m = 0; m < 18; m++) {
      var mt = document.createElement("i");
      mt.className = "mote";
      mt.style.left = (rnd(3, 97)).toFixed(1) + "%";
      mt.style.top = (rnd(30, 96)).toFixed(1) + "%";
      mt.style.setProperty("--mx", rnd(-46, 46).toFixed(0) + "px");
      mt.style.setProperty("--my", (rnd(-140, -50)).toFixed(0) + "px");
      mt.style.animationDuration = rnd(6, 15).toFixed(2) + "s";
      mt.style.animationDelay = (-rnd(0, 12)).toFixed(2) + "s";
      mt.style.opacity = "0";
      motes.appendChild(mt);
    }
  }

  var COUNT = 54;
  var pool = [];
  var live = 0;
  if (host) {
    for (var i = 0; i < COUNT; i++) {
      var p = document.createElement("i");
      p.className = "pt";
      p.setAttribute("aria-hidden", "true");
      host.appendChild(p);
      pool.push({ el: p, x: 0, y: 0, vx: 0, vy: 0, age: 0, life: 1, kind: 0, drag: 1.6, g: 0 });
    }
  }

  function origin() {
    var r = btn.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  function shoot(o, ang, speed, life, kind, drag, g) {
    if (live >= COUNT) return;
    var p = pool[live++];
    p.x = o.x + Math.cos(ang) * rnd(0, 6);
    p.y = o.y + Math.sin(ang) * rnd(0, 6);
    p.vx = Math.cos(ang) * speed;
    p.vy = Math.sin(ang) * speed;
    p.age = 0;
    p.life = life;
    p.kind = kind;
    p.drag = drag;
    p.g = g;
    var sufijo = "f";
    if (kind === 0) sufijo = "m";
    else if (kind === 1) sufijo = "a";
    p.el.className = "pt pt--" + sufijo;
  }

  function kill(i) {
    var p = pool[i];
    p.el.style.opacity = "0";
    var last = live - 1;
    pool[i] = pool[last];
    pool[last] = p;
    live--;
  }

  var W = 1, H = 1;
  function size() {
    W = window.innerWidth || 1;
    H = window.innerHeight || 1;
  }
  size();

  function burst(o) {
    var i, n;
    for (i = 0; i < 15; i++) shoot(o, rnd(-1.15, 1.15), rnd(240, 700), rnd(0.5, 1.1), i % 2 ? 1 : 0, 1.5, 40);
    for (i = 0; i < 9; i++) shoot(o, rnd(0.4, 2.74), rnd(120, 330), rnd(0.9, 1.7), 2, 0.9, -18);
    for (i = 0; i < 6; i++) shoot(o, rnd(-0.5, 0.5), rnd(700, 1100), rnd(0.34, 0.6), i % 2 ? 1 : 0, 3.4, 0);
    n = 0;
    for (i = 0; i < 12; i++) {
      var ang = (i / 12) * Math.PI * 2 + rnd(-0.1, 0.1);
      shoot(o, ang, rnd(420, 820), rnd(0.45, 0.9), i % 3 === 0 ? 2 : i % 2, 2.4, 60);
      n++;
    }
    return n;
  }

  var events = 0;
  var timer = 0;
  var leakClock = 0;

  function fire() {
    if (btn.disabled) return;
    events++;
    if (rqHit) rqHit.textContent = events < 10 ? "0" + events : String(events);
    btn.classList.add("is-boom");
    if (chamber) chamber.classList.add("is-boom");
    if (rqSeal) rqSeal.textContent = "Breach";
    if (rqCoil) rqCoil.textContent = "Dump";
    var o = origin();
    burst(o);
    clearTimeout(timer);
    timer = setTimeout(function () {
      btn.classList.remove("is-boom");
      if (chamber) chamber.classList.remove("is-boom");
      if (rqSeal) rqSeal.textContent = "Nominal";
      if (rqCoil) rqCoil.textContent = "Standby";
    }, 880);
  }

  btn.addEventListener("pointerdown", fire);
  btn.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") fire();
  });

  window.addEventListener("resize", function () {
    size();
    measure();
  });

  var prev = 0;
  function frame(ts) {
    var dt = prev ? Math.min(0.05, (ts - prev) / 1000) : 0.016;
    prev = ts;

    if (!REDUCE) {
      leakClock -= dt;
      if (leakClock <= 0) {
        leakClock = rnd(0.07, 0.24);
        var o = origin();
        var ang = rnd(0, Math.PI * 2);
        shoot(o, ang, rnd(10, 46), rnd(1.6, 3.2), Math.random() < 0.5 ? 0 : 1, 0.7, 0);
      }
    }

    for (var i = 0; i < live; i++) {
      var p = pool[i];
      p.age += dt;
      if (p.age >= p.life) { kill(i); i--; continue; }
      var d = Math.exp(-p.drag * dt);
      p.vx *= d;
      p.vy = p.vy * d + p.g * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.x < -40 || p.x > W + 40 || p.y < -60 || p.y > H + 60) { kill(i); i--; continue; }
      var f = p.age / p.life;
      var sc = f < 0.12 ? 0.4 + f * 5 : 1 - (f - 0.12) * 0.85;
      p.el.style.transform = "translate3d(" + p.x.toFixed(1) + "px," + p.y.toFixed(1) + "px,0) scale(" + (sc > 0.05 ? sc.toFixed(2) : 0.05) + ")";
      p.el.style.opacity = (f < 0.1 ? f / 0.1 : (1 - (f - 0.1) / 0.9) * 0.95).toFixed(3);
    }

    if (rqFlux) {
      var near = 0;
      for (var k = 0; k < live; k++) {
        var dx = pool[k].x - o0x, dy = pool[k].y - o0y;
        near += dx * dx + dy * dy;
      }
      var v = REDUCE ? 0 : Math.min(9.99, (near / (live + 1)) / 9000);
      rqFlux.textContent = v.toFixed(2);
    }

    window.requestAnimationFrame(frame);
  }

  var o0x = 0, o0y = 0;
  var oa = origin();
  o0x = oa.x;
  o0y = oa.y;
  window.addEventListener("resize", function () {
    var b = origin();
    o0x = b.x;
    o0y = b.y;
  });

  measure();
  window.requestAnimationFrame(frame);
})();
