const form = document.getElementById("form");
const lineasEl = document.getElementById("lineas");
const comensalesEl = document.getElementById("comensales");
const comensalesVacio = document.getElementById("comensalesVacio");
const nombre = document.getElementById("nombre");
const barra = document.getElementById("barra");
const barraRelleno = document.getElementById("barraRelleno");
const resumenError = document.getElementById("resumenError");
const listaError = document.getElementById("resumenLista");
const tituloError = document.getElementById("resumenTitulo");
const listo = document.getElementById("listo");

const PLATOS = [
  { id: "p1", nombre: "Pulpo a la brasa", detalle: "One plate, serves two if nobody objects", precio: 26, raciones: 2 },
  { id: "p2", nombre: "Rabos de toro,Sharing", detalle: "Meant for the middle of the table", precio: 38, raciones: 4 },
  { id: "p3", nombre: "Croquetas de jamon, six", detalle: "Six of them, two each if all is fair", precio: 14, raciones: 6 },
  { id: "p4", nombre: "Tarta de queso", detalle: "For the table, or not", precio: 9, raciones: 4 },
  { id: "p5", nombre: "Botella de ribera del", detalle: "One bottle, as much as you like", precio: 32, raciones: 5 }
];

const TONES = [
  ["#f6c39c", "#c06e4c"],
  ["#d98a94", "#8f4550"],
  ["#b7cf88", "#6c8343"],
  ["#9fb3d8", "#54698f"],
  ["#d9b06a", "#8f6c30"],
  ["#c4a2cf", "#765a86"],
  ["#8fc9b8", "#437f70"]
];

let gente = [
  { id: "g1", nombre: "Marta", platos: { p1: 1, p3: 2 } },
  { id: "g2", nombre: "Idris", platos: { p1: 1, p3: 2 } },
  { id: "g3", nombre: "Salvo", platos: { p2: 2, p5: 1 } }
];

let siguiente = 4;

function el(id) { return document.getElementById(id); }

function dinero(n) { return n.toFixed(2).replace(".", ",") + " EUR"; }

function plato(id) { return PLATOS.filter(p => p.id === id)[0]; }

function total() {
  return PLATOS.reduce((s, p) => s + p.precio, 0);
}

function sharesDe(id) {
  return gente.filter(p => (p.platos[id] || 0) > 0).length;
}

function racionesDe(id) {
  return gente.reduce((s, p) => s + (p.platos[id] || 0), 0);
}

function valorShare(id) {
  const n = racionesDe(id);
  return n === 0 ? 0 : plato(id).precio / n;
}

function sharesTotales() {
  return gente.reduce((s, p) => s + Object.keys(p.platos).reduce((x, k) => x + p.platos[k], 0), 0);
}

function asignado() {
  return gente.reduce((s, p) => s + Object.keys(p.platos).reduce((x, k) => x + p.platos[k] * valorShare(k), 0), 0);
}

function tonoDe(n) {
  let suma = 0;
  for (let k = 0; k < n.length; k++) suma += n.codePointAt(k);
  return TONES[suma % TONES.length];
}

function nodo(etiqueta, clase, texto) {
  const n = document.createElement(etiqueta);
  if (clase) n.className = clase;
  if (texto !== undefined) n.textContent = texto;
  return n;
}

function pintarLineas() {
  lineasEl.innerHTML = "";
  PLATOS.forEach(p => {
    const li = nodo("li", "linea");

    const figura = nodo("span", "linea__figura");
    figura.setAttribute("aria-hidden", "true");

    const datos = nodo("div", "linea__datos");
    datos.appendChild(nodo("p", "linea__nombre", p.nombre));
    datos.appendChild(nodo("p", "linea__meta", p.detalle + " · " + p.raciones + " raciones"));
    const faltan = nodo("p", "linea__faltan", "no claims yet, the whole plate is on the table");
    datos.appendChild(faltan);

    const dineroEl = nodo("span", "linea__dinero", dinero(p.precio));

    li.appendChild(figura);
    li.appendChild(datos);
    li.appendChild(dineroEl);
    lineasEl.appendChild(li);
  });
}

function pintarComensales() {
  comensalesEl.innerHTML = "";
  comensalesVacio.hidden = gente.length > 0;

  gente.forEach(p => {
    const shares = Object.keys(p.platos).reduce((s, k) => s + p.platos[k], 0);
    const li = nodo("li", "comensal");
    li.dataset.id = p.id;
    li.dataset.sin = shares === 0 ? "1" : "0";

    const avatar = nodo("span", "avatar", p.nombre.charAt(0).toUpperCase());
    avatar.setAttribute("aria-hidden", "true");
    const t = tonoDe(p.nombre);
    avatar.style.setProperty("--tono-a", t[0]);
    avatar.style.setProperty("--tono-b", t[1]);

    const cuerpo = nodo("div", "comensal__cuerpo");

    const fila = nodo("div", "comensal__fila");
    fila.appendChild(nodo("span", "comensal__nombre", p.nombre));
    fila.appendChild(nodo("span", "comensal__cuenta",
      shares + (shares === 1 ? " share" : " shares") + " · " + dinero(pagoDe(p))));
    if (shares === 0) fila.appendChild(nodo("span", "comensal__aviso", "Nothing claimed yet, this person would pay nothing."));
    cuerpo.appendChild(fila);

    const pasos = nodo("div", "pasos");
    PLATOS.forEach(pl => {
      const veces = p.platos[pl.id] || 0;
      const filaPaso = nodo("div", "paso");
      filaPaso.dataset.vez = String(veces);
      filaPaso.appendChild(nodo("span", "paso__plato", pl.nombre));

      const n = racionesDe(pl.id);
      filaPaso.appendChild(nodo("span", "paso__cuenta",
        n === 0 ? "unclaimed" : dinero(valorShare(pl.id)) + " a share, " + n + " of " + pl.raciones + " raciones"));

      const control = nodo("div", "stepper");
      const menos = nodo("button", "stepper__btn", "−");
      menos.type = "button";
      menos.disabled = veces === 0;
      menos.setAttribute("aria-label", "Take one share of " + pl.nombre + " away from " + p.nombre);
      menos.addEventListener("click", () => cambiar(p.id, pl.id, -1));

      const valor = nodo("span", "stepper__valor", String(veces));
      valor.setAttribute("role", "status");
      valor.setAttribute("aria-label", p.nombre + ", " + veces + " shares of " + pl.nombre);

      const mas = nodo("button", "stepper__btn", "+");
      mas.type = "button";
      mas.disabled = veces >= pl.raciones;
      mas.setAttribute("aria-label", "Give " + p.nombre + " one more share of " + pl.nombre);
      mas.addEventListener("click", () => cambiar(p.id, pl.id, 1));

      control.appendChild(menos);
      control.appendChild(valor);
      control.appendChild(mas);
      filaPaso.appendChild(control);
      pasos.appendChild(filaPaso);
    });
    cuerpo.appendChild(pasos);

    const quitar = nodo("button", "comensal__quitar", "Take off the table");
    quitar.type = "button";
    quitar.setAttribute("aria-label", "Take " + p.nombre + " off the table and drop their shares");
    quitar.addEventListener("click", () => quitarComensal(p.id));
    cuerpo.appendChild(quitar);

    li.appendChild(avatar);
    li.appendChild(cuerpo);
    comensalesEl.appendChild(li);
  });
}

function pagoDe(p) {
  return Object.keys(p.platos).reduce((s, k) => s + p.platos[k] * valorShare(k), 0);
}

function cambiar(idGuest, idPlato, delta) {
  const g = gente.filter(p => p.id === idGuest)[0];
  const pl = plato(idPlato);
  const actual = g.platos[idPlato] || 0;
  if (delta > 0 && actual >= pl.raciones) return;
  if (delta < 0 && actual === 0) return;
  if (delta > 0) g.platos[idPlato] = actual + 1;
  else if (actual === 1) delete g.platos[idPlato];
  else g.platos[idPlato] = actual - 1;
  el("comensales-err").textContent = "";
  pintarComensales();
  refrescar();
}

function quitarComensal(idGuest) {
  gente = gente.filter(p => p.id !== idGuest);
  pintarComensales();
  refrescar();
}

function refrescar() {
  const t = total();
  const shares = sharesTotales();
  const asignadoTotal = asignado();
  const resto = t - asignadoTotal;
  const pct = t === 0 ? 0 : Math.round((asignadoTotal / t) * 100);

  barraRelleno.style.transform = "scaleX(" + (pct / 100) + ")";
  barra.setAttribute("aria-valuemax", String(t.toFixed(2)));
  barra.setAttribute("aria-valuenow", String(asignadoTotal.toFixed(2)));
  barra.setAttribute("aria-valuetext", pct + " per cent of the bill claimed, " + shares + " shares taken");
  el("barraTitulo").textContent = shares + (shares === 1 ? " share" : " shares") + " assigned across " + gente.length + (gente.length === 1 ? " person" : " people");
  el("barraEstado").textContent = resto <= 0.005 ? "nothing left on the table" : dinero(resto) + " still on the table";

  el("cTotal").textContent = dinero(t);
  el("cAsignado").textContent = dinero(asignadoTotal);
  el("cResto").textContent = resto <= 0.005 ? "0,00 EUR" : dinero(resto);

  const conGente = PLATOS.filter(p => sharesDe(p.id) > 0);
  el("cPorciones").textContent = conGente.length === 0
    ? "varies"
    : conGente.map(p => p.nombre.split(",")[0] + " " + dinero(valorShare(p.id))).join(" · ");

  PLATOS.forEach(p => {
    const n = racionesDe(p.id);
    const textos = Array.from(lineasEl.querySelectorAll(".linea"));
    const pos = PLATOS.indexOf(p);
    if (textos[pos] === undefined) return;
    const falta = textos[pos].querySelector(".linea__faltan");
    if (n === 0) {
      falta.textContent = "no claims yet, the whole plate is on the table";
    } else if (n < p.raciones) {
      falta.textContent = n + " of " + p.raciones + " raciones claimed, " + dinero(valorShare(p.id)) + " a share";
    } else {
      falta.textContent = "all " + p.raciones + " raciones claimed, " + dinero(valorShare(p.id)) + " a share";
    }
  });
}

function problemas() {
  const salida = [];
  if (gente.length === 0) {
    salida.push("Table: nobody is on the list, so there is nobody to send the bill to.");
    return salida;
  }
  const sinNada = gente.filter(p => Object.keys(p.platos).length === 0);
  if (sinNada.length > 0) {
    salida.push("Table: " + sinNada.map(p => p.nombre).join(", ") + " " +
      (sinNada.length === 1 ? "has" : "have") + " no shares. Either claim something or take them " +
      "off the table.");
  }
  if (resto() > 0.005) {
    salida.push("Dish claims: " + dinero(resto()) + " is still on the table. Claim the rest or add it as a shared plate on the last person.");
  }
  return salida;
}

function resto() { return total() - asignado(); }

function mostrarResumen(fallos) {
  tituloError.textContent = fallos.length === 1
    ? "One thing is stopping the split"
    : fallos.length + " things are stopping the split";
  listaError.innerHTML = "";
  fallos.forEach(t => {
    const li = document.createElement("li");
    li.textContent = t;
    listaError.appendChild(li);
  });
  resumenError.hidden = false;
}

function pintarNombre() {
  const v = nombre.value.trim();
  const env = nombre.closest(".campo");
  const err = el("nombre-err");
  const ayuda = el("nombre-ayuda");
  const desc = [ayuda.id];
  let malo = false;

  if (v === "") {
    env.dataset.estado = "neutro";
    err.textContent = "";
    ayuda.textContent = "Two to eighteen characters. Adding somebody already on the list does nothing, the table says so.";
  } else if (v.length < 2 || v.length > 18) {
    malo = true;
    env.dataset.estado = "error";
    desc.push(err.id);
    err.textContent = "Between two and eighteen characters, letters, spaces, apostrophes and hyphens.";
    ayuda.textContent = "That is " + v.length + " characters. The list accepts between two and eighteen.";
  } else if (gente.some(p => p.nombre.toLowerCase() === v.toLowerCase())) {
    env.dataset.estado = "error";
    ayuda.textContent = v + " is already at this table. Nothing was added.";
  } else {
    env.dataset.estado = "ok";
    err.textContent = "";
    ayuda.textContent = v + " is free, press the button to put them on the list.";
  }

  if (malo) nombre.setAttribute("aria-invalid", "true");
  else nombre.setAttribute("aria-invalid", "false");
  nombre.setAttribute("aria-describedby", desc.join(" "));
}

nombre.addEventListener("input", pintarNombre);
nombre.addEventListener("blur", pintarNombre);
nombre.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    anadir();
  }
});

function anadir() {
  pintarNombre();
  const v = nombre.value.trim();
  if (v.length < 2 || v.length > 18) {
    el("nombre-err").textContent = "Between two and eighteen characters, and at least one letter.";
    el("comensales-err").textContent = "";
    return;
  }
  if (gente.some(p => p.nombre.toLowerCase() === v.toLowerCase())) {
    el("nombre-err").textContent = v + " is already at this table, nothing was added.";
    return;
  }
  gente.push({ id: "g" + siguiente, nombre: v, platos: {} });
  siguiente += 1;
  nombre.value = "";
  pintarNombre();
  el("comensales-err").textContent = "";
  pintarComensales();
  refrescar();
  const nuevo = comensalesEl.querySelector('[data-id="g' + (siguiente - 1) + '"] .stepper__btn');
  if (nuevo) nuevo.focus();
}

el("anadir").addEventListener("click", anadir);

form.addEventListener("submit", e => {
  e.preventDefault();
  const fallos = problemas();

  if (fallos.length > 0) {
    mostrarResumen(fallos);
    if (gente.length === 0) {
      nombre.focus();
      return;
    }
    const sinNada = comensalesEl.querySelector('[data-sin="1"] .stepper__btn');
    if (sinNada) sinNada.focus();
    else comensalesEl.querySelector(".stepper__btn").focus();
    return;
  }

  resumenError.hidden = true;
  const t = total();
  const shares = sharesTotales();

  el("listoTitulo").textContent = "Nobody argues about the bill any more";
  el("listoTexto").textContent = "Seven shares across " + gente.length + " people, " +
    dinero(t) + " on the table, each dish divided between the people who claimed it.";

  const lista = el("listoLista");
  lista.innerHTML = "";
  gente.slice().sort((a, b) => pagoDe(b) - pagoDe(a)).forEach((p, i) => {
    const li = document.createElement("li");
    li.style.animationDelay = i * 0.06 + "s";
    const nombreEl = document.createElement("span");
    const partes = Object.keys(p.platos).map(k => p.platos[k] + " × " + plato(k).nombre.split(",")[0]);
    nombreEl.textContent = p.nombre + " · " + (partes.length === 0 ? "nothing claimed" : partes.join(", "));
    const importe = document.createElement("b");
    importe.textContent = dinero(pagoDe(p));
    li.appendChild(nombreEl);
    li.appendChild(importe);
    lista.appendChild(li);
  });

  el("lPorciones").textContent = shares + " of " + shares;
  el("lTotal").textContent = dinero(t);
  el("lModo").textContent = gente.length + (gente.length === 1 ? " person" : " people") + ", dish by dish";

  form.hidden = true;
  listo.hidden = false;
  listo.focus();
});

el("otra").addEventListener("click", () => {
  gente = [
    { id: "g1", nombre: "Marta", platos: { p1: 1, p3: 2 } },
    { id: "g2", nombre: "Idris", platos: { p1: 1, p3: 2 } },
    { id: "g3", nombre: "Salvo", platos: { p2: 2, p5: 1 } }
  ];
  siguiente = 4;
  nombre.value = "";
  pintarNombre();
  resumenError.hidden = true;
  el("comensales-err").textContent = "";
  form.hidden = false;
  listo.hidden = true;
  pintarLineas();
  pintarComensales();
  refrescar();
  el("nombre").focus();
});

pintarLineas();
pintarComensales();
refrescar();
