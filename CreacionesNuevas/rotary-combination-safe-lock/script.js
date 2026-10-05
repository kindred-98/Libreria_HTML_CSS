const dial = document.getElementById("safeDial");
const statusEl = document.getElementById("safeStatus");
let rot = 0;
dial.addEventListener("click", () => {
  rot += 45;
  dial.style.transform = `rotate(${rot}deg)`;
  if (rot % 360 === 180) {
    status.innerText = "¡BÓVEDA ABIERTA!";
    status.style.color = "#22c55e";
  } else {
    status.innerText = "BLOQUEADO";
    status.style.color = "#38bdf8";
  }
});