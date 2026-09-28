(function () {
  "use strict";

  var calm = window.matchMedia("(prefers-reduced-motion: reduce)");

  var REEL = [
    {
      t: "Fortress in a mountain landscape", a: "Jakob Wilhelm Huber", l: "CC0", extra: "1810",
      u: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Jakob_Wilhelm_Huber%2C_A_Fortress_in_a_Mountain_Landscape_at_Sunrise%2C_1810%2C_NGA_154623.jpg/960px-Jakob_Wilhelm_Huber%2C_A_Fortress_in_a_Mountain_Landscape_at_Sunrise%2C_1810%2C_NGA_154623.jpg",
      p: "https://commons.wikimedia.org/wiki/File:Jakob_Wilhelm_Huber,_A_Fortress_in_a_Mountain_Landscape_at_Sunrise,_1810,_NGA_154623.jpg",
      alt: "Nineteenth century oil painting of a fortress in a mountain landscape at sunrise"
    },
    {
      t: "Frosty morning over Yaremche", a: "Vitalii Bashkatov", l: "CC BY-SA 4.0", extra: "Carpathians",
      u: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/%D0%9C%D0%BE%D1%80%D0%BE%D0%B7%D0%BD%D0%B8%D0%B9_%D1%80%D0%B0%D0%BD%D0%BE%D0%BA_%D0%BD%D0%B0%D0%B4_%D0%AF%D1%80%D0%B5%D0%BC%D1%87%D0%B5%D1%8E.jpg/960px-%D0%9C%D0%BE%D1%80%D0%BE%D0%B7%D0%BD%D0%B8%D0%B9_%D1%80%D0%B0%D0%BD%D0%BE%D0%BA_%D0%BD%D0%B0%D0%B4_%D0%AF%D1%80%D0%B5%D0%BC%D1%87%D0%B5%D1%8E.jpg",
      p: "https://commons.wikimedia.org/wiki/File:%D0%9C%D0%BE%D1%80%D0%BE%D0%B7%D0%BD%D0%B8%D0%B9_%D1%80%D0%B0%D0%BD%D0%BE%D0%BA_%D0%BD%D0%B0%D0%B4_%D0%AF%D1%80%D0%B5%D0%BC%D1%87%D0%B5%D1%8E.jpg",
      alt: "Frosty morning light over a wooded valley and village in the Carpathians"
    },
    {
      t: "Sugarloaf at sunrise", a: "Donatas Dabravolskas", l: "CC BY-SA 4.0", extra: "first light",
      u: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Sugarloaf_Sunrise_2.jpg/960px-Sugarloaf_Sunrise_2.jpg",
      p: "https://commons.wikimedia.org/wiki/File:Sugarloaf_Sunrise_2.jpg",
      alt: "Sugarloaf summit lit from the side above a lake filled with valley fog"
    },
    {
      t: "The Flatirons at sunrise", a: "Tyler Cipriani", l: "CC BY-SA 4.0", extra: "tilted slabs",
      u: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Flatirons_Sunrise.jpg/960px-Flatirons_Sunrise.jpg",
      p: "https://commons.wikimedia.org/wiki/File:Flatirons_Sunrise.jpg",
      alt: "Tilted rock slabs of the Flatirons glowing under low sunrise light"
    },
    {
      t: "Bieszczady from the watchtower", a: "Pudelek", l: "CC BY-SA 4.0", extra: "ridge line",
      u: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Bieszczady_-_sunrise_from_Chatka_Puchatka_%282%29.jpg/960px-Bieszczady_-_sunrise_from_Chatka_Puchatka_%282%29.jpg",
      p: "https://commons.wikimedia.org/wiki/File:Bieszczady_-_sunrise_from_Chatka_Puchatka_(2).jpg",
      alt: "Sunrise seen from Chatka Puchatka watchtower over the Bieszczady ridge"
    },
    {
      t: "Loch in the saddle", a: "Michal Klajban", l: "CC BY-SA 4.0", extra: "Scotland",
      u: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/A_small_loch_in_the_saddle_between_Beinn_an_Dothaidh_and_Beinn_Dorain%2C_Scotland_01.jpg/960px-A_small_loch_in_the_saddle_between_Beinn_an_Dothaidh_and_Beinn_Dorain%2C_Scotland_01.jpg",
      p: "https://commons.wikimedia.org/wiki/File:A_small_loch_in_the_saddle_between_Beinn_an_Dothaidh_and_Beinn_Dorain,_Scotland_01.jpg",
      alt: "A small dark loch held in the saddle between two Scottish peaks"
    },
    {
      t: "Maligne Lake, first light", a: "Sergey Pesterev", l: "CC BY-SA 4.0", extra: "Rockies",
      u: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Sunrise_at_Maligne_lake_2.jpg/960px-Sunrise_at_Maligne_lake_2.jpg",
      p: "https://commons.wikimedia.org/wiki/File:Sunrise_at_Maligne_lake_2.jpg",
      alt: "Pink sunrise mirrored on the still water of Maligne Lake in the Rockies"
    },
    {
      t: "Maligne Lake, morning", a: "Sergey Pesterev", l: "CC BY-SA 4.0", extra: "Rockies",
      u: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Sunrise_at_Maligne_lake.jpg/960px-Sunrise_at_Maligne_lake.jpg",
      p: "https://commons.wikimedia.org/wiki/File:Sunrise_at_Maligne_lake.jpg",
      alt: "Sun rising behind the peaks of the Canadian Rockies above Maligne Lake"
    },
    {
      t: "Autumn mountain sunrise", a: "ForestWander", l: "CC BY-SA 3.0 US", extra: "West Virginia",
      u: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Autumn-mountain-sky-sunrise-colors_-_West_Virginia_-_ForestWander.jpg/960px-Autumn-mountain-sky-sunrise-colors_-_West_Virginia_-_ForestWander.jpg",
      p: "https://commons.wikimedia.org/wiki/File:Autumn-mountain-sky-sunrise-colors_-_West_Virginia_-_ForestWander.jpg",
      alt: "Amber and rust autumn mountain slopes catching the first light in West Virginia"
    }
  ];

  var gate = document.getElementById("gate");
  var gateImg = document.getElementById("gateImg");
  var giant = document.getElementById("giant");
  var capT = document.getElementById("capT");
  var capA = document.getElementById("capA");
  var ticksList = document.getElementById("ticks");
  var tally = document.querySelector(".rail__tally");
  var bar = document.getElementById("bar");
  var bandOne = document.getElementById("bandOne");
  var bandTwo = document.getElementById("bandTwo");
  var play = document.getElementById("play");

  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  var ticks = REEL.map(function (frame, i) {
    var li = document.createElement("li");
    var b = document.createElement("button");
    b.type = "button";
    b.className = "ticks__tick";
    b.setAttribute("aria-label", "Go to frame " + (i + 1));
    b.setAttribute("aria-pressed", "false");
    li.appendChild(b);
    ticksList.appendChild(li);
    return b;
  });

  var at = 0;
  var wiping = false;

  function go(n, dir) {
    at = (n + REEL.length) % REEL.length;
    var frame = REEL[at];
    gateImg.setAttribute("src", frame.u);
    gateImg.setAttribute("alt", frame.alt);
    giant.textContent = pad(at + 1);
    capT.textContent = frame.t;
    capA.textContent = frame.a + " \u00b7 " + frame.l + " \u00b7 " + frame.extra;
    tally.textContent = "Frame " + pad(at + 1) + " of " + pad(REEL.length);
    ticks.forEach(function (tick, k) {
      tick.setAttribute("aria-pressed", k === at ? "true" : "false");
    });
    gate.style.setProperty("--wipe", dir > 0 ? "1" : dir < 0 ? "-1" : "0");
    if (calm.matches) {
      gate.classList.remove("is-turning");
      void gate.offsetWidth;
      gate.classList.add("is-turning");
      return;
    }
    wiping = true;
    gate.classList.remove("is-turning");
    void gate.offsetWidth;
    gate.classList.add("is-turning");
    window.setTimeout(function () { wiping = false; }, 620);
  }

  function showFull(n) {
    var k = (n + REEL.length) % REEL.length;
    var frame = REEL[k];
    var fImg = document.getElementById("frameImg");
    fImg.setAttribute("src", frame.u);
    fImg.setAttribute("alt", frame.alt);
    document.getElementById("frameNo").textContent = pad(k + 1) + " / " + pad(REEL.length);
    document.getElementById("frameTitle").textContent = frame.t;
    document.getElementById("frameA").textContent = frame.a + " \u00b7 " + frame.l + " \u00b7 " + frame.extra;
    document.getElementById("frameLink").setAttribute("href", frame.p);
  }

  var frame = document.getElementById("frame");
  var fClose = document.getElementById("frameClose");
  var opener = null;

  function openFull(n, from) {
    opener = from;
    showFull(n);
    frame.hidden = false;
    requestAnimationFrame(function () { frame.classList.add("is-open"); });
    fClose.focus();
  }

  function shut() {
    frame.classList.remove("is-open");
    var seal = function () { frame.hidden = true; };
    if (calm.matches) { seal(); } else { setTimeout(seal, 280); }
    if (opener) { opener.focus(); opener = null; }
  }

  function ring() {
    return Array.prototype.slice.call(
      frame.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])')
    ).filter(function (node) { return node.offsetParent !== null; });
  }

  ticks.forEach(function (tick, k) {
    tick.addEventListener("click", function () { go(k); });
  });

  document.getElementById("prev").addEventListener("click", function () { go(at - 1, -1); });
  document.getElementById("next").addEventListener("click", function () { go(at + 1, 1); });

  var running = !calm.matches;
  var start = 0;
  var last = 0;

  function reel(now) {
    if (!start) { start = now; }
    if (!last) { last = now; }
    var s = (now - start) / 1000;
    bandOne.style.transform = "translate3d(" + (Math.sin(s * 0.16) * 6).toFixed(2) + "%,0,0)";
    bandTwo.style.transform = "translate3d(" + (Math.cos(s * 0.11) * -7).toFixed(2) + "%,0,0)";
    if (running) {
      var phase = (now - last) / 5200;
      bar.style.transform = "scaleX(" + (phase > 1 ? 1 : phase).toFixed(4) + ")";
      if (phase >= 1 && !wiping) {
        last = now;
        go(at + 1, 1);
      }
    }
    requestAnimationFrame(reel);
  }

  play.addEventListener("click", function () {
    running = !running;
    play.setAttribute("aria-pressed", running ? "true" : "false");
    play.textContent = running ? "Stop the reel" : "Run the reel";
    if (running) { last = performance.now(); }
    else { bar.style.transform = "scaleX(0)"; }
  });

  document.getElementById("framePrev").addEventListener("click", function () { showFull(at - 1); });
  document.getElementById("frameNext").addEventListener("click", function () { showFull(at + 1); });
  fClose.addEventListener("click", shut);
  frame.querySelector(".frame__scrim").addEventListener("click", shut);

  document.addEventListener("keydown", function (ev) {
    if (!frame.hidden) {
      if (ev.key === "Escape") { ev.preventDefault(); shut(); }
      else if (ev.key === "ArrowRight") { ev.preventDefault(); showFull(at + 1); }
      else if (ev.key === "ArrowLeft") { ev.preventDefault(); showFull(at - 1); }
      else if (ev.key === "Home") { ev.preventDefault(); showFull(0); }
      else if (ev.key === "End") { ev.preventDefault(); showFull(REEL.length - 1); }
      else if (ev.key === "Tab") {
        var list = ring();
        if (!list.length) { return; }
        var pos = list.indexOf(document.activeElement);
        var next = ev.shiftKey ? pos - 1 : pos + 1;
        if (next < 0 || next >= list.length) {
          ev.preventDefault();
          list[(next + list.length) % list.length].focus();
        }
      }
      return;
    }
    if (ev.key === "ArrowRight") { ev.preventDefault(); go(at + 1, 1); }
    else if (ev.key === "ArrowLeft") { ev.preventDefault(); go(at - 1, -1); }
    else if (ev.key === "Home") { ev.preventDefault(); go(0, -1); }
    else if (ev.key === "End") { ev.preventDefault(); go(REEL.length - 1, 1); }
    else if (ev.key === " " || ev.key === "Spacebar") {
      ev.preventDefault();
      play.click();
    }
  });

  if (calm.matches) {
    bandOne.style.transform = "translate3d(0,0,0)";
    bandTwo.style.transform = "translate3d(0,0,0)";
  } else {
    requestAnimationFrame(reel);
  }

  go(0, 0);
}());
