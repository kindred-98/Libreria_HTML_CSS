const form = document.getElementById("form");
const disparador = document.getElementById("disparador");
const cajon = document.getElementById("cajon");
const cantidad = document.getElementById("cantidad");
const talon = document.getElementById("talon");
const correo = document.getElementById("correo");
const expres = document.getElementById("expres");
const menos = document.getElementById("menos");
const mas = document.getElementById("mas");
const resumenError = document.getElementById("resumenError");
const listaError = document.getElementById("resumenErrorLista");
const tituloError = document.getElementById("resumenErrorTitulo");
const listo = document.getElementById("listo");
const otra = document.getElementById("otra");

const PRECIO = 12.4;
const PORTES = 4.9;
const EXPRES = 4.9;
const MAX_STOCK = 18;

const CAMPOS = [
  {
    id: "cantidad",
    etiqueta: "Unidades",
    vacio: "Dinos cuántas botellas quieres.",
    error: "Solo hay 18 botellas en stock, pide una cantidad entre 1 y 18.",
    prueba: v => {
      const n = Number(v);
      return Number.isInteger(n) && n >= 1 && n <= MAX_STOCK;
    }
  },
  {
    id: "talon",
    etiqueta: "Talon de envío",
    vacio: "El talon de envío es obligatorio para cerrar la compra.",
    error: "Formato incorrecto. Son tres letras, un guion y seis caracteres: TRM-4K92XZ.",
    prueba: v => /^[A-Z]{3}-[A-Z0-9]{6}$/.test(v)
  },
  {
    id: "correo",
    etiqueta: "Correo para la factura",
    vacio: "Necesitamos un correo para mandarte la factura.",
    error: "Revisa el formato, debería parecerse a nombre@dominio.com.",
    prueba: v => /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(v)
  }
];

function el(id) { return document.getElementById(id); }

function dinero(n) {
  return n.toFixed(2).replace(".", ",") + " €";
}

function pintar(f) {
  const env = el(f.id).closest(".campo");
  const ayuda = el(f.id + "-ayuda");
  const error = el(f.id + "-error");
  const valor = el(f.id).value.trim();
  const vacio = valor === "";
  const malo = !vacio && !f.prueba(valor);
  const desc = [ayuda.id];

  if (vacio || malo) {
    env.dataset.estado = "error";
    el(f.id).setAttribute("aria-invalid", "true");
    desc.push(error.id);
    error.textContent = vacio ? f.vacio : f.error;
  } else {
    env.dataset.estado = "ok";
    el(f.id).setAttribute("aria-invalid", "false");
    error.textContent = "";
  }

  el(f.id).setAttribute("aria-describedby", desc.join(" "));
  return vacio || malo;
}

function validarTodo() {
  let primero = null;
  CAMPOS.forEach(f => {
    const fallo = pintar(f);
    if (fallo && !primero) primero = el(f.id);
  });
  return primero;
}

function recalcular() {
  const n = Math.max(0, Math.min(MAX_STOCK, Number(cantidad.value) || 0));
  const subtotal = n * PRECIO;
  const portes = n === 0 ? 0 : (expres.checked ? EXPRES : PORTES);
  const total = subtotal + portes;

  el("pesoTotal").textContent = (n * 0.5).toFixed(1).replace(".", ",") + " l";
  el("lineaArticulos").textContent = n + " × " + dinero(PRECIO);
  el("lineaPortes").textContent = n === 0 ? "sin portes" : dinero(portes);
  el("lineaTotal").textContent = dinero(total);
  el("comprarTotal").textContent = dinero(total);
}

function pintarResumen() {
  const fallos = CAMPOS.filter(f => {
    const v = el(f.id).value.trim();
    return v === "" || !f.prueba(v);
  });

  if (fallos.length === 0) {
    resumenError.hidden = true;
    return;
  }

  tituloError.textContent = fallos.length === 1
    ? "Falta corregir un dato del pedido"
    : "Faltan " + fallos.length + " datos por corregir";

  listaError.innerHTML = "";
  fallos.forEach(f => {
    const li = document.createElement("li");
    const v = el(f.id).value.trim();
    li.textContent = f.etiqueta + ": " + (v === "" ? f.vacio : f.error);
    listaError.appendChild(li);
  });
  resumenError.hidden = false;
}

function alternarCajon(abrir) {
  if (abrir) {
    cajon.hidden = false;
    requestAnimationFrame(() => cajon.classList.add("abierta"));
  } else {
    cajon.classList.remove("abierta");
    setTimeout(() => {
      if (!cajon.classList.contains("abierta")) cajon.hidden = true;
    }, 420);
  }
  disparador.setAttribute("aria-expanded", abrir ? "true" : "false");
}

disparador.addEventListener("click", () => {
  const abierto = disparador.getAttribute("aria-expanded") === "true";
  alternarCajon(!abierto);
  if (!abierto) {
    recalcular();
    setTimeout(() => cantidad.focus(), 240);
  }
});

document.addEventListener("keydown", e => {
  if (e.key !== "Escape") return;
  if (listo.hidden && disparador.getAttribute("aria-expanded") === "true") {
    alternarCajon(false);
    disparador.focus();
  }
});

menos.addEventListener("click", () => {
  const n = Math.max(1, (Number(cantidad.value) || 1) - 1);
  cantidad.value = String(n);
  pintarCampo("cantidad");
  recalcular();
  cantidad.focus();
});

mas.addEventListener("click", () => {
  const n = Math.min(MAX_STOCK, (Number(cantidad.value) || 1) + 1);
  cantidad.value = String(n);
  pintarCampo("cantidad");
  recalcular();
  cantidad.focus();
});

function pintarCampo(id) {
  const f = CAMPOS.find(x => x.id === id);
  if (f) pintar(f);
}

CAMPOS.forEach(f => {
  const nodo = el(f.id);
  nodo.addEventListener("blur", () => { pintar(f); if (f.id === "cantidad") recalcular(); });
  nodo.addEventListener("input", () => {
    if (nodo.closest(".campo").dataset.estado === "error") pintar(f);
    if (f.id === "cantidad") recalcular();
  });
});

talon.addEventListener("input", () => {
  const limpio = talon.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 9);
  let salida = limpio.slice(0, 3);
  if (limpio.length > 3) salida += "-" + limpio.slice(3);
  talon.value = salida;
  if (talon.closest(".campo").dataset.estado !== "neutro") pintarCampo("talon");
});

expres.addEventListener("change", recalcular);

form.addEventListener("submit", e => {
  e.preventDefault();
  const primero = validarTodo();
  pintarResumen();
  if (primero) {
    primero.focus();
    return;
  }
  completar();
});

function completar() {
  const ref = "OD-" + String(Math.floor(100000 + Math.random() * 900000));
  const n = Math.max(1, Math.min(MAX_STOCK, Number(cantidad.value) || 1));
  const total = n * PRECIO + (expres.checked ? EXPRES : PORTES);

  el("listoRef").textContent = ref;
  el("listoBotellas").textContent = n + (n === 1 ? " botella de 500 ml" : " botellas de 500 ml");
  el("listoEntrega").textContent = expres.checked
    ? "Exprés, mañana antes de las 14:00"
    : "Estándar, de 3 a 4 días laborables";
  el("listoTotal").textContent = dinero(total);
  el("listoTitulo").textContent = "Gracias, ya es tuyo";
  el("listoTexto").textContent = "Hemos mandado la factura a " + correo.value.trim() +
    " y el talon " + talon.value.trim() + " queda asociado a la referencia " + ref + ".";

  form.hidden = true;
  disparador.hidden = true;
  listo.hidden = false;
  listo.focus();
  recalcular();
}

otra.addEventListener("click", () => {
  listo.hidden = true;
  form.hidden = false;
  disparador.hidden = false;
  alternarCajon(true);
  resumenError.hidden = true;
  CAMPOS.forEach(f => {
    el(f.id).closest(".campo").dataset.estado = "neutro";
    el(f.id).setAttribute("aria-invalid", "false");
    el(f.id + "-error").textContent = "";
    el(f.id).setAttribute("aria-describedby", f.id + "-ayuda");
  });
  cantidad.value = "2";
  talon.value = "";
  correo.value = "";
  expres.checked = false;
  recalcular();
  cantidad.focus();
});

cantidad.addEventListener("focus", () => {
  if (cantidad.value === "") cantidad.value = "1";
});

recalcular();
