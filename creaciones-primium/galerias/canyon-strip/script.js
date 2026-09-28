(function () {
  "use strict";

  var calm = window.matchMedia("(prefers-reduced-motion: reduce)");
  var strip = document.getElementById("strip");
  var track = document.getElementById("track");
  var plates = Array.prototype.slice.call(track.querySelectorAll(".pl"));
  var ruler = document.getElementById("ruler");
  var ticks = Array.prototype.slice.call(ruler.querySelectorAll("button"));
  var mark = document.getElementById("mark");
  var hA = document.querySelector(".h-a");
  var hB = document.querySelector(".h-b");

  var x = 0;
  var span = 0;
  var want = null;
  var drift = 0;
  var at = -1;
  var opener = null;
  var t0 = 0;
  var last = 0;

  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  function measure() {
    span = Math.max(0, Math.round(track.getBoundingClientRect().width - strip.clientWidth));
    if (x > span) { x = span; }
    if (want !== null && want > span) { want = span; }
  }

  function seat() {
    track.style.transform = "translate3d(" + (-x).toFixed(2) + "px,0,0)";
  }

  function nearest() {
    if (span <= 0) { return 0; }
    var mid = strip.clientWidth / 2;
    var best = 0;
    var gap = Infinity;
    plates.forEach(function (pl, k) {
      var centre = pl.offsetLeft - x + pl.offsetWidth / 2;
      var d = Math.abs(centre - mid);
      if (d < gap) { gap = d; best = k; }
    });
    return best;
  }

  function flag(k) {
    if (k === at) { return; }
    at = k;
    plates.forEach(function (pl, i) { pl.classList.toggle("is-on", i === k); });
    ticks.forEach(function (btn, i) {
      btn.setAttribute("aria-current", i === k ? "true" : "false");
    });
    var box = ticks[k].getBoundingClientRect();
    var rail = ruler.getBoundingClientRect();
    mark.style.transform = "translate3d(" + (box.left - rail.left + box.width / 2).toFixed(2) + "px,0,0)";
  }

  function glideTo(n) {
    measure();
    var mid = strip.clientWidth / 2;
    var pl = plates[n];
    var target = Math.round(pl.offsetLeft + pl.offsetWidth / 2 - mid);
    want = Math.max(0, Math.min(span, target));
  }

  function hold() { drift = 0; }

  function release() { drift = calm.matches ? 0 : 30; }

  var lb = document.getElementById("lb");
  var lbImg = document.getElementById("lbImg");
  var lbNo = document.getElementById("lbNo");
  var lbT = document.getElementById("lbT");
  var lbA = document.getElementById("lbA");
  var lbP = document.getElementById("lbP");
  var lbX = document.getElementById("lbX");

  function paint(k) {
    var pl = plates[k];
    var img = pl.querySelector("img");
    lbImg.setAttribute("src", img.getAttribute("src"));
    lbImg.setAttribute("alt", img.getAttribute("alt"));
    lbNo.textContent = pad(k + 1) + " / " + pad(plates.length);
    lbT.textContent = pl.dataset.t;
    lbA.textContent = pl.dataset.a + " · " + pl.dataset.l;
    lbP.setAttribute("href", pl.dataset.p);
  }

  function open(k) {
    opener = document.activeElement;
    paint(k);
    lb.hidden = false;
    hold();
    requestAnimationFrame(function () { lb.classList.add("is-open"); });
    lbX.focus();
  }

  function close() {
    lb.classList.remove("is-open");
    var seal = function () { lb.hidden = true; };
    if (calm.matches) { seal(); } else { setTimeout(seal, 260); }
    if (opener && document.contains(opener)) { opener.focus(); }
    opener = null;
    release();
  }

  function ring() {
    return Array.prototype.slice.call(
      lb.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])')
    ).filter(function (el) { return el.offsetParent !== null; });
  }

  track.addEventListener("click", function (ev) {
    var pl = ev.target.closest(".pl");
    if (!pl) { return; }
    glideTo(plates.indexOf(pl));
    open(plates.indexOf(pl));
  });

  ticks.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var k = Number(btn.dataset.i);
      glideTo(k);
      hold();
    });
  });

  document.getElementById("aPrev").addEventListener("click", function () {
    measure();
    want = 0;
  });

  document.getElementById("aNext").addEventListener("click", function () {
    measure();
    want = span;
  });

  strip.addEventListener("pointerenter", hold);
  strip.addEventListener("pointerleave", function () { if (lb.hidden) { release(); } });
  strip.addEventListener("focusin", hold);
  strip.addEventListener("focusout", release);
  ruler.addEventListener("pointerenter", hold);
  ruler.addEventListener("pointerleave", release);

  document.getElementById("lbPrev").addEventListener("click", function () { paint((at - 1 + plates.length) % plates.length); });
  document.getElementById("lbNext").addEventListener("click", function () { paint((at + 1) % plates.length); });
  lbX.addEventListener("click", close);
  lb.querySelector(".lb-veil").addEventListener("click", close);

  document.addEventListener("keydown", function (ev) {
    if (!lb.hidden) {
      if (ev.key === "Escape") { ev.preventDefault(); close(); return; }
      if (ev.key === "Tab") {
        var box = ring();
        if (!box.length) { return; }
        var pos = box.indexOf(document.activeElement);
        var nxt = ev.shiftKey ? pos - 1 : pos + 1;
        if (nxt < 0 || nxt >= box.length) {
          ev.preventDefault();
          box[(nxt + box.length) % box.length].focus();
        }
        return;
      }
      if (ev.key === "ArrowRight") { ev.preventDefault(); paint((at + 1) % plates.length); }
      else if (ev.key === "ArrowLeft") { ev.preventDefault(); paint((at - 1 + plates.length) % plates.length); }
      else if (ev.key === "Home") { ev.preventDefault(); paint(0); }
      else if (ev.key === "End") { ev.preventDefault(); paint(plates.length - 1); }
      return;
    }
    var here = plates.indexOf(document.activeElement);
    if (ev.key === "Home") { ev.preventDefault(); glideTo(0); hold(); return; }
    if (ev.key === "End") { ev.preventDefault(); glideTo(plates.length - 1); hold(); return; }
    if (ev.key !== "ArrowRight" && ev.key !== "ArrowLeft") { return; }
    var d = ev.key === "ArrowRight" ? 1 : -1;
    if (here > -1) {
      ev.preventDefault();
      var to = Math.max(0, Math.min(plates.length - 1, here + d));
      glideTo(to);
      plates[to].focus();
    } else {
      ev.preventDefault();
      glideTo(Math.max(0, Math.min(plates.length - 1, at + d)));
    }
  });

  window.addEventListener("resize", function () {
    measure();
    seat();
    at = -1;
  });

  function loop(now) {
    if (!t0) { t0 = now; }
    var dt = Math.min(60, now - (last || now));
    last = now;
    if (want !== null && span > 0) {
      var step = Math.max(1.2, Math.abs(want - x) * 0.09);
      if (Math.abs(want - x) <= step) { x = want; want = null; } else { x += (want - x > 0 ? step : -step); }
    } else if (drift > 0 && span > 0) {
      x += (dt / 1000) * drift;
      if (x >= span) { x = 0; }
    }
    seat();
    flag(nearest());
    var s = (now - t0) / 1000;
    hA.style.transform = "translate3d(" + (Math.sin(s * 0.06) * 0.7).toFixed(2) + "%,0,0)";
    hB.style.transform = "translate3d(0," + (Math.cos(s * 0.048) * 0.5).toFixed(2) + "%,0)";
    requestAnimationFrame(loop);
  }

  measure();
  seat();
  flag(nearest());
  release();
  requestAnimationFrame(loop);
}());
