const form = document.getElementById("form");
const casillas = Array.from(document.querySelectorAll("#casillas input"));
const campoCodigo = document.getElementById("campoCodigo");
const resumenError = document.getElementById("resumenError");
const listaError = document.getElementById("resumenErrorLista");
const tituloError = document.getElementById("resumenErrorTitulo");
const btnReenviar = document.getElementById("reenviar");
const cuenta = document.getElementById("cuenta");
const pasaporte = document.getElementById("pasaporte");

let restante = 0;
let reloj = null;

const MOTIVOS = ["acceso", "pago", "correo", "soporte"];

const CAMPOS = [
  {
    id: "codigo",
    etiqueta: "Código de 6 cifras",
    vacio: "Escribe las seis cifras del mensaje.",
    error: "Ese código no es válido. Revisa el orden de las cifras.",
    prueba: () => {
      const v = casillas.map(c => c.value).join("");
      return v.length === 6 && /^[0-9]{6}$/.test(v);
    }
  },
  {
    id: "motivo",
    etiqueta: "Motivo del código",
    vacio: "Selecciona por qué has pedido el código.",
    error: "Ese motivo no está en la lista.",
    prueba: v => MOTIVOS.indexOf(v) !== -1
  }
];

function el(id) { return document.getElementById(id); }

function valorCodigo() {
  return casillas.map(c => c.value).join("");
}

function pintarCodigo() {
  const ayuda = el("codigo-ayuda");
  const error = el("codigo-error");
  const valor = valorCodigo();
  const malo = !CAMPOS[0].prueba();
  const desc = [ayuda.id];

  casillas.forEach(c => c.classList.toggle("llena", c.value !== ""));

  if (malo) {
    campoCodigo.dataset.estado = "error";
    if (valor.length === 6) desc.push(error.id);
    error.textContent = valor === "" ? CAMPOS[0].vacio : CAMPOS[0].error;
  } else {
    campoCodigo.dataset.estado = "ok";
    el("casillas").removeAttribute("aria-invalid");
  }
  el("casillas").setAttribute("aria-describedby", desc.join(" "));
  return malo;
}

function pintarMotivo() {
  const control = el("motivo");
  const env = control.closest(".campo");
  const ayuda = el("motivo-ayuda");
  const error = el("motivo-error");
  const valor = control.value;
  const malo = !CAMPOS[1].prueba(valor);
  const desc = [ayuda.id];

  if (malo) {
    env.dataset.estado = "error";
    control.setAttribute("aria-invalid", "true");
    desc.push(error.id);
    error.textContent = valor === "" ? CAMPOS[1].vacio : CAMPOS[1].error;
  } else {
    env.dataset.estado = "ok";
    control.removeAttribute("aria-invalid");
  }
  control.setAttribute("aria-describedby", desc.join(" "));
  return malo;
}

function problemas() {
  return CAMPOS.filter(f => !f.prueba(f.id === "codigo" ? null : el(f.id).value));
}

function mostrarResumen(fallos) {
  tituloError.textContent = fallos.length === 1
    ? "Falta un dato para continuar"
    : "Faltan " + fallos.length + " datos para continuar";
  listaError.innerHTML = "";
  fallos.forEach(f => {
    const li = document.createElement("li");
    const vacio = f.id === "codigo" ? valorCodigo() === "" : el(f.id).value === "";
    li.textContent = f.etiqueta + ": " + (vacio ? f.vacio : f.error);
    listaError.appendChild(li);
  });
  resumenError.hidden = false;
}

casillas.forEach((c, i) => {
  c.addEventListener("input", () => {
    c.value = c.value.replace(/[^0-9]/g, "").slice(0, 1);
    casillas.forEach(x => x.classList.toggle("llena", x.value !== ""));
    if (campoCodigo.dataset.estado === "error") pintarCodigo();
    if (c.value !== "" && i < casillas.length - 1) casillas[i + 1].focus();
    if (i === casillas.length - 1 && valorCodigo().length === 6) casillas[i].blur();
  });

  c.addEventListener("focus", () => {
    if (i === 0) c.select();
  });

  c.addEventListener("keydown", e => {
    if (e.key === "Backspace" && c.value === "" && i > 0) {
      casillas[i - 1].value = "";
      casillas[i - 1].focus();
      casillas[i - 1].classList.remove("llena");
    }
    if (e.key === "Delete" && c.value !== "") c.value = "";
    if (e.key === "ArrowLeft" && i > 0) casillas[i - 1].focus();
    if (e.key === "ArrowRight" && i < casillas.length - 1) casillas[i + 1].focus();
    if (e.key === "Enter") {
      e.preventDefault();
      form.requestSubmit();
    }
  });

  c.addEventListener("paste", e => {
    e.preventDefault();
    const pegado = ((e.clipboardData || window.clipboardData).getData("text") || "").replace(/[^0-9]/g, "");
    for (let k = 0; k < pegado.length && i + k < casillas.length; k++) {
      casillas[i + k].value = pegado[k];
    }
    casillas.forEach(x => x.classList.toggle("llena", x.value !== ""));
    const siguiente = Math.min(i + pegado.length, casillas.length - 1);
    casillas[siguiente].focus();
    if (campoCodigo.dataset.estado === "error") pintarCodigo();
  });
});

document.getElementById("casillas").addEventListener("focusout", e => {
  if (!document.getElementById("casillas").contains(e.relatedTarget)) pintarCodigo();
});

el("motivo").addEventListener("blur", pintarMotivo);
el("motivo").addEventListener("change", pintarMotivo);

function arrancarCuentaAtras(seg) {
  if (reloj) clearInterval(reloj);
  restante = seg;
  if (seg <= 0) {
    btnReenviar.disabled = false;
    cuenta.textContent = "Puedes pedir otro código cuando quieras";
    reloj = null;
    return;
  }
  btnReenviar.disabled = true;
  const tic = () => {
    restante -= 1;
    if (restante <= 0) {
      clearInterval(reloj);
      reloj = null;
      btnReenviar.disabled = false;
      cuenta.textContent = "Ya puedes pedir un código nuevo";
      return;
    }
    cuenta.textContent = "Podrás reenviarlo en " + restante + " s";
  };
  tic();
  reloj = setInterval(tic, 1000);
}

btnReenviar.addEventListener("click", () => {
  casillas.forEach(c => { c.value = ""; });
  casillas.forEach(c => c.classList.remove("llena"));
  campoCodigo.dataset.estado = "neutro";
  el("casillas").setAttribute("aria-describedby", "codigo-ayuda");
  arrancarCuentaAtras(45);
  casillas[0].focus();
  el("destino").textContent = "+34 6•• •• •• 41";
});

form.addEventListener("submit", e => {
  e.preventDefault();
  const falloCodigo = pintarCodigo();
  const falloMotivo = pintarMotivo();
  const fallos = problemas();

  if (fallos.length > 0) {
    mostrarResumen(fallos);
    if (falloCodigo) casillas[0].focus();
    else el("motivo").focus();
    return;
  }

  resumenError.hidden = true;
  const sel = el("motivo");
  el("pasCodigo").textContent = valorCodigo();
  el("pasDispositivo").textContent = el("confiar").checked
    ? "este navegador, con confianza de 30 días"
    : "este navegador, sin confianza guardada";
  el("pasConfianza").textContent = el("confiar").checked ? "30 días" : "solo esta sesión";
  el("pasaporteTitulo").textContent = "Segundo factor superado";
  el("pasaporteTexto").textContent = "Motivo registrado: " + sel.options[sel.selectedIndex].text + ". Sesión abierta durante 30 minutos.";
  form.hidden = true;
  pasaporte.hidden = false;
  pasaporte.focus();
  if (reloj) {
    clearInterval(reloj);
    reloj = null;
  }
});

el("volver").addEventListener("click", () => {
  pasaporte.hidden = true;
  form.hidden = false;
  casillas.forEach(c => { c.value = ""; });
  campoCodigo.dataset.estado = "neutro";
  el("codigo-error").textContent = "";
  el("motivo").closest(".campo").dataset.estado = "neutro";
  el("motivo-error").textContent = "";
  el("motivo").removeAttribute("aria-invalid");
  el("motivo").setAttribute("aria-describedby", "motivo-ayuda");
  arrancarCuentaAtras(0);
  casillas[0].focus();
});

casillas.forEach(c => { c.placeholder = "0"; });
arrancarCuentaAtras(0);
