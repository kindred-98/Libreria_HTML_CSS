const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const route = document.getElementById("camRoute");
const odo = document.querySelector("[data-odo]");
const fill = document.getElementById("camFill");
const statusEl = document.getElementById("camStatus");
const logBtn = document.getElementById("camLog");
const nextBtn = document.getElementById("camNext");

const stages = Array.from(route.querySelectorAll(".cam__stage"));
const TOTAL = 114.0;

function fmt(value) {
  return value.toFixed(1);
}

function sumTo(index) {
  return stages.slice(0, index + 1).reduce(function (sum, el) {
    return sum + Number(el.dataset.km);
  }, 0);
}

function paintRail(km) {
  const ratio = Math.max(0, Math.min(1, km / TOTAL));
  fill.style.transform = "scaleX(" + ratio + ")";
  route.style.setProperty("--fill", String(ratio));
}

function roll(node, to, duration, delay) {
  if (reduce) {
    node.textContent = fmt(to);
    return;
  }
  window.setTimeout(function () {
    const t0 = performance.now();
    const step = function () {
      const t = Math.min(1, (performance.now() - t0) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      node.textContent = fmt(to * eased);
      if (t < 1) {
        window.setTimeout(step, 24);
      }
    };
    step();
  }, delay);
}

let currentIndex = stages.findIndex(function (el) {
  return el.classList.contains("is-current");
});
if (currentIndex < 0) {
  currentIndex = 0;
}
let logged = false;

function stampFor(el, state) {
  const node = el.querySelector(".cam__stamp");
  if (!node) {
    return;
  }
  if (state === "done") {
    node.textContent = "Stamped";
  } else if (state === "current") {
    node.textContent = logged ? "Filed today" : "Open leg";
  } else {
    node.textContent = "Ahead";
  }
}

function describe() {
  const el = stages[currentIndex];
  const day = el.dataset.day.toLowerCase();
  status.textContent = logged
    ? "Stage " + el.dataset.place + " filed · bookshop keeps the slip"
    : "Current stage " + el.dataset.place + " · " + day + " of 7";
  const done = currentIndex >= stages.length - 1;
  nextBtn.textContent = done ? "Credencial complete" : "Stamp next stage";
  nextBtn.disabled = done;
}

function advance() {
  if (currentIndex >= stages.length - 1) {
    return;
  }
  const left = stages[currentIndex];
  left.classList.remove("is-current", "is-logged", "is-ahead");
  left.classList.add("is-done");
  stampFor(left, "done");
  currentIndex += 1;
  const el = stages[currentIndex];
  el.classList.remove("is-ahead", "is-done");
  el.classList.add("is-current");
  logged = false;
  logBtn.classList.remove("is-logged");
  logBtn.setAttribute("aria-pressed", "false");
  logBtn.textContent = "Log the day";
  stampFor(el, "current");
  const walked = sumTo(currentIndex);
  paintRail(walked);
  roll(odo, walked, 620, 0);
  describe();
}

nextBtn.addEventListener("click", advance);

logBtn.addEventListener("click", function () {
  logged = !logged;
  logBtn.classList.toggle("is-logged", logged);
  logBtn.setAttribute("aria-pressed", logged ? "true" : "false");
  logBtn.textContent = logged ? "Day filed" : "Log the day";
  stages[currentIndex].classList.toggle("is-logged", logged);
  stampFor(stages[currentIndex], "current");
  describe();
});

paintRail(sumTo(currentIndex));
roll(odo, sumTo(currentIndex), 700, 130);
describe();
