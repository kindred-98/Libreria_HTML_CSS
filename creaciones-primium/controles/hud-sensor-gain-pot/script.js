const scope = document.querySelector("#scope");
const input = document.querySelector("#gain");
const winVal = document.querySelector("#winVal");
const numGain = document.querySelector("#numGain");
const numNoise = document.querySelector("#numNoise");
const numThr = document.querySelector("#numThr");
const barGain = document.querySelector("#barGain");
const barNoise = document.querySelector("#barNoise");
const barThr = document.querySelector("#barThr");
const statMode = document.querySelector("#statMode");

if (scope && input) {
  const MAX = Number(input.max || 100);
  const clamp = (n, lo, hi) => (n < lo ? lo : n > hi ? hi : n);
  const signed = (n) => (n >= 0 ? "+" : "-") + Math.abs(n).toFixed(1);

  const paint = () => {
    const raw = clamp(Number(input.value), 0, MAX);
    const p = raw / MAX;
    const gain = -24 + p * 48;
    const noise = 3.4 + p * 13.6;
    const thr = 6.5 + gain * 0.42;

    scope.style.setProperty("--p", p.toFixed(4));
    input.setAttribute("aria-valuetext", `${signed(gain)} decibels, noise floor ${noise.toFixed(1)} decibels, threshold ${thr.toFixed(1)} decibels`);

    if (winVal) winVal.textContent = signed(gain);
    if (numGain) numGain.textContent = signed(gain);
    if (numNoise) numNoise.textContent = noise.toFixed(1);
    if (numThr) numThr.textContent = thr.toFixed(1);

    if (barGain) barGain.style.setProperty("--f", (8 + p * 92).toFixed(2));
    if (barNoise) barNoise.style.setProperty("--f", (8 + (noise / 18) * 92).toFixed(2));
    if (barThr) barThr.style.setProperty("--f", (8 + clamp((thr + 6) / 26, 0, 1) * 92).toFixed(2));

    if (statMode) {
      const n = clamp(Number(raw), 0, MAX);
      statMode.textContent = n === MAX ? "gain at stop" : n === 0 ? "gain at floor" : thr < 0 ? "threshold tripped" : "manual trim";
    }
  };

  const set = (n) => {
    const next = clamp(Math.round(n), 0, MAX);
    if (next === Number(input.value)) return;
    input.value = String(next);
    paint();
  };

  const angleOf = (event) => {
    const box = scope.getBoundingClientRect();
    const dx = event.clientX - (box.left + box.width / 2);
    const dy = event.clientY - (box.top + box.height / 2);
    const deg = (Math.atan2(dx, -dy) * 180) / Math.PI;
    return deg < 0 ? deg + 360 : deg;
  };

  const fromAngle = (deg) => {
    const a = ((deg + 120 + 360) % 360) - 120;
    return (a / 240) * MAX;
  };

  paint();

  input.addEventListener("input", paint);

  input.addEventListener("keydown", (event) => {
    if (event.key === " ") {
      event.preventDefault();
      set(MAX / 2);
    } else if (event.key === "PageUp" || event.key === "PageDown") {
      event.preventDefault();
      set(Number(input.value) + (event.key === "PageUp" ? 10 : -10));
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      set(event.key === "Home" ? 0 : MAX);
    }
  });

  let drag = null;

  scope.addEventListener("pointerdown", (event) => {
    if (event.button) return;
    drag = { angle: angleOf(event) };
    if (typeof scope.setPointerCapture === "function") scope.setPointerCapture(event.pointerId);
    input.focus({ preventScroll: true });
    set(fromAngle(angleOf(event)));
    event.preventDefault();
  });

  scope.addEventListener("pointermove", (event) => {
    if (!drag) return;
    let delta = angleOf(event) - drag.angle;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    drag.angle = angleOf(event);
    set(Number(input.value) + (delta / 360) * MAX);
    event.preventDefault();
  });

  const release = (event) => {
    if (!drag) return;
    drag = null;
    if (event && typeof scope.releasePointerCapture === "function") {
      try { scope.releasePointerCapture(event.pointerId); } catch (err) { void err; }
    }
  };

  scope.addEventListener("pointerup", release);
  scope.addEventListener("pointercancel", release);
  scope.addEventListener("lostpointercapture", release);
}
