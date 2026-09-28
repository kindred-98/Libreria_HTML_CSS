document.documentElement.classList.add("has-js");

function init() {

const DATA = [
  { name: "American Eskimo, portrait", meta: "Flickr user SheltieBoy · CC BY 2.0", note: "Shot from just under the muzzle, so the animal owns the top two thirds of the frame and the wall is only a horizon.", crop: "4 × 5, upper third", c: "Flickr user SheltieBoy · CC BY 2.0" },
  { name: "Head against a plain wall", meta: "Helgi Halldórsson · CC BY-SA 2.0", note: "A tight head and nothing else. The whole frame is fur, eyes and a wall with one soft shadow in it.", crop: "Square, centre", c: "Helgi Halldórsson · CC BY-SA 2.0" },
  { name: "Dog and thrown shadow", meta: "FOTO:Fortepan 15537 · CC BY-SA 3.0", note: "A glass plate from the archive: the light is hard and low, and the shadow is nearly as legible as the animal.", crop: "4 × 5, low", c: "FOTO:Fortepan, donor Hegedűs Judit · CC BY-SA 3.0" },
  { name: "Studio plate, second", meta: "FOTO:Fortepan 15562 · CC BY-SA 3.0", note: "The second plate of the same sitting, exposed a stop brighter. The backdrop holds a clean gradient from top left.", crop: "4 × 5, centre", c: "FOTO:Fortepan, donor Hegedűs Judit · CC BY-SA 3.0" },
  { name: "A lady and a lap dog", meta: "Rembrandt · public domain", note: "The dog is the smallest object in the painting and the only one that looks out of the frame at you.", crop: "4 × 3, lower left", c: "Rembrandt, public domain" },
  { name: "Portrait with a small dog", meta: "Lavinia Fontana · public domain", note: "Sixteenth century, and the animal is dressed as carefully as the sitter. Kept for the collar alone.", crop: "4 × 5, lower right", c: "Lavinia Fontana, public domain" },
  { name: "Self-portrait with a black dog", meta: "Gustave Courbet · public domain", note: "Courbet puts the dog at his own height on purpose: same black, same stance, same refusal to move.", crop: "4 × 3, lower centre", c: "Gustave Courbet, public domain" }
];

const N = DATA.length;
const table = document.getElementById("table");
const prints = Array.from(document.querySelectorAll(".print"));
const loupe = document.getElementById("loupe");
const aName = document.getElementById("aName");
const aMeta = document.getElementById("aMeta");
const aNote = document.getElementById("aNote");
const aNo = document.getElementById("aNo");
const aCrop = document.getElementById("aCrop");
const hold = document.getElementById("hold");
const viewer = document.getElementById("viewer");
const vImg = document.getElementById("vImg");
const vNo = document.getElementById("vNo");
const vName = document.getElementById("vName");
const vNote = document.getElementById("vNote");
const vCredit = document.getElementById("vCredit");
const vClose = document.getElementById("vClose");
const vPrev = document.getElementById("vPrev");
const vNext = document.getElementById("vNext");

let sel = 0;
let open = false;
let restore = null;

function pad(n) {
  return String(n + 1).padStart(2, "0");
}

function placeLoupe() {
  const el = prints[sel];
  if (!el) return;
  const t = table.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  loupe.style.setProperty("--lx", (r.left - t.left + r.width / 2).toFixed(1) + "px");
  loupe.style.setProperty("--ly", (r.top - t.top + r.height * 0.46).toFixed(1) + "px");
}

function paint(i) {
  const d = DATA[i];
  prints.forEach((p, k) => p.classList.toggle("on", k === i));
  aName.textContent = d.name;
  aMeta.textContent = d.meta;
  aNote.textContent = d.note;
  aNo.textContent = pad(i) + " / " + String(N).padStart(2, "0");
  aCrop.textContent = d.crop;
  placeLoupe();
}

function select(i, focus) {
  sel = ((i % N) + N) % N;
  paint(sel);
  if (focus) prints[sel].focus();
}

function fillViewer(i) {
  const d = DATA[i];
  const shot = prints[i].querySelector("img");
  vImg.src = shot.currentSrc || shot.src;
  vImg.alt = shot.alt;
  vNo.textContent = "Frame " + pad(i) + " / " + String(N).padStart(2, "0");
  vName.textContent = d.name;
  vNote.textContent = d.note;
  vCredit.textContent = d.c;
}

function show(trigger) {
  if (open) return;
  open = true;
  restore = trigger || prints[sel];
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

prints.forEach(p => {
  const i = Number(p.dataset.i);
  p.addEventListener("click", () => {
    select(i, false);
    show(p);
  });
  p.addEventListener("focus", () => select(i, false));
  p.addEventListener("mouseenter", () => select(i, false));
});

hold.addEventListener("click", () => show(hold));
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
  else if (e.key === "Home") { e.preventDefault(); select(0, true); }
  else if (e.key === "End") { e.preventDefault(); select(N - 1, true); }
  else if (e.key === "Enter" || e.key === " ") {
    const a = document.activeElement;
    if (a === hold || (a && a.classList.contains("print"))) {
      e.preventDefault();
      show(a);
    }
  }
});

window.addEventListener("resize", placeLoupe);
select(0, false);

}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
