const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const billing = document.getElementById("billing");
const labMonthly = document.getElementById("labMonthly");
const labYearly = document.getElementById("labYearly");
const nums = Array.from(document.querySelectorAll(".plan__num"));
const notes = Array.from(document.querySelectorAll(".plan__note"));
const timers = new WeakMap();

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function countTo(node, target) {
  const running = timers.get(node);
  if (running) {
    window.clearInterval(running);
  }
  if (reduce) {
    node.textContent = String(target);
    return;
  }
  const from = Number(node.textContent.replace(/[^\d-]/g, "")) || 0;
  const duration = 520;
  const started = Date.now();
  const step = function () {
    const p = Math.min(1, (Date.now() - started) / duration);
    const value = Math.round(from + (target - from) * easeOutCubic(p));
    node.textContent = String(value);
    if (p >= 1) {
      window.clearInterval(timers.get(node));
      timers.set(node, 0);
      node.textContent = String(target);
    }
  };
  timers.set(node, window.setInterval(step, 28));
  step();
}

function applyCycle(yearly) {
  billing.setAttribute("aria-checked", yearly ? "true" : "false");
  labMonthly.classList.toggle("is-on", !yearly);
  labYearly.classList.toggle("is-on", yearly);

  nums.forEach(function (node) {
    const value = Number(yearly ? node.dataset.y : node.dataset.m);
    countTo(node, value);
  });

  notes.forEach(function (node) {
    node.textContent = yearly ? node.dataset.noteY : node.dataset.noteM;
  });
}

billing.addEventListener("click", function () {
  applyCycle(billing.getAttribute("aria-checked") !== "true");
});

const choose = document.getElementById("choose");
choose.addEventListener("click", function () {
  const on = choose.getAttribute("aria-pressed") === "true";
  choose.setAttribute("aria-pressed", on ? "false" : "true");
  choose.textContent = on ? "Choose Indie" : "Indie selected";
});
