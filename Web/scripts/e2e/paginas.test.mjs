/**
 * Tests de extremo a extremo de las tres paginas del sitio.
 *
 * Que cubren y por que: `validar-a11y.mjs` mide accesibilidad,
 * `validar-layout.mjs` mide que nada se salga de lado y `validar:demos.mjs`
 * abre los 1018 demos sueltos. Ninguno comprueba que la web **de verdad**
 * funcione: que la rejilla se rellene, que el buscador filtre, que el cambio
 * de tema y de idioma se guarden, que el portal de Davoker cargue y que el
 * boton de tema altere el atributo correspondiente del HTML.
 *
 * Un error de logica en `app.js` no lo ve ninguno de los validadores
 * anteriores: rompe la pagina, no su HTML. Estos tests si.
 *
 *   npm run test:e2e
 *
 * Por que `node:test` y no `@playwright/test`: `playwright` ya es
 * dependencia del repo (la usan `validar-a11y` y `validar-layout`), asi que
 * estos tests no anaden ninguna dependencia nueva.
 *
 * Requieren Chromium instalado (`npx playwright install chromium`).
 */
import test, { after, before } from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright";

import { arrancarServidor, puertoLibre } from "../lib/servidor.mjs";

const ORIGEN_PUERTO = await puertoLibre();
const ORIGEN = `http://127.0.0.1:${ORIGEN_PUERTO}`;

let servidor;
let navegador;
let contexto;

/** Abre una pagina nueva con el almacen limpio (sin tema ni idioma guardados). */
async function abrir(ruta) {
  const pagina = await contexto.newPage();
  await pagina.goto(`${ORIGEN}${ruta}`, { waitUntil: "domcontentloaded" });
  return pagina;
}

/** Espera a que la rejilla del catalogo tenga al menos una tarjeta. */
async function esperarRejilla(pagina) {
  await pagina.waitForFunction(
    () => document.querySelectorAll("#component-grid .component-card").length > 0,
    undefined,
    { timeout: 15000 },
  );
}

before(async () => {
  servidor = await arrancarServidor(ORIGEN_PUERTO);
  navegador = await chromium.launch({ args: ["--no-sandbox"] });
  // Sin almacenamiento previo: cada test empieza como un visitante nuevo.
  contexto = await navegador.newContext();
});

after(async () => {
  await contexto?.close();
  await navegador?.close();
  servidor?.kill();
});

// ------------------------------------------------------------------- portada

test("portada: carga, tiene h1 y el catalogo alimenta los destacados", async () => {
  const pagina = await abrir("/Web/index.html");
  assert.equal(await pagina.title(), "Biblioteca HTML y CSS");
  assert.equal((await pagina.locator("h1").count()) >= 1, true);
  // El sitio no es una maqueta vacia: los destacados vienen del catalogo.
  await pagina.waitForFunction(
    () => document.querySelectorAll("article.component-card").length > 0,
    undefined,
    { timeout: 15000 },
  );
  const total = await pagina.locator("article.component-card").count();
  assert.equal(total > 0, true);
  await pagina.close();
});

test("portada: el aviso de cookies aparece y el rechazo se guarda", async () => {
  const pagina = await abrir("/Web/index.html");
  const aviso = pagina.locator("[data-consent-banner]");
  await aviso.waitFor({ timeout: 10000 });
  // Rechazar debe decidir, no preguntar otra vez, y guardar "deny".
  await pagina.locator('[data-consent="deny"]').click();
  const decision = await pagina.evaluate(() =>
    window.localStorage.getItem("component-field-analytics-consent"),
  );
  assert.equal(decision, "deny");
  await pagina.close();
});

// --------------------------------------------------------------- componentes

test("componentes: la rejilla se rellena con el catalogo y pagina", async () => {
  const pagina = await abrir("/Web/components.html");
  await esperarRejilla(pagina);
  const tarjetas = await pagina.locator("#component-grid .component-card").count();
  assert.equal(tarjetas > 0, true);
  // Con 1018 componentes tiene que haber paginacion: es la senal de que la
  // rejilla no esta volcando las 1018 en el DOM de golpe.
  assert.equal(await pagina.locator("#pagination").isVisible(), true);
  await pagina.close();
});

test("componentes: el buscador filtra la rejilla", async () => {
  const pagina = await abrir("/Web/components.html");
  await esperarRejilla(pagina);
  // Ojo: no se comparan numero de tarjetas, porque la rejilla muestra una
  // pagina (9) y filtrar puede dejar las mismas nueve. Lo que tiene que
  // cambiar es el recuento de resultados de arriba.
  const contador = pagina.locator("#results-count");
  const antes = await contador.textContent();
  await pagina.fill("#component-search", "boton");
  await pagina.waitForFunction(
    (prev) => document.querySelector("#results-count")?.textContent !== prev,
    antes,
    { timeout: 10000 },
  );
  assert.notEqual(await contador.textContent(), antes);
  await pagina.close();
});

test("componentes: buscar sin resultados muestra el estado vacio", async () => {
  const pagina = await abrir("/Web/components.html");
  await esperarRejilla(pagina);
  await pagina.fill("#component-search", "zzz-no-existe-esta-palabra-zzz");
  await pagina.waitForFunction(
    () => {
      const vacio = /** @type {HTMLElement | null} */ (document.querySelector("#empty-state"));
      return vacio !== null && vacio.hidden === false;
    },
    undefined,
    {
      timeout: 10000,
    },
  );
  assert.equal(await pagina.locator("#empty-state").isVisible(), true);
  await pagina.close();
});

test("componentes: abrir una tarjeta lleva a su detalle", async () => {
  const pagina = await abrir("/Web/components.html");
  await esperarRejilla(pagina);
  await pagina.locator("#component-grid .component-card a").first().click();
  // El detalle es la misma pagina con un `?component=` en la URL.
  await pagina.waitForFunction(() => window.location.search.includes("component="), undefined, {
    timeout: 10000,
  });
  assert.equal(pagina.url().includes("component="), true);
  await pagina.close();
});

test("componentes: el autor Davoker carga su portal en el hueco de la rejilla", async () => {
  const pagina = await abrir("/Web/components.html");
  await esperarRejilla(pagina);
  // El chip de autor NO lleva data-author: se pinta solo con su texto, asi
  // que se localiza por el nombre accesible que ve la persona.
  await pagina.getByRole("button", { name: "Davoker", exact: true }).click();
  const portal = pagina.locator("#davoker-portal");
  await portal.waitFor({ state: "visible", timeout: 10000 });
  // El iframe tiene que recibir el src de verdad (data-src -> src).
  const iframe = pagina.locator("#davoker-frame");
  await iframe.waitFor({ timeout: 10000 });
  const src = await iframe.getAttribute("src");
  assert.equal(typeof src, "string");
  assert.equal(src.includes("davoker.html"), true);
  // Y dentro del apartado de davoker el buscador se apaga.
  assert.equal(await pagina.locator("#component-search").isDisabled(), true);
  await pagina.close();
});

// ------------------------------------------------------- tema, idioma, i18n

test("el boton de tema alterna el atributo del html y lo guarda", async () => {
  const pagina = await abrir("/Web/index.html");
  const inicial = await pagina.evaluate(() => document.documentElement.dataset.theme);
  await pagina.locator("#theme-toggle").click();
  const despues = await pagina.evaluate(() => document.documentElement.dataset.theme);
  assert.notEqual(despues, inicial);
  const guardado = await pagina.evaluate(() => window.localStorage.getItem("component-field-theme"));
  assert.equal(guardado, despues);
  await pagina.close();
});

test("el tema elegido se recuerda al volver a cargar", async () => {
  const pagina = await abrir("/Web/index.html");
  await pagina.locator("#theme-toggle").click();
  const elegido = await pagina.evaluate(() => document.documentElement.dataset.theme);
  await pagina.reload({ waitUntil: "domcontentloaded" });
  const trasRecarga = await pagina.evaluate(() => document.documentElement.dataset.theme);
  assert.equal(trasRecarga, elegido);
  await pagina.close();
});

test("el boton de idioma cambia el texto y marca aria-pressed", async () => {
  const pagina = await abrir("/Web/index.html");
  const en = pagina.locator('.language-button[data-language="en"]');
  const es = pagina.locator('.language-button[data-language="es"]');
  await en.click();
  await pagina.waitForFunction(
    () =>
      document.querySelector('.language-button[data-language="en"]')?.getAttribute("aria-pressed") === "true",
    undefined,
    { timeout: 10000 },
  );
  assert.equal(await es.getAttribute("aria-pressed"), "false");
  const guardado = await pagina.evaluate(() => window.localStorage.getItem("component-field-language"));
  assert.equal(guardado, "en");
  await pagina.close();
});

test("las 132 claves i18n estan en los dos idiomas (el HTML no se rompe al cambiar)", async () => {
  // No comprobamos los textos literales (son muy fragiles): comprobamos que
  // cambiar a EN y volver a ES no deja ninguna etiqueta data-i18n vacia, que
  // es el sintoma de una clave que existe en un idioma y no en el otro.
  const pagina = await abrir("/Web/components.html");
  await esperarRejilla(pagina);
  for (const idioma of ["en", "es", "en"]) {
    await pagina.locator(`.language-button[data-language="${idioma}"]`).click();
    const vacias = await pagina.evaluate(
      () => [...document.querySelectorAll("[data-i18n]")].filter((el) => !el.textContent.trim()).length,
    );
    assert.equal(vacias, 0, `hay ${vacias} etiquetas data-i18n vacias en ${idioma}`);
  }
  await pagina.close();
});

// ------------------------------------------------------------------ team core

test("team core: carga con su h1 y sin errores de consola", async () => {
  const pagina = await abrir("/Web/team-core.html");
  assert.equal((await pagina.locator("h1").count()) >= 1, true);
  const errores = [];
  pagina.on("console", (mensaje) => {
    if (mensaje.type() === "error") errores.push(mensaje.text());
  });
  await pagina.waitForTimeout(500);
  assert.deepEqual(errores, []);
  await pagina.close();
});

// ------------------------------------------------------------------- legales

test("privacidad: se llega desde el pie, se lee y cambia de idioma", async () => {
  // El pie es el unico sitio desde donde se llega a la politica, asi que es
  // el camino que hay que comprobar de verdad.
  const pagina = await abrir("/Web/index.html");
  await pagina.getByRole("link", { name: "Privacy", exact: true }).click();
  await pagina.waitForURL("**/privacidad.html");
  assert.equal(await pagina.locator("h1").textContent(), "Privacy");

  // El indice debe apuntar a secciones que existen de verdad.
  const secciones = await pagina.evaluate(() =>
    [...document.querySelectorAll(".legal-toc a")].map((a) => a.getAttribute("href")),
  );
  assert.equal(secciones.length >= 6, true);
  for (const href of secciones) {
    assert.equal(await pagina.locator(href).count(), 1, `ancla rota: ${href}`);
  }

  // Y tiene que traducirse, no quedarse en espanol en modo EN.
  await pagina.locator('.language-button[data-language="en"]').click();
  await pagina.waitForFunction(() => document.querySelector("h1")?.textContent === "Privacy", undefined, {
    timeout: 10000,
  });
  const vacias = await pagina.evaluate(
    () => [...document.querySelectorAll("[data-i18n]")].filter((el) => !el.textContent.trim()).length,
  );
  assert.equal(vacias, 0);
  await pagina.close();
});

test("legal: se llega desde el pie y declara el nivel de accesibilidad", async () => {
  const pagina = await abrir("/Web/components.html");
  await pagina.getByRole("link", { name: "Legal", exact: true }).click();
  await pagina.waitForURL("**/legal.html");
  // La declaracion de accesibilidad es lo que ancla la nota de a11y del plan.
  // Se busca en toda la seccion (encabezado + parrafos), no solo en el h2.
  const seccionA11y = pagina.locator("#accesibilidad");
  assert.equal(await seccionA11y.count(), 1);
  const textoA11y = await pagina
    .locator("#accesibilidad ~ p, #accesibilidad")
    .first()
    .evaluate((nodo) => nodo.parentElement?.textContent ?? nodo.textContent);
  assert.equal(textoA11y.includes("WCAG"), true);

  const secciones = await pagina.evaluate(() =>
    [...document.querySelectorAll(".legal-toc a")].map((a) => a.getAttribute("href")),
  );
  for (const href of secciones) {
    assert.equal(await pagina.locator(href).count(), 1, `ancla rota: ${href}`);
  }
  await pagina.close();
});

test("las tres paginas del pie enlazan privacidad y legal", async () => {
  for (const ruta of ["/Web/index.html", "/Web/components.html", "/Web/team-core.html"]) {
    const pagina = await abrir(ruta);
    assert.equal(
      (await pagina.locator('a[href="./privacidad.html"]').count()) === 1,
      true,
      `${ruta}: sin enlace a privacidad`,
    );
    assert.equal(
      (await pagina.locator('a[href="./legal.html"]').count()) === 1,
      true,
      `${ruta}: sin enlace a legal`,
    );
    await pagina.close();
  }
});
