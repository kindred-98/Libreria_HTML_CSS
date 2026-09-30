const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const saveBtn = document.getElementById("saveBtn");
const saveText = saveBtn.querySelector(".feat__save-text");
const stage = document.querySelector(".stage");
const sky = document.querySelector(".feat__sky");
const ridgeFar = document.querySelector(".feat__ridge--far");
const ridgeNear = document.querySelector(".feat__ridge--near");

window.setTimeout(function () {
  stage.classList.add("is-settled");
}, 660);

function shift(part) {
  return part.toFixed(2) + "px";
}

function restPlate() {
  sky.style.transform = "scale(1.02)";
  ridgeFar.style.transform = "translate3d(0,0,0)";
  ridgeNear.style.transform = "translate3d(0,0,0)";
}

saveBtn.addEventListener("click", function () {
  const saved = saveBtn.getAttribute("aria-pressed") === "true";
  saveBtn.setAttribute("aria-pressed", saved ? "false" : "true");
  saveText.textContent = saved ? "Save" : "Saved";
});

if (!reduce) {
  restPlate();
  stage.addEventListener("pointermove", function (event) {
    const box = document.querySelector(".feat__cover").getBoundingClientRect();
    const dx = (event.clientX - (box.left + box.width / 2)) / (box.width / 2);
    const dy = (event.clientY - (box.top + box.height / 2)) / (box.height / 2);
    sky.style.transform =
      "translate3d(" + shift(dx * -7) + "," + shift(dy * -4) + ",0) scale(1.03)";
    ridgeFar.style.transform = "translate3d(" + shift(dx * 5) + ",0,0)";
    ridgeNear.style.transform = "translate3d(" + shift(dx * 11) + ",0,0)";
  });
  stage.addEventListener("pointerleave", restPlate);
}
