const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const rows = Array.from(document.querySelectorAll(".axis__btn"));
const feature = document.getElementById("plsFeature");
const featureTitle = document.getElementById("plsFeatureTitle");
const rowListeners = document.getElementById("plsRowListeners");

function spaced(value) {
  return String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function bump(node, cls) {
  if (!node || reduce) {
    return;
  }
  node.classList.remove(cls);
  node.getBoundingClientRect();
  node.classList.add(cls);
}

rows.forEach(function (btn) {
  btn.addEventListener("click", function () {
    rows.forEach(function (other) {
      const on = other === btn;
      other.classList.toggle("is-on", on);
      other.setAttribute("aria-pressed", on ? "true" : "false");
    });
    const ep = btn.dataset.ep;
    const listeners = Number(btn.dataset.listeners) || 0;
    const delta = Number(btn.dataset.delta) || 0;
    const titleNode = btn.querySelector(".axis__title");
    if (feature) {
      feature.textContent = "Ep " + ep;
      bump(feature, "is-jump");
    }
    if (featureTitle && titleNode) {
      featureTitle.textContent = titleNode.textContent;
      bump(featureTitle, "is-jump");
    }
    if (rowListeners) {
      rowListeners.textContent = spaced(listeners) + " listeners";
    }
    const deltaNode = btn.querySelector(".axis__delta");
    if (deltaNode && !reduce) {
      deltaNode.textContent = (delta >= 0 ? "+" : "") + delta.toFixed(1) + "%";
    }
    const deltaPill = document.querySelector(".stat:nth-child(1) .stat__delta");
    if (deltaPill) {
      deltaPill.textContent = (delta >= 0 ? "+" : "") + delta.toFixed(1) + "% vs S5";
      bump(deltaPill, "is-jump");
    }
  });
});

const listeners = document.getElementById("plsListeners");
const avg = document.getElementById("plsAvg");
const complete = document.getElementById("plsComplete");

if (!reduce) {
  let base = 412800;
  let step = 0;
  window.setInterval(function () {
    step += 1;
    if (step % 2 === 0) {
      base += 120 + Math.floor(Math.random() * 260);
    } else {
      base -= 40 + Math.floor(Math.random() * 90);
    }
    if (base < 400000) {
      base = 400000;
    }
    if (listeners) {
      listeners.textContent = spaced(base);
      bump(listeners, "is-jump");
    }
    if (avg) {
      avg.textContent = spaced(base / 6.6);
    }
    if (complete && step % 3 === 0) {
      complete.textContent = String(76 + (step % 6));
    }
  }, 2400);
}

const exportBtn = document.getElementById("plsExport");
const exportText = exportBtn ? exportBtn.querySelector(".pls__exportText") : null;

if (exportBtn && exportText) {
  let done = false;
  exportBtn.addEventListener("click", function () {
    done = !done;
    exportBtn.classList.toggle("is-done", done);
    exportBtn.setAttribute("aria-pressed", done ? "true" : "false");
    exportText.textContent = done ? "CSV queued" : "Export CSV";
  });
}
