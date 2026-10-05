const form = document.getElementById("form");
const paneles = Array.from(document.querySelectorAll(".hoja"));
const pasosEl = Array.from(document.querySelectorAll(".paso"));
const cajaLista = document.getElementById("cajaLista");
const cajaVacio = document.getElementById("cajaVacio");
const btnAtras = document.getElementById("atras");
const btnContinuar = document.getElementById("continuar");
const textoContinuar = document.getElementById("continuarTexto");
const resumenError = document.getElementById("resumenError");
const listaError = document.getElementById("resumenLista");
const tituloError = document.getElementById("resumenTitulo");
const listo = document.getElementById("listo");

const CONSOLAS = [
  { id: "c1", tipo: "consola", paso: 1, nombre: "Ridge One, 1 TB", detalle: "One terabyte, no disc drive, two pads in the box", precio: 389, lote: "R1" },
  { id: "c2", tipo: "consola", paso: 1, nombre: "Ridge One Pro, 2 TB", detalle: "Two terabytes and the disc drive back again", precio: 479, lote: "R1P" },
  { id: "c3", tipo: "consola", paso: 1, nombre: "Ridge Deck, 512 GB", detalle: "The handheld one, seven inch screen, 39 grams heavier", precio: 329, lote: "RD" }
];

const JUEGOS = [
  { id: "j1", tipo: "juego", paso: 2, nombre: "Ninefold Drift", detalle: "Disc, region free, eighteen hours", precio: 54, lote: "ND" },
  { id: "j2", tipo: "juego", paso: 2, nombre: "Saltmarsh", detalle: "Disc, region free, eleven hours", precio: 49, lote: "SM" },
  { id: "j3", tipo: "juego", paso: 2, nombre: "Brass and Tallow", detalle: "Disc, region free, twenty two hours", precio: 59, lote: "BT" },
  { id: "j4", tipo: "juego", paso: 2, nombre: "Paper Lanterns", detalle: "Disc, region free, six hours", precio: 34, lote: "PL" },
  { id: "j5", tipo: "juego", paso: 2, nombre: "Hollow Ordnance", detalle: "Disc, region free, fourteen hours", precio: 62, lote: "HO" }
];

const EXTRAS = [
  { id: "e1", tipo: "extra", paso: 3, nombre: "Second wireless pad", detalle: "Same buttons as the one in the box, USB C", precio: 44, lote: "X2" },
  { id: "e2", tipo: "extra", paso: 3, nombre: "Headset, wired, 40 mm", detalle: "No battery, no pairing, no firmware", precio: 39, lote: "HS" },
  { id: "e3", tipo: "extra", paso: 3, nombre: "Dock with two ports", detalle: "Charges the console and the Deck at once", precio: 79, lote: "DK" },
  { id: "e4", tipo: "extra", paso: 3, nombre: "Ten hour power bank", detalle: "Enough for two long sessions, 14,4 volts out", precio: 55, lote: "PB" }
];

const TODAS = CONSOLAS.concat(JUEGOS, EXTRAS);
const MAX_JUEGOS = 3;
const PORTES = { estandar: 9, sabado: 14, tarde: 0 };
const UMBRAL_GRATIS = 300;

const DIAS = { estandar: "Weekday, 9 to 18", sabado: "Saturday, 10 to 14", tarde: "Weekday evening, 18 to 22" };

const CAMPOS = [
  {
    id: "jugador",
    etiqueta: "Player handle",
    vacio: "We need a handle to register the console to.",
    error: "Three to eighteen characters, letters, digits, underscore and one dot.",
    prueba: v => /^[A-Za-z0-9][A-Za-z0-9._]{2,17}$/.test(v)
  },
  {
    id: "correo",
    etiqueta: "Delivery mail",
    vacio: "The tracking number has nowhere to go without an address.",
    error: "It does not look like name@domain.tld. Check for a missing dot or a stray space.",
    prueba: v => /^[^\s@,;]+@[^\s@,;]+\.[A-Za-z]{2,}$/.test(v)
  },
  {
    id: "dia",
    etiqueta: "Delivery day",
    vacio: "Pick a delivery day.",
    error: "That delivery slot is not on the van rota.",
    prueba: v => Object.hasOwn(DIAS, v)
  }
];

const consolaElegida = { id: "" };
const juegosElegidos = [];
const extrasElegidos = [];
let paso = 1;
let pasoPrevio = 0;
let volando = false;

function el(id) { return document.getElementById(id); }

function dinero(n) { return n.toFixed(2).replace(".", ",") + " EUR"; }

function pieza(id) { return TODAS.find(p => p.id === id); }

function elegidas() {
  const fuera = [];
  if (consolaElegida.id !== "") fuera.push(pieza(consolaElegida.id));
  juegosElegidos.forEach(id => fuera.push(pieza(id)));
  extrasElegidos.forEach(id => fuera.push(pieza(id)));
  return fuera;
}

function estaElegida(id) {
  return consolaElegida.id === id || juegosElegidos.includes(id) || extrasElegidos.includes(id);
}

function posiciones() {
  const mapa = {};
  document.querySelectorAll("[data-flip]").forEach(n => {
    if (n.closest("[hidden]")) return;
    const caja = n.getBoundingClientRect();
    if (caja.width === 0) return;
    mapa[n.dataset.flip] = { x: caja.left, y: caja.top };
  });
  return mapa;
}

function voltear(antes) {
  if (volando) return;
  if (!antes) return;
  const despues = posiciones();
  let hayMovimiento = false;

  document.querySelectorAll("[data-flip]").forEach(n => {
    const a = antes[n.dataset.flip];
    const b = despues[n.dataset.flip];
    if (!a || !b) return;
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    if (dx === 0 && dy === 0) return;
    hayMovimiento = true;
    n.dataset.vuelo = "1";
    n.style.transition = "none";
    n.style.transform = "translate3d(" + dx + "px," + dy + "px,0) scale(1.06)";
  });

  if (!hayMovimiento) return;

  volando = true;
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      document.querySelectorAll("[data-flip]").forEach(n => {
        if (n.dataset.vuelo !== "1") return;
        n.style.transition = "transform 0.58s cubic-bezier(0.2, 0.85, 0.2, 1)";
        n.style.transform = "translate3d(0,0,0) scale(1)";
      });
    });
  });

  window.setTimeout(() => {
    document.querySelectorAll("[data-flip]").forEach(n => {
      n.style.transition = "";
      n.style.transform = "";
      delete n.dataset.vuelo;
    });
    volando = false;
  }, 640);
}

function nodoPieza(p, enCaja) {
  const boton = document.createElement(enCaja ? "div" : "button");
  boton.className = enCaja ? "pieza pieza--caja" : "pieza";
  boton.dataset.flip = p.id;
  boton.dataset.tipo = p.tipo;
  boton.dataset.pieza = p.id;

  const marca = document.createElement("span");
  marca.className = "pieza__marca";
  marca.textContent = p.lote;
  boton.appendChild(marca);

  const lote = document.createElement("span");
  lote.className = "pieza__lote";
  lote.textContent = enCaja ? p.tipo : "lote " + p.lote;
  boton.appendChild(lote);

  const nombre = document.createElement("span");
  nombre.className = "pieza__nombre";
  nombre.textContent = p.nombre;
  boton.appendChild(nombre);

  const detalle = document.createElement("span");
  detalle.className = "pieza__detalle";
  detalle.textContent = p.detalle;
  boton.appendChild(detalle);

  const precio = document.createElement("span");
  precio.className = "pieza__precio";
  precio.textContent = dinero(p.precio);
  boton.appendChild(precio);

  if (enCaja) {
    const quitar = document.createElement("button");
    quitar.type = "button";
    quitar.className = "pieza__quitar";
    quitar.textContent = "×";
    quitar.setAttribute("aria-label", "Take " + p.nombre + " out of the crate");
    quitar.addEventListener("click", e => {
      e.stopPropagation();
      quitarPieza(p.id);
    });
    boton.appendChild(quitar);
  } else {
    boton.type = "button";
    boton.setAttribute("aria-label", p.nombre + ", " + dinero(p.precio) + ", add to the crate");
    boton.addEventListener("click", () => alternarPieza(p.id));
  }

  return boton;
}

function rechazo(p, texto) {
  el("pista2").textContent = texto;
  el("pista2").dataset.aviso = "1";
  const nodo = document.querySelector('.pieza[data-pieza="' + p.id + '"]');
  if (nodo) {
    nodo.dataset.tope = "1";
    window.setTimeout(() => { delete nodo.dataset.tope; }, 700);
  }
  window.setTimeout(() => {
    el("pista2").dataset.aviso = "0";
    pintarTodo();
  }, 1400);
}

function alternarPieza(id) {
  const p = pieza(id);
  if (p.tipo === "consola") {
    const antes = posiciones();
    consolaElegida.id = consolaElegida.id === id ? "" : id;
    pintarTodo(antes);
    return;
  }
  if (p.tipo === "juego") {
    const antes = posiciones();
    const donde = juegosElegidos.indexOf(id);
    if (donde !== -1) {
      juegosElegidos.splice(donde, 1);
    } else if (juegosElegidos.length >= MAX_JUEGOS) {
      rechazo(p, "The crate already holds three games. Take one out before adding another.");
      return;
    } else {
      juegosElegidos.push(id);
    }
    pintarTodo(antes);
    return;
  }
  const antes = posiciones();
  const donde = extrasElegidos.indexOf(id);
  if (donde !== -1) extrasElegidos.splice(donde, 1);
  else extrasElegidos.push(id);
  pintarTodo(antes);
}

function quitarPieza(id) {
  const antes = posiciones();
  const p = pieza(id);
  if (p.tipo === "consola") consolaElegida.id = "";
  else if (p.tipo === "juego") juegosElegidos.splice(juegosElegidos.indexOf(id), 1);
  else extrasElegidos.splice(extrasElegidos.indexOf(id), 1);
  pintarTodo(antes);
}

function totales() {
  const dentro = elegidas();
  const bruto = dentro.reduce((s, p) => s + p.precio, 0);
  const dia = diaActual();
  let envio = 0;
  if (dentro.length !== 0) envio = dia === "estandar" && bruto >= UMBRAL_GRATIS ? 0 : PORTES[dia];
  return { dentro, bruto, dia, envio, final: bruto + envio };
}

function diaActual() {
  const marcado = document.querySelector('input[name="dia"]:checked');
  return marcado ? marcado.value : "estandar";
}

function pintarTodo(antes) {
  [1, 2, 3].forEach(n => {
    const rejilla = el("rejilla" + n);
    rejilla.innerHTML = "";
    const familia = n === 1 ? CONSOLAS : n === 2 ? JUEGOS : EXTRAS;
    familia.forEach(p => {
      if (estaElegida(p.id)) return;
      rejilla.appendChild(nodoPieza(p, false));
    });
  });

  cajaLista.innerHTML = "";
  const dentro = elegidas();
  dentro.forEach(p => { cajaLista.appendChild(nodoPieza(p, true)); });

  if (dentro.length === 0) {
    cajaVacio.hidden = false;
  } else {
    cajaVacio.hidden = true;
  }

  const t = totales();
  el("cajaConteo").textContent = dentro.length === 0
    ? "empty"
    : dentro.length + (dentro.length === 1 ? " piece" : " pieces");
  el("cSubtotal").textContent = dinero(t.bruto);
  el("cEnvio").textContent = dentro.length === 0
    ? "no delivery"
    : t.envio === 0 ? "free" : dinero(t.envio);
  el("cTotal").textContent = dinero(t.final);
  el("cajaPie").textContent = dentro.length === 0
    ? "Delivery is worked out on what is in the crate right now."
    : t.envio === 0
      ? "Free delivery, the crate is over " + UMBRAL_GRATIS + "."
      : "Add " + dinero(UMBRAL_GRATIS - t.bruto) + " more and delivery comes free.";

  el("pista2").textContent = juegosElegidos.length === 0
    ? "No games yet. The crate can hold three, and a fourth comes back off the shelf."
    : juegosElegidos.length + " of " + MAX_JUEGOS + " games in the crate.";

  voltear(antes);
}

function mostrar(n) {
  const cambioDePaso = n !== pasoPrevio;
  const antes = cambioDePaso ? posiciones() : null;
  paso = n;
  paneles.forEach(p => {
    const activo = Number(p.dataset.panel) === n;
    p.hidden = !activo;
  });
  pasosEl.forEach(m => {
    const num = Number(m.dataset.paso);
    let estado = "pendiente";
    if (num === n) estado = "activo";
    else if (num < n) estado = "hecho";
    m.dataset.estado = estado;
  });
  btnAtras.hidden = n === 1;
  textoContinuar.textContent = n === 1 ? "To the games" : n === 2 ? "To the extras" : "Place the order";
  if (cambioDePaso) {
    pintarTodo(antes);
    pasoPrevio = n;
  }
  resumenError.hidden = true;
}

function valorCampo(id) {
  if (id === "dia") return diaActual();
  return el(id).value.trim();
}

function pintarCampo(f) {
  const env = f.id === "dia" ? document.getElementById("conjunto-dia") : el(f.id).closest(".campo");
  const ayuda = el(f.id + "-ayuda");
  const err = el(f.id + "-err");
  const valor = valorCampo(f.id);
  const malo = !f.prueba(valor);
  const desc = [ayuda.id];
  const conId = f.id === "dia" ? el("dia-lab") : el(f.id);

  if (malo) {
    env.dataset.estado = "error";
    conId.setAttribute("aria-invalid", "true");
    desc.push(err.id);
    err.textContent = valor === "" ? f.vacio : f.error;
  } else {
    env.dataset.estado = valor === "" ? "neutro" : "ok";
    conId.setAttribute("aria-invalid", "false");
    err.textContent = "";
  }

  env.setAttribute("aria-describedby", desc.join(" "));

  return malo;
}

function problemas() {
  const salida = [];
  if (consolaElegida.id === "") {
    salida.push("Console: nothing is on the shelf yet, a crate cannot ship without a box.");
  }
  if (juegosElegidos.length === 0) {
    salida.push("Games: at least one title, otherwise the console arrives with nothing on it.");
  }
  CAMPOS.forEach(f => {
    if (!f.prueba(valorCampo(f.id))) {
      salida.push(f.etiqueta + ": " + (valorCampo(f.id) === "" ? f.vacio : f.error));
    }
  });
  return salida;
}

function mostrarResumen(fallos) {
  tituloError.textContent = fallos.length === 1
    ? "One thing is stopping the order"
    : fallos.length + " things are stopping the order";
  listaError.innerHTML = "";
  fallos.forEach(t => {
    const li = document.createElement("li");
    li.textContent = t;
    listaError.appendChild(li);
  });
  resumenError.hidden = false;
}

CAMPOS.forEach(f => {
  if (f.id === "dia") {
    document.querySelectorAll('input[name="dia"]').forEach(r => {
      r.addEventListener("change", () => {
        if (document.getElementById("conjunto-dia").dataset.estado === "error") pintarCampo(f);
        pintarTodo();
      });
    });
    return;
  }
  const nodo = el(f.id);
  nodo.addEventListener("blur", () => pintarCampo(f));
  nodo.addEventListener("input", () => {
    if (nodo.closest(".campo").dataset.estado === "error") pintarCampo(f);
  });
});

btnAtras.addEventListener("click", () => {
  if (paso > 1) {
    mostrar(paso - 1);
    const foco = paneles[paso - 2].querySelector(".pieza");
    if (foco) foco.focus();
  }
});

btnContinuar.addEventListener("click", e => {
  e.preventDefault();
  resumenError.hidden = true;

  if (paso === 1) {
    if (consolaElegida.id === "") {
      mostrarResumen(["Console: nothing is on the shelf yet, a crate cannot ship without a box."]);
      const foco = el("rejilla1").querySelector(".pieza");
      if (foco) foco.focus();
      return;
    }
    mostrar(2);
    const foco = el("rejilla2").querySelector(".pieza");
    if (foco) foco.focus();
    return;
  }

  if (paso === 2) {
    if (juegosElegidos.length === 0) {
      mostrarResumen(["Games: at least one title, otherwise the console arrives with nothing on it."]);
      const foco = el("rejilla2").querySelector(".pieza");
      if (foco) foco.focus();
      return;
    }
    mostrar(3);
    el("jugador").focus();
    return;
  }

  CAMPOS.forEach(f => pintarCampo(f));
  const fallos = problemas();
  if (fallos.length > 0) {
    mostrarResumen(fallos);
    if (consolaElegida.id === "") return;
    if (juegosElegidos.length === 0) return;
    if (!CAMPOS[0].prueba(valorCampo("jugador"))) { el("jugador").focus(); return; }
    el("correo").focus();
    return;
  }

  completar();
});

function completar() {
  const t = totales();
  el("lRef").textContent = "RD-" + String(Math.floor(100000 + Math.random() * 900000));
  el("lJugador").textContent = el("jugador").value.trim();
  el("lDia").textContent = DIAS[t.dia];
  el("lTotal").textContent = dinero(t.final);
  el("listoTitulo").textContent = "All yours, " + el("jugador").value.trim();
  el("listoTexto").textContent = t.dentro.length + (t.dentro.length === 1 ? " piece" : " pieces") +
    " for " + dinero(t.final) + ", arriving " + DIAS[t.dia].toLowerCase() +
    ". A note with the tracking goes to " + el("correo").value.trim() + ".";

  const piezas = el("lPiezas");
  piezas.innerHTML = "";
  t.dentro.forEach(p => {
    const li = document.createElement("li");
    const b = document.createElement("b");
    b.textContent = p.nombre;
    const s = document.createElement("span");
    s.textContent = dinero(p.precio);
    li.appendChild(b);
    li.appendChild(s);
    piezas.appendChild(li);
  });

  form.hidden = true;
  document.querySelector(".pasos").hidden = true;
  document.querySelector(".barra").hidden = true;
  listo.hidden = false;
  listo.focus();
}

el("otra").addEventListener("click", () => {
  form.reset();
  consolaElegida.id = "";
  juegosElegidos.length = 0;
  extrasElegidos.length = 0;
  pasoPrevio = 0;
  CAMPOS.forEach(f => {
    const env = f.id === "dia" ? el("conjunto-dia") : el(f.id).closest(".campo");
    env.dataset.estado = "neutro";
    el(f.id + "-err").textContent = "";
    const conId = f.id === "dia" ? el("dia-lab") : el(f.id);
    conId.setAttribute("aria-invalid", "false");
    if (f.id === "dia") el("conjunto-dia").setAttribute("aria-describedby", f.id + "-ayuda");
    else conId.setAttribute("aria-describedby", f.id + "-ayuda");
  });
  resumenError.hidden = true;
  listo.hidden = true;
  form.hidden = false;
  document.querySelector(".pasos").hidden = false;
  document.querySelector(".barra").hidden = false;
  mostrar(1);
  pintarTodo();
  const foco = el("rejilla1").querySelector(".pieza");
  if (foco) foco.focus();
});

form.addEventListener("submit", e => e.preventDefault());

mostrar(1);
pintarTodo();
