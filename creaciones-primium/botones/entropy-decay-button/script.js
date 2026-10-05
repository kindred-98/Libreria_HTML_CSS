(function () {
  "use strict";
  var REDUCE = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var CYCLE = 6.2;
  var plates = [];

  function rnd(a, b) { return a + Math.random() * (b - a); }

  function el(cls, parent, span) {
    var n = document.createElement(span ? "span" : "i");
    n.className = cls;
    n.setAttribute("aria-hidden", "true");
    parent.appendChild(n);
    return n;
  }

  function build(b, read, tc) {
    el("en-grain", b);
    el("en-scar", b);
    el("en-bloom", b);

    var label = b.querySelector(".btn__label");
    var txt = label.textContent.trim();
    var stack = document.createElement("span");
    stack.className = "en-stack";
    stack.setAttribute("aria-hidden", "true");
    b.appendChild(stack);
    var cls = ["en-copy en-c1", "en-copy en-c2", "en-copy en-c3"];
    for (var i = 0; i < 3; i++) {
      var c = document.createElement("span");
      c.className = cls[i];
      c.textContent = txt;
      stack.appendChild(c);
    }

    var w = b.offsetWidth, h = b.offsetHeight;
    var n = w < 140 ? 5 : 8;
    for (i = 0; i < n; i++) {
      var f = el("en-flake" + (i % 3 === 0 ? " en-flake--v" : ""), b);
      f.style.left = (w / 2 + rnd(-0.32, 0.32) * w).toFixed(1) + "px";
      f.style.top = (h / 2 + rnd(-0.3, 0.3) * h).toFixed(1) + "px";
      f.style.setProperty("--fx", rnd(-30, 30).toFixed(1) + "px");
      f.style.setProperty("--fy", rnd(-34, -6).toFixed(1) + "px");
      f.style.setProperty("--fd", (-rnd(0, 2.6)).toFixed(2) + "s");
    }

    return { b: b, read: read, tc: tc, w: w, h: h, dead: b.hasAttribute("disabled") };
  }

  function spark(p) {
    var s = document.createElement("i");
    s.className = "en-flake";
    s.style.left = (p.w / 2 + rnd(-0.34, 0.34) * p.w).toFixed(1) + "px";
    s.style.top = (p.h / 2 + rnd(-0.3, 0.3) * p.h).toFixed(1) + "px";
    s.style.setProperty("--fx", rnd(-42, 42).toFixed(1) + "px");
    s.style.setProperty("--fy", rnd(-48, -10).toFixed(1) + "px");
    s.style.animationDuration = "1.1s";
    s.style.animationDelay = "0s";
    p.b.appendChild(s);
    setTimeout(function () { if (s.parentNode) s.remove(); }, 1250);
  }

  function warp(p) {
    if (p.dead) return;
    reversals++;
    if (ftN) ftN.textContent = reversals < 10 ? "0" + reversals : String(reversals);
    p.b.classList.add("is-decay");
    for (var i = 0; i < 7; i++) spark(p);
    clearTimeout(p.tid);
    p.tid = setTimeout(function () { p.b.classList.remove("is-decay"); }, 1320);
  }

  var reversals = 0;
  var ftS = document.getElementById("ft-s");
  var ftN = document.getElementById("ft-n");

  function clock(ph) {
    var s = "";
    var total = ph * CYCLE;
    var mm = Math.floor(total / 60);
    var ss = Math.floor(total % 60);
    var ff = Math.floor((total % 1) * 24);
    s += (mm < 10 ? "0" : "") + mm + ":";
    s += (ss < 10 ? "0" : "") + ss + ":";
    s += (ff < 10 ? "0" : "") + ff;
    return s;
  }

  function start() {
    var list = document.querySelectorAll(".btn");
    var reads = document.querySelectorAll(".btn__read");
    var tcs = document.querySelectorAll("[data-tc]");
    var i;
    for (i = 0; i < list.length; i++) {
      var p = build(list[i], reads[i] || null, tcs[i] || null);
      p.off = -i * (CYCLE / 4);
      plates.push(p);
      (function (self) {
        self.b.addEventListener("click", function () { warp(self); });
        self.b.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") warp(self);
        });
      })(p);
    }
    if (!plates.length) return;

    window.addEventListener("resize", function () {
      for (var q of plates) {
        q.w = q.b.offsetWidth;
        q.h = q.b.offsetHeight;
      }
    });

    setInterval(gauge, REDUCE ? 1200 : 90);
  }

  function gauge() {
    var base = (performance.now() / 1000) % CYCLE;
    var s0 = (0.99 * Math.abs(2 * (base / CYCLE) - 1)).toFixed(2);
    if (ftS) ftS.textContent = s0;
    for (var i = 0; i < plates.length; i++) {
      var p = plates[i];
      var ph = (base / CYCLE + i / 4) % 1;
      if (p.read) p.read.textContent = "S " + (0.99 * Math.abs(2 * ph - 1)).toFixed(2);
      if (p.tc) p.tc.textContent = clock(ph);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
