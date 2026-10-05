const form = document.getElementById("form");
const hoja = document.getElementById("hoja");
const asa = document.getElementById("asa");
const separador = document.getElementById("separador");
const hojaEstado = document.getElementById("hojaEstado");
const fichas = document.getElementById("fichas");
const correos = document.getElementById("correos");
const resumenError = document.getElementById("resumenError");
const listaError = document.getElementById("resumenErrorLista");
const tituloError = document.getElementById("resumenErrorTitulo");
const enviados = document.getElementById("enviados");

const MINIMO = 330;
const MAXIMO = 660;

const CAMPOS = [
  {
    id: "correos",
    etiqueta: "Email addresses",
    vacio: "Type at least two addresses, separated by commas or spaces.",
    error: "Two to eight valid addresses, no repeats and no address that already belongs to the team.",
    prueba: () => false
  },
  {
    id: "rol",
    etiqueta: "Access level",
    vacio: "Pick what these people will be able to do.",
    error: "That access level is not offered on the Studio plan.",
    prueba: v => ["admin", "editor", "invitado", "facturacion"].includes(v)
  },
  {
    id: "equipo",
    etiqueta: "Team",
    vacio: "Put them in a team, otherwise they land in nobody.",
    error: "That team does not exist in this workspace.",
    prueba: v => ["studio", "finanzas", "soporte", "ops", "diseno"].includes(v)
  },
  {
    id: "mensaje",
    etiqueta: "Message",
    vacio: "Write the message that travels with the invitation, at least twenty characters.",
    error: "Between 20 and 240 characters. Long enough to say why, short enough to read on a phone.",
    prueba: v => v.length >= 20 && v.length <= 240
  },
  {
    id: "caducidad",
    etiqueta: "Invitation expiry",
    vacio: "",
    error: "",
    prueba: () => false
  },
  {
    id: "calendario",
    etiqueta: "Calendar hold",
    vacio: "",
    error: "",
    prueba: v => v === "si" || v === "no"
  }
];

const YA_DENTRO = ["ana.morales@halden.example", "dana.whitlock@halden.example", "pablo.ruiz@halden.example"];
const TIRADOS = ["mailinator.com", "guerrillamail.com"];

let ancho = 440;
let abierto = true;

function el(id) { return document.getElementById(id); }

function nodo(etiqueta, clase, texto) {
  const n = document.createElement(etiqueta);
  if (clase) n.className = clase;
  if (texto !== undefined) n.textContent = texto;
  return n;
}

function validaCorreo(correo) {
  if (YA_DENTRO.includes(correo)) return "inside";
  if (TIRADOS.includes(correo.split("@")[1] || "")) return "tirado";
  if (!/^[^\s@,;]+@[^\s@,;]+\.[a-zA-Z]{2,}$/.test(correo)) return "mala";
  return "bien";
}

function listaCorreos() {
  return correos.value
    .split(/[\s,;]+/)
    .map(s => s.trim().toLowerCase())
    .filter(s => s !== "");
}

function pintarFichas() {
  const lista = listaCorreos();
  fichas.innerHTML = "";
  lista.forEach((c, i) => {
    const estado = validaCorreo(c);
    const f = nodo("span", "ficha");
    f.dataset.mala = estado === "bien" ? "0" : "1";
    const texto = estado === "inside" ? c + " already in the team" : estado === "tirado" ? c + " is a throwaway inbox" : c;
    f.appendChild(nodo("span", null, texto));
    const quitar = nodo("button", "ficha__quitar", "x");
    quitar.type = "button";
    quitar.setAttribute("aria-label", "Remove " + c + " from the list");
    quitar.addEventListener("click", () => {
      const partes = lista.slice();
      partes.splice(i, 1);
      correos.value = partes.join(", ");
      pintarFichas();
      pintarCampo("correos");
      quitarAnterior(i, partes);
    });
    f.appendChild(quitar);
    fichas.appendChild(f);
  });
}

function quitarAnterior(indice, partes) {
  const botones = fichas.querySelectorAll(".ficha__quitar");
  if (botones[indice]) botones[indice].focus();
  else if (botones[0]) botones[0].focus();
  else correos.focus();
}

function falloCorreos() {
  const lista = listaCorreos();
  if (lista.length === 0) return CAMPOS[0].vacio;
  if (lista.length < 2) return "One address is not an invitation. Add at least one more.";
  if (lista.length > 8) return "Eight is the maximum per sheet. " + lista.length + " addresses are too many.";
  const repetidos = lista.filter((c, i) => lista.indexOf(c) !== i);
  if (repetidos.length > 0) return "The address " + repetidos[0] + " is written twice.";
  const dentro = lista.filter(c => validaCorreo(c) === "inside");
  if (dentro.length > 0) return dentro[0] + " is already in the team, remove the chip.";
  const tirados = lista.filter(c => validaCorreo(c) === "tirado");
  if (tirados.length > 0) return tirados[0] + " is a throwaway inbox, the link would expire unused.";
  const malas = lista.filter(c => validaCorreo(c) === "mala");
  if (malas.length > 0) return malas[0] + " is not a valid address.";
  return "";
}

function fallo(f) {
  if (f.id === "correos") return falloCorreos();
  if (f.id === "caducidad") return "";
  if (f.id === "calendario") return "";
  const v = f.id === "mensaje" ? el("mensaje").value.trim() : el(f.id).value.trim();
  if (v === "") return f.vacio;
  return f.prueba(v) ? "" : f.error;
}

function pintarCampo(id) {
  const f = CAMPOS.find(x => x.id === id);
  const nodoCampo = el(id);
  if (!f || !nodoCampo) return "";
  const env = nodoCampo.closest(".campo");
  const ayuda = el(id + "-ayuda");
  const err = el(id + "-err");
  const mensaje = fallo(f);
  env.dataset.estado = mensaje ? "error" : "ok";
  nodoCampo.setAttribute("aria-invalid", mensaje ? "true" : "false");
  const ids = [];
  if (ayuda) ids.push(ayuda.id);
  if (mensaje && err) ids.push(err.id);
  nodoCampo.setAttribute("aria-describedby", ids.join(" "));
  if (err) err.textContent = mensaje;
  return mensaje;
}

function pintarTodo() {
  CAMPOS.forEach(f => pintarCampo(f.id));
}

function problemas() {
  const salida = [];
  CAMPOS.forEach(f => {
    const m = fallo(f);
    if (m) salida.push({ etiqueta: f.etiqueta, mensaje: m });
  });
  return salida;
}

function anchoMaximo() {
  return Math.min(MAXIMO, Math.max(MINIMO, window.innerWidth - 120));
}

function aplicarAncho() {
  const tope = anchoMaximo();
  if (window.innerWidth <= 700) {
    hoja.style.removeProperty("--ancho");
    document.documentElement.style.removeProperty("--ancho");
    separador.setAttribute("aria-disabled", "true");
    separador.setAttribute("aria-valuenow", "440");
    separador.setAttribute("aria-valuemax", "660");
    separador.setAttribute("aria-valuetext", "full width sheet on this screen");
    hoja.__desplaza = 0;
    hoja.__destino = 0;
    hoja.style.setProperty("--desplaza", "0px");
    posicionarCap();
    return;
  }
  separador.removeAttribute("aria-disabled");
  if (ancho > tope) ancho = tope;
  if (ancho < MINIMO) ancho = MINIMO;
  hoja.style.setProperty("--ancho", ancho + "px");
  document.documentElement.style.setProperty("--ancho", ancho + "px");
  separador.setAttribute("aria-valuenow", String(Math.round(ancho)));
  separador.setAttribute("aria-valuemax", String(Math.round(tope)));
  separador.setAttribute("aria-valuetext", Math.round(ancho) + " pixels wide");
  posicionarCap();
}

function asentar() {
  hoja.style.setProperty("--desplaza", hoja.__destino + "px");
  hojaEstado.textContent = abierto ? "sheet open" : "sheet tucked";
  el("abrir").setAttribute("aria-expanded", abierto ? "true" : "false");
  el("notaPie").textContent = abierto
    ? "The sheet is a real panel: try dragging the striped handle on top of it, and pull the dotted edge on its left side."
    : "The sheet is tucked at the edge. Press the handle or the button to bring it back; the width and everything you typed are kept.";
}

function alArrancarAsa(e) {
  if (hoja.__ancho !== undefined) return;
  e.preventDefault();
  hoja.dataset.arrastrando = "1";
  hoja.__origen = e.clientX;
  hoja.__cayo = hoja.__desplaza;
  asa.focus();
  if (asa.setPointerCapture && e.pointerId !== undefined) {
    try { asa.setPointerCapture(e.pointerId); } catch {}
  }
}

function alMoverAsa(e) {
  if (hoja.__origen === undefined) return;
  e.preventDefault();
  const tope = Math.max(0, window.innerWidth - ancho);
  let destino = hoja.__cayo + (e.clientX - hoja.__origen);
  if (destino < 0) destino = 0;
  if (destino > tope) destino = tope;
  hoja.__desplaza = destino;
  hoja.__destino = destino;
  hoja.style.setProperty("--desplaza", destino + "px");
  hojaEstado.textContent = Math.round(destino) + " px";
}

function alSoltarAsa() {
  if (hoja.__origen === undefined) return;
  hoja.__origen = undefined;
  delete hoja.dataset.arrastrando;
  const tope = Math.max(0, window.innerWidth - ancho);
  abierto = hoja.__desplaza <= tope * 0.35;
  hoja.__destino = abierto ? 0 : tope;
  asentar();
}

function alArrancarSeparador(e) {
  e.preventDefault();
  hoja.dataset.redimensionando = "1";
  hoja.__ancho = e.clientX;
  hoja.__anchoBase = ancho;
  separador.focus();
  if (separador.setPointerCapture && e.pointerId !== undefined) {
    try { separador.setPointerCapture(e.pointerId); } catch {}
  }
}

function alMoverSeparador(e) {
  if (hoja.__ancho === undefined) return;
  e.preventDefault();
  const tope = anchoMaximo();
  let nuevo = hoja.__anchoBase + (hoja.__ancho - e.clientX);
  if (nuevo < MINIMO) nuevo = MINIMO;
  if (nuevo > tope) nuevo = tope;
  ancho = nuevo;
  aplicarAncho();
  hojaEstado.textContent = Math.round(ancho) + " px wide";
}

function alSoltarSeparador() {
  if (hoja.__ancho === undefined) return;
  hoja.__ancho = undefined;
  delete hoja.dataset.redimensionando;
  hojaEstado.textContent = abierto ? "sheet open" : "sheet tucked";
}

asa.addEventListener("pointerdown", alArrancarAsa);
asa.addEventListener("pointermove", alMoverAsa);
asa.addEventListener("pointerup", alSoltarAsa);
asa.addEventListener("pointercancel", alSoltarAsa);
asa.addEventListener("keydown", e => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    abierto = !abierto;
    hoja.__destino = abierto ? 0 : Math.max(0, window.innerWidth - ancho);
    asentar();
  }
  if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
    e.preventDefault();
    const salto = e.key === "ArrowLeft" ? 32 : -32;
    const tope = Math.max(0, window.innerWidth - ancho);
    hoja.__desplaza = Math.max(0, Math.min(tope, hoja.__desplaza + salto));
    hoja.__destino = hoja.__desplaza;
    asentar();
  }
});

separador.addEventListener("pointerdown", alArrancarSeparador);
separador.addEventListener("pointermove", alMoverSeparador);
separador.addEventListener("pointerup", alSoltarSeparador);
separador.addEventListener("pointercancel", alSoltarSeparador);
separador.addEventListener("keydown", e => {
  const paso = e.shiftKey ? 48 : 16;
  const tope = anchoMaximo();
  if (e.key === "ArrowLeft") { e.preventDefault(); ancho = Math.min(tope, ancho + paso); }
  else if (e.key === "ArrowRight") { e.preventDefault(); ancho = Math.max(MINIMO, ancho - paso); }
  else if (e.key === "Home") { e.preventDefault(); ancho = MINIMO; }
  else if (e.key === "End") { e.preventDefault(); ancho = tope; }
  else if (e.key === "PageUp") { e.preventDefault(); ancho = Math.min(tope, ancho + 96); }
  else if (e.key === "PageDown") { e.preventDefault(); ancho = Math.max(MINIMO, ancho - 96); }
  else return;
  aplicarAncho();
  hojaEstado.textContent = Math.round(ancho) + " px wide";
});

el("abrir").addEventListener("click", () => {
  abierto = true;
  hoja.__destino = 0;
  asentar();
  el("correos").focus();
});

el("cerrar").addEventListener("click", () => {
  abierto = false;
  hoja.__destino = Math.max(0, window.innerWidth - ancho);
  asentar();
  el("abrir").focus();
});

function posicionarCap() {
  const entrada = el("caducidad");
  const cap = el("capCaducidad");
  const recorrido = (entrada.clientWidth || 300) - 20;
  const pos = (Number(entrada.value) / Number(entrada.max)) * recorrido;
  cap.style.setProperty("--pos", pos.toFixed(1) + "px");
  el("caducidad-ayuda").textContent = textoCaducidad(entrada.value) + " Arrow keys move it one day, Home and End jump to the ends.";
}

function textoCaducidad(v) {
  const n = Number(v);
  if (n === 1) return "One day. The link is barely usable that way.";
  if (n < 7) return n + " days. Short, the desk usually reminds them once.";
  if (n === 7) return "Seven days, the default and the most common answer.";
  if (n < 21) return n + " days. Long enough for people who travel.";
  return n + " days. Very long, a lot of them will never be used.";
}

CAMPOS.forEach(f => {
  if (f.id === "caducidad" || f.id === "calendario") return;
  const n = el(f.id);
  n.addEventListener("blur", () => pintarCampo(f.id));
  n.addEventListener("change", () => pintarCampo(f.id));
  n.addEventListener("input", () => {
    if (n.closest(".campo").dataset.estado === "error") pintarCampo(f.id);
    if (f.id === "correos") pintarFichas();
    if (f.id === "mensaje") pipsMensaje();
  });
});

el("caducidad").addEventListener("input", () => {
  posicionarCap();
  pintarCampo("caducidad");
});
el("caducidad").addEventListener("blur", () => pintarCampo("caducidad"));
el("calendario").addEventListener("change", () => {
  el("calendario").closest(".campo").dataset.estado = el("calendario").checked ? "ok" : "neutro";
  el("calendario").setAttribute("aria-invalid", "false");
});

form.addEventListener("submit", e => {
  e.preventDefault();
  pintarTodo();
  const fallos = problemas();

  if (fallos.length > 0) {
    tituloError.textContent = fallos.length === 1
      ? "One thing is still missing before sending"
      : fallos.length + " things are still missing before sending";
    listaError.innerHTML = "";
    fallos.forEach(f => {
      const li = document.createElement("li");
      li.textContent = f.etiqueta + ": " + f.mensaje;
      listaError.appendChild(li);
    });
    resumenError.hidden = false;
    el(fallos[0].etiqueta === "Email addresses" ? "correos" : fallos[0].etiqueta === "Access level" ? "rol" : fallos[0].etiqueta === "Team" ? "equipo" : "mensaje").focus();
    return;
  }

  resumenError.hidden = true;
  el("enviarTexto").textContent = "Sending";
  window.setTimeout(terminar, 700);
});

function terminar() {
  const lista = listaCorreos();
  const box = el("enviadosLista");
  box.innerHTML = "";
  lista.forEach((c, i) => {
    const li = document.createElement("li");
    li.textContent = c;
    li.style.animationDelay = (0.08 + i * 0.07).toFixed(2) + "s";
    box.appendChild(li);
  });
  const dias = Number(el("caducidad").value);
  el("enviadosTitulo").textContent = lista.length + (lista.length === 1 ? " person is" : " people are") + " waiting";
  el("enviadosLead").textContent = "Each link lives " + dias + (dias === 1 ? " day" : " days") +
    (el("calendario").checked ? " and a calendar hold is already in the message." : " and can be revoked from the members tab.");
  el("enviadosRol").textContent = el("rol").options[el("rol").selectedIndex].text.split(",")[0];
  el("enviadosEquipo").textContent = el("equipo").options[el("equipo").selectedIndex].text;
  el("enviadosCaduca").textContent = "in " + dias + (dias === 1 ? " day" : " days");
  form.hidden = true;
  enviados.hidden = false;
  enviados.focus();
}

el("otra").addEventListener("click", () => {
  enviados.hidden = true;
  form.hidden = false;
  correos.value = "";
  el("rol").value = "";
  el("equipo").value = "";
  el("mensaje").value = "";
  el("calendario").checked = false;
  el("caducidad").value = "7";
  el("mensaje-ayuda").dataset.alerta = "0";
  el("mensajeCuenta").textContent = "0 of 240 characters, 20 minimum";
  resumenError.hidden = true;
  pintarFichas();
  neutralizar();
  posicionarCap();
  correos.focus();
});

window.addEventListener("resize", () => {
  aplicarAncho();
  if (!hoja.dataset.arrastrando) {
    hoja.__destino = abierto ? 0 : Math.max(0, window.innerWidth - ancho);
    hoja.__desplaza = hoja.__destino;
    hoja.style.setProperty("--desplaza", hoja.__destino + "px");
  }
});

function pipsMensaje() {
  const caja = el("mensajePips");
  if (caja.childElementCount !== 10) {
    caja.innerHTML = "";
    for (let i = 0; i < 10; i++) caja.appendChild(nodo("i"));
  }
  const v = el("mensaje").value;
  const llenos = Math.min(10, Math.round((v.length / 240) * 10));
  for (let i = 0; i < 10; i++) caja.children[i].dataset.on = i < llenos ? "1" : "0";
  el("mensajeCuenta").textContent = v.length + " of 240 characters, 20 minimum";
  el("mensaje-ayuda").dataset.alerta = v.length > 0 && v.length < 20 ? "1" : "0";
}

function neutralizar() {
  CAMPOS.forEach(f => {
    const n = el(f.id);
    if (!n) return;
    n.closest(".campo").dataset.estado = "neutro";
    n.setAttribute("aria-invalid", "false");
    const ayuda = el(f.id + "-ayuda");
    if (ayuda) n.setAttribute("aria-describedby", ayuda.id);
    const err = el(f.id + "-err");
    if (err) err.textContent = "";
  });
  pipsMensaje();
  resumenError.hidden = true;
}

hoja.__desplaza = 0;
hoja.__destino = 0;
aplicarAncho();
pintarFichas();
neutralizar();
posicionarCap();
