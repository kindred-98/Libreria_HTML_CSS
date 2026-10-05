const bench = document.querySelector(".bench");
const input = document.querySelector("#freq");
const unit = document.querySelector("#unit");
const ledDet = document.querySelector("#ledDet");
const note = document.querySelector("#note");
const strips = ["#d0", "#d1", "#d2", "#d3"].map((sel) => document.querySelector(sel));

if (bench && input && strips.length === 4) {
  const RUNGS = [125, 250, 500, 1000, 2000, 4000, 8000];
  const SPAN = [0, 1 / 6, 2 / 6, 3 / 6, 4 / 6, 5 / 6, 1];
  const MIN = Number(input.min || 0);
  const MAX = Number(input.max || 100);
  const CELLS = 20;
  const clamp = (n) => Math.max(MIN, Math.min(MAX, n));
  const hertz = (v) => Math.round(125 * Math.pow(64, v));

  const pos = [0, 0, 0, 0];
  let cur = clamp(Number(input.value)) / MAX;
  let raf = 0;
  let detent = -1;
  let dragging = false;
  let detTimer = 0;

  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const easeBack = (t) => {
    const c1 = 0.9;
    return 1 + (c1 + 1) * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  };

  const place = (i, value) => {
    pos[i] = value;
    strips[i].style.transform = `translate3d(0,${(-value * 100) / CELLS}%,0)`;
  };

  const digits = (f) => {
    const d = String(Math.max(0, Math.min(9999, f))).padStart(4, "0");
    return [Number(d[0]), Number(d[1]), Number(d[2]), Number(d[3])];
  };

  const band = (v) => {
    let b = 0;
    while (b < SPAN.length - 2 && v > SPAN[b] + 1 / 12) b += 1;
    return b;
  };

  const stamp = (v) => {
    bench.style.setProperty("--xv", v.toFixed(4));
    input.setAttribute("aria-valuetext", `${hertz(v)} hertz, band centre`);
  };

  const paint = (v) => {
    const want = digits(hertz(v));
    for (let i = 0; i < 4; i += 1) place(i, want[i]);
    const b = band(v);
    const onRung = Math.abs(v - SPAN[b]) < 0.01;
    if (unit) unit.classList.toggle("is-lock", onRung);
    if (note) {
      const off = hertz(v) - RUNGS[b];
      let texto = "seated on octave";
      if (!onRung) texto = off > 0 ? `+${off} hz over` : `${Math.abs(off)} hz under`;
      note.textContent = texto;
    }
  };

  const click = () => {
    if (ledDet) {
      ledDet.classList.add("is-lit");
      if (detTimer) clearTimeout(detTimer);
      detTimer = setTimeout(() => ledDet.classList.remove("is-lit"), 240);
    }
    if (unit) {
      unit.classList.remove("is-seat");
      unit.getBoundingClientRect();
      unit.classList.add("is-seat");
      setTimeout(() => unit.classList.remove("is-seat"), 300);
    }
  };

  const run = (v0, v1, dur, spring) => {
    if (raf) cancelAnimationFrame(raf);
    const d1 = digits(hertz(v1));
    const t0 = performance.now();
    const ease = spring ? easeBack : easeOut;
    const from = [];
    const delta = [];

    for (let i = 0; i < 4; i += 1) {
      from[i] = Math.round(pos[i]);
      let step = (d1[i] - (from[i] % 10) + 10) % 10;
      if (v1 < v0) step -= 10;
      if (from[i] + step > CELLS - 1) step -= 10;
      if (from[i] + step < 0) step += 10;
      delta[i] = step;
    }

    const tick = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      cur = v0 + (v1 - v0) * ease(t);
      stamp(cur);
      for (let i = 0; i < 4; i += 1) {
        const local = Math.max(0, Math.min(1, (t - i * 0.07) / 0.79));
        place(i, from[i] + delta[i] * easeBack(local));
      }
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
        cur = v1;
        stamp(v1);
        paint(v1);
      }
    };

    raf = requestAnimationFrame(tick);
  };

  const setValue = (next, dur, spring) => {
    const n = clamp(next);
    input.value = String(n);
    const v = n / MAX;
    const b = band(v);
    if (b !== detent) {
      detent = b;
      if (ledDet) {
        ledDet.classList.add("is-lit");
        if (detTimer) clearTimeout(detTimer);
        detTimer = setTimeout(() => ledDet.classList.remove("is-lit"), 200);
      }
    }
    if (spring) click();
    run(cur, v, dur, Boolean(spring));
  };

  const snap = () => {
    const v = Number(input.value) / MAX;
    let best = 0;
    let gap = Infinity;
    for (let i = 0; i < SPAN.length; i += 1) {
      const d = Math.abs(SPAN[i] - v);
      if (d < gap) { gap = d; best = i; }
    }
    if (gap < 0.0015) {
      click();
      paint(v);
      return;
    }
    setValue(Math.round(SPAN[best] * MAX), 300, true);
  };

  input.addEventListener("pointerdown", () => { dragging = true; });
  window.addEventListener("pointerup", () => { dragging = false; });
  window.addEventListener("pointercancel", () => { dragging = false; });

  input.addEventListener("input", () => {
    setValue(Number(input.value), dragging ? 110 : 280, false);
  });

  input.addEventListener("change", () => {
    if (dragging) snap();
    dragging = false;
  });

  input.addEventListener("keydown", (event) => {
    const here = Number(input.value);
    if (event.key === "Home") {
      event.preventDefault();
      setValue(MIN, 520, false);
    } else if (event.key === "End") {
      event.preventDefault();
      setValue(MAX, 520, false);
    } else if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      snap();
    } else if (event.key === "PageUp") {
      event.preventDefault();
      setValue(clamp(here + 5), 320, false);
    } else if (event.key === "PageDown") {
      event.preventDefault();
      setValue(clamp(here - 5), 320, false);
    }
  });

  paint(cur);
  stamp(cur);
}
