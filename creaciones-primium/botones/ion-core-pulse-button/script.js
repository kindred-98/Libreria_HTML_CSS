(function () {
  "use strict";
  var btn = document.getElementById("core");
  if (!btn) return;
  var orb = document.getElementById("orb");
  var kv = document.getElementById("kv");
  var pill = document.getElementById("pill");
  var c1 = document.getElementById("c1");
  var c2 = document.getElementById("c2");
  var c3 = document.getElementById("c3");
  var hint = document.getElementById("hint");

  function rnd(a, b) { return a + Math.random() * (b - a); }

  var w = btn.offsetWidth || 260;
  var h = btn.offsetHeight || 92;
  var nodes = [];
  var i;
  for (i = 0; i < 13; i++) {
    var p = document.createElement("i");
    p.className = "ion";
    p.style.setProperty("--a0", rnd(0, 360).toFixed(1) + "deg");
    p.style.setProperty("--prx", (w * rnd(0.26, 0.4)).toFixed(1) + "px");
    p.style.setProperty("--pry", (h * rnd(0.14, 0.34)).toFixed(1) + "px");
    p.style.setProperty("--s", rnd(0.7, 1.35).toFixed(2));
    p.style.setProperty("--dur", rnd(4.6, 9.4).toFixed(2) + "s");
    p.style.setProperty("--dly", (-rnd(0, 9.4)).toFixed(2) + "s");
    orb.appendChild(p);
    nodes.push(p);
  }

  var SPK = 12;
  var sparks = [];
  for (i = 0; i < SPK; i++) {
    var s = document.createElement("i");
    s.className = "spark";
    btn.appendChild(s);
    sparks.push({ n: s, on: false, t: 0, life: 1, dx: 0, dy: 0 });
  }
  var si = 0;

  function fire() {
    if (btn.disabled) return;
    var k, s, a, d;
    for (k = 0; k < SPK; k++) {
      s = sparks[(si + k) % SPK];
      a = rnd(0, 6.2832);
      d = rnd(20, Math.max(34, w * 0.4));
      s.on = true; s.t = 0; s.life = rnd(0.5, 0.9);
      s.dx = Math.cos(a) * d;
      s.dy = Math.sin(a) * d * 0.6;
      s.n.style.transform = "translate3d(" + (w / 2).toFixed(1) + "px," + (h * 0.44).toFixed(1) + "px,0)";
    }
    si = (si + SPK) % SPK;
    btn.classList.add("is-fire");
    pill.classList.add("is-fire");
    pill.textContent = "Firing";
    hint.textContent = "Field inverted \ ions falling in";
    c1.textContent = "Inverted";
    window.clearTimeout(fire.tid);
    fire.tid = window.setTimeout(function () {
      btn.classList.remove("is-fire");
      pill.classList.remove("is-fire");
      pill.textContent = "Live";
      hint.textContent = "Tap the core to invert the field";
      c1.textContent = "Sealed";
    }, 620);
    c3.textContent = rnd(1.2, 8.4).toFixed(1) + " s ago";
  }

  btn.addEventListener("pointerdown", fire);
  btn.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") fire();
  });
  window.addEventListener("resize", function () {
    w = btn.offsetWidth || 260;
    h = btn.offsetHeight || 92;
    for (var node of nodes) {
      node.style.setProperty("--prx", (w * rnd(0.26, 0.4)).toFixed(1) + "px");
      node.style.setProperty("--pry", (h * rnd(0.14, 0.34)).toFixed(1) + "px");
    }
  });

  var prev = 0, t = 0;
  function frame(ts) {
    var now = performance.now();
    var dt = prev ? Math.min(60, ts - prev) : 16;
    prev = ts;
    t += dt;
    var k, s, u, e;
    for (k = 0; k < SPK; k++) {
      s = sparks[k];
      if (!s.on) continue;
      s.t += dt;
      u = s.t / (s.life * 1000);
      if (u >= 1) { s.on = false; s.n.style.opacity = "0"; continue; }
      e = 1 - Math.pow(1 - u, 2.3);
      s.n.style.opacity = (1 - u * u).toFixed(3);
      s.n.style.transform = "translate3d(" + (w / 2 + s.dx * e).toFixed(1) + "px," + (h * 0.44 + s.dy * e + 12 * u * u).toFixed(1) + "px,0) scale(" + (1 - u * 0.7).toFixed(2) + ")";
    }
    if (t > 180) {
      t = 0;
      var drift = Math.sin(now / 780) * 0.9 + Math.sin(now / 300) * 0.4;
      var volt = 4.2 + drift * 0.22;
      kv.textContent = volt.toFixed(2) + " kV";
      c2.textContent = (Math.abs(drift) * 3.4).toFixed(2) + " e/s";
    }
    window.requestAnimationFrame(frame);
  }
  window.requestAnimationFrame(frame);
})();

