const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const cloud = document.getElementById("cloud");
const toggle = document.querySelector(".toggle");
const cycleBtns = Array.from(document.querySelectorAll(".toggle__btn"));
const prices = Array.from(document.querySelectorAll(".tier__num"));
const billed = Array.from(document.querySelectorAll(".tier__billed"));
const planBtns = Array.from(document.querySelectorAll(".tier__btn"));
const footNote = document.getElementById("footNote");
const countNodes = Array.from(document.querySelectorAll("[data-count]"));

const COPY = {
  monthly: "billed monthly",
  annual: "billed annually"
};

const NOTE = {
  monthly: "Billing renews monthly. Cancel from the console.",
  annual: "Billed once a year. Save 20% against monthly."
};

let cycle = "monthly";

function paint(node, value) {
  node.textContent = String(value);
}

function rollTo(node, to) {
  const from = Number(node.textContent) || 0;
  if (reduce || from === to) {
    paint(node, to);
    return;
  }
  node.classList.remove("is-rolling");
  void node.offsetWidth;
  node.classList.add("is-rolling");
  const began = Date.now();
  const span = 640;
  function step() {
    const t = Math.min(1, (Date.now() - began) / span);
    const eased = 1 - Math.pow(1 - t, 3);
    const wobble = Math.sin(t * Math.PI) * 2.4;
    paint(node, Math.round(from + (to - from) * eased + wobble * (1 - t)));
    if (t < 1) {
      window.setTimeout(step, 20);
    } else {
      paint(node, to);
    }
  }
  step();
}

function apply(cycleName) {
  cycle = cycleName;
  toggle.classList.toggle("is-annual", cycle === "annual");
  cycleBtns.forEach(function (btn) {
    const on = btn.dataset.cycle === cycle;
    btn.classList.toggle("is-on", on);
    btn.setAttribute("aria-pressed", on ? "true" : "false");
  });
  prices.forEach(function (node) {
    rollTo(node, Number(node.dataset[cycle]) || 0);
  });
  billed.forEach(function (node) {
    if (node.id === "billedDrift") {
      node.textContent = COPY[cycle];
    } else if (node.id === "billedCumulus") {
      node.textContent = COPY[cycle];
    } else if (cycle === "annual") {
      node.textContent = "billed monthly · save $144 a year";
    }
  });
  footNote.textContent = NOTE[cycle];
}

cycleBtns.forEach(function (btn) {
  btn.addEventListener("click", function () {
    apply(btn.dataset.cycle);
  });
});

planBtns.forEach(function (btn) {
  btn.addEventListener("click", function () {
    const name = btn.dataset.plan;
    planBtns.forEach(function (other) {
      const on = other === btn;
      other.classList.toggle("is-picked", on);
      other.setAttribute("aria-pressed", on ? "true" : "false");
    });
    footNote.textContent = name + " selected. Checkout opens with " + cycle + " billing.";
    if (!reduce) {
      footNote.classList.remove("is-flash");
      void footNote.offsetWidth;
      footNote.classList.add("is-flash");
    }
  });
});

function runCount(node) {
  const to = Number(node.dataset.count) || 0;
  if (reduce) {
    node.textContent = String(to);
    return;
  }
  const began = Date.now();
  const span = 780;
  function step() {
    const t = Math.min(1, (Date.now() - began) / span);
    node.textContent = String(Math.round(to * (1 - Math.pow(1 - t, 3))));
    if (t < 1) {
      window.setTimeout(step, 24);
    } else {
      node.textContent = String(to);
    }
  }
  step();
}

countNodes.forEach(runCount);
paint(prices[0], Number(prices[0].dataset.monthly));
paint(prices[1], Number(prices[1].dataset.monthly));
paint(prices[2], Number(prices[2].dataset.monthly));

window.setTimeout(function () {
  cloud.classList.add("is-settled");
}, 780);
