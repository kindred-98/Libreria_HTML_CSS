const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const priceValue = document.getElementById("priceValue");
const tip = document.getElementById("tip");
const orderBox = document.getElementById("bnc").querySelector(".order");
const orderState = document.getElementById("orderState");
const orderEst = document.getElementById("orderEst");
const place = document.getElementById("place");
const picks = Array.prototype.slice.call(document.querySelectorAll(".pick"));
const spot = 67240.5;

function group(value) {
  const whole = Math.floor(value).toString();
  return whole.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function money(value) {
  const parts = value.toFixed(2).split(".");
  return group(Number(parts[0])) + "." + parts[1];
}

function paintPrice(value) {
  priceValue.textContent = money(value);
}

function countPrice() {
  const duration = 780;
  const start = Date.now();

  function step() {
    const t = Math.min(1, (Date.now() - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    paintPrice(spot * eased);
    if (t < 1) {
      setTimeout(step, 32);
    } else {
      paintPrice(spot);
    }
  }

  step();
}

if (reduce) {
  paintPrice(spot);
} else {
  paintPrice(0);
  setTimeout(countPrice, 60);
}

let height = 874212;

function groupTip() {
  return group(height);
}

function tick() {
  height += 1;
  tip.textContent = groupTip();
}

tip.textContent = groupTip();
setInterval(tick, 4200);

let amount = 0.05;

function updateEstimate() {
  orderEst.textContent = money(amount * spot);
}

picks.forEach(function (button) {
  button.addEventListener("click", function () {
    amount = Number(button.dataset.amt);
    picks.forEach(function (other) {
      other.setAttribute("aria-pressed", String(other === button));
    });
    place.textContent = "Place market buy " + button.dataset.amt;
    updateEstimate();
  });
});

let running = false;

function runOrder() {
  if (running) {
    return;
  }
  running = true;
  orderBox.classList.remove("is-done");
  orderBox.classList.add("is-run");
  orderState.textContent = "Broadcasting to the mempool...";
  setTimeout(function () {
    orderBox.classList.remove("is-run");
    orderBox.classList.add("is-done");
    orderState.textContent =
      "Confirmed in block " + groupTip() + " \u00b7 tx 0x8a3f1c0b \u00b7 " + amount.toFixed(2) + " BTC";
    running = false;
  }, 700);
}

place.addEventListener("click", runOrder);

updateEstimate();
setTimeout(runOrder, 1300);
