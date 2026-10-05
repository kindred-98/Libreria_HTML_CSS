const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const react = document.getElementById("react");
const count = document.getElementById("applause");
const bursts = document.getElementById("bursts");
const floats = document.getElementById("floats");
const readers = document.getElementById("readers");
const more = document.getElementById("more");
const echo = document.getElementById("echo");
const clip = document.getElementById("clip");

let applause = Number(count.textContent) || 0;
let reading = Number(readers.textContent) || 47;

function pulse(node, className) {
  node.classList.remove(className);
  node.getBoundingClientRect();
  node.classList.add(className);
}

function celebrate() {
  if (reduce) {
    return;
  }
  pulse(bursts, "is-boom");
  pulse(floats, "is-up");
}

function bump(value) {
  applause += value;
  count.textContent = String(applause);
  if (!reduce) {
    pulse(count, "is-flash");
    pulse(react, "is-pop");
  }
}

react.addEventListener("click", function () {
  const on = react.getAttribute("aria-pressed") === "true";
  react.setAttribute("aria-pressed", on ? "false" : "true");
  bump(on ? -1 : 1);
  celebrate();
});

[more, echo, clip].forEach(function (btn) {
  btn.addEventListener("click", function () {
    btn.setAttribute("aria-pressed", btn.getAttribute("aria-pressed") === "true" ? "false" : "true");
  });
});

if (!reduce) {
  let applauseBeat = 0;
  let readerBeat = 0;
  const drift = [1, 2, 1, 3, 1, 1, 2];

  window.setInterval(function () {
    if (react.getAttribute("aria-pressed") === "true") {
      return;
    }
    bump(drift[applauseBeat % drift.length]);
    celebrate();
    applauseBeat += 1;
  }, 2100);

  window.setInterval(function () {
    reading += drift[readerBeat % drift.length];
    if (reading > 96) {
      reading = 31;
    }
    readers.textContent = String(reading);
    readerBeat += 1;
  }, 900);
}
