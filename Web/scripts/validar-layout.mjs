/**
 * Comprueba que ninguna pagina del sitio se sale de lado.
 *
 * Por que existe: las demas validaciones (`validate.mjs`, `validar-csp.mjs`)
 * son estaticas —miran ficheros, sintaxis, el catalogo, cabeceras— y ninguna
 * mide lo que se ve. Una pagina que se dibuja 54 px mas ancha de lo que
 * permite la ventana no falla ninguna de ellas: sale de un `min-width: auto`
 * en un hijo flex, o de un `width: 100%` que no puede encogerse. Solo se
 * encuentra mirando la pantalla, y se encuentra tarde.
 *
 * Que hace: levanta el servidor de `serve.mjs`, abre cada pagina del sitio en
 * un barrido de anchos con un navegador de verdad y mide
 * `scrollWidth - clientWidth`. Si algo se sale, falla y dice que elemento es y
 * cuanto se sale, para que el aviso sirva para arreglarlo y no solo para
 * saber que algo va mal.
 *
 *   node Web/scripts/validar-layout.mjs
 *
 * Solo mide scroll horizontal de la pagina. El vertical es lo normal en una
 * pagina larga y no dice nada de si esta bien. Los iframes de vista previa se
 * miden aparte por `allowlist`, porque traen su propio documento y su propio
 * ancho.
 *
 * En el CI hace falta el navegador: `npx playwright install --with-deps chromium`.
 */
import { spawn } from "node:child_process";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));

// Las paginas del sitio, que son las que tienen cabecera y pie. Las cinco son
// las que `validate.mjs` ya revisa para lo del `sandbox`, y estan a proposito
// en la misma lista: si se anade una pagina al sitio, esta la mira sola.
const PAGINAS = [
  { ruta: "/Web/index.html", nombre: "portada" },
  { ruta: "/Web/components.html", nombre: "componentes" },
  { ruta: "/Web/team-core.html", nombre: "team core" },
  { ruta: "/404.html", nombre: "404" },
  { ruta: "/index.html", nombre: "redireccion de la raiz" },
];

// Barrido de anchos. No son aleatorios: cada uno esta ahi porque hay algo que
// pasa ahi. Los de en medio son donde ha habido fallos reales, y 320 es el
// movil mas estrecho que se sigue viendo.
const ANCHOS = [
  320, 360, 375, 390, 414, 480, 540, 600, 620, 621, 640, 660, 680, 700, 720, 768,
  820, 900, 1024, 1200, 1280, 1440, 1920,
];

// Desbordamientos que se aceptan a proposito, con el motivo. Si algo se
// mueve de aqui, hay que mirarlo: una lista de excepciones es donde se
// esconden los bugs que nadie vuelve a mirar.
//
// (vacia de momento: el marquee de la cabecera se recorta con overflow:hidden,
// asi que no llega a salir y no hay que exceptuar nada)
const EXCEPCIONES = [];

// Margen de tolerancia. Con 1 px no se falla: hay redondeos de subpixel que no
// son un fallo que el visitante llegue a ver. A partir de 2 px ya se nota.
const TOLERANCIA = 1;

// Puerto libre, en vez de uno fijo: en local casi siempre hay ya un servidor de
// desarrollo levantado, y si este tropezara con el suyo la comprobacion
// fallaria por un motivo que no tiene que ver con el layout. Se le pide uno
// libre al sistema, se cierra, y se le pasa a `serve.mjs`. Con PORT en el
// entorno se usa ese, por si hay quien lo quiera fijo.
async function puertoLibre() {
  const fijado = Number(process.env.PORT ?? 0);
  if (fijado) return fijado;
  return new Promise((resolve, reject) => {
    const sonda = net.createServer();
    sonda.on("error", reject);
    sonda.listen(0, "127.0.0.1", () => {
      const { port } = sonda.address();
      sonda.close(() => resolve(port));
    });
  });
}

function arrancarServidor(puerto) {
  return new Promise((resolve, reject) => {
    const proceso = spawn(process.execPath, [path.join(scriptDirectory, "serve.mjs")], {
      env: { ...process.env, PORT: String(puerto) },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let salida = "";
    let arrancado = false;
    const listo = () => {
      if (arrancado) return;
      arrancado = true;
      resolve(proceso);
    };
    proceso.stdout.on("data", (trozo) => {
      salida += trozo;
      if (salida.includes("Sirviendo el repositorio")) listo();
    });
    proceso.stderr.on("data", (trozo) => { salida += trozo; });
    proceso.on("error", reject);
    proceso.on("exit", (codigo) => {
      if (!arrancado) {
        reject(new Error(`serve.mjs no arranco en el puerto ${puerto} (codigo ${codigo}):\n${salida.trim()}`));
      }
    });
    setTimeout(() => {
      if (!arrancado) reject(new Error(`serve.mjs no arranco en 15 s en el puerto ${puerto}:\n${salida.trim()}`));
    }, 15000).unref();
  });
}

function esperar(milisegundos) {
  return new Promise((resolve) => setTimeout(resolve, milisegundos));
}

const fallos = [];
const notas = [];

const puerto = await puertoLibre();
const ORIGEN = `http://127.0.0.1:${puerto}`;
const servidor = await arrancarServidor(puerto);
const navegador = await chromium.launch();

try {
  for (const pagina of PAGINAS) {
    const contexto = await navegador.newContext({ viewport: { width: 1280, height: 900 } });
    const pestana = await contexto.newPage();
    // Los recursos que faltan (una foto de Wikimedia, un avatar) no deben
    // tumbar la medicion: lo que se mide es el ancho, no si cargaron.
    pestana.on("pageerror", () => {});
    let peor = { exceso: 0, ancho: 0, culpables: "" };

    for (const ancho of ANCHOS) {
      await pestana.setViewportSize({ width: ancho, height: 900 });
      // Una recarga por ancho: cambiar solo el tamano no vuelve a pintar la
      // pagina, y con el DOM viejo la medida no vale. Ademas, si el ancho cae
      // en otra media query, hay que evaluates con las reglas nuevas.
      await pestana.goto(`${ORIGEN}${pagina.ruta}`, { waitUntil: "load" });
      await esperar(120);

      const medida = await pestana.evaluate(() => {
        const raiz = document.documentElement;
        const exceso = raiz.scrollWidth - raiz.clientWidth;
        const culpable = (() => {
          if (exceso <= 0) return "";
          const limite = raiz.clientWidth;
          // Un elemento puede medir mas de lo que le toca y no culpa a nadie: lo
          // que esta dentro de un ancestro con overflow recortado no ensancha
          // el documento (el marquee, por ejemplo, mide 4935 px y no se ve nada
          // de eso). Solo se listan los que no tienen quien los recorte.
          const recortado = (elemento) => {
            for (let padre = elemento.parentElement; padre && padre !== document.body; padre = padre.parentElement) {
              const comoSeMuestra = getComputedStyle(padre);
              if (comoSeMuestra.overflowX !== "visible" || comoSeMuestra.overflowY !== "visible") return true;
            }
            return false;
          };
          const fuera = [];
          for (const elemento of document.body.querySelectorAll("*")) {
            const caja = elemento.getBoundingClientRect();
            if (caja.width === 0 && caja.height === 0) continue;
            if (caja.right <= limite + 1) continue;
            if (recortado(elemento)) continue;
            fuera.push(
              `${elemento.tagName.toLowerCase()}${elemento.className ? "." + String(elemento.className).trim().split(/\s+/).join(".") : ""}` +
              ` (se sale ${Math.round(caja.right - limite)}px)`,
            );
          }
          return fuera.slice(0, 3).join(", ");
        })();
        return { exceso, clientWidth: raiz.clientWidth, scrollWidth: raiz.scrollWidth, culpable };
      });

      // Guardar la pagina vacia no es un fallo de layout: si el documento no
      // llego a pintarse, el script diria que todo esta bien.
      const vacia = await pestana.evaluate(() => document.body.getBoundingClientRect().height < 50);
      if (vacia) {
        fallos.push(`${pagina.nombre} (${pagina.ruta}) a ${ancho}px: la pagina no ha pintado, la medicion no vale`);
        continue;
      }

      const permitido = EXCEPCIONES.some(
        (excepcion) => excepcion.pagina === pagina.ruta && excepcion.ancho === ancho,
      );
      if (medida.exceso > TOLERANCIA && !permitido) {
        if (medida.exceso > peor.exceso) {
          peor = { exceso: medida.exceso, ancho, culpables: medida.culpable };
        }
        fallos.push(
          `${pagina.nombre} (${pagina.ruta}) a ${ancho}px: se sale ${medida.exceso}px ` +
          `(ventana ${medida.clientWidth}px, contenido ${medida.scrollWidth}px). ` +
          (medida.culpable ? `Culpables: ${medida.culpable}.` : ""),
        );
      }
    }

    if (peor.exceso > TOLERANCIA) {
      notas.push(`${pagina.nombre}: el peor es ${peor.exceso}px a ${peor.ancho}px (${peor.culpables})`);
    }
    await contexto.close();
  }
} finally {
  await navegador.close();
  servidor.kill();
}

console.log(`info  ${PAGINAS.length} paginas x ${ANCHOS.length} anchos = ${PAGINAS.length * ANCHOS.length} medidas, tolerancia ${TOLERANCIA}px`);

for (const nota of notas) console.log(`info  ${nota}`);

if (fallos.length) {
  console.error(`\n${fallos.length} pagina(s) se salen de lado:\n`);
  for (const fallo of fallos) console.error(`  x ${fallo}`);
  console.error(`\nArregla el ancho minimo que las empuja (min-width: auto en un hijo flex, o un`);
  console.error(`width: 100% que no puede encogerse) y vuelve a tirar esto. Si el desbordamiento`);
  console.error(`es a proposito, esta EXCEPCIONES, al principio de este script, con el motivo.`);
  process.exit(1);
}

console.log(`\nNinguna pagina se sale de lado en ${ANCHOS.length} anchos.`);
