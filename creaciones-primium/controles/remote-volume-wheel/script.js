const input = document.querySelector("#vol");
const bay = document.querySelector("#wheelBay");
const disc = bay ? bay.querySelector(".wheel__disc") : null;
const remote = document.querySelector("#remote");
const ladder = document.querySelector("#ladder");
const volOut = document.querySelector("#volOut");
const volState = document.querySelector("#volState");
const lcdBar = document.querySelector("#lcdBar");
const lcd = document.querySelector(".lcd");
const sideOut = document.querySelector("#sideOut");
const sideBar = document.querySelector("#sideBar");
const gauge = document.querySelector(".gauge");
const statePlate = document.querySelector("#statePlate");
const muteBtn = document.querySelector("#mute");
const shortBox = document.querySelector("#short");

if (input && bay && disc) {
  const segments = ladder ? Array.from(ladder.children) : [];
  let muted = false;

  const paint = () => {
    const value = Number(input.value);
    const ratio = value / 100;
    disc.style.setProperty("--spin", `${(ratio * 360).toFixed(2)}deg`);
    if (lcd) lcd.style.setProperty("--v", String(ratio));
    if (gauge) gauge.style.setProperty("--v", String(ratio));
    if (volOut) volOut.textContent = String(value).padStart(2, "0");
    if (sideOut) sideOut.textContent = String(value).padStart(2, "0");
    const lit = muted ? 0 : Math.round(ratio * segments.length);
    segments.forEach((segment, index) => {
      segment.classList.toggle("on", index < lit);
      segment.classList.toggle("hot", index >= segments.length - 2 && index < lit);
    });
    if (lcdBar) lcdBar.style.setProperty("--v", String(ratio));
    if (sideBar) sideBar.style.setProperty("--v", String(ratio));
    input.setAttribute("aria-valuetext", `${value} percent${muted ? ", muted" : ""}`);
  };

  const setMuted = (next) => {
    muted = next;
    document.body.classList.toggle("is-muted", muted);
    if (muteBtn) muteBtn.setAttribute("aria-checked", muted ? "true" : "false");
    if (volState) volState.textContent = muted ? "signal shorted" : "attenuator open";
    if (statePlate) statePlate.textContent = muted ? "shorted" : "path closed";
    if (shortBox && muted) {
      shortBox.classList.remove("spark");
      shortBox.getBoundingClientRect();
      shortBox.classList.add("spark");
      window.setTimeout(() => shortBox.classList.remove("spark"), 900);
    }
    paint();
  };

  paint();

  input.addEventListener("input", paint);

  input.addEventListener("pointerdown", () => bay.classList.add("is-flick"));
  window.addEventListener("pointerup", () => bay.classList.remove("is-flick"));
  window.addEventListener("blur", () => bay.classList.remove("is-flick"));

  input.addEventListener("keydown", (event) => {
    const key = event.key;
    if (key === "PageUp" || key === "PageDown") {
      event.preventDefault();
      const next = Math.min(100, Math.max(0, Number(input.value) + (key === "PageUp" ? 10 : -10)));
      input.value = String(next);
      paint();
      return;
    }
    if (key === " " || key === "Enter") {
      event.preventDefault();
      setMuted(!muted);
    }
  });

  if (muteBtn) {
    muteBtn.addEventListener("click", () => setMuted(!muted));
  }
}
