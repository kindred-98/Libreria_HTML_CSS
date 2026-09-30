const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const card = document.getElementById("bsk");
const tipOut = document.getElementById("bskTip");
const tipValue = document.getElementById("bskTipValue");
const tipSub = document.getElementById("bskTipSub");
const jarFill = document.getElementById("bskJarFill");
const lyricOut = document.getElementById("bskLyric");
const timeOut = document.getElementById("bskTime");
const listenersOut = document.getElementById("bskListeners");
const reactRow = document.getElementById("bskReactRow");
const reactEmpty = document.getElementById("bskReactEmpty");
const reactCount = document.getElementById("bskReactCount");
const burst = document.getElementById("bskBurst");
const oneBtn = document.getElementById("bskOne");
const fiveBtn = document.getElementById("bskFive");

const LYRICS = [
  "Lantern on the canal, counting down the night",
  "Copper on the tiles, then the rain lets go",
  "Two chords and a coin in an open tin can",
  "Everyone walks slower when the singing starts",
  "Last bus goes empty, we keep the tune alive"
];

const REACTIONS = [
  { text: "clapped", tone: "" },
  { text: "bravo", tone: "bsk__chip--gold" },
  { text: "coin sent", tone: "bsk__chip--gold" },
  { text: "play again", tone: "" },
  { text: "on my street", tone: "bsk__chip--coral" },
  { text: "recorded it", tone: "" }
];

let tip = 4.2;
let tipped = 3;
let listeners = 184;
let lyricIndex = 0;
let reactTotal = 0;
let chips = [];
let fill = 0.62;
let seconds = 107;

function paintTip(next, burstIt) {
  const from = tip;
  tip = next;
  if (reduce) {
    tipOut.textContent = tip.toFixed(2);
    return;
  }
  const began = Date.now();
  const span = 620;
  function frame() {
    const t = Math.min(1, (Date.now() - began) / span);
    const spring = 1 + 2.1 * Math.pow(1 - t, 3) * Math.sin(t * Math.PI * 2.6);
    const eased = from + (tip - from) * (t < 0.5 ? spring * 0.5 : 1 - (1 - t) * (1 - t) * (1 - t) * 0.02);
    tipOut.textContent = eased.toFixed(2);
    if (t < 1) {
      window.setTimeout(frame, 22);
    } else {
      tipOut.textContent = tip.toFixed(2);
    }
  }
  frame();
  if (burstIt) {
    tipValue.classList.remove("is-bump");
    void tipValue.offsetWidth;
    tipValue.classList.add("is-bump");
    window.setTimeout(function () {
      tipValue.classList.remove("is-bump");
    }, 460);
  }
}

function riseJar(to) {
  const clamped = Math.min(0.95, to);
  jarFill.style.setProperty("--from", String(fill));
  jarFill.style.setProperty("--fill", String(clamped));
  fill = clamped;
  jarFill.classList.remove("is-rise");
  void jarFill.offsetWidth;
  jarFill.classList.add("is-rise");
  window.setTimeout(function () {
    jarFill.classList.remove("is-rise");
  }, 660);
}

function addTip(amount) {
  tipped += 1;
  paintTip(tip + amount, true);
  riseJar(fill + 0.055);
  tipSub.textContent = tipped + (tipped === 1 ? " listener tipped" : " listeners tipped");
}

function popReaction() {
  const pick = REACTIONS[Math.floor(Math.random() * REACTIONS.length)];
  const chip = document.createElement("span");
  chip.className = "bsk__chip" + (pick.tone ? " " + pick.tone : "");
  const strong = document.createElement("b");
  strong.textContent = "+1";
  chip.appendChild(strong);
  chip.appendChild(document.createTextNode(" " + pick.text));
  reactRow.appendChild(chip);
  chips.push(chip);
  reactTotal += 1;
  reactCount.textContent = String(reactTotal);
  reactEmpty.style.display = "none";
  while (chips.length > 6) {
    const old = chips.shift();
    old.parentNode.removeChild(old);
  }
  burst.classList.remove("is-pop");
  void burst.offsetWidth;
  burst.classList.add("is-pop");
  window.setTimeout(function () {
    burst.classList.remove("is-pop");
  }, 660);
}

function nextLyric() {
  lyricIndex = (lyricIndex + 1) % LYRICS.length;
  lyricOut.textContent = LYRICS[lyricIndex];
  if (reduce) {
    return;
  }
  lyricOut.classList.remove("is-turning");
  void lyricOut.offsetWidth;
  lyricOut.classList.add("is-turning");
  window.setTimeout(function () {
    lyricOut.classList.remove("is-turning");
  }, 460);
}

oneBtn.addEventListener("click", function () {
  addTip(1);
});

fiveBtn.addEventListener("click", function () {
  addTip(5);
});

if (reduce) {
  tipOut.textContent = tip.toFixed(2);
  tipSub.textContent = tipped + " listeners tipped";
} else {
  window.setTimeout(function () {
    window.setInterval(function () {
      nextLyric();
    }, 2400);
  }, 1500);

  window.setTimeout(function () {
    window.setInterval(function () {
      popReaction();
    }, 1450);
  }, 900);

  window.setTimeout(function () {
    window.setInterval(function () {
      listeners += 1 + Math.floor(Math.random() * 3);
      listenersOut.textContent = String(listeners);
    }, 1200);
  }, 600);

  window.setTimeout(function () {
    window.setInterval(function () {
      const amount = [0.5, 1, 2][Math.floor(Math.random() * 3)];
      addTip(amount);
    }, 3400);
  }, 2600);

  window.setTimeout(function () {
    window.setInterval(function () {
      seconds += 1;
      if (seconds > 191) {
        seconds = 1;
      }
      const mm = Math.floor(seconds / 60);
      const ss = seconds % 60;
      timeOut.textContent = (mm < 10 ? "0" : "") + mm + ":" + (ss < 10 ? "0" : "") + ss;
    }, 1000);
  }, 900);
}

window.setTimeout(function () {
  card.classList.add("is-settled");
}, 780);