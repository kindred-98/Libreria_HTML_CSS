(function () {
  "use strict";

  var calm = window.matchMedia("(prefers-reduced-motion: reduce)");

  var FRAMES = [
    {
      t: "Morocco, December", a: "Rosino", l: "CC BY-SA 2.0", place: "Morocco",
      u: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Morocco_Africa_Flickr_Rosino_December_2005_84514010.jpg/960px-Morocco_Africa_Flickr_Rosino_December_2005_84514010.jpg",
      p: "https://commons.wikimedia.org/wiki/File:Morocco_Africa_Flickr_Rosino_December_2005_84514010.jpg",
      alt: "Moroccan desert landscape with low dunes under a pale washed out sky"
    },
    {
      t: "Sossusvlei", a: "Winfried Bruenken", l: "CC BY-SA 2.5", place: "Namibia",
      u: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Sossusvlei_sand_dunes.jpg/960px-Sossusvlei_sand_dunes.jpg",
      p: "https://commons.wikimedia.org/wiki/File:Sossusvlei_sand_dunes.jpg",
      alt: "Tall red dunes with a sharp crest line at Sossusvlei in Namibia"
    },
    {
      t: "Mesquite dunes", a: "Brocken Inaglory", l: "CC BY-SA 3.0", place: "Death Valley",
      u: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Mesquite_Sand_Dunes_in_Death_Valley.jpg/960px-Mesquite_Sand_Dunes_in_Death_Valley.jpg",
      p: "https://commons.wikimedia.org/wiki/File:Mesquite_Sand_Dunes_in_Death_Valley.jpg",
      alt: "Mesquite sand dunes rising above the floor of Death Valley"
    },
    {
      t: "Thar dunes", a: "Last Emperor", l: "CC BY-SA 3.0", place: "Thar",
      u: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Sand_dunes_of_thar_desert.jpg/960px-Sand_dunes_of_thar_desert.jpg",
      p: "https://commons.wikimedia.org/wiki/File:Sand_dunes_of_thar_desert.jpg",
      alt: "Rippled sand dunes of the Thar desert under heavy cloud"
    },
    {
      t: "Dakhla, western desert", a: "Vyacheslav Argenberg", l: "CC BY 2.0", place: "Egypt",
      u: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Western_Desert%2C_Sand_dunes%2C_Dakhla%2C_Egypt.jpg/960px-Western_Desert%2C_Sand_dunes%2C_Dakhla%2C_Egypt.jpg",
      p: "https://commons.wikimedia.org/wiki/File:Western_Desert,_Sand_dunes,_Dakhla,_Egypt.jpg",
      alt: "Sand dunes of the western desert near Dakhla in Egypt"
    },
    {
      t: "Linear dunes from orbit", a: "NASA", l: "Public domain", place: "Great Sand Sea",
      u: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/ISS-31_Linear_dunes_in_the_Great_Sand_Sea_in_southwest_Egypt.jpg/960px-ISS-31_Linear_dunes_in_the_Great_Sand_Sea_in_southwest_Egypt.jpg",
      p: "https://commons.wikimedia.org/wiki/File:ISS-31_Linear_dunes_in_the_Great_Sand_Sea_in_southwest_Egypt.jpg",
      alt: "Orbital photograph of parallel linear dunes across the Great Sand Sea in south west Egypt"
    },
    {
      t: "Sunset on the dunes", a: "Sankara Subramanian", l: "CC BY 2.0", place: "Rajasthan",
      u: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/A_sunset_on_the_dunes_of_the_Great_Indian_Thar_Desert_Rajasthan_India.jpg/960px-A_sunset_on_the_dunes_of_the_Great_Indian_Thar_Desert_Rajasthan_India.jpg",
      p: "https://commons.wikimedia.org/wiki/File:A_sunset_on_the_dunes_of_the_Great_Indian_Thar_Desert_Rajasthan_India.jpg",
      alt: "Sunset throwing orange light across the dunes of the Indian Thar desert in Rajasthan"
    },
    {
      t: "Thar dunes, Cler", a: "Clement Bardot", l: "CC BY-SA 4.0", place: "Thar",
      u: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Dunes%2C_D%C3%A9sert_du_Thar.jpg/960px-Dunes%2C_D%C3%A9sert_du_Thar.jpg",
      p: "https://commons.wikimedia.org/wiki/File:Dunes,_D%C3%A9sert_du_Thar.jpg",
      alt: "Wind carved dunes of the Thar desert seen in flat afternoon light"
    },
    {
      t: "Sam dunes", a: "Karan Dhawan", l: "CC BY-SA 4.0", place: "Rajasthan",
      u: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Sam_Sand_Dunes.jpg/960px-Sam_Sand_Dunes.jpg",
      p: "https://commons.wikimedia.org/wiki/File:Sam_Sand_Dunes.jpg",
      alt: "Soft evening light on the Sam sand dunes of Rajasthan"
    }
  ];

  var strip = document.getElementById("strip");
  var head = document.getElementById("head");
  var readout = document.querySelector(".readout");
  var dust = document.getElementById("dust");
  var grain = document.getElementById("grain");

  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  var cells = FRAMES.map(function (frame, i) {
    var li = document.createElement("li");
    li.className = "cell";

    var btn = document.createElement("button");
    btn.className = "cell__btn";
    btn.type = "button";
    btn.setAttribute("aria-pressed", "false");
    btn.setAttribute("aria-label", "Frame " + (i + 1) + ", " + frame.t + ", " + frame.place);

    var img = document.createElement("img");
    img.className = "cell__img";
    img.setAttribute("src", frame.u);
    img.setAttribute("alt", frame.alt);
    img.setAttribute("loading", "lazy");
    img.setAttribute("decoding", "async");

    var no = document.createElement("span");
    no.className = "cell__no";
    no.textContent = pad(i + 1);

    var pl = document.createElement("span");
    pl.className = "cell__place";
    pl.textContent = frame.place;

    var nm = document.createElement("span");
    nm.className = "cell__name";
    nm.textContent = frame.t;

    btn.appendChild(img);
    btn.appendChild(no);
    btn.appendChild(pl);
    btn.appendChild(nm);
    li.appendChild(btn);
    strip.appendChild(li);
    return { li: li, btn: btn };
  });

  function nearest() {
    var stripBox = strip.getBoundingClientRect();
    var mid = stripBox.left + strip.clientWidth / 2;
    var max = strip.scrollWidth - strip.clientWidth;
    if (strip.scrollLeft <= 2) { return 0; }
    if (strip.scrollLeft >= max - 2) { return cells.length - 1; }
    var best = 0;
    var bestD = Infinity;
    cells.forEach(function (cell, k) {
      var box = cell.li.getBoundingClientRect();
      var d = Math.abs(box.left + box.width / 2 - mid);
      if (d < bestD) { bestD = d; best = k; }
    });
    return best;
  }

  function mark(k) {
    cells.forEach(function (cell, i) {
      cell.btn.setAttribute("aria-pressed", i === k ? "true" : "false");
      cell.li.classList.toggle("is-on", i === k);
    });
    var where = k === 0 ? "at the start of the traverse"
      : k === FRAMES.length - 1 ? "at the end of the traverse"
      : "along the traverse";
    readout.textContent = "Frame " + pad(k + 1) + " of " + pad(FRAMES.length) + " \u00b7 " + where;
  }

  function place(k) {
    var cell = cells[k];
    var stripBox = strip.getBoundingClientRect();
    var cellBox = cell.li.getBoundingClientRect();
    var shift = (cellBox.left + cellBox.width / 2) - (stripBox.left + stripBox.width / 2);
    if (calm.matches) {
      strip.scrollLeft += shift;
    } else {
      var from = strip.scrollLeft;
      var to = from + shift;
      var began = 0;
      var glide = function (now) {
        if (!began) { began = now; }
        var p = Math.min(1, (now - began) / 460);
        var eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        strip.scrollLeft = from + (to - from) * eased;
        if (p < 1) { requestAnimationFrame(glide); }
      };
      requestAnimationFrame(glide);
    }
    mark(k);
  }

  function track() {
    var max = strip.scrollWidth - strip.clientWidth;
    var p = max > 0 ? strip.scrollLeft / max : 0;
    head.style.transform = "translate3d(" + (p * 100).toFixed(2) + "%,0,0)";
    mark(nearest());
  }

  var plate = document.getElementById("plate");
  var pImg = document.getElementById("plateImg");
  var pNo = document.getElementById("plateNo");
  var pT = document.getElementById("plateTitle");
  var pA = document.getElementById("plateA");
  var pLink = document.getElementById("plateLink");
  var pClose = document.getElementById("plateClose");
  var opener = null;
  var at = 0;

  function showFull(n) {
    var k = (n + FRAMES.length) % FRAMES.length;
    var frame = FRAMES[k];
    var img = cells[k].btn.querySelector(".cell__img");
    pImg.setAttribute("src", img.getAttribute("src"));
    pImg.setAttribute("alt", img.getAttribute("alt"));
    pNo.textContent = pad(k + 1) + " / " + pad(FRAMES.length);
    pT.textContent = frame.t;
    pA.textContent = frame.a + " \u00b7 " + frame.l;
    pLink.setAttribute("href", frame.p);
  }

  function openFull(n, from) {
    opener = from;
    at = (n + FRAMES.length) % FRAMES.length;
    showFull(at);
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

  strip.addEventListener("click", function (ev) {
    var btn = ev.target.closest(".cell__btn");
    if (!btn) { return; }
    var k = cells.map(function (cell) { return cell.btn; }).indexOf(btn);
    if (k > -1) { place(k); }
  });

  strip.addEventListener("dblclick", function (ev) {
    var btn = ev.target.closest(".cell__btn");
    if (!btn) { return; }
    var k = cells.map(function (cell) { return cell.btn; }).indexOf(btn);
    if (k > -1) { openFull(k, btn); }
  });

  strip.addEventListener("keydown", function (ev) {
    var btn = ev.target.closest(".cell__btn");
    if (!btn) { return; }
    var here = cells.map(function (cell) { return cell.btn; }).indexOf(btn);
    var to = -1;
    if (ev.key === "ArrowRight") { to = here + 1; }
    else if (ev.key === "ArrowLeft") { to = here - 1; }
    else if (ev.key === "Home") { to = 0; }
    else if (ev.key === "End") { to = FRAMES.length - 1; }
    if (to < 0) { return; }
    ev.preventDefault();
    place(to);
    cells[(to + FRAMES.length) % FRAMES.length].btn.focus();
  });

  document.getElementById("left").addEventListener("click", function () {
    place((nearest() - 1 + FRAMES.length) % FRAMES.length);
  });

  document.getElementById("right").addEventListener("click", function () {
    place((nearest() + 1) % FRAMES.length);
  });

  document.getElementById("platePrev").addEventListener("click", function () { showFull(at - 1); });
  document.getElementById("plateNext").addEventListener("click", function () { showFull(at + 1); });
  pClose.addEventListener("click", shut);
  plate.querySelector(".plate__scrim").addEventListener("click", shut);

  document.addEventListener("keydown", function (ev) {
    if (plate.hidden) { return; }
    if (ev.key === "Escape") { ev.preventDefault(); shut(); }
    else if (ev.key === "ArrowRight") { ev.preventDefault(); showFull(at + 1); }
    else if (ev.key === "ArrowLeft") { ev.preventDefault(); showFull(at - 1); }
    else if (ev.key === "Home") { ev.preventDefault(); showFull(0); }
    else if (ev.key === "End") { ev.preventDefault(); showFull(FRAMES.length - 1); }
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

  var scrollQueued = false;

  window.addEventListener("resize", function () { track(); });

  strip.addEventListener("scroll", function () {
    if (scrollQueued) { return; }
    scrollQueued = true;
    requestAnimationFrame(function () {
      scrollQueued = false;
      var max = strip.scrollWidth - strip.clientWidth;
      var p = max > 0 ? strip.scrollLeft / max : 0;
      head.style.transform = "translate3d(" + (p * 100).toFixed(2) + "%,0,0)";
    });
  }, { passive: true });

  function drift(now) {
    var s = now / 1000;
    dust.style.transform = "translate3d(" + (Math.sin(s * 0.07) * 7).toFixed(2) + "%,0,0)";
    dust.style.opacity = (0.5 + Math.sin(s * 0.13) * 0.18).toFixed(3);
    grain.style.transform = "translate3d(0," + (Math.cos(s * 0.05) * 4).toFixed(2) + "%,0)";
    requestAnimationFrame(drift);
  }

  if (calm.matches) {
    dust.style.opacity = "0.55";
    dust.style.transform = "translate3d(0,0,0)";
    grain.style.transform = "translate3d(0,0,0)";
  } else {
    requestAnimationFrame(drift);
  }

  mark(0);
  window.setTimeout(function () { track(); mark(0); }, 60);
}());
