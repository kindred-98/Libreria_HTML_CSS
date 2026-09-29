(function () {
  var carteles = Array.prototype.slice.call(document.querySelectorAll(".cartel"));
  var secciones = carteles.map(function (c) {
    return document.getElementById(c.getAttribute("href").slice(1));
  });
  var barra = document.getElementById("bordeBarra");
  var cuenta = document.getElementById("cuenta");
  var nombre = document.getElementById("cuentaNombre");
  var activo = -1;

  function adelantar(indice) {
    if (indice === activo) return;
    activo = indice;
    carteles.forEach(function (c, i) {
      if (i === indice) c.setAttribute("aria-current", "true");
      else c.removeAttribute("aria-current");
    });
    barra.style.width = (((indice + 1) / carteles.length) * 100).toFixed(2) + "%";
    cuenta.textContent = carteles[indice].getAttribute("data-n");
    nombre.textContent = carteles[indice].getAttribute("data-name");
  }

  function medir() {
    var limite = window.innerHeight * 0.42;
    var indice = 0;
    for (var i = 0; i < secciones.length; i++) {
      var s = secciones[i];
      if (s && s.getBoundingClientRect().top - limite <= 0) indice = i;
    }
    adelantar(indice);
  }

  var listo = false;
  function pedir() {
    if (listo) return;
    listo = true;
    window.requestAnimationFrame(medir);
  }

  document.addEventListener("keydown", function (evento) {
    var enlace = evento.target.closest ? evento.target.closest(".cartel") : null;
    if (!enlace) return;
    var i = carteles.indexOf(enlace);
    var destino = -1;
    if (evento.key === "ArrowRight" || evento.key === "ArrowDown") destino = (i + 1) % carteles.length;
    if (evento.key === "ArrowLeft" || evento.key === "ArrowUp") destino = (i - 1 + carteles.length) % carteles.length;
    if (destino < 0) return;
    evento.preventDefault();
    carteles[destino].focus();
  });

  window.addEventListener("scroll", pedir, { passive: true });
  window.addEventListener("resize", pedir);
  window.addEventListener("hashchange", pedir);
  medir();
})();
