(function () {
  "use strict";

  var calm = window.matchMedia("(prefers-reduced-motion: reduce)");
  var track = document.getElementById("track");
  var stage = document.getElementById("stage");
  var slides = Array.prototype.slice.call(track.querySelectorAll(".slide"));
  var dotBtns = Array.prototype.slice.call(document.querySelectorAll("#dots button"));
  var count = document.getElementById("count");
  var tT = document.getElementById("tT");
  var tA = document.getElementById("tA");
  var tP = document.getElementById("tP");
  var blA = document.querySelector(".bl-a");
  var blB = document.querySelector(".bl-b");
  var blC = document.querySelector(".bl-c");

  var at = 0;
  var offset = 0;
  var dragging = false;
  var startX = 0;
  var timer = 0;
  var opener = null;
  var t0 = 0;

  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  function seat() {
    var first = slides[0].offsetLeft;
    var want = -(slides[at].offsetLeft - first) + offset;
    track.style.transform = "translate3d(" + want.toFixed(1) + "px,0,0)";
  }

  function paint() {
    slides.forEach(function (slide, k) { slide.classList.toggle("is-on", k === at); });
    dotBtns.forEach(function (btn, k) {
      btn.setAttribute("aria-current", k === at ? "true" : "false");
    });
    count.textContent = pad(at + 1) + " / " + pad(slides.length);
    tT.textContent = slides[at].dataset.t;
    tA.textContent = slides[at].dataset.a + " · " + slides[at].dataset.l;
    tP.setAttribute("href", slides[at].dataset.p);
  }

  function go(n) {
    at = (n + slides.length) % slides.length;
    offset = 0;
    paint();
    seat();
  }

  function hold() {
    if (timer) { window.clearInterval(timer); timer = 0; }
  }

  function glide() {
    hold();
    if (calm.matches) { return; }
    timer = window.setInterval(function () { go(at + 1); }, 5200);
  }

  var lb = document.getElementById("lb");
  var lbImg = document.getElementById("lbImg");
  var lbNo = document.getElementById("lbNo");
  var lbT = document.getElementById("lbT");
  var lbA = document.getElementById("lbA");
  var lbP = document.getElementById("lbP");
  var lbX = document.getElementById("lbX");

  function bigPaint() {
    var img = slides[at].querySelector("img");
    lbImg.setAttribute("src", img.getAttribute("src"));
    lbImg.setAttribute("alt", img.getAttribute("alt"));
    lbNo.textContent = pad(at + 1) + " / " + pad(slides.length);
    lbT.textContent = slides[at].dataset.t;
    lbA.textContent = slides[at].dataset.a + " · " + slides[at].dataset.l;
    lbP.setAttribute("href", slides[at].dataset.p);
  }

  function open() {
    opener = document.activeElement;
    bigPaint();
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

  document.getElementById("prev").addEventListener("click", function () { go(at - 1); glide(); });
  document.getElementById("next").addEventListener("click", function () { go(at + 1); glide(); });
  document.getElementById("look").addEventListener("click", open);
  document.getElementById("lbPrev").addEventListener("click", function () { go(at - 1); bigPaint(); });
  document.getElementById("lbNext").addEventListener("click", function () { go(at + 1); bigPaint(); });
  lbX.addEventListener("click", close);
  lb.querySelector(".lb-veil").addEventListener("click", close);

  dotBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      go(Number(btn.dataset.i));
      glide();
    });
  });

  stage.addEventListener("pointerenter", hold);
  stage.addEventListener("pointerleave", function () { if (!dragging) { glide(); } });
  track.addEventListener("focus", hold);
  track.addEventListener("blur", glide);

  track.addEventListener("pointerdown", function (ev) {
    if (ev.pointerType === "mouse" && ev.button !== 0) { return; }
    dragging = true;
    startX = ev.clientX;
    offset = 0;
    track.classList.add("is-drag");
    hold();
    if (track.setPointerCapture) { track.setPointerCapture(ev.pointerId); }
  });

  track.addEventListener("pointermove", function (ev) {
    if (!dragging) { return; }
    offset = ev.clientX - startX;
    seat();
  });

  function drop() {
    if (!dragging) { return; }
    dragging = false;
    track.classList.remove("is-drag");
    var shift = offset;
    offset = 0;
    if (shift < -46) { go(at + 1); }
    else if (shift > 46) { go(at - 1); }
    else { seat(); }
    glide();
  }

  track.addEventListener("pointerup", drop);
  track.addEventListener("pointercancel", drop);

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
      if (ev.key === "ArrowRight") { ev.preventDefault(); go(at + 1); bigPaint(); }
      else if (ev.key === "ArrowLeft") { ev.preventDefault(); go(at - 1); bigPaint(); }
      else if (ev.key === "Home") { ev.preventDefault(); go(0); bigPaint(); }
      else if (ev.key === "End") { ev.preventDefault(); go(slides.length - 1); bigPaint(); }
      return;
    }
    if (ev.key === "ArrowRight") { ev.preventDefault(); go(at + 1); glide(); }
    else if (ev.key === "ArrowLeft") { ev.preventDefault(); go(at - 1); glide(); }
    else if (ev.key === "Home") { ev.preventDefault(); go(0); glide(); }
    else if (ev.key === "End") { ev.preventDefault(); go(slides.length - 1); glide(); }
  });

  window.addEventListener("resize", seat);

  function loop(now) {
    if (!t0) { t0 = now; }
    var s = (now - t0) / 1000;
    blA.style.transform = "translate3d(" + (Math.sin(s * 0.13) * 5).toFixed(2) + "vw," + (Math.cos(s * 0.1) * 4).toFixed(2) + "vh,0)";
    blB.style.transform = "translate3d(" + (Math.cos(s * 0.096) * 6).toFixed(2) + "vw," + (Math.sin(s * 0.12) * 5).toFixed(2) + "vh,0)";
    blC.style.transform = "translate3d(" + (Math.sin(s * 0.077) * 4).toFixed(2) + "vw," + (Math.cos(s * 0.09) * 3).toFixed(2) + "vh,0)";
    requestAnimationFrame(loop);
  }

  if (calm.matches) {
    blA.style.transform = "translate3d(1vw,0,0)";
    blB.style.transform = "translate3d(-1vw,1vh,0)";
    blC.style.transform = "translate3d(0,-1vh,0)";
  } else {
    requestAnimationFrame(loop);
  }

  slides.forEach(function (s) {
    var im = s.querySelector("img");
    if (im) { im.loading = "eager"; }
  });

  go(0);
  glide();
}());
