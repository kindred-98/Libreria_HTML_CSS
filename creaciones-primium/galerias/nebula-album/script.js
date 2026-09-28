document.documentElement.classList.add("has-js");

function init() {

const DATA = [
  { obj: "Messier 31", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Andromeda_galaxy.jpg/960px-Andromeda_galaxy.jpg", alt: "The Andromeda galaxy photographed in visible light from Earth", title: "Andromeda in visible light", body: "The nearest large spiral, seen from our own galaxy and long mistaken for a comet. The light on this plate left Andromeda two and a half million years ago.", dist: "2.54 Mly", tool: "Ground, 200 mm", exp: "180 s", c: "NASA/JPL/California Institute of Technology · public domain" },
  { obj: "Messier 31 · H-alpha", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Andromeda_Galaxy_%28with_h-alpha%29.jpg/960px-Andromeda_Galaxy_%28with_h-alpha%29.jpg", alt: "The Andromeda galaxy imaged in hydrogen alpha emission", title: "Andromeda in hydrogen alpha", body: "Hydrogen alpha isolates the glowing hydrogen of the star-forming regions, so the arms light up while the older bulge stays almost dark.", dist: "2.54 Mly", tool: "Ground, 300 mm", exp: "9 h", c: "Adam Evans · CC BY 2.0" },
  { obj: "Messier 31 · far infrared", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Herschel_Image_of_Andromeda_Galaxy.jpg/960px-Herschel_Image_of_Andromeda_Galaxy.jpg", alt: "The Andromeda galaxy mapped in far infrared by the Herschel space observatory", title: "The cold dust of Andromeda", body: "A far-infrared view from orbit: each bright knot is a cloud of cold dust and gas, the raw material a galaxy is eventually built from.", dist: "2.54 Mly", tool: "Herschel, 350 µm", exp: "Orbit", c: "ESA/Herschel · public domain" },
  { obj: "Cygnus Loop", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Ultraviolet_image_of_the_Cygnus_Loop_Nebula_crop.jpg/960px-Ultraviolet_image_of_the_Cygnus_Loop_Nebula_crop.jpg", alt: "Ultraviolet image of the Cygnus Loop supernova remnant", title: "The Cygnus Loop in ultraviolet", body: "The torn shell of a star that exploded thousands of years ago, still expanding and heating the gas it ploughs through on the way out.", dist: "2 400 ly", tool: "Ultraviolet, space", exp: "Orbit", c: "NASA/JPL-Caltech · public domain" },
  { obj: "NGC 2070 · 30 Doradus", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/30_Doradus%2C_Tarantula_Nebula.jpg/960px-30_Doradus%2C_Tarantula_Nebula.jpg", alt: "The Tarantula Nebula in the Large Magellanic Cloud", title: "Thirty Doradus, the Tarantula", body: "The largest known star-forming region in the Local Group, and bright enough to be seen from a dark site without any instrument at all.", dist: "161 kly", tool: "Mixed, space and ground", exp: "Composite", c: "NASA, ESA, ESO and partners · public domain" },
  { obj: "NGC 2070 · wide field", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/A_New_View_of_the_Tarantula_Nebula.jpg/960px-A_New_View_of_the_Tarantula_Nebula.jpg", alt: "A wide field view of the Tarantula Nebula and its surrounding cloud", title: "A wider frame on the Tarantula", body: "Pull the field back and the nebula stops being an object and becomes a region: gas, dust and young clusters spread across a whole corner of a satellite galaxy.", dist: "161 kly", tool: "Space, wide field", exp: "Orbit", c: "NASA · public domain" },
  { obj: "Messier 31 · crowded sky", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/The_Andromeda-Galaxy_in_a_crowded_sky.jpg/960px-The_Andromeda-Galaxy_in_a_crowded_sky.jpg", alt: "The Andromeda galaxy against a crowded background of foreground stars", title: "Andromeda in a crowded sky", body: "A long exposure in poor seeing: the galaxy holds together while thousands of foreground stars drift across it, one plane nearer than the rest.", dist: "2.54 Mly", tool: "Ground, 600 mm", exp: "1 h 40 m", c: "Keesscherer · CC BY-SA 4.0" },
  { obj: "NGC 2070 · Webb", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Tarantula_Nebula_by_JWST.jpg/960px-Tarantula_Nebula_by_JWST.jpg", alt: "The Tarantula Nebula imaged in infrared by the James Webb space telescope", title: "The Tarantula through Webb", body: "In infrared the dust stops hiding the stars, and the nebula resolves into thousands of individual objects that no ground telescope can separate.", dist: "161 kly", tool: "JWST, infrared", exp: "Orbit", c: "NASA, ESA, CSA, STScI · public domain" }
];

const N = DATA.length;
const room = document.querySelector(".room");
const cover = document.getElementById("cover");
const stage = document.getElementById("stage");
const photoPage = document.getElementById("photoPage");
const pgImg = document.getElementById("pgImg");
const pgPlate = document.getElementById("pgPlate");
const pKick = document.getElementById("pKick");
const pTitle = document.getElementById("pTitle");
const pBody = document.getElementById("pBody");
const pDist = document.getElementById("pDist");
const pTool = document.getElementById("pTool");
const pExp = document.getElementById("pExp");
const pCredit = document.getElementById("pCredit");
const prev = document.getElementById("prev");
const next = document.getElementById("next");
const close = document.getElementById("close");
const rail = document.getElementById("rail");

let page = 0;
let open = false;
let token = 0;
let dots = [];

function pad(n) {
  return String(n + 1).padStart(2, "0");
}

function fill(i) {
  const d = DATA[i];
  pgPlate.textContent = "Plate " + pad(i);
  pKick.textContent = d.obj;
  pTitle.textContent = d.title;
  pBody.textContent = d.body;
  pDist.textContent = d.dist;
  pTool.textContent = d.tool;
  pExp.textContent = d.exp;
  pCredit.textContent = d.c;
  pgImg.src = d.img;
  pgImg.alt = d.alt;
  dots.forEach((b, k) => b.setAttribute("aria-current", k === i ? "true" : "false"));
}

function turn(i) {
  page = ((i % N) + N) % N;
  photoPage.classList.add("turn");
  const t = ++token;
  window.setTimeout(() => {
    if (t !== token) return;
    fill(page);
    photoPage.classList.remove("turn");
  }, 220);
}

function buildRail() {
  for (let k = 0; k < N; k++) {
    const li = document.createElement("li");
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("aria-label", "Go to plate " + (k + 1));
    b.addEventListener("click", () => turn(k));
    li.appendChild(b);
    rail.appendChild(li);
    dots.push(b);
  }
}

function openAlbum() {
  if (open) return;
  open = true;
  cover.setAttribute("aria-expanded", "true");
  room.classList.add("opening");
  stage.hidden = false;
  fill(page);
  window.requestAnimationFrame(() => {
    stage.classList.add("grown");
  });
  window.setTimeout(() => close.focus(), 60);
}

function closeAlbum() {
  if (!open) return;
  open = false;
  cover.setAttribute("aria-expanded", "false");
  stage.classList.remove("grown");
  room.classList.remove("opening");
  window.setTimeout(() => {
    stage.hidden = true;
    photoPage.classList.remove("turn");
  }, 760);
  cover.focus();
}
cover.addEventListener("click", openAlbum);
close.addEventListener("click", closeAlbum);
prev.addEventListener("click", () => turn(page - 1));
next.addEventListener("click", () => turn(page + 1));

document.addEventListener("keydown", e => {
  if (!open) {
    if (e.key === "Enter" || e.key === " ") {
      if (document.activeElement === cover) {
        e.preventDefault();
        openAlbum();
      }
    }
    return;
  }
  if (e.key === "Escape") {
    e.preventDefault();
    closeAlbum();
  } else if (e.key === "Tab") {
    const f = [prev, next, close].filter(el => el.offsetParent !== null);
    const at = f.indexOf(document.activeElement);
    e.preventDefault();
    const nx = e.shiftKey ? (at <= 0 ? f.length - 1 : at - 1) : (at === f.length - 1 ? 0 : at + 1);
    if (f[nx]) f[nx].focus();
  } else if (e.key === "ArrowRight" || e.key === "PageDown") {
    e.preventDefault();
    turn(page + 1);
  } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
    e.preventDefault();
    turn(page - 1);
  } else if (e.key === "Home") {
    e.preventDefault();
    turn(0);
  } else if (e.key === "End") {
    e.preventDefault();
    turn(N - 1);
  }
});

buildRail();
fill(0);

}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
