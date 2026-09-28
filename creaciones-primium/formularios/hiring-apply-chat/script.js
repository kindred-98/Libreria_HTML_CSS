const form = document.getElementById("form");
const hilo = document.getElementById("hilo");
const pasoEl = document.getElementById("paso");
const btnAtras = document.getElementById("atras");
const btnEnviar = document.getElementById("enviar");
const textoEnviar = document.getElementById("enviarTexto");
const pista = document.getElementById("pista");
const resumenError = document.getElementById("resumenError");
const listaError = document.getElementById("resumenLista");
const tituloError = document.getElementById("resumenTitulo");
const pasosEl = document.getElementById("pasos");
const medidor = document.getElementById("medidor");
const medidorRelleno = document.getElementById("medidorRelleno");
const firmada = document.getElementById("firmada");
const chatPunto = document.getElementById("chatPunto");
const chatReloj = document.getElementById("chatReloj");

const PUESTO = "Senior front end engineer";
const TRAMOS = ["Tuesday 10:00", "Wednesday 14:00", "Thursday 11:30"];
const TIRADOS = ["mailinator.com", "guerrillamail.com", "tempmail.example", "yopmail.com"];

const PASOS = [
  {
    id: "nombre",
    etiqueta: "Name",
    titulo: "First, who am I writing to?",
    nota: "The name you want on the offer letter, and the one that goes on the interview badge.",
    control: "texto",
    idCampo: "nombreCampo",
    etiquetaCampo: "Full name",
    micro: "Between 3 and 40 characters. The name on your passport is the safest one to use.",
    placeholder: "Rowan Ellis",
    ayuda: "Two names, one space is plenty, no titles needed."
  },
  {
    id: "correo",
    etiqueta: "Email",
    titulo: "And an address the offer can go to?",
    nota: "This is where the interview link and the decision land. Nowhere else.",
    control: "texto",
    idCampo: "correoCampo",
    etiquetaCampo: "Email address",
    micro: "It has to look like name@domain.tld and cannot be a throwaway inbox.",
    placeholder: "rowan@studio.example",
    ayuda: "Try kate@ or name@mailinator.com to watch it fail."
  },
  {
    id: "puesto",
    etiqueta: "Role",
    titulo: "You are applying for " + PUESTO + ". Still want it?",
    nota: "A yes here is a yes, and it saves us both a thread later. A no is genuinely fine.",
    control: "opciones",
    ayuda: "Two buttons, no free text. If the role is wrong, say so and we will look elsewhere."
  },
  {
    id: "anos",
    etiqueta: "Experience",
    titulo: "How many years have you shipped front end code?",
    nota: "Count the years where somebody paid you to do it, not the years you were learning.",
    control: "opciones",
    ayuda: "Bands, not a number. Nobody expects you to be exact."
  },
  {
    id: "pila",
    etiqueta: "Stack",
    titulo: "Which of these do you actually maintain?",
    nota: "Tick everything you would be comfortable being paged about at seven on a Friday evening.",
    control: "multi",
    ayuda: "At least two. A single tick is a thin application."
  },
  {
    id: "motivacion",
    etiqueta: "Why us",
    titulo: "Say one true thing about why this role, not the company.",
    control: "texto-largo",
    idCampo: "motivacionCampo",
    etiquetaCampo: "Your reason",
    micro: "Between 80 and 500 characters. Skip the part about the mission statement.",
    placeholder: "Optional: what is broken here that you would like to fix",
    ayuda: "Eighty characters at the very least, and the screener is a person with a coffee."
  },
  {
    id: "revision",
    etiqueta: "Review",
    titulo: "That is everything. Read it back, then sign.",
    control: "revision",
    ayuda: "Anything can still be changed with the button next to it."
  }
];

const OPCIONES = {
  puesto: [
    { clave: "si", texto: "Yes, still want it" },
    { clave: "otro", texto: "No, wrong role for me" }
  ],
  anos: [
    { clave: "j", texto: "Under two years" },
    { clave: "m", texto: "Two to five years" },
    { clave: "l", texto: "Five to ten years" },
    { clave: "x", texto: "More than ten years" }
  ]
};

const PILA = ["TypeScript", "React", "Design systems", "Web performance", "Accessibility", "Build tooling"];

const st = {
  indice: 0,
  nombre: "",
  correo: "",
  puesto: "",
  anos: "",
  pila: [],
  motivacion: "",
  leido: false,
  firmado: false
};

function el(id) { return document.getElementById(id); }

function nodo(etiqueta, clase, texto) {
  const n = document.createElement(etiqueta);
  if (clase) n.className = clase;
  if (texto !== undefined) n.textContent = texto;
  return n;
}

function citados() {
  const salida = [];
  if (st.nombre !== "") salida.push(st.nombre);
  return salida.length === 0 ? "Someone new" : salida[0];
}

function refAplicacion() {
  return "NG-" + String(Math.floor(1000 + Math.random() * 8999));
}

function anadirMsg(quien, texto) {
  const div = nodo("div", "msg msg--" + (quien === "ella" ? "ella" : "yo"));
  div.appendChild(nodo("span", "msg__quien", quien === "ella" ? "Marta" : citados()[0]));
  div.appendChild(document.createTextNode(texto));
  hilo.appendChild(div);
  hilo.scrollTop = hilo.scrollHeight;
  return div;
}

function anadirNota(texto) {
  hilo.appendChild(nodo("div", "msg msg--nota", texto));
  hilo.scrollTop = hilo.scrollHeight;
}

function textoDe(id) {
  if (id === "puesto") return OPCIONES.puesto.filter(o => o.clave === st.puesto).map(o => o.texto)[0] || "";
  if (id === "anos") return OPCIONES.anos.filter(o => o.clave === st.anos).map(o => o.texto)[0] || "";
  if (id === "pila") return PILA.filter(p => st.pila.indexOf(p) !== -1).join(", ");
  return st[id];
}

function pintaPasos() {
  pasosEl.innerHTML = "";
  PASOS.forEach((p, i) => {
    const li = document.createElement("li");
    const respondido = i < st.indice || (i === st.indice && p.control === "revision");
    li.dataset.estado = i === st.indice ? "activo" : (respondido ? "hecho" : "pendiente");
    const pt = nodo("span", "paso-pt");
    pt.appendChild(nodo("span", null, String(i + 1)));
    li.appendChild(pt);
    li.appendChild(nodo("span", null, p.etiqueta));
    pasosEl.appendChild(li);
  });

  const p = Math.round((st.indice / (PASOS.length - 1)) * 100);
  medidorRelleno.style.transform = "scaleX(" + (p / 100) + ")";
  medidor.setAttribute("aria-valuenow", String(p));
  medidor.setAttribute("aria-valuetext", p + " per cent of the application done");
  el("expTitulo").textContent = st.indice + " of " + (PASOS.length - 1);
  el("expPct").textContent = p + "%";
}

function campoEnv(idCampo) {
  const n = el(idCampo);
  return n ? n.closest(".campo") : null;
}

function esGrupo(idCampo) {
  return idCampo === "puestoFichas" || idCampo === "anosFichas" || idCampo === "pilaFichas";
}

function pintarCampo(idCampo, mala, mensaje) {
  const env = campoEnv(idCampo);
  if (!env) return;
  const grupo = esGrupo(idCampo);
  const control = el(idCampo);
  const ayuda = el(idCampo + "-ayuda");
  const err = el(idCampo + "-err");
  if (!control || !ayuda || !err) return;
  const desc = [ayuda.id];
  if (mala) {
    env.dataset.estado = "error";
    desc.push(err.id);
    err.textContent = mensaje;
    control.setAttribute("aria-invalid", "true");
  } else {
    env.dataset.estado = "ok";
    err.textContent = "";
    control.setAttribute("aria-invalid", "false");
  }
  if (grupo) env.setAttribute("aria-describedby", desc.join(" "));
  else control.setAttribute("aria-describedby", desc.join(" "));
}

function Fallos(p) {
  const salida = [];
  if (p.control === "texto" || p.control === "texto-largo") {
    const v = st[p.id].trim();
    if (v === "") {
      salida.push({ campo: p.idCampo, mensaje: p.ayuda });
    } else if (p.id === "nombre" && (v.length < 3 || v.length > 40 || !/[A-Za-zÀ-ÿ]{2}/.test(v))) {
      salida.push({ campo: p.idCampo, mensaje: "Between three and forty characters, and at least two letters. The badge printer has a limit too." });
    } else if (p.id === "correo" && !/^[^\s@,;]+@[^\s@,;]+\.[A-Za-z]{2,}$/.test(v)) {
      salida.push({ campo: p.idCampo, mensaje: "That is not the shape name@domain.tld the mail server expects." });
    } else if (p.id === "correo" && TIRADOS.indexOf(v.split("@")[1].toLowerCase()) > -1) {
      salida.push({ campo: p.idCampo, mensaje: v.split("@")[1] + " is a throwaway inbox. The offer would bounce before anybody read it." });
    } else if (p.id === "motivacion" && v.length < 80) {
      salida.push({ campo: p.idCampo, mensaje: "Eighty characters at the very least, otherwise there is nothing here to read. Tell me about the work, not the mission statement." });
    } else if (p.id === "motivacion" && v.length > 500) {
      salida.push({ campo: p.idCampo, mensaje: "Five hundred characters is the limit. The rest belongs in the interview." });
    }
  }
  if (p.control === "opciones" && p.id === "puesto" && st.puesto === "") {
    salida.push({ campo: "puestoFichas", mensaje: "Pick one of the two. Both are real answers and neither costs you anything." });
  }
  if (p.control === "opciones" && p.id === "anos" && st.anos === "") {
    salida.push({ campo: "anosFichas", mensaje: "Pick a band. Four options, no wrong one." });
  }
  if (p.control === "multi" && st.pila.length < 2) {
    salida.push({ campo: "pilaFichas", mensaje: "At least two. One tick is a thin application, and this is a front end role." });
  }
  if (p.control === "revision" && !st.leido) {
    salida.push({ campo: "leer", mensaje: "Tick the box that says the answers are yours, otherwise I cannot file it." });
  }
  return salida;
}

function pintar() {
  const p = PASOS[st.indice];
  pasoEl.innerHTML = "";
  resumenError.hidden = true;
  btnAtras.hidden = st.indice === 0;
  textoEnviar.textContent = p.control === "revision" ? "Sign and send" : "Send answer";
  pista.textContent = p.control === "revision"
    ? "Nothing is sent until you press the button."
    : (p.control === "multi" || p.control === "opciones" ? "Chips are the answer. Click, then send." : "Type your answer and press Enter.");
  chatReloj.textContent = p.control === "revision" ? "reading it back" : "typing";

  pasoEl.appendChild(nodo("p", "paso__kicker", "Step " + (st.indice + 1) + " of " + (PASOS.length - 1) + "  " + p.etiqueta));
  pasoEl.appendChild(nodo("h2", "paso__titulo", p.titulo));
  if (p.nota !== undefined) pasoEl.appendChild(nodo("p", "paso__nota", p.nota));

  if (p.control === "texto") montarTexto(p, false);
  if (p.control === "texto-largo") montarTexto(p, true);
  if (p.control === "opciones") montarOpciones(p);
  if (p.control === "multi") montarMulti(p);
  if (p.control === "revision") montarRevision(p);

  pintaPasos();

  const primero = pasoEl.querySelector("input, textarea, button");
  if (primero) primero.focus();
}

function campoNuevo(idCampo, etiqueta, micro) {
  const env = nodo("div", "campo");
  env.dataset.estado = "neutro";
  const lab = nodo("label", null, etiqueta);
  lab.htmlFor = idCampo;
  env.appendChild(lab);
  const ayuda = nodo("p", "ayuda", micro);
  ayuda.id = idCampo + "-ayuda";
  const err = nodo("p", "err");
  err.id = idCampo + "-err";
  err.setAttribute("role", "alert");
  env.appendChild(ayuda);
  env.appendChild(err);
  return env;
}

function montarTexto(p, largo) {
  const env = campoNuevo(p.idCampo, p.etiquetaCampo, p.micro);
  const control = document.createElement(largo ? "textarea" : "input");
  if (largo) control.rows = 4;
  else control.type = "text";
  control.id = p.idCampo;
  control.name = p.idCampo;
  control.maxLength = largo ? 500 : 40;
  control.placeholder = p.placeholder;
  control.spellcheck = false;
  control.autocomplete = p.id === "correo" ? "email" : "name";
  control.value = st[p.id];
  control.setAttribute("aria-describedby", p.idCampo + "-ayuda");
  control.addEventListener("input", () => {
    st[p.id] = control.value;
    const env = campoEnv(p.idCampo);
    if (env.dataset.estado === "error") comprobar();
  });
  control.addEventListener("blur", () => {
    if (st[p.id].trim() !== "") {
      const f = Fallos(p).filter(x => x.campo === p.idCampo);
      pintarCampo(p.idCampo, f.length > 0, f.length > 0 ? f[0].mensaje : "");
    }
  });
  env.insertBefore(control, env.children[1]);
  pasoEl.appendChild(env);
}

function montarOpciones(p) {
  const opciones = OPCIONES[p.id];
  const env = nodo("div", "campo");
  env.id = p.id + "Fichas";
  env.dataset.estado = "neutro";
  env.setAttribute("role", "radiogroup");
  env.setAttribute("aria-labelledby", p.id + "Grupo");
  env.setAttribute("aria-describedby", p.id + "-ayuda");
  env.setAttribute("aria-invalid", "false");

  const titulo = nodo("span", "fichas__etiqueta", p.id === "puesto" ? "Your answer" : "Years of paid front end work");
  titulo.id = p.id + "Grupo";
  env.appendChild(titulo);

  const fichas = nodo("div", "fichas");
  opciones.forEach(o => {
    const ficha = nodo("div", "ficha");
    const input = document.createElement("input");
    input.type = "radio";
    input.name = p.id;
    input.id = p.id + "-" + o.clave;
    input.value = o.clave;
    input.checked = st[p.id] === o.clave;
    input.addEventListener("change", () => {
      st[p.id] = o.clave;
      pintar();
    });

    const txt = nodo("span", "ficha__txt");
    txt.appendChild(nodo("span", "ficha__valor", o.texto));
    ficha.appendChild(input);
    ficha.appendChild(txt);
    fichas.appendChild(ficha);
  });
  env.appendChild(fichas);

  const ayuda = nodo("p", "ayuda", p.ayuda);
  ayuda.id = p.id + "-ayuda";
  const err = nodo("p", "err");
  err.id = p.id + "-err";
  err.setAttribute("role", "alert");
  env.appendChild(ayuda);
  env.appendChild(err);
  pasoEl.appendChild(env);
}

function montarMulti(p) {
  const env = nodo("div", "campo");
  env.id = "pilaFichas";
  env.dataset.estado = "neutro";
  env.setAttribute("role", "group");
  env.setAttribute("aria-labelledby", "pilaGrupo");
  env.setAttribute("aria-describedby", "pila-ayuda");
  env.setAttribute("aria-invalid", "false");

  const titulo = nodo("span", "fichas__etiqueta", "At least two");
  titulo.id = "pilaGrupo";
  env.appendChild(titulo);

  const fichas = nodo("div", "fichas");
  PILA.forEach(item => {
    const ficha = nodo("div", "ficha");
    const input = document.createElement("input");
    input.type = "checkbox";
    input.id = "pila-" + item;
    input.value = item;
    input.checked = st.pila.indexOf(item) !== -1;
    input.addEventListener("change", () => {
      const donde = st.pila.indexOf(item);
      if (input.checked) {
        if (donde === -1) st.pila.push(item);
      } else if (donde !== -1) {
        st.pila.splice(donde, 1);
      }
      pintar();
    });

    const txt = nodo("span", "ficha__txt");
    txt.appendChild(nodo("span", "ficha__valor", item));
    ficha.appendChild(input);
    ficha.appendChild(txt);
    fichas.appendChild(ficha);
  });
  env.appendChild(fichas);

  const ayuda = nodo("p", "ayuda", p.ayuda);
  ayuda.id = "pila-ayuda";
  const err = nodo("p", "err");
  err.id = "pila-err";
  err.setAttribute("role", "alert");
  env.appendChild(ayuda);
  env.appendChild(err);
  pasoEl.appendChild(env);
}

function filaRevision(id, clave, valor) {
  const div = nodo("div", "ficha");
  const txt = nodo("span", "ficha__txt");
  txt.appendChild(nodo("span", "ficha__clave", clave));
  const linea = nodo("span", valor === "" ? "ficha__valor ficha__valor--vacia" : "ficha__valor",
    valor === "" ? "not answered yet" : valor);
  txt.appendChild(linea);
  div.appendChild(txt);

  const boton = nodo("button", "cambiar", "Change");
  boton.type = "button";
  boton.setAttribute("aria-label", "Go back and change " + clave.toLowerCase());
  boton.addEventListener("click", () => {
    st.indice = id;
    pintar();
  });
  div.appendChild(boton);
  return div;
}

function montarRevision(p) {
  const fichas = nodo("div", "fichas");
  PASOS.slice(0, PASOS.length - 1).forEach((q, i) => {
    fichas.appendChild(filaRevision(i, q.etiqueta, textoDe(q.id)));
  });
  pasoEl.appendChild(fichas);

  const caja = nodo("div", "firmar-caixa");
  const input = document.createElement("input");
  input.type = "checkbox";
  input.id = "leer";
  input.checked = st.leido;
  input.addEventListener("change", () => {
    st.leido = input.checked;
    el("leer-err").textContent = "";
  });
  const lab = nodo("label", null, "");
  lab.htmlFor = "leer";
  lab.appendChild(document.createTextNode("Everything above is true and I wrote it. Send it to Marta at Northgate, where it will be read by a person. "));
  const fuerte = nodo("b", null, PUESTO);
  lab.appendChild(fuerte);
  lab.appendChild(document.createTextNode(", hybrid, two days on site."));
  caja.appendChild(input);
  caja.appendChild(lab);
  pasoEl.appendChild(caja);

  const err = nodo("p", "err");
  err.id = "leer-err";
  err.setAttribute("role", "alert");
  pasoEl.appendChild(err);
}

function comprobar() {
  const p = PASOS[st.indice];
  return Fallos(p);
}

function respuestas() {
  if (st.puesto === "otro") {
    return "Not this one, thanks. I have put " + citados() + " back in the pool for something else, no address needed.";
  }
  const partes = [];
  partes.push("I have read " + citados() + " application for " + PUESTO + ".");
  if (st.anos !== "") partes.push("They put " + (OPCIONES.anos.filter(o => o.clave === st.anos).map(o => o.texto)[0] || "").toLowerCase() + " of paid front end work.");
  if (st.pila.length > 0) partes.push("They maintain " + st.pila.join(", ") + ".");
  if (st.motivacion.trim() !== "") partes.push("They wrote: " + st.motivacion.trim());
  partes.push("I will read it myself and answer within three working days.");
  return partes.join(" ");
}

form.addEventListener("submit", e => {
  e.preventDefault();
  const p = PASOS[st.indice];
  const fallos = Fallos(p);

  if (fallos.length > 0) {
    tituloError.textContent = fallos.length === 1
      ? "I cannot move on from this one"
      : "I cannot move on from these " + fallos.length;
    listaError.innerHTML = "";
    fallos.forEach(f => {
      const li = document.createElement("li");
      li.textContent = f.mensaje;
      listaError.appendChild(li);
    });
    resumenError.hidden = false;
    const primero = fallos[0];
    if (primero.campo !== undefined && primero.campo !== "leer") pintarCampo(primero.campo, true, primero.mensaje);
    else if (primero.campo === "leer") el("leer-err").textContent = primero.mensaje;
    const foco = (primero.campo !== undefined && primero.campo !== "leer" ? el(primero.campo) : null) ||
      pasoEl.querySelector("input, textarea");
    if (foco) foco.focus();
    return;
  }

  resumenError.hidden = true;
  chatPunto.dataset.estado = "lee";

  if (p.control === "revision") {
    completar();
    return;
  }

  anadirMsg("ella", respuestas());
  anadirMsg("yo", textoDe(p.id) === "" ? "changed my mind" : textoDe(p.id));
  st.indice += 1;
  st.leido = false;
  pintar();
  anadirMsg("ella", st.indice >= PASOS.length - 1
    ? "That is the lot. Read it back on the screen and sign when it looks right."
    : "Thank you. Next one.");
  pasoEl.scrollIntoView ? window.scrollTo({ top: 0, behavior: "smooth" }) : window.scrollTo(0, 0);
});

btnAtras.addEventListener("click", () => {
  if (st.indice === 0) return;
  st.indice -= 1;
  st.leido = false;
  pintar();
});

function completar() {
  st.firmado = true;
  el("fRef").textContent = refAplicacion();
  el("fPuesto").textContent = PUESTO;
  const tramo = TRAMOS[Math.floor(Math.random() * TRAMOS.length)];
  el("fTramo").textContent = tramo;
  el("fPlazo").textContent = "three working days, " + tramo;
  el("firmadaTitulo").textContent = "Thanks " + citados().split(" ")[0] + ", we have it";
  el("firmadaLead").textContent = "Marta reads every application by hand. A decision lands at " + st.correo.trim() +
    " within three working days, and if it is yes the interview slot goes in the same mail.";

  const lista = el("fPasos");
  lista.innerHTML = "";
  [
    "Your application is filed under " + refAplicacion() + " with no automated screening in the way.",
    "Marta reads it. If the role is not for you, you get that in writing as well.",
    "If it is yes, " + tramo + " is held for you, and the video link is in the same mail.",
    "Nothing else is sent. No newsletter, no talent pool, no follow up sequence."
  ].forEach(t => {
    const li = document.createElement("li");
    li.textContent = t;
    lista.appendChild(li);
  });

  document.querySelector(".escena").hidden = true;
  document.querySelector(".barra").hidden = true;
  document.querySelector(".pie").hidden = true;
  firmada.hidden = false;
  firmada.focus();
  chatPunto.dataset.estado = "lee";
}

el("otra").addEventListener("click", () => {
  st.nombre = "";
  st.correo = "";
  st.puesto = "";
  st.anos = "";
  st.pila = [];
  st.motivacion = "";
  st.leido = false;
  st.indice = 0;
  st.firmado = false;
  hilo.innerHTML = "";
  anadirMsg("ella", "Hello. I am Marta, I lead the front end team here. Seven short questions and we are done. I read all of them myself, so take your time.");
  anadirNota("nothing is sent until you press the sign button");
  firmada.hidden = true;
  document.querySelector(".escena").hidden = false;
  document.querySelector(".barra").hidden = false;
  document.querySelector(".pie").hidden = false;
  chatPunto.dataset.estado = "espera";
  pintar();
});

anadirMsg("ella", "Hello. I am Marta, I lead the front end team here. Seven short questions and we are done. I read all of them myself, so take your time.");
anadirNota("nothing is sent until you press the sign button");
el("caraIniciales").textContent = "MR";
pintar();
