const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const card = document.getElementById("dknCard");
const shine = document.getElementById("dknShine");
const skill = document.getElementById("dknSkill");
const charge = document.getElementById("dknCharge");

function format(node, value) {
  const kind = node.dataset.format || "plain";
  if (kind === "k") {
    return (value / 1000).toFixed(1) + "k";
  }
  return String(Math.round(value));
}

function runCounter(node, to) {
  const target = typeof to === "number" ? to : Number(node.dataset.count) || 0;
  const duration = 620;
  const start = performance.now();

  function step() {
    const t = Math.min(1, (performance.now() - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    node.textContent = format(node, target * eased);
    if (t < 1) {
      setTimeout(step, 22);
    } else {
      node.textContent = format(node, target);
    }
  }

  step();
}

const counters = Array.from(document.querySelectorAll("[data-count]"));
counters.forEach(function (node) {
  if (reduce) {
    node.textContent = format(node, Number(node.dataset.count) || 0);
  } else {
    runCounter(node);
  }
});

const BURST = [
  "Ashen Charge unleashed",
  "Cinder wall raised",
  "Vault distance 18 m",
  "Stun window refreshed"
];

let fired = false;

function launch() {
  fired = true;
  card.classList.add("is-cast");
  skill.classList.add("is-firing");
  skill.setAttribute("aria-pressed", "true");
  shine.classList.remove("is-sweeping");
  void shine.getBoundingClientRect();
  shine.classList.add("is-sweeping");

  let tick = 0;
  const ticker = setInterval(function () {
    tick = (tick + 1) % BURST.length;
    card.classList.remove("is-cast");
    void card.getBoundingClientRect();
    card.classList.add("is-cast");
    charge.style.width = "100%";
  }, 1800);

  setTimeout(function () {
    clearInterval(ticker);
    charge.style.width = "24%";
  }, 7200);
}

skill.addEventListener("click", function () {
  if (fired) {
    fired = false;
    card.classList.remove("is-cast");
    skill.classList.remove("is-firing");
    skill.setAttribute("aria-pressed", "false");
    shine.classList.remove("is-sweeping");
    charge.style.width = "24%";
    return;
  }
  launch();
});

if (reduce) {
  charge.style.width = "62%";
}
