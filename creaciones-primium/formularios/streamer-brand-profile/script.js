const form = document.getElementById("form");
const nombre = document.getElementById("nombre");
const manojo = document.getElementById("manojo");
const ciudad = document.getElementById("ciudad");
const categoria = document.getElementById("categoria");
const lema = document.getElementById("lema");
const bio = document.getElementById("bio");
const plataformas = document.getElementById("plataformas");
const tonos = document.getElementById("tonos");
const medidor = document.getElementById("medidor");
const medidorRelleno = document.getElementById("medidorRelleno");
const publicada = document.getElementById("publicada");
const resumenError = document.getElementById("resumenError");
const listaError = document.getElementById("resumenLista");
const tituloError = document.getElementById("resumenTitulo");

const RESERVADAS = ["admin", "root", "support", "nightledger", "official", "staff", "mod"];

const CIUDADES = {
  lis: { nombre: "Lisbon", banda: "#3a7a4a" },
  ber: { nombre: "Berlin", banda: "#8a6d2c" },
  tor: { nombre: "Toronto", banda: "#7a2f3a" },
  mel: { nombre: "Melbourne", banda: "#2f5a7a" },
  seo: { nombre: "Seoul", banda: "#5a3a7a" },
  lag: { nombre: "Lagos", banda: "#7a5a2a" },
  cam: { nombre: "Cambridge", banda: "#4a4a7a" }
};

const CATEGORIAS = {
  tactico: "Tactical shooters",
  carrera: "Racing and sim",
  coop: "Co-op survival",
  constructor: "Builders and sandbox",
  justo: "Just chatting"
};

const TONOS = ["Sereno", "Alta energia", "Seco"];

const ORDEN_PLATAFORMAS = ["Stream", "Shorts", "Podcast", "Newsletter", "Discord", "Merch"];

const CAMPOS = [
  {
    id: "nombre",
    etiqueta: "Real name or stage name",
    vacio: "Nobody signs a sponsorship deal with an empty card.",
    error: "Three to twenty two characters, letters, spaces, apostrophes and dashes.",
    prueba: v => v.length >= 3 && v.length <= 22 && /^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ '\-.]*$/.test(v)
  },
  {
    id: "manojo",
    etiqueta: "Handle",
    vacio: "A handle is how anybody finds you. One is enough.",
    error: "Three to twenty characters: letters, digits, underscore and dot. No spaces, no capitals.",
    prueba: v => /^[a-z0-9][a-z0-9._]{2,19}$/.test(v)
  },
  {
    id: "ciudad",
    etiqueta: "Based in",
    vacio: "Pick a city, it sets the tax country on the card.",
    error: "That city is not on the creator list.",
    prueba: v => Object.prototype.hasOwnProperty.call(CIUDADES, v)
  },
  {
    id: "categoria",
    etiqueta: "Category",
    vacio: "Pick what you play, the directory files you under it.",
    error: "That category is not one the directory carries.",
    prueba: v => Object.prototype.hasOwnProperty.call(CATEGORIAS, v)
  },
  {
    id: "plataformas",
    etiqueta: "Platforms",
    vacio: "Tick at least one platform, otherwise there is nowhere to send people.",
    error: "Only real platforms from the list of six.",
    tipo: "grupo",
    prueba: () => marcadas().length > 0
  },
  {
    id: "lema",
    etiqueta: "Line above the fold",
    vacio: "This is the only line the directory shows before someone clicks.",
    error: "Between sixteen and sixty four characters. Say what the channel is.",
    prueba: v => v.length >= 16 && v.length <= 64
  },
  {
    id: "bio",
    etiqueta: "Longer introduction",
    vacio: "",
    error: "Two hundred and forty characters at the very most.",
    prueba: v => v.length <= 240,
    suave: true
  },
  {
    id: "tono",
    etiqueta: "Tone of voice",
    vacio: "Pick a tone, the sponsors read it before the numbers.",
    error: "That tone is not on the list of three.",
    tipo: "radio",
    prueba: v => TONOS.indexOf(v) !== -1
  }
];

function el(id) { return document.getElementById(id); }

function marcadas() {
  return Array.from(document.querySelectorAll('input[name="plataforma"]:checked')).map(c => c.value);
}

function tonoActual() {
  const marcado = document.querySelector('input[name="tono"]:checked');
  return marcado ? marcado.value : "";
}

function iniciales() {
  const v = nombre.value.trim();
  if (v === "") return "--";
  const partes = v.split(/\s+/).filter(p => p.length > 0);
  if (partes.length === 1) return partes[0].charAt(0).toUpperCase() + (partes[0].charAt(1) || "").toUpperCase();
  return partes[0].charAt(0).toUpperCase() + partes[partes.length - 1].charAt(0).toUpperCase();
}

let ultimasIniciales = "";

function pintarTarjeta() {
  const nom = nombre.value.trim();
  const man = manojo.value.trim();
  const cat = categoria.value;
  const ciudadV = ciudad.value;
  const linea = lema.value.trim();
  const larga = bio.value.trim();
  const plats = marcadas();
  const tono = tonoActual();

  const ini = iniciales();
  if (ini !== ultimasIniciales) {
    ultimasIniciales = ini;
    el("avatar").dataset.cambio = "1";
    window.setTimeout(() => { el("avatar").dataset.cambio = "0"; }, 420);
  }
  el("avatarLetras").textContent = ini;
  el("tarjetaCategoria").textContent = cat === "" ? "category pending" : CATEGORIAS[cat];
  el("tarjetaNombre").textContent = nom === "" ? "Your name here" : nom;
  el("tarjetaManojo").textContent = man === "" ? "@handle pending" : "@" + man;
  el("tarjetaLema").textContent = linea === ""
    ? "The line above the fold goes here, and nothing else does."
    : linea;
  el("tarjetaBio").textContent = larga === "" ? "No longer introduction written yet." : larga;
  el("tonoSello").textContent = tono === "" ? "no tone" : tono;
  el("tarjeta").dataset.tono = tono;

  const banda = el("tarjeta").querySelector(".tarjeta__banda");
  banda.style.background = ciudadV === ""
    ? "linear-gradient(90deg, var(--acento), var(--rosa), var(--menta), var(--acento))"
    : "linear-gradient(90deg, " + CIUDADES[ciudadV].banda + ", var(--acento), var(--rosa), " + CIUDADES[ciudadV].banda + ")";

  const caja = el("tarjetaInsignias");
  caja.innerHTML = "";
  if (plats.length === 0) {
    for (let k = 0; k < 3; k++) {
      const span = document.createElement("span");
      span.className = "insignia insignia--vacia";
      const punto = document.createElement("i");
      span.appendChild(punto);
      span.appendChild(document.createTextNode("empty slot"));
      caja.appendChild(span);
    }
  } else {
    ORDEN_PLATAFORMAS.filter(p => plats.indexOf(p) !== -1).forEach((p, i) => {
      const span = document.createElement("span");
      span.className = "insignia";
      span.style.animationDelay = i * 0.05 + "s";
      const punto = document.createElement("i");
      span.appendChild(punto);
      span.appendChild(document.createTextNode(p));
      caja.appendChild(span);
    });
  }

  el("datoCiudad").textContent = ciudadV === "" ? "not set" : CIUDADES[ciudadV].nombre;
  el("datoManojo").textContent = man === "" ? "pending" : "@" + man;
  el("datoPlataformas").textContent = plats.length === 0 ? "none ticked" : plats.length + " of 6";
  el("datoLargo").textContent = linea.length + " of 64";

  el("tarjetaSello").textContent = ciudadV === ""
    ? "Nightledger directory, season 2026"
    : CIUDADES[ciudadV].nombre + " on the Nightledger directory, season 2026";

  el("plataformas-ayuda").textContent = plats.length === 0
    ? "Nothing ticked yet. The card shows three empty slots where the badges go."
    : plats.length + " of 6 platforms. " + ORDEN_PLATAFORMAS.filter(p => plats.indexOf(p) !== -1).join(", ") + " print on the card in that order.";

  el("lemaCuenta").textContent = linea.length + " of 64";
  el("bioCuenta").textContent = larga.length + " of 240";
}

function pintarMedidor() {
  const obligatorios = ["nombre", "manojo", "ciudad", "categoria", "plataformas", "lema", "tono"];
  const completos = obligatorios.filter(id => {
    if (id === "plataformas") return marcadas().length > 0;
    if (id === "tono") return tonoActual() !== "";
    return el(id).value.trim() !== "";
  }).length;
  const total = obligatorios.length;
  const pct = Math.round((completos / total) * 100);
  medidorRelleno.style.transform = "scaleX(" + (pct / 100) + ")";
  medidor.setAttribute("aria-valuenow", String(pct));
  medidor.setAttribute("aria-valuetext", pct + " per cent of the card filled in");
  el("medidorTitulo").textContent = "Card " + pct + " % filled in";
  el("medidorFaltan").textContent = (total - completos) + (total - completos === 1 ? " field still open" : " fields still open");
}

function valorCampo(f) {
  if (f.tipo === "grupo") return marcadas().join(",");
  if (f.tipo === "radio") return tonoActual();
  return el(f.id).value.trim();
}

function contenedorCampo(f) {
  if (f.tipo === "grupo") return plataformas.closest(".campo");
  if (f.tipo === "radio") return tonos.closest(".campo");
  return el(f.id).closest(".campo");
}

function controlReal(f) {
  if (f.tipo === "grupo") return plataformas.querySelector("input");
  if (f.tipo === "radio") return tonos.querySelector("input");
  return el(f.id);
}

function pintarCampo(f) {
  const env = contenedorCampo(f);
  const ayuda = el(f.id + "-ayuda");
  const err = el(f.id + "-err");
  const valor = valorCampo(f);
  const vacio = valor === "";
  const reservado = f.id === "manojo" && RESERVADAS.indexOf(valor.toLowerCase()) !== -1;
  const malo = reservado || !f.prueba(valor);
  const fallo = f.suave ? (malo && !vacio) : malo;
  const control = controlReal(f);
  const desc = [ayuda.id];

  if (fallo) {
    env.dataset.estado = "error";
    control.setAttribute("aria-invalid", "true");
    desc.push(err.id);
    if (reservado) err.textContent = valor.toLowerCase() + " is on the reserved list. The directory keeps those handles for staff, so pick one with a digit in it.";
    else err.textContent = vacio ? f.vacio : f.error;
  } else {
    env.dataset.estado = vacio ? "neutro" : "ok";
    control.setAttribute("aria-invalid", "false");
    err.textContent = "";
  }

  if (f.tipo === "radio") tonos.setAttribute("aria-describedby", desc.join(" "));
  else control.setAttribute("aria-describedby", desc.join(" "));

  return fallo;
}

function problemas() {
  const salida = [];
  CAMPOS.forEach(f => {
    if (f.suave) {
      const v = valorCampo(f);
      if (v !== "" && !f.prueba(v)) salida.push(f.etiqueta + ": " + f.error);
      return;
    }
    if (!f.prueba(valorCampo(f))) {
      const v = valorCampo(f);
      salida.push(f.etiqueta + ": " + (v === "" ? f.vacio : f.error));
    }
  });
  if (RESERVADAS.indexOf(manojo.value.trim().toLowerCase()) !== -1) {
    salida.push("Handle: " + manojo.value.trim() + " is on the reserved list, the directory keeps those for staff.");
  }
  return salida;
}

function mostrarResumen(fallos) {
  tituloError.textContent = fallos.length === 1
    ? "One field is stopping the card"
    : fallos.length + " fields are stopping the card";
  listaError.innerHTML = "";
  fallos.forEach(t => {
    const li = document.createElement("li");
    li.textContent = t;
    listaError.appendChild(li);
  });
  resumenError.hidden = false;
}

function avisoManojo() {
  const v = manojo.value.trim().toLowerCase();
  if (v === "") {
    el("manojo-ayuda").textContent = "Three to twenty characters, letters, digits, underscore and dot. No spaces, no capitals.";
    return;
  }
  if (RESERVADAS.indexOf(v) !== -1) {
    el("manojo-ayuda").textContent = v + " is reserved for staff. Try something with a digit in it.";
    return;
  }
  el("manojo-ayuda").textContent = "@" + v + " is free across all six platforms, as far as the directory can tell.";
}

function refrescar() {
  pintarTarjeta();
  pintarMedidor();
}

CAMPOS.forEach(f => {
  if (f.tipo === "grupo") {
    plataformas.addEventListener("change", () => {
      pintarCampo(f);
      refrescar();
    });
    return;
  }
  if (f.tipo === "radio") {
    tonos.addEventListener("change", () => {
      pintarCampo(f);
      refrescar();
    });
    return;
  }
  const nodo = el(f.id);
  nodo.addEventListener("blur", () => pintarCampo(f));
  nodo.addEventListener("change", () => pintarCampo(f));
  nodo.addEventListener("input", () => {
    if (nodo.closest(".campo").dataset.estado === "error") pintarCampo(f);
    if (f.id === "manojo") avisoManojo();
    refrescar();
  });
});

form.addEventListener("submit", e => {
  e.preventDefault();
  CAMPOS.forEach(pintarCampo);
  const fallos = problemas();

  if (fallos.length > 0) {
    mostrarResumen(fallos);
    const primero = CAMPOS.find(f => {
      if (f.suave) return false;
      return !f.prueba(valorCampo(f));
    });
    if (primero === undefined) {
      manojo.focus();
      return;
    }
    controlReal(primero).focus();
    return;
  }

  resumenError.hidden = true;
  const cat = CATEGORIAS[categoria.value];
  const ciudadNombre = CIUDADES[ciudad.value].nombre;
  const plats = marcadas();

  el("pubNombre").textContent = nombre.value.trim();
  el("pubManojo").textContent = "@" + manojo.value.trim();
  el("pubCategoria").textContent = cat;
  el("pubNumero").textContent = "NL-" + String(Math.floor(1000 + Math.random() * 8999));
  el("pubTitulo").textContent = "The brand is live, " + nombre.value.trim().split(" ")[0];
  el("pubTexto").textContent = "Filed under " + cat.toLowerCase() + " in " + ciudadNombre +
    " with " + plats.length + (plats.length === 1 ? " platform" : " platforms") + " on the card.";

  const lista = el("pubPlataformas");
  lista.innerHTML = "";
  ORDEN_PLATAFORMAS.filter(p => plats.indexOf(p) !== -1).forEach(p => {
    const li = document.createElement("li");
    li.className = "insignia";
    const punto = document.createElement("i");
    li.appendChild(punto);
    li.appendChild(document.createTextNode(p));
    lista.appendChild(li);
  });

  form.hidden = true;
  document.querySelector(".vitrina").hidden = true;
  publicada.hidden = false;
  publicada.focus();
});

el("otra").addEventListener("click", () => {
  form.reset();
  ultimasIniciales = "--";
  CAMPOS.forEach(f => {
    contenedorCampo(f).dataset.estado = "neutro";
    el(f.id + "-err").textContent = "";
    const control = controlReal(f);
    control.setAttribute("aria-invalid", "false");
    if (f.tipo === "radio") tonos.setAttribute("aria-describedby", f.id + "-ayuda");
    else control.setAttribute("aria-describedby", f.id + "-ayuda");
  });
  el("plataformas-ayuda").textContent = "Nothing ticked yet. The card shows three empty slots where the badges go.";
  el("lemaCuenta").textContent = "0 of 64";
  el("bioCuenta").textContent = "0 of 240";
  resumenError.hidden = true;
  publicada.hidden = true;
  form.hidden = false;
  document.querySelector(".vitrina").hidden = false;
  refrescar();
  nombre.focus();
});

refrescar();
