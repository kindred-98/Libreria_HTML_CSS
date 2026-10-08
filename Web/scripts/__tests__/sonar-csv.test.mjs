/**
 * Tests de las utilidades puras del export de SonarQube Cloud.
 *
 * Por que estan aparte del resto del script: `exportar-incidencias-sonar.mjs`
 * habla con la red, escribe en `tmp/sonar/` y hace `process.exit(1)` si falta
 * el token. Importarlo desde un test ejecutaria todo eso. Las funciones puras
 * viven en `lib/sonar-csv.mjs` justamente para poder probarlas sin token, sin
 * red y sin disco.
 *
 *   node --test Web/scripts/__tests__/sonar-csv.test.mjs
 *   npm test
 */
import test from "node:test";
import assert from "node:assert/strict";

import { celda, contar, csv, sanearMensaje, tabla } from "../lib/sonar-csv.mjs";

test("sanearMensaje: colapsa los saltos de linea que permitirian inyectar lineas en el log", () => {
  // El caso que motiva el S5145: un error con saltos de linea escribiria dos
  // lineas en el log y la segunda pareceria un mensaje legitimo del sistema.
  assert.equal(sanearMensaje("ERROR\nINFO: todo correcto"), "ERROR INFO: todo correcto");
  assert.equal(sanearMensaje("a\r\nb"), "a b");
  assert.equal(sanearMensaje("a\n\n\nb"), "a b");
});

test("sanearMensaje: quita tambien los demas caracteres de control", () => {
  assert.equal(sanearMensaje("antes\tafter"), "antes after");
  assert.equal(sanearMensaje("antes\vafter"), "antes after");
  assert.equal(sanearMensaje("antes\fafter"), "antes after");
  assert.equal(sanearMensaje("antes\0after"), "antes after");
  assert.equal(sanearMensaje("\0\0\0"), " ");
});

test("sanearMensaje: trunca a 200 caracteres por defecto, despues de sanear", () => {
  const largo = "x".repeat(300);
  assert.equal(sanearMensaje(largo).length, 200);
  // El corte no puede partir una secuencia de control que aun tenga el
  // Saneo pendiente, asi que se comprueba el orden: sanear primero, tresar
  // despues. Con 199 CR de golpe, sanear deja un unico espacio.
  assert.equal(sanearMensaje("\r".repeat(300)), " ");
  assert.equal(sanearMensaje(largo, { max: 10 }), "xxxxxxxxxx");
});

test("sanearMensaje: acepta errores, cadenas, nulos y numeros", () => {
  assert.equal(sanearMensaje(new Error("fallo\ngrave")), "fallo grave");
  assert.equal(sanearMensaje(null), "");
  assert.equal(sanearMensaje(undefined), "");
  assert.equal(sanearMensaje(42), "42");
  assert.equal(sanearMensaje(""), "");
});

test("celda: entrecomilla y duplica comillas cuando hace falta", () => {
  assert.equal(celda("normal"), "normal");
  assert.equal(celda(""), "");
  assert.equal(celda(null), "");
  assert.equal(celda(undefined), "");
  assert.equal(celda(7), "7");
  // Sin entrecomillar, un ";" abriria otra columna y un salto de linea otra
  // fila: los dos romperian el CSV al abrirlo en una hoja de calculo.
  assert.equal(celda("a;b"), '"a;b"');
  assert.equal(celda('dice "hola"'), '"dice ""hola"""');
  assert.equal(celda("linea1\nlinea2"), '"linea1\nlinea2"');
});

test("csv: monta cabecera, filas y salto de linea final", () => {
  const salida = csv(
    ["clave", "regla"],
    [
      ["A", "S1"],
      ["B", "S2"],
    ],
  );
  assert.equal(salida, "clave,regla\nA,S1\nB,S2\n");
});

test("csv: una cabecera sin filas produce solo la cabecera", () => {
  assert.equal(csv(["a", "b"], []), "a,b\n");
});

test("contar: agrupa por una propiedad y ordena de mas a menos", () => {
  const recuento = contar([{ regla: "S1" }, { regla: "S2" }, { regla: "S1" }, { regla: "S3" }], "regla");
  assert.deepEqual(recuento, [
    ["S1", 2],
    ["S2", 1],
    ["S3", 1],
  ]);
});

test("contar: los valores ausentes se agrupan bajo (sin dato)", () => {
  assert.deepEqual(contar([{ regla: null }, { regla: undefined }, {}], "regla"), [["(sin dato)", 3]]);
});

test("contar: una lista vacia devuelve una lista vacia", () => {
  assert.deepEqual(contar([], "regla"), []);
});

test("tabla: escribe una fila por par y respeta el limite", () => {
  assert.equal(
    tabla([
      ["A", 2],
      ["B", 1],
    ]),
    "| A | 2 |\n| B | 1 |",
  );
  assert.equal(
    tabla(
      [
        ["A", 2],
        ["B", 1],
        ["C", 1],
      ],
      2,
    ),
    "| A | 2 |\n| B | 1 |",
  );
});

test("tabla: sin datos escribe un marcador, no una tabla vacia", () => {
  assert.equal(tabla([]), "_Sin datos._\n");
});

// ------------------------------------------------------------------ aTexto

test("celda: un objeto se serializa como JSON, no como [object Object]", () => {
  // Este era el aviso S6551. Con `String(valor)` un objeto llegaba al CSV como
  // la cadena literal "[object Object]", que es informacion perdida.
  assert.equal(celda({ a: 1 }), '"{""a"":1}"');
  assert.equal(celda([1, 2]), "[1,2]");
});

test("celda: los tipos primitivos siguen igual", () => {
  assert.equal(celda("hola"), "hola");
  assert.equal(celda(42), "42");
  assert.equal(celda(true), "true");
});

test("celda: un objeto con ciclo no revienta y lo dice", () => {
  const ciclo = {};
  ciclo.self = ciclo;
  assert.equal(celda(ciclo), "[Object no serializable]");
});

test("celda: un Error conserva su nombre y su mensaje", () => {
  // `JSON.stringify(new Error("x"))` devuelve "{}", que pierde todo.
  class MiError extends Error {}
  assert.equal(celda(new MiError("fallo")), "Error: fallo");
  assert.equal(celda(new TypeError("mal")), "TypeError: mal");
});

test("contar con clave objeto: cada objeto es un grupo propio", () => {
  // Dos objetos con la misma forma pero distintos no son la misma clave en un
  // `Map` (se comparan por referencia), asi que son tres grupos, no dos.
  // Lo que se comprueba aqui es que no revientan al ordenar ni al imprimir.
  const recuento = contar([{ k: { n: 2 } }, { k: { n: 1 } }, { k: { n: 2 } }], "k");
  assert.equal(recuento.length, 3);
  // Y que el total de la tabla cuadra con los elementos contados.
  const total = recuento.reduce((suma, [, n]) => suma + n, 0);
  assert.equal(total, 3);
  assert.equal(tabla(recuento, 10).split("\n").filter(Boolean).length, 3);
});

test("contar con clave primitiva: ordena de mas a menos frecuente", () => {
  const recuento = contar([{ k: "b" }, { k: "a" }, { k: "b" }], "k");
  assert.deepEqual(recuento, [
    ["b", 2],
    ["a", 1],
  ]);
});

test("tabla: una clave objeto se imprime como JSON", () => {
  assert.equal(tabla([[{ n: 1 }, 3]]), '| {"n":1} | 3 |');
});
