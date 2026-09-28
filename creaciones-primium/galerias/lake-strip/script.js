(function () {
  "use strict";

  var calm = window.matchMedia("(prefers-reduced-motion: reduce)");
  var N = 9;

  var ribbon = document.getElementById("ribbon");
  var pls = Array.prototype.slice.call(document.querySelectorAll(".pl"));
  var ticks = Array.prototype.slice.call(document.querySelectorAll(".gauge i"));
  var read = document.getElementById("read");
  var tide = document.getElementById("tide");

  var lb = document.getElementById("lb");
  var lbImg = document.getElementById("lbImg");
  var lbNo = document.getElementById("lbNo");
  var lbT = document.getElementById("lbT");
  var lbA = document.getElementById("lbA");
  var lbP = document.getElementById("lbP");
  var lbX = document.getElementById("lbX");

  var at = 0;
  var from = 0;
  var raf = 0;
  var hold = calm.matches;
  var over = false;
  var opener = null;
  var last = 0;

  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  function spread() {
    var box = ribbon.getBoundingClientRect();
    var reach = box.width < 640 ? 1 : 2;
    var gap = (box.width / (reach * 2 + 1)) * 0.95;
    var amp = Math.min(34, box.height * 0.14);
    for (var i = 0; i < N; i += 1) {
      var d = i - from;
      var el = pls[i];
      if (Math.abs(d) > reach) {
        el.style.opacity = "0";
        el.style.transform = "translate(-50%,-50%) scale(0.5)";
        continue;
      }
      var k = d;
      var x = k * gap;
      var y = amp * Math.sin(k * 0.92);
      var rot = 7.5 * Math.cos(k * 0.92);
      var s = d === 0 ? 1 : Math.abs(d) === 1 ? 0.82 : 0.66;
      var depth = 1 - Math.abs(k) * 0.22;
      el.style.opacity = depth.toFixed(3);
      el.style.filter = "saturate(" + (0.42 + 0.58 * depth).toFixed(3) + ")";
      el.style.transform = "translate(-50%,-50%) translate3d(" + x.toFixed(2) + "px," + y.toFixed(2) + "px,0) rotate(" + rot.toFixed(2) + "deg) scale(" + s.toFixed(3) + ")";
    }
  }

  function land(i) {
    at = (i + N) % N;
    from = at;
    spread();
    paint();
  }

  function paint() {
    pls.forEach(function (el, i) { el.classList.toggle("is-on", i === at); });
    ticks.forEach(function (el, i) { el.classList.toggle("is-on", i === at); });
    read.textContent = "plate " + pad(at + 1) + " of " + pad(N) + " \u00b7 depth " + at * 12 + " m";
  }

  function slideTo(i) {
    land(i);
  }

  function openFrom(from_) {
    var p = pls[at];
    var img = p.querySelector("img");
    opener = from_ || null;
    lbImg.setAttribute("src", img.getAttribute("src"));
    lbImg.setAttribute("alt", img.getAttribute("alt"));
    lbNo.textContent = pad(at + 1) + " / " + pad(N);
    lbT.textContent = p.dataset.t;
    lbA.textContent = p.dataset.a + " \u00b7 " + p.dataset.l;
    lbP.setAttribute("href", p.dataset.p);
    lb.hidden = false;
    requestAnimationFrame(function () { lb.classList.add("is-open"); });
    lbX.focus();
  }

  function close() {
    lb.classList.remove("is-open");
    var seal = function () { lb.hidden = true; };
    if (calm.matches) { seal(); } else { setTimeout(seal, 280); }
    if (opener && document.contains(opener)) { opener.focus(); }
    opener = null;
  }

  function ring() {
    return Array.prototype.slice.call(
      lb.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])')
    ).filter(function (el) { return el.offsetParent !== null; });
  }

  ribbon.addEventListener("click", function (ev) {
    var p = ev.target.closest(".pl");
    if (!p) { return; }
    var i = Number(p.dataset.i);
    if (i === at) { openFrom(p); } else { slideTo(i); }
  });

  ribbon.addEventListener("pointerenter", function () { over = true; });
  ribbon.addEventListener("pointerleave", function () { over = false; });
  ribbon.addEventListener("focusin", function () { over = true; });
  ribbon.addEventListener("focusout", function () { over = false; });

  document.getElementById("prev").addEventListener("click", function () { slideTo(at - 1); });
  document.getElementById("next").addEventListener("click", function () { slideTo(at + 1); });
  document.getElementById("up").addEventListener("click", function () { slideTo(0); });
  document.getElementById("down").addEventListener("click", function () { slideTo(N - 1); });

  tide.addEventListener("click", function () {
    hold = !hold;
    tide.classList.toggle("is-on", hold);
    tide.setAttribute("aria-pressed", hold ? "true" : "false");
    tide.textContent = hold ? "Hold the tide" : "Let the tide run";
  });

  document.getElementById("lbPrev").addEventListener("click", function () { slideTo(at - 1); openFrom(null); });
  document.getElementById("lbNext").addEventListener("click", function () { slideTo(at + 1); openFrom(null); });
  lbX.addEventListener("click", close);
  lb.querySelector(".lb__veil").addEventListener("click", close);

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
      if (ev.key === "ArrowRight") { ev.preventDefault(); slideTo(at + 1); openFrom(null); }
      else if (ev.key === "ArrowLeft") { ev.preventDefault(); slideTo(at - 1); openFrom(null); }
      else if (ev.key === "Home") { ev.preventDefault(); slideTo(0); openFrom(null); }
      else if (ev.key === "End") { ev.preventDefault(); slideTo(N - 1); openFrom(null); }
      return;
    }

    if (document.activeElement !== ribbon) { return; }
    if (ev.key === "ArrowRight") { ev.preventDefault(); slideTo(at + 1); }
    else if (ev.key === "ArrowLeft") { ev.preventDefault(); slideTo(at - 1); }
    else if (ev.key === "PageDown") { ev.preventDefault(); slideTo(at + 3); }
    else if (ev.key === "PageUp") { ev.preventDefault(); slideTo(at - 3); }
    else if (ev.key === "Home") { ev.preventDefault(); slideTo(0); }
    else if (ev.key === "End") { ev.preventDefault(); slideTo(N - 1); }
    else if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); openFrom(ribbon); }
  });

  function loop(now) {
    raf = requestAnimationFrame(loop);
    if (hold || over) { last = now; return; }
    if (!last) { last = now; }
    if (now - last < 3400) { return; }
    last = now;
    slideTo(at + 1);
  }

  window.addEventListener("resize", function () { spread(); paint(); });

  tide.classList.toggle("is-on", hold);
  tide.setAttribute("aria-pressed", hold ? "true" : "false");
  tide.textContent = hold ? "Hold the tide" : "Let the tide run";
  land(0);
  if (!calm.matches) { raf = requestAnimationFrame(loop); }
  window.addEventListener("pagehide", function () { cancelAnimationFrame(raf); });
}());
