(function () {
  "use strict";

  var PLATES = [
    { n: "01", name: "Mount Hood in Mirror Lake", place: "Oregon, United States", depth: 42, alt: "Snow-capped Mount Hood mirrored in the still water of Mirror Lake, Oregon", by: "Oregon's Mt. Hood Territory", lic: "Public domain", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Mount_Hood_reflected_in_Mirror_Lake%2C_Oregon.jpg/960px-Mount_Hood_reflected_in_Mirror_Lake%2C_Oregon.jpg", page: "https://commons.wikimedia.org/wiki/File:Mount_Hood_reflected_in_Mirror_Lake%2C_Oregon.jpg" },
    { n: "02", name: "Jokulsarlon glacial lagoon", place: "South coast, Iceland", depth: 128, alt: "Blue icebergs drifting on the Jokulsarlon glacial lagoon in Iceland", by: "Kenny Muir", lic: "CC BY 2.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Jokulsarlon_lake%2C_Iceland.jpg/960px-Jokulsarlon_lake%2C_Iceland.jpg", page: "https://commons.wikimedia.org/wiki/File:Jokulsarlon_lake%2C_Iceland.jpg" },
    { n: "03", name: "Crepuscular rays on the water", place: "Glacier National Park", depth: 67, alt: "Crepuscular rays fanning down over a lake and reflecting off its surface", by: "Brocken Inaglory", lic: "CC BY-SA 3.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Crepuscular_rays_with_reflection_in_GGP.jpg/960px-Crepuscular_rays_with_reflection_in_GGP.jpg", page: "https://commons.wikimedia.org/wiki/File:Crepuscular_rays_with_reflection_in_GGP.jpg" },
    { n: "04", name: "Lake Tenaya, granite and pine", place: "Yosemite, California", depth: 31, alt: "Granite cliffs and pines reflected in the clear water of Lake Tenaya, Yosemite", by: "Brocken Inaglory", lic: "CC BY-SA 3.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Lake_Tenaya_in_Yosemite_NP.jpg/960px-Lake_Tenaya_in_Yosemite_NP.jpg", page: "https://commons.wikimedia.org/wiki/File:Lake_Tenaya_in_Yosemite_NP.jpg" },
    { n: "05", name: "Lake Kinney under Whitehorn", place: "Chelan County, Washington", depth: 24, alt: "Mount Whitehorn rising behind the green water of Lake Kinney", by: "Florian Fuchs", lic: "CC BY 3.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Lake_Kinney_mit_Mount_Whitehorn.jpg/960px-Lake_Kinney_mit_Mount_Whitehorn.jpg", page: "https://commons.wikimedia.org/wiki/File:Lake_Kinney_mit_Mount_Whitehorn.jpg" },
    { n: "06", name: "South tufa, Mono Lake", place: "Mono County, California", depth: 18, alt: "Sunlit tufa towers rising out of the shallow water of Mono Lake", by: "King of Hearts", lic: "CC BY-SA 3.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Mono_Lake_South_Tufa_August_2013_014.jpg/960px-Mono_Lake_South_Tufa_August_2013_014.jpg", page: "https://commons.wikimedia.org/wiki/File:Mono_Lake_South_Tufa_August_2013_014.jpg" },
    { n: "07", name: "Lake Mapourika", place: "West Coast, New Zealand", depth: 83, alt: "Mirror-flat Lake Mapourika reflecting the mountains of New Zealand's South Island", by: "Richard Palmer", lic: "CC BY-SA 3.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Lake_mapourika_NZ.jpeg/960px-Lake_mapourika_NZ.jpeg", page: "https://commons.wikimedia.org/wiki/File:Lake_mapourika_NZ.jpeg" },
    { n: "08", name: "Lake Grdzeli", place: "Lagodekhi, Georgia", depth: 36, alt: "Alpine Lake Grdzeli ringed by forested slopes in the Lagodekhi reserve, Georgia", by: "Giorgi Balakhadze", lic: "CC BY-SA 4.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Lake_Grdzeli%2C_Lagodekhi_Protected_Area%2C_Georgia_02.jpg/960px-Lake_Grdzeli%2C_Lagodekhi_Protected_Area%2C_Georgia_02.jpg", page: "https://commons.wikimedia.org/wiki/File:Lake_Grdzeli%2C_Lagodekhi_Protected_Area%2C_Georgia_02.jpg" }
  ];

  var log = document.getElementById("log");
  var credits = document.getElementById("credits");
  var posOut = document.getElementById("loghead-pos");
  var stateOut = document.getElementById("log-state");
  var countOut = document.getElementById("plate-count");
  var deepestOut = document.getElementById("deepest");
  var clockOut = document.getElementById("clock");
  var driftBtn = document.getElementById("drift");
  var prevBtn = document.getElementById("dock-prev");
  var nextBtn = document.getElementById("dock-next");
  var openBtn = document.getElementById("dock-open");

  var viewer = document.getElementById("viewer");
  var vImg = document.getElementById("viewer-img");
  var vCap = document.getElementById("viewer-cap");
  var vCount = document.getElementById("viewer-count");
  var vClose = document.getElementById("viewer-close");
  var vPrev = document.getElementById("viewer-prev");
  var vNext = document.getElementById("viewer-next");

  var still = window.matchMedia("(prefers-reduced-motion: reduce)");

  var rows = [];
  var cursor = 0;
  var held = false;
  var last = 0;
  var target = 0;
  var seek = null;
  var beat = 0;

  countOut.textContent = "0" + PLATES.length;
  deepestOut.textContent = Math.max.apply(null, PLATES.map(function (p) { return p.depth; })) + " m";

  PLATES.forEach(function (p, i) {
    var row = document.createElement("button");
    row.type = "button";
    row.className = "entry";
    row.dataset.index = String(i);
    row.tabIndex = i === 0 ? 0 : -1;

    var shot = document.createElement("span");
    shot.className = "entry__shot";
    var img = document.createElement("img");
    img.src = p.src;
    img.alt = p.alt;
    img.loading = "lazy";
    img.decoding = "async";
    shot.appendChild(img);

    var data = document.createElement("span");
    data.className = "entry__data";
    var num = document.createElement("span");
    num.className = "entry__n";
    num.textContent = "Return " + p.n;
    var name = document.createElement("b");
    name.className = "entry__name";
    name.textContent = p.name;
    var place = document.createElement("span");
    place.className = "entry__place";
    place.textContent = p.place;
    var depth = document.createElement("span");
    depth.className = "entry__depth";
    depth.textContent = String(p.depth) + " m sounding";
    data.appendChild(num);
    data.appendChild(name);
    data.appendChild(place);
    data.appendChild(depth);

    row.appendChild(shot);
    row.appendChild(data);
    log.appendChild(row);
    rows.push(row);

    var li = document.createElement("li");
    var a = document.createElement("a");
    a.href = p.page;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = p.name;
    li.appendChild(a);
    li.appendChild(document.createTextNode(" \u2014 " + p.by + ", " + p.lic));
    credits.appendChild(li);
  });

  function cap() {
    return Math.max(0, log.scrollHeight - log.clientHeight);
  }

  function wantFor(i) {
    var raw = rows[i].offsetTop - log.clientHeight * .2;
    return Math.max(0, Math.min(cap(), raw));
  }

  function paintCursor() {
    rows.forEach(function (r, k) {
      r.tabIndex = k === cursor ? 0 : -1;
      if (k === cursor) {
        r.setAttribute("aria-current", "true");
      } else {
        r.removeAttribute("aria-current");
      }
    });
    posOut.textContent = "0" + (cursor + 1) + " / 0" + PLATES.length;
  }

  function go(i, focus) {
    cursor = (i + PLATES.length) % PLATES.length;
    paintCursor();
    if (focus) {
      rows[cursor].focus({ preventScroll: true });
    }
    seek = wantFor(cursor);
  }

  function drifting() {
    if (held || still.matches || !viewer.hidden) {
      return false;
    }
    return !log.contains(document.activeElement);
  }

  function tick(now) {
    if (!last) {
      last = now;
    }
    var dt = Math.min(60, now - last) / 16.67;
    last = now;
    if (drifting()) {
      beat += dt;
      if (beat > 150) {
        beat = 0;
        go(cursor + 1, false);
      }
    } else {
      beat = 0;
    }
    if (seek !== null) {
      target += (seek - target) * Math.min(1, .16);
      if (Math.abs(seek - target) < .5) {
        target = seek;
        seek = null;
      }
    }
    if (target > cap()) {
      target = cap();
    }
    if (Math.abs(log.scrollTop - target) > .4) {
      log.scrollTop = target;
    }
    requestAnimationFrame(tick);
  }

  log.addEventListener("keydown", function (e) {
    var k = e.key;
    if (k === "ArrowDown" || k === "ArrowRight") {
      go(cursor + 1, true);
    } else if (k === "ArrowUp" || k === "ArrowLeft") {
      go(cursor - 1, true);
    } else if (k === "Home") {
      go(0, true);
    } else if (k === "End") {
      go(PLATES.length - 1, true);
    } else if (k === "PageDown") {
      go(cursor + 3, true);
    } else if (k === "PageUp") {
      go(cursor - 3, true);
    } else if (k === "Enter") {
      openViewer(cursor);
    } else {
      return;
    }
    e.preventDefault();
  });

  log.addEventListener("click", function (e) {
    var row = e.target.closest(".entry");
    if (!row) {
      return;
    }
    go(Number(row.dataset.index), false);
    openViewer(cursor);
  });

  log.addEventListener("wheel", function () {
    setHeld(true);
  }, { passive: true });

  function setHeld(on) {
    held = on;
    driftBtn.setAttribute("aria-pressed", String(on));
    driftBtn.textContent = on ? "Resume drift" : "Hold drift";
    stateOut.textContent = on ? "HELD" : "DRIFTING";
    if (on) {
      target = log.scrollTop;
      seek = null;
    }
  }

  driftBtn.addEventListener("click", function () {
    setHeld(!held);
  });
  prevBtn.addEventListener("click", function () {
    setHeld(true);
    go(cursor - 1, false);
  });
  nextBtn.addEventListener("click", function () {
    setHeld(true);
    go(cursor + 1, false);
  });
  openBtn.addEventListener("click", function () {
    openViewer(cursor);
  });

  var opened = -1;
  var restore = null;

  function openViewer(i) {
    opened = (i + PLATES.length) % PLATES.length;
    var p = PLATES[opened];
    vImg.src = p.src;
    vImg.alt = p.alt;
    vCap.textContent = p.n + " \u00b7 " + p.name + " \u00b7 " + p.by + " \u00b7 " + p.lic;
    vCount.textContent = p.n + " / 0" + PLATES.length;
    restore = document.activeElement;
    viewer.hidden = false;
    setHeld(true);
    vClose.focus({ preventScroll: true });
  }

  function closeViewer() {
    if (viewer.hidden) {
      return;
    }
    viewer.hidden = true;
    vImg.removeAttribute("src");
    if (restore && restore.focus) {
      restore.focus({ preventScroll: true });
    }
    restore = null;
  }

  vClose.addEventListener("click", closeViewer);
  vPrev.addEventListener("click", function () {
    openViewer(opened - 1);
  });
  vNext.addEventListener("click", function () {
    openViewer(opened + 1);
  });
  viewer.querySelector(".viewer__scrim").addEventListener("click", closeViewer);

  viewer.addEventListener("keydown", function (e) {
    var k = e.key;
    if (k === "Escape") {
      closeViewer();
    } else if (k === "ArrowRight" || k === "ArrowDown") {
      openViewer(opened + 1);
    } else if (k === "ArrowLeft" || k === "ArrowUp") {
      openViewer(opened - 1);
    } else if (k === "Home") {
      openViewer(0);
    } else if (k === "End") {
      openViewer(PLATES.length - 1);
    } else if (k === "Tab") {
      var ring = [vPrev, vNext, vClose];
      var at = ring.indexOf(document.activeElement);
      ring[(at + (e.shiftKey ? -1 : 1) + ring.length) % ring.length].focus({ preventScroll: true });
    } else {
      return;
    }
    e.preventDefault();
  });

  var base = 7 * 60 + 14;
  setInterval(function () {
    base += 1;
    var h = Math.floor(base / 60) % 24;
    var m = base % 60;
    clockOut.textContent = (h < 10 ? "0" + h : String(h)) + ":" + (m < 10 ? "0" + m : String(m));
  }, 1400);

  window.addEventListener("resize", function () {
    if (target > cap()) {
      target = cap();
    }
  });

  paintCursor();
  requestAnimationFrame(tick);
})();
