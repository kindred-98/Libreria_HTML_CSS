(function () {
  "use strict";

  var PLATES = [
    { n: "01", name: "Eielson Air Force Base", alt: "Aurora borealis arching over a snow covered air base in Alaska", by: "US Air Force", lic: "public domain", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Aurora_borealis_over_Eielson_Air_Force_Base%2C_Alaska.jpg/960px-Aurora_borealis_over_Eielson_Air_Force_Base%2C_Alaska.jpg" },
    { n: "02", name: "Aurora over northern Norway", alt: "A green aurora band cutting across a dark Norwegian sky", by: "Rafal Konieczny", lic: "CC BY 2.5", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Aurora_Borealis_NO.JPG/960px-Aurora_Borealis_NO.JPG" },
    { n: "03", name: "Lyngenfjorden, March 2012", alt: "Aurora borealis above the fjord at Lyngen in March", by: "Ximonic", lic: "CC BY-SA 3.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Aurora_borealis_above_Lyngenfjorden%2C_2012_March.jpg/960px-Aurora_borealis_above_Lyngenfjorden%2C_2012_March.jpg" },
    { n: "04", name: "Aurora australis over an igloo", alt: "Aurora australis dancing above a glowing igloo", by: "Ross Burgener", lic: "public domain", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Aurora_australis_dancing_over_an_LED_illuminated_igloo.jpg/960px-Aurora_australis_dancing_over_an_LED_illuminated_igloo.jpg" },
    { n: "05", name: "Curtain over the pines", alt: "An aurora curtain folding over a line of pine trees", by: "Kristian Pikner", lic: "CC BY-SA 4.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Virmalised_18.03.15_%282%29.jpg/960px-Virmalised_18.03.15_%282%29.jpg" },
    { n: "06", name: "Second curtain, same night", alt: "A second aurora curtain photographed on the same polar night", by: "Kristian Pikner", lic: "CC BY-SA 4.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Virmalised_18.03.15_%284%29.jpg/960px-Virmalised_18.03.15_%284%29.jpg" },
    { n: "07", name: "Tasman Sea", alt: "Aurora australis over the Tasman Sea seen from a national park", by: "Jamen Percy", lic: "CC BY-SA 4.0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Aurora_Australis_Over_the_Tasman_Sea_from_SouthWest_National_Park.jpg/960px-Aurora_Australis_Over_the_Tasman_Sea_from_SouthWest_National_Park.jpg" },
    { n: "08", name: "Lofoten in winter", alt: "Winter light over the harbour and peaks of Lofoten, Norway", by: "Johannes Groll", lic: "CC0", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Lofoten%2C_Norway_%28Unsplash%29.jpg/960px-Lofoten%2C_Norway_%28Unsplash%29.jpg" },
    { n: "09", name: "Amundsen-Scott station", alt: "Aurora rays standing over the Amundsen-Scott station at the South Pole", by: "Chris Danals", lic: "public domain", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Amundsen-Scott_marsstation_ray_h_edit.jpg/960px-Amundsen-Scott_marsstation_ray_h_edit.jpg" }
  ];

  var fan = document.getElementById("fan");
  var read = document.getElementById("read");
  var toggle = document.getElementById("toggle");
  var lift = document.getElementById("lift");

  var viewer = document.getElementById("viewer");
  var vImg = document.getElementById("vimg");
  var vCap = document.getElementById("vcap");
  var vCount = document.getElementById("vcount");
  var vClose = document.getElementById("vclose");
  var vPrev = document.getElementById("vprev");
  var vNext = document.getElementById("vnext");

  var still = window.matchMedia("(prefers-reduced-motion: reduce)");
  var N = PLATES.length;
  var mid = (N - 1) / 2;

  var cards = PLATES.map(function (p, i) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "card";
    b.dataset.index = String(i);
    var d = i - mid;
    b.style.setProperty("--i", String(i));
    b.style.setProperty("--d", String(d));
    b.style.setProperty("--dy", String(Math.abs(d)));
    var shot = document.createElement("span");
    shot.className = "card__shot";
    var img = document.createElement("img");
    img.src = p.src;
    img.alt = p.alt;
    img.loading = "lazy";
    img.decoding = "async";
    var tab = document.createElement("span");
    tab.className = "card__tab";
    tab.textContent = p.n;
    shot.appendChild(img);
    shot.appendChild(tab);
    var pivot = document.createElement("span");
    pivot.className = "card__pivot";
    b.appendChild(shot);
    b.appendChild(pivot);
    fan.appendChild(b);
    return b;
  });

  var open = true;
  var held = 0;

  function measure() {
    var w = fan.clientWidth;
    var u = Math.max(20, Math.min(76, (w * 0.84) / (N - 1)));
    fan.style.setProperty("--u", u.toFixed(1) + "px");
    fan.style.setProperty("--rot", Math.max(2.4, Math.min(7, u * 0.095)).toFixed(2) + "deg");
    fan.style.setProperty("--bow", Math.max(6, Math.min(15, u * 0.2)).toFixed(1) + "px");
    fan.style.setProperty("--depth", Math.max(10, Math.min(24, u * 0.3)).toFixed(1) + "px");
  }

  function paint() {
    fan.classList.toggle("is-open", open);
    fan.classList.toggle("is-shut", !open);
    toggle.textContent = open ? "Close the fan" : "Open the fan";
    toggle.setAttribute("aria-pressed", String(open));
    cards.forEach(function (c, i) {
      c.classList.toggle("is-lifted", i === held);
    });
    var p = PLATES[held];
    read.textContent = "Plate " + p.n + " \u00b7 " + p.name;
  }

  function hold(i) {
    held = ((i % N) + N) % N;
    paint();
  }

  fan.addEventListener("keydown", function (e) {
    var k = e.key;
    if (k === "ArrowRight" || k === "ArrowDown") {
      hold(held + 1);
      e.preventDefault();
    } else if (k === "ArrowLeft" || k === "ArrowUp") {
      hold(held - 1);
      e.preventDefault();
    } else if (k === "Home") {
      hold(0);
      e.preventDefault();
    } else if (k === "End") {
      hold(N - 1);
      e.preventDefault();
    } else if (k === " " || k === "Spacebar") {
      open = !open;
      paint();
      e.preventDefault();
    }
  });

  fan.addEventListener("click", function (e) {
    var c = e.target.closest(".card");
    if (!c) {
      return;
    }
    var i = Number(c.dataset.index);
    hold(i);
    openViewer(i);
  });

  fan.addEventListener("mouseover", function (e) {
    var c = e.target.closest(".card");
    if (!c) {
      return;
    }
    hold(Number(c.dataset.index));
  });

  toggle.addEventListener("click", function () {
    open = !open;
    paint();
  });
  lift.addEventListener("click", function () {
    hold(held + 1);
  });

  var opened = -1;
  var restore = null;

  function openViewer(i) {
    opened = ((i % N) + N) % N;
    var p = PLATES[opened];
    vImg.src = p.src;
    vImg.alt = p.alt;
    vCap.textContent = "Plate " + p.n + " \u00b7 " + p.by + " \u00b7 " + p.lic;
    vCount.textContent = p.n + " / 0" + N;
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
      openViewer(N - 1);
      e.preventDefault();
    } else if (k === "Tab") {
      var f = [vPrev, vNext, vClose];
      var at = f.indexOf(document.activeElement);
      e.preventDefault();
      f[(at + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus({ preventScroll: true });
    }
  });

  window.addEventListener("resize", measure);

  if (still.matches) {
    open = true;
  }
  measure();
  paint();
})();
