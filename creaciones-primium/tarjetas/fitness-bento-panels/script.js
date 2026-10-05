const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const grid = document.getElementById("bento");
const gloss = document.getElementById("gloss");
const goBtn = document.getElementById("goBtn");
const goText = goBtn.querySelector(".bento__go-text");
const segs = Array.from(document.querySelectorAll(".bento__seg-btn"));
const blocks = Array.from(document.querySelectorAll("[data-block]"));
const figures = Array.from(document.querySelectorAll("[data-count]"));

const EASE = "cubic-bezier(.16,1,.3,1)";

function format(node, value) {
  return node.dataset.format === "one" ? value.toFixed(1) : String(Math.round(value));
}

function runCounter(node) {
  const to = Number(node.dataset.count) || 0;
  if (reduce) {
    node.textContent = format(node, to);
    return;
  }
  const span = 620;
  const start = Date.now();
  function step() {
    const t = Math.min(1, (Date.now() - start) / span);
    node.textContent = format(node, to * (1 - Math.pow(1 - t, 3)));
    if (t < 1) {
      window.setTimeout(step, 24);
    } else {
      node.textContent = format(node, to);
    }
  }
  step();
}

let hop = 0;
let glossTimer = 0;

function placeGloss() {
  const target = blocks[hop % blocks.length];
  hop += 1;
  const box = target.getBoundingClientRect();
  const frame = grid.getBoundingClientRect();
  const x = box.left - frame.left + box.width / 2 - 66;
  const y = box.top - frame.top + box.height / 2 - 66;
  const scale = 0.86 + box.width / 420;
  gloss.style.transform = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0) scale(" + scale.toFixed(2) + ")";
}

function restartMeasures() {
  grid.classList.add("is-restart");
  grid.getBoundingClientRect();
  grid.classList.remove("is-restart");
  figures.forEach(function (node) { return runCounter(node); });
}

let flipTimer = 0;

function applyMode(mode) {
  if (grid.dataset.mode === mode) {
    return;
  }
  const first = blocks.map(function (node) {
    return node.getBoundingClientRect();
  });
  grid.dataset.mode = mode;
  const last = blocks.map(function (node) {
    return node.getBoundingClientRect();
  });
  if (reduce) {
    placeGloss();
    return;
  }
  blocks.forEach(function (node, i) {
    const dx = first[i].left - last[i].left;
    const dy = first[i].top - last[i].top;
    const moved = Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5;
    window.clearTimeout(flipTimer);
    node.style.transition = "none";
    node.style.transform = moved ? "translate3d(" + dx.toFixed(1) + "px," + dy.toFixed(1) + "px,0)" : "";
    node.getBoundingClientRect();
    node.style.transition = "transform .46s " + EASE;
    node.style.transform = "";
    flipTimer = window.setTimeout(function () {
      node.style.transition = "";
    }, 520);
  });
  window.setTimeout(placeGloss, 480);
}

segs.forEach(function (btn) {
  btn.addEventListener("click", function () {
    segs.forEach(function (other) {
      const on = other === btn;
      other.classList.toggle("is-on", on);
      other.setAttribute("aria-pressed", on ? "true" : "false");
    });
    applyMode(btn.dataset.mode);
  });
});

goBtn.addEventListener("click", function () {
  restartMeasures();
  goBtn.classList.add("is-done");
  goBtn.setAttribute("aria-pressed", "true");
  goText.textContent = "Recomputed";
});

figures.forEach(function (node) { return runCounter(node); });
placeGloss();
gloss.classList.add("is-live");
window.setTimeout(placeGloss, 720);
window.setTimeout(placeGloss, 1500);
window.setInterval(placeGloss, 2600);
window.setTimeout(function () {
  grid.classList.add("is-settled");
}, 800);
