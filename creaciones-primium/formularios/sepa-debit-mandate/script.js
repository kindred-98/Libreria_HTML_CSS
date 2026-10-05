const form = document.getElementById("form");
const resumenError = document.getElementById("resumenError");
const listaError = document.getElementById("resumenErrorLista");
const tituloError = document.getElementById("resumenErrorTitulo");
const mandato = document.getElementById("mandato");

const LONGITUDES = { ES: 24, DE: 22, FR: 27, PT: 25, IT: 27, NL: 18, BE: 16, GB: 22, IE: 22, PL: 28 };
const PERIODOS = ["unica", "mensual", "trimestral", "semestral", "anual"];

const CAMPOS = [
  {
    id: "titular",
    etiqueta: "Titular de la cuenta",
    vacio: "Falta el nombre del titular de la cuenta.",
    error: "Entre 2 y 60 caracteres con al menos una letra.",
    prueba: v => v.length >= 2 && v.length <= 60 && /[A-Za-zÀ-ÿ]/.test(v)
  },
  {
    id: "pais",
    etiqueta: "País del IBAN",
    vacio: "Indica el país del IBAN.",
    error: "Ese país no está admitido en el esquema SEPA.",
    prueba: v => Object.hasOwn(LONGITUDES, v)
  },
  {
    id: "control",
    etiqueta: "Dígitos de control del IBAN",
    vacio: "Faltan las dos cifras de control del IBAN.",
    error: "Dos cifras, sin letras.",
    prueba: v => /^\d{2}$/.test(v)
  },
  {
    id: "entidad",
    etiqueta: "Entidad",
    vacio: "Falta el código de la entidad.",
    error: "Cuatro cifras.",
    prueba: v => /^\d{4}$/.test(v)
  },
  {
    id: "oficina",
    etiqueta: "Oficina",
    vacio: "Falta el código de la oficina.",
    error: "Cuatro cifras.",
    prueba: v => /^\d{4}$/.test(v)
  },
  {
    id: "dc",
    etiqueta: "Dígitos de control de la cuenta",
    vacio: "Faltan los dos dígitos de control de la cuenta.",
    error: "Dos cifras.",
    prueba: v => /^\d{2}$/.test(v)
  },
  {
    id: "cuenta",
    etiqueta: "Número de cuenta",
    vacio: "Falta el número de cuenta.",
    error: "Solo cifras, y las que falten hasta completar el IBAN del país.",
    prueba: v => {
      if (!/^\d+$/.test(v)) return false;
      const largo = LONGITUDES[el("pais").value];
      if (!largo) return true;
      return v.length === largo - 14;
    }
  },
  {
    id: "ibanCompleto",
    etiqueta: "IBAN completo",
    vacio: "Completa el IBAN para poder firmar el mandato.",
    error: "El IBAN no supera la comprobación módulo 97. Revisa las cifras de control.",
    prueba: () => {
      const partes =ibanTroceado();
      if (partes === null) return false;
      const largo = LONGITUDES[el("pais").value];
      return partes.recompuesto.length === largo && modulo97(partes.recompuesto) === 1;
    }
  },
  {
    id: "periodicidad",
    etiqueta: "Periodicidad",
    vacio: "Elige cada cuánto se cobra la cuota.",
    error: "Esa periodicidad no está en la lista.",
    prueba: v => PERIODOS.includes(v)
  },
  {
    id: "firma",
    etiqueta: "Fecha de firma",
    vacio: "Indica cuándo firmas el mandato.",
    error: "La fecha de firma no puede estar en el futuro.",
    prueba: v => /^\d{4}-\d{2}-\d{2}$/.test(v) && v <= hoy()
  },
  {
    id: "primer",
    etiqueta: "Primer adeudo",
    vacio: "Indica la fecha del primer adeudo.",
    error: "El primer adeudo tiene que ser posterior a la firma y no más de 14 días antes de vencer.",
    prueba: v => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
      if (el("firma").value && v < el("firma").value) return false;
      return v <= hoy();
    }
  },
  {
    id: "cuota",
    etiqueta: "Importe de la cuota",
    vacio: "Escribe el importe de cada cuota en euros.",
    error: "Un número entre 0,01 y 500000,00 con coma o punto decimal.",
    prueba: v => {
      if (!/^\d{1,6}([.,]\d{1,2})?$/.test(v)) return false;
      const n = Number(v.replaceAll(',', "."));
      return n >= 0.01 && n <= 500000;
    }
  },
  {
    id: "cuotas",
    etiqueta: "Número de cuotas",
    vacio: "Indica cuántas cuotas se van a cobrar.",
    error: "Un número entero entre 1 y 360. Con pago único tiene que ser 1.",
    prueba: v => {
      if (!/^\d{1,3}$/.test(v)) return false;
      const n = Number(v);
      if (n < 1 || n > 360) return false;
      if (el("periodicidad").value === "unica" && n !== 1) return false;
      return true;
    }
  },
  {
    id: "acreedor",
    etiqueta: "Referencia del acreedor",
    vacio: "Falta el identificador de mandato del acreedor.",
    error: "Formato ES seguido de 22 caracteres alfanuméricos en mayúsculas.",
    prueba: v => /^ES[0-9A-Z]{22}$/.test(v)
  },
  {
    id: "concepto",
    etiqueta: "Concepto del adeudo",
    vacio: "Escribe el concepto que verá el titular en el extracto.",
    error: "Entre 5 y 140 caracteres.",
    prueba: v => v.length >= 5 && v.length <= 140
  }
];

const FILAS = [
  ["titular"],
  ["pais", "control", "entidad", "oficina", "dc"],
  ["cuenta", "periodicidad"],
  ["firma", "primer"],
  ["cuota", "cuotas"],
  ["acreedor"],
  ["concepto"]
];

function el(id) { return document.getElementById(id); }

function hoy() {
  const a = new Date();
  const dos = n => String(n).padStart(2, "0");
  return a.getFullYear() + "-" + dos(a.getMonth() + 1) + "-" + dos(a.getDate());
}

function euros(n) {
  return n.toFixed(2).replace(".", ",") + " €";
}

function limpiarIban() {
  return (el("pais").value + el("control").value + el("entidad").value +
    el("oficina").value + el("dc").value + el("cuenta").value).replace(/\s/g, "").toUpperCase();
}

function ibanTroceado() {
  const p = el("pais").value;
  const c = el("control").value;
  const e = el("entidad").value;
  const o = el("oficina").value;
  const d = el("dc").value;
  const k = el("cuenta").value;
  if (!p || !/^\d{2}$/.test(c) || !/^\d{4}$/.test(e) || !/^\d{4}$/.test(o) || !/^\d{2}$/.test(d) || !/^\d+$/.test(k)) return null;
  return { recompuesto: (p + c + e + o + d + k).toUpperCase() };
}

function modulo97(iban) {
  const reordenado = iban.slice(4) + iban.slice(0, 4);
  let resto = 0;
  for (let i = 0; i < reordenado.length; i++) {
    const c = reordenado.charAt(i);
    const digitos = /\d/.test(c) ? c : String(c.codePointAt(0) - 55);
    for (let k = 0; k < digitos.length; k++) {
      resto = (resto * 10 + Number(digitos.charAt(k))) % 97;
    }
  }
  return resto;
}

function agrupar(iban) {
  return iban.replace(/(.{4})/g, "$1 ").trim();
}

function pintar(f) {
  const lectura = f.id === "ibanCompleto";
  const control = lectura ? document.getElementById("ibanCompleto") : el(f.id);
  const env = control.closest(".campo");
  const ayuda = el(f.id + "-ayuda");
  const error = el(f.id + "-error");
  const valor = lectura ? "" : el(f.id).value.trim();
  const malo = !f.prueba(lectura ? null : valor);
  const desc = [ayuda.id];
  const vacio = lectura ? limpiarIban().length < 24 : valor === "";

  if (malo) {
    env.dataset.estado = "error";
    desc.push(error.id);
    error.textContent = vacio ? f.vacio : f.error;
    if (!lectura) control.setAttribute("aria-invalid", "true");
  } else {
    env.dataset.estado = "ok";
    if (!lectura) control.removeAttribute("aria-invalid");
  }
  if (!lectura) control.setAttribute("aria-describedby", desc.join(" "));
  return malo;
}

function actualizarIban() {
  const completo = limpiarIban();
  el("ibanCompleto").textContent = completo.length >= 4
    ? agrupar(completo)
    : (el("pais").value || "ES") + "00 0000 0000 0000 0000 0000 00";
  el("cuenta").maxLength = 20;
  if (el("pais").value && LONGITUDES[el("pais").value]) {
    el("cuenta").maxLength = LONGITUDES[el("pais").value] - 14;
  }
  const tramo = el("cuenta").maxLength;
  el("cuenta").placeholder = "0".repeat(Math.min(tramo, 12));
  if (el("cuenta").value.length > tramo) el("cuenta").value = el("cuenta").value.slice(0, tramo);
}

function actualizarTotal() {
  const cuota = Number(el("cuota").value.replaceAll(',', "."));
  const cuotas = Number(el("cuotas").value);
  const ok1 = !Number.isNaN(cuota) && cuota > 0;
  const ok2 = !Number.isNaN(cuotas) && cuotas > 0;
  el("totalMandato").textContent = ok1 && ok2 ? euros(cuota * cuotas) : "0,00 €";
  const per = el("periodicidad").value;
  el("formulaTotal").textContent = ok2 ? "= C7 &times; " + cuotas : "= C7 &times; C8";
  return { cuota: ok1 ? cuota : 0, cuotas: ok2 ? cuotas : 0, per: per };
}

CAMPOS.filter(f => f.id !== "ibanCompleto").forEach(f => {
  const control = el(f.id);
  const evento = control.tagName === "SELECT" || control.type === "date" ? "change" : "blur";
  control.addEventListener(evento, () => pintar(f));
  control.addEventListener("input", () => {
    if (control.closest(".campo").dataset.estado === "error") pintar(f);
    if (f.id === "pais" || f.id === "control" || f.id === "entidad" || f.id === "oficina" || f.id === "dc" || f.id === "cuenta") {
      actualizarIban();
      if (el("pais").closest(".campo").dataset.estado !== "neutro") pintar(CAMPOS.find(x => x.id === "ibanCompleto"));
    }
    if (f.id === "cuota" || f.id === "cuotas" || f.id === "periodicidad") actualizarTotal();
    if (f.id === "firma" && el("primer").value) pintar(CAMPOS.find(x => x.id === "primer"));
  });
});

el("pais").addEventListener("change", () => {
  actualizarIban();
  pintar(CAMPOS.find(x => x.id === "pais"));
  if (el("cuenta").closest(".campo").dataset.estado !== "neutro") pintar(CAMPOS.find(x => x.id === "cuenta"));
  if (document.getElementById("ibanCompleto").closest(".campo").dataset.estado !== "neutro") pintar(CAMPOS.find(x => x.id === "ibanCompleto"));
});

["control", "entidad", "oficina", "dc"].forEach(id => {
  el(id).addEventListener("input", () => {
    el(id).value = el(id).value.replace(/\D/g, "");
    actualizarIban();
  });
});

el("cuenta").addEventListener("input", () => {
  el("cuenta").value = el("cuenta").value.replace(/\D/g, "");
  actualizarIban();
});

el("cuotas").addEventListener("input", () => {
  el("cuotas").value = el("cuotas").value.replace(/\D/g, "");
  actualizarTotal();
});

el("cuota").addEventListener("input", () => {
  let v = el("cuota").value.replace(/[^\d.,]/g, "");
  const partes = v.split(/[.,]/);
  if (partes.length > 2) v = partes[0] + "," + partes.slice(1).join("");
  el("cuota").value = v;
  actualizarTotal();
});

el("acreedor").addEventListener("input", () => {
  el("acreedor").value = el("acreedor").value.toUpperCase().replace(/[^0-9A-Z]/g, "").slice(0, 24);
});

function problems() {
  return CAMPOS.filter(f => !f.prueba(f.id === "ibanCompleto" ? null : el(f.id).value.trim()));
}

function indice(control) {
  for (let f = 0; f < FILAS.length; f++) {
    const pos = FILAS[f].indexOf(control);
    if (pos !== -1) return { fila: f, col: pos };
  }
  return null;
}

form.addEventListener("keydown", e => {
  const control = e.target;
  if (!control || !control.tagName) return;
  const esCampo = ["INPUT", "SELECT", "TEXTAREA"].includes(control.tagName);
  if (!esCampo) return;
  const pos = indice(control.id);
  if (!pos) return;

  if (e.key === "ArrowDown" || (e.key === "Enter" && control.tagName !== "SELECT")) {
    e.preventDefault();
    const destino = FILAS[Math.min(FILAS.length - 1, pos.fila + 1)][Math.min(pos.col, FILAS[Math.min(FILAS.length - 1, pos.fila + 1)].length - 1)];
    el(destino).focus();
    el(destino).select && el(destino).select();
    return;
  }

  if (e.key === "ArrowUp") {
    e.preventDefault();
    const fila = Math.max(0, pos.fila - 1);
    const destino = FILAS[fila][Math.min(pos.col, FILAS[fila].length - 1)];
    el(destino).focus();
    el(destino).select && el(destino).select();
    return;
  }

  if (e.key === "ArrowLeft" && control.selectionStart === 0) {
    e.preventDefault();
    if (pos.col > 0) {
      el(FILAS[pos.fila][pos.col - 1]).focus();
      return;
    }
  }

  if (e.key === "ArrowRight" && control.selectionStart === control.value.length) {
    e.preventDefault();
    const siguiente = FILAS[pos.fila][pos.col + 1];
    if (siguiente) el(siguiente).focus();
  }
});

form.addEventListener("submit", e => {
  e.preventDefault();
  CAMPOS.forEach((...args) => pintar(...args));
  const fallos = problems();

  if (fallos.length > 0) {
    tituloError.textContent = fallos.length === 1
      ? "Falta corregir una celda"
      : "Faltan " + fallos.length + " celdas por corregir";
    listaError.innerHTML = "";
    fallos.forEach(f => {
      const li = document.createElement("li");
      const vacio = f.id === "ibanCompleto" ? limpiarIban().length < 24 : el(f.id).value.trim() === "";
      li.textContent = f.etiqueta + ": " + (vacio ? f.vacio : f.error);
      listaError.appendChild(li);
    });
    resumenError.hidden = false;
    if (fallos[0].id === "ibanCompleto") {
      el("pais").focus();
    } else {
      el(fallos[0].id).focus();
    }
    return;
  }

  resumenError.hidden = true;
  const t = actualizarTotal();
  const hoyTxt = el("firma").value.split("-").reverse().join("/");
  el("mId").textContent = "SEPA-2024-0917 · " + el("acreedor").value;
  el("mTitular").textContent = el("titular").value.trim();
  el("mIban").textContent = agrupar(limpiarIban());
  el("mCuota").textContent = euros(t.cuota) + " × " + t.cuotas + " (" + el("periodicidad").options[el("periodicidad").selectedIndex].text.toLowerCase() + ")";
  el("mTotal").textContent = euros(t.cuota * t.cuotas);
  el("mPrimer").textContent = el("primer").value.split("-").reverse().join("/") + ", firmado el " + hoyTxt;
  el("mandatoTexto").textContent = "Tu banco ha recibido la orden. Puedes consultarla y cancelarla desde tu banca en cualquier momento.";
  form.hidden = true;
  document.querySelector(".barra-latex").hidden = true;
  mandato.hidden = false;
  mandato.focus();
});

el("otro").addEventListener("click", () => {
  form.reset();
  form.hidden = false;
  document.querySelector(".barra-latex").hidden = false;
  mandato.hidden = true;
  CAMPOS.forEach(f => {
    const env = el(f.id).closest(".campo");
    env.dataset.estado = "neutro";
    if (f.id !== "ibanCompleto") {
      el(f.id).removeAttribute("aria-invalid");
      el(f.id).setAttribute("aria-describedby", f.id + "-ayuda");
    }
    el(f.id + "-error").textContent = "";
  });
  actualizarIban();
  actualizarTotal();
  el("titular").focus();
});

actualizarIban();
actualizarTotal();
