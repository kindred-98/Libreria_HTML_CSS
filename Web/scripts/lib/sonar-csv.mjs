/**
 * Utilidades puras del export de SonarQube Cloud.
 *
 * Que hay aqui y por que existe:
 *
 * - `celda`, `csv`, `contar` y `tabla` viven aqui para que `../lib` no tenga
 *   efectos al importarse. El exportador es un script de nivel superior que
 *   habla con la red y escribe en `tmp/sonar/`: importarlo desde un test
 *   ejecutaria todo eso y, si faltara el token, haria `process.exit(1)` y se
 *   llevaria por delante al runner entero. Separando las funciones puras se
 *   puede probar el formato del CSV sin token, sin red y sin disco.
 *
 * - `sanearMensaje` es el fix del aviso S5145 (log injection). Un mensaje de
 *   error que venga de un servidor comprometido puede traer saltos de linea o
 *   caracteres de control: si se escribe tal cual en el log, alguien puede
 *   falsificar lineas como `ERROR`/`INFO` y dejar constancia de algo que no
 *   ocurrio. Aqui se colapsan CR, LF, TAB, VT, FF y NUL a un unico espacio y
 *   se trunca el resultado.
 *
 * Este modulo no importa nada de Node: se puede cargar en cualquier contexto.
 */

/**
 * Sanea un valor antes de escribirlo en el log.
 *
 * @param {unknown} valor Valor a sanear (soporta errores, cadenas, `null`).
 * @param {{max?: number}} [opciones] `max` es la longitud maxima en
 *   caracteres del resultado (200 por defecto).
 * @returns {string} Texto sin saltos de linea ni controles, truncado.
 */
export function sanearMensaje(valor, { max = 200 } = {}) {
  const texto = valor instanceof Error ? valor.message : String(valor ?? "");
  return texto.replace(/[\r\n\t\v\f\0]+/g, " ").slice(0, max);
}

/**
 * Convierte un valor en una celda de CSV.
 *
 * @param {unknown} valor Valor de la celda.
 * @returns {string} La celda entrecomillada si lleva `"`, salto de linea o `;`.
 */
export function celda(valor) {
  const texto = valor === null || valor === undefined ? "" : String(valor);
  return /["\n\r;]/.test(texto) ? `"${texto.replaceAll('"', '""')}"` : texto;
}

/**
 * Monta un CSV completo con cabecera y filas.
 *
 * @param {string[]} cabecerasCsv Nombres de las columnas.
 * @param {unknown[][]} filas Filas, ya alineadas con la cabecera.
 * @returns {string} El CSV terminado en salto de linea.
 */
export function csv(cabecerasCsv, filas) {
  return [cabecerasCsv.join(","), ...filas.map((fila) => fila.map(celda).join(","))].join("\n") + "\n";
}

/**
 * Cuenta cuantos elementos hay por valor de una propiedad.
 *
 * @param {Record<string, unknown>[]} objetos Elementos a agrupar.
 * @param {string} llave Propiedad por la que agrupar.
 * @returns {[unknown, number][]} Pares ordenados de mas a menos frecuentes.
 */
export function contar(objetos, llave) {
  const mapa = new Map();
  for (const objeto of objetos) {
    const valor = objeto[llave] ?? "(sin dato)";
    mapa.set(valor, (mapa.get(valor) ?? 0) + 1);
  }
  return [...mapa.entries()].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])));
}

/**
 * Pinta unos recuentos como tabla de markdown.
 *
 * @param {[unknown, number][]} recuentos Pares de `contar`.
 * @param {number} [limite] Maximo de filas (30 por defecto).
 * @returns {string} La tabla, o `_Sin datos._` si no hay nada.
 */
export function tabla(recuentos, limite = 30) {
  if (recuentos.length === 0) return "_Sin datos._\n";
  return recuentos
    .slice(0, limite)
    .map(([clave, total]) => `| ${clave} | ${total} |`)
    .join("\n");
}