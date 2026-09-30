/**
 * Sella la version de los assets en los HTML, en el despliegue.
 *
 * Por que existe: `vercel.json` sirve `/Web/styles/*` y `/Web/scripts/*` con
 * `Cache-Control: immutable` y un año de vida, asi que cambiar un CSS o un
 * script no se ve hasta que cambia la cadena `?v=` de la etiqueta que los
 * carga. Ese cambio era manual y se olvidaba: por eso el valor de ahora
 * (`?v=20260930-5`) no significa nada, solo que alguien lo subio a mano.
 *
 * Que hace: recorre los HTML de `Web/`, y para cada URL local que ya lleva
 * `?v=` pone la huella del contenido del fichero al que apunta (ocho
 * caracteres de sha256). Cada asset lleva su propia huella, de forma que un
 * cambio en `site.css` no invalida el `app.js` que no ha cambiado.
 *
 *   node Web/scripts/stamp-assets.mjs
 *
 * En local no hace nada a proposito, para no ensuciar el arbol de trabajo ni
 * que un `git status` llame la atencion: solo sella si esta `VERCEL=1` (lo pone
 * el despliegue) o si se pasa `--force`, que es lo que se usa para ver en local
 * que URLs quedarian. Como el despliegue siempre sella, lo que hay en el HTML
 * del repositorio es solo un marcador legible (`?v=20260930-5`), no el valor
 * que llega al visitante.
 */
import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const webDirectory = path.resolve(scriptDirectory, "..");
const largoHuella = 8;
const forzar = process.argv.includes("--force");
const enVercel = process.env.VERCEL === "1";

if (!forzar && !enVercel) {
  console.log("info: no hay nada que sellar (solo sella en el despliegue, con VERCEL=1 o --force).");
  process.exit(0);
}

/** URL local con ?v= dentro de un HTML: href o src que empiezan por ./ */
const CON_VERSION = /(\b(?:href|src)=")(\.[^"?]+)\?v=[^"]*(")/g;

const huellaDe = (contenido) => createHash("sha256").update(contenido).digest("hex").slice(0, largoHuella);

const htmlFiles = (await readdir(webDirectory, { withFileTypes: true }))
  .filter((entrada) => entrada.isFile() && entrada.name.endsWith(".html"))
  .map((entrada) => entrada.name)
  .sort();

const pendientes = [];
let sellados = 0;

for (const nombre of htmlFiles) {
  const rutaHtml = path.join(webDirectory, nombre);
  const original = await readFile(rutaHtml, "utf8");

  const cambios = new Map();
  for (const coincidencia of original.matchAll(CON_VERSION)) {
    const [, apertura, relativa] = coincidencia;
    if (cambios.has(relativa)) continue;
    const rutaAsset = path.resolve(webDirectory, relativa);
    let contenido;
    try {
      contenido = await readFile(rutaAsset);
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      throw new Error(`${nombre}: apunta a ${relativa}, que no existe`);
    }
    cambios.set(relativa, huellaDe(contenido));
  }

  if (!cambios.size) continue;

  const eol = original.includes("\r\n") ? "\r\n" : "\n";
  const salida = original.replace(CON_VERSION, (todo, apertura, relativa, cierre) => {
    const huella = cambios.get(relativa);
    const selloViejo = todo.slice(todo.indexOf("?v=") + 3, -1);
    if (selloViejo === huella) return todo;
    sellados += 1;
    pendientes.push(`${nombre} -> ${relativa}?v=${huella}`);
    return `${apertura}${relativa}?v=${huella}${cierre}`;
  });

  if (salida === original) continue;
  // Se escribe tal cual, para conservar los finales de linea del fichero.
  await writeFile(rutaHtml, salida, "utf8");
}

console.log(`Sellados ${sellados} recursos en ${htmlFiles.length} HTML (huella de ${largoHuella} caracteres por asset).`);
for (const linea of pendientes.slice(0, 12)) console.log(`  ${linea}`);
if (pendientes.length > 12) console.log(`  ... y ${pendientes.length - 12} mas`);
