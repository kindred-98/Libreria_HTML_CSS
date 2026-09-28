document.documentElement.classList.add("has-js");

function init() {

const DATA = [
  { n: "S-01", k: "Gate North", name: "Puerta Norte", note: "The band plays on the grass with the deck open to the afternoon; the block fills last and empties first.", seats: "12 400", occ: 64, acc: "Gates 1 to 4, ramp at the north corner", c: "U.S. Navy photo by Chief Photographer’s Mate Gary Ward · public domain" },
  { n: "S-02", k: "Tier East", name: "Anillo Este", note: "The night show fills the whole tier at once, a single shoulder-to-shoulder block with no empty row anywhere.", seats: "24 900", occ: 97, acc: "Concourse 2, stairs and lifts to row 41", c: "Andrew King · CC BY-SA 2.0" },
  { n: "S-03", k: "East Bowl", name: "Cuenca Este", note: "Seen from the upper deck the bowl reads as one solid mass; the front eighteen rows are the only place you can stand up.", seats: "31 200", occ: 91, acc: "Vomitories 14 to 19, step-free on the east side", c: "Andrew King · CC BY-SA 2.0" },
  { n: "S-04", k: "South Stand", name: "Grada Sur", note: "Once the lights go up on the stage the pitch empties and every seat turns toward the same corner of the roof.", seats: "18 750", occ: 38, acc: "Gate 6, ramp and accessible seating bay", c: "Edward Hyde · CC BY-SA 2.0" },
  { n: "S-05", k: "West Terrace", name: "Terraza Oeste", note: "The terrace is the cheapest way in and the first to sell: standing room, a low rail and the loudest square metre of the ground.", seats: "9 600", occ: 100, acc: "Open terrace, entry from Gate 9 only", c: "Yehudit Garinkol · CC BY 2.5" },
  { n: "S-06", k: "Upper Gallery", name: "Galería Alta", note: "From row 61 the crowd becomes a texture. The gallery is where the photographers work and where the plan looks best.", seats: "8 100", occ: 72, acc: "Gates 11 and 12, lift to concourse 4", c: "Raph_PH · CC BY 2.0" },
  { n: "S-07", k: "North Balcony", name: "Balcón Norte", note: "A narrow balcony over the turnstiles, half tables and half standing room, the block that empties fastest after the encore.", seats: "4 350", occ: 55, acc: "Balcony stair behind Gate 3", c: "Raph_PH · CC BY 2.0" }
];

const SRC = [
  "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/US_Navy_060318-N-3271W-001_The_U.S._Navy_Band_Destroyers_play_to_the_crowd_before_a_preseason_baseball_at_Surprise_Stadium.jpg/960px-US_Navy_060318-N-3271W-001_The_U.S._Navy_Band_Destroyers_play_to_the_crowd_before_a_preseason_baseball_at_Surprise_Stadium.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Millennium_stadium_concert.jpg/960px-Millennium_stadium_concert.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/MSP_Crowd_-_Cardiff_June_2010.jpg/960px-MSP_Crowd_-_Cardiff_June_2010.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/End_of_the_concert%2C_Westpac_Stadium.jpg/960px-End_of_the_concert%2C_Westpac_Stadium.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/PikiWiki_Israel_20310_Summer_Concert.JPG/960px-PikiWiki_Israel_20310_Summer_Concert.JPG",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Keith_Richards_waves_to_London_crowd_during_Rolling_Stones_concert_-_22_May_2018_%2842291973682%29.jpg/960px-Keith_Richards_waves_to_London_crowd_during_Rolling_Stones_concert_-_22_May_2018_%2842291973682%29.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Mick_Jagger_waves_to_crowd_during_Rolling_Stones_concert_in_London_-_22_May_2018_%2841437871065%29.jpg/960px-Mick_Jagger_waves_to_crowd_during_Rolling_Stones_concert_in_London_-_22_May_2018_%2841437871065%29.jpg"
];

const ALT = [
  "The U.S. Navy Band performing on the field of Surprise Stadium before a preseason baseball game",
  "A concert crowd filling the bowl of Millennium Stadium at night",
  "Thousands of spectators packed into the stands of Millennium Stadium in Cardiff",
  "An empty pitch at the end of a concert in Westpac Stadium with the crowd still seated in the stands",
  "A summer concert audience standing on the grass pitch under stage lights",
  "Keith Richards waving to the crowd from the stage of an outdoor concert in London",
  "Mick Jagger waving to a London crowd during a Rolling Stones concert"
];

const secs = Array.from(document.querySelectorAll(".sec"));
const rImg = document.getElementById("rImg");
const rNo = document.getElementById("rNo");
const rKick = document.getElementById("rKick");
const rName = document.getElementById("rName");
const rNote = document.getElementById("rNote");
const rSeats = document.getElementById("rSeats");
const rOcc = document.getElementById("rOcc");
const rAcc = document.getElementById("rAcc");
const rBar = document.getElementById("rBar");
const rCredit = document.getElementById("rCredit");
const rOpen = document.getElementById("rOpen");
const viewer = document.getElementById("viewer");
const vpImg = document.getElementById("vpImg");
const vpNo = document.getElementById("vpNo");
const vpName = document.getElementById("vpName");
const vpNote = document.getElementById("vpNote");
const vpCredit = document.getElementById("vpCredit");
const vpClose = document.getElementById("vpClose");
const vpPrev = document.getElementById("vpPrev");
const vpNext = document.getElementById("vpNext");
const N = secs.length;
let idx = 0;
let swap = 0;
let open = false;

function show(i, focus, instant) {
  idx = ((i % N) + N) % N;
  const d = DATA[idx];
  secs.forEach((s, k) => {
    s.classList.toggle("on", k === idx);
    s.setAttribute("aria-pressed", k === idx ? "true" : "false");
  });
  if (instant) {
    rImg.src = SRC[idx];
    rImg.alt = ALT[idx];
  } else {
    rImg.classList.add("swapping");
    const token = ++swap;
    window.setTimeout(() => {
      if (token !== swap) return;
      rImg.src = SRC[idx];
      rImg.alt = ALT[idx];
      rImg.classList.remove("swapping");
    }, 150);
  }
  rNo.textContent = d.n;
  rKick.textContent = d.k;
  rName.textContent = d.name;
  rNote.textContent = d.note;
  rSeats.textContent = d.seats;
  rOcc.textContent = d.occ + " %";
  rAcc.textContent = d.acc;
  rBar.style.transform = "scaleX(" + (d.occ / 100).toFixed(3) + ")";
  rCredit.textContent = d.c;
  if (focus) secs[idx].focus();
}

function fillPlate(i) {
  const d = DATA[i];
  vpImg.src = SRC[i];
  vpImg.alt = ALT[i];
  vpNo.textContent = d.n;
  vpName.textContent = d.name;
  vpNote.textContent = d.note;
  vpCredit.textContent = d.c;
}

function openPlate(trigger) {
  if (open) return;
  open = true;
  fillPlate(idx);
  viewer.hidden = false;
  document.body.style.overflow = "hidden";
  vpClose.focus();
}

function closePlate() {
  if (!open) return;
  open = false;
  viewer.hidden = true;
  document.body.style.overflow = "";
  if (trigger0 && document.contains(trigger0)) trigger0.focus();
}

let trigger0 = null;

secs.forEach(s => {
  s.addEventListener("click", () => show(Number(s.dataset.i), false));
  s.addEventListener("mouseenter", () => show(Number(s.dataset.i), false));
  s.addEventListener("focus", () => show(Number(s.dataset.i), false));
});

rOpen.addEventListener("click", () => {
  trigger0 = rOpen;
  openPlate(rOpen);
});

vpClose.addEventListener("click", closePlate);
vpPrev.addEventListener("click", () => show(idx - 1, false));
vpNext.addEventListener("click", () => show(idx + 1, false));

viewer.addEventListener("click", e => {
  if (e.target === viewer) closePlate();
});

document.addEventListener("keydown", e => {
  if (open) {
    if (e.key === "Escape") { e.preventDefault(); closePlate(); return; }
    if (e.key === "ArrowLeft") { e.preventDefault(); show(idx - 1, false); fillPlate(idx); return; }
    if (e.key === "ArrowRight") { e.preventDefault(); show(idx + 1, false); fillPlate(idx); return; }
    if (e.key === "Home") { e.preventDefault(); show(0, false); fillPlate(0); return; }
    if (e.key === "End") { e.preventDefault(); show(N - 1, false); fillPlate(N - 1); return; }
    if (e.key === "Tab") {
      const f = [vpPrev, vpClose, vpNext];
      const at = f.indexOf(document.activeElement);
      e.preventDefault();
      const nx = e.shiftKey ? (at <= 0 ? f.length - 1 : at - 1) : (at === f.length - 1 ? 0 : at + 1);
      f[nx].focus();
    }
    return;
  }
  if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); show(idx + 1, true); }
  else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); show(idx - 1, true); }
  else if (e.key === "Home") { e.preventDefault(); show(0, true); }
  else if (e.key === "End") { e.preventDefault(); show(N - 1, true); }
  else if (e.key === "Enter" || e.key === " ") {
    const a = document.activeElement;
    if (a === rOpen || (a && a.classList.contains("sec"))) {
      e.preventDefault();
      trigger0 = a;
      openPlate(a);
    }
  }
});

show(0, false, true);

}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
