const form = document.getElementById("form");
const medidor = document.getElementById("medidor");
const medidorRelleno = document.getElementById("medidorRelleno");
const medidorEtapas = document.getElementById("medidorEtapas");
const barraEstado = document.getElementById("barraEstado");
const barraReloj = document.getElementById("barraReloj");
const resumenError = document.getElementById("resumenError");
const listaError = document.getElementById("resumenErrorLista");
const tituloError = document.getElementById("resumenErrorTitulo");
const previo = document.getElementById("previo");
const previoPasos = document.getElementById("previoPasos");
const envivo = document.getElementById("envivo");

const ETIQUETAS = ["Ranked", "English", "No backseating", "First stream", "Late night", "Duo queue"];

const ETAPAS = [
  { id: "tramo-1", texto: "Stream details" },
  { id: "tramo-2", texto: "Audio" },
  { id: "tramo-3", texto: "Overlay" },
  { id: "tramo-4", texto: "Pre flight" }
];

const CAMPOS = [
  {
    id: "titulo",
    etiqueta: "Stream title",
    vacio: "The title is what the feed shows first, so it cannot be empty.",
    error: "Between 8 and 80 characters, and not just the same letter eight times.",
    prueba: v => v.length >= 8 && v.length <= 80 && /[a-zA-Z]{3}/.test(v)
  },
  {
    id: "categoria",
    etiqueta: "Category",
    vacio: "Pick a category or the stream gets demoted.",
    error: "That category is not in the platform list.",
    prueba: v => ["fps", "strategy", "rpg", "justchatting", "deportes", "iracing"].indexOf(v) > -1
  },
  {
    id: "idioma",
    etiqueta: "Stream language",
    vacio: "Pick the language you speak in.",
    error: "That language is not offered.",
    prueba: v => ["en", "es", "fr", "de", "pt"].indexOf(v) > -1
  },
  {
    id: "etiquetas",
    etiqueta: "Tags",
    vacio: "Choose between three and five tags. An untagged stream is invisible for ten minutes.",
    error: "",
    prueba: () => false
  },
  {
    id: "microfono",
    etiqueta: "Microphone",
    vacio: "Choose an input device, otherwise the meter stays at zero.",
    error: "That input device is not plugged in.",
    prueba: v => ["usb1", "usb2", "lavalier", "agregado"].indexOf(v) > -1
  },
  {
    id: "ganancia",
    etiqueta: "Input gain",
    vacio: "Move the gain slider.",
    error: "The level has to sit inside the green band, between 58 and 92. Move the slider with the arrow keys.",
    prueba: () => false
  },
  {
    id: "tercera",
    etiqueta: "Lower third text",
    vacio: "Write the text that appears in the corner, at least four characters.",
    error: "Between 4 and 34 characters, it has to fit in one bar.",
    prueba: v => v.length >= 4 && v.length <= 34
  },
  {
    id: "avisos",
    etiqueta: "On screen alerts",
    vacio: "",
    error: "",
    prueba: v => v === "si" || v === "no"
  },
  {
    id: "volumenAvisos",
    etiqueta: "Alert volume",
    vacio: "Move the alert volume.",
    error: "Keep the alert volume under sixty unless the alerts go to headphones only.",
    prueba: () => false
  },
  {
    id: "respaldo",
    etiqueta: "Backup line",
    vacio: "Confirm you have a second line. Without it a dropout ends the broadcast.",
    error: "",
    prueba: v => v === "si"
  }
];

const COMPROBACIONES = [
  { clave: "detalles", titulo: "Title, category and language set", nota: "The feed needs all three or it files the stream under Unknown." },
  { clave: "micro", titulo: "Microphone inside the green band", nota: "Below the band the level is thin, above it the voice clips." },
  { clave: "tags", titulo: "At least three tags", nota: "The first tag is the one the recommendation engine reads." },
  { clave: "respaldo", titulo: "Backup line confirmed", nota: "A phone hotspot counts as a backup line." }
];

const st = {
  etiquetas: [],
  avisos: false,
  enAire: false,
  segundos: 0,
  pico: 0,
  caidos: 0
};

function el(id) { return document.getElementById(id); }

function nodo(etiqueta, clase, texto) {
  const n = document.createElement(etiqueta);
  if (clase) n.className = clase;
  if (texto !== undefined) n.textContent = texto;
  return n;
}

function valor(f) {
  if (f.id === "etiquetas") return st.etiquetas.join(",");
  if (f.id === "ganancia") return el("ganancia").value;
  if (f.id === "volumenAvisos") return el("volumenAvisos").value;
  if (f.id === "avisos") return st.avisos ? "si" : "no";
  const n = el(f.id);
  return n.type === "checkbox" ? (n.checked ? "si" : "") : n.value.trim();
}

function falla(f) {
  const v = valor(f);
  if (f.id === "etiquetas") return v === "" ? f.vacio : (st.etiquetas.length < 3 || st.etiquetas.length > 5 ? "Between three and five tags, no more and no less. You have " + st.etiquetas.length + "." : "");
  if (f.id === "ganancia") return v === "" ? f.vacio : (Number(v) < 58 || Number(v) > 92 ? f.error : "");
  if (f.id === "volumenAvisos") return v === "" ? f.vacio : (Number(v) > 60 ? f.error : "");
  if (f.id === "avisos") return "";
  if (f.id === "respaldo") return el("respaldo").checked ? "" : f.vacio;
  return v === "" ? f.vacio : (f.prueba(v) ? "" : f.error);
}

function contenedor(f) {
  if (f.id === "etiquetas") return el("etiquetas").closest(".campo");
  if (f.id === "ganancia" || f.id === "volumenAvisos") return el(f.id).closest(".campo");
  return el(f.id).closest(".campo");
}

function pintar(f) {
  const env = contenedor(f);
  const ayuda = el(f.id + "-ayuda");
  const err = el(f.id + "-err");
  const mensaje = falla(f);
  const described = [ayuda.id];

  env.dataset.estado = mensaje ? "error" : "ok";
  if (mensaje) {
    described.push(err.id);
    err.textContent = mensaje;
  } else {
    err.textContent = "";
  }

  if (f.id === "etiquetas") {
    el("etiquetas").setAttribute("aria-describedby", described.join(" "));
  } else if (f.id === "ganancia" || f.id === "volumenAvisos") {
    el(f.id).setAttribute("aria-invalid", mensaje ? "true" : "false");
    el(f.id).setAttribute("aria-describedby", described.join(" "));
  } else if (f.id === "avisos") {
    el("avisos").setAttribute("aria-describedby", "avisos-ayuda");
  } else {
    el(f.id).setAttribute("aria-invalid", mensaje ? "true" : "false");
    el(f.id).setAttribute("aria-describedby", described.join(" "));
  }
  return mensaje;
}

function pintarTodo() {
  let primero = null;
  CAMPOS.forEach(f => {
    const m = pintar(f);
    if (m && !primero) {
      primero = f.id === "etiquetas" ? el("etiquetas").querySelector("button") : el(f.id);
    }
  });
  return primero;
}

function alDeslizador(id, capId) {
  const entrada = el(id);
  const cap = el(capId);
  const ancho = entrada.clientWidth || 300;
  const recorrido = ancho - 22;
  const pos = (Number(entrada.value) / Number(entrada.max)) * recorrido;
  cap.style.setProperty("--pos", pos.toFixed(1) + "px");
  return pos;
}

function nivelActual() {
  if (el("microfono").value === "") return 0;
  const base = Number(el("ganancia").value);
  const t = Date.now() / 260;
  const onda = Math.sin(t) * 5 + Math.sin(t * 2.3) * 2.5;
  return Math.max(0, Math.min(100, Math.round(base + onda)));
}

function refrescarMetro() {
  const nivel = nivelActual();
  const pista = el("metro");
  pista.style.setProperty("--nivel", nivel);
  el("metroTexto").textContent = el("microfono").value === ""
    ? "No input selected"
    : (nivel >= 58 && nivel <= 92 ? "Level is inside the green band" : nivel < 58 ? "Too low, move the gain up" : "Clipping, move the gain down");
  el("metroValor").textContent = (Number(el("ganancia").value) * 0.3 - 30).toFixed(1) + " dB";
  pista.setAttribute("aria-label", "Input level " + nivel + " percent");
}

function refrescarMonitor() {
  const t = el("titulo").value.trim();
  el("monitorTitulo").textContent = t.length > 0 ? t : "Your stream title appears here";
  const tercera = el("tercera").value.trim();
  el("monitorTercera").hidden = tercera.length < 4;
  el("monitorTerceraTexto").textContent = tercera || "Lower third";
  el("monitorAviso").hidden = !st.avisos;
  const bits = Number(el("volumenAvisos").value) < 60 ? "6000" : "4500";
  el("monitorBitrate").textContent = bits + " kbps target";
  el("monitorInfo").textContent = el("categoria").value === ""
    ? "Canvas 1920 by 1080 at 60 frames"
    : "Category: " + el("categoria").options[el("categoria").selectedIndex].text;
}

function seccionLista(indice) {
  const ids = [["titulo", "categoria", "idioma"], ["microfono", "ganancia"], ["tercera", "volumenAvisos", "avisos"], ["respaldo"]];
  return ids[indice].every(id => !falla(CAMPOS.find(f => f.id === id)));
}

function refrescarMedidor() {
  const hechos = ETAPAS.map((e, i) => seccionLista(i));
  const cuenta = hechos.filter(Boolean).length;
  const avance = cuenta / 4;
  medidorRelleno.style.setProperty("--avance", avance.toFixed(3));
  medidor.setAttribute("aria-label", "Setup " + cuenta + " of 4 stages done");
  medidorEtapas.querySelectorAll("li").forEach((li, i) => {
    li.dataset.estado = hechos[i] ? "hecho" : (i === cuenta ? "activo" : "espera");
  });
}

function montarEtapas() {
  ETAPAS.forEach(e => {
    const li = document.createElement("li");
    li.textContent = e.texto;
    li.dataset.estado = "espera";
    medidorEtapas.appendChild(li);
  });
}

function montarComprobaciones() {
  const lista = el("listaComprobacion");
  COMPROBACIONES.forEach(c => {
    const li = document.createElement("li");
    const b = nodo("b", null, c.titulo);
    li.appendChild(b);
    li.appendChild(document.createTextNode(c.nota));
    li.dataset.clave = c.clave;
    li.dataset.estado = "espera";
    lista.appendChild(li);
  });
}

function refrescarComprobaciones() {
  const mapa = {
    detalles: !falla(CAMPOS[0]) && !falla(CAMPOS[1]) && !falla(CAMPOS[2]),
    micro: !falla(CAMPOS[4]) && !falla(CAMPOS[5]),
    tags: !falla(CAMPOS[3]),
    respaldo: el("respaldo").checked
  };
  el("listaComprobacion").querySelectorAll("li").forEach(li => {
    li.dataset.estado = mapa[li.dataset.clave] ? "ok" : "mal";
  });
}

function montarEtiquetas() {
  ETIQUETAS.forEach(t => {
    const b = nodo("button", "etiqueta-ficha");
    b.type = "button";
    b.setAttribute("aria-pressed", "false");
    b.appendChild(nodo("i"));
    b.appendChild(nodo("span", null, t));
    b.addEventListener("click", () => {
      const i = st.etiquetas.indexOf(t);
      if (i > -1) {
        st.etiquetas.splice(i, 1);
        b.setAttribute("aria-pressed", "false");
      } else {
        if (st.etiquetas.length >= 5) return;
        st.etiquetas.push(t);
        b.setAttribute("aria-pressed", "true");
      }
      pintar(CAMPOS[3]);
      refrescarComprobaciones();
      refrescarMedidor();
      b.focus();
    });
    el("etiquetas").appendChild(b);
  });
}

function reloj(segundos) {
  const h = Math.floor(segundos / 3600);
  const m = Math.floor(segundos / 60) % 60;
  const s = segundos % 60;
  const dos = n => String(n).padStart(2, "0");
  return dos(h) + ":" + dos(m) + ":" + dos(s);
}

function pintarReloj() {
  if (st.enAire) {
    barraReloj.textContent = "up " + reloj(st.segundos);
    el("monitorReloj").textContent = reloj(st.segundos);
    el("envivoTiempo").textContent = reloj(st.segundos);
    return;
  }
  const d = new Date();
  const dos = n => String(n).padStart(2, "0");
  const t = dos(d.getHours()) + ":" + dos(d.getMinutes()) + ":" + dos(d.getSeconds());
  barraReloj.textContent = t;
  el("monitorReloj").textContent = t;
}

function latido() {
  if (st.enAire) {
    st.segundos++;
    const audiencia = Math.max(1, Math.round(3 + Math.sin(st.segundos / 7) * 2 + st.segundos / 14));
    if (audiencia > st.pico) st.pico = audiencia;
    el("monitorEspectadores").textContent = audiencia + " watching";
    el("envivoPico").textContent = String(st.pico);
    if (st.segundos % 11 === 0) st.caidos++;
    el("envivoCaidos").textContent = String(st.caidos);
  }
  pintarReloj();
  refrescarMetro();
}

CAMPOS.forEach(f => {
  if (f.id === "etiquetas") return;
  const n = el(f.id);
  n.addEventListener("blur", () => { pintar(f); refrescarMedidor(); refrescarComprobaciones(); });
  n.addEventListener("change", () => { pintar(f); refrescarMedidor(); refrescarComprobaciones(); });
  n.addEventListener("input", () => {
    if (n.closest(".campo").dataset.estado === "error") pintar(f);
    if (f.id === "titulo") {
      const caja = el("tituloPips");
      if (caja.childElementCount !== 10) {
        caja.innerHTML = "";
        for (let i = 0; i < 10; i++) caja.appendChild(nodo("i"));
      }
      const llenos = Math.min(10, Math.round((n.value.length / 80) * 10));
      for (let i = 0; i < 10; i++) caja.children[i].dataset.on = i < llenos ? "1" : "0";
      el("tituloCuenta").textContent = n.value.length + " of 80";
      el("titulo-ayuda").dataset.alerta = n.value.length > 0 && n.value.length < 8 ? "1" : "0";
    }
    refrescarMonitor();
    refrescarMedidor();
    refrescarComprobaciones();
  });
});

el("ganancia").addEventListener("input", () => { alDeslizador("ganancia", "capGanancia"); pintar(CAMPOS[5]); refrescarMedidor(); refrescarComprobaciones(); });
el("volumenAvisos").addEventListener("input", () => { alDeslizador("volumenAvisos", "capAvisos"); pintar(CAMPOS[8]); refrescarMonitor(); refrescarComprobaciones(); });
el("ganancia").addEventListener("blur", () => pintar(CAMPOS[5]));
el("volumenAvisos").addEventListener("blur", () => pintar(CAMPOS[8]));

el("avisos").addEventListener("change", () => {
  st.avisos = el("avisos").checked;
  pintar(CAMPOS[7]);
  refrescarMonitor();
  refrescarComprobaciones();
});

form.addEventListener("submit", e => {
  e.preventDefault();
  if (st.enAire) return;
  const primero = pintarTodo();
  refrescarMedidor();
  refrescarComprobaciones();

  const fallos = CAMPOS.filter(f => falla(f) !== "");
  if (fallos.length > 0) {
    tituloError.textContent = fallos.length === 1
      ? "One thing is still missing before going live"
      : fallos.length + " things are still missing before going live";
    listaError.innerHTML = "";
    fallos.forEach(f => {
      const li = document.createElement("li");
      li.textContent = f.etiqueta + ": " + falla(f);
      listaError.appendChild(li);
    });
    resumenError.hidden = false;
    previo.hidden = true;
    if (primero) primero.focus();
    return;
  }

  resumenError.hidden = true;
  el("salir").disabled = true;
  el("salirTexto").textContent = "Checking";
  barraEstado.textContent = "Checking";
  barraEstado.dataset.estado = "comprobando";
  correrPrevio();
});

function correrPrevio() {
  previo.hidden = false;
  previoPasos.innerHTML = "";
  const textos = [
    "Upload probe, 11,4 Mbps measured",
    "Encoder handshake with the ingest node",
    "Overlay compositor warm, no missing asset",
    "Audio path routed to the master bus"
  ];
  textos.forEach((t, i) => {
    const li = nodo("li", null, t);
    li.dataset.estado = "corriendo";
    li.style.animation = "golpe 0.3s var(--ease) both";
    li.style.animationDelay = (i * 0.06).toFixed(2) + "s";
    previoPasos.appendChild(li);
  });

  textos.forEach((t, i) => {
    window.setTimeout(() => {
      const li = previoPasos.children[i];
      if (li) li.dataset.estado = "ok";
      if (i === textos.length - 1) window.setTimeout(entrarEnAire, 420);
    }, 520 + i * 620);
  });
}

function entrarEnAire() {
  st.enAire = true;
  st.segundos = 0;
  st.pico = 0;
  st.caidos = 0;
  previo.hidden = true;
  barraEstado.textContent = "Live";
  barraEstado.dataset.estado = "vivo";
  el("monitorCandado").hidden = true;
  el("monitorVivo").hidden = false;
  el("monitorAviso").hidden = false;
  el("accionesNota").textContent = "You are on air. The stream key below is the only one that works for this broadcast.";

  const clave = "live_" + Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6);
  el("envivoClave").textContent = clave;
  el("envivoId").textContent = String(Math.floor(10000000 + Math.random() * 89999999));
  el("envivoCategoria").textContent = el("categoria").options[el("categoria").selectedIndex].text;
  el("envivoCalidad").textContent = el("monitorBitrate").textContent.replace(" target", "") + ", 1080p60";
  el("envivoTitulo").textContent = el("titulo").value.trim();

  document.querySelector(".escena").hidden = true;
  envivo.hidden = false;
  envivo.focus();
  pintarReloj();
}

el("terminar").addEventListener("click", () => {
  st.enAire = false;
  el("salir").disabled = false;
  el("salirTexto").textContent = "Go live";
  barraEstado.textContent = "Ended";
  barraEstado.dataset.estado = "cerrado";
  document.querySelector(".escena").hidden = false;
  envivo.hidden = true;
  el("monitorVivo").hidden = true;
  el("monitorCandado").hidden = false;
  el("envivoClave").textContent = "live_0000";
  barraReloj.textContent = "broadcast ended";
  el("accionesNota").textContent = "The broadcast ended after " + reloj(st.segundos) + ". Start again whenever you like.";
  form.scrollIntoView({ block: "start" });
});

montarEtapas();
montarComprobaciones();
montarEtiquetas();
alDeslizador("ganancia", "capGanancia");
alDeslizador("volumenAvisos", "capAvisos");
CAMPOS.forEach(f => {
  contenedor(f).dataset.estado = "neutro";
  el(f.id + "-err").textContent = "";
});
refrescarMonitor();
refrescarMetro();
refrescarMedidor();
refrescarComprobaciones();
pintarReloj();
window.setInterval(latido, 1000);
