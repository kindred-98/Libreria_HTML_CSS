const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const board = document.getElementById("board");
const mosaic = document.getElementById("mosaic");
const quests = Array.from(mosaic.querySelectorAll(".quest"));
const filters = Array.from(document.querySelectorAll(".filter"));
const countOut = document.getElementById("count");
const sortBtn = document.getElementById("sortBtn");
const pinBtn = document.getElementById("pinBtn");
const ledgerNote = document.getElementById("ledgerNote");
const counts = Array.from(document.querySelectorAll("[data-count]"));

const NOTES = {
  all: "Board rules: no arson, no debts on the house.",
  l1: "Level 1 postings only. Adventurers under 15 are turned away.",
  l2: "Level 2 postings. Bring a partner and a dry torch.",
  l3: "Level 3 postings. Guild insurance strongly advised.",
  legend: "One legendary posting on the wall. Do not peel the paper."
};

const state = { level: "all", rarity: null, sorted: false, pinned: false };

function shown(quest) {
  const levelOk = state.level === "all" || quest.dataset.level === state.level;
  const rarityOk = !state.rarity || quest.dataset.rarity === state.rarity;
  return levelOk && rarityOk;
}

function refreshCount() {
  const n = quests.filter(shown).length;
  countOut.textContent = n + (n === 1 ? " posting" : " postings");
  countOut.classList.remove("is-fresh");
  void countOut.offsetWidth;
  if (!reduce) {
    countOut.classList.add("is-fresh");
  }
}

function apply(mutate) {
  if (reduce) {
    mutate();
    quests.forEach(function (quest) {
      quest.classList.toggle("is-hidden", !shown(quest));
    });
    refreshCount();
    return;
  }
  const first = new Map();
  quests.forEach(function (quest) {
    first.set(quest, quest.getBoundingClientRect());
  });
  mutate();
  quests.forEach(function (quest) {
    const on = shown(quest);
    quest.classList.toggle("is-hidden", !on);
    if (!on) {
      return;
    }
    const before = first.get(quest);
    const after = quest.getBoundingClientRect();
    const dx = before.left - after.left;
    const dy = before.top - after.top;
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) {
      return;
    }
    quest.style.transition = "none";
    quest.style.transform = "translate3d(" + dx.toFixed(1) + "px," + dy.toFixed(1) + "px,0)";
    void quest.offsetWidth;
    quest.style.transition = "transform 0.56s cubic-bezier(0.16, 1, 0.3, 1)";
    quest.style.transform = "";
    window.setTimeout(function () {
      quest.style.transition = "";
    }, 620);
    quest.classList.remove("is-flip");
    void quest.offsetWidth;
    quest.classList.add("is-flip");
  });
  refreshCount();
}

function order() {
  const visible = quests.filter(shown);
  if (state.sorted) {
    visible.sort(function (a, b) {
      return Number(b.querySelector("[data-count]").dataset.count) -
        Number(a.querySelector("[data-count]").dataset.count);
    });
  } else {
    visible.sort(function (a, b) {
      return quests.indexOf(a) - quests.indexOf(b);
    });
  }
  quests.forEach(function (quest) {
    quest.style.order = shown(quest) ? String(visible.indexOf(quest)) : "9";
  });
}

filters.forEach(function (btn) {
  btn.addEventListener("click", function () {
    if (btn.dataset.rarity) {
      const on = state.rarity === btn.dataset.rarity;
      state.rarity = on ? null : btn.dataset.rarity;
      state.level = "all";
    } else {
      state.level = btn.dataset.level;
      state.rarity = null;
    }
    filters.forEach(function (other) {
      const active = other === btn && (
        other.dataset.rarity
          ? state.rarity === other.dataset.rarity
          : state.level === other.dataset.level
      );
      other.classList.toggle("is-on", active);
      other.setAttribute("aria-pressed", active ? "true" : "false");
    });
    apply(order);
    const key = state.rarity ? "legend" : state.level === "all" ? "all" : "l" + state.level;
    ledgerNote.textContent = NOTES[key];
    ledgerNote.classList.remove("is-fresh");
    void ledgerNote.offsetWidth;
    if (!reduce) {
      ledgerNote.classList.add("is-fresh");
    }
  });
});

sortBtn.addEventListener("click", function () {
  state.sorted = !state.sorted;
  sortBtn.setAttribute("aria-pressed", state.sorted ? "true" : "false");
  apply(order);
  ledgerNote.textContent = state.sorted
    ? "Sorted by reward, largest first."
    : "Back in posting order, oldest on the left.";
  ledgerNote.classList.remove("is-fresh");
  void ledgerNote.offsetWidth;
  if (!reduce) {
    ledgerNote.classList.add("is-fresh");
  }
});

pinBtn.addEventListener("click", function () {
  state.pinned = !state.pinned;
  pinBtn.setAttribute("aria-pressed", state.pinned ? "true" : "false");
  pinBtn.textContent = state.pinned ? "Unpin the legend" : "Pin the legend";
  quests.forEach(function (quest) {
    quest.classList.toggle("is-pinned", state.pinned && quest.dataset.rarity === "legend");
  });
  ledgerNote.textContent = state.pinned
    ? "Legend pinned in the centre of the board."
    : "Legend unpinned. Someone will move it by morning.";
  ledgerNote.classList.remove("is-fresh");
  void ledgerNote.offsetWidth;
  if (!reduce) {
    ledgerNote.classList.add("is-fresh");
  }
});

function runCount(node) {
  const to = Number(node.dataset.count) || 0;
  if (reduce) {
    node.textContent = String(to);
    return;
  }
  const began = Date.now();
  const span = 780;
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

counts.forEach(runCount);
order();
refreshCount();

window.setTimeout(function () {
  board.classList.add("is-settled");
}, 800);
