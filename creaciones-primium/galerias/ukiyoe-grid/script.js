(function () {
  "use strict";

  var calm = window.matchMedia("(prefers-reduced-motion: reduce)");
  var sheet = document.getElementById("sheet");
  var items = Array.prototype.slice.call(sheet.querySelectorAll(".impression"));
  var keys = Array.prototype.slice.call(document.querySelectorAll(".press__key"));
  var again = document.getElementById("again");
  var tally = document.querySelector(".press__tally");
  var railCount = document.getElementById("railCount");
  var beam = document.getElementById("beam");

  var CUTS = [
    [2, 1, 1, 1, 2, 1, 1, 1, 2],
    [1, 1, 2, 1, 1, 2, 1, 1, 2],
    [3, 1, 1, 1, 2, 1, 1, 1, 1],
    [1, 2, 1, 1, 1, 2, 1, 2, 1]
  ];

  var WORDS = {
    all: "plates printed",
    hokusai: "hokusai plates pulled",
    sheet: "museum sheets laid down",
    actors: "actor plates pulled"
  };

  var cut = 0;
  var shown = items.slice();
  var centres = [];
  var litAt = -1;
  var t0 = 0;

  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  function measure() {
    centres = shown.map(function (item) {
      var box = item.getBoundingClientRect();
      return box.left + box.width / 2 + window.pageXOffset;
    });
  }

  function print(key) {
    var cuts = CUTS[cut];
    var at = 0;
    shown = [];
    items.forEach(function (item) {
      var keep = key === "all" || item.dataset.group === key;
      item.classList.toggle("is-out", !keep);
      if (!keep) { return; }
      item.classList.remove("s1", "s2", "s3", "is-in", "is-lit");
      item.classList.add("s" + cuts[at % cuts.length]);
      void item.offsetWidth;
      item.classList.add("is-in");
      shown.push(item);
      at++;
    });
    litAt = -1;
    measure();
    var word = WORDS[key] || "plates printed";
    tally.textContent = shown.length + " " + word;
    railCount.textContent = pad(shown.length);
  }

  function light(index) {
    if (index === litAt) { return; }
    if (litAt > -1 && shown[litAt]) { shown[litAt].classList.remove("is-lit"); }
    if (shown[index]) { shown[index].classList.add("is-lit"); }
    litAt = index;
  }

  function rake(now) {
    if (!t0) { t0 = now; }
    var span = 9600;
    var p = ((now - t0) % span) / span;
    var x = -46 + p * 150;
    beam.style.transform = "translate3d(" + x.toFixed(2) + "vw,0,0) rotate(7deg)";
    var box = sheet.getBoundingClientRect();
    var vw = window.innerWidth;
    var beamX = vw * (x / 100) + vw * 0.17;
    var found = -1;
    for (var k = 0; k < centres.length; k++) {
      if (centres[k] >= beamX) { found = k; break; }
    }
    light(found > -1 ? found : centres.length - 1);
    requestAnimationFrame(rake);
  }

  var viewer = document.getElementById("viewer");
  var vImg = document.getElementById("viewerImg");
  var vNo = document.getElementById("viewerNo");
  var vT = document.getElementById("viewerTitle");
  var vA = document.getElementById("viewerA");
  var vLink = document.getElementById("viewerLink");
  var vClose = document.getElementById("viewerClose");
  var opener = null;
  var at = 0;

  function show(n) {
    if (!shown.length) { return; }
    at = (n + shown.length) % shown.length;
    var plate = shown[at].querySelector(".plate");
    var img = plate.querySelector("img");
    vImg.setAttribute("src", img.getAttribute("src"));
    vImg.setAttribute("alt", img.getAttribute("alt"));
    vNo.textContent = plate.dataset.n + " / " + pad(shown.length);
    vT.textContent = plate.dataset.t;
    vA.textContent = plate.dataset.a + " \u00b7 " + plate.dataset.l;
    vLink.setAttribute("href", plate.dataset.p);
  }

  function open(n, from) {
    opener = from;
    show(n);
    viewer.hidden = false;
    requestAnimationFrame(function () { viewer.classList.add("is-open"); });
    vClose.focus();
  }

  function shut() {
    viewer.classList.remove("is-open");
    var seal = function () { viewer.hidden = true; };
    if (calm.matches) { seal(); } else { setTimeout(seal, 280); }
    if (opener) { opener.focus(); opener = null; }
  }

  function ring() {
    return Array.prototype.slice.call(
      viewer.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])')
    ).filter(function (el) { return el.offsetParent !== null; });
  }

  keys.forEach(function (key) {
    key.addEventListener("click", function () {
      keys.forEach(function (other) {
        other.setAttribute("aria-pressed", other === key ? "true" : "false");
      });
      print(key.dataset.group);
    });
  });

  again.addEventListener("click", function () {
    cut = (cut + 1) % CUTS.length;
    var on = document.querySelector('.press__key[aria-pressed="true"]');
    print(on ? on.dataset.group : "all");
  });

  sheet.addEventListener("click", function (ev) {
    var plate = ev.target.closest(".plate");
    if (!plate) { return; }
    open(shown.indexOf(plate.closest(".impression")), plate);
  });

  sheet.addEventListener("keydown", function (ev) {
    var plate = ev.target.closest(".plate");
    if (!plate) { return; }
    var here = shown.indexOf(plate.closest(".impression"));
    var to = -1;
    if (ev.key === "ArrowRight" || ev.key === "ArrowDown") { to = here + 1; }
    else if (ev.key === "ArrowLeft" || ev.key === "ArrowUp") { to = here - 1; }
    else if (ev.key === "Home") { to = 0; }
    else if (ev.key === "End") { to = shown.length - 1; }
    if (to < 0) { return; }
    ev.preventDefault();
    shown[(to + shown.length) % shown.length].querySelector(".plate").focus();
  });

  document.getElementById("viewerPrev").addEventListener("click", function () { show(at - 1); });
  document.getElementById("viewerNext").addEventListener("click", function () { show(at + 1); });
  vClose.addEventListener("click", shut);
  viewer.querySelector(".viewer__scrim").addEventListener("click", shut);

  document.addEventListener("keydown", function (ev) {
    if (viewer.hidden) { return; }
    if (ev.key === "Escape") { ev.preventDefault(); shut(); }
    else if (ev.key === "ArrowRight") { ev.preventDefault(); show(at + 1); }
    else if (ev.key === "ArrowLeft") { ev.preventDefault(); show(at - 1); }
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

  window.addEventListener("resize", function () { measure(); });

  if (calm.matches) {
    beam.style.transform = "translate3d(28vw,0,0) rotate(7deg)";
    light(Math.floor(shown.length / 2));
  } else {
    requestAnimationFrame(rake);
  }

  print("all");
}());
