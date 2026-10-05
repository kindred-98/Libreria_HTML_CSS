(function () {
  var zonas = Array.prototype.slice.call(document.querySelectorAll(".zona"));
  var secciones = zonas.map(function (z) {
    return document.getElementById(z.getAttribute("href").slice(1));
  });
  var barra = document.getElementById("canalBarra");
  var cuenta = document.getElementById("cuenta");
  var nombre = document.getElementById("cuentaNombre");
  var activa = -1;

  function dibujar(indice) {
    if (indice === activa) return;
    activa = indice;
    zonas.forEach(function (z, i) {
      if (i === indice) z.setAttribute("aria-current", "true");
      else z.removeAttribute("aria-current");
    });
    barra.style.width = (((indice + 1) / zonas.length) * 100).toFixed(2) + "%";
    cuenta.textContent = zonas[indice].dataset.n;
    nombre.textContent = zonas[indice].dataset.name;
  }

  function medir() {
    var limite = window.innerHeight * 0.42;
    var indice = 0;
    for (var i = 0; i < secciones.length; i++) {
      var s = secciones[i];
      if (s && s.getBoundingClientRect().top - limite <= 0) indice = i;
    }
    dibujar(indice);
  }

  var listo = false;
  function pedir() {
    if (listo) return;
    listo = true;
    window.requestAnimationFrame(medir);
  }

  document.addEventListener("keydown", function (evento) {
    var enlace = evento.target.closest ? evento.target.closest(".zona") : null;
    if (!enlace) return;
    var i = zonas.indexOf(enlace);
    var destino = -1;
    if (evento.key === "ArrowRight" || evento.key === "ArrowDown") destino = (i + 1) % zonas.length;
    if (evento.key === "ArrowLeft" || evento.key === "ArrowUp") destino = (i - 1 + zonas.length) % zonas.length;
    if (destino < 0) return;
    evento.preventDefault();
    zonas[destino].focus();
  });

  window.addEventListener("scroll", pedir, { passive: true });
  window.addEventListener("resize", pedir);
  window.addEventListener("hashchange", pedir);
  medir();
})();
