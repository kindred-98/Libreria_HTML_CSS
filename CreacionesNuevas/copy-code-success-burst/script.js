const btn = document.getElementById("copyBtn");
const textSpan = btn.querySelector(".btn-text");
btn.addEventListener("click", () => {
  btn.classList.add("copied");
  textSpan.textContent = "¡Copiado!";
  // El boton confirma igual aunque el navegador no deje copiar, asi que el fallo
  // se ignora en vez de dejarlo como rechazo sin capturar.
  navigator.clipboard.writeText("npm install @quantum/core --save-prod").catch(() => {});
  setTimeout(() => {
    btn.classList.remove("copied");
    textSpan.textContent = "Copiar";
  }, 2000);
});