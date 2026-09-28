(function () {
  "use strict";

  var calm = window.matchMedia("(prefers-reduced-motion: reduce)");
  var register = document.getElementById("register");
  var bands = Array.prototype.slice.call(register.querySelectorAll(".band"));
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".filter__tab"));
  var tally = document.querySelector(".filter__tally");
  var wind = document.getElementById("wind");

  var WORDS = {
    all: "bands on the sheet",
    floor: "floor bands on the sheet",
    road: "way bands on the sheet",
    trunk: "trunk bands on the sheet",
    canopy: "canopy bands on the sheet"
  };

  var shown = bands.slice();
  var t0 = 0;

  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  function set(layer) {
    var order = 0;
    shown = [];
    bands.forEach(function (band) {
      var keep = layer === "all" || band.dataset.layer === layer;
      band.classList.toggle("is-out", !keep);
      if (!keep) { return; }
      band.classList.remove("is-in", "is-wide");
      if (order === 2 || order === 6) { band.classList.add("is-wide"); }
      void band.offsetWidth;
      band.classList.add("is-in");
      order++;
      shown.push(band);
    });
    var word = WORDS[layer] || "bands on the sheet";
    tally.textContent = shown.length + " " + word;
  }

  var reader = document.getElementById("reader");
  var rImg = document.getElementById("readerImg");
  var rNo = document.getElementById("readerNo");
  var rT = document.getElementById("readerTitle");
  var rA = document.getElementById("readerA");
  var rLink = document.getElementById("readerLink");
  var rClose = document.getElementById("readerClose");
  var opener = null;
  var at = 0;

  function show(n) {
    if (!shown.length) { return; }
    at = (n + shown.length) % shown.length;
    var frame = shown[at].querySelector(".frame");
    var img = frame.querySelector("img");
    rImg.setAttribute("src", img.getAttribute("src"));
    rImg.setAttribute("alt", img.getAttribute("alt"));
    rNo.textContent = frame.dataset.n + " / " + pad(shown.length);
    rT.textContent = frame.dataset.t;
    rA.textContent = frame.dataset.a + " \u00b7 " + frame.dataset.l;
    rLink.setAttribute("href", frame.dataset.p);
  }

  function open(n, from) {
    opener = from;
    show(n);
    reader.hidden = false;
    requestAnimationFrame(function () { reader.classList.add("is-open"); });
    rClose.focus();
  }

  function shut() {
    reader.classList.remove("is-open");
    var seal = function () { reader.hidden = true; };
    if (calm.matches) { seal(); } else { setTimeout(seal, 280); }
    if (opener) { opener.focus(); opener = null; }
  }

  function ring() {
    return Array.prototype.slice.call(
      reader.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])')
    ).filter(function (el) { return el.offsetParent !== null; });
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (other) {
        other.setAttribute("aria-pressed", other === tab ? "true" : "false");
      });
      set(tab.dataset.layer);
    });
  });

  register.addEventListener("click", function (ev) {
    var frame = ev.target.closest(".frame");
    if (!frame) { return; }
    open(shown.indexOf(frame.closest(".band")), frame);
  });

  register.addEventListener("keydown", function (ev) {
    var frame = ev.target.closest(".frame");
    if (!frame) { return; }
    var here = shown.indexOf(frame.closest(".band"));
    var to = -1;
    if (ev.key === "ArrowDown" || ev.key === "ArrowRight") { to = here + 1; }
    else if (ev.key === "ArrowUp" || ev.key === "ArrowLeft") { to = here - 1; }
    else if (ev.key === "Home") { to = 0; }
    else if (ev.key === "End") { to = shown.length - 1; }
    if (to < 0) { return; }
    ev.preventDefault();
    shown[(to + shown.length) % shown.length].querySelector(".frame").focus();
  });

  document.getElementById("readerPrev").addEventListener("click", function () { show(at - 1); });
  document.getElementById("readerNext").addEventListener("click", function () { show(at + 1); });
  rClose.addEventListener("click", shut);
  reader.querySelector(".reader__scrim").addEventListener("click", shut);

  document.addEventListener("keydown", function (ev) {
    if (reader.hidden) { return; }
    if (ev.key === "Escape") { ev.preventDefault(); shut(); }
    else if (ev.key === "ArrowDown" || ev.key === "ArrowRight") { ev.preventDefault(); show(at + 1); }
    else if (ev.key === "ArrowUp" || ev.key === "ArrowLeft") { ev.preventDefault(); show(at - 1); }
    else if (ev.key === "Home") { ev.preventDefault(); show(0); }
    else if (ev.key === "End") { ev.preventDefault(); show(shown.length - 1); }
    else if (ev.key === "Tab") {
      var list = ring();
      if (!list.length) { return; }
      var pos = list.indexOf(document.activeElement);
      var next = ev.shiftKey ? pos - 1 : pos + 1;
      if (next < 0 || next >= list.length) {
        ev.preventDefault();
        list[(next + list.length) % list.length].focus();
      }
    }
  });

  function blow(now) {
    if (!t0) { t0 = now; }
    var s = (now - t0) / 1000;
    var x = Math.sin(s * 0.11) * 5.5 + Math.cos(s * 0.07) * 2.5;
    var y = Math.cos(s * 0.09) * 3;
    wind.style.transform = "translate3d(" + x.toFixed(2) + "%, " + y.toFixed(2) + "%, 0)";
    requestAnimationFrame(blow);
  }

  if (calm.matches) {
    wind.style.transform = "translate3d(2%,0,0)";
  } else {
    requestAnimationFrame(blow);
  }

  set("all");
}());
