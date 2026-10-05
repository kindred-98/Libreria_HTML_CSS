const form = document.getElementById("form");
const disparador = document.getElementById("disparador");
const cajon = document.getElementById("cajon");
const correo = document.getElementById("correo");
const primera = document.getElementById("primera");
const btnComprar = document.getElementById("comprar");
const textoComprar = document.getElementById("comprarTexto");
const resumenError = document.getElementById("resumenError");
const listaError = document.getElementById("resumenLista");
const tituloError = document.getElementById("resumenTitulo");
const listo = document.getElementById("listo");

const PESOS = { "250": 16.9, "500": 29.4, "1000": 49.8 };
const TAZAS = { "250": "about 16 cups", "500": "about 32 cups", "1000": "about 64 cups" };
const MOLIENDAS = ["Whole bean", "Filter", "Press", "Stovetop moka"];

const CAMPOS = [
  {
    id: "peso",
    etiqueta: "Bag size",
    vacio: "Pick a bag, the subscription is a bag every fortnight.",
    error: "That bag size is not one we roast.",
    tipo: "radio",
    prueba: v => Object.hasOwn(PESOS, v)
  },
  {
    id: "molienda",
    etiqueta: "Grind",
    vacio: "Pick a grind, or the roastery has to guess.",
    error: "That grind is not on the list.",
    tipo: "radio",
    prueba: v => MOLIENDAS.includes(v)
  },
  {
    id: "correo",
    etiqueta: "Subscription address",
    vacio: "The subscription has to go somewhere, and this is the only field we ask for.",
    error: "That is not the shape name@domain.tld the mail server expects.",
    prueba: v => /^[^\s@,;]+@[^\s@,;]+\.[A-Za-z]{2,}$/.test(v)
  }
];

function el(id) { return document.getElementById(id); }

function dinero(n) { return n.toFixed(2).replace(".", ",") + " EUR"; }

function pesoActual() {
  const marcado = document.querySelector('input[name="peso"]:checked');
  return marcado ? marcado.value : "";
}

function moliendaActual() {
  const marcado = document.querySelector('input[name="molienda"]:checked');
  return marcado ? marcado.value : "";
}

function radioActual(nombre) {
  const marcado = document.querySelector('input[name="' + nombre + '"]:checked');
  return marcado ? marcado.value : "";
}

function valorCampo(f) {
  if (f.tipo === "radio") return radioActual(f.id);
  return el(f.id).value.trim();
}

function contenedorCampo(f) {
  if (f.tipo === "radio") return el("conjunto-" + f.id);
  return el(f.id).closest(".campo");
}

function controlRadio(f) {
  return document.querySelector('#conjunto-' + f.id + ' input');
}

function pintarCampo(f) {
  const env = contenedorCampo(f);
  const ayuda = el(f.id + "-ayuda");
  const err = el(f.id + "-err");
  const control = f.tipo === "radio" ? controlRadio(f) : el(f.id);
  const valor = valorCampo(f);
  const vacio = valor === "";
  const malo = !f.prueba(valor);
  const desc = [ayuda.id];

  if (malo) {
    env.dataset.estado = "error";
    control.setAttribute("aria-invalid", "true");
    desc.push(err.id);
    err.textContent = vacio ? f.vacio : f.error;
  } else {
    env.dataset.estado = vacio ? "neutro" : "ok";
    control.setAttribute("aria-invalid", "false");
    err.textContent = "";
  }

  env.setAttribute("aria-describedby", desc.join(" "));
  return malo;
}

function problemas() {
  const salida = [];
  CAMPOS.forEach(f => {
    if (!f.prueba(valorCampo(f))) {
      const v = valorCampo(f);
      salida.push(f.etiqueta + ": " + (v === "" ? f.vacio : f.error));
    }
  });
  return salida;
}

function mostrarResumen(fallos) {
  tituloError.textContent = fallos.length === 1
    ? "One thing is missing before the first roast"
    : fallos.length + " things are missing before the first roast";
  listaError.innerHTML = "";
  fallos.forEach(t => {
    const li = document.createElement("li");
    li.textContent = t;
    listaError.appendChild(li);
  });
  resumenError.hidden = false;
}

function proximoMartes() {
  const dias = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const meses = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const d = new Date();
  d.setDate(d.getDate() + ((2 - d.getDay() + 7) % 7 || 7));
  return dias[d.getDay()] + " " + d.getDate() + " " + meses[d.getMonth()];
}

function refrescar() {
  const peso = pesoActual();
  const molienda = moliendaActual();
  const importe = peso === "" ? 0 : PESOS[peso];

  el("precioGrande").textContent = "";
  el("precioGrande").appendChild(document.createTextNode(importe === 0 ? "--" : importe.toFixed(2).replace(".", ",")));
  const unidad = document.createElement("small");
  unidad.textContent = " EUR";
  el("precioGrande").appendChild(unidad);

  el("precioNota").textContent = peso === ""
    ? "pick a bag and the fortnightly figure appears here"
    : "one " + peso + " g bag, " + TAZAS[peso] + ", shipping included";

  el("peso-ayuda").textContent = peso === ""
    ? "Three sizes. 250 g, the one in the photo, ships every two weeks."
    : peso + " g, " + TAZAS[peso] + ", roasted the Tuesday before it ships.";

  el("molienda-ayuda").textContent = molienda === "Whole bean"
    ? "Whole bean keeps fourteen days. Ground keeps seven, so the bag arrives a little fresher."
    : molienda + " ground to order, so the bag reaches you about seven days off the roast.";

  el("hojaTotal").textContent = peso === ""
    ? "pick a bag size"
    : dinero(importe) + " every two weeks";
}

disparador.addEventListener("click", () => {
  const abierto = disparador.getAttribute("aria-expanded") === "true";
  disparador.setAttribute("aria-expanded", String(!abierto));
  cajon.hidden = abierto;
  if (!abierto) {
    refrescar();
    window.setTimeout(() => {
      const foco = document.querySelector("#cajon input");
      if (foco) foco.focus();
    }, 60);
  }
});

CAMPOS.forEach(f => {
  if (f.tipo === "radio") {
    el("conjunto-" + f.id).addEventListener("change", () => {
      if (contenedorCampo(f).dataset.estado === "error") pintarCampo(f);
      refrescar();
    });
    return;
  }
  const nodo = el(f.id);
  nodo.addEventListener("blur", () => pintarCampo(f));
  nodo.addEventListener("input", () => {
    if (nodo.closest(".campo").dataset.estado === "error") pintarCampo(f);
  });
});

primera.addEventListener("change", () => {
  primera.closest(".campo").dataset.estado = primera.checked ? "ok" : "neutro";
  primera.setAttribute("aria-invalid", "false");
});

form.addEventListener("submit", e => {
  e.preventDefault();
  CAMPOS.forEach(f => pintarCampo(f));
  const fallos = problemas();

  if (fallos.length > 0) {
    mostrarResumen(fallos);
    const primero = CAMPOS.find(f => !f.prueba(valorCampo(f)));
    if (primero) {
      if (primero.tipo === "radio") controlRadio(primero).focus();
      else el(primero.id).focus();
    }
    return;
  }

  resumenError.hidden = true;
  const peso = pesoActual();
  const molienda = moliendaActual();
  const v = correo.value.trim();
  const importe = PESOS[peso];
  const cuando = proximoMartes();

  textoComprar.textContent = "Booking the roast";
  btnComprar.disabled = true;

  window.setTimeout(() => {
    el("lPeso").textContent = peso + " g Nightjar";
    el("lMolienda").textContent = molienda;
    el("lRocha").textContent = cuando;
    el("lImporte").textContent = dinero(importe);
    el("listoTitulo").textContent = "The first roast is booked, " + v.split("@")[0];
    el("listoTexto").textContent = "A note goes to " + v + " the moment the " + cuando.split(" ")[0] +
      " roast is done, and every fortnight after that. " +
      (primera.checked ? "The brewing guide is in the same post." : "Skip the guide, no problem.");

    btnComprar.disabled = false;
    textoComprar.textContent = "Start the subscription";
    document.querySelector(".escena").hidden = true;
    document.querySelector(".barra").hidden = true;
    document.querySelector(".pie").hidden = true;
    listo.hidden = false;
    listo.focus();
  }, 560);
});

el("otra").addEventListener("click", () => {
  form.reset();
  CAMPOS.forEach(f => {
    contenedorCampo(f).dataset.estado = "neutro";
    el(f.id + "-err").textContent = "";
    const env = contenedorCampo(f);
    env.setAttribute("aria-describedby", f.id + "-ayuda");
    const control = f.tipo === "radio" ? controlRadio(f) : el(f.id);
    control.setAttribute("aria-invalid", "false");
  });
  primera.closest(".campo").dataset.estado = "neutro";
  resumenError.hidden = true;
  listo.hidden = true;
  document.querySelector(".escena").hidden = false;
  document.querySelector(".barra").hidden = false;
  document.querySelector(".pie").hidden = false;
  disparador.setAttribute("aria-expanded", "true");
  cajon.hidden = false;
  refrescar();
  correo.focus();
});

refrescar();
