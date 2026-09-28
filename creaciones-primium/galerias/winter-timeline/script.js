document.documentElement.classList.add("has-js");

function init() {

const DATA = [
  { d: "06 DIC", t: "−12", k: "Plate 01 / 09", h: "First rail of the season", n: "The rack railway takes its first train above the tree line while the ridge still holds the night’s frost.", c: "Andreas Tille · CC BY-SA 4.0" },
  { d: "12 DIC", t: "−9", k: "Plate 02 / 09", h: "Low sun, loaded branches", n: "Two clear days let the sun reach the canopy; every spruce carries a bar of white on its north side.", c: "Andreas Tille · CC BY-SA 4.0" },
  { d: "19 DIC", t: "−14", k: "Plate 03 / 09", h: "Drift across the valley", n: "Wind out of the north-east packs the cutting shut; the only line left open is the one the train owns.", c: "Markus Trienke · CC BY-SA 2.0" },
  { d: "24 DIC", t: "−21", k: "Plate 04 / 09", h: "Whiteout in the canyon", n: "On the other side of the continent the same air arrives as a wall, and the spires go quiet.", c: "U.S. National Park Service · public domain" },
  { d: "28 DIC", t: "−7", k: "Plate 05 / 09", h: "The pass at midday", n: "A short thaw, enough to soften the crust and make every footprint a hard blue shadow.", c: "Psy guy · CC BY-SA 3.0" },
  { d: "02 ENE", t: "−16", k: "Plate 06 / 09", h: "New year, new drift", n: "Fresh snow erases the tracks and the ridgelines become the only writing left on the page.", c: "Pudelek (Marcin Szala) · CC BY-SA 4.0" },
  { d: "07 ENE", t: "−18", k: "Plate 07 / 09", h: "Walls without sound", n: "Snow swallows the courtyards; the old brickwork reads only as a shadow line on white.", c: "A.Savin · CC BY-SA 3.0" },
  { d: "14 ENE", t: "−11", k: "Plate 08 / 09", h: "Rock above the trees", n: "The bare larches let the tower keep its outline; by February it is the only landmark with an edge.", c: "Milan Bališin · CC BY-SA 4.0" },
  { d: "21 ENE", t: "−4", k: "Plate 09 / 09", h: "Thaw at the lake", n: "The season closes with four degrees and a roof losing its load one plank at a time.", c: "Michal Klajban · CC BY-SA 4.0" }
];

const spine = document.getElementById("spine");
const stops = Array.from(spine.querySelectorAll(".stop"));
const picks = Array.from(spine.querySelectorAll(".pick"));
const frames = stops.map(s => s.querySelector(".frame img"));
const gIdx = document.getElementById("gIdx");
const gFill = document.getElementById("gFill");
const gTemp = document.getElementById("gTemp");
const gDay = document.getElementById("gDay");
const viewer = document.getElementById("viewer");
const vImg = document.getElementById("vImg");
const vKicker = document.getElementById("vKicker");
const vTitle = document.getElementById("vTitle");
const vNote = document.getElementById("vNote");
const vCredit = document.getElementById("vCredit");
const vClose = document.getElementById("vClose");
const vPrev = document.getElementById("vPrev");
const vNext = document.getElementById("vNext");

const N = stops.length;
const pad = n => String(n + 1).padStart(2, "0");
let active = 0;
let open = false;
let restore = null;

function mark(i) {
  active = ((i % N) + N) % N;
  stops.forEach((s, k) => s.classList.toggle("on", k === active));
  picks.forEach((p, k) => p.setAttribute("aria-current", k === active ? "true" : "false"));
  gIdx.textContent = pad(active);
  gFill.style.transform = "scaleX(" + ((active + 1) / N).toFixed(4) + ")";
  gTemp.textContent = DATA[active].t + "°";
  gDay.textContent = DATA[active].d;
}

function scrollToActive() {
  const el = stops[active];
  const y = el.getBoundingClientRect().top + window.pageYOffset - Math.min(200, window.innerHeight * 0.34);
  window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
}

function paint(i) {
  const d = DATA[i];
  vImg.src = frames[i].currentSrc || frames[i].src;
  vImg.alt = frames[i].alt;
  vKicker.textContent = d.k;
  vTitle.textContent = d.h;
  vNote.textContent = d.n;
  vCredit.textContent = d.c;
}

function show(i, trigger) {
  restore = trigger || null;
  mark(i);
  paint(i);
  viewer.hidden = false;
  open = true;
  document.body.style.overflow = "hidden";
  vClose.focus();
}

function hide() {
  if (!open) return;
  viewer.hidden = true;
  open = false;
  document.body.style.overflow = "";
  if (restore && document.contains(restore)) restore.focus();
}

function step(d) {
  if (open) {
    const i = ((active + d) % N + N) % N;
    mark(i);
    paint(i);
    return;
  }
  mark(active + d);
  scrollToActive();
}

picks.forEach(p => {
  p.addEventListener("click", () => {
    mark(Number(p.dataset.i));
    show(active, p);
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
    if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); return; }
    if (e.key === "ArrowRight") { e.preventDefault(); step(1); return; }
    if (e.key === "Home") { e.preventDefault(); mark(0); paint(0); return; }
    if (e.key === "End") { e.preventDefault(); mark(N - 1); paint(N - 1); return; }
    if (e.key === "Tab") {
      const f = [vPrev, vClose, vNext].filter(el => !el.disabled);
      if (!f.length) return;
      const at = f.indexOf(document.activeElement);
      e.preventDefault();
      const next = e.shiftKey ? (at <= 0 ? f.length - 1 : at - 1) : (at === f.length - 1 ? 0 : at + 1);
      f[next].focus();
    }
    return;
  }
  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    e.preventDefault();
    step(e.key === "ArrowDown" ? 1 : -1);
  } else if (e.key === "Home") {
    e.preventDefault();
    mark(0);
    scrollToActive();
  } else if (e.key === "End") {
    e.preventDefault();
    mark(N - 1);
    scrollToActive();
  } else if (e.key === "Enter" && document.activeElement && document.activeElement.classList.contains("pick")) {
    e.preventDefault();
    show(active, document.activeElement);
  }
});

const seen = new Set();

if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add("in");
        const i = stops.indexOf(en.target);
        if (!seen.has(i)) {
          seen.add(i);
          mark(i);
        }
        io.unobserve(en.target);
      }
    });
  }, { rootMargin: "0px 0px -6% 0px", threshold: 0.02 });
  stops.forEach(s => io.observe(s));
} else {
  stops.forEach(s => s.classList.add("in"));
}

mark(0);

}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
