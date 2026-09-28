const seal = document.querySelector("#seal");
const state = document.querySelector("#state");

if (seal) {
  const report = () => {
    if (state) state.textContent = seal.checked ? "intact" : "broken";
  };

  seal.addEventListener("keydown", (event) => {
    const isArrow = event.key === "ArrowUp" || event.key === "ArrowDown"
      || event.key === "ArrowLeft" || event.key === "ArrowRight";
    if (isArrow || event.key === "Enter") {
      event.preventDefault();
      seal.checked = !seal.checked;
      report();
    }
  });

  seal.addEventListener("change", report);
  report();
}
