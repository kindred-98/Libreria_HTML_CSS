const foldBtn = document.getElementById("foldBtn");
const fold = document.getElementById("fold");
const foldText = foldBtn.querySelector(".fold-btn__text");
const saveBtn = document.getElementById("saveBtn");
const progress = document.querySelector(".meta__prog i");
const stamp = document.querySelector(".cover__cap");
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

foldBtn.addEventListener("click", function () {
  const open = foldBtn.getAttribute("aria-expanded") === "true";
  foldBtn.setAttribute("aria-expanded", open ? "false" : "true");
  fold.classList.toggle("is-open", !open);
  foldText.textContent = open ? "Read the full essay" : "Collapse essay";
});

saveBtn.addEventListener("click", function () {
  const on = saveBtn.getAttribute("aria-pressed") === "true";
  saveBtn.setAttribute("aria-pressed", on ? "false" : "true");
  saveBtn.setAttribute("aria-label", on ? "Save this essay to read later" : "Saved to your reading list");
});

if (!reduce && progress) {
  let value = 0.32;
  let forward = true;

  window.setInterval(function () {
    value += forward ? 0.11 : 0.08;
    if (value >= 1) {
      value = 1;
      forward = false;
    }
    if (value <= 0.3) {
      value = 0.3;
      forward = true;
    }
    progress.style.transform = "scaleX(" + value.toFixed(3) + ")";
  }, 460);
}

if (!reduce && stamp) {
  const beats = [
    "06:12 \u00b7 the studio before the city wakes",
    "06:24 \u00b7 second cup, no tabs open yet",
    "06:41 \u00b7 the hard paragraph finally gives"
  ];
  let beat = 0;
  window.setInterval(function () {
    beat = (beat + 1) % beats.length;
    stamp.textContent = beats[beat];
  }, 1500);
}
