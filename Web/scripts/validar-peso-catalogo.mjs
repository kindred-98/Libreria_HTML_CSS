/**
 * Presupuesto de peso del catalogo (Fase 5, punto D).
 *
 * Que mide: `Web/data/catalog.json` **comprimido con gzip**, que es lo que
 * viaja de verdad por la red. El tamano en disco (707 KB) engaña: la
 * compresion se queda en el 23%, asi que lo que ve el visitante son 163 KB.
 *
 * Por que un presupuesto y no basta con mirarlo: es el segundo recurso mas
 * pesado de la pagina, despues de `app.js`. Medido, **no es hoy un cuello de
 * botella** (la pagina de componentes puntua 97 en movil con 163 KB). El
 * riesgo es de crecimiento: 1018 componentes con 0,16 KB comprimidos cada uno,
 * asi que 100 demos nuevos son +16 KB y nadie se entera hasta que Lighthouse
 * baja de 90. Un presupuesto avisa **antes**.
 *
 * ## Por que 180 KB y no 150
 *
 * Cuando se escribio, el valor real era **163,5 KB**: un presupuesto en 150
 * habria fallado desde el primer dia, que es el error mas tonto que se puede
 * cometer con un presupuesto. Con 180 hay un 10% de margen, que equivale a
 * unos 110 demos nuevos antes de que salte.
 *
 * ## Por que gzip y no brotli
 *
 * Brotli llega a 136 KB, pero su nivel de compresion depende de como lo
 * configure el servidor y puede variar entre despliegues. Gzip con nivel fijo
 * (9) es **reproducible**: la misma entrada da siempre el mismo numero, que es
 * justo lo que necesita un presupuesto para ser comparable entre dias.
 *
 *   node Web/scripts/validar-peso-catalogo.mjs
 *   npm run validar:peso
 *
 * Sale 1 si el catalogo comprimido pasa del umbral.
 */
import process from "node:process";
import { gzipSync } from "node:zlib";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Techo de tamano comprimido del catalogo. Con margen sobre el valor real
 * medido (163,5 KB el dia de escribir esto).
 */
const UMBRAL_KB = 180;

/** Numero de componentes de referencia, para el dato por componente. */
const COMPONENTES_ESPERADOS = 1018;

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const rutaCatalogo = path.join(raiz, "Web", "data", "catalog.json");

let contenido;
try {
  contenido = readFileSync(rutaCatalogo);
} catch (error) {
  console.error(
    `No se encuentra el catalogo en ${rutaCatalogo}.\n` +
      "  El catalogo es un artefacto GENERADO: se produce con `npm run catalogo`.\n" +
      "  En el CI se genera antes de esta comprobacion.",
  );
  console.error(`  ${error.message}`);
  process.exit(1);
}

const comprimido = gzipSync(contenido, { level: 9 });
const kbDisco = contenido.length / 1024;
const kbGzip = comprimido.length / 1024;
const ratio = (comprimido.length / contenido.length) * 100;

let entradas = COMPONENTES_ESPERADOS;
try {
  entradas = JSON.parse(contenido.toString("utf8")).length;
} catch {
  console.warn("aviso: no se pudo leer el numero de entradas del catalogo");
}

console.log("Peso de Web/data/catalog.json\n");
console.log(`  en disco            ${kbDisco.toFixed(1).padStart(8)} KB`);
console.log(`  comprimido (gzip 9) ${kbGzip.toFixed(1).padStart(8)} KB   <- lo que viaja`);
console.log(`  compresion          ${ratio.toFixed(1).padStart(8)} %`);
console.log(`  componentes         ${String(entradas).padStart(8)}`);
console.log(`  por componente      ${(kbGzip / Math.max(entradas, 1)).toFixed(3).padStart(8)} KB`);
console.log(`\n  presupuesto         ${String(UMBRAL_KB).padStart(8)} KB`);

if (kbGzip > UMBRAL_KB) {
  console.error(
    `\nFALLO: el catalogo pesa ${kbGzip.toFixed(1)} KB comprimidos y el presupuesto es ${UMBRAL_KB} KB.`,
  );
  console.error("");
  console.error("Que se puede hacer, de menos a mas invasivo:");
  console.error("  1. Revisar si alguna descripcion se ha quedado desmedida. Las dos");
  console.error("     Together (description + descriptionEs) son el 55% del indice.");
  console.error("  2. Subir el presupuesto en este script, a conciencia, si el crecimiento");
  console.error("     es buscado. Se edita aqui y queda en el historial del repo.");
  console.error("  3. Partir el catalogo en indice y detalle (analizado en");
  console.error("     Docs/05-rendimiento/Presupuestos_rendimiento.md: hoy no aporta nada medible).");
  process.exitCode = 1;
} else {
  const margen = UMBRAL_KB - kbGzip;
  const demosDeMargen = Math.floor(margen / (kbGzip / Math.max(entradas, 1)));
  console.log(`\nok: ${margen.toFixed(1)} KB de margen, que es para unos ${demosDeMargen} componentes mas.`);
}
