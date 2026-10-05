const tensEl = document.getElementById("tens");
const onesEl = document.getElementById("ones");
let tick = 0;

function render() {
  const t = Math.floor(tick / 10) % 10;
  const o = tick % 10;
  if (tensEl.textContent !== String(t)) {
    tensEl.classList.remove("is-flip");
    tensEl.getBoundingClientRect();
    tensEl.textContent = String(t);
    tensEl.classList.add("is-flip");
  }
  if (onesEl.textContent !== String(o)) {
    onesEl.classList.remove("is-flip");
    onesEl.getBoundingClientRect();
    onesEl.textContent = String(o);
    onesEl.classList.add("is-flip");
  }
  tick = (tick + 1) % 100;
}

render();
setInterval(render, 1000);
