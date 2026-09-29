(function () {
  var unidades = Array.prototype.slice.call(document.querySelectorAll(".unidad"));
  var secciones = unidades.map(function (u) {
    return document.getElementById(u.getAttribute("href").slice(1));
  });
  var luz = document.getElementById("carrilLuz");
  var unidad = document.getElementById("unidad");
  var nombre = document.getElementById("nombre");
  var activa = -1;

  function fijar(indice) {
    if (indice === activa) return;
    activa = indice;
    unidades.forEach(function (u, i) {
      if (i === indice) u.setAttribute("aria-current", "true");
      else u.removeAttribute("aria-current");
    });
    luz.style.setProperty("--pos", indice);
    unidad.textContent = unidades[indice].getAttribute("data-u");
    nombre.textContent = unidades[indice].getAttribute("data-nombre");
  }

  function medir() {
    var limite = window.innerHeight * 0.4;
    var indice = 0;
    for (var i = 0; i < secciones.length; i++) {
      var s = secciones[i];
      if (s && s.getBoundingClientRect().top - limite <= 0) indice = i;
    }
    fijar(indice);
  }

  var listo = false;
  function pedir() {
    if (listo) return;
    listo = true;
    window.requestAnimationFrame(medir);
  }

  window.addEventListener("scroll", pedir, { passive: true });
  window.addEventListener("resize", pedir);
  window.addEventListener("hashchange", pedir);
  medir();
})();
