document.documentElement.classList.add("has-js");

function init() {

const DEPTHS = ["Upstage", "Midground", "Fore stage"];
const ANGLES = [-52, -8, 34];
const GOBOS = ["Halftone 1:1", "Halftone 1:1 wide", "Halftone 1:1 tight"];

const DATA = [
  { mark: "A1", depth: 0, name: "Wedding cake dessert", note: "The backcloth: a tall white silhouette that closes the stage and gives the amber beams something to read against.", credit: "Leon Brooks · public domain", temp: "2 400 K" },
  { mark: "A2", depth: 0, name: "St Honoré cake with chocolate", note: "A ring of pale pastry with a dark glaze, set dead centre upstage so the halftone never reaches the middle of it.", credit: "Trougnouf · CC BY 4.0", temp: "2 500 K" },
  { mark: "A3", depth: 0, name: "Charlotte aux poires et chocolat", note: "The quiet third flat. It stays two stops under the others until the light drops back to the upstage line.", credit: "Popo le Chien · CC BY-SA 3.0", temp: "2 400 K" },
  { mark: "B1", depth: 1, name: "Layered dessert cake", note: "Cream, sponge and fruit in visible layers: the midground flat that carries the eye from the backcloth to the table.", credit: "ProjectManhattan · CC BY-SA 3.0", temp: "2 600 K" },
  { mark: "B2", depth: 1, name: "Cake and pear dessert with raspberries", note: "A glazed plate and three raspberries, the only saturated red in the set and the reason the midground is lit at all.", credit: "Prayitno · CC BY 2.0", temp: "2 600 K" },
  { mark: "B3", depth: 1, name: "Applesauce cupcakes with icing", note: "A row rather than a hero: the flat that fills the middle of the stage without taking a call.", credit: "Connie Ma · CC BY-SA 2.0", temp: "2 700 K" },
  { mark: "C1", depth: 2, name: "Cassava cake, Filipino dessert", note: "A dense yellow wedge standing on the nearest line of the set, close enough to the audience that the gobo breaks up across its crust.", credit: "Fahad Faisal · CC BY-SA 4.0", temp: "2 700 K" },
  { mark: "C2", depth: 2, name: "Dessert plate with jelly, ice cream and mochi", note: "Nine small objects on one plate. On the fore line it reads as a still life, which is exactly where a still life belongs.", credit: "T.Tseng · CC BY 2.0", temp: "2 800 K" },
  { mark: "C3", depth: 2, name: "Applesauce walnut coffee cake", note: "Dusted sugar and walnut in the crust, the flattest of the nine and the one that needs the tightest gobo.", credit: "megan.chromik · CC BY-SA 2.0", temp: "2 800 K" }
];

const N = DATA.length;
const flats = Array.from(document.querySelectorAll(".flat"));
const dots = Array.from(document.querySelectorAll(".dot"));
const setEl = document.getElementById("set");
const needle = document.getElementById("needle");
const pDepth = document.getElementById("pDepth");
const pLamp = document.getElementById("pLamp");
const pGobo = document.getElementById("pGobo");
const sKick = document.getElementById("sKick");
const sName = document.getElementById("sName");
const sNote = document.getElementById("sNote");
const sCredit = document.getElementById("sCredit");
const openBtn = document.getElementById("open");
const viewer = document.getElementById("viewer");
const vImg = document.getElementById("vImg");
const vMark = document.getElementById("vMark");
const vName = document.getElementById("vName");
const vNote = document.getElementById("vNote");
const vDepth = document.getElementById("vDepth");
const vLamp = document.getElementById("vLamp");
const vTemp = document.getElementById("vTemp");
const vCredit = document.getElementById("vCredit");
const vClose = document.getElementById("vClose");
const vPrev = document.getElementById("vPrev");
const vNext = document.getElementById("vNext");

let sel = 6;
let lit = 2;
let open = false;
let restore = null;

function setLight(d) {
  lit = ((d % 3) + 3) % 3;
  setEl.dataset.lit = String(lit);
  needle.style.transform = "rotate(" + ANGLES[lit] + "deg)";
  pDepth.textContent = DEPTHS[lit];
  pLamp.textContent = "Lamp " + (lit + 1) + " of 3";
  pGobo.textContent = GOBOS[lit];
}

function paint(i) {
  const d = DATA[i];
  flats.forEach((f, k) => {
    f.classList.toggle("on", k === i);
    f.setAttribute("aria-pressed", k === i ? "true" : "false");
  });
  dots.forEach((p, k) => p.classList.toggle("on", k === i));
  sKick.textContent = "Flat " + d.mark + " · " + DEPTHS[d.depth].toLowerCase();
  sName.textContent = d.name;
  sNote.textContent = d.note;
  sCredit.textContent = d.credit;
}

function select(i, focus) {
  sel = ((i % N) + N) % N;
  setLight(DATA[sel].depth);
  paint(sel);
  if (focus) flats[sel].focus();
}

function fillViewer(i) {
  const d = DATA[i];
  const shot = flats[i].querySelector("img");
  vImg.src = shot.currentSrc || shot.src;
  vImg.alt = shot.alt;
  vMark.textContent = "Flat " + d.mark + " · " + DEPTHS[d.depth];
  vName.textContent = d.name;
  vNote.textContent = d.note;
  vDepth.textContent = DEPTHS[d.depth];
  vLamp.textContent = "Lamp " + (d.depth + 1);
  vTemp.textContent = d.temp;
  vCredit.textContent = d.credit;
}

function show(trigger) {
  if (open) return;
  open = true;
  restore = trigger || flats[sel];
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

flats.forEach(f => {
  const i = Number(f.dataset.i);
  f.addEventListener("click", () => select(i, false));
  f.addEventListener("focus", () => select(i, false));
  f.addEventListener("mouseenter", () => select(i, false));
});

openBtn.addEventListener("click", () => show(openBtn));
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
    if (e.key === "ArrowUp" || e.key === "ArrowDown") { e.preventDefault(); step(-3); return; }
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
  else if (e.key === "ArrowUp") { e.preventDefault(); step(-3); }
  else if (e.key === "ArrowDown") { e.preventDefault(); step(3); }
  else if (e.key === "Home") { e.preventDefault(); select(0, true); }
  else if (e.key === "End") { e.preventDefault(); select(N - 1, true); }
  else if (e.key === "Enter" || e.key === " ") {
    const a = document.activeElement;
    if (a === openBtn || (a && a.classList.contains("flat"))) {
      e.preventDefault();
      show(a);
    }
  }
});

select(6, false);

}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
