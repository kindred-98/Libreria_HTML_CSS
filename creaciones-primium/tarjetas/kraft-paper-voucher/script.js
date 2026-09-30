const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const stage = document.querySelector(".stage");
const voucher = document.getElementById("voucher");
const ticks = Array.from(document.querySelectorAll(".tick"));
const redeemBtn = document.getElementById("redeemBtn");
const tearBtn = document.getElementById("tearBtn");
const codeOut = document.getElementById("stubCode");
const redeemText = redeemBtn.querySelector(".btn__text");
const tearText = tearBtn.querySelector(".btn__text");

let settled = reduce;

function inked(node, on) {
  node.classList.toggle("is-on", on);
  node.setAttribute("aria-pressed", on ? "true" : "false");
}

function autoInk() {
  if (settled) {
    return;
  }
  window.setTimeout(function () {
    if (!settled) {
      inked(ticks[2], true);
    }
  }, 240);
  window.setTimeout(function () {
    if (!settled) {
      inked(ticks[3], true);
    }
  }, 470);
}

ticks.forEach(function (node) {
  node.addEventListener("click", function () {
    settled = true;
    inked(node, !node.classList.contains("is-on"));
  });
});

redeemBtn.addEventListener("click", function () {
  settled = true;
  const spent = voucher.classList.toggle("is-redeemed");
  redeemBtn.setAttribute("aria-pressed", spent ? "true" : "false");
  redeemText.textContent = spent ? "Redeemed 14 Sep" : "Redeem at counter";
  codeOut.textContent = spent ? "HR-4482-B SPENT" : "HR-4482-B";
});

tearBtn.addEventListener("click", function () {
  const torn = voucher.classList.toggle("is-torn");
  tearBtn.setAttribute("aria-pressed", torn ? "true" : "false");
  tearText.textContent = torn ? "Stub removed" : "Tear off stub";
});

window.setTimeout(autoInk, 140);
window.setTimeout(function () {
  stage.classList.add("is-settled");
}, 700);
