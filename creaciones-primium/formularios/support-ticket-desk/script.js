const form = document.getElementById("form");
const asunto = document.getElementById("asunto");
const canal = document.getElementById("canal");
const contacto = document.getElementById("contacto");
const entorno = document.getElementById("entorno");
const alcance = document.getElementById("alcance");
const descripcion = document.getElementById("descripcion");
const pasos = document.getElementById("pasos");
const esperado = document.getElementById("esperado");
const traza = document.getElementById("traza");
const registro = document.getElementById("registro");
const consentimiento = document.getElementById("consentimiento");
const resumenError = document.getElementById("resumenError");
const listaError = document.getElementById("resumenErrorLista");
const tituloError = document.getElementById("resumenErrorTitulo");
const registrado = document.getElementById("registrado");

const SEV = {
  critica: { texto: "Crítica", sla: "15 minutos, 24 horas al día", tono: "critica" },
  alta: { texto: "Alta", sla: "1 hora en horario laboral", tono: "alta" },
  media: { texto: "Media", sla: "4 horas laborables", tono: "media" },
  baja: { texto: "Baja", sla: "en la cola de la semana", tono: "baja" }
};

const CAMPOS = [
  {
    id: "asunto",
    etiqueta: "Asunto",
    vacio: "Escribe el asunto en una línea para que se pueda clasificar.",
    error: "Entre 8 y 110 caracteres, empezando por una palabra de verdad.",
    prueba: v => v.length >= 8 && v.length <= 110 && /[a-zA-ZÀ-ÿ]/.test(v)
  },
  {
    id: "canal",
    etiqueta: "Canal de entrada",
    vacio: "Indica por dónde nos ha llegado el aviso.",
    error: "Ese canal no existe en el centro de servicios.",
    prueba: v => ["correo", "chat", "telefono", "web", "telemonitor"].includes(v)
  },
  {
    id: "contacto",
    etiqueta: "Correo de contacto",
    vacio: "Falta un correo para poder responderte.",
    error: "Revisa el formato, debería parecerse a nombre@dominio.com.",
    prueba: v => /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(v)
  },
  {
    id: "severidad", tipo: "radio",
    etiqueta: "Severidad",
    vacio: "Elige la severidad del problema.",
    error: "Esa severidad no está en el catálogo del centro de servicios.",
    prueba: v => ["critica", "alta", "media", "baja"].includes(v)
  },
  {
    id: "entorno",
    etiqueta: "Entorno afectado",
    vacio: "Elige en qué entorno se ve el fallo.",
    error: "Ese entorno no está dado de alta en la plataforma.",
    prueba: v => ["produccion", "staging", "movil", "web", "api", "facturacion"].includes(v)
  },
  {
    id: "alcance",
    etiqueta: "Alcance del problema",
    vacio: "Di qué tienda, empresa o módulo se ve afectado.",
    error: "Entre 4 y 80 caracteres, con al menos un número o una letra.",
    prueba: v => v.length >= 4 && v.length <= 80
  },
  {
    id: "descripcion",
    etiqueta: "Qué ocurre",
    vacio: "Describe el síntoma que observas.",
    error: "Entre 60 y 2.000 caracteres. Falta contexto para entenderlo.",
    prueba: v => v.length >= 60 && v.length <= 2000
  },
  {
    id: "pasos",
    etiqueta: "Pasos para reproducirlo",
    vacio: "Sin pasos no podemos reproducir el fallo.",
    error: "Entre 30 y 1.200 caracteres, uno por línea y empezando por el estado inicial.",
    prueba: v => v.length >= 30 && v.length <= 1200
  },
  {
    id: "esperado",
    etiqueta: "Resultado esperado",
    vacio: "Escribe qué debería haber pasado en tu lugar.",
    error: "Entre 20 y 800 caracteres.",
    prueba: v => v.length >= 20 && v.length <= 800
  },
  {
    id: "traza",
    etiqueta: "Código de traza",
    vacio: "Sin traza el técnico tendrá que reproducirlo a ciegas.",
    error: "Formato TRZ- seguido de ocho caracteres en hexadecimal del 0 al F.",
    prueba: v => /^[A-Z]{3}-[0-9A-F]{8}$/.test(v)
  },
  {
    id: "registro",
    etiqueta: "Hora del fallo",
    vacio: "Indica la hora aproximada a la que ocurrió.",
    error: "Elige una fecha y hora dentro de los últimos treinta días.",
    prueba: v => horaValida(v)
  },
  {
    id: "consentimiento", tipo: "check",
    etiqueta: "Consentimiento de diagnóstico",
    vacio: "Sin el consentimiento solo podemos trabajar con lo que escribas aquí.",
    error: "Hay que marcarlo para registrar la incidencia.",
    prueba: v => v === "si"
  }
];

function el(id) { return document.getElementById(id); }

function severidadActual() {
  const marcado = document.querySelector('input[name="severidad"]:checked');
  return marcado ? marcado.value : "";
}

function horaValida(v) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v)) return false;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return false;
  const ahora = new Date();
  const limite = new Date(ahora.getTime() - 30 * 86400000);
  return d <= ahora && d >= limite;
}

function valor(f) {
  if (f.id === "severidad") return severidadActual();
  if (f.id === "consentimiento") return consentimiento.checked ? "si" : "";
  return el(f.id).value.trim();
}

function contenedor(f) {
  if (f.id === "severidad") return document.querySelector(".severidades");
  return el(f.id).closest(".campo");
}

function pintar(f) {
  const env = contenedor(f);
  const ayuda = el(f.id + "-ayuda");
  const error = el(f.id + "-error");
  const v = valor(f);
  const vacio = v === "";
  const malo = !vacio && !f.prueba(v);
  const desc = [ayuda.id];

  if (f.tipo === "check") consentimiento.setAttribute("aria-invalid", (vacio || malo) ? "true" : "false");
  else if (f.tipo === "radio") document.querySelector('input[name="severidad"]').setAttribute("aria-invalid", (vacio || malo) ? "true" : "false");
  else el(f.id).setAttribute("aria-invalid", (vacio || malo) ? "true" : "false");

  if (vacio || malo) {
    env.dataset.estado = "error";
    desc.push(error.id);
    error.textContent = vacio ? f.vacio : f.error;
  } else {
    env.dataset.estado = "ok";
    error.textContent = "";
  }

  if (f.tipo === "radio") {
    document.querySelector(".severidades").setAttribute("aria-describedby", desc.join(" "));
  } else {
    el(f.id).setAttribute("aria-describedby", desc.join(" "));
  }

  return vacio || malo;
}

function problemaDe(f) {
  const v = valor(f);
  return v === "" || !f.prueba(v);
}

function pintarTodo() {
  let primero = null;
  CAMPOS.forEach(f => {
    const fallo = pintar(f);
    if (fallo && !primero) {
      primero = f.tipo === "radio" ? document.querySelector('input[name="severidad"]') : el(f.id);
    }
  });
  return primero;
}

const CHECKS = [
  { id: "asunto", texto: "Asunto con al menos ocho caracteres" },
  { id: "entorno", texto: "Entorno afectado identificado" },
  { id: "severidad", texto: "Severidad asignada" },
  { id: "descripcion", texto: "Síntoma descrito con detalle" },
  { id: "pasos", texto: "Pasos de reproducción escritos" },
  { id: "traza", texto: "Código de traza válido" }
];

function pintarVista() {
  const sev = severidadActual();
  const info = SEV[sev] || { texto: "Sin severidad", sla: "por confirmar", tono: "alta" };

  const banda = el("ticketBanda");
  banda.dataset.sev = info.tono;
  banda.textContent = "Severidad " + info.texto.toLowerCase() + " · respuesta en " + info.sla;

  el("ticketAsunto").textContent = asunto.value.trim() || "Sin asunto todavía";
  el("ticketMeta").textContent = "Registrado por " +
    (canal.value ? canal.options[canal.selectedIndex].text.toLowerCase() : "el formulario web") +
    ", " + (contacto.value.trim() || "sin contacto de respuesta");
  el("ticketEntorno").textContent = entorno.value ? entorno.options[entorno.selectedIndex].text : "sin elegir";
  el("ticketAlcance").textContent = alcance.value.trim() || "sin indicar";
  el("ticketTraza").textContent = traza.value.trim() || "sin código";
  el("ticketContacto").textContent = contacto.value.trim() || "sin correo";
  el("ticketDescripcion").textContent = descripcion.value.trim() || "Aún no has descrito el problema.";
  el("ticketEsperado").textContent = esperado.value.trim() || "Sin especificar.";

  const lista = el("ticketPasos");
  lista.innerHTML = "";
  const lineas = pasos.value.split("\n").map(l => l.trim()).filter(l => l !== "");
  if (lineas.length === 0) {
    const li = document.createElement("li");
    li.className = "ticket-paso-vacio";
    li.textContent = "Sin pasos añadidos";
    lista.appendChild(li);
  } else {
    lineas.slice(0, 6).forEach((l, i) => {
      const li = document.createElement("li");
      li.textContent = l.replace(/^\d+[.)]\s*/, "");
      li.style.animation = "entraItem 0.3s var(--ease) both";
      li.style.animationDelay = i * 0.04 + "s";
      lista.appendChild(li);
    });
  }

  const checks = document.getElementById("vistaChecks");
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

CAMPOS.forEach(f => {
  if (f.tipo === "check") {
    consentimiento.addEventListener("change", () => { pintar(f); pintarVista(); });
    return;
  }
  if (f.tipo === "radio") {
    document.querySelectorAll('input[name="severidad"]').forEach(r => {
      r.addEventListener("change", () => { pintar(f); pintarVista(); });
      r.addEventListener("blur", () => pintar(f));
    });
    return;
  }
  const nodo = el(f.id);
  nodo.addEventListener("blur", () => { pintar(f); pintarVista(); });
  nodo.addEventListener("input", () => {
    if (nodo.closest(".campo").dataset.estado === "error") pintar(f);
    pintarVista();
  });
  nodo.addEventListener("change", pintarVista);
});

traza.addEventListener("input", function () {
  let v = this.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 11);
  if (v.length > 3) v = v.slice(0, 3) + "-" + v.slice(3);
  this.value = v;
});

form.addEventListener("submit", e => {
  e.preventDefault();
  const primero = pintarTodo();
  pintarVista();

  const fallos = CAMPOS.filter(problemaDe);
  if (fallos.length > 0) {
    tituloError.textContent = fallos.length === 1
      ? "Falta un dato para registrar la incidencia"
      : "Faltan " + fallos.length + " datos para registrar la incidencia";
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
  const ref = "TK-2026-" + String(Math.floor(10000 + Math.random() * 90000));
  const info = SEV[severidadActual()];

  el("registradoRef").textContent = ref;
  el("registradoSeveridad").textContent = info.texto;
  el("registradoSla").textContent = info.sla;
  el("registradoEntorno").textContent = entorno.options[entorno.selectedIndex].text;
  el("registradoTitulo").textContent = "Ticket " + ref + " creado";
  el("registradoTexto").textContent = "Hemos mandado el acuse a " + contacto.value.trim() +
    " con el código de traza " + traza.value.trim() + " para que puedas citarlo en el chat.";

  form.hidden = true;
  document.querySelector(".encabezado").hidden = true;
  document.querySelector(".vista").hidden = true;
  registrado.hidden = false;
  registrado.focus();
}

el("otra").addEventListener("click", () => {
  registrado.hidden = true;
  form.hidden = false;
  document.querySelector(".encabezado").hidden = false;
  document.querySelector(".vista").hidden = false;
  form.reset();
  document.querySelector('input[name="severidad"][value="alta"]').checked = true;
  CAMPOS.forEach(f => {
    contenedor(f).dataset.estado = "neutro";
    el(f.id + "-error").textContent = "";
    if (f.tipo === "radio") {
      document.querySelector('input[name="severidad"]').setAttribute("aria-invalid", "false");
      return;
    }
    el(f.id).setAttribute("aria-invalid", "false");
    el(f.id).setAttribute("aria-describedby", f.id + "-ayuda");
  });
  consentimiento.setAttribute("aria-invalid", "false");
  resumenError.hidden = true;
  pintarVista();
  asunto.focus();
});

pintarVista();
