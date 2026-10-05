const card = document.getElementById("pnt");
const list = document.getElementById("pntList");
const counter = document.getElementById("pntCount");
const fill = document.getElementById("pntAxisFill");
const cursor = document.getElementById("pntHead");
const steps = Array.prototype.slice.call(document.querySelectorAll(".step"));
const muteBtn = document.getElementById("pntMute");
const flushBtn = document.getElementById("pntFlush");

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const NODES = [
  { at: 0.03125, name: "Ingest" },
  { at: 0.34375, name: "Build" },
  { at: 0.65625, name: "Staging" },
  { at: 0.96875, name: "Prod" }
];

const QUEUE = [
  { stage: "Deploy", time: "09:16:44", msg: "Edge bundle 21a7f30 promoted to 3 regions", state: "live", kind: "ok" },
  { stage: "Queue", time: "09:15:52", msg: "Retry 2 of 3 for ledger-events consumer", state: "retry", kind: "warn" },
  { stage: "Cache", time: "09:14:37", msg: "Purged 1 248 stale keys on shard 04", state: "done", kind: "ok" },
  { stage: "Auth", time: "09:13:09", msg: "Service token rotation approved by 2 of 2", state: "held", kind: "bad" },
  { stage: "Build", time: "09:11:55", msg: "Pipeline 4417 finished in 3 min 41 s", state: "done", kind: "ok" },
  { stage: "Schema", time: "09:10:28", msg: "Migration 0084 backfill running at 18k rows/s", state: "live", kind: "ok" }
];

let step = 2;
let index = 0;
let total = 5;

function paintStep() {
  steps.forEach(function (node, i) {
    node.classList.toggle("is-past", i < step);
    node.classList.toggle("is-now", i === step);
  });
  const node = fill;
  if (node) {
    node.style.transform = "scaleX(" + NODES[step].at + ")";
  }
  cursor.style.setProperty("--p", NODES[step].at);
}

function dropNotice() {
  const data = QUEUE[index % QUEUE.length];
  index += 1;
  const li = document.createElement("li");
  li.className = "feed is-new";

  const dot = document.createElement("span");
  dot.className = "feed__dot";
  dot.setAttribute("aria-hidden", "true");

  const body = document.createElement("span");
  body.className = "feed__body";

  const head = document.createElement("p");
  head.className = "feed__head";

  const stage = document.createElement("b");
  stage.className = "feed__stage";
  stage.textContent = data.stage;

  const stamp = document.createElement("time");
  stamp.textContent = data.time;

  const msg = document.createElement("p");
  msg.className = "feed__msg";
  msg.textContent = data.msg;

  const state = document.createElement("span");
  state.className = "feed__state feed__state--" + data.kind;
  state.textContent = data.state;

  head.appendChild(stage);
  head.appendChild(stamp);
  body.appendChild(head);
  body.appendChild(msg);
  li.appendChild(dot);
  li.appendChild(body);
  li.appendChild(state);

  list.insertBefore(li, list.firstChild);
  while (list.children.length > 5) {
    list.lastChild.remove();
  }

  total += 1;
  counter.textContent = String(total);

  setTimeout(function () {
    step = (step + 1) % NODES.length;
    paintStep();
  }, 1100);

  setTimeout(dropNotice, 4600);
}

Array.prototype.forEach.call(document.querySelectorAll("[data-count]"), function (node) {
  const target = Number(node.dataset.count) || 0;
  const dec = Number(node.dataset.dec) || 0;
  if (reduce) {
    node.textContent = target.toFixed(dec);
    return;
  }
  const stepTime = 24;
  let spent = 0;
  function frame() {
    spent += stepTime;
    const t = Math.min(1, spent / 780);
    const eased = 1 - Math.pow(1 - t, 3);
    node.textContent = (target * eased).toFixed(dec);
    if (t < 1) {
      setTimeout(frame, stepTime);
    } else {
      node.textContent = target.toFixed(dec);
    }
  }
  frame();
});

muteBtn.addEventListener("click", function () {
  const on = muteBtn.getAttribute("aria-pressed") === "true";
  muteBtn.setAttribute("aria-pressed", on ? "false" : "true");
  muteBtn.textContent = on ? "Mute" : "Muted";
  card.classList.toggle("is-muted", !on);
});

flushBtn.addEventListener("click", function () {
  step = 0;
  paintStep();
  flushBtn.textContent = "Queue flushed";
  setTimeout(function () {
    flushBtn.textContent = "Flush queue";
  }, 1600);
});

if (!reduce) {
  setTimeout(dropNotice, 3100);
}
