import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { brotliCompress, constants as zlibConstants, gzip } from "node:zlib";
import { promisify } from "node:util";

const gzipAsync = promisify(gzip);
const brotliAsync = promisify(brotliCompress);

const repositoryDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const port = Number(process.env.PORT ?? 8000);

// Vercel manda el CSP de vercel.json en todas las respuestas y aqui no habia
// cabecera ninguna: un host que el CSP no permite (los avatares de GitHub en
// team-core) se veia bien en local y roto en produccion. Sirve igual que alli.
const vercelFile = path.join(repositoryDirectory, "vercel.json");
const vercel = JSON.parse(await readFile(vercelFile, "utf8"));
const securityPolicy = (vercel.headers ?? [])
  .flatMap((block) => block.headers ?? [])
  .find((header) => header.key?.toLowerCase() === "content-security-policy")?.value;

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
};

// Extensiones que merece la pena comprimir: binarias (png, woff2) ya vienen
// de por si y solo ganarian tiempo de CPU.
const compressible = new Set([".html", ".css", ".js", ".mjs", ".json", ".svg", ".txt", ".xml"]);
const compressFromBytes = 1024;

function resolveRequest(url) {
  const requested = decodeURIComponent(url.split("?")[0].split("#")[0]);
  const base = path.resolve(repositoryDirectory, `.${path.posix.sep}${requested}`);
  // Nunca dejar que una ruta salga de la raiz del repositorio. path.relative es
  // la comprobacion correcta: un startsWith sin separador final dejaria pasar
  // una carpeta vecina cuyo nombre empiece por el del repositorio.
  const relative = path.relative(repositoryDirectory, base);
  if (relative.startsWith("..") || path.isAbsolute(relative)) return null;
  return base;
}

// Vercel sirve con brotli; sin comprimir en local las pruebas de rendimiento
// salian unas diez veces mas lentas que en produccion.
async function compressBody(body, extension, acceptEncoding) {
  if (!compressible.has(extension) || body.length < compressFromBytes) return null;
  if (/\bbr\b/.test(acceptEncoding ?? "")) {
    const payload = await brotliAsync(body, { params: { [zlibConstants.BROTLI_PARAM_QUALITY]: 5 } });
    return { encoding: "br", payload };
  }
  if (/\bgzip\b/.test(acceptEncoding ?? "")) {
    return { encoding: "gzip", payload: await gzipAsync(body) };
  }
  return null;
}

const server = http.createServer(async (request, response) => {
  let file = resolveRequest(request.url ?? "/");
  if (!file) {
    response.writeHead(403).end("403");
    return;
  }
  try {
    const info = await stat(file);
    if (info.isDirectory()) file = path.join(file, "index.html");
    const body = await readFile(file);
    const extension = path.extname(file).toLowerCase();
    const compressed = await compressBody(body, extension, request.headers["accept-encoding"]);
    const headers = {
      "content-type": contentTypes[extension] ?? "application/octet-stream",
      "cache-control": "no-cache",
      vary: "Accept-Encoding",
    };
    if (securityPolicy) headers["content-security-policy"] = securityPolicy;
    if (compressed) {
      headers["content-encoding"] = compressed.encoding;
      headers["content-length"] = String(compressed.payload.length);
    } else {
      headers["content-length"] = String(body.length);
    }
    response.writeHead(200, headers);
    response.end(compressed ? compressed.payload : body);
  } catch {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" }).end("404");
  }
});

server.listen(port, () => {
  console.log(`Sirviendo el repositorio en http://localhost:${port}/`);
  console.log(`La web esta en http://localhost:${port}/Web/`);
});
