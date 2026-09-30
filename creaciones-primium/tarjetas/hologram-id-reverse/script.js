const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const stage = document.querySelector(".stage");
const hid = document.getElementById("hid");
const card = document.getElementById("card");
const flipBtn = document.getElementById("flipBtn");
const holoBtn = document.getElementById("holoBtn");
const flipText = flipBtn.querySelector(".acts__text");
const holoText = holoBtn.querySelector(".acts__text");
const readout = document.getElementById("log");

let burstTimer = 0;

function flashFoil() {
  readout.classList.add("is-ok");
  if (reduce) {
    return;
  }
  window.clearTimeout(burstTimer);
  hid.classList.remove("is-burst");
  void hid.offsetWidth;
  hid.classList.add("is-burst");
  burstTimer = window.setTimeout(function () {
    hid.classList.remove("is-burst");
  }, 700);
}

function setTilt(event) {
  const box = hid.getBoundingClientRect();
  const dx = (event.clientX - (box.left + box.width / 2)) / (box.width / 2);
  const dy = (event.clientY - (box.top + box.height / 2)) / (box.height / 2);
  hid.style.setProperty("--rx", (-dy * 13).toFixed(2) + "deg");
  hid.style.setProperty("--ry", (dx * 17).toFixed(2) + "deg");
  hid.style.setProperty("--hx", (dx * 48).toFixed(1) + "px");
  hid.style.setProperty("--hy", (dy * 36).toFixed(1) + "px");
  hid.style.setProperty("--hr", (dx * 64).toFixed(1) + "deg");
  hid.style.setProperty("--gx", (dx * 76).toFixed(1) + "px");
}

function restTilt() {
  ["--rx", "--ry", "--hx", "--hy", "--hr", "--gx"].forEach(function (name) {
    hid.style.removeProperty(name);
  });
}

flipBtn.addEventListener("click", function () {
  const turned = hid.classList.toggle("is-turned");
  flipBtn.setAttribute("aria-pressed", turned ? "true" : "false");
  flipText.textContent = turned ? "Face front" : "Turn over";
  window.setTimeout(flashFoil, 260);
});

holoBtn.addEventListener("click", function () {
  flashFoil();
  holoBtn.setAttribute("aria-pressed", "true");
  holoText.textContent = "Foil valid";
});

card.addEventListener("pointerdown", function (event) {
  hid.classList.add("is-drag");
  if (card.setPointerCapture) {
    card.setPointerCapture(event.pointerId);
  }
  setTilt(event);
});

card.addEventListener("pointermove", function (event) {
  if (hid.classList.contains("is-drag")) {
    setTilt(event);
  }
});

function endDrag() {
  hid.classList.remove("is-drag");
  restTilt();
}

card.addEventListener("pointerup", endDrag);
card.addEventListener("pointercancel", endDrag);
card.addEventListener("pointerleave", endDrag);

window.setTimeout(function () {
  stage.classList.add("is-settled");
}, 700);
