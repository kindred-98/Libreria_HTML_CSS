(function () {
  var lamparas = Array.prototype.slice.call(document.querySelectorAll(".lampara"));
  var secciones = lamparas.map(function (l) {
    return document.getElementById(l.getAttribute("href").slice(1));
  });
  var luz = document.getElementById("rielLuz");
  var numero = document.getElementById("senal");
  var nombre = document.getElementById("senalNombre");
  var activa = -1;
  var clic = null;

  function fazer(el) {
    if (!clic) return;
    el.classList.remove("pulsando");
    el.getBoundingClientRect();
    el.classList.add("pulsando");
    window.clearTimeout(clic);
    clic = window.setTimeout(function () {
      if (el.classList.contains("pulsando")) el.classList.remove("pulsando");
    }, 320);
  }

  function fijar(indice) {
    if (indice === activa) return;
    activa = indice;
    lamparas.forEach(function (l, i) {
      if (i === indice) l.setAttribute("aria-current", "true");
      else l.removeAttribute("aria-current");
    });
    luz.style.width = (((indice + 1) / lamparas.length) * 100).toFixed(2) + "%";
    numero.textContent = lamparas[indice].dataset.s;
    nombre.textContent = lamparas[indice].dataset.nombre;
    fazer(lamparas[indice]);
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
