const input = document.querySelector("#trim");
const box = document.querySelector("#faderBox");
const lcd = document.querySelector("#lcdValue");
const sub = document.querySelector("#lcdSub");
const dev = document.querySelector("#devBar");
const marks = document.querySelectorAll(".ref__marks li");

if (input && box) {
  const BANDS = [
    { at: 0, target: 0 },
    { at: 25, target: 50 },
    { at: 76, target: 100 }
  ];

  let lastText = "";

  const bandFor = (value) => {
    let band = BANDS[0];
    for (const candidate of BANDS) {
      if (value >= candidate.at) band = candidate;
    }
    return band;
  };

  const bandIndex = (value) => BANDS.indexOf(bandFor(value));

  const pop = (element) => {
    if (!element) return;
    element.classList.remove("is-pop");
    void element.offsetWidth;
    element.classList.add("is-pop");
  };

  const paint = () => {
    const value = Number(input.value);
    const ratio = value / 100;
    const index = Math.round(value / 5);
    const band = bandFor(value);

    box.style.setProperty("--v", String(ratio));

    const text = `${value.toFixed(1)}`;
    if (lcd) {
      if (lcd.firstChild && lcd.firstChild.nodeType === 3) {
        lcd.firstChild.nodeValue = text;
      } else {
        lcd.textContent = text;
      }
      if (text !== lastText) {
        pop(lcd);
        lastText = text;
      }
    }

    if (sub) {
      sub.textContent = `index ${String(index).padStart(2, "0")} · seated`;
    }

    if (dev) {
      const spread = Math.abs(value - band.target) / 50;
      dev.style.setProperty("--d", Math.min(1, Math.max(0.04, spread)).toFixed(3));
    }

    const live = bandIndex(value);
    marks.forEach((mark, position) => {
      mark.classList.toggle("is-live", position === live);
    });

    input.setAttribute("aria-valuetext", `${value.toFixed(1)} millimetres, index ${index}`);
  };

  const seat = () => {
    const value = Number(input.value);
    input.value = String(Math.round(value / 5) * 5);
    paint();
  };

  paint();

  input.addEventListener("input", paint);
  input.addEventListener("keydown", (event) => {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      seat();
    }
  });
  input.addEventListener("pointerdown", () => box.classList.add("is-dragging"));
  window.addEventListener("pointerup", () => box.classList.remove("is-dragging"));
  window.addEventListener("pointercancel", () => box.classList.remove("is-dragging"));
}
