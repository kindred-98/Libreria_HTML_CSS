(function () {
  var ROMANOS = ['I', 'II', 'III', 'IV', 'V', 'VI'];
  var TITULOS = ['The Stock', 'The Grain', 'The Face', 'The Inks', 'The Index', 'The Turn'];
  var TINTAS = ['oxblood', 'teal'];
  var fichas = [].slice.call(document.querySelectorAll('.ficha'));
  var secciones = fichas.map(function (f) { return document.getElementById(f.getAttribute('href').slice(1)); });
  var tira = document.getElementById('tira');
  var vivo = document.getElementById('vivo');
  var fichero = document.querySelector('.fichero');
  var boton = document.getElementById('mano');
  var leyenda = document.getElementById('leyenda');
  var actual = -1;

  function sacar(i) {
    if (i < 0 || i >= fichas.length) return;
    actual = i;
    fichas.forEach(function (f, k) {
      if (k === i) f.setAttribute('aria-current', 'true');
      else f.removeAttribute('aria-current');
      f.classList.toggle('is-on', k === i);
    });
    tira.style.transform = 'translate3d(0,' + (-i * 22) + 'px,0)';
    vivo.textContent = 'Card ' + ROMANOS[i] + ' is up: ' + TITULOS[i] + ', printed in ' + TINTAS[i % 2] + '.';
  }

  function leer() {
    var linea = window.innerHeight * 0.46;
    var mejor = actual < 0 ? 0 : actual;
    var distancia = Infinity;
    for (var k = 0; k < secciones.length; k++) {
      var s = secciones[k];
      if (!s) continue;
      var r = s.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) continue;
      var d = Math.abs(r.top - linea);
      if (d < distancia) { distancia = d; mejor = k; }
    }
    sacar(mejor);
  }

  var pendiente = false;
  function alDesplazar() {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(function () { pendiente = false; leer(); });
  }

  fichas.forEach(function (f, k) {
    f.addEventListener('click', function () { sacar(k); });
  });

  function extender(abierto) {
    boton.setAttribute('aria-expanded', abierto ? 'true' : 'false');
    fichero.setAttribute('data-abierta', abierto ? 'si' : 'no');
    leyenda.hidden = !abierto;
  }

  boton.addEventListener('click', function () {
    extender(boton.getAttribute('aria-expanded') !== 'true');
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (boton.getAttribute('aria-expanded') === 'true') {
      extender(false);
      boton.focus();
    }
  });

  window.addEventListener('scroll', alDesplazar, { passive: true });
  window.addEventListener('resize', alDesplazar, { passive: true });

  fichero.setAttribute('data-abierta', 'no');
  var arranque = fichas.map(function (f) { return f.getAttribute('href'); }).indexOf('#' + (location.hash || '').slice(1));
  if (arranque >= 0) sacar(arranque); else { sacar(0); leer(); }
})();
