const switches = Array.from(document.querySelectorAll('.sw[role="switch"]'));
const onCount = document.querySelector("#onCount");
const offCount = document.querySelector("#offCount");
const live = document.querySelector("#live");

if (switches.length) {
  const label = (sw) => {
    const name = sw.getAttribute("aria-label") || "specimen";
    return name.replace(/,.*$/, "");
  };

  const tally = () => {
    const on = switches.filter((sw) => sw.getAttribute("aria-checked") === "true").length;
    const liveCount = switches.filter((sw) => !sw.disabled).length;
    const off = liveCount - on;
    if (onCount) onCount.textContent = String(on);
    if (offCount) offCount.textContent = String(off);
    return { on, off };
  };

  const flip = (sw) => {
    if (sw.disabled) return;
    const next = sw.getAttribute("aria-checked") === "true" ? "false" : "true";
    sw.setAttribute("aria-checked", next);
    const { on } = tally();
    if (live) live.textContent = label(sw) + " switched " + next + ", " + on + " of " + switches.length + " on";
  };

  switches.forEach((sw) => {
    sw.addEventListener("click", () => flip(sw));
  });

  tally();
}
