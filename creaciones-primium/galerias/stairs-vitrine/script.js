document.documentElement.classList.add("has-js");

function init() {

const DATA = [
  { name: "Escalier monumental Neue Burg", place: "Vienna, Austria", arch: "Heinrich von Ferstel", lvl: "3", year: "1873", mat: "Stone and iron", note: "The ceremonial stair of a nineteenth century fortress palace, cut in tiers so that every arrival is announced twice before the door.", credit: "Jebulon · CC0" },
  { name: "Stairs Château de Beynac", place: "Beynac, France", arch: "Unknown medieval works", lvl: "2", year: "15th century", mat: "Limestone", note: "A spiral of worn treads wedged between the keep and the outer wall, wide enough for one person and a loaded mule.", credit: "Jebulon · CC0" },
  { name: "Staircase of the National Museum of Slovenia", place: "Ljubljana, Slovenia", arch: "Viljem Treo and Jan Vladimir Hráský", lvl: "4", year: "1885", mat: "Cast iron and marble", note: "The central stair of a purpose built museum hall, its balustrade carved as a run of putti that hold the new stone up.", credit: "Petar Milošević · CC BY-SA 4.0" },
  { name: "Natural History Museum Main Hall", place: "London, United Kingdom", arch: "Alfred Waterhouse", lvl: "3", year: "1881", mat: "Terracotta and stone", note: "Two flights meeting under a single vault, with the landings treated as galleries so the climb is also the tour.", credit: "Diliff · CC BY-SA 3.0" },
  { name: "Royal stairs in Palazzo Farnese", place: "Caprarola, Italy", arch: "Giacomo Barozzi da Vignola", lvl: "3", year: "1560", mat: "Travertine", note: "An elliptical spiral cut into a drum, the ramp half hidden inside the wall so a visitor sees treads and nothing else.", credit: "Livioandronico2013 · CC BY-SA 4.0" },
  { name: "Painting a staircase", place: "Rajasthan, India", arch: "Workshop of the old city", lvl: "4", year: "contemporary", mat: "Painted plaster", note: "The stair is finished but the ornament is not: the last flight is still a scaffold, a palette and a lamp held in one hand.", credit: "Jorge Royan · CC BY-SA 3.0" },
  { name: "Archives and the port", place: "Genoa, Italy", arch: "Harbour board works", lvl: "5", year: "1920s", mat: "Steel and concrete", note: "A working stair tower photographed from the water, every landing lit and every riser worn into a curve by the port crews.", credit: "Jalal Volker · public domain" },
  { name: "Phimeanakas, Angkor Thom", place: "Siem Reap, Cambodia", arch: "Suryavarman II", lvl: "2", year: "12th century", mat: "Laterite and sandstone", note: "The temple stair climbs to a single upper terrace, steep and narrow, with the jungle pressed in on both sides.", credit: "Diego Delso · CC BY-SA 3.0" },
  { name: "Fort du Mont Bart", place: "Belfort, France", arch: "Séré de Rivières system", lvl: "3", year: "19th century", mat: "Ashlar and iron", note: "A zigzagging stair cut into a wooded slope, built so that a defender walks the whole parapet without ever leaving cover.", credit: "Thomas Bresson · CC BY 3.0" }
];

const N = DATA.length;
const treads = Array.from(document.querySelectorAll(".tread"));
const caseBox = document.querySelector(".case");
const pool = document.getElementById("pool");
const sCat = document.getElementById("sCat");
const sName = document.getElementById("sName");
const sPlace = document.getElementById("sPlace");
const sNote = document.getElementById("sNote");
const sArch = document.getElementById("sArch");
const sLvl = document.getElementById("sLvl");
const sYear = document.getElementById("sYear");
const sMat = document.getElementById("sMat");
const sHint = document.getElementById("sHint");
const lift = document.getElementById("lift");
const viewer = document.getElementById("viewer");
const vImg = document.getElementById("vImg");
const vCat = document.getElementById("vCat");
const vName = document.getElementById("vName");
const vPlace = document.getElementById("vPlace");
const vNote = document.getElementById("vNote");
const vArch = document.getElementById("vArch");
const vLvl = document.getElementById("vLvl");
const vYear = document.getElementById("vYear");
const vMat = document.getElementById("vMat");
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

function cat(n) {
  return "PL. " + pad(n);
}

function placePool() {
  const el = treads[sel];
  if (!el || !caseBox) return;
  const c = caseBox.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  pool.style.setProperty("--px", (r.left - c.left + r.width / 2 - c.width * 0.17).toFixed(1) + "px");
}

function paint(i) {
  const d = DATA[i];
  treads.forEach((t, k) => {
    t.classList.toggle("on", k === i);
    t.setAttribute("aria-pressed", k === i ? "true" : "false");
  });
  sCat.textContent = cat(i);
  sName.textContent = d.name;
  sPlace.textContent = d.place;
  sNote.textContent = d.note;
  sArch.textContent = d.arch;
  sLvl.textContent = d.lvl;
  sYear.textContent = d.year;
  sMat.textContent = d.mat;
  sHint.textContent = "Tread " + pad(i) + " of " + N + " · flight level +" + (d.lvl * 3.2).toFixed(2).replace(".", ",");
  placePool();
}

function select(i, focus) {
  sel = ((i % N) + N) % N;
  paint(sel);
  if (focus) treads[sel].focus();
}

function fillViewer(i) {
  const d = DATA[i];
  const shot = treads[i].querySelector("img");
  vImg.src = shot.currentSrc || shot.src;
  vImg.alt = shot.alt;
  vCat.textContent = cat(i);
  vName.textContent = d.name;
  vPlace.textContent = d.place;
  vNote.textContent = d.note;
  vArch.textContent = d.arch;
  vLvl.textContent = d.lvl;
  vYear.textContent = d.year;
  vMat.textContent = d.mat;
  vCredit.textContent = d.credit;
}

function show(trigger) {
  if (open) return;
  open = true;
  restore = trigger || treads[sel];
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

treads.forEach(t => {
  const i = Number(t.dataset.i);
  t.addEventListener("click", () => select(i, false));
  t.addEventListener("focus", () => select(i, false));
  t.addEventListener("mouseenter", () => select(i, false));
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
  else if (e.key === "ArrowUp") { e.preventDefault(); step(-3); }
  else if (e.key === "ArrowDown") { e.preventDefault(); step(3); }
  else if (e.key === "Home") { e.preventDefault(); select(0, true); }
  else if (e.key === "End") { e.preventDefault(); select(N - 1, true); }
  else if (e.key === "Enter" || e.key === " ") {
    const a = document.activeElement;
    if (a === lift || (a && a.classList.contains("tread"))) {
      e.preventDefault();
      show(a);
    }
  }
});

window.addEventListener("resize", placePool);
select(0, false);

}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
