const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const card = document.getElementById("bento");
const grid = document.getElementById("bentoGrid");
const plate = document.getElementById("plate");
const turn = document.getElementById("plateTurn");
const reactBtns = Array.from(document.querySelectorAll(".react"));
const counts = Array.from(document.querySelectorAll("[data-count]"));
const liveCount = document.getElementById("liveCount");
const noteBtn = document.getElementById("noteBtn");
const noteOpen = document.getElementById("noteOpen");
const noteClosed = document.querySelector(".note__closed");
const shuffleBtn = document.getElementById("shuffle");
const footNote = document.getElementById("footNote");

const NOTES = [
  "Reviewed last night \u00b7 queue of about twenty",
  "Second visit \u00b7 the scallops were even better",
  "Rain held off \u00b7 the queue moved fast",
  "Off-peak lunch \u00b7 sold out by 13:10"
];

let spin = 0;
let dragging = false;
let pointerId = null;
let startX = 0;
let startSpin = 0;

function render() {
  const norm = ((Math.round(spin) % 360) + 360) % 360;
  turn.style.setProperty("--spin", norm + "deg");
}

function setSpin(next) {
  spin = next;
  render();
}

plate.addEventListener("pointerdown", function (event) {
  dragging = true;
  pointerId = event.pointerId;
  startX = event.clientX;
  startSpin = spin;
  plate.classList.add("is-grabbing");
  if (plate.setPointerCapture) {
    plate.setPointerCapture(pointerId);
  }
});

plate.addEventListener("pointermove", function (event) {
  if (!dragging) {
    return;
  }
  setSpin(startSpin + (event.clientX - startX) * 1.5);
});

function endDrag() {
  if (!dragging) {
    return;
  }
  dragging = false;
  plate.classList.remove("is-grabbing");
  if (pointerId !== null && plate.hasPointerCapture && plate.hasPointerCapture(pointerId)) {
    plate.releasePointerCapture(pointerId);
  }
  pointerId = null;
}

plate.addEventListener("pointerup", endDrag);
plate.addEventListener("pointercancel", endDrag);
plate.addEventListener("pointerleave", endDrag);

function drift() {
  if (reduce) {
    return;
  }
  if (!dragging) {
    setSpin(spin + 0.5);
  }
  window.setTimeout(drift, 16);
}

plate.addEventListener("keydown", function (event) {
  if (event.key === "ArrowRight") {
    event.preventDefault();
    setSpin(spin + 30);
  } else if (event.key === "ArrowLeft") {
    event.preventDefault();
    setSpin(spin - 30);
  }
});

const tally = {
  fire: 128,
  chef: 64,
  again: 41
};

const outNodes = {
  fire: document.getElementById("nFire"),
  chef: document.getElementById("nChef"),
  again: document.getElementById("nAgain")
};

function rise(node, to) {
  const from = Number(node.textContent) || 0;
  if (reduce || from === to) {
    node.textContent = String(to);
    return;
  }
  node.classList.remove("is-pop");
  node.getBoundingClientRect();
  node.classList.add("is-pop");
  const began = Date.now();
  const span = 620;
  function step() {
    const t = Math.min(1, (Date.now() - began) / span);
    const eased = 1 - Math.pow(1 - t, 3);
    const bounce = Math.sin(t * Math.PI * 2) * 3 * (1 - t);
    node.textContent = String(Math.round(from + (to - from) * eased + bounce));
    if (t < 1) {
      window.setTimeout(step, 20);
    } else {
      node.textContent = String(to);
    }
  }
  step();
}

reactBtns.forEach(function (btn) {
  const kind = btn.dataset.react;
  btn.addEventListener("click", function () {
    const on = btn.getAttribute("aria-pressed") === "true";
    btn.setAttribute("aria-pressed", on ? "false" : "true");
    tally[kind] = on ? tally[kind] - 1 : tally[kind] + 1;
    rise(outNodes[kind], tally[kind]);
    if (on) {
      btn.classList.remove("is-pop");
    }
  });
});

noteBtn.addEventListener("click", function () {
  const open = noteBtn.getAttribute("aria-expanded") === "true";
  noteBtn.setAttribute("aria-expanded", open ? "false" : "true");
  noteBtn.textContent = open ? "Unfold the note" : "Fold the note";
  if (open) {
    noteOpen.hidden = true;
    noteClosed.classList.remove("is-gone");
    return;
  }
  noteClosed.classList.add("is-gone");
  noteOpen.hidden = false;
  noteOpen.classList.remove("note__open");
  noteOpen.getBoundingClientRect();
  noteOpen.classList.add("note__open");
});

shuffleBtn.addEventListener("click", function () {
  const on = shuffleBtn.getAttribute("aria-pressed") === "true";
  shuffleBtn.setAttribute("aria-pressed", on ? "false" : "true");
  if (reduce) {
    grid.classList.toggle("is-shuffled", !on);
    return;
  }
  const blocks = Array.from(grid.children);
  const first = new Map();
  blocks.forEach(function (blk) {
    first.set(blk, blk.getBoundingClientRect());
  });
  grid.classList.toggle("is-shuffled", !on);
  blocks.forEach(function (blk) {
    const before = first.get(blk);
    const after = blk.getBoundingClientRect();
    const dx = before.left - after.left;
    const dy = before.top - after.top;
    const dw = before.width - after.width;
    const dh = before.height - after.height;
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1 && Math.abs(dh) < 1) {
      return;
    }
    blk.style.transition = "none";
    blk.style.transformOrigin = "50% 50%";
    blk.style.transform =
      "translate3d(" + dx.toFixed(1) + "px," + dy.toFixed(1) + "px,0) scale(" +
      (1 + Math.max(Math.abs(dh), Math.abs(dw)) / 900).toFixed(3) + ")";
    blk.getBoundingClientRect();
    blk.style.transition = "transform 0.62s cubic-bezier(0.34, 1.2, 0.5, 1)";
    blk.style.transform = "";
    window.setTimeout(function () {
      blk.style.transition = "";
    }, 680);
  });
  const n = NOTES.indexOf(footNote.textContent) + 1;
  footNote.textContent = NOTES[n % NOTES.length];
  if (!reduce) {
    footNote.classList.remove("is-fresh");
    footNote.getBoundingClientRect();
    footNote.classList.add("is-fresh");
  }
});

function runCount(node) {
  const to = Number(node.dataset.count) || 0;
  const decimals = String(to).includes(".") ? 1 : 0;
  if (reduce) {
    node.textContent = String(to);
    return;
  }
  const began = Date.now();
  const span = 760;
  function step() {
    const t = Math.min(1, (Date.now() - began) / span);
    const eased = 1 - Math.pow(1 - t, 3);
    node.textContent = (to * eased).toFixed(decimals);
    if (t < 1) {
      window.setTimeout(step, 24);
    } else {
      node.textContent = String(to);
    }
  }
  step();
}

counts.forEach((...args) => runCount(...args));

function wanderLive() {
  if (reduce) {
    return;
  }
  const value = 14 + Math.floor(Math.random() * 12);
  liveCount.textContent = String(value);
  window.setTimeout(wanderLive, 1400 + Math.floor(Math.random() * 900));
}

setSpin(0);
drift();
wanderLive();

window.setTimeout(function () {
  card.classList.add("is-settled");
}, 800);
