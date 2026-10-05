(function () {
  var plates = [
    { name: "Beech crowns, M&aacute;tra", note: "A stand of beech with the leaves already off, so the light that reaches the floor arrives as sideways bars between the trunks rather than as a wash from above.", credit: "Susulyka, CC BY-SA 4.0" },
    { name: "Pollarded row, Walthamstow", note: "Trees cut back to the same height along their whole length, which is a management decision and not a natural one. The light underneath them is uniform because the canopy above is a flat line.", credit: "Roger Jones, CC BY-SA 2.0" },
    { name: "Spruce at Holma", note: "Close spacing, straight trunks, almost no side light. Everything under a spruce stand competes for the same narrow column of light coming down between the trees.", credit: "W.carter, CC0" },
    { name: "Forest road, Yyteri", note: "A track cut through pines with the last snow lying between the trunks. The road is the only thing in the frame that is not vertical.", credit: "kallerna, CC BY-SA 4.0" },
    { name: "Beech, low sun, Hald S&oslash;", note: "Late light coming in almost horizontally under the crowns. The trunks are the brightest thing in the picture and the canopy above them is nearly black.", credit: "Jebulon, CC0" },
    { name: "Scrub, Kings Forest", note: "The messy middle of a wood, where nothing has closed yet and everything is competing. In a section drawing this is the layer that is hardest to draw and easiest to forget.", credit: "Sophie Curtis, CC BY-SA 4.0" },
    { name: "Tree frog on a branch", note: "The lowest stratum of all, and the only one where the light is a by-product rather than a resource. Everything below this line lives on what the floor drops.", credit: "Cary Bass, CC BY-SA 3.0" },
    { name: "Beauchamp Falls", note: "Water arriving at the floor from somewhere else entirely, which is a reminder that the bottom of a section is not the same thing as the bottom of the light.", credit: "Dietmar Rabich, CC BY-SA 4.0" }
  ];

  var LAYERS = [
    { tag: "L4 emergent", height: "above 24 m", inPct: 100, outPct: 54, lai: 4.6, nos: "01 and 02" },
    { tag: "L3 upper canopy", height: "14 to 24 m", inPct: 54, outPct: 22, lai: 3.1, nos: "03 and 04" },
    { tag: "L2 shrub layer", height: "4 to 14 m", inPct: 22, outPct: 8, lai: 1.4, nos: "05 and 06" },
    { tag: "L1 forest floor", height: "0 to 4 m", inPct: 8, outPct: 8, lai: 0.1, nos: "07 and 08" }
  ];

  var TOTAL = plates.length;
  var section = document.getElementById("section");
  var nodes = Array.prototype.slice.call(section.querySelectorAll(".node"));
  var strata = Array.prototype.slice.call(section.querySelectorAll(".stratum"));
  var beam = document.getElementById("beam");
  var viewer = document.getElementById("viewer");
  var vImg = document.getElementById("v-img");
  var layer = 0;
  var slot = 0;
  var x = 0.26;
  var dir = 1;
  var lastFocus = null;
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function index() { return layer * 2 + slot; }

  function paint() {
    for (var i = 0; i < TOTAL; i++) {
      nodes[i].classList.toggle("is-on", i === index());
      nodes[i].setAttribute("aria-current", i === index() ? "true" : "false");
    }
    for (var s = 0; s < 4; s++) strata[s].classList.toggle("is-on", s === layer);

    var L = LAYERS[layer];
    document.getElementById("rStr").textContent = L.tag;
    document.getElementById("rIn").textContent = L.inPct + " %";
    document.getElementById("rOut").textContent = L.outPct + " %";
    document.getElementById("rLai").textContent = L.lai.toFixed(1);
    document.getElementById("rPlates").textContent = L.nos;
    document.getElementById("bStr").style.transform = "scaleX(" + ((layer + 1) / 4).toFixed(3) + ")";
    document.getElementById("bIn").style.transform = "scaleX(" + (L.inPct / 100).toFixed(3) + ")";
    document.getElementById("bOut").style.transform = "scaleX(" + (L.outPct / 100).toFixed(3) + ")";
    document.getElementById("bLai").style.transform = "scaleX(" + (L.lai / 5).toFixed(3) + ")";

    var p = plates[index()];
    var n = index();
    document.getElementById("rId").textContent = "N " + pad(n + 1) + " \u00b7 " + L.tag;
    document.getElementById("rName").innerHTML = p.name;
    document.getElementById("rNote").textContent = p.note;
    document.getElementById("rCredit").textContent = p.credit;
  }

  function scan() {
    x += dir * 0.0075;
    if (x > 0.86) { x = 0.86; dir = -1; }
    if (x < 0.13) { x = 0.13; dir = 1; }
    var w = section.clientWidth;
    var band = strata[0].offsetHeight;
    beam.style.transform = "translate3d(" + (x * w - 75).toFixed(1) + "px," + ((layer + 0.5) * band).toFixed(1) + "px,0)";
    for (var i = 0; i < TOTAL; i++) {
      var nx = Number.parseFloat(nodes[i].style.getPropertyValue("--x")) / 100;
      var near = Math.abs(nx - x) < 0.1;
      nodes[i].classList.toggle("is-lit", near);
    }
  }

  function setLayer(n) {
    layer = Math.max(0, Math.min(3, n));
    x = slot === 0 ? 0.26 : 0.74;
    dir = slot === 0 ? 1 : -1;
    paint();
  }

  function setSlot(n) {
    slot = n === 0 ? 0 : 1;
    x = slot === 0 ? 0.26 : 0.74;
    dir = slot === 0 ? 1 : -1;
    paint();
  }

  function fill(n) {
    var p = plates[n];
    var img = nodes[n].querySelector("img");
    vImg.setAttribute("src", img.getAttribute("src"));
    vImg.setAttribute("alt", img.getAttribute("alt"));
    document.getElementById("v-no").textContent = "N " + pad(n + 1) + " \u00b7 " + LAYERS[layer].tag;
    document.getElementById("v-name").innerHTML = p.name;
    document.getElementById("v-note").textContent = p.note;
    document.getElementById("v-credit").textContent = p.credit;
    document.getElementById("v-count").textContent = pad(n + 1) + " / " + pad(TOTAL);
  }

  function openAt(n) {
    lastFocus = document.activeElement;
    layer = Math.floor(n / 2);
    slot = n % 2;
    paint();
    fill(n);
    viewer.hidden = false;
    document.getElementById("v-close").focus();
  }

  function close() {
    viewer.hidden = true;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  nodes.forEach(function (b, i) {
    b.addEventListener("click", function () {
      layer = Math.floor(i / 2);
      slot = i % 2;
      x = slot === 0 ? 0.26 : 0.74;
      dir = slot === 0 ? 1 : -1;
      paint();
    });
  });
  document.getElementById("up").addEventListener("click", function () { setLayer(layer - 1); });
  document.getElementById("down").addEventListener("click", function () { setLayer(layer + 1); });
  document.getElementById("open").addEventListener("click", function () { openAt(index()); });
  document.getElementById("v-prev").addEventListener("click", function () { openAt((index() - 1 + TOTAL) % TOTAL); });
  document.getElementById("v-next").addEventListener("click", function () { openAt((index() + 1) % TOTAL); });
  document.getElementById("v-close").addEventListener("click", close);
  viewer.addEventListener("click", function (e) { if ("close" in e.target.dataset) close(); });

  section.addEventListener("keydown", function (e) {
    var k = e.key;
    if (k === "ArrowUp") setLayer(layer - 1);
    else if (k === "ArrowDown") setLayer(layer + 1);
    else if (k === "ArrowLeft") setSlot(0);
    else if (k === "ArrowRight") setSlot(1);
    else if (k === "Home") setSlot(0);
    else if (k === "End") setSlot(1);
    else if (k === "Enter" || k === " ") openAt(index());
    else return;
    e.preventDefault();
  });

  document.addEventListener("keydown", function (e) {
    if (viewer.hidden) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") openAt((index() - 1 + TOTAL) % TOTAL);
    else if (e.key === "ArrowRight") openAt((index() + 1) % TOTAL);
    else if (e.key === "Home") openAt(0);
    else if (e.key === "End") openAt(TOTAL - 1);
    else return;
    e.preventDefault();
  });

  paint();
  scan();
  if (!reduced) setInterval(scan, 33);
  window.addEventListener("resize", scan);
})();
