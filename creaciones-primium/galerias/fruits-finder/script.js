document.documentElement.classList.add("has-js");

function init() {

const DATA = [
  { title: "A colorful display of fruits", author: "Tolatheart", licence: "CC BY-SA 4.0", tags: ["market", "colour", "display"], note: "Ten kinds of fruit arranged by colour rather than by type, so the shelf reads as a gradient and the labels have to work harder than usual." },
  { title: "Colorful fresh fruits closeup", author: "Nenad Stojkovic", licence: "CC BY 2.0", tags: ["close-up", "fresh"], note: "No background, no context and no air: the frame is filled edge to edge, which is why every shape in it reads as a whole fruit." },
  { title: "Indian fruit chaat", author: "Nami Verma", licence: "CC BY-SA 4.0", tags: ["street", "spiced", "plate"], note: "A street plate built for contrast: pale fruit, dark chutney, green chutney and a dusting of something that is not sugar." },
  { title: "Colorful fruit jelly with cream", author: "epodrez", licence: "CC BY 2.0", tags: ["jelly", "sweet", "glossy"], note: "Jelly cubes under whipped cream, photographed close enough that the light has to come from behind them to read at all." },
  { title: "Market, fruit and grape in crates", author: "FOTO Fortepan 27081", licence: "CC BY-SA 3.0", tags: ["archive", "market", "grape"], note: "An archive frame with the crates, the scale and the gherkins all in one shot: the fruit is only half of what the photographer was cataloguing." },
  { title: "Market, apple and grape by the scale", author: "FOTO Fortepan 27274", licence: "CC BY-SA 3.0", tags: ["archive", "apple", "scale"], note: "A second frame from the same series, with the scale hanging dead centre above a heap of apples that has spilled onto the cloth." },
  { title: "Colorful fruit, a vendor in the middle", author: "FOTO Fortepan 93552", licence: "CC BY-SA 3.0", tags: ["archive", "vendor"], note: "The vendor is not posed and the fruit is not arranged, which is exactly why the colour ends up everywhere at once." },
  { title: "Bananas under the awning", author: "FOTO Fortepan 93673", licence: "CC BY-SA 3.0", tags: ["archive", "banana", "awning"], note: "A canopy, a turban and a stack of bananas: three things that are not fruit, holding the whole frame up." },
  { title: "A bird eating seeds", author: "joelfotos", licence: "CC0", tags: ["bird", "seeds", "colour"], note: "The only card on the shelf where the subject is not food. It stays in the fruit catalogue anyway, which is what makes a catalogue useful." }
];

const N = DATA.length;
const cards = Array.from(document.querySelectorAll(".card"));
const hits = Array.from(document.querySelectorAll(".hit"));
const sorts = Array.from(document.querySelectorAll(".sort"));
const q = document.getElementById("q");
const clearBtn = document.getElementById("clear");
const tally = document.getElementById("tally");
const empty = document.getElementById("empty");
const emptyNote = document.getElementById("emptyNote");
const reset = document.getElementById("reset");
const viewer = document.getElementById("viewer");
const vImg = document.getElementById("vImg");
const vCall = document.getElementById("vCall");
const vName = document.getElementById("vName");
const vNote = document.getElementById("vNote");
const vAuthor = document.getElementById("vAuthor");
const vLicence = document.getElementById("vLicence");
const vTags = document.getElementById("vTags");
const vCredit = document.getElementById("vCredit");
const vClose = document.getElementById("vClose");
const vPrev = document.getElementById("vPrev");
const vNext = document.getElementById("vNext");

let visible = DATA.map((_, k) => k);
let sortBy = "title";
let sel = 0;
let open = false;
let restore = null;

function call(i) {
  return "FR · " + String(i + 1).padStart(3, "0");
}

function haystack(i) {
  const d = DATA[i];
  return [d.title, d.author, d.licence, d.tags.join(" ")].join(" ").toLowerCase();
}

function value(i) {
  const d = DATA[i];
  return sortBy === "title" ? d.title : sortBy === "author" ? d.author : d.licence;
}

function paint() {
  hits.forEach((h, k) => {
    const on = visible.indexOf(k) === sel;
    h.classList.toggle("on", on);
    h.setAttribute("aria-pressed", on ? "true" : "false");
  });
  cards.forEach((c, k) => {
    const show = visible.includes(k);
    c.hidden = !show;
    c.classList.toggle("on", visible[sel] === k);
  });
  tally.textContent = visible.length + " of " + N + " plates";
  empty.hidden = visible.length > 0;
  if (visible.length === 0) emptyNote.textContent = "No card matches " + (q.value.trim() ? "“" + q.value.trim() + "”" : "that") + ". Try a colour, a market, an author or a licence.";
}

function reindex() {
  visible.sort((a, b) => value(a).localeCompare(value(b)));
  const keep = visible.indexOf(sel);
  if (keep === -1) sel = 0;
  paint();
}

function filter() {
  const term = q.value.trim().toLowerCase();
  visible = DATA.map((_, k) => k).filter(k => !term || haystack(k).includes(term));
  if (visible.includes(sel)) sel = 0;
  paint();
}

function select(i, focus) {
  if (visible.length === 0) return;
  sel = ((i % visible.length) + visible.length) % visible.length;
  paint();
  if (focus) hits[visible[sel]].focus();
}

function current() {
  return visible.length ? visible[sel] : 0;
}

function fillViewer(k) {
  const d = DATA[k];
  const shot = hits[k].querySelector("img");
  vImg.src = shot.currentSrc || shot.src;
  vImg.alt = shot.alt;
  vCall.textContent = call(k);
  vName.textContent = d.title;
  vNote.textContent = d.note;
  vAuthor.textContent = d.author;
  vLicence.textContent = d.licence;
  vTags.textContent = d.tags.join(" · ");
  vCredit.textContent = d.author + " · " + d.licence;
}

function show(trigger) {
  if (open || visible.length === 0) return;
  open = true;
  restore = trigger || hits[current()];
  fillViewer(current());
  viewer.hidden = false;
  document.body.style.overflow = "hidden";
  vClose.focus();
}

function hide() {
  if (!open) return;
  open = false;
  viewer.hidden = true;
  document.body.style.overflow = "";
  if (restore && document.contains(restore)) restore.focus();
}

function step(d) {
  if (open) {
    select(sel + d, false);
    fillViewer(current());
    return;
  }
  select(sel + d, true);
}

hits.forEach((h, k) => {
  h.addEventListener("click", () => {
    const at = visible.indexOf(k);
    if (at === -1) return;
    sel = at;
    paint();
  });
  h.addEventListener("focus", () => {
    const at = visible.indexOf(k);
    if (at !== -1 && at !== sel) {
      sel = at;
      paint();
    }
  });
  h.addEventListener("mouseenter", () => {
    const at = visible.indexOf(k);
    if (at !== -1 && at !== sel) {
      sel = at;
      paint();
    }
  });
});

q.addEventListener("input", filter);

clearBtn.addEventListener("click", () => {
  q.value = "";
  filter();
  q.focus();
});

reset.addEventListener("click", () => {
  q.value = "";
  filter();
  q.focus();
});

sorts.forEach(b => {
  b.addEventListener("click", () => {
    sortBy = b.dataset.s;
    sorts.forEach(o => {
      o.setAttribute("aria-pressed", o === b ? "true" : "false");
      o.classList.toggle("on", o === b);
    });
    reindex();
  });
});

vClose.addEventListener("click", hide);
vPrev.addEventListener("click", () => step(-1));
vNext.addEventListener("click", () => step(1));

viewer.addEventListener("click", e => {
  if (e.target === viewer) hide();
});

document.addEventListener("keydown", e => {
  if (open) {
    if (e.key === "Escape") { e.preventDefault(); hide(); return; }
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); step(-1); return; }
    if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); step(1); return; }
    if (e.key === "Home") { e.preventDefault(); select(0, false); fillViewer(current()); return; }
    if (e.key === "End") { e.preventDefault(); select(visible.length - 1, false); fillViewer(current()); return; }
    if (e.key === "Tab") {
      const f = [vPrev, vClose, vNext];
      const at = f.indexOf(document.activeElement);
      e.preventDefault();
      const nx = e.shiftKey ? (at <= 0 ? f.length - 1 : at - 1) : (at === f.length - 1 ? 0 : at + 1);
      f[nx].focus();
    }
    return;
  }
  const typing = document.activeElement === q;
  if (e.key === "Escape") {
    if (typing && q.value) {
      e.preventDefault();
      q.value = "";
      filter();
    }
    return;
  }
  if (typing && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
    e.preventDefault();
    q.blur();
    select(sel, true);
    return;
  }
  if (e.key === "ArrowUp") { e.preventDefault(); step(-1); }
  else if (e.key === "ArrowDown") { e.preventDefault(); step(1); }
  else if (e.key === "Home") { e.preventDefault(); select(0, true); }
  else if (e.key === "End") { e.preventDefault(); select(visible.length - 1, true); }
  else if (e.key === "Enter") {
    const a = document.activeElement;
    if (a && a.classList.contains("hit")) {
      e.preventDefault();
      show(a);
    } else if (visible.length) {
      e.preventDefault();
      show(hits[current()]);
    }
  }
});

paint();
sorts.forEach(o => o.classList.toggle("on", o.dataset.s === sortBy));

}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
