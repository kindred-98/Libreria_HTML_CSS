const form = document.getElementById("form");
const resumenError = document.getElementById("resumenError");
const listaError = document.getElementById("resumenErrorLista");
const tituloError = document.getElementById("resumenErrorTitulo");
const publicada = document.getElementById("publicada");
const barras = Array.from(document.querySelectorAll(".barras li"));

const REPARTO = { "5": 42, "4": 31, "3": 15, "2": 8, "1": 4 };

const CAMPOS = [
  {
    id: "nota",
    etiqueta: "Nota del producto",
    vacio: "Elige una nota de una a cinco estrellas.",
    error: "Esa nota no está en la escala de una a cinco.",
    prueba: v => /^[1-5]$/.test(v)
  },
  {
    id: "recomienda",
    etiqueta: "Recomendación",
    vacio: "Dinos si lo volverías a comprar.",
    error: "Esa opción de recomendación no es válida.",
    prueba: v => ["Sí, lo compraría otra vez", "Depende del uso que le des", "No lo volvería a comprar"].includes(v)
  },
  {
    id: "titulo",
    etiqueta: "Título de la reseña",
    vacio: "Escribe un título para tu reseña.",
    error: "Entre 6 y 60 caracteres, sin exclamaciones ni mayúsculas sostenidas.",
    prueba: v => v.length >= 6 && v.length <= 60 && !/[!¡]{2,}/.test(v) && v === v.replace(/\b[A-ZÁÉÍÓÚÑ]{4,}\b/, function (m) { return m.toLowerCase(); })
  },
  {
    id: "cuerpo",
    etiqueta: "Cuerpo de la reseña",
    vacio: "Cuenta un poco más cómo has usado el cuaderno.",
    error: "Entre 25 y 800 caracteres.",
    prueba: v => v.length >= 25 && v.length <= 800
  }
];

function el(id) { return document.getElementById(id); }

function valorCampo(f) {
  if (f.id === "nota" || f.id === "recomienda") {
    const marcada = form.querySelector('input[name="' + f.id + '"]:checked');
    return marcada ? marcada.value : "";
  }
  return el(f.id).value.trim();
}

function referencia(f) {
  return f.id === "nota" ? el("nota3") : f.id === "recomienda" ? el("rec_si") : el(f.id);
}

function pintar(f) {
  const control = referencia(f);
  const env = control.closest(".campo");
  const ayuda = el(f.id + "-ayuda");
  const error = el(f.id + "-error");
  const valor = valorCampo(f);
  const malo = !f.prueba(valor);
  const desc = [ayuda.id];

  if (malo) {
    env.dataset.estado = "error";
    control.setAttribute("aria-invalid", "true");
    desc.push(error.id);
    error.textContent = valor === "" ? f.vacio : f.error;
  } else {
    env.dataset.estado = "ok";
    control.removeAttribute("aria-invalid");
  }
  control.setAttribute("aria-describedby", desc.join(" "));
  return malo;
}

function pintarBarras(nota) {
  barras.forEach(li => {
    const n = li.dataset.nota;
    const i = li.querySelector("i");
    i.style.transform = "scaleX(" + (REPARTO[n] / 100).toFixed(3) + ")";
    li.classList.toggle("activo", nota !== "" && n === nota);
  });
}

const NOMBRES = { "1": "Una estrella", "2": "Dos estrellas", "3": "Tres estrellas", "4": "Cuatro estrellas", "5": "Cinco estrellas" };

CAMPOS.forEach(f => {
  if (f.id === "nota" || f.id === "recomienda") {
    const ids = f.id === "nota"
      ? ["nota1", "nota2", "nota3", "nota4", "nota5"]
      : ["rec_si", "rec_talvez", "rec_no"];
    ids.forEach(id => {
      el(id).addEventListener("blur", () => pintar(f));
      el(id).addEventListener("change", () => {
        pintar(f);
        if (f.id === "nota") {
          pintarBarras(el(id).value);
          el("nota-ayuda").textContent = "Has elegido " + NOMBRES[el(id).value].toLowerCase() + ". Tu fila se ilumina en el reparto de abajo.";
        }
      });
    });
    return;
  }
  const control = el(f.id);
  control.addEventListener("blur", () => pintar(f));
  control.addEventListener("input", () => {
    if (control.closest(".campo").dataset.estado === "error") pintar(f);
    el(f.id + "Cuenta").textContent = String(control.value.length) + " de " + control.maxLength;
  });
});

el("titulo").addEventListener("input", () => {
  el("tituloCuenta").textContent = String(el("titulo").value.length) + " de 60";
});

el("cuerpo").addEventListener("input", () => {
  el("cuerpoCuenta").textContent = String(el("cuerpo").value.length) + " de 800";
});

function problemas() {
  return CAMPOS.filter(f => !f.prueba(valorCampo(f)));
}

form.addEventListener("submit", e => {
  e.preventDefault();
  CAMPOS.forEach(pintar);
  pintarBarras(valorCampo(CAMPOS[0]));
  const fallos = problemas();

  if (fallos.length > 0) {
    tituloError.textContent = fallos.length === 1
      ? "Falta responder una pregunta"
      : "Faltan " + fallos.length + " preguntas por responder";
    listaError.innerHTML = "";
    fallos.forEach(f => {
      const li = document.createElement("li");
      li.textContent = f.etiqueta + ": " + (valorCampo(f) === "" ? f.vacio : f.error);
      listaError.appendChild(li);
    });
    resumenError.hidden = false;
    referencia(fallos[0]).focus();
    referencia(fallos[0]).scrollIntoView({ block: "center" });
    return;
  }

  resumenError.hidden = true;
  const nota = Number(valorCampo(CAMPOS[0]));
  const a = new Date();
  const dos = n => String(n).padStart(2, "0");
  const estrellas = document.querySelectorAll("#publicadaNota i");
  estrellas.forEach((i, k) => i.classList.toggle("vacia", k >= nota));
  el("publicadaTitulo").textContent = el("titulo").value.trim();
  el("publicadaCuerpo").textContent = el("cuerpo").value.trim();
  el("publicadaReco").textContent = valorCampo(CAMPOS[1]) + " · compra verificada el " +
    dos(a.getDate()) + "/" + dos(a.getMonth() + 1) + "/" + a.getFullYear();
  el("publicadaFecha").textContent = "Socia desde 2019 · publica reseñas desde 2021";
  el("pubRef").textContent = "RS-" + String(Math.floor(100000 + Math.random() * 900000));
  el("pubNota").textContent = nota + " de 5 · " + NOMBRES[String(nota)].toLowerCase();
  el("pubReco").textContent = valorCampo(CAMPOS[1]);
  el("pubEstado").textContent = nota <= 2 ? "revisada por el equipo de producto" : "pendiente de moderación";
  el("publicadaTexto").textContent = nota <= 2
    ? "Gracias por escribirla. La hemos marcado para que la revise el equipo de producto y te responderemos por correo."
    : "Gracias por escribirla. Le hemos dado un peso extra mientras llegan las primeras reacciones.";
  form.hidden = true;
  document.querySelector(".hoja-cab").hidden = true;
  publicada.hidden = false;
  publicada.focus();
});

el("otra").addEventListener("click", () => {
  form.reset();
  form.hidden = false;
  document.querySelector(".hoja-cab").hidden = false;
  publicada.hidden = true;
  CAMPOS.forEach(f => {
    const env = referencia(f).closest(".campo");
    env.dataset.estado = "neutro";
    const control = referencia(f);
    control.removeAttribute("aria-invalid");
    control.setAttribute("aria-describedby", f.id + "-ayuda");
    el(f.id + "-error").textContent = "";
  });
  el("tituloCuenta").textContent = "0 de 60";
  el("cuerpoCuenta").textContent = "0 de 800";
  el("nota-ayuda").textContent = "Selecciona una nota con las flechas del teclado. Al elegirla se ilumina tu fila en el reparto.";
  resumenError.hidden = true;
  pintarBarras("");
  window.setTimeout(() => pintarBarras(""), 60);
  el("nota3").focus();
});

window.setTimeout(() => pintarBarras(""), 120);
pintarBarras("");
