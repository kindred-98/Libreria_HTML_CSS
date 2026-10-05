const form = document.getElementById("form");
const hilo = document.getElementById("hilo");
const paso = document.getElementById("paso");
const resumenError = document.getElementById("resumenError");
const listaError = document.getElementById("resumenErrorLista");
const tituloError = document.getElementById("resumenErrorTitulo");
const enviar = document.getElementById("enviar");
const enviarTexto = document.getElementById("enviarTexto");
const pista = document.getElementById("redactorPista");
const chatSello = document.getElementById("chatSello");
const dossierArco = document.getElementById("dossierArco");
const dossierPct = document.getElementById("dossierPct");
const dossierPasos = document.getElementById("dossierPasos");
const dossierDatos = document.getElementById("dossierDatos");
const firmado = document.getElementById("firmado");

const TIRADOS = ["mailinator.com", "guerrillamail.com", "tempmail.example", "yopmail.com"];
const LETRAS_CONTROL = "TRWAGMYFPDXBNJZSQVHLCKE";
const VALORES_CONTROL = {
  "0": 14, "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9,
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9, J: 10, K: 11, L: 12, M: 13,
  N: 14, O: 15, P: 16, Q: 17, R: 18, S: 19, T: 20, U: 21, V: 22, W: 23
};

const PAISES = [
  { codigo: "ES", nombre: "Spain", forma: /^ES[0-9A-Z]\d{7}[0-9A-Z]$/, largo: "ES, a letter, seven digits and one check letter" },
  { codigo: "DE", nombre: "Germany", forma: /^DE\d{9}$/, largo: "DE and nine digits" },
  { codigo: "FR", nombre: "France", forma: /^FR[A-Z0-9]{2}\d{9}$/, largo: "FR, two characters and nine digits" },
  { codigo: "PT", nombre: "Portugal", forma: /^PT\d{9}$/, largo: "PT and nine digits" },
  { codigo: "NL", nombre: "Netherlands", forma: /^NL\d{9}B\d{2}$/, largo: "NL, nine digits, B and two digits" },
  { codigo: "IE", nombre: "Ireland", forma: /^IE\d{7}[A-Z]{1,2}$/, largo: "IE, seven digits and one or two letters" },
  { codigo: "IT", nombre: "Italy", forma: /^IT\d{11}$/, largo: "IT and eleven digits" },
  { codigo: "SE", nombre: "Sweden", forma: /^SE\d{12}$/, largo: "SE and twelve digits" }
];

const TAMANOS = [
  { clave: "micro", texto: "1 to 10 people", extra: "a single team" },
  { clave: "pymes", texto: "11 to 50 people", extra: "one department" },
  { clave: "media", texto: "51 to 200 people", extra: "several departments" },
  { clave: "grande", texto: "more than 200", extra: "a whole company" }
];

const SERVICIOS = [
  { clave: "datos", texto: "Data warehouse", nota: "nightly loads into your own bucket" },
  { clave: "soporte", texto: "Support SLA", nota: "a named engineer and a response time" },
  { clave: "integraciones", texto: "Integrations", nota: "connectors to your existing tools" },
  { clave: "formacion", texto: "Team training", nota: "two remote sessions in the first month" }
];

const FRANJAS = [
  { clave: "manana", texto: "Morning, 9 to 13" },
  { clave: "tarde", texto: "Afternoon, 15 to 19" }
];

const PASOS = [
  {
    id: "razon",
    etiqueta: "Company",
    titulo: "To start: what is the legal name of the company?",
    control: "texto",
    resumen: "Legal name",
    idCampo: "razonSocial",
    etiquetaCampo: "Legal company name",
    micro: "Between 3 and 60 characters, the same as on your tax invoice.",
    ayuda: "This exact string goes on the first invoice and on the data processing agreement.",
    placeholder: "Brightlane Logistics S.L."
  },
  {
    id: "tamano",
    etiqueta: "Head count",
    titulo: "How many people work in the company right now?",
    control: "opciones",
    resumen: "Head count"
  },
  {
    id: "iva",
    etiqueta: "VAT number",
    titulo: "And the VAT number for the country you are billing from?",
    control: "iva",
    resumen: "VAT number"
  },
  {
    id: "correo",
    etiqueta: "Billing contact",
    titulo: "Who should receive invoices and the login? Give us one email address.",
    control: "texto",
    idCampo: "correoFacturacion",
    etiquetaCampo: "Billing contact email",
    micro: "A real inbox you read. We send the contract and the invoice there.",
    ayuda: "It has to look like name@domain.com and it cannot be a throwaway inbox.",
    placeholder: "finance@brightlane.example"
  },
  {
    id: "servicios",
    etiqueta: "Scope",
    titulo: "Which of these four do you actually need? Pick as many as apply.",
    control: "multi",
    resumen: "Scope"
  },
  {
    id: "arranque",
    etiqueta: "Go live",
    titulo: "When would you like to go live? Give us a day and a slot.",
    control: "fecha",
    resumen: "Go live"
  },
  {
    id: "revision",
    etiqueta: "Review",
    titulo: "That is everything. Read it back and sign when it looks right.",
    control: "revision",
    resumen: "Review"
  }
];

const REACCIONES = {
  razon: v => "Noted. " + v + " is what will appear on the invoices, so tell me now if a character is wrong.",
  tamano: v => "Thanks. I will size the workspace accordingly and leave the migration budget on the conservative side.",
  iva: v => "The check digit matches, so the number is good. I can already look up your country record.",
  correo: v => "Perfect. The contract and the first invoice go to " + v + ", and nobody else is written to.",
  servicios: v => "Good list. I will put " + v + " into the statement of work and flag the rest as optional.",
  arranque: v => "Booked provisionally for " + v + ". If someone from the platform team calls you that morning, it is legitimate."
};

const ETIQUETA_TAMANO = TAMANOS.map(t => t.texto);
const ETIQUETA_SERVICIO = SERVICIOS.map(s => s.texto);
const ETIQUETA_FRANJA = FRANJAS.map(f => f.texto);
const ETIQUETA_PAIS = PAISES.map(p => p.nombre);

const st = {
  indice: 0,
  razon: "",
  tamano: "",
  pais: "",
  iva: "",
  correo: "",
  servicios: [],
  arranque: "",
  franja: ""
};

function el(id) { return document.getElementById(id); }

function nodo(etiqueta, clase, texto) {
  const n = document.createElement(etiqueta);
  if (clase) n.className = clase;
  if (texto !== undefined) n.textContent = texto;
  return n;
}

function dos(n) { return String(n).padStart(2, "0"); }

function hoyISO() {
  const d = new Date();
  return d.getFullYear() + "-" + dos(d.getMonth() + 1) + "-" + dos(d.getDate());
}

function limiteISO(dias) {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return d.getFullYear() + "-" + dos(d.getMonth() + 1) + "-" + dos(d.getDate());
}

function fechaLarga(iso) {
  const p = iso.split("-");
  const meses = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return Number(p[2]) + " " + meses[Number(p[1]) - 1] + " " + p[0];
}

function paisActual() {
  for (const pais of PAISES) if (pais.codigo === st.pais) return pais;
  return null;
}

function ivaEspanolValido(cuerpo) {
  let suma = 0;
  for (let i = 0; i < 8; i++) {
    const v = VALORES_CONTROL[cuerpo.charAt(i)];
    if (v === undefined) return false;
    suma += (i % 2 === 0) ? v : v * 2;
  }
  return LETRAS_CONTROL.charAt(suma % 23) === cuerpo.charAt(8);
}

function textoDe(pasoActual) {
  if (pasoActual === "razon") return st.razon;
  if (pasoActual === "tamano") return TAMANOS.filter(t => t.clave === st.tamano).map(t => t.texto)[0] || "";
  if (pasoActual === "iva") return st.iva ? st.iva : "";
  if (pasoActual === "correo") return st.correo;
  if (pasoActual === "servicios") return SERVICIOS.filter(s => st.servicios.includes(s.clave)).map(s => s.texto).join(", ");
  if (pasoActual === "arranque") return st.arranque ? fechaLarga(st.arranque) + ", " + (FRANJAS.filter(f => f.clave === st.franja).map(f => f.texto)[0] || "") : "";
  return "";
}

function Fallos(p) {
  const out = [];
  if (p.control === "texto") {
    const v = st[p.id].trim();
    if (v === "") out.push({ campo: p.idCampo, mensaje: p.ayuda });
    else if (p.id === "razon" && (v.length < 3 || v.length > 60 || !/[a-zA-Z]/.test(v))) {
      out.push({ campo: p.idCampo, mensaje: "Between 3 and 60 characters, and at least one letter. That is the limit the invoicing system accepts." });
    } else if (p.id === "correo" && !/^[^\s@,;]+@[^\s@,;]+\.[a-zA-Z]{2,}$/.test(v)) {
      out.push({ campo: p.idCampo, mensaje: "That is not the shape name@domain.com that the mail server expects." });
    } else if (p.id === "correo" && TIRADOS.includes(v.split("@")[1].toLowerCase())) {
      out.push({ campo: p.idCampo, mensaje: v.split("@")[1] + " is a throwaway inbox. Contracts do not go to those." });
    }
  }
  if (p.control === "opciones" && ETIQUETA_TAMANO.includes(textoDe(p.id))) {
    out.push({ campo: "tamanoFichas", mensaje: "Choose one of the four head counts. There is no free text on this one." });
  }
  if (p.control === "iva") {
    const p2 = paisActual();
    if (st.pais === "") out.push({ campo: "paisIva", mensaje: "Say which country you are billing from, otherwise we cannot check the number." });
    if (st.iva === "") out.push({ campo: "ivaNumero", mensaje: "The VAT number is empty. We cannot invoice without it." });
    else if (!p2) out.push({ campo: "ivaNumero", mensaje: "Pick a country before we check the number." });
    else if (!p2.forma.test(st.iva)) out.push({ campo: "ivaNumero", mensaje: "For " + p2.nombre + " the format is " + p2.largo + ". You sent " + st.iva + "." });
    else if (p2.codigo === "ES" && !ivaEspanolValido(st.iva.substring(2))) {
      out.push({ campo: "ivaNumero", mensaje: "The last letter does not match the check digit. It should be " + LETRAS_CONTROL.charAt(sumaControl(st.iva.substring(2, 10))) + "." });
    }
  }
  if (p.control === "multi" && st.servicios.length === 0) {
    out.push({ campo: "serviciosMarcas", mensaje: "Nothing is selected. Pick at least one line, we cannot scope an empty project." });
  }
  if (p.control === "fecha") {
    if (st.arranque === "") out.push({ campo: "arranqueFecha", mensaje: "Choose a day for the go live. The first available slot is fifteen days out." });
    else if (st.arranque < limiteISO(1) || st.arranque > limiteISO(90)) {
      out.push({ campo: "arranqueFecha", mensaje: "Between tomorrow and " + fechaLarga(limiteISO(90)) + ". Outside that window the platform team cannot staff it." });
    }
    if (FRANJAS.filter(f => f.clave === st.franja).length === 0) {
      out.push({ campo: "arranqueFranja", mensaje: "Pick a slot. Mornings are usually quieter for a first session." });
    }
  }
  return out;
}

function sumaControl(cuerpo) {
  let suma = 0;
  for (let i = 0; i < 8; i++) {
    const v = VALORES_CONTROL[cuerpo.charAt(i)];
    if (v === undefined) return 0;
    suma += (i % 2 === 0) ? v : v * 2;
  }
  return suma % 23;
}

function campoEnvolvente(idCampo) {
  const n = el(idCampo);
  return n ? n.closest(".campo") : null;
}

function pintarCampo(idCampo, mala, mensaje) {
  const env = campoEnvolvente(idCampo);
  if (!env) return;
  env.dataset.estado = mala ? "error" : "ok";
  const control = el(idCampo);
  const ayuda = el(idCampo + "-ayuda");
  const err = el(idCampo + "-err");
  const controlReal = control.tagName === "DIV" ? control.querySelector("input, select") : control;
  const described = [ayuda.id];
  if (mala) {
    described.push(err.id);
    err.textContent = mensaje;
    if (controlReal) controlReal.setAttribute("aria-invalid", "true");
  } else {
    err.textContent = "";
    if (controlReal) controlReal.setAttribute("aria-invalid", "false");
  }
  const describedBy = described.join(" ");
  // If/else simplificado: las dos ramas escribian el mismo atributo, asi que da
  // igual que el control sea el contenedor o el input de dentro.
  control.setAttribute("aria-describedby", describedBy);
}

function pintarPaso() {
  const p = PASOS[st.indice];
  paso.innerHTML = "";
  resumenError.hidden = true;
  enviarTexto.textContent = p.control === "revision" ? "Sign the dossier" : "Send answer";
  pista.textContent = (p.control === "opciones" || p.control === "multi")
    ? "Chips are the answer here. Click one, then send."
    : "Press Enter to send. Nothing is written down until you sign.";

  if (p.control === "revision") {
    montarRevision(p);
    return;
  }

  paso.appendChild(nodo("p", "paso__pregunta", "Step " + (st.indice + 1) + " of 6  " + p.etiqueta));
  paso.appendChild(nodo("h2", "paso__titulo", p.titulo));

  if (p.control === "texto") montarTexto(p);
  if (p.control === "opciones") montarOpciones(p);
  if (p.control === "iva") montarIva(p);
  if (p.control === "multi") montarMulti(p);
  if (p.control === "fecha") montarFecha(p);

  const primero = paso.querySelector("input, select, button");
  if (primero) primero.focus();
}

function campoNuevo(idCampo, etiqueta, micro, control) {
  const env = nodo("div", "campo");
  env.dataset.estado = "neutro";
  env.appendChild(nodo("label", null, etiqueta)).htmlFor = idCampo;
  env.appendChild(control);
  const ayuda = nodo("p", "ayuda", micro);
  ayuda.id = idCampo + "-ayuda";
  const err = nodo("p", "err");
  err.id = idCampo + "-err";
  err.setAttribute("role", "alert");
  env.appendChild(ayuda);
  env.appendChild(err);
  return env;
}

function montarTexto(p) {
  const entrada = document.createElement("input");
  entrada.type = "text";
  entrada.id = p.idCampo;
  entrada.name = p.idCampo;
  entrada.autocomplete = p.id === "correo" ? "email" : "organization";
  entrada.spellcheck = false;
  entrada.maxLength = 60;
  entrada.placeholder = p.placeholder;
  entrada.value = st[p.id];
  entrada.setAttribute("aria-describedby", p.idCampo + "-ayuda");
  const caja = nodo("div", "caja");
  caja.appendChild(nodo("span", "marca-tipo", p.id === "correo" ? "email" : "text"));
  caja.appendChild(entrada);
  paso.appendChild(campoNuevo(p.idCampo, p.etiquetaCampo, p.ayuda, caja));
  entrada.addEventListener("blur", () => comprobarActual());
  entrada.addEventListener("input", () => {
    st[p.id] = entrada.value;
    if (campoEnvolvente(p.idCampo).dataset.estado === "error") comprobarActual();
  });
}

function montarOpciones(p) {
  const env = nodo("div", "campo");
  env.dataset.estado = "neutro";
  env.id = "tamanoFichas";
  const caja = nodo("div", "fichas");
  caja.setAttribute("role", "group");
  caja.setAttribute("aria-describedby", "tamanoFichas-ayuda");
  TAMANOS.forEach(t => {
    const b = nodo("button", "ficha");
    b.type = "button";
    b.setAttribute("aria-pressed", st.tamano === t.clave ? "true" : "false");
    b.appendChild(nodo("i"));
    b.appendChild(nodo("span", null, t.texto));
    b.addEventListener("click", () => {
      st.tamano = t.clave;
      caja.querySelectorAll(".ficha").forEach(x => x.setAttribute("aria-pressed", "false"));
      b.setAttribute("aria-pressed", "true");
      comprobarActual();
      b.focus();
    });
    caja.appendChild(b);
  });
  env.appendChild(caja);
  const ayuda = nodo("p", "ayuda", "It sets the workspace size and the migration budget. We can change it later without losing anything.");
  ayuda.id = "tamanoFichas-ayuda";
  const err = nodo("p", "err");
  err.id = "tamanoFichas-err";
  err.setAttribute("role", "alert");
  env.appendChild(ayuda);
  env.appendChild(err);
  paso.appendChild(env);
  caja.querySelector(".ficha").focus();
}

function montarIva(p) {
  const sel = document.createElement("select");
  sel.id = "paisIva";
  sel.name = "paisIva";
  sel.setAttribute("aria-describedby", "paisIva-ayuda");
  sel.appendChild(new Option("Choose a country", ""));
  PAISES.forEach(x => sel.appendChild(new Option(x.nombre, x.codigo)));
  sel.value = st.pais;
  sel.addEventListener("change", () => {
    st.pais = sel.value;
    el("ivaNumero").value = st.iva = "";
    if (st.pais) {
      el("ivaNumero").value = st.iva = st.pais;
    }
    comprobarActual();
  });
  const cajaPais = nodo("div", "caja");
  cajaPais.appendChild(nodo("span", "marca-tipo", "country"));
  cajaPais.appendChild(sel);
  paso.appendChild(campoNuevo("paisIva", "Billing country", "The prefix of the number has to match this country.", cajaPais));

  const entrada = document.createElement("input");
  entrada.type = "text";
  entrada.id = "ivaNumero";
  entrada.name = "ivaNumero";
  entrada.spellcheck = false;
  entrada.maxLength = 16;
  entrada.placeholder = "ESB12345675";
  entrada.value = st.iva;
  entrada.setAttribute("aria-describedby", "ivaNumero-ayuda");
  entrada.addEventListener("input", () => {
    let v = entrada.value.toUpperCase().replace(/[^0-9A-Z]/g, "");
    if (st.pais && v.indexOf(st.pais) !== 0) v = st.pais + v;
    if (st.pais && v.length > st.pais.length + 13) v = v.slice(0, st.pais.length + 13);
    if (!st.pais && v.length > 15) v = v.slice(0, 15);
    st.iva = entrada.value = v;
    if (campoEnvolvente("ivaNumero").dataset.estado === "error") comprobarActual();
  });
  entrada.addEventListener("blur", () => comprobarActual());
  const caja = nodo("div", "caja");
  caja.appendChild(nodo("span", "marca-tipo", "vat"));
  caja.appendChild(entrada);
  const micro = paisActual()
    ? "We check the length and, for Spain, the check letter. Try " + st.pais + "B1234567T to see it pass."
    : "Pick a country and we will tell you the exact shape. We check the length and, for Spain, the check letter.";
  paso.appendChild(campoNuevo("ivaNumero", "VAT number", micro, caja));
}

function montarMulti(p) {
  const env = nodo("div", "campo");
  env.dataset.estado = "neutro";
  env.id = "serviciosMarcas";
  const caja = nodo("div", "marcas");
  caja.setAttribute("role", "group");
  caja.setAttribute("aria-describedby", "serviciosMarcas-ayuda");
  SERVICIOS.forEach(s => {
    const b = nodo("button", "marca");
    b.type = "button";
    b.setAttribute("aria-pressed", st.servicios.includes(s.clave) ? "true" : "false");
    b.appendChild(nodo("span", "marca__punto"));
    const txt = nodo("span");
    txt.appendChild(document.createTextNode(s.texto));
    const nota = nodo("small", null, s.nota);
    nota.style.cssText = "display:block;font:500 .66rem/1.3 var(--mono);color:rgba(232,241,247,.42);margin-top:2px";
    txt.appendChild(nota);
    b.appendChild(txt);
    b.addEventListener("click", () => {
      const i = st.servicios.indexOf(s.clave);
      if (i > -1) st.servicios.splice(i, 1);
      else st.servicios.push(s.clave);
      b.setAttribute("aria-pressed", i > -1 ? "false" : "true");
      comprobarActual();
      b.focus();
    });
    caja.appendChild(b);
  });
  env.appendChild(caja);
  const ayuda = nodo("p", "ayuda", "At least one. Anything left unticked is quoted as optional in the statement of work.");
  ayuda.id = "serviciosMarcas-ayuda";
  const err = nodo("p", "err");
  err.id = "serviciosMarcas-err";
  err.setAttribute("role", "alert");
  env.appendChild(ayuda);
  env.appendChild(err);
  paso.appendChild(env);
  caja.querySelector(".marca").focus();
}

function montarFecha(p) {
  const entrada = document.createElement("input");
  entrada.type = "date";
  entrada.id = "arranqueFecha";
  entrada.name = "arranqueFecha";
  entrada.min = limiteISO(1);
  entrada.max = limiteISO(90);
  entrada.value = st.arranque;
  entrada.setAttribute("aria-describedby", "arranqueFecha-ayuda");
  entrada.addEventListener("change", () => {
    st.arranque = entrada.value;
    comprobarActual();
  });
  entrada.addEventListener("blur", () => comprobarActual());
  const caja = nodo("div", "caja");
  caja.appendChild(nodo("span", "marca-tipo", "day"));
  caja.appendChild(entrada);
  paso.appendChild(campoNuevo("arranqueFecha", "Preferred go live day", "Between " + fechaLarga(limiteISO(1)) + " and " + fechaLarga(limiteISO(90)) + ".", caja));

  const sel = document.createElement("select");
  sel.id = "arranqueFranja";
  sel.name = "arranqueFranja";
  sel.setAttribute("aria-describedby", "arranqueFranja-ayuda");
  sel.appendChild(new Option("Choose a slot", ""));
  FRANJAS.forEach(f => sel.appendChild(new Option(f.texto, f.clave)));
  sel.value = st.franja;
  sel.addEventListener("change", () => {
    st.franja = sel.value;
    comprobarActual();
  });
  const cajaF = nodo("div", "caja");
  cajaF.appendChild(nodo("span", "marca-tipo", "slot"));
  cajaF.appendChild(sel);
  paso.appendChild(campoNuevo("arranqueFranja", "Time slot", "Sessions run ninety minutes and include the first data load.", cajaF));
}

function montarRevision(p) {
  paso.appendChild(nodo("p", "paso__pregunta", "Step 6 of 6  " + p.etiqueta));
  paso.appendChild(nodo("h2", "paso__titulo", p.titulo));
  const caja = nodo("div", "revision");
  PASOS.slice(0, 6).forEach(x => {
    const fila = nodo("div");
    fila.appendChild(nodo("dt", null, x.resumen));
    const dd = nodo("dd", null, textoDe(x.id) || "not answered");
    if (!textoDe(x.id)) dd.style.color = "rgba(232,241,247,.35)";
    fila.appendChild(dd);
    const boton = nodo("button", "cambiar", "Change");
    boton.type = "button";
    boton.addEventListener("click", () => {
      st.indice = x.indice;
      pintarPaso();
    });
    fila.appendChild(boton);
    caja.appendChild(fila);
  });
  paso.appendChild(caja);
  paso.appendChild(nodo("p", "ayuda", "Signing means the client desk may provision the workspace and send the contract. You can still change everything afterwards from the account page."));
  const primero = paso.querySelector(".cambiar");
  if (primero) primero.focus();
}

PASOS.slice(0, 6).forEach((x, i) => { x.indice = i; });

function comprobarActual() {
  const p = PASOS[st.indice];
  if (p.control === "revision") return [];
  const fallos = Fallos(p);
  fallos.forEach(f => pintarCampo(f.campo, true, f.mensaje));
  const libre = campo => fallos.filter(f => f.campo === campo).length === 0;
  const primero = campo => {
    const f = fallos.filter(x => x.campo === campo);
    return f.length > 0 ? f[0].mensaje : "";
  };

  if (p.control === "texto") pintarCampo(p.idCampo, !libre(p.idCampo), primero(p.idCampo));
  if (p.control === "opciones" && libre("tamanoFichas")) {
    el("tamanoFichas").dataset.estado = "ok";
    el("tamanoFichas-err").textContent = "";
  }
  if (p.control === "iva") {
    pintarCampo("paisIva", !libre("paisIva"), primero("paisIva"));
    pintarCampo("ivaNumero", !libre("ivaNumero"), primero("ivaNumero"));
  }
  if (p.control === "multi" && libre("serviciosMarcas")) {
    el("serviciosMarcas").dataset.estado = "ok";
    el("serviciosMarcas-err").textContent = "";
  }
  if (p.control === "fecha") {
    pintarCampo("arranqueFecha", !libre("arranqueFecha"), primero("arranqueFecha"));
    pintarCampo("arranqueFranja", !libre("arranqueFranja"), primero("arranqueFranja"));
  }
  return fallos;
}

function mensajeBurbuja(tipo, cuerpo, nota) {
  const m = nodo("div", "msg msg--" + tipo);
  m.appendChild(nodo("span", null, cuerpo));
  m.appendChild(nodo("small", "msg__nota", nota));
  hilo.appendChild(m);
  hilo.scrollTop = hilo.scrollHeight;
}

function typing() {
  const d = nodo("div", "escribiendo");
  d.appendChild(nodo("i"));
  d.appendChild(nodo("i"));
  d.appendChild(nodo("i"));
  hilo.appendChild(d);
  hilo.scrollTop = hilo.scrollHeight;
}

function hora() {
  const d = new Date();
  return dos(d.getHours()) + ":" + dos(d.getMinutes());
}

function alEnviar(e) {
  e.preventDefault();
  const p = PASOS[st.indice];
  const fallos = comprobarActual();

  if (fallos.length > 0) {
    tituloError.textContent = fallos.length === 1
      ? "One detail is missing on this step"
      : fallos.length + " details are missing on this step";
    listaError.innerHTML = "";
    fallos.forEach(f => {
      const li = document.createElement("li");
      li.textContent = f.mensaje;
      listaError.appendChild(li);
    });
    resumenError.hidden = false;
    const destino = el(fallos[0].campo);
    if (destino) {
      const real = destino.tagName === "DIV" ? destino.querySelector("input, select, button") : destino;
      if (real) real.focus();
    } else {
      paso.querySelector("input, select, button").focus();
    }
    return;
  }

  resumenError.hidden = true;
  enviar.disabled = true;
  enviarTexto.textContent = "Sending";
  chatSello.textContent = "Alma is typing";
  typing();

  window.setTimeout(() => {
    const burbuja = hilo.querySelector(".escribiendo");
    if (burbuja) burbuja.remove();

    if (p.control !== "revision") {
      mensajeBurbuja("tu", textoDe(p.id), "you " + hora());
      mensajeBurbuja("ella", REACCIONES[p.id](textoDe(p.id)), "Alma " + hora());
    }

    enviar.disabled = false;
    enviarTexto.textContent = p.control === "revision" ? "Sign the dossier" : "Send answer";
    chatSello.textContent = "waiting for you";

    if (p.control === "revision") {
      firmar();
      return;
    }
    st.indice++;
    pintarDossier();
    pintarPaso();
  }, 620);
}

form.addEventListener("submit", alEnviar);

form.addEventListener("keydown", e => {
  if (e.key === "Enter" && e.target.tagName === "INPUT" && e.target.type === "text") {
    e.preventDefault();
    form.requestSubmit();
  }
});

function firmar() {
  const ref = "NG-" + String(Math.floor(1000 + Math.random() * 8999));
  el("firmadoRef").textContent = ref;
  el("dossierRef").textContent = ref;
  el("firmadoTitulo").textContent = "Welcome aboard, " + (st.razon.split(" ")[0] || "there");
  el("firmadoGoLive").textContent = st.arranque ? fechaLarga(st.arranque) : "not scheduled";
  el("firmadoVat").textContent = st.iva || "no number";
  el("firmadoLead").textContent = "Alma has the file. The contract goes to " + st.correo +
    " within the hour and the workspace is provisioned for " + st.servicios.length +
    " line" + (st.servicios.length === 1 ? "" : "s") + " of work.";

  const lista = el("firmadoPasos");
  lista.innerHTML = "";
  [
    "Contract and data processing agreement sent to " + st.correo,
    "Workspace provisioned for " + (TAMANOS.filter(t => t.clave === st.tamano).map(t => t.texto)[0] || "your head count"),
    "Kickoff session booked for " + (st.arranque ? fechaLarga(st.arranque) : "the agreed day") + " with " + (FRANJAS.filter(f => f.clave === st.franja).map(f => f.texto)[0] || "the agreed slot"),
    "Alma calls you the morning of the go live, from a number ending " + String(Math.floor(10 + Math.random() * 89))
  ].forEach((t, i) => {
    const li = document.createElement("li");
    li.textContent = t;
    li.style.animationDelay = (0.1 + i * 0.09).toFixed(2) + "s";
    lista.appendChild(li);
  });

  document.querySelector(".escena").hidden = true;
  document.querySelector(".barra").hidden = true;
  firmado.hidden = false;
  firmado.focus();
}

function pintarDossier() {
  const hechos = st.indice;
  const pct = Math.round((hechos / 6) * 100);
  document.querySelector(".dossier__anillo").style.setProperty("--pct", pct);
  dossierPct.textContent = pct + "%";
  dossierArco.setAttribute("aria-label", "Dossier " + pct + " percent complete");

  dossierPasos.innerHTML = "";
  PASOS.forEach((x, i) => {
    const li = document.createElement("li");
    li.textContent = x.etiqueta;
    let estado = "espera";
    if (i < hechos) estado = "hecho";
    else if (i === st.indice) estado = "activo";
    li.dataset.estado = estado;
    dossierPasos.appendChild(li);
  });

  dossierDatos.innerHTML = "";
  [
    ["Company", st.razon],
    ["Head count", TAMANOS.filter(t => t.clave === st.tamano).map(t => t.texto)[0] || ""],
    ["VAT", st.iva],
    ["Billing contact", st.correo],
    ["Scope", SERVICIOS.filter(s => st.servicios.includes(s.clave)).map(s => s.texto).join(", ")],
    ["Go live", st.arranque ? fechaLarga(st.arranque) : ""]
  ].forEach(par => {
    const div = document.createElement("div");
    const dt = document.createElement("dt");
    dt.textContent = par[0];
    const dd = document.createElement("dd");
    dd.textContent = par[1];
    div.appendChild(dt);
    div.appendChild(dd);
    dossierDatos.appendChild(div);
  });
}

el("otra").addEventListener("click", () => {
  firmado.hidden = true;
  document.querySelector(".escena").hidden = false;
  document.querySelector(".barra").hidden = false;
  st.indice = 0;
  st.razon = "";
  st.tamano = "";
  st.pais = "";
  st.iva = "";
  st.correo = "";
  st.servicios = [];
  st.arranque = "";
  st.franja = "";
  hilo.innerHTML = "";
  mensajeBurbuja("ella", "Hello. I am Alma and I will be your account manager from here. Six short questions and the workspace is yours. Start wherever you like.", "Alma " + hora());
  enviarTexto.textContent = "Send answer";
  pintarDossier();
  pintarPaso();
});

hilo.innerHTML = "";
mensajeBurbuja("ella", "Hello. I am Alma and I will be your account manager from here. Six short questions and the workspace is yours. Start wherever you like.", "Alma " + hora());
mensajeBurbuja("ella", "Nothing you type leaves the browser. The dossier number is only issued when you sign at the end.", "Alma " + hora());
pintarDossier();
pintarPaso();
