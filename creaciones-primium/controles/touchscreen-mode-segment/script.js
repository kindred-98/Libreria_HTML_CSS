const kiosk = document.querySelector("#kiosk");
const pill = document.querySelector(".segment__pill");
const title = document.querySelector("#title");
const note = document.querySelector("#note");
const clock = document.querySelector("#clock");
const options = [...document.querySelectorAll('input[name="mode"]')];

const NOTES = {
  browse: "tap an item to inspect it",
  edit: "drag a card, the grid holds",
  mix: "levels crossfaded, mind the ears",
};

if (kiosk && pill) {
  const apply = (option) => {
    const index = options.indexOf(option);
    pill.style.setProperty("--i", String(index));
    kiosk.classList.remove("is-browse", "is-edit", "is-mix");
    kiosk.classList.add(`is-${option.value}`);
    if (title) title.textContent = option.value;
    if (note) note.textContent = NOTES[option.value] ?? option.value;
  };

  for (const option of options) {
    option.addEventListener("change", () => {
      if (option.checked) apply(option);
    });
  }

  kiosk.addEventListener("keydown", (event) => {
    if (event.key !== "Home" && event.key !== "End" && event.key !== "PageUp" && event.key !== "PageDown") return;
    const index = options.findIndex((option) => option.checked);
    if (index < 0) return;
    event.preventDefault();
    let next = index;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = options.length - 1;
    if (event.key === "PageUp") next = (index + options.length - 1) % options.length;
    if (event.key === "PageDown") next = (index + 1) % options.length;
    options[next].checked = true;
    options[next].focus();
    apply(options[next]);
  });

  const started = new Date(2026, 0, 1, 9, 41, 0);
  const tick = () => {
    const now = new Date(started.getTime() + (Date.now() % 3600000));
    if (clock) {
      clock.textContent = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    }
  };

  const initial = options.find((option) => option.checked) ?? options[0];
  if (initial) apply(initial);
  tick();
  window.setInterval(tick, 20000);
}
