(function () {
  var lamparas = Array.prototype.slice.call(document.querySelectorAll(".lampara"));
  var secciones = lamparas.map(function (l) {
    return document.getElementById(l.getAttribute("href").slice(1));
  });
  var charco = document.getElementById("charco");
  var polilla = document.getElementById("polilla");
  var cuenta = document.getElementById("cuenta");
  var nombre = document.getElementById("cuentaNombre");
  var activa = -1;

  function colocar() {
    if (!lamparas[activa]) return;
    var calle = lamparas[activa].parentNode.parentNode.getBoundingClientRect();
    var base = charco.parentNode.getBoundingClientRect();
    var centro = lamparas[activa].getBoundingClientRect().left + lamparas[activa].getBoundingClientRect().width / 2;
    var x = centro - base.left;
    charco.style.transform = "translateX(" + x.toFixed(1) + "px)";
    polilla.style.transform =
      "translate(" + (x - 21).toFixed(1) + "px, " + (calle.top - base.top + 42).toFixed(1) + "px)";
  }

  function encender(indice) {
    if (indice === activa) return;
    activa = indice;
    lamparas.forEach(function (l, i) {
      if (i < indice) l.classList.add("encendida");
      else l.classList.remove("encendida");
      if (i === indice) l.setAttribute("aria-current", "true");
      else l.removeAttribute("aria-current");
    });
    cuenta.textContent = lamparas[indice].getAttribute("data-n");
    nombre.textContent = lamparas[indice].getAttribute("data-name");
    colocar();
  }

  function medir() {
    var limite = window.innerHeight * 0.42;
    var indice = 0;
    for (var i = 0; i < secciones.length; i++) {
      var s = secciones[i];
      if (s && s.getBoundingClientRect().top - limite <= 0) indice = i;
    }
    encender(indice);
    colocar();
  }

  var listo = false;
  function pedir() {
    if (listo) return;
    listo = true;
    window.requestAnimationFrame(medir);
  }

  document.addEventListener("keydown", function (evento) {
    var enlace = evento.target.closest ? evento.target.closest(".lampara") : null;
    if (!enlace) return;
    var i = lamparas.indexOf(enlace);
    var destino = -1;
    if (evento.key === "ArrowRight" || evento.key === "ArrowDown") destino = (i + 1) % lamparas.length;
    if (evento.key === "ArrowLeft" || evento.key === "ArrowUp") destino = (i - 1 + lamparas.length) % lamparas.length;
    if (destino < 0) return;
    evento.preventDefault();
    lamparas[destino].focus();
  });

  window.addEventListener("scroll", pedir, { passive: true });
  window.addEventListener("resize", pedir);
  window.addEventListener("hashchange", pedir);
  medir();
})();
