/**
 * Mide las paginas del sitio con Lighthouse.
 *
 * Por que existe: `validar-a11y.mjs` contesta si la pagina se puede usar sin
 * raton ni vision, y `validar-layout.mjs` si se sale de lado, pero ninguna
 * mide lo que le cuesta al navegador pintarla ni si los motores de busca la
 * entienden. Lighthouse si, y ademas lo hace con un numero: un 72 de
 * rendimiento no se discute.
 *
 * Que hace: sirve el repositorio con `serve.mjs`, abre las tres paginas del
 * sitio con el Chromium de Playwright (el mismo que usan layout y a11y, asi el
 * CI no descarga un navegador mas) y corre Lighthouse contra cada una.
 *
 *   node Web/scripts/validar-lighthouse.mjs
 *   npm run validar:lighthouse
 *
 * Corte: los umbrales del plan. Rendimiento >= 80 y el resto >= 95. Si una
 * pagina baja de ahi sale exit 1 con la lista de categorias por debajo; no se
 * lista el detalle de cada recomendacion, que son cientos de lineas y ya estan
 * en el informe de Lighthouse.
 *
 * Por que en desktop y no en el preset movil, que es el que trae Lighthouse:
 * las demas comprobaciones de este repositorio miden a 1350 px de ancho
 * (`validar-layout.mjs`, `validar-a11y.mjs`), el catalogo esta pensado para
 * pantalla ancha y, ademas, el throttling movil simula una red y una CPU que
 * no corresponden con como se sirve el sitio. Con el preset movil las mismas
 * tres paginas puntuan 76-81 con una variacion de +-5 puntos entre pasadas,
 * y un umbral de 80 ahi parpadearia en cada ejecucion. Los valores moviles
 * medidos quedan anotados en Fase7.md para quien quiera volver a mirarlos.
 *
 * Alcance: las paginas del sitio, no los 1.018 demos. Cada demo es un
 * experimento con sus propias imagenes y sus propios tiempos, y medirlos con
 * los mismos umbrales daria cientos de fallos que nadie sabria priorizar.
 *
 * Versiones: `lighthouse` 13 exige Node >= 22.19, asi que en el CI solo corre
 * en el job de Node 24, junto a las demas comprobaciones que abren navegador.
 * El resto de jobs lo instalan con `npm ci` (un aviso de motor, no un fallo)
 * y no lo ejecutan.
 */
import { existsSync } from "node:fs";
import process from "node:process";
import { chromium } from "playwright";
import { launch as lanzarChrome, getChromePath } from "chrome-launcher";
import lighthouse from "lighthouse";
import { puertoLibre, arrancarServidor } from "./lib/servidor.mjs";

// Los umbrales los fija el plan de fases (7.6) y no se tocan sin decidirlo.
// Rendimiento va mas bajo que el resto porque se mide con la simulacion de
// throttling de Lighthouse: en un sitio estatico se llega, pero una imagen
// grande de mas lo baja veinte puntos.
const UMBRALES = {
  performance: 80,
  accessibility: 95,
  "best-practices": 95,
  seo: 95,
};

// Las mismas tres paginas que `validar-a11y.mjs`.
const PAGINAS = [
  { ruta: "/Web/index.html", nombre: "portada" },
  { ruta: "/Web/components.html", nombre: "componentes" },
  { ruta: "/Web/team-core.html", nombre: "team core" },
];

// Lighthouse no arranca el navegador por si solo cuando se usa como libreria,
// asi que el binario se prepara aqui y despues chrome-launcher lo abre. Se
// apunta primero al de Playwright, que es el mismo que usan layout y a11y y
// que el CI instala igual, y si no esta, al Chrome del sistema.
function prepararNavegador() {
  const dePlaywright = chromium.executablePath();
  if (dePlaywright && existsSync(dePlaywright)) return dePlaywright;
  try {
    return getChromePath();
  } catch {
    throw new Error(
      "No hay navegador: ni el Chromium de Playwright ni el Chrome del sistema. " +
        "Instala el primero con `npx playwright install --with-deps chromium`.",
    );
  }
}

const UMBRALES_NOMBRES = Object.keys(UMBRALES);

const fallos = [];

const binario = prepararNavegador();
const puerto = await puertoLibre();
const ORIGEN = `http://127.0.0.1:${puerto}`;
const servidor = await arrancarServidor(puerto);

// Sin esto en un runner sin pantalla el Chrome no arranca. `--no-sandbox` no
// hace falta en local, pero en el CI de GitHub si y anadirlo ahi no cambia
// nada en la medicion.
const CHROME_FLAGS = ["--headless=new", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"];

// `lighthouse()` solo mide: no arranca el navegador. En la linea de comandos
// lo hace el binario de Lighthouse, y aqui ese trabajo es de chrome-launcher,
// que es la misma libreria que usa. El puerto que abre es el que se le pasa
// despues; sin el, Lighthouse se conecta a 9222 y no hay nadie.
let chrome = null;

try {
  chrome = await lanzarChrome({ chrome: binario, chromeFlags: CHROME_FLAGS });
  console.log(`Lighthouse 13 · Chromium en ${binario}`);
  console.log(
    `Umbral: rendimiento >= ${UMBRALES.performance}, el resto >= ${UMBRALES.accessibility} (preset desktop)\n`,
  );

  for (const pagina of PAGINAS) {
    const inicio = Date.now();
    const { lhr } = await lighthouse(
      `${ORIGEN}${pagina.ruta}`,
      { logLevel: "error", output: "json", port: chrome.port },
      {
        extends: "lighthouse:default",
        settings: {
          onlyCategories: UMBRALES_NOMBRES,
          // El preset desktop de Lighthouse, escrito a mano porque el programa
          // no expone `--preset` cuando se usa como libreria: mismo tamano de
          // pantalla y misma CPU sin throttling que la medicion oficial.
          formFactor: "desktop",
          screenEmulation: {
            mobile: false,
            width: 1350,
            height: 940,
            deviceScaleFactor: 1,
            disabled: false,
          },
          throttling: {
            rttMs: 40,
            throughputKbps: 10240,
            cpuSlowdownMultiplier: 1,
            requestLatencyMs: 0,
            downloadThroughputKbps: 0,
            uploadThroughputKbps: 0,
          },
          // Una unica pasada por pagina. Repetir para promediar duplicaria el
          // tiempo de CI sin mover los puntos: la varianza en un sitio
          // estatico local esta dentro del margen de un punto.
          maxWaitForLoad: 45000,
        },
      },
    );

    const segundos = ((Date.now() - inicio) / 1000).toFixed(1);
    const puntos = UMBRALES_NOMBRES.map((c) => `${c}=${Math.round(lhr.categories[c].score * 100)}`);
    const bajos = UMBRALES_NOMBRES.filter((c) => Math.round(lhr.categories[c].score * 100) < UMBRALES[c]);

    if (bajos.length === 0) {
      console.log(`  ok    ${pagina.nombre.padEnd(12)} ${puntos.join("  ")}  (${segundos} s)`);
    } else {
      console.log(`  FALLO ${pagina.nombre.padEnd(12)} ${puntos.join("  ")}  (${segundos} s)`);
      for (const categoria of bajos) {
        fallos.push(
          `${pagina.nombre}: ${categoria} ${Math.round(lhr.categories[categoria].score * 100)} < ${UMBRALES[categoria]}`,
        );
      }
    }
  }
} finally {
  if (chrome) await chrome.kill();
  servidor.kill();
}

console.log("");
if (fallos.length > 0) {
  console.error(`${fallos.length} categoria(s) por debajo del umbral:`);
  for (const fallo of fallos) console.error(`  - ${fallo}`);
  process.exitCode = 1;
} else {
  console.log(
    `${PAGINAS.length} paginas por encima del umbral en las ${UMBRALES_NOMBRES.length} categorias.`,
  );
}
