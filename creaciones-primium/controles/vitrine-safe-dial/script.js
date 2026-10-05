const dial = document.querySelector("#dial");
const rotor = document.querySelector("#rotor");
const rider = document.querySelector("#rider");
const lock = document.querySelector("#lock");
const lockState = document.querySelector("#lockState");
const lockHint = document.querySelector("#lockHint");
const drumH = document.querySelector('[data-drum="h"] .drum__roll');
const drumT = document.querySelector('[data-drum="t"] .drum__roll');
const drumU = document.querySelector('[data-drum="u"] .drum__roll');

if (dial && rotor) {
  const MAX = 359;
  const DETENT = 5;
  const FRICTION = 0.03;
  const STEP = 1 / 240;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  const clamp = (n, lo, hi) => {
    if (n < lo) return lo;
    if (n > hi) return hi;
    return n;
  };
  const angleOf = (event) => {
    const box = dial.getBoundingClientRect();
    const dx = event.clientX - (box.left + box.width / 2);
    const dy = event.clientY - (box.top + box.height / 2);
    const deg = (Math.atan2(dx, -dy) * 180) / Math.PI;
    return deg < 0 ? deg + 360 : deg;
  };

  let value = 128;
  let vel = 0;
  let target = 128;
  let k = 220;
  let c = 22;
  let mode = "idle";
  let raf = 0;
  let last = 0;
  let carry = 0;
  let track = 0;
  let said = -1;
  let opened = null;
  let drag = null;

  const measure = () => {
    const host = rider && rider.parentElement;
    track = host ? Math.max(1, host.clientWidth - (rider.offsetWidth || 11)) : 1;
  };

  const roll = (drum, digit) => {
    if (!drum) return;
    drum.style.transform = "translate3d(0," + (-digit * 1).toFixed(3) + "em,0)";
  };

  const paint = () => {
    const shown = clamp(value, 0, MAX);
    rotor.style.transform = "rotate(" + shown.toFixed(3) + "deg)";
    dial.style.setProperty("--v", (shown / MAX).toFixed(4));
    if (rider) rider.style.setProperty("--pos", ((shown / MAX) * track).toFixed(2) + "px");
    const whole = Math.round(shown);
    roll(drumH, Math.floor(whole / 100));
    roll(drumT, Math.floor(whole / 10) % 10);
    roll(drumU, whole % 10);
    if (whole !== said) {
      said = whole;
      dial.setAttribute("aria-valuenow", String(whole));
      dial.setAttribute("aria-valuetext", whole + " degrees");
    }
    const isOpen = whole === 0;
    if (isOpen !== opened) {
      opened = isOpen;
      if (lock) lock.classList.toggle("is-open", isOpen);
      if (lockState) lockState.textContent = isOpen ? "Open" : "Sealed";
      if (lockHint) lockHint.textContent = isOpen ? "bolts withdrawn" : "bring the dial to 000";
    }
  };

  const step = (dt) => {
    if (mode === "free") {
      value += vel * dt;
      vel *= Math.pow(FRICTION, dt);
      if (value >= MAX) {
        value = MAX;
        vel = -vel * 0.04;
        target = MAX;
      } else if (value <= 0) {
        value = 0;
        vel = -vel * 0.04;
        target = 0;
      }
      if (Math.abs(vel) < 26) {
        target = clamp(Math.round(value / DETENT) * DETENT, 0, MAX);
        k = 220;
        c = 22;
        mode = "seat";
      }
      return;
    }
    if (mode === "seat") {
      const acc = (target - value) * k - vel * c;
      vel += acc * dt;
      value += vel * dt;
      if (value < 0) {
        value = 0;
        vel = -vel * 0.04;
      } else if (value > MAX) {
        value = MAX;
        vel = -vel * 0.04;
      }
      if (Math.abs(target - value) < 0.06 && Math.abs(vel) < 0.7) {
        value = target;
        vel = 0;
        mode = "idle";
      }
    }
  };

  const tick = (time) => {
    raf = 0;
    let dt = (time - last) / 1000;
    last = time;
    if (!(dt > 0)) dt = STEP;
    carry += Math.min(dt, 0.05);
    let guard = 0;
    while (carry >= STEP && guard < 40) {
      step(STEP);
      carry -= STEP;
      guard += 1;
    }
    paint();
    if (mode !== "idle") raf = requestAnimationFrame(tick);
  };

  const wake = () => {
    if (!raf) {
      last = performance.now();
      carry = 0;
      raf = requestAnimationFrame(tick);
    }
  };

  const goTo = (n, v) => {
    const goal = clamp(Math.round(n), 0, MAX);
    target = goal;
    if (reduced.matches) {
      value = goal;
      vel = 0;
      mode = "idle";
      paint();
      return;
    }
    const far = Math.abs(goal - value) > 14;
    k = far ? 200 : 640;
    c = 2 * (far ? 0.72 : 0.88) * Math.sqrt(k);
    vel = clamp(v || 0, -1400, 1400);
    mode = "seat";
    wake();
  };

  const fling = (speed) => {
    if (reduced.matches) {
      goTo(Math.round(value / DETENT) * DETENT, 0);
      return;
    }
    vel = clamp(speed, -1400, 1400);
    mode = "free";
    wake();
  };

  measure();
  paint();

  dial.addEventListener("keydown", (event) => {
    const big = event.shiftKey ? 15 : 1;
    let next = null;
    if (event.key === "ArrowUp" || event.key === "ArrowRight") next = Math.round(value) + big;
    else if (event.key === "ArrowDown" || event.key === "ArrowLeft") next = Math.round(value) - big;
    else if (event.key === "PageUp") next = Math.round(value) + 15;
    else if (event.key === "PageDown") next = Math.round(value) - 15;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = MAX;
    else if (event.key === " " || event.key === "Enter") next = Math.round(value / DETENT) * DETENT;
    if (next === null) return;
    event.preventDefault();
    goTo(next, 0);
  });

  dial.addEventListener("pointerdown", (event) => {
    if (event.button) return;
    mode = "drag";
    vel = 0;
    drag = { angle: angleOf(event), value: clamp(value, 0, MAX), marks: [[performance.now(), clamp(value, 0, MAX)]] };
    dial.classList.add("is-grab");
    if (typeof dial.setPointerCapture === "function") dial.setPointerCapture(event.pointerId);
    dial.focus({ preventScroll: true });
    event.preventDefault();
  });

  dial.addEventListener("pointermove", (event) => {
    if (!drag) return;
    let delta = angleOf(event) - drag.angle;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    const next = clamp(drag.value + delta, 0, MAX);
    if (next !== value) {
      value = next;
      drag.marks.push([performance.now(), next]);
      if (drag.marks.length > 6) drag.marks.shift();
      paint();
    }
  });

  const release = (event) => {
    if (!drag) return;
    const marks = drag.marks;
    drag = null;
    dial.classList.remove("is-grab");
    if (event && typeof dial.releasePointerCapture === "function") {
      try { dial.releasePointerCapture(event.pointerId); } catch { }
    }
    let speed = 0;
    if (marks.length > 1) {
      const a = marks[0];
      const b = marks[marks.length - 1];
      const span = (b[0] - a[0]) / 1000;
      if (span > 0.008) speed = (b[1] - a[1]) / span;
    }
    fling(speed);
  };

  dial.addEventListener("pointerup", release);
  dial.addEventListener("pointercancel", release);
  dial.addEventListener("lostpointercapture", release);

  window.addEventListener("resize", () => {
    measure();
    paint();
  });
}
