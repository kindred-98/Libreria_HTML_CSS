const power = document.querySelector("#power");
const state = document.querySelector("#state");

if (power) {
  const report = () => {
    if (state) state.textContent = power.checked ? "run" : "standby";
  };

  power.addEventListener("keydown", (event) => {
    const isArrow = event.key === "ArrowUp" || event.key === "ArrowDown"
      || event.key === "ArrowLeft" || event.key === "ArrowRight";
    if (isArrow || event.key === "Enter") {
      event.preventDefault();
      power.checked = !power.checked;
      report();
    }
  });

  power.addEventListener("change", report);
  report();
}
