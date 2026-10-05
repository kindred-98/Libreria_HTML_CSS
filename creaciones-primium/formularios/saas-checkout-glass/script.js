const form = document.getElementById("form");
const cristal = document.getElementById("cristal");
const escenario = document.getElementById("escenario");
const resumenError = document.getElementById("resumenError");
const listaError = document.getElementById("resumenErrorLista");
const tituloError = document.getElementById("resumenErrorTitulo");
const pagada = document.getElementById("pagada");
const pagar = document.getElementById("pagar");

const LETRAS_CONTROL = "TRWAGMYFPDXBNJZSQVHLCKE";
const VALORES_CONTROL = {
  "0": 14, "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9,
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9, J: 10, K: 11, L: 12, M: 13,
  N: 14, O: 15, P: 16, Q: 17, R: 18, S: 19, T: 20, U: 21, V: 22, W: 23
};

const TIPOS = {
  visa: { texto: "VISA", largo: 16, prefijos: ["4"] },
  mc: { texto: "MASTERCARD", largo: 16, prefijos: ["5"] },
  amex: { texto: "AMEX", largo: 15, prefijos: ["3"] },
  disc: { texto: "DISCOVER", largo: 16, prefijos: ["6"] }
};

const IVA_PAIS = { ES: 0.21, DE: 0.19, FR: 0.2, NL: 0.21, PT: 0.23, IE: 0.23, US: 0 };

const MENSUAL = 68;
const ANUAL_POR_MES = 54.4;

const CAMPOS = [
  {
    id: "numero",
    etiqueta: "Card number",
    vacio: "We need the card number to charge anything.",
    error: "That number does not pass the check digit. Sixteen digits, grouped in fours.",
    prueba: v => {
      const d = v.replace(/\s/g, "");
      return luhn(d) && d.length >= 15 && d.length <= 16;
    }
  },
  {
    id: "titular",
    etiqueta: "Name on the card",
    vacio: "The bank wants the name printed on the card.",
    error: "Between five and forty six characters, letters and spaces only.",
    prueba: v => v.length >= 5 && v.length <= 46 && /^[A-Za-z][A-Za-z .'-]+$/.test(v)
  },
  {
    id: "caducidad",
    etiqueta: "Expiry",
    vacio: "The expiry date is part of the authorisation.",
    error: "Two digits over two digits, month over year, and it has to be in the future.",
    prueba: v => caducidadValida(v)
  },
  {
    id: "cvc",
    etiqueta: "Security code",
    vacio: "The security code is on the back of the card.",
    error: "Three digits, or four on American Express. This card needs four.",
    prueba: v => {
      const marca = detectaMarca(el("numero").value.replace(/\s/g, ""));
      const largo = marca === "amex" ? 4 : 3;
      return new RegExp("^\\d{" + largo + "}$").test(v);
    }
  },
  {
    id: "correo",
    etiqueta: "Receipt address",
    vacio: "We need an address to send the invoice to.",
    error: "That does not look like an address. Try name@domain.com.",
    prueba: v => /^[^\s@,;]+@[^\s@,;]+\.[a-zA-Z]{2,}$/.test(v) && v.length <= 70
  },
  {
    id: "pais",
    etiqueta: "Country",
    vacio: "Choose the country the invoice is issued in.",
    error: "That country is not in the billing catalogue.",
    prueba: v => Object.hasOwn(IVA_PAIS, v)
  },
  {
    id: "cp",
    etiqueta: "Post code",
    vacio: "The post code is on the invoice and the bank wants it too.",
    error: "Between three and twelve characters, letters and digits.",
    prueba: v => /^[A-Za-z0-9 -]{3,12}$/.test(v)
  },
  {
    id: "iva",
    etiqueta: "VAT number",
    vacio: "",
    error: "That VAT number does not check out. The format is two letters, a letter, seven digits and a check letter.",
    prueba: v => ivaValida(v)
  }
];

const st = { anual: false };

function el(id) { return document.getElementById(id); }

function dinero(n) {
  return n.toFixed(2).replace(".", ",");
}

function luhn(v) {
  const d = v.replace(/\s/g, "");
  if (!/^\d{13,19}$/.test(d)) return false;
  let suma = 0;
  let doble = false;
  for (let i = d.length - 1; i >= 0; i--) {
    let c = Number(d.charAt(i));
    if (doble) {
      c *= 2;
      if (c > 9) c -= 9;
    }
    suma += c;
    doble = !doble;
  }
  return suma % 10 === 0;
}

function detectaMarca(d) {
  if (d.charAt(0) === "4") return "visa";
  if (/^5[1-5]/.test(d)) return "mc";
  if (/^3[47]/.test(d)) return "amex";
  if (d.charAt(0) === "6") return "disc";
  return "";
}

function caducidadValida(v) {
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(v)) return false;
  const p = v.split("/");
  const mes = Number(p[0]);
  const anio = 2000 + Number(p[1]);
  const ahora = new Date();
  return anio > ahora.getFullYear() || (anio === ahora.getFullYear() && mes >= ahora.getMonth() + 1);
}

function ivaValida(v) {
  if (v === "") return true;
  if (!/^ES[0-9A-Z]\d{7}[0-9A-Z]$/.test(v)) return false;
  const cuerpo = v.substring(2);
  let suma = 0;
  for (let i = 0; i < 8; i++) {
    const n = VALORES_CONTROL[cuerpo.charAt(i)];
    if (n === undefined) return false;
    suma += (i % 2 === 0) ? n : n * 2;
  }
  return LETRAS_CONTROL.charAt(suma % 23) === cuerpo.charAt(8);
}

function enmascarar(d) {
  const grupos = [];
  for (let i = 0; i < d.length; i += 4) grupos.push(d.slice(i, i + 4));
  const partes = grupos.join(" ").split(" ");
  return partes.map((g, i) => (i === partes.length - 1 ? g : "•".repeat(g.length))).join(" ");
}

function baseMensual() {
  return st.anual ? ANUAL_POR_MES * 12 : MENSUAL;
}

function ivaAplicado() {
  const v = el("iva").value.trim();
  return el("pais").value !== "" && v !== "" && ivaValida(v);
}

function refrescarFactura() {
  const pais = el("pais").value;
  const tipo = IVA_PAIS[pais];
  const ivaOk = ivaAplicado();
  const base = baseMensual();
  const dto = st.anual ? base * 0.2 : 0;
  const neto = base - dto;
  const impuesto = tipo === undefined ? neto * 0.21 : neto * tipo;

  el("lineaBase").textContent = dinero(base);
  el("lineaSub").textContent = dinero(base);
  el("lineaDesc").hidden = dto === 0;
  el("lineaDescValor").textContent = "-" + dinero(dto);
  el("lineaImp").textContent = ivaOk ? "reversed" : dinero(impuesto);
  const total = ivaOk ? neto : neto + impuesto;
  el("lineaTotal").textContent = dinero(total);
  el("panelTotal").textContent = dinero(total);
  el("pagarTexto").textContent = "Pay " + dinero(total);
  el("cicloTitulo").textContent = st.anual ? "Yearly" : "Monthly";
  el("cicloPrecio").textContent = st.anual
    ? "652,80 a year, one payment of " + dinero(base - dto + (tipo === undefined ? (base - dto) * 0.21 : 0))
    : "68,00 a month, cancel any time";
  el("facturaPie").textContent = ivaOk
    ? "Valid VAT number, the tax is reversed and appears as a zero line on the invoice."
    : st.anual
      ? "One payment today, then nothing for twelve months. Cancel any time before the renewal date."
      : "Renews the same day next month. Cancel from the billing tab in two clicks.";

  const extra = [];
  if (el("guardar").checked) extra.push("Card kept for the renewal");
  const linea = el("lineaExtra");
  linea.innerHTML = "";
  extra.forEach(t => {
    const div = document.createElement("div");
    const dt = document.createElement("dt");
    dt.textContent = t;
    const dd = document.createElement("dd");
    dd.textContent = "included";
    div.appendChild(dt);
    div.appendChild(dd);
    linea.appendChild(div);
  });
}

function refrescarCristal() {
  const d = el("numero").value.replace(/\s/g, "");
  const nodoNum = el("verNumero");
  nodoNum.textContent = d.length === 0 ? "0000 0000 0000 0000" : enmascarar(d);
  nodoNum.dataset.vacia = d.length === 0 ? "1" : "0";

  const marca = detectaMarca(d);
  const texto = marca ? TIPOS[marca].texto : "GLASS";
  const nodoMarca = el("verMarca");
  nodoMarca.textContent = texto;
  if (marca === "mc" || marca === "amex") nodoMarca.dataset.marca = marca;
  else delete nodoMarca.dataset.marca;

  const fantasma = el("marcaFantasma");
  if (marca) {
    fantasma.dataset.visible = "1";
    fantasma.dataset.marca = marca;
  } else {
    fantasma.dataset.visible = "0";
  }

  const titular = el("titular").value.trim();
  el("verTitular").textContent = titular ? titular.toUpperCase() : "YOUR NAME";
  const cad = el("caducidad").value.trim();
  el("verCaduca").textContent = cad || "MM/YY";
}

function fallo(f) {
  const v = el(f.id).value.trim();
  if (f.id === "iva") return v === "" ? "" : (f.prueba(v) ? "" : f.error);
  if (v === "") return f.vacio;
  return f.prueba(v) ? "" : f.error;
}

function pintar(f) {
  const env = el(f.id).closest(".campo");
  const ayuda = el(f.id + "-ayuda");
  const err = el(f.id + "-err");
  const mensaje = fallo(f);
  const described = [ayuda.id];
  const vacio = el(f.id).value.trim() === "";

  if (f.id === "iva" && vacio) {
    env.dataset.estado = "neutro";
    el(f.id).removeAttribute("aria-invalid");
    el(f.id).setAttribute("aria-describedby", ayuda.id);
    err.textContent = "";
    return "";
  }

  env.dataset.estado = mensaje ? "error" : "ok";
  el(f.id).setAttribute("aria-invalid", mensaje ? "true" : "false");
  if (mensaje) {
    described.push(err.id);
    err.textContent = mensaje;
  } else {
    err.textContent = "";
  }
  el(f.id).setAttribute("aria-describedby", described.join(" "));
  return mensaje;
}

function pintarTodo() {
  let primero = null;
  CAMPOS.forEach(f => {
    const m = pintar(f);
    if (m && !primero) primero = el(f.id);
  });
  return primero;
}

function problemas() {
  return CAMPOS.filter(f => fallo(f) !== "");
}

CAMPOS.forEach(f => {
  const n = el(f.id);
  n.addEventListener("blur", () => { pintar(f); refrescarCristal(); });
  n.addEventListener("change", () => { pintar(f); refrescarCristal(); refrescarFactura(); });
  n.addEventListener("input", () => {
    if (n.closest(".campo").dataset.estado === "error") pintar(f);
    refrescarCristal();
    refrescarFactura();
  });
});

el("numero").addEventListener("input", () => {
  let v = el("numero").value.replace(/\D/g, "").slice(0, 16);
  const grupos = [];
  for (let i = 0; i < v.length; i += 4) grupos.push(v.slice(i, i + 4));
  el("numero").value = grupos.join(" ");
  if (CAMPOS.filter(f => f.id === "cvc")[0].id === "cvc") {
    const marca = detectaMarca(v);
    el("cvc").maxLength = marca === "amex" ? 4 : 3;
  }
  refrescarCristal();
  refrescarFactura();
});

el("caducidad").addEventListener("input", () => {
  let v = el("caducidad").value.replace(/\D/g, "").slice(0, 4);
  if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
  el("caducidad").value = v;
  refrescarCristal();
});

el("cvc").addEventListener("input", () => {
  el("cvc").value = el("cvc").value.replace(/\D/g, "").slice(0, 4);
});

el("pegar").addEventListener("click", () => {
  el("numero").value = "4242 4242 4242 4242";
  el("numero").dispatchEvent(new Event("input", { bubbles: true }));
  pintar(CAMPOS[0]);
  el("numero").focus();
});

el("verCvc").addEventListener("click", () => {
  const visible = el("verCvc").getAttribute("aria-pressed") === "true";
  el("verCvc").setAttribute("aria-pressed", visible ? "false" : "true");
  el("verCvc").setAttribute("aria-label", visible ? "Show the security code" : "Hide the security code");
  el("cvc").type = visible ? "password" : "text";
  el("cvc").focus();
});

el("guardar").addEventListener("change", () => {
  el("guardar").closest(".campo").dataset.estado = el("guardar").checked ? "ok" : "neutro";
  el("guardar").setAttribute("aria-invalid", "false");
  refrescarFactura();
});

el("ciclo").addEventListener("click", () => {
  st.anual = !st.anual;
  el("ciclo").setAttribute("aria-checked", st.anual ? "true" : "false");
  el("cicloCaja").dataset.anual = st.anual ? "1" : "0";
  el("ciclo").style.setProperty("--perilla", (st.anual ? 24 : 0) + "px");
  refrescarFactura();
});

el("ciclo").style.setProperty("--perilla", "0px");

let inclinacionX = 0;
let inclinacionY = 0;
let mx = 0;
let my = 0;

function aplicarInclinacion() {
  cristal.style.setProperty("--rx", (8 - inclinacionX).toFixed(2) + "deg");
  cristal.style.setProperty("--ry", (-12 + inclinacionY).toFixed(2) + "deg");
  cristal.style.setProperty("--mx", mx.toFixed(3));
  cristal.style.setProperty("--my", my.toFixed(3));
  cristal.style.setProperty("--inclinar", (Math.abs(inclinacionX) / 14).toFixed(3));
  cristal.style.setProperty("--sombraX", (1 - Math.abs(inclinacionY) / 120).toFixed(3));
}

function alMover(e) {
  const caja = cristal.getBoundingClientRect();
  const x = (e.clientX - caja.left) / caja.width;
  const y = (e.clientY - caja.top) / caja.height;
  inclinacionY = (x - 0.5) * 30;
  inclinacionX = (y - 0.5) * 26;
  mx = (x - 0.5) * 2;
  my = (y - 0.5) * 2;
  cristal.dataset.sigo = "1";
  aplicarInclinacion();
  el("pista").textContent = Math.abs(inclinacionY) > 8
    ? "You are tilting the card towards " + (inclinacionY > 0 ? "the light" : "the shadow") + "."
    : "Move the pointer across the card to see the glass move.";
}

function alSalir() {
  inclinacionX = 0;
  inclinacionY = 0;
  mx = 0;
  my = 0;
  delete cristal.dataset.sigo;
  aplicarInclinacion();
  el("pista").textContent = "Move the pointer across the card to see the glass move. On a phone, drag it.";
}

escenario.addEventListener("pointermove", alMover);
escenario.addEventListener("pointerleave", alSalir);
escenario.addEventListener("pointerdown", e => {
  alMover(e);
  if (escenario.setPointerCapture && e.pointerId !== undefined) {
    try { escenario.setPointerCapture(e.pointerId); } catch {}
  }
});
escenario.addEventListener("pointerup", e => { if (e.pointerType !== "mouse") alSalir(); });

form.addEventListener("submit", e => {
  e.preventDefault();
  const primero = pintarTodo();
  refrescarCristal();
  refrescarFactura();
  const fallos = problemas();

  if (fallos.length > 0) {
    tituloError.textContent = fallos.length === 1
      ? "One thing is missing to take this payment"
      : fallos.length + " things are missing to take this payment";
    listaError.innerHTML = "";
    fallos.forEach(f => {
      const li = document.createElement("li");
      li.textContent = f.etiqueta + ": " + fallo(f);
      listaError.appendChild(li);
    });
    resumenError.hidden = false;
    if (primero) primero.focus();
    return;
  }

  resumenError.hidden = true;
  pagar.disabled = true;
  pagar.dataset.estado = "cargando";
  el("pagarTexto").textContent = "Talking to the bank";
  window.setTimeout(terminar, 1700);
});

function totalActual() {
  const base = baseMensual();
  const dto = st.anual ? base * 0.2 : 0;
  const neto = base - dto;
  const tipo = IVA_PAIS[el("pais").value];
  const ivaOk = ivaAplicado();
  const impuesto = tipo === undefined ? neto * 0.21 : neto * tipo;
  return ivaOk ? neto : neto + impuesto;
}

function terminar() {
  const d = el("numero").value.replace(/\s/g, "");
  const marca = detectaMarca(d);
  const ahora = new Date();
  const meses = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const renovo = new Date(ahora.getTime());
  if (st.anual) renovo.setFullYear(renovo.getFullYear() + 1);
  else renovo.setMonth(renovo.getMonth() + 1);

  el("pagadaRef").textContent = "MC-" + String(Math.floor(100000 + Math.random() * 899999));
  el("pagadaImporte").textContent = dinero(totalActual()) + (st.anual ? " for twelve months" : " for one month");
  el("pagadaTarjeta").textContent = (marca ? TIPOS[marca].texto : "GLASS") + " ending " + d.slice(-4);
  el("pagadaRenuevo").textContent = renovo.getDate() + " " + meses[renovo.getMonth()] + " " + renovo.getFullYear();
  el("pagadaTitulo").textContent = st.anual ? "Twelve months of Meridian Cloud" : "Meridian Cloud is yours";
  el("pagadaLead").textContent = "The receipt is on its way to " + el("correo").value.trim() +
    " and the workspace opens in a moment." +
    (el("guardar").checked ? " The card is stored by the processor for the renewal." : " The card was not stored, you will enter it again at the renewal.");
  el("pagadaNota").textContent = "Keep the operation code. The support team answers in four minutes at the median, and it is the fastest way to find this payment in the ledger.";

  document.querySelector(".escena").hidden = true;
  document.querySelector(".barra").hidden = true;
  pagada.hidden = false;
  pagada.focus();
}

el("otra").addEventListener("click", () => {
  pagada.hidden = true;
  document.querySelector(".escena").hidden = false;
  document.querySelector(".barra").hidden = false;
  form.reset();
  st.anual = false;
  el("ciclo").setAttribute("aria-checked", "false");
  el("cicloCaja").dataset.anual = "0";
  el("ciclo").style.setProperty("--perilla", "0px");
  el("cvc").type = "password";
  el("verCvc").setAttribute("aria-pressed", "false");
  el("verCvc").setAttribute("aria-label", "Show the security code");
  pagar.disabled = false;
  delete pagar.dataset.estado;
  CAMPOS.forEach(f => {
    el(f.id).closest(".campo").dataset.estado = "neutro";
    el(f.id).setAttribute("aria-invalid", "false");
    el(f.id).setAttribute("aria-describedby", f.id + "-ayuda");
    el(f.id + "-err").textContent = "";
  });
  el("guardar").closest(".campo").dataset.estado = "neutro";
  resumenError.hidden = true;
  el("lineaExtra").innerHTML = "";
  refrescarCristal();
  refrescarFactura();
  alSalir();
  el("numero").focus();
});

aplicarInclinacion();
refrescarCristal();
refrescarFactura();
