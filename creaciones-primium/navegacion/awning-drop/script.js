(function () {
  var locales = Array.prototype.slice.call(document.querySelectorAll(".local"));
  var secciones = locales.map(function (l) {
    return document.getElementById(l.getAttribute("href").slice(1));
  });
  var cuenta = document.getElementById("cuenta");
  var nombre = document.getElementById("cuentaNombre");
  var colgado = null;

  function bajar(indice) {
    if (colgado === indice) return;
    colgado = indice;
    locales.forEach(function (l, i) {
      if (i === indice) l.setAttribute("aria-current", "true");
      else l.removeAttribute("aria-current");
    });
    cuenta.textContent = locales[indice].dataset.n;
    nombre.textContent = locales[indice].dataset.name;
  }

  function medir() {
    var limite = window.innerHeight * 0.42;
    var indice = 0;
    for (var i = 0; i < secciones.length; i++) {
      var s = secciones[i];
      if (s && s.getBoundingClientRect().top - limite <= 0) indice = i;
    }
    bajar(indice);
  }

  var listo = false;
  function pedir() {
    if (listo) return;
    listo = true;
    window.requestAnimationFrame(medir);
  }

  document.addEventListener("keydown", function (evento) {
    var enlace = evento.target.closest ? evento.target.closest(".local") : null;
    if (!enlace) return;
    var i = locales.indexOf(enlace);
    var destino = -1;
    if (evento.key === "ArrowRight" || evento.key === "ArrowDown") destino = (i + 1) % locales.length;
    if (evento.key === "ArrowLeft" || evento.key === "ArrowUp") destino = (i - 1 + locales.length) % locales.length;
    if (destino < 0) return;
    evento.preventDefault();
    locales[destino].focus();
  });

  window.addEventListener("scroll", pedir, { passive: true });
  window.addEventListener("resize", pedir);
  window.addEventListener("hashchange", pedir);
  medir();
})();
