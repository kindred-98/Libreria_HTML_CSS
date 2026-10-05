const form = document.getElementById("form");
const titulo = document.getElementById("titulo");
const categoria = document.getElementById("categoria");
const pantalla = document.getElementById("pantalla");
const comentario = document.getElementById("comentario");
const reproducir = document.getElementById("reproducir");
const zona = document.getElementById("zona");
const entrada = document.getElementById("archivos");
const lista = document.getElementById("listaArchivos");
const resumenError = document.getElementById("resumenError");
const listaError = document.getElementById("resumenErrorLista");
const tituloError = document.getElementById("resumenErrorTitulo");
const recibido = document.getElementById("recibido");

const MAX_ARCHIVOS = 6;
const MAX_PESO = 25 * 1024 * 1024;
const TONOS = [
  [78, 66, 152], [126, 94, 214], [58, 92, 168], [150, 116, 200],
  [92, 74, 190], [64, 108, 176], [138, 120, 226], [86, 82, 178]
];

const archivos = [];
let contador = 0;

const CAMPOS = [
  {
    id: "titulo",
    etiqueta: "Título",
    vacio: "Ponle un título corto al error.",
    error: "Entre 8 y 90 caracteres, y sin correos ni nombres de cuenta.",
    prueba: v => v.length >= 8 && v.length <= 90 && !/@/.test(v)
  },
  {
    id: "categoria",
    etiqueta: "Tipo de fallo",
    vacio: "Elige el tipo de fallo para que llegue al equipo correcto.",
    error: "Ese tipo de fallo no está en la lista.",
    prueba: v => ["bloqueo", "datos", "rendimiento", "visual", "accesibilidad", "otro"].includes(v)
  },
  {
    id: "pantalla",
    etiqueta: "Dónde lo viste",
    vacio: "Indica en qué parte de la aplicación pasó.",
    error: "Esa pantalla no existe en la aplicación.",
    prueba: v => ["carrito", "cuenta", "movil", "correo", "otro"].includes(v)
  },
  {
    id: "impacto", tipo: "radio",
    etiqueta: "Impacto",
    vacio: "Elige cuánto te ha molestado.",
    error: "Ese nivel de impacto no está en la lista.",
    prueba: v => ["bloquea", "molesta", "estetico"].includes(v)
  },
  {
    id: "comentario",
    etiqueta: "Comentario",
    vacio: "Explica qué esperabas y qué pasó en su lugar.",
    error: "Entre 20 y 800 caracteres.",
    prueba: v => v.length >= 20 && v.length <= 800
  },
  {
    id: "archivos", tipo: "adjuntos",
    etiqueta: "Adjuntos",
    vacio: "Añade al menos una captura o un archivo de texto.",
    error: "Tienes que subir al menos un archivo antes de enviar el informe.",
    prueba: () => archivos.filter(a => a.estado === "listo").length >= 1
  },
  {
    id: "reproducir", tipo: "check",
    etiqueta: "Permiso de reproducción",
    vacio: "Hay que autorizar el uso de los adjuntos para poder reproducirlos.",
    error: "Sin ese permiso el técnico no puede abrir tus archivos.",
    prueba: v => v === "si"
  }
];

function el(id) { return document.getElementById(id); }

function pesoLegible(bytes) {
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1).replace(".", ",") + " MB";
  return Math.max(1, Math.round(bytes / 1024)) + " KB";
}

function extension(nombre) {
  const partes = nombre.split(".");
  return partes.length > 1 ? partes.pop().toUpperCase().slice(0, 4) : "ARCH";
}

function tonoDe(nombre) {
  let h = 0;
  for (let i = 0; i < nombre.length; i++) h = (h * 31 + nombre.charCodeAt(i)) >>> 0;
  const t = TONOS[h % TONOS.length];
  const u = TONOS[(h >> 3) % TONOS.length];
  return "linear-gradient(150deg, rgb(" + t[0] + "," + t[1] + "," + t[2] + "), rgb(" + u[0] + "," + u[1] + "," + u[2] + "))";
}

function valor(f) {
  if (f.id === "impacto") {
    const marcado = document.querySelector('input[name="impacto"]:checked');
    return marcado ? marcado.value : "";
  }
  if (f.id === "reproducir") return reproducir.checked ? "si" : "";
  if (f.id === "archivos") return archivos.some(a => a.estado === "listo") ? "si" : "";
  return el(f.id).value.trim();
}

function contenedor(f) {
  if (f.id === "impacto") return document.querySelector(".impacto");
  if (f.id === "archivos") return document.querySelector(".zona-bloque");
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

  if (f.id === "impacto") document.querySelector('input[name="impacto"]').setAttribute("aria-invalid", (vacio || malo) ? "true" : "false");
  else if (f.id === "reproducir") reproducir.setAttribute("aria-invalid", (vacio || malo) ? "true" : "false");
  else el(f.id).setAttribute("aria-invalid", (vacio || malo) ? "true" : "false");

  if (vacio || malo) {
    env.dataset.estado = "error";
    desc.push(error.id);
    error.textContent = vacio ? f.vacio : f.error;
  } else {
    env.dataset.estado = "ok";
    error.textContent = "";
  }

  if (f.id === "impacto") document.querySelector(".impacto").setAttribute("aria-describedby", desc.join(" "));
  else if (f.id === "archivos") zona.setAttribute("aria-describedby", desc.join(" "));
  else el(f.id).setAttribute("aria-describedby", desc.join(" "));

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
      primero = f.id === "impacto" ? document.querySelector('input[name="impacto"]') : el(f.id);
    }
  });
  return primero;
}

function pintarLista() {
  lista.innerHTML = "";
  archivos.forEach((a, i) => {
    const li = document.createElement("li");
    li.className = "archivo";
    li.dataset.estado = a.estado;
    li.style.animationDelay = i * 0.05 + "s";
    li.setAttribute("aria-describedby", "zona-ayuda");

    const mini = document.createElement("span");
    mini.className = "miniatura";
    mini.style.background = tonoDe(a.nombre);
    mini.textContent = extension(a.nombre);
    mini.setAttribute("aria-hidden", "true");

    const info = document.createElement("div");
    info.className = "archivo-info";

    const nombre = document.createElement("p");
    nombre.className = "archivo-nombre";
    nombre.textContent = a.nombre;
    nombre.title = a.nombre;

    const pista = document.createElement("div");
    pista.className = "archivo-pista";
    pista.setAttribute("role", "progressbar");
    pista.setAttribute("aria-valuemin", "0");
    pista.setAttribute("aria-valuemax", "100");
    pista.setAttribute("aria-valuenow", String(a.progreso));
    pista.setAttribute("aria-label", "Subida de " + a.nombre);

    const relleno = document.createElement("span");
    relleno.className = "archivo-relleno";
    relleno.style.transform = "scaleX(" + (a.progreso / 100).toFixed(3) + ")";
    pista.appendChild(relleno);

    const datos = document.createElement("div");
    datos.className = "archivo-datos";
    const izquierda = document.createElement("span");
    izquierda.textContent = pesoLegible(a.peso);
    const derecha = document.createElement("span");
    let estadoTexto = a.progreso + " por ciento";
    if (a.estado === "fallo") estadoTexto = "Se cortó al " + a.progreso + " por ciento";
    else if (a.estado === "listo") estadoTexto = "Subido";
    derecha.textContent = estadoTexto;
    datos.appendChild(izquierda);
    datos.appendChild(derecha);

    info.appendChild(nombre);
    info.appendChild(pista);
    info.appendChild(datos);

    const acciones = document.createElement("div");
    acciones.className = "archivo-acciones";

    if (a.estado === "fallo") {
      const reintentar = document.createElement("button");
      reintentar.type = "button";
      reintentar.className = "mini-boton";
      reintentar.textContent = "Reintentar";
      reintentar.addEventListener("click", () => {
        a.intentos += 1;
        a.estado = "subiendo";
        a.progreso = 0;
        pintarLista();
        subir(a);
      });
      acciones.appendChild(reintentar);
    }

    if (a.estado === "listo") {
      const sello = document.createElement("span");
      sello.className = "sello-estado";
      sello.setAttribute("aria-hidden", "true");
      acciones.appendChild(sello);
    }

    const quitar = document.createElement("button");
    quitar.type = "button";
    quitar.className = "mini-boton quitar";
    quitar.textContent = "Quitar";
    quitar.setAttribute("aria-label", "Quitar el archivo " + a.nombre);
    quitar.addEventListener("click", () => {
      if (a.temporizador) clearInterval(a.temporizador);
      const pos = archivos.indexOf(a);
      if (pos >= 0) archivos.splice(pos, 1);
      entrada.value = "";
      pintarLista();
      estadoAdjuntos();
    });
    acciones.appendChild(quitar);

    li.appendChild(mini);
    li.appendChild(info);
    li.appendChild(acciones);
    lista.appendChild(li);
  });

  const listos = archivos.filter(a => a.estado === "listo").length;
  el("zonaCuenta").textContent = archivos.length + " de " + MAX_ARCHIVOS + " archivos · " + listos + " listos";
  estadoAdjuntos();
}

function estadoAdjuntos() {
  const f = CAMPOS.find(x => x.id === "archivos");
  const env = contenedor(f);
  const error = el("archivos-error");
  const v = valor(f);
  if (v === "si") {
    env.dataset.estado = "ok";
    error.textContent = "";
    el("accionesPie").textContent = archivos.filter(a => a.estado === "listo").length +
      " archivo(s) subido(s), " + pesoLegible(archivos.reduce((s, a) => s + a.peso, 0)) + " en total.";
    el("accionesPie").style.color = "";
  } else if (env.dataset.estado !== "neutro") {
    env.dataset.estado = "error";
    error.textContent = f.vacio;
    el("accionesPie").textContent = "Ningún archivo subido todavía.";
    el("accionesPie").style.color = "";
  } else {
    el("accionesPie").textContent = archivos.length === 0
      ? "Ningún archivo subido todavía."
      : "Faltan " + archivos.filter(a => a.estado !== "listo").length + " archivos por terminar.";
  }
}

function subir(a) {
  if (a.temporizador) clearInterval(a.temporizador);
  const salto = 7 + Math.round(Math.random() * 11);
  a.temporizador = setInterval(() => {
    a.progreso = Math.min(100, a.progreso + salto);
    const item = lista.querySelectorAll(".archivo")[archivos.indexOf(a)];
    if (item) {
      const relleno = item.querySelector(".archivo-relleno");
      const pista = item.querySelector(".archivo-pista");
      const datos = item.querySelectorAll(".archivo-datos span");
      relleno.style.transform = "scaleX(" + (a.progreso / 100).toFixed(3) + ")";
      pista.setAttribute("aria-valuenow", String(a.progreso));
      if (datos[1]) datos[1].textContent = a.progreso + " por ciento";
    }
    if (a.progreso >= 100) {
      clearInterval(a.temporizador);
      a.temporizador = null;
      const fallar = a.peso > 3 * 1024 * 1024 && a.intentos === 0;
      a.estado = fallar ? "fallo" : "listo";
      if (fallar) a.progreso = 62;
      pintarLista();
    }
  }, 190);
}

function anadir(nombres) {
  const cupos = MAX_ARCHIVOS - archivos.length;
  const aceptados = nombres.slice(0, cupos);
  aceptados.forEach(n => {
    contador += 1;
    const nombre = typeof n === "string" ? n : (n.name || n.nombre);
    const peso = typeof n === "string" ? (60000 + (contador * 48000) % 900000) : (n.size || n.peso);
    const a = {
      nombre: nombre,
      peso: peso > MAX_PESO ? MAX_PESO : peso,
      progreso: 0,
      estado: "subiendo",
      intentos: 0,
      temporizador: null
    };
    archivos.push(a);
    pintarLista();
    subir(a);
  });
  if (nombres.length > cupos) {
    const env = contenedor(CAMPOS.find(x => x.id === "archivos"));
    env.dataset.estado = "error";
    el("archivos-error").textContent = "Solo caben " + MAX_ARCHIVOS + " archivos por informe. Quita alguno antes de añadir más.";
  }
}

zona.addEventListener("click", () => entrada.click());
zona.addEventListener("keydown", e => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    entrada.click();
  }
});

entrada.addEventListener("change", () => {
  if (entrada.files && entrada.files.length > 0) anadir(Array.from(entrada.files));
});

["dragenter", "dragover"].forEach(evt => {
  zona.addEventListener(evt, e => {
    e.preventDefault();
    zona.classList.add("encima");
  });
});

["dragleave", "drop"].forEach(evt => {
  zona.addEventListener(evt, e => {
    e.preventDefault();
    if (evt === "dragleave" && zona.contains(e.relatedTarget)) return;
    zona.classList.remove("encima");
  });
});

zona.addEventListener("drop", e => {
  e.preventDefault();
  if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
    anadir(Array.from(e.dataTransfer.files));
  }
});

CAMPOS.forEach(f => {
  if (f.tipo === "check") {
    reproducir.addEventListener("change", () => pintar(f));
    return;
  }
  if (f.tipo === "radio") {
    document.querySelectorAll('input[name="impacto"]').forEach(r => {
      r.addEventListener("change", () => pintar(f));
      r.addEventListener("blur", () => pintar(f));
    });
    return;
  }
  if (f.tipo === "adjuntos") return;
  const nodo = el(f.id);
  nodo.addEventListener("blur", () => pintar(f));
  nodo.addEventListener("input", () => {
    if (nodo.closest(".campo").dataset.estado === "error") pintar(f);
  });
  nodo.addEventListener("change", () => pintar(f));
});

form.addEventListener("submit", e => {
  e.preventDefault();
  const primero = pintarTodo();

  const fallos = CAMPOS.filter(problemaDe);
  if (fallos.length > 0) {
    tituloError.textContent = fallos.length === 1
      ? "Falta un detalle para enviar el informe"
      : "Faltan " + fallos.length + " detalles para enviar el informe";
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
  const listos = archivos.filter(a => a.estado === "listo");
  const ref = "CE-" + String(Math.floor(100000 + Math.random() * 900000));

  el("recibidoRef").textContent = ref;
  el("recibidoCategoria").textContent = categoria.options[categoria.selectedIndex].text;
  el("recibidoArchivos").textContent = listos.length + (listos.length === 1 ? " archivo" : " archivos");
  el("recibidoPeso").textContent = pesoLegible(listos.reduce((s, a) => s + a.peso, 0));
  el("recibidoTitulo").textContent = "Informe " + ref + " recibido";
  el("recibidoTexto").textContent = "Hemos guardado " + listos.length + " archivo(s) y avisamos al equipo de producto en el turno de mañana.";

  form.hidden = true;
  document.querySelector(".encabezado").hidden = true;
  recibido.hidden = false;
  recibido.focus();
}

el("otra").addEventListener("click", () => {
  recibido.hidden = true;
  form.hidden = false;
  document.querySelector(".encabezado").hidden = false;
  form.reset();
  document.querySelector('input[name="impacto"][value="bloquea"]').checked = true;
  archivos.forEach(a => { if (a.temporizador) clearInterval(a.temporizador); });
  archivos.splice(0, archivos.length);
  entrada.value = "";
  CAMPOS.forEach(f => {
    contenedor(f).dataset.estado = "neutro";
    el(f.id + "-error").textContent = "";
    if (f.tipo === "radio" || f.tipo === "adjuntos") return;
    el(f.id).setAttribute("aria-invalid", "false");
    el(f.id).setAttribute("aria-describedby", f.id + "-ayuda");
  });
  reproducir.setAttribute("aria-invalid", "false");
  document.querySelector('input[name="impacto"]').setAttribute("aria-invalid", "false");
  resumenError.hidden = true;
  pintarLista();
  titulo.focus();
});

anadir([
  { nombre: "carrito-vacio-al-cambiar-divisa.png", peso: 1420000 },
  { nombre: "registro-consola-navegador.txt", peso: 84000 },
  { nombre: "captura-factura-iva-erronea.png", peso: 4820000 }
]);
