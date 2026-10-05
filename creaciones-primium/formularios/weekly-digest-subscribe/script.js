const form = document.getElementById("form");
const email = document.getElementById("email");
const consent = document.getElementById("consent");
const btnEnviar = document.getElementById("enviar");
const textoEnviar = document.getElementById("enviarTexto");
const resumenError = document.getElementById("resumenError");
const listaError = document.getElementById("resumenLista");
const tituloError = document.getElementById("resumenTitulo");
const sello = document.getElementById("sello");

const TIRADOS = ["mailinator.com", "guerrillamail.com", "tempmail.example", "yopmail.com", "trashmail.com", "example.com"];

const CADENCIAS = {
  semanal: {
    boton: "cad-semanal",
    titulo: "Every Friday",
    ayuda: "Every Friday, the default. The other two arrive at the same time of day, just less often.",
    cuando: "this Friday at four"
  },
  quincenal: {
    boton: "cad-quincenal",
    titulo: "Every other Friday",
    ayuda: "Every other Friday, so about twenty six a year. Half the mail, and the same hand behind it.",
    cuando: "the Friday after next, at four"
  },
  mensual: {
    boton: "cad-mensual",
    titulo: "First Monday of the month",
    ayuda: "The first Monday of the month, once a year that is twelve. The quietest option and the easiest to keep up with.",
    cuando: "the first Monday of next month, at nine"
  }
};

let cadencia = "semanal";

function el(id) { return document.getElementById(id); }

function veredicto(v) {
  if (v === "") return "vacio";
  if (!/^[^\s@,;]+@[^\s@,;]+\.[A-Za-z]{2,}$/.test(v)) return "forma";
  if (TIRADOS.includes(v.split("@")[1].toLowerCase())) return "tirado";
  if (v.split("@")[1].toLowerCase() === "example.com") return "tirado";
  return "ok";
}

function pintarEmail() {
  const env = email.closest(".campo");
  const ayuda = el("email-ayuda");
  const err = el("email-err");
  const v = email.value.trim();
  const r = veredicto(v);
  const desc = [ayuda.id];

  if (r === "ok") {
    env.dataset.estado = "ok";
    email.setAttribute("aria-invalid", "false");
    err.textContent = "";
    ayuda.textContent = v.split("@")[1] + " is a real domain, and the digest goes out on " +
      CADENCIAS[cadencia].titulo.toLowerCase() + ".";
  } else {
    env.dataset.estado = "error";
    email.setAttribute("aria-invalid", "true");
    desc.push(err.id);
    if (r === "vacio") {
      err.textContent = "We need an address to send the confirmation to. One field, that is all.";
      ayuda.textContent = "Try kate@ or name@mailinator.com to watch the check refuse them. A personal address works, a throwaway one does not.";
    } else if (r === "forma") {
      err.textContent = "That is not the shape name@domain.tld the mail server expects. Check for a missing dot.";
      ayuda.textContent = "There is no dot in " + (v.includes("@") ? "that" : v.split("@")[1] || "the domain") + ", and the mail server needs one.";
    } else {
      err.textContent = v.split("@")[1] + " is a throwaway inbox. We do not put the digest on a list that is thrown away.";
      ayuda.textContent = "Use an address you will still read in a year, the list outlives the inbox.";
    }
  }

  email.setAttribute("aria-describedby", desc.join(" "));
  return r !== "ok";
}

function pintarConsent() {
  const env = consent.closest(".campo");
  const err = el("consent-err");
  if (consent.checked) {
    env.dataset.estado = "ok";
    err.textContent = "";
    consent.setAttribute("aria-invalid", "false");
  } else {
    env.dataset.estado = "neutro";
    err.textContent = "";
    consent.setAttribute("aria-invalid", "false");
  }
}

function cambiarCadencia(nueva) {
  cadencia = nueva;
  Object.keys(CADENCIAS).forEach(k => {
    el(CADENCIAS[k].boton).setAttribute("aria-pressed", String(k === nueva));
  });
  el("cadencia-ayuda").textContent = CADENCIAS[nueva].ayuda;
  el("intro").textContent = nueva === "mensual"
    ? "What the shop did last month, in one page, written by a person. No offers, no sponsored posts, and one click in every mail leaves you out for good."
    : "What the shop did this week, in one page, written by a person. No offers, no sponsored posts, and one click in every mail leaves you out for good.";
  if (email.value.trim() !== "" && veredicto(email.value.trim()) === "ok") pintarEmail();
}

function problemas() {
  const salida = [];
  const v = email.value.trim();
  const r = veredicto(v);
  if (r !== "ok") {
    if (r === "vacio") salida.push("Work email: we need an address to send the confirmation to.");
    else if (r === "forma") salida.push("Work email: that is not the shape name@domain.tld the mail server expects.");
    else salida.push("Work email: " + v.split("@")[1] + " is a throwaway inbox.");
  }
  if (!consent.checked) {
    salida.push("Consent: the double opt in has to be ticked, otherwise we cannot prove the address is yours.");
  }
  return salida;
}

function mostrarResumen(fallos) {
  tituloError.textContent = fallos.length === 1
    ? "One thing is stopping the digest"
    : fallos.length + " things are stopping the digest";
  listaError.innerHTML = "";
  fallos.forEach(t => {
    const li = document.createElement("li");
    li.textContent = t;
    listaError.appendChild(li);
  });
  resumenError.hidden = false;
}

function soltarConfeti() {
  const caja = el("confeti");
  caja.innerHTML = "";
  const colores = ["#7ec8ff", "#6fe0a8", "#d8e86a", "#ff9a52", "#eef3f9"];
  for (let k = 0; k < 26; k++) {
    const trozo = document.createElement("span");
    trozo.style.left = (4 + Math.random() * 92) + "%";
    trozo.style.top = "-6%";
    trozo.style.background = colores[k % colores.length];
    trozo.style.animationDelay = (Math.random() * 0.9).toFixed(2) + "s";
    trozo.style.animationDuration = (2.1 + Math.random() * 1.4).toFixed(2) + "s";
    caja.appendChild(trozo);
  }
}

email.addEventListener("input", () => {
  if (email.closest(".campo").dataset.estado === "error") pintarEmail();
});

email.addEventListener("blur", pintarEmail);

consent.addEventListener("change", () => {
  pintarConsent();
  if (consent.closest(".campo").dataset.estado === "error") el("consent-ayuda").textContent =
    "Ticked. One confirmation mail, and the digest only starts once you press the link inside it.";
});

Object.keys(CADENCIAS).forEach(k => {
  el(CADENCIAS[k].boton).addEventListener("click", () => cambiarCadencia(k));
});

form.addEventListener("submit", e => {
  e.preventDefault();
  pintarEmail();
  pintarConsent();
  const fallos = problemas();

  if (fallos.length > 0) {
    mostrarResumen(fallos);
    if (veredicto(email.value.trim()) !== "ok") email.focus();
    else consent.focus();
    return;
  }

  resumenError.hidden = true;
  const v = email.value.trim();
  const cad = CADENCIAS[cadencia];

  el("dMail").textContent = v;
  el("dNum").textContent = "FR-" + String(Math.floor(10000 + Math.random() * 89999));
  el("dCuando").textContent = cad.cuando;
  el("selloTitulo").textContent = "Check your inbox, " + v.split("@")[0];
  el("selloLead").textContent = "One confirmation mail is on its way to " + v +
    ". The digest starts once you press the link inside, and the first one lands " + cad.cuando + ".";

  textoEnviar.textContent = "Saving the address";
  btnEnviar.disabled = true;

  window.setTimeout(() => {
    form.hidden = true;
    document.querySelector(".pauta-impresa").hidden = true;
    sello.hidden = false;
    soltarConfeti();
    sello.focus();
    btnEnviar.disabled = false;
    textoEnviar.textContent = "Put me on the digest";
  }, 520);
});

el("otra").addEventListener("click", () => {
  form.reset();
  email.closest(".campo").dataset.estado = "neutro";
  el("email-err").textContent = "";
  email.setAttribute("aria-invalid", "false");
  email.setAttribute("aria-describedby", "email-ayuda");
  consent.closest(".campo").dataset.estado = "neutro";
  el("email-ayuda").textContent = "Try kate@ or name@mailinator.com to watch the check refuse them. A personal address works, a throwaway one does not.";
  el("cadencia-ayuda").textContent = CADENCIAS.semanal.ayuda;
  resumenError.hidden = true;
  sello.hidden = true;
  form.hidden = false;
  document.querySelector(".pauta-impresa").hidden = false;
  cambiarCadencia("semanal");
  email.focus();
});

cambiarCadencia("semanal");
