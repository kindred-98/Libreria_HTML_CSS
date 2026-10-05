(function () {
  "use strict";

  var loop = document.getElementById("loop");
  var track = document.getElementById("track");
  var set = document.getElementById("set");
  var lcdV = document.getElementById("lcdV");
  var lcdS = document.getElementById("lcdS");
  var chainBar = document.getElementById("chainBar");
  var chainMode = document.getElementById("chainMode");

  if (!loop || !track || !set) {
    return;
  }

  var COUNT = 10;
  var DUR = 9;
  var still = false;
  try {
    still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {}

  var cells = set.querySelectorAll(".cell");

  var CELL = 54;
  var MID = 39;
  var H = CELL * COUNT;
  var seated = 3;
  var running = true;
  var phase = (seated * CELL) - MID;
  var watch = 0;
  var brakeTimer = 0;
  var restTimer = 0;

  function cellHeight() {
    var h = set.getBoundingClientRect().height;
    if (h > 4) {
      CELL = h / COUNT;
    }
    var win = loop.getBoundingClientRect().height;
    if (win > 4) {
      MID = (win - CELL) / 2;
    }
    H = CELL * COUNT;
    track.style.setProperty("--h", H.toFixed(2));
  }

  function clone() {
    for (var n = 0; n < 2; n += 1) {
      var copy = set.cloneNode(true);
      copy.classList.add("loop__set--clone");
      copy.setAttribute("aria-hidden", "true");
      copy.removeAttribute("id");
      var inner = copy.querySelectorAll(".cell");
      for (var cell of inner) {
        cell.removeAttribute("role");
        cell.removeAttribute("id");
        cell.removeAttribute("aria-selected");
      }
      track.appendChild(copy);
    }
  }

  function phaseNow() {
    var loopTop = loop.getBoundingClientRect().top;
    var trackTop = track.getBoundingClientRect().top;
    var raw = -(trackTop - loopTop);
    if (!isFinite(raw)) {
      return phase;
    }
    return ((raw % H) + H) % H;
  }

  function lit(index) {
    for (var k = 0; k < cells.length; k += 1) {
      cells[k].classList.toggle("is-lit", k === index);
    }
  }

  function markSeated(index) {
    for (var k = 0; k < cells.length; k += 1) {
      var on = k === index;
      cells[k].classList.toggle("is-seated", on);
      cells[k].setAttribute("aria-selected", on ? "true" : "false");
    }
  }

  function describe(index) {
    var cell = cells[index];
    if (!cell) {
      return { value: "", unit: "", name: "", klass: "" };
    }
    var b = cell.querySelector(".cell__body b");
    var s = cell.querySelector(".cell__body s");
    var text = b ? b.textContent : "";
    var cut = text.lastIndexOf(" ");
    var unit = cut > 0 ? text.slice(cut + 1) : "";
    var head = cut > 0 ? text.slice(0, cut) : text;
    var split = head.lastIndexOf(" ");
    var value = split > 0 ? head.slice(split + 1) : head;
    var tag = split > 0 ? head.slice(0, split) : "";
    var klass = "";
    if (s) {
      var chunk = s.textContent.split("/");
      klass = chunk[0].trim();
    }
    return { value: value, unit: unit, tag: tag, name: text, klass: klass };
  }

  function readOut(index) {
    var info = describe(index);
    var unitEl = lcdV ? lcdV.querySelector("i") : null;
    if (lcdV) {
      if (lcdV.firstChild && lcdV.firstChild.nodeType === 3) {
        lcdV.firstChild.nodeValue = info.value;
      } else {
        lcdV.textContent = info.value;
      }
    }
    if (unitEl) {
      unitEl.textContent = info.unit;
    }
    if (lcdS) {
      var n = index + 1;
      var num = n < 10 ? "0" + n : String(n);
      lcdS.textContent = "cell " + num + " of 10 / " + (info.tag ? info.tag + " cell" : info.klass);
    }
  }

  function setSpeed(scale, label, color) {
    if (chainBar) {
      chainBar.style.setProperty("--s", scale.toFixed(3));
    }
    if (chainMode) {
      chainMode.textContent = label;
      chainMode.style.color = color;
    }
  }

  function run() {
    if (still) {
      running = false;
      setSpeed(0, "parked", "#6c767d");
      return;
    }
    running = true;
    track.style.transition = "none";
    track.style.transform = "none";
    track.style.animation = "none";
    track.getBoundingClientRect();
    track.style.animation = "chain " + DUR + "s linear " + (-(phase / H) * DUR).toFixed(3) + "s infinite";
    setSpeed(1, "coasting", "#1aa862");
    window.clearTimeout(restTimer);
  }

  function halt() {
    running = false;
    track.style.animationPlayState = "paused";
    setSpeed(0, "held", "#ffb648");
  }

  function follow() {
    if (!running) {
      return;
    }
    var now = phaseNow();
    if (Math.abs(now - phase) > 1) {
      phase = now;
      var near = Math.round((now + MID) / CELL);
      lit(((near % COUNT) + COUNT) % COUNT);
    }
  }

  function brake(index) {
    if (still) {
      seated = index;
      phase = index * CELL - MID;
      track.style.transform = "translate3d(0," + (-phase).toFixed(2) + "px,0)";
      markSeated(index);
      lit(index);
      readOut(index);
      loop.setAttribute("aria-activedescendant", cells[index].id);
      setSpeed(0, "parked", "#6c767d");
      return;
    }

    var now = phaseNow();
    phase = now;
    running = false;
    window.clearTimeout(restTimer);
    window.clearTimeout(brakeTimer);
    if (watch) {
      window.clearInterval(watch);
      watch = 0;
    }

    var target = index * CELL - MID;
    while (target < now + CELL * 0.6) {
      target += H;
    }

    var dist = target - now;
    var over = Math.min(CELL * 0.22, 14 + dist * 0.03);
    var d1 = Math.min(760, 240 + dist * 0.52);
    var d2 = 200;

    setSpeed(Math.max(0.12, 1 - dist / 1400), "braking", "#ffb648");

    track.style.animationPlayState = "paused";
    track.style.transition = "none";
    track.style.transform = "translate3d(0," + (-now).toFixed(2) + "px,0)";
    track.getBoundingClientRect();
    track.style.transition = "transform " + d1 + "ms cubic-bezier(.24,.72,.3,1)";
    track.style.transform = "translate3d(0," + (-(target + over)).toFixed(2) + "px,0)";

    watch = window.setInterval(follow, 40);

    brakeTimer = window.setTimeout(function () {
      if (watch) {
        window.clearInterval(watch);
        watch = 0;
      }
      track.style.transition = "transform " + d2 + "ms cubic-bezier(.2,1.6,.42,1)";
      track.style.transform = "translate3d(0," + (-target).toFixed(2) + "px,0)";
      setSpeed(0, "seated", "#7dffb0");
    }, d1);

    window.setTimeout(function () {
      phase = ((target % H) + H) % H;
      seated = index;
      markSeated(index);
      lit(index);
      readOut(index);
      loop.setAttribute("aria-activedescendant", cells[index].id);
      restTimer = window.setTimeout(run, 3400);
    }, d1 + d2);
  }

  function step(delta) {
    var next = seated + delta;
    if (next < 0) {
      next = COUNT - 1;
    }
    if (next > COUNT - 1) {
      next = 0;
    }
    brake(next);
  }

  function nearestToTarget() {
    var now = phaseNow();
    var near = Math.round((now + MID) / CELL);
    return ((near % COUNT) + COUNT) % COUNT;
  }

  loop.addEventListener("click", function (event) {
    var node = event.target;
    while (node && node !== loop) {
      if (node.classList && node.classList.contains("cell")) {
        var idx = Number(node.dataset.i);
        brake(((idx % COUNT) + COUNT) % COUNT);
        return;
      }
      node = node.parentNode;
    }
    if (!running) {
      run();
    }
  });

  loop.addEventListener("keydown", function (event) {
    var key = event.key;
    if (key === "ArrowDown" || key === "ArrowRight") {
      event.preventDefault();
      step(1);
    } else if (key === "ArrowUp" || key === "ArrowLeft") {
      event.preventDefault();
      step(-1);
    } else if (key === "PageDown") {
      event.preventDefault();
      step(3);
    } else if (key === "PageUp") {
      event.preventDefault();
      step(-3);
    } else if (key === "Home") {
      event.preventDefault();
      brake(0);
    } else if (key === "End") {
      event.preventDefault();
      brake(COUNT - 1);
    } else if (key === " " || key === "Enter") {
      event.preventDefault();
      if (running) {
        halt();
      } else {
        if (phase === 0) {
          var near = nearestToTarget();
          markSeated(near);
          readOut(near);
        }
        run();
      }
    }
  });

  window.addEventListener("resize", function () {
    cellHeight();
    if (!running) {
      phase = seated * CELL - MID;
      track.style.transform = "translate3d(0," + (-phase).toFixed(2) + "px,0)";
    }
  });

  clone();
  cellHeight();
  markSeated(seated);
  lit(seated);
  readOut(seated);
  if (!still) {
    phase = (seated * CELL) - MID;
    run();
  }
})();
