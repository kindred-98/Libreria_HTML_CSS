document.documentElement.classList.add("has-js");

function init() {

const DATA = [
  { name: "Black, no sugar", note: "A single overhead, hard and close. The cup is the whole set: no props, no table, nothing to look at but the surface of the coffee.", lamp: 0, k: "2 400 K", level: "70 %", c: "Julius Schorzman · CC BY-SA 2.0", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/A_small_cup_of_coffee.JPG/960px-A_small_cup_of_coffee.JPG", alt: "A small white cup of black coffee seen from above" },
  { name: "Spice on the crema", note: "Two lamps, one warm and one cold, so the ground spices keep their colour and the cup keeps its shadow.", lamp: 1, k: "3 000 K", level: "84 %", c: "Lotus Head · CC BY-SA 3.0", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Cup_of_Coffee_with_Spices.jpg/960px-Cup_of_Coffee_with_Spices.jpg", alt: "A cup of coffee topped with ground spices on a saucer" },
  { name: "The house is open", note: "A broad top light and a warm bounce from the stalls. This is the cue the room was built for.", lamp: 2, k: "3 200 K", level: "92 %", c: "Sarah.Engin · CC BY-SA 4.0", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Coffee_makes_my_day.jpg/960px-Coffee_makes_my_day.jpg", alt: "A hand holding a mug of coffee over a café table" },
  { name: "Intermission, Berlin", note: "One lamp, off centre, and a lot of empty stage. The marble does the rest of the work on its own.", lamp: 0, k: "2 700 K", level: "58 %", c: "Edward · CC0", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Cup_of_coffee_in_Caf%C3%A9_Butter_-_Prenzlauer_Berg%2C_Berlin.jpg/960px-Cup_of_coffee_in_Caf%C3%A9_Butter_-_Prenzlauer_Berg%2C_Berlin.jpg", alt: "A cup of coffee on a marble table in a Berlin café" },
  { name: "Second act, with cake", note: "Everything on, but low. Two objects on the stage and a lamp each: the cake stays warmer than the cup.", lamp: 1, k: "3 100 K", level: "76 %", c: "TGar21 · CC BY-SA 4.0", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Cake_and_coffee.jpg/960px-Cake_and_coffee.jpg", alt: "A slice of cake beside a cup of coffee on a wooden table" },
  { name: "Matinee, Hanoi", note: "Flat daylight through the scrim, no lamp hot at all. The cue that proves the room also works with the rig closed.", lamp: 2, k: "5 400 K", level: "48 %", c: "Vyacheslav Argenberg · CC BY 4.0", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Coffee_cup_in_Hanoi%2C_Vietnam.jpg/960px-Coffee_cup_in_Hanoi%2C_Vietnam.jpg", alt: "A cup of coffee on a small table in Hanoi, Vietnam" },
  { name: "Curtain call, demitasse", note: "A tight beam on a hand-thrown glass. Small object, small cone, the smallest footprint any cue in the stack uses.", lamp: 0, k: "2 600 K", level: "64 %", c: "Petar Milošević · CC BY-SA 4.0", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Cup_of_coffee_%28Serbian_cuisine%2C_Grand_kava%29.jpg/960px-Cup_of_coffee_%28Serbian_cuisine%2C_Grand_kava%29.jpg", alt: "A small glass of Serbian kava served in a demitasse cup" },
  { name: "Encore, outdoors", note: "All three lamps and a haze that will not clear. The last cue holds the highest level in the whole stack.", lamp: 1, k: "3 400 K", level: "100 %", c: "Vyacheslav Argenberg · CC BY 4.0", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Huai_Nam_Dang_National_Park%2C_Espresso_coffee_cup%2C_Tree_stump%2C_Thailand.jpg/960px-Huai_Nam_Dang_National_Park%2C_Espresso_coffee_cup%2C_Tree_stump%2C_Thailand.jpg", alt: "An espresso cup on a tree stump in a national park in Thailand" }
];

const N = DATA.length;
const LAMPS = 3;
const theatre = document.getElementById("theatre");
const lamps = Array.from(document.querySelectorAll(".lamp"));
const scrim = document.querySelector(".scrim");
const wash = document.querySelector(".wash");
const scrimImg = document.getElementById("scrimImg");
const cueNo = document.getElementById("cueNo");
const cueName = document.getElementById("cueName");
const cues = document.getElementById("cues");
const dLamp = document.getElementById("dLamp");
const dNote = document.getElementById("dNote");
const openBtn = document.getElementById("open");
const viewer = document.getElementById("viewer");
const vImg = document.getElementById("vImg");
const vCue = document.getElementById("vCue");
const vName = document.getElementById("vName");
const vNote = document.getElementById("vNote");
const vLamp = document.getElementById("vLamp");
const vTemp = document.getElementById("vTemp");
const vLevel = document.getElementById("vLevel");
const vCredit = document.getElementById("vCredit");
const vClose = document.getElementById("vClose");
const vPrev = document.getElementById("vPrev");
const vNext = document.getElementById("vNext");

let cue = 0;
let open = false;
let restore = null;
let buttons = [];

function pad(n) {
  return String(n + 1).padStart(2, "0");
}

function paint(i) {
  const d = DATA[i];
  lamps.forEach((l, k) => l.classList.toggle("hot", k === d.lamp));
  buttons.forEach((b, k) => {
    b.classList.toggle("on", k === i);
    b.setAttribute("aria-current", k === i ? "true" : "false");
  });
  cueNo.textContent = "CUE " + pad(i);
  cueName.textContent = d.name;
  dLamp.textContent = "Lamp " + (d.lamp + 1) + " of " + LAMPS;
  dNote.textContent = d.note;
  wash.style.setProperty("--wx", (20 + d.lamp * 30) + "%");
  theatre.style.setProperty("--tilt", (d.lamp - 1) * 3 + "deg");
}

function load(i) {
  const d = DATA[i];
  scrim.classList.add("dark");
  window.setTimeout(() => {
    scrimImg.src = d.img;
    scrimImg.alt = d.alt;
    scrim.classList.remove("dark");
  }, 220);
}

function select(i, focus) {
  cue = ((i % N) + N) % N;
  paint(cue);
  load(cue);
  if (focus) buttons[cue].focus();
}

function fillViewer(i) {
  const d = DATA[i];
  vImg.src = d.img;
  vImg.alt = d.alt;
  vCue.textContent = "Cue " + pad(i);
  vName.textContent = d.name;
  vNote.textContent = d.note;
  vLamp.textContent = "Lamp " + (d.lamp + 1);
  vTemp.textContent = d.k;
  vLevel.textContent = d.level;
  vCredit.textContent = d.c;
}

function show(trigger) {
  if (open) return;
  open = true;
  restore = trigger || buttons[cue];
  fillViewer(cue);
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

function moveLamp(d) {
  const cur = DATA[cue].lamp;
  const next = ((cur + d) % LAMPS + LAMPS) % LAMPS;
  DATA[cue].lamp = next;
  paint(cue);
  if (open) fillViewer(cue);
}

for (let k = 0; k < N; k++) {
  const li = document.createElement("li");
  const b = document.createElement("button");
  b.type = "button";
  b.textContent = pad(k);
  b.setAttribute("aria-label", "Cue " + (k + 1) + ": " + DATA[k].name);
  b.addEventListener("click", () => select(k, false));
  li.appendChild(b);
  cues.appendChild(li);
  buttons.push(b);
}

openBtn.addEventListener("click", () => show(openBtn));
vClose.addEventListener("click", hide);
vPrev.addEventListener("click", () => select(cue - 1, false));
vNext.addEventListener("click", () => select(cue + 1, false));

viewer.addEventListener("click", e => {
  if (e.target === viewer) hide();
});

document.addEventListener("keydown", e => {
  if (open) {
    if (e.key === "Escape") { e.preventDefault(); hide(); return; }
    if (e.key === "ArrowLeft") { e.preventDefault(); select(cue - 1, false); fillViewer(cue); return; }
    if (e.key === "ArrowRight") { e.preventDefault(); select(cue + 1, false); fillViewer(cue); return; }
    if (e.key === "ArrowUp") { e.preventDefault(); moveLamp(-1); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); moveLamp(1); return; }
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
  if (e.key === "ArrowRight") { e.preventDefault(); select(cue + 1, true); }
  else if (e.key === "ArrowLeft") { e.preventDefault(); select(cue - 1, true); }
  else if (e.key === "ArrowUp") { e.preventDefault(); moveLamp(-1); }
  else if (e.key === "ArrowDown") { e.preventDefault(); moveLamp(1); }
  else if (e.key === "Home") { e.preventDefault(); select(0, true); }
  else if (e.key === "End") { e.preventDefault(); select(N - 1, true); }
  else if (e.key === "Enter" || e.key === " ") {
    if (document.activeElement === openBtn) {
      e.preventDefault();
      show(openBtn);
    }
  }
});

scrimImg.src = DATA[0].img;
scrimImg.alt = DATA[0].alt;
paint(0);
buttons.forEach((b, k) => b.setAttribute("aria-current", k === 0 ? "true" : "false"));

}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
