const wheel = document.querySelector("#wheel");
const strip = document.querySelector("#stationList");
const field = document.querySelector("#stationField");
const freqOut = document.querySelector("#nowFreq");
const tagOut = document.querySelector("#nowTag");
const noteOut = document.querySelector("#tunerNote");
const tuneBtn = document.querySelector("#tuneBtn");
const topBtn = document.querySelector("#topBtn");
const endBtn = document.querySelector("#endBtn");

if (wheel && strip && field) {
  const rows = Array.from(strip.children);
  const LAST = rows.length - 1;
  const TAGS = [
    "late broadcast", "all night freight", "warm analogue", "slow and wide",
    "paper and tape", "cold north sea", "soft velvet", "quiet terminal",
    "salt on the wire", "long wave memory", "ferry crossing", "last signal"
  ];
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const FRICTION = 0.035;
  const STEP = 1 / 240;
  const clamp = (n, lo, hi) => {
    if (n < lo) return lo;
    if (n > hi) return hi;
    return n;
  };
  const now = () => performance.now();

  let pos = 7;
  let vel = 0;
  let target = 7;
  let mode = "idle";
  let raf = 0;
  let last = 0;
  let carry = 0;
  let rowH = 40;
  let wheelH = 200;
  let live = 7;
  let committed = -1;
  let shown = "";
  let drag = null;
  let wheelAt = 0;

  const nameOf = (i) => rows[clamp(i, 0, LAST)].querySelector("b").textContent;
  const freqOf = (i) => rows[clamp(i, 0, LAST)].querySelector("s").textContent;

  const measure = () => {
    rowH = rows[0].offsetHeight || 40;
    wheelH = wheel.offsetHeight || 200;
  };

  const render = () => {
    const mid = wheelH / 2 - rowH / 2;
    strip.style.transform = "translate3d(0," + (mid - pos * rowH).toFixed(2) + "px,0)";
    for (let k = 0; k < rows.length; k += 1) {
      const d = k - pos;
      const ad = Math.abs(d);
      const row = rows[k];
      if (ad > 3.3) {
        if (row.dataset.hidden !== "1") {
          row.style.opacity = "0";
          row.dataset.hidden = "1";
        }
        continue;
      }
      const key = d.toFixed(2);
      if (row.dataset.key === key) continue;
      row.dataset.key = key;
      row.dataset.hidden = "0";
      row.style.transform = "perspective(420px) rotateX(" + (-d * 20).toFixed(2) + "deg) scale(" + (1 - ad * 0.06).toFixed(3) + ")";
      row.style.opacity = String(Math.max(0, 1 - ad * 0.28).toFixed(3));
    }
    const idx = clamp(Math.round(pos), 0, LAST);
    if (idx !== live) {
      live = idx;
      if (freqOut) freqOut.textContent = freqOf(idx);
      if (tagOut) tagOut.textContent = TAGS[idx];
      const label = nameOf(idx);
      if (label !== shown) {
        shown = label;
        field.value = label;
      }
    }
  };

  const commit = (note) => {
    const idx = clamp(Math.round(pos), 0, LAST);
    if (rows[idx]) rows[idx].setAttribute("aria-selected", "true");
    if (rows[committed] && committed !== idx) rows[committed].setAttribute("aria-selected", "false");
    committed = idx;
    field.setAttribute("aria-activedescendant", rows[idx].id);
    if (noteOut) noteOut.textContent = note;
  };

  const step = (dt) => {
    if (mode === "free") {
      pos += vel * dt;
      vel *= Math.pow(FRICTION, dt);
      if (pos <= 0) {
        pos = 0;
        vel = -vel * 0.14;
      } else if (pos >= LAST) {
        pos = LAST;
        vel = -vel * 0.14;
      }
      if (Math.abs(vel) < 3.4) {
        target = clamp(Math.round(pos), 0, LAST);
        mode = "seat";
      }
      return;
    }
    if (mode === "seat") {
      const k = 260;
      const c = 2 * 0.82 * Math.sqrt(k);
      const acc = (target - pos) * k - vel * c;
      vel += acc * dt;
      pos += vel * dt;
      if (pos < 0) {
        pos = 0;
        vel = -vel * 0.12;
      } else if (pos > LAST) {
        pos = LAST;
        vel = -vel * 0.12;
      }
      if (Math.abs(target - pos) < 0.0016 && Math.abs(vel) < 0.05) {
        pos = target;
        vel = 0;
        mode = "idle";
        commit(nameOf(target) + " is tuned in.");
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
    render();
    if (mode !== "idle") raf = requestAnimationFrame(tick);
  };

  const wake = () => {
    if (!raf) {
      last = now();
      carry = 0;
      raf = requestAnimationFrame(tick);
    }
  };

  const settle = (n, note) => {
    const goal = clamp(Math.round(n), 0, LAST);
    target = goal;
    if (reduced.matches) {
      pos = goal;
      vel = 0;
      mode = "idle";
      render();
      commit(note);
      return;
    }
    vel = 0;
    mode = "seat";
    wake();
  };

  const fling = (speed) => {
    if (reduced.matches) {
      settle(pos + speed * 0.05, nameOf(clamp(Math.round(pos + speed * 0.05), 0, LAST)) + " is tuned in.");
      return;
    }
    vel = clamp(speed, -26, 26);
    mode = "free";
    wake();
  };

  const jump = (n) => {
    const goal = clamp(n, 0, LAST);
    mode = "seat";
    target = goal;
    if (reduced.matches) {
      pos = goal;
      vel = 0;
      mode = "idle";
      render();
      commit(nameOf(goal) + " is tuned in.");
      return;
    }
    const far = Math.abs(goal - pos) > 4;
    vel = far ? (goal - pos) * 2.4 : 0;
    wake();
  };

  measure();
  rows.forEach((row) => {
    row.dataset.key = "";
    row.dataset.hidden = "0";
  });
  render();
  commit(nameOf(pos) + " is tuned in.");

  field.addEventListener("keydown", (event) => {
    const base = mode === "idle" ? live : target;
    let next = null;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") next = base + 1;
    else if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = base - 1;
    else if (event.key === "PageDown") next = base + 5;
    else if (event.key === "PageUp") next = base - 5;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = LAST;
    if (next !== null) {
      event.preventDefault();
      jump(next);
      return;
    }
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      commit(nameOf(target) + " is tuned in.");
    }
  });

  wheel.addEventListener("pointerdown", (event) => {
    if (event.button) return;
    mode = "drag";
    vel = 0;
    drag = { startY: event.clientY, startPos: clamp(pos, 0, LAST), marks: [[now(), pos]], moved: false };
    if (typeof wheel.setPointerCapture === "function") wheel.setPointerCapture(event.pointerId);
    field.focus({ preventScroll: true });
    event.preventDefault();
  });

  wheel.addEventListener("pointermove", (event) => {
    if (!drag) return;
    const dy = event.clientY - drag.startY;
    if (!drag.moved && Math.abs(dy) > 4) drag.moved = true;
    if (!drag.moved) return;
    event.preventDefault();
    const next = clamp(drag.startPos - dy / rowH, 0, LAST);
    if (next !== pos) {
      pos = next;
      drag.marks.push([now(), pos]);
      if (drag.marks.length > 6) drag.marks.shift();
      render();
    }
  });

  const release = (event) => {
    if (!drag) return;
    const marks = drag.marks;
    const moved = drag.moved;
    drag = null;
    if (event && typeof wheel.releasePointerCapture === "function") {
      try { wheel.releasePointerCapture(event.pointerId); } catch { }
    }
    if (!moved) {
      const box = wheel.getBoundingClientRect();
      const hit = Math.round((event.clientY - box.top - wheelH / 2) / rowH + pos);
      jump(hit);
      return;
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

  wheel.addEventListener("pointerup", release);
  wheel.addEventListener("pointercancel", release);
  wheel.addEventListener("lostpointercapture", release);

  wheel.addEventListener("wheel", (event) => {
    event.preventDefault();
    const t = now();
    if (t - wheelAt < 90) return;
    wheelAt = t;
    fling(event.deltaY > 0 ? 7 : -7);
  }, { passive: false });

  tuneBtn?.addEventListener("click", () => {
    commit(nameOf(mode === "idle" ? live : target) + " is tuned in.");
  });
  topBtn?.addEventListener("click", () => {
    field.focus({ preventScroll: true });
    jump(0);
  });
  endBtn?.addEventListener("click", () => {
    field.focus({ preventScroll: true });
    jump(LAST);
  });

  window.addEventListener("resize", () => {
    measure();
    render();
  });
}
