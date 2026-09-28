(function () {
  "use strict";

  var calm = window.matchMedia("(prefers-reduced-motion: reduce)");
  var plates = Array.prototype.slice.call(document.querySelectorAll(".plate"));
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".board__tab"));
  var wins = Array.prototype.slice.call(document.querySelectorAll(".win"));
  var now = document.getElementById("now");
  var roman = ["I", "II", "III", "IV"];

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

  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  function paint() {
    var plate = plates[at];
    var img = plate.querySelector("img");
    lbImg.setAttribute("src", img.getAttribute("src"));
    lbImg.setAttribute("alt", img.getAttribute("alt"));
    lbNo.textContent = pad(at + 1) + " / " + pad(plates.length);
    lbT.textContent = plate.dataset.t;
    lbA.textContent = plate.dataset.a + " \u00b7 " + plate.dataset.l;
    lbP.setAttribute("href", plate.dataset.p);
  }

  function open(n, from) {
    at = (n + plates.length) % plates.length;
    opener = from || null;
    paint();
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

  var wall = document.getElementById("wall");

  wall.addEventListener("click", function (ev) {
    var plate = ev.target.closest(".plate");
    if (!plate) { return; }
    open(plates.indexOf(plate), plate);
  });

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var target = document.querySelector(tab.getAttribute("href"));
      if (target) { target.focus({ preventScroll: true }); }
    });
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
      else if (ev.key === "End") { ev.preventDefault(); open(plates.length - 1, null); }
      return;
    }

    var here = plates.indexOf(document.activeElement);
    if (here >= 0) {
      if (ev.key === "ArrowRight") { ev.preventDefault(); plates[Math.min(here + 1, plates.length - 1)].focus(); }
      else if (ev.key === "ArrowLeft") { ev.preventDefault(); plates[Math.max(here - 1, 0)].focus(); }
      else if (ev.key === "Home") { ev.preventDefault(); plates[0].focus(); }
      else if (ev.key === "End") { ev.preventDefault(); plates[plates.length - 1].focus(); }
      return;
    }

    var w = wins.indexOf(document.activeElement);
    if (w >= 0 && (ev.key === "ArrowDown" || ev.key === "PageDown")) {
      ev.preventDefault();
      wins[Math.min(w + 1, wins.length - 1)].focus();
    } else if (w >= 0 && (ev.key === "ArrowUp" || ev.key === "PageUp")) {
      ev.preventDefault();
      wins[Math.max(w - 1, 0)].focus();
    }
  });

  function survey() {
    pending = false;
    var line = window.innerHeight * 0.42;
    var found = 0;
    for (var i = 0; i < wins.length; i += 1) {
      var r = wins[i].getBoundingClientRect();
      if (r.top <= line && r.bottom > line) { found = i; break; }
      if (r.top <= line) { found = i; }
    }
    if (found !== live) {
      live = found;
      now.textContent = "window " + roman[found] + " of IV";
    }
  }

  window.addEventListener("scroll", function () {
    if (!pending) { pending = true; requestAnimationFrame(survey); }
  }, { passive: true });

  window.addEventListener("resize", survey);
  survey();
  paint();
}());
