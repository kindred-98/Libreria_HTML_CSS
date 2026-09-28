(function () {
  "use strict";

  var win = document.getElementById("window");
  var jogBox = document.getElementById("jog");
  var dial = document.getElementById("jogDial");
  var jogLayer = document.getElementById("beltJog");
  var seq = document.getElementById("seq");
  var runBtn = document.getElementById("run");
  var openBtn = document.getElementById("open");
  var gateName = document.getElementById("gateName");
  var gateNo = document.getElementById("gateNo");
  var rows = Array.prototype.slice.call(document.querySelectorAll(".log__row"));
  var originals = Array.prototype.slice.call(seq.querySelectorAll(".frame"));
  var count = originals.length;
  var viewer = document.getElementById("viewer");
  var vimg = document.getElementById("vimg");
  var vcap = document.getElementById("vcap");
  var vcount = document.getElementById("vcount");
  var running = true;
  var jog = 0;
  var angle = 0;
  var atGate = -1;
  var viewerOpen = false;
  var lastFocus = null;

  originals.forEach(function (f) {
    seq.appendChild(f.cloneNode(true));
  });

  function gateY() {
    return win.getBoundingClientRect().height * 0.38;
  }

  function applyJog() {
    jogLayer.style.transform = "translateY(" + (-jog) + "px)";
    dial.style.transform = "rotate(" + angle + "deg)";
  }

  function align(i) {
    var el = originals[((i % count) + count) % count];
    var w = win.getBoundingClientRect();
    var r = el.getBoundingClientRect();
    var delta = (r.top - w.top) + r.height / 2 - gateY();
    jog += delta;
    angle -= delta * 0.5;
    applyJog();
  }

  function titleOf(n) {
    return rows[n].childNodes[1].textContent.trim();
  }

  function show(i) {
    var f = originals[i];
    var img = f.querySelector("img");
    vimg.setAttribute("src", img.getAttribute("src"));
    vimg.setAttribute("alt", img.getAttribute("alt"));
    vcap.textContent = f.querySelector(".frame__edge").textContent;
    vcount.textContent = (i < 9 ? "0" : "") + (i + 1) + " / 0" + count;
  }

  function report() {
    var w = win.getBoundingClientRect();
    var gy = w.top + gateY();
    var best = 0;
    var bestD = Infinity;
    originals.forEach(function (f, n) {
      var r = f.getBoundingClientRect();
      var d = Math.abs((r.top + r.height / 2) - gy);
      if (d < bestD) { bestD = d; best = n; }
    });
    originals.forEach(function (f, n) { f.classList.toggle("is-gate", n === best); });
    rows.forEach(function (r, n) { r.classList.toggle("is-on", n === best); });
    gateName.textContent = titleOf(best);
    gateNo.textContent = (best < 9 ? "0" : "") + (best + 1) + " of 0" + count;
    if (best === atGate) return;
    atGate = best;
    if (viewerOpen) show(best);
  }

  function setRun(on) {
    running = on;
    seq.classList.toggle("is-held", !on);
    runBtn.setAttribute("aria-pressed", on ? "true" : "false");
    runBtn.textContent = on ? "Belt running" : "Belt held";
  }

  function step(d) {
    var i = (atGate + d) % count;
    if (i < 0) i += count;
    align(i);
    report();
  }

  function open(i) {
    lastFocus = document.activeElement;
    show(i);
    viewerOpen = true;
    viewer.removeAttribute("hidden");
    document.getElementById("vclose").focus();
  }

  function close() {
    viewerOpen = false;
    viewer.setAttribute("hidden", "");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  runBtn.addEventListener("click", function () { setRun(!running); });
  openBtn.addEventListener("click", function () { open(atGate < 0 ? 0 : atGate); });

  rows.forEach(function (r, n) {
    r.addEventListener("click", function () {
      align(n);
      report();
      jogBox.focus();
    });
  });

  var dragging = false;
  var wasRunning = true;
  var lastY = 0;

  jogBox.addEventListener("pointerdown", function (e) {
    dragging = true;
    wasRunning = running;
    lastY = e.clientY;
    setRun(false);
    jogBox.setPointerCapture(e.pointerId);
    jogBox.focus();
  });

  jogBox.addEventListener("pointermove", function (e) {
    if (!dragging) return;
    var dy = e.clientY - lastY;
    lastY = e.clientY;
    jog += dy * 2.4;
    angle += dy * 0.9;
    applyJog();
    report();
  });

  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    if (e.pointerId !== undefined) {
      try { jogBox.releasePointerCapture(e.pointerId); } catch (err) { /* pointer already released */ }
    }
    if (wasRunning) setRun(true);
  }

  jogBox.addEventListener("pointerup", endDrag);
  jogBox.addEventListener("pointercancel", endDrag);

  document.addEventListener("keydown", function (e) {
    if (viewerOpen) {
      if (e.key === "Escape") { e.preventDefault(); close(); }
      else if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); step(1); }
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); step(-1); }
      else if (e.key === "Home") { e.preventDefault(); align(0); report(); }
      else if (e.key === "End") { e.preventDefault(); align(count - 1); report(); }
      return;
    }
    if (e.target.closest && e.target.closest("button")) return;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); step(1); }
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); step(-1); }
    else if (e.key === "PageDown") { e.preventDefault(); step(3); }
    else if (e.key === "PageUp") { e.preventDefault(); step(3); }
    else if (e.key === "Home") { e.preventDefault(); align(0); report(); }
    else if (e.key === "End") { e.preventDefault(); align(count - 1); report(); }
    else if (e.key === "Enter") { e.preventDefault(); open(atGate < 0 ? 0 : atGate); }
    else if (e.key === " ") { e.preventDefault(); setRun(!running); }
  });

  document.getElementById("vprev").addEventListener("click", function () { step(-1); });
  document.getElementById("vnext").addEventListener("click", function () { step(1); });
  document.getElementById("vclose").addEventListener("click", close);
  Array.prototype.forEach.call(viewer.querySelectorAll("[data-close]"), function (el) {
    el.addEventListener("click", close);
  });

  var last = 0;
  function tick(t) {
    if (t - last > 110) {
      last = t;
      report();
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
  setRun(true);
  report();
})();
