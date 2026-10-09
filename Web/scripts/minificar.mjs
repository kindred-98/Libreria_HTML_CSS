/**
 * Minifica los assets del sitio en el despliegue.
 *
 * Por que existe: el sitio se sirve con `Cache-Control: immutable` y un anio
 * de vida en `/Web/scripts/*` y `/Web/styles/*`, asi que lo que ahorre aqui es
 * lo que descarga cada visitante. Solo se minifica en el build de Vercel
 * (VERCEL=1) o con `--force`, nunca se toca el arbol del repositorio: en local
 * el script no hace nada a proposito, igual que `stamp-assets.mjs`.
 *
 * Que hace: pasa cada fichero de la lista por esbuild (`minify`) y lo
 * sobreescribe en el arbol de build con el MISMO nombre. Es a proposito: los
 * HTML apuntan a `./scripts/app.js` y `./styles/site.css`, y al conservar los
 * nombres no hay que reescribir ninguna referencia; el `stamp-assets` que viene
 * a continuacion en el `buildCommand` recalcula el `?v=` sobre el contenido
 * minificado, de forma que la huella del HTML y el fichero que se sirve
 * cambian siempre juntos. Los fuentes del repositorio no se minifican ni se
 * commitean: si aqui se cambia algo es solo en el contenedor de despliegue.
 *
 *   node Web/scripts/minificar.mjs --force
 *
 * `DavokerDiseñador/davoker.html` queda fuera: esbuild no procesa HTML y su
 * CSS y su JS van dentro de la propia pagina; minificarlos obligaria a
 * extraerlos con regex y a reinsertarlos, que es exactamente el tipo de
 * cambios que el smoke de demos no cubre. Se deja constancia aqui y en el
 * commit del plan (P1-2, paso 4).
 *
 * La tabla final (crudo y brotli, antes y despues) es la que va en la PR:
 * no se afirma ninguna mejora sin estas cifras.
 *
 * Importante: `validar`, `lint` y `typecheck` miran los fuentes del repositorio,
 * nunca este artefacto. Tras un `--force`, la regla de inyeccion (lee fichero a
 * fichero y linea a linea) y `eqeqeq` marcan falsos positivos sobre el codigo
 * ya juntado en una sola linea; el CI no los ve porque el build de CI no
 * minifica. Si se ha minificado en local y se quiere volver a validar, se
 * restaura antes con `git checkout --` los ficheros de la lista OBJETIVOS.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { brotliCompressSync, constants as zlibConstants } from "node:zlib";
import { transform } from "esbuild";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryDirectory = path.resolve(scriptDirectory, "../..");

const OBJETIVOS = [
  "Web/scripts/app.js",
  "Web/scripts/zip.js",
  "Web/styles/site.css",
  "Web/styles/team-core.css",
  "DavokerDiseñador/transicion.css",
];

const forzar = process.argv.includes("--force");
const enVercel = process.env.VERCEL === "1";

if (!forzar && !enVercel) {
  console.log("info: no hay nada que minificar (solo minifica en el despliegue, con VERCEL=1 o --force).");
  process.exit(0);
}

const brotliDe = (texto) => {
  const bytes = Buffer.from(texto);
  return brotliCompressSync(bytes, {
    params: {
      [zlibConstants.BROTLI_PARAM_QUALITY]: 11,
      [zlibConstants.BROTLI_PARAM_SIZE_HINT]: bytes.length,
    },
  }).length;
};

const numero = (n) => n.toLocaleString("es-ES");
const rellenar = (texto, ancho, izquierda = true) =>
  izquierda ? String(texto).padStart(ancho) : String(texto).padEnd(ancho);

const filas = await Promise.all(
  OBJETIVOS.map(async (relativa) => {
    const ruta = path.join(repositoryDirectory, relativa);
    const original = await readFile(ruta, "utf8");
    const loader = relativa.endsWith(".css") ? "css" : "js";
    const { code } = await transform(original, { minify: true, loader });
    await writeFile(ruta, code, "utf8");
    return {
      relativa,
      antes: Buffer.byteLength(original),
      despues: Buffer.byteLength(code),
      brotliAntes: brotliDe(original),
      brotliDespues: brotliDe(code),
    };
  }),
);

const anchoFichero = Math.max(...filas.map((f) => f.relativa.length));
console.log("");
console.log(
  `  ${rellenar("fichero", anchoFichero, false)}  ${rellenar("crudo antes", 12)}  ${rellenar("crudo despues", 12)}  ${rellenar("brotli antes", 12)}  ${rellenar("brotli despues", 12)}`,
);
for (const f of filas) {
  console.log(
    `  ${rellenar(f.relativa, anchoFichero, false)}  ${rellenar(numero(f.antes), 12)}  ${rellenar(numero(f.despues), 12)}  ${rellenar(numero(f.brotliAntes), 12)}  ${rellenar(numero(f.brotliDespues), 12)}`,
  );
}
const total = filas.reduce(
  (suma, f) => ({
    antes: suma.antes + f.antes,
    despues: suma.despues + f.despues,
    brotliAntes: suma.brotliAntes + f.brotliAntes,
    brotliDespues: suma.brotliDespues + f.brotliDespues,
  }),
  { antes: 0, despues: 0, brotliAntes: 0, brotliDespues: 0 },
);
console.log(
  `  ${rellenar("TOTAL", anchoFichero, false)}  ${rellenar(numero(total.antes), 12)}  ${rellenar(numero(total.despues), 12)}  ${rellenar(numero(total.brotliAntes), 12)}  ${rellenar(numero(total.brotliDespues), 12)}`,
);
const ahorro = (100 * (1 - total.despues / total.antes)).toFixed(1);
const ahorroBrotli = (100 * (1 - total.brotliDespues / total.brotliAntes)).toFixed(1);
console.log("");
console.log(`minificados ${filas.length} ficheros: -${ahorro}% en crudo, -${ahorroBrotli}% con brotli.`);
console.log("El paso siguiente del build (stamp-assets) sella los ?v= sobre estos contenidos.");
