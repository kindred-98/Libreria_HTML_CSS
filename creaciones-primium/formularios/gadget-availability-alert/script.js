const form = document.getElementById("form");
const disparador = document.getElementById("disparador");
const cajon = document.getElementById("cajon");
const correo = document.getElementById("correo");
const reserva = document.getElementById("reserva");
const resumenError = document.getElementById("resumenError");
const listaError = document.getElementById("resumenLista");
const tituloError = document.getElementById("resumenTitulo");
const listo = document.getElementById("listo");

const COLORES = ["Carbon black", "Desert sand", "Slate blue"];
const COLORES_TXT = {
  "Carbon black": "carbon",
  "Desert sand": "sand",
  "Slate blue": "slate"
};
const COLORES_AYUDA = {
  "Carbon black": "Carbon black, the one in the photo, has the shortest queue.",
  "Desert sand": "Desert sand is two weeks further back: the anodising runs once a month.",
  "Slate blue": "Slate blue is a special run of forty units and it sells out in a day."
};

const CAMPOS = [
  {
    id: "correo",
    etiqueta: "Alert address",
    vacio: "Without an address there is nowhere to send the alert.",
    error: "That address looks mistyped. It needs an at sign and a domain.",
    prueba: v => /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(v)
  },
  {
    id: "color",
    etiqueta: "Body colour",
    vacio: "Pick the body colour you want to be told about.",
    error: "That colour is not in the batch.",
    prueba: v => COLORES.indexOf(v) !== -1
  }
];

function el(id) { return document.getElementById(id); }

function colorElegido() {
  const marcada = form.querySelector("input[name='color']:checked");
  return marcada ? marcada.value : "";
}

function pintarCorreo() {
  const env = correo.closest(".campo");
  const ayuda = el("correo-ayuda");
  const mensaje = el("correo-error");
  const valor = correo.value.trim();
  const malo = !CAMPOS[0].prueba(valor);
  const desc = [ayuda.id];

  if (malo) {
    env.dataset.estado = "error";
    correo.setAttribute("aria-invalid", "true");
    desc.push(mensaje.id);
    mensaje.textContent = valor === "" ? CAMPOS[0].vacio : CAMPOS[0].error;
  } else {
    env.dataset.estado = "ok";
    correo.setAttribute("aria-invalid", "false");
    mensaje.textContent = "";
  }
  correo.setAttribute("aria-describedby", desc.join(" "));
  return malo;
}

function pintarColor() {
  const env = el("conjunto-color");
  const grupo = env.querySelector(".colores");
  const ayuda = el("color-ayuda");
  const mensaje = el("color-error");
  const valor = colorElegido();
  const malo = !CAMPOS[1].prueba(valor);
  const desc = [ayuda.id];

  if (malo) {
    env.dataset.estado = "error";
    grupo.setAttribute("aria-invalid", "true");
    desc.push(mensaje.id);
    mensaje.textContent = valor === "" ? CAMPOS[1].vacio : CAMPOS[1].error;
  } else {
    env.dataset.estado = "ok";
    grupo.setAttribute("aria-invalid", "false");
    mensaje.textContent = "";
    ayuda.textContent = COLORES_AYUDA[valor];
  }
  grupo.setAttribute("aria-describedby", desc.join(" "));
  return malo;
}

function pintarTodo() {
  let primero = null;
  if (pintarCorreo()) primero = correo;
  if (pintarColor() && !primero) primero = form.querySelector("input[name='color']");
  return primero;
}

correo.addEventListener("blur", pintarCorreo);
correo.addEventListener("change", pintarCorreo);
correo.addEventListener("input", () => {
  if (correo.closest(".campo").dataset.estado === "error") pintarCorreo();
});

form.querySelectorAll("input[name='color']").forEach(inp => {
  inp.addEventListener("change", pintarColor);
});

reserva.addEventListener("change", () => {
  const env = reserva.closest(".campo");
  env.dataset.estado = reserva.checked ? "ok" : "neutro";
  el("hojaLote").textContent = reserva.checked ? "batch 03, one unit held" : "batch 03";
});

function alternarCajon(abrir) {
  if (abrir) {
    cajon.hidden = false;
    window.requestAnimationFrame(() => cajon.classList.add("abierta"));
  } else {
    cajon.classList.remove("abierta");
    window.setTimeout(() => {
      if (!cajon.classList.contains("abierta")) cajon.hidden = true;
    }, 440);
  }
  disparador.setAttribute("aria-expanded", abrir ? "true" : "false");
}

disparador.addEventListener("click", () => {
  const abierto = disparador.getAttribute("aria-expanded") === "true";
  alternarCajon(!abierto);
  if (!abierto) window.setTimeout(() => correo.focus(), 260);
});

document.addEventListener("keydown", e => {
  if (e.key !== "Escape") return;
  if (!listo.hidden) return;
  if (disparador.getAttribute("aria-expanded") === "true") {
    alternarCajon(false);
    disparador.focus();
  }
});

form.addEventListener("submit", e => {
  e.preventDefault();
  const primero = pintarTodo();
  const fallos = CAMPOS.filter(f => !f.prueba(f.id === "correo" ? correo.value.trim() : colorElegido()));

  if (fallos.length > 0) {
    tituloError.textContent = fallos.length === 1
      ? "One thing is missing from the alert"
      : "Two things are missing from the alert";
    listaError.innerHTML = "";
    fallos.forEach(f => {
      const valor = f.id === "correo" ? correo.value.trim() : colorElegido();
      const li = document.createElement("li");
      li.textContent = f.etiqueta + ": " + (valor === "" ? f.vacio : f.error);
      listaError.appendChild(li);
    });
    resumenError.hidden = false;
    if (primero) primero.focus();
    return;
  }

  resumenError.hidden = true;
  const color = colorElegido();
  const cuanto = reserva.checked ? "nine days" : "nine days, queue only";

  el("listoLote").textContent = "LK-03" + (reserva.checked ? ", one unit held for you" : "");
  el("listoColor").textContent = color + ", queue " + (COLORES_TXT[color] === "carbon" ? "nine days" : "three weeks");
  el("listoCorreo").textContent = correo.value.trim();
  el("listoFecha").textContent = cuanto;
  el("listoTitulo").textContent = "We will write you first";
  el("listoTexto").textContent = "The alert is set for the " + COLORES_TXT[color] +
    " body. You get one mail when the batch opens" +
    (reserva.checked ? " and a link that holds a unit for seventy two hours, with nothing to pay until you use it" : "") +
    ", and one when the last unit is gone.";

  form.hidden = true;
  disparador.hidden = true;
  listo.hidden = false;
  listo.focus();
});

el("otra").addEventListener("click", () => {
  listo.hidden = true;
  form.hidden = false;
  disparador.hidden = false;
  alternarCajon(true);
  resumenError.hidden = true;
  form.reset();
  el("conjunto-color").dataset.estado = "neutro";
  el("color-error").textContent = "";
  el("color-ayuda").textContent = COLORES_AYUDA["Carbon black"];
  form.querySelector(".colores").setAttribute("aria-invalid", "false");
  form.querySelector(".colores").setAttribute("aria-describedby", "color-ayuda");
  correo.closest(".campo").dataset.estado = "neutro";
  correo.setAttribute("aria-invalid", "false");
  correo.setAttribute("aria-describedby", "correo-ayuda");
  el("correo-error").textContent = "";
  reserva.closest(".campo").dataset.estado = "neutro";
  el("hojaLote").textContent = "batch 03";
  correo.focus();
});

pintarColor();
