/**
 * Tests de la regla anti-inyeccion en demos copiables (P0-2).
 *
 * Que cubren y por que: la regla nueva de `validate.mjs` es lo que impide
 * que el patron `innerHTML = '...' + dato` vuelva a colarse en un demo, y
 * tambien es la que tiene mas riesgo de falso positivo (una asignacion
 * vacia o un literal estatico no tienen que romper el CI). Aqui se prueban
 * los dos lados: el patron prohibido se detecta, las excepciones documentadas
 * pasan, y un `+` que pertenece a otra sentencia de la misma linea no cuenta.
 *
 *   npm test
 */
import test from "node:test";
import assert from "node:assert/strict";

import { lineasInnerHtmlConConcatenacion } from "../lib/inyeccion.mjs";

test("marca la concatenacion clasica despues de innerHTML", () => {
  const lineas = lineasInnerHtmlConConcatenacion("s.innerHTML='<span class=\"sw-hex\">'+c+'</span>';");
  assert.equal(lineas.length, 1);
  assert.equal(lineas[0].numero, 1);
  assert.match(lineas[0].texto, /sw-hex/);
});

test("marca la interpolacion de template literals", () => {
  const lineas = lineasInnerHtmlConConcatenacion("x.innerHTML = `<b>${dato}</b>`;");
  assert.equal(lineas.length, 1);
  assert.equal(lineas[0].numero, 1);
});

test("marca un + que deja la asignacion abierta en la misma linea", () => {
  const lineas = lineasInnerHtmlConConcatenacion("node.innerHTML = '<span></span>' +\n  '<span></span>';");
  assert.equal(lineas.length, 1);
  assert.equal(lineas[0].numero, 1);
});

test("numero de linea correcto con texto delante", () => {
  const texto = "const a = 1;\nconst b = 2;\nel.innerHTML = a + b;";
  const lineas = lineasInnerHtmlConConcatenacion(texto);
  assert.equal(lineas.length, 1);
  assert.equal(lineas[0].numero, 3);
});

test("permite vaciar con cadena vacia", () => {
  assert.deepEqual(lineasInnerHtmlConConcatenacion("list.innerHTML='';"), []);
  assert.deepEqual(lineasInnerHtmlConConcatenacion('tape.innerHTML = "";'), []);
});

test("permite un literal estatico sin variables", () => {
  assert.deepEqual(
    lineasInnerHtmlConConcatenacion("x.innerHTML = '<p class=\"empty\">Nada por aqui</p>';"),
    [],
  );
});

test("permite un literal estatico sin variables, signos incluidos", () => {
  assert.deepEqual(lineasInnerHtmlConConcatenacion('x.innerHTML = "<b>1+1</b>";'), []);
  assert.deepEqual(lineasInnerHtmlConConcatenacion('x.innerHTML = "<b>${queda como texto}</b>";'), []);
});

test("no marca un + anterior que pertenece a otra sentencia", () => {
  const texto = "const total = a + b; x.innerHTML = '<b>fijo</b>';";
  assert.deepEqual(lineasInnerHtmlConConcatenacion(texto), []);
});

test("no marca asignaturas a otras propiedades con +", () => {
  assert.deepEqual(lineasInnerHtmlConConcatenacion("el.textContent = a + b;"), []);
  assert.deepEqual(lineasInnerHtmlConConcatenacion("el.className = 'x' + y;"), []);
});

test("parte por CRLF y recorta sin colgar el retorno", () => {
  const lineas = lineasInnerHtmlConConcatenacion("x.innerHTML = '' + dato;\r\notra();\r\n");
  assert.equal(lineas.length, 1);
  assert.equal(lineas[0].numero, 1);
  assert.equal(lineas[0].texto, "x.innerHTML = '' + dato;");
});

test("devuelve vacio en un fichero limpio", () => {
  const texto = [
    "const li = document.createElement('li');",
    "const mark = document.createElement('mark');",
    "mark.textContent = r.slice(pos, pos + q.length);",
    "li.append(mark);",
  ].join("\n");
  assert.deepEqual(lineasInnerHtmlConConcatenacion(texto), []);
});
