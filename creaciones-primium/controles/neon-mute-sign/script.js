const mute = document.querySelector("#mute");
const state = document.querySelector(".breaker__state");

if (mute) {
  const report = () => {
    if (state) state.textContent = mute.checked ? "muted" : "live";
  };

  mute.addEventListener("keydown", (event) => {
    const isArrow = event.key === "ArrowUp" || event.key === "ArrowDown"
      || event.key === "ArrowLeft" || event.key === "ArrowRight";
    if (isArrow || event.key === "Enter") {
      event.preventDefault();
      mute.checked = !mute.checked;
      report();
    }
  });

  mute.addEventListener("change", report);
  report();
}
