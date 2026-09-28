document.documentElement.classList.add("has-js");

function init() {

const GELS = ["Cyan 1/2", "Cyan 1/4", "Cyan 1/8"];

const DATA = [
  { name: "Felis catus · cat on snow", note: "Shot low on a snowy slope, so the animal owns the horizontal band in the middle of the frame and the snow is the only background there is.", crop: "6 × 6, centre", exp: "1/500 s", credit: "Von.grzanka · CC BY-SA 3.0" },
  { name: "Grey tabby against a wall", note: "A cat sitting upright with its back to the plaster. The gel puts a cyan fringe on the fur and leaves the wall a shade colder still.", crop: "4 × 5, lower third", exp: "1/250 s", credit: "Alvesgaspar · CC BY-SA 3.0" },
  { name: "Long haired cat on a blanket", note: "Taken indoors with a single lamp and no fill, which is why the shadow side of the coat keeps its own colour instead of going black.", crop: "3 × 2, centre", exp: "1/125 s", credit: "Alvesgaspar · CC BY-SA 3.0" },
  { name: "Tired twenty year old cat", note: "Eyes half closed, one paw out flat. The plate is deliberately underexposed so the table light only reaches the head and the shoulder.", crop: "4 × 5, upper third", exp: "1/125 s", credit: "Dimitri Torterat · CC BY 2.0 fr" },
  { name: "Cat in hard sunlight", note: "Noon light on a stone ledge: the brightest plate in the arc and the one that shows the gel doing least work.", crop: "3 × 2, upper third", exp: "1/1000 s", credit: "درفش کاویانی · CC BY-SA 3.0" },
  { name: "Young lady holding a cat", note: "A sixteenth century panel where the animal is dressed as carefully as the sitter. The cat is smaller than the hand that holds it.", crop: "4 × 3, right", exp: "Grisaille scan", credit: "Francesco Bacchiacca · public domain" },
  { name: "Kit-cat portrait of a man", note: "An eighteenth century oil in which the cat sits at the sitter's own height, on purpose, in the same brown.", crop: "3 × 4, lower left", exp: "Plate scan", credit: "Godfrey Kneller · public domain" },
  { name: "Portrait of John Jay", note: "The statesman in black with a white cat at his feet: the only high key plate on the table, and the reason the gel is worth a second look.", crop: "4 × 5, lower right", exp: "Plate scan", credit: "Gilbert Stuart · public domain" }
];

const N = DATA.length;
const lenses = Array.from(document.querySelectorAll(".lens"));
const gels = Array.from(document.querySelectorAll(".gel"));
const shell = document.querySelector(".shell");
const plateImg = document.getElementById("plateImg");
const plateCap = document.getElementById("plateCap");
const rLens = document.getElementById("rLens");
const rCrop = document.getElementById("rCrop");
const rExp = document.getElementById("rExp");
const rCredit = document.getElementById("rCredit");
const note = document.getElementById("note");
const lift = document.getElementById("lift");
const viewer = document.getElementById("viewer");
const vImg = document.getElementById("vImg");
const vNo = document.getElementById("vNo");
const vName = document.getElementById("vName");
const vNote = document.getElementById("vNote");
const vGel = document.getElementById("vGel");
const vCrop = document.getElementById("vCrop");
const vCredit = document.getElementById("vCredit");
const vClose = document.getElementById("vClose");
const vPrev = document.getElementById("vPrev");
const vNext = document.getElementById("vNext");

let sel = 0;
let gel = 1;
let open = false;
let restore = null;

function pad(n) {
  return String(n + 1).padStart(2, "0");
}

function setGel(g) {
  gel = ((g % 3) + 3) % 3;
  shell.dataset.gel = String(gel);
  gels.forEach((b, k) => {
    b.classList.toggle("on", k === gel);
    b.setAttribute("aria-pressed", k === gel ? "true" : "false");
  });
  if (vGel) vGel.textContent = GELS[gel];
}

function paint(i) {
  const d = DATA[i];
  lenses.forEach((l, k) => {
    l.classList.toggle("on", k === i);
    l.setAttribute("aria-pressed", k === i ? "true" : "false");
  });
  const shot = lenses[i].querySelector("img");
  plateImg.src = shot.currentSrc || shot.src;
  plateImg.alt = shot.alt;
  plateCap.textContent = d.name;
  rLens.textContent = pad(i) + " of " + String(N).padStart(2, "0");
  rCrop.textContent = d.crop;
  rExp.textContent = d.exp;
  rCredit.textContent = d.credit;
  note.textContent = d.note;
}

function select(i, focus) {
  sel = ((i % N) + N) % N;
  paint(sel);
  if (focus) lenses[sel].focus();
}

function fillViewer(i) {
  const d = DATA[i];
  const shot = lenses[i].querySelector("img");
  vImg.src = shot.currentSrc || shot.src;
  vImg.alt = shot.alt;
  vNo.textContent = "Lens " + pad(i) + " / " + String(N).padStart(2, "0");
  vName.textContent = d.name;
  vNote.textContent = d.note;
  vCrop.textContent = d.crop;
  vCredit.textContent = d.credit;
  vGel.textContent = GELS[gel];
}

function show(trigger) {
  if (open) return;
  open = true;
  restore = trigger || lenses[sel];
  fillViewer(sel);
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
    const i = ((sel + d) % N + N) % N;
    select(i, false);
    fillViewer(i);
    return;
  }
  select(sel + d, true);
}

lenses.forEach(l => {
  const i = Number(l.dataset.i);
  l.addEventListener("click", () => select(i, false));
  l.addEventListener("focus", () => select(i, false));
  l.addEventListener("mouseenter", () => select(i, false));
});

gels.forEach(b => {
  b.addEventListener("click", () => setGel(Number(b.dataset.g)));
});

lift.addEventListener("click", () => show(lift));
vClose.addEventListener("click", hide);
vPrev.addEventListener("click", () => step(-1));
vNext.addEventListener("click", () => step(1));

viewer.addEventListener("click", e => {
  if (e.target === viewer) hide();
});

document.addEventListener("keydown", e => {
  if (open) {
    if (e.key === "Escape") { e.preventDefault(); hide(); return; }
    if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); return; }
    if (e.key === "ArrowRight") { e.preventDefault(); step(1); return; }
    if (e.key === "Home") { e.preventDefault(); select(0, false); fillViewer(0); return; }
    if (e.key === "End") { e.preventDefault(); select(N - 1, false); fillViewer(N - 1); return; }
    if (e.key === "Tab") {
      const f = [vPrev, vClose, vNext];
      const at = f.indexOf(document.activeElement);
      e.preventDefault();
      const nx = e.shiftKey ? (at <= 0 ? f.length - 1 : at - 1) : (at === f.length - 1 ? 0 : at + 1);
      f[nx].focus();
    }
    return;
  }
  if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
  else if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
  else if (e.key === "ArrowUp") { e.preventDefault(); setGel(gel + 1); }
  else if (e.key === "ArrowDown") { e.preventDefault(); setGel(gel - 1); }
  else if (e.key === "Home") { e.preventDefault(); select(0, true); }
  else if (e.key === "End") { e.preventDefault(); select(N - 1, true); }
  else if (e.key === "Enter" || e.key === " ") {
    const a = document.activeElement;
    if (a === lift || (a && a.classList.contains("lens"))) {
      e.preventDefault();
      show(a);
    }
  }
});

setGel(1);
select(0, false);

}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
