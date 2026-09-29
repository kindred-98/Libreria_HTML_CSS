/**
 * Trae a local los recursos que los demos piden a CDNs.
 *
 *   node Web/scripts/apartar-recursos-remotos.mjs            (dry-run: solo lista)
 *   node Web/scripts/apartar-recursos-remotos.mjs --escribir  (descarga y reescribe)
 *
 * Para cada html, css o js que apunte a un recurso externo, lo descarga dentro
 * de la propia carpeta del componente (carpeta `vendor/`) y cambia la referencia
 * por la ruta relativa. Despues baja tambien lo que ese css referencie (las
 * fuentes de los iconos, por ejemplo), y las hojas de Google Fonts con sus woff2.
 *
 * Lo que NO toca: las fotos de Wikimedia, que son el recurso documentado del
 * proyecto, y las referencias dentro de un <a href>, que no son peticiones.
 *
 * Para que sirva: el catalogo muestra cada demo dentro de un iframe con las
 * cabeceras del sitio, y el CSP solo permite unos hosts. Si el CDN cae o deja de
 * servir, el demo se ve roto. Con el recurso dentro de la carpeta, el demo no
 * depende de nadie y el CSP se puede apretar hasta 'self'.
 */
import { readFile, writeFile, mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryDirectory = path.resolve(scriptDirectory, "../..");
const ESCRIBIR = process.argv.includes("--escribir");
const SOLO = process.argv.find((a) => a.startsWith("--solo="))?.slice(7) ?? null;

const ROOTS = ["creaciones-primium", "CreacionesNuevas", "GevendraAutorExterno", "DavokerDiseñador"];

// Hosts que se quedan fuera, y por que.
const SE_QUEDA = [
  [/upload\.wikimedia\.org/, "las fotos de las galerias se quedan en Wikimedia, esta documentado"],
  [/commons\.wikimedia\.org/, "el enlace a la fuente de las fotos"],
  [/api\.qrserver\.com/, "API de QR al vuelo: se permite en el CSP, no es un fichero"],
  [/^www\.w3\.org$|^w3\.org$/, "namespace de SVG, no es una peticion"],
  [/^example\.com$|^www\.example\.com$|^your-site\.com$/, "texto de ejemplo"],
  [/^localhost$|^127\.0\.0\.1$/, "pruebas locales"],
];

// Estos necesitan navegador para que el servidor sirva lo moderno.
const UA_NAVEGADOR =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function archivosDe(dir, found = []) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return found;
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    // Lo que ya esta descargado se deja como esta: dentro de las librerias hay
    // urls de ejemplo y de licencia que no son peticiones, y reescribirlas
    // dejaria las librerias rotas.
    if (e.isDirectory() && e.name === "vendor") continue;
    if (e.isDirectory()) await archivosDe(full, found);
    else if (/\.(?:html|js|css)$/i.test(e.name)) found.push(full);
  }
  return found;
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
  // Si despues de abrir la etiqueta hay un '>', ya esta cerrada y no envuelve la URL.
  if (donde >= 0) {
    const despues = ventana.slice(donde);
    if (despues.includes(">")) return "";
  }
  return ultima;
}

function nombrePara(url, texto) {
  let p;
  try {
    p = new URL(url);
  } catch {
    return null;
  }
  let base = path.basename(p.pathname);
  if (!base || base === "/" || !path.extname(base)) {
    const ext = /\.js(\?|$)/i.test(url) ? ".js" : /\.css(\?|$)/i.test(url) ? ".css" : "";
    if (!ext) {
      const hash = createHash("sha1").update(url).digest("hex").slice(0, 8);
      const familia = (p.searchParams.get("family") ?? "recurso").replace(/[^a-z0-9]/gi, "-").toLowerCase();
      return `${familia}-${hash}.css`;
    }
    base = `recurso${ext}`;
  }
  // Los nombres muy largos o con caracteres raros se quedan cortos.
  if (base.length > 48 || /[^a-z0-9._-]/i.test(base)) {
    const ext = path.extname(base) || ".bin";
    const hash = createHash("sha1").update(url).digest("hex").slice(0, 8);
    const stem = path.basename(base, ext).replace(/[^a-z0-9._-]/gi, "-").slice(0, 28);
    base = `${stem}${ext.replace(".", "-")}${hash}${ext}`;
  }
  return base;
}

async function bajar(url) {
  const res = await fetch(url, { headers: { "user-agent": UA_NAVEGADOR }, redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const tipo = res.headers.get("content-type") ?? "";
  const buf = Buffer.from(await res.arrayBuffer());
  return { buf, tipo };
}

const cambios = [];
const fallos = [];
const pendientesCss = [];

/** Descarga la url dentro de `destino` y devuelve la ruta relativa desde `desde`. */
async function traer(url, destino, desde) {
  const nombre = nombrePara(url);
  if (!nombre) return null;
  const fichero = path.join(destino, nombre);
  let rel = path.relative(path.dirname(desde), fichero).split(path.sep).join("/");
  if (!rel.startsWith(".")) rel = "./" + rel;
  // En el dry-run no se baja nada: solo se calcula lo que se cambiaria.
  if (!ESCRIBIR) return { rel, fichero, nombre, bytes: 0, url };
  try {
    const { buf } = await bajar(url);
    if (buf.length === 0) throw new Error("vacio");
    await mkdir(destino, { recursive: true });
    await writeFile(fichero, buf);
    return { rel, fichero, nombre, bytes: buf.length, url };
  } catch (e) {
    fallos.push(`${url} -> ${e.message}`);
    return null;
  }
}

/**
 * Dentro de un css ya descargado: las url() y los @import que necesite.
 *
 * Las url() pueden ser absolutas (https://...) o relativas a la hoja de origen
 * (../webfonts/fa-solid-900.woff2). Las dos son peticiones reales, y las
 * relativas hay que resolverlas contra la URL original: al mover la hoja a
 * vendor/, un ../webfonts/ pasaria a apuntar a una carpeta que no existe y la
 * fuente no se cargaria nunca.
 */
async function traerDeCss(cssPath, urlCss) {
  let css = await readFile(cssPath, "utf8");
  let tocado = false;
  const base = urlCss ?? `file:///${cssPath.split(path.sep).join("/")}`;

  const resolver = (bruto) => {
    try {
      return new URL(bruto, base).href;
    } catch {
      return null;
    }
  };

  // Ojo con el patron: una url() entre comillas puede llevar parentesis dentro
  // (las fuentes de Inter se llaman "Inter (web)/Inter-Regular.woff2"), asi que
  // se captura hasta la comilla de cierre y no hasta el primer parentesis.
  for (const m of [...css.matchAll(/url\(\s*(['"])([\s\S]*?)\1\s*\)|url\(([^'")\s][^)]*)\)/gi)]) {
    const bruto = (m[2] ?? m[3] ?? "").trim();
    if (!bruto || bruto.startsWith("data:") || bruto.startsWith("#")) continue;
    const absoluta = resolver(bruto);
    if (!absoluta) continue;
    const r = await traer(absoluta, path.join(path.dirname(cssPath), "fuentes"), cssPath);
    if (r) {
      const rel = path.relative(path.dirname(cssPath), r.fichero).split(path.sep).join("/");
      css = css.split(m[0]).join(`url("${rel}")`);
      tocado = true;
      cambios.push({ tipo: "recurso interno", url: absoluta, a: rel, en: path.relative(repositoryDirectory, cssPath) });
    }
  }

  // tambien los @import, absolutos o relativos
  for (const m of [...css.matchAll(/@import\s+(?:url\(\s*)?['"]?([^'");\s]+)['"]?\s*\)?/gi)]) {
    const bruto = m[1].trim();
    if (!bruto || bruto.startsWith("data:")) continue;
    const absoluta = resolver(bruto);
    if (!absoluta) continue;
    const r = await traer(absoluta, path.dirname(cssPath), cssPath);
    if (r) {
      css = css.split(m[0]).join(`@import url("${r.rel}")`);
      tocado = true;
      cambios.push({ tipo: "@import", url: absoluta, a: r.rel, en: path.relative(repositoryDirectory, cssPath) });
    }
  }
  if (tocado) await writeFile(cssPath, css, "utf8");
}

async function main() {
  const todo = [];
  for (const root of ROOTS) todo.push(...(await archivosDe(path.join(repositoryDirectory, root))));

  for (const file of todo) {
    const relFile = path.relative(repositoryDirectory, file).split(path.sep).join("/");
    if (SOLO && !relFile.includes(SOLO)) continue;
    const original = await readFile(file, "utf8");
    let texto = original;
    const destino = path.join(path.dirname(file), "vendor");

    // De fondo a cabeza, para no romper los indices de matchAll.
    const hallazgos = [];
    for (const m of texto.matchAll(/https?:\/\/[^\s"'`<>()\\]+/g)) {
      const url = m[0].replace(/&amp;/g, "&");
      let host = "";
      try {
        host = new URL(url).host;
      } catch {
        continue;
      }
      if (SE_QUEDA.some(([re]) => re.test(host))) continue;
      if (SE_QUEDA.some(([re]) => re.test(url))) continue;
      // Un enlace <a> no es una peticion.
      if (relFile.endsWith(".html")) {
        const et = etiquetaEn(texto, m.index);
        if (et === "a") continue;
      }
      hallazgos.push({ url, crudo: m[0], indice: m.index });
    }

    // Unicos por url, y procesados de derecha a izquierda.
    const unicos = new Map();
    for (const h of hallazgos) if (!unicos.has(h.url)) unicos.set(h.url, h);

    const orden = [...unicos.values()].sort((a, b) => b.indice - a.indice);
    for (const h of orden) {
      const esCss = /\.css(\?|$)/i.test(h.url) || /fonts\.googleapis/.test(h.url);
      const r = await traer(h.url, destino, file);
      if (!r) continue;

      // `<link rel="preconnect" href="https://fonts.googleapis.com">` sobra.
      if (relFile.endsWith(".html")) {
        const rePreconnect = new RegExp(
          `<link[^>]*rel=['"]?preconnect['"]?[^>]*href=['"]${h.crudo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}['"][^>]*>\\s*`,
          "gi"
        );
        if (rePreconnect.test(texto)) texto = texto.replace(rePreconnect, "");
      }

      texto = texto.split(h.crudo).join(r.rel);
      cambios.push({ tipo: esCss ? "css" : "recurso", url: h.url, a: r.rel, en: relFile });
      if (esCss) pendientesCss.push({ fichero: r.fichero, url: h.url });
    }

    if (texto !== original) {
      if (ESCRIBIR) await writeFile(file, texto, "utf8");
      else console.log(`(dry-run) cambiaria ${relFile}`);
    }
  }

  // Lo que referencian los css descargados (fuentes de iconos, woff2 de Google).
  for (const css of pendientesCss) {
    if (ESCRIBIR) await traerDeCss(css.fichero, css.url);
    else console.log(`(dry-run) bajaria las fuentes de ${path.relative(repositoryDirectory, css.fichero)}`);
  }

  console.log(`\n=== ${cambios.length} referencias cambiadas${ESCRIBIR ? "" : " (dry-run, no escrito)"} ===`);
  const porTipo = new Map();
  for (const c of cambios) porTipo.set(c.tipo, (porTipo.get(c.tipo) ?? 0) + 1);
  for (const [t, n] of porTipo) console.log(`  ${t}: ${n}`);
  if (fallos.length) {
    console.log(`\n=== ${fallos.length} fallos de descarga ===`);
    for (const f of fallos) console.log("  " + f);
  }
  const afectados = new Set(cambios.map((c) => c.en));
  console.log(`\nficheros tocados: ${afectados.size}`);

  if (!ESCRIBIR) {
    console.log("\nPara aplicar: node Web/scripts/apartar-recursos-remotos.mjs --escribir");
    process.exit(fallos.length ? 1 : 0);
  }
  process.exit(fallos.length ? 1 : 0);
}

main().catch((e) => {
  console.error("error:", e);
  process.exit(1);
});
