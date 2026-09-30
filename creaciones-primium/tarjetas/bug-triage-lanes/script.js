const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const lanes = Array.from(document.querySelectorAll(".bug__lane"));
const flight = document.getElementById("bugFlight");
const focusId = document.getElementById("bugFocusId");
const focusTitle = document.getElementById("bugFocusTitle");
const stateTag = document.getElementById("bugState");
const ageOut = document.getElementById("bugAge");
const ageFill = document.getElementById("bugAgeFill");
const sla = document.getElementById("bugSla");
const note = document.getElementById("bugNote");
const backBtn = document.getElementById("bugBack");
const nextBtn = document.getElementById("bugAdvance");

const SLA_HOURS = 6;
const STATE = {
  triage: "New",
  hunt: "Hunting",
  fixing: "Fixing",
  verify: "Verify"
};

let current = document.querySelector('.bug__card[data-id="KIN-4821"]');
let busy = false;

function ageParts(hours) {
  const total = Math.max(0, Math.round(hours * 60));
  const mm = String(total % 60);
  return Math.floor(total / 60) + " h " + (mm.length < 2 ? "0" + mm : mm) + " m";
}

function ageRatio(hours) {
  return Math.max(0.06, Math.min(1, hours / SLA_HOURS));
}

function showAge(hours) {
  ageOut.textContent = ageParts(hours);
  ageFill.style.transform = "scaleX(" + ageRatio(hours).toFixed(3) + ")";
}

function tick(node, to, duration, delay) {
  if (reduce) {
    node.textContent = ageParts(to);
    return;
  }
  window.setTimeout(function () {
    const t0 = performance.now();
    const step = function () {
      const t = Math.min(1, (performance.now() - t0) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      node.textContent = ageParts(to * eased);
      if (t < 1) {
        window.setTimeout(step, 30);
      }
    };
    step();
  }, delay);
}

function laneCounts() {
  lanes.forEach(function (lane) {
    lane.querySelector(".bug__lane-head b").textContent = String(
      lane.querySelectorAll(".bug__card").length
    );
  });
}

function focusOn(card) {
  current = card;
  const lane = card.dataset.lane;
  const age = Number(card.dataset.age);
  const done = card.classList.contains("is-done");
  const owner = card.querySelector(".bug__who").textContent;
  focusId.textContent = card.dataset.id;
  focusTitle.textContent = card.querySelector(".bug__card-title").textContent;
  stateTag.textContent = done ? STATE[lane] + " · closed" : STATE[lane] + " · owner " + owner;
  lanes.forEach(function (l) {
    l.classList.toggle("is-target", l.dataset.lane === lane);
  });
  const over = age > SLA_HOURS;
  sla.classList.toggle("is-clear", !over);
  sla.lastChild.textContent = over ? "SLA 6h · breaches 3" : "SLA 6h · breaches 2";
  note.textContent = card.dataset.id + " sits in " + STATE[lane] + " · age " + ageParts(age);
  backBtn.disabled = lane === "triage";
  nextBtn.disabled = lane === "verify";
  ageFill.style.transform = "scaleX(0.06)";
  if (reduce) {
    showAge(age);
  } else {
    tick(ageOut, age, 620, 0);
    window.setTimeout(function () {
      showAge(age);
    }, 90);
  }
}

function move(dir) {
  if (busy || !current) {
    return;
  }
  const order = lanes.map(function (l) {
    return l.dataset.lane;
  });
  const at = order.indexOf(current.dataset.lane) + dir;
  if (at < 0 || at >= order.length) {
    return;
  }
  const card = current;
  const target = lanes[at];
  busy = true;
  card.classList.add("is-flying");
  if (!reduce) {
    flight.classList.remove("is-run");
    void flight.offsetWidth;
    flight.classList.add("is-run");
  }
  window.setTimeout(function () {
    target.querySelector(".bug__lane-list").appendChild(card);
    card.dataset.lane = target.dataset.lane;
    card.classList.remove("is-flying");
    if (target.dataset.lane === "verify") {
      card.classList.add("is-done");
    }
    laneCounts();
    focusOn(card);
    busy = false;
  }, reduce ? 0 : 340);
}

backBtn.addEventListener("click", function () {
  move(-1);
});

nextBtn.addEventListener("click", function () {
  move(1);
});

laneCounts();
focusOn(current);
