(function () {
  var rayas = Array.prototype.slice.call(document.querySelectorAll(".raya"));
  var secciones = rayas.map(function (r) {
    return document.getElementById(r.getAttribute("href").slice(1));
  });
  var barra = document.getElementById("bordeBarra");
  var peaton = document.getElementById("peaton");
  var fase = document.getElementById("fase");
  var nombre = document.getElementById("faseNombre");
  var activa = -1;
  var ancho = 0;

  function colocar() {
    if (!peaton || !rayas[activa]) return;
    var caja = peaton.parentNode.getBoundingClientRect();
    var raya = rayas[activa].getBoundingClientRect();
    ancho = caja.width - peaton.offsetWidth;
    var centro = raya.left + raya.width / 2 - caja.left - peaton.offsetWidth / 2;
    if (ancho <= 0) return;
    peaton.style.transform =
      "translateX(" + Math.max(0, Math.min(ancho, centro)).toFixed(1) + "px)";
  }

  function fijar(indice) {
    if (indice === activa) return;
    activa = indice;
    rayas.forEach(function (r, i) {
      if (i === indice) r.setAttribute("aria-current", "true");
      else r.removeAttribute("aria-current");
    });
    barra.style.width = (((indice + 1) / rayas.length) * 100).toFixed(2) + "%";
    fase.textContent = rayas[indice].dataset.n;
    nombre.textContent = rayas[indice].dataset.name;
    colocar();
  }

  function medir() {
    var limite = window.innerHeight * 0.42;
    var indice = 0;
    for (var i = 0; i < secciones.length; i++) {
      var s = secciones[i];
      if (s && s.getBoundingClientRect().top - limite <= 0) indice = i;
    }
    fijar(indice);
    colocar();
  }

  var listo = false;
  function pedir() {
    if (listo) return;
    listo = true;
    window.requestAnimationFrame(medir);
  }

  var btn = document.getElementById("cajaBtn");
  var caja = document.getElementById("caja");

  function abrir(estado) {
    btn.setAttribute("aria-expanded", estado ? "true" : "false");
    caja.hidden = !estado;
  }

  btn.addEventListener("click", function () {
    abrir(btn.getAttribute("aria-expanded") !== "true");
  });

  document.addEventListener("keydown", function (evento) {
    if (evento.key === "Escape" && btn.getAttribute("aria-expanded") === "true") {
      abrir(false);
      btn.focus();
      return;
    }
    var enlace = evento.target.closest ? evento.target.closest(".raya") : null;
    if (!enlace) return;
    var i = rayas.indexOf(enlace);
    var destino = -1;
    if (evento.key === "ArrowRight" || evento.key === "ArrowDown") destino = (i + 1) % rayas.length;
    if (evento.key === "ArrowLeft" || evento.key === "ArrowUp") destino = (i - 1 + rayas.length) % rayas.length;
    if (destino < 0) return;
    evento.preventDefault();
    rayas[destino].focus();
  });

  window.addEventListener("scroll", pedir, { passive: true });
  window.addEventListener("resize", pedir);
  window.addEventListener("hashchange", pedir);
  medir();
})();
