(function () {
  "use strict";

  var PLATES = [
    { id: "F1", name: "Fuji from Kawaguchiko", alt: "Mount Fuji seen across Lake Kawaguchiko behind rows of cherry blossom", by: "Midori", lic: "CC BY 3.0" },
    { id: "F2", name: "Yoshino slopes", alt: "Cherry blossom covering the Yoshino hills in spring", by: "Luka Peternel", lic: "CC BY-SA 4.0" },
    { id: "F3", name: "Hills in blossom", alt: "Hillsides near Yoshino blanketed in pale cherry blossom", by: "Luka Peternel", lic: "CC BY-SA 4.0" },
    { id: "F4", name: "Takada keep", alt: "Cherry blossom around Takada Castle during the spring festival", by: "Cp9asngf", lic: "CC BY-SA 4.0" },
    { id: "F5", name: "Kathmandu branches", alt: "Cherry blossom branches in full flower in Kathmandu", by: "Gaurav Dhwaj Khadka", lic: "CC BY-SA 4.0" },
    { id: "F6", name: "Retiro park, Madrid", alt: "Cherry blossom in bloom in El Retiro Park, Madrid", by: "Satdeep Gill", lic: "CC BY-SA 4.0" },
    { id: "S1", name: "Cluster on bare branch", alt: "Close view of cherry blossom clusters on bare branches", by: "RF Vila", lic: "CC BY-SA 4.0" },
    { id: "S2", name: "Roppongi Hills", alt: "Cherry blossom growing between the towers of Roppongi Hills", by: "Syced", lic: "CC0" }
  ];

  var NAMES = ["front", "right", "back", "left", "top", "bottom"];

  var scene = document.getElementById("scene");
  var stage = document.getElementById("stage");
  var stageRead = document.getElementById("stage-read");
  var spinBtn = document.getElementById("spin");
  var viewsBtns = Array.prototype.slice.call(document.querySelectorAll(".views__btn[data-rx]"));
  var yRead = document.getElementById("yaw");
  var pRead = document.getElementById("pitch");
  var fRead = document.getElementById("face");
  var mRead = document.getElementById("mode");

  var viewer = document.getElementById("viewer");
  var vImg = document.getElementById("vimg");
  var vCap = document.getElementById("vcap");
  var vCount = document.getElementById("vcount");
  var vClose = document.getElementById("vclose");
  var vPrev = document.getElementById("vprev");
  var vNext = document.getElementById("vnext");

  var still = window.matchMedia("(prefers-reduced-motion: reduce)");

  var rx = -16;
  var ry = -24;
  var trx = rx;
  var try_ = ry;
  var spinning = !still.matches;
  var dragging = false;
  var lastX = 0;
  var lastY = 0;
  var last = 0;
  var stamp = 0;

  function clamp(v, a, b) {
    return v < a ? a : v > b ? b : v;
  }

  function front() {
    var y = ((ry % 360) + 360) % 360;
    var i = Math.round(y / 90) % 4;
    return NAMES[i];
  }

  function paint() {
    scene.style.transform = "rotateX(" + trx.toFixed(2) + "deg) rotateY(" + try_.toFixed(2) + "deg)";
    yRead.textContent = Math.round(try_);
    pRead.textContent = Math.round(trx);
    var f = front();
    var idx = f === "front" ? 0 : f === "right" ? 1 : f === "back" ? 2 : f === "left" ? 3 : f === "top" ? 4 : 5;
    fRead.textContent = PLATES[idx].id;
    stageRead.textContent = "Facing face " + PLATES[idx].id + " \u00b7 " + PLATES[idx].name;
  }

  function steer(dx, dy) {
    spinOff();
    try_ += dx;
    trx = clamp(trx + dy, -84, 84);
    ry = try_;
    rx = trx;
  }

  function spinOff() {
    if (!spinning) {
      return;
    }
    spinning = false;
    spinBtn.classList.remove("is-on");
    spinBtn.removeAttribute("aria-pressed");
    spinBtn.textContent = "Slow spin";
  }

  function loop(now) {
    if (!last) {
      last = now;
    }
    var dt = Math.min(48, now - last) / 16.67;
    last = now;
    if (spinning && !dragging) {
      try_ += 0.16 * dt;
      ry = try_;
    } else {
      trx += (rx - trx) * Math.min(1, 0.14);
      try_ += (ry - try_) * Math.min(1, 0.14);
    }
    paint();
    if (now - stamp > 90) {
      stamp = now;
      mRead.textContent = spinning ? "SPIN" : dragging ? "HAND" : "HOLD";
    }
    requestAnimationFrame(loop);
  }

  stage.addEventListener("pointerdown", function (e) {
    if (e.target.closest("button")) {
      return;
    }
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener("pointermove", function (e) {
    if (!dragging) {
      return;
    }
    steer((e.clientX - lastX) * 0.5, -(e.clientY - lastY) * 0.5);
    lastX = e.clientX;
    lastY = e.clientY;
  });
  ["pointerup", "pointercancel"].forEach(function (t) {
    stage.addEventListener(t, function () {
      dragging = false;
    });
  });

  stage.addEventListener("keydown", function (e) {
    var k = e.key;
    if (k === "ArrowRight") {
      steer(9, 0);
      e.preventDefault();
    } else if (k === "ArrowLeft") {
      steer(-9, 0);
      e.preventDefault();
    } else if (k === "ArrowUp") {
      steer(0, -6);
      e.preventDefault();
    } else if (k === "ArrowDown") {
      steer(0, 6);
      e.preventDefault();
    } else if (k === "Home") {
      spinOff();
      rx = -16;
      ry = -24;
      trx = rx;
      try_ = ry;
      e.preventDefault();
    }
  });

  viewsBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      spinOff();
      rx = Number(b.dataset.rx);
      ry = Number(b.dataset.ry);
    });
  });

  spinBtn.addEventListener("click", function () {
    spinning = !spinning;
    if (spinning) {
      spinBtn.classList.add("is-on");
      spinBtn.setAttribute("aria-pressed", "true");
      spinBtn.textContent = "Slow spin";
    } else {
      spinBtn.classList.remove("is-on");
      spinBtn.removeAttribute("aria-pressed");
      spinBtn.textContent = "Resume spin";
    }
  });

  stage.addEventListener("click", function (e) {
    var b = e.target.closest(".face, .drift");
    if (!b) {
      return;
    }
    openViewer(Number(b.dataset.index));
  });

  var opened = -1;
  var restore = null;

  function openViewer(i) {
    opened = (i + PLATES.length) % PLATES.length;
    var p = PLATES[opened];
    var img = document.querySelector('[data-index="' + opened + '"] img');
    vImg.src = img.getAttribute("src");
    vImg.alt = p.alt;
    vCap.textContent = p.id + " \u00b7 " + p.name + " \u00b7 " + p.by + " \u00b7 " + p.lic;
    vCount.textContent = String(opened + 1).padStart(2, "0") + " / 0" + PLATES.length;
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
    if (restore && restore.focus) {
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
  if (!spinning) {
    spinBtn.classList.remove("is-on");
    spinBtn.removeAttribute("aria-pressed");
    spinBtn.textContent = "Resume spin";
  }
  if (!still.matches) {
    requestAnimationFrame(loop);
  }
})();
