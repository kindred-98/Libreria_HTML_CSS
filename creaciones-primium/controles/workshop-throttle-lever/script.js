const lever = document.querySelector("#lever");
const range = document.querySelector("#range");
const needle = document.querySelector("#needle");
const read = document.querySelector("#read");
const cotaA = document.querySelector("#cotaA");
const cotaB = document.querySelector("#cotaB");
const lamp = document.querySelector("#lamp");

if (lever && range) {
  const MIN = 0;
  const MAX = 100;
  let value = 0;
  let dragging = false;
  let dragY = 0;
  let dragValue = 0;

  const paint = (next) => {
    value = Math.min(MAX, Math.max(MIN, Math.round(next)));
    const lean = -16 + (value / MAX) * 44;
    lever.style.setProperty("--lean", String(lean));
    lever.style.setProperty("--wind", String(0.6 + (value / MAX) * 0.8));
    range.value = String(value);
    const text = `${value} percent`;
    lever.setAttribute("aria-valuenow", String(value));
    lever.setAttribute("aria-valuetext", value === 0 ? `idle, ${text}` : text);
    range.setAttribute("aria-valuetext", value === 0 ? `idle, ${text}` : text);
    if (needle) needle.style.setProperty("--deg", String(value));
    if (read) read.textContent = `${value}%`;
    if (cotaA) cotaA.textContent = String(Math.round(value * 0.62));
    if (cotaB) cotaB.textContent = `${Math.round(lean)}°`;
    if (lamp) {
      lamp.style.setProperty("--lit", String(Math.round((value / MAX) * 4)));
      lamp.style.opacity = value > 2 ? "1" : ".35";
    }
  };

  lever.addEventListener("pointerdown", (event) => {
    dragging = true;
    dragY = event.clientY;
    dragValue = value;
    lever.classList.add("is-drag");
    lever.setPointerCapture(event.pointerId);
    lever.focus();
  });

  lever.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    paint(dragValue + (dragY - event.clientY) * 0.5);
  });

  const stop = () => {
    if (!dragging) return;
    dragging = false;
    lever.classList.remove("is-drag");
  };

  lever.addEventListener("pointerup", stop);
  lever.addEventListener("pointercancel", stop);

  lever.addEventListener("keydown", (event) => {
    const big = event.shiftKey ? 10 : 2;
    const moves = {
      ArrowUp: big,
      ArrowRight: big,
      ArrowDown: -big,
      ArrowLeft: -big,
      PageUp: 25,
      PageDown: -25,
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

  range.addEventListener("input", () => paint(Number(range.value)));
  paint(0);
}
