(function () {
  "use strict";

  var CROSSINGS = [
    { n: "01", name: "Stari Most", span: 30, place: "Mostar, Bosnia and Herzegovina", alt: "The old stone bridge of Stari Most over the Neretva with the old town behind it", by: "Ramirez", lic: "CC BY-SA 4.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Mostar_Old_Town_Panorama_2007.jpg/960px-Mostar_Old_Town_Panorama_2007.jpg", page: "https://commons.wikimedia.org/wiki/File:Mostar_Old_Town_Panorama_2007.jpg" },
    { n: "02", name: "Szechenyi Chain Bridge", span: 380, place: "Budapest, Hungary", alt: "The Széchenyi chain bridge in Budapest lit up at night with people crossing it", by: "Wilfredor", lic: "CC0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Sz%C3%A9chenyi_Chain_Bridge_in_Budapest_at_night.jpg/960px-Sz%C3%A9chenyi_Chain_Bridge_in_Budapest_at_night.jpg", page: "https://commons.wikimedia.org/wiki/File:Sz%C3%A9chenyi_Chain_Bridge_in_Budapest_at_night.jpg" },
    { n: "03", name: "Most Mlynski", span: 66, place: "Wroclaw, Poland", alt: "The Mlynski bridge in Wroclaw in morning mist just before sunrise", by: "Jar.ciurus", lic: "CC BY-SA 3.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Wroclaw_Most_Mlynski_w_porannej_mgle_przed_switem.jpg/960px-Wroclaw_Most_Mlynski_w_porannej_mgle_przed_switem.jpg", page: "https://commons.wikimedia.org/wiki/File:Wroclaw_Most_Mlynski_w_porannej_mgle_przed_switem.jpg" },
    { n: "04", name: "New Tyne Bridge", span: 134, place: "Newcastle upon Tyne, England", alt: "The New Tyne Bridge in Newcastle crossing the river with arched steelwork above", by: "Richard West", lic: "CC BY-SA 2.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Newcastle_Architecture_New_Tyne_Bridge_%28geograph_3256467%29.jpg/960px-Newcastle_Architecture_New_Tyne_Bridge_%28geograph_3256467%29.jpg", page: "https://commons.wikimedia.org/wiki/File:Newcastle_Architecture_New_Tyne_Bridge_(geograph_3256467).jpg" },
    { n: "05", name: "Millennium Bridge", span: 120, place: "Gateshead and Newcastle, England", alt: "The Gateshead Millennium Bridge lit at night with its curved deck over the Tyne", by: "Richard West", lic: "CC BY-SA 2.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Newcastle_Architecture_-_Gateshead_Millennium_Bridge_%28geograph_3256477%29.jpg/960px-Newcastle_Architecture_-_Gateshead_Millennium_Bridge_%28geograph_3256477%29.jpg", page: "https://commons.wikimedia.org/wiki/File:Newcastle_Architecture_-_Gateshead_Millennium_Bridge_(geograph_3256477).jpg" },
    { n: "06", name: "Most Grunwaldzki", span: 100, place: "Wroclaw, Poland", alt: "The Grunwaldzki bridge in Wroclaw over the Oder seen from the river bank", by: "Jar.ciurus", lic: "CC BY-SA 3.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Wroclaw-_Most_Grunwaldzki.jpg/960px-Wroclaw-_Most_Grunwaldzki.jpg", page: "https://commons.wikimedia.org/wiki/File:Wroclaw-_Most_Grunwaldzki.jpg" },
    { n: "07", name: "Gimsoystraumen Bridge", span: 700, place: "Vagan, Lofoten, Norway", alt: "The Gimsoystraumen bridge curving over a fjord arm in Lofoten under low cloud", by: "Ximonic (Simo Räsänen)", lic: "CC BY-SA 3.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Gims%C3%B8ystraumen_Bridge_in_V%C3%A5gan%2C_Lofoten%2C_Norway%2C_2015_April.jpg/960px-Gims%C3%B8ystraumen_Bridge_in_V%C3%A5gan%2C_Lofoten%2C_Norway%2C_2015_April.jpg", page: "https://commons.wikimedia.org/wiki/File:Gims%C3%B8ystraumen_Bridge_in_V%C3%A5gan,_Lofoten,_Norway,_2015_April.jpg" },
    { n: "08", name: "Old Castle Bridge", span: 40, place: "Warwick, England", alt: "The Old Castle bridge in Warwick crossing the Avon beside the castle walls", by: "DeFacto", lic: "CC BY-SA 4.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Old_Castle_Bridge%2C_Warwick.jpg/960px-Old_Castle_Bridge%2C_Warwick.jpg", page: "https://commons.wikimedia.org/wiki/File:Old_Castle_Bridge,_Warwick.jpg" }
  ];

  var plate = document.getElementById("plate");
  var pImg = document.getElementById("plate-img");
  var caliper = document.getElementById("caliper-read");
  var strip = document.getElementById("strip");
  var hint = document.getElementById("hint");
  var credits = document.getElementById("credits");
  var rSpan = document.getElementById("r-span");
  var rRig = document.getElementById("r-rig");
  var rPlate = document.getElementById("r-plate");

  var viewer = document.getElementById("viewer");
  var vImg = document.getElementById("viewer-img");
  var vCap = document.getElementById("viewer-cap");
  var vCount = document.getElementById("viewer-count");
  var vClose = document.getElementById("viewer-close");
  var vPrev = document.getElementById("viewer-prev");
  var vNext = document.getElementById("viewer-next");

  var still = window.matchMedia("(prefers-reduced-motion: reduce)");

  var cells = [];
  var cursor = 0;

  CROSSINGS.forEach(function (c, i) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "cell";
    b.dataset.index = String(i);
    b.tabIndex = i === 0 ? 0 : -1;
    b.setAttribute("aria-label", c.name + ", " + c.place + ", main span " + c.span + " metres");

    var shot = document.createElement("span");
    shot.className = "cell__shot";
    var img = document.createElement("img");
    img.src = c.src;
    img.alt = c.alt;
    img.loading = "lazy";
    img.decoding = "async";
    shot.appendChild(img);

    var n = document.createElement("span");
    n.className = "cell__n";
    n.textContent = c.n;

    var bar = document.createElement("span");
    bar.className = "cell__bar";
    var name = document.createElement("span");
    name.className = "cell__name";
    name.textContent = c.name;
    var m = document.createElement("span");
    m.textContent = c.span + " m";
    bar.appendChild(name);
    bar.appendChild(m);

    b.appendChild(shot);
    b.appendChild(n);
    b.appendChild(bar);
    strip.appendChild(b);
    cells.push(b);

    var li = document.createElement("li");
    var a = document.createElement("a");
    a.href = c.page;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = c.name;
    li.appendChild(a);
    li.appendChild(document.createTextNode(" \u2014 " + c.place + ". " + c.by + ", " + c.lic));
    credits.appendChild(li);
  });

  function show(i, moveFocus) {
    cursor = (i + CROSSINGS.length) % CROSSINGS.length;
    var c = CROSSINGS[cursor];
    cells.forEach(function (b, k) {
      b.tabIndex = k === cursor ? 0 : -1;
      if (k === cursor) {
        b.classList.add("is-on");
        b.setAttribute("aria-current", "true");
      } else {
        b.classList.remove("is-on");
        b.removeAttribute("aria-current");
      }
    });
    pImg.src = c.src;
    pImg.alt = c.alt;
    var metres = String(c.span).padStart(4, "0") + " m";
    rSpan.textContent = metres;
    rPlate.textContent = c.n + " / 0" + CROSSINGS.length;
    rRig.textContent = c.place.split(", ")[0];
    caliper.textContent = metres;
    plate.setAttribute("aria-label", "Open " + c.name + " full size");
    hint.textContent = c.name + " on the plate \u00b7 arrow keys walk the strip \u00b7 Enter opens it full size \u00b7 Escape closes it";
    var want = cells[cursor].offsetLeft - strip.clientWidth / 2 + cells[cursor].offsetWidth / 2;
    if (want < 0) {
      want = 0;
    }
    if (want > strip.scrollWidth - strip.clientWidth) {
      want = strip.scrollWidth - strip.clientWidth;
    }
    strip.scrollTo({ left: want, behavior: still.matches ? "auto" : "smooth" });
    if (moveFocus) {
      cells[cursor].focus({ preventScroll: true });
    }
  }

  strip.addEventListener("keydown", function (e) {
    var k = e.key;
    if (k === "ArrowRight" || k === "ArrowDown") {
      show(cursor + 1, true);
    } else if (k === "ArrowLeft" || k === "ArrowUp") {
      show(cursor - 1, true);
    } else if (k === "Home") {
      show(0, true);
    } else if (k === "End") {
      show(CROSSINGS.length - 1, true);
    } else if (k === "Enter") {
      openViewer(cursor);
    } else {
      return;
    }
    e.preventDefault();
  });

  strip.addEventListener("click", function (e) {
    var b = e.target.closest(".cell");
    if (!b) {
      return;
    }
    show(Number(b.dataset.index), false);
  });

  plate.addEventListener("click", function () {
    openViewer(cursor);
  });

  var opened = -1;
  var restore = null;

  function openViewer(i) {
    opened = (i + CROSSINGS.length) % CROSSINGS.length;
    var c = CROSSINGS[opened];
    vImg.src = c.src;
    vImg.alt = c.alt;
    vCap.textContent = c.n + " \u00b7 " + c.name + " \u00b7 " + c.place + " \u00b7 main span " + c.span + " m \u00b7 " + c.by + " \u00b7 " + c.lic;
    vCount.textContent = c.n + " / 0" + CROSSINGS.length;
    restore = document.activeElement;
    viewer.hidden = false;
    vClose.focus({ preventScroll: true });
  }

  function closeViewer() {
    if (viewer.hidden) {
      return;
    }
    viewer.hidden = true;
    vImg.removeAttribute("src");
    if (restore?.focus) {
      restore.focus({ preventScroll: true });
    }
    restore = null;
  }

  vClose.addEventListener("click", closeViewer);
  vPrev.addEventListener("click", function () {
    openViewer(opened - 1);
  });
  vNext.addEventListener("click", function () {
    openViewer(opened + 1);
  });
  viewer.querySelector(".viewer__scrim").addEventListener("click", closeViewer);

  viewer.addEventListener("keydown", function (e) {
    var k = e.key;
    if (k === "Escape") {
      closeViewer();
    } else if (k === "ArrowRight" || k === "ArrowDown") {
      openViewer(opened + 1);
    } else if (k === "ArrowLeft" || k === "ArrowUp") {
      openViewer(opened - 1);
    } else if (k === "Home") {
      openViewer(0);
    } else if (k === "End") {
      openViewer(CROSSINGS.length - 1);
    } else if (k === "Tab") {
      var ring = [vPrev, vNext, vClose];
      var at = ring.indexOf(document.activeElement);
      ring[(at + (e.shiftKey ? -1 : 1) + ring.length) % ring.length].focus({ preventScroll: true });
    } else {
      return;
    }
    e.preventDefault();
  });

  show(0, false);
})();
