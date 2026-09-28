(function () {
  "use strict";

  var calm = window.matchMedia("(prefers-reduced-motion: reduce)");

  var FACES = [
    { n: "F1", t: "Tulipa clusiana, Lady Jane", a: "Derek Ramsey (Ram-Man)", l: "CC BY-SA 3.0", p: "https://commons.wikimedia.org/wiki/File:Tulip_Tulipa_clusiana_%27Lady_Jane%27_Rock_Ledge_Flower_Edit_2000px.jpg" },
    { n: "F2", t: "Stargazer lilies", a: "Derek Ramsey (Ram-Man)", l: "GFDL 1.2", p: "https://commons.wikimedia.org/wiki/File:Stargazer_Lillies_Lillium_orientale_%27Stargazer%27_Flower_2000px.jpg" },
    { n: "F3", t: "Lilium, Citronella", a: "Derek Ramsey (Ram-Man)", l: "CC BY-SA 3.0", p: "https://commons.wikimedia.org/wiki/File:Lily_Lilium_%27Citronella%27_Flower.jpg" },
    { n: "F4", t: "Leucanthemum, Filigran", a: "Derek Ramsey (Ram-Man)", l: "CC BY-SA 3.0", p: "https://commons.wikimedia.org/wiki/File:Leucanthemum_vulgare_%27Filigran%27_Flower_2200px.jpg" },
    { n: "F5", t: "Osteospermum, Flower Power", a: "Derek Ramsey (Ram-Man)", l: "CC BY-SA 3.0", p: "https://commons.wikimedia.org/wiki/File:Osteospermum_Flower_Power_Spider_Purple_2134px.jpg" },
    { n: "F6", t: "Sunflower, wide macro", a: "Muhammad Mahdi Karim", l: "GFDL 1.2", p: "https://commons.wikimedia.org/wiki/File:Sunflower_macro_wide.jpg" },
    { n: "F7", t: "Bee on a purple flower, macro", a: "ForestWander", l: "CC BY-SA 3.0 US", p: "https://commons.wikimedia.org/wiki/File:Bee-Purple-Flower-Macro_ForestWander.jpg" },
    { n: "F8", t: "Flower macro, studio light", a: "Marius Iordache", l: "Public domain", p: "https://commons.wikimedia.org/wiki/File:Flower_macro_hd.jpg" }
  ];

  var N = FACES.length;
  var stage = document.getElementById("stage");
  var scene = document.getElementById("scene");
  var faces = Array.prototype.slice.call(document.querySelectorAll(".face"));
  var CUBE = faces.length;
  var rows = Array.prototype.slice.call(document.querySelectorAll(".ledger tbody tr"));
  var callout = document.getElementById("callout");
  var roYaw = document.getElementById("ro-yaw");
  var roPitch = document.getElementById("ro-pitch");
  var roFace = document.getElementById("ro-face");
  var roSpread = document.getElementById("ro-spread");
  var views = Array.prototype.slice.call(document.querySelectorAll("[data-rx]"));
  var fold = document.getElementById("fold");
  var turn = document.getElementById("turn");

  var lb = document.getElementById("lb");
  var lbImg = document.getElementById("lbImg");
  var lbNo = document.getElementById("lbNo");
  var lbT = document.getElementById("lbT");
  var lbA = document.getElementById("lbA");
  var lbP = document.getElementById("lbP");
  var lbX = document.getElementById("lbX");

  var rx = -18;
  var ry = -26;
  var spin = !calm.matches;
  var spreadOn = false;
  var spread = 0;
  var target = 0;
  var face = 0;
  var front = -1;
  var dragging = false;
  var grabX = 0;
  var grabY = 0;
  var grabRx = 0;
  var grabRy = 0;
  var opener = null;
  var t0 = 0;
  var raf = 0;

  var DIR = [[0, 0, 1], [1, 0, 0], [0, 0, -1], [-1, 0, 0], [0, -1, 0], [0, 1, 0]];

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  function paint() {
    scene.style.transform = "rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg)";
    var reach = 120 + spread;
    for (var i = 0; i < CUBE; i += 1) {
      var el = faces[i];
      var d = DIR[i];
      el.style.setProperty("--tx", (d[0] * reach).toFixed(1) + "px");
      el.style.setProperty("--ty", (d[1] * reach).toFixed(1) + "px");
      el.style.setProperty("--tz", (d[2] * reach).toFixed(1) + "px");
    }
    roYaw.textContent = String(Math.round(((ry % 360) + 360) % 360));
    roPitch.textContent = String(Math.round(-rx));
    roSpread.textContent = Math.round(spread / 420 * 100) + "%";
    faceOf();
  }

  function faceOf() {
    var cx = Math.cos(rx * Math.PI / 180);
    var sx = Math.sin(rx * Math.PI / 180);
    var cy = Math.cos(ry * Math.PI / 180);
    var sy = Math.sin(ry * Math.PI / 180);
    var best = 0;
    var bestDot = -2;
    for (var i = 0; i < CUBE; i += 1) {
      var d = DIR[i];
      var z = -cx * sy * d[0] + sx * d[1] + (sx * sy + cx * cy) * d[2];
      if (z > bestDot) { bestDot = z; best = i; }
    }
    if (best !== front) {
      front = best;
      face = best;
      roFace.textContent = FACES[best].n;
      callout.textContent = FACES[best].n + " \u00b7 " + FACES[best].t;
      faces.forEach(function (el, k) { el.classList.toggle("is-front", k === best); });
      rows.forEach(function (r, k) { r.classList.toggle("is-on", k === best); });
    }
  }

  function nudge(px, py) {
    rx = clamp(rx + py, -84, 84);
    ry += px;
    paint();
  }

  function setSpread(v) {
    spreadOn = v;
    target = spreadOn ? 260 : 0;
    fold.classList.toggle("is-on", spreadOn);
    fold.setAttribute("aria-pressed", spreadOn ? "true" : "false");
    fold.textContent = spreadOn ? "Fold faces" : "Unfold faces";
  }

  fold.addEventListener("click", function () { setSpread(!spreadOn); });
  document.getElementById("out").addEventListener("click", function () { target = clamp(target + 80, 0, 420); spread = target; paint(); });
  document.getElementById("in").addEventListener("click", function () { target = clamp(target - 80, 0, 420); spread = target; paint(); });

  turn.addEventListener("click", function () {
    spin = !spin && !calm.matches;
    turn.classList.toggle("is-on", spin);
    turn.setAttribute("aria-pressed", spin ? "true" : "false");
    turn.textContent = spin ? "Slow turn" : "Turn block";
  });

  views.forEach(function (btn) {
    btn.addEventListener("click", function () {
      rx = Number(btn.dataset.rx);
      ry = Number(btn.dataset.ry);
      views.forEach(function (b) { b.classList.toggle("is-on", b === btn); });
      paint();
    });
  });

  stage.addEventListener("pointerdown", function (ev) {
    dragging = true;
    grabX = ev.clientX;
    grabY = ev.clientY;
    grabRx = rx;
    grabRy = ry;
    stage.setPointerCapture(ev.pointerId);
  });

  stage.addEventListener("pointermove", function (ev) {
    if (!dragging) { return; }
    rx = clamp(grabRx - (ev.clientY - grabY) * 0.42, -84, 84);
    ry = grabRy + (ev.clientX - grabX) * 0.42;
    paint();
  });

  stage.addEventListener("pointerup", function () { dragging = false; });
  stage.addEventListener("pointercancel", function () { dragging = false; });

  stage.addEventListener("click", function (ev) {
    var f = ev.target.closest(".face, .ref");
    if (!f) { return; }
    openAt(Number(f.dataset.f), f);
  });

  function openAt(n, from) {
    face = (n + N) % N;
    var row = FACES[face];
    var img = document.querySelector('[data-f="' + face + '"] img');
    opener = from || null;
    lbImg.setAttribute("src", img.getAttribute("src"));
    lbImg.setAttribute("alt", img.getAttribute("alt"));
    lbNo.textContent = row.n + " / " + (N < 10 ? "0" + N : N);
    lbT.textContent = row.t;
    lbA.textContent = row.a + " \u00b7 " + row.l;
    lbP.setAttribute("href", row.p);
    lb.hidden = false;
    requestAnimationFrame(function () { lb.classList.add("is-open"); });
    lbX.focus();
  }

  function close() {
    lb.classList.remove("is-open");
    var seal = function () { lb.hidden = true; };
    if (calm.matches) { seal(); } else { setTimeout(seal, 280); }
    if (opener && document.contains(opener)) { opener.focus(); }
    opener = null;
  }

  function ring() {
    return Array.prototype.slice.call(
      lb.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])')
    ).filter(function (el) { return el.offsetParent !== null; });
  }

  document.getElementById("lbPrev").addEventListener("click", function () { openAt(face - 1, null); });
  document.getElementById("lbNext").addEventListener("click", function () { openAt(face + 1, null); });
  lbX.addEventListener("click", close);
  lb.querySelector(".lb__veil").addEventListener("click", close);

  document.addEventListener("keydown", function (ev) {
    if (!lb.hidden) {
      if (ev.key === "Escape") { ev.preventDefault(); close(); return; }
      if (ev.key === "Tab") {
        var box = ring();
        if (!box.length) { return; }
        var pos = box.indexOf(document.activeElement);
        var nxt = ev.shiftKey ? pos - 1 : pos + 1;
        if (nxt < 0 || nxt >= box.length) {
          ev.preventDefault();
          box[(nxt + box.length) % box.length].focus();
        }
        return;
      }
      if (ev.key === "ArrowRight") { ev.preventDefault(); openAt(face + 1, null); }
      else if (ev.key === "ArrowLeft") { ev.preventDefault(); openAt(face - 1, null); }
      else if (ev.key === "Home") { ev.preventDefault(); openAt(0, null); }
      else if (ev.key === "End") { ev.preventDefault(); openAt(N - 1, null); }
      return;
    }

    if (document.activeElement !== stage) { return; }
    if (ev.key === "ArrowRight") { ev.preventDefault(); nudge(9, 0); }
    else if (ev.key === "ArrowLeft") { ev.preventDefault(); nudge(-9, 0); }
    else if (ev.key === "ArrowUp") { ev.preventDefault(); nudge(0, -7); }
    else if (ev.key === "ArrowDown") { ev.preventDefault(); nudge(0, 7); }
    else if (ev.key === "+" || ev.key === "=") { ev.preventDefault(); target = clamp(target + 80, 0, 420); spread = target; paint(); }
    else if (ev.key === "-" || ev.key === "_") { ev.preventDefault(); target = clamp(target - 80, 0, 420); spread = target; paint(); }
    else if (ev.key === "]") { ev.preventDefault(); openAt(face + 1, null); }
    else if (ev.key === "[") { ev.preventDefault(); openAt(face - 1, null); }
    else if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); openAt(face, null); }
  });

  function loop(now) {
    raf = requestAnimationFrame(loop);
    var dt = Math.min(48, now - (loop.last || now));
    loop.last = now;
    if (!t0) { t0 = now; }
    if (spin && !dragging) {
      ry += 0.028 * dt;
      paint();
    }
    if (Math.abs(target - spread) > 0.4) {
      spread += (target - spread) * Math.min(1, dt / 260);
      paint();
    }
  }

  turn.classList.toggle("is-on", spin);
  turn.setAttribute("aria-pressed", spin ? "true" : "false");
  turn.textContent = spin ? "Slow turn" : "Turn block";
  paint();
  if (!calm.matches) { raf = requestAnimationFrame(loop); }
  window.addEventListener("pagehide", function () { cancelAnimationFrame(raf); });
}());
