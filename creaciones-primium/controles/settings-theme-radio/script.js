const pane = document.querySelector("#pane");
const read = document.querySelector("#read");
const options = [...document.querySelectorAll('input[name="theme"]')];

if (pane && options.length) {
  const report = () => {
    const picked = options.find((option) => option.checked);
    if (read && picked) read.textContent = picked.value;
  };

  pane.addEventListener("keydown", (event) => {
    if (event.key !== "Home" && event.key !== "End") return;
    const index = options.findIndex((option) => option.checked);
    const next = event.key === "Home" ? 0 : options.length - 1;
    if (index < 0) return;
    event.preventDefault();
    options[next].checked = true;
    options[next].focus();
    report();
  });

  pane.addEventListener("change", report);
  report();
}
