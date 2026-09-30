const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const minus = document.getElementById("brthMinus");
const plus = document.getElementById("brthPlus");
const servingsOut = document.getElementById("brthServings");
const yieldOut = document.getElementById("brthYield");
const openAll = document.getElementById("brthAll");
const amounts = Array.from(document.querySelectorAll(".amt"));
const steps = Array.from(document.querySelectorAll(".step"));

const BASE = 4;
let servings = BASE;

function roundTo(value, step) {
  return Math.max(step, Math.round(value / step) * step);
}

function amountFor(node, serves) {
  const base = Number(node.dataset.base);
  const step = Number(node.dataset.step) || 1;
  return roundTo((base * serves) / BASE, step);
}

function tweenAmount(node, to) {
  const from = Number(node.textContent) || 0;
  if (reduce) {
    node.textContent = String(to);
    return;
  }
  const duration = 380;
  const start = performance.now();

  function step() {
    const t = Math.min(1, (performance.now() - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    node.textContent = String(Math.round(from + (to - from) * eased));
    if (t < 1) {
      setTimeout(step, 22);
    } else {
      node.textContent = String(to);
    }
  }

  step();
}

function tweenText(node, to) {
  if (reduce) {
    node.textContent = String(to);
    return;
  }
  const from = Number(node.textContent) || 0;
  const duration = 340;
  const start = performance.now();

  function step() {
    const t = Math.min(1, (performance.now() - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    node.textContent = String(Math.round(from + (to - from) * eased));
    if (t < 1) {
      setTimeout(step, 22);
    } else {
      node.textContent = String(to);
    }
  }

  step();
}

function apply(next) {
  const clamped = Math.min(12, Math.max(2, next));
  if (clamped === servings) {
    return;
  }
  servings = clamped;
  amounts.forEach(function (node) {
    tweenAmount(node, amountFor(node, servings));
  });
  tweenText(servingsOut, servings);
  tweenText(yieldOut, servings);
  minus.disabled = servings <= 2;
  plus.disabled = servings >= 12;
}

minus.addEventListener("click", function () {
  apply(servings - 2);
});

plus.addEventListener("click", function () {
  apply(servings + 2);
});

function setStep(step, open) {
  const toggle = step.querySelector(".step__toggle");
  step.classList.toggle("is-open", open);
  toggle.setAttribute("aria-expanded", open ? "true" : "false");
}

steps.forEach(function (step) {
  const toggle = step.querySelector(".step__toggle");
  toggle.addEventListener("click", function () {
    setStep(step, !step.classList.contains("is-open"));
    syncAll();
  });

  const clamp = step.querySelector(".clamp");
  clamp.addEventListener("click", function () {
    const done = step.classList.toggle("is-done");
    clamp.setAttribute("aria-pressed", done ? "true" : "false");
  });
});

function syncAll() {
  const allOpen = steps.every(function (step) {
    return step.classList.contains("is-open");
  });
  openAll.setAttribute("aria-pressed", allOpen ? "true" : "false");
  openAll.textContent = allOpen ? "Close all" : "Open all";
}

openAll.addEventListener("click", function () {
  const allOpen = steps.every(function (step) {
    return step.classList.contains("is-open");
  });
  steps.forEach(function (step) {
    setStep(step, !allOpen);
  });
  syncAll();
});

syncAll();
