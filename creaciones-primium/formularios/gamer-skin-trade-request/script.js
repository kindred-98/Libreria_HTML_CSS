const form = document.getElementById("form");
const resumenError = document.getElementById("resumenError");
const listaError = document.getElementById("resumenErrorLista");
const tituloError = document.getElementById("resumenErrorTitulo");
const registrada = document.getElementById("registrada");
const balanza = document.getElementById("balanza");
const balanzaRelleno = document.getElementById("balanzaRelleno");
const anclasLista = document.getElementById("anclasLista");
const anclasBarra = document.getElementById("anclasBarra");
const anclasCifra = document.getElementById("anclasCifra");
const anclasMedidor = document.getElementById("anclasMedidor");

const ITEMS = {
  "ak47-neon": "AK-47 | Neon Rift, Factory New",
  "m4a1-ghost": "M4A1-S | Ghost Circuit, Minimal Wear",
  "karambit-fade": "Karambit | Fade, Factory New",
  "glock-tide": "Glock-18 | Tidewater, Field-Tested",
  "aWP-dragon": "AWP | Dragon Coil, Souvenir",
  "usps-silver": "USP-S | Silverline, Factory New",
  "deagle-tide": "Desert Eagle | Tidal, Minimal Wear"
};

const SECCIONES = [
  { id: "sec-1", texto: "What you offer" },
  { id: "sec-2", texto: "What you want" },
  { id: "sec-3", texto: "Platform" },
  { id: "sec-4", texto: "Your message" },
  { id: "sec-5", texto: "Trade safety" },
  { id: "sec-6", texto: "Contact" }
];

const CAMPOS = [
  {
    id: "miItem",
    etiqueta: "Your item",
    vacio: "Pick the item you would send. Without it there is nothing to review.",
    error: "That item is not in the catalogue any more, so it cannot be offered.",
    prueba: v => Object.hasOwn(ITEMS, v)
  },
  {
    id: "miValor",
    etiqueta: "Value of your item",
    vacio: "Put a rough value on your side, even a rough one.",
    error: "A whole number between 1 and 99999, with no decimals and no thousands separator.",
    prueba: v => /^\d{1,5}$/.test(v) && Number(v) >= 1 && Number(v) <= 99999
  },
  {
    id: "suItem",
    etiqueta: "Wanted item",
    vacio: "Tell us which single item you want back.",
    error: "That item is not in the catalogue any more, so it cannot be asked for.",
    prueba: v => Object.hasOwn(ITEMS, v)
  },
  {
    id: "suValor",
    etiqueta: "Value you would pay",
    vacio: "Put a number on the wanted side so we can compare.",
    error: "A whole number between 1 and 99999, with no decimals and no thousands separator.",
    prueba: v => /^\d{1,5}$/.test(v) && Number(v) >= 1 && Number(v) <= 99999
  },
  {
    id: "plataforma",
    etiqueta: "Platform",
    vacio: "Choose the platform the items live on.",
    error: "That platform is not in the supported list.",
    prueba: v => ["steam", "xbox", "playstation", "epic", "battlenet"].includes(v)
  },
  {
    id: "modo",
    etiqueta: "Type of trade",
    vacio: "Say whether the trade moves credits or only items.",
    error: "That trade type is not on the desk list.",
    prueba: v => ["objetos", "creditos", "intercambio"].includes(v)
  },
  {
    id: "perfil",
    etiqueta: "Profile or trade URL",
    vacio: "We need a profile address or an offer link to file the request.",
    error: "Between 12 and 90 characters, and it has to start with a profile address or a link.",
    prueba: v => v.length >= 12 && v.length <= 90 && /^(https?:\/\/)?[a-z0-9.-]+\.[a-z]{2,}(\/|$)/i.test(v)
  },
  {
    id: "mensaje",
    etiqueta: "Message to the trader",
    vacio: "Write the message the trader will read, at least twenty characters.",
    error: "Between 20 and 600 characters, and the float or the condition is worth mentioning.",
    prueba: v => v.length >= 20 && v.length <= 600
  },
  {
    id: "nota",
    etiqueta: "Note for the moderator",
    vacio: "",
    error: "Keep the note under 300 characters, the panel is small.",
    prueba: v => v.length <= 300
  },
  {
    id: "listo",
    etiqueta: "Ready to trade now",
    vacio: "Tick the box, otherwise the request is marked offline and closed after five days.",
    error: "",
    prueba: v => v === "si"
  },
  {
    id: "g1",
    etiqueta: "Trade hold accepted",
    vacio: "The trade hold confirmation is compulsory.",
    error: "",
    prueba: v => v === "si"
  },
  {
    id: "g2",
    etiqueta: "Only desk offers",
    vacio: "The desk offer confirmation is compulsory.",
    error: "",
    prueba: v => v === "si"
  },
  {
    id: "g3",
    etiqueta: "Ticket on failure",
    vacio: "The failure policy confirmation is compulsory.",
    error: "",
    prueba: v => v === "si"
  },
  {
    id: "canal",
    etiqueta: "Preferred channel",
    vacio: "Choose where we answer you.",
    error: "That channel is not offered by the desk.",
    prueba: v => ["chat", "correo", "app"].includes(v)
  },
  {
    id: "contacto",
    etiqueta: "Handle or address",
    vacio: "Give us a handle or an address to reach you on.",
    error: "Between 4 and 60 characters. If you picked email it has to look like an address.",
    prueba: v => {
      if (v.length < 4 || v.length > 60) return false;
      if (el("canal").value === "correo") return /^[^\s@,;]+@[^\s@,;]+\.[a-zA-Z]{2,}$/.test(v);
      return /^[A-Za-z0-9._-]+$/.test(v);
    }
  }
];

function el(id) { return document.getElementById(id); }

function valor(f) {
  if (f.id === "nota") return el("nota").value.trim();
  if (el(f.id).type === "checkbox") return el(f.id).checked ? "si" : "";
  return el(f.id).value.trim();
}

function pintar(f) {
  const env = el(f.id).closest(".campo");
  const ayuda = el(f.id + "-ayuda");
  const err = el(f.id + "-err");
  const v = valor(f);
  const vacio = v === "";
  const mal = !vacio && !f.prueba(v);
  const falla = vacio || mal;
  const described = [ayuda.id];

  if (f.id === "nota" && vacio) {
    env.dataset.estado = "neutro";
    el(f.id).removeAttribute("aria-invalid");
    el(f.id).setAttribute("aria-describedby", ayuda.id);
    err.textContent = "";
    return false;
  }

  env.dataset.estado = falla ? "error" : "ok";
  el(f.id).setAttribute("aria-invalid", falla ? "true" : "false");
  if (falla) {
    described.push(err.id);
    err.textContent = vacio ? f.vacio : f.error;
  } else {
    err.textContent = "";
  }
  el(f.id).setAttribute("aria-describedby", described.join(" "));
  return falla;
}

function problema(f) {
  const v = valor(f);
  if (f.id === "nota") return v !== "" && !f.prueba(v);
  return v === "" || !f.prueba(v);
}

function pintarTodo() {
  let primero = null;
  CAMPOS.forEach(f => {
    const falla = pintar(f);
    if (falla && !primero) primero = el(f.id);
  });
  return primero;
}

function numeroValido(id) {
  const v = el(id).value.trim();
  return /^\d{1,5}$/.test(v) ? Number(v) : null;
}

function refrescarBalanza() {
  const a = numeroValido("miValor");
  const b = numeroValido("suValor");
  el("ladoOferta").textContent = a === null ? "0" : String(a);
  el("ladoPeticion").textContent = b === null ? "0" : String(b);
  const nota = el("balanzaNota");
  delete balanza.dataset.estado;

  if (a === null || b === null) {
    balanzaRelleno.style.transform = "scaleX(0)";
    nota.textContent = "Put a number on both sides and the difference appears here.";
    return;
  }

  const dif = ((b - a) / Math.max(a, b)) * 100;
  const escala = Math.min(Math.abs(dif) / 60, 1) * 0.5;
  balanzaRelleno.style.transform = "scaleX(" + escala.toFixed(3) + ")";

  if (Math.abs(dif) < 5) {
    balanza.dataset.estado = "equilibrado";
    nota.textContent = "Both sides are within " + Math.abs(dif).toFixed(0) + " per cent. A straight swap, no credits needed.";
  } else if (dif > 0) {
    balanza.dataset.estado = "desigual";
    nota.textContent = "The wanted side is " + dif.toFixed(0) + " per cent higher. You would need credits to close the gap.";
  } else {
    balanza.dataset.estado = "desigual";
    nota.textContent = "Your side is " + Math.abs(dif).toFixed(0) + " per cent higher, so you are the one overpaying. We will flag it.";
  }
}

function pips(id, total) {
  const caja = el(id);
  if (caja.childElementCount !== 10) {
    caja.innerHTML = "";
    for (let i = 0; i < 10; i++) caja.appendChild(document.createElement("i"));
  }
  const campo = id === "mensajePips" ? "mensaje" : "nota";
  const v = el(campo).value;
  const llenos = Math.min(10, Math.round((v.length / total) * 10));
  for (let i = 0; i < 10; i++) caja.children[i].dataset.on = i < llenos ? "1" : "0";
  const minimo = campo === "mensaje" ? ", 20 minimum" : ", optional";
  el(campo + "Cuenta").textContent = v.length + " of " + total + " characters" + minimo;
}

function pintarAnclas() {
  const bloqueados = [];
  SECCIONES.forEach(s => {
    const seccion = el(s.id);
    const rect = seccion.getBoundingClientRect();
    const alto = window.innerHeight;
    bloqueados.push({ id: s.id, fuerza: Math.max(0, Math.min(rect.top + 60, alto - 80)) });
  });
  let activa = bloqueados[0].id;
  bloqueados.forEach(b => { if (b.fuerza <= 40) activa = b.id; });

  anclasLista.querySelectorAll("li").forEach(li => {
    const i = SECCIONES.findIndex(s => s.id === li.dataset.sec);
    if (li.dataset.sec === activa) li.dataset.estado = "activo";
    else if (SECCIONES.findIndex(s => s.id === activa) > i) li.dataset.estado = "hecho";
    else li.dataset.estado = "espera";
  });

  const total = document.documentElement.scrollHeight - window.innerHeight;
  const leido = total > 0 ? Math.min(100, Math.max(0, Math.round((window.scrollY / total) * 100))) : 0;
  anclasBarra.style.setProperty("--pct", (leido / 100).toFixed(3));
  anclasCifra.textContent = leido + "%";
  anclasMedidor.setAttribute("aria-label", "Form " + leido + " percent read");
}

function montarAnclas() {
  SECCIONES.forEach(s => {
    const li = document.createElement("li");
    li.dataset.sec = s.id;
    li.dataset.estado = "espera";
    const a = document.createElement("a");
    a.href = "#" + s.id;
    a.textContent = s.texto;
    li.appendChild(a);
    anclasLista.appendChild(li);
  });
}

CAMPOS.forEach(f => {
  const nodo = el(f.id);
  nodo.addEventListener("blur", () => { pintar(f); refrescarBalanza(); });
  nodo.addEventListener("change", () => { pintar(f); refrescarBalanza(); });
  nodo.addEventListener("input", () => {
    if (nodo.closest(".campo").dataset.estado === "error") pintar(f);
    if (f.id === "mensaje" || f.id === "nota") {
      pips(f.id + "Pips", f.id === "mensaje" ? 600 : 300);
      el(f.id + "-ayuda").dataset.alerta = f.id === "mensaje" && nodo.value.length > 0 && nodo.value.length < 20 ? "1" : "0";
    }
    refrescarBalanza();
  });
});

el("miValor").addEventListener("input", () => { el("miValor").value = el("miValor").value.replace(/[^0-9]/g, "").slice(0, 5); });
el("suValor").addEventListener("input", () => { el("suValor").value = el("suValor").value.replace(/[^0-9]/g, "").slice(0, 5); });

form.addEventListener("submit", e => {
  e.preventDefault();
  const primero = pintarTodo();
  refrescarBalanza();

  const fallos = CAMPOS.filter(problema);
  if (fallos.length > 0) {
    tituloError.textContent = fallos.length === 1
      ? "One thing is still missing in this request"
      : fallos.length + " things are still missing in this request";
    listaError.innerHTML = "";
    fallos.forEach(f => {
      const li = document.createElement("li");
      const v = valor(f);
      li.textContent = f.etiqueta + ": " + (v === "" ? f.vacio : f.error);
      listaError.appendChild(li);
    });
    resumenError.hidden = false;
    if (primero) primero.focus();
    return;
  }

  resumenError.hidden = true;
  el("enviarTexto").textContent = "Filing, do not close the page";
  const boton = form.querySelector(".enviar");
  boton.disabled = true;
  window.setTimeout(terminar, 800);
});

function diferencia() {
  const a = numeroValido("miValor");
  const b = numeroValido("suValor");
  const d = ((b - a) / Math.max(a, b)) * 100;
  if (Math.abs(d) < 5) return "balanced";
  return (d > 0 ? "you pay " + d.toFixed(0) + "% more" : "you overpay by " + Math.abs(d).toFixed(0) + "%");
}

function terminar() {
  const ref = "TR-" + String(Math.floor(1000 + Math.random() * 8999));
  el("registradaRef").textContent = ref;
  el("registradaOfrece").textContent = ITEMS[el("miItem").value];
  el("registradaPide").textContent = ITEMS[el("suItem").value];
  el("registradaBalance").textContent = diferencia();
  el("registradaTitulo").textContent = "Request " + ref + " is in the queue";
  el("registradaLead").textContent = "A reviewer opens it now and sends the trade offer from the desk. We will answer on " +
    (el("canal").options[el("canal").selectedIndex].text.toLowerCase()) + ", never on a direct message from anyone else.";

  const lista = el("registradaPasos");
  lista.innerHTML = "";
  [
    "Inventory check on " + ITEMS[el("miItem").value] + ", float and stickers",
    el("modo").value === "creditos" ? "Second reviewer because the trade moves credits" : "Single reviewer, no credit movement",
    "Trade offer sent from the desk, never from your friend list",
    "Answer on " + el("canal").options[el("canal").selectedIndex].text.toLowerCase() + " to " + el("contacto").value.trim()
  ].forEach((t, i) => {
    const li = document.createElement("li");
    li.textContent = t;
    li.style.animationDelay = (0.1 + i * 0.09).toFixed(2) + "s";
    lista.appendChild(li);
  });

  document.querySelector(".escena").hidden = true;
  document.querySelector(".cabecera").hidden = true;
  registrada.hidden = false;
  registrada.focus();
}

el("otra").addEventListener("click", () => {
  registrada.hidden = true;
  document.querySelector(".escena").hidden = false;
  document.querySelector(".cabecera").hidden = false;
  form.reset();
  form.querySelector(".enviar").disabled = false;
  el("enviarTexto").textContent = "File the trade request";
  neutralizar();
  pintarAnclas();
  el("miItem").focus();
});

window.addEventListener("scroll", pintarAnclas, { passive: true });
window.addEventListener("resize", pintarAnclas);

function neutralizar() {
  CAMPOS.forEach(f => {
    el(f.id).closest(".campo").dataset.estado = "neutro";
    el(f.id).removeAttribute("aria-invalid");
    el(f.id).setAttribute("aria-describedby", f.id + "-ayuda");
    el(f.id + "-err").textContent = "";
  });
  el("mensaje-ayuda").dataset.alerta = "0";
  resumenError.hidden = true;
  pips("mensajePips", 600);
  pips("notaPips", 300);
  refrescarBalanza();
}

montarAnclas();
neutralizar();
pintarAnclas();
