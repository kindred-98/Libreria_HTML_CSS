const form = document.getElementById("form");
const resumenError = document.getElementById("resumenError");
const listaError = document.getElementById("resumenErrorLista");
const tituloError = document.getElementById("resumenErrorTitulo");
const registro = document.getElementById("registro");

const PREFIJOS = {
  "01": "Araba", "02": "Albacete", "03": "Alicante", "04": "Almería", "05": "Ávila",
  "06": "Badajoz", "07": "Baleares", "08": "Barcelona", "09": "Burgos", "10": "Cáceres",
  "11": "Cádiz", "12": "Castellón", "13": "Ciudad Real", "14": "Córdoba", "15": "A Coruña",
  "16": "Cuenca", "17": "Girona", "18": "Granada", "19": "Guadalajara", "20": "Gipuzkoa",
  "21": "Huelva", "22": "Huesca", "23": "Jaén", "24": "La Rioja", "25": "Las Palmas",
  "26": "León", "27": "Lleida", "28": "Madrid", "29": "Málaga", "30": "Murcia",
  "31": "Navarra", "32": "Ourense", "33": "Asturias", "34": "Palencia", "35": "Pontevedra",
  "36": "Salamanca", "37": "Santa Cruz de Tenerife", "38": "Santander", "39": "Segovia",
  "40": "Sevilla", "41": "Soria", "42": "Teruel", "43": "Toledo", "44": "Valencia",
  "45": "Valladolid", "46": "Bizkaia", "47": "Zamora", "48": "Álava", "49": "Zaragoza",
  "50": "Melilla", "51": "Ceuta"
};

const MODOS = ["modo_estandar", "modo_expres", "modo_punto"];

const CAMPOS = [
  {
    id: "via",
    etiqueta: "Tipo de vía",
    vacio: "Indica si es calle, avenida, plaza u otra vía.",
    error: "Ese tipo de vía no está en la lista del libro.",
    prueba: v => ["calle", "avenida", "plaza", "ronda", "carretera", "paseo", "travesia"].includes(v)
  },
  {
    id: "calle",
    etiqueta: "Calle",
    vacio: "Falta el nombre de la calle.",
    error: "Entre 3 y 60 caracteres, con al menos una letra.",
    prueba: v => v.length >= 3 && v.length <= 60 && /[A-Za-zÀ-ÿ]/.test(v)
  },
  {
    id: "numero",
    etiqueta: "Número",
    vacio: "Falta el número de la finca.",
    error: "Entre 1 y 999, con una letra opcional detrás.",
    prueba: v => /^\d{1,3}\s?[A-Za-z]?$/.test(v)
  },
  {
    id: "piso",
    etiqueta: "Piso y puerta",
    vacio: "",
    error: "Máximo 30 caracteres.",
    prueba: v => v === "" || v.length <= 30,
    opcional: true
  },
  {
    id: "ciudad",
    etiqueta: "Ciudad",
    vacio: "Escribe el municipio donde entregamos el paquete.",
    error: "Entre 2 y 40 caracteres.",
    prueba: v => v.length >= 2 && v.length <= 40
  },
  {
    id: "cp",
    etiqueta: "Código postal",
    vacio: "El código postal es obligatorio para enviar.",
    error: "Deben ser cinco cifras y el prefijo debe existir.",
    prueba: v => /^\d{5}$/.test(v) && Object.hasOwn(PREFIJOS, v.slice(0, 2))
  },
  {
    id: "provincia",
    etiqueta: "Provincia",
    vacio: "Elige la provincia de destino.",
    error: "Esa provincia no está en la lista.",
    prueba: v => v.length === 2
  },
  {
    id: "modo",
    etiqueta: "Tipo de entrega",
    vacio: "Elige cómo quieres recibir el paquete.",
    error: "Ese tipo de entrega no es válido.",
    prueba: v => v !== ""
  },
  {
    id: "notas",
    etiqueta: "Notas para el repartidor",
    vacio: "",
    error: "Máximo 200 caracteres.",
    prueba: v => v.length <= 200,
    opcional: true
  }
];

const ATajos = { "1": "via", "2": "numero", "3": "ciudad", "4": "cp" };

function el(id) { return document.getElementById(id); }

function valorCampo(f) {
  if (f.id === "modo") {
    const marcada = form.querySelector('input[name="modo"]:checked');
    return marcada ? marcada.value : "";
  }
  return el(f.id).value.trim();
}

function referencia(f) {
  return f.id === "modo" ? el("modo_estandar") : el(f.id);
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
    env.dataset.estado = f.opcional && valor === "" ? "neutro" : "ok";
    control.removeAttribute("aria-invalid");
  }
  control.setAttribute("aria-describedby", desc.join(" "));
  return malo;
}

CAMPOS.forEach(f => {
  if (f.id === "modo") {
    MODOS.forEach(id => {
      el(id).addEventListener("blur", pintar.bind(null, f));
      el(id).addEventListener("change", () => { pintar(f); actualizarComprobante(); });
    });
    return;
  }
  const control = el(f.id);
  control.addEventListener("blur", () => pintar(f));
  control.addEventListener("input", () => {
    if (control.closest(".campo").dataset.estado !== "neutro") pintar(f);
    if (f.id === "cp" || f.id === "provincia") sincronizarProvincia();
    actualizarComprobante();
  });
  control.addEventListener("change", () => { pintar(f); actualizarComprobante(); });
});

function sincronizarProvincia() {
  const cp = el("cp").value.trim();
  const sel = el("provincia");
  if (cp.length !== 5) return;
  const prefijo = cp.slice(0, 2);
  const opciones = Array.from(sel.options);
  const encontrada = opciones.find(o => o.textContent.toLowerCase().startsWith(PREFIJOS[prefijo].toLowerCase()));
  if (encontrada?.value) {
    sel.value = encontrada.value;
    if (sel.closest(".campo").dataset.estado !== "neutro") pintar(CAMPOS.find(f => f.id === "provincia"));
  }
}

function textoVia() {
  const sel = el("via");
  if (!sel.value) return "Calle";
  return sel.options[sel.selectedIndex].text;
}

function textoProvincia() {
  const sel = el("provincia");
  return sel.value ? sel.options[sel.selectedIndex].text : "Provincia sin definir";
}

function coste() {
  const marcada = form.querySelector('input[name="modo"]:checked');
  if (!marcada) return { importe: 3.9, plazo: "3 a 5 días laborables", etiqueta: "Estandard" };
  if (marcada.id === "modo_expres") return { importe: 11.5, plazo: "24 horas", etiqueta: "Exprés" };
  if (marcada.id === "modo_punto") return { importe: 0, plazo: "2 a 3 días laborables", etiqueta: "Punto de recogida" };
  return { importe: 3.9, plazo: "3 a 5 días laborables", etiqueta: "Estandard" };
}

const euros = n => n.toFixed(2).replace(".", ",") + " €";

function actualizarComprobante() {
  const numero = el("numero").value.trim();
  const calle = el("calle").value.trim();
  const piso = el("piso").value.trim();
  const ciudad = el("ciudad").value.trim();
  const cp = el("cp").value.trim();
  const c = coste();

  el("etLinea1").textContent = calle
    ? textoVia() + " " + calle + (numero ? ", " + numero : "")
    : "Calle sin definir";
  el("etLinea2").textContent = (cp || "00000") + " " + (ciudad || "Ciudad");
  el("etPiso").textContent = piso ? "Portal " + piso : "";
  el("etPie").textContent = "NX-4720 · " + c.etiqueta + " · " + textoProvincia();
  el("compCoste").textContent = euros(c.importe);
  el("compPlazo").textContent = c.plazo;
  el("compTotal").textContent = euros(64.3 + c.importe);
}

function problemas() {
  return CAMPOS.filter(f => !f.prueba(valorCampo(f)));
}

document.querySelectorAll("[data-ir]").forEach(b => {
  b.addEventListener("click", () => {
    const destino = el(b.dataset.ir);
    destino.focus();
    destino.select && destino.select();
  });
});

document.addEventListener("keydown", e => {
  if (!e.altKey || e.ctrlKey || e.metaKey) return;
  const destino = ATajos[e.key];
  if (!destino) return;
  e.preventDefault();
  const control = el(destino);
  control.focus();
  if (control.select) control.select();
});

form.addEventListener("submit", e => {
  e.preventDefault();
  CAMPOS.forEach((...args) => pintar(...args));
  const fallos = problemas();

  if (fallos.length > 0) {
    tituloError.textContent = fallos.length === 1
      ? "Falta un dato para cerrar el registro"
      : "Faltan " + fallos.length + " datos para cerrar el registro";
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
  const c = coste();
  el("rRef").textContent = "NX-4720";
  el("rDireccion").textContent = textoVia() + " " + el("calle").value.trim() + ", " + el("numero").value.trim() +
    (el("piso").value.trim() ? ", " + el("piso").value.trim() : "");
  el("rLocalidad").textContent = el("cp").value.trim() + " " + el("ciudad").value.trim() + " (" + textoProvincia() + ")";
  el("rEntrega").textContent = c.etiqueta + ", " + c.plazo + " · " + euros(c.importe);
  el("registroTexto").textContent = "El repartidor tiene hasta las 18:00 para entregar. Portes: " + euros(c.importe) + ".";
  form.hidden = true;
  document.querySelector(".libro-cab").hidden = true;
  registro.hidden = false;
  registro.focus();
});

el("otro").addEventListener("click", () => {
  form.reset();
  form.hidden = false;
  document.querySelector(".libro-cab").hidden = false;
  registro.hidden = true;
  CAMPOS.forEach(f => {
    const env = referencia(f).closest(".campo");
    env.dataset.estado = "neutro";
    const control = referencia(f);
    control.removeAttribute("aria-invalid");
    control.setAttribute("aria-describedby", f.id + "-ayuda");
    el(f.id + "-error").textContent = "";
  });
  el("refCabecera").textContent = "NX-4720";
  actualizarComprobante();
  el("via").focus();
});

actualizarComprobante();
