const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const zine = document.getElementById("zine");
const gridBtn = document.getElementById("gridBtn");
const saveBtn = document.getElementById("saveBtn");
const tools = document.querySelector(".zine__tools");
const byline = document.querySelector(".zine__by");

let gridOn = false;
let saved = false;

gridBtn.addEventListener("click", function () {
  gridOn = !gridOn;
  gridBtn.setAttribute("aria-pressed", gridOn ? "true" : "false");
  zine.classList.toggle("is-grid", gridOn);
});

saveBtn.addEventListener("click", function () {
  saved = !saved;
  saveBtn.setAttribute("aria-pressed", saved ? "true" : "false");
  saveBtn.textContent = saved ? "Saved" : "Save";
  byline.textContent = saved
    ? "Words · Ines Marlow · filed to the reading list"
    : "Words · Ines Marlow · Oct 2025";

  if (reduce || saved) {
    return;
  }

  tools.classList.remove("is-pulse");
  setTimeout(function () {
    tools.classList.add("is-pulse");
  }, 40);
  setTimeout(function () {
    tools.classList.remove("is-pulse");
  }, 620);
});
