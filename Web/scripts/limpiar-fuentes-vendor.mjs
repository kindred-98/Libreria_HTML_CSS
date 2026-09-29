/**
 * Quita de cada carpeta vendor/ los ficheros de fuente que el css de esa
 * carpeta no referencia. Google Fonts manda una hoja con un woff2 por cada
 * combinacion de idioma y peso, y el navegador solo descarga los que hacen
 * falta: Keeping the rest would add ~10 MB that nobody ever loads.
 */
import { readdir, readFile, unlink, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryDirectory = path.resolve(scriptDirectory, "../..");
const ROOTS = ["creaciones-primium", "CreacionesNuevas", "GevendraAutorExterno", "DavokerDiseñador"];

async function carpetasVendor(dir, out = []) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "vendor") out.push(full);
      else await carpetasVendor(full, out);
    }
  }
  return out;
}

const ESCRITURA = process.argv.includes("--escribir");
let borrados = 0;
let bytes = 0;

for (const raiz of ROOTS) {
  for (const vendor of await carpetasVendor(path.join(repositoryDirectory, raiz))) {
    // Todo el texto de los css de la carpeta: define lo que se usa.
    let texto = "";
    for (const e of await readdir(vendor, { withFileTypes: true })) {
      if (e.isFile() && e.name.endsWith(".css")) texto += await readFile(path.join(vendor, e.name), "utf8");
    }
    // El html y el css de la carpeta tambien pueden citar fuentes sueltas.
    const padre = path.dirname(vendor);
    for (const nombre of ["index.html", "style.css", "styles.css"]) {
      try {
        texto += await readFile(path.join(padre, nombre), "utf8");
      } catch {}
    }

    for (const e of await readdir(vendor, { withFileTypes: true })) {
      if (!e.isFile()) continue;
      const completo = path.join(vendor, e.name);
      if (e.name.endsWith(".css")) continue;
      const relativo = e.name.split(path.sep).join("/");
      if (texto.includes(relativo)) continue;

      // Los ficheros de la subcarpeta fuentes/ se citan como fuentes/x.woff2
      const comoFuente = `fuentes/${e.name}`;
      if (texto.includes(comoFuente)) continue;

      const s = await stat(completo);
      if (ESCRITURA) await unlink(completo);
      borrados += 1;
      bytes += s.size;
    }
  }
}

console.log(`fuentes sin usar: ${borrados} ficheros, ${(bytes / 1024 / 1024).toFixed(1)} MB${ESCRITURA ? " (borrados)" : " (dry-run)"}`);
if (!ESCRITURA) console.log("Para aplicar: node Web/scripts/limpiar-fuentes-vendor.mjs --escribir");
