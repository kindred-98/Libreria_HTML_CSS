(function () {
  "use strict";

  var SPECIMENS = [
    { n: "01", group: "bulb", latin: "Tulipa clusiana Lady Jane", common: "Rock ledge tulip, white petals flushed rose on the outside", alt: "A white and rose tulip in bloom on a rock ledge", by: "Derek Ramsey", lic: "CC BY-SA 3.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Tulip_Tulipa_clusiana_%27Lady_Jane%27_Rock_Ledge_Flower_Edit_2000px.jpg/960px-Tulip_Tulipa_clusiana_%27Lady_Jane%27_Rock_Ledge_Flower_Edit_2000px.jpg", page: "https://commons.wikimedia.org/wiki/File:Tulip_Tulipa_clusiana_'Lady_Jane'_Rock_Ledge_Flower_Edit_2000px.jpg" },
    { n: "02", group: "bulb", latin: "Lilium Citronella", common: "An oriental lily with recurved citron petals", alt: "A citronella lily flower with recurved petals and dark stamens", by: "Derek Ramsey", lic: "CC BY-SA 3.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Lily_Lilium_%27Citronella%27_Flower.jpg/960px-Lily_Lilium_%27Citronella%27_Flower.jpg", page: "https://commons.wikimedia.org/wiki/File:Lily_Lilium_'Citronella'_Flower.jpg" },
    { n: "03", group: "composite", latin: "Leucanthemum vulgare Filigran", common: "The common daisy, a broad white ray around a yellow disc", alt: "A broad white daisy ray flower around a yellow central disc", by: "Derek Ramsey", lic: "CC BY-SA 3.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Leucanthemum_vulgare_%27Filigran%27_Flower_2200px.jpg/960px-Leucanthemum_vulgare_%27Filigran%27_Flower_2200px.jpg", page: "https://commons.wikimedia.org/wiki/File:Leucanthemum_vulgare_'Filigran'_Flower_2200px.jpg" },
    { n: "04", group: "composite", latin: "Osteospermum Power Spider Purple", common: "A spider osteospermum with a deep violet ray and dark eye", alt: "A purple spider osteospermum flower with a dark central eye", by: "Derek Ramsey", lic: "GFDL 1.2", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Osteospermum_Flower_Power_Spider_Purple_2134px.jpg/960px-Osteospermum_Flower_Power_Spider_Purple_2134px.jpg", page: "https://commons.wikimedia.org/wiki/File:Osteospermum_Flower_Power_Spider_Purple_2134px.jpg" },
    { n: "05", group: "macro", latin: "Asteraceae, unnamed", common: "A bumble bee working a purple composite head", alt: "A bumble bee collecting pollen from a purple flower head", by: "ForestWander", lic: "CC BY-SA 3.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Bee-Purple-Flower-Macro_ForestWander.jpg/960px-Bee-Purple-Flower-Macro_ForestWander.jpg", page: "https://commons.wikimedia.org/wiki/File:Bee-Purple-Flower-Macro_ForestWander.jpg" },
    { n: "06", group: "macro", latin: "Ranunculus, unidentified", common: "Glossy petals layered tight, shot at full aperture", alt: "A tight rosette of glossy flower petals shot close up", by: "Marius Iordache", lic: "Public domain", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Flower_macro_hd.jpg/960px-Flower_macro_hd.jpg", page: "https://commons.wikimedia.org/wiki/File:Flower_macro_hd.jpg" },
    { n: "07", group: "macro", latin: "Dianthus, garden form", common: "A pink fringed petal filling the frame edge to edge", alt: "A pink fringed flower petal filling the whole frame", by: "Becks", lic: "CC BY 2.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Pink_flower_macro_%287036053881%29.jpg/960px-Pink_flower_macro_%287036053881%29.jpg", page: "https://commons.wikimedia.org/wiki/File:Pink_flower_macro_(7036053881).jpg" },
    { n: "08", group: "composite", latin: "Helianthus, cultivated", common: "A sunflower head gone to seed, pappus standing up", alt: "A sunflower head at seed stage with the pappus standing up", by: "Manisamg", lic: "CC BY-SA 3.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Macro_Flower_manish.JPG/960px-Macro_Flower_manish.JPG", page: "https://commons.wikimedia.org/wiki/File:Macro_Flower_manish.JPG" }
  ];

  var GROUPS = ["all", "bulb", "composite", "macro"];

  var form = document.getElementById("query");
  var field = document.getElementById("q");
  var drawer = document.getElementById("drawer");
  var countOut = document.getElementById("count");
  var emptyOut = document.getElementById("empty");
  var credits = document.getElementById("credits");
  var chips = Array.prototype.slice.call(document.querySelectorAll(".filters__chip"));

  var viewer = document.getElementById("viewer");
  var vImg = document.getElementById("viewer-img");
  var vCap = document.getElementById("viewer-cap");
  var vCount = document.getElementById("viewer-count");
  var vClose = document.getElementById("viewer-close");
  var vPrev = document.getElementById("viewer-prev");
  var vNext = document.getElementById("viewer-next");

  var active = "all";
  var cards = [];
  var hits = 0;

  function hay(s) {
    return (s.latin + " " + s.common + " " + s.group + " " + s.by + " " + s.lic + " " + s.n).toLowerCase();
  }

  function build() {
    SPECIMENS.forEach(function (s, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "spec";
      b.dataset.index = String(i);
      b.style.animationDelay = (i * 55) + "ms";

      var mount = document.createElement("span");
      mount.className = "spec__mount";
      var img = document.createElement("img");
      img.src = s.src;
      img.alt = s.alt;
      img.loading = "lazy";
      img.decoding = "async";
      var mat = document.createElement("span");
      mat.className = "spec__mat";
      var stamp = document.createElement("span");
      stamp.className = "spec__stamp";
      stamp.textContent = "Sheet " + s.n;
      mount.appendChild(img);
      mount.appendChild(mat);
      mount.appendChild(stamp);

      var latin = document.createElement("p");
      latin.className = "spec__latin";
      latin.textContent = s.latin;
      var common = document.createElement("p");
      common.className = "spec__common";
      common.textContent = s.common;
      var line = document.createElement("span");
      line.className = "spec__line";
      var meta = document.createElement("p");
      meta.className = "spec__meta";
      var g = document.createElement("span");
      g.textContent = s.group;
      var by = document.createElement("span");
      by.textContent = s.by;
      var lic = document.createElement("span");
      lic.textContent = s.lic;
      meta.appendChild(g);
      meta.appendChild(by);
      meta.appendChild(lic);

      b.appendChild(mount);
      b.appendChild(latin);
      b.appendChild(common);
      b.appendChild(line);
      b.appendChild(meta);
      drawer.appendChild(b);
      cards.push(b);

      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = s.page;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = s.latin;
      li.appendChild(a);
      li.appendChild(document.createTextNode(" \u2014 " + s.common + ". " + s.by + ", " + s.lic));
      credits.appendChild(li);
    });
  }

  function run() {
    var q = field.value.trim().toLowerCase();
    hits = 0;
    cards.forEach(function (c, i) {
      var s = SPECIMENS[i];
      var ok = (active === "all" || s.group === active) && (!q || hay(s).includes(q));
      c.hidden = !ok;
      if (ok) {
        hits++;
      }
    });
    countOut.textContent = hits + " of " + SPECIMENS.length + " specimen" + (hits === 1 ? "" : "s") + " in the cabinet";
    emptyOut.hidden = hits !== 0;
  }

  field.addEventListener("input", run);
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var first = drawer.querySelector(".spec:not([hidden])");
    if (first) {
      first.focus();
    }
  });
  form.addEventListener("reset", function () {
    active = "all";
    chips.forEach(function (c) {
      var on = c.dataset.group === "all";
      c.classList.toggle("is-on", on);
      if (on) {
        c.setAttribute("aria-pressed", "true");
      } else {
        c.removeAttribute("aria-pressed");
      }
    });
    window.setTimeout(run, 0);
  });

  chips.forEach(function (c) {
    c.addEventListener("click", function () {
      active = c.dataset.group;
      chips.forEach(function (o) {
        var on = o === c;
        o.classList.toggle("is-on", on);
        if (on) {
          o.setAttribute("aria-pressed", "true");
        } else {
          o.removeAttribute("aria-pressed");
        }
      });
      run();
    });
  });

  chips[0].addEventListener("keydown", function (e) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") {
      return;
    }
    var at = GROUPS.indexOf(active);
    var to = e.key === "ArrowRight" ? (at + 1) % GROUPS.length : (at - 1 + GROUPS.length) % GROUPS.length;
    e.preventDefault();
    var next = chips[GROUPS.indexOf(GROUPS[to])];
    if (next) {
      next.click();
      next.focus();
    }
  });

  drawer.addEventListener("click", function (e) {
    var b = e.target.closest(".spec");
    if (!b) {
      return;
    }
    openViewer(Number(b.dataset.index));
  });

  drawer.addEventListener("keydown", function (e) {
    var b = e.target.closest(".spec");
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
      nx = drawer.querySelector(".spec:not([hidden])");
    } else if (k === "End") {
      var live = drawer.querySelectorAll(".spec:not([hidden])");
      nx = live.length ? live[live.length - 1] : null;
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
    opened = (i + SPECIMENS.length) % SPECIMENS.length;
    var s = SPECIMENS[opened];
    vImg.src = s.src;
    vImg.alt = s.alt;
    vCap.textContent = "Sheet " + s.n + " \u00b7 " + s.latin + " \u00b7 " + s.by + " \u00b7 " + s.lic;
    vCount.textContent = s.n + " / 0" + SPECIMENS.length;
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
    } else if (k === "ArrowRight") {
      openViewer(opened + 1);
    } else if (k === "ArrowLeft") {
      openViewer(opened - 1);
    } else if (k === "Home") {
      openViewer(0);
    } else if (k === "End") {
      openViewer(SPECIMENS.length - 1);
    } else if (k === "Tab") {
      var ring = [vPrev, vNext, vClose];
      var at = ring.indexOf(document.activeElement);
      ring[(at + (e.shiftKey ? -1 : 1) + ring.length) % ring.length].focus({ preventScroll: true });
    } else {
      return;
    }
    e.preventDefault();
  });

  build();
  run();
})();
