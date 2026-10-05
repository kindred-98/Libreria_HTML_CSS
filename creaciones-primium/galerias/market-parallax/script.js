(function () {
  "use strict";

  var PLATES = [
    { n: "01", alt: "A market stall in Moscow under a canvas awning", by: "W. Bulach", lic: "CC BY-SA 4.0" },
    { n: "02", alt: "Stall at New Market in Kolkata with produce stacked high", by: "Kritzolina", lic: "CC BY-SA 4.0" },
    { n: "03", alt: "Central market stall photographed from across the square", by: "M J Richardson", lic: "CC BY-SA 2.0" },
    { n: "04", alt: "Sweet stall at the Jedburgh Easter Market with the stallholder behind it", by: "Victuallers", lic: "CC BY-SA 3.0" },
    { n: "05", alt: "Prime cake stall at the Jedburgh Easter Market", by: "Victuallers", lic: "CC BY-SA 3.0" },
    { n: "06", alt: "Calligraphy stall and stallholder at the Jedburgh Easter Market", by: "Victuallers", lic: "CC BY-SA 3.0" },
    { n: "07", alt: "Handmade goods stall with two stallholders at the Jedburgh Easter Market", by: "Victuallers", lic: "CC BY-SA 3.0" },
    { n: "08", alt: "Street food stall and stallholder at the Jedburgh Easter Market", by: "Victuallers", lic: "CC BY-SA 3.0" }
  ];

  var views = Array.prototype.slice.call(document.querySelectorAll(".view"));
  var links = Array.prototype.slice.call(document.querySelectorAll(".rail__link"));
  var railRead = document.getElementById("rail-read");
  var posRead = document.getElementById("pos");
  var beam = document.querySelector(".beam");
  var walk = document.getElementById("walk");

  var viewer = document.getElementById("viewer");
  var vImg = document.getElementById("vimg");
  var vCap = document.getElementById("vcap");
  var vCount = document.getElementById("vcount");
  var vClose = document.getElementById("vclose");
  var vPrev = document.getElementById("vprev");
  var vNext = document.getElementById("vnext");

  var still = window.matchMedia("(prefers-reduced-motion: reduce)");
  var here = 0;
  var start = 0;
  var lastP = -1;

  function clamp(v, a, b) {
    return v < a ? a : v > b ? b : v;
  }

  function jump(i) {
    here = clamp(i, 0, views.length - 1);
    var v = views[here];
    var top = v.getBoundingClientRect().top + window.pageYOffset;
    window.scrollTo({ top: top - 8, behavior: still.matches ? "auto" : "smooth" });
    v.focus({ preventScroll: true });
  }

  function depth() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if (h <= 0) {
      return 0;
    }
    return clamp(window.pageYOffset / h, 0, 1);
  }

  function sweep(now) {
    if (still.matches) {
      return;
    }
    var span = window.innerWidth + beam.offsetWidth;
    var t = ((now - start) % 17000) / 17000;
    var x = -beam.offsetWidth + t * span;
    beam.style.transform = "translate3d(" + x.toFixed(1) + "px,0,0)";
  }

  function frame(now) {
    var mid = window.innerHeight / 2;
    var best = 0;
    var bestD = Infinity;
    for (var i = 0; i < views.length; i++) {
      var r = views[i].getBoundingClientRect();
      var d = r.top + r.height / 2 - mid;
      var p = clamp(d / (window.innerHeight * 0.85), -1.25, 1.25);
      views[i].style.setProperty("--p", p.toFixed(3));
      var ad = Math.abs(d);
      if (ad < bestD) {
        bestD = ad;
        best = i;
      }
    }
    if (best !== here) {
      here = best;
      links.forEach(function (l, k) {
        l.classList.toggle("is-here", k === here);
        if (k === here) {
          l.setAttribute("aria-current", "true");
        } else {
          l.removeAttribute("aria-current");
        }
      });
    }
    var pct = Math.round(depth() * 100);
    if (pct !== lastP) {
      lastP = pct;
      posRead.textContent = "Depth " + String(pct).padStart(2, "0") + "%";
      railRead.textContent = String(here + 1).padStart(2, "0") + " / 0" + views.length;
    }
    sweep(now);
    requestAnimationFrame(frame);
  }

  links.forEach(function (l, i) {
    l.addEventListener("click", function (e) {
      e.preventDefault();
      jump(i);
    });
  });

  document.addEventListener("keydown", function (e) {
    if (viewer && !viewer.hidden) {
      return;
    }
    var k = e.key;
    if (k === "ArrowDown" || k === "PageDown") {
      jump(here + 1);
      e.preventDefault();
    } else if (k === "ArrowUp" || k === "PageUp") {
      jump(here - 1);
      e.preventDefault();
    } else if (k === "Home") {
      jump(0);
      e.preventDefault();
    } else if (k === "End") {
      jump(views.length - 1);
      e.preventDefault();
    }
  });

  walk.addEventListener("click", function (e) {
    var b = e.target.closest(".plate");
    if (!b) {
      return;
    }
    openViewer(Number(b.dataset.index));
  });

  var opened = -1;
  var restore = null;

  function openViewer(i) {
    opened = (i + PLATES.length) % PLATES.length;
    var p = PLATES[opened];
    var src = document.querySelector('.plate[data-index="' + opened + '"] .plate__shot img').src;
    vImg.src = src;
    vImg.alt = p.alt;
    vCap.textContent = "Plate " + p.n + " \u00b7 " + p.by + " \u00b7 " + p.lic;
    vCount.textContent = p.n + " / 0" + PLATES.length;
    restore = document.activeElement;
    viewer.hidden = false;
    vClose.focus({ preventScroll: true });
  }

  function closeViewer() {
    if (viewer.hidden) {
      return;
    }
    viewer.hidden = true;
    vImg.removeAttribute("src");
    if (restore?.focus) {
      restore.focus({ preventScroll: true });
    }
    restore = null;
  }

  function step(d) {
    openViewer(opened + d);
  }

  vClose.addEventListener("click", closeViewer);
  vPrev.addEventListener("click", function () {
    step(-1);
  });
  vNext.addEventListener("click", function () {
    step(1);
  });
  viewer.querySelector(".viewer__scrim").addEventListener("click", closeViewer);

  viewer.addEventListener("keydown", function (e) {
    var k = e.key;
    if (k === "Escape") {
      closeViewer();
      e.preventDefault();
    } else if (k === "ArrowRight") {
      step(1);
      e.preventDefault();
    } else if (k === "ArrowLeft") {
      step(-1);
      e.preventDefault();
    } else if (k === "Home") {
      openViewer(0);
      e.preventDefault();
    } else if (k === "End") {
      openViewer(PLATES.length - 1);
      e.preventDefault();
    } else if (k === "Tab") {
      var f = [vPrev, vNext, vClose];
      var at = f.indexOf(document.activeElement);
      e.preventDefault();
      f[(at + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus({ preventScroll: true });
    }
  });

  start = performance.now();
  requestAnimationFrame(frame);
})();
