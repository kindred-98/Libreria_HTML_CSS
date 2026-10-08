/**
 * Tests de la lista blanca de extensiones (P0-3).
 *
 * Que cubren y por que: la lista blanca es la puerta que decide que puede
 * entrar en el catalogo y en los ZIP. Si afloja, un `.exe` o un `.svg` con
 * script pasa sin mas; si se pone estricta con lo que ya existe (los cientos
 * de `LICENSE` sin extension), el repositorio deja de validar en verde.
 * Aqui se prueban los dos lados mas el caso del plan: un `.exe` y un `.php`
 * simulados en un directorio temporal hacen fallar la comprobacion completa.
 *
 *   npm test
 */
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { comprobarContenidoSvg, comprobarExtension, comprobarFichero } from "../lib/extensiones.mjs";
import { comprobarExtensiones } from "../validar-extensiones.mjs";

test("comprobarExtension: admite las extensiones de la lista blanca", () => {
  for (const ruta of [
    "CreacionesNuevas/x/index.html",
    "estilo.css",
    "script.js",
    "mod.mjs",
    "datos.json",
    "foto.png",
    "foto.jpg",
    "foto.jpeg",
    "foto.webp",
    "icono.svg",
    "fuente.woff2",
    "nota.txt",
    "README.md",
    "en\\con\\barra\\script.js",
  ]) {
    assert.equal(comprobarExtension(ruta), null, `deberia permitir ${ruta}`);
  }
});

test("comprobarExtension: rechaza .exe y .php (el caso del plan)", () => {
  assert.match(comprobarExtension("CreacionesNuevas/x/payload.exe") ?? "", /no permitida: \.exe/);
  assert.match(comprobarExtension("nota.php") ?? "", /no permitida: \.php/);
  assert.match(comprobarExtension("foto.EXE") ?? "", /no permitida: \.exe/);
});

test("comprobarExtension: un LICENSE sin extension pasa y cualquier otro nombre no", () => {
  assert.equal(comprobarExtension("CreacionesNuevas/x/LICENSE"), null);
  assert.equal(comprobarExtension("vendor/LICENSE-qrcode-generator"), null);
  assert.match(comprobarExtension("CreacionesNuevas/x/mystery") ?? "", /no tiene extension/);
});

test("comprobarContenidoSvg: caza los tres patrones ejecutables", () => {
  assert.match(comprobarContenidoSvg("<svg><script>alert(1)</script></svg>") ?? "", /<script/);
  assert.match(comprobarContenidoSvg('<svg onload="alert(1)"></svg>') ?? "", /atributo de evento/);
  assert.match(comprobarContenidoSvg('<svg><a href="javascript:alert(1)"/></svg>') ?? "", /javascript:/);
  assert.equal(comprobarContenidoSvg('<svg><path d="M0 0"/></svg>'), null);
});

test("comprobarFichero: combina extension y contenido, y pide el SVG si falta", () => {
  assert.deepEqual(comprobarFichero("ok.html"), []);
  assert.equal(comprobarFichero("mal.exe").length, 1);
  assert.match(comprobarFichero("icono.svg")[0] ?? "", /falta el contenido/);
  assert.equal(comprobarFichero("icono.svg", "<svg onload='x'/>").length, 1);
  assert.deepEqual(comprobarFichero("icono.svg", "<svg/>"), []);
});

test("comprobarExtensiones: un .exe y un .php simulados hacen fallar", async () => {
  const raiz = await mkdtemp(path.join(tmpdir(), "extensiones-"));
  try {
    const coleccion = path.join(raiz, "coleccion");
    const demo = path.join(coleccion, "mi-demo");
    await mkdir(path.join(demo, "vendor"), { recursive: true });
    await writeFile(path.join(demo, "index.html"), "<!doctype html>");
    await writeFile(path.join(demo, "style.css"), "body{}");
    await writeFile(path.join(demo, "script.js"), "console.log(1)");
    await writeFile(path.join(demo, "LICENSE"), "MIT");

    const limpio = await comprobarExtensiones(raiz, [coleccion]);
    assert.deepEqual(limpio.fallos, []);
    assert.equal(limpio.comprobados, 4);

    await writeFile(path.join(demo, "payload.exe"), "MZ...");
    await mkdir(path.join(coleccion, "otro"), { recursive: true });
    await writeFile(path.join(coleccion, "otro", "nota.php"), "<?php");
    await writeFile(path.join(demo, "icono.svg"), "<svg><script>alert(1)</script></svg>");
    const sucio = await comprobarExtensiones(raiz, [coleccion]);
    assert.equal(sucio.fallos.length, 3);
    assert.ok(sucio.fallos.some((fallo) => fallo.includes("payload.exe")));
    assert.ok(
      sucio.fallos.some((fallo) => fallo.includes("nota.php")),
      `vinieron: ${sucio.fallos.join(" | ")}`,
    );
    assert.ok(sucio.fallos.some((fallo) => fallo.includes("icono.svg")));
  } finally {
    await rm(raiz, { recursive: true, force: true });
  }
});

test("comprobarExtensiones: los .zip generados y los ficheros de sistema no cuentan", async () => {
  const raiz = await mkdtemp(path.join(tmpdir(), "extensiones-zip-"));
  try {
    const coleccion = path.join(raiz, "coleccion");
    await mkdir(coleccion, { recursive: true });
    await writeFile(path.join(coleccion, "index.html"), "<!doctype html>");
    await writeFile(path.join(coleccion, "salida.zip"), "PK");
    await writeFile(path.join(coleccion, "Thumbs.db"), "x");
    const resultado = await comprobarExtensiones(raiz, [coleccion]);
    assert.deepEqual(resultado.fallos, []);
    assert.equal(resultado.comprobados, 1);
  } finally {
    await rm(raiz, { recursive: true, force: true });
  }
});
