const input = document.querySelector("#viewLever");
const box = document.querySelector("#leverBox");
const bearing = document.querySelector("#bearing");
const word = document.querySelector("#seatWord");
const lamp = document.querySelector("#lamp");
const scale = document.querySelectorAll(".lever__scale span");
const cells = document.querySelectorAll(".lampcell");

if (input && box) {
  const VIEWS = [
    { at: 0, name: "FWD", label: "forward view", degrees: "000" },
    { at: 1, name: "SIDE", label: "side view", degrees: "090" },
    { at: 2, name: "AFT", label: "aft view", degrees: "180" }
  ];

  const DEGREE = "\u00b0";
  let flash = 0;

  const viewFor = (value) => {
    const index = Math.min(VIEWS.length - 1, Math.max(0, Math.round(value)));
    return { index, view: VIEWS[index] };
  };

  const paint = () => {
    const { index, view } = viewFor(Number(input.value));
    const ratio = index / (VIEWS.length - 1);

    document.documentElement.style.setProperty("--v", String(ratio));

    if (bearing) {
      bearing.textContent = `${view.degrees}${DEGREE}`;
    }
    if (word) {
      word.textContent = view.name;
      word.classList.remove("is-hit");
      void word.offsetWidth;
      word.classList.add("is-hit");
    }
    if (lamp) {
      lamp.style.opacity = "1";
    }

    scale.forEach((span, position) => {
      span.classList.toggle("is-on", position === index);
    });
    cells.forEach((cell, position) => {
      const match = cell.dataset.pos !== undefined && Number(cell.dataset.pos) === index;
      cell.classList.toggle("on", match);
    });

    input.setAttribute("aria-valuetext", view.label);
  };

  const next = () => {
    const { index } = viewFor(Number(input.value));
    input.value = String((index + 1) % VIEWS.length);
    paint();
  };

  paint();

  if (lamp) {
    setInterval(() => {
      flash = (flash + 1) % 4;
      lamp.style.opacity = flash < 2 ? "1" : ".35";
    }, 420);
  }

  input.addEventListener("input", paint);
  input.addEventListener("keydown", (event) => {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      next();
    }
  });
  input.addEventListener("pointerdown", () => box.classList.add("is-dragging"));
  window.addEventListener("pointerup", () => box.classList.remove("is-dragging"));
  window.addEventListener("pointercancel", () => box.classList.remove("is-dragging"));
}
