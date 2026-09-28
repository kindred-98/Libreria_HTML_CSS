document.documentElement.classList.add("has-js");

function init() {

const DATA = [
  { cat: "Cat. 01", name: "Széchenyi Chain Bridge", where: "Budapest, Hungary", note: "The first permanent bridge over the Danube in the capital, hung from chains that were later replaced as the load grew.", builder: "A. Clark and J. Perry", span: "382 m", year: "1849", mat: "Wrought iron chain", c: "Wilfredor · CC0" },
  { cat: "Cat. 02", name: "New Tyne Bridge", where: "Newcastle, England", note: "A steel bowstring arch thrown over the Tyne in a single lift, with a road deck that curves so the view never closes.", builder: "Mott, Hay and Anderson", span: "134 m", year: "1928", mat: "Weathering steel", c: "Richard West · CC BY-SA 2.0" },
  { cat: "Cat. 03", name: "Gateshead Millennium Bridge", where: "Gateshead, England", note: "The tilting arch lets boats through on a single movement, and the mechanism is on show rather than hidden away.", builder: "C roads with Egis", span: "218 m", year: "2002", mat: "Steel, hydraulic tilt", c: "Richard West · CC BY-SA 2.0" },
  { cat: "Cat. 04", name: "Gimsøystraumen Bridge", where: "Lofoten, Norway", note: "A cantilever road bridge thrown across a fjord where the wind rules and the pylons were built from the rock up.", builder: "Statens vegvesen", span: "220 m", year: "1981", mat: "Reinforced concrete", c: "Ximonic (Simo Räsänen) · CC BY-SA 3.0" },
  { cat: "Cat. 05", name: "Bangabandhu Bridge", where: "Jamuna, Bangladesh", note: "Nearly five kilometres of road, rail and irrigation aqueduct carried on piers that stand in a river that moves every year.", builder: "Bangladesh Bridge Authority", span: "4 844 m", year: "1997", mat: "Concrete and steel", c: "Mahbub Shaheed / Prometheus-BD · CC BY-SA 2.0" },
  { cat: "Cat. 06", name: "Old Castle Bridge", where: "Warwick, England", note: "Five arches of dressed stone where a medieval gate once guarded the crossing; the narrowest span in the case.", builder: "Guild of masons", span: "27 m", year: "c. 1381", mat: "Dressed sandstone", c: "DeFacto · CC BY-SA 4.0" },
  { cat: "Cat. 07", name: "Golden Gate Bridge", where: "San Francisco, USA", note: "International orange over a hundred and twenty years of wind and fog, painted continuously to keep the steel above the salt.", builder: "Joseph Strauss and team", span: "1 280 m", year: "1937", mat: "Steel, Art Deco towers", c: "Carol M. Highsmith · public domain" }
];

const N = DATA.length;
const track = document.getElementById("track");
const objs = Array.from(document.querySelectorAll(".obj"));
const plCat = document.getElementById("plCat");
const plName = document.getElementById("plName");
const plWhere = document.getElementById("plWhere");
const plNote = document.getElementById("plNote");
const plBuilder = document.getElementById("plBuilder");
const plSpan = document.getElementById("plSpan");
const plYear = document.getElementById("plYear");
const plMat = document.getElementById("plMat");
const plOpen = document.getElementById("plOpen");
const viewer = document.getElementById("viewer");
const vwImg = document.getElementById("vwImg");
const vwCat = document.getElementById("vwCat");
const vwName = document.getElementById("vwName");
const vwWhere = document.getElementById("vwWhere");
const vwNote = document.getElementById("vwNote");
const vwBuilder = document.getElementById("vwBuilder");
const vwSpan = document.getElementById("vwSpan");
const vwYear = document.getElementById("vwYear");
const vwMat = document.getElementById("vwMat");
const vwCredit = document.getElementById("vwCredit");
const vwClose = document.getElementById("vwClose");
const vwPrev = document.getElementById("vwPrev");
const vwNext = document.getElementById("vwNext");

let sel = 0;
let open = false;
let restore = null;

function shift() {
  const first = objs[0];
  const second = objs[1];
  if (!first || !second) return;
  const step = second.offsetLeft - first.offsetLeft;
  const mid = (N - 1) / 2;
  track.style.setProperty("--sh", ((sel - mid) * step).toFixed(1) + "px");
}

function paint(i) {
  const d = DATA[i];
  objs.forEach((o, k) => {
    o.classList.toggle("on", k === i);
    o.setAttribute("aria-pressed", k === i ? "true" : "false");
  });
  plCat.textContent = d.cat;
  plName.textContent = d.name;
  plWhere.textContent = d.where;
  plNote.textContent = d.note;
  plBuilder.textContent = d.builder;
  plSpan.textContent = d.span;
  plYear.textContent = d.year;
  plMat.textContent = d.mat;
  shift();
}

function select(i, focus) {
  sel = ((i % N) + N) % N;
  paint(sel);
  if (focus) objs[sel].focus();
}

function fillViewer(i) {
  const d = DATA[i];
  const shot = objs[i].querySelector("img");
  vwImg.src = shot.currentSrc || shot.src;
  vwImg.alt = shot.alt;
  vwCat.textContent = d.cat;
  vwName.textContent = d.name;
  vwWhere.textContent = d.where;
  vwNote.textContent = d.note;
  vwBuilder.textContent = d.builder;
  vwSpan.textContent = d.span;
  vwYear.textContent = d.year;
  vwMat.textContent = d.mat;
  vwCredit.textContent = d.c;
}

function show(trigger) {
  if (open) return;
  open = true;
  restore = trigger || objs[sel];
  fillViewer(sel);
  viewer.hidden = false;
  document.body.style.overflow = "hidden";
  vwClose.focus();
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

objs.forEach(o => {
  const i = Number(o.dataset.i);
  o.addEventListener("click", () => select(i, false));
  o.addEventListener("focus", () => select(i, false));
  o.addEventListener("mouseenter", () => select(i, false));
});

plOpen.addEventListener("click", () => show(plOpen));
vwClose.addEventListener("click", hide);
vwPrev.addEventListener("click", () => step(-1));
vwNext.addEventListener("click", () => step(1));

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
      const f = [vwPrev, vwClose, vwNext];
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
    if (a && (a.classList.contains("obj") || a === plOpen)) {
      e.preventDefault();
      show(a);
    }
  }
});

window.addEventListener("resize", shift);
select(0, false);

}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
