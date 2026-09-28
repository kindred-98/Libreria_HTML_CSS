(function () {
  "use strict";

  var calm = window.matchMedia("(prefers-reduced-motion: reduce)");

  var SHOTS = [
    { n: "Swallow", a: "Malene Thyssen", l: "CC BY 2.5", p: "https://commons.wikimedia.org/wiki/File:Landsvale.jpg",
      body: "A glossy dark blue back, a rusty throat and a white belly, seen side on along a pale branch with everything behind it thrown out of focus." },
    { n: "Nuthatch", a: "Paweł Kuźniar", l: "CC BY-SA 3.0", p: "https://commons.wikimedia.org/wiki/File:Sitta_europaea_wildlife_3.jpg",
      body: "A blue-grey back, an orange breast and a sharp bill, standing on an open palm in front of a wall of dead leaves." },
    { n: "Gulls", a: "Gerry Lynch", l: "CC BY 2.5", p: "https://commons.wikimedia.org/wiki/File:Black-headed_Gulls,_London.jpg",
      body: "Two gulls in level flight with wings fully spread and dark hoods on their heads, against a sky with nothing in it." },
    { n: "Hornbill", a: "Luca Galuzzi", l: "CC BY-SA 2.5", p: "https://commons.wikimedia.org/wiki/File:Hornbill_Zazu_Chitwa_South_Africa_Luca_Galuzzi_2004.JPG",
      body: "A long orange bill with a casque on top, a dark tail hanging straight down, and thorny branches to sit on." },
    { n: "Chaffinch", a: "Thermos", l: "CC BY-SA 3.0", p: "https://commons.wikimedia.org/wiki/File:FringillaCoelebsFemale.jpg",
      body: "Warm brown above with a cool blue-grey shoulder, perched on a lichen covered twig in a very soft green and olive blur." },
    { n: "Woodpecker", a: "Mdf", l: "CC BY-SA 3.0", p: "https://commons.wikimedia.org/wiki/File:Melanerpes-erythrocephalus-003.jpg",
      body: "A red head, a white chest and black wings, clinging sideways to a wire cage of suet with seeds packed into it." },
    { n: "Plover", a: "Mdf", l: "CC BY-SA 3.0", p: "https://commons.wikimedia.org/wiki/File:Charadrius-melodus-004.jpg",
      body: "A small grey and white bird on wet sand, with a short orange bill, orange legs and one dark band across the breast." },
    { n: "Sparrow", a: "Cephas", l: "CC BY-SA 3.0", p: "https://commons.wikimedia.org/wiki/File:Zonotrichia_albicollis_CT1.jpg",
      body: "A streaked brown back, a clean white throat and a yellow spot above the eye, on a bare branch against a pink wall." },
    { n: "Kingfisher", a: "Rute Martins", l: "CC BY-SA 3.0", p: "https://commons.wikimedia.org/wiki/File:Giant_Kingfisher-002.jpg",
      body: "Black above and white spotted below, holding a small fish crossways in its bill, on a log with open water behind." }
  ];

  var N = SHOTS.length;
  var R = 232;
  var STEP = 40;
  var LATS = [-18, 6, 24, 0, -26, 12, 20, -8, 30];
  var LONS = [0, 40, 80, 120, 160, 200, 240, 280, 320];

  var stage = document.getElementById("stage");
  var orb = document.getElementById("orb");
  var plates = Array.prototype.slice.call(orb.querySelectorAll(".plate"));
  var frames = Array.prototype.slice.call(document.querySelectorAll("img[data-frame]"));
  var logBtns = Array.prototype.slice.call(document.querySelectorAll(".log button"));
  var nNo = document.getElementById("nNo");
  var nName = document.getElementById("nName");
  var nBody = document.getElementById("nBody");
  var nLon = document.getElementById("nLon");
  var nLat = document.getElementById("nLat");
  var nCredit = document.getElementById("nCredit");
  var turnState = document.getElementById("turnState");

  var lb = document.getElementById("lb");
  var lbImg = document.getElementById("lbImg");
  var lbNo = document.getElementById("lbNo");
  var lbName = document.getElementById("lbName");
  var lbBody = document.getElementById("lbBody");
  var lbCredit = document.getElementById("lbCredit");
  var lbLink = document.getElementById("lbLink");
  var lbX = document.getElementById("lbX");

  var spin = 0;
  var tilt = 8;
  var turning = !calm.matches;
  var front = -1;
  var shot = 0;
  var opener = null;
  var raf = 0;
  var last = 0;
  var LOCAL = [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]];

  function rad(d) { return d * Math.PI / 180; }

  function norm(a) { return ((a % 360) + 360) % 360; }

  function place() {
    for (var i = 0; i < N; i += 1) {
      var la = rad(LATS[i]);
      var lo = rad(LONS[i]);
      var x = R * Math.sin(lo) * Math.cos(la);
      var y = -R * Math.sin(la);
      var z = R * Math.cos(lo) * Math.cos(la);
      plates[i].style.transform = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px," + z.toFixed(1) + "px) rotateY(" + (-LONS[i]).toFixed(1) + "deg)";
      LOCAL[i] = [x, y, z];
    }
  }

  function paint() {
    orb.style.setProperty("--spin", spin.toFixed(2) + "deg");
    orb.style.setProperty("--tilt", tilt.toFixed(2) + "deg");
    var ax = rad(tilt);
    var ay = rad(spin);
    var cx = Math.cos(ax);
    var sx = Math.sin(ax);
    var cy = Math.cos(ay);
    var sy = Math.sin(ay);
    var bestZ = -Infinity;
    var best = 0;
    for (var i = 0; i < N; i += 1) {
      var p = LOCAL[i];
      var zr = -cx * sy * p[0] + sx * p[1] + (sx * sy + cx * cy) * p[2];
      var depth = (zr / R + 1) / 2;
      plates[i].style.opacity = (0.18 + 0.82 * depth).toFixed(3);
      if (zr > bestZ) { bestZ = zr; best = i; }
    }
    if (best !== front) { front = best; writeUp(best); }
  }

  function writeUp(i) {
    var s = SHOTS[i];
    nNo.textContent = (i + 1 < 10 ? "0" : "") + (i + 1);
    nName.textContent = s.n;
    nBody.textContent = s.body;
    nLon.textContent = LONS[i] + "\u00b0";
    nLat.textContent = (LATS[i] < 0 ? "\u2212" : "+") + Math.abs(LATS[i]) + "\u00b0";
    nCredit.textContent = s.a + " \u00b7 " + s.l;
    plates.forEach(function (el, k) { el.classList.toggle("is-front", k === i); });
    logBtns.forEach(function (b, k) { b.classList.toggle("is-on", k === i); });
  }

  function aim(i) {
    spin = -LONS[i];
    paint();
  }

  function stepBy(dir) {
    aim((front + dir + N) % N);
  }

  function setTurning(on) {
    turning = on && !calm.matches;
    turnState.textContent = turning ? "Globe turning on its own" : "Globe held still";
  }

  function openAt(n, from) {
    shot = ((n % N) + N) % N;
    var s = SHOTS[shot];
    var img = frames[shot];
    opener = from || null;
    lbImg.setAttribute("src", img.getAttribute("src"));
    lbImg.setAttribute("alt", img.getAttribute("alt"));
    lbNo.textContent = "Plate " + (shot + 1 < 10 ? "0" : "") + (shot + 1) + " of 09";
    lbName.textContent = s.n;
    lbBody.textContent = s.body;
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
    var p = ev.target.closest(".plate");
    if (!p) { return; }
    openAt(Number(p.getAttribute("data-shot")), p);
  });

  logBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      var n = Number(b.getAttribute("data-shot"));
      aim(n);
      openAt(n, b);
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
    if (ev.key === " ") { ev.preventDefault(); setTurning(!turning); return; }
    if (document.activeElement !== stage) { return; }
    if (ev.key === "ArrowRight") { ev.preventDefault(); stepBy(1); }
    else if (ev.key === "ArrowLeft") { ev.preventDefault(); stepBy(-1); }
    else if (ev.key === "ArrowUp") { ev.preventDefault(); tilt = Math.min(48, tilt + 6); paint(); }
    else if (ev.key === "ArrowDown") { ev.preventDefault(); tilt = Math.max(-42, tilt - 6); paint(); }
    else if (ev.key === "Home") { ev.preventDefault(); aim(0); }
    else if (ev.key === "End") { ev.preventDefault(); aim(N - 1); }
    else if (ev.key === "Enter") { ev.preventDefault(); openAt(front, stage); }
  });

  function loop(now) {
    raf = requestAnimationFrame(loop);
    var dt = Math.min(64, now - (last || now));
    last = now;
    if (turning) {
      spin += (STEP / 9000) * dt;
      paint();
    }
  }

  setTurning(turning);
  place();
  paint();
  if (!calm.matches) { raf = requestAnimationFrame(loop); }
  window.addEventListener("pagehide", function () { cancelAnimationFrame(raf); });
}());
