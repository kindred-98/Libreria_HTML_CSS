/**
 * Comprueba los enlaces relativos y las anclas de las paginas del sitio
 * (Fase 7.3).
 *
 * Por que existe: `validate.mjs` ya mira las referencias rotas dentro de los
 * demos, pero no las de las paginas de la aplicacion. Un enlace a
 * `./components.htm` o a `#destacados` mal escrito no rompe la pagina: solo
 * lleva a un 404 o no mueve el scroll, y en ambos casos el fallo se descubre
 * cuando alguien hace clic, no cuando se despliega.
 *
 * Que hace: por cada pagina del sitio lee sus `href` y `src` y comprueba:
 *
 *   - `#ancla` -> la pagina tiene que declarar esa `id`.
 *   - `pagina.html#ancla` -> el fichero tiene que existir Y tener esa `id`.
 *   - ruta relativa -> el fichero o la carpeta tienen que existir.
 *
 * Los enlaces externos (`https:`, `mailto:`, `tel:`...) se cuentan pero no se
 * comprueban: eso lo hace el workflow semanal, porque una web de terceros cae
 * sin que nosotros tengamos la culpa y no puede cortar un PR.
 *
 *   node Web/scripts/validar-enlaces.mjs
 *   npm run validar:enlaces
 *
 * Sale con codigo 1 si hay algun enlace roto, para poder encadenarlo en CI.
 */
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryDirectory = path.resolve(scriptDirectory, "../..");

// Las mismas paginas que mira `html-validate` y que el CI construye.
const PAGINAS = ["Web/index.html", "Web/components.html", "Web/team-core.html", "404.html", "index.html"];

const fallos = [];
const avisos = [];
let externos = 0;
let comprobados = 0;

async function existe(ruta) {
  try {
    await stat(ruta);
    return true;
  } catch {
    return false;
  }
}

/** Los `id` que declara un fichero HTML, incluidos los que inyecta el JS. */
async function leerIds(ruta) {
  const texto = await readFile(ruta, "utf8");
  const ids = new Set();
  for (const coincidencia of texto.matchAll(/\bid\s*=\s*["']([^"']+)["']/gi)) {
    ids.add(coincidencia[1]);
  }
  return ids;
}

const cacheIds = new Map();
async function idsDe(ruta) {
  if (!cacheIds.has(ruta)) cacheIds.set(ruta, await leerIds(ruta).catch(() => null));
  return cacheIds.get(ruta);
}

for (const pagina of PAGINAS) {
  const absolutaPagina = path.join(repositoryDirectory, pagina);
  if (!(await existe(absolutaPagina))) {
    fallos.push(`${pagina}: la pagina no existe`);
    continue;
  }
  const texto = await readFile(absolutaPagina, "utf8");
  const carpeta = path.dirname(absolutaPagina);
  const idsPropios = await idsDe(absolutaPagina);

  for (const coincidencia of texto.matchAll(/\b(href|src)\s*=\s*["']([^"']*)["']/gi)) {
    const atributo = coincidencia[1].toLowerCase();
    const destino = coincidencia[2].trim();
    if (!destino) continue;

    // Externos, datos, javascript: y demas esquemas se quedan aqui fuera.
    if (/^[a-z][a-z0-9+.-]*:/i.test(destino)) {
      externos += 1;
      continue;
    }

    const [rutaParte, ancla] = destino.split("#");
    const sinConsulta = rutaParte.split("?")[0];

    // Solo ancla: apunta dentro de esta misma pagina.
    if (!sinConsulta) {
      comprobados += 1;
      if (ancla && !idsPropios?.has(ancla)) {
        fallos.push(`${pagina}: ${atributo}="${destino}" no encuentra la id "${ancla}" en la misma pagina`);
      }
      continue;
    }

    let rutaLimpia = sinConsulta;
    try {
      // `DavokerDise%C3%B1ador` es como el navegador ve `DavokerDiseñador`:
      // sin decodificar, el fichero parece que no existe y si.
      rutaLimpia = decodeURIComponent(sinConsulta);
    } catch {
      // una secuencia mal formada se deja como esta y ya la cazara `existe`.
    }

    let objetivo;
    if (rutaLimpia.startsWith("/")) objetivo = path.join(repositoryDirectory, rutaLimpia.slice(1));
    else objetivo = path.resolve(carpeta, rutaLimpia);

    const relativo = path.relative(repositoryDirectory, objetivo).split(path.sep).join("/");
    comprobados += 1;

    if (!(await existe(objetivo))) {
      // Una carpeta sin fichero acaba en 404 salvo que lleve su index.html.
      if (rutaLimpia.endsWith("/") && (await existe(path.join(objetivo, "index.html")))) {
        // correcto
      } else {
        fallos.push(`${pagina}: ${atributo}="${destino}" apunta a ${relativo}, que no existe`);
        continue;
      }
    }

    if (ancla) {
      const destinoAbsoluto = rutaLimpia.endsWith("/") ? path.join(objetivo, "index.html") : objetivo;
      const idsDestino = await idsDe(destinoAbsoluto);
      if (!idsDestino) {
        avisos.push(`${pagina}: ${atributo}="${destino}" no se puede leer para comprobar la ancla`);
      } else if (!idsDestino.has(ancla)) {
        fallos.push(`${pagina}: ${atributo}="${destino}" no encuentra la id "${ancla}" en ${relativo}`);
      }
    }
  }
}

console.log(
  `info  ${PAGINAS.length} paginas del sitio, ${comprobados} destinos locales comprobados, ${externos} externos`,
);

if (avisos.length) {
  for (const aviso of avisos) console.log(`AVISO: ${aviso}`);
}

if (fallos.length) {
  console.error(`\n${fallos.length} enlace(s) roto(s):\n`);
  for (const fallo of fallos) console.error(`  x ${fallo}`);
  console.error(`\nCorrige el href/src o crea el fichero al que apunta.`);
  process.exit(1);
}

console.log(`\nTodos los enlaces relativos y las anclas de las paginas del sitio cuadran.`);
