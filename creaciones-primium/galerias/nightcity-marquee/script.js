(function () {
  "use strict";

  var calm = window.matchMedia("(prefers-reduced-motion: reduce)");

  var SHOTS = [
    { city: "Perth", tone: "gold", a: "Mark Ryan", l: "GFDL", p: "https://commons.wikimedia.org/wiki/File:Perth_skyline_at_night.jpg",
      note: "Gold-lit towers on a still shoreline, and a water surface that has been turned into a second skyline by reflection." },
    { city: "Panama City", tone: "ember", a: "Nelson de Witt", l: "CC BY-SA 2.0", p: "https://commons.wikimedia.org/wiki/File:The_lights_of_Panama_City.jpg",
      note: "Almost nothing: a low ribbon of lights under a wide brown sky, with the whole foreground given away to the dark." },
    { city: "Long Island City", tone: "blue hour", a: "King of Hearts", l: "CC BY-SA 3.0", p: "https://commons.wikimedia.org/wiki/File:Long_Island_City_New_York_May_2015_panorama_3.jpg",
      note: "Three towers with warm window grids, a low ferry pier, and a blue hour sky just light enough to separate the roofs." },
    { city: "Detroit", tone: "haze", a: "www.Pixel.la Free Stock Photos", l: "CC0", p: "https://commons.wikimedia.org/wiki/File:Night_in_Detroit_(24244411621).jpg",
      note: "A downtown row glowing through its own haze, sitting on calm water that copies it back twice as tall." },
    { city: "Harbour wheel", tone: "rain", a: "Alex wong killerfvith", l: "CC0", p: "https://commons.wikimedia.org/wiki/File:City_Lights_at_Night_(Unsplash_-uzgaA9LfNw).jpg",
      note: "Rain haze over a working harbour: a lit wheel, towers behind it, and wet tarmac drawing the headlights out into lines." },
    { city: "Auckland", tone: "moon", a: "Sharon Mollerus", l: "CC BY 2.0", p: "https://commons.wikimedia.org/wiki/File:Night_Lights_(480317957).jpg",
      note: "A full moon doing most of the lighting, one block washed in gold, and a glass slab that hands the moon back as a black plane." },
    { city: "Auckland harbour", tone: "green", a: "Marco Klapper", l: "CC BY 2.0", p: "https://commons.wikimedia.org/wiki/File:Auckland_skyline_(24045221962).jpg",
      note: "One tower turned green, a red beacon on top of it, and a low city laid out flat along black harbour water." },
    { city: "City of London", tone: "cranes", a: "Redbannana", l: "CC BY-SA 4.0", p: "https://commons.wikimedia.org/wiki/File:City_of_London._Night_time_lights.jpg",
      note: "Cranes still standing over the cluster, and a curved roof in the foreground lit blue from underneath." },
    { city: "New York", tone: "dense", a: "Andy Moreton", l: "CC BY 3.0", p: "https://commons.wikimedia.org/wiki/File:New_York_Skyline_(129300657).jpeg",
      note: "The densest plate on the belt: a grid of lit windows to the horizon, one pink spire and one green antenna to break the pattern." }
  ];

  var N = SHOTS.length;
  var GAP = 14.4;

  var gate = document.getElementById("gate");
  var belt = gate.querySelector(".belt");
  var track = document.getElementById("track");
  var labelCity = document.getElementById("labelCity");
  var labelNo = document.getElementById("labelNo");
  var hint = document.getElementById("hint");
  var bNo = document.getElementById("bNo");
  var bCity = document.getElementById("bCity");
  var bNote = document.getElementById("bNote");
  var bCredit = document.getElementById("bCredit");
  var bState = document.getElementById("bState");
  var ticks = document.getElementById("ticks");
  var runBtn = document.getElementById("run");
  var runLabel = document.getElementById("runLabel");
  var openBtn = document.getElementById("open");

  var lb = document.getElementById("lb");
  var lbImg = document.getElementById("lbImg");
  var lbNo = document.getElementById("lbNo");
  var lbCity = document.getElementById("lbCity");
  var lbNote = document.getElementById("lbNote");
  var lbCredit = document.getElementById("lbCredit");
  var lbLink = document.getElementById("lbLink");
  var lbX = document.getElementById("lbX");

  var originals = Array.prototype.slice.call(track.children);
  var plates = [];
  var marks = [];
  var pitch = 0;
  var card = 0;
  var span = 0;
  var base = 0;
  var offset = 0;
  var shown = -1;
  var placed = false;
  var running = !calm.matches;
  var held = false;
  var lock = 0;
  var plate = 0;
  var opener = null;
  var raf = 0;
  var last = 0;

  function pad(n) { return n < 10 ? "0" + n : String(n); }

  for (var i = 0; i < N; i += 1) {
    var m = document.createElement("i");
    ticks.appendChild(m);
    marks.push(m);
  }

  for (var c = N - 1; c >= 0; c -= 1) {
    track.insertBefore(ghost(originals[c]), track.firstChild);
  }
  for (var d = 0; d < N; d += 1) {
    track.appendChild(ghost(originals[d]));
  }

  function ghost(src) {
    var copy = src.cloneNode(true);
    copy.setAttribute("aria-hidden", "true");
    copy.querySelector(".plate__btn").setAttribute("tabindex", "-1");
    return copy;
  }

  function measure() {
    var w = originals[0].getBoundingClientRect().width;
    if (!w) { return; }
    card = w;
    pitch = w + GAP;
    span = pitch * N;
    base = pitch * N + w / 2 - belt.clientWidth / 2;
    plates = Array.prototype.slice.call(track.children);
    if (!placed) { placed = true; offset = base; }
    else {
      var k = offset;
      while (k < base) { k += span; }
      while (k >= base + span) { k -= span; }
      offset = k;
    }
    paint(true);
  }

  function slotOf() {
    return Math.round((offset + belt.clientWidth / 2 - card / 2) / pitch);
  }

  function wrap(v) {
    while (v < base) { v += span; }
    while (v >= base + span) { v -= span; }
    return v;
  }

  function paint(force) {
    track.style.transform = "translate3d(" + (-offset).toFixed(2) + "px, 0, 0)";
    if (!pitch) { return; }
    var slot = slotOf();
    var i = ((slot % N) + N) % N;
    if (i === shown && !force) { return; }
    shown = i;
    plate = i;
    for (var k = 0; k < plates.length; k += 1) {
      plates[k].classList.toggle("is-here", k === slot);
    }
    for (var o = 0; o < N; o += 1) {
      originals[o].querySelector(".plate__btn").setAttribute("tabindex", o === i ? "0" : "-1");
    }
    var s = SHOTS[i];
    bNo.textContent = pad(i + 1);
    bCity.textContent = s.city;
    bNote.textContent = s.note;
    bCredit.textContent = s.a + " \u00b7 " + s.l;
    labelCity.textContent = s.city + " " + s.tone;
    labelNo.textContent = pad(i + 1) + " / " + pad(N);
    for (var n = 0; n < marks.length; n += 1) { marks[n].classList.toggle("is-on", n === i); }
  }

  function glide(to, ms) {
    var from = offset;
    var t0 = performance.now();
    var dur = calm.matches ? 0 : (ms || 640);
    lock = t0 + dur + 60;
    function step(now) {
      var k = dur ? Math.min(1, (now - t0) / dur) : 1;
      var e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      offset = wrap(from + (to - from) * e);
      paint();
      if (k < 1) { requestAnimationFrame(step); }
    }
    requestAnimationFrame(step);
  }

  function centreOn(i) {
    var k = i;
    while (k < 0) { k += N; }
    glide(wrap(pitch * N + k * pitch + card / 2 - belt.clientWidth / 2));
  }

  function stepBy(dir) {
    centreOn(plate + dir);
  }

  function setRunning(on) {
    running = on && !calm.matches;
    runBtn.setAttribute("aria-pressed", running ? "true" : "false");
    runLabel.textContent = running ? "Stop the belt" : "Start the belt";
    bState.textContent = running ? "Belt running \u00b7 one plate every 4.2 s" : "Belt held still";
  }

  function openAt(n, from) {
    plate = ((n % N) + N) % N;
    var s = SHOTS[plate];
    var img = originals[plate].querySelector("img");
    opener = from || null;
    lbImg.setAttribute("src", img.getAttribute("src"));
    lbImg.setAttribute("alt", img.getAttribute("alt"));
    lbNo.textContent = "Plate " + pad(plate + 1) + " / " + pad(N);
    lbCity.textContent = s.city;
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

  track.addEventListener("click", function (ev) {
    var b = ev.target.closest(".plate__btn");
    if (!b) { return; }
    ev.preventDefault();
    openAt(Number(b.dataset.i), b);
  });

  gate.addEventListener("pointerenter", function () {
    held = true;
    hint.textContent = "belt held";
  });
  gate.addEventListener("pointerleave", function () {
    held = false;
    hint.textContent = "pointer on the belt \u2014 it holds";
  });
  gate.addEventListener("focusin", function () { held = true; });
  gate.addEventListener("focusout", function (ev) {
    if (!gate.contains(ev.relatedTarget)) { held = false; }
  });

  runBtn.addEventListener("click", function () { setRunning(!running); });
  document.getElementById("back").addEventListener("click", function () { stepBy(1); });
  document.getElementById("fwd").addEventListener("click", function () { stepBy(-1); });
  document.getElementById("first").addEventListener("click", function () { centreOn(0); });
  document.getElementById("last").addEventListener("click", function () { centreOn(N - 1); });
  openBtn.addEventListener("click", function () { openAt(plate, openBtn); });

  lbX.addEventListener("click", close);
  lb.querySelector(".lb__veil").addEventListener("click", close);
  document.getElementById("lbPrev").addEventListener("click", function () { openAt(plate + 1, null); });
  document.getElementById("lbNext").addEventListener("click", function () { openAt(plate - 1, null); });

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
      if (ev.key === "ArrowRight") { ev.preventDefault(); openAt(plate - 1, null); }
      else if (ev.key === "ArrowLeft") { ev.preventDefault(); openAt(plate + 1, null); }
      else if (ev.key === "Home") { ev.preventDefault(); openAt(0, null); }
      else if (ev.key === "End") { ev.preventDefault(); openAt(N - 1, null); }
      return;
    }
    if (ev.key === "p" || ev.key === "P") { ev.preventDefault(); setRunning(!running); return; }
    if (document.activeElement !== gate) { return; }
    if (ev.key === "ArrowRight") { ev.preventDefault(); stepBy(1); }
    else if (ev.key === "ArrowLeft") { ev.preventDefault(); stepBy(-1); }
    else if (ev.key === "Home") { ev.preventDefault(); centreOn(0); }
    else if (ev.key === "End") { ev.preventDefault(); centreOn(N - 1); }
    else if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); openAt(plate, gate); }
  });

  function loop(now) {
    raf = requestAnimationFrame(loop);
    var dt = Math.min(64, now - (last || now));
    last = now;
    if (running && !held && pitch && now > lock) {
      offset += (span / 4600) * dt;
      if (offset >= base + span) { offset -= span; }
      paint();
    }
  }

  setRunning(running);
  measure();
  window.addEventListener("resize", function () { measure(); });
  if (!calm.matches) { raf = requestAnimationFrame(loop); }
  window.addEventListener("pagehide", function () { cancelAnimationFrame(raf); });
}());
