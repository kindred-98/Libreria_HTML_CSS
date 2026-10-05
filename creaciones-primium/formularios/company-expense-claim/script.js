const form = document.getElementById("form");
const lineas = document.getElementById("lineas");
const lineasVacias = document.getElementById("lineasVacias");
const resumenError = document.getElementById("resumenError");
const listaError = document.getElementById("resumenErrorLista");
const tituloError = document.getElementById("resumenErrorTitulo");
const archivada = document.getElementById("archivada");
const brindis = document.getElementById("brindis");

const CATEGORIAS = [
  { clave: "viaje", texto: "Travel" },
  { clave: "comidas", texto: "Meals" },
  { clave: "material", texto: "Equipment" },
  { clave: "formacion", texto: "Training" },
  { clave: "software", texto: "Software" },
  { clave: "otros", texto: "Other" }
];

const CAMPOS = [
  {
    id: "empleado",
    etiqueta: "Employee",
    vacio: "We need a name to put on the claim.",
    error: "Between 3 and 60 characters.",
    prueba: v => v.length >= 3 && v.length <= 60
  },
  {
    id: "departamento",
    etiqueta: "Department",
    vacio: "Choose the department that pays for this.",
    error: "That department is not in the cost centre list.",
    prueba: v => ["ventas", "soporte", "ingenieria", "finanzas", "operaciones"].includes(v)
  },
  {
    id: "periodo",
    etiqueta: "Claim period",
    vacio: "Pick the month the money was spent in.",
    error: "That period is not open for claims.",
    prueba: v => ["cerrado", "actual", "anterior"].includes(v)
  },
  {
    id: "motivo",
    etiqueta: "Justification",
    vacio: "Write at least a sentence for the approver.",
    error: "Between 30 and 400 characters, and say what the money bought.",
    prueba: v => v.length >= 30 && v.length <= 400
  },
  {
    id: "recibos",
    etiqueta: "Receipt status",
    vacio: "Tell us whether the receipts are in place.",
    error: "That receipt answer is not on the form.",
    prueba: v => ["todos", "algunos", "ninguno"].includes(v)
  },
  {
    id: "aprobador",
    etiqueta: "Approver",
    vacio: "Name the person who has to approve it.",
    error: "Between 3 and 60 characters.",
    prueba: v => v.length >= 3 && v.length <= 60
  },
  {
    id: "pago",
    etiqueta: "Payment",
    vacio: "Choose how the money reaches you.",
    error: "That payment route is not available.",
    prueba: v => ["nomina", "transferencia", "tarjeta"].includes(v)
  },
  {
    id: "declaro",
    etiqueta: "Declaration",
    vacio: "The declaration has to be ticked before anything is filed.",
    error: "",
    prueba: v => v === "si"
  }
];

function el(id) { return document.getElementById(id); }

function valor(f) {
  if (f.id === "declaro") return el("declaro").checked ? "si" : "";
  if (f.id === "recibos") {
    const m = document.querySelector('input[name="recibos"]:checked');
    return m ? m.value : "";
  }
  return el(f.id).value.trim();
}

function contenedor(f) {
  if (f.id === "recibos") return el("pasos").closest(".linea");
  return el(f.id).closest(".linea");
}

function pintar(f) {
  const env = contenedor(f);
  const ayuda = el(f.id + "-ayuda");
  const err = el(f.id + "-err");
  const v = valor(f);
  const vacio = v === "";
  const mal = !vacio && !f.prueba(v);
  const falla = vacio || mal;
  const described = [ayuda.id];

  env.dataset.estado = falla ? "error" : "ok";
  if (f.id === "recibos") {
    el("pasos").setAttribute("aria-describedby", described.join(" "));
  } else {
    el(f.id).setAttribute("aria-invalid", falla ? "true" : "false");
    el(f.id).setAttribute("aria-describedby", described.join(" "));
  }
  if (falla) {
    described.push(err.id);
    err.textContent = vacio ? f.vacio : f.error;
  } else {
    err.textContent = "";
  }
  if (f.id === "recibos") el("pasos").setAttribute("aria-describedby", described.join(" "));
  return falla;
}

function problema(f) {
  const v = valor(f);
  return v === "" || !f.prueba(v);
}

function dinero(n) {
  return n.toFixed(2).replace(".", ",");
}

function cuerpoLinea(i) {
  return {
    fecha: { etiqueta: "Date", vacio: "The date is missing on line " + i + ".", error: "A real date inside this claim period, not in the future.", prueba: v => validaFecha(v) },
    categoria: { etiqueta: "Category", vacio: "Pick a category on line " + i + ".", error: "That category is not on the list.", prueba: v => CATEGORIAS.some(c => c.clave === v) },
    comercio: { etiqueta: "Merchant", vacio: "Who was paid on line " + i + ".", error: "Between 2 and 40 characters.", prueba: v => v.length >= 2 && v.length <= 40 },
    importe: { etiqueta: "Amount", vacio: "The amount on line " + i + " is empty.", error: "A number between 0,01 and 9999,99 with two decimals at most.", prueba: v => validaImporte(v) }
  };
}

function validaFecha(v) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(v);
  if (isNaN(d.getTime())) return false;
  const hoy = new Date();
  return d <= hoy && d.getFullYear() >= hoy.getFullYear() - 2;
}

function validaImporte(v) {
  const limpio = v.replace(/\./g, "");
  if (!/^\d{1,6}(,\d{1,2})?$/.test(limpio)) return false;
  const n = Number(limpio.replace(",", "."));
  return n >= 0.01 && n <= 9999.99;
}

function importeLinea(campo) {
  const v = campo.value.trim();
  if (!validaImporte(v)) return 0;
  return Number(v.replace(/\./g, "").replace(",", "."));
}

function nodo(etiqueta, clase, texto) {
  const n = document.createElement(etiqueta);
  if (clase) n.className = clase;
  if (texto !== undefined) n.textContent = texto;
  return n;
}

function crearLinea(indice) {
  const fila = nodo("div", "linea-gasto");
  fila.dataset.linea = indice;

  const izq = nodo("div", "linea-gasto__izq");
  izq.appendChild(nodo("span", "linea-gasto__num", String(indice).padStart(2, "0")));
  const texto = nodo("div", "linea-gasto__texto");
  texto.appendChild(nodo("b", null, "Expense line " + indice));
  texto.appendChild(nodo("small", null, "Every line needs a date, a category, a merchant and an amount. A line under 25,00 can go without a receipt."));
  izq.appendChild(texto);
  fila.appendChild(izq);

  const der = nodo("div", "linea-gasto__der");

  const sel = document.createElement("select");
  sel.id = "gastoCat" + indice;
  sel.setAttribute("aria-describedby", "gastoAyuda" + indice);
  sel.appendChild(new Option("Category", ""));
  CATEGORIAS.forEach(c => sel.appendChild(new Option(c.texto, c.clave)));
  sel.addEventListener("change", () => pintarGasto(indice));
  sel.addEventListener("blur", () => pintarGasto(indice));

  const entradaFecha = document.createElement("input");
  entradaFecha.type = "date";
  entradaFecha.id = "gastoFec" + indice;
  entradaFecha.setAttribute("aria-describedby", "gastoAyuda" + indice);
  entradaFecha.addEventListener("change", () => pintarGasto(indice));
  entradaFecha.addEventListener("blur", () => pintarGasto(indice));

  const entradaComercio = document.createElement("input");
  entradaComercio.type = "text";
  entradaComercio.id = "gastoCom" + indice;
  entradaComercio.maxLength = 40;
  entradaComercio.placeholder = "Lisbon Airport Rail";
  entradaComercio.setAttribute("aria-describedby", "gastoAyuda" + indice);
  entradaComercio.addEventListener("input", () => pintarGasto(indice));
  entradaComercio.addEventListener("blur", () => pintarGasto(indice));

  const entradaImporte = document.createElement("input");
  entradaImporte.type = "text";
  entradaImporte.id = "gastoImp" + indice;
  entradaImporte.inputMode = "decimal";
  entradaImporte.maxLength = 9;
  entradaImporte.placeholder = "128,40";
  entradaImporte.setAttribute("aria-describedby", "gastoAyuda" + indice);
  entradaImporte.addEventListener("input", () => {
    entradaImporte.value = entradaImporte.value.replace(/[^\d.,]/g, "").slice(0, 9);
    pintarGasto(indice);
    refrescar();
  });
  entradaImporte.addEventListener("blur", () => pintarGasto(indice));

  const pares = [
    ["Date", entradaFecha],
    ["Category", sel],
    ["Merchant", entradaComercio],
    ["Amount", entradaImporte]
  ];

  pares.forEach(par => {
    const env = nodo("div", "gasto-campo");
    env.dataset.estado = "neutro";
    const lab = nodo("label", null, par[0]);
    lab.htmlFor = par[1].id;
    env.appendChild(lab);
    env.appendChild(par[1]);
    der.appendChild(env);
  });

  const quitar = nodo("button", "linea-gasto__quitar", "Remove line " + indice);
  quitar.type = "button";
  quitar.addEventListener("click", () => {
    fila.remove();
    renumerar();
    refrescar();
    pintarGasto(indice);
  });
  der.appendChild(quitar);

  fila.appendChild(der);

  const ayuda = nodo("p", "gasto-aviso");
  ayuda.id = "gastoAyuda" + indice;
  ayuda.setAttribute("role", "alert");
  fila.appendChild(ayuda);

  return fila;
}

function renumerar() {
  Array.from(lineas.children).forEach((fila, i) => {
    const n = i + 1;
    fila.dataset.linea = n;
    fila.querySelector(".linea-gasto__num").textContent = String(n).padStart(2, "0");
    fila.querySelector(".linea-gasto__texto b").textContent = "Expense line " + n;
    fila.querySelector(".linea-gasto__quitar").textContent = "Remove line " + n;
  });
}

function pintarGasto(indice) {
  const fila = lineas.querySelector('[data-linea="' + indice + '"]');
  if (!fila) return;
  const cuerpo = cuerpoLinea(indice);
  const campos = {
    fecha: fila.querySelector('[id^="gastoFec"]'),
    categoria: fila.querySelector('[id^="gastoCat"]'),
    comercio: fila.querySelector('[id^="gastoCom"]'),
    importe: fila.querySelector('[id^="gastoImp"]')
  };
  const errores = [];
  Object.keys(cuerpo).forEach(clave => {
    const v = campos[clave].value.trim();
    const falla = v === "" || !cuerpo[clave].prueba(v);
    const env = campos[clave].closest(".gasto-campo");
    env.dataset.estado = falla ? "error" : "ok";
    campos[clave].setAttribute("aria-invalid", falla ? "true" : "false");
    if (falla) errores.push(v === "" ? cuerpo[clave].vacio : cuerpo[clave].error);
  });
  const aviso = fila.querySelector(".gasto-aviso");
  fila.dataset.estado = errores.length > 0 ? "error" : "ok";
  aviso.textContent = errores.length === 0
    ? ""
    : errores.length === 1 ? errores[0] : "Line " + indice + " needs " + errores.length + " fixes: " + errores.join(" ");
  return errores;
}

function problemasGasto() {
  const salida = [];
  Array.from(lineas.children).forEach((fila, i) => {
    const n = i + 1;
    const cuerpo = cuerpoLinea(n);
    const campos = {
      fecha: fila.querySelector('[id^="gastoFec"]'),
      categoria: fila.querySelector('[id^="gastoCat"]'),
      comercio: fila.querySelector('[id^="gastoCom"]'),
      importe: fila.querySelector('[id^="gastoImp"]')
    };
    const faltan = [];
    Object.keys(cuerpo).forEach(clave => {
      const v = campos[clave].value.trim();
      if (v === "") faltan.push(cuerpo[clave].vacio);
      else if (!cuerpo[clave].prueba(v)) faltan.push(cuerpo[clave].error);
    });
    if (faltan.length > 0) {
      salida.push({ etiqueta: "Expense line " + n, mensaje: faltan[0] });
    }
  });
  return salida;
}

function refrescar() {
  let neto = 0;
  Array.from(lineas.children).forEach(fila => {
    neto += importeLinea(fila.querySelector('[id^="gastoImp"]'));
  });
  const impuesto = neto * (21 / 121);
  const hay = lineas.children.length > 0;
  lineasVacias.hidden = hay;
  el("contador").textContent = (hay ? lineas.children.length : 0) + (lineas.children.length === 1 ? " line, " : " lines, ") + dinero(neto) + " net";
  el("totalLineas").textContent = String(lineas.children.length);
  el("totalNeto").textContent = dinero(neto);
  el("totalImpuesto").textContent = dinero(impuesto);
  el("totalBruto").textContent = dinero(neto + impuesto);
}

function anadirLinea(foco) {
  if (lineas.children.length >= 8) {
    mostrarBrindis("Eight lines is the maximum on one claim");
    return;
  }
  const fila = crearLinea(lineas.children.length + 1);
  fila.style.animationDelay = "0s";
  lineas.appendChild(fila);
  refrescar();
  if (foco !== false) fila.querySelector("input, select").focus();
  return fila;
}

function quitarUltima() {
  if (lineas.children.length === 0) {
    mostrarBrindis("There is no line to remove");
    return;
  }
  lineas.lastElementChild.remove();
  renumerar();
  refrescar();
}

function mostrarBrindis(texto) {
  el("brindisTexto").textContent = texto;
  brindis.hidden = true;
  brindis.getBoundingClientRect();
  brindis.hidden = false;
  window.setTimeout(() => { brindis.hidden = true; }, 2600);
}

CAMPOS.forEach(f => {
  if (f.id === "recibos") {
    document.querySelectorAll('input[name="recibos"]').forEach(r => {
      r.addEventListener("change", () => pintar(f));
      r.addEventListener("blur", () => pintar(f));
    });
    return;
  }
  const n = el(f.id);
  n.addEventListener("blur", () => pintar(f));
  n.addEventListener("change", () => pintar(f));
  n.addEventListener("input", () => {
    if (n.closest(".linea").dataset.estado === "error") pintar(f);
    if (f.id === "motivo") {
      const caja = el("motivoPips");
      if (caja.childElementCount !== 10) {
        caja.innerHTML = "";
        for (let i = 0; i < 10; i++) caja.appendChild(document.createElement("i"));
      }
      const llenos = Math.min(10, Math.round((n.value.length / 400) * 10));
      for (let i = 0; i < 10; i++) caja.children[i].dataset.on = i < llenos ? "1" : "0";
      el("motivoCuenta").textContent = n.value.length + " of 400 characters, 30 minimum";
      el("motivo-ayuda").dataset.alerta = n.value.length > 0 && n.value.length < 30 ? "1" : "0";
    }
  });
});

el("anadir").addEventListener("click", anadirLinea);
el("quitar").addEventListener("click", quitarUltima);

form.addEventListener("keydown", e => {
  if (!e.altKey || e.ctrlKey || e.metaKey) {
    if (e.key === "Enter" && (e.altKey || e.ctrlKey)) form.requestSubmit();
    return;
  }
  const k = e.key.toLowerCase();
  if (k >= "1" && k <= "5") {
    e.preventDefault();
    const tramo = el("tramo-" + k);
    if (tramo) {
      const destino = tramo.querySelector("input, select, textarea, button");
      if (destino) destino.focus();
    }
    return;
  }
  if (k === "n") { e.preventDefault(); anadirLinea(); return; }
  if (k === "k") { e.preventDefault(); quitarUltima(); return; }
  if (k === "s") { e.preventDefault(); guardarBorrador(); return; }
  if (e.key === "Enter") { e.preventDefault(); form.requestSubmit(); }
});

function guardarBorrador() {
  const incompletas = CAMPOS.filter(problema).length;
  const plural = incompletas === 1 ? "" : "s";
  mostrarBrindis(incompletas === 0
    ? "Draft saved, everything is filled in"
    : "Draft saved with " + incompletas + " thing" + plural + " still empty");
}

form.addEventListener("submit", e => {
  e.preventDefault();
  let primero = null;
  CAMPOS.forEach(f => {
    const falla = pintar(f);
    if (falla && !primero) primero = f.id === "recibos" ? el("recibos") : el(f.id);
  });

  const fallos = CAMPOS.filter(problema).map(f => ({
    etiqueta: f.etiqueta,
    mensaje: valor(f) === "" ? f.vacio : f.error
  }));

  const hayLineas = lineas.children.length > 0;
  if (!hayLineas) {
    fallos.push({ etiqueta: "Expense lines", mensaje: "A claim needs at least one expense line with an amount." });
  } else {
    problemasGasto().forEach(p => fallos.push({ etiqueta: p.etiqueta, mensaje: p.mensaje }));
  }

  if (fallos.length > 0) {
    tituloError.textContent = fallos.length === 1
      ? "One thing is still missing in this claim"
      : fallos.length + " things are still missing in this claim";
    listaError.innerHTML = "";
    fallos.forEach(f => {
      const li = document.createElement("li");
      li.textContent = f.etiqueta + ": " + f.mensaje;
      listaError.appendChild(li);
    });
    resumenError.hidden = false;
    if (primero) primero.focus();
    else if (!hayLineas) el("anadir").focus();
    return;
  }

  resumenError.hidden = true;
  el("firmarTexto").textContent = "Signing, one moment";
  el("firmar").disabled = true;
  window.setTimeout(terminar, 700);
});

function terminar() {
  const ref = "EX-" + String(Math.floor(1000 + Math.random() * 8999));
  let neto = 0;
  Array.from(lineas.children).forEach(fila => { neto += importeLinea(fila.querySelector('[id^="gastoImp"]')); });
  const impuesto = neto * (21 / 121);

  el("archivadaRef").textContent = ref;
  el("archivadaEmpleado").textContent = el("empleado").value.trim();
  el("archivadaLineas").textContent = lineas.children.length + (lineas.children.length === 1 ? " line" : " lines");
  el("archivadaTotal").textContent = dinero(neto + impuesto) + " with tax";
  el("archivadaTitulo").textContent = "Claim " + ref + " is with " + el("aprobador").value.trim();
  el("archivadaLead").textContent = el("pago").options[el("pago").selectedIndex].text +
    " once " + el("aprobador").value.trim() + " approves it. Until then nothing moves.";

  const lista = el("archivadaPasos");
  lista.innerHTML = "";
  [
    "Approver " + el("aprobador").value.trim() + " gets a one click link, valid for seven days",
    el("periodo").value === "cerrado" ? "Finance review, two extra days because the books are closed" : "No finance review needed for an open period",
    "Duplicate detection runs again, against the last 24 months of claims",
    "Paid on " + el("pago").options[el("pago").selectedIndex].text.toLowerCase() + " once the approval lands"
  ].forEach((t, i) => {
    const li = document.createElement("li");
    li.textContent = t;
    li.style.animationDelay = (0.1 + i * 0.09).toFixed(2) + "s";
    lista.appendChild(li);
  });

  document.querySelector(".escena").hidden = true;
  document.querySelector(".cabecera").hidden = true;
  archivada.hidden = false;
  archivada.focus();
}

el("otra").addEventListener("click", () => {
  archivada.hidden = true;
  document.querySelector(".escena").hidden = false;
  document.querySelector(".cabecera").hidden = false;
  form.reset();
  lineas.innerHTML = "";
  el("firmar").disabled = false;
  el("firmarTexto").textContent = "Sign and file the claim";
  CAMPOS.forEach(f => {
    contenedor(f).dataset.estado = "neutro";
    el(f.id + "-err").textContent = "";
    if (f.id !== "recibos") {
      el(f.id).setAttribute("aria-describedby", f.id + "-ayuda");
      el(f.id).removeAttribute("aria-invalid");
    }
  });
  el("pasos").setAttribute("aria-describedby", "recibos-ayuda");
  el("motivo-ayuda").dataset.alerta = "0";
  resumenError.hidden = true;
  refrescar();
  el("empleado").focus();
});

anadirLinea(false);
CAMPOS.forEach(f => {
  contenedor(f).dataset.estado = "neutro";
  el(f.id + "-err").textContent = "";
});
refrescar();
