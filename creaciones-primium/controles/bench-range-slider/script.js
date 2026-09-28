const input = document.querySelector("#travel");
const rig = document.querySelector(".rig");
const rail = document.querySelector("#railBox");
const carriage = rail ? rail.querySelector(".carriage") : null;
const mmOut = document.querySelector("#mmOut");
const mvOut = document.querySelector("#mvOut");

if (input && rig && rail && carriage) {
  const measure = () => {
    const travel = rail.clientWidth - carriage.offsetWidth - 12;
    rig.style.setProperty("--travel", `${Math.max(0, travel)}px`);
    rig.style.setProperty("--half", `${(carriage.offsetWidth / 2).toFixed(2)}px`);
  };

  const millivolts = (value) => Math.round(value * 4.2);

  const paint = () => {
    const value = Number(input.value);
    rail.style.setProperty("--v", String(value / 150));
    if (mmOut) mmOut.textContent = String(value).padStart(3, "0");
    if (mvOut) mvOut.textContent = String(millivolts(value)).padStart(3, "0");
    input.setAttribute("aria-valuetext", `${value} millimetres, ${millivolts(value)} millivolts`);
  };

  const clamp = (raw) => Math.min(150, Math.max(0, raw));

  const setTo = (raw) => {
    input.value = String(clamp(Math.round(raw)));
    paint();
  };

  measure();
  paint();

  input.addEventListener("input", paint);

  input.addEventListener("keydown", (event) => {
    const key = event.key;
    if (key === "PageUp" || key === "PageDown") {
      event.preventDefault();
      setTo(Number(input.value) + (key === "PageUp" ? 15 : -15));
      return;
    }
    if (key === " " || key === "Enter") {
      event.preventDefault();
      const value = Number(input.value);
      setTo(Math.round(value / 5) * 5);
    }
  });

  input.addEventListener("pointerdown", () => rail.classList.add("is-dragging"));
  window.addEventListener("pointerup", () => rail.classList.remove("is-dragging"));
  window.addEventListener("blur", () => rail.classList.remove("is-dragging"));
  window.addEventListener("resize", measure);

  if (typeof ResizeObserver === "function") {
    new ResizeObserver(measure).observe(rail);
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(measure).catch(() => {});
  }
}
