(function () {
  var F = [
    { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Millennium_stadium_concert.jpg/960px-Millennium_stadium_concert.jpg", alt: "A vast indoor arena packed from the floor to the rafters with a lit stage at the right", pos: "50% 50%", tc: "00:14:22:08", srcTag: "CROWD", name: "The floor, packed to the rafters", note: "The widest frame in the set and the one that sets the scale for all the others. From the back of the bowl the crowd is a single textured mass with no gaps in it, and the only bright thing in the picture is the stage at the far right.", credit: "Andrew King, CC BY-SA 2.0", att: "58 400", fill: 94, temp: 17, snd: 102 },
    { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Millennium_stadium_concert.jpg/960px-Millennium_stadium_concert.jpg", alt: "A stadium bowl seen from a high corner with tiers of red seats and a big stage rig on the right", pos: "50% 44%", tc: "00:21:47:19", srcTag: "BOWL", name: "The bowl from the corner", note: "The same crowd from the press corner, where the geometry becomes visible. Red seating, a roof structure running the full width, and the stage rig filling the right third of the frame like a second building.", credit: "Andrew King, CC BY-SA 2.0", att: "58 400", fill: 94, temp: 16, snd: 99 },
    { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Millennium_stadium_concert.jpg/960px-Millennium_stadium_concert.jpg", alt: "A floodlit stadium at night with a large crowd standing on the grass and light towers around it", pos: "50% 46%", tc: "01:02:10:02", srcTag: "PITCH", name: "Everybody on the grass", note: "The end of the night, when the field stops being a pitch and becomes a floor. Floodlights at full and a crowd spread across the grass, with the stands almost empty behind them.", credit: "Edward Hyde, CC BY-SA 2.0", att: "41 900", fill: 72, temp: 12, snd: 96 },
    { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Millennium_stadium_concert.jpg/960px-Millennium_stadium_concert.jpg", alt: "A packed stadium stand of people waving red inflatable clappers under a tiered roof", pos: "50% 48%", tc: "00:38:04:11", srcTag: "CLAPPERS", name: "Red clappers, one stand", note: "Shot from the front of the tier with the long lens, so every face in the frame is turned the same way. The red inflatable sticks are the only saturated colour in the picture and they move as one.", credit: "USAID Vietnam, Public domain", att: "58 400", fill: 96, temp: 17, snd: 104 },
    { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Millennium_stadium_concert.jpg/960px-Millennium_stadium_concert.jpg", alt: "A grandstand full of people at dusk with warm house lights and dozens of phone lights in the crowd", pos: "50% 52%", tc: "00:52:31:00", srcTag: "DUSK", name: "Dusk, and every phone comes up", note: "Twenty minutes before the light goes, the stand turns into a field of small white points. The warm house lights under the roof and the cold phone lights in the crowd are two different colour temperatures in one frame.", credit: "USAID Vietnam, Public domain", att: "55 100", fill: 91, temp: 15, snd: 101 },
    { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Millennium_stadium_concert.jpg/960px-Millennium_stadium_concert.jpg", alt: "A full upper tier of seated spectators under a blue roof with floodlight masts either side", pos: "50% 42%", tc: "01:15:09:14", srcTag: "UPPER", name: "The upper tier, seated", note: "The calmest frame of the nine. Everyone is sitting, the blue roof is doing all the colour work, and the two light masts at the edges are the only verticals tall enough to measure the stand against.", credit: "USAID Vietnam, Public domain", att: "58 400", fill: 95, temp: 14, snd: 97 },
    { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Millennium_stadium_concert.jpg/960px-Millennium_stadium_concert.jpg", alt: "A guitarist in a green jacket and hat on a blue-lit stage with one arm raised", pos: "50% 34%", tc: "00:47:55:23", srcTag: "STAGE L", name: "Stage left, arm up", note: "Cut to the stage for the first time, and the whole character of the set changes. One man in a green jacket against a blue wall, lit from the front, with the crowd somewhere below the bottom of the frame.", credit: "Raph_PH, CC BY 2.0", att: "58 400", fill: 94, temp: 19, snd: 108 },
    { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Millennium_stadium_concert.jpg/960px-Millennium_stadium_concert.jpg", alt: "A singer in a red jacket on a dark stage with one arm raised and the band behind him", pos: "50% 30%", tc: "00:48:31:05", srcTag: "STAGE C", name: "Stage centre, red jacket", note: "Same lens, same distance, opposite side of the stage. The red jacket is the only warm colour in the entire broadcast apart from the terracotta you are reading this on.", credit: "Raph_PH, CC BY 2.0", att: "58 400", fill: 94, temp: 19, snd: 110 },
    { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Millennium_stadium_concert.jpg/960px-Millennium_stadium_concert.jpg", alt: "A guitarist in a green jacket and a cap pointing out into the crowd through stage smoke", pos: "50% 32%", tc: "00:49:02:17", srcTag: "STAGE R", name: "Stage right, pointing out", note: "Last frame, taken after the set with the smoke still in the air and the crowd already leaving. The gesture is aimed at the dark rather than at the camera, which is the only reason this frame is last.", credit: "Raph_PH, CC BY 2.0", att: "37 600", fill: 64, temp: 18, snd: 93 }
  ];

  var vf = document.getElementById("vf");
  var plate = Array.prototype.slice.call(document.querySelectorAll(".vf__p"));
  var half = document.getElementById("halftone");
  var bowl = document.getElementById("bowl");
  var gate = document.getElementById("gate");
  var gateOut = document.getElementById("gateOut");
  var idx = Array.prototype.slice.call(document.querySelectorAll(".idx a"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".bowl span"));
  var viewer = document.getElementById("viewer");
  var vImg = document.getElementById("vImg");
  var at = 0;
  var halfOn = false;
  var lastFocus = null;

  function pad(n) { return (n < 10 ? "0" : "") + n; }

  function buildBowl() {
    var f = document.createDocumentFragment();
    for (var r = 0; r < 8; r++) {
      for (var c = 0; c < 13; c++) {
        var s = document.createElement("span");
        s.dataset.u = ((c + 0.5) / 13).toFixed(4);
        s.dataset.v = ((r + 0.5) / 8).toFixed(4);
        f.appendChild(s);
      }
    }
    bowl.appendChild(f);
    dots = Array.prototype.slice.call(bowl.querySelectorAll("span"));
  }

  function drawBowl() {
    var g = Number(gate.value);
    var need = (8 - g) / 8 * 1.16;
    for (var dot of dots) {
      var u = Number.parseFloat(dot.dataset.u);
      var v = Number.parseFloat(dot.dataset.v);
      var rr = Math.sqrt(Math.pow((u - 0.5) / 0.48, 2) + Math.pow((v - 0.5) / 0.47, 2));
      var pitch = v > 0.34 && v < 0.7 && u > 0.22 && u < 0.78;
      var w = Math.max(0, 1 - Math.abs(rr - 0.74) / 0.74);
      var wob = 0.5 + 0.5 * Math.sin(u * 29.3 + v * 21.1);
      var on = !pitch && rr < 0.99 && (w + 0.22 * wob) > need;
      dot.style.setProperty("--o", on ? (0.52 + 0.48 * w).toFixed(3) : "0.3");
      dot.style.setProperty("--a", on ? (0.3 + 0.7 * w).toFixed(3) : "0.09");
    }
  }

  function paint() {
    var d = F[at];
    for (var p = 0; p < plate.length; p++) plate[p].classList.toggle("is-on", p === at);
    document.getElementById("fNo").textContent = "FRAME " + pad(at + 1);
    document.getElementById("fTc").textContent = d.tc;
    document.getElementById("fSrc").textContent = d.srcTag;
    document.getElementById("fGate").textContent = gate.value;
    document.getElementById("rNo").textContent = "Frame " + pad(at + 1);
    document.getElementById("rTc").textContent = d.tc;
    document.getElementById("rName").textContent = d.name;
    document.getElementById("rNote").textContent = d.note;
    document.getElementById("rCredit").textContent = d.credit;
    document.getElementById("tAtt").textContent = d.att;
    document.getElementById("tFill").textContent = d.fill;
    document.getElementById("tTemp").textContent = d.temp;
    document.getElementById("tSnd").textContent = d.snd;
    for (var k = 0; k < idx.length; k++) {
      idx[k].classList.toggle("is-on", k === at);
      idx[k].setAttribute("aria-current", k === at ? "true" : "false");
    }
    half.classList.toggle("is-on", halfOn);
    gateOut.textContent = gate.value;
    document.getElementById("pGate").textContent = "Gate " + gate.value;
    drawBowl();
  }

  function go(n) { at = Math.max(0, Math.min(F.length - 1, n)); paint(); }

  function fillPlate(n) {
    var d = F[n];
    vImg.setAttribute("src", d.src);
    vImg.setAttribute("alt", d.alt);
    vImg.style.objectPosition = d.pos;
    document.getElementById("vNo").textContent = "FRAME " + pad(n + 1) + " \u00b7 " + d.tc;
    document.getElementById("vName").textContent = d.name;
    document.getElementById("vNote").textContent = d.note;
    document.getElementById("vCredit").textContent = d.credit;
    document.getElementById("vCount").textContent = pad(n + 1) + " / " + pad(F.length);
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

  buildBowl();
  idx.forEach(function (a, i) {
    a.addEventListener("click", function (e) { e.preventDefault(); go(i); });
  });
  gate.addEventListener("input", paint);
  document.getElementById("back").addEventListener("click", function () { go(at - 1); });
  document.getElementById("fwd").addEventListener("click", function () { go(at + 1); });
  document.getElementById("half").addEventListener("click", function () {
    halfOn = !halfOn;
    this.textContent = halfOn ? "Halftone off" : "Halftone on";
    this.setAttribute("aria-pressed", halfOn ? "true" : "false");
    paint();
  });
  document.getElementById("open").addEventListener("click", function () { openAt(at); });
  document.getElementById("vPrev").addEventListener("click", function () { openAt((at - 1 + F.length) % F.length); });
  document.getElementById("vNext").addEventListener("click", function () { openAt((at + 1) % F.length); });
  document.getElementById("vClose").addEventListener("click", close);
  viewer.addEventListener("click", function (e) { if ("close" in e.target.dataset) close(); });

  vf.addEventListener("keydown", function (e) {
    var k = e.key;
    if (k === "ArrowRight") go(at + 1);
    else if (k === "ArrowLeft") go(at - 1);
    else if (k === "PageDown") go(at + 3);
    else if (k === "PageUp") go(at - 3);
    else if (k === "Home") go(0);
    else if (k === "End") go(F.length - 1);
    else if (k === "Enter" || k === " ") { if (e.target !== vf) return; openAt(at); }
    else if (k === "h" || k === "H") document.getElementById("half").click();
    else return;
    e.preventDefault();
  });

  document.addEventListener("keydown", function (e) {
    if (viewer.hidden) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") openAt((at - 1 + F.length) % F.length);
    else if (e.key === "ArrowRight") openAt((at + 1) % F.length);
    else if (e.key === "Home") openAt(0);
    else if (e.key === "End") openAt(F.length - 1);
    else return;
    e.preventDefault();
  });

  paint();
})();
