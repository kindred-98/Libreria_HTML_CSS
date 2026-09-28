const form = document.getElementById("form");
const lineas = document.getElementById("lineas");
const comensales = document.getElementById("comensales");
const comensalesVacio = document.getElementById("comensalesVacio");
const nombre = document.getElementById("nombre");
const resumenError = document.getElementById("resumenError");
const listaError = document.getElementById("resumenLista");
const tituloError = document.getElementById("resumenTitulo");
const listo = document.getElementById("listo");

const ARTICULOS = [
  { id: "margarita", nombre: "Pizza margherita", detalle: "8 slices, basil and tomato", precio: 11.5, tipo: "pizza" },
  { id: "diavola", nombre: "Pizza diavola", detalle: "8 slices, spicy salami", precio: 14.0, tipo: "pizza" },
  { id: "bottle", nombre: "Bottle of water", detalle: "1 litre, still", precio: 3.2, tipo: "botella" },
  { id: "tiramisu", nombre: "Tiramisu for the table", detalle: "4 forks", precio: 9.6, tipo: "postre" }
];

const TONES = [
  ["#d8a35c", "#a06a34"],
  ["#c9713f", "#8a3f1f"],
  ["#8fae5a", "#4f6b2e"],
  ["#b58a86", "#7a4f4c"],
  ["#8a9fc4", "#4a5c85"],
  ["#c9a35f", "#8a6a2f"]
];

let gente = [
  { id: "p1", nombre: "Marta", porciones: 2 },
  { id: "p2", nombre: "Idris", porciones: 3 },
  { id: "p3", nombre: "Salvo", porciones: 1 }
];

let siguiente = 4;

function el(id) { return document.getElementById(id); }

function dinero(n) {
  return n.toFixed(2).replace(".", ",") + " EUR";
}

function total() {
  return ARTICULOS.reduce((s, a) => s + a.precio, 0);
}

function totalPorciones() {
  return ARTICULOS.filter(a => a.tipo === "pizza").reduce((s, a) => s + 8, 0);
}

function asignadas() {
  return gente.reduce((s, p) => s + p.porciones, 0);
}

function valorPorcion() {
  const t = totalPorciones();
  return t === 0 ? 0 : total() / t;
}

function tonoDe(nombre) {
  let suma = 0;
  for (let k = 0; k < nombre.length; k++) suma += nombre.charCodeAt(k);
  return TONES[suma % TONES.length];
}

function pintarLineas() {
  lineas.innerHTML = "";
  ARTICULOS.forEach(a => {
    const li = document.createElement("li");
    li.className = "linea";

    const figura = document.createElement("span");
    figura.className = "linea-figura";
    figura.setAttribute("aria-hidden", "true");

    const cuerpo = document.createElement("div");
    const nombreEl = document.createElement("p");
    nombreEl.className = "linea-nombre";
    nombreEl.textContent = a.nombre;
    const meta = document.createElement("p");
    meta.className = "linea-meta";
    meta.textContent = a.detalle;
    cuerpo.appendChild(nombreEl);
    cuerpo.appendChild(meta);

    const dineroEl = document.createElement("span");
    dineroEl.className = "linea-dinero";
    dineroEl.textContent = dinero(a.precio);

    li.appendChild(figura);
    li.appendChild(cuerpo);
    li.appendChild(dineroEl);
    lineas.appendChild(li);
  });
}

function pintarComensales() {
  comensales.innerHTML = "";
  const porcion = valorPorcion();

  gente.forEach((p, indice) => {
    const li = document.createElement("li");
    li.className = "comensal";

    const avatar = document.createElement("span");
    avatar.className = "avatar";
    avatar.setAttribute("aria-hidden", "true");
    avatar.textContent = p.nombre.charAt(0).toUpperCase();
    const t = tonoDe(p.nombre);
    avatar.style.setProperty("--tono-a", t[0]);
    avatar.style.setProperty("--tono-b", t[1]);

    const cuerpo = document.createElement("div");
    cuerpo.className = "comensal-cuerpo";
    const nombreEl = document.createElement("span");
    nombreEl.className = "comensal-nombre";
    nombreEl.textContent = p.nombre;
    const cuenta = document.createElement("span");
    cuenta.className = "comensal-cuenta";
    cuenta.textContent = p.porciones + (p.porciones === 1 ? " slice" : " slices") + " · " + dinero(p.porciones * porcion);
    cuerpo.appendChild(nombreEl);
    cuerpo.appendChild(cuenta);

    const contador = document.createElement("div");
    contador.className = "contador";

    const menos = document.createElement("button");
    menos.type = "button";
    menos.className = "contador-btn";
    menos.setAttribute("aria-label", "Take one slice away from " + p.nombre);
    const raya = document.createElement("span");
    menos.appendChild(raya);
    menos.addEventListener("click", () => cambiar(indice, -1));

    const cifra = document.createElement("span");
    cifra.className = "contador-cifra";
    cifra.setAttribute("aria-valuenow", String(p.porciones));
    cifra.setAttribute("aria-valuemin", "0");
    cifra.setAttribute("aria-valuemax", String(totalPorciones()));
    cifra.setAttribute("aria-valuetext", p.porciones + " of " + totalPorciones() + " slices");
    cifra.setAttribute("role", "img");
    cifra.setAttribute("aria-label", p.nombre + " has " + p.porciones + " slices");
    cifra.textContent = String(p.porciones);

    const mas = document.createElement("button");
    mas.type = "button";
    mas.className = "contador-btn";
    mas.setAttribute("aria-label", "Give " + p.nombre + " one more slice");
    const raya1 = document.createElement("span");
    const raya2 = document.createElement("span");
    raya2.className = "vertical";
    mas.appendChild(raya1);
    mas.appendChild(raya2);
    mas.addEventListener("click", () => cambiar(indice, 1));

    contador.appendChild(menos);
    contador.appendChild(cifra);
    contador.appendChild(mas);

    const debe = document.createElement("span");
    debe.className = "comensal-dinero";
    debe.textContent = dinero(p.porciones * porcion);

    const quitar = document.createElement("button");
    quitar.type = "button";
    quitar.className = "quitar";
    quitar.textContent = "Remove";
    quitar.setAttribute("aria-label", "Take " + p.nombre + " off the table");
    quitar.addEventListener("click", () => {
      gente = gente.filter(x => x.id !== p.id);
      pintarComensales();
      pintarResumen();
    });

    li.appendChild(avatar);
    li.appendChild(cuerpo);
    li.appendChild(contador);
    li.appendChild(debe);
    li.appendChild(quitar);
    comensales.appendChild(li);
  });

  comensalesVacio.hidden = gente.length > 0;
}

function cambiar(indice, delta) {
  const p = gente[indice];
  if (!p) return;
  p.porciones = Math.max(0, Math.min(totalPorciones(), p.porciones + delta));
  pintarComensales();
  pintarResumen();
}

function pintarResumen() {
  const totalPorc = totalPorciones();
  const hechas = asignadas();
  const pct = totalPorc === 0 ? 0 : Math.min(100, hechas / totalPorc);
  const porcion = valorPorcion();
  const asignado = Math.min(total(), hechas * porcion);
  const resto = Math.max(0, total() - asignado);

  el("barraRelleno").style.transform = "scaleX(" + pct / 100 + ")";
  el("barra").setAttribute("aria-valuemax", String(totalPorc));
  el("barra").setAttribute("aria-valuenow", String(Math.min(totalPorc, hechas)));
  el("barra").setAttribute("aria-valuetext", hechas + " of " + totalPorc + " slices assigned");
  el("barra").dataset.completa = String(hechas >= totalPorc);
  el("barraTitulo").textContent = Math.min(hechas, totalPorc) + " of " + totalPorc + " slices assigned";
  el("barraEstado").textContent = resto === 0 ? "nothing left on the table" : dinero(resto) + " still unassigned";

  el("cTotal").textContent = dinero(total());
  el("cAsignado").textContent = dinero(asignado);
  el("cResto").textContent = dinero(resto);
  el("cPorcion").textContent = dinero(porcion);
}

function textoErrorNombre() {
  const valor = nombre.value.trim();
  if (valor === "") return "Type a name so we know who is at the table.";
  if (valor.length < 2) return "Two characters at least, one is not a name.";
  if (valor.length > 18) return "Eighteen characters at most. You have " + valor.length + ".";
  if (gente.some(p => p.nombre.toLowerCase() === valor.toLowerCase())) return valor + " is already on the list.";
  return "";
}

function pintarNombre() {
  const env = nombre.closest(".campo");
  const ayuda = el("nombre-ayuda");
  const mensaje = el("nombre-error");
  const error = textoErrorNombre();
  const desc = [ayuda.id];

  if (error !== "") {
    env.dataset.estado = "error";
    nombre.setAttribute("aria-invalid", "true");
    desc.push(mensaje.id);
    mensaje.textContent = error;
  } else {
    env.dataset.estado = "neutro";
    nombre.setAttribute("aria-invalid", "false");
    mensaje.textContent = "";
  }
  nombre.setAttribute("aria-describedby", desc.join(" "));
  return error !== "";
}

function anadir() {
  if (pintarNombre()) {
    nombre.focus();
    return;
  }
  const limpio = nombre.value.trim();
  gente.push({ id: "p" + siguiente, nombre: limpio, porciones: 1 });
  siguiente += 1;
  nombre.value = "";
  el("nombre-ayuda").textContent = limpio + " is on the list with one slice. Give them more with the plus key.";
  pintarComensales();
  pintarResumen();
  const ultimo = comensales.querySelector(".comensal:last-child .contador-btn:last-child");
  if (ultimo) ultimo.focus();
}

el("anadir").addEventListener("click", anadir);

nombre.addEventListener("blur", pintarNombre);
nombre.addEventListener("input", () => {
  if (nombre.closest(".campo").dataset.estado === "error") pintarNombre();
});
nombre.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    anadir();
  }
});

form.addEventListener("submit", e => {
  e.preventDefault();
  const totalPorc = totalPorciones();
  const hechas = asignadas();
  const problemas = [];

  if (gente.length === 0) {
    problemas.push("Nobody is on the list, so there is nobody to split the bill between.");
    el("comensales-error").textContent = problemas[0];
  } else if (gente.some(p => p.porciones === 0)) {
    const sin = gente.filter(p => p.porciones === 0).map(p => p.nombre);
    problemas.push(sin.length === 1
      ? sin[0] + " is on the list with no slice. Give them one or take them off the table."
      : sin.length + " people on the list have no slice. Give them one or take them off the table.");
    el("comensales-error").textContent = problemas[problemas.length - 1];
  } else {
    el("comensales-error").textContent = "";
  }

  if (hechas !== totalPorc) {
    problemas.push(hechas < totalPorc
      ? "There are " + (totalPorc - hechas) + " slices nobody has claimed yet."
      : "There are " + (hechas - totalPorc) + " slices too many for " + totalPorc + " slices on the table.");
  }

  if (problemas.length > 0) {
    tituloError.textContent = problemas.length === 1
      ? "One thing stops the split"
      : problemas.length + " things stop the split";
    listaError.innerHTML = "";
    problemas.forEach(t => {
      const li = document.createElement("li");
      li.textContent = t;
      listaError.appendChild(li);
    });
    resumenError.hidden = false;
    if (gente.length === 0) el("nombre").focus();
    else {
      const primero = comensales.querySelector(".contador-btn");
      if (primero) primero.focus();
    }
    return;
  }

  resumenError.hidden = true;
  const porcion = valorPorcion();
  const referencia = "TB-" + String(Math.floor(1000 + Math.random() * 9000));

  el("listoLista").innerHTML = "";
  gente.forEach((p, indice) => {
    const li = document.createElement("li");
    li.className = "listo-fila";
    li.style.animationDelay = indice * 60 + "ms";
    const quien = document.createElement("div");
    const b = document.createElement("b");
    b.textContent = p.nombre;
    const small = document.createElement("small");
    small.textContent = p.porciones + (p.porciones === 1 ? " slice" : " slices");
    quien.appendChild(b);
    quien.appendChild(small);
    const cuanto = document.createElement("span");
    cuanto.textContent = dinero(p.porciones * porcion);
    li.appendChild(quien);
    li.appendChild(cuanto);
    el("listoLista").appendChild(li);
  });

  el("lMesa").textContent = "table 6, " + referencia;
  el("lPorciones").textContent = hechas + " of " + totalPorc;
  el("lTotal").textContent = dinero(total());
  el("lPorcion").textContent = dinero(porcion);
  el("listoTitulo").textContent = dinero(total()) + " split " + (gente.length === 1 ? "one way" : gente.length + " ways");
  el("listoTexto").textContent = "Every slice on the table belongs to somebody, so the bar is full and the bill adds up to the last cent. Reference " + referencia + ".";

  form.hidden = true;
  listo.hidden = false;
  listo.focus();
});

el("otra").addEventListener("click", () => {
  listo.hidden = true;
  form.hidden = false;
  resumenError.hidden = true;
  nombre.value = "";
  nombre.closest(".campo").dataset.estado = "neutro";
  nombre.setAttribute("aria-invalid", "false");
  nombre.setAttribute("aria-describedby", "nombre-ayuda");
  el("nombre-error").textContent = "";
  el("comensales-error").textContent = "";
  el("nombre-ayuda").textContent = "Two to eighteen characters. Adding somebody who is already on the list does nothing.";
  pintarComensales();
  pintarResumen();
  el("anadir").focus();
});

pintarLineas();
pintarComensales();
pintarResumen();
