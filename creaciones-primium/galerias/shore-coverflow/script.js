(function () {
  "use strict";

  var calm = window.matchMedia("(prefers-reduced-motion: reduce)");

  var SHOTS = [
    { n: "Shallows", t: "Turquoise water over pale sand", a: "U.S. Navy", l: "Public domain", p: "https://commons.wikimedia.org/wiki/File:US_Navy_080908-N-3595W-003_An_aerial_view_of_the_Haitian_coastline_after_Hurricane_Ike_struck_the_island_nation.jpg" },
    { n: "Silt", t: "Brown plume at a river mouth", a: "Dick Rowan", l: "Public domain", p: "https://commons.wikimedia.org/wiki/File:Coastline_Showing_Siltage_From_River_-_NARA_-_543425.jpg" },
    { n: "East jetty", t: "Stencilled name across the sand", a: "Unidentified photographer", l: "Public domain", p: "https://commons.wikimedia.org/wiki/File:lossy-page1-960px-Naval_Ammunition_and_Net_Depot%2C_Seal_Beach%2C_California._(Aerial_view_of_jetty_and_coastline.)_-_NARA_-_295515.tif.jpg" },
    { n: "The pier", t: "Jetty running out to sea", a: "Unidentified photographer", l: "Public domain", p: "https://commons.wikimedia.org/wiki/File:lossy-page1-960px-Naval_Ammunition_and_Net_Depot%2C_Seal_Beach%2C_California._(Aerial_view_showing_jetty_jutting_into_ocean_and_coastline...)_-_NARA_-_295516.tif.jpg" },
    { n: "Highway haze", t: "Beach, pier and road in one frame", a: "Unidentified photographer", l: "Public domain", p: "https://commons.wikimedia.org/wiki/File:Naval_Ammunition_and_Net_Depot%2C_Seal_Beach%2C_California._(Aerial_view_showing_jetty_jutting_into_ocean_and_coastline...)_-_NARA_-_295516.jpg" },
    { n: "Golden sand", t: "Beach curve below the suburb", a: "Leon Brooks", l: "Public domain", p: "https://commons.wikimedia.org/wiki/File:Adelaide_coastline_with_marine.jpg" },
    { n: "Two bays", t: "Headland between turquoise water", a: "Don Ramey Logan", l: "CC BY 4.0", p: "https://commons.wikimedia.org/wiki/File:So_Cal_Coastline_photo_Don_Ramey_Logan.jpg" },
    { n: "City grid", t: "Long beach under a street plan", a: "Michael Coghlan", l: "CC BY-SA 2.0", p: "https://commons.wikimedia.org/wiki/File:Adelaide_-_Southern_Coastline_(16066639908).jpg" },
    { n: "From the window", t: "Beach and city from the air", a: "Ritik Samaiya", l: "CC BY-SA 4.0", p: "https://commons.wikimedia.org/wiki/File:Mumbai_coastline,_juhu_beach.jpg" }
  ];

  var TIDE = [0.42, 0.51, 0.38, 0.44, 0.47, 0.55, 0.33, 0.49, 0.40];
  var SWASH = ["closed", "setting", "closed", "rising", "closed", "setting", "closed", "rising", "closed"];

  var N = SHOTS.length;
  var STEP = 168;

  var deck = document.getElementById("deck");
  var cards = Array.prototype.slice.call(deck.querySelectorAll(".card"));
  var frames = Array.prototype.slice.call(deck.querySelectorAll("img[data-frame]"));
  var rows = Array.prototype.slice.call(document.querySelectorAll(".tide__t tbody tr"));
  var ruler = document.getElementById("ruler");
  var gPlate = document.getElementById("gPlate");
  var gBear = document.getElementById("gBear");
  var gTide = document.getElementById("gTide");
  var gSwash = document.getElementById("gSwash");
  var gSpread = document.getElementById("gSpread");
  var pick = document.getElementById("pick");

  var lb = document.getElementById("lb");
  var lbImg = document.getElementById("lbImg");
  var lbNo = document.getElementById("lbNo");
  var lbName = document.getElementById("lbName");
  var lbRead = document.getElementById("lbRead");
  var lbCredit = document.getElementById("lbCredit");
  var lbLink = document.getElementById("lbLink");
  var lbX = document.getElementById("lbX");

  var marks = [];
  var cur = 4;
  var spread = 0;
  var shot = 0;
  var opener = null;
  var t = 0;
  var raf = 0;
  var last = 0;

  var run = document.getElementById("run");
  var water = deck.querySelector(".deck__water");

  function pad(n) { return n < 10 ? "0" + n : String(n); }

  for (var i = 0; i < 33; i += 1) {
    var m = document.createElement("i");
    ruler.appendChild(m);
    marks.push(m);
  }

  function paint() {
    for (var k = 0; k < N; k += 1) {
      var d = k - cur;
      var a = Math.abs(d);
      var lean = d * (34 - spread * 8);
      var back = -a * (86 - spread * 14);
      var scale = Math.max(0.5, 1 - a * (0.17 - spread * 0.03));
      var dim = Math.max(0.16, 1 - a * (0.3 - spread * 0.06));
      cards[k].style.transform = "translate3d(" + (d * STEP * (1 + spread * 0.28)).toFixed(1) + "px, 0, " + back.toFixed(1) + "px) rotateY(" + lean.toFixed(1) + "deg) scale(" + scale.toFixed(3) + ")";
      cards[k].style.opacity = dim.toFixed(3);
      cards[k].classList.toggle("is-mid", d === 0);
      cards[k].style.zIndex = String(100 - a);
      rows[k].classList.toggle("is-on", k === cur);
    }
    var s = SHOTS[cur];
    gPlate.textContent = pad(cur + 1) + " / " + pad(N);
    gBear.textContent = pad((cur * 45) % 360) + "\u00b0";
    gTide.textContent = TIDE[cur].toFixed(2) + " m";
    gSwash.textContent = SWASH[cur];
    gSpread.textContent = spread.toFixed(2);
    pick.textContent = pad(cur + 1) + " \u00b7 " + s.n.toLowerCase();
    for (var q = 0; q < marks.length; q += 1) {
      marks[q].style.opacity = Math.abs(q - 16 - (cur - 4)) <= 1 ? "1" : "0.28";
    }
  }

  function go(n) {
    cur = ((n % N) + N) % N;
    paint();
  }

  function setSpread(v) {
    spread = Math.max(0, Math.min(1.6, v));
    paint();
  }

  function openAt(n, from) {
    shot = ((n % N) + N) % N;
    var s = SHOTS[shot];
    var img = frames[shot];
    opener = from || null;
    lbImg.setAttribute("src", img.getAttribute("src"));
    lbImg.setAttribute("alt", img.getAttribute("alt"));
    lbNo.textContent = "Frame " + pad(shot + 1) + " of " + pad(N);
    lbName.textContent = s.n;
    lbRead.textContent = s.t;
    lbCredit.textContent = s.a + " \u00b7 " + s.l;
    lbLink.setAttribute("href", s.p);
    lb.hidden = false;
    requestAnimationFrame(function () { lb.classList.add("is-open"); });
    lbX.focus();
  }

  function close() {
    lb.classList.remove("is-open");
    var seal = function () { lb.hidden = true; };
    if (calm.matches) { seal(); } else { setTimeout(seal, 280); }
    if (opener && document.contains(opener)) { opener.focus(); }
    opener = null;
  }

  function ring() {
    return Array.prototype.slice.call(
      lb.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])')
    ).filter(function (el) { return el.offsetParent !== null; });
  }

  deck.addEventListener("click", function (ev) {
    var b = ev.target.closest(".card__face");
    if (!b) { return; }
    openAt(Number(b.getAttribute("data-shot")), b);
  });

  rows.forEach(function (r, k) {
    r.style.cursor = "pointer";
    r.addEventListener("click", function () { go(k); });
  });

  document.getElementById("prev").addEventListener("click", function () { go(cur - 1); });
  document.getElementById("next").addEventListener("click", function () { go(cur + 1); });
  document.getElementById("tight").addEventListener("click", function () { setSpread(spread - 0.3); });
  document.getElementById("wide").addEventListener("click", function () { setSpread(spread + 0.3); });
  document.getElementById("open").addEventListener("click", function () {
    openAt(cur, document.getElementById("open"));
  });

  lbX.addEventListener("click", close);
  lb.querySelector(".lb__veil").addEventListener("click", close);
  document.getElementById("lbPrev").addEventListener("click", function () { openAt(shot - 1, null); });
  document.getElementById("lbNext").addEventListener("click", function () { openAt(shot + 1, null); });

  document.addEventListener("keydown", function (ev) {
    if (!lb.hidden) {
      if (ev.key === "Escape") { ev.preventDefault(); close(); return; }
      if (ev.key === "Tab") {
        var box = ring();
        if (!box.length) { return; }
        var pos = box.indexOf(document.activeElement);
        var nxt = ev.shiftKey ? pos - 1 : pos + 1;
        if (nxt < 0 || nxt >= box.length) {
          ev.preventDefault();
          box[(nxt + box.length) % box.length].focus();
        }
        return;
      }
      if (ev.key === "ArrowRight") { ev.preventDefault(); openAt(shot + 1, null); }
      else if (ev.key === "ArrowLeft") { ev.preventDefault(); openAt(shot - 1, null); }
      else if (ev.key === "Home") { ev.preventDefault(); openAt(0, null); }
      else if (ev.key === "End") { ev.preventDefault(); openAt(N - 1, null); }
      return;
    }
    if (document.activeElement !== deck) { return; }
    if (ev.key === "ArrowRight") { ev.preventDefault(); go(cur + 1); }
    else if (ev.key === "ArrowLeft") { ev.preventDefault(); go(cur - 1); }
    else if (ev.key === "Home") { ev.preventDefault(); go(0); }
    else if (ev.key === "End") { ev.preventDefault(); go(N - 1); }
    else if (ev.key === "+" || ev.key === "=") { ev.preventDefault(); setSpread(spread + 0.2); }
    else if (ev.key === "-" || ev.key === "_") { ev.preventDefault(); setSpread(spread - 0.2); }
    else if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); openAt(cur, deck); }
  });

  function loop(now) {
    raf = requestAnimationFrame(loop);
    var dt = Math.min(64, now - (last || now));
    last = now;
    t += dt;
    var bob = Math.sin(t / 1500) * 4.5;
    run.style.transform = "translate3d(0," + bob.toFixed(2) + "px, 0)";
    water.style.transform = "translate3d(0," + (bob * 0.45).toFixed(2) + "px, 0)";
  }

  paint();
  if (!calm.matches) { raf = requestAnimationFrame(loop); }
  window.addEventListener("resize", function () { paint(); });
  window.addEventListener("pagehide", function () { cancelAnimationFrame(raf); });
}());
