const cuerpo = document.getElementById("cuerpo");
const rejilla = document.getElementById("rejilla");
const resumenError = document.getElementById("resumenError");
const listaError = document.getElementById("resumenErrorLista");
const tituloError = document.getElementById("resumenErrorTitulo");
const cerrada = document.getElementById("cerrada");
const avisoHoja = document.getElementById("avisoHoja");

const COLUMNAS = [
  { clave: "sku", titulo: "SKU", clase: "celda--sku", editable: false },
  { clave: "item", titulo: "Item", clase: "celda--item", editable: false },
  { clave: "ubicacion", titulo: "Location", clase: "", editable: true, tipo: "texto" },
  { clave: "existencias", titulo: "On hand", clase: "celda--num", editable: true, tipo: "entero" },
  { clave: "reservadas", titulo: "Reserved", clase: "celda--num", editable: true, tipo: "entero" },
  { clave: "reposicion", titulo: "Reorder", clase: "celda--num", editable: true, tipo: "entero" },
  { clave: "coste", titulo: "Unit cost", clase: "celda--num", editable: true, tipo: "decimal" },
  { clave: "valor", titulo: "Line value", clase: "celda--num celda--calculada", editable: false }
];

let lineas = [
  { sku: "PAL-1042", item: "Pallet wrap, 500 mm, black", ubicacion: "B-04", existencias: 128, reservadas: 20, reposicion: 60, coste: 12.4 },
  { sku: "PAL-2210", item: "Euro pallet, heat treated", ubicacion: "B-05", existencias: 412, reservadas: 96, reposicion: 150, coste: 18.9 },
  { sku: "TAP-0087", item: "Carton sealing tape, 48 mm", ubicacion: "B-06", existencias: 46, reservadas: 12, reposicion: 80, coste: 2.35 },
  { sku: "LBL-3311", item: "Thermal label roll, 100 by 150", ubicacion: "B-07", existencias: 940, reservadas: 0, reposicion: 300, coste: 3.1 },
  { sku: "STR-4412", item: "Steel strapping, 12 mm coil", ubicacion: "B-09", existencias: 34, reservadas: 34, reposicion: 40, coste: 41.75 },
  { sku: "PLT-5501", item: "Plastic pallet, hygiene grade", ubicacion: "B-10", existencias: 76, reservadas: 8, reposicion: 40, coste: 27.5 },
  { sku: "CUT-6620", item: "Safety cutter, auto retract", ubicacion: "B-12", existencias: 118, reservadas: 0, reposicion: 25, coste: 6.8 },
  { sku: "GLV-7734", item: "Cut resistant glove, size 9", ubicacion: "B-13", existencias: 205, reservadas: 64, reposicion: 120, coste: 4.2 },
  { sku: "VST-8801", item: "High visibility vest, large", ubicacion: "B-14", existencias: 0, reservadas: 0, reposicion: 30, coste: 9.6 },
  { sku: "DOC-9055", item: "Picking list, 120 sheets", ubicacion: "B-15", existencias: 62, reservadas: 0, reposicion: 20, coste: 5.15 },
  { sku: "MRK-1120", item: "Aisle marker, reflective", ubicacion: "B-16", existencias: 158, reservadas: 22, reposicion: 50, coste: 1.85 },
  { sku: "SIC-3345", item: "Shrink film, 450 mm, 25 micron", ubicacion: "B-18", existencias: 71, reservadas: 15, reposicion: 90, coste: 14.05 }
];

let foco = { fila: 0, col: 3 };
let editando = null;

function el(id) { return document.getElementById(id); }

function nodo(etiqueta, clase, texto) {
  const n = document.createElement(etiqueta);
  if (clase) n.className = clase;
  if (texto !== undefined) n.textContent = texto;
  return n;
}

function dos(n) { return String(n).padStart(2, "0"); }

function dinero(n) {
  return n.toFixed(2).replace(".", ",");
}

function valorLinea(l) {
  return Math.max(0, l.existencias - l.reservadas) * l.coste;
}

function validaCampo(l, clave) {
  if (clave === "ubicacion") {
    if (l.ubicacion === "") return "A location is mandatory, the sheet is posted per aisle.";
    if (!/^[A-Z]-\d{2}$/.test(l.ubicacion)) return "A location looks like B-04: one letter, dash, two digits.";
    return "";
  }
  if (clave === "existencias" || clave === "reservadas" || clave === "reposicion") {
    const v = l[clave];
    if (!Number.isInteger(v)) return "A whole number between 0 and 99999.";
    if (v < 0 || v > 99999) return "Between 0 and 99999, the bin is not that deep.";
    return "";
  }
  if (clave === "coste") {
    if (typeof l.coste !== "number" || Number.isNaN(l.coste)) return "A number with at most two decimals.";
    if (l.coste < 0 || l.coste > 9999.99) return "Between 0 and 9999,99.";
    return "";
  }
  return "";
}

function problemasDe(l) {
  const salida = [];
  ["ubicacion", "existencias", "reservadas", "reposicion", "coste"].forEach(c => {
    const m = validaCampo(l, c);
    if (m) salida.push({ clave: c, mensaje: m });
  });
  if (salida.length === 0 && l.reservadas > l.existencias) {
    salida.push({ clave: "reservadas", mensaje: "Reserved cannot be larger than on hand. Fix one of the two." });
  }
  return salida;
}

function estadoLinea(l) {
  if (problemasDe(l).length > 0) return "error";
  if (l.existencias <= l.reposicion) return "aviso";
  return "";
}

function pintar() {
  cuerpo.innerHTML = "";
  lineas.forEach((l, f) => {
    const tr = document.createElement("tr");
    tr.setAttribute("role", "row");
    tr.setAttribute("aria-rowindex", String(f + 2));
    COLUMNAS.forEach((c, i) => {
      const td = document.createElement("td");
      td.setAttribute("role", "gridcell");
      td.setAttribute("aria-colindex", String(i + 1));
      const div = nodo("div", "celda " + c.clase);
      const fallos = problemasDe(l).filter(p => p.clave === c.clave);
      if (c.clave === "valor") {
        div.setAttribute("aria-label", "Line value " + dinero(valorLinea(l)) + " euros");
      } else if (!c.editable) {
        div.setAttribute("aria-readonly", "true");
        div.setAttribute("aria-label", c.titulo + " " + l[c.clave]);
      } else {
        div.setAttribute("aria-label", c.titulo + " " + l[c.clave] + ", editable, press Enter" +
          (fallos.length ? ", " + fallos[0].mensaje : ""));
      }

      if (c.clave === "valor") {
        div.appendChild(nodo("span", null, dinero(valorLinea(l))));
        if (l.existencias <= l.reposicion && problemasDe(l).length === 0) {
          const sello = nodo("span", "celda__sello", l.existencias === 0 ? "out" : "low");
          sello.dataset.tipo = l.existencias === 0 ? "sobre" : "bajo";
          div.appendChild(sello);
        }
      } else {
        div.appendChild(nodo("span", null, c.clave === "coste" ? dinero(l.coste) : l[c.clave]));
      }

      if (fallos.length > 0) {
        div.appendChild(nodo("span", "celda__nota", fallos[0].mensaje));
        div.dataset.estado = "error";
      } else if (c.clave === "existencias" && problemasDe(l).length === 0) {
        const est = estadoLinea(l);
        if (est) div.dataset.estado = est;
      }

      if (foco.fila === f && foco.col === i) {
        div.dataset.foco = "1";
        div.tabIndex = 0;
      } else {
        div.tabIndex = -1;
      }

      td.appendChild(div);
      tr.appendChild(td);
    });
    cuerpo.appendChild(tr);
  });
  rejilla.setAttribute("aria-rowcount", String(lineas.length + 1));
  pintarTotales();
}

function pintarTotales() {
  const unidades = lineas.reduce((a, l) => a + (Number.isInteger(l.existencias) ? l.existencias : 0), 0);
  const reservadas = lineas.reduce((a, l) => a + (Number.isInteger(l.reservadas) ? l.reservadas : 0), 0);
  const valor = lineas.reduce((a, l) => a + valorLinea(l), 0);
  const bajos = lineas.filter(l => problemasDe(l).length === 0 && l.existencias <= l.reposicion).length;
  const malos = lineas.filter(l => problemasDe(l).length > 0).length;

  el("totLineas").textContent = String(lineas.length);
  el("totUnidades").textContent = unidades.toLocaleString("en-GB");
  el("totReservadas").textContent = reservadas.toLocaleString("en-GB");
  el("totValor").textContent = dinero(valor);

  if (malos === 0 && !resumenError.hidden) {
    resumenError.hidden = true;
    listaError.innerHTML = "";
  }

  if (malos > 0) {
    avisoHoja.dataset.estado = "mal";
    avisoHoja.textContent = malos + " line" + (malos === 1 ? "" : "s") + " will not post";
  } else if (bajos > 0) {
    avisoHoja.dataset.estado = "aviso";
    avisoHoja.textContent = bajos + " line" + (bajos === 1 ? "" : "s") + " at or under the reorder point";
  } else {
    avisoHoja.dataset.estado = "ok";
    avisoHoja.textContent = "Nothing below the reorder point";
  }
}

function celdaEn(f, c) {
  return cuerpo.querySelector('[role="row"]:nth-child(' + (f + 1) + ') [role="gridcell"]:nth-child(' + (c + 1) + ') > .celda');
}

function moverA(f, c, seleccionar) {
  foco.fila = Math.max(0, Math.min(lineas.length - 1, f));
  foco.col = Math.max(0, Math.min(COLUMNAS.length - 1, c));
  pintar();
  const celda = celdaEn(foco.fila, foco.col);
  if (celda) {
    celda.focus();
    if (celda.scrollIntoView) celda.scrollIntoView({ block: "nearest", inline: "nearest" });
    if (seleccionar) {
      const span = celda.querySelector("span");
      if (span && document.createRange) {
        const r = document.createRange();
        r.selectNodeContents(span);
        const s = window.getSelection();
        if (s) {
          s.removeAllRanges();
          s.addRange(r);
        }
      }
    }
  }
}

function editar(f, c) {
  const col = COLUMNAS[c];
  if (!col.editable) {
    const celda = celdaEn(f, c);
    if (celda) {
      celda.dataset.estado = "aviso";
      window.setTimeout(() => {
        if (editando === null) pintar();
      }, 420);
    }
    return;
  }
  const l = lineas[f];
  const celda = celdaEn(f, c);
  if (!celda) return;
  const previo = col.clave === "coste" ? l.coste : l[col.clave];
  celda.innerHTML = "";
  const entrada = document.createElement("input");
  entrada.className = "editor" + (c >= 3 && c <= 6 ? " editor--num" : "");
  entrada.type = "text";
  entrada.value = String(previo);
  entrada.dataset.previo = String(previo);
  celda.appendChild(entrada);
  celda.dataset.editando = "1";
  editando = { f, c, entrada };
  entrada.focus();
  if (c >= 3 && c <= 6) entrada.select();
}

function confirmar(mover) {
  if (editando === null) return;
  const { f, c, entrada } = editando;
  const col = COLUMNAS[c];
  const crudo = entrada.value.trim();
  const l = lineas[f];

  if (col.tipo === "entero") {
    if (/^\d+$/.test(crudo)) l[col.clave] = Number(crudo);
  } else if (col.tipo === "decimal") {
    const normal = crudo.replaceAll(',', ".");
    if (/^\d{1,5}(\.\d{1,2})?$/.test(normal)) l.coste = Number(normal);
  } else {
    l[col.clave] = crudo.toUpperCase();
  }

  editando = null;
  pintar();
  if (mover === "abajo") moverA(f + 1, c, true);
  else if (mover === "derecha") moverA(f, c + 1, true);
  else moverA(f, c, true);
}

function cancelar() {
  if (editando === null) return;
  const { f, c } = editando;
  editando = null;
  pintar();
  moverA(f, c, false);
}

cuerpo.addEventListener("keydown", e => {
  const f = foco.fila;
  const c = foco.col;

  if (editando !== null) {
    if (e.key === "Enter") { e.preventDefault(); confirmar("abajo"); return; }
    if (e.key === "Escape") { e.preventDefault(); cancelar(); return; }
    if (e.key === "Tab") {
      e.preventDefault();
      confirmar("tab");
      el("anade").focus();
      return;
    }
    return;
  }

  if (e.key === "ArrowRight") { e.preventDefault(); moverA(f, c + 1, false); return; }
  if (e.key === "ArrowLeft") { e.preventDefault(); moverA(f, c - 1, false); return; }
  if (e.key === "ArrowDown") { e.preventDefault(); moverA(f + 1, c, false); return; }
  if (e.key === "ArrowUp") { e.preventDefault(); moverA(f - 1, c, false); return; }
  if (e.key === "Home") { e.preventDefault(); moverA(e.ctrlKey || e.metaKey ? 0 : f, 0, false); return; }
  if (e.key === "End") { e.preventDefault(); moverA(e.ctrlKey || e.metaKey ? lineas.length - 1 : f, COLUMNAS.length - 1, false); return; }
  if (e.key === "PageDown") { e.preventDefault(); moverA(f + 6, c, false); return; }
  if (e.key === "PageUp") { e.preventDefault(); moverA(f - 6, c, false); return; }
  if (e.key === "Enter" || e.key === "F2") { e.preventDefault(); editar(f, c); return; }
  if (e.key === "Delete" || e.key === "Backspace") {
    e.preventDefault();
    const col = COLUMNAS[c];
    if (!col.editable) return;
    const l = lineas[f];
    if (col.tipo === "entero") l[col.clave] = 0;
    else if (col.tipo === "decimal") l.coste = 0;
    else l[col.clave] = "";
    pintar();
    moverA(f, c, false);
  }
});

cuerpo.addEventListener("click", e => {
  const celda = e.target.closest(".celda");
  if (!celda) return;
  const td = celda.parentElement;
  const tr = td.parentElement;
  const f = Array.from(cuerpo.children).indexOf(tr);
  const c = Array.from(tr.children).indexOf(td);
  if (f < 0 || c < 0) return;
  moverA(f, c, false);
  if (COLUMNAS[c].editable) editar(f, c);
});

el("anade").addEventListener("click", () => {
  if (lineas.length >= 18) {
    el("notaHoja").textContent = "Eighteen lines is the ceiling for one aisle in a single pass.";
    window.setTimeout(() => {
      el("notaHoja").textContent = "A cell keeps its value when you walk away from it. Nothing is posted until the button at the bottom.";
    }, 2800);
    return;
  }
  const n = lineas.length + 1;
  lineas.push({
    sku: "NEW-" + dos(n),
    item: "New line, describe it in the item column later",
    ubicacion: "",
    existencias: 0,
    reservadas: 0,
    reposicion: 0,
    coste: 0
  });
  pintar();
  moverA(lineas.length - 1, 2, false);
});

el("quita").addEventListener("click", () => {
  if (lineas.length <= 1) {
    el("notaHoja").textContent = "A sheet needs at least one line to be posted.";
    return;
  }
  const fuera = lineas[foco.fila];
  const donde = foco.fila + 1;
  lineas.splice(foco.fila, 1);
  if (foco.fila > lineas.length - 1) foco.fila = lineas.length - 1;
  pintar();
  const celda = celdaEn(foco.fila, foco.col);
  if (celda) celda.focus();
  el("notaHoja").textContent = "Line " + donde + ", " + fuera.sku + ", is off the sheet. " + lineas.length +
    " lines left, and nothing was posted.";
  window.setTimeout(() => {
    el("notaHoja").textContent = "A cell keeps its value when you walk away from it. Nothing is posted until the button at the bottom.";
  }, 2600);
});

el("formCierre").addEventListener("submit", e => {
  e.preventDefault();
  const fallos = [];
  lineas.forEach((l, i) => {
    problemasDe(l).forEach(p => {
      fallos.push({ etiqueta: l.sku + " line " + (i + 1), mensaje: p.mensaje });
    });
  });

  if (fallos.length > 0) {
    tituloError.textContent = fallos.length === 1
      ? "One cell still refuses the count"
      : fallos.length + " cells still refuse the count";
    listaError.innerHTML = "";
    fallos.forEach(f => {
      const li = document.createElement("li");
      li.textContent = f.etiqueta + ": " + f.mensaje;
      listaError.appendChild(li);
    });
    resumenError.hidden = false;
    const primera = lineas.findIndex(l => problemasDe(l).length > 0);
    const clave = problemasDe(lineas[primera])[0].clave;
    moverA(primera, COLUMNAS.findIndex(c => c.clave === clave), true);
    return;
  }

  resumenError.hidden = true;
  el("publicarTexto").textContent = "Posting the aisle";
  el("publicar").disabled = true;
  window.setTimeout(cerrarHoja, 800);
});

function cerrarHoja() {
  const ref = "CNT-" + String(Math.floor(1000 + Math.random() * 8999));
  const valor = lineas.reduce((a, l) => a + valorLinea(l), 0);
  const bajos = lineas.filter(l => l.existencias <= l.reposicion);
  const unidades = lineas.reduce((a, l) => a + l.existencias, 0);

  el("refHoja").textContent = ref;
  el("cerradaRef").textContent = ref;
  el("cerradaLineas").textContent = lineas.length + (lineas.length === 1 ? " line" : " lines");
  el("cerradaValor").textContent = dinero(valor);
  el("cerradaRepos").textContent = bajos.length + (bajos.length === 1 ? " note" : " notes");
  el("cerradaTitulo").textContent = "Aisle B is reconciled";
  el("cerradaLead").textContent = "The system trusts these numbers from now on. " +
    (bajos.length === 0
      ? "Nothing was under its reorder point, so no purchase order goes out."
      : bajos.length + " lines are under their reorder point and a draft order is waiting for the lead.") +
    " The sheet keeps the sign off, not the corrections.";

  const lista = el("cerradaPasos");
  lista.innerHTML = "";
  [
    "Sheet " + ref + " posted against warehouse 4, aisle B",
    unidades.toLocaleString("en-GB") + " units counted, " + dinero(valor) + " of stock value recorded",
    bajos.length > 0 ? "Draft purchase order raised for " + bajos.length + " low lines" : "No purchase order needed, every line is above its reorder point",
    "Bin locations locked for the next shift so two counters cannot fight over the same bin"
  ].forEach((t, i) => {
    const li = document.createElement("li");
    li.textContent = t;
    li.style.animationDelay = (0.08 + i * 0.08).toFixed(2) + "s";
    lista.appendChild(li);
  });

  document.querySelector(".escena").hidden = true;
  document.querySelector(".cabecera").hidden = true;
  cerrada.hidden = false;
  cerrada.focus();
}

el("otra").addEventListener("click", () => {
  cerrada.hidden = true;
  document.querySelector(".escena").hidden = false;
  document.querySelector(".cabecera").hidden = false;
  el("publicar").disabled = false;
  el("publicarTexto").textContent = "Post the count";
  resumenError.hidden = true;
  el("notaHoja").textContent = "A cell keeps its value when you walk away from it. Nothing is posted until the button at the bottom.";
  foco = { fila: 0, col: 3 };
  pintar();
  const celda = celdaEn(0, 3);
  if (celda) celda.focus();
  document.querySelector(".escena").scrollIntoView({ block: "start" });
});

pintar();
