/**
 * Detecta saltos de nivel de encabezado en los demos (h1 que va seguido de h3).
 *
 * Por que existe: el orden de encabezados es lo que un lector de pantalla usa
 * para ofrecer un indice de la pagina. Si de h1 se salta a h3, el lector anuncia
 * un h2 que no existe y la estructura deja de reflejar lo que se ve. Es uno de
 * los fallos que no se notan mirando la pantalla: se notan intentando navegar
 * sin ella.
 *
 * Que hace: recorre el `index.html` de cada demo de las tres carpetas, saca los
 * encabezados en orden y anota todo nivel que sube de mas de uno. Al final
 * lista los ids afectados y sale con codigo 1 si hay alguno, para poder
 * encadenarlo en CI.
 *
 *   node Web/scripts/validar-encabezados.mjs
 *   npm run validar:encabezados
 *
 * No mira el CSS ni el JavaScript del demo: los selectores `h3` que pueda haber
 * importan a la hora de corregir (hay que tocarlos para que el aspecto no
 * cambie), pero aqui solo se mide la estructura del HTML.
 */
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryDirectory = path.resolve(scriptDirectory, "../..");

// Las mismas tres carpetas que recorre `generate-catalog.mjs` y `validate.mjs`.
const RAICES = ["creaciones-primium", "CreacionesNuevas", "DavokerDiseñador"];

const fallos = [];
let recorridos = 0;
let conEncabezados = 0;

async function buscarPaginas(directorio) {
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
    if (entrada.isDirectory()) paginas.push(...(await buscarPaginas(ruta)));
    else if (entrada.isFile() && entrada.name.toLowerCase() === "index.html") paginas.push(ruta);
  }
  return paginas;
}

for (const raiz of RAICES) {
  const raizAbsoluta = path.join(repositoryDirectory, raiz);
  if (!(await stat(raizAbsoluta).catch(() => null))) continue;

  for (const absolute of await buscarPaginas(raizAbsoluta)) {
    recorridos += 1;
    const html = await readFile(absolute, "utf8");

    // Los comentarios se quitan antes de leer: un `<!-- <h3> -->` de muestra no
    // es un encabezado, y contarlos daria un falso positivo que nadie sabria
    // por que aparecia.
    const limpio = html.replace(/<!--[\s\S]*?-->/g, "");
    const niveles = [...limpio.matchAll(/<h([1-6])\b/g)].map((m) => Number(m[1]));
    if (!niveles.length) continue;
    conEncabezados += 1;

    const saltos = [];
    let anterior = 0;
    let posicion = 0;
    for (const nivel of niveles) {
      posicion += 1;
      if (anterior && nivel > anterior + 1) saltos.push(`h${anterior}->h${nivel} (encabezado ${posicion})`);
      anterior = nivel;
    }
    if (saltos.length) {
      const id = path.relative(repositoryDirectory, absolute).split(path.sep).join("/");
      fallos.push(`${id.replace("/index.html", "")}: ${saltos.join(", ")}`);
    }
  }
}

console.log(`info  ${recorridos} index.html recorridos, ${conEncabezados} con encabezados`);

if (fallos.length) {
  console.error(`\n${fallos.length} demo(s) suben de nivel de mas de un salto:\n`);
  for (const fallo of fallos) console.error(`  x ${fallo}`);
  console.error(`\nCambia el encabezado que salta al nivel intermedio (h1 -> h3 pasa a h1 -> h2)`);
  console.error(`y revisa los selectores del CSS que usen el nivel antiguo, para que el aspecto`);
  console.error(`no cambie.`);
  process.exit(1);
}

console.log(`\nNingun demo salta de nivel en sus encabezados.`);
