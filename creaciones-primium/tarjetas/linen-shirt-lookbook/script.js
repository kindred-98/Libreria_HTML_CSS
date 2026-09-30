const mosaic = document.getElementById("mosaic");
const tiles = Array.prototype.slice.call(mosaic.querySelectorAll(".tile"));
const filters = Array.prototype.slice.call(document.querySelectorAll(".filter"));
const pickLine = document.getElementById("pickLine");
const cta = document.getElementById("cta");

let selected = null;
let mode = "all";

function paintPick() {
  pickLine.textContent = "";
  if (selected) {
    const name = document.createElement("b");
    name.textContent = selected.dataset.name;
    pickLine.appendChild(name);
    pickLine.appendChild(
      document.createTextNode(" \u00b7 held for the fitting \u00b7 EUR " + selected.dataset.price)
    );
    return;
  }
  pickLine.textContent = "Nothing selected \u00b7 tap a swatch to hold it for the fitting";
}

function restartFlip() {
  mosaic.classList.remove("is-flip");
  void mosaic.offsetWidth;
  mosaic.classList.add("is-flip");
}

function apply(name) {
  if (name === mode) {
    return;
  }
  mode = name;
  const hiding = [];
  tiles.forEach(function (tile) {
    const show = name === "all" || tile.dataset.cat === name;
    if (show) {
      tile.hidden = false;
      void tile.offsetWidth;
      tile.classList.remove("is-out");
    } else {
      tile.classList.add("is-out");
      hiding.push(tile);
      if (selected === tile) {
        selected = null;
        tile.setAttribute("aria-pressed", "false");
      }
    }
  });
  setTimeout(function () {
    hiding.forEach(function (tile) {
      tile.hidden = true;
    });
  }, 210);
  filters.forEach(function (button) {
    button.setAttribute("aria-pressed", String(button.dataset.filter === name));
  });
  restartFlip();
  paintPick();
}

filters.forEach(function (button) {
  button.addEventListener("click", function () {
    apply(button.dataset.filter);
  });
});

tiles.forEach(function (tile) {
  tile.addEventListener("click", function () {
    const on = tile.getAttribute("aria-pressed") === "true";
    if (selected && selected !== tile) {
      selected.setAttribute("aria-pressed", "false");
    }
    selected = on ? null : tile;
    tile.setAttribute("aria-pressed", String(!on));
    paintPick();
  });
});

cta.addEventListener("click", function () {
  const on = cta.getAttribute("aria-pressed") === "true";
  cta.setAttribute("aria-pressed", on ? "false" : "true");
  cta.textContent = on ? "Book a fitting" : "Fitting held for Friday";
});

setTimeout(function () {
  apply("evening");
}, 900);

setTimeout(function () {
  apply("all");
}, 1700);

setTimeout(function () {
  const hero = tiles[0];
  selected = hero;
  hero.setAttribute("aria-pressed", "true");
  paintPick();
}, 2150);
