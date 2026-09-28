const form = document.getElementById("form");
const especialidad = document.getElementById("especialidad");
const profesional = document.getElementById("profesional");
const dias = document.getElementById("dias");
const horas = document.getElementById("horas");
const paciente = document.getElementById("paciente");
const telefono = document.getElementById("telefono");
const motivo = document.getElementById("motivo");
const nueva = document.getElementById("nueva");
const medidor = document.getElementById("medidor");
const medidorRelleno = document.getElementById("medidorRelleno");
const confirmada = document.getElementById("confirmada");

const MESES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DIAS_SEMANA = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const ESPECIALIDADES = {
  general: {
    nombre: "General medicine",
    min: 40,
    precio: 68,
    equipo: [
      { id: "am", nombre: "Dr Ana Moreda", consulta: "Room 2" },
      { id: "bh", nombre: "Dr Ben Harrow", consulta: "Room 4" }
    ]
  },
  dental: {
    nombre: "Dentistry",
    min: 40,
    precio: 92,
    equipo: [
      { id: "ck", nombre: "Dr Cleo Kaminski", consulta: "Surgery 1" },
      { id: "df", nombre: "Dr Dov Farrow", consulta: "Surgery 2" }
    ]
  },
  fisio: {
    nombre: "Physiotherapy",
    min: 40,
    precio: 54,
    equipo: [
      { id: "el", nombre: "Elin Sarr", consulta: "Gym 1" },
      { id: "gn", nombre: "Gita Nkemelu", consulta: "Gym 2" },
      { id: "ho", nombre: "Hector Olsen", consulta: "Gym 3" }
    ]
  },
  oftalmo: {
    nombre: "Ophthalmology",
    min: 40,
    precio: 110,
    equipo: [
      { id: "is", nombre: "Dr Ines Sabar", consulta: "Room 7" }
    ]
  },
  derma: {
    nombre: "Dermatology",
    min: 40,
    precio: 96,
    equipo: [
      { id: "jt", nombre: "Dr Juno Terzi", consulta: "Room 9" },
      { id: "lp", nombre: "Dr Leo Prati", consulta: "Room 10" }
    ]
  }
};

const FRANJAS = ["09:00", "09:40", "10:20", "11:00", "11:40", "14:00", "14:40", "15:20", "16:00", "16:40"];

const CAMPOS = [
  {
    id: "especialidad",
    etiqueta: "Specialty",
    vacio: "Choose a specialty so we can offer you the right clinicians.",
    error: "That specialty is not in the clinic list.",
    prueba: v => Object.prototype.hasOwnProperty.call(ESPECIALIDADES, v)
  },
  {
    id: "profesional",
    etiqueta: "Clinician",
    vacio: "Pick one of the clinicians available for that specialty.",
    error: "That clinician does not work in that specialty.",
    prueba: v => clinicianExiste(v)
  },
  {
    id: "paciente",
    etiqueta: "Patient name",
    vacio: "We need the name that goes on the record.",
    error: "Between 3 and 40 characters, letters, spaces, apostrophes and dashes.",
    prueba: v => v.length >= 3 && v.length <= 40 && /^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ '\-.]*$/.test(v)
  },
  {
    id: "telefono",
    etiqueta: "Phone",
    vacio: "Without a number the reminder text has nowhere to go.",
    error: "Between 8 and 18 characters, digits with spaces, plus and dashes.",
    prueba: v => /^\+?[0-9][0-9 \-]{6,17}$/.test(v)
  },
  {
    id: "motivo",
    etiqueta: "Reason",
    vacio: "",
    error: "One hundred and eighty characters at most.",
    prueba: v => v.length <= 180
  }
];

let vista = new Date();
vista.setDate(1);
let diaElegido = null;
let horaElegida = "";
const hoy = new Date();
hoy.setHours(0, 0, 0, 0);

function el(id) { return document.getElementById(id); }

function dinero(n) {
  return n.toFixed(2).replace(".", ",") + " EUR";
}

function dos(n) { return String(n).padStart(2, "0"); }

function clave(d) {
  return d.getFullYear() + "-" + dos(d.getMonth() + 1) + "-" + dos(d.getDate());
}

function textoFecha(d) {
  return DIAS_SEMANA[d.getDay()] + " " + d.getDate() + " " + MESES[d.getMonth()] + " " + d.getFullYear();
}

function cerrada(d) {
  return d.getDay() === 0;
}

function pasado(d) {
  return d.getTime() < hoy.getTime();
}

function clinicianExiste(v) {
  const esp = especialidad.value;
  if (v === "") return false;
  if (!Object.prototype.hasOwnProperty.call(ESPECIALIDADES, esp)) return false;
  return ESPECIALIDADES[esp].equipo.some(e => e.id === v);
}

function clinicianActual() {
  const esp = especialidad.value;
  if (!Object.prototype.hasOwnProperty.call(ESPECIALIDADES, esp)) return null;
  return ESPECIALIDADES[esp].equipo.find(e => e.id === profesional.value) || null;
}

function ocupada(d, indice) {
  const semilla = d.getDate() * 7 + indice * 3 + (d.getMonth() + 1);
  return (semilla % 5) === 0 || (semilla % 7) === 3;
}

function pintarProfesionales() {
  const esp = especialidad.value;
  profesional.innerHTML = "";
  const vacio = document.createElement("option");
  vacio.value = "";
  vacio.textContent = esp === "" ? "Pick a specialty first" : "Choose a clinician";
  profesional.appendChild(vacio);
  if (esp === "") return;
  ESPECIALIDADES[esp].equipo.forEach(e => {
    const op = document.createElement("option");
    op.value = e.id;
    op.textContent = e.nombre + ", " + e.consulta;
    profesional.appendChild(op);
  });
  el("profesional-ayuda").textContent = ESPECIALIDADES[esp].equipo.length +
    (ESPECIALIDADES[esp].equipo.length === 1 ? " clinician" : " clinicians") + " in " + ESPECIALIDADES[esp].nombre + " this month.";
}

function pintarDias() {
  el("mesTitulo").textContent = MESES[vista.getMonth()] + " " + vista.getFullYear();
  const primero = new Date(vista.getFullYear(), vista.getMonth(), 1);
  const desplazamiento = (primero.getDay() + 6) % 7;
  const total = new Date(vista.getFullYear(), vista.getMonth() + 1, 0).getDate();
  dias.innerHTML = "";

  for (let k = 0; k < desplazamiento; k++) {
    const hueco = document.createElement("button");
    hueco.type = "button";
    hueco.className = "dia vacio";
    hueco.disabled = true;
    hueco.tabIndex = -1;
    hueco.setAttribute("aria-hidden", "true");
    dias.appendChild(hueco);
  }

  for (let n = 1; n <= total; n++) {
    const d = new Date(vista.getFullYear(), vista.getMonth(), n);
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "dia";
    if (clave(d) === clave(hoy)) boton.classList.add("dia-hoy");
    boton.textContent = String(n);
    boton.dataset.fecha = clave(d);
    boton.setAttribute("aria-label", textoFecha(d) + (cerrada(d) ? ", clinic closed" : (pasado(d) ? ", in the past" : ", free")));
    boton.setAttribute("aria-pressed", String(diaElegido !== null && clave(diaElegido) === clave(d)));
    boton.disabled = cerrada(d) || pasado(d);
    boton.addEventListener("click", () => {
      diaElegido = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      horaElegida = "";
      pintarDias();
      pintarHoras();
      pintarResumen();
      el("fecha-error").textContent = "";
    });
    dias.appendChild(boton);
  }

  el("mesAnt").disabled = vista.getFullYear() === hoy.getFullYear() && vista.getMonth() === hoy.getMonth();
}

function pintarHoras() {
  horas.innerHTML = "";
  el("env-hora").dataset.estado = "neutro";
  el("horas").setAttribute("aria-invalid", "false");
  el("hora-error").textContent = "";
  if (diaElegido === null) {
    el("hora-ayuda").textContent = "Pick a day first and the free hours show up here.";
    return;
  }
  FRANJAS.forEach((franja, indice) => {
    const ocupadaFranja = ocupada(diaElegido, indice);
    const label = document.createElement("label");
    label.className = "hora";
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "hora";
    input.id = "hora-" + indice;
    input.value = franja;
    input.checked = horaElegida === franja;
    input.disabled = ocupadaFranja;
    input.setAttribute("aria-label", franja + (ocupadaFranja ? ", already taken" : ", free"));
    input.addEventListener("change", () => {
      horaElegida = franja;
      pintarHoras();
      pintarResumen();
    });
    label.appendChild(input);
    label.appendChild(document.createTextNode(franja));
    horas.appendChild(label);
  });
  const libres = FRANJAS.filter((f, i) => !ocupada(diaElegido, i)).length;
  el("hora-ayuda").textContent = libres === 0
    ? "That day is fully booked. Pick another one."
    : libres + " of " + FRANJAS.length + " hours free on " + textoFecha(diaElegido) + ".";
}

function pintarResumen() {
  const esp = especialidad.value;
  const espDatos = Object.prototype.hasOwnProperty.call(ESPECIALIDADES, esp) ? ESPECIALIDADES[esp] : null;
  const clinico = clinicianActual();
  const minutos = espDatos ? espDatos.min + (nueva.checked ? 10 : 0) : 40;
  const precio = espDatos ? espDatos.precio + (nueva.checked ? 12 : 0) : 0;

  el("rCuando").textContent = diaElegido === null
    ? "Pick a day and an hour"
    : (horaElegida === "" ? textoFecha(diaElegido) : textoFecha(diaElegido) + " at " + horaElegida);
  el("rQuien").textContent = clinico === null ? "No clinician chosen yet" : clinico.nombre + ", " + clinico.consulta;
  el("rEspecialidad").textContent = espDatos === null ? "not chosen" : espDatos.nombre;
  el("rDuracion").textContent = minutos + " minutes" + (nueva.checked ? ", ten for the record" : "");
  el("rPrecio").textContent = espDatos === null ? "0,00 EUR" : dinero(precio);
  el("rFicha").textContent = nueva.checked ? "new record, opens on arrival" : "existing patient";
  el("rPie").textContent = diaElegido === null || horaElegida === ""
    ? "Nothing held yet"
    : "Held for you until " + (dos(9)) + ":00 tomorrow";

  const puntos = el("rPuntos");
  puntos.innerHTML = "";
  [
    "Reminder text forty eight hours before",
    nueva.checked ? "Ten extra minutes on the day for the records" : "Free to move up to twenty four hours ahead",
    clinico === null ? "Room assigned when the clinician is picked" : "Room " + clinico.consulta.replace("Room ", "").replace("Surgery ", "surgery ").replace("Gym ", "gym ") + " on the ground floor"
  ].forEach(texto => {
    const li = document.createElement("li");
    li.textContent = texto;
    puntos.appendChild(li);
  });

  const completos = CAMPOS.filter(f => el(f.id).value.trim() !== "" && f.prueba(el(f.id).value.trim())).length +
    (diaElegido !== null ? 1 : 0) + (horaElegida === "" ? 0 : 1);
  const total = CAMPOS.length + 2;
  const pct = Math.round((completos / total) * 100);
  medidorRelleno.style.transform = "scaleX(" + pct / 100 + ")";
  medidor.setAttribute("aria-valuenow", String(pct));
  medidor.setAttribute("aria-valuetext", pct + " per cent of the booking filled in");
  el("medidorTitulo").textContent = "Booking " + pct + " % ready";
  el("medidorFalta").textContent = (total - completos) + (total - completos === 1 ? " step to go" : " steps to go");
}

function textoError(f) {
  const valor = el(f.id).value.trim();
  return valor === "" ? f.vacio : f.error;
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
    mensaje.textContent = textoError(f);
  } else {
    env.dataset.estado = valor === "" ? "neutro" : "ok";
    control.setAttribute("aria-invalid", "false");
    mensaje.textContent = "";
  }
  control.setAttribute("aria-describedby", desc.join(" "));
  return malo;
}

function pintarTodo() {
  let primero = null;
  CAMPOS.forEach(f => {
    if (pintar(f) && !primero) primero = el(f.id);
  });
  if (diaElegido === null) {
    el("fecha-error").textContent = "The slot is not held until a day is chosen.";
  } else {
    el("fecha-error").textContent = "";
  }
  if (horaElegida === "") {
    el("horas").setAttribute("aria-invalid", "true");
    el("env-hora").dataset.estado = "error";
    el("hora-error").textContent = "Pick one of the free hours on the chosen day.";
  } else {
    el("horas").setAttribute("aria-invalid", "false");
    el("env-hora").dataset.estado = "ok";
    el("hora-error").textContent = "";
  }
  pintarResumen();
  return primero;
}

especialidad.addEventListener("change", () => {
  horaElegida = "";
  pintarProfesionales();
  pintar(CAMPOS[0]);
  pintar(CAMPOS[1]);
  pintarHoras();
  pintarResumen();
});

profesional.addEventListener("change", () => {
  pintar(CAMPOS[1]);
  pintarResumen();
});

["paciente", "telefono", "motivo"].forEach(id => {
  const control = el(id);
  control.addEventListener("blur", () => pintar(CAMPOS.find(f => f.id === id)));
  control.addEventListener("change", () => pintar(CAMPOS.find(f => f.id === id)));
  control.addEventListener("input", () => {
    if (control.closest(".campo").dataset.estado === "error") pintar(CAMPOS.find(f => f.id === id));
    pintarResumen();
  });
});

motivo.addEventListener("input", () => {
  el("motivoCuenta").textContent = motivo.value.length + " of 180";
});

nueva.addEventListener("change", () => {
  nueva.closest(".campo").dataset.estado = nueva.checked ? "ok" : "neutro";
  pintarResumen();
});

el("mesAnt").addEventListener("click", () => {
  vista = new Date(vista.getFullYear(), vista.getMonth() - 1, 1);
  pintarDias();
});

el("mesSig").addEventListener("click", () => {
  vista = new Date(vista.getFullYear(), vista.getMonth() + 1, 1);
  pintarDias();
});

dias.addEventListener("keydown", e => {
  const boton = document.activeElement;
  if (!boton || boton.classList.contains("vacio") || !boton.dataset.fecha) return;
  const partes = boton.dataset.fecha.split("-").map(Number);
  const actual = new Date(partes[0], partes[1] - 1, partes[2]);

  if (e.key === "PageUp" || e.key === "PageDown") {
    e.preventDefault();
    const salto = e.key === "PageUp" ? -1 : 1;
    vista = new Date(vista.getFullYear(), vista.getMonth() + salto, 1);
    pintarDias();
    const mismo = dias.querySelector("[data-fecha='" + boton.dataset.fecha + "']");
    (mismo || dias.querySelector(".dia:not(.vacio)")).focus();
    return;
  }

  let destino = null;
  if (e.key === "ArrowLeft") destino = new Date(actual.getTime() - 86400000);
  else if (e.key === "ArrowRight") destino = new Date(actual.getTime() + 86400000);
  else if (e.key === "ArrowUp") destino = new Date(actual.getTime() - 7 * 86400000);
  else if (e.key === "ArrowDown") destino = new Date(actual.getTime() + 7 * 86400000);
  else if (e.key === "Home") destino = new Date(actual.getTime() - ((actual.getDay() + 6) % 7) * 86400000);
  else if (e.key === "End") destino = new Date(actual.getTime() + (6 - ((actual.getDay() + 6) % 7)) * 86400000);
  if (destino === null) return;
  e.preventDefault();
  irA(destino);
});

function irA(destino) {
  vista = new Date(destino.getFullYear(), destino.getMonth(), 1);
  pintarDias();
  const boton = dias.querySelector("[data-fecha='" + clave(destino) + "']");
  if (boton && !boton.disabled) boton.focus();
  else {
    const primero = dias.querySelector(".dia:not(.vacio):not(:disabled)");
    if (primero) primero.focus();
  }
}

form.addEventListener("submit", e => {
  e.preventDefault();
  const primero = pintarTodo();
  const problemas = [];

  CAMPOS.forEach(f => {
    if (!f.prueba(el(f.id).value.trim())) problemas.push(f.etiqueta + ": " + textoError(f));
  });
  if (diaElegido === null) problemas.push("Day: the slot is not held until a day is chosen.");
  if (horaElegida === "") problemas.push("Hour: pick one of the free hours on the chosen day.");

  if (problemas.length > 0) {
    el("resumenTitulo").textContent = problemas.length === 1
      ? "One thing is missing from the booking"
      : problemas.length + " things are missing from the booking";
    el("resumenLista").innerHTML = "";
    problemas.forEach(t => {
      const li = document.createElement("li");
      li.textContent = t;
      el("resumenLista").appendChild(li);
    });
    el("resumenError").hidden = false;
    if (primero) primero.focus();
    else if (diaElegido === null) {
      const primeroDia = dias.querySelector(".dia:not(.vacio):not(:disabled)");
      if (primeroDia) primeroDia.focus();
    } else {
      const libre = horas.querySelector("input:not(:disabled)");
      if (libre) libre.focus();
    }
    return;
  }

  el("resumenError").hidden = true;
  const espDatos = ESPECIALIDADES[especialidad.value];
  const clinico = clinicianActual();
  const referencia = "RV-" + String(Math.floor(100000 + Math.random() * 900000));
  const sala = clinico.consulta.replace("Room ", "");
  const minutos = espDatos.min + (nueva.checked ? 10 : 0);
  const aviso = nueva.checked ? " Please arrive ten minutes early so reception can open the record." : "";

  el("confRef").textContent = referencia;
  el("confCuando").textContent = textoFecha(diaElegido) + " at " + horaElegida + ", " + minutos + " min";
  el("confQuien").textContent = clinico.nombre;
  el("confSala").textContent = sala + ", ground floor";
  el("confTitulo").textContent = "Held, " + horaElegida + " on " + diaElegido.getDate() + " " + MESES[diaElegido.getMonth()];
  el("confTexto").textContent = "A confirmation text goes to " + telefono.value.trim() + " now, with a reminder forty eight hours before." + aviso;

  form.hidden = true;
  document.querySelector(".resumen").hidden = true;
  confirmada.hidden = false;
  confirmada.focus();
});

el("otra").addEventListener("click", () => {
  confirmada.hidden = true;
  form.hidden = false;
  document.querySelector(".resumen").hidden = false;
  el("resumenError").hidden = true;
  form.reset();
  diaElegido = null;
  horaElegida = "";
  CAMPOS.forEach(f => {
    const control = el(f.id);
    control.closest(".campo").dataset.estado = "neutro";
    control.setAttribute("aria-invalid", "false");
    control.setAttribute("aria-describedby", f.id + "-ayuda");
    el(f.id + "-error").textContent = "";
  });
  el("motivoCuenta").textContent = "0 of 180";
  el("fecha-error").textContent = "";
  pintarProfesionales();
  pintarDias();
  pintarHoras();
  pintarResumen();
  especialidad.focus();
});

pintarProfesionales();
pintarDias();
pintarHoras();
pintarResumen();
