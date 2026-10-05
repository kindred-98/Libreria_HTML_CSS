const group = document.querySelector(".detents");
const out = document.querySelector("#stateOut");
const radios = group ? [...group.querySelectorAll("input[type=radio]")] : [];

const words = {
  sealed: "Sealed · cord intact",
  opened: "Opened · cord cut",
  broken: "Broken · cord torn and stamped"
};

const knob = document.querySelector(".selector__knob");

const paint = () => {
  const current = radios.find((radio) => radio.checked);
  if (current && out) out.textContent = words[current.value] ?? current.value;
};

const clunk = () => {
  if (!knob) return;
  knob.classList.remove("is-click");
  knob.getBoundingClientRect();
  knob.classList.add("is-click");
  window.setTimeout(() => knob.classList.remove("is-click"), 460);
};

const select = (index) => {
  const target = radios[Math.max(0, Math.min(radios.length - 1, index))];
  if (!target) return;
  target.checked = true;
  target.focus();
  paint();
  clunk();
};

if (radios.length) {
  radios.forEach((radio) => radio.addEventListener("change", () => {
    paint();
    clunk();
  }));

  group.addEventListener("keydown", (event) => {
    const index = radios.findIndex((radio) => radio.checked);
    let next = null;
    if (event.key === "Home") next = 0;
    else if (event.key === "End") next = radios.length - 1;
    else if (event.key === "PageUp") next = index - 1;
    else if (event.key === "PageDown") next = index + 1;
    if (next === null) return;
    event.preventDefault();
    select(next);
  });

  paint();
}
