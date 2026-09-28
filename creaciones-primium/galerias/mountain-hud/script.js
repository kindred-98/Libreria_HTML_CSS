document.documentElement.classList.add("has-js");

function init() {

const DATA = [
  { name: "Bay under the Sugarloaf", place: "Rio de Janeiro, Brazil", bear: 91, alt: 396, temp: 24, clock: "05:48", note: "The bay and the city under a low sun, with the Sugarloaf peak holding the last of the light for about six minutes.", credit: "Donatas Dabravolskas · CC BY-SA 4.0" },
  { name: "Flatirons sunrise", place: "Boulder, Colorado, United States", bear: 118, alt: 1984, temp: 4, clock: "06:31", note: "Five tilted slabs of sandstone taking the light in order, the last one still in shadow when the first has gone pink.", credit: "Tyler Cipriani · CC BY-SA 4.0" },
  { name: "Sunrise at Maligne Lake", place: "Jasper, Alberta, Canada", bear: 292, alt: 1676, temp: -9, clock: "07:04", note: "A ridge of peaks doubled in still water, which makes the photograph two photographs stacked on top of each other.", credit: "Sergey Pesterev · CC BY-SA 4.0" },
  { name: "Light along the ridge", place: "Jasper, Alberta, Canada", bear: 288, alt: 1676, temp: -9, clock: "07:01", note: "The same lake three minutes earlier: the sun is still below the treeline and only the top third of the ridge is lit.", credit: "Sergey Pesterev · CC BY-SA 4.0" },
  { name: "Pieniny at sunrise", place: "Pieniny, Poland", bear: 46, alt: 480, temp: 1, clock: "05:58", note: "Mist filling the valley floor with the ridges above it clear and cold, which is the only way to see how deep the basin is.", credit: "Pudelek · CC BY-SA 4.0" },
  { name: "From Chatka Puchatka", place: "Bieszczady, Poland", bear: 71, alt: 1308, temp: -6, clock: "06:22", note: "Shot from a mountain hut at first light, with the near ridge still black and the far ones going blue to grey.", credit: "Pudelek · CC BY-SA 4.0" },
  { name: "Clouds in the valley", place: "West Virginia, United States", bear: 105, alt: 1200, temp: 3, clock: "06:44", note: "A sea of cloud lying in the valley, with one ridge above it and nothing else in the frame to give the height.", credit: "ForestWander · CC BY-SA 3.0 US" },
  { name: "Autumn sunrise colours", place: "West Virginia, United States", bear: 110, alt: 1100, temp: 7, clock: "07:02", note: "The ridge is not the subject; the sky is. Warm orange laid over a line of trees already gone to rust.", credit: "ForestWander · CC BY-SA 3.0 US" },
  { name: "Šmarjetna gora", place: "Slovenia", bear: 23, alt: 947, temp: 2, clock: "06:20", note: "A forested summit with the light coming over it from the east, so the whole visible slope is in shadow and the crest is not.", credit: "Mihael Grmek · CC BY-SA 3.0" }
];

const N = DATA.length;
const rungs = Array.from(document.querySelectorAll(".rung"));
const sightImg = document.getElementById("sightImg");
const sightCode = document.getElementById("sightCode");
const sightName = document.getElementById("sightName");
const rBear = document.getElementById("rBear");
const rAlt = document.getElementById("rAlt");
const rClock = document.getElementById("rClock");
const rIdx = document.getElementById("rIdx");
const cNeedle = document.getElementById("cNeedle");
const cBear = document.getElementById("cBear");
const aFill = document.getElementById("aFill");
const aAlt = document.getElementById("aAlt");
const tFill = document.getElementById("tFill");
const tTemp = document.getElementById("tTemp");
const tNote = document.getElementById("tNote");
const openBtn = document.getElementById("open");
const viewer = document.getElementById("viewer");
const vImg = document.getElementById("vImg");
const vCode = document.getElementById("vCode");
const vName = document.getElementById("vName");
const vPlace = document.getElementById("vPlace");
const vNote = document.getElementById("vNote");
const vBear = document.getElementById("vBear");
const vAlt = document.getElementById("vAlt");
const vClock = document.getElementById("vClock");
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

function metres(n) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " m";
}

function tempText(n) {
  return (n < 0 ? "−" : "+") + Math.abs(n) + " °C";
}

function paint(i) {
  const d = DATA[i];
  rungs.forEach((r, k) => {
    r.classList.toggle("on", k === i);
    r.setAttribute("aria-pressed", k === i ? "true" : "false");
  });
  const shot = rungs[i].querySelector("img");
  sightImg.src = shot.currentSrc || shot.src;
  sightImg.alt = shot.alt;
  sightCode.textContent = "TGT " + pad(i);
  sightName.textContent = d.name;
  rBear.textContent = String(d.bear).padStart(3, "0") + "°";
  rAlt.textContent = metres(d.alt);
  rClock.textContent = d.clock;
  rIdx.textContent = pad(i) + " / " + pad(N - 1);
  cNeedle.style.transform = "rotate(" + (d.bear - 90) + "deg)";
  cBear.textContent = String(d.bear).padStart(3, "0") + "°";
  aFill.style.setProperty("--h", (12 + (d.alt / 2000) * 74).toFixed(1) + "%");
  aAlt.textContent = metres(d.alt);
  tFill.style.setProperty("--h", (34 + (d.temp + 9) * 5).toFixed(1) + "%");
  tTemp.textContent = tempText(d.temp);
  tNote.textContent = d.note;
}

function select(i, focus) {
  sel = ((i % N) + N) % N;
  paint(sel);
  if (focus) rungs[sel].focus();
}

function fillViewer(i) {
  const d = DATA[i];
  const shot = rungs[i].querySelector("img");
  vImg.src = shot.currentSrc || shot.src;
  vImg.alt = shot.alt;
  vCode.textContent = "Target " + pad(i);
  vName.textContent = d.name;
  vPlace.textContent = d.place;
  vNote.textContent = d.note;
  vBear.textContent = String(d.bear).padStart(3, "0") + "°";
  vAlt.textContent = metres(d.alt);
  vClock.textContent = d.clock;
  vCredit.textContent = d.credit;
}

function show(trigger) {
  if (open) return;
  open = true;
  restore = trigger || rungs[sel];
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

rungs.forEach(r => {
  const i = Number(r.dataset.i);
  r.addEventListener("click", () => select(i, false));
  r.addEventListener("focus", () => select(i, false));
  r.addEventListener("mouseenter", () => select(i, false));
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
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); step(-1); return; }
    if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); step(1); return; }
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
  if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
  else if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); step(1); }
  else if (e.key === "Home") { e.preventDefault(); select(0, true); }
  else if (e.key === "End") { e.preventDefault(); select(N - 1, true); }
  else if (e.key === "Enter" || e.key === " ") {
    const a = document.activeElement;
    if (a === openBtn || (a && a.classList.contains("rung"))) {
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
