const picker = document.querySelector("#picker");
const line = document.querySelector("#line");
const linePh = document.querySelector("#linePh");
const clearBtn = document.querySelector("#clear");

if (picker && line) {
  const keys = [...picker.querySelectorAll(".key")];
  const COLS = 5;
  let active = 0;

  const syncPlaceholder = () => {
    const has = line.querySelector(".chip") !== null;
    if (linePh) linePh.hidden = has;
  };

  const setActive = (index) => {
    active = Math.max(0, Math.min(keys.length - 1, index));
    keys.forEach((key, i) => key.setAttribute("tabindex", i === active ? "0" : "-1"));
  };

  const chipFor = (key) => line.querySelector(`.chip[data-key="${key.dataset.key}"]`);

  const removeChip = (key) => {
    const chip = chipFor(key);
    if (chip) chip.remove();
    key.setAttribute("aria-pressed", "false");
    syncPlaceholder();
  };

  const addChip = (key) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip";
    chip.dataset.key = key.dataset.key;
    chip.setAttribute("aria-label", `Remove ${key.getAttribute("aria-label")}`);
    const glyph = key.querySelector(".glyph").cloneNode(true);
    chip.append(glyph);
    line.append(chip);
    key.setAttribute("aria-pressed", "true");
    syncPlaceholder();
  };

  const toggle = (key) => {
    if (!key) return;
    if (key.getAttribute("aria-pressed") === "true") removeChip(key);
    else addChip(key);
  };

  picker.addEventListener("click", (event) => {
    const key = event.target.closest(".key");
    if (!key) return;
    setActive(keys.indexOf(key));
    toggle(key);
  });

  line.addEventListener("click", (event) => {
    const chip = event.target.closest(".chip");
    if (!chip) return;
    const key = keys.find((item) => item.dataset.key === chip.dataset.key);
    if (key) {
      removeChip(key);
      key.focus();
      setActive(keys.indexOf(key));
    }
  });

  picker.addEventListener("keydown", (event) => {
    const current = keys.indexOf(document.activeElement);
    if (current < 0) return;
    let next = null;
    if (event.key === "ArrowRight") next = current + 1;
    else if (event.key === "ArrowLeft") next = current - 1;
    else if (event.key === "ArrowDown") next = current + COLS;
    else if (event.key === "ArrowUp") next = current - COLS;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = keys.length - 1;
    else if (event.key === "PageDown") next = current + COLS * 2;
    else if (event.key === "PageUp") next = current - COLS * 2;
    if (next === null) return;
    event.preventDefault();
    next = Math.max(0, Math.min(keys.length - 1, next));
    setActive(next);
    keys[next].focus();
  });

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      keys.forEach((key) => key.setAttribute("aria-pressed", "false"));
      [...line.querySelectorAll(".chip")].forEach((chip) => chip.remove());
      syncPlaceholder();
    });
  }

  setActive(0);
  syncPlaceholder();
}
