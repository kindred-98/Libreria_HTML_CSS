(function () {
  var stops = [
    { day: "14", mon: "August", name: "Red maple, Yahiko", note: "The first colour of the season is never on the ground. It arrives on the branch, on the side that has been in the sun all week, and it holds there for a day before anything else changes.", frame: "960 px wide", crop: "3 : 2, centre left", credit: "Aney, CC BY-SA 3.0" },
    { day: "02", mon: "September", name: "Talcott Mountain State Park", note: "A whole hillside turns at once because the trees are the same age and they were planted together. From a distance it reads as one colour, and only from close up does it become a thousand different ones.", frame: "960 px wide", crop: "16 : 9, upper half", credit: "Ragesoss, CC BY-SA 3.0" },
    { day: "19", mon: "September", name: "Oak leaf, Toulouse", note: "One leaf against a clean sky. By this point in the season the branch has already given up most of what it was holding, and the ones that are left are the ones that were always going to be the last.", frame: "960 px wide", crop: "3 : 2, centre", credit: "PierreSelim, CC BY-SA 3.0" },
    { day: "05", mon: "October", name: "Maples turning", note: "Red starting at the tip of each lobe and running backwards toward the stem. A leaf does not fade evenly; it fills from the edge in and the veins hold their colour longest.", frame: "960 px wide", crop: "3 : 2, upper half", credit: "PumpkinSky, CC BY-SA 3.0" },
    { day: "18", mon: "October", name: "Leaf fall, Vienna", note: "The season stops being a thing on trees and becomes a layer on the ground. The leaf is over by now; everything you can still photograph is the litter of it.", frame: "960 px wide", crop: "3 : 2, full frame", credit: "Florian Prischl, CC BY-SA 3.0" },
    { day: "01", mon: "November", name: "Aspen leaf", note: "Aspens go last and go fast. The leaf is blotched in two colours at once and the edges have already gone brown, so nothing about it is in one condition.", frame: "960 px wide", crop: "4 : 5, centre", credit: "Dmitry Makeev, CC BY-SA 3.0" },
    { day: "12", mon: "November", name: "Rowan, Sorbus aucuparia", note: "A compound leaf made of narrow leaflets, each one a slightly different red. These trees keep a few leaves right into December and hang on to them against the wind.", frame: "960 px wide", crop: "3 : 2, upper third", credit: "Dmitry Makeev, CC BY-SA 4.0" },
    { day: "26", mon: "November", name: "The avenue, Treptower Park", note: "Nothing left to fall. What is left is the structure, and the path under it is clearer than it was in August, because the leaves were always going to leave.", frame: "960 px wide", crop: "16 : 9, centre", credit: "Virtual-Pano, CC BY-SA 3.0" }
  ];

  var TOTAL = stops.length;
  var X = [60, 185, 311, 436, 562, 687, 813, 940];
  var Y0 = [56, 88, 122, 136, 166, 194, 218, 240];
  var VH = 320;

  var line = document.getElementById("line");
  var nodes = Array.prototype.slice.call(line.querySelectorAll(".node"));
  var curve = document.getElementById("curve");
  var shadow = document.getElementById("shadow");
  var wind = document.getElementById("wind");
  var windOut = document.getElementById("wind-out");
  var fill = document.getElementById("fill");
  var pct = document.getElementById("pct");
  var viewer = document.getElementById("viewer");
  var vImg = document.getElementById("v-img");
  var at = 0;
  var lastFocus = null;

  function pad(n) { return (n < 10 ? "0" : "") + n; }

  function yFor(i, drop) {
    var y = Y0[i] + drop * 0.42;
    return Math.max(8, Math.min(VH - 8, y));
  }

  function paint() {
    var drop = Number(wind.value);
    var d = "";
    for (var i = 0; i < TOTAL; i++) {
      d += (i === 0 ? "M" : "L") + X[i] + " " + yFor(i, drop).toFixed(1) + " ";
    }
    curve.setAttribute("d", d.trim());

    for (var k = 0; k < TOTAL; k++) {
      var y = yFor(k, drop);
      nodes[k].style.setProperty("--y", (y / VH * 100).toFixed(3) + "%");
      nodes[k].classList.toggle("is-on", k === at);
      nodes[k].classList.toggle("is-past", k < at);
      nodes[k].setAttribute("aria-current", k === at ? "true" : "false");
    }
    var here = yFor(at, drop) / VH;
    shadow.style.transform = "translateY(" + (here * 330).toFixed(1) + "px) scaleX(" + (0.2 + 0.8 * (X[at] / 1000)).toFixed(3) + ")";
    shadow.style.opacity = "0.9";

    var s = stops[at];
    document.getElementById("rDay").textContent = s.day;
    document.getElementById("rMon").textContent = s.mon;
    document.getElementById("rName").textContent = s.name;
    document.getElementById("rNote").textContent = s.note;
    document.getElementById("rFrame").textContent = s.frame;
    document.getElementById("rCrop").textContent = s.crop;
    document.getElementById("rPos").textContent = "node " + pad(at + 1) + " of " + pad(TOTAL);
    document.getElementById("rCredit").textContent = s.credit;

    var p = at / (TOTAL - 1);
    fill.style.transform = "scaleX(" + p.toFixed(3) + ")";
    pct.textContent = Math.round(p * 100) + "%";
    windOut.textContent = drop + "%";
  }

  function go(n) { at = Math.max(0, Math.min(TOTAL - 1, n)); paint(); }

  function fillPlate(n) {
    var s = stops[n];
    var img = nodes[n].querySelector("img");
    vImg.setAttribute("src", img.getAttribute("src"));
    vImg.setAttribute("alt", img.getAttribute("alt"));
    document.getElementById("v-no").textContent = s.day + " " + s.mon;
    document.getElementById("v-name").textContent = s.name;
    document.getElementById("v-note").textContent = s.note;
    document.getElementById("v-credit").textContent = s.credit;
    document.getElementById("v-count").textContent = pad(n + 1) + " / " + pad(TOTAL);
  }

  function openAt(n) {
    lastFocus = document.activeElement;
    at = n;
    paint();
    fillPlate(n);
    viewer.hidden = false;
    document.getElementById("v-close").focus();
  }

  function close() {
    viewer.hidden = true;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  nodes.forEach(function (b, i) { b.addEventListener("click", function () { go(i); }); });
  wind.addEventListener("input", paint);
  document.getElementById("back").addEventListener("click", function () { go(at - 1); });
  document.getElementById("fwd").addEventListener("click", function () { go(at + 1); });
  document.getElementById("open").addEventListener("click", function () { openAt(at); });
  document.getElementById("v-prev").addEventListener("click", function () { openAt((at - 1 + TOTAL) % TOTAL); });
  document.getElementById("v-next").addEventListener("click", function () { openAt((at + 1) % TOTAL); });
  document.getElementById("v-close").addEventListener("click", close);
  viewer.addEventListener("click", function (e) { if ("close" in e.target.dataset) close(); });

  line.addEventListener("keydown", function (e) {
    var k = e.key;
    if (k === "ArrowRight") go(at + 1);
    else if (k === "ArrowLeft") go(at - 1);
    else if (k === "ArrowUp" || k === "ArrowDown") {
      var v = Number(wind.value) + (k === "ArrowDown" ? 4 : -4);
      v = Math.max(0, Math.min(100, v));
      wind.value = String(v);
      paint();
    } else if (k === "Home") go(0);
    else if (k === "End") go(TOTAL - 1);
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

  paint();
})();
