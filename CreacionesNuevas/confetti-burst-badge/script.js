const btn = document.getElementById("burstBtn");
const confetti = btn.querySelector(".confetti");
const colors = ["#f472b6", "#fbbf24", "#34d399", "#60a5fa", "#fb7185"];

btn.addEventListener("click", () => {
  btn.classList.remove("is-burst");
  confetti.replaceChildren();
  btn.getBoundingClientRect();
  btn.classList.add("is-burst");
  btn.setAttribute("aria-pressed", "true");

  for (let i = 0; i < 18; i++) {
    const piece = document.createElement("span");
    piece.className = "piece";
    piece.style.background = colors[i % colors.length];
    const angle = (Math.PI * 2 * i) / 18;
    const dist = 40 + Math.random() * 50;
    piece.style.setProperty("--tx", `${Math.cos(angle) * dist}px`);
    piece.style.setProperty("--ty", `${Math.sin(angle) * dist}px`);
    piece.style.animationDelay = `${Math.random() * 0.08}s`;
    confetti.appendChild(piece);
  }

  setTimeout(() => btn.setAttribute("aria-pressed", "false"), 900);
});
