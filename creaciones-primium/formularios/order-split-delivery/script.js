const form = document.getElementById("form");
const total = document.getElementById("total");
const grupo = document.getElementById("grupo");
const resumenError = document.getElementById("resumenError");
const listaError = document.getElementById("resumenErrorLista");
const tituloError = document.getElementById("resumenErrorTitulo");
const cerrado = document.getElementById("cerrado");

const PLATOS = [
  { ref: "1", nombre: "Patatas bravas", tono: "#c9761f" },
  { ref: "2", nombre: "Croquetas de jamón", tono: "#d95c25" },
  { ref: "3", nombre: "Pulpo a la gallega", tono: "#9a7c62" },
  { ref: "4", nombre: "Tarta de queso", tono: "#c8a45c" },
  { ref: "5", nombre: "Tinto de la casa", tono: "#8a3a4c" }
];

const CAMPOS = [
  {
    id: "total",
    etiqueta: "Total de la mesa",
    vacio: "Escribe el total de la mesa para poder repartirlo.",
    error: "Usa un importe entre 5,00 € y 500,00 € con coma para los decimales.",
    prueba: v => coincideDinero(v) && Number(v.replaceAll(',', ".")) >= 5 && Number(v.replaceAll(',', ".")) <= 500
  },
  {
    id: "grupo",
    etiqueta: "Nombre del grupo",
    vacio: "Ponle un nombre a la hoja, por ejemplo Los de la mesa 7.",
    error: "Entre 3 y 40 caracteres, con al menos una letra.",
    prueba: v => v.length >= 3 && v.length <= 40 && /[a-zA-ZÀ-ÿ]/.test(v)
  }
];

PLATOS.forEach(p => {
  CAMPOS.push({
    id: "p" + p.ref,
    etiqueta: p.nombre,
    vacio: "Escribe 0,00 si nadie pidió este plato.",
    error: "Importe máximo 500,00 € con dos decimales, por ejemplo 12,50.",
    prueba: v => coincideDinero(v) && Number(v.replaceAll(',', ".")) <= 500
  });
});

function coincideDinero(v) {
  return /^\d{1,3}(,\d{1,2})?$/.test(v);
}

function aNumero(v) {
  return Number(v.replaceAll(',', ".")) || 0;
}

function dinero(n) {
  return n.toFixed(2).replace(".", ",") + " €";
}

function el(id) { return document.getElementById(id); }

function contenedor(f) {
  return f.id.charAt(0) === "p" && /^p\d$/.test(f.id)
    ? document.querySelector('.plato[data-ref="' + f.id.slice(1) + '"] .plato-campo')
    : el(f.id).closest(".campo");
}

function pintar(f) {
  const env = contenedor(f);
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

function pintarTodo() {
  let primero = null;
  CAMPOS.forEach(f => {
    const fallo = pintar(f);
    if (fallo && !primero) primero = el(f.id);
  });
  return primero;
}

function repartir() {
  const suma = PLATOS.reduce((s, p) => s + aNumero(el("p" + p.ref).value), 0);
  const bruto = aNumero(total.value);
  return { suma, bruto, sobra: Math.round((bruto - suma) * 100) / 100 };
}

function pintarMedidor() {
  const r = repartir();
  const base = Math.max(r.bruto, r.suma, 0.01);

  PLATOS.forEach(p => {
    const v = aNumero(el("p" + p.ref).value);
    const proporcion = Math.min(1, v / base);
    el("r" + p.ref).style.transform = "scaleX(" + proporcion.toFixed(4) + ")";
    el("c" + p.ref).textContent = dinero(v);
  });

  const sobra = Math.max(0, r.sobra);
  el("r0").style.transform = "scaleX(" + Math.min(1, sobra / base).toFixed(4) + ")";
  el("c0").textContent = dinero(sobra);

  el("mTotal").textContent = dinero(r.bruto);
  el("mRepartido").textContent = dinero(r.suma);
  el("mSobra").textContent = dinero(sobra);
  el("mFinal").textContent = dinero(r.suma);
  document.querySelector(".cuentas").dataset.ok = sobra === 0 && r.bruto > 0 ? "1" : "0";

  const nota = document.getElementById("medidorPie");
  if (r.bruto === 0) {
    nota.textContent = "Escribe el total de la mesa para ver el reparto.";
  } else if (r.sobra > 0.004) {
    nota.textContent = "Quedan " + dinero(sobra) + " sin repartir entre los platos.";
  } else if (r.sobra < -0.004) {
    nota.textContent = "Te has pasado por " + dinero(Math.abs(r.sobra)) + ". Baja algo del reparto.";
  } else {
    nota.textContent = "El reparto cuadra al céntimo con el total de la mesa.";
  }

  return r;
}

function fallos() {
  const lista = [];
  CAMPOS.forEach(f => {
    const v = el(f.id).value.trim();
    if (v === "" || !f.prueba(v)) {
      lista.push({ texto: f.etiqueta + ": " + (v === "" ? f.vacio : f.error) });
    }
  });
  return lista;
}

function resumen() {
  const r = repartir();
  const extra = [];

  if (PLATOS.every(p => aNumero(el("p" + p.ref).value) === 0)) {
    extra.push("Reparto: al menos un plato tiene que llevar un importe distinto de cero.");
  }
  if (r.bruto > 0 && r.sobra > 0.004) {
    extra.push("Reparto: sobran " + dinero(r.sobra) + " por asignar a algún plato.");
  }
  if (r.sobra < -0.004) {
    extra.push("Reparto: has asignado " + dinero(Math.abs(r.sobra)) + " de más.");
  }

  const lista = fallos().concat(extra);
  if (lista.length === 0) {
    resumenError.hidden = true;
    return null;
  }

  tituloError.textContent = lista.length === 1
    ? "Falta corregir un detalle del reparto"
    : "Faltan " + lista.length + " detalles en la hoja de reparto";
  listaError.innerHTML = "";
  lista.forEach(x => {
    const li = document.createElement("li");
    li.textContent = x.texto;
    listaError.appendChild(li);
  });
  resumenError.hidden = false;
  return lista;
}

CAMPOS.forEach(f => {
  const nodo = el(f.id);
  nodo.addEventListener("blur", () => { pintar(f); pintarMedidor(); });
  nodo.addEventListener("input", () => {
    if (nodo.closest(".campo, .plato-campo").dataset.estado === "error") pintar(f);
    pintarMedidor();
  });
});

total.addEventListener("blur", () => pintarMedidor());

PLATOS.forEach(p => {
  el("p" + p.ref).addEventListener("input", function () {
    let v = this.value.replace(/[^\d,]/g, "");
    const partes = v.split(",");
    if (partes.length > 2) v = partes[0] + "," + partes[1];
    const punto = v.indexOf(",");
    if (punto >= 0) v = v.slice(0, punto + 1) + v.slice(punto + 1).slice(0, 2);
    if (punto === 0) v = v.slice(1);
    this.value = v;
  });
});

total.addEventListener("input", function () {
  let v = this.value.replace(/[^\d,]/g, "");
  const partes = v.split(",");
  if (partes.length > 2) v = partes[0] + "," + partes[1];
  const punto = v.indexOf(",");
  if (punto >= 0) v = v.slice(0, punto + 1) + v.slice(punto + 1).slice(0, 2);
  if (punto === 0) v = v.slice(1);
  this.value = v;
});

el("igualar").addEventListener("click", () => {
  const r = repartir();
  if (r.sobra <= 0.004) {
    el("total").focus();
    return;
  }
  const conImporte = PLATOS.filter(p => aNumero(el("p" + p.ref).value) > 0);
  if (conImporte.length === 0) {
    el("p1").focus();
    return;
  }
  const centimos = Math.round(r.sobra * 100);
  const base = Math.floor(centimos / conImporte.length);
  let resto = centimos - base * conImporte.length;
  conImporte.forEach(p => {
    let parte = base;
    if (resto > 0) { parte += 1; resto -= 1; }
    const nuevo = Math.round((aNumero(el("p" + p.ref).value) + parte / 100) * 100) / 100;
    el("p" + p.ref).value = nuevo.toFixed(2).replace(".", ",");
    pintar(CAMPOS.find(f => f.id === "p" + p.ref));
  });
  pintarMedidor();
  el("total").focus();
});

el("vaciar").addEventListener("click", () => {
  total.value = "";
  grupo.value = "";
  PLATOS.forEach(p => { el("p" + p.ref).value = ""; });
  CAMPOS.forEach(f => {
    contenedor(f).dataset.estado = "neutro";
    el(f.id).setAttribute("aria-invalid", "false");
    el(f.id + "-error").textContent = "";
    el(f.id).setAttribute("aria-describedby", f.id + "-ayuda");
  });
  resumenError.hidden = true;
  pintarMedidor();
  total.focus();
});

form.addEventListener("submit", e => {
  e.preventDefault();
  const primero = pintarTodo();
  const r = pintarMedidor();
  const problemas = resumen();
  if (primero) {
    primero.focus();
    return;
  }
  if (problemas) {
    const foco = problemas[0].texto.startsWith("Reparto") ? el("total") : null;
    (foco || el("grupo")).focus();
    return;
  }
  completar(r);
});

function completar(r) {
  const conImporte = PLATOS.filter(p => aNumero(el("p" + p.ref).value) > 0);
  const ref = "RP-" + String(Math.floor(10000 + Math.random() * 90000));

  el("cerradoRef").textContent = ref;
  el("cerradoMesa").textContent = "7";
  el("cerradoPlatos").textContent = conImporte.length + " de " + PLATOS.length;
  el("cerradoTotal").textContent = dinero(r.suma);
  el("cerradoTitulo").textContent = "Todo cuadrado, " + grupo.value.trim();
  el("cerradoTexto").textContent = "La hoja " + ref + " ya está en la barra. Repartid " +
    dinero(r.suma / Math.max(1, conImporte.length)) + " de media por concepto.";

  const lista = document.getElementById("cerradoLista");
  lista.innerHTML = "";
  conImporte.forEach((p, i) => {
    const li = document.createElement("li");
    li.style.animationDelay = i * 0.05 + "s";
    const b = document.createElement("b");
    b.textContent = p.nombre + " · " + Math.round(r.suma > 0 ? aNumero(el("p" + p.ref).value) / r.suma * 100 : 0) + " por ciento";
    const s = document.createElement("span");
    s.textContent = dinero(aNumero(el("p" + p.ref).value));
    li.appendChild(b);
    li.appendChild(s);
    lista.appendChild(li);
  });

  form.hidden = true;
  document.querySelector(".encabezado").hidden = true;
  cerrado.hidden = false;
  cerrado.focus();
}

el("otra").addEventListener("click", () => {
  cerrado.hidden = true;
  form.hidden = false;
  document.querySelector(".encabezado").hidden = false;
  total.value = "86,40";
  grupo.value = "";
  ["18,60", "14,40", "26,00", "7,40", "20,00"].forEach((v, i) => {
    el("p" + (i + 1)).value = v;
  });
  CAMPOS.forEach(f => {
    contenedor(f).dataset.estado = "neutro";
    el(f.id).setAttribute("aria-invalid", "false");
    el(f.id + "-error").textContent = "";
    el(f.id).setAttribute("aria-describedby", f.id + "-ayuda");
  });
  resumenError.hidden = true;
  pintarMedidor();
  total.focus();
});

pintarMedidor();
