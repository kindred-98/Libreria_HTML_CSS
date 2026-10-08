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

import { leerDireccion } from "./lib/donacion.mjs";
import { lineasInnerHtmlConConcatenacion } from "./lib/inyeccion.mjs";

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
    fail(
      "sintaxis",
      `${relative}: ${
        String(error.stderr ?? error.message)
          .trim()
          .split("\n")[0]
      }`,
    );
  }
}

// El catalogo no se versiona, asi que en un clon nuevo todavia no existe. Es lo
// primero que se comprueba para no soltar un error de Node ilegible.
if (!(await exists(catalogFile))) {
  console.error(
    "x Web/data/catalog.json no existe.\n" +
      "  El catalogo es un artefacto generado y no se versiona.\n" +
      "  Genera el primero:  node Web/scripts/generate-catalog.mjs\n" +
      "  (Vercel lo hace solo en el build; en local hay que lanzarlo a mano.)",
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
  fail(
    "referencias",
    `${id} apunta a ${references.length} fichero(s) inexistente(s): ${references.join(", ")}`,
  );
}

// 5. Todo demo del disco tiene que estar en el catalogo. Este es el aviso que
//    evita que un demo nuevo no aparezca nunca en la web. Solo cuentan los
//    index.html: la portada de davoker (davoker.html) no es un componente.
const libraryRoots = [...new Set(catalog.map((component) => component.root))];
for (const root of libraryRoots) {
  const rootDirectory = path.join(repositoryDirectory, root);
  const onDisk = new Set(
    (await findHtmlPages(rootDirectory)).map((page) =>
      path
        .relative(rootDirectory, path.dirname(page))
        .split(path.sep)
        .join("/")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
    ),
  );
  const indexed = new Set(
    catalog.filter((component) => component.root === root).map((component) => component.id),
  );
  for (const id of onDisk) {
    if (!indexed.has(id)) {
      fail(
        "catalogo desactualizado",
        `${root}/${id}/ tiene index.html pero no esta en catalog.json; ejecuta node Web/scripts/generate-catalog.mjs`,
      );
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
notes.push(
  `${catalog.length} componentes · ${catalog.length - unverifiable} descargables · ${unverifiable} sin redistribucion`,
);

// 7. Todo <iframe> de las paginas del sitio lleva sandbox. Si no, el demo
//    corre en el mismo origen y ve el `localStorage` (incluido el consentimiento
//    de cookies). Un cambio asi pasa este check antes de llegar a main.
const htmlFiles = [
  path.join(repositoryDirectory, "Web", "index.html"),
  path.join(repositoryDirectory, "Web", "components.html"),
  path.join(repositoryDirectory, "Web", "team-core.html"),
  path.join(repositoryDirectory, "index.html"),
  path.join(repositoryDirectory, "404.html"),
];
const iframeTag = /<iframe\b[^<>]*>/gi;
for (const htmlFile of htmlFiles) {
  if (!(await exists(htmlFile))) continue;
  const relative = path.relative(repositoryDirectory, htmlFile);
  const texto = await readFile(htmlFile, "utf8");
  for (const match of texto.matchAll(iframeTag)) {
    const tag = match[0];
    if (!/\bsandbox\s*=/.test(tag)) {
      fail("iframe", `${relative} tiene un <iframe> sin atributo sandbox (tag: ${tag})`);
    }
  }
}

// 8. La direccion de donacion tiene que ser la misma en las tres paginas del
//    sitio y en app.js. Si alguien cambia una sola, el pie queda apuntando a otra
//    cartera y los donativos se pierden; y si se cuela una direccion de tercero,
//    acaban en un desconocido. Se comprueba en CI porque lo comun es el cambio
//    accidental, no el malicioso, y un error asi no se nota al mirar la pagina.
//    La direccion no se teclea aqui: sale de Web/data/donacion.json, la fuente
//    unica, para que no haya dos constantes que puedan divergir. El barrido de
//    todo el repositorio vive en Web/scripts/validar-donacion.mjs, que corre en
//    el mismo paso de CI; aqui se comprueba la presencia en las cuatro copias
//    que el sitio carga de verdad.
let donationAddress = "";
try {
  donationAddress = leerDireccion(
    await readFile(path.join(repositoryDirectory, "Web", "data", "donacion.json"), "utf8"),
  );
} catch (error) {
  fail("donacion", `Web/data/donacion.json: ${error instanceof Error ? error.message : String(error)}`);
}
const donationFiles = [
  path.join(repositoryDirectory, "Web", "index.html"),
  path.join(repositoryDirectory, "Web", "components.html"),
  path.join(repositoryDirectory, "Web", "team-core.html"),
  path.join(repositoryDirectory, "Web", "scripts", "app.js"),
];
for (const donationFile of donationFiles) {
  const relative = path.relative(repositoryDirectory, donationFile);
  if (!(await exists(donationFile))) {
    fail("donacion", `${relative} no existe`);
    continue;
  }
  const texto = await readFile(donationFile, "utf8");
  const found = [...texto.matchAll(/0x[a-fA-F0-9]{40}/g)].map((match) => match[0]);
  // Con la fuente ilegible el fallo ya esta anotado: comparar contra "" marcaria
  // la buena como ajena en todos los ficheros y taparia el problema de raiz.
  if (!donationAddress) continue;
  // Las tres paginas tienen que llevarla; app.js solo se lee, no se exige.
  if (donationFile.toLowerCase().endsWith(".html") && !found.includes(donationAddress)) {
    fail("donacion", `${relative} no contiene la direccion de donacion ${donationAddress}`);
  }
  // Nadie puede traer otra, venga de donde venga.
  for (const address of new Set(found.filter((value) => value !== donationAddress))) {
    fail("donacion", `${relative} contiene ${address}, distinta de la esperada ${donationAddress}`);
  }
}

// 9. Aviso, no fallo: un demo que anima con CSS y no escucha
//    `prefers-reduced-motion`. No corta el CI porque no es una rotura: es una
//    comodidad que se puede llegar a necesitar mas alla de este repositorio y
//    porque los demos que solo animan desde JavaScript no se pueden resolver con
//    CSS. Sirve para que un demo nuevo no se cuele sin el bloque que ya tienen
//    todos los demas. La categoria Loaders queda fuera: ahi la animacion es la
//    informacion.
const warnings = [];
const catalogFolder = new Map();
for (const component of catalog) {
  const folder =
    component.folder ??
    (typeof component.preview === "string"
      ? component.preview.replace(/^\.\.\//, "").replace(/\/index\.html$/, "")
      : null);
  if (folder) catalogFolder.set(component.id, folder);
}
for (const component of catalog) {
  if (component.category === "Loaders") continue;
  const folder = catalogFolder.get(component.id);
  if (!folder) continue;
  const directory = path.join(repositoryDirectory, folder);
  // `exists()` comprueba `isFile()`, asi que no sirve aqui: lo que hay que
  // comprobar es que la carpeta del demo este en disco.
  let entradas;
  try {
    entradas = await readdir(directory, { withFileTypes: true });
  } catch {
    continue;
  }

  let css = "";
  for (const entry of entradas) {
    if (entry.isFile() && entry.name.toLowerCase().endsWith(".css")) {
      css += await readFile(path.join(directory, entry.name), "utf8");
    }
  }
  if (!css) {
    const page = await readFile(path.join(directory, "index.html"), "utf8");
    css = [...page.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]).join("\n");
  }
  const limpio = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const animaConCSS =
    /@keyframes\b/.test(limpio) ||
    /\banimation(?:-\w+)?\s*:/.test(limpio) ||
    /\btransition(?:-\w+)?\s*:/.test(limpio);
  if (animaConCSS && !/prefers-reduced-motion/.test(css)) warnings.push(component.id);
}
if (warnings.length) {
  const lista = warnings.slice(0, 20).join(", ") + (warnings.length > 20 ? ", ..." : "");
  console.log(
    `AVISO: ${warnings.length} demo(s) animan con CSS sin escuchar prefers-reduced-motion: ${lista}\n` +
      "       Anade el bloque de Web/scripts/add-reduced-motion.mjs (ver CONTRIBUTING, regla 7).",
  );
}

// 10. Ningun demo monta HTML concatenando datos en `innerHTML` (P0-2). La gente
//     copia estos demos a aplicaciones reales, y el patron
//     `innerHTML = '...' + dato` es un XSS en cuanto el dato venga del usuario:
//     hoy los datos son fijos, pero el patron se copia tal cual.
//
//     Excepciones permitidas: asignar la cadena vacia para vaciar y literales
//     estaticos sin variables (aunque lleven signos entre comillas). Concatenar
//     sobre `textContent` o montar con createElement/append es seguro siempre y
//     la regla no lo toca. El detalle del analisis vive en lib/inyeccion.mjs.
//
//     Alcance: cualquier `.js` del repositorio salvo vendor/ (codigo de un
//     tercero que se copia tal cual), Web/data/ (artefactos generados: el
//     catalogo incrusta las fuentes de los demos) y GevendraAutorExterno/
//     (copia local no versionada de un tercero, fuera del repo hasta que su
//     autor autorice la redistribucion, ver THIRD_PARTY_NOTICES). Tambien se
//     saltan las carpetas de dependencias y temporales por el mismo motivo
//     que en el resto del script.
const carpetasNoEscanear = new Set([
  "node_modules",
  "tmp",
  "temp",
  "dist",
  "build",
  "coverage",
  "GevendraAutorExterno",
  "vendor",
]);
async function findJavascriptFiles(directory, acc) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      const relative = path.relative(repositoryDirectory, entryPath).split(path.sep).join("/");
      if (carpetasNoEscanear.has(entry.name) || relative === "Web/data") continue;
      await findJavascriptFiles(entryPath, acc);
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".js")) {
      acc.push(entryPath);
    }
  }
}
const javascriptDemoFiles = [];
await findJavascriptFiles(repositoryDirectory, javascriptDemoFiles);
for (const javascriptFile of javascriptDemoFiles) {
  const relative = path.relative(repositoryDirectory, javascriptFile);
  const texto = await readFile(javascriptFile, "utf8");
  for (const linea of lineasInnerHtmlConConcatenacion(texto)) {
    fail(
      "inyeccion",
      `${relative}:${linea.numero}: innerHTML con concatenacion o interpolacion (linea: ${linea.texto})`,
    );
  }
}

for (const note of notes) console.log(`info  ${note}`);

if (failures.length) {
  console.error(`\n${failures.length} comprobacion(es) fallida(s):\n`);
  for (const failure of failures) console.error(`  x ${failure}`);
  process.exit(1);
}

console.log(`\nTodo correcto: ${catalog.length} componentes coherentes con el disco.`);
