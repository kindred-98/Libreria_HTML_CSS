const box = document.querySelector("#module");
const btn = document.querySelector("#latch");
const guard = document.querySelector("#guard");
const guarded = document.querySelector("#guarded");
const lampText = document.querySelector("#lampText");
const hint = document.querySelector("#hint");

if (box && btn && guard && guarded) {
  const HINTS = {
    shut: "push to latch",
    open: "cover open \u00b7 press the switch",
    on: "latched \u00b7 press to release",
    blocked: "lift the cover first"
  };

  const armed = () => btn.getAttribute("aria-pressed") === "true";
  const isOpen = () => box.classList.contains("is-open");

  const setHint = (key) => {
    if (hint) hint.textContent = HINTS[key];
  };

  const paint = () => {
    const on = armed();
    box.classList.toggle("is-armed", on);
    if (lampText) lampText.textContent = on ? "armed" : "standby";
    setHint(on ? "on" : isOpen() ? "open" : "shut");
  };

  const strike = () => {
    box.classList.remove("is-throw");
    guarded.classList.remove("is-clack");
    void box.offsetWidth;
    box.classList.add("is-throw");
    guarded.classList.add("is-clack");
  };

  const setOpen = (open) => {
    if (armed()) return;
    box.classList.toggle("is-open", open);
    paint();
  };

  const flip = () => {
    const next = !armed();
    btn.setAttribute("aria-pressed", next ? "true" : "false");
    if (!next) box.classList.remove("is-open");
    strike();
    paint();
  };

  btn.addEventListener("click", () => {
    if (!isOpen()) {
      setOpen(true);
      box.classList.add("is-blocked");
      setHint("blocked");
      window.setTimeout(() => {
        box.classList.remove("is-blocked");
        setHint(armed() ? "on" : isOpen() ? "open" : "shut");
      }, 1100);
      return;
    }
    flip();
  });

  guard.addEventListener("click", () => setOpen(!isOpen()));

  btn.addEventListener("focus", () => setOpen(true));

  window.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    btn.setAttribute("aria-pressed", "false");
    setOpen(false);
  });

  paint();
}
