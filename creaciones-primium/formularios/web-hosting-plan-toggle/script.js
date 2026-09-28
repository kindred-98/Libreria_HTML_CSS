const form = document.getElementById("form");
const dominio = document.getElementById("dominio");
const desplegable = document.getElementById("desplegable");
const planes = document.getElementById("planes");
const resumenError = document.getElementById("resumenError");
const listaError = document.getElementById("resumenLista");
const tituloError = document.getElementById("resumenTitulo");
const cuenta = document.getElementById("cuenta");
const btnMensual = document.getElementById("mensual");
const btnAnual = document.getElementById("anual");

const FORMATO = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const PLANES = [
  {
    id: "starter",
    nombre: "Starter",
    mensual: 4,
    anual: 40,
    marca: "",
    cifra: "1 site, 10 GB, 50 GB traffic",
    razon: "Enough for a portfolio and a blog. Add more sites later at half the price."
  },
  {
    id: "studio",
    nombre: "Studio",
    mensual: 11,
    anual: 110,
    marca: "most picked",
    cifra: "10 sites, 60 GB, 400 GB traffic",
    razon: "Room for every client site you host, with staging copies included."
  },
  {
    id: "atelier",
    nombre: "Atelier",
    mensual: 26,
    anual: 260,
    marca: "",
    cifra: "Unlimited sites, 200 GB, 2 TB traffic",
    razon: "For teams that ship often. Backups kept daily for thirty days."
  }
];

let ciclo = "mensual";
let abierto = false;

function el(id) { return document.getElementById(id); }

function dinero(n) {
  return n.toFixed(2).replace(".", ",") + " €";
}

function planElegido() {
  const marcada = planes.querySelector("input:checked");
  return marcada ? PLANES.find(p => p.id === marcada.value) : null;
}

function textoErrorDominio() {
  const valor = dominio.value.trim();
  if (valor === "") return "Type the name you want before the .nimbus.dev suffix.";
  if (valor.length < 3) return "Three characters at least, otherwise the name is hard to say out loud.";
  if (valor.length > 24) return "Twenty four characters at most. You have " + valor.length + " now.";
  if (!FORMATO.test(valor)) return "Only lower case letters, digits and single dashes, with no dash at the ends.";
  if (valor === "www" || valor === "admin" || valor === "mail") return "That one is reserved on every domain. Try something more of your own.";
  return "";
}

function pintarDominio() {
  const env = dominio.closest(".campo-dominio");
  const ayuda = el("dominio-ayuda");
  const mensaje = el("dominio-error");
  const error = textoErrorDominio();
  const desc = [ayuda.id];

  if (error !== "") {
    env.dataset.estado = "error";
    dominio.setAttribute("aria-invalid", "true");
    desc.push(mensaje.id);
    mensaje.textContent = error;
  } else {
    env.dataset.estado = "ok";
    dominio.setAttribute("aria-invalid", "false");
    mensaje.textContent = "";
  }
  dominio.setAttribute("aria-describedby", desc.join(" "));
  ayuda.textContent = error === ""
    ? "Looks good. " + dominio.value.trim() + ".nimbus.dev is free for thirty days."
    : ayuda.dataset.base;
  return error !== "";
}

function pintarPlanes() {
  const ayuda = el("planes-ayuda");
  const mensaje = el("planes-error");
  const elegido = planElegido();
  const desc = [ayuda.id];

  if (elegido === null) {
    planes.dataset.estado = "error";
    planes.setAttribute("aria-invalid", "true");
    if (abierto) desc.push(mensaje.id);
    mensaje.textContent = "Choose one of the three plans to continue.";
  } else {
    planes.dataset.estado = "ok";
    planes.setAttribute("aria-invalid", "false");
    mensaje.textContent = "";
    ayuda.textContent = "One plan per domain, and you can switch in the first thirty days without paying twice.";
  }
  planes.setAttribute("aria-describedby", desc.join(" "));
  return elegido === null;
}

function construirPlanes() {
  planes.innerHTML = "";
  PLANES.forEach(p => {
    const label = document.createElement("label");
    label.className = "plan";

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "plan";
    input.id = "plan-" + p.id;
    input.value = p.id;

    const nombre = document.createElement("span");
    nombre.className = "plan-nombre";
    nombre.textContent = p.nombre;

    const precio = document.createElement("span");
    precio.className = "plan-precio";
    const cifra = document.createElement("span");
    cifra.className = "plan-cifra";
    cifra.textContent = p.cifra;
    const razon = document.createElement("span");
    razon.className = "plan-razon";
    razon.textContent = p.razon;

    label.appendChild(input);
    label.appendChild(nombre);
    label.appendChild(precio);
    label.appendChild(cifra);
    label.appendChild(razon);

    if (p.marca !== "") {
      const marca = document.createElement("span");
      marca.className = "plan-marca";
      marca.textContent = p.marca;
      label.appendChild(marca);
    }

    input.addEventListener("change", () => {
      if (planElegido() === null) return;
      pintarPlanes();
      pintarPrecios();
    });

    planes.appendChild(label);
  });
}

function pintarPrecios() {
  planes.querySelectorAll(".plan").forEach(label => {
    const input = label.querySelector("input");
    const p = PLANES.find(x => x.id === input.value);
    const precio = label.querySelector(".plan-precio");
    precio.textContent = "";
    const fuerte = document.createElement("b");
    fuerte.textContent = dinero(ciclo === "anual" ? p.anual / 12 : p.mensual);
    const small = document.createElement("small");
    small.textContent = ciclo === "anual" ? " / month, billed yearly" : " / month";
    precio.appendChild(fuerte);
    precio.appendChild(small);
  });
  el("facturacionNota").textContent = ciclo === "anual"
    ? "Billed once a year at " + dinero(PLANES.find(p => p.id === (planElegido() || PLANES[0]).id).anual) + ". Cancel any time before the second invoice."
    : "Billed every month, cancel from the panel whenever you like.";
}

function alternar(abrir) {
  abierto = abrir;
  if (abrir) {
    desplegable.classList.add("abierta");
    dominio.setAttribute("aria-expanded", "true");
    planes.querySelectorAll("input").forEach(i => { i.disabled = false; });
  } else {
    desplegable.classList.remove("abierta");
    dominio.setAttribute("aria-expanded", "false");
    planes.querySelectorAll("input").forEach(i => { i.disabled = true; });
  }
}

dominio.addEventListener("focus", () => {
  alternar(true);
  if (dominio.value.trim() === "") dominio.value = "";
});

dominio.addEventListener("input", () => {
  const limpio = dominio.value.toLowerCase().replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").replace(/^-/, "").slice(0, 24);
  dominio.value = limpio;
  if (dominio.closest(".campo-dominio").dataset.estado === "error") pintarDominio();
  if (abierto) pintarPlanes();
});

dominio.addEventListener("blur", () => {
  pintarDominio();
  if (abierto) pintarPlanes();
});

dominio.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    alternar(false);
    el("empezar").focus();
  }
});

btnMensual.addEventListener("click", () => {
  ciclo = "mensual";
  btnMensual.setAttribute("aria-pressed", "true");
  btnAnual.setAttribute("aria-pressed", "false");
  pintarPrecios();
});

btnAnual.addEventListener("click", () => {
  ciclo = "anual";
  btnAnual.setAttribute("aria-pressed", "true");
  btnMensual.setAttribute("aria-pressed", "false");
  pintarPrecios();
});

planes.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    alternar(false);
    dominio.focus();
  }
});

form.addEventListener("submit", e => {
  e.preventDefault();
  alternar(true);
  const falloDominio = pintarDominio();
  const falloPlan = pintarPlanes();
  const problemas = [];

  if (falloDominio) problemas.push("Domain: " + textoErrorDominio());
  if (falloPlan) problemas.push("Plan: choose one of the three plans to continue.");

  if (problemas.length > 0) {
    tituloError.textContent = problemas.length === 1
      ? "One thing is missing"
      : "Two things are missing";
    listaError.innerHTML = "";
    problemas.forEach(t => {
      const li = document.createElement("li");
      li.textContent = t;
      listaError.appendChild(li);
    });
    resumenError.hidden = false;
    if (falloDominio) dominio.focus();
    else planes.querySelector("input").focus();
    return;
  }

  resumenError.hidden = true;
  const p = planElegido();
  const total = ciclo === "anual" ? p.anual : p.mensual;
  const fin = new Date(Date.now() + 30 * 86400000);
  const dos = n => String(n).padStart(2, "0");

  el("cDominio").textContent = dominio.value.trim() + ".nimbus.dev";
  el("cPlan").textContent = p.nombre + ", " + p.cifra;
  el("cFactura").textContent = dinero(total) + (ciclo === "anual" ? " in twelve months" : " on day 31");
  el("cFin").textContent = dos(fin.getDate()) + "/" + dos(fin.getMonth() + 1) + "/" + fin.getFullYear();
  el("cuentaTitulo").textContent = dominio.value.trim() + ".nimbus.dev is live on trial";
  el("cuentaTexto").textContent = "The " + p.nombre + " plan is on the " + p.nombre.toLowerCase() +
    " tier with nothing to pay for thirty days. We only ask for a card when the trial ends.";

  form.hidden = true;
  cuenta.hidden = false;
  cuenta.focus();
});

el("otra").addEventListener("click", () => {
  cuenta.hidden = true;
  form.hidden = false;
  resumenError.hidden = true;
  dominio.value = "";
  planes.querySelectorAll("input").forEach(i => { i.checked = false; });
  ciclo = "mensual";
  btnMensual.setAttribute("aria-pressed", "true");
  btnAnual.setAttribute("aria-pressed", "false");
  dominio.closest(".campo-dominio").dataset.estado = "neutro";
  dominio.setAttribute("aria-invalid", "false");
  dominio.setAttribute("aria-describedby", "dominio-ayuda");
  el("dominio-error").textContent = "";
  el("dominio-ayuda").dataset.base = "";
  el("dominio-ayuda").textContent = "Three to twenty four characters: letters, digits and single dashes. The suffix is added for you.";
  planes.dataset.estado = "neutro";
  planes.setAttribute("aria-invalid", "false");
  planes.setAttribute("aria-describedby", "planes-ayuda");
  el("planes-error").textContent = "";
  alternar(false);
  dominio.focus();
});

construirPlanes();
pintarPrecios();
alternar(false);
