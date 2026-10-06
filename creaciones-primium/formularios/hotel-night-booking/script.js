const form = document.getElementById("form");
const dias = document.getElementById("dias");
const habitacion = document.getElementById("habitacion");
const tarifa = document.getElementById("tarifa");
const desayuno = document.getElementById("desayuno");
const huesped = document.getElementById("huesped");
const correo = document.getElementById("correo");
const adultos = document.getElementById("adultos");
const ninos = document.getElementById("ninos");
const notas = document.getElementById("notas");
const medidor = document.getElementById("medidor");
const medidorRelleno = document.getElementById("medidorRelleno");
const confirmada = document.getElementById("confirmada");
const resumenError = document.getElementById("resumenError");
const listaError = document.getElementById("resumenLista");
const tituloError = document.getElementById("resumenTitulo");
const cajaCalendario = document.querySelector(".calendario-caja");

const MESES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DIAS_SEMANA = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const HABITACIONES = {
  doble: { nombre: "Double, courtyard", precio: 128, capacidad: 2, desayunoGratis: false },
  techo: { nombre: "Double with terrace", precio: 168, capacidad: 2, desayunoGratis: false },
  suite: { nombre: "Corner suite", precio: 245, capacidad: 2, desayunoGratis: true },
  familiar: { nombre: "Family room", precio: 198, capacidad: 4, desayunoGratis: true }
};

const TARIFAS = {
  flexible: { nombre: "Flexible", multiplicador: 1.14, desayuno: 12 },
  avanzada: { nombre: "Advance purchase", multiplicador: 1, desayuno: 12 },
  nocturno: { nombre: "Nightly, no breakfast", multiplicador: 0.92, desayuno: 0 }
};

const IMPUESTO = 3.4;

const CAMPOS = [
  { id: "fechas", etiqueta: "Nights", vacio: "Pick at least two nights, an arrival and a departure.", error: "The arrival has to come before the departure, and every night in between has to be free." },
  { id: "habitacion", etiqueta: "Room type", vacio: "Pick a room, the desk cannot guess a bed size.", error: "That room is not in this house." },
  { id: "tarifa", etiqueta: "Rate", vacio: "Pick a rate, there are three on the books.", error: "That rate is not offered this season." },
  { id: "huesped", etiqueta: "Guest name", vacio: "We need the name that goes on the passport check.", error: "Between three and forty characters, letters, spaces, apostrophes and dashes." },
  { id: "correo", etiqueta: "Confirmation email", vacio: "The door code and the breakfast time go to an address, so we need one.", error: "That does not look like name@domain.tld. Check for a missing dot." },
  { id: "adultos", etiqueta: "Adults", vacio: "", error: "" },
  { id: "ninos", etiqueta: "Children", vacio: "", error: "" },
  { id: "notas", etiqueta: "Notes", vacio: "", error: "Two hundred and twenty characters at the very most." }
];

let vista = new Date();
vista.setDate(1);
let llegada = null;
let salida = null;

const hoy = new Date();
hoy.setHours(0, 0, 0, 0);

function el(id) { return document.getElementById(id); }

function dos(n) { return String(n).padStart(2, "0"); }

function dinero(n) { return n.toFixed(2).replace(".", ",") + " EUR"; }

function clave(d) { return d.getFullYear() + "-" + dos(d.getMonth() + 1) + "-" + dos(d.getDate()); }

function textoFecha(d) { return DIAS_SEMANA[d.getDay()] + " " + d.getDate() + " " + MESES[d.getMonth()] + " " + d.getFullYear(); }

function textoCorto(d) { return d.getDate() + " " + MESES[d.getMonth()].substring(0, 3); }

function lleno(d) {
  const semilla = d.getDate() * 11 + (d.getMonth() + 1) * 7 + d.getDay() * 5;
  return (semilla % 9) === 0 || (semilla % 13) === 0;
}

function pasado(d) { return d.getTime() < hoy.getTime(); }

function noches() {
  if (llegada === null || salida === null) return 0;
  return Math.max(0, Math.round((salida.getTime() - llegada.getTime()) / 86400000));
}

function habitacionActual() {
  return Object.hasOwn(HABITACIONES, habitacion.value) ? HABITACIONES[habitacion.value] : null;
}

function tarifaActual() {
  return Object.hasOwn(TARIFAS, tarifa.value) ? TARIFAS[tarifa.value] : null;
}

function totales() {
  const n = noches();
  const hab = habitacionActual();
  const tar = tarifaActual();
  const ad = Number(adultos.value);
  const ni = Number(ninos.value);
  const habTotal = hab === null || tar === null ? 0 : hab.precio * tar.multiplicador * n;
  const gratis = hab !== null && hab.desayunoGratis;
  const desayunoTotal = desayuno.checked && tar !== null && !(gratis && ni === 0)
    ? (tar.desayuno - (ni === 0 && ad >= 2 ? 4 : 0)) * (ad + ni * 0.5) * n
    : 0;
  const impuesto = IMPUESTO * ad * n;
  return { n, hab, tar, ad, ni, habTotal, desayunoTotal, impuesto, total: habTotal + desayunoTotal + impuesto };
}

function pintarDias(focoClave) {
  el("mesTitulo").textContent = MESES[vista.getMonth()] + " " + vista.getFullYear();
  const primero = new Date(vista.getFullYear(), vista.getMonth(), 1);
  const desplazamiento = (primero.getDay() + 6) % 7;
  const total = new Date(vista.getFullYear(), vista.getMonth() + 1, 0).getDate();
  dias.innerHTML = "";

  for (let k = 0; k < desplazamiento; k++) {
    const hueco = document.createElement("span");
    hueco.className = "dia vacio";
    hueco.setAttribute("aria-hidden", "true");
    dias.appendChild(hueco);
  }

  for (let n = 1; n <= total; n++) {
    const d = new Date(vista.getFullYear(), vista.getMonth(), n);
    const k = clave(d);
    const esLlegada = llegada !== null && k === clave(llegada);
    const esSalida = salida !== null && k === clave(salida);
    const enRango = llegada !== null && salida !== null && d.getTime() > llegada.getTime() && d.getTime() < salida.getTime();
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "dia";
    boton.textContent = String(n);
    boton.dataset.clave = k;
    boton.dataset.indice = String(n - 1);
    if (k === clave(hoy)) boton.classList.add("dia-hoy");
    boton.disabled = lleno(d) || pasado(d);
    if (esLlegada || esSalida) boton.classList.add("dia--elegido");
    else if (enRango) boton.classList.add("dia--borde");
    boton.setAttribute("aria-pressed", String(esLlegada || esSalida || enRango));
    boton.setAttribute("aria-label", textoFecha(d) + (lleno(d) ? ", full house" : (pasado(d) ? ", in the past" : ", free")) +
      (esLlegada ? ", arrival" : (esSalida ? ", departure" : (enRango ? ", one of your nights" : ""))));

    boton.addEventListener("click", () => {
      if (llegada === null || (llegada !== null && salida !== null)) {
        llegada = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        salida = null;
      } else if (d.getTime() === llegada.getTime()) {
        llegada = null;
      } else if (d.getTime() < llegada.getTime()) {
        llegada = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      } else {
        salida = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      }
      if (salida !== null && hayNochesBloqueadas()) {
        llegada = null;
        salida = null;
        el("fechas-err").textContent = "";
        cajaCalendario.dataset.estado = "error";
        el("calendario-ayuda").textContent = "Those nights cross a full house, so the range was cleared. Pick an arrival and a departure with every night in between free.";
      }
      refrescar();
    });

    boton.addEventListener("keydown", e => {
      if (e.key === "Home") { e.preventDefault(); moverFoco(Math.floor((n - 1 - desplazamiento) / 7) * 7); return; }
      if (e.key === "End") { e.preventDefault(); moverFoco(Math.floor((n - 1 - desplazamiento) / 7) * 7 + 6); return; }
      if (e.key === "PageUp") { e.preventDefault(); cambiarMes(-1); moverFoco(n - 1); return; }
      if (e.key === "PageDown") { e.preventDefault(); cambiarMes(1); moverFoco(n - 1); return; }
      const paso = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
      if (paso !== undefined) {
        e.preventDefault();
        moverFoco(n - 1 + paso);
      }
    });

    dias.appendChild(boton);
  }

  el("mesAnt").disabled = vista.getFullYear() === hoy.getFullYear() && vista.getMonth() === hoy.getMonth();
  if (focoClave) {
    const destino = dias.querySelector('.dia[data-clave="' + focoClave + '"]');
    if (destino && !destino.disabled) destino.focus();
  }
}

function moverFoco(indice) {
  const lista = Array.from(dias.querySelectorAll(".dia:not(.vacio)"));
  if (lista.length === 0) return;
  const k = Math.max(0, Math.min(lista.length - 1, indice));
  lista[k].focus();
}

function cambiarMes(delta) {
  const objetivo = new Date(vista.getFullYear(), vista.getMonth() + delta, 1);
  if (objetivo.getTime() < new Date(hoy.getFullYear(), hoy.getMonth(), 1).getTime()) return;
  vista = objetivo;
  pintarDias();
}

function hayNochesBloqueadas() {
  if (llegada === null || salida === null) return false;
  for (let d = new Date(llegada.getTime()); d.getTime() < salida.getTime(); d.setDate(d.getDate() + 1)) {
    if (lleno(d) || pasado(d)) return true;
  }
  return false;
}

function refrescar() {
  const t = totales();
  const hab = habitacionActual();
  const tar = tarifaActual();
  const ad = Number(adultos.value);
  const ni = Number(ninos.value);
  const caben = hab === null || ad + ni <= hab.capacidad;

  el("rCuando").textContent = llegada === null
    ? "Pick your nights"
    : (salida === null
      ? "Arriving " + textoCorto(llegada)
      : textoCorto(llegada) + " to " + textoCorto(salida) + ", " + t.n + (t.n === 1 ? " night" : " nights"));
  el("rQuien").textContent = hab === null
    ? "No room chosen yet"
    : hab.nombre + (tar === null ? "" : ", " + tar.nombre.toLowerCase() + " rate") +
      (caben ? "" : " (too small for " + (ad + ni) + ")");
  el("rNoches").textContent = String(t.n);
  el("rHuespedes").textContent = ad + (ni === 0 ? "" : " + " + ni + (ni === 1 ? " child" : " children"));
  el("rHabitacion").textContent = hab === null ? "not chosen" : hab.nombre;
  el("rTarifa").textContent = tar === null ? "not chosen" : tar.nombre;
  el("rHabTotal").textContent = dinero(t.habTotal);
  el("rDesayuno").textContent = t.desayunoTotal === 0 ? "not added" : dinero(t.desayunoTotal);
  el("rImpuesto").textContent = dinero(t.impuesto);
  el("rTotal").textContent = dinero(t.total);

  const puntos = el("rPuntos");
  puntos.innerHTML = "";
  [
    t.n === 0 ? "Pick an arrival and a departure" : t.n + " night" + (t.n === 1 ? "" : "s") + ", breakfast served from seven to eleven",
    tar === null ? "Rate not chosen, the desk holds nothing without one" : (tar.nombre === "Flexible" ? "Cancel free until two days before the arrival" : "This rate is non refundable once the house confirms"),
    hab !== null && hab.desayunoGratis ? "Children under six eat free in this room" : "City tax is charged per adult and per night, collected at the desk"
  ].forEach(txt => {
    const li = document.createElement("li");
    li.textContent = txt;
    puntos.appendChild(li);
  });

  el("rPie").textContent = t.n === 0
    ? "Nothing held yet"
    : "Held for you until 18:00 tomorrow, no card yet";

  el("calendario-ayuda").textContent = llegada === null && salida === null
    ? "Arrow keys walk the days, Home and End jump to the ends of the week, Page Up and Page Down change month. Full nights are not selectable, and the arrival has to come before the departure."
    : (salida === null
      ? "Arrival set to " + textoFecha(llegada) + ". Now pick the departure day."
      : textoNochesLibres());

  el("notasCuenta").textContent = notas.value.length + " of 220";

  const obligatorios = ["fechas", "habitacion", "tarifa", "huesped", "correo"];
  const completos = obligatorios.filter(id => {
    if (id === "fechas") return t.n > 0;
    return el(id).value.trim() !== "";
  }).length + (caben ? 1 : 0);
  const total = obligatorios.length + 1;
  const pct = Math.round((completos / total) * 100);
  medidorRelleno.style.transform = "scaleX(" + (pct / 100) + ")";
  medidor.setAttribute("aria-valuenow", String(pct));
  medidor.setAttribute("aria-valuetext", pct + " per cent of the booking filled in");
  el("medidorTitulo").textContent = "Booking " + pct + " % ready";
  el("medidorFalta").textContent = (total - completos) + (total - completos === 1 ? " step to go" : " steps to go");

  return t;
}

function textoNochesLibres() {
  if (llegada === null || salida === null) return "";
  const totalNoches = Math.round((salida.getTime() - llegada.getTime()) / 86400000);
  let libres = 0;
  for (let d = new Date(llegada.getTime()); d.getTime() < salida.getTime(); d.setDate(d.getDate() + 1)) {
    if (!lleno(d)) libres += 1;
  }
  const ultima = new Date(salida.getTime() - 86400000);
  return totalNoches + " nights, " + libres + " of them free, " + textoFecha(ultima) + " is the last night.";
}

function problemas() {
  const salida = [];
  CAMPOS.forEach(f => {
    if (f.id === "fechas") {
      if (noches() === 0) salida.push("Nights: " + f.vacio);
      else if (habitacionActual() === null) {
        salida.push("Nights: those nights are picked, but the range crosses a full house so it was cleared.");
      }
      return;
    }
    if (f.id === "adultos" || f.id === "ninos") return;
    const v = el(f.id).value.trim();
    if (f.id === "notas") {
      if (v.length > 220) salida.push(f.etiqueta + ": " + f.error);
      return;
    }
    if (v === "") {
      if (f.vacio !== "") salida.push(f.etiqueta + ": " + f.vacio);
      return;
    }
    if (f.id === "habitacion" && habitacionActual() === null) { salida.push(f.etiqueta + ": " + f.error); return; }
    if (f.id === "tarifa" && tarifaActual() === null) { salida.push(f.etiqueta + ": " + f.error); return; }
    if (f.id === "huesped" && !/^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ '\-.'.]{2,39}$/.test(v)) { salida.push(f.etiqueta + ": " + f.error); return; }
    if (f.id === "correo" && !/^[^\s@,;]+@[^\s@,;]+\.[A-Za-z]{2,}$/.test(v)) { salida.push(f.etiqueta + ": " + f.error); }
  });

  const hab = habitacionActual();
  const plazas = Number(adultos.value) + Number(ninos.value);
  if (hab !== null && plazas > hab.capacidad) {
    salida.push("Room type: the " + hab.nombre.toLowerCase() + " sleeps " + hab.capacidad + ". Pick the family room or take a lower head count.");
  }
  return salida;
}

function pintarCampo(f) {
  if (f.id === "fechas" || f.id === "adultos" || f.id === "ninos") return false;
  const env = el(f.id).closest(".campo");
  const ayuda = el(f.id + "-ayuda");
  const err = el(f.id + "-err");
  const control = el(f.id);
  const v = control.value.trim();
  let malo = false;
  if (f.id === "notas") malo = v.length > 220;
  else if (f.id === "habitacion") malo = v !== "" && habitacionActual() === null;
  else if (f.id === "tarifa") malo = v !== "" && tarifaActual() === null;
  else if (f.id === "huesped") malo = v !== "" && !/^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ '\-.'.]{2,39}$/.test(v);
  else if (f.id === "correo") malo = v !== "" && !/^[^\s@,;]+@[^\s@,;]+\.[A-Za-z]{2,}$/.test(v);
  else if (v === "") malo = true;
  const desc = [ayuda.id];

  if (malo) {
    env.dataset.estado = "error";
    control.setAttribute("aria-invalid", "true");
    desc.push(err.id);
    err.textContent = v === "" ? f.vacio : f.error;
  } else {
    env.dataset.estado = v === "" ? "neutro" : "ok";
    control.setAttribute("aria-invalid", "false");
    err.textContent = "";
  }
  control.setAttribute("aria-describedby", desc.join(" "));
  return malo;
}

function mostrarResumen(fallos) {
  tituloError.textContent = fallos.length === 1
    ? "One step is stopping the booking"
    : fallos.length + " steps are stopping the booking";
  listaError.innerHTML = "";
  fallos.forEach(t => {
    const li = document.createElement("li");
    li.textContent = t;
    listaError.appendChild(li);
  });
  resumenError.hidden = false;
}

el("mesAnt").addEventListener("click", () => cambiarMes(-1));
el("mesSig").addEventListener("click", () => cambiarMes(1));

CAMPOS.forEach(f => {
  if (f.id === "fechas" || f.id === "adultos" || f.id === "ninos") return;
  const nodo = el(f.id);
  nodo.addEventListener("blur", () => pintarCampo(f));
  nodo.addEventListener("change", () => { pintarCampo(f); refrescar(); });
  nodo.addEventListener("input", () => {
    if (nodo.closest(".campo").dataset.estado === "error") pintarCampo(f);
    refrescar();
  });
});

[adultos, ninos].forEach(sel => {
  sel.addEventListener("change", () => {
    const env = sel.closest(".campo");
    env.dataset.estado = "neutro";
    sel.setAttribute("aria-invalid", "false");
    refrescar();
  });
});

desayuno.addEventListener("change", () => {
  desayuno.closest(".campo").dataset.estado = desayuno.checked ? "ok" : "neutro";
  desayuno.setAttribute("aria-invalid", "false");
  refrescar();
});

form.addEventListener("submit", e => {
  e.preventDefault();
  CAMPOS.forEach(f => pintarCampo(f));
  const t = refrescar();
  const fallos = problemas();

  if (fallos.length > 0) {
    mostrarResumen(fallos);
    if (noches() === 0) {
      const libre = dias.querySelector(".dia:not(:disabled)");
      if (libre) libre.focus();
      else cambiarMes(1);
      return;
    }
    if (habitacion.value === "") { habitacion.focus(); return; }
    if (tarifa.value === "") { tarifa.focus(); return; }
    if (huesped.value.trim() === "" || !/^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ '\-.'.]{2,39}$/.test(huesped.value.trim())) { huesped.focus(); return; }
    correo.focus();
    return;
  }

  resumenError.hidden = true;
  el("confRef").textContent = "CF-" + String(Math.floor(100000 + Math.random() * 900000));
  el("confLlegada").textContent = textoFecha(llegada);
  el("confSalida").textContent = textoFecha(salida);
  el("confTotal").textContent = dinero(t.total);
  el("confTitulo").textContent = "See you on the " + textoCorto(llegada);
  el("confTexto").textContent = t.n + " night" + (t.n === 1 ? "" : "s") + " in a " +
    t.hab.nombre.toLowerCase() + " for " + t.ad + (t.ni === 0 ? "" : " and " + t.ni + (t.ni === 1 ? " child" : " children")) +
    ", " + dinero(t.total) + " in total. A confirmation is on its way to " + correo.value.trim() + ".";

  form.hidden = true;
  document.querySelector(".tarjeta").hidden = true;
  confirmada.hidden = false;
  confirmada.focus();
});

el("otra").addEventListener("click", () => {
  form.reset();
  llegada = null;
  salida = null;
  CAMPOS.forEach(f => {
    if (f.id === "fechas" || f.id === "adultos" || f.id === "ninos") return;
    const env = el(f.id).closest(".campo");
    env.dataset.estado = "neutro";
    el(f.id + "-err").textContent = "";
    el(f.id).setAttribute("aria-invalid", "false");
    el(f.id).setAttribute("aria-describedby", f.id + "-ayuda");
  });
  desayuno.closest(".campo").dataset.estado = "neutro";
  cajaCalendario.dataset.estado = "neutro";
  el("fechas-err").textContent = "";
  resumenError.hidden = true;
  confirmada.hidden = true;
  form.hidden = false;
  document.querySelector(".tarjeta").hidden = false;
  vista = new Date();
  vista.setDate(1);
  pintarDias();
  refrescar();
  const libre = dias.querySelector(".dia:not(:disabled)");
  if (libre) libre.focus();
});

pintarDias();
refrescar();
