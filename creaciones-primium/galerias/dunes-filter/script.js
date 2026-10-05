(function () {
  "use strict";

  var calm = window.matchMedia("(prefers-reduced-motion: reduce)");
  var list = document.getElementById("dunes");
  var lines = Array.prototype.slice.call(list.querySelectorAll(".line"));
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));
  var tally = document.querySelector(".tally");
  var needle = document.getElementById("needle");
  var bearing = document.getElementById("bearing");
  var rayA = document.querySelector(".ray-a");
  var rayB = document.querySelector(".ray-b");

  var BRING = { all: 0, ridge: 14, crest: 28, basin: 42 };
  var NOUN = { all: "line", ridge: "ridge line", crest: "crest line", basin: "basin line" };

  var live = lines.slice();
  var idx = 0;
  var opener = null;
  var want = 0;
  var have = 0;
  var t0 = 0;

  function apply(key) {
    var keep = [];
    lines.forEach(function (line, n) {
      var ok = key === "all" || line.dataset.tags.split(" ").includes(key);
      line.classList.toggle("is-out", !ok);
      line.dataset.rank = n;
      if (ok) { keep.push(line); }
    });
    keep.sort(function (a, b) {
      var d = Number(a.dataset.tier) - Number(b.dataset.tier);
      return d !== 0 ? d : Number(a.dataset.rank) - Number(b.dataset.rank);
    });
    list.classList.toggle("split", key !== "all");
    keep.forEach(function (line, k) {
      line.classList.remove("is-lead", "is-in");
      line.style.order = k;
      line.querySelector(".idx").textContent = pad(k + 1);
      if (k === 0) { line.classList.add("is-lead"); }
      line.getBoundingClientRect();
      line.classList.add("is-in");
    });
    live = keep;
    var word = NOUN[key] || "line";
    tally.textContent = live.length + " " + word + (live.length === 1 ? "" : "s") + " in the register";
  }

  var lb = document.getElementById("lb");
  var lbImg = document.getElementById("lbImg");
  var lbNo = document.getElementById("lbNo");
  var lbT = document.getElementById("lbT");
  var lbA = document.getElementById("lbA");
  var lbP = document.getElementById("lbP");
  var lbX = document.getElementById("lbX");

  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  function show(n) {
    if (!live.length) { return; }
    idx = (n + live.length) % live.length;
    var row = live[idx].querySelector(".row");
    var img = row.querySelector("img");
    lbImg.setAttribute("src", img.getAttribute("src"));
    lbImg.setAttribute("alt", img.getAttribute("alt"));
    lbNo.textContent = pad(idx + 1) + " / " + pad(live.length);
    lbT.textContent = row.dataset.t;
    lbA.textContent = row.dataset.a + " · " + row.dataset.l;
    lbP.setAttribute("href", row.dataset.p);
  }

  function open(n, from) {
    opener = from;
    show(n);
    lb.hidden = false;
    requestAnimationFrame(function () { lb.classList.add("is-open"); });
    lbX.focus();
  }

  function close() {
    lb.classList.remove("is-open");
    var seal = function () { lb.hidden = true; };
    if (calm.matches) { seal(); } else { setTimeout(seal, 260); }
    if (opener) { opener.focus(); opener = null; }
  }

  function ring() {
    return Array.prototype.slice.call(
      lb.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])')
    ).filter(function (el) { return el.offsetParent !== null; });
  }

  function turn(delta) {
    var at = chips.indexOf(document.activeElement);
    if (at < 0) { return false; }
    var to = (at + delta + chips.length) % chips.length;
    chips[to].focus();
    return true;
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (other) {
        other.setAttribute("aria-pressed", other === chip ? "true" : "false");
      });
      want = BRING[chip.dataset.filter] || 0;
      bearing.textContent = "N " + pad(want) + "°";
      apply(chip.dataset.filter);
    });
  });

  list.addEventListener("click", function (ev) {
    var row = ev.target.closest(".row");
    if (!row) { return; }
    open(live.indexOf(row.closest(".line")), row);
  });

  list.addEventListener("keydown", function (ev) {
    var row = ev.target.closest(".row");
    if (!row) { return; }
    var here = live.indexOf(row.closest(".line"));
    var to = -1;
    if (ev.key === "ArrowRight" || ev.key === "ArrowDown") { to = here + 1; }
    else if (ev.key === "ArrowLeft" || ev.key === "ArrowUp") { to = here - 1; }
    else if (ev.key === "Home") { to = 0; }
    else if (ev.key === "End") { to = live.length - 1; }
    if (to < 0) { return; }
    ev.preventDefault();
    live[(to + live.length) % live.length].querySelector(".row").focus();
  });

  document.addEventListener("keydown", function (ev) {
    if (lb.hidden) {
      if (ev.key === "ArrowRight" && !ev.altKey && !ev.ctrlKey && !ev.metaKey) { if (turn(1)) { ev.preventDefault(); } }
      else if (ev.key === "ArrowLeft" && !ev.altKey && !ev.ctrlKey && !ev.metaKey) { if (turn(-1)) { ev.preventDefault(); } }
      return;
    }
    if (ev.key === "Escape") { ev.preventDefault(); close(); }
    else if (ev.key === "ArrowRight") { ev.preventDefault(); show(idx + 1); }
    else if (ev.key === "ArrowLeft") { ev.preventDefault(); show(idx - 1); }
    else if (ev.key === "Home") { ev.preventDefault(); show(0); }
    else if (ev.key === "End") { ev.preventDefault(); show(live.length - 1); }
    else if (ev.key === "Tab") {
      var box = ring();
      if (!box.length) { return; }
      var at = box.indexOf(document.activeElement);
      var next = ev.shiftKey ? at - 1 : at + 1;
      if (next < 0 || next >= box.length) {
        ev.preventDefault();
        box[(next + box.length) % box.length].focus();
      }
    }
  });

  document.getElementById("lbPrev").addEventListener("click", function () { show(idx - 1); });
  document.getElementById("lbNext").addEventListener("click", function () { show(idx + 1); });
  lbX.addEventListener("click", close);
  lb.querySelector(".lb-veil").addEventListener("click", close);

  function tick(now) {
    if (!t0) { t0 = now; }
    var s = (now - t0) / 1000;
    have += (want - have) * 0.12;
    needle.style.transform = "rotate(" + have.toFixed(2) + "deg)";
    rayA.style.transform = "rotate(" + (s * 2.4).toFixed(2) + "deg)";
    rayB.style.transform = "rotate(" + (-s * 1.35).toFixed(2) + "deg)";
    requestAnimationFrame(tick);
  }

  if (calm.matches) {
    needle.style.transform = "rotate(0deg)";
    rayA.style.transform = "rotate(18deg)";
    rayB.style.transform = "rotate(-9deg)";
  } else {
    requestAnimationFrame(tick);
  }

  bearing.textContent = "00 / 000";
  apply("all");
}());
