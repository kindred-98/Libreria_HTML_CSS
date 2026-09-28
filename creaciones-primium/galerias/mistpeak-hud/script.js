document.documentElement.classList.add("has-js");

function init() {

const DATA = [
  { name: "Mount Lushan ridge", short: "Lushan", alt: "A mountain ridge rising through fog on Mount Lushan", note: "The ridge breaks the fog for about four minutes a day and the tracker takes its shot on the first clear frame it gets.", alt2: "2 140 m", vis: "40 m", time: "06:12", c: "me (User:pfctdayelise) · CC BY-SA 2.5", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Mount_Lushan_-_fog.JPG/960px-Mount_Lushan_-_fog.JPG", dx: 0, dy: 0, bars: [0.34, 0.46, 0.62, 0.8, 0.72, 0.55, 0.4, 0.28, 0.22, 0.3, 0.44, 0.6] },
  { name: "Tule fog, Central Valley", short: "Tule fog", alt: "A satellite view of dense tule fog blanketing the Central Valley of California", note: "A valley sealed under a lid of fog, seen from orbit. The track is the only instrument that can measure it at this scale.", alt2: "30 m", vis: "10 m", time: "18:40", c: "Jeff Schmaltz, NASA · public domain", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Tule_Fog_California_-_2005.jpg/960px-Tule_Fog_California_-_2005.jpg", dx: -22, dy: 14, bars: [0.9, 0.86, 0.78, 0.7, 0.62, 0.58, 0.64, 0.74, 0.82, 0.88, 0.92, 0.9] },
  { name: "Erlauftal panorama", short: "Erlauftal", alt: "A foggy panorama across the Erlauftal valley below Blassenstein", note: "A valley filled to the brim, photographed from the ridge above. The peaks read as islands with no water under them.", alt2: "1 260 m", vis: "120 m", time: "07:05", c: "Uoaei1 · CC BY-SA 3.0", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Blassenstein_Erlauftal_mit_Nebel_02_Panorama.JPG/960px-Blassenstein_Erlauftal_mit_Nebel_02_Panorama.JPG", dx: 18, dy: -12, bars: [0.4, 0.5, 0.6, 0.72, 0.84, 0.9, 0.86, 0.74, 0.6, 0.48, 0.38, 0.3] },
  { name: "Kobilica of Shar Mountain", short: "Kobilica", alt: "Fog wrapped around the Kobilica peak of Shar Mountain in Macedonia", note: "The whole summit sits inside the cloud, so the track holds on the one fixed point the operator can still see.", alt2: "2 508 m", vis: "25 m", time: "08:20", c: "Делфина · CC BY-SA 4.0", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/The_fog_around_the_peak_called_Kobilica_of_Shar_Mountain_%2C_Macedonia.JPG/960px-The_fog_around_the_peak_called_Kobilica_of_Shar_Mountain_%2C_Macedonia.JPG", dx: -8, dy: -20, bars: [0.7, 0.78, 0.86, 0.92, 0.88, 0.76, 0.62, 0.5, 0.44, 0.5, 0.6, 0.7] },
  { name: "Cliff above the cloud sea", short: "Cloud sea", alt: "A cliff edge above a sea of cloud and fog", note: "Nothing to measure but the edge: the cloud surface runs flat to the horizon and the drop on the left has no floor.", alt2: "1 940 m", vis: "600 m", time: "09:30", c: "www.Pixel.la Free Stock Photos · CC0", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Mountains-clouds-fog-cliff_%2823698718314%29.jpg/960px-Mountains-clouds-fog-cliff_%2823698718314%29.jpg", dx: 26, dy: 6, bars: [0.2, 0.26, 0.34, 0.44, 0.5, 0.48, 0.42, 0.34, 0.28, 0.24, 0.22, 0.2] },
  { name: "Shrouded summit", short: "Summit", alt: "A mountain peak emerging from a bank of fog", note: "A single summit surfacing out of the fog for the length of one exposure and gone again on the next frame.", alt2: "3 040 m", vis: "30 m", time: "11:15", c: "Slawek K · CC0", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Fog-shrouded_mountain_peak_%28Unsplash%29.jpg/960px-Fog-shrouded_mountain_peak_%28Unsplash%29.jpg", dx: -26, dy: -6, bars: [0.82, 0.9, 0.94, 0.86, 0.7, 0.54, 0.4, 0.32, 0.3, 0.36, 0.48, 0.64] },
  { name: "Ridge fog, Da Lat", short: "Da Lat", alt: "Fog lying on a mountain ridge in Vietnam", note: "Fog lying flat along a ridge line like a tablecloth, with the pines on the upper side still in clear air.", alt2: "1 480 m", vis: "90 m", time: "14:02", c: "Viet Anh · CC BY-SA 4.0", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Fog_on_mountain_LD_VN.jpg/960px-Fog_on_mountain_LD_VN.jpg", dx: 10, dy: 20, bars: [0.36, 0.44, 0.56, 0.68, 0.78, 0.82, 0.76, 0.64, 0.52, 0.42, 0.36, 0.32] },
  { name: "Hoverla after sunset", short: "Hoverla", alt: "Mount Hoverla after sunset with low cloud sitting in the valleys", note: "Last frame of the day: the sun is gone, the valleys are full of cloud and the summit is the only clear point on the sheet.", alt2: "2 061 m", vis: "260 m", time: "19:48", c: "Khoroshkov · CC BY-SA 4.0", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/%D0%93%D0%BE%D1%80%D0%B0_%D0%93%D0%BE%D0%B2%D0%B5%D1%80%D0%BB%D0%B0_%D0%BF%D1%96%D1%81%D0%BB%D1%8F_%D0%B7%D0%B0%D1%85%D0%BE%D0%B4%D1%83_%D1%81%D0%BE%D0%BD%D1%86%D1%8F.jpg/960px-%D0%93%D0%BE%D1%80%D0%B0_%D0%93%D0%BE%D0%B2%D0%B5%D1%80%D0%BB%D0%B0_%D0%BF%D1%96%D1%81%D0%BB%D1%8F_%D0%B7%D0%B0%D1%85%D0%BE%D0%B4%D1%83_%D1%81%D0%BE%D0%BD%D1%86%D1%8F.jpg", dx: -14, dy: 16, bars: [0.3, 0.24, 0.2, 0.22, 0.3, 0.42, 0.56, 0.68, 0.74, 0.7, 0.58, 0.44] }
];

const N = DATA.length;
const feed = document.querySelector(".feed");
const feedImg = document.getElementById("feedImg");
const tlist = document.getElementById("tlist");
const lock = document.getElementById("lock");
const fTl = document.getElementById("fTl");
const fBl = document.getElementById("fBl");
const fBr = document.getElementById("fBr");
const iAlt = document.getElementById("iAlt");
const iBear = document.getElementById("iBear");
const iVis = document.getElementById("iVis");
const iTemp = document.getElementById("iTemp");
const iPres = document.getElementById("iPres");
const iWind = document.getElementById("iWind");
const iSig = document.getElementById("iSig");
const barWrap = document.getElementById("bars");
const openBtn = document.getElementById("open");
const viewer = document.getElementById("viewer");
const vImg = document.getElementById("vImg");
const vNo = document.getElementById("vNo");
const vName = document.getElementById("vName");
const vNote = document.getElementById("vNote");
const vAlt = document.getElementById("vAlt");
const vVis = document.getElementById("vVis");
const vTime = document.getElementById("vTime");
const vCredit = document.getElementById("vCredit");
const vClose = document.getElementById("vClose");
const vPrev = document.getElementById("vPrev");
const vNext = document.getElementById("vNext");

const bars = Array.from(barWrap.querySelectorAll("i"));
let sel = 0;
let open = false;
let restore = null;
let items = [];
function pad(n) {
  return String(n + 1).padStart(2, "0");
}

function build() {
  items = Array.from(tlist.querySelectorAll("li"));
  items.forEach((li, k) => {
    const b = li.querySelector("button");
    b.addEventListener("click", () => select(k, false));
    b.addEventListener("focus", () => select(k, false));
    b.addEventListener("mouseenter", () => select(k, false));
  });
}

function paint(i) {
  const d = DATA[i];
  items.forEach((li, k) => li.classList.toggle("on", k === i));
  fTl.textContent = "TGT " + pad(i) + " / " + String(N).padStart(2, "0") + " · " + d.short;
  fBl.textContent = "ALT " + d.alt2 + " · VIS " + d.vis;
  fBr.textContent = "H-ALT " + (i + 2) + "." + (i % 3);
  iAlt.textContent = d.alt2.replace(/\s/g, " ");
  iBear.textContent = String(28 + i * 9).padStart(3, "0") + "°";
  iVis.textContent = d.vis;
  iTemp.textContent = (-7.4 + i * 0.9).toFixed(1).replace("-", "−") + " °C";
  iPres.textContent = 698 + i * 3 + " hPa";
  iWind.textContent = ["NW 14 kt", "NNW 9 kt", "W 21 kt", "NW 6 kt", "SW 17 kt", "N 11 kt", "NNW 16 kt", "NW 24 kt"][i];
  iSig.textContent = Math.max(1, 5 - (i % 4)) + " / 5";
  lock.style.setProperty("--dx", d.dx + "%");
  lock.style.setProperty("--dy", d.dy + "%");
  bars.forEach((b, k) => b.style.setProperty("--v", d.bars[k].toFixed(2)));
}

function load(i) {
  feed.classList.add("swap");
  window.setTimeout(() => {
    feedImg.src = DATA[i].img;
    feedImg.alt = DATA[i].alt;
    feed.classList.remove("swap");
  }, 220);
}

function select(i, focus) {
  sel = ((i % N) + N) % N;
  paint(sel);
  load(sel);
  if (focus) items[sel].querySelector("button").focus();
}
function fillViewer(i) {
  const d = DATA[i];
  vImg.src = d.img;
  vImg.alt = d.alt;
  vNo.textContent = "TGT " + pad(i) + " / " + String(N).padStart(2, "0");
  vName.textContent = d.name;
  vNote.textContent = d.note;
  vAlt.textContent = d.alt2;
  vVis.textContent = d.vis;
  vTime.textContent = d.time;
  vCredit.textContent = d.c;
}

function show(trigger) {
  if (open) return;
  open = true;
  restore = trigger || items[sel].querySelector("button");
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
  if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); step(1); }
  else if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
  else if (e.key === "Home") { e.preventDefault(); select(0, true); }
  else if (e.key === "End") { e.preventDefault(); select(N - 1, true); }
  else if (e.key === "Enter" || e.key === " ") {
    if (document.activeElement === openBtn) {
      e.preventDefault();
      show(openBtn);
    }
  }
});

build();
feedImg.src = DATA[0].img;
feedImg.alt = DATA[0].alt;
paint(0);

}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
