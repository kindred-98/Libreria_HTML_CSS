const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const RANGES = {
  "30": {
    burn: 182400,
    cap: "Daily net burn · last 30 days",
    line: "M0 34L20 30 40 42 60 38 80 50 100 46 120 58 140 54 160 66 180 62 200 72 220 68 240 78 260 74 280 84 300 80 320 88",
    head: [320, 88]
  },
  "90": {
    burn: 171900,
    cap: "Daily net burn · last 90 days",
    line: "M0 72L20 63 40 68 60 53 80 58 100 45 120 50 140 61 160 52 180 65 200 71 220 66 240 79 260 74 280 87 300 82 320 91",
    head: [320, 91]
  }
};

function formatValue(node, value) {
  const kind = node.dataset.format || "plain";
  if (kind === "money") {
    return "$" + Math.round(value).toLocaleString("en-US");
  }
  if (kind === "k") {
    return Math.round(value) + "k";
  }
  if (kind === "one") {
    return value.toFixed(1);
  }
  if (kind === "pct") {
    return String(Math.round(value));
  }
  return String(Math.round(value));
}

function runCounter(node, to) {
  const target = typeof to === "number" ? to : Number(node.dataset.count) || 0;
  const duration = 640;
  const start = performance.now();

  function step() {
    const t = Math.min(1, (performance.now() - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    node.textContent = formatValue(node, target * eased);
    if (t < 1) {
      setTimeout(step, 22);
    } else {
      node.textContent = formatValue(node, target);
    }
  }

  step();
}

const counters = Array.from(document.querySelectorAll("[data-count]"));
counters.forEach(function (node) {
  if (reduce) {
    node.textContent = formatValue(node, Number(node.dataset.count) || 0);
  } else {
    runCounter(node);
  }
});

const burnValue = document.getElementById("burnValue");
const burnChip = document.getElementById("burnChip");
const cap = document.getElementById("brnCap");
const lineShape = document.getElementById("brnLineShape");
const areaShape = document.getElementById("brnAreaShape");
const head = document.getElementById("brnHead");
const segs = Array.from(document.querySelectorAll(".burn__seg-btn"));

function applyRange(key) {
  const data = RANGES[key];
  if (!data) {
    return;
  }
  cap.textContent = data.cap;
  lineShape.setAttribute("d", data.line);
  areaShape.setAttribute("d", data.line + "L320 108 0 108Z");
  head.setAttribute("cx", data.head[0]);
  head.setAttribute("cy", data.head[1]);

  if (reduce) {
    burnValue.textContent = formatValue(burnValue, data.burn);
    return;
  }

  runCounter(burnValue, data.burn);
  const label = burnChip.querySelector("span");
  label.textContent = key === "30" ? "9.4% under plan" : "4.1% under plan";
  burnChip.classList.toggle("chip--good", true);

  lineShape.classList.remove("is-drawn");
  areaShape.classList.remove("is-drawn");
  lineShape.getBoundingClientRect();
  lineShape.classList.add("is-drawn");
  areaShape.classList.add("is-drawn");
}

segs.forEach(function (btn) {
  btn.addEventListener("click", function () {
    segs.forEach(function (other) {
      const on = other === btn;
      other.classList.toggle("is-on", on);
      other.setAttribute("aria-pressed", on ? "true" : "false");
    });
    applyRange(btn.dataset.range);
  });
});

const exportBtn = document.getElementById("brnExport");
let exported = false;

exportBtn.addEventListener("click", function () {
  exported = !exported;
  exportBtn.classList.toggle("is-done", exported);
  exportBtn.setAttribute("aria-pressed", exported ? "true" : "false");
  exportBtn.lastChild.textContent = exported ? " Pack queued" : " Export board pack";
});
