/**
 * Tests de la logica de la direccion de donacion.
 *
 * Que cubren y por que: el pie de pagina es el dato mas valioso del sitio y
 * su proteccion entera se apoya en dos decisiones que no se ven en la pagina:
 * que la direccion salga de una fuente unica validada y que cualquier copia
 * distinta se marque como ajena. Un error aqui haria fallar el CI sin motivo
 * (falsos positivos) o, peor, dejaria pasar una cartera cambiada.
 *
 * El test de integracion usa un repositorio temporal con la estructura
 * minima (`Web/data/` + una pagina) para comprobar que `comprobarDonacion`
 * devuelve fallos con la direccion alterada y no la toca con la correcta,
 * que es el criterio de aceptacion de la P0-1 del plan.
 *
 *   npm test
 */
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { contieneEsperada, direccionesAjenas, direccionesEn, leerDireccion } from "../lib/donacion.mjs";
import { comprobarDonacion } from "../validar-donacion.mjs";

const CORRECTA = "0xa8f0230135b4f6a959358be3e8e8531f3551fa81";
// Una sola letra distinta de la real: es el caso que tiene que cazar el CI.
// Se construye en runtime y no se teclea: el barrido de validar-donacion.mjs
// exige que en todo el repositorio no aparezca ninguna direccion 0x+40 ajena,
// y un literal aqui lo haria fallar en su propio test.
const ALTERADA = `${CORRECTA.slice(0, -1)}${CORRECTA.endsWith("2") ? "3" : "2"}`;

test("leerDireccion: acepta la fuente unica bien formada", () => {
  const json = JSON.stringify({ direccion: CORRECTA, red: "BNB Smart Chain (BEP20)" });
  assert.equal(leerDireccion(json), CORRECTA);
});

test("leerDireccion: rechaza JSON roto, campo ausente y formato malo", () => {
  assert.throws(() => leerDireccion("{no es json"), /JSON no es valido/);
  assert.throws(() => leerDireccion(JSON.stringify({ otra: "clave" })), /falta el campo/);
  assert.throws(() => leerDireccion(JSON.stringify({ direccion: "0x1234" })), /40 hexadecimal/);
});

test("direccionesEn: extrae direcciones sin duplicar y crea el patron en cada llamada", () => {
  const texto = `${CORRECTA} y otra vez ${CORRECTA}`;
  assert.deepEqual(direccionesEn(texto), [CORRECTA]);
  // Una busqueda previa no puede dejar el patron a medias para la siguiente.
  assert.deepEqual(direccionesEn("sin direcciones"), []);
  assert.deepEqual(direccionesEn(CORRECTA), [CORRECTA]);
});

test("direccionesAjenas: una sola letra cambiada ya es ajena", () => {
  const texto = `donaciones a ${ALTERADA}`;
  assert.deepEqual(direccionesAjenas(texto, CORRECTA), [ALTERADA]);
  assert.deepEqual(direccionesAjenas(`solo la buena: ${CORRECTA}`, CORRECTA), []);
});

test("direccionesAjenas: distingue mayusculas solo en lo que no es hexadecimal identico", () => {
  // La direccion en minusculas es la misma cartera: no es ajena.
  assert.deepEqual(direccionesAjenas(CORRECTA.toUpperCase().replace("0X", "0x"), CORRECTA), []);
});

test("contieneEsperada: comprueba presencia ignorando mayusculas", () => {
  assert.equal(contieneEsperada(`<span>${CORRECTA}</span>`, CORRECTA), true);
  assert.equal(contieneEsperada("<span>vacia</span>", CORRECTA), false);
});

test("comprobarDonacion: la direccion alterada en un HTML hace fallar", async () => {
  const raiz = await mkdtemp(path.join(tmpdir(), "donacion-"));
  try {
    await mkdir(path.join(raiz, "Web", "data"), { recursive: true });
    await writeFile(path.join(raiz, "Web", "data", "donacion.json"), JSON.stringify({ direccion: CORRECTA }));
    for (const pagina of ["index.html", "components.html", "team-core.html"]) {
      await writeFile(path.join(raiz, "Web", pagina), `<footer>${CORRECTA}</footer>`);
    }

    const limpio = await comprobarDonacion(raiz);
    assert.deepEqual(limpio.fallos, []);
    assert.equal(limpio.esperada, CORRECTA);

    // Alterar la copia del pie: falta la buena y sobra una ajena.
    await writeFile(path.join(raiz, "Web", "index.html"), `<footer>${ALTERADA}</footer>`);
    const alterado = await comprobarDonacion(raiz);
    assert.equal(alterado.fallos.length, 2);
    assert.ok(
      alterado.fallos.some((fallo) => fallo.includes("no contiene la direccion")),
      `esperaba el fallo de presencia, vinieron: ${alterado.fallos.join(" | ")}`,
    );
    assert.ok(
      alterado.fallos.some((fallo) => fallo.includes(ALTERADA)),
      `esperaba el fallo de direccion ajena, vinieron: ${alterado.fallos.join(" | ")}`,
    );
  } finally {
    await rm(raiz, { recursive: true, force: true });
  }
});

test("comprobarDonacion: una fuente unica ilegible corta sin escanear el repo", async () => {
  const raiz = await mkdtemp(path.join(tmpdir(), "donacion-mala-"));
  try {
    await mkdir(path.join(raiz, "Web", "data"), { recursive: true });
    await writeFile(path.join(raiz, "Web", "data", "donacion.json"), JSON.stringify({ otra: "cosa" }));
    const resultado = await comprobarDonacion(raiz);
    assert.equal(resultado.fallos.length, 1);
    assert.match(resultado.fallos[0], /falta el campo/);
    assert.equal(resultado.comprobados, 0);
  } finally {
    await rm(raiz, { recursive: true, force: true });
  }
});
