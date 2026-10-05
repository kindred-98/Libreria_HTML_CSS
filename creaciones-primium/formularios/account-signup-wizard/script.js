const form = document.getElementById("form");
const paneles = Array.from(document.querySelectorAll(".panel"));
const pasos = Array.from(document.querySelectorAll(".paso"));
const avanceRelleno = document.getElementById("avanceRelleno");
const btnAtras = document.getElementById("atras");
const btnContinuar = document.getElementById("continuar");
const textoContinuar = document.getElementById("continuarTexto");
const resumenError = document.getElementById("resumenError");
const listaError = document.getElementById("resumenErrorLista");
const tituloError = document.getElementById("resumenErrorTitulo");
const listo = document.getElementById("listo");

let paso = 1;
const TOTAL = paneles.length;

const CAMPOS = [
  {
    id: "nombre", panel: 1,
    etiqueta: "Nombre",
    vacio: "Escribe tu nombre para continuar.",
    error: "Entre 2 y 40 caracteres, con al menos una letra.",
    prueba: v => v.length >= 2 && v.length <= 40 && /[a-zA-ZÀ-ÿ]/.test(v)
  },
  {
    id: "apellidos", panel: 1,
    etiqueta: "Apellidos",
    vacio: "Escribe al menos un apellido.",
    error: "Entre 2 y 60 caracteres, con al menos una letra.",
    prueba: v => v.length >= 2 && v.length <= 60 && /[a-zA-ZÀ-ÿ]/.test(v)
  },
  {
    id: "correo", panel: 1,
    etiqueta: "Correo electrónico",
    vacio: "Necesitamos un correo para enviarte el código.",
    error: "Revisa el formato: nombre@dominio.com",
    prueba: v => /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(v)
  },
  {
    id: "pais", panel: 1,
    etiqueta: "País de residencia",
    vacio: "Selecciona un país.",
    error: "Ese país no está en la lista.",
    prueba: v => v !== "" && v.length <= 3
  },
  {
    id: "ocupacion", panel: 1,
    etiqueta: "Ocupación",
    vacio: "Selecciona una ocupación.",
    error: "Elige una de las opciones de la lista.",
    prueba: v => ["diseno", "desarrollo", "producto", "marketing", "operaciones", "otra"].includes(v)
  },
  {
    id: "terminos", panel: 1, tipo: "check",
    etiqueta: "Condiciones",
    vacio: "Hay que aceptar las condiciones para continuar.",
    error: "No podemos continuar sin la aceptación.",
    prueba: v => v === "si"
  },
  {
    id: "clave", panel: 2,
    etiqueta: "Contraseña",
    vacio: "Escribe una contraseña.",
    error: "Necesitas 10 caracteres, con mayúscula, minúscula y dígito.",
    prueba: v => v.length >= 10 && /[A-Z]/.test(v) && /[a-z]/.test(v) && /\d/.test(v)
  },
  {
    id: "repetir", panel: 2,
    etiqueta: "Repetición de la contraseña",
    vacio: "Repite la contraseña para confirmar.",
    error: "Las dos contraseñas no coinciden.",
    prueba: v => v === document.getElementById("clave").value
  },
  {
    id: "pregunta", panel: 2,
    etiqueta: "Pregunta de recuperación",
    vacio: "Elige una pregunta de recuperación.",
    error: "Esa pregunta no está disponible.",
    prueba: v => ["ciudad", "colegio", "primer-bici", "libro"].includes(v)
  },
  {
    id: "respuesta", panel: 2,
    etiqueta: "Respuesta de recuperacion",
    vacio: "Escribe la respuesta.",
    error: "Minimo 4 caracteres y sin signos de interrogacion.",
    prueba: v => v.length >= 4 && !/[?¿]/.test(v)
  },
  {
    id: "otp", panel: 3, tipo: "otp",
    etiqueta: "Código de verificación",
    vacio: "Faltan cifras por escribir.",
    error: "Ese código no coincide. Revisa las seis cifras.",
    prueba: v => v.length === 6 && /^\d{6}$/.test(v)
  }
];

function el(id) { return document.getElementById(id); }

function valorCampo(f) {
  if (f.tipo === "check") return el(f.id).checked ? "si" : "";
  if (f.tipo === "otp") {
    return Array.from(document.querySelectorAll("#casillas input")).map(i => i.value).join("");
  }
  return el(f.id).value.trim();
}

function pintar(f) {
  const env = f.tipo === "otp"
    ? document.querySelector(".campo-otp")
    : el(f.id).closest(".campo");
  const ayuda = el(f.id + "-ayuda") || el("otp-ayuda");
  const error = el(f.id + "-error") || el("otp-error");
  const valor = valorCampo(f);
  const vacio = valor === "";
  const malo = !vacio && !f.prueba(valor);

  env.dataset.estado = vacio || malo ? "error" : "ok";

  const desc = [ayuda.id];
  if (vacio || malo) {
    desc.push(error.id);
    error.textContent = vacio ? f.vacio : f.error;
  }

  if (f.tipo === "otp") {
    const completa = valor.length === 6;
    if (malo && completa) desc.push(error.id);
    const cajas = document.querySelectorAll("#casillas input");
    const activo = document.activeElement;
    cajas.forEach(c => c.classList.toggle("llena", c.value !== ""));
    if (!activaEnOTP(activo)) {
      document.querySelectorAll("#casillas input").forEach(c => {
        if (c === activo) return;
      });
    }
  } else {
    el(f.id).setAttribute("aria-invalid", vacio || malo ? "true" : "false");
  }

  if (f.tipo === "otp") {
    document.getElementById("casillas").setAttribute("aria-describedby", desc.join(" "));
  } else {
    el(f.id).setAttribute("aria-describedby", desc.join(" "));
  }

  return vacio || malo;
}

function activaEnOTP(nodo) {
  return nodo && nodo.parentElement && nodo.parentElement.id === "casillas";
}

function validarPanel(n) {
  let primero = null;
  CAMPOS.filter(f => f.panel === n).forEach(f => {
    const fallo = pintar(f);
    if (fallo && !primero) {
      primero = f.tipo === "otp"
        ? document.querySelector("#casillas input")
        : el(f.id);
    }
  });
  return primero;
}

function problemas(n) {
  return CAMPOS.filter(f => f.panel === n && (() => {
    const v = valorCampo(f);
    return v === "" || !f.prueba(v);
  })());
}

function mostrarResumen(n) {
  const fallos = problemas(n);
  if (fallos.length === 0) {
    resumenError.hidden = true;
    return;
  }
  tituloError.textContent = fallos.length === 1
    ? "Falta corregir un campo"
    : "Faltan " + fallos.length + " campos por corregir";
  listaError.innerHTML = "";
  fallos.forEach(f => {
    const li = document.createElement("li");
    const v = valorCampo(f);
    li.textContent = f.etiqueta + ": " + (v === "" ? f.vacio : f.error);
    listaError.appendChild(li);
  });
  resumenError.hidden = false;
}

function mostrar(n) {
  paso = n;
  paneles.forEach(p => {
    const activo = Number(p.dataset.panel) === n;
    p.hidden = !activo;
    p.classList.toggle("is-visible", activo);
  });
  pasos.forEach(p => {
    const num = Number(p.dataset.paso);
    p.classList.toggle("is-activo", num === n);
    p.classList.toggle("is-hecho", num < n);
  });
  avanceRelleno.style.transform = "scaleX(" + ((n - 1) / (TOTAL - 1) * 0.999 + 0.001) + ")";
  avanceRelleno.style.width = "100%";
  btnAtras.hidden = n === 1;
  textoContinuar.textContent = n === TOTAL ? "Crear mi cuenta" : "Continuar";
  resumenError.hidden = true;
  el("destino").textContent = el("correo").value.trim() || "tu direccion";
  actualizarResumen();
}

function actualizarResumen() {
  el("ver-correo").textContent = el("correo").value.trim() || "sin definir";
  const clave = el("clave").value;
  el("ver-clave").textContent = clave ? clave.length + " caracteres" : "sin definir";
  const sel = el("pregunta");
  el("ver-pregunta").textContent = sel.value
    ? sel.options[sel.selectedIndex].text
    : "sin definir";
}

CAMPOS.forEach(f => {
  const nodos = f.tipo === "otp"
    ? Array.from(document.querySelectorAll("#casillas input"))
    : [el(f.id)];
  nodos.forEach(n => {
    n.addEventListener("blur", () => { pintar(f); if (f.id === "clave" || f.id === "repetir") medirClave(); });
  });
});

CAMPOS.filter(f => f.panel === 1).forEach(f => {
  el(f.id).addEventListener("input", () => {
    if (f.id === "correo") actualizarResumen();
    if (f.el && f.el.closest(".campo").dataset.estado === "error") pintar(f);
  });
});

el("repetir").addEventListener("input", () => {
  const env = el("repetir").closest(".campo");
  if (env.dataset.estado !== "neutro") pintar(CAMPOS.find(f => f.id === "repetir"));
});

const medidor = el("clave-medidor");
const claveTexto = el("claveTexto");
const reglas = Array.from(document.querySelectorAll("#reglas li"));

function medirClave() {
  const v = el("clave").value;
  const cumplidas = {
    larga: v.length >= 10,
    mayus: /[A-Z]/.test(v),
    minus: /[a-z]/.test(v),
    digito: /\d/.test(v)
  };
  reglas.forEach(li => {
    li.dataset.cumplida = cumplidas[li.dataset.regla] ? "1" : "0";
  });
  const total = Object.values(cumplidas).filter(Boolean).length;
  let nivel = 0;
  let texto = "Sin contraseña todavía";
  if (v !== "") {
    if (total <= 1) { nivel = 1; texto = "Muy débil, fácil de adivinar"; }
    else if (total === 2) { nivel = 2; texto = "Débil, añade más variedad"; }
    else if (total === 3) { nivel = 3; texto = "Buena, ya es utilizable"; }
    else { nivel = 4; texto = "Excelente, resiste muy bien"; }
  }
  medidor.dataset.nivel = String(nivel);
  claveTexto.textContent = texto;
}

el("clave").addEventListener("input", medirClave);
el("clave").addEventListener("input", () => {
  const env = el("clave").closest(".campo");
  if (env.dataset.estado === "ok") pintar(CAMPOS.find(f => f.id === "clave"));
});

const verClave = el("verClave");
verClave.addEventListener("click", () => {
  const activo = verClave.getAttribute("aria-pressed") === "true";
  verClave.setAttribute("aria-pressed", activo ? "false" : "true");
  verClave.setAttribute("aria-label", activo ? "Mostrar contrasena" : "Ocultar contrasena");
  el("clave").type = activo ? "password" : "text";
  el("clave").focus();
});

btnAtras.addEventListener("click", () => {
  if (paso > 1) mostrar(paso - 1);
});

btnContinuar.addEventListener("click", e => {
  e.preventDefault();
  const primero = validarPanel(paso);
  if (primero) {
    mostrarResumen(paso);
    primero.focus();
    return;
  }
  resumenError.hidden = true;
  if (paso < TOTAL) {
    mostrar(paso + 1);
  } else {
    completar();
  }
});

const casillas = Array.from(document.querySelectorAll("#casillas input"));

function repintarOTP() {
  casillas.forEach(c => c.classList.toggle("llena", c.value !== ""));
}

casillas.forEach((c, i) => {
  c.addEventListener("input", () => {
    c.value = c.value.replace(/\D/g, "").slice(0, 1);
    repintarOTP();
    if (c.value !== "" && i < casillas.length - 1) casillas[i + 1].focus();
    const campo = CAMPOS.find(f => f.id === "otp");
    if (document.querySelector(".campo-otp").dataset.estado === "error") pintar(campo);
  });

  c.addEventListener("keydown", e => {
    if (e.key === "Backspace" && c.value === "" && i > 0) {
      casillas[i - 1].value = "";
      casillas[i - 1].focus();
      repintarOTP();
    }
    if (e.key === "ArrowLeft" && i > 0) casillas[i - 1].focus();
    if (e.key === "ArrowRight" && i < casillas.length - 1) casillas[i + 1].focus();
  });

  c.addEventListener("paste", e => {
    e.preventDefault();
    const pegado = (e.clipboardData || window.clipboardData).getData("text").replace(/\D/g, "");
    for (let k = 0; k < pegado.length && i + k < casillas.length; k++) {
      casillas[i + k].value = pegado[k];
    }
    repintarOTP();
    const siguiente = Math.min(i + pegado.length, casillas.length - 1);
    casillas[siguiente].focus();
  });
});

const btnReenviar = el("reenviar");
const cuenta = el("cuenta");
let restante = 0;
let reloj = null;

function arrancarCuentaAtras(seg) {
  restante = seg;
  btnReenviar.disabled = true;
  btnReenviar.textContent = "Reenviar codigo";
  if (reloj) clearInterval(reloj);
  reloj = setInterval(() => {
    restante -= 1;
    if (restante <= 0) {
      clearInterval(reloj);
      reloj = null;
      cuenta.textContent = "Puedes pedir otro codigo cuando quieras";
      btnReenviar.disabled = false;
    } else {
      cuenta.textContent = "Podras reenviar en " + restante + " s";
    }
  }, 1000);
}

btnReenviar.addEventListener("click", () => {
  arrancarCuentaAtras(45);
});

function completar() {
  const codigo = "NB-" + String(Math.floor(100000 + Math.random() * 900000));
  const hoy = new Date();
  const fecha = hoy.getDate().toString().padStart(2, "0") + "/" +
    (hoy.getMonth() + 1).toString().padStart(2, "0") + "/" + hoy.getFullYear();
  el("listoId").textContent = codigo;
  el("listoFecha").textContent = fecha + " a las " + hoy.getHours().toString().padStart(2, "0") + ":" +
    hoy.getMinutes().toString().padStart(2, "0");
  const nombre = el("nombre").value.trim();
  el("listoTexto").textContent = "Listo, " + nombre + ". Ya puedes entrar con " +
    el("correo").value.trim() + ".";
  form.hidden = true;
  document.querySelector(".barra").hidden = true;
  listo.hidden = false;
  listo.focus();
  if (reloj) clearInterval(reloj);
}

el("otra").addEventListener("click", () => {
  form.reset();
  form.hidden = false;
  document.querySelector(".barra").hidden = false;
  listo.hidden = true;
  CAMPOS.forEach(f => {
    const env = f.tipo === "otp"
      ? document.querySelector(".campo-otp")
      : el(f.id).closest(".campo");
    env.dataset.estado = "neutro";
    el(f.id + "-error") && (el(f.id + "-error").textContent = "");
    el("otp-error").textContent = "";
  });
  casillas.forEach(c => { c.value = ""; });
  repintarOTP();
  medirClave();
  reglas.forEach(li => { li.dataset.cumplida = "0"; });
  mostrar(1);
  el("nombre").focus();
});

form.addEventListener("submit", e => e.preventDefault());

mostrar(1);
arrancarCuentaAtras(0);
btnReenviar.disabled = false;
