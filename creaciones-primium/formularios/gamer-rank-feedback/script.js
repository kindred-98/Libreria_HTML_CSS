const form = document.getElementById("formInforme");
const medidor = document.getElementById("medidor");
const moodCifra = document.getElementById("moodCifra");
const moodRelleno = document.getElementById("moodRelleno");
const moodBar = document.getElementById("moodBar");
const moodTexto = document.getElementById("moodTexto");
const moodCuenta = document.getElementById("moodCuenta");
const resumen = document.getElementById("resumenError");
const resumenTitulo = document.getElementById("resumenErrorTitulo");
const resumenLista = document.getElementById("resumenErrorLista");
const detalle = document.getElementById("detalle");
const alias = document.getElementById("alias");
const cerrada = document.getElementById("cerrada");

const PREGUNTAS = {
  rango: {
    bloque: "bloqueRango",
    pista: "pistaRango",
    error: "errorRango",
    barra: "barraR",
    cuenta: "cuentaR",
    votos: [1, 3, 4, 5, 2],
    nombres: ["Tilt city", "Rough ride", "Even game", "Good game", "Flawless run"],
    titulo: "How did the last match feel?",
    vacio: "Pick one rung of the ladder, the chart is waiting for your vote."
  },
  rol: {
    bloque: "bloqueRol",
    pista: "pistaRol",
    error: "errorRol",
    barra: "barraL",
    cuenta: "cuentaL",
    votos: [4, 3, 2, 3, 0],
    nombres: ["Entry", "Support", "In game leader", "Flex", "Sniper"],
    titulo: "Which role did you lock in?",
    vacio: "Roles matter for the next draft, lock one in so the chart can move."
  },
  cola: {
    bloque: "bloqueCola",
    pista: "pistaCola",
    error: "errorCola",
    barra: "barraC",
    cuenta: "cuentaC",
    votos: [6, 4, 2],
    nombres: ["Yes, it felt fair", "Mostly fair", "No, it was rough"],
    titulo: "Was the queue fair tonight?",
    vacio: "Say whether matchmaking behaved, even when the answer is no."
  }
};

function el(id) { return document.getElementById(id); }

function elegida(clave) {
  return form.querySelector('input[name="' + clave + '"]:checked');
}

function totalDe(p) {
  return p.votos.reduce(function (a, b) { return a + b; }, 0);
}

function pintaBarras(clave) {
  const p = PREGUNTAS[clave];
  const total = totalDe(p);
  for (let i = 0; i < p.votos.length; i++) {
    const barra = el(p.barra + i);
    const cuenta = el(p.cuenta + i);
    const votos = p.votos[i];
    const tanto = total === 0 ? 0 : votos / total;
    const pct = Math.round(tanto * 100);
    if (barra) barra.style.transform = "scaleX(" + tanto.toFixed(4) + ")";
    if (cuenta) {
      cuenta.textContent = votos + " of " + total + ", " + pct + "%";
      cuenta.setAttribute("aria-label", votos + " of " + total + " answers, " + pct + " percent");
    }
  }
}

function veredictoDe(mood) {
  if (mood >= 82) return "Flawless run";
  if (mood >= 66) return "Good game";
  if (mood >= 48) return "Even game";
  if (mood >= 30) return "Rough ride";
  return "Tilt city";
}

function moodActual() {
  const rango = elegida("rango");
  const cola = elegida("cola");
  let suma = 0;
  let peso = 0;
  if (rango) {
    suma += (Number(rango.value) / 4) * 100 * 0.6;
    peso += 0.6;
  }
  if (cola) {
    const v = Number(cola.value);
    suma += (v === 0 ? 100 : v === 1 ? 55 : 10) * 0.4;
    peso += 0.4;
  }
  if (peso === 0) return null;
  return Math.round(suma / peso);
}

function pintaMood() {
  const mood = moodActual();
  const hechas = Object.keys(PREGUNTAS).filter(function (c) { return elegida(c) !== null; }).length;

  if (mood === null) {
    medidor.dataset.vacio = "1";
    moodCifra.textContent = "--";
    moodRelleno.style.transform = "scaleX(0)";
    moodTexto.textContent = "Answer the first question and the mood starts moving.";
    moodBar.setAttribute("aria-label", "Squad mood, no answers yet");
  } else {
    medidor.dataset.vacio = "0";
    moodCifra.textContent = mood;
    moodRelleno.style.transform = "scaleX(" + (mood / 100).toFixed(4) + ")";
    moodTexto.textContent = "Squad mood reads " + veredictoDe(mood) + " at " + mood + " out of 100.";
    moodBar.setAttribute("aria-label", "Squad mood " + mood + " out of 100, " + veredictoDe(mood));
  }

  moodCuenta.textContent = hechas + " of 3 questions answered" +
    (hechas === 3 ? ", only the note is left" : "");
}

function marcaPista(clave) {
  const p = PREGUNTAS[clave];
  const marcada = elegida(clave);
  el(p.pista).textContent = marcada ? p.nombres[Number(marcada.value)] : "Pick one";
}

function limpiaErrorGrupo(clave) {
  const p = PREGUNTAS[clave];
  el(p.bloque).dataset.estado = "ok";
  el(p.error).hidden = true;
  el(p.error).textContent = "";
}

function errorDe(campo, idError, mensaje) {
  campo.closest(".campo").dataset.estado = "error";
  const caja = el(idError);
  caja.textContent = mensaje;
  caja.hidden = false;
}

function validaDetalle() {
  const v = detalle.value.trim();
  if (v === "") {
    errorDe(detalle, "errorDetalle", "The coach needs a line. Ten characters is the minimum.");
    return false;
  }
  if (v.length < 10) {
    errorDe(detalle, "errorDetalle", "That is " + v.length + " characters. Write at least 10 so the note makes sense.");
    return false;
  }
  detalle.closest(".campo").dataset.estado = "ok";
  el("errorDetalle").hidden = true;
  return true;
}

function validaAlias() {
  const v = alias.value.trim();
  if (v !== "" && !/^[A-Za-z0-9._-]{2,16}$/.test(v)) {
    errorDe(alias, "errorAlias", "A tag is 2 to 16 characters: letters, numbers, dot, dash or underscore.");
    return false;
  }
  alias.closest(".campo").dataset.estado = "ok";
  el("errorAlias").hidden = true;
  return true;
}

function cuentaDetalle() {
  const n = detalle.value.trim().length;
  const caja = el("cuentaDetalle");
  if (!caja) return;
  caja.textContent = String(n);
  caja.style.color = n === 0 ? "" : n < 10 ? "var(--rojo)" : "var(--verde)";
}

function recoge() {
  const fallos = [];

  Object.keys(PREGUNTAS).forEach(function (clave) {
    const p = PREGUNTAS[clave];
    if (elegida(clave) === null) {
      el(p.bloque).dataset.estado = "error";
      el(p.error).textContent = p.vacio;
      el(p.error).hidden = false;
      fallos.push(p.titulo + ": " + p.vacio);
    } else {
      limpiaErrorGrupo(clave);
    }
  });

  if (!validaDetalle()) fallos.push("One change for next time: " + el("errorDetalle").textContent);
  if (!validaAlias()) fallos.push("Your tag: " + el("errorAlias").textContent);
  return fallos;
}

function enfocaPrimero(fallos) {
  const orden = [
    ["How did", 'input[name="rango"]'],
    ["Which role", 'input[name="rol"]'],
    ["Was the queue", 'input[name="cola"]'],
    ["One change", "#detalle"],
    ["Your tag", "#alias"]
  ];
  for (const campo of orden) {
    if (fallos.some(function (f) { return f.indexOf(campo[0]) === 0; })) {
      form.querySelector(campo[1]).focus();
      return;
    }
  }
  form.querySelector('input[name="rango"]').focus();
}

Object.keys(PREGUNTAS).forEach(function (clave) {
  form.querySelectorAll('input[name="' + clave + '"]').forEach(function (radio) {
    radio.addEventListener("change", function () {
      limpiaErrorGrupo(clave);
      marcaPista(clave);
      PREGUNTAS[clave].votos[Number(radio.value)] += 1;
      pintaBarras(clave);
      pintaMood();
    });
  });
});

detalle.addEventListener("input", function () {
  cuentaDetalle();
  if (!el("errorDetalle").hidden && detalle.value.trim().length >= 10) validaDetalle();
});

alias.addEventListener("input", function () {
  if (!el("errorAlias").hidden) validaAlias();
});

form.addEventListener("submit", function (e) {
  e.preventDefault();
  const fallos = recoge();

  if (fallos.length > 0) {
    resumenTitulo.textContent = fallos.length === 1
      ? "One answer is still missing"
      : fallos.length + " answers are still missing";
    resumenLista.innerHTML = "";
    fallos.forEach(function (t) {
      const li = document.createElement("li");
      li.textContent = t;
      resumenLista.appendChild(li);
    });
    resumen.hidden = false;
    enfocaPrimero(fallos);
    return;
  }

  resumen.hidden = true;
  el("enviaTexto").textContent = "Filing the report";
  el("envia").disabled = true;
  window.setTimeout(cierra, 750);
});

function cierra() {
  const mood = moodActual();
  const ticket = "RPT-" + String(Math.floor(1000 + Math.random() * 8999));
  const totalSquad = totalDe(PREGUNTAS.rango) + totalDe(PREGUNTAS.rol) + totalDe(PREGUNTAS.cola);
  const quien = alias.value.trim();
  const rung = PREGUNTAS.rango.nombres[Number(elegida("rango").value)];
  const rol = PREGUNTAS.rol.nombres[Number(elegida("rol").value)];

  el("cerradaRef").textContent = ticket;
  el("cerradaMood").textContent = mood + " / 100";
  el("cerradaVeredicto").textContent = rung;
  el("cerradaTotal").textContent = totalSquad + " answers";
  el("cerradaTitulo").textContent = mood >= 66 ? "The chart has your vote" : "The chart has your vote, and the dip";
  el("cerradaLead").textContent = (mood >= 66
    ? "Good night on paper. "
    : "Rough one, then, and the bar does not lie. ") +
    (quien ? quien + ", " : "") + "the coach reads your line on Monday with the rest of the squad.";

  const pasos = [
    "Ticket " + ticket + " filed for tonight" + (quien ? ", tagged " + quien : ", left anonymous"),
    "Squad mood reads " + mood + " out of 100, verdict " + veredictoDe(mood),
    "Rung " + rung.toLowerCase() + ", role " + rol.toLowerCase() + ", your vote is in the bar",
    "The three charts now hold " + totalSquad + " answers between them, yours included"
  ];
  if (mood < 48) {
    pasos.push("A mood this low flags the queue, matchmaking reviews these on Friday");
  }

  const lista = el("cerradaPasos");
  lista.innerHTML = "";
  pasos.forEach(function (t, i) {
    const li = document.createElement("li");
    li.textContent = t;
    li.style.animationDelay = (0.08 + i * 0.08).toFixed(2) + "s";
    lista.appendChild(li);
  });

  form.hidden = true;
  document.querySelector(".cabecera").hidden = true;
  cerrada.hidden = false;
  cerrada.focus();
}

el("otra").addEventListener("click", function () {
  cerrada.hidden = true;
  document.querySelector(".cabecera").hidden = false;
  form.hidden = false;
  el("envia").disabled = false;
  el("enviaTexto").textContent = "Send the report";

  Object.keys(PREGUNTAS).forEach(function (clave) {
    const marcada = elegida(clave);
    if (marcada) PREGUNTAS[clave].votos[Number(marcada.value)] -= 1;
    form.querySelectorAll('input[name="' + clave + '"]').forEach(function (r) { r.checked = false; });
    limpiaErrorGrupo(clave);
    marcaPista(clave);
    pintaBarras(clave);
  });

  detalle.value = "";
  alias.value = "";
  detalle.closest(".campo").dataset.estado = "ok";
  el("errorDetalle").hidden = true;
  alias.closest(".campo").dataset.estado = "ok";
  el("errorAlias").hidden = true;
  resumen.hidden = true;
  resumenLista.innerHTML = "";
  cuentaDetalle();
  pintaMood();
  form.querySelector('input[name="rango"]').focus();
});

pintaBarras("rango");
pintaBarras("rol");
pintaBarras("cola");
marcaPista("rango");
marcaPista("rol");
marcaPista("cola");
pintaMood();
cuentaDetalle();
