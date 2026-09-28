const bands = [...document.querySelectorAll(".band")];
const ringFill = document.querySelector("#ringFill");
const mixOut = document.querySelector("#mix");

if (bands.length) {
  const MIN = -12;
  const MAX = 12;

  const travelOf = (band) => {
    const slot = band.querySelector(".band__slot");
    const cap = band.querySelector(".band__cap");
    if (!slot || !cap) return 0;
    return Math.max(0, slot.offsetHeight - cap.offsetHeight);
  };

  const values = bands.map((band) => Number(band.querySelector(".band__input")?.value ?? 0));

  const describe = (value) => {
    if (value === 0) return "flat";
    const sign = value > 0 ? "+" : "minus ";
    return `${sign}${Math.abs(value)} decibels`;
  };

  const paint = (index) => {
    const band = bands[index];
    const input = band.querySelector(".band__input");
    const cap = band.querySelector(".band__cap");
    if (!input || !cap) return;
    const value = Number(input.value);
    values[index] = value;
    const travel = travelOf(band);
    const ratio = (value - MIN) / (MAX - MIN);
    cap.style.setProperty("--pos", String((0.5 - ratio) * travel));
    input.setAttribute("aria-valuetext", describe(value));
  };

  const report = () => {
    const sum = values.reduce((total, value) => total + value, 0);
    const spread = Math.max(...values) - Math.min(...values);
    if (ringFill) {
      const level = Math.min(100, Math.round(14 + Math.abs(sum) * 4 + spread * 3));
      ringFill.style.setProperty("--lvl", String(level));
      ringFill.style.setProperty("--peak", String(Math.min(100, level + 8)));
    }
    if (mixOut) {
      mixOut.textContent = spread < 2 ? "flat" : sum > 0 ? `${sum > 0 ? "+" : ""}${sum} db overall` : `${sum} db overall`;
    }
  };

  bands.forEach((band, index) => {
    const input = band.querySelector(".band__input");
    input?.addEventListener("input", () => {
      paint(index);
      report();
    });
    input?.addEventListener("keydown", (event) => {
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        input.value = "0";
        paint(index);
        report();
      }
    });
    paint(index);
  });

  report();

  const relayout = () => {
    values.forEach((_, index) => paint(index));
  };

  window.addEventListener("resize", relayout);
  if (typeof ResizeObserver === "function") {
    const observer = new ResizeObserver(relayout);
    observer.observe(document.querySelector(".bands"));
  }
  document.fonts?.ready.then(relayout).catch(() => {});
}
