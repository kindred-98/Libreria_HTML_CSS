const clockTime = document.getElementById("clockTime");
const clockDate = document.getElementById("clockDate");
const zoneLon = document.getElementById("zoneLon");
const zoneNyc = document.getElementById("zoneNyc");
const board = document.getElementById("bdash");
const compact = document.getElementById("compact");
const focusBtn = document.getElementById("focusBtn");

function pad(value) {
  return value < 10 ? "0" + value : String(value);
}

function paintClock() {
  const now = new Date();
  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());
  clockTime.textContent = hours + ":" + minutes;
  zoneLon.textContent = hours + ":" + minutes;
  const nyc = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  zoneNyc.textContent = pad(nyc.getHours()) + ":" + pad(nyc.getMinutes());
  clockDate.textContent = now.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long"
  });
}

paintClock();
setInterval(paintClock, 1000);

compact.addEventListener("click", function () {
  const on = compact.getAttribute("aria-pressed") === "true";
  compact.setAttribute("aria-pressed", on ? "false" : "true");
  board.classList.toggle("bdash--compact", !on);
});

focusBtn.addEventListener("click", function () {
  const on = focusBtn.getAttribute("aria-pressed") === "true";
  focusBtn.setAttribute("aria-pressed", on ? "false" : "true");
  focusBtn.textContent = on ? "Start" : "Running";
});

Array.prototype.forEach.call(document.querySelectorAll(".qbtn"), function (button) {
  button.addEventListener("click", function () {
    const on = button.getAttribute("aria-pressed") === "true";
    button.setAttribute("aria-pressed", on ? "false" : "true");
  });
});
