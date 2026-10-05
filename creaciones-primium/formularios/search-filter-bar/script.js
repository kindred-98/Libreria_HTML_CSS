const form = document.getElementById("form");
const consulta = document.getElementById("consulta");
const lista = document.getElementById("lista");
const vacio = document.getElementById("vacio");
const conteo = document.getElementById("conteo");
const limpiar = document.getElementById("limpiar");
const resumenError = document.getElementById("resumenError");
const listaError = document.getElementById("resumenErrorLista");
const tituloError = document.getElementById("resumenErrorTitulo");
const vistas = document.getElementById("vistas");
const barra = document.getElementById("form");

const VISTAS = [
  { clave: "todo", texto: "Everything" },
  { clave: "guia", texto: "Guides" },
  { clave: "ensayo", texto: "Essays" },
  { clave: "foro", texto: "Forum" },
  { clave: "oferta", texto: "Offers" },
  { clave: "receta", texto: "Recipes" }
];

const PAGINAS = [
  { titulo: "How to read a bond prospectus", tipo: "guia", minutos: 14, vistas: 48210, dia: 4, precio: 0 },
  { titulo: "The quiet return of the paper notebook", tipo: "ensayo", minutos: 22, vistas: 12040, dia: 2, precio: 0 },
  { titulo: "Ask anything: margins and paper grain", tipo: "foro", minutos: 6, vistas: 890, dia: 1, precio: 0 },
  { titulo: "Half price on the winter bundle", tipo: "oferta", minutos: 3, vistas: 21030, dia: 7, precio: 12 },
  { titulo: "A one page rye loaf that never fails", tipo: "receta", minutos: 5, vistas: 6400, dia: 11, precio: 4 },
  { titulo: "Indexing a small archive by hand", tipo: "guia", minutos: 18, vistas: 22110, dia: 21, precio: 0 },
  { titulo: "Why the footnote outlived the essay", tipo: "ensayo", minutos: 31, vistas: 33120, dia: 34, precio: 0 },
  { titulo: "Show us your desk, edition twelve", tipo: "foro", minutos: 4, vistas: 3100, dia: 1, precio: 0 },
  { titulo: "Two thirds off the archive annual plan", tipo: "oferta", minutos: 2, vistas: 15770, dia: 3, precio: 24 },
  { titulo: "Reading lists for a rainy October", tipo: "guia", minutos: 9, vistas: 9020, dia: 9, precio: 0 },
  { titulo: "The last typesetter in the valley", tipo: "ensayo", minutos: 27, vistas: 18450, dia: 48, precio: 0 },
  { titulo: "Ferment on a schedule, not on a vibe", tipo: "receta", minutos: 7, vistas: 4310, dia: 16, precio: 6 }
];

const st = { vista: "todo", gratis: false, orden: "relevancia", buscado: false };

function el(id) { return document.getElementById(id); }

function nodo(etiqueta, clase, texto) {
  const n = document.createElement(etiqueta);
  if (clase) n.className = clase;
  if (texto !== undefined) n.textContent = texto;
  return n;
}

function montarVistas() {
  vistas.innerHTML = "";
  VISTAS.forEach(v => {
    const b = nodo("button", "vista", v.texto);
    b.type = "button";
    b.setAttribute("aria-pressed", st.vista === v.clave ? "true" : "false");
    b.addEventListener("click", () => {
      st.vista = v.clave;
      montarVistas();
      pintar();
    });
    vistas.appendChild(b);
  });
  medirPiloto();
}

function medirPiloto() {
  const activo = vistas.querySelector('[aria-pressed="true"]');
  if (!activo) return;
  vistas.style.setProperty("--ancho", activo.offsetWidth + "px");
  vistas.style.setProperty("--piloto", (activo.offsetLeft - 3) + "px");
}

function coincide(pagina, texto) {
  if (!pagina.titulo.toLowerCase().includes(texto)) return false;
  if (st.vista !== "todo" && pagina.tipo !== st.vista) return false;
  if (st.gratis && pagina.precio !== 0) return false;
  return true;
}

function ordenar(lista) {
  const copia = lista.slice();
  if (st.orden === "nuevos") copia.sort((a, b) => a.dia - b.dia);
  if (st.orden === "vistos") copia.sort((a, b) => b.vistas - a.vistas);
  if (st.orden === "corto") copia.sort((a, b) => a.minutos - b.minutos);
  return copia;
}

function resaltar(texto, aguja) {
  const bucle = document.createElement("b");
  bucle.className = "lista__titulo";
  const i = texto.toLowerCase().indexOf(aguja);
  if (i === -1) {
    bucle.textContent = texto;
    return bucle;
  }
  bucle.appendChild(document.createTextNode(texto.slice(0, i)));
  const marca = nodo("span", "lista__marcar", texto.slice(i, i + aguja.length));
  bucle.appendChild(marca);
  bucle.appendChild(document.createTextNode(texto.slice(i + aguja.length)));
  return bucle;
}

function falloConsulta() {
  const v = consulta.value.trim();
  if (v === "") return "Type what you are looking for, at least two characters.";
  if (v.length < 2) return "One character matches half the catalogue. Add one more.";
  if (v.length > 60) return "That query is longer than sixty characters and gets cut down.";
  return "";
}

function pintarConsulta(marcar) {
  const mensaje = falloConsulta();
  if (marcar === false) {
    delete barra.dataset.estado;
    consulta.removeAttribute("aria-invalid");
    el("consulta-ayuda").dataset.alerta = "0";
    return "";
  }
  if (mensaje) barra.dataset.estado = "error";
  else delete barra.dataset.estado;
  consulta.setAttribute("aria-invalid", mensaje ? "true" : "false");
  el("consulta-ayuda").dataset.alerta = mensaje ? "1" : "0";
  return mensaje;
}

const MUESTRAS = ["notebook", "footnote", "prose", "archivo"];

function montarMuestras() {
  const caja = el("muestras");
  caja.innerHTML = "";
  MUESTRAS.forEach(m => {
    const b = nodo("button", null, m);
    b.type = "button";
    b.addEventListener("click", () => {
      consulta.value = m;
      consulta.closest(".barra__campo").dataset.estado = "neutro";
      st.buscado = true;
      el("lanzarTexto").textContent = "Search again";
      pintar();
      consulta.focus();
    });
    caja.appendChild(b);
  });
}

function pintar() {
  const texto = consulta.value.trim().toLowerCase();
  const conFiltro = texto.length >= 2 || st.vista !== "todo" || st.gratis;
  const filtrados = ordenar(PAGINAS.filter(p => coincide(p, texto)));

  lista.innerHTML = "";
  filtrados.slice(0, 6).forEach((p, i) => {
    const li = nodo("li");
    li.dataset.tipo = p.tipo;
    li.dataset.precio = p.precio > 0 ? "1" : "0";
    li.style.animationDelay = (i * 0.05).toFixed(2) + "s";
    li.appendChild(nodo("span", "lista__tipo", p.tipo));
    const datos = nodo("div", "lista__datos");
    datos.appendChild(resaltar(p.titulo, texto));
    datos.appendChild(nodo("p", "lista__meta", p.minutos + " min read, " + p.vistas.toLocaleString("en-GB") + " reads, updated " + p.dia + " days ago"));
    li.appendChild(datos);
    li.appendChild(nodo("span", "lista__precio", p.precio > 0 ? p.precio + ",00 EUR" : "free"));
    lista.appendChild(li);
  });

  const vacioTotal = filtrados.length === 0;
  vacio.hidden = !vacioTotal || !conFiltro;
  lista.hidden = vacioTotal || !conFiltro;
  el("ocio").hidden = conFiltro;

  if (vacioTotal && conFiltro) {
    el("vacioNota").textContent = "Nothing matches " + (texto ? "the words " + texto : "these filters") +
      ". Try two or three words, or open the free filter again.";
  }

  if (!conFiltro) {
    conteo.textContent = "Type something to see the count";
    limpiar.hidden = true;
  } else {
    conteo.textContent = filtrados.length + (filtrados.length === 1 ? " page matches" : " pages match") +
      (st.buscado && texto ? " for " + consulta.value.trim() : " as you type") +
      (st.gratis ? ", free only" : "") +
      (st.vista !== "todo" ? ", in " + VISTAS.filter(v => v.clave === st.vista)[0].texto.toLowerCase() : "");
    limpiar.hidden = false;
  }
  return filtrados.length;
}

consulta.addEventListener("blur", () => pintarConsulta());
consulta.addEventListener("input", () => {
  if (consulta.closest(".barra__campo").dataset.estado === "error") pintarConsulta();
  pintar();
});
consulta.addEventListener("focus", () => barra.dataset.foco = "1");
consulta.addEventListener("blur", () => delete barra.dataset.foco);

el("orden").addEventListener("change", e => {
  st.orden = e.target.value;
  pintar();
});

el("gratis").addEventListener("click", () => {
  st.gratis = !st.gratis;
  el("gratis").setAttribute("aria-checked", st.gratis ? "true" : "false");
  el("gratis").style.setProperty("--perilla", (st.gratis ? 20 : 0) + "px");
  pintar();
});

form.addEventListener("submit", e => {
  e.preventDefault();
  const mensaje = pintarConsulta();
  if (mensaje) {
    tituloError.textContent = "The search did not run";
    listaError.innerHTML = "";
    const li = document.createElement("li");
    li.textContent = "Search box: " + mensaje;
    listaError.appendChild(li);
    resumenError.hidden = false;
    consulta.focus();
    return;
  }
  resumenError.hidden = true;
  st.buscado = true;
  el("lanzarTexto").textContent = "Search again";
  pintar();
});

limpiar.addEventListener("click", () => {
  consulta.value = "";
  st.vista = "todo";
  st.gratis = false;
  st.buscado = false;
  st.orden = "relevancia";
  el("orden").value = "relevancia";
  el("gratis").setAttribute("aria-checked", "false");
  el("gratis").style.setProperty("--perilla", "0px");
  el("lanzarTexto").textContent = "Search";
  resumenError.hidden = true;
  consulta.removeAttribute("aria-invalid");
  montarVistas();
  pintar();
  consulta.focus();
});

document.addEventListener("keydown", e => {
  const enCampo = document.activeElement && ["INPUT", "SELECT", "TEXTAREA"].includes(document.activeElement.tagName);
  if ((e.key === "/" && !enCampo) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k")) {
    e.preventDefault();
    consulta.focus();
    consulta.select();
    return;
  }
  if (e.key === "Escape" && document.activeElement === consulta) {
    e.preventDefault();
    consulta.value = "";
    st.buscado = false;
    el("lanzarTexto").textContent = "Search";
    resumenError.hidden = true;
      pintar();
  }
});

window.addEventListener("resize", medirPiloto);

montarVistas();
montarMuestras();
pintar();
pintarConsulta(false);
