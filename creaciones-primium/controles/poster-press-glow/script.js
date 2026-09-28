const push = document.querySelector("#push");
const poster = document.querySelector("#poster");
const stateOut = document.querySelector("#stateOut");
const houseOut = document.querySelector("#houseOut");

if (push && poster) {
  let on = false;

  const paint = () => {
    push.setAttribute("aria-pressed", on ? "true" : "false");
    poster.classList.toggle("is-on", on);
    if (stateOut) stateOut.textContent = on ? "lit" : "dark";
    if (houseOut) houseOut.textContent = on ? "open" : "closed";
  };

  push.addEventListener("click", () => {
    on = !on;
    paint();
  });

  paint();
}
