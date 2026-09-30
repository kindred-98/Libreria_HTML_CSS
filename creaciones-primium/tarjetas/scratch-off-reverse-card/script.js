const spin = document.getElementById("spin");
const flip = document.getElementById("flip");
const peel = document.getElementById("peel");
const skin = document.getElementById("skin");
const cells = Array.prototype.slice.call(skin.querySelectorAll("i"));

let touched = false;
let cleared = 0;
let finished = false;

function clearCell(cell, delay) {
  if (!cell || cell.dataset.done === "1") {
    return;
  }
  cell.dataset.done = "1";
  setTimeout(function () {
    cell.classList.add("is-off");
  }, delay);
}

function finish() {
  if (finished) {
    return;
  }
  finished = true;
  setTimeout(function () {
    skin.classList.add("is-gone");
    peel.disabled = true;
    peel.textContent = "Foil removed";
  }, 240);
}

function scratch(event) {
  const target = event.target;
  if (!target || target.tagName !== "I") {
    return;
  }
  touched = true;
  skin.classList.add("is-touched");
  clearCell(target, 0);
  cleared += 1;
  if (cleared > 13) {
    finish();
  }
}

skin.addEventListener("pointerdown", scratch);
skin.addEventListener("pointermove", function (event) {
  if (event.buttons) {
    scratch(event);
  }
});

peel.addEventListener("click", function () {
  touched = true;
  skin.classList.add("is-touched");
  cells.forEach(function (cell, index) {
    clearCell(cell, index * 12);
  });
  finish();
});

flip.addEventListener("click", function () {
  const on = flip.getAttribute("aria-pressed") === "true";
  flip.setAttribute("aria-pressed", on ? "false" : "true");
  flip.textContent = on ? "Show the reward" : "Back to the card";
  spin.classList.toggle("is-flipped", !on);
});

setTimeout(function () {
  if (touched) {
    return;
  }
  const list = cells.slice().sort(function (a, b) {
    const ia = cells.indexOf(a);
    const ib = cells.indexOf(b);
    return Math.floor(ia / 8) + (ia % 8) - (Math.floor(ib / 8) + (ib % 8));
  });
  list.forEach(function (cell, index) {
    clearCell(cell, index * 16);
  });
  setTimeout(finish, list.length * 16 + 140);
}, 1000);
