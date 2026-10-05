/**
 * Localiza las imagenes que los demos piden a Wikimedia y las baja al repo.
 *
 * Por que existe: 85 demos de `creaciones-primium/galerias/` traen sus fotos
 * desde `upload.wikimedia.org`, de modo que cada visita le dice a un tercero
 * que esta mirando la libreria y, si Wikimedia cae o bloquea la peticion, el
 * demo se queda sin imagenes. Aqui se pasan a estar dentro de cada carpeta.
 *
 *   node Web/scripts/localizar-imagenes.mjs --dry-run   solo inventario
 *   node Web/scripts/localizar-imagenes.mjs             inventario + descarga
 *
 * `--dry-run` (5.1) saca:
 *   - las URLs unicas que hay que bajar
 *   - el tamano estimado, con el Content-Length de una peticion HEAD
 *   - la distribucion por demo
 *   - las referencias que NO son una URL literal (construidas en JS)
 *
 * La descarga (5.2) guarda cada imagen en `<demo>/img/<sha256-12>.<ext>`, una
 * carpeta por demo porque cada demo se empaqueta en su propio ZIP, y reescribe
 * la referencia en html, css y js. No se recomprime ni se recorta nada.
 *
 * Politica de Wikimedia, obligatoria:
 *   - User-Agent identificable, nunca el del navegador
 *   - maximo 2 peticiones por segundo
 *   - reintentos con espera creciente ante un 429
 */
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryDirectory = path.resolve(scriptDirectory, "..", "..");

const RAICES = ["creaciones-primium", "CreacionesNuevas", "DavokerDiseñador"];
const EXTENSIONES = new Set([".html", ".css", ".js"]);
const USER_AGENT = "Libreria_HTML_CSS-asset-fetcher/1.0 (https://github.com/kindred-98/Libreria_HTML_CSS)";
const ESPERA_ENTRE_PETICIONES = 500; // 2 por segundo, como pide la politica
const REINTENTOS_MAX = 4;

const soloInventario = process.argv.includes("--dry-run");
const inventarioFile = path.join(repositoryDirectory, "Web", "data", "inventario-imagenes.json");
const cacheFile = path.join(repositoryDirectory, "Web", "data", "imagenes-head.json");

// --- Lectura -----------------------------------------------------------------

async function caminar(directorio) {
  const encontrados = [];
  const entradas = await readdir(directorio, { withFileTypes: true });
  for (const entrada of entradas) {
    const ruta = path.join(directorio, entrada.name);
    if (entrada.isDirectory()) encontrados.push(...await caminar(ruta));
    else if (EXTENSIONES.has(path.extname(entrada.name))) encontrados.push(ruta);
  }
  return encontrados;
}

// URL de imagen del CDN de subida. Termina antes de comillas, espacios, cierres
// de agrupacion o etiqueta: en el codigo aparecen dentro de "..." o de url(...).
const URL_IMAGEN = /https:\/\/upload\.wikimedia\.org\/[^\s"'`<>)\]]+/g;
const URL_PAGINA = /https:\/\/commons\.wikimedia\.org\/\S+/g;

function extensionDe(url) {
  const sinQuery = url.split("?")[0];
  const ultimo = sinQuery.slice(sinQuery.lastIndexOf("/") + 1);
  // `.../thumb/a/ab/X.jpg/960px-X.jpg` o `.../lossy-page1-960px-X.tif.jpg`
  const punto = ultimo.lastIndexOf(".");
  if (punto <= 0) return ".jpg";
  const ext = ultimo.slice(punto).toLowerCase();
  return /^\.[a-z0-9]{1,5}$/.test(ext) ? ext : ".jpg";
}

async function leerInventario() {
  const imagenes = new Map(); // url -> { url, demos: Set<dir>, usos: number }
  const paginas = new Map();  // url de ficha de Commons -> Set<dir>
  const literales = [];       // referencias construidas, no literales
  const archivos = [];

  for (const raiz of RAICES) {
    const base = path.join(repositoryDirectory, raiz);
    let ficheros;
    try {
      ficheros = await caminar(base);
    } catch {
      continue;
    }
    archivos.push(...ficheros);
  }

  for (const archivo of archivos) {
    const texto = await readFile(archivo, "utf8");
    if (!texto.includes("wikimedia")) continue;
    const relativo = path.relative(repositoryDirectory, archivo);
    const demo = path.relative(repositoryDirectory, path.dirname(archivo)).split(path.sep).join("/");
    const lineas = texto.split(/\r?\n/);

    lineas.forEach((linea, indice) => {
      if (!linea.includes("wikimedia")) return;

      for (const url of linea.match(URL_IMAGEN) ?? []) {
        let registro = imagenes.get(url);
        if (!registro) imagenes.set(url, (registro = { url, demos: new Set(), usos: 0 }));
        registro.demos.add(demo);
        registro.usos += 1;
      }
      for (const url of linea.match(URL_PAGINA) ?? []) {
        if (!paginas.has(url)) paginas.set(url, new Set());
        paginas.get(url).add(demo);
      }

      // Lo que quede citando a wikimedia despues de quitar las URLs literales
      // es una referencia construida: hay que verla a mano.
      const resto = linea
        .replace(URL_IMAGEN, "")
        .replace(URL_PAGINA, "");
      if (resto.includes("wikimedia")) {
        literales.push({
          archivo: relativo,
          linea: indice + 1,
          texto: linea.trim().slice(0, 200),
        });
      }
    });
  }

  return { imagenes, paginas, literales, ficheros: archivos.length };
}

// --- Red ---------------------------------------------------------------------

function esperar(milisegundos) {
  return new Promise((resolver) => setTimeout(resolver, milisegundos));
}

let ultimaPeticion = 0;
async function peticion(url, metodo) {
  for (let intento = 0; intento < REINTENTOS_MAX; intento++) {
    const espera = ultimaPeticion + ESPERA_ENTRE_PETICIONES - Date.now();
    if (espera > 0) await esperar(espera);
    ultimaPeticion = Date.now();

    let respuesta;
    try {
      respuesta = await fetch(url, { method: metodo, headers: { "User-Agent": USER_AGENT }, redirect: "follow" });
    } catch (error) {
      await esperar(1000 * 2 ** intento);
      continue;
    }
    if (respuesta.status === 429 || respuesta.status >= 500) {
      const retraso = Number(respuesta.headers.get("retry-after")) * 1000 || 1000 * 2 ** intento;
      await esperar(retraso);
      continue;
    }
    return respuesta;
  }
  return null;
}

async function medir(url) {
  const respuesta = await peticion(url, "HEAD");
  if (!respuesta || !respuesta.ok) return { bytes: null, motivo: respuesta ? `HTTP ${respuesta.status}` : "sin respuesta" };
  const largo = Number(respuesta.headers.get("content-length"));
  if (!Number.isFinite(largo)) return { bytes: null, motivo: "sin Content-Length" };
  return { bytes: largo, motivo: null };
}

// Las HEAD van a 2/s, asi que una repetida del inventario tardaria 3 minutos
// y aportaria lo mismo: se guardan los resultados y solo se consulta lo nuevo.
async function cargarCache() {
  try {
    return JSON.parse(await readFile(cacheFile, "utf8"));
  } catch {
    return {};
  }
}

// --- Programa ----------------------------------------------------------------

const { imagenes, paginas, literales, ficheros } = await leerInventario();
const urls = [...imagenes.keys()].sort((a, b) => a.localeCompare(b));

const porDemo = new Map();
for (const registro of imagenes.values()) {
  for (const demo of registro.demos) {
    if (!porDemo.has(demo)) porDemo.set(demo, new Set());
    porDemo.get(demo).add(registro.url);
  }
}

const lineas = [];
const empujar = (texto = "") => { lineas.push(texto); console.log(texto); };

empujar("");
empujar(`INVENTARIO DE IMAGENES DE WIKIMEDIA  (${soloInventario ? "dry-run" : "descarga"})`);
empujar("=".repeat(74));
empujar(`ficheros html/css/js recorridos : ${ficheros}`);
empujar(`URLs unicas de imagen          : ${urls.length}`);
empujar(`referencias totales            : ${[...imagenes.values()].reduce((n, r) => n + r.usos, 0)}`);
empujar(`demos afectados                : ${porDemo.size}`);
empujar(`fichas de Commons (no imagen)  : ${paginas.size}`);

// --- Tamano ---

const cache = await cargarCache();
const bytes = new Map();      // url -> bytes conocidos (null si sin tamano)
const pendientes = [];
for (const url of urls) {
  if (Object.hasOwn(cache, url)) bytes.set(url, cache[url]);
  else pendientes.push(url);
}

empujar("");
if (pendientes.length) {
  empujar(`midiendo ${pendientes.length} URL(s) con HEAD (2 peticiones/s)...`);
  let hechas = 0;
  for (const url of pendientes) {
    const medido = await medir(url);
    cache[url] = medido.bytes;
    bytes.set(url, medido.bytes);
    hechas += 1;
    if (hechas % 50 === 0) process.stdout.write(`  ${hechas}/${pendientes.length}...\r`);
  }
  await writeFile(cacheFile, `${JSON.stringify(cache, null, 2)}\n`, "utf8");
} else {
  empujar("todas las HEAD ya estaban en cache: nada que medir");
}

let total = 0;
let sinTamano = 0;
const fallidas = [];
for (const url of urls) {
  const valor = bytes.get(url);
  if (valor == null) {
    sinTamano += 1;
    fallidas.push({ url, motivo: cache[url] === null ? "sin tamano" : "no medida" });
  } else {
    total += valor;
  }
}

// El tamano que crece en el despliegue NO es el de las URLs unicas: cada demo
// guarda su propia copia, asi que hay que sumar por demo.
const bytesPorDemo = new Map();
for (const [demo, set] of porDemo) {
  let suma = 0;
  for (const url of set) suma += bytes.get(url) ?? 0;
  bytesPorDemo.set(demo, suma);
}
const totalDuplicado = [...bytesPorDemo.values()].reduce((a, b) => a + b, 0);

const MB = 1024 * 1024;
empujar("");
empujar("-".repeat(74));
empujar(`TAMANO ESTIMADO (URLs unicas)  : ${(total / MB).toFixed(2)} MB  (${total.toLocaleString("es-ES")} bytes)`);
empujar(`TAMANO EN EL DESPLIEGUE        : ${(totalDuplicado / MB).toFixed(2)} MB  (${totalDuplicado.toLocaleString("es-ES")} bytes)`);
empujar(`  (git guarda cada contenido una sola vez, asi que el repositorio crece`);
empujar(`   por el primero; el segundo es lo que pesa el despliegue, porque cada`);
empujar(`   demo lleva su propia copia dentro de su carpeta)`);
if (sinTamano) empujar(`sin Content-Length             : ${sinTamano} (no contabilizados)`);
empujar(`UMBRAL DEL PLAN                : 40 MB -> ${total / MB > 40 ? "SUPERADO: STOP, decision de Angel" : "NO superado"}`);
empujar("-".repeat(74));

// --- Por demo ---

const distribucion = [...porDemo.entries()]
  .map(([demo, set]) => ({ demo, urls: set.size, bytes: bytesPorDemo.get(demo) ?? 0 }))
  .sort((a, b) => b.bytes - a.bytes);

empujar("");
empujar("DISTRIBUCION POR DEMO (ordenado por tamano)");
for (const fila of distribucion) {
  empujar(`  ${String(fila.urls).padStart(3)} url  ${(fila.bytes / MB).toFixed(1).padStart(6)} MB  ${fila.demo}`);
}

// --- No literales ---

empujar("");
empujar(`REFERENCIAS QUE NO SON UNA URL LITERAL: ${literales.length}`);
for (const elemento of literales) {
  empujar(`  ${elemento.archivo}:${elemento.linea}`);
  empujar(`      ${elemento.texto}`);
}

if (fallidas.length) {
  empujar("");
  empujar(`URLS SIN TAMANO CONOCIDO: ${fallidas.length}`);
  for (const f of fallidas) empujar(`  ${f.motivo}  ${f.url}`);
}

const informe = {
  generado: new Date().toISOString(),
  seco: soloInventario,
  ficheros: ficheros,
  urlsUnicas: urls.length,
  referenciasTotales: [...imagenes.values()].reduce((n, r) => n + r.usos, 0),
  demos: porDemo.size,
  bytesConocidos: total,
  mbConocidos: Number((total / MB).toFixed(2)),
  bytesDespliegue: totalDuplicado,
  mbDespliegue: Number((totalDuplicado / MB).toFixed(2)),
  umbralMb: 40,
  superaUmbral: total / MB > 40,
  sinTamano: sinTamano,
  fichasCommons: paginas.size,
  noLiterales: literales,
  sinTamanoDetalle: fallidas,
  distribucion,
  urls,
};

await mkdir(path.dirname(inventarioFile), { recursive: true });
await writeFile(inventarioFile, `${JSON.stringify(informe, null, 2)}\n`, "utf8");
empujar("");
empujar(`informe: ${path.relative(repositoryDirectory, inventarioFile)}`);

if (soloInventario) process.exit(0);
