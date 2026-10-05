const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const figures = Array.from(document.querySelectorAll("[data-final]"));

function scramble(text) {
  return text.replace(/[\d]/g, function () {
    return String(Math.floor(Math.random() * 10));
  });
}

function recompose(node) {
  const finalText = node.dataset.final || node.textContent;
  let step = 0;
  const timer = window.setInterval(function () {
    step += 1;
    if (step > 4) {
      window.clearInterval(timer);
      node.textContent = finalText;
      return;
    }
    node.textContent = scramble(finalText);
  }, 90);
}

if (!reduceMotion && figures.length > 0) {
  let index = 0;
  window.setInterval(function () {
    recompose(figures[index % figures.length]);
    index += 1;
  }, 1900);
}
