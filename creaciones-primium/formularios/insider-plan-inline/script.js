const form = document.getElementById("form");
const correo = document.getElementById("correo");
const envCorreo = correo.closest(".campo");
const planes = document.getElementById("planes");
const desplegable = document.getElementById("desplegable");
const envPlanes = document.getElementById("envPlanes");
const btnMensual = document.getElementById("mensual");
const btnAnual = document.getElementById("anual");
const nota = document.getElementById("facturacionNota");
const btnEntrar = document.getElementById("entrar");
const textoEntrar = document.getElementById("entrarTexto");
const resumenError = document.getElementById("resumenError");
const listaError = document.getElementById("resumenLista");
const tituloError = document.getElementById("resumenTitulo");
const plaza = document.getElementById("plaza");

const TIRADOS = ["mailinator.com", "guerrillamail.com", "tempmail.example", "yopmail.com", "trashmail.com"];

const PLANES = [
  { id: "bote", nombre: "The Bote", detalle: "The whole note, plus the two behind the scenes posts", precio: 6, anual: 60, cadencia: "a month" },
  { id: "mesa", nombre: "Mesa Grande", detalle: "The note, the archive and the monthly voice note", precio: 11, anual: 110, cadencia: "a month", starred: true },
  { id: "taller", nombre: "Taller Abierto", detalle: "Everything, plus a quarterly call and the rough drafts", precio: 24, anual: 240, cadencia: "a month" }
];

let ciclo = "mensual";
let planElegido = "";
let abierto = false;
let escrito = false;

function el(id) { return document.getElementById(id); }

function dinero(n) { return n.toFixed(0) + " EUR"; }

function pintarPlanes() {
  planes.innerHTML = "";
  PLANES.forEach(p => {
    const label = document.createElement("label");
    label.className = planElegido === p.id ? "plan plan--elegido" : "plan";

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "plan";
    input.id = "plan-" + p.id;
    input.value = p.id;
    input.checked = planElegido === p.id;
    input.addEventListener("change", () => {
      planElegido = p.id;
      pintarPlanes();
      pintarPlanesEstado();
    });

    const marca = document.createElement("span");
    marca.className = "plan__marca";
    marca.setAttribute("aria-hidden", "true");

    const txt = document.createElement("span");
    txt.className = "plan__txt";
    const b = document.createElement("b");
    b.textContent = p.nombre;
    const s = document.createElement("small");
    s.textContent = p.detalle;
    txt.appendChild(b);
    txt.appendChild(s);

    const precio = document.createElement("span");
    precio.className = "plan__precio";
    const pb = document.createElement("b");
    pb.textContent = dinero(ciclo === "anual" ? p.anual / 12 : p.precio);
    const ps = document.createElement("small");
    ps.textContent = ciclo === "anual" ? "per month, billed yearly" : p.cadencia;
    precio.appendChild(pb);
    precio.appendChild(ps);

    label.appendChild(input);
    label.appendChild(marca);
    label.appendChild(txt);
    label.appendChild(precio);
    planes.appendChild(label);
  });
}

function planActual() {
  return PLANES.filter(p => p.id === planElegido)[0] || null;
}

function abrirPlanes(abrir) {
  if (abierto === abrir) return;
  abierto = abrir;
  desplegable.dataset.abierto = abrir ? "1" : "0";
  correo.setAttribute("aria-expanded", String(abrir));
  if (!abrir) {
    envPlanes.dataset.estado = "neutro";
    el("planes").setAttribute("aria-invalid", "false");
    el("planes-err").textContent = "";
    el("planes-ayuda").textContent = "One plan per address. You can move between the three in the first thirty days without paying twice.";
  }
}

function correoPrueba(v) {
  if (!/^[^\s@,;]+@[^\s@,;]+\.[A-Za-z]{2,}$/.test(v)) return "forma";
  if (TIRADOS.includes(v.split("@")[1].toLowerCase())) return "tirado";
  return "ok";
}

function pintarCorreo() {
  const ayuda = el("correo-ayuda");
  const err = el("correo-err");
  const v = correo.value.trim();
  const veredicto = v === "" ? "vacio" : correoPrueba(v);
  const desc = [ayuda.id];

  if (veredicto === "ok") {
    envCorreo.dataset.estado = "ok";
    correo.setAttribute("aria-invalid", "false");
    err.textContent = "";
  } else {
    envCorreo.dataset.estado = "error";
    correo.setAttribute("aria-invalid", "true");
    desc.push(err.id);
    if (veredicto === "vacio") {
      err.textContent = "We need an address to send the confirmation to. One field, that is all.";
    } else if (veredicto === "forma") {
      err.textContent = "That is not the shape name@domain.tld the mail server expects. Check for a missing dot.";
    } else {
      err.textContent = v.split("@")[1] + " is a throwaway inbox. We do not send the note to those.";
    }
  }
  correo.setAttribute("aria-describedby", desc.join(" "));
  return veredicto !== "ok";
}

function pintarPlanesEstado() {
  const ayuda = el("planes-ayuda");
  const err = el("planes-err");
  const p = planActual();
  const desc = [ayuda.id];

  if (p === null) {
    envPlanes.dataset.estado = "neutro";
    el("planes").setAttribute("aria-invalid", "false");
    err.textContent = "";
    ayuda.textContent = "One plan per address. You can move between the three in the first thirty days without paying twice.";
  } else {
    envPlanes.dataset.estado = "ok";
    el("planes").setAttribute("aria-invalid", "false");
    err.textContent = "";
    ayuda.textContent = p.nombre + ", " + (ciclo === "anual"
      ? "billed yearly at " + dinero(p.anual) + ", so ten months of it."
      : "billed monthly at " + dinero(p.precio) + ", cancel whenever you like.") +
      " Fourteen days free before the first charge.";
  }
  el("planes").setAttribute("aria-describedby", desc.join(" "));
  return false;
}

function problemas() {
  const salida = [];
  const v = correo.value.trim();
  if (correoPrueba(v) !== "ok") {
    if (v === "") salida.push("Email address: we need an address to send the confirmation to.");
    else if (correoPrueba(v) === "forma") salida.push("Email address: that is not the shape name@domain.tld the mail server expects.");
    else salida.push("Email address: " + v.split("@")[1] + " is a throwaway inbox.");
  }
  if (planElegido === "") {
    salida.push("Plan: pick one of the three, otherwise there is nothing to put you on.");
  }
  return salida;
}

function mostrarResumen(fallos) {
  tituloError.textContent = fallos.length === 1
    ? "One thing is missing before the seat opens"
    : fallos.length + " things are missing before the seat opens";
  listaError.innerHTML = "";
  fallos.forEach(t => {
    const li = document.createElement("li");
    li.textContent = t;
    listaError.appendChild(li);
  });
  resumenError.hidden = false;
}

correo.addEventListener("focus", () => {
  abrirPlanes(true);
  pintarPlanes();
});

correo.addEventListener("blur", () => {
  pintarCorreo();
});

correo.addEventListener("input", () => {
  if (envCorreo.dataset.estado === "error") pintarCorreo();
  if (correo.value.trim() === "") {
    escrito = false;
    return;
  }
  if (!escrito) {
    escrito = true;
    abrirPlanes(true);
    pintarPlanes();
  }
});

correo.addEventListener("keydown", e => {
  if (e.key === "Escape" && abierto) {
    abrirPlanes(false);
    e.stopPropagation();
  }
  if (e.key === "Enter" && !abierto) {
    abrirPlanes(true);
    pintarPlanes();
  }
});

planes.addEventListener("focusout", e => {
  if (!planes.contains(e.relatedTarget) && e.relatedTarget !== correo) {
    window.setTimeout(() => {
      if (document.activeElement !== correo && !planes.contains(document.activeElement)) abrirPlanes(false);
    }, 60);
  }
});

function cambiarCiclo(nuevo) {
  ciclo = nuevo;
  btnMensual.setAttribute("aria-pressed", String(nuevo === "mensual"));
  btnAnual.setAttribute("aria-pressed", String(nuevo === "anual"));
  nota.textContent = nuevo === "anual"
    ? "Billed once a year, ten months of it instead of twelve. Cancel from the panel in a click."
    : "Billed every month, cancel from the panel whenever you like.";
  pintarPlanes();
  if (planElegido !== "") pintarPlanesEstado();
}

btnMensual.addEventListener("click", () => cambiarCiclo("mensual"));
btnAnual.addEventListener("click", () => cambiarCiclo("anual"));

form.addEventListener("submit", e => {
  e.preventDefault();
  abrirPlanes(true);
  pintarPlanes();
  pintarCorreo();
  pintarPlanesEstado();
  const fallos = problemas();

  if (fallos.length > 0) {
    mostrarResumen(fallos);
    if (correoPrueba(correo.value.trim()) !== "ok") correo.focus();
    else planes.querySelector("input").focus();
    return;
  }

  resumenError.hidden = true;
  abrirPlanes(false);
  const p = planActual();
  const v = correo.value.trim();
  textoEntrar.textContent = "Opening the seat";
  btnEntrar.disabled = true;

  window.setTimeout(() => {
    el("pCorreo").textContent = v;
    el("pPlan").textContent = p.nombre + ", " + (ciclo === "anual" ? "yearly" : "monthly");
    el("pCargo").textContent = dinero(ciclo === "anual" ? p.anual : p.precio) + " in 14 days";
    el("pNumero").textContent = "IN-" + String(Math.floor(10000 + Math.random() * 89999));
    el("plazaTitulo").textContent = "You are on the list, " + v.split("@")[0];
    el("plazaTexto").textContent = "One confirmation mail is on its way to " + v +
      ", and the note follows it. Nothing is charged for fourteen days.";
    btnEntrar.disabled = false;
    textoEntrar.textContent = "Take the insider seat";
    form.hidden = true;
    plaza.hidden = false;
    plaza.focus();
  }, 560);
});

el("otra").addEventListener("click", () => {
  form.reset();
  planElegido = "";
  escrito = false;
  correo.setAttribute("aria-expanded", "false");
  envCorreo.dataset.estado = "neutro";
  el("correo-err").textContent = "";
  correo.setAttribute("aria-invalid", "false");
  correo.setAttribute("aria-describedby", "correo-ayuda");
  envPlanes.dataset.estado = "neutro";
  el("planes-err").textContent = "";
  planes.setAttribute("aria-invalid", "false");
  el("planes-ayuda").textContent = "One plan per address. You can move between the three in the first thirty days without paying twice.";
  resumenError.hidden = true;
  ciclo = "mensual";
  btnMensual.setAttribute("aria-pressed", "true");
  btnAnual.setAttribute("aria-pressed", "false");
  nota.textContent = "Billed every month, cancel from the panel whenever you like.";
  form.hidden = false;
  plaza.hidden = true;
  abrirPlanes(false);
  abierto = false;
  desplegable.dataset.abierto = "0";
  pintarPlanes();
  correo.focus();
});

pintarPlanes();
envCorreo.dataset.estado = "neutro";
