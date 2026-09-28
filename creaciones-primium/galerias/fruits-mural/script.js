(function () {
  "use strict";

  var calm = window.matchMedia("(prefers-reduced-motion: reduce)");
  var tracks = Array.prototype.slice.call(document.querySelectorAll(".tk-track"));
  var grain = document.querySelector(".grain");
  var blocks = Array.prototype.slice.call(document.querySelectorAll(".photo"));
  var hits = Array.prototype.slice.call(document.querySelectorAll(".hit"));

  var lanes = [];
  var at = 0;
  var opener = null;
  var t0 = 0;
  var pending = false;
  var scrollY = 0;

  function makeLane(track) {
    var set = document.createElement("div");
    set.className = "tk-set";
    while (track.firstChild) { set.appendChild(track.firstChild); }
    track.appendChild(set);
    var need = window.innerWidth * 2 + 260;
    var guard = 0;
    while (track.getBoundingClientRect().width < need && guard < 12) {
      track.appendChild(set.cloneNode(true));
      guard += 1;
    }
    return { track: track, x: 0, period: Math.round(set.getBoundingClientRect().width) + 34 };
  }

  var lb = document.getElementById("lb");
  var lbImg = document.getElementById("lbImg");
  var lbNo = document.getElementById("lbNo");
  var lbT = document.getElementById("lbT");
  var lbA = document.getElementById("lbA");
  var lbP = document.getElementById("lbP");
  var lbX = document.getElementById("lbX");

  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  function paint() {
    var hit = hits[at];
    var img = hit.querySelector("img");
    lbImg.setAttribute("src", img.getAttribute("src"));
    lbImg.setAttribute("alt", img.getAttribute("alt"));
    lbNo.textContent = pad(at + 1) + " / " + pad(hits.length);
    lbT.textContent = hit.dataset.t;
    lbA.textContent = hit.dataset.a + " · " + hit.dataset.l;
    lbP.setAttribute("href", hit.dataset.p);
  }

  function open(n, from) {
    at = (n + hits.length) % hits.length;
    opener = from || null;
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

  var mural = document.getElementById("mural");

  mural.addEventListener("click", function (ev) {
    var hit = ev.target.closest(".hit");
    if (!hit) { return; }
    open(hits.indexOf(hit), hit);
  });

  document.getElementById("lbPrev").addEventListener("click", function () { open(at - 1, null); });
  document.getElementById("lbNext").addEventListener("click", function () { open(at + 1, null); });
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
      if (ev.key === "ArrowRight") { ev.preventDefault(); open(at + 1, null); }
      else if (ev.key === "ArrowLeft") { ev.preventDefault(); open(at - 1, null); }
      else if (ev.key === "Home") { ev.preventDefault(); open(0, null); }
      else if (ev.key === "End") { ev.preventDefault(); open(hits.length - 1, null); }
      return;
    }
    var here = hits.indexOf(document.activeElement);
    if (here < 0) { return; }
    if (ev.key === "ArrowRight") { ev.preventDefault(); hits[Math.min(here + 1, hits.length - 1)].focus(); }
    else if (ev.key === "ArrowLeft") { ev.preventDefault(); hits[Math.max(here - 1, 0)].focus(); }
    else if (ev.key === "Home") { ev.preventDefault(); hits[0].focus(); }
    else if (ev.key === "End") { ev.preventDefault(); hits[hits.length - 1].focus(); }
  });

  function drift() {
    pending = false;
    var vh = window.innerHeight || 800;
    blocks.forEach(function (box) {
      var r = box.getBoundingClientRect();
      var mid = (r.top + r.height / 2 - vh / 2) / vh;
      var shift = Math.max(-1, Math.min(1, mid)) * 26;
      box.style.transform = "translate3d(0," + shift.toFixed(2) + "px,0)";
    });
  }

  window.addEventListener("scroll", function () {
    scrollY = window.pageYOffset;
    if (!pending) { pending = true; requestAnimationFrame(drift); }
  }, { passive: true });

  window.addEventListener("resize", function () {
    lanes.forEach(function (lane) {
      var set = lane.track.firstElementChild;
      lane.period = Math.round(set.getBoundingClientRect().width) + 34;
    });
    drift();
  });

  function loop(now) {
    if (!t0) { t0 = now; }
    var dt = Math.min(48, now - (loop.last || now));
    loop.last = now;
    lanes.forEach(function (lane) {
      if (lane.period > 0) {
        lane.x = (lane.x + dt * 0.042) % lane.period;
        lane.track.style.transform = "translate3d(" + (-lane.x).toFixed(2) + "px,0,0)";
      }
    });
    var s = (now - t0) / 1000;
    grain.style.transform = "translate3d(" + (Math.sin(s * 0.07) * 1.2).toFixed(2) + "%," + (Math.cos(s * 0.053) * 1).toFixed(2) + "%,0)";
    requestAnimationFrame(loop);
  }

  tracks.forEach(function (track) { lanes.push(makeLane(track)); });
  drift();
  paint();

  if (calm.matches) {
    grain.style.transform = "translate3d(0,0,0)";
    lanes.forEach(function (lane) { lane.track.style.transform = "translate3d(0,0,0)"; });
    scrollY = 0;
  } else {
    requestAnimationFrame(loop);
  }
}());
