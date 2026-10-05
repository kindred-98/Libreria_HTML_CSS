const MONTH_FULL = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTH_ABBR = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const summaryOut = document.querySelector("#summary");
const noteOut = document.querySelector("#note");
const todayLabel = document.querySelector("#todayLabel");
const todayBtn = document.querySelector("#todayBtn");
const confirmBtn = document.querySelector("#confirmBtn");

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
const now = () => performance.now();
const clampNum = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

const today = new Date();
const cols = [];
let raf = 0;

function apply(col) {
  col.strip.style.setProperty("--i", col.pos.toFixed(4));
  const items = col.items;
  for (let k = 0; k < items.length; k += 1) {
    const d = k - col.pos;
    const ad = Math.abs(d);
    const item = items[k];
    if (ad > 2.6) {
      if (col.pose[k] !== "x") {
        item.style.transform = "";
        item.style.opacity = "0";
        col.pose[k] = "x";
      }
      continue;
    }
    const key = d.toFixed(2);
    if (col.pose[k] === key) continue;
    item.style.transform = `perspective(340px) rotateX(${(-d * 25).toFixed(1)}deg) scale(${(1 - ad * 0.05).toFixed(3)})`;
    item.style.opacity = String(Math.max(0, 1 - ad * 0.26).toFixed(3));
    col.pose[k] = key;
  }
  const idx = clampNum(Math.round(col.pos), 0, items.length - 1);
  if (idx !== col.idx) {
    col.idx = idx;
    if (col.select.value !== String(idx)) col.select.value = String(idx);
    updateSummary();
  }
}

function tick(time) {
  raf = 0;
  let alive = false;
  for (const col of cols) {
    if (!col.anim) continue;
    const dt = clampNum((time - col.last) / 1000, 0.001, 0.034);
    col.last = time;
    const accel = (col.target - col.pos) * 300 - col.vel * 26;
    col.vel += accel * dt;
    col.pos += col.vel * dt;
    if (Math.abs(col.target - col.pos) < 0.0015 && Math.abs(col.vel) < 0.03) {
      col.pos = col.target;
      col.vel = 0;
      col.anim = false;
    }
    apply(col);
    if (col.anim) alive = true;
  }
  if (alive) raf = requestAnimationFrame(tick);
}

function wake() {
  if (!raf) raf = requestAnimationFrame(tick);
}

function goTo(col, target, velocity) {
  const goal = clampNum(Math.round(target), 0, col.items.length - 1);
  col.target = goal;
  if (reduced.matches) {
    col.pos = goal;
    col.vel = 0;
    col.anim = false;
    apply(col);
    return;
  }
  col.vel = velocity || 0;
  col.anim = true;
  col.last = now();
  wake();
}

function updateSummary() {
  if (!summaryOut) return;
  const dayCol = cols[0];
  const monthCol = cols[1];
  const yearCol = cols[2];
  if (!dayCol || !monthCol || !yearCol) return;
  const day = Number(dayCol.items[dayCol.idx].textContent);
  const month = monthCol.idx;
  const year = yearCol.items[yearCol.idx].textContent;
  summaryOut.textContent = `${day} ${MONTH_FULL[month]} ${year}`;
  if (noteOut && noteOut.classList.contains("is-done")) {
    noteOut.classList.remove("is-done");
    noteOut.textContent = "Pick a date, then confirm.";
  }
}

for (const name of ["day", "month", "year"]) {
  const root = document.querySelector(`[data-wheel="${name}"]`);
  if (!root) continue;
  const strip = root.querySelector(`[data-strip="${name}"]`);
  const select = root.querySelector(`[data-select="${name}"]`);
  if (!strip || !select) continue;

  const items = Array.from(strip.children);
  items.forEach((item, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    if (name === "month") option.textContent = MONTH_FULL[index];
    else option.textContent = item.textContent;
    select.appendChild(option);
  });

  let initial = 0;
  if (name === "day") initial = clampNum(today.getDate() - 1, 0, items.length - 1);
  if (name === "month") initial = today.getMonth();
  if (name === "year") {
    const wanted = String(today.getFullYear());
    const found = items.findIndex((item) => item.textContent.trim() === wanted);
    initial = Math.max(found, 0);
  }

  const col = {
    root,
    strip,
    select,
    items,
    pose: items.map(() => ""),
    pos: initial,
    target: initial,
    idx: -1,
    vel: 0,
    anim: false,
    last: 0,
    drag: false,
    moved: false,
    suppress: false,
    startY: 0,
    lastY: 0,
    lastT: 0,
    wheelAt: 0,
    name
  };
  cols.push(col);
  select.value = String(initial);
  apply(col);

  if (name === "day") {
    const marker = items[today.getDate() - 1];
    if (marker) marker.classList.add("is-today");
  }

  root.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    col.drag = true;
    col.moved = false;
    col.suppress = false;
    col.startY = event.clientY;
    col.lastY = event.clientY;
    col.lastT = now();
    col.anim = false;
    col.vel = 0;
    try { root.setPointerCapture(event.pointerId); } catch { }
  });

  root.addEventListener("pointermove", (event) => {
    if (!col.drag) return;
    const dy = event.clientY - col.lastY;
    const t = now();
    const dt = clampNum((t - col.lastT) / 1000, 0.004, 0.05);
    if (!col.moved && Math.abs(event.clientY - col.startY) > 5) col.moved = true;
    col.lastY = event.clientY;
    col.lastT = t;
    if (!col.moved) return;
    event.preventDefault();
    const delta = -dy / Math.max(1, col.items[0].offsetHeight);
    col.pos = clampNum(col.pos + delta, 0, col.items.length - 1);
    col.vel = (delta / dt) * 0.55;
    col.target = clampNum(Math.round(col.pos), 0, col.items.length - 1);
    apply(col);
  });

  const release = (event) => {
    if (!col.drag) return;
    col.drag = false;
    try { root.releasePointerCapture(event.pointerId); } catch { }
    if (!col.moved) {
      col.select.focus();
      col.suppress = false;
      return;
    }
    const thrown = clampNum(col.vel * 0.09, -5, 5);
    goTo(col, col.pos + thrown, col.vel * 0.3);
  };
  root.addEventListener("pointerup", release);
  root.addEventListener("pointercancel", release);

  root.addEventListener("wheel", (event) => {
    event.preventDefault();
    const t = now();
    if (t - col.wheelAt < 90) return;
    col.wheelAt = t;
    const base = col.anim ? col.target : Math.round(col.pos);
    goTo(col, base + (event.deltaY > 0 ? 1 : -1), 0);
  }, { passive: false });

  select.addEventListener("change", () => {
    goTo(col, Number(select.value), 0);
  });

  select.addEventListener("click", (event) => {
    if (col.suppress) {
      event.preventDefault();
      col.suppress = false;
    }
  });

  select.addEventListener("keydown", (event) => {
    if (event.key === "PageUp" || event.key === "PageDown") {
      event.preventDefault();
      const page = Math.max(1, Math.round(col.items.length / 5));
      const base = col.anim ? col.target : Math.round(col.pos);
      goTo(col, base + (event.key === "PageUp" ? page : -page), 0);
    }
  });
}

if (todayLabel) {
  todayLabel.textContent = `${today.getDate()} ${MONTH_ABBR[today.getMonth()]} ${today.getFullYear()}`;
}

if (todayBtn) {
  todayBtn.addEventListener("click", () => {
    cols.forEach((col, index) => {
      if (index === 0) goTo(col, today.getDate() - 1, 0);
      else if (index === 1) goTo(col, today.getMonth(), 0);
      else {
        const wanted = String(today.getFullYear());
        const found = col.items.findIndex((item) => item.textContent.trim() === wanted);
        goTo(col, Math.max(found, 0), 0);
      }
    });
  });
}

if (confirmBtn && noteOut) {
  confirmBtn.addEventListener("click", () => {
    const value = summaryOut ? summaryOut.textContent : "";
    noteOut.textContent = `Table held for ${value}`;
    noteOut.classList.add("is-done");
  });
}

updateSummary();

window.addEventListener("resize", () => {
  cols.forEach((col) => {
    col.pose = col.items.map(() => "");
    apply(col);
  });
});
