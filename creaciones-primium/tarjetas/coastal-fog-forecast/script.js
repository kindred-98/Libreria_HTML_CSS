const rail = document.getElementById("fogRail");
const prev = document.getElementById("fogPrev");
const next = document.getElementById("fogNext");
const now = document.getElementById("fogNow");
const vis = document.getElementById("fogVis");
const temp = document.getElementById("fogTemp");
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function stepWidth() {
  const first = rail.querySelector(".hour");
  const gap = Number.parseFloat(getComputedStyle(rail.querySelector(".strip__track")).columnGap || "0") || 8;
  return first ? first.getBoundingClientRect().width + gap : 96;
}

function clampTarget(value) {
  const max = Math.max(0, rail.scrollWidth - rail.clientWidth);
  return Math.min(max, Math.max(0, value));
}

let glide = 0;
let wanted = 0;

function animateTo(target) {
  glide += 1;
  const to = clampTarget(target);
  wanted = to;
  const from = rail.scrollLeft;
  if (reduce || Math.abs(to - from) < 1) {
    rail.scrollLeft = to;
    return;
  }
  const run = glide;
  const duration = 340;
  const start = performance.now();
  const delta = to - from;

  function step() {
    if (run !== glide) {
      return;
    }
    const t = Math.min(1, (performance.now() - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    rail.scrollLeft = from + delta * eased;
    if (t < 1) {
      setTimeout(step, 16);
    }
  }

  step();
}

function scrollBy(direction) {
  animateTo(wanted + direction * stepWidth());
}

prev.addEventListener("click", function () {
  scrollBy(-1);
});

next.addEventListener("click", function () {
  scrollBy(1);
});

now.addEventListener("click", function () {
  animateTo(0);
});

rail.addEventListener("keydown", function (event) {
  if (event.key === "ArrowRight") {
    event.preventDefault();
    scrollBy(1);
  } else if (event.key === "ArrowLeft") {
    event.preventDefault();
    scrollBy(-1);
  } else if (event.key === "Home") {
    event.preventDefault();
    animateTo(0);
  }
});

let dragging = false;
let startX = 0;
let startLeft = 0;
let moved = 0;

rail.addEventListener("pointerdown", function (event) {
  if (event.button !== 0) {
    return;
  }
  dragging = true;
  moved = 0;
  glide += 1;
  startX = event.clientX;
  startLeft = rail.scrollLeft;
  rail.classList.add("is-drag");
  rail.setPointerCapture(event.pointerId);
});

rail.addEventListener("pointermove", function (event) {
  if (!dragging) {
    return;
  }
  const delta = event.clientX - startX;
  moved = Math.abs(delta);
  rail.scrollLeft = startLeft - delta;
  wanted = rail.scrollLeft;
});

function endDrag(event) {
  if (!dragging) {
    return;
  }
  dragging = false;
  rail.classList.remove("is-drag");
  if (event && event.pointerId !== undefined && rail.hasPointerCapture(event.pointerId)) {
    rail.releasePointerCapture(event.pointerId);
  }
}

rail.addEventListener("pointerup", endDrag);
rail.addEventListener("pointercancel", endDrag);
rail.addEventListener("pointerleave", function () {
  if (dragging) {
    endDrag();
  }
});

rail.addEventListener("wheel", function (event) {
  if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
    return;
  }
  rail.scrollLeft += event.deltaY;
  event.preventDefault();
}, { passive: false });

const VISIBILITY = [240, 210, 185, 170, 320, 480, 760, 1400, 2600, 4200, 6400, 8200];
const TEMPS = [9, 9, 8, 8, 9, 10, 11, 12, 12, 13, 14, 15];

function runCount(node, target, format) {
  const duration = 620;
  const start = performance.now();

  function step() {
    const t = Math.min(1, (performance.now() - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    node.textContent = format(target * eased);
    if (t < 1) {
      setTimeout(step, 22);
    } else {
      node.textContent = format(target);
    }
  }

  step();
}

const thousands = function (value) {
  return Math.round(value).toLocaleString("en-US");
};

if (reduce) {
  vis.textContent = thousands(VISIBILITY[0]);
  temp.textContent = String(TEMPS[0]);
} else {
  runCount(vis, VISIBILITY[0], thousands);
  runCount(temp, TEMPS[0], String);
}

const hours = Array.from(document.querySelectorAll(".hour"));
let activeIndex = 0;

function paint() {
  hours.forEach(function (hour, index) {
    hour.classList.toggle("is-active", index === activeIndex);
    hour.classList.toggle("is-low", VISIBILITY[index] < 600);
  });
}

setInterval(function () {
  activeIndex = (activeIndex + 1) % hours.length;
  paint();
  vis.textContent = thousands(VISIBILITY[activeIndex]);
}, 3400);

paint();
