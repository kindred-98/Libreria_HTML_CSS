(function () {
  "use strict";
  var cells = document.querySelectorAll(".cell");
  if (!cells.length) return;
  var code = document.getElementById("code");
  var state = document.getElementById("state");
  var COLS = 6;
  var fires = 0;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function rnd(a, b) { return a + Math.random() * (b - a); }

  for (var cell of cells) {
    var mx = cell.querySelector(".cell__mx");
    var kind = cell.dataset.s;
    var frag = document.createDocumentFragment();
    for (var i = 0; i < 12; i++) {
      var hx = document.createElement("i");
      hx.className = "hx";
      var col = i % COLS;
      var row = (i / COLS | 0);
      var d;
      if (kind === "load") {
        d = -(col / COLS) * 2.2 - row * 0.06;
      } else if (kind === "armed") {
        d = -(Math.abs(col - 2.5) + Math.abs(row - 0.5) * 1.3) * 0.26;
      } else if (kind === "fault") {
        d = -rnd(0, 0.9);
      } else {
        d = -(col * 0.34 + row * 0.5);
      }
      hx.style.setProperty("--d", d.toFixed(3) + "s");
      hx.style.setProperty("--i", String(i));
      frag.appendChild(hx);
    }
    mx.appendChild(frag);
  }

  function fire(cell) {
    if (cell.disabled || reduce) return;
    fires++;
    cell.classList.remove("is-fire");
    cell.getBoundingClientRect();
    cell.classList.add("is-fire");
    window.setTimeout(function () { cell.classList.remove("is-fire"); }, 560);
    code.textContent = "Fires " + (fires < 1000 ? ("00" + fires).slice(-3) : fires);
    var id = cell.parentNode.querySelector(".slot__id").textContent;
    state.textContent = "Cell " + id + " fired \ array holding";
  }

  for (var cel of cells) {
    cel.addEventListener("click", function (e) { fire(e.currentTarget); });
  }
})();
