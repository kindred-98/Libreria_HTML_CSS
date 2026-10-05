(function () {
  "use strict";

  var calm = window.matchMedia("(prefers-reduced-motion: reduce)");
  var frame = document.getElementById("frame");
  var slides = Array.prototype.slice.call(frame.querySelectorAll(".sl"));
  var beam = document.getElementById("beam");
  var badge = document.getElementById("badge");
  var capT = document.getElementById("capT");
  var capA = document.getElementById("capA");
  var capL = document.getElementById("capL");
  var capP = document.getElementById("capP");
  var tally = document.getElementById("tally");
  var rail = document.getElementById("rail");
  var railBtns = Array.prototype.slice.call(rail.querySelectorAll("button"));

  var at = 0;
  var busy = false;
  var timer = 0;
  var opener = null;
  var t0 = 0;

  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  function paint() {
    var sl = slides[at];
    badge.textContent = pad(at + 1);
    capT.textContent = sl.dataset.t;
    capA.textContent = sl.dataset.a;
    capL.textContent = sl.dataset.l;
    capP.setAttribute("href", sl.dataset.p);
    tally.textContent = pad(at + 1) + " / " + pad(slides.length);
    railBtns.forEach(function (btn, k) {
      btn.setAttribute("aria-current", k === at ? "true" : "false");
    });
  }

  function turn(n) {
    if (busy) { return; }
    var to = (n + slides.length) % slides.length;
    if (to === at) { return; }
    busy = true;
    var from = slides[at];
    var toSl = slides[to];
    toSl.classList.add("is-on", "turn");
    toSl.getBoundingClientRect();
    at = to;
    paint();
    var settle = function () {
      from.classList.remove("is-on");
      toSl.classList.remove("turn");
      busy = false;
    };
    if (calm.matches) { settle(); } else { window.setTimeout(settle, 600); }
  }

  function hold() {
    if (timer) { window.clearInterval(timer); timer = 0; }
  }

  function glide() {
    hold();
    if (calm.matches) { return; }
    timer = window.setInterval(function () { turn(at + 1); }, 6000);
  }

  var lb = document.getElementById("lb");
  var lbImg = document.getElementById("lbImg");
  var lbNo = document.getElementById("lbNo");
  var lbT = document.getElementById("lbT");
  var lbA = document.getElementById("lbA");
  var lbP = document.getElementById("lbP");
  var lbX = document.getElementById("lbX");

  function open() {
    opener = document.activeElement;
    var sl = slides[at];
    lbImg.setAttribute("src", sl.getAttribute("src"));
    lbImg.setAttribute("alt", sl.getAttribute("alt"));
    lbNo.textContent = pad(at + 1) + " / " + pad(slides.length);
    lbT.textContent = sl.dataset.t;
    lbA.textContent = sl.dataset.a + " · " + sl.dataset.l;
    lbP.setAttribute("href", sl.dataset.p);
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
    glide();
  }

  function ring() {
    return Array.prototype.slice.call(
      lb.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])')
    ).filter(function (el) { return el.offsetParent !== null; });
  }

  function step(d) {
    turn(at + d);
    glide();
  }

  document.getElementById("prev").addEventListener("click", function () { step(-1); });
  document.getElementById("next").addEventListener("click", function () { step(1); });
  document.getElementById("lbPrev").addEventListener("click", function () { turn(at - 1); });
  document.getElementById("lbNext").addEventListener("click", function () { turn(at + 1); });
  lbX.addEventListener("click", close);
  lb.querySelector(".lb-veil").addEventListener("click", close);

  railBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      turn(Number(btn.dataset.i));
      glide();
    });
  });

  frame.addEventListener("dblclick", open);
  frame.addEventListener("pointerenter", hold);
  frame.addEventListener("pointerleave", glide);
  rail.addEventListener("focusin", hold);
  rail.addEventListener("focusout", glide);

  document.addEventListener("keydown", function (ev) {
    if (ev.key === "Enter" && document.activeElement === frame) { ev.preventDefault(); open(); return; }
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
      if (ev.key === "ArrowRight") { ev.preventDefault(); turn(at + 1); }
      else if (ev.key === "ArrowLeft") { ev.preventDefault(); turn(at - 1); }
      else if (ev.key === "Home") { ev.preventDefault(); turn(0); }
      else if (ev.key === "End") { ev.preventDefault(); turn(slides.length - 1); }
      return;
    }
    if (ev.key === "ArrowRight") { ev.preventDefault(); step(1); }
    else if (ev.key === "ArrowLeft") { ev.preventDefault(); step(-1); }
    else if (ev.key === "Home") { ev.preventDefault(); turn(0); glide(); }
    else if (ev.key === "End") { ev.preventDefault(); turn(slides.length - 1); glide(); }
  });

  function loop(now) {
    if (!t0) { t0 = now; }
    var s = (now - t0) / 1000;
    var pos = (s * 0.14) % 1;
    beam.style.transform = "translate3d(" + (pos * 400 - 60).toFixed(2) + "%,0,0)";
    requestAnimationFrame(loop);
  }

  if (calm.matches) {
    beam.style.transform = "translate3d(160%,0,0)";
  } else {
    requestAnimationFrame(loop);
  }

  paint();
  glide();
}());
