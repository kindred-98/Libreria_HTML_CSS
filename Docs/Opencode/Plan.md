# Plan de mejora — Biblioteca HTML & CSS

> Documento vivo. Cada fase que se termina se registra en [`CHANGELOG.md`](../../CHANGELOG.md).
> Última actualización: 2026-09-26. **Fases 0 a 9 completadas.**

## Resultado

| Fase | Tema | Estado |
|---|---|---|
| 0 | Limpieza del repositorio | ✅ |
| 1 | Despliegue en Vercel | ✅ |
| 2 | Bugs y correcciones de código | ✅ |
| 3 | Catálogo ligero (84,5 KB en vez de 733 KB) | ✅ |
| 4 | Previews bajo demanda | ✅ |
| 5 | i18n: 116 descripciones EN + ES | ✅ |
| 6 | ZIP comprimido + investigación de procedencia | ✅ |
| 7 | SEO y pulido | ✅ |
| 8 | Verificación final | ✅ |
| 9 | `CreacionesNuevas/` integrada (116 → 364 demos) | ✅ |
| 10 | Clasificación de componentes y previews en producción | ✅ |

Balancie: la web carga un 89 % menos de catálogo, monta 3 previews en vez de 15,
describe los 364 componentes en dos idiomas y tiene metadatos y tarjeta social.
Los **248 demos propios** tienen descarga ZIP funcionando y verificada; los **116
de terceros** siguen bloqueados porque su repositorio de origen no declara
licencia, y eso es intencionado.


## Contexto

Sitio estático (`Web/`) que indexa 116 demos de `GevendraAutorExterno/`. Sin frameworks,
sin backend, sin `node_modules`. Objetivo: **desplegar en Vercel** con la colección
completa visible y la descarga de código funcionando, sin necesitar base de datos.

### Diagnóstico (revisión del 2026-09-26)

| # | Hallazgo | Severidad |
|---|---|---|
| 1 | `build-site.mjs` copia solo `downloadable === true` → **0 de 116** componentes; el artefacto quedaría vacío y las previews (`../GevendraAutorExterno/…`) darían 404 | 🔴 Bloqueante |
| 2 | No hay `vercel.json` ni instrucciones correctas para Vercel | 🔴 Bloqueante |
| 3 | ZIP deshabilitado en 116/116 componentes | 🔴 Producto |
| 4 | Catálogo: 774 KB `catalog.json` + 733 KB `catalog.js` (~1.5 MB servidos) | 🟠 Rendimiento |
| 5 | ~15 iframes + ~80 peticiones a CDNs en la primera pantalla | 🟠 Rendimiento |
| 6 | `http://` en `flipping-loader/styles.css:9` → mixed content en HTTPS | 🟡 Bug |
| 7 | `.github-pages-file-check/` trackeado; `.gitignore` solo cubre `.github-pages-site*/` | 🟡 Repo |
| 8 | Bugs menores en `app.js` (texto hardcodeado, back link, aviso de publicación) | 🟡 Bug |
| 9 | `build-site.mjs:17` `mkdir` sin `recursive` → EEXIST en el 2º build | 🟡 Bug |
| 10 | Descripciones en español genéricas para 113 de 116 demos | 🟡 i18n |
| 11 | Sin favicon, Open Graph, canonical, sitemap | 🔵 SEO |
| 12 | `Web/README.md` con 3 líneas duplicadas | 🔵 Docs |

---

## Fases

### Fase 0 — Limpieza del repositorio ✅ (2026-09-26)

- [x] Ampliar `.gitignore`: `.github-pages-*`, `.vercel/`, `node_modules/`.
- [x] `git rm -r --cached .github-pages-file-check` (dejar de trackear el artefacto).
- [x] Borrar las carpetas de build locales (`.github-pages-site*`, `-check*`, `-final-check`).
- [x] Verificar `git status` limpio y `git ls-files` sin artefactos.

**Hecho cuando:** `git ls-files | Select-String github-pages` no devuelve nada. ✅

### Fase 1 — Despliegue en Vercel ✅ (2026-09-26)

- [x] Crear `vercel.json`: `framework: null`, `buildCommand: null`, `outputDirectory: "."`
      (despliegue de la raíz del repo, que es lo único que hace funcionar las previews).
- [x] Crear `.vercelignore` (`Docs/`, `.qodo/`, `.github/`, `.vercel/`, `CHANGELOG.md`).
- [x] Redirects: `/` → `/Web/` (307) y `/Web` → `/Web/` (308; sin la barra final las
      rutas relativas `./styles/...` se romperían).
- [x] Cabeceras: `X-Content-Type-Options`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy`.
- [x] Actualizar `README.md` y `Web/README.md`: secciones **Vercel / GitHub Pages / Netlify**
      con la configuración real y aviso de que `build-site.mjs` **no** debe usarse como
      build command hasta verificar licencias.
- [x] Smoke local con servidor estático en la raíz: `/`, `/Web/`, `catalog.js`, `app.js`
      y un demo + su CSS → **200 OK** en todos.

**Hecho cuando:** la raíz se sirve tal cual, `/Web/` carga y las previews resuelven. ✅

### Fase 2 — Bugs y correcciones de código ✅ (2026-09-26)

- [x] `GevendraAutorExterno/Flipping-Loader/styles.css`: eliminada la línea
      `background-image: url("http://…")` (host muerto + mixed content en HTTPS).
      La demo conserva `background-color: #012501`.
- [x] `Web/scripts/app.js`: texto hardcodeado `"No local source file found."` → `t("noLocalSource")`.
- [x] `Web/scripts/app.js` back link: añadido `preventDefault()` y `scrollIntoView`
      (antes el clic empujaba dos entradas de historial y podía volver al detalle).
- [x] `Web/scripts/app.js`: `updatePublicationNotice()` sustituye a
      `hidden = components.length > 0`. Ahora distingue tres estados: catálogo vacío
      (build filtrado), componentes sin verificar (aviso sobre ZIP) y todo verificado
      (sin aviso). Nuevas claves `publicationZipTitle`/`publicationZipText` EN+ES.
- [x] `Web/scripts/build-site.mjs`: `mkdir(..., { recursive: true })` → dos builds
      seguidos sin `EEXIST` (verificado).
- [x] `index.html` raíz: añadido `<meta http-equiv="refresh" content="0; url=./Web/">`
      como fallback sin JS.
- [x] `Web/README.md`: eliminadas las 3 líneas duplicadas del generador de catálogo.
- [x] Regenerado el catálogo: solo cambia el CSS embebido de `Flipping-Loader`.
- [x] Smoke: `node --check` en `app.js` y `zip.js` OK; servidor local → todos 200;
      el catálogo ya no contiene `subtlepatterns`.

**Hecho cuando:** catálogo regenerado sin errores, build dos veces sin EEXIST. ✅

### Fase 3 — Catálogo ligero (rendimiento) ✅ (2026-09-26)

- [x] Medición inicial: `catalog.json` 774 KB + `catalog.js` 733 KB servidos en la
      home. Desglose: código CSS embebido **43 %**, `html` **32 %**, scripts **5 %**,
      `files` **6,5 %**, metadatos **10 %** → el 83 % era código fuente.
- [x] Nuevo módulo compartido `Web/scripts/catalog-format.mjs` con `toIndexEntry`,
      `toSourceEntry`, `writeSources` y `readSource`.
- [x] `generate-catalog.mjs` ahora escribe tres artefactos:
      `catalog.json` (**índice ligero**, sin `html`/`inline*`/`files`/`code`),
      `sources/<id>.json` (pago del detalle, 116 ficheros) y `catalog.js`
      (catálogo completo, solo para `file://`).
- [x] `app.js`: `loadCatalog()` usa `fetch(catalog.json)` en HTTP y solo inyecta
      `catalog.js` en `file://` (o como fallback si el JSON falla);
      `ensureComponentSource()` baja `sources/<id>.json` al abrir un detalle y lo
      cachea en `state.components`.
- [x] `renderDetail` muestra primero cabecera y preview y **después** paga la
      fuente; `downloadComponentZip` también la pide por si acaso.
- [x] `Web/index.html` ya **no** carga `catalog.js` en HTTP; versiones de caché a
      `?v=20260926-3`.
- [x] `build-site.mjs` reensambla el catálogo completo desde `sources/`, filtra y
      limpia los ficheros de fuentes no autorizados.

**Resultado**: home de **84,5 KB** en vez de 733 KB (**−89 %**); el detalle baja
~2,7 KB por componente.

**Hecho cuando:** la home descarga < 100 KB de catálogo y el detalle sigue
mostrando HTML/CSS/JS completos con *Copiar* funcionando. ✅

### Fase 4 — Previews bajo demanda ✅ (2026-09-26)

- [x] No montar el `iframe` al pintar la tarjeta: `IntersectionObserver`
      (`rootMargin: "400px 0px"`) en `createPreview()`; el `src` se guarda en
      `frame.dataset.previewSrc` y solo se asigna al entrar en viewport
      (`mountQueuedPreview()`).
- [x] `refreshQueuedPreviews()` al final de `renderComponents`,
      `renderFeaturedComponents` y `renderDetail`: `disconnect()` + re-observar
      solo los iframes aún en cola (evita retener nodos ya desechados).
- [x] Placeholder con estado `loading` mientras tanto: `armPreviewListeners()`
      registra `load`/`error` **al montar**, no al crear (un iframe sin `src`
      dispara `load` con `about:blank` y marcaba `ready` falso).
- [x] Fallback sin `IntersectionObserver`: `src` directo (comportamiento anterior).
- [x] Iframes concurrentes en la primera pantalla: **3 (< 6)**.

**Hecho cuando:** al abrir la home se montan ≤ 6 iframes y el resto aparece al hacer scroll. ✅

### Fase 5 — i18n: descripciones reales en español ✅ (2026-09-26)

- [x] **Medición previa**: 113 de 116 demos no tenían descripción real; su
      `description` era la genérica auto-generada
      `Standalone <categoría> demo from the component collection.` Solo los 3
      destacados tenían texto, y el español de esos 3 estaba en duro en `app.js`.
- [x] `Web/data/component-overrides.json`: 116 entradas con `description` (EN) y
      `descriptionEs` (ES) redactadas a partir del nombre, la categoría y los
      tags de cada demo; los 3 destacados conservan `name`, `category`, `tags` y
      `featured`.
- [x] `generate-catalog.mjs` propaga `descriptionEs` al índice y a `catalog.js`
      (solo si existe, para no inflar el JSON de los demos sin traducir).
- [x] `app.js`: `getComponentDescription()` pasa a `descriptionEs || description`
      y se eliminan `standaloneDescription` y `featuredDescriptions` de los
      diccionarios EN y ES (ya no existe texto genérico).
- [x] `build-site.mjs` no necesita cambios: `{ ...entry, ...source }` y
      `toIndexEntry` conservan el campo.
- [x] `README.md` y `Web/README.md` documentan `descriptionEs` y la regla de
      reserva (sin traducción → texto original en inglés).

**Resultado**: 0 descripciones genéricas en inglés y 0 textos
«Demo independiente de …» en español, en las 116 entradas.

**Hecho cuando:** en ES ninguna tarjeta muestra "Demo independiente de X de la colección"
salvo los demos aún sin traducir, y esos muestran el texto original en inglés. ✅

### Fase 6 — ZIP: compresión e investigación de procedencia ✅ (2026-09-26)

- [x] `zip.js`: compresión con `CompressionStream("deflate-raw")` y reserva a
      `stored` cuando no hay `CompressionStream` o no compensa. Renombrado
      `createStoredZip` → `createZip` (ahora es `async`); `app.js` lo espera.
- [x] **Bug crítico corregido en `zip.js`**: el registro final (EOCD) escribía la
      longitud del comentario con `setUint32(20, …)` sobre un buffer de 22 bytes →
      `RangeError` garantizado. **Ninguna descarga ZIP había funcionado jamás**
      (no se notó porque los 116 botones están deshabilitados). Ahora `setUint16`.
- [x] Verificación del ZIP con `zipfile` de Python: 39 126 B → 1 199 B (3,1 %),
      `testzip()` sin errores, CRC correctos, método 8 en el texto y método 0 en
      ficheros pequeños/binarios/vacíos.
- [x] **Investigación de procedencia de los 116 demos**: todos proceden de
      `https://github.com/gevendra2004/gevstack` (106 coincidencias exactas de
      carpeta, 8 por erratas del propio repositorio de origen).
- [x] Ese repositorio **no tiene licencia**: `LICENSE` → 404, `"license": null` en
      la API de GitHub y `README.md` sin términos. → **0 demos autorizados**;
      `license` sigue en `Unverified` y `redistributable` en `false` en los 116.
- [x] `component-overrides.json`: `source` documentado en las 116 entradas.
- [x] `app.js`: la nota de procedencia muestra ahora la **fuente identificada**
      aunque el componente no esté verificado (antes solo se mostraba `Source`
      en el caso verificado, que hoy no existe).
- [x] `THIRD_PARTY_NOTICES.md` reescrito con el inventario, la evidencia y las
      erratas de correspondencia.
- [x] Criterio documentado en `THIRD_PARTY_NOTICES.md` (ya lo estaba) y
      verificado: `build-site.mjs` sigue informando `0 cleared component(s)`.

**Resultado**: el ZIP es funcional y ligero; el inventario legal está al 100 %.

**Hecho cuando:** al menos un componente tiene el botón ZIP activo y el ZIP resultante
abre correctamente con su `ATTRIBUTION.txt`. ⚠️ **Criterio de éxito no alcanzable
por diseño**: sin licencia del autor no hay ningún componente que pueda marcarse
como redistribuible. Se sustituye por «el ZIP funciona verificado» +
«procedencia documentada al 100 %». El camino para desbloquearlo es pedir
autorización escrita a Gevendra Sahu.

### Fase 7 — SEO y pulido ✅ (2026-09-26)

- [x] `Web/favicon.svg`: icono SVG propio (`</>` en `--accent` y barra en
      `--coral` sobre `--page`), reutilizado también como `apple-touch-icon`.
- [x] `Web/og-image.png`: tarjeta social de **1200×630** generada con Chrome
      headless a partir de la paleta del sitio (75 KB).
- [x] Open Graph completo: `og:type`, `og:site_name`, `og:title`,
      `og:description`, `og:url`, `og:image`, `og:locale` y `og:locale:alternate`.
- [x] Twitter Card `summary_large_image` con `twitter:title`,
      `twitter:description` y `twitter:image`.
- [x] `canonical` a `https://libreria-html-css.vercel.app/Web/` + `robots`
      (`index, follow` en la home).
- [x] `Web/robots.txt`: permite `/Web/`, bloquea `/Web/?component=` y el
      artefacto de Pages, y declara el sitemap.
- [x] `Web/sitemap.xml`: **solo la home**. Las vistas de detalle son
      `?component=`, que no son URLs indexables; incluirlas sería inventar
      páginas que no existen.
- [x] `color-scheme: dark light` para que los controles nativos respeten el tema.
- [x] Metadatos por detalle en `app.js`: `updateDocumentMetadata()` actualiza
      `title`, `description`, `og:*`, `twitter:*` y `canonical` al abrir un
      componente, y los restaura al volver. El detalle queda en
      `noindex, follow`, coherente con `robots.txt`.
- [x] Metadatos traducidos: `updateLocalizedMetadata()` los regenera al cambiar
      de idioma (antes solo cambiaba `meta[name=description]`).
- [x] Caché de assets subida a `?v=20260926-4`.

**Resultado:** la home es indexable con tarjeta social; los detalles informan
correctamente al compartir y no compiten en el índice.

**Hecho cuando:** las URLs principales pasan la auditoría básica de metadatos. ✅

### Fase 8 — Verificación final ✅ (2026-09-26)

- [x] Servidor estático local + smoke de **24 comprobaciones** vía Chrome headless
      (CDP): home, búsqueda (con y sin resultados), filtro por categoría,
      «cargar más», detalle, copiar, volver, tema, idioma y previews.
      **24/24 superadas y 0 errores de consola o de red.**
- [x] **Previews de los 116 componentes revisados uno a uno**:
      **116/116 con la preview `ready`**, 0 en `error`, 0 referencias locales
      ausentes y 0 peticiones externas fallidas (Google Fonts, cdnjs, jsDelivr,
      unpkg, pexels, unsplash, etc.).
- [x] Mejora detectada durante el smoke: «Copiar» solo usaba
      `navigator.clipboard`, que **falla también cuando el permiso se deniega**
      (no solo cuando la API no existe). Añadido respaldo con `execCommand`
      y `textarea` temporal para contextos no seguros.
- [x] `node --check` en los 5 scripts → 0. `generate-catalog.mjs` → 116 + 116.
- [x] `build-site.mjs` dos veces seguidas → exit 0 y `0 cleared component(s)`
      (regresión del `EEXIST` sigue corregida).
- [x] `git status`: solo los cambios de las fases 4-8 pendientes de commitear
      (no se hace commit sin petición). `git ls-files` sin rutas `github-pages*`.
- [x] README y `Web/README.md` al día: estructura real (incluye `sources/`,
      `catalog.js`, `catalog-format.mjs` y los ficheros SEO), generación en tres
      artefactos, campo `descriptionEs` y **procedencia ya investigada** (los 116
      vienen de `gevendra2004/gevstack`, sin licencia).

**Hecho cuando:** servidor local + smoke home, búsqueda, filtros, detalle,
copiar, tema, idioma y «volver» → ✅. Previews con CDNs anotadas → ninguna
falla ✅. `git status` sin artefactos ✅. README sin contradicciones ✅.

> ℹ️ Este pendiente se resolvió en la **Fase 9**: `CreacionesNuevas/` ya está
> integrada en el catálogo, que pasa de 116 a **364** componentes, y 248 de ellos
> quedan autorizados para descarga ZIP con licencia MIT.

---

### Fase 10 — Clasificación y previews en producción ✅ (2026-09-27)

- [x] **Previews rotas en el despliegue.** 93 de las 114 carpetas de
      `GevendraAutorExterno/` tenían distinta capitalización en git que en disco.
      El catálogo usa la ruta del disco, así que en Linux/Vercel la preview no
      encontraba el archivo. `core.ignorecase=false` + 93 renombrados en el índice.
- [x] **Barras de scroll** dentro de las previews: `scrolling="no"` en los iframes.
- [x] `getCategory()` reescrito como tabla ordenada con nueve categorías
      (antes: 8 regex en cadena con `Animations` al final).
- [x] **114 categorías explícitas** en `component-overrides.json` para lo que el
      heurístico no decide por nombre.

**Resultado:** «Other» pasa de **136 a 40** componentes y «Animations» de **14 a 68**.

**Hecho cuando:** ninguna categoría concentra una proporción anómala y las
previews se ven igual en local que en producción. ✅

### Fase 9 — `CreacionesNuevas/` integrada ✅ (2026-09-26)

- [x] `generate-catalog.mjs` recorre **varias raíces**
      (`GevendraAutorExterno` y `CreacionesNuevas`) en vez de una sola, y cada
      componente incluye un campo `root` con la carpeta de la que procede.
- [x] Las comprobaciones de referencias locales (`getLocalReferences` y
      `getMissingReferences`) usan **la raíz del propio componente**, no una
      constante global: si no, las hojas de estilo y scripts de los demos
      nuevos se habrían descartado por estar fuera de `GevendraAutorExterno/`.
- [x] `build-site.mjs` localiza y copia cada demo desde `component.root` y falla
      con un error claro si la raíz no existe. El artefacto conserva el nombre de
      la raíz para que las previews sigan resolviendo.
- [x] **0 colisiones de ID** entre las dos colecciones (116 + 248 = **364** IDs
      únicos), comprobado antes de tocar nada.
- [x] `LICENSE` MIT en las **248 carpetas** de `CreacionesNuevas/`, y la
      `LICENSE` raíz ampliada para cubrirlas.
- [x] **496 descripciones nuevas** (248 EN + 248 ES) redactadas a partir del
      `<title>` de cada demo, con el mismo criterio que en la Fase 5.
- [x] Las 248 entradas de `component-overrides.json` con `description`,
      `descriptionEs`, `source`, `license: "MIT"`, `licenseFile: "LICENSE"` y
      `redistributable: true`.
- [x] README, `Web/README.md`, `THIRD_PARTY_NOTICES.md` y este plan actualizados
      a 364 componentes y a las dos situaciones de licencia.

**Resultado:** de 116 a **364 componentes**, y por primera vez **248 descargas
ZIP habilitadas y verificadas** (CRC correctos, `LICENSE` y `ATTRIBUTION.txt`
dentro del archivo).

**Hecho cuando:** los demos de `CreacionesNuevas/` aparecen en la web con su
descripción en ambos idiomas y su botón ZIP descarga un archivo válido. ✅

## Fuera de alcance (por ahora)

- **Base de datos / backend:** no hace falta. Solo se requeriría con cuentas de usuario,
  favoritos en servidor, envío de componentes desde la UI o analytics propios.
- Frameworks, bundlers, `node_modules`.
- Reescribir los demos originales (se mantienen intactos).

## Criterios transversales

1. La app sigue sin dependencias de compilación: `node` solo para scripts puntuales.
2. Cada fase termina con: regenerar catálogo → smoke local → entrada en `CHANGELOG.md`.
3. No se marca ningún demo como `redistributable` sin licencia verificada y archivo
   `LICENSE` presente en su carpeta.
4. No se hace `git commit` salvo petición explícita.
