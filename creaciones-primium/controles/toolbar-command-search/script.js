const field = document.querySelector("#q");
const list = document.querySelector("#results");
const count = document.querySelector("#count");
const chips = [...document.querySelectorAll(".chip")];

if (field && list) {
  const rows = [...list.querySelectorAll(".res")];
  const nameOf = new Map();

  rows.forEach((row) => {
    const bold = row.querySelector(".res__text b");
    const mark = row.querySelector(".res__mark");
    nameOf.set(row, { bold, mark, plain: bold ? bold.textContent : "" });
  });

  let group = "all";
  let cursor = 0;

  const chipsFor = (row) => {
    if (group === "all") return true;
    const cats = (row.dataset.cat || "").split(/\s+/);
    if (group === "recent") return cats.includes("recent");
    return cats.includes(group);
  };

  const paintName = (row, term) => {
    const entry = nameOf.get(row);
    if (!entry || !entry.bold) return;
    const plain = entry.plain;
    if (!term) {
      entry.bold.textContent = plain;
      entry.mark?.classList.remove("is-lit");
      row.classList.remove("is-hit");
      return;
    }
    const at = plain.toLowerCase().indexOf(term);
    if (at === -1) {
      entry.bold.textContent = plain;
      entry.mark?.classList.remove("is-lit");
      row.classList.remove("is-hit");
      return;
    }
    entry.bold.textContent = "";
    entry.bold.append(
      document.createTextNode(plain.slice(0, at)),
      Object.assign(document.createElement("mark"), { textContent: plain.slice(at, at + term.length) }),
      document.createTextNode(plain.slice(at + term.length))
    );
    entry.mark?.classList.add("is-lit");
    row.classList.add("is-hit");
  };

  const visible = () => rows.filter((row) => !row.classList.contains("is-hidden"));

  const move = (delta) => {
    const open = visible();
    if (!open.length) return;
    let next = cursor + delta;
    if (next < 0) next = open.length - 1;
    if (next >= open.length) next = 0;
    cursor = next;
    open.forEach((row) => row.classList.remove("is-active"));
    const row = open[cursor];
    row.classList.add("is-active");
    row.scrollIntoView({ block: "nearest" });
    if (count) {
      count.textContent = `${row.dataset.key}, ${cursor + 1} of ${open.length}`;
    }
  };

  const apply = () => {
    const term = field.value.trim().toLowerCase();
    let shown = 0;

    rows.forEach((row) => {
      const key = (row.dataset.key || "").toLowerCase();
      const hit = !term || key.includes(term);
      const pass = hit && chipsFor(row);
      row.classList.toggle("is-hidden", !pass);
      paintName(row, term);
      if (pass) shown += 1;
    });

    const stale = list.querySelector(".results__none");
    stale?.remove();

    if (!shown) {
      const note = document.createElement("li");
      note.className = "results__none";
      note.textContent = term ? `No command matches ${field.value.trim()}` : "No command in this filter";
      list.append(note);
    }

    if (count) {
      count.textContent = `${shown} command${shown === 1 ? "" : "s"}`;
    }

    const open = visible();
    cursor = open.length ? 0 : -1;
    if (cursor >= 0) {
      open.forEach((row) => row.classList.remove("is-active"));
      open[0].classList.add("is-active");
    }
  };

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      group = chip.dataset.chip || "all";
      chips.forEach((other) => {
        other.setAttribute("aria-pressed", other === chip ? "true" : "false");
      });
      apply();
      field.focus();
    });
  });

  field.addEventListener("input", apply);
  field.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      move(1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      move(-1);
    } else if (event.key === "PageDown") {
      event.preventDefault();
      move(4);
    } else if (event.key === "PageUp") {
      event.preventDefault();
      move(-4);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const open = visible();
      const row = open[cursor >= 0 ? cursor : 0];
      if (row) row.classList.add("is-hit");
    } else if (event.key === "Escape") {
      event.preventDefault();
      field.value = "";
      apply();
    }
  });

  apply();
}
