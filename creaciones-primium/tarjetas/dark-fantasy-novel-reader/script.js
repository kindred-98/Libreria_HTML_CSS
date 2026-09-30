const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const page = document.getElementById("page");
const pageNum = document.getElementById("pageNum");
const pageText = document.getElementById("pageText");
const verse = document.querySelector(".page__verse");
const backText = document.querySelector(".page__text--back");
const frontFoot = document.querySelector(".page__face--front .page__foot");
const backFoot = document.querySelector(".page__face--back .page__foot");
const ribbon = document.getElementById("ribbon");
const fill = document.getElementById("progressFill");
const marker = document.getElementById("progressMarker");
const label = document.getElementById("progressLabel");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const markBtn = document.getElementById("mark");
const hintFrom = document.getElementById("hintFrom");

const TOTAL = 206;

const pages = [
  {
    n: 128,
    drop: "T",
    head: "he lanterns went out one by one, and the vault learned our names. Mara counted them twice: nine lights, nine steps, nine lies the Abbot had told her about the crown.",
    verse: "Rope and ash, the old verse said, then nothing that a king can hold.",
    back: "The iron door had no handle on this side, only a keyhole shaped like a swallow, and behind it something was breathing in time with her."
  },
  {
    n: 129,
    drop: "S",
    head: "he air in the vault had a taste, thin and metallic, like a coin held in the mouth. She pressed her shoulder to the cold door and felt the breathing pause, then resume.",
    verse: "Nothing that a king can hold, nothing that a king can buy.",
    back: "The keyhole warmed under her palm. Somewhere in the stone a latch withdrew itself, patient as a held breath, and the seam of the door showed a line of light."
  },
  {
    n: 130,
    drop: "B",
    head: "y the time the second lantern guttered, the others had learned the trick of it. That was the lesson of the vault: never the flame, always the dark between two flames.",
    verse: "Ash remembers the shape of the branch. So does a crown.",
    back: "The line of light widened. The Abbot had said the door was a lie told to keep her out, and she had believed him the way you believe weather."
  }
];

let index = 0;
let turning = false;
let marked = true;

function render() {
  const data = pages[index];
  pageNum.textContent = String(data.n);
  frontFoot.textContent = String(data.n);
  backFoot.textContent = String(data.n + 1);
  hintFrom.textContent = String(data.n);

  pageText.textContent = "";
  const cap = document.createElement("span");
  cap.className = "drop";
  cap.textContent = data.drop;
  pageText.appendChild(cap);
  pageText.appendChild(document.createTextNode(data.head));

  verse.textContent = data.verse;
  backText.textContent = data.back;

  const ratio = data.n / TOTAL;
  fill.style.setProperty("--w", ratio.toFixed(3));
  marker.style.setProperty("--w", ratio.toFixed(3));
  label.textContent = Math.round(ratio * 100) + "% complete";
}

function turn(step) {
  if (turning) {
    return;
  }
  const nextIndex = index + step;
  if (nextIndex < 0 || nextIndex >= pages.length) {
    return;
  }
  turning = true;

  if (reduce) {
    index = nextIndex;
    render();
    turning = false;
    return;
  }

  page.classList.toggle("is-turning", step > 0);
  setTimeout(function () {
    index = nextIndex;
    render();
  }, 320);
  setTimeout(function () {
    page.classList.remove("is-turning");
    turning = false;
  }, 640);
}

prevBtn.addEventListener("click", function () {
  turn(-1);
});

nextBtn.addEventListener("click", function () {
  turn(1);
});

markBtn.addEventListener("click", function () {
  marked = !marked;
  markBtn.setAttribute("aria-pressed", marked ? "true" : "false");
  ribbon.classList.toggle("is-out", !marked);
});

document.addEventListener("keydown", function (event) {
  if (event.key === "ArrowRight") {
    turn(1);
  }
  if (event.key === "ArrowLeft") {
    turn(-1);
  }
});

render();
