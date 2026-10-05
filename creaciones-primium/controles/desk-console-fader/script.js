const input = document.querySelector("#fader");
const box = document.querySelector("#faderBox");
const track = box?.querySelector(".track");
const cap = box?.querySelector(".cap");
const readout = document.querySelector("#readout");
const detentOut = document.querySelector("#detentOut");
const lamp = document.querySelector("#lamp");
const ladder = document.querySelector("#ladder");

if (input && track && cap) {
  const MINUS = "\u2212";
  const segments = ladder ? [...ladder.children] : [];

  const measure = () => {
    const travel = track.clientWidth - cap.offsetWidth - 12;
    track.style.setProperty("--travel", `${Math.max(0, travel)}px`);
  };

  const decibels = (value) => {
    if (value <= 0) return `${MINUS}\u221e`;
    const db = value * 0.4 - 30.6;
    const sign = db < 0 ? MINUS : "+";
    return `${sign}${Math.abs(db).toFixed(1)}`;
  };

  const speak = (value) => {
    const db = value <= 0
      ? "minus infinity"
      : `${value * 0.4 - 30.6 < 0 ? "minus " : "plus "}${Math.abs(value * 0.4 - 30.6).toFixed(1)}`;
    return `${db} decibels`;
  };

  const paint = () => {
    const value = Number(input.value);
    const ratio = value / 100;
    track.style.setProperty("--v", String(ratio));
    if (readout) readout.textContent = `${decibels(value)} dB`;
    const detent = Math.round(value / 10);
    if (detentOut) detentOut.textContent = `detent ${String(detent).padStart(2, "0")}`;
    if (lamp) lamp.style.opacity = value > 4 ? "1" : ".2";
    const lit = Math.round(ratio * segments.length);
    segments.forEach((segment, index) => {
      segment.classList.toggle("on", index < lit && index < segments.length - 2);
      segment.classList.toggle("hot", index >= segments.length - 2 && index < lit);
    });
    input.setAttribute("aria-valuetext", speak(value));
  };

  const snap = () => {
    const target = Math.round(Number(input.value) / 10) * 10;
    input.value = String(target);
    paint();
  };

  measure();
  paint();

  input.addEventListener("input", paint);
  input.addEventListener("keydown", (event) => {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      snap();
    }
  });
  input.addEventListener("pointerdown", () => track.classList.add("is-dragging"));
  window.addEventListener("pointerup", () => track.classList.remove("is-dragging"));
  window.addEventListener("resize", measure);

  if (typeof ResizeObserver === "function") {
    new ResizeObserver(measure).observe(track);
  }

  document.fonts?.ready.then(measure).catch(() => {});
}
