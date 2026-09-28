const input = document.querySelector("#vol");
const ring = document.querySelector("#ring");
const fill = document.querySelector("#ringFill");
const deck = document.querySelector(".deck");
const val = document.querySelector("#val");
const peak = document.querySelector("#peak");
const segs = [...document.querySelectorAll(".vu i")];

if (input && ring && fill) {
  const MAX = Number(input.max || 100);
  const START = 225;
  const SWEEP = 270;
  const bases = segs.map((seg, index) => Number(seg.style.getPropertyValue("--s")) || 0.6 + (index % 5) * 0.08);
  const clamp = (n) => Math.max(0, Math.min(MAX, Math.round(n)));

  const paint = () => {
    const n = clamp(Number(input.value));
    const v = n / MAX;
    fill.style.setProperty("--sweep", `${(v * SWEEP).toFixed(2)}deg`);
    ring.style.setProperty("--v", v.toFixed(4));
    if (deck) deck.style.setProperty("--v", v.toFixed(4));
    if (val) val.textContent = String(n);
    if (peak) {
      peak.classList.toggle("is-clip", v >= 0.85);
      peak.classList.toggle("is-hot", v >= 0.96);
    }
    segs.forEach((seg, index) => {
      seg.style.setProperty("--s", Math.min(1, bases[index] * (0.4 + v * 0.9)).toFixed(3));
    });
    input.setAttribute("aria-valuetext", `${n} per cent`);
  };

  const setValue = (n) => {
    const next = clamp(n);
    if (next === Number(input.value)) return;
    input.value = String(next);
    paint();
  };

  input.addEventListener("input", paint);

  input.addEventListener("keydown", (event) => {
    if (event.key === "Home") {
      event.preventDefault();
      setValue(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setValue(MAX);
    } else if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      setValue(Math.round(Number(input.value) / 5) * 5);
    }
  });

  document.querySelectorAll(".key").forEach((button) => {
    button.addEventListener("click", () => {
      const on = button.getAttribute("aria-pressed") === "true";
      button.setAttribute("aria-pressed", on ? "false" : "true");
    });
  });

  paint();
}
