const form = document.getElementById("form");
const pins = document.getElementById("pins");
const dias = document.getElementById("dias");
const horarioLista = document.getElementById("horarioLista");
const horaSel = document.getElementById("hora");
const resumenError = document.getElementById("resumenError");
const listaError = document.getElementById("resumenErrorLista");
const tituloError = document.getElementById("resumenErrorTitulo");
const confirmada = document.getElementById("confirmada");

const DIAS_SEMANA = [
  { clave: "lun", texto: "Mon", largo: "Monday" },
  { clave: "mar", texto: "Tue", largo: "Tuesday" },
  { clave: "mie", texto: "Wed", largo: "Wednesday" },
  { clave: "jue", texto: "Thu", largo: "Thursday" },
  { clave: "vie", texto: "Fri", largo: "Friday" },
  { clave: "sab", texto: "Sat", largo: "Saturday" },
  { clave: "dom", texto: "Sun", largo: "Sunday" }
];

const SALAS = [
  {
    clave: "contador",
    nombre: "The Old Counter",
    direccion: "14 Quarry Lane, on the corner",
    x: 26,
    y: 44,
    horarios: {
      lun: ["12:00", "15:00", "18:00", "22:30"],
      mar: ["12:00", "15:00", "18:00", "22:30"],
      mie: ["12:00", "15:00", "18:00", "22:30"],
      jue: ["12:00", "15:00", "18:00", "22:30"],
      vie: ["12:00", "15:00", "18:00", "23:30"],
      sab: ["11:00", "14:00", "18:00", "23:30"],
      dom: null
    }
  },
  {
    clave: "ribera",
    nombre: "The Riverside Room",
    direccion: "3 Weir Walk, above the lock keeper",
    x: 62,
    y: 26,
    horarios: {
      lun: null,
      mar: ["17:30", "21:00"],
      mie: ["17:30", "21:00"],
      jue: ["17:30", "21:30"],
      vie: ["17:30", "22:00"],
      sab: ["12:00", "14:30", "18:00", "22:00"],
      dom: ["12:00", "15:00"]
    }
  },
  {
    clave: "tejado",
    nombre: "The Roof Kitchen",
    direccion: "9 Lantern Street, seventh floor",
    x: 74,
    y: 66,
    horarios: {
      lun: ["18:00", "22:00"],
      mar: ["18:00", "22:00"],
      mie: ["18:00", "23:00"],
      jue: ["18:00", "23:00"],
      vie: ["18:00", "00:00"],
      sab: ["18:00", "00:00"],
      dom: ["12:00", "16:00"]
    }
  },
  {
    clave: "mercado",
    nombre: "The Market Stall",
    direccion: "2 Cloth Hall, stand four",
    x: 44,
    y: 76,
    horarios: {
      lun: ["07:00", "10:00", "13:00", "14:30"],
      mar: ["07:00", "10:00", "13:00", "14:30"],
      mie: ["07:00", "10:00", "13:00", "14:30"],
      jue: ["07:00", "10:00", "13:00", "14:30"],
      vie: ["07:00", "10:00", "13:00", "15:00"],
      sab: ["08:00", "11:00", "14:00"],
      dom: ["08:00", "11:00", "14:00"]
    }
  }
];

const SERVICIOS = {
  sala: { texto: "In the dining room", nota: "" },
  terraza: { texto: "On the terrace", nota: " The terrace is not served after twenty o'clock." },
  barra: { texto: "At the counter", nota: " The counter takes parties of six or fewer." }
};

const st = { sala: 0, dia: 0, personas: 2, servicio: "", hora: "" };

function el(id) { return document.getElementById(id); }

function nodo(etiqueta, clase, texto) {
  const n = document.createElement(etiqueta);
  if (clase) n.className = clase;
  if (texto !== undefined) n.textContent = texto;
  return n;
}

function dos(n) { return String(n).padStart(2, "0"); }

function minutos(hhmm) {
  const p = hhmm.split(":");
  return Number(p[0]) * 60 + Number(p[1]);
}

function aMinutos(m) {
  return dos(Math.floor(m / 60) % 24) + ":" + dos(m % 60);
}

function franjasDe(sala) {
  const hoy = sala.horarios[DIAS_SEMANA[st.dia].clave];
  if (!hoy) return [];
  const inicio = minutos(hoy[0]);
  const fin = minutos(hoy[hoy.length - 1]);
  const salida = [];
  for (let m = inicio + 30; m <= fin - 30; m += 30) salida.push(aMinutos(m));
  return salida;
}

function pintarPins() {
  pins.innerHTML = "";
  SALAS.forEach((s, i) => {
    const b = nodo("button", "pin");
    b.type = "button";
    b.style.left = s.x + "%";
    b.style.top = s.y + "%";
    b.dataset.activo = i === st.sala ? "1" : "0";
    b.dataset.cerrado = s.horarios[DIAS_SEMANA[st.dia].clave] ? "0" : "1";
    b.setAttribute("aria-pressed", i === st.sala ? "true" : "false");
    b.setAttribute("aria-label", s.nombre + ", " + s.direccion + (b.dataset.cerrado === "1" ? ", closed on " + DIAS_SEMANA[st.dia].largo : ""));
    b.appendChild(nodo("span", null, String(i + 1)));
    b.addEventListener("click", () => {
      st.sala = i;
      st.hora = "";
      pintarTodo();
    });
    pins.appendChild(b);
  });
}

function pintarDias() {
  dias.innerHTML = "";
  const sala = SALAS[st.sala];
  DIAS_SEMANA.forEach((d, i) => {
    const cerrado = !sala.horarios[d.clave];
    const b = nodo("button", "dia");
    b.type = "button";
    b.dataset.cerrado = cerrado ? "1" : "0";
    b.setAttribute("aria-pressed", i === st.dia ? "true" : "false");
    b.setAttribute("aria-label", d.largo + (cerrado ? ", closed all day" : ", open"));
    b.appendChild(nodo("span", null, d.texto));
    b.appendChild(nodo("small", null, fechaCorta(i)));
    b.addEventListener("click", () => {
      st.dia = i;
      st.hora = "";
      pintarTodo();
    });
    dias.appendChild(b);
  });
}

function fechaCorta(desplaza) {
  const d = new Date();
  d.setDate(d.getDate() + desplaza);
  return d.getDate() + "/" + (d.getMonth() + 1);
}

function pintarHorario() {
  const sala = SALAS[st.sala];
  const clave = DIAS_SEMANA[st.dia].clave;
  const hoy = sala.horarios[clave];
  el("horarioDia").textContent = "on " + DIAS_SEMANA[st.dia].largo.toLowerCase();
  horarioLista.innerHTML = "";

  if (!hoy) {
    const li = nodo("li");
    li.dataset.cerrado = "1";
    li.appendChild(nodo("span", null, "Closed all day"));
    li.appendChild(nodo("b", null, "rest day"));
    horarioLista.appendChild(li);
  } else {
    for (let i = 0; i < hoy.length - 1; i++) {
      const li = nodo("li");
      li.style.animationDelay = (i * 0.05).toFixed(2) + "s";
      li.appendChild(nodo("span", null, i === 0 ? "First sitting" : i === hoy.length - 2 ? "Last sitting" : "Sitting " + (i + 1)));
      li.appendChild(nodo("b", null, hoy[i] + " to " + hoy[i + 1]));
      horarioLista.appendChild(li);
    }
  }

  const abierto = hoy !== null;
  const estado = el("estado");
  estado.dataset.abierto = abierto ? "1" : "0";
  estado.textContent = abierto
    ? "Open on " + DIAS_SEMANA[st.dia].largo + ", last sitting at " + hoy[hoy.length - 2] + " to " + hoy[hoy.length - 1]
    : "Closed on " + DIAS_SEMANA[st.dia].largo;

  return abierto;
}

function pintarHoras() {
  const franjas = franjasDe(SALAS[st.sala]);
  horaSel.innerHTML = "";
  horaSel.appendChild(new Option(franjas.length === 0 ? "No times on this day" : "Choose a time", ""));
  franjas.forEach(f => {
    if (st.servicio === "terraza" && minutos(f) >= 20 * 60) return;
    if (st.servicio === "barra" && st.personas > 6) return;
    horaSel.appendChild(new Option(f, f));
  });
  horaSel.value = st.hora;
  horaSel.disabled = franjas.length === 0;
  el("hora-ayuda").textContent = franjas.length === 0
    ? "This room is closed on " + DIAS_SEMANA[st.dia].largo.toLowerCase() + ". Pick another day, or another room on the map."
    : st.servicio === "terraza" && minutos(st.hora || "00:00") >= 20 * 60
      ? "The terrace stops being served at twenty o'clock, so the list stops there too."
      : "Half hour slots, thirty minutes after the first sitting and before the last one ends.";
  el("hora-ayuda").dataset.alerta = franjas.length === 0 ? "1" : "0";
}

function moverCap() {
  const rango = el("personas");
  const cap = el("capPersonas");
  const ancho = rango.clientWidth || 260;
  const pos = ((Number(rango.value) - 1) / 11) * (ancho - 22);
  cap.style.setProperty("--pos", pos.toFixed(1) + "px");
}

function pintarTodo() {
  const sala = SALAS[st.sala];
  el("salaTitulo").textContent = sala.nombre;
  el("salaDireccion").textContent = sala.direccion;
  pintarPins();
  pintarDias();
  const abierto = pintarHorario();
  pintarHoras();
  moverCap();
  el("servicio-ayuda").textContent = st.personas > 6 && !SERVICIOS[st.servicio]
    ? "With more than six people only the dining room and the terrace hold."
    : SERVICIOS[st.servicio] ? SERVICIOS[st.servicio].nota || "The host seats parties here within twenty minutes." : "The terrace closes with the sun, so it is not on the list after eight in the evening.";
  return abierto;
}

function fallo(f) {
  const v = f.valor();
  if (v === "") return f.vacio;
  return f.prueba(v) ? "" : f.error;
}

const CAMPOS = [
  {
    id: "servicio",
    etiqueta: "Where you sit",
    valor: () => el("servicio").value,
    vacio: "Say where you want to sit, the host plans the room around it.",
    error: "That seating option is not on the list.",
    prueba: v => Object.hasOwn(SERVICIOS, v)
  },
  {
    id: "hora",
    etiqueta: "Time",
    valor: () => el("hora").value,
    vacio: "Choose a time from the list for this day.",
    error: "That slot is not on the list for this room on this day.",
    prueba: () => franjasDe(SALAS[st.sala]).includes(el("hora").value)
  },
  {
    id: "personas",
    etiqueta: "Party size",
    valor: () => String(st.personas),
    vacio: "Say how many you are.",
    error: "Between one and twelve.",
    prueba: v => Number(v) >= 1 && Number(v) <= 12
  },
  {
    id: "nombre",
    etiqueta: "Name",
    valor: () => el("nombre").value.trim(),
    vacio: "The host needs a name to look for at the door.",
    error: "Between three and forty six characters, letters and spaces.",
    prueba: v => v.length >= 3 && v.length <= 46 && /[A-Za-zÀ-ÿ]{2}/.test(v)
  },
  {
    id: "telefono",
    etiqueta: "Mobile",
    valor: () => el("telefono").value.trim(),
    vacio: "A mobile number, in case the room is running late.",
    error: "Nine to fifteen digits, the plus sign and spaces allowed.",
    prueba: v => {
      const d = v.replace(/\D/g, "");
      return d.length >= 9 && d.length <= 15;
    }
  },
  {
    id: "correo",
    etiqueta: "Email",
    valor: () => el("correo").value.trim(),
    vacio: "The confirmation needs an address.",
    error: "That does not look like an address. Try name@domain.com.",
    prueba: v => /^[^\s@,;]+@[^\s@,;]+\.[a-zA-Z]{2,}$/.test(v) && v.length <= 60
  }
];

function pintar(f) {
  const env = el(f.id).closest(".campo");
  const ayuda = el(f.id + "-ayuda");
  const err = el(f.id + "-err");
  const mensaje = fallo(f);
  env.dataset.estado = mensaje ? "error" : "ok";
  el(f.id).setAttribute("aria-invalid", mensaje ? "true" : "false");
  el(f.id).setAttribute("aria-describedby", mensaje ? ayuda.id + " " + err.id : ayuda.id);
  err.textContent = mensaje;
  return mensaje;
}

function marcarError(campo, mensaje) {
  const env = el(campo).closest(".campo");
  const ayuda = el(campo + "-ayuda");
  const err = el(campo + "-err");
  env.dataset.estado = "error";
  el(campo).setAttribute("aria-invalid", "true");
  el(campo).setAttribute("aria-describedby", ayuda.id + " " + err.id);
  err.textContent = mensaje;
}

function problemas() {
  const salida = [];
  if (st.servicio === "terraza" && !franjasDe(SALAS[st.sala]).some(f => minutos(f) < 20 * 60)) {
    marcarError("hora", "The terrace is only served during the day, and the first sitting on this day is after twenty o'clock.");
    salida.push({ campo: "hora", etiqueta: "Time", mensaje: "The terrace is only served during the day, and the first sitting on this day is after twenty o'clock." });
    return salida;
  }
  if (st.servicio === "barra" && st.personas > 6) {
    marcarError("servicio", "The counter takes six at most. Pick the dining room or the terrace for a bigger party.");
    salida.push({ campo: "servicio", etiqueta: "Where you sit", mensaje: "The counter takes six at most. Pick the dining room or the terrace for a bigger party." });
    return salida;
  }
  CAMPOS.forEach(f => {
    const m = fallo(f);
    if (m) salida.push({ campo: f.id, etiqueta: f.etiqueta, mensaje: m });
  });
  return salida;
}

el("hora").addEventListener("change", e => {
  st.hora = e.target.value;
  pintar(CAMPOS.find(f => f.id === "hora"));
});

el("servicio").addEventListener("change", e => {
  st.servicio = e.target.value;
  st.hora = "";
  pintarHoras();
  pintar(CAMPOS[0]);
});

el("personas").addEventListener("input", () => {
  st.personas = Number(el("personas").value);
  el("personas-ayuda").textContent = st.personas > 8
    ? "Above eight the room asks for a twenty euro deposit, taken on the night."
    : "Between one and twelve. Above eight the room asks for a deposit.";
  moverCap();
  pintarHoras();
  pintarTodo();
});

["servicio", "personas", "hora", "nombre", "telefono", "correo"].forEach(id => {
  el(id).addEventListener("blur", () => pintar(CAMPOS.find(f => f.id === id)));
});

CAMPOS.filter(f => f.id === "nombre" || f.id === "telefono" || f.id === "correo").forEach(f => {
  el(f.id).addEventListener("input", () => {
    if (el(f.id).closest(".campo").dataset.estado === "error") pintar(f);
  });
});

el("avisos").addEventListener("change", () => {
  el("avisos").closest(".campo").dataset.estado = el("avisos").checked ? "ok" : "neutro";
  el("avisos").setAttribute("aria-invalid", "false");
});

form.addEventListener("submit", e => {
  e.preventDefault();
  CAMPOS.forEach((...args) => pintar(...args));
  const fallos = problemas();

  if (fallos.length > 0) {
    tituloError.textContent = fallos.length === 1
      ? "One thing is missing on this booking"
      : fallos.length + " things are missing on this booking";
    listaError.innerHTML = "";
    fallos.forEach(f => {
      const li = document.createElement("li");
      li.textContent = f.etiqueta + ": " + f.mensaje;
      listaError.appendChild(li);
    });
    resumenError.hidden = false;
    const destino = el(fallos[0].campo);
    if (destino) destino.focus();
    return;
  }

  resumenError.hidden = true;
  el("reservarTexto").textContent = "Holding the table";
  form.querySelector(".reservar").disabled = true;
  window.setTimeout(terminar, 800);
});

function terminar() {
  const sala = SALAS[st.sala];
  const ref = "RES-" + String(Math.floor(1000 + Math.random() * 8999));
  el("confirmadaRef").textContent = ref;
  el("confirmadaSala").textContent = sala.nombre;
  el("confirmadaCuando").textContent = DIAS_SEMANA[st.dia].largo.slice(0, 3) + " at " + st.hora;
  el("confirmadaGente").textContent = st.personas + (st.personas === 1 ? " person" : " people");
  el("confirmadaTitulo").textContent = "See you at " + sala.nombre.replace("The ", "");
  el("confirmadaLead").textContent = el("nombre").value.trim() + ", " + st.personas +
    (st.personas === 1 ? " person" : " people") + " on " + DIAS_SEMANA[st.dia].largo.toLowerCase() +
    " at " + st.hora + ", " + SERVICIOS[st.servicio].texto.toLowerCase() +
    ". The confirmation is on its way to " + el("correo").value.trim() + ".";
  el("confirmadaNota").textContent = "The table is held until fifteen minutes past " + st.hora +
    (el("avisos").checked ? " and you will get a text the day before at six in the evening." : " and no reminder is sent, you turned it off.") +
    " Change or cancel from the link in the email.";

  document.querySelector(".escena").hidden = true;
  document.querySelector(".barra").hidden = true;
  confirmada.hidden = false;
  confirmada.focus();
}

el("otra").addEventListener("click", () => {
  confirmada.hidden = true;
  document.querySelector(".escena").hidden = false;
  document.querySelector(".barra").hidden = false;
  form.reset();
  st.sala = 0;
  st.dia = 0;
  st.personas = 2;
  st.servicio = "";
  st.hora = "";
  form.querySelector(".reservar").disabled = false;
  el("reservarTexto").textContent = "Book the table";
  el("avisos").closest(".campo").dataset.estado = "neutro";
  CAMPOS.forEach(f => {
    el(f.id).closest(".campo").dataset.estado = "neutro";
    el(f.id).setAttribute("aria-invalid", "false");
    el(f.id).setAttribute("aria-describedby", f.id + "-ayuda");
    el(f.id + "-err").textContent = "";
  });
  resumenError.hidden = true;
  pintarTodo();
  document.querySelector(".escena").scrollIntoView({ block: "start" });
});

window.addEventListener("resize", moverCap);

pintarTodo();
CAMPOS.forEach(f => {
  el(f.id).closest(".campo").dataset.estado = "neutro";
  el(f.id + "-err").textContent = "";
});
