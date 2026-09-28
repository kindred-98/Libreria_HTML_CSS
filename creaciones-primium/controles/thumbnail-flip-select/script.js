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
  } catch (err) {
    void err;
  }

  var EASE_IN = "cubic-bezier(.36,.02,.16,1)";
  var EASE_OUT = "cubic-bezier(.16,.86,.24,1)";

  var tiles = [];
  var order = [];
  var slots = [];
  var nodes = mosaic.querySelectorAll(".tile");
  for (var i = 0; i < nodes.length; i += 1) {
    order.push(nodes[i]);
    slots.push(nodes[i].parentNode);
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
    node.offsetWidth;
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
    for (var k = 0; k < tiles.length; k += 1) {
      if (tiles[k].getAttribute("data-value") === value) {
        next = tiles[k];
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

    for (var s = 0; s < slots.length; s += 1) {
      if (slots[s]) {
        slots[s].classList.toggle("is-hung", !slots[s].querySelector(".tile"));
      }
    }

    for (var m = 0; m < tiles.length; m += 1) {
      tiles[m].setAttribute("aria-pressed", tiles[m] === next ? "true" : "false");
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
      plaque.textContent = next.getAttribute("data-plaque") || "";
    }
    if (status) {
      status.textContent = titleOf(next) + " is on the wall. " + (next.getAttribute("data-plaque") || "");
    }
  }

  function pick(tile) {
    var value = tile.getAttribute("data-value");
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
