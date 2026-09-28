(function () {
  var layers = [
    {
      name: "Canopy of light",
      note: "What a street looks like from underneath its own lighting: a violet tent and a green column, both far brighter than anything they are meant to light.",
      plate: "01 and 02",
      credit: "Andreas Tille and Yasumichi Morita with Basile Morin, CC BY-SA 4.0",
      shots: [
        { cap: "Canopy, violet and green", note: "The tent roof of a plaza lit from below in two colours, with the mast of the canopy cutting straight up the middle of the frame.", credit: "Andreas Tille, CC BY-SA 4.0" },
        { cap: "Lanterns over the path", note: "A stone path between two walls of paper lanterns. The light is at eye height all the way down, so there is no dark anywhere in the frame.", credit: "Yasumichi Morita and Basile Morin, CC BY-SA 4.0" }
      ]
    },
    {
      name: "Facades",
      note: "The layer the street is made of: a stone tower lit to its cornice, and an arch thrown across water with a whole skyline standing behind it.",
      plate: "03 and 04",
      credit: "George Chernilevsky and Daniel Schwen, CC BY-SA 4.0",
      shots: [
        { cap: "Tower, lit to the cornice", note: "A stone clock tower washed in amber from below, with the sky left at full dark blue behind it. The only unlit thing in the picture is the weather.", credit: "George Chernilevsky, CC BY-SA 4.0" },
        { cap: "Arch over the water", note: "A long exposure, so the river has become a mirror and the arch is doubled in it. The buildings on the far bank stay sharp.", credit: "Daniel Schwen, CC BY-SA 4.0" }
      ]
    },
    {
      name: "Street level",
      note: "The layer people are actually in. One frame with every sign on and nobody reading them, one frame with a single lamp and nobody in it at all.",
      plate: "05 and 06",
      credit: "Basile Morin and Pudelek, CC BY-SA 4.0",
      shots: [
        { cap: "Signs, stacked floor to ceiling", note: "A street so narrow that the signage has taken over the building. Every sign is vertical and none of them leave room for a window.", credit: "Basile Morin, CC BY-SA 4.0" },
        { cap: "One lamp, nobody in the street", note: "Sodium lamps, low buildings, wet pavement. The street is lit for somebody who has already gone home.", credit: "Pudelek, CC BY-SA 4.0" }
      ]
    },
    {
      name: "The far side",
      note: "The layer the street turns its back on: two hillsides high enough to see how far the lights actually go, and water in the middle of all of it holding the reflection.",
      plate: "07 and 08",
      credit: "Benh LIEU SONG and Laitr Keiows, CC BY-SA 4.0 and CC BY-SA 3.0",
      shots: [
        { cap: "Towers, then the far shore", note: "A wall of apartment towers in front of a harbour, and behind them the same city again, flattened into one band of light. The water is the only thing in the frame that repeats itself.", credit: "Benh LIEU SONG, CC BY-SA 4.0" },
        { cap: "The bay, and one bridge across", note: "From a hillside, the grid runs downhill to the water and stops at an orange bridge. A port of cranes is still burning on the far side.", credit: "Laitr Keiows, CC BY-SA 3.0" }
      ]
    }
  ];

  var TOTAL = 4;
  var stage = document.getElementById("stage");
  var sheets = Array.prototype.slice.call(stage.querySelectorAll(".sheet"));
  var gap = document.getElementById("gap");
  var gapOut = document.getElementById("gap-out");
  var viewer = document.getElementById("viewer");
  var vImg = document.getElementById("v-img");
  var front = 0;
  var plate = 0;
  var lastFocus = null;

  function flat() {
    var out = [];
    for (var l = 0; l < TOTAL; l++) for (var s = 0; s < 2; s++) out.push({ layer: l, shot: s });
    return out;
  }
  var order = flat();
  var N = order.length;

  function pad(n) { return (n < 10 ? "0" : "") + n; }

  function paint() {
    var stageW = stage.clientWidth || 1120;
    var mult = Math.min(3.6, Math.max(0.4, (stageW - 340) / 2 / 80));
    var g = Number(gap.value) * mult;
    var cap = Math.max(0, (stageW / 2 - 116) / (TOTAL - 1));
    if (g > cap) { g = cap; }
    document.documentElement.style.setProperty("--gap", g.toFixed(0) + "px");
    for (var i = 0; i < TOTAL; i++) {
      var depth = i - front;
      var x = depth * g;
      var scale = 1 - Math.min(0.34, Math.abs(depth) * 0.13);
      var dim = Math.min(0.56, Math.abs(depth) * 0.3);
      var sheet = sheets[i];
      sheet.style.transform = "translate3d(" + x.toFixed(1) + "px,0,0) scale(" + scale.toFixed(3) + ")";
      sheet.style.filter = "brightness(" + (1 - dim).toFixed(2) + ")";
      sheet.style.opacity = String(1 - Math.min(0.42, Math.abs(depth) * 0.21));
      sheet.style.zIndex = String(10 - Math.abs(depth));
      sheet.classList.toggle("is-front", depth === 0);
    }
    var wires = stage.querySelectorAll(".wire");
    for (var w = 0; w < wires.length; w++) {
      wires[w].style.transform = "scaleX(" + (g / 150).toFixed(3) + ")";
      wires[w].style.opacity = g > 46 ? "1" : "0";
    }
    gapOut.textContent = Math.round(g) + " px";

    var L = layers[front];
    document.getElementById("cNo").textContent = "Sheet S" + (front + 1) + " of S" + TOTAL;
    document.getElementById("cName").textContent = L.name;
    document.getElementById("cNote").textContent = L.note;
    document.getElementById("cPlate").textContent = L.plate;
    document.getElementById("cOffset").textContent = (front === 0 ? 0 : (0 - front) * Math.round(g)) + " px from the front";
    document.getElementById("cDepth").textContent = (1 - Math.min(0.34, front * 0.13)).toFixed(2);
    document.getElementById("cCredit").textContent = L.credit;
  }

  function setFront(n) { front = (n % TOTAL + TOTAL) % TOTAL; paint(); }

  function flatIndex() {
    return front * 2 + plate;
  }

  function show(i) {
    var p = order[((i % N) + N) % N];
    front = p.layer;
    plate = p.shot;
    paint();
    var shot = sheets[front].querySelectorAll(".shot")[plate];
    var img = shot.querySelector("img");
    var L = layers[front];
    vImg.setAttribute("src", img.getAttribute("src"));
    vImg.setAttribute("alt", img.getAttribute("alt"));
    document.getElementById("v-no").textContent = "Plate " + pad(flatIndex() + 1) + " of " + pad(N);
    document.getElementById("v-name").textContent = L.shots[plate].cap;
    document.getElementById("v-note").textContent = L.shots[plate].note;
    document.getElementById("v-credit").textContent = L.shots[plate].credit;
    document.getElementById("v-count").textContent = pad(flatIndex() + 1) + " / " + pad(N);
  }

  function openAt(i) {
    lastFocus = document.activeElement;
    show(i);
    viewer.hidden = false;
    document.getElementById("v-close").focus();
  }

  function close() {
    viewer.hidden = true;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  gap.addEventListener("input", paint);
  document.getElementById("back").addEventListener("click", function () { setFront(front - 1); });
  document.getElementById("fwd").addEventListener("click", function () { setFront(front + 1); });
  document.getElementById("open").addEventListener("click", function () { openAt(front * 2 + plate); });
  document.getElementById("v-prev").addEventListener("click", function () { openAt(flatIndex() - 1); });
  document.getElementById("v-next").addEventListener("click", function () { openAt(flatIndex() + 1); });
  document.getElementById("v-close").addEventListener("click", close);
  viewer.addEventListener("click", function (e) { if (e.target.hasAttribute("data-close")) close(); });

  stage.addEventListener("keydown", function (e) {
    var k = e.key;
    if (k === "ArrowUp" || k === "ArrowLeft") setFront(front - 1);
    else if (k === "ArrowDown" || k === "ArrowRight") {
      var v = Number(gap.value) + (k === "ArrowRight" ? 4 : -4);
      v = Math.max(0, Math.min(100, v));
      gap.value = String(v);
      paint();
    } else if (k === "Home") setFront(0);
    else if (k === "End") setFront(TOTAL - 1);
    else if (k === "Enter" || k === " ") openAt(front * 2 + plate);
    else return;
    e.preventDefault();
  });

  document.addEventListener("keydown", function (e) {
    if (viewer.hidden) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") openAt(flatIndex() - 1);
    else if (e.key === "ArrowRight") openAt(flatIndex() + 1);
    else if (e.key === "Home") openAt(0);
    else if (e.key === "End") openAt(N - 1);
    else return;
    e.preventDefault();
  });

  paint();
})();
