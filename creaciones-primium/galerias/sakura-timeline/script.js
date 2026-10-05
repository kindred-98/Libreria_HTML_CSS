(function () {
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var MON = { MAR: 2, APR: 3, MAY: 4 };
  var PHASE = [0, 1, 2, 2, 3, 3, 3, 3, 4];

  var ladder = document.getElementById("ladder");
  var st = Array.prototype.slice.call(ladder.querySelectorAll(".st"));
  var phases = Array.prototype.slice.call(document.querySelectorAll(".phase"));
  var doy = document.getElementById("doy");
  var doyOut = document.getElementById("doyOut");
  var wash = document.getElementById("wash");
  var edge = document.getElementById("edge");
  var fill = document.getElementById("fill");
  var pct = document.getElementById("pct");
  var viewer = document.getElementById("viewer");
  var vImg = document.getElementById("vImg");
  var at = 0;
  var lastFocus = null;

  function pad(n) { return (n < 10 ? "0" : "") + n; }

  function meta(n) {
    var b = st[n];
    return {
      no: b.dataset.no || pad(n + 1),
      date: b.dataset.date,
      day: b.dataset.day,
      name: b.dataset.name,
      note: b.dataset.note,
      credit: b.dataset.credit,
      crop: b.dataset.crop,
      place: b.dataset.place
    };
  }

  function longDate(short) {
    var p = short.split(" ");
    return p[0] + " " + MONTHS[MON[p[1]]];
  }

  function frontIndex() {
    var lo = Number(doy.min), hi = Number(doy.max);
    var p = (Number(doy.value) - lo) / (hi - lo);
    return p * (st.length - 1);
  }

  function paint() {
    var f = frontIndex();
    var p = f / (st.length - 1);
    wash.style.transform = "scaleX(" + (0.04 + 0.96 * p).toFixed(3) + ")";
    var here = st[Math.round(f)].getBoundingClientRect();
    var x = here.left + here.width / 2 - ladder.getBoundingClientRect().left;
    edge.style.transform = "translate3d(" + (x - 0.5).toFixed(1) + "px,0,0)";

    for (var k = 0; k < st.length; k++) {
      st[k].classList.toggle("is-on", k === at);
      st[k].classList.toggle("is-past", k <= f);
      st[k].classList.toggle("is-future", k > f);
      st[k].setAttribute("aria-current", k === at ? "true" : "false");
    }

    var cur = PHASE[at];
    for (var j = 0; j < phases.length; j++) {
      phases[j].classList.toggle("is-on", j === cur);
      phases[j].classList.toggle("is-done", j < cur);
    }

    var m = meta(at);
    document.getElementById("rNo").textContent = pad(at + 1);
    document.getElementById("rDate").textContent = longDate(m.date);
    document.getElementById("rName").textContent = m.name;
    document.getElementById("rNote").textContent = m.note;
    document.getElementById("rCredit").textContent = m.credit;
    document.getElementById("rDay").textContent = m.day + " of the season";
    document.getElementById("rCrop").textContent = m.crop;
    document.getElementById("rPlace").textContent = m.place;

    fill.style.transform = "scaleX(" + (f / (st.length - 1)).toFixed(3) + ")";
    pct.textContent = Math.round(f / (st.length - 1) * 100) + "%";
    doyOut.textContent = doy.value;
  }

  function go(n) { at = Math.max(0, Math.min(st.length - 1, n)); paint(); }

  function goTo(n) {
    go(n);
    doy.value = String(Number(doy.min) + (Number(doy.max) - Number(doy.min)) * (n / (st.length - 1)));
    paint();
  }

  function fillPlate(n) {
    var m = meta(n);
    var img = st[n].querySelector("img");
    vImg.setAttribute("src", img.getAttribute("src"));
    vImg.setAttribute("alt", img.getAttribute("alt"));
    document.getElementById("vNo").textContent = pad(n + 1) + " of " + pad(st.length) + " \u00b7 " + longDate(m.date);
    document.getElementById("vName").textContent = m.name;
    document.getElementById("vNote").textContent = m.note;
    document.getElementById("vCredit").textContent = m.credit;
    document.getElementById("vCount").textContent = pad(n + 1) + " / " + pad(st.length);
  }

  function openAt(n) {
    lastFocus = document.activeElement;
    goTo(n);
    fillPlate(n);
    viewer.hidden = false;
    document.getElementById("vClose").focus();
  }

  function close() {
    viewer.hidden = true;
    if (lastFocus?.focus) lastFocus.focus();
  }

  st.forEach(function (b, i) { b.addEventListener("click", function () { openAt(i); }); });
  doy.addEventListener("input", paint);
  document.getElementById("back").addEventListener("click", function () { goTo(at - 1); });
  document.getElementById("fwd").addEventListener("click", function () { goTo(at + 1); });
  document.getElementById("open").addEventListener("click", function () { openAt(at); });
  document.getElementById("vPrev").addEventListener("click", function () { openAt((at - 1 + st.length) % st.length); });
  document.getElementById("vNext").addEventListener("click", function () { openAt((at + 1) % st.length); });
  document.getElementById("vClose").addEventListener("click", close);
  viewer.addEventListener("click", function (e) { if ("close" in e.target.dataset) close(); });

  Array.prototype.forEach.call(document.querySelectorAll('a[href^="#st-"]'), function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      var n = Number.parseInt(a.getAttribute("href").slice(4), 10) - 1;
      if (isNaN(n)) return;
      goTo(n);
      st[n].focus();
    });
  });

  ladder.addEventListener("keydown", function (e) {
    var k = e.key;
    if (k === "ArrowRight") goTo(at + 1);
    else if (k === "ArrowLeft") goTo(at - 1);
    else if (k === "ArrowDown") goTo(at + 2);
    else if (k === "ArrowUp") goTo(at - 2);
    else if (k === "Home") goTo(0);
    else if (k === "End") goTo(st.length - 1);
    else if (k === "Enter" || k === " ") { if (e.target !== ladder) return; openAt(at); }
    else return;
    e.preventDefault();
  });

  document.addEventListener("keydown", function (e) {
    if (viewer.hidden) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") openAt((at - 1 + st.length) % st.length);
    else if (e.key === "ArrowRight") openAt((at + 1) % st.length);
    else if (e.key === "Home") openAt(0);
    else if (e.key === "End") openAt(st.length - 1);
    else return;
    e.preventDefault();
  });

  paint();
})();
