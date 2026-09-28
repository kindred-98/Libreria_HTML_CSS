(function () {
  "use strict";

  var FRAMES = [
    { n: "01", name: "Big Sight", code: "23:41:08", alt: "Tokyo Big Sight convention centre lit up after dark", by: "Masato Ohta", lic: "CC BY 2.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Tokyo_Big_Sight_at_Night.jpg/960px-Tokyo_Big_Sight_at_Night.jpg" },
    { n: "02", name: "Skytree", code: "23:41:52", alt: "Tokyo Skytree glowing white above the night city", by: "掬茶", lic: "CC BY-SA 3.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Tokyo_Skytree_at_night_%28White%29.jpg/960px-Tokyo_Skytree_at_night_%28White%29.jpg" },
    { n: "03", name: "Shinjuku 3", code: "23:42:37", alt: "Shinjuku street at night with lit shopfronts and passing traffic", by: "Martin Falbisoner", lic: "CC BY-SA 3.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Night_in_Shinjuku_3.JPG/960px-Night_in_Shinjuku_3.JPG" },
    { n: "04", name: "Big Street", code: "23:43:19", alt: "Tokyo main street at night lined with continuous neon signage", by: "Øyvind Holmstad", lic: "CC BY-SA 4.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/TOKYO_BIG_STREET_BY_NIGHT_2017.jpg/960px-TOKYO_BIG_STREET_BY_NIGHT_2017.jpg" },
    { n: "05", name: "Scramble", code: "23:44:04", alt: "Pedestrians streaming across the Shibuya scramble crossing at night", by: "Benh LIEU SONG", lic: "CC BY-SA 2.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Tokyo_Shibuya_Scramble_Crossing_2018-10-09.jpg/960px-Tokyo_Shibuya_Scramble_Crossing_2018-10-09.jpg" },
    { n: "06", name: "Tokyo Night", code: "23:44:48", alt: "Tokyo seen at night from above, a wide spread of city lights", by: "Ka Hei Mak", lic: "CC BY-SA 2.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Tokyo_Night_%2814519874626%29.jpg/960px-Tokyo_Night_%2814519874626%29.jpg" },
    { n: "07", name: "Kabukicho", code: "23:45:33", alt: "Rows of colourful neon signs stacked above the street in Kabukicho, Shinjuku", by: "Basile Morin", lic: "CC BY-SA 4.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Colorful_neon_street_signs_in_Kabukich%C5%8D%2C_Shinjuku%2C_Tokyo.jpg/960px-Colorful_neon_street_signs_in_Kabukich%C5%8D%2C_Shinjuku%2C_Tokyo.jpg" },
    { n: "08", name: "Yasukuni-dori", code: "23:46:11", alt: "Green and yellow taxi on Yasukuni-dori avenue surrounded by neon signs", by: "Basile Morin", lic: "CC BY-SA 4.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Green_and_yellow_taxi_at_night_in_Yasukuni-dori_Avenue%2C_Shinjuku%2C_Tokyo.jpg/960px-Green_and_yellow_taxi_at_night_in_Yasukuni-dori_Avenue%2C_Shinjuku%2C_Tokyo.jpg" }
  ];

  var deck = document.getElementById("deck");
  var belt = document.getElementById("belt");
  var track = document.getElementById("track");
  var railTrack = document.getElementById("railtrack");
  var runBtn = document.getElementById("run");
  var rateBtns = Array.prototype.slice.call(document.querySelectorAll(".console__rate"));
  var tLoop = document.getElementById("telem-loop");
  var tOffset = document.getElementById("telem-offset");
  var tState = document.getElementById("telem-state");
  var hint = document.getElementById("hint");

  var viewer = document.getElementById("viewer");
  var vImg = document.getElementById("viewer-img");
  var vCap = document.getElementById("viewer-cap");
  var vCount = document.getElementById("viewer-count");
  var vClose = document.getElementById("viewer-close");

  var still = window.matchMedia("(prefers-reduced-motion: reduce)");

  var copies = [];
  for (var c = 0; c < 2; c++) {
    var half = document.createElement("div");
    half.className = "belt__half";
    if (c === 1) {
      half.setAttribute("aria-hidden", "true");
    }
    FRAMES.forEach(function (f, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "frame";
      if (c === 1) {
        b.tabIndex = -1;
      } else {
        b.dataset.index = String(i);
        copies.push(b);
      }
      var shot = document.createElement("span");
      shot.className = "frame__shot";
      var img = document.createElement("img");
      img.src = f.src;
      img.alt = f.alt;
      img.loading = "lazy";
      img.decoding = "async";
      var brace = document.createElement("span");
      brace.className = "frame__brace";
      shot.appendChild(img);
      shot.appendChild(brace);
      var data = document.createElement("span");
      data.className = "frame__data";
      var num = document.createElement("span");
      num.className = "frame__n";
      num.textContent = f.n;
      var label = document.createElement("span");
      label.className = "frame__name";
      label.textContent = f.name;
      data.appendChild(num);
      data.appendChild(label);
      b.appendChild(shot);
      b.appendChild(data);
      half.appendChild(b);
    });
    track.appendChild(half);
  }

  var railHalves = [];
  for (var r = 0; r < 2; r++) {
    var rh = document.createElement("div");
    rh.className = "return__half";
    if (r === 1) {
      rh.setAttribute("aria-hidden", "true");
    }
    FRAMES.forEach(function (f, i) {
      var chip = document.createElement("span");
      chip.className = "chip";
      chip.style.setProperty("--c", String(i));
      var led = document.createElement("i");
      var label = document.createElement("b");
      label.textContent = f.n + " " + f.name;
      var code = document.createElement("span");
      code.textContent = f.code;
      chip.appendChild(led);
      chip.appendChild(label);
      chip.appendChild(code);
      rh.appendChild(chip);
    });
    railTrack.appendChild(rh);
    railHalves.push(rh);
  }

  var beltSpan = 1;
  var railSpan = 1;
  var x = 0;
  var rx = 0;
  var travelled = 0;
  var speed = 1;
  var held = false;
  var dragging = false;
  var grabX = 0;
  var grabTrack = 0;
  var seek = null;
  var cursor = 0;
  var last = 0;
  var stamp = 0;

  function measure() {
    beltSpan = Math.max(1, track.firstElementChild.getBoundingClientRect().width);
    railSpan = Math.max(1, railHalves[0].getBoundingClientRect().width);
  }

  function running() {
    return !held && !dragging && !belt.contains(document.activeElement) && !still.matches;
  }

  function paint() {
    track.style.transform = "translate3d(" + -x.toFixed(2) + "px,0,0)";
    railTrack.style.transform = "translate3d(" + (-rx % railSpan).toFixed(2) + "px,0,0)";
  }

  function telem() {
    var loop = Math.floor(travelled / beltSpan) + 1;
    var off = Math.floor(x % beltSpan);
    if (off < 0) {
      off += beltSpan;
    }
    tLoop.textContent = String(loop).padStart(2, "0");
    tOffset.textContent = String(off).padStart(4, "0");
    tState.textContent = running() ? "RUN" : "HOLD";
  }

  function tick(now) {
    if (!last) {
      last = now;
    }
    var dt = Math.min(48, now - last) / 16.67;
    last = now;
    if (seek !== null) {
      x += (seek - x) * Math.min(1, 0.16);
      if (Math.abs(seek - x) < 0.4) {
        x = seek;
        seek = null;
      }
    } else if (running()) {
      x += 0.9 * speed * dt;
      travelled += 0.9 * speed * dt;
    }
    if (x >= beltSpan) {
      x -= beltSpan;
    }
    if (x < 0) {
      x += beltSpan;
    }
    rx -= 0.9 * speed * 0.62 * dt;
    paint();
    if (now - stamp > 110) {
      stamp = now;
      telem();
    }
    requestAnimationFrame(tick);
  }

  function focusFrame(i) {
    cursor = (i + FRAMES.length) % FRAMES.length;
    var card = copies[cursor];
    if (!card) {
      return;
    }
    var left = card.offsetLeft;
    var want = left - (belt.clientWidth - card.offsetWidth) / 2;
    if (want < 0) {
      want += beltSpan;
    }
    seek = want;
    card.focus({ preventScroll: true });
    hint.textContent = "Frame " + FRAMES[cursor].n + " held in place \u00b7 arrow keys walk \u00b7 Enter opens the full plate";
  }

  deck.addEventListener("keydown", function (e) {
    var k = e.key;
    if (k === "ArrowRight" || k === "ArrowDown") {
      focusFrame(cursor + 1);
      e.preventDefault();
    } else if (k === "ArrowLeft" || k === "ArrowUp") {
      focusFrame(cursor - 1);
      e.preventDefault();
    } else if (k === "Home") {
      focusFrame(0);
      e.preventDefault();
    } else if (k === "End") {
      focusFrame(FRAMES.length - 1);
      e.preventDefault();
    }
  });

  track.addEventListener("click", function (e) {
    var btn = e.target.closest(".frame");
    if (!btn || !btn.dataset.index) {
      return;
    }
    cursor = Number(btn.dataset.index);
    openViewer(cursor);
  });

  belt.addEventListener("pointerdown", function (e) {
    if (e.target.closest(".frame")) {
      return;
    }
    dragging = true;
    grabX = e.clientX;
    grabTrack = x;
    belt.setPointerCapture(e.pointerId);
  });
  belt.addEventListener("pointermove", function (e) {
    if (!dragging) {
      return;
    }
    var next = grabTrack - (e.clientX - grabX);
    if (next < 0) {
      next += beltSpan;
    }
    if (next > beltSpan) {
      next -= beltSpan;
    }
    x = next;
    seek = null;
    paint();
  });
  ["pointerup", "pointercancel"].forEach(function (t) {
    belt.addEventListener(t, function () {
      dragging = false;
    });
  });
  belt.addEventListener("scroll", function () {
    if (!still.matches) {
      belt.scrollLeft = 0;
    }
  });

  runBtn.addEventListener("click", function () {
    held = !held;
    runBtn.setAttribute("aria-pressed", String(held));
    runBtn.textContent = held ? "Release belt" : "Hold belt";
  });

  rateBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      speed = Number(b.dataset.rate);
      rateBtns.forEach(function (o) {
        var on = o === b;
        o.classList.toggle("is-on", on);
        if (on) {
          o.setAttribute("aria-pressed", "true");
        } else {
          o.removeAttribute("aria-pressed");
        }
      });
    });
  });

  var opened = -1;
  var restore = null;

  function openViewer(i) {
    opened = (i + FRAMES.length) % FRAMES.length;
    var f = FRAMES[opened];
    vImg.src = f.src;
    vImg.alt = f.alt;
    vCap.textContent = f.n + " \u00b7 " + f.name + " \u00b7 " + f.by + " \u00b7 " + f.lic;
    vCount.textContent = f.n + " / 08";
    restore = document.activeElement;
    viewer.hidden = false;
    held = true;
    runBtn.setAttribute("aria-pressed", "true");
    runBtn.textContent = "Release belt";
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

  function step(d) {
    openViewer(opened + d);
  }

  vClose.addEventListener("click", closeViewer);
  document.getElementById("viewer-prev").addEventListener("click", function () {
    step(-1);
  });
  document.getElementById("viewer-next").addEventListener("click", function () {
    step(1);
  });
  viewer.querySelector(".viewer__scrim").addEventListener("click", closeViewer);

  viewer.addEventListener("keydown", function (e) {
    var k = e.key;
    if (k === "Escape") {
      closeViewer();
      e.preventDefault();
    } else if (k === "ArrowRight") {
      step(1);
      e.preventDefault();
    } else if (k === "ArrowLeft") {
      step(-1);
      e.preventDefault();
    } else if (k === "Home") {
      openViewer(0);
      e.preventDefault();
    } else if (k === "End") {
      openViewer(FRAMES.length - 1);
      e.preventDefault();
    } else if (k === "Tab") {
      var f = [document.getElementById("viewer-prev"), document.getElementById("viewer-next"), vClose];
      var at = f.indexOf(document.activeElement);
      e.preventDefault();
      var to = at + (e.shiftKey ? -1 : 1);
      f[(to + f.length) % f.length].focus({ preventScroll: true });
    }
  });

  window.addEventListener("resize", function () {
    var before = beltSpan;
    measure();
    if (beltSpan !== before) {
      x = x % beltSpan;
      paint();
    }
  });

  measure();
  paint();
  telem();
  if (!still.matches) {
    requestAnimationFrame(tick);
  }
})();
