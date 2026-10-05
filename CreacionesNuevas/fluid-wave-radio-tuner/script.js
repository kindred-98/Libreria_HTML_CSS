const canvas = document.getElementById("radioWave");
const ctx = canvas.getContext("2d");
const slider = document.getElementById("freqSlider");
const val = document.getElementById("freqVal");
let t = 0;
slider.addEventListener("input", (e) => val.innerText = e.target.value);
function draw() {
  ctx.fillStyle = "rgba(8, 10, 20, 0.25)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  const freq = Number.parseFloat(slider.value) * 0.005;
  for (let x = 0; x < canvas.width; x += 2) {
    const y = 50 + Math.sin(x * freq + t) * 30;
    if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = "#38bdf8";
  ctx.lineWidth = 2;
  ctx.stroke();
  t += 0.08;
  requestAnimationFrame(draw);
}
draw();