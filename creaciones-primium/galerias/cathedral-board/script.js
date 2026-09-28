(function () {
  "use strict";

  var PLATES = [
    { n: "01", name: "Winchester flags", alt: "Banners of coloured flags hanging in the nave of Winchester cathedral", by: "Tom Habibi", lic: "CC BY-SA 3.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Winchester_cathedral_flags.jpg/960px-Winchester_cathedral_flags.jpg", page: "https://commons.wikimedia.org/wiki/File:Winchester_cathedral_flags.jpg" },
    { n: "02", name: "Saint Isaac interior", alt: "The marble colonnade of the interior of Saint Isaac cathedral in Saint Petersburg", by: "Ximeg", lic: "CC BY-SA 3.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Saint_Isaac%27s_Cathedral_Sept._2012_Interior.jpg/960px-Saint_Isaac%27s_Cathedral_Sept._2012_Interior.jpg", page: "https://commons.wikimedia.org/wiki/File:Saint_Isaac's_Cathedral_Sept._2012_Interior.jpg" },
    { n: "03", name: "St Paul dome", alt: "The painted interior dome of St Paul's cathedral seen from the crossing", by: "Diliff", lic: "CC BY-SA 3.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/St_Paul%27s_Cathedral_Interior_Dome_3%2C_London%2C_UK_-_Diliff.jpg/960px-St_Paul%27s_Cathedral_Interior_Dome_3%2C_London%2C_UK_-_Diliff.jpg", page: "https://commons.wikimedia.org/wiki/File:St_Paul's_Cathedral_Interior_Dome_3,_London,_UK_-_Diliff.jpg" },
    { n: "04", name: "Gloucester high altar", alt: "The carved reredos and high altar of Gloucester cathedral in Gloucestershire", by: "Diliff", lic: "CC BY-SA 3.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Gloucester_Cathedral_High_Altar%2C_Gloucestershire%2C_UK_-_Diliff.jpg/960px-Gloucester_Cathedral_High_Altar%2C_Gloucestershire%2C_UK_-_Diliff.jpg", page: "https://commons.wikimedia.org/wiki/File:Gloucester_Cathedral_High_Altar,_Gloucestershire,_UK_-_Diliff.jpg" },
    { n: "05", name: "Coventry interior", alt: "The modern interior of Coventry cathedral with its concrete and timber vaulting", by: "Diliff", lic: "CC BY-SA 3.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Coventry_Cathedral_Interior%2C_West_Midlands%2C_UK_-_Diliff.jpg/960px-Coventry_Cathedral_Interior%2C_West_Midlands%2C_UK_-_Diliff.jpg", page: "https://commons.wikimedia.org/wiki/File:Coventry_Cathedral_Interior,_West_Midlands,_UK_-_Diliff.jpg" },
    { n: "06", name: "Amiens, 1842", alt: "Nineteenth century view down the nave of the cathedral of Amiens in a lithograph", by: "Jules Victor Génisson", lic: "Public domain", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Interior_da_Catedral_de_Amiens_by_Jules_Victor_Genisson%2C_1842.jpg/960px-Interior_da_Catedral_de_Amiens_by_Jules_Victor_Genisson%2C_1842.jpg", page: "https://commons.wikimedia.org/wiki/File:Interior_da_Catedral_de_Amiens_by_Jules_Victor_Genisson,_1842.jpg" },
    { n: "07", name: "Siauliai interior", alt: "The white interior of Siauliai cathedral in Siauliai, Lithuania", by: "Diliff", lic: "CC BY-SA 3.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/%C5%A0iauliai_Cathedral_Interior_1%2C_%C5%A0iauliai%2C_Lithuania_-_Diliff.jpg/960px-%C5%A0iauliai_Cathedral_Interior_1%2C_%C5%A0iauliai%2C_Lithuania_-_Diliff.jpg", page: "https://commons.wikimedia.org/wiki/File:%C5%A0iauliai_Cathedral_Interior_1,_%C5%A0iauliai,_Lithuania_-_Diliff.jpg" },
    { n: "08", name: "Riga nave", alt: "The long nave of Riga cathedral in Riga, Latvia", by: "Diliff", lic: "CC BY-SA 3.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Riga_Cathedral_Nave%2C_Riga%2C_Latvia_-_Diliff.jpg/960px-Riga_Cathedral_Nave%2C_Riga%2C_Latvia_-_Diliff.jpg", page: "https://commons.wikimedia.org/wiki/File:Riga_Cathedral_Nave,_Riga,_Latvia_-_Diliff.jpg" }
  ];

  var STATES = ["archived", "armed", "live"];

  var cellsBox = document.getElementById("cells");
  var meterBox = document.getElementById("meter");
  var credits = document.getElementById("credits");
  var tHead = document.getElementById("t-head");
  var tState = document.getElementById("t-state");
  var tChan = document.getElementById("t-chan");
  var tSweep = document.getElementById("t-sweep");
  var armedOut = document.getElementById("armed-count");
  var liveOut = document.getElementById("live-count");
  var archOut = document.getElementById("arch-count");

  var viewer = document.getElementById("viewer");
  var vImg = document.getElementById("viewer-img");
  var vCap = document.getElementById("viewer-cap");
  var vCount = document.getElementById("viewer-count");
  var vClose = document.getElementById("viewer-close");
  var vPrev = document.getElementById("viewer-prev");
  var vNext = document.getElementById("viewer-next");

  var still = window.matchMedia("(prefers-reduced-motion: reduce)");

  var cards = [];
  var state = [];
  var cursor = 0;
  var sweep = 0;
  var last = 0;
  var stamp = 0;

  PLATES.forEach(function (p, i) {
    state.push(i < 3 ? "live" : i < 6 ? "armed" : "archived");

    var cell = document.createElement("div");
    cell.className = "cell";
    cell.dataset.state = state[i];

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "cell__btn";
    btn.dataset.index = String(i);
    btn.tabIndex = i === 0 ? 0 : -1;
    btn.setAttribute("aria-label", "Channel " + p.n + ", " + p.name + ", state " + state[i]);

    var shot = document.createElement("span");
    shot.className = "cell__shot";
    var img = document.createElement("img");
    img.src = p.src;
    img.alt = p.alt;
    img.loading = "lazy";
    img.decoding = "async";
    var tint = document.createElement("span");
    tint.className = "cell__tint";
    shot.appendChild(img);
    shot.appendChild(tint);

    var bar = document.createElement("span");
    bar.className = "cell__bar";
    var chan = document.createElement("span");
    chan.className = "cell__chan";
    chan.textContent = p.n;
    var name = document.createElement("span");
    name.className = "cell__name";
    name.textContent = p.name;
    bar.appendChild(chan);
    bar.appendChild(name);

    var st = document.createElement("span");
    st.className = "cell__state";
    var led = document.createElement("i");
    led.className = "cell__led";
    var stTxt = document.createElement("span");
    st.appendChild(led);
    st.appendChild(stTxt);
    stTxt.textContent = state[i];

    btn.appendChild(shot);
    btn.appendChild(bar);
    btn.appendChild(st);
    cell.appendChild(btn);
    cellsBox.appendChild(cell);
    cards.push({ cell: cell, btn: btn, stTxt: stTxt });

    var bar2 = document.createElement("i");
    bar2.style.setProperty("--m", String(i));
    meterBox.appendChild(bar2);

    var li = document.createElement("li");
    var a = document.createElement("a");
    a.href = p.page;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = p.name;
    li.appendChild(a);
    li.appendChild(document.createTextNode(" \u2014 " + p.by + ", " + p.lic));
    credits.appendChild(li);
  });

  function paintCursor() {
    cards.forEach(function (c, k) {
      c.btn.tabIndex = k === cursor ? 0 : -1;
      if (k === cursor) {
        c.cell.classList.add("is-cursor");
      } else {
        c.cell.classList.remove("is-cursor");
      }
    });
    var col = (cursor % 4) + 1;
    var row = Math.floor(cursor / 4) + 1;
    tHead.textContent = "R" + row + "C" + col;
    tChan.textContent = PLATES[cursor].n;
    tState.textContent = state[cursor].toUpperCase();
  }

  function tally() {
    var armed = 0;
    var live = 0;
    var arch = 0;
    state.forEach(function (s) {
      if (s === "armed") {
        armed++;
      } else if (s === "live") {
        live++;
      } else {
        arch++;
      }
    });
    armedOut.textContent = String(armed);
    liveOut.textContent = String(live);
    archOut.textContent = String(arch);
  }

  function setState(i, next) {
    state[i] = next;
    var c = cards[i];
    c.cell.dataset.state = next;
    c.stTxt.textContent = next;
    c.btn.setAttribute("aria-label", "Channel " + PLATES[i].n + ", " + PLATES[i].name + ", state " + next);
    tally();
    if (i === cursor) {
      tState.textContent = next.toUpperCase();
    }
  }

  function cycle(i) {
    var at = STATES.indexOf(state[i]);
    setState(i, STATES[(at + 1) % STATES.length]);
  }

  function move(d) {
    var next = cursor + d;
    if (next < 0) {
      next = 0;
    }
    if (next > PLATES.length - 1) {
      next = PLATES.length - 1;
    }
    cursor = next;
    paintCursor();
    cards[cursor].btn.focus({ preventScroll: true });
  }

  cellsBox.addEventListener("keydown", function (e) {
    var k = e.key;
    if (k === "ArrowRight") {
      move(1);
    } else if (k === "ArrowLeft") {
      move(-1);
    } else if (k === "ArrowDown") {
      move(4);
    } else if (k === "ArrowUp") {
      move(-4);
    } else if (k === "Home") {
      move(-PLATES.length);
    } else if (k === "End") {
      move(PLATES.length);
    } else if (k === " " || k === "Spacebar") {
      cycle(cursor);
    } else if (k === "Enter") {
      openViewer(cursor);
    } else {
      return;
    }
    e.preventDefault();
  });

  cellsBox.addEventListener("click", function (e) {
    var btn = e.target.closest(".cell__btn");
    if (!btn) {
      return;
    }
    cursor = Number(btn.dataset.index);
    paintCursor();
    openViewer(cursor);
  });

  cellsBox.addEventListener("contextmenu", function (e) {
    var btn = e.target.closest(".cell__btn");
    if (!btn) {
      return;
    }
    e.preventDefault();
    cursor = Number(btn.dataset.index);
    paintCursor();
    cycle(cursor);
  });

  function setAll(next) {
    state.forEach(function (_, i) {
      setState(i, next);
    });
    paintCursor();
  }

  document.getElementById("arm-all").addEventListener("click", function () {
    setAll("armed");
  });
  document.getElementById("arch-all").addEventListener("click", function () {
    setAll("archived");
  });
  document.getElementById("open-cell").addEventListener("click", function () {
    openViewer(cursor);
  });

  function tick(now) {
    if (!last) {
      last = now;
    }
    var dt = Math.min(48, now - last) / 16.67;
    last = now;
    if (!still.matches) {
      sweep += dt * 26;
    }
    if (now - stamp > 140) {
      stamp = now;
      tSweep.textContent = String(Math.floor(sweep) % 10000).padStart(4, "0");
    }
    requestAnimationFrame(tick);
  }

  var opened = -1;
  var restore = null;

  function openViewer(i) {
    opened = (i + PLATES.length) % PLATES.length;
    var p = PLATES[opened];
    vImg.src = p.src;
    vImg.alt = p.alt;
    vCap.textContent = "Channel " + p.n + " \u00b7 " + p.name + " \u00b7 " + state[opened] + " \u00b7 " + p.by + " \u00b7 " + p.lic;
    vCount.textContent = p.n + " / 0" + PLATES.length;
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
    if (restore && restore.focus) {
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
    } else if (k === "ArrowRight") {
      openViewer(opened + 1);
    } else if (k === "ArrowLeft") {
      openViewer(opened - 1);
    } else if (k === "Home") {
      openViewer(0);
    } else if (k === "End") {
      openViewer(PLATES.length - 1);
    } else if (k === "Tab") {
      var ring = [vPrev, vNext, vClose];
      var at = ring.indexOf(document.activeElement);
      ring[(at + (e.shiftKey ? -1 : 1) + ring.length) % ring.length].focus({ preventScroll: true });
    } else {
      return;
    }
    e.preventDefault();
  });

  paintCursor();
  tally();
  requestAnimationFrame(tick);
})();
