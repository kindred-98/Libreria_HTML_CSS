(function () {
  "use strict";

  var calm = window.matchMedia("(prefers-reduced-motion: reduce)");

  var SIGNS = [
    { t: "Pawn shop and restaurant, Kwun Tong", a: "Nuihongsaem", l: "CC BY-SA 3.0", n: "Kwun Tong",
      p: "https://commons.wikimedia.org/wiki/File:HK_Kwun_Tong_night_%E8%BC%94%E4%BB%81%E8%A1%97_Fu_Yan_Street_%E8%8F%AF%E7%94%9F%E6%8A%BC_Pawn_shop_Restaurant_neon_signs.JPG",
      s: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/HK_Kwun_Tong_night_%E8%BC%94%E4%BB%81%E8%A1%97_Fu_Yan_Street_%E8%8F%AF%E7%94%9F%E6%8A%BC_Pawn_shop_Restaurant_neon_signs.JPG/960px-HK_Kwun_Tong_night_%E8%BC%94%E4%BB%81%E8%A1%97_Fu_Yan_Street_%E8%8F%AF%E7%94%9F%E6%8A%BC_Pawn_shop_Restaurant_neon_signs.JPG" },
    { t: "Lizard King Club, Piotrkowska Street", a: "Zorro2212", l: "CC BY-SA 3.0", n: "Lizard King Club",
      p: "https://commons.wikimedia.org/wiki/File:Lizard_King_Club_neon_sign_-_night_shot%2C_%C5%81%C3%B3d%C5%BA_62_Piotrkowska_Street.jpg",
      s: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Lizard_King_Club_neon_sign_-_night_shot%2C_%C5%81%C3%B3d%C5%BA_62_Piotrkowska_Street.jpg/960px-Lizard_King_Club_neon_sign_-_night_shot%2C_%C5%81%C3%B3d%C5%BA_62_Piotrkowska_Street.jpg" },
    { t: "Neon sign, Piotrkowska Street", a: "Zorro2212", l: "CC BY-SA 3.0", n: "Piotrkowska Street",
      p: "https://commons.wikimedia.org/wiki/File:Neon_sign_-_night_shot%2C_%C5%81%C3%B3d%C5%BA_Piotrkowska_Street.jpg",
      s: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Neon_sign_-_night_shot%2C_%C5%81%C3%B3d%C5%BA_Piotrkowska_Street.jpg/960px-Neon_sign_-_night_shot%2C_%C5%81%C3%B3d%C5%BA_Piotrkowska_Street.jpg" },
    { t: "Teatr Nowy, Wieckowskiego Street", a: "Zorro2212", l: "CC BY-SA 3.0", n: "Teatr Nowy",
      p: "https://commons.wikimedia.org/wiki/File:Teatr_Nowy_neon_sign_-_night_shot%2C_%C5%81%C3%B3d%C5%BA_15_Wi%C4%99ckowskiego_Street.jpg",
      s: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Teatr_Nowy_neon_sign_-_night_shot%2C_%C5%81%C3%B3d%C5%BA_15_Wi%C4%99ckowskiego_Street.jpg/960px-Teatr_Nowy_neon_sign_-_night_shot%2C_%C5%81%C3%B3d%C5%BA_15_Wi%C4%99ckowskiego_Street.jpg" },
    { t: "Hong Kong night street", a: "Wilfredor", l: "CC0", n: "Hong Kong Street",
      p: "https://commons.wikimedia.org/wiki/File:Hong_Kong_night_street_2.jpg",
      s: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Hong_Kong_night_street_2.jpg/960px-Hong_Kong_night_street_2.jpg" },
    { t: "Neon signs at night, 24 October 2014", a: "Tokumeigakarinoaoshima", l: "CC0", n: "Night Walk, 24 Oct",
      p: "https://commons.wikimedia.org/wiki/File:Neon_signs_at_night%2C_24th_October_2014_%281%29.JPG",
      s: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Neon_signs_at_night%2C_24th_October_2014_%281%29.JPG/960px-Neon_signs_at_night%2C_24th_October_2014_%281%29.JPG" },
    { t: "Neon signs at night, plate two", a: "Tokumeigakarinoaoshima", l: "CC0", n: "Night Walk, plate two",
      p: "https://commons.wikimedia.org/wiki/File:Neon_signs_at_night%2C_24th_October_2014.JPG",
      s: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Neon_signs_at_night%2C_24th_October_2014.JPG/960px-Neon_signs_at_night%2C_24th_October_2014.JPG" },
    { t: "Dotombori neon, 20 September 2015", a: "Soramimi", l: "CC BY-SA 4.0", n: "Dotombori, canal side",
      p: "https://commons.wikimedia.org/wiki/File:Neon_signs_of_Dotombori_at_night_20150920-3.JPG",
      s: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Neon_signs_of_Dotombori_at_night_20150920-3.JPG/960px-Neon_signs_of_Dotombori_at_night_20150920-3.JPG" },
    { t: "Dotombori neon, later plate", a: "Soramimi", l: "CC BY-SA 4.0", n: "Dotombori, gantry",
      p: "https://commons.wikimedia.org/wiki/File:Neon_signs_of_Dotombori_at_night_20150920-4.JPG",
      s: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Neon_signs_of_Dotombori_at_night_20150920-4.JPG/960px-Neon_signs_of_Dotombori_at_night_20150920-4.JPG" }
  ];

  var N = SIGNS.length;

  var runA = document.getElementById("runA");
  var runB = document.getElementById("runB");
  var board = document.getElementById("board");
  var bulb = document.getElementById("bulb");
  var band = document.getElementById("band");
  var readNo = document.getElementById("readNo");
  var readDir = document.getElementById("readDir");
  var readRate = document.getElementById("readRate");
  var hint = document.getElementById("hint");

  var lb = document.getElementById("lb");
  var lbImg = document.getElementById("lbImg");
  var lbNo = document.getElementById("lbNo");
  var lbT = document.getElementById("lbT");
  var lbA = document.getElementById("lbA");
  var lbP = document.getElementById("lbP");
  var lbX = document.getElementById("lbX");

  var unit = 0;
  var slot = 0;
  var xa = 0;
  var xb = 0;
  var vel = 0.03;
  var dir = 1;
  var rate = 1;
  var running = !calm.matches;
  var over = false;
  var at = 0;
  var opener = null;
  var raf = 0;
  var t0 = 0;

  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  function frame(sign, i, tag) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "frame";
    b.dataset.i = String(i);
    b.setAttribute("aria-label", "Open sign " + pad(i + 1) + ", " + sign.t);
    var fr = document.createElement("span");
    fr.className = "frame__fr f" + ((i % 6) + 1);
    var im = document.createElement("img");
    im.src = sign.s;
    im.alt = sign.t;
    im.loading = "lazy";
    im.decoding = "async";
    fr.appendChild(im);
    var cap = document.createElement("span");
    cap.className = "frame__cap";
    cap.textContent = tag + sign.n;
    b.appendChild(fr);
    b.appendChild(cap);
    return b;
  }

  function build() {
    var setA = document.createElement("div");
    setA.className = "set";
    var setB = document.createElement("div");
    setB.className = "set";
    for (var i = 0; i < N; i += 1) {
      setA.appendChild(frame(SIGNS[i], i, pad(i + 1) + "  "));
      setB.appendChild(frame(SIGNS[i], i, "\u00b7  "));
    }
    runA.appendChild(setA);
    runB.appendChild(setB);
  }

  function measure() {
    var setA = runA.firstElementChild;
    var w = setA.getBoundingClientRect().width || 1;
    var need = Math.ceil((window.innerWidth * 2 + 500) / w) + 1;
    var guard = 0;
    while (runA.children.length < need && guard < 20) { runA.appendChild(setA.cloneNode(true)); guard += 1; }
    var setB = runB.firstElementChild;
    guard = 0;
    while (runB.children.length < need && guard < 20) { runB.appendChild(setB.cloneNode(true)); guard += 1; }
    unit = setA.getBoundingClientRect().width;
    slot = unit / N;
    return unit;
  }

  function place() {
    if (unit <= 0) { return; }
    runA.style.transform = "translate3d(" + (-xa).toFixed(2) + "px,0,0)";
    runB.style.transform = "translate3d(" + (-xb).toFixed(2) + "px,0,0)";
    var set = runA.firstElementChild;
    for (var i = 0; i < N; i += 1) {
      set.children[i].classList.toggle("is-front", i === at);
    }
  }

  function paint() {
    readNo.textContent = pad(at + 1);
    readDir.textContent = dir > 0 ? "RIGHT" : "LEFT";
    readRate.textContent = rate.toFixed(1);
  }

  function step(n) {
    at = (at + n + N * 8) % N;
    xa += slot * n;
    xb -= slot * n * 0.6;
    if (xa < 0) { xa += unit; }
    if (xa > unit) { xa -= unit; }
    if (xb < 0) { xb += unit; }
    if (xb > unit) { xb -= unit; }
    place();
    paint();
  }

  function open(n, from) {
    at = (n + N) % N;
    var sign = SIGNS[at];
    opener = from || null;
    lbImg.setAttribute("src", sign.s);
    lbImg.setAttribute("alt", sign.t);
    lbNo.textContent = pad(at + 1) + " / " + pad(N);
    lbT.textContent = sign.t;
    lbA.textContent = sign.a + " \u00b7 " + sign.l;
    lbP.setAttribute("href", sign.p);
    lb.hidden = false;
    requestAnimationFrame(function () { lb.classList.add("is-open"); });
    lbX.focus();
    place();
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

  function setRunning(on) {
    running = on && !calm.matches;
    bulb.classList.toggle("is-on", running);
    bulb.setAttribute("aria-pressed", running ? "true" : "false");
    bulb.textContent = running ? "Chase" : "Hold";
  }

  bulb.addEventListener("click", function () { setRunning(!running); });

  board.addEventListener("pointerenter", function () { over = true; });
  board.addEventListener("pointerleave", function () { over = false; });
  board.addEventListener("focusin", function () { over = true; });
  board.addEventListener("focusout", function () { over = false; });

  board.addEventListener("click", function (ev) {
    var f = ev.target.closest(".frame");
    if (!f) { return; }
    open(Number(f.dataset.i), f);
  });

  hint.addEventListener("click", function () { open(at, hint); });

  document.getElementById("lbPrev").addEventListener("click", function () { open(at - 1, null); });
  document.getElementById("lbNext").addEventListener("click", function () { open(at + 1, null); });
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
      if (ev.key === "ArrowRight") { ev.preventDefault(); open(at + 1, null); }
      else if (ev.key === "ArrowLeft") { ev.preventDefault(); open(at - 1, null); }
      else if (ev.key === "Home") { ev.preventDefault(); open(0, null); }
      else if (ev.key === "End") { ev.preventDefault(); open(N - 1, null); }
      return;
    }

    if (!ev.target.closest(".board") && !ev.target.closest(".signboard")) { return; }
    if (ev.key === "ArrowRight") { ev.preventDefault(); setRunning(false); step(1); }
    else if (ev.key === "ArrowLeft") { ev.preventDefault(); setRunning(false); step(-1); }
    else if (ev.key === "PageDown") { ev.preventDefault(); setRunning(false); step(3); }
    else if (ev.key === "PageUp") { ev.preventDefault(); setRunning(false); step(-3); }
    else if (ev.key === "Home") { ev.preventDefault(); setRunning(false); step(-at); }
    else if (ev.key === "End") { ev.preventDefault(); setRunning(false); step(N - 1 - at); }
    else if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); open(at, null); }
    else if (ev.key === "r" || ev.key === "R") { ev.preventDefault(); setRunning(!running); }
    else if (ev.key === "d" || ev.key === "D") { ev.preventDefault(); dir = -dir; paint(); }
  });

  function loop(now) {
    raf = requestAnimationFrame(loop);
    var dt = Math.min(48, now - (loop.last || now));
    loop.last = now;
    if (!t0) { t0 = now; }
    var s = (now - t0) / 1000;
    band.style.transform = "translate3d(" + (((s * 200) % 1400) - 320).toFixed(2) + "px,0,0)";

    if (running && !over && unit > 0) {
      xa += vel * dt * rate * dir;
      xb -= vel * dt * rate * dir * 0.6;
      if (xa < 0) { xa += unit; }
      if (xa > unit) { xa -= unit; }
      if (xb < 0) { xb += unit; }
      if (xb > unit) { xb -= unit; }
      place();
    }
  }

  build();
  measure();
  setRunning(running);
  paint();
  place();
  window.addEventListener("resize", function () { measure(); place(); });
  window.addEventListener("pagehide", function () { cancelAnimationFrame(raf); });
  if (!calm.matches) { raf = requestAnimationFrame(loop); }
}());
