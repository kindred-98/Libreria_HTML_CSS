const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const thumb = document.getElementById("wliThumb");
const note = document.getElementById("wliNote");
const dots = Array.from(document.querySelectorAll(".pager__dot"));

const NOTES = {
  "44": "Page 44 \u00b7 Cover opener \u00b7 148 pages bound in 12 signatures",
  "46": "Page 46 \u00b7 Feature opener \u00b7 Nine thousand words, four illustrations",
  "52": "Page 52 \u00b7 Field notes \u00b7 Recorded over three winters in the upper valley",
  "61": "Page 61 \u00b7 The long read \u00b7 Drover road, day two, rain from the west",
  "74": "Page 74 \u00b7 Kitchen notes \u00b7 Eleven recipes that need a missing ingredient",
  "96": "Page 96 \u00b7 Winter essay \u00b7 Why the ice rink outlived the mill",
  "131": "Page 131 \u00b7 Archive \u00b7 Every cover from the last eleven years"
};

let index = 0;

function go(next) {
  index = ((next % dots.length) + dots.length) % dots.length;
  dots.forEach(function (dot, i) {
    const on = i === index;
    dot.classList.toggle("is-on", on);
    dot.setAttribute("aria-pressed", on ? "true" : "false");
  });
  if (thumb) {
    thumb.style.transform = "translate3d(" + index * 100 + "%, 0, 0)";
  }
  if (note) {
    note.textContent = NOTES[dots[index].dataset.page] || "";
  }
}

dots.forEach(function (dot, i) {
  dot.addEventListener("click", function () {
    go(i);
  });
});

if (!reduce) {
  window.setInterval(function () {
    go(index + 1);
  }, 4600);
}

const save = document.getElementById("wliSave");
const saveText = save ? save.querySelector(".wli__saveText") : null;

if (save && saveText) {
  let saved = false;
  save.addEventListener("click", function () {
    saved = !saved;
    save.classList.toggle("is-done", saved);
    save.setAttribute("aria-pressed", saved ? "true" : "false");
    saveText.textContent = saved ? "Issue saved" : "Save issue";
  });
}
