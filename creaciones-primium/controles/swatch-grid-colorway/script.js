(function () {
  "use strict";

  var root = document.documentElement;
  var wall = document.querySelector(".press__wall");
  var block = document.getElementById("proofBlock");
  var brayer = document.getElementById("brayer");
  var proofHex = document.getElementById("proofHex");
  var note = document.getElementById("note");
  var status = document.getElementById("status");
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));

  if (!chips.length) {
    return;
  }

  var still = false;
  try {
    still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (err) {
    void err;
  }

  function plateOf(input) {
    var label = input.nextElementSibling;
    return label ? label.querySelector(".swatch__plate") : null;
  }

  function place() {
    if (!wall || !block || !brayer) {
      return;
    }
    var wr = wall.getBoundingClientRect();
    var br = block.getBoundingClientRect();
    if (!wr.height || !br.height) {
      return;
    }
    brayer.style.top = Math.round(br.bottom - wr.top - 13) + "px";
  }

  function sweep() {
    if (still || !brayer || !block) {
      return;
    }
    brayer.classList.remove("is-run");
    block.classList.remove("is-inking");
    void brayer.offsetWidth;
    brayer.classList.add("is-run");
    block.classList.add("is-inking");
    window.setTimeout(function () {
      brayer.classList.remove("is-run");
      block.classList.remove("is-inking");
    }, 1150);
  }

  function paint(fromKey) {
    var current = null;
    chips.forEach(function (chip) {
      if (chip.checked) {
        current = chip;
      }
    });
    if (!current) {
      return;
    }

    var hex = String(current.value).replace("#", "").toUpperCase();
    var name = current.getAttribute("data-name") || "Ink";
    var serial = current.getAttribute("data-serial") || "";

    if (fromKey !== current.id) {
      sweep();
    }

    root.style.setProperty("--current", current.value);
    if (proofHex) {
      proofHex.textContent = hex;
    }
    if (note) {
      note.textContent = serial + " / " + name + " / solid";
    }
    if (status) {
      status.textContent = "Ink " + name + ", hex " + hex + ", catalogue number " + serial + ".";
    }
  }

  chips.forEach(function (chip) {
    chip.addEventListener("change", function () {
      var plate = plateOf(chip);
      if (plate) {
        var hexBox = plate.querySelector(".swatch__hex");
        if (hexBox) {
          hexBox.textContent = String(chip.value).replace("#", "").toUpperCase();
        }
      }
      paint(chip.id);
    });
  });

  place();
  paint(null);

  window.addEventListener("resize", place);
  if (typeof ResizeObserver === "function" && wall) {
    new ResizeObserver(place).observe(wall);
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(place).catch(function () {});
  }
})();
