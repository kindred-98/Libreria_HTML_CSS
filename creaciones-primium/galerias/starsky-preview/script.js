(function () {
  "use strict";

  var calm = window.matchMedia("(prefers-reduced-motion: reduce)");

  var PLATES = [
    {
      field: "FW-01", exp: "3200 ISO / 20 s", sky: "Galactic",
      name: "Night sky over West Virginia", a: "ForestWander", l: "CC BY-SA 3.0 US", ra: "RA 20h 34m", high: "ALT +38",
      u: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Night-sky-milky-way-stars-hills_-_West_Virginia_-_ForestWander.jpg/960px-Night-sky-milky-way-stars-hills_-_West_Virginia_-_ForestWander.jpg",
      p: "https://commons.wikimedia.org/wiki/File:Night-sky-milky-way-stars-hills_-_West_Virginia_-_ForestWander.jpg",
      alt: "Milky Way rising over dark hills in West Virginia under a sky full of stars"
    },
    {
      field: "YL-02", exp: "1600 ISO / 30 s", sky: "Galactic",
      name: "Yosemite under the Milky Way", a: "steve lyon", l: "CC BY-SA 2.0", ra: "RA 14h 08m", high: "ALT +52",
      u: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Yosemites_night_sky_-_with_Milky_Way_%288069499581%29.jpg/960px-Yosemites_night_sky_-_with_Milky_Way_%288069499581%29.jpg",
      p: "https://commons.wikimedia.org/wiki/File:Yosemites_night_sky_-_with_Milky_Way_(8069499581).jpg",
      alt: "Milky Way arch over the granite walls of Yosemite at night"
    },
    {
      field: "EPS-03", exp: "800 ISO / 15 s", sky: "Open",
      name: "Bright stars on deep blue", a: "epSos.de", l: "CC BY 2.0", ra: "RA 05h 41m", high: "ALT +61",
      u: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Bright_Stars_of_Milky_Way_on_the_Dark_blue_Sky_of_Astronomy.jpg/960px-Bright_Stars_of_Milky_Way_on_the_Dark_blue_Sky_of_Astronomy.jpg",
      p: "https://commons.wikimedia.org/wiki/File:Bright_Stars_of_Milky_Way_on_the_Dark_blue_Sky_of_Astronomy.jpg",
      alt: "Bright stars of the Milky Way scattered across a deep blue night sky"
    },
    {
      field: "ESO-04", exp: "VLT 120 s / Ha", sky: "Deep",
      name: "Yepun beside the galactic band", a: "ESO and J. Colosimo", l: "CC BY 4.0", ra: "RA 19h 55m", high: "ALT +22",
      u: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Yepun_and_the_Milky_Way.jpg/960px-Yepun_and_the_Milky_Way.jpg",
      p: "https://commons.wikimedia.org/wiki/File:Yepun_and_the_Milky_Way.jpg",
      alt: "The globular cluster Yepun standing next to the dusty band of the Milky Way"
    },
    {
      field: "PC-05", exp: "f 2.8 / 45 s", sky: "Arc",
      name: "A delicate arc", a: "PiConsti", l: "CC BY-SA 2.0", ra: "RA 18h 12m", high: "ALT +34",
      u: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Delicate_Milky_Way_%2817168205053%29.jpg/960px-Delicate_Milky_Way_%2817168205053%29.jpg",
      p: "https://commons.wikimedia.org/wiki/File:Delicate_Milky_Way_(17168205053).jpg",
      alt: "A thin delicate arc of the Milky Way rising above a dark horizon"
    },
    {
      field: "GU-06", exp: "f 1.4 / 25 s", sky: "Core",
      name: "Milky Way overhead", a: "Guillaume", l: "CC0", ra: "RA 21h 03m", high: "ALT +44",
      u: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Milky_Way_Night_Sky_%28Unsplash%29.jpg/960px-Milky_Way_Night_Sky_%28Unsplash%29.jpg",
      p: "https://commons.wikimedia.org/wiki/File:Milky_Way_Night_Sky_(Unsplash).jpg",
      alt: "Bright core of the Milky Way spreading across the zenith of a night sky"
    },
    {
      field: "ESO-07", exp: "VLT 60 s / Laser", sky: "Guide",
      name: "Laser guide to the centre", a: "ESO and Yuri Beletsky", l: "CC BY 4.0", ra: "RA 17h 45m", high: "ALT +29",
      u: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Laser_Towards_Milky_Ways_Centre.jpg/960px-Laser_Towards_Milky_Ways_Centre.jpg",
      p: "https://commons.wikimedia.org/wiki/File:Laser_Towards_Milky_Ways_Centre.jpg",
      alt: "A laser guide star beam pointing from an observatory towards the centre of the Milky Way"
    },
    {
      field: "WC-08", exp: "f 2 / 13 s", sky: "Harbour",
      name: "Holma marina, first frame", a: "W.carter", l: "CC0", ra: "RA 22h 19m", high: "ALT +17",
      u: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Stars_and_Milky_Way_at_Holma_Marina_1.jpg/960px-Stars_and_Milky_Way_at_Holma_Marina_1.jpg",
      p: "https://commons.wikimedia.org/wiki/File:Stars_and_Milky_Way_at_Holma_Marina_1.jpg",
      alt: "Stars and the Milky Way reflected over a quiet marina in Holma"
    },
    {
      field: "WC-09", exp: "f 2 / 13 s", sky: "Harbour",
      name: "Holma marina, second frame", a: "W.carter", l: "CC0", ra: "RA 22h 21m", high: "ALT +16",
      u: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Stars_and_Milky_Way_at_Holma_Marina_2.jpg/960px-Stars_and_Milky_Way_at_Holma_Marina_2.jpg",
      p: "https://commons.wikimedia.org/wiki/File:Stars_and_Milky_Way_at_Holma_Marina_2.jpg",
      alt: "A second marina frame of the Milky Way low over the northern horizon"
    },
    {
      field: "WC-10", exp: "f 2 / 13 s", sky: "Harbour",
      name: "Holma marina, fourth frame", a: "W.carter", l: "CC0", ra: "RA 22h 26m", high: "ALT +15",
      u: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Stars_and_Milky_Way_at_Holma_Marina_4.jpg/960px-Stars_and_Milky_Way_at_Holma_Marina_4.jpg",
      p: "https://commons.wikimedia.org/wiki/File:Stars_and_Milky_Way_at_Holma_Marina_4.jpg",
      alt: "A fourth marina exposure showing the galactic band and scattered stars above the water"
    }
  ];

  var rows = document.getElementById("rows");
  var stage = document.getElementById("stage");
  var stageImg = document.getElementById("stageImg");
  var stageRead = document.getElementById("stageRead");
  var arm = document.getElementById("arm");
  var outName = document.getElementById("outName");
  var outMeta = document.getElementById("outMeta");
  var gain = document.getElementById("gain");
  var gainOut = document.getElementById("gainOut");
  var openBtn = document.getElementById("openBtn");

  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) { node.className = cls; }
    if (text) { node.textContent = text; }
    return node;
  }

  var items = PLATES.map(function (plate, i) {
    var li = el("li", "row");
    var btn = document.createElement("button");
    btn.className = "row__btn";
    btn.type = "button";
    btn.setAttribute("aria-pressed", "false");

    var chip = document.createElement("img");
    chip.className = "row__chip";
    chip.setAttribute("src", plate.u);
    chip.setAttribute("alt", plate.name);
    chip.setAttribute("loading", "lazy");
    chip.setAttribute("decoding", "async");

    var n = el("span", "console__col console__col--n", pad(i + 1));
    var f = el("span", "console__col console__col--f", plate.field);
    var e = el("span", "console__col console__col--e", plate.exp);
    var s = el("span", "console__col console__col--s", plate.sky);
    var bar = el("span", "row__bar");

    btn.appendChild(bar);
    btn.appendChild(n);
    btn.appendChild(chip);
    btn.appendChild(f);
    btn.appendChild(e);
    btn.appendChild(s);
    li.appendChild(btn);
    rows.appendChild(li);
    return { li: li, btn: btn, plate: plate };
  });

  var at = 0;

  function pick(n) {
    at = (n + items.length) % items.length;
    items.forEach(function (item, k) {
      var on = k === at;
      item.btn.setAttribute("aria-pressed", on ? "true" : "false");
      item.li.classList.toggle("is-on", on);
    });
    var plate = items[at].plate;
    stageImg.setAttribute("src", plate.u);
    stageImg.setAttribute("alt", plate.alt);
    stageRead.textContent = "FIELD " + pad(at + 1) + " \u00b7 " + plate.ra + " \u00b7 " + plate.high + "\u00b0";
    outName.textContent = plate.name;
    outMeta.textContent = plate.a + " \u00b7 " + plate.l + " \u00b7 960 px";
  }

  function applyGain() {
    var v = Number(gain.value);
    var f = (v / 100).toFixed(2);
    stage.style.setProperty("--gain", f);
    gainOut.textContent = v + "%";
  }

  gain.addEventListener("input", applyGain);
  applyGain();

  var plate = document.getElementById("plate");
  var pImg = document.getElementById("plateImg");
  var pNo = document.getElementById("plateNo");
  var pT = document.getElementById("plateTitle");
  var pA = document.getElementById("plateA");
  var pLink = document.getElementById("plateLink");
  var pClose = document.getElementById("plateClose");
  var opener = null;

  function showFull(n) {
    var k = (n + items.length) % items.length;
    var p = items[k].plate;
    pImg.setAttribute("src", p.u);
    pImg.setAttribute("alt", p.alt);
    pNo.textContent = pad(k + 1) + " / " + pad(items.length);
    pT.textContent = p.name;
    pA.textContent = p.a + " \u00b7 " + p.l;
    pLink.setAttribute("href", p.p);
  }

  function openFull(n, from) {
    opener = from;
    showFull(n);
    plate.hidden = false;
    requestAnimationFrame(function () { plate.classList.add("is-open"); });
    pClose.focus();
  }

  function shut() {
    plate.classList.remove("is-open");
    var seal = function () { plate.hidden = true; };
    if (calm.matches) { seal(); } else { setTimeout(seal, 280); }
    if (opener) { opener.focus(); opener = null; }
  }

  function ring() {
    return Array.prototype.slice.call(
      plate.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])')
    ).filter(function (node) { return node.offsetParent !== null; });
  }

  rows.addEventListener("click", function (ev) {
    var btn = ev.target.closest(".row__btn");
    if (!btn) { return; }
    var k = items.map(function (item) { return item.btn; }).indexOf(btn);
    if (k > -1) { pick(k); }
  });

  rows.addEventListener("dblclick", function (ev) {
    var btn = ev.target.closest(".row__btn");
    if (!btn) { return; }
    var k = items.map(function (item) { return item.btn; }).indexOf(btn);
    if (k > -1) { openFull(k, btn); }
  });

  rows.addEventListener("keydown", function (ev) {
    var btn = ev.target.closest(".row__btn");
    if (!btn) { return; }
    var here = items.map(function (item) { return item.btn; }).indexOf(btn);
    var to = -1;
    if (ev.key === "ArrowDown") { to = here + 1; }
    else if (ev.key === "ArrowUp") { to = here - 1; }
    else if (ev.key === "Home") { to = 0; }
    else if (ev.key === "End") { to = items.length - 1; }
    if (to < 0) { return; }
    ev.preventDefault();
    items[to].btn.focus();
  });

  openBtn.addEventListener("click", function () { openFull(at, openBtn); });
  document.getElementById("platePrev").addEventListener("click", function () { showFull(at - 1); });
  document.getElementById("plateNext").addEventListener("click", function () { showFull(at + 1); });
  pClose.addEventListener("click", shut);
  plate.querySelector(".plate__scrim").addEventListener("click", shut);

  document.addEventListener("keydown", function (ev) {
    if (plate.hidden) { return; }
    if (ev.key === "Escape") { ev.preventDefault(); shut(); }
    else if (ev.key === "ArrowDown" || ev.key === "ArrowRight") { ev.preventDefault(); showFull(at + 1); }
    else if (ev.key === "ArrowUp" || ev.key === "ArrowLeft") { ev.preventDefault(); showFull(at - 1); }
    else if (ev.key === "Home") { ev.preventDefault(); showFull(0); }
    else if (ev.key === "End") { ev.preventDefault(); showFull(items.length - 1); }
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
  });

  function sweep(now) {
    var s = now / 1000;
    var deg = (s * 9) % 360;
    arm.style.transform = "rotate(" + deg.toFixed(2) + "deg)";
    var x = 50 + Math.sin(s * 0.32) * 30;
    var y = 50 + Math.cos(s * 0.24) * 26;
    stage.style.setProperty("--rx", x.toFixed(2) + "%");
    stage.style.setProperty("--ry", y.toFixed(2) + "%");
    requestAnimationFrame(sweep);
  }

  if (calm.matches) {
    arm.style.transform = "rotate(28deg)";
    stage.style.setProperty("--rx", "62%");
    stage.style.setProperty("--ry", "38%");
  } else {
    requestAnimationFrame(sweep);
  }

  pick(0);
}());
