const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const card = document.getElementById("oped");
const checks = Array.from(document.querySelectorAll(".check__btn"));
const doneOut = document.getElementById("checksDone");
const crumpleBtn = document.getElementById("crumple");
const stampBtn = document.getElementById("stampBtn");
const stamp = document.getElementById("stamp");
const counts = Array.from(document.querySelectorAll("[data-count]"));

function tally() {
  let done = 0;
  checks.forEach(function (btn) {
    if (btn.dataset.state === "done") {
      done += 1;
    }
  });
  doneOut.textContent = done + " of " + checks.length + " cleared";
}

checks.forEach(function (btn) {
  btn.addEventListener("click", function () {
    const done = btn.dataset.state === "done";
    btn.dataset.state = done ? "open" : "done";
    btn.setAttribute("aria-pressed", done ? "false" : "true");
    tally();
  });
});

crumpleBtn.addEventListener("click", function () {
  const on = crumpleBtn.getAttribute("aria-pressed") === "true";
  crumpleBtn.setAttribute("aria-pressed", on ? "false" : "true");
  crumpleBtn.textContent = on ? "Crumple the sheet" : "Smooth the sheet";
  if (reduce) {
    card.classList.toggle("is-crumpled", !on);
    return;
  }
  card.classList.remove("is-crumpled");
  card.getBoundingClientRect();
  if (!on) {
    card.classList.add("is-crumpled");
  }
});

stampBtn.addEventListener("click", function () {
  const on = stampBtn.getAttribute("aria-pressed") === "true";
  stampBtn.setAttribute("aria-pressed", on ? "false" : "true");
  stamp.textContent = on ? "Hold" : "Run it";
  stamp.classList.remove("is-on");
  stamp.getBoundingClientRect();
  if (!on) {
    stamp.classList.add("is-on");
  }
});

function runCount(node) {
  const to = Number(node.dataset.count) || 0;
  if (reduce) {
    node.textContent = String(to);
    return;
  }
  const began = Date.now();
  const span = 760;
  function step() {
    const t = Math.min(1, (Date.now() - began) / span);
    node.textContent = String(Math.round(to * (1 - Math.pow(1 - t, 3))));
    if (t < 1) {
      window.setTimeout(step, 24);
    } else {
      node.textContent = String(to);
    }
  }
  step();
}

const sheetLamp = document.getElementById("sheetLamp");

function driftLamp() {
  if (reduce) {
    return;
  }
  const t = Date.now() / 5200;
  const value = Math.sin(t) * 34;
  sheetLamp.style.setProperty("--lx", value.toFixed(1) + "%");
  window.setTimeout(driftLamp, 40);
}

counts.forEach(n => runCount(n));
tally();
driftLamp();

window.setTimeout(function () {
  card.classList.add("is-settled");
}, 780);
