const form = document.getElementById("form");
const tituloAnuncio = document.getElementById("tituloAnuncio");
const categoria = document.getElementById("categoria");
const descripcion = document.getElementById("descripcion");
const precio = document.getElementById("precio");
const provincia = document.getElementById("provincia");
const municipio = document.getElementById("municipio");
const normas = document.getElementById("normas");
const fotos = document.getElementById("fotos");
const resumenError = document.getElementById("resumenError");
const listaError = document.getElementById("resumenErrorLista");
const tituloError = document.getElementById("resumenErrorTitulo");
const publicado = document.getElementById("publicado");

const TONOS = [
  [41, 92, 138], [212, 148, 38], [86, 150, 118], [186, 96, 78], [124, 106, 178], [222, 196, 120]
];

let paletas = 0;
const huecos = [true, true, true, false, false, false];

const CAMPOS = [
  {
    id: "tituloAnuncio",
    etiqueta: "Título",
    vacio: "El anuncio necesita un título para salir en el listado.",
    error: "Entre 10 y 70 caracteres. Empieza por el objeto y sin símbolos raros.",
    prueba: v => v.length >= 10 && v.length <= 70 && /[a-zA-ZÀ-ÿ]/.test(v)
  },
  {
    id: "categoria",
    etiqueta: "Categoría",
    vacio: "Elige la categoría donde debe aparecer el anuncio.",
    error: "Esa categoría no existe en el tablón.",
    prueba: v => ["bicis", "informatica", "muebles", "electro", "libros", "jardin"].includes(v)
  },
  {
    id: "descripcion",
    etiqueta: "Descripción",
    vacio: "Cuenta qué vendes, en qué estado y qué incluye la entrega.",
    error: "Faltan detalles: escribe al menos 40 caracteres y un máximo de 1.500.",
    prueba: v => v.length >= 40 && v.length <= 1500
  },
  {
    id: "precio",
    etiqueta: "Precio",
    vacio: "Pon un precio de venta, aunque sea de una pieza suelta.",
    error: "Entre 1 € y 99.999 €, con coma para los decimales.",
    prueba: v => /^\d{1,5}(,\d{1,2})?$/.test(v) && Number(v.replaceAll(',', ".")) >= 1 && Number(v.replaceAll(',', ".")) <= 99999
  },
  {
    id: "provincia",
    etiqueta: "Provincia",
    vacio: "Elige la provincia donde está el objeto.",
    error: "Esa provincia no está en la lista de trabajo.",
    prueba: v => ["bizkaia", "gipuzkoa", "araba", "navarra", "cantabria"].includes(v)
  },
  {
    id: "municipio",
    etiqueta: "Municipio",
    vacio: "Indica el municipio para la entrega en mano.",
    error: "Entre 2 y 50 caracteres, con al menos dos letras.",
    prueba: v => v.length >= 2 && v.length <= 50 && /[a-zA-ZÀ-ÿ]{2}/.test(v)
  },
  {
    id: "estadoArticulo", tipo: "radio",
    etiqueta: "Estado del artículo",
    vacio: "Elige en qué estado está el objeto.",
    error: "Ese estado no está en la lista.",
    prueba: v => ["nuevo", "poco", "piezas"].includes(v)
  },
  {
    id: "fotos", tipo: "muestras",
    etiqueta: "Fotos",
    vacio: "Añade al menos dos fotos antes de publicar.",
    error: "Con una sola foto el anuncio tarda el doble en venderse.",
    prueba: () => huecos.filter(Boolean).length >= 2
  },
  {
    id: "normas", tipo: "check",
    etiqueta: "Normas del tablón",
    vacio: "Hay que aceptar las normas para publicar el anuncio.",
    error: "Sin la aceptación no se puede publicar nada.",
    prueba: v => v === "si"
  }
];

function el(id) { return document.getElementById(id); }

function dinero(n) {
  return n.toFixed(2).replace(".", ",") + " €";
}

function valor(f) {
  if (f.id === "estadoArticulo") {
    const marcado = document.querySelector('input[name="estadoArticulo"]:checked');
    return marcado ? marcado.value : "";
  }
  if (f.id === "normas") return normas.checked ? "si" : "";
  if (f.id === "fotos") return huecos.filter(Boolean).length >= 2 ? "si" : "";
  return el(f.id).value.trim();
}

function contenedor(f) { return el(f.id).closest(".campo"); }

function pintarFotos(saltarAnimacion) {
  fotos.innerHTML = "";
  huecos.forEach((lleno, i) => {
    const div = document.createElement("div");
    div.className = "hueco-foto";
    div.dataset.lleno = lleno ? "1" : "0";
    div.dataset.portada = i === 0 ? "1" : "0";
    div.style.setProperty("--d", i * 0.3 + "s");
    if (lleno) {
      const t = TONOS[(i + paletas) % TONOS.length];
      const u = TONOS[(i + paletas + 3) % TONOS.length];
      div.style.background = "linear-gradient(150deg, rgb(" + t[0] + "," + t[1] + "," + t[2] + "), rgb(" + u[0] + "," + u[1] + "," + u[2] + "))";
    }
    if (i === 0) div.style.animation = "portada 3.4s ease-in-out infinite";
    if (saltarAnimacion) div.style.animationDelay = "0s";
    fotos.appendChild(div);
  });
  el("fotosNota").textContent = huecos.filter(Boolean).length + " de " + huecos.length + " huecos con foto";
  const f = CAMPOS.find(x => x.id === "fotos");
  const env = contenedor(f);
  const err = el("fotos-error");
  if (valor(f) === "si") {
    env.dataset.estado = "ok";
    err.textContent = "";
  } else if (env.dataset.estado !== "neutro") {
    env.dataset.estado = "error";
    err.textContent = f.error;
  }
  pintarPortadaMiniatura();
}

function pintarPortadaMiniatura() {
  const tono = TONOS[(0 + paletas) % TONOS.length];
  const tono2 = TONOS[(3 + paletas) % TONOS.length];
  el("miniaturaPortada").style.background = "linear-gradient(150deg, rgb(" + tono[0] + "," + tono[1] + "," + tono[2] + "), rgb(" + tono2[0] + "," + tono2[1] + "," + tono2[2] + "))";
}

function pintar(f) {
  const env = contenedor(f);
  const ayuda = el(f.id + "-ayuda");
  const error = el(f.id + "-error");
  const v = valor(f);
  const vacio = v === "";
  const malo = !vacio && !f.prueba(v);
  const desc = [ayuda.id];

  if (f.tipo === "check" || f.tipo === "radio" || f.tipo === "muestras") {
    let foco;
    if (f.tipo === "radio") foco = document.querySelector('input[name="estadoArticulo"]');
    else if (f.tipo === "check") foco = normas;
    else foco = fotos;
    foco.setAttribute("aria-invalid", (vacio || malo) ? "true" : "false");
  } else {
    el(f.id).setAttribute("aria-invalid", (vacio || malo) ? "true" : "false");
  }

  if (vacio || malo) {
    env.dataset.estado = "error";
    desc.push(error.id);
    error.textContent = vacio ? f.vacio : f.error;
  } else {
    env.dataset.estado = "ok";
    error.textContent = "";
  }

  if (f.tipo === "radio") {
    document.querySelector(".estados").setAttribute("aria-describedby", desc.join(" "));
  } else if (f.tipo === "muestras") {
    fotos.setAttribute("aria-describedby", desc.join(" "));
  } else {
    el(f.id).setAttribute("aria-describedby", desc.join(" "));
  }

  return vacio || malo;
}

function problemas() {
  return CAMPOS.filter(f => {
    const v = valor(f);
    return v === "" || !f.prueba(v);
  });
}

function progreso() {
  const n = CAMPOS.length - problemas().length;
  el("selloPasos").textContent = n + " de " + CAMPOS.length + " campos listos";
}

CAMPOS.forEach(f => {
  if (f.tipo === "check") {
    normas.addEventListener("change", () => { pintar(f); progreso(); });
    return;
  }
  if (f.tipo === "radio") {
    document.querySelectorAll('input[name="estadoArticulo"]').forEach(r => {
      r.addEventListener("change", () => { pintar(f); progreso(); });
      r.addEventListener("blur", () => pintar(f));
    });
    return;
  }
  const nodo = el(f.id);
  nodo.addEventListener("blur", () => { pintar(f); progreso(); });
  nodo.addEventListener("input", () => {
    if (nodo.closest(".campo").dataset.estado === "error") pintar(f);
    progreso();
  });
  nodo.addEventListener("change", () => { pintar(f); progreso(); });
});

function cuenta() {
  const t = tituloAnuncio.value;
  el("tituloAnuncio-contador").textContent = t.length + " de 70";
  const d = descripcion.value;
  el("descripcion-contador").textContent = d.length === 1 ? "1 carácter" : d.length + " caracteres";
  const p = Math.min(1, d.length / 40);
  el("largoRelleno").style.transform = "scaleX(" + p.toFixed(4) + ")";
  el("largoRelleno").style.background = d.length >= 40
    ? "linear-gradient(90deg, #5fd39a, #9ae8c2)"
    : "linear-gradient(90deg, #f0a500, #ffc94d)";
  el("precioAntes").textContent = CAMPOS[3].prueba(precio.value.trim())
    ? "Precio de tablón: " + dinero(Number(precio.value.replaceAll(',', ".")) * 0.9)
    : "Sin precio válido";
  el("miniaturaPrecio").textContent = CAMPOS[3].prueba(precio.value.trim())
    ? dinero(Number(precio.value.replaceAll(',', ".")))
    : "Sin precio";
  el("miniaturaTitulo").textContent = t.trim() || "Sin título";
  let lugar = "sin municipio";
  if (municipio.value.trim()) {
    const provinciaTexto = provincia.value ? provincia.options[provincia.selectedIndex].text : "sin provincia";
    lugar = municipio.value.trim() + ", " + provinciaTexto;
  }
  el("miniaturaLugar").textContent = lugar;
}

tituloAnuncio.addEventListener("input", cuenta);
descripcion.addEventListener("input", cuenta);
precio.addEventListener("input", function () {
  let v = this.value.replace(/[^\d,]/g, "");
  const partes = v.split(",");
  if (partes.length > 2) v = partes[0] + "," + partes[1];
  const coma = v.indexOf(",");
  if (coma >= 0) v = v.slice(0, coma + 1) + v.slice(coma + 1).slice(0, 2);
  if (coma === 0) v = v.slice(1);
  this.value = v;
  cuenta();
});
municipio.addEventListener("input", cuenta);
provincia.addEventListener("change", cuenta);

el("repaltear").addEventListener("click", () => {
  paletas = (paletas + 1) % TONOS.length;
  pintarFotos();
  pintarPortadaMiniatura();
  progreso();
  el("repaltear").blur();
});

form.addEventListener("submit", e => {
  e.preventDefault();
  CAMPOS.forEach((...args) => pintar(...args));
  cuenta();
  progreso();

  const fallos = problemas();
  if (fallos.length > 0) {
    tituloError.textContent = fallos.length === 1
      ? "Falta corregir un dato del anuncio"
      : "Faltan " + fallos.length + " datos del anuncio";
    listaError.innerHTML = "";
    fallos.forEach(f => {
      const li = document.createElement("li");
      const v = valor(f);
      li.textContent = f.etiqueta + ": " + (v === "" ? f.vacio : f.error);
      listaError.appendChild(li);
    });
    resumenError.hidden = false;
    const primero = fallos[0];
    if (primero.id === "fotos") fotos.focus();
    else if (primero.id === "estadoArticulo") document.querySelector('input[name="estadoArticulo"]').focus();
    else if (primero.id === "normas") normas.focus();
    else el(primero.id).focus();
    return;
  }

  resumenError.hidden = true;
  completar();
});

function completar() {
  const ref = "AP-" + String(Math.floor(100000 + Math.random() * 900000));
  el("publicadoRef").textContent = ref;
  el("publicadoCategoria").textContent = categoria.options[categoria.selectedIndex].text;
  el("publicadoPrecio").textContent = dinero(Number(precio.value.replaceAll(',', ".")));
  el("publicadoLugar").textContent = municipio.value.trim() + ", " + provincia.options[provincia.selectedIndex].text;
  el("publicadoTitulo").textContent = "Publicado: " + tituloAnuncio.value.trim();
  el("publicadoTexto").textContent = "El anuncio con la referencia " + ref + " ya está visible para quien compra en " +
    provincia.options[provincia.selectedIndex].text + ". Recibirás un aviso cuando alguien te escriba.";

  pintarPortadaMiniatura();
  form.hidden = true;
  document.querySelector(".encabezado").hidden = true;
  publicado.hidden = false;
  publicado.focus();
}

el("otra").addEventListener("click", () => {
  publicado.hidden = true;
  form.hidden = false;
  document.querySelector(".encabezado").hidden = false;
  form.reset();
  document.querySelector('input[name="estadoArticulo"][value="poco"]').checked = true;
  huecos.splice(0, huecos.length, true, true, true, false, false, false);
  paletas = 0;
  CAMPOS.forEach(f => {
    contenedor(f).dataset.estado = "neutro";
    el(f.id + "-error").textContent = "";
    if (f.tipo === "radio" || f.tipo === "muestras") return;
    el(f.id).setAttribute("aria-invalid", "false");
    el(f.id).setAttribute("aria-describedby", f.id + "-ayuda");
  });
  normas.setAttribute("aria-invalid", "false");
  document.querySelector('input[name="estadoArticulo"]').setAttribute("aria-invalid", "false");
  resumenError.hidden = true;
  pintarFotos();
  cuenta();
  progreso();
  tituloAnuncio.focus();
});

pintarFotos();
cuenta();
progreso();
