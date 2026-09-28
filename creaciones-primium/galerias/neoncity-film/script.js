(function () {
  "use strict";

  var FRAMES = [
    { n: "01", name: "Kwun Tong pawn signs", short: "Fu Yan Street, Hong Kong, pawnshop and restaurant neon stacked over the pavement", alt: "Rows of pawnshop and restaurant neon signs above Fu Yan Street in Kwun Tong, Hong Kong at night", by: "Nuihongsaem", lic: "CC BY-SA 3.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/HK_Kwun_Tong_night_%E8%BC%94%E4%BB%81%E8%A1%97_Fu_Yan_Street_%E8%8F%AF%E7%94%9F%E6%8A%BC_Pawn_shop_Restaurant_neon_signs.JPG/960px-HK_Kwun_Tong_night_%E8%BC%94%E4%BB%81%E8%A1%97_Fu_Yan_Street_%E8%8F%AF%E7%94%9F%E6%8A%BC_Pawn_shop_Restaurant_neon_signs.JPG", page: "https://commons.wikimedia.org/wiki/File:HK_Kwun_Tong_night_%E8%BC%94%E4%BB%81%E8%A1%97_Fu_Yan_Street_%E8%8F%AF%E7%94%9F%E6%8A%BC_Pawn_shop_Restaurant_neon_signs.JPG" },
    { n: "02", name: "Lizard King Club", short: "Piotrkowska 62, Lodz, a nightclub sign on a dark facade", alt: "The Lizard King Club neon sign on Piotrkowska Street in Lodz photographed at night", by: "Zorro2212", lic: "CC BY-SA 3.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Lizard_King_Club_neon_sign_-_night_shot%2C_%C5%81%C3%B3d%C5%BA_62_Piotrkowska_Street.jpg/960px-Lizard_King_Club_neon_sign_-_night_shot%2C_%C5%81%C3%B3d%C5%BA_62_Piotrkowska_Street.jpg", page: "https://commons.wikimedia.org/wiki/File:Lizard_King_Club_neon_sign_-_night_shot%2C_%C5%81%C3%B3d%C5%BA_62_Piotrkowska_Street.jpg" },
    { n: "03", name: "Piotrkowska neon", short: "Lodz, a tall vertical neon blade on a corner building", alt: "A tall vertical neon sign glowing on a corner building on Piotrkowska Street in Lodz", by: "Zorro2212", lic: "CC BY-SA 3.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Neon_sign_-_night_shot%2C_%C5%81%C3%B3d%C5%BA_Piotrkowska_Street.jpg/960px-Neon_sign_-_night_shot%2C_%C5%81%C3%B3d%C5%BA_Piotrkowska_Street.jpg", page: "https://commons.wikimedia.org/wiki/File:Neon_sign_-_night_shot%2C_%C5%81%C3%B3d%C5%BA_Piotrkowska_Street.jpg" },
    { n: "04", name: "Teatr Nowy", short: "Wieckowskiego 15, Lodz, theatre frontage in red tubing", alt: "The red neon frontage of Teatr Nowy on Wieckowskiego Street in Lodz at night", by: "Zorro2212", lic: "CC BY-SA 3.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Teatr_Nowy_neon_sign_-_night_shot%2C_%C5%81%C3%B3d%C5%BA_15_Wi%C4%99ckowskiego_Street.jpg/960px-Teatr_Nowy_neon_sign_-_night_shot%2C_%C5%81%C3%B3d%C5%BA_15_Wi%C4%99ckowskiego_Street.jpg", page: "https://commons.wikimedia.org/wiki/File:Teatr_Nowy_neon_sign_-_night_shot%2C_%C5%81%C3%B3d%C5%BA_15_Wi%C4%99ckowskiego_Street.jpg" },
    { n: "05", name: "Hong Kong night street", short: "A narrow street under a canopy of shopfront signs", alt: "A narrow Hong Kong street at night under a canopy of glowing shopfront signs", by: "Wilfredor", lic: "CC0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Hong_Kong_night_street_2.jpg/960px-Hong_Kong_night_street_2.jpg", page: "https://commons.wikimedia.org/wiki/File:Hong_Kong_night_street_2.jpg" },
    { n: "06", name: "Tak Hing shop", short: "Woosung Street, Yau Ma Tei, a signboard over a shuttered stall", alt: "The Tak Hing shop neon sign over a shuttered stall on Woosung Street in Yau Ma Tei, Hong Kong", by: "Kungsyingchangeiu", lic: "CC BY-SA 3.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/HK_Yau_Ma_Tei_%E5%90%B3%E6%9D%BE%E8%A1%97_Woosung_Street_night_%E5%BE%B7%E8%88%88_Tak_Hing_shop_neon_sign_Jan-2014_Kansu_Street.JPG/960px-HK_Yau_Ma_Tei_%E5%90%B3%E6%9D%BE%E8%A1%97_Woosung_Street_night_%E5%BE%B7%E8%88%88_Tak_Hing_shop_neon_sign_Jan-2014_Kansu_Street.JPG", page: "https://commons.wikimedia.org/wiki/File:HK_Yau_Ma_Tei_%E5%90%B3%E6%9D%BE%E8%A1%97_Woosung_Street_night_%E5%BE%B7%E8%88%88_Tak_Hing_shop_neon_sign_Jan-2014_Kansu_Street.JPG" },
    { n: "07", name: "Neon cluster, plate A", short: "Budapest, a tight cluster of backlit signage", alt: "A tight cluster of backlit neon signage seen on a Budapest street at night", by: "Tokumeigakarinoaoshima", lic: "CC0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Neon_signs_at_night%2C_24th_October_2014_%281%29.JPG/960px-Neon_signs_at_night%2C_24th_October_2014_%281%29.JPG", page: "https://commons.wikimedia.org/wiki/File:Neon_signs_at_night%2C_24th_October_2014_(1).JPG" },
    { n: "08", name: "Neon cluster, plate B", short: "Budapest, signage reflected in a wet pavement", alt: "Neon signage in Budapest at night reflected across a wet pavement", by: "Tokumeigakarinoaoshima", lic: "CC0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Neon_signs_at_night%2C_24th_October_2014_%282%29.JPG/960px-Neon_signs_at_night%2C_24th_October_2014_%282%29.JPG", page: "https://commons.wikimedia.org/wiki/File:Neon_signs_at_night%2C_24th_October_2014_(2).JPG" },
    { n: "09", name: "Dotonbori canal", short: "Osaka, sign boards stacked above the water", alt: "Dotonbori canal in Osaka with signboards stacked above the water at night", by: "Tokumeigakarinoaoshima", lic: "CC0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Dotombori_neon_signs_at_night%2C_25th_October_2014.JPG/960px-Dotombori_neon_signs_at_night%2C_25th_October_2014.JPG", page: "https://commons.wikimedia.org/wiki/File:Dotombori_neon_signs_at_night%2C_25th_October_2014.JPG" }
  ];

  var strip = document.getElementById("strip");
  var track = document.getElementById("track");
  var credits = document.getElementById("credits");
  var runBtn = document.getElementById("run");
  var gateName = document.getElementById("gate-name");
  var gateN = document.getElementById("gate-n");
  var gateTotal = document.getElementById("gate-total");
  var tFeet = document.getElementById("t-feet");
  var tGate = document.getElementById("t-gate");
  var tSpeed = document.getElementById("t-speed");
  var tState = document.getElementById("t-state");

  var viewer = document.getElementById("viewer");
  var vImg = document.getElementById("viewer-img");
  var vCap = document.getElementById("viewer-cap");
  var vCount = document.getElementById("viewer-count");
  var vClose = document.getElementById("viewer-close");
  var vPrev = document.getElementById("viewer-prev");
  var vNext = document.getElementById("viewer-next");

  var still = window.matchMedia("(prefers-reduced-motion: reduce)");

  var cards = [];
  var cursor = 0;
  var held = false;
  var dragging = false;
  var grabX = 0;
  var grabXPos = 0;
  var span = 1;
  var x = 0;
  var last = 0;
  var feet = 0;
  var stamp = 0;

  gateTotal.textContent = "0" + FRAMES.length;

  FRAMES.forEach(function (f, i) {
    var card = document.createElement("button");
    card.type = "button";
    card.className = "frame";
    card.dataset.index = String(i);

    var shot = document.createElement("span");
    shot.className = "frame__shot";
    var img = document.createElement("img");
    img.src = f.src;
    img.alt = f.alt;
    img.loading = "lazy";
    img.decoding = "async";
    var sprockets = document.createElement("span");
    sprockets.className = "frame__sprockets";
    shot.appendChild(img);
    shot.appendChild(sprockets);

    var data = document.createElement("span");
    data.className = "frame__data";
    var num = document.createElement("span");
    num.className = "frame__n";
    num.textContent = f.n;
    var name = document.createElement("span");
    name.className = "frame__name";
    name.textContent = f.name;
    data.appendChild(num);
    data.appendChild(name);

    card.appendChild(shot);
    card.appendChild(data);
    track.appendChild(card);
    cards.push(card);

    var li = document.createElement("li");
    var a = document.createElement("a");
    a.href = f.page;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = f.name;
    li.appendChild(a);
    li.appendChild(document.createTextNode(" \u2014 " + f.short + ". " + f.by + ", " + f.lic));
    credits.appendChild(li);
  });

  function measure() {
    var first = cards[0];
    if (!first) {
      return 1;
    }
    return Math.max(1, first.offsetWidth + 22);
  }

  function running() {
    return !held && !dragging && !still.matches && !strip.contains(document.activeElement) && viewer.hidden;
  }

  function gateIndex() {
    var w = strip.clientWidth * .5;
    var i = Math.floor((x + w) / span);
    return ((i % FRAMES.length) + FRAMES.length) % FRAMES.length;
  }

  function paintGate() {
    var g = gateIndex();
    cards.forEach(function (c, k) {
      if (k === g) {
        c.classList.add("is-gate");
      } else {
        c.classList.remove("is-gate");
      }
    });
    if (g !== cursor) {
      cursor = g;
      gateName.textContent = FRAMES[g].name;
      gateN.textContent = FRAMES[g].n;
    }
  }

  function telem() {
    var g = gateIndex();
    tFeet.textContent = String(Math.floor(feet / 4) % 10000).padStart(4, "0");
    tGate.textContent = FRAMES[g].n;
    tState.textContent = running() ? "RUN" : "HOLD";
  }

  function paint() {
    track.style.transform = "translate3d(" + (-x).toFixed(2) + "px,0,0)";
  }

  function tick(now) {
    if (!last) {
      last = now;
    }
    var dt = Math.min(48, now - last) / 16.67;
    last = now;
    if (running()) {
      x += .62 * dt;
      feet += .62 * dt;
    }
    if (x >= span) {
      x -= span;
    }
    if (x < 0) {
      x += span;
    }
    paint();
    paintGate();
    if (now - stamp > 120) {
      stamp = now;
      telem();
    }
    requestAnimationFrame(tick);
  }

  function centre(i) {
    var want = cards[i].offsetLeft + cards[i].offsetWidth / 2 - strip.clientWidth / 2;
    if (want < 0) {
      want += span;
    }
    if (want > span) {
      want -= span;
    }
    x = want;
    paint();
    paintGate();
    telem();
  }

  function step(d) {
    setHeld(true);
    var next = cursor + d;
    while (next < 0) {
      next += FRAMES.length;
    }
    centre(next % FRAMES.length);
  }

  strip.addEventListener("keydown", function (e) {
    var k = e.key;
    if (k === "ArrowRight") {
      step(1);
    } else if (k === "ArrowLeft") {
      step(-1);
    } else if (k === "Home") {
      setHeld(true);
      centre(0);
    } else if (k === "End") {
      setHeld(true);
      centre(FRAMES.length - 1);
    } else if (k === "Enter" || k === " ") {
      openViewer(gateIndex());
    } else {
      return;
    }
    e.preventDefault();
  });

  strip.addEventListener("click", function (e) {
    var card = e.target.closest(".frame");
    if (!card) {
      return;
    }
    var i = Number(card.dataset.index);
    cursor = i;
    gateName.textContent = FRAMES[i].name;
    gateN.textContent = FRAMES[i].n;
    openViewer(i);
  });

  strip.addEventListener("pointerdown", function (e) {
    if (e.target.closest(".frame")) {
      return;
    }
    dragging = true;
    grabX = e.clientX;
    grabXPos = x;
    strip.setPointerCapture(e.pointerId);
  });
  strip.addEventListener("pointermove", function (e) {
    if (!dragging) {
      return;
    }
    var next = grabXPos - (e.clientX - grabX);
    if (next < 0) {
      next += span;
    }
    if (next > span) {
      next -= span;
    }
    x = next;
    paint();
  });
  ["pointerup", "pointercancel"].forEach(function (t) {
    strip.addEventListener(t, function () {
      dragging = false;
    });
  });

  function setHeld(on) {
    held = on;
    runBtn.setAttribute("aria-pressed", String(on));
    runBtn.textContent = on ? "Release reel" : "Hold reel";
  }

  runBtn.addEventListener("click", function () {
    setHeld(!held);
  });
  document.getElementById("back").addEventListener("click", function () {
    step(-1);
  });
  document.getElementById("fwd").addEventListener("click", function () {
    step(1);
  });
  document.getElementById("open").addEventListener("click", function () {
    openViewer(gateIndex());
  });

  var opened = -1;
  var restore = null;

  function openViewer(i) {
    opened = (i + FRAMES.length) % FRAMES.length;
    var f = FRAMES[opened];
    vImg.src = f.src;
    vImg.alt = f.alt;
    vCap.textContent = f.n + " \u00b7 " + f.name + " \u00b7 " + f.by + " \u00b7 " + f.lic;
    vCount.textContent = f.n + " / 0" + FRAMES.length;
    restore = document.activeElement;
    viewer.hidden = false;
    setHeld(true);
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
      openViewer(FRAMES.length - 1);
    } else if (k === "Tab") {
      var ring = [vPrev, vNext, vClose];
      var at = ring.indexOf(document.activeElement);
      ring[(at + (e.shiftKey ? -1 : 1) + ring.length) % ring.length].focus({ preventScroll: true });
    } else {
      return;
    }
    e.preventDefault();
  });

  window.addEventListener("resize", function () {
    var before = span;
    span = measure();
    if (span !== before) {
      x = x % span;
      paint();
    }
  });

  tSpeed.textContent = "24";
  span = measure();
  paint();
  paintGate();
  telem();
  requestAnimationFrame(tick);
})();
