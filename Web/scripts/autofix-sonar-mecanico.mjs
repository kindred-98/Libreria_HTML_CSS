/**
 * Auto-fix de los code smells mecanicos de SonarQube (Fase 2 de la limpieza).
 *
 * Por que existe: SonarCloud marca el mismo patron una y otra vez en cada
 * demo. Arreglarlos a mano es lento y este script solo toca conversiones
 * que son sinonimas: la salida del programa no cambia, solo la sintaxis.
 *
 * Que hace: aplica, por patron, una sustitucion mecanica. Cada patron
 * tiene una regla de SonarQube asignada y se aplica solo si se pasa
 * `--rule <id>` o si se llama sin argumento (entonces pasa por todas).
 *
 *   node Web/scripts/autofix-sonar-mecanico.mjs                  # aplica todos los patrones
 *   node Web/scripts/autofix-sonar-mecanico.mjs --dry-run        # no escribe, solo cuenta
 *   node Web/scripts/autofix-sonar-mecanico.mjs --rule S7761     # solo el patron de dataset
 *   node Web/scripts/autofix-sonar-mecanico.mjs --rule S7761 --dry-run
 *
 * Patrones cubiertos (todos son transformaciones sinonimas):
 *
 *   S7773  parseFloat(x)       -> Number.parseFloat(x)
 *   S7765  arr.indexOf(x)>-1   -> arr.includes(x)
 *   S6653  Object.prototype.hasOwnProperty.call(x,k) -> Object.hasOwn(x,k)
 *   S7762  padre.removeChild(x) -> x.remove()
 *   S7769  Math.sqrt(a*a+b*b)   -> Math.hypot(a,b)
 *   S6353  /[0-9]/             -> /\d/
 *   S7761  el.getAttribute("data-foo-bar") -> el.dataset.fooBar
 *
 * Limites:
 *
 * - El dataset NO toca atributos cuyo nombre no empieza por `data-`, ni
 *   nombres dinamicos (`getAttribute("data-" + k)`).
 * - El `indexOf(...)-1` se reescribe como `includes(...)` solo cuando la
 *   comparacion es exactamente `> -1`, `>= 0`, `> -0` o `!= -1`. No se
 *   mete en comparaciones de objetos.
 * - `Math.sqrt(a*a+b*b)` solo cuando son exactamente dos terminos y la
 *   operacion es la suma de dos cuadrados.
 * - NO toca `for (var i...) -> for-of` (S4138): es un refactor que
 *   cambia el cuerpo del bucle y no es sinonimo.
 *
 * Verificacion: despues de aplicarlo, `npm run validar:demos` tiene que
 * seguir en 1018/1018 demos, 0 fallos.
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { EXCLUIR, PATRONES, aplicarPatrones, contarPorPatron } from "./lib/autofix-patrones.mjs";

const argumentos = process.argv.slice(2);
const dryRun = argumentos.includes("--dry-run");
const ruleFlag = argumentos.indexOf("--rule");
const ruleFiltro = ruleFlag === -1 ? null : argumentos[ruleFlag + 1];

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

// Los patrones viven en ./lib/autofix-patrones.mjs: son datos puros y, al
// separarlos, se pueden probar sin recorrer el repo ni escribir nada. Ver la
// cabecera de ese modulo.

async function* caminar(dir) {
  for (const entrada of await readdir(dir, { withFileTypes: true })) {
    if (entrada.name.startsWith(".")) continue;
    const ruta = path.join(dir, entrada.name);
    // La comparacion va sobre la ruta con barras: en Windows `path.join`
    // devuelve backslashes y un `includes("Web/scripts/lib/")` no casaria
    // nunca, con lo que este propio modulo se autoeditaba.
    const normalizada = ruta.replace(/\\/g, "/");
    if (EXCLUIR.some((segmento) => normalizada.includes(segmento))) continue;
    if (entrada.isDirectory()) {
      yield* caminar(ruta);
    } else if (/\.(js|mjs)$/.test(entrada.name)) {
      yield ruta;
    }
  }
}

const activos = ruleFiltro ? PATRONES.filter((p) => p.id === ruleFiltro) : PATRONES;
if (ruleFiltro && activos.length === 0) {
  console.error(`regla desconocida: ${ruleFiltro}. disponibles: ${PATRONES.map((p) => p.id).join(", ")}`);
  process.exit(1);
}

const totales = Object.fromEntries(activos.map((p) => [p.id, 0]));
const tocados = [];

for await (const ruta of caminar(RAIZ)) {
  // El propio script contiene los patrones en su fuente (en los strings de
  // descripcion y en las regex), asi que se autoeditariamos si nos
  // procesamos: exclusion explicita por nombre.
  if (ruta.endsWith("autofix-sonar-mecanico.mjs")) continue;
  // Mismo motivo con el catalogo generado: Web/data/ ya esta en EXCLUIR,
  // pero por si cuela algun derivado, mejor una segunda linea.
  if (ruta.includes(`${path.sep}Web${path.sep}data${path.sep}`)) continue;
  const contenido = await readFile(ruta, "utf8");
  const nuevo = aplicarPatrones(contenido, activos);
  if (nuevo !== contenido) {
    const diff = contenido.length - nuevo.length;
    // Se cuenta sobre el contenido ORIGINAL, nunca sobre el ya transformado.
    const encontrados = contarPorPatron(contenido, activos);
    for (const patron of activos) {
      totales[patron.id] += encontrados[patron.id];
    }
    tocados.push({ ruta: relativeFromRepo(ruta), diff });
    if (!dryRun) await writeFile(ruta, nuevo, "utf8");
  }
}

function relativeFromRepo(ruta) {
  return path.relative(RAIZ, ruta).replace(/\\/g, "/");
}

console.log(dryRun ? "(dry run, no escribe)" : "(escritura aplicada)");
for (const patron of activos) {
  console.log(`  ${patron.id}  ${totales[patron.id].toString().padStart(4)}  ${patron.descripcion}`);
}
console.log(`\n${tocados.length} ficheros tocados`);
if (tocados.length > 0 && tocados.length < 20) {
  for (const t of tocados)
    console.log(`  ${t.diff >= 0 ? "-" : "+"}${Math.abs(t.diff).toString().padStart(5)}  ${t.ruta}`);
} else if (tocados.length >= 20) {
  console.log("  (mas de 20; ver el git diff)");
}
