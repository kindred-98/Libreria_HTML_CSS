(function () {
  "use strict";

  var sheet = document.getElementById("sheet");
  var key = document.getElementById("key");
  var stack = document.getElementById("stack");
  var figTravel = document.getElementById("figTravel");
  var plotMark = document.getElementById("plotMark");
  var roTravel = document.getElementById("roTravel");
  var roForce = document.getElementById("roForce");
  var roContact = document.getElementById("roContact");
  var roGap = document.getElementById("roGap");
  var roCycles = document.getElementById("roCycles");

  if (!sheet || !key || !stack) {
    return;
  }

  var LAYERS = 6;
  var TRAVEL_MM = 1.4;
  var GAP_MM = 0.9;
  var FORCE_N = 2.35;

  var PUSH = [7, 5.2, 4, 2.6, 0.6, 0];
  var BASE = [30, 76, 118, 160, 200, 244];
  var TRAVEL_PX = 7;

  var still = false;
  try {
    still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {}

  var layers = stack.querySelectorAll(".layer");
  var coil = stack.querySelector(".coil");
  var domeCap = stack.querySelector(".dome__cap");
  var domeDot = stack.querySelector(".dome__dot");
  var trav = stack.querySelector(".trav");
  var travDown = stack.querySelector(".trav__ref--down");
  var travDim = stack.querySelector(".trav__dim");
  var plot = stack.parentNode.querySelector(".plot");

  var down = false;
  var cycles = 0;
  var ramp = 0;

  function pad(n) {
    var s = String(n);
    while (s.length < 4) {
      s = "0" + s;
    }
    return s;
  }

  function render(p) {
    for (var k = 0; k < layers.length && k < LAYERS; k += 1) {
      var y = BASE[k] + PUSH[k] * p;
      layers[k].style.transform = "translate3d(0," + y.toFixed(2) + "px,0)";
    }

    if (coil) {
      coil.style.transform = "scaleY(" + (1 - 0.42 * p).toFixed(3) + ")";
    }
    if (domeCap) {
      domeCap.style.transform = "scaleY(" + (1 - 0.5 * p).toFixed(3) + ")";
    }
    if (domeDot) {
      domeDot.style.transform = "scaleY(" + (1 - 0.78 * p).toFixed(3) + ")";
    }

    var mm = p * TRAVEL_MM;
    var ty = p * TRAVEL_PX;

    if (trav) {
      trav.style.setProperty("--ty", ty.toFixed(2) + "px");
      trav.style.setProperty("--t", p.toFixed(3));
    }
    if (travDown) {
      travDown.style.transform = "translate3d(0," + ty.toFixed(2) + "px,0)";
    }
    if (travDim) {
      travDim.style.transform = "scaleY(" + p.toFixed(3) + ")";
    }

    if (plotMark) {
      var box = plot ? plot.clientWidth : 0;
      if (box > 4) {
        var px = box * 0.34 * p;
        var py = box * (1 - 0.8 * p);
        plotMark.style.transform = "translate3d(" + px.toFixed(2) + "px," + py.toFixed(2) + "px,0)";
      }
    }

    var txt = mm.toFixed(2);
    if (figTravel) {
      figTravel.textContent = txt + " mm";
    }
    if (roTravel) {
      roTravel.textContent = txt;
    }
    if (roForce) {
      roForce.textContent = (p * FORCE_N).toFixed(2);
    }
    if (roContact) {
      roContact.textContent = p > 0.55 ? "closed" : "open";
    }
    if (roGap) {
      roGap.textContent = (GAP_MM * (1 - p)).toFixed(2) + " mm";
    }
  }

  function settle() {
    sheet.classList.remove("is-ramping", "is-down");
    render(0);
  }

  function startRamp() {
    if (ramp) {
      window.clearInterval(ramp);
      ramp = 0;
    }
    if (still) {
      sheet.classList.remove("is-ramping");
      render(1);
      return;
    }
    sheet.classList.add("is-ramping", "is-down");
    var t0 = Date.now();
    var span = 130;
    ramp = window.setInterval(function () {
      var k = (Date.now() - t0) / span;
      if (k >= 1) {
        window.clearInterval(ramp);
        ramp = 0;
        sheet.classList.remove("is-ramping");
        render(1);
        return;
      }
      var e = 1 - Math.pow(1 - k, 3);
      render(e);
    }, 16);
  }

  function release() {
    if (!down) {
      return;
    }
    down = false;
    key.setAttribute("aria-pressed", "false");
    if (ramp) {
      window.clearInterval(ramp);
      ramp = 0;
    }
    sheet.classList.remove("is-ramping");
    sheet.classList.remove("is-down");
    cycles += 1;
    if (roCycles) {
      roCycles.textContent = pad(cycles);
    }
    render(0);
  }

  function pressDown() {
    if (down) {
      return;
    }
    down = true;
    key.setAttribute("aria-pressed", "true");
    startRamp();
  }

  key.addEventListener("pointerdown", function (event) {
    if (event.button !== undefined && event.button !== 0) {
      return;
    }
    pressDown();
    if (key.setPointerCapture) {
      try {
        key.setPointerCapture(event.pointerId);
      } catch {}
    }
    event.preventDefault();
  });

  key.addEventListener("pointerup", release);
  key.addEventListener("pointercancel", release);
  key.addEventListener("pointerleave", release);
  key.addEventListener("blur", release);

  key.addEventListener("keydown", function (event) {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      pressDown();
    }
  });

  key.addEventListener("keyup", function (event) {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      release();
    }
  });

  key.addEventListener("contextmenu", function (event) {
    event.preventDefault();
  });

  window.addEventListener("blur", function () {
    release();
    settle();
  });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      release();
      settle();
    }
  });

  render(0);
})();
