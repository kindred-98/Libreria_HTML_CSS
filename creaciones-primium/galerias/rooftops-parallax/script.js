(function () {
  "use strict";

  var calm = window.matchMedia("(prefers-reduced-motion: reduce)");
  var drift = !calm.matches;

  var SHOTS = [
    { n: "Green dome, red roofs", a: "Jorge Royan", l: "CC BY-SA 3.0", p: "https://commons.wikimedia.org/wiki/File:Munich_-_View_from_Alter_Peter_tower_-_8246.jpg",
      note: "Five hundred metres up, the city has stopped being streets and become a field of angles. One green dome and one clock face are the only things still standing up straight." },
    { n: "Dark domes and a yellow bell tower", a: "Jorge Royan", l: "CC BY-SA 3.0", p: "https://commons.wikimedia.org/wiki/File:Munich_-_View_from_Alter_Peter_tower_-_8267.jpg",
      note: "Two black domes and a yellow tower, with the whole of the modern skyline pushed down to a thin grey line on the far horizon." },
    { n: "Yellow church and a stone spire", a: "Jorge Royan", l: "CC BY-SA 3.0", p: "https://commons.wikimedia.org/wiki/File:Munich_-_View_from_Alter_Peter_tower_-_8271.jpg",
      note: "A yellow church, a narrow stone spire, and four hundred terracotta roofs doing the real work of holding the city together." },
    { n: "Main Street, north", a: "Unknown author", l: "Public domain", p: "https://commons.wikimedia.org/wiki/File:View_of_Main_Street_looking_north_from_the_top_of_a_building_near_6th_Street,_Los_Angeles,_ca.1917_(CHS-5723.2).jpg",
      note: "A wide canyon seen from a rooftop, with a tram track down the middle, painted billboards on the near blocks and haze eating the far end." },
    { n: "Long green copper roofs", a: "Jorge Royan", l: "CC BY-SA 3.0", p: "https://commons.wikimedia.org/wiki/File:Munich_-_View_from_Alter_Peter_tower_-_8273.jpg",
      note: "A whole block of green copper with dormers in a strict row, and a black roof stepping down beside it like a shadow." },
    { n: "Grey roof beside an orange one", a: "Jorge Royan", l: "CC BY-SA 3.0", p: "https://commons.wikimedia.org/wiki/File:Munich_-_View_from_Alter_Peter_tower_-_8274.jpg",
      note: "Two roofs arguing about colour: grey slate and dormers on one side, orange tile on the other, a white gable holding the seam." },
    { n: "Coloured roofs, close up", a: "Cookie Nguyen", l: "CC BY-SA 4.0", p: "https://commons.wikimedia.org/wiki/File:Imus%2C_Cavite_aerial_view_2012_(1).jpg",
      note: "The last twenty metres are the loudest: corrugated roofs in five colours, one tree with a proper crown, and a red vehicle parked in a lane too narrow for more." },
    { n: "Flat roofs toward the bay", a: "Maison Bonfils", l: "Public domain", p: "https://commons.wikimedia.org/wiki/File:lossy-page1-960px-View_of_rooftops_of_Beirut%2C_looking_towards_body_of_water)_-_Bonfils_LCCN2003690024.tif.jpg",
      note: "Stone terraces stepping down towards a bay, with small sailing boats out in the haze and the whole scene the colour of old paper." }
  ];

  var N = SHOTS.length;
  var LEVELS = [519, 142, 24];

  var bays = Array.prototype.slice.call(document.querySelectorAll(".bay"));
  var railLinks = Array.prototype.slice.call(document.querySelectorAll(".rail__list a"));
  var railNow = document.getElementById("railNow");
  var openers = Array.prototype.slice.call(document.querySelectorAll(".bay__open"));
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));
  var frames = Array.prototype.slice.call(document.querySelectorAll("img[data-frame]"));

  var lb = document.getElementById("lb");
  var lbImg = document.getElementById("lbImg");
  var lbNo = document.getElementById("lbNo");
  var lbName = document.getElementById("lbName");
  var lbNote = document.getElementById("lbNote");
  var lbCredit = document.getElementById("lbCredit");
  var lbLink = document.getElementById("lbLink");
  var lbX = document.getElementById("lbX");

  var layers = [];
  var current = 0;
  var shot = 0;
  var opener = null;
  var frame = 0;
  var lastY = -1;

  function pad(n) { return n < 10 ? "0" + n : String(n); }

  function collect() {
    layers = [];
    bays.forEach(function (bay) {
      layers = layers.concat(Array.prototype.slice.call(bay.querySelectorAll("[data-depth]")));
    });
  }

  function read() {
    var vh = window.innerHeight;
    var y = window.pageYOffset;
    if (y !== lastY) {
      lastY = y;
      if (drift) {
        for (var el of layers) {
          var host = el.closest(".bay");
          var r = host.getBoundingClientRect();
          if (r.bottom < -vh * 0.5 || r.top > vh * 1.5) { continue; }
          var depth = Number(el.dataset.depth);
          var shift = -(vh / 2 - (r.top + r.height / 2)) * depth;
          el.style.transform = "translate3d(0," + shift.toFixed(2) + "px, 0)";
        }
      }
    }
    var best = 0;
    var bestD = Infinity;
    for (var b = 0; b < bays.length; b += 1) {
      var rb = bays[b].getBoundingClientRect();
      var d = Math.abs(rb.top + rb.height / 2 - vh / 2);
      if (d < bestD) { bestD = d; best = b; }
    }
    if (best !== current) {
      current = best;
      railLinks.forEach(function (a, n) { a.classList.toggle("is-on", n === best); });
    }
    railNow.textContent = String(LEVELS[current]);
  }

  function scrollToBay(n) {
    bays[n].scrollIntoView({ behavior: drift ? "smooth" : "auto", block: "start" });
  }

  railLinks.forEach(function (a) {
    a.addEventListener("click", function (ev) {
      ev.preventDefault();
      scrollToBay(Number(a.dataset.bay));
    });
  });

  openers.forEach(function (b) {
    b.addEventListener("click", function () { openAt(Number(b.dataset.shot), b); });
  });

  chips.forEach(function (c) {
    c.addEventListener("click", function (ev) {
      ev.preventDefault();
      openAt(Number(c.dataset.shot), c);
    });
  });

  function openAt(n, from) {
    shot = ((n % N) + N) % N;
    var s = SHOTS[shot];
    var img = frames[shot];
    opener = from || null;
    lbImg.setAttribute("src", img.getAttribute("src"));
    lbImg.setAttribute("alt", img.getAttribute("alt"));
    lbNo.textContent = "Frame " + pad(shot + 1) + " of " + pad(N);
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
    if (ev.key === "ArrowDown" || ev.key === "PageDown") { ev.preventDefault(); scrollToBay(current + 1); }
    else if (ev.key === "ArrowUp" || ev.key === "PageUp") { ev.preventDefault(); scrollToBay(current - 1); }
    else if (ev.key === "Home") { ev.preventDefault(); scrollToBay(0); }
    else if (ev.key === "End") { ev.preventDefault(); scrollToBay(bays.length - 1); }
    else if (ev.key === "Enter" && document.activeElement === document.body) {
      ev.preventDefault();
      openAt([0, 3, 6][current], null);
    }
  });

  function loop() {
    frame = requestAnimationFrame(loop);
    read();
  }

  collect();
  window.addEventListener("resize", function () { collect(); lastY = -1; });
  if (drift) {
    frame = requestAnimationFrame(loop);
  } else {
    window.addEventListener("scroll", read, { passive: true });
  }
  read();
  window.addEventListener("pagehide", function () { cancelAnimationFrame(frame); });
}());
