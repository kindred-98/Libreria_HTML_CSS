(function () {
  "use strict";

  var calm = window.matchMedia("(prefers-reduced-motion: reduce)");
  var N = 9;
  var STEP = 360 / N;

  var ring = document.getElementById("ring");
  var inner = document.getElementById("inner");
  var meds = Array.prototype.slice.call(inner.querySelectorAll(".med"));
  var rows = Array.prototype.slice.call(document.querySelectorAll(".entries button"));
  var hubNo = document.getElementById("hubNo");
  var hubT = document.getElementById("hubT");
  var hubA = document.getElementById("hubA");
  var hubP = document.getElementById("hubP");
  var roDeg = document.getElementById("ro-deg");
  var roFront = document.getElementById("ro-front");
  var roMode = document.getElementById("ro-mode");
  var drift = document.getElementById("drift");
  var rates = Array.prototype.slice.call(document.querySelectorAll(".console__rate"));

  var lb = document.getElementById("lb");
  var lbImg = document.getElementById("lbImg");
  var lbNo = document.getElementById("lbNo");
  var lbT = document.getElementById("lbT");
  var lbA = document.getElementById("lbA");
  var lbP = document.getElementById("lbP");
  var lbX = document.getElementById("lbX");

  var angle = 0;
  var vel = 0.055;
  var rate = 1;
  var running = !calm.matches;
  var touched = false;
  var dragging = false;
  var grabX = 0;
  var grabA = 0;
  var front = -1;
  var opener = null;
  var raf = 0;

  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  function norm(d) {
    var a = ((d % 360) + 360) % 360;
    return a;
  }

  function place() {
    var box = ring.getBoundingClientRect();
    var r = Math.min(box.width, box.height) * 0.36;
    for (var i = 0; i < meds.length; i += 1) {
      var a = (i * STEP + angle) * Math.PI / 180;
      var depth = Math.cos(a);
      var x = Math.sin(a) * r;
      var y = Math.cos(a) * r;
      var s = 0.46 + 0.54 * depth;
      var el = meds[i];
      el.style.zIndex = String(100 + Math.round(depth * 100));
      el.style.opacity = (0.42 + 0.58 * Math.max(0, depth * 1.2)).toFixed(3);
      el.style.filter = "saturate(" + (0.55 + 0.45 * Math.max(0, depth)).toFixed(3) + ") brightness(" + (0.74 + 0.26 * Math.max(0, depth)).toFixed(3) + ")";
      el.style.transform = "translate(-50%,-50%) translate3d(" + x.toFixed(2) + "px," + y.toFixed(2) + "px,0) scale(" + s.toFixed(3) + ")";
    }
  }

  function readout() {
    roDeg.textContent = String(Math.round(norm(-angle))).padStart(3, "0");
  }

  function frontIndex() {
    var a = norm(-angle);
    return Math.round(a / STEP) % N;
  }

  function paint() {
    var i = frontIndex();
    if (i === front) { readout(); return; }
    front = i;
    var m = meds[i];
    var img = m.querySelector("img");
    hubNo.textContent = m.dataset.no || pad(i + 1);
    hubT.textContent = m.dataset.t;
    hubA.textContent = m.dataset.a + " \u00b7 " + m.dataset.l;
    hubP.setAttribute("href", m.dataset.p);
    roFront.textContent = pad(i + 1);
    rows.forEach(function (row, k) { row.classList.toggle("is-on", k === i); });
    meds.forEach(function (el, k) { el.classList.toggle("is-front", k === i); });
    lbImg.setAttribute("alt", img.getAttribute("alt"));
    readout();
  }

  function turn(deg) {
    angle += deg;
    place();
    paint();
  }

  function spin(now) {
    raf = requestAnimationFrame(spin);
    if (!running || dragging) { return; }
    var dt = Math.min(48, now - (spin.last || now));
    spin.last = now;
    turn(vel * dt * rate);
  }

  function setRunning(on) {
    running = on && !calm.matches;
    drift.classList.toggle("is-on", running);
    drift.setAttribute("aria-pressed", running ? "true" : "false");
    drift.textContent = running ? "Hold ring" : "Turn ring";
    roMode.textContent = running ? "DRIFT" : "HELD";
  }

  drift.addEventListener("click", function () { setRunning(!running); });

  rates.forEach(function (btn) {
    btn.addEventListener("click", function () {
      rate = Number(btn.dataset.rate);
      rates.forEach(function (b) {
        b.classList.toggle("is-on", b === btn);
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      });
    });
  });

  ring.addEventListener("pointerenter", function () { roMode.textContent = "OVER"; });
  ring.addEventListener("pointerleave", function () { roMode.textContent = running ? "DRIFT" : "HELD"; });
  ring.addEventListener("focus", function () { roMode.textContent = running ? "DRIFT" : "HELD"; });

  ring.addEventListener("pointerdown", function (ev) {
    dragging = true;
    grabX = ev.clientX;
    grabA = angle;
    ring.setPointerCapture(ev.pointerId);
  });

  ring.addEventListener("pointermove", function (ev) {
    if (!dragging) { return; }
    angle = grabA - (ev.clientX - grabX) * 0.42;
    place();
    paint();
  });

  ring.addEventListener("pointerup", function () { dragging = false; touched = true; });
  ring.addEventListener("pointercancel", function () { dragging = false; });

  inner.addEventListener("click", function (ev) {
    var med = ev.target.closest(".med");
    if (!med || !touched) { return; }
    openAt(Number(med.dataset.i), med);
  });

  rows.forEach(function (row) {
    row.addEventListener("click", function () {
      var i = Number(row.dataset.i);
      turn(STEP * (i - frontIndex()));
      touched = true;
    });
  });

  function openAt(i, from) {
    var m = meds[i];
    var img = m.querySelector("img");
    opener = from || null;
    lbImg.setAttribute("src", img.getAttribute("src"));
    lbImg.setAttribute("alt", img.getAttribute("alt"));
    lbNo.textContent = pad(i + 1) + " / " + pad(N);
    lbT.textContent = m.dataset.t;
    lbA.textContent = m.dataset.a + " \u00b7 " + m.dataset.l;
    lbP.setAttribute("href", m.dataset.p);
    lb.hidden = false;
    requestAnimationFrame(function () { lb.classList.add("is-open"); });
    lbX.focus();
  }

  function openFront() {
    openAt(frontIndex(), null);
  }

  function close() {
    lb.classList.remove("is-open");
    var seal = function () { lb.hidden = true; };
    if (calm.matches) { seal(); } else { setTimeout(seal, 280); }
    if (opener && document.contains(opener)) { opener.focus(); }
    opener = null;
  }

  function ringBox() {
    return Array.prototype.slice.call(
      lb.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])')
    ).filter(function (el) { return el.offsetParent !== null; });
  }

  document.getElementById("lbPrev").addEventListener("click", function () {
    openAt(frontIndex() - 1, null);
  });
  document.getElementById("lbNext").addEventListener("click", function () {
    openAt(frontIndex() + 1, null);
  });
  lbX.addEventListener("click", close);
  lb.querySelector(".lb__veil").addEventListener("click", close);

  document.addEventListener("keydown", function (ev) {
    if (!lb.hidden) {
      if (ev.key === "Escape") { ev.preventDefault(); close(); return; }
      if (ev.key === "Tab") {
        var box = ringBox();
        if (!box.length) { return; }
        var pos = box.indexOf(document.activeElement);
        var nxt = ev.shiftKey ? pos - 1 : pos + 1;
        if (nxt < 0 || nxt >= box.length) {
          ev.preventDefault();
          box[(nxt + box.length) % box.length].focus();
        }
        return;
      }
      if (ev.key === "ArrowRight") { ev.preventDefault(); openAt(frontIndex() + 1, null); }
      else if (ev.key === "ArrowLeft") { ev.preventDefault(); openAt(frontIndex() - 1, null); }
      else if (ev.key === "Home") { ev.preventDefault(); openAt(0, null); }
      else if (ev.key === "End") { ev.preventDefault(); openAt(N - 1, null); }
      return;
    }

    if (document.activeElement !== ring) { return; }
    if (ev.key === "ArrowRight") { ev.preventDefault(); setRunning(false); turn(STEP); }
    else if (ev.key === "ArrowLeft") { ev.preventDefault(); setRunning(false); turn(-STEP); }
    else if (ev.key === "PageDown") { ev.preventDefault(); setRunning(false); turn(STEP * 2); }
    else if (ev.key === "PageUp") { ev.preventDefault(); setRunning(false); turn(-STEP * 2); }
    else if (ev.key === "Home") { ev.preventDefault(); setRunning(false); turn(STEP * (-frontIndex())); }
    else if (ev.key === "End") { ev.preventDefault(); setRunning(false); turn(STEP * (N - 1 - frontIndex())); }
    else if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); openFront(); }
  });

  window.addEventListener("resize", function () { place(); paint(); });

  setRunning(!calm.matches);
  place();
  paint();
  if (!calm.matches) { raf = requestAnimationFrame(spin); }
  window.addEventListener("pagehide", function () { cancelAnimationFrame(raf); });
}());
