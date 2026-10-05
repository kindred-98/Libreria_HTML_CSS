const card = document.getElementById("sna");
const statusNode = document.getElementById("snStatus");
const uptime = document.getElementById("snUp");
const extendBtn = document.getElementById("snExtend");
const revokeBtn = document.getElementById("snRevoke");

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const LOG = [
  { t: "21:12", x: "Mesh handshake renewed \u00b7 tower N4", s: "granted", k: "ok" },
  { t: "21:16", x: "Roving handed to the west sector", s: "moved", k: "warn" },
  { t: "21:23", x: "Packet burst 1 240 pkts in 4 s", s: "ok", k: "ok" },
  { t: "21:31", x: "Anomaly probe from unregistered node", s: "flagged", k: "bad" }
];

function count(node, target, dec, step, duration) {
  const stepTime = step;
  let spent = 0;
  function frame() {
    spent += stepTime;
    const t = Math.min(1, spent / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    node.textContent = (target * eased).toFixed(dec || 0);
    if (t < 1) {
      setTimeout(frame, stepTime);
    } else {
      node.textContent = target.toFixed(dec || 0);
    }
  }
  frame();
}

let minutes = Number(uptime.dataset.count) || 402;

function startCounters() {
  Array.prototype.forEach.call(document.querySelectorAll("[data-count]"), function (node) {
    if (node.id === "snUp") {
      return;
    }
    const target = Number(node.dataset.count) || 0;
    const dec = Number(node.dataset.dec) || 0;
    if (reduce) {
      node.textContent = target.toFixed(dec);
    } else {
      count(node, target, dec, 24, 780);
    }
  });

  if (!reduce) {
    const step = Math.max(16, Math.round(860 / 30));
    let spent = 0;
    function frame() {
      spent += step;
      const t = Math.min(1, spent / 860);
      const eased = 1 - Math.pow(1 - t, 3);
      uptime.textContent = String(Math.round(minutes * eased));
      if (t < 1) {
        setTimeout(frame, step);
      } else {
        uptime.textContent = String(minutes);
        setTimeout(tick, 2400);
      }
    }
    frame();
  }
}

function tick() {
  minutes += 1;
  uptime.textContent = String(minutes);
  setTimeout(tick, 2400);
}

let cursor = 0;

function stampLog() {
  const data = LOG[cursor % LOG.length];
  cursor += 1;
  const li = document.createElement("li");
  li.className = "entry is-new";

  const time = document.createElement("time");
  time.textContent = data.t;

  const text = document.createElement("span");
  text.className = "entry__x";
  text.textContent = data.x;

  const badge = document.createElement("span");
  badge.className = "entry__s entry__s--" + data.k;
  badge.textContent = data.s;

  li.appendChild(time);
  li.appendChild(text);
  li.appendChild(badge);

  const list = document.querySelector(".log__list");
  list.insertBefore(li, list.firstChild);
  while (list.children.length > 4) {
    list.lastChild.remove();
  }

  setTimeout(stampLog, 4600);
}

extendBtn.addEventListener("click", function () {
  const on = extendBtn.getAttribute("aria-pressed") === "true";
  extendBtn.setAttribute("aria-pressed", on ? "false" : "true");
  extendBtn.textContent = on ? "Extend" : "Extended 30 min";
  if (!on) {
    minutes += 30;
    uptime.textContent = String(minutes);
  }
});

revokeBtn.addEventListener("click", function () {
  const on = revokeBtn.getAttribute("aria-pressed") === "true";
  revokeBtn.setAttribute("aria-pressed", on ? "false" : "true");
  revokeBtn.textContent = on ? "Revoke" : "Revoked";
  card.classList.toggle("is-off", !on);
  statusNode.textContent = on ? "Online" : "Revoked";
  statusNode.dataset.text = statusNode.textContent;
});

startCounters();
if (!reduce) {
  setTimeout(stampLog, 2600);
}
