const form = document.getElementById("form");
const paneles = Array.from(document.querySelectorAll(".panel"));
const nodos = Array.from(document.querySelectorAll(".nodo"));
const anilloProg = document.getElementById("anilloProg");
const btnAtras = document.getElementById("atras");
const btnContinuar = document.getElementById("continuar");
const textoContinuar = document.getElementById("continuarTexto");
const resumenError = document.getElementById("resumenError");
const listaError = document.getElementById("resumenErrorLista");
const tituloError = document.getElementById("resumenErrorTitulo");
const cerrada = document.getElementById("cerrada");
const selCurso = document.getElementById("curso");

const CURSOS = [
  { id: "nautica", nombre: "Ingeniería Náutica y Gestión Marítima", precio: 4200, plazas: 40 },
  { id: "biologia", nombre: "Biología Marina y Acuicultura", precio: 3850, plazas: 28 },
  { id: "turismo", nombre: "Turismo Costero y Experiencia Cultural", precio: 3100, plazas: 55 },
  { id: "energia", nombre: "Ingeniería Energética Offshore", precio: 4650, plazas: 22 },
  { id: "logistica", nombre: "Logística Portuaria y Aduanas", precio: 3450, plazas: 40 },
  { id: "clima", nombre: "Oceanografía y Cambio Climático", precio: 3980, plazas: 30 }
];

const LETRAS = "TRWAGMYFPDXBNJZSQVHLCKE";
const MESES_CURSO = 8;
const TOTAL = paneles.length;

let paso = 1;

const CAMPOS = [
  {
    id: "curso", panel: 1,
    etiqueta: "Curso",
    vacio: "Elige un curso para empezar.",
    error: "Ese curso no está en el catálogo de este campus.",
    prueba: v => CURSOS.some(c => c.id === v)
  },
  {
    id: "modalidad", panel: 1,
    etiqueta: "Modalidad",
    vacio: "Elige cómo quieres estudiar.",
    error: "Modalidad no válida.",
    prueba: v => ["presencial", "online", "mixta"].includes(v)
  },
  {
    id: "plazas", panel: 1,
    etiqueta: "Número de plazas",
    vacio: "Indica cuántas plazas quieres.",
    error: "Solo se admiten de 1 a 3 plazas por persona.",
    prueba: v => Number.isInteger(Number(v)) && Number(v) >= 1 && Number(v) <= 3
  },
  {
    id: "turno", panel: 2,
    etiqueta: "Turno",
    vacio: "Elige un turno para continuar.",
    error: "El turno de noche solo existe en la modalidad en línea.",
    prueba: v => ["manana", "tarde", "noche"].includes(v) && !(v === "noche" && selModalidad() !== "online")
  },
  {
    id: "aula", panel: 2,
    etiqueta: "Aula preferida",
    vacio: "",
    error: "Ese aula no existe en el campus.",
    prueba: v => v === "" || ["a1", "a4", "b2", "lab"].includes(v)
  },
  {
    id: "dias", panel: 2, tipo: "grupo", nombre: "dia",
    etiqueta: "Días de clase",
    vacio: "Marca al menos dos días de clase.",
    error: "Con menos de dos días no se puede emitir título universitario.",
    prueba: v => selModalidad() === "online" ? v.length >= 0 : v.length >= 2
  },
  {
    id: "inicio", panel: 3,
    etiqueta: "Fecha de inicio",
    vacio: "Elige la fecha de inicio.",
    error: "El curso tiene que empezar en octubre del año actual o del siguiente.",
    prueba: v => {
      const d = parseFecha(v);
      if (!d) return false;
      const hoy = new Date();
      return d.getMonth() === 9 && (d.getFullYear() === hoy.getFullYear() || d.getFullYear() === hoy.getFullYear() + 1);
    }
  },
  {
    id: "fin", panel: 3,
    etiqueta: "Fecha de fin",
    vacio: "Elige la fecha de fin.",
    error: "El fin tiene que ser posterior al inicio y como mucho un año después.",
    prueba: v => {
      const a = parseFecha(valorCampo(campo("inicio")));
      const b = parseFecha(v);
      if (!b) return false;
      if (!a) return true;
      const limite = new Date(a.getFullYear() + 1, a.getMonth(), a.getDate());
      return b > a && b <= limite;
    }
  },
  {
    id: "ritmo", panel: 3,
    etiqueta: "Horas semanales de estudio",
    vacio: "Indica cuántas horas dedicas al estudio.",
    error: "El ritmo va de 4 a 40 horas semanales.",
    prueba: v => Number.isInteger(Number(v)) && Number(v) >= 4 && Number(v) <= 40
  },
  {
    id: "becas", panel: 3,
    etiqueta: "Solicitud de beca",
    vacio: "",
    error: "Ese tipo de beca no está en la convocatoria.",
    prueba: v => ["ninguna", "ministerial", "municipal", "empresa"].includes(v)
  },
  {
    id: "documento", panel: 4,
    etiqueta: "DNI o NIE",
    vacio: "Necesitamos tu documento para emitir el título.",
    error: "El número y la letra no coinciden. Revisa el documento.",
    prueba: v => validaDocumento(v)
  },
  {
    id: "fechanac", panel: 4,
    etiqueta: "Fecha de nacimiento",
    vacio: "Indica tu fecha de nacimiento.",
      error: "Hay que tener entre 16 y 80 años para formalizar la matrícula.",
    prueba: v => {
      const d = parseFecha(v);
      if (!d) return false;
      const hoy = new Date();
      let edad = hoy.getFullYear() - d.getFullYear();
      const m = hoy.getMonth() - d.getMonth();
      if (m < 0 || (m === 0 && hoy.getDate() < d.getDate())) edad -= 1;
      return edad >= 16 && edad <= 80;
    }
  },
  {
    id: "correo", panel: 4,
    etiqueta: "Correo electrónico",
    vacio: "Necesitamos un correo para enviarte la carta.",
    error: "Revisa el formato: nombre@dominio.com",
    prueba: v => /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(v)
  },
  {
    id: "telefono", panel: 4,
    etiqueta: "Teléfono",
    vacio: "Necesitamos un teléfono para los avisos del campus.",
    error: "Debe tener nueve cifras y empezar por 6 o 7.",
    prueba: v => /^[67]\d{8}$/.test(v.replace(/[\s-]/g, ""))
  },
  {
    id: "comentario", panel: 4, opcional: true,
    etiqueta: "Nota para burocracia",
    vacio: "",
    error: "La nota no puede pasar de 300 caracteres.",
    prueba: v => v.length <= 300
  },
  {
    id: "firma", panel: 4, tipo: "check",
    etiqueta: "Aceptación de la matrícula",
    vacio: "Hay que aceptar para cerrar la matrícula.",
    error: "No podemos matricularte sin la aceptación.",
    prueba: v => v === "si"
  }
];

function el(id) { return document.getElementById(id); }
function campo(id) { return CAMPOS.find(f => f.id === id); }
function selModalidad() { return el("modalidad").value; }

function parseFecha(v) {
  if (!v || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
  const p = v.split("-").map(Number);
  const d = new Date(p[0], p[1] - 1, p[2]);
  return d.getFullYear() === p[0] && d.getMonth() === p[1] - 1 && d.getDate() === p[2] ? d : null;
}

function validaDocumento(v) {
  const s = v.toUpperCase().replace(/[\s-]/g, "");
  if (/^\d{8}[A-Z]$/.test(s)) return LETRAS[Number(s.slice(0, 8)) % 23] === s[8];
  if (/^[XYZ]\d{7}[A-Z]$/.test(s)) {
    const letra = "XYZ".indexOf(s[0]);
    const n = letra * 10000000 + Number(s.slice(1, 8));
    return LETRAS[n % 23] === s[8];
  }
  return false;
}

function valorCampo(f) {
  if (f.tipo === "check") return el(f.id).checked ? "si" : "";
  if (f.tipo === "grupo") {
    return Array.from(document.querySelectorAll('input[name="' + f.nombre + '"]:checked')).map(i => i.value);
  }
  return el(f.id).value.trim();
}

function pintar(f) {
  const env = f.tipo === "grupo" ? el("dias").closest("fieldset") : el(f.id).closest(".campo");
  const ayuda = el(f.id + "-ayuda");
  const error = el(f.id + "-error");
  const bruto = valorCampo(f);
  const vacio = Array.isArray(bruto) ? bruto.length === 0 : bruto === "";
  const malo = !vacio && !f.prueba(bruto);
  const fallo = vacio ? Boolean(f.vacio) : malo;

  if (f.id === "ritmo") {
    const bajo = !vacio && Number(bruto) < 10;
    env.dataset.aviso = bajo ? "1" : "0";
    if (ayuda.dataset.textoBase === undefined) ayuda.dataset.textoBase = ayuda.textContent;
    ayuda.textContent = bajo
      ? "Con menos de 10 horas semanales no se emite título universitario, solo certificado de asistencia."
      : ayuda.dataset.textoBase;
  }

  if (f.opcional) {
    env.dataset.estado = fallo ? "error" : vacio ? "neutro" : "ok";
  } else {
    env.dataset.estado = fallo ? "error" : "ok";
  }

  const desc = [];
  if (ayuda) desc.push(ayuda.id);
  if (fallo && error) {
    desc.push(error.id);
    error.textContent = vacio ? f.vacio : f.error;
  }

  if (f.tipo === "grupo") {
    document.querySelectorAll('input[name="' + f.nombre + '"]').forEach(i => {
      i.setAttribute("aria-invalid", fallo ? "true" : "false");
      i.setAttribute("aria-describedby", desc.join(" "));
    });
  } else {
    el(f.id).setAttribute("aria-invalid", fallo ? "true" : "false");
    el(f.id).setAttribute("aria-describedby", desc.join(" "));
  }

  return fallo;
}

function validarPanel(n) {
  let primero = null;
  CAMPOS.filter(f => f.panel === n).forEach(f => {
    const fallo = pintar(f);
    if (fallo && !primero) {
      primero = f.tipo === "grupo" ? document.querySelector('input[name="' + f.nombre + '"]') : el(f.id);
    }
  });
  return primero;
}

function problemas(n) {
  return CAMPOS.filter(f => f.panel === n && (() => {
    const bruto = valorCampo(f);
    const vacio = Array.isArray(bruto) ? bruto.length === 0 : bruto === "";
    if (vacio) return Boolean(f.vacio);
    return !f.prueba(bruto);
  })());
}

function mostrarResumen(n) {
  const fallos = problemas(n);
  if (fallos.length === 0) {
    resumenError.hidden = true;
    return;
  }
  tituloError.textContent = fallos.length === 1
    ? "Falta corregir un campo"
    : "Faltan " + fallos.length + " campos por corregir";
  listaError.innerHTML = "";
  fallos.forEach(f => {
    const li = document.createElement("li");
    const bruto = valorCampo(f);
    const vacio = Array.isArray(bruto) ? bruto.length === 0 : bruto === "";
    li.textContent = f.etiqueta + ": " + (vacio ? f.vacio : f.error);
    listaError.appendChild(li);
  });
  resumenError.hidden = false;
}

function precioCurso() {
  const c = CURSOS.find(x => x.id === selCurso.value);
  return c ? c.precio : 0;
}

function nombreCurso() {
  const c = CURSOS.find(x => x.id === selCurso.value);
  return c ? c.nombre : "";
}

function numPlazas() {
  const n = Number(el("plazas").value);
  return Number.isInteger(n) && n >= 1 && n <= 3 ? n : 1;
}

function numMeses() {
  const a = parseFecha(el("inicio").value);
  const b = parseFecha(el("fin").value);
  if (!a || !b || b <= a) return MESES_CURSO;
  return Math.max(1, Math.min(12, Math.round((b - a) / 2629800000)));
}

function marcarExtra(v) {
  return document.querySelector('input[name="extra"][value="' + v + '"]').checked;
}

function calcular() {
  const plazas = numPlazas();
  const meses = numMeses();
  let tuition = precioCurso() * plazas;
  if (selModalidad() === "online") tuition = tuition * 0.88;
  const beca = el("becas").value;
  if (beca === "ministerial") tuition = tuition * 0.5;
  else if (beca === "municipal") tuition = Math.max(0, tuition - 120 * plazas);
  else if (beca === "empresa") tuition = tuition * 0.85;
  let extras = 0;
  if (marcarExtra("material")) extras += 42 * plazas;
  if (marcarExtra("alojamiento")) extras += 68 * Math.max(1, meses);
  return { tuition, extras, total: tuition + extras, plazas, meses };
}

function euros(n) {
  return n.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

function notaCentro() {
  if (!selCurso.value) return "Empieza eligiendo curso";
  if (!selModalidad()) return "Elige cómo estudias";
  if (!el("turno").value) return "Falta el turno";
  if (!el("inicio").value) return "Faltan las fechas";
  return "Todo listo, revisa y cierra";
}

function actualizarCentro() {
  const d = calcular();
  const valor = el("centroValor");
  valor.textContent = euros(d.total);
  valor.classList.toggle("is-alto", d.total > 0);
  el("centroNota").textContent = notaCentro();
}

function mostrar(n) {
  paso = n;
  paneles.forEach(p => {
    const activo = Number(p.dataset.panel) === n;
    p.hidden = !activo;
    p.classList.toggle("is-activo", activo);
  });
  nodos.forEach(b => {
    const num = Number(b.dataset.paso);
    b.classList.toggle("is-actual", num === n);
    b.classList.toggle("is-hecho", num < n);
    if (num === n) b.setAttribute("aria-current", "step");
    else b.removeAttribute("aria-current");
  });
  anilloProg.style.strokeDashoffset = String(880 - (0.06 + (n - 1) / (TOTAL - 1) * 0.94) * 880);
  btnAtras.disabled = n === 1;
  textoContinuar.textContent = n === TOTAL ? "Cerrar la matrícula" : siguienteTexto(n);
  resumenError.hidden = true;
  actualizarCentro();
}

function siguienteTexto(n) {
  return ["Ir al turno", "Elegir el plazo", "Ir a documentación"][n - 1] || "Continuar";
}

function formatearFecha(v) {
  const d = parseFecha(v);
  if (!d) return "sin definir";
  const m = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"][d.getMonth()];
  return d.getDate() + " " + m + " " + d.getFullYear();
}

function completar() {
  const d = calcular();
  const turno = el("turno");
  el("cerradaRef").textContent = "CN-" + String(Math.floor(100000 + Math.random() * 900000));
  el("cerradaCurso").textContent = nombreCurso();
  el("cerradaTurno").textContent = turno.value ? turno.options[turno.selectedIndex].text : "sin definir";
  el("cerradaPeriodo").textContent = formatearFecha(el("inicio").value) + " a " + formatearFecha(el("fin").value);
  el("cerradaPlazas").textContent = d.plazas + (d.plazas === 1 ? " plaza" : " plazas");
  el("cerradaTotal").textContent = euros(d.total);
  const nombre = el("correo").value.trim().split("@")[0];
  el("cerradaTitulo").textContent = "Plaza reservada para " + nombre;
  el("cerradaTexto").textContent = "Recibirás la carta de aceptación en " + el("correo").value.trim() +
    " en un plazo de cinco días hábiles. Guardamos " + d.plazas + (d.plazas === 1 ? " plaza" : " plazas") +
    " durante el curso completo.";
  document.querySelector(".disposicion").hidden = true;
  cerrada.hidden = false;
  cerrada.focus();
}

function repintarCalculado() {
  actualizarCentro();
  const hablabox = el("turno");
  if (hablabox.value === "noche" && selModalidad() !== "online") {
    hablabox.value = "";
    pintar(campo("turno"));
  }
}

CAMPOS.forEach(f => {
  if (f.tipo === "grupo") {
    document.querySelectorAll('input[name="' + f.nombre + '"]').forEach(i => {
      i.addEventListener("change", () => {
        pintar(f);
        actualizarCentro();
      });
    });
  } else {
    el(f.id).addEventListener("blur", () => { pintar(f); actualizarCentro(); });
    el(f.id).addEventListener("input", () => {
      const env = el(f.id).closest(".campo");
      if (env.dataset.estado !== "neutro") pintar(f);
      actualizarCentro();
    });
    if (f.id === "telefono") {
      el(f.id).addEventListener("input", () => {
        const d = el(f.id).value.replace(/\D/g, "").slice(0, 9);
        el(f.id).value = d.length > 6 ? d.slice(0, 3) + " " + d.slice(3, 6) + " " + d.slice(6) : d;
      });
    }
    if (f.id === "documento") {
      el(f.id).addEventListener("input", () => {
        el(f.id).value = el(f.id).value.toUpperCase().replace(/[^0-9XYZ]/g, "").slice(0, 9);
      });
    }
  }
});

document.querySelectorAll('input[name="extra"]').forEach(i => {
  i.addEventListener("change", () => {
    pintar(campo("curso"));
    actualizarCentro();
  });
});

nodos.forEach(b => {
  b.addEventListener("click", () => {
    const n = Number(b.dataset.paso);
    if (n !== paso) mostrar(n);
  });
});

btnAtras.addEventListener("click", () => {
  if (paso > 1) mostrar(paso - 1);
});

btnContinuar.addEventListener("click", e => {
  e.preventDefault();
  const primero = validarPanel(paso);
  if (primero) {
    mostrarResumen(paso);
    primero.focus();
    return;
  }
  resumenError.hidden = true;
  if (paso < TOTAL) mostrar(paso + 1);
  else completar();
});

el("otra").addEventListener("click", () => {
  form.reset();
  document.querySelector(".disposicion").hidden = false;
  cerrada.hidden = true;
  CAMPOS.forEach(f => {
    const env = f.tipo === "grupo" ? document.querySelector("fieldset.dias") : el(f.id).closest(".campo");
    env.dataset.estado = "neutro";
    delete env.dataset.aviso;
    const e = el(f.id + "-error");
    if (e) e.textContent = "";
  });
  mostrar(1);
  selCurso.focus();
});

form.addEventListener("submit", e => e.preventDefault());

selCurso.innerHTML = '<option value="">Elige un curso</option>';
CURSOS.forEach(c => {
  const o = document.createElement("option");
  o.value = c.id;
  o.textContent = c.nombre + " · " + euros(c.precio) + " · " + c.plazas + " plazas";
  selCurso.appendChild(o);
});

mostrar(1);
actualizarCentro();
