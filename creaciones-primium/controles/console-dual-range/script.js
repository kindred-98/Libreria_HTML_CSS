const track = document.querySelector("#track");
const lo = document.querySelector("#lo");
const hi = document.querySelector("#hi");
const capLo = document.querySelector(".cap--lo");
const capHi = document.querySelector(".cap--hi");
const valLo = document.querySelector("#valLo");
const valSpan = document.querySelector("#valSpan");
const valHi = document.querySelector("#valHi");
const logBox = document.querySelector("#log");
const modeOut = document.querySelector("#mode");
const stick = document.querySelector("#stick");
const markLo = document.querySelector(".scope__mark--lo");
const markHi = document.querySelector(".scope__mark--hi");
const scopeSpan = document.querySelector("#scopeSpan");
const lampTight = document.querySelectorAll(".lamp")[0];
const lampWide = document.querySelectorAll(".lamp")[1];
const lampLock = document.querySelectorAll(".lamp")[2];

if (track && lo && hi) {
  const pad = (n) => String(n).padStart(3, "0");
  const MAX = Number(lo.max || 100);
  const KEEP = 7;
  let pending = 0;
  let flushTimer = 0;

  const write = (tag, message, boot) => {
    if (!logBox) return;
    const line = document.createElement("p");
    if (boot) line.className = "is-boot";
    const mark = document.createElement("i");
    mark.textContent = tag;
    const body = document.createElement("b");
    body.textContent = message;
    line.append(mark, body);
    logBox.append(line);
    while (logBox.childElementCount > KEEP) logBox.firstElementChild.remove();
  };

  const flush = () => {
    flushTimer = 0;
    if (!pending) return;
    const a = Number(lo.value);
    const b = Number(hi.value);
    const who = pending === 1 ? "lo" : "hi";
    pending = 0;
    write(who, `low ${pad(a)}  high ${pad(b)}  span ${pad(b - a)}`);
  };

  const say = (which) => {
    if (flushTimer) clearTimeout(flushTimer);
    pending = which;
    flushTimer = window.setTimeout(flush, 520);
  };

  const settle = (which) => {
    if (flushTimer) clearTimeout(flushTimer);
    flushTimer = 0;
    flush();
    if (modeOut) modeOut.textContent = which === 1 ? "low bound set" : "high bound set";
  };

  const paint = (who) => {
    let a = Number(lo.value);
    let b = Number(hi.value);
    if (a > b) {
      if (who === 1) {
        b = a;
        hi.value = String(b);
      } else {
        a = b;
        lo.value = String(a);
      }
    }
    a = Math.max(0, Math.min(MAX, a));
    b = Math.max(0, Math.min(MAX, b));
    track.style.setProperty("--lop", (a / MAX) * 100 + "%");
    track.style.setProperty("--hip", (b / MAX) * 100 + "%");
    if (capLo) capLo.style.setProperty("--p", String(a / MAX));
    if (capHi) capHi.style.setProperty("--p", String(b / MAX));
    if (valLo) valLo.textContent = pad(a);
    if (valHi) valHi.textContent = pad(b);
    if (valSpan) valSpan.textContent = pad(b - a);
    if (scopeSpan) scopeSpan.textContent = pad(b - a);
    if (markLo) markLo.style.setProperty("--p", String(a / MAX));
    if (markHi) markHi.style.setProperty("--p", String(b / MAX));
    const span = b - a;
    lampTight?.classList.toggle("is-on", span <= 12);
    lampWide?.classList.toggle("is-on", span >= 78);
    lampLock?.classList.toggle("is-on", span === 0);
    if (stick) stick.style.setProperty("--tilt", (((a + b) / 2 - MAX / 2) / (MAX / 2)) * 24 + "deg");
  };

  write("sys", "window desk ready, two handles armed", true);
  write("sys", `scale 000 to ${MAX}, step 01`, true);
  write("win", `low ${pad(Number(lo.value))}  high ${pad(Number(hi.value))}`, true);
  paint(0);

  lo.addEventListener("input", () => {
    paint(1);
    if (modeOut) modeOut.textContent = "moving low";
    say(1);
  });
  hi.addEventListener("input", () => {
    paint(2);
    if (modeOut) modeOut.textContent = "moving high";
    say(2);
  });
  lo.addEventListener("change", () => {
    paint(1);
    settle(1);
  });
  hi.addEventListener("change", () => {
    paint(2);
    settle(2);
  });
  lo.addEventListener("focus", () => {
    if (modeOut) modeOut.textContent = "low bound armed";
  });
  hi.addEventListener("focus", () => {
    if (modeOut) modeOut.textContent = "high bound armed";
  });
}
