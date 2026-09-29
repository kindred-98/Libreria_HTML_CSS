const reactionInput = document.querySelector("#like");
const reactionLabel = document.querySelector(".label-reactions");
const closeButton = document.querySelector(".overlay");
const reactionButtons = document.querySelectorAll(".box > button[class^='reaction-']");

for (const reactionButton of reactionButtons) {
  const reactionName = reactionButton.querySelector(".legend-reaction").textContent.trim();
  reactionButton.setAttribute("aria-label", `${reactionName} reaction`);
  reactionButton.addEventListener("click", () => {
    reactionLabel.textContent = reactionName;
    reactionLabel.setAttribute("aria-label", `${reactionName} reaction selected`);
    reactionInput.checked = false;
    reactionInput.focus();
  });
}

closeButton.addEventListener("click", () => {
  reactionInput.checked = false;
  reactionInput.focus();
});
