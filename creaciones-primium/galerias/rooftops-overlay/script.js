(function () {
  "use strict";

  var calm = window.matchMedia("(prefers-reduced-motion: reduce)");
  var fan = document.getElementById("fan");
  var cells = Array.prototype.slice.call(fan.querySelectorAll("li"));
  var chips = Array.prototype.slice.call(fan.querySelectorAll(".chip"));
  var spine = document.getElementById("spine");
  var ents = Array.prototype.slice.call(spine.querySelectorAll(".ent"));
  var big = document.getElementById("big");
  var bignum = document.getElementById("bignum");
  var stamp = document.querySelector(".stamp");
  var lgT = document.getElementById("lgT");
  var lgA = document.getElementById("lgA");
  var lgL = document.getElementById("lgL");
  var lgP = document.getElementById("lgP");
  var fbA = document.querySelector(".fb-a");
  var fbB = document.querySelector(".fb-b");

  var at = 0;
  var opener = null;
  var t0 = 0;

  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  function take(n) {
    var to = (n + chips.length) % chips.length;
    var chip = chips[to];
    var img = chip.querySelector("img");
    big.onerror = function () { big.classList.remove("is-on"); };
    big.setAttribute("alt", img.getAttribute("alt"));
    big.setAttribute("src", img.getAttribute("src"));
    big.classList.add("is-on");
    at = to;
    cells.forEach(function (li, k) { li.classList.toggle("is-on", k === to); });
    ents.forEach(function (ent, k) { ent.classList.toggle("is-on", k === to); });
    bignum.textContent = pad(at + 1);
    stamp.textContent = "Plate " + pad(at + 1) + " of " + pad(chips.length);
    lgT.textContent = chip.dataset.t;
    lgA.textContent = chip.dataset.a;
    lgL.textContent = chip.dataset.l;
    lgP.setAttribute("href", chip.dataset.p);
  }

  var lb = document.getElementById("lb");
  var lbImg = document.getElementById("lbImg");
  var lbNo = document.getElementById("lbNo");
  var lbT = document.getElementById("lbT");
  var lbA = document.getElementById("lbA");
  var lbP = document.getElementById("lbP");
  var lbX = document.getElementById("lbX");

  function paint() {
    var chip = chips[at];
    var img = chip.querySelector("img");
    lbImg.setAttribute("src", img.getAttribute("src"));
    lbImg.setAttribute("alt", img.getAttribute("alt"));
    lbNo.textContent = pad(at + 1) + " / " + pad(chips.length);
    lbT.textContent = chip.dataset.t;
    lbA.textContent = chip.dataset.a + " · " + chip.dataset.l;
    lbP.setAttribute("href", chip.dataset.p);
  }

  function open(from) {
    opener = from || document.activeElement;
    paint();
    lb.hidden = false;
    requestAnimationFrame(function () { lb.classList.add("is-open"); });
    lbX.focus();
  }

  function close() {
    lb.classList.remove("is-open");
    var seal = function () { lb.hidden = true; };
    if (calm.matches) { seal(); } else { setTimeout(seal, 260); }
    if (opener && document.contains(opener)) { opener.focus(); }
    opener = null;
  }

  function ring() {
    return Array.prototype.slice.call(
      lb.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])')
    ).filter(function (el) { return el.offsetParent !== null; });
  }

  fan.addEventListener("click", function (ev) {
    var chip = ev.target.closest(".chip");
    if (!chip) { return; }
    take(chips.indexOf(chip));
  });

  spine.addEventListener("click", function (ev) {
    var ent = ev.target.closest(".ent");
    if (!ent) { return; }
    take(ents.indexOf(ent));
  });

  document.getElementById("zoom").addEventListener("click", function () { open(this); });
  document.getElementById("lbPrev").addEventListener("click", function () { take(at - 1); paint(); });
  document.getElementById("lbNext").addEventListener("click", function () { take(at + 1); paint(); });
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
      if (ev.key === "ArrowRight") { ev.preventDefault(); take(at + 1); paint(); }
      else if (ev.key === "ArrowLeft") { ev.preventDefault(); take(at - 1); paint(); }
      else if (ev.key === "Home") { ev.preventDefault(); take(0); paint(); }
      else if (ev.key === "End") { ev.preventDefault(); take(chips.length - 1); paint(); }
      return;
    }
    var inFan = chips.indexOf(document.activeElement) > -1;
    var inSpine = ents.indexOf(document.activeElement) > -1;
    if (inFan && (ev.key === "ArrowRight" || ev.key === "Home" || ev.key === "End")) {
      ev.preventDefault();
      var to = ev.key === "Home" ? 0 : ev.key === "End" ? chips.length - 1 : at + 1;
      take(to);
      chips[at].focus();
    } else if (inFan && ev.key === "ArrowLeft") {
      ev.preventDefault();
      take(at - 1);
      chips[at].focus();
    } else if (inSpine && (ev.key === "ArrowDown" || ev.key === "Home" || ev.key === "End")) {
      ev.preventDefault();
      var down = ev.key === "Home" ? 0 : ev.key === "End" ? ents.length - 1 : at + 1;
      take(down);
      ents[at].focus();
    } else if (inSpine && ev.key === "ArrowUp") {
      ev.preventDefault();
      take(at - 1);
      ents[at].focus();
    } else if (ev.key === "Enter" && document.activeElement === document.body) {
      ev.preventDefault();
      open(null);
    }
  });

  function loop(now) {
    if (!t0) { t0 = now; }
    var s = (now - t0) / 1000;
    var k = 1.045 + (Math.sin(s * 0.09) * 0.5 + 0.5) * 0.05;
    var dx = Math.cos(s * 0.062) * 0.9;
    var dy = Math.sin(s * 0.048) * 0.7;
    big.style.transform = "scale(" + k.toFixed(4) + ") translate3d(" + dx.toFixed(2) + "%," + dy.toFixed(2) + "%,0)";
    fbA.style.transform = "translate3d(" + (Math.sin(s * 0.05) * 0.9).toFixed(2) + "%,0,0)";
    fbB.style.transform = "translate3d(0," + (Math.cos(s * 0.043) * 0.7).toFixed(2) + "%,0)";
    requestAnimationFrame(loop);
  }

  if (calm.matches) {
    big.style.transform = "scale(1.02)";
    fbA.style.transform = "translate3d(0,0,0)";
    fbB.style.transform = "translate3d(0,0,0)";
  } else {
    requestAnimationFrame(loop);
  }

  take(0);
}());
