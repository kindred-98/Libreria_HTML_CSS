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
  const salida = csv(["clave", "regla"], [["A", "S1"], ["B", "S2"]]);
  assert.equal(salida, "clave,regla\nA,S1\nB,S2\n");
});

test("csv: una cabecera sin filas produce solo la cabecera", () => {
  assert.equal(csv(["a", "b"], []), "a,b\n");
});

test("contar: agrupa por una propiedad y ordena de mas a menos", () => {
  const recuento = contar(
    [{ regla: "S1" }, { regla: "S2" }, { regla: "S1" }, { regla: "S3" }],
    "regla",
  );
  assert.deepEqual(recuento, [["S1", 2], ["S2", 1], ["S3", 1]]);
});

test("contar: los valores ausentes se agrupan bajo (sin dato)", () => {
  assert.deepEqual(contar([{ regla: null }, { regla: undefined }, {}], "regla"), [["(sin dato)", 3]]);
});

test("contar: una lista vacia devuelve una lista vacia", () => {
  assert.deepEqual(contar([], "regla"), []);
});

test("tabla: escribe una fila por par y respeta el limite", () => {
  assert.equal(tabla([["A", 2], ["B", 1]]), "| A | 2 |\n| B | 1 |");
  assert.equal(tabla([["A", 2], ["B", 1], ["C", 1]], 2), "| A | 2 |\n| B | 1 |");
});

test("tabla: sin datos escribe un marcador, no una tabla vacia", () => {
  assert.equal(tabla([]), "_Sin datos._\n");
});