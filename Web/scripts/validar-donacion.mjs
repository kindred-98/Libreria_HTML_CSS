/**
 * Comprobacion de la direccion de donacion en todo el repositorio.
 *
 *   node Web/scripts/validar-donacion.mjs
 *   npm run validar:donacion
 *
 * Que comprueba y por que:
 *
 * 1. La fuente unica (`Web/data/donacion.json`) existe y tiene formato.
 * 2. Las tres paginas del sitio llevan la direccion en el pie: si se borra,
 *    los donativos desaparecen sin que ningun otro validador se entere (los
 *    HTML no dejan de ser validos).
 * 3. Ningun HTML, JS o MD del repositorio contiene otra direccion `0x` + 40
 *    hexadecimal distinta de la esperada. Es la regla de "una sola
 *    direccion": el pie esta en todas las paginas y es lo mas valioso para
 *    un atacante con acceso de escritura. Una letra cambiada desvia los
 *    donativos a otra cartera y no se nota al mirar la pagina.
 *
 * La comprobacion 3 es intencionadamente de repo completo y no de los cuatro
 * ficheros que muestran la direccion: cualquier HTML, JS o MD que aparezca
 * con una direccion ajena puede ser un pegote accidental de otro proyecto o
 * una insercion deliberada, y en ambos casos el CI tiene que cortar.
 *
 * La direccion esperada NO se teclea aqui: se lee del JSON (fuente unica),
 * igual que hace `validate.mjs`. Con dos constantes el dia que cambie la
 * cartera habria que acordarse de los dos sitios.
 *
 * Sale con codigo 1 si hay fallos, para poder encadenarlo en CI.
 */
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { contieneEsperada, direccionesAjenas, leerDireccion } from "./lib/donacion.mjs";

/** Carpetas que nunca se escanean: dependencias, artefactos y basura de sistema. */
const CARPETAS_SALTAR = new Set(["node_modules", "tmp", "temp", "dist", "build", "coverage"]);

/** Solo estos formatos pueden llevar direcciones: HTML, JavaScript y Markdown. */
const EXTENSIONES = new Set([".html", ".htm", ".js", ".mjs", ".md"]);

/** Paginas que deben mostrar la direccion en su pie. */
const PAGINAS_OBLIGATORIAS = ["Web/index.html", "Web/components.html", "Web/team-core.html"];

/**
 * Recorre `directorio` y acumula las rutas absolutas de los ficheros con
 * alguna de las extensiones de `EXTENSIONES`.
 *
 * @param {string} directorio Carpeta que recorrer.
 * @param {string[]} acumulado Array que se rellena con las rutas.
 * @returns {Promise<void>}
 *
 * Las carpetas ocultas se saltan por empiezo por punto (`.git`, `.vercel`,
 * `.qodo`...) y el resto por la lista `CARPETAS_SALTAR`. Los enlaces
 * simbolicos no se siguen (`entry.isFile()` es `false` para ellos): recorrer
 * un enlace a una carpeta exterior multiplicaria el paseo y podria sacar
 * ficheros de fuera del repositorio.
 */
async function caminar(directorio, acumulado) {
  for (const entrada of await readdir(directorio, { withFileTypes: true })) {
    if (entrada.name.startsWith(".")) continue;
    const ruta = path.join(directorio, entrada.name);
    if (entrada.isDirectory()) {
      if (!CARPETAS_SALTAR.has(entrada.name))
        await caminar(ruta, acumulado); // NOSONAR (S9382): el orden de `acumulado` debe seguir el paseo en profundidad de readdir; paralelizar cambiariamos ese orden y los `fallos` se anadiriamos en otro orden.
    } else if (entrada.isFile() && EXTENSIONES.has(path.extname(entrada.name).toLowerCase())) {
      acumulado.push(ruta);
    }
  }
}

/**
 * Ejecuta toda la comprobacion sobre un repositorio dado.
 *
 * @param {string} raiz Ruta absoluta de la raiz del repositorio.
 * @returns {Promise<{fallos: string[], comprobados: number, esperada: string}>}
 *   Fallos (vacio si todo cuadra), ficheros escaneados y direccion esperada.
 *
 * Se puede importar desde un test apuntando a un repositorio temporal, con
 * lo que se comprueba que el validador falla con una direccion alterada sin
 * tocar los ficheros reales.
 */
export async function comprobarDonacion(raiz) {
  /** @type {string[]} */
  const fallos = [];

  const rutaFuente = path.join(raiz, "Web", "data", "donacion.json");
  /** @type {string} */
  let esperada;
  try {
    esperada = leerDireccion(await readFile(rutaFuente, "utf8"));
  } catch (error) {
    const detalle = error instanceof Error ? error.message : String(error);
    return {
      fallos: [`Web/data/donacion.json: ${detalle}`],
      comprobados: 0,
      esperada: "",
    };
  }

  // Las paginas del sitio tienen que mostrarla; si se borra del pie, los
  // donativos desaparecen y el resto de comprobaciones siguen en verde.
  for (const relativa of PAGINAS_OBLIGATORIAS) {
    const ruta = path.join(raiz, relativa);
    let texto;
    try {
      texto = await readFile(ruta, "utf8"); // NOSONAR (S9382): el orden de los `fallos` debe coincidir con el orden de PAGINAS_OBLIGATORIAS; paralelizar los invertiria.
    } catch {
      fallos.push(`${relativa}: no existe o no se puede leer`);
      continue;
    }
    if (!contieneEsperada(texto, esperada)) {
      fallos.push(`${relativa}: no contiene la direccion de donacion esperada`);
    }
  }

  // Repo completo: ninguna direccion ajena en HTML, JS o MD.
  /** @type {string[]} */
  const ficheros = [];
  await caminar(raiz, ficheros);
  for (const ruta of ficheros) {
    const relativa = path.relative(raiz, ruta).split(path.sep).join("/");
    let texto;
    try {
      texto = await readFile(ruta, "utf8"); // NOSONAR (S9382): cada fallo se empuja a `fallos` en el orden en que se recorre `ficheros`; paralelizar cambiariamos el orden de los mensajes de salida.
    } catch {
      fallos.push(`${relativa}: no se puede leer`);
      continue;
    }
    for (const ajena of direccionesAjenas(texto, esperada)) {
      fallos.push(`${relativa}: contiene la direccion ajena ${ajena}`);
    }
  }

  return { fallos, comprobados: ficheros.length, esperada };
}

// Solo se ejecuta como script: importado desde un test no debe imprimir ni
// salir con codigo de error, que eso se llevaria por delante al runner.
const esPrincipal =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (esPrincipal) {
  const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
  const { fallos, comprobados, esperada } = await comprobarDonacion(raiz);
  if (fallos.length > 0) {
    console.error(`donacion: ${fallos.length} fallo(s) con la direccion ${esperada || "(ilegible)"}:`);
    for (const fallo of fallos) console.error(`  - ${fallo}`);
    process.exit(1);
  }
  console.log(`ok: direccion de donacion ${esperada} coherente en ${comprobados} ficheros`);
}
