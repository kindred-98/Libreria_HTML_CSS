(function () {
  var COVERS = [
    { no: "I.1", course: "Course one, the table", name: "A stone table in a monastery hall", note: "First cover, and the plainest: one slab of stone on two carved legs, in a room paved with the same stone. Nothing is on it. Everything that follows in this service is measured against how little this one needed.", credit: "J\u00falio Reis, CC BY-SA 3.0" },
    { no: "I.2", course: "Course one, the table", name: "Banchan, laid out small", note: "The opposite idea to the stone table: a cloth covered in forty little dishes, each one holding a single taste, with a metal bowl of rice in the middle as the only thing big enough to share.", credit: "Timber Tank, CC BY-SA 2.0" },
    { no: "I.3", course: "Course one, the table", name: "A brass tray of greens", note: "Vegetables only, and served in order of how quickly they will not keep. Sixteen lacquer bowls on a woven tray, with the red pot at the edge of the frame waiting for the broth that follows them.", credit: "Richy, CC BY-SA 2.0" },
    { no: "II.1", course: "Course two, the spread", name: "The Christmas Eve table, full", note: "The whole table given over at once: beans, stews, dried fruit, meat, sweets, all of it on red and white plates with nowhere left for an elbow. This is the cover the service is built around.", credit: "Crnorizec, Public domain" },
    { no: "II.2", course: "Course two, the spread", name: "China on a green wall", note: "Not a meal but the room that keeps it. A lime wall, an open green shelf of blue and white, and a long table under it with a cloth that is doing all the work in the frame.", credit: "Brian Stansberry, CC BY 3.0" },
    { no: "II.3", course: "Course two, the spread", name: "Roast, bread, wine, one candle", note: "A studio still life rather than a table: the roast on a silver platter, a dark loaf already cut, a bottle, a single glass and one taper burning down. Four objects and no room at all.", credit: "Petar Milosevic, CC BY-SA 3.0" },
    { no: "III.1", course: "Course three, the last plate", name: "A copper pan on a hot plate", note: "The last course is served in the pan it was cooked in, straight onto the heat, on a cloth printed with daisies. Nothing about the setting is trying, which is the point of the last course.", credit: "E4024, CC BY-SA 4.0" },
    { no: "III.2", course: "Course three, the last plate", name: "Oranges, a pineapple, two chairs", note: "Fruit, and almost no food. A bowl of oranges and a single pineapple between two empty chairs on a tiled floor, which is the closest this service comes to admitting the meal is nearly over.", credit: "Moyan Brenn, CC BY 2.0" },
    { no: "III.3", course: "Course three, the last plate", name: "The cook, painted, after the meal", note: "The ninth cover is a painting and not a photograph, and that is deliberate. A cook at a kitchen table with dead game, a dog underfoot and copper pots on the wall: the same table, kept for four hundred years instead of for one evening.", credit: "Frans Snyders, Public domain" }
  ];

  var stg = document.getElementById("stage");
  var pl = Array.prototype.slice.call(stg.querySelectorAll(".plate"));
  var ord = Array.prototype.slice.call(document.querySelectorAll(".ord"));
  var house = document.getElementById("house");
  var hr = document.getElementById("houseRange");
  var ho = document.getElementById("houseOut");
  var viewer = document.getElementById("viewer");
  var vImg = document.getElementById("vImg");
  var at = 0;
  var lastFocus = null;

  function courseOf(n) { return Math.floor(n / 3); }

  function paint() {
    var c = courseOf(at);
    for (var k = 0; k < pl.length; k++) {
      pl[k].classList.toggle("is-on", k === at);
      pl[k].classList.toggle("is-off", k !== at);
      pl[k].setAttribute("aria-current", k === at ? "true" : "false");
    }
    for (var j = 0; j < ord.length; j++) ord[j].classList.toggle("is-on", j === c);

    var v = Number(hr.value);
    house.style.opacity = (0.78 - 0.6 * (v / 100)).toFixed(3);
    ho.textContent = v + "%";

    var d = COVERS[at];
    document.getElementById("cNo").textContent = d.no;
    document.getElementById("cCourse").textContent = d.course;
    document.getElementById("cName").textContent = d.name;
    document.getElementById("cNote").textContent = d.note;
    document.getElementById("cCredit").textContent = d.credit;
  }

  function go(n) { at = Math.max(0, Math.min(pl.length - 1, n)); paint(); }

  function fillPlate(n) {
    var d = COVERS[n];
    var img = pl[n].querySelector("img");
    vImg.setAttribute("src", img.getAttribute("src"));
    vImg.setAttribute("alt", img.getAttribute("alt"));
    document.getElementById("vNo").textContent = "COVER " + d.no + " \u00b7 " + (n + 1) + " OF " + pl.length;
    document.getElementById("vName").textContent = d.name;
    document.getElementById("vNote").textContent = d.note;
    document.getElementById("vCredit").textContent = d.credit;
    document.getElementById("vCount").textContent = d.no + " / 9";
  }

  function openAt(n) {
    lastFocus = document.activeElement;
    go(n);
    fillPlate(n);
    viewer.hidden = false;
    document.getElementById("vClose").focus();
  }

  function close() {
    viewer.hidden = true;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  pl.forEach(function (b, i) { b.addEventListener("click", function () { openAt(i); }); });
  ord.forEach(function (b, i) { b.addEventListener("click", function () { go(i * 3); }); });
  hr.addEventListener("input", paint);
  document.getElementById("back").addEventListener("click", function () { go(at - 1); });
  document.getElementById("fwd").addEventListener("click", function () { go(at + 1); });
  document.getElementById("open").addEventListener("click", function () { openAt(at); });
  document.getElementById("vPrev").addEventListener("click", function () { openAt((at - 1 + pl.length) % pl.length); });
  document.getElementById("vNext").addEventListener("click", function () { openAt((at + 1) % pl.length); });
  document.getElementById("vClose").addEventListener("click", close);
  viewer.addEventListener("click", function (e) { if (e.target.hasAttribute("data-close")) close(); });

  stg.addEventListener("keydown", function (e) {
    var k = e.key;
    if (k === "ArrowRight") go(at + 1);
    else if (k === "ArrowLeft") go(at - 1);
    else if (k === "ArrowDown") go(courseOf(at) * 3 + 3 > pl.length - 1 ? pl.length - 1 : courseOf(at) * 3 + 3);
    else if (k === "ArrowUp") go(courseOf(at) * 3);
    else if (k === "Home") go(0);
    else if (k === "End") go(pl.length - 1);
    else if (k === "Enter" || k === " ") { if (e.target !== stg) return; openAt(at); }
    else return;
    e.preventDefault();
  });

  document.addEventListener("keydown", function (e) {
    if (viewer.hidden) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") openAt((at - 1 + pl.length) % pl.length);
    else if (e.key === "ArrowRight") openAt((at + 1) % pl.length);
    else if (e.key === "Home") openAt(0);
    else if (e.key === "End") openAt(pl.length - 1);
    else return;
    e.preventDefault();
  });

  paint();
})();
