/**
 * Lanza los tests de una carpeta pasándoselos a `node --test` uno a uno.
 *
 * Por qué existe un runner en vez de un glob directo en el `npm test`:
 *
 * - `node --test "Web/scripts/__tests__/*.test.mjs"` funciona desde Node 21,
 *   porque Node ahi acepta globs. En Node 20 (que este repositorio sigue
 *   soportando, y con el que corre uno de los tres jobs del CI) NO existe
 *   soporte de globs: recibe la cadena tal cual, la toma por un nombre de
 *   fichero y falla con `Could not find '.../*.test.mjs'`.
 * - Un directorio como argumento tampoco vale igual en Windows y en Linux.
 *
 * Asi que la expansion de la lista la hace este fichero, con `fs`, que se
 * comporta igual en cualquier sistema y en cualquier version de Node.
 *
 *   node Web/scripts/test.mjs            # los tests unitarios
 *   node Web/scripts/test.mjs e2e        # los de extremo a extremo
 */
import { readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));

/** Subcarpeta que se ejecuta: `__tests__` por defecto, `e2e` si se pide. */
const carpeta = process.argv[2] ?? "__tests__";

const directorio = path.join(scriptDirectory, carpeta);

let nombres;
try {
  nombres = readdirSync(directorio);
} catch (error) {
  console.error(`No se encuentra la carpeta de tests: ${directorio}`);
  console.error(`  ${error.message}`);
  process.exit(1);
}

const ficheros = nombres.filter((nombre) => nombre.endsWith(".test.mjs")).sort();

if (ficheros.length === 0) {
  console.error(`No hay ficheros *.test.mjs en ${directorio}`);
  process.exit(1);
}

console.log(`Ejecutando ${ficheros.length} fichero(s) de ${carpeta}:`);
for (const nombre of ficheros) console.log(`  ${nombre}`);

// `stdio: inherit` deja que el runner de tests de Node escriba directamente: su
// salida (TAP, los ✔ y ✖ y el resumen) se ve igual que si se hubiera llamado
// directo. Se pasa `shell: false` a proposito: en Windows `npx`/`npm` serian
// `.cmd` y con shell:true saltaria el aviso de Node de inyeccion de argumentos.
const resultado = spawnSync(
  process.execPath,
  ["--test", ...ficheros.map((nombre) => path.join(directorio, nombre))],
  { stdio: "inherit", cwd: path.resolve(scriptDirectory, "..", "..") },
);

if (resultado.error) {
  console.error(resultado.error.message);
  process.exit(1);
}

process.exit(resultado.status ?? 1);
