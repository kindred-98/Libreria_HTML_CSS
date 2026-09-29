(function () {
  var losas = Array.prototype.slice.call(document.querySelectorAll(".losa"));
  var secciones = losas.map(function (l) {
    return document.getElementById(l.getAttribute("href").slice(1));
  });
  var barra = document.getElementById("juntaBarra");
  var cuenta = document.getElementById("cuenta");
  var nombre = document.getElementById("cuentaNombre");
  var activa = -1;

  function fijar(indice) {
    if (indice === activa) return;
    activa = indice;
    losas.forEach(function (l, i) {
      if (i === indice) l.setAttribute("aria-current", "true");
      else l.removeAttribute("aria-current");
    });
    barra.style.width = (((indice + 1) / losas.length) * 100).toFixed(2) + "%";
    cuenta.textContent = losas[indice].getAttribute("data-i");
    nombre.textContent = losas[indice].getAttribute("data-name");
  }

  function medir() {
    var limite = window.innerHeight * 0.42;
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

  document.addEventListener("keydown", function (evento) {
    var enlace = evento.target.closest ? evento.target.closest(".losa") : null;
    if (!enlace) return;
    var i = losas.indexOf(enlace);
    var destino = -1;
    if (evento.key === "ArrowRight" || evento.key === "ArrowDown") destino = (i + 1) % losas.length;
    if (evento.key === "ArrowLeft" || evento.key === "ArrowUp") destino = (i - 1 + losas.length) % losas.length;
    if (destino < 0) return;
    evento.preventDefault();
    losas[destino].focus();
  });

  window.addEventListener("scroll", pedir, { passive: true });
  window.addEventListener("resize", pedir);
  window.addEventListener("hashchange", pedir);
  medir();
})();
