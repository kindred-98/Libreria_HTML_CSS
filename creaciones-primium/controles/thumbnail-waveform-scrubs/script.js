const board = document.querySelector("#board");
const mosaic = document.querySelector("#mosaic");
const stage = document.querySelector("#stage");
const ghost = document.querySelector("#ghost");
const chip = document.querySelector("#selChip");
const slots = [...document.querySelectorAll(".slots i")];
const tiles = [...document.querySelectorAll(".tile")];

if (board && mosaic && stage && slots.length === tiles.length && tiles.length) {
  const MAX = 1000;
  let openIndex = tiles.findIndex((tile) => tile.classList.contains("is-open"));
  if (openIndex < 0) openIndex = 0;
  let flipTimer = 0;
  let frame = 0;

  const total = (tile) => {
    const parts = tile.querySelector(".tile__clock").textContent.split(":");
    return Number(parts[0]) * 60 + Number(parts[1]);
  };

  const at = (tile, v) => {
    const secs = Math.floor((v / MAX) * total(tile));
    return `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;
  };

  const paint = (tile, input) => {
    const n = Number(input.value);
    tile.style.setProperty("--p", (n / MAX).toFixed(4));
    input.setAttribute("aria-valuetext", `${at(tile, n)} of ${at(tile, MAX)}`);
  };

  const measure = () => {
    const w = slots[0].offsetWidth;
    const h = slots[0].offsetHeight;
    const stageBox0 = stage.getBoundingClientRect();
    const scale = Math.max(1.2, Math.min(1.9, ((stageBox0.width - 8) / w) || 1.9));
    stage.style.height = `${Math.round(h * scale + 6)}px`;
    const stageBox = stage.getBoundingClientRect();
    const mosaicBox = mosaic.getBoundingClientRect();

    tiles.forEach((tile, i) => {
      const slot = slots[i];
      const x = slot.offsetLeft;
      const y = slot.offsetTop;
      tile.style.setProperty("--w", `${w}px`);
      tile.style.setProperty("--h", `${h}px`);
      if (i === openIndex) {
        const cx = (mosaicBox.width - w * scale) / 2;
        const cy = stageBox.top - mosaicBox.top + (stageBox.height - h * scale) / 2;
        tile.style.transform = `translate3d(${Math.round(x + cx)}px,${Math.round(cy)}px,0) scale(${scale.toFixed(3)})`;
        ghost.style.transform = `translate3d(${x}px,${y}px,0)`;
        ghost.style.width = `${w}px`;
        ghost.style.height = `${h}px`;
        ghost.classList.add("is-on");
      } else {
        tile.style.transform = `translate3d(${x}px,${y}px,0) scale(1)`;
      }
    });
  };

  const guard = (tile) => {
    tile.classList.add("is-flip");
    if (flipTimer) clearTimeout(flipTimer);
    flipTimer = setTimeout(() => {
      for (const t of tiles) t.classList.remove("is-flip");
    }, 620);
  };

  const flags = (index) => {
    tiles.forEach((tile, i) => {
      const on = i === index;
      tile.classList.toggle("is-open", on);
      tile.querySelector(".tile__open").setAttribute("aria-expanded", on ? "true" : "false");
      tile.querySelector(".tile__open").tabIndex = on ? -1 : 0;
      tile.querySelector(".tile__close").tabIndex = on ? 0 : -1;
    });
  };

  const open = (index) => {
    guard(tiles[index]);
    openIndex = index;
    flags(index);
    board.classList.add("is-taken");
    if (chip) chip.textContent = `${tiles[index].querySelector(".tile__tag b").textContent.toLowerCase()} open`;
    measure();
    tiles[index].querySelector(".tile__close").focus({ preventScroll: true });
  };

  const close = () => {
    const tile = tiles[openIndex];
    if (tile) guard(tile);
    openIndex = -1;
    flags(-1);
    board.classList.remove("is-taken");
    if (ghost) ghost.classList.remove("is-on");
    if (chip) chip.textContent = "bay empty";
    measure();
    if (tile) tile.querySelector(".tile__open").focus({ preventScroll: true });
  };

  tiles.forEach((tile, i) => {
    const input = tile.querySelector(".tile__input");
    input.addEventListener("input", () => paint(tile, input));
    tile.querySelector(".tile__open").addEventListener("click", (event) => {
      event.preventDefault();
      open(i);
    });
    tile.querySelector(".tile__close").addEventListener("click", (event) => {
      event.preventDefault();
      close();
    });
    paint(tile, input);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && openIndex >= 0) {
      event.preventDefault();
      close();
    }
  });

  const onResize = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = requestAnimationFrame(measure);
  };
  window.addEventListener("resize", onResize);
  window.addEventListener("orientationchange", onResize);

  flags(openIndex);
  board.classList.add("is-taken");
  if (chip) chip.textContent = `${tiles[openIndex].querySelector(".tile__tag b").textContent.toLowerCase()} open`;
  measure();
}
