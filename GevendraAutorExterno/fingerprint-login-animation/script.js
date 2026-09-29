const fingerprintButton = document.querySelector(".container");

fingerprintButton.addEventListener("click", () => {
  const isActive = fingerprintButton.classList.toggle("active");
  fingerprintButton.setAttribute("aria-pressed", String(isActive));
});
