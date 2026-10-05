(function () {
  "use strict";

  var calm = window.matchMedia("(prefers-reduced-motion: reduce)");

  var walk = document.getElementById("walk");
  var bays = Array.prototype.slice.call(document.querySelectorAll(".bay"));
  var cols = Array.prototype.slice.call(document.querySelectorAll(".col"));
  var pls = Array.prototype.slice.call(document.querySelectorAll(".pl"));
  var links = Array.prototype.slice.call(document.querySelectorAll(".steps__link"));
  var roseBay = document.getElementById("roseBay");
  var roman = ["I", "II", "III"];

  var lb = document.getElementById("lb");
  var lbImg = document.getElementById("lbImg");
  var lbNo = document.getElementById("lbNo");
  var lbT = document.getElementById("lbT");
  var lbA = document.getElementById("lbA");
  var lbP = document.getElementById("lbP");
  var lbX = document.getElementById("lbX");

  var at = 0;
  var opener = null;
  var pending = false;
  var live = 0;
  var base = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  var lift = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  var rates = [0.02, 0.045, 0.075];
  var lifts = [0.2, 0.5, 0.95];
  var t0 = 0;
  var raf = 0;

  function bayOf(i) { return Math.floor(i / 3); }
  function noOf(i) { return roman[bayOf(i)] + "." + (i % 3 + 1); }

  function drift() {
    pending = false;
    var vh = window.innerHeight || 800;
    var centre = vh * 0.5;
    var walkW = walk.getBoundingClientRect().width;
    var cap = walkW < 560 ? 0 : walkW * 0.05;
    var k = 0;
    for (var bay of bays) {
      var r = bay.getBoundingClientRect();
      var mid = Math.max(-1, Math.min(1, (r.top + r.height / 2 - centre) / vh));
      var span = bay.querySelector(".arcade").getBoundingClientRect().width;
      for (var c = 0; c < 3; c += 1) {
        base[k] = Math.max(-cap, Math.min(cap, mid * rates[c] * span));
        lift[k] = Math.max(-26, Math.min(26, -mid * lifts[c] * 28));
        k += 1;
      }
    }
  }

  function sweep(now) {
    raf = requestAnimationFrame(sweep);
    if (!t0) { t0 = now; }
    var s = (now - t0) / 1000;
    var cap = walk.getBoundingClientRect().width < 560 ? 0 : 1;
    for (var i = 0; i < cols.length; i += 1) {
      var wob = Math.sin(s * 0.17 + i * 0.9) * 5 * cap;
      cols[i].style.transform = "translate3d(" + (base[i] + wob).toFixed(2) + "px," + lift[i].toFixed(2) + "px,0)";
    }
  }

  function survey() {
    pending = false;
    var line = (window.innerHeight || 800) * 0.42;
    var found = 0;
    for (var i = 0; i < bays.length; i += 1) {
      var r = bays[i].getBoundingClientRect();
      if (r.top <= line) { found = i; }
    }
    if (found !== live) {
      live = found;
      roseBay.textContent = "BAY " + roman[found];
    }
  }

  window.addEventListener("scroll", function () {
    if (!pending) { pending = true; requestAnimationFrame(function () { drift(); survey(); }); }
  }, { passive: true });

  function jump(n) {
    var next = bays[Math.max(0, Math.min(n, bays.length - 1))];
    next.scrollIntoView({ behavior: calm.matches ? "auto" : "smooth", block: "start" });
    next.focus({ preventScroll: true });
    live = -1;
    survey();
  }

  links.forEach(function (link, i) {
    link.addEventListener("click", function (ev) {
      ev.preventDefault();
      jump(i);
    });
  });

  function open(n, from) {
    at = (n + pls.length) % pls.length;
    var p = pls[at];
    var img = p.querySelector("img");
    opener = from || null;
    lbImg.setAttribute("src", img.getAttribute("src"));
    lbImg.setAttribute("alt", img.getAttribute("alt"));
    lbNo.textContent = "plate " + noOf(at);
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

  walk.addEventListener("click", function (ev) {
    var p = ev.target.closest(".pl");
    if (!p) { return; }
    open(Number(p.dataset.i), p);
  });

  document.getElementById("lbPrev").addEventListener("click", function () { open(at - 1, null); });
  document.getElementById("lbNext").addEventListener("click", function () { open(at + 1, null); });
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
      if (ev.key === "ArrowRight") { ev.preventDefault(); open(at + 1, null); }
      else if (ev.key === "ArrowLeft") { ev.preventDefault(); open(at - 1, null); }
      else if (ev.key === "Home") { ev.preventDefault(); open(0, null); }
      else if (ev.key === "End") { ev.preventDefault(); open(pls.length - 1, null); }
      return;
    }

    var here = pls.indexOf(document.activeElement);
    if (here >= 0) {
      if (ev.key === "ArrowRight") { ev.preventDefault(); pls[Math.min(here + 1, pls.length - 1)].focus(); }
      else if (ev.key === "ArrowLeft") { ev.preventDefault(); pls[Math.max(here - 1, 0)].focus(); }
      else if (ev.key === "ArrowDown") { ev.preventDefault(); jump(bayOf(here) + 1); }
      else if (ev.key === "ArrowUp") { ev.preventDefault(); jump(bayOf(here) - 1); }
      else if (ev.key === "Home") { ev.preventDefault(); pls[0].focus(); }
      else if (ev.key === "End") { ev.preventDefault(); pls[pls.length - 1].focus(); }
      return;
    }

    var b = bays.indexOf(document.activeElement);
    if (b >= 0) {
      if (ev.key === "ArrowDown" || ev.key === "PageDown") { ev.preventDefault(); jump(b + 1); }
      else if (ev.key === "ArrowUp" || ev.key === "PageUp") { ev.preventDefault(); jump(b - 1); }
      else if (ev.key === "ArrowRight") { ev.preventDefault(); pls[b * 3].focus(); }
      else if (ev.key === "ArrowLeft") { ev.preventDefault(); pls[b * 3 + 2].focus(); }
      else if (ev.key === "Home") { ev.preventDefault(); jump(0); }
      else if (ev.key === "End") { ev.preventDefault(); jump(bays.length - 1); }
    }
  });

  window.addEventListener("resize", function () { drift(); survey(); });

  if (calm.matches) {
    cols.forEach(function (col) { col.style.transform = "none"; });
  } else {
    drift();
    raf = requestAnimationFrame(sweep);
    window.addEventListener("pagehide", function () { cancelAnimationFrame(raf); });
  }
  survey();
}());
