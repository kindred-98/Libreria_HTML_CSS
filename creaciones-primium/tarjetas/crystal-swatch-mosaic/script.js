const mosaic = document.getElementById("csmMosaic");
const swatches = Array.prototype.slice.call(mosaic.querySelectorAll(".sw"));
const filters = Array.prototype.slice.call(document.querySelectorAll(".chip-btn"));
const nameOut = document.getElementById("csmName");
const finOut = document.getElementById("csmFin");
const transOut = document.getElementById("csmTrans");
const barOut = document.getElementById("csmBar");
const reserveBtn = document.getElementById("csmReserve");

let mode = "all";
let held = swatches[0];

function showSpec(node) {
  if (!node) {
    return;
  }
  held = node;
  nameOut.textContent = node.dataset.name;
  finOut.textContent = node.dataset.finish;
  const value = Number(node.dataset.trans) || 0;
  transOut.textContent = Math.round(value * 100) + " %";
  barOut.style.setProperty("--w", String(value));
  swatches.forEach(function (other) {
    other.setAttribute("aria-pressed", other === node ? "true" : "false");
  });
}

function paintButtons(name) {
  filters.forEach(function (button) {
    const on = button.dataset.filter === name;
    button.classList.toggle("is-on", on);
    button.setAttribute("aria-pressed", on ? "true" : "false");
  });
}

function apply(name) {
  if (name === mode) {
    return;
  }
  mode = name;
  paintButtons(name);

  const first = new Map();
  swatches.forEach(function (node) {
    if (!node.hidden) {
      first.set(node, node.getBoundingClientRect());
    }
  });

  const hiding = [];
  swatches.forEach(function (node) {
    const show = name === "all" || node.dataset.cat === name;
    if (show) {
      node.hidden = false;
      node.style.transform = "";
      node.style.transition = "";
      node.classList.remove("is-out");
    } else {
      node.classList.add("is-out");
      hiding.push(node);
    }
  });

  swatches.forEach(function (node) {
    const before = first.get(node);
    if (!before) {
      return;
    }
    const after = node.getBoundingClientRect();
    const dx = before.left - after.left;
    const dy = before.top - after.top;
    if (dx || dy) {
      node.style.transition = "none";
      node.style.transform = "translate(" + dx + "px," + dy + "px)";
    }
  });

  setTimeout(function () {
    hiding.forEach(function (node) {
      node.hidden = true;
      if (held === node) {
        held = null;
      }
    });
    swatches.forEach(function (node) {
      node.style.transition = "";
      node.style.transform = "";
    });
  }, 210);
}

filters.forEach(function (button) {
  button.addEventListener("click", function () {
    apply(button.dataset.filter);
  });
});

swatches.forEach(function (node) {
  node.addEventListener("click", function () {
    showSpec(node);
  });
});

reserveBtn.addEventListener("click", function () {
  const on = reserveBtn.getAttribute("aria-pressed") === "true";
  reserveBtn.setAttribute("aria-pressed", on ? "false" : "true");
  reserveBtn.textContent = on ? "Reserve sample set" : "Set reserved for Friday";
});

showSpec(swatches[0]);
apply("cathedral");
setTimeout(function () {
  apply("all");
}, 1750);

let tour = 0;

function rotateHeld() {
  tour += 1;
  const node = swatches[tour % swatches.length];
  showSpec(node);
  node.classList.remove("is-turn");
  node.getBoundingClientRect();
  node.classList.add("is-turn");
  setTimeout(rotateHeld, 2600);
}

setTimeout(rotateHeld, 2050);
