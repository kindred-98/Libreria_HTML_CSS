import { readdirSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "..", "..", "..");
const REPARTOS = [
  { carpeta: "indicadores-de-carga", reparto: "indicadores" },
  { carpeta: "navegacion", reparto: "navegacion" }
];

const errores = [];
const avisos = [];

function listarCarpetas(relativas) {
  const base = path.join(REPO, relativas);
  if (!existsSync(base)) return [];
  return readdirSync(base, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);
}

const existentes = new Set();
for (const carpeta of [
  "creaciones-primium",
  "CreacionesNuevas",
  "GevendraAutorExterno"
]) {
  for (const slug of listarCarpetas(carpeta)) existentes.add(slug);
}

const palabras = (s) => s.split("-").filter((p) => p.length > 2);

let totalPiezas = 0;

for (const { carpeta, reparto } of REPARTOS) {
  const ruta = path.join(HERE, `reparto-${reparto}.json`);
  const datos = JSON.parse(readFileSync(ruta, "utf8"));
  const filas = datos.lotes.flat();
  const destino = path.join(REPO, "creaciones-primium", carpeta);
  const categoria = carpeta;

  if (datos.total !== filas.length) {
    errores.push(`${categoria}: el reparto declara ${datos.total} y trae ${filas.length} filas`);
  }

  const porUniverso = new Map();
  const slugs = new Set();
  const mecanismos = new Set();

  for (const fila of filas) {
    totalPiezas += 1;

    if (!porUniverso.has(fila.universo)) porUniverso.set(fila.universo, []);
    porUniverso.get(fila.universo).push(fila);

    if (slugs.has(fila.n)) errores.push(`${categoria}: slug repetido en el reparto: ${fila.n}`);
    slugs.add(fila.n);

    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(fila.n)) {
      errores.push(`${categoria}: slug con formato raro: ${fila.n}`);
    }

    const clave = `${fila.universo}|${fila.mecanica}`;
    if (mecanismos.has(clave)) {
      errores.push(`${categoria}: mecánica repetida en ${fila.universo}: ${fila.mecanica}`);
    }
    mecanismos.add(clave);

    if (existentes.has(fila.n)) {
      errores.push(`${categoria}: el slug ${fila.n} ya existe en el repo`);
    }

    for (const palabra of palabras(fila.n)) {
      const choque = [...existentes].find(
        (otro) => otro !== fila.n && palabras(otro).includes(palabra)
      );
      if (choque) {
        avisos.push(
          `${categoria}: ${fila.n} comparte la palabra "${palabra}" con ${choque}`
        );
        break;
      }
    }
  }

  for (const [universo, piezas] of porUniverso) {
    if (piezas.length !== 10) {
      errores.push(`${categoria}: el universo ${universo} tiene ${piezas.length} piezas, debe tener 10`);
    }
  }
  if (porUniverso.size !== 8) {
    errores.push(`${categoria}: hay ${porUniverso.size} universos, deben ser 8`);
  }

  const hechas = readdirSync(destino, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);

  const faltan = [...slugs].filter((s) => !hechas.includes(s));
  const sobran = hechas.filter((s) => !slugs.has(s));

  if (faltan.length) errores.push(`FALTAN en ${categoria} (${faltan.length}): ${faltan.join(", ")}`);
  if (sobran.length) errores.push(`SOBRAN en ${categoria} (${sobran.length}): ${sobran.join(", ")}`);

  const incompletas = hechas.filter((slug) => {
    const faltanArchivos = ["index.html", "styles.css"].filter(
      (f) => !existsSync(path.join(destino, slug, f))
    );
    return faltanArchivos.length;
  });
  if (incompletas.length) {
    errores.push(`${categoria}: sin index.html o styles.css: ${incompletas.join(", ")}`);
  }

  const rayas = [...avisos].filter((a) => a.startsWith(`${categoria}:`));
  console.log(
    `${categoria}: ${hechas.length}/80 hechas, ${porUniverso.size} universos` +
      (rayas.length ? `, ${rayas.length} avisos de palabra` : "")
  );
}

for (const aviso of avisos) console.log(`aviso: ${aviso}`);

console.log(`total asignado: ${totalPiezas} piezas`);

if (errores.length) {
  console.log("");
  for (const e of errores) console.log(`ERROR: ${e}`);
  process.exit(1);
}
console.log("");
console.log("ok: reparto cumplido");
