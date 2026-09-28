document.documentElement.classList.add("has-js");

function init() {

const DATA = [
  { id: "S-01", name: "Meadow edge", note: "Fog lies deepest where the grass gives way to young trees, and it lingers an hour after the open field has cleared.", drop: "0.84 g/m³", d: 84, temp: "4.1 °C", t: 34, can: "62 %", c: 62, vis: "180 m", v: 30 },
  { id: "S-02", name: "Black spruce stand", note: "The canopy holds the damp and the trunks drip for hours; the mist never fully leaves this stand before noon.", drop: "0.91 g/m³", d: 91, temp: "3.6 °C", t: 30, can: "94 %", c: 94, vis: "90 m", v: 18 },
  { id: "S-03", name: "Raised bog", note: "A cold pool of air sits on the bog and the mist reads as a flat lid you could put a hand on.", drop: "0.77 g/m³", d: 77, temp: "2.8 °C", t: 25, can: "18 %", c: 18, vis: "240 m", v: 40 },
  { id: "S-04", name: "First light on the fields", note: "At sunrise the mist is thinnest and coldest; the wires come up out of it one span at a time.", drop: "0.62 g/m³", d: 62, temp: "5.4 °C", t: 44, can: "34 %", c: 34, vis: "420 m", v: 70 },
  { id: "S-05", name: "Low cloud, farm belt", note: "Cloud and mist are hard to separate here. The instrument calls it fog, the farmers call it a low day.", drop: "0.71 g/m³", d: 71, temp: "6.2 °C", t: 52, can: "27 %", c: 27, vis: "300 m", v: 50 },
  { id: "S-06", name: "Ridge crest", note: "Wind shears the top off the fog and leaves a hard line across the ridge you can trace with your eye.", drop: "0.58 g/m³", d: 58, temp: "3.1 °C", t: 27, can: "71 %", c: 71, vis: "520 m", v: 86 },
  { id: "S-07", name: "Pine wall", note: "A wall of pine and fog with no horizon in it at all. This is the densest reading on the sheet.", drop: "0.98 g/m³", d: 98, temp: "2.2 °C", t: 19, can: "88 %", c: 88, vis: "60 m", v: 12 },
  { id: "S-08", name: "Drifting bank", note: "A slow bank crosses the stand and takes four minutes to pass; sensors log it as a single long event.", drop: "0.86 g/m³", d: 86, temp: "4.8 °C", t: 40, can: "79 %", c: 79, vis: "140 m", v: 24 },
  { id: "S-09", name: "Hilltop wrap", note: "Fog wraps the hill and leaves the summit ring clear, so the top of the wood looks like an island from above.", drop: "0.74 g/m³", d: 74, temp: "2.5 °C", t: 22, can: "83 %", c: 83, vis: "200 m", v: 33 }
];

const N = DATA.length;
const nodes = Array.from(document.querySelectorAll(".node"));
const lines = Array.from(document.querySelectorAll(".wires line"));
const board = document.getElementById("board");
const linked = document.getElementById("linked");
const rId = document.getElementById("rId");
const rName = document.getElementById("rName");
const rDrop = document.getElementById("rDrop");
const rTemp = document.getElementById("rTemp");
const rCan = document.getElementById("rCan");
const rVis = document.getElementById("rVis");
const bDrop = document.getElementById("bDrop");
const bTemp = document.getElementById("bTemp");
const bCan = document.getElementById("bCan");
const bVis = document.getElementById("bVis");
const inspect = document.getElementById("inspect");
const inImg = document.getElementById("inImg");
const inKick = document.getElementById("inKick");
const inName = document.getElementById("inName");
const inNote = document.getElementById("inNote");
const inClose = document.getElementById("inClose");

const edges = lines.map(l => [Number(l.dataset.a), Number(l.dataset.b)]);
let sel = 0;
let restore = null;

function neighbours(i) {
  const out = [];
  edges.forEach(([a, b]) => {
    if (a === i) out.push(b);
    else if (b === i) out.push(a);
  });
  return out;
}

function paint(i) {
  const d = DATA[i];
  const near = neighbours(i);
  nodes.forEach((n, k) => n.classList.toggle("on", k === i));
  lines.forEach(l => {
    const a = Number(l.dataset.a);
    const b = Number(l.dataset.b);
    const lit = a === i || b === i;
    l.classList.toggle("lit", lit);
    l.classList.toggle("cold", !lit);
  });
  rId.textContent = d.id;
  rName.textContent = d.name;
  rDrop.textContent = d.drop;
  rTemp.textContent = d.temp;
  rCan.textContent = d.can;
  rVis.textContent = d.vis;
  bDrop.style.transform = "scaleX(" + (d.d / 100).toFixed(3) + ")";
  bTemp.style.transform = "scaleX(" + (d.t / 100).toFixed(3) + ")";
  bCan.style.transform = "scaleX(" + (d.c / 100).toFixed(3) + ")";
  bVis.style.transform = "scaleX(" + (d.v / 100).toFixed(3) + ")";
  linked.textContent = "";
  near.forEach(k => {
    const li = document.createElement("li");
    li.textContent = DATA[k].id;
    linked.appendChild(li);
  });
}

function select(i, focus) {
  sel = ((i % N) + N) % N;
  board.classList.add("has-sel");
  paint(sel);
  if (focus) nodes[sel].focus();
}

function openStation(trigger) {
  const d = DATA[sel];
  const shot = nodes[sel].querySelector("img");
  restore = trigger || nodes[sel];
  inImg.src = shot.currentSrc || shot.src;
  inImg.alt = shot.alt;
  inKick.textContent = "Station " + d.id;
  inName.textContent = d.name;
  inNote.textContent = d.note;
  inspect.hidden = false;
  inClose.focus();
}

function closeStation() {
  if (inspect.hidden) return;
  inspect.hidden = true;
  if (restore && document.contains(restore)) restore.focus();
}

function step(dir) {
  const here = nodes[sel].getBoundingClientRect();
  const cx = here.left + here.width / 2;
  const cy = here.top + here.height / 2;
  let best = -1;
  let bestScore = Infinity;
  nodes.forEach((n, k) => {
    if (k === sel) return;
    const r = n.getBoundingClientRect();
    const dx = r.left + r.width / 2 - cx;
    const dy = r.top + r.height / 2 - cy;
    const along = dir === "left" ? -dx : dir === "right" ? dx : dir === "up" ? -dy : dy;
    const side = dir === "left" || dir === "right" ? Math.abs(dy) : Math.abs(dx);
    if (along <= 8) return;
    const score = along + side * 1.9;
    if (score < bestScore) {
      bestScore = score;
      best = k;
    }
  });
  if (best >= 0) select(best, true);
}

nodes.forEach(n => {
  const i = Number(n.dataset.i);
  n.addEventListener("click", () => {
    select(i, false);
    openStation(n);
  });
  n.addEventListener("focus", () => select(i, false));
  n.addEventListener("mouseenter", () => select(i, false));
});

inClose.addEventListener("click", closeStation);

document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    if (!inspect.hidden) {
      e.preventDefault();
      closeStation();
    }
    return;
  }
  if (!inspect.hidden && (e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "ArrowUp" || e.key === "ArrowDown")) {
    e.preventDefault();
    step(e.key.slice(5).toLowerCase());
    openStation(nodes[sel]);
    return;
  }
  if (inspect.hidden) {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      step(e.key.slice(5).toLowerCase());
    } else if (e.key === "Home") {
      e.preventDefault();
      select(0, true);
    } else if (e.key === "End") {
      e.preventDefault();
      select(N - 1, true);
    } else if (e.key === "Enter" || e.key === " ") {
      if (document.activeElement && document.activeElement.classList.contains("node")) {
        e.preventDefault();
        openStation(document.activeElement);
      }
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
