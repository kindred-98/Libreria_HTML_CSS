/**
 * Utilidades puras de la lista blanca de tipos de archivo (P0-3).
 *
 * Que hay aqui y por que existe:
 *
 * - Los ZIP y el catalogo se construyen con los ficheros que hay en las
 *   carpetas de los demos. Nada impide hoy que se cuele un tipo nuevo
 *   (`.exe`, `.php`, un `.svg` con script...) y el repo lo serviria y lo
 *   empaquetaria sin rechistar. La lista blanca es el unico sitio donde se
 *   decide que puede entrar: generate-catalog, build-zips y validate.mjs
 *   llaman aqui, asi que las tres puertas miden con la misma regla.
 *
 * - `comprobarExtension` admite ademas los ficheros `LICENSE` (y
 *   `LICENSE-*`, como el `LICENSE-qrcode-generator` de vendor/): no tienen
 *   extension y hay cientos dentro de los demos; sin esta excepcion el
 *   estado actual del repositorio no pasaria la comprobacion.
 *
 * - `comprobarContenidoSvg` cubre el motivo por el que un `.svg` es peligroso
 *   aunque este en la lista blanca: puede llevar `<script`, atributos de
 *   evento (`onclick=`...) o `javascript:` en un enlace, y un SVG servido
 *   como imagen o abierto en pestana los ejecuta.
 *
 * Este modulo no importa nada de Node: se puede cargar en cualquier contexto.
 */

/**
 * Extensiones que pueden aparecer en las carpetas de los demos.
 *
 * La lista es cerrada a proposito: anadir un tipo es una decision que tiene
 * que pasar por revision, no un descuido. Cubre lo que hoy existe en el repo
 * (html, css, js, txt, md, woff2, png, jpg, svg, LICENSE) mas jpeg y webp,
 * que son los formatos de imagen habituales en un demo nuevo.
 */
export const EXTENSIONES_PERMITIDAS = new Set([
  ".html",
  ".css",
  ".js",
  ".mjs",
  ".json",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".svg",
  ".woff2",
  ".txt",
  ".md",
]);

/**
 * Comprueba que la extension de un fichero esta en la lista blanca.
 *
 * @param {string} ruta Ruta relativa o nombre del fichero (con `/` o `\`).
 * @returns {string|null} El motivo del fallo, o `null` si esta permitido.
 *
 * Los ficheros `LICENSE` y `LICENSE-*` no llevan extension y se admiten
 * expresamente: son los textos de licencia que viajan dentro de cada demo y
 * de cada ZIP. Un fichero sin extension que no sea una licencia se rechaza,
 * que es justo lo que pide el plan: no dejar entrar nada con la procedencia
 * indocumentada.
 */
export function comprobarExtension(ruta) {
  const nombre = ruta.split(/[\\/]/).pop() ?? ruta;
  const punto = nombre.lastIndexOf(".");
  if (punto <= 0) {
    if (nombre === "LICENSE" || nombre.startsWith("LICENSE-")) return null;
    return `no tiene extension y no es un LICENSE (nombre: ${nombre})`;
  }
  const extension = nombre.slice(punto).toLowerCase();
  if (!EXTENSIONES_PERMITIDAS.has(extension)) {
    return `extension no permitida: ${extension} (extensiones validas: ${[...EXTENSIONES_PERMITIDAS].join(" ")})`;
  }
  return null;
}

/**
 * Comprueba que un SVG no lleva marcado ejecutable.
 *
 * @param {string} contenido Texto completo del fichero `.svg`.
 * @returns {string|null} El motivo del fallo, o `null` si es seguro.
 *
 * Los tres patrones son los que convierten un SVG en un contenedor de
 * script: `<script>` embebido, atributos de evento (`onload=`, `onclick=`...)
 * y esquemas `javascript:` dentro de `href`. Se buscan sin distinguir
 * mayusculas porque el navegador tampoco lo hace.
 */
export function comprobarContenidoSvg(contenido) {
  if (/<script/i.test(contenido)) return "el SVG contiene un <script>";
  if (/\son[a-z]+\s*=/i.test(contenido)) return "el SVG contiene un atributo de evento (on*=)";
  if (/javascript\s*:/i.test(contenido)) return "el SVG contiene un esquema javascript:";
  return null;
}

/**
 * Comprueba un fichero completo: extension y, si es SVG, contenido.
 *
 * @param {string} ruta Ruta relativa o nombre del fichero.
 * @param {string} [contenido] Texto del fichero. Solo hace falta para los
 *   `.svg`; para el resto de tipos se ignora.
 * @returns {string[]} Los motivos de fallo (vacio si el fichero esta bien).
 *
 * Devuelve una lista y no un string para que quien llama pueda acumular
 * todos los fallos de una carpeta antes de cortar.
 */
export function comprobarFichero(ruta, contenido) {
  const fallos = [];
  const falloExtension = comprobarExtension(ruta);
  if (falloExtension) {
    fallos.push(falloExtension);
    return fallos;
  }
  if (ruta.split(/[\\/]/).pop()?.toLowerCase().endsWith(".svg")) {
    if (contenido === undefined) {
      fallos.push("falta el contenido del SVG para comprobar el marcado");
      return fallos;
    }
    const falloSvg = comprobarContenidoSvg(contenido);
    if (falloSvg) fallos.push(falloSvg);
  }
  return fallos;
}
