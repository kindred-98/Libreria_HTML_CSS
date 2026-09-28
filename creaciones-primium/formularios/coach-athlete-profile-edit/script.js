const form = document.getElementById("form");
const bio = document.getElementById("bio");
const bioCuenta = document.getElementById("bioCuenta");
const especialidades = document.getElementById("especialidades");
const resumenError = document.getElementById("resumenError");
const listaError = document.getElementById("resumenLista");
const tituloError = document.getElementById("resumenTitulo");
const publicada = document.getElementById("publicada");
const medidor = document.getElementById("medidor");
const medidorRelleno = document.getElementById("medidorRelleno");

const DEPORTES = ["alpinismo", "btt", "escalada", "esqui", "trail", "kayak"];
const PAISES = ["ES", "FR", "IT", "NO", "CH", "CL", "NZ"];
const TITULOS = {
  alpinismo: "Alpinism",
  btt: "Mountain bike",
  escalada: "Indoor climbing",
  esqui: "Ski and snowboard",
  trail: "Trail running",
  kayak: "Whitewater kayak"
};
const NOMBRES_PAIS = {
  ES: "Spain",
  FR: "France",
  IT: "Italy",
  NO: "Norway",
  CH: "Switzerland",
  CL: "Chile",
  NZ: "New Zealand"
};
const TONES = [
  ["#4b8f2e", "#1d4420"],
  ["#2f7f8f", "#123843"],
  ["#8a5a2e", "#3a2412"],
  ["#6b4a9c", "#2a1b45"],
  ["#9c4a5e", "#401a24"],
  ["#2e7f63", "#123a2c"],
  ["#8f7a2e", "#3d3410"]
];

const CAMPOS = [
  {
    id: "nombre",
    etiqueta: "First name",
    vacio: "The card needs a first name.",
    error: "Between 2 and 24 letters, with dashes and spaces only.",
    prueba: v => v.length >= 2 && v.length <= 24 && /^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ -]*$/.test(v)
  },
  {
    id: "apellidos",
    etiqueta: "Surname",
    vacio: "The card needs a surname to build the initials.",
    error: "Between 2 and 24 letters, with dashes and spaces only.",
    prueba: v => v.length >= 2 && v.length <= 24 && /^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ -]*$/.test(v)
  },
  {
    id: "deporte",
    etiqueta: "Discipline",
    vacio: "Pick the discipline this record belongs to.",
    error: "That discipline is not in the academy list.",
    prueba: v => DEPORTES.indexOf(v) !== -1
  },
  {
    id: "pais",
    etiqueta: "Country",
    vacio: "Pick the country of registration.",
    error: "That country code is not on the federation list.",
    prueba: v => PAISES.indexOf(v) !== -1
  },
  {
    id: "club",
    etiqueta: "Club or team",
    vacio: "Write the club, or Independent for a free agent.",
    error: "Between 3 and 30 characters.",
    prueba: v => v.length >= 3 && v.length <= 30
  },
  {
    id: "licencia",
    etiqueta: "Licence number",
    vacio: "",
    error: "Three capitals, four digits and one capital, like FED-4021-E.",
    prueba: v => v === "" || /^[A-Z]{3}-[0-9]{4}-[A-Z]$/.test(v)
  },
  {
    id: "nacimiento",
    etiqueta: "Year of birth",
    vacio: "We need the year of birth to work out the age band.",
    error: "Four digits between 1950 and 2012.",
    prueba: v => /^(19[5-9]\d|20(0\d|1[0-2]))$/.test(v)
  },
  {
    id: "altura",
    etiqueta: "Height",
    vacio: "Give the height in whole centimetres.",
    error: "Whole centimetres between 120 and 230.",
    prueba: v => /^\d{3}$/.test(v) && Number(v) >= 120 && Number(v) <= 230
  },
  {
    id: "bio",
    etiqueta: "About the athlete",
    vacio: "",
    error: "Two hundred characters at most.",
    prueba: v => v.length <= 200
  }
];

const TOTAL_CAMPOS = CAMPOS.length + 1;

function el(id) { return document.getElementById(id); }

function elegidas() {
  return Array.from(especialidades.querySelectorAll("input:checked")).map(i => i.value);
}

function iniciales() {
  const a = el("nombre").value.trim();
  const b = el("apellidos").value.trim();
  const p = a === "" ? "" : a.charAt(0);
  const s = b === "" ? "" : b.charAt(0);
  const salida = (p + s).toUpperCase();
  return salida === "" ? "IS" : salida;
}

function tono() {
  const semilla = (el("nombre").value + el("apellidos").value).toLowerCase();
  let suma = 0;
  for (let k = 0; k < semilla.length; k++) suma += semilla.charCodeAt(k);
  return TONES[suma % TONES.length];
}

function textoOpcion(select, valor) {
  if (valor === "") return "";
  const op = Array.from(select.options).find(o => o.value === valor);
  return op ? op.text : valor;
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
    desc.push(mensaje.id);
    mensaje.textContent = valor === "" ? f.vacio : f.error;
  } else {
    env.dataset.estado = valor === "" ? "neutro" : "ok";
    control.setAttribute("aria-invalid", "false");
    mensaje.textContent = "";
  }
  control.setAttribute("aria-describedby", desc.join(" "));
  return malo;
}

function pintarEspeciales() {
  const env = especialidades.closest(".campo");
  const ayuda = el("especial-ayuda");
  const mensaje = el("especial-error");
  const marcadas = elegidas();
  const malo = marcadas.length === 0;
  const desc = [ayuda.id];

  if (malo) {
    env.dataset.estado = "error";
    especialidades.setAttribute("aria-invalid", "true");
    desc.push(mensaje.id);
    mensaje.textContent = "Tick at least one speciality before publishing the record.";
  } else {
    env.dataset.estado = "ok";
    especialidades.setAttribute("aria-invalid", "false");
    mensaje.textContent = "";
    ayuda.textContent = marcadas.length + " of 6 ticked. The card lists them in the order of the form.";
  }
  especialidades.setAttribute("aria-describedby", desc.join(" "));
  return malo;
}

function pintarTarjeta() {
  const nombre = el("nombre").value.trim();
  const apellidos = el("apellidos").value.trim();
  const completo = (nombre + " " + apellidos).trim();

  el("avatarLetras").textContent = iniciales();
  const t = tono();
  el("avatar").style.setProperty("--tono-a", t[0]);
  el("avatar").style.setProperty("--tono-b", t[1]);

  el("tarjetaNombre").textContent = completo === "" ? "Your name here" : completo;
  el("tarjetaBadge").textContent = el("deporte").value === ""
    ? "discipline pending"
    : TITULOS[el("deporte").value];

  const club = el("club").value.trim();
  el("tarjetaClub").textContent = club === "" ? "Club pending" : club;

  const licencia = el("licencia").value.trim();
  el("tarjetaLicencia").hidden = licencia === "";
  el("licenciaTexto").textContent = licencia === "" ? "FED-0000-X" : licencia;

  el("datoPais").textContent = el("pais").value === ""
    ? "not set"
    : NOMBRES_PAIS[el("pais").value] + ", " + el("pais").value;

  const ano = el("nacimiento").value.trim();
  if (/^(19[5-9]\d|20(0\d|1[0-2]))$/.test(ano)) {
    const edad = 2026 - Number(ano);
    el("datoNacimiento").textContent = ano + ", age " + edad;
  } else {
    el("datoNacimiento").textContent = ano === "" ? "not set" : ano + ", not a real year";
  }

  const altura = el("altura").value.trim();
  el("datoAltura").textContent = /^\d{3}$/.test(altura) ? altura + " cm" : (altura === "" ? "not set" : altura + " cm, check this");

  const marcadas = elegidas();
  el("datoEspeciales").textContent = marcadas.length === 0 ? "none ticked" : marcadas.length + " ticked";

  const chips = el("tarjetaChips");
  chips.innerHTML = "";
  if (marcadas.length === 0) {
    const li = document.createElement("li");
    li.className = "vacio";
    li.textContent = "no speciality yet";
    chips.appendChild(li);
  } else {
    marcadas.forEach(v => {
      const input = especialidades.querySelector("input[value='" + v + "']");
      const li = document.createElement("li");
      li.textContent = input ? input.parentElement.querySelector(".chip-txt").textContent : v;
      chips.appendChild(li);
    });
  }

  const textoBio = el("bio").value.trim();
  el("tarjetaBio").textContent = textoBio === ""
    ? "Nothing written about this athlete yet."
    : textoBio;

  el("tarjetaSello").textContent = (club === "" ? "Club pending" : club) + ", season 2026";
}

function pintarMedidor() {
  let llenos = 0;
  CAMPOS.forEach(f => {
    const v = el(f.id).value.trim();
    if (v !== "" && f.prueba(v)) llenos += 1;
  });
  if (elegidas().length > 0) llenos += 1;
  const pct = Math.round((llenos / TOTAL_CAMPOS) * 100);
  medidorRelleno.style.transform = "scaleX(" + pct / 100 + ")";
  medidor.setAttribute("aria-valuenow", String(pct));
  medidor.setAttribute("aria-valuetext", pct + " per cent of the record filled in");
  el("medidorTitulo").textContent = "Record " + pct + " % filled in";
  el("medidorFaltan").textContent = (TOTAL_CAMPOS - llenos) + (TOTAL_CAMPOS - llenos === 1 ? " field still open" : " fields still open");
}

function pintarTodo() {
  let primero = null;
  CAMPOS.forEach(f => {
    if (pintar(f) && !primero) primero = el(f.id);
  });
  const falloEsp = pintarEspeciales();
  pintarTarjeta();
  pintarMedidor();
  return { primero, falloEsp };
}

["nombre", "apellidos", "nacimiento", "altura", "licencia"].forEach(id => {
  const control = el(id);
  control.addEventListener("input", () => {
    if (id === "nacimiento" || id === "altura") {
      control.value = control.value.replace(/[^0-9]/g, "").slice(0, 4);
    }
    if (id === "licencia") {
      control.value = control.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 11);
    }
    if (control.closest(".campo").dataset.estado === "error") pintar(CAMPOS.find(f => f.id === id));
    pintarTarjeta();
    pintarMedidor();
  });
  control.addEventListener("blur", () => pintar(CAMPOS.find(f => f.id === id)));
  control.addEventListener("change", () => pintar(CAMPOS.find(f => f.id === id)));
});

["deporte", "pais", "club", "bio"].forEach(id => {
  const control = el(id);
  control.addEventListener("input", () => {
    if (control.closest(".campo").dataset.estado === "error") pintar(CAMPOS.find(f => f.id === id));
    pintarTarjeta();
    pintarMedidor();
  });
  control.addEventListener("blur", () => pintar(CAMPOS.find(f => f.id === id)));
  control.addEventListener("change", () => pintar(CAMPOS.find(f => f.id === id)));
});

bio.addEventListener("input", () => {
  bioCuenta.textContent = bio.value.length + " of 200";
});

especialidades.querySelectorAll("input").forEach(inp => {
  inp.addEventListener("change", () => {
    pintarEspeciales();
    pintarTarjeta();
    pintarMedidor();
  });
});

form.addEventListener("submit", e => {
  e.preventDefault();
  const { primero, falloEsp } = pintarTodo();
  const problemas = [];

  CAMPOS.forEach(f => {
    if (!f.prueba(el(f.id).value.trim())) {
      const valor = el(f.id).value.trim();
      problemas.push(f.etiqueta + ": " + (valor === "" ? f.vacio : f.error));
    }
  });
  if (falloEsp) problemas.push("Specialities: tick at least one before publishing the record.");

  if (problemas.length > 0) {
    tituloError.textContent = problemas.length === 1
      ? "One field is not ready yet"
      : problemas.length + " fields are not ready yet";
    listaError.innerHTML = "";
    problemas.forEach(t => {
      const li = document.createElement("li");
      li.textContent = t;
      listaError.appendChild(li);
    });
    resumenError.hidden = false;
    if (primero) primero.focus();
    else especialidades.querySelector("input").focus();
    return;
  }

  resumenError.hidden = true;
  const completo = (el("nombre").value.trim() + " " + el("apellidos").value.trim());
  const marca = el("deporte").value;

  el("pubNombre").textContent = completo;
  el("pubDeporte").textContent = TITULOS[marca];
  el("pubClub").textContent = el("club").value.trim();
  el("pubNumero").textContent = "RA-" + String(Math.floor(1000 + Math.random() * 9000));
  el("pubTitulo").textContent = completo + " is on the board";
  el("pubTexto").textContent = "Filed under " + TITULOS[marca] + " with " +
    el("club").value.trim() + ", with " + elegidas().length +
    (elegidas().length === 1 ? " speciality" : " specialities") + " on the card. Coaches see it from now on.";

  form.hidden = true;
  document.querySelector(".vitrina").hidden = true;
  publicada.hidden = false;
  publicada.focus();
});

el("otra").addEventListener("click", () => {
  publicada.hidden = true;
  form.hidden = false;
  document.querySelector(".vitrina").hidden = false;
  resumenError.hidden = true;
  el("nombre").focus();
  pintarTarjeta();
  pintarMedidor();
});

pintarTarjeta();
pintarMedidor();
