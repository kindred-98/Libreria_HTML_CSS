(function () {
  "use strict";

  var calm = window.matchMedia("(prefers-reduced-motion: reduce)");
  var bays = Array.prototype.slice.call(document.querySelectorAll(".bay"));
  var links = Array.prototype.slice.call(document.querySelectorAll(".crest__link"));
  var more = Array.prototype.slice.call(document.querySelectorAll(".bay__more"));
  var gold = document.getElementById("gold");
  var coal = document.getElementById("coal");
  var tape = document.getElementById("tape");
  var seen = {};

  var PLATES = [
    { t: "The slice", a: "Mrnotwo", l: "public domain", p: "https://commons.wikimedia.org/wiki/File:Kiev_cake_slice.JPG", n: "Section 01" },
    { t: "Cassava, glazed", a: "Fahad Faisal", l: "CC BY-SA 4.0", p: "https://commons.wikimedia.org/wiki/File:Cassava_cake_Filipino_Dessert.jpg", n: "Section 02" },
    { t: "Whole, tiered", a: "Leon Brooks", l: "public domain", p: "https://commons.wikimedia.org/wiki/File:Wedding_cake_dessert.jpg", n: "Section 03" },
    { t: "Charlotte", a: "Popo le Chien", l: "CC BY-SA 3.0", p: "https://commons.wikimedia.org/wiki/File:Charlotte_aux_poires_et_chocolat.jpg", n: "Section 04" },
    { t: "Iced cupcakes", a: "Connie Ma", l: "CC BY-SA 2.0", p: "https://commons.wikimedia.org/wiki/File:Applesauce_cupcakes_with_icing.jpg", n: "Section 05" },
    { t: "St Honore", a: "Trougnouf", l: "CC BY 4.0", p: "https://commons.wikimedia.org/wiki/File:St._Honor%C3%A9_cake_with_chocolate_(DSCF4539).jpg", n: "Section 06" },
    { t: "Plated with pear", a: "Prayitno", l: "CC BY 2.0", p: "https://commons.wikimedia.org/wiki/File:Cake_and_pear_dessert_with_raspberries.jpg", n: "Section 07" }
  ];

  if ("IntersectionObserver" in window) {
    var watch = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        var bay = entry.target;
        if (!seen[bay.id]) {
          seen[bay.id] = true;
          bay.classList.add("is-open");
        }
      });
    }, { threshold: 0.25 });
    bays.forEach(function (bay) { watch.observe(bay); });
  } else {
    bays.forEach(function (bay) { bay.classList.add("is-open"); });
  }

  var loupe = document.getElementById("loupe");
  var lImg = document.getElementById("loupeImg");
  var lNo = document.getElementById("loupeNo");
  var lT = document.getElementById("loupeTitle");
  var lA = document.getElementById("loupeA");
  var lLink = document.getElementById("loupeLink");
  var lClose = document.getElementById("loupeClose");
  var opener = null;
  var at = 0;

  function load(n) {
    var k = (n + PLATES.length) % PLATES.length;
    var bay = bays[k];
    var img = bay.querySelector(".bay__img");
    var plate = PLATES[k];
    lImg.setAttribute("src", img.getAttribute("src"));
    lImg.setAttribute("alt", img.getAttribute("alt"));
    lNo.textContent = plate.n + " of 07";
    lT.textContent = plate.t;
    lA.textContent = plate.a + " \u00b7 " + plate.l;
    lLink.setAttribute("href", plate.p);
    return k;
  }

  function openLoupe(n, from) {
    opener = from;
    at = load(n);
    loupe.hidden = false;
    requestAnimationFrame(function () { loupe.classList.add("is-open"); });
    lClose.focus();
  }

  function shut() {
    loupe.classList.remove("is-open");
    var seal = function () { loupe.hidden = true; };
    if (calm.matches) { seal(); } else { setTimeout(seal, 280); }
    if (opener) { opener.focus(); opener = null; }
  }

  function ring() {
    return Array.prototype.slice.call(
      loupe.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])')
    ).filter(function (node) { return node.offsetParent !== null; });
  }

  more.forEach(function (btn) {
    btn.addEventListener("click", function () { openLoupe(Number(btn.dataset.target) - 1, btn); });
  });

  links.forEach(function (link) {
    link.addEventListener("click", function () {
      var id = link.getAttribute("href").slice(1);
      var bay = document.getElementById(id);
      if (bay) { seen[id] = true; bay.classList.add("is-open"); }
    });
  });

  document.getElementById("loupePrev").addEventListener("click", function () { at = load(at - 1); });
  document.getElementById("loupeNext").addEventListener("click", function () { at = load(at + 1); });
  lClose.addEventListener("click", shut);
  loupe.querySelector(".loupe__scrim").addEventListener("click", shut);

  document.addEventListener("keydown", function (ev) {
    if (loupe.hidden) { return; }
    if (ev.key === "Escape") { ev.preventDefault(); shut(); }
    else if (ev.key === "ArrowRight" || ev.key === "ArrowDown") { ev.preventDefault(); at = load(at + 1); }
    else if (ev.key === "ArrowLeft" || ev.key === "ArrowUp") { ev.preventDefault(); at = load(at - 1); }
    else if (ev.key === "Home") { ev.preventDefault(); at = load(0); }
    else if (ev.key === "End") { ev.preventDefault(); at = load(PLATES.length - 1); }
    else if (ev.key === "Tab") {
      var list = ring();
      if (!list.length) { return; }
      var pos = list.indexOf(document.activeElement);
      var next = ev.shiftKey ? pos - 1 : pos + 1;
      if (next < 0 || next >= list.length) {
        ev.preventDefault();
        list[(next + list.length) % list.length].focus();
      }
    }
  });

  function bake(now) {
    var s = now / 1000;
    var gx = 50 + Math.sin(s * 0.09) * 16;
    var gy = 18 + Math.cos(s * 0.07) * 10;
    gold.style.transform = "translate3d(" + (gx - 50).toFixed(2) + "%," + (gy - 50).toFixed(2) + "%,0)";
    var cx = 46 + Math.cos(s * 0.06) * 18;
    var cy = 72 + Math.sin(s * 0.05) * 12;
    coal.style.transform = "translate3d(" + (cx - 50).toFixed(2) + "%," + (cy - 50).toFixed(2) + "%,0)";
    tape.style.transform = "translate3d(" + ((s * 5) % 100 - 50).toFixed(2) + "%,0,0)";
    requestAnimationFrame(bake);
  }

  if (calm.matches) {
    gold.style.transform = "translate3d(0,0,0)";
    coal.style.transform = "translate3d(0,0,0)";
    tape.style.transform = "translate3d(0,0,0)";
  } else {
    requestAnimationFrame(bake);
  }
}());
