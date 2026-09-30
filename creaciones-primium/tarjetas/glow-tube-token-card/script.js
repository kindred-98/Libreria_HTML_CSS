const price = document.getElementById("gtcPrice");
const est = document.getElementById("gtcEst");
const placeBtn = document.getElementById("gtcPlace");
const stateOut = document.getElementById("gtcState");
const order = document.querySelector(".order");
const picks = Array.prototype.slice.call(document.querySelectorAll(".pick"));

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const SPOT = Number(price.dataset.count) || 1.2847;
const DEC = Number(price.dataset.dec) || 4;
const BOOK = [1.2872, 1.2809, 1.2918, 1.2831, 1.2847];

let amount = 1;
let sealed = false;
let cursor = 0;

function money(value) {
  return value.toFixed(DEC);
}

function rollPrice(target) {
  if (reduce) {
    price.textContent = money(target);
    return;
  }
  const step = 26;
  let spent = 0;
  function frame() {
    spent += step;
    const t = Math.min(1, spent / 900);
    const eased = 1 - Math.pow(1 - t, 3);
    price.textContent = money(target * eased);
    if (t < 1) {
      setTimeout(frame, step);
    } else {
      price.textContent = money(target);
    }
  }
  frame();
}

function paintAmount() {
  est.textContent = money(SPOT * amount);
  picks.forEach(function (button) {
    const on = Number(button.dataset.amt) === amount;
    button.classList.toggle("is-on", on);
    button.setAttribute("aria-pressed", on ? "true" : "false");
  });
}

function drift() {
  cursor = (cursor + 1) % BOOK.length;
  if (sealed) {
    setTimeout(drift, 3400);
    return;
  }
  rollPrice(BOOK[cursor]);
  setTimeout(drift, 4400);
}

picks.forEach(function (button) {
  button.addEventListener("click", function () {
    amount = Number(button.dataset.amt) || 1;
    paintAmount();
  });
});

placeBtn.addEventListener("click", function () {
  sealed = !sealed;
  order.classList.toggle("is-sealed", sealed);
  placeBtn.setAttribute("aria-pressed", sealed ? "true" : "false");
  stateOut.textContent = sealed
    ? "Sealed at " + money(SPOT * amount) + " USD \u00b7 hash 7f3a91c4"
    : "Book is accepting \u00b7 spread 0.0004";
});

paintAmount();
rollPrice(SPOT);
if (!reduce) {
  setTimeout(drift, 1400);
}
