const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const card = document.getElementById("fnp");
const ribbon = document.getElementById("fnpRibbon");
const curl = document.getElementById("fnpCurl");
const ripple = document.querySelector(".fnp__ripple");
const sheetOut = document.getElementById("fnpSheet");
const prevBtn = document.getElementById("fnpPrev");
const nextBtn = document.getElementById("fnpNext");
const dots = Array.from(document.querySelectorAll(".fnp__dot"));
const pages = Array.from(document.querySelectorAll(".fnp__page"));

const RIBBON_X = [34, 132, 230];

let current = 0;
let from = 0;

function showPage(index) {
  const target = ((index % pages.length) + pages.length) % pages.length;
  if (target === current) {
    return;
  }
  const leaving = pages[current];
  const entering = pages[target];

  entering.hidden = false;
  leaving.classList.remove("is-in");
  leaving.classList.add("is-out");
  entering.classList.remove("is-out");
  entering.classList.add("is-in");

  window.setTimeout(function () {
    leaving.hidden = true;
    leaving.classList.remove("is-out");
    entering.classList.remove("is-in");
  }, 460);

  if (!reduce) {
    curl.classList.remove("is-turning");
    curl.getBoundingClientRect();
    curl.classList.add("is-turning");
    window.setTimeout(function () {
      curl.classList.remove("is-turning");
    }, 660);

    ripple.classList.remove("is-bump");
    ripple.getBoundingClientRect();
    ripple.classList.add("is-bump");
    window.setTimeout(function () {
      ripple.classList.remove("is-bump");
    }, 540);

    ribbon.style.setProperty("--fx", RIBBON_X[current] + "px");
    ribbon.style.setProperty("--rx", RIBBON_X[target] + "px");
    ribbon.classList.remove("is-sliding");
    ribbon.getBoundingClientRect();
    ribbon.classList.add("is-sliding");
    window.setTimeout(function () {
      ribbon.classList.remove("is-sliding");
    }, 560);
  }

  from = current;
  current = target;

  dots.forEach(function (dot, i) {
    const on = i === current;
    dot.classList.toggle("is-on", on);
    dot.setAttribute("aria-pressed", on ? "true" : "false");
  });
  const label = sheetOut;
  label.textContent = (current + 1 < 10 ? "0" : "") + (current + 1);
}

prevBtn.addEventListener("click", function () {
  showPage(current - 1);
});

nextBtn.addEventListener("click", function () {
  showPage(current + 1);
});

dots.forEach(function (dot) {
  dot.addEventListener("click", function () {
    showPage(Number(dot.dataset.goto));
  });
});

if (!reduce) {
  window.setTimeout(function () {
    window.setInterval(function () {
      showPage(current + 1);
    }, 3600);
  }, 1400);
}

window.setTimeout(function () {
  card.classList.add("is-settled");
}, 800);