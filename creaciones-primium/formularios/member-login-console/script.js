const form = document.getElementById("form");
const historial = document.getElementById("historial");
const reloj = document.getElementById("reloj");
const eco = document.getElementById("eco");
const sugerencias = document.getElementById("sugerencias");
const entradaUsuario = document.getElementById("usuario");
const resumenError = document.getElementById("resumenError");
const listaError = document.getElementById("resumenErrorLista");
const tituloError = document.getElementById("resumenErrorTitulo");
const sello = document.getElementById("sello");
const terminal = document.querySelector(".terminal");

const CUENTAS = [
  { correo: "ana.morales@correo.com", uso: "hace 2 días" },
  { correo: "ana.morales@nexo.es", uso: "hace 5 meses" },
  { correo: "david.iglesias@correo.com", uso: "ayer" },
  { correo: "soporte.nexo@correo.com", uso: "hace 3 semanas" }
];

const CAMPOS = [
  {
    id: "usuario",
    etiqueta: "Correo de la cuenta",
    vacio: "Falta el correo con el que entraste la última vez.",
    error: "No parece un correo válido. Revisa que tenga arroba y dominio.",
    prueba: v => /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(v) || /^alias:[a-z0-9._-]{4,}$/i.test(v)
  },
  {
    id: "clave",
    etiqueta: "Contraseña",
    vacio: "La contraseña no puede ir vacía.",
    error: "Debe tener entre 10 y 64 caracteres, con mayúscula, minúscula y dígito.",
    prueba: v => v.length >= 10 && v.length <= 64 && /[A-Z]/.test(v) && /[a-z]/.test(v) && /\d/.test(v)
  },
  {
    id: "recordar",
    etiqueta: "Mantener la sesión",
    vacio: "Indica si quieres conservar la sesión en este equipo.",
    error: "Ese valor no es válido.",
    prueba: v => v === "si" || v === "no"
  }
];

function el(id) { return document.getElementById(id); }

function valorCampo(f) {
  if (f.id === "recordar") return el("recordar").checked ? "si" : "no";
  return el(f.id).value.trim();
}

function pintar(f) {
  const env = el(f.id).closest(".campo");
  const ayuda = el(f.id + "-ayuda");
  const error = el(f.id + "-error");
  const control = el(f.id);
  const valor = valorCampo(f);
  const malo = !f.prueba(valor);

  if (f.id === "recordar") {
    env.dataset.estado = "neutro";
    control.removeAttribute("aria-invalid");
    control.setAttribute("aria-describedby", ayuda.id);
    return false;
  }

  const desc = [ayuda.id];
  if (malo) {
    env.dataset.estado = "error";
    control.setAttribute("aria-invalid", "true");
    desc.push(error.id);
    error.textContent = valor === "" ? f.vacio : f.error;
  } else {
    env.dataset.estado = "ok";
    control.removeAttribute("aria-invalid");
  }
  control.setAttribute("aria-describedby", desc.join(" "));
  return malo;
}

function problemas() {
  return CAMPOS.filter(f => !f.prueba(valorCampo(f)));
}

function pintarTodo() {
  let primero = null;
  CAMPOS.forEach(f => {
    const fallo = pintar(f);
    if (fallo && !primero) primero = el(f.id);
  });
  return primero;
}

function marcar(marca, texto, clase) {
  const p = document.createElement("p");
  p.className = "fila " + clase;
  const m = document.createElement("span");
  m.className = "fila-marca";
  m.textContent = marca;
  const t = document.createElement("span");
  t.textContent = texto;
  p.appendChild(m);
  p.appendChild(t);
  historial.appendChild(p);
  historial.scrollTop = historial.scrollHeight;
  return p;
}

function relojCorrido() {
  const base = 9 * 3600 + 14 * 60 + 2;
  const total = base + Math.floor(Date.now() / 1000) % 3600;
  const h = Math.floor(total / 3600) % 24;
  const m = Math.floor(total / 60) % 60;
  const s = total % 60;
  const dos = n => String(n).padStart(2, "0");
  reloj.textContent = "sesión " + dos(h) + ":" + dos(m) + ":" + dos(s);
}

function pintarSugerencias() {
  const texto = entradaUsuario.value.trim().toLowerCase();
  const filtradas = CUENTAS.filter(c => texto === "" || c.correo.toLowerCase().includes(texto) || c.correo.toLowerCase().startsWith(texto));
  sugerencias.innerHTML = "";
  entradaUsuario.setAttribute("aria-expanded", "false");
  if (document.activeElement !== entradaUsuario) {
    sugerencias.hidden = true;
    return;
  }
  if (filtradas.length === 0) {
    sugerencias.hidden = true;
    return;
  }
  filtradas.forEach(c => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "sugerencia";
    b.setAttribute("role", "option");
    const marca = document.createElement("span");
    marca.className = "sugerencia-marca";
    marca.textContent = ">";
    const correo = document.createElement("span");
    correo.textContent = c.correo;
    const uso = document.createElement("small");
    uso.textContent = c.uso;
    b.appendChild(marca);
    b.appendChild(correo);
    b.appendChild(uso);
    b.addEventListener("click", () => {
      entradaUsuario.value = c.correo;
      sugerencias.hidden = true;
      entradaUsuario.setAttribute("aria-expanded", "false");
      entradaUsuario.focus();
      pintar(CAMPOS.find(f => f.id === "usuario"));
    });
    sugerencias.appendChild(b);
  });
  sugerencias.hidden = false;
  entradaUsuario.setAttribute("aria-expanded", "true");
}

CAMPOS.forEach(f => {
  const control = el(f.id);
  control.addEventListener("blur", () => pintar(f));
  control.addEventListener("input", () => {
    if (f.id === "clave") eco.textContent = control.value.replace(/[^\-]/g, "*");
    const env = control.closest(".campo");
    if (env.dataset.estado === "error") pintar(f);
  });
});

entradaUsuario.addEventListener("focus", pintarSugerencias);
entradaUsuario.addEventListener("input", pintarSugerencias);
entradaUsuario.addEventListener("blur", () => {
  window.setTimeout(() => {
    sugerencias.hidden = true;
    entradaUsuario.setAttribute("aria-expanded", "false");
  }, 120);
});
entradaUsuario.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    entradaUsuario.value = "";
    eco.textContent = "";
    sugerencias.hidden = true;
    entradaUsuario.setAttribute("aria-expanded", "false");
    marcar("..", "Entrada limpia con la tecla Escape.", "fila-info");
  }
  if (e.key === "Enter") {
    e.preventDefault();
    form.requestSubmit();
  }
});

el("clave").addEventListener("input", () => {
  eco.textContent = el("clave").value.replace(/[^\-]/g, "*");
});

const verClave = el("verClave");
verClave.addEventListener("click", () => {
  const visible = verClave.getAttribute("aria-pressed") === "true";
  verClave.setAttribute("aria-pressed", visible ? "false" : "true");
  verClave.setAttribute("aria-label", visible ? "Mostrar la contraseña" : "Ocultar la contraseña");
  verClave.textContent = visible ? "ver" : "ocultar";
  el("clave").type = visible ? "password" : "text";
  el("clave").focus();
});

form.addEventListener("submit", e => {
  e.preventDefault();
  const usuario = el("usuario").value.trim();
  const primero = pintarTodo();
  const fallos = problemas();
  marcar(">>", "ejecutando: nebula acceso --sesion", "fila-info");

  if (fallos.length > 0) {
    tituloError.textContent = fallos.length === 1
      ? "Acceso denegado: un campo pendiente"
      : "Acceso denegado: " + fallos.length + " campos pendientes";
    listaError.innerHTML = "";
    fallos.forEach(f => {
      const li = document.createElement("li");
      const v = valorCampo(f);
      li.textContent = f.etiqueta + ": " + (v === "" ? f.vacio : f.error);
      listaError.appendChild(li);
    });
    resumenError.hidden = false;
    marcar("xx", "verificación fallida. Revisa las líneas marcadas en rojo.", "fila-error");
    if (primero) primero.focus();
    return;
  }

  resumenError.hidden = true;
  const alias = usuario.startsWith("alias:") ? usuario.slice(6) : usuario.split("@")[0];
  marcar("in", "usuario " + alias + " reconocido. Comprobando credencial...", "fila-acceso");
  const clave = el("clave").value;
  marcar("ok", "credencial aceptada. Abriendo túnel de sesión.", "fila-ok");
  eco.textContent = "";
  el("clave").value = "";
  pintar(CAMPOS.find(f => f.id === "clave"));

  const ahora = new Date();
  const hasta = new Date(ahora.getTime() + 30 * 60000);
  const dos = n => String(n).padStart(2, "0");
  el("selloCuenta").textContent = usuario;
  el("selloClave").textContent = clave.length + " caracteres, verificados";
  el("selloToken").textContent = "NX-" + clave.slice(0, 2).toUpperCase() + "-" +
    String(Math.floor(1000 + Math.random() * 9000));
  el("selloHasta").textContent = dos(hasta.getHours()) + ":" + dos(hasta.getMinutes());
  el("selloTexto").textContent = el("recordar").checked
    ? "Sesión abierta durante 30 minutos y testigo guardado en este equipo."
    : "Sesión abierta durante 30 minutos. Se cerrará sola al terminar.";
  form.hidden = true;
  sello.hidden = false;
  sello.focus();
});

el("cerrarSesion").addEventListener("click", () => {
  sello.hidden = true;
  form.hidden = false;
  form.reset();
  eco.textContent = "";
  CAMPOS.forEach(f => {
    const env = el(f.id).closest(".campo");
    env.dataset.estado = "neutro";
    el(f.id).removeAttribute("aria-invalid");
    el(f.id).setAttribute("aria-describedby", f.id + "-ayuda");
    el(f.id + "-error").textContent = "";
  });
  marcar("..", "sesión cerrada por el usuario. witnessing token revocado.", "fila-info");
  el("usuario").focus();
});

terminal.addEventListener("keydown", e => {
  if (e.key === "Escape" && document.activeElement.tagName === "INPUT") {
    document.activeElement.value = "";
    eco.textContent = "";
    el("usuario").setAttribute("aria-expanded", "false");
    suggestionsOcultas();
  }
});

function suggestionsOcultas() {
  sugerencias.hidden = true;
  entradaUsuario.setAttribute("aria-expanded", "false");
}

relojCorrido();
window.setInterval(relojCorrido, 1000);
eco.textContent = "";
