import http from "node:http";
import { createHash } from "node:crypto";
import { lstat, readFile, realpath } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { brotliCompress, constants as zlibConstants, gzip } from "node:zlib";
import { promisify } from "node:util";

const gzipAsync = promisify(gzip);
const brotliAsync = promisify(brotliCompress);

const repositoryDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const port = Number(process.env.PORT ?? 8000);

// La raiz ya resuelta por el sistema de ficheros, de una vez. Se compara contra
// realpath(ruta pedida) y no contra la raiz lexical: path.resolve normaliza los
// "..", no los enlaces de los directorios padres, y en macOS /var es un enlace
// a /private/var, asi que las dos rutas jamas compartirian prefijo.
const repositoryRealDirectory = await realpath(repositoryDirectory);

// Vercel manda el CSP de vercel.json en todas las respuestas y aqui no habia
// cabecera ninguna: un host que el CSP no permite (los avatares de GitHub en
// team-core) se veia bien en local y roto en produccion. Sirve igual que alli.
const vercelFile = path.join(repositoryDirectory, "vercel.json");
const vercel = JSON.parse(await readFile(vercelFile, "utf8"));
const securityPolicy = (vercel.headers ?? [])
  .flatMap((block) => block.headers ?? [])
  .find((header) => header.key?.toLowerCase() === "content-security-policy")?.value;

// Los Cache-Control de vercel.json tambien se sirven aqui. Antes este servidor
// mandaba "no-cache" en todo, con lo que en local no se cacheaba NADA y la
// segunda visita volvia a descargar el sitio entero: cualquier prueba de
// rendimiento en local salia siempre mal, aunque en produccion el sitio si
// estuviera cacheado. Se leen de vercel.json para que local y produccion
// coincidan y el comportamiento se pueda medir de verdad.
//
// El "source" de Vercel ya viene en forma de expresion regular (por ejemplo
// "/Web/data/sources/(.*)" o "/Web/(.*\\.html)"), asi que aqui solo hay que
// anclarlo para que sea una coincidencia completa y no un prefijo. Si algún dia
// se usa la sintaxis de parametros de Vercel (":nombre*"), que no es una regex
// valida, esa regla se avisa y se ignora en vez de romper el arranque.
const cacheRules = [];
for (const block of vercel.headers ?? []) {
  const valor = (block.headers ?? []).find((h) => h.key?.toLowerCase() === "cache-control")?.value;
  if (!valor) continue;
  const source = String(block.source);
  if (source.includes(":")) {
    console.warn(`aviso: no se aplica en local la regla de cache "${source}" (sintaxis de parametros de Vercel).`);
    continue;
  }
  try {
    cacheRules.push({ source, expression: new RegExp(`^${source}$`), valor });
  } catch (error) {
    console.warn(`aviso: la regla de cache "${source}" no es una expresion regular valida (${error.message}).`);
  }
}

// Como en Vercel, manda la ultima regla que coincide: el orden del array es
// el orden de aplicacion.
function cacheControlFor(ruta) {
  let valor = "no-cache";
  for (const rule of cacheRules) {
    if (rule.expression.test(ruta)) valor = rule.valor;
  }
  return valor;
}

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

// Carpetas y ficheros que no se sirven: el historial de git entero, los
// ficheros de configuracion del despliegue y la documentacion interna. Un serve
// de desarrollo no tiene por que publicarlos, y .git/config puede llevar
// credenciales si el remoto se clono con token en la URL. Cualquier punto
// inicial basta: una lista cerrada siempre se queda corta (.env, .nvmrc,
// .editorconfig...), y ninguno de ellos es un recurso que el sitio necesite.
const noServir = /^\./;
const noServirTambien = /^(?:Docs|CHANGELOG\.md|CONTRIBUTING\.md|SECURITY\.md|CODE_OF_CONDUCT\.md|vercel\.json|package\.json)(?:\/|$)/;

function resolveRequest(url) {
  let requested;
  try {
    // decodeURIComponent lanza URIError con un "%" malformado, y como esta
    // llamada vive fuera del try del manejador, una sola peticion asi tumbaba
    // el proceso entero. Aqui un escape significa 403.
    requested = decodeURIComponent(url.split("?")[0].split("#")[0]);
  } catch {
    return null;
  }
  const base = path.resolve(repositoryDirectory, `.${path.posix.sep}${requested}`);
  // Nunca dejar que una ruta salga de la raiz del repositorio. path.relative es
  // la comprobacion correcta: un startsWith sin separador final dejaria pasar
  // una carpeta vecina cuyo nombre empiece por el del repositorio.
  const relative = path.relative(repositoryDirectory, base);
  if (relative.startsWith("..") || path.isAbsolute(relative)) return null;
  const relativo = relative.split(path.sep).join("/");
  if (noServir.test(relativo) || noServirTambien.test(relativo)) return null;
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

// Devuelve la ruta que se va a servir (con index.html si era una carpeta) o
// undefined si no se puede servir. Dos comprobaciones, ninguna sobra:
//
//  1. lstat no sigue el enlace, asi que un enlace simbolico (o un junction, que
//     Node reporta tambien como enlace) se ve tal cual y se rechaza. Un PR podria
//     añadir uno apuntando a ~/.ssh/id_rsa: un stat normal lo seguia y lo
//     serviria con 200.
//  2. realpath resuelve los enlaces de los directorios padres, que la contencion
//     lexical de resolveRequest no ve: si "Web" fuera un enlace a /etc, la ruta
//     pedida seria legitima y aun asi saldria del repositorio.
//
// Un fichero que no existe lanza aqui (lstat) y el catch del manejador responde
// 404, igual que antes: denegar y no existir siguen siendo cosas distintas.
async function rutaServible(ruta) {
  let info = await lstat(ruta);
  if (info.isSymbolicLink()) return undefined;
  if (info.isDirectory()) {
    ruta = path.join(ruta, "index.html");
    info = await lstat(ruta);
    if (info.isSymbolicLink()) return undefined;
  }
  const real = await realpath(ruta);
  const dentro = real === repositoryRealDirectory || real.startsWith(`${repositoryRealDirectory}${path.sep}`);
  return dentro ? ruta : undefined;
}

const server = http.createServer(async (request, response) => {
  // Solo lectura: sin esto un POST a un HTML devolvia 200 con el fichero entero.
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { allow: "GET, HEAD" }).end("405");
    return;
  }
  let file = resolveRequest(request.url ?? "/");
  if (!file) {
    response.writeHead(403).end("403");
    return;
  }
  try {
    const servida = await rutaServible(file);
    if (!servida) {
      response.writeHead(403).end("403");
      return;
    }
    file = servida;
    const body = await readFile(file);
    const extension = path.extname(file).toLowerCase();
    const compressed = await compressBody(body, extension, request.headers["accept-encoding"]);
    // ETag debil sobre el contenido, como hace Vercel. Es lo que permite que
    // una revalidacion con max-age=0/max-age=60 responda 304 con la cabecera
    // sola en vez de repetir el fichero entero: en local se ve, pues, el mismo
    // "no baja nada" que en produccion, en vez de una falsa sensacion de que
    // nada se cachea. Es debil (W/) precisamente porque el mismo fichero se
    // sirve comprimido de dos maneras y con Vary: Accept-Encoding.
    const etag = `W/"${createHash("sha256").update(body).digest("hex").slice(0, 24)}"`;
    const headers = {
      "content-type": contentTypes[extension] ?? "application/octet-stream",
      "cache-control": cacheControlFor(request.url ?? "/"),
      etag,
      vary: "Accept-Encoding",
    };
    if (securityPolicy) headers["content-security-policy"] = securityPolicy;
    // 304: el cliente ya lo tiene y solo hay que confirmar que no ha cambiado.
    // Sin cuerpo, y con las cabeceras de cache para que actualice su fecha.
    if (request.headers["if-none-match"] === etag) {
      delete headers["content-type"];
      delete headers["content-encoding"];
      delete headers["content-length"];
      response.writeHead(304, headers);
      response.end();
      return;
    }
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

// Solo en la interfaz de bucle local. Sin host, Node escucha en "::", o sea en
// todas las interfaces: con el puerto publicado (Codespaces, contenedor, red
// domestica) cualquiera de la LAN podria leer el repositorio entero. Se hace
// un listen por familia (IPv4 127.0.0.1 y IPv6 ::1) para que `localhost`
// funcione tanto si el navegador resuelve primero a IPv6 como si va a IPv4.
// El primero en arrancar es IPv6, porque un listener huerfano de un proceso
// antiguo puede seguir ocupando 127.0.0.1 sin que ::1 este ocupada; si IPv4
// falla con EADDRINUSE se avisa y el servidor sigue siendo valido por IPv6.
function avisarSiListo() {
  return () => {
    if (!avisado) {
      avisado = true;
      console.log(`Sirviendo el repositorio en http://localhost:${port}/`);
      console.log(`La web esta en http://localhost:${port}/Web/`);
    }
  };
}
let avisado = false;
server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Aviso: no se escucho ${error.address}:${error.port} (puerto ocupado por otro proceso): ${error.message}`);
  } else {
    throw error;
  }
});
server.listen(port, "::1", avisarSiListo());
server.listen(port, "127.0.0.1", avisarSiListo());
