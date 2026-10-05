const barcode = document.getElementById("barcode") || document.querySelector(".barcode");
const scanBtn = document.getElementById("scan");
const stamp = document.getElementById("stamp");

let minutes = 6 * 60 + 41;

scanBtn.addEventListener("click", function () {
  barcode.classList.remove("is-scanning");
  barcode.getBoundingClientRect();
  barcode.classList.add("is-scanning");
  minutes += 1;
  const hours = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  stamp.textContent =
    "SCANNED " + String(hours).padStart(2, "0") + ":" + String(mins).padStart(2, "0");
});
