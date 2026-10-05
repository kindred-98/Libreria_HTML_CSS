const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const track = document.getElementById("switch");
const buttons = Array.prototype.slice.call(document.querySelectorAll(".switch__btn"));
const numbers = Array.prototype.slice.call(document.querySelectorAll(".plan__num"));
const periods = [document.getElementById("per0"), document.getElementById("per1"), document.getElementById("per2")];
const periodWord = document.getElementById("periodWord");

const MONTH_TEXT = "per month \u00b7 billed monthly";
const YEAR_TEXT = "per year \u00b7 two months free";

let period = "month";

function paintNumbers(targets) {
  numbers.forEach(function (node, index) {
    const from = Number(node.textContent) || 0;
    const to = targets[index];
    if (reduce || from === to) {
      node.textContent = String(to);
      return;
    }
    const duration = 420;
    const start = Date.now();

    function step() {
      const t = Math.min(1, (Date.now() - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      node.textContent = String(Math.round(from + (to - from) * eased));
      if (t < 1) {
        setTimeout(step, 28);
      } else {
        node.textContent = String(to);
      }
    }

    step();
  });
}

function apply(next) {
  if (next === period) {
    return;
  }
  period = next;
  track.classList.toggle("is-year", period === "year");
  buttons.forEach(function (button) {
    button.setAttribute("aria-pressed", String(button.dataset.period === period));
  });
  const targets = numbers.map(function (node) {
    return Number(period === "month" ? node.dataset.m : node.dataset.y);
  });
  periods.forEach(function (node) {
    node.textContent = period === "month" ? MONTH_TEXT : YEAR_TEXT;
  });
  periodWord.textContent = period === "month" ? "monthly billing" : "annual billing, saving 17%";
  paintNumbers(targets);
}

buttons.forEach(function (button) {
  button.addEventListener("click", function () {
    apply(button.dataset.period);
  });
});

Array.prototype.forEach.call(document.querySelectorAll(".plan__cta"), function (button) {
  button.addEventListener("click", function () {
    const on = button.getAttribute("aria-pressed") === "true";
    Array.prototype.forEach.call(document.querySelectorAll(".plan__cta"), function (other) {
      other.setAttribute("aria-pressed", "false");
      if (other !== button && !on) {
        other.textContent = other.textContent.replaceAll('Held \u00b7 ', "");
      }
    });
    button.setAttribute("aria-pressed", on ? "false" : "true");
    if (on) {
      button.textContent = button.textContent.replaceAll('Held \u00b7 ', "");
    } else {
      button.textContent = "Held \u00b7 " + button.textContent.replaceAll('Held \u00b7 ', "");
    }
  });
});

setTimeout(function () {
  apply("year");
}, 900);

setTimeout(function () {
  apply("month");
}, 1600);
