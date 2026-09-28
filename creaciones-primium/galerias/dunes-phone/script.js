document.documentElement.classList.add("has-js");

function init() {

const DATA = [
  { name: "Sossusvlei", where: "Namib, Namibia", note: "The dune is the only red thing in the frame. Everything around it is grey sand and a sky that has not decided what colour to be yet.", credit: "Winfried Bruenken · CC BY-SA 2.5" },
  { name: "Namib-Naukluft", where: "Namib, Namibia", note: "Wind ridges combed along the crest of the dune, which is the only place on a dune where the wind is written down.", credit: "Yathin S Krishnappa · CC BY-SA 3.0" },
  { name: "Dakhla", where: "Western Desert, Egypt", note: "Low dunes on a flat plain that goes to the horizon in every direction. No landmark, no scale, no way to tell how far away the edge is.", credit: "Vyacheslav Argenberg · CC BY 2.0" },
  { name: "Thar at sunset", where: "Rajasthan, India", note: "The last ten minutes of light turn the whole field orange, and the photograph is only that ten minutes.", credit: "Sankara Subramanian · CC BY 2.0" },
  { name: "Thar dune", where: "Thar, India", note: "One ridge, one long shadow, and a hard line between lit sand and unlit sand that no camera can soften.", credit: "Clément Bardot · CC BY-SA 4.0" },
  { name: "Sam dunes", where: "Jaisalmer, India", note: "Flat afternoon light and a line of camels on the crest, small enough that you only find them on the second look.", credit: "Shreeya Jain · CC BY-SA 4.0" },
  { name: "Mesquite dunes", where: "Death Valley, United States", note: "Sand and a bare mountain in the same frame, which is the whole argument for putting a desert next to a desert.", credit: "Brocken Inaglory · CC BY-SA 3.0" },
  { name: "On the crest", where: "Thar, India", note: "Shot from the top of the tallest dune in the set, so every other dune in the frame is below the horizon line.", credit: "Last Emperor · CC BY-SA 3.0" }
];

const N = DATA.length;
const shots = Array.from(document.querySelectorAll(".shot"));
const dots = Array.from(document.querySelectorAll(".dots i"));
const feed = document.getElementById("feed");
const bar = document.getElementById("bar");
const clock = document.getElementById("clock");
const viewer = document.getElementById("viewer");
const vImg = document.getElementById("vImg");
const vN = document.getElementById("vN");
const vName = document.getElementById("vName");
const vWhere = document.getElementById("vWhere");
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

function paint(i) {
  dots.forEach((d, k) => d.classList.toggle("on", k === i));
  bar.style.width = (((i + 1) / N) * 100).toFixed(1) + "%";
  clock.textContent = "0" + (5 + (i % 4)) + ":" + String(12 + i * 6).padStart(2, "0");
}

function goTo(i, focus) {
  sel = ((i % N) + N) % N;
  paint(sel);
  const target = shots[sel];
  if (target) feed.scrollTop = target.offsetTop - feed.offsetTop;
  if (focus && target) {
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  }
}

function nearest() {
  return Math.round(feed.scrollTop / Math.max(1, feed.clientHeight));
}

function fillViewer(i) {
  const d = DATA[i];
  const shot = shots[i].querySelector("img");
  vImg.src = shot.currentSrc || shot.src;
  vImg.alt = shot.alt;
  vN.textContent = "Frame " + pad(i) + " / " + String(N).padStart(2, "0");
  vName.textContent = d.name;
  vWhere.textContent = d.where;
  vNote.textContent = d.note;
  vCredit.textContent = d.credit;
}

function show(trigger) {
  if (open) return;
  open = true;
  restore = trigger || shots[sel];
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
  goTo(sel + d, false);
}

feed.addEventListener("scroll", () => {
  if (open) return;
  const i = nearest();
  if (i === sel) return;
  sel = ((i % N) + N) % N;
  paint(sel);
}, { passive: true });

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
  else if (e.key === "PageUp") { e.preventDefault(); step(-3); }
  else if (e.key === "PageDown") { e.preventDefault(); step(3); }
  else if (e.key === "Home") { e.preventDefault(); goTo(0, false); }
  else if (e.key === "End") { e.preventDefault(); goTo(N - 1, false); }
  else if (e.key === "Enter") {
    e.preventDefault();
    show(shots[sel]);
  }
});

goTo(0, false);

}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
