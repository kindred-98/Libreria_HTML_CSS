(function () {
  var panels = [
    { name: "Milky Way over the ridge", note: "The first panel of the atlas and the reason the strip exists. Everything above the ridge is galaxy; the ridge is the only thing in the frame that does not move.", credit: "ForestWander, CC BY-SA 3.0" },
    { name: "Star trails over pines", note: "A long exposure turned the sky into circles around a point that is not in the picture. The trees at the bottom are the only reliable way to hold the frame still.", credit: "steve lyon, CC BY-SA 2.0" },
    { name: "Branch against the stars", note: "A dead branch in front of a very dense field. The branch is closer to the camera than anything else in the atlas and the only thing in it that is not far away.", credit: "epSos.de, CC BY 2.0" },
    { name: "Yepun and the Milky Way", note: "An observatory dome under the galactic plane, with the band of the galaxy passing directly over the slit. The building is doing the same job the panel is.", credit: "ESO and J. Colosimo, CC BY 4.0" },
    { name: "Arch under the band", note: "A natural arch with the band of the galaxy showing through the opening. The shape is luck; the fact that anybody was there at that hour was not.", credit: "PiConsti, CC BY-SA 2.0" },
    { name: "Green glow over the fence", note: "The one panel in the atlas that is not the Milky Way at all. A green night glow above a line of fence posts, and the fence is what gives the sky its size.", credit: "Guillaume, CC0" },
    { name: "Laser guide into the sky", note: "A guide beam leaving a telescope and going straight up out of the frame. It is the only line in the atlas that was drawn on purpose.", credit: "ESO and Yuri Beletsky, CC BY 4.0" },
    { name: "Milky Way over conifers", note: "The last panel, and the same job as the first one from the other side of the year. Close the strip and you are back where you started.", credit: "W.carter, CC0" }
  ];

  var TOTAL = panels.length;
  var FOLD = 68;
  var strip = document.getElementById("strip");
  var tiles = Array.prototype.slice.call(document.querySelectorAll(".panel"));
  var stars = document.querySelector(".stars");
  var gauge = document.getElementById("gauge");
  var stateEl = document.getElementById("state");
  var fold = document.getElementById("fold");
  var viewer = document.getElementById("viewer");
  var vImg = document.getElementById("v-img");
  var at = 0;
  var progress = 0;
  var lastFocus = null;

  function pad(n) { return (n < 10 ? "0" : "") + n; }

  function openness(i) {
    var v = (progress * (TOTAL + 1.5) - i) / 1.5;
    return Math.max(0, Math.min(1, v));
  }

  function paint() {
    var open = 0;
    var pw = tiles[0].offsetWidth || 126;
    for (var i = 0; i < TOTAL; i++) {
      var p = openness(i);
      var sign = i % 2 === 0 ? 1 : -1;
      var ang = (1 - p) * FOLD * sign;
      var tile = tiles[i];
      tile.style.transform = "translateX(" + (i * pw) + "px) rotateY(" + ang.toFixed(2) + "deg)";
      tile.style.zIndex = String(i + 1);
      tile.classList.toggle("is-open", p > 0.985);
      tile.classList.toggle("is-on", i === at);
      tile.setAttribute("aria-current", i === at ? "true" : "false");
      if (p > 0.985) open++;
    }
    gauge.style.transform = "scaleX(" + (open / TOTAL).toFixed(3) + ")";
    stateEl.textContent = (open === 0 ? "Folded" : open === TOTAL ? "Open" : "Part open") + " \u00b7 " + open + " of " + TOTAL + " panels flat";
    fold.setAttribute("aria-pressed", open === 0 ? "true" : "false");
    fold.textContent = open === 0 ? "Unfold the strip" : "Fold the strip";

    var w = tiles[at].offsetWidth;
    var frame = document.getElementById("frame");
    stars.style.transform = "translateX(" + (at * w + frame.scrollLeft) + "px)";
    stars.classList.toggle("is-on", open === TOTAL);

    var p = panels[at];
    document.getElementById("rNo").textContent = "Panel " + pad(at + 1) + " of " + pad(TOTAL);
    document.getElementById("rName").textContent = p.name;
    document.getElementById("rNote").textContent = p.note;
    document.getElementById("rCredit").textContent = p.credit;
  }

  function setProgress(v) { progress = Math.max(0, Math.min(1, v)); paint(); }

  function go(n, open) {
    at = Math.max(0, Math.min(TOTAL - 1, n));
    if (open) {
      var need = (at + 1.5) / (TOTAL + 1.5);
      if (progress < need) setProgress(need); else paint();
    } else {
      paint();
    }
  }

  function fill(n) {
    var p = panels[n];
    var img = tiles[n].querySelector("img");
    vImg.setAttribute("src", img.getAttribute("src"));
    vImg.setAttribute("alt", img.getAttribute("alt"));
    document.getElementById("v-no").textContent = "Panel " + pad(n + 1) + " of " + pad(TOTAL);
    document.getElementById("v-name").textContent = p.name;
    document.getElementById("v-note").textContent = p.note;
    document.getElementById("v-credit").textContent = p.credit;
    document.getElementById("v-count").textContent = pad(n + 1) + " / " + pad(TOTAL);
  }

  function openAt(n) {
    lastFocus = document.activeElement;
    go(n, true);
    fill(n);
    viewer.hidden = false;
    document.getElementById("v-close").focus();
  }

  function close() {
    viewer.hidden = true;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  tiles.forEach(function (b, i) { b.addEventListener("click", function () { go(i, true); }); });
  fold.addEventListener("click", function () { setProgress(progress > 0.01 ? 0 : 1); });
  document.getElementById("back").addEventListener("click", function () { go(at - 1, true); });
  document.getElementById("fwd").addEventListener("click", function () { go(at + 1, true); });
  document.getElementById("open").addEventListener("click", function () { openAt(at); });
  document.getElementById("v-prev").addEventListener("click", function () { openAt((at - 1 + TOTAL) % TOTAL); });
  document.getElementById("v-next").addEventListener("click", function () { openAt((at + 1) % TOTAL); });
  document.getElementById("v-close").addEventListener("click", close);
  viewer.addEventListener("click", function (e) { if (e.target.hasAttribute("data-close")) close(); });

  strip.addEventListener("keydown", function (e) {
    var k = e.key;
    if (k === "ArrowRight") go(at + 1, true);
    else if (k === "ArrowLeft") go(at - 1, true);
    else if (k === "Home") setProgress(0);
    else if (k === "End") setProgress(1);
    else if (k === "Enter" || k === " ") openAt(at);
    else return;
    e.preventDefault();
  });

  document.addEventListener("keydown", function (e) {
    if (viewer.hidden) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") openAt((at - 1 + TOTAL) % TOTAL);
    else if (e.key === "ArrowRight") openAt((at + 1) % TOTAL);
    else if (e.key === "Home") openAt(0);
    else if (e.key === "End") openAt(TOTAL - 1);
    else return;
    e.preventDefault();
  });

  window.addEventListener("resize", paint);
  document.getElementById("frame").addEventListener("scroll", paint);
  paint();
  setProgress(1);
})();
