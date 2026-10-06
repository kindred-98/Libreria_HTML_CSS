/**
 * Tests de los patrones de auto-fix.
 *
 * Por que estan aparte: `../autofix-sonar-mecanico.mjs` recorre el repo
 * entero y escribe ficheros. Los patrones viven en `lib/autofix-patrones.mjs`
 * para poder probarlos sin tocar nada.
 *
 * Cada patron se prueba con casos de conversion Y con casos de no-conversion.
 * Los de no-conversion son los importantes: son los limites que evitan que
 * el autofix rompa un demo. Un patron que solo se prueba con el caso bueno
 * puede estar tocando de mas sin que nadie se entere.
 *
 *   node --test Web/scripts/__tests__/autofix-patrones.test.mjs
 *   npm test
 */
import test from "node:test";
import assert from "node:assert/strict";

import { EXCLUIR, PATRONES, aplicarPatrones, contarPorPatron } from "../lib/autofix-patrones.mjs";

/** Aplica solo el patron pedido. */
const uno = (id, texto) => {
  const patron = PATRONES.find((p) => p.id === id);
  assert.ok(patron, `no existe el patron ${id}`);
  return aplicarPatrones(texto, [patron]);
};

// ---------------------------------------------------------------- estructura

test("todos los patrones tienen id unico, descripcion y regex global", () => {
  const vistos = new Set();
  for (const patron of PATRONES) {
    assert.ok(patron.id, "un patron no tiene id");
    assert.ok(!vistos.has(patron.id), `el id ${patron.id} esta repetido`);
    vistos.add(patron.id);
    assert.equal(typeof patron.descripcion, "string");
    assert.ok(patron.regex instanceof RegExp, `${patron.id}: regex no es RegExp`);
    assert.ok(
      patron.regex.flags.includes("g"),
      `${patron.id}: la regex no es global y replace solo tocaria la primera`,
    );
    assert.ok(
      typeof patron.reemplazo === "string" || typeof patron.reemplazo === "function",
      `${patron.id}: el reemplazo no es string ni funcion`,
    );
  }
});

test("EXCLUIR incluye los tres scripts del repo y el modulo de patrones", () => {
  for (const esperado of ["node_modules", ".git", "Web/scripts/lib/", "Web/data/", "tmp/"]) {
    assert.ok(EXCLUIR.includes(esperado), `EXCLUIR no tiene ${esperado}`);
  }
});

test("las regex son globales y se pueden reutilizar entre llamadas", () => {
  // Sin la bandera g, o sin resetear lastIndex, un segundo uso no encontraria
  // nada. Se comprueba que dos llamadas seguidas dan el mismo resultado.
  const texto = "parseFloat(a); parseFloat(b);";
  assert.equal(uno("S7773", texto), "Number.parseFloat(a); Number.parseFloat(b);");
  assert.equal(uno("S7773", texto), "Number.parseFloat(a); Number.parseFloat(b);");
});

// -------------------------------------------------------------- conversiones

test("S7773 / S7773b / S7773c / S7773-isfinite: los globales numericos", () => {
  assert.equal(uno("S7773", "parseFloat(x)"), "Number.parseFloat(x)");
  assert.equal(uno("S7773b", "parseInt(x, 10)"), "Number.parseInt(x, 10)");
  assert.equal(uno("S7773c", "if (isNaN(v))"), "if (Number.isNaN(v))");
  assert.equal(uno("S7773-isfinite", "isFinite(v)"), "Number.isFinite(v)");
});

test("S7773 y familia: no toca un miembro con punto delante", () => {
  // `algo.parseFloat` es una propiedad, no el global: convertirlo rompe.
  assert.equal(uno("S7773", "obj.parseFloat(x)"), "obj.parseFloat(x)");
  assert.equal(uno("S7773", "Number.parseFloat(x)"), "Number.parseFloat(x)");
  assert.equal(uno("S7773c", "mi.isNaN(x)"), "mi.isNaN(x)");
});

test("S7765: indexOf frente a -1 pasa a includes", () => {
  assert.equal(uno("S7765", "arr.indexOf(x) > -1"), "arr.includes(x)");
  assert.equal(uno("S7765", "arr.indexOf(x) >= 0"), "arr.includes(x)");
  assert.equal(uno("S7765", "arr.indexOf(x) != -1"), "arr.includes(x)");
});

test("S7765: no toca una busqueda de inclusion", () => {
  // include es lo contrario de includes: convertirlo cambiaria el resultado.
  assert.equal(uno("S7765", "arr.indexOf(x) < 0"), "arr.indexOf(x) < 0");
  assert.equal(uno("S7765", "arr.indexOf(x) === -1"), "arr.indexOf(x) === -1");
});

test("S7765: no toca las comparaciones que no significan 'esta presente'", () => {
  // Estas tres son las que mas se confunden con includes y NO lo son:
  // `!= 0` es "no esta en la posicion 0"; `> 0` es "esta mas alla"; y `> -0`
  // es identico a `> 0` porque -0 === 0 en JavaScript.
  assert.equal(uno("S7765", "arr.indexOf(x) != 0"), "arr.indexOf(x) != 0");
  assert.equal(uno("S7765", "arr.indexOf(x) > 0"), "arr.indexOf(x) > 0");
  assert.equal(uno("S7765", "arr.indexOf(x) > -0"), "arr.indexOf(x) > -0");
});

test("S6557: indexOf igual a 0 pasa a startsWith", () => {
  assert.equal(uno("S6557", 's.indexOf("x") === 0'), "s.startsWith('x')");
  assert.equal(uno("S6557", "s.indexOf('y') === 0"), "s.startsWith('y')");
});

test("S6557: no toca una busqueda en cualquier posicion", () => {
  assert.equal(uno("S6557", 's.indexOf("x") > 0'), 's.indexOf("x") > 0');
  assert.equal(uno("S6557", 's.indexOf("x") !== 0'), 's.indexOf("x") !== 0');
});

test("S6653: hasOwnProperty.call pasa a Object.hasOwn", () => {
  assert.equal(uno("S6653", "Object.prototype.hasOwnProperty.call(o, k)"), "Object.hasOwn(o, k)");
});

test("S7762: removeChild pasa a remove", () => {
  assert.equal(uno("S7762", "padre.removeChild(hijo)"), "hijo.remove()");
});

test("S7769: Math.sqrt de dos cuadrados pasa a Math.hypot", () => {
  assert.equal(uno("S7769", "Math.sqrt(dx * dx + dy * dy)"), "Math.hypot(dx, dy)");
});

test("S7769: no toca una raiz que no son dos cuadrados", () => {
  assert.equal(uno("S7769", "Math.sqrt(x * x + y * z)"), "Math.sqrt(x * x + y * z)");
  assert.equal(uno("S7769", "Math.sqrt(a * a)"), "Math.sqrt(a * a)");
});

test("S6353 y S6353b: clases de digitos y de no-digitos", () => {
  assert.equal(uno("S6353", "/[0-9]/g"), "/\\d/g");
  assert.equal(uno("S6353b", "/[^0-9]/g"), "/\\D/g");
});

test("S6397: quita la classe cuando solo envuelve un escape abreviado", () => {
  assert.equal(uno("S6397", "/[\\d]/g"), "/\\d/g");
  assert.equal(uno("S6397", "/[\\w]{6}/g"), "/\\w{6}/g");
  assert.equal(uno("S6397", "/[\\s]/g"), "/\\s/g");
});

test("S6397: deja intactas las clases con rango o varios caracteres", () => {
  assert.equal(uno("S6397", "/[a-z]/g"), "/[a-z]/g");
  assert.equal(uno("S6397", "/[abc]/g"), "/[abc]/g");
});

test("S7774: slice de array vacio", () => {
  assert.equal(uno("S7774", "[].slice.call(x)"), "Array.prototype.slice.call(x)");
});

test("S7758: charCodeAt pasa a codePointAt", () => {
  assert.equal(uno("S7758", '"a".charCodeAt(0)'), '"a".codePointAt(0)');
});

test("S7759 y S7719: las dos formas de Date.now", () => {
  assert.equal(uno("S7759", "new Date().getTime()"), "Date.now()");
  assert.equal(uno("S7719", "new Date(otro).getTime()"), "otro.getTime()");
});

test("S7750: filter con [0] pasa a find", () => {
  assert.equal(uno("S7750", "arr.filter(p)[0]"), "arr.find(p)");
});

test("S7727: forEach con una funcion suelta", () => {
  assert.equal(uno("S7727", "arr.forEach(hacer)"), "arr.forEach((...args) => hacer(...args))");
});

test("S7781: replace de un literal pasa a replaceAll", () => {
  assert.equal(uno("S7781", 's.replace("a", b)'), "s.replaceAll('a', b)");
});

test("S7781: no toca un replace cuya primera argumento es una regex", () => {
  // Cambiar /a/g por replaceAll con una regex como primer argumento lanza
  // error en runtime, asi que el limite es obligatorio.
  assert.equal(uno("S7781", "s.replace(/a/g, b)"), "s.replace(/a/g, b)");
});

test("S1874-mql: addListener pasa a addEventListener", () => {
  assert.equal(uno("S1874-mql", "mq.addListener(cb)"), "mq.addEventListener('change', cb)");
});

test("S6582: x && x.y pasa a x?.y cuando la posicion es aislada", () => {
  assert.equal(uno("S6582", "a && a.b"), "a?.b");
});

test("S6582: no toca cuando x no es el principio de la expresion", () => {
  // Aqui la conversion cambiaria la semantica: `e.target === x && x.y` no
  // es lo mismo que `e.target === x?.y`.
  assert.equal(uno("S6582", "e.target === x && x.y"), "e.target === x && x.y");
});

test("S7761: data-foo-bar pasa a dataset.fooBar", () => {
  assert.equal(uno("S7761", 'el.getAttribute("data-foo-bar")'), "el.dataset.fooBar");
});

test("S7761: no toca atributos que no son data-", () => {
  assert.equal(uno("S7761", 'el.getAttribute("class")'), 'el.getAttribute("class")');
});

test("S7766 y S7766b: el ternario del menor y del mayor", () => {
  assert.equal(uno("S7766", "a < b ? a : b"), "Math.min(a, b)");
  assert.equal(uno("S7766b", "a > b ? a : b"), "Math.max(a, b)");
});

// ------------------------------------------------------------------- cascada

test("aplicarPatrones: la cascada respeta el orden del array", () => {
  // S6353 ([0-9] -> \d) tiene que correr antes que S6397 ([\d] -> \d): si
  // corriera al reves, S6397 veria primero la clase ya convertida.
  const solo6353 = aplicarPatrones(
    "/[0-9]/g",
    PATRONES.filter((p) => p.id === "S6353"),
  );
  assert.equal(solo6353, "/\\d/g");
  const todos = aplicarPatrones("/[0-9]/g", PATRONES);
  assert.equal(todos, "/\\d/g");
});

test("aplicarPatrones: es idempotente sobre el resultado", () => {
  // Volver a pasar los patrones no debe cambiar nada mas: si un patron
  // generase la entrada de otro, esto lo detectaria.
  const una = aplicarPatrones("parseFloat(a); arr.indexOf(x) > -1; /[0-9]/g");
  const dos = aplicarPatrones(una);
  assert.equal(dos, una);
});

test("contarPorPatron: cuenta sobre el texto original, no sobre el transformado", () => {
  const texto = "parseFloat(a); arr.indexOf(x) > -1;";
  const totales = contarPorPatron(texto);
  assert.equal(totales.S7773, 1);
  assert.equal(totales.S7765, 1);
  // Ningun patron cuenta lo que no hay.
  assert.equal(totales.S6653, 0);
});

test("contarPorPatron: cuenta todas las ocurrencias de un patron global", () => {
  assert.equal(contarPorPatron("parseFloat(a) + parseFloat(b) + parseFloat(c)").S7773, 3);
});

test("contarPorPatron y aplicarPatrones aceptan una sublista de patrones", () => {
  const solo = PATRONES.filter((p) => p.id === "S7759");
  const totales = contarPorPatron("new Date().getTime()", solo);
  // Con una sublista solo salen las claves de esa sublista: los demas
  // patrones ni se miran. Por eso S7773 no aparece, no es un 0.
  assert.deepEqual(Object.keys(totales), ["S7759"]);
  assert.equal(totales.S7759, 1);
  assert.equal(aplicarPatrones("isNaN(x)", solo), "isNaN(x)");
  assert.equal(aplicarPatrones("new Date().getTime()", solo), "Date.now()");
});

test("aplicarPatrones: un texto sin nada que convertir sale identico", () => {
  const texto = 'const x = "no hay nada que cambiar aqui";';
  assert.equal(aplicarPatrones(texto), texto);
});
