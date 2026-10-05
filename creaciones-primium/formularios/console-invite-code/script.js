const form = document.getElementById("form");
const registro = document.getElementById("registro");
const reloj = document.getElementById("sesion");
const pegar = document.getElementById("pegar");
const codigo = document.getElementById("codigo");
const resumenError = document.getElementById("resumenError");
const listaError = document.getElementById("resumenLista");
const tituloError = document.getElementById("resumenTitulo");
const sello = document.getElementById("sello");
const terminal = document.querySelector(".terminal");

const FORMATO = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
const PLANES = ["bench", "studio", "atelier"];

const CAMPOS = [
  {
    id: "codigo",
    etiqueta: "Invite code",
    vacio: "The code is empty. Paste the twelve characters from the invitation mail.",
    error: "That is not a code shape we know. It should read XXXX-XXXX-XXXX.",
    anulada: "This code was cancelled or already redeemed. Ask the sender for a fresh one.",
    prueba: v => FORMATO.test(v) && v.slice(0, 4) !== "VOID"
  },
  {
    id: "correo",
    etiqueta: "Seat holder email",
    vacio: "We need an address so the seat has an owner.",
    error: "That address will not bounce back. Check for a typo in the domain.",
    prueba: v => /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(v)
  },
  {
    id: "plan",
    etiqueta: "Seat type",
    vacio: "Choose one of the three seat types.",
    error: "That seat type is not on the list.",
    prueba: v => PLANES.includes(v)
  },
  {
    id: "condiciones",
    etiqueta: "Seat terms",
    vacio: "The seat terms have to be accepted before we can open the seat.",
    error: "That value is not valid.",
    prueba: () => el("condiciones").checked
  }
];

function el(id) { return document.getElementById(id); }

function valorCampo(f) {
  if (f.id === "condiciones") return el("condiciones").checked ? "si" : "no";
  return el(f.id).value.trim();
}

function textoError(f) {
  const valor = valorCampo(f);
  if (f.id === "codigo") {
    if (valor === "") return f.vacio;
    if (!FORMATO.test(valor)) return f.error;
    if (valor.slice(0, 4) === "VOID") return f.anulada;
  }
  return valor === "" ? f.vacio : f.error;
}

function pintar(f) {
  const control = el(f.id);
  const env = control.closest(".campo");
  const ayuda = el(f.id + "-ayuda");
  const mensaje = el(f.id + "-error");
  const malo = !f.prueba(valorCampo(f));
  const desc = [ayuda.id];

  if (malo) {
    env.dataset.estado = "error";
    control.setAttribute("aria-invalid", "true");
    desc.push(mensaje.id);
    mensaje.textContent = textoError(f);
  } else {
    env.dataset.estado = "ok";
    control.setAttribute("aria-invalid", "false");
    mensaje.textContent = "";
  }
  control.setAttribute("aria-describedby", desc.join(" "));
  return malo;
}

function problemas() {
  return CAMPOS.filter(f => !f.prueba(valorCampo(f)));
}

function pintarTodo() {
  let primero = null;
  CAMPOS.forEach(f => {
    const fallo = pintar(f);
    if (fallo && !primero) primero = el(f.id);
  });
  return primero;
}

function marcar(marca, texto, clase) {
  const p = document.createElement("p");
  p.className = "fila " + clase;
  const m = document.createElement("span");
  m.className = "marca";
  m.textContent = marca;
  const t = document.createElement("span");
  t.textContent = texto;
  p.appendChild(m);
  p.appendChild(t);
  registro.appendChild(p);
  registro.scrollTop = registro.scrollHeight;
  while (registro.children.length > 40) registro.firstChild.remove();
  return p;
}

function relojCorrido() {
  const base = 11 * 3600 + 42 * 60 + 8;
  const total = base + Math.floor(Date.now() / 1000) % 3600;
  const dos = n => String(n).padStart(2, "0");
  reloj.textContent = "session " + dos(Math.floor(total / 3600) % 24) + ":" +
    dos(Math.floor(total / 60) % 60) + ":" + dos(total % 60);
}

let ultimoEstado = "neutro";

codigo.addEventListener("input", () => {
  const limpio = codigo.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
  let salida = limpio.slice(0, 4);
  if (limpio.length > 4) salida += "-" + limpio.slice(4, 8);
  if (limpio.length > 8) salida += "-" + limpio.slice(8, 12);
  codigo.value = salida;
  pintar(CAMPOS[0]);
  if (ultimoEstado !== "ok" && !CAMPOS[0].prueba(salida)) {
    ultimoEstado = "neutro";
    return;
  }
  if (ultimoEstado !== "ok" && CAMPOS[0].prueba(salida)) {
    ultimoEstado = "ok";
    marcar("ok", "shape accepted for " + salida + ". Checking the broker...", "fila-ok");
  }
});

pegar.addEventListener("click", () => {
  if (!navigator.clipboard || !navigator.clipboard.readText) {
    marcar("..", "this browser will not hand over the clipboard, type the code instead.", "fila-info");
    codigo.focus();
    return;
  }
  navigator.clipboard.readText().then(texto => {
    const limpio = texto.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
    if (limpio.length === 0) {
      marcar("xx", "clipboard holds no invite code.", "fila-error");
      codigo.focus();
      return;
    }
    codigo.value = limpio;
    codigo.dispatchEvent(new Event("input"));
    marcar(">>", "pasted " + limpio.length + " characters from the clipboard.", "fila-info");
    pintar(CAMPOS[0]);
  }, () => {
    marcar("..", "the clipboard was refused, type the code instead.", "fila-info");
    codigo.focus();
  });
  codigo.focus();
});

codigo.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    codigo.value = "";
    pintar(CAMPOS[0]);
    ultimoEstado = "neutro";
    marcar("..", "code buffer cleared with the Escape key.", "fila-info");
  }
});

CAMPOS.forEach(f => {
  const control = el(f.id);
  control.addEventListener("blur", () => pintar(f));
  control.addEventListener("change", () => pintar(f));
  control.addEventListener("input", () => {
    if (f.id === "codigo") return;
    if (control.closest(".campo").dataset.estado === "error") pintar(f);
  });
});

el("condiciones").addEventListener("change", () => pintar(CAMPOS[3]));

form.addEventListener("submit", e => {
  e.preventDefault();
  const primero = pintarTodo();
  const fallos = problemas();
  marcar(">>", "running: invites redeem --code " + (codigo.value.trim() || "--code"), "fila-info");

  if (fallos.length > 0) {
    tituloError.textContent = fallos.length === 1
      ? "Redemption halted by one pending field"
      : "Redemption halted by " + fallos.length + " pending fields";
    listaError.innerHTML = "";
    fallos.forEach(f => {
      const li = document.createElement("li");
      li.textContent = f.etiqueta + ": " + textoError(f);
      listaError.appendChild(li);
    });
    resumenError.hidden = false;
    marcar("xx", "refused by the broker. The lines in red need another pass.", "fila-error");
    if (primero) primero.focus();
    return;
  }

  resumenError.hidden = true;
  const usados = Math.min(3, Number(el("intentos").dataset.usados || 0) + 1);
  el("intentos").dataset.usados = String(usados);
  el("intentos").textContent = "Attempts used: " + usados + " of 3";

  const planTexto = el("plan").options[el("plan").selectedIndex].text;
  const planCorto = planTexto.split(",")[0];
  marcar("in", "code " + codigo.value.trim() + " found in the broker ledger.", "fila-info");
  marcar("ok", "seat " + planCorto.toLowerCase() + " opened. Binding to " + correo.value.trim() + ".", "fila-ok");

  el("selloCodigo").textContent = codigo.value.trim();
  el("selloPlan").textContent = planCorto;
  el("selloCorreo").textContent = correo.value.trim();
  el("selloSerial").textContent = "IV-" + String(Math.floor(100000 + Math.random() * 900000));
  el("selloTexto").textContent = "The " + planCorto.toLowerCase() +
    " seat is open on this browser. We sent the boarding pass to " +
    correo.value.trim() + ".";

  terminal.hidden = true;
  sello.hidden = false;
  sello.focus();
});

el("otra").addEventListener("click", () => {
  sello.hidden = true;
  terminal.hidden = false;
  form.reset();
  CAMPOS.forEach(f => {
    const control = el(f.id);
    control.closest(".campo").dataset.estado = "neutro";
    control.setAttribute("aria-invalid", "false");
    control.setAttribute("aria-describedby", f.id + "-ayuda");
    el(f.id + "-error").textContent = "";
  });
  resumenError.hidden = true;
  ultimoEstado = "neutro";
  marcar("..", "cleared. A new code can be entered on the same terminal.", "fila-info");
  codigo.focus();
});

terminal.addEventListener("keydown", e => {
  if (e.key === "Enter" && e.target.tagName !== "BUTTON") {
    e.preventDefault();
    form.requestSubmit();
  }
});

relojCorrido();
window.setInterval(relojCorrido, 1000);
marcar("..", "clipboard watcher armed. Type a code or use the paste key.", "fila-info");
