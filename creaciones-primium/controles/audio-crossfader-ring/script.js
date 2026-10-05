const input = document.querySelector("#crossfader");
const box = document.querySelector("#xfBox");
const track = document.querySelector("#track");
const cap = document.querySelector("#cap");
const ring = document.querySelector("#ring");
const lcdValue = document.querySelector("#lcdValue");
const lcdSub = document.querySelector("#lcdSub");
const meters = [...document.querySelectorAll(".channel .meter")];

if (input && box && track && cap) {
  const MAX = Number(input.max || 100);
  const fills = ring ? [...ring.querySelectorAll(".fill")] : [];

  const clamp = (n) => Math.max(0, Math.min(MAX, Math.round(n)));

  const measure = () => {
    const capWidth = cap.offsetWidth || 44;
    box.style.setProperty("--capw", `${capWidth}px`);
    const travel = track.clientWidth - capWidth - 10;
    track.style.setProperty("--travel", `${Math.max(0, travel)}px`);
  };

  const setValue = (n) => {
    const next = clamp(n);
    if (next === Number(input.value)) return;
    input.value = String(next);
    paint();
  };

  const setMeter = (meter, gain) => {
    if (!meter) return;
    const segments = [...meter.children];
    const lit = Math.round(gain * segments.length);
    segments.forEach((segment, index) => {
      segment.classList.toggle("on", index < lit);
      segment.classList.toggle("hot", index >= segments.length - 2 && index < lit);
    });
  };

  const paint = () => {
    const value = clamp(Number(input.value));
    const ratio = value / MAX;
    box.style.setProperty("--v", String(ratio));

    const lit = Math.round(ratio * fills.length);
    fills.forEach((fill, index) => fill.classList.toggle("on", index < lit));

    setMeter(meters[0], Math.cos((ratio * Math.PI) / 2));
    setMeter(meters[1], Math.sin((ratio * Math.PI) / 2));

    const left = MAX - value;
    if (lcdValue) lcdValue.textContent = `${left} : ${value}`;
    if (lcdSub) {
      let sub = "leaning b";
      if (left === value) sub = "equal power";
      else if (left > value) sub = "leaning a";
      lcdSub.textContent = sub;
    }

    input.setAttribute("aria-valuetext", `bus A ${left} per cent, bus B ${value} per cent`);
  };

  const snap = () => {
    setValue(Math.round(Number(input.value) / 10) * 10);
  };

  measure();
  paint();

  input.addEventListener("input", paint);
  input.addEventListener("keydown", (event) => {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      snap();
    } else if (event.key === "PageUp" || event.key === "PageDown") {
      event.preventDefault();
      setValue(Number(input.value) + (event.key === "PageUp" ? 10 : -10));
    }
  });

  input.addEventListener("pointerdown", () => track.classList.add("is-dragging"));
  window.addEventListener("pointerup", () => track.classList.remove("is-dragging"));
  window.addEventListener("pointercancel", () => track.classList.remove("is-dragging"));
  window.addEventListener("resize", measure);

  if (typeof ResizeObserver === "function") {
    new ResizeObserver(measure).observe(track);
  }
}
