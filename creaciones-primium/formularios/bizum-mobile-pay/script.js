const form = document.getElementById("form");
const resumenError = document.getElementById("resumenError");
const listaError = document.getElementById("resumenErrorLista");
const tituloError = document.getElementById("resumenErrorTitulo");
const listo = document.getElementById("listo");

const CAMPOS = [
  {
    id: "telefono",
    etiqueta: "Teléfono",
    vacio: "Escribe el número de móvil asociado a tu Bizum.",
    error: "Nueve cifras empezando por 6, 7 u 8.",
    prueba: v => /^[678]\d{8}$/.test(v)
  },
  {
    id: "alias",
    etiqueta: "Alias Bizum",
    vacio: "Necesitamos el alias de quien va a cobrar.",
    error: "De 4 a 20 caracteres: letras, números, punto y guion.",
    prueba: v => /^[A-Za-z0-9._-]{4,20}$/.test(v)
  },
  {
    id: "importe",
    etiqueta: "Importe",
    vacio: "Indica el importe exacto que hay que enviar.",
    error: "Un número entre 0,01 y 5000,00 con coma o punto decimal.",
    prueba: v => {
      if (!/^\d{1,4}([.,]\d{1,2})?$/.test(v)) return false;
      const n = Number(v.replace(",", "."));
      return n >= 0.01 && n <= 5000;
    }
  }
];

function el(id) { return document.getElementById(id); }

function euros(n) {
  return n.toFixed(2).replace(".", ",") + " €";
}

function valorImporte() {
  const v = el("importe").value.trim();
  return Number(v.replace(",", "."));
}

function pintar(f) {
  const control = el(f.id);
  const env = control.closest(".campo");
  const ayuda = el(f.id + "-ayuda");
  const error = el(f.id + "-error");
  const valor = control.value.trim();
  const malo = !f.prueba(valor);
  const desc = [ayuda.id];

  if (malo) {
    env.dataset.estado = "error";
    control.setAttribute("aria-invalid", "true");
    desc.push(error.id);
    error.textContent = valor === "" ? f.vacio : f.error;
  } else {
    env.dataset.estado = "ok";
    control.removeAttribute("aria-invalid");
  }
  control.setAttribute("aria-describedby", desc.join(" "));
  return malo;
}

function problemas() {
  return CAMPOS.filter(f => !f.prueba(el(f.id).value.trim()));
}

function actualizarJustificante() {
  const tel = el("telefono").value.trim();
  const alias = el("alias").value.trim();
  const imp = el("importe").value.trim();
  el("jDesde").textContent = tel ? "Bizum " + "+34 " + tel.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3") : "Cuenta Bizum sin definir";
  el("jHacia").textContent = alias || "Alias sin definir";
  el("jImporte").textContent = imp && !isNaN(valorImporte()) ? euros(valorImporte()) : "sin definir";
  el("totalVivo").textContent = imp && !isNaN(valorImporte()) ? euros(valorImporte()) : "24,90 €";
}

CAMPOS.forEach(f => {
  const control = el(f.id);
  control.addEventListener("blur", () => pintar(f));
  control.addEventListener("input", () => {
    if (control.closest(".campo").dataset.estado === "error") pintar(f);
    actualizarJustificante();
  });
});

el("telefono").addEventListener("input", () => {
  el("telefono").value = el("telefono").value.replace(/\D/g, "").slice(0, 9);
  actualizarJustificante();
});

el("alias").addEventListener("input", () => {
  el("alias").value = el("alias").value.replace(/\s/g, "");
  actualizarJustificante();
});

el("importe").addEventListener("input", () => {
  let v = el("importe").value.replace(/[^\d.,]/g, "");
  const partes = v.split(/[.,]/);
  if (partes.length > 2) v = partes[0] + "," + partes.slice(1).join("");
  if (/[.,]\d{3,}$/.test(v)) v = v.replace(/(\d)([.,]\d{2}).*$/, "$1$2");
  el("importe").value = v;
  actualizarJustificante();
});

form.addEventListener("submit", e => {
  e.preventDefault();
  CAMPOS.forEach(pintar);
  const fallos = problemas();

  if (fallos.length > 0) {
    tituloError.textContent = fallos.length === 1
      ? "Falta un dato en la barra"
      : "Faltan " + fallos.length + " datos en la barra";
    listaError.innerHTML = "";
    fallos.forEach(f => {
      const li = document.createElement("li");
      li.textContent = f.etiqueta + ": " + (el(f.id).value.trim() === "" ? f.vacio : f.error);
      listaError.appendChild(li);
    });
    resumenError.hidden = false;
    el(fallos[0].id).focus();
    return;
  }

  resumenError.hidden = true;
  const tel = el("telefono").value.trim();
  const alias = el("alias").value.trim();
  const importe = valorImporte();
  el("lOp").textContent = "BZ-" + String(Math.floor(100000 + Math.random() * 900000));
  el("lDest").textContent = alias + " · +34 " + tel;
  el("lImporte").textContent = euros(importe);
  el("listoTexto").textContent = "Hemos enviado la solicitud a +34 " + tel + ". Abre la notificación de tu banco y confirma con tu PIN antes de que caduque.";
  form.hidden = true;
  document.querySelector(".justificante").hidden = true;
  document.querySelector(".concepto").hidden = true;
  listo.hidden = false;
  listo.focus();
});

el("otra").addEventListener("click", () => {
  form.reset();
  form.hidden = false;
  document.querySelector(".justificante").hidden = false;
  document.querySelector(".concepto").hidden = false;
  listo.hidden = true;
  CAMPOS.forEach(f => {
    const env = el(f.id).closest(".campo");
    env.dataset.estado = "neutro";
    el(f.id).removeAttribute("aria-invalid");
    el(f.id).setAttribute("aria-describedby", f.id + "-ayuda");
    el(f.id + "-error").textContent = "";
  });
  actualizarJustificante();
  el("telefono").focus();
});

actualizarJustificante();
