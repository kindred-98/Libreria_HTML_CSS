const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const card = document.getElementById("arc");
const shell = document.getElementById("arcShell");
const front = document.getElementById("arcFront");
const back = document.getElementById("arcBack");
const flipBtn = document.getElementById("arcFlip");
const prevBtn = document.getElementById("arcPrev");
const nextBtn = document.getElementById("arcNext");

let turned = false;

function paint() {
  front.setAttribute("aria-hidden", turned ? "true" : "false");
  back.setAttribute("aria-hidden", turned ? "false" : "true");
  flipBtn.setAttribute("aria-pressed", turned ? "true" : "false");
  flipBtn.textContent = turned ? "Turn back" : "Turn over";
  card.classList.toggle("is-turned", turned);
}

function turn() {
  turned = !turned;
  paint();
}

function nudge() {
  card.classList.add("is-nudged");
  setTimeout(function () {
    card.classList.remove("is-nudged");
  }, 500);
}

flipBtn.addEventListener("click", turn);
prevBtn.addEventListener("click", function () {
  if (turned) {
    turn();
  } else {
    nudge();
  }
});

nextBtn.addEventListener("click", function () {
  if (!turned) {
    turn();
  } else {
    nudge();
  }
});

if (!reduce) {
  let hovering = false;
  let dragging = false;
  let startX = 0;
  let startY = 0;
  let travelled = 0;

  function applyTilt(ry, rx) {
    shell.style.setProperty("--ry", ry.toFixed(2) + "deg");
    shell.style.setProperty("--rx", rx.toFixed(2) + "deg");
  }

  function settle() {
    hovering = false;
    card.classList.remove("is-tilting");
    applyTilt(0, 0);
  }

  card.addEventListener("pointermove", function (event) {
    if (dragging) {
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      travelled = Math.max(travelled, Math.abs(dx), Math.abs(dy));
      applyTilt(dx * 0.26, dy * -0.18);
      return;
    }
    if (!hovering) {
      hovering = true;
      card.classList.add("is-tilting");
    }
    const box = card.getBoundingClientRect();
    const dx = (event.clientX - box.left) / box.width - 0.5;
    const dy = (event.clientY - box.top) / box.height - 0.5;
    applyTilt(dx * 15, dy * -11);
  });

  card.addEventListener("pointerleave", function () {
    if (dragging) {
      return;
    }
    settle();
  });

  card.addEventListener("pointerdown", function (event) {
    if (event.button !== 0) {
      return;
    }
    dragging = true;
    travelled = 0;
    startX = event.clientX;
    startY = event.clientY;
    card.classList.add("is-dragging", "is-tilting");
    card.setPointerCapture(event.pointerId);
  });

  function release(event) {
    if (!dragging) {
      return;
    }
    dragging = false;
    card.classList.remove("is-dragging");
    if (event && event.pointerId !== undefined && card.hasPointerCapture(event.pointerId)) {
      card.releasePointerCapture(event.pointerId);
    }
    if (travelled > 52) {
      turn();
    }
    settle();
  }

  card.addEventListener("pointerup", release);
  card.addEventListener("pointercancel", function () {
    dragging = false;
    card.classList.remove("is-dragging");
    settle();
  });
} else {
  card.classList.add("is-static");
}
