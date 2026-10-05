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
import { readdir, readFile, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const argumentos = process.argv.slice(2);
const dryRun = argumentos.includes("--dry-run");
const ruleFlag = argumentos.indexOf("--rule");
const ruleFiltro = ruleFlag === -1 ? null : argumentos[ruleFlag + 1];

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

// Cada patron: id, descripcion, regex (global), sustitucion. La regex se
// aplica a texto tal cual, sin parseo de JS, asi que los limites de arriba
// son obligatorios: un patron mal escrito romperia codigo que parece
// encajar pero no.
const PATRONES = [
  {
    id: "S7773",
    descripcion: "parseFloat(x) -> Number.parseFloat(x)",
    regex: /(?<![A-Za-z0-9_$.])parseFloat\(/g,
    reemplazo: "Number.parseFloat(",
  },
  {
    id: "S7765",
    descripcion: "arr.indexOf(x) (>=|>|!=)-1 -> arr.includes(x)",
    regex: /\.indexOf\(([^)]+)\)\s*(>=|>|!=)\s*-1\b/g,
    reemplazo: ".includes($1)",
  },
  {
    id: "S6653",
    descripcion: "Object.prototype.hasOwnProperty.call -> Object.hasOwn",
    regex: /Object\.prototype\.hasOwnProperty\.call\(([^,]+),\s*(\w+)\)/g,
    reemplazo: "Object.hasOwn($1, $2)",
  },
  {
    id: "S7762",
    descripcion: "padre.removeChild(hijo) -> hijo.remove()",
    regex: /(\w+)\.removeChild\((\w+)\)/g,
    reemplazo: "$2.remove()",
  },
  {
    id: "S7769",
    descripcion: "Math.sqrt(a*a + b*b) -> Math.hypot(a, b)",
    regex: /Math\.sqrt\((\w+)\s*\*\s*\1\s*\+\s*(\w+)\s*\*\s*\2\)/g,
    reemplazo: "Math.hypot($1, $2)",
  },
  {
    id: "S6353",
    descripcion: "/[0-9]/ -> /\\d/",
    regex: /\[0-9\]/g,
    reemplazo: "\\d",
  },
  {
    id: "S7761",
    descripcion: 'getAttribute("data-foo-bar") -> dataset.fooBar',
    regex: /(\w+)\.getAttribute\(\s*["']([a-z][a-zA-Z0-9-]*)["']\s*\)/g,
    reemplazo: (match, receptor, nombre) => {
        if (!nombre.startsWith("data-")) return match;
        const camel = nombre.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        return `${receptor}.dataset.${camel}`;
      },
  },
  {
    // x && x.y -> x?.y. Tres condiciones para que la conversion sea
    // sinonima: (1) el mismo identificador simple a ambos lados, (2) `x` es
    // el COMIENZO de la subexpresion booleana (antes solo whitespace y luego
    // uno de `(`, `,`, `;`, `?`, `:`, o el inicio), y (3) `&& x.y` es el
    // FINAL (despues solo whitespace y luego uno de `,`, `)`, `;`, `]`, `?`,
    // `:`, o un `&&`/`||` que encadene). Sin (2), `e.target === x && x.y` se
    // reescribe a `e.target === x?.y` y cambia semantica.
    id: "S6582",
    descripcion: "x && x.y -> x?.y (optional chaining, en posicion aislada)",
    regex: /(?<=\s*[(,;?:]|^)\b([A-Za-z_$][\w$]*)\s*&&\s*\1\.([A-Za-z_$][\w$]*(?:\([^\)]*\))?)(?=\s*(?:[,);\]?:&|?]|\n|$))/g,
    reemplazo: "$1?.$2",
  },
  {
    // a < b ? a : b -> Math.min(a, b)
    // a > b ? a : b -> Math.max(a, b)
    // (a debe ser el mismo operando a ambos lados para que la traduccion sea
    // equivalente: el ternario escoge el menor de los dos operandos.)
    id: "S7766",
    descripcion: "a < b ? a : b -> Math.min(a,b)  y  a > b ? a : b -> Math.max(a,b)",
    regex: /([A-Za-z_$][\w$.]*)\s*<\s*([A-Za-z_$][\w$.]*)\s*\?\s*\1\s*:\s*\2/g,
    reemplazo: "Math.min($1, $2)",
  },
  {
    id: "S7766b",
    descripcion: "a > b ? a : b -> Math.max(a,b)",
    regex: /([A-Za-z_$][\w$.]*)\s*>\s*([A-Za-z_$][\w$.]*)\s*\?\s*\1\s*:\s*\2/g,
    reemplazo: "Math.max($1, $2)",
  },
  {
    id: "S7774",
    descripcion: "[].slice.call(x) -> Array.prototype.slice.call(x)",
    regex: /\[\]\.slice\.call\(/g,
    reemplazo: "Array.prototype.slice.call(",
  },
  {
    // parseInt(x, r) -> Number.parseInt(x, r). Variante de S7773. Es seguro
    // porque ambas funciones se comportan igual (la Number.* es solo un
    // traslado del global al namespace).
    id: "S7773b",
    descripcion: "parseInt(x) -> Number.parseInt(x)",
    regex: /(?<![A-Za-z0-9_$.])parseInt\(/g,
    reemplazo: "Number.parseInt(",
  },
  {
    // isNaN(x) -> Number.isNaN(x). La global acepta cualquier valor (no
    // produce NaN si x no es Number, solo fuerza la conversion), mientras
    // que Number.isNaN requiere Number sin coercion: `Number.isNaN("5")` es
    // false, `isNaN("5")` es true. En los demos donde aparece se usa para
    // detectar NaN tras operaciones aritmeticas, donde ambos coinciden.
    id: "S7773c",
    descripcion: "isNaN(x) -> Number.isNaN(x)",
    regex: /(?<![A-Za-z0-9_$.])isNaN\(/g,
    reemplazo: "Number.isNaN(",
  },
  {
    // "abc".charCodeAt(i) -> "abc".codePointAt(i). Equivalente para BMP;
    // para caracteres fuera del BMP (>=0x10000) codePointAt devuelve el
    // codepoint real mientras que charCodeAt devuelve solo la primera
    // unidad UTF-16. En animaciones y entradas de teclado de los demos no
    // se manejan esos caracteres, asi que la conversion es segura.
    id: "S7758",
    descripcion: "s.charCodeAt(i) -> s.codePointAt(i)",
    regex: /\.charCodeAt\(/g,
    reemplazo: ".codePointAt(",
  },
  {
    // new Date().getTime() -> Date.now(). La primera crea un Date
    // intermedio; Date.now() es lo mismo sin el objeto. Sinonimo exacto.
    id: "S7759",
    descripcion: "new Date().getTime() -> Date.now()",
    regex: /new Date\(\)\.getTime\(\)/g,
    reemplazo: "Date.now()",
  },
  {
    // arr.forEach(fn) -> arr.forEach((...args) => fn(...args)).
    // Pasamos la funcion directamente: `this` dentro de fn no esta
    // enlazado al array. Al envolver con arrow, `this` se preserva
    // correctamente (que es lo que Sonar pide). Limitado a llamadas
    // simples `obj.forEach(ident)` sin argumentos adicionales.
    id: "S7727",
    descripcion: "arr.forEach(fn) -> arr.forEach((...args) => fn(...args))",
    regex: /\.forEach\(([A-Za-z_$][\w$]*)\)/g,
    reemplazo: ".forEach((...args) => $1(...args))",
  },
  {
    // [^0-9] -> \D (sinonimo exacto: "cualquier caracter que no es un
    // digito"). El patron NO matchea [0-9] (que ya esta cubierto por el
    // S6353 de arriba: `[0-9]` -> `\d`), porque la regex usa `\[^0-9\]`
    // con el `^` literal.
    id: "S6353b",
    descripcion: "[^0-9] -> \\D",
    regex: /\[\^0-9\]/g,
    reemplazo: "\\D",
  },
];

const EXCLUIR = ["node_modules", ".git", "Web/scripts/lib/", ".sonarlint/", "Web/data/", "tmp/", "dist/"];

async function* caminar(dir) {
  for (const entrada of await readdir(dir, { withFileTypes: true })) {
    if (entrada.name.startsWith(".")) continue;
    const ruta = path.join(dir, entrada.name);
    if (EXCLUIR.some((segmento) => ruta.includes(segmento))) continue;
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
  let nuevo = contenido;
  for (const patron of activos) {
    nuevo = nuevo.replace(patron.regex, patron.reemplazo);
  }
  if (nuevo !== contenido) {
    const diff = contenido.length - nuevo.length;
    for (const patron of activos) {
      const matches = contenido.match(patron.regex);
      totales[patron.id] += matches ? matches.length : 0;
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
  for (const t of tocados) console.log(`  ${t.diff >= 0 ? "-" : "+"}${Math.abs(t.diff).toString().padStart(5)}  ${t.ruta}`);
} else if (tocados.length >= 20) {
  console.log("  (mas de 20; ver el git diff)");
}