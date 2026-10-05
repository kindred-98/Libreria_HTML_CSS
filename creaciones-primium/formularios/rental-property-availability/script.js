const form = document.getElementById("form");
const zona = document.getElementById("zona");
const precio = document.getElementById("precio");
const rango = document.getElementById("precioRango");
const entrada = document.getElementById("entrada");
const salida = document.getElementById("salida");
const nombre = document.getElementById("nombre");
const telefono = document.getElementById("telefono");
const fianza = document.getElementById("fianza");
const resumenError = document.getElementById("resumenError");
const listaError = document.getElementById("resumenErrorLista");
const tituloError = document.getElementById("resumenErrorTitulo");
const enviado = document.getElementById("enviado");
const marcadores = document.getElementById("marcadores");

const VIVIENDAS = [
  { ref: "VA-001", calle: "Calle Robledal 14", zona: "centro", hab: 3, banos: 1, m2: 96, precio: 1450, planta: "Quinto sin ascensor", x: "18%", y: "52%", tonos: ["#7d9a4e", "#c7d8a2", "#5a7134", "#9fb86a"] },
  { ref: "VA-002", calle: "Avenida del Pino 22", zona: "norte", hab: 2, banos: 1, m2: 74, precio: 1120, planta: "Segundo con terraza", x: "46%", y: "16%", tonos: ["#8aa05c", "#d6e3b0", "#637b3c", "#a8bf75"] },
  { ref: "VA-003", calle: "Calle Rambla Vieja 3", zona: "centro", hab: 4, banos: 2, m2: 132, precio: 1980, planta: "Bajo con patio", x: "72%", y: "30%", tonos: ["#6f8b46", "#bccf94", "#4f6631", "#8fa861"] },
  { ref: "VA-004", calle: "Travesía del Sol 8", zona: "sur", hab: 1, banos: 1, m2: 48, precio: 780, planta: "Primero interior", x: "34%", y: "78%", tonos: ["#93a96a", "#e0e9c4", "#6d8444", "#b3c684"] },
  { ref: "VA-005", calle: "Calle del Olivar 51", zona: "norte", hab: 3, banos: 2, m2: 108, precio: 1690, planta: "Tercero con ascensor", x: "60%", y: "48%", tonos: ["#7f9c52", "#cadcab", "#5c7337", "#9cb96b"] },
  { ref: "VA-006", calle: "Plaza Mayor 2, ático B", zona: "centro", hab: 2, banos: 1, m2: 68, precio: 1290, planta: "Ático con vistas", x: "84%", y: "60%", tonos: ["#6a8742", "#b3c98a", "#4b622e", "#87a05a"] },
  { ref: "VA-007", calle: "Camino de la Fuente 17", zona: "sur", hab: 5, banos: 3, m2: 186, precio: 2350, planta: "Unchalet adosado", x: "12%", y: "82%", tonos: ["#88a055", "#d3e2ab", "#657d3f", "#a5bd6e"] }
];

const CAMPOS = [
  {
    id: "zona",
    etiqueta: "Zona del plano",
    vacio: "",
    error: "",
    prueba: v => ["", "centro", "norte", "sur", "este"].includes(v),
    suave: true
  },
  {
    id: "precio",
    etiqueta: "Precio máximo",
    vacio: "Escribe un techo de precio para la búsqueda.",
    error: "Entre 700 € y 2.500 € al mes, sin decimales.",
    prueba: v => /^\d{1,4}$/.test(v) && Number(v) >= 700 && Number(v) <= 2500
  },
  {
    id: "habitaciones", tipo: "radio",
    etiqueta: "Dormitorios mínimos",
    vacio: "Elige cuántos dormitorios necesitas como mínimo.",
    error: "Ese número de dormitorios no está en la lista.",
    prueba: v => ["0", "1", "2", "3", "4"].includes(v)
  },
  {
    id: "entrada",
    etiqueta: "Fecha de entrada",
    vacio: "Elige el día que te gustaría entrar.",
    error: "La entrada no puede ser anterior a hoy ni posterior a 12 meses.",
    prueba: v => fechaValida(v) && v >= HOY
  },
  {
    id: "salida",
    etiqueta: "Fecha de salida",
    vacio: "Elige el día de salida del piso.",
    error: "La salida tiene que ser posterior a la entrada y como mucho un año después.",
    prueba: v => fechaValida(v) && v > entrada.value && v <= sumarAnios(HOY, 1)
  },
  {
    id: "nombre",
    etiqueta: "Quién va a firmar",
    vacio: "Necesitamos un nombre para el informe de alta.",
    error: "Entre 2 y 40 caracteres, con al menos dos letras.",
    prueba: v => v.length >= 2 && v.length <= 40 && /[a-zA-ZÀ-ÿ]{2}/.test(v)
  },
  {
    id: "telefono",
    etiqueta: "Teléfono de contacto",
    vacio: "Falta un teléfono donde te puedan llamar.",
    error: "Debe ser un número español de nueve cifras, entre 600 y 799.",
    prueba: v => /^[6-7]\d{8}$/.test(v.replace(/[\s.-]/g, ""))
  },
  {
    id: "fianza", tipo: "check",
    etiqueta: "Fianza",
    vacio: "Hay que aceptar la fianza de un mes para pedir visita.",
    error: "Sin ese acuerdo no podemos tramitar la visita.",
    prueba: v => v === "si"
  }
];

const HOY = hoyISO();

function hoyISO() {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

function sumarAnios(iso, n) {
  const p = iso.split("-");
  const d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  d.setFullYear(d.getFullYear() + n);
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

function fechaValida(v) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const p = v.split("-");
  const d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  return d.getFullYear() === Number(p[0]) && d.getMonth() === Number(p[1]) - 1 && d.getDate() === Number(p[2]);
}

function euros(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " €";
}

function fechaCorta(v) {
  if (!v) return "sin elegir";
  const p = v.split("-");
  return Number(p[2]) + "/" + Number(p[1]) + "/" + p[0];
}

function el(id) { return document.getElementById(id); }

function habElegido() {
  const marcado = document.querySelector('input[name="hab"]:checked');
  return marcado ? marcado.value : "0";
}

function valor(f) {
  if (f.id === "habitaciones") return habElegido();
  if (f.id === "fianza") return fianza.checked ? "si" : "";
  return el(f.id).value.trim();
}

function contenedor(f) { return el(f.id).closest(".campo"); }

function coincidencias() {
  const z = zona.value;
  const tope = Number(precio.value) || 2500;
  const hab = Number(habElegido());
  const lista = VIVIENDAS.filter(v =>
    (z === "" || v.zona === z) &&
    v.precio <= tope &&
    v.hab >= hab
  );
  return lista.sort((a, b) => a.precio - b.precio);
}

function pintar(f) {
  const env = contenedor(f);
  const ayuda = el(f.id + "-ayuda");
  const error = el(f.id + "-error");
  const v = valor(f);
  const vacio = v === "";
  const malo = !vacio && !f.prueba(v);
  const fallo = f.suave ? malo : (vacio || malo);
  const desc = [ayuda.id];

  if (f.id === "habitaciones") {
    document.querySelector('input[name="hab"]').setAttribute("aria-invalid", fallo ? "true" : "false");
  } else {
    el(f.id).setAttribute("aria-invalid", fallo ? "true" : "false");
  }

  if (fallo) {
    env.dataset.estado = "error";
    desc.push(error.id);
    error.textContent = vacio ? f.vacio : f.error;
  } else {
    env.dataset.estado = vacio ? "neutro" : "ok";
    error.textContent = "";
  }

  if (f.id === "habitaciones") {
    document.querySelector(".pills").setAttribute("aria-describedby", desc.join(" "));
  } else {
    el(f.id).setAttribute("aria-describedby", desc.join(" "));
  }

  return fallo;
}

function problemaDe(f) {
  const v = valor(f);
  if (f.suave) return v !== "" && !f.prueba(v);
  return v === "" || !f.prueba(v);
}

function pintarTodo() {
  let primero = null;
  CAMPOS.forEach(f => {
    const fallo = pintar(f);
    if (fallo && !primero) primero = f.id === "habitaciones" ? document.querySelector('input[name="hab"]') : el(f.id);
  });
  return primero;
}

function pintarMapa() {
  const lista = coincidencias();
  const activa = lista.length > 0 ? lista[0].ref : "";

  marcadores.innerHTML = "";
  VIVIENDAS.forEach((v, i) => {
    const pin = document.createElement("span");
    pin.className = "marcador";
    pin.style.setProperty("--x", v.x);
    pin.style.setProperty("--y", v.y);
    pin.style.setProperty("--d", i * 0.35 + "s");
    const visible = lista.some(c => c.ref === v.ref);
    pin.dataset.visible = visible ? "1" : "0";
    pin.dataset.activo = v.ref === activa ? "1" : "0";
    marcadores.appendChild(pin);
  });

  el("enviarTexto").textContent = lista.length === 1
    ? "Pedir visita a 1 vivienda"
    : "Pedir visita a " + lista.length + " viviendas";

  if (lista.length === 0) {
    el("fichaEtiqueta").textContent = "Sin coincidencias";
    el("fichaRef").textContent = "—";
    el("fichaTitulo").textContent = "Prueba a subir el precio o a quitar la zona";
    el("fichaCalle").textContent = "Con los filtros actuales no queda ninguna vivienda activa en el plano.";
    el("fichaDatos").innerHTML = "";
    el("fichaPrecio").textContent = "0 € al mes";
    return;
  }

  const v = lista[0];
  el("fichaEtiqueta").textContent = "Coincidencia 1 de " + lista.length;
  el("fichaRef").textContent = v.ref;
  el("fichaTitulo").textContent = v.calle + ", " + v.hab + (v.hab === 1 ? " dormitorio" : " dormitorios");
  el("fichaCalle").textContent = "Barrio " + v.zona + " · " + v.planta;
  el("fichaPrecio").textContent = euros(v.precio) + " al mes";

  const fotos = document.querySelectorAll("#fichaFotos .foto");
  fotos.forEach((f, i) => { f.style.background = "linear-gradient(150deg, " + v.tonos[i] + ", " + v.tonos[(i + 2) % 4] + ")"; });

  const datos = document.getElementById("fichaDatos");
  datos.innerHTML = "";
  [[String(v.hab), v.hab === 1 ? "dormitorio" : "dormitorios"], [String(v.banos), v.banos === 1 ? "baño" : "baños"], [v.m2 + " m²", "superficie"], [letraEnergia(v.m2), "certificado"]].forEach(d => {
    const li = document.createElement("li");
    const b = document.createElement("b");
    b.textContent = d[0];
    const s = document.createElement("span");
    s.textContent = d[1];
    li.appendChild(b);
    li.appendChild(s);
    datos.appendChild(li);
  });
}

function letraEnergia(m2) {
  if (m2 < 60) return "B";
  if (m2 < 100) return "C";
  if (m2 < 150) return "D";
  return "E";
}

CAMPOS.forEach(f => {
  if (f.id === "habitaciones") {
    document.querySelectorAll('input[name="hab"]').forEach(r => {
      r.addEventListener("change", () => { pintar(f); pintarMapa(); });
      r.addEventListener("blur", () => pintar(f));
    });
    return;
  }
  if (f.id === "fianza") {
    fianza.addEventListener("change", () => { pintar(f); });
    return;
  }
  const nodo = el(f.id);
  nodo.addEventListener("blur", () => { pintar(f); pintarMapa(); });
  nodo.addEventListener("input", () => {
    if (nodo.closest(".campo").dataset.estado === "error") pintar(f);
    pintarMapa();
  });
  nodo.addEventListener("change", () => { pintarMapa(); });
});

rango.addEventListener("input", () => {
  precio.value = rango.value;
  const env = precio.closest(".campo");
  if (env.dataset.estado === "error") pintar(CAMPOS.find(f => f.id === "precio"));
  pintarMapa();
});

precio.addEventListener("input", () => {
  const n = Number(precio.value);
  if (n >= 700 && n <= 2500) rango.value = String(n);
});

form.addEventListener("submit", e => {
  e.preventDefault();
  const primero = pintarTodo();
  pintarMapa();

  const fallos = CAMPOS.filter(problemaDe);
  if (fallos.length > 0) {
    tituloError.textContent = fallos.length === 1
      ? "Falta corregir un dato de la búsqueda"
      : "Faltan " + fallos.length + " datos de la búsqueda";
    listaError.innerHTML = "";
    fallos.forEach(f => {
      const li = document.createElement("li");
      const v = valor(f);
      li.textContent = f.etiqueta + ": " + (v === "" ? f.vacio : f.error);
      listaError.appendChild(li);
    });
    resumenError.hidden = false;
    if (primero) primero.focus();
    return;
  }

  if (coincidencias().length === 0) {
    tituloError.textContent = "No hay viviendas con esos filtros";
    listaError.innerHTML = "";
    const li = document.createElement("li");
    li.textContent = "Prueba a subir el precio máximo o a dejar la zona en cualquier zona.";
    listaError.appendChild(li);
    resumenError.hidden = false;
    el("precio").focus();
    return;
  }

  resumenError.hidden = true;
  completar();
});

function completar() {
  const lista = coincidencias();
  const v = lista[0];
  const ref = "VS-" + String(Math.floor(100000 + Math.random() * 900000));

  el("enviadoRef").textContent = ref;
  el("enviadoVivienda").textContent = v.calle;
  el("enviadoFechas").textContent = fechaCorta(entrada.value) + " al " + fechaCorta(salida.value);
  el("enviadoPrecio").textContent = euros(v.precio);
  el("enviadoTitulo").textContent = "Visita pedida para " + v.calle;
  el("enviadoTexto").textContent = nombre.value.trim() + ", te llamamos al " + telefono.value.trim() +
    " para concertar la visita de " + fechaCorta(entrada.value) + ". Aplican los filtros que has marcado.";

  form.hidden = true;
  document.querySelector(".mapa-panelo").hidden = true;
  document.querySelector(".encabezado").hidden = true;
  enviado.hidden = false;
  enviado.focus();
}

el("otra").addEventListener("click", () => {
  enviado.hidden = true;
  form.hidden = false;
  document.querySelector(".mapa-panelo").hidden = false;
  document.querySelector(".encabezado").hidden = false;
  form.reset();
  precio.value = "2500";
  rango.value = "2500";
  document.querySelector('input[name="hab"][value="0"]').checked = true;
  entrada.value = "";
  salida.value = "";
  CAMPOS.forEach(f => {
    contenedor(f).dataset.estado = "neutro";
    el(f.id + "-error").textContent = "";
    if (f.id !== "habitaciones") {
      el(f.id).setAttribute("aria-invalid", "false");
      el(f.id).setAttribute("aria-describedby", f.id + "-ayuda");
    }
  });
  document.querySelector('input[name="hab"]').setAttribute("aria-invalid", "false");
  resumenError.hidden = true;
  pintarMapa();
  zona.focus();
});

entrada.value = "";
salida.value = "";
pintarMapa();
