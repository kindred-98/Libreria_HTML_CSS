(function () {
  "use strict";

  var calm = window.matchMedia("(prefers-reduced-motion: reduce)");

  var SHOTS = [
    { n: "Hoodoos", a: "Jon Zander", l: "CC BY-SA 3.0", p: "https://commons.wikimedia.org/wiki/File:Bryce_Canyon_Hoodoos.jpg",
      body: "A queue of orange spires and fins with a pine tree standing at the right hand end of the row, the whole thing framed by two red walls." },
    { n: "The trail", a: "Luca Galuzzi", l: "CC BY-SA 2.5", p: "https://commons.wikimedia.org/wiki/File:USA_10638_Bryce_Canyon_Luca_Galuzzi_2007.jpg",
      body: "A sandy trail threading between red rock, with green pines in the middle distance and two walkers small enough to be punctuation." },
    { n: "Thor&rsquo;s head", a: "Luca Galuzzi", l: "CC BY-SA 2.5", p: "https://commons.wikimedia.org/wiki/File:USA_10654_Bryce_Canyon_Luca_Galuzzi_2007.jpg",
      body: "A hoodoo with a capstone balanced on its neck, standing at the rail above an amphitheatre of red spires and distant mesas." },
    { n: "Red rock wall", a: "Jean trans h+", l: "CC BY-SA 4.0", p: "https://commons.wikimedia.org/wiki/File:Red_Rock_Canyon_State_Park_CA_001.JPG",
      body: "One long banded wall, and a gravel wash in front of it wide enough to lose a town in." },
    { n: "Banded cliffs", a: "King of Hearts", l: "CC BY-SA 4.0", p: "https://commons.wikimedia.org/wiki/File:Red_Rock_Canyon_California_September_2016_001.jpg",
      body: "Red and white bands stacked like a badly made cake, dry shrubs on the sand below and one white bird holding still in the sky." },
    { n: "Layered wall", a: "King of Hearts", l: "CC BY-SA 4.0", p: "https://commons.wikimedia.org/wiki/File:Red_Rock_Canyon_California_September_2016_003.jpg",
      body: "A whole wall of layers, each one a different red, leaning out over ground that has already decided it is desert." },
    { n: "White badlands", a: "RuggyBearLA", l: "CC BY 2.0", p: "https://commons.wikimedia.org/wiki/File:Red_Rock_Canyon_State_Park_(California).jpg",
      body: "Pale eroded ground with a sandy track running straight at a long white ridge, and a sky with nothing in it at all." },
    { n: "Eroded wall", a: "RuggyBearLA", l: "CC BY 2.0", p: "https://commons.wikimedia.org/wiki/File:Red_Rock_Canyon_State_Park_-_51095825221.jpg",
      body: "A wall fluted all the way down by water that is not in the picture, grey and white under an improbable blue." }
  ];

  var N = SHOTS.length;
  var MAXSPREAD = 1;

  var fan = document.getElementById("fan");
  var blades = Array.prototype.slice.call(fan.querySelectorAll(".blade"));
  var frames = Array.prototype.slice.call(document.querySelectorAll("img[data-frame]"));
  var indexLinks = Array.prototype.slice.call(document.querySelectorAll(".index a"));
  var gauge = document.getElementById("gauge");
  var gaugeTxt = document.getElementById("gaugeTxt");
  var wNo = document.getElementById("wNo");
  var wName = document.getElementById("wName");
  var wBody = document.getElementById("wBody");
  var wCredit = document.getElementById("wCredit");

  var lb = document.getElementById("lb");
  var lbImg = document.getElementById("lbImg");
  var lbNo = document.getElementById("lbNo");
  var lbName = document.getElementById("lbName");
  var lbBody = document.getElementById("lbBody");
  var lbCredit = document.getElementById("lbCredit");
  var lbLink = document.getElementById("lbLink");
  var lbX = document.getElementById("lbX");

  var cur = 3;
  var spread = 0.62;
  var shown = 0.62;
  var WOB = 0;
  var t = 0;
  var shot = 0;
  var opener = null;
  var raf = 0;
  var pivot = document.querySelector(".rig__pivot");

  function pad(n) { return n < 10 ? "0" + n : String(n); }

  function paint() {
    var step = 7 + spread * 15;
    for (var k = 0; k < N; k += 1) {
      var d = k - cur;
      var a = d * step + (d === 0 ? WOB * 0.5 : WOB);
      var lift = d === 0 ? 0.9 : Math.abs(d) * 0.22;
      blades[k].style.transform = "translate(-50%, 0) translateY(" + (-lift).toFixed(2) + "rem) rotate(" + a.toFixed(2) + "deg)";
      blades[k].style.zIndex = String(50 - Math.abs(d));
      blades[k].classList.toggle("is-mid", d === 0);
    }
    var s = SHOTS[cur];
    wNo.textContent = "Plate " + pad(cur + 1);
    wName.textContent = s.n;
    wBody.textContent = s.body;
    wCredit.textContent = s.a + " \u00b7 " + s.l;
    indexLinks.forEach(function (a, n) { a.classList.toggle("is-on", n === cur); });
    gauge.style.setProperty("--p", Math.round(spread * 100) + "%");
    gaugeTxt.textContent = "spread " + spread.toFixed(2);
  }

  function go(n) { cur = ((n % N) + N) % N; paint(); }

  function setSpread(v) {
    spread = Math.max(0, Math.min(MAXSPREAD, v));
    paint();
  }

  function openAt(n, from) {
    shot = ((n % N) + N) % N;
    var s = SHOTS[shot];
    var img = frames[shot];
    opener = from || null;
    lbImg.setAttribute("src", img.getAttribute("src"));
    lbImg.setAttribute("alt", img.getAttribute("alt"));
    lbNo.textContent = "Plate " + pad(shot + 1) + " of " + pad(N);
    lbName.textContent = s.n;
    lbBody.textContent = s.body;
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

  fan.addEventListener("click", function (ev) {
    var b = ev.target.closest(".blade");
    if (!b) { return; }
    openAt(Number(b.getAttribute("data-shot")), b);
  });

  indexLinks.forEach(function (a) {
    a.addEventListener("click", function (ev) {
      ev.preventDefault();
      go(Number(a.getAttribute("data-shot")));
    });
  });

  document.getElementById("close").addEventListener("click", function () { setSpread(0); });
  document.getElementById("open").addEventListener("click", function () { setSpread(MAXSPREAD); });
  document.getElementById("prev").addEventListener("click", function () { go(cur - 1); });
  document.getElementById("next").addEventListener("click", function () { go(cur + 1); });
  document.getElementById("view").addEventListener("click", function () {
    openAt(cur, document.getElementById("view"));
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
    if (document.activeElement !== fan) { return; }
    if (ev.key === "ArrowRight") { ev.preventDefault(); go(cur + 1); }
    else if (ev.key === "ArrowLeft") { ev.preventDefault(); go(cur - 1); }
    else if (ev.key === "Home") { ev.preventDefault(); go(0); }
    else if (ev.key === "End") { ev.preventDefault(); go(N - 1); }
    else if (ev.key === "+" || ev.key === "=") { ev.preventDefault(); setSpread(spread + 0.2); }
    else if (ev.key === "-" || ev.key === "_") { ev.preventDefault(); setSpread(spread - 0.2); }
    else if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); openAt(cur, fan); }
  });

  function loop(now) {
    raf = requestAnimationFrame(loop);
    var dt = Math.min(64, now - (last || now));
    last = now;
    t += dt;
    WOB = Math.sin(t / 1250) * 0.9;
    if (Math.abs(spread - shown) > 0.002) {
      shown += (spread - shown) * 0.16;
    } else {
      shown = spread;
    }
    pivot.style.transform = "translateY(" + (Math.sin(t / 1250) * 1.2).toFixed(2) + "px)";
    paint();
  }

  var last = 0;

  paint();
  if (!calm.matches) { raf = requestAnimationFrame(loop); }
  window.addEventListener("pagehide", function () { cancelAnimationFrame(raf); });
}());
