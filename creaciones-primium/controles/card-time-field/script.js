(function () {
  "use strict";

  var input = document.getElementById("appt");
  var field = document.getElementById("field");
  var drumset = document.getElementById("drumset");
  var drumHour = document.getElementById("drumHour");
  var drumMinute = document.getElementById("drumMinute");
  var readout = document.getElementById("readout");
  var status = document.getElementById("status");
  var stamp = document.getElementById("stamp");
  var card = document.getElementById("card");
  var clock = document.getElementById("clock");

  if (!input || !field || !drumHour || !drumMinute) {
    return;
  }

  var PARTS = {
    hour: { count: 24, drum: drumHour },
    minute: { count: 60, drum: drumMinute }
  };

  var still = false;
  try {
    still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {}

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function buildDrum(strip, count) {
    strip.textContent = "";
    for (var i = 0; i < count; i += 1) {
      var cell = document.createElement("span");
      cell.textContent = pad(i);
      strip.appendChild(cell);
    }
  }

  function read() {
    var parts = String(input.value || "00:00").split(":");
    var h = parseInt(parts[0], 10);
    var m = parseInt(parts[1], 10);
    if (!isFinite(h) || h < 0) {
      h = 0;
    }
    if (!isFinite(m) || m < 0) {
      m = 0;
    }
    return { h: Math.min(23, h), m: Math.min(59, m) };
  }

  function write(h, m) {
    input.value = pad(h) + ":" + pad(m);
  }

  function drumHeight(drum) {
    var value = Number.parseFloat(getComputedStyle(drum).height);
    return isFinite(value) && value > 4 ? value : 40;
  }

  function spin(part, index) {
    var strip = PARTS[part].drum;
    var drum = strip.parentNode;
    var prev = parseInt(strip.style.getPropertyValue("--i"), 10);
    var steps = isFinite(prev) ? Math.abs(index - prev) : 1;
    strip.style.transitionDuration = still ? "0ms" : Math.min(760, 250 + steps * 34) + "ms";
    strip.style.setProperty("--i", String(index));
    if (still) {
      return;
    }
    drum.classList.remove("is-turn");
    drum.getBoundingClientRect();
    drum.classList.add("is-turn");
    window.setTimeout(function () {
      drum.classList.remove("is-turn");
    }, 430);
  }

  function paint() {
    var t = read();
    spin("hour", t.h);
    spin("minute", t.m);

    if (clock) {
      clock.style.setProperty("--ah", (t.h % 12) * 30 + t.m * 0.5 + "deg");
      clock.style.setProperty("--am", t.m * 6 + "deg");
    }

    var end = t.m + 90;
    var endH = (t.h + Math.floor(end / 60)) % 24;
    end = end % 60;

    if (readout) {
      readout.textContent = pad(t.h) + ":" + pad(t.m) + " to " + pad(endH) + ":" + pad(end) + " / 90 min block";
    }
    if (status) {
      status.textContent = "Session start " + pad(t.h) + " hours " + pad(t.m) + ", Lisbon, UTC plus 2.";
    }
  }

  function shift(dh, dm) {
    var t = read();
    var total = t.h * 60 + t.m + dh * 60 + dm;
    if (total < 0) {
      total += 24 * 60;
    }
    if (total > 24 * 60 - 1) {
      total -= 24 * 60;
    }
    write(Math.floor(total / 60), total % 60);
    paint();
  }

  function snapQuarter() {
    var t = read();
    var total = t.h * 60 + t.m;
    var q = Math.round(total / 15) * 15;
    if (q >= 24 * 60) {
      q -= 24 * 60;
    }
    write(Math.floor(q / 60), q % 60);
    paint();
    if (status) {
      status.textContent = "Snapped to the quarter hour, " + pad(Math.floor(q / 60)) + ":" + pad(q % 60) + ".";
    }
  }

  function confirmCard() {
    if (stamp) {
      stamp.classList.remove("is-on");
      stamp.getBoundingClientRect();
      stamp.classList.add("is-on");
    }
    var t = read();
    if (status) {
      status.textContent = "Card confirmed for " + pad(t.h) + ":" + pad(t.m) + ".";
    }
  }

  buildDrum(drumHour, PARTS.hour.count);
  buildDrum(drumMinute, PARTS.minute.count);
  field.classList.add("is-live");
  paint();

  input.addEventListener("input", paint);
  input.addEventListener("change", paint);

  input.addEventListener("keydown", function (event) {
    var key = event.key;
    if (key === "ArrowUp") {
      event.preventDefault();
      shift(1, 0);
    } else if (key === "ArrowDown") {
      event.preventDefault();
      shift(-1, 0);
    } else if (key === "ArrowRight") {
      event.preventDefault();
      shift(0, 1);
    } else if (key === "ArrowLeft") {
      event.preventDefault();
      shift(0, -1);
    } else if (key === "PageUp") {
      event.preventDefault();
      shift(0, 10);
    } else if (key === "PageDown") {
      event.preventDefault();
      shift(0, -10);
    } else if (key === "Home") {
      event.preventDefault();
      write(0, 0);
      paint();
    } else if (key === "End") {
      event.preventDefault();
      write(23, 59);
      paint();
    } else if (key === " " || key === "Spacebar" || key === "Enter") {
      event.preventDefault();
      if (key === "Enter") {
        confirmCard();
      } else {
        snapQuarter();
      }
    }
  });

  function drumFromEvent(event) {
    var target = event.target;
    while (target && target !== drumset) {
      if (target.classList && target.classList.contains("drum")) {
        return target;
      }
      target = target.parentNode;
    }
    return null;
  }

  var drag = null;

  if (drumset) {
    drumset.addEventListener("pointerdown", function (event) {
      var drum = drumFromEvent(event);
      if (!drum) {
        return;
      }
      var part = drum.dataset.part;
      if (!PARTS[part]) {
        return;
      }
      event.preventDefault();
      input.focus({ preventScroll: true });
      var t = read();
      drag = {
        part: part,
        startY: event.clientY,
        start: part === "hour" ? t.h : t.m,
        height: drumHeight(drum)
      };
      field.classList.add("is-dragging");
      if (typeof drum.setPointerCapture === "function") {
        try {
          drum.setPointerCapture(event.pointerId);
        } catch {}
      }
    });

    drumset.addEventListener("pointermove", function (event) {
      if (!drag) {
        return;
      }
      event.preventDefault();
      var count = PARTS[drag.part].count;
      var steps = Math.round((drag.startY - event.clientY) / drag.height);
      var next = drag.start + steps;
      if (next < 0) {
        next += count;
      }
      if (next > count - 1) {
        next -= count;
      }
      if (drag.part === "hour") {
        write(next, read().m);
      } else {
        write(read().h, next);
      }
      paint();
    });

    function release(event) {
      if (!drag) {
        return;
      }
      drag = null;
      field.classList.remove("is-dragging");
      if (event && typeof event.target.releasePointerCapture === "function") {
        try {
          event.target.releasePointerCapture(event.pointerId);
        } catch {}
      }
      if (status) {
        var t = read();
        status.textContent = "Session start " + pad(t.h) + " hours " + pad(t.m) + ", Lisbon, UTC plus 2.";
      }
    }

    drumset.addEventListener("pointerup", release);
    drumset.addEventListener("pointercancel", release);

    field.addEventListener("pointerdown", function (event) {
      if (drumFromEvent(event)) {
        return;
      }
      input.focus({ preventScroll: true });
    });
  }

  if (card) {
    card.addEventListener("pointerenter", function () {
      card.classList.add("is-tracking");
    });
    card.addEventListener("pointerleave", function () {
      card.classList.remove("is-tracking");
      card.style.removeProperty("--rx");
      card.style.removeProperty("--ry");
      card.style.removeProperty("--gx");
      card.style.removeProperty("--gy");
    });
    card.addEventListener("pointermove", function (event) {
      if (!card.classList.contains("is-tracking")) {
        return;
      }
      var box = card.getBoundingClientRect();
      if (!box.width || !box.height) {
        return;
      }
      var gx = (event.clientX - box.left) / box.width;
      var gy = (event.clientY - box.top) / box.height;
      card.style.setProperty("--gx", gx.toFixed(3));
      card.style.setProperty("--gy", gy.toFixed(3));
      card.style.setProperty("--ry", ((gx - 0.5) * 7.5).toFixed(2) + "deg");
      card.style.setProperty("--rx", ((0.5 - gy) * 5.5).toFixed(2) + "deg");
    });
  }
})();
