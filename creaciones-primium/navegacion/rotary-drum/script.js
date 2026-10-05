(function () {
  var fichas = Array.prototype.slice.call(document.querySelectorAll(".ficha"));
  var secciones = fichas.map(function (f) {
    return document.getElementById(f.getAttribute("href").slice(1));
  });
  var tambor = document.getElementById("tambor");
  var punta = document.querySelector(".indice__punta");
  var numero = document.getElementById("aviso");
  var texto = document.getElementById("avisoTexto");
  var activa = -1;

  function girar(indice) {
    tambor.style.setProperty("--giro", (-indice * 60).toFixed(1) + "deg");
    punta.style.setProperty("--giro", (indice * 60).toFixed(1) + "deg");
  }

  function fijar(indice) {
    if (indice === activa) return;
    activa = indice;
    fichas.forEach(function (f, i) {
      if (i === indice) f.setAttribute("aria-current", "true");
      else f.removeAttribute("aria-current");
    });
    numero.textContent = fichas[indice].dataset.n;
    texto.textContent = fichas[indice].dataset.nombre;
    girar(indice);
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
    var enlace = evento.target.closest ? evento.target.closest(".ficha") : null;
    if (!enlace) return;
    var i = fichas.indexOf(enlace);
    var destino = -1;
    if (evento.key === "ArrowRight" || evento.key === "ArrowDown") destino = (i + 1) % fichas.length;
    if (evento.key === "ArrowLeft" || evento.key === "ArrowUp") destino = (i - 1 + fichas.length) % fichas.length;
    if (destino < 0) return;
    evento.preventDefault();
    fijar(destino);
    fichas[destino].focus();
  });

  document.addEventListener("focusin", function (evento) {
    var enlace = evento.target.closest ? evento.target.closest(".ficha") : null;
    if (!enlace) return;
    var indice = fichas.indexOf(enlace);
    if (indice < 0 || indice === activa) return;
    activa = indice;
    fichas.forEach(function (f, i) {
      if (i === indice) f.setAttribute("aria-current", "true");
      else f.removeAttribute("aria-current");
    });
    numero.textContent = fichas[indice].dataset.n;
    texto.textContent = fichas[indice].dataset.nombre;
    girar(indice);
  });

  window.addEventListener("scroll", pedir, { passive: true });
  window.addEventListener("resize", pedir);
  window.addEventListener("hashchange", pedir);
  medir();
})();
