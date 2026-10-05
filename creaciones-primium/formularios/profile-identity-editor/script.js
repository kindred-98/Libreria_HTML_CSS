const form = document.getElementById("form");
const resumenError = document.getElementById("resumenError");
const listaError = document.getElementById("resumenErrorLista");
const tituloError = document.getElementById("resumenErrorTitulo");
const guardado = document.getElementById("guardado");

const INTERESES = ["int_diseno", "int_tecnologia", "int_cocina", "int_musica", "int_viajes", "int_fotografia"];

const CAMPOS = [
  {
    id: "nombre",
    etiqueta: "Nombre",
    vacio: "Escribe tu nombre, es lo primero que verá la gente.",
    error: "Entre 2 y 40 caracteres, con al menos una letra.",
    prueba: v => v.length >= 2 && v.length <= 40 && /[A-Za-zÀ-ÿ]/.test(v)
  },
  {
    id: "apellidos",
    etiqueta: "Apellidos",
    vacio: "",
    error: "Entre 2 y 60 caracteres.",
    prueba: v => v === "" || (v.length >= 2 && v.length <= 60),
    opcional: true
  },
  {
    id: "alias",
    etiqueta: "Alias público",
    vacio: "Elige un alias para tu perfil.",
    error: "De 3 a 24 caracteres, solo minúsculas, números, punto y guion.",
    prueba: v => /^[a-z0-9._-]{3,24}$/.test(v)
  },
  {
    id: "correo",
    etiqueta: "Correo electrónico",
    vacio: "Necesitamos un correo para avisarte de los cambios.",
    error: "Revisa el formato: nombre@dominio.com",
    prueba: v => /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(v)
  },
  {
    id: "telefono",
    etiqueta: "Teléfono",
    vacio: "Escrivenos nueve dígitos para los avisos urgentes.",
    error: "Deben ser nueve dígitos, sin espacios ni signos.",
    prueba: v => /^[6-9]\d{8}$/.test(v)
  },
  {
    id: "ciudad",
    etiqueta: "Ciudad",
    vacio: "",
    error: "Entre 2 y 40 caracteres.",
    prueba: v => v === "" || (v.length >= 2 && v.length <= 40),
    opcional: true
  },
  {
    id: "bio",
    etiqueta: "Biografía corta",
    vacio: "Escríbenos dos frases sobre ti, entre 20 y 180 caracteres.",
    error: "Necesitas entre 20 y 180 caracteres. Puedes contarlos abajo.",
    prueba: v => v.length >= 20 && v.length <= 180
  }
];

function el(id) { return document.getElementById(id); }

function valorCampo(f) {
  if (f.id === "intereses") {
    return INTERESES.filter(i => el(i).checked).map(i => el(i).value).join(", ");
  }
  if (f.id === "visibilidad") {
    const marcada = form.querySelector('input[name="visibilidad"]:checked');
    return marcada ? marcada.value : "";
  }
  return el(f.id).value.trim();
}

function pintar(f) {
  const esGrupo = f.id === "intereses" || f.id === "visibilidad";
  const referencia = esGrupo
    ? (f.id === "intereses" ? el("int_diseno") : el("vis_publico"))
    : el(f.id);
  const contenedor = referencia.closest(".campo");
  const ayuda = el(f.id + "-ayuda");
  const error = el(f.id + "-error");
  const valor = valorCampo(f);
  const malo = !f.prueba(valor);
  const desc = [ayuda.id];

  if (malo) {
    contenedor.dataset.estado = "error";
    desc.push(error.id);
    error.textContent = valor === "" ? f.vacio : f.error;
    referencia.setAttribute("aria-invalid", "true");
  } else {
    contenedor.dataset.estado = f.opcional && valor === "" ? "neutro" : "ok";
    referencia.removeAttribute("aria-invalid");
  }

  referencia.setAttribute("aria-describedby", desc.join(" "));
  return malo;
}

CAMPOS.forEach(f => {
  if (f.id === "intereses" || f.id === "visibilidad") return;
  const control = el(f.id);
  control.addEventListener("blur", () => pintar(f));
  control.addEventListener("input", () => {
    if (control.closest(".campo").dataset.estado === "error") pintar(f);
    if (f.id === "bio") el("bioCuenta").textContent = String(control.value.length);
    actualizarVista();
  });
});

INTERESES.forEach(id => {
  el(id).addEventListener("change", () => {
    if (el("int_diseno").closest(".campo").dataset.estado !== "neutro") pintar(CAMPOS_INTERESES);
    actualizarVista();
  });
});

const CAMPOS_INTERESES = {
  id: "intereses",
  etiqueta: "Intereses",
  vacio: "Marca al menos un interés para recomendarte contenido.",
  error: "Marca entre uno y seis intereses.",
  prueba: v => v !== ""
};

const CAMPOS_VISIBILIDAD = {
  id: "visibilidad",
  etiqueta: "Visibilidad",
  vacio: "Elige si tu perfil es público o solo para socios.",
  error: "Esa opción de visibilidad no es válida.",
  prueba: v => v === "Público" || v === "Solo socios"
};

form.querySelectorAll('input[name="visibilidad"]').forEach(r => {
  r.addEventListener("change", () => pintar(CAMPOS_VISIBILIDAD));
});

function iniciales() {
  const n = el("nombre").value.trim();
  const a = el("apellidos").value.trim();
  const primera = n.charAt(0);
  const segunda = a.charAt(0) || n.charAt(1) || "";
  const texto = (primera + segunda).toUpperCase();
  return texto === "" ? "AM" : texto;
}

function actualizarVista() {
  const n = el("nombre").value.trim();
  const a = el("apellidos").value.trim();
  el("avatarInicial").textContent = iniciales();
  el("verNombre").textContent = (n + " " + a).trim() || "Ana Morales";
  const alias = el("alias").value.trim();
  el("verAlias").textContent = alias ? "@" + alias : "@tu-alias-aqui";
  const c = el("ciudad").value.trim();
  el("verLugar").textContent = c ? c + ", España" : "Ciudad sin definir";
  const b = el("bio").value.trim();
  el("verBio").textContent = b || "Tu biografía aparecerá aquí, justo debajo de tu nombre.";
  el("verCorreo").textContent = el("correo").value.trim() || "sin definir";
  const t = el("telefono").value.trim();
  el("verTelefono").textContent = t ? "+34 " + t.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3") : "sin definir";
  const vis = form.querySelector('input[name="visibilidad"]:checked');
  el("verVisibilidad").textContent = vis ? vis.value : "Público";
  const lista = INTERESES.filter(i => el(i).checked).map(i => el(i).value);
  const caja = el("verEtiquetas");
  caja.innerHTML = "";
  if (lista.length === 0) {
    const li = document.createElement("li");
    li.className = "vacia";
    li.textContent = "Sin intereses marcados todavía";
    caja.appendChild(li);
    return;
  }
  lista.forEach((t2, i) => {
    const li = document.createElement("li");
    li.textContent = t2;
    li.style.animationDelay = (i * 0.05) + "s";
    caja.appendChild(li);
  });
}

function problemas() {
  return CAMPOS.concat([CAMPOS_INTERESES, CAMPOS_VISIBILIDAD]).filter(f => {
    const valor = f.id === "intereses" ? valorCampo(CAMPOS_INTERESES) : f.id === "visibilidad" ? valorCampo(CAMPOS_VISIBILIDAD) : el(f.id).value.trim();
    return !f.prueba(valor);
  });
}

form.addEventListener("submit", e => {
  e.preventDefault();
  CAMPOS.forEach((...args) => pintar(...args));
  pintar(CAMPOS_INTERESES);
  pintar(CAMPOS_VISIBILIDAD);
  const fallos = problemas();

  if (fallos.length > 0) {
    tituloError.textContent = fallos.length === 1
      ? "Falta corregir un campo"
      : "Faltan " + fallos.length + " campos por corregir";
    listaError.innerHTML = "";
    fallos.forEach(f => {
      const li = document.createElement("li");
      li.textContent = f.etiqueta + ": " + (valorCampo(f) === "" ? f.vacio : f.error);
      listaError.appendChild(li);
    });
    resumenError.hidden = false;
    const destino = fallos[0].id === "intereses" ? el("int_diseno") : fallos[0].id === "visibilidad" ? el("vis_publico") : el(fallos[0].id);
    destino.focus();
    destino.scrollIntoView({ block: "center" });
    return;
  }

  resumenError.hidden = true;
  const lista = INTERESES.filter(i => el(i).checked).map(i => el(i).value);
  const vis = form.querySelector('input[name="visibilidad"]:checked');
  el("gNombre").textContent = (el("nombre").value.trim() + " " + el("apellidos").value.trim()).trim() + " (" + el("alias").value.trim() + ")";
  el("gIntereses").textContent = lista.length + ": " + lista.join(", ");
  el("gVisibilidad").textContent = vis.value;
  el("gRef").textContent = "NX-" + String(Math.floor(1000 + Math.random() * 9000));
  el("guardadoTexto").textContent = "Ana, tus datos ya están guardados. " + lista.length + " intereses visibles en tu ficha.";
  form.hidden = true;
  document.querySelector(".hoja-cab").hidden = true;
  guardado.hidden = false;
  guardado.focus();
});

function limpiar() {
  form.reset();
  form.querySelector('input[name="visibilidad"][value="Público"]').checked = true;
  el("bioCuenta").textContent = "0";
  CAMPOS.forEach(f => {
    const env = el(f.id).closest(".campo");
    env.dataset.estado = "neutro";
    el(f.id).removeAttribute("aria-invalid");
    el(f.id).setAttribute("aria-describedby", f.id + "-ayuda");
    el(f.id + "-error").textContent = "";
  });
  [CAMPOS_INTERESES, CAMPOS_VISIBILIDAD].forEach(f => {
    const env = f.id === "intereses" ? el("int_diseno").closest(".campo") : el("vis_publico").closest(".campo");
    env.dataset.estado = "neutro";
    el(f.id + "-error").textContent = "";
  });
  resumenError.hidden = true;
  actualizarVista();
}

el("descartar").addEventListener("click", () => {
  limpiar();
  el("nombre").focus();
});

el("seguir").addEventListener("click", () => {
  guardado.hidden = true;
  document.querySelector(".hoja-cab").hidden = false;
  form.hidden = false;
  el("nombre").focus();
});

actualizarVista();
