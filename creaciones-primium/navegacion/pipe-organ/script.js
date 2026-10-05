(function () {
  var palancas = Array.prototype.slice.call(document.querySelectorAll(".palanca"));
  var secciones = palancas.map(function (p) {
    return document.getElementById(p.getAttribute("href").slice(1));
  });
  var aguja = document.getElementById("aguja");
  var valor = document.getElementById("valor");
  var activa = -1;

  function tocar(indice) {
    if (indice === activa) return;
    activa = indice;
    palancas.forEach(function (p, i) {
      if (i === indice) p.setAttribute("aria-current", "true");
      else p.removeAttribute("aria-current");
    });
    aguja.style.setProperty("--ang", (-52 + indice * 20.8).toFixed(1) + "deg");
    valor.textContent = palancas[indice].dataset.n;
  }

  function medir() {
    var limite = window.innerHeight * 0.38;
    var indice = 0;
    for (var i = 0; i < secciones.length; i++) {
      var s = secciones[i];
      if (s && s.getBoundingClientRect().top - limite <= 0) indice = i;
    }
    tocar(indice);
  }

  var listo = false;
  function pedir() {
    if (listo) return;
    listo = true;
    window.requestAnimationFrame(medir);
  }

  document.addEventListener("keydown", function (evento) {
    var enlace = evento.target.closest ? evento.target.closest(".palanca") : null;
    if (!enlace) return;
    var i = palancas.indexOf(enlace);
    var destino = -1;
    if (evento.key === "ArrowRight" || evento.key === "ArrowDown") destino = Math.min(palancas.length - 1, i + 1);
    if (evento.key === "ArrowLeft" || evento.key === "ArrowUp") destino = Math.max(0, i - 1);
    if (destino < 0) return;
    evento.preventDefault();
    palancas[destino].focus();
  });

  window.addEventListener("scroll", pedir, { passive: true });
  window.addEventListener("resize", pedir);
  window.addEventListener("hashchange", pedir);
  medir();
})();
