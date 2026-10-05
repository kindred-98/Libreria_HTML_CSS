(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hud = document.getElementById("hud");
  var target = document.getElementById("target");
  var ring = document.getElementById("ring");
  var ring2 = document.getElementById("ring2");
  var ping = document.getElementById("ping");
  var tag = document.getElementById("tag");
  var flash = document.getElementById("flash");
  var status = document.getElementById("status");
  var mode = document.getElementById("mode");
  var clock = document.getElementById("clock");
  var dial = document.querySelector(".dial-face");
  var vGain = document.getElementById("vGain");
  var vRange = document.getElementById("vRange");
  var vBrg = document.getElementById("vBrg");
  var vEle = document.getElementById("vEle");
  var vDrf = document.getElementById("vDrf");
  var vVel = document.getElementById("vVel");
  var vSnr = document.getElementById("vSnr");
  var b1 = document.getElementById("b1");
  var b2 = document.getElementById("b2");
  var b3 = document.getElementById("b3");
  var b4 = document.getElementById("b4");
  var b5 = document.getElementById("b5");
  var toneBars = document.querySelectorAll(".tone em i");
  var brk = [
    document.getElementById("bk0"),
    document.getElementById("bk1"),
    document.getElementById("bk2"),
    document.getElementById("bk3")
  ];

  var T = 8400;
  var t0 = 0;
  var hw = 0;
  var hh = 0;
  var held = -1;
  var raf = 0;
  var lastTxt = -999;
  var isLock = false;
  var ease = function (x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  var clamp = function (x, a, b) {
    if (x < a) return a;
    if (x > b) return b;
    return x;
  };

  function measure() {
    var tr = target.getBoundingClientRect();
    hw = tr.width / 2;
    hh = tr.height / 2;
  }

  var seed = 4.13;
  function rnd() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  }

  var SX = [1842, 611, -1402, 2087, 431];
  var SB = [47.3, 112.8, 8.6, 291.4, 176.2];
  var SE = [-2.4, 11.8, -19.6, 4.2, 27.5];
  var SD = [-1.2, 0.6, 2.4, -3.1, 0.9];
  var SV = [212, 88, 341, 126, 274];
  var SS = [6.2, 14.8, 3.1, 21.6, 9.7];

  function frame() {
    var now = performance.now();
    if (!t0) t0 = now;
    var el = now - t0;
    var t = (el % T) / T;
    var k = Math.floor(el / 60) / 24;
    if (held > 0) {
      var ht = (now - held) / 1000;
      t = 0.42 + Math.min(0.44, ht * 0.62);
      if (ht > 0.8) t = 0.42 + (Math.sin(ht * 2.4) * 0.5 + 0.5) * 0.44;
    }

    var spread, lock = 0, sweepRot, statusTxt, gain, wob = 0;

    if (t < 0.2) {
      var u = t / 0.2;
      spread = 1.95 - u * 0.28;
      sweepRot = u * 220;
      statusTxt = "Searching";
      gain = 4 + u * 10;
      wob = Math.sin(el / 620) * 8;
    } else if (t < 0.4) {
      var u2 = (t - 0.2) / 0.2;
      spread = 1.67 - u2 * 0.52;
      sweepRot = 220 + Math.sin(u2 * Math.PI * 3) * 190;
      statusTxt = "Tracking";
      gain = 14 + u2 * 22;
      wob = Math.sin(el / 400) * 5;
    } else if (t < 0.56) {
      var u3 = (t - 0.4) / 0.16;
      var e3 = ease(u3);
      spread = 1.15 * (1 - e3) + 0.04 * Math.sin(u3 * 26) * (1 - u3);
      sweepRot = 0;
      statusTxt = "Acquiring";
      gain = 36 + e3 * 64;
      lock = e3;
    } else if (t < 0.86) {
      spread = 0.04 + Math.sin(el / 90) * 0.02;
      sweepRot = 0;
      statusTxt = "Lock";
      gain = 100;
      lock = 1;
    } else {
      var u5 = (t - 0.86) / 0.14;
      spread = 0.04 + ease(u5) * 1.9;
      sweepRot = 0;
      statusTxt = u5 < 0.3 ? "Breaking lock" : "Searching";
      gain = 100 * (1 - ease(u5));
      lock = 1 - ease(u5);
    }

    if (spread < 0) spread = 0;

    var pulse = 0;
    if (lock > 0.4) {
      pulse = Math.pow(Math.max(0, Math.sin((el % 720) / 720 * Math.PI * 2)), 7) * lock;
    }

    if (lock > 0.55) {
      if (!isLock) { isLock = true; hud.className = "hud is-lock"; }
    } else if (lock < 0.35) {
      if (isLock) { isLock = false; hud.className = "hud"; }
    }

    var pad = spread * Math.max(hw, hh) * 0.42;
    var ox = hw + pad + wob;
    var oy = hh + pad;
    brk[0].style.transform = "translate3d(" + (-ox).toFixed(1) + "px," + (-oy).toFixed(1) + "px,0)";
    brk[1].style.transform = "translate3d(" + ox.toFixed(1) + "px," + (-oy).toFixed(1) + "px,0)";
    brk[2].style.transform = "translate3d(" + ox.toFixed(1) + "px," + oy.toFixed(1) + "px,0)";
    brk[3].style.transform = "translate3d(" + (-ox).toFixed(1) + "px," + oy.toFixed(1) + "px,0)";

    var bo = 0.55 + 0.45 * clamp(1 - spread / 2.2, 0, 1);
    for (var i = 0; i < 4; i++) brk[i].style.opacity = (bo + pulse * 0.4).toFixed(3);

    ring.style.transform = "translate(-50%,-50%) rotate(" + sweepRot.toFixed(1) + "deg) scale(" + (1 + spread * 0.16).toFixed(4) + ")";
    ring.style.opacity = (0.85 - lock * 0.45).toFixed(3);
    ring2.style.transform = "translate(-50%,-50%) rotate(" + (-sweepRot * 1.6).toFixed(1) + "deg) scale(" + (1 + spread * 0.3).toFixed(4) + ")";
    ring2.style.opacity = (0.7 - lock * 0.3 + pulse * 0.3).toFixed(3);

    var ps = 1 + pulse * 1.4;
    ping.style.transform = "translate(-50%,-50%) scale(" + ps.toFixed(3) + ")";
    ping.style.opacity = (pulse * 0.5).toFixed(3);

    tag.style.opacity = (lock * 0.95).toFixed(3);
    tag.style.transform = "translate(-50%,-50%) scale(" + (0.86 + lock * 0.14 + pulse * 0.06).toFixed(3) + ")";
    flash.style.opacity = (pulse * 0.85).toFixed(3);

    dial.style.setProperty("--ga", (gain / 100).toFixed(3));
    vGain.textContent = String(Math.round(gain)).padStart(2, "0");

    for (var b = 0; b < 5; b++) {
      var lvl = clamp(gain / 100 + Math.sin(el / (140 + b * 37) + b) * 0.16, 0.05, 1);
      var h = (lvl * 100).toFixed(1) + "%";
      if (b === 0) b1.style.height = h;
      if (b === 1) b2.style.height = h;
      if (b === 2) b3.style.height = h;
      if (b === 3) b4.style.height = h;
      if (b === 4) b5.style.height = h;
    }

    for (var q = 0; q < toneBars.length; q++) {
      toneBars[q].style.opacity = (0.2 + pulse * (0.8 - q * 0.07)).toFixed(3);
      toneBars[q].style.height = (28 + pulse * (66 - q * 6)).toFixed(0) + "%";
    }

    if (el - lastTxt > 55) {
      lastTxt = el;
      var idx = Math.min(4, Math.floor(k) % 5);
      var conv = clamp(1 - spread / 2, 0, 1);
      var jr = (rnd() - 0.5) * (1 - conv) * 260;
      vRange.textContent = String(Math.round(SX[idx] + jr + (1 - conv) * 40)).padStart(4, "0");
      vBrg.textContent = (SB[idx] + (rnd() - 0.5) * (1 - conv) * 26).toFixed(1).padStart(5, "0");
      vEle.textContent = (SE[idx] >= 0 ? "+" : "") + SE[idx].toFixed(1);
      vDrf.textContent = (SD[idx] >= 0 ? "+" : "") + SD[idx].toFixed(2);
      vVel.textContent = String(Math.round(SV[idx] * (0.6 + conv * 0.4))).padStart(3, "0");
      vSnr.textContent = (SS[idx] * (0.4 + conv * 0.6) + pulse * 4).toFixed(1);
      status.textContent = statusTxt;
      mode.textContent = lock > 0.5 ? "MODE HARD" : "MODE AUTO";
      clock.textContent = "T " + (el / 1000).toFixed(2);
    }

    raf = window.requestAnimationFrame(frame);
  }

  function refresh() {
    measure();
    if (reduce) {
      brk[0].style.transform = "translate3d(" + (-(hw + 6)) + "px," + (-(hh + 6)) + "px,0)";
      brk[1].style.transform = "translate3d(" + (hw + 6) + "px," + (-(hh + 6)) + "px,0)";
      brk[2].style.transform = "translate3d(" + (hw + 6) + "px," + (hh + 6) + "px,0)";
      brk[3].style.transform = "translate3d(" + (-(hw + 6)) + "px," + (hh + 6) + "px,0)";
      var tg = document.getElementById("tag");
      tg.style.opacity = "1";
      hud.className = "hud is-lock";
      var nd = document.querySelector(".dial-face");
      nd.style.setProperty("--ga", "1");
      var vg = document.getElementById("vGain");
      vg.textContent = "100";
      document.getElementById("status").textContent = "Lock";
      document.getElementById("vRange").textContent = "1842";
      document.getElementById("vBrg").textContent = "047.3";
      document.getElementById("vEle").textContent = "-02.4";
      document.getElementById("vDrf").textContent = "-01.20";
      document.getElementById("vVel").textContent = "212";
      document.getElementById("vSnr").textContent = "26.4";
      for (var i = 1; i <= 5; i++) {
        var e = document.getElementById("b" + i);
        if (e) e.style.height = "100%";
      }
    }
  }

  target.addEventListener("pointerenter", function () {
    held = performance.now();
  });
  target.addEventListener("pointerleave", function () {
    held = -1;
  });
  target.addEventListener("click", function () {
    t0 = performance.now() - 0.5 * T;
  });

  window.addEventListener("resize", function () {
    measure();
  });

  if (reduce) {
    refresh();
    return;
  }

  measure();
  raf = window.requestAnimationFrame(frame);
  window.setTimeout(measure, 120);

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      window.cancelAnimationFrame(raf);
      raf = 0;
    } else if (!raf) {
      t0 = 0;
      raf = window.requestAnimationFrame(frame);
    }
  });
})();
