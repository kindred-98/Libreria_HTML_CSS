(function () {
  "use strict";

  var calm = window.matchMedia("(prefers-reduced-motion: reduce)");
  var rail = document.getElementById("rail");
  var thumbs = Array.prototype.slice.call(rail.querySelectorAll(".thumb"));
  var big = document.getElementById("big");
  var empty = document.getElementById("empty");
  var scan = document.querySelector(".scan");
  var bandA = document.querySelector(".band-a");
  var bandB = document.querySelector(".band-b");
  var slateNo = document.getElementById("slateNo");
  var slateT = document.getElementById("slateT");
  var slateA = document.getElementById("slateA");
  var slateP = document.getElementById("slateP");

  var at = 0;
  var t0 = 0;

  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  function choose(n, keepFocus) {
    var to = (n + thumbs.length) % thumbs.length;
    thumbs.forEach(function (thumb, k) {
      thumb.setAttribute("aria-current", k === to ? "true" : "false");
    });
    var img = thumbs[to].querySelector("img");
    big.onerror = function () {
      big.classList.remove("is-on");
      empty.hidden = false;
    };
    big.setAttribute("alt", img.getAttribute("alt"));
    big.setAttribute("src", img.getAttribute("src"));
    big.classList.add("is-on");
    empty.hidden = true;
    at = to;
    slateNo.textContent = pad(at + 1) + " / " + pad(thumbs.length);
    slateT.textContent = thumbs[at].dataset.t;
    slateA.textContent = thumbs[at].dataset.a + " · " + thumbs[at].dataset.l;
    slateP.setAttribute("href", thumbs[at].dataset.p);
    if (keepFocus) { thumbs[at].focus(); }
    if (rail.scrollHeight > rail.clientHeight) {
      var cell = thumbs[at].getBoundingClientRect();
      var box = rail.getBoundingClientRect();
      if (cell.top < box.top || cell.bottom > box.bottom) {
        rail.scrollTop += cell.top - box.top - (box.height - cell.height) / 2;
      }
    }
  }

  var lb = document.getElementById("lb");
  var lbImg = document.getElementById("lbImg");
  var lbNo = document.getElementById("lbNo");
  var lbT = document.getElementById("lbT");
  var lbA = document.getElementById("lbA");
  var lbP = document.getElementById("lbP");
  var lbX = document.getElementById("lbX");
  var opener = null;

  function paint() {
    var thumb = thumbs[at];
    var img = thumb.querySelector("img");
    lbImg.setAttribute("src", img.getAttribute("src"));
    lbImg.setAttribute("alt", img.getAttribute("alt"));
    lbNo.textContent = pad(at + 1) + " / " + pad(thumbs.length);
    lbT.textContent = thumb.dataset.t;
    lbA.textContent = thumb.dataset.a + " · " + thumb.dataset.l;
    lbP.setAttribute("href", thumb.dataset.p);
  }

  function open() {
    opener = document.activeElement;
    paint();
    lb.hidden = false;
    requestAnimationFrame(function () { lb.classList.add("is-open"); });
    lbX.focus();
  }

  function close() {
    lb.classList.remove("is-open");
    var seal = function () { lb.hidden = true; };
    if (calm.matches) { seal(); } else { setTimeout(seal, 260); }
    if (opener) { opener.focus(); opener = null; }
  }

  function ring() {
    return Array.prototype.slice.call(
      lb.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])')
    ).filter(function (el) { return el.offsetParent !== null; });
  }

  rail.addEventListener("click", function (ev) {
    var thumb = ev.target.closest(".thumb");
    if (!thumb) { return; }
    choose(thumbs.indexOf(thumb), false);
  });

  document.getElementById("expand").addEventListener("click", open);
  document.getElementById("lbPrev").addEventListener("click", function () { choose(at - 1, false); paint(); });
  document.getElementById("lbNext").addEventListener("click", function () { choose(at + 1, false); paint(); });
  lbX.addEventListener("click", close);
  lb.querySelector(".lb-veil").addEventListener("click", close);

  document.addEventListener("keydown", function (ev) {
    var here = thumbs.indexOf(document.activeElement);
    var inRail = here > -1;
    var step = 0;
    if (ev.key === "ArrowDown" || ev.key === "ArrowRight") { step = 1; }
    else if (ev.key === "ArrowUp" || ev.key === "ArrowLeft") { step = -1; }
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
      if (step) { ev.preventDefault(); choose(at + step, false); paint(); }
      else if (ev.key === "Home") { ev.preventDefault(); choose(0, false); paint(); }
      else if (ev.key === "End") { ev.preventDefault(); choose(thumbs.length - 1, false); paint(); }
      return;
    }
    if (!step && ev.key !== "Home" && ev.key !== "End") { return; }
    if (inRail) { ev.preventDefault(); choose(at + step, true); }
    else if (ev.key === "Home") { ev.preventDefault(); choose(0, false); }
    else if (ev.key === "End") { ev.preventDefault(); choose(thumbs.length - 1, false); }
  });

  function loop(now) {
    if (!t0) { t0 = now; }
    var s = (now - t0) / 1000;
    var pos = (s * 0.11) % 1;
    scan.style.transform = "translate3d(0," + (pos * 340 - 40).toFixed(2) + "%,0)";
    bandA.style.transform = "translate3d(" + (Math.sin(s * 0.16) * 3).toFixed(2) + "vw,0,0)";
    bandB.style.transform = "translate3d(" + (Math.cos(s * 0.11) * 5).toFixed(2) + "vw,0,0)";
    requestAnimationFrame(loop);
  }

  if (calm.matches) {
    scan.style.transform = "translate3d(0,90%,0)";
    bandA.style.transform = "translate3d(0,0,0)";
    bandB.style.transform = "translate3d(0,0,0)";
  } else {
    requestAnimationFrame(loop);
  }

  choose(0, false);
}());
