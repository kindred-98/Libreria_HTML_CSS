const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const hall = document.getElementById("hall");
const seatsBox = document.querySelector(".hall__rows");
const seats = Array.from(document.querySelectorAll(".hall__seat"));
const segs = Array.from(document.querySelectorAll(".hall__seg-btn"));
const gauge = document.getElementById("hallGauge");
const freeTxt = document.getElementById("hallFree");
const msg = document.getElementById("hallMsg");
const clearBtn = document.getElementById("hallClear");
const bookBtn = document.getElementById("hallBook");
const seatsOut = document.querySelector("[data-seats]");
const totalOut = document.querySelector("[data-total]");

const PRICE = 108;
const MAX = 6;
const TOTAL_SEATS = 50;

const TAKEN = {
  matinee: ["A2", "A3", "A9", "A10", "B7", "B8", "C5", "D4", "D8", "E3", "E9"],
  nocturne: ["A4", "A5", "A6", "A11", "B1", "B2", "C7", "C8", "D2", "D3", "E6", "E7", "E8"]
};

let session = "matinee";
const held = new Set(["B3", "B4"]);

function keyOf(btn) {
  return btn.dataset.r + btn.dataset.n;
}

function takenSet() {
  return new Set(TAKEN[session]);
}

function wave(btn) {
  if (reduce) {
    return;
  }
  btn.classList.remove("is-wave");
  btn.getBoundingClientRect();
  btn.classList.add("is-wave");
  window.setTimeout(function () {
    btn.classList.remove("is-wave");
  }, 700);
}

function paint() {
  const sold = takenSet();
  let free = 0;
  seats.forEach(function (btn) {
    const k = keyOf(btn);
    const isSold = sold.has(k);
    btn.disabled = isSold;
    btn.classList.toggle("is-taken", isSold);
    if (isSold) {
      btn.classList.remove("is-held", "is-picked");
      btn.setAttribute("aria-pressed", "false");
    }
    if (!isSold) {
      free += 1;
    }
  });
  held.forEach(function (k) {
    if (sold.has(k)) {
      held.delete(k);
    }
  });
  seats.forEach(function (btn) {
    const k = keyOf(btn);
    const on = held.has(k);
    btn.classList.toggle("is-picked", on);
    btn.classList.toggle("is-held", !on);
    btn.setAttribute("aria-pressed", on ? "true" : "false");
  });
  const n = held.size;
  seatsOut.textContent = String(n);
  totalOut.textContent = String(n * PRICE);
  gauge.style.transform = "scaleX(" + (free / TOTAL_SEATS).toFixed(3) + ")";
  freeTxt.textContent = free + " of " + TOTAL_SEATS + " free";
  msg.textContent = n
    ? "Block of " + n + " seat" + (n === 1 ? "" : "s") + " held for 08:40"
    : "Pick up to " + MAX + " seats in the stalls block";
  bookBtn.disabled = n === 0;
}

function setSession(key) {
  session = key;
  hall.dataset.session = key;
  segs.forEach(function (btn) {
    const on = btn.dataset.ses === key;
    btn.classList.toggle("is-on", on);
    btn.setAttribute("aria-pressed", on ? "true" : "false");
  });
  paint();
}

seatsBox.addEventListener("click", function (event) {
  const btn = event.target.closest(".hall__seat");
  if (!btn || btn.disabled) {
    return;
  }
  const k = keyOf(btn);
  if (held.has(k)) {
    held.delete(k);
  } else {
    if (held.size >= MAX) {
      msg.textContent = "Block is full at " + MAX + " seats";
      return;
    }
    held.add(k);
  }
  wave(btn);
  paint();
  bookBtn.setAttribute("aria-pressed", "false");
  bookBtn.textContent = "Book the block";
});

segs.forEach(function (btn) {
  btn.addEventListener("click", function () {
    setSession(btn.dataset.ses);
  });
});

clearBtn.addEventListener("click", function () {
  held.clear();
  paint();
  bookBtn.setAttribute("aria-pressed", "false");
  bookBtn.textContent = "Book the block";
});

bookBtn.addEventListener("click", function () {
  const on = bookBtn.getAttribute("aria-pressed") !== "true";
  if (on && held.size === 0) {
    return;
  }
  bookBtn.setAttribute("aria-pressed", on ? "true" : "false");
  bookBtn.textContent = on ? "Block confirmed" : "Book the block";
  if (on) {
    msg.textContent = "Row " + Array.from(held).map(function (k) {
      return k[0];
    }).join(" ") + " confirmed · e-tickets sent";
  } else {
    paint();
  }
});

paint();
