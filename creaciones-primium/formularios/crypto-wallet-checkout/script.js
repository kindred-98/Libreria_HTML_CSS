const form = document.getElementById("form");
const btnCopiar = document.getElementById("copiar");
const btnConfirmar = document.getElementById("confirmar");
const textoConfirmar = document.getElementById("confirmarTexto");
const resumenError = document.getElementById("resumenError");
const listaError = document.getElementById("resumenErrorLista");
const tituloError = document.getElementById("resumenErrorTitulo");
const confirmado = document.getElementById("confirmado");

const PRECIO_ETH = 2486.1;
const REDES = {
  ethereum: { etiqueta: "Ethereum", gas: 0.42, slip: 0.15 },
  poligon: { etiqueta: "Polygon", gas: 0.02, slip: 0.05 },
  arbitrum: { etiqueta: "Arbitrum One", gas: 0.09, slip: 0.09 }
};

let restante = 581;
let reloj = null;

const CAMPOS = [
  {
    id: "direccion",
    etiqueta: "Dirección de destino",
    vacio: "Necesitamos la dirección a la que enviar el ETH.",
    error: "Las carteras tienen 42 caracteres hexadecimales y empiezan por 0x.",
    prueba: v => /^0x[0-9a-fA-F]{40}$/.test(v)
  },
  {
    id: "cantidad",
    etiqueta: "Cantidad a enviar",
    vacio: "Indica cuánto ETH vas a mandar.",
    error: "Un número entre 0,0001 y 2 ETH, con coma o punto decimal.",
    prueba: v => {
      if (!/^\d{1,2}([.,]\d{1,8})?$/.test(v)) return false;
      const n = Number(v.replace(",", "."));
      return n >= 0.0001 && n <= 2;
    }
  },
  {
    id: "red",
    etiqueta: "Red de envío",
    vacio: "Elige en qué red quieres pagar.",
    error: "Esa red no está disponible para este pedido.",
    prueba: v => Object.hasOwn(REDES, v)
  },
  {
    id: "referencia",
    etiqueta: "Referencia del pedido",
    vacio: "Falta la referencia del pedido.",
    error: "Formato NX seguido de guion y cuatro dígitos, guion y cinco dígitos.",
    prueba: v => /^NX-\d{4}-\d{5}$/.test(v)
  },
  {
    id: "origen",
    etiqueta: "Origen de los fondos",
    vacio: "Indica de dónde vienen los ETH.",
    error: "Esa opción de origen no es válida.",
    prueba: v => v === "Exchange" || v === "Cartera personal"
  }
];

function el(id) { return document.getElementById(id); }

function valorCampo(f) {
  if (f.id === "origen") {
    const marcada = form.querySelector('input[name="origen"]:checked');
    return marcada ? marcada.value : "";
  }
  return el(f.id).value.trim();
}

function referencia(f) {
  return f.id === "origen" ? el("origen_exchange") : el(f.id);
}

function pintar(f) {
  const control = referencia(f);
  const env = control.closest(".campo");
  const ayuda = el(f.id + "-ayuda");
  const error = el(f.id + "-error");
  const valor = valorCampo(f);
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

function euros(n) {
  return n.toFixed(2).replace(".", ",") + " €";
}

function redActual() {
  const v = el("red").value;
  return Object.hasOwn(REDES, v) ? REDES[v] : REDES.ethereum;
}

function actualizarTicket() {
  const r = redActual();
  const bruto = 112;
  const c = el("cantidad").value.trim().replace(",", ".");
  const n = Number(c);
  const envio = !Number.isNaN(n) && n > 0 ? n : 112.57 / PRECIO_ETH;
  const total = envio * PRECIO_ETH + r.gas;
  el("comision").textContent = euros(r.gas);
  el("deslizamiento").textContent = String(r.slip).replace(".", ",") + " %";
  el("ticketGas").textContent = euros(r.gas);
  el("ticketSlide").textContent = String(r.slip).replace(".", ",") + " %";
  el("ticketTotal").textContent = euros(total);
  el("equivaleEur").textContent = euros(Number.isNaN(n) ? 0 : n * PRECIO_ETH);
  el("precioEth").textContent = PRECIO_ETH.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ").replace(".", ",") + " €";
  return { envio: envio, total: total, red: r, bruto: bruto };
}

function problemas() {
  return CAMPOS.filter(f => !f.prueba(valorCampo(f)));
}

CAMPOS.forEach(f => {
  if (f.id === "origen") {
    ["origen_exchange", "origen_cartera"].forEach(id => {
      el(id).addEventListener("blur", () => pintar(f));
      el(id).addEventListener("change", () => { pintar(f); });
    });
    return;
  }
  const control = el(f.id);
  const evento = control.tagName === "SELECT" ? "change" : "blur";
  control.addEventListener(evento, () => pintar(f));
  control.addEventListener("input", () => {
    if (control.closest(".campo").dataset.estado === "error") pintar(f);
    if (f.id === "cantidad") actualizarTicket();
  });
  control.addEventListener("change", actualizarTicket);
});

el("cantidad").addEventListener("input", () => {
  let v = el("cantidad").value.replace(/[^\d.,]/g, "");
  const partes = v.split(/[.,]/);
  if (partes.length > 2) v = partes[0] + "," + partes.slice(1).join("");
  el("cantidad").value = v;
  actualizarTicket();
});

el("referencia").addEventListener("input", () => {
  let v = el("referencia").value.toUpperCase().replace(/[^0-9A-Z-]/g, "");
  v = v.replace(/^([A-Z]{2})?/, m => m.toUpperCase());
  el("referencia").value = v.slice(0, 13);
});

btnCopiar.addEventListener("click", () => {
  const valor = el("direccion").value.trim();
  if (valor) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(valor).catch(() => {});
    }
  }
  btnCopiar.dataset.hecho = "1";
  btnCopiar.querySelector(".copiar-txt").textContent = "Copiado";
  btnCopiar.setAttribute("aria-label", "Dirección copiada al portapapeles");
  window.setTimeout(() => {
    btnCopiar.dataset.hecho = "0";
    btnCopiar.querySelector(".copiar-txt").textContent = "Copiar";
    btnCopiar.setAttribute("aria-label", "Copiar la dirección al portapapeles");
  }, 1800);
});

function cuentaAtras() {
  const dos = n => String(n).padStart(2, "0");
  el("cuentaAtras").textContent = dos(Math.floor(restante / 60)) + ":" + dos(restante % 60);
}

function arrancarReloj() {
  if (reloj) clearInterval(reloj);
  reloj = setInterval(() => {
    restante -= 1;
    if (restante <= 0) {
      restante = 0;
      clearInterval(reloj);
      reloj = null;
      cuentaAtras();
      return;
    }
    cuentaAtras();
  }, 1000);
}

form.addEventListener("submit", e => {
  e.preventDefault();
  CAMPOS.forEach(pintar);
  const fallos = problemas();

  if (fallos.length > 0) {
    tituloError.textContent = fallos.length === 1
      ? "Falta un dato para firmar el pago"
      : "Faltan " + fallos.length + " datos para firmar el pago";
    listaError.innerHTML = "";
    fallos.forEach(f => {
      const li = document.createElement("li");
      li.textContent = f.etiqueta + ": " + (valorCampo(f) === "" ? f.vacio : f.error);
      listaError.appendChild(li);
    });
    resumenError.hidden = false;
    referencia(fallos[0]).focus();
    return;
  }

  resumenError.hidden = true;
  const t = actualizarTicket();
  btnConfirmar.disabled = true;
  btnConfirmar.dataset.estado = "firma";
  textoConfirmar.textContent = "Conectando con tu cartera y firmando";

  window.setTimeout(() => {
    const hex = "0123456789abcdef";
    let hash = "0x";
    for (let i = 0; i < 64; i++) hash += hex.charAt(Math.floor(Math.random() * 16));
    el("cfHash").textContent = hash;
    el("cfCantidad").textContent = t.envio.toFixed(4) + " ETH · " + euros(t.envio * PRECIO_ETH);
    el("cfRed").textContent = t.red.etiqueta + " · bloque pendiente";
    el("cfTotal").textContent = euros(t.total);
    el("confirmadoTexto").textContent = "Firma registrada con la referencia " + el("referencia").value.trim() +
      ". Te avisamos en cuanto la red confirme la transferencia.";
    form.hidden = true;
    confirmado.hidden = false;
    confirmado.focus();
    if (reloj) {
      clearInterval(reloj);
      reloj = null;
    }
  }, 1600);
});

el("volver").addEventListener("click", () => {
  form.reset();
  form.hidden = false;
  confirmado.hidden = true;
  btnConfirmar.disabled = false;
  delete btnConfirmar.dataset.estado;
  textoConfirmar.textContent = "Confirmar y firmar";
  CAMPOS.forEach(f => {
    const env = referencia(f).closest(".campo");
    env.dataset.estado = "neutro";
    const control = referencia(f);
    control.removeAttribute("aria-invalid");
    control.setAttribute("aria-describedby", f.id + "-ayuda");
    el(f.id + "-error").textContent = "";
  });
  restante = 581;
  cuentaAtras();
  arrancarReloj();
  actualizarTicket();
  el("direccion").focus();
});

actualizarTicket();
cuentaAtras();
arrancarReloj();
