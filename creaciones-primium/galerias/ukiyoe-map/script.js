(function () {
  var wards = [
    { ward: "Yoshiwara", print: "Street signs, Kabukicho", title: "A wall of signs", note: "The licensed quarter, printed here as a wall of signs. A map of this kind was sold folded, and it is worth remembering that every one of these streets was drawn from a report and not from a survey.", credit: "Wikimedia Commons contributors, public domain", x: 34, y: 44 },
    { ward: "Kanda", print: "Horse racing, sinobazunoike", title: "A race with a stand", note: "Printed as a crowd in tiers, which is how a map of this town records density: the more people stacked in a picture, the more of them there are in that district.", credit: "Toyohara Chikanobu, public domain", x: 62, y: 40 },
    { ward: "Nihonbashi", print: "Red gate in shallow water", title: "A gate standing in water", note: "The river is the only line on this sheet that is accurate to scale, because the bridges over it were the one thing every report agreed about.", credit: "Rawpixel, CC BY-SA 4.0", x: 44, y: 58 },
    { ward: "Ginza", print: "Actor against a wave", title: "One face, one wave", note: "A ward drawn from a single portrait. On a real sheet of this kind the largest buildings were shown largest, which is why the map is really a diagram of importance.", credit: "The San Diego Museum of Art, public domain", x: 50, y: 50 },
    { ward: "Shiba", print: "A print album on a mat", title: "The block, not the street", note: "A ward cut from a photograph of a print being made rather than from the print itself, which is the only honest way to say that the map was assembled by hand.", credit: "David Monniaux, CC BY-SA 3.0", x: 48, y: 46 },
    { ward: "Yurakucho", print: "Waterfall between cliffs", title: "A cliff and a fall", note: "The only vertical subject on the whole sheet, standing in for a flat district. The engraver needed one thing that read as height, so the map has one.", credit: "Rawpixel, CC BY-SA 4.0", x: 52, y: 52 },
    { ward: "Asakusa", print: "Procession in the snow", title: "A procession on a road", note: "A road drawn as a procession, which is how a traveller would have met it: not as a line on a plan but as people arriving in order.", credit: "urbzoo, CC BY 2.0", x: 40, y: 56 },
    { ward: "Shinagawa", print: "Children and animals", title: "Children with animals", note: "The last ward on the sheet and the one furthest from the centre, cut from a print that has nothing to do with the town at all.", credit: "Daderot, public domain", x: 46, y: 48 }
  ];

  var ROW = [0, 0, 0, 0, 1, 1, 1, 1];
  var TOTAL = wards.length;
  var plan = document.getElementById("plan");
  var cuts = Array.prototype.slice.call(plan.querySelectorAll(".ward"));
  var lantern = document.getElementById("lantern");
  var banner = document.getElementById("banner");
  var viewer = document.getElementById("viewer");
  var vImg = document.getElementById("v-img");
  var at = 0;
  var lastFocus = null;

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function centre(el) {
    var x = Number.parseFloat(el.style.getPropertyValue("--c"));
    var y = Number.parseFloat(el.style.getPropertyValue("--t"));
    return { x: x, y: y };
  }

  function paint() {
    for (var i = 0; i < TOTAL; i++) {
      cuts[i].classList.toggle("is-on", i === at);
      cuts[i].setAttribute("aria-current", i === at ? "true" : "false");
    }
    var c = centre(cuts[at]);
    var pw = plan.clientWidth;
    var ph = plan.clientHeight;
    var px = c.x / 100 * pw;
    var py = c.y / 100 * ph;
    lantern.style.transform = "translate3d(" + px.toFixed(1) + "px," + py.toFixed(1) + "px,0)";
    banner.style.transform = "translate3d(" + (px + 78).toFixed(1) + "px," + (py + (ROW[at] === 0 ? 66 : -158)).toFixed(1) + "px,0)";
    document.getElementById("bName").textContent = wards[at].ward;
    document.getElementById("bTitle").textContent = wards[at].title;

    var w = wards[at];
    document.getElementById("rNo").textContent = "Ward " + pad(at + 1) + " of " + pad(TOTAL);
    document.getElementById("rName").textContent = w.ward;
    document.getElementById("rNote").textContent = w.note;
    document.getElementById("rPrint").textContent = w.print;
    document.getElementById("rSheet").textContent = "3 of 7";
    document.getElementById("rMark").textContent = "hot, " + w.x + "% across";
    document.getElementById("rCredit").textContent = w.credit;
  }

  function step(dx, dy) {
    var from = centre(cuts[at]);
    var best = -1;
    var bestScore = Infinity;
    for (var i = 0; i < TOTAL; i++) {
      if (i === at) continue;
      var c = centre(cuts[i]);
      var vx = c.x - from.x;
      var vy = c.y - from.y;
      var along = vx * dx + vy * dy;
      if (along <= 4) continue;
      var across = Math.abs(vx * dy - vy * dx);
      var score = along + across * 2.2;
      if (score < bestScore) { bestScore = score; best = i; }
    }
    if (best >= 0) { at = best; paint(); }
  }

  function go(n) { at = Math.max(0, Math.min(TOTAL - 1, n)); paint(); }

  function fillPlate(n) {
    var w = wards[n];
    var img = cuts[n].querySelector("img");
    vImg.setAttribute("src", img.getAttribute("src"));
    vImg.setAttribute("alt", img.getAttribute("alt"));
    document.getElementById("v-no").textContent = "Ward " + pad(n + 1) + " of " + pad(TOTAL);
    document.getElementById("v-name").textContent = w.ward;
    document.getElementById("v-note").textContent = w.note;
    document.getElementById("v-credit").textContent = w.credit;
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

  cuts.forEach(function (b, i) { b.addEventListener("click", function () { go(i); }); });
  document.getElementById("open").addEventListener("click", function () { openAt(at); });
  document.getElementById("v-prev").addEventListener("click", function () { openAt((at - 1 + TOTAL) % TOTAL); });
  document.getElementById("v-next").addEventListener("click", function () { openAt((at + 1) % TOTAL); });
  document.getElementById("v-close").addEventListener("click", close);
  viewer.addEventListener("click", function (e) { if ("close" in e.target.dataset) close(); });

  plan.addEventListener("keydown", function (e) {
    var k = e.key;
    if (k === "ArrowRight") step(1, 0);
    else if (k === "ArrowLeft") step(-1, 0);
    else if (k === "ArrowDown") step(0, 1);
    else if (k === "ArrowUp") step(0, -1);
    else if (k === "Home") go(0);
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
