const form = document.getElementById("form");
const celdas = document.getElementById("celdas");
const hora = document.getElementById("hora");
const comensales = document.getElementById("comensales");
const zona = document.getElementById("zona");
const ocasion = document.getElementById("ocasion");
const nombre = document.getElementById("nombre");
const telefono = document.getElementById("telefono");
const correo = document.getElementById("correo");
const resumenError = document.getElementById("resumenError");
const listaError = document.getElementById("resumenErrorLista");
const tituloError = document.getElementById("resumenErrorTitulo");
const confirmada = document.getElementById("confirmada");

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const DIAS_SEMANA = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];

const AHORA = new Date();
const VISTA = new Date(AHORA.getFullYear(), AHORA.getMonth() + 1, 1);
const DIAS_MES = new Date(VISTA.getFullYear(), VISTA.getMonth() + 1, 0).getDate();
const PRIMER_DIA = (VISTA.getDay() + 6) % 7;

const HORAS_BASE = [
  { v: "13:30", et: "13:30", ocupados: 4 },
  { v: "14:15", et: "14:15", ocupados: 2 },
  { v: "20:00", et: "20:00", ocupados: 6 },
  { v: "20:45", et: "20:45", ocupados: 3 },
  { v: "21:30", et: "21:30", ocupados: 1 },
  { v: "22:15", et: "22:15", ocupados: 5 }
];

const huecos = {};

function el(id) { return document.getElementById(id); }

function iso(d) {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

function estadoDia(num) {
  const fecha = new Date(VISTA.getFullYear(), VISTA.getMonth(), num);
  const clave = iso(fecha);
  if (huecos[clave] === undefined) {
    const diaSemana = fecha.getDay();
    const base = (num * 7 + diaSemana * 3) % 5;
    let libres = diaSemana === 0 || diaSemana === 1 ? 0 : 2 + base;
    if (fecha <= AHORA) libres = 0;
    huecos[clave] = libres;
  }
  if (fecha <= AHORA) return "pasado";
  if (huecos[clave] === 0) return "llena";
  if (huecos[clave] <= 4) return "justa";
  return "libre";
}

function pintarCalendario() {
  celdas.innerHTML = "";
  for (let i = 0; i < PRIMER_DIA; i++) {
    const hueco = document.createElement("span");
    hueco.className = "celda-vacia";
    celdas.appendChild(hueco);
  }
  for (let num = 1; num <= DIAS_MES; num++) {
    const fecha = new Date(VISTA.getFullYear(), VISTA.getMonth(), num);
    const clave = iso(fecha);
    const estado = estadoDia(num);
    const cerrado = estado === "llena" || estado === "pasado";

    const label = document.createElement("label");
    label.className = "celda";
    label.dataset.estado = estado;
    label.dataset.cerrado = cerrado ? "1" : "0";

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "dia";
    input.value = clave;
    input.disabled = cerrado;
    input.setAttribute("aria-describedby", "fecha-ayuda");

    const celda = document.createElement("span");
    celda.className = "celda-numero";

    const numero = document.createElement("span");
    numero.textContent = String(num);

    const marca = document.createElement("span");
    marca.className = "celda-estado";
    marca.textContent = estado === "llena" ? "completo" : estado === "pasado" ? "cerrado" : huecos[clave] + " libres";

    celda.appendChild(numero);
    celda.appendChild(marca);
    label.appendChild(input);
    label.appendChild(celda);
    celdas.appendChild(label);
  }
  el("mesTitulo").textContent = MESES[VISTA.getMonth()] + " de " + VISTA.getFullYear();
}

function pintarHoras() {
  const clave = diaElegido();
  hora.innerHTML = "";
  const vacio = document.createElement("option");
  vacio.value = "";
  vacio.textContent = "Elige una hora";
  hora.appendChild(vacio);
  HORAS_BASE.forEach(h => {
    const ocupados = clave ? (h.ocupados + (Number(clave.slice(-2)) + h.et.charCodeAt(0)) % 4) % 8 : h.ocupados;
    const opcion = document.createElement("option");
    opcion.value = h.v;
    opcion.textContent = h.et + (ocupados > 6 ? " · casi lleno" : ocupados > 4 ? " · quedan pocas" : "");
    opcion.disabled = ocupados > 6;
    hora.appendChild(opcion);
  });
}

function diaElegido() {
  const marcado = document.querySelector('input[name="dia"]:checked');
  return marcado ? marcado.value : "";
}

function fechaLarga(clave) {
  if (!clave) return "";
  const p = clave.split("-");
  const fecha = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  return DIAS_SEMANA[(fecha.getDay() + 6) % 7] + " " + fecha.getDate() + " de " + MESES[fecha.getMonth()];
}

function fechaConfirmacion(clave) {
  return fechaLarga(clave) || "sin elegir";
}

const CAMPOS = [
  {
    id: "fecha", tipo: "dia",
    etiqueta: "Día de la reserva",
    vacio: "Elige un día en el calendario de arriba.",
    error: "Ese día no admite reservas. Elige otro con huecos libres.",
    prueba: v => v !== "" && estadoDia(Number(v.slice(-2))) !== "llena" && estadoDia(Number(v.slice(-2))) !== "pasado"
  },
  {
    id: "hora",
    etiqueta: "Hora de llegada",
    vacio: "Falta elegir la hora de la mesa.",
    error: "Esa hora está completa o no existe en el turno de cocina.",
    prueba: v => v !== "" && !hora.options[hora.selectedIndex].disabled
  },
  {
    id: "comensales",
    etiqueta: "Comensales",
    vacio: "Dinos cuántas personas vienen.",
    error: "Entre 1 y 10 comensales por reserva.",
    prueba: v => /^\d{1,2}$/.test(v) && Number(v) >= 1 && Number(v) <= 10
  },
  {
    id: "zona",
    etiqueta: "Zona preferida",
    vacio: "",
    error: "",
    prueba: v => ["", "terraza", "salon", "barra", "atras"].includes(v),
    suave: true
  },
  {
    id: "ocasion",
    etiqueta: "Ocasión",
    vacio: "Selecciona la ocasión de la cena.",
    error: "Elige una de las ocasiones de la lista.",
    prueba: v => ["cumple", "negocios", "aniversario", "despedida", "sin"].includes(v)
  },
  {
    id: "nombre",
    etiqueta: "Nombre de la reserva",
    vacio: "Escribe el nombre a nombre del que reservamos.",
    error: "Entre 2 y 40 caracteres, con al menos dos letras.",
    prueba: v => v.length >= 2 && v.length <= 40 && /[a-zA-ZÀ-ÿ]{2}/.test(v)
  },
  {
    id: "telefono",
    etiqueta: "Teléfono",
    vacio: "Necesitamos un teléfono para el recordatorio.",
    error: "Debe ser un número español de nueve cifras, entre 600 y 799.",
    prueba: v => /^[6-7][0-9]{8}$/.test(v.replace(/[\s.-]/g, ""))
  },
  {
    id: "correo",
    etiqueta: "Correo",
    vacio: "Falta el correo donde enviar la confirmación.",
    error: "Revisa el formato, debería parecerse a nombre@dominio.com.",
    prueba: v => /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(v)
  }
];

function contenedor(f) {
  if (f.id === "fecha") return document.querySelector(".bloque-calendario");
  return el(f.id).closest(".campo");
}

function valor(f) {
  return f.id === "fecha" ? diaElegido() : el(f.id).value.trim();
}

function pintar(f) {
  const env = contenedor(f);
  const ayuda = el(f.id + "-ayuda");
  const error = el(f.id + "-error");
  const v = valor(f);
  const vacio = v === "";
  const malo = !vacio && !f.prueba(v);
  const fallo = f.suave ? malo : (vacio || malo);
  const desc = [ayuda.id];

  if (f.id === "fecha") {
    document.querySelectorAll('.bloque-calendario input[name="dia"]').forEach(i => i.removeAttribute("aria-invalid"));
  } else {
    el(f.id).setAttribute("aria-invalid", fallo ? "true" : "false");
  }

  if (fallo) {
    env.dataset.estado = "error";
    desc.push(error.id);
    error.textContent = vacio ? f.vacio : f.error;
  } else {
    env.dataset.estado = vacio ? "neutro" : "ok";
    error.textContent = "";
  }

  if (f.id === "fecha") {
    document.querySelectorAll('.bloque-calendario input[name="dia"]:checked').forEach(i => {
      i.setAttribute("aria-invalid", "true");
    });
    celdas.setAttribute("aria-describedby", desc.join(" "));
  } else {
    el(f.id).setAttribute("aria-describedby", desc.join(" "));
  }

  return fallo;
}

function problemaDe(f) {
  const v = valor(f);
  if (f.suave) return v !== "" && !f.prueba(v);
  return v === "" || !f.prueba(v);
}

function pintarTodo() {
  let primero = null;
  CAMPOS.forEach(f => {
    const fallo = pintar(f);
    if (fallo && !primero) primero = f.id === "fecha" ? celdas : el(f.id);
  });
  return primero;
}

function textoZona() {
  return zona.value ? zona.options[zona.selectedIndex].text : "";
}

function textoOcasion() {
  return ocasion.value ? occasionTexto() : "";
}

function occasionTexto() {
  return ocasion.options[ocasion.selectedIndex].text;
}

function asignarMesa() {
  const n = Number(comensales.value);
  if (!Number.isInteger(n) || n < 1) return "sin elegir";
  if (n <= 2) return "Mesa 4, dos patas";
  if (n <= 4) return "Mesa 7, la del centro";
  if (n <= 6) return "Mesa 11, junto a la chimenea";
  return "Salón de atrás, mesas 1 y 2";
}

function pintarResumen() {
  const clave = diaElegido();
  const filas = document.getElementById("resumenFilas");
  filas.innerHTML = "";

  const datos = [
    ["Día", fechaLarga(clave)],
    ["Hora", hora.value || ""],
    ["Comensales", Number.isInteger(Number(comensales.value)) && Number(comensales.value) > 0 ? comensales.value + " personas" : ""],
    ["Zona", textoZona()],
    ["Ocasión", textoOcasion()],
    ["A nombre de", nombre.value.trim()],
    ["Teléfono", telefono.value.trim()],
    ["Correo", correo.value.trim()]
  ];

  let n = 0;
  datos.forEach(d => {
    if (!d[1]) return;
    const li = document.createElement("li");
    li.style.animationDelay = n * 0.03 + "s";
    const b = document.createElement("b");
    b.textContent = d[0];
    const s = document.createElement("span");
    s.textContent = d[1];
    li.appendChild(b);
    li.appendChild(s);
    filas.appendChild(li);
    n += 1;
  });

  el("resumenVacio").hidden = n > 0;
  el("mesaAsignada").textContent = asignarMesa();
  el("huecosDia").textContent = clave ? huecos[clave] + " de 6 turnos" : "—";
  el("resumenPie").textContent = clave && n === 8
    ? "Todo listo. La mesa se mantiene quince minutos de cortesía y no cobra depósito."
    : "Sin coste de reserva. La mesa se guarda quince minutos de cortesía.";
}

CAMPOS.forEach(f => {
  if (f.id === "fecha") {
    celdas.addEventListener("change", () => {
      if (document.querySelector(".bloque-calendario").dataset.estado !== "neutro") pintar(f);
      pintarHoras();
      pintarResumen();
    });
    return;
  }
  const nodo = el(f.id);
  nodo.addEventListener("blur", () => { pintar(f); pintarResumen(); });
  nodo.addEventListener("input", () => {
    if (nodo.closest(".campo").dataset.estado === "error") pintar(f);
    pintarResumen();
  });
  nodo.addEventListener("change", () => {
    if (nodo.closest(".campo").dataset.estado === "error") pintar(f);
    pintarResumen();
  });
});

form.addEventListener("submit", e => {
  e.preventDefault();
  const primero = pintarTodo();
  pintarResumen();

  const fallos = CAMPOS.filter(problemaDe);
  if (fallos.length > 0) {
    tituloError.textContent = fallos.length === 1
      ? "Falta corregir un detalle de la reserva"
      : "Faltan " + fallos.length + " detalles de la reserva";
    listaError.innerHTML = "";
    fallos.forEach(f => {
      const li = document.createElement("li");
      const v = valor(f);
      li.textContent = f.etiqueta + ": " + (v === "" ? f.vacio : f.error);
      listaError.appendChild(li);
    });
    resumenError.hidden = false;
    if (primero) primero.focus();
    return;
  }

  resumenError.hidden = true;
  completar();
});

function completar() {
  const ref = "TD-" + String(Math.floor(100000 + Math.random() * 900000));
  el("confirmadaRef").textContent = ref;
  el("confirmadaDia").textContent = fechaConfirmacion(diaElegido());
  el("confirmadaHora").textContent = hora.options[hora.selectedIndex].text;
  el("confirmadaComensales").textContent = comensales.value + " personas";
  el("confirmadaMesa").textContent = asignarMesa();
  el("confirmadaZona").textContent = textoZona() || "Sin preferencia";
  el("confirmadaTitulo").textContent = "Mesa guardada para " + nombre.value.trim();
  el("confirmadaTexto").textContent = "Hemos mandado la confirmación a " + correo.value.trim() +
    " y el recordatorio " + (el("aviso").checked ? "por SMS" : "por correo") + ".";

  form.hidden = true;
  document.querySelector(".encabezado").hidden = true;
  confirmada.hidden = false;
  confirmada.focus();
}

function reiniciar() {
  form.reset();
  document.querySelectorAll('input[name="dia"]').forEach(i => { i.checked = false; });
  comensales.value = "2";
  CAMPOS.forEach(f => {
    contenedor(f).dataset.estado = "neutro";
    el(f.id + "-error").textContent = "";
    if (f.id !== "fecha") {
      el(f.id).setAttribute("aria-invalid", "false");
      el(f.id).setAttribute("aria-describedby", f.id + "-ayuda");
    }
  });
  document.querySelectorAll('.bloque-calendario input[name="dia"]').forEach(i => i.removeAttribute("aria-invalid"));
  resumenError.hidden = true;
  pintarHoras();
  pintarResumen();
  const primera = celdas.querySelector("input:not([disabled])");
  if (primera) primera.focus();
}

el("limpiar").addEventListener("click", reiniciar);

el("otra").addEventListener("click", () => {
  confirmada.hidden = true;
  form.hidden = false;
  document.querySelector(".encabezado").hidden = false;
  reiniciar();
});

pintarCalendario();
pintarHoras();
pintarResumen();
