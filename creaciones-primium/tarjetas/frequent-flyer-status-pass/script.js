const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const card = document.getElementById("flyCard");
const band = document.getElementById("flyBand");
const meter = document.getElementById("flyMeter");
const wallet = document.getElementById("flyWallet");
const walletTxt = document.getElementById("flyWalletTxt");
const lounge = document.getElementById("flyLounge");
const loungeTxt = document.getElementById("flyLoungeTxt");
const state = document.getElementById("flyState");

function group(node) {
  const n = Math.round(node.dataset.count);
  if (node.dataset.sep) {
    return n.toLocaleString("en-US").replace(/,/g, " ");
  }
  return String(n);
}

function roll(node, duration, delay) {
  const to = Number(node.dataset.count) || 0;
  if (reduce) {
    node.textContent = group(node);
    return;
  }
  window.setTimeout(function () {
    const t0 = performance.now();
    const step = function () {
      const t = Math.min(1, (performance.now() - t0) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      node.dataset.count = String(to * eased);
      node.textContent = group(node);
      if (t < 1) {
        window.setTimeout(step, 26);
      } else {
        node.dataset.count = String(to);
        node.textContent = group(node);
      }
    };
    step();
  }, delay);
}

Array.from(document.querySelectorAll("[data-count]")).forEach(function (node, i) {
  roll(node, 620, 120 + i * 70);
});

if (!reduce) {
  card.addEventListener("pointermove", function (event) {
    const box = card.getBoundingClientRect();
    const px = (event.clientX - box.left) / box.width;
    const py = (event.clientY - box.top) / box.height;
    card.classList.add("is-tilting");
    card.style.setProperty("--ry", ((px - 0.5) * 11).toFixed(2) + "deg");
    card.style.setProperty("--rx", ((0.5 - py) * 9).toFixed(2) + "deg");
    card.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
    card.style.setProperty("--my", (py * 100).toFixed(1) + "%");
  });

  card.addEventListener("pointerleave", function () {
    card.classList.remove("is-tilting");
    card.style.setProperty("--ry", "0deg");
    card.style.setProperty("--rx", "0deg");
  });
}

wallet.addEventListener("click", function () {
  const on = wallet.getAttribute("aria-pressed") !== "true";
  wallet.setAttribute("aria-pressed", on ? "true" : "false");
  walletTxt.textContent = on ? "Stored in wallet" : "Add to wallet";
  state.textContent = on
    ? "Pass cached on device · lounge key stays pending"
    : "Pass verified at check-in desk 24";
});

lounge.addEventListener("click", function () {
  const on = lounge.getAttribute("aria-pressed") !== "true";
  lounge.setAttribute("aria-pressed", on ? "true" : "false");
  loungeTxt.textContent = on ? "Key issued · gate 12" : "Request lounge key";
  if (on) {
    band.classList.add("is-set");
    band.querySelector(".fly__band-txt").textContent = "Gold · lounge key issued";
    meter.style.transform = "scaleX(1)";
    state.textContent = "Lounge key issued for gate 12 · valid 3 h";
  } else {
    band.classList.remove("is-set");
    band.querySelector(".fly__band-txt").textContent = "Gold · Skyline tier";
    meter.style.transform = "scaleX(0.84)";
    state.textContent = "Pass verified at check-in desk 24";
  }
});
