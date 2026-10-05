const form = document.getElementById("form");
const resumenError = document.getElementById("resumenError");
const listaError = document.getElementById("resumenLista");
const tituloError = document.getElementById("resumenTitulo");
const medidor = document.getElementById("medidor");
const medidorRelleno = document.getElementById("medidorRelleno");
const sellado = document.getElementById("sellado");

const PAISES = {
  GB: { nombre: "United Kingdom", largo: 22, eea: false },
  DE: { nombre: "Germany", largo: 22, eea: true },
  ES: { nombre: "Spain", largo: 24, eea: true },
  FR: { nombre: "France", largo: 27, eea: true },
  NL: { nombre: "Netherlands", largo: 18, eea: true },
  PT: { nombre: "Portugal", largo: 25, eea: true },
  IE: { nombre: "Ireland", largo: 22, eea: true },
  IT: { nombre: "Italy", largo: 27, eea: true },
  SE: { nombre: "Sweden", largo: 24, eea: true },
  PL: { nombre: "Poland", largo: 28, eea: false },
  US: { nombre: "United States", largo: 0, eea: false }
};

const TALLAS = { GB: [22, 22], DE: [22, 22], ES: [24, 24], FR: [27, 27], NL: [18, 18], PT: [25, 25], IE: [22, 22], IT: [27, 27], SE: [24, 24], PL: [28, 28], US: [0, 0] };

const FRECUENCIAS = {
  trimestral: "quarterly, after the split",
  mensual: "monthly, after the split",
  final: "once, when the season closes"
};

const CAMPOS = [
  {
    id: "tipo",
    etiqueta: "Type of account",
    vacio: "Say whether the account belongs to the player or to the company.",
    error: "That account type is not one the league pays.",
    tipo: "radio",
    prueba: v => v === "jugador" || v === "equipo"
  },
  {
    id: "jugador",
    etiqueta: "Player handle",
    vacio: "The handle has to match a roster entry, otherwise the treasury cannot find the contract.",
    error: "Three to eighteen characters, lower case: letters, digits, underscore and one dot.",
    prueba: v => /^[a-z0-9][a-z0-9._]{2,17}$/.test(v),
    soloSi: "jugador"
  },
  {
    id: "tag",
    etiqueta: "Roster tag",
    vacio: "The broadcast tag is what the league publishes, so it has to be there.",
    error: "Four to eight characters, upper case letters and digits only.",
    prueba: v => /^[A-Z0-9]{4,8}$/.test(v),
    soloSi: "jugador"
  },
  {
    id: "razon",
    etiqueta: "Company legal name",
    vacio: "The company account needs the name that is on the tax invoice.",
    error: "Three to forty eight characters, letters, digits, spaces, dots, commas and dashes.",
    prueba: v => v.length >= 3 && v.length <= 48 && /[A-Za-z]/.test(v),
    soloSi: "equipo"
  },
  {
    id: "iva",
    etiqueta: "Company tax number",
    vacio: "Without a tax number the league cannot pay a company account at all.",
    error: "Two upper case letters and nine digits, like GB123456789.",
    prueba: v => /^[A-Z]{2}[\d]{9}$/.test(v),
    soloSi: "equipo"
  },
  {
    id: "iban",
    etiqueta: "IBAN",
    vacio: "There is no account without an IBAN.",
    error: "That IBAN does not pass the mod ninety seven check the bank uses.",
    prueba: v => ibanValido(v)
  },
  {
    id: "titular",
    etiqueta: "Account holder",
    vacio: "The bank will not pay an account it cannot put a name on.",
    error: "Between three and forty characters, upper case, letters spaces and dots.",
    prueba: v => /^[A-Z][A-Z .'-]{2,39}$/.test(v)
  },
  {
    id: "swift",
    etiqueta: "BIC or SWIFT",
    vacio: "",
    error: "Eight or eleven characters, upper case letters and digits.",
    prueba: v => v === "" || /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(v),
    suave: true
  },
  {
    id: "direccion",
    etiqueta: "Address of the holder",
    vacio: "Cross border payouts need an address, and every league has been asked for one.",
    error: "Between ten and seventy characters, and it needs at least one digit for the house number.",
    prueba: v => v.length >= 10 && v.length <= 70 && /\d/.test(v)
  },
  {
    id: "moneda",
    etiqueta: "Prize money currency",
    vacio: "",
    error: "That currency is not on the league list.",
    prueba: v => ["eur", "usd", "gbp", "sek"].includes(v),
    suave: true
  }
];

function el(id) { return document.getElementById(id); }

function digitosIban(v) {
  return (v || "").replace(/[^A-Za-z0-9]/g, "");
}

function paisIban(v) {
  const d = digitosIban(v).toUpperCase();
  if (d.length < 2) return "";
  const p = d.substring(0, 2);
  return Object.hasOwn(PAISES, p) ? p : "";
}

function ibanValido(v) {
  const d = digitosIban(v).toUpperCase();
  if (!/^[A-Z]{2}[\d]{2}[A-Z0-9]{10,30}$/.test(d)) return false;
  const p = d.substring(0, 2);
  if (!Object.hasOwn(PAISES, p)) return false;
  const rango = TALLAS[p];
  if (rango[0] !== 0 && (d.length < rango[0] || d.length > rango[1])) return false;
  const movido = d.substring(4) + d.substring(0, 4);
  let numerically = "";
  for (let k = 0; k < movido.length; k++) {
    const c = movido.charAt(k);
    if (c >= "0" && c <= "9") numerically += c;
    else numerically += String(c.charCodeAt(0) - 55);
  }
  let resto = 0;
  for (let k = 0; k < numerically.length; k += 7) {
    resto = Number((resto + numerically.substring(k, k + 7)) % 97);
  }
  return resto === 1;
}

function tipoActual() {
  const marcado = document.querySelector('input[name="tipo"]:checked');
  return marcado ? marcado.value : "";
}

function valorCampo(f) {
  if (f.tipo === "radio") return tipoActual();
  return el(f.id).value.trim();
}

function visible(f) {
  return f.soloSi === undefined || f.soloSi === tipoActual();
}

function contenedorCampo(f) {
  if (f.tipo === "radio") return el("conjunto-tipo");
  return el(f.id).closest(".campo");
}

function controlReal(f) {
  if (f.tipo === "radio") return el("tipo-jugador");
  return el(f.id);
}

function pintarCampo(f) {
  const env = contenedorCampo(f);
  const ayuda = el(f.id + "-ayuda");
  const err = el(f.id + "-err");
  const control = controlReal(f);
  const valor = valorCampo(f);
  const vacio = valor === "";
  const malo = !f.prueba(valor);
  const fallo = f.suave ? (malo && !vacio) : malo;
  const desc = [ayuda.id];

  if (fallo) {
    env.dataset.estado = "error";
    control.setAttribute("aria-invalid", "true");
    desc.push(err.id);
    err.textContent = vacio ? f.vacio : f.error;
  } else {
    env.dataset.estado = vacio ? "neutro" : "ok";
    control.setAttribute("aria-invalid", "false");
    err.textContent = "";
  }

  env.setAttribute("aria-describedby", desc.join(" "));
  return fallo;
}

function problemas() {
  const salida = [];
  CAMPOS.filter(visible).forEach(f => {
    if (f.suave) {
      const v = valorCampo(f);
      if (v !== "" && !f.prueba(v)) salida.push(f.etiqueta + ": " + f.error);
      return;
    }
    if (!f.prueba(valorCampo(f))) {
      const v = valorCampo(f);
      let texto = v === "" ? f.vacio : f.error;
      if (f.id === "iban" && v !== "" && !ibanValido(v)) {
        const p = paisIban(v);
        if (p !== "" && !ibanValido(v) && digitosIban(v).length === TALLAS[p][0]) {
          texto = "The check digits do not add up. Re-read the number from the bank letter, digit by digit.";
        }
      }
      salida.push(f.etiqueta + ": " + texto);
    }
  });

  const t = tipoActual();
  const it = titular.value.trim();
  const jg = el("jugador").value.trim();
  const rs = el("razon").value.trim();
  const planilla = it.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (t === "jugador" && it !== "" && jg !== "") {
    const esperado = jg.replace(/[^a-z0-9]/gi, "").toUpperCase();
    if (esperado !== "" && planilla.includes(esperado)) {
      salida.push("Account holder: " + it + " does not contain the player handle " + jg + ". The league pays the name the bank holds, so a mismatch here means a returned payment and a week of delay.");
    }
  }
  if (t === "equipo" && it !== "" && rs !== "") {
    const palabras = rs.toUpperCase().split(/\s+/).filter(p => p.length > 2 && p !== "LTD" && p !== "LIMITED" && p !== "GMBH" && p !== "SL" && p !== "SAS" && p !== "BV");
    const primera = palabras[0];
    if (primera !== undefined && planilla.includes(primera.replace(/[^A-Z0-9]/g, ""))) {
      salida.push("Account holder: the registered name on the bank account does not contain " + primera + ", which is the company name. A company account has to be in the company name or the payment is returned.");
    }
  }
  return salida;
}

function mostrarResumen(fallos) {
  tituloError.textContent = fallos.length === 1
    ? "One thing is stopping the payout account"
    : fallos.length + " things are stopping the payout account";
  listaError.innerHTML = "";
  fallos.forEach(t => {
    const li = document.createElement("li");
    li.textContent = t;
    listaError.appendChild(li);
  });
  resumenError.hidden = false;
}

function enmascararIban(digitos) {
  const d = digitos.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  if (d.length < 8) return d;
  return d.substring(0, 4) + " " + d.substring(4, 6) + " XXXX XXXX XXXX " + d.substring(d.length - 4);
}

function conFormato(valor) {
  const d = digitosIban(valor).toUpperCase().substring(0, 34);
  return d.replace(/(.{4})/g, "$1 ").trim();
}

function refrescar() {
  const t = tipoActual();
  const ibanCrudo = digitosIban(el("iban").value).toUpperCase();
  const p = paisIban(ibanCrudo);
  const okIban = ibanCrudo.length > 0 && ibanValido(ibanCrudo);
  const titular = el("titular").value.trim();
  const swift = el("swift").value.trim().toUpperCase();

  el("bloque-jugador").hidden = t !== "jugador";
  el("bloque-equipo").hidden = t !== "equipo";

  el("tTipo").textContent = t === "equipo" ? "company account" : "player account";
  const razon = el("razon").value.trim();
  const jugador = el("jugador").value.trim();
  let nombre = "Payee pending";
  if (t === "equipo") nombre = razon === "" ? "Company pending" : razon;
  else if (jugador !== "") nombre = "@" + jugador;
  el("tNombre").textContent = nombre;

  const iva = el("iva").value.trim();
  const tag = el("tag").value.trim();
  let sub = "Roster tag pending";
  if (t === "equipo") sub = iva === "" ? "Tax number pending" : "Tax " + iva;
  else if (tag !== "") sub = "Broadcast tag " + tag;
  el("tSub").textContent = sub;
  el("tIban").textContent = ibanCrudo === "" ? "not set" : enmascararIban(ibanCrudo);
  el("tTitular").textContent = titular === "" ? "not set" : titular;
  el("tPais").textContent = p === "" ? "unknown" : PAISES[p].nombre;
  el("tControl").textContent = ibanCrudo === "" ? "not checked" : okIban ? "valid, mod 97 equals one" : "does not add up";
  el("tSwift").textContent = swift === "" ? "not given" : swift;

  const sello = el("paisSello");
  sello.textContent = p === "" ? "--" : p;
  if (okIban) sello.dataset.pais = "alta";
  else if (ibanCrudo.length >= 4) sello.dataset.pais = "baja";
  else delete sello.dataset.pais;

  el("iban-ayuda").textContent = ibanCrudo === ""
    ? "Type it however you like, spaces are added as you go. Two letters, two digits, then up to thirty alphanumeric characters."
    : okIban
      ? "The mod ninety seven check passes, and the length matches " + PAISES[p].nombre + " accounts."
      : "Twenty two characters for a British account, twenty seven for a French one. The check digits have to add up to one.";

  const coincidencia = el("coincidencia");
  if (titular !== "" && okIban) {
    const banco = p === "" ? "" : PAISES[p].nombre;
    coincidencia.hidden = false;
    coincidencia.dataset.ok = "1";
    coincidencia.textContent = "Name " + titular + " checked against a " + banco + " account, ready for the bank to confirm.";
  } else if (titular !== "" && !okIban) {
    coincidencia.hidden = false;
    coincidencia.dataset.ok = "0";
    coincidencia.textContent = "The name cannot be checked until the IBAN passes its own checksum.";
  } else {
    coincidencia.hidden = true;
  }

  let swiftTxt = "BIC is the right length";
  if (swift === "") swiftTxt = p !== "" && PAISES[p].eea ? "BIC not needed inside the EEA" : "BIC pending";
  const pasos = [
    { id: "iban", ok: okIban, txt: okIban ? "IBAN checksum passes" : "IBAN checksum pending" },
    { id: "titular", ok: titular !== "" && /^[A-Z][A-Z .'-]{2,39}$/.test(titular), txt: titular === "" ? "Account holder pending" : "Account holder is upper case" },
    { id: "swift", ok: swift === "" || /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(swift), txt: swiftTxt },
    { id: "t", ok: t === "jugador" ? el("jugador").value.trim() !== "" && el("tag").value.trim() !== "" : el("razon").value.trim() !== "" && el("iva").value.trim() !== "", txt: t === "jugador" ? "Roster identity complete" : "Company identity complete" }
  ];

  const caja = el("tPasos");
  caja.innerHTML = "";
  pasos.forEach(paso => {
    const li = document.createElement("li");
    li.dataset.hecho = paso.ok ? "1" : "0";
    const pt = document.createElement("span");
    pt.className = "paso-pt";
    pt.setAttribute("aria-hidden", "true");
    li.appendChild(pt);
    li.appendChild(document.createTextNode(paso.txt));
    caja.appendChild(li);
  });

  const obligatorios = CAMPOS.filter(f => !f.suave && visible(f));
  const completos = obligatorios.filter(f => f.prueba(valorCampo(f))).length;
  const total = obligatorios.length;
  const pct = Math.round((completos / total) * 100);
  medidorRelleno.style.transform = "scaleX(" + (pct / 100) + ")";
  medidor.setAttribute("aria-valuenow", String(pct));
  medidor.setAttribute("aria-valuetext", pct + " per cent of the account filled in");
  el("medidorTitulo").textContent = "Account " + pct + " % filled in";
  el("medidorFaltan").textContent = (total - completos) + (total - completos === 1 ? " field still open" : " fields still open");
}

el("iban").addEventListener("input", () => {
  el("iban").value = conFormato(el("iban").value);
  if (el("iban").closest(".campo").dataset.estado === "error") pintarCampo(CAMPOS.find(f => f.id === "iban"));
  refrescar();
});

el("swift").addEventListener("input", () => {
  el("swift").value = el("swift").value.toUpperCase().replace(/[^A-Z0-9]/g, "").substring(0, 11);
});

el("jugador").addEventListener("input", () => {
  el("jugador").value = el("jugador").value.toLowerCase().replace(/[^a-z0-9._]/g, "").substring(0, 18);
});

el("tag").addEventListener("input", () => {
  el("tag").value = el("tag").value.toUpperCase().replace(/[^A-Z0-9]/g, "").substring(0, 8);
});

el("iva").addEventListener("input", () => {
  el("iva").value = el("iva").value.toUpperCase().replace(/[^A-Z0-9]/g, "").substring(0, 16);
});

CAMPOS.forEach(f => {
  if (f.tipo === "radio") {
    el("conjunto-tipo").addEventListener("change", () => {
      pintarCampo(f);
      if (el("conjunto-tipo").dataset.estado === "ok" || el("conjunto-tipo").dataset.estado === "error") pintarCampo(f);
      refrescar();
    });
    return;
  }
  const nodo = el(f.id);
  if (f.id === "iban" || f.id === "swift" || f.id === "jugador" || f.id === "tag" || f.id === "iva") return;
  nodo.addEventListener("blur", () => pintarCampo(f));
  nodo.addEventListener("input", () => {
    if (nodo.closest(".campo").dataset.estado === "error") pintarCampo(f);
    refrescar();
  });
  nodo.addEventListener("change", () => pintarCampo(f));
});

["w8", "carta"].forEach(id => {
  el(id).addEventListener("change", () => {
    el(id).closest(".campo").dataset.estado = el(id).checked ? "ok" : "neutro";
    el(id).setAttribute("aria-invalid", "false");
  });
});

form.addEventListener("submit", e => {
  e.preventDefault();
  CAMPOS.filter(visible).forEach(f => pintarCampo(f));
  const fallos = problemas();

  if (fallos.length > 0) {
    mostrarResumen(fallos);
    const primero = CAMPOS.filter(visible).find(f => !f.suave && !f.prueba(valorCampo(f)));
    if (primero) controlReal(primero).focus();
    return;
  }

  resumenError.hidden = true;
  const t = tipoActual();
  const nombre = t === "equipo" ? el("razon").value.trim() : el("jugador").value.trim();
  const ibanTexto = enmascararIban(el("iban").value);
  const frecuencia = el("frecuencia").value;

  el("sRef").textContent = "NF-" + String(Math.floor(100000 + Math.random() * 900000));
  el("sNombre").textContent = t === "equipo" ? nombre : "@" + nombre;
  el("sIban").textContent = ibanTexto;
  el("sPago").textContent = FRECUENCIAS[frecuencia];
  el("sellTitulo").textContent = "The treasury has the account, " + nombre.split(" ")[0];
  el("sellTexto").textContent = "A test transfer of one unit goes out to " + ibanTexto +
    " within two working days. " + (el("carta").checked ? "The bank confirmation letter is on its way too." : "Ask for the bank letter in the panel if the name ever comes back.");

  form.hidden = true;
  document.querySelector(".panel").hidden = true;
  sellado.hidden = false;
  sellado.focus();
});

el("otra").addEventListener("click", () => {
  form.reset();
  CAMPOS.forEach(f => {
    contenedorCampo(f).dataset.estado = "neutro";
    el(f.id + "-err").textContent = "";
    const env = contenedorCampo(f);
    env.setAttribute("aria-describedby", f.id + "-ayuda");
    controlReal(f).setAttribute("aria-invalid", "false");
  });
  ["w8", "carta"].forEach(id => { el(id).closest(".campo").dataset.estado = "neutro"; });
  el("coincidencia").hidden = true;
  resumenError.hidden = true;
  sellado.hidden = true;
  form.hidden = false;
  document.querySelector(".panel").hidden = false;
  refrescar();
  el("tipo-jugador").focus();
});

refrescar();
