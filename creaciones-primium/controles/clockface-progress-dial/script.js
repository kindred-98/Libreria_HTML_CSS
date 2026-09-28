const input = document.querySelector("#progress");
const dial = document.querySelector("#dial");
const value = document.querySelector("#value");
const windowPct = document.querySelector("#windowPct");
const bar = document.querySelector("#bar");

if (input && dial) {
  const MAX = Number(input.max || 100);
  let drag = null;

  const clamp = (n) => Math.max(0, Math.min(MAX, Math.round(n)));

  const paint = () => {
    const n = clamp(Number(input.value));
    dial.style.setProperty("--p", String(n / MAX));
    if (value) value.textContent = String(n);
    if (windowPct) windowPct.textContent = String(n);
    if (bar) bar.value = n;
    input.setAttribute("aria-valuetext", `${n} per cent`);
  };

  const setValue = (n) => {
    const next = clamp(n);
    if (next === Number(input.value)) return;
    input.value = String(next);
    paint();
  };

  const angleOf = (event) => {
    const box = dial.getBoundingClientRect();
    const dx = event.clientX - (box.left + box.width / 2);
    const dy = event.clientY - (box.top + box.height / 2);
    const deg = (Math.atan2(dx, -dy) * 180) / Math.PI;
    return deg < 0 ? deg + 360 : deg;
  };

  const snap = () => {
    setValue(Math.round(Number(input.value) / 5) * 5);
  };

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

  dial.addEventListener("pointerdown", (event) => {
    if (event.button) return;
    drag = { angle: angleOf(event), value: Number(input.value) };
    dial.classList.add("is-grab");
    if (typeof dial.setPointerCapture === "function") dial.setPointerCapture(event.pointerId);
    input.focus({ preventScroll: true });
    event.preventDefault();
  });

  dial.addEventListener("pointermove", (event) => {
    if (!drag) return;
    let delta = angleOf(event) - drag.angle;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    setValue(drag.value + (delta / 360) * MAX);
  });

  const release = () => {
    drag = null;
    dial.classList.remove("is-grab");
  };

  dial.addEventListener("pointerup", release);
  dial.addEventListener("pointercancel", release);
  dial.addEventListener("lostpointercapture", release);
}
