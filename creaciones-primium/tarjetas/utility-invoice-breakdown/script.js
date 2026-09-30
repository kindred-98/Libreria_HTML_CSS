const total = document.getElementById("invTotal");
const figure = document.querySelector(".total__value");
const payBtn = document.getElementById("invPay");
const lines = Array.prototype.slice.call(document.querySelectorAll(".line"));

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function format(value, dec) {
  return value.toFixed(dec || 0);
}

function rollTotal(target) {
  if (reduce) {
    total.textContent = format(target, 2);
    return;
  }
  const step = 24;
  let spent = 0;
  function frame() {
    spent += step;
    const t = Math.min(1, spent / 820);
    const eased = 1 - Math.pow(1 - t, 3);
    total.textContent = format(target * eased, 2);
    if (t < 1) {
      setTimeout(frame, step);
    } else {
      total.textContent = format(target, 2);
    }
  }
  frame();
}

let scan = 0;
let lit = false;

function walk() {
  lines.forEach(function (line) {
    line.classList.remove("is-scan");
  });
  scan += 1;
  const node = lines[scan % lines.length];
  if (node) {
    node.classList.add("is-scan");
  }
  lit = !lit;
  figure.classList.toggle("is-lit", lit);
  setTimeout(walk, 2400);
}

rollTotal(Number(total.dataset.count) || 214.86);
setTimeout(walk, 2400);

payBtn.addEventListener("click", function () {
  const on = payBtn.getAttribute("aria-pressed") === "true";
  payBtn.setAttribute("aria-pressed", on ? "false" : "true");
  payBtn.textContent = on ? "Pay now" : "Payment scheduled";
});
