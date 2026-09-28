const form = document.getElementById("form");
const cuerpo = document.getElementById("cuerpo");
const formula = document.getElementById("formula");
const chapaRef = document.getElementById("chapaRef");
const medidorRelleno = document.getElementById("medidorRelleno");
const medidorBarra = document.getElementById("medidorBarra");
const medidorEtiqueta = document.getElementById("medidorEtiqueta");
const medidorEstado = document.getElementById("medidorEstado");
const resumenError = document.getElementById("resumenError");
const listaError = document.getElementById("resumenLista");
const tituloError = document.getElementById("resumenTitulo");
const sello = document.getElementById("sello");
const selloTabla = document.getElementById("selloTabla");
const guardar = document.getElementById("guardar");

const COLUMNAS = ["A", "B", "C", "D", "E"];
const ETIQUETAS = {
  A: "slot name",
  B: "tier",
  C: "drag",
  D: "crew",
  E: "note"
};
const TIEMPOS = {
  field: { cr: 0, techo: 0, texto: "field" },
  core: { cr: 120, techo: 4, texto: "core" },
  prime: { cr: 340, techo: 8, texto: "prime" },
  legend: { cr: 760, techo: 12, texto: "legend" }
};
const PRESUPUESTO = 24;
const MAX_FILAS = 12;
const MIN_FILAS = 3;
const MIN_VALLAS = 5;

let filas = [
  { a: "Main rifle", b: "legend", c: "7", d: "1", e: "Recoil pattern drilled" },
  { a: "Optic plate", b: "prime", c: "2", d: "1", e: "" },
  { a: "Chest rig", b: "core", c: "3", d: "2", e: "Shared ammo" },
  { a: "Comms pack", b: "core", c: "1", d: "1", e: "" },
  { a: "", b: "field", c: "", d: "", e: "" },
  { a: "", b: "field", c: "", d: "", e: "" }
];

let sel = { fila: 1, col: "A" };
let sincronizando = false;

function el(id) { return document.getElementById(id); }

function celdaId(f, c) { return "celda-" + c + f; }

function numero(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function decimal(n) {
  return String(n).replace(".", ",");
}

function datos() {
  return {
    peso: filas.reduce((s, f) => s + (f.c === "" ? 0 : numero(f.c)), 0),
    creditos: filas.reduce((s, f) => s + (f.a.trim() === "" ? 0 : TIEMPOS[f.b].cr), 0),
    crew: filas.reduce((s, f) => s + (f.d === "" ? 0 : numero(f.d)), 0),
    llenas: filas.filter(f => f.a.trim() !== "").length
  };
}

function construir() {
  cuerpo.innerHTML = "";
  filas.forEach((f, i) => {
    const r = i + 1;
    const tr = document.createElement("tr");

    const th = document.createElement("th");
    th.scope = "row";
    th.textContent = String(r);
    tr.appendChild(th);

    const etiqueta = document.createElement("label");
    etiqueta.className = "sr";
    etiqueta.setAttribute("for", celdaId("A", r));
    etiqueta.textContent = "Row " + r + ", slot name, up to 18 characters, names must be unique";

    const tdA = document.createElement("td");
    const inA = document.createElement("input");
    inA.type = "text";
    inA.className = "celda";
    inA.id = celdaId("A", r);
    inA.maxLength = 18;
    inA.value = f.a;
    inA.placeholder = "slot name";
    inA.autocomplete = "off";
    inA.spellcheck = false;
    inA.dataset.col = "A";
    inA.dataset.fila = String(r);
    inA.setAttribute("aria-describedby", "reglas");
    inA.setAttribute("aria-invalid", "false");
    tdA.appendChild(etiqueta);
    tdA.appendChild(inA);
    tr.appendChild(tdA);

    const tdB = document.createElement("td");
    const labB = document.createElement("label");
    labB.className = "sr";
    labB.setAttribute("for", celdaId("B", r));
    labB.textContent = "Row " + r + ", tier, one of field, core, prime or legend";
    const selB = document.createElement("select");
    selB.className = "celda";
    selB.id = celdaId("B", r);
    selB.dataset.col = "B";
    selB.dataset.fila = String(r);
    selB.setAttribute("aria-describedby", "reglas");
    selB.setAttribute("aria-invalid", "false");
    [["field", "field"], ["core", "core"], ["prime", "prime"], ["legend", "legend"]].forEach(o => {
      const op = document.createElement("option");
      op.value = o[0];
      op.textContent = o[1];
      selB.appendChild(op);
    });
    selB.value = f.b;
    tdB.appendChild(labB);
    tdB.appendChild(selB);
    tr.appendChild(tdB);

    const pares = [
      { col: "C", ayuda: "Row " + r + ", drag in whole kilograms, from 0 to 12 and never over the tier ceiling", tipo: "number", clase: "celda celda-num", ph: "kg" },
      { col: "D", ayuda: "Row " + r + ", crew assigned, from 1 to 5", tipo: "number", clase: "celda celda-num", ph: "crew" },
      { col: "E", ayuda: "Row " + r + ", note, up to 20 characters", tipo: "text", clase: "celda", ph: "note" }
    ];
    pares.forEach(p => {
      const td = document.createElement("td");
      const lab = document.createElement("label");
      lab.className = "sr";
      lab.setAttribute("for", celdaId(p.col, r));
      lab.textContent = p.ayuda;
      const inp = document.createElement("input");
      inp.type = p.tipo;
      inp.className = p.clase;
      inp.id = celdaId(p.col, r);
      inp.placeholder = p.ph;
      inp.autocomplete = "off";
      inp.dataset.col = p.col;
      inp.dataset.fila = String(r);
      inp.setAttribute("aria-describedby", "reglas");
      inp.setAttribute("aria-invalid", "false");
      if (p.tipo === "number") {
        inp.inputMode = "numeric";
        inp.step = "1";
      } else {
        inp.maxLength = 20;
        inp.spellcheck = false;
      }
      inp.value = f[p.col.toLowerCase()];
      td.appendChild(lab);
      td.appendChild(inp);
      const err = document.createElement("p");
      err.className = "celda-error";
      err.id = celdaId(p.col, r) + "-error";
      err.setAttribute("role", "alert");
      td.appendChild(err);
      tr.appendChild(td);
    });

    cuerpo.appendChild(tr);
  });
  conectar();
}

function marcarFalloEnCelda(f, c, estado) {
  const inp = el(celdaId(c, f));
  if (!inp) return;
  const td = inp.parentElement;
  if (td) td.classList.toggle("malo", estado === "malo");
  if (td) td.classList.toggle("bueno", estado === "bueno");
  inp.setAttribute("aria-invalid", estado === "malo" ? "true" : "false");
}

function falloDeFila(i) {
  const f = filas[i];
  const r = i + 1;
  const nombre = f.a.trim();
  const errores = [];
  let columna = "A";

  if (nombre === "" && (f.b !== "field" || f.c !== "" || f.d !== "" || f.e !== "")) {
    errores.push({ col: "A", texto: "name needed" });
  }

  if (nombre !== "") {
    if (nombre.length > 18) errores.push({ col: "A", texto: "18 chars max" });
    if (filas.some((o, j) => j !== i && o.a.trim().toLowerCase() === nombre.toLowerCase())) {
      errores.push({ col: "A", texto: "name already used" });
    }
    if (!TIEMPOS[f.b]) errores.push({ col: "B", texto: "pick a tier" });
    if (f.c === "") errores.push({ col: "C", texto: "drag needed" });
    else if (!/^\d{1,2}$/.test(f.c.trim())) errores.push({ col: "C", texto: "0 to 12" });
    else if (numero(f.c) > TIEMPOS[f.b].techo) {
      errores.push({ col: "C", texto: "max " + TIEMPOS[f.b].techo + " kg for " + f.b });
    }
    if (f.d !== "" && !/^[1-5]$/.test(f.d.trim())) errores.push({ col: "D", texto: "1 to 5" });
    if (f.e.length > 20) errores.push({ col: "E", texto: "20 chars max" });
  }

  if (errores.length > 0) columna = errores[0].col;
  return { errores, columna, texto: errores.length === 0 ? "" : errores[0].texto, r };
}

function celdaError(f, c) {
  return el(celdaId(c, f) + "-error");
}

function pintarFila(i) {
  const info = falloDeFila(i);
  COLUMNAS.forEach(c => {
    marcarFalloEnCelda(i + 1, c, "neutro");
    const err = celdaError(i + 1, c);
    if (err) err.textContent = "";
  });
  if (info.errores.length > 0) {
    marcarFalloEnCelda(i + 1, info.columna, "malo");
    const err = celdaError(i + 1, info.columna);
    if (err) err.textContent = info.texto;
    const inp = el(celdaId(info.columna, i + 1));
    if (inp) inp.setAttribute("aria-describedby", "reglas " + err.id);
  }
  return info;
}

function pintarTodo() {
  let total = 0;
  const problemas = [];
  filas.forEach((f, i) => {
    const info = pintarFila(i);
    if (info.errores.length > 0) {
      total += info.errores.length;
      problemas.push({ fila: info.r, texto: info.texto });
    }
  });
  const d = datos();
  if (d.peso > PRESUPUESTO) {
    total += 1;
    problemas.push({ fila: 0, texto: "the squad carries " + decimal(d.peso) + " kg and the budget is 24,0 kg" });
  }
  if (d.llenas < MIN_VALLAS) {
    total += 1;
    problemas.push({ fila: 0, texto: "only " + d.llenas + " of the 5 needed slots are named" });
  }
  return { total, problemas };
}

function pintarMetricas() {
  const d = datos();
  el("sumaPeso").textContent = decimal(d.peso);
  el("sumaPrecio").textContent = String(d.creditos);
  el("sumaCrew").textContent = String(d.crew);
  el("sumaSlots").textContent = d.llenas + " of " + MAX_FILAS;
  el("cabSlots").textContent = d.llenas + " of " + MAX_FILAS;
  el("cabPeso").textContent = decimal(d.peso) + " kg";
  el("cabPresup").textContent = d.creditos + " cr";

  const proporcion = Math.min(1, d.peso / PRESUPUESTO);
  medidorRelleno.style.transform = "scaleX(" + proporcion + ")";
  medidorBarra.setAttribute("aria-valuenow", decimal(d.peso));
  medidorBarra.setAttribute("aria-valuetext", decimal(d.peso) + " kilograms of 24,0 used");
  medidorEtiqueta.textContent = "Drag budget " + decimal(d.peso) + " kg of 24,0 kg";
  medidorEstado.textContent = (MAX_FILAS - d.llenas) + " slots still free";
  medidorBarra.dataset.alerta = d.peso > PRESUPUESTO ? "true" : "false";
}

function sincronizarCelda(inp) {
  const i = Number(inp.dataset.fila) - 1;
  const c = inp.dataset.col;
  const v = inp.value;
  if (c === "A") filas[i].a = v.slice(0, 18);
  else if (c === "B") filas[i].b = v;
  else if (c === "C") filas[i].c = v.replace(/[^0-9]/g, "").slice(0, 2);
  else if (c === "D") filas[i].d = v.replace(/[^0-9]/g, "").slice(0, 1);
  else filas[i].e = v.slice(0, 20);
  if (inp.value !== filas[i][c.toLowerCase()]) inp.value = filas[i][c.toLowerCase()];
  pintarMetricas();
}

function enfocar(f, c) {
  const total = filas.length;
  sel = { fila: Math.max(1, Math.min(total, f)), col: c };
  document.querySelectorAll("td.activa").forEach(td => td.classList.remove("activa"));
  const inp = el(celdaId(sel.col, sel.fila));
  if (!inp) return;
  inp.parentElement.classList.add("activa");
  const valor = inp.value;
  chapaRef.textContent = "cell " + sel.col + sel.fila + " · " + ETIQUETAS[sel.col] + " · " +
    (valor === "" ? "empty" : "length " + valor.length);
  sincronizando = true;
  formula.value = valor;
  sincronizando = false;
  inp.focus();
  if (inp.select) inp.select();
}

function mover(df, dc) {
  let f = sel.fila + df;
  let c = COLUMNAS.indexOf(sel.col) + dc;
  if (c < 0) {
    f -= 1;
    c = COLUMNAS.length - 1;
  }
  if (c > COLUMNAS.length - 1) {
    f += 1;
    c = 0;
  }
  enfocar(f, COLUMNAS[Math.max(0, c)]);
}

function conectar() {
  cuerpo.querySelectorAll(".celda").forEach(inp => {
    inp.addEventListener("focus", () => {
      const f = Number(inp.dataset.fila);
      const c = inp.dataset.col;
      document.querySelectorAll("td.activa").forEach(td => td.classList.remove("activa"));
      inp.parentElement.classList.add("activa");
      sel = { fila: f, col: c };
      chapaRef.textContent = "cell " + c + f + " · " + ETIQUETAS[c] + " · " +
        (inp.value === "" ? "empty" : "length " + inp.value.length);
      sincronizando = true;
      formula.value = inp.value;
      sincronizando = false;
    });

    inp.addEventListener("input", () => {
      sincronizarCelda(inp);
      pintarFila(Number(inp.dataset.fila) - 1);
      chapaRef.textContent = "cell " + inp.dataset.col + inp.dataset.fila + " · " +
        ETIQUETAS[inp.dataset.col] + " · " + (inp.value === "" ? "empty" : "length " + inp.value.length);
    });

    inp.addEventListener("change", () => {
      sincronizarCelda(inp);
      pintarFila(Number(inp.dataset.fila) - 1);
    });

    inp.addEventListener("blur", () => {
      sincronizarCelda(inp);
      pintarFila(Number(inp.dataset.fila) - 1);
    });

    inp.addEventListener("keydown", e => {
      const f = Number(inp.dataset.fila);
      const c = inp.dataset.col;
      if (e.key === "ArrowLeft") { e.preventDefault(); mover(0, -1); }
      else if (e.key === "ArrowRight") { e.preventDefault(); mover(0, 1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); enfocar(f - 1, c); }
      else if (e.key === "ArrowDown") { e.preventDefault(); enfocar(f + 1, c); }
      else if (e.key === "Home") { e.preventDefault(); enfocar(f, "A"); }
      else if (e.key === "End") { e.preventDefault(); enfocar(f, "E"); }
      else if (e.key === "PageUp") { e.preventDefault(); enfocar(1, c); }
      else if (e.key === "PageDown") { e.preventDefault(); enfocar(filas.length, c); }
      else if (e.key === "Enter") { e.preventDefault(); enfocar(f + 1, c); }
      else if (e.key === "Escape") { e.preventDefault(); guardar.focus(); }
      else if (e.key === "Delete" && inp.type !== "number") { inp.value = ""; sincronizarCelda(inp); pintarFila(f - 1); }
    });
  });
}

formula.addEventListener("input", () => {
  if (sincronizando) return;
  const inp = el(celdaId(sel.col, sel.fila));
  if (!inp) return;
  inp.value = formula.value;
  sincronizarCelda(inp);
  pintarFila(sel.fila - 1);
  chapaRef.textContent = "cell " + sel.col + sel.fila + " · " + ETIQUETAS[sel.col] + " · " +
    (inp.value === "" ? "empty" : "length " + inp.value.length);
});

formula.addEventListener("blur", () => {
  const inp = el(celdaId(sel.col, sel.fila));
  if (inp) {
    sincronizarCelda(inp);
    pintarFila(sel.fila - 1);
  }
});

el("anadir").addEventListener("click", () => {
  if (filas.length >= MAX_FILAS) return;
  filas.push({ a: "", b: "field", c: "", d: "", e: "" });
  construir();
  enfocar(filas.length, "A");
});

el("borrar").addEventListener("click", () => {
  if (filas.length <= MIN_FILAS) return;
  filas.pop();
  construir();
  enfocar(Math.min(sel.fila, filas.length), "A");
});

el("vaciar").addEventListener("click", () => {
  filas = filas.map(() => ({ a: "", b: "field", c: "", d: "", e: "" }));
  construir();
  enfocar(1, "A");
});

form.addEventListener("submit", e => {
  e.preventDefault();
  const info = pintarTodo();
  if (info.total > 0) {
    tituloError.textContent = info.total === 1
      ? "One thing to fix before sealing"
      : info.total + " things to fix before sealing";
    listaError.innerHTML = "";
    info.problemas.forEach(p => {
      const li = document.createElement("li");
      li.textContent = p.fila === 0 ? p.texto : "Row " + p.fila + ": " + p.texto;
      listaError.appendChild(li);
    });
    resumenError.hidden = false;
    guardar.focus();
    return;
  }

  resumenError.hidden = true;
  const d = datos();
  selloTabla.innerHTML = "";

  const cabeza = document.createElement("div");
  cabeza.className = "sello-fila head";
  ["Slot", "Tier", "Drag"].forEach(t => {
    const s = document.createElement("span");
    s.textContent = t;
    cabeza.appendChild(s);
  });
  selloTabla.appendChild(cabeza);

  filas.filter(f => f.a.trim() !== "").forEach(f => {
    const fila = document.createElement("div");
    fila.className = "sello-fila";
    const a = document.createElement("span");
    a.textContent = f.a;
    const b = document.createElement("span");
    b.textContent = f.b;
    const c = document.createElement("span");
    c.textContent = f.c + " kg";
    fila.appendChild(a);
    fila.appendChild(b);
    fila.appendChild(c);
    selloTabla.appendChild(fila);
  });

  el("selloTitulo").textContent = d.llenas + " slots signed, " + decimal(d.peso) + " kg of drag";
  el("selloTexto").textContent = "The sheet costs " + d.creditos +
    " credits with " + d.crew + " crew assigned. It is stored with this squad in this browser only.";
  form.hidden = true;
  sello.hidden = false;
  sello.focus();
});

el("otra").addEventListener("click", () => {
  sello.hidden = true;
  form.hidden = false;
  resumenError.hidden = true;
  enfocar(1, "A");
});

construir();
pintarMetricas();
enfocar(1, "A");
