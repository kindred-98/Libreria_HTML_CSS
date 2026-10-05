const form = document.getElementById("form");
const registro = document.getElementById("registro");
const resumenError = document.getElementById("resumenError");
const listaError = document.getElementById("resumenErrorLista");
const tituloError = document.getElementById("resumenErrorTitulo");
const listo = document.getElementById("listo");
const grupo = document.getElementById("grupo");

const ALIASES = [
  { alias: "nightledger", uso: "4 runs" },
  { alias: "duskwalker", uso: "3 runs" },
  { alias: "emberfox", uso: "4 runs" },
  { alias: "quietmace", uso: "2 runs" },
  { alias: "glasshalberd", uso: "4 runs" },
  { alias: "tinpriest", uso: "3 runs" },
  { alias: "northscribe", uso: "1 run" },
  { alias: "rustedanchor", uso: "4 runs" }
];

const CLASES = ["hunter", "warlock", "mage", "rogue", "priest", "paladin", "warrior", "druid"];

const ROLES = ["tank", "healer", "damage"];

const ASISTENCIAS = ["si", "quiza", "no"];

const VAULT = ["2r", "2h", "frost", "dkp", "tl", "wl", "aug", "conv", "ele", "resto", "bladeparty", "1r", "1h", "bear", "feral", "rogue", "boomkin"];

const CAMPOS = [
  {
    id: "alias",
    etiqueta: "alias",
    valor: () => el("alias").value.trim().toLowerCase(),
    vacio: "The console needs an alias before it accepts anything else.",
    error: "Between three and eighteen characters, letters, digits, dot and underscore, and it cannot be one already on the roster.",
    prueba: v => /^[a-z0-9._]{3,18}$/.test(v) && !ALIASES.some(a => a.alias === v && a.yaDentro)
  },
  {
    id: "clase",
    etiqueta: "spec",
    valor: () => el("clase").value.trim().toLowerCase(),
    vacio: "Type the spec, Tab completes it.",
    error: "That class does not exist in this patch. Tab completes the eight that do.",
    prueba: v => CLASES.includes(v)
  },
  {
    id: "nivel",
    etiqueta: "ilvl",
    valor: () => el("nivel").value.trim(),
    vacio: "The raid lead needs an item level to plan the pull.",
    error: "A whole number between sixty and eighty.",
    prueba: v => /^\d{1,3}$/.test(v) && Number(v) >= 60 && Number(v) <= 80
  },
  {
    id: "rol",
    etiqueta: "role",
    valor: () => el("rol").value.trim().toLowerCase(),
    vacio: "Say whether you take a tank, a healer or a damage slot.",
    error: "TANK, HEALER or DAMAGE. Nothing else is a role in this raid.",
    prueba: v => ROLES.includes(v)
  },
  {
    id: "asistencia",
    etiqueta: "attend",
    valor: () => el("asistencia").value.trim().toLowerCase(),
    vacio: "SI, QUIZA or NO.",
    error: "The console only understands SI, QUIZA and NO.",
    prueba: v => ASISTENCIAS.includes(v)
  },
  {
    id: "carga",
    etiqueta: "loadout",
    valor: () => el("carga").value.trim().toLowerCase(),
    vacio: "At least two tokens, for example 2r 2h frost dkp.",
    error: "That is not in the vault. Space separated tokens, at least two, all of them known.",
    prueba: v => {
      const t = tokensDe(v);
      return t.length >= 2 && t.every(x => VAULT.includes(x));
    }
  },
  {
    id: "nota",
    etiqueta: "note",
    valor: () => el("nota").value.trim(),
    vacio: "",
    error: "Keep the note under one hundred and sixty characters.",
    prueba: v => v.length <= 160
  }
];

let cargadas = 0;
const roster = [];

function el(id) { return document.getElementById(id); }

function nodo(etiqueta, clase, texto) {
  const n = document.createElement(etiqueta);
  if (clase) n.className = clase;
  if (texto !== undefined) n.textContent = texto;
  return n;
}

function dos(n) { return String(n).padStart(2, "0"); }

function tokensDe(v) {
  return v.split(/[\s,]+/).map(t => t.trim()).filter(t => t !== "");
}

function marcar(marca, texto, clase) {
  const p = nodo("p", "fila fila--" + clase);
  p.appendChild(nodo("span", "fila__marca", marca));
  p.appendChild(nodo("span", null, texto));
  const d = new Date();
  p.appendChild(nodo("small", null, dos(d.getHours()) + ":" + dos(d.getMinutes()) + ":" + dos(d.getSeconds())));
  registro.appendChild(p);
  registro.scrollTop = registro.scrollHeight;
  while (registro.children.length > 24) registro.firstElementChild.remove();
  return p;
}

function fallo(f) {
  const v = f.valor();
  if (v === "") return f.vacio;
  return f.prueba(v) ? "" : f.error;
}

function pintar(f) {
  const env = el(f.id).closest(".fila-campo");
  const ayuda = el(f.id + "-ayuda");
  const err = el(f.id + "-err");
  const mensaje = fallo(f);
  env.dataset.estado = mensaje ? "error" : "ok";
  el(f.id).setAttribute("aria-invalid", mensaje ? "true" : "false");
  el(f.id).setAttribute("aria-describedby", ayuda.id);
  err.textContent = mensaje;
  return mensaje;
}

function pintarTokens() {
  const caja = el("tokens");
  caja.innerHTML = "";
  tokensDe(el("carga").value.trim().toLowerCase()).forEach(t => {
    const chip = nodo("span", "token", t);
    chip.dataset.ok = VAULT.includes(t) ? "1" : "0";
    caja.appendChild(chip);
  });
}

function filaGrupo(alias, clase, nivel, rol, borrador) {
  const li = nodo("li");
  li.dataset.rol = rol || "damage";
  li.dataset.borrador = borrador ? "1" : "0";
  li.appendChild(nodo("span", "grupo__icono", (clase || "?").slice(0, 2)));
  const datos = nodo("div", "grupo__datos");
  datos.appendChild(nodo("b", null, alias || "unnamed"));
  datos.appendChild(nodo("small", null, "ilvl " + (nivel || "??") + " · " + (rol || "damage") + (borrador ? " · draft" : "")));
  li.appendChild(datos);
  return li;
}

function pintarGrupo() {
  grupo.innerHTML = "";
  roster.forEach(f => grupo.appendChild(filaGrupo(f.alias, f.clase, f.nivel, f.rol, false)));
  const alias = el("alias").value.trim().toLowerCase();
  if (alias !== "") {
    grupo.appendChild(filaGrupo(
      alias,
      el("clase").value.trim().toLowerCase(),
      el("nivel").value.trim(),
      el("rol").value.trim().toLowerCase(),
      true
    ));
  }
  el("marcoNota").hidden = grupo.children.length > 0;
  el("pieParty").textContent = "party " + (roster.length + (alias === "" ? 0 : 1)) + " of 5 · tanks " +
    roster.filter(f => f.rol === "tank").length + " · healers " + roster.filter(f => f.rol === "healer").length;
}

function nombreDe(x) {
  return (x.alias || x.texto || "").toLowerCase();
}

function sugerencias(id, cajaId, lista, cuando) {
  const entrada = el(id);
  const caja = el(cajaId);
  const texto = entrada.value.trim().toLowerCase();
  const filtrados = lista.filter(x => texto === "" || nombreDe(x).indexOf(texto) === 0).slice(0, 6);
  caja.innerHTML = "";
  if (document.activeElement !== entrada || filtrados.length === 0) {
    caja.hidden = true;
    entrada.setAttribute("aria-expanded", "false");
    return;
  }
  filtrados.forEach(x => {
    const b = nodo("button", "sugerencia");
    b.type = "button";
    b.setAttribute("role", "option");
    b.appendChild(nodo("span", "sugerencia__marca", ">>"));
    b.appendChild(nodo("span", null, nombreDe(x)));
    b.appendChild(nodo("small", null, x.uso || ""));
    b.addEventListener("click", () => {
      entrada.value = nombreDe(x);
      caja.hidden = true;
      entrada.setAttribute("aria-expanded", "false");
      entrada.focus();
      cuando();
    });
    caja.appendChild(b);
  });
  caja.hidden = false;
  entrada.setAttribute("aria-expanded", "true");
}

function completar(id, cajaId, lista, cuando) {
  const entrada = el(id);
  const texto = entrada.value.trim().toLowerCase();
  if (texto === "") return;
  const coche = lista.find(x => nombreDe(x).indexOf(texto) === 0);
  if (coche) {
    entrada.value = nombreDe(coche);
    marcar("ok", "completed " + nombreDe(coche) + " from the vault", "ok");
  } else {
    marcar("!!", "no vault entry starts with " + texto, "aviso");
  }
  el(cajaId).hidden = true;
  entrada.setAttribute("aria-expanded", "false");
  cuando();
  entrada.focus();
}

el("alias").addEventListener("focus", () => sugerencias("alias", "sugerencias", ALIASES, pintarAlias));
el("alias").addEventListener("input", () => {
  sugerencias("alias", "sugerencias", ALIASES, pintarAlias);
  if (el("alias").closest(".fila-campo").dataset.estado === "error") pintarAlias();
});
el("alias").addEventListener("blur", () => {
  window.setTimeout(() => {
    el("sugerencias").hidden = true;
    el("alias").setAttribute("aria-expanded", "false");
  }, 120);
});
el("alias").addEventListener("keydown", e => {
  if (e.key === "Tab" && !el("sugerencias").hidden) {
    e.preventDefault();
    completar("alias", "sugerencias", ALIASES, pintarAlias);
  }
});

const clasesLista = CLASES.map(c => ({ texto: c, uso: "dps" }));
clasesLista[3].uso = "dps";
clasesLista[5].uso = "tank or heal";

el("clase").addEventListener("focus", () => sugerencias("clase", "sugerenciasClase", clasesLista, pintarClase));
el("clase").addEventListener("input", () => {
  sugerencias("clase", "sugerenciasClase", clasesLista, pintarClase);
  if (el("clase").closest(".fila-campo").dataset.estado === "error") pintarClase();
});
el("clase").addEventListener("blur", () => {
  window.setTimeout(() => {
    el("sugerenciasClase").hidden = true;
    el("clase").setAttribute("aria-expanded", "false");
  }, 120);
});
el("clase").addEventListener("keydown", e => {
  if (e.key === "Tab" && !el("sugerenciasClase").hidden) {
    e.preventDefault();
    completar("clase", "sugerenciasClase", clasesLista, pintarClase);
  }
});

function pintarAlias() { return pintar(CAMPOS[0]); }
function pintarClase() { return pintar(CAMPOS[1]); }

CAMPOS.forEach(f => {
  const n = el(f.id);
  if (f.id === "alias" || f.id === "clase") return;
  n.addEventListener("blur", () => pintar(f));
  n.addEventListener("input", () => {
    if (n.closest(".fila-campo").dataset.estado === "error") pintar(f);
    if (f.id === "carga") pintarTokens();
    if (f.id === "rol" || f.id === "nivel" || f.id === "clase" || f.id === "alias") pintarGrupo();
  });
  n.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      form.requestSubmit();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      n.value = "";
      if (f.id === "carga") pintarTokens();
      pintar(f);
      marcar("..", "line " + f.etiqueta + " cleared with Escape", "sistema");
    }
  });
});

el("nivel").addEventListener("input", () => { el("nivel").value = el("nivel").value.replace(/[^0-9]/g, "").slice(0, 3); });

el("logPublico").addEventListener("change", () => {
  el("logPublico").closest(".fila-campo").dataset.estado = el("logPublico").checked ? "ok" : "neutro";
  el("logPublico").setAttribute("aria-invalid", "false");
});

form.addEventListener("submit", e => {
  e.preventDefault();
  CAMPOS.forEach(pintar);
  const fallos = CAMPOS.filter(f => fallo(f) !== "");

  if (fallos.length > 0) {
    tituloError.textContent = fallos.length === 1
      ? "One line is still wrong"
      : fallos.length + " lines are still wrong";
    listaError.innerHTML = "";
    fallos.forEach(f => {
      const li = document.createElement("li");
      li.textContent = f.etiqueta + ": " + fallo(f);
      listaError.appendChild(li);
    });
    resumenError.hidden = false;
    marcar("xx", "signup rejected, " + fallos.length + " line" + (fallos.length === 1 ? "" : "s") + " need attention", "error");
    el(fallos[0].id).focus();
    return;
  }

  resumenError.hidden = true;
  el("enviarTexto").textContent = "sending";
  form.querySelector(".enviar").disabled = true;
  el("pieEstado").textContent = "sending the roster line, do not close the tab";
  marcar(">>", "raid signup --alias " + el("alias").value.trim().toLowerCase() + " --send", "sistema");
  window.setTimeout(terminar, 900);
});

function terminar() {
  const ref = "RN-" + String(Math.floor(1000 + Math.random() * 8999));
  cargadas++;
  roster.push({
    alias: el("alias").value.trim().toLowerCase(),
    clase: el("clase").value.trim().toLowerCase(),
    nivel: el("nivel").value.trim(),
    rol: el("rol").value.trim().toLowerCase()
  });
  const tokens = tokensDe(el("carga").value.trim().toLowerCase());
  marcar("ok", "roster line stored, party now " + (cargadas + 1) + " of 5", "ok");
  marcar("ok", "raid lead notified in the guild channel", "ok");

  el("listoRef").textContent = ref;
  el("listoAlias").textContent = el("alias").value.trim().toLowerCase() + " · " + el("clase").value.trim().toLowerCase();
  el("listoCarga").textContent = tokens.join(" ");
  el("listoLog").textContent = el("logPublico").checked ? "on, next to the screenshot" : "off, guild channel only";
  el("listoTitulo").textContent = el("alias").value.trim().toLowerCase() + " is on the roster";
  el("listoLead").textContent = "The lead sees the line now. " + (el("asistencia").value.trim().toLowerCase() === "si"
    ? "You are counted for both pulls."
    : "You are on the maybe list, so nobody waits for you at the summon point.") +
    (el("nota").value.trim() ? " Your note is attached to the line." : "");
  el("listoNota").textContent = "Change it any time before Wednesday noon with one more line at the console. " +
    (el("nota").value.trim() ? "The note you wrote is only visible to the guild." : "You left the note empty, which is fine.");

  pintarGrupo();
  document.querySelector(".escena").hidden = true;
  document.querySelector(".marca-barra").hidden = true;
  listo.hidden = false;
  listo.focus();
}

el("otra").addEventListener("click", () => {
  listo.hidden = true;
  document.querySelector(".escena").hidden = false;
  document.querySelector(".marca-barra").hidden = false;
  form.reset();
  form.querySelector(".enviar").disabled = false;
  el("enviarTexto").textContent = "run signup";
  el("pieEstado").textContent = "console idle, nothing sent";
  CAMPOS.forEach(f => {
    el(f.id).closest(".fila-campo").dataset.estado = "neutro";
    el(f.id).setAttribute("aria-invalid", "false");
    el(f.id).setAttribute("aria-describedby", f.id + "-ayuda");
    el(f.id + "-err").textContent = "";
  });
  el("logPublico").closest(".fila-campo").dataset.estado = "neutro";
  resumenError.hidden = true;
  pintarTokens();
  marcar("ok", "new signup line ready, the roster is kept", "ok");
  el("alias").focus();
});

function reloj() {
  const d = new Date();
  el("reloj").textContent = dos(d.getHours()) + ":" + dos(d.getMinutes()) + ":" + dos(d.getSeconds());
}

marcar("::", "voidwatch raid console, patch 11.4, read only for the guild", "sistema");
marcar("::", "type the lines below, Tab completes, Enter sends the roster entry", "sistema");
marcar("ok", "roster loaded, 4 of 5 slots still open for Thursday", "ok");
marcar("..", "waiting for the first signup line", "aviso");
pintarTokens();
reloj();
window.setInterval(reloj, 1000);
