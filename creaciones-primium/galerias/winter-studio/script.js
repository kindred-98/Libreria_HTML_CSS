(function () {
  var SHEET = [
    { name: "Rime, Brocken viaduct", sub: "Rime on conifer", place: "Brocken, Germany", edge: "190 by 66 mm", note: "The first print down and the only one with a machine in it. A conifer at the left of frame has been holding ice for long enough to become a solid white shape, and the train behind it is the only warm thing in the picture apart from the sky.", credit: "Andreas Tille, CC BY-SA 4.0" },
    { name: "Pines over the Bryce plateau", sub: "Snow-loaded slope", place: "Bryce Canyon, Utah", edge: "152 by 50 mm", note: "Taken in a storm and still legible, which is the whole argument for printing the difficult frame last. The pines in the foreground hold their shape; everything past them has already gone flat and grey.", credit: "U.S. National Park Service, Public domain" },
    { name: "A spruce shaped like a wave", sub: "Wind-loaded conifer", place: "Brocken, Germany", edge: "178 by 64 mm", note: "The crest of a conifer that has been carrying snow for weeks, with the sun coming through the gap behind it. This is the print the loupe earns its keep on: there is rime detail in the branches that is invisible at mat size.", credit: "Andreas Tille, CC BY-SA 4.0" },
    { name: "Four trees under load", sub: "Ice-bent row", place: "British Columbia, Canada", edge: "162 by 54 mm", note: "A short row of trees bent almost to horizontal under a single ice storm, against the deepest blue sky in the whole sheet. Nothing in the frame is moving now and that is what makes it look strained.", credit: "Iwona Erskine-Kellie, CC BY 2.0" },
    { name: "One birch, rimed to the tips", sub: "Rimed birch", place: "Kolomenskoye, Russia", edge: "198 by 70 mm", note: "The largest print on the mat and the only one with any quiet in it. Every twig on the tree has a white edge, the valley behind has gone to mist, and the whole frame is built out of one repeated line.", credit: "A.Savin, CC BY-SA 3.0" },
    { name: "Red locomotive, big plume", sub: "Steam in snow", place: "Brocken, Germany", edge: "150 by 52 mm", note: "The second train and the better of the two, because the plume is doing the work. It rises straight up in still air and takes the warm light with it, so the sky above the train is pinker than the sky at the corners.", credit: "Markus Trienke, CC BY-SA 2.0" },
    { name: "Frosted scrub, wide sky", sub: "Rimed low scrub", place: "Silesian Beskids, Poland", edge: "186 by 62 mm", note: "The widest print and the emptiest composition: a band of frosted bushes across the bottom third and an enormous sky over it. Under cloud the whole sheet goes quiet, which is why this one sits in the middle row.", credit: "Pudelek, CC BY-SA 4.0" },
    { name: "Birch stand, trunks only", sub: "Dense birch wood", place: "Spiš, Slovakia", edge: "158 by 54 mm", note: "No subject at all, just trunks. Dozens of white stems standing close enough together that the snow behind them is only visible in slivers, and the blue at the top is the only colour in the print.", credit: "Milan Balisin, CC BY-SA 4.0" },
    { name: "Hut on the pink field", sub: "Alpine hut at dusk", place: "Nelson Lakes, New Zealand", edge: "174 by 58 mm", note: "Last on the mat, and the only warm one: a single wooden hut on a huge snowfield with the last light going orange along the ridge behind it. Everything else on this sheet is blue, and this print is the one that makes the blues work.", credit: "Michal Klajban, CC BY-SA 4.0" }
  ];

  var PITCH = [[11, "1 mm"], [17, "2 mm"], [26, "5 mm"]];

  var tbl = document.getElementById("table");
  var print = Array.prototype.slice.call(tbl.querySelectorAll(".print"));
  var loupe = document.getElementById("loupe");
  var ticks = document.getElementById("ticks");
  var ruler = document.getElementById("ruler");
  var expose = document.getElementById("expose");
  var exposeOut = document.getElementById("exposeOut");
  var glow = document.getElementById("glow");
  var viewer = document.getElementById("viewer");
  var vImg = document.getElementById("vImg");
  var at = 0;
  var loupeOn = true;
  var pitch = 0;
  var bx = 50;
  var by = 50;
  var lastFocus = null;

  function pad(n) { return (n < 10 ? "0" : "") + n; }

  function buildScale() {
    var t = document.createDocumentFragment();
    for (var k = 0; k <= 20; k++) {
      var s = document.createElement("span");
      s.style.left = (k / 20 * 100).toFixed(2) + "%";
      if (k % 5 === 0) {
        s.className = "maj";
        s.textContent = (k * 5);
      }
      t.appendChild(s);
    }
    ruler.appendChild(t);

    var f = document.createDocumentFragment();
    for (var j = 0; j <= 12; j++) {
      var e = document.createElement("span");
      e.style.left = (4 + j / 12 * 92).toFixed(2) + "%";
      e.textContent = pad(j * 10);
      f.appendChild(e);
    }
    ticks.appendChild(f);
  }

  function placeLoupe() {
    var r = print[at].getBoundingClientRect();
    var t = tbl.getBoundingClientRect();
    var half = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--lv")) / 2 || 86;
    var cx = r.left + r.width * 0.5 + r.width * 0.44 + (bx - 50) / 100 * r.width * 0.7;
    var cy = r.top + r.height * 0.5 - r.height * 0.36 + (by - 50) / 100 * r.height * 0.7;
    var minX = t.left + half + 4, maxX = t.right - half - 4;
    var minY = t.top + half + 4, maxY = t.bottom - half - 4;
    cx = Math.max(minX, Math.min(maxX, cx));
    cy = Math.max(minY, Math.min(maxY, cy));
    loupe.style.transform = "translate3d(" + (cx - t.left).toFixed(1) + "px," + (cy - t.top).toFixed(1) + "px,0)";
  }

  function paint() {
    var d = SHEET[at];
    var img = print[at].querySelector("img");
    for (var k = 0; k < print.length; k++) {
      print[k].classList.toggle("is-on", k === at);
      print[k].classList.toggle("is-off", k !== at);
      print[k].setAttribute("aria-current", k === at ? "true" : "false");
    }
    loupe.style.setProperty("--u", "url(\"" + img.getAttribute("src") + "\")");
    loupe.style.setProperty("--bx", bx.toFixed(0) + "%");
    loupe.style.setProperty("--by", by.toFixed(0) + "%");
    loupe.classList.toggle("is-off", !loupeOn);
    placeLoupe();

    var ev = (Number(expose.value) - 100) / 50;
    exposeOut.textContent = (ev > 0 ? "+" : "") + ev.toFixed(1) + " EV";
    for (var j = 0; j < print.length; j++) {
      var im = print[j].querySelector("img");
      var base = j === at ? "saturate(1) brightness(1)" : "saturate(.72) brightness(.72)";
      im.style.filter = ev === 0 ? base : base + " brightness(" + (1 + ev * 0.42).toFixed(3) + ") contrast(" + (1 + Math.abs(ev) * 0.14).toFixed(3) + ")";
    }
    glow.style.opacity = (0.55 + 0.45 * (1 - Number(expose.value) / 150)).toFixed(3);

    document.getElementById("bNo").innerHTML = pad(at + 1) + "<i>/09</i>";
    document.getElementById("bName").textContent = d.name;
    document.getElementById("bNote").textContent = d.note;
    document.getElementById("bSub").textContent = d.sub;
    document.getElementById("bPlace").textContent = d.place;
    document.getElementById("bEdge").textContent = d.edge;
    document.getElementById("bPos").textContent = (at + 1) + " of " + print.length;
    document.getElementById("bCredit").textContent = d.credit;
  }

  function go(n) {
    at = Math.max(0, Math.min(print.length - 1, n));
    bx = 50;
    by = 50;
    paint();
  }

  function fillPlate(n) {
    var d = SHEET[n];
    var img = print[n].querySelector("img");
    vImg.setAttribute("src", img.getAttribute("src"));
    vImg.setAttribute("alt", img.getAttribute("alt"));
    document.getElementById("vNo").textContent = "PRINT " + pad(n + 1) + " \u00b7 " + (n + 1) + " OF " + print.length;
    document.getElementById("vName").textContent = d.name;
    document.getElementById("vNote").textContent = d.note;
    document.getElementById("vCredit").textContent = d.credit;
    document.getElementById("vCount").textContent = pad(n + 1) + " / " + pad(print.length);
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

  buildScale();
  print.forEach(function (b, i) { b.addEventListener("click", function () { openAt(i); }); });
  expose.addEventListener("input", paint);
  document.getElementById("back").addEventListener("click", function () { go(at - 1); });
  document.getElementById("fwd").addEventListener("click", function () { go(at + 1); });
  document.getElementById("open").addEventListener("click", function () { openAt(at); });
  document.getElementById("loupeToggle").addEventListener("click", function () {
    loupeOn = !loupeOn;
    this.textContent = loupeOn ? "Loupe on" : "Loupe off";
    this.setAttribute("aria-pressed", loupeOn ? "true" : "false");
    paint();
  });
  document.getElementById("grid").addEventListener("click", function () {
    pitch = (pitch + 1) % PITCH.length;
    document.documentElement.style.setProperty("--pitch", PITCH[pitch][0] + "px");
    document.getElementById("pitchName").textContent = PITCH[pitch][1];
    this.textContent = "Grid " + PITCH[pitch][1];
    this.setAttribute("aria-pressed", "true");
  });
  document.getElementById("vPrev").addEventListener("click", function () { openAt((at - 1 + print.length) % print.length); });
  document.getElementById("vNext").addEventListener("click", function () { openAt((at + 1) % print.length); });
  document.getElementById("vClose").addEventListener("click", close);
  viewer.addEventListener("click", function (e) { if ("close" in e.target.dataset) close(); });

  window.addEventListener("resize", placeLoupe);

  tbl.addEventListener("keydown", function (e) {
    var k = e.key;
    if (e.shiftKey && loupeOn) {
      if (k === "ArrowLeft") bx = Math.max(0, bx - 8);
      else if (k === "ArrowRight") bx = Math.min(100, bx + 8);
      else if (k === "ArrowUp") by = Math.max(0, by - 8);
      else if (k === "ArrowDown") by = Math.min(100, by + 8);
      else return;
      paint();
      e.preventDefault();
      return;
    }
    if (k === "ArrowRight") go(at + 1);
    else if (k === "ArrowLeft") go(at - 1);
    else if (k === "ArrowDown") go(Math.min(print.length - 1, at + 3));
    else if (k === "ArrowUp") go(Math.max(0, at - 3));
    else if (k === "Home") go(0);
    else if (k === "End") go(print.length - 1);
    else if (k === "Enter" || k === " ") { if (e.target !== tbl) return; openAt(at); }
    else if (k === "l" || k === "L") document.getElementById("loupeToggle").click();
    else if (k === "g" || k === "G") document.getElementById("grid").click();
    else return;
    e.preventDefault();
  });

  document.addEventListener("keydown", function (e) {
    if (viewer.hidden) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") openAt((at - 1 + print.length) % print.length);
    else if (e.key === "ArrowRight") openAt((at + 1) % print.length);
    else if (e.key === "Home") openAt(0);
    else if (e.key === "End") openAt(print.length - 1);
    else return;
    e.preventDefault();
  });

  paint();
})();
