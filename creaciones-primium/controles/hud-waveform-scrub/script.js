const input = document.querySelector("#scrub");
const win = document.querySelector("#window");
const ampOut = document.querySelector("#amp");
const offOut = document.querySelector("#off");
const smpOut = document.querySelector("#smp");
const cutOut = document.querySelector("#cut");
const lamp = document.querySelector("#lamp");

if (input && win) {
  const MINUS = "\u2212";
  const bars = Array.from(win.querySelectorAll(".wave i"));
  const heights = bars.map((bar) => {
    const raw = getComputedStyle(bar).getPropertyValue("--h");
    const n = Number.parseFloat(raw);
    return Number.isFinite(n) ? n : 0.5;
  });

  const measure = () => {
    const handle = win.querySelector(".handle");
    const handleWidth = handle ? handle.offsetWidth : 28;
    const travel = win.clientWidth - handleWidth - 12;
    win.style.setProperty("--travel", `${Math.max(0, travel)}px`);
    win.style.setProperty("--hh", `${(handleWidth / 2).toFixed(2)}px`);
  };

  const offsetText = (seconds) => {
    const sign = seconds < 0 ? MINUS : "+";
    return `${sign}${Math.abs(seconds).toFixed(2)} s`;
  };

  const speak = (seconds) => {
    const sign = seconds < 0 ? "minus " : "plus ";
    return `${sign}${Math.abs(seconds).toFixed(2)} seconds from mark`;
  };

  const paint = () => {
    const value = Number(input.value);
    const ratio = value / 1000;
    win.style.setProperty("--v", String(ratio));

    const index = Math.min(heights.length - 1, Math.round(ratio * (heights.length - 1)));
    const peak = heights[index];
    const seconds = (ratio - 0.5) * 4.8;
    const sample = Math.round(ratio * 5119);

    if (ampOut) ampOut.textContent = peak.toFixed(2);
    if (offOut) offOut.textContent = offsetText(seconds);
    if (smpOut) smpOut.textContent = String(sample);
    input.setAttribute("aria-valuetext", `sample ${sample}, amplitude ${peak.toFixed(2)}, ${speak(seconds)}`);
  };

  const dropCut = () => {
    const current = Number((cutOut?.textContent ?? "0").replace(/\D/g, "")) || 0;
    const next = current >= 99 ? 1 : current + 1;
    if (cutOut) cutOut.textContent = String(next).padStart(2, "0");
    win.classList.remove("is-cut");
    win.getBoundingClientRect();
    win.classList.add("is-cut");
    if (lamp) {
      lamp.classList.remove("is-pulse");
      lamp.getBoundingClientRect();
      lamp.classList.add("is-pulse");
      window.setTimeout(() => lamp.classList.remove("is-pulse"), 320);
    }
  };

  measure();
  paint();

  input.addEventListener("input", paint);
  input.addEventListener("keydown", (event) => {
    if (event.key === "PageUp" || event.key === "PageDown") {
      event.preventDefault();
      const delta = event.key === "PageUp" ? 100 : -100;
      input.value = String(Math.min(1000, Math.max(0, Number(input.value) + delta)));
      paint();
    } else if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      dropCut();
    }
  });
  input.addEventListener("pointerdown", () => win.classList.add("is-dragging"));
  window.addEventListener("pointerup", () => win.classList.remove("is-dragging"));
  window.addEventListener("resize", measure);

  if (typeof ResizeObserver === "function") {
    new ResizeObserver(measure).observe(win);
  }

  // "ready" es una promesa: como condicion siempre seria cierta, asi que solo
  // se comprueba que exista el FontFaceSet.
  if (document.fonts) {
    document.fonts.ready.then(measure).catch(() => {});
  }
}
