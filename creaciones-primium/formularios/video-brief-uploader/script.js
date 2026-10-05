const form = document.getElementById("formBrief");
const avance = document.getElementById("avance");
const avanceCifra = document.getElementById("avanceCifra");
const avanceRelleno = document.getElementById("avanceRelleno");
const avanceBar = document.getElementById("avanceBar");
const avanceTexto = document.getElementById("avanceTexto");
const resumen = document.getElementById("resumenError");
const resumenTitulo = document.getElementById("resumenErrorTitulo");
const resumenLista = document.getElementById("resumenErrorLista");
const proyecto = document.getElementById("proyecto");
const correo = document.getElementById("correo");
const entrega = document.getElementById("entrega");
const jornada = document.getElementById("jornada");
const notas = document.getElementById("notas");
const licencia = document.getElementById("licencia");
const cerrada = document.getElementById("cerrada");

const MB = 1024 * 1024;
const DOMINIOS_MAS_KEBAB = ["mailinator.com", "guerrillamail.com", "10minutemail.com", "tempmail.com", "trashmail.com", "yopmail.com", "throwawaymail.com", "sharklasers.com", "grr.la", "dispostable.com"];

const ZONAS = {
  guion: {
    input: "archivoGuion",
    zona: "zonaGuion",
    lista: "listaGuion",
    cuenta: "cuentaGuion",
    error: "errorGuion",
    ext: ["pdf", "docx", "md", "txt", "rtf"],
    maxBytes: 12 * MB,
    tope: 1,
    minimo: 1,
    titulo: "The script"
  },
  videos: {
    input: "archivoVideos",
    zona: "zonaVideos",
    lista: "listaVideos",
    cuenta: "cuentaVideos",
    error: "errorVideos",
    ext: ["mp4", "mov", "webm", "mkv", "m4v"],
    maxBytes: 400 * MB,
    tope: 6,
    minimo: 0,
    titulo: "Reference footage"
  },
  marca: {
    input: "archivoMarca",
    zona: "zonaMarca",
    lista: "listaMarca",
    cuenta: "cuentaMarca",
    error: "errorMarca",
    ext: ["png", "jpg", "jpeg", "svg", "webp"],
    maxBytes: 8 * MB,
    tope: 10,
    minimo: 0,
    titulo: "Brand files"
  }
};

const archivos = { guion: [], videos: [], marca: [] };
let contador = 0;

function el(id) { return document.getElementById(id); }

function extension(nombre) {
  const trozo = nombre.split(".");
  return trozo.length > 1 ? trozo.pop().toLowerCase() : "";
}

function peso(bytes) {
  if (bytes >= MB) return (bytes / MB).toFixed(1).replace(".", ",") + " MB";
  if (bytes >= 1024) return Math.round(bytes / 1024) + " KB";
  return bytes + " B";
}

function rechaza(archivo, cfg) {
  const ext = extension(archivo.name);
  if (cfg.ext.includes(ext)) {
    return "We do not open ." + (ext || "no extension") + " here. Accepted: " + cfg.ext.join(", ") + ".";
  }
  if (archivo.size === 0) {
    return "It arrived with 0 bytes, there is nothing to send. Pick it again once the copy is done.";
  }
  if (archivo.size > cfg.maxBytes) {
    return "It weighs " + peso(archivo.size) + " and the limit is " + peso(cfg.maxBytes) + ".";
  }
  return "";
}

function corta(archivo) {
  return archivo.size > 25 * MB;
}

function transfiere(clave, item) {
  const cfg = ZONAS[clave];
  const motivo = rechaza(item.archivo, cfg);

  if (motivo !== "") {
    item.estado = "fallo";
    item.motivo = motivo;
    item.reintentable = false;
    item.pct = 100;
    pintaLista(clave);
    pintaAvance();
    return;
  }

  if (item.intento === 0 && corta(item.archivo)) {
    item.cae = 38 + Math.round(Math.random() * 26);
  } else {
    item.cae = -1;
  }

  item.estado = "subiendo";
  item.motivo = "";
  item.reintentable = false;
  item.pct = 0;
  pintaLista(clave);

  const espera = Math.max(420, Math.min(2400, 500 + item.bytes / 60000));
  const inicio = Date.now();
  item.temporizador = window.setInterval(function () {
    const pasado = Date.now() - inicio;
    item.pct = Math.min(100, Math.round((pasado / espera) * 100));
    refrescaFila(item);

    if (item.cae !== -1 && item.pct >= item.cae) {
      window.clearInterval(item.temporizador);
      item.temporizador = 0;
      item.estado = "fallo";
      item.reintentable = true;
      item.motivo = "The transfer dropped at " + item.pct + "%. The file is intact, run it again.";
      refrescaFila(item);
      pintaLista(clave);
      pintaAvance();
      return;
    }

    if (item.pct >= 100) {
      window.clearInterval(item.temporizador);
      item.temporizador = 0;
      item.estado = "listo";
      item.motivo = "";
      refrescaFila(item);
      pintaLista(clave);
      pintaAvance();
    }
  }, 90);
}

function creaFila(item, cfg) {
  const li = document.createElement("li");
  li.className = "fichero";
  li.dataset.id = item.id;
  li.dataset.estado = item.estado;

  const minia = document.createElement("span");
  const esImagen = cfg.ext.includes(extension(item.nombre)) && item.estado !== "fallo";
  const esVideo = cfg === ZONAS.videos;
  minia.className = "fichero__minia" + (esVideo ? " fichero__minia--video" : "");

  const etiqueta = document.createElement("span");
  etiqueta.textContent = extension(item.nombre).toUpperCase() || "FILE";
  minia.appendChild(etiqueta);

  if (esImagen && item.url) {
    const img = document.createElement("img");
    img.alt = "";
    img.addEventListener("error", function () { img.remove(); });
    img.src = item.url;
    minia.appendChild(img);
  }

  const cuerpo = document.createElement("div");
  cuerpo.className = "fichero__cuerpo";

  const nombre = document.createElement("b");
  nombre.className = "fichero__nombre";
  nombre.textContent = item.nombre;
  nombre.title = item.nombre;

  const meta = document.createElement("span");
  meta.className = "fichero__meta";

  const pista = document.createElement("span");
  pista.className = "fichero__pista";
  const relleno = document.createElement("i");
  relleno.className = "fichero__relleno";
  pista.appendChild(relleno);

  const motivo = document.createElement("p");
  motivo.className = "fichero__motivo";
  motivo.hidden = true;

  cuerpo.appendChild(nombre);
  cuerpo.appendChild(meta);
  cuerpo.appendChild(pista);
  cuerpo.appendChild(motivo);

  const acciones = document.createElement("div");
  acciones.className = "fichero__acciones";

  const pct = document.createElement("span");
  pct.className = "fichero__pct";

  const reintentar = document.createElement("button");
  reintentar.type = "button";
  reintentar.className = "pildora pildora--reintentar";
  reintentar.dataset.accion = "reintentar";
  reintentar.dataset.id = item.id;
  reintentar.textContent = "Retry";

  const quitar = document.createElement("button");
  quitar.type = "button";
  quitar.className = "pildora pildora--quitar";
  quitar.dataset.accion = "quitar";
  quitar.dataset.id = item.id;
  quitar.textContent = "Remove";

  acciones.appendChild(pct);
  acciones.appendChild(reintentar);
  acciones.appendChild(quitar);

  li.appendChild(minia);
  li.appendChild(cuerpo);
  li.appendChild(acciones);

  item.nodos = { li: li, meta: meta, relleno: relleno, motivo: motivo, pct: pct, reintentar: reintentar };
  return li;
}

function fraseDe(item) {
  if (item.estado === "subiendo") return "uploading";
  if (item.estado === "listo") return "on the server";
  return "not uploaded";
}

function refrescaFila(item) {
  const n = item.nodos;
  if (!n) return;
  n.li.dataset.estado = item.estado;
  n.meta.textContent = peso(item.bytes) + " · " + fraseDe(item);
  n.relleno.style.transform = "scaleX(" + (item.pct / 100).toFixed(3) + ")";
  n.pct.textContent = item.estado === "listo" ? "done" : item.estado === "fallo" ? "failed" : item.pct + "%";
  n.motivo.textContent = item.motivo;
  n.motivo.hidden = item.motivo === "";
  n.reintentar.hidden = !item.reintentable;
}

function pintaLista(clave) {
  const cfg = ZONAS[clave];
  const ul = el(cfg.lista);
  const vistos = {};

  archivos[clave].forEach(function (item) {
    vistos[item.id] = true;
    if (!item.nodos) {
      ul.appendChild(creaFila(item, cfg));
    }
    refrescaFila(item);
  });

  Array.from(ul.children).forEach(function (li) {
    if (!vistos[li.dataset.id]) {
      li.remove();
    }
  });

  if (archivos[clave].length === 0) {
    ul.innerHTML = "";
  }

  const suben = archivos[clave].filter(function (a) { return a.estado === "subiendo"; }).length;
  const listos = archivos[clave].filter(function (a) { return a.estado === "listo"; }).length;
  const caidos = archivos[clave].filter(function (a) { return a.estado === "fallo"; }).length;

  if (archivos[clave].length === 0) {
    el(cfg.cuenta).textContent = clave === "guion" ? "No file yet" : "0 of " + cfg.tope + " files";
  } else {
    el(cfg.cuenta).textContent = listos + " of " + archivos[clave].length + " ready" +
      (suben > 0 ? ", " + suben + " still going" : "") +
      (caidos > 0 ? ", " + caidos + " failed" : "") +
      (clave !== "guion" ? " · cap " + cfg.tope : "");
  }

  el(cfg.zona).dataset.vacia = caidos > 0 ? "1" : "0";
}

function pintaTodo() {
  Object.keys(ZONAS).forEach((...args) => pintaLista(...args));
  pintaAvance();
}

function todosLosArchivos() {
  return archivos.guion.concat(archivos.videos, archivos.marca);
}

function pintaAvance() {
  const todos = todosLosArchivos();
  const listo = todos.filter(function (a) { return a.estado === "listo"; }).length;
  const fallidos = todos.filter(function (a) { return a.estado === "fallo"; }).length;
  const bytes = todos.reduce(function (a, f) { return a + f.bytes; }, 0);
  const media = todos.length === 0 ? 0 : todos.reduce(function (a, f) { return a + f.pct; }, 0) / todos.length;
  const pct = Math.round(media);

  avance.dataset.vacio = todos.length === 0 ? "1" : "0";
  avanceCifra.textContent = todos.length === 0 ? "0" : String(pct);
  avanceRelleno.style.transform = "scaleX(" + (media / 100).toFixed(4) + ")";
  avanceBar.setAttribute("aria-label", todos.length === 0
    ? "No files queued yet"
    : pct + " percent of the overall transfer, " + listo + " of " + todos.length + " files on the server");

  if (todos.length === 0) {
    avanceTexto.textContent = "Nothing queued. The script is the one file we cannot start without.";
    return;
  }

  avanceTexto.textContent = listo + " of " + todos.length + " files on the server, " + peso(bytes) + " queued" +
    (fallidos > 0 ? ", " + fallidos + " need another look" : "") + ".";
}

function agrega(clave, lista) {
  const cfg = ZONAS[clave];
  let rechazados = 0;

  lista.forEach(function (archivo) {
    if (archivos[clave].length >= cfg.tope) {
      rechazados += 1;
      return;
    }
    contador += 1;
    const item = {
      id: "f" + contador,
      nombre: archivo.name,
      bytes: archivo.size,
      archivo: archivo,
      pct: 0,
      estado: "subiendo",
      motivo: "",
      reintentable: false,
      cae: -1,
      intento: 0,
      url: "",
      nodos: null,
      temporizador: 0
    };
    if (cfg === ZONAS.marca && archivo.size > 0) {
      try { item.url = URL.createObjectURL(archivo); } catch (e) { item.url = ""; }
    }
    archivos[clave].push(item);
  });

  if (rechazados > 0) {
    el(cfg.error).textContent = "That drop carried " + rechazados + " file" + (rechazados === 1 ? "" : "s") +
      " over the cap of " + cfg.tope + " for " + cfg.titulo.toLowerCase() + ".";
    el(cfg.error).hidden = false;
  } else {
    el(cfg.error).hidden = true;
    el(cfg.error).textContent = "";
  }

  el(cfg.zona).dataset.vacia = "0";
  archivos[clave].forEach(function (item) {
    if (item.estado === "subiendo" && item.temporizador === 0 && item.pct === 0) transfiere(clave, item);
  });
  pintaTodo();
}

Object.keys(ZONAS).forEach(function (clave) {
  const cfg = ZONAS[clave];
  const input = el(cfg.input);
  const zona = el(cfg.zona);

  input.addEventListener("change", function () {
    if (input.files && input.files.length > 0) {
      agrega(clave, Array.from(input.files));
      input.value = "";
    }
  });

  ["dragenter", "dragover"].forEach(function (evento) {
    zona.addEventListener(evento, function (e) {
      e.preventDefault();
      zona.dataset.viva = "1";
    });
  });

  ["dragleave", "dragend"].forEach(function (evento) {
    zona.addEventListener(evento, function () {
      zona.dataset.viva = "0";
    });
  });

  zona.addEventListener("drop", function (e) {
    e.preventDefault();
    zona.dataset.viva = "0";
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      agrega(clave, Array.from(e.dataTransfer.files));
    }
  });

  el(cfg.lista).addEventListener("click", function (e) {
    const boton = e.target.closest("button[data-accion]");
    if (!boton) return;
    const id = boton.dataset.id;
    const pos = archivos[clave].findIndex(function (a) { return a.id === id; });
    if (pos < 0) return;
    const item = archivos[clave][pos];

    if (boton.dataset.accion === "quitar") {
      if (item.temporizador) window.clearInterval(item.temporizador);
      if (item.url) URL.revokeObjectURL(item.url);
      archivos[clave].splice(pos, 1);
      el(cfg.error).hidden = true;
      el(cfg.zona).dataset.vacia = archivos[clave].some(function (a) { return a.estado === "fallo"; }) ? "1" : "0";
      pintaTodo();
      return;
    }

    if (boton.dataset.accion === "reintentar") {
      item.intento += 1;
      item.cae = -1;
      transfiere(clave, item);
    }
  });
});

function errorDe(campo, idError, mensaje) {
  const caja = campo.closest(".campo");
  if (caja) caja.dataset.estado = "error";
  const sitio = el(idError);
  if (sitio) {
    sitio.textContent = mensaje;
    sitio.hidden = false;
  }
}

function limpiaDe(campo, idError) {
  const caja = campo.closest(".campo");
  if (caja) caja.dataset.estado = "ok";
  const sitio = el(idError);
  if (sitio) {
    sitio.hidden = true;
    sitio.textContent = "";
  }
}

function validaProyecto() {
  const v = proyecto.value.trim();
  if (v === "") {
    errorDe(proyecto, "errorProyecto", "Give the commission a name, even a rough one.");
    return false;
  }
  if (v.length < 3) {
    errorDe(proyecto, "errorProyecto", "That is " + v.length + " characters. Three is enough to file it.");
    return false;
  }
  if (!/[A-Za-z]{2}/.test(v)) {
    errorDe(proyecto, "errorProyecto", "A project name needs at least two letters, digits alone read as a code.");
    return false;
  }
  limpiaDe(proyecto, "errorProyecto");
  return true;
}

function validaCorreo() {
  const v = correo.value.trim();
  if (v === "") {
    errorDe(correo, "errorCorreo", "The shooting plan needs somewhere to land.");
    return false;
  }
  if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/.test(v)) {
    errorDe(correo, "errorCorreo", "That is not a complete address, the domain part is missing.");
    return false;
  }
  const dominio = v.split("@")[1].toLowerCase();
  if (DOMINIOS_MAS_KEBAB.includes(dominio)) {
    errorDe(correo, "errorCorreo", dominio + " burns the brief after an hour. Use a mailbox you read every day.");
    return false;
  }
  limpiaDe(correo, "errorCorreo");
  return true;
}

function hoyIso() {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

function validaEntrega() {
  const v = entrega.value;
  if (v === "") {
    errorDe(entrega, "errorEntrega", "Pick the day the footage has to be in the can.");
    return false;
  }
  if (v < hoyIso()) {
    errorDe(entrega, "errorEntrega", "That date is behind us. Pick today or later.");
    return false;
  }
  limpiaDe(entrega, "errorEntrega");
  return true;
}

function validaJornada() {
  const v = jornada.value;
  if (v === "") {
    errorDe(jornada, "errorJornada", "How long is the shoot? The price moves with the days.");
    return false;
  }
  limpiaDe(jornada, "errorJornada");
  return true;
}

function validaLicencia() {
  if (!licencia.checked) {
    el("cajaLicencia").dataset.estado = "error";
    el("errorLicencia").textContent = "We cannot cut footage we are not allowed to cut.";
    el("errorLicencia").hidden = false;
    return false;
  }
  el("cajaLicencia").dataset.estado = "ok";
  el("errorLicencia").hidden = true;
  el("errorLicencia").textContent = "";
  return true;
}

function validaZona(clave) {
  const cfg = ZONAS[clave];
  const lista = archivos[clave];
  const fallidos = lista.filter(function (a) { return a.estado === "fallo"; });
  const suben = lista.filter(function (a) { return a.estado === "subiendo"; });

  if (lista.length < cfg.minimo) {
    el(cfg.error).textContent = "We need the script before anything else. PDF, DOCX, MD, TXT or RTF, 12 MB max.";
    el(cfg.error).hidden = false;
    return cfg.titulo + ": the script is missing.";
  }

  if (fallidos.length > 0) {
    el(cfg.error).textContent = fallidos.length === 1
      ? fallidos[0].nombre + " did not make it: " + fallidos[0].motivo
      : fallidos.length + " files did not make it. " + fallidos[0].nombre + ": " + fallidos[0].motivo;
    el(cfg.error).hidden = false;
    return cfg.titulo + ": " + fallidos.length + " file" + (fallidos.length === 1 ? "" : "s") + " still failed.";
  }

  if (suben.length > 0) {
    el(cfg.error).textContent = suben.length + " file" + (suben.length === 1 ? " is" : "s are") +
      " still uploading. We will send when the bars are full.";
    el(cfg.error).hidden = false;
    return cfg.titulo + ": " + suben.length + " file" + (suben.length === 1 ? "" : "s") + " still uploading.";
  }

  el(cfg.error).hidden = true;
  el(cfg.error).textContent = "";
  return "";
}

function recoge() {
  const fallos = [];

  if (!validaProyecto()) fallos.push("Project name: " + el("errorProyecto").textContent);
  if (!validaCorreo()) fallos.push("Contact email: " + el("errorCorreo").textContent);
  if (!validaEntrega()) fallos.push("Footage due: " + el("errorEntrega").textContent);
  if (!validaJornada()) fallos.push("Shoot days: " + el("errorJornada").textContent);

  const guion = validaZona("guion");
  if (guion !== "") fallos.push(guion);
  const videos = validaZona("videos");
  if (videos !== "") fallos.push(videos);
  const marca = validaZona("marca");
  if (marca !== "") fallos.push(marca);

  if (!validaLicencia()) fallos.push("Rights: " + el("errorLicencia").textContent);
  return fallos;
}

function enfocaPrimero(fallos) {
  const mapa = [
    ["Project name", "#proyecto"],
    ["Contact email", "#correo"],
    ["Footage due", "#entrega"],
    ["Shoot days", "#jornada"],
    ["The script", "#zonaGuion .zona__cara"],
    ["Reference footage", "#zonaVideos .zona__cara"],
    ["Brand files", "#zonaMarca .zona__cara"],
    ["Rights", "#licencia"]
  ];
  for (const campo of mapa) {
    if (fallos.some(function (f) { return f.indexOf(campo[0]) === 0; })) {
      form.querySelector(campo[1]).focus();
      return;
    }
  }
  proyecto.focus();
}

const CAMPOS = {
  proyecto: "errorProyecto",
  correo: "errorCorreo",
  entrega: "errorEntrega",
  jornada: "errorJornada"
};

Object.keys(CAMPOS).forEach(function (id) {
  el(id).addEventListener("input", function () {
    const caja = el(CAMPOS[id]);
    if (caja && !caja.hidden) el(id).closest(".campo").dataset.estado = "ok";
  });
  el(id).addEventListener("change", function () {
    const caja = el(CAMPOS[id]);
    if (caja && !caja.hidden) el(id).closest(".campo").dataset.estado = "ok";
  });
});

jornada.addEventListener("change", function () {
  if (!el("errorJornada").hidden) validaJornada();
});

licencia.addEventListener("change", function () {
  if (!el("errorLicencia").hidden) validaLicencia();
});

notas.addEventListener("input", function () {
  el("cuentaNotas").textContent = String(notas.value.length);
});

form.addEventListener("submit", function (e) {
  e.preventDefault();
  const fallos = recoge();

  if (fallos.length > 0) {
    resumenTitulo.textContent = fallos.length === 1
      ? "One thing is still open"
      : fallos.length + " things are still open";
    resumenLista.innerHTML = "";
    fallos.forEach(function (t) {
      const li = document.createElement("li");
      li.textContent = t;
      resumenLista.appendChild(li);
    });
    resumen.hidden = false;
    enfocaPrimero(fallos);
    return;
  }

  resumen.hidden = true;
  el("enviaTexto").textContent = "Sending to the producer";
  el("envia").disabled = true;
  window.setTimeout(cierra, 800);
});

function fechaLarga(iso) {
  const partes = iso.split("-");
  const meses = ["January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"];
  return Number(partes[2]) + " " + meses[Number(partes[1]) - 1] + " " + partes[0];
}

function cierra() {
  const todos = todosLosArchivos();
  const ticket = "BRF-" + String(Math.floor(1000 + Math.random() * 8999));
  const bytes = todos.reduce(function (a, f) { return a + f.bytes; }, 0);
  const dias = Number(jornada.value);
  const guion = archivos.guion[0];

  el("cerradaRef").textContent = ticket;
  el("cerradaProyecto").textContent = proyecto.value.trim();
  el("cerradaArchivo").textContent = todos.length + " files, " + peso(bytes);
  el("cerradaEntrega").textContent = fechaLarga(entrega.value);
  el("cerradaTitulo").textContent = "It is with the producer";
  el("cerradaLead").textContent = "Every file is on the server. " + correo.value.trim() +
    " gets the shooting plan within one working day, and the crew booking starts from there.";

  const pasos = [
    "Ticket " + ticket + " opened, " + todos.length + " files and " + peso(bytes) + " stored",
    guion ? "Script " + guion.nombre + " parsed, " + peso(guion.bytes) + ", no missing pages" : "Script filed",
    dias + (dias === 1 ? " shoot day" : " shoot days") + " pencilled, crew and kit on hold",
    "Footage due " + fechaLarga(entrega.value) + ", plan back to you by email"
  ];
  if (notas.value.trim() !== "") {
    pasos.push("Your note travels with the ticket, " + notas.value.trim().length + " characters kept verbatim");
  }

  const lista = el("cerradaPasos");
  lista.innerHTML = "";
  pasos.forEach(function (t, i) {
    const li = document.createElement("li");
    li.textContent = t;
    li.style.animationDelay = (0.08 + i * 0.08).toFixed(2) + "s";
    lista.appendChild(li);
  });

  form.hidden = true;
  document.querySelector(".cabecera").hidden = true;
  cerrada.hidden = false;
  cerrada.focus();
}

el("otra").addEventListener("click", function () {
  cerrada.hidden = true;
  document.querySelector(".cabecera").hidden = false;
  form.hidden = false;
  el("envia").disabled = false;
  el("enviaTexto").textContent = "Send the brief";

  Object.keys(ZONAS).forEach(function (clave) {
    const cfg = ZONAS[clave];
    archivos[clave].forEach(function (item) {
      if (item.temporizador) window.clearInterval(item.temporizador);
      if (item.url) URL.revokeObjectURL(item.url);
    });
    archivos[clave] = [];
    el(cfg.lista).innerHTML = "";
    el(cfg.error).hidden = true;
    el(cfg.error).textContent = "";
    el(cfg.zona).dataset.viva = "0";
    el(cfg.zona).dataset.vacia = "0";
  });

  proyecto.value = "";
  correo.value = "";
  entrega.value = "";
  jornada.value = "";
  notas.value = "";
  licencia.checked = false;
  el("cuentaNotas").textContent = "0";

  ["proyecto", "correo", "entrega", "jornada"].forEach(function (id) {
    const caja = el(id).closest(".campo");
    if (caja) caja.dataset.estado = "ok";
  });
  ["errorProyecto", "errorCorreo", "errorEntrega", "errorJornada"].forEach(function (id) {
    el(id).hidden = true;
    el(id).textContent = "";
  });
  el("cajaLicencia").dataset.estado = "ok";
  el("errorLicencia").hidden = true;
  resumen.hidden = true;
  resumenLista.innerHTML = "";

  pintaTodo();
  proyecto.focus();
});

pintaTodo();
