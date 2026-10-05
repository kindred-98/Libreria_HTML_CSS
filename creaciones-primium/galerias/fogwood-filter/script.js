(function () {
  "use strict";

  var PLATES = [
    { n: "01", mist: "veil", hour: "dawn", depth: "edge", name: "Mist over the meadow", alt: "Mist lying low over a meadow as it creeps into the edge of a forest", body: "Ground mist, the kind that arrives before sunrise and leaves the first metre of the field white while the trunks stay dark.", by: "Wing-Chi Poon", lic: "CC BY-SA 2.5", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Mist_Covering_a_Meadow_under_Forest_Encroachment.jpg/960px-Mist_Covering_a_Meadow_under_Forest_Encroachment.jpg", page: "https://commons.wikimedia.org/wiki/File:Mist_Covering_a_Meadow_under_Forest_Encroachment.jpg" },
    { n: "02", mist: "bank", hour: "dawn", depth: "far", name: "Rise from black spruce", alt: "A thick bank of mist rising from a stand of black spruce", body: "A whole bank lifts at once. Nothing in the frame is sharp past the first two ranks of trunks.", by: "Hillebrand Steve, U.S. Fish and Wildlife Service", lic: "Public domain", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/A_mist_rises_from_a_black_spruce_forest.jpg/960px-A_mist_rises_from_a_black_spruce_forest.jpg", page: "https://commons.wikimedia.org/wiki/File:A_mist_rises_from_a_black_spruce_forest.jpg" },
    { n: "03", mist: "haze", hour: "noon", depth: "middle", name: "Kakerdaja bog, vapour", alt: "Vapour drifting over the open bog at Kakerdaja in Estonia", body: "Midday is the least photogenic hour for mist and the most useful one for reading depth: every stand sits at its own distance.", by: "Abrget47j", lic: "CC BY-SA 3.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Hommikune_udu_Kakerdaja_rabas.jpg/960px-Hommikune_udu_Kakerdaja_rabas.jpg", page: "https://commons.wikimedia.org/wiki/File:Hommikune_udu_Kakerdaja_rabas.jpg" },
    { n: "04", mist: "veil", hour: "dawn", depth: "edge", name: "Dulmen, first light", alt: "Sunrise over the country around Dulmen with mist lying in the fields", body: "Shot minutes after the sun clears the horizon, when the mist still has a surface and the far trees have not.", by: "Dietmar Rabich", lic: "CC BY-SA 4.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/D%C3%BClmen%2C_Umland%2C_Sonnenaufgang_--_2012_--_8069.jpg/960px-D%C3%BClmen%2C_Umland%2C_Sonnenaufgang_--_2012_--_8069.jpg", page: "https://commons.wikimedia.org/wiki/File:D%C3%BClmen,_Umland,_Sonnenaufgang_--_2012_--_8069.jpg" },
    { n: "05", mist: "bank", hour: "dusk", depth: "far", name: "Fog over the ridge", alt: "A bank of fog lying over a forested ridge at dusk", body: "The last of the evening bank, sitting in the fold of the hill and refusing to move until well after dark.", by: "Andrew Balfour", lic: "CC BY 3.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Fog_Over_Forest_-_panoramio.jpg/960px-Fog_Over_Forest_-_panoramio.jpg", page: "https://commons.wikimedia.org/wiki/File:Fog_Over_Forest_-_panoramio.jpg" },
    { n: "06", mist: "bank", hour: "dusk", depth: "far", name: "Shrouded forest", alt: "A forest entirely shrouded in drifting mist", body: "One of those frames where the trees are guessed rather than seen, and the fog is the only solid thing in it.", by: "Adam Porter adamkporter", lic: "CC0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Mist_shrouding_a_forest_%28Unsplash%29.jpg/960px-Mist_shrouding_a_forest_%28Unsplash%29.jpg", page: "https://commons.wikimedia.org/wiki/File:Mist_shrouding_a_forest_(Unsplash).jpg" },
    { n: "07", mist: "haze", hour: "noon", depth: "middle", name: "Mist on the hill", alt: "A mist-wreathed forest standing on a hillside in flat daylight", body: "A hillside comb: the crowns catch the light, the trunks dissolve, and the middle distance is nothing but grey steps.", by: "Milo McDowell milo_m", lic: "CC0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Mist-wreathed_forest_on_a_hill_%28Unsplash%29.jpg/960px-Mist-wreathed_forest_on_a_hill_%28Unsplash%29.jpg", page: "https://commons.wikimedia.org/wiki/File:Mist-wreathed_forest_on_a_hill_(Unsplash).jpg" },
    { n: "08", mist: "veil", hour: "noon", depth: "edge", name: "Forest in mist", alt: "A close stand of trees with mist threading between the nearest trunks", body: "Shot from inside the stand, where the veil is thin enough to photograph and thick enough to hide the far edge.", by: "Markus Kniebes", lic: "CC BY 3.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Forest_In_Mist_%2854328980%29.jpeg/960px-Forest_In_Mist_%2854328980%29.jpeg", page: "https://commons.wikimedia.org/wiki/File:Forest_In_Mist_(54328980).jpeg" }
  ];

  var LABEL = { mist: "all mist", hour: "all hours", depth: "all depths" };

  var register = document.getElementById("register");
  var noteOut = document.getElementById("note");
  var emptyOut = document.getElementById("empty");
  var credits = document.getElementById("credits");
  var groups = Array.prototype.slice.call(document.querySelectorAll(".group"));

  var viewer = document.getElementById("viewer");
  var vImg = document.getElementById("viewer-img");
  var vCap = document.getElementById("viewer-cap");
  var vCount = document.getElementById("viewer-count");
  var vClose = document.getElementById("viewer-close");
  var vPrev = document.getElementById("viewer-prev");
  var vNext = document.getElementById("viewer-next");

  var picks = { mist: "any", hour: "any", depth: "any" };
  var cards = [];
  var live = [];

  PLATES.forEach(function (p) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "plate";
    b.dataset.index = String(p.n - 1);

    var shot = document.createElement("span");
    shot.className = "plate__shot";
    var img = document.createElement("img");
    img.src = p.src;
    img.alt = p.alt;
    img.loading = "lazy";
    img.decoding = "async";
    var haze = document.createElement("span");
    haze.className = "plate__haze";
    var scale = document.createElement("span");
    scale.className = "plate__scale";
    for (var i = 0; i < 5; i++) {
      scale.appendChild(document.createElement("i"));
    }
    shot.appendChild(img);
    shot.appendChild(haze);
    shot.appendChild(scale);

    var cap = document.createElement("span");
    cap.className = "plate__cap";
    var num = document.createElement("span");
    num.className = "plate__n";
    num.textContent = "No " + p.n;
    var name = document.createElement("span");
    name.className = "plate__name";
    name.textContent = p.name;
    cap.appendChild(num);
    cap.appendChild(name);

    var tags = document.createElement("span");
    tags.className = "plate__tags";
    [p.mist, p.hour, p.depth].forEach(function (t) {
      var s = document.createElement("span");
      s.className = "plate__tag";
      s.textContent = t;
      tags.appendChild(s);
    });

    var body = document.createElement("p");
    body.className = "plate__body";
    body.textContent = p.body;

    b.appendChild(shot);
    b.appendChild(cap);
    b.appendChild(tags);
    b.appendChild(body);
    register.appendChild(b);
    cards.push(b);

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

  function apply() {
    live = [];
    cards.forEach(function (c, i) {
      var p = PLATES[i];
      var ok = (picks.mist === "any" || p.mist === picks.mist)
        && (picks.hour === "any" || p.hour === picks.hour)
        && (picks.depth === "any" || p.depth === picks.depth);
      c.hidden = !ok;
      if (ok) {
        live.push(i);
      }
    });

    var words = [];
    ["mist", "hour", "depth"].forEach(function (k) {
      words.push(picks[k] === "any" ? LABEL[k] : picks[k] + " only");
    });

    noteOut.textContent = live.length + " of " + PLATES.length + " plates in the register. " + words.join(", ").replace(/, ([^,]*)$/, " and $1") + ".";
    emptyOut.hidden = live.length !== 0;
  }

  groups.forEach(function (g) {
    var key = g.dataset.key;
    var chips = Array.prototype.slice.call(g.querySelectorAll(".chip"));
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        picks[key] = chip.dataset.val;
        chips.forEach(function (o) {
          var on = o === chip;
          o.classList.toggle("is-on", on);
          if (on) {
            o.setAttribute("aria-pressed", "true");
          } else {
            o.removeAttribute("aria-pressed");
          }
        });
        apply();
      });
    });
    chips[0].addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") {
        return;
      }
      var at = chips.indexOf(document.activeElement);
      if (at < 0) {
        return;
      }
      var to = e.key === "ArrowRight" ? (at + 1) % chips.length : (at - 1 + chips.length) % chips.length;
      e.preventDefault();
      chips[to].focus();
    });
  });

  register.addEventListener("click", function (e) {
    var b = e.target.closest(".plate");
    if (!b) {
      return;
    }
    openViewer(Number(b.dataset.index));
  });

  register.addEventListener("keydown", function (e) {
    var b = e.target.closest(".plate");
    if (!b) {
      return;
    }
    var k = e.key;
    var nx = null;
    if (k === "ArrowRight" || k === "ArrowDown") {
      nx = b.nextElementSibling;
    } else if (k === "ArrowLeft" || k === "ArrowUp") {
      nx = b.previousElementSibling;
    } else if (k === "Home") {
      var first = register.querySelector(".plate:not([hidden])");
      nx = first;
    } else if (k === "End") {
      var all = register.querySelectorAll(".plate:not([hidden])");
      nx = all.length ? all[all.length - 1] : null;
    } else {
      return;
    }
    e.preventDefault();
    if (nx) {
      nx.focus();
    }
  });

  var opened = -1;
  var restore = null;

  function openViewer(i) {
    opened = (i + PLATES.length) % PLATES.length;
    var p = PLATES[opened];
    vImg.src = p.src;
    vImg.alt = p.alt;
    vCap.textContent = "No " + p.n + " \u00b7 " + p.name + " \u00b7 " + p.mist + " mist at " + p.hour + ", " + p.depth + " depth \u00b7 " + p.by + " \u00b7 " + p.lic;
    vCount.textContent = p.n + " / 0" + PLATES.length;
    restore = document.activeElement;
    viewer.hidden = false;
    vClose.focus({ preventScroll: true });
  }

  function step(d) {
    if (!live.length) {
      return;
    }
    var at = live.indexOf(opened);
    if (at < 0) {
      openViewer(live[0]);
      return;
    }
    openViewer(live[(at + d + live.length) % live.length]);
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
      if (live.length) {
        openViewer(live[0]);
      }
    } else if (k === "End") {
      if (live.length) {
        openViewer(live[live.length - 1]);
      }
    } else if (k === "Tab") {
      var ring = [vPrev, vNext, vClose];
      var at = ring.indexOf(document.activeElement);
      ring[(at + (e.shiftKey ? -1 : 1) + ring.length) % ring.length].focus({ preventScroll: true });
    } else {
      return;
    }
    e.preventDefault();
  });

  apply();
})();
