(function () {
  var sections = [
    { name: "Ice block on the black beach", note: "A block of glacier ice that broke off the tongue, drifted down the lagoon and came to rest on volcanic sand. The blue is air that was trapped when the snow fell.", frame: "960 px wide", crop: "4 : 5, centre", ice: "Clear, blue, bubbled", credit: "Andreas Tille, CC BY-SA 4.0" },
    { name: "Glacier du Mont Mallet", note: "A glacier running between bare rock walls toward the basin below. In July the middle is bare ice and both shoulders still hold old snow.", frame: "960 px wide", crop: "3 : 2, upper half", ice: "Bare down the middle", credit: "Ximonic and Simo Räsänen, CC BY-SA 3.0" },
    { name: "Upsala Glacier, Argentina", note: "One of the widest glacier fronts on earth, seen from the air. The turquoise is meltwater held in the crevasse field, and it is the only saturated colour in the frame.", frame: "960 px wide", crop: "16 : 9, band centre", ice: "Crevassed, full of lakes", credit: "NASA Expedition 21 crew, public domain" },
    { name: "Ice on the Tschierva range", note: "A whole range of peaks carrying ice, with the glaciers spilling down between them. From this distance the crevasse fields read as texture rather than as cracks.", frame: "960 px wide", crop: "4 : 5, full frame", ice: "Sheet, crevasse fields", credit: "Daniel Schwen, CC BY-SA 2.5" },
    { name: "Jump below Mount Rainier", note: "A parachutist descending with the snow-covered mountain behind him. The jumper is a few pixels of colour and the mountain is most of the frame.", frame: "960 px wide", crop: "3 : 2, upper third", ice: "Firm, wind packed", credit: "The US Army, public domain" },
    { name: "Summiting the island peak", note: "The last roped step up a narrow ridge, with the camera a metre behind. The exposure is to one side and the ridge line is the only way along.", frame: "960 px wide", crop: "3 : 2, centre", ice: "Soft over firm", credit: "Mountaineer, CC BY 3.0" },
    { name: "Partnachklamm, hanging ice", note: "A limestone gorge in winter with ice built up on the walls. The rock barely shows and the light has nowhere left to go.", frame: "960 px wide", crop: "4 : 5, lower half", ice: "Settled, grey", credit: "Richard Bartz, CC BY-SA 2.5" },
    { name: "Matanuska Glacier mouth", note: "A tidewater front with the ice standing in a wall at the water. The fractures are square because the ice is breaking along planes it grew on.", frame: "960 px wide", crop: "3 : 2, band centre", ice: "Fractured, tidewater", credit: "Sbork, CC BY-SA 3.0" },
    { name: "Shipka Pass in snow", note: "Conifers carrying a full load of snow beside a road that has just been cleared. A mountain pass in February is a cut in a white field and nothing else.", frame: "960 px wide", crop: "3 : 2, lower half", ice: "Fresh, dry", credit: "Psy guy, CC BY-SA 3.0" }
  ];

  var TOTAL = sections.length;
  var GAP = 12.5;
  var fan = document.getElementById("fan");
  var tray = document.getElementById("tray");
  var chips = Array.prototype.slice.call(fan.querySelectorAll(".chip"));
  var openRange = document.getElementById("open");
  var openOut = document.getElementById("open-out");
  var liftRange = document.getElementById("lift");
  var liftOut = document.getElementById("lift-out");
  var fold = document.getElementById("fold");
  var read = document.getElementById("read");
  var viewer = document.getElementById("viewer");
  var vImg = document.getElementById("v-img");
  var active = 0;
  var lastFocus = null;

  function wrap(n) {
    var m = n % TOTAL;
    if (m > TOTAL / 2) m -= TOTAL;
    if (m < -TOTAL / 2) m += TOTAL;
    return m;
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }

  function paint() {
    var open = Number(openRange.value) / 100;
    var lift = Number(liftRange.value);
    for (var i = 0; i < TOTAL; i++) {
      var off = wrap(i - active);
      var ang = off * GAP;
      var reach = open * (lift - Math.abs(off) * 4);
      var chip = chips[i];
      chip.style.transform = "rotate(" + ang + "deg) translateY(" + (-reach) + "px)";
      chip.style.filter = "brightness(" + (1 - Math.min(0.62, Math.abs(off) * 0.13)).toFixed(2) + ")";
      chip.style.opacity = String(Math.max(0.16, 1 - Math.abs(off) * 0.17));
      chip.style.zIndex = String(20 - Math.abs(off));
    }
    var s = sections[active];
    document.getElementById("cNo").textContent = "Section " + pad(active + 1) + " / " + pad(TOTAL);
    document.getElementById("cName").textContent = s.name;
    document.getElementById("cNote").textContent = s.note;
    document.getElementById("cFrame").textContent = s.frame;
    document.getElementById("cCrop").textContent = s.crop;
    document.getElementById("cIce").textContent = s.ice;
    document.getElementById("cBear").textContent = (0) + " deg off the pivot";
    document.getElementById("cCredit").textContent = s.credit;
    var deg = Math.round(open * 60);
    read.textContent = "Section " + pad(active + 1) + " of " + pad(TOTAL) + " \u00b7 fan open to " + deg + " deg";
  }

  function go(n) { active = (n % TOTAL + TOTAL) % TOTAL; paint(); }

  openRange.addEventListener("input", function () {
    openOut.textContent = openRange.value + "%";
    paint();
  });
  liftRange.addEventListener("input", function () {
    liftOut.textContent = liftRange.value + " px";
    paint();
  });
  fold.addEventListener("click", function () {
    var shut = Number(openRange.value) > 4;
    openRange.value = shut ? "0" : "78";
    openOut.textContent = openRange.value + "%";
    fold.setAttribute("aria-pressed", shut ? "true" : "false");
    fold.textContent = shut ? "Open the fan" : "Close the fan";
    paint();
  });
  document.getElementById("back").addEventListener("click", function () { go(active - 1); });
  document.getElementById("fwd").addEventListener("click", function () { go(active + 1); });
  document.getElementById("open-btn").addEventListener("click", function () { openAt(active); });

  tray.addEventListener("keydown", function (e) {
    var k = e.key;
    if (k === "ArrowUp" || k === "ArrowDown") go(active + (k === "ArrowUp" ? -1 : 1));
    else if (k === "ArrowLeft" || k === "ArrowRight") {
      var v = Number(openRange.value) + (k === "ArrowRight" ? 5 : -5);
      v = Math.max(0, Math.min(100, v));
      openRange.value = String(v);
      openOut.textContent = v + "%";
      paint();
    } else if (k === "Home") go(0);
    else if (k === "End") go(TOTAL - 1);
    else if (k === "Enter" || k === " ") openAt(active);
    else return;
    e.preventDefault();
  });

  function fill(n) {
    var s = sections[n];
    var img = chips[n].querySelector("img");
    vImg.setAttribute("src", img.getAttribute("src"));
    vImg.setAttribute("alt", img.getAttribute("alt"));
    document.getElementById("v-no").textContent = "Section " + pad(n + 1) + " of " + pad(TOTAL);
    document.getElementById("v-name").textContent = s.name;
    document.getElementById("v-note").textContent = s.note;
    document.getElementById("v-credit").textContent = s.credit;
    document.getElementById("v-count").textContent = pad(n + 1) + " / " + pad(TOTAL);
  }

  function openAt(n) {
    lastFocus = document.activeElement;
    active = n;
    paint();
    fill(n);
    viewer.hidden = false;
    document.getElementById("v-close").focus();
  }

  function close() {
    viewer.hidden = true;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.getElementById("v-prev").addEventListener("click", function () { openAt((active - 1 + TOTAL) % TOTAL); });
  document.getElementById("v-next").addEventListener("click", function () { openAt((active + 1) % TOTAL); });
  document.getElementById("v-close").addEventListener("click", close);
  viewer.addEventListener("click", function (e) { if ("close" in e.target.dataset) close(); });

  document.addEventListener("keydown", function (e) {
    if (viewer.hidden) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowUp") openAt((active - 1 + TOTAL) % TOTAL);
    else if (e.key === "ArrowDown") openAt((active + 1) % TOTAL);
    else if (e.key === "Home") openAt(0);
    else if (e.key === "End") openAt(TOTAL - 1);
    else return;
    e.preventDefault();
  });

  paint();
})();
