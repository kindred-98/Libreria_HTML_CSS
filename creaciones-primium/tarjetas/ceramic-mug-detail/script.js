const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const card = document.getElementById("mug");
const viewer = document.getElementById("viewer");
const degOut = document.getElementById("deg");
const handle = document.getElementById("cupHandle");
const spec = document.getElementById("cupSpec");
const bead = document.getElementById("cupBead");
const body = document.querySelector(".cup__body");
const glaze = document.querySelector(".cup__glaze");
const thumbs = Array.from(document.querySelectorAll(".thumb"));
const chips = Array.from(document.querySelectorAll(".chip"));
const counts = Array.from(document.querySelectorAll("[data-count]"));

let angle = 28;
let dragging = false;
let pointerId = null;
let startX = 0;
let startAngle = 28;

function render() {
  const norm = ((Math.round(angle) % 360) + 360) % 360;
  const rad = (norm * Math.PI) / 180;
  const face = Math.max(0, Math.cos(rad));
  const side = Math.sin(rad);
  viewer.style.setProperty("--spin", norm + "deg");
  viewer.style.setProperty("--face", face.toFixed(3));
  viewer.style.setProperty("--side", side.toFixed(3));
  degOut.textContent = norm + "\u00b0";
}

function syncThumbs() {
  const norm = ((Math.round(angle) % 360) + 360) % 360;
  let best = null;
  let bestDiff = 999;
  thumbs.forEach(function (thumb) {
    const target = Number(thumb.dataset.angle) || 0;
    let diff = Math.abs(target - norm);
    if (diff > 180) {
      diff = 360 - diff;
    }
    if (diff < bestDiff) {
      bestDiff = diff;
      best = thumb;
    }
  });
  thumbs.forEach(function (thumb) {
    const on = thumb === best && bestDiff <= 32;
    thumb.classList.toggle("is-on", on);
    thumb.setAttribute("aria-pressed", on ? "true" : "false");
  });
}

function setAngle(next) {
  angle = next;
  render();
  syncThumbs();
}

viewer.addEventListener("pointerdown", function (event) {
  dragging = true;
  auto = false;
  pointerId = event.pointerId;
  startX = event.clientX;
  lastX = event.clientX;
  startAngle = angle;
  viewer.classList.add("is-grabbing");
  if (viewer.setPointerCapture) {
    viewer.setPointerCapture(pointerId);
  }
});

viewer.addEventListener("pointermove", function (event) {
  if (!dragging) {
    return;
  }
  setAngle(startAngle + (event.clientX - startX) * 0.8);
});

function endDrag() {
  if (!dragging) {
    return;
  }
  dragging = false;
  viewer.classList.remove("is-grabbing");
  if (pointerId !== null && viewer.hasPointerCapture && viewer.hasPointerCapture(pointerId)) {
    viewer.releasePointerCapture(pointerId);
  }
  pointerId = null;
}

viewer.addEventListener("pointerup", endDrag);
viewer.addEventListener("pointercancel", endDrag);
viewer.addEventListener("pointerleave", endDrag);

let inertia = 0;
let auto = true;
let lastX = 0;

viewer.addEventListener("pointermove", function (event) {
  if (dragging) {
    inertia = event.clientX - lastX;
    lastX = event.clientX;
  }
});

function glide() {
  if (reduce) {
    return;
  }
  if (!dragging) {
    if (Math.abs(inertia) >= 0.05) {
      angle += inertia * 0.55;
      inertia *= 0.9;
    } else {
      inertia = 0;
      if (auto) {
        angle += 0.42;
      }
    }
    setAngle(angle);
  }
  window.setTimeout(glide, 16);
}

thumbs.forEach(function (thumb) {
  thumb.addEventListener("click", function () {
    inertia = 0;
    auto = false;
    const target = Number(thumb.dataset.angle) || 0;
    const norm = ((Math.round(angle) % 360) + 360) % 360;
    let diff = target - norm;
    if (diff > 180) {
      diff -= 360;
    }
    if (diff < -180) {
      diff += 360;
    }
    const hops = 46;
    const from = angle;
    const began = Date.now();
    const span = 620;
    if (reduce) {
      setAngle(target);
      return;
    }
    body.style.transition = "";
    function step() {
      const t = Math.min(1, (Date.now() - began) / span);
      const eased = 1 - Math.pow(1 - t, 3);
      setAngle(from + diff * eased + Math.sin(t * Math.PI * hops) * 5 * (1 - t));
      if (t < 1) {
        window.setTimeout(step, 16);
      } else {
        setAngle(target);
        auto = true;
      }
    }
    step();
  });
});

chips.forEach(function (chip) {
  chip.addEventListener("click", function () {
    const glazeName = chip.dataset.glaze;
    chips.forEach(function (other) {
      const on = other === chip;
      other.classList.toggle("is-on", on);
      other.setAttribute("aria-pressed", on ? "true" : "false");
    });
    body.classList.remove("cup__body--iron", "cup__body--celadon");
    glaze.classList.remove("cup__glaze--iron", "cup__glaze--celadon");
    if (glazeName === "iron") {
      body.classList.add("cup__body--iron");
      glaze.classList.add("cup__glaze--iron");
    }
    if (glazeName === "celadon") {
      body.classList.add("cup__body--celadon");
      glaze.classList.add("cup__glaze--celadon");
    }
    handle.classList.remove("cup__handle--iron", "cup__handle--celadon");
    if (glazeName !== "oat") {
      handle.classList.add("cup__handle--" + glazeName);
    }
    viewer.classList.remove("is-morph");
    viewer.getBoundingClientRect();
    viewer.classList.add("is-morph");
  });
});

const addBtn = document.getElementById("add");
addBtn.addEventListener("click", function () {
  const on = addBtn.getAttribute("aria-pressed") === "true";
  addBtn.setAttribute("aria-pressed", on ? "false" : "true");
  addBtn.textContent = on ? "Add to basket" : "In your basket";
});

const saveBtn = document.getElementById("save");
saveBtn.addEventListener("click", function () {
  saveBtn.setAttribute("aria-pressed", saveBtn.getAttribute("aria-pressed") === "true" ? "false" : "true");
});

viewer.addEventListener("keydown", function (event) {
  if (event.key === "ArrowRight") {
    event.preventDefault();
    inertia = 0;
    setAngle(angle + 22);
  } else if (event.key === "ArrowLeft") {
    event.preventDefault();
    inertia = 0;
    setAngle(angle - 22);
  }
});

function runCount(node) {
  const to = Number(node.dataset.count) || 0;
  if (reduce) {
    node.textContent = String(to);
    return;
  }
  const began = Date.now();
  const span = 760;
  function step() {
    const t = Math.min(1, (Date.now() - began) / span);
    node.textContent = String(Math.round(to * (1 - Math.pow(1 - t, 3))));
    if (t < 1) {
      window.setTimeout(step, 24);
    } else {
      node.textContent = String(to);
    }
  }
  step();
}

counts.forEach((...args) => runCount(...args));

setAngle(angle);
glide();

window.setTimeout(function () {
  card.classList.add("is-settled");
  inertia = 0;
}, 820);

window.setTimeout(function () {
  auto = true;
}, 1400);
