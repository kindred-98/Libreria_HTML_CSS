(function () {
  "use strict";

  var calm = window.matchMedia("(prefers-reduced-motion: reduce)");
  var mosaic = document.getElementById("mosaic");
  var plates = Array.prototype.slice.call(mosaic.querySelectorAll(".plate"));
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));
  var tally = document.querySelector(".tally");
  var meshA = document.querySelector(".mesh-a");
  var meshB = document.querySelector(".mesh-b");

  var SHAPES = {
    all: [4, 2, 1, 1, 1, 1, 1, 1, 3, 3],
    ridge: [2, 2, 2, 1, 1, 2, 2, 3, 3, 1],
    summit: [3, 3, 2, 2, 2, 4, 2, 1, 1, 1],
    water: [2, 2, 2, 4, 2, 1, 1, 3, 3, 1],
    cloud: [4, 2, 1, 1, 1, 1, 3, 3, 2, 2]
  };

  var MEASURE = { 1: "one", 2: "duo", 3: "broad", 4: "lead" };

  var WORDS = {
    all: "plate",
    ridge: "ridge plate",
    summit: "summit plate",
    water: "water plate",
    cloud: "cloud plate"
  };

  var shown = plates.slice();
  var idx = 0;
  var opener = null;
  var t0 = 0;

  function repack(key) {
    var pattern = SHAPES[key] || SHAPES.all;
    var list = [];
    plates.forEach(function (plate) {
      var tags = plate.dataset.tags.split(" ");
      var keep = key === "all" || tags.includes(key);
      plate.classList.toggle("is-out", !keep);
      if (!keep) { return; }
      plate.classList.remove("lead", "broad", "duo", "one", "is-in");
      plate.classList.add(MEASURE[pattern[list.length % pattern.length]]);
      plate.getBoundingClientRect();
      plate.classList.add("is-in");
      list.push(plate);
    });
    shown = list;
    var word = WORDS[key] || "plate";
    tally.textContent = shown.length + " " + word + (shown.length === 1 ? "" : "s") + " on the sheet";
  }

  var lb = document.getElementById("lb");
  var lbImg = document.getElementById("lbImg");
  var lbNo = document.getElementById("lbNo");
  var lbT = document.getElementById("lbT");
  var lbA = document.getElementById("lbA");
  var lbP = document.getElementById("lbP");
  var lbX = document.getElementById("lbX");

  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  function show(n) {
    if (!shown.length) { return; }
    idx = (n + shown.length) % shown.length;
    var shot = shown[idx].querySelector(".shot");
    var img = shot.querySelector("img");
    lbImg.setAttribute("src", img.getAttribute("src"));
    lbImg.setAttribute("alt", img.getAttribute("alt"));
    lbNo.textContent = pad(idx + 1) + " / " + pad(shown.length);
    lbT.textContent = shot.dataset.t;
    lbA.textContent = shot.dataset.a + " · " + shot.dataset.l;
    lbP.setAttribute("href", shot.dataset.p);
  }

  function open(n, from) {
    opener = from;
    show(n);
    lb.hidden = false;
    requestAnimationFrame(function () { lb.classList.add("is-open"); });
    lbX.focus();
  }

  function close() {
    lb.classList.remove("is-open");
    var seal = function () { lb.hidden = true; };
    if (calm.matches) { seal(); } else { setTimeout(seal, 280); }
    if (opener) { opener.focus(); opener = null; }
  }

  function focusables() {
    return Array.prototype.slice.call(
      lb.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])')
    ).filter(function (el) { return el.offsetParent !== null; });
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (other) {
        other.setAttribute("aria-pressed", other === chip ? "true" : "false");
      });
      repack(chip.dataset.filter);
    });
  });

  mosaic.addEventListener("click", function (ev) {
    var shot = ev.target.closest(".shot");
    if (!shot) { return; }
    open(shown.indexOf(shot.closest(".plate")), shot);
  });

  mosaic.addEventListener("keydown", function (ev) {
    var shot = ev.target.closest(".shot");
    if (!shot) { return; }
    var here = shown.indexOf(shot.closest(".plate"));
    var to = -1;
    if (ev.key === "ArrowRight" || ev.key === "ArrowDown") { to = here + 1; }
    else if (ev.key === "ArrowLeft" || ev.key === "ArrowUp") { to = here - 1; }
    else if (ev.key === "Home") { to = 0; }
    else if (ev.key === "End") { to = shown.length - 1; }
    if (to < 0) { return; }
    ev.preventDefault();
    shown[(to + shown.length) % shown.length].querySelector(".shot").focus();
  });

  document.getElementById("lbPrev").addEventListener("click", function () { show(idx - 1); });
  document.getElementById("lbNext").addEventListener("click", function () { show(idx + 1); });
  lbX.addEventListener("click", close);
  lb.querySelector(".lb-veil").addEventListener("click", close);

  document.addEventListener("keydown", function (ev) {
    if (lb.hidden) { return; }
    if (ev.key === "Escape") { ev.preventDefault(); close(); }
    else if (ev.key === "ArrowRight") { ev.preventDefault(); show(idx + 1); }
    else if (ev.key === "ArrowLeft") { ev.preventDefault(); show(idx - 1); }
    else if (ev.key === "Home") { ev.preventDefault(); show(0); }
    else if (ev.key === "End") { ev.preventDefault(); show(shown.length - 1); }
    else if (ev.key === "Tab") {
      var ring = focusables();
      if (!ring.length) { return; }
      var at = ring.indexOf(document.activeElement);
      var next = ev.shiftKey ? at - 1 : at + 1;
      if (next < 0 || next >= ring.length) {
        ev.preventDefault();
        ring[(next + ring.length) % ring.length].focus();
      }
    }
  });

  function drift(now) {
    if (!t0) { t0 = now; }
    var s = (now - t0) / 1000;
    var a = s * 0.058;
    var b = s * 0.041;
    var ax = Math.sin(a) * 7 + Math.cos(a * 0.62) * 3.5;
    var ay = Math.cos(a * 0.83) * 5;
    var bx = Math.cos(b) * 6;
    var by = Math.sin(b * 1.17) * 6;
    meshA.style.transform = "translate3d(" + ax.toFixed(2) + "vw," + ay.toFixed(2) + "vh,0)";
    meshB.style.transform = "translate3d(" + bx.toFixed(2) + "vw," + by.toFixed(2) + "vh,0)";
    requestAnimationFrame(drift);
  }

  if (calm.matches) {
    meshA.style.transform = "translate3d(2.5vw,1.5vh,0)";
    meshB.style.transform = "translate3d(-3vw,-2vh,0)";
  } else {
    requestAnimationFrame(drift);
  }

  repack("all");
}());
