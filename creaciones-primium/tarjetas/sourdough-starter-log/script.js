const card = document.getElementById("sdl");
const stateChip = document.getElementById("sdlState");
const fill = document.getElementById("sdlFill");
const cursor = document.getElementById("sdlHead");
const dough = document.getElementById("sdlDough");
const phases = Array.prototype.slice.call(document.querySelectorAll(".ph"));
const feedBtn = document.getElementById("sdlFeed");
const fridgeBtn = document.getElementById("sdlFridge");

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const STAGES = [
  { at: 0.043, name: "Mix", rise: 0, bub: 6, ph: 5.1, temp: 22.4 },
  { at: 0.348, name: "Bulk rise", rise: 96, bub: 28, ph: 4.7, temp: 24.8 },
  { at: 0.652, name: "Peak proof", rise: 214, bub: 48, ph: 4.4, temp: 26.5 },
  { at: 0.957, name: "Cold retard", rise: 232, bub: 9, ph: 3.9, temp: 5.0 }
];

const STAGE_TEXT = {
  Mix: "Mixed",
  "Bulk rise": "Bulk rising",
  "Peak proof": "Peak proof",
  "Cold retard": "Cold retard"
};

let stage = 2;

function countTo(node, target, dec) {
  const step = Math.max(16, Math.round(760 / 30));
  let spent = 0;
  function frame() {
    spent += step;
    const t = Math.min(1, spent / 760);
    const eased = 1 - Math.pow(1 - t, 3);
    node.textContent = (target * eased).toFixed(dec || 0);
    if (t < 1) {
      setTimeout(frame, step);
    } else {
      node.textContent = target.toFixed(dec || 0);
    }
  }
  frame();
}

function paintStage(index) {
  const data = STAGES[index];
  stage = index;
  phases.forEach(function (node, i) {
    node.classList.toggle("is-done", i < index);
    node.classList.toggle("is-live", i === index);
  });
  cursor.style.setProperty("--p", data.at);
  fill.style.transform = "scaleX(" + data.at + ")";
  stateChip.classList.toggle("is-cold", index === 3);
  stateChip.lastChild.textContent = " " + STAGE_TEXT[data.name];
  dough.style.transform = "scaleY(" + (0.46 + data.rise / 620).toFixed(3) + ")";
  if (reduce) {
    return;
  }
  countTo(document.getElementById("sdlRise"), data.rise, 0);
  countTo(document.getElementById("sdlBub"), data.bub, 0);
  countTo(document.getElementById("sdlPh"), data.ph, 1);
  countTo(document.getElementById("sdlTemp"), data.temp, 1);
}

function walk() {
  stage = stage >= 3 ? 1 : stage + 1;
  paintStage(stage);
  setTimeout(walk, 5200);
}

let feeds = 0;

feedBtn.addEventListener("click", function () {
  feeds += 1;
  feedBtn.textContent = "Feed logged " + feeds;
});

fridgeBtn.addEventListener("click", function () {
  const on = fridgeBtn.getAttribute("aria-pressed") === "true";
  fridgeBtn.setAttribute("aria-pressed", on ? "false" : "true");
  fridgeBtn.textContent = on ? "Move to fridge" : "In the fridge";
  if (!on) {
    paintStage(3);
  }
});

if (!reduce) {
  setTimeout(walk, 2600);
}
