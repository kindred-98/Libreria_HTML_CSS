const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const COLORS = ["#2f9e6a", "#3e8fd0", "#c98a12", "#e2560f", "#d8302c"];
const WORDS = ["Low", "Moderate", "Considerable", "High", "Very high"];
const TRENDS = [
  "Stable since the last cold front",
  "Isolated pockets on lee aspects only",
  "Human triggered slides likely in wind zones",
  "Rising with the warming, natural release possible",
  "Widespread instability, avoid all steep terrain"
];
const TEXT = [
  "Low danger. Wide range of snow types, wind loading on the high crests only. Good conditions for a normal day out with sensible spacing.",
  "Moderate danger. Isolated wind slabs on north and east aspects above 2 500 m. Natural release unlikely, human triggered slides possible in the lee gullies.",
  "Considerable danger. Wind slabs on north and east aspects above 2 300 m, plus a wet surface layer on sunny faces below 2 400 m. Off-piste routes need care.",
  "Considerable to high avalanche danger on north and east aspects above 2 400 m. Wind loading on the ridge crests since the last storm. Warming is producing a wet slab on southern faces below 2 600 m.",
  "Very high avalanche danger. Widespread natural release on most steep terrain, including wind loaded and sun exposed aspects. Stay on marked pistes and obey closures."
];

const card = document.querySelector(".ava");
const fill = document.getElementById("avaFill");
const num = document.getElementById("avaNum");
const word = document.getElementById("avaWord");
const trend = document.getElementById("avaTrend");
const body = document.getElementById("avaText");
const levels = Array.from(document.querySelectorAll(".ava__lvl"));

function apply(level, shake) {
  const idx = Math.min(5, Math.max(1, level)) - 1;
  levels.forEach(function (btn, i) {
    const on = i === idx;
    btn.classList.toggle("is-on", on);
    btn.setAttribute("aria-pressed", on ? "true" : "false");
  });
  if (fill) {
    fill.style.transform = "scaleX(" + (idx + 1) / 5 + ")";
  }
  if (num) {
    num.textContent = String(idx + 1);
    num.style.color = COLORS[idx];
  }
  if (word) {
    word.textContent = WORDS[idx];
  }
  if (trend) {
    trend.textContent = TRENDS[idx];
  }
  if (body) {
    body.textContent = TEXT[idx];
  }
  if (card) {
    card.classList.toggle("is-danger", idx >= 3);
  }
  if (shake && card && !reduce) {
    card.classList.remove("is-shaking");
    void card.offsetWidth;
    card.classList.add("is-shaking");
    window.setTimeout(function () {
      card.classList.remove("is-shaking");
    }, 560);
  }
}

levels.forEach(function (btn) {
  btn.addEventListener("click", function () {
    apply(Number(btn.dataset.lvl) || 1, true);
  });
});

const items = Array.from(document.querySelectorAll(".check__item"));
const count = document.getElementById("avaCount");

function refreshCount() {
  const done = items.filter(function (item) {
    return item.classList.contains("is-on");
  }).length;
  if (count) {
    count.textContent = done + " / " + items.length + " done";
  }
}

items.forEach(function (item) {
  item.addEventListener("click", function () {
    const on = !item.classList.contains("is-on");
    item.classList.toggle("is-on", on);
    item.setAttribute("aria-pressed", on ? "true" : "false");
    refreshCount();
  });
});

const ack = document.getElementById("avaAck");
const ackText = ack ? ack.querySelector(".ava__ackText") : null;

if (ack && ackText) {
  let read = false;
  ack.addEventListener("click", function () {
    read = !read;
    ack.classList.toggle("is-done", read);
    ack.setAttribute("aria-pressed", read ? "true" : "false");
    ackText.textContent = read ? "Briefing signed" : "Briefing read";
  });
}

apply(4, false);
refreshCount();
