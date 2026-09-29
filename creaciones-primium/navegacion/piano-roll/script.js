(function () {
  var notas = Array.prototype.slice.call(document.querySelectorAll(".nota:not(.nota--vacia)"));
  var secciones = notas.map(function (n) {
    return document.getElementById(n.getAttribute("href").slice(1));
  });
  var roll = document.getElementById("roll");
  var bobinas = Array.prototype.slice.call(document.querySelectorAll(".bobina"));
  var aguja = document.getElementById("aguja");
  var compas = document.getElementById("compas");
  var activa = -1;

  function girar(indice) {
    roll.style.setProperty("--indice", indice);
    var ancho = notas[0].getBoundingClientRect().width || 1;
    var vacia = roll.children[0].getBoundingClientRect().width || 1;
    var radio = bobinas[0].getBoundingClientRect().width / 2 || 31;
    var avance = 2 * vacia + (indice + 0.5) * ancho;
    var giro = (avance / radio) * 57.2958;
    bobinas.forEach(function (b) {
      b.style.setProperty("--giro", giro.toFixed(2) + "deg");
    });
  }

  function fijar(indice) {
    if (indice === activa) return;
    activa = indice;
    notas.forEach(function (n, i) {
      if (i === indice) n.setAttribute("aria-current", "true");
      else n.removeAttribute("aria-current");
    });
    aguja.style.setProperty("--giro", (indice * 60).toFixed(1) + "deg");
    compas.textContent = notas[indice].getAttribute("data-medida");
    girar(indice);
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

  document.addEventListener("focusin", function (evento) {
    var enlace = evento.target.closest ? evento.target.closest(".nota") : null;
    if (!enlace) return;
    var indice = notas.indexOf(enlace);
    if (indice < 0) return;
    notas.forEach(function (n, i) {
      if (i === indice) n.setAttribute("aria-current", "true");
      else n.removeAttribute("aria-current");
    });
    girar(indice);
  });

  window.addEventListener("scroll", pedir, { passive: true });
  window.addEventListener("resize", pedir);
  window.addEventListener("hashchange", pedir);
  medir();
})();
