const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const card = document.getElementById("btg");
const inner = document.getElementById("btgInner");
const serialOut = document.getElementById("btgSerial");
const clockOut = document.getElementById("btgClock");
const flipBtn = document.getElementById("btgFlip");
const checkBtns = Array.from(document.querySelectorAll(".btg__check-btn"));

const ALPHABET = "0123456789";

function buildSerial() {
  let out = "";
  for (let i = 0; i < 10; i += 1) {
    if (i === 4 || i === 8) {
      out += " ";
    }
    out += ALPHABET[Math.floor(Math.random() * 10)];
  }
  return out;
}

function settleSerial(final) {
  serialOut.textContent = final;
}

function scrambleSerial(final, bump) {
  if (reduce) {
    settleSerial(final);
    return;
  }
  if (bump) {
    printCount += 1;
    if (printCount > 6) {
      printCount = 2;
    }
    printOut.textContent = printCount + " of 6";
    seqOut.textContent = "SEQ " + (40 + printCount) + " / " + (188 + printCount);
  }
  let ticks = 9;
  function step() {
    serialOut.textContent = buildSerial();
    ticks -= 1;
    if (ticks > 0) {
      window.setTimeout(step, 62);
    } else {
      settleSerial(final);
      window.setTimeout(function () {
        serial.classList.remove("is-printing");
      }, 240);
    }
  }
  serial.classList.remove("is-printing");
  serial.getBoundingClientRect();
  serial.classList.add("is-printing");
  step();
}

const serial = serialOut;
const PRINTED = serialOut.textContent.trim();
const seqOut = document.getElementById("btgSeq");
const printOut = document.getElementById("btgPrint");
let printCount = 4;

function setFace(face) {
  inner.classList.remove("is-turned", "is-returning");
  inner.getBoundingClientRect();
  inner.classList.add(face === "back" ? "is-turned" : "is-returning");
  card.dataset.face = face;
  flipBtn.setAttribute("aria-pressed", face === "back" ? "true" : "false");
  flipBtn.textContent = face === "back" ? "Show route" : "Flip tag";
  if (face === "front") {
    window.setTimeout(function () {
      inner.classList.remove("is-returning");
    }, 700);
  }
}

flipBtn.addEventListener("click", function () {
  setFace(card.dataset.face === "back" ? "front" : "back");
});

checkBtns.forEach(function (btn) {
  btn.addEventListener("click", function () {
    const done = btn.getAttribute("aria-pressed") !== "true";
    btn.setAttribute("aria-pressed", done ? "true" : "false");
    btn.classList.toggle("is-done", done);
  });
});

let remaining = 41 * 60 + 16;

function pad(value) {
  return value < 10 ? "0" + value : String(value);
}

function paintClock() {
  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;
  clockOut.textContent = pad(hours) + ":" + pad(minutes) + ":" + pad(seconds);
}

if (!reduce) {
  window.setTimeout(function () {
    window.setInterval(function () {
      remaining -= 1;
      if (remaining <= 0) {
        remaining = 60 * 60;
      }
      paintClock();
    }, 1000);
  }, 800);

  window.setTimeout(function () {
    scrambleSerial(PRINTED, false);
  }, 320);

  window.setTimeout(function () {
    window.setInterval(function () {
      scrambleSerial(buildSerial(), true);
    }, 3400);
  }, 1500);
}

window.setTimeout(function () {
  card.classList.add("is-settled");
}, 800);