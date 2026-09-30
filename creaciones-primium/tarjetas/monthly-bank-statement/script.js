const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const counters = Array.from(document.querySelectorAll("[data-count]"));

function group(value) {
  const parts = value.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

function runCounter(node) {
  const target = Number(node.dataset.count);
  const decimals = Number(node.dataset.decimals || 0);
  const prefix = node.dataset.prefix || "";
  const duration = 760;
  const start = Date.now();

  function paint(ratio) {
    const value = (target * ratio).toFixed(decimals);
    node.textContent = prefix + group(value);
  }

  function tick() {
    const elapsed = Date.now() - start;
    const progress = Math.min(1, elapsed / duration);
    paint(1 - Math.pow(1 - progress, 3));
    if (progress < 1) {
      window.setTimeout(tick, 26);
    }
  }

  tick();
}

if (!reduceMotion) {
  counters.forEach(runCounter);
}
