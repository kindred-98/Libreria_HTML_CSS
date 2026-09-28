(function () {
  "use strict";

  var calm = window.matchMedia("(prefers-reduced-motion: reduce)");

  var SHOTS = [
    { n: "Sky and signage", read: "The topmost sheet, the one that carries the signs.", a: "Basile Morin", l: "CC BY-SA 4.0", p: "https://commons.wikimedia.org/wiki/File:Buildings_with_colorful_neon_street_signs_at_blue_hour,_Shinjuku,_Tokyo.jpg" },
    { n: "Roofline", read: "A wide curved front lit along its ribs, with the moon in shot.", a: "Masato Ohta", l: "CC BY 2.0", p: "https://commons.wikimedia.org/wiki/File:Tokyo_Big_Sight_at_Night.jpg" },
    { n: "The sign band", read: "Where the money is: vertical signs in every script, stacked.", a: "Basile Morin", l: "CC BY-SA 4.0", p: "https://commons.wikimedia.org/wiki/File:Colorful_neon_street_signs_in_Kabukich%C5%8D,_Shinjuku,_Tokyo.jpg" },
    { n: "Facades", read: "Lit shopfronts shoulder to shoulder above a wet road.", a: "Martin Falbisoner", l: "CC BY-SA 3.0", p: "https://commons.wikimedia.org/wiki/File:Night_in_Shinjuku_3.JPG" },
    { n: "The crossing", read: "The bottom sheet: a crowd blurred by a long exposure.", a: "Benh LIEU SONG", l: "CC BY-SA 2.0", p: "https://commons.wikimedia.org/wiki/File:Tokyo_Shibuya_Scramble_Crossing_2018-10-09.jpg" },
    { n: "Crossing at street level", read: "A wide street with people on the kerb and a cafe sign on the corner.", a: "Øyvind Holmstad", l: "CC BY-SA 4.0", p: "https://commons.wikimedia.org/wiki/File:TOKYO_BIG_STREET_BY_NIGHT_2017.jpg" },
    { n: "The avenue, north end", read: "Taxis and vans on a zebra crossing with signs on every side.", a: "Basile Morin", l: "CC BY-SA 4.0", p: "https://commons.wikimedia.org/wiki/File:Yasukuni-dori_Avenue_at_night_with_vehicles_and_colorful_neon_street_signs,_Shinjuku,_Tokyo,_Japan.jpg" },
    { n: "The red gate", read: "A gate of red bulbs over a narrow street full of people.", a: "Basile Morin", l: "CC BY-SA 4.0", p: "https://commons.wikimedia.org/wiki/File:Kabukicho_red_gate_and_colorful_neon_street_signs_at_night,_Shinjuku,_Tokyo,_Japan.jpg" }
  ];

  var N = 8;
  var LAYERS = 5;
  var PITCH = 110;
  var MAXSPREAD = 0.7;

  var stage = document.getElementById("stage");
  var rig = document.getElementById("rig");
  var sheets = Array.prototype.slice.call(document.querySelectorAll(".sheet"));
  var frames = Array.prototype.slice.call(document.querySelectorAll("img[data-frame]"));
  var orderBtns = Array.prototype.slice.call(document.querySelectorAll(".order__l button"));
  var planLinks = Array.prototype.slice.call(document.querySelectorAll(".plan__l a"));
  var rLayer = document.getElementById("rLayer");
  var rDepth = document.getElementById("rDepth");
  var rYaw = document.getElementById("rYaw");
  var rSpread = document.getElementById("rSpread");
  var mark = document.getElementById("mark");

  var lb = document.getElementById("lb");
  var lbImg = document.getElementById("lbImg");
  var lbNo = document.getElementById("lbNo");
  var lbName = document.getElementById("lbName");
  var lbRead = document.getElementById("lbRead");
  var lbCredit = document.getElementById("lbCredit");
  var lbLink = document.getElementById("lbLink");
  var lbX = document.getElementById("lbX");

  var layer = 2;
  var yaw = 0;
  var tilt = 54;
  var spread = 0.42;
  var want = 0.42;
  var shot = 0;
  var opener = null;
  var t = 0;
  var raf = 0;
  var last = 0;

  function paint() {
    rig.style.setProperty("--yaw", yaw.toFixed(2) + "deg");
    rig.style.setProperty("--tilt", tilt.toFixed(2) + "deg");
    for (var k = 0; k < LAYERS; k += 1) {
      var z = (LAYERS - 1 - k) * PITCH * spread;
      sheets[k].style.transform = "translateZ(" + z.toFixed(1) + "px)";
      sheets[k].classList.toggle("is-on", k === layer);
    }
    rLayer.textContent = "L" + (layer + 1);
    rDepth.textContent = Math.round((LAYERS - 1 - layer) * PITCH * spread) + " mm";
    rYaw.textContent = Math.round(((yaw % 360) + 360) % 360) + "\u00b0";
    rSpread.textContent = spread.toFixed(2);
    mark.textContent = "L" + (layer + 1) + " \u00b7 " + SHOTS[layer].n.toLowerCase();
    orderBtns.forEach(function (b, k) { b.classList.toggle("is-on", k === layer); });
  }

  function setLayer(n) {
    layer = Math.max(0, Math.min(LAYERS - 1, n));
    paint();
  }

  function setSpread(v) {
    want = Math.max(0, Math.min(MAXSPREAD, v));
  }

  function openAt(n, from) {
    shot = ((n % N) + N) % N;
    var s = SHOTS[shot];
    var img = frames[shot];
    opener = from || null;
    lbImg.setAttribute("src", img.getAttribute("src"));
    lbImg.setAttribute("alt", img.getAttribute("alt"));
    lbNo.textContent = (shot < LAYERS ? "Layer L" + (shot + 1) : "View " + (shot + 1)) + " of 08";
    lbName.textContent = s.n;
    lbRead.textContent = s.read;
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
    var b = ev.target.closest(".plate");
    if (!b) { return; }
    openAt(Number(b.getAttribute("data-shot")), b);
  });

  orderBtns.forEach(function (b) {
    b.addEventListener("click", function () { setLayer(Number(b.getAttribute("data-l"))); });
  });

  planLinks.forEach(function (a) {
    a.addEventListener("click", function (ev) {
      ev.preventDefault();
      openAt(Number(a.getAttribute("data-shot")), a);
    });
  });

  document.getElementById("close").addEventListener("click", function () { setSpread(0.05); });
  document.getElementById("open").addEventListener("click", function () { setSpread(0.7); });
  document.getElementById("prev").addEventListener("click", function () { setLayer(layer - 1); });
  document.getElementById("next").addEventListener("click", function () { setLayer(layer + 1); });
  document.getElementById("view").addEventListener("click", function () {
    openAt(layer, document.getElementById("view"));
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
      if (ev.key === "ArrowUp") { ev.preventDefault(); openAt(shot - 1, null); }
      else if (ev.key === "ArrowDown") { ev.preventDefault(); openAt(shot + 1, null); }
      else if (ev.key === "Home") { ev.preventDefault(); openAt(0, null); }
      else if (ev.key === "End") { ev.preventDefault(); openAt(N - 1, null); }
      return;
    }
    if (document.activeElement !== stage) { return; }
    if (ev.key === "ArrowLeft") { ev.preventDefault(); setLayer(layer - 1); }
    else if (ev.key === "ArrowRight") { ev.preventDefault(); setLayer(layer + 1); }
    else if (ev.key === "ArrowUp") { ev.preventDefault(); yaw -= 7; paint(); }
    else if (ev.key === "ArrowDown") { ev.preventDefault(); yaw += 7; paint(); }
    else if (ev.key === "Home") { ev.preventDefault(); setLayer(0); }
    else if (ev.key === "End") { ev.preventDefault(); setLayer(LAYERS - 1); }
    else if (ev.key === "+" || ev.key === "=") { ev.preventDefault(); setSpread(want + 0.18); }
    else if (ev.key === "-" || ev.key === "_") { ev.preventDefault(); setSpread(want - 0.18); }
    else if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); openAt(layer, stage); }
  });

  function loop(now) {
    raf = requestAnimationFrame(loop);
    var dt = Math.min(64, now - (last || now));
    last = now;
    t += dt;
    if (Math.abs(want - spread) > 0.002) {
      spread += (want - spread) * Math.min(1, dt / 220);
    } else {
      spread = want;
    }
    yaw = Math.sin(t / 4200) * 7;
    paint();
  }

  paint();
  if (!calm.matches) { raf = requestAnimationFrame(loop); }
  window.addEventListener("pagehide", function () { cancelAnimationFrame(raf); });
}());
