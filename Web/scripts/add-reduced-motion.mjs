/**
 * Añade el bloque `prefers-reduced-motion` a los demos que animan con CSS
 * (Fase 6.3).
 *
 * Por que existe: hay personas a las que el movimiento les provoca mareo o
 * nauseas (transtorno vestibular, migraña vestibular, TEA). El sistema
 * operativo les ofrece activar "reducir movimiento" y el navegador lo expone
 * como `prefers-reduced-motion`. Si un demo no lo escucha, esa persona se
 * enfrenta a la misma animacion que todo el mundo, sin ninguna salida.
 *
 * El bloque que se añade no apaga la animacion: la deja en 0,01 ms, que es
 * suficiente para que el navegador la considere resuelta y pase al estado
 * final. El resultado se ve igual, pero sin el recorrido.
 *
 * Que NO toca:
 *   - Los demos de la categoria `Loaders`: ahi la animacion *es* la
 *     informacion (si no gira, no se ve que esta cargando).
 *   - Los demos que solo animan desde JavaScript (requestAnimationFrame,
 *     canvas, setInterval): un `animation-duration` no afecta a nada que
 *     dibuje un marco a mano. Se listan en el informe como trabajo futuro.
 *   - Los demos que ya escuchan `prefers-reduced-motion`.
 *
 * Es idempotente: el bloque lleva un comentario marcador y si ya esta no se
 * vuelve a escribir, asi que repetir el comando no acumula duplicados.
 *
 *   node Web/scripts/add-reduced-motion.mjs --dry-run   (solo informe, por defecto)
 *   node Web/scripts/add-reduced-motion.mjs --piloto    (10 Effects + 10 Animations)
 *   node Web/scripts/add-reduced-motion.mjs --todos     (todo lo elegible)
 *
 * Si no se pasa ninguna opcion se comporta como `--dry-run`.
 */
import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryDirectory = path.resolve(scriptDirectory, "../..");

const RAICES = ["creaciones-primium", "CreacionesNuevas", "DavokerDiseñador"];
const CATEGORIA_EXCLUIDA = "Loaders";
const MARCA = "/* reduced-motion (Fase 6) */";

const BLOQUE = `
${MARCA}
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
`;

const argumentos = process.argv.slice(2);
const modo = argumentos.includes("--piloto")
  ? "piloto"
  : argumentos.includes("--todos")
    ? "todos"
    : "dry-run";
const aplicar = modo !== "dry-run";

async function buscarDemos(directorio) {
  const paginas = [];
  let entradas;
  try {
    entradas = await readdir(directorio, { withFileTypes: true });
  } catch {
    return paginas;
  }
  for (const entrada of entradas) {
    if (entrada.name.startsWith(".")) continue;
    const ruta = path.join(directorio, entrada.name);
    if (entrada.isDirectory()) paginas.push(...(await buscarDemos(ruta)));
    else if (entrada.isFile() && entrada.name.toLowerCase() === "index.html") paginas.push(ruta);
  }
  return paginas;
}

function aPosix(ruta) {
  return ruta.split(path.sep).join("/");
}

function quitarComentariosCSS(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

function tieneMovimientoCSS(css) {
  const limpio = quitarComentariosCSS(css);
  return (
    /@keyframes\b/.test(limpio) ||
    /\banimation(?:-\w+)?\s*:/.test(limpio) ||
    /\btransition(?:-\w+)?\s*:/.test(limpio)
  );
}

function tieneMovimientoJS(js) {
  return /requestAnimationFrame|setInterval|\bcanvas\b|getContext\s*\(/.test(js);
}

/**
 * El catalogo generado no guarda la carpeta, pero si el `preview`, que es
 * `<raiz>/<subcarpeta>/index.html`. De ahi sale la ruta relativa del demo y,
 * con ella, su categoria. Si un dia el catalogo incorpora el campo `folder`
 * se usa ese directamente.
 */
async function cargarCarpetas() {
  const mapa = new Map();
  const ruta = path.join(repositoryDirectory, "Web/data/catalog.json");
  const catalogo = JSON.parse(await readFile(ruta, "utf8"));
  for (const entrada of catalogo) {
    let carpeta = entrada.folder;
    if (!carpeta && typeof entrada.preview === "string") {
      carpeta = entrada.preview.replace(/^\.\.\//, "").replace(/\/index\.html$/, "");
    }
    if (!carpeta) continue;
    mapa.set(aPosix(carpeta), entrada.category || "?");
  }
  return mapa;
}

const carpetas = await cargarCarpetas();

/** Localiza los ficheros que hay que leer y, si toca, escribir. */
async function planificar(indexAbsoluto) {
  const carpeta = path.dirname(indexAbsoluto);
  const html = await readFile(indexAbsoluto, "utf8");

  const ficherosCSS = [];
  for (const entrada of await readdir(carpeta, { withFileTypes: true })) {
    if (entrada.isFile() && entrada.name.toLowerCase().endsWith(".css")) {
      ficherosCSS.push(path.join(carpeta, entrada.name));
    }
  }
  ficherosCSS.sort((a, b) => {
    const estilosA = path.basename(a).toLowerCase() === "styles.css" ? 0 : 1;
    const estilosB = path.basename(b).toLowerCase() === "styles.css" ? 0 : 1;
    if (estilosA !== estilosB) return estilosA - estilosB;
    return a.localeCompare(b);
  });

  const estilosEnLinea = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map(
    (m) => m[1]
  );

  return { carpeta, html, ficherosCSS, estilosEnLinea };
}

/**
 * Devuelve `null` cuando el demo no se debe tocar (o no hay que tocarlo) y,
 * en caso contrario, la funcion que escribe el bloque.
 */
async function clasificar(indexAbsoluto) {
  const carpetaRelativa = aPosix(path.relative(repositoryDirectory, path.dirname(indexAbsoluto)));
  const categoria = carpetas.get(carpetaRelativa) || "?";

  const { html, ficherosCSS, estilosEnLinea } = await planificar(indexAbsoluto);

  const js = await (async () => {
    const partes = [];
    for (const entrada of await readdir(path.dirname(indexAbsoluto), { withFileTypes: true })) {
      if (entrada.isFile() && entrada.name.toLowerCase().endsWith(".js")) {
        partes.push(await readFile(path.join(path.dirname(indexAbsoluto), entrada.name), "utf8"));
      }
    }
    const enLinea = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script\b[^>]*>/gi)].map((m) => m[1]);
    return partes.concat(enLinea).join("\n");
  })();

  const contenidoCSS = [];
  for (const ruta of ficherosCSS) contenidoCSS.push(await readFile(ruta, "utf8"));
  for (const bloque of estilosEnLinea) contenidoCSS.push(bloque);
  const css = contenidoCSS.join("\n");

  const yaMarcado = css.includes(MARCA);
  const yaEscucha = /prefers-reduced-motion/.test(css);

  const base = { carpeta: carpetaRelativa, categoria };

  if (categoria === CATEGORIA_EXCLUIDA) return { ...base, estado: "loaders" };
  if (yaMarcado) return { ...base, estado: "ya-aplicado" };
  if (yaEscucha) return { ...base, estado: "ya-cubierto" };

  const movimientoCSS = tieneMovimientoCSS(css);
  if (!movimientoCSS) {
    if (tieneMovimientoJS(js)) return { ...base, estado: "solo-js" };
    return { ...base, estado: "sin-movimiento" };
  }

  // Donde se escribe: el CSS del demo (todos tienen exactamente uno; si hay
  // varios manda `styles.css`). Solo si el demo no trae ningun `.css` se
  // recurre al ultimo `<style>` del `index.html`.
  if (ficherosCSS.length) {
    const destino = ficherosCSS[0];
    return {
      ...base,
      estado: "elegible",
      escribir: async () => {
        const actual = await readFile(destino, "utf8");
        const separador = actual.endsWith("\n") || actual.endsWith("\r\n") ? "" : "\n";
        await writeFile(destino, actual + separador + BLOQUE, "utf8");
      },
      destino: aPosix(path.relative(repositoryDirectory, destino)),
    };
  }

  const cierre = html.lastIndexOf("</style>");
  if (cierre === -1) return { ...base, estado: "sin-movimiento" };
  return {
    ...base,
    estado: "elegible",
    escribir: async () => {
      const actual = await readFile(indexAbsoluto, "utf8");
      const indice = actual.lastIndexOf("</style>");
      await writeFile(indexAbsoluto, actual.slice(0, indice) + BLOQUE.trimStart() + "\n" + actual.slice(indice), "utf8");
    },
    destino: aPosix(path.relative(repositoryDirectory, indexAbsoluto)) + " (<style>)",
  };
}

const fichas = [];
for (const raiz of RAICES) {
  const raizAbsoluta = path.join(repositoryDirectory, raiz);
  if (!(await stat(raizAbsoluta).catch(() => null))) continue;
  for (const indexAbsoluto of await buscarDemos(raizAbsoluta).catch(() => [])) {
    fichas.push(await clasificar(indexAbsoluto));
  }
}

// Orden estable: la ruta del demo, para que dos ejecuciones seguidas del
// piloto escogen exactamente los mismos ficheros.
fichas.sort((a, b) => a.carpeta.localeCompare(b.carpeta));

const porEstado = new Map();
for (const ficha of fichas) porEstado.set(ficha.estado, (porEstado.get(ficha.estado) || 0) + 1);

const elegibles = fichas.filter((f) => f.estado === "elegible");
const soloJs = fichas.filter((f) => f.estado === "solo-js");
const loaders = fichas.filter((f) => f.estado === "loaders");

function porCategoria(lista) {
  const cuenta = new Map();
  for (const item of lista) cuenta.set(item.categoria, (cuenta.get(item.categoria) || 0) + 1);
  return [...cuenta.entries()].sort((a, b) => b[1] - a[1]);
}

console.log(`=== Fase 6.3 · prefers-reduced-motion (modo: ${modo}) ===`);
console.log(`${fichas.length} demos recorridos\n`);
console.log(`  movimiento CSS (elegibles):        ${elegibles.length}`);
console.log(`  ya aplicado:                       ${porEstado.get("ya-aplicado") || 0}`);
console.log(`  ya escuchaba la preferencia:       ${porEstado.get("ya-cubierto") || 0}`);
console.log(`  solo JavaScript (no se toca):      ${soloJs.length}`);
console.log(`  sin movimiento:                    ${porEstado.get("sin-movimiento") || 0}`);
console.log(`  categoria ${CATEGORIA_EXCLUIDA} (excluida):     ${loaders.length}`);

if (elegibles.length) {
  console.log(`\nElegibles por categoria:`);
  for (const [categoria, total] of porCategoria(elegibles)) console.log(`  ${String(total).padStart(5)}  ${categoria}`);
}

if (soloJs.length) {
  console.log(`\nSolo JavaScript (trabajo futuro, no se modifica):`);
  for (const [categoria, total] of porCategoria(soloJs)) console.log(`  ${String(total).padStart(5)}  ${categoria}`);
  console.log(`  ${String(soloJs.length).padStart(5)}  total`);
}

let aAplicar = elegibles;
if (modo === "piloto") {
  const piloto = [];
  for (const categoria of ["Effects", "Animations"]) {
    piloto.push(...elegibles.filter((f) => f.categoria === categoria).slice(0, 10));
  }
  aAplicar = piloto;
  console.log(`\nPiloto: ${aAplicar.length} demos seleccionados (10 Effects + 10 Animations)`);
}

if (!aplicar) {
  console.log(`\nDry run: no se ha escrito nada.`);
  console.log(`Ejecuta \`node Web/scripts/add-reduced-motion.mjs --piloto\` para el piloto.`);
  process.exit(0);
}

if (!aAplicar.length) {
  console.log(`\nNada que aplicar con este modo.`);
  process.exit(0);
}

for (const ficha of aAplicar) await ficha.escribir();

console.log(`\nBloque añadido en ${aAplicar.length} demo(s):`);
for (const ficha of aAplicar) console.log(`  + ${ficha.destino}  [${ficha.categoria}]`);

console.log(`\nSiguiente: \`npm run validar:demos\` y revisar el diff antes de continuar.`);
