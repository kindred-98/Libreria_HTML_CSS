const dialogo = document.getElementById("dialogo");
const velo = document.getElementById("velo");
const vestibulo = document.getElementById("vestibulo");
const form = document.getElementById("form");
const filas = document.getElementById("filas");
const resumenError = document.getElementById("resumenError");
const listaError = document.getElementById("resumenErrorLista");
const tituloError = document.getElementById("resumenErrorTitulo");
const aplicado = document.getElementById("aplicado");
const vivo = document.getElementById("vivo");

const ACCIONES = [
  { id: "ping", accion: "Ping the squad", nota: "Holds the marker for four seconds" },
  { id: "silencio", accion: "Mute the microphone", nota: "Local only, nobody hears the toggle" },
  { id: "marca", accion: "Drop a waypoint", nota: "Shows on the map of the whole squad" },
  { id: "curar", accion: "Use the field item", nota: "Only outside of a match" }
];

const PROHIBIDAS = ["Escape", "Shift", "Control", "Alt", "Meta", "CapsLock", "Tab"];

const SIMBOLOS = {
  BracketLeft: "[", BracketRight: "]", Backslash: "\\", Semicolon: ";", Quote: "'",
  Comma: ",", Period: ".", Slash: "/", Minus: "-", Equal: "=", Backquote: "`",
  Space: "Space", Enter: "Enter", Backspace: "Backspace"
};

let capturando = "";
let ultimoFoco = null;
let abierto = true;

function el(id) { return document.getElementById(id); }

function nodo(etiqueta, clase, texto) {
  const n = document.createElement(etiqueta);
  if (clase) n.className = clase;
  if (texto !== undefined) n.textContent = texto;
  return n;
}

function focoables() {
  return Array.from(dialogo.querySelectorAll("button, select, input, [tabindex]")).filter(n => {
    if (n.hasAttribute("disabled")) return false;
    if (n.getAttribute("tabindex") === "-1") return false;
    return n.getClientRects().length > 0;
  });
}

function anunciar(texto) {
  vivo.textContent = texto;
  vivo.hidden = true;
  vivo.getBoundingClientRect();
  vivo.hidden = false;
  window.setTimeout(() => { vivo.hidden = true; }, 2200);
}

function montarFilas() {
  ACCIONES.forEach(a => {
    const li = nodo("li", "fila");
    li.dataset.estado = "neutro";
    li.dataset.accion = a.id;

    const datos = nodo("div", "fila__datos");
    datos.appendChild(nodo("span", "fila__accion", a.accion));
    datos.appendChild(nodo("span", "fila__nota", a.nota));
    li.appendChild(datos);

    const boton = nodo("button", "tecla");
    boton.type = "button";
    boton.dataset.accion = a.id;
    boton.dataset.vacio = "1";
    boton.dataset.capturando = "0";
    boton.setAttribute("aria-label", a.accion + ": no key bound yet, press Enter to bind one");
    boton.appendChild(nodo("span", "tecla__punto"));
    const cap = nodo("span", null, "not bound");
    boton.appendChild(cap);
    boton.addEventListener("click", () => alternarCaptura(a.id, boton));
    li.appendChild(boton);

    const err = nodo("p", "fila__error");
    err.id = "filaErr" + a.id;
    li.appendChild(err);

    filas.appendChild(li);
  });
}

function alternarCaptura(id, boton) {
  if (capturando === id) {
    capturando = "";
    boton.dataset.capturando = "0";
    salirCaptura();
    anunciar("Binding cancelled");
    return;
  }
  capturando = id;
  filas.querySelectorAll(".tecla").forEach(b => { b.dataset.capturando = "0"; });
  boton.dataset.capturando = "1";
  const fila = boton.closest(".fila");
  fila.dataset.capturando = "1";
  boton.querySelector("span:last-child").textContent = "press a key";
  anunciar("Listening for a key on " + ACCIONES.find(a => a.id === id).accion);
  boton.focus();
}

function salirCaptura() {
  filas.querySelectorAll(".fila").forEach(f => { f.dataset.capturando = "0"; });
  filas.querySelectorAll(".tecla").forEach(b => {
    if (b.dataset.capturando === "1") return;
    b.querySelector("span:last-child").textContent = b.dataset.vacio === "1" ? "not bound" : b.dataset.tecla || "not bound";
  });
}

function asignar(id, tecla) {
  const boton = filas.querySelector('.tecla[data-accion="' + id + '"]');
  boton.dataset.tecla = tecla;
  boton.dataset.vacio = "0";
  boton.querySelector("span:last-child").textContent = tecla;
  capturando = "";
  boton.dataset.capturando = "0";
  salirCaptura();
  pintarFila(id);
  anunciar(ACCIONES.find(a => a.id === id).accion + " bound to " + tecla);
  boton.focus();
}

function repetida(id) {
  const propio = filas.querySelector('.tecla[data-accion="' + id + '"]').dataset.tecla;
  if (!propio) return false;
  return filas.querySelectorAll(".tecla").length > 1 &&
    Array.from(filas.querySelectorAll(".tecla")).filter(b => b.dataset.tecla === propio).length > 1;
}

function pintarFila(id) {
  const boton = filas.querySelector('.tecla[data-accion="' + id + '"]');
  const fila = boton.closest(".fila");
  const err = el("filaErr" + id);
  const vacia = !boton.dataset.tecla;
  const dup = repetida(id);

  fila.dataset.estado = dup ? "error" : (vacia ? "neutro" : "ok");
  boton.setAttribute("aria-describedby", err.id);
  if (dup) {
    err.textContent = "That key is already used by another action. Pick a different one.";
    boton.setAttribute("aria-label", ACCIONES.find(a => a.id === id).accion + ": duplicated key, press Enter to rebind");
  } else {
    err.textContent = "";
    boton.setAttribute("aria-label", ACCIONES.find(a => a.id === id).accion +
      (vacia ? ": no key bound yet, press Enter to bind one" : ": bound to " + boton.dataset.tecla + ", press Enter to rebind"));
  }
  return dup || vacia;
}

function pintarPerfil() {
  const env = el("perfil").closest(".campo");
  const ayuda = el("perfil-ayuda");
  const err = el("perfil-err");
  const v = el("perfil").value;
  const falla = v === "";
  env.dataset.estado = falla ? "error" : "ok";
  el("perfil").setAttribute("aria-invalid", falla ? "true" : "false");
  el("perfil").setAttribute("aria-describedby", falla ? ayuda.id + " " + err.id : ayuda.id);
  err.textContent = falla ? "Pick a profile, otherwise the game cannot decide which hints to draw." : "";
  return falla;
}

function problemas() {
  const salida = [];
  if (el("perfil").value === "") salida.push("Control profile: pick a profile, otherwise the game cannot decide which hints to draw.");
  ACCIONES.forEach(a => {
    const boton = filas.querySelector('.tecla[data-accion="' + a.id + '"]');
    if (!boton.dataset.tecla) salida.push(a.accion + ": nothing is bound to this action yet.");
    else if (repetida(a.id)) salida.push(a.accion + ": the key " + boton.dataset.tecla + " is already used by another action.");
  });
  return salida;
}

function nombreTecla(e) {
  const c = e.code || "";
  if (c.startsWith('Key')) return c.slice(3);
  if (c.startsWith('Digit')) return c.slice(5);
  if (c.startsWith('Numpad')) return "Num " + c.slice(6);
  if (SIMBOLOS[c]) return SIMBOLOS[c];
  return e.key.length === 1 ? e.key.toUpperCase() : e.key;
}

filas.addEventListener("keydown", e => {
  if (!capturando) return;
  e.preventDefault();
  e.stopPropagation();
  if (e.key === "Escape") {
    alternarCaptura(capturando, filas.querySelector('.tecla[data-accion="' + capturando + '"]'));
    return;
  }
  if (["ShiftLeft", "ShiftRight", "ControlLeft", "ControlRight", "AltLeft", "AltRight", "MetaLeft", "MetaRight"].includes(e.code)) return;
  if (PROHIBIDAS.includes(e.key)) {
    anunciar(e.key === "Escape" ? "Escape closes the panel instead of binding" : e.key + " cannot be bound on its own");
    return;
  }
  asignar(capturando, nombreTecla(e));
});

dialogo.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    e.preventDefault();
    cerrar(false);
    return;
  }
  if (e.key !== "Tab") return;
  const lista = focoables();
  if (lista.length === 0) return;
  const primero = lista[0];
  const ultimo = lista[lista.length - 1];
  const activo = document.activeElement;
  if (e.shiftKey && (activo === primero || !dialogo.contains(activo))) {
    e.preventDefault();
    ultimo.focus();
    return;
  }
  if (!e.shiftKey && (activo === ultimo || !dialogo.contains(activo))) {
    e.preventDefault();
    primero.focus();
  }
});

function abrir(desde) {
  if (desde) ultimoFoco = desde;
  dialogo.hidden = false;
  velo.hidden = false;
  abierto = true;
  filas.querySelectorAll(".tecla").forEach(b => { b.tabIndex = 0; });
  el("abrir").tabIndex = -1;
  ventanaBloqueada(true);
  const primero = focoables()[0];
  if (primero) primero.focus();
}

function cerrar(conGuardado) {
  if (!abierto) return;
  abierto = false;
  dialogo.hidden = true;
  velo.hidden = true;
  ventanaBloqueada(false);
  if (conGuardado) {
    mostrarAplicado();
    return;
  }
  limpiar();
  el("abrir").tabIndex = 0;
  if (ultimoFoco && document.contains(ultimoFoco)) ultimoFoco.focus();
  else el("abrir").focus();
}

function ventanaBloqueada(bloquear) {
  if (bloquear) {
    vestibulo.setAttribute("aria-hidden", "true");
    el("abrir").setAttribute("tabindex", "-1");
  } else {
    vestibulo.removeAttribute("aria-hidden");
    el("abrir").removeAttribute("tabindex");
  }
}

function limpiar() {
  filas.querySelectorAll(".tecla").forEach(b => {
    b.dataset.tecla = "";
    b.dataset.vacio = "1";
    b.dataset.capturando = "0";
    b.querySelector("span:last-child").textContent = "not bound";
  });
  filas.querySelectorAll(".fila").forEach(f => {
    f.dataset.estado = "neutro";
    delete f.dataset.capturando;
  });
  filas.querySelectorAll(".fila__error").forEach(p => { p.textContent = ""; });
  el("perfil").value = "";
  el("sesion").checked = false;
  el("sesion").closest(".campo").dataset.estado = "neutro";
  el("perfil").closest(".campo").dataset.estado = "neutro";
  el("perfil-err").textContent = "";
  el("sesion-err").textContent = "";
  el("perfil").setAttribute("aria-describedby", "perfil-ayuda");
  el("perfil").setAttribute("aria-invalid", "false");
  resumenError.hidden = true;
  capturando = "";
}

el("abrir").addEventListener("click", e => abrir(e.currentTarget));
el("cerrar").addEventListener("click", () => cerrar(false));
el("cancelar").addEventListener("click", () => cerrar(false));

el("perfil").addEventListener("change", pintarPerfil);
el("perfil").addEventListener("blur", pintarPerfil);
el("sesion").addEventListener("change", () => {
  el("sesion").closest(".campo").dataset.estado = el("sesion").checked ? "ok" : "neutro";
  el("sesion").setAttribute("aria-invalid", "false");
});

form.addEventListener("submit", e => {
  e.preventDefault();
  pintarPerfil();
  ACCIONES.forEach(a => pintarFila(a.id));
  const fallos = problemas();

  if (fallos.length > 0) {
    tituloError.textContent = fallos.length === 1
      ? "One binding is still missing"
      : fallos.length + " bindings are still missing";
    listaError.innerHTML = "";
    fallos.forEach(t => {
      const li = document.createElement("li");
      li.textContent = t;
      listaError.appendChild(li);
    });
    resumenError.hidden = false;
    const primerVacio = filas.querySelector('.tecla[data-vacio="1"]') || filas.querySelector('.fila[data-estado="error"] .tecla');
    if (el("perfil").value === "") el("perfil").focus();
    else if (primerVacio) primerVacio.focus();
    return;
  }

  resumenError.hidden = true;
  el("guardarTexto").textContent = "Saving";
  window.setTimeout(() => {
    const perfilTexto = el("perfil").options[el("perfil").selectedIndex].text;
    const lista = el("aplicadoTeclas");
    lista.innerHTML = "";
    ACCIONES.forEach(a => {
      const boton = filas.querySelector('.tecla[data-accion="' + a.id + '"]');
      const div = nodo("div");
      div.appendChild(nodo("dt", null, a.accion));
      div.appendChild(nodo("dd", null, boton.dataset.tecla));
      lista.appendChild(div);
    });
    el("aplicadoTitulo").textContent = "Your four keys are in";
    el("aplicadoLead").textContent = "Profile " + perfilTexto.toLowerCase() + ". " +
      (el("sesion").checked
        ? "They apply to the session you are in right now."
        : "They apply from the next match onwards.");
    cerrar(true);
  }, 620);
});

function mostrarAplicado() {
  dialogo.hidden = true;
  velo.hidden = true;
  ventanaBloqueada(true);
  aplicado.hidden = false;
  aplicado.focus();
}

el("otra").addEventListener("click", () => {
  aplicado.hidden = true;
  limpiar();
  dialogo.hidden = false;
  velo.hidden = false;
  abierto = true;
  ventanaBloqueada(true);
  const primero = focoables()[0];
  if (primero) primero.focus();
});

montarFilas();
el("abrir").setAttribute("tabindex", "-1");
ventanaBloqueada(true);
salirCaptura();
const inicial = focoables()[0];
if (inicial) inicial.focus();
