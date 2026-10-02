(function () {
  var INDEX = [
    { href: '#people', t: 'Directorio de personas', p: 'Intranet › Personas', g: 'Personas', s: 'Extensiones, plantas y horarios declarados de las doscientas personas de la casa.', k: 'directorio personas extensiones telefono centralita rr hh recurso' },
    { href: '#people', t: 'Mi ficha y mis horarios', p: 'Intranet › Personas › Ficha', g: 'Personas', s: 'Dónde se editan los datos de contacto, el horario y la extensión de una persona.', k: 'ficha horario contacto editar extension propia' },
    { href: '#people', t: 'Organigrama por áreas', p: 'Intranet › Personas › Estructura', g: 'Personas', s: 'Las ocho áreas de la compañía y quién las dirige, con responsables de equipo.', k: 'organigrama areas estructura responsables jefe equipo' },
    { href: '#projects', t: 'Cartera de proyectos', p: 'Intranet › Proyectos', g: 'Proyectos', s: 'Los once proyectos abiertos con presupuesto, calendario y riesgo en tres colores.', k: 'proyectos cartera presupuesto calendario riesgo estado' },
    { href: '#projects', t: 'Actas de reunión', p: 'Intranet › Proyectos › actas', g: 'Proyectos', s: 'Acta mensual obligatoria: sin papel el proyecto baja de categoría solo.', k: 'acta reunion minutes seguimiento Categoría bajar' },
    { href: '#projects', t: 'Presupuestos y costes', p: 'Intranet › Proyectos › Costes', g: 'Proyectos', s: 'Consumo frente a presupuesto por proyecto, actualizado cada primer lunes.', k: 'presupuesto costes consumo desviacion euros contabilidad' },
    { href: '#docs', t: 'Documentos vigentes', p: 'Intranet › Documentación', g: 'Documentación', s: 'Mil cuatrocientos documentos con responsable, revisión y copia vigente marcada.', k: 'documentos vigentes copia pdf normativa procedimiento' },
    { href: '#docs', t: 'Copias obsoletas', p: 'Intranet › Documentación › Obsoletas', g: 'Documentación', s: 'Lo que se conserva por auditoría y ya no vale para trabajar.', k: 'obsoleto caducado aviso historico auditoria' },
    { href: '#docs', t: 'Normas de nombres de archivo', p: 'Intranet › Documentación › Normas', g: 'Documentación', s: 'Año, área y número. Sin palabras inventadas ni fechas en el título.', k: 'nombres archivo convencion nomenclatura titulo' },
    { href: '#systems', t: 'Catálogo de sistemas', p: 'Intranet › Sistemas', g: 'Sistemas', s: 'ERP, intranet, almacén de ficheros y once herramientas con responsable y datos.', k: 'sistemas catalogo erp intranet ficheros herramientas' },
    { href: '#systems', t: 'Altas de acceso', p: 'Intranet › Sistemas › Accesos', g: 'Sistemas', s: 'Solicitud en dos niveles, concedida durante un año y caducada después.', k: 'acceso altas permisos credenciales caducidad usuario' },
    { href: '#systems', t: 'Copias de seguridad', p: 'Intranet › Sistemas › Continuidad', g: 'Sistemas', s: 'Qué se copia cada noche, cuánto se conserva y quién lo comprueba.', k: 'backup copia seguridad retencion continuidad灾难' },
    { href: '#training', t: 'Cursos de seguridad', p: 'Intranet › Formación › Seguridad', g: 'Formación', s: 'Obligatorios, con fecha de caducidad por persona y aviso treinta días antes.', k: 'cursos seguridad obligatorios caducidad formacion' },
    { href: '#training', t: 'Calendario de talleres', p: 'Intranet › Formación › Talleres', g: 'Formación', s: 'Media hora de teoría y media hora de práctica con la máquina delante.', k: 'talleres calendario imparticionformacion practice theory' },
    { href: '#training', t: 'Mi expediente de horas', p: 'Intranet › Formación › Expediente', g: 'Formación', s: 'Horas impartidas y pendientes por persona, con el histórico completo.', k: 'expediente horas impartidas pendientes formacion horas' },
    { href: '#facilities', t: 'Reserva de salas', p: 'Intranet › Instalaciones › Salas', g: 'Instalaciones', s: 'Aulas y salas desde el móvil, con liberación automática a los quince minutos.', k: 'salas reserva reuniones aula.release releasing movil' },
    { href: '#facilities', t: 'Incidencias de las instalaciones', p: 'Intranet › Instalaciones › Avisos', g: 'Instalaciones', s: 'Persianas, aire, luz de la nave y agua caliente, ordenados por días sin resolver.', k: 'incidencias avisos persiana aire luz agua mantenimiento' },
    { href: '#facilities', t: 'Comedores y horarios', p: 'Intranet › Instalaciones › Comedores', g: 'Instalaciones', s: 'Los dos comedores, sus horarios y el menú de la semana en curso.', k: 'comedor horarios menu cafeteria comida' },
    { href: '#security', t: 'Avisos de evacuación', p: 'Intranet › Seguridad › Evacuación', g: 'Seguridad', s: 'La salida de la nave de carga es la del fondo, nunca la puerta principal.', k: 'evacuacion alarma salida incendio emergencia evacuacion' },
    { href: '#security', t: 'Registro de riesgos', p: 'Intranet › Seguridad › Riesgos', g: 'Seguridad', s: 'Riesgos por zona, con la medida asociada y quién la ha reducido.', k: 'riesgos prevencion seguridad zona medida' },
    { href: '#security', t: 'Canal de incidentes', p: 'Intranet › Seguridad › Incidentes', g: 'Seguridad', s: 'Cinco campos obligatorios: dónde, cuándo, qué, quién y qué se ha hecho ya.', k: 'incidentes aviso accidents reportar accidents seg' },
    { href: '#support', t: 'Abrir un ticket', p: 'Intranet › Soporte TI › Tickets', g: 'Soporte TI', s: 'Tres niveles y un teléfono que descuelga una persona. Numeración por año.', k: 'ticket soporte ti incidencia numero abrir reportar' },
    { href: '#support', t: 'Tiempos de respuesta', p: 'Intranet › Soporte TI › Estadísticas', g: 'Soporte TI', s: 'Once minutos de respuesta media y dos días de cierre real, publicados los lunes.', k: 'tiempos respuesta cierre estadisticas lunes nivel' },
    { href: '#support', t: 'Inventario de equipos', p: 'Intranet › Soporte TI › Equipos', g: 'Soporte TI', s: 'Portátiles, monitores y permisos de un puesto, con su número de serie.', k: 'equipos portatil monitor serie permisos puesto inventario' }
  ];

  var GROUPS = ['Personas', 'Proyectos', 'Documentación', 'Sistemas', 'Formación', 'Instalaciones', 'Seguridad', 'Soporte TI'];

  var form = document.getElementById('form');
  var input = document.getElementById('q');
  var tray = document.getElementById('tray');
  var body = document.getElementById('body');
  var lab = document.getElementById('lab');
  var count = document.getElementById('count');
  var clear = document.getElementById('clear');
  var help = document.getElementById('help');
  var pop = document.getElementById('helpPop');
  var history = [];

  // El resultado se inyecta en html (innerHTML), a veces dentro de un atributo
  // entrecomillado: data-q="..." . Sin escapar las comillas, quien escribe en el
  // buscador cierra el atributo y se añade el suyo (onmouseover). & va el
  // primero; si no, se escaparia dos veces lo que despues generan las demas.
  function esc(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function mark(text, words) {
    var out = esc(text);
    words.forEach(function (w) {
      if (w.length < 2) return;
      var re = new RegExp('(' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
      out = out.replace(re, '<mark>$1</mark>');
    });
    return out;
  }

  function links() {
    return [].slice.call(body.querySelectorAll('a'));
  }

  function openTray() {
    tray.classList.add('is-open');
    input.setAttribute('aria-expanded', 'true');
  }

  function closeTray(refocus) {
    tray.classList.remove('is-open');
    input.setAttribute('aria-expanded', 'false');
    if (refocus) input.focus();
  }

  function renderIdle() {
    lab.textContent = history.length ? 'Consultas recientes' : 'Destinos frecuentes';
    var html = '';
    if (history.length) {
      html += '<section class="grp"><h2 class="grp__t">Consultas de esta sesión <b>' + history.length + '</b></h2><ul class="hist">';
      history.forEach(function (h) {
        html += '<li><button type="button" data-q="' + esc(h) + '">' + esc(h) + '</button></li>';
      });
      html += '</ul><button class="tray__wipe" type="button" id="wipe">Borrar historial</button></section>';
    }
    html += '<section class="grp"><h2 class="grp__t">Áreas de la intranet <b>' + GROUPS.length + '</b></h2><ul class="res">';
    GROUPS.forEach(function (g) {
      var first = INDEX.filter(function (it) { return it.g === g; })[0];
      html += '<li><a href="' + first.href + '"><span class="res__t"><b>' + esc(g) + '</b><span class="res__path">' + esc(first.p) + '</span></span>'
        + '<span class="res__s">' + esc(first.s) + '</span></a></li>';
    });
    html += '</ul></section>';
    body.innerHTML = html;
    count.textContent = GROUPS.length + ' áreas';
    openTray();
    bind();
  }

  function renderResults(words) {
    var q = words.join(' ');
    var found = INDEX.filter(function (it) {
      var hay = (it.t + ' ' + it.p + ' ' + it.g + ' ' + it.s + ' ' + it.k).toLowerCase();
      return words.every(function (w) { return hay.indexOf(w) > -1; });
    });
    lab.textContent = 'Resultados para ' + q;
    if (!found.length) {
      body.innerHTML = '<p class="empty"><b>Nada por aquí</b>Prueba con un área, una persona o un número de ticket.</p>';
      count.textContent = '0 resultados';
      openTray();
      return;
    }
    var html = '';
    var order = ['Personas', 'Proyectos', 'Documentación', 'Sistemas', 'Formación', 'Instalaciones', 'Seguridad', 'Soporte TI'];
    order.forEach(function (g) {
      var rows = found.filter(function (it) { return it.g === g; });
      if (!rows.length) return;
      html += '<section class="grp"><h2 class="grp__t">' + esc(g) + ' <b>' + rows.length + '</b></h2><ul class="res">';
      rows.forEach(function (it) {
        html += '<li><a href="' + it.href + '"><span class="res__t"><b>' + mark(it.t, words) + '</b><span class="res__path">' + esc(it.p) + '</span></span>'
          + '<span class="res__s">' + mark(it.s, words) + '</span></a></li>';
      });
      html += '</ul></section>';
    });
    body.innerHTML = html;
    count.textContent = found.length + ' resultados';
    openTray();
    bind();
  }

  function bind() {
    [].slice.call(body.querySelectorAll('.hist button')).forEach(function (b) {
      b.addEventListener('click', function () {
        input.value = b.getAttribute('data-q');
        run();
      });
    });
    var wipe = document.getElementById('wipe');
    if (wipe) {
      wipe.addEventListener('click', function () {
        history = [];
        input.value = '';
        clear.hidden = true;
        renderIdle();
      });
    }
    links().forEach(function (a) {
      a.addEventListener('click', function () {
        closeTray(false);
        clear.hidden = true;
        input.value = '';
      });
    });
  }

  function remember(q) {
    history = history.filter(function (h) { return h !== q; });
    history.unshift(q);
    if (history.length > 6) history.pop();
  }

  function run() {
    var raw = input.value.trim().toLowerCase();
    clear.hidden = !input.value;
    if (!raw) {
      renderIdle();
      return;
    }
    remember(raw);
    renderResults(raw.split(/\s+/));
  }

  input.addEventListener('input', run);

  input.addEventListener('focus', function () {
    closePop();
    run();
  });

  input.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') {
      var first = links()[0];
      if (first) {
        e.preventDefault();
        first.focus();
      }
      return;
    }
    if (e.key === 'Enter') {
      var list = links();
      var first = list[0];
      if (first) {
        e.preventDefault();
        first.click();
      }
      return;
    }
    if (e.key === 'Escape') {
      e.stopPropagation();
      if (input.value) {
        input.value = '';
        clear.hidden = true;
        renderIdle();
      } else {
        closeTray(true);
      }
    }
  });

  body.addEventListener('keydown', function (e) {
    var list = links();
    var at = list.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (at < list.length - 1) list[at + 1].focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (at > 0) list[at - 1].focus();
      else input.focus();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      input.focus();
      input.select();
    }
  });

  clear.addEventListener('click', function () {
    input.value = '';
    clear.hidden = true;
    input.focus();
    renderIdle();
  });

  function closePop(refocus) {
    if (pop.hasAttribute('hidden')) return;
    pop.setAttribute('hidden', '');
    help.setAttribute('aria-expanded', 'false');
    if (refocus) help.focus();
  }

  help.addEventListener('click', function () {
    if (pop.hasAttribute('hidden')) {
      pop.removeAttribute('hidden');
      help.setAttribute('aria-expanded', 'true');
    } else {
      closePop(true);
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closePop(true);
      return;
    }
    if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
      var tag = document.activeElement ? document.activeElement.tagName : '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      e.preventDefault();
      input.focus();
      input.select();
    }
  });

  document.addEventListener('click', function (e) {
    if (pop.hasAttribute('hidden')) return;
    if (pop.contains(e.target) || help.contains(e.target)) return;
    closePop(false);
  });

  window.addEventListener('scroll', function () {
    if (!tray.classList.contains('is-open')) return;
    closeTray(false);
  }, { passive: true });

  renderIdle();
  closeTray(false);
})();
