const boxes = [...document.querySelectorAll('.box input[type="checkbox"]:not([disabled])')];

for (const box of boxes) {
  box.addEventListener("keydown", (event) => {
    const isArrow = event.key === "ArrowUp" || event.key === "ArrowDown"
      || event.key === "ArrowLeft" || event.key === "ArrowRight";
    if (isArrow || event.key === "Enter") {
      event.preventDefault();
      box.checked = !box.checked;
    }
  });
}
