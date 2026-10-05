(function () {
  "use strict";

  var PLATES = [
    { n: "01", vantage: "pitch", att: "68 400", alt: "The United States Navy band playing to the crowd before a preseason baseball game at Surprise Stadium", by: "U.S. Navy photo by Chief Photographer's Mate Gary Ward", lic: "Public domain", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/US_Navy_060318-N-3271W-001_The_U.S._Navy_Band_Destroyers_play_to_the_crowd_before_a_preseason_baseball_at_Surprise_Stadium.jpg/960px-US_Navy_060318-N-3271W-001_The_U.S._Navy_Band_Destroyers_play_to_the_crowd_before_a_preseason_baseball_at_Surprise_Stadium.jpg", page: "https://commons.wikimedia.org/wiki/File:US_Navy_060318-N-3271W-001_The_U.S._Navy_Band_Destroyers_play_to_the_crowd_before_a_preseason_baseball_at_Surprise_Stadium.jpg" },
    { n: "02", vantage: "tribune", att: "74 900", alt: "A concert filling the Millennium stadium bowl with a vast lit crowd", by: "Andrew King", lic: "CC BY-SA 2.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Millennium_stadium_concert.jpg/960px-Millennium_stadium_concert.jpg", page: "https://commons.wikimedia.org/wiki/File:Millennium_stadium_concert.jpg" },
    { n: "03", vantage: "tribune", att: "64 200", alt: "A dense festival crowd seen from the stands at the Millennium stadium in Cardiff", by: "Andrew King", lic: "CC BY-SA 2.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/MSP_Crowd_-_Cardiff_June_2010.jpg/960px-MSP_Crowd_-_Cardiff_June_2010.jpg", page: "https://commons.wikimedia.org/wiki/File:MSP_Crowd_-_Cardiff_June_2010.jpg" },
    { n: "04", vantage: "street", att: "42 000", alt: "The end of a concert emptying out of the Westpac stadium into the street", by: "Edward Hyde from Tauranga, New Zealand", lic: "CC BY-SA 2.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/End_of_the_concert%2C_Westpac_Stadium.jpg/960px-End_of_the_concert%2C_Westpac_Stadium.jpg", page: "https://commons.wikimedia.org/wiki/File:End_of_the_concert,_Westpac_Stadium.jpg" },
    { n: "05", vantage: "street", att: "55 500", alt: "A massive crowd of fans packed together outside a concert exit", by: "USAID Vietnam", lic: "Public domain", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/A_massive_crowd_of_fans_are_thrilled_at_the_MTV_EXIT.jpg/960px-A_massive_crowd_of_fans_are_thrilled_at_the_MTV_EXIT.jpg", page: "https://commons.wikimedia.org/wiki/File:A_massive_crowd_of_fans_are_thrilled_at_the_MTV_EXIT.jpg" },
    { n: "06", vantage: "street", att: "55 500", alt: "Fans pressed together at another concert exit, hands raised toward the stage", by: "USAID Vietnam", lic: "Public domain", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/A_massive_crowd_of_fans_are_thrilled_at_the_MTV_EXIT_01.jpg/960px-A_massive_crowd_of_fans_are_thrilled_at_the_MTV_EXIT_01.jpg", page: "https://commons.wikimedia.org/wiki/File:A_massive_crowd_of_fans_are_thrilled_at_the_MTV_EXIT_01.jpg" },
    { n: "07", vantage: "stage", att: "72 100", alt: "Keith Richards waving to the London crowd during a Rolling Stones concert", by: "Raph_PH", lic: "CC BY 2.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Keith_Richards_waves_to_London_crowd_during_Rolling_Stones_concert_-_22_May_2018_%2842291973682%29.jpg/960px-Keith_Richards_waves_to_London_crowd_during_Rolling_Stones_concert_-_22_May_2018_%2842291973682%29.jpg", page: "https://commons.wikimedia.org/wiki/File:Keith_Richards_waves_to_London_crowd_during_Rolling_Stones_concert_-_22_May_2018_(42291973682).jpg" },
    { n: "08", vantage: "stage", att: "72 100", alt: "Keith Richards looking down into the London crowd after a Rolling Stones concert", by: "Raph_PH", lic: "CC BY 2.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Keith_Richards_looks_into_crowd_post-Rolling_Stones_concert_in_London_-_22_May_2018_%2841437870875%29.jpg/960px-Keith_Richards_looks_into_crowd_post-Rolling_Stones_concert_in_London_-_22_May_2018_%2841437870875%29.jpg", page: "https://commons.wikimedia.org/wiki/File:Keith_Richards_looks_into_crowd_post-Rolling_Stones_concert_in_London_-_22_May_2018_(41437870875).jpg" }
  ];

  var PACK = {
    1: ["slab"],
    2: ["wide", "wide"],
    3: ["", "", ""],
    4: ["wide", "wide", "wide", "wide"],
    5: ["", "", "", "", "quad"],
    6: ["", "", "", "", "", ""],
    7: ["", "", "", "", "", "", "slab"],
    8: ["quad", "", "", "", "", "", "", ""]
  };

  var mosaic = document.getElementById("mosaic");
  var credits = document.getElementById("credits");
  var tCount = document.getElementById("t-count");
  var tOrder = document.getElementById("t-order");
  var tSweep = document.getElementById("t-sweep");
  var flipBtn = document.getElementById("flip");
  var vantageBtns = Array.prototype.slice.call(document.querySelectorAll("#vantage .board__btn"));

  var viewer = document.getElementById("viewer");
  var vImg = document.getElementById("viewer-img");
  var vCap = document.getElementById("viewer-cap");
  var vCount = document.getElementById("viewer-count");
  var vClose = document.getElementById("viewer-close");
  var vPrev = document.getElementById("viewer-prev");
  var vNext = document.getElementById("viewer-next");

  var still = window.matchMedia("(prefers-reduced-motion: reduce)");

  var cells = [];
  var visible = [];
  var vantage = "all";
  var flipped = false;
  var cursor = 0;
  var sweep = 0;
  var last = 0;
  var stamp = 0;

  function spanClass(kind) {
    if (kind === "wide") {
      return " cell--wide";
    }
    if (kind === "quad") {
      return " cell--quad";
    }
    if (kind === "block") {
      return " cell--block";
    }
    if (kind === "slab") {
      return " cell--slab";
    }
    return "";
  }

  PLATES.forEach(function (p, i) {
    var cell = document.createElement("button");
    cell.type = "button";
    cell.className = "cell" + spanClass(PACK[PLATES.length][i] || "");
    cell.dataset.index = String(i);
    cell.tabIndex = i === 0 ? 0 : -1;

    var shot = document.createElement("span");
    shot.className = "cell__shot";
    var img = document.createElement("img");
    img.src = p.src;
    img.alt = p.alt;
    img.loading = "lazy";
    img.decoding = "async";

    var grid = document.createElement("span");
    grid.className = "cell__grid";
    var wash = document.createElement("span");
    wash.className = "cell__wash";
    shot.appendChild(img);
    shot.appendChild(grid);
    shot.appendChild(wash);

    var att = document.createElement("span");
    att.className = "cell__att";
    att.textContent = p.att;

    var data = document.createElement("span");
    data.className = "cell__data";
    var num = document.createElement("span");
    num.className = "cell__n";
    num.textContent = p.n;
    var name = document.createElement("span");
    name.className = "cell__name";
    name.textContent = p.by;
    var van = document.createElement("span");
    van.className = "cell__vantage";
    van.textContent = p.vantage;
    data.appendChild(num);
    data.appendChild(name);
    data.appendChild(van);

    cell.appendChild(shot);
    cell.appendChild(att);
    cell.appendChild(data);
    mosaic.appendChild(cell);
    cells.push(cell);

    var li = document.createElement("li");
    var a = document.createElement("a");
    a.href = p.page;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = p.n + " " + p.vantage;
    li.appendChild(a);
    li.appendChild(document.createTextNode(" \u2014 " + p.by + ", " + p.lic));
    credits.appendChild(li);
  });

  function pack() {
    var first = cells.map(function (c) {
      if (c.classList.contains("is-out")) {
        return null;
      }
      var r = c.getBoundingClientRect();
      return { x: r.left, y: r.top, w: r.width, h: r.height };
    });

    visible = [];
    cells.forEach(function (c, i) {
      var keep = vantage === "all" || PLATES[i].vantage === vantage;
      c.classList.toggle("is-out", !keep);
      if (keep) {
        visible.push(i);
      }
    });

    var order = visible.slice();
    if (flipped) {
      order.reverse();
    }
    var pattern = PACK[order.length] || [];
    order.forEach(function (idx, k) {
      var c = cells[idx];
      mosaic.appendChild(c);
      c.className = "cell" + spanClass(pattern[k] || "");
    });

    tCount.textContent = String(order.length).padStart(2, "0");
    tOrder.textContent = flipped ? "Z to A" : "A to Z";

    if (!order.length) {
      cells.forEach(function (c) {
        c.classList.remove("is-cursor");
        c.tabIndex = -1;
      });
      return;
    }

    if (order.includes(cursor)) {
      cursor = order[0];
    }
    cells.forEach(function (c, i) {
      c.tabIndex = i === cursor ? 0 : -1;
      if (i === cursor) {
        c.classList.add("is-cursor");
      } else {
        c.classList.remove("is-cursor");
      }
    });

    if (still.matches) {
      return;
    }

    cells.forEach(function (c, i) {
      var before = first[i];
      if (c.classList.contains("is-out") || !before) {
        if (!c.classList.contains("is-out")) {
          c.classList.add("is-entering");
        }
        c.style.transform = "";
        return;
      }
      var r = c.getBoundingClientRect();
      var dx = before.x - r.left;
      var dy = before.y - r.top;
      if (Math.abs(dx) < .5 && Math.abs(dy) < .5) {
        c.style.transform = "";
        return;
      }
      c.style.transform = "translate3d(" + dx.toFixed(1) + "px," + dy.toFixed(1) + "px,0)";
    });

    mosaic.getBoundingClientRect();

    cells.forEach(function (c) {
      if (!c.classList.contains("is-out") && c.style.transform) {
        c.style.transform = "translate3d(0,0,0)";
      }
    });

    window.setTimeout(function () {
      cells.forEach(function (c) {
        c.classList.remove("is-entering");
        if (!c.classList.contains("is-out")) {
          c.style.transform = "";
        }
      });
    }, 620);
  }

  function order_() {
    return visible.slice().sort(function (a, b) {
      return flipped ? b - a : a - b;
    });
  }

  function move(d) {
    var seq = order_();
    if (!seq.length) {
      return;
    }
    var at = seq.indexOf(cursor);
    var to = Math.max(0, Math.min(seq.length - 1, at + d));
    cursor = seq[to];
    cells.forEach(function (c, i) {
      c.tabIndex = i === cursor ? 0 : -1;
      if (i === cursor) {
        c.classList.add("is-cursor");
        c.focus({ preventScroll: true });
      } else {
        c.classList.remove("is-cursor");
      }
    });
  }

  mosaic.addEventListener("keydown", function (e) {
    var c = e.target.closest(".cell");
    if (!c) {
      return;
    }
    var k = e.key;
    if (k === "ArrowRight" || k === "ArrowDown") {
      move(1);
    } else if (k === "ArrowLeft" || k === "ArrowUp") {
      move(-1);
    } else if (k === "Home") {
      move(-99);
    } else if (k === "End") {
      move(99);
    } else if (k === "Enter") {
      openViewer(cursor);
    } else {
      return;
    }
    e.preventDefault();
  });

  mosaic.addEventListener("click", function (e) {
    var c = e.target.closest(".cell");
    if (!c) {
      return;
    }
    cursor = Number(c.dataset.index);
    cells.forEach(function (o, i) {
      o.tabIndex = i === cursor ? 0 : -1;
      if (i === cursor) {
        o.classList.add("is-cursor");
      } else {
        o.classList.remove("is-cursor");
      }
    });
    openViewer(cursor);
  });

  vantageBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      vantage = b.dataset.vantage;
      vantageBtns.forEach(function (o) {
        var on = o === b;
        o.classList.toggle("is-on", on);
        if (on) {
          o.setAttribute("aria-pressed", "true");
        } else {
          o.removeAttribute("aria-pressed");
        }
      });
      pack();
    });
  });

  vantageBtns[0].addEventListener("keydown", function (e) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") {
      return;
    }
    var at = vantageBtns.indexOf(document.activeElement);
    if (at < 0) {
      return;
    }
    var to = e.key === "ArrowRight" ? (at + 1) % vantageBtns.length : (at - 1 + vantageBtns.length) % vantageBtns.length;
    e.preventDefault();
    vantageBtns[to].focus();
  });

  flipBtn.addEventListener("click", function () {
    flipped = !flipped;
    flipBtn.setAttribute("aria-pressed", String(flipped));
    pack();
  });

  function tick(now) {
    if (!last) {
      last = now;
    }
    var dt = Math.min(48, now - last) / 16.67;
    last = now;
    if (!still.matches) {
      sweep += dt * 22;
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
    vCap.textContent = "Plate " + p.n + " \u00b7 " + p.vantage + " \u00b7 " + p.att + " in the bowl \u00b7 " + p.by + " \u00b7 " + p.lic;
    vCount.textContent = p.n + " / 0" + PLATES.length;
    restore = document.activeElement;
    viewer.hidden = false;
    vClose.focus({ preventScroll: true });
  }

  function step(d) {
    var seq = order_();
    if (!seq.length) {
      return;
    }
    var at = seq.indexOf(opened);
    if (at < 0) {
      openViewer(seq[0]);
      return;
    }
    openViewer(seq[(at + d + seq.length) % seq.length]);
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
    step(-1);
  });
  vNext.addEventListener("click", function () {
    step(1);
  });
  viewer.querySelector(".viewer__scrim").addEventListener("click", closeViewer);

  viewer.addEventListener("keydown", function (e) {
    var k = e.key;
    if (k === "Escape") {
      closeViewer();
    } else if (k === "ArrowRight") {
      step(1);
    } else if (k === "ArrowLeft") {
      step(-1);
    } else if (k === "Home") {
      openViewer(order_()[0]);
    } else if (k === "End") {
      var seq = order_();
      openViewer(seq[seq.length - 1]);
    } else if (k === "Tab") {
      var ring = [vPrev, vNext, vClose];
      var at = ring.indexOf(document.activeElement);
      ring[(at + (e.shiftKey ? -1 : 1) + ring.length) % ring.length].focus({ preventScroll: true });
    } else {
      return;
    }
    e.preventDefault();
  });

  pack();
  requestAnimationFrame(tick);
})();
