const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const card = document.getElementById("drw");
const routeLine = document.getElementById("drwRouteLine");
const ficha = document.getElementById("drwFicha");
const cpOut = document.getElementById("drwCp");
const sectOut = document.getElementById("drwSect");
const nameOut = document.getElementById("drwName");
const noteOut = document.getElementById("drwNote");
const surfOut = document.getElementById("drwSurf");
const nextOut = document.getElementById("drwNext");
const coordOut = document.getElementById("drwCoord");
const clockOut = document.getElementById("drwClock");
const marks = Array.from(document.querySelectorAll(".drw__wp"));

const POINTS = [
  { name: "Oasis Gate", sect: "Sector S1", note: "Start control on hard pack. The clock starts on the green flag, not on the ramp.", surf: "Hard pack", next: "41 km", coord: "30.41 N / 4.22 E" },
  { name: "Dune Sea", sect: "Sector S1", note: "Blind crest for two kilometres. Stay left of the ridge line or the sand swallows the front end.", surf: "Soft dunes", next: "38 km", coord: "30.58 N / 4.47 E" },
  { name: "Salt Pan", sect: "Sector S2", note: "Flat-out crossing with no waymark for six kilometres. Hold a steady line and trust the notes.", surf: "Salt crust", next: "34 km", coord: "30.72 N / 4.86 E" },
  { name: "Dry Wadi", sect: "Sector S2", note: "Rock step on entry. Keep the suspension fully compressed and let the car breathe over the crest.", surf: "Broken rock", next: "29 km", coord: "30.86 N / 5.12 E" },
  { name: "Erg Finish", sect: "Sector S3", note: "Flyer into the stone arch with two minutes of margin. Do not lift, the stop control is tight.", surf: "Firm sand", next: "0 km", coord: "30.99 N / 5.40 E" }
];

let current = 0;
let locked = false;

function paintPoint(index) {
  current = index;
  const data = POINTS[index];
  cpOut.textContent = "CP " + (index + 1);
  sectOut.textContent = data.sect;
  nameOut.textContent = data.name;
  noteOut.textContent = data.note;
  surfOut.textContent = data.surf;
  nextOut.textContent = data.next;
  coordOut.textContent = data.coord;
  marks.forEach(function (mark, i) {
    mark.setAttribute("aria-pressed", i === index ? "true" : "false");
  });
  if (reduce) {
    return;
  }
  ficha.classList.remove("is-swapping");
  void ficha.offsetWidth;
  ficha.classList.add("is-swapping");
  window.setTimeout(function () {
    ficha.classList.remove("is-swapping");
  }, 440);
}

marks.forEach(function (mark) {
  mark.addEventListener("click", function () {
    locked = true;
    paintPoint(Number(mark.dataset.wp));
  });
});

markRoute();

function markRoute() {
  let len = 540;
  try {
    len = Math.ceil(routeLine.getTotalLength());
  } catch (err) {
    len = 540;
  }
  routeLine.style.setProperty("--len", String(len));
  routeLine.setAttribute("stroke-dasharray", String(len));
  routeLine.setAttribute("stroke-dashoffset", "0");
  routeLine.classList.add("is-tracing");
  window.setTimeout(function () {
    routeLine.classList.remove("is-tracing");
  }, 700);
}

let elapsed = 1 * 3600 + 12 * 60 + 38;

function pad(value) {
  return value < 10 ? "0" + value : String(value);
}

function paintClock() {
  const hours = Math.floor(elapsed / 3600);
  const minutes = Math.floor((elapsed % 3600) / 60);
  const seconds = elapsed % 60;
  clockOut.textContent = pad(hours) + ":" + pad(minutes) + ":" + pad(seconds);
}

if (!reduce) {
  window.setTimeout(function () {
    window.setInterval(function () {
      elapsed += 1;
      paintClock();
    }, 1000);
  }, 800);

  window.setTimeout(function () {
    window.setInterval(function () {
      if (locked) {
        return;
      }
      paintPoint((current + 1) % POINTS.length);
    }, 4200);
  }, 2400);
}

paintPoint(0);

window.setTimeout(function () {
  card.classList.add("is-settled");
}, 800);