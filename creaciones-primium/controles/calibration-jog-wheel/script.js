const jog = document.querySelector("#jog");
const wheel = document.querySelector(".jog__wheel");
const drift = document.querySelector("#drift");
const indexOut = document.querySelector("#indexOut");
const lock = document.querySelector("#lock");
const bar = document.querySelector("#bar");

if (jog && wheel) {
  const MIN = -500;
  const MAX = 500;
  const DIV = 25;
  let value = 0;
  let dragFrom = 0;
  let dragValue = 0;
  let dragging = false;

  const paint = (next) => {
    value = Math.min(MAX, Math.max(MIN, Math.round(next)));
    wheel.style.setProperty("--deg", String(value * 0.9));
    jog.setAttribute("aria-valuenow", String(value));
    const mm = (value / 1000).toFixed(3);
    const sign = value > 0 ? "+" : value < 0 ? "−" : "";
    jog.setAttribute("aria-valuetext", `${sign}${Math.abs(value)} microns, division ${Math.round(value / DIV)}`);
    if (drift) drift.textContent = `${mm}`;
    if (indexOut) indexOut.textContent = String(Math.round(value / DIV));
    if (lock) lock.textContent = value % DIV === 0 ? "on line" : "between lines";
    if (bar) bar.style.setProperty("--p", String(value / 5));
  };

  jog.addEventListener("pointerdown", (event) => {
    dragging = true;
    dragFrom = event.clientX;
    dragValue = value;
    jog.setPointerCapture(event.pointerId);
    jog.focus();
  });

  jog.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    paint(dragValue + (event.clientX - dragFrom) * 4);
  });

  const stop = () => {
    if (!dragging) return;
    dragging = false;
    paint(Math.round(value / DIV) * DIV);
  };

  jog.addEventListener("pointerup", stop);
  jog.addEventListener("pointercancel", stop);

  jog.addEventListener("keydown", (event) => {
    const big = event.shiftKey ? 10 : 1;
    const moves = {
      ArrowRight: big,
      ArrowUp: big,
      ArrowLeft: -big,
      ArrowDown: -big,
      PageUp: DIV,
      PageDown: -DIV,
    };
    if (event.key in moves) {
      event.preventDefault();
      paint(value + moves[event.key]);
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      paint(MIN);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      paint(MAX);
      return;
    }
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      paint(0);
    }
  });

  paint(0);
}
