(function () {
  "use strict";

  var PLATES = [
    { id: "A1", name: "Brasilia, Congresso Nacional", alt: "Concrete columns of the Brazilian national congress rising into a clear sky", by: "Mario Roberto Duran Ortiz", lic: "public domain" },
    { id: "A2", name: "Cantilevered slab", alt: "Flat roof and cantilevered slab of a modern building against a pale sky", by: "Mihail Ribkin", lic: "CC0" },
    { id: "B1", name: "Glass brick facade", alt: "Glass brick facade of a modern building catching the daylight", by: "Jovan Marković", lic: "CC BY 2.0" },
    { id: "B2", name: "Curved balcony", alt: "Curved concrete balcony of a modern apartment block", by: "AlixSaz", lic: "CC BY-SA 4.0" },
    { id: "C1", name: "Toronto office facade", alt: "Glass and steel office facade in Toronto seen from street level", by: "ThomasLendt", lic: "CC BY-SA 4.0" },
    { id: "C2", name: "Toronto fins", alt: "Repeating concrete fins across a Toronto office building", by: "ThomasLendt", lic: "CC BY-SA 4.0" },
    { id: "D1", name: "North Street, Swords", alt: "Rendered modern housing frontage on a suburban street", by: "William Murphy", lic: "CC BY-SA 2.0" },
    { id: "D2", name: "Den Haag office block", alt: "Modern office block in The Hague behind a gridded facade", by: "acediscovery", lic: "CC BY 4.0" }
  ];

  var rig = document.getElementById("rig");
  var plate = document.getElementById("bayPlate");
  var range = document.getElementById("explode");
  var spreadRead = document.getElementById("spread-read");
  var gapRead = document.getElementById("gap-read");
  var orbitBtn = document.getElementById("orbit");
  var gatherBtn = document.getElementById("gather");
  var stack = document.getElementById("stack");

  var viewer = document.getElementById("viewer");
  var vImg = document.getElementById("vimg");
  var vCap = document.getElementById("vcap");
  var vCount = document.getElementById("vcount");
  var vClose = document.getElementById("vclose");
  var vPrev = document.getElementById("vprev");
  var vNext = document.getElementById("vnext");

  var still = window.matchMedia("(prefers-reduced-motion: reduce)");

  var shots = Array.prototype.slice.call(document.querySelectorAll(".shot"));
  var oy = -16;
  var toy = oy;
  var orbit = !still.matches;
  var dragging = false;
  var dragX = 0;
  var dragY = 0;
  var baseY = oy;
  var start = 0;

  function setSpread(v) {
    var lift = 24 + (v / 100) * 196;
    var litz = 10 + (v / 100) * 52;
    stack.style.setProperty("--lift", lift.toFixed(1) + "px");
    stack.style.setProperty("--litz", litz.toFixed(1) + "px");
    spreadRead.textContent = Math.round(v) + "%";
    gapRead.textContent = "Plate gap " + Math.round(lift) + "px";
    range.style.setProperty("--fill", v + "%");
  }

  range.addEventListener("input", function () {
    setSpread(Number(range.value));
  });

  gatherBtn.addEventListener("click", function () {
    range.value = "0";
    setSpread(0);
  });

  orbitBtn.addEventListener("click", function () {
    orbit = !orbit;
    if (orbit) {
      orbitBtn.classList.add("is-on");
      orbitBtn.setAttribute("aria-pressed", "true");
      orbitBtn.textContent = "Slow orbit";
    } else {
      orbitBtn.classList.remove("is-on");
      orbitBtn.removeAttribute("aria-pressed");
      orbitBtn.textContent = "Resume orbit";
    }
  });

  function loop(now) {
    if (!start) {
      start = now;
    }
    if (!still.matches) {
      if (orbit && !dragging) {
        var s = Math.sin((now - start) / 2600);
        toy = baseY + s * 15;
      }
      rig.style.transform = "rotateX(50deg) rotateY(" + toy.toFixed(2) + "deg) rotateZ(-30deg)";
    }
    requestAnimationFrame(loop);
  }

  plate.addEventListener("pointerdown", function (e) {
    if (e.target.closest(".shot")) {
      return;
    }
    dragging = true;
    dragX = e.clientX;
    dragY = e.clientY;
    baseY = toy;
    plate.setPointerCapture(e.pointerId);
  });
  plate.addEventListener("pointermove", function (e) {
    if (!dragging) {
      return;
    }
    baseY = baseY + (e.clientX - dragX) * 0.28;
    toy = baseY - (e.clientY - dragY) * 0.18;
    dragX = e.clientX;
    dragY = e.clientY;
    orbit = false;
    orbitBtn.classList.remove("is-on");
    orbitBtn.removeAttribute("aria-pressed");
    orbitBtn.textContent = "Resume orbit";
    rig.style.transform = "rotateX(50deg) rotateY(" + toy.toFixed(2) + "deg) rotateZ(-30deg)";
  });
  ["pointerup", "pointercancel"].forEach(function (t) {
    plate.addEventListener(t, function () {
      dragging = false;
    });
  });

  plate.addEventListener("click", function (e) {
    var s = e.target.closest(".shot");
    if (!s) {
      return;
    }
    openViewer(Number(s.dataset.index));
  });

  document.addEventListener("keydown", function (e) {
    if (!viewer.hidden) {
      return;
    }
    var t = e.target;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) {
      return;
    }
    var k = e.key;
    if (k === "ArrowRight") {
      range.value = String(Math.min(100, Number(range.value) + 6));
      setSpread(Number(range.value));
      e.preventDefault();
    } else if (k === "ArrowLeft") {
      range.value = String(Math.max(0, Number(range.value) - 6));
      setSpread(Number(range.value));
      e.preventDefault();
    } else if (k === "Home") {
      range.value = "0";
      setSpread(0);
      e.preventDefault();
    } else if (k === "End") {
      range.value = "100";
      setSpread(100);
      e.preventDefault();
    }
  });

  var opened = -1;
  var restore = null;

  function openViewer(i) {
    opened = (i + PLATES.length) % PLATES.length;
    var p = PLATES[opened];
    vImg.src = shots[opened].querySelector("img").getAttribute("src");
    vImg.alt = p.alt;
    vCap.textContent = p.id + " \u00b7 " + p.name + " \u00b7 " + p.by + " \u00b7 " + p.lic;
    vCount.textContent = p.id + " / 08";
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

  if (still.matches) {
    orbitBtn.classList.remove("is-on");
    orbitBtn.removeAttribute("aria-pressed");
    orbitBtn.textContent = "Resume orbit";
  }

  setSpread(Number(range.value));
  requestAnimationFrame(loop);
})();
