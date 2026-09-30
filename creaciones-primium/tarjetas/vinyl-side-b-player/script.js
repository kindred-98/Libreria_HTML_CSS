const card = document.getElementById("vsb");
const now = document.getElementById("vsbNow");
const pos = document.getElementById("vsbPos");
const head = document.querySelector(".wave__head");
const playBtn = document.getElementById("vsbPlay");
const cueBtn = document.getElementById("vsbCue");
const lyricLines = Array.prototype.slice.call(document.querySelectorAll(".lyr"));

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const length = Number(now.dataset.length) || 192;
let seconds = Number(now.dataset.seconds) || 0;
let playing = true;
let liveIndex = 1;

function clock(value) {
  const total = Math.max(0, Math.min(length, Math.round(value)));
  return Math.floor(total / 60) + ":" + String(total % 60).padStart(2, "0");
}

function paint() {
  const ratio = Math.max(0.02, Math.min(1, seconds / length));
  now.textContent = clock(seconds);
  pos.style.transform = "scaleX(" + ratio.toFixed(4) + ")";
  if (head) {
    head.style.left = "calc(" + (ratio * 100).toFixed(2) + "% - 1px)";
  }
}

function advance() {
  if (!playing) {
    return;
  }
  seconds = seconds >= length ? 0 : seconds + 1;
  paint();
  setTimeout(advance, 1000);
}

function setLive(index) {
  liveIndex = index;
  lyricLines.forEach(function (line, i) {
    line.classList.toggle("lyr--live", i === index);
    line.classList.toggle("lyr--past", i < index);
  });
}

function cycleLyrics() {
  if (!playing) {
    return;
  }
  setLive((liveIndex + 1) % lyricLines.length);
  setTimeout(cycleLyrics, 2600);
}

function rollIn() {
  if (reduce) {
    seconds = length;
    setLive(lyricLines.length - 1);
    paint();
    return;
  }
  const target = Number(now.dataset.seconds) || 0;
  const duration = 900;
  const step = Math.max(16, Math.round(duration / 34));
  let elapsed = 0;
  function frame() {
    elapsed += step;
    const t = Math.min(1, elapsed / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    seconds = target * eased;
    paint();
    if (t < 1) {
      setTimeout(frame, step);
    } else {
      seconds = target;
      paint();
      setTimeout(advance, 1000);
      setTimeout(cycleLyrics, 2600);
    }
  }
  frame();
}

playBtn.addEventListener("click", function () {
  playing = !playing;
  card.classList.toggle("is-paused", !playing);
  playBtn.setAttribute("aria-pressed", playing ? "true" : "false");
  playBtn.textContent = playing ? "Pause" : "Play";
  if (playing) {
    setTimeout(advance, 1000);
    setTimeout(cycleLyrics, 2600);
  }
});

cueBtn.addEventListener("click", function () {
  const on = cueBtn.getAttribute("aria-pressed") === "true";
  cueBtn.setAttribute("aria-pressed", on ? "false" : "true");
  cueBtn.textContent = on ? "Cue side B" : "Cued to 1:47";
  if (!on) {
    setLive(1);
  }
});

rollIn();
