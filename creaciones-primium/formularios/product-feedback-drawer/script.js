const form = document.getElementById("form");
const cajon = document.getElementById("cajon");
const velo = document.getElementById("velo");
const btnAbrir = document.getElementById("abrir");
const btnCerrar = document.getElementById("cerrar");
const enviado = document.getElementById("enviado");
const resumenError = document.getElementById("resumenError");
const listaError = document.getElementById("resumenErrorLista");
const tituloError = document.getElementById("resumenErrorTitulo");

const CATEGORIAS = ["cat_envio", "cat_calidad", "cat_atencion", "cat_precio", "cat_web", "cat_accesibilidad"];

const NIVELES = {
  bajo: "Nos ha decepcionado, cuéntanos qué ha fallado",
  medio: "Ha estado bien, aunque hay detalles que mejorar",
  alto: "Nos encanta, gracias por contarlo"
};

const CAMPOS = [
  {
    id: "satisfaccion",
    etiqueta: "Satisfacción",
    vacio: "",
    error: "",
    prueba: v => /^\d{1,2}$/.test(v) && Number(v) >= 0 && Number(v) <= 10,
    rango: true
  },
  {
    id: "cat",
    etiqueta: "Temas del comentario",
    vacio: "Marca al menos un tema para que llegue al equipo adecuado.",
    error: "Marca entre uno y seis temas.",
    prueba: () => CATEGORIAS.filter(c => el(c).checked).length > 0
  },
  {
    id: "notas",
    etiqueta: "Notas",
    vacio: "Escríbenos al menos un par de líneas sobre tu experiencia.",
    error: "Entre 20 y 600 caracteres.",
    prueba: v => v.length >= 20 && v.length <= 600
  },
  {
    id: "correo",
    etiqueta: "Correo de respuesta",
    vacio: "",
    error: "Revisa el formato: nombre@dominio.com",
    prueba: v => v === "" || /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(v),
    opcional: true
  }
];

function el(id) { return document.getElementById(id); }

function valorCampo(f) {
  if (f.id === "cat") return CATEGORIAS.filter(c => el(c).checked).map(c => el(c).value).join(", ");
  return el(f.id).value.trim();
}

function referencia(f) {
  return f.id === "cat" ? el("cat_envio") : el(f.id);
}

function pintar(f) {
  const control = referencia(f);
  const env = control.closest(".campo");
  const ayuda = el(f.id + "-ayuda");
  const error = el(f.id + "-error");
  const valor = valorCampo(f);
  const malo = !f.prueba(valor);
  const desc = [ayuda.id];

  if (f.rango) {
    env.dataset.estado = "ok";
    control.removeAttribute("aria-invalid");
    control.setAttribute("aria-describedby", ayuda.id);
    return false;
  }

  if (malo) {
    env.dataset.estado = "error";
    control.setAttribute("aria-invalid", "true");
    desc.push(error.id);
    error.textContent = valor === "" ? f.vacio : f.error;
  } else {
    env.dataset.estado = f.opcional && valor === "" ? "neutro" : "ok";
    control.removeAttribute("aria-invalid");
  }
  control.setAttribute("aria-describedby", desc.join(" "));
  return malo;
}

function actualizarLectura() {
  const v = Number(el("satisfaccion").value);
  const n = el("lecturaNum");
  n.textContent = String(v);
  n.dataset.nivel = v <= 3 ? "bajo" : v <= 6 ? "medio" : "alto";
  el("lecturaTexto").textContent = NIVELES[n.dataset.nivel];
  el("satisfaccion").setAttribute("aria-valuetext", v + " de 10. " + NIVELES[n.dataset.nivel]);
}

el("satisfaccion").addEventListener("input", () => {
  actualizarLectura();
  pintar(CAMPOS[0]);
});

el("satisfaccion").addEventListener("blur", () => pintar(CAMPOS[0]));

CATEGORIAS.forEach(id => {
  el(id).addEventListener("change", () => {
    if (el("cat_envio").closest(".campo").dataset.estado === "error") pintar(CAMPOS[1]);
  });
  el(id).addEventListener("blur", () => pintar(CAMPOS[1]));
});

el("notas").addEventListener("input", () => {
  el("notasCuenta").textContent = String(el("notas").value.length) + " de 600";
  if (el("notas").closest(".campo").dataset.estado === "error") pintar(CAMPOS[2]);
});

el("notas").addEventListener("blur", () => pintar(CAMPOS[2]));
el("correo").addEventListener("blur", () => pintar(CAMPOS[3]));
el("correo").addEventListener("input", () => {
  if (el("correo").closest(".campo").dataset.estado === "error") pintar(CAMPOS[3]);
});

function problemas() {
  return CAMPOS.filter(f => !f.prueba(valorCampo(f)));
}

let ultimoFoco = null;

function enfocarPrimero() {
  const control = document.querySelector("#cajon input, #cajon textarea, #cajon button");
  if (control) control.focus();
}

function abrir() {
  ultimoFoco = document.activeElement;
  velo.hidden = false;
  cajon.hidden = false;
  btnAbrir.setAttribute("aria-expanded", "true");
  enfocarPrimero();
}

function cerrar() {
  velo.hidden = true;
  cajon.hidden = true;
  btnAbrir.setAttribute("aria-expanded", "false");
  if (ultimoFoco && typeof ultimoFoco.focus === "function") ultimoFoco.focus();
}

btnAbrir.addEventListener("click", abrir);
btnCerrar.addEventListener("click", cerrar);
velo.addEventListener("click", cerrar);

document.addEventListener("keydown", e => {
  if (cajon.hidden) return;

  if (e.key === "Escape") {
    e.preventDefault();
    cerrar();
    return;
  }

  if (e.key !== "Tab") return;
  const focusables = Array.from(cajon.querySelectorAll("input, textarea, button, [href], select"))
    .filter(n => !n.disabled && n.offsetParent !== null);
  if (focusables.length === 0) return;
  const primero = focusables[0];
  const ultimo = focusables[focusables.length - 1];
  if (e.shiftKey && document.activeElement === primero) {
    e.preventDefault();
    ultimo.focus();
  } else if (!e.shiftKey && document.activeElement === ultimo) {
    e.preventDefault();
    primero.focus();
  }
});

form.addEventListener("submit", e => {
  e.preventDefault();
  CAMPOS.forEach(pintar);
  const fallos = problemas();

  if (fallos.length > 0) {
    tituloError.textContent = fallos.length === 1
      ? "Falta un detalle para enviarlo"
      : "Faltan " + fallos.length + " detalles para enviarlo";
    listaError.innerHTML = "";
    fallos.forEach(f => {
      const li = document.createElement("li");
      li.textContent = f.etiqueta + ": " + (valorCampo(f) === "" ? f.vacio : f.error);
      listaError.appendChild(li);
    });
    resumenError.hidden = false;
    const destino = fallos[0].id === "cat" ? el("cat_envio") : el(fallos[0].id);
    destino.focus();
    destino.scrollIntoView({ block: "center" });
    return;
  }

  resumenError.hidden = true;
  const v = Number(el("satisfaccion").value);
  const temas = CATEGORIAS.filter(c => el(c).checked).map(c => el(c).value);
  el("eNota").textContent = v + " de 10 · " + NIVELES[el("lecturaNum").dataset.nivel].toLowerCase();
  el("eTemas").textContent = temas.length + ": " + temas.join(", ");
  el("eRef").textContent = "FB-" + String(Math.floor(100000 + Math.random() * 900000));
  el("eRespuesta").textContent = el("correo").value.trim() ? "en " + el("correo").value.trim() : "no solicitada";
  el("eCita").textContent = "«" + el("notas").value.trim() + "»";
  el("enviadoTexto").textContent = v <= 6
    ? "Lo revisamos a mano esta misma semana y te escribimos si hace falta algo más."
    : "Gracias por escribirnos. Le damos una vuelta al equipo esta misma semana.";
  form.hidden = true;
  enviado.hidden = false;
  enviado.focus();
});

el("otra").addEventListener("click", () => {
  form.reset();
  form.hidden = false;
  enviado.hidden = true;
  CAMPOS.forEach(f => {
    const env = referencia(f).closest(".campo");
    env.dataset.estado = "neutro";
    const control = referencia(f);
    control.removeAttribute("aria-invalid");
    control.setAttribute("aria-describedby", f.id + "-ayuda");
    el(f.id + "-error").textContent = "";
  });
  el("notasCuenta").textContent = "0 de 600";
  resumenError.hidden = true;
  actualizarLectura();
  el("satisfaccion").focus();
});

actualizarLectura();
