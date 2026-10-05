const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function runCounter(node) {
  if (reduce) {
    node.textContent = node.dataset.count;
    return;
  }
  const target = Number(node.dataset.count) || 0;
  const duration = 640;
  const start = performance.now();

  function step() {
    const t = Math.min(1, (performance.now() - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    node.textContent = String(Math.round(eased * target));
    if (t < 1) {
      setTimeout(step, 22);
    } else {
      node.textContent = node.dataset.count;
    }
  }

  step();
}

Array.from(document.querySelectorAll("[data-count]")).forEach(function (node) { return runCounter(node); });

const rows = Array.from(document.querySelectorAll(".row"));
let open = 0;

function cycleRow() {
  const row = rows[open % rows.length];
  row.classList.add("is-lit");
  open += 1;
}

cycleRow();
setInterval(cycleRow, 2900);

const book = document.getElementById("dirBook");
let booked = false;

book.addEventListener("click", function () {
  booked = !booked;
  book.classList.toggle("is-booked", booked);
  book.setAttribute("aria-pressed", booked ? "true" : "false");
  book.lastChild.textContent = booked ? " Slot held, see you at 14:00" : " Check availability";
});

const copyBtn = document.getElementById("dirCopy");
const copyLabel = document.getElementById("dirCopyLabel");
const ADDRESS = "noor@haddad.audio";
let copied = false;

copyBtn.addEventListener("click", function () {
  copied = !copied;
  if (copied && navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(ADDRESS).catch(function () {
      copyLabel.textContent = ADDRESS;
    });
  }
  copyLabel.textContent = copied ? "Address copied" : "Copy address";
  copyBtn.classList.toggle("is-done", copied);
  copyBtn.setAttribute("aria-pressed", copied ? "true" : "false");
  if (!copied) {
    copyLabel.textContent = "Copy address";
  }
});
