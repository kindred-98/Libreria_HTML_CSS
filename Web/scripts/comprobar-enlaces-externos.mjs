/**
 * Comprueba que los enlaces externos de las paginas del sitio y del README
 * siguen respondiendo (Fase 7.3).
 *
 * Por que existe: los enlaces internos se pueden mirar en el repositorio, pero
 * un enlace a un articulo, a un perfil o a una documentacion externa se rompe
 * cuando el otro lado cambia de sitio, y eso nadie lo ve hasta que alguien
 * hace clic. Al contrario que las comprobaciones internas, aqui la culpa casi
 * nunca es nuestra, asi que este script **nunca debe cortar un PR**: por eso
 * corre solo por `schedule` con `continue-on-error`.
 *
 * Que hace: extrae todas las URLs absolutas de `Web/*.html`, `404.html`,
 * `index.html` y `README.md`, las prueba una a una (HEAD y si no, GET) y
 * lista las que no contestan con 2xx o 3xx.
 *
 *   node Web/scripts/comprobar-enlaces-externos.mjs
 *   npm run enlaces:externos
 *
 * Sale con codigo 1 si hay enlaces rotos; en CI eso solo produce un aviso en el
 * workflow semanal.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryDirectory = path.resolve(scriptDirectory, "../..");

const FUENTES = [
  "Web/index.html",
  "Web/components.html",
  "Web/team-core.html",
  "404.html",
  "index.html",
  "README.md",
];

const TIEMPO_POSE = 15000;

async function existe(ruta) {
  try {
    await readFile(ruta);
    return true;
  } catch {
    return false;
  }
}

const urls = new Map();
for (const fuente of FUENTES) {
  const absoluta = path.join(repositoryDirectory, fuente);
  if (!(await existe(absoluta))) continue;
  const texto = await readFile(absoluta, "utf8");
  const candidatas = [
    ...[...texto.matchAll(/\b(?:href|src)\s*=\s*["'](https?:\/\/[^"']+)["']/gi)].map((m) => m[1]),
    ...[...texto.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)].map((m) => m[1]),
    ...[...texto.matchAll(/(?<![("\]])\bhttps?:\/\/[^\s<>"')\]]+/g)].map((m) => m[0]),
  ];
  for (const url of candidatas) {
    const limpia = url.replace(/[.,;:]+$/, "");
    if (!limpia.startsWith("http")) continue;
    if (!urls.has(limpia)) urls.set(limpia, new Set());
    urls.get(limpia).add(fuente);
  }
}

const lista = [...urls.keys()]
  .filter((url) => {
    // `http://localhost:8000/` es el servidor local que describe el README:
    // no es un sitio de terceros y solo contesta en la maquina de quien lo
    // levanta. Se queda fuera de la comprobacion.
    try {
      const host = new URL(url).hostname;
      return host !== "localhost" && host !== "127.0.0.1" && host !== "[::1]";
    } catch {
      return false;
    }
  })
  .sort((a, b) => a.localeCompare(b));
console.log(`info  ${lista.length} urls externas en ${FUENTES.length} fuentes`);

const rotas = [];
let comprobadas = 0;

for (const url of lista) {
  let respuesta = null;
  let error = null;
  for (const metodo of ["HEAD", "GET"]) {
    try {
      respuesta = await fetch(url, {
        method: metodo,
        redirect: "follow",
        signal: AbortSignal.timeout(TIEMPO_POSE),
        headers: { "user-agent": "libreria-html-css-link-check/1.0" },
      });
      if (respuesta.ok || respuesta.status < 400) break;
      // 405/403 en HEAD es habitual en sitios que solo responden a GET.
      if (metodo === "HEAD" && [403, 405, 400, 501].includes(respuesta.status)) continue;
      break;
    } catch (caught) {
      error = caught;
      respuesta = null;
    }
  }
  comprobadas += 1;
  const estado = respuesta ? respuesta.status : `sin respuesta (${error?.name ?? "error"})`;
  const ok = respuesta ? respuesta.status < 400 : false;
  if (!ok) {
    rotas.push({ url, estado, fuentes: [...urls.get(url)].join(", ") });
  } else {
    console.log(`  ok   ${estado}  ${url}`);
  }
}

console.log(`\n${comprobadas} comprobadas, ${rotas.length} sin respuesta util`);

if (rotas.length) {
  console.error(`\nEnlaces externos rotos:\n`);
  for (const rota of rotas)
    console.error(`  x [${rota.estado}] ${rota.url}\n      usado en: ${rota.fuentes}`);
  process.exit(1);
}

console.log(`\nTodos los enlaces externos del sitio y del README responden.`);
