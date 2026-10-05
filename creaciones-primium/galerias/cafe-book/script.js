(function () {
  var plates = [
    { name: "At the Cafe", note: "A painted room full of people who have all come for the same reason. The waiter is the only figure drawn in full and he is the only one who is working.", frame: "960 px wide", crop: "3 : 2, upper half", credit: "Edouard Manet, public domain" },
    { name: "Carnation Cafe interior", note: "Six lamps of stained glass over a room working hard to be a street from a hundred years ago. The mezzanine is new and nobody sits on it.", frame: "960 px wide", crop: "3 : 2, centre", credit: "Patrick Pelletier, CC BY-SA 4.0" },
    { name: "Delta Cafe shelf", note: "No room in the picture, only the shelf that decides what the room feels like. Every candle is lit and none of them is for reading.", frame: "960 px wide", crop: "3 : 2, upper half", credit: "Another Believer, CC BY-SA 3.0" },
    { name: "Cafe Muji, Shinjuku", note: "One room, one chandelier, and enough length that the far end of it is a different lighting condition from the near end.", frame: "960 px wide", crop: "3 : 2, centre left", credit: "Wpcpey, CC BY-SA 4.0" },
    { name: "Interior design", note: "The light arrives as five straight lines on the ceiling and nothing bounces off anything. The room is comfortable in a way that has nothing to do with comfort.", frame: "960 px wide", crop: "3 : 2, upper half", credit: "Team1id, CC BY-SA 4.0" },
    { name: "Village cafe", note: "Bentwood, lace and a line of small framed pictures. Everything in the room was chosen to look as if it had always been there.", frame: "960 px wide", crop: "3 : 2, centre", credit: "Bob Harvey, CC BY-SA 2.0" },
    { name: "Tiffany and Co, Miami", note: "A cafe that is also a shop, so the counter is glass and the seating is on the wrong side of it. The gold is everywhere and never once is the subject.", frame: "960 px wide", crop: "3 : 2, centre right", credit: "Phillip Pessar, CC BY 2.0" },
    { name: "Cafe Gerbeaud", note: "Two chandeliers, a corridor of velvet and a mirrored ceiling. The room was built to make a cake look like the reason you came.", frame: "960 px wide", crop: "3 : 2, upper half", credit: "Elekes Andor, CC BY-SA 4.0" }
  ];

  var LEAVES = 10;
  var album = document.getElementById("album");
  var leaves = Array.prototype.slice.call(document.querySelectorAll(".leaf"));
  var versos = Array.prototype.slice.call(document.querySelectorAll(".v"));
  var index = Array.prototype.slice.call(document.querySelectorAll(".index__list button"));
  var pileNote = document.getElementById("pileNote");
  var rail = document.getElementById("rail");
  var peel = document.getElementById("peel");
  var peelOut = document.getElementById("peel-out");
  var viewer = document.getElementById("viewer");
  var vImg = document.getElementById("v-img");
  var at = 1;
  var lastFocus = null;

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function nameOf(n) { return n >= 1 && n <= 8 ? plates[n - 1] : null; }

  var railBtns = [];
  for (var i = 0; i < LEAVES; i++) {
    var b = document.createElement("button");
    b.type = "button";
    b.textContent = i === 0 ? "cover" : i === LEAVES - 1 ? "colophon" : pad(i + 1);
    b.setAttribute("aria-label", "Go to " + (i === 0 ? "the cover" : i === LEAVES - 1 ? "the colophon" : "leaf " + (i + 1)));
    b.addEventListener("click", (function (n) { return function () { go(n); }; })(i));
    rail.appendChild(b);
    railBtns.push(b);
  }
  index.forEach(function (btn) {
    btn.addEventListener("click", function () { go(Number(btn.dataset.leaf)); });
  });

  function paint() {
    for (var i = 0; i < LEAVES; i++) {
      var turned = i < at;
      leaves[i].style.transform = turned ? "rotateY(-180deg)" : "rotateY(0deg)";
      leaves[i].style.zIndex = String(20 - i);
    }
    for (var v = 0; v < versos.length; v++) {
      versos[v].classList.toggle("is-read", v < at);
      versos[v].style.transform = "translate3d(" + (-(at - v) * 1.6).toFixed(1) + "px," + ((at - v) * 1.4).toFixed(1) + "px,0)";
    }
    pileNote.classList.toggle("is-out", at > 0);
    pileNote.textContent = at === 0 ? "Nothing read yet" : String(at) + (at === 1 ? " leaf read" : " leaves read");

    index.forEach(function (btn) {
      btn.setAttribute("aria-current", Number(btn.dataset.leaf) === at ? "true" : "false");
    });
    railBtns.forEach(function (btn, n) { btn.setAttribute("aria-current", n === at ? "true" : "false"); });

    var p = nameOf(at);
    if (p) {
      document.getElementById("aNo").textContent = "Plate " + pad(at) + " of 08";
      document.getElementById("aName").textContent = p.name;
      document.getElementById("aNote").textContent = p.note;
      document.getElementById("aFrame").textContent = p.frame;
      document.getElementById("aCrop").textContent = p.crop;
      document.getElementById("aCredit").textContent = p.credit;
    } else {
      document.getElementById("aNo").textContent = at === 0 ? "Cover" : "Colophon";
      document.getElementById("aName").textContent = at === 0 ? "Cafe Book" : "Eight rooms, one spiral";
      document.getElementById("aNote").textContent = at === 0
        ? "Eight photographs of cafe interiors, one to a leaf, bound on a spiral. Nothing in the book is a photograph of a menu."
        : "The photographs come from Wikimedia Commons under Creative Commons and public domain terms. Every author and every licence is printed on the leaf that carries the picture.";
      document.getElementById("aFrame").textContent = "no plate";
      document.getElementById("aCrop").textContent = "text leaf";
      document.getElementById("aCredit").textContent = "Wikimedia Commons contributors";
    }
    document.getElementById("aLeaf").textContent = pad(at + 1) + " of " + pad(LEAVES);
    document.getElementById("aFolio").textContent = String(at + 1);
  }

  function go(n) {
    at = Math.max(0, Math.min(LEAVES - 1, n));
    peel.value = "0";
    peelOut.textContent = "0%";
    paint();
  }

  function scrub(v) {
    var n = Math.max(0, Math.min(100, v));
    peel.value = String(n);
    peelOut.textContent = n + "%";
    album.classList.add("is-scrubbing");
    leaves[at].style.transform = "rotateY(" + (-1.8 * n).toFixed(2) + "deg)";
    if (n >= 100 && at < LEAVES - 1) {
      album.classList.remove("is-scrubbing");
      at++;
      peel.value = "0";
      peelOut.textContent = "0%";
      paint();
    }
  }

  peel.addEventListener("input", function () { scrub(Number(peel.value)); });
  peel.addEventListener("change", function () { album.classList.remove("is-scrubbing"); });
  peel.addEventListener("blur", function () { album.classList.remove("is-scrubbing"); });

  function fill(n) {
    var p = plates[n - 1];
    var img = leaves[n].querySelector(".page__photo img");
    vImg.setAttribute("src", img.getAttribute("src"));
    vImg.setAttribute("alt", img.getAttribute("alt"));
    document.getElementById("v-no").textContent = "Plate " + pad(n) + " of 08";
    document.getElementById("v-name").textContent = p.name;
    document.getElementById("v-note").textContent = p.note;
    document.getElementById("v-credit").textContent = p.credit;
    document.getElementById("v-count").textContent = pad(n) + " / 08";
  }

  function openAt(n) {
    lastFocus = document.activeElement;
    go(n);
    fill(n);
    viewer.hidden = false;
    document.getElementById("v-close").focus();
  }

  function close() {
    viewer.hidden = true;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.getElementById("back").addEventListener("click", function () { go(at - 1); });
  document.getElementById("fwd").addEventListener("click", function () {
    if (at < LEAVES - 1) { scrub(100); }
  });
  document.getElementById("open").addEventListener("click", function () { if (nameOf(at)) openAt(at); });
  document.getElementById("v-prev").addEventListener("click", function () { openAt(at > 1 ? at - 1 : 8); });
  document.getElementById("v-next").addEventListener("click", function () { openAt(at < 8 ? at + 1 : 1); });
  document.getElementById("v-close").addEventListener("click", close);
  viewer.addEventListener("click", function (e) { if ("close" in e.target.dataset) close(); });

  album.addEventListener("keydown", function (e) {
    var k = e.key;
    if (k === "ArrowRight" || k === "PageDown") { if (at < LEAVES - 1) scrub(100); else return; }
    else if (k === "ArrowLeft" || k === "PageUp") go(at - 1);
    else if (k === "Home") go(0);
    else if (k === "End") go(LEAVES - 1);
    else if (k === "Enter" || k === " ") { if (nameOf(at)) openAt(at); else return; }
    else return;
    e.preventDefault();
  });

  document.addEventListener("keydown", function (e) {
    if (viewer.hidden) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") openAt(at > 1 ? at - 1 : 8);
    else if (e.key === "ArrowRight") openAt(at < 8 ? at + 1 : 1);
    else if (e.key === "Home") openAt(1);
    else if (e.key === "End") openAt(8);
    else return;
    e.preventDefault();
  });

  paint();
})();
