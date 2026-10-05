(function () {
  var NOMBRES = ['I', 'II', 'III', 'IV', 'V', 'VI'];
  var TITULOS = ['The Oil', 'The Pitch', 'The Train', 'The Key', 'The Wear', 'The Stop'];
  var ruedas = Array.prototype.slice.call(document.querySelectorAll('.wheel'));
  var secciones = ruedas.map(function (r) { return document.getElementById(r.getAttribute('href').slice(1)); });
  var tambor = document.getElementById('strip');
  var aceite = document.getElementById('fill');
  var vivo = document.getElementById('live');
  var palanca = document.getElementById('lever');
  var placa = document.getElementById('placa');
  var actual = -1;

  function elegir(i) {
    if (i < 0 || i >= ruedas.length) return;
    actual = i;
    ruedas.forEach(function (r, k) {
      var enlace = k === i;
      if (enlace) r.setAttribute('aria-current', 'true');
      else r.removeAttribute('aria-current');
      r.classList.toggle('is-drive', enlace);
      r.classList.toggle('is-drag', !enlace && (k === i - 1 || k === i + 1));
    });
    tambor.style.transform = 'translate3d(0,' + (-i * 22) + 'px,0)';
    aceite.style.height = (12 + i * 17.6) + '%';
    vivo.textContent = 'Keyed to the shaft: wheel ' + NOMBRES[i] + ', ' + TITULOS[i] + '.';
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
    elegir(mejor);
  }

  var pendiente = false;
  function alDesplazar() {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(function () { pendiente = false; leer(); });
  }

  ruedas.forEach(function (r, k) {
    r.addEventListener('click', function () { elegir(k); });
  });

  function mostrar(abierto) {
    palanca.setAttribute('aria-expanded', abierto ? 'true' : 'false');
    placa.hidden = !abierto;
  }

  palanca.addEventListener('click', function () {
    mostrar(palanca.getAttribute('aria-expanded') !== 'true');
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (palanca.getAttribute('aria-expanded') === 'true') {
      mostrar(false);
      palanca.focus();
    }
  });

  window.addEventListener('scroll', alDesplazar, { passive: true });
  window.addEventListener('resize', alDesplazar, { passive: true });

  var arranque = ruedas.map(function (r) { return r.getAttribute('href'); }).indexOf('#' + (location.hash || '').slice(1));
  if (arranque >= 0) elegir(arranque); else { elegir(0); leer(); }
})();
