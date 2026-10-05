const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const card = document.getElementById("dos");
const clockValue = document.getElementById("clockValue");
const renewBtn = document.getElementById("renewBtn");
const renewText = renewBtn.querySelector(".signs__btn-text");
const figures = Array.from(document.querySelectorAll("[data-count]"));

const TOTAL = 412 * 86400 + 6 * 3600 + 14 * 60 + 52;

let remaining = TOTAL;

function pad(value) {
  return value < 10 ? "0" + value : String(value);
}

function paintClock() {
  const days = Math.floor(remaining / 86400);
  const hours = Math.floor((remaining % 86400) / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;
  clockValue.textContent =
    days + " d " + pad(hours) + ":" + pad(minutes) + ":" + pad(seconds);
}

function runCounter(node) {
  const to = Number(node.dataset.count) || 0;
  if (reduce) {
    node.textContent = String(to);
    return;
  }
  const span = 700;
  const began = Date.now();
  function frame() {
    const t = Math.min(1, (Date.now() - began) / span);
    node.textContent = String(Math.round(to * (1 - Math.pow(1 - t, 3))));
    if (t < 1) {
      window.setTimeout(frame, 24);
    } else {
      node.textContent = String(to);
    }
  }
  frame();
}

function runClock() {
  if (reduce) {
    remaining = TOTAL;
    paintClock();
    return;
  }
  const from = TOTAL + 320;
  const span = 900;
  const began = Date.now();
  function frame() {
    const t = Math.min(1, (Date.now() - began) / span);
    remaining = Math.round(from - (from - TOTAL) * (1 - Math.pow(1 - t, 3)));
    paintClock();
    if (t < 1) {
      window.setTimeout(frame, 24);
      return;
    }
    remaining = TOTAL;
    paintClock();
    window.setInterval(function () {
      remaining = Math.max(0, remaining - 1);
      paintClock();
    }, 1000);
  }
  frame();
}

renewBtn.addEventListener("click", function () {
  const queued = renewBtn.getAttribute("aria-pressed") === "true";
  renewBtn.setAttribute("aria-pressed", queued ? "false" : "true");
  renewText.textContent = queued ? "Request renewal" : "Renewal queued";
});

figures.forEach(function (node) { return runCounter(node); });
runClock();
window.setTimeout(function () {
  card.classList.add("is-settled");
}, 800);
