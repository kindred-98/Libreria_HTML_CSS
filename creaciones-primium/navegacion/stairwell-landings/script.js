(function () {
  var rellanos = Array.prototype.slice.call(document.querySelectorAll(".rellano"));
  var secciones = rellanos.map(function (r) {
    return document.getElementById(r.getAttribute("href").slice(1));
  });
  var haz = document.getElementById("hazLuz");
  var barra = document.getElementById("huellaBarra");
  var cuenta = document.getElementById("cuenta");
  var nombre = document.getElementById("cuentaNombre");
  var iluminado = -1;

  function iluminar(indice) {
    if (indice === iluminado) return;
    iluminado = indice;
    rellanos.forEach(function (r, i) {
      if (i === indice) r.setAttribute("aria-current", "true");
      else r.removeAttribute("aria-current");
    });
    barra.style.width = (((indice + 1) / rellanos.length) * 100).toFixed(2) + "%";
    cuenta.textContent = rellanos[indice].getAttribute("data-n");
    nombre.textContent = rellanos[indice].getAttribute("data-name");
    caer(indice);
  }

  function caer(indice) {
    if (!haz || !rellanos[indice]) return;
    var pozo = haz.parentNode.getBoundingClientRect();
    var base = rellanos[indice].getBoundingClientRect();
    var alto = haz.offsetHeight;
    var y = base.bottom - pozo.top - alto;
    haz.style.transform = "translateY(" + Math.min(0, y).toFixed(1) + "px)";
  }

  function medir() {
    var limite = window.innerHeight * 0.42;
    var indice = 0;
    for (var i = 0; i < secciones.length; i++) {
      var s = secciones[i];
      if (s && s.getBoundingClientRect().top - limite <= 0) indice = i;
    }
    iluminar(indice);
    caer(indice);
  }

  var listo = false;
  function pedir() {
    if (listo) return;
    listo = true;
    window.requestAnimationFrame(medir);
  }

  document.addEventListener("keydown", function (evento) {
    var enlace = evento.target.closest ? evento.target.closest(".rellano") : null;
    if (!enlace) return;
    var i = rellanos.indexOf(enlace);
    var destino = -1;
    if (evento.key === "ArrowRight" || evento.key === "ArrowDown") destino = (i + 1) % rellanos.length;
    if (evento.key === "ArrowLeft" || evento.key === "ArrowUp") destino = (i - 1 + rellanos.length) % rellanos.length;
    if (destino < 0) return;
    evento.preventDefault();
    rellanos[destino].focus();
  });

  window.addEventListener("scroll", pedir, { passive: true });
  window.addEventListener("resize", pedir);
  window.addEventListener("hashchange", pedir);
  medir();
})();
