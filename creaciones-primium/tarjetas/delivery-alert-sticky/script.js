const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const sticky = document.getElementById("sticky");
const clip = document.getElementById("clip");
const toggles = Array.from(document.querySelectorAll(".check__btn"));

toggles.forEach(function (button) {
  button.addEventListener("click", function () {
    const pressed = button.getAttribute("aria-pressed") === "true";
    button.setAttribute("aria-pressed", pressed ? "false" : "true");
  });
});

if (sticky && clip && !reduceMotion) {
  let dragging = false;
  let originX = 0;
  let originY = 0;
  let shiftX = 0;
  let shiftY = 0;
  let captured = false;
  let activePointer = 0;

  function paint() {
    const angle = -2 + shiftX * 0.06;
    sticky.style.transform =
      "translate(" + shiftX.toFixed(1) + "px," + shiftY.toFixed(1) + "px) rotate(" + angle.toFixed(2) + "deg)";
    clip.style.setProperty("--clip", (shiftX * 0.14).toFixed(2) + "deg");
  }

  sticky.addEventListener("pointerdown", function (event) {
    const target = event.target;
    if (target && target.closest && target.closest("button")) {
      return;
    }
    dragging = true;
    originX = event.clientX - shiftX;
    originY = event.clientY - shiftY;
    activePointer = event.pointerId;
    sticky.classList.add("is-dragging");
    try {
      sticky.setPointerCapture(activePointer);
      captured = true;
    } catch (error) {
      captured = false;
    }
  });

  sticky.addEventListener("pointermove", function (event) {
    if (!dragging) {
      return;
    }
    const rawX = event.clientX - originX;
    const rawY = event.clientY - originY;
    shiftX = Math.max(-90, Math.min(90, rawX));
    shiftY = Math.max(-70, Math.min(70, rawY));
    paint();
  });

  function release() {
    if (!dragging) {
      return;
    }
    dragging = false;
    sticky.classList.remove("is-dragging");
    if (captured) {
      captured = false;
      try {
        sticky.releasePointerCapture(activePointer);
      } catch (error) {
        activePointer = 0;
      }
    }
    shiftX = 0;
    shiftY = 0;
    paint();
  }

  sticky.addEventListener("pointerup", release);
  sticky.addEventListener("pointercancel", release);
}
