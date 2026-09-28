const form = document.getElementById("form");
const modal = document.getElementById("modal");
const velo = document.getElementById("velo");
const abrir = document.getElementById("abrirModal");
const cerrar = document.getElementById("cerrarModal");
const cancelar = document.getElementById("cancelar");
const enviado = document.getElementById("enviado");
const cerrarEnviado = document.getElementById("cerrarEnviado");
const resumenError = document.getElementById("resumenError");
const listaError = document.getElementById("resumenErrorLista");
const tituloError = document.getElementById("resumenErrorTitulo");

let disparador = null;

const CAMPOS = [
  {
    id: "nombre",
    etiqueta: "Cómo te llamas",
    vacio: "Necesitamos un nombre para saludarte al abrir el caso.",
    error: "Entre 2 y 40 caracteres, con al menos dos letras.",
    prueba: v => v.length >= 2 && v.length <= 40 && /[a-zA-ZÀ-ÿ]{2}/.test(v)
  },
  {
    id: "correo",
    etiqueta: "Correo de respuesta",
    vacio: "Falta el correo al que mandamos la respuesta.",
    error: "Revisa el formato, debería parecerse a nombre@dominio.com.",
    prueba: v => /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(v)
  },
  {
    id: "tema",
    etiqueta: "Motivo de la consulta",
    vacio: "Elige el motivo para llegar al equipo adecuado.",
    error: "Ese motivo no está en la lista de la ayuda.",
    prueba: v => ["pedido", "devolucion", "factura", "producto", "cuenta", "otro"].includes(v)
  },
  {
    id: "referencia", suave: true,
    etiqueta: "Número de pedido",
    vacio: "",
    error: "",
    prueba: v => v === "" || (/^PX-\d{7}$/.test(v))
  },
  {
    id: "mensaje",
    etiqueta: "Mensaje",
    vacio: "Escribe el mensaje: sin él no podemos ayudarte.",
    error: "Entre 20 y 1.200 caracteres. Cuéntanos qué pasó y qué esperabas.",
    prueba: v => v.length >= 20 && v.length <= 1200
  },
  {
    id: "aviso", tipo: "check",
    etiqueta: "Protección de datos",
    vacio: "Hay que aceptar el tratamiento de datos para gestionar la consulta.",
    error: "Sin ese acuerdo no podemos abrir el caso.",
    prueba: v => v === "si"
  }
];

function el(id) { return document.getElementById(id); }

function valor(f) {
  if (f.id === "aviso") return el("aviso").checked ? "si" : "";
  return el(f.id).value.trim();
}

function pintar(f) {
  const env = el(f.id).closest(".campo");
  const ayuda = el(f.id + "-ayuda");
  const error = el(f.id + "-error");
  const v = valor(f);
  const vacio = v === "";
  const malo = !vacio && !f.prueba(v);
  const fallo = f.suave ? malo : (vacio || malo);
  const desc = [ayuda.id];

  el(f.id).setAttribute("aria-invalid", fallo ? "true" : "false");

  if (fallo) {
    env.dataset.estado = "error";
    desc.push(error.id);
    error.textContent = vacio ? f.vacio : f.error;
  } else {
    env.dataset.estado = vacio ? "neutro" : "ok";
    error.textContent = "";
  }

  el(f.id).setAttribute("aria-describedby", desc.join(" "));
  return fallo;
}

function problemaDe(f) {
  const v = valor(f);
  if (f.suave) return v !== "" && !f.prueba(v);
  return v === "" || !f.prueba(v);
}

CAMPOS.forEach(f => {
  if (f.tipo === "check") {
    el("aviso").addEventListener("change", () => pintar(f));
    return;
  }
  const nodo = el(f.id);
  nodo.addEventListener("blur", () => pintar(f));
  nodo.addEventListener("input", () => {
    if (nodo.closest(".campo").dataset.estado === "error") pintar(f);
  });
  nodo.addEventListener("change", () => pintar(f));
});

el("referencia").addEventListener("input", function () {
  let v = this.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 9);
  if (v.length > 3) v = v.slice(0, 3) + "-" + v.slice(3);
  this.value = v;
});

function focusables() {
  return Array.from(modal.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )).filter(n => n.offsetParent !== null || n === document.activeElement);
}

function atraparFoco(e) {
  if (e.key !== "Tab") return;
  const nodos = focusables();
  if (nodos.length === 0) return;
  const primero = nodos[0];
  const ultimo = nodos[nodos.length - 1];
  if (e.shiftKey && document.activeElement === primero) {
    e.preventDefault();
    ultimo.focus();
  } else if (!e.shiftKey && document.activeElement === ultimo) {
    e.preventDefault();
    primero.focus();
  }
}

function abrirModal(disparadorEl) {
  disparador = disparadorEl || disparador;
  velo.hidden = false;
  modal.hidden = false;
  document.body.classList.add("modal-abierto");
  modal.addEventListener("keydown", atraparFoco);
  el("cerrarModal").focus();
}

function cerrarModal() {
  modal.removeEventListener("keydown", atraparFoco);
  modal.hidden = true;
  velo.hidden = true;
  document.body.classList.remove("modal-abierto");
  if (disparador) disparador.focus();
}

abrir.addEventListener("click", () => {
  reiniciar();
  abrirModal(abrir);
});
cerrar.addEventListener("click", cerrarModal);
cancelar.addEventListener("click", cerrarModal);
velo.addEventListener("click", cerrarModal);
cerrarEnviado.addEventListener("click", () => {
  cerrarModal();
  setTimeout(reiniciar, 60);
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape" && !modal.hidden) {
    e.preventDefault();
    cerrarModal();
  }
});

form.addEventListener("submit", e => {
  e.preventDefault();
  let primero = null;
  CAMPOS.forEach(f => {
    const fallo = pintar(f);
    if (fallo && !primero) primero = el(f.id);
  });

  const fallos = CAMPOS.filter(problemaDe);
  if (fallos.length > 0) {
    tituloError.textContent = fallos.length === 1
      ? "Falta un dato para enviar la consulta"
      : "Faltan " + fallos.length + " datos para enviar la consulta";
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

const PLAZOS = {
  pedido: "3 h 40 min",
  devolucion: "2 h 15 min",
  factura: "1 h 05 min",
  producto: "4 h 20 min",
  cuenta: "1 h 30 min",
  otro: "6 h 00 min"
};

function completar() {
  const ref = "CA-" + String(Math.floor(100000 + Math.random() * 900000));
  const motivo = el("tema").value;

  el("enviadoRef").textContent = ref;
  el("enviadoTema").textContent = el("tema").options[el("tema").selectedIndex].text;
  el("enviadoPlazo").textContent = PLAZOS[motivo];
  el("enviadoTitulo").textContent = "Gracias, " + el("nombre").value.trim().split(" ")[0] + ", ya la tienes en la cola";
  el("enviadoTexto").textContent = "Caso " + ref + " asignado al equipo de " +
    el("tema").options[el("tema").selectedIndex].text.toLowerCase() +
    ". La respuesta va a " + el("correo").value.trim() +
    (el("referencia").value.trim() ? " con el pedido " + el("referencia").value.trim() + " ya asociado." : ".");

  form.hidden = true;
  modal.querySelector(".modal-cabecera").hidden = true;
  enviado.hidden = false;
  enviado.focus();
}

function reiniciar() {
  form.reset();
  CAMPOS.forEach(f => {
    el(f.id).closest(".campo").dataset.estado = "neutro";
    el(f.id + "-error").textContent = "";
    el(f.id).setAttribute("aria-invalid", "false");
    el(f.id).setAttribute("aria-describedby", f.id + "-ayuda");
  });
  resumenError.hidden = true;
  form.hidden = false;
  modal.querySelector(".modal-cabecera").hidden = false;
  enviado.hidden = true;
}

setTimeout(() => {
  if (modal.hidden) {
    reiniciar();
    abrirModal(abrir);
  }
}, 700);

