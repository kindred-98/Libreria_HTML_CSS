document.documentElement.classList.add("has-js");

function init() {

const DATA = [
  { name: "New York skyline", exp: "4 s", grade: "Night 400", author: "Andy Moreton", licence: "CC BY 3.0", note: "Four seconds is the shortest exposure on the reel: enough to hold the highlights of a skyline and let the sky go completely black." },
  { name: "City of London", exp: "8 s", grade: "Night 200", author: "Redbannana", licence: "CC BY-SA 4.0", note: "Shot from above the river with the whole financial district in one frame and no horizon to give the eye a rest." },
  { name: "Long Island City", exp: "6 s", grade: "Night 400", author: "King of Hearts", licence: "CC BY-SA 3.0", note: "A wide panorama, which is why the towers run small and there are so many of them: the frame is mostly window light." },
  { name: "Detroit waterfront", exp: "10 s", grade: "Night 800", author: "www.Pixel.la", licence: "CC0", note: "Towers doubled in the water, so half the photograph is upside down and nobody can tell which half is which." },
  { name: "City lights carpet", exp: "15 s", grade: "Night 1600", author: "Alex wong killerfvith", licence: "CC0", note: "No buildings in the frame at all, only the grid of streets that they make when the air above them is dark enough." },
  { name: "Panama City bay", exp: "8 s", grade: "Night 400", author: "Nelson de Witt", licence: "CC BY-SA 2.0", note: "The lights follow the curve of the bay, which is the only reason you can tell which city this is from the shape alone." },
  { name: "Mumbai night city", exp: "6 s", grade: "Night 400", author: "Skye Vidur", licence: "CC BY-SA 2.0", note: "Streets lit end to end and running to the sea, so the grid of the city is the subject and the buildings are only its edges." },
  { name: "Perth skyline", exp: "12 s", grade: "Night 200", author: "Mark Ryan", licence: "GFDL", note: "A small group of towers in a very dark frame: everything the exposure does not reach stays where it was." },
  { name: "Lights before the night", exp: "20 s", grade: "Night 1600", author: "Ali Safdarian", licence: "CC BY 3.0", note: "The longest exposure on the reel, taken while there was still some light left in the sky to keep the horizon from closing." },
  { name: "São Paulo skyline", exp: "8 s", grade: "Night 400", author: "Diego Torres Silvestre", licence: "CC BY 2.0", note: "Taken from a height, so the city reads as a solid block with the lights on top of it rather than as streets." }
];

const N = DATA.length;
const frames = Array.from(document.querySelectorAll(".frame"));
const rows = Array.from(document.querySelectorAll("#rows tr"));
const strip = document.getElementById("strip");
const lCount = document.getElementById("lCount");
const lNote = document.getElementById("lNote");
const boxBtn = document.getElementById("box");
const viewer = document.getElementById("viewer");
const vImg = document.getElementById("vImg");
const vN = document.getElementById("vN");
const vName = document.getElementById("vName");
const vNote = document.getElementById("vNote");
const vExp = document.getElementById("vExp");
const vGrade = document.getElementById("vGrade");
const vAuthor = document.getElementById("vAuthor");
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

function paint(i) {
  const d = DATA[i];
  frames.forEach((f, k) => {
    f.classList.toggle("on", k === i);
    f.setAttribute("aria-pressed", k === i ? "true" : "false");
  });
  rows.forEach((r, k) => r.classList.toggle("on", k === i));
  lCount.textContent = pad(i) + " / " + String(N).padStart(2, "0");
  lNote.textContent = d.note;
}

function goTo(i, focus) {
  sel = ((i % N) + N) % N;
  paint(sel);
  const target = frames[sel];
  if (target) strip.scrollTop = target.offsetTop - strip.offsetTop;
  if (focus && target) target.focus();
}

function fillViewer(i) {
  const d = DATA[i];
  const shot = frames[i].querySelector("img");
  vImg.src = shot.currentSrc || shot.src;
  vImg.alt = shot.alt;
  vN.textContent = "Frame " + pad(i) + " of " + String(N).padStart(2, "0");
  vName.textContent = d.name;
  vNote.textContent = d.note;
  vExp.textContent = d.exp;
  vGrade.textContent = d.grade;
  vAuthor.textContent = d.author;
  vCredit.textContent = d.author + " · " + d.licence;
}

function show(trigger) {
  if (open) return;
  open = true;
  restore = trigger || frames[sel];
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
    goTo(i, false);
    fillViewer(i);
    return;
  }
  goTo(sel + d, true);
}

frames.forEach(f => {
  const i = Number(f.dataset.i);
  f.addEventListener("click", () => goTo(i, true));
  f.addEventListener("focus", () => goTo(i, false));
});

rows.forEach((r, k) => {
  r.addEventListener("click", () => goTo(k, false));
  r.addEventListener("mouseenter", () => {
    if (!open) goTo(k, false);
  });
});

boxBtn.addEventListener("click", () => show(boxBtn));
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
    if (e.key === "Home") { e.preventDefault(); goTo(0, false); fillViewer(0); return; }
    if (e.key === "End") { e.preventDefault(); goTo(N - 1, false); fillViewer(N - 1); return; }
    if (e.key === "Tab") {
      const f = [vPrev, vClose, vNext];
      const at = f.indexOf(document.activeElement);
      e.preventDefault();
      const nx = e.shiftKey ? (at <= 0 ? f.length - 1 : at - 1) : (at === f.length - 1 ? 0 : at + 1);
      f[nx].focus();
    }
    return;
  }
  if (e.key === "ArrowUp") { e.preventDefault(); step(-1); }
  else if (e.key === "ArrowDown") { e.preventDefault(); step(1); }
  else if (e.key === "PageUp") { e.preventDefault(); step(-5); }
  else if (e.key === "PageDown") { e.preventDefault(); step(5); }
  else if (e.key === "Home") { e.preventDefault(); goTo(0, true); }
  else if (e.key === "End") { e.preventDefault(); goTo(N - 1, true); }
  else if (e.key === "Enter" || e.key === " ") {
    const a = document.activeElement;
    if (a === boxBtn || (a && a.classList.contains("frame"))) {
      e.preventDefault();
      show(a);
    }
  }
});

goTo(0, false);

}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
