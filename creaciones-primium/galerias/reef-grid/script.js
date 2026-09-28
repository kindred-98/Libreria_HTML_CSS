(function () {
  "use strict";

  var mosaic = document.getElementById("mosaic");
  var cells = Array.prototype.slice.call(mosaic.querySelectorAll(".cell"));
  var setBtns = Array.prototype.slice.call(document.querySelectorAll(".set__btn"));
  var note = document.querySelector(".set__note");
  var spot = document.getElementById("spot");
  var mark = document.getElementById("mark");
  var tube = document.querySelector(".gauge__tube");
  var readNo = document.getElementById("readNo");
  var readTitle = document.getElementById("readTitle");
  var readMeta = document.getElementById("readMeta");
  var readDepth = document.getElementById("readDepth");
  var viewer = document.getElementById("viewer");
  var vimg = document.getElementById("vimg");
  var vcap = document.getElementById("vcap");
  var vcount = document.getElementById("vcount");
  var names = ["one", "two", "three"];
  var settings = ["the crest", "the wall", "the shelf"];
  var setting = 0;
  var current = 0;
  var viewerOpen = false;
  var lastFocus = null;

  function depth(cell) {
    return Number(cell.getAttribute("data-depth"));
  }

  function place(cell) {
    var c = cell.getAttribute("data-c" + (setting + 1));
    var r = cell.getAttribute("data-r" + (setting + 1));
    cell.style.gridColumn = c;
    cell.style.gridRow = r;
    cell.style.setProperty("--k", cell.getAttribute("data-k"));
  }

  function readCap(cell) {
    var full = cell.querySelector(".cell__cap").textContent;
    var parts = full.split(" \u00b7 ");
    readNo.textContent = cell.querySelector(".cell__n").textContent;
    readTitle.textContent = parts[0];
    readMeta.textContent = parts.slice(1).join(" \u00b7 ");
    readDepth.textContent = depth(cell) + " m";
  }

  function moveMark(cell) {
    var h = tube.getBoundingClientRect().height;
    var max = 20;
    var t = Math.max(0, Math.min(1, (max - depth(cell)) / max));
    mark.style.transform = "translateY(" + (t * h) + "px)";
  }

  function setSpot(cell) {
    spot.textContent = "Spot " + cell.querySelector(".cell__n").textContent + " \u00b7 " + depth(cell) + " m";
  }

  function setFocus(i) {
    if (i < 0) i = cells.length - 1;
    if (i > cells.length - 1) i = 0;
    current = i;
    cells.forEach(function (c, n) { c.classList.toggle("is-on", n === i); });
    readCap(cells[i]);
    setSpot(cells[i]);
    moveMark(cells[i]);
  }

  function setSetting(n) {
    setting = n;
    setBtns.forEach(function (b, i) {
      var on = i === n;
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    note.childNodes[0].nodeValue = "Setting " + names[n] + " of three: " + settings[n] + ". ";
    cells.forEach(function (c) {
      c.classList.add("is-printing");
      place(c);
    });
    void mosaic.offsetWidth;
    cells.forEach(function (c) { c.classList.remove("is-printing"); });
    setFocus(current);
  }

  setBtns.forEach(function (btn, n) {
    btn.addEventListener("click", function () { setSetting(n); });
  });

  function walk(dir) {
    var a = cells[current].getBoundingClientRect();
    var acx = a.left + a.width / 2;
    var acy = a.top + a.height / 2;
    var best = -1;
    var bestScore = Infinity;
    cells.forEach(function (c, n) {
      if (n === current) return;
      var r = c.getBoundingClientRect();
      var cx = r.left + r.width / 2;
      var cy = r.top + r.height / 2;
      var along;
      var across;
      if (dir === 0) { if (cx <= acx + 6) return; along = cx - acx; across = Math.abs(cy - acy); }
      else if (dir === 1) { if (cx >= acx - 6) return; along = acx - cx; across = Math.abs(cy - acy); }
      else if (dir === 2) { if (cy <= acy + 6) return; along = cy - acy; across = Math.abs(cx - acx); }
      else { if (cy >= acy - 6) return; along = acy - cy; across = Math.abs(cx - acx); }
      var score = along + across * 1.6;
      if (score < bestScore) { bestScore = score; best = n; }
    });
    if (best === -1) return;
    setFocus(best);
  }

  function show(i) {
    var cell = cells[i];
    var img = cell.querySelector("img");
    vimg.setAttribute("src", img.getAttribute("src"));
    vimg.setAttribute("alt", img.getAttribute("alt"));
    vcap.textContent = cell.querySelector(".cell__n").textContent + " \u00b7 " + cell.querySelector(".cell__cap").textContent;
    vcount.textContent = cell.querySelector(".cell__n").textContent + " / " + (cells.length < 10 ? "0" : "") + cells.length;
  }

  function open(i) {
    lastFocus = document.activeElement;
    show(i);
    viewerOpen = true;
    viewer.removeAttribute("hidden");
    document.getElementById("vclose").focus();
  }

  function close() {
    viewerOpen = false;
    viewer.setAttribute("hidden", "");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function step(d) {
    var i = (current + d) % cells.length;
    if (i < 0) i += cells.length;
    setFocus(i);
    if (viewerOpen) show(i);
  }

  cells.forEach(function (cell, n) {
    cell.setAttribute("tabindex", "0");
    cell.addEventListener("click", function () {
      setFocus(n);
      open(n);
    });
    cell.addEventListener("focus", function () {
      if (current !== n) setFocus(n);
    });
  });

  document.addEventListener("keydown", function (e) {
    if (viewerOpen) {
      if (e.key === "Escape") { e.preventDefault(); close(); }
      else if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); step(1); }
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); step(-1); }
      else if (e.key === "Home") { e.preventDefault(); setFocus(0); show(0); }
      else if (e.key === "End") { e.preventDefault(); setFocus(cells.length - 1); show(cells.length - 1); }
      return;
    }
    if (e.key === "ArrowRight") { e.preventDefault(); walk(0); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); walk(1); }
    else if (e.key === "ArrowDown") { e.preventDefault(); walk(2); }
    else if (e.key === "ArrowUp") { e.preventDefault(); walk(3); }
    else if (e.key === "Home") { e.preventDefault(); setFocus(0); }
    else if (e.key === "End") { e.preventDefault(); setFocus(cells.length - 1); }
    else if (e.key === "Enter" && e.target.closest(".cell")) { e.preventDefault(); open(current); }
  });

  document.getElementById("vprev").addEventListener("click", function () { step(-1); });
  document.getElementById("vnext").addEventListener("click", function () { step(1); });
  document.getElementById("vclose").addEventListener("click", close);
  Array.prototype.forEach.call(viewer.querySelectorAll("[data-close]"), function (el) {
    el.addEventListener("click", close);
  });

  window.addEventListener("resize", function () { moveMark(cells[current]); });

  setSetting(0);
  cells.forEach(place);
  setFocus(0);
})();
