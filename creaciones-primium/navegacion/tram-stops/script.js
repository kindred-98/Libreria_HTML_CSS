(function () {
  var postes = Array.prototype.slice.call(document.querySelectorAll(".poste"));
  var secciones = postes.map(function (p) {
    return document.getElementById(p.getAttribute("href").slice(1));
  });
  var barra = document.getElementById("rutaBarra");
  var cuenta = document.getElementById("cuenta");
  var nombre = document.getElementById("cuentaNombre");
  var encendidos = -1;

  function encender(indice) {
    if (indice === encendidos) return;
    encendidos = indice;
    postes.forEach(function (p, i) {
      if (i < indice) p.classList.add("encendida");
      else p.classList.remove("encendida");
      if (i === indice) p.setAttribute("aria-current", "true");
      else p.removeAttribute("aria-current");
    });
    barra.style.width = (((indice + 1) / postes.length) * 100).toFixed(2) + "%";
    cuenta.textContent = postes[indice].dataset.n;
    nombre.textContent = postes[indice].dataset.name;
  }

  function medir() {
    var limite = window.innerHeight * 0.42;
    var indice = 0;
    for (var i = 0; i < secciones.length; i++) {
      var s = secciones[i];
      if (s && s.getBoundingClientRect().top - limite <= 0) indice = i;
    }
    encender(indice);
  }

  var listo = false;
  function pedir() {
    if (listo) return;
    listo = true;
    window.requestAnimationFrame(medir);
  }

  document.addEventListener("keydown", function (evento) {
    var enlace = evento.target.closest ? evento.target.closest(".poste") : null;
    if (!enlace) return;
    var i = postes.indexOf(enlace);
    var destino = -1;
    if (evento.key === "ArrowRight" || evento.key === "ArrowDown") destino = (i + 1) % postes.length;
    if (evento.key === "ArrowLeft" || evento.key === "ArrowUp") destino = (i - 1 + postes.length) % postes.length;
    if (destino < 0) return;
    evento.preventDefault();
    postes[destino].focus();
  });

  window.addEventListener("scroll", pedir, { passive: true });
  window.addEventListener("resize", pedir);
  window.addEventListener("hashchange", pedir);
  medir();
})();
