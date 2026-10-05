(function () {
  var campos = Array.prototype.slice.call(document.querySelectorAll(".campo"));
  var secciones = campos.map(function (c) {
    return document.getElementById(c.getAttribute("href").slice(1));
  });
  var taladros = Array.prototype.slice.call(document.querySelectorAll(".taladro"));
  var tarjeta = document.getElementById("tarjeta");
  var punzon = document.getElementById("punzon");
  var contador = document.getElementById("contadorNum");
  var boton = document.getElementById("manualBoton");
  var cuerpo = document.getElementById("manualCuerpo");
  var activa = -1;
  var cajas = [];

  function colocar() {
    var marco = tarjeta.getBoundingClientRect();
    cajas = [];
    for (var i = 0; i < campos.length; i++) {
      var hueco = campos[i].querySelector(".campo__huecos").getBoundingClientRect();
      var centro = hueco.left - marco.left + hueco.width / 2;
      cajas.push({
        x: centro,
        arriba: hueco.top - marco.top,
        alto: hueco.height,
        ancho: hueco.width
      });
      taladros[i].style.left = (hueco.left - marco.left) + "px";
      taladros[i].style.top = (hueco.top - marco.top) + "px";
      taladros[i].style.width = hueco.width + "px";
      taladros[i].style.height = hueco.height + "px";
    }
  }

  function taladrar(indice) {
    if (indice === activa) return;
    activa = indice;
    campos.forEach(function (c, i) {
      if (i === indice) c.setAttribute("aria-current", "true");
      else c.removeAttribute("aria-current");
    });
    contador.textContent = campos[indice].dataset.col;
    taladros.forEach(function (t, i) {
      if (i <= indice) t.classList.add("lleno");
      else t.classList.remove("lleno");
    });
    var zona = cajas[indice];
    if (zona) {
      punzon.style.setProperty("--x", zona.x.toFixed(1) + "px");
      punzon.classList.remove("taladrando");
      punzon.getBoundingClientRect();
      punzon.classList.add("taladrando");
    }
  }

  function medir() {
    var limite = window.innerHeight * 0.38;
    var indice = 0;
    for (var i = 0; i < secciones.length; i++) {
      var s = secciones[i];
      if (s && s.getBoundingClientRect().top - limite <= 0) indice = i;
    }
    taladrar(indice);
  }

  var listo = false;
  function pedir() {
    if (listo) return;
    listo = true;
    window.requestAnimationFrame(medir);
  }

  function alternarManual(abrir) {
    var estado = boton.getAttribute("aria-expanded") === "true";
    if (abrir === undefined) abrir = !estado;
    boton.setAttribute("aria-expanded", abrir ? "true" : "false");
    cuerpo.hidden = !abrir;
  }

  window.addEventListener("scroll", pedir, { passive: true });
  window.addEventListener("hashchange", pedir);
  window.addEventListener("resize", function () {
    colocar();
    pedir();
  });
  boton.addEventListener("click", function () { alternarManual(); });
  document.addEventListener("keydown", function (evento) {
    if (evento.key === "Escape" && boton.getAttribute("aria-expanded") === "true") {
      alternarManual(false);
      boton.focus();
    }
  });

  colocar();
  medir();
  window.addEventListener("load", colocar);
})();
