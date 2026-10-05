(function () {
  var ROMANOS = ['I', 'II', 'III', 'IV', 'V', 'VI'];
  var TITULOS = ['The Ring', 'The Wheel', 'The Drive', 'The Pencil', 'The Paper', 'The Close'];
  var CICLO = 5400;
  var CIERRE = 4600;
  var sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)');
  var agujeros = Array.prototype.slice.call(document.querySelectorAll('.perforacion'));
  var secciones = agujeros.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  var trazador = document.getElementById('trazador');
  var aguja = document.getElementById('aguja');
  var tinta = document.getElementById('tinta');
  var ventana = document.getElementById('ventana');
  var vivo = document.getElementById('vivo');
  var curvas = document.getElementById('curvas');
  var llave = document.getElementById('llave');
  var ficha = document.getElementById('ficha');
  var actual = -1;
  var fase = 0;
  var ultima = 0;
  var cuenta = 1;
  var reloj = null;
  var cerrado = false;

  function colocar(bruto) {
    tinta.style.transform = 'rotate(' + (bruto * 360).toFixed(2) + 'deg)';
  }

  function poner(i) {
    if (i < 0 || i >= agujeros.length) return;
    actual = i;
    agujeros.forEach(function (a, k) {
      if (k === i) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
      a.classList.toggle('is-on', k === i);
    });
    aguja.style.transform = 'rotate(' + (i * 60) + 'deg)';
    ventana.style.transform = 'translate3d(0,' + (-i * 22) + 'px,0)';
    vivo.textContent = 'The pen is in hole ' + ROMANOS[i] + ', ' + TITULOS[i] + '. Curve ' + cuenta + ' is being drawn.';
  }

  function leer() {
    var linea = window.innerHeight * 0.46;
    var mejor = Math.max(actual, 0);
    var distancia = Infinity;
    for (var k = 0; k < secciones.length; k++) {
      var s = secciones[k];
      if (!s) continue;
      var r = s.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) continue;
      var d = Math.abs(r.top - linea);
      if (d < distancia) { distancia = d; mejor = k; }
    }
    poner(mejor);
  }

  var pendiente = false;
  function alDesplazar() {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(function () { pendiente = false; leer(); });
  }

  function cerrar() {
    cuenta = cuenta >= 999 ? 1 : cuenta + 1;
    curvas.textContent = String(cuenta);
    var i = Math.max(actual, 0);
    vivo.textContent = 'Curve ' + (cuenta - 1) + ' is closed. The pen is in hole ' +
      ROMANOS[i] + ', ' + TITULOS[i] + '. Curve ' + cuenta + ' begins.';
    cerrado = true;
    ventana.style.transition = 'transform 90ms ease-out';
    ventana.style.transform = 'translate3d(0,' + (-i * 22 - 3) + 'px,0)';
  }

  function tic(t) {
    if (sinMovimiento.matches) {
      reloj = requestAnimationFrame(tic);
      return;
    }
    if (ultima === 0) ultima = t;
    var dt = Math.min(64, t - ultima);
    ultima = t;
    fase = (fase + dt) % CICLO;
    if (fase >= CIERRE) cerrar();
    if (cerrado && fase < 520) {
      delete trazador.dataset.cierra;
      cerrado = false;
      ventana.style.transition = 'transform 420ms cubic-bezier(.2,.82,.16,1)';
    }
    colocar(fase / CIERRE);
    reloj = requestAnimationFrame(tic);
  }

  agujeros.forEach(function (a, k) {
    a.addEventListener('click', function () { poner(k); });
  });

  function mostrar(abierto) {
    llave.setAttribute('aria-expanded', abierto ? 'true' : 'false');
    ficha.hidden = !abierto;
    ventana.style.transition = 'transform 720ms cubic-bezier(.2,.82,.16,1)';
  }

  llave.addEventListener('click', function () {
    mostrar(llave.getAttribute('aria-expanded') !== 'true');
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (llave.getAttribute('aria-expanded') === 'true') {
      mostrar(false);
      llave.focus();
    }
  });

  window.addEventListener('scroll', alDesplazar, { passive: true });
  window.addEventListener('resize', alDesplazar, { passive: true });

  var arranque = agujeros.map(function (a) { return a.getAttribute('href'); }).indexOf('#' + (location.hash || '').slice(1));
  if (arranque >= 0) poner(arranque); else { poner(0); leer(); }
  reloj = requestAnimationFrame(tic);
  window.addEventListener('beforeunload', function () { cancelAnimationFrame(reloj); });
})();
