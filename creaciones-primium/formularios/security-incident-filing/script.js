const form = document.getElementById("form");
const sistema = document.getElementById("sistema");
const vector = document.getElementById("vector");
const volumen = document.getElementById("volumen");
const resumenTxt = document.getElementById("resumen");
const matriz = document.getElementById("matriz");
const matrizFilas = document.getElementById("matrizFilas");
const anexos = document.getElementById("anexos");
const analista = document.getElementById("analista");
const contacto = document.getElementById("contacto");
const btnPegar = document.getElementById("pegar");
const resumenError = document.getElementById("resumenError");
const listaError = document.getElementById("resumenLista");
const tituloError = document.getElementById("resumenTitulo");
const archivada = document.getElementById("archivada");
const cola = document.querySelector(".cola");

const SISTEMAS = {
  correo: "Mail gateway and relay",
  vpn: "Remote access and VPN",
  repo: "Source repository and CI",
  rrhh: "People and payroll records",
  almacen: "Customer data warehouse",
  portal: "Self service customer portal"
};

const VECTORES = {
  credencial: "Stolen or reused credentials",
  phishing: "Phishing or social engineering",
  software: "A vulnerable dependency or unpatched host",
  interno: "Somebody with legitimate access",
  desconocido: "Genuinely unknown"
};

const PERSONAS = {
  oyelaran: "Rina Oyelaran",
  brandt: "Tomas Brandt",
  kawae: "Mika Kawae",
  duarte: "Sofia Duarte"
};

const SEVS = ["SEV1", "SEV2", "SEV3", "SEV4"];

const CLASES = [
  { id: "credenciales", nombre: "Credentials", cod: "cred" },
  { id: "personales", nombre: "Personal records", cod: "pii" },
  { id: "financiero", nombre: "Card and bank data", cod: "pci" },
  { id: "codigo", nombre: "Source code", cod: "src" },
  { id: "comercial", nombre: "Commercial records", cod: "crm" },
  { id: "telefonia", nombre: "Call recordings", cod: "tel" }
];

const ROTAS = {
  SEV1: "duty officer, immediately",
  SEV2: "security on duty",
  SEV3: "the queue, working day",
  SEV4: "the log, no action"
};

const RELOJES = { SEV1: "24 hours", SEV2: "72 hours", SEV3: "no clock", SEV4: "no clock" };

const TIRADOS = ["example.com", "example.org", "test.local", "invalid"];

const CAMPOS = [
  {
    id: "sistema",
    etiqueta: "Affected system",
    vacio: "Pick the system that was touched, otherwise the case has no owner.",
    error: "That system is not on the estate list.",
    prueba: v => Object.hasOwn(SISTEMAS, v)
  },
  {
    id: "vector",
    etiqueta: "Entry vector",
    vacio: "Say how the access came in. Genuinely unknown is a real answer.",
    error: "That entry vector is not on the list.",
    prueba: v => Object.hasOwn(VECTORES, v)
  },
  {
    id: "severidad",
    etiqueta: "Severity",
    vacio: "Pick the worst thing true right now. The pager reads this field and nothing else.",
    error: "That severity is not one of the four.",
    tipo: "radio",
    prueba: v => SEVS.includes(v)
  },
  {
    id: "matriz",
    etiqueta: "Data classes",
    vacio: "Tick at least one class, or state on the summary that nothing was read.",
    error: "Only the six classes on the form count.",
    tipo: "grupo",
    prueba: () => clasesMarcadas().length > 0
  },
  {
    id: "resumen",
    etiqueta: "Evidence summary",
    vacio: "Write what you have actually seen. The analyst starts from these words.",
    error: "Between forty and nine hundred characters. Timestamps and account names help more than adjectives.",
    prueba: v => v.length >= 40 && v.length <= 900
  },
  {
    id: "anexos",
    etiqueta: "Attachments",
    vacio: "Attach at least one piece of evidence, even if it is only a screenshot of the alert.",
    error: "Only the five evidence types listed count.",
    tipo: "grupo2",
    prueba: () => anexosMarcados().length > 0
  },
  {
    id: "analista",
    etiqueta: "Reported by",
    vacio: "Pick the person filing, the conversation goes to their queue.",
    error: "That analyst is not on the duty rota.",
    prueba: v => Object.hasOwn(PERSONAS, v)
  },
  {
    id: "contacto",
    etiqueta: "Phone for the callback",
    vacio: "At SEV1 and SEV2 somebody rings you back inside the hour.",
    error: "Digits with spaces, plus and dashes, eight to eighteen characters.",
    prueba: v => /^\+?\d[0-9 -]{6,17}$/.test(v)
  }
];

function el(id) { return document.getElementById(id); }

function sevActual() {
  const marcado = document.querySelector('input[name="severidad"]:checked');
  return marcado ? marcado.value : "";
}

function clasesMarcadas() {
  return Array.from(document.querySelectorAll('input[name="clase"]:checked')).map(c => c.value);
}

function anexosMarcados() {
  return Array.from(document.querySelectorAll('input[name="anexo"]:checked')).map(c => c.value);
}

function pintarMatriz() {
  matrizFilas.innerHTML = "";
  CLASES.forEach(c => {
    const marcado = clasesMarcadas().includes(c.id);
    const label = document.createElement("label");
    label.className = "clase";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.name = "clase";
    input.value = c.id;
    input.id = "clase-" + c.id;
    input.checked = marcado;
    input.addEventListener("change", () => {
      pintarCampo(CAMPOS.find(f => f.id === "matriz"));
      refrescar();
    });

    const marca = document.createElement("span");
    marca.className = "clase__marca";
    marca.setAttribute("aria-hidden", "true");

    const txt = document.createElement("span");
    txt.className = "clase__txt";
    const b = document.createElement("b");
    b.textContent = c.nombre;
    const s = document.createElement("small");
    s.textContent = c.cod;
    txt.appendChild(b);
    txt.appendChild(s);

    label.appendChild(input);
    label.appendChild(marca);
    label.appendChild(txt);
    matrizFilas.appendChild(label);
  });
}

function volumenTexto(v) {
  if (v === 0) return "one account at most";
  if (v < 10) return "under ten records";
  if (v < 40) return "tens of records";
  if (v < 70) return "hundreds of records";
  if (v < 95) return "thousands of records";
  return "the whole customer table";
}

function volumenCifra(v) {
  if (v === 0) return 1;
  if (v < 10) return v;
  if (v < 40) return v * 37;
  if (v < 70) return v * 640;
  if (v < 95) return v * 41000;
  return 9200000;
}

function colocarCap() {
  const ancho = volumen.clientWidth;
  const pct = Number(volumen.value) / 100;
  el("volumenCap").style.transform = "translate3d(" + (ancho * pct) + "px,0,0)";
  el("volumenRelleno").style.transform = "scaleX(" + pct + ")";
}

function enmascararTelefono(v) {
  if (/[^\d\s+\-]/.test(v)) return "not a phone number";
  const ultimos = v.replace(/[^\d]/g, "").slice(-3);
  if (ultimos.length < 3) return v;
  return v.replace(/\d(?=\D*$)/, "•");
}

function refrescar() {
  const sev = sevActual();
  const v = Number(volumen.value);
  el("volumenValor").textContent = volumenCifra(v).toLocaleString("en-GB");
  el("volumenTexto").textContent = volumenTexto(v);
  colocarCap();

  el("cResumen").textContent = resumenTxt.value.trim() === ""
    ? "Your evidence summary goes here"
    : resumenTxt.value.trim();
  el("cSistema").textContent = sistema.value === "" ? "system not set" : SISTEMAS[sistema.value];
  el("cVolumen").textContent = v === 0 ? "one account" : volumenCifra(v).toLocaleString("en-GB");
  el("cRelleno").style.transform = "scaleX(" + (v / 100) + ")";
  el("cVector").textContent = vector.value === "" ? "not set" : VECTORES[vector.value];
  const clases = clasesMarcadas();
  el("cClases").textContent = clases.length === 0
    ? "none ticked"
    : CLASES.filter(c => clases.includes(c.id)).map(c => c.nombre).join(", ");
  const an = anexosMarcados();
  el("cAnexos").textContent = an.length === 0 ? "nothing attached" : an.length + (an.length === 1 ? " attachment" : " attachments");
  el("cAnalista").textContent = analista.value === "" ? "nobody yet" : PERSONAS[analista.value];
  el("cContacto").textContent = contacto.value.trim() === "" ? "not set" : enmascararTelefono(contacto.value.trim());
  el("cPaging").textContent = el("pagado").checked ? "duty officer paged now" : "waits for 08:00";
  el("cPie").textContent = sev === ""
    ? "Halberd Trust, draft not filed"
    : "Halberd Trust, draft at " + sev + ", not filed";

  el("caso").dataset.sev = sev === "" ? "none" : sev;
  if (sev === "") {
    el("cSev").textContent = "no severity";
    delete el("cSev").dataset.nivel;
  } else {
    el("cSev").textContent = sev + " · " + RELOJES[sev];
    el("cSev").dataset.nivel = sev;
  }

  el("matriz-ayuda").textContent = clases.length === 0
    ? "Nothing ticked yet. The case reads as no exposure until you say otherwise."
    : clases.length + " of 6 classes ticked. The case now reads: " +
      CLASES.filter(c => clases.includes(c.id)).map(c => c.nombre.toLowerCase()).join(", ") + ".";
  el("anexos-ayuda").textContent = an.length === 0
    ? "Nothing attached. A case with no evidence is a case the analyst has to go and gather itself."
    : an.length + " of 5 attached: " + an.join(", ") + ".";

  el("resumenCuenta").textContent = resumenTxt.value.length + " of 900";

  const completos = CAMPOS.filter(f => f.prueba(valorCampo(f))).length;
  const listo = completos === CAMPOS.length;
  cola.dataset.listo = listo ? "1" : "0";
  el("colaTexto").textContent = listo
    ? "Every field filled. The case is ready to file."
    : "Draft. " + (CAMPOS.length - completos) + (CAMPOS.length - completos === 1 ? " field is" : " fields are") + " still open, nothing has left this browser.";
}

function valorCampo(f) {
  if (f.tipo === "radio") return sevActual();
  if (f.tipo === "grupo") return clasesMarcadas().join(",");
  if (f.tipo === "grupo2") return anexosMarcados().join(",");
  return el(f.id).value.trim();
}

function contenedorCampo(f) {
  if (f.id === "severidad") return el("conjunto-severidad");
  if (f.id === "matriz") return matriz;
  if (f.id === "anexos") return anexos.closest(".campo");
  return el(f.id).closest(".campo");
}

function controlReal(f) {
  if (f.id === "severidad") return el("sev1");
  if (f.id === "matriz") return matriz.querySelector("input");
  if (f.id === "anexos") return anexos.querySelector("input");
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
  const desc = [ayuda.id];

  if (malo) {
    env.dataset.estado = "error";
    control.setAttribute("aria-invalid", "true");
    desc.push(err.id);
    if (f.id === "contacto" && !vacio && valor.includes("@")) {
      err.textContent = "That is an email address, and the duty officer cannot ring it. Digits, spaces, plus and dashes.";
    } else {
      err.textContent = vacio ? f.vacio : f.error;
    }
  } else {
    env.dataset.estado = vacio ? "neutro" : "ok";
    control.setAttribute("aria-invalid", "false");
    err.textContent = "";
  }

  env.setAttribute("aria-describedby", desc.join(" "));
  return malo;
}

function problemas() {
  const salida = [];
  CAMPOS.forEach(f => {
    if (!f.prueba(valorCampo(f))) {
      const v = valorCampo(f);
      let texto = v === "" ? f.vacio : f.error;
      if (f.id === "contacto" && v !== "" && v.includes("@")) {
        texto = "That is an email address, and the duty officer cannot ring it. Digits, spaces, plus and dashes.";
      }
      salida.push(f.etiqueta + ": " + texto);
    }
  });
  return salida;
}

function mostrarResumen(fallos) {
  tituloError.textContent = fallos.length === 1
    ? "One field is stopping the case"
    : fallos.length + " fields are stopping the case";
  listaError.innerHTML = "";
  fallos.forEach(t => {
    const li = document.createElement("li");
    li.textContent = t;
    listaError.appendChild(li);
  });
  resumenError.hidden = false;
}

function pedirPegadoManual(motivo) {
  btnPegar.dataset.vivo = "0";
  resumenTxt.focus();
  el("resumen-ayuda").textContent = motivo + ", so press Ctrl V into the box.";
}

function conTexto(texto) {
  const limpio = (texto || "").replace(/\r/g, "").slice(0, 900);
  if (limpio.trim() === "") {
    pedirPegadoManual("The clipboard held nothing usable");
    return;
  }
  btnPegar.dataset.vivo = "1";
  resumenTxt.value = limpio;
  resumenTxt.dispatchEvent(new Event("input", { bubbles: true }));
  pintarCampo(CAMPOS.find(f => f.id === "resumen"));
  refrescar();
  el("resumen-ayuda").textContent = limpio.split("\n").length + " line" +
    (limpio.split("\n").length === 1 ? "" : "s") + " pasted, " + limpio.length + " of 900 characters.";
}

btnPegar.addEventListener("click", () => {
  if (!navigator.clipboard || !navigator.clipboard.readText) {
    pedirPegadoManual("This browser will not hand the clipboard over");
    return;
  }
  const espera = new Promise(resolve => { setTimeout(resolve, 500); });
  // La carrera nunca se rechaza (el texto va con catch y el temporizador solo
  // resuelve), pero se recoge el error por si el navegador rompe otra vez.
  Promise.race([navigator.clipboard.readText().catch(() => ""), espera])
    .then(resultado => {
      if (resultado === undefined) {
        pedirPegadoManual("The browser kept the clipboard to itself");
        return;
      }
      conTexto(resultado);
    })
    .catch(() => {});
});

resumenTxt.addEventListener("paste", e => {
  e.preventDefault();
  const pegado = (e.clipboardData || window.clipboardData).getData("text");
  conTexto(pegado);
});

CAMPOS.forEach(f => {
  if (f.id === "severidad") {
    document.querySelectorAll('input[name="severidad"]').forEach(r => {
      r.addEventListener("change", () => {
        if (el("conjunto-severidad").dataset.estado === "error") pintarCampo(f);
        refrescar();
      });
    });
    return;
  }
  if (f.id === "anexos") {
    anexos.addEventListener("change", () => {
      pintarCampo(f);
      refrescar();
    });
    return;
  }
  if (f.id === "matriz") return;
  const nodo = el(f.id);
  nodo.addEventListener("blur", () => pintarCampo(f));
  nodo.addEventListener("change", () => { pintarCampo(f); refrescar(); });
  nodo.addEventListener("input", () => {
    if (nodo.closest(".campo").dataset.estado === "error") pintarCampo(f);
    refrescar();
  });
});

volumen.addEventListener("input", () => {
  volumen.setAttribute("aria-valuetext", volumenCifra(Number(volumen.value)).toLocaleString("en-GB") + " records, " + volumenTexto(Number(volumen.value)));
  refrescar();
});

el("pagado").addEventListener("change", () => {
  el("pagado").closest(".campo").dataset.estado = el("pagado").checked ? "ok" : "neutro";
  el("pagado").setAttribute("aria-invalid", "false");
  refrescar();
});

window.addEventListener("resize", colocarCap);

form.addEventListener("submit", e => {
  e.preventDefault();
  CAMPOS.forEach(f => pintarCampo(f));
  const fallos = problemas();

  if (fallos.length > 0) {
    mostrarResumen(fallos);
    const primero = CAMPOS.find(f => !f.prueba(valorCampo(f)));
    if (primero) controlReal(primero).focus();
    return;
  }

  resumenError.hidden = true;
  const sev = sevActual();
  const clases = clasesMarcadas();
  const an = anexosMarcados();

  el("aId").textContent = "SEC-" + String(Math.floor(100000 + Math.random() * 900000));
  el("aSev").textContent = sev;
  el("aRota").textContent = ROTAS[sev] + (el("pagado").checked ? ", officer paged" : "");
  el("aReloj").textContent = RELOJES[sev];
  el("archTitulo").textContent = sev === "SEV1" ? "The officer has been paged" : "The case is in the queue";
  el("archTexto").textContent = sev + " on " + SISTEMAS[sistema.value] + ", " +
    clases.length + (clases.length === 1 ? " data class" : " data classes") + " and " +
    an.length + (an.length === 1 ? " attachment" : " attachments") + ", routed to " +
    PERSONAS[analista.value] + " by " + VECTORES[vector.value].toLowerCase() + ".";

  form.hidden = true;
  document.querySelector(".monitor").hidden = true;
  archivada.hidden = false;
  archivada.focus();
});

el("otra").addEventListener("click", () => {
  form.reset();
  CAMPOS.forEach(f => {
    contenedorCampo(f).dataset.estado = "neutro";
    el(f.id + "-err").textContent = "";
    const control = controlReal(f);
    control.setAttribute("aria-invalid", "false");
    contenedorCampo(f).setAttribute("aria-describedby", f.id + "-ayuda");
  });
  btnPegar.dataset.vivo = "0";
  resumenError.hidden = true;
  archivada.hidden = true;
  form.hidden = false;
  document.querySelector(".monitor").hidden = false;
  pintarMatriz();
  refrescar();
  sistema.focus();
});

let ticks = 0;

function pintarReloj() {
  const ahora = new Date();
  const h = String(ahora.getHours()).padStart(2, "0");
  const m = String(ahora.getMinutes()).padStart(2, "0");
  const s = String((ahora.getSeconds() + ticks) % 60).padStart(2, "0");
  el("reloj").textContent = h + ":" + m + ":" + s;
}

setInterval(() => {
  ticks += 1;
  pintarReloj();
}, 1000);

pintarMatriz();
pintarReloj();
refrescar();
