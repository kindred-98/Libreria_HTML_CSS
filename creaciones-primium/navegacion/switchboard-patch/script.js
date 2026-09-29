(function () {
  var clavijas = Array.prototype.slice.call(document.querySelectorAll(".clavija"));
  var secciones = clavijas.map(function (c) {
    return document.getElementById(c.getAttribute("href").slice(1));
  });
  var tablero = document.getElementById("tablero");
  var izq = document.getElementById("cordonIzq");
  var der = document.getElementById("cordonDer");
  var num = document.getElementById("lineaNum");
  var texto = document.getElementById("lineaTexto");
  var boton = document.getElementById("hojaBoton");
  var cuerpo = document.getElementById("hojaCuerpo");
  var activa = -1;
  var largo = 240;

  function tensar(indice) {
    var marco = tablero.getBoundingClientRect();
    var destino = clavijas[indice].getBoundingClientRect();
    var blanco = destino.left - marco.left + destino.width / 2;
    var alto = destino.top - marco.top + destino.height * 0.42;
    var cords = [izq, der];
    for (var i = 0; i < 2; i++) {
      var c = cords[i];
      var x = c.offsetLeft;
      var y = c.offsetTop + c.offsetHeight / 2;
      var angulo = Math.atan2(alto - y, blanco - x) * 57.2958;
      var distancia = Math.sqrt(Math.pow(blanco - x, 2) + Math.pow(alto - y, 2));
      c.style.transform = "rotate(" + angulo.toFixed(2) + "deg) scaleX(" + (distancia / largo).toFixed(3) + ")";
    }
  }

  function fijar(indice) {
    if (indice === activa) return;
    activa = indice;
    clavijas.forEach(function (c, i) {
      if (i === indice) c.setAttribute("aria-current", "true");
      else c.removeAttribute("aria-current");
    });
    num.textContent = clavijas[indice].getAttribute("data-linea");
    texto.textContent = clavijas[indice].getAttribute("data-nombre");
    tensar(indice);
  }

  function medir() {
    var limite = window.innerHeight * 0.38;
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

  function hoja(abrir) {
    var estado = boton.getAttribute("aria-expanded") === "true";
    if (abrir === undefined) abrir = !estado;
    boton.setAttribute("aria-expanded", abrir ? "true" : "false");
    cuerpo.hidden = !abrir;
  }

  window.addEventListener("scroll", pedir, { passive: true });
  window.addEventListener("hashchange", pedir);
  window.addEventListener("resize", function () {
    largo = izq.offsetWidth || 240;
    pedir();
  });
  boton.addEventListener("click", function () { hoja(); });
  document.addEventListener("keydown", function (evento) {
    if (evento.key === "Escape" && boton.getAttribute("aria-expanded") === "true") {
      hoja(false);
      boton.focus();
    }
  });

  largo = izq.offsetWidth || 240;
  medir();
})();
