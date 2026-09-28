const form = document.getElementById("form");
const entradaCorreo = document.getElementById("correo");
const panel = document.getElementById("panel");
const resumenError = document.getElementById("resumenError");
const listaError = document.getElementById("resumenErrorLista");
const tituloError = document.getElementById("resumenErrorTitulo");
const altaLista = document.getElementById("altaLista");

const PLANES = ["plan_esencial", "plan_editorial", "plan_colectivo"];
const PERIODOS = ["per_mensual", "per_anual"];

const CAMPOS = [
  {
    id: "correo",
    etiqueta: "Correo electrónico",
    vacio: "Escribe un correo para empezar la suscripción.",
    error: "Revisa el formato: nombre@dominio.com",
    prueba: v => /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(v)
  },
  {
    id: "plan",
    etiqueta: "Plan",
    vacio: "Despliega el panel con el correo y elige un plan.",
    error: "Elige uno de los tres planes del club.",
    prueba: v => ["Esencial", "Editorial", "Colectivo"].indexOf(v) !== -1
  },
  {
    id: "periodicidad",
    etiqueta: "Periodicidad",
    vacio: "Elige si prefieres pagar mes a mes o el año entero.",
    error: "Esa periodicidad no es válida.",
    prueba: v => v === "Mensual" || v === "Anual"
  },
  {
    id: "renovacion",
    etiqueta: "Renovación automática",
    vacio: "",
    error: "Indica si quieres renovación automática.",
    prueba: v => v === "si" || v === "no",
    opcional: true
  }
];

function el(id) { return document.getElementById(id); }

function valorCampo(f) {
  if (f.id === "renovacion") return el("renovacion").checked ? "si" : "no";
  if (f.id === "plan") {
    const marcada = form.querySelector('input[name="plan"]:checked');
    return marcada ? marcada.value : "";
  }
  if (f.id === "periodicidad") {
    const marcada = form.querySelector('input[name="periodicidad"]:checked');
    return marcada ? marcada.value : "";
  }
  return el(f.id).value.trim();
}

function referencia(f) {
  if (f.id === "renovacion") return el("renovacion");
  if (f.id === "plan") return el("plan_esencial");
  if (f.id === "periodicidad") return el("per_mensual");
  return el("correo");
}

function contenedor(f) {
  return referencia(f).closest(".campo");
}

function pintarCorreo() {
  const env = el("correo").closest(".campo");
  const ayuda = el("correo-ayuda");
  const error = el("correo-error");
  const valor = el("correo").value.trim();
  const malo = !CAMPOS[0].prueba(valor);
  const desc = [ayuda.id];

  if (malo) {
    env.dataset.estado = "error";
    el("correo").setAttribute("aria-invalid", "true");
    desc.push(error.id);
    error.textContent = valor === "" ? CAMPOS[0].vacio : CAMPOS[0].error;
  } else {
    env.dataset.estado = "ok";
    el("correo").removeAttribute("aria-invalid");
  }
  el("correo").setAttribute("aria-describedby", desc.join(" "));
  return malo;
}

function pintarPlanes() {
  const env = document.querySelector("#planes").closest(".campo") || el("plan_esencial").closest(".campo");
  const ayuda = el("planes-ayuda");
  const error = el("planes-error");
  const marcado = form.querySelector('input[name="plan"]:checked');
  const malo = !marcado;
  const desc = [ayuda.id];

  if (malo) {
    env.dataset.estado = "error";
    el("plan_esencial").setAttribute("aria-invalid", "true");
    desc.push(error.id);
    error.textContent = CAMPOS[1].vacio;
    ayuda.textContent = "Los tres planes incluyen acceso al archivo. El edición añade el envío en papel.";
  } else {
    env.dataset.estado = "ok";
    el("plan_esencial").removeAttribute("aria-invalid");
    ayuda.textContent = "Puedes cambiar de plan o cancelar en dos clics desde el correo que te enviamos.";
  }
  el("plan_esencial").setAttribute("aria-describedby", desc.join(" "));
  return malo;
}

function pintarGrupo(grupo, f) {
  const env = referencia(f).closest(".campo") || el("conmutador");
  if (grupo === "periodicidad") {
    const malo = !f.prueba(valorCampo(f));
    env.dataset.estado = malo ? "error" : "ok";
    el("per_mensual").setAttribute("aria-invalid", malo ? "true" : "false");
    if (malo) {
      el("periodicidad-error").textContent = f.vacio;
      el("per_mensual").setAttribute("aria-describedby", "planes-ayuda periodicidad-error");
    } else {
      el("per_mensual").setAttribute("aria-describedby", "planes-ayuda");
    }
    return malo;
  }
  return pintarPlanes();
}

function euros(n) {
  return n.toFixed(2).replace(".", ",") + " €";
}

function calcular() {
  const plan = form.querySelector('input[name="plan"]:checked');
  const periodo = form.querySelector('input[name="periodicidad"]:checked');
  const anual = periodo ? periodo.value === "Anual" : false;
  if (!plan) {
    return { importe: 0, ahorro: 0, periodo: periodo ? periodo.value : "Mensual", plan: null };
  }
  const cifra = plan.closest("label").querySelector(".plan-cifra");
  const mensual = Number(String(cifra.dataset.mensual).replace(",", "."));
  const anualPrecio = Number(String(cifra.dataset.anual).replace(",", "."));
  const importe = anual ? anualPrecio : mensual;
  const ahorro = anual ? Math.round((mensual * 12 - anualPrecio) * 100) / 100 : 0;
  return { importe: importe, ahorro: ahorro, periodo: anual ? "Anual" : "Mensual", plan: plan.value };
}

function actualizarResumen() {
  const t = calcular();
  const anual = t.periodo === "Anual";
  el("sPlan").textContent = t.plan || "sin elegir";
  el("sPeriodo").textContent = t.periodo;
  el("sImporte").textContent = t.plan ? euros(t.importe) + (anual ? " al año" : " al mes") : "0,00 €";
  el("sAhorro").textContent = t.ahorro > 0 ? euros(t.ahorro) : "0,00 €";
  el("sTotal").textContent = t.plan ? euros(t.importe) : "0,00 €";
  el("sNota").textContent = !t.plan
    ? "Elige un plan para ver el desglose."
    : anual
      ? "Pagas " + euros(t.importe) + " hoy y la renovación anual se renueva dentro de un año. Ahorras " + euros(t.ahorro) + " frente a doce meses sueltos."
      : "Pagas " + euros(t.importe) + " hoy y se renueva cada mes" + (el("renovacion").checked ? " automáticamente." : " solo cuando confirmes.");
}

function marcarPrecios() {
  const anual = (form.querySelector('input[name="periodicidad"]:checked') || {}).value === "Anual";
  Array.from(document.querySelectorAll(".plan-cifra")).forEach(c => {
    c.textContent = anual ? c.dataset.anual : c.dataset.mensual;
  });
  Array.from(document.querySelectorAll(".plan-extra")).forEach(p => {
    p.textContent = anual ? p.dataset.anual : "Se renueva cada mes hasta que lo canceles.";
  });
}

function abrirPanel(abrir) {
  if (abrir && panel.hidden) {
    panel.hidden = false;
    entradaCorreo.setAttribute("aria-expanded", "true");
  } else if (!abrir && !panel.hidden) {
    panel.hidden = true;
    entradaCorreo.setAttribute("aria-expanded", "false");
  }
  el("invitacion").hidden = !panel.hidden;
}

form.addEventListener("focusin", e => {
  if (form.contains(e.target)) abrirPanel(true);
});

form.addEventListener("focusout", e => {
  window.setTimeout(() => {
    if (!form.contains(document.activeElement)) abrirPanel(false);
  }, 90);
});

entradaCorreo.addEventListener("blur", pintarCorreo);
entradaCorreo.addEventListener("input", () => {
  if (el("correo").closest(".campo").dataset.estado === "error") pintarCorreo();
});

PLANES.forEach(id => {
  el(id).addEventListener("change", () => {
    if (!panel.hidden) pintarPlanes();
    actualizarResumen();
  });
  el(id).addEventListener("blur", pintarPlanes);
});

PERIODOS.forEach(id => {
  el(id).addEventListener("change", () => {
    marcarPrecios();
    actualizarResumen();
    if (!el("planes-error").textContent) {
      el("conmutador").dataset.estado = "ok";
    }
  });
  el(id).addEventListener("blur", () => pintarGrupo("periodicidad", CAMPOS[2]));
});

el("renovacion").addEventListener("change", () => {
  const env = el("renovacion").closest(".campo");
  env.dataset.estado = "ok";
  el("renovacion").removeAttribute("aria-invalid");
  el("renovacion").setAttribute("aria-describedby", "renovacion-ayuda");
  el("renovacion-error").textContent = "";
  actualizarResumen();
});

el("renovacion").addEventListener("blur", () => {
  if (el("renovacion").closest(".campo").dataset.estado === "neutro") {
    el("renovacion").closest(".campo").dataset.estado = "ok";
  }
});

function problemas() {
  return CAMPOS.filter(f => !f.prueba(valorCampo(f)));
}

form.addEventListener("submit", e => {
  e.preventDefault();
  pintarCorreo();
  pintarPlanes();
  pintarGrupo("periodicidad", CAMPOS[2]);
  const fallos = problemas();

  if (fallos.length > 0) {
    tituloError.textContent = fallos.length === 1
      ? "Falta un paso para completar el alta"
      : "Faltan " + fallos.length + " pasos para completar el alta";
    listaError.innerHTML = "";
    fallos.forEach(f => {
      const li = document.createElement("li");
      li.textContent = f.etiqueta + ": " + (valorCampo(f) === "" ? f.vacio : f.error);
      listaError.appendChild(li);
    });
    resumenError.hidden = false;
    abrirPanel(true);
    referencia(fallos[0]).focus();
    return;
  }

  resumenError.hidden = true;
  const correo = el("correo").value.trim();
  const t = calcular();
  el("aSocia").textContent = correo;
  el("aPlan").textContent = t.plan + " · " + t.periodo;
  el("aImporte").textContent = euros(t.importe) + (t.ahorro > 0 ? " (ahorras " + euros(t.ahorro) + ")" : "");
  el("aNumero").textContent = "SO-" + String(Math.floor(100000 + Math.random() * 900000));
  el("altaTexto").textContent = "Gracias. Hemos enviado el número de enero a " + correo + " y ya puedes entrar con la contraseña que elijas en el correo.";
  form.hidden = true;
  document.querySelector(".cab").hidden = true;
  altaLista.hidden = false;
  altaLista.focus();
});

el("otra").addEventListener("click", () => {
  form.reset();
  form.hidden = false;
  document.querySelector(".cab").hidden = false;
  altaLista.hidden = true;
  panel.hidden = true;
  entradaCorreo.setAttribute("aria-expanded", "false");
  el("invitacion").hidden = false;
  el("correo").closest(".campo").dataset.estado = "neutro";
  el("renovacion").checked = true;
  el("renovacion").closest(".campo").dataset.estado = "neutro";
  panel.dataset.estado = "neutro";
  el("correo").removeAttribute("aria-invalid");
  el("correo").setAttribute("aria-describedby", "correo-ayuda");
  el("correo-error").textContent = "";
  el("planes-error").textContent = "";
  el("plan_esencial").removeAttribute("aria-invalid");
  el("plan_esencial").setAttribute("aria-describedby", "planes-ayuda");
  resumenError.hidden = true;
  marcarPrecios();
  actualizarResumen();
  el("correo").focus();
});

marcarPrecios();
actualizarResumen();
