/**
 * Escribe el `<lastmod>` de cada URL del sitemap (Fase 7.4).
 *
 * Por que existe: un sitemap sin fecha le dice a Google lo poco que se ha
 * tocado la web y el buscador deja de venir. Con la fecha, rastrea primero lo
 * que ha cambiado. La fecha no se redacta a mano: se lee de git, que es la
 * unica fuente que no miente sobre cuando se toco un fichero por ultima vez.
 *
 * Que hace: por cada `<loc>` del `Web/sitemap.xml` comprueba a que fichero del
 * repositorio corresponde, le pide a git su ultimo commit
 * (`git log -1 --format=%cs -- <fichero>`) y deja la etiqueta justo detras de
 * la URL. Antes de nada borra cualquier `<lastmod>` que ya estuviera, para que
 * una fecha vieja no se quede colgada de una pagina que cambio.
 *
 * Si git no puede contestar — clon superficial (Vercel usa `fetch-depth: 1`),
 * `.git` ausente, comando de git no disponible — **se omite la etiqueta**. Un
 * sitemap sin `<lastmod>` es valido; uno con una fecha inventada es una
 * mentira que el buscador acaba pagando.
 *
 *   node Web/scripts/generar-sitemap.mjs
 *
 * Se ejecuta al final del `buildCommand` de vercel.json, despues del catalogo,
 * el sellado y los ZIP.
 */
import { execFile } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const ejecutar = promisify(execFile);

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryDirectory = path.resolve(scriptDirectory, "../..");
const sitemap = path.join(repositoryDirectory, "Web", "sitemap.xml");

/** `https://host/Web/` -> `Web/index.html`; `.../Web/x.html` -> `Web/x.html`. */
function ficheroDe(loc) {
  try {
    let ruta = decodeURIComponent(new URL(loc).pathname);
    if (ruta.endsWith("/")) ruta = `${ruta}index.html`;
    return ruta.replace(/^\//, "");
  } catch {
    return null;
  }
}

async function ultimaModificacion(ruta) {
  if (!ruta) return null;
  try {
    const { stdout } = await ejecutar(
      "git",
      ["log", "-1", "--format=%cs", "--", path.join(repositoryDirectory, ruta)],
      { cwd: repositoryDirectory, encoding: "utf8" },
    );
    const fecha = stdout.trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(fecha) ? fecha : null;
  } catch {
    return null;
  }
}

let contenido = await readFile(sitemap, "utf8");

// Primero se limpian las fechas que hubiera: si este fichero no se puede
// fechar ahora, no debe quedarse con la ultima que se escribio.
contenido = contenido.replace(/[^\S\r\n]*<lastmod>[^<]*<\/lastmod>\r?\n?/g, "");

const locs = [...contenido.matchAll(/<loc>([^<]+)<\/loc>/g)].map((coincidencia) => coincidencia[1]);
const fechas = [];
for (const loc of locs) fechas.push(await ultimaModificacion(ficheroDe(loc)));

let posicion = -1;
let conFecha = 0;
contenido = contenido.replace(/<\/loc>/g, () => {
  posicion += 1;
  const fecha = fechas[posicion];
  if (!fecha) return "</loc>";
  conFecha += 1;
  return `</loc>\n    <lastmod>${fecha}</lastmod>`;
});

await writeFile(sitemap, contenido, "utf8");

const sinFecha = locs.length - conFecha;
console.log(`info  ${locs.length} URLs del sitemap: ${conFecha} con <lastmod>, ${sinFecha} sin fecha`);
if (sinFecha) {
  console.log(`      git no dio historial para esas: la etiqueta se omite en vez de inventarla`);
}
