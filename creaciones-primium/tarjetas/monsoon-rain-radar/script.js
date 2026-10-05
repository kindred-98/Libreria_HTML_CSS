const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const card = document.getElementById("radar");
const feed = document.getElementById("feed");
const cellsBox = document.getElementById("cells");
const dropsBox = document.getElementById("drops");
const range = document.getElementById("expoRange");
const expoOut = document.getElementById("expoValue");
const modes = Array.from(document.querySelectorAll(".mode"));
const warn = document.getElementById("warn");
const warnBtn = document.getElementById("warnBtn");
const counts = Array.from(document.querySelectorAll("[data-count]"));

const CELLS = [
  { x: 24, y: 34, w: 27, h: 24, c: "rgba(109,255,156,0.62)", d: "0s" },
  { x: 54, y: 22, w: 20, h: 19, c: "rgba(244,242,106,0.66)", d: "1.4s" },
  { x: 68, y: 52, w: 25, h: 27, c: "rgba(224,138,31,0.68)", d: "2.6s" },
  { x: 33, y: 62, w: 17, h: 16, c: "rgba(126,240,208,0.55)", d: "3.6s" },
  { x: 78, y: 30, w: 14, h: 14, c: "rgba(224,50,111,0.6)", d: "4.8s" },
  { x: 12, y: 58, w: 13, h: 12, c: "rgba(109,255,156,0.42)", d: "5.6s" }
];

const DROP_COUNT = 30;

function buildCells() {
  CELLS.forEach(function (cell) {
    const node = document.createElement("span");
    node.style.left = cell.x + "%";
    node.style.top = cell.y + "%";
    node.style.width = cell.w + "%";
    node.style.height = cell.h + "%";
    node.style.background =
      "radial-gradient(closest-side, " + cell.c + " 0%, " + cell.c.replace(/[\d.]+\)$/, "0.18)") +
      " 48%, " + cell.c.replace(/[\d.]+\)$/, "0)") + " 100%)";
    node.style.animationDelay = cell.d;
    cellsBox.appendChild(node);
  });
}

function buildDrops() {
  for (let k = 0; k < DROP_COUNT; k += 1) {
    const node = document.createElement("i");
    node.style.left = (4 + ((k * 37) % 92)) + "%";
    node.style.setProperty("--dur", (0.72 + ((k % 7) * 0.13)).toFixed(2) + "s");
    node.style.setProperty("--del", (((k * 17) % 90) / 100).toFixed(2) + "s");
    node.style.opacity = (0.4 + ((k % 5) * 0.12)).toFixed(2);
    dropsBox.appendChild(node);
  }
}

const PRESET = {
  rain: { contrast: 1.3, bright: 1.05, label: "Rain" },
  wind: { contrast: 1.5, bright: 1.16, label: "Wind" },
  temp: { contrast: 0.94, bright: 0.9, label: "Temp" }
};

let mode = "rain";

function applyExpo() {
  const raw = Number(range.value) || 0;
  const factor = raw / 52;
  const preset = PRESET[mode];
  const contrast = preset.contrast * (0.62 + 0.5 * factor);
  const bright = preset.bright * (0.72 + 0.36 * factor);
  feed.style.setProperty("--expo", contrast.toFixed(3));
  feed.style.setProperty("--expo-b", bright.toFixed(3));
  const ev = ((factor - 1) * 2).toFixed(1);
  expoOut.textContent = (Number(ev) >= 0 ? "+" : "") + ev + " EV";
}

range.addEventListener("input", applyExpo);

modes.forEach(function (btn) {
  btn.addEventListener("click", function () {
    mode = btn.dataset.mode;
    modes.forEach(function (other) {
      const on = other === btn;
      other.classList.toggle("is-on", on);
      other.setAttribute("aria-pressed", on ? "true" : "false");
    });
    applyExpo();
  });
});

warnBtn.addEventListener("click", function () {
  const on = warnBtn.getAttribute("aria-pressed") === "true";
  warnBtn.setAttribute("aria-pressed", on ? "false" : "true");
  warnBtn.textContent = on ? "Pin the cell" : "Cell pinned";
  warn.classList.toggle("is-off", on);
  warn.querySelector(".warn__text").innerHTML = on
    ? "<b>Heavy rain cell</b> tracking east at 22 km/h, reaches the valley by 15:20."
    : "<b>Cell C-14 pinned.</b> Autosweep holds it centred until 16:00.";
});

function runCount(node) {
  const to = Number(node.dataset.count) || 0;
  if (reduce) {
    node.textContent = String(to);
    return;
  }
  const began = Date.now();
  const span = 760;
  function step() {
    const t = Math.min(1, (Date.now() - began) / span);
    node.textContent = String(Math.round(to * (1 - Math.pow(1 - t, 3))));
    if (t < 1) {
      window.setTimeout(step, 24);
    } else {
      node.textContent = String(to);
    }
  }
  step();
}

buildCells();
buildDrops();
applyExpo();
counts.forEach((...args) => runCount(...args));

window.setTimeout(function () {
  card.classList.add("is-settled");
}, 780);
