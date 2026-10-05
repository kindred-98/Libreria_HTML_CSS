// Genera los ZIPs redistribuibles, uno por componente, en el mismo path que
// espera cada demo: para los 119 de Davoker, los pone junto a su index.html
// (DavokerDiseñador/<categoria>/<efecto>/<efecto>.zip) porque davoker.html
// apunta a `miscelanea/glitch/glitch.zip` relativo. Para los 899 de los otros
// autores, los pone en Web/zips/<id>.zip, que es el path relativo al que el
// enlace del detalle acabaria apuntando despues de un ajuste en app.js. Por
// ahora, los unicos que las paginas existentes enlazan son los de davoker.
//
// Que hace por componente: para cada entrada de catalog.json marcada como
// redistribuible, crea el zip con los mismos archivos que `app.js` mete dentro
// del ZIP en el navegador, y con el `LICENSE` de la coleccion. Asi el repo
// publico puede dejar de distribuir los 119 ZIPs de Davoker versionados (sin
// la MIT) y reemplazarlos por ZIPs que siempre cumplen con la licencia.
//
//   node Web/scripts/build-zips.mjs
//
// En local es inocuo por seguridad (al estilo de WS audita). Con flag --force
// se regeneran todos. Se integra en vercel.json con `node Web/scripts/generate-catalog.mjs &&
// node Web/scripts/build-zips.mjs`, en ese orden: el catalogo es la entrada.
import { createWriteStream } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const webDirectory = path.resolve(scriptDirectory, "..");
const repositoryDirectory = path.resolve(webDirectory, "..");
const catalogFile = path.join(webDirectory, "data", "catalog.json");
const sourcesDirectory = path.join(webDirectory, "data", "sources");

const forzar = process.argv.includes("--force");
const enVercel = process.env.VERCEL === "1";

if (!forzar && !enVercel) {
  console.log("info: no hay nada que generar (solo en el despliegue, con VERCEL=1 o --force).");
  process.exit(0);
}

const catalog = JSON.parse(await readFile(catalogFile, "utf8"));

// La linea de copyright que la MIT exige conservar en cada copia (C-4): no se
// inventa un autor, se lee del LICENSE que ya viaja dentro del propio ZIP. Si
// ese fichero no trae ninguna linea que empiece por "copyright", no se anade
// nada y el ATTRIBUTION queda como antes.
function lineaCopyright(textoLicencia) {
  const coincidencia = textoLicencia.match(/^\s*(copyright[^\r\n]*)$/im);
  return coincidencia ? coincidencia[1].trim() : "";
}

// licenseFile viaja como nombre suelto ("LICENSE") y dentro del ZIP como
// <id>/LICENSE o <coleccion>/LICENSE: la entrada se reconoce por el sufijo.
function esLicenciaDe(archivePath, licenseFile) {
  if (!licenseFile) return false;
  return archivePath === licenseFile || archivePath.endsWith(`/${licenseFile}`);
}

// El escritor de ZIP minimo: cabecera local + directorio + archivo + CRC32.
// Se hace a mano y en streaming para no añadir dependencias de npm y no hacer
// `npm install` (el proyecto no usa dependencias, doc CONTRIBUTING.md:44).
const STORED = 0;
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  crcTable[n] = c >>> 0;
}
function crc32(bytes) {
  let c = 0xffffffff;
  for (const byte of bytes) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

class ZipWriter {
  constructor() {
    this.entries = [];
    this.offset = 0;
  }
  agregar(rutaInterna, datos) {
    const bytes = typeof datos === "string" ? new TextEncoder().encode(datos) : datos;
    const crc = crc32(bytes);
    const modificacion = new Date(0); // 1980-01-01: ZIP requiere <= 2038-01-18.
    const cabeceraLocal = Buffer.alloc(30 + rutaInterna.length);
    cabeceraLocal.writeUInt32LE(0x04034b50, 0);                 // firma
    cabeceraLocal.writeUInt16LE(20, 4);                         // version necesaria
    cabeceraLocal.writeUInt16LE(0, 6);                           // flags
    cabeceraLocal.writeUInt16LE(STORED, 8);                      // método (sin comprimir)
    cabeceraLocal.writeUInt16LE(((modificacion.getTime() / 1000) >> 0) & 0xffff, 10);
    cabeceraLocal.writeUInt16LE((((modificacion.getTime() / 1000) >> 0) >> 16) & 0xffff, 12);
    cabeceraLocal.writeUInt32LE(crc, 14);
    cabeceraLocal.writeUInt32LE(bytes.length, 18);                // tamano comprimido
    cabeceraLocal.writeUInt32LE(bytes.length, 22);                // tamano sin comprimir
    cabeceraLocal.writeUInt16LE(rutaInterna.length, 26);
    cabeceraLocal.writeUInt16LE(0, 28);                          // longitud extra
    cabeceraLocal.write(rutaInterna, 30);
    this.entries.push({ cabeceraLocal, crc, tamano: bytes.length, datos: bytes, modificacion });
  }
  bytes() {
    const entradas = this.entries;
    const central = [];
    let tamanoCentral = 0;
    for (const e of entradas) {
      const cabCentral = Buffer.alloc(46 + e.cabeceraLocal.length - 30);
      cabCentral.writeUInt32LE(0x02014b50, 0);                   // firma
      cabCentral.writeUInt16LE(20, 4);
      cabCentral.writeUInt16LE(20, 6);
      cabCentral.writeUInt16LE(0, 8);
      cabCentral.writeUInt16LE(STORED, 10);
      cabCentral.writeUInt16LE(((e.modificacion.getTime() / 1000) >> 0) & 0xffff, 12);
      cabCentral.writeUInt16LE((((e.modificacion.getTime() / 1000) >> 0) >> 16) & 0xffff, 14);
      cabCentral.writeUInt32LE(e.crc, 16);
      cabCentral.writeUInt32LE(e.tamano, 20);
      cabCentral.writeUInt32LE(e.tamano, 24);
      cabCentral.writeUInt16LE(e.cabeceraLocal.length - 30, 28);
      cabCentral.writeUInt16LE(0, 30);
      cabCentral.writeUInt16LE(0, 32);
      cabCentral.writeUInt16LE(0, 34);
      cabCentral.writeUInt16LE(0, 36);
      cabCentral.writeUInt32LE(0, 38);
      cabCentral.writeUInt32LE(this.offset, 42);
      e.cabeceraLocal.copy(cabCentral, 46, 30);
      central.push(cabCentral);
      tamanoCentral += cabCentral.length;
      e.offset = this.offset;
      this.offset += e.cabeceraLocal.length + e.tamano;
    }
    const fin = Buffer.alloc(22);
    fin.writeUInt32LE(0x06054b50, 0);
    fin.writeUInt16LE(0, 4);
    fin.writeUInt16LE(0, 6);
    fin.writeUInt16LE(entradas.length, 8);
    fin.writeUInt16LE(entradas.length, 10);
    fin.writeUInt32LE(tamanoCentral, 12);
    fin.writeUInt32LE(this.offset, 16);
    fin.writeUInt16LE(0, 20);
    const partes = [];
    for (const e of entradas) partes.push(e.cabeceraLocal, e.datos);
    partes.push(Buffer.concat(central), fin);
    return Buffer.concat(partes);
  }
}

// Determina la ruta de salida del zip para un componente: los de Davoker van
// junto a su index.html (DavokerDiseñador/<categoria>/<efecto>/<efecto>.zip),
// porque davoker.html enlaza relativo a su propia ubicacion. El resto no genera
// zip en disco: app.js (downloadComponentZip) los construye en el navegador con
// el LICENSE ya incluido, asi que no hace falta un zip paralelo. Generar uno
// para los 899 que no son de Davoker saturaria el working tree con 899
// ficheros no versionados que ademas no aportan nada.
function rutaSalidaZip(componente) {
  if (componente.root !== "DavokerDiseñador") return null;
  const preview = componente.preview ?? "";
  const root = componente.root;
  const base = path.join(repositoryDirectory, root);
  let relativa = preview
    .replace(/^\.\.\//, "")
    .replace(/^[^/]+\//, "")
    .replace(/\/index\.html$/, "");
  if (root && relativa && !relativa.startsWith("..")) {
    return path.join(base, relativa, `${path.basename(relativa)}.zip`);
  }
  return null;
}

await mkdir(path.join(webDirectory, "zips"), { recursive: true });
const catalogoReducido = { distributed: true, not_redistributable: 0 };
const verificadas = [];

for (const componente of catalog) {
  if (!componente.downloadable) {
    catalogoReducido.not_redistributable += 1;
    continue;
  }
  const destino = rutaSalidaZip(componente);
  if (!destino) continue; // Los que no son de Davoker los genera app.js en el navegador.
  const sourceFile = path.join(sourcesDirectory, `${componente.id}.json`);
  const sourceData = JSON.parse(await readFile(sourceFile, "utf8"));
  const archivos = [];
  for (const file of sourceData.files ?? []) {
    if (file.archivePath) archivos.push(file);
  }
  const zip = new ZipWriter();
  let copyright = "";
  for (const archivo of archivos) {
    const rutaRelativa = archivo.path.replace(/^\.\.\//, "");
    const rutaFisica = path.join(repositoryDirectory, rutaRelativa);
    const bytes = await readFile(rutaFisica);
    if (!copyright && esLicenciaDe(archivo.archivePath, sourceData.licenseFile)) {
      copyright = lineaCopyright(bytes.toString("utf8"));
    }
    zip.agregar(archivo.archivePath, bytes);
  }
  // Mismo contenido que downloadComponentZip() de app.js, el camino que usan la
  // ficha y los 899 que no son de davoker: los archivos del componente (un
  // componente solo es downloadable si files lleva su licenseFile, que
  // generate-catalog resuelve contra la raiz de la coleccion, y asi sale
  // LICENSE de davoker y no el de la raiz del repo), el ATTRIBUTION.txt y la
  // linea de copyright leida de ese LICENSE (C-4: el credito de autoria viaja
  // dentro del ZIP en vez de en 1 018 HTML).
  //
  // Antes se anadia ademas un LICENSE en la RAIZ del ZIP resuelto contra
  // repositoryDirectory: cada ZIP de davoker llevaba el de kindred-98 (2 237 B)
  // en vez del suyo (1 085 B), y salian distintos los dos caminos de descarga,
  // justo lo contrario de lo que promete el comentario de arriba.
  const atribucion = [
    `Fuente: ${sourceData.source ?? ""}`,
    `Licencia: ${sourceData.license ?? ""}`,
    `Archivo de licencia: ${sourceData.licenseFile ?? ""}`,
  ];
  if (copyright) atribucion.push(copyright);
  zip.agregar(`${componente.id}/ATTRIBUTION.txt`, [...atribucion, ""].join("\n"));
  const zipBytes = zip.bytes();
  await mkdir(path.dirname(destino), { recursive: true });
  await writeFile(destino, zipBytes);
  verificadas.push({ id: componente.id, ruta: destino, tamano: zipBytes.length });
  catalogoReducido.distributed += 1;
}

console.log(`Generados ${verificadas.length} ZIPs redistribuibles en DavokerDiseñador/<categoria>/<efecto>/`);
console.log(`(el catalogo tiene ${catalogoReducido.not_redistributable} componentes no redistribuibles que no se han generado)`);
const tamanoTotal = verificadas.reduce((acc, v) => acc + v.tamano, 0);
console.log(`Tamano total: ${tamanoTotal} bytes (~${Math.round(tamanoTotal / 1024)} KB)`);