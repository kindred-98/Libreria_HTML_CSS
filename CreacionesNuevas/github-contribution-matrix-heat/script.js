const grid = document.getElementById("cGrid");
/** @type {string[]} */
const levels = ["", "l1", "l2", "l3", "l4"];
for (let i = 0; i < 70; i++) {
  const b = document.createElement("div");
  b.className = "c-box " + levels[Math.floor(Math.random() * levels.length)];
  grid.appendChild(b);
}
