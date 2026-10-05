(function () {
  "use strict";

  var stage = document.getElementById("stage");
  var grip = document.getElementById("grip");
  var figW = document.getElementById("figW");
  var readV = document.getElementById("readV");
  var readS = document.getElementById("readS");
  var status = document.getElementById("status");
  var gaugeFill = document.getElementById("gaugeFill");
  var gaugeMark = document.getElementById("gaugeMark");

  if (!stage || !grip) {
    return;
  }

  var MIN = 320;
  var MAX = 720;
  var STEP = 2;
  var DETENT = 10;
  var PAGE = 40;
  var HALF_RAIL = 11;

  var still = false;
  try {
    still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {}

  var value = 512;
  var span = 240;
  var dragging = false;
  var dragFrom = 0;
  var dragStart = 512;

  function clamp(raw) {
    var v = Math.round(raw / STEP) * STEP;
    if (v < MIN) {
      v = MIN;
    }
    if (v > MAX) {
      v = MAX;
    }
    return v;
  }

  function detentState(v) {
    var near = Math.round(v / DETENT) * DETENT;
    if (Math.abs(v - near) <= (DETENT - STEP)) {
      return { seated: true, near: near };
    }
    var low = Math.floor(v / DETENT) * DETENT;
    return { seated: false, near: low, high: low + DETENT };
  }

  function seat(raw) {
    var v = clamp(raw);
    var state = detentState(v);
    if (state.seated) {
      v = state.near;
    }
    return v;
  }

  function paint(v, announce) {
    var ratio = (v - MIN) / (MAX - MIN);
    var width = stage.clientWidth;
    var edge = ratio * width - HALF_RAIL;

    stage.style.setProperty("--r", ratio.toFixed(4));
    stage.style.setProperty("--edge", edge.toFixed(1) + "px");
    stage.style.setProperty("--span", span.toFixed(1) + "px");

    if (gaugeFill) {
      gaugeFill.style.setProperty("--r", ratio.toFixed(4));
    }
    if (gaugeMark) {
      gaugeMark.style.setProperty("--r", ratio.toFixed(4));
      gaugeMark.style.setProperty("--span", span.toFixed(1) + "px");
    }

    var state = detentState(v);
    var text = v.toFixed(1);
    var sub = state.seated
      ? "seated on detent " + state.near
      : "free between " + state.near + " and " + state.high;

    if (figW) {
      figW.textContent = text + " mm";
    }
    if (readV) {
      if (readV.firstChild && readV.firstChild.nodeType === 3) {
        readV.firstChild.nodeValue = text;
      } else {
        readV.textContent = text;
      }
    }
    if (readS) {
      readS.textContent = sub;
    }

    grip.setAttribute("aria-valuenow", String(v));
    grip.setAttribute("aria-valuetext", text + " millimetres, " + sub);

    if (announce && status) {
      status.textContent = "Panel width " + text + " millimetres, " + sub + ".";
    }

    value = v;
  }

  function measure() {
    var bar = document.querySelector(".gauge__bar");
    if (bar && bar.clientWidth > 0) {
      span = bar.clientWidth;
    }
    paint(value, false);
  }

  grip.addEventListener("keydown", function (event) {
    var key = event.key;
    var next = null;

    if (key === "ArrowRight" || key === "ArrowUp") {
      next = value + STEP;
    } else if (key === "ArrowLeft" || key === "ArrowDown") {
      next = value - STEP;
    } else if (key === "PageUp") {
      next = value + PAGE;
    } else if (key === "PageDown") {
      next = value - PAGE;
    } else if (key === "Home") {
      next = MIN;
    } else if (key === "End") {
      next = MAX;
    } else if (key === " " || key === "Enter") {
      event.preventDefault();
      paint(seat(value), true);
      return;
    } else {
      return;
    }

    event.preventDefault();
    paint(clamp(next), true);
  });

  grip.addEventListener("pointerdown", function (event) {
    if (event.button !== undefined && event.button !== 0) {
      return;
    }
    dragging = true;
    dragStart = value;
    dragFrom = event.clientX;
    stage.classList.add("is-dragging");
    if (grip.setPointerCapture) {
      try {
        grip.setPointerCapture(event.pointerId);
      } catch {}
    }
    event.preventDefault();
  });

  grip.addEventListener("pointermove", function (event) {
    if (!dragging) {
      return;
    }
    var width = stage.clientWidth || 1;
    var mmPerPx = (MAX - MIN) / width;
    paint(dragStart + (event.clientX - dragFrom) * mmPerPx, false);
  });

  function endDrag(event) {
    if (!dragging) {
      return;
    }
    dragging = false;
    stage.classList.remove("is-dragging");
    if (event && event.pointerId !== undefined && grip.releasePointerCapture) {
      try {
        grip.releasePointerCapture(event.pointerId);
      } catch {}
    }
    paint(seat(value), true);
  }

  grip.addEventListener("pointerup", endDrag);
  grip.addEventListener("pointercancel", endDrag);
  window.addEventListener("blur", function () {
    endDrag();
  });
  window.addEventListener("resize", measure);

  measure();
})();
