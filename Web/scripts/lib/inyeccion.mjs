/**
 * Utilidades puras de la regla anti-inyeccion en demos copiables (P0-2).
 *
 * Que hay aqui y por que existe:
 *
 * - Los demos de `CreacionesNuevas/` y `creaciones-primium/` se copian a
 *   aplicaciones reales. Montar HTML con `innerHTML = '...' + dato` es un
 *   XSS en cuanto el dato venga del usuario: hoy los datos son fijos, pero
 *   el patron se copia tal cual.
 *
 * - `lineasInnerHtmlConConcatenacion` marca la linea si, despues de un
 *   `.innerHTML =`, queda un `+` o un `${` **fuera de los literales entre
 *   comillas**. Mirar la linea cruda daria falso positivo con un literal
 *   estatico que contenga un `+` de verdad (`innerHTML = "1+1"`), y ese
 *   caso el plan lo admite como excepcion.
 *
 * Excepciones permitidas (documentadas aqui y en validate.mjs):
 *
 * - Asignar la cadena vacia (`x.innerHTML = ''`) para vaciar: no lleva datos.
 * - Un literal estatico sin variables (`x.innerHTML = '<b>x</b>'`), aunque
 *   el texto lleve signos entre comillas: no hay dato externo que interpretar.
 * - Concatenar sobre `textContent` o montar con `createElement`/`append` es
 *   seguro siempre: la regla no lo toca, porque `textContent` nunca interpreta
 *   marcado aunque se le concatene lo que sea.
 *
 * Como se separa el `+` del literal: antes de mirar signos se borran los
 * textos entrecomillados (`'...'` y `"..."`, con sus escapes). Los backticks
 * NO se borran, para que la interpolacion de un template literal siga a la
 * vista: `innerHTML = \`<b>${dato}</b>\`` es exactamente el patron prohibido.
 * Un `${}` entre comillas simples es texto literal y se queda permitido.
 *
 * Limitacion conocida: si el `+` esta en otra sentencia de la misma linea
 * (o en una linea siguiente de un `innerHTML =` multilinia), la regla no lo
 * ve. Prefiere fallar a no fallar, y el arreglo siempre es separar la linea.
 *
 * Este modulo no importa nada de Node: se puede cargar en cualquier contexto.
 */

/** Busca un `.innerHTML =` y devuelve lo que hay despues del igual. */
const patronAsignacion = /\.innerHTML\s*=(.*)$/;

/** Borrar textos entrecomillados simples y dobles, conservando los backticks. */
const literalesComilla = /'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"/g;

/**
 * Lineas del fichero que asignan a `innerHTML` concatenando o interpolando.
 *
 * @param {string} texto Contenido completo del fichero `.js`.
 * @returns {{numero: number, texto: string}[]} Las lineas que violan la regla,
 *   con su numero (1-based) y su contenido recortado. Vacio si no hay nada.
 *
 * El texto se parte tambien por `\r\n`: los demos se editan en Windows y una
 * regla que solo partiera por `\n` dejaria `\r` colgando en el recorte del
 * mensaje de error.
 */
export function lineasInnerHtmlConConcatenacion(texto) {
  const lineas = texto.split(/\r?\n/);
  /** @type {{numero: number, texto: string}[]} */
  const encontradas = [];
  for (let i = 0; i < lineas.length; i++) {
    const coincidencia = patronAsignacion.exec(lineas[i]);
    if (!coincidencia) continue;
    const resto = coincidencia[1];
    const sinLiterales = resto.replace(literalesComilla, '""');
    if (sinLiterales.includes("+") || sinLiterales.includes("${")) {
      encontradas.push({ numero: i + 1, texto: lineas[i].trim() });
    }
  }
  return encontradas;
}
