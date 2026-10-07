/**
 * Presupuesto de rendimiento en movil (Fase 3, paso 1).
 *
 * Por que existe: `validar-lighthouse.mjs` mide las cinco paginas con el
 * preset **desktop**, que va sobrado (99-100). El preset **movil** es el que
 * simula de verdad lo que sufre alguien con un telefono: CPU ralentizada x4 y
 * red estrangulada. Ahi las cifras bajan a 84-99 y son las que deciden si la
 * web se siente rapida o no. Sin medirlas, una regresion en movil se cuela
 * sin que nadie se entere.
 *
 * Que hace: mide las cinco paginas con el preset movil y falla si alguna baja
 * del umbral.
 *
 *   node Web/scripts/validar-lighthouse-movil.mjs
 *   npm run validar:lighthouse:movil
 *
 * ## Por que el umbral es 85
 *
 * ### Lo que habia cuando se puso en 80
 *
 * Medido con DOS pasadas por pagina (la variacion de Lighthouse en movil es de
 * +-3 a 5 puntos entre ejecuciones):
 *
 * | Pagina   | Pasadas     | Peor caso |
 * | -------- | ----------- | --------- |
 * | portada  | 87 / 84     | **84**    |
 * | componentes | 96 / 96 | 96        |
 * | team core | 97 / 97    | 97        |
 * | privacidad | 99 / 99   | 99        |
 * | legal    | 99 / 99     | 99        |
 *
 * El numero que mandaba era el **84 de la portada**, y fluctuaba: un
 * presupuesto en 85 fallaba en la mitad de las ejecuciones. Por eso se puso
 * en **80**, cuatro puntos por debajo.
 *
 * ### Por que ahora es 85
 *
 * La Fase 3 arreglo la causa (las 33 vistas previas se montaban de golpe) y
 * subio la portada a **97**, con un peor caso de 93 entre dos pasadas:
 *
 * | Pagina      | Antes | Ahora      |
 * | ----------- | ----- | ---------- |
 * | portada     | 84-87 | **97**     |
 * | componentes | 96    | **93-97**  |
 * | team core   | 97    | 97         |
 * | privacidad | 99    | 99         |
 * | legal       | 99    | 99-100     |
 *
 * Con un margen de **ocho puntos** sobre el peor valor, un presupuesto en
 * 85 ya protege de verdad: una regresion normal (3-5 puntos) lo dispara, y
 * la variacion de la medicion no lo hace. En 80, en cambio, habia 13 puntos de
 * margen y no protegia nada.
 *
 * El plan de subida (85 -> 88 -> 90 -> 92) y el criterio para cuando tocar
 * cada escalon estan en `Docs/Presupuestos_rendimiento.md` §6.
 *
 * ## Por que NO es obligatorio en el CI todavia

 * Salida 1 si alguna pagina baja del umbral. Las otras categorias (a11y,
 * buenas practicas y SEO) las mide `validar-lighthouse.mjs`.
 */
import { existsSync } from "node:fs";
import process from "node:process";
import { chromium } from "playwright";
import { launch as lanzarChrome, getChromePath } from "chrome-launcher";
import lighthouse from "lighthouse";
import { puertoLibre, arrancarServidor } from "./lib/servidor.mjs";

/**
 * Umbral minimo de rendimiento en movil. Va **por debajo** del peor valor
 * medido (84), nunca por encima: un presupuesto que ya no se cumple no es
 * una red, es un ruido.
 */
const UMBRAL = 85;

const PAGINAS = [
  { ruta: "/Web/index.html", nombre: "portada" },
  { ruta: "/Web/components.html", nombre: "componentes" },
  { ruta: "/Web/team-core.html", nombre: "team core" },
  { ruta: "/Web/privacidad.html", nombre: "privacidad" },
  { ruta: "/Web/legal.html", nombre: "legal" },
];

/** El Chromium de Playwright, que el CI ya instala; si no, el del sistema. */
function prepararNavegador() {
  const dePlaywright = chromium.executablePath();
  if (dePlaywright && existsSync(dePlaywright)) return dePlaywright;
  try {
    return getChromePath();
  } catch {
    throw new Error(
      "No hay navegador: ni el Chromium de Playwright ni el Chrome del sistema. " +
        "Instala el primero con `npx playwright install chromium`.",
    );
  }
}

const CHROME_FLAGS = ["--headless=new", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"];

const binario = prepararNavegador();
const puerto = await puertoLibre();
const origen = `http://127.0.0.1:${puerto}`;
const servidor = await arrancarServidor(puerto);

let chrome = null;
const fallos = [];

try {
  chrome = await lanzarChrome({ chrome: binario, chromeFlags: CHROME_FLAGS });
  console.log(`Lighthouse 13, preset MOVIL · Chromium en ${binario}`);
  console.log(`Presupuesto: rendimiento >= ${UMBRAL} en las ${PAGINAS.length} paginas\n`);

  for (const pagina of PAGINAS) {
    const inicio = Date.now();
    const { lhr } = await lighthouse(
      `${origen}${pagina.ruta}`,
      { logLevel: "error", output: "json", port: chrome.port },
      {
        extends: "lighthouse:default",
        settings: {
          formFactor: "mobile",
          screenEmulation: {
            mobile: true,
            width: 412,
            height: 915,
            deviceScaleFactor: 2,
            disabled: false,
          },
          // El preset movil de Lighthouse trae su propio estrangulamiento
          // (red lenta y CPU x4). Es lo que hace falta medir aqui.
          maxWaitForLoad: 45000,
        },
      },
    );

    const segundos = ((Date.now() - inicio) / 1000).toFixed(1);
    const audits = lhr.audits;
    const valor = (id) => (audits[id] ? audits[id].displayValue : "-");
    const puntuacion = Math.round(lhr.categories.performance.score * 100);

    const linea =
      `  ${puntuacion >= UMBRAL ? "ok   " : "FALLO"} ` +
      `${pagina.nombre.padEnd(12)} ` +
      `rendimiento=${String(puntuacion).padStart(3)}  ` +
      `LCP ${valor("largest-contentful-paint")}  ` +
      `TBT ${valor("total-blocking-time")}  ` +
      `CLS ${valor("cumulative-layout-shift")}  ` +
      `(${segundos} s)`;

    if (puntuacion >= UMBRAL) {
      console.log(linea);
    } else {
      console.log(linea);
      fallos.push(`${pagina.nombre}: ${puntuacion} < ${UMBRAL}`);
    }
  }
} finally {
  if (chrome) await chrome.kill();
  servidor.kill();
}

console.log("");
if (fallos.length > 0) {
  console.error(`${fallos.length} pagina(s) por debajo del presupuesto de ${UMBRAL}:`);
  for (const fallo of fallos) console.error(`  - ${fallo}`);
  process.exitCode = 1;
} else {
  console.log(
    `Las ${PAGINAS.length} paginas por encima de ${UMBRAL}. El presupuesto se sube cuando ` +
      "el margenSea holgado (ver Docs/Presupuestos_rendimiento.md).",
  );
}
