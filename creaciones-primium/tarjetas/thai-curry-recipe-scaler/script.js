const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const card = document.getElementById("ths");
const servingsOut = document.getElementById("thsServings");
const yieldOut = document.getElementById("thsYield");
const ratioOut = document.getElementById("thsRatio");
const indexOut = document.getElementById("thsIndex");
const clockOut = document.getElementById("thsClock");
const heatBar = document.getElementById("thsHeatBar");
const minusBtn = document.getElementById("thsMinus");
const plusBtn = document.getElementById("thsPlus");
const openAllBtn = document.getElementById("thsOpenAll");
const printBtn = document.getElementById("thsPrint");
const amounts = Array.from(document.querySelectorAll(".ths__qty"));
const heatBtns = Array.from(document.querySelectorAll(".ths__heat-btn"));
const stepBlocks = Array.from(document.querySelectorAll(".ths__step"));

const BASE_SERVINGS = 4;
const SPICE = { 1: 2.4, 2: 6.4, 3: 9.8 };
const SPICE_TEXT = { 1: "Mild", 2: "Medium", 3: "Hot" };
const HEAT_WIDTH = { 1: 0.28, 2: 0.6, 3: 0.94 };

let servings = BASE_SERVINGS;
let heat = 2;
let spice = 6.4;
let printed = false;

function countTo(node, from, to, span) {
  if (reduce) {
    node.textContent = to.toFixed(1);
    return;
  }
  const began = Date.now();
  function frame() {
    const t = Math.min(1, (Date.now() - began) / span);
    const eased = 1 - Math.pow(1 - t, 3);
    node.textContent = (from + (to - from) * eased).toFixed(1);
    if (t < 1) {
      window.setTimeout(frame, 24);
    }
  }
  frame();
}

function paintAmounts() {
  amounts.forEach(function (node) {
    const base = Number(node.dataset.base) || 0;
    const stepSize = Number(node.dataset.round) || 1;
    const raw = (base * servings) / BASE_SERVINGS;
    const snapped = Math.max(stepSize, Math.round(raw / stepSize) * stepSize);
    node.textContent = String(snapped);
  });
  servingsOut.textContent = String(servings);
  yieldOut.textContent = String(servings);
  const ratio = servings / BASE_SERVINGS;
  ratioOut.textContent = ratio === 1 ? "base 4 bowls" : ratio.toFixed(2).replace(/0$/, "") + "x base";
}

function setHeat(next) {
  heat = next;
  card.dataset.heat = String(heat);
  heatBar.style.setProperty("--w", String(HEAT_WIDTH[heat]));
  heatBtns.forEach(function (btn) {
    const on = Number(btn.dataset.heat) === heat;
    btn.classList.toggle("is-on", on);
    btn.setAttribute("aria-pressed", on ? "true" : "false");
  });
  const target = SPICE[heat];
  const from = spice;
  spice = target;
  indexOut.textContent = target.toFixed(1);
  window.setTimeout(function () {
    countTo(indexOut, from, target, 620);
  }, 40);
}

function clampServings(next) {
  return Math.min(12, Math.max(1, next));
}

minusBtn.addEventListener("click", function () {
  servings = clampServings(servings - 1);
  paintAmounts();
});

plusBtn.addEventListener("click", function () {
  servings = clampServings(servings + 1);
  paintAmounts();
});

heatBtns.forEach(function (btn) {
  btn.addEventListener("click", function () {
    setHeat(Number(btn.dataset.heat));
  });
});

stepBlocks.forEach(function (block) {
  const toggle = block.querySelector(".ths__step-btn");
  toggle.addEventListener("click", function () {
    const open = !block.classList.contains("is-open");
    block.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
});

openAllBtn.addEventListener("click", function () {
  const open = openAllBtn.getAttribute("aria-pressed") !== "true";
  openAllBtn.setAttribute("aria-pressed", open ? "true" : "false");
  openAllBtn.textContent = open ? "Fold all" : "Unfold all";
  stepBlocks.forEach(function (block) {
    block.classList.toggle("is-open", open);
    block.querySelector(".ths__step-btn").setAttribute("aria-expanded", open ? "true" : "false");
  });
});

printBtn.addEventListener("click", function () {
  printed = !printed;
  printBtn.classList.toggle("is-done", printed);
  printBtn.textContent = printed ? "Card queued" : "Print card";
});

let remaining = 2 * 3600 + 10 * 60;

function pad(value) {
  return value < 10 ? "0" + value : String(value);
}

function paintClock() {
  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;
  clockOut.textContent = pad(hours) + ":" + pad(minutes) + ":" + pad(seconds);
}

if (reduce) {
  remaining = 2 * 3600 + 10 * 60;
  paintClock();
} else {
  window.setTimeout(function () {
    window.setInterval(function () {
      if (remaining <= 0) {
        remaining = 2 * 3600 + 10 * 60;
      } else {
        remaining -= 1;
      }
      paintClock();
    }, 1000);
  }, 900);
}

paintAmounts();

window.setTimeout(function () {
  card.classList.add("is-settled");
}, 760);