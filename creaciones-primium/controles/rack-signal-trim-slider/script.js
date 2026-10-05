const rowsBox = document.querySelector("#rows");
const live = document.querySelector("#live");
const trims = Array.from(document.querySelectorAll(".row__input"));

if (rowsBox && trims.length) {
  const CAP = 14;

  const rowOf = (input) => input.closest(".row");
  const capOf = (input) => rowOf(input).querySelector(".row__cap");
  const trackOf = (input) => rowOf(input).querySelector(".row__track");
  const readOf = (input) => document.querySelector("#read" + rowOf(input).dataset.key);
  const msg = (value) => {
    let prefijo = "flat, ";
    if (value > 0) prefijo = "plus ";
    else if (value < 0) prefijo = "minus ";
    return prefijo + Math.abs(value).toFixed(1) + " decibels";
  };

  const move = (input, value) => {
    const min = Number(input.min);
    const max = Number(input.max);
    const next = Math.min(max, Math.max(min, Math.round(Number(value) * 2) / 2));
    input.value = String(next);
    paint(input);
  };

  const select = (row) => {
    document.querySelectorAll(".row").forEach((item) => item.classList.toggle("is-sel", item === row));
  };

  const paint = (input) => {
    const min = Number(input.min);
    const max = Number(input.max);
    const value = Number(input.value);
    const track = trackOf(input);
    const travel = Math.max(0, track.clientWidth - CAP);
    const ratio = (value - min) / (max - min);
    capOf(input).style.setProperty("--x", (ratio * travel).toFixed(2));
    const read = readOf(input);
    if (read) read.textContent = (value > 0 ? "+" : "") + value.toFixed(1);
    input.setAttribute("aria-valuetext", msg(value));
    rowOf(input).style.setProperty("--lit", (Math.abs(value) / max).toFixed(3));
  };

  trims.forEach((input) => {
    paint(input);

    input.addEventListener("input", () => {
      paint(input);
      select(rowOf(input));
    });

    input.addEventListener("pointerdown", () => select(rowOf(input)));
    input.addEventListener("focus", () => select(rowOf(input)));

    input.addEventListener("keydown", (event) => {
      const key = event.key;
      if (key === "PageUp" || key === "PageDown") {
        event.preventDefault();
        move(input, Number(input.value) + (key === "PageUp" ? 3 : -3));
        return;
      }
      if (key === " " || key === "Enter") {
        event.preventDefault();
        move(input, 0);
        return;
      }
      requestAnimationFrame(() => paint(input));
    });

    input.addEventListener("dblclick", () => move(input, 0));
  });

  rowsBox.addEventListener("pointerdown", (event) => {
    const row = event.target.closest(".row");
    if (!row) return;
    select(row);
    const name = row.querySelector(".row__name b");
    if (live) live.textContent = (name ? name.textContent : "trim") + " row selected";
  });

  rowsBox.addEventListener("focusin", (event) => {
    const row = event.target.closest(".row");
    if (row) select(row);
  });

  const focusOut = (event) => {
    if (rowsBox.contains(event.relatedTarget)) return;
    const current = document.querySelector(".row.is-sel");
    if (current && !current.contains(document.activeElement)) {
      document.querySelectorAll(".row").forEach((item) => item.classList.remove("is-sel"));
    }
  };

  rowsBox.addEventListener("focusout", focusOut);

  const measure = () => trims.forEach((...args) => paint(...args));

  window.addEventListener("resize", measure);

  if (typeof ResizeObserver === "function") {
    const spy = new ResizeObserver(measure);
    trims.forEach((input) => spy.observe(trackOf(input)));
  }

  // "ready" es una promesa: como condicion siempre seria cierta, asi que solo
  // se comprueba que exista el FontFaceSet.
  if (document.fonts) {
    document.fonts.ready.then(measure).catch(() => {});
  }

  measure();
}
