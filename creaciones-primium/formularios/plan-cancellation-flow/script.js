const form = document.getElementById("form");
const hilo = document.getElementById("hilo");
const cierre = document.getElementById("cierre");
const estadoAgente = document.getElementById("estadoAgente");

let etapa = 1;
let restante = 598;
let reloj = null;

const MOTIVOS = ["Me está resultando caro", "No lo uso lo suficiente", "Ha dado fallos o errores",
  "Los contenidos no son los que busco", "Solo quiero pausar unos meses", "Otro motivo"];

const CAMPOS = [
  {
    id: "motivo",
    etiqueta: "Motivo de la baja",
    vacio: "Elige un motivo. Puedes cancelar igual, pero nos ayuda mucho saberlo.",
    error: "Ese motivo no está en la lista.",
    prueba: v => MOTIVOS.includes(v),
    etapa: 1
  },
  {
    id: "detalle",
    etiqueta: "Comentario",
    vacio: "Escríbenos un par de líneas sobre lo que pasó.",
    error: "Entre 10 y 300 caracteres.",
    prueba: v => v.length >= 10 && v.length <= 300,
    etapa: 1
  },
  {
    id: "oferta",
    etiqueta: "Aceptación de la oferta",
    vacio: "Dinos si quieres aprovechar el descuento o prefieres cancelar.",
    error: "Esa opción de la oferta no es válida.",
    prueba: v => v === "Acepto la oferta" || v === "Prefiero cancelar",
    etapa: 2
  },
  {
    id: "cierre",
    etiqueta: "Confirmación final",
    vacio: "Confirma si quieres dar de baja la suscripción o mantenerla.",
    error: "Esa opción de cierre no es válida.",
    prueba: v => v === "Confirmo la baja definitiva" || v === "Mejor me quedo con la suscripción",
    etapa: 3
  },
  {
    id: "correo",
    etiqueta: "Correo para el justificante",
    vacio: "Necesitamos un correo para enviarte el justificante de baja.",
    error: "Revisa el formato: nombre@dominio.com",
    prueba: v => /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(v),
    etapa: 3
  }
];

function el(id) { return document.getElementById(id); }

function valorCampo(f) {
  if (f.etapa === 1 && f.id === "motivo") {
    const m = form.querySelector('input[name="motivo"]:checked');
    return m ? m.value : "";
  }
  if (f.id === "oferta") {
    const m = form.querySelector('input[name="oferta"]:checked');
    return m ? m.value : "";
  }
  if (f.id === "cierre") {
    const m = form.querySelector('input[name="cierre"]:checked');
    return m ? m.value : "";
  }
  return el(f.id).value.trim();
}

function referencia(f) {
  if (f.id === "motivo") return el("motivo_precio");
  if (f.id === "oferta") return el("oferta_si");
  if (f.id === "cierre") return el("cierre_baja");
  return el(f.id);
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

function camposDe(n) {
  return CAMPOS.filter(f => f.etapa === n);
}

function verEtapa(n) {
  etapa = n;
  document.querySelectorAll(".etapa").forEach(e => {
    e.hidden = Number(e.dataset.etapa) !== n;
  });
  estadoAgente.textContent = n === 1 ? "Ana, te escuchamos" : n === 2 ? "Te propongo una alternativa" : "Último paso, con calma";
  if (reloj) {
    clearInterval(reloj);
    reloj = null;
  }
  if (n === 2) arrancarCuenta();
}

function turno(texto) {
  const art = document.createElement("article");
  art.className = "turno turno-agente";
  const av = document.createElement("span");
  av.className = "avatar-agente";
  av.setAttribute("aria-hidden", "true");
  av.textContent = "N";
  const ficha = document.createElement("div");
  ficha.className = "ficha";
  const p = document.createElement("p");
  p.textContent = texto;
  ficha.appendChild(p);
  art.appendChild(av);
  art.appendChild(ficha);
  hilo.appendChild(art);
  hilo.scrollIntoView({ block: "end" });
}

function eco(texto) {
  const art = document.createElement("article");
  art.className = "turno turno-agente";
  art.style.opacity = "0.85";
  const av = document.createElement("span");
  av.className = "avatar-agente";
  av.setAttribute("aria-hidden", "true");
  av.textContent = "T";
  av.style.background = "linear-gradient(150deg, #f7eaea, #c8a9a9)";
  const ficha = document.createElement("div");
  ficha.className = "ficha";
  ficha.style.borderLeftColor = "var(--papel)";
  const p = document.createElement("p");
  p.textContent = texto;
  ficha.appendChild(p);
  art.appendChild(av);
  art.appendChild(ficha);
  hilo.appendChild(art);
  hilo.scrollIntoView({ block: "end" });
}

function problemas(n) {
  return camposDe(n).filter(f => !f.prueba(valorCampo(f)));
}

function mostrarResumen(n) {
  const fallos = problemas(n);
  const caja = n === 3 ? el("resumenError3") : el("resumenError");
  const lista = n === 3 ? el("resumenErrorLista3") : el("resumenErrorLista");
  if (fallos.length === 0) {
    caja.hidden = true;
    return;
  }
  lista.innerHTML = "";
  fallos.forEach(f => {
    const li = document.createElement("li");
    li.textContent = f.etiqueta + ": " + (valorCampo(f) === "" ? f.vacio : f.error);
    lista.appendChild(li);
  });
  caja.hidden = false;
}

CAMPOS.forEach(f => {
  if (f.etapa > 1) {
    const ids = f.id === "oferta" ? ["oferta_si", "oferta_no"] : f.id === "cierre" ? ["cierre_baja", "cierre_quedo"] : null;
    if (ids) {
      ids.forEach(id => {
        el(id).addEventListener("blur", () => pintar(f));
        el(id).addEventListener("change", () => pintar(f));
      });
    } else {
      el(f.id).addEventListener("blur", () => pintar(f));
      el(f.id).addEventListener("input", () => {
        if (el(f.id).closest(".campo").dataset.estado === "error") pintar(f);
      });
    }
    return;
  }
  // `motivo` no tiene un control unico: es un grupo de radios y sus miembros
  // se enlazan mas abajo, asi que aqui no hay nada que registrar.
  const control = el(f.id);
  if (!control) return;
  control.addEventListener("blur", () => pintar(f));
  control.addEventListener("input", () => {
    if (control.closest(".campo").dataset.estado === "error") pintar(f);
  });
});

["motivo_precio", "motivo_uso", "motivo_fallos", "motivo_contenidos", "motivo_pausa", "motivo_otro"].forEach(id => {
  el(id).addEventListener("change", () => pintar(CAMPOS[0]));
  el(id).addEventListener("blur", () => pintar(CAMPOS[0]));
});

function arrancarCuenta() {
  const dos = n => String(n).padStart(2, "0");
  const tic = () => {
    restante -= 1;
    if (restante <= 0) {
      restante = 0;
      clearInterval(reloj);
      reloj = null;
      el("ofertaCuenta").textContent = "La oferta ha caducado, pero podemos hablarlo";
      return;
    }
    el("ofertaCuenta").textContent = "La oferta caduca en " + dos(Math.floor(restante / 60)) + ":" + dos(restante % 60);
  };
  el("ofertaCuenta").textContent = "La oferta caduca en 09:58";
  reloj = setInterval(tic, 1000);
}

function fechaLegible(d) {
  const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio",
    "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  return d.getDate() + " de " + meses[d.getMonth()] + " de " + d.getFullYear();
}

function completar(titulo, texto, nota) {
  const hasta = new Date();
  hasta.setMonth(hasta.getMonth() + 1);
  el("cierreTitulo").textContent = titulo;
  el("cierreTexto").textContent = texto;
  el("cSocia").textContent = el("correo").value.trim() || "sin definir";
  el("cPlan").textContent = "Editorial · 8,50 € al mes";
  el("cMotivo").textContent = valorCampo(CAMPOS[0]);
  el("cHasta").textContent = fechaLegible(hasta);
  el("cRef").textContent = "BA-" + String(Math.floor(100000 + Math.random() * 900000));
  el("cVuelve").textContent = "hasta el 31 de diciembre de 2028";
  el("cierreNota").textContent = nota;
  document.querySelectorAll(".etapa").forEach(e => { e.hidden = true; });
  form.hidden = true;
  cierre.hidden = false;
  cierre.focus();
}

form.addEventListener("submit", e => {
  e.preventDefault();
  camposDe(etapa).forEach(pintar);
  const fallos = problemas(etapa);

  if (fallos.length > 0) {
    mostrarResumen(etapa);
    referencia(fallos[0]).focus();
    return;
  }

  mostrarResumen(etapa);

  if (etapa === 1) {
    const motivo = valorCampo(CAMPOS[0]);
    eco("Motivo indicado: " + motivo.toLowerCase() + ".");
    const respuestas = {
      "Me está resultando caro": "Gracias por decirlo sin rodeos. El precio es la razón más común y la mejor solución es bajarlo, que es justo lo que te propongo ahora.",
      "No lo uso lo suficiente": "Entendido, y tiene todo el sentido. Si el problema es de ritmo, la pausa o el descuento te puede servir mucho más que cancelar.",
      "Ha dado fallos o errores": "Siento mucho oír eso. Cuéntanos qué pasó, porque es justo lo que queremos arreglar y no podemos hacerlo si te vas sin decirlo.",
      "Los contenidos no son los que busco": "Acepto la crítica. Podemos probar dos meses a mitad de precio para que veas si el formato te encaja antes de decidir.",
      "Solo quieres pausar unos meses": "Entonces no te la quites: la pausa resuelve exactamente lo que me dices y no pierdes tu número de socia.",
      "Otro motivo": "Gracias por contarlo. Si el motivo es otro, dime cuál y buscamos una solución que te encaje."
    };
    turno(respuestas[motivo] || respuestas["Otro motivo"]);
    verEtapa(2);
    el("motivo_precio").focus();
    return;
  }

  if (etapa === 2) {
    if (valorCampo(CAMPOS[2]) === "Acepto la oferta") {
      turno("Aplico el descuento ahora mismo: dos meses a 4,25 € y luego volvemos al precio habitual. No tienes que hacer nada más.");
      eco("Vale, me quedo con el descuento. Gracias.");
      turno("Perfecto. Tu plan sigue activo con el 50 % durante dos meses y te avisamos por correo antes de que vuelva al precio normal. Gracias por contarlo con tan detalle, nos sirve muchísimo.");
      completar(
        "Descuento aplicado",
        "No se ha tocado tu forma de pago y el plan sigue activo hasta el final de tu periodo actual.",
        "Puedes dejar el descuento o cancelarlo en cualquier momento desde tu perfil, sin hablar con nadie."
      );
      el("cPlan").textContent = "Editorial · 4,25 € al mes durante dos meses";
      el("cHasta").textContent = "descuento hasta el " + fechaLegible(new Date(Date.now() + 60 * 86400000));
      el("cVuelve").textContent = "el descuento caduca el " + fechaLegible(new Date(Date.now() + 60 * 86400000));
      return;
    }
    turno("Entendido, sin problema. Vamos con la baja, y te acompaño hasta el final para que no te lleves sorpresas.");
    verEtapa(3);
    el("cierre_baja").focus();
    return;
  }

  if (valorCampo(CAMPOS[3]) === "Mejor me quedo con la suscripción") {
    turno("Entonces lo dejamos todo como estaba y se acabó el proceso. Gracias por contarlo: leer lo que has escrito nos ayuda mucho a mejorar el producto.");
    completar(
      "Suscripción mantenida",
      "No se ha modificado nada en tu cuenta ni en tu forma de pago.",
      "Tu comentario ha llegado al equipo de producto y se revisa a mano, una por una."
    );
    el("cPlan").textContent = "Editorial · 8,50 € al mes, sin cambios";
    return;
  }

  turno("Confirmado. Doy de baja la suscripción y bloqueo cualquier intento de cobro a partir de ahora mismo. Gracias por contarlo con tan detalle.");
  completar(
    "Suscripción cancelada",
    "No se cobra ningún importe adicional. Tu último periodo ya estaba pagado.",
    "Puedes volver a suscribirte cuando quieras con el mismo correo. Tus reseñas y comentarios se quedan guardados."
  );
});

el("irFinal").addEventListener("click", () => {
  el("oferta_no").checked = true;
  turno("Sin problema, te salto la oferta. Vamos directos al cierre.");
  verEtapa(3);
  el("cierre_baja").focus();
});

el("volver").addEventListener("click", () => {
  form.reset();
  form.hidden = false;
  cierre.hidden = true;
  while (hilo.querySelectorAll(".turno").length > 1) hilo.lastElementChild.remove();
  CAMPOS.forEach(f => {
    const env = referencia(f).closest(".campo");
    env.dataset.estado = "neutro";
    const control = referencia(f);
    control.removeAttribute("aria-invalid");
    control.setAttribute("aria-describedby", f.id + "-ayuda");
    el(f.id + "-error").textContent = "";
  });
  el("resumenError").hidden = true;
  el("resumenError3").hidden = true;
  verEtapa(1);
  el("motivo_precio").focus();
});
