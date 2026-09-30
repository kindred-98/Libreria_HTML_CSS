const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const card = document.getElementById("gas");
const valueNode = card.querySelector("[data-format='one']");
const pctNode = card.querySelector("[data-format='pct']");
const delta = document.getElementById("delta");
const deltaText = document.getElementById("deltaText");
const ticket = document.getElementById("ticket");
const orderBtn = document.getElementById("orderBtn");
const orderText = orderBtn.querySelector(".ticket__go-text");
const orderStatus = document.getElementById("orderStatus");
const sideBtns = Array.from(document.querySelectorAll(".ticket__sidebtn"));

const TARGETS = [21.4, 11.2, 27.6, 16.8, 33.4, 14.1, 24.9];

let reading = 18.4;
let velocity = 0;
let target = 18.4;
let stepIndex = 0;
let filled = false;

function setNeedle(value) {
  card.style.setProperty("--a", (90 - (value / 60) * 180).toFixed(2) + "deg");
}

function percentile(value) {
  return Math.max(4, Math.min(99, Math.round(40 + value * 2.4)));
}

function settle() {
  reading = target;
  velocity = 0;
  setNeedle(reading);
  valueNode.textContent = reading.toFixed(1);
  pctNode.textContent = String(percentile(reading));
}

function swing() {
  const pull = (target - reading) * 0.055;
  velocity = (velocity + pull) * 0.82;
  reading += velocity;
  setNeedle(reading);
  valueNode.textContent = reading.toFixed(1);
  pctNode.textContent = String(percentile(reading));
  if (Math.abs(velocity) > 0.004 || Math.abs(target - reading) > 0.012) {
    window.setTimeout(swing, 18);
    return;
  }
  settle();
  window.setTimeout(retarget, 2400);
}

function retarget() {
  const from = target;
  stepIndex = (stepIndex + 1) % TARGETS.length;
  target = TARGETS[stepIndex];
  velocity += (from < target ? 1 : -1) * 1.6;
  const span = target - from;
  delta.classList.toggle("is-up", span > 0);
  deltaText.textContent =
    (span > 0 ? "+" : "-") + Math.abs(span).toFixed(1) + " gwei vs 30 blocks";
  swing();
}

function countPercentile() {
  const to = 84;
  if (reduce) {
    pctNode.textContent = String(to);
    return;
  }
  const span = 700;
  const began = Date.now();
  function frame() {
    const t = Math.min(1, (Date.now() - began) / span);
    pctNode.textContent = String(Math.round(to * (1 - Math.pow(1 - t, 3))));
    if (t < 1) {
      window.setTimeout(frame, 26);
    } else {
      pctNode.textContent = String(to);
    }
  }
  frame();
}

sideBtns.forEach(function (btn) {
  btn.addEventListener("click", function () {
    sideBtns.forEach(function (other) {
      const on = other === btn;
      other.classList.toggle("is-on", on);
      other.setAttribute("aria-pressed", on ? "true" : "false");
    });
    const side = btn.dataset.side;
    if (filled) {
      orderStatus.textContent =
        "Filled 0.42 ETH " + side + " @ 18.4 gwei · hash 0x91c4";
    } else {
      orderStatus.textContent =
        "Pending · nonce 0x" + (side === "buy" ? "4F1" : "7A2") + " · fee cap 21 gwei";
    }
  });
});

orderBtn.addEventListener("click", function () {
  filled = !filled;
  ticket.classList.toggle("is-filled", filled);
  orderBtn.setAttribute("aria-pressed", filled ? "true" : "false");
  orderText.textContent = filled ? "Order filled" : "Confirm order";
  const side = sideBtns.filter(function (btn) {
    return btn.classList.contains("is-on");
  })[0].dataset.side;
  orderStatus.textContent = filled
    ? "Filled 0.42 ETH " + side + " @ 18.4 gwei · hash 0x91c4"
    : "Pending · nonce 0x4F1 · fee cap 21 gwei";
});

setNeedle(reading);
countPercentile();
window.setTimeout(function () {
  card.classList.add("is-settled");
}, 800);
if (!reduce) {
  window.setTimeout(function () {
    velocity = 2.2;
    retarget();
  }, 700);
}
