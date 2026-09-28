const form = document.getElementById("form");
const casillas = Array.from(document.querySelectorAll("#casillas input"));
const envCodigo = document.getElementById("envCodigo");
const motivo = document.getElementById("motivo");
const pegar = document.getElementById("pegar");
const btnReenviar = document.getElementById("reenviar");
const cuenta = document.getElementById("cuenta");
const resumenError = document.getElementById("resumenError");
const listaError = document.getElementById("resumenLista");
const tituloError = document.getElementById("resumenTitulo");
const pasaporte = document.getElementById("pasaporte");

const MOTIVOS = ["nuevo", "compra", "robo", "migracion"];

let restante = 0;
let reloj = null;

function el(id) { return document.getElementById(id); }

function valorCodigo() {
  return casillas.map(c => c.value).join("");
}

function codigoCompleto() {
  return /^[0-9]{6}$/.test(valorCodigo());
}

function textoErrorCodigo() {
  if (valorCodigo() === "") return "Type or paste the six digits from the mail.";
  if (valorCodigo().length < 6) return "Six digits, please. You have " + valorCodigo().length + " so far.";
  return "That code does not open this account. Read it again from the mail and try once more.";
}

function pintarCodigo() {
  const ayuda = el("codigo-ayuda");
  const mensaje = el("codigo-error");
  const grupo = el("casillas");
  const valor = valorCodigo();
  const malo = !codigoCompleto();
  const desc = [ayuda.id];

  casillas.forEach(c => c.classList.toggle("llena", c.value !== ""));

  if (malo) {
    envCodigo.dataset.estado = "error";
    grupo.setAttribute("aria-invalid", "true");
    if (valor.length === 6 || valor.length === 0) desc.push(mensaje.id);
    mensaje.textContent = textoErrorCodigo();
  } else {
    envCodigo.dataset.estado = "ok";
    grupo.setAttribute("aria-invalid", "false");
    mensaje.textContent = "";
  }
  grupo.setAttribute("aria-describedby", desc.join(" "));
  return malo;
}

function pintarMotivo() {
  const env = motivo.closest(".campo");
  const ayuda = el("motivo-ayuda");
  const mensaje = el("motivo-error");
  const valor = motivo.value;
  const malo = MOTIVOS.indexOf(valor) === -1;
  const desc = [ayuda.id];

  if (malo) {
    env.dataset.estado = "error";
    motivo.setAttribute("aria-invalid", "true");
    desc.push(mensaje.id);
    mensaje.textContent = valor === ""
      ? "Tell us why the vault is being opened, it changes what we log."
      : "That reason is not on the list.";
  } else {
    env.dataset.estado = "ok";
    motivo.setAttribute("aria-invalid", "false");
    mensaje.textContent = "";
  }
  motivo.setAttribute("aria-describedby", desc.join(" "));
  return malo;
}

function repartir(texto, desde) {
  const digitos = texto.replace(/[^0-9]/g, "");
  for (let k = 0; k < digitos.length && desde + k < casillas.length; k++) {
    casillas[desde + k].value = digitos[k];
  }
  casillas.forEach(c => c.classList.toggle("llena", c.value !== ""));
  const siguiente = Math.min(desde + digitos.length, casillas.length - 1);
  casillas[siguiente].focus();
  if (digitos.length > 0) {
    pintarCodigo();
    if (codigoCompleto()) casillas[casillas.length - 1].blur();
  }
}

casillas.forEach((c, i) => {
  c.addEventListener("input", () => {
    c.value = c.value.replace(/[^0-9]/g, "").slice(0, 1);
    casillas.forEach(x => x.classList.toggle("llena", x.value !== ""));
    if (envCodigo.dataset.estado === "error") pintarCodigo();
    if (c.value !== "" && i < casillas.length - 1) casillas[i + 1].focus();
    if (i === casillas.length - 1 && c.value !== "") c.blur();
  });

  c.addEventListener("focus", () => { if (i === 0) c.select(); });

  c.addEventListener("keydown", e => {
    if (e.key === "Backspace" && c.value === "" && i > 0) {
      casillas[i - 1].value = "";
      casillas[i - 1].classList.remove("llena");
      casillas[i - 1].focus();
    }
    if (e.key === "Delete") {
      c.value = "";
      c.classList.remove("llena");
      pintarCodigo();
    }
    if (e.key === "ArrowLeft" && i > 0) { e.preventDefault(); casillas[i - 1].focus(); }
    if (e.key === "ArrowRight" && i < casillas.length - 1) { e.preventDefault(); casillas[i + 1].focus(); }
    if (e.key === "Enter") { e.preventDefault(); form.requestSubmit(); }
  });

  c.addEventListener("paste", e => {
    e.preventDefault();
    const pegado = ((e.clipboardData || window.clipboardData).getData("text") || "");
    repartir(pegado, i);
  });
});

pegar.addEventListener("click", () => {
  if (!navigator.clipboard || !navigator.clipboard.readText) {
    pintarCodigo();
    casillas[0].focus();
    return;
  }
  navigator.clipboard.readText().then(texto => {
    const digitos = texto.replace(/[^0-9]/g, "");
    if (digitos.length === 0) {
      casillas[0].focus();
      return;
    }
    repartir(digitos, 0);
  }, () => {
    casillas[0].focus();
  });
});

el("casillas").addEventListener("focusout", e => {
  if (!el("casillas").contains(e.relatedTarget)) pintarCodigo();
});

motivo.addEventListener("blur", pintarMotivo);
motivo.addEventListener("change", pintarMotivo);

function arrancarCuentaAtras(seg) {
  if (reloj) {
    window.clearInterval(reloj);
    reloj = null;
  }
  restante = seg;
  if (seg <= 0) {
    btnReenviar.disabled = false;
    cuenta.textContent = "You can ask for a new code whenever you want";
    return;
  }
  btnReenviar.disabled = true;
  const tic = () => {
    restante -= 1;
    if (restante <= 0) {
      window.clearInterval(reloj);
      reloj = null;
      btnReenviar.disabled = false;
      cuenta.textContent = "A new code can go out now";
      return;
    }
    cuenta.textContent = "New code in " + restante + " s";
  };
  tic();
  reloj = window.setInterval(tic, 1000);
}

btnReenviar.addEventListener("click", () => {
  casillas.forEach(c => {
    c.value = "";
    c.classList.remove("llena");
  });
  envCodigo.dataset.estado = "neutro";
  el("casillas").setAttribute("aria-describedby", "codigo-ayuda");
  el("codigo-error").textContent = "";
  arrancarCuentaAtras(45);
  casillas[0].focus();
});

form.addEventListener("submit", e => {
  e.preventDefault();
  const falloCodigo = pintarCodigo();
  const falloMotivo = pintarMotivo();
  const fallos = [];

  if (falloCodigo) fallos.push("Recovery code: " + textoErrorCodigo());
  if (falloMotivo) {
    fallos.push("Reason: " + (motivo.value === ""
      ? "no reason picked yet"
      : "that reason is not on the list"));
  }

  if (fallos.length > 0) {
    tituloError.textContent = fallos.length === 1
      ? "The vault stays shut for now"
      : "Two things keep the vault shut";
    listaError.innerHTML = "";
    fallos.forEach(t => {
      const li = document.createElement("li");
      li.textContent = t;
      listaError.appendChild(li);
    });
    resumenError.hidden = false;
    if (falloCodigo) casillas[0].focus();
    else motivo.focus();
    return;
  }

  resumenError.hidden = true;
  const sel = motivo;
  const ahora = new Date();
  const hasta = new Date(ahora.getTime() + 30 * 60000);
  const dos = n => String(n).padStart(2, "0");

  el("pasCodigo").textContent = valorCodigo();
  el("pasCuenta").textContent = "NovaVex, reason: " + sel.options[sel.selectedIndex].text;
  el("pasConfianza").textContent = el("confiar").checked ? "60 days on this console" : "only this session";
  el("pasHasta").textContent = dos(hasta.getHours()) + ":" + dos(hasta.getMinutes());
  el("pasTitulo").textContent = motivo.value === "robo" ? "Vault open, account frozen for review" : "Vault is open again";
  el("pasTexto").textContent = motivo.value === "robo"
    ? "We opened the vault so you can get in, and we have frozen the account while a human looks at the last thirty days of sign ins."
    : "The session on this console is live for thirty minutes and the code is spent.";

  form.hidden = true;
  pasaporte.hidden = false;
  pasaporte.focus();
  if (reloj) {
    window.clearInterval(reloj);
    reloj = null;
  }
});

el("volver").addEventListener("click", () => {
  pasaporte.hidden = true;
  form.hidden = false;
  casillas.forEach(c => {
    c.value = "";
    c.classList.remove("llena");
  });
  envCodigo.dataset.estado = "neutro";
  el("casillas").setAttribute("aria-describedby", "codigo-ayuda");
  el("codigo-error").textContent = "";
  motivo.closest(".campo").dataset.estado = "neutro";
  motivo.setAttribute("aria-invalid", "false");
  motivo.setAttribute("aria-describedby", "motivo-ayuda");
  el("motivo-error").textContent = "";
  resumenError.hidden = true;
  arrancarCuentaAtras(0);
  casillas[0].focus();
});

casillas.forEach(c => { c.placeholder = "0"; });
arrancarCuentaAtras(0);
