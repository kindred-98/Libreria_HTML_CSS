/**
 * Genera los iconos PNG de la PWA a partir del favicon.svg, usando el
 * Chromium de Playwright que ya es dependencia del repositorio (asi no se
 * anade sharp ni ningun paquete de imagen).
 *
 * Por que hace falta: para "anadir a pantalla de inicio", Android e iOS
 * necesitan un icono real de 192 y 512 px, y un `favicon.svg` no vale. El
 * `maskable` es el mismo icono con margen: al recortarlo en circulo o en
 * cuadrado los sistemas nunca cortan el dibujo.
 *
 *   node Web/scripts/generar-iconos.mjs
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const webDirectory = path.resolve(scriptDirectory, "..");
const iconDirectory = path.join(webDirectory, "assets", "icons");

const svg = await readFile(path.join(webDirectory, "favicon.svg"), "utf8");

await mkdir(iconDirectory, { recursive: true });

const navegador = await chromium.launch({ args: ["--no-sandbox"] });

/**
 * Renderiza el SVG a un PNG del tamaño pedido.
 *
 * @param {number} tamano Lado en píxeles.
 * @param {number} margen Fracción del lado que se deja de margen por cada
 *   lado (0 = sin margen, 0.22 = el 22% de margen, que es lo que pide
 *   `purpose: maskable`).
 * @returns {Promise<Buffer>} El PNG.
 */
async function render(tamano, margen) {
  const lado = tamano - Math.round(tamano * margen * 2);
  const pagina = await navegador.newPage({
    viewport: { width: tamano, height: tamano },
    deviceScaleFactor: 1,
  });
  await pagina.setContent(
    `<!DOCTYPE html><html><body style="margin:0;width:${tamano}px;height:${tamano}px;
      display:flex;align-items:center;justify-content:center;background:#111511">
      <div style="width:${lado}px;height:${lado}px">${svg.replace(/width="64" height="64"/, `width="${lado}" height="${lado}"`)}</div>
    </body></html>`,
    { waitUntil: "load" },
  );
  const buffer = await pagina.locator("body").screenshot({ type: "png", omitBackground: false });
  await pagina.close();
  return buffer;
}

/** @type {[string, number, number][]} nombre, lado, margen */
const ICONOS = [
  ["icon-192.png", 192, 0],
  ["icon-512.png", 512, 0],
  ["icon-maskable-512.png", 512, 0.22],
  ["apple-touch-icon.png", 180, 0],
];

// Los cuatro iconos se renderizan a la vez y no uno detras de otro. Con el
// bucle secuencial (S9382) tardaba lo que suma cada captura; en paralelo es el
// tiempo de la mas lenta, y como cada una abre su propia pestana de Chromium,
// no compiten por el mismo hilo principal.
const pngs = await Promise.all(
  ICONOS.map(async ([nombre, tamano, margen]) => {
    const png = await render(tamano, margen);
    await writeFile(path.join(iconDirectory, nombre), png);
    return [nombre, tamano, png];
  }),
);

for (const [nombre, tamano, png] of pngs) {
  console.log(`  ${nombre}  ${tamano}x${tamano}  ${(png.length / 1024).toFixed(1)} KB`);
}

await navegador.close();
console.log(`Iconos escritos en ${path.relative(webDirectory, iconDirectory)}`);
