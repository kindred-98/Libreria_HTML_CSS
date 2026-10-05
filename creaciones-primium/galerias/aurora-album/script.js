(function () {
  var MARKS = ["Leaf I", "Leaf II", "Leaf III", "Leaf IV"];
  var TITLES = ["The Station", "The Curtain", "The Dome", "The Watcher"];

  var deck = document.getElementById("deck");
  var leaf = Array.prototype.slice.call(deck.querySelectorAll(".leaf"));
  var toc = Array.prototype.slice.call(document.querySelectorAll(".toc__i"));
  var viewer = document.getElementById("viewer");
  var spread = document.getElementById("spread");
  var pages = Array.prototype.slice.call(spread.querySelectorAll(".page"));
  var vMark = document.getElementById("vMark");
  var at = 0;
  var open = false;
  var lastFocus = null;

  function paint() {
    for (var k = 0; k < leaf.length; k++) {
      leaf[k].classList.toggle("is-on", k === at);
      leaf[k].setAttribute("aria-current", k === at ? "true" : "false");
      toc[k].classList.toggle("is-on", k === at);
      toc[k].setAttribute("aria-current", k === at ? "true" : "false");
    }
    document.getElementById("vCount").textContent = MARKS[at] + " \u00b7 " + (at + 1) + " of " + leaf.length;
    if (open) layout();
  }

  function layout() {
    var r = leaf[at].getBoundingClientRect();
    var ox = ((r.left + r.width / 2) / window.innerWidth) * 100;
    var oy = ((r.top + r.height / 2) / window.innerHeight) * 100;
    spread.style.setProperty("--ox", ox.toFixed(2) + "%");
    spread.style.setProperty("--oy", oy.toFixed(2) + "%");
    spread.style.setProperty("--s", "0.14");
    spread.style.setProperty("--tx", "0px");
    spread.style.setProperty("--ty", "0px");
    spread.getBoundingClientRect();
    spread.style.setProperty("--s", "1");
  }

  function show(n) {
    for (var k = 0; k < pages.length; k++) {
      pages[k].style.display = (k === n * 2 || k === n * 2 + 1) ? "flex" : "none";
    }
    vMark.textContent = MARKS[n] + " \u00b7 " + TITLES[n];
  }

  function go(n) {
    at = ((n % leaf.length) + leaf.length) % leaf.length;
    paint();
    if (open) show(at);
  }

  function openAlbum() {
    lastFocus = document.activeElement;
    show(at);
    viewer.hidden = false;
    open = true;
    document.getElementById("vClose").focus();
    layout();
  }

  function closeAlbum() {
    viewer.hidden = true;
    open = false;
    for (var page of pages) page.style.display = "none";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  leaf.forEach(function (b, i) { b.addEventListener("click", openAlbum); });
  toc.forEach(function (b, i) { b.addEventListener("click", function () { go(i); }); });
  document.getElementById("back").addEventListener("click", function () { go(at - 1); });
  document.getElementById("fwd").addEventListener("click", function () { go(at + 1); });
  document.getElementById("open").addEventListener("click", openAlbum);
  document.getElementById("vPrev").addEventListener("click", function () { go(at - 1); });
  document.getElementById("vNext").addEventListener("click", function () { go(at + 1); });
  document.getElementById("vClose").addEventListener("click", closeAlbum);
  viewer.addEventListener("click", function (e) { if ("close" in e.target.dataset) closeAlbum(); });

  window.addEventListener("resize", function () { if (open) layout(); });

  document.addEventListener("keydown", function (e) {
    if (open) {
      if (e.key === "Escape") closeAlbum();
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") go(at - 1);
      else if (e.key === "ArrowRight" || e.key === "ArrowDown") go(at + 1);
      else if (e.key === "Home") go(0);
      else if (e.key === "End") go(leaf.length - 1);
      else return;
      e.preventDefault();
      return;
    }
    var k = e.key;
    if (k === "ArrowLeft" || k === "ArrowUp") go(at - 1);
    else if (k === "ArrowRight" || k === "ArrowDown") go(at + 1);
    else if (k === "Home") go(0);
    else if (k === "End") go(leaf.length - 1);
    else if (k === "Enter" || k === " ") {
      if (document.activeElement && document.activeElement.tagName === "BUTTON" && !document.activeElement.classList.contains("leaf")) return;
      openAlbum();
    } else return;
    e.preventDefault();
  });

  paint();
})();
