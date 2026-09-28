const input = document.querySelector("#xfade");
const box = document.querySelector("#faderBox");
const stack = document.querySelector("#stack");
const slot = document.querySelector(".fader__slot");
const figStack = document.querySelector("#figStack");
const figStack2 = document.querySelector("#figStack2");
const figGap = document.querySelector("#figGap");
const figTravel = document.querySelector("#figTravel");
const status = document.querySelector("#status");

if (input && box && stack) {
  const TRAVEL_MM = 0.45;
  const GAP_MM = 0.12;
  const GAP_PX = 0.23;
  const BASE_MM = 24;
  const CAP_W = 34;
  const BASE_PX = 152;

  let reach = 0;

  const measure = () => {
    reach = slot ? Math.max(0, slot.clientWidth - CAP_W) : 0;
    paint();
  };

  const paint = () => {
    const value = Number(input.value);
    const ratio = value / 100;
    const travelMm = value * TRAVEL_MM;
    const gapMm = value * GAP_MM;
    const stackMm = BASE_MM + gapMm;
    const spread = gapMm * GAP_PX * 10;
    const stackPx = BASE_PX + spread * 4 + 16;

    stack.style.setProperty("--gap", `${spread.toFixed(2)}px`);
    stack.style.setProperty("--stack", stackPx.toFixed(1));
    stack.style.setProperty("--s", (stackPx / (stack.clientHeight || 290)).toFixed(4));
    box.style.setProperty("--p", (reach * ratio).toFixed(1));

    if (figStack) figStack.textContent = `${stackMm.toFixed(1)} mm`;
    if (figStack2) figStack2.textContent = stackMm.toFixed(1);
    if (figGap) figGap.textContent = gapMm.toFixed(1);
    if (figTravel) figTravel.textContent = travelMm.toFixed(1);
    if (status) status.textContent = `Assembly open ${travelMm.toFixed(1)} millimetres`;

    input.setAttribute("aria-valuetext", `${value} percent, ${travelMm.toFixed(1)} millimetres`);
  };

  const snap = () => {
    input.value = String(Math.round(Number(input.value) / 10) * 10);
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
  window.addEventListener("resize", measure);
  document.fonts?.ready.then(measure).catch(() => {});
}
