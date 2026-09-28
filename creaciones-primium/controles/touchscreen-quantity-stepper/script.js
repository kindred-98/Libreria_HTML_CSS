const input = document.querySelector("#qty");
const drum = document.querySelector("#drum");
const window_ = document.querySelector("#window");
const minus = document.querySelector("#minus");
const plus = document.querySelector("#plus");
const totalOut = document.querySelector("#totalOut");
const totalRow = document.querySelector("#totalRow");
const linesOut = document.querySelector("#linesOut");
const vatOut = document.querySelector("#vatOut");
const payFill = document.querySelector("#levelFill");
const levelOut = document.querySelector("#levelOut");
const live = document.querySelector("#live");
const clock = document.querySelector("#clock");

if (input && drum) {
  const MIN = Number(input.min);
  const MAX = Number(input.max);
  const UNIT = 2.4;
  const money = (raw) => raw.toFixed(2);

  for (let k = MIN; k <= MAX; k++) {
    const cell = document.createElement("i");
    cell.textContent = String(k);
    drum.appendChild(cell);
  }

  const bounds = (raw) => Math.min(MAX, Math.max(MIN, Math.round(Number(raw) || 0)));

  const paint = (raw, silent) => {
    const value = bounds(raw);
    input.value = String(value);
    drum.style.setProperty("--n", String(value));
    const total = value * UNIT;
    totalOut.textContent = money(total);
    linesOut.textContent = value + " \u00d7 " + money(UNIT);
    vatOut.textContent = money(total - total / 1.21);
    if (payFill) payFill.style.setProperty("--fill", String(value / MAX));
    if (levelOut) levelOut.textContent = String(value);
    if (minus) minus.disabled = value <= MIN;
    if (plus) plus.disabled = value >= MAX;
    if (totalRow) {
      totalRow.classList.remove("is-pop");
      void totalRow.offsetWidth;
      totalRow.classList.add("is-pop");
    }
    if (live && !silent) {
      live.textContent = value + " in the basket, " + money(total) + " euro total";
    }
    return value;
  };

  const step = (delta) => paint(Number(input.value) + delta, false);

  const ripple = (host, x, y) => {
    if (!host) return;
    const drop = document.createElement("i");
    drop.className = "rip";
    drop.style.left = x + "px";
    drop.style.top = y + "px";
    host.appendChild(drop);
    drop.addEventListener("animationend", () => drop.remove());
  };

  const spray = (button, event) => {
    if (!button || button.disabled) return;
    const face = button.querySelector(".step__face");
    if (!face) return;
    const box = face.getBoundingClientRect();
    const x = event && event.clientX ? event.clientX - box.left : box.width / 2;
    const y = event && event.clientY ? event.clientY - box.top : box.height / 2;
    ripple(face, x, y);
  };

  const hold = (button, delta) => {
    let wait = null;
    let beat = null;
    const stop = () => {
      if (wait) clearTimeout(wait);
      if (beat) clearInterval(beat);
      wait = null;
      beat = null;
    };
    button.addEventListener("pointerdown", (event) => {
      spray(button, event);
      step(delta);
      stop();
      wait = setTimeout(() => {
        beat = setInterval(() => {
          if (button.disabled) {
            stop();
            return;
          }
          spray(button, null);
          step(delta);
        }, 125);
      }, 420);
    });
    button.addEventListener("pointerup", stop);
    button.addEventListener("pointerleave", stop);
    button.addEventListener("pointercancel", stop);
    button.addEventListener("blur", stop);
  };

  if (minus) hold(minus, -1);
  if (plus) hold(plus, 1);

  [minus, plus].forEach((button) => {
    if (!button) return;
    button.addEventListener("click", (event) => {
      if (event.detail === 0) spray(button, null);
    });
  });

  input.addEventListener("input", () => paint(input.value, true));
  input.addEventListener("change", () => paint(input.value, false));
  input.addEventListener("blur", () => paint(input.value, true));

  input.addEventListener("keydown", (event) => {
    const key = event.key;
    if (key === "PageUp") {
      event.preventDefault();
      step(6);
      return;
    }
    if (key === "PageDown") {
      event.preventDefault();
      step(-6);
      return;
    }
    if (key === "Home") {
      event.preventDefault();
      paint(MIN, false);
      return;
    }
    if (key === "End") {
      event.preventDefault();
      paint(MAX, false);
    }
  });

  if (clock) {
    const tick = () => {
      const now = new Date();
      clock.textContent =
        String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
    };
    tick();
    setInterval(tick, 20000);
  }

  paint(input.value, true);
}
