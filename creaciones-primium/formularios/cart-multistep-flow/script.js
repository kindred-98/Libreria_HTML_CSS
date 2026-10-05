const form = document.getElementById("form");
const paneles = Array.from(document.querySelectorAll(".panel"));
const migas = Array.from(document.querySelectorAll(".miga"));
const btnAtras = document.getElementById("atras");
const btnContinuar = document.getElementById("continuar");
const textoContinuar = document.getElementById("continuarTexto");
const resumenError = document.getElementById("resumenError");
const listaError = document.getElementById("resumenErrorLista");
const tituloError = document.getElementById("resumenErrorTitulo");
const listo = document.getElementById("listo");
const rielLista = document.getElementById("rielLista");
const rielVacio = document.getElementById("rielVacio");

const ARTICULOS = [
  { ref: "1", nombre: "Lavandula angustifolia, 1 L", precio: 8.9 },
  { ref: "2", nombre: "Hortensia paniculata, 3 L", precio: 24.5 },
  { ref: "3", nombre: "Hibiscoiscus, 2 L", precio: 15.0 },
  { ref: "4", nombre: "Sustrato universal, 20 L", precio: 11.75 },
  { ref: "5", nombre: "Cinta de amarre, 50 m", precio: 6.2 }
];

const PORTES = { estandar: 4.9, expres: 11.5, recogida: 0 };
const PLAZO = {
  estandar: "2 a 4 días laborables",
  expres: "mañana entre las 9:00 y las 14:00",
  recogida: "recogida en el vivero desde el martes"
};

const CAMPOS = [
  {
    id: "nombre", panel: 2,
    etiqueta: "Persona que recibe",
    vacio: "Escribe el nombre de quien recoge el paquete.",
    error: "Entre 2 y 60 caracteres, con al menos dos letras.",
    prueba: v => v.length >= 2 && v.length <= 60 && /[a-zA-ZÀ-ÿ]{2}/.test(v)
  },
  {
    id: "telefono", panel: 2,
    etiqueta: "Teléfono",
    vacio: "Necesitamos un teléfono para coordinar la entrega.",
    error: "Debe ser un móvil español de nueve cifras, del 600 al 799.",
    prueba: v => /^[6-7][\d]{8}$/.test(v.replace(/[\s.-]/g, ""))
  },
  {
    id: "direccion", panel: 2,
    etiqueta: "Dirección",
    vacio: "La dirección es obligatoria para calcular la ruta.",
    error: "Mínimo 8 caracteres, incluyendo número. Añade calle, número y piso.",
    prueba: v => v.length >= 8 && /\d/.test(v)
  },
  {
    id: "cp", panel: 2,
    etiqueta: "Código postal",
    vacio: "Falta el código postal.",
    error: "Son cinco cifras, entre 01000 y 52999.",
    prueba: v => /^\d{5}$/.test(v) && Number(v) >= 1000 && Number(v) <= 52999
  },
  {
    id: "ciudad", panel: 2,
    etiqueta: "Población",
    vacio: "¿En qué población entregamos?",
    error: "Entre 2 y 50 caracteres.",
    prueba: v => v.length >= 2 && v.length <= 50 && /[a-zA-ZÀ-ÿ]/.test(v)
  },
  {
    id: "transporte", panel: 2, tipo: "radio",
    etiqueta: "Forma de entrega",
    vacio: "Elige una forma de entrega.",
    error: "Esa forma de entrega no está disponible.",
    prueba: v => ["estandar", "expres", "recogida"].includes(v)
  },
  {
    id: "nota", panel: 2, tipo: "texto",
    etiqueta: "Nota para el repartidor",
    vacio: "",
    error: "",
    prueba: v => v.length <= 240,
    suave: true
  },
  {
    id: "titular", panel: 3,
    etiqueta: "Titular de la tarjeta",
    vacio: "Escribe el nombre que aparece en la tarjeta.",
    error: "Entre 3 y 50 caracteres, solo letras, espacios y guion.",
    prueba: v => /^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ .'-]{2,49}$/.test(v)
  },
  {
    id: "tarjeta", panel: 3,
    etiqueta: "Número de tarjeta",
    vacio: "Falta el número de tarjeta.",
    error: "Entre 13 y 16 cifras y el dígito de control no cuadra con Luhn.",
    prueba: v => luhn(v.replace(/\s/g, ""))
  },
  {
    id: "caducidad", panel: 3,
    etiqueta: "Caducidad",
    vacio: "Indica mes y año, por ejemplo 09/28.",
    error: "Formato mes/año entre 01/26 y 12/39, y tiene que estar en vigor.",
    prueba: v => caducidadValida(v)
  },
  {
    id: "cvv", panel: 3,
    etiqueta: "Código de seguridad",
    vacio: "Faltan las tres cifras de seguridad.",
    error: "Tres cifras, o cuatro si la tarjeta es American Express.",
    prueba: v => /^\d{3,4}$/.test(v)
  }
];

function luhn(numero) {
  if (!/^\d{13,16}$/.test(numero)) return false;
  let suma = 0;
  let alterna = false;
  for (let i = numero.length - 1; i >= 0; i--) {
    let d = Number(numero[i]);
    if (alterna) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    suma += d;
    alterna = !alterna;
  }
  return suma % 10 === 0;
}

function caducidadValida(v) {
  const m = v.match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
  if (!m) return false;
  const mes = Number(m[1]);
  const anio = 2000 + Number(m[2]);
  const ahora = new Date();
  const fin = new Date(anio, mes, 1);
  if (fin <= ahora) return false;
  return anio >= 2026 && anio <= 2039;
}

function el(id) { return document.getElementById(id); }

function dinero(n) {
  return n.toFixed(2).replace(".", ",") + " €";
}

function valorCampo(f) {
  if (f.tipo === "radio") {
    const marcado = document.querySelector('input[name="transporte"]:checked');
    return marcado ? marcado.value : "";
  }
  return el(f.id).value.trim();
}

function contenedorCampo(f) {
  if (f.tipo === "radio") return document.querySelector(".envio");
  return el(f.id).closest(".campo");
}

function pintar(f) {
  const env = contenedorCampo(f);
  const ayuda = el(f.id + "-ayuda");
  const error = el(f.id + "-error");
  const valor = valorCampo(f);
  const vacio = valor === "";
  const malo = !vacio && !f.prueba(valor);
  const fallo = f.suave ? malo : (vacio || malo);
  const desc = [ayuda.id];
  const activo = f.tipo === "radio" ? document.querySelector('input[name="transporte"]') : el(f.id);

  if (fallo) {
    env.dataset.estado = "error";
    activo.setAttribute("aria-invalid", "true");
    desc.push(error.id);
    error.textContent = vacio ? f.vacio : f.error;
  } else {
    env.dataset.estado = vacio ? "neutro" : "ok";
    activo.setAttribute("aria-invalid", "false");
    error.textContent = "";
  }

  if (f.tipo === "radio") {
    document.querySelector(".envio").setAttribute("aria-describedby", desc.join(" "));
  } else {
    el(f.id).setAttribute("aria-describedby", desc.join(" "));
  }

  return fallo;
}

function validarPanel(n) {
  let primero = null;
  CAMPOS.filter(f => f.panel === n).forEach(f => {
    const fallo = pintar(f);
    if (fallo && !primero) {
      primero = f.tipo === "radio"
        ? document.querySelector('input[name="transporte"]:checked') || document.querySelector('input[name="transporte"]')
        : el(f.id);
    }
  });
  return primero;
}

function problemas(n) {
  return CAMPOS.filter(f => {
    if (f.panel !== n) return false;
    const v = valorCampo(f);
    if (f.suave) return v !== "" && !f.prueba(v);
    return v === "" || !f.prueba(v);
  });
}

function pintadoResumen(n) {
  const fallos = problemas(n);
  if (fallos.length === 0) {
    resumenError.hidden = true;
    return;
  }
  tituloError.textContent = fallos.length === 1
    ? "Falta corregir un campo de este paso"
    : "Faltan " + fallos.length + " campos en este paso";
  listaError.innerHTML = "";
  fallos.forEach(f => {
    const li = document.createElement("li");
    const v = valorCampo(f);
    li.textContent = f.etiqueta + ": " + (v === "" ? f.vacio : f.error);
    listaError.appendChild(li);
  });
  resumenError.hidden = false;
}

let paso = 1;
const TOTAL = paneles.length;

function mostrar(n) {
  paso = n;
  paneles.forEach(p => {
    const activo = Number(p.dataset.panel) === n;
    p.hidden = !activo;
    p.classList.toggle("is-activo", activo);
  });
  migas.forEach(m => {
    const num = Number(m.dataset.paso);
    m.classList.toggle("is-activo", num === n);
    m.classList.toggle("is-hecho", num < n);
  });
  btnAtras.hidden = n === 1;
  const textos = { 1: "Ir al envío", 2: "Ir al pago", 3: "Pagar y confirmar" };
  textoContinuar.textContent = textos[n];
  resumenError.hidden = true;
  actualizarRiel();
}

function seleccion() {
  const cajas = Array.from(document.querySelectorAll('input[name="articulo"]'));
  return ARTICULOS.filter(a => {
    const caja = cajas.find(c => c.value === a.ref);
    return caja && caja.checked;
  }).map(a => ({ ...a, cant: Number(el("cant" + a.ref).value) || 1 }));
}

function transporteActual() {
  const marcado = document.querySelector('input[name="transporte"]:checked');
  return marcado ? marcado.value : "estandar";
}

function totales() {
  const items = seleccion();
  const bruto = items.reduce((s, a) => s + a.precio * a.cant, 0);
  const transporte = transporteActual();
  let portes = 0;
  if (items.length !== 0) {
    portes = transporte === "estandar" && bruto >= 45 ? 0 : PORTES[transporte];
  }
  const dto = transporte === "recogida" ? bruto * 0.05 : 0;
  return { items, bruto, portes, transporte, dto, final: bruto + portes - dto };
}

function actualizarRiel() {
  const t = totales();
  rielLista.innerHTML = "";
  if (t.items.length === 0) {
    rielVacio.hidden = false;
  } else {
    rielVacio.hidden = true;
    t.items.forEach((a, i) => {
      const li = document.createElement("li");
      li.style.animationDelay = i * 0.05 + "s";
      const b = document.createElement("b");
      b.textContent = a.cant + " × " + a.nombre;
      const s = document.createElement("span");
      s.textContent = dinero(a.precio * a.cant);
      li.appendChild(b);
      li.appendChild(s);
      rielLista.appendChild(li);
    });
  }
  el("rielSubtotal").textContent = dinero(t.bruto);
  el("rielEnvio").textContent = t.items.length === 0
    ? "sin portes"
    : t.portes === 0 ? "gratis" : dinero(t.portes);
  el("rielTotal").textContent = dinero(t.final);
  el("rielPiso").textContent = t.transporte === "recogida" && t.dto > 0
    ? "Descuento del 5 por ciento por recoger en el vivero. " + PLAZO.recogida
    : "Plazo de entrega: " + PLAZO[t.transporte];

  const envCesta = document.getElementById("campo-cesta");
  if (t.items.length > 0) {
    envCesta.dataset.estado = "ok";
    el("cesta-error").textContent = "";
  }
  return t;
}

function validarCesta() {
  const t = seleccion();
  const env = document.getElementById("campo-cesta");
  if (t.length === 0) {
    env.dataset.estado = "error";
    el("cesta-error").textContent = "Marca al menos un artículo antes de pasar al envío.";
    return document.querySelector('input[name="articulo"]');
  }
  env.dataset.estado = "ok";
  el("cesta-error").textContent = "";
  return null;
}

document.querySelectorAll('input[name="articulo"]').forEach(c => {
  c.addEventListener("change", () => {
    if (document.getElementById("campo-cesta").dataset.estado === "error") validarCesta();
    actualizarRiel();
  });
});

ARTICULOS.forEach(a => {
  el("cant" + a.ref).addEventListener("change", actualizarRiel);
});

document.querySelectorAll('input[name="transporte"]').forEach(r => {
  r.addEventListener("change", () => {
    if (document.querySelector(".envio").dataset.estado === "error") pintar(CAMPOS.find(f => f.id === "transporte"));
    actualizarRiel();
  });
});

CAMPOS.forEach(f => {
  if (f.tipo === "radio") {
    document.querySelectorAll('input[name="transporte"]').forEach(r =>
      r.addEventListener("blur", () => pintar(f)));
    return;
  }
  const nodo = el(f.id);
  nodo.addEventListener("blur", () => pintar(f));
  nodo.addEventListener("input", () => {
    if (nodo.closest(".campo").dataset.estado === "error") pintar(f);
  });
});

tarjetaMascara();
function tarjetaMascara() {
  const t = el("tarjeta");
  const marca = el("marcaTarjeta");
  t.addEventListener("input", () => {
    const digitos = t.value.replace(/\D/g, "").slice(0, 16);
    t.value = digitos.replace(/(.{4})/g, "$1 ").trim();
    if (digitos[0] === "3") marca.dataset.marca = "amex";
    else if (digitos[0] === "5") marca.dataset.marca = "maestro";
    else delete marca.dataset.marca;
    const esAmex = digitos[0] === "3";
    el("cvv").maxLength = esAmex ? 4 : 3;
  });
}

el("caducidad").addEventListener("input", function () {
  let v = this.value.replace(/[^\d]/g, "").slice(0, 4);
  if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2);
  else if (v.length === 2 && this.value.includes("/")) v = v + "/";
  this.value = v;
});

btnAtras.addEventListener("click", () => {
  if (paso > 1) mostrar(paso - 1);
});

btnContinuar.addEventListener("click", e => {
  e.preventDefault();
  if (paso === 1) {
    const primero = validarCesta();
    if (primero) {
      mostrarResumenCesta();
      primero.focus();
      return;
    }
    mostrar(2);
    el("nombre").focus();
    return;
  }

  const primero = validarPanel(paso);
  pintadoResumen(paso);
  if (primero) {
    primero.focus();
    return;
  }
  if (paso < TOTAL) {
    mostrar(paso + 1);
    const foco = document.querySelector('.panel.is-activo input:not([type="hidden"]), .panel.is-activo textarea');
    if (foco) foco.focus();
  } else {
    completar();
  }
});

function mostrarResumenCesta() {
  tituloError.textContent = "Falta algo en la cesta";
  listaError.innerHTML = "";
  const li = document.createElement("li");
  li.textContent = "Cesta: marca al menos un artículo para poder continuar.";
  listaError.appendChild(li);
  resumenError.hidden = false;
}

function completar() {
  const t = totales();
  const ref = "VS-" + String(Math.floor(100000 + Math.random() * 900000));
  const dir = el("direccion").value.trim();
  el("listoRef").textContent = ref;
  el("listoDestino").textContent = el("ciudad").value.trim() + ", " + el("cp").value.trim();
  el("listoPlazo").textContent = PLAZO[t.transporte];
  el("listoTotal").textContent = dinero(t.final);
  el("listoTitulo").textContent = "Gracias, " + el("nombre").value.trim().split(" ")[0];
  el("listoTexto").textContent = t.items.length + (t.items.length === 1 ? " artículo" : " artículos") +
    " por " + dinero(t.final) + " con tarjeta terminada en " +
    el("tarjeta").value.replace(/\D/g, "").slice(-4) + ". Llegamos a " + dir + ".";

  form.hidden = true;
  document.querySelector(".migas").hidden = true;
  listo.hidden = false;
  listo.focus();
}

el("otra").addEventListener("click", () => {
  form.reset();
  form.hidden = false;
  document.querySelector(".migas").hidden = false;
  listo.hidden = true;
  CAMPOS.forEach(f => {
    contenedorCampo(f).dataset.estado = "neutro";
    el(f.id + "-error").textContent = "";
    el(f.id).setAttribute("aria-invalid", "false");
    el(f.id).setAttribute("aria-describedby", f.id + "-ayuda");
  });
  document.getElementById("campo-cesta").dataset.estado = "neutro";
  resumenError.hidden = true;
  document.querySelector('input[name="transporte"][value="estandar"]').checked = true;
  el("cant1").value = "1";
  el("cant2").value = "1";
  document.querySelectorAll('input[name="articulo"]').forEach(c => { c.checked = false; });
  document.querySelector('input[name="articulo"][value="1"]').checked = true;
  document.querySelector('input[name="articulo"][value="2"]').checked = true;
  mostrar(1);
  document.querySelector('input[name="articulo"]').focus();
});

form.addEventListener("submit", e => e.preventDefault());

mostrar(1);
actualizarRiel();
