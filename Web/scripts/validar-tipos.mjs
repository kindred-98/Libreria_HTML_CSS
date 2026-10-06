/**
 * Puerta de entrada del typecheck.
 *
 * `tsc --checkJs` sobre `Web/scripts/**` (los scripts de Node) encuentra 38
 * errores de tipado hoy, todos en codigo que ya funcionaba. Ponerlos a cero
 * de golpe seria un PR de tipos Giant que mezclaria con lo que se esta
 * tocando en cada commit, asi que en vez de eso esto fija un presupuesto:
 *
 * - Los modulos de `Web/scripts/lib/` y los tests deben estar SIEMPRE limpios.
 *   Son codigo nuevo: no entra con deuda.
 * - El total no puede crecer respecto a la linea base. Cada error arreglado
 *   baja el presupuesto, asi que la deuda solo puede reducirse.
 *
 * Cuando el total llegue a 0, este script se puede borrar y en el CI basta con
 * `npm run typecheck`.
 *
 *   npm run typecheck
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Numero maximo de errores de tipado tolerados en todo `Web/scripts`.
 * Bajar este numero es trabajo accepted de la Fase 0; subirlo, no.
 */
const PRESUPUESTO_TOTAL = 38;

/** Rutas que tienen que estar a cero errores, sin margen. */
const SIN_DEUDA = [/Web[\\/]scripts[\\/]lib[\\/]/, /Web[\\/]scripts[\\/]__tests__[\\/]/];

// Se invoca el compilador por su ruta dentro de node_modules y sin `shell`:
// en Windows `npx` es un `.cmd`, y pasarle argumentos con shell:true activa
// el aviso DEP0190 y abre una superficie de inyeccion de argumentos.
const compilador = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "node_modules",
  "typescript",
  "bin",
  "tsc",
);

const tsc = spawnSync(process.execPath, [compilador, "--noEmit", "--pretty", "false"], {
  encoding: "utf8",
});

const salida = `${tsc.stdout ?? ""}${tsc.stderr ?? ""}`;
const lineas = salida.split("\n").filter((linea) => linea.includes("error TS"));
const total = lineas.length;

if (total === 0) {
  console.log("typecheck: 0 errores de tipado.");
  process.exit(0);
}

const conDeuda = lineas.filter((linea) => SIN_DEUDA.some((patron) => patron.test(linea)));
if (conDeuda.length > 0) {
  console.error(`typecheck: ${conDeuda.length} error(es) en modulos que deben estar limpios:`);
  for (const linea of conDeuda) console.error("  " + linea);
  process.exit(1);
}

if (total > PRESUPUESTO_TOTAL) {
  console.error(`typecheck: ${total} errores de tipado, por encima del presupuesto de ${PRESUPUESTO_TOTAL}.`);
  console.error("El presupuesto solo puede bajar, no subir.");
  process.exit(1);
}

console.log(
  `typecheck: ${total} errores en codigo heredado (presupuesto ${PRESUPUESTO_TOTAL}); ` +
    `lib/ y __tests__/ limpios.`,
);
