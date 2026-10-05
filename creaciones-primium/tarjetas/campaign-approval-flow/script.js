const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const card = document.getElementById("caf");
const countOut = document.getElementById("cafCount");
const daysOut = document.getElementById("cafDays");
const budgetOut = document.getElementById("cafBudget");
const stateOut = document.getElementById("cafState");
const fill = document.getElementById("cafFill");
const nextBtn = document.getElementById("cafNext");
const resetBtn = document.getElementById("cafReset");
const steps = Array.from(document.querySelectorAll(".caf__step"));

const TOTAL = steps.length;
const DAYS = [4.35, 3.48, 2.61, 1.74, 0.87, 0];
const BUDGET = [0, 8, 18, 28, 38, 48];

let approved = 3;
let axis = 3 / TOTAL;
let timer = null;

function countTo(node, from, to, span, decimals) {
  if (reduce) {
    node.textContent = to.toFixed(decimals);
    return;
  }
  const began = Date.now();
  function frame() {
    const t = Math.min(1, (Date.now() - began) / span);
    const eased = 1 - Math.pow(1 - t, 3);
    node.textContent = (from + (to - from) * eased).toFixed(decimals);
    if (t < 1) {
      window.setTimeout(frame, 24);
    } else {
      node.textContent = to.toFixed(decimals);
    }
  }
  frame();
}

function moveAxis(next) {
  fill.style.setProperty("--pf", axis.toFixed(3));
  fill.style.setProperty("--f", next.toFixed(3));
  axis = next;
  if (reduce) {
    return;
  }
  fill.classList.remove("is-growing");
  fill.getBoundingClientRect();
  fill.classList.add("is-growing");
  window.setTimeout(function () {
    fill.classList.remove("is-growing");
  }, 600);
}

function paintNumbers(previous) {
  countTo(countOut, previous, approved, 460, 0);
  countTo(daysOut, DAYS[previous], DAYS[approved], 520, 1);
  countTo(budgetOut, BUDGET[previous], BUDGET[approved], 520, 0);
}

function paintState() {
  const done = approved >= TOTAL;
  stateOut.classList.toggle("is-done", done);
  stateOut.lastChild.textContent = done ? "Approved" : "In review";
}

function apply(next, animate) {
  const previous = approved;
  approved = Math.max(0, Math.min(TOTAL, next));
  steps.forEach(function (step, i) {
    const on = i < approved;
    step.classList.toggle("is-approved", on);
    step.querySelector(".caf__chip").classList.toggle("is-on", on);
    step.querySelector(".caf__chip").textContent = on ? "Signed" : "Queued";
  });
  moveAxis(approved / TOTAL);
  if (animate) {
    paintNumbers(previous);
  }
  paintState();
  nextBtn.disabled = approved >= TOTAL;
}

function approveNext() {
  if (approved >= TOTAL) {
    return;
  }
  apply(approved + 1, true);
}

function resetChain() {
  apply(0, true);
}

nextBtn.addEventListener("click", function () {
  approveNext();
});

resetBtn.addEventListener("click", function () {
  resetChain();
});

if (!reduce) {
  window.setTimeout(function () {
    timer = window.setInterval(function () {
      if (approved >= TOTAL) {
        return;
      }
      approveNext();
      if (approved >= TOTAL) {
        window.clearInterval(timer);
        window.setTimeout(function () {
          resetChain();
          timer = window.setInterval(function () {
            if (approved >= TOTAL) {
              window.clearInterval(timer);
              return;
            }
            approveNext();
          }, 1700);
        }, 4600);
      }
    }, 1700);
  }, 1400);
}

apply(approved, false);
countOut.textContent = String(approved);
daysOut.textContent = DAYS[approved].toFixed(1);
budgetOut.textContent = String(BUDGET[approved]);

window.setTimeout(function () {
  card.classList.add("is-settled");
}, 820);