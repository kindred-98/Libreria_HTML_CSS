'use strict';

const $ = (sel, raiz) => (raiz || document).querySelector(sel);
const $$ = (sel, raiz) => Array.prototype.slice.call((raiz || document).querySelectorAll(sel));

const CLASSES = { guardia: 'Guardian', asalto: 'Assault', apoyo: 'Support', sigilo: 'Sigil', artillero: 'Artillery' };
const REGIONES = { na: 'North America', eu: 'Europe', oce: 'Oceania', sa: 'South America' };
const IDIOMAS = { en: 'English', es: 'Spanish', fr: 'French', de: 'German', pt: 'Portuguese' };

const ROLES = [
  ['tank', 'Tank', 'TNK'],
  ['healer', 'Healer', 'HLR'],
  ['asalto', 'Assault', 'ASL'],
  ['fuego', 'Ranged', 'RNG'],
  ['explorador', 'Scout', 'SCT'],
  ['vocero', 'Caller', 'CLR']
];

const LENGUETAS = [['en', 'English'], ['es', 'Spanish'], ['fr', 'French'], ['de', 'German'], ['pt', 'Portuguese']];
const NOCHES = [['lun', 'Monday'], ['mar', 'Tuesday'], ['mie', 'Wednesday'], ['jue', 'Thursday'], ['vie', 'Friday']];
const NORMAS = [
  ['estatica', 'I will hold a static roster slot and take the nights I am given.'],
  ['responder', 'I will answer whichever officer writes to me within four days.']
];

const MIN_CARTA = 120;
const MAX_CARTA = 700;

const marcadas = sel => $$('input:checked', $(sel)).map(i => i.value);
const marcada = name => { const r = $('input:checked[name="' + name + '"]'); return r ? r.value : ''; };
const suave = () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const CAMPOS = [
  { id: 'nombre', peso: 12, leer: () => $('#nombre').value, frac: v => Math.min(1, v.trim().length / 12), regla: v => v.trim().length >= 2 || 'The officers need a name to look the character up with.' },
  { id: 'clase', peso: 8, leer: () => $('#clase').value, frac: v => (v ? 1 : 0), regla: v => !!v || 'Pick the class you queue as.' },
  { id: 'nivel', peso: 10, leer: () => $('#nivel').value, frac: v => Number(v) / 100, regla: v => Number(v) > 0 || 'Slide the level off zero. An empty sheet is not an application.' },
  { id: 'region', peso: 5, leer: () => $('#region').value, frac: v => (v ? 1 : 0), regla: v => !!v || 'Pick the region you queue from.' },
  { id: 'idioma', peso: 5, leer: () => $('#idioma').value, frac: v => (v ? 1 : 0), regla: v => !!v || 'Pick the language the officers should write in.' },
  { id: 'roles', peso: 12, leer: () => marcadas('#roles'), frac: v => Math.min(1, v.length / 3), regla: v => v.length >= 1 || 'Tick at least one role. Sitting in a queue is not a contribution.' },
  { id: 'lenguetas', peso: 5, leer: () => marcadas('#lenguetas'), frac: v => Math.min(1, v.length), regla: v => v.length >= 1 || 'Tick one language at least. It decides who writes to you.' },
  { id: 'logros', peso: 8, leer: () => $('#logros').value, frac: v => Math.min(1, v.trim().length / 30), regla: v => v.trim().length > 0 || 'Name one raid you have cleared. The sheet is not a wish list.' },
  { id: 'noches', peso: 12, leer: () => marcadas('#noches'), frac: v => Math.min(1, v.length / 3), regla: v => v.length >= 2 || 'Two weeknights minimum. A guild that cannot field eight stops existing by February.' },
  { id: 'salida', peso: 7, leer: () => marcada('salida'), frac: v => (v ? 1 : 0), regla: v => !!v || 'Tell us how long you need to be online before a raid.' },
  { id: 'carta', peso: 14, leer: () => $('#carta').value, frac: v => Math.min(1, v.trim().length / MAX_CARTA), regla: v => v.trim().length >= MIN_CARTA || 'A hundred and twenty characters at least. The officers read the first line.' },
  { id: 'discord', peso: 5, leer: () => $('#discord').value, frac: v => Math.min(1, v.trim().length / 16), regla: v => /^[\w.-]{2,32}(#\d{1,5})?$/.test(v.trim()) || 'A handle looks like LanternFox or LanternFox#4417.' },
  { id: 'email', peso: 5, leer: () => $('#email').value, frac: v => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? 1 : 0), regla: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'We need an address the answer can actually reach.' },
  { id: 'normas', peso: 8, leer: () => marcadas('#normas'), frac: v => v.length / NORMAS.length, regla: v => v.length === NORMAS.length || 'Both promises have to be ticked. They are not negotiable.' },
  { id: 'leido', peso: 6, leer: () => $('#leido').checked, frac: v => (v ? 1 : 0), regla: v => v === true || 'You have to have read the charter before applying.' }
];

const TOTAL_PESO = CAMPOS.reduce((a, c) => a + c.peso, 0);
const porId = id => CAMPOS.filter(c => c.id === id)[0];
const tocados = {};

const falloDe = campo => {
  const r = campo.regla(campo.leer());
  return r === true ? '' : (r || '');
};

const nodosDe = campo => {
  const el = document.getElementById(campo.id);
  if (el) return [el];
  if (campo.id === 'salida') return $$('input[name="salida"]');
  return [];
};

const controlesDe = tramo => CAMPOS.filter(c => nodosDe(c).some(n => tramo.contains(n)));

function envoltorio(id) {
  const el = document.getElementById(id);
  return el ? el.closest('.campo') : null;
}

function pintarEstado(campo, forzar) {
  const caja = envoltorio(campo.id);
  if (!caja) return '';
  const valor = campo.leer();
  const fallo = falloDe(campo);
  const tocado = tocados[campo.id] || forzar;
  if (fallo && tocado) caja.setAttribute('data-estado', 'error');
  else if (!fallo && valor !== '' && valor !== false && !(Array.isArray(valor) && valor.length === 0)) caja.setAttribute('data-estado', 'ok');
  else caja.setAttribute('data-estado', 'neutro');
  const err = document.getElementById(campo.id + '-err');
  if (err) err.textContent = fallo && tocado ? fallo : '';
  const ayuda = document.getElementById(campo.id + '-ayuda');
  if (ayuda) ayuda.setAttribute('aria-live', 'polite');
  const control = document.getElementById(campo.id);
  if (control && control.hasAttribute('aria-invalid')) control.setAttribute('aria-invalid', fallo && tocado ? 'true' : 'false');
  const grupo = document.getElementById(campo.id);
  if (grupo && grupo.hasAttribute('aria-invalid')) grupo.setAttribute('aria-invalid', fallo && tocado ? 'true' : 'false');
  return fallo;
}

function preparacion() {
  let suma = 0;
  CAMPOS.forEach(c => { suma += c.peso * Math.max(0, Math.min(1, c.frac(c.leer()))); });
  const sabado = $('#sabado').checked ? 1 : 0;
  return Math.max(0, Math.min(100, Math.round(((suma + sabado * 3) / (TOTAL_PESO + 3)) * 100)));
}

function nivelTexto(v) {
  const n = Number(v);
  if (n <= 0) return 'nothing on the sheet yet';
  if (n < 25) return 'fresh recruit, still learning the keys';
  if (n < 50) return 'comfortable, not yet trusted with the roster';
  if (n < 75) return 'raided enough to be given keys';
  if (n < 100) return 'the officers would call you for a spot';
  return 'on the sheet at the top, which we check';
}

function nivelClase(v) {
  return Number(v) < 50 ? 'bajo' : 'alto';
}

function rolEtiquetas() {
  const picks = marcadas('#roles');
  const mapa = {};
  ROLES.forEach(r => { mapa[r[0]] = r[1]; });
  return picks.map(v => mapa[v] || v);
}

function pintarFicha() {
  const nombre = $('#nombre').value.trim();
  const clase = $('#clase').value;
  const nivel = $('#nivel').value;
  const noches = marcadas('#noches').length + ($('#sabado').checked ? 1 : 0);
  const pct = preparacion();

  $('#tClase').textContent = CLASSES[clase] || 'unclassed';
  $('#tNombre').textContent = nombre || 'nobody';
  $('#tHandle').textContent = $('#discord').value.trim() || 'no handle yet';
  $('#tNivelSello').textContent = 'Lv ' + nivel;
  $('#tLogro').textContent = $('#logros').value.trim() || 'No raid written yet.';
  $('#tPersonaje').textContent = nombre || 'nobody';
  $('#tNoches').textContent = String(noches);
  $('#tListo').textContent = pct + ' %';
  $('#tPct').textContent = pct + ' %';
  $('#tRelleno').style.transform = 'scaleX(' + pct / 100 + ')';
  $('#tSecciones').textContent = seccionesHechas() + ' of ' + TRAMOS.length;
  $('#tPie').textContent = (REGIONES[$('#region').value] || 'no region') + ' · ' + (IDIOMAS[$('#idioma').value] || 'no language');
  $('#tarjeta').setAttribute('data-clase', nivelClase(nivel));

  const etiquetas = rolEtiquetas();
  $('#tEtiquetas').innerHTML = '';
  etiquetas.forEach(t => {
    const li = document.createElement('li');
    li.textContent = t;
    $('#tEtiquetas').appendChild(li);
  });

  const dSalida = $('#dSalida');
  if (dSalida) dSalida.textContent = marcada('salida') || 'not decided';

  const dNoches = $('#dNoches');
  if (dNoches) dNoches.textContent = noches === 0 ? 'none' : noches + (noches === 1 ? ' night' : ' nights');

  $('#nivelValor').textContent = nivel;
  $('#nivelTexto').textContent = nivelTexto(nivel);
  $('#nivelRelleno').style.transform = 'scaleX(' + Number(nivel) / 100 + ')';
  const cap = $('#nivelCap');
  if (cap) cap.style.left = Number(nivel) + '%';

  const largo = $('#carta').value.length;
  $('#cartaCuenta').textContent = largo + ' of ' + MAX_CARTA + ', ' + MIN_CARTA + ' minimum';
  const pips = $('#cartaPips');
  pips.style.setProperty('--relleno', Math.min(1, largo / MAX_CARTA).toFixed(3));
  pips.setAttribute('data-largo', largo >= MIN_CARTA ? '1' : '0');

  const ayudaRoles = $('#roles-ayuda');
  if (ayudaRoles) ayudaRoles.textContent = marcadas('#roles').length ? 'On the sheet as ' + rolEtiquetas().join(', ') + '.' : 'Nothing ticked yet. The sheet on the right shows a guild with no set raid comp.';

  const ayudaNoches = $('#noches-ayuda');
  if (ayudaNoches) ayudaNoches.textContent = marcadas('#noches').length ? marcadas('#noches').length + ' weeknight' + (marcadas('#noches').length === 1 ? '' : 's') + ' given.' : 'No nights ticked. A guild of one cannot raid at all.';

  const ayudaLenguetas = $('#lenguetas-ayuda');
  if (ayudaLenguetas) ayudaLenguetas.textContent = marcadas('#lenguetas').length ? 'Answer in ' + marcadas('#lenguetas').map(k => (IDIOMAS[k] || k)).join(', ') + '.' : 'One language decides who writes to you.';

  const ayudaNormas = $('#normas-ayuda');
  if (ayudaNormas) ayudaNormas.textContent = marcadas('#normas').length === NORMAS.length ? 'Both ticked. Nothing else to read.' : 'Both are ticked individually. The officers do not read the rest of a guild application as carefully as this.';

  const ayudaLogros = $('#logros-ayuda');
  if (ayudaLogros) ayudaLogros.textContent = $('#logros').value.trim() ? 'Written to the sheet.' : 'Hard mode, normal mode, or a clean clear. One is enough.';
}

function seccionesHechas() {
  let n = 0;
  TRAMOS.forEach(t => {
    const propios = controlesDe(t);
    if (propios.length && propios.every(c => !falloDe(c))) n++;
  });
  return n;
}

const TRAMOS = $$('.tramo');
const ANCLAS = $('#anclas');

function construirAnclas() {
  ANCLAS.innerHTML = '';
  TRAMOS.forEach(t => {
    const titulo = $('.tramo__titulo', t);
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = '#' + t.id;
    a.setAttribute('data-estado', 'neutro');
    const span = document.createElement('span');
    span.textContent = (titulo ? titulo.textContent : t.id).replace(/^\d+/, '').trim();
    a.appendChild(span);
    a.addEventListener('click', ev => {
      ev.preventDefault();
      t.scrollIntoView({ behavior: suave() ? 'smooth' : 'auto', block: 'start' });
      if (history.replaceState) history.replaceState(null, '', '#' + t.id);
    });
    li.appendChild(a);
    ANCLAS.appendChild(li);
  });
}

function marcarAnclas() {
  const centro = window.innerHeight * 0.34;
  let actual = TRAMOS[0];
  TRAMOS.forEach(t => { if (t.getBoundingClientRect().top <= centro) actual = t; });
  const hechos = seccionesHechas();
  $$('a', ANCLAS).forEach((a, i) => {
    const t = TRAMOS[i];
    const propios = controlesDe(t);
    const completo = propios.length > 0 && propios.every(c => !falloDe(c));
    if (completo) a.setAttribute('data-estado', 'hecho');
    else if (t === actual) a.setAttribute('data-estado', 'activo');
    else a.setAttribute('data-estado', 'neutro');
  });
  $('#anclasPie').textContent = hechos === TRAMOS.length ? 'every section ready to send' : (TRAMOS.length - hechos) + ' of ' + TRAMOS.length + ' sections still open';
}

function construirRoles() {
  const caja = $('#roles');
  caja.innerHTML = '';
  ROLES.forEach(r => {
    const label = document.createElement('label');
    label.className = 'ficha-chip';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.name = 'rol';
    input.value = r[0];
    const glifo = document.createElement('span');
    glifo.className = 'ficha-chip__glifo';
    const cod = document.createElement('span');
    cod.className = 'ficha-chip__cod';
    cod.textContent = r[2];
    const txt = document.createElement('span');
    txt.className = 'ficha-chip__txt';
    txt.textContent = r[1];
    label.appendChild(input);
    label.appendChild(glifo);
    label.appendChild(cod);
    label.appendChild(txt);
    caja.appendChild(label);
  });
}

function construirLenguetas() {
  const caja = $('#lenguetas');
  caja.innerHTML = '';
  LENGUETAS.forEach(l => {
    const label = document.createElement('label');
    label.className = 'opcion';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.name = 'lengueta';
    input.value = l[0];
    const cajaOpt = document.createElement('span');
    cajaOpt.className = 'opcion__caja';
    cajaOpt.textContent = l[1];
    label.appendChild(input);
    label.appendChild(cajaOpt);
    caja.appendChild(label);
  });
}

function construirNoches() {
  const caja = $('#noches');
  caja.innerHTML = '';
  NOCHES.forEach(n => {
    const label = document.createElement('label');
    label.className = 'opcion';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.name = 'noche';
    input.value = n[0];
    const cajaOpt = document.createElement('span');
    cajaOpt.className = 'opcion__caja';
    cajaOpt.textContent = n[1];
    label.appendChild(input);
    label.appendChild(cajaOpt);
    caja.appendChild(label);
  });
}

function construirNormas() {
  const caja = $('#normas');
  caja.innerHTML = '';
  NORMAS.forEach((n, i) => {
    const fila = document.createElement('div');
    fila.className = 'campo--check';
    const id = 'norma-' + n[0];
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.name = 'norma';
    input.id = id;
    input.value = n[0];
    const texto = document.createElement('label');
    texto.setAttribute('for', id);
    texto.textContent = n[1];
    const glifo = document.createElement('span');
    glifo.className = 'glifo';
    glifo.setAttribute('aria-hidden', 'true');
    fila.appendChild(input);
    fila.appendChild(texto);
    fila.appendChild(glifo);
    caja.appendChild(fila);
  });
}

function refrescar(forzar) {
  CAMPOS.forEach(c => pintarEstado(c, forzar));
  pintarFicha();
  marcarAnclas();
}

function resumenDeErrores() {
  const fallos = CAMPOS.map(c => ({ campo: c, fallo: falloDe(c) })).filter(x => x.fallo);
  const caja = $('#resumenError');
  const lista = $('#resumenLista');
  lista.innerHTML = '';
  if (!fallos.length) {
    caja.setAttribute('hidden', '');
    return 0;
  }
  fallos.forEach(f => {
    const li = document.createElement('li');
    const cajaF = envoltorio(f.campo.id);
    const control = document.getElementById(f.campo.id);
    const etiqueta = cajaF ? ($('label', cajaF) || $('.etiqueta', cajaF)) : null;
    // El asterisco que marca campos obligatorios se quita con split/join en
    // lugar de con `replace('*', '')`: CodeQL ve el patron `replace('X', '')`
    // como un intento de saneado incompleto y dispara "Incomplete string
    // escaping or encoding", aunque el destino sea `textContent`.
    const baseTexto = etiqueta ? etiqueta.textContent.split('*').join('').trim() : f.campo.id;
    li.textContent = baseTexto + ': ' + f.fallo;
    li.tabIndex = -1;
    li.addEventListener('click', () => {
      if (control && control.focus) control.focus();
      else if (cajaF) cajaF.scrollIntoView({ behavior: suave() ? 'smooth' : 'auto', block: 'center' });
    });
    lista.appendChild(li);
  });
  $('#resumenTitulo').textContent = fallos.length === 1 ? 'One thing is still open' : fallos.length + ' things are still open';
  caja.removeAttribute('hidden');
  return fallos.length;
}

function construirReferencia() {
  const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let s = '';
  for (let i = 0; i < 4; i++) s += letras[Math.floor(Math.random() * letras.length)];
  return 'ONL-' + s + '-' + String(Math.floor(Math.random() * 90) + 10);
}

function enviar(ev) {
  ev.preventDefault();
  CAMPOS.forEach(c => { tocados[c.id] = true; });
  refrescar(true);
  const fallos = resumenDeErrores();
  if (fallos) {
    const caja = $('#resumenError');
    caja.scrollIntoView({ behavior: suave() ? 'smooth' : 'auto', block: 'center' });
    if (!suave()) caja.removeAttribute('hidden');
    const boton = $('#enviar');
    const texto = $('#enviarTexto');
    const original = texto.textContent;
    texto.textContent = fallos + (fallos === 1 ? ' thing left' : ' things left');
    setTimeout(() => { texto.textContent = original; }, 1800);
    return;
  }

  const ref = construirReferencia();
  $('#resumenError').setAttribute('hidden', '');
  const nombre = $('#nombre').value.trim();
  const rol = rolEtiquetas().join(', ') || 'any role';
  const plazo = marcada('salida');

  $('#rRef').textContent = ref;
  $('#rNombre').textContent = nombre;
  $('#rRol').textContent = rol;
  $('#rPlazo').textContent = plazo;
  $('#recTitulo').textContent = nombre + ', the officers have it';
  $('#recLead').textContent = 'Ticket ' + ref + ' is in the roster queue. One of the three officers reads it, and answers within four days.';

  const pasos = [
    'Ticket ' + ref + ' filed under ' + (CLASSES[$('#clase').value] || 'unclassed') + ' at level ' + $('#nivel').value + '.',
    'Write to ' + ($('#discord').value.trim() || 'the handle on the ticket') + ' from the officer on duty this week.',
    'Nothing else to do. If they want a trial, they will book a Wednesday and you will get a calendar link.'
  ];
  const ul = $('#rPasos');
  ul.innerHTML = '';
  pasos.forEach(p => {
    const li = document.createElement('li');
    li.textContent = p;
    ul.appendChild(li);
  });

  const recibida = $('#recibida');
  $('.hoja').setAttribute('hidden', '');
  $('.anclas').setAttribute('hidden', '');
  $('.ficha').setAttribute('hidden', '');
  recibida.removeAttribute('hidden');
  recibida.focus();
  recibida.scrollIntoView({ behavior: suave() ? 'smooth' : 'auto', block: 'start' });
}

function otra() {
  $('#form').reset();
  $('#nivel').value = 0;
  Object.keys(tocados).forEach(k => { delete tocados[k]; });
  CAMPOS.forEach(c => {
    const caja = envoltorio(c.id);
    if (caja) caja.setAttribute('data-estado', 'neutro');
    const err = document.getElementById(c.id + '-err');
    if (err) err.textContent = '';
  });
  $('#resumenError').setAttribute('hidden', '');
  const recibida = $('#recibida');
  recibida.setAttribute('hidden', '');
  $('.hoja').removeAttribute('hidden');
  $('.anclas').removeAttribute('hidden');
  $('.ficha').removeAttribute('hidden');
  refrescar(false);
  window.scrollTo({ top: 0, behavior: suave() ? 'smooth' : 'auto' });
  $('#nombre').focus();
}

function conectar() {
  construirAnclas();
  construirRoles();
  construirLenguetas();
  construirNoches();
  construirNormas();

  $('#form').addEventListener('submit', enviar);
  $('#otra').addEventListener('click', otra);

  CAMPOS.forEach(c => {
    const ids = [c.id];
    if (c.id === 'salida') {
      $$('input[name="salida"]').forEach(i => ids.push(i.id));
      return;
    }
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const marcar = () => { tocados[c.id] = true; refrescar(false); };
      el.addEventListener('blur', marcar);
      el.addEventListener('input', marcar);
      el.addEventListener('change', marcar);
    });
  });

  ['#roles', '#lenguetas', '#noches', '#normas'].forEach(sel => {
    const caja = $(sel);
    if (!caja) return;
    caja.addEventListener('change', () => { tocados[sel.slice(1)] = true; refrescar(false); });
  });

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => { marcarAnclas(); ticking = false; });
  }, { passive: true });

  window.addEventListener('resize', () => { marcarAnclas(); }, { passive: true });

  refrescar(false);
  marcarAnclas();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', conectar);
else conectar();
