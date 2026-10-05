const form = document.getElementById("form");
const hilo = document.getElementById("hilo");
const marcas = document.getElementById("marcas");
const resumenError = document.getElementById("resumenError");
const listaError = document.getElementById("resumenErrorLista");
const tituloError = document.getElementById("resumenErrorTitulo");
const circuito = document.getElementById("circuito");

let paso = 1;

const CAMPOS = {
  correo: {
    id: "correo",
    etiqueta: "Correo de la cuenta",
    vacio: "Necesito un correo para enviarte el enlace.",
    error: "Ese correo no tiene un formato válido. Revisa la arroba y el dominio.",
    prueba: v => /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(v)
  },
  nueva: {
    id: "nueva",
    etiqueta: "Nueva contraseña",
    vacio: "Escribe la contraseña que quieres dejar puesta.",
    error: "Necesitas 10 caracteres, con mayúscula, minúscula y un dígito.",
    prueba: v => v.length >= 10 && /[A-Z]/.test(v) && /[a-z]/.test(v) && /[\d]/.test(v)
  },
  repetir: {
    id: "repetir",
    etiqueta: "Repetición de la contraseña",
    vacio: "Repite la contraseña para confirmar el cambio.",
    error: "Las dos contraseñas no coinciden.",
    prueba: v => v === document.getElementById("nueva").value
  }
};

const ORDEN = ["correo", "nueva", "repetir"];

function el(id) { return document.getElementById(id); }

function pintar(f) {
  const control = el(f.id);
  const env = control.closest(".campo");
  const ayuda = el(f.id + "-ayuda");
  const error = el(f.id + "-error");
  const valor = control.value.trim();
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

function camposDelPaso(n) {
  return n === 1 ? [CAMPOS.correo] : [CAMPOS.nueva, CAMPOS.repetir];
}

function problemas(n) {
  return camposDelPaso(n).filter(f => !f.prueba(el(f.id).value.trim()));
}

function tapar(correo) {
  const partes = correo.split("@");
  if (partes.length !== 2) return correo;
  return partes[0].slice(0, 2) + "***@" + partes[1];
}

function burbuja(texto, esUsuario) {
  const div = document.createElement("div");
  div.className = esUsuario ? "msg msg-usuario" : "msg";
  const av = document.createElement("span");
  av.className = esUsuario ? "avatar-usuario" : "avatar-mini";
  av.setAttribute("aria-hidden", "true");
  const bu = document.createElement("div");
  bu.className = "burbuja";
  const p = document.createElement("p");
  p.textContent = texto;
  bu.appendChild(p);
  div.appendChild(av);
  div.appendChild(bu);
  hilo.appendChild(div);
  return { raiz: div, cuerpo: bu };
}

function tabla(destino, filas) {
  const caja = document.createElement("div");
  caja.className = "tarjeta-enlace";
  filas.forEach(f => {
    const linea = document.createElement("p");
    linea.className = "linea-dato";
    const a = document.createElement("span");
    a.textContent = f[0];
    const b = document.createElement("span");
    b.textContent = f[1];
    if (f[2]) b.className = f[2];
    linea.appendChild(a);
    linea.appendChild(b);
    caja.appendChild(linea);
  });
  destino.appendChild(caja);
  return caja;
}

function verPaso(n) {
  paso = n;
  document.querySelectorAll(".paso").forEach(p => {
    p.hidden = Number(p.dataset.paso) !== n;
  });
  pintarMarcas(n === 3 ? 2 : n);
  resumenError.hidden = true;
}

function pintarMarcas(activas) {
  Array.from(marcas.children).forEach((m, i) => {
    m.classList.toggle("is-activa", i < activas);
    m.classList.remove("is-hecha");
  });
  marcas.setAttribute("aria-label", "Paso " + Math.min(activas, 4) + " de 4");
}

function medirClave() {
  const v = el("nueva").value;
  const puntos =
    (v.length >= 10 ? 1 : 0) +
    (/[A-Z]/.test(v) ? 1 : 0) +
    (/[a-z]/.test(v) ? 1 : 0) +
    (/[\d]/.test(v) ? 1 : 0) +
    (/[^A-Za-z0-9]/.test(v) ? 1 : 0);
  const nivel = v === "" ? 0 : Math.max(1, Math.min(4, Math.ceil(puntos / 1.5)));
  circuito.dataset.nivel = String(nivel);
  el("medidorTexto").textContent = v === "" ? "0" : String(nivel);
  const titulos = ["Sin contraseña todavía", "Muy débil, no la uses así", "Débil, se adivina fácil", "Buena, ya es utilizable", "Excelente, resiste muy bien"];
  const detalles = [
    "Mínimo 10 caracteres con mayúscula, minúscula y dígito.",
    "Un atacante la sacaría en segundos. Alarga o añade variety.",
    "Le falta longitud o un símbolo para estar tranquila.",
    "Sirve para casi cualquier servicio sin dar problemas.",
    "Soporta bien los ataques de diccionario automatizados."
  ];
  el("medidorTitulo").textContent = titulos[nivel];
  el("medidorDetalle").textContent = detalles[nivel];
}

ORDEN.forEach(id => {
  const f = CAMPOS[id];
  const control = el(f.id);
  control.addEventListener("blur", () => {
    pintar(f);
    if (f.id !== "correo") medirClave();
  });
  control.addEventListener("input", () => {
    if (f.id === "nueva") {
      medirClave();
      if (el("repetir").value !== "") pintar(CAMPOS.repetir);
    }
    if (control.closest(".campo").dataset.estado === "error") pintar(f);
  });
});

el("atras").addEventListener("click", () => {
  verPaso(2);
  el("paso2Aviso").textContent = "Puedes volver al paso anterior cuando quieras. El enlace sigue siendo válido durante 20 minutos.";
  el("correo").focus();
});

form.addEventListener("submit", e => {
  e.preventDefault();
  const mios = camposDelPaso(paso);
  mios.forEach(pintar);
  const fallos = problemas(paso);

  if (fallos.length > 0) {
    tituloError.textContent = fallos.length === 1
      ? "Falta un dato por confirmar"
      : "Faltan " + fallos.length + " datos por confirmar";
    listaError.innerHTML = "";
    fallos.forEach(f => {
      const li = document.createElement("li");
      const v = el(f.id).value.trim();
      li.textContent = f.etiqueta + ": " + (v === "" ? f.vacio : f.error);
      listaError.appendChild(li);
    });
    resumenError.hidden = false;
    el(fallos[0].id).focus();
    return;
  }

  resumenError.hidden = true;

  if (paso === 1) {
    const correo = el("correo").value.trim();
    burbuja("Quiero restablecer la contraseña de " + tapar(correo) + ".", true);
    const uno = burbuja("Hecho. Te acabo de enviar el enlace de recuperación.");
    tabla(uno.cuerpo, [
      ["Destinatario", tapar(correo), "correo-tapado"],
      ["Válido hasta", "en 20 minutos"],
      ["Sesión", "este navegador, cifrado de extremo a extremo"]
    ]);
    burbuja("Ya lo tengo abierto, el enlace me lleva al formulario de contraseña nueva.", true);
    burbuja("Genial. Escribe la contraseña que quieres dejar y repítela para confirmar.");
    verPaso(3);
    el("nueva").focus();
    return;
  }

  const largo = el("nueva").value.length;
  const cierre = burbuja("Listo, tu contraseña ya está restablecida y activa en este dispositivo.", false);
  tabla(cierre.cuerpo, [
    ["Cuenta", el("correo").value.trim()],
    ["Nueva contraseña", largo + " caracteres, verificados"],
    ["Sesiones abiertas", "1, solo este dispositivo"],
    ["Cambio registrado", "hace unos segundos"]
  ]);
  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = "suave";
  boton.textContent = "Empezar de nuevo";
  boton.addEventListener("click", () => reiniciar());
  cierre.cuerpo.appendChild(boton);
  form.hidden = true;
  hilo.scrollIntoView({ block: "end" });
  boton.focus();
  pintarMarcas(4);
});

function reiniciar() {
  form.reset();
  form.hidden = false;
  ORDEN.forEach(id => {
    const env = el(id).closest(".campo");
    env.dataset.estado = "neutro";
    el(id).removeAttribute("aria-invalid");
    el(id).setAttribute("aria-describedby", id + "-ayuda");
    el(id + "-error").textContent = "";
  });
  Array.from(hilo.querySelectorAll(".msg")).slice(2).forEach(m => m.remove());
  medirClave();
  verPaso(1);
  pintarMarcas(1);
  el("correo").focus();
}

medirClave();
verPaso(1);
pintarMarcas(1);
