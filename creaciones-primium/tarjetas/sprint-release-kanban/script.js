const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const board = document.getElementById("bento");
const grid = board.querySelector(".grid");
const countOut = document.getElementById("bnCount");
const flipBtn = document.getElementById("bnFlip");
const densityBtn = document.getElementById("bnDensity");
const lanes = Array.from(board.querySelectorAll(".block--lane"));
const dropZones = Array.from(board.querySelectorAll("[data-drop]"));

const SEED = [
  { lane: "build", tag: "ENG", title: "Split ledger exporter", owner: "Rui", size: "M", age: "3d" },
  { lane: "build", tag: "ENG", title: "Rate limit middleware", owner: "Nadia", size: "S", age: "1d" },
  { lane: "build", tag: "OPS", title: "Nightly index rebuild", owner: "Theo", size: "L", age: "5d" },
  { lane: "review", tag: "DES", title: "Empty states pass", owner: "Ines", size: "M", age: "2d" },
  { lane: "review", tag: "ENG", title: "Webhook retry logic", owner: "Rui", size: "S", age: "4d" },
  { lane: "ship", tag: "ENG", title: "Invoice PDF templates", owner: "Nadia", size: "L", age: "6d" },
  { lane: "ship", tag: "QA", title: "Migration dry run", owner: "Kojo", size: "S", age: "2d" },
  { lane: "ship", tag: "DES", title: "Onboarding illustration", owner: "Ines", size: "M", age: "7d" },
  { lane: "review", tag: "ENG", title: "Session token rotation", owner: "Theo", size: "M", age: "1d" }
];

const LANES = ["build", "review", "ship"];

const state = SEED.map(function (card, index) {
  return {
    uid: "c" + index,
    lane: card.lane,
    tag: card.tag,
    title: card.title,
    owner: card.owner,
    size: card.size,
    age: card.age
  };
});

function buildCard(card) {
  const li = document.createElement("li");
  li.className = "card card--" + card.size.toLowerCase();
  li.dataset.uid = card.uid;
  li.dataset.lane = card.lane;
  li.tabIndex = 0;
  li.setAttribute("role", "listitem");
  li.setAttribute("aria-label", card.title + ", " + card.tag + ", owned by " + card.owner + ", in " + laneName(card.lane) + ". Press M to move to the next lane.");
  li.setAttribute("aria-grabbed", "false");

  const head = document.createElement("p");
  head.className = "card__head";
  const tag = document.createElement("span");
  tag.className = "card__tag";
  tag.textContent = card.tag;
  const age = document.createElement("span");
  age.className = "card__age";
  age.textContent = card.age;
  head.appendChild(tag);
  head.appendChild(age);

  const title = document.createElement("p");
  title.className = "card__title";
  title.textContent = card.title;

  const foot = document.createElement("div");
  foot.className = "card__foot";
  const owner = document.createElement("span");
  owner.className = "card__owner";
  owner.textContent = card.owner;
  const move = document.createElement("button");
  move.className = "card__move";
  move.type = "button";
  move.dataset.move = card.uid;
  move.setAttribute("aria-label", "Move " + card.title + " to the next lane");
  move.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12h13"></path><path d="M13 7l5 5-5 5"></path></svg>';
  foot.appendChild(owner);
  foot.appendChild(move);

  li.appendChild(head);
  li.appendChild(title);
  li.appendChild(foot);
  return li;
}

function laneName(lane) {
  if (lane === "build") {
    return "in build";
  }
  if (lane === "review") {
    return "in review";
  }
  return "shipped";
}

function laneCount(lane) {
  return state.filter(function (card) {
    return card.lane === lane;
  }).length;
}

function paintCounts() {
  lanes.forEach(function (section) {
    const out = section.querySelector(".lane__count span");
    if (out) {
      out.textContent = String(laneCount(section.dataset.lane));
    }
  });
  countOut.textContent = String(state.length);
}

function paint() {
  dropZones.forEach(function (zone) {
    const lane = zone.dataset.drop;
    state
      .filter(function (card) {
        return card.lane === lane;
      })
      .forEach(function (card) {
        zone.appendChild(buildCard(card));
      });
  });
  paintCounts();
}

function rectOf(node) {
  const box = node.getBoundingClientRect();
  return { x: box.left, y: box.top, w: box.width, h: box.height };
}

function flipMove(nodes, commit) {
  const before = new Map();
  nodes.forEach(function (node) {
    before.set(node, rectOf(node));
  });

  commit();

  nodes.forEach(function (node) {
    if (!node.isConnected) {
      return;
    }
    const first = before.get(node);
    const last = rectOf(node);
    const dx = first.x - last.x;
    const dy = first.y - last.y;
    const sx = first.w / Math.max(1, last.w);
    const sy = first.h / Math.max(1, last.h);
    if (Math.abs(dx) < 0.6 && Math.abs(dy) < 0.6 && Math.abs(sx - 1) < 0.02 && Math.abs(sy - 1) < 0.02) {
      return;
    }
    node.style.transition = "none";
    node.style.transformOrigin = "top left";
    node.style.transform = "translate(" + dx.toFixed(1) + "px," + dy.toFixed(1) + "px) scale(" + sx.toFixed(3) + "," + sy.toFixed(3) + ")";
    node.style.opacity = "0.45";
  });

  if (reduce) {
    nodes.forEach(function (node) {
      node.style.transition = "";
      node.style.transform = "";
      node.style.opacity = "";
    });
    return;
  }

  const fresh = nodes.filter(function (node) {
    return node.isConnected && node.style.transform !== "";
  });

  setTimeout(function () {
    fresh.forEach(function (node, index) {
      node.style.transition = "transform 0.52s cubic-bezier(0.22, 1, 0.28, 1) " + index * 0.045 + "s, opacity 0.32s ease " + index * 0.045 + "s";
      node.style.transform = "";
      node.style.opacity = "";
    });
    setTimeout(function () {
      fresh.forEach(function (node) {
        node.style.transition = "";
        node.style.transformOrigin = "";
      });
    }, 900);
  }, 40);
}

function relabel(card, node) {
  node.setAttribute("aria-label", card.title + ", " + card.tag + ", owned by " + card.owner + ", in " + laneName(card.lane) + ". Press M to move to the next lane.");
}

function moveCard(uid) {
  const card = state.find(function (item) {
    return item.uid === uid;
  });
  const node = board.querySelector('.card[data-uid="' + uid + '"]');
  if (!card || !node) {
    return;
  }
  const next = LANES[(LANES.indexOf(card.lane) + 1) % LANES.length];
  const target = dropZones.find(function (zone) {
    return zone.dataset.drop === next;
  });

  flipMove(Array.from(board.querySelectorAll(".card")), function () {
    card.lane = next;
    node.dataset.lane = next;
    relabel(card, node);
    target.appendChild(node);
    paintCounts();
  });

  node.classList.add("is-hopped");
  setTimeout(function () {
    node.classList.remove("is-hopped");
  }, 720);
}

paint();

board.addEventListener("click", function (event) {
  const btn = event.target.closest("[data-move]");
  if (btn) {
    moveCard(btn.dataset.move);
  }
});

board.addEventListener("keydown", function (event) {
  if (event.key !== "m" && event.key !== "M") {
    return;
  }
  const node = event.target.closest(".card");
  if (!node) {
    return;
  }
  event.preventDefault();
  moveCard(node.dataset.uid);
});

const hero = board.querySelector(".block--hero");
const risk = board.querySelector(".block--risk");
const laneOrder = [
  lanes[0],
  lanes[1],
  lanes[2]
];
let grouped = false;

function orderNodes() {
  if (!grouped) {
    return [hero].concat(laneOrder, [risk]);
  }
  return [hero].concat([laneOrder[2], laneOrder[0], laneOrder[1]], [risk]);
}

function applyOrder() {
  const order = orderNodes();
  flipMove(order, function () {
    order.forEach(function (node) {
      grid.appendChild(node);
    });
  });
}

flipBtn.addEventListener("click", function () {
  grouped = !grouped;
  flipBtn.setAttribute("aria-pressed", grouped ? "true" : "false");
  applyOrder();
});

densityBtn.addEventListener("click", function () {
  const compact = board.classList.toggle("is-compact");
  densityBtn.setAttribute("aria-pressed", compact ? "true" : "false");
});

document.getElementById("bnLink").addEventListener("click", function () {
  const target = document.getElementById("bn-move-hint");
  target.classList.add("is-lit");
  setTimeout(function () {
    target.classList.remove("is-lit");
  }, 1600);
});

const counters = Array.from(board.querySelectorAll("[data-count]"));
counters.forEach(function (node) {
  if (reduce) {
    node.textContent = node.dataset.count;
    return;
  }
  const target = Number(node.dataset.count) || 0;
  const duration = 620;
  const start = performance.now();
  const holder = node;
  function step() {
    const t = Math.min(1, (performance.now() - start) / duration);
    holder.textContent = String(Math.round((1 - Math.pow(1 - t, 3)) * target));
    if (t < 1) {
      setTimeout(step, 22);
    } else {
      holder.textContent = node.dataset.count;
    }
  }
  step();
});
