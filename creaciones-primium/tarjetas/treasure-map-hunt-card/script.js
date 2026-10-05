const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const stage = document.querySelector(".stage");
const card = document.getElementById("tmap");
const castBtn = document.getElementById("castBtn");
const castText = castBtn.querySelector(".cast__text");
const figures = Array.from(document.querySelectorAll("[data-count]"));

let castTimer = 0;

function runCounter(node) {
  const to = Number(node.dataset.count) || 0;
  if (reduce) {
    node.textContent = String(to);
    return;
  }
  const span = 640;
  const start = Date.now();
  function step() {
    const t = Math.min(1, (Date.now() - start) / span);
    node.textContent = String(Math.round(to * (1 - Math.pow(1 - t, 3))));
    if (t < 1) {
      window.setTimeout(step, 24);
    } else {
      node.textContent = String(to);
    }
  }
  step();
}

function cast() {
  if (reduce) {
    card.classList.add("is-cast");
    return;
  }
  window.clearTimeout(castTimer);
  card.classList.remove("is-cast");
  card.getBoundingClientRect();
  card.classList.add("is-cast");
  castTimer = window.setTimeout(function () {
    card.classList.remove("is-cast");
  }, 900);
}

castBtn.addEventListener("click", function () {
  cast();
  castBtn.setAttribute("aria-pressed", "true");
  castText.textContent = "Vault unsealed";
});

figures.forEach(function (node) { return runCounter(node); });
window.setTimeout(cast, 1150);
window.setTimeout(function () {
  stage.classList.add("is-settled");
}, 800);
