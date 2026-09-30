const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const stage = document.getElementById("stage");
const glass = document.getElementById("glass");
const faceFront = document.getElementById("faceFront");
const faceBack = document.getElementById("faceBack");
const flipFront = document.getElementById("flipFront");
const flipBack = document.getElementById("flipBack");

let flipped = false;

function sync() {
  if (!glass) {
    return;
  }
  glass.classList.toggle("is-flipped", flipped);
  if (flipFront) {
    flipFront.setAttribute("aria-pressed", flipped ? "true" : "false");
  }
  if (flipBack) {
    flipBack.setAttribute("aria-pressed", flipped ? "false" : "true");
  }
  if (faceFront && faceBack) {
    faceFront.inert = flipped;
    faceBack.inert = !flipped;
    faceFront.setAttribute("aria-hidden", flipped ? "true" : "false");
    faceBack.setAttribute("aria-hidden", flipped ? "false" : "true");
  }
}

function toggleFlip() {
  flipped = !flipped;
  sync();
}

if (flipFront) {
  flipFront.addEventListener("click", toggleFlip);
}

if (flipBack) {
  flipBack.addEventListener("click", toggleFlip);
}

sync();

if (stage && glass && !reduceMotion) {
  stage.addEventListener("pointermove", function (event) {
    const box = glass.getBoundingClientRect();
    if (!box.width || !box.height) {
      return;
    }
    const px = (event.clientX - box.left) / box.width;
    const py = (event.clientY - box.top) / box.height;
    glass.style.setProperty("--mx", ((px - 0.5) * 76).toFixed(1));
    glass.style.setProperty("--my", ((py - 0.5) * 76).toFixed(1));
  });

  stage.addEventListener("pointerleave", function () {
    glass.style.setProperty("--mx", "26");
    glass.style.setProperty("--my", "18");
  });
}
