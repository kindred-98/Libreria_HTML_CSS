const form = document.getElementById("form");
const banquillo = document.getElementById("banquillo");
const listaJugadores = document.getElementById("listaJugadores");
const banquilloVacio = document.getElementById("banquilloVacio");
const reloj = document.getElementById("reloj");
const resguardo = document.getElementById("resguardo");

const REGIONES = ["eu-west", "eu-north", "us-east", "us-west", "ap-south"];
const SEMILLAS = ["liga", "abierta", "invitacion", "reserva"];
const ROLES = ["entry", "support", "awp", "igl", "anchor"];
const ORDEN_ROLES = ROLES;

const JUGADORES = [
  { id: "j1", tag: "Kestrel", rol: "igl", puntos: 94, pais: "SE" },
  { id: "j2", tag: "Marrow", rol: "entry", puntos: 88, pais: "IE" },
  { id: "j3", tag: "Ondine", rol: "awp", puntos: 91, pais: "FR" },
  { id: "j4", tag: "Pique", rol: "support", puntos: 79, pais: "GB" },
  { id: "j5", tag: "Ravel", rol: "anchor", puntos: 85, pais: "DE" },
  { id: "j6", tag: "Sable", rol: "entry", puntos: 83, pais: "PL" },
  { id: "j7", tag: "Tundra", rol: "support", puntos: 77, pais: "NO" },
  { id: "j8", tag: "Umbral", rol: "awp", puntos: 89, pais: "ES" },
  { id: "j9", tag: "Vellum", rol: "anchor", puntos: 81, pais: "NL" },
  { id: "j10", tag: "Wren", rol: "igl", puntos: 86, pais: "FI" },
  { id: "j11", tag: "Xanthe", rol: "support", puntos: 74, pais: "PT" },
  { id: "j12", tag: "Yarrow", rol: "entry", puntos: 82, pais: "DK" }
];

const CAMPOS = [
  {
    id: "tag",
    etiqueta: "Clan tag",
    vacio: "The bracket needs a short tag, three or four characters.",
    error: "Three or four letters and numbers only, capitals. No spaces and no symbols.",
    prueba: v => /^[A-Z0-9]{3,4}$/.test(v)
  },
  {
    id: "equipo",
    etiqueta: "Team name",
    vacio: "Give the team a name so the draw can print it.",
    error: "Between 4 and 26 characters.",
    prueba: v => v.length >= 4 && v.length <= 26
  },
  {
    id: "region",
    etiqueta: "Region",
    vacio: "Pick the region you play from.",
    error: "That region is not in the circuit.",
    prueba: v => REGIONES.includes(v)
  },
  {
    id: "semilla",
    etiqueta: "Seeding",
    vacio: "Say how you qualified.",
    error: "That seeding route is not one we accept.",
    prueba: v => SEMILLAS.includes(v)
  },
  {
    id: "cerrado",
    etiqueta: "Manager confirmation",
    vacio: "The manager has to confirm before the roster can be locked.",
    error: "That value is not valid.",
    prueba: () => document.getElementById("cerrado").checked
  }
];

const NOMBRES_ROL = { entry: "entry", support: "support", awp: "awper", igl: "caller", anchor: "anchor" };

let paso = 1;
let orden = "rol";
let seleccionados = ["j1", "j3", "j2", "j5", "j4"];
let capitan = "j1";
let relojRestante = 2 * 3600;

function el(id) { return document.getElementById(id); }

function jugador(id) { return JUGADORES.find(j => j.id === id); }

function textoRol(rol) { return NOMBRES_ROL[rol] || rol; }

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
  const valor = f.id === "cerrado" ? "" : control.value.trim();
  const malo = !f.prueba(valor);
  const desc = [ayuda.id];

  if (malo) {
    env.dataset.estado = "error";
    control.setAttribute("aria-invalid", "true");
    desc.push(mensaje.id);
    let textoError = f.error;
    if (f.id === "cerrado" || valor === "") textoError = f.vacio;
    mensaje.textContent = textoError;
  } else {
    env.dataset.estado = "ok";
    control.setAttribute("aria-invalid", "false");
    mensaje.textContent = "";
  }
  control.setAttribute("aria-describedby", desc.join(" "));
  return malo;
}

function problemasPaso1() {
  return CAMPOS.slice(0, 4).filter(f => !f.prueba(el(f.id).value.trim()));
}

function problemaBanquillo() {
  if (seleccionados.length !== 5) {
    return "Call up exactly five players. You have " + seleccionados.length + " on the bench.";
  }
  if (seleccionados.includes(capitan)) {
    return "The captain has to be one of the five on the bench.";
  }
  const repetidos = seleccionados.map(id => jugador(id).rol).filter((r, i, a) => a.indexOf(r) !== i);
  if (repetidos.length > 0) {
    return "Two players share the " + textoRol(repetidos[0]) + " role. Every role can only be filled once.";
  }
  return "";
}

function pintarPaso1() {
  let primero = null;
  CAMPOS.slice(0, 4).forEach(f => {
    if (pintar(f) && !primero) primero = el(f.id);
  });
  return primero;
}

function actualizarIndicadores() {
  document.querySelectorAll(".paso-ind").forEach(li => {
    const n = Number(li.dataset.paso);
    let estado = "pendiente";
    if (n === paso) estado = "actual";
    else if (n < paso) estado = "hecho";
    li.dataset.estado = estado;
  });
}

function mostrar(n) {
  paso = n;
  [1, 2, 3].forEach(k => { el("tramo" + k).hidden = k !== n; });
  actualizarIndicadores();
  if (n === 2) {
    pintarDisponibles();
    pintarBanquillo(true);
  }
  if (n === 3) pintarRevision();
  const foco = el("tramo" + n).querySelector("input, select, button");
  if (foco) foco.focus();
}

function posiciones(mapa) {
  const salida = {};
  banquillo.querySelectorAll("li").forEach(li => {
    const caja = li.getBoundingClientRect();
    salida[li.dataset.id] = { x: caja.left, y: caja.top };
  });
  return mapa || salida;
}

function voltear(antes, nuevo) {
  if (!antes) return;
  const despues = posiciones();
  banquillo.querySelectorAll("li").forEach(li => {
    const a = antes[li.dataset.id];
    const b = despues[li.dataset.id];
    if (!a || !b) return;
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    if (dx === 0 && dy === 0) return;
    li.style.transition = "none";
    li.style.transform = "translate3d(" + dx + "px," + dy + "px,0)";
    window.requestAnimationFrame(() => {
      li.style.transition = "transform 0.52s cubic-bezier(0.2, 0.8, 0.2, 1)";
      li.style.transform = "translate3d(0,0,0)";
    });
  });
}

function ordenar() {
  if (orden === "rol") {
    return seleccionados.slice().sort((a, b) => {
      const ja = jugador(a);
      const jb = jugador(b);
      const ra = ORDEN_ROLES.indexOf(ja.rol);
      const rb = ORDEN_ROLES.indexOf(jb.rol);
      if (ra !== rb) return ra - rb;
      return jb.puntos - ja.puntos;
    });
  }
  if (orden === "puntos") return seleccionados.slice().sort((a, b) => jugador(b).puntos - jugador(a).puntos);
  return seleccionados.slice().sort((a, b) => {
    if (jugador(a).pais !== jugador(b).pais) return jugador(a).pais < jugador(b).pais ? -1 : 1;
    return jugador(b).puntos - jugador(a).puntos;
  });
}

function pintarDisponibles() {
  listaJugadores.innerHTML = "";
  JUGADORES.forEach(j => {
    const li = document.createElement("li");
    const marcado = seleccionados.includes(j.id);
    const lleno = seleccionados.length >= 5;

    const input = document.createElement("input");
    input.type = "checkbox";
    input.id = "llamar-" + j.id;
    input.checked = marcado;
    input.disabled = !marcado && lleno;
    input.setAttribute("aria-label", "Call up " + j.tag + ", " + textoRol(j.rol) + ", rating " + j.puntos);

    const glifo = document.createElement("span");
    glifo.className = "disp-glifo";
    glifo.setAttribute("aria-hidden", "true");

    const cuerpo = document.createElement("span");
    cuerpo.className = "disp-cuerpo";
    const nombre = document.createElement("span");
    nombre.className = "disp-nombre";
    nombre.textContent = j.tag;
    const meta = document.createElement("span");
    meta.className = "disp-meta";
    meta.textContent = textoRol(j.rol) + " · " + j.pais + (lleno && !marcado ? " · bench full" : "");
    cuerpo.appendChild(nombre);
    cuerpo.appendChild(meta);

    const puntos = document.createElement("span");
    puntos.className = "disp-puntos";
    puntos.textContent = String(j.puntos);

    const etiqueta = document.createElement("label");
    etiqueta.className = "disponible";
    etiqueta.setAttribute("for", input.id);
    etiqueta.appendChild(input);
    etiqueta.appendChild(glifo);
    etiqueta.appendChild(cuerpo);
    etiqueta.appendChild(puntos);

    input.addEventListener("change", () => {
      if (input.checked) {
        if (seleccionados.length >= 5) {
          input.checked = false;
          return;
        }
        seleccionados.push(j.id);
      } else {
        seleccionados = seleccionados.filter(x => x !== j.id);
        if (capitan === j.id) capitan = seleccionados[0] || "";
      }
      pintarBanquillo();
    });

    li.appendChild(etiqueta);
    listaJugadores.appendChild(li);
  });
  el("contadorDisponibles").textContent = (JUGADORES.length - seleccionados.length) + " left on the list";
}

function pintarBanquillo(conFlip) {
  const antes = conFlip ? posiciones() : null;
  banquillo.innerHTML = "";
  const ordenados = ordenar();

  ordenados.forEach((id, i) => {
    const j = jugador(id);
    const li = document.createElement("li");
    li.dataset.id = id;
    li.dataset.capitan = String(capitan === id);
    if (i === 0 && conFlip) li.dataset.nuevo = "true";

    const puesto = document.createElement("span");
    puesto.className = "puesto";
    puesto.textContent = capitan === id ? "C" : String(i + 1);
    puesto.setAttribute("aria-hidden", "true");

    const cuerpo = document.createElement("span");
    cuerpo.className = "ficha-cuerpo";
    const nombre = document.createElement("span");
    nombre.className = "ficha-nombre";
    nombre.textContent = j.tag;
    const meta = document.createElement("span");
    meta.className = "ficha-meta";
    meta.textContent = "rating " + j.puntos + " · " + j.pais + (capitan === id ? " · captain" : "");
    cuerpo.appendChild(nombre);
    cuerpo.appendChild(meta);

    const controles = document.createElement("span");
    controles.className = "ficha-controles";

    const selRol = document.createElement("select");
    selRol.className = "rol";
    selRol.id = "rol-" + j.id;
    ROLES.forEach(r => {
      const op = document.createElement("option");
      op.value = r;
      op.textContent = textoRol(r);
      selRol.appendChild(op);
    });
    selRol.value = j.rol;
    selRol.setAttribute("aria-label", "Role of " + j.tag);
    selRol.addEventListener("change", () => {
      j.rol = selRol.value;
      pintarBanquillo(true);
    });
    controles.appendChild(selRol);

    const cap = document.createElement("label");
    cap.className = "capitan";
    cap.setAttribute("for", "cap-" + j.id);
    cap.title = "Make " + j.tag + " the captain";
    const capInput = document.createElement("input");
    capInput.type = "radio";
    capInput.name = "capitan";
    capInput.id = "cap-" + j.id;
    capInput.value = id;
    capInput.checked = capitan === id;
    capInput.addEventListener("change", () => {
      capitan = id;
      pintarBanquillo(true);
    });
    cap.appendChild(capInput);
    cap.appendChild(document.createTextNode("C"));
    controles.appendChild(cap);

    const soltar = document.createElement("button");
    soltar.type = "button";
    soltar.className = "soltar";
    soltar.textContent = "Release";
    soltar.setAttribute("aria-label", "Release " + j.tag + " back to the list");
    soltar.addEventListener("click", () => {
      seleccionados = seleccionados.filter(x => x !== id);
      if (capitan === id) capitan = seleccionados[0] || "";
      pintarBanquillo();
    });

    li.appendChild(puesto);
    li.appendChild(cuerpo);
    li.appendChild(controles);
    li.appendChild(soltar);
    banquillo.appendChild(li);
  });

  banquilloVacio.hidden = seleccionados.length > 0;
  el("contadorTitulares").textContent = seleccionados.length + " of 5 called up";
  voltear(antes);
  pintarDisponibles();
}

function pintarRevision() {
  el("revTag").textContent = el("tag").value.trim() || "not set";
  el("revEquipo").textContent = el("equipo").value.trim() || "not set";
  el("revRegion").textContent = textoOpcion(el("region"), el("region").value) || "not set";
  el("revSemilla").textContent = textoOpcion(el("semilla"), el("semilla").value) || "not set";
  el("revCapitan").textContent = capitan === "" ? "nobody yet" : jugador(capitan).tag;
  const media = seleccionados.length === 0
    ? 0
    : Math.round(seleccionados.reduce((s, id) => s + jugador(id).puntos, 0) / seleccionados.length);
  el("revMedia").textContent = seleccionados.length === 0 ? "0" : String(media);

  const caja = el("revisionTabla");
  caja.innerHTML = "";

  const cabecera = document.createElement("div");
  cabecera.className = "rev-fila cabecera";
  cabecera.setAttribute("role", "row");
  ["#", "Player", "Role", "Rating", "Country"].forEach(t => {
    const s = document.createElement("span");
    s.setAttribute("role", "columnheader");
    s.textContent = t;
    cabecera.appendChild(s);
  });
  caja.appendChild(cabecera);

  ordenar().forEach((id, i) => {
    const j = jugador(id);
    const fila = document.createElement("div");
    fila.className = "rev-fila";
    fila.setAttribute("role", "row");
    const celdas = [String(i + 1), j.tag + (capitan === id ? ", captain" : ""), textoRol(j.rol), String(j.puntos), j.pais];
    celdas.forEach(texto => {
      const s = document.createElement("span");
      s.setAttribute("role", "cell");
      s.textContent = texto;
      fila.appendChild(s);
    });
    caja.appendChild(fila);
  });
}

el("tag").addEventListener("input", () => {
  el("tag").value = el("tag").value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);
  if (el("tag").closest(".campo").dataset.estado === "error") pintar(CAMPOS[0]);
});

CAMPOS.slice(0, 4).forEach(f => {
  const control = el(f.id);
  control.addEventListener("blur", () => pintar(f));
  control.addEventListener("change", () => pintar(f));
});

el("cerrado").addEventListener("change", () => pintar(CAMPOS[4]));

el("tramo1").addEventListener("keydown", e => {
  if (e.key !== "Enter") return;
  if (e.target.tagName === "BUTTON") return;
  e.preventDefault();
  if (problemasPaso1().length > 0) {
    const primero = pintarPaso1();
    if (primero) primero.focus();
    return;
  }
  mostrar(2);
});

document.querySelectorAll("[data-ir]").forEach(boton => {
  boton.addEventListener("click", () => {
    const destino = Number(boton.dataset.ir);
    if (destino > 1) {
      const primero = pintarPaso1();
      if (problemasPaso1().length > 0) {
        mostrar(1);
        if (primero) primero.focus();
        return;
      }
    }
    if (destino === 3 && problemaBanquillo() !== "") {
      mostrar(2);
      return;
    }
    mostrar(destino);
  });
});

document.querySelectorAll(".orden-btn").forEach(boton => {
  boton.addEventListener("click", () => {
    orden = boton.dataset.orden;
    document.querySelectorAll(".orden-btn").forEach(b => {
      b.setAttribute("aria-pressed", String(b.dataset.orden === orden));
    });
    pintarBanquillo(true);
  });
});

document.addEventListener("keydown", e => {
  if (e.key !== "Escape") return;
  if (!resguardo.hidden) return;
  if (paso === 1) return;
  e.preventDefault();
  mostrar(paso - 1);
});

form.addEventListener("submit", e => {
  e.preventDefault();
  pintarPaso1();
  const problemas = [];

  problemasPaso1().forEach(f => {
    const valor = el(f.id).value.trim();
    problemas.push(f.etiqueta + ": " + (valor === "" ? f.vacio : f.error));
  });

  const falloBanquillo = problemaBanquillo();
  if (falloBanquillo !== "") problemas.push("Bench: " + falloBanquillo);

  if (!el("cerrado").checked) {
    pintar(CAMPOS[4]);
    problemas.push("Manager confirmation: " + CAMPOS[4].vacio);
  } else {
    pintar(CAMPOS[4]);
  }

  if (problemas.length > 0) {
    el("resumenTitulo").textContent = problemas.length === 1
      ? "One thing stops the roster going in"
      : problemas.length + " things stop the roster going in";
    el("resumenLista").innerHTML = "";
    problemas.forEach(t => {
      const li = document.createElement("li");
      li.textContent = t;
      el("resumenLista").appendChild(li);
    });
    el("resumenError").hidden = false;
    return;
  }

  el("resumenError").hidden = true;
  const entry = "CC-" + String(Math.floor(1000 + Math.random() * 9000));
  const media = Math.round(seleccionados.reduce((s, id) => s + jugador(id).puntos, 0) / 5);
  const grupo = ["A", "B", "C", "D"][Math.floor(Math.random() * 4)];

  el("resTitulo").textContent = el("tag").value.trim() + " is in the winter qualifier draw";
  el("resTexto").textContent = "The five are locked under entry " + entry + " with an average rating of " +
    media + ". Only an organiser can open the roster again, and not before the draw.";
  el("resNumero").textContent = entry;
  el("resGrupo").textContent = "Group " + grupo + ", drawn Friday";
  el("resCapitan").textContent = capitan === "" ? "nobody" : jugador(capitan).tag;
  el("resPartido").textContent = "Friday 18:00 CET";

  const caja = el("resguardoTabla");
  caja.innerHTML = "";
  ordenar().forEach((id, i) => {
    const j = jugador(id);
    const fila = document.createElement("div");
    fila.className = "res-fila";
    const celdas = [String(i + 1), j.tag + (capitan === id ? ", captain" : ""), textoRol(j.rol), String(j.puntos)];
    celdas.forEach(texto => {
      const s = document.createElement("span");
      s.textContent = texto;
      fila.appendChild(s);
    });
    caja.appendChild(fila);
  });

  form.hidden = true;
  document.querySelector(".pasos").hidden = true;
  resguardo.hidden = false;
  resguardo.focus();
});

el("otra").addEventListener("click", () => {
  resguardo.hidden = true;
  form.hidden = false;
  document.querySelector(".pasos").hidden = false;
  form.reset();
  seleccionados = [];
  capitan = "";
  orden = "rol";
  document.querySelectorAll(".orden-btn").forEach(b => {
    b.setAttribute("aria-pressed", String(b.dataset.orden === "rol"));
  });
  CAMPOS.forEach(f => {
    const control = el(f.id);
    control.closest(".campo").dataset.estado = "neutro";
    control.setAttribute("aria-invalid", "false");
    control.setAttribute("aria-describedby", f.id + "-ayuda");
    el(f.id + "-error").textContent = "";
  });
  el("resumenError").hidden = true;
  mostrar(1);
  el("tag").focus();
});

function tic() {
  relojRestante -= 1;
  if (relojRestante < 0) relojRestante = 0;
  const h = Math.floor(relojRestante / 3600);
  const m = Math.floor(relojRestante / 60) % 60;
  const s = relojRestante % 60;
  const dos = n => String(n).padStart(2, "0");
  reloj.textContent = dos(h) + ":" + dos(m) + ":" + dos(s);
}

pintarDisponibles();
pintarBanquillo();
actualizarIndicadores();
tic();
window.setInterval(tic, 1000);
