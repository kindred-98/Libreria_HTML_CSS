/**
 * Presupuesto de rendimiento en movil.
 *
 * Por que existe: `validar-lighthouse.mjs` mide las cinco paginas con el
 * preset **desktop**, que va sobrado (99-100). El preset **movil** es el que
 * simula de verdad lo que sufre alguien con un telefono: CPU ralentizada x4 y
 * red estrangulada. Sin medirlo ahi, una regresion en movil se cuela sin que
 * nadie se entere.
 *
 * Que mide, en una sola pasada: **rendimiento** (con presupuesto) y **CLS**
 * (con presupuesto). El CLS se mide aqui y no en un script aparte porque
 * Lighthouse **ya lo calcula** en cada medicion y es el mismo numero que
 * aparece en los informes: medirlo por otra via daria una cifra distinta y,
 * con suerte, comparable.
 *
 * ## Por que el CLS no tiene su propio script
 *
 * Se intento (Fase 5, punto C) medirlo con `PerformanceObserver` de
 * `layout-shift` desde Playwright. **No funciona**: verificado con una pagina
 * de prueba que se desplaza a proposito, el observer no entrega ni un
 * evento. Lighthouse lo saca del *trace* del navegador, no de esa API, y por
 * eso reutilizar su medicion es lo correcto y no un atajo.
 *
 * ## Por que el umbral de rendimiento es 85
 *
 * Se puso en 80 cuando el peor valor medido era 84 (un umbral por encima del
 * valor actual falla desde el primer dia). La Fase 3 subio la portada de 84 a
 * 97, asi que 80 dejaba 13 puntos de margen inutil. Con 85 quedan **ocho
 * puntos** sobre el peor valor: una regresion normal lo dispara y la
 * variacion de la medicion no. El plan de subida esta en
 * `Docs/05-rendimiento/Presupuestos_rendimiento.md` §6.
 *
 * ## Por que el de CLS es 0,05
 *
 * Google considera "bueno" por debajo de 0,1. Aqui se esta en 0,006-0,016,
 * asi que 0,05 es margen de sobra para el ruido y salta ante una regresion
 * real. Ya se rompio una vez sin que nadie se enterara: el pie saltaba de
 * `y=481` a `y=4081` al rellenarse la rejilla (0,29).
 *
 *   node Web/scripts/validar-lighthouse-movil.mjs
 *   npm run validar:lighthouse:movil
 *
 * Sale 1 si alguna pagina se queda sin puntuacion o con CLS alto.
 */
import process from "node:process";

import { PAGINAS, medirConLighthouse } from "./lib/lighthouse.mjs";

/** Puntuacion minima de rendimiento en movil.
 * Subido de 85 a 89 tras P1 segun la regla del plan: presupuesto = (peor caso
 * observado en 30 mediciones) - 5. La peor de las 30 fue 94 en componentes
 * (variabilidad normal de Lighthouse en headless); 94 - 5 = 89. Asi el
 * presupuesto deja margen para la variabilidad y un error de medicion de
 * unos 5 puntos sin permitir una regresion real.
 */
const UMBRAL_RENDIMIENTO = 89;

/** CLS maximo por pagina. */
const UMBRAL_CLS = 0.05;

/** Cuanto espera Lighthouse a que la pagina termine de cargar. */
const ESPERA_CARGA_MS = 45000;

const filas = await medirConLighthouse({
  paginas: PAGINAS,
  settings: {
    // El preset movil de Lighthouse trae su propio estrangulamiento (red
    // lenta y CPU x4). Se deja el que trae, que es lo que define la cifra
    // oficial de Lighthouse.
    formFactor: "mobile",
    screenEmulation: {
      mobile: true,
      width: 412,
      height: 915,
      deviceScaleFactor: 2,
      disabled: false,
    },
    maxWaitForLoad: ESPERA_CARGA_MS,
  },
});

const fallos = [];

console.log(`Presupuesto: rendimiento >= ${UMBRAL_RENDIMIENTO} y CLS <= ${UMBRAL_CLS}`);
console.log(`(preset movil, 412x915, CPU x4 y red estrangulada)\n`);

for (const fila of filas) {
  const puntuacion = fila.puntuaciones.performance ?? 0;
  const cls =
    typeof fila.auditorias["cumulative-layout-shift"]?.numericValue === "number"
      ? fila.auditorias["cumulative-layout-shift"].numericValue
      : null;

  const problemas = [];
  if (puntuacion < UMBRAL_RENDIMIENTO) {
    problemas.push(`rendimiento ${puntuacion} < ${UMBRAL_RENDIMIENTO}`);
  }
  // CLS > 0,05 es lo que hay que cazar. Por debajo de 0,001 la cifra sale
  // redondeada a "0" en el informe y comparar texto daria falsos positivos.
  if (cls !== null && cls > UMBRAL_CLS) {
    problemas.push(`CLS ${cls.toFixed(3)} > ${UMBRAL_CLS}`);
  }

  const marca = problemas.length === 0 ? "ok   " : "FALLO";
  console.log(
    `  ${marca} ${fila.nombre.padEnd(12)} ` +
      `rendimiento=${String(puntuacion).padStart(3)}  ` +
      `LCP ${fila.lcp}  TBT ${fila.tbt}  CLS ${fila.cls}  ` +
      `(${fila.segundos.toFixed(1)} s)`,
  );

  for (const problema of problemas) fallos.push(`${fila.nombre}: ${problema}`);
}

console.log("");
if (fallos.length > 0) {
  console.error(`${fallos.length} pagina(s) fuera de presupuesto:`);
  for (const fallo of fallos) console.error(`  - ${fallo}`);
  console.error("");
  console.error("Si es el CLS, mira en Lighthouse la auditoria 'layout-shift-elements':");
  console.error("casi siempre es contenido que entra tarde (una fuente, una imagen sin");
  console.error("alto, o los datos del catalogo). Si es el rendimiento, mira 'bootup-time'");
  console.error("y 'mainthread-work-breakdown' para saber que funcion lo causa.");
  process.exitCode = 1;
} else {
  console.log(
    `Las ${filas.length} paginas dentro de presupuesto. El umbral se sube cuando el ` +
      "margen sea holgado (ver Docs/05-rendimiento/Presupuestos_rendimiento.md).",
  );
}
