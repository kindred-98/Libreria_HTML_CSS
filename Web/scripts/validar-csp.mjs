/**
 * Comprobacion del CSP del despliegue. No genera nada ni despliega: lee
 * vercel.json, saca los hosts externos que usan de verdad los demos del repo y
 * avisa si alguno no esta permitido. Sale con codigo 1 si algo falta, para que
 * quepa en el mismo workflow que valida el catalogo.
 *
 *   node Web/scripts/validar-csp.mjs
 *
 * Por que existe: el catalogo muestra cada demo dentro de un iframe con las
 * cabeceras del sitio. Si el CSP no permite el host del que un demo saca sus
 * imagenes o sus scripts, el demo aparece roto en produccion aunque en local
 * vaya bien, porque en local no hay CSP. Las galerias son el caso claro: sus
 * fotos vienen de upload.wikimedia.org.
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
  "GevendraAutorExterno",
  "DavokerDiseñador",
];

// Que necesita cada host en la cabecera. Un host puede aparecer en varias
// directivas: una imagen externa no basta con permitirla en img-src.
const RELEVANCE = [
  { host: "fonts.googleapis.com", needs: ["style-src"], why: "Google Fonts, la hoja de estilos" },
  { host: "fonts.gstatic.com", needs: ["font-src"], why: "los ficheros de fuente" },
  { host: "upload.wikimedia.org", needs: ["img-src"], why: "fotos de las galerias" },
  { host: "commons.wikimedia.org", needs: ["img-src"], why: "fichas de Commons" },
];

const failures = [];
const notes = [];

async function htmlFiles(directory) {
  const found = [];
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch {
    return found;
  }
  for (const entry of entries) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      found.push(...(await htmlFiles(full)));
    } else if (entry.name.endsWith(".html")) {
      found.push(full);
    }
  }
  return found;
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

const usados = new Map();
for (const root of ROOTS) {
  for (const file of await htmlFiles(path.join(repositoryDirectory, root))) {
    const html = await readFile(file, "utf8");
    const patrones = [
      ...[...html.matchAll(/<img[^>]+src="(https?:\/\/[^/"]+)/gi)].map((m) => m[1]),
      ...[...html.matchAll(/<script[^>]+src="(https?:\/\/[^/"]+)/gi)].map((m) => m[1]),
      ...[...html.matchAll(/<link[^>]+href="(https?:\/\/[^/"]+)/gi)].map((m) => m[1]),
      ...[...html.matchAll(/url\(\s*['"]?(https?:\/\/[^/'")]+)/gi)].map((m) => m[1]),
    ];
    for (const host of patrones) {
      // Los patrones traen el esquema; la clave es el host pelado.
      const pelado = host.replace(/^https?:\/\//, "");
      const usar = usados.get(pelado) ?? { veces: 0, en: new Set() };
      usar.veces += 1;
      usar.en.add(path.relative(repositoryDirectory, file).split(path.sep).join("/"));
      usados.set(pelado, usar);
    }
  }
}

for (const [host, uso] of [...usados].sort((a, b) => b[1].veces - a[1].veces)) {
  // Un comodin del propio CSP cubre el host si coincide el prefijo.
  const permitido = [...directivas.entries()].some(([, valores]) =>
    valores.some((valor) =>
      valor.includes("*")
        ? host.endsWith(valor.replace("https://*.", "").replace("*", ""))
        : valor === `https://${host}`
    )
  );
  if (!permitido) {
    const ejemplos = [...uso.en].slice(0, 2).join(", ");
    failures.push(`ninguna directiva del CSP permite ${host} (${uso.veces} usos, p. ej. ${ejemplos})`);
  }
}

for (const { host, needs, why } of RELEVANCE) {
  if (!usados.has(host)) continue;
  for (const directiva of needs) {
    const valores = directivas.get(directiva) ?? [];
    const ok = valores.some((valor) => valor === `https://${host}` || valor.includes(host));
    if (!ok) {
      failures.push(`${directiva} no permite ${host}, que se usa para ${why}`);
    }
  }
}

for (const host of usados.keys()) notes.push(`${host} (${usados.get(host).veces})`);

console.log(`hosts externos en los demos: ${usados.size}`);
console.log(`directivas del CSP: ${[...directivas.keys()].join(", ")}`);

if (failures.length) {
  console.log("");
  for (const failure of failures) console.log(`FALLO: ${failure}`);
  console.log("");
  console.log("Anade el host a la directiva correcta de vercel.json o cambia el demo para no usarlo.");
  process.exit(1);
}

console.log("ok: el CSP cubre todos los hosts externos que usan los demos");
