/**
 * Comprobacion de la lista blanca de extensiones en las carpetas de los demos.
 *
 *   node Web/scripts/validar-extensiones.mjs
 *
 * Que comprueba y por que:
 *
 * 1. Cada fichero de las carpetas de los demos tiene una extension de la
 *    lista blanca (`Web/scripts/lib/extensiones.mjs`), es un `LICENSE` (sin
 *    extension, cientos de ellos) o es un fichero de sistema que no se
 *    versiona (Thumbs.db, desktop.ini).
 * 2. Ningun `.svg` lleva `<script`, atributos de evento `on*=` ni
 *    `javascript:`: un SVG es un contenedor de script, no una imagen.
 *
 * El alcance son las raices de las colecciones (DavokerDiseñador,
 * CreacionesNuevas, creaciones-primium), que es donde un fichero nuevo puede
 * colarse y acabar servido o empaquetado. Los `.zip` se saltan: son la SALIDA
 * de build-zips.mjs, ya cubierta por su propia comprobacion. Los enlaces
 * simbolicos no se siguen (`entry.isFile()` es `false` para ellos), igual que
 * en generate-catalog.
 *
 * La lista de raices no se teclea aqui: la recibe quien llama (validate.mjs
 * la deriva del catalogo, generate-catalog usa las suyas), para que exista un
 * unico sitio donde se declara que carpetas son de demos.
 *
 * Sale con codigo 1 si hay fallos, para poder encadenarlo en CI.
 */
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { comprobarFichero } from "./lib/extensiones.mjs";

/** Ficheros de sistema que los navegadores de Windows dejan en las carpetas. */
const FICHEROS_SISTEMA = new Set(["Thumbs.db", "desktop.ini"]);

/**
 * Recorre `directorio` y acumula las rutas absolutas de sus ficheros.
 *
 * @param {string} directorio Carpeta que recorrer.
 * @param {string[]} acumulado Array que se rellena con las rutas.
 * @returns {Promise<void>}
 */
async function caminar(directorio, acumulado) {
  for (const entrada of await readdir(directorio, { withFileTypes: true })) {
    if (entrada.name.startsWith(".")) continue;
    if (FICHEROS_SISTEMA.has(entrada.name)) continue;
    const ruta = path.join(directorio, entrada.name);
    if (entrada.isDirectory())
      await caminar(ruta, acumulado); // NOSONAR (S9382): el orden de `acumulado` debe seguir el paseo en profundidad de readdir; paralelizar cambiariamos ese orden y los `fallos` se anadiriamos en otro orden.
    else if (entrada.isFile() && !entrada.name.toLowerCase().endsWith(".zip")) acumulado.push(ruta);
  }
}

/**
 * Ejecuta la comprobacion sobre las raices dadas.
 *
 * @param {string} raiz Ruta absoluta de la raiz del repositorio (para las
 *   rutas relativas de los mensajes).
 * @param {string[]} directorios Carpetas absolutas que recorrer (las raices
 *   de las colecciones de demos).
 * @returns {Promise<{fallos: string[], comprobados: number}>}
 *
 * Se puede importar desde un test apuntando a un repositorio temporal, con
 * lo que se prueba el `.exe` simulado del plan sin tocar los ficheros reales.
 */
export async function comprobarExtensiones(raiz, directorios) {
  /** @type {string[]} */
  const fallos = [];
  let comprobados = 0;

  for (const directorio of directorios) {
    /** @type {string[]} */
    const ficheros = [];
    try {
      await caminar(directorio, ficheros); // NOSONAR (S9382): `fallos` se imprime en el orden en que se anade; paralelizar entre las raices del plan cambiariamos ese orden.
    } catch (error) {
      const relativa = path.relative(raiz, directorio).split(path.sep).join("/");
      fallos.push(
        `${relativa}: no se puede recorrer (${error instanceof Error ? error.message : String(error)})`,
      );
      continue;
    }
    for (const ruta of ficheros) {
      comprobados += 1;
      const relativa = path.relative(raiz, ruta).split(path.sep).join("/");
      let contenido;
      if (ruta.toLowerCase().endsWith(".svg")) {
        contenido = await readFile(ruta, "utf8"); // NOSONAR (S9382): `fallos` se imprime en el orden en que se anade; paralelizar entre ficheros del mismo directorio cambiariamos ese orden.
      }
      for (const fallo of comprobarFichero(relativa, contenido)) {
        fallos.push(`${relativa}: ${fallo}`);
      }
    }
  }

  return { fallos, comprobados };
}

// Solo se ejecuta como script: importado desde un test o desde
// generate-catalog.mjs no debe imprimir ni salir con codigo de error.
const esPrincipal =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (esPrincipal) {
  const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
  // Las raices no se teclean: salen del catalogo, que es donde
  // generate-catalog.mjs declara sus libraryRoots.
  let catalogo;
  try {
    catalogo = JSON.parse(await readFile(path.join(raiz, "Web", "data", "catalog.json"), "utf8"));
  } catch {
    console.error("extensiones: no se puede leer Web/data/catalog.json (ejecuta `npm run catalogo` antes).");
    process.exit(1);
  }
  const raices = [...new Set(catalogo.map((componente) => componente.root))].filter(Boolean);
  const directorios = raices.map((nombre) => path.join(raiz, nombre));
  const { fallos, comprobados } = await comprobarExtensiones(raiz, directorios);
  if (fallos.length > 0) {
    console.error(`extensiones: ${fallos.length} fichero(s) fuera de la lista blanca:`);
    for (const fallo of fallos) console.error(`  - ${fallo}`);
    process.exit(1);
  }
  console.log(`ok: ${comprobados} ficheros de ${raices.length} colecciones con extension permitida`);
}
