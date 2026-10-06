/**
 * Busca demos duplicados dentro del catalogo (Fase 7.2).
 *
 * Por que existe: la biblioteca crecio por incorporacion y nadie ha mirado si
 * dos carpetas acaban conteniendo lo mismo. Un duplicado no rompe nada, pero
 * multiplica el coste de mantener una demo, y si se corrige una y no la otra,
 * la version antigua sigue publicada sin que se note.
 *
 * Que hace: por cada demo normaliza su HTML, su CSS y su JavaScript (sin
 * comentarios y sin espacios) y calcula dos cosas:
 *
 *   1. Un hash SHA-256 de esa version normalizada. Dos demos con el mismo hash
 *      son el mismo contenido, letra por letra.
 *   2. Una similitud por tokens de 0 a 1 con cada otra demo. Se usa la
 *      distancia de Jaccard sobre el conjunto de tokens, y se ignoran los
 *      tokens que aparecen en mas de la mitad de los demos, que son el
 *      esqueleto comun (doctype, <html>, <head>, <script>) y solo ensucian el
 *      calculo.
 *
 *   node Web/scripts/detectar-duplicados.mjs
 *   npm run duplicados
 *
 * **Solo informe: nunca sale con codigo distinto de 0 y no borra nada.** Es
 * una herramienta para leer, no una comprobacion para el CI.
 */
import { createHash } from "node:crypto";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryDirectory = path.resolve(scriptDirectory, "../..");

const RAICES = ["creaciones-primium", "CreacionesNuevas", "DavokerDiseñador"];
const UMBRAL = 0.9;

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

function quitarComentarios(contenido, tipo) {
  let limpio = contenido;
  if (tipo === "html" || tipo === "css") limpio = limpio.replace(/\/\*[\s\S]*?\*\//g, "");
  if (tipo === "html") {
    // En bucle: un solo replace deja `<!--` suelto cuando hay comentarios
    // anidados o pegados, y eso es lo que marca CodeQL.
    let anterior;
    do {
      anterior = limpio;
      limpio = limpio.replace(/<!--[\s\S]*?-->/g, "");
    } while (limpio !== anterior);
  }
  if (tipo === "js") {
    // Los `//` de `https://` no son comentarios: se salta cualquier barra
    // precedida de dos puntos o de otra barra.
    limpio = limpio.replace(/(^|[^:/])\/\/[^\n]*/gm, "$1");
    limpio = limpio.replace(/\/\*[\s\S]*?\*\//g, "");
  }
  return limpio;
}

function normalizar(ficheros) {
  return ficheros
    .map(({ tipo, contenido }) => quitarComentarios(contenido, tipo))
    .join("\n")
    .replace(/\s+/g, "");
}

function tokenizar(normalizado) {
  return new Set(normalizado.match(/[A-Za-z0-9_$]+/g) ?? []);
}

const demos = [];
for (const raiz of RAICES) {
  const raizAbsoluta = path.join(repositoryDirectory, raiz);
  if (!(await stat(raizAbsoluta).catch(() => null))) continue;
  for (const indexAbsoluto of await buscarDemos(raizAbsoluta)) {
    const carpeta = path.dirname(indexAbsoluto);
    const ficheros = [{ tipo: "html", contenido: await readFile(indexAbsoluto, "utf8") }];
    for (const entrada of await readdir(carpeta, { withFileTypes: true })) {
      if (!entrada.isFile()) continue;
      const extension = path.extname(entrada.name).toLowerCase();
      if (extension !== ".css" && extension !== ".js") continue;
      ficheros.push({
        tipo: extension.slice(1),
        contenido: await readFile(path.join(carpeta, entrada.name), "utf8"),
      });
    }
    const normalizado = normalizar(ficheros);
    demos.push({
      id: path.relative(repositoryDirectory, carpeta).split(path.sep).join("/"),
      hash: createHash("sha256").update(normalizado).digest("hex"),
      tokens: tokenizar(normalizado),
      longitud: normalizado.length,
    });
  }
}

demos.sort((a, b) => a.id.localeCompare(b.id));

// Los tokens que aparecen en mas de la mitad de los demos son el esqueleto
// comun: no distinguen a nadie y encima hacen que todo parezca parecido.
const frecuencia = new Map();
for (const demo of demos) {
  for (const token of demo.tokens) frecuencia.set(token, (frecuencia.get(token) ?? 0) + 1);
}
const limite = Math.floor(demos.length / 2);
for (const demo of demos) {
  for (const token of [...demo.tokens]) {
    if ((frecuencia.get(token) ?? 0) > limite) demo.tokens.delete(token);
  }
}

const porHash = new Map();
for (const demo of demos) {
  if (!porHash.has(demo.hash)) porHash.set(demo.hash, []);
  porHash.get(demo.hash).push(demo.id);
}
const identicos = [...porHash.values()].filter((grupo) => grupo.length > 1);

const pares = [];
const cercanos = [];
for (let i = 0; i < demos.length; i += 1) {
  for (let j = i + 1; j < demos.length; j += 1) {
    const a = demos[i];
    const b = demos[j];
    if (a.hash === b.hash) continue;
    // Jaccard = interseccion / union. Si uno tiene mas de cinco veces los
    // tokens del otro no llega ni de lejos a 0,9 y se descarta sin mirar.
    const pequeno = a.tokens.size <= b.tokens.size ? a : b;
    const grande = a.tokens.size <= b.tokens.size ? b : a;
    if (grande.tokens.size > 5 * pequeno.tokens.size) continue;
    if (grande.tokens.size + pequeno.tokens.size === 0) continue;

    let interseccion = 0;
    for (const token of pequeno.tokens) if (grande.tokens.has(token)) interseccion += 1;
    const union = pequeno.tokens.size + grande.tokens.size - interseccion;
    const similitud = union ? interseccion / union : 0;
    if (similitud >= UMBRAL) pares.push({ a: a.id, b: b.id, similitud });
    else if (similitud >= 0.7) cercanos.push({ a: a.id, b: b.id, similitud });
  }
}
pares.sort((x, y) => y.similitud - x.similitud || x.a.localeCompare(y.a));
cercanos.sort((x, y) => y.similitud - x.similitud || x.a.localeCompare(y.a));

console.log(`=== Duplicados (solo informe) ===`);
console.log(`${demos.length} demos recorridos`);
console.log(`normalizacion: comentarios y espacios fuera de html, css y js`);
console.log(`tokens ignorados: los presentes en mas de ${limite} demos (esqueleto comun)\n`);

console.log(`Contenido identico (mismo SHA-256): ${identicos.length} grupo(s)`);
for (const grupo of identicos) {
  console.log(`  ${grupo[0].slice(0, 12)}  ${grupo.join(" ~ ")}`);
}

console.log(`\nPares con similitud >= ${UMBRAL.toFixed(2)}: ${pares.length}`);
for (const par of pares) {
  console.log(`  ${par.similitud.toFixed(3)}  ${par.a} ~ ${par.b}`);
}

console.log(`\nMas parecidos por debajo del umbral (informativo, no se cuentan):`);
const masParecidos = [...pares, ...cercanos].sort((x, y) => y.similitud - x.similitud).slice(0, 12);
if (!masParecidos.length) console.log(`  (ningun par llega ni a 0,70)`);
for (const par of masParecidos) {
  console.log(`  ${par.similitud.toFixed(3)}  ${par.a} ~ ${par.b}`);
}

if (!identicos.length && !pares.length) {
  console.log(`\nNo se ha encontrado ningun duplicado por encima del umbral.`);
}

console.log(`\nInforme: no se ha borrado ni modificado nada.`);
process.exit(0);
