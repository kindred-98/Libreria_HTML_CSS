/**
 * Comprobacion del CSP del despliegue. No genera nada ni despliega: lee
 * vercel.json, saca los recursos externos que usan de verdad los demos del
 * repo y avisa si alguno no esta permitido en la directiva que le toca. Sale
 * con codigo 1 si algo falta, para que quepa en el mismo workflow que valida
 * el catalogo.
 *
 *   node Web/scripts/validar-csp.mjs
 *
 * Por que existe: el catalogo muestra cada demo dentro de un iframe con las
 * cabeceras del sitio. Si el CSP no permite el host del que un demo saca sus
 * imagenes o sus scripts, el demo aparece roto en produccion aunque en local
 * vaya bien, porque en local no hay CSP. Las galerias son el caso claro: sus
 * fotos vienen de upload.wikimedia.org.
 *
 * Se miran html, js y css, no solo el html, porque hay demos que cargan
 * recursos desde su script o su hoja de estilos. Y avisa tambien de los hosts
 * que el CSP permite pero ya no usa nadie, para que la lista no crezca sola.
 */
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryDirectory = path.resolve(scriptDirectory, "../..");
const vercelFile = path.join(repositoryDirectory, "vercel.json");

const ROOTS = [
  "creaciones-primium",
  "CreacionesNuevas",
  "DavokerDiseñador",
];

// Extension que sirve para adivinar la directiva de un recurso.
const TIPO_POR_EXTENSION = [
  [/\.(?:m?js)(?:\?|$)/i, "script-src", "script"],
  [/\.css(?:\?|$)/i, "style-src", "hoja de estilos"],
  [/\.(?:woff2?|ttf|otf|eot)(?:\?|$)/i, "font-src", "fuente"],
  [/\.(?:png|jpe?g|webp|gif|svg|avif|ico|bmp)(?:\?|$)/i, "img-src", "imagen"],
  [/\.(?:mp4|webm|ogg|mp3|wav)(?:\?|$)/i, "media-src", "media"],
  [/\.wasm(?:\?|$)/i, "script-src", "wasm"],
];

// Hosts cuya directiva conocemos aunque la URL no traiga extension.
const RELEVANCE = [
  { host: "fonts.googleapis.com", directiva: "style-src", why: "Google Fonts, la hoja de estilos" },
  { host: "fonts.gstatic.com", directiva: "font-src", why: "los ficheros de fuente" },
  { host: "use.typekit.net", directiva: "style-src", why: "Typekit, la hoja de estilos" },
  { host: "use.fontawesome.com", directiva: "style-src", why: "el CSS de Font Awesome" },
  { host: "unicons.iconscout.com", directiva: ["style-src", "font-src"], why: "la hoja de estilos y la tipografia Unicons" },
  { host: "upload.wikimedia.org", directiva: "img-src", why: "fotos de las galerias" },
  { host: "commons.wikimedia.org", directiva: "img-src", why: "fichas de Commons" },
  { host: "api.qrserver.com", directiva: "img-src", why: "QR generados al vuelo" },
];

// Hosts que no son recursos: solo los toca la navegacion, y el CSP no
// restringe los enlaces <a>. Tampoco peticiones, son textos de ejemplo.
// Los tres primeros salen de los avisos de licencia dentro de las librerias
// que se descargaron a local: son enlaces de texto, no peticiones.
const NO_RECURSO = [
  /^www\.w3\.org$/,
  /^w3\.org$/,
  /^example\.com$/,
  /^www\.example\.com$/,
  /^your-site\.com$/,
  /^localhost$/,
  /^127\.0\.0\.1$/,
  /^creativecommons\.org$/,
  /^kyruus\.com$/,
  /^rock\.mit-license\.org$/,
];

// Que necesita cada etiqueta HTML que puede traer un recurso.
const POR_ETIQUETA = [
  [/<script[^>]+src/i, "script-src", "script"],
  [/<link[^>]+rel=["']?stylesheet/i, "style-src", "hoja de estilos"],
  [/<link[^>]+rel=["']?icon/i, "img-src", "favicon"],
  [/<img[^>]+src/i, "img-src", "imagen"],
  [/<source[^>]+src/i, "img-src", "imagen"],
  [/<video[^>]+(?:src|poster)/i, "media-src", "media"],
  [/<iframe[^>]+src/i, "frame-src", "iframe"],
  [/@import/i, "style-src", "import de CSS"],
];

async function resourceFiles(directory, found = []) {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch {
    return found;
  }
  for (const entry of entries) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await resourceFiles(full, found);
    } else if (/\.(?:html|js|css|mjs)$/i.test(entry.name)) {
      found.push(full);
    }
  }
  return found;
}

function tipoDe(url, etiqueta) {
  if (etiqueta) return etiqueta;
  const sinQuery = url.split(/[?#]/)[0];
  for (const [re, directiva, nombre] of TIPO_POR_EXTENSION) {
    if (re.test(sinQuery)) return [directiva, nombre];
  }
  return ["*", "sin determinar"];
}

/**
 * Dentro de un css la extension no basta: un .svg puede ser una fuente (dentro
 * de @font-face) o una imagen (en un background-image). Ademas, en un css solo
 * se piden recursos dentro de url() o de un @import: cualquier otra URL es
 * texto (un comentario de licencia, un enlace), y se devuelve null.
 */
function tipoEnCss(texto, posicion) {
  const ventana = texto.slice(Math.max(0, posicion - 400), posicion);

  // @font-face { ... url(...) } que sigue abierto: es una fuente.
  const ultimoFontFace = ventana.lastIndexOf("@font-face");
  if (ultimoFontFace >= 0 && !ventana.slice(ultimoFontFace).includes("}")) {
    return ["font-src", "fuente"];
  }

  // La referencia tiene que estar dentro de url() o de un @import.
  const ultimoUrl = ventana.lastIndexOf("url(");
  const ultimoImport = ventana.lastIndexOf("@import");
  if (ultimoImport > ultimoUrl) return ["style-src", "hoja de estilos importada"];
  if (ultimoUrl < 0) return null;
  // Un cierre de parentesis entre url( y la URL significa que ya se cerro.
  if (ventana.slice(ultimoUrl).includes(")")) return null;

  return ["img-src", "imagen en css"];
}

/** La ultima etiqueta HTML abierta antes de la posicion. */
function etiquetaEn(texto, posicion) {
  const ventana = texto.slice(Math.max(0, posicion - 400), posicion);
  let ultima = "";
  let donde = -1;
  for (const m of ventana.matchAll(/<([a-z][a-z0-9]*)\b/gi)) {
    if (m.index > donde) {
      donde = m.index;
      ultima = m[1].toLowerCase();
    }
  }
  // Si la ultima etiqueta abierta ya se cerro con '>', no envuelve la URL.
  if (donde >= 0 && ventana.slice(donde).includes(">")) return "";
  return ultima;
}

const vercel = JSON.parse(await readFile(vercelFile, "utf8"));
const headerBlock = (vercel.headers ?? []).find((block) =>
  (block.headers ?? []).some((header) => header.key.toLowerCase() === "content-security-policy")
);
const csp = headerBlock?.headers?.find((header) => header.key.toLowerCase() === "content-security-policy")?.value ?? "";

if (!csp) {
  console.log("aviso: vercel.json no declara Content-Security-Policy, no hay nada que comprobar");
  process.exit(0);
}

const directivas = new Map();
for (const parte of csp.split(";")) {
  const tokens = parte.trim().split(/\s+/).filter(Boolean);
  if (tokens.length) directivas.set(tokens[0], tokens.slice(1));
}

function permiteHost(valores, host) {
  return valores.some((valor) => {
    if (valor.includes("*")) {
      const base = valor.replace(/^https?:\/\//, "").replace(/^\*/, "");
      return host.endsWith(base) || host === base.replace(/^\./, "");
    }
    if (valor === "'none'") return false;
    return valor === `https://${host}` || valor === host;
  });
}

/** El host esta permitido en esa directiva concreta? */
function permitidoEn(directiva, host) {
  if (directiva === "*") {
    // Sin determinar: basta con que este en cualquier directiva.
    return [...directivas.values()].some((valores) => permiteHost(valores, host));
  }
  return permiteHost(directivas.get(directiva) ?? [], host);
}

const usados = new Map();
let escaneados = 0;

for (const root of ROOTS) {
  for (const file of await resourceFiles(path.join(repositoryDirectory, root))) {
    const texto = await readFile(file, "utf8");
    escaneados += 1;
    const rel = path.relative(repositoryDirectory, file).split(path.sep).join("/");
    const esCss = rel.endsWith(".css");
    const esHtml = rel.endsWith(".html");

    for (const m of texto.matchAll(/https?:\/\/[^\s"'`<>()\\]+/g)) {
      const url = m[0];
      let host;
      try {
        host = new URL(url).host;
      } catch {
        continue;
      }
      if (!host.includes(".")) continue;
      if (NO_RECURSO.some((re) => re.test(host))) continue;

      let etiqueta = null;
      if (esHtml) {
        const et = etiquetaEn(texto, m.index);
        // Un enlace <a> no es una peticion.
        if (et === "a") continue;
        const ventana = texto.slice(Math.max(0, m.index - 400), m.index);
        for (const [re, directiva, nombre] of POR_ETIQUETA) {
          for (const t of ventana.matchAll(new RegExp(re.source, "gi"))) {
            if (!ventana.slice(t.index + t[0].length).includes(">")) etiqueta = [directiva, nombre];
          }
        }
      }

      // Las hojas y los scripts que se descargaron a local traen comentarios de
      // licencia y enlaces al sitio del proyecto: es texto, no peticiones.
      if (esCss) {
        const enCss = tipoEnCss(texto, m.index);
        if (!enCss) continue;
      }
      const [directiva, tipo] = esCss ? tipoEnCss(texto, m.index) : tipoDe(url, etiqueta);
      // En un .js solo se puede adivinar el tipo; si no se reconoce y el fichero
      // esta descargado, se presume que es texto del aviso de licencia.
      if (rel.includes("/vendor/") && directiva === "*") continue;

      const d = usados.get(host) ?? { veces: 0, en: new Set(), directivas: new Set(), tipos: new Set() };
      d.veces += 1;
      d.en.add(rel);
      d.directivas.add(directiva);
      d.tipos.add(tipo);
      usados.set(host, d);
    }
  }
}

// Los hosts de la tabla RELEVANCE mandan sobre lo que se deduzca.
for (const { host, directiva, why } of RELEVANCE) {
  if (!usados.has(host)) continue;
  const d = usados.get(host);
  d.directivas.delete("*");
  for (const dir of [].concat(directiva)) d.directivas.add(dir);
  d.why = why;
}

const failures = [];
for (const [host, uso] of [...usados].sort((a, b) => b[1].veces - a[1].veces)) {
  for (const directiva of uso.directivas) {
    if (!permitidoEn(directiva, host)) {
      const ejemplos = [...uso.en].slice(0, 2).join(", ");
      const detalle = uso.why ? `, que se usa para ${uso.why}` : "";
      failures.push(`${directiva} no permite ${host} (${uso.veces} usos${detalle}, p. ej. ${ejemplos})`);
    }
  }
}

// El CSP tambien tiene que dejar de permitir hosts que ya no usa nadie.
const permitidos = new Map();
for (const [directiva, valores] of directivas) {
  for (const valor of valores) {
    if (valor.startsWith("https://") && !valor.includes("*")) {
      permitidos.set(valor.slice("https://".length), directiva);
    }
  }
}
const huerfanos = [];
for (const [host, directiva] of permitidos) {
  if (!usados.has(host)) huerfanos.push(`${directiva} sigue permitiendo ${host}, que ya no usa ningun demo`);
}

console.log(`ficheros html/js/css escaneados: ${escaneados}`);
console.log(`hosts externos en los demos: ${usados.size}`);
console.log(`directivas del CSP: ${[...directivas.keys()].join(", ")}`);
for (const [host, uso] of [...usados].sort((a, b) => b[1].veces - a[1].veces)) {
  console.log(`  ${host.padEnd(28)} ${String(uso.veces).padStart(4)} usos  [${[...uso.directivas].join(", ")}]`);
}

if (failures.length || huerfanos.length) {
  console.log("");
  for (const failure of failures) console.log(`FALLO: ${failure}`);
  for (const orphan of huerfanos) console.log(`SOBRANTE: ${orphan}`);
  console.log("");
  console.log("Anade el host a la directiva correcta de vercel.json, o quita el que ya no se use.");
  process.exit(1);
}

console.log("\nok: el CSP cubre todos los recursos externos que usan los demos, y no sobra nada");
