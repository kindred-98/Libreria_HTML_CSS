const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const card = document.getElementById("meter");
const rail = document.getElementById("rail");
const track = document.getElementById("track");
const cursor = document.getElementById("cursor");
const hours = Array.from(document.querySelectorAll(".hour"));
const stripRead = document.getElementById("stripRead");
const stripHint = document.getElementById("stripHint");
const navPrev = document.getElementById("navPrev");
const navNext = document.getElementById("navNext");
const alert = document.getElementById("alert");
const alertBtn = document.getElementById("alertBtn");
const heroChip = document.getElementById("heroChip");
const counts = Array.from(document.querySelectorAll("[data-count]"));

const PEAK_INDEX = hours.findIndex(function (h) {
  return h.classList.contains("is-peak");
});

const KW = [0.4, 0.36, 0.34, 0.36, 0.5, 0.9, 1.6, 2.1, 1.4, 0.8, 0.7, 0.72,
  1.0, 1.1, 0.9, 1.0, 1.6, 3.1, 3.4, 3.3, 2.7, 1.8, 1.2, 0.8, 0.4, 0.36, 0.34];

let offset = 0;
let dragging = false;
let pointerId = null;
let startX = 0;
let startOffset = 0;

function maxOffset() {
  return Math.max(0, track.scrollWidth - rail.clientWidth);
}

function clampOffset(value) {
  const max = maxOffset();
  return value < 0 ? 0 : value > max ? max : value;
}

function render() {
  const value = clampOffset(offset);
  offset = value;
  track.style.setProperty("--sx", (-value).toFixed(1) + "px");
  cursor.style.setProperty("--cx", (value * 0.86 + 10).toFixed(1) + "px");
  const index = Math.round(value / 26);
  const slot = hours[Math.min(hours.length - 1, Math.max(0, index + 2))];
  if (slot) {
    const kw = KW[Math.min(KW.length - 1, index + 2)];
    const isPeak = slot.classList.contains("is-peak");
    stripRead.textContent =
      (isPeak ? "Peak hour " : "Hour ") + slot.querySelector(".hour__t").textContent +
      ":00 \u00b7 " + kw.toFixed(1) + " kW forecast";
    heroChip.textContent = isPeak
      ? "Above your usual for this hour"
      : "Below your usual for this hour";
    heroChip.classList.toggle("is-warn", isPeak);
  }
  return value;
}

rail.addEventListener("pointerdown", function (event) {
  dragging = true;
  pointerId = event.pointerId;
  startX = event.clientX;
  startOffset = offset;
  rail.classList.add("is-grabbing");
  if (rail.setPointerCapture) {
    rail.setPointerCapture(pointerId);
  }
});

rail.addEventListener("pointermove", function (event) {
  if (!dragging) {
    return;
  }
  offset = startOffset - (event.clientX - startX);
  render();
});

function endDrag() {
  if (!dragging) {
    return;
  }
  dragging = false;
  rail.classList.remove("is-grabbing");
  if (pointerId !== null && rail.hasPointerCapture && rail.hasPointerCapture(pointerId)) {
    rail.releasePointerCapture(pointerId);
  }
  pointerId = null;
}

rail.addEventListener("pointerup", endDrag);
rail.addEventListener("pointercancel", endDrag);
rail.addEventListener("pointerleave", endDrag);

rail.addEventListener("keydown", function (event) {
  if (event.key === "ArrowRight") {
    event.preventDefault();
    offset += 78;
    render();
  } else if (event.key === "ArrowLeft") {
    event.preventDefault();
    offset -= 78;
    render();
  }
});

navNext.addEventListener("click", function () {
  offset += 104;
  render();
});

navPrev.addEventListener("click", function () {
  offset -= 104;
  render();
});

alertBtn.addEventListener("click", function () {
  const on = alertBtn.getAttribute("aria-pressed") === "true";
  alertBtn.setAttribute("aria-pressed", on ? "false" : "true");
  alertBtn.textContent = on ? "Plan around it" : "Reminder set";
  alert.classList.toggle("is-off", on);
  alert.querySelector(".alert__text").innerHTML = on
    ? "<b>Peak window</b> forecast 18:00 to 21:00, above the local average."
    : "<b>Shifted.</b> Dishwasher and EV charging now run after 22:00.";
});

function runCount(node) {
  const raw = node.dataset.count || "0";
  const to = Number(raw) || 0;
  const parts = String(raw).split(".");
  const decimals = parts.length > 1 ? parts[1].length : 0;
  if (reduce) {
    node.textContent = to.toFixed(decimals);
    return;
  }
  const began = Date.now();
  const span = 780;
  function step() {
    const t = Math.min(1, (Date.now() - began) / span);
    const eased = 1 - Math.pow(1 - t, 3);
    node.textContent = (to * eased).toFixed(decimals);
    if (t < 1) {
      window.setTimeout(step, 24);
    } else {
      node.textContent = to.toFixed(decimals);
    }
  }
  step();
}

counts.forEach(runCount);

function settle() {
  if (reduce || dragging) {
    return;
  }
  const target = PEAK_INDEX * 26 - 40;
  const from = offset;
  const began = Date.now();
  const span = 900;
  function step() {
    const t = Math.min(1, (Date.now() - began) / span);
    const eased = 1 - Math.pow(1 - t, 3);
    offset = from + (target - from) * eased;
    render();
    if (t < 1) {
      window.setTimeout(step, 20);
    }
  }
  step();
}

render();
window.setTimeout(function () {
  card.classList.add("is-settled");
}, 800);
window.setTimeout(settle, 900);
