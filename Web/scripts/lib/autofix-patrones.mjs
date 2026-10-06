/**
 * Los patrones de auto-fix de los code smells mecanicos de SonarQube.
 *
 * Que hay aqui y por que:
 *
 * - Los patrones viven en un modulo sin dependencias (ni Node, ni fs) para
 *   poder testearlos sin disco. El script que los aplica
 *   (`../autofix-sonar-mecanico.mjs`) recorre el repo entero y escribe
 *   ficheros, asi que no se puede importar desde un test.
 *
 * - Cada patron lleva la regla de SonarQube asignada en `id` y SIEMPRE tiene
 *   la regex con bandera `g`. Se aplican en cascada y EN ORDEN sobre el mismo
 *   texto: el orden importa (por ejemplo S6353 `[0-9]` -> `\d` tiene que ir
 *   antes que S6397 `[\d]` -> `\d`).
 *
 * - IMPORTANTE al escribir tests: como todas las regex son globales, se
 *   puede reutilizar el mismo objeto `RegExp` entre llamadas (`replace` y
 *   `String.match` resetean `lastIndex`). Usarlas con `.test()` NO seria
 *   seguro por el estado interno de `lastIndex`.
 *
 * - S1940 (invertir operandos en comparaciones) NO esta aqui a proposito: se
 *   intento y rompio 5 demos, porque `a > b` -> `b < a` cambia la semantica
 *   cuando uno de los operandos es string y hay coercion implicita. Ver la
 *   nota de CHANGELOG.
 *
 * Este modulo no importa nada de Node: se puede cargar en cualquier contexto.
 */

// Cada patron: id, descripcion, regex (global), sustitucion. La regex se
// aplica a texto tal cual, sin parseo de JS, asi que los limites de cada uno
// son obligatorios: un patron mal escrito romperia codigo que parece encajar
// pero no.
/**
 * @typedef {{id: string, descripcion: string, regex: RegExp, reemplazo: string|Function}} Patron
 */

/** @type {Patron[]} */
export const PATRONES = [
  {
    id: "S7773",
    descripcion: "parseFloat(x) -> Number.parseFloat(x)",
    regex: /(?<![A-Za-z0-9_$.])parseFloat\(/g,
    reemplazo: "Number.parseFloat(",
  },
  {
    // Solo se reescribe lo que significa exactamente "esta presente":
    //   > -1, >= -1, != -1   (distinto de "no encontrado")
    //   >= 0                 (posicion mayor o igual que cero)
    // OJO con lo que NO entra, porque NO es lo mismo:
    //   != 0   significa "no esta en la posicion 0", no "esta presente"
    //   > 0    significa "esta mas alla de la posicion 0"
    //   > -0   en JS es lo mismo que > 0
    // Convertir cualquiera de esos a includes cambiaria el resultado.
    id: "S7765",
    descripcion: "arr.indexOf(x) (>|-1, >=, !=) -> arr.includes(x)",
    regex: /\.indexOf\(([^)]+)\)\s*(?:(?:>=|>|!=)\s*-1\b|>=\s*0\b)/g,
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
    regex:
      // Dentro de una clase de caracteres, `)` y `]` no necesitan barra:
      // solo `]`, `^` (al inicio) y `\` tienen que escaparse. El motor los
      // aceptaba escapados, pero es ruido que Sonar marca (S6535).
      /(?<=\s*[(,;?:]|^)\b([A-Za-z_$][\w$]*)\s*&&\s*\1\.([A-Za-z_$][\w$]*(?:\([^)]*\))?)(?=\s*(?:[,)\]?:&|]|\n|$))/g,
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
    // isFinite(x) -> Number.isFinite(x). La global acepta cualquier valor
    // y fuerza conversion a numero, igual que isNaN; Number.isFinite hace
    // lo mismo sin la coercion implicita. En los demos donde aparece,
    // el argumento ya es numerico, asi que la conversion es sinonima.
    id: "S7773-isfinite",
    descripcion: "isFinite(x) -> Number.isFinite(x)",
    regex: /(?<![A-Za-z0-9_$.])isFinite\(/g,
    reemplazo: "Number.isFinite(",
  },
  {
    // s.indexOf("x") === 0 -> s.startsWith("x"). Sinonimo exacto: la
    // global busca la primera ocurrencia y compara con 0, startsWith
    // busca desde el principio. Solo aplica al caso "=== 0" (prefijo).
    id: "S6557",
    descripcion: 's.indexOf("x") === 0 -> s.startsWith("x")',
    regex: /\.indexOf\((["'])([^"']+)\1\)\s*===\s*0\b/g,
    reemplazo: ".startsWith('$2')",
  },
  {
    // new Date(x).getTime() -> x.getTime(). Si x ya es un Date, envolver
    // en `new Date()` es redundante: crea un objeto identico al
    // argumento. Solo aplica cuando el argumento es un valor Date, lo
    // cual es el caso comun.
    id: "S7719",
    descripcion: "new Date(x).getTime() -> x.getTime()",
    regex: /new Date\((\w+)\)\.getTime\(\)/g,
    reemplazo: "$1.getTime()",
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
  {
    // arr.filter(p)[0] -> arr.find(p). Equivalente en el caso comun:
    // ambos devuelven el primer elemento que cumple `p` o undefined si
    // ninguno. `find` evita crear el array intermedio. Es seguro porque
    // `.filter` solo existe en Arrays, no en NodeList, asi que el codigo
    // original no podia estar operando sobre un NodeList.
    id: "S7750",
    descripcion: "arr.filter(p)[0] -> arr.find(p)",
    regex: /\.filter\(([^)]+)\)\[0\]/g,
    reemplazo: ".find($1)",
  },
  {
    // s.replace("x", y) -> s.replaceAll("x", y). Solo cuando el primer
    // argumento es un string literal (entre comillas), NO una regex
    // (entre slashes). Para las regex hay que mantener la `/regex/g` con
    // la bandera `g`. Tambien exige que el primer argumento NO tenga la
    // bandera `g` (si la tiene, es una regex y se ignora).
    id: "S7781",
    descripcion: "s.replace('x', y) -> s.replaceAll('x', y)  (solo string literal)",
    regex: /(\w+)\.replace\((["'])([^"']+)\2,\s*([^)]+)\)/g,
    reemplazo: "$1.replaceAll('$3', $4)",
  },
  {
    // [\d] -> \d, [\s] -> \s, [\w] -> \w, [\D] -> \D, etc. Solo se
    // reescriben las clases de caracteres que envuelven un escape
    // abreviado: son sinonimas exactas. Las clases como [a-z] o [abc]
    // se quedan como estan. Tambien acepta un cuantificador opcional:
    // [\d]{6} -> \d{6}.
    id: "S6397",
    descripcion: "[\\d] -> \\d  (clase con un solo escape abreviado)",
    regex: /\[(\\[dswDSW])(?:\{[^}]*\})?\]/g,
    reemplazo: "$1",
  },
  {
    // mq.addListener(cb) -> mq.addEventListener('change', cb).
    // MediaQueryList.addListener es un alias deprecated de
    // addEventListener('change', ...).
    id: "S1874-mql",
    descripcion: "mq.addListener(cb) -> mq.addEventListener('change', cb)",
    regex: /(\w+)\.addListener\(([^)]+)\)/g,
    reemplazo: "$1.addEventListener('change', $2)",
  },
  // NOTA: S7755 (`arr[arr.length - N]` -> `arr.at(-N)`) no se aplica
  // automaticamente porque rompe codigo que usa NodeList o HTMLCollection
  // (la conversion `.at(-N)` falla en esos casos, pero `[length - N]`
  // funciona por el indexado de array-like). Si se quiere abordar, hay
  // que filtrar primero por el tipo del receptor, que no es viable solo
  // con regex.
];

/** Rutas que el autofix nunca recorre. */
export const EXCLUIR = [
  "node_modules",
  ".git",
  "Web/scripts/lib/",
  "Web/scripts/__tests__/",
  ".sonarlint/",
  "Web/data/",
  "tmp/",
  "dist/",
];

/**
 * Aplica los patrones en cascada sobre un texto.
 *
 * @param {string} texto Texto de partida.
 * @param {Patron[]} [patrones]
 *   Lista de patrones (por defecto todos), en el orden en que se aplican.
 * @returns {string} El texto con todos los patrones aplicados.
 */
export function aplicarPatrones(texto, patrones = PATRONES) {
  let salida = texto;
  for (const patron of patrones) {
    // El tipado de `replace` no acepta la union `string | Function` en una
    // sola llamada, pero los dos son reemplazos validos de `String.replace`.
    salida = salida.replace(patron.regex, /** @type {any} */ (patron.reemplazo));
  }
  return salida;
}

/**
 * Cuenta las coincidencias de cada patrón en un texto.
 *
 * Cuenta siempre sobre el texto ORIGINAL, nunca sobre el ya transformado: si
 * no, un patron que genera la entrada de otro se contaria dos veces.
 *
 * @param {string} texto Texto a analizar.
 * @param {Patron[]} [patrones] Lista de patrones.
 * @returns {Record<string, number>} Objeto id -> numero de coincidencias.
 */
export function contarPorPatron(texto, patrones = PATRONES) {
  /** @type {Record<string, number>} */
  const totales = {};
  for (const patron of patrones) {
    const matches = texto.match(patron.regex);
    totales[patron.id] = matches ? matches.length : 0;
  }
  return totales;
}
