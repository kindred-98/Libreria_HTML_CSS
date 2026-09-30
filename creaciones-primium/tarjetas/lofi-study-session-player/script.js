const player = document.getElementById("player");
const playBtn = document.getElementById("play");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const saveBtn = document.getElementById("save");
const clockEl = document.getElementById("clock");
const titleEl = document.querySelector(".player__title");
const artistEl = document.querySelector(".player__artist");

const tracks = [
  { title: "Rain on the Library Window", artist: "Mossy Window & the Quiet Hours", seconds: 252 },
  { title: "Late Shift at the Reading Room", artist: "Paper Lantern Trio", seconds: 228 },
  { title: "Chalk Dust and Streetlights", artist: "Mossy Window & the Quiet Hours", seconds: 265 }
];

let index = 0;
let position = 161;
let playing = true;

function fmt(total) {
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return String(mins).padStart(2, "0") + ":" + String(secs).padStart(2, "0");
}

function render() {
  clockEl.textContent = fmt(position);
}

window.setInterval(function () {
  if (!playing) {
    return;
  }
  position += 1;
  if (position > tracks[index].seconds) {
    position = 0;
  }
  render();
}, 1000);

playBtn.addEventListener("click", function () {
  playing = !playing;
  player.classList.toggle("is-paused", !playing);
  playBtn.setAttribute("aria-pressed", String(playing));
  playBtn.setAttribute("aria-label", playing ? "Pause the session" : "Resume the session");
});

function goTrack(step) {
  index = (index + step + tracks.length) % tracks.length;
  titleEl.textContent = tracks[index].title;
  artistEl.textContent = tracks[index].artist;
  position = 0;
  render();
}

prevBtn.addEventListener("click", function () {
  goTrack(-1);
});

nextBtn.addEventListener("click", function () {
  goTrack(1);
});

saveBtn.addEventListener("click", function () {
  const saved = saveBtn.getAttribute("aria-pressed") !== "true";
  saveBtn.setAttribute("aria-pressed", String(saved));
  saveBtn.setAttribute("aria-label", saved ? "Remove this track from the shelf" : "Save this track to the shelf");
});
