(function () {
  "use strict";
  var btn = document.getElementById("ig");
  if (!btn) return;
  var hud = document.querySelector(".hud");
  var fx = document.getElementById("fx");
  var lock = document.getElementById("lock");
  var st = document.getElementById("st");
  var code = document.getElementById("code");
  var v = [document.getElementById("v1"), document.getElementById("v2"), document.getElementById("v3"),
    document.getElementById("v4"), document.getElementById("v5"), document.getElementById("v6")];
  var bar = [document.getElementById("b1"), document.getElementById("b2"), document.getElementById("b3"),
    document.getElementById("b4"), document.getElementById("b5"), document.getElementById("b6")];

  function rnd(a, b) { return a + Math.random() * (b - a); }
  function clamp(x, a, b) {
    if (x < a) return a;
    if (x > b) return b;
    return x;
  }

  var SPK = 14;
  var sparks = [], i;
  for (i = 0; i < SPK; i++) {
    var sp = document.createElement("i");
    sp.className = "fr-spark";
    fx.appendChild(sp);
    sparks.push({ n: sp, on: false, t: 0, life: 1, dx: 0, dy: 0 });
  }
  var waves = [];
  for (i = 0; i < 3; i++) {
    var wv = document.createElement("i");
    wv.className = "fr-wave";
    fx.appendChild(wv);
    waves.push({ n: wv, on: false, t: 0 });
  }
  var arcs = [];
  for (i = 0; i < 2; i++) {
    var ac = document.createElement("i");
    ac.className = "fr-arc";
    fx.appendChild(ac);
    arcs.push({ n: ac, on: false, t: 0 });
  }

  var temp = 61.4, peak = 24.6, seq = 0, hot = false, tmr = 0;
  var w = btn.offsetWidth || 240;
  var base = [0.52, 0.66, 0.42, 0.46, 0.36, 0.48];
  var txt = ["2.62e20", "6.40 T", "0.42 mm", "61.4 MK", "0.31e19", "8.02e14"];
  var live = [1.9, 6.3, 0.42, 24.6, 0.34, 8.2];

  function paint() {
    for (var k = 0; k < 6; k++) {
      bar[k].style.transform = "scaleX(" + clamp(base[k], 0.04, 1).toFixed(3) + ")";
    }
    v[3].textContent = temp.toFixed(1) + " MK";
    code.textContent = "SEQ " + (seq < 100 ? ("00" + seq).slice(-3) : seq) + " \\ " + (hot ? "BURN" : "IDLE");
  }

  function ignite() {
    if (btn.disabled) return;
    seq++;
    peak = rnd(88, 99);
    hot = true;
    btn.classList.add("is-ignite");
    hud.classList.add("is-hot", "is-lock");
    lock.textContent = "Lock \\ burn";
    st.textContent = "Core burn \\ venting";
    var k, s, wv, ac;
    for (k = 0; k < SPK; k++) {
      s = sparks[k];
      var a = rnd(0, 6.2832);
      var d = rnd(22, Math.max(34, w * 0.42));
      s.on = true; s.t = 0; s.life = rnd(0.45, 0.9);
      s.dx = Math.cos(a) * d;
      s.dy = Math.sin(a) * d * 0.6;
      s.n.style.transform = "translate3d(0,0,0)";
    }
    for (k = 0; k < 2; k++) {
      wv = waves[k];
      wv.on = true; wv.t = -k * 0.11;
    }
    for (k = 0; k < 2; k++) {
      ac = arcs[k];
      ac.on = true; ac.t = -k * 0.06;
    }
    window.clearTimeout(tmr);
    tmr = window.setTimeout(function () {
      btn.classList.remove("is-ignite");
      hud.classList.remove("is-hot", "is-lock");
      lock.textContent = "Seeking";
      st.textContent = "Containment nominal";
    }, 640);
  }

  function microArc() {
    var a = Math.floor(rnd(0, arcs.length));
    if (a > arcs.length - 1) a = arcs.length - 1;
    arcs[a].on = true;
    arcs[a].t = 0;
  }

  var REST = 61.4;
  var prev = 0, tAcc = 0, nextArc = 1400;
  function frame(ts) {
    var now = performance.now();
    var dt = prev ? Math.min(60, ts - prev) : 16;
    prev = ts;
    tAcc += dt;
    if (now > nextArc) {
      nextArc = now + rnd(900, 2600);
      microArc();
    }
    temp += (REST - temp) * (1 - Math.exp(-dt / 640));
    if (hot && temp < peak) temp += (peak - temp) * (1 - Math.exp(-dt / 90));
    var n = Math.sin(tAcc / 700) * 0.5 + Math.sin(tAcc / 260) * 0.22;
    base[0] = clamp(0.52 + n * 0.06 + (peak - 24.6) * 0.0022, 0.05, 1);
    base[1] = clamp(0.66 + n * 0.05 + (peak - 24.6) * 0.0038, 0.05, 1);
    base[2] = clamp(0.42 + n * 0.04 + (peak - 24.6) * 0.0026, 0.05, 1);
    base[3] = clamp((temp - 20) / 92, 0.05, 1);
    base[4] = clamp(0.36 + n * 0.05 + (peak - 24.6) * 0.0028, 0.05, 1);
    base[5] = clamp(0.48 + n * 0.07 + (peak - 24.6) * 0.0016, 0.05, 1);
    paint();
    if (tAcc > 260) {
      tAcc = 0;
      live[0] = base[0] * 5.2; live[1] = 4 + base[1] * 12; live[2] = 0.2 + base[2] * 1.1;
      live[4] = base[4] * 12; live[5] = 4 + base[5] * 58;
      txt[0] = live[0].toFixed(2) + "e20";
      txt[1] = live[1].toFixed(2) + " T";
      txt[2] = live[2].toFixed(2) + " mm";
      txt[4] = live[4].toFixed(2) + "e19";
      txt[5] = live[5].toFixed(2) + "e14";
      v[0].textContent = txt[0];
      v[1].textContent = txt[1];
      v[2].textContent = txt[2];
      v[4].textContent = txt[4];
      v[5].textContent = txt[5];
    }
    var k, s, u, e2;
    for (k = 0; k < SPK; k++) {
      s = sparks[k];
      if (!s.on) continue;
      s.t += dt;
      u = s.t / (s.life * 1000);
      if (u >= 1) { s.on = false; s.n.style.opacity = "0"; continue; }
      e2 = 1 - Math.pow(1 - u, 2.3);
      s.n.style.opacity = (1 - u * u).toFixed(3);
      s.n.style.transform = "translate3d(" + (s.dx * e2).toFixed(1) + "px," + (s.dy * e2 + 12 * u * u).toFixed(1) + "px,0) scale(" + (1 - u * 0.7).toFixed(2) + ")";
    }
    for (k = 0; k < waves.length; k++) {
      var wv = waves[k];
      if (!wv.on) continue;
      wv.t += dt;
      if (wv.t < 0) continue;
      var wu = wv.t / 820;
      if (wu >= 1) { wv.on = false; wv.n.style.opacity = "0"; continue; }
      wv.n.style.opacity = (wu < 0.14 ? wu / 0.14 * 0.9 : 0.9 * (1 - (wu - 0.14) / 0.86)).toFixed(3);
      wv.n.style.transform = "translate3d(0,0,0) scale(" + (0.4 + wu * 3.1).toFixed(3) + ")";
    }
    for (k = 0; k < arcs.length; k++) {
      var ac = arcs[k];
      if (!ac.on) continue;
      ac.t += dt;
      if (ac.t < 0) continue;
      var au = ac.t / 360;
      if (au >= 1) { ac.on = false; ac.n.style.opacity = "0"; continue; }
      var rot = -16 + au * 12 + (au < 0.5 ? 0 : 6);
      ac.n.style.opacity = (au < 0.12 ? au / 0.12 : 1 - Math.pow((au - 0.12) / 0.88, 1.4)).toFixed(3);
      ac.n.style.transform = "translate3d(0,0,0) rotate(" + rot.toFixed(2) + "deg) scaleX(" + (0.2 + Math.sin(Math.min(1, au * 1.6) * Math.PI) * 0.9).toFixed(3) + ")";
    }
    if (hot) btn.style.filter = "brightness(" + (1 + (peak - 24.6) / 190).toFixed(3) + ") saturate(1.08)";
    else if (btn.style.filter) btn.style.filter = "";
    window.requestAnimationFrame(frame);
  }

  btn.addEventListener("pointerdown", ignite);
  btn.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") ignite();
  });
  window.addEventListener("resize", function () { w = btn.offsetWidth || 240; });
  paint();
  window.requestAnimationFrame(frame);
})();
