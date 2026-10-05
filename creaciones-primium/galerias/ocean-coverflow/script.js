(function () {
  var plates = [
    { name: "Drone view of ocean waves", note: "Shot from above, so the swell reads as a set of parallel bands instead of a horizon. The water is one colour and the foam is not.", frame: "960 px wide", crop: "3 : 2, upper third", water: "Deep, long swell", credit: "Caleb Jones, CC0" },
    { name: "Water waves in the Adriatic Sea", note: "One wave, breaking once, in water with enough depth to keep its shape to the last second. The spray at the lip is the wind taking the foam apart.", frame: "960 px wide", crop: "4 : 3, centre", water: "Deep, single break", credit: "Firilacroco, CC BY 3.0" },
    { name: "Storm waves in Santa Cruz", note: "The wave does not break so much as arrive. Everything above the lip is airborne and nothing in it holds a shape for longer than a second.", frame: "960 px wide", crop: "3 : 2, lower half", water: "Storm, over rock", credit: "Christine Hegermiller, USGS, public domain" },
    { name: "Contest break", note: "A surfer dropped down the face of a wave far larger than he is. The photograph is taken from inside the impact zone, which is why the spray is behind him and not above.", frame: "960 px wide", crop: "16 : 9, band centre", water: "Breaking, deep", credit: "Shalom Jacobovitz, CC BY-SA 2.0" },
    { name: "Waves smashing the sea wall", note: "A line of timber posts and one person standing behind it. The wave arrives at the posts first and the person is the only fixed thing in the frame that is not being moved.", frame: "960 px wide", crop: "4 : 5, lower half", water: "Reflected, onshore", credit: "Rad Dougall, CC BY 3.0" },
    { name: "Caparica, December 2011", note: "A surfer on a clean face with the spray just starting behind him. The wave is only a metre or two over, which is why the rider fits inside it.", frame: "960 px wide", crop: "3 : 2, centre left", water: "Clean, short", credit: "Alvesgaspar, CC BY-SA 3.0" },
    { name: "Porto Covo, January 2014", note: "Green water over black ledges. The rock decides where each wave breaks, so the white is scattered in patches instead of running in a line.", frame: "960 px wide", crop: "3 : 2, centre", water: "Cold, over rock", credit: "Alvesgaspar, CC BY-SA 3.0" },
    { name: "Long Spit, Sea of Azov", note: "A sand beach wide enough that the sea is a thin dark line in the lower third. The whole top two thirds is weather.", frame: "960 px wide", crop: "16 : 9, top third", water: "Flat, shallow", credit: "AlixSaz, CC BY-SA 4.0" },
    { name: "Waves on the Theatre de la Mer", note: "Rock in the foreground, surf in the middle, a lit city on the far shore. Three distances in one frame and the sea gets the whole band between them.", frame: "960 px wide", crop: "3 : 2, lower half", water: "Surf over rock", credit: "Christian Ferrer, CC BY 4.0" }
  ];

  var STEP = 32;
  var TOTAL = plates.length;
  var ring = document.getElementById("ring");
  var drum = document.getElementById("drum");
  var cards = Array.prototype.slice.call(ring.querySelectorAll(".card"));
  var radius = document.getElementById("radius");
  var radiusOut = document.getElementById("radius-out");
  var pace = document.getElementById("pace");
  var paceOut = document.getElementById("pace-out");
  var hold = document.getElementById("hold");
  var mirror = document.getElementById("mirror");
  var tick = document.getElementById("tick");
  var viewer = document.getElementById("viewer");
  var vImg = document.getElementById("v-img");
  var active = 0;
  var held = false;
  var timer = null;
  var lastFocus = null;

  function wrapStep(n) {
    var m = n % TOTAL;
    if (m > TOTAL / 2) m -= TOTAL;
    if (m < -TOTAL / 2) m += TOTAL;
    return m;
  }

  function pad(n) { return (n < 10 ? "0" : "") + n; }

  function paint() {
    var drumW = drum.clientWidth || 800;
    var eff = Math.max(140, Math.min(Number(radius.value), drumW * 0.5 - 26));
    ring.style.transform = "translateZ(" + (-eff) + "px) rotateX(-7deg) rotateY(" + (-active * STEP) + "deg)";
    for (var i = 0; i < TOTAL; i++) {
      var off = wrapStep(i - active) * STEP;
      var abs = Math.abs(off);
      var dim = Math.min(1, abs / 130);
      var card = cards[i];
      card.style.transform = "rotateY(" + off + "deg) translateZ(" + eff + "px)";
      card.style.setProperty("--dim", dim.toFixed(3));
      card.style.opacity = abs > 94 ? "0" : "1";
    }
    var p = plates[active];
    document.getElementById("pNo").textContent = "Plate " + pad(active + 1);
    document.getElementById("pName").textContent = p.name;
    document.getElementById("pNote").textContent = p.note;
    document.getElementById("pFrame").textContent = p.frame;
    document.getElementById("pCrop").textContent = p.crop;
    document.getElementById("pWater").textContent = p.water;
    document.getElementById("pAxis").textContent = eff + " px radius";
    document.getElementById("pCredit").textContent = p.credit;
    tick.textContent = "Plate " + pad(active + 1) + " / " + pad(TOTAL) + " \u00b7 front plate 0 deg off axis";
    var img = cards[active].querySelector("img");
    if (mirror.getAttribute("src") !== img.getAttribute("src")) mirror.setAttribute("src", img.getAttribute("src"));
  }

  function go(n) {
    active = (n % TOTAL + TOTAL) % TOTAL;
    paint();
  }

  function arm() {
    if (timer) { clearInterval(timer); timer = null; }
    if (held || Number(pace.value) <= 0) return;
    timer = setInterval(function () { go(active + 1); }, Number(pace.value));
  }

  radius.addEventListener("input", function () {
    radiusOut.textContent = radius.value + " px";
    paint();
  });

  pace.addEventListener("input", function () {
    var s = Number(pace.value);
    paceOut.textContent = s === 0 ? "held" : (s / 1000).toFixed(1) + " s a turn";
    arm();
  });

  hold.addEventListener("click", function () {
    held = !held;
    hold.setAttribute("aria-pressed", held ? "true" : "false");
    hold.textContent = held ? "Turn the drum" : "Hold the drum";
    arm();
  });

  document.getElementById("ring-back").addEventListener("click", function () { go(active - 1); });
  document.getElementById("ring-fwd").addEventListener("click", function () { go(active + 1); });
  document.getElementById("open").addEventListener("click", function () { open(active); });

  drum.addEventListener("keydown", function (e) {
    var k = e.key;
    if (k === "ArrowLeft" || k === "ArrowRight") {
      go(active + (k === "ArrowRight" ? 1 : -1));
    } else if (k === "ArrowUp" || k === "ArrowDown") {
      var v = Number(radius.value) + (k === "ArrowUp" ? 40 : -40);
      v = Math.max(200, Math.min(620, v));
      radius.value = String(v);
      radiusOut.textContent = v + " px";
      paint();
    } else if (k === "Home") {
      go(0);
    } else if (k === "End") {
      go(TOTAL - 1);
    } else if (k === "Enter" || k === " ") {
      open(active);
    } else {
      return;
    }
    e.preventDefault();
  });

  function fill(n) {
    var p = plates[n];
    vImg.setAttribute("src", cards[n].querySelector("img").getAttribute("src"));
    vImg.setAttribute("alt", cards[n].querySelector("img").getAttribute("alt"));
    document.getElementById("v-no").textContent = "Plate " + pad(n + 1) + " of " + pad(TOTAL);
    document.getElementById("v-name").textContent = p.name;
    document.getElementById("v-note").textContent = p.note;
    document.getElementById("v-credit").textContent = p.credit;
    document.getElementById("v-count").textContent = pad(n + 1) + " / " + pad(TOTAL);
  }

  function open(n) {
    lastFocus = document.activeElement;
    active = n;
    fill(n);
    paint();
    viewer.hidden = false;
    document.getElementById("v-close").focus();
  }

  function close() {
    viewer.hidden = true;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.getElementById("v-prev").addEventListener("click", function () { open((active - 1 + TOTAL) % TOTAL); });
  document.getElementById("v-next").addEventListener("click", function () { open((active + 1) % TOTAL); });
  document.getElementById("v-close").addEventListener("click", close);
  viewer.addEventListener("click", function (e) {
    if ("close" in e.target.dataset) close();
  });

  document.addEventListener("keydown", function (e) {
    if (viewer.hidden) return;
    if (e.key === "Escape") { close(); }
    else if (e.key === "ArrowLeft") { open((active - 1 + TOTAL) % TOTAL); }
    else if (e.key === "ArrowRight") { open((active + 1) % TOTAL); }
    else if (e.key === "Home") { open(0); }
    else if (e.key === "End") { open(TOTAL - 1); }
    else return;
    e.preventDefault();
  });

  paint();
  arm();
})();
