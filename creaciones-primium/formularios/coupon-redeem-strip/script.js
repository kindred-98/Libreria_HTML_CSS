const form = document.getElementById("form");
const codigo = document.getElementById("codigo");
const importe = document.getElementById("importe");
const fecha = document.getElementById("fecha");
const resumenError = document.getElementById("resumenError");
const listaError = document.getElementById("resumenErrorLista");
const tituloError = document.getElementById("resumenErrorTitulo");
const aplicado = document.getElementById("aplicado");
const quitar = document.getElementById("quitar");
const requisitos = Array.from(document.querySelectorAll(".requisitos-lista li"));

const CUPONES = {
  VERANO: { dto: 0.2, minimo: 30, caduca: "2026-11-30", nombre: "Verano de papeleria" },
  BIENVEN: { dto: 0.15, minimo: 45, caduca: "2026-12-31", nombre: "Bienvenida a la tienda" },
  MADRUG: { dto: 0.3, minimo: 80, caduca: "2026-10-31", nombre: "Madrugones de septiembre" },
  LIBROS: { dto: 0.1, minimo: 15, caduca: "2027-01-15", nombre: "Temporada de libros de texto" }
};

const HOY = hoyISO();
const LIMITE = sumaDias(HOY, 90);

function hoyISO() {
  const d = new Date();
  return d.getFullYear() + "-" + dos(d.getMonth() + 1) + "-" + dos(d.getDate());
}

function dos(n) { return String(n).padStart(2, "0"); }

function sumaDias(iso, dias) {
  const p = iso.split("-");
  const d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  d.setDate(d.getDate() + dias);
  return d.getFullYear() + "-" + dos(d.getMonth() + 1) + "-" + dos(d.getDate());
}

function cupónActivo() {
  const partes = codigo.value.split("-");
  if (partes.length !== 2) return null;
  const base = CUPONES[partes[0]];
  if (!base) return null;
  if (Number(partes[1]) !== Math.round(base.dto * 100)) return null;
  return base;
}

const CAMPOS = [
  {
    id: "codigo",
    etiqueta: "Código de descuento",
    vacio: "Escribe un código para probar el descuento.",
    error: "Ese código no existe. Prueba con VERANO-20, BIENVEN-15, MADRUG-30 o LIBROS-10.",
    prueba: v => /^[A-Z]{6}-\d{2}$/.test(v) && cupónActivo() !== null
  },
  {
    id: "importe",
    etiqueta: "Importe del pedido",
    vacio: "Pon el importe que aparece en el ticket.",
    error: "El importe tiene que ser un número entre 1 y 5000 con dos decimales.",
    prueba: v => /^\d{1,4}(\.\d{1,2})?$/.test(v) && Number(v) >= 1 && Number(v) <= 5000
  },
  {
    id: "fecha",
    etiqueta: "Fecha del pedido",
    vacio: "Elige la fecha en la que vas a pagar.",
    error: "La fecha va de hoy a dentro de 90 días y, si usas cupón, antes de su caducidad.",
    prueba: v => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
      if (v < HOY || v > LIMITE) return false;
      const c = cupónActivo();
      return c ? v <= c.caduca : true;
    }
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

function pintaResumen() {
  const fallos = CAMPOS.filter(f => {
    const v = el(f.id).value.trim();
    return v === "" || !f.prueba(v);
  });

  if (fallos.length === 0) {
    resumenError.hidden = true;
    return;
  }

  tituloError.textContent = fallos.length === 1
    ? "Todavía falta un dato"
    : "Faltan " + fallos.length + " datos para aplicar el cupón";

  listaError.innerHTML = "";
  fallos.forEach(f => {
    const li = document.createElement("li");
    const v = el(f.id).value.trim();
    li.textContent = f.etiqueta + ": " + (v === "" ? f.vacio : f.error);
    listaError.appendChild(li);
  });
  resumenError.hidden = false;
}

function refrescarVivo() {
  const cupon = cupónActivo();
  const bruto = Number(importe.value);
  const validoImporte = CAMPOS[1].prueba(importe.value.trim());
  const fechaValida = CAMPOS[2].prueba(fecha.value.trim());

  const formato = /^[A-Z]{6}-\d{2}$/.test(codigo.value);
  const existe = cupon !== null;
  const cumpleImporte = existe && validoImporte && bruto >= cupon.minimo;
  const cumpleCaduca = existe && fechaValida;

  const mapa = { formato, existe, importe: cumpleImporte, caduca: cumpleCaduca };
  requisitos.forEach(li => {
    li.dataset.cumplido = mapa[li.dataset.clave] ? "1" : "0";
  });

  const ahorro = existe && validoImporte ? bruto * cupon.dto : 0;
  const total = validoImporte ? bruto - ahorro : bruto;

  el("bruto").textContent = validoImporte ? dinero(bruto) : "38,00 €";
  el("totalVivo").textContent = validoImporte ? dinero(total) : "0,00 €";
  el("ahorro").hidden = ahorro <= 0;
  el("ahorro").textContent = "ahorras " + dinero(ahorro);
}

CAMPOS.forEach(f => {
  const nodo = el(f.id);
  nodo.addEventListener("blur", () => { pintar(f); refrescarVivo(); });
  nodo.addEventListener("input", () => {
    if (nodo.closest(".campo").dataset.estado === "error") pintar(f);
    refrescarVivo();
  });
});

codigo.addEventListener("input", () => {
  const limpio = codigo.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
  codigo.value = limpio.length > 6 ? limpio.slice(0, 6) + "-" + limpio.slice(6) : limpio;
});

form.addEventListener("submit", e => {
  e.preventDefault();
  const primero = validarTodo();
  refrescarVivo();
  pintaResumen();
  if (primero) {
    primero.focus();
    return;
  }
  completar();
});

function completar() {
  const cupon = cupónActivo();
  const bruto = Number(importe.value);
  const ahorro = bruto * cupon.dto;
  const total = bruto - ahorro;

  el("aplicadoTitulo").textContent = "Descuento del " + Math.round(cupon.dto * 100) + " por ciento aplicado";
  el("aplicadoDetalle").textContent = "Campaña " + cupon.nombre.toLowerCase() + ": te rebajamos " +
    dinero(ahorro) + " y el pedido pasa a " + dinero(total) + ". El descuento se divide entre los artículos del ticket.";
  el("aplicadoBruto").textContent = dinero(bruto);
  el("aplicadoCodigo").textContent = codigo.value.trim();
  el("aplicadoAhorro").textContent = dinero(ahorro);
  el("aplicadoTotal").textContent = dinero(total);

  form.hidden = true;
  aplicado.hidden = false;
  aplicado.focus();
}

quitar.addEventListener("click", () => {
  aplicado.hidden = true;
  form.hidden = false;
  codigo.value = "";
  importe.value = "38";
  fecha.value = HOY;
  CAMPOS.forEach(f => {
    el(f.id).closest(".campo").dataset.estado = "neutro";
    el(f.id).setAttribute("aria-invalid", "false");
    el(f.id + "-error").textContent = "";
    el(f.id).setAttribute("aria-describedby", f.id + "-ayuda");
  });
  resumenError.hidden = true;
  refrescarVivo();
  codigo.focus();
});

fecha.value = HOY;
codigo.classList.add("codigo-campo");
refrescarVivo();
