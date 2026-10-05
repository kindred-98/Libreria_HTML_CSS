const form = document.getElementById("form");
const zona = document.getElementById("zona");
const entrada = document.getElementById("archivos");
const cola = document.getElementById("cola");
const colaVacia = document.getElementById("colaVacia");
const titulo = document.getElementById("titulo");
const enlace = document.getElementById("enlace");
const nota = document.getElementById("nota");
const inestable = document.getElementById("inestable");
const resumenError = document.getElementById("resumenError");
const listaError = document.getElementById("resumenLista");
const tituloError = document.getElementById("resumenTitulo");
const enviado = document.getElementById("enviado");

const MAX_PIEZAS = 3;
const MAX_PESO = 4;
const ACEPTADOS = ["jpg", "jpeg", "png", "webp", "gif", "pdf", "zip", "mp4"];

let piezas = [];
let reloj = null;

const CAMPOS = [
  {
    id: "titulo",
    etiqueta: "Title of the piece",
    vacio: "The panel needs a title to file your case under.",
    error: "Between 4 and 60 characters, and no line breaks.",
    prueba: v => v.length >= 4 && v.length <= 60
  },
  {
    id: "disciplina",
    etiqueta: "Discipline",
    vacio: "Choose the discipline this piece belongs to.",
    error: "That discipline is not on the list.",
    prueba: v => ["fotografia", "video", "3d", "ilustracion", "producto"].includes(v)
  },
  {
    id: "email",
    etiqueta: "Reply address",
    vacio: "Without an address the verdict has nowhere to go.",
    error: "That address looks mistyped. It needs an at sign and a domain.",
    prueba: v => /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(v)
  },
  {
    id: "enlace",
    etiqueta: "Public link",
    vacio: "",
    error: "Links have to start with http or https and cannot hold spaces.",
    prueba: v => v === "" || /^https?:\/\/[^\s]+\.[a-zA-Z]{2,}$/.test(v)
  },
  {
    id: "nota",
    etiqueta: "One line about the work",
    vacio: "",
    error: "Two hundred and twenty characters at most.",
    prueba: v => v.length <= 220
  }
];

function el(id) { return document.getElementById(id); }

function decimal(n) {
  return n.toFixed(1).replace(".", ",");
}

function extension(nombre) {
  const trozos = nombre.split(".");
  return trozos.length > 1 ? trozos[trozos.length - 1].toLowerCase() : "";
}

function pesoLegible(bytes) {
  return bytes >= 1048576
    ? (bytes / 1048576).toFixed(1).replace(".", ",") + " MB"
    : Math.max(1, Math.round(bytes / 1024)) + " KB";
}

function pintar(f) {
  const control = el(f.id);
  const env = control.closest(".campo");
  const ayuda = el(f.id + "-ayuda");
  const mensaje = el(f.id + "-error");
  const valor = control.value.trim();
  const malo = !f.prueba(valor);
  const desc = [ayuda.id];

  if (malo) {
    env.dataset.estado = "error";
    control.setAttribute("aria-invalid", "true");
    desc.push(mensaje.id);
    mensaje.textContent = valor === "" ? f.vacio : f.error;
  } else {
    env.dataset.estado = valor === "" ? "neutro" : "ok";
    control.setAttribute("aria-invalid", "false");
    mensaje.textContent = "";
  }
  control.setAttribute("aria-describedby", desc.join(" "));
  return malo;
}

function problemaDeZona() {
  if (piezas.length === 0) {
    return "Add at least one piece: the queue is empty.";
  }
  const total = piezas.reduce((s, p) => s + p.peso, 0);
  if (total > MAX_PESO) {
    return "The queue weighs " + decimal(total / 1048576) + " MB and the limit is 4,0 MB per piece.";
  }
  const fallos = piezas.filter(p => p.estado === "fallo");
  if (fallos.length > 0) {
    return fallos.length === 1
      ? "One file did not get through. Press retry on it before sending."
      : fallos.length + " files did not get through. Press retry on each one before sending.";
  }
  const subiendo = piezas.filter(p => p.estado === "subiendo");
  if (subiendo.length > 0) return "Some files are still uploading. Wait a second.";
  return "";
}

function pintarZona() {
  const problema = problemaDeZona();
  const mensaje = el("archivos-error");
  if (problema === "") {
    zona.dataset.estado = piezas.length > 0 ? "ok" : "neutro";
    el("archivos").setAttribute("aria-invalid", "false");
    zona.setAttribute("aria-describedby", "zona-ayuda");
    mensaje.textContent = "";
    return false;
  }
  zona.dataset.estado = "error";
  el("archivos").setAttribute("aria-invalid", "true");
  zona.setAttribute("aria-describedby", "zona-ayuda archivos-error");
  mensaje.textContent = problema;
  return true;
}

function pintarCola() {
  cola.innerHTML = "";
  piezas.forEach((p, i) => {
    const li = document.createElement("li");
    li.className = "pieza";
    li.dataset.estado = p.estado;
    li.dataset.indice = String(i);

    const miniatura = document.createElement("span");
    miniatura.className = "miniatura";
    if (p.url) {
      const img = document.createElement("img");
      img.src = p.url;
      img.alt = "";
      miniatura.appendChild(img);
    } else {
      miniatura.textContent = extension(p.nombre) || "file";
    }

    const info = document.createElement("div");
    info.className = "pieza-info";

    const nombre = document.createElement("p");
    nombre.className = "pieza-nombre";
    nombre.textContent = p.nombre;

    const meta = document.createElement("p");
    meta.className = "pieza-meta";
    meta.textContent = pesoLegible(p.peso) + " · " + Math.round(p.peso / 1024) + " KB on disk";

    const barra = document.createElement("span");
    barra.className = "barra-pieza";
    barra.setAttribute("role", "progressbar");
    barra.setAttribute("aria-valuemin", "0");
    barra.setAttribute("aria-valuemax", "100");
    barra.setAttribute("aria-valuenow", String(Math.round(p.progreso)));
    barra.setAttribute("aria-valuetext", p.nombre + ", " + Math.round(p.progreso) + " per cent uploaded");
    barra.setAttribute("aria-label", "Upload of " + p.nombre);
    const relleno = document.createElement("i");
    relleno.style.transform = "scaleX(" + p.progreso / 100 + ")";
    barra.appendChild(relleno);

    const estado = document.createElement("p");
    estado.className = "pieza-estado";
    if (p.estado === "fallo") estado.textContent = "Broken at " + Math.round(p.progreso) + " per cent. " + p.motivo;
    else if (p.estado === "listo") estado.textContent = "Through, ready to send.";
    else estado.textContent = "Uploading, " + Math.round(p.progreso) + " per cent.";

    info.appendChild(nombre);
    info.appendChild(meta);
    info.appendChild(barra);
    info.appendChild(estado);

    const acciones = document.createElement("div");
    acciones.className = "pieza-acciones";

    if (p.estado === "fallo") {
      const reintentar = document.createElement("button");
      reintentar.type = "button";
      reintentar.className = "mini";
      reintentar.textContent = "Retry";
      reintentar.setAttribute("aria-label", "Retry the upload of " + p.nombre);
      reintentar.addEventListener("click", () => {
        p.intentos += 1;
        p.estado = "subiendo";
        p.motivo = "";
        p.progreso = 0;
        arrancar();
      });
      acciones.appendChild(reintentar);
    }

    const quitar = document.createElement("button");
    quitar.type = "button";
    quitar.className = "mini mini-quitar";
    quitar.textContent = "Remove";
    quitar.setAttribute("aria-label", "Remove " + p.nombre + " from the queue");
    quitar.addEventListener("click", () => {
      if (p.url) URL.revokeObjectURL(p.url);
      piezas.splice(i, 1);
      pintarCola();
      pintarZona();
      pintarCuentas();
    });
    acciones.appendChild(quitar);

    li.appendChild(miniatura);
    li.appendChild(info);
    li.appendChild(acciones);
    cola.appendChild(li);
  });
  colaVacia.hidden = piezas.length > 0;
}

function pintarCuentas() {
  const total = piezas.reduce((s, p) => s + p.peso, 0);
  el("lineaPiezas").textContent = piezas.length + " of " + MAX_PIEZAS;
  el("lineaPeso").textContent = decimal(total / 1048576) + " MB of 4,0 MB";
  el("lineaListas").textContent = String(piezas.filter(p => p.estado === "listo").length);
}

function anadir(lista) {
  const admitidos = [];
  let rechazados = 0;
  lista.forEach(f => {
    if (piezas.length + admitidos.length >= MAX_PIEZAS) return;
    if (f.size > MAX_PESO * 1048576) { rechazados += 1; return; }
    if (ACCEPTADOS.includes(extension(f.name))) { rechazados += 1; return; }
    const url = f.type.startsWith('image/') ? URL.createObjectURL(f) : "";
    admitidos.push({ nombre: f.name, peso: f.size, estado: "subiendo", progreso: 0, intentos: 0, motivo: "", url: url });
  });
  piezas = piezas.concat(admitidos);
  pintarCola();
  pintarCuentas();
  pintarZona();
  if (admitidos.length === 0 && rechazados > 0) {
    zona.dataset.estado = "error";
    el("archivos").setAttribute("aria-invalid", "true");
    zona.setAttribute("aria-describedby", "zona-ayuda archivos-error");
    el("archivos-error").textContent = "Nothing was added. Each piece has to be one of " +
      ACEPTADOS.join(", ") + " and under 4,0 MB, and the queue takes three.";
    return;
  }
  arrancar();
}

function avanzar() {
  let trabajando = false;
  piezas.forEach(p => {
    if (p.estado !== "subiendo") return;
    trabajando = true;
    p.progreso = Math.min(100, p.progreso + 7 + Math.round(Math.random() * 9));
    if (p.progreso >= 100) {
      if (inestable.checked && p.intentos === 0) {
        p.estado = "fallo";
        p.motivo = "the line dropped before the last block arrived.";
      } else {
        p.estado = "listo";
      }
    }
  });
  pintarCola();
  pintarCuentas();
  pintarZona();
  if (trabajando) reloj = window.setTimeout(arrancar, 320);
  else reloj = null;
}

function arrancar() {
  if (reloj) {
    window.clearTimeout(reloj);
    reloj = null;
  }
  if (!piezas.some(p => p.estado === "subiendo")) return;
  reloj = window.setTimeout(avanzar, 240);
}

entrada.addEventListener("change", () => {
  if (entrada.files && entrada.files.length > 0) anadir(Array.from(entrada.files));
  entrada.value = "";
});

["dragenter", "dragover"].forEach(evt => {
  zona.addEventListener(evt, e => {
    e.preventDefault();
    zona.dataset.arrastre = "true";
  });
});

["dragleave", "drop"].forEach(evt => {
  zona.addEventListener(evt, e => {
    e.preventDefault();
    zona.dataset.arrastre = "false";
  });
});

zona.addEventListener("drop", e => {
  const lista = e.dataTransfer && e.dataTransfer.files ? Array.from(e.dataTransfer.files) : [];
  if (lista.length > 0) anadir(lista);
});

titulo.addEventListener("input", () => {
  el("tituloCuenta").textContent = titulo.value.length + " of 60";
  if (titulo.closest(".campo").dataset.estado === "error") pintar(CAMPOS[0]);
});

nota.addEventListener("input", () => {
  el("notaCuenta").textContent = nota.value.length + " of 220";
  if (nota.closest(".campo").dataset.estado === "error") pintar(CAMPOS[4]);
});

enlace.addEventListener("input", () => {
  if (enlace.closest(".campo").dataset.estado === "error") pintar(CAMPOS[3]);
});

CAMPOS.forEach(f => {
  const control = el(f.id);
  control.addEventListener("blur", () => pintar(f));
  control.addEventListener("change", () => pintar(f));
});

form.addEventListener("submit", e => {
  e.preventDefault();
  let primero = null;
  CAMPOS.forEach(f => {
    if (pintar(f) && !primero) primero = el(f.id);
  });
  const falloZona = pintarZona();
  const fallos = CAMPOS.filter(f => !f.prueba(el(f.id).value.trim()));

  if (fallos.length > 0 || falloZona) {
    const partes = [];
    fallos.forEach(f => {
      const li = document.createElement("li");
      const valor = el(f.id).value.trim();
      li.textContent = f.etiqueta + ": " + (valor === "" ? f.vacio : f.error);
      partes.push(li);
    });
    if (falloZona) {
      const li = document.createElement("li");
      li.textContent = "Queue: " + el("archivos-error").textContent;
      partes.push(li);
    }
    tituloError.textContent = partes.length === 1
      ? "One thing to fix before sending"
      : partes.length + " things to fix before sending";
    listaError.innerHTML = "";
    partes.forEach(li => listaError.appendChild(li));
    resumenError.hidden = false;
    if (falloZona && fallos.length === 0) {
      const malo = cola.querySelector(".pieza[data-estado='fallo'] .mini");
      (malo || entrada).focus();
    } else if (primero) {
      primero.focus();
    }
    return;
  }

  resumenError.hidden = true;
  const referencia = "CF-" + String(Math.floor(100000 + Math.random() * 900000));
  const sel = el("disciplina");
  const disciplinaTexto = sel.options[sel.selectedIndex].text;

  el("envReferencia").textContent = referencia;
  el("envDisciplina").textContent = disciplinaTexto;
  el("envPiezas").textContent = piezas.length + (piezas.length === 1 ? " piece" : " pieces");
  el("envPlazo").textContent = "Tuesday 17:00";
  el("enviadoTitulo").textContent = "Case file " + referencia + " is with the panel";
  el("enviadoTexto").textContent = "We have your " + piezas.length +
    (piezas.length === 1 ? " piece" : " pieces") + " under " + disciplinaTexto.toLowerCase() +
    " and we will answer " + el("email").value.trim() + " by Tuesday at 17:00.";

  const lista = el("enviadoLista");
  lista.innerHTML = "";
  piezas.forEach(p => {
    const li = document.createElement("li");
    const nombre = document.createElement("span");
    nombre.textContent = p.nombre;
    const peso = document.createElement("b");
    peso.textContent = pesoLegible(p.peso);
    li.appendChild(nombre);
    li.appendChild(peso);
    lista.appendChild(li);
  });

  form.hidden = true;
  enviado.hidden = false;
  enviado.focus();
});

el("otra").addEventListener("click", () => {
  if (reloj) {
    window.clearTimeout(reloj);
    reloj = null;
  }
  piezas.forEach(p => { if (p.url) URL.revokeObjectURL(p.url); });
  piezas = [];
  form.reset();
  CAMPOS.forEach(f => {
    const control = el(f.id);
    control.closest(".campo").dataset.estado = "neutro";
    control.setAttribute("aria-invalid", "false");
    control.setAttribute("aria-describedby", f.id + "-ayuda");
    el(f.id + "-error").textContent = "";
  });
  el("tituloCuenta").textContent = "0 of 60";
  el("notaCuenta").textContent = "0 of 220";
  resumenError.hidden = true;
  enviado.hidden = true;
  form.hidden = false;
  pintarCola();
  pintarCuentas();
  pintarZona();
  entrada.focus();
});

pintarCola();
pintarCuentas();
pintarZona();
