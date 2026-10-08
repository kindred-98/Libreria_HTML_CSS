const grid = document.getElementById("cGrid");
/** @type {string[]} */
const levels = ["", "l1", "l2", "l3", "l4"];
for (let i = 0; i < 70; i++) {
  const b = document.createElement("div");
  const level = levels[Math.floor(Math.random() * levels.length)];
  b.className = "c-box";
  if (typeof level === "string" && level !== "") b.classList.add(level);
  grid.appendChild(b);
}
