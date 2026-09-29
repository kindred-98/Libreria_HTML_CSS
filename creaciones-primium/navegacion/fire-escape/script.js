(function () {
  var tramos = Array.prototype.slice.call(document.querySelectorAll(".tramo"));
  var secciones = tramos.map(function (t) {
    return document.getElementById(t.getAttribute("href").slice(1));
  });
  var barra = document.getElementById("oxidoBarra");
  var cuenta = document.getElementById("cuenta");
  var nombre = document.getElementById("cuentaNombre");
  var abierto = -1;

  function desplegar(indice) {
    if (indice === abierto) return;
    abierto = indice;
    tramos.forEach(function (t, i) {
      if (i === indice) t.setAttribute("aria-current", "true");
      else t.removeAttribute("aria-current");
    });
    barra.style.width = (((indice + 1) / tramos.length) * 100).toFixed(2) + "%";
    cuenta.textContent = tramos[indice].getAttribute("data-n");
    nombre.textContent = tramos[indice].getAttribute("data-name");
  }

  function medir() {
    var limite = window.innerHeight * 0.42;
    var indice = 0;
    for (var i = 0; i < secciones.length; i++) {
      var s = secciones[i];
      if (s && s.getBoundingClientRect().top - limite <= 0) indice = i;
    }
    desplegar(indice);
  }

  var listo = false;
  function pedir() {
    if (listo) return;
    listo = true;
    window.requestAnimationFrame(medir);
  }

  document.addEventListener("keydown", function (evento) {
    var enlace = evento.target.closest ? evento.target.closest(".tramo") : null;
    if (!enlace) return;
    var i = tramos.indexOf(enlace);
    var destino = -1;
    if (evento.key === "ArrowRight" || evento.key === "ArrowDown") destino = (i + 1) % tramos.length;
    if (evento.key === "ArrowLeft" || evento.key === "ArrowUp") destino = (i - 1 + tramos.length) % tramos.length;
    if (destino < 0) return;
    evento.preventDefault();
    tramos[destino].focus();
  });

  window.addEventListener("scroll", pedir, { passive: true });
  window.addEventListener("resize", pedir);
  window.addEventListener("hashchange", pedir);
  medir();
})();
