const form = document.getElementById("form");
const reloj = document.getElementById("reloj");
const taller = document.getElementById("taller");
const nombre = document.getElementById("nombre");
const correo = document.getElementById("correo");
const empresa = document.getElementById("empresa");
const dietas = document.getElementById("dietas");
const notas = document.getElementById("notas");
const codigo = document.getElementById("codigo");
const resumenError = document.getElementById("resumenError");
const listaError = document.getElementById("resumenErrorLista");
const tituloError = document.getElementById("resumenErrorTitulo");
const confirmada = document.getElementById("confirmada");

const SESIONES = [
  { id: "s1", hora: "09:30", titulo: "Apertura y mapa del año", quedan: 96 },
  { id: "s2", hora: "11:00", titulo: "Cuánto cuesta mantener un producto vivo", quedan: 24 },
  { id: "s3", hora: "12:30", titulo: "Almuerzo del foro", quedan: 58 },
  { id: "s4", hora: "16:00", titulo: "Atención al cliente sin turnos", quedan: 3 },
  { id: "s5", hora: "17:30", titulo: "Medir lo que no se puede medir", quedan: 0 },
  { id: "s6", hora: "19:00", titulo: "Mesa redonda, límites del crecimiento", quedan: 41 },
  { id: "s7", hora: "20:30", titulo: "Cena de debate", quedan: 12 }
];

const ENTRADAS = {
  general: { texto: "General", precio: 180, taller: false },
  taller: { texto: "General con Taller", precio: 295, taller: true },
  vip: { texto: "Zona vip", precio: 420, taller: false }
};

const TALLERES = {
  accesibilidad: { texto: "Accesibilidad web", precio: 60, plazas: 24 },
  metricas: { texto: "Métricas sin cookies", precio: 60, plazas: 18 },
  agil: { texto: "Trabajo ágil", precio: 60, plazas: 12 }
};

const PLAZAS_TOTALES = 480;

const CAMPOS = [
  {
    id: "agenda", tipo: "agenda",
    etiqueta: "Sesiones",
    vacio: "Marca al menos una sesión del programa.",
    error: "",
    prueba: () => sesionesMarcadas().length > 0
  },
  {
    id: "entrada", tipo: "radio",
    etiqueta: "Tipo de entrada",
    vacio: "Elige la modalidad de la entrada.",
    error: "Esa modalidad no está entre las tres disponibles.",
    prueba: v => ["general", "taller", "vip"].includes(v)
  },
  {
    id: "taller", tipo: "opcional",
    etiqueta: "Taller",
    vacio: "",
    error: "",
    prueba: v => v === "" || Object.keys(TALLERES).includes(v)
  },
  {
    id: "nombre",
    etiqueta: "Nombre y apellidos",
    vacio: "Escribe el nombre tal como va en la acreditación.",
    error: "Entre 3 y 60 caracteres, con nombre y al menos un apellido.",
    prueba: v => v.length >= 3 && v.length <= 60 && v.trim().split(/\s+/).length >= 2 && /[a-zA-ZÀ-ÿ]/.test(v)
  },
  {
    id: "correo",
    etiqueta: "Correo",
    vacio: "Falta el correo donde mandamos la entrada.",
    error: "Revisa el formato, debería parecerse a nombre@dominio.com.",
    prueba: v => /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(v)
  },
  {
    id: "empresa",
    etiqueta: "Empresa",
    vacio: "Escribe la empresa, el colectivo o la escuela.",
    error: "Entre 2 y 50 caracteres.",
    prueba: v => v.length >= 2 && v.length <= 50 && /[a-zA-ZÀ-ÿ]/.test(v)
  },
  {
    id: "dietas",
    etiqueta: "Dieta",
    vacio: "Elige la dieta del almuerzo o marca que tienes alergias.",
    error: "Esa dieta no está en la lista del catering.",
    prueba: v => ["normal", "vegetariana", "sin-gluten", "vegana", "alergia"].includes(v)
  },
  {
    id: "notas", suave: true,
    etiqueta: "Notas",
    vacio: "",
    error: "",
    prueba: v => v.length <= 400
  },
  {
    id: "codigo", tipo: "check", suave: true,
    etiqueta: "Código de socio",
    vacio: "",
    error: "",
    prueba: () => true
  }
];

function el(id) { return document.getElementById(id); }

function dinero(n) {
  return n.toFixed(2).replace(".", ",") + " €";
}

function pintarAgenda() {
  reloj.innerHTML = "";
  SESIONES.forEach((s, i) => {
    const estado = s.quedan === 0 ? "llena" : s.quedan <= 8 ? "justa" : "libre";
    const cerrado = estado === "llena";

    const label = document.createElement("label");
    label.className = "franja";
    label.dataset.estado = estado;
    label.dataset.cerrado = cerrado ? "1" : "0";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.name = "sesion";
    input.value = s.id;
    input.disabled = cerrado;
    input.setAttribute("aria-describedby", "agenda-ayuda");

    const hora = document.createElement("span");
    hora.className = "franja-hora";
    hora.textContent = s.hora;

    const punto = document.createElement("span");
    punto.className = "franja-punto";
    punto.setAttribute("aria-hidden", "true");
    punto.style.setProperty("--d", i * 0.28 + "s");

    const titulo = document.createElement("span");
    titulo.className = "franja-titulo";
    titulo.textContent = s.titulo;

    const quedan = document.createElement("span");
    quedan.className = "franja-quedan";
    quedan.textContent = cerrado ? "completo" : s.quedan + " plazas";

    label.appendChild(input);
    label.appendChild(hora);
    label.appendChild(punto);
    label.appendChild(titulo);
    label.appendChild(quedan);
    reloj.appendChild(label);
  });
}

function sesionesMarcadas() {
  return Array.from(document.querySelectorAll('input[name="sesion"]:checked')).map(c => c.value);
}

function entradaActual() {
  const marcado = document.querySelector('input[name="entrada"]:checked');
  return marcado ? marcado.value : "";
}

function valor(f) {
  if (f.id === "agenda") return sesionesMarcadas().length > 0 ? "si" : "";
  if (f.id === "entrada") return entradaActual();
  if (f.id === "codigo") return "si";
  return el(f.id).value.trim();
}

function contenedor(f) {
  if (f.id === "agenda") return document.querySelector(".agenda");
  if (f.id === "entrada") return document.querySelector(".entradas");
  return el(f.id).closest(".campo");
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

  if (f.id === "agenda") {
    document.querySelector('input[name="sesion"]').setAttribute("aria-invalid", fallo ? "true" : "false");
  } else if (f.id === "entrada") {
    document.querySelector('input[name="entrada"]').setAttribute("aria-invalid", fallo ? "true" : "false");
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

  if (f.id === "agenda") document.querySelector(".agenda").setAttribute("aria-describedby", desc.join(" "));
  else if (f.id === "entrada") document.querySelector(".entradas").setAttribute("aria-describedby", desc.join(" "));
  else el(f.id).setAttribute("aria-describedby", desc.join(" "));

  return fallo;
}

function problemaDe(f) {
  const v = valor(f);
  if (f.suave) return !f.prueba(v);
  return v === "" || !f.prueba(v);
}

function totales() {
  const sesiones = SESIONES.filter(s => sesionesMarcadas().includes(s.id));
  const clave = entradaActual();
  const info = ENTRADAS[clave] || { texto: "sin elegir", precio: 0, taller: false };
  const esTaller = taller.value && TALLERES[taller.value];
  const costeTaller = esTaller && info.taller ? esTaller.precio : 0;
  const base = info.precio + costeTaller;
  const dto = codigo.checked && clave === "general" ? base * 0.2 : 0;
  return {
    sesiones,
    info,
    esTaller: esTaller && info.taller ? esTaller : null,
    base,
    dto,
    final: base - dto
  };
}

const CHECKS = [
  { id: "agenda", texto: "Al menos una sesión elegida" },
  { id: "entrada", texto: "Modalidad de entrada válida" },
  { id: "nombre", texto: "Nombre completo del asistente" },
  { id: "correo", texto: "Correo con formato válido" },
  { id: "empresa", texto: "Empresa o colectivo indicado" },
  { id: "dietas", texto: "Dieta del almuerzo decidida" }
];

function pintarResumen() {
  const t = totales();
  const listaSesiones = document.getElementById("resumenSesiones");
  listaSesiones.innerHTML = "";

  t.sesiones.forEach((s, i) => {
    const li = document.createElement("li");
    li.style.animationDelay = i * 0.05 + "s";
    const b = document.createElement("b");
    b.textContent = s.hora + " · " + s.titulo;
    const sp = document.createElement("span");
    sp.textContent = s.quedan + " libres";
    li.appendChild(b);
    li.appendChild(sp);
    listaSesiones.appendChild(li);
  });

  el("resumenVacio").hidden = t.sesiones.length > 0;
  el("cEntrada").textContent = t.info.texto + ", " + dinero(t.info.precio);
  el("cTaller").textContent = t.esTaller ? t.esTaller.texto + ", " + dinero(t.esTaller.precio) : "sin taller";
  el("cDescuento").textContent = t.dto > 0 ? "menos " + dinero(t.dto) : "sin descuento";
  el("cTotal").textContent = dinero(t.final);

  const ocupadas = t.sesiones.length;
  const libres = Math.max(0, PLAZAS_TOTALES - ocupadas * 42);
  el("aforoCifra").textContent = libres + " de " + PLAZAS_TOTALES;
  el("aforoRelleno").style.transform = "scaleX(" + (1 - libres / PLAZAS_TOTALES).toFixed(4) + ")";
  el("aforoPie").textContent = ocupadas === 0
    ? "Aún no has ocupado ninguna plaza."
    : ocupadas + (ocupadas === 1 ? " sesión reservada" : " sesiones reservadas") +
      " para " + nombre.value.trim().split(" ")[0] + ".";

  const checks = document.getElementById("resumenLista");
  if (checks.childElementCount !== CHECKS.length) {
    checks.innerHTML = "";
    CHECKS.forEach(c => {
      const li = document.createElement("li");
      li.dataset.para = c.id;
      li.textContent = c.texto;
      checks.appendChild(li);
    });
  }
  CHECKS.forEach(c => {
    const f = CAMPOS.find(x => x.id === c.id);
    const li = checks.querySelector('[data-para="' + c.id + '"]');
    if (li) li.dataset.hecho = !problemaDe(f) ? "1" : "0";
  });
}

reloj.addEventListener("change", () => {
  if (document.querySelector(".agenda").dataset.estado !== "neutro") pintar(CAMPOS.find(f => f.id === "agenda"));
  pintarResumen();
});

document.querySelectorAll('input[name="entrada"]').forEach(r => {
  r.addEventListener("change", () => {
    if (document.querySelector(".entradas").dataset.estado !== "neutro") pintar(CAMPOS.find(x => x.id === "entrada"));
    pintar(CAMPOS.find(x => x.id === "taller"));
    pintarResumen();
  });
  r.addEventListener("blur", () => pintar(CAMPOS.find(x => x.id === "entrada")));
});

CAMPOS.forEach(f => {
  if (f.id === "agenda" || f.id === "entrada") return;
  if (f.tipo === "check") {
    codigo.addEventListener("change", pintarResumen);
    return;
  }
  const nodo = el(f.id);
  nodo.addEventListener("blur", () => { pintar(f); pintarResumen(); });
  nodo.addEventListener("input", () => {
    if (nodo.closest(".campo").dataset.estado === "error") pintar(f);
    pintarResumen();
  });
  nodo.addEventListener("change", () => { pintar(f); pintarResumen(); });
});

form.addEventListener("submit", e => {
  e.preventDefault();
  let primero = null;
  CAMPOS.forEach(f => {
    const fallo = pintar(f);
    if (fallo && !primero) {
      primero = f.id === "agenda"
        ? document.querySelector('input[name="sesion"]:not([disabled])')
        : f.id === "entrada" ? document.querySelector('input[name="entrada"]') : el(f.id);
    }
  });
  pintarResumen();

  const fallos = CAMPOS.filter(problemaDe);
  if (fallos.length > 0) {
    tituloError.textContent = fallos.length === 1
      ? "Falta un dato para cerrar la inscripción"
      : "Faltan " + fallos.length + " datos para cerrar la inscripción";
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
  const t = totales();
  const ref = "FC-" + String(Math.floor(100000 + Math.random() * 900000));

  el("confirmadaRef").textContent = ref;
  el("confirmadaNombre").textContent = nombre.value.trim();
  el("confirmadaEntrada").textContent = t.info.texto;
  el("confirmadaSesiones").textContent = t.sesiones.length + (t.sesiones.length === 1 ? " sesión" : " sesiones");
  el("confirmadaTaller").textContent = t.esTaller ? t.esTaller.texto : "sin taller";
  el("confirmadaTotal").textContent = dinero(t.final);
  el("confirmadaTitulo").textContent = "Plaza guardada, " + nombre.value.trim().split(" ")[0];
  el("confirmadaTexto").textContent = "Localizador " + ref + " enviado a " + correo.value.trim() +
    " con el detalle de " + t.sesiones.length + (t.sesiones.length === 1 ? " sesión" : " sesiones") + ".";

  form.hidden = true;
  document.querySelector(".encabezado").hidden = true;
  document.querySelector(".resumen").hidden = true;
  confirmada.hidden = false;
  confirmada.focus();
}

el("otra").addEventListener("click", () => {
  confirmada.hidden = true;
  form.hidden = false;
  document.querySelector(".encabezado").hidden = false;
  document.querySelector(".resumen").hidden = false;
  form.reset();
  document.querySelectorAll('input[name="entrada"]').forEach(r => { r.checked = r.value === "general"; });
  document.querySelectorAll('input[name="sesion"]').forEach(r => { r.checked = false; });
  CAMPOS.forEach(f => {
    contenedor(f).dataset.estado = "neutro";
    el(f.id + "-error").textContent = "";
    if (f.id === "agenda" || f.id === "entrada") return;
    el(f.id).setAttribute("aria-invalid", "false");
    el(f.id).setAttribute("aria-describedby", f.id + "-ayuda");
  });
  document.querySelector('input[name="sesion"]').setAttribute("aria-invalid", "false");
  document.querySelector('input[name="entrada"]').setAttribute("aria-invalid", "false");
  resumenError.hidden = true;
  pintarResumen();
  document.querySelector('input[name="sesion"]:not([disabled])').focus();
});

pintarAgenda();
pintarResumen();
