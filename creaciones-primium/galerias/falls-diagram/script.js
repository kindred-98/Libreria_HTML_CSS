(function () {
  var NODES = [
    { name: "Headwater, Jonathan's Run", stage: "HEADWATER", order: "source", reach: "0.4 km above the fork", note: "The circuit starts where the water is still a thread. A whole sheet of it goes over one sandstone ledge in a single move, and the pool below is the first place on the river that is still enough to reflect anything.", credit: "Hubert Stoffels, CC BY 2.0" },
    { name: "Tiered fall, Russell Falls", stage: "CASCADE", order: "confluence", reach: "1.1 km, shaded gully", note: "Four short drops in a row inside a rock amphitheatre, each one landing on the lip of the next. The whole river is in this one channel here, and the moss at the base never dries out.", credit: "JJ Harrison, CC BY-SA 3.0" },
    { name: "Frozen sheets, Partnachklamm", stage: "RIME", order: "left branch", reach: "1.9 km, shaded wall", note: "In the cold months the left branch stops being a stream and becomes a sculpture. What used to be falling water is now a hundred-tonne sheet of ice hanging over the same dark lip.", credit: "Richard Bartz, CC BY-SA 2.5" },
    { name: "Single step, Snug Falls", stage: "SINGLE STEP", order: "right branch", reach: "1.8 km, red bed", note: "The right branch takes one clean step over a red-brown bed and lands in water dark enough to look like oil. Narrow, private, and the only station on the circuit you can wade beside.", credit: "JJ Harrison, CC BY-SA 3.0" },
    { name: "Gorge with the mist in it", stage: "GORGE", order: "confluence", reach: "2.6 km, canyon", note: "Both branches arrive at the same gorge within two hundred metres of each other and neither is visible from the other. The air here stays permanently full of spray, which is why the walls are orange.", credit: "McIntosh Natura, CC BY-SA 3.0" },
    { name: "Two tiers below granite", stage: "TWO TIER", order: "left branch", reach: "3.4 km, cliff face", note: "The river has to clear a thousand feet of granite and does it in two moves, with a shoulder of rock in between. From the valley floor you can hear both drops and never see the water between them.", credit: "Diliff, CC BY-SA 3.0" },
    { name: "Twin prongs in green moss", stage: "TWIN PRONG", order: "right branch", reach: "3.2 km, mossy ledges", note: "Two prongs of the same fall splitting around a single block and rejoining four metres lower. The channel is short and wide and the whole thing runs green because the walls hold moss in every wet inch.", credit: "Chettouh Nabil, CC BY-SA 3.0" },
    { name: "Basalt steps, Selfoss", stage: "BASALT STEPS", order: "confluence", reach: "4.1 km, open floodplain", note: "The last real fall on the circuit, and the widest. The river walks off a staircase of basalt columns in three low sheets and then flattens out for the run to the sea.", credit: "Martin Falbisoner, CC BY-SA 4.0" },
    { name: "Thin fall on the sea cliff", stage: "SEA CLIFF", order: "outfall", reach: "0.2 km to the Atlantic", note: "Outfall. After four kilometres of falling the river is a single thread on a black cliff, and the sea takes it in a single impact. Nothing on the circuit is quieter than this last station.", credit: "Colin, CC BY-SA 4.0" }
  ];

  var REGIMES = [
    { label: "Perennial", q: 1.00, flow: [1, 1, .7, 1, 1, .9, .85, 1, .6] },
    { label: "Snowmelt", q: 3.40, flow: [1, 1, .2, .9, 1, .5, .45, .8, .9] },
    { label: "After rain", q: 6.20, flow: [1, 1, .55, 1, 1, 1, 1, 1, 1] },
    { label: "Freeze and thaw", q: 0.35, flow: [.5, .45, 1, .3, .6, .35, .3, .4, .25] }
  ];

  var flow = document.getElementById("flow");
  var nd = Array.prototype.slice.call(flow.querySelectorAll(".nd"));
  var wires = document.getElementById("wires");
  var reg = Array.prototype.slice.call(document.querySelectorAll(".reg"));
  var idx = Array.prototype.slice.call(document.querySelectorAll(".index a"));
  var viewer = document.getElementById("viewer");
  var vImg = document.getElementById("vImg");
  var at = 0;
  var r = 0;
  var lastFocus = null;

  function pad(n) { return (n < 10 ? "0" : "") + n; }

  function paint() {
    var R = REGIMES[r];
    var f = R.flow[at];
    for (var k = 0; k < nd.length; k++) {
      nd[k].classList.toggle("is-on", k === at);
      nd[k].classList.toggle("is-past", k < at);
      nd[k].classList.toggle("is-dim", R.flow[k] < 0.5 && k !== at);
      nd[k].setAttribute("aria-current", k === at ? "true" : "false");
      idx[k].classList.toggle("is-on", k === at);
    }
    wires.style.opacity = (0.24 + 0.76 * f).toFixed(2);
    wires.style.stroke = f < 0.5 ? "#2a7d88" : "#3fd8e8";
    for (var m = 0; m < reg.length; m++) reg[m].classList.toggle("is-on", m === r);

    var d = NODES[at];
    document.getElementById("rNo").textContent = pad(at + 1);
    document.getElementById("rName").textContent = d.name;
    document.getElementById("rNote").textContent = d.note;
    document.getElementById("rCredit").textContent = d.credit;
    document.getElementById("rOrder").textContent = d.order;
    document.getElementById("rReach").textContent = d.reach;
    document.getElementById("rQ").textContent = R.q.toFixed(2) + " m\u00b3/s";
    document.getElementById("qVal").textContent = R.q.toFixed(2);
  }

  function go(n) { at = Math.max(0, Math.min(nd.length - 1, n)); paint(); }
  function setR(n) { r = Math.max(0, Math.min(REGIMES.length - 1, n)); paint(); }

  function fillPlate(n) {
    var d = NODES[n];
    var img = nd[n].querySelector("img");
    vImg.setAttribute("src", img.getAttribute("src"));
    vImg.setAttribute("alt", img.getAttribute("alt"));
    document.getElementById("vNo").textContent = "STATION " + pad(n + 1) + " \u00b7 " + d.stage;
    document.getElementById("vName").textContent = d.name;
    document.getElementById("vNote").textContent = d.note;
    document.getElementById("vCredit").textContent = d.credit;
    document.getElementById("vCount").textContent = pad(n + 1) + " / " + pad(nd.length);
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
    if (lastFocus?.focus) lastFocus.focus();
  }

  nd.forEach(function (b, i) { b.addEventListener("click", function () { openAt(i); }); });
  reg.forEach(function (b, i) { b.addEventListener("click", function () { setR(i); }); });
  idx.forEach(function (a, i) {
    a.addEventListener("click", function (e) { e.preventDefault(); go(i); nd[i].focus(); });
  });
  document.getElementById("back").addEventListener("click", function () { go(at - 1); });
  document.getElementById("fwd").addEventListener("click", function () { go(at + 1); });
  document.getElementById("open").addEventListener("click", function () { openAt(at); });
  document.getElementById("vPrev").addEventListener("click", function () { openAt((at - 1 + nd.length) % nd.length); });
  document.getElementById("vNext").addEventListener("click", function () { openAt((at + 1) % nd.length); });
  document.getElementById("vClose").addEventListener("click", close);
  viewer.addEventListener("click", function (e) { if ("close" in e.target.dataset) close(); });

  flow.addEventListener("keydown", function (e) {
    var k = e.key;
    if (k === "ArrowRight" || k === "ArrowDown") go(at + 1);
    else if (k === "ArrowLeft" || k === "ArrowUp") go(at - 1);
    else if (k === "Home") go(0);
    else if (k === "End") go(nd.length - 1);
    else if (k === "Enter" || k === " ") { if (e.target !== flow) return; openAt(at); }
    else if (k === "1" || k === "2" || k === "3" || k === "4") { setR(Number(k) - 1); }
    else return;
    e.preventDefault();
  });

  document.addEventListener("keydown", function (e) {
    if (viewer.hidden) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") openAt((at - 1 + nd.length) % nd.length);
    else if (e.key === "ArrowRight") openAt((at + 1) % nd.length);
    else if (e.key === "Home") openAt(0);
    else if (e.key === "End") openAt(nd.length - 1);
    else return;
    e.preventDefault();
  });

  paint();
})();
