(function () {
  var ROMANOS = ['I', 'II', 'III', 'IV', 'V', 'VI'];
  var capas = Array.prototype.slice.call(document.querySelectorAll('.capa'));
  var secciones = capas.map(function (c) { return document.getElementById(c.getAttribute('href').slice(1)); });
  var lineal = document.getElementById('lineal');
  var micra = document.getElementById('micra');
  var salidaNum = document.getElementById('salidaNum');
  var salidaTit = document.getElementById('salidaTit');
  var boton = document.getElementById('boton');
  var nota = document.getElementById('nota');
  var actual = -1;

  function sacar(i) {
    if (i < 0 || i >= capas.length) return;
    actual = i;
    capas.forEach(function (c, k) {
      if (k === i) c.setAttribute('aria-current', 'true');
      else c.removeAttribute('aria-current');
      c.classList.toggle('is-on', k === i);
    });
    lineal.style.transform = 'translate3d(0,' + (-i * 22) + 'px,0)';
    var desvio = (0.04 + i * 0.11).toFixed(2);
    micra.textContent = 'Cyan +0.00 mm · key out ' + desvio + ' mm';
    salidaNum.textContent = ROMANOS[i];
    salidaTit.textContent = capas[i].querySelector('.capa__tit').textContent;
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
    sacar(mejor);
  }

  var pendiente = false;
  function alDesplazar() {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(function () { pendiente = false; leer(); });
  }

  capas.forEach(function (c, k) {
    c.addEventListener('click', function () { sacar(k); });
  });

  function mostrar(abierto) {
    boton.setAttribute('aria-expanded', abierto ? 'true' : 'false');
    nota.hidden = !abierto;
  }

  boton.addEventListener('click', function () {
    mostrar(boton.getAttribute('aria-expanded') !== 'true');
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (boton.getAttribute('aria-expanded') === 'true') {
      mostrar(false);
      boton.focus();
    }
  });

  window.addEventListener('scroll', alDesplazar, { passive: true });
  window.addEventListener('resize', alDesplazar, { passive: true });

  var arranque = capas.map(function (c) { return c.getAttribute('href'); }).indexOf('#' + (location.hash || '').slice(1));
  if (arranque >= 0) sacar(arranque); else { sacar(0); leer(); }
})();
