const form = document.getElementById("form");
const nota = document.getElementById("nota");
const notaCuenta = document.getElementById("notaCuenta");
const progresoRelleno = document.getElementById("progresoRelleno");
const progresoTexto = document.getElementById("progresoTexto");
const resumenError = document.getElementById("resumenError");
const listaError = document.getElementById("resumenLista");
const tituloError = document.getElementById("resumenTitulo");
const entregada = document.getElementById("entregada");

const PREGUNTAS = [
  { id: "p1", titulo: "goals for the quarter", reparto: [6, 11, 24, 38, 21] },
  { id: "p2", titulo: "workload this week", reparto: [4, 9, 31, 33, 23] },
  { id: "p3", titulo: "useful feedback", reparto: [14, 22, 27, 24, 13] },
  { id: "p4", titulo: "raising a problem", reparto: [9, 17, 25, 29, 20] },
  { id: "p5", titulo: "recommend the team", reparto: [5, 10, 19, 34, 32] }
];

function el(id) { return document.getElementById(id); }

function elegida(id) {
  const marcada = form.querySelector("input[name='" + id + "']:checked");
  return marcada ? Number(marcada.value) : 0;
}

function media(reparto) {
  let suma = 0;
  reparto.forEach((p, i) => { suma += p * (i + 1); });
  return suma / 100;
}

function decimal(n) {
  return n.toFixed(1).replace(".", ",");
}

function pintarBarras(p) {
  const elegidas = elegida(p.id);
  p.reparto.forEach((porcentaje, i) => {
    const barra = document.querySelector("#barras-" + p.id + " i[data-v='" + (i + 1) + "']");
    barra.style.transform = "scaleX(" + porcentaje / 100 + ")";
    barra.dataset.activo = String(elegidas === i + 1);
  });
  const texto = el(p.id + "-valor");
  if (elegidas === 0) {
    texto.textContent = "no answer yet";
    return;
  }
  const pct = p.reparto[elegidas - 1];
  texto.textContent = "you said " + elegidas + " · team " + decimal(media(p.reparto)) + " · " + pct + " % of the team";
}

function pintarPregunta(p) {
  const valor = elegida(p.id);
  const env = form.querySelector("#" + p.id + "-error").closest(".campo");
  const grupo = env.querySelector(".escala");
  const ayuda = el(p.id + "-ayuda");
  const mensaje = el(p.id + "-error");
  const desc = [ayuda.id];

  if (valor === 0) {
    env.dataset.estado = "error";
    grupo.setAttribute("aria-invalid", "true");
    desc.push(mensaje.id);
    mensaje.textContent = "Pick a number from 1 to 5 before sending the sheet.";
  } else {
    env.dataset.estado = "ok";
    grupo.setAttribute("aria-invalid", "false");
    mensaje.textContent = "";
  }
  grupo.setAttribute("aria-describedby", desc.join(" "));
  pintarBarras(p);
  return valor === 0;
}

function pintarNota() {
  const env = nota.closest(".campo");
  const valor = nota.value.trim();
  const malo = valor !== "" && valor.length < 10;
  const desc = ["nota-ayuda"];

  if (malo) {
    env.dataset.estado = "error";
    nota.setAttribute("aria-invalid", "true");
    desc.push("nota-error");
    el("nota-error").textContent = "That note is too short to be useful. Ten characters at least, or leave it empty.";
  } else {
    env.dataset.estado = valor === "" ? "neutro" : "ok";
    nota.setAttribute("aria-invalid", "false");
    el("nota-error").textContent = "";
  }
  nota.setAttribute("aria-describedby", desc.join(" "));
  return malo;
}

function pintarloTodo() {
  let fallos = 0;
  PREGUNTAS.forEach(p => {
    if (pintarPregunta(p)) fallos += 1;
  });
  if (pintarNota()) fallos += 1;
  return fallos;
}

function progreso() {
  const hechas = PREGUNTAS.filter(p => elegida(p.id) !== 0).length;
  progresoRelleno.style.transform = "scaleX(" + hechas / PREGUNTAS.length + ")";
  progresoTexto.textContent = hechas + " of " + PREGUNTAS.length + " answered";
  return hechas;
}

nota.addEventListener("input", () => {
  notaCuenta.textContent = nota.value.length + " of 240";
  if (nota.closest(".campo").dataset.estado === "error") pintarNota();
});

nota.addEventListener("blur", pintarNota);

PREGUNTAS.forEach(p => {
  form.querySelectorAll("input[name='" + p.id + "']").forEach(inp => {
    inp.addEventListener("change", () => {
      pintarPregunta(p);
      progreso();
    });
  });
});

form.addEventListener("submit", e => {
  e.preventDefault();
  const fallos = pintarloTodo();
  progreso();

  if (fallos > 0) {
    tituloError.textContent = fallos === 1
      ? "One question still needs a number"
      : fallos + " answers still need attention";
    listaError.innerHTML = "";
    PREGUNTAS.forEach(p => {
      if (elegida(p.id) === 0) {
        const li = document.createElement("li");
        li.textContent = "Question " + p.id.slice(1) + " on " + p.titulo + " has no number yet";
        listaError.appendChild(li);
      }
    });
    if (nota.value.trim() !== "" && nota.value.trim().length < 10) {
      const li = document.createElement("li");
      li.textContent = "The closing note is shorter than ten characters";
      listaError.appendChild(li);
    }
    resumenError.hidden = false;
    const primera = PREGUNTAS.find(p => elegida(p.id) === 0);
    if (primera) el(primera.id + "o1").focus();
    else nota.focus();
    return;
  }

  resumenError.hidden = true;
  let suma = 0;
  PREGUNTAS.forEach(p => { suma += elegida(p.id); });
  const promedio = suma / PREGUNTAS.length;
  const baja = PREGUNTAS.reduce((a, p) => elegida(p.id) < elegida(a.id) ? p : a, PREGUNTAS[0]);

  el("entPromedio").textContent = decimal(promedio);
  el("entBaja").textContent = baja.id.slice(1) + ", " + elegida(baja.id) + " of 5";
  el("entToken").textContent = "PL-" + String(Math.floor(100000 + Math.random() * 900000));
  el("entCompartidas").textContent = "1 of 4 needed";
  el("entregadaTitulo").textContent = "Thank you, that is five out of five";
  el("entregadaTexto").textContent = nota.value.trim() === ""
    ? "Your five numbers are counted. The aggregate opens once four people have answered and the summary goes out on Friday."
    : "Your five numbers and your note are counted. The office reads the notes on Friday morning, in the order they arrived.";

  form.hidden = true;
  entregada.hidden = false;
  entregada.focus();
});

el("otra").addEventListener("click", () => {
  entregada.hidden = true;
  form.hidden = false;
  resumenError.hidden = true;
  PREGUNTAS.forEach(p => pintarPregunta(p));
  progreso();
  el("p1o1").focus();
});

PREGUNTAS.forEach(p => pintarBarras(p));
progreso();
