(function () {
  "use strict";

  var input = document.getElementById("pot");
  var dial = document.getElementById("dial");
  var notchRow = document.getElementById("notches");
  var pctOut = document.getElementById("pct");
  var voltsOut = document.getElementById("volts");
  var angleOut = document.getElementById("angle");
  var resOut = document.getElementById("res");
  var detentOut = document.getElementById("detent");
  var bar = document.getElementById("bar");
  var status = document.getElementById("status");

  if (!input || !dial || !notchRow) {
    return;
  }

  var DETENTS = 21;
  var SPAN = 280;
  var MINUS = "\u2212";
  var notches = [];
  var dragging = false;
  var snapTimer = 0;

  for (var d = 0; d < DETENTS; d += 1) {
    var mark = document.createElement("i");
    mark.className = "notch";
    mark.style.animationDelay = -(d % 7) * 0.22 + "s";
    notchRow.appendChild(mark);
    notches.push(mark);
  }

  function pad2(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function announce(text) {
    if (status) {
      status.textContent = text;
    }
  }

  function paint() {
    var raw = Number.parseInt(input.value, 10);
    if (!Number.isFinite(raw)) {
      raw = 0;
    }
    var ratio = Math.min(1, Math.max(0, raw / 1000));
    var pct = ratio * 100;
    var volts = ratio * 10;
    var degrees = ratio * SPAN - SPAN / 2;
    var index = Math.round(ratio * (DETENTS - 1));

    dial.style.setProperty("--v", ratio.toFixed(4));
    dial.style.setProperty("--sweep", (ratio * SPAN).toFixed(2) + "deg");

    if (pctOut) {
      pctOut.textContent = pct.toFixed(1);
    }
    if (voltsOut) {
      voltsOut.textContent = volts.toFixed(2) + " V";
    }
    if (angleOut) {
      angleOut.textContent = (degrees < 0 ? MINUS : "+") + Math.abs(degrees).toFixed(0) + " deg";
    }
    if (resOut) {
      resOut.textContent = (ratio * 10).toFixed(2) + " k";
    }
    if (detentOut) {
      detentOut.textContent = pad2(index + 1);
    }
    if (bar) {
      bar.style.transform = "scaleX(" + Math.max(0.004, ratio).toFixed(4) + ")";
    }

    for (var n = 0; n < notches.length; n += 1) {
      notches[n].classList.toggle("is-on", n === index);
      notches[n].classList.toggle("is-near", n !== index && Math.abs(n - index) === 1);
    }

    input.setAttribute(
      "aria-valuetext",
      pct.toFixed(1) + " per cent, " + volts.toFixed(2) + " volts, " +
        (degrees < 0 ? "minus " : "plus ") + Math.abs(degrees).toFixed(0) + " degrees from centre, detent " +
        (index + 1) + " of " + DETENTS
    );

    return { pct: pct, volts: volts, degrees: degrees, index: index };
  }

  function speak(info) {
    announce(
      "Trim at " + info.pct.toFixed(1) + " per cent, " + info.volts.toFixed(2) +
        " volts, detent " + (info.index + 1) + " of " + DETENTS + "."
    );
  }

  function click() {
    if (dragging) {
      return;
    }
    dial.classList.add("is-snap");
    window.clearTimeout(snapTimer);
    snapTimer = window.setTimeout(function () {
      dial.classList.remove("is-snap");
    }, 460);
  }

  function setValue(next) {
    var clamped = Math.min(1000, Math.max(0, Math.round(next)));
    if (clamped === Number.parseInt(input.value, 10)) {
      return;
    }
    input.value = String(clamped);
  }

  input.addEventListener("input", function () {
    var info = paint();
    speak(info);
  });

  input.addEventListener("pointerdown", function () {
    dragging = true;
    dial.classList.remove("is-snap");
  });

  window.addEventListener("pointerup", function () {
    if (dragging) {
      dragging = false;
      click();
    }
  });

  window.addEventListener("pointercancel", function () {
    dragging = false;
    dial.classList.remove("is-snap");
  });

  input.addEventListener("keydown", function (event) {
    var key = event.key;
    if (key === " " || key === "Spacebar") {
      event.preventDefault();
      var raw = Number.parseInt(input.value, 10) || 0;
      var step = 1000 / (DETENTS - 1);
      setValue(Math.round(raw / step) * step);
      click();
      speak(paint());
    } else if (key === "Enter") {
      event.preventDefault();
      setValue(500);
      click();
      speak(paint());
    } else if (key === "PageUp" || key === "PageDown" || key === "Home" || key === "End" ||
               key === "ArrowUp" || key === "ArrowDown" || key === "ArrowLeft" || key === "ArrowRight") {
      window.setTimeout(function () {
        click();
        speak(paint());
      }, 0);
    }
  });

  input.addEventListener("change", function () {
    click();
    speak(paint());
  });

  speak(paint());
})();
