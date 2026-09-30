const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const grid = document.getElementById("svcGrid");
const cells = Array.from(grid.querySelectorAll(".svc__cell"));
const chips = Array.from(document.querySelectorAll(".svc__chip"));
const countOut = document.getElementById("svcCount");
const ofOut = document.getElementById("svcOf");
const note = document.getElementById("svcNote");
const openBtn = document.getElementById("svcOpen");
const resetBtn = document.getElementById("svcReset");

const LABEL = {
  all: "All services",
  transit: "Transit",
  parks: "Parks and gardens",
  library: "Library",
  safety: "Safety and works",
  market: "Markets"
};

let cat = "all";
let onlyOpen = false;

function shown(cell) {
  const okCat = cat === "all" || cell.dataset.cat === cat;
  const okDesk = !onlyOpen || cell.querySelector(".svc__meta").dataset.desk === "1";
  return okCat && okDesk;
}

function paint() {
  let n = 0;
  cells.forEach(function (cell) {
    if (shown(cell)) {
      n += 1;
    }
  });
  countOut.textContent = String(n);
  ofOut.textContent = "of " + cells.length + " listed";
  const scope = cat === "all" ? "services" : LABEL[cat].toLowerCase();
  note.textContent = n + " of " + cells.length + " " + scope + (onlyOpen ? " · open desks only" : " · 6 desks open now");
}

function reflow(mutate) {
  if (reduce) {
    mutate();
    paint();
    return;
  }
  const first = new Map();
  cells.forEach(function (cell) {
    if (shown(cell)) {
      first.set(cell, cell.getBoundingClientRect());
    }
  });
  mutate();
  cells.forEach(function (cell) {
    if (!shown(cell)) {
      cell.classList.remove("is-fresh");
      return;
    }
    const before = first.get(cell);
    if (!before) {
      cell.classList.remove("is-fresh");
      void cell.offsetWidth;
      cell.classList.add("is-fresh");
      return;
    }
    const after = cell.getBoundingClientRect();
    const dx = before.left - after.left;
    const dy = before.top - after.top;
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) {
      return;
    }
    cell.style.transition = "none";
    cell.style.transform = "translate3d(" + dx.toFixed(1) + "px," + dy.toFixed(1) + "px,0)";
    void cell.offsetWidth;
    cell.style.transition = "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)";
    cell.style.transform = "";
    window.setTimeout(function () {
      cell.style.transition = "";
    }, 560);
  });
  paint();
}

function apply() {
  reflow(function () {
    cells.forEach(function (cell) {
      cell.classList.toggle("is-out", !shown(cell));
    });
  });
}

chips.forEach(function (chip) {
  chip.addEventListener("click", function () {
    cat = chip.dataset.cat;
    chips.forEach(function (other) {
      const on = other === chip;
      other.classList.toggle("is-on", on);
      other.setAttribute("aria-pressed", on ? "true" : "false");
    });
    apply();
  });
});

openBtn.addEventListener("click", function () {
  onlyOpen = !onlyOpen;
  openBtn.setAttribute("aria-pressed", onlyOpen ? "true" : "false");
  apply();
});

resetBtn.addEventListener("click", function () {
  cat = "all";
  onlyOpen = false;
  openBtn.setAttribute("aria-pressed", "false");
  chips.forEach(function (chip) {
    const on = chip.dataset.cat === "all";
    chip.classList.toggle("is-on", on);
    chip.setAttribute("aria-pressed", on ? "true" : "false");
  });
  apply();
});

paint();
