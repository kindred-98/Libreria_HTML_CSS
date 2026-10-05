const form = document.getElementById("form");
const reloj = document.getElementById("reloj");
const impacto = document.getElementById("impacto");
const resumenError = document.getElementById("resumenError");
const listaError = document.getElementById("resumenLista");
const tituloError = document.getElementById("resumenTitulo");
const despachado = document.getElementById("despachado");

const borradorId = "INC-" + String(Math.floor(100000 + Math.random() * 900000));

const SERVICIOS = ["pagos", "sesiones", "transcod", "datos", "panel"];
const SEVS = ["SEV1", "SEV2", "SEV3", "SEV4"];
const GUARDIAS = ["vera", "dani", "milo", "ruth"];

const TITULOS_SERVICIO = {
  pagos: "Payments API, card capture",
  sesiones: "Session gateway, logins",
  transcod: "Media transcoder, uploads",
  datos: "Nightly data pipeline",
  panel: "Customer web panel"
};

const ROTAS = {
  pagos: "payments rota, Dani on call",
  sesiones: "identity rota, Vera on call",
  transcod: "media rota, Milo on call",
  datos: "data rota, Milo on call",
  panel: "front end rota, Ruth on call"
};

const CAMPOS = [
  {
    id: "servicio",
    etiqueta: "Affected service",
    vacio: "Pick the service that is failing so the ticket reaches the right rota.",
    error: "That service is not in the node catalogue.",
    prueba: v => SERVICIOS.includes(v)
  },
  {
    id: "titulo",
    etiqueta: "Headline",
    vacio: "Write the headline the engineer will read first.",
    error: "Between 10 and 90 characters.",
    prueba: v => v.length >= 10 && v.length <= 90
  },
  {
    id: "momento",
    etiqueta: "When it started",
    vacio: "Give the time it started, even if it is an estimate.",
    error: "The start time cannot be in the future and has to be a real date.",
    prueba: v => {
      if (v === "") return false;
      const fecha = new Date(v);
      if (Number.isNaN(fecha.getTime())) return false;
      return fecha.getTime() <= Date.now() + 60000;
    }
  },
  {
    id: "detalle",
    etiqueta: "Notes",
    vacio: "Thirty characters at least, or leave the box empty on purpose.",
    error: "Between 30 and 600 characters, or completely empty.",
    prueba: v => v.length <= 600 && (v.length === 0 || v.length >= 30)
  },
  {
    id: "guardia",
    etiqueta: "Who reported it",
    vacio: "Pick the person filing this ticket.",
    error: "That name is not on the rota.",
    prueba: v => GUARDIAS.includes(v)
  },
  {
    id: "contacto",
    etiqueta: "Phone for the callback",
    vacio: "Leave a number the on call engineer can ring back.",
    error: "Digits, spaces, plus and dashes only, between 8 and 18 characters.",
    prueba: v => /^\+?[\d][0-9 -]{6,17}$/.test(v)
  }
];

function el(id) { return document.getElementById(id); }

function textoOpcion(select, valor) {
  if (valor === "") return "";
  const op = Array.from(select.options).find(o => o.value === valor);
  return op ? op.text : valor;
}

function severidadElegida() {
  const marcada = form.querySelector("input[name='severidad']:checked");
  return marcada ? marcada.value : "";
}

function regionesElegidas() {
  return Array.from(form.querySelectorAll("input[name='region']:checked")).map(i => i.value);
}

function pintar(f) {
  const control = el(f.id);
  const env = control.closest(".campo");
  const ayuda = el(f.id + "-ayuda");
  const mensaje = el(f.id + "-error");
  const valor = control.value.trim();
  const malo = !f.prueba(valor);
  const desc = [ayuda.id];

  if (malo) {
    env.dataset.estado = "error";
    control.setAttribute("aria-invalid", "true");
    desc.push(mensaje.id);
    mensaje.textContent = valor === "" ? f.vacio : f.error;
  } else {
    env.dataset.estado = valor === "" ? "neutro" : "ok";
    control.setAttribute("aria-invalid", "false");
    mensaje.textContent = "";
  }
  control.setAttribute("aria-describedby", desc.join(" "));
  return malo;
}

function pintarSeveridad() {
  const env = el("conjunto-severidad");
  const grupo = env.querySelector(".severidades");
  const ayuda = el("severidad-ayuda");
  const mensaje = el("severidad-error");
  const sev = severidadElegida();
  const malo = sev === "";
  const desc = [ayuda.id];

  if (malo) {
    env.dataset.estado = "error";
    grupo.setAttribute("aria-invalid", "true");
    desc.push(mensaje.id);
    mensaje.textContent = "The pager only reacts to a severity. Pick one of the four codes.";
  } else {
    env.dataset.estado = "ok";
    grupo.setAttribute("aria-invalid", "false");
    mensaje.textContent = "";
    ayuda.textContent = sev + " chosen. The rota and the status page wording follow this code.";
  }
  grupo.setAttribute("aria-describedby", desc.join(" "));
  return malo;
}

function pintarRegiones() {
  const env = el("conjunto-regiones");
  const ayuda = el("regiones-ayuda");
  const mensaje = el("regiones-error");
  const marcadas = regionesElegidas();
  const malo = marcadas.length === 0;
  const desc = [ayuda.id];

  if (malo) {
    env.dataset.estado = "error";
    env.querySelector(".regiones").setAttribute("aria-invalid", "true");
    desc.push(mensaje.id);
    mensaje.textContent = "Tick at least one region, even if it is only yours.";
  } else {
    env.dataset.estado = "ok";
    env.querySelector(".regiones").setAttribute("aria-invalid", "false");
    mensaje.textContent = "";
    ayuda.textContent = marcadas.length === 1
      ? "One region ticked: " + marcadas[0] + ". Traffic will be pinned to the healthy nodes there."
      : marcadas.length + " regions ticked. Traffic will be pinned to the healthy nodes in all of them.";
  }
  env.querySelector(".regiones").setAttribute("aria-describedby", desc.join(" "));
  return malo;
}

function pintarImpacto() {
  const env = impacto.closest(".campo");
  const ayuda = el("impacto-ayuda");
  const valor = Number(impacto.value);
  const pct = valor + " %";

  env.dataset.estado = "neutro";
  impacto.setAttribute("aria-invalid", "false");
  impacto.setAttribute("aria-describedby", "impacto-ayuda");
  el("impacto-error").textContent = "";
  el("impactoValor").textContent = pct;
  el("impactoRelleno").style.transform = "scaleX(" + valor / 100 + ")";
  impacto.style.setProperty("--pct", valor + "%");
  impacto.setAttribute("aria-valuetext", pct + " of traffic affected");
  ayuda.textContent = valor === 0
    ? "Zero means a single request is failing. One hundred means the whole region is dark."
    : valor + " per cent of the traffic on this service is failing right now.";
  return false;
}

function mascaraTelefono(valor) {
  const limpio = valor.replace(/[^0-9]/g, "");
  if (limpio.length <= 4) return limpio;
  return limpio.slice(-4).replace(/^/, "ending ");
}

function pintarTicket() {
  const sev = severidadElegida();
  const ticket = el("ticket");
  const sevChip = el("tSev");
  ticket.dataset.sev = sev === "" ? "none" : sev;
  sevChip.dataset.sev = sev === "" ? "none" : sev;
  sevChip.textContent = sev === "" ? "no severity" : sev;

  const titulo = el("titulo").value.trim();
  el("tTitulo").textContent = titulo === "" ? "Your headline goes here" : titulo;

  const servicio = el("servicio").value;
  el("tServicio").textContent = servicio === ""
    ? "service not set"
    : TITULOS_SERVICIO[servicio] + " · queue " + (servicio === "" ? "triage" : ROTAS[servicio].split(",")[0]);

  const valor = Number(impacto.value);
  el("tImpacto").textContent = valor + " %";
  el("tRelleno").style.transform = "scaleX(" + valor / 100 + ")";

  const momento = el("momento").value;
  if (momento === "") {
    el("tMomento").textContent = "not set";
  } else {
    const fecha = new Date(momento);
    const dos = n => String(n).padStart(2, "0");
    el("tMomento").textContent = dos(fecha.getDate()) + "/" + dos(fecha.getMonth() + 1) + " " +
      dos(fecha.getHours()) + ":" + dos(fecha.getMinutes()) + " node time";
  }

  const regiones = regionesElegidas();
  el("tRegiones").textContent = regiones.length === 0 ? "none ticked" : regiones.length + " ticked";

  const guardia = el("guardia").value;
  el("tGuardia").textContent = guardia === "" ? "nobody yet" : textoOpcion(el("guardia"), guardia);

  const contacto = el("contacto").value.trim();
  el("tContacto").textContent = contacto === "" ? "not set" : "phone " + mascaraTelefono(contacto);

  const sevNum = sev === "" ? 9 : Number(sev.slice(3));
  const pagina = el("despertar").checked || sevNum <= 2;
  el("tPaging").textContent = pagina
    ? (el("despertar").checked ? "paged now, asked for" : "paged now, severity forces it")
    : "waits for 08:00";
  el("tCola").textContent = sevNum === 1 ? "incident command" : (sevNum === 2 ? "urgent rota" : "triage");

  const detalle = el("detalle").value.trim();
  el("tDetalle").textContent = detalle === ""
    ? "No notes on this ticket yet."
    : detalle.length > 220 ? detalle.slice(0, 217) + "..." : detalle;

  el("tId").textContent = borradorId;
  el("tPie").textContent = "Node LON-03, draft not sent";

  const listo = CAMPOS.every(f => f.prueba(el(f.id).value.trim())) && sev !== "" && regiones.length > 0;
  el("colaLampara").dataset.listo = String(listo);
  el("colaTexto").textContent = listo
    ? "Everything a rota needs. Still a draft until you press send."
    : "Draft. Nothing has left this browser.";
}

function pintarTodo() {
  let primero = null;
  CAMPOS.forEach(f => {
    if (pintar(f) && !primero) primero = el(f.id);
  });
  const falloSev = pintarSeveridad();
  const falloReg = pintarRegiones();
  pintarImpacto();
  pintarTicket();
  if (falloSev && !primero) primero = el("sev1");
  return { primero, falloSev, falloReg };
}

function contadores() {
  el("tituloCuenta").textContent = el("titulo").value.length + " of 90";
  el("detalleCuenta").textContent = el("detalle").value.length + " of 600";
}

CAMPOS.forEach(f => {
  const control = el(f.id);
  control.addEventListener("blur", () => { pintar(f); contadores(); });
  control.addEventListener("change", () => { pintar(f); contadores(); });
  control.addEventListener("input", () => {
    if (f.id === "contacto") {
      control.value = control.value.replace(/[^0-9+\- ]/g, "").slice(0, 18);
    }
    contadores();
    if (f.id === "detalle" || f.id === "titulo") pintarTicket();
    if (control.closest(".campo").dataset.estado === "error") pintar(f);
  });
});

form.querySelectorAll("input[name='severidad']").forEach(inp => {
  inp.addEventListener("change", () => {
    pintarSeveridad();
    pintarTicket();
  });
});

form.querySelectorAll("input[name='region']").forEach(inp => {
  inp.addEventListener("change", () => {
    pintarRegiones();
    pintarTicket();
  });
});

impacto.addEventListener("input", pintarImpacto);
el("despertar").addEventListener("change", pintarTicket);

form.addEventListener("submit", e => {
  e.preventDefault();
  const { primero, falloSev, falloReg } = pintarTodo();
  const problemas = [];

  CAMPOS.forEach(f => {
    if (!f.prueba(el(f.id).value.trim())) {
      const valor = el(f.id).value.trim();
      problemas.push(f.etiqueta + ": " + (valor === "" ? f.vacio : f.error));
    }
  });
  if (falloSev) problemas.push("Severity: the pager only reacts to a severity code.");
  if (falloReg) problemas.push("Regions: tick at least one region before filing.");

  if (problemas.length > 0) {
    tituloError.textContent = problemas.length === 1
      ? "The ticket is not complete yet"
      : problemas.length + " fields are not complete yet";
    listaError.innerHTML = "";
    problemas.forEach(t => {
      const li = document.createElement("li");
      li.textContent = t;
      listaError.appendChild(li);
    });
    resumenError.hidden = false;
    if (primero) primero.focus();
    return;
  }

  resumenError.hidden = true;
  const sev = severidadElegida();
  const sevNum = Number(sev.slice(3));
  const servicio = el("servicio").value;
  const referencia = borradorId;
  const regiones = regionesElegidas();

  el("dId").textContent = referencia;
  el("dSev").textContent = sev + ", " + Number(impacto.value) + " per cent of traffic";
  el("dRota").textContent = ROTAS[servicio];
  el("dEstado").textContent = el("despertar").checked || sevNum <= 2 ? "already open" : "4 minutes";
  el("despTitulo").textContent = sev === "SEV1"
    ? "Incident command has been woken"
    : "The on call engineer has the ticket";
  el("despTexto").textContent = "Filed as " + referencia + " at " + sev + " on " +
    TITULOS_SERVICIO[servicio] + ", with " + regiones.length +
    (regiones.length === 1 ? " region" : " regions") + " marked. " + ROTAS[servicio] +
    " has ninety seconds to acknowledge before it escalates.";

  form.hidden = true;
  document.querySelector(".monitor").hidden = true;
  despachado.hidden = false;
  despachado.focus();
});

el("otra").addEventListener("click", () => {
  despachado.hidden = true;
  form.hidden = false;
  document.querySelector(".monitor").hidden = false;
  form.reset();
  CAMPOS.forEach(f => {
    const control = el(f.id);
    control.closest(".campo").dataset.estado = "neutro";
    control.setAttribute("aria-invalid", "false");
    control.setAttribute("aria-describedby", f.id + "-ayuda");
    el(f.id + "-error").textContent = "";
  });
  el("conjunto-severidad").dataset.estado = "neutro";
  el("conjunto-regiones").dataset.estado = "neutro";
  el("severidad-error").textContent = "";
  el("regiones-error").textContent = "";
  el("tituloCuenta").textContent = "0 of 90";
  el("detalleCuenta").textContent = "0 of 600";
  resumenError.hidden = true;
  pintarImpacto();
  pintarTicket();
  el("servicio").focus();
});

function tic() {
  const ahora = new Date();
  const dos = n => String(n).padStart(2, "0");
  reloj.textContent = dos(ahora.getHours()) + ":" + dos(ahora.getMinutes()) + ":" + dos(ahora.getSeconds());
}

pintarImpacto();
pintarTicket();
tic();
window.setInterval(tic, 1000);
