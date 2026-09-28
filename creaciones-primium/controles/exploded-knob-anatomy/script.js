const sheet = document.querySelector("#sheet");
const input = document.querySelector("#angle");
const read = document.querySelector("#read");
const dims = {
  a: document.querySelector("#dimA"),
  b: document.querySelector("#dimB"),
  c: document.querySelector("#dimC"),
};

if (sheet && input) {
  const DETENT = 30;
  let value = Number(input.value);

  const paint = (next) => {
    value = Math.min(270, Math.max(0, Math.round(next)));
    sheet.style.setProperty("--deg", String(value));
    input.value = String(value);
    input.setAttribute("aria-valuetext", `${value} degrees, detent ${Math.round(value / DETENT)}`);
    if (read) read.textContent = `${value}°`;
    if (dims.a) dims.a.textContent = `${value}°`;
    if (dims.b) dims.b.textContent = (18 + (value / 270) * 3.4).toFixed(1);
    if (dims.c) dims.c.textContent = (34 - (value / 270) * 2).toFixed(1);
  };

  input.addEventListener("input", () => paint(Number(input.value)));

  input.addEventListener("keydown", (event) => {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      paint(Math.round(value / DETENT) * DETENT);
    }
  });

  const cap = document.querySelector(".layer--cap .layer__disc");
  if (cap) {
    let dragging = false;
    const fromPointer = (event) => {
      const box = cap.getBoundingClientRect();
      const dx = event.clientX - (box.left + box.width / 2);
      const dy = event.clientY - (box.top + box.height / 2);
      return Math.atan2(dx, -dy) * (180 / Math.PI);
    };
    cap.style.cursor = "grab";
    cap.style.touchAction = "none";
    cap.addEventListener("pointerdown", (event) => {
      dragging = true;
      cap.style.cursor = "grabbing";
      cap.setPointerCapture(event.pointerId);
      paint(fromPointer(event) < 0 ? fromPointer(event) + 360 : fromPointer(event));
    });
    cap.addEventListener("pointermove", (event) => {
      if (dragging) {
        const angle = fromPointer(event);
        paint(angle < 0 ? angle + 360 : angle);
      }
    });
    const stop = () => {
      if (!dragging) return;
      dragging = false;
      cap.style.cursor = "grab";
      paint(Math.round(value / DETENT) * DETENT);
    };
    cap.addEventListener("pointerup", stop);
    cap.addEventListener("pointercancel", stop);
  }

  paint(value);
}
