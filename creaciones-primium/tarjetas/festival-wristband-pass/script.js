const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const card = document.getElementById("fwp");
const wrist = document.getElementById("fwpWrist");
const stateOut = document.getElementById("fwpState");
const codeOut = document.getElementById("fwpCode");
const entryOut = document.getElementById("fwpEntry");
const progress = document.getElementById("fwpProgress");
const clockOut = document.getElementById("fwpClock");
const rows = Array.from(document.querySelectorAll(".fwp__row"));
const turnBtn = document.getElementById("fwpTurn");
const reprintBtn = document.getElementById("fwpReprint");

const STATES = [
  "Reading holder",
  "Checking tier",
  "Decoding wristband",
  "Verifying entry",
  "Access granted"
];

const CODE_CHARS = "0123456789";

let step = 0;
let phase = 0;
let onSite = 1 * 3600 + 24 * 60 + 7;

function paintProgress(value) {
  progress.style.setProperty("--p", value.toFixed(3));
}

function lightRow(index) {
  rows.forEach(function (row, i) {
    row.classList.toggle("is-lit", i === index);
  });
}

function clearRows() {
  rows.forEach(function (row) {
    row.classList.remove("is-lit");
  });
}

function advance() {
  phase += 1;
  if (phase >= 16) {
    phase = 0;
  }
  const slot = Math.min(3, Math.floor(phase / 4));
  if (phase % 4 === 0) {
    step = slot;
    stateOut.textContent = STATES[slot];
    lightRow(slot);
  }
  if (phase === 15) {
    clearRows();
  }
  paintProgress(Math.min(1, phase / 16));
}

function buildCode() {
  let digits = "";
  for (let i = 0; i < 5; i += 1) {
    digits += CODE_CHARS[Math.floor(Math.random() * 10)];
  }
  return "SF24-" + digits;
}

function scramble() {
  if (reduce) {
    return;
  }
  const settled = buildCode();
  let ticks = 7;
  function frame() {
    codeOut.textContent = buildCode();
    ticks -= 1;
    if (ticks > 0) {
      window.setTimeout(frame, 58);
    } else {
      codeOut.textContent = settled;
    }
  }
  frame();
}

turnBtn.addEventListener("click", function () {
  wrist.classList.remove("is-spin");
  wrist.getBoundingClientRect();
  wrist.classList.add("is-spin");
  window.setTimeout(function () {
    wrist.classList.remove("is-spin");
  }, 1000);
});

reprintBtn.addEventListener("click", function () {
  scramble();
  entryOut.textContent = "Gate B / " + (10 + Math.floor(Math.random() * 9)) + ":" + (10 + Math.floor(Math.random() * 49));
  stateOut.textContent = "Reprinting";
  clearRows();
  phase = 0;
  step = 0;
  paintProgress(0.04);
});

if (!reduce) {
  stateOut.textContent = STATES[0];
  paintProgress(0.08);
  window.setTimeout(function () {
    window.setInterval(advance, 380);
  }, 600);

  window.setTimeout(function () {
    window.setInterval(function () {
      onSite += 1;
      const hh = Math.floor(onSite / 3600);
      const mm = Math.floor((onSite % 3600) / 60);
      const ss = onSite % 60;
      clockOut.textContent = (hh < 10 ? "0" : "") + hh + ":" + (mm < 10 ? "0" : "") + mm + ":" + (ss < 10 ? "0" : "") + ss;
    }, 1000);
  }, 700);
}

window.setTimeout(function () {
  card.classList.add("is-settled");
}, 780);