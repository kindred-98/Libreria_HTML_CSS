(function () {
  "use strict";

  var calm = window.matchMedia("(prefers-reduced-motion: reduce)");

  var WINGS = [
    { t: "Parthenos sylvia philippensis", a: "Andreas.Didion", l: "CC BY-SA 2.5", lat: 62,
      n: "A common castaway of the Asian forest, photographed with its wings fully open and no attempt to make it look like anything else.",
      p: "https://commons.wikimedia.org/wiki/File:Parthenos_sylvia_philippensis.jpg",
      s: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Parthenos_sylvia_philippensis.jpg/960px-Parthenos_sylvia_philippensis.jpg",
      alt: "A common palmfly butterfly with its wings spread flat on a green leaf" },
    { t: "Monarch on a pink zinnia", a: "Derek Ramsey (Ram-Man)", l: "GFDL 1.2", lat: 26,
      n: "One monarch on one flower head, and the whole plate is about how much orange fits in a frame before it stops being orange.",
      p: "https://commons.wikimedia.org/wiki/File:Monarch_Butterfly_Pink_Zinnia_1800px.jpg",
      s: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Monarch_Butterfly_Pink_Zinnia_1800px.jpg/960px-Monarch_Butterfly_Pink_Zinnia_1800px.jpg",
      alt: "An orange and black monarch butterfly feeding on a bright pink zinnia" },
    { t: "Monarch on purple coneflower", a: "Derek Ramsey (Ram-Man)", l: "GFDL 1.2", lat: -8,
      n: "The species everyone already knows, photographed on a purple coneflower with the wing veins left showing.",
      p: "https://commons.wikimedia.org/wiki/File:Monarch_Butterfly_Danaus_plexippus_on_Echinacea_purpurea_2800px.jpg",
      s: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Monarch_Butterfly_Danaus_plexippus_on_Echinacea_purpurea_2800px.jpg/960px-Monarch_Butterfly_Danaus_plexippus_on_Echinacea_purpurea_2800px.jpg",
      alt: "A monarch butterfly with open wings resting on the purple cone of an echinacea" },
    { t: "Monarch, vertical caterpillar", a: "Derek Ramsey (Ram-Man)", l: "GFDL 1.2", lat: 78,
      n: "Not a butterfly at all: the caterpillar, hanging head down, banded in black, white and gold.",
      p: "https://commons.wikimedia.org/wiki/File:Monarch_Butterfly_Danaus_plexippus_Vertical_Caterpillar_2000px.jpg",
      s: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Monarch_Butterfly_Danaus_plexippus_Vertical_Caterpillar_2000px.jpg/960px-Monarch_Butterfly_Danaus_plexippus_Vertical_Caterpillar_2000px.jpg",
      alt: "A monarch caterpillar hanging vertically from a milkweed stem" },
    { t: "Monarch feeding down", a: "Derek Ramsey (Ram-Man)", l: "GFDL 1.2", lat: 4,
      n: "Shot from underneath the flower, which is the only angle from which the underside of a monarch looks like a different animal.",
      p: "https://commons.wikimedia.org/wiki/File:Monarch_Butterfly_Danaus_plexippus_Feeding_Down_3008px.jpg",
      s: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Monarch_Butterfly_Danaus_plexippus_Feeding_Down_3008px.jpg/960px-Monarch_Butterfly_Danaus_plexippus_Feeding_Down_3008px.jpg",
      alt: "A monarch butterfly seen from below as it feeds down into a flower" },
    { t: "Monarch on milkweed", a: "Derek Ramsey (Ram-Man)", l: "GFDL 1.2", lat: -48,
      n: "The host plant and the insect on the same stem, which is the entire life story in one frame.",
      p: "https://commons.wikimedia.org/wiki/File:Monarch_Butterfly_Danaus_plexippus_on_Milkweed_Hybrid_2800px.jpg",
      s: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Monarch_Butterfly_Danaus_plexippus_on_Milkweed_Hybrid_2800px.jpg/960px-Monarch_Butterfly_Danaus_plexippus_on_Milkweed_Hybrid_2800px.jpg",
      alt: "A monarch butterfly perched on the pink umbel of a milkweed plant" },
    { t: "Charaxes brutus natalensis", a: "Muhammad Mahdi Karim", l: "GFDL 1.2", lat: -20,
      n: "A charaxes with the tails broken off by a bird strike, still flying perfectly well on what is left.",
      p: "https://commons.wikimedia.org/wiki/File:Charaxes_brutus_natalensis.jpg",
      s: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Charaxes_brutus_natalensis.jpg/960px-Charaxes_brutus_natalensis.jpg",
      alt: "A Charaxes brutus butterfly with ragged wing edges resting on a dark leaf" },
    { t: "Inachis io, European peacock", a: "Korall", l: "CC BY-SA 3.0", lat: 34,
      n: "The European peacock, and the only specimen on the globe with eye spots large enough to read at a glance.",
      p: "https://commons.wikimedia.org/wiki/File:Inachis_io_Lill-Jansskogen.JPG",
      s: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Inachis_io_Lill-Jansskogen.JPG/960px-Inachis_io_Lill-Jansskogen.JPG",
      alt: "A European peacock butterfly with four large eye spots on its closed wings" },
    { t: "Pieris cheiranthi", a: "Quartl", l: "CC BY-SA 3.0", lat: -66,
      n: "A small white and black pierid, and the smallest plate on the shell, which is the point of pinning it there.",
      p: "https://commons.wikimedia.org/wiki/File:Pieris_cheiranthi_qtl1.jpg",
      s: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Pieris_cheiranthi_qtl1.jpg/960px-Pieris_cheiranthi_qtl1.jpg",
      alt: "A small Pieris cheiranthi butterfly with white wings and dark wing tips on a flower" }
  ];

  var N = WINGS.length;
  var D2R = Math.PI / 180;

  var globe = document.getElementById("globe");
  var shell = document.getElementById("shell");
  var readNo = document.getElementById("readNo");
  var readLon = document.getElementById("readLon");
  var readLat = document.getElementById("readLat");
  var nowT = document.getElementById("nowT");
  var nowA = document.getElementById("nowA");
  var nowP = document.getElementById("nowP");
  var nowN = document.getElementById("nowN");
  var dials = Array.prototype.slice.call(document.querySelectorAll("[data-lon]"));
  var rows = Array.prototype.slice.call(document.querySelectorAll(".press button"));
  var drift = document.getElementById("drift");

  var lb = document.getElementById("lb");
  var lbImg = document.getElementById("lbImg");
  var lbNo = document.getElementById("lbNo");
  var lbT = document.getElementById("lbT");
  var lbA = document.getElementById("lbA");
  var lbP = document.getElementById("lbP");
  var lbX = document.getElementById("lbX");

  var lon = 0;
  var lat = 0;
  var run = !calm.matches;
  var over = false;
  var dragging = false;
  var grabX = 0;
  var grabY = 0;
  var grabLon = 0;
  var grabLat = 0;
  var front = -1;
  var opener = null;
  var raf = 0;

  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  function build() {
    for (var i = 0; i < N; i += 1) {
      var w = WINGS[i];
      var b = document.createElement("button");
      b.type = "button";
      b.className = "wing";
      b.dataset.i = String(i);
      b.setAttribute("aria-label", "Open specimen " + pad(i + 1) + ", " + w.t);
      var fr = document.createElement("span");
      fr.className = "wing__fr w" + (i + 1);
      var im = document.createElement("img");
      im.src = w.s;
      im.alt = w.alt;
      im.loading = "lazy";
      im.decoding = "async";
      fr.appendChild(im);
      var no = document.createElement("span");
      no.className = "wing__no";
      no.textContent = pad(i + 1);
      b.appendChild(fr);
      b.appendChild(no);
      shell.appendChild(b);
    }
  }

  function draw() {
    var box = globe.getBoundingClientRect();
    var R = box.width * 0.5;
    var rBead = R * 0.6;
    var nodes = shell.querySelectorAll(".wing");
    var cosLat = Math.cos(lat * D2R);
    var sinLat = Math.sin(lat * D2R);
    var best = 0;
    var bestZ = -2;

    for (var i = 0; i < N; i += 1) {
      var la = WINGS[i].lat * D2R;
      var lo = i * (360 / N) * D2R;
      var x = Math.cos(la) * Math.sin(lo);
      var y = Math.sin(la);
      var z = Math.cos(la) * Math.cos(lo);

      var px = x * cosLat + z * sinLat;
      var pz = -x * sinLat + z * cosLat;
      var v = clamp(pz, -1, 1);

      var el = nodes[i];
      el.style.transform = "translate(-50%,-50%) translate3d(" + (px * rBead).toFixed(2) + "px," + (-y * rBead).toFixed(2) + "px,0) scale(" + (0.5 + 0.5 * Math.max(0, v)).toFixed(3) + ")";
      el.style.opacity = v <= -0.02 ? "0" : (0.16 + 0.84 * clamp(v * 1.3, 0, 1)).toFixed(3);
      el.style.filter = "saturate(" + (0.42 + 0.58 * clamp(v, 0, 1)).toFixed(3) + ") brightness(" + (0.7 + 0.3 * clamp(v, 0, 1)).toFixed(3) + ")";
      el.style.zIndex = String(50 + Math.round(pz * 50));

      if (v > bestZ) { bestZ = v; best = i; }
    }

    if (best !== front) {
      front = best;
      var w = WINGS[best];
      readNo.textContent = pad(best + 1);
      nowT.textContent = w.t;
      nowA.textContent = w.a + " \u00b7 " + w.l;
      nowP.setAttribute("href", w.p);
      nowN.textContent = w.n;
      nodes.forEach(function (el, k) { el.classList.toggle("is-front", k === best); });
      rows.forEach(function (r, k) { r.classList.toggle("is-on", k === best); });
    }
    readLon.textContent = String(Math.round(((lon % 360) + 360) % 360)).padStart(3, "0");
    readLat.textContent = String(Math.round(lat));
  }

  function turn(dl, dp) {
    lon += dl;
    lat = clamp(lat + dp, -78, 78);
    draw();
  }

  function setRun(on) {
    run = on && !calm.matches;
    drift.classList.toggle("is-on", run);
    drift.setAttribute("aria-pressed", run ? "true" : "false");
    drift.textContent = run ? "Drift" : "Turn it";
  }

  drift.addEventListener("click", function () { setRun(!run); });

  dials.forEach(function (btn) {
    btn.addEventListener("click", function () {
      lon = Number(btn.dataset.lon);
      lat = Number(btn.dataset.lat);
      dials.forEach(function (b) { b.classList.toggle("is-on", b === btn && !b.classList.contains("dial--go")); });
      draw();
    });
  });

  rows.forEach(function (row) {
    row.addEventListener("click", function () {
      var i = Number(row.dataset.i);
      lon = -i * (360 / N);
      lat = 0;
      draw();
    });
  });

  globe.addEventListener("pointerenter", function () { over = true; });
  globe.addEventListener("pointerleave", function () { over = false; });
  globe.addEventListener("focusin", function () { over = true; });
  globe.addEventListener("focusout", function () { over = false; });

  globe.addEventListener("pointerdown", function (ev) {
    dragging = true;
    grabX = ev.clientX;
    grabY = ev.clientY;
    grabLon = lon;
    grabLat = lat;
    globe.setPointerCapture(ev.pointerId);
  });

  globe.addEventListener("pointermove", function (ev) {
    if (!dragging) { return; }
    lon = grabLon - (ev.clientX - grabX) * 0.42;
    lat = clamp(grabLat + (ev.clientY - grabY) * 0.36, -78, 78);
    draw();
  });

  globe.addEventListener("pointerup", function () { dragging = false; });
  globe.addEventListener("pointercancel", function () { dragging = false; });

  shell.addEventListener("click", function (ev) {
    var w = ev.target.closest(".wing");
    if (!w) { return; }
    openAt(Number(w.dataset.i), w);
  });

  function openAt(i, from) {
    i = (i + N) % N;
    var w = WINGS[i];
    opener = from || null;
    lbImg.setAttribute("src", w.s);
    lbImg.setAttribute("alt", w.alt);
    lbNo.textContent = pad(i + 1) + " / " + pad(N);
    lbT.textContent = w.t;
    lbA.textContent = w.a + " \u00b7 " + w.l;
    lbP.setAttribute("href", w.p);
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

  document.getElementById("lbPrev").addEventListener("click", function () { openAt(front - 1, null); });
  document.getElementById("lbNext").addEventListener("click", function () { openAt(front + 1, null); });
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
      if (ev.key === "ArrowRight") { ev.preventDefault(); openAt(front + 1, null); }
      else if (ev.key === "ArrowLeft") { ev.preventDefault(); openAt(front - 1, null); }
      else if (ev.key === "Home") { ev.preventDefault(); openAt(0, null); }
      else if (ev.key === "End") { ev.preventDefault(); openAt(N - 1, null); }
      return;
    }

    if (document.activeElement === globe) {
      if (ev.key === "ArrowRight") { ev.preventDefault(); setRun(false); turn(8, 0); }
      else if (ev.key === "ArrowLeft") { ev.preventDefault(); setRun(false); turn(-8, 0); }
      else if (ev.key === "ArrowUp") { ev.preventDefault(); setRun(false); turn(0, -7); }
      else if (ev.key === "ArrowDown") { ev.preventDefault(); setRun(false); turn(0, 7); }
      else if (ev.key === "]") { ev.preventDefault(); openAt(front + 1, null); }
      else if (ev.key === "[") { ev.preventDefault(); openAt(front - 1, null); }
      else if (ev.key === "Home") { ev.preventDefault(); turn(-lon, -lat); }
      else if (ev.key === "End") { ev.preventDefault(); turn(360 - lon, 60 - lat); }
      else if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); openAt(front, null); }
      return;
    }

    var r = rows.indexOf(document.activeElement);
    if (r >= 0) {
      if (ev.key === "ArrowDown" || ev.key === "ArrowRight") { ev.preventDefault(); rows[Math.min(r + 1, N - 1)].focus(); }
      else if (ev.key === "ArrowUp" || ev.key === "ArrowLeft") { ev.preventDefault(); rows[Math.max(r - 1, 0)].focus(); }
      else if (ev.key === "Home") { ev.preventDefault(); rows[0].focus(); }
      else if (ev.key === "End") { ev.preventDefault(); rows[N - 1].focus(); }
    }
  });

  function loop(now) {
    raf = requestAnimationFrame(loop);
    var dt = Math.min(48, now - (loop.last || now));
    loop.last = now;
    if (run && !over && !dragging) { turn(0.026 * dt, 0); }
  }

  build();
  setRun(run);
  draw();
  window.addEventListener("resize", draw);
  window.addEventListener("pagehide", function () { cancelAnimationFrame(raf); });
  if (!calm.matches) { raf = requestAnimationFrame(loop); }
}());
