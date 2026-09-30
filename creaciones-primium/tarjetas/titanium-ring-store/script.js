const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const viewer = document.getElementById("viewer");
const ring = document.getElementById("ring");
const deg = document.getElementById("deg");
const thumbs = Array.from(document.querySelectorAll(".thumb"));
const swatches = Array.from(document.querySelectorAll(".swatch"));

let angle = 342;
let dragging = false;
let pointerId = null;
let startX = 0;
let startAngle = 342;

function render() {
  const norm = ((Math.round(angle) % 360) + 360) % 360;
  ring.style.setProperty("--spin", norm + "deg");
  deg.textContent = norm + "\u00b0";
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
    const on = thumb === best && bestDiff <= 40;
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
  pointerId = event.pointerId;
  startX = event.clientX;
  startAngle = angle;
  viewer.classList.add("is-grabbing");
  viewer.setPointerCapture(pointerId);
});

viewer.addEventListener("pointermove", function (event) {
  if (!dragging) {
    return;
  }
  const delta = (event.clientX - startX) * 0.85;
  setAngle(startAngle + delta);
});

function endDrag() {
  if (!dragging) {
    return;
  }
  dragging = false;
  viewer.classList.remove("is-grabbing");
  if (pointerId !== null && viewer.hasPointerCapture(pointerId)) {
    viewer.releasePointerCapture(pointerId);
  }
  pointerId = null;
}

viewer.addEventListener("pointerup", endDrag);
viewer.addEventListener("pointercancel", endDrag);

viewer.addEventListener("keydown", function (event) {
  if (event.key === "ArrowRight") {
    event.preventDefault();
    setAngle(angle + 15);
  } else if (event.key === "ArrowLeft") {
    event.preventDefault();
    setAngle(angle - 15);
  }
});

thumbs.forEach(function (thumb) {
  thumb.addEventListener("click", function () {
    const target = Number(thumb.dataset.angle) || 0;
    const norm = ((Math.round(angle) % 360) + 360) % 360;
    let diff = target - norm;
    if (diff > 180) {
      diff -= 360;
    }
    if (diff < -180) {
      diff += 360;
    }
    ring.style.transition = reduce ? "" : "transform 0.55s cubic-bezier(0.16,1,0.3,1)";
    setAngle(angle + diff);
    window.setTimeout(function () {
      ring.style.transition = "";
    }, 600);
  });
});

swatches.forEach(function (swatch) {
  swatch.addEventListener("click", function () {
    const finish = swatch.dataset.finish;
    swatches.forEach(function (other) {
      const on = other === swatch;
      other.classList.toggle("is-on", on);
      other.setAttribute("aria-pressed", on ? "true" : "false");
    });
    ring.classList.remove("ring--graphite", "ring--ion");
    if (finish === "graphite") {
      ring.classList.add("ring--graphite");
    }
    if (finish === "ion") {
      ring.classList.add("ring--ion");
    }
  });
});

const add = document.getElementById("add");
add.addEventListener("click", function () {
  const on = add.getAttribute("aria-pressed") === "true";
  add.setAttribute("aria-pressed", on ? "false" : "true");
  add.textContent = on ? "Add to bag" : "In your bag";
});

const save = document.getElementById("save");
save.addEventListener("click", function () {
  save.setAttribute("aria-pressed", save.getAttribute("aria-pressed") === "true" ? "false" : "true");
});

setAngle(angle);
