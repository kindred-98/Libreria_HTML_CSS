const form = document.getElementById("form");
const paso = document.getElementById("paso");
const rielPasos = document.getElementById("rielPasos");
const resumenError = document.getElementById("resumenError");
const listaError = document.getElementById("resumenErrorLista");
const tituloError = document.getElementById("resumenErrorTitulo");
const lanzado = document.getElementById("lanzado");

const REPOS = [
  { clave: "monorepo", nombre: "farrow / monorepo", ayuda: "Four apps in one tree, the pipeline builds only what changed." },
  { clave: "api", nombre: "farrow / api-gateway", ayuda: "The gateway, it deploys on its own clock." },
  { clave: "web", nombre: "farrow / web-client", ayuda: "The customer facing client." },
  { clave: "worker", nombre: "farrow / queue-worker", ayuda: "Background jobs, deploys restart in place." }
];

const NODOS = [
  { clave: "20", texto: "Node 20, the long term support line" },
  { clave: "22", texto: "Node 22, current and recommended" },
  { clave: "24", texto: "Node 24, newest, two providers short" }
];

const REGIONES = [
  { clave: "euw3", nombre: "eu-west-3", nota: "London, the primary" },
  { clave: "use1", nombre: "us-east-1", nota: "Virginia" },
  { clave: "apse1", nombre: "ap-south-1", nota: "Mumbai" },
  { clave: "scl1", nombre: "sa-east-1", nota: "Sao Paulo" }
];

const ETAPAS = [
  { nombre: "Checkout and install", nota: "Pulling the commit and restoring the cache" },
  { nombre: "Build and bundle", nota: "Compiling and writing the artefact" },
  { nombre: "Migrate the database", nota: "Applying the pending migrations, one at a time" },
  { nombre: "Canary wave", nota: "Sending the first slice of traffic" },
  { nombre: "Full rollout", nota: "Every region behind the new version" }
];

const st = {
  paso: 0,
  repo: "",
  rama: "",
  commit: "",
  comando: "npm run build",
  nodo: "22",
  instalar: true,
  cache: true,
  entorno: "production",
  secretos: [{ clave: "DATABASE_URL", valor: "" }],
  regiones: [],
  canario: 10,
  salud: "/healthz",
  rollback: false
};

const MAXIMO = [1, 2, 3, 4];

function el(id) { return document.getElementById(id); }

function nodo(etiqueta, clase, texto) {
  const n = document.createElement(etiqueta);
  if (clase) n.className = clase;
  if (texto !== undefined) n.textContent = texto;
  return n;
}

function dos(n) { return String(n).padStart(2, "0"); }

function pintarRiel() {
  rielPasos.innerHTML = "";
  PASOS.forEach((p, i) => {
    const li = document.createElement("li");
    let estado = "espera";
    if (i < st.paso) estado = "hecho";
    else if (i === st.paso) estado = "activo";
    li.dataset.estado = estado;
    const alcanzado = i < st.paso || (i === st.paso);
    li.dataset.navega = alcanzado ? "1" : "0";
    const b = document.createElement("button");
    b.type = "button";
    b.disabled = !alcanzado;
    b.appendChild(nodo("span", "riel__num", dos(i + 1)));
    b.appendChild(nodo("span", null, p.riel));
    b.addEventListener("click", () => {
      if (i === st.paso) return;
      st.paso = i;
      pintarRiel();
      pintarPaso();
      document.querySelector(".hoja").scrollIntoView({ block: "start" });
    });
    li.appendChild(b);
    rielPasos.appendChild(li);
  });
}

const PASOS = [
  {
    riel: "Source",
    titulo: "Where does the code come from",
    intro: "The pipeline pulls one branch and one commit, and it never moves on its own."
  },
  {
    riel: "Build",
    titulo: "How the artefact gets built",
    intro: "Two switches decide whether the run takes forty seconds or four minutes."
  },
  {
    riel: "Secrets",
    titulo: "What the release needs to read",
    intro: "Values are typed into this tab, handed to the runner once, and never shown again."
  },
  {
    riel: "Traffic",
    titulo: "Where the traffic goes and how slowly",
    intro: "The canary slice is the only thing standing between a bad commit and every customer."
  },
  {
    riel: "Review",
    titulo: "Read it back, then launch",
    intro: "Every line below has a Change button that takes you back without clearing a thing."
  }
];

function campo(id, etiqueta, micro, control) {
  const env = nodo("div", "campo");
  env.dataset.estado = "neutro";
  const lab = nodo("label", null, etiqueta);
  lab.htmlFor = id;
  env.appendChild(lab);
  env.appendChild(control);
  const ayuda = nodo("p", "ayuda", micro);
  ayuda.id = id + "-ayuda";
  const err = nodo("p", "err");
  err.id = id + "-err";
  err.setAttribute("role", "alert");
  env.appendChild(ayuda);
  env.appendChild(err);
  control.setAttribute("aria-describedby", ayuda.id);
  return env;
}

function entrada(id, valor, extra) {
  const n = document.createElement("input");
  n.type = "text";
  n.id = id;
  n.spellcheck = false;
  n.maxLength = 80;
  n.value = valor;
  if (extra) for (const k in extra) n.setAttribute(k, extra[k]);
  return n;
}

function lista(id, opciones, vacio) {
  const n = document.createElement("select");
  n.id = id;
  n.appendChild(new Option(vacio, ""));
  opciones.forEach(o => n.appendChild(new Option(o.texto, o.clave)));
  return n;
}

function marca(id, checked, etiqueta, micro) {
  const env = nodo("div", "campo campo--check");
  env.dataset.estado = "neutro";
  const c = document.createElement("input");
  c.type = "checkbox";
  c.id = id;
  c.checked = checked;
  const lab = nodo("label", null, etiqueta);
  lab.htmlFor = id;
  const ayuda = nodo("p", "ayuda", micro);
  ayuda.id = id + "-ayuda";
  const err = nodo("p", "err");
  err.id = id + "-err";
  err.setAttribute("role", "alert");
  c.setAttribute("aria-describedby", ayuda.id);
  env.appendChild(c);
  env.appendChild(lab);
  env.appendChild(ayuda);
  env.appendChild(err);
  return env;
}

function pintarPaso() {
  const i = st.paso;
  el("pasoAntetitulo").textContent = "Step " + (i + 1) + " of 5";
  el("pasoTitulo").textContent = PASOS[i].titulo;
  el("pasoIntro").textContent = PASOS[i].intro;
  el("atras").disabled = i === 0;
  el("atrasTexto").textContent = i === 0 ? "Back" : "Back to " + PASOS[i - 1].riel.toLowerCase();
  el("siguienteTexto").textContent = i === 4 ? "Launch the release" : "Continue";
  el("hojaAviso").textContent = i === 4
    ? "The release goes to the runner as soon as you press the button."
    : "Nothing is sent to the runner until the last step.";
  paso.innerHTML = "";
  resumenError.hidden = true;

  if (i === 0) montarFuente();
  if (i === 1) montarConstruccion();
  if (i === 2) montarSecretos();
  if (i === 3) montarTrafico();
  if (i === 4) montarRevision();
}

function montarFuente() {
  const sel = lista("repoRepo", REPOS, "Choose a repository");
  sel.value = st.repo;
  sel.addEventListener("change", () => { st.repo = sel.value; });
  paso.appendChild(campo("repoRepo", "Repository", "Four repositories, all on the same runner.", sel));

  const rama = entrada("repoRama", st.rama, { placeholder: "main", maxlength: 60, autocapitalize: "off" });
  rama.addEventListener("input", () => { st.rama = rama.value; });
  paso.appendChild(campo("repoRama", "Branch", "The pipeline never follows a moving tag, only a branch or a commit.", rama));

  const commit = entrada("repoCommit", st.commit, { placeholder: "optional pin, 7 to 40 hex characters", maxlength: 40 });
  commit.addEventListener("input", () => { st.commit = commit.value; });
  paso.appendChild(campo("repoCommit", "Commit pin", "Leave it empty to use the tip of the branch, or pin the exact commit.", commit));
}

function montarConstruccion() {
  const cmd = entrada("buildComando", st.comando, { placeholder: "npm run build" });
  cmd.addEventListener("input", () => { st.comando = cmd.value; });
  paso.appendChild(campo("buildComando", "Build command", "Run from the root of the repository, in a shell with the toolchain already in the image.", cmd));

  const sel = lista("buildNodo", NODOS, "Choose a Node line");
  sel.value = st.nodo;
  sel.addEventListener("change", () => { st.nodo = sel.value; });
  paso.appendChild(campo("buildNodo", "Runtime", "The image ships the line, the version inside it is pinned by the lock file.", sel));

  const instalar = marca("buildInstalar", st.instalar, "Install dependencies before the build", "Turn it off only when the dependencies are vendored in the repository.");
  paso.appendChild(instalar);

  const cache = marca("buildCache", st.cache, "Restore the dependency cache", "Saves about forty seconds on a warm run and can hide a stale lock file, so read the report.");
  paso.appendChild(cache);
}

function pintarSecretos() {
  const caja = el("secretosCaja");
  if (!caja) return;
  caja.innerHTML = "";
  st.secretos.forEach((s, i) => {
    const fila = nodo("div", "secreto");
    const k = entrada("secretoClave" + i, s.clave, { placeholder: "NAME", maxlength: 32, "aria-label": "Secret name, row " + (i + 1) });
    k.addEventListener("input", () => { st.secretos[i].clave = k.value; });
    const v = entrada("secretoValor" + i, s.valor, { placeholder: "value, never displayed again", maxlength: 60, type: "password", "aria-label": "Secret value, row " + (i + 1) });
    v.addEventListener("input", () => { st.secretos[i].valor = v.value; });
    const quitar = nodo("button", "secreto__quitar", "x");
    quitar.type = "button";
    quitar.setAttribute("aria-label", "Remove secret row " + (i + 1));
    quitar.addEventListener("click", () => {
      if (st.secretos.length === 1) {
        st.secretos[0] = { clave: "", valor: "" };
        pintarSecretos();
        el("secretoClave0").focus();
        return;
      }
      st.secretos.splice(i, 1);
      pintarSecretos();
      const siguiente = document.querySelector('.secreto input[id^="secretoClave"]');
      if (siguiente) siguiente.focus();
    });
    fila.appendChild(k);
    fila.appendChild(v);
    fila.appendChild(quitar);
    caja.appendChild(fila);
  });
}

function montarSecretos() {
  const ent = entrada("entornoNombre", st.entorno, { placeholder: "production", maxlength: 40 });
  ent.addEventListener("input", () => { st.entorno = ent.value; });
  paso.appendChild(campo("entornoNombre", "Environment name", "It appears in the release title and in every log line of the run.", ent));

  const env = nodo("div", "campo");
  env.dataset.estado = "neutro";
  const et = nodo("span", "etiqueta", "Environment secrets");
  env.appendChild(et);
  const caja = nodo("div", "secretos");
  caja.id = "secretosCaja";
  env.appendChild(caja);
  const ayuda = nodo("p", "ayuda", "At least one pair, the name in upper snake case. Values are typed here and never shown again, not even in the report.");
  ayuda.id = "secretosCaja-ayuda";
  const err = nodo("p", "err");
  err.id = "secretosCaja-err";
  err.setAttribute("role", "alert");
  env.appendChild(ayuda);
  env.appendChild(err);
  paso.appendChild(env);
  pintarSecretos();

  const anadir = nodo("button", "anadir");
  anadir.type = "button";
  anadir.appendChild(nodo("span", "anadir__mas"));
  anadir.appendChild(nodo("span", null, "Add another secret"));
  anadir.addEventListener("click", () => {
    if (st.secretos.length >= MAXIMO[2]) {
      mostrarAviso("Four secrets is the ceiling on one release");
      return;
    }
    st.secretos.push({ clave: "", valor: "" });
    pintarSecretos();
    const campos = document.querySelectorAll('.secreto input[id^="secretoClave"]');
    if (campos.length) campos[campos.length - 1].focus();
  });
  paso.appendChild(anadir);
}

function montarTrafico() {
  const env = nodo("div", "campo");
  env.dataset.estado = "neutro";
  env.appendChild(nodo("span", "etiqueta", "Target regions, at least one"));
  const caja = nodo("div", "regiones");
  caja.id = "regionesCaja";
  caja.setAttribute("role", "group");
  caja.setAttribute("aria-describedby", "regiones-ayuda");
  REGIONES.forEach(r => {
    const lab = nodo("label", "region");
    const c = document.createElement("input");
    c.type = "checkbox";
    c.id = "region_" + r.clave;
    c.checked = st.regiones.includes(r.clave);
    c.addEventListener("change", () => {
      const i = st.regiones.indexOf(r.clave);
      if (c.checked && i === -1) st.regiones.push(r.clave);
      if (!c.checked && i > -1) st.regiones.splice(i, 1);
    });
    const datos = nodo("span", "region__datos");
    datos.appendChild(nodo("b", null, r.nombre));
    datos.appendChild(nodo("small", null, r.nota));
    lab.appendChild(c);
    lab.appendChild(datos);
    caja.appendChild(lab);
  });
  env.appendChild(caja);
  const ayuda = nodo("p", "ayuda", "The wave travels in the order below, the first region absorbs the canary slice.");
  ayuda.id = "regiones-ayuda";
  const err = nodo("p", "err");
  err.id = "regiones-err";
  err.setAttribute("role", "alert");
  env.appendChild(ayuda);
  env.appendChild(err);
  paso.appendChild(env);

  const rango = document.createElement("input");
  rango.type = "range";
  rango.id = "traficoCanario";
  rango.min = "0";
  rango.max = "50";
  rango.step = "5";
  rango.value = String(st.canario);
  rango.setAttribute("aria-describedby", "traficoCanario-ayuda");
  const cajaRango = nodo("div", "deslizador");
  const pistaR = nodo("span", "deslizador__pista");
  pistaR.setAttribute("aria-hidden", "true");
  const cap = nodo("span", "deslizador__cap");
  cap.id = "capCanario";
  cap.setAttribute("aria-hidden", "true");
  cajaRango.appendChild(pistaR);
  cajaRango.appendChild(rango);
  cajaRango.appendChild(cap);
  const envR = nodo("div", "campo");
  envR.dataset.estado = "neutro";
  const labR = nodo("label", null, "Canary slice");
  labR.htmlFor = "traficoCanario";
  envR.appendChild(labR);
  envR.appendChild(cajaRango);
  const ayudaR = nodo("p", "ayuda", textoCanario(st.canario));
  ayudaR.id = "traficoCanario-ayuda";
  const errR = nodo("p", "err");
  errR.id = "traficoCanario-err";
  errR.setAttribute("role", "alert");
  envR.appendChild(ayudaR);
  envR.appendChild(errR);
  paso.appendChild(envR);

  const mover = () => {
    st.canario = Number(rango.value);
    ayudaR.textContent = textoCanario(st.canario);
    const ancho = rango.clientWidth || 300;
    cap.style.setProperty("--pos", ((st.canario / 50) * (ancho - 22)).toFixed(1) + "px");
  };
  rango.addEventListener("input", mover);
  mover();

  const salud = entrada("traficoSalud", st.salud, { placeholder: "/healthz", maxlength: 60 });
  salud.addEventListener("input", () => { st.salud = salud.value; });
  paso.appendChild(campo("traficoSalud", "Health check path", "The runner polls this path after each wave. A 200 within two seconds means the wave holds.", salud));
}

function textoCanario(n) {
  if (n === 0) return "No canary, the whole change lands at once. Not recommended on a Friday.";
  if (n < 10) return n + " per cent of the traffic goes to the new version first.";
  if (n < 25) return n + " per cent, ten minutes of soak before the rest.";
  return n + " per cent, this is nearly a full rollout with extra steps.";
}

function resumenDe(i) {
  if (i === 0) {
    const r = REPOS.filter(x => x.clave === st.repo).map(x => x.nombre)[0];
    return [r || "", st.rama, st.commit];
  }
  if (i === 1) return [st.comando, NODOS.filter(n => n.clave === st.nodo).map(n => n.texto)[0], st.instalar ? "install yes" : "install no", st.cache ? "cache yes" : "cache no"];
  if (i === 2) return [st.entorno, st.secretos.map(s => s.clave).join(", ")];
  if (i === 3) return [REGIONES.filter(r => st.regiones.includes(r.clave)).map(r => r.nombre).join(", "), st.canario + " per cent", st.salud];
  return [];
}

function montarRevision() {
  const caja = nodo("div", "revision");
  const titulos = ["Repository", "Branch", "Commit", "Build command", "Runtime", "Install", "Cache", "Environment", "Secret names", "Regions", "Canary", "Health check"];
  let k = 0;
  for (let i = 0; i < 4; i++) {
    resumenDe(i).forEach(v => {
      const fila = nodo("div");
      fila.appendChild(nodo("dt", null, titulos[k]));
      const dd = nodo("dd", null, v || "");
      if (!v) dd.style.color = "rgba(232,244,242,.35)";
      fila.appendChild(dd);
      const pasoOrigen = i;
      const boton = nodo("button", "cambiar", "Change");
      boton.type = "button";
      boton.addEventListener("click", () => {
        st.paso = pasoOrigen;
        pintarRiel();
        pintarPaso();
      });
      fila.appendChild(boton);
      caja.appendChild(fila);
      k++;
    });
  }
  paso.appendChild(caja);

  const rb = marca("revisionRollback", st.rollback, "I know how to roll this back", "The previous version stays warm for two hours and the rollback is one click in the release page.");
  rb.querySelector("input").addEventListener("change", e => {
    st.rollback = e.target.checked;
    pintarErrores();
  });
  paso.appendChild(rb);

  const aviso = nodo("p", "ayuda", "Read the list once. Every Change button takes you back to that step with the answers intact.");
  paso.appendChild(aviso);
}

function pintarCampo(id, mensaje) {
  const n = el(id);
  if (!n) return;
  const env = n.closest(".campo");
  if (!env) return;
  const ayuda = el(id + "-ayuda");
  const err = el(id + "-err");
  env.dataset.estado = mensaje ? "error" : "ok";
  n.setAttribute("aria-invalid", mensaje ? "true" : "false");
  n.setAttribute("aria-describedby", mensaje ? ayuda.id + " " + err.id : ayuda.id);
  err.textContent = mensaje;
}

function problemas() {
  const salida = [];
  if (st.paso === 0) {
    if (st.repo === "") salida.push({ campo: "repoRepo", etiqueta: "Repository", mensaje: "Choose which of the four repositories this release builds." });
    if (st.rama.trim() === "") salida.push({ campo: "repoRama", etiqueta: "Branch", mensaje: "The pipeline needs a branch name, main is the usual one." });
    else if (!/^[A-Za-z0-9._/-]{2,60}$/.test(st.rama.trim())) salida.push({ campo: "repoRama", etiqueta: "Branch", mensaje: "A branch name is letters, digits, dots, slashes and dashes, between two and sixty." });
    if (st.commit.trim() !== "" && !/^[0-9a-fA-F]{7,40}$/.test(st.commit.trim())) {
      salida.push({ campo: "repoCommit", etiqueta: "Commit pin", mensaje: "A commit is hexadecimal, seven to forty characters. Leave it empty to use the tip." });
    }
  }
  if (st.paso === 1) {
    if (st.comando.trim() === "") salida.push({ campo: "buildComando", etiqueta: "Build command", mensaje: "A release with nothing to run is not a release." });
    else if (st.comando.trim().length > 80) salida.push({ campo: "buildComando", etiqueta: "Build command", mensaje: "Keep the command under eighty characters, the runner has a limit." });
  }
  if (st.paso === 2) {
    if (st.entorno.trim() === "") salida.push({ campo: "entornoNombre", etiqueta: "Environment name", mensaje: "Name the environment, for example production or staging eu." });
    const vacios = st.secretos.filter(s => s.clave.trim() === "" || s.valor === "").length;
    if (st.secretos.length === 0) salida.push({ campo: "secretosCaja", etiqueta: "Secrets", mensaje: "Add at least one secret pair, the release needs the database URL." });
    else if (vacios > 0) salida.push({ campo: "secretosCaja", etiqueta: "Secrets", mensaje: vacios + " secret " + (vacios === 1 ? "row is" : "rows are") + " half written. Both the name and the value are needed." });
    else {
      const malos = st.secretos.filter(s => !/^[A-Z][A-Z0-9_]{1,31}$/.test(s.clave.trim()));
      if (malos.length > 0) salida.push({ campo: "secretosCaja", etiqueta: "Secrets", mensaje: "Secret names go in upper snake case, like DATABASE_URL. " + malos[0].clave.trim() + " does not." });
      const repetidos = st.secretos.map(s => s.clave.trim()).filter((c, i, a) => a.indexOf(c) !== i);
      if (repetidos.length > 0) salida.push({ campo: "secretosCaja", etiqueta: "Secrets", mensaje: repetidos[0] + " is written twice in the same release." });
    }
  }
  if (st.paso === 3) {
    if (st.regiones.length === 0) salida.push({ campo: "regionesCaja", etiqueta: "Regions", mensaje: "Pick at least one region, there is nowhere to send the traffic otherwise." });
    if (st.salud.trim() === "") salida.push({ campo: "traficoSalud", etiqueta: "Health check", mensaje: "The runner needs a path to poll after every wave." });
    else if (!/^\/[A-Za-z0-9._~/-]*$/.test(st.salud.trim())) salida.push({ campo: "traficoSalud", etiqueta: "Health check", mensaje: "A health path starts with a slash and has no query string." });
  }
  if (st.paso === 4 && !st.rollback) {
    salida.push({ campo: "revisionRollback", etiqueta: "Rollback plan", mensaje: "Confirm you know how to roll this back before the release is queued." });
  }
  return salida;
}

function pintarErrores() {
  const fallo = problemas();
  const campos = {
    repoRepo: "repoRepo", repoRama: "repoRama", repoCommit: "repoCommit",
    buildComando: "buildComando", entornoNombre: "entornoNombre",
    traficoSalud: "traficoSalud", revisionRollback: "revisionRollback"
  };
  Object.keys(campos).forEach(id => {
    const n = el(id);
    if (n && n.closest(".campo")) pintarCampo(id, "");
  });

  if (st.paso === 2) {
    const env = el("secretosCaja").closest(".campo");
    const hay = fallo.some(f => f.campo === "secretosCaja");
    env.dataset.estado = hay ? "error" : "ok";
    el("secretosCaja").setAttribute("aria-describedby", hay ? "secretosCaja-ayuda secretosCaja-err" : "secretosCaja-ayuda");
    el("secretosCaja-err").textContent = hay ? fallo[0].mensaje : "";
  }
  if (st.paso === 3 && el("regionesCaja")) {
    const env = el("regionesCaja").closest(".campo");
    const hay = fallo.some(f => f.campo === "regionesCaja");
    env.dataset.estado = hay ? "error" : "ok";
    el("regionesCaja").setAttribute("aria-describedby", hay ? "regiones-ayuda regiones-err" : "regiones-ayuda");
    el("regiones-err").textContent = hay ? fallo[0].mensaje : "";
  }

  fallo.forEach(f => {
    if (campos[f.campo]) pintarCampo(f.campo, f.mensaje);
  });

  if (fallo.length === 0) {
    resumenError.hidden = true;
    return 0;
  }

  tituloError.textContent = fallo.length === 1
    ? "One thing is missing on this step"
    : fallo.length + " things are missing on this step";
  listaError.innerHTML = "";
  fallo.forEach(f => {
    const li = document.createElement("li");
    li.textContent = f.etiqueta + ": " + f.mensaje;
    listaError.appendChild(li);
  });
  resumenError.hidden = false;
  return fallo.length;
}

function mostrarAviso(texto) {
  el("hojaAviso").textContent = texto;
  window.setTimeout(() => {
    el("hojaAviso").textContent = st.paso === 4
      ? "The release goes to the runner as soon as you press the button."
      : "Nothing is sent to the runner until the last step.";
  }, 2600);
}

form.addEventListener("submit", e => {
  e.preventDefault();
  if (pintarErrores() > 0) {
    const primero = el(problemas()[0].campo === "secretosCaja" ? "secretoClave0" : problemas()[0].campo);
    const real = primero && primero.querySelector ? primero.querySelector("input, select, button") : primero;
    if (real) real.focus();
    return;
  }

  if (st.paso < 4) {
    st.paso++;
    pintarRiel();
    pintarPaso();
    document.querySelector(".hoja").scrollIntoView({ block: "start" });
    return;
  }

  lanzar();
});

el("atras").addEventListener("click", () => {
  if (st.paso === 0) return;
  st.paso--;
  pintarRiel();
  pintarPaso();
  document.querySelector(".hoja").scrollIntoView({ block: "start" });
});

function lanzar() {
  const ref = "REL-" + String(Math.floor(1000 + Math.random() * 8999));
  el("lanzadoRef").textContent = ref;
  el("lanzadoCommit").textContent = st.commit.trim() === "" ? st.rama + " tip" : st.commit.trim().slice(0, 10);
  el("lanzadoRegiones").textContent = REGIONES.filter(r => st.regiones.includes(r.clave)).map(r => r.nombre).join(", ");
  el("lanzadoCanario").textContent = st.canario + " per cent first";
  el("lanzadoTitulo").textContent = "2026.10.4 for " + (st.entorno.trim() || "production") + " is on its way";
  el("lanzadoLead").textContent = "The runner picked it up from " +
    (REPOS.filter(r => r.clave === st.repo).map(r => r.nombre)[0] || "the repository") + ". Each stage below turns green as the report comes back.";
  el("lanzadoNota").textContent = "Rollback is attached to the release " + ref +
    ", so one click puts the previous version back. The previous one stays warm for two hours.";

  const lista = el("lineaTiempo");
  lista.innerHTML = "";
  ETAPAS.forEach((e, i) => {
    const li = document.createElement("li");
    li.dataset.estado = "espera";
    li.appendChild(nodo("span", "linea-tiempo__nodo"));
    const txt = nodo("span", "linea-tiempo__texto");
    txt.appendChild(nodo("b", null, e.nombre));
    txt.appendChild(nodo("small", null, e.nota));
    li.appendChild(txt);
    const estado = nodo("span", "linea-tiempo__estado", "queued");
    li.appendChild(estado);
    li.style.animation = "entra-hoja 0.4s var(--ease) both";
    li.style.animationDelay = (i * 0.08).toFixed(2) + "s";
    lista.appendChild(li);
  });

  document.querySelector(".escena").hidden = true;
  document.querySelector(".barra").hidden = true;
  lanzado.hidden = false;
  lanzado.focus();

  ETAPAS.forEach((e, i) => {
    window.setTimeout(() => {
      const li = lista.children[i];
      li.dataset.estado = "corriendo";
      li.querySelector(".linea-tiempo__estado").textContent = "running";
    }, 500 + i * 900);
    window.setTimeout(() => {
      const li = lista.children[i];
      li.dataset.estado = "ok";
      li.querySelector(".linea-tiempo__estado").textContent = (8 + i * 5) + " s";
    }, 1300 + i * 900);
  });
}

el("otra").addEventListener("click", () => {
  lanzado.hidden = true;
  document.querySelector(".escena").hidden = false;
  document.querySelector(".barra").hidden = false;
  st.paso = 0;
  st.repo = "";
  st.rama = "";
  st.commit = "";
  st.comando = "npm run build";
  st.nodo = "22";
  st.instalar = true;
  st.cache = true;
  st.entorno = "production";
  st.secretos = [{ clave: "DATABASE_URL", valor: "" }];
  st.regiones = [];
  st.canario = 10;
  st.salud = "/healthz";
  st.rollback = false;
  pintarRiel();
  pintarPaso();
  document.querySelector(".hoja").scrollIntoView({ block: "start" });
});

pintarRiel();
pintarPaso();
