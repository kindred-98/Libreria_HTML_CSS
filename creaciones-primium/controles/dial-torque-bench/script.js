const dial = document.querySelector("#dial");
const valueOut = document.querySelector("#value");
const detentOut = document.querySelector("#detent");
const contact = document.querySelector("#contact");

if (dial) {
  const MIN = 0;
  const MAX = 300;
  const STEP = 30;
  const SPAN = 150;
  const DETENTS = Array.from({ length: 11 }, (_, index) => index * STEP);
  let dragging = false;

  const clamp = (value) => Math.min(MAX, Math.max(MIN, value));

  const paint = (value) => {
    const safe = clamp(Math.round(value));
    dial.style.setProperty("--deg", String(-SPAN + safe));
    dial.setAttribute("aria-valuenow", String(safe));
    dial.setAttribute("aria-valuetext", `${safe}.0 newton metres, detent ${Math.round(safe / STEP)}`);
    if (valueOut) valueOut.textContent = safe.toFixed(1);
    if (detentOut) detentOut.textContent = String(Math.round(safe / STEP)).padStart(2, "0");
    if (contact) contact.style.setProperty("--touch", String(Math.round((safe / MAX) * 4)));
  };

  const nearestDetent = (value) => {
    return DETENTS.reduce((best, step) => (Math.abs(step - value) < Math.abs(best - value) ? step : best), DETENTS[0]);
  };

  const fromPointer = (event) => {
    const box = dial.getBoundingClientRect();
    const dx = event.clientX - (box.left + box.width / 2);
    const dy = event.clientY - (box.top + box.height / 2);
    const angle = Math.atan2(dx, -dy) * (180 / Math.PI);
    return clamp(-SPAN + angle);
  };

  dial.addEventListener("pointerdown", (event) => {
    dragging = true;
    dial.classList.add("is-drag");
    dial.setPointerCapture(event.pointerId);
    dial.focus();
    paint(fromPointer(event));
  });

  dial.addEventListener("pointermove", (event) => {
    if (dragging) paint(fromPointer(event));
  });

  const release = () => {
    if (!dragging) return;
    dragging = false;
    dial.classList.remove("is-drag");
    paint(nearestDetent(Number(dial.getAttribute("aria-valuenow"))));
  };

  dial.addEventListener("pointerup", release);
  dial.addEventListener("pointercancel", release);

  dial.addEventListener("keydown", (event) => {
    const current = Number(dial.getAttribute("aria-valuenow"));
    const big = event.shiftKey ? 15 : 1;
    const moves = {
      ArrowUp: big,
      ArrowRight: big,
      ArrowDown: -big,
      ArrowLeft: -big,
      PageUp: STEP,
      PageDown: -STEP,
    };
    if (event.key in moves) {
      event.preventDefault();
      paint(current + moves[event.key]);
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
      paint(nearestDetent(current));
    }
  });

  paint(120);
}
