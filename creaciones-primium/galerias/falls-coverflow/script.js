(function () {
  "use strict";

  var PLATES = [
    { n: "01", name: "Jonathan’s Run", alt: "Water dropping over a rock ledge in a wooded ravine", by: "Hubert Stoffels", lic: "CC BY 2.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Jonathan%27s_Run_Falls.jpg/960px-Jonathan%27s_Run_Falls.jpg" },
    { n: "02", name: "Russell Falls", alt: "Tall waterfall falling behind eucalyptus in Mt Field National Park", by: "JJ Harrison", lic: "CC BY-SA 3.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Russell_Falls_Mt_Field_National_Park.jpg/960px-Russell_Falls_Mt_Field_National_Park.jpg" },
    { n: "03", name: "Snug Falls", alt: "A short cascade spilling over dark rock into a tannin pool", by: "JJ Harrison", lic: "CC BY-SA 3.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Snug_Falls_2.jpg/960px-Snug_Falls_2.jpg" },
    { n: "04", name: "Yosemite Falls", alt: "Yosemite Falls seen from a forest trail with mist in the gorge", by: "Diliff", lic: "CC BY-SA 3.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Yosemite_Falls_from_trail%2C_Yosemite_NP%2C_CA%2C_US_-_Diliff.jpg/960px-Yosemite_Falls_from_trail%2C_Yosemite_NP%2C_CA%2C_US_-_Diliff.jpg" },
    { n: "05", name: "Selfoss", alt: "Broad curtain of water breaking over a rocky riverbed", by: "Martin Falbisoner", lic: "CC BY-SA 4.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Selfoss_July_2014.JPG/960px-Selfoss_July_2014.JPG" },
    { n: "06", name: "Gullfoss", alt: "Two-tier waterfall dropping into a deep canyon in southern Iceland", by: "Diego Delso", lic: "CC BY-SA 4.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Gullfoss%2C_Su%C3%B0urland%2C_Islandia%2C_2014-08-16%2C_DD_119.JPG/960px-Gullfoss%2C_Su%C3%B0urland%2C_Islandia%2C_2014-08-16%2C_DD_119.JPG" },
    { n: "07", name: "Phu Sang", alt: "White water threading a forested gorge in northern Thailand", by: "Khunkay", lic: "CC BY-SA 3.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Phu_Sang_Waterfall_01.jpg/960px-Phu_Sang_Waterfall_01.jpg" },
    { n: "08", name: "Mealt Falls", alt: "Waterfall falling below the basalt cliffs of Kilt Rock, Skye", by: "Colin", lic: "CC BY-SA 4.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Mealt_Waterfall_with_Kilt_Rock%2C_Isle_of_Skye.jpg/960px-Mealt_Waterfall_with_Kilt_Rock%2C_Isle_of_Skye.jpg" }
  ];

  var stage = document.getElementById("stage");
  var stack = document.getElementById("stack");
  var sweep = document.getElementById("sweep");
  var slot = document.getElementById("slot");
  var leftBtn = document.getElementById("left");
  var rightBtn = document.getElementById("right");
  var openBtn = document.getElementById("open");

  var viewer = document.getElementById("viewer");
  var vImg = document.getElementById("vimg");
  var vCap = document.getElementById("vcap");
  var vCount = document.getElementById("vcount");
  var vClose = document.getElementById("vclose");
  var vPrev = document.getElementById("vprev");
  var vNext = document.getElementById("vnext");

  var still = window.matchMedia("(prefers-reduced-motion: reduce)");

  var cards = PLATES.map(function (p, i) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "card";
    b.dataset.index = String(i);
    var shot = document.createElement("span");
    shot.className = "card__shot";
    var img = document.createElement("img");
    img.src = p.src;
    img.alt = p.alt;
    img.loading = "lazy";
    img.decoding = "async";
    var id = document.createElement("span");
    id.className = "card__id";
    id.textContent = p.n;
    var cap = document.createElement("span");
    cap.className = "card__cap";
    var strong = document.createElement("b");
    strong.textContent = p.name;
    cap.appendChild(strong);
    cap.appendChild(document.createTextNode(p.by + " \u00b7 " + p.lic));
    shot.appendChild(img);
    shot.appendChild(id);
    shot.appendChild(cap);
    var mirror = document.createElement("span");
    mirror.className = "card__mirror";
    var mimg = document.createElement("img");
    mimg.src = p.src;
    mimg.alt = p.alt;
    mimg.loading = "lazy";
    mimg.decoding = "async";
    mirror.appendChild(mimg);
    b.appendChild(shot);
    b.appendChild(mirror);
    stack.appendChild(b);
    return b;
  });

  var here = 3;
  var drag = false;
  var dragX = 0;
  var dragFrom = 0;
  var start = 0;

  function clamp(v, a, b) {
    return v < a ? a : v > b ? b : v;
  }

  function layout() {
    var w = stack.clientWidth;
    var unit = Math.max(58, Math.min(w / 3.1, 178));
    for (var i = 0; i < cards.length; i++) {
      var d = i - here;
      var ad = Math.abs(d);
      var s = d === 0;
      var x = d * unit * 1.02;
      var z = -ad * 132;
      var ry = d === 0 ? 0 : (d > 0 ? -1 : 1) * (58 - Math.min(34, ad * 9));
      var sc = clamp(1 - ad * 0.09, 0.58, 1);
      cards[i].style.transform = "translate3d(" + x.toFixed(1) + "px,0," + z.toFixed(1) + "px) rotateY(" + ry.toFixed(1) + "deg) scale(" + sc.toFixed(3) + ")";
      cards[i].style.opacity = clamp(1 - ad * 0.15, 0.16, 1).toFixed(3);
      cards[i].style.zIndex = String(100 - ad * 10);
      cards[i].classList.toggle("is-front", s);
      cards[i].setAttribute("aria-current", s ? "true" : "false");
    }
  }

  function tell() {
    var p = PLATES[here];
    slot.textContent = "Plate " + p.n + " of 0" + PLATES.length + " \u00b7 " + p.name;
    leftBtn.disabled = here === 0;
    rightBtn.disabled = here === PLATES.length - 1;
  }

  function move(d) {
    var next = clamp(here + d, 0, PLATES.length - 1);
    if (next === here) {
      return;
    }
    here = next;
    layout();
    tell();
  }

  function loop(now) {
    if (!start) {
      start = now;
    }
    if (!still.matches) {
      var t = ((now - start) % 12000) / 12000;
      var x = -sweep.offsetWidth + t * (stage.clientWidth + sweep.offsetWidth);
      sweep.style.transform = "translate3d(" + x.toFixed(1) + "px,0,0)";
    }
    requestAnimationFrame(loop);
  }

  stage.addEventListener("pointerdown", function (e) {
    if (e.target.closest(".card")) {
      return;
    }
    drag = true;
    dragX = e.clientX;
    dragFrom = here;
    stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener("pointermove", function (e) {
    if (!drag) {
      return;
    }
    var d = Math.round((dragX - e.clientX) / 110);
    var next = clamp(dragFrom + d, 0, PLATES.length - 1);
    if (next !== here) {
      here = next;
      layout();
      tell();
    }
  });
  ["pointerup", "pointercancel"].forEach(function (t) {
    stage.addEventListener(t, function () {
      drag = false;
    });
  });

  stage.addEventListener("keydown", function (e) {
    var k = e.key;
    if (k === "ArrowRight" || k === "ArrowDown") {
      move(1);
      e.preventDefault();
    } else if (k === "ArrowLeft" || k === "ArrowUp") {
      move(-1);
      e.preventDefault();
    } else if (k === "Home") {
      here = 0;
      layout();
      tell();
      e.preventDefault();
    } else if (k === "End") {
      here = PLATES.length - 1;
      layout();
      tell();
      e.preventDefault();
    }
  });

  leftBtn.addEventListener("click", function () {
    move(-1);
  });
  rightBtn.addEventListener("click", function () {
    move(1);
  });
  openBtn.addEventListener("click", function () {
    openViewer(here);
  });

  stack.addEventListener("click", function (e) {
    var b = e.target.closest(".card");
    if (!b) {
      return;
    }
    var i = Number(b.dataset.index);
    if (i !== here) {
      here = i;
      layout();
      tell();
    }
    openViewer(i);
  });

  var opened = -1;
  var restore = null;

  function openViewer(i) {
    opened = (i + PLATES.length) % PLATES.length;
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
    if (restore?.focus) {
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

  window.addEventListener("resize", function () {
    layout();
  });

  layout();
  tell();
  if (!still.matches) {
    requestAnimationFrame(loop);
  }
})();
