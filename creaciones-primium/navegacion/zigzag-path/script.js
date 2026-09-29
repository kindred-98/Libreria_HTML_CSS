(function () {
  var ROMANOS = ['I', 'II', 'III', 'IV', 'V', 'VI'];
  var TITULOS = ['The Ruler', 'The Teeth', 'The Tip', 'The Smudge', 'The Fold', 'Arrival'];
  var NS = 'http://www.w3.org/2000/svg';
  var paradas = [].slice.call(document.querySelectorAll('.parada'));
  var secciones = paradas.map(function (p) { return document.getElementById(p.getAttribute('href').slice(1)); });
  var ruta = document.getElementById('ruta');
  var trazo = document.getElementById('trazo');
  var nib = document.getElementById('nib');
  var cifra = document.getElementById('cifra');
  var vivo = document.getElementById('vivo');
  var goma = document.getElementById('goma');
  var nota = document.getElementById('nota');
  var actual = -1;
  var puntos = [];
  var svg = null;
  var rojo = null;
  var largoTrazo = 0;
  var largoNodo = [];
  var andar = 0;
  var bloqueado = false;
  var sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)');

  function marcar(i) {
    paradas.forEach(function (p, k) {
      if (k === i) p.setAttribute('aria-current', 'true');
      else p.removeAttribute('aria-current');
      p.classList.toggle('is-on', k === i);
    });
    cifra.style.transform = 'translate3d(0,' + (-i * 22) + 'px,0)';
    vivo.textContent = 'Stop ' + ROMANOS[i] + ': ' + TITULOS[i] + '. ' + (i === 0
      ? 'The red reaches the first stop.'
      : 'The red has walked ' + i + (i === 1 ? ' leg' : ' legs') + ' of the route.');
  }

  function leer() {
    var lineaLectura = window.innerHeight * 0.46;
    var mejor = actual < 0 ? 0 : actual;
    var distancia = Infinity;
    for (var k = 0; k < secciones.length; k++) {
      var s = secciones[k];
      if (!s) continue;
      var r = s.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) continue;
      var d = Math.abs(r.top - lineaLectura);
      if (d < distancia) { distancia = d; mejor = k; }
    }
    irA(mejor);
  }

  var pendiente = false;
  function alDesplazar() {
    if (bloqueado) return;
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(function () { pendiente = false; leer(); });
  }

  function nodos() {
    var origen = ruta.getBoundingClientRect();
    puntos = paradas.map(function (p) {
      var n = p.querySelector('.parada__n').getBoundingClientRect();
      return { x: n.left + n.width / 2 - origen.left, y: n.top + n.height / 2 - origen.top };
    });
  }

  function giroDe(a, b) {
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 + (a.y <= b.y ? -17 : 17) };
  }

  function camino() {
    var d = 'M' + puntos[0].x.toFixed(1) + ' ' + puntos[0].y.toFixed(1);
    for (var k = 0; k < puntos.length - 1; k++) {
      var m = giroDe(puntos[k], puntos[k + 1]);
      d += ' Q' + m.x.toFixed(1) + ' ' + m.y.toFixed(1) + ' ' + puntos[k + 1].x.toFixed(1) + ' ' + puntos[k + 1].y.toFixed(1);
    }
    return d;
  }

  function largoTramo(a, m, b) {
    var px = a.x;
    var py = a.y;
    var largo = 0;
    for (var s = 1; s <= 24; s++) {
      var t = s / 24;
      var u = 1 - t;
      var x = u * u * a.x + 2 * u * t * m.x + t * t * b.x;
      var y = u * u * a.y + 2 * u * t * m.y + t * t * b.y;
      largo += Math.sqrt((x - px) * (x - px) + (y - py) * (y - py));
      px = x;
      py = y;
    }
    return largo;
  }

  function medir() {
    var acumulado = 0;
    largoNodo = [0];
    for (var k = 0; k < puntos.length - 1; k++) {
      acumulado += largoTramo(puntos[k], giroDe(puntos[k], puntos[k + 1]), puntos[k + 1]);
      largoNodo.push(acumulado);
    }
    largoTrazo = rojo.getTotalLength();
    if (acumulado > 0) {
      var factor = largoTrazo / acumulado;
      largoNodo = largoNodo.map(function (l) { return l * factor; });
    }
    if (largoTrazo < 1) largoTrazo = 1;
  }

  function pintar() {
    nodos();
    if (puntos.length < 2) return;
    var d = camino();
    if (svg) trazo.removeChild(svg);
    svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + ruta.clientWidth + ' ' + ruta.clientHeight);
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.setAttribute('class', 'ruta__svg');
    var capas = [
      ['#8d1a12', 6, '.16'],
      ['#6f6a61', 1.7, '.5'],
      ['#c62b1f', 2.6, '1']
    ];
    for (var k = 0; k < capas.length; k++) {
      var t = document.createElementNS(NS, 'path');
      t.setAttribute('d', d);
      t.setAttribute('fill', 'none');
      t.setAttribute('stroke', capas[k][0]);
      t.setAttribute('stroke-width', String(capas[k][1]));
      t.setAttribute('stroke-linecap', 'round');
      t.setAttribute('stroke-linejoin', 'round');
      t.setAttribute('opacity', capas[k][2]);
      svg.appendChild(t);
      if (k === capas.length - 1) rojo = t;
    }
    trazo.appendChild(svg);
    medir();
    rojo.style.transition = 'none';
    rojo.setAttribute('stroke-dasharray', largoTrazo + ' ' + largoTrazo);
    rojo.setAttribute('stroke-dashoffset', largoTrazo);
    requestAnimationFrame(function () { rojo.style.transition = ''; });
  }

  function ponerNib(longitud) {
    if (!rojo) return;
    var l = Math.max(0, Math.min(largoTrazo, longitud));
    var p = rojo.getPointAtLength(l);
    nib.style.transform = 'translate3d(' + p.x.toFixed(1) + 'px,' + p.y.toFixed(1) + 'px,0)';
  }

  function irA(i) {
    if (i < 0 || i >= paradas.length) return;
    actual = i;
    marcar(i);
    if (!rojo || !largoNodo.length) return;
    rojo.setAttribute('stroke-dashoffset', largoTrazo - largoNodo[i]);
    ponerNib(largoNodo[i]);
  }

  function caminar() {
    if (rojo && !sinMovimiento.matches && largoTrazo) {
      var pintado = largoTrazo - (parseFloat(rojo.getAttribute('stroke-dashoffset')) || 0);
      if (pintado > -0.6 && pintado < largoTrazo + 0.6) ponerNib(pintado);
    }
    andar = requestAnimationFrame(caminar);
  }

  paradas.forEach(function (p, k) {
    p.addEventListener('click', function () { irA(k); });
  });

  function mostrar(abierto) {
    goma.setAttribute('aria-expanded', abierto ? 'true' : 'false');
    nota.hidden = !abierto;
  }

  goma.addEventListener('click', function () {
    mostrar(goma.getAttribute('aria-expanded') !== 'true');
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (goma.getAttribute('aria-expanded') === 'true') {
      mostrar(false);
      goma.focus();
    }
  });

  window.addEventListener('scroll', alDesplazar, { passive: true });

  var espera = null;
  window.addEventListener('resize', function () {
    if (espera) clearTimeout(espera);
    espera = setTimeout(function () {
      var i = actual < 0 ? 0 : actual;
      pintar();
      irA(i);
    }, 170);
  }, { passive: true });

  pintar();
  var arranque = paradas.map(function (p) { return p.getAttribute('href'); }).indexOf('#' + (location.hash || '').slice(1));
  if (arranque >= 0) {
    bloqueado = true;
    irA(arranque);
    var soltar = function () { bloqueado = false; };
    window.addEventListener('wheel', soltar, { passive: true });
    window.addEventListener('touchstart', soltar, { passive: true });
    window.addEventListener('mousedown', soltar, { passive: true });
    window.addEventListener('keydown', soltar);
    setTimeout(soltar, 1500);
  } else { irA(0); leer(); }
  andar = requestAnimationFrame(caminar);
  window.addEventListener('beforeunload', function () { cancelAnimationFrame(andar); });
})();
