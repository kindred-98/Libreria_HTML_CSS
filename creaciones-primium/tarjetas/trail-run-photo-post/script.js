const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const TINTS = ["#ff8a3d", "#ffc65c", "#7fd4e8", "#e0563c"];
const reacts = Array.from(document.querySelectorAll(".react"));
const burst = document.getElementById("trpBurst");

function compact(value) {
  if (value >= 1000) {
    return (value / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  }
  return String(value);
}

function spawnBurst(anchor) {
  if (!burst || reduce) {
    return;
  }
  const box = burst.getBoundingClientRect();
  const source = anchor.getBoundingClientRect();
  const cx = source.left - box.left + source.width / 2;
  const cy = source.top - box.top + source.height / 2;
  for (let k = 0; k < 10; k += 1) {
    const dot = document.createElement("span");
    const angle = (Math.PI * 2 * k) / 10 - Math.PI / 2;
    const reach = 26 + (k % 4) * 9;
    dot.style.setProperty("--dx", (Math.cos(angle) * reach).toFixed(1) + "px");
    dot.style.setProperty("--dy", (Math.sin(angle) * reach - 8).toFixed(1) + "px");
    dot.style.background = TINTS[k % TINTS.length];
    dot.style.left = cx + "px";
    dot.style.top = cy + "px";
    burst.appendChild(dot);
    window.setTimeout(function () {
      dot.remove();
    }, 720);
  }
}

reacts.forEach(function (btn) {
  const num = btn.querySelector(".react__num");
  const base = Number(btn.dataset.count) || 0;
  let value = base;
  let on = false;

  btn.addEventListener("click", function () {
    on = !on;
    value = on ? base + 1 : base;
    btn.classList.toggle("is-on", on);
    btn.classList.remove("is-bump");
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    btn.setAttribute("aria-label", btn.getAttribute("aria-label").replace(/\d[\d.,k ]*/, compact(value) + " "));
    void btn.offsetWidth;
    btn.classList.add("is-bump");
    if (num) {
      num.textContent = compact(value);
    }
    if (on) {
      spawnBurst(btn);
    }
  });
});

const activity = document.getElementById("trpActivity");
if (activity) {
  const LABEL = activity.textContent.replace(/\d+/, "");
  let climbs = 128;
  if (reduce) {
    activity.textContent = climbs + LABEL;
  } else {
    window.setInterval(function () {
      climbs += 1 + Math.floor(Math.random() * 3);
      activity.textContent = climbs + LABEL;
    }, 2100);
  }
}

const share = document.getElementById("trpShare");
const shareText = share ? share.querySelector(".trp__shareText") : null;

if (share && shareText) {
  let shared = false;
  share.addEventListener("click", function () {
    shared = !shared;
    share.classList.toggle("is-done", shared);
    share.setAttribute("aria-pressed", shared ? "true" : "false");
    shareText.textContent = shared ? "Route sent" : "Share route";
  });
}
