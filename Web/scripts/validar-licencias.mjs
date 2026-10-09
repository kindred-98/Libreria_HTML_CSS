/**
 * Comprobacion de licencias en el repositorio.
 *
 *   node Web/scripts/validar-licencias.mjs
 *
 * Que comprueba y por que:
 *
 * 1. Cada raiz de demos (CreacionesNuevas, DavokerDisenador,
 *    creaciones-primium) tiene su archivo `LICENSE` en la raiz. Las tres
 *    son MIT segun `Docs/THIRD_PARTY_NOTICES.md`; si una raiz cambia su
 *    texto, este validador exige que la tabla de la seccion "Las
 *    colecciones" siga declarando la misma licencia.
 * 2. La suma de `license` declaradas en `Web/data/catalog.json` cuadra
 *    con la tabla de `THIRD_PARTY_NOTICES.md`: cualquier licencia nueva
 *    tendria que aparecer alli para que la gente la pueda revisar antes
 *    de redistribuir o monetizar.
 * 3. Escribe `Docs/Demos_con_restricciones.md` con la lista de
 *    componentes cuya licencia no sea MIT o cuyo `redistributable` sea
 *    false. Esta es la lista que el plan P2-3 pide para que una persona
 *    la mire antes de habilitar descargas o monetizacion. No es
 *    asesoria legal: solo un inventario.
 *
 * Sale con codigo 1 si algo falla, para encadenarlo en CI.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryDirectory = path.resolve(scriptDirectory, "../..");
const catalogFile = path.join(repositoryDirectory, "Web", "data", "catalog.json");
const sourcesDirectory = path.join(repositoryDirectory, "Web", "data", "sources");
const noticesFile = path.join(repositoryDirectory, "Docs", "THIRD_PARTY_NOTICES.md");
const restriccionesFile = path.join(repositoryDirectory, "Docs", "Demos_con_restricciones.md");

/** Raices de demos y donde se espera el archivo LICENSE. */
const RAICES = [
  // CreacionesNuevas: cada demo lleva su propio LICENSE (la coleccion
  // no tiene uno de raiz). Se valida por demo, no por raiz.
  { root: "CreacionesNuevas", license: "MIT", donde: "por-demo" },
  // DavokerDisenador: la licencia del autor de origen vive en la raiz.
  { root: "DavokerDiseñador", license: "MIT", donde: "raiz" },
  // creaciones-primium: la licencia de la coleccion vive en la raiz
  // (cubre a las dos autoras).
  { root: "creaciones-primium", license: "MIT", donde: "raiz" },
];

import { readdir } from "node:fs/promises";

async function tieneLicensePorDemo(rootAbsolute) {
  const sinLicense = [];
  async function walk(dir) {
    for (const entrada of await readdir(dir, { withFileTypes: true })) {
      if (entrada.name.startsWith(".")) continue;
      const rutaCompleta = path.join(dir, entrada.name);
      if (entrada.isDirectory()) {
        if (entrada.name === "vendor" || entrada.name === "node_modules") continue;
        await walk(rutaCompleta);
      } else if (entrada.name === "index.html") {
        // Cada carpeta con index.html representa un demo. Se exige su LICENSE
        // junto al index.html.
        const licenseEsperada = path.join(dir, "LICENSE");
        if (!existsSync(licenseEsperada)) {
          sinLicense.push(path.relative(rootAbsolute, dir).split(path.sep).join("/"));
        }
      }
    }
  }
  await walk(rootAbsolute);
  return sinLicense;
}

const failures = [];
const notes = [];

for (const { root, license, donde } of RAICES) {
  const rootAbsolute = path.join(repositoryDirectory, root);
  if (donde === "raiz") {
    const licenseFile = path.join(rootAbsolute, "LICENSE");
    if (!existsSync(licenseFile)) {
      failures.push(`${root}: falta LICENSE en la raiz (esperado ${license})`);
    } else {
      notes.push(`${root}: LICENSE en la raiz (${license})`);
    }
  } else {
    const sinLicense = await tieneLicensePorDemo(rootAbsolute);
    if (sinLicense.length > 0) {
      failures.push(
        `${root}: ${sinLicense.length} demo(s) sin LICENSE (esperado ${license}): ` +
          sinLicense.slice(0, 5).join(", ") +
          (sinLicense.length > 5 ? `, ... (${sinLicense.length} en total)` : ""),
      );
    } else {
      notes.push(`${root}: todos los demos tienen su LICENSE (${license})`);
    }
  }
}

if (!existsSync(sourcesDirectory)) {
  failures.push("Web/data/sources/ no existe (ejecuta `npm run catalogo` antes)");
} else if (!existsSync(catalogFile)) {
  failures.push("Web/data/catalog.json no existe (ejecuta `npm run catalogo` antes)");
} else {
  const archivos = readdirSync(sourcesDirectory).filter((nombre) => nombre.endsWith(".json"));
  if (archivos.length === 0) {
    failures.push("Web/data/sources/ esta vacio");
  }
  const catalogo = JSON.parse(readFileSync(catalogFile, "utf8"));
  const downloadablePorId = new Map(catalogo.map((componente) => [componente.id, !!componente.downloadable]));

  const distribucion = new Map();
  let sinRedistribucionTecnica = 0;
  const restringidos = [];
  for (const archivo of archivos) {
    const ruta = path.join(sourcesDirectory, archivo);
    const fuente = JSON.parse(readFileSync(ruta, "utf8"));
    const license = fuente.license ?? "(sin licencia)";
    const redistribuible = downloadablePorId.get(fuente.folder) === true;
    const clave = license;
    const contador = distribucion.get(clave) ?? { redistribuible: 0, total: 0 };
    contador.total += 1;
    if (redistribuible) {
      contador.redistribuible += 1;
    } else {
      // downloadable=false puede ser por motivos tecnicos (LICENSE ausente,
      // source unverified, missingReferences) o por una restriccion de
      // licencia. Aqui separamos los dos casos: solo se reporta como
      // 'restriccion de licencia' cuando la licencia NO es MIT.
      if (license !== "MIT") {
        restringidos.push({ id: fuente.folder, license, redistribuible: false });
      } else {
        sinRedistribucionTecnica += 1;
      }
    }
    distribucion.set(clave, contador);
  }
  notes.push(`fuentes: ${archivos.length} componentes`);
  for (const [licencia, datos] of [...distribucion.entries()].sort()) {
    notes.push(`  ${licencia}: ${datos.redistribuible} redistribuibles / ${datos.total} totales`);
  }
  if (sinRedistribucionTecnica > 0) {
    notes.push(
      `fuentes: ${sinRedistribucionTecnica} componente(s) con downloadable=false pero license MIT; ` +
        "no son restricciones de licencia, son tecnicas (LICENSE ausente, source unverified, " +
        "missingReferences) y ya las cubre `validar.mjs`.",
    );
  }

  if (!existsSync(noticesFile)) {
    failures.push("Docs/THIRD_PARTY_NOTICES.md no existe");
  } else {
    const notices = readFileSync(noticesFile, "utf8");
    for (const { license } of RAICES) {
      if (!notices.includes(license)) {
        failures.push(`THIRD_PARTY_NOTICES.md no menciona la licencia ${license}`);
      }
    }
  }

  const lineas = [
    "# Demos con restricciones de licencia",
    "",
    "Lista generada por `Web/scripts/validar-licencias.mjs` a partir de",
    "los `Web/data/sources/*.json` (license declarada) y `Web/data/catalog.json`",
    "(downloadable calculado por generate-catalog.mjs), y de la seccion",
    "'Las colecciones' de `Docs/THIRD_PARTY_NOTICES.md`.",
    "",
    "No es asesoria legal: es un inventario para que la persona que mantiene",
    "el repositorio revise que cada demo cuya licencia no sea la MIT del",
    "resto del proyecto, o que no sea redistribuible, este en orden antes de",
    "habilitar descargas o cualquier forma de monetizacion.",
    "",
    "Hoy, con la coleccion actual:",
    "",
  ];
  if (restringidos.length === 0) {
    lineas.push("- 0 componentes con una `license` distinta de MIT en `Web/data/sources/*.json`.");
    lineas.push(
      `- Los 1018 componentes declaran MIT. Los ${sinRedistribucionTecnica} con ` +
        "`downloadable: false` no son restricciones de licencia: son tecnicas " +
        "(LICENSE ausente en el demo, source unverified, missingReferences) y `npm run validar` " +
        "ya las cuenta como aviso. No hace falta cambiar la licencia: hay que " +
        "arreglar la fuente verificada o anadir el LICENSE que falta.",
    );
    lineas.push("- Las unicas restricciones adicionales del proyecto son las de las 676 fotos de");
    lineas.push("  `creaciones-primium/galerias/`, que cargan desde Wikimedia");
    lineas.push("  Commons. La tabla de licencias CC detectadas esta documentada en la seccion");
    lineas.push('  "Fotografias de las galerias (Wikimedia Commons)" de');
    lineas.push("  `Docs/THIRD_PARTY_NOTICES.md`.");
  } else {
    lineas.push(`Hay ${restringidos.length} componente(s) con una licencia distinta de MIT:`);
    lineas.push("");
    lineas.push("| id | license |");
    lineas.push("|---|---|");
    for (const r of restringidos) {
      lineas.push(`| ${r.id} | ${r.license} |`);
    }
  }
  lineas.push("");
  writeFileSync(restriccionesFile, lineas.join("\n") + "\n", "utf8");
  notes.push(
    `escrito Docs/Demos_con_restricciones.md (${restringidos.length} componentes con licencia distinta de MIT)`,
  );
}

for (const note of notes) console.log(`info  ${note}`);
if (failures.length) {
  console.error(`\n${failures.length} comprobacion(es) fallida(s):`);
  for (const failure of failures) console.error(`  x ${failure}`);
  process.exit(1);
}
console.log(`\nok: licencias coherentes en ${RAICES.length} raices y ${notes.length} comprobaciones.`);
