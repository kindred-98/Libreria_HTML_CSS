(function () {
  "use strict";

  var calm = window.matchMedia("(prefers-reduced-motion: reduce)");
  var DECK = [
    { t: "Mount Lushan, in cloud", a: "pfctdayelise", l: "CC BY-SA 2.5", p: "https://commons.wikimedia.org/wiki/File:Mount_Lushan_-_fog.JPG",
      n: "The ridge is there and you can see the trees on it. Everything above the tree line has simply been left out of the picture." },
    { t: "Tule fog, California", a: "Jeff Schmaltz; NASA", l: "Public domain", p: "https://commons.wikimedia.org/wiki/File:Tule_Fog_California_-_2005.jpg",
      n: "A photograph that took eleven days to make: the camera sat on the same spot each morning and waited for the bank to arrive." },
    { t: "Blassenstein valley", a: "Uoaei1", l: "CC BY-SA 3.0", p: "https://commons.wikimedia.org/wiki/File:Blassenstein_Erlauftal_mit_Nebel_02_Panorama.JPG",
      n: "A panorama, and the only plate here that is wider than it is tall. The fog lies in the folds rather than over them." },
    { t: "Cliff in cloud", a: "Pixel.la Free Stock Photos", l: "CC0", p: "https://commons.wikimedia.org/wiki/File:Mountains-clouds-fog-cliff_%2823698718314%29.jpg",
      n: "One wall of rock and nothing behind it. Without the fog this would be a flat, unremarkable cliff." },
    { t: "Peak half hidden", a: "Sławek K", l: "CC0", p: "https://commons.wikimedia.org/wiki/File:Fog-shrouded_mountain_peak_%28Unsplash%29.jpg",
      n: "The summit is exactly where you would guess it would be, and you still cannot see a metre of it." },
    { t: "Badaia in mist", a: "Basotxerri", l: "CC BY-SA 4.0", p: "https://commons.wikimedia.org/wiki/File:Badaia_-_Vistas_con_niebla_-BT-_01.jpg",
      n: "A bare tree holds the near ground and the hills behind it keep dissolving one layer at a time." },
    { t: "Mountain wall at dawn", a: "Viet Anh", l: "CC BY-SA 4.0", p: "https://commons.wikimedia.org/wiki/File:Fog_on_mountain_LD_VN.jpg",
      n: "A single band of fog crossing a whole mountain, as if it had been drawn on with a brush and then left to dry." },
    { t: "The same crest, erased", a: "Viet Anh", l: "CC BY-SA 4.0", p: "https://commons.wikimedia.org/wiki/File:Fog_on_mountain_LD_VN_2.jpg",
      n: "The second frame from the same walk, and the one that proves the fog was moving and the rock was not." },
    { t: "Stream to a lone tree", a: "Basile Morin", l: "CC BY-SA 4.0", p: "https://commons.wikimedia.org/wiki/File:Front_view_of_a_stream_with_a_tree_as_vanishing_point%2C_mountains_and_mist_in_the_countryside_of_Vang_Vieng.jpg",
      n: "The last plate turns the camera round: a stream, a tree, and everything else taken away by the weather." }
  ];

  var N = DECK.length;
  var deck = document.getElementById("deck");
  var spread = document.getElementById("spread");
  var imgs = Array.prototype.slice.call(document.querySelectorAll(".shot__img"));
  var frames = Array.prototype.slice.call(document.querySelectorAll(".shot__fr"));
  var fog = document.getElementById("fog");
  var mark = document.getElementById("mark");
  var sideNo = document.getElementById("sideNo");
  var sideT = document.getElementById("sideT");
  var sideNote = document.getElementById("sideNote");
  var sideA = document.getElementById("sideA");
  var sideL = document.getElementById("sideL");
  var sideP = document.getElementById("sideP");
  var tally = document.getElementById("tally");
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".index button"));
  var grain = document.querySelector(".grain");
  var vignette = document.querySelector(".vignette");

  var lb = document.getElementById("lb");
  var lbImg = document.getElementById("lbImg");
  var lbNo = document.getElementById("lbNo");
  var lbT = document.getElementById("lbT");
  var lbA = document.getElementById("lbA");
  var lbP = document.getElementById("lbP");
  var lbX = document.getElementById("lbX");

  var at = 0;
  var opener = null;
  var fogTimer = 0;
  var t0 = 0;
  var raf = 0;

  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  function show(n, animate) {
    at = (n + N) % N;
    var row = DECK[at];

    imgs.forEach(function (img, i) { img.classList.toggle("is-on", i === at); });
    frames.forEach(function (fr, i) { fr.classList.toggle("is-on", i === at); });
    mark.textContent = pad(at + 1);
    sideNo.textContent = pad(at + 1);
    sideT.textContent = row.t;
    sideNote.textContent = row.n;
    sideA.textContent = row.a;
    sideL.textContent = row.l;
    sideP.setAttribute("href", row.p);
    spread.classList.toggle("is-flipped", at % 2 === 1);
    tally.textContent = "plate " + pad(at + 1) + " of " + pad(N);
    tabs.forEach(function (tab, i) { tab.classList.toggle("is-on", i === at); });

    if (animate === false) { return; }
    fog.classList.remove("is-passing");
    void fog.offsetWidth;
    fog.classList.add("is-passing");
    window.clearTimeout(fogTimer);
    fogTimer = window.setTimeout(function () { fog.classList.remove("is-passing"); }, 1400);
  }

  function open(from) {
    var row = DECK[at];
    var img = imgs[at];
    opener = from || null;
    lbImg.setAttribute("src", img.getAttribute("src"));
    lbImg.setAttribute("alt", img.getAttribute("alt"));
    lbNo.textContent = pad(at + 1) + " / " + pad(N);
    lbT.textContent = row.t;
    lbA.textContent = row.a + " \u00b7 " + row.l;
    lbP.setAttribute("href", row.p);
    lb.hidden = false;
    requestAnimationFrame(function () { lb.classList.add("is-open"); });
    lbX.focus();
  }

  function close() {
    lb.classList.remove("is-open");
    var seal = function () { lb.hidden = true; };
    if (calm.matches) { seal(); } else { setTimeout(seal, 280); }
    if (opener && document.contains(opener)) { opener.focus(); }
    opener = null;
  }

  function ring() {
    return Array.prototype.slice.call(
      lb.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])')
    ).filter(function (el) { return el.offsetParent !== null; });
  }

  document.getElementById("prev").addEventListener("click", function () { show(at - 1); });
  document.getElementById("next").addEventListener("click", function () { show(at + 1); });
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () { show(Number(tab.dataset.i)); });
  });

  document.getElementById("lbPrev").addEventListener("click", function () { show(at - 1); open(null); });
  document.getElementById("lbNext").addEventListener("click", function () { show(at + 1); open(null); });
  lbX.addEventListener("click", close);
  lb.querySelector(".lb__veil").addEventListener("click", close);

  document.addEventListener("keydown", function (ev) {
    if (!lb.hidden) {
      if (ev.key === "Escape") { ev.preventDefault(); close(); return; }
      if (ev.key === "Tab") {
        var box = ring();
        if (!box.length) { return; }
        var pos = box.indexOf(document.activeElement);
        var nxt = ev.shiftKey ? pos - 1 : pos + 1;
        if (nxt < 0 || nxt >= box.length) {
          ev.preventDefault();
          box[(nxt + box.length) % box.length].focus();
        }
        return;
      }
      if (ev.key === "ArrowRight") { ev.preventDefault(); show(at + 1); open(null); }
      else if (ev.key === "ArrowLeft") { ev.preventDefault(); show(at - 1); open(null); }
      else if (ev.key === "Home") { ev.preventDefault(); show(0); open(null); }
      else if (ev.key === "End") { ev.preventDefault(); show(N - 1); open(null); }
      return;
    }

    var here = document.activeElement;
    if (here === deck || here === spread || here.closest(".side")) {
      if (ev.key === "ArrowRight" || ev.key === "PageDown") { ev.preventDefault(); show(at + 1); }
      else if (ev.key === "ArrowLeft" || ev.key === "PageUp") { ev.preventDefault(); show(at - 1); }
      else if (ev.key === "Home") { ev.preventDefault(); show(0); }
      else if (ev.key === "End") { ev.preventDefault(); show(N - 1); }
      else if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); open(here === deck ? null : here); }
      return;
    }

    var ti = tabs.indexOf(here);
    if (ti >= 0) {
      if (ev.key === "ArrowRight" || ev.key === "ArrowDown") { ev.preventDefault(); tabs[Math.min(ti + 1, N - 1)].focus(); }
      else if (ev.key === "ArrowLeft" || ev.key === "ArrowUp") { ev.preventDefault(); tabs[Math.max(ti - 1, 0)].focus(); }
      else if (ev.key === "Home") { ev.preventDefault(); tabs[0].focus(); }
      else if (ev.key === "End") { ev.preventDefault(); tabs[N - 1].focus(); }
    }
  });

  function drift(now) {
    raf = requestAnimationFrame(drift);
    if (!t0) { t0 = now; }
    var s = (now - t0) / 1000;
    grain.style.transform = "translate3d(" + (Math.sin(s * 0.09) * 1.1).toFixed(2) + "%," + (Math.cos(s * 0.071) * 0.9).toFixed(2) + "%,0)";
    vignette.style.transform = "scale(" + (1 + Math.sin(s * 0.13) * 0.006).toFixed(4) + ")";
  }

  show(0, false);
  if (calm.matches) {
    grain.style.transform = "translate3d(0,0,0)";
    vignette.style.transform = "scale(1)";
  } else {
    raf = requestAnimationFrame(drift);
    window.addEventListener("pagehide", function () { cancelAnimationFrame(raf); });
  }
}());
