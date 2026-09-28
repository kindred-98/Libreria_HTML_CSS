(function () {
  "use strict";

  var screen = document.getElementById("screen");
  var walk = document.getElementById("walk");
  var read = document.getElementById("walk-read");
  var stops = Array.prototype.slice.call(walk.querySelectorAll(".stop"));
  var mist = document.getElementById("mist");
  var mistOut = document.getElementById("mist-out");
  var clock = document.getElementById("clock");
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tabs__btn"));
  var ink = document.querySelector(".tabs__ink");
  var current = 0;

  function data(el) {
    return {
      src: el.querySelector("img").getAttribute("src"),
      alt: el.querySelector("img").getAttribute("alt"),
      cap: el.querySelector(".stop__cap b").textContent,
      no: el.querySelector(".stop__no").textContent
    };
  }

  function setStop(i, focus) {
    if (i < 0) i = 0;
    if (i > stops.length - 1) i = stops.length - 1;
    current = i;
    stops.forEach(function (s, n) {
      var on = n === i;
      s.classList.toggle("is-on", on);
      s.setAttribute("aria-pressed", on ? "true" : "false");
    });
    var d = data(stops[i]);
    read.textContent = "Stop " + d.no + " of " + (stops.length < 10 ? "0" : "") + stops.length + " \u00b7 " + d.cap;
    if (focus) stops[i].focus();
  }

  stops.forEach(function (s, n) {
    s.addEventListener("click", function () {
      setStop(n, false);
    });
    s.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        setStop(n, false);
        open(n);
      }
    });
  });

  walk.addEventListener("keydown", function (e) {
    var k = e.key;
    var next = null;
    if (k === "ArrowRight" || k === "ArrowDown") next = Math.min(current + (k === "ArrowDown" ? 3 : 1), stops.length - 1);
    else if (k === "ArrowLeft" || k === "ArrowUp") next = Math.max(current - (k === "ArrowUp" ? 3 : 1), 0);
    else if (k === "Home") next = 0;
    else if (k === "End") next = stops.length - 1;
    if (next === null) return;
    e.preventDefault();
    setStop(next, true);
  });

  function applyMist() {
    var v = Number(mist.value);
    screen.style.setProperty("--mist", v);
    mistOut.textContent = v + "% haze";
    mist.setAttribute("aria-valuetext", v + " percent haze on the trail");
  }

  mist.addEventListener("input", applyMist);
  applyMist();

  function showTab(idx) {
    tabs.forEach(function (t, n) {
      var on = n === idx;
      t.classList.toggle("is-on", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute("aria-controls"));
      panel.classList.toggle("is-out", !on);
      if (on) panel.removeAttribute("hidden");
      else panel.setAttribute("hidden", "");
    });
    ink.style.width = tabs[idx].offsetWidth + "px";
    ink.style.transform = "translateX(" + tabs[idx].offsetLeft + "px)";
  }

  tabs.forEach(function (t, n) {
    t.addEventListener("click", function () {
      showTab(n);
    });
    t.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        var next = e.key === "ArrowRight" ? (n + 1) % tabs.length : (n - 1 + tabs.length) % tabs.length;
        showTab(next);
        tabs[next].focus();
      }
    });
  });
  showTab(0);
  window.addEventListener("resize", function () {
    showTab(tabs.findIndex(function (t) { return t.getAttribute("aria-selected") === "true"; }));
  });

  var viewer = document.getElementById("viewer");
  var vimg = document.getElementById("vimg");
  var vcap = document.getElementById("vcap");
  var vcount = document.getElementById("vcount");
  var lastFocus = null;

  function open(i) {
    var d = data(stops[i]);
    lastFocus = stops[i];
    vimg.setAttribute("src", d.src);
    vimg.setAttribute("alt", d.alt);
    vcap.textContent = d.no + " \u00b7 " + d.cap;
    vcount.textContent = d.no + " / 0" + stops.length;
    viewer.removeAttribute("hidden");
    document.getElementById("vclose").focus();
  }

  function close() {
    viewer.setAttribute("hidden", "");
    if (lastFocus) lastFocus.focus();
  }

  function step(dir) {
    var i = current + dir;
    if (i < 0) i = stops.length - 1;
    if (i > stops.length - 1) i = 0;
    setStop(i, false);
    open(i);
  }

  walk.addEventListener("dblclick", function () {
    open(current);
  });

  document.addEventListener("keydown", function (e) {
    if (viewer.hasAttribute("hidden")) {
      if (e.key === "Enter" && document.activeElement === walk) {
        e.preventDefault();
        open(current);
      }
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      step(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      step(-1);
    } else if (e.key === "Home") {
      e.preventDefault();
      setStop(0, false);
      open(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setStop(stops.length - 1, false);
      open(stops.length - 1);
    }
  });

  document.getElementById("vprev").addEventListener("click", function () { step(-1); });
  document.getElementById("vnext").addEventListener("click", function () { step(1); });
  document.getElementById("vclose").addEventListener("click", close);
  Array.prototype.forEach.call(viewer.querySelectorAll("[data-close]"), function (el) {
    el.addEventListener("click", close);
  });

  function tick() {
    var d = new Date();
    var mins = d.getHours() * 60 + d.getMinutes();
    var lit = 360 + Math.round((mins - 300) / 720 * 300);
    var h = Math.floor(lit / 60) % 24;
    var m = lit % 60;
    clock.textContent = (h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m;
  }
  tick();
  setInterval(tick, 20000);
})();
