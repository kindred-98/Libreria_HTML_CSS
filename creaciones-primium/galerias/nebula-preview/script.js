(function () {
  "use strict";

  var EXPOSURES = [
    { n: "01", target: "Andromeda, wide field", inst: "Ground array", filter: "Broad band R", exp: "1800 s", ra: "00h 42m 44s", dec: "+41 16 09", alt: "The Andromeda galaxy spread across the sky in a wide ground based exposure", by: "NASA/JPL/California Institute of Technology", lic: "Public domain", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Andromeda_galaxy.jpg/960px-Andromeda_galaxy.jpg", page: "https://commons.wikimedia.org/wiki/File:Andromeda_galaxy.jpg" },
    { n: "02", target: "Andromeda, hydrogen alpha", inst: "Reflector 200 mm", filter: "H-alpha 656 nm", exp: "3600 s", ra: "00h 42m 44s", dec: "+41 16 09", alt: "The Andromeda galaxy imaged through a hydrogen alpha filter, its arms picked out in red", by: "Adam Evans", lic: "CC BY 2.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Andromeda_Galaxy_%28with_h-alpha%29.jpg/960px-Andromeda_Galaxy_%28with_h-alpha%29.jpg", page: "https://commons.wikimedia.org/wiki/File:Andromeda_Galaxy_(with_h-alpha).jpg" },
    { n: "03", target: "Andromeda, Herschel composite", inst: "Herschel space observatory", filter: "250, 350, 500 um", exp: "5400 s", ra: "00h 42m 44s", dec: "+41 16 09", alt: "A far infrared composite of the Andromeda galaxy from the Herschel space observatory", by: "ESA/Herschel/PACS/SPIRE/J. Fritz, U. Gent", lic: "Public domain", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Herschel_Image_of_Andromeda_Galaxy.jpg/960px-Herschel_Image_of_Andromeda_Galaxy.jpg", page: "https://commons.wikimedia.org/wiki/File:Herschel_Image_of_Andromeda_Galaxy.jpg" },
    { n: "04", target: "Cygnus Loop, ultraviolet", inst: "GALEX", filter: "Far ultraviolet 152 nm", exp: "1500 s", ra: "20h 56m 19s", dec: "+30 42 30", alt: "The Cygnus Loop supernova remnant in far ultraviolet light", by: "NASA/JPL-Caltech", lic: "Public domain", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Ultraviolet_image_of_the_Cygnus_Loop_Nebula_crop.jpg/960px-Ultraviolet_image_of_the_Cygnus_Loop_Nebula_crop.jpg", page: "https://commons.wikimedia.org/wiki/File:Ultraviolet_image_of_the_Cygnus_Loop_Nebula_crop.jpg" },
    { n: "05", target: "30 Doradus, Tarantula", inst: "Hubble wide field", filter: "Broad band RGB", exp: "1200 s", ra: "05h 38m 37s", dec: "-69 05 44", alt: "The Tarantula Nebula in the Large Magellanic Cloud imaged in broad band colour", by: "NASA, ESA, ESO, D. Lennon and E. Sabbi", lic: "Public domain", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/30_Doradus%2C_Tarantula_Nebula.jpg/960px-30_Doradus%2C_Tarantula_Nebula.jpg", page: "https://commons.wikimedia.org/wiki/File:30_Doradus,_Tarantula_Nebula.jpg" },
    { n: "06", target: "NGC 3372, Carina core", inst: "Webb narrow field", filter: "Narrow band 2.12 um", exp: "4400 s", ra: "10h 44m 05s", dec: "-59 52 04", alt: "The core of the Carina Nebula, NGC 3372, in a narrow field infrared exposure", by: "NASA, ESA, N. Smith", lic: "Public domain", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/NGC_3372a-full.jpg/960px-NGC_3372a-full.jpg", page: "https://commons.wikimedia.org/wiki/File:NGC_3372a-full.jpg" },
    { n: "07", target: "Andromeda in a crowded sky", inst: "Amateur reflector 130 mm", filter: "Light pollution cut", exp: "900 s", ra: "00h 42m 44s", dec: "+41 16 09", alt: "The Andromeda galaxy sitting among a crowded field of foreground stars", by: "Keesscherer", lic: "CC BY-SA 4.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/The_Andromeda-Galaxy_in_a_crowded_sky.jpg/960px-The_Andromeda-Galaxy_in_a_crowded_sky.jpg", page: "https://commons.wikimedia.org/wiki/File:The_Andromeda-Galaxy_in_a_crowded_sky.jpg" },
    { n: "08", target: "Tarantula, Webb", inst: "James Webb space telescope", filter: "NIRCam F090W", exp: "7200 s", ra: "05h 38m 37s", dec: "-69 05 44", alt: "The Tarantula Nebula imaged by the James Webb space telescope in near infrared", by: "NASA, ESA, CSA, STScI, Webb ERO Production Team", lic: "Public domain", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Tarantula_Nebula_by_JWST.jpg/960px-Tarantula_Nebula_by_JWST.jpg", page: "https://commons.wikimedia.org/wiki/File:Tarantula_Nebula_by_JWST.jpg" }
  ];

  var roll = document.getElementById("roll");
  var credits = document.getElementById("credits");
  var pImg = document.getElementById("preview-img");
  var dTarget = document.getElementById("d-target");
  var dInst = document.getElementById("d-inst");
  var dFilter = document.getElementById("d-filter");
  var dExp = document.getElementById("d-exp");
  var dRa = document.getElementById("d-ra");
  var dDec = document.getElementById("d-dec");
  var dBy = document.getElementById("d-by");

  var viewer = document.getElementById("viewer");
  var vImg = document.getElementById("viewer-img");
  var vCap = document.getElementById("viewer-cap");
  var vCount = document.getElementById("viewer-count");
  var vClose = document.getElementById("viewer-close");
  var vPrev = document.getElementById("viewer-prev");
  var vNext = document.getElementById("viewer-next");

  var rows = [];
  var cursor = 0;

  EXPOSURES.forEach(function (e, i) {
    var li = document.createElement("li");
    var b = document.createElement("button");
    b.type = "button";
    b.className = "exp";
    b.dataset.index = String(i);
    b.tabIndex = i === 0 ? 0 : -1;

    var n = document.createElement("span");
    n.className = "exp__n";
    n.textContent = "Exp " + e.n;
    var target = document.createElement("span");
    target.className = "exp__target";
    target.textContent = e.target;
    var meta = document.createElement("span");
    meta.className = "exp__meta";
    var inst = document.createElement("span");
    inst.textContent = e.inst;
    var exp = document.createElement("span");
    exp.textContent = e.exp;
    meta.appendChild(inst);
    meta.appendChild(exp);

    b.appendChild(n);
    b.appendChild(target);
    b.appendChild(meta);
    li.appendChild(b);
    roll.appendChild(li);
    rows.push(b);

    var c = document.createElement("li");
    var a = document.createElement("a");
    a.href = e.page;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = e.target;
    c.appendChild(a);
    c.appendChild(document.createTextNode(" \u2014 " + e.by + ", " + e.lic));
    credits.appendChild(c);
  });

  function show(i, moveFocus) {
    cursor = (i + EXPOSURES.length) % EXPOSURES.length;
    var e = EXPOSURES[cursor];
    rows.forEach(function (r, k) {
      r.tabIndex = k === cursor ? 0 : -1;
      if (k === cursor) {
        r.setAttribute("aria-current", "true");
      } else {
        r.removeAttribute("aria-current");
      }
    });
    pImg.src = e.src;
    pImg.alt = e.alt;
    dTarget.textContent = e.n + " \u00b7 " + e.target;
    dInst.textContent = e.inst;
    dFilter.textContent = e.filter;
    dExp.textContent = e.exp;
    dRa.textContent = e.ra;
    dDec.textContent = e.dec;
    dBy.textContent = e.by + ", " + e.lic;
    if (moveFocus) {
      rows[cursor].focus({ preventScroll: true });
    }
  }

  roll.addEventListener("keydown", function (e) {
    var k = e.key;
    if (k === "ArrowDown" || k === "ArrowRight") {
      show(cursor + 1, true);
    } else if (k === "ArrowUp" || k === "ArrowLeft") {
      show(cursor - 1, true);
    } else if (k === "Home") {
      show(0, true);
    } else if (k === "End") {
      show(EXPOSURES.length - 1, true);
    } else if (k === "Enter") {
      openViewer(cursor);
    } else {
      return;
    }
    e.preventDefault();
  });

  roll.addEventListener("click", function (e) {
    var b = e.target.closest(".exp");
    if (!b) {
      return;
    }
    show(Number(b.dataset.index), false);
  });

  document.getElementById("prev").addEventListener("click", function () {
    show(cursor - 1, false);
  });
  document.getElementById("next").addEventListener("click", function () {
    show(cursor + 1, false);
  });
  document.getElementById("open").addEventListener("click", function () {
    openViewer(cursor);
  });

  var opened = -1;
  var restore = null;

  function openViewer(i) {
    opened = (i + EXPOSURES.length) % EXPOSURES.length;
    var e = EXPOSURES[opened];
    vImg.src = e.src;
    vImg.alt = e.alt;
    vCap.textContent = "Exp " + e.n + " \u00b7 " + e.target + " \u00b7 " + e.inst + " \u00b7 " + e.filter + " \u00b7 " + e.exp + " \u00b7 " + e.by + " \u00b7 " + e.lic;
    vCount.textContent = e.n + " / 0" + EXPOSURES.length;
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
      openViewer(EXPOSURES.length - 1);
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
