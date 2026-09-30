const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const counters = Array.from(document.querySelectorAll("[data-count]"));
const guide = document.getElementById("guide");

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function setFinal(node) {
  node.textContent = node.dataset.count;
}

function runCounter(node) {
  const target = Number(node.dataset.count) || 0;
  const duration = 700;
  const start = performance.now();

  function step() {
    const progress = Math.min(1, (performance.now() - start) / duration);
    node.textContent = String(Math.round(easeOutCubic(progress) * target));
    if (progress < 1) {
      setTimeout(step, 24);
    }
  }

  step();
}

counters.forEach(function (node) {
  if (reduce) {
    setFinal(node);
  } else {
    runCounter(node);
  }
});

if (!reduce) {
  let raf = 0;

  guide.addEventListener("pointermove", function (event) {
    if (raf) {
      return;
    }
    raf = requestAnimationFrame(function () {
      raf = 0;
      const box = guide.getBoundingClientRect();
      const dx = (event.clientX - box.left) / box.width - 0.5;
      const dy = (event.clientY - box.top) / box.height - 0.5;
      guide.style.transform =
        "rotateX(" + (-dy * 7).toFixed(2) + "deg) rotateY(" + (dx * 9).toFixed(2) + "deg)";
    });
  });

  guide.addEventListener("pointerleave", function () {
    guide.style.transform = "";
  });
}

const book = document.getElementById("book");
const message = document.getElementById("msg");
let booked = false;

book.addEventListener("click", function () {
  booked = !booked;
  book.textContent = booked ? "Request sent" : "Book a route";
  book.setAttribute("aria-pressed", booked ? "true" : "false");
});

message.addEventListener("click", function () {
  message.setAttribute("aria-pressed", message.getAttribute("aria-pressed") === "true" ? "false" : "true");
});
