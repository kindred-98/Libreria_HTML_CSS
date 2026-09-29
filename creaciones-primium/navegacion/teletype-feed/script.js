(function () {
  var destinos = Array.prototype.slice.call(document.querySelectorAll(".destino:not(.destino--vacio)"));
  var secciones = destinos.map(function (d) {
    return document.getElementById(d.getAttribute("href").slice(1));
  });
  var tira = document.getElementById("tira");
  var marca = document.querySelector(".platina__marca");
  var num = document.getElementById("lineaNum");
  var texto = document.getElementById("lineaTexto");
  var activa = -1;

  function alimentar(posicion) {
    tira.style.setProperty("--pos", posicion.toFixed(3));
  }

  function fijar(indice) {
    if (indice === activa) return;
    activa = indice;
    destinos.forEach(function (d, i) {
      if (i === indice) d.setAttribute("aria-current", "true");
      else d.removeAttribute("aria-current");
    });
    num.textContent = destinos[indice].getAttribute("data-linea");
    texto.textContent = destinos[indice].getAttribute("data-texto");
    marca.style.setProperty("--giro", (indice * 60).toFixed(1) + "deg");
  }

  function medir() {
    var limite = window.innerHeight * 0.4;
    var indice = 0;
    var resto = 0;
    for (var i = 0; i < secciones.length; i++) {
      var s = secciones[i];
      if (!s) continue;
      if (s.getBoundingClientRect().top - limite <= 0) {
        indice = i;
        var siguiente = secciones[i + 1];
        if (siguiente) {
          var arriba = s.getBoundingClientRect().top;
          var alto = siguiente.getBoundingClientRect().top - arriba;
          resto = alto > 0 ? (limite - arriba) / alto : 0;
        }
      }
    }
    if (resto < 0) resto = 0;
    if (resto > 1) resto = 1;
    fijar(indice);
    alimentar(Math.min(secciones.length - 1, indice + resto));
  }

  var listo = false;
  function pedir() {
    if (listo) return;
    listo = true;
    window.requestAnimationFrame(medir);
  }

  document.addEventListener("focusin", function (evento) {
    var enlace = evento.target.closest ? evento.target.closest(".destino") : null;
    if (!enlace) return;
    var indice = destinos.indexOf(enlace);
    if (indice < 0) return;
    fijar(indice);
    alimentar(indice);
  });

  window.addEventListener("scroll", pedir, { passive: true });
  window.addEventListener("resize", pedir);
  window.addEventListener("hashchange", pedir);
  medir();
})();
