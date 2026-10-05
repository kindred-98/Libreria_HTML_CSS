(function () {
  "use strict";

  var calm = window.matchMedia("(prefers-reduced-motion: reduce)");

  var STEPS = [
    {
      n: "01", t: "Headland above the port", a: "Jalal Volker", l: "Public domain", tag: "Harbour head",
      u: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Archives_and_the_port.jpg/960px-Archives_and_the_port.jpg",
      p: "https://commons.wikimedia.org/wiki/File:Archives_and_the_port.jpg",
      alt: "Historic photograph of a classical building on a headland above a busy port"
    },
    {
      n: "02", t: "Painting a staircase in India", a: "Jorge Royan", l: "CC BY-SA 3.0",
      u: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/India_-_Painting_a_staircase_-_0063.jpg/960px-India_-_Painting_a_staircase_-_0063.jpg",
      p: "https://commons.wikimedia.org/wiki/File:India_-_Painting_a_staircase_-_0063.jpg",
      alt: "Workers painting the coloured walls beside a staircase in India"
    },
    {
      n: "03", t: "Monumental stair, Neue Burg", a: "Jebulon", l: "CC0",
      u: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Escalier_monumental_Neue_Burg_Vienne.jpg/960px-Escalier_monumental_Neue_Burg_Vienne.jpg",
      p: "https://commons.wikimedia.org/wiki/File:Escalier_monumental_Neue_Burg_Vienne.jpg",
      alt: "Monumental stone staircase inside the Neue Burg palace in Vienna"
    },
    {
      n: "04", t: "Fort du Mont Bart", a: "Thomas Bresson", l: "CC BY 3.0",
      u: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/2012-11-06_09-57-49-fort-du-mt-bart.jpg/960px-2012-11-06_09-57-49-fort-du-mt-bart.jpg",
      p: "https://commons.wikimedia.org/wiki/File:2012-11-06_09-57-49-fort-du-mt-bart.jpg",
      alt: "Stone steps climbing inside the fort du Mont Bart under a grey sky"
    },
    {
      n: "05", t: "Château de Beynac stair", a: "Jebulon", l: "CC0",
      u: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Stairs_Ch%C3%A2teau_de_Beynac_Dordogne_12.jpg/960px-Stairs_Ch%C3%A2teau_de_Beynac_Dordogne_12.jpg",
      p: "https://commons.wikimedia.org/wiki/File:Stairs_Ch%C3%A2teau_de_Beynac_Dordogne_12.jpg",
      alt: "Narrow stone stair in the courtyard of the Château de Beynac in Dordogne"
    },
    {
      n: "06", t: "Natural History Museum hall", a: "Diliff", l: "CC BY-SA 3.0",
      u: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Natural_History_Museum_Main_Hall%2C_London%2C_UK_-_Diliff.jpg/960px-Natural_History_Museum_Main_Hall%2C_London%2C_UK_-_Diliff.jpg",
      p: "https://commons.wikimedia.org/wiki/File:Natural_History_Museum_Main_Hall,_London,_UK_-_Diliff.jpg",
      alt: "The grand double staircase of the Natural History Museum hall in London"
    },
    {
      n: "07", t: "Phimeanakas tower stair", a: "Diego Delso", l: "CC BY-SA 3.0",
      u: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Phimeanakas%2C_Angkor_Thom%2C_Camboya%2C_2013-08-16%2C_DD_12.jpg/960px-Phimeanakas%2C_Angkor_Thom%2C_Camboya%2C_2013-08-16%2C_DD_12.jpg",
      p: "https://commons.wikimedia.org/wiki/File:Phimeanakas,_Angkor_Thom,_Camboya,_2013-08-16,_DD_12.jpg",
      alt: "Steep stone steps climbing the pyramid of Phimeanakas at Angkor Thom in Cambodia"
    },
    {
      n: "08", t: "Royal stairs, Palazzo Farnese", a: "Livioandronico2013", l: "CC BY-SA 4.0",
      u: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Royal_stairs_in_Palazzo_Farnese_%28Caprarola%29.jpg/960px-Royal_stairs_in_Palazzo_Farnese_%28Caprarola%29.jpg",
      p: "https://commons.wikimedia.org/wiki/File:Royal_stairs_in_Palazzo_Farnese_(Caprarola).jpg",
      alt: "Royal stairway rising through the Palazzo Farnese at Caprarola"
    },
    {
      n: "09", t: "National Museum of Slovenia", a: "Petar Milošević", l: "CC BY-SA 4.0",
      u: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Staircase_of_the_National_Museum_of_Slovenia.jpg/960px-Staircase_of_the_National_Museum_of_Slovenia.jpg",
      p: "https://commons.wikimedia.org/wiki/File:Staircase_of_the_National_Museum_of_Slovenia.jpg",
      alt: "Curving staircase inside the National Museum of Slovenia in Ljubljana"
    }
  ];

  var cascade = document.getElementById("cascade");
  var field = document.getElementById("field");
  var riser = document.getElementById("riser");
  var plateImg = document.getElementById("plateImg");
  var plateNo = document.getElementById("plateNo");
  var plateT = document.getElementById("plateT");
  var plateA = document.getElementById("plateA");
  var tally = document.querySelector(".rail__tally");

  var steps = STEPS.map(function (step, i) {
    var wrap = document.createElement("div");
    wrap.className = "tread";
    wrap.setAttribute("role", "listitem");
    wrap.style.setProperty("--i", String(i));

    var btn = document.createElement("button");
    btn.className = "tread__btn";
    btn.type = "button";
    btn.setAttribute("aria-pressed", "false");
    btn.setAttribute("aria-label", "Step " + (i + 1) + ", " + step.t);

    var img = document.createElement("img");
    img.className = "tread__img";
    img.setAttribute("src", step.u);
    img.setAttribute("alt", step.alt);
    img.setAttribute("loading", "lazy");
    img.setAttribute("decoding", "async");

    var tag = document.createElement("span");
    tag.className = "tread__tag";
    tag.textContent = step.n;

    btn.appendChild(img);
    btn.appendChild(tag);
    wrap.appendChild(btn);
    cascade.appendChild(wrap);
    return { wrap: wrap, btn: btn, step: step };
  });

  var at = 0;

  function take(n) {
    at = (n + steps.length) % steps.length;
    steps.forEach(function (item, k) {
      var on = k === at;
      item.btn.setAttribute("aria-pressed", on ? "true" : "false");
      item.wrap.classList.toggle("is-on", on);
    });
    var step = steps[at].step;
    plateImg.setAttribute("src", step.u);
    plateImg.setAttribute("alt", step.alt);
    plateNo.textContent = "Step " + step.n + " of 09";
    plateT.textContent = step.t;
    plateA.textContent = step.a + " \u00b7 " + step.l;
    tally.textContent = "Step " + step.n + " selected";
    riser.style.setProperty("--step", String(at));
  }

  var climb = document.getElementById("climb");
  var cImg = document.getElementById("climbImg");
  var cNo = document.getElementById("climbNo");
  var cT = document.getElementById("climbTitle");
  var cA = document.getElementById("climbA");
  var cLink = document.getElementById("climbLink");
  var cClose = document.getElementById("climbClose");
  var opener = null;

  function showFull(n) {
    var k = (n + steps.length) % steps.length;
    var step = steps[k].step;
    cImg.setAttribute("src", step.u);
    cImg.setAttribute("alt", step.alt);
    cNo.textContent = step.n + " / 09";
    cT.textContent = step.t;
    cA.textContent = step.a + " \u00b7 " + step.l;
    cLink.setAttribute("href", step.p);
  }

  function openFull(n, from) {
    opener = from;
    showFull(n);
    climb.hidden = false;
    requestAnimationFrame(function () { climb.classList.add("is-open"); });
    cClose.focus();
  }

  function shut() {
    climb.classList.remove("is-open");
    var seal = function () { climb.hidden = true; };
    if (calm.matches) { seal(); } else { setTimeout(seal, 280); }
    if (opener) { opener.focus(); opener = null; }
  }

  function ring() {
    return Array.prototype.slice.call(
      climb.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])')
    ).filter(function (node) { return node.offsetParent !== null; });
  }

  cascade.addEventListener("click", function (ev) {
    var btn = ev.target.closest(".tread__btn");
    if (!btn) { return; }
    var k = steps.map(function (item) { return item.btn; }).indexOf(btn);
    if (k > -1) { take(k); }
  });

  cascade.addEventListener("dblclick", function (ev) {
    var btn = ev.target.closest(".tread__btn");
    if (!btn) { return; }
    var k = steps.map(function (item) { return item.btn; }).indexOf(btn);
    if (k > -1) { openFull(k, btn); }
  });

  cascade.addEventListener("keydown", function (ev) {
    var btn = ev.target.closest(".tread__btn");
    if (!btn) { return; }
    var here = steps.map(function (item) { return item.btn; }).indexOf(btn);
    var to = -1;
    if (ev.key === "ArrowRight" || ev.key === "ArrowDown") { to = here + 1; }
    else if (ev.key === "ArrowLeft" || ev.key === "ArrowUp") { to = here - 1; }
    else if (ev.key === "Home") { to = 0; }
    else if (ev.key === "End") { to = steps.length - 1; }
    if (to < 0) { return; }
    ev.preventDefault();
    steps[to].btn.focus();
  });

  document.getElementById("up").addEventListener("click", function () { take(at - 1); });
  document.getElementById("down").addEventListener("click", function () { take(at + 1); });
  document.getElementById("climbPrev").addEventListener("click", function () { showFull(at - 1); });
  document.getElementById("climbNext").addEventListener("click", function () { showFull(at + 1); });
  cClose.addEventListener("click", shut);
  climb.querySelector(".climb__scrim").addEventListener("click", shut);

  document.addEventListener("keydown", function (ev) {
    if (climb.hidden) { return; }
    if (ev.key === "Escape") { ev.preventDefault(); shut(); }
    else if (ev.key === "ArrowRight" || ev.key === "ArrowDown") { ev.preventDefault(); showFull(at + 1); }
    else if (ev.key === "ArrowLeft" || ev.key === "ArrowUp") { ev.preventDefault(); showFull(at - 1); }
    else if (ev.key === "Home") { ev.preventDefault(); showFull(0); }
    else if (ev.key === "End") { ev.preventDefault(); showFull(steps.length - 1); }
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

  var t0 = 0;

  function breathe(now) {
    if (!t0) { t0 = now; }
    var s = (now - t0) / 1000;
    var x = Math.sin(s * 0.13) * 3.4 + Math.cos(s * 0.08) * 1.6;
    var y = Math.cos(s * 0.1) * 2.2;
    field.style.transform = "translate3d(" + x.toFixed(2) + "%, " + y.toFixed(2) + "%, 0)";
    field.style.opacity = (0.72 + Math.sin(s * 0.21) * 0.14).toFixed(3);
    requestAnimationFrame(breathe);
  }

  if (calm.matches) {
    field.style.transform = "translate3d(0,0,0)";
    field.style.opacity = "0.8";
  } else {
    requestAnimationFrame(breathe);
  }

  take(0);
}());
