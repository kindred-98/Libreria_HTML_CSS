const form = document.getElementById("form");
const casillas = Array.from(document.querySelectorAll("#casillas input"));
const envCodigo = document.getElementById("envCodigo");
const motivo = document.getElementById("motivo");
const btnPegar = document.getElementById("pegar");
const btnReenviar = document.getElementById("reenviar");
const cuenta = document.getElementById("cuenta");
const sesion = document.getElementById("sesion");
const resumenError = document.getElementById("resumenError");
const listaError = document.getElementById("resumenLista");
const tituloError = document.getElementById("resumenTitulo");

const MOTIVOS = ["sesion", "pago", "correo", "rescate"];

const CAMPOS = [
  {
    id: "codigo",
    etiqueta: "Six digit code",
    vacio: "Type the six digits your guard app is showing.",
    error: "That code is not one of ours. Read the order again, the app rotates it every thirty seconds.",
    prueba: () => /^[\d]{6}$/.test(codigoActual())
  },
  {
    id: "motivo",
    etiqueta: "Reason for the code",
    vacio: "Say why the code is being asked for, so we can flag a strange one.",
    error: "That reason is not in the list.",
    prueba: v => MOTIVOS.includes(v)
  }
];

let restante = 0;
let reloj = null;

function el(id) { return document.getElementById(id); }

function codigoActual() {
  return casillas.map(c => c.value).join("");
}

function marcarLlenas() {
  casillas.forEach(c => c.classList.toggle("llena", c.value !== ""));
}

function pintarCodigo() {
  const ayuda = el("codigo-ayuda");
  const err = el("codigo-err");
  const valor = codigoActual();
  const malo = !CAMPOS[0].prueba();
  const desc = [ayuda.id];

  if (malo) {
    envCodigo.dataset.estado = "error";
    el("casillas").setAttribute("aria-invalid", "true");
    if (valor.length === 6) desc.push(err.id);
    err.textContent = valor === "" ? CAMPOS[0].vacio : CAMPOS[0].error;
  } else {
    envCodigo.dataset.estado = "ok";
    el("casillas").setAttribute("aria-invalid", "false");
    err.textContent = "";
  }
  el("casillas").setAttribute("aria-describedby", desc.join(" "));
  return malo;
}

function pintarMotivo() {
  const env = motivo.closest(".campo");
  const ayuda = el("motivo-ayuda");
  const err = el("motivo-err");
  const v = motivo.value;
  const malo = !CAMPOS[1].prueba(v);
  const desc = [ayuda.id];

  if (malo) {
    env.dataset.estado = "error";
    motivo.setAttribute("aria-invalid", "true");
    desc.push(err.id);
    err.textContent = v === "" ? CAMPOS[1].vacio : CAMPOS[1].error;
  } else {
    env.dataset.estado = "ok";
    motivo.setAttribute("aria-invalid", "false");
    err.textContent = "";
  }
  motivo.setAttribute("aria-describedby", desc.join(" "));
  return malo;
}

function problemas() {
  return CAMPOS.filter(f => f.id === "codigo" ? !f.prueba() : !f.prueba(el(f.id).value));
}

function textoProblema(f) {
  const vacio = f.id === "codigo" ? codigoActual() === "" : el(f.id).value === "";
  return f.etiqueta + ": " + (vacio ? f.vacio : f.error);
}

function mostrarResumen(fallos) {
  tituloError.textContent = fallos.length === 1
    ? "One thing is missing before the session opens"
    : fallos.length + " things are missing before the session opens";
  listaError.innerHTML = "";
  fallos.forEach(f => {
    const li = document.createElement("li");
    li.textContent = textoProblema(f);
    listaError.appendChild(li);
  });
  resumenError.hidden = false;
}

function repartir(texto, desde) {
  const limpio = (texto || "").replace(/[^0-9]/g, "");
  if (limpio === "") return;
  for (let k = 0; k < limpio.length && desde + k < casillas.length; k++) {
    casillas[desde + k].value = limpio.charAt(k);
  }
  marcarLlenas();
  const destino = Math.min(desde + limpio.length, casillas.length - 1);
  casillas[destino].focus();
  if (envCodigo.dataset.estado === "error") pintarCodigo();
}

casillas.forEach((c, i) => {
  c.addEventListener("input", () => {
    const original = c.value;
    c.value = c.value.replace(/[^0-9]/g, "").slice(0, 1);
    marcarLlenas();
    if (envCodigo.dataset.estado === "error") pintarCodigo();
    if (c.value !== "" && original !== c.value) {
      if (i < casillas.length - 1) casillas[i + 1].focus();
    } else if (c.value !== "" && i < casillas.length - 1) {
      casillas[i + 1].focus();
    }
    if (i === casillas.length - 1 && codigoActual().length === 6) casillas[i].blur();
  });

  c.addEventListener("focus", () => {
    if (i === 0) c.select();
  });

  c.addEventListener("keydown", e => {
    if (e.key === "Backspace" && c.value === "" && i > 0) {
      casillas[i - 1].value = "";
      casillas[i - 1].classList.remove("llena");
      casillas[i - 1].focus();
      if (envCodigo.dataset.estado === "error") pintarCodigo();
      return;
    }
    if (e.key === "Delete" && c.value !== "") {
      c.value = "";
      marcarLlenas();
      if (envCodigo.dataset.estado === "error") pintarCodigo();
      return;
    }
    if (e.key === "ArrowLeft" && i > 0) { casillas[i - 1].focus(); return; }
    if (e.key === "ArrowRight" && i < casillas.length - 1) { casillas[i + 1].focus(); return; }
    if (e.key === "Home") { casillas[0].focus(); return; }
    if (e.key === "End") { casillas[casillas.length - 1].focus(); return; }
    if (e.key === "Enter") { e.preventDefault(); form.requestSubmit(); }
  });

  c.addEventListener("paste", e => {
    e.preventDefault();
    const pegado = (e.clipboardData || window.clipboardData).getData("text");
    btnPegar.dataset.vivo = "1";
    repartir(pegado, i);
  });
});

function pedirPegadoManual(motivo) {
  btnPegar.dataset.vivo = "0";
  casillas.forEach(c => { c.value = ""; });
  marcarLlenas();
  casillas[0].focus();
  cuenta.textContent = motivo + ", so press Ctrl V into the first box";
}

function conTexto(texto) {
  if ((texto || "").replace(/[^0-9]/g, "") === "") {
    pedirPegadoManual("There is no code in the clipboard");
    return;
  }
  btnPegar.dataset.vivo = "1";
  repartir(texto, 0);
  cuenta.textContent = "Code spread across the six boxes";
}

function pegarDelPortapapeles() {
  if (!navigator.clipboard || !navigator.clipboard.readText) {
    pedirPegadoManual("This browser will not hand the clipboard over");
    return;
  }
  const espera = new Promise(resolve => { setTimeout(resolve, 500); });
  // La carrera nunca se rechaza (el texto va con catch y el temporizador solo
  // resuelve), pero se recoge el error por si el navegador rompe otra vez.
  Promise.race([navigator.clipboard.readText().catch(() => ""), espera])
    .then(resultado => {
      if (resultado === undefined) {
        pedirPegadoManual("The browser kept the clipboard to itself");
        return;
      }
      conTexto(resultado);
    })
    .catch(() => {});
}

btnPegar.addEventListener("click", pegarDelPortapapeles);

el("casillas").addEventListener("focusout", e => {
  if (!el("casillas").contains(e.relatedTarget)) pintarCodigo();
});

motivo.addEventListener("blur", pintarMotivo);
motivo.addEventListener("change", pintarMotivo);

function arrancarCuenta(seg) {
  if (reloj) clearInterval(reloj);
  reloj = null;
  restante = seg;
  if (seg <= 0) {
    btnReenviar.disabled = false;
    cuenta.textContent = "You can ask for another code whenever you want";
    return;
  }
  btnReenviar.disabled = true;
  const tic = () => {
    restante -= 1;
    if (restante <= 0) {
      clearInterval(reloj);
      reloj = null;
      btnReenviar.disabled = false;
      cuenta.textContent = "A new code can be asked for now";
      return;
    }
    cuenta.textContent = "You can resend in " + restante + " s";
  };
  tic();
  reloj = setInterval(tic, 1000);
}

btnReenviar.addEventListener("click", () => {
  casillas.forEach(c => { c.value = ""; });
  marcarLlenas();
  envCodigo.dataset.estado = "neutro";
  el("codigo-err").textContent = "";
  el("casillas").setAttribute("aria-describedby", "codigo-ayuda");
  el("casillas").setAttribute("aria-invalid", "false");
  btnPegar.dataset.vivo = "0";
  cuenta.textContent = "A fresh code just went to the guard app on your phone";
  arrancarCuenta(45);
  casillas[0].focus();
});

form.addEventListener("submit", e => {
  e.preventDefault();
  pintarCodigo();
  pintarMotivo();
  const fallos = problemas();

  if (fallos.length > 0) {
    mostrarResumen(fallos);
    if (!CAMPOS[0].prueba()) casillas[0].focus();
    else motivo.focus();
    return;
  }

  resumenError.hidden = true;
  const sel = motivo;
  el("sCodigo").textContent = codigoActual();
  el("sMaquina").textContent = "this browser, " + (el("confiar").checked ? "trusted" : "not trusted");
  el("sConfianza").textContent = el("confiar").checked ? "thirty days" : "this session only";
  el("sesionTitulo").textContent = "Welcome back, " + (el("confiar").checked ? "trusted machine" : "this session");
  el("sesionTexto").textContent = "Reason logged as " +
    sel.options[sel.selectedIndex].text.replace(/\.$/, "").toLowerCase() +
    ". The session is open for thirty minutes.";
  form.hidden = true;
  sesion.hidden = false;
  sesion.focus();
  if (reloj) {
    clearInterval(reloj);
    reloj = null;
  }
});

el("otra").addEventListener("click", () => {
  sesion.hidden = true;
  form.hidden = false;
  casillas.forEach(c => { c.value = ""; });
  casillas.forEach(c => c.placeholder = "0");
  marcarLlenas();
  envCodigo.dataset.estado = "neutro";
  el("codigo-err").textContent = "";
  el("casillas").setAttribute("aria-describedby", "codigo-ayuda");
  el("casillas").setAttribute("aria-invalid", "false");
  motivo.closest(".campo").dataset.estado = "neutro";
  el("motivo-err").textContent = "";
  motivo.setAttribute("aria-invalid", "false");
  motivo.setAttribute("aria-describedby", "motivo-ayuda");
  btnPegar.dataset.vivo = "0";
  resumenError.hidden = true;
  arrancarCuenta(0);
  casillas[0].focus();
});

casillas.forEach(c => { c.placeholder = "0"; });
arrancarCuenta(0);
