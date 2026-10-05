(function () {
  "use strict";

  var calm = window.matchMedia("(prefers-reduced-motion: reduce)");

  var SHOTS = [
    { n: "Pastilles", t: "F1", a: "Evan-Amos", l: "CC0", p: "https://commons.wikimedia.org/wiki/File:Rowntrees-Fruit-Gums.jpg",
      note: "Hard fruit boiled down with sugar and cut into shapes: orange, red, deep purple and one green that has no business being there." },
    { n: "A red fruit on the branch", t: "F2", a: "Chenspec", l: "CC BY-SA 3.0", p: "https://commons.wikimedia.org/wiki/File:Fruit_trees_%D7%A2%D7%A6%D7%99_%D7%A4%D7%A8%D7%99_(20).JPG",
      note: "Still on the tree and already the size of a fist, with long pointed leaves cutting across the frame." },
    { n: "Crates of apples and grapes", t: "F3", a: "Fortepan, donor Konok Tamás", l: "CC BY-SA 3.0", p: "https://commons.wikimedia.org/wiki/File:Market%2C_fruit%2C_grape%2C_colorful%2C_scale%2C_crate%2C_apple_Fortepan_27274.jpg",
      note: "Wooden crates stacked with red and green apples and a dark mass of grapes on top, everything lit like a still life." },
    { n: "Yellow berries in blossom", t: "F4", a: "joelfotos", l: "CC0", p: "https://commons.wikimedia.org/wiki/File:Colorful_bird_eating_seeds_1200227.jpg",
      note: "Small round yellow fruit hung along a branch, with white blossom and broad green leaves behind it." },
    { n: "Jelly under whipped cream", t: "F5", a: "epodrez", l: "CC BY 2.0", p: "https://commons.wikimedia.org/wiki/File:Colorful_Fruit_Jelly_with_whipped_cream_(KETO%2C_LCHF%2C_Low_Carb%2C_Gluten_free%2C_FIT)_-_52775010313.jpg",
      note: "Two glasses, one layer of amber over one of pink, and enough whipped cream to hide the join." },
    { n: "Oranges, apple, peel", t: "F6", a: "Nenad Stojkovic", l: "CC BY 2.0", p: "https://commons.wikimedia.org/wiki/File:Colorful_fresh_fruits_closeup.jpg",
      note: "The whole frame given over to citrus, with one green apple holding the corner and a curl of peel on top." },
    { n: "Fruit chaat in a green bowl", t: "I1", a: "Nami Verma", l: "CC BY-SA 4.0", p: "https://commons.wikimedia.org/wiki/File:Indian_Fruit_Chaat.jpg",
      note: "Chopped apple and pear dusted with spice, a fork left standing in the bowl as evidence." },
    { n: "A dim stall, lit by a lamp", t: "I2", a: "Fortepan, donor Konok Tamás", l: "CC BY-SA 3.0", p: "https://commons.wikimedia.org/wiki/File:Market%2C_fruit%2C_grape%2C_colorful%2C_apple%2C_basket%2C_crate%2C_scale%2C_gurkin%2C_leavened_gherkin_Fortepan_27081.jpg",
      note: "A glass jar of dark fruit, a mound of berries, and apples heaped in a basket in a room lit by one bulb." },
    { n: "Bananas under the awning", t: "I3", a: "Fortepan, donor Lőw Miklós", l: "CC BY-SA 3.0", p: "https://commons.wikimedia.org/wiki/File:Colorful%2C_fruit%2C_market%2C_awning%2C_banana%2C_turban_Fortepan_93673.jpg",
      note: "A table of bananas and produce with the stallholder standing behind it, half in shadow under the tarpaulin." }
  ];

  var N = SHOTS.length;

  var stage = document.getElementById("stage");
  var crate = document.getElementById("crate");
  var faces = Array.prototype.slice.call(document.querySelectorAll(".face"));
  var frames = Array.prototype.slice.call(document.querySelectorAll("img[data-frame]"));
  var inside = document.getElementById("inside");
  var callout = document.getElementById("callout");
  var rYaw = document.getElementById("rYaw");
  var rDoor = document.getElementById("rDoor");
  var rFace = document.getElementById("rFace");
  var rInside = document.getElementById("rInside");
  var rTurn = document.getElementById("rTurn");
  var bNo = document.getElementById("bNo");
  var bName = document.getElementById("bName");
  var bNote = document.getElementById("bNote");
  var bCredit = document.getElementById("bCredit");
  var doorBtn = document.getElementById("door");
  var doorLabel = document.getElementById("doorLabel");
  var spinBtn = document.getElementById("spin");
  var spinLabel = document.getElementById("spinLabel");
  var openBtn = document.getElementById("open");

  var lb = document.getElementById("lb");
  var lbImg = document.getElementById("lbImg");
  var lbNo = document.getElementById("lbNo");
  var lbName = document.getElementById("lbName");
  var lbNote = document.getElementById("lbNote");
  var lbCredit = document.getElementById("lbCredit");
  var lbLink = document.getElementById("lbLink");
  var lbX = document.getElementById("lbX");

  var DIR = [[0, 0, 1], [1, 0, 0], [0, 0, -1], [-1, 0, 0], [0, -1, 0], [0, 1, 0]];

  var yaw = -24;
  var tilt = -12;
  var spin = !calm.matches;
  var isOpen = false;
  var face = 0;
  var front = -1;
  var shot = 0;
  var drag = false;
  var grabX = 0;
  var grabY = 0;
  var grabYaw = 0;
  var grabTilt = 0;
  var opener = null;
  var raf = 0;
  var last = 0;

  function pad(n) { return n < 10 ? "0" + n : String(n); }

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  function paint() {
    crate.style.setProperty("--yaw", yaw.toFixed(2) + "deg");
    crate.style.setProperty("--tilt", tilt.toFixed(2) + "deg");
    rYaw.textContent = String(Math.round(((yaw % 360) + 360) % 360));
    faceOf();
  }

  function faceOf() {
    var rx = tilt * Math.PI / 180;
    var ry = yaw * Math.PI / 180;
    var cx = Math.cos(rx);
    var sx = Math.sin(rx);
    var cy = Math.cos(ry);
    var sy = Math.sin(ry);
    var best = 0;
    var bestZ = -2;
    for (var i = 0; i < 6; i += 1) {
      var d = DIR[i];
      var z = -cx * sy * d[0] + sx * d[1] + (sx * sy + cx * cy) * d[2];
      if (z > bestZ) { bestZ = z; best = i; }
    }
    if (best === front) { return; }
    front = best;
    face = best;
    faces.forEach(function (el, k) { el.classList.toggle("is-front", k === best); });
    var s = SHOTS[best];
    rFace.textContent = s.t;
    callout.textContent = s.t + " \u00b7 " + s.n.toLowerCase();
    bNo.textContent = "Plate " + pad(best + 1);
    bName.textContent = s.n;
    bNote.textContent = s.note;
    bCredit.textContent = s.a + " \u00b7 " + s.l;
  }

  var insideChips = Array.prototype.slice.call(inside.querySelectorAll(".chip"));

  function setDoor(on) {
    isOpen = on;
    crate.classList.toggle("is-open", on);
    doorBtn.setAttribute("aria-pressed", on ? "true" : "false");
    doorBtn.classList.toggle("is-on", on);
    doorLabel.textContent = on ? "Close the door" : "Drop the door";
    rDoor.textContent = on ? "Open" : "Shut";
    rInside.textContent = on ? "3 on show" : "3 hidden";
    inside.setAttribute("aria-hidden", on ? "false" : "true");
    insideChips.forEach(function (c) { c.setAttribute("tabindex", on ? "0" : "-1"); });
  }

  function setSpin(on) {
    spin = on && !calm.matches;
    spinBtn.setAttribute("aria-pressed", spin ? "true" : "false");
    spinBtn.classList.toggle("is-on", spin);
    spinLabel.textContent = spin ? "Stop the turn" : "Start the turn";
    rTurn.textContent = spin ? "Slow" : "Still";
  }

  function openAt(n, from) {
    shot = ((n % N) + N) % N;
    var s = SHOTS[shot];
    var img = frames[shot];
    opener = from || null;
    lbImg.setAttribute("src", img.getAttribute("src"));
    lbImg.setAttribute("alt", img.getAttribute("alt"));
    lbNo.textContent = "Plate " + pad(shot + 1) + " of " + pad(N);
    lbName.textContent = s.n;
    lbNote.textContent = s.note;
    lbCredit.textContent = s.a + " \u00b7 " + s.l;
    lbLink.setAttribute("href", s.p);
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

  stage.addEventListener("click", function (ev) {
    var p = ev.target.closest("[data-shot]");
    if (!p) { return; }
    openAt(Number(p.dataset.shot), p);
  });

  stage.addEventListener("pointerdown", function (ev) {
    drag = true;
    grabX = ev.clientX;
    grabY = ev.clientY;
    grabYaw = yaw;
    grabTilt = tilt;
    stage.setPointerCapture(ev.pointerId);
  });

  stage.addEventListener("pointermove", function (ev) {
    if (!drag) { return; }
    yaw = grabYaw + (ev.clientX - grabX) * 0.42;
    tilt = clamp(grabTilt - (ev.clientY - grabY) * 0.32, -62, 62);
    paint();
  });

  function endDrag() { drag = false; }
  stage.addEventListener("pointerup", endDrag);
  stage.addEventListener("pointercancel", endDrag);

  doorBtn.addEventListener("click", function () { setDoor(!isOpen); });
  spinBtn.addEventListener("click", function () { setSpin(!spin); });
  document.getElementById("left").addEventListener("click", function () { yaw -= 45; paint(); });
  document.getElementById("right").addEventListener("click", function () { yaw += 45; paint(); });
  document.getElementById("tip").addEventListener("click", function () { tilt = tilt > -30 ? -30 : -78; paint(); });
  openBtn.addEventListener("click", function () { openAt(face, openBtn); });

  var manifestLinks = Array.prototype.slice.call(document.querySelectorAll(".manifest__list a"));
  manifestLinks.forEach(function (a) {
    a.addEventListener("click", function (ev) {
      ev.preventDefault();
      openAt(Number(a.dataset.shot), a);
    });
  });

  lbX.addEventListener("click", close);
  lb.querySelector(".lb__veil").addEventListener("click", close);
  document.getElementById("lbPrev").addEventListener("click", function () { openAt(shot - 1, null); });
  document.getElementById("lbNext").addEventListener("click", function () { openAt(shot + 1, null); });

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
      if (ev.key === "ArrowRight") { ev.preventDefault(); openAt(shot + 1, null); }
      else if (ev.key === "ArrowLeft") { ev.preventDefault(); openAt(shot - 1, null); }
      else if (ev.key === "Home") { ev.preventDefault(); openAt(0, null); }
      else if (ev.key === "End") { ev.preventDefault(); openAt(N - 1, null); }
      return;
    }
    if (ev.key === "o" || ev.key === "O") { ev.preventDefault(); setDoor(!isOpen); return; }
    if (ev.key === " ") { ev.preventDefault(); setSpin(!spin); return; }
    if (document.activeElement !== stage) { return; }
    if (ev.key === "ArrowRight") { ev.preventDefault(); yaw += 9; paint(); }
    else if (ev.key === "ArrowLeft") { ev.preventDefault(); yaw -= 9; paint(); }
    else if (ev.key === "ArrowUp") { ev.preventDefault(); tilt = clamp(tilt + 7, -62, 62); paint(); }
    else if (ev.key === "ArrowDown") { ev.preventDefault(); tilt = clamp(tilt - 7, -62, 62); paint(); }
    else if (ev.key === "Enter") { ev.preventDefault(); openAt(face, stage); }
  });

  function loop(now) {
    raf = requestAnimationFrame(loop);
    var dt = Math.min(64, now - (last || now));
    last = now;
    if (spin && !drag) {
      yaw += 0.024 * dt;
      paint();
    }
  }

  setDoor(false);
  setSpin(spin);
  paint();
  if (!calm.matches) { raf = requestAnimationFrame(loop); }
  window.addEventListener("pagehide", function () { cancelAnimationFrame(raf); });
}());
