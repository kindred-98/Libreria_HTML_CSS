(function () {
  "use strict";

  var select = document.getElementById("piece");
  var stage = document.getElementById("stage");
  var mosaic = document.getElementById("mosaic");
  var plaque = document.getElementById("plaque");
  var status = document.getElementById("status");

  if (!select || !stage || !mosaic) {
    return;
  }

  var still = false;
  try {
    still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {}

  var EASE_IN = "cubic-bezier(.36,.02,.16,1)";
  var EASE_OUT = "cubic-bezier(.16,.86,.24,1)";

  var tiles = [];
  var order = [];
  var slots = [];
  var nodes = mosaic.querySelectorAll(".tile");
  for (var node of nodes) {
    order.push(node);
    slots.push(node.parentNode);
  }
  tiles = order.slice();

  var current = null;

  function titleOf(tile) {
    var cap = tile.querySelector(".tile__cap b");
    return cap ? cap.textContent : "";
  }

  function flip(node, from, to, ease, duration, fromOpacity) {
    node.style.transition = "none";
    node.style.transform = from;
    node.style.opacity = fromOpacity === undefined ? "1" : fromOpacity;
    // Lectura de disposicion: fuerza el reflujo para que la posicion inicial
    // quede pintada antes de poner la transicion y animar hacia `to`.
    node.getBoundingClientRect();
    node.style.transition = "transform " + duration + "ms " + ease + ", opacity " + Math.round(duration * 0.7) + "ms linear";
    node.style.transform = to;
    node.style.opacity = "1";
    window.setTimeout(function () {
      node.style.transition = "";
      node.style.transform = "";
      node.style.opacity = "";
    }, duration + 90);
  }

  function matrix(from, to) {
    var dx = from.left - to.left;
    var dy = from.top - to.top;
    var sx = to.width > 0 ? from.width / to.width : 1;
    var sy = to.height > 0 ? from.height / to.height : 1;
    return "perspective(1300px) translate3d(" + dx.toFixed(2) + "px," + dy.toFixed(2) + "px,0) rotateY(0deg) scale(" +
      sx.toFixed(4) + "," + sy.toFixed(4) + ")";
  }

  function show(value) {
    var next = null;
    for (var tile of tiles) {
      if (tile.dataset.value === value) {
        next = tile;
      }
    }
    if (!next || next === current) {
      return;
    }

    var outgoing = current;

    var inFirst = next.getBoundingClientRect();
    var outFirst = outgoing ? outgoing.getBoundingClientRect() : null;

    for (var j = 0; j < order.length; j += 1) {
      if (order[j] !== next && slots[j]) {
        slots[j].appendChild(order[j]);
      }
    }
    stage.appendChild(next);

    var inLast = next.getBoundingClientRect();
    var outLast = outgoing ? outgoing.getBoundingClientRect() : null;

    for (var slot of slots) {
      if (slot) {
        slot.classList.toggle("is-hung", !slot.querySelector(".tile"));
      }
    }

    for (var tile of tiles) {
      tile.setAttribute("aria-pressed", tile === next ? "true" : "false");
    }

    if (still) {
      current = next;
    } else {
      flip(
        next,
        "perspective(1300px) translate3d(" + (inFirst.left - inLast.left).toFixed(2) + "px," +
          (inFirst.top - inLast.top).toFixed(2) + "px,0) rotateY(-84deg) scale(" +
          (inLast.width > 0 ? (inFirst.width / inLast.width).toFixed(4) : 1) + ",1)",
        "perspective(1300px) translate3d(0,0,0) rotateY(0deg) scale(1,1)",
        EASE_OUT,
        620,
        0.15
      );
      if (outgoing && outFirst && outLast) {
        flip(
          outgoing,
          matrix(outFirst, outLast),
          "perspective(1300px) translate3d(0,0,0) rotateY(72deg) scale(1,1)",
          EASE_IN,
          560,
          1
        );
      }
      current = next;
    }

    if (plaque) {
      plaque.textContent = next.dataset.plaque || "";
    }
    if (status) {
      status.textContent = titleOf(next) + " is on the wall. " + (next.dataset.plaque || "");
    }
  }

  function pick(tile) {
    var value = tile.dataset.value;
    if (!value) {
      return;
    }
    select.value = value;
    show(value);
  }

  tiles.forEach(function (tile) {
    tile.addEventListener("click", function () {
      pick(tile);
    });
  });

  select.addEventListener("change", function () {
    show(select.value);
  });

  show(select.value);
})();
