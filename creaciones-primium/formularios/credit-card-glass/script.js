const form = document.getElementById("form");
const tarjeta3d = document.getElementById("tarjeta3d");
const escena = document.getElementById("escena");
const btnPagar = document.getElementById("pagar");
const textoPagar = document.getElementById("pagarTexto");
const resumenError = document.getElementById("resumenError");
const listaError = document.getElementById("resumenErrorLista");
const tituloError = document.getElementById("resumenErrorTitulo");
const recibo = document.getElementById("recibo");

const TIPOS = ["tipo_debito", "tipo_credito"];

const CAMPOS = [
  {
    id: "numero",
    etiqueta: "Número de tarjeta",
    vacio: "Necesitamos el número de la tarjeta para cobrar.",
    error: "El número no supera la comprobación de dígitos. Revísalo, son 16 cifras.",
    prueba: v => {
      const d = v.replace(/\s/g, "");
      if (!/^\d{15,16}$/.test(d)) return false;
      let suma = 0;
      let doble = false;
      for (let i = d.length - 1; i >= 0; i--) {
        let c = Number(d.charAt(i));
        if (doble) {
          c *= 2;
          if (c > 9) c -= 9;
        }
        suma += c;
        doble = !doble;
      }
      return suma % 10 === 0;
    }
  },
  {
    id: "titular",
    etiqueta: "Titular de la tarjeta",
    vacio: "Escribe el nombre que está impreso en la tarjeta.",
    error: "Entre 5 y 40 caracteres, solo letras, espacios y guiones.",
    prueba: v => v.length >= 5 && v.length <= 40 && /^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ .'-]+$/.test(v)
  },
  {
    id: "caducidad",
    etiqueta: "Caducidad",
    vacio: "Indica el mes y el año de caducidad.",
    error: "Formato MM/AA y la fecha tiene que ser futura.",
    prueba: v => {
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(v)) return false;
      const partes = v.split("/");
      const mes = Number(partes[0]);
      const anio = 2000 + Number(partes[1]);
      const ahora = new Date();
      return anio > ahora.getFullYear() || (anio === ahora.getFullYear() && mes >= ahora.getMonth() + 1);
    }
  },
  {
    id: "cvv",
    etiqueta: "Código de seguridad",
    vacio: "Faltan las cifras de seguridad del reverso.",
    error: "Deben ser tres cifras, o cuatro si es American Express.",
    prueba: v => {
      if (!/^\d{3,4}$/.test(v)) return false;
      const digitos = el("numero").value.replace(/\s/g, "");
      if (digitos.charAt(0) === "3") return v.length === 4;
      return v.length === 3;
    }
  },
  {
    id: "tipo",
    etiqueta: "Tipo de tarjeta",
    vacio: "Indica si la tarjeta es de débito o de crédito.",
    error: "Ese tipo de tarjeta no es válido.",
    prueba: v => v === "Débito" || v === "Crédito"
  }
];

function el(id) { return document.getElementById(id); }

function valorCampo(f) {
  if (f.id === "tipo") {
    const marcada = form.querySelector('input[name="tipo"]:checked');
    return marcada ? marcada.value : "";
  }
  return el(f.id).value.trim();
}

function referencia(f) {
  return f.id === "tipo" ? el("tipo_debito") : el(f.id);
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

function enmascarar(digitos) {
  const grupos = [];
  for (let i = 0; i < digitos.length; i += 4) grupos.push(digitos.slice(i, i + 4));
  const texto = grupos.join(" ");
  const partes = texto.split(" ");
  return partes.map((g, i) => (i === partes.length - 1 ? g : "•".repeat(g.length))).join(" ");
}

function detectarMarca(digitos) {
  if (digitos.charAt(0) === "4") return { texto: "VISA", clase: "" };
  if (/^5[1-5]/.test(digitos)) return { texto: "MASTERCARD", clase: "mc" };
  if (/^3[47]/.test(digitos)) return { texto: "AMEX", clase: "amex" };
  if (digitos.charAt(0) === "6") return { texto: "DISCOVER", clase: "" };
  return { texto: "SIN MARCA", clase: "" };
}

function actualizarTarjeta() {
  const digitos = el("numero").value.replace(/\D/g, "");
  el("verNumero").textContent = digitos.length === 0
    ? "•••• •••• •••• ••••"
    : enmascarar(digitos);
  const marca = detectarMarca(digitos);
  const nodo = el("verMarca");
  nodo.textContent = digitos.length === 0 ? "TARJETA" : marca.texto;
  if (marca.clase) nodo.dataset.marca = marca.clase;
  else delete nodo.dataset.marca;
  const titular = el("titular").value.trim();
  el("verTitular").textContent = titular ? titular.toUpperCase() : "NOMBRE DEL TITULAR";
  el("verCaduca").textContent = el("caducidad").value.trim() || "MM/AA";
}

CAMPOS.forEach(f => {
  if (f.id === "tipo") {
    TIPOS.forEach(id => {
      el(id).addEventListener("blur", () => pintar(f));
      el(id).addEventListener("change", () => pintar(f));
    });
    return;
  }
  const control = el(f.id);
  control.addEventListener("blur", () => pintar(f));
  control.addEventListener("input", () => {
    if (control.closest(".campo").dataset.estado === "error") pintar(f);
  });
});

el("numero").addEventListener("input", () => {
  const limpio = el("numero").value.replace(/\D/g, "").slice(0, 16);
  const grupos = [];
  for (let i = 0; i < limpio.length; i += 4) grupos.push(limpio.slice(i, i + 4));
  el("numero").value = grupos.join(" ");
  actualizarTarjeta();
});

el("caducidad").addEventListener("input", () => {
  let v = el("caducidad").value.replace(/\D/g, "").slice(0, 4);
  if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
  el("caducidad").value = v;
  actualizarTarjeta();
});

el("cvv").addEventListener("input", () => {
  el("cvv").value = el("cvv").value.replace(/\D/g, "").slice(0, 4);
});

el("titular").addEventListener("input", actualizarTarjeta);

function problemas() {
  return CAMPOS.filter(f => !f.prueba(valorCampo(f)));
}

let inclinacionX = 9;
let inclinacionY = -14;

function aplicarInclinacion() {
  tarjeta3d.style.transform = "rotateX(" + inclinacionX.toFixed(2) + "deg) rotateY(" + inclinacionY.toFixed(2) + "deg)";
}

escena.addEventListener("pointermove", e => {
  const caja = tarjeta3d.getBoundingClientRect();
  const x = (e.clientX - caja.left) / caja.width;
  const y = (e.clientY - caja.top) / caja.height;
  inclinacionY = (x - 0.5) * 26;
  inclinacionX = (0.5 - y) * 22;
  aplicarInclinacion();
});

escena.addEventListener("pointerleave", () => {
  inclinacionX = 9;
  inclinacionY = -14;
  aplicarInclinacion();
});

form.addEventListener("submit", e => {
  e.preventDefault();
  CAMPOS.forEach((...args) => pintar(...args));
  const fallos = problemas();

  if (fallos.length > 0) {
    tituloError.textContent = fallos.length === 1
      ? "Falta un dato para completar el pago"
      : "Faltan " + fallos.length + " datos para completar el pago";
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
  btnPagar.disabled = true;
  btnPagar.dataset.estado = "cargando";
  textoPagar.textContent = "Contactando con el banco, no cierres la página";

  window.setTimeout(() => {
    const digitos = el("numero").value.replace(/\s/g, "");
    const ahora = new Date();
    const dos = n => String(n).padStart(2, "0");
    el("rOp").textContent = "PC-" + String(Math.floor(100000 + Math.random() * 900000));
    el("rTarjeta").textContent = detectarMarca(digitos).texto + " terminada en " + digitos.slice(-4);
    el("rImporte").textContent = "120,40 €";
    el("rFecha").textContent = dos(ahora.getDate()) + "/" + dos(ahora.getMonth() + 1) + "/" + ahora.getFullYear() +
      " · " + dos(ahora.getHours()) + ":" + dos(ahora.getMinutes());
    el("reciboTexto").textContent = "Gracias, " + el("titular").value.trim().split(" ")[0] +
      ". Tu pedido se ha confirmado y sale del almacén mañana.";
    btnPagar.dataset.estado = "listo";
    textoPagar.textContent = "Pago realizado";
    form.hidden = true;
    document.querySelector(".caja-cab").hidden = true;
    recibo.hidden = false;
    recibo.focus();
  }, 1500);
});

el("otra").addEventListener("click", () => {
  form.reset();
  form.hidden = false;
  document.querySelector(".caja-cab").hidden = false;
  recibo.hidden = true;
  btnPagar.disabled = false;
  delete btnPagar.dataset.estado;
  textoPagar.textContent = "Pagar 120,40 €";
  CAMPOS.forEach(f => {
    const env = referencia(f).closest(".campo");
    env.dataset.estado = "neutro";
    const control = referencia(f);
    control.removeAttribute("aria-invalid");
    control.setAttribute("aria-describedby", f.id + "-ayuda");
    el(f.id + "-error").textContent = "";
  });
  inclinacionX = 9;
  inclinacionY = -14;
  aplicarInclinacion();
  actualizarTarjeta();
  el("numero").focus();
});

actualizarTarjeta();
aplicarInclinacion();
