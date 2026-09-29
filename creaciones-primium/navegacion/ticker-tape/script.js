(function () {
  var tizas = Array.prototype.slice.call(document.querySelectorAll(".tiza:not(.tiza--eco)"));
  var toda = Array.prototype.slice.call(document.querySelectorAll(".tiza"));
  var secciones = tizas.map(function (t) {
    return document.getElementById(t.getAttribute("href").slice(1));
  });
  var cinta = document.getElementById("cinta");
  var desvio = document.getElementById("desvio");
  var ventana = document.getElementById("ventana");
  var cifras = document.getElementById("cifras");
  var activa = -1;
  var impresa = -1;

  function traslacion() {
    var m = window.getComputedStyle(cinta).transform;
    if (!m || m === "none") return 0;
    var numeros = m.slice(m.indexOf("(") + 1, m.indexOf(")")).split(",");
    return parseFloat(numeros[4]) || 0;
  }

  function imprimir() {
    var ancho = toda[0].getBoundingClientRect().width || 1;
    var cabeza = ventana.getBoundingClientRect().width * 0.16 - traslacion();
    var indice = Math.floor(cabeza / ancho);
    if (indice < 0) indice = 0;
    indice = indice % toda.length;
    if (indice === impresa) return;
    impresa = indice;
    for (var i = 0; i < toda.length; i++) {
      if (i === indice) toda[i].classList.add("imprimiendo");
      else toda[i].classList.remove("imprimiendo");
    }
  }

  function paso() {
    imprimir();
    window.requestAnimationFrame(paso);
  }

  function fijar(indice) {
    if (indice === activa) return;
    activa = indice;
    tizas.forEach(function (t, i) {
      if (i === indice) t.setAttribute("aria-current", "true");
      else t.removeAttribute("aria-current");
    });
    cifras.textContent = tizas[indice].getAttribute("data-no");
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

  function alEnfocar(evento) {
    var enlace = evento.target.closest ? evento.target.closest(".tiza") : null;
    if (!enlace || enlace.classList.contains("tiza--eco")) return;
    var indice = tizas.indexOf(enlace);
    if (indice < 0) return;
    var ancho = toda[0].getBoundingClientRect().width || 1;
    var cabeza = ventana.getBoundingClientRect().width * (window.innerWidth <= 520 ? 0.2 : 0.16);
    desvio.style.setProperty("--desvio", (indice * ancho + ancho / 2 - cabeza).toFixed(2) + "px");
  }

  function alPerderFoco() {
    window.setTimeout(function () {
      var dentro = document.activeElement && document.activeElement.closest && document.activeElement.closest(".cinta-nav");
      if (!dentro) desvio.style.setProperty("--desvio", "0px");
    }, 80);
  }

  window.addEventListener("scroll", pedir, { passive: true });
  window.addEventListener("resize", pedir);
  window.addEventListener("hashchange", pedir);
  document.addEventListener("focusin", alEnfocar);
  document.addEventListener("focusout", alPerderFoco);

  medir();
  window.requestAnimationFrame(paso);
})();
