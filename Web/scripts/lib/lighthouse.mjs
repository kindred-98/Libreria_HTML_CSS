/**
 * Lo que los dos scripts de Lighthouse tienen en comun: donde esta el
 * navegador, como se lanza y como se le pide una medicion.
 *
 * Que hay aqui y por que:
 *
 * - `validar-lighthouse.mjs` (escritorio) y `validar-lighthouse-movil.mjs`
 *   (movil) midiendo exactamente lo mismo con parametros distintos. Tenian
 *   **28 lineas identicas** y SonarQube las contaba como duplicacion
 *   (13,4% del codigo nuevo del segundo). Lo que cambia entre uno y otro es
 *   solo el `settings` que se le pasa a Lighthouse: el resto del aparato
 *   (encontrar el Chromium, lanzarlo, recorrer las paginas, apagar el
 *   servidor al terminar) es el mismo.
 *
 * - Este modulo **no mide por si mismo**: recibe las paginas y los ajustes, y
 *   devuelve los resultados. Cada script decide que hacer con ellos (que
 *   umbrales son validos y como se imprime). Asi las politicas siguen
 *   separadas y lo unico que se comparte es el mecanismo.
 */
import { existsSync } from "node:fs";
import { chromium } from "playwright";
import { launch as lanzarChrome, getChromePath } from "chrome-launcher";
import lighthouse from "lighthouse";

import { puertoLibre, arrancarServidor } from "./servidor.mjs";

/**
 * Las paginas del sitio, con su nombre corto. Es la lista que miden
 * Lighthouse (escritorio y movil) y el validador de accesibilidad.
 *
 * @type {{ruta: string, nombre: string}[]}
 */
export const PAGINAS = [
  { ruta: "/Web/index.html", nombre: "portada" },
  { ruta: "/Web/components.html", nombre: "componentes" },
  { ruta: "/Web/team-core.html", nombre: "team core" },
  { ruta: "/Web/como-usar.html", nombre: "como usar" },
  { ruta: "/Web/privacidad.html", nombre: "privacidad" },
  { ruta: "/Web/legal.html", nombre: "legal" },
];

/**
 * Donde esta el navegador. Se apunta primero al Chromium de Playwright, que
 * es el mismo que usan el validador de layout y el de accesibilidad y que el
 * CI instala igual; si no esta, al Chrome del sistema.
 *
 * @returns {string} Ruta al ejecutable.
 */
export function prepararNavegador() {
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

// Sin `--headless` el Chrome no arranca en un runner sin pantalla.
// `--no-sandbox` no hace falta en local, pero en el CI de GitHub si, y
// anadirlo ahi no cambia la medicion.
const CHROME_FLAGS = ["--headless=new", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"];

/**
 * Mide una lista de paginas con Lighthouse y devuelve una fila por pagina.
 *
 * Levanta el servidor estatico y el navegador, mide, y **lo cierra todo** al
 * terminar, tambien si hay un error a mitad (el `finally`).
 *
 * @param {object} opciones
 * @param {{ruta: string, nombre: string}[]} opciones.paginas Paginas a medir.
 * @param {string[]} [opciones.categorias] Categorias de Lighthouse a medir.
 * @param {object} [opciones.settings] Ajustes que se pasan tal cual a
 *   Lighthouse (formFactor, screenEmulation, throttling...).
 * @returns {Promise<{nombre: string, ruta: string, puntuaciones: Record<string, number>,
 *   cls: string, lcp: string, tbt: string, segundos: number, auditorias: Record<string, any>}[]>}
 *   Una fila por pagina, en el mismo orden que `paginas`.
 */
export async function medirConLighthouse({ paginas, categorias, settings }) {
  const binario = prepararNavegador();
  const puerto = await puertoLibre();
  const origen = `http://127.0.0.1:${puerto}`;
  const servidor = await arrancarServidor(puerto);

  // `lighthouse()` solo mide: no arranca el navegador. En la linea de comandos
  // lo hace el binario de Lighthouse, y aqui ese trabajo es de chrome-launcher,
  // que es la misma libreria que usa. El puerto que abre es el que se le pasa
  // despues; sin el, Lighthouse se conecta a 9222 y no hay nadie.
  let chrome = null;
  const filas = [];

  try {
    chrome = await lanzarChrome({ chromePath: binario, chromeFlags: CHROME_FLAGS });

    for (const pagina of paginas) {
      const inicio = Date.now();
      // NOSONAR (S9382): las mediciones se hacen en serie adrede. Todas usan
      // el mismo Chromium/puerto CDP y Lighthouse cambia la emulacion de CPU,
      // red y viewport en cada pasada. `Promise.all` haria competir las cinco
      // auditorias y contaminaria las puntuaciones; el orden actual es parte
      // de que sean reproducibles.
      const { lhr } = await lighthouse(
        `${origen}${pagina.ruta}`,
        { logLevel: "error", output: "json", port: chrome.port },
        {
          extends: "lighthouse:default",
          settings: { ...settings, ...(categorias ? { onlyCategories: categorias } : {}) },
        },
      );

      /** @type {Record<string, number>} */
      const puntuaciones = {};
      for (const categoria of Object.keys(lhr.categories)) {
        puntuaciones[categoria] = Math.round(lhr.categories[categoria].score * 100);
      }

      filas.push({
        nombre: pagina.nombre,
        ruta: pagina.ruta,
        puntuaciones,
        auditorias: lhr.audits,
        cls: lhr.audits["cumulative-layout-shift"]?.displayValue ?? "-",
        lcp: lhr.audits["largest-contentful-paint"]?.displayValue ?? "-",
        tbt: lhr.audits["total-blocking-time"]?.displayValue ?? "-",
        segundos: (Date.now() - inicio) / 1000,
      });
    }
  } finally {
    if (chrome) await chrome.kill();
    servidor.kill();
  }

  return filas;
}
