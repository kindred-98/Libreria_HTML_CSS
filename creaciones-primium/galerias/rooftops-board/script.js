document.documentElement.classList.add("has-js");

function init() {

const STATES = ["Asignado", "En revisión", "Aprobado"];

const DATA = [
  { name: "Drone skyscrapers", where: "Drone view over a city block", survey: "Aerial 2019", state: 0, note: "Shot from a drone at an angle, so the frame is half rooftops and half open ground with a single construction site cut into the middle of it.", credit: "Lucas Franco · CC0" },
  { name: "New York Empire State Building", where: "New York, United States", survey: "Aerial 2017", state: 2, note: "The tower seen from street level among its neighbours, which is the only distance at which you can judge how much taller it actually is.", credit: "Felix · CC BY 3.0" },
  { name: "Saigon from a rooftop terrace", where: "Ho Chi Minh City, Vietnam", survey: "Terrace 2016", state: 0, note: "A restaurant roof high enough that the streets have closed into blocks, so the photograph is taken from the one height where the city has no traffic left in it.", credit: "shankar s. · CC BY 2.0" },
  { name: "Imus, Cavite", where: "Cavite, Philippines", survey: "Aerial 2012", state: 1, note: "Low rooftops and street trees, the flattest plate on the board: nothing in it rises far enough to cast a shadow worth the name.", credit: "Cookie Nguyen · CC BY-SA 4.0" },
  { name: "Munich, tower view", where: "Munich, Germany", survey: "Tower 8246", state: 0, note: "From the top of the Alter Peter tower, with the church roofs and the modern blocks arriving in the same frame for once.", credit: "Jorge Royan · CC BY-SA 3.0" },
  { name: "Red tile roofs", where: "Munich, Germany", survey: "Tower 8273", state: 0, note: "The old town from above, where every roof is the same colour and the only lines in the picture are the streets between them.", credit: "Jorge Royan · CC BY-SA 3.0" },
  { name: "Square and park", where: "Munich, Germany", survey: "Tower 8267", state: 2, note: "One block of park in the middle of the city, which from a tower reads as a hole cut in the roof plan.", credit: "Jorge Royan · CC BY-SA 3.0" },
  { name: "Financial district rooftops", where: "New York, United States", survey: "Berenice Abbott 1938", state: 1, note: "A gelatin silver print from 1938: the rooftops are all steel and tar, and there is not one aircraft in the sky.", credit: "Berenice Abbott · public domain" },
  { name: "Rooftops of Beirut", where: "Beirut, Lebanon", survey: "Bonfils plate", state: 0, note: "An early photographic plate looking towards the water, taken from a height that no one with a camera had any business being at.", credit: "Maison Bonfils · public domain" }
];

const COLS = 4;
const N = DATA.length;
const cells = Array.from(document.querySelectorAll(".cell:not(.gap)"));
const counts = [document.getElementById("c0"), document.getElementById("c1"), document.getElementById("c2")];
const rNo = document.getElementById("rNo");
const rName = document.getElementById("rName");
const rWhere = document.getElementById("rWhere");
const rCredit = document.getElementById("rCredit");
const cycleBtn = document.getElementById("cycle");
const takeBtn = document.getElementById("take");
const viewer = document.getElementById("viewer");
const vImg = document.getElementById("vImg");
const vNo = document.getElementById("vNo");
const vName = document.getElementById("vName");
const vWhere = document.getElementById("vWhere");
const vNote = document.getElementById("vNote");
const vState = document.getElementById("vState");
const vGrid = document.getElementById("vGrid");
const vYear = document.getElementById("vYear");
const vCredit = document.getElementById("vCredit");
const vClose = document.getElementById("vClose");
const vPrev = document.getElementById("vPrev");
const vNext = document.getElementById("vNext");

let sel = 0;
let open = false;
let restore = null;

function code(i) {
  return "A-" + String(i + 1).padStart(2, "0");
}

function countUp() {
  const tally = [0, 0, 0];
  DATA.forEach(d => { tally[d.state] += 1; });
  tally.forEach((v, k) => { counts[k].textContent = String(v); });
}

function paint(i) {
  const d = DATA[i];
  cells.forEach((c, k) => {
    c.classList.toggle("on", k === i);
    c.setAttribute("aria-pressed", k === i ? "true" : "false");
    c.classList.remove("s0", "s1", "s2");
    c.classList.add("s" + DATA[k].state);
    const em = c.querySelector(".state em");
    if (em) em.textContent = STATES[DATA[k].state];
  });
  rNo.textContent = code(i);
  rName.textContent = d.name;
  rWhere.textContent = d.where;
  rCredit.textContent = d.credit;
  countUp();
}

function select(i, focus) {
  sel = ((i % N) + N) % N;
  paint(sel);
  if (focus) cells[sel].focus();
}

function cycle(i) {
  DATA[i].state = (DATA[i].state + 1) % 3;
  paint(i);
  if (open) fillViewer(i);
}

function fillViewer(i) {
  const d = DATA[i];
  const shot = cells[i].querySelector("img");
  vImg.src = shot.currentSrc || shot.src;
  vImg.alt = shot.alt;
  vNo.textContent = code(i);
  vName.textContent = d.name;
  vWhere.textContent = d.where;
  vNote.textContent = d.note;
  vState.textContent = STATES[d.state];
  vGrid.textContent = "Row " + (Math.floor(i / COLS) + 1) + " · column " + ((i % COLS) + 1);
  vYear.textContent = d.survey;
  vCredit.textContent = d.credit;
}

function show(trigger) {
  if (open) return;
  open = true;
  restore = trigger || cells[sel];
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

cells.forEach(c => {
  const i = Number(c.dataset.i);
  c.addEventListener("click", () => select(i, true));
  c.addEventListener("focus", () => select(i, false));
  c.addEventListener("mouseenter", () => select(i, false));
});

cycleBtn.addEventListener("click", () => cycle(sel));
takeBtn.addEventListener("click", () => show(takeBtn));
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
    if (e.key === "s" || e.key === "S") { e.preventDefault(); cycle(sel); return; }
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
  else if (e.key === "ArrowUp") { e.preventDefault(); step(-COLS); }
  else if (e.key === "ArrowDown") { e.preventDefault(); step(COLS); }
  else if (e.key === "s" || e.key === "S") { e.preventDefault(); cycle(sel); }
  else if (e.key === "Home") { e.preventDefault(); select(0, true); }
  else if (e.key === "End") { e.preventDefault(); select(N - 1, true); }
  else if (e.key === "Enter" || e.key === " ") {
    const a = document.activeElement;
    if (a === takeBtn || (a && a.classList.contains("cell") && !a.classList.contains("gap"))) {
      e.preventDefault();
      show(a);
    }
  }
});

select(0, false);

}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
