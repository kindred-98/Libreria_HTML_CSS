const modes = [...document.querySelectorAll('input[name="mode"]')];
const group = document.querySelector(".modes");
const note = document.querySelector("#footNote");
const settings = document.querySelector(".settings");

const paneOf = (mode) => document.querySelector(`.pane--${mode}`);

const read = (mode) => {
  const pane = paneOf(mode);
  const picks = pane ? [...pane.querySelectorAll("select")].map((pick) => pick.value) : [];
  if (mode === "auto") return `Auto · interval ${picks[0] ?? ""} · burst ${picks[1] ?? ""}`;
  if (mode === "manual") return `Manual · shutter ${picks[0] ?? ""} · ${picks[1] ?? ""}`;
  return "Off · dormant";
};

const paint = () => {
  const current = modes.find((mode) => mode.checked);
  if (current && note) note.textContent = read(current.value);
};

const select = (index) => {
  const target = modes[(index + modes.length) % modes.length];
  if (!target) return;
  target.checked = true;
  target.focus();
  paint();
};

if (modes.length) {
  modes.forEach((mode) => mode.addEventListener("change", paint));
  if (settings) {
    settings.addEventListener("change", (event) => {
      if (event.target.matches("select")) paint();
    });
  }
  if (group) {
    group.addEventListener("keydown", (event) => {
      const index = modes.findIndex((mode) => mode.checked);
      let next = null;
      if (event.key === "Home") next = 0;
      else if (event.key === "End") next = modes.length - 1;
      else if (event.key === "PageUp") next = index - 1;
      else if (event.key === "PageDown") next = index + 1;
      if (next === null) return;
      event.preventDefault();
      select(next);
    });
  }
  paint();
}
