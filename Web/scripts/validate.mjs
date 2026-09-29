/**
 * Comprobaciones de integridad del sitio. No genera nada ni despliega: solo
 * verifica que el catalogo exista y sea coherente con los demos del disco.
 *
 *   node Web/scripts/generate-catalog.mjs   # genera el catalogo
 *   node Web/scripts/validate.mjs           # lo comprueba
 *
 * El catalogo es un artefacto generado y no se versiona, asi que en un clon
 * nuevo este script avisa de que hay que generar primero. Vercel hace esa
 * generacion en su build; en local hay que Lanzarla a mano.
 *
 * Sale con codigo 1 en cuanto hay un fallo, para poder encadenarlo en CI.
 */
import { execFileSync } from "node:child_process";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryDirectory = path.resolve(scriptDirectory, "../..");
const catalogFile = path.join(repositoryDirectory, "Web", "data", "catalog.json");
const sourcesDirectory = path.join(repositoryDirectory, "Web", "data", "sources");

const failures = [];
const notes = [];

function fail(area, detail) {
  failures.push(`${area}: ${detail}`);
}

async function exists(target) {
  try {
    return (await stat(target)).isFile();
  } catch {
    return false;
  }
}

async function findHtmlPages(directory) {
  const pages = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) pages.push(...(await findHtmlPages(entryPath)));
    else if (entry.isFile() && entry.name.toLowerCase() === "index.html") pages.push(entryPath);
  }
  return pages;
}

// 1. Sintaxis de los JavaScript que llegan al navegador y de los scripts de build.
const javascriptFiles = [
  "Web/scripts/app.js",
  "Web/scripts/zip.js",
  "Web/scripts/generate-catalog.mjs",
  "Web/scripts/catalog-format.mjs",
  "Web/scripts/validate.mjs",
  "Web/scripts/serve.mjs",
];
for (const relative of javascriptFiles) {
  const absolute = path.join(repositoryDirectory, relative);
  if (!(await exists(absolute))) {
    fail("sintaxis", `${relative} no existe`);
    continue;
  }
  try {
    execFileSync(process.execPath, ["--check", absolute], { stdio: "pipe" });
  } catch (error) {
    fail("sintaxis", `${relative}: ${String(error.stderr ?? error.message).trim().split("\n")[0]}`);
  }
}

// El catalogo no se versiona, asi que en un clon nuevo todavia no existe. Es lo
// primero que se comprueba para no soltar un error de Node ilegible.
if (!(await exists(catalogFile))) {
  console.error(
    "x Web/data/catalog.json no existe.\n"
    + "  El catalogo es un artefacto generado y no se versiona.\n"
    + "  Genera el primero:  node Web/scripts/generate-catalog.mjs\n"
    + "  (Vercel lo hace solo en el build; en local hay que lanzarlo a mano.)",
  );
  process.exit(1);
}

const catalog = JSON.parse(await readFile(catalogFile, "utf8"));
const catalogIds = new Set(catalog.map((component) => component.id));

if (catalogIds.size !== catalog.length) {
  fail("catalogo", `hay ${catalog.length - catalogIds.size} id duplicados`);
}

// 2. Cada entrada del indice tiene su fichero de codigo, y al reves.
const sourceIds = new Set(
  (await readdir(sourcesDirectory))
    .filter((name) => name.endsWith(".json"))
    .map((name) => name.slice(0, -".json".length)),
);
for (const id of catalogIds) {
  if (!sourceIds.has(id)) fail("sources", `falta sources/${id}.json para la entrada del catalogo`);
}
for (const id of sourceIds) {
  if (!catalogIds.has(id)) fail("sources", `sources/${id}.json sobra: no esta en catalog.json`);
}

// 3. La preview de cada entrada apunta a un index.html real.
for (const component of catalog) {
  const preview = path.resolve(repositoryDirectory, "Web", component.preview);
  if (!(await exists(preview))) {
    fail("preview", `${component.id} apunta a ${component.preview} y ese fichero no existe`);
  }
}

// 4. Referencias locales rotas dentro de los demos: el generador las detecta y las
//    avisa en la web, pero aqui se concentran para que no se cuelen.
/** @type {Map<string, string[]>} */
const brokenReferences = new Map();
for (const component of catalog) {
  if (component.missingReferences?.length) brokenReferences.set(component.id, component.missingReferences);
}
for (const [id, references] of brokenReferences) {
  fail("referencias", `${id} apunta a ${references.length} fichero(s) inexistente(s): ${references.join(", ")}`);
}

// 5. Todo demo del disco tiene que estar en el catalogo. Este es el aviso que
//    evita que un demo nuevo no aparezca nunca en la web. Solo cuentan los
//    index.html: la portada de davoker (davoker.html) no es un componente.
const libraryRoots = [...new Set(catalog.map((component) => component.root))];
for (const root of libraryRoots) {
  const rootDirectory = path.join(repositoryDirectory, root);
  const onDisk = new Set(
    (await findHtmlPages(rootDirectory)).map((page) =>
      path.relative(rootDirectory, path.dirname(page)).split(path.sep).join("/").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    ),
  );
  const indexed = new Set(
    catalog.filter((component) => component.root === root).map((component) => component.id),
  );
  for (const id of onDisk) {
    if (!indexed.has(id)) {
      fail("catalogo desactualizado", `${root}/${id}/ tiene index.html pero no esta en catalog.json; ejecuta node Web/scripts/generate-catalog.mjs`);
    }
  }
  for (const id of indexed) {
    if (!onDisk.has(id)) {
      fail("catalogo desactualizado", `catalog.json lista ${root}/${id} pero no hay index.html en disco`);
    }
  }
}

// 6. Aviso, no fallo: los demos de terceros no se pueden redistribuir.
const unverifiable = catalog.filter((component) => !component.downloadable).length;
notes.push(`${catalog.length} componentes · ${catalog.length - unverifiable} descargables · ${unverifiable} sin redistribucion`);

for (const note of notes) console.log(`info  ${note}`);

if (failures.length) {
  console.error(`\n${failures.length} comprobacion(es) fallida(s):\n`);
  for (const failure of failures) console.error(`  x ${failure}`);
  process.exit(1);
}

console.log(`\nTodo correcto: ${catalog.length} componentes coherentes con el disco.`);
