const form = document.getElementById("form");
const resumenError = document.getElementById("resumenError");
const listaError = document.getElementById("resumenErrorLista");
const tituloError = document.getElementById("resumenErrorTitulo");
const guardado = document.getElementById("guardado");
const anillo = document.getElementById("anillo");

const LETRAS = "TRWAGMYFPDXBNJZSQVHLCKE";
const LETRAS_CIF = "ABCDEFGHJUV";
const PREFIJOS_PROVINCIA = {
  "03": "Alicante", "08": "Barcelona", "10": "Cáceres", "12": "Castellón", "13": "Ciudad Real",
  "14": "Córdoba", "15": "A Coruña", "17": "Girona", "18": "Granada", "20": "Gipuzkoa",
  "24": "La Rioja", "28": "Madrid", "29": "Málaga", "30": "Murcia", "33": "Asturias",
  "36": "Salamanca", "38": "Cantabria", "41": "Soria", "43": "Toledo", "44": "Valencia",
  "46": "Bizkaia", "48": "Álava", "49": "Zaragoza", "50": "Melilla", "51": "Ceuta"
};

const CAMPOS = [
  {
    id: "tipo-id",
    etiqueta: "Tipo de identificación",
    vacio: "Indica si emites como persona física, extranjero o empresa.",
    error: "Ese tipo de identificación no está disponible.",
    prueba: v => ["NIF", "NIE", "CIF"].includes(v)
  },
  {
    id: "numero-id",
    etiqueta: "Número de identificación",
    vacio: "Escribe el número de identificación fiscal.",
    error: "El número no supera la comprobación de la letra de control para el tipo elegido.",
    prueba: v => {
      const tipo = el("tipo-id").value;
      if (!tipo) return false;
      if (tipo === "CIF") return /^B[0-9A-Z][\d]{6}[0-9A-J]$/.test(v) || /^[A-HJUV][\d]{8}$/.test(v);
      const formato = tipo === "NIF" ? /^\d{8}[A-Z]$/ : /^[XYZ]\d{7}[A-Z]$/;
      if (!formato.test(v)) return false;
      let numero = v;
      if (tipo === "NIE") {
        const letra = v.charAt(0);
        numero = String(["X", "Y", "Z"].indexOf(letra) + v.slice(1, 8)).padStart(8, "0");
      }
      return LETRAS.charAt(Number(numero) % 23) === v.charAt(v.length - 1);
    }
  },
  {
    id: "razon",
    etiqueta: "Razón social",
    vacio: "Escribe la razón social del emisor.",
    error: "Entre 3 y 80 caracteres, con al menos una letra.",
    prueba: v => v.length >= 3 && v.length <= 80 && /[A-Za-zÀ-ÿ]/.test(v)
  },
  {
    id: "comercial",
    etiqueta: "Nombre comercial",
    vacio: "",
    error: "Máximo 60 caracteres.",
    prueba: v => v === "" || v.length <= 60,
    opcional: true
  },
  {
    id: "regimen",
    etiqueta: "Régimen fiscal",
    vacio: "Elige el régimen fiscal que te aplica.",
    error: "Ese régimen no está en la lista.",
    prueba: v => ["general", "simplificado", "recargo", "agricultura", "exenta"].includes(v)
  },
  {
    id: "epigrafe",
    etiqueta: "Epígrafe del IAE",
    vacio: "Elige el epígrafe que mejor se ajuste a tu actividad.",
    error: "Ese epígrafe no está en la lista.",
    prueba: v => ["0111", "0112", "0971", "6431", "6521", "0119"].includes(v)
  },
  {
    id: "volumen",
    etiqueta: "Facturación anual estimada",
    vacio: "Indica una estimación de la facturación anual en euros.",
    error: "Un número entero entre 0 y 99999999.",
    prueba: v => /^\d{1,8}$/.test(v)
  },
  {
    id: "provincia",
    etiqueta: "Provincia",
    vacio: "Indica la provincia del domicilio fiscal.",
    error: "Entre 2 y 40 caracteres.",
    prueba: v => v.length >= 2 && v.length <= 40
  },
  {
    id: "cp",
    etiqueta: "Código postal",
    vacio: "El código postal es obligatorio para facturar.",
    error: "Cinco cifras cuyo prefijo debe corresponder a la provincia escrita.",
    prueba: v => /^\d{5}$/.test(v) && (!el("provincia").value.trim() ||
      (Object.hasOwn(PREFIJOS_PROVINCIA, v.slice(0, 2)) &&
        PREFIJOS_PROVINCIA[v.slice(0, 2)].toLowerCase() === el("provincia").value.trim().toLowerCase()))
  },
  {
    id: "direccion",
    etiqueta: "Dirección fiscal",
    vacio: "Escribe la dirección completa del domicilio fiscal.",
    error: "Entre 5 y 120 caracteres.",
    prueba: v => v.length >= 5 && v.length <= 120
  },
  {
    id: "municipio",
    etiqueta: "Municipio",
    vacio: "Escribe el municipio del domicilio fiscal.",
    error: "Entre 2 y 40 caracteres.",
    prueba: v => v.length >= 2 && v.length <= 40
  },
  {
    id: "email",
    etiqueta: "Correo de facturación",
    vacio: "Necesitamos un correo donde enviarte las facturas.",
    error: "Revisa el formato: nombre@dominio.com",
    prueba: v => /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(v)
  },
  {
    id: "pago",
    etiqueta: "Forma de pago",
    vacio: "Elige la forma de pago por defecto.",
    error: "Esa forma de pago no está en la lista.",
    prueba: v => ["transferencia", "domiciliado", "tarjeta", "bizum"].includes(v)
  },
  {
    id: "observaciones",
    etiqueta: "Observaciones internas",
    vacio: "",
    error: "Máximo 300 caracteres.",
    prueba: v => v.length <= 300,
    opcional: true
  },
  {
    id: "declaracion",
    etiqueta: "Declaración del domicilio fiscal",
    vacio: "Falta la declaración de que los datos son correctos.",
    error: "Sin la declaración no podemos emitir facturas.",
    prueba: v => v === "si",
    tipo: "check"
  }
];

const TOTAL_CAMPOS = CAMPOS.length;

function el(id) { return document.getElementById(id); }

function valorCampo(f) {
  if (f.tipo === "check") return el("declaracion").checked ? "si" : "";
  return el(f.id).value.trim();
}

function pintar(f) {
  const control = el(f.id);
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

function textoSelect(id) {
  const s = el(id);
  return s.value ? s.options[s.selectedIndex].text : "";
}

function actualizarResumen() {
  const completos = CAMPOS.filter(f => f.prueba(valorCampo(f))).length;
  const tanto = completos / TOTAL_CAMPOS;
  anillo.querySelector(".anillo-aro").style.background = "conic-gradient(#f0b061 " + (tanto * 360).toFixed(1) + "deg, rgba(253,246,232,0.1) 0deg)";
  el("anilloNum").textContent = String(completos);
  el("resumenCuenta").textContent = completos + " de " + TOTAL_CAMPOS + " campos completos";
  const tipo = el("tipo-id").value;
  el("rId").textContent = el("numero-id").value.trim()
    ? tipo + " " + el("numero-id").value.trim()
    : "sin definir";
  el("rRazon").textContent = el("comercial").value.trim() || el("razon").value.trim() || "sin definir";
  el("rRegimen").textContent = textoSelect("regimen").replace(" · ", " ") || "sin definir";
  el("rEpigrafe").textContent = textoSelect("epigrafe") || "sin definir";
  const dir = [el("direccion").value.trim(), el("municipio").value.trim(), el("cp").value.trim()].filter(Boolean);
  el("rDomicilio").textContent = dir.length > 0 ? dir.join(", ") : "sin definir";
  el("rEmail").textContent = el("email").value.trim() || "sin definir";
}

CAMPOS.forEach(f => {
  const control = el(f.id);
  const evento = control.tagName === "SELECT" || f.tipo === "check" ? "change" : "blur";
  control.addEventListener(evento, () => pintar(f));
  control.addEventListener("input", () => {
    if (control.closest(".campo").dataset.estado === "error") pintar(f);
    actualizarResumen();
  });
  control.addEventListener("change", actualizarResumen);
});

el("numero-id").addEventListener("input", () => {
  const tipo = el("tipo-id").value;
  let v = el("numero-id").value.toUpperCase().replace(/\s/g, "");
  if (tipo === "CIF") v = v.replace(/[^0-9A-Z]/g, "");
  else if (tipo === "NIE") v = v.replace(/[^0-9XYZ]/g, "");
  else v = v.replace(/\D/g, "");
  el("numero-id").value = v;
  // Ternario simplificado: CIF y el resto permiten el mismo limite de 9 caracteres.
  el("numero-id").maxLength = 9;
});

el("tipo-id").addEventListener("change", () => {
  const tipo = el("tipo-id").value;
  // Ternario simplificado: NIF y el resto permiten el mismo limite de 9 caracteres.
  el("numero-id").maxLength = 9;
  let ejemplo = "B12345678";
  if (tipo === "NIF") ejemplo = "53820093D";
  else if (tipo === "NIE") ejemplo = "X1234567L";
  el("numero-id").placeholder = ejemplo;
  el("numero-id").value = "";
  pintar(CAMPOS.find(f => f.id === "numero-id"));
  actualizarResumen();
});

el("volumen").addEventListener("input", () => {
  el("volumen").value = el("volumen").value.replace(/\D/g, "").slice(0, 8);
});

el("cp").addEventListener("input", () => {
  el("cp").value = el("cp").value.replace(/\D/g, "").slice(0, 5);
});

el("numero-id").addEventListener("blur", () => pintar(CAMPOS.find(f => f.id === "numero-id")));

function problemas() {
  return CAMPOS.filter(f => !f.prueba(valorCampo(f)));
}

form.addEventListener("submit", e => {
  e.preventDefault();
  CAMPOS.forEach((...args) => pintar(...args));
  const fallos = problemas();

  if (fallos.length > 0) {
    tituloError.textContent = fallos.length === 1
      ? "Falta un dato fiscal por confirmar"
      : "Faltan " + fallos.length + " datos fiscales por confirmar";
    listaError.innerHTML = "";
    fallos.forEach(f => {
      const li = document.createElement("li");
      li.textContent = f.etiqueta + ": " + (valorCampo(f) === "" ? f.vacio : f.error);
      listaError.appendChild(li);
    });
    resumenError.hidden = false;
    el(fallos[0].id).focus();
    el(fallos[0].id).scrollIntoView({ block: "center" });
    return;
  }

  resumenError.hidden = true;
  const a = new Date();
  const dos = n => String(n).padStart(2, "0");
  el("gEmisor").textContent = el("comercial").value.trim() || el("razon").value.trim();
  el("gId").textContent = el("tipo-id").value + " " + el("numero-id").value.trim();
  el("gDomicilio").textContent = [el("direccion").value.trim(), el("cp").value.trim() + " " + el("municipio").value.trim(),
    el("provincia").value.trim()].filter(Boolean).join(", ");
  el("gRegimen").textContent = textoSelect("regimen") + " · " + textoSelect("epigrafe").replace(" · ", " ");
  el("gDesde").textContent = dos(a.getDate()) + "/" + dos(a.getMonth() + 1) + "/" + a.getFullYear();
  el("gRef").textContent = "AE-" + String(Math.floor(1000 + Math.random() * 9000));
  el("guardadoTexto").textContent = el("razon").value.trim() + " ya puede emitir facturas con estos datos. " +
    textoSelect("regimen") + " en vigor.";
  form.hidden = true;
  document.querySelector(".anclas").hidden = true;
  document.querySelector(".resumen").hidden = true;
  document.querySelector(".hoja-cab").hidden = true;
  guardado.hidden = false;
  guardado.focus();
});

el("seguir").addEventListener("click", () => {
  guardado.hidden = true;
  document.querySelector(".anclas").hidden = false;
  document.querySelector(".resumen").hidden = false;
  document.querySelector(".hoja-cab").hidden = false;
  form.hidden = false;
  el("razon").focus();
});

actualizarResumen();
