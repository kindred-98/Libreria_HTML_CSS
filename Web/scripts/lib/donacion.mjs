/**
 * Utilidades puras de la comprobacion de la direccion de donacion.
 *
 * Que hay aqui y por que existe:
 *
 * - `leerDireccion` valida la fuente unica (`Web/data/donacion.json`) y
 *   devuelve la direccion ya comprobada. Sin esta funcion cada script
 *   confiaria en el JSON tal cual, y un JSON a medias (sin campo, con la
 *   direccion cortada) produciria comprobaciones que pasan sin mirar nada.
 *
 * - `direccionesEn` extrae todas las direcciones EVM del texto con formato
 *   `0x` + 40 hex. Un patron global compartido a mano entre scripts es como
 *   se acabo duplicando la direccion en cinco ficheros: el dia que se cambie
 *   el formato, un script se entera y el otro no.
 *
 * - `direccionesAjenas` es el corazon de la regla "una sola direccion": si el
 *   texto contiene alguna que no es la esperada, devuelve cualquiera que sea.
 *   El motivo es que el pie de pagina es lo mas valioso para un atacante con
 *   acceso de escritura al repo: una sola letra cambiada desvia los
 *   donativos a otra cartera y nadie lo nota al mirar la pagina.
 *
 * - `contieneEsperada` comprueba la presencia en las paginas que deben
 *   mostrarla: sin esto, borrar la direccion del pie pasaria todas las
 *   demas comprobaciones.
 *
 * Este modulo no importa nada de Node: se puede cargar en cualquier contexto
 * y probar sin disco ni red.
 */

/** Patron de una direccion EVM completa: 0x seguido de 40 hexadecimal. */
const patronDireccion = /0x[a-fA-F0-9]{40}/g;

/**
 * Lee y valida la fuente unica de la direccion de donacion.
 *
 * @param {string} json Texto completo del JSON de donacion.
 * @returns {string} La direccion, con su formato comprobado.
 * @throws {Error} Si el JSON no se parsea, no tiene `direccion` o no tiene
 *   el formato `0x` + 40 hexadecimal.
 *
 * El formato se comprueba aqui y no en quien llama porque una direccion mal
 * escrita en la fuente unica haria fallar todas las copias por igual: el
 * validador marcaria la espera como ajena en todos los ficheros a la vez y
 * el mensaje no indicaria cual es el problema de verdad.
 */
export function leerDireccion(json) {
  let datos;
  try {
    datos = JSON.parse(json);
  } catch (error) {
    throw new Error(`el JSON no es valido: ${error instanceof Error ? error.message : String(error)}`);
  }
  const direccion = /** @type {{direccion?: unknown}} */ (datos)?.direccion;
  if (typeof direccion !== "string" || direccion === "") {
    throw new Error("falta el campo `direccion`");
  }
  if (!/^0x[a-fA-F0-9]{40}$/.test(direccion)) {
    throw new Error(`el campo \`direccion\` no tiene formato 0x + 40 hexadecimal: ${direccion}`);
  }
  return direccion;
}

/**
 * Extrae todas las direcciones EVM con formato del texto.
 *
 * @param {string} texto Texto a examinar (HTML, JS, MD...).
 * @returns {string[]} Las direcciones encontradas, sin duplicados y en orden
 *   de aparicion.
 *
 * El patron se crea en cada llamada: `matchAll` exige bandera `g` y recorre
 * desde `lastIndex`, asi que un objeto compartido dejaria la ultima busqueda
 * a medias y la siguiente saldria vacia.
 */
export function direccionesEn(texto) {
  const encontradas = [];
  const vistas = new Set();
  for (const coincidencia of texto.matchAll(new RegExp(patronDireccion))) {
    const direccion = coincidencia[0];
    if (!vistas.has(direccion)) {
      vistas.add(direccion);
      encontradas.push(direccion);
    }
  }
  return encontradas;
}

/**
 * Direcciones del texto que NO son la esperada.
 *
 * @param {string} texto Contenido del fichero.
 * @param {string} esperada La direccion unica permitida.
 * @returns {string[]} Las direcciones ajenas encontradas (vacia si todo cuadra).
 *
 * Cualquier letra cambiada en la copia del pie cuenta como ajena: el patron
 * no "arregla" ni normaliza, solo separa esperada de todo lo demas.
 */
export function direccionesAjenas(texto, esperada) {
  return direccionesEn(texto).filter((direccion) => direccion.toLowerCase() !== esperada.toLowerCase());
}

/**
 * Indica si el texto contiene la direccion esperada.
 *
 * @param {string} texto Contenido del fichero.
 * @param {string} esperada La direccion que debe aparecer.
 * @returns {boolean} `true` si la contiene.
 *
 * La comparacion ignora mayusculas porque una direccion EVM es indiferente
 * a mayusculas en sus partes hexadecimal: se escribe con prefijo 0x, pero
 * el valor es el mismo. Que solo falle una copia en minusculas seria un
 * falso positivo que empujaria a "arreglar" algo que esta bien.
 */
export function contieneEsperada(texto, esperada) {
  const minusculas = texto.toLowerCase();
  return minusculas.includes(esperada.toLowerCase());
}
