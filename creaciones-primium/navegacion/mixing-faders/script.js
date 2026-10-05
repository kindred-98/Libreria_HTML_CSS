(function () {
  var vias = Array.prototype.slice.call(document.querySelectorAll(".via"));
  var secciones = vias.map(function (v) {
    return document.getElementById(v.getAttribute("href").slice(1));
  });
  var canal = document.getElementById("lecturaCanal");
  var nombre = document.getElementById("lecturaNombre");
  var actual = "";

  function fijar(indice) {
    if (indice < 0 || indice === actual) return;
    actual = indice;
    vias.forEach(function (v, i) {
      if (i === indice) v.setAttribute("aria-current", "true");
      else v.removeAttribute("aria-current");
    });
    canal.textContent = vias[indice].dataset.canal;
    nombre.textContent = vias[indice].dataset.nombre;
  }

  var listo = false;
  function medir() {
    listo = false;
    var limite = window.innerHeight * 0.36;
    var encontrado = 0;
    for (var i = 0; i < secciones.length; i++) {
      var s = secciones[i];
      if (!s) continue;
      var caja = s.getBoundingClientRect();
      if (caja.top - limite <= 0) encontrado = i;
    }
    fijar(encontrado);
  }

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
