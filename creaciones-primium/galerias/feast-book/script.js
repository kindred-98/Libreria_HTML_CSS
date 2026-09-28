(function () {
  "use strict";

  var PLATES = [
    { n: "01", name: "Banchan", alt: "A spread of Korean banchan in small bowls", by: "Timber Tank", lic: "CC BY-SA 2.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Korean_cuisine-Banchan-03.jpg/960px-Korean_cuisine-Banchan-03.jpg" },
    { n: "02", name: "Sanchon", alt: "A temple table laid with Korean vegetarian dishes", by: "Richy", lic: "CC BY-SA 2.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Korean_temple_cuisine-Sanchon-01.jpg/960px-Korean_temple_cuisine-Sanchon-01.jpg" },
    { n: "03", name: "Badnik table", alt: "A Macedonian family table laid for Christmas Eve", by: "Crnorizec", lic: "public domain", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Christmas_Eve_%28Badnik%29_Dinner_Table_Macedonian.jpg/960px-Christmas_Eve_%28Badnik%29_Dinner_Table_Macedonian.jpg" },
    { n: "04", name: "Orcem display", alt: "A kitchen counter arranged with jars and serving dishes", by: "Brian Stansberry", lic: "CC BY 3.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Kitchen-display-orcm-tn1.jpg/960px-Kitchen-display-orcm-tn1.jpg" },
    { n: "05", name: "Serbian table", alt: "A Serbian Christmas meal with bread, meat and red wine", by: "Petar Milošević", lic: "CC BY-SA 3.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Serbian_Christmas_meal.jpg/960px-Serbian_Christmas_meal.jpg" },
    { n: "06", name: "Table warmer", alt: "A table top food warmer with a pan under a heat lamp", by: "E4024", lic: "CC BY-SA 4.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Table_top_food_warmer.jpg/960px-Table_top_food_warmer.jpg" },
    { n: "07", name: "Long table", alt: "A kitchen with a long table laid for a whole meal", by: "Moyan Brenn", lic: "CC BY 2.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Kitchen_%285952218056%29.jpg/960px-Kitchen_%285952218056%29.jpg" },
    { n: "08", name: "Kitchen still life", alt: "An old painting of a cook at a kitchen table with game", by: "Frans Snyders", lic: "public domain", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Frans_Snyders_-_Cook_at_a_Kitchen_Table_with_Dead_Game.jpg/960px-Frans_Snyders_-_Cook_at_a_Kitchen_Table_with_Dead_Game.jpg" }
  ];

  var LEAVES = 4;
  var TURN = 780;

  var book = document.getElementById("book");
  var leavesBox = document.getElementById("leaves");
  var pageLeft = document.getElementById("pageLeft");
  var pageRight = document.getElementById("pageRight");
  var leftFolio = document.getElementById("leftFolio");
  var leftFurniture = document.getElementById("leftFurniture");
  var leftBody = document.getElementById("leftBody");
  var marks = document.getElementById("marks");
  var prevBtn = document.getElementById("prev");
  var nextBtn = document.getElementById("next");
  var viewBtn = document.getElementById("view");
  var nibPrev = document.getElementById("nibPrev");
  var nibNext = document.getElementById("nibNext");

  var viewer = document.getElementById("viewer");
  var vImg = document.getElementById("vimg");
  var vCap = document.getElementById("vcap");
  var vCount = document.getElementById("vcount");
  var vClose = document.getElementById("vclose");
  var vPrev = document.getElementById("vprev");
  var vNext = document.getElementById("vnext");

  var still = window.matchMedia("(prefers-reduced-motion: reduce)");

  function face(idx, side, folio) {
    var p = PLATES[idx];
    var f = document.createElement("div");
    f.className = "leaf__face leaf__face--" + side;
    var curl = document.createElement("span");
    curl.className = "leaf__curl";
    var inner = document.createElement("div");
    inner.className = "leaf__inner";
    var plate = document.createElement("button");
    plate.type = "button";
    plate.className = "plate";
    plate.dataset.index = String(idx);
    var shot = document.createElement("span");
    shot.className = "plate__shot";
    var img = document.createElement("img");
    img.src = p.src;
    img.alt = p.alt;
    img.loading = "lazy";
    img.decoding = "async";
    shot.appendChild(img);
    plate.appendChild(shot);
    var cap = document.createElement("p");
    cap.className = "plate__cap";
    cap.textContent = "Plate " + p.n + " \u00b7 " + p.name + " \u00b7 " + p.by + " \u00b7 " + p.lic;
    var fol = document.createElement("p");
    fol.className = "leaf__folio";
    fol.textContent = folio;
    inner.appendChild(plate);
    inner.appendChild(cap);
    inner.appendChild(fol);
    f.appendChild(curl);
    f.appendChild(inner);
    return f;
  }

  var leaves = [];
  for (var i = 0; i < LEAVES; i++) {
    var l = document.createElement("div");
    l.className = "leaf";
    l.style.zIndex = String(24 - i);
    l.dataset.home = String(24 - i);
    l.appendChild(face(i * 2, "front", "Folio " + (i * 2 + 1)));
    l.appendChild(face(i * 2 + 1, "back", "Folio " + (i * 2 + 2)));
    leavesBox.appendChild(l);
    leaves.push(l);
  }

  var markBtns = [];
  for (var s = 0; s <= LEAVES; s++) {
    (function (k) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "mark";
      b.textContent = String(k + 1);
      b.setAttribute("aria-label", k === 0 ? "Go to the title page" : k === LEAVES ? "Go to the colophon" : "Go to spread " + (k + 1));
      b.addEventListener("click", function () {
        goTo(k);
      });
      marks.appendChild(b);
      markBtns.push(b);
    })(s);
  }

  var spread = 0;
  var busy = false;

  function rightPlate() {
    return spread === 0 ? 0 : spread * 2;
  }

  function describe() {
    prevBtn.disabled = spread === 0 || busy;
    nextBtn.disabled = spread === LEAVES || busy;
    nibPrev.disabled = spread === 0 || busy;
    nibNext.disabled = spread === LEAVES || busy;
    markBtns.forEach(function (b, k) {
      b.classList.toggle("is-here", k === spread);
      b.setAttribute("aria-current", k === spread ? "true" : "false");
    });
    leftFurniture.textContent = spread === 0 ? "Title page" : "Plate " + PLATES[spread * 2 - 1].n;
    leftFolio.textContent = spread === 0 ? "No folio" : "Folio " + (spread * 2);
  }

  function renderTitle() {
    leftBody.innerHTML = "";
    var p1 = document.createElement("p");
    p1.className = "drop";
    p1.textContent = "This book has four leaves and no recipe in it. It is eight photographs of food, set two to a spread, with a wash of claret behind them.";
    var p2 = document.createElement("p");
    p2.className = "page__small";
    p2.textContent = "Turn the page to begin. Each leaf carries a photograph on the front and another on the back, so every spread shows two.";
    leftBody.appendChild(p1);
    leftBody.appendChild(p2);
  }

  function turn(dir) {
    var target = spread + dir;
    if (busy || target < 0 || target > LEAVES) {
      return;
    }
    var leaf = leaves[spread];
    var home = Number(leaf.dataset.home);
    busy = true;
    describe();
    if (dir > 0) {
      leaf.classList.add("is-turning");
      leaf.style.transform = "rotateY(-180deg)";
      window.setTimeout(function () {
        leaf.style.zIndex = String(2 + spread);
      }, TURN * 0.5);
      window.setTimeout(function () {
        leaf.classList.remove("is-turning");
        spread = target;
        busy = false;
        describe();
      }, TURN + 40);
    } else {
      leaf.style.zIndex = "40";
      leaf.classList.add("is-turning");
      void leaf.offsetWidth;
      leaf.style.transform = "rotateY(0deg)";
      window.setTimeout(function () {
        leaf.classList.remove("is-turning");
        leaf.style.zIndex = String(home);
        spread = target;
        busy = false;
        describe();
      }, TURN + 40);
    }
  }

  function goTo(k) {
    var diff = k - spread;
    if (diff === 0 || busy) {
      return;
    }
    var steps = Math.abs(diff);
    var dir = diff > 0 ? 1 : -1;
    var run = function (left) {
      if (left <= 0) {
        return;
      }
      turn(dir);
      window.setTimeout(function () {
        run(left - 1);
      }, TURN + 60);
    };
    run(steps);
  }

  prevBtn.addEventListener("click", function () {
    turn(-1);
  });
  nextBtn.addEventListener("click", function () {
    turn(1);
  });
  nibPrev.addEventListener("click", function () {
    turn(-1);
  });
  nibNext.addEventListener("click", function () {
    turn(1);
  });

  book.addEventListener("click", function (e) {
    if (e.target.closest(".plate") || e.target.closest(".nib") || e.target.closest(".mark")) {
      return;
    }
    var r = book.getBoundingClientRect();
    if (e.clientX < r.left + r.width / 2) {
      turn(-1);
    } else {
      turn(1);
    }
  });

  document.addEventListener("keydown", function (e) {
    if (!viewer.hidden) {
      return;
    }
    var k = e.key;
    if (k === "ArrowRight" || k === "PageDown") {
      turn(1);
      e.preventDefault();
    } else if (k === "ArrowLeft" || k === "PageUp") {
      turn(-1);
      e.preventDefault();
    } else if (k === "Home") {
      goTo(0);
      e.preventDefault();
    } else if (k === "End") {
      goTo(LEAVES);
      e.preventDefault();
    }
  });

  book.addEventListener("click", function (e) {
    var p = e.target.closest(".plate");
    if (p) {
      openViewer(Number(p.dataset.index));
    }
  });

  viewBtn.addEventListener("click", function () {
    openViewer(spread === LEAVES ? LEAVES * 2 - 1 : rightPlate());
  });

  var opened = -1;
  var restore = null;

  function openViewer(i) {
    opened = ((i % PLATES.length) + PLATES.length) % PLATES.length;
    var p = PLATES[opened];
    vImg.src = p.src;
    vImg.alt = p.alt;
    vCap.textContent = "Plate " + p.n + " \u00b7 " + p.name + " \u00b7 " + p.by + " \u00b7 " + p.lic;
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

  function step(d) {
    openViewer(opened + d);
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
      e.preventDefault();
    } else if (k === "ArrowRight") {
      step(1);
      e.preventDefault();
    } else if (k === "ArrowLeft") {
      step(-1);
      e.preventDefault();
    } else if (k === "Home") {
      openViewer(0);
      e.preventDefault();
    } else if (k === "End") {
      openViewer(PLATES.length - 1);
      e.preventDefault();
    } else if (k === "Tab") {
      var f = [vPrev, vNext, vClose];
      var at = f.indexOf(document.activeElement);
      e.preventDefault();
      f[(at + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus({ preventScroll: true });
    }
  });

  renderTitle();
  describe();
  if (still.matches) {
    TURN = 1;
  }
})();
