(function () {
  var puertas = Array.prototype.slice.call(document.querySelectorAll(".puerta"));
  var secciones = puertas.map(function (p) {
    return document.getElementById(p.getAttribute("href").slice(1));
  });
  var barra = document.getElementById("plintoBarra");
  var cuenta = document.getElementById("cuenta");
  var nombre = document.getElementById("cuentaNombre");
  var entornada = -1;

  function abrir(indice) {
    if (indice === entornada) return;
    entornada = indice;
    puertas.forEach(function (p, i) {
      if (i < indice) p.classList.add("entornada");
      else p.classList.remove("entornada");
      if (i === indice) p.setAttribute("aria-current", "true");
      else p.removeAttribute("aria-current");
    });
    barra.style.width = (((indice + 1) / puertas.length) * 100).toFixed(2) + "%";
    cuenta.textContent = puertas[indice].getAttribute("data-n");
    nombre.textContent = puertas[indice].getAttribute("data-name");
  }

  function medir() {
    var limite = window.innerHeight * 0.42;
    var indice = 0;
    for (var i = 0; i < secciones.length; i++) {
      var s = secciones[i];
      if (s && s.getBoundingClientRect().top - limite <= 0) indice = i;
    }
    abrir(indice);
  }

  var listo = false;
  function pedir() {
    if (listo) return;
    listo = true;
    window.requestAnimationFrame(medir);
  }

  document.addEventListener("keydown", function (evento) {
    var enlace = evento.target.closest ? evento.target.closest(".puerta") : null;
    if (!enlace) return;
    var i = puertas.indexOf(enlace);
    var destino = -1;
    if (evento.key === "ArrowRight" || evento.key === "ArrowDown") destino = (i + 1) % puertas.length;
    if (evento.key === "ArrowLeft" || evento.key === "ArrowUp") destino = (i - 1 + puertas.length) % puertas.length;
    if (destino < 0) return;
    evento.preventDefault();
    puertas[destino].focus();
  });

  window.addEventListener("scroll", pedir, { passive: true });
  window.addEventListener("resize", pedir);
  window.addEventListener("hashchange", pedir);
  medir();
})();
