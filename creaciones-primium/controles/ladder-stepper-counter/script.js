const input = document.querySelector("#count");
const plus = document.querySelector("#plus");
const minus = document.querySelector("#minus");
const unitBox = document.querySelector("#unit");
const ladder = document.querySelector("#ladder");
const unitTag = document.querySelector("#unitTag");
const ledRun = document.querySelector("#ledRun");
const ledLimit = document.querySelector("#ledLimit");
const strips = [...document.querySelectorAll(".strip")];

if (input && plus && minus && strips.length === 3) {
  const MIN = Number(input.min || 0);
  const MAX = Number(input.max || 999);
  const CARRY = [140, 70, 0];
  const cells = 20;
  const settles = new Map();
  const clamp = (n) => Math.max(MIN, Math.min(MAX, Math.round(n)));

  let runTimer = null;
  let holdDelay = null;
  let holdRepeat = null;

  const moveTo = (strip, cell) => {
    const offset = ((-cell * 100) / cells).toFixed(4);
    strip.style.transform = `translate3d(0, ${offset}%, 0)`;
  };

  const carry = (strip, digit, delta, delay) => {
    strip.style.transition = "none";
    moveTo(strip, 0);
    strip.dataset.pos = "0";
    strip.dataset.d = String(digit);
    void strip.offsetHeight;
    strip.style.transition = "";
    strip.style.transitionDelay = `${delay}ms`;
    moveTo(strip, delta);
    strip.dataset.pos = String(delta);
    settles.delete(strip);
  };

  const roll = (strip, digit, delay) => {
    const shown = Number(strip.dataset.d || 0);
    if (shown === digit) return;
    const delta = (digit - shown + 10) % 10;
    const pos = Number(strip.dataset.pos || 0);
    const pending = settles.get(strip);

    if (pending) {
      clearTimeout(pending);
      settles.delete(strip);
    }

    if (pos + delta > cells - 1) {
      if (pos < cells - 1) {
        strip.style.transitionDelay = `${delay}ms`;
        moveTo(strip, cells - 1);
        settles.set(strip, window.setTimeout(() => carry(strip, digit, delta, delay), 540 + delay));
        return;
      }
      carry(strip, digit, delta, delay);
      return;
    }

    strip.dataset.d = String(digit);
    strip.dataset.pos = String(pos + delta);
    strip.style.transitionDelay = `${delay}ms`;
    moveTo(strip, pos + delta);
  };

  const flashRun = () => {
    if (!ledRun) return;
    ledRun.classList.add("is-lit");
    if (runTimer) clearTimeout(runTimer);
    runTimer = window.setTimeout(() => ledRun.classList.remove("is-lit"), 480);
  };

  const jolt = () => {
    if (!unitBox) return;
    unitBox.classList.remove("is-stop");
    void unitBox.offsetWidth;
    unitBox.classList.add("is-stop");
  };

  const paint = (value) => {
    const digits = String(value).padStart(3, "0");
    strips.forEach((strip, index) => roll(strip, Number(digits[index]), CARRY[index]));
    if (ladder) ladder.style.setProperty("--y", String(1 - value / MAX));
    if (ledLimit) ledLimit.classList.toggle("is-lit", value <= MIN || value >= MAX);
    input.setAttribute("aria-valuetext", `${value} units`);
  };

  const write = (value) => {
    const raw = Math.round(Number(value));
    const n = clamp(raw);
    const atStop = n === MIN || n === MAX;
    input.value = String(n);
    if (unitBox) unitBox.classList.remove("is-over");
    if (unitTag) unitTag.textContent = "units";
    paint(n);
    if (atStop) jolt();
    return n;
  };

  const start = clamp(Number(input.value));
  input.value = String(start);
  strips.forEach((strip, index) => {
    const digit = Number(String(start).padStart(3, "0")[index]);
    strip.dataset.d = String(digit);
    strip.dataset.pos = String(digit);
    strip.style.transition = "none";
    moveTo(strip, digit);
  });
  void strips[0].offsetHeight;
  strips.forEach((strip) => { strip.style.transition = ""; });
  paint(start);

  const stopHold = () => {
    if (holdDelay) clearTimeout(holdDelay);
    if (holdRepeat) clearInterval(holdRepeat);
    holdDelay = null;
    holdRepeat = null;
  };

  const bump = (delta) => {
    const n = write(clamp(Number(input.value) || 0) + delta);
    flashRun();
    return n;
  };

  const bindStep = (button, delta) => {
    button.addEventListener("pointerdown", (event) => {
      if (event.button) return;
      stopHold();
      bump(delta);
      holdDelay = window.setTimeout(() => {
        holdRepeat = window.setInterval(() => {
          if (bump(delta) === (delta > 0 ? MAX : MIN)) stopHold();
        }, 110);
      }, 420);
    });
    button.addEventListener("keydown", (event) => {
      if (event.key !== " " && event.key !== "Enter") return;
      event.preventDefault();
      bump(delta);
    });
    button.addEventListener("click", (event) => {
      if (event.detail !== 0) return;
      bump(delta);
    });
  };

  bindStep(plus, 1);
  bindStep(minus, -1);
  window.addEventListener("pointerup", stopHold);
  window.addEventListener("pointercancel", stopHold);
  window.addEventListener("blur", stopHold);

  input.addEventListener("input", () => {
    const raw = input.value;
    if (raw === "" || !Number.isFinite(Number(raw))) return;
    const n = clamp(Number(raw));
    const over = Number(raw) !== n;
    if (unitBox) unitBox.classList.toggle("is-over", over);
    if (unitTag) unitTag.textContent = over ? (Number(raw) > MAX ? "over 999" : "under 000") : "units";
    paint(n);
    flashRun();
  });

  input.addEventListener("change", () => write(Number(input.value || MIN)));
  input.addEventListener("blur", () => write(Number(input.value || MIN)));

  input.addEventListener("keydown", (event) => {
    const current = clamp(Number(input.value || MIN));
    if (event.key === "Home") {
      event.preventDefault();
      write(MIN);
    } else if (event.key === "End") {
      event.preventDefault();
      write(MAX);
    } else if (event.key === "PageUp") {
      event.preventDefault();
      write(current + 10);
    } else if (event.key === "PageDown") {
      event.preventDefault();
      write(current - 10);
    } else if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      write(current);
    }
  });
}
