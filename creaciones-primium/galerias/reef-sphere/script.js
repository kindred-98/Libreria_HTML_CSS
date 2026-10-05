(function () {
  "use strict";

  var PLATES = [
    { n: "01", name: "Red Sea reef", alt: "Coral reef in the Red Sea seen through clear water", by: "Mahmoud Habeeb", lic: "public domain" },
    { n: "02", name: "Flynn Reef outcrop", alt: "Coral outcrop rising from the clear water of Flynn Reef", by: "Toby Hudson", lic: "CC BY-SA 3.0" },
    { n: "03", name: "Reef landscape", alt: "Colourful underwater landscape across a coral reef", by: "Jim E Maragos", lic: "public domain" },
    { n: "04", name: "Underwater reef wall", alt: "Underwater photograph of a coral reef wall", by: "Jerry Reid", lic: "public domain" },
    { n: "05", name: "Marsa Alam reef", alt: "Coral reef near Marsa Alam in open blue water", by: "Thomas Hubauer", lic: "CC BY-SA 2.0" },
    { n: "06", name: "Moore Reef scape", alt: "Reefscape of corals and rock along Moore Reef", by: "Holobionics", lic: "CC BY-SA 4.0" },
    { n: "07", name: "Samoa, Fagamalo", alt: "Coral reef off the coast of Fagamalo on Savai'i, Samoa", by: "Rickard Törnblad", lic: "CC BY-SA 4.0" },
    { n: "08", name: "Samoa shallows", alt: "Shallow coral reef off Fagamalo, Savai'i, seen from above", by: "Rickard Törnblad", lic: "CC BY-SA 4.0" }
  ];

  var globe = document.getElementById("globe");
  var scope = document.getElementById("scope");
  var frontShell = document.getElementById("front");
  var backShell = document.getElementById("back");
  var read = document.getElementById("scope-read");
  var driftBtn = document.getElementById("drift");
  var presetBtns = Array.prototype.slice.call(document.querySelectorAll(".dial__btn[data-tx]"));

  var viewer = document.getElementById("viewer");
  var vImg = document.getElementById("vimg");
  var vCap = document.getElementById("vcap");
  var vCount = document.getElementById("vcount");
  var vClose = document.getElementById("vclose");
  var vPrev = document.getElementById("vprev");
  var vNext = document.getElementById("vnext");

  var still = window.matchMedia("(prefers-reduced-motion: reduce)");

  var pins = Array.prototype.slice.call(frontShell.querySelectorAll(".pin"));
  pins.forEach(function (p) {
    var c = p.cloneNode(true);
    delete c.dataset.index;
    c.removeAttribute("tabindex");
    c.style.transform = "rotateX(" + p.dataset.ex + ") rotateY(calc(" + p.dataset.ax + " + 180deg)) translateZ(var(--r)) scale(.9)";
    backShell.appendChild(c);
  });

  var ty = -20;
  var tx = -14;
  var ttx = tx;
  var tty = ty;
  var drifting = !still.matches;
  var dragging = false;
  var lastX = 0;
  var lastY = 0;
  var last = 0;
  var facing = 0;

  function clamp(v, a, b) {
    return v < a ? a : v > b ? b : v;
  }

  function spinOff() {
    if (!drifting) {
      return;
    }
    drifting = false;
    driftBtn.classList.remove("is-on");
    driftBtn.removeAttribute("aria-pressed");
    driftBtn.textContent = "Drift";
  }

  function paint() {
    globe.style.transform = "rotateX(" + ttx.toFixed(2) + "deg) rotateY(" + tty.toFixed(2) + "deg)";
    globe.style.setProperty("--tx", ttx.toFixed(2) + "deg");
    globe.style.setProperty("--ty", tty.toFixed(2) + "deg");
    var best = Infinity;
    var bestI = 0;
    for (var i = 0; i < pins.length; i++) {
      var ax = Number(pins[i].dataset.ax);
      var d = ((ax + tty) % 360 + 360) % 360;
      if (d > 180) {
        d -= 360;
      }
      var f = 1 - Math.min(1, Math.abs(d) / 92);
      pins[i].style.opacity = (0.16 + 0.84 * f).toFixed(3);
      pins[i].style.filter = "brightness(" + (0.3 + 0.78 * f).toFixed(3) + ") saturate(" + (0.6 + 0.55 * f).toFixed(3) + ")";
      if (Math.abs(d) < best) {
        best = Math.abs(d);
        bestI = i;
      }
    }
    if (bestI !== facing) {
      facing = bestI;
    }
    read.textContent = "Facing plate " + PLATES[facing].n + " \u00b7 " + PLATES[facing].name;
  }

  function loop(now) {
    if (!last) {
      last = now;
    }
    var dt = Math.min(48, now - last) / 16.67;
    last = now;
    if (drifting && !dragging) {
      tty += 0.19 * dt;
      ty = tty;
    } else {
      ttx += (tx - ttx) * Math.min(1, 0.14);
      tty += (ty - tty) * Math.min(1, 0.14);
    }
    paint();
    requestAnimationFrame(loop);
  }

  scope.addEventListener("pointerdown", function (e) {
    if (e.target.closest(".pin")) {
      return;
    }
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    scope.setPointerCapture(e.pointerId);
  });
  scope.addEventListener("pointermove", function (e) {
    if (!dragging) {
      return;
    }
    spinOff();
    tty += (e.clientX - lastX) * 0.45;
    ttx = clamp(ttx - (e.clientY - lastY) * 0.32, -62, 62);
    ty = tty;
    tx = ttx;
    lastX = e.clientX;
    lastY = e.clientY;
  });
  ["pointerup", "pointercancel"].forEach(function (t) {
    scope.addEventListener(t, function () {
      dragging = false;
    });
  });

  scope.addEventListener("keydown", function (e) {
    var k = e.key;
    if (k === "ArrowRight" || k === "ArrowUp") {
      spinOff();
      tty += 9;
      ty = tty;
      e.preventDefault();
    } else if (k === "ArrowLeft" || k === "ArrowDown") {
      spinOff();
      tty -= 9;
      ty = tty;
      e.preventDefault();
    } else if (k === "PageUp") {
      spinOff();
      ttx = clamp(ttx - 8, -62, 62);
      tx = ttx;
      e.preventDefault();
    } else if (k === "PageDown") {
      spinOff();
      ttx = clamp(ttx + 8, -62, 62);
      tx = ttx;
      e.preventDefault();
    } else if (k === "Home") {
      spinOff();
      tx = -14;
      ty = -20;
      ttx = tx;
      tty = ty;
      e.preventDefault();
    }
  });

  presetBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      spinOff();
      tx = Number(b.dataset.tx);
      ty = Number(b.dataset.ty);
    });
  });

  driftBtn.addEventListener("click", function () {
    drifting = !drifting;
    if (drifting) {
      driftBtn.classList.add("is-on");
      driftBtn.setAttribute("aria-pressed", "true");
      driftBtn.textContent = "Drift";
    } else {
      driftBtn.classList.remove("is-on");
      driftBtn.removeAttribute("aria-pressed");
      driftBtn.textContent = "Resume drift";
    }
  });

  scope.addEventListener("click", function (e) {
    var p = e.target.closest(".pin");
    if (!p || !p.dataset.index) {
      return;
    }
    openViewer(Number(p.dataset.index));
  });

  var opened = -1;
  var restore = null;

  function openViewer(i) {
    opened = (i + PLATES.length) % PLATES.length;
    var p = PLATES[opened];
    vImg.src = pins[opened].querySelector("img").getAttribute("src");
    vImg.alt = p.alt;
    vCap.textContent = "Plate " + p.n + " \u00b7 " + p.by + " \u00b7 " + p.lic;
    vCount.textContent = p.n + " / 0" + PLATES.length;
    restore = document.activeElement;
    viewer.hidden = false;
    vClose.focus({ preventScroll: true });
  }

  function closeViewer() {
    if (viewer.hidden) {
      return;
    }
    viewer.hidden = true;
    vImg.removeAttribute("src");
    if (restore?.focus) {
      restore.focus({ preventScroll: true });
    }
    restore = null;
  }

  function step(d) {
    openViewer(opened + d);
  }

  vClose.addEventListener("click", closeViewer);
  vPrev.addEventListener("click", function () {
    step(-1);
  });
  vNext.addEventListener("click", function () {
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
      openViewer(PLATES.length - 1);
      e.preventDefault();
    } else if (k === "Tab") {
      var f = [vPrev, vNext, vClose];
      var at = f.indexOf(document.activeElement);
      e.preventDefault();
      f[(at + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus({ preventScroll: true });
    }
  });

  paint();
  if (!drifting) {
    driftBtn.classList.remove("is-on");
    driftBtn.removeAttribute("aria-pressed");
    driftBtn.textContent = "Resume drift";
  }
  if (!still.matches) {
    requestAnimationFrame(loop);
  }
})();
