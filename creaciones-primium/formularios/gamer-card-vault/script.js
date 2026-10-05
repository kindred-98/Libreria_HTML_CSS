const form = document.getElementById("form");
const numero = document.getElementById("numero");
const titular = document.getElementById("titular");
const caduca = document.getElementById("caduca");
const cvv = document.getElementById("cvv");
const facturacion = document.getElementById("facturacion");
const guardado = document.getElementById("guardada");
const btnVerNum = document.getElementById("verNum");
const btnVerCvv = document.getElementById("verCvv");
const resumenError = document.getElementById("resumenError");
const listaError = document.getElementById("resumenLista");
const tituloError = document.getElementById("resumenTitulo");
const sellado = document.getElementById("sellado");

const GUARDADAS = {
  "final-4417": { numero: "5454 3302 8471 4417", titular: "NOVA VEX COLLECTIVE", caduca: "08/29", cvv: "318", facturacion: "E1 6AN" },
  "final-9082": { numero: "4012 8888 8888 9082", titular: "K. REVELLO", caduca: "11/27", cvv: "742", facturacion: "NW1 4RY" }
};

const CAMPOS = [
  {
    id: "guardada",
    etiqueta: "Card already in the vault",
    vacio: "",
    error: "That card is not in the vault.",
    prueba: v => v === "" || Object.hasOwn(GUARDADAS, v)
  },
  {
    id: "numero",
    etiqueta: "Card number",
    vacio: "The card number is what the money lands on, so we do need it.",
    error: "That number fails the control digit check. Read it again, digit by digit.",
    corta: "Sixteen digits, grouped in fours. You have so far.",
    prueba: v => luhn(v)
  },
  {
    id: "titular",
    etiqueta: "Card holder",
    vacio: "Write the name exactly as it is engraved on the card.",
    error: "Between 3 and 26 letters, capitals, spaces and dashes only.",
    prueba: v => v.length >= 3 && v.length <= 26 && /^[A-Z][A-Z \-&/.'0-9]*$/.test(v)
  },
  {
    id: "caduca",
    etiqueta: "Expires",
    vacio: "Give the expiry as month and year, like 09/28.",
    error: "A card that has already run out cannot go in the vault.",
    formato: "Two digits of month, a slash, then two digits of year, like 09/28.",
    prueba: v => caducidadValida(v)
  },
  {
    id: "cvv",
    etiqueta: "Security code",
    vacio: "The three digits on the back are needed to prove the card is yours.",
    error: "Three digits, or four on an American Express card.",
    prueba: v => /^[\d]{3,4}$/.test(v)
  },
  {
    id: "facturacion",
    etiqueta: "Billing postcode",
    vacio: "The bank checks the postcode against the card, so we need it.",
    error: "Between 3 and 10 characters, with letters, digits and at most one space.",
    prueba: v => /^[A-Za-z0-9]{2,8}( [A-Za-z0-9]{1,4})?$/.test(v) && v.length >= 3 && v.length <= 10
  },
  {
    id: "moneda",
    etiqueta: "Currency",
    vacio: "",
    error: "That currency is not in the treasury.",
    prueba: v => ["eur", "usd", "gbp", "sek"].includes(v)
  }
];

let verNumero = false;
let verCvv = false;
let relojMascara = null;
let restante = 0;

function el(id) { return document.getElementById(id); }

function digitos(v) {
  return v.replace(/\D/g, "");
}

function marcaDe(v) {
  const d = digitos(v);
  if (d.length < 2) return "vault";
  if (d.charAt(0) === "3" && d.charAt(1) === "4") return "amex";
  if (d.charAt(0) === "3" && d.charAt(1) === "7") return "amex";
  if (d.charAt(0) === "4") return "visa";
  if (d.charAt(0) === "5" && Number(d.charAt(1)) >= 1 && Number(d.charAt(1)) <= 5) return "mc";
  if (d.charAt(0) === "2") return "mc";
  return "vault";
}

// Los dos nombres que necesita el resguardo: el de la marca dibujada en la
// tarjeta y el que se escribe en el resumen. Tabla en vez de ternario anidado:
// anadido antes, el "?" dentro del ":" no se leia ni de lejos.
const MARCA_TARJETA = { visa: "VISA", mc: "MASTERCARD", amex: "AMEX", vault: "VAULT" };
const MARCA_RESUMEN = { visa: "VISA", mc: "Mastercard", amex: "American Express", vault: "Vault card" };

function marcaMayuscula(marca) {
  return MARCA_TARJETA[marca] || MARCA_TARJETA.vault;
}

function marcaTitular(marca) {
  return MARCA_RESUMEN[marca] || MARCA_RESUMEN.vault;
}

function luhn(v) {
  const d = digitos(v);
  if (d.length < 13 || d.length > 19) return false;
  let suma = 0;
  let doble = false;
  for (let k = d.length - 1; k >= 0; k--) {
    let n = Number(d.charAt(k));
    if (doble) {
      n = n * 2;
      if (n > 9) n = n - 9;
    }
    suma += n;
    doble = !doble;
  }
  return suma % 10 === 0;
}

function caducidadValida(v) {
  if (!/^[\d]{2}\/[\d]{2}$/.test(v)) return false;
  const mes = Number(v.slice(0, 2));
  const anio = 2000 + Number(v.slice(3, 5));
  if (mes < 1 || mes > 12) return false;
  const ahora = new Date();
  const fin = new Date(anio, mes, 0, 23, 59, 59);
  return fin.getTime() >= ahora.getTime();
}

function enmascarar(valor) {
  const d = digitos(valor);
  if (d.length < 4) return "\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022";
  const grupos = marcaDe(valor) === "amex" ? [4, 6, 5] : [4, 4, 4, 4];
  const pedazo = d.slice(-grupos[grupos.length - 1]);
  const relleno = grupos.slice(0, grupos.length - 1).map(() => "\u2022\u2022\u2022\u2022").join(" ");
  return relleno + " " + pedazo;
}

function textoError(f) {
  const valor = el(f.id).value.trim();
  if (valor === "") return f.vacio;
  if (f.id === "numero") {
    if (digitos(valor).length < 13) return f.corta;
    return f.error;
  }
  if (f.id === "caduca" && !/^[\d]{2}\/[\d]{2}$/.test(valor)) return f.formato;
  return f.error;
}

function pintar(f) {
  const control = el(f.id);
  const env = control.closest(".campo");
  const ayuda = el(f.id + "-ayuda");
  const mensaje = el(f.id + "-error");
  const valor = control.value.trim();
  const malo = !f.prueba(valor);
  const desc = [ayuda.id];

  if (malo) {
    env.dataset.estado = "error";
    control.setAttribute("aria-invalid", "true");
    if (f.vacio !== "" || valor === "") desc.push(mensaje.id);
    mensaje.textContent = textoError(f);
  } else {
    env.dataset.estado = valor === "" ? "neutro" : "ok";
    control.setAttribute("aria-invalid", "false");
    mensaje.textContent = "";
  }
  control.setAttribute("aria-describedby", desc.join(" "));
  return malo;
}

function pintarTarjeta() {
  const marca = marcaDe(numero.value);
  el("verNumero").textContent = verNumero ? digitos(numero.value).replace(/(\d{4})(?=\d)/g, "$1 ") : enmascarar(numero.value);
  el("verTitular").textContent = titular.value.trim() === "" ? "CARD HOLDER" : titular.value.trim();
  el("verCaduca").textContent = caduca.value.trim() === "" ? "MM/AA" : caduca.value.trim();
  el("verMarca").textContent = marcaMayuscula(marca);
  el("verMarca").dataset.marca = marca;
  el("marcaViva").textContent = el("verMarca").textContent;
  el("marcaViva").dataset.marca = marca;
}

function arrancarMascara() {
  if (relojMascara) {
    window.clearInterval(relojMascara);
    relojMascara = null;
  }
  restante = 15;
  const pintarCuenta = () => {
    el("mascaraCuenta").textContent = restante + " s";
    el("mascaraCuenta").dataset.visible = "true";
  };
  pintarCuenta();
  relojMascara = window.setInterval(() => {
    restante -= 1;
    if (restante <= 0) {
      window.clearInterval(relojMascara);
      relojMascara = null;
      verNumero = false;
      verCvv = false;
      numero.type = "text";
      btnVerNum.setAttribute("aria-pressed", "false");
      btnVerNum.textContent = "Show the whole number";
      btnVerCvv.setAttribute("aria-pressed", "false");
      btnVerCvv.textContent = "Show the security code";
      el("mascaraCuenta").dataset.visible = "false";
      el("mascaraAyuda").textContent = "Both are covered again after fifteen seconds, whether you were looking or not.";
      pintarTarjeta();
      return;
    }
    pintarCuenta();
  }, 1000);
}

function pararMascara() {
  if (relojMascara) {
    window.clearInterval(relojMascara);
    relojMascara = null;
  }
  el("mascaraCuenta").dataset.visible = "false";
}

btnVerNum.addEventListener("click", () => {
  verNumero = !verNumero;
  btnVerNum.setAttribute("aria-pressed", verNumero ? "true" : "false");
  btnVerNum.textContent = verNumero ? "Cover the number" : "Show the whole number";
  if (verNumero) arrancarMascara();
  else pararMascara();
  pintarTarjeta();
  numero.focus();
});

btnVerCvv.addEventListener("click", () => {
  verCvv = !verCvv;
  cvv.type = verCvv ? "text" : "password";
  btnVerCvv.setAttribute("aria-pressed", verCvv ? "true" : "false");
  btnVerCvv.textContent = verCvv ? "Cover the code" : "Show the security code";
  el("ojoCvv").dataset.visible = String(verCvv);
  if (verCvv) arrancarMascara();
  else pararMascara();
  cvv.focus();
});

el("ojoCvv").addEventListener("click", () => btnVerCvv.click());

numero.addEventListener("input", () => {
  const d = digitos(numero.value).slice(0, 16);
  numero.value = d.replace(/(\d{4})(?=\d)/g, "$1 ");
  if (numero.closest(".campo").dataset.estado === "error") pintar(CAMPOS[1]);
  pintarTarjeta();
});

numero.addEventListener("blur", () => pintar(CAMPOS[1]));
numero.addEventListener("change", () => pintar(CAMPOS[1]));

titular.addEventListener("input", () => {
  titular.value = titular.value.toUpperCase().slice(0, 26);
  if (titular.closest(".campo").dataset.estado === "error") pintar(CAMPOS[2]);
  pintarTarjeta();
});

caduca.addEventListener("input", () => {
  let d = digitos(caduca.value).slice(0, 4);
  let salida = d.slice(0, 2);
  if (d.length > 2) salida += "/" + d.slice(2, 4);
  caduca.value = salida;
  if (caduca.closest(".campo").dataset.estado === "error") pintar(CAMPOS[3]);
  pintarTarjeta();
});

cvv.addEventListener("input", () => {
  cvv.value = digitos(cvv.value).slice(0, 4);
  if (cvv.closest(".campo").dataset.estado === "error") pintar(CAMPOS[4]);
});

["numero", "titular", "caduca", "cvv", "facturacion", "guardada", "moneda"].forEach(id => {
  const control = el(id);
  control.addEventListener("blur", () => pintar(CAMPOS.find(f => f.id === id)));
  control.addEventListener("change", () => pintar(CAMPOS.find(f => f.id === id)));
});

facturacion.addEventListener("input", () => {
  if (facturacion.closest(".campo").dataset.estado === "error") pintar(CAMPOS[5]);
});

guardado.addEventListener("change", () => {
  pintar(CAMPOS[0]);
  const elegida = GUARDADAS[guardado.value];
  if (!elegida) return;
  verNumero = false;
  verCvv = false;
  cvv.type = "password";
  btnVerNum.setAttribute("aria-pressed", "false");
  btnVerNum.textContent = "Show the whole number";
  btnVerCvv.setAttribute("aria-pressed", "false");
  btnVerCvv.textContent = "Show the security code";
  el("ojoCvv").dataset.visible = "false";
  pararMascara();
  numero.value = elegida.numero;
  titular.value = elegida.titular;
  caduca.value = elegida.caduca;
  cvv.value = elegida.cvv;
  facturacion.value = elegida.facturacion;
  CAMPOS.slice(1, 6).forEach(f => pintar(f));
  pintarTarjeta();
  numero.focus();
});

form.addEventListener("submit", e => {
  e.preventDefault();
  let primero = null;
  CAMPOS.forEach(f => {
    if (pintar(f) && !primero) primero = el(f.id);
  });
  const fallos = CAMPOS.filter(f => !f.prueba(el(f.id).value.trim()));

  if (fallos.length > 0) {
    tituloError.textContent = fallos.length === 1
      ? "One field keeps the card out of the vault"
      : fallos.length + " fields keep the card out of the vault";
    listaError.innerHTML = "";
    fallos.forEach(f => {
      const li = document.createElement("li");
      li.textContent = f.etiqueta + ": " + textoError(f);
      listaError.appendChild(li);
    });
    resumenError.hidden = false;
    if (primero) primero.focus();
    return;
  }

  resumenError.hidden = true;
  verNumero = false;
  verCvv = false;
  cvv.type = "password";
  cvv.value = "";
  pararMascara();
  pintarTarjeta();

  const marca = marcaDe(numero.value);
  const marcaTexto = marcaTitular(marca);
  el("sellTarjeta").textContent = marcaTexto + " ending " + digitos(numero.value).slice(-4);
  el("sellTitularTxt").textContent = titular.value.trim();
  el("sellCaduca").textContent = caduca.value.trim() + (el("guardar").checked ? ", kept for the season" : ", one season only");
  el("sellRef").textContent = "CV-" + String(Math.floor(100000 + Math.random() * 900000));
  el("sellTitulo").textContent = titular.value.trim() + " is on file";
  el("sellTexto").textContent = "Prize money lands on the card ending " + digitos(numero.value).slice(-4) +
    " in " + textoOpcion() + ". The security code was checked and thrown away, and we have no copy of it.";

  form.hidden = true;
  document.querySelector(".torre").hidden = true;
  sellado.hidden = false;
  sellado.focus();
});

function textoOpcion() {
  const sel = el("moneda");
  return sel.options[sel.selectedIndex].text.split(",")[0];
}

el("otra").addEventListener("click", () => {
  sellado.hidden = true;
  form.hidden = false;
  document.querySelector(".torre").hidden = false;
  resumenError.hidden = true;
  form.reset();
  CAMPOS.forEach(f => {
    const control = el(f.id);
    control.closest(".campo").dataset.estado = "neutro";
    control.setAttribute("aria-invalid", "false");
    control.setAttribute("aria-describedby", f.id + "-ayuda");
    el(f.id + "-error").textContent = "";
  });
  cvv.type = "password";
  pintarTarjeta();
  guardado.focus();
});

pintarTarjeta();
