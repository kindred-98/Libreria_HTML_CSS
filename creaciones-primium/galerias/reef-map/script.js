(function () {
  var LOG = [
    { dep: 4, tag: "SOFT CORAL", name: "Orange soft coral on the sand channel", note: "The shallowest fix and the only one where the transect was still in sand. A single fan stood twelve metres off the slope with its polyps fully out, which at this depth means the current had dropped for the day.", credit: "Nhobgood Nick Hobgood, CC BY-SA 3.0", head: "148&deg;", bot: "Coarse sand", cov: "18% live coral" },
    { dep: 7, tag: "TABLE CORAL", name: "Stacked tables on the shelf", note: "A terrace of plate corals stepping down the shelf edge, each one flat enough to read as a shelf from above. Small yellow fish hold station in the lee of every plate, which is usually the only way to find the terrace from the surface.", credit: "Mahmoud Habeeb, Public domain", head: "152&deg;", bot: "Dead coral table", cov: "52% live coral" },
    { dep: 9, tag: "PINNACLE", name: "Pinnacle of plate and brain coral", note: "Four metres of relief in a single column, layered in pink, mauve and green. The tape read the same depth all the way round it, which is how you know the middle of the pinnacle is hollow and not worth diving through.", credit: "Toby Hudson, CC BY-SA 3.0", head: "161&deg;", bot: "Live rock", cov: "71% live coral" },
    { dep: 12, tag: "REEF FLAT", name: "Coral flat in hard clear water", note: "The best visibility on the whole transect, and the only fix where the sea fan at frame left is still standing upright. From here the bottom reads as a garden rather than a slope, which is why the flat gets its own entry.", credit: "Jim E Maragos, U.S. Fish and Wildlife Service, Public domain", head: "166&deg;", bot: "Coral rubble", cov: "40% live coral" },
    { dep: 15, tag: "DOME", name: "Dome coral, six metres across", note: "One boulder coral filling the whole foreground, its surface a closed maze of ridges. Behind it the reef drops away into open blue, which is the only way to judge how large the animal in front of you actually is.", credit: "Jerry Reid, U.S. Fish and Wildlife Service, Public domain", head: "173&deg;", bot: "Massive coral", cov: "63% live coral" },
    { dep: 18, tag: "BRANCHING", name: "Turquoise branching head on the wall foot", note: "The first genuinely deep-looking fix. A single branching colony holds the frame at arm's length while two small blue fish work the gap between its branches, and everything past it goes to a single dark tone.", credit: "Thomas Hubauer, CC BY-SA 2.0", head: "184&deg;", bot: "Wall foot", cov: "34% live coral" },
    { dep: 21, tag: "PLATE", name: "Plate corals under the lagoon surface", note: "Taken at the turn, so the sun is high and the water is at its clearest. The plates are scattered rather than stacked, which means this is the back of the lagoon and not the seaward face.", credit: "Holobionics, CC BY-SA 4.0", head: "191&deg;", bot: "Plate field", cov: "46% live coral" },
    { dep: 24, tag: "POD", name: "Artificial reef pods, fouled", note: "The one fix on the transect that was put there on purpose. Rings and bars set on the sand and now forty per cent fouled, which after eight years is enough structure to hold a proper community.", credit: "Tom jowett, CC BY-SA 4.0", head: "199&deg;", bot: "Artificial structure", cov: "40% fouled" },
    { dep: 28, tag: "DEEP SLOPE", name: "Plate and boulder on the drop-off", note: "Last fix before the transect runs out of bottom time. A purple plate coral and a bleached white boulder sit on the lip of the drop-off, and past them the water goes from blue to black inside about four metres.", credit: "Rickard T&ouml;rnblad, CC BY-SA 4.0", head: "206&deg;", bot: "Slope lip", cov: "29% live coral" }
  ];

  var chart = document.getElementById("chart");
  var plot = document.getElementById("plot");
  var fix = Array.prototype.slice.call(chart.querySelectorAll(".fix"));
  var row = Array.prototype.slice.call(document.querySelectorAll("#log .row"));
  var prof = document.getElementById("profile");
  var sound = document.getElementById("sound");
  var veil = document.getElementById("veil");
  var exag = document.getElementById("exag");
  var exagOut = document.getElementById("exagOut");
  var vis = document.getElementById("vis");
  var visOut = document.getElementById("visOut");
  var gridBtn = document.getElementById("grid");
  var viewer = document.getElementById("viewer");
  var vImg = document.getElementById("vImg");
  var at = 0;
  var lastFocus = null;
  var gridOn = true;

  function pad(n) { return (n < 10 ? "0" : "") + n; }

  function buildSoundings() {
    var frag = document.createDocumentFragment();
    var seed = 20070319;
    for (var r = 0; r < 11; r++) {
      for (var c = 0; c < 15; c++) {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        var v = (seed % 39);
        var s = document.createElement("span");
        s.style.left = ((c + 0.5) / 15 * 100).toFixed(2) + "%";
        s.style.top = ((r + 0.5) / 11 * 100).toFixed(2) + "%";
        s.textContent = (v < 10 ? "0" : "") + v;
        frag.appendChild(s);
      }
    }
    sound.appendChild(frag);
  }

  function yFor(dep, e) {
    var base = 12 + (dep / 30) * 76;
    var y = 50 + (base - 50) * (e / 100);
    return Math.max(7, Math.min(94, y));
  }

  function paint() {
    var e = Number(exag.value);
    exagOut.textContent = (e / 100).toFixed(2) + "\u00d7";
    for (var k = 0; k < fix.length; k++) {
      var y = yFor(LOG[k].dep, e);
      fix[k].style.setProperty("--y", y.toFixed(2) + "%");
      fix[k].classList.toggle("is-on", k === at);
      fix[k].classList.toggle("is-past", k < at);
      fix[k].setAttribute("aria-current", k === at ? "true" : "false");
      row[k].classList.toggle("is-on", k === at);
      row[k].setAttribute("aria-current", k === at ? "true" : "false");
    }
    var out = [];
    for (var m = 0; m < fix.length; m++) out.push(fix[m].__x.toFixed(2) + "," + yFor(LOG[m].dep, e).toFixed(2));
    prof.setAttribute("points", out.join(" "));

    var v = Number(vis.value);
    visOut.textContent = v + " m";
    veil.style.opacity = Math.max(0, (30 - v) / 26 * 0.5).toFixed(3);

    var d = LOG[at];
    var img = fix[at].querySelector("img");
    document.getElementById("tImg").setAttribute("src", img.getAttribute("src"));
    document.getElementById("tImg").setAttribute("alt", img.getAttribute("alt"));
    document.getElementById("tNo").textContent = "FIX " + pad(at + 1);
    document.getElementById("tDep").textContent = (d.dep < 10 ? "0" : "") + d.dep + " m";
    document.getElementById("tTag").textContent = d.tag;
    document.getElementById("tName").textContent = d.name;
    document.getElementById("tNote").textContent = d.note;
    document.getElementById("tCredit").textContent = d.credit;
    document.getElementById("tHead").innerHTML = d.head;
    document.getElementById("tBot").textContent = d.bot;
    document.getElementById("tCov").textContent = d.cov;
    document.getElementById("tPos").textContent = (at + 1) + " of " + fix.length;
  }

  function measure() {
    for (var k = 0; k < fix.length; k++) {
      var m = /(-?[\d.]+)%/.exec(fix[k].getAttribute("style") || "");
      fix[k].__x = m ? parseFloat(m[1]) : 50;
    }
  }

  function go(n) { at = Math.max(0, Math.min(fix.length - 1, n)); paint(); }

  function fillPlate(n) {
    var d = LOG[n];
    var img = fix[n].querySelector("img");
    vImg.setAttribute("src", img.getAttribute("src"));
    vImg.setAttribute("alt", img.getAttribute("alt"));
    document.getElementById("vNo").textContent = "FIX " + pad(n + 1) + " \u00b7 " + (d.dep < 10 ? "0" : "") + d.dep + " m";
    document.getElementById("vName").textContent = d.name;
    document.getElementById("vNote").textContent = d.note;
    document.getElementById("vCredit").textContent = d.credit;
    document.getElementById("vCount").textContent = pad(n + 1) + " / " + pad(fix.length);
  }

  function openAt(n) {
    lastFocus = document.activeElement;
    go(n);
    fillPlate(n);
    viewer.hidden = false;
    document.getElementById("vClose").focus();
  }

  function close() {
    viewer.hidden = true;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  buildSoundings();
  measure();
  paint();

  window.addEventListener("resize", paint);

  fix.forEach(function (b, i) { b.addEventListener("click", function () { openAt(i); }); });
  row.forEach(function (b, i) { b.addEventListener("click", function () { go(i); }); });
  exag.addEventListener("input", paint);
  vis.addEventListener("input", paint);
  gridBtn.addEventListener("click", function () {
    gridOn = !gridOn;
    sound.classList.toggle("is-off", !gridOn);
    gridBtn.textContent = gridOn ? "Sounding grid on" : "Sounding grid off";
    gridBtn.setAttribute("aria-pressed", gridOn ? "true" : "false");
  });
  document.getElementById("up").addEventListener("click", function () { go(at - 1); });
  document.getElementById("down").addEventListener("click", function () { go(at + 1); });
  document.getElementById("open").addEventListener("click", function () { openAt(at); });
  document.getElementById("vPrev").addEventListener("click", function () { openAt((at - 1 + fix.length) % fix.length); });
  document.getElementById("vNext").addEventListener("click", function () { openAt((at + 1) % fix.length); });
  document.getElementById("vClose").addEventListener("click", close);
  viewer.addEventListener("click", function (e) { if (e.target.hasAttribute("data-close")) close(); });

  chart.addEventListener("keydown", function (e) {
    var k = e.key;
    if (k === "ArrowRight" || k === "ArrowDown") go(at + 1);
    else if (k === "ArrowLeft" || k === "ArrowUp") go(at - 1);
    else if (k === "PageDown") go(at + 3);
    else if (k === "PageUp") go(at - 3);
    else if (k === "Home") go(0);
    else if (k === "End") go(fix.length - 1);
    else if (k === "Enter" || k === " ") { if (e.target !== chart) return; openAt(at); }
    else if (k === "g" || k === "G") gridBtn.click();
    else return;
    e.preventDefault();
  });

  document.addEventListener("keydown", function (e) {
    if (viewer.hidden) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") openAt((at - 1 + fix.length) % fix.length);
    else if (e.key === "ArrowRight" || e.key === "ArrowDown") openAt((at + 1) % fix.length);
    else if (e.key === "Home") openAt(0);
    else if (e.key === "End") openAt(fix.length - 1);
    else return;
    e.preventDefault();
  });
})();
